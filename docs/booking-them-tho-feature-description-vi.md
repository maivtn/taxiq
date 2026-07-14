# Modal "Thêm Thợ" — Spec Ngắn Để Dựng Ở Nơi Mới

Một modal quản lý **profile thợ** (dùng chung cho SMS báo khách, QR tip, Review, Reward). Dựng lại theo mô tả dưới, không cần file gốc.

## Chế độ (1 modal, 3 mode)
- **Thêm mới**: mở từ nút "Thêm Thợ" → form trắng → lưu thì tạo thẻ thợ mới.
- **Chỉnh sửa**: chọn 1 thợ trong dropdown → đổ dữ liệu vào form → lưu thì cập nhật.
- **Xem chi tiết**: mở từ nút con mắt trên thẻ thợ → như Chỉnh sửa nhưng **ẩn** vùng chọn danh sách.

## Bố cục form (3 khối, cuộn dọc)
1. **Chọn từ danh sách** — ô tìm kiếm/combobox lọc thợ theo tên/SĐT/email/dịch vụ; danh sách thợ có sẵn; nút "Tự nhập" để nhập thợ mới. Không khớp → "Không tìm thấy thợ phù hợp."
2. **Thông tin profile** — Tên thợ; Số điện thoại (chọn mã quốc gia +1/+84/+52, tự format `(xxx) xxx-xxxx`); Email; Dịch vụ (8 checkbox: Gel, Full Set, Dip, Pedicure, Nail Art, Acrylic, Waxing, Eyelash).
3. **Lịch làm việc hằng tuần** — 7 dòng Mon→Sun, mỗi dòng có checkbox "Day off" + giờ bắt đầu/kết thúc. Tick Day off → mờ dòng, khóa & xóa giờ.

## Hành vi chính
- Mở modal: khóa scroll nền, focus ô Tên thợ.
- Combobox: focus/gõ mở menu, click ngoài hoặc `Esc` đóng menu (chưa đóng modal).
- Lưu: gom tên, SĐT, email, dịch vụ, lịch → tạo/cập nhật thẻ thợ (avatar = chữ cái đầu tên; "Khách hôm nay" = 0; SMS bật sẵn) → hiện toast "Đã lưu thông tin thợ: <tên>" → đóng modal.
- Mặc định khi bỏ trống: tên → "Thợ mới", SĐT → "Chưa có số", dịch vụ → "Gel".
- Đóng: nút X / "Đóng" / bấm nền tối / `Esc`.
- Responsive ≤767px: body 1 cột, grid profile 1 cột, dialog ~92vh.

## Dữ liệu 1 thợ
`name`, `phone`, `email`, `services` (danh sách phẩy), `schedule` (chuỗi `mon=09:00-18:00;tue=...`, ngày nghỉ/thiếu giờ thì bỏ).

## Cần cho bản thật
Backend/persist, validate (trùng, định dạng, giờ mở < đóng), phân quyền, xóa/ẩn thợ nghỉ, đồng bộ SMS/QR tip/Review/Reward. (Bản hiện tại là prototype front-end, tải lại trang là mất dữ liệu.)
