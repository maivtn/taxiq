# Thiết kế ba action mô phỏng trên màn hình Scan

## Mục tiêu

Thêm ba shortcut **Check-in**, **Payment** và **Tip** ngay dưới nút “Nhập mã” trong màn hình Scan của `html/customer/cutomer-reward.html`. Các shortcut giúp người xem đi thẳng vào từng luồng demo mà không cần hoàn thành bước quét QR.

## Giao diện

- Giữ nguyên khung camera, dropdown QR salon, nút “Quét QR salon” và nút “Nhập mã”.
- Thêm nhãn section song ngữ `SIMULATE` / `MÔ PHỎNG` ngay bên dưới.
- Hiển thị ba action card theo thứ tự Check-in, Payment, Tip.
- Mỗi action có Lucide icon, nhãn song ngữ và vùng chạm tối thiểu 44px.
- Dùng màu hiện có: cyan cho Check-in, tím-hồng cho Payment và xanh lá cho Tip.
- Giữ ba cột trên mobile; nội dung ngắn và icon nằm phía trên nhãn để vừa chiều rộng màn hình nhỏ.

## Hành vi

Ba action dùng kịch bản cố định, không phụ thuộc lựa chọn trong dropdown:

- **Check-in:** chuẩn bị scan context của Bitcoin Nail Bar rồi mở thẳng form chọn dịch vụ/check-in bằng hồ sơ hiện tại nếu phiên đăng nhập hợp lệ; nếu không thì mở form khách.
- **Payment:** chọn Bitcoin Nail Bar làm doanh nghiệp hiện tại và mở màn thanh toán trực tiếp hiện có.
- **Tip:** chuẩn bị luồng tip chung cho Anna tại Bitcoin Nail Bar rồi mở màn chọn số tiền tip hiện có.

Các shortcut chỉ chuẩn bị context và điều hướng. Chúng không tự tạo check-in, tip hoặc payment trước khi người dùng xác nhận trong màn tương ứng.

## Phạm vi an toàn

- Không thay đổi hành vi của “Quét QR salon”, “Nhập mã” hoặc các intent xuất hiện sau khi quét thật.
- Không thay đổi quy tắc kiểm tra replay, quyền sở hữu ticket hoặc xác minh thanh toán.
- Nếu không thể chuẩn bị context demo hợp lệ, giữ người dùng ở màn Scan và dùng toast lỗi hiện có.
- Nội dung mới hỗ trợ cả tiếng Việt và tiếng Anh qua `data-vi` / `data-en`.

## Kiểm thử

- Kiểm tra cấu trúc có đúng ba action, đúng thứ tự và đủ nội dung song ngữ.
- Kiểm tra từng shortcut mở đúng màn hình và dùng Bitcoin Nail Bar / Anna theo thiết kế.
- Kiểm tra shortcut không tạo bản ghi nghiệp vụ trước thao tác xác nhận.
- Chạy bộ kiểm thử hiện có và kiểm tra giao diện ở viewport mobile tương ứng ảnh tham chiếu.

## Tiêu chí nghiệm thu

- Ba action hiển thị ngay dưới khu vực camera controls như ảnh tham chiếu.
- Check-in, Payment và Tip đều đi thẳng vào luồng tương ứng.
- Kịch bản demo không bị thay đổi bởi giá trị dropdown QR salon.
- Luồng scan QR hiện hữu tiếp tục hoạt động như trước.
