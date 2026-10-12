# Nexora — Staff Schedule & Booking Availability

Bộ tài liệu bàn giao phát triển, phiên bản **0.1 / 09-10-2026**. Nguồn phân tích: `staff-schedule-booking-prototype (1).html` do người dùng cung cấp. Tài liệu này mô tả sản phẩm cần xây và đề xuất hợp đồng kỹ thuật; HTML hiện tại chỉ là prototype tĩnh, không phải mã chức năng hay nguồn dữ liệu chuẩn.

## Đọc theo thứ tự

| File | Mục đích |
|---|---|
| [01-product-scope.md](01-product-scope.md) | Mục tiêu, phạm vi, vai trò, yêu cầu và thứ tự ưu tiên |
| [02-functional-spec.md](02-functional-spec.md) | Luồng màn hình, quyền thao tác, quy tắc nghiệp vụ, trạng thái và ngoại lệ |
| [03-data-and-api.md](03-data-and-api.md) | Mô hình dữ liệu, ràng buộc, API đề xuất và sự kiện đồng bộ |
| [04-availability-engine.md](04-availability-engine.md) | Cách tính nhân viên và slot có thể đặt, xung đột và tính nhất quán |
| [05-qa-acceptance.md](05-qa-acceptance.md) | Tiêu chí nghiệm thu, test cases, test dữ liệu và kiểm tra phi chức năng |
| [06-delivery-and-decisions.md](06-delivery-and-decisions.md) | Work breakdown, thứ tự triển khai, quyết định cần chốt và rủi ro |
| [07-prototype-audit.md](07-prototype-audit.md) | Bằng chứng từ prototype, điểm chưa rõ và các dữ liệu không nên hardcode |

## Quy ước nguồn gốc

- **[P] Prototype**: yêu cầu hoặc ý định được thể hiện trong HTML; chưa có xác nhận về hành vi production.
- **[D] Đề xuất**: quyết định kỹ thuật/nghiệp vụ để dev có thể ước lượng và xây dựng; cần product owner duyệt trước khi coi là hợp đồng cuối.
- **[Q] Cần chốt**: prototype chưa đủ căn cứ hoặc có mâu thuẫn.
- **MUST / SHOULD / MAY**: bắt buộc / nên có / tùy chọn trong phạm vi đã duyệt.

Các ví dụ API là **contract đề xuất**, không ngụ ý hệ thống Nexora hiện có những endpoint này. Dùng định danh ổn định (`staffId`, `serviceId`) thay vì tên hiển thị. Mọi thời điểm lưu theo UTC; ngày và giờ làm việc được diễn giải theo múi giờ IANA của salon.

## Phạm vi phát hành đề nghị

- **MVP (P0):** hồ sơ và service eligibility của nhân viên; lịch tuần; ngoại lệ ngày; quyền app; yêu cầu thay đổi và phê duyệt; tính slot và đặt chỗ an toàn; staff calendar; audit.
- **P1:** tổng quan đội ngũ, ngưỡng coverage theo skill và cảnh báo khi duyệt nghỉ.
- **P2:** đề xuất tối ưu coverage và tín hiệu cho Promotion Hub. Prototype có ý tưởng này nhưng chưa nêu thuật toán, quyền tích hợp hay tiêu chí vận hành.

## Nguyên tắc quyết định

Không tự động hủy hoặc chuyển lịch hẹn đã xác nhận khi lịch làm việc thay đổi. Xử lý xung đột bằng cảnh báo và quy trình quản lý rõ ràng. Slot hiển thị chỉ là dự báo; lúc tạo booking phải kiểm tra lại trong giao dịch để tránh đặt trùng.
