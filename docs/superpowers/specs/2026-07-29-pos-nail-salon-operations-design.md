# Thiết kế vận hành POS cho tiệm nail

## Trạng thái và mục tiêu

Đặc tả này tổ chức lại `html/pages/pos-phase-1.html` theo công việc thực tế của lễ tân và quản lý tiệm nail. Mục tiêu là tách rõ ba thời điểm của một lượt khách:

```text
Đặt lịch  →  Check-in  →  Làm dịch vụ / thanh toán
 Booking      Check-in         Tickets
```

POS phải hỗ trợ một khách có nhiều dịch vụ, mỗi dịch vụ là một service ticket và được gán cho đúng một thợ hoặc `Anyone`. Các service ticket của cùng thợ chạy nối tiếp; service ticket của các thợ khác có thể chạy song song. Khách vẫn thanh toán gộp theo một order mặc định.

Đặc tả này kế thừa mô hình ticket trong `2026-07-28-appointment-order-tickets-design.md` và workspace Booking trong `2026-07-29-pos-booking-tab-design.md`. Nó quy định cách hai phần đó đi vào vận hành tại quầy; không tạo một mô hình appointment thứ hai.

## Vấn đề của giao diện hiện tại

Tab `Dispatch` hiện chứa KPI, hàng đợi khách tại tiệm, bảng thợ, App/QR check-in, yêu cầu thợ nhận khách và booking sắp đến. Những thành phần này trả lời các câu hỏi khác nhau nên người dùng phải tìm vị trí thao tác thay vì đi theo luồng công việc.

Mặt khác, `BOOKINGS` đã là order cha chứa nhiều ticket dịch vụ, nhưng `WAITLIST` hiện là một dòng dịch vụ chỉ mang một thợ. Luồng check-in từ booking chỉ đưa một dòng vào queue. Nó không lưu liên kết rõ ràng về booking/ticket gốc, không cập nhật Booking sang `Checked in`, và có thể làm mất phân công thợ khi booking có nhiều ticket. Thiết kế mới phải loại bỏ điểm đứt này.

## Thuật ngữ chuẩn

| Thuật ngữ | Ý nghĩa |
|---|---|
| **Booking order** | Đơn hẹn của một khách, chứa thông tin khách, thời gian, ghi chú, nguồn và nhiều service ticket. |
| **Service ticket** | Một dịch vụ cụ thể với giá, thời lượng, thợ và trạng thái thực hiện riêng. Đây là đơn vị lập lịch và vận hành. |
| **Operational ticket** | Bản ghi đang hoạt động trong `WAITLIST` cho đúng một service ticket khi khách đã có mặt. Nó luôn mang liên kết về booking/order nếu có. |
| **Walk-in order** | Order tạo tại tiệm, không có booking trước; cũng gồm một hoặc nhiều service ticket. |
| **Hóa đơn** | Giao dịch thanh toán. Mặc định gom toàn bộ service ticket của một order/khách thành một lần thanh toán. |

Không dùng từ “ticket” để chỉ cả hóa đơn lẫn dịch vụ. Trên UI tiếng Việt, dùng **Dịch vụ** cho service ticket và **Thanh toán** cho hóa đơn.

## Kiến trúc thông tin POS

Thanh điều hướng cấp cao thay thế cách gom `Dispatch` và `Appointments` hiện tại:

```text
Check-in | Tickets | Booking | Customers | Time clock | Management
```

| Khu vực | Người dùng cần trả lời | Nguồn dữ liệu chính |
|---|---|---|
| **Check-in** | Khách nào đã đến và cần đưa vào phục vụ? | `CHECKINQ`, booking trong ngày, khách walk-in |
| **Tickets** | Ai đang chờ/làm/xong, thợ nào đang bận? | `WAITLIST`, `ACCESSQ`, trạng thái ticket, `SALES` |
| **Booking** | Khách nào sẽ đến, khi nào và với thợ nào? | Shared appointment store (`BOOKINGS`) |
| **Customers** | Khách này là ai, từng làm gì, còn package gì? | `CUSTOMERS`, `CUSTHIST`, `CUSTPKGS` |
| **Time clock / Management** | Nhân sự, cấu hình và báo cáo | Các panel hiện có |

Tương thích URL được giữ trong giai đoạn chuyển đổi: `?tab=dispatch` mở `Tickets`; `?tab=appointments` mở `Booking`. URL mới lần lượt là `?tab=check-in`, `?tab=tickets`, `?tab=booking` và `?tab=customers`.

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
- tạo một operational ticket cho từng service ticket chưa được check-in, không tạo một dòng chung;
- sao chép `bookingId`, `serviceTicketId`, `orderId`, service và technician vào operational ticket;
- giữ technician `null` cho `Anyone`, để lễ tân hoặc quản lý gán sau;
- từ chối thao tác nếu service ticket đó đã có operational ticket đang mở.

App/QR và walk-in đi qua cùng một hàm tạo operational ticket. App/QR có thể được ghép với một Booking của cùng khách trước khi xác nhận; nếu không ghép, nó trở thành walk-in order. Điều này tránh hai luồng tạo ticket có quy tắc khác nhau.

## Tickets: vận hành tại tiệm

Tickets chỉ gồm khách đã check-in hoặc walk-in. Mặc định là card theo **khách/order**, còn trạng thái và thao tác nằm ở từng service ticket.

```text
Linda Tran · 10:30 · Checked in
├─ Pedicure       — Anna   — Đang làm
├─ Manicure       — Bella  — Đang làm
└─ Polish         — Anna   — Chờ Anna
Tổng $62 · 120 phút                         [Mở chi tiết]
```

Thanh filter có chip: `Tất cả`, `Chờ`, `Đã gán`, `Đang làm`, `Sẵn sàng`, `Chờ thanh toán`, `Hoàn tất`. Các KPI thuộc vận hành (khách chờ, khách đang làm, dịch vụ sẵn sàng, thợ đang làm) được đặt trong Tickets, không nằm trong Check-in hoặc Booking.

Tickets có hai view nội bộ:

- **Theo khách**: card nhóm như trên, phù hợp lễ tân xử lý một lượt khách và thanh toán gộp.
- **Theo thợ**: cột cho từng thợ đang ca; mỗi service ticket hiện đúng một lần trong cột thợ. Ticket `Anyone` nằm ở cột chưa gán. Đây là phần kế thừa bảng thợ hiện tại.

Yêu cầu `ACCESSQ` của thợ nằm trong Tickets vì đây là hành động nhận dịch vụ đang chờ, không phải hành động check-in. Khi thợ nhận ticket `Anyone`, ticket được gán cho thợ đó và xuất hiện tại cột của họ.

### Vòng đời service ticket

| Trạng thái UI | Giá trị vận hành | Ý nghĩa / hành động kế tiếp |
|---|---|---|
| Chờ | `waiting` | Đã check-in nhưng chưa có thợ, hoặc chờ đến lượt của cùng thợ. |
| Đã gán | `assigned` | Có thợ nhưng chưa bắt đầu. Có thể gộp với `waiting` ở dữ liệu cũ trong giai đoạn chuyển đổi. |
| Đang làm | `service` | Thợ đã bắt đầu dịch vụ. |
| Sẵn sàng | `ready` | Dịch vụ hoàn thành, chờ các dịch vụ khác hoặc thanh toán. |
| Hoàn tất | `completed` | Đã đưa vào hóa đơn/hoàn tất order. |
| Hủy | `cancelled` | Không thực hiện; không được tính vào tổng còn lại. |

`WAITLIST` cũ có các giá trị `waiting`, `service`, `ready`; việc thêm `assigned`, `completed` và `cancelled` là mở rộng có tương thích ngược. UI phải vẫn hiển thị record cũ chính xác.

## Booking

Booking là workspace lịch hẹn trước khi khách tới. Nó dùng shared appointment store hiện tại và service ticket đã chuẩn hóa, với ba cách xem:

| View | Đơn vị hiển thị | Mục đích |
|---|---|---|
| **Table** | Một hàng là một Booking order | Lễ tân quét danh sách khách, giờ hẹn, tổng tiền, tổng thời lượng và trạng thái. Có thể mở rộng để thấy service ticket. |
| **Card** | Một card là một Booking order | Theo dõi khách và danh sách dịch vụ-thợ trên màn hình rộng hoặc tablet. |
| **Calendar** | Một event là một service ticket | Thể hiện chính xác ticket cùng thợ nối tiếp và khác thợ song song. |

Table và Card không được lặp lại khách theo số ticket. Calendar phải tiếp tục render mỗi service ticket thành một event riêng.

Filter Booking gồm: ngày/khoảng ngày, khách/số điện thoại, thợ, và các chip `Tất cả`, `Pending`, `Confirmed`, `Checked in`, `Completed`, `No show`. Chỉ dùng các trạng thái đang có trong appointment store; không thêm chip “New” hoặc trạng thái song song khác.

Nút tạo mới mở ticket picker dịch vụ-thợ đã được duyệt: chỉ hiện dropdown sau khi người dùng nhập; dịch vụ có giá và phút; thợ mặc định `Anyone`; danh sách ticket có thể thêm/xóa; tổng giá và tổng phút tính theo tất cả ticket.

## Customers

Customers là workspace tra cứu trước, không tạo một CRM mới trong phạm vi này. Màn hình gồm tìm theo tên/số điện thoại và hồ sơ khách:

- thông tin liên hệ, ghi chú, thợ yêu thích;
- Booking và lịch sử dịch vụ;
- package, balance và lịch sử thanh toán đang có;
- hành động **Check in** và **New booking**, luôn truyền đúng customer hiện tại sang màn hình đích.

Phiên bản đầu không thêm field CRM hoặc backend mới. Các hành động sửa thông tin khách dùng cơ chế hiện có nếu đã tồn tại; nếu chưa có thì để ngoài phạm vi.

## Quy tắc đồng bộ trạng thái

Booking order và service ticket có hai tầng trạng thái riêng:

- Booking: `pending`, `confirmed`, `checked-in`, `completed`, `no-show`.
- Service ticket vận hành: `waiting`, `assigned`, `service`, `ready`, `completed`, `cancelled`.

Quy tắc bắt buộc:

1. Check-in bất kỳ service ticket nào của booking cập nhật order thành `checked-in`.
2. Check-in lặp lại không tạo operational ticket trùng.
3. Booking chỉ thành `completed` khi mọi service ticket không hủy đã hoàn tất và được đưa vào thanh toán của order.
4. `no-show` chỉ là thao tác chủ động trên booking chưa check-in; không được áp dụng sau khi ticket đã bắt đầu.
5. Hủy một service ticket không hủy cả booking khi còn service ticket khác hoạt động.
6. Booking có nhiều thợ không được dùng `technicianId` của order cha để điều phối; `tickets[].technicianId` là nguồn chính.

Thanh toán mặc định là một hóa đơn gộp theo `orderId`/`bookingId`. UI có thể hiển thị tiến độ “2/3 dịch vụ sẵn sàng”; nút thanh toán gộp chỉ hoàn tất các ticket còn mở theo quy tắc hiện có hoặc yêu cầu nhân viên xác nhận. Tách thanh toán từng dịch vụ không nằm trong phạm vi phiên bản này.

## Mô hình dữ liệu và chuyển đổi

Không tạo store appointment mới. Shared appointment store tiếp tục là nguồn lịch hẹn. `WAITLIST` được mở rộng dần thành operational ticket, tối thiểu có các liên kết sau:

```js
{
  id: 'operational-ticket-id',
  orderId: 'booking-id-hoac-walkin-order-id',
  bookingId: 'booking-id-hoac-null',
  serviceTicketId: 'ticket-id',
  customerId: 'customer-id',
  technicianId: 'tech-id-hoac-null',
  status: 'waiting | assigned | service | ready | completed | cancelled'
}
```

Các field service, giá, thời lượng và snapshot tên thợ/khách vẫn được lưu tại operational ticket để render nhanh và bảo toàn lịch sử. Các record `WAITLIST` cũ không có liên kết được xem là walk-in order độc lập; renderer phải tạo group an toàn từ `id` hiện có thay vì loại bỏ chúng.

`SALES` cần nhận `orderId` và `serviceTicketId` khi checkout để có thể xác định lúc nào một booking hoàn tất. Trong phạm vi prototype hiện tại, dữ liệu vận hành vẫn theo cách lưu của POS hiện có; việc đồng bộ backend đa thiết bị là công việc riêng, không được giả định là đã có.

## Xử lý lỗi và validation

- Không check-in Booking `completed` hoặc `no-show`.
- Không tạo service ticket nếu chưa có dịch vụ; technician có thể là `Anyone`.
- Không cho cùng `serviceTicketId` tồn tại đồng thời nhiều operational ticket mở.
- Khi không tìm thấy technician trong catalog, hiển thị `Chưa gán` và không tự gán sang người khác.
- Nếu một order có dữ liệu ticket cũ/thiếu, hiển thị ticket legacy có tên, giá/thời lượng khả dụng và cho phép nhân viên xử lý, thay vì làm hỏng toàn bộ order.
- Hành động hủy, hoàn tất, gán lại thợ và thanh toán phải cập nhật UI theo ticket cụ thể trước khi cập nhật trạng thái tổng của booking.

## Phạm vi triển khai theo giai đoạn

1. **Vỏ POS và điều hướng**: thêm Check-in, Tickets, Booking, Customers; giữ Time clock/Management; alias URL cũ.
2. **Booking**: đưa workspace Booking chuẩn vào POS với Table/Card/Calendar, filter trạng thái và ticket picker hiện có.
3. **Check-in và Tickets**: liên kết booking-service ticket-operational ticket, chống trùng check-in, view theo khách/theo thợ và chuyển trạng thái.
4. **Thanh toán và trạng thái tổng**: liên kết `SALES` với service ticket/order, cập nhật `completed` đúng điều kiện.
5. **Customers**: tra cứu hồ sơ và điều hướng có sẵn customer sang Check-in/Booking.

Mỗi giai đoạn giữ UI/handler hiện có hoạt động cho đến khi phần thay thế đã được kiểm thử. Không gộp refactor không liên quan của POS, catalog dịch vụ hoặc backend vào công việc này.

## Kiểm thử và tiêu chí nghiệm thu

### Kiểm thử tự động

- Test chuẩn hóa booking ticket, lập lịch nối tiếp/song song và tương thích booking cũ.
- Test chuyển Booking sang Check-in: tạo đúng một operational ticket cho mỗi service ticket, giữ `bookingId`, `serviceTicketId` và technician.
- Test check-in lặp lại không sinh ticket trùng.
- Test chuyển trạng thái service ticket và điều kiện Booking `completed`/`no-show`.
- Source-contract test cho POS tab mới, URL alias, chips Booking, view Table/Card/Calendar, group Tickets theo order và cột theo thợ.
- Chạy toàn bộ test hiện có của POS, Booking, appointment store và catalog sau mỗi giai đoạn.

### Kiểm thử thủ công

1. Tạo một booking gồm ba dịch vụ: hai dịch vụ cùng Anna, một dịch vụ của Bella.
2. Xem Calendar: hai ticket của Anna nối tiếp, ticket Bella song song.
3. Check-in booking: Tickets hiện một card khách gồm đủ ba dịch vụ; board Anna/Bella hiển thị đúng ticket.
4. Bắt đầu/hoàn tất từng dịch vụ và xác nhận trạng thái group thay đổi đúng.
5. Thanh toán gộp và xác nhận Booking thành `Completed` chỉ sau khi mọi ticket không hủy hoàn tất.
6. Mở link cũ `?tab=dispatch` và `?tab=appointments`; xác nhận lần lượt vào Tickets và Booking.

Nghiệm thu khi lễ tân có thể đi từ Booking đến Check-in, theo dõi từng dịch vụ theo thợ tại Tickets và thanh toán gộp mà không mất liên kết giữa khách, booking, dịch vụ và thợ.
