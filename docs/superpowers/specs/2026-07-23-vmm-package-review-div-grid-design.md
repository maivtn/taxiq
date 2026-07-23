# Thiết Kế Nhóm Review Gói VMM Dạng Div Grid

**Ngày:** 2026-07-23  
**Trạng thái:** Draft chờ người dùng duyệt  
**Phạm vi:** `html/vmm3y/vmm-3-year-program-embed-tabs.html`

## Mục tiêu

Thay cấu trúc danh sách `ul/li` của nhóm review gói VMM bằng các `div`, đồng thời cải thiện khả năng đọc bằng layout card 2 cột trên màn hình rộng và 1 cột trên mobile.

## Thiết kế

- Giữ nguyên wrapper `.vmm-package-review` và các `id` động để không thay đổi JS.
- Thay `.vmm-package-review-list` chứa `ul/li` bằng `.vmm-package-review-grid` chứa các `.vmm-package-review-item`.
- Mỗi item hiển thị label nhỏ ở trên và giá trị nổi bật bên dưới.
- Card có nền trắng, border nhẹ, bo góc và khoảng cách đều trên nền review xanh nhạt.
- Desktop/tablet dùng 2 cột; màn hình dưới 520px chuyển thành 1 cột.
- Không sử dụng bullet/list marker.

## Dữ liệu ngày

Theo rule mới của chương trình:

- Ngày bắt đầu: `Aug 20, 2026`.
- Ngày hoàn tất dự kiến: `Aug 20, 2029`.

Các giá trị khác tiếp tục lấy từ `selectedTier` và `walletBalance`; các `id` sau phải được giữ nguyên: `reviewDepositAmount`, `reviewRewardAmount`, `reviewPeriod`, `reviewStartDate`, `reviewEndDate`, `reviewRemainingBalance`.

## Phạm vi không bao gồm

- Không thay đổi logic chọn gói, tính thưởng, kiểm tra số dư hoặc xác nhận ký gửi.
- Không thay đổi tab Lịch sử hoặc modal Terms.
- Không sửa các file ngoài file HTML mục tiêu và test regression liên quan.

## Kiểm tra và nghiệm thu

- HTML không còn `ul/li` trong nhóm `.vmm-package-review`.
- HTML có đủ sáu item dạng `div` và giữ nguyên các hook `id` động.
- Test xác nhận date copy là `Aug 20, 2026` và `Aug 20, 2029`.
- CSS grid hiển thị 2 cột ở viewport rộng và 1 cột ở mobile.
- JS syntax check và test regression đều pass.
