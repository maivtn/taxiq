# Thiết kế tích hợp QR cho check-in, tip và thanh toán

**Ngày:** 2026-07-16  
**Phạm vi:** `cutomer-reward.html`, `customer-salon-operations.html` và test tương ứng.  
**Tham chiếu UX:** `html/tip-flow/*` (không dùng làm nguồn dữ liệu hay transaction authority).

## 1. Kết quả rà soát

Prototype hiện đã có:

- parser QR production chặt chẽ cho `https://nexoratouch.com/touch/[businessId]/[station]?staffProfileId=...`;
- check-in member/guest, Live Ticket và add-on;
- tip staff dạng `pending → confirmed` với phương thức do staff bật;
- checkout theo ticket, payment proof và receipt;
- trạng thái ticket `completed` trong schema Operations.

Prototype còn thiếu:

- sau khi scan chưa có bộ chọn mục đích check-in / tip / payment;
- QR có staff chưa prefill và khóa đúng staff khi tip;
- Operations chưa có action hoàn tất dịch vụ;
- Pay trên Live Ticket và handoff customer chưa chặn ticket đang `in_service`;
- customer chưa thể tìm và mở đúng ticket đã hoàn tất từ salon QR.

`html/tip-flow` có UX chọn staff, số tiền, hướng dẫn payment và review hữu ích, nhưng không có QR entry thật. Các file này truyền object/amount qua URL, render `innerHTML` từ query, dùng payout account hardcode và tự tuyên bố tip thành công. Vì vậy chỉ tái sử dụng ý tưởng UX, không sao chép cơ chế dữ liệu hoặc xác nhận.

## 2. Quyết định V1

### 2.1 Một QR, nhiều mục đích

QR chỉ xác định context tin cậy `{businessId, station, staffProfileId?}`. Không thêm `intent`, số tiền, payout account hoặc ticket ID vào QR format đã khóa.

Sau khi scan thành công, màn context hiển thị ba hành động:

1. **Check-in / bắt đầu dịch vụ** — giữ luồng member và guest hiện có.
2. **Tip thợ** — chỉ bật khi QR có `staffProfileId` hợp lệ; prefill đúng business, staff và phương thức đầu tiên staff đã bật.
3. **Thanh toán dịch vụ hoàn tất** — chỉ bật khi local customer state có đúng guest check-in và Operations snapshot có đúng một ticket `completed` tương ứng. Nếu có nhiều ticket, khách chọn ticket theo mã ticket/dịch vụ; không tự chọn “ticket mới nhất”.

Không đoán mục đích từ tên `station`. Điều này giữ QR tương thích và tránh mở nhầm giao dịch.

### 2.2 Gate hoàn tất dịch vụ

Lifecycle V1:

```text
QR check-in → Live Ticket (in_service)
→ staff/add-on
→ Staff hoặc Front Desk chọn Hoàn tất dịch vụ
→ ticket completed
→ Pay được bật / QR salon tìm thấy ticket
→ checkout → tip trong bill → payment proof/pending
→ Front Desk verify → receipt + claims/points
```

`completeServiceTicket` phải:

- chỉ nhận ticket canonical `in_service`;
- chặn khi còn add-on `proposed`;
- yêu cầu role `Staff` hoặc `Front Desk`;
- ghi `completedAt` không trước `createdAt` và không trước các event liên quan;
- idempotent khi ticket đã hoàn tất hợp lệ;
- không tạo payment, receipt hoặc điểm.

Pay trên Operations và `consumeGuestCheckoutHandoff` đều re-check ticket exact `completed`. UI disabled chỉ là hỗ trợ; domain gate là authority.

### 2.3 Tip từ QR

`prepareTipFromScan` re-parse payload và kiểm tra lại quan hệ business/staff trước khi đổi UI context. Màn tip dùng `selectedBusinessId`, không hardcode Bitcoin Nail Bar. Chỉ method có trong staff canonical mới được chọn.

V1 hỗ trợ một staff cho mỗi tip. Multi-recipient tip trong `html/tip-flow` được hoãn vì cần batch transaction atomic, payout owner rõ ràng và idempotency chung. Không được ghép nhiều tip bằng URL/client-only state.

Tip tiếp tục là giao dịch độc lập đi thẳng tới staff:

```text
draft UI → pending tip → external payment handoff
→ business/staff confirm → points
```

Checkout gratuity vẫn thuộc checkout ticket và được verify cùng receipt; không dùng chung record với standalone staff tip.

### 2.4 Thanh toán từ QR

`listScanCheckoutCandidates` join dữ liệu bằng ID canonical:

- scan context business;
- local `guestCheckins[].id` và `businessId`;
- Operations `serviceTickets[].guestCheckinId`, `businessId`, `status === completed`.

Không join bằng tên hoặc số điện thoại hiển thị. Candidate phải có ticket/guest duy nhất và snapshot Operations canonical. Chọn candidate rồi gọi chung completed-gated checkout handoff, vì vậy add-on import, tip trong bill, proof và receipt không bị nhân đôi logic.

Khi chưa có candidate, nút Payment bị disable và có lý do nhìn thấy/đọc được: “Dịch vụ phải được tiệm hoàn tất trước khi thanh toán.”

## 3. UI và responsive

- Giữ đúng 31 screen; mở rộng `scan-context-view`, không tạo screen ID mới.
- Mobile giữ bottom navigation và CTA một cột; desktop giữ sidebar, context actions có thể lên lưới 2 cột.
- Button disabled có `disabled`, `aria-disabled` và `aria-describedby`/copy lý do.
- Sau scan focus vào heading context; sau lỗi focus vào alert; action thành công focus theo navigation hiện có.
- Tiếng Việt mặc định, copy động có EN/VI trong registry.
- Camera vẫn là mô phỏng có nhãn rõ; production cần decoder/permission/backend.

## 4. Persistence và ranh giới authority

- Không thêm schema field nếu có thể derive từ `pendingContext.scanContext` và snapshots hiện có.
- Customer sở hữu guest check-in, checkout, proof, receipt và tip.
- Operations sở hữu service ticket, staff eligibility và add-on.
- QR/URL không sở hữu số tiền, payout account, status hay quyền xác nhận.
- NEXORA không giữ tiền. Pending không phát điểm; chỉ callback/confirm mô phỏng hiện có phát ledger.

## 5. Error handling

- QR invalid/cross-business staff: fail closed, không đổi context.
- Staff không có method: Tip disabled và giải thích.
- Ticket đang làm/không tồn tại/duplicate/stale snapshot: không tạo checkout.
- Pending add-on: không complete ticket.
- Storage fail: rollback memory/UI theo commit adapter hiện có.
- Double action: domain action idempotent hoặc trả lỗi mà không tạo record thứ hai.

## 6. Acceptance criteria

1. Scan business QR vẫn check-in được.
2. Scan staff QR có CTA Tip và mở màn tip đúng business/staff/method.
3. Scan QR không có staff không được mở tip tùy ý.
4. Ticket `in_service` không mở checkout qua Operations Pay, URL handoff hay Scan Payment.
5. Staff/Front Desk hoàn tất ticket canonical; Customer không có quyền hoàn tất.
6. Add-on `proposed` chặn hoàn tất; accepted/declined cho phép hoàn tất.
7. Ticket `completed` xuất hiện trong selector Scan Payment đúng business và mở checkout hiện có.
8. Tip/payment pending không cộng điểm; confirm/verify mới cộng đúng business, idempotent.
9. Test customer và Operations đều pass; không có Tailwind unknown utility hoặc JS uncaught trong smoke test.

## 7. Ngoài phạm vi V1

- Camera QR thật, backend/webhook, multi-device sync.
- Multi-recipient tip và upload proof riêng cho standalone tip.
- Hợp nhất toàn bộ member check-in và guest check-in thành một schema service-checkin mới.
- Xóa legacy “Pay Salon Direct”; nó vẫn là direct-pay tự do, không phải ticket checkout.

