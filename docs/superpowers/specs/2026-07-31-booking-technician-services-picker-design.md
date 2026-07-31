# Booking Edit Technician Services Picker

## Mục tiêu

Trong modal `Edit Technician Info` của
`html/pages/booking-book-phase-1.html?tab=settings`, thay danh sách 20 service
viết cứng bằng danh sách lấy từ `html/menu/menu.json`.

Danh sách phải được nhóm theo category, chỉ giữ các category có `kind` là
`service` hoặc `add-on`, và loại các category đồ uống (`beverage`). Người dùng
có thể chọn toàn bộ service, toàn bộ service trong một category, hoặc từng
service riêng lẻ.

## Thiết kế

### Nguồn dữ liệu và luồng tải

- Tái sử dụng `appointmentServiceCatalogLoader` hiện có để load
  `../menu/menu.json`.
- Catalog appointment hiện tại vẫn load từ
  `../assets/booking-service-catalog-draft.json`; hai nguồn này độc lập.
- Picker technician có trạng thái loading trong lúc menu chưa tải xong.
- Khi tải thành công, renderer tạo các category và service checkbox từ dữ
  liệu normalized.
- Khi tải lỗi hoặc loader không có sẵn, picker hiển thị trạng thái lỗi/không
  có service và không làm hỏng các field còn lại trong modal.
- Dữ liệu đưa vào HTML phải được escape bằng helper `escapeHtml` hiện có.

### Cấu trúc giao diện

Vùng Services trong modal gồm:

1. Checkbox `Check all categories` ở cấp global.
2. Các category dạng accordion; mỗi header hiển thị tên, số lượng service và
   checkbox `Check all` của category đó.
3. Các item bên trong category; mỗi item có checkbox với value là tên service.

Các checkbox dùng data hooks riêng cho technician picker để không xung đột với
các checkbox Settings khác. Category có thể mở/đóng mà không ảnh hưởng trạng
thái lựa chọn.

### Hành vi chọn và đồng bộ trạng thái

- Global `Check all categories` chọn hoặc bỏ chọn tất cả service trong mọi
  category.
- Category `Check all` chỉ chọn hoặc bỏ chọn các service thuộc category đó.
- Checkbox service chỉ thay đổi chính service đó.
- Sau mỗi thay đổi, renderer đồng bộ:
  - global `checked` khi tất cả service được chọn;
  - global `indeterminate` khi chỉ một phần service được chọn;
  - `checked`/`indeterminate` tương tự cho từng category.
- Nếu không có service, các checkbox cấp global/category ở trạng thái không
  thể chọn.
- Khi mở technician có sẵn, các service đã lưu được chọn lại sau khi picker
  tải xong. Selection đang chờ được giữ trong runtime để tránh race giữa việc
  mở modal và việc fetch menu.
- `getTechField('services')` tiếp tục trả về chuỗi tên service phân tách bằng
  dấu phẩy để tương thích với `saveTechModal` và dữ liệu technician hiện tại.

### Tương thích dữ liệu hiện tại

- Các service legacy đã lưu chỉ được đánh dấu khi khớp với value của item trong
  menu. Các service không còn trong menu không tạo checkbox giả.
- Logic lưu technician, roster, schedule, profile và các picker appointment
  khác không đổi.
- Không thay đổi nội dung `menu.json`.

## Kiểm thử

Bổ sung source-contract tests cho page để xác nhận:

- Page có URL `../menu/menu.json` và loader được gọi cho technician picker.
- Markup hard-code 20 service cũ được thay bằng container động.
- Renderer tạo category, checkbox global, checkbox category và checkbox item.
- Có helper đồng bộ trạng thái `checked`/`indeterminate` ở cả hai cấp.
- Event handler phân biệt đúng global, category và item.
- Dữ liệu service/category được escape trước khi đưa vào HTML.
- Có loading và error fallback.
- Test hiện có của Booking Settings, catalog normalizer và các page tests vẫn
  pass.

Các lệnh kiểm tra tối thiểu:

```bash
node --test html/pages/booking-book-phase-1.technician-services.test.mjs
node --test html/pages/booking-book-phase-1.settings-services.test.mjs
node --test html/assets/appointment-service-catalog.test.cjs
node --check html/assets/appointment-service-catalog.js
git diff --check
```

## Ngoài phạm vi

- Không sửa schema hoặc nội dung `menu.json`.
- Không đồng bộ giá/duration từ menu vào catalog salon.
- Không thay đổi service picker của appointment booking.
- Không thêm API/backend hoặc persistence mới cho technician service selection.
