# Thiết kế tích hợp QR cho check-in, tip và thanh toán

**Ngày:** 2026-07-16  
**Phạm vi:** `cutomer-reward.html`, `customer-salon-operations.html` và test tương ứng.  
**Tham chiếu UX:** `html/tip-flow/*` (không dùng làm nguồn dữ liệu hay transaction authority).

**Trạng thái:** Đã chốt để triển khai theo yêu cầu ngày 2026-07-16. Thiết kế này sở hữu `completeServiceTicket`, completed-ticket checkout gate và QR intent routing; các đoạn tương ứng trong reward-entitlements/cross-surface plan cũ chỉ consume contract này, không triển khai lại.

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

1. **Check-in / bắt đầu dịch vụ** — member đã đăng nhập mở form dịch vụ được prefill từ profile; guest tự nhập. Cả hai cùng tạo record service check-in canonical tương thích Operations (collection legacy hiện mang tên `guestCheckins`) rồi mở Live Ticket. Không dùng member quick-checkin `checkins` làm authority cho service/payment.
2. **Tip thợ** — chỉ bật khi QR có `staffProfileId` hợp lệ; prefill đúng business, staff và phương thức đầu tiên staff đã bật.
3. **Thanh toán dịch vụ hoàn tất** — chỉ bật khi local customer state có guest check-in và Operations snapshot có đúng một ticket `completed` cho từng check-in. Nếu có nhiều guest check-in đủ điều kiện, khách chọn ticket theo mã ticket/dịch vụ; mỗi guest check-in vẫn chỉ được có một ticket và không tự chọn “ticket mới nhất”.

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

Trong prototype localStorage, dropdown role chỉ là **bộ mô phỏng actor**, không phải authorization thật. Copy và tài liệu không được tuyên bố đây là bảo mật production. Bản thật phải lấy actor/session, business membership và staff assignment từ backend tin cậy; Front Desk chỉ được thao tác đúng business và Staff chỉ đúng ticket được phân công.

Pay trên Operations và `consumeGuestCheckoutHandoff` đều re-check ticket exact `completed`. UI disabled chỉ là hỗ trợ; domain gate là authority.

### 2.3 Tip từ QR

`prepareTipFromScan` re-parse payload và kiểm tra lại quan hệ business/staff trước khi đổi UI context. Khi gửi, `createTipFromScan` phải re-parse lần nữa và khóa `businessId/staffProfileId` của transaction đúng QR; thay select bằng DevTools không thể đổi recipient. Màn tip dùng `selectedBusinessId`, không hardcode Bitcoin Nail Bar. Chỉ method có trong staff canonical mới được chọn.

Authority retry nằm trong `ui.pendingContext`, không nằm trong URL: `tipEntryIntent = scan | generic`, `tipScanReplayId` và fingerprint exact `{businessId, station, staffProfileId}`. Double-send, reload, lỗi navigation hoặc quét lại cùng QR khi tip scan còn `pending` phải validate unique canonical record cùng amount/method/note rồi trả record đó với `idempotent: true`. Replay ID/context/record sai phải fail closed, không rơi xuống generic. Một QR canonical khác là explicit new scan intent: clear replay pointer của QR cũ, giữ transaction pending cũ làm history và tạo transaction mới chỉ cho exact target mới. Cùng QR chỉ bắt đầu tip mới sau khi tip trước terminal; generic tip phải qua `prepareGenericTipContext`.

V1 hỗ trợ một staff cho mỗi tip. Multi-recipient tip trong `html/tip-flow` được hoãn vì cần batch transaction atomic, payout owner rõ ràng và idempotency chung. Không được ghép nhiều tip bằng URL/client-only state.

Tip tiếp tục là giao dịch độc lập đi thẳng tới staff:

```text
draft UI → pending tip → external payment handoff
→ business/staff confirm (nút demo trong prototype) → points
```

Checkout gratuity vẫn thuộc checkout ticket và được verify cùng receipt; không dùng chung record với standalone staff tip.

### 2.4 Thanh toán từ QR

`listScanCheckoutCandidates` join dữ liệu bằng ID canonical:

- scan context business;
- local `guestCheckins[].id` và `businessId`;
- Operations `serviceTickets[].guestCheckinId`, `businessId`, `status === completed`.

Không join bằng tên hoặc số điện thoại hiển thị. Candidate phải có ticket/guest duy nhất và snapshot Operations canonical. Trước khi mở, domain yêu cầu 4 số cuối trùng phone canonical của guest (hoặc session/profile đã xác thực có đúng phone) để tránh lộ/mở ticket khác trên thiết bị dùng chung. Action phải đọc lại localStorage Operations và revalidate đồng bộ ngay lúc click; V1 không tuyên bố chống được stale/malicious localStorage như backend revision thật. Chọn candidate rồi gọi chung completed-gated checkout handoff, vì vậy add-on import, tip trong bill, proof và receipt không bị nhân đôi logic.

Re-entry theo checkout hiện có:

- chưa có checkout → tạo `draft`;
- `draft` → resume checkout;
- `pending_verification` → mở pending result;
- `confirmed` → mở receipt confirmed;
- `rejected` → mở rejected/retry flow;
- duplicate/tampered artifacts → fail closed, không tạo bản ghi mới.

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
- Ticket đang làm/không tồn tại/duplicate/snapshot không canonical: không tạo checkout.
- Pending add-on: không complete ticket.
- Storage fail: rollback memory/UI theo commit adapter hiện có.
- Double action: domain action idempotent hoặc trả lỗi mà không tạo record thứ hai.
- Thiết bị đăng xuất: scan summary không render tên, phone prefill, điểm hoặc member summary đã lưu; chỉ session/profile phone verified mới xem. Khi OTP làm cùng candidate trở thành owned, last-4 mismatch và `aria-invalid` cũ phải được xóa.

## 6. Acceptance criteria

1. Scan business QR vẫn check-in được.
2. Scan staff QR có CTA Tip và mở màn tip đúng business/staff/method.
3. Scan QR không có staff không được mở tip tùy ý.
4. Ticket `in_service` không mở checkout qua Operations Pay, URL handoff hay Scan Payment.
5. Role simulator Staff/Front Desk hoàn tất ticket canonical; Customer không được hoàn tất trong prototype. Production vẫn cần authorization backend.
6. Add-on `proposed` chặn hoàn tất; accepted/declined cho phép hoàn tất.
7. Ticket `completed` xuất hiện trong selector Scan Payment đúng business và mở checkout hiện có.
8. Tip/payment pending không cộng điểm; confirm/verify mới cộng đúng business, idempotent.
9. Test customer và Operations đều pass; không có Tailwind unknown utility hoặc JS uncaught trong smoke test.

## 7. Ngoài phạm vi V1

- Camera QR thật, backend/webhook, multi-device sync.
- Multi-recipient tip và upload proof riêng cho standalone tip.
- Review entry từ staff QR (developer spec cho phép tip/review) chưa thay đổi trong V1 này; màn Review hiện có vẫn đi từ visit/payment flow.
- Đổi tên/migrate collection legacy `guestCheckins` thành `serviceCheckins`; V1 tái sử dụng collection để member và guest đều vào được Live Ticket.
- Xóa legacy “Pay Salon Direct”; nó vẫn là direct-pay tự do, không phải ticket checkout.
