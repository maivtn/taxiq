# 04 — Availability engine

## 1. Định nghĩa

Slot là thời điểm bắt đầu mà **toàn bộ** thời lượng service + buffer nằm trong giờ salon và ca làm hiệu lực của một staff, không giao với closure, break, booking/hold đang chiếm chỗ. Eligibility theo service là điều kiện bắt buộc. Đây là một hàm có thể tính lại từ dữ liệu chuẩn, không phải cờ `available=true` lưu riêng. [P/D]

```text
Bookable(staff, service, start) =
  staff.active
  AND service.active
  AND staff.eligibleFor(service)
  AND interval(start - bufferBefore, start + duration + bufferAfter)
      nằm trong salonOpen ∩ effectiveStaffShift
  AND interval không giao closure, approvedAbsence, break,
      occupiedBooking, activeHold
  AND sameDayToggle không tắt booking mới
  AND các constraint booking khác của salon đều đạt
```

`interval` dùng mốc UTC sau khi chuyển đổi từ ngày/giờ địa phương. Slot increment (ví dụ 15/30 phút), lead time, booking horizon, capacity của phòng/ghế, service combination và staff preference chưa có trong prototype; lấy từ booking engine hiện có hoặc chốt trong [Q]. **Không hardcode 30 phút** chỉ vì preview vẽ các nút 10:00, 10:30.

## 2. Thứ tự hợp thành lịch [D]

1. Salon business hours và closure/holiday là biên ngoài.
2. Weekly shift có hiệu lực theo ngày địa phương tạo lịch nền.
3. Approved date override (`OFF`/`HOURS`) thay lịch nền của ngày đó; break trừ khoảng cụ thể.
4. Same-day toggle `OFF` ngăn booking mới cho phần còn lại của ngày, theo thời điểm hiệu lực; toggle `ON` chỉ khôi phục trong giới hạn lịch nền/override. Toggle không tạo ca mới.
5. Pending request **không** tác động availability đến khi được duyệt, trừ policy cho phép áp dụng tức thời.
6. Existing booking/hold và buffer trừ các khoảng đã chiếm chỗ.

Nếu một manager sửa ca và staff cùng toggle một lúc, version + transaction xác định thứ tự; re-evaluate sau mỗi commit. Chỗ nào conflict không tự ghi đè; trả trạng thái cần xử lý.

## 3. Thuật toán tham chiếu

```text
function getSlots(salon, service, localDate, optionalStaffId):
  validate date, salon, service, horizon
  openIntervals = businessHours(localDate) - salonClosures(localDate)
  candidates = activeStaffEligibleFor(service, optionalStaffId)
  for staff in candidates:
    shifts = effectiveShift(staff, localDate) ∩ openIntervals
    free = shifts - approvedOff - breaks - sameDayOff
    occupied = confirmedBookings + applicableHolds, expanded by service buffers
    free = free - occupied
    starts = bookingGrid(localDate).filter(each full service interval fits in free)
    emit only starts that satisfy leadTime, capacity, other booking rules
  return candidates with at least one start, sorted by booking UX rules
```

Thực tế cần kiểm tra buffer của cả booking cũ và booking mới theo contract booking hiện hành. Nếu service dùng tài nguyên khác (phòng, ghế) phải kiểm tra chúng cùng transaction. Nếu một ngày có DST đổi giờ, giờ địa phương không tồn tại phải bỏ qua; giờ lặp lại cần định danh bằng UTC offset và chỉ trả các mốc UTC riêng biệt.

## 4. Bảo vệ booking cũ

- Trước khi áp dụng schedule/override, dry run tìm booking active giao khoảng sắp đóng hoặc nằm ngoài ca mới.
- Nếu policy là `BLOCK`, trả danh sách/tổng conflict cho manager và từ chối mutation.
- Nếu policy là `REQUIRE_REVIEW`, giữ booking active, lưu thay đổi lịch theo quyết định đã chốt và tạo `AvailabilityConflict`; booking đó vẫn hiện trong staff calendar để được xử lý. [Q: thời điểm áp dụng lịch trước hay sau khi xử lý conflict]
- `REASSIGN` cần workflow riêng: kiểm tra staff thay thế, yêu cầu khách/manager nếu cần, transaction thay đổi booking và notification. Không triển khai chỉ từ nút demo.
- Booking cũ không tự biến mất khỏi hệ thống khi staff off; trạng thái conflict phải được hiển thị cho manager.

## 5. Tính nhất quán và race condition

Availability read có thể cache theo `(salon, service, date, staff, availabilityVersion)`; sau thay đổi, tăng version và invalidate. `POST /bookings` **luôn** revalidate trong transaction, dùng locking/exclusion constraint hoặc cơ chế đặt chỗ nguyên tử của hệ thống booking. `Idempotency-Key` tránh tạo hai booking khi khách retry. Chỉ gửi confirmation sau commit. Nếu slot không còn, trả `409` và slots mới. Hệ thống không được dựa vào `availabilityVersion` ở browser để bỏ qua kiểm tra này.

## 6. Ví dụ tính toán

Salon mở 09:00–20:00. Kayla làm 10:00–19:00, đủ điều kiện Gel Pedicure 60 phút, buffer sau 10 phút, có break 12:30–13:00 và booking 15:00–16:00. Nếu grid 30 phút, các start 12:00 và 14:30 không hợp lệ vì toàn bộ service+buffer giao break/booking; 18:00 hợp lệ nếu kết thúc 19:10 **không** vượt ca, tức trong ví dụ này 18:00 **không hợp lệ**. Start cuối phù hợp trên grid là 17:30 (kết thúc 18:40), nếu không có constraint khác. Đây là ví dụ minh họa [D], không phải dữ liệu prototype.

## 7. Coverage engine [P1]

Với skill `s`, ngày `d`, đếm staff active có eligibility skill, có tổng thời gian làm việc hợp lệ ≥ `minMinutes`, loại off/closure. `gap = max(0, minimum(s,d) - count(s,d))`. Khi request nghỉ được duyệt, tính lại preview; nếu gap > 0, cảnh báo hoặc chặn theo policy salon. “Too many off” phải có ngưỡng cấu hình, không dựa trên số 3 trong mock. Coverage theo ngày không đồng nghĩa còn slot cho service dài; Promotion Hub cần capacity thực tế, không chỉ headcount.

## 8. Invariants cần tự động kiểm chứng

1. Mọi slot trả ra có staff đúng salon, active và đủ service.
2. Toàn bộ khoảng service + buffer nằm trong giờ salon và lịch hiệu lực.
3. Không slot nào giao break, closure, booking/hold chiếm chỗ.
4. Pending request không làm đổi slot khi chưa được duyệt.
5. Approve/reject một request chỉ có hiệu lực một lần.
6. Booking mới không thể trùng tài nguyên dù hai client xác nhận cùng lúc.
7. Một thay đổi lịch không tự hủy booking đã xác nhận.
