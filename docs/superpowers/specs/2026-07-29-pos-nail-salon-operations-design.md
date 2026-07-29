# Thiết kế vận hành POS cho tiệm nail (v2)

## Trạng thái và mục tiêu

Đặc tả này tổ chức lại `html/pages/pos-phase-1.html` theo công việc thực tế của lễ tân và quản lý tiệm nail. Mục tiêu là tách rõ ba thời điểm của một lượt khách:

```text
Đặt lịch  →  Check-in  →  Làm dịch vụ / thanh toán
 Booking      Check-in         Tickets
```

POS phải hỗ trợ một khách có nhiều dịch vụ, mỗi dịch vụ là một service ticket và được gán cho đúng một thợ hoặc `Anyone`. Các service ticket của cùng thợ chạy nối tiếp; service ticket của các thợ khác có thể chạy song song. Khách vẫn thanh toán gộp theo một order mặc định.

Đặc tả này kế thừa mô hình ticket trong `2026-07-28-appointment-order-tickets-design.md`, workspace Booking trong `2026-07-29-pos-booking-tab-design.md`, và cấu trúc subtab Calendar trong `2026-07-29-booking-calendar-subtab-design.md`. Nó quy định cách các phần đó đi vào vận hành tại quầy; không tạo một mô hình appointment thứ hai.

Đây là bản v2, thay thế bản đầu. So với bản đầu, v2 bổ sung: dẫn chứng hiện trạng có số dòng, sửa mâu thuẫn về view Booking, mô hình operational ticket bền qua reload, quy tắc thanh toán/turn dứt khoát, thứ tự phase khả thi, cập nhật shared shell, và mục Ngoài phạm vi.

## Hiện trạng (đã xác minh trong code)

- Handler check-in từ ETA hiện tại (`data-eta-in`, `html/pages/pos-phase-1.html:2231-2243`) chỉ ghi `metadata.eta.st = 'in'` — **không** cập nhật booking sang `checked-in`. Nó tạo đúng một dòng `WAITLIST` phẳng, gán `svc` bằng chuỗi đã nối `" + "` (`posBookingView`, `pos-phase-1.html:3133`) và gán `reqTech: eb.techId`.
- `parentTechnicianId` (`html/assets/appointment-tickets.js:98-101`) trả về `null` khi các ticket của booking có nhiều thợ khác nhau hoặc có `Anyone`. Vì handler trên dùng `eb.techId` (field order cha), một booking nhiều thợ mất toàn bộ phân công khi check-in.
- Không có `bookingId` hay `serviceTicketId` nào được lưu trên dòng `WAITLIST` được tạo — không có đường lần ngược về booking gốc.
- `WAITLIST` là mảng in-memory (`pos-phase-1.html:1731-1744`), không persist; `BOOKINGS` thì persist qua `appointmentStore` (localStorage, `appointments-store.js`). Sau reload, booking vẫn giữ trạng thái nhưng mọi ticket vận hành biến mất.
- `WAITLIST` hiện chỉ có 3 giá trị status: `waiting`, `service`, `ready` (`pos-phase-1.html:1731-1744`); `appointments-store.js:24` đã có `VALID_STATUSES = ['pending', 'confirmed', 'checked-in', 'completed', 'no-show', 'cancelled']` cho booking.
- `fAssign` (`pos-phase-1.html:2216, 2269, 2343`) chuyển `waiting → service` và bắt đầu đếm giờ `svcAtMs` trong cùng một bước one-tap-assign.
- Thanh toán (`data-wpay`, `pos-phase-1.html:2289-2305`) hiện cộng đúng `+1` turn cho một `techId` duy nhất khi charge; giá hiển thị đọc từ `w.items` (`pos-phase-1.html:2076, 2097, 2106`).
- Booking status chips hiện có (`pos-phase-1.html:821-826`): `all`, `new`, `sms-sent`, `done`, `noshow`. `sms-sent` ánh xạ vào field `smsStatus` riêng, không phải field `status` (`appointments-store.js:179-183`).
- Test hợp đồng hiện có (`html/pages/pos-phase-1.appointments.test.cjs`):
  - dòng 94: `assert.match(source, /var TABS = \['dispatch', 'clock', 'management', 'booking'\]/)`.
  - dòng 45-53: yêu cầu `data-booking-view-target="calendar"` **không tồn tại** và Calendar là subtab riêng (`data-booking-subtab-target="calendar"`), theo đúng `2026-07-29-booking-calendar-subtab-design.md`. POS Booking chỉ có 2 subtab (`today`, `calendar`) — không có subtab `team`.
- Tab điều hướng POS được nhân bản trong shared shell (`html/assets/nexora-shell.js:84-89`), và `activateTab` gọi `window.NEXORA_SHELL.setActiveTab(id)` (`pos-phase-1.html:3458`) để đồng bộ sidebar.
- Dữ liệu khách hiện đã có thể sửa trong tab Management: ghi chú (`data-mg-note`, `pos-phase-1.html:3042-3049`) và thợ ưa thích (`data-mg-pref`, `pos-phase-1.html:3077-3078`), cộng `CUSTHIST`/`CUSTPKGS` (`pos-phase-1.html:1760-1777`).

## Vấn đề của giao diện hiện tại

Tab `Dispatch` hiện chứa KPI, hàng đợi khách tại tiệm, bảng thợ, App/QR check-in, yêu cầu thợ nhận khách và booking sắp đến. Những thành phần này trả lời các câu hỏi khác nhau nên người dùng phải tìm vị trí thao tác thay vì đi theo luồng công việc.

Mặt khác, `BOOKINGS` đã là order cha chứa nhiều ticket dịch vụ, nhưng `WAITLIST` hiện là một dòng dịch vụ chỉ mang một thợ. Luồng check-in từ booking chỉ đưa một dòng vào queue (xem Hiện trạng ở trên). Nó không lưu liên kết rõ ràng về booking/ticket gốc, không cập nhật Booking sang `Checked in`, và có thể làm mất phân công thợ khi booking có nhiều ticket. Thiết kế mới phải loại bỏ điểm đứt này.

## Thuật ngữ chuẩn

| Thuật ngữ | Ý nghĩa |
|---|---|
| **Booking order** | Đơn hẹn của một khách, chứa thông tin khách, thời gian, ghi chú, nguồn và nhiều service ticket. |
| **Service ticket** | Một dịch vụ cụ thể với giá, thời lượng, thợ và trạng thái thực hiện riêng. Đây là đơn vị lập lịch và vận hành. |
| **Operational ticket** | Bản ghi đang hoạt động trong `WAITLIST` cho đúng một service ticket khi khách đã có mặt. Nó luôn mang liên kết về booking/order nếu có. |
| **Walk-in order** | Order tạo tại tiệm, không có booking trước; cũng gồm một hoặc nhiều service ticket. |
| **Hóa đơn** | Giao dịch thanh toán. Mặc định gom toàn bộ service ticket của một order/khách thành một lần thanh toán. |

Không dùng từ "ticket" để chỉ cả hóa đơn lẫn dịch vụ. Trên UI, nhãn hiển thị (label/header) dùng tiếng Anh Mỹ theo quy ước hiện có của dự án (ví dụ `Waiting`, `In service`, `Ready to pay`); tài liệu đặc tả này dùng tiếng Việt để mô tả, không phải để đặt tên chuỗi UI.

## Kiến trúc thông tin POS

Thanh điều hướng cấp cao thay thế cách gom `Dispatch` và `Appointments` hiện tại:

```text
Check-in | Tickets | Booking | Customers | Time Clock | Management
```

| Khu vực | Người dùng cần trả lời | Nguồn dữ liệu chính |
|---|---|---|
| **Check-in** | Khách nào đã đến và cần đưa vào phục vụ? | `CHECKINQ`, booking trong ngày, khách walk-in |
| **Tickets** | Ai đang chờ/làm/xong, thợ nào đang bận? | `WAITLIST` (operational ticket), `ACCESSQ`, `SALES` |
| **Booking** | Khách nào sẽ đến, khi nào và với thợ nào? | Shared appointment store (`BOOKINGS`) |
| **Customers** | Khách này là ai, từng làm gì, còn package gì? | `CUSTOMERS`, `CUSTHIST`, `CUSTPKGS` |
| **Time Clock / Management** | Nhân sự, cấu hình và báo cáo | Các panel hiện có, trừ phần khách hàng (xem mục Customers) |

### Hợp đồng điều hướng

- `var TABS = ['check-in', 'tickets', 'booking', 'customers', 'clock', 'management']`; mặc định là `'check-in'`.
- `data-pos-panel="dispatch"` được **đổi tên thành** `data-pos-panel="tickets"`. Việc alias URL cũ chỉ xảy ra ở bước resolve URL, không tồn tại trong DOM attribute, để `activateTab`'s `panels.forEach` (`pos-phase-1.html:3448-3449`) vẫn là một lookup duy nhất.
- Tương thích URL: alias được áp dụng một lần lúc boot, trước khi gọi `activateTab` lần đầu: `dispatch → tickets`, `appointments → booking`. Sau khi khớp alias, `replaceState` ghi lại **id chuẩn** (`tickets`/`booking`) vào URL, không giữ lại `dispatch`/`appointments` — đây là quyết định tường minh, không phải hệ quả ngẫu nhiên. URL mới lần lượt là `?tab=check-in`, `?tab=tickets`, `?tab=booking`, `?tab=customers`.
- Gate theo mode mở rộng `applyPosModeAccess` (`pos-phase-1.html:1639-1655`): `Management` chỉ Owner/Manager. `Customers` hiển thị cho cả Front Desk (xem + ghi chú), vì mục ghi chú/thợ ưa thích được chuyển từ Management sang đây (xem mục Customers). Khi Front Desk đang ở tab bị ẩn, fallback về `'check-in'` thay vì `'dispatch'`.
- Shared shell NAV model (`html/assets/nexora-shell.js:84-89`) phải được cập nhật cùng phase với sáu giá trị `tab` mới, vì sidebar/header là shell dùng chung — sửa ở model, không sửa markup từng trang.
- Sáu tab có thể tràn hàng trên tablet: `.page-tabs` phải cuộn ngang (overflow-x) thay vì wrap xuống dòng; đây là điều kiện nghiệm thu của phase 1.

## Check-in

Check-in là màn hình thao tác nhanh, không phải dashboard. Nó có ba nguồn được hiển thị bằng sub-tab:

1. **Booking hôm nay**: tìm theo tên hoặc số điện thoại, có filter thời gian và trạng thái `Pending`/`Confirmed`.
2. **App / QR**: tiếp nhận yêu cầu đang có trong `CHECKINQ`.
3. **Walk-in**: chọn/tạo khách, thêm các dịch vụ-thợ theo ticket picker hiện có.

Khi nhân viên chọn một booking, giao diện hiển thị toàn bộ service ticket, ví dụ:

```text
Linda Tran · 10:30
Pedicure — Anna — 60 phút
Manicure — Bella — 45 phút
Polish — Anna — 15 phút
```

Nút **Check in** thực hiện nguyên tử các việc sau:

- cập nhật Booking order thành `Checked in` và lưu thời điểm check-in;
- tạo một operational ticket cho từng service ticket **đang mở** (xem định nghĩa "mở" bên dưới) chưa được check-in, không tạo một dòng chung;
- sao chép `bookingId`, `serviceTicketId`, `orderId`, service và technician vào operational ticket;
- giữ technician `null` cho `Anyone`, để lễ tân hoặc quản lý gán sau;
- từ chối thao tác nếu service ticket đó đã có operational ticket đang mở.

App/QR và walk-in đi qua cùng một hàm tạo operational ticket. App/QR có thể được ghép với một Booking của cùng khách trước khi xác nhận; nếu không ghép, nó trở thành walk-in order. Điều này tránh hai luồng tạo ticket có quy tắc khác nhau.

## Mô hình operational ticket và độ bền qua reload

```js
{
  id: 12,                       // number, sinh từ ++wlSeq — giữ nguyên phép so sánh == / + của handler hiện có
  serviceTicketId: 'ticket-…',  // string, trỏ vào booking.tickets[]
  bookingId: 'booking-…' | null,
  orderId: 'booking-…' | 'walkin-…',
  customerId: '…' | null,
  technicianId: 't3' | null,    // null = Anyone; không bao giờ tự gán lại sang người khác
  status: 'waiting' | 'service' | 'ready' | 'completed' | 'cancelled'
}
```

Các field service, giá, thời lượng và snapshot tên thợ/khách vẫn được lưu tại operational ticket để render nhanh và bảo toàn lịch sử. `id` giữ kiểu number để tương thích các so sánh `==`/`+` đang có trong handler hiện tại (`pos-phase-1.html:2266, 2275, 2349` và `ACCESSQ.wid` tại `2014, 2210`); `serviceTicketId` là field link kiểu string, tách biệt với `id`.

**Operational ticket "đang mở"** = `status` không thuộc `{completed, cancelled}`. Quy tắc chống trùng chỉ so khớp với các ticket đang mở.

**Quy tắc rehydrate (giải quyết vấn đề reload mất ticket):** sau `reloadAppointmentSnapshot()` lúc boot, với mỗi booking có `status === 'checked-in'`, hệ thống tạo lại một operational ticket cho từng service ticket chưa hủy của booking đó mà **không có** operational ticket đang mở tương ứng. Vì booking persist còn `WAITLIST` thì không, quy tắc này khiến việc reload không phá hủy dữ liệu mà không cần thêm một store persist thứ hai. Walk-in order (không có `bookingId`) vẫn giới hạn theo phiên làm việc hiện tại — đây là giới hạn đã biết của prototype, ghi rõ để không bị hiểu nhầm là bug.

Các record `WAITLIST` cũ không có `serviceTicketId` được xem là walk-in order một-ticket độc lập, nhóm theo `id` hiện có.

Field `w.items` mà UI hiện đang đọc để hiển thị giá (`pos-phase-1.html:2076, 2097, 2106`) là **derive** từ service ticket được liên kết, không phải một danh sách song song cần đồng bộ tay.

`SALES` cần nhận `orderId` và `serviceTicketId` cho từng dòng khi checkout để có thể xác định lúc nào một booking hoàn tất. Trong phạm vi prototype hiện tại, dữ liệu vận hành vẫn theo cách lưu của POS hiện có; việc đồng bộ backend đa thiết bị là công việc riêng, không được giả định là đã có.

## Tickets: vận hành tại tiệm

Tickets chỉ gồm khách đã check-in hoặc walk-in. Mặc định là card theo **khách/order**, còn trạng thái và thao tác nằm ở từng service ticket.

```text
Linda Tran · 10:30 · Checked in
├─ Pedicure       — Anna   — Đang làm
├─ Manicure       — Bella  — Đang làm
└─ Polish         — Anna   — Chờ Anna
Tổng $62 · 120 phút                         [Mở chi tiết]
```

Thanh filter có chip: `Tất cả`, `Chờ`, `Đang làm`, `Sẵn sàng`, `Chờ thanh toán`, `Hoàn tất` (nhãn UI thực tế dùng tiếng Anh theo quy ước dự án). Các KPI thuộc vận hành (khách chờ, khách đang làm, dịch vụ sẵn sàng, thợ đang làm) được đặt trong Tickets, không nằm trong Check-in hoặc Booking.

Tickets có hai view nội bộ:

- **Theo khách**: card nhóm như trên, phù hợp lễ tân xử lý một lượt khách và thanh toán gộp.
- **Theo thợ**: cột cho từng thợ đang ca; mỗi service ticket hiện đúng một lần trong cột thợ. Ticket `Anyone` nằm ở cột chưa gán. Đây là phần kế thừa bảng thợ hiện tại.

Yêu cầu `ACCESSQ` của thợ nằm trong Tickets vì đây là hành động nhận dịch vụ đang chờ, không phải hành động check-in. Khi thợ nhận ticket `Anyone`, ticket được gán cho thợ đó và xuất hiện tại cột của họ.

### Vòng đời service ticket (v1: 5 giá trị)

| Trạng thái UI | Giá trị vận hành | Ý nghĩa / hành động kế tiếp |
|---|---|---|
| Chờ | `waiting` | Đã check-in nhưng chưa có thợ, hoặc chờ đến lượt của cùng thợ. |
| Đang làm | `service` | Thợ đã bắt đầu dịch vụ (gán thợ và bắt đầu dịch vụ là cùng một thao tác one-tap, như hiện tại). |
| Sẵn sàng | `ready` | Dịch vụ hoàn thành, chờ các dịch vụ khác hoặc thanh toán. |
| Hoàn tất | `completed` | Đã đưa vào hóa đơn/hoàn tất order. |
| Hủy | `cancelled` | Không thực hiện; không được tính vào tổng còn lại. |

`WAITLIST` cũ có các giá trị `waiting`, `service`, `ready`; việc thêm `completed` và `cancelled` là mở rộng có tương thích ngược. UI phải vẫn hiển thị record cũ chính xác.

**Không thêm giá trị `assigned` trong v1.** Lý do: `fAssign` hiện tại (`pos-phase-1.html:2216, 2269, 2343`) đi thẳng `waiting → service` và bắt đầu đếm giờ `svcAtMs` trong cùng một thao tác one-tap-assign; tách `assigned` ra sẽ đổi cử chỉ chính của lễ tân và ảnh hưởng mọi KPI/timer phụ thuộc (`data-fs-svc`, `busyName`, `freeTechs`, `matchScore`). `assigned` được giữ làm giá trị dự phòng cho tương lai, không triển khai ở phiên bản này.

## Booking

Booking là workspace lịch hẹn trước khi khách tới. Nó dùng shared appointment store hiện tại và service ticket đã chuẩn hóa, với cấu trúc hai subtab kế thừa `2026-07-29-booking-calendar-subtab-design.md` (không phải ba view ngang hàng):

- **Subtab Appointments** (`data-booking-subtab-target="today"`): chứa KPI, filter, và hai view mode:
  | View mode | Đơn vị hiển thị | Mục đích |
  |---|---|---|
  | **Table** | Một hàng là một Booking order | Lễ tân quét danh sách khách, giờ hẹn, tổng tiền, tổng thời lượng và trạng thái. Có thể mở rộng để thấy service ticket. |
  | **Card** | Một card là một Booking order | Theo dõi khách và danh sách dịch vụ-thợ trên màn hình rộng hoặc tablet. |

  Table và Card không được lặp lại khách theo số ticket. Không có view mode `calendar` trong subtab này — giữ nguyên hợp đồng đã kiểm thử tại `pos-phase-1.appointments.test.cjs:45-53`.

- **Subtab Calendar** (`data-booking-subtab-target="calendar"`): một event là một service ticket, dùng team calendar hiện có. Calendar phải tiếp tục render mỗi service ticket thành một event riêng, thợ cùng nối tiếp, thợ khác song song.

POS Booking chỉ có hai subtab (`today`, `calendar`); không thêm subtab `team` vào POS.

Filter Booking gồm: ngày/khoảng ngày, khách/số điện thoại, thợ, và các chip trạng thái: `All`, `Pending`, `Confirmed`, `Checked in`, `Completed`, `No-show` — đúng tập `VALID_STATUSES` (`appointments-store.js:24`). Chip `New` (hiện có) bị loại bỏ vì không map vào status hợp lệ. **Chip `SMS Sent` (hiện có) được giữ lại nhưng là một toggle riêng, không phải chip trạng thái**, vì nó đọc field `smsStatus` độc lập với `status` (`appointments-store.js:179-183`), và các luồng SMS Campaigns hiện đang phụ thuộc field này.

Nút tạo mới mở ticket picker dịch vụ-thợ đã được duyệt: chỉ hiện dropdown sau khi người dùng nhập; dịch vụ có giá và phút; thợ mặc định `Anyone`; danh sách ticket có thể thêm/xóa; tổng giá và tổng phút tính theo tất cả ticket.

## Customers

Vì nav giữ đủ 6 tab, tab Customers **thay thế** phần khách hàng hiện đang nằm trong Management (ghi chú `data-mg-note`, thợ ưa thích `data-mg-pref`, `pos-phase-1.html:3042-3049, 3077-3078`) để tránh có hai màn hình khách trùng lặp. Phần đó được di chuyển, không nhân bản.

Customers là workspace tra cứu trước, không tạo một CRM mới trong phạm vi này. Màn hình gồm tìm theo tên/số điện thoại và hồ sơ khách:

- thông tin liên hệ, ghi chú (di chuyển từ Management), thợ yêu thích (di chuyển từ Management);
- Booking và lịch sử dịch vụ (`CUSTHIST`);
- package, balance và lịch sử thanh toán đang có (`CUSTPKGS`);
- hành động **Check in** và **New booking**, luôn truyền đúng customer hiện tại sang màn hình đích.

Phiên bản đầu không thêm field CRM hoặc backend mới. Các hành động sửa thông tin khách dùng cơ chế hiện có (`data-mg-note`, `data-mg-pref`, chỉ chuyển vị trí DOM/tab, không đổi logic); nếu chưa có cơ chế cho một hành động thì để ngoài phạm vi.

## Quy tắc đồng bộ trạng thái

Booking order và service ticket có hai tầng trạng thái riêng:

- Booking: `pending`, `confirmed`, `checked-in`, `completed`, `no-show`.
- Service ticket vận hành: `waiting`, `service`, `ready`, `completed`, `cancelled` (xem lý do không có `assigned` ở mục Tickets).

Quy tắc bắt buộc:

1. Check-in bất kỳ service ticket nào của booking cập nhật order thành `checked-in`.
2. Check-in lặp lại không tạo operational ticket trùng (so khớp theo `serviceTicketId` trong tập ticket đang mở).
3. Booking chỉ thành `completed` khi mọi service ticket không hủy đã hoàn tất và được đưa vào thanh toán của order. **Quy tắc này chỉ có hiệu lực từ phase 4** (khi `SALES` đã mang `orderId`/`serviceTicketId`) — xem mục Phạm vi triển khai. Ở phase 3, booking giữ nguyên `checked-in` sau khi mọi ticket `ready`/`completed`; UI hiển thị "3/3 dịch vụ sẵn sàng — thanh toán để hoàn tất" thay vì tự chuyển trạng thái.
4. `no-show` chỉ là thao tác chủ động trên booking chưa check-in; không được áp dụng sau khi ticket đã bắt đầu.
5. Hủy một service ticket không hủy cả booking khi còn service ticket khác hoạt động.
6. Booking có nhiều thợ không được dùng `technicianId` của order cha để điều phối; `tickets[].technicianId` là nguồn chính.

### Thanh toán và turn

- Thanh toán mặc định là một hóa đơn gộp theo `orderId`/`bookingId`. Nút Charge chỉ **enable** khi mọi operational ticket đang mở của order ở trạng thái `ready` (ticket `cancelled` không tính); nếu chưa đủ, nút hiển thị tiến độ dạng "2/3 dịch vụ sẵn sàng" và bị disable — thay thế nhánh "hoặc yêu cầu nhân viên xác nhận" mơ hồ của bản đầu, và thay thế guard giỏ hàng rỗng hiện có (`pos-phase-1.html:2294`).
- **Turn: +1 cho mỗi service ticket hoàn tất (không hủy), cộng vào đúng `technicianId` của ticket đó.** Một order 3 dịch vụ với 2 thợ khác nhau cộng Anna +2, Bella +1. Ticket `Anyone` chưa từng được gán thì không cộng turn cho ai. Điều này giữ nguyên bất biến "turn tính lúc thanh toán, không tính lúc gán" đã có (`pos-phase-1.html:2299`), chỉ mở rộng từ 1 tech/order sang N tech/order.
- Tách thanh toán từng dịch vụ không nằm trong phạm vi phiên bản này.

## Mô hình dữ liệu và chuyển đổi

Không tạo store appointment mới. Shared appointment store tiếp tục là nguồn lịch hẹn. `WAITLIST` được mở rộng dần thành operational ticket theo mô hình ở mục "Mô hình operational ticket và độ bền qua reload" phía trên.

## Xử lý lỗi và validation

- Không check-in Booking `completed` hoặc `no-show`.
- Không tạo service ticket nếu chưa có dịch vụ; technician có thể là `Anyone`.
- Không cho cùng `serviceTicketId` tồn tại đồng thời nhiều operational ticket đang mở.
- Khi không tìm thấy technician trong catalog, hiển thị `Chưa gán` và không tự gán sang người khác.
- Nếu một order có dữ liệu ticket cũ/thiếu, hiển thị ticket legacy có tên, giá/thời lượng khả dụng và cho phép nhân viên xử lý, thay vì làm hỏng toàn bộ order.
- Hành động hủy, hoàn tất, gán lại thợ và thanh toán phải cập nhật UI theo ticket cụ thể trước khi cập nhật trạng thái tổng của booking.

## Phạm vi triển khai theo giai đoạn

1. **Vỏ POS và điều hướng**: sáu tab (`check-in`, `tickets`, `booking`, `customers`, `clock`, `management`); đổi `data-pos-panel="dispatch"` thành `"tickets"`; alias URL cũ (`dispatch → tickets`, `appointments → booking`) ghi lại URL chuẩn; cập nhật shared shell NAV (`nexora-shell.js:84-89`) cùng lúc; mở rộng gate mode cho `customers`; `.page-tabs` cuộn ngang trên tablet.
2. **Booking**: đưa workspace Booking chuẩn vào POS với hai subtab Appointments (Table/Card)/Calendar, filter trạng thái + toggle SMS Sent, ticket picker hiện có.
3. **Check-in và Tickets**: liên kết booking-service ticket-operational ticket, chống trùng check-in, rehydrate sau reload, view theo khách/theo thợ và chuyển trạng thái. Booking hoàn tất tự động **chưa có hiệu lực** ở phase này (xem quy tắc 3).
4. **Thanh toán và trạng thái tổng**: liên kết `SALES` với service ticket/order, cộng turn theo từng thợ của ticket, cập nhật `completed` đúng điều kiện.
5. **Customers**: di chuyển phần khách hàng ra khỏi Management, thêm tra cứu hồ sơ và điều hướng có sẵn customer sang Check-in/Booking.

Mỗi giai đoạn giữ UI/handler hiện có hoạt động cho đến khi phần thay thế đã được kiểm thử. Không gộp refactor không liên quan của POS, catalog dịch vụ hoặc backend vào công việc này.

## Kiểm thử và tiêu chí nghiệm thu

### Kiểm thử tự động

- Test chuẩn hóa booking ticket, lập lịch nối tiếp/song song và tương thích booking cũ (đã có trong `appointment-tickets.test.cjs`, giữ nguyên).
- Test chuyển Booking sang Check-in: tạo đúng một operational ticket cho mỗi service ticket, giữ `bookingId`, `serviceTicketId` và technician.
- Test check-in lặp lại không sinh ticket trùng (so khớp trên tập ticket đang mở).
- Test rehydrate: sau reload, mọi booking `checked-in` có đủ operational ticket cho từng service ticket chưa hủy chưa hoàn tất.
- Test chuyển trạng thái service ticket (5 giá trị, không có `assigned`) và điều kiện Booking `completed`/`no-show`.
- Test cộng turn: order N-thợ cộng đúng turn theo từng `technicianId` của ticket khi thanh toán.
- Source-contract test cho: sáu cặp tab/panel mới, alias URL, shared shell NAV parity, chip Booking (bao gồm toggle SMS Sent tách khỏi status chip), Appointments giữ Table/Card không có `calendar` view target, group Tickets theo order và cột theo thợ.
- Chạy toàn bộ test hiện có của POS, Booking, appointment store và catalog sau mỗi giai đoạn.

**Tác động lên test hiện có (phải cập nhật, không được để rơi rớt):**

- `html/pages/pos-phase-1.appointments.test.cjs:94` — literal `TABS` phải cập nhật thành sáu id mới.
- `html/pages/pos-phase-1.appointments.test.cjs:45-53` — phải tiếp tục pass nguyên vẹn; mục Booking của v2 được viết để bảo toàn assertion này, đó chính là mục đích của việc sửa mâu thuẫn view Booking so với bản đầu.

Chạy tối thiểu:

```bash
node --test html/pages/pos-phase-1.appointments.test.cjs html/pages/pos-phase-1.mode.test.cjs
node --test html/assets/appointment-tickets.test.cjs html/assets/appointments-store.test.cjs
node --check html/assets/pos-booking-runtime.js
git diff --check
```

### Kiểm thử thủ công

1. Tạo một booking gồm ba dịch vụ: hai dịch vụ cùng Anna, một dịch vụ của Bella.
2. Xem Calendar (subtab riêng): hai ticket của Anna nối tiếp, ticket Bella song song.
3. Check-in booking: Tickets hiện một card khách gồm đủ ba dịch vụ; board Anna/Bella hiển thị đúng ticket.
4. Reload trang: card khách và phân công thợ vẫn còn nguyên (rehydrate từ booking `checked-in`).
5. Bắt đầu/hoàn tất từng dịch vụ và xác nhận trạng thái group thay đổi đúng.
6. Thanh toán gộp và xác nhận: nút Charge chỉ enable khi đủ 3/3 sẵn sàng; Anna nhận +2 turn, Bella +1 turn; Booking thành `Completed`.
7. Mở link cũ `?tab=dispatch` và `?tab=appointments`; xác nhận lần lượt vào Tickets và Booking, và URL thanh địa chỉ được viết lại thành `?tab=tickets` / `?tab=booking`.
8. Thu hẹp cửa sổ về khổ tablet; xác nhận thanh sáu tab cuộn ngang thay vì vỡ dòng.
9. Vào Customers, thực hiện Check in/New booking từ một hồ sơ khách; xác nhận customer hiện tại được truyền đúng sang màn hình đích, và ghi chú/thợ ưa thích không còn xuất hiện trùng lặp trong Management.

Nghiệm thu khi lễ tân có thể đi từ Booking đến Check-in, theo dõi từng dịch vụ theo thợ tại Tickets, và thanh toán gộp mà không mất liên kết giữa khách, booking, dịch vụ và thợ — kể cả sau khi reload trang.

## Ngoài phạm vi

- Không tạo backend/API mới; không đồng bộ dữ liệu vận hành đa thiết bị.
- Không tách thanh toán theo từng dịch vụ riêng lẻ.
- Không thêm field hoặc mô hình CRM mới ngoài những gì đã liệt kê ở mục Customers.
- Không đổi `html/pages/booking-book-phase-1.html` (giữ là trang Booking Book chuẩn, độc lập).
- Không đổi luồng SMS Campaigns, Time Clock, hoặc cấu hình dịch vụ trong Management, ngoài việc di chuyển phần khách hàng sang Customers.
- Không thêm giá trị trạng thái `assigned` trong phiên bản này (giữ làm dự phòng tương lai).
- Không đổi calendar của trang Booking Book độc lập; chỉ áp dụng cấu trúc subtab Calendar cho POS Booking.
