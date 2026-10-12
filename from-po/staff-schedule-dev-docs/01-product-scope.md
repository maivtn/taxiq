# 01 — Product scope & requirements

## 1. Mục tiêu

Owner/Manager quản lý ngày, giờ làm việc và tay nghề của từng nhân viên; hệ thống chỉ cho khách đặt dịch vụ với nhân viên đủ điều kiện trong khoảng trống thực sự. Nhân viên xem lịch, điều chỉnh trạng thái hoặc gửi yêu cầu theo quyền được cấp. Mọi thay đổi tác động đến booking được đồng bộ và có lịch sử. [P]

**Chỉ số thành công đề xuất [D]:** không có booking mới ngoài giờ/không đủ tay nghề; không có hai booking trùng tài nguyên; thay đổi lịch được phản ánh trong kết quả availability trong thời hạn đã thống nhất; mọi xung đột với booking cũ đều hiện cho manager; staff thấy đúng lịch mới sau khi đồng bộ.

## 2. Vai trò

| Vai trò | Quyền cốt lõi đề xuất |
|---|---|
| Owner | Cấu hình toàn salon, quyền app, chính sách, lịch, skill, phê duyệt, xử lý xung đột, xem audit |
| Manager | Quản lý lịch/skill nhân viên, phê duyệt yêu cầu, xử lý xung đột; không thay đổi quyền Owner nếu chưa được cấp |
| Technician | Xem lịch và booking của mình; bật/tắt trong ngày hoặc gửi yêu cầu theo policy; không chỉnh lịch người khác |
| Front desk | Xem lịch và slot; tạo/chỉnh booking theo quyền booking hiện có; không mặc nhiên được đổi policy |
| Customer | Chỉ xem và đặt các lựa chọn hợp lệ trên booking page |

Phân quyền chi tiết giữa Owner, Manager và Front desk là [Q]. UI có POS role nhưng chưa xác định ma trận quyền backend.

## 3. Phạm vi tính năng

| ID | Mức | Yêu cầu |
|---|---|---|
| FR-01 | P0 | Add Staff lưu hồ sơ, POS role, level, danh sách service được phép thực hiện, lịch tuần và quyền app trong một luồng nhất quán. [P] |
| FR-02 | P0 | Chỉnh lịch tuần theo nhân viên, ngày trong tuần, ca làm; ngày off không phát sinh slot. [P] |
| FR-03 | P0 | Hỗ trợ ngoại lệ theo ngày: nghỉ, đổi giờ, break; có trạng thái chờ/duyệt/từ chối khi cần. [P] |
| FR-04 | P0 | Chính sách same-day toggle: allowed / request approval / not allowed; chính sách thay đổi tương lai và booking protection. [P] |
| FR-05 | P0 | Staff app có Available today, Today's bookings, My Calendar với Appointments / Work Schedule / Requests và quick actions. [P] |
| FR-06 | P0 | Booking page chỉ hiển thị nhân viên và slot qua các kiểm tra: giờ salon, lịch nhân viên, skill/service, override, break, buffer, booking cũ, holiday. [P] |
| FR-07 | P0 | Khi manager lưu/duyệt, availability và staff app nhận dữ liệu mới; booking cũ được giữ hoặc đưa vào hàng xử lý. [P] |
| FR-08 | P0 | Ghi audit ai thay đổi gì và khi nào. [P] |
| FR-09 | P0 | Khi khách xác nhận, kiểm tra lại slot theo trạng thái mới nhất và chặn double booking. [D] |
| FR-10 | P1 | Team overview theo tuần và skill; cảnh báo thiếu người, nhiều người nghỉ; cấu hình minimum coverage. [P] |
| FR-11 | P1 | Khi duyệt nghỉ hoặc sửa ca, tính lại coverage và nêu tác động trước khi lưu. [P/D] |
| FR-12 | P2 | Gợi ý điều chỉnh coverage và kết nối tín hiệu promotion/ad spend. [P] |

## 4. Ngoài phạm vi của bộ này

- POS/payroll/chấm công, tip và hoa hồng.
- Tự động reassign hoặc hủy booking cũ, trừ khi có luồng riêng được phê duyệt.
- Chiến dịch quảng cáo thật và tối ưu chi tiêu tự động ở MVP.
- Thuật toán AI tối ưu ca làm. Prototype chỉ nêu gợi ý minh họa.

## 5. Mốc nghiệp vụ

1. Manager tạo/sửa nhân viên và lịch. 2. Backend kiểm tra hợp lệ, lưu phiên bản và ghi audit. 3. Availability được tính lại từ dữ liệu chuẩn. 4. Staff app nhận lịch mới. 5. Booking page chỉ cho chọn slot hợp lệ. 6. Khi khách xác nhận, backend kiểm tra lại và tạo booking nguyên tử. 7. Thay đổi ảnh hưởng booking đã xác nhận tạo conflict cho manager xử lý.

## 6. Yêu cầu phi chức năng đề xuất [D]

- **Consistency:** tạo booking phải kiểm tra xung đột trong transaction/lock; không tin vào slot cache.
- **Latency:** API đọc availability p95 ≤ 500 ms cho một service/ngày trong tải mục tiêu đã đo; cập nhật hiển thị sau thay đổi ≤ 5 giây là mục tiêu ban đầu cần xác nhận.
- **Privacy:** customer chỉ thấy tên/ảnh công khai của staff, không thấy lý do nghỉ, số điện thoại cá nhân hoặc booking của người khác. Staff chỉ thấy dữ liệu booking theo quyền.
- **Audit:** ghi actor, salon, entity, before/after, thời gian, request/correlation ID; giới hạn quyền truy cập.
- **Accessibility:** form có label, trạng thái không chỉ dựa màu, điều khiển được bằng bàn phím/screen reader.
- **Observability:** đo thời gian tính slot, lỗi sync, số conflict, số booking bị từ chối do stale slot; cảnh báo khi event xử lý lỗi.

## 7. Phụ thuộc

Phải xác định hệ thống nguồn cho business hours, holiday/closure, service catalog (duration/buffer), booking status, staff identity và notification. Nếu các phần này chưa tồn tại, cần bổ sung vào kế hoạch và ước lượng riêng. [Q]
