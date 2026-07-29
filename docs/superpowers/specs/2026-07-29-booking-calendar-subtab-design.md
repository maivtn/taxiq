# Thiết kế subtab Calendar cho Booking Book

## Mục tiêu

Trong trang `html/pages/booking-book-phase-1.html?tab=booking`, bổ sung subtab `Calendar` riêng. Subtab `Appointments` vẫn hỗ trợ hai mode `Table` và `Card`; mode view `Calendar` hiện tại sẽ được loại bỏ khỏi nhóm chuyển view.

## Hiện trạng

- Booking Book hiện có hai subtab logic: `Appointments` (`today`) và `Team`; calendar đang được render như một mode bên trong `Appointments`.
- Runtime dùng `setBookingViewMode()` để chuyển giữa `table`, `card` và `calendar`.
- Calendar hiện tại đã có đầy đủ điều hướng ngày, tạo appointment, chọn time range, click event, kéo/thả và resize.
- Appointment detail panel được render động từ shared appointment store và được dùng bởi calendar interaction.

## Quyết định thiết kế

### 1. Cấu trúc subtab

Thanh subtab của Booking sẽ có thứ tự:

1. `Appointments` — `data-booking-subtab-target="today"`
2. `Calendar` — `data-booking-subtab-target="calendar"`
3. `Team` — `data-booking-subtab-target="team"`

`Appointments` vẫn là subtab mặc định khi mở `?tab=booking`. Việc đổi subtab chỉ điều khiển panel trong trang; không thêm query parameter mới.

### 2. Appointments

Panel `booking-subpanel-today` tiếp tục chứa KPI, bộ lọc, bảng dữ liệu và card list. Nhóm `Booking view mode` chỉ còn:

- `Table`
- `Card`

Xoá button và contract `data-booking-view-target="calendar"`. `setBookingViewMode()` chỉ nhận `table` và `card`, mặc định là `table`. Panel này không còn chứa `data-booking-view-panel="calendar"`.

### 3. Calendar

Tạo `booking-subpanel-calendar` và chuyển calendar workspace hiện tại vào panel này. Calendar giữ nguyên:

- ngày hiện tại, previous/next và nút `Today`;
- nút `New appointment`;
- DayPilot team calendar và grouping theo technician;
- chọn khoảng thời gian để tạo appointment;
- click event để mở detail panel;
- kéo event để đổi lịch và resize để đổi thời lượng;
- appointment detail panel dùng chung store/catalog hiện tại.

Calendar panel sẽ được khởi tạo khi cần và render lại sau các mutation như create, update, drag, resize, status change hoặc storage event. Không tạo data model, catalog hoặc renderer thứ hai.

### 4. Runtime và CSS

- `activateBookingSubTab()` tiếp tục là cơ chế duy nhất để bật/tắt ba panel.
- `initBookingViewMode()` chỉ render card và đặt mode `table`; không khởi tạo calendar thông qua mode switch.
- Loại bỏ các listener và nhánh xử lý dành riêng cho `data-booking-view-target="calendar"`, nhưng giữ lại toàn bộ calendar date/event handlers.
- Cập nhật các selector lấy panel từ `booking-subpanel-today` sang panel phù hợp để calendar runtime hoạt động khi `Calendar` là subtab độc lập.
- Giữ giao diện responsive và các class calendar hiện có; chỉ điều chỉnh layout/visibility để detail panel đi cùng Calendar workspace.

## Kiểm thử và tiêu chí nghiệm thu

Bổ sung/cập nhật source-contract tests để xác nhận:

- có button subtab `Calendar` và panel `booking-subpanel-calendar`;
- `Appointments` có `Table` và `Card`, không còn view target `Calendar`;
- `setBookingViewMode()` không còn chấp nhận mode calendar và khởi tạo mặc định là `table`;
- calendar panel vẫn có date controls, DayPilot host, create action, event click, drag và resize hooks;
- `Team` vẫn giữ nguyên và subtab mặc định không đổi;
- toàn bộ test hiện hữu của Booking Book/shared appointments vẫn pass.

Chạy tối thiểu:

```bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
node --check html/assets/pos-booking-runtime.js
git diff --check
```

## Ngoài phạm vi

- Không đổi schema hoặc business rule của appointment store.
- Không đổi layout hoặc chức năng của subtab `Team`.
- Không tạo backend/API mới.
- Không thay đổi POS calendar.
