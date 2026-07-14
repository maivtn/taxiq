# Setup "Thông Tin Tiệm" — Spec Ngắn Để Dựng Ở Nơi Mới

Card nhập **thông tin nền của tiệm** — một nguồn dữ liệu dùng chung cho AI Voice, SMS, Landing Page, Schema và Booking. Nằm trong panel **Cấu Hình Tiệm**, lưu chung bằng nút "Lưu Cấu Hình".

## Các trường (form 2 cột, có nút thu gọn card)
1. **Tên tiệm** — text. (VD: Bitcoin Nail Bar)
2. **Số điện thoại tiệm** — chọn mã quốc gia (select: +1/+84/+52), tự format `(xxx) xxx-xxxx`. Ghi chú: số khách đang gọi, sẽ forward về số AI.
3. **Số AI trả lời** — mã `+1`, **chỉ đọc** (select + input đều khóa; NEXORA cấp, AI bắt máy 24/7).
4. **Số nhận thông báo booking** — chọn mã quốc gia (+1/+84/+52), tự format. Ghi chú: SMS báo khi có khách book/nhắn (số chủ hoặc quản lý).
5. **Địa chỉ** — text, full width.
6. **Google Review Link** — text, full width. (VD: g.page/bitcoinnailbar)

## Hành vi chính
- **Thu gọn/mở card**: nút chevron góc phải (đổi `aria-expanded`, xoay icon).
- **Phone mask**: gõ tới đâu format tới đó; mã quốc gia chọn qua select (+1/+84/+52); ô "Số AI trả lời" khóa cả select lẫn input.
- **Lưu**: chung nút "Lưu Cấu Hình" của cả panel → hiện toast "Đã lưu cấu hình. AI Voice, SMS, LP, Schema và Booking Book đã đồng bộ." (vùng `data-settings-status`).
- **Đồng bộ**: dữ liệu ở đây là nguồn cho AI Voice (giá/giờ), SMS (tên tiệm & offer), Landing Page, Schema (FAQ/local), Booking — nhập một lần, dùng nhiều nơi.
- **Responsive**: hẹp thì grid trường về 1 cột; Địa chỉ & Review Link luôn full width.

## Dữ liệu tiệm
`name`, `shopPhone`, `aiPhone` (readonly), `bookingNotifyPhone`, `address`, `googleReviewLink`.

## Cần cho bản thật
Backend/persist, validate (định dạng SĐT/địa chỉ/URL review), cấp & khóa số AI từ hệ thống, thực sự forward cuộc gọi, và đẩy dữ liệu đồng bộ sang AI Voice/SMS/Landing/Schema/Booking. (Bản hiện tại là prototype front-end, tải lại trang là mất thay đổi.)
