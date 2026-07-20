# Thiết kế icon cho card “Invite friends”

## Mục tiêu

Thay emoji `🤝` trong card “Invite friends” trên màn hình Home bằng icon thư viện Lucide để giao diện đồng nhất.

## Thiết kế

- Chỉ thay emoji trong card có `data-target="referral"`; không thay emoji trong dữ liệu hoạt động hay vị trí khác.
- Giữ nguyên khung icon 48px, nền tím nhạt và hành động điều hướng.
- Dùng `<i data-lucide="handshake" class="size-6" aria-hidden="true"></i>` và thêm màu `text-app-purple` cho khung.
- Không thay đổi nội dung song ngữ hoặc logic JavaScript.

## Kiểm thử

Thêm kiểm thử cấu trúc xác nhận card referral dùng `data-lucide="handshake"` và không còn emoji `🤝` trong span icon của card.
