# Customer Booking Page Design

**Ngày:** 22/07/2026  
**Trạng thái:** Đã chốt để triển khai  
**Phạm vi:** `html/customer/booking.html` và test standalone của page

## Mục tiêu

Tạo một trang booking độc lập cho khách đặt nhiều dịch vụ tại Bitcoin Nail Bar. Trang giữ ngôn ngữ hình ảnh mềm, sáng, mobile-first của các screenshot tham khảo nhưng đổi CTA “Check me in” thành booking và bổ sung ngày/giờ.

## Phạm vi hành vi

1. Khách nhập số điện thoại ở bước đầu.
2. Nếu số điện thoại khớp khách quen trong dữ liệu demo, page tự điền tên và hiển thị lời chào nhận diện khách.
3. Nếu là khách mới, page yêu cầu nhập tên.
4. Checkbox nhận thông báo SMS là tùy chọn và mặc định bỏ chọn.
5. Khách chọn một hoặc nhiều dịch vụ; mỗi service có giá và thời lượng demo.
6. Khách chọn “Bất kỳ thợ nào” hoặc một thợ cụ thể. Chỉ các thợ phù hợp với dịch vụ đã chọn mới được chọn; trạng thái busy/unavailable được hiển thị bằng text.
7. Khách chọn ngày và giờ còn trống.
8. CTA booking chỉ bật khi phone hợp lệ, có tên hợp lệ, có ít nhất một service, đã chọn thợ và ngày/giờ.
9. Bước review hiển thị toàn bộ dịch vụ, tổng giá, tổng thời lượng, thợ, ngày/giờ, tên khách và lựa chọn thông báo.
10. Gửi booking lưu request vào `localStorage` và hiển thị màn hình thành công với mã booking. Đây là booking request demo, không tích hợp backend/SMS thật.
11. Reload giữ draft hiện tại; reset draft xóa draft và request demo của flow này.

## UI/visual direction

- Nền gradient lavender rất nhạt, card trắng bo góc lớn, border và shadow nhẹ.
- Header có icon móng tay, tên tiệm, mô tả ngắn.
- Step indicator 1–4 cho Phone & info, Services, Date & tech, Review.
- Service cards dùng grid responsive; selected state viền pink và nền pink nhạt.
- Technician cards có avatar initials/emoji, nhãn available/busy và lựa chọn “Bất kỳ thợ nào”.
- Ngày/giờ dùng chip/card dễ bấm trên mobile.
- CTA chính full-width ở cuối card với gradient pink–purple; mobile có sticky footer để luôn nhìn thấy action.
- Có aria-label/aria-pressed, focus-visible, label rõ ràng và thông báo lỗi bằng text.

## Data/runtime boundary

Page standalone dùng `BOOKING_STORAGE_KEY = 'nexora.customer.booking.page.v1'` và chỉ có dữ liệu demo local trong file. Runtime state gồm:

```js
{
  step: 1 | 2 | 3 | 4 | 5,
  customer: { phone: string, name: string, isReturning: boolean, smsOptIn: boolean },
  selectedServiceIds: string[],
  selectedStaffId: string,
  selectedDate: string,
  selectedTime: string,
  note: string,
  booking: object | null
}
```

Pure functions exposed through `window.NEXORA_BOOKING_TEST_API` when `window.NEXORA_BOOKING_SKIP_INIT` is set:

- `normalizePhone(value)` — giữ chữ số, bỏ format thừa.
- `findCustomerByPhone(phone, customers)` — trả về khách quen hoặc `null`.
- `toggleSelection(ids, id)` — toggle một service, không làm mất service khác.
- `calculateBookingTotal(serviceIds, services)` — trả về `{ totalCents, durationMinutes }`.
- `validateBookingDraft(draft, catalog)` — trả về `{ ok, errors }`.
- `createBookingRequest(draft, catalog, now, id)` — tạo record booking canonical hoặc lỗi validation.

## Error handling

- Phone không đủ 10 chữ số: hiển thị lỗi ngay dưới input.
- Khách mới để trống tên: không cho qua bước tiếp theo.
- Không có service hoặc không có slot: CTA disabled và có helper text.
- Nếu localStorage lỗi/JSON hỏng: dùng state mặc định, không làm page crash.
- Nếu booking tạo trùng ID trong storage: giữ request cũ và tạo ID mới trong lần submit tiếp theo.

## Testing

Test Node built-in (`node:test`) sẽ load script runtime từ HTML bằng `vm` và kiểm tra:

- phone normalization và nhận diện khách quen;
- toggle nhiều service và tổng tiền/thời lượng;
- validation thiếu các trường bắt buộc;
- create booking request lưu đủ customer, services, staff/date/time và smsOptIn;
- HTML có các control UI chính, CTA booking và không còn chữ “Check me in”.

## Không thuộc phạm vi

- Backend/API, availability realtime, đăng nhập, OTP, thanh toán.
- Gửi SMS thật; checkbox chỉ lưu consent trong booking request demo.
- Đồng bộ vào `cutomer-reward.html` hoặc `customer-salon-operations.html`.
