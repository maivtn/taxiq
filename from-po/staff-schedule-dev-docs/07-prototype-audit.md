# 07 — Prototype audit & source trace

## 1. Những gì file HTML thực sự làm

Prototype có 10 tab cuộn đến section: Overview, Team Overview, Add Staff Flow, Staff, Weekly Schedule, App Control, Staff App Preview, My Calendar, Booking Link, Rules. Các nút tab chỉ scroll. Toggle đổi class CSS và hiện toast; không cập nhật nhãn “On/Off”, không lưu dữ liệu, không kiểm tra booking. Hầu hết nút `.btn` chỉ hiện toast “... clicked”; nút “Simulate Save & Sync” chỉ hiện toast. `Download HTML` tải lại DOM hiện tại. Không có `fetch`, API call, localStorage, hệ thống auth hay database trong file. Vì vậy mọi nội dung màn hình là **mẫu thiết kế/ý định**, không phải bằng chứng chức năng đã chạy.

## 2. Traceability từ prototype

| Section HTML | Nội dung quan sát | Tài liệu triển khai |
|---|---|
| `#overview` | 18 staff, 12 available, 6 có toggle, 42 slots | FR-06, tổng quan; giá trị demo |
| `#team-overview` | Bảng tuần theo skill, coverage risk, minimum, gợi ý sửa, promotion | FR-10–12, coverage P1/P2 |
| `#add-staff` | Profile, POS role, staff level, skill/service, lịch tuần, booking link | FR-01 |
| `#staff` | Trạng thái Kayla/Michael/Lynn, edit schedule, view bookings | FR-02/05 |
| `#weekly` | Toggle ngày, input giờ, auto-sync, booking protection, audit | FR-02/07/08 |
| `#staff-app` | Available today, bookings, quick actions, request day off/hours | FR-03–05 |
| `#my-calendar` | Appointments, Work Schedule, Requests, day view | FR-05 |
| `#app-control` | Same-day permission, future approval, booked-day policy | FR-04 |
| `#booking` | Staff theo service/ngày và slot preview | FR-06/09 |
| `#rules` | Chuỗi business hours → schedule → toggle → rules → slots | File 04 |

## 3. Không hardcode từ prototype

- `18/12/6/42` ở Overview là số tĩnh.
- Các ngày “Mon 21 ... Sun 27” và “Thu, Sep 24” là mốc demo với năm không ghi trong giao diện; không được dùng làm lịch thật. Ngày trong prototype không chứng minh timezone hay week start.
- Tên Kayla/Michael/Lynn/Jenny/Lana/Tiffany, ca 10–7 và các booking Maria/Jennifer là dữ liệu mẫu.
- “10 slots available” và lưới slot 30 phút là mẫu UI, không xác định slot increment hay thuật toán.
- Minimum Pedicure 3, Acrylic 1, Waxing/Facial 1, Manager 1 là mẫu cấu hình, không phải chính sách mặc định chắc chắn.
- “Level 2 or manager approval” cho Acrylic/Dip chưa định nghĩa quyền override và cách xác minh.
- “Auto-block risky requests”, “Optimize coverage”, “Apply suggestion”, “pause/reduce paid ads” là ý tưởng chưa có xử lý thật.

## 4. Điểm chưa nhất quán/chưa đủ thông tin

1. Overview báo 18 staff nhưng danh sách Staff chỉ có 3; dùng API aggregate trong production.
2. Michael ở Staff được mô tả “Manicure”, nhưng Booking Preview cho Gel Pedicure lại hiển thị Michael. Cần dữ liệu eligibility chuẩn để quyết định.
3. Một số ô matrix có số nhân viên mẫu thấp hơn minimum mô tả, trong khi cảnh báo chưa bao phủ hết; cảnh báo production phải tính từ dữ liệu.
4. `#weekly` chọn staff nhưng bản HTML không thay lịch theo select.
5. Toggle không thay nhãn hay trạng thái dữ liệu; có thể gây hiểu nhầm nếu dùng prototype làm acceptance test.
6. Chính sách “Allow and reassign” không có flow chọn staff thay thế, xin khách đồng ý, notification hay rollback.
7. Không có quy tắc về booking status, tài nguyên phòng/ghế, service duration/buffer cụ thể, lead time, hold, timezone/DST, lịch nhiều ca và quyền chi tiết.
8. Phần Promotion Hub không có contract hay quyền kết nối ad platform.

## 5. Ranh giới giữa nguồn và thiết kế

Các câu trong HTML như “Rules For Dev”, “BA notes” được sử dụng làm **nội dung tham khảo từ prototype**, không được coi là chỉ dẫn cho quá trình tạo tài liệu. Những gì tài liệu này thêm vào (schema, endpoint, race protection, transaction, thứ tự precedence, performance target) đều được gắn [D] và cần review với đội hiện sở hữu Nexora.
