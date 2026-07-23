# Thiết Kế Nhóm Thông Tin Gói Ký Gửi VMM 3 Năm

**Ngày:** 2026-07-23  
**Trạng thái:** Draft chờ người dùng duyệt  
**Phạm vi:** `html/vmm3y/vmm-3-year-program-embed-tabs.html`

## Mục tiêu

Sau khi thành viên chọn một cấp ký gửi, hiển thị một nhóm thông tin xác nhận bằng tiếng Việt ngay bên dưới phần form mua. Nhóm này giúp thành viên kiểm tra lại đầy đủ số VMM, quyền lợi, thời hạn, ngày bắt đầu, ngày hoàn tất dự kiến và số dư trước khi xác nhận.

## Luồng người dùng

1. Thành viên mở tab **Mua**.
2. Thành viên chọn một gói trong danh sách cấp ký gửi.
3. Nhóm thông tin gói xuất hiện bên dưới các trường chọn gói.
4. Các giá trị trong nhóm được cập nhật theo gói đang chọn và số dư hiện tại.
5. Thành viên mở **Terms & Conditions** nếu cần, sau đó bấm **Xác nhận ký gửi**.
6. Khi hoàn tất hoặc xóa lựa chọn, nhóm thông tin được ẩn/reset theo logic hiện có.

## Phương án được chọn

Tái sử dụng `reviewArea` và state hiện có thay vì tạo một luồng riêng. Bổ sung markup cho nhóm thông tin trong vùng review, thêm các CSS class scoped dưới `#vmm-program-root`, và cập nhật `showReview()`/các helper liên quan để đổ dữ liệu động.

Phương án này giữ nguyên event handler, kiểm tra số dư, modal Terms và logic hoàn tất giao dịch; chỉ mở rộng phần hiển thị review.

## Thành phần giao diện

Khi đã chọn gói, nhóm hiển thị các dòng sau:

- **Số VMM ký gửi:** `selectedTier.amount`.
- **VMM IOU được tặng:** `selectedTier.reward`.
- **Thời hạn:** 3 năm.
- **Ngày bắt đầu:** 01/09/2026.
- **Ngày hoàn tất dự kiến:** 01/09/2029.
- **Số dư VMM còn lại:** `walletBalance - selectedTier.amount`.
- Link **Terms & Conditions** mở modal điều khoản hiện có.
- Nút **Xác nhận ký gửi** dùng lại `confirmDeposit` và trạng thái disabled hiện có.

Nhóm chỉ hiển thị khi `selectedTier` tồn tại. Nếu gói vượt quá số dư, vẫn hiển thị thông tin nhưng nút xác nhận tiếp tục bị khóa và thông báo thiếu số dư giữ nguyên.

## State và dữ liệu

- Không tạo state mới cho gói; dùng `selectedTier` hiện có.
- Không tạo state mới cho số dư; dùng `walletBalance` hiện có.
- Số dư còn lại được tính lại khi chọn gói và sau khi hoàn tất giao dịch.
- Các ngày dùng cùng mốc hiện có trong prototype: bắt đầu 01/09/2026, hoàn tất 01/09/2029.
- Khi bỏ chọn hoặc reset form, các giá trị review trở về trạng thái ẩn/không có dữ liệu.

## Phạm vi không bao gồm

- Không thay đổi bảng cấp ký gửi, phần thưởng hoặc quy tắc giao dịch.
- Không thêm API, persistence, backend ledger hoặc xác thực Terms mới.
- Không thay đổi tab Lịch sử, modal thành công hoặc luồng đổi USDV sang VMM.
- Không chỉnh sửa các file đang có thay đổi không liên quan.

## Kiểm tra và nghiệm thu

- `node --check` xác nhận JavaScript trong file không có lỗi cú pháp.
- Kiểm tra tĩnh xác nhận nhóm review chứa đủ các nhãn và các hook cập nhật động.
- Kiểm tra luồng chọn gói mặc định và đổi sang gói khác: số VMM, IOU và số dư còn lại thay đổi đúng.
- Kiểm tra gói vượt số dư: nhóm vẫn hiển thị, nút xác nhận bị khóa và cảnh báo hiện đúng.
- Kiểm tra reset sau giao dịch: nhóm review được ẩn và form trở về trạng thái chờ chọn gói.
