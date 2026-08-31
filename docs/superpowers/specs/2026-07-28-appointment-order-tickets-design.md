# Thiết kế Order và Ticket cho Appointment

## Mục tiêu

Thiết kế lại phần chọn dịch vụ trong Booking Book và POS Appointments để một order có thể chứa nhiều ticket dịch vụ, mỗi ticket gắn với một thợ và được đặt đúng cột của thợ đó trên calendar.

## Luồng sử dụng

1. Người dùng nhập tên dịch vụ vào ô tìm kiếm dịch vụ.
2. Dropdown hiển thị các dịch vụ khớp từ khóa, kèm category, giá và thời lượng.
3. Người dùng nhập tên thợ vào ô tìm kiếm thợ. Giá trị mặc định của thợ là `Anyone`.
4. Người dùng bấm `Add` để tạo một ticket gồm dịch vụ và thợ đã chọn.
5. Các ticket đã thêm hiển thị bên dưới, mỗi dòng có thể xóa:

   ```text
   DIP POWDER — Lan T.       [xóa]
   CHROME — Kim N.           [xóa]
   PEDICURE — Lan T.         [xóa]
   NAIL ART — Anyone         [xóa]
   ```

6. Tổng tiền và tổng thời lượng bên dưới được tính từ tất cả ticket.

## Mô hình Order và Ticket

Appointment/order hiện tại tiếp tục là bản ghi cha, chứa thông tin khách hàng, số điện thoại, ngày giờ, ghi chú, trạng thái và nguồn tạo. Bản ghi cha có thêm mảng `tickets`. Mỗi ticket có cấu trúc:

```js
{
  id: 'ticket-<stable-id>',
  serviceId: '<catalog-service-id>',
  serviceName: 'DIP POWDER',
  price: 52,
  durationMin: 60,
  technicianId: '<technician-id-or-null>',
  technicianName: 'Lan T.',
  startAt: '2026-07-28T10:00:00',
  endAt: '2026-07-28T11:00:00',
  status: 'confirmed'
}
```

`technicianId: null` và `technicianName: 'Anyone'` đại diện cho ticket chưa gán thợ cụ thể. Các field cũ `serviceNames`, `serviceDetails` và `technicianId` ở order cha vẫn được lưu để tương thích với appointment cũ và các màn hình đang dùng shared store. Khi tất cả ticket đều gắn cùng một thợ cụ thể, `technicianId` ở order cha là thợ đó; nếu ticket có nhiều thợ khác nhau hoặc có `Anyone`, dữ liệu ticket là nguồn chính và technician của order cha là unassigned.

## Lập lịch trên Calendar

Mỗi ticket được render thành một event riêng trên calendar, nằm ở cột của technician tương ứng. Việc lập lịch bắt đầu từ thời gian bắt đầu của appointment:

- Các ticket cùng một technician dùng chung một lane cursor và chạy nối tiếp.
- Các ticket khác technician dùng lane cursor độc lập và chạy song song.
- Các ticket `Anyone` dùng chung lane unassigned và chạy nối tiếp với nhau.
- Thời lượng event của mỗi ticket là `durationMin` của ticket đó.
- Khoảng thời gian của order cha trên calendar kéo dài từ thời gian bắt đầu đến thời gian kết thúc muộn nhất của các ticket. Form chỉ hiển thị tổng giá; duration vẫn được giữ trong dữ liệu để calendar phản ánh thời gian thực tế khi các ticket chạy song song.

Khi click bất kỳ ticket event nào, hệ thống mở form của order cha và hiển thị toàn bộ ticket. Khi kéo hoặc resize một ticket, chỉ thời gian của ticket đó được cập nhật và lịch các ticket còn lại được giữ nguyên. Nếu thao tác không thể bảo toàn lịch ticket an toàn, hệ thống từ chối thao tác bằng cảnh báo hiện tại thay vì tự ý thay đổi ticket khác.

## Trạng thái UI và validation

- Kết quả tìm kiếm dịch vụ ẩn khi chưa focus hoặc chưa nhập từ khóa; khi focus với query rỗng, có thể hiển thị toàn bộ catalog.
- Ô tìm kiếm thợ mặc định là `Anyone` và lọc danh sách thợ đang active theo tên.
- Bấm `Add` bắt buộc phải chọn một dịch vụ; technician có thể giữ `Anyone`.
- Một service chỉ được thêm một lần trong cùng order để tránh tạo ticket trùng ngoài ý muốn.
- Khi xóa ticket cuối cùng, form quay về validation hiện tại “pick at least one service”.
- Service legacy/import không còn trong JSON catalog vẫn hiển thị thành ticket có thể xóa, giữ nguyên tên cũ và technician `Anyone`.

## Tương thích và phạm vi

- Dùng JSON catalog đã duyệt tại `html/assets/booking-service-catalog-draft.json` cho tìm kiếm dịch vụ, giá, thời lượng và metadata category.
- Dùng salon catalog hiện tại làm nguồn danh sách technician active và metadata kỹ năng của technician.
- Giữ appointment store hiện tại và chỉ mở rộng normalize khi cần để bảo toàn `tickets` cùng các field cũ.
- Áp dụng cùng interaction và data contract cho Booking Book và POS Appointments.
- Không thay đổi cấu hình service trong POS Management, luồng customer check-in, SMS Campaigns hoặc các màn hình calendar không liên quan.

## Kiểm thử

- Thêm pure test cho normalize ticket, tạo ticket ID ổn định, tính tổng tiền/thời lượng, lập lịch theo lane technician và xử lý record cũ không có `tickets`.
- Thêm source-contract test cho cả hai page, bao gồm search dịch vụ, search technician, Add/remove ticket, payload ticket và render ticket event trên calendar.
- Parse toàn bộ inline script đã sửa bằng Node và chạy test appointment hiện tại của Booking/POS.
- Kiểm tra thủ công URL local chính xác: mở New appointment, tìm service, chọn `Anyone` hoặc technician, Add/remove ticket và xác nhận lịch song song/nối tiếp trên calendar.
