# Thiết kế Services & Pricing theo danh mục cho Booking Settings

## Mục tiêu

Trong `html/pages/booking-book-phase-1.html?tab=settings`, phần `Services & Pricing` sẽ hiển thị danh mục và dịch vụ từ tệp JSON hiện có thay vì các dòng dịch vụ viết cứng trong HTML. Giao diện vẫn giữ các thao tác hiện tại: chỉnh sửa tên/giá/thời lượng, thêm dịch vụ, thêm gợi ý theo ngành và xóa dịch vụ.

## Hiện trạng

- `Services & Pricing` đang chứa 10 dòng dịch vụ viết cứng trong HTML.
- Runtime của Booking đã tải `../assets/booking-service-catalog-draft.json` thông qua `appointmentServiceCatalogLoader`.
- JSON hiện có 8 danh mục và 76 dịch vụ; mỗi dịch vụ gồm ID, tên, giá và thời lượng.
- Các thao tác Settings hiện tại chủ yếu cập nhật DOM và thông báo trạng thái; chưa có cơ chế lưu riêng cho các dòng dịch vụ trong Settings.

## Quyết định thiết kế

### 1. Nguồn dữ liệu và luồng dữ liệu

- Dùng lại `appointmentServiceCatalogLoader` và URL `APPOINTMENT_SERVICE_CATALOG_URL` hiện có.
- Khi tải JSON thành công, runtime gọi một hàm dựng giao diện riêng cho Settings để tạo các accordion danh mục và dòng dịch vụ.
- Mỗi dòng lấy `id`, `name`, `price`, `durationMin` và `icon` từ JSON.
- Nếu JSON không tải được, hàm dựng giao diện dùng các dịch vụ đang có trong `catalog.services` làm dữ liệu dự phòng.
- Không sửa tệp JSON và không thay đổi schema dùng chung của Booking/POS trong phạm vi này.
- Các giá trị nhập trên Settings vẫn hoạt động theo hành vi giao diện hiện tại; việc bổ sung cơ chế lưu hoặc đồng bộ giá sang catalog dùng chung nằm ngoài phạm vi.

### 2. Cấu trúc giao diện và tương tác

- Mỗi danh mục là một accordion, mặc định mở danh mục đầu tiên.
- Phần đầu danh mục hiển thị tên danh mục và số lượng dịch vụ.
- Nội dung danh mục giữ cấu trúc cột hiện tại: Service, Price, Duration và Remove.
- Tên, giá và thời lượng vẫn là các ô nhập có thể chỉnh sửa trực tiếp.
- `Enter Manually` tạo một dòng dịch vụ trong danh mục `CUSTOM SERVICES`.
- `Industry Suggestions` thêm dòng theo hành vi hiện tại và đưa vào `CUSTOM SERVICES`.
- Xóa dịch vụ chỉ loại dòng đó khỏi danh sách DOM hiện tại.
- Giữ nguyên `Scan Menu`, `Save Settings`, thông báo trạng thái và các hook event delegation hiện có.
- Tất cả tên/giá/thời lượng/icon từ JSON phải được escape trước khi đưa vào `innerHTML`.

### 3. Trạng thái tải, dữ liệu dự phòng và tương thích

- Trước khi tải xong catalog, vùng Settings hiển thị trạng thái `Loading services…`.
- Sau khi tải thành công, vùng Settings hiển thị đủ 8 danh mục và 76 dịch vụ trong JSON.
- Khi việc tải thất bại, vùng Settings vẫn dựng được bằng `catalog.services` và thông báo trạng thái cho biết đang dùng dữ liệu dự phòng.
- Hàm dựng giao diện phải tương thích với việc catalog được tải sau lần render khởi tạo; không làm hỏng các bộ chọn appointment đang dùng cùng catalog.
- Các dòng dịch vụ được dựng động phải tiếp tục dùng selector `data-service-row`, `data-service-remove` và các class input hiện có để event handlers không bị hỏng.

## Kiểm thử và tiêu chí nghiệm thu

Bổ sung source-contract tests cho `booking-book-phase-1.html` để xác nhận:

1. Trang tiếp tục tải URL catalog JSON và loader hiện có.
2. Settings có hook/container cho hàm dựng danh mục và dịch vụ.
3. Không còn 10 dòng dịch vụ viết cứng trong markup.
4. Hàm dựng giao diện tạo danh mục và dòng dịch vụ từ dữ liệu catalog.
5. Có danh mục `CUSTOM SERVICES` cho dịch vụ được thêm thủ công.
6. Các hook chỉnh sửa/thêm gợi ý/xóa hiện có vẫn được giữ.
7. Có hành vi hiển thị trạng thái đang tải và dữ liệu dự phòng.

Chạy tối thiểu:

```bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
node --test html/pages/booking-book-phase-1.settings-services.test.mjs
node --check html/assets/appointment-service-catalog.js
git diff --check
```

## Ngoài phạm vi

- Không thay đổi cấu trúc hoặc nội dung `booking-service-catalog-draft.json`.
- Không thêm backend/API.
- Không thay đổi schema `salon-data` hoặc cơ chế lưu chung cho Booking/POS.
- Không thay đổi bộ chọn dịch vụ của appointment ngoài việc giữ tương thích với loader hiện có.
