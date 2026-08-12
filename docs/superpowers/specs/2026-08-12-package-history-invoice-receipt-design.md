# Package History Invoice and Receipt Design

## 1. Mục đích tài liệu

Tài liệu này tổng hợp yêu cầu cho luồng chứng từ thanh toán tại:

```text
Package Management -> Package History
```

Mục tiêu là tạo một đặc tả duy nhất, rõ ràng trước khi chỉnh sửa HTML, CSS, JavaScript hoặc tạo file PDF mẫu.

## 2. Nguồn tham khảo đã tổng hợp

### 2.1. Tài liệu PDF

- `Invoice-NGAUL6DU-0005.pdf`: mẫu invoice chưa thanh toán, gồm invoice number, ngày phát hành, ngày đến hạn, bên bán, bên mua, số tiền đến hạn, chi tiết sản phẩm, thuế và tổng tiền.
- `Receipt-2124-0705-2137.pdf`: mẫu receipt đã thanh toán, gồm invoice number, receipt number, ngày thanh toán, bên bán, bên mua, chi tiết sản phẩm, thuế, tổng tiền và lịch sử thanh toán.

### 2.2. Ảnh tham khảo

- `Screenshot 2026-08-12 at 17.10.25.png` và `Screenshot 2026-08-11 at 10.56.13 PM.png`: màn tổng quan giao dịch theo phong cách Anthropic, gồm số tiền, ngày thanh toán, hai liên kết `Download invoice` và `Download receipt`, receipt number, invoice number, payment method và chi tiết tổng tiền.
- `Screenshot 2026-08-12 at 17.12.25 1.png`: mẫu NEXORA Invoice ở trạng thái `PAYMENT DUE`, gồm thông tin invoice, seller, bill-to, amount due, due date, payment method/Pay now và bảng line item.
- `Screenshot 2026-08-12 at 17.12.25.png`: mẫu NEXORA Payment receipt ở trạng thái `PAID`, gồm thông tin receipt, seller, bill-to, amount paid, payment method, processor, transaction ID và bảng line item.
- `Screenshot 2026-08-12 at 17.15.00.png`: sơ đồ vị trí entry point, thêm cột hành động ở từng dòng trong `Package History`.
- `Screenshot 2026-08-12 at 17.14.46.png`: sơ đồ billing nhiều loại gói, trong đó một billing record có thể chứa một hoặc nhiều line item và nội dung trang chi tiết thay đổi theo trạng thái thanh toán.
- `Screenshot 2026-08-12 at 17.15.39.png`: mẫu nội dung chi tiết ngắn gọn cho giao dịch đã thanh toán, gồm payment method, bill-to, package, total paid và nhóm hành động chứng từ.

### 2.3. Nguyên tắc sử dụng nguồn tham khảo

- PDF và ảnh chỉ là tham khảo về cấu trúc thông tin và luồng nghiệp vụ.
- Giao diện triển khai phải sử dụng thương hiệu và design system hiện có của NEXORA Touch.
- Không sao chép tên doanh nghiệp, địa chỉ, email, số thẻ hoặc mã chứng từ của Anthropic vào dữ liệu NEXORA.

## 3. Phạm vi được chốt

### 3.1. Trong phạm vi

- Xoá cột hiển thị `Valid Until` khỏi bảng Package History.
- Thêm cột `Action` vào bảng Package History.
- Thêm hành động để mở một trang chi tiết billing riêng cho từng record.
- Trang chi tiết dùng chung một cấu trúc nhưng thay đổi nội dung theo trạng thái thanh toán.
- Hỗ trợ chứng từ đã thanh toán (`Paid`) và chưa thanh toán (`Payment Due`, `Overdue`).
- Cho phép tải invoice PDF.
- Cho phép tải receipt PDF khi giao dịch đã thanh toán.
- Hiển thị tổng quan giao dịch, chi tiết line item, thuế và tổng tiền.
- Giữ giao diện responsive và hỗ trợ bàn phím/screen reader.

### 3.2. Ngoài phạm vi

- Tích hợp backend billing thật.
- Gửi invoice/receipt qua email.
- Resend reminder hoặc resend receipt.
- Tích hợp cổng thanh toán thật.
- Đồng bộ trạng thái thanh toán theo thời gian thực.
- Thay đổi các màn Overview, Subscriptions hoặc AI Voice Plans ngoài phần liên kết cần thiết.
- Thêm chức năng Print riêng; người dùng vẫn có thể in bằng trình duyệt nếu cần.

## 4. Kiến trúc trải nghiệm được đề xuất

### 4.1. Phương án được chọn: một trang billing detail dùng chung

Sử dụng một trang riêng cho tất cả record:

```text
nexora-package-billing-detail.html?transaction=<transaction-id>
```

Trang đọc `transaction-id`, tìm billing record tương ứng và render theo `paymentStatus`.

Lý do chọn:

- Đúng yêu cầu mở một trang riêng thay vì modal/drawer.
- Không nhân đôi markup giữa invoice và receipt.
- Dễ mở rộng cho nhiều loại gói hoặc nhiều line item.
- Giữ URL có thể bookmark, refresh và quay lại từ browser history.

### 4.2. Baseline HTML bắt buộc: `salon.html`

File mới `html/pages/nexora-package-billing-detail.html` phải được tạo từ skeleton của `html/pages/salon.html`, không lấy toàn bộ `nexora-packages.html` làm template.

Các phần phải giữ theo baseline `salon.html`:

- `<!doctype html>` và các meta `charset`, `viewport`.
- Inter font import.
- Shared stylesheet `../assets/nexora-shell.css`.
- Cấu trúc `.shell`.
- Empty `<aside class="sidebar" aria-label="Dashboard sidebar"></aside>` để shared shell render sidebar.
- `.app-area` chứa empty `<header class="header"></header>` và `<main class="content">`.
- Lucide script.
- Shared script `../assets/nexora-shell.js`.

Các thay đổi có chủ đích so với `salon.html`:

- Đổi `lang` thành `en-US` vì nội dung Billing Detail hiển thị bằng tiếng Anh.
- Đổi page title thành `Nexora Touch - Billing Details`.
- Đổi main accessible label thành `Billing details content`.
- Điền nội dung Billing Detail vào bên trong `<main>` thay vì để main rỗng.
- Thêm page-specific stylesheet `../assets/nexora-package-billing-detail.css` sau shared shell CSS.
- Thêm shared billing data và page-specific JavaScript trước shared shell script.
- Khai báo `window.NEXORA_SHELL` với `activePage: 'packages'` và `activeTab: 'history'` trước khi load `nexora-shell.js` để giữ đúng ngữ cảnh Package Management.

Baseline này là một acceptance requirement, không chỉ là gợi ý triển khai.

### 4.3. File boundaries dự kiến

- Create `html/pages/nexora-package-billing-detail.html`: trang mới dựa trên `salon.html`.
- Create `html/assets/nexora-package-billing-detail.css`: style riêng của Billing Detail.
- Create `html/assets/nexora-package-billing-detail.js`: đọc transaction ID, render trạng thái và wire actions.
- Create `html/assets/nexora-package-billing-data.js`: fixture/data contract dùng chung cho Package History và Billing Detail.
- Create `html/pages/nexora-package-billing-detail.test.mjs`: contract test cho baseline shell và nội dung theo trạng thái.
- Modify `html/assets/nexora-packages.js`: dùng shared billing data và render cột Action.
- Modify `html/assets/nexora-packages.css`: bỏ style cell Valid Until, thêm style action/payment status.
- Modify `html/pages/nexora-packages.test.mjs`: cập nhật column order và navigation contract.

### 4.4. Các phương án không chọn

#### Hai trang riêng cho Invoice và Receipt

Ví dụ `invoice.html` và `receipt.html`. Cách này rõ tên route nhưng lặp phần lớn layout, data mapping, responsive CSS và test.

#### Modal hoặc drawer trên Package History

Ít chuyển trang hơn nhưng không đáp ứng quyết định dùng trang riêng, không phù hợp khi nội dung chứng từ dài và khó chia sẻ URL trực tiếp.

## 5. Package History

### 5.1. Cấu trúc cột mới

Thứ tự cột:

1. `Date & time`
2. `Amount`
3. `Package`
4. `Term`
5. `Status`
6. `Transaction ID`
7. `Action`

Thay đổi so với hiện tại:

- Bỏ header và cell `Valid Until`.
- Thêm header và cell `Action` ở cuối mỗi dòng.
- Không hiển thị ngày hết hạn trong bảng billing history.
- Ngày kết thúc gói vẫn có thể được giữ trong data nếu màn quản lý package đang sở hữu cần dùng.

### 5.2. Ý nghĩa của Status

Package History là lịch sử billing, vì vậy `Status` phản ánh trạng thái thanh toán, không phản ánh trạng thái sử dụng gói.

| Giá trị dữ liệu | Nhãn hiển thị | Màu | Ý nghĩa |
| --- | --- | --- | --- |
| `paid` | `Paid` | Xanh lá | Giao dịch đã được thanh toán |
| `payment_due` | `Payment due` | Vàng/cam | Invoice còn trong hạn nhưng chưa thanh toán |
| `overdue` | `Overdue` | Đỏ | Invoice đã quá hạn và chưa thanh toán |

`Active/Expired` tiếp tục thuộc ngữ cảnh package ownership/entitlement, không dùng làm billing status trong Package History.

### 5.3. Hành động theo trạng thái

| Status | Nhãn nút trong bảng | Trang đích |
| --- | --- | --- |
| `Paid` | `View invoice` | Billing detail ở chế độ paid/receipt |
| `Payment due` | `Payment details` | Billing detail ở chế độ invoice |
| `Overdue` | `Payment details` | Billing detail ở chế độ overdue invoice |

Tên `View invoice` được giữ cho giao dịch đã thanh toán theo yêu cầu ban đầu. Trang đích vẫn là tổng quan billing record và cung cấp cả invoice lẫn receipt.

### 5.4. Responsive

- Desktop: hiển thị bảng đầy đủ bảy cột.
- Mobile: mỗi dòng chuyển thành card/key-value layout thông qua `data-label` hiện có.
- Nút hành động phải chiếm đủ chiều rộng trên mobile và có vùng bấm tối thiểu 44 px.

## 6. Trang Billing Detail

### 6.1. Khung trang chung

Trang bắt đầu từ skeleton `salon.html`, sử dụng NEXORA shell hiện có và gồm:

- Tiêu đề trang: `Billing details`.
- Back link: `Back to Package History`, trở về `nexora-packages.html?tab=history`.
- Khối tổng quan giao dịch ở đầu trang.
- Khối chi tiết chứng từ ở dưới.
- Trạng thái billing hiển thị rõ bằng badge.

Không sử dụng modal hoặc drawer.

### 6.2. Chế độ Paid/Receipt

#### Khối tổng quan

Hiển thị:

- `Receipt from NEXORA Touch`.
- Tổng tiền đã thanh toán.
- Ngày và giờ thanh toán.
- Action `Download invoice`.
- Action `Download receipt`.
- Receipt number.
- Invoice number.
- Payment method đã mask, ví dụ `Visa - 4242`.
- Processor nếu có, ví dụ `Stripe`.
- Transaction ID.

#### Khối chi tiết

Hiển thị:

- Tiêu đề `Receipt #<receipt-number>`.
- Service/billing period.
- Danh sách line item gồm description, quantity và amount.
- Subtotal.
- Total excluding tax.
- Tax label/rate và tax amount.
- Total.
- Amount paid.
- Support link hoặc support email của NEXORA Touch.

#### Download

- `Download invoice` tải invoice gốc của billing record.
- `Download receipt` tải bằng chứng thanh toán của billing record.
- Cả hai là file PDF thật, không tải HTML đổi đuôi thành `.pdf`.

### 6.3. Chế độ Payment Due/Invoice

#### Khối tổng quan

Hiển thị:

- `Invoice from NEXORA Touch`.
- Tổng tiền cần thanh toán.
- Date of issue.
- Due date.
- Invoice number.
- Action `Download invoice`.
- Action chính `Pay now`.
- Không hiển thị receipt number hoặc `Download receipt` vì chưa có thanh toán thành công.

#### Khối chi tiết

Hiển thị:

- Tiêu đề `Invoice #<invoice-number>`.
- Seller: NEXORA Touch.
- Bill to: thông tin salon.
- Service/billing period.
- Danh sách line item gồm description, quantity và amount.
- Subtotal.
- Total excluding tax.
- Tax label/rate và tax amount.
- Total.
- Amount due.

#### Pay now

- Prototype mở payment UI theo pattern thanh toán hiện có của Package Management.
- Không kết nối payment gateway thật.
- Sau một thanh toán thành công trong hệ thống thật, trạng thái chuyển sang `Paid`, receipt number được tạo và trang detail render chế độ Paid/Receipt.

### 6.4. Chế độ Overdue

Giống chế độ Payment Due, ngoại trừ:

- Badge là `Overdue` màu đỏ.
- Hiển thị thông báo invoice đã quá hạn.
- `Pay now` vẫn là action chính.
- Invoice PDF vẫn có thể tải.

## 7. Nội dung PDF

### 7.1. Invoice PDF

Invoice PDF gồm:

- NEXORA Touch branding.
- Tiêu đề `Invoice`.
- Invoice number.
- Date of issue.
- Due date.
- Seller legal/contact information.
- Bill-to information.
- Amount due.
- Line items: description, service period, quantity, unit price, tax và amount.
- Subtotal, total excluding tax, tax, total và amount due.
- Page number.

### 7.2. Receipt PDF

Receipt PDF gồm:

- NEXORA Touch branding.
- Tiêu đề `Receipt`.
- Invoice number.
- Receipt number.
- Date paid.
- Seller legal/contact information.
- Bill-to information.
- Amount paid.
- Line items và tổng tiền giống invoice.
- Payment history: payment method, payment date, amount paid và receipt number.
- Page number.

### 7.3. Quy tắc file download

Tên file:

```text
Invoice-<invoice-number>.pdf
Receipt-<receipt-number>.pdf
```

Trong prototype, các PDF NEXORA được tạo sẵn từ cùng fixture data mà trang detail sử dụng. Cách này đảm bảo nút download tải file PDF thật và nội dung khớp với record được chọn.

## 8. Data contract

Một billing record hỗ trợ cấu trúc logic sau:

```js
{
  transactionId,
  paymentStatus,
  invoiceNumber,
  receiptNumber,
  dateIssued,
  dateDue,
  datePaid,
  currency,
  seller,
  billTo,
  paymentMethod,
  processor,
  processorTransactionId,
  lineItems,
  subtotal,
  taxLabel,
  taxRate,
  taxAmount,
  total,
  billingTerm,
  invoiceFile,
  receiptFile
}
```

Quy tắc:

- `seller` gồm `name`, `legalName`, `addressLines`, `email`; `billTo` gồm `name`, `addressLines`, `email` để UI và PDF dùng chung thông tin pháp lý/liên hệ.
- `receiptNumber`, `datePaid`, `paymentMethod` và `processor` chỉ bắt buộc khi `paymentStatus === 'paid'`.
- `transactionId` là mã record dùng ở Package History/URL; `processorTransactionId` là mã đối soát riêng của cổng thanh toán.
- `dateDue` bắt buộc với `payment_due` và `overdue`.
- `lineItems` là mảng để hỗ trợ một hoặc nhiều loại gói/add-on trong cùng billing record.
- `total = subtotal + taxAmount`.
- Amount hiển thị theo currency của record; fixture hiện tại dùng USD.
- Transaction ID trong URL phải được encode trước khi điều hướng và escape trước khi render.

## 9. Luồng nghiệp vụ

```text
Package History
  -> chọn action của billing record
  -> mở Billing Detail theo transaction ID
  -> đọc paymentStatus
      -> Paid: hiển thị Receipt + tải Invoice/Receipt
      -> Payment Due: hiển thị Invoice + Pay now + tải Invoice
      -> Overdue: hiển thị Invoice quá hạn + Pay now + tải Invoice
```

Sau khi thanh toán thành công trong sản phẩm thật:

```text
Payment Due/Overdue
  -> Paid
  -> tạo receipt number
  -> lưu payment method + processor transaction ID
  -> cho phép tải receipt
```

## 10. Trạng thái lỗi và an toàn

### 10.1. Transaction không tồn tại

- Hiển thị empty/error state `Billing record not found`.
- Cung cấp link quay lại Package History.
- Không render dữ liệu mặc định của record khác.

### 10.2. PDF không khả dụng

- Disable action download tương ứng.
- Hiển thị thông báo ngắn `Document is not available yet`.
- Không tạo file giả có phần mở rộng `.pdf`.

### 10.3. Thiếu dữ liệu tuỳ trạng thái

- Không hiển thị receipt action nếu receipt chưa tồn tại.
- Không hiển thị raw `undefined`, `null` hoặc placeholder kỹ thuật.
- Dữ liệu đưa vào HTML phải được escape.

## 11. Accessibility

- Link/nút action có accessible name chứa loại chứng từ và mã tương ứng.
- Badge không chỉ dựa vào màu; luôn có text `Paid`, `Payment due` hoặc `Overdue`.
- Back link, download actions và Pay now có focus state rõ ràng.
- Dialog Pay now giữ focus bên trong, đặt shell nền ở trạng thái `inert`, hỗ trợ `Escape` và trả focus về nút mở khi đóng.
- Bảng line item dùng semantic table với header scope phù hợp.
- Tổng tiền được đặt sau line item trong DOM để screen reader đọc theo thứ tự logic.
- Trang có một `h1`; các card dùng heading level kế tiếp đúng thứ tự.

## 12. Kiểm thử bắt buộc

### 12.1. Package History

- Không còn header/cell `Valid Until`.
- Cột theo đúng thứ tự mới và có `Action`.
- Mỗi row có action phù hợp với payment status.
- URL action chứa đúng transaction ID.
- Mobile labels khớp với header.

### 12.2. Billing Detail

- HTML mới giữ đúng `.shell`, empty sidebar, `.app-area`, empty header và shared assets từ `salon.html`.
- HTML khai báo package shell context với `activePage: 'packages'` và `activeTab: 'history'`.
- Transaction `paid` render receipt overview và hai download actions.
- Transaction `payment_due` render invoice overview, Pay now và chỉ download invoice.
- Transaction `overdue` render badge/thông báo overdue.
- Không tìm thấy transaction render error state.
- Back link trở về đúng Package History tab.

### 12.3. Download

- Filename đúng convention.
- File có MIME type PDF.
- File mở được và nội dung khớp invoice/receipt number, amount và line item của record.
- Receipt không thể tải đối với record chưa thanh toán.

### 12.4. Regression

- Tabs Package Management vẫn hoạt động.
- Overview package và countdown không bị thay đổi.
- Payment modal hiện tại vẫn hoạt động cho luồng chọn/mua plan.
- Focus và Escape handling của các modal hiện tại không bị ảnh hưởng.

## 13. Acceptance criteria

Hoàn thành khi tất cả điều kiện sau đúng:

1. Package History không hiển thị `Valid Until`.
2. Package History có cột `Action` và điều hướng được bằng transaction ID.
3. Billing Detail là HTML mới dựa trên skeleton `salon.html` và là trang riêng, không phải modal/drawer.
4. Paid record hiển thị receipt overview và tải được cả invoice lẫn receipt PDF.
5. Unpaid/overdue record hiển thị invoice overview, amount due, due date và Pay now.
6. Receipt action không xuất hiện trước khi thanh toán thành công.
7. Trang và PDF dùng dữ liệu NEXORA, không dùng dữ liệu nhận diện từ file Anthropic tham khảo.
8. Layout hoạt động trên desktop và mobile.
9. Test Package Management và test mới cho Billing Detail đều pass.
10. PDF được render/kiểm tra trực quan, không có chữ cắt, chồng lấn hoặc sai tổng tiền.

## 14. Thứ tự triển khai sau khi tài liệu được duyệt

1. Viết implementation plan chi tiết.
2. Thêm test thất bại cho Package History và Billing Detail.
3. Chuẩn hoá billing fixture/data contract.
4. Chỉnh Package History.
5. Tạo trang Billing Detail từ `salon.html` và thêm assets riêng.
6. Tạo PDF NEXORA mẫu từ cùng fixture data.
7. Kết nối download actions.
8. Chạy test, render trang/PDF và kiểm tra responsive.

## 15. Print layout and billing terminology addendum

Approved on August 12, 2026:

- Rename the user-facing `Package History` tab and back-link copy to `Billing History`; keep the internal URL key `tab=history` for backward compatibility.
- Downloaded invoice and receipt PDFs use ISO A4 portrait (`595.28 x 841.89 pt`).
- Browser printing from Billing Detail uses A4 portrait through `@page` and a dedicated `@media print` layout.
- Printed Billing Detail hides application chrome, navigation, download/payment controls, dialog UI, decorative shadows, and the back link.
- Printed content uses the full A4 content width with stable margins, a legible table, and black/dark text on white.
- Summary, line-item rows, total rows, and the document heading must not split internally. The full document may continue to another page when content is longer than one page.
- Print verification must cover paid and payment-due records, confirm A4 page size, and inspect every rendered page for clipping, overlap, or orphaned totals.

### Considered approaches

1. Dedicated print CSS on Billing Detail plus A4 ReportLab output (selected): keeps browser print and downloads consistent without duplicating the page or data flow.
2. A separate print-only HTML page: offers isolation but duplicates rendering and routing logic.
3. Redirect Print to the downloadable PDF: avoids browser print CSS but does not satisfy the requirement that Ctrl/Cmd+P work directly from Billing Detail.
