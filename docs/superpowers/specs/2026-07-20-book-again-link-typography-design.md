# Thiết kế typography cho nút “Book again”

## Mục tiêu

Làm nút “Book again” trong thẻ “Upcoming booking” gọn và dễ nhận biết là liên kết, không thay đổi luồng đặt lịch.

## Phạm vi

- Chỉ chỉnh nút `Book again` / `Đặt lại lịch` trong thẻ lịch hẹn sắp tới ở màn hình Home.
- Giảm cỡ chữ xuống 12px (`text-xs`).
- Thêm gạch chân với khoảng cách nhẹ (`underline underline-offset-4`).
- Giữ vùng bấm cao tối thiểu 44px để nút vẫn dễ thao tác.
- Giữ nguyên nội dung song ngữ, hành động điều hướng tới `book1`, nhãn “Upcoming booking” và các nút khác.

## Kiểm thử

Thêm kiểm thử cấu trúc xác nhận đúng nút `Book again` trong thẻ lịch hẹn có cỡ chữ nhỏ, gạch chân và vùng bấm tối thiểu. Chạy kiểm thử riêng ở bước RED/GREEN, sau đó chạy toàn bộ bộ test của trang customer reward.
