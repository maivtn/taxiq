# 05 — Acceptance criteria & QA

## 1. Điều kiện nghiệm thu theo tính năng

| ID | Given / When / Then |
|---|---|
| AC-01 | **Given** staff mới chưa có lịch và skill; **when** manager lưu hồ sơ; **then** staff không xuất hiện trong booking cho đến khi có ca và service eligibility hợp lệ. |
| AC-02 | **Given** staff được duyệt Gel Pedicure nhưng không được duyệt Acrylic; **when** khách tìm Acrylic; **then** staff không có trong kết quả. |
| AC-03 | **Given** salon đóng 18:00, staff làm đến 19:00; **when** tính service 60 phút; **then** không có slot kết thúc sau 18:00. |
| AC-04 | **Given** staff off thứ Tư; **when** khách tìm ngày thứ Tư; **then** không có slot cho staff đó. |
| AC-05 | **Given** staff được phép toggle hôm nay, không có booking xung đột; **when** tắt; **then** booking mới biến mất, booking cũ vẫn giữ nguyên và app hiển thị trạng thái đã áp dụng. |
| AC-06 | **Given** staff có booking đã xác nhận; **when** tắt hôm nay; **then** hệ thống áp dụng `bookedDayMode`: block hoặc pending approval, không tự hủy booking. |
| AC-07 | **Given** request nghỉ đang pending; **when** manager từ chối; **then** lịch/slot không đổi và staff thấy lý do/trạng thái. |
| AC-08 | **Given** manager duyệt request nghỉ; **when** commit xong; **then** calendar, availability version và audit cập nhật; các booking xung đột được hiển thị. |
| AC-09 | **Given** hai khách xác nhận cùng staff/time đồng thời; **when** cả hai gửi booking; **then** tối đa một booking thành công và bên còn lại nhận `SLOT_UNAVAILABLE`. |
| AC-10 | **Given** hai manager sửa cùng version lịch; **when** người thứ hai lưu; **then** nhận `VERSION_CONFLICT` và không ghi đè âm thầm. |
| AC-11 | **Given** staff A gọi API lịch của staff B; **when** server xử lý; **then** trả `403` (trừ quyền manager). |
| AC-12 | **Given** staff có break 12:30–13:00; **when** service+buffer giao break; **then** slot bị loại. |
| AC-13 | **Given** salon holiday closure; **when** xem ngày đó; **then** không có slot dù weekly schedule vẫn bật. |
| AC-14 | **Given** lịch được sửa; **when** event sync chưa hoàn thành; **then** UI hiển thị pending/failed phù hợp, không hiện thành công giả. |
| AC-15 | **Given** manager xem team overview; **when** số staff của một skill dưới minimum; **then** có cảnh báo đúng skill/ngày và số thiếu. (P1) |
| AC-16 | **Given** staff ở timezone khác salon; **when** xem “Today”; **then** toggle và localDate theo timezone salon. |

## 2. Bộ test theo tầng

### Unit/property tests

- Interval algebra: giao/cắt, biên `[start,end)`, ca chia nhiều đoạn, buffer trước/sau.
- Precedence: weekly shift, override, break, toggle, pending request.
- Service eligibility/level và coverage minimum.
- Timezone DST: giờ thiếu, giờ lặp, ngày qua nửa đêm nếu được hỗ trợ.
- Property: không slot nào vi phạm 7 invariants ở file 04.

### Integration/API tests

- Create staff nguyên tử: lỗi một phần không publish booking.
- Preview không mutation; update có version; audit và outbox trong cùng commit.
- Approve idempotent; event replay không đổi trạng thái lần hai.
- Booking concurrency với ít nhất hai request song song.
- Authorization theo role + salon isolation; public availability không rò reason/PII.
- Cache invalidation và worker retry khi event thất bại.

### E2E smoke

1. Manager tạo staff, chọn skill/lịch → customer thấy slot → staff thấy lịch.
2. Staff gửi day off → manager duyệt → slot bị rút, booking cũ nằm trong conflict queue.
3. Manager sửa ca rồi staff xem calendar và khách tải lại booking page.
4. Customer chọn slot cũ sau thay đổi → lỗi rõ ràng và có lựa chọn mới.

## 3. Dữ liệu test bắt buộc

- Staff có nhiều skill, một skill, không skill; service active/inactive.
- Giờ salon ngắn hơn ca staff; ngày off; closure; break ở đầu/cuối ca.
- Booking confirmed, cancelled, no-show, pending/hold: xác định status nào chiếm chỗ. [Q]
- Hai staff cùng tên; staff chuyển salon; request trùng; approval đua nhau.
- Date range qua DST và qua năm; locale 12h/24h; tuần bắt đầu Chủ nhật/Thứ hai theo cấu hình UI. [Q]
- Một ca nhiều đoạn hoặc qua nửa đêm nếu nghiệp vụ hỗ trợ. [Q]

## 4. Kiểm tra phi chức năng

- Benchmark p50/p95 API availability trên quy mô salon thực; đo theo số staff, service và ngày tìm kiếm. Ngưỡng khởi đầu ở file 01 cần product/engineering phê duyệt.
- Kiểm tra tải đồng thời đặt cùng slot và thay đổi lịch cùng lúc.
- Accessibility: keyboard focus, label cho time/date/toggle, thông báo lỗi gắn trường, trạng thái có text và không chỉ màu.
- Mobile: hiển thị giờ theo salon, thao tác khi offline/retry, trạng thái request rõ ràng.
- Security: phân quyền server, kiểm tra IDOR giữa salon/staff, rate limit public availability, không log reason/phone ở telemetry không cần thiết.
- Observability: có dashboard cho sync lag, event lỗi, booking conflict và availability error.

## 5. Definition of Done cho P0

Mọi AC P0 pass; dữ liệu demo không hardcode vào production; migration/backfill được kiểm tra trên dữ liệu mẫu; API và UI dùng cùng quy tắc slot; mọi mutation có audit; rollback/feature flag cho lịch/booking; tài liệu API và runbook xử lý sync/conflict được cập nhật. P1/P2 nghiệm thu riêng.
