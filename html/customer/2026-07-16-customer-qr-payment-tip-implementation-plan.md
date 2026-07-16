# Kế hoạch triển khai QR Payment & Tip cho Customer App

> **Yêu cầu thực thi:** làm tuần tự theo TDD và Subagent-Driven Development; mỗi task có implementer riêng, sau đó spec review và quality review trước khi sang task tiếp theo.

**Mục tiêu:** Biến QR scan thành entry an toàn cho check-in, standalone staff tip và checkout ticket đã hoàn tất, đồng thời bổ sung action hoàn tất dịch vụ trong Operations.

**Kiến trúc:** Giữ QR format hiện có làm context resolver, không nhét transaction data vào URL. Operations là authority cho lifecycle ticket; Customer là authority cho checkout/tip. Mọi đường mở checkout dùng chung domain gate `ticket.status === 'completed'`. Scan context chỉ liệt kê candidate join bằng canonical IDs.

**Công nghệ:** Single-file HTML, Tailwind Browser CDN, Lucide, JavaScript thuần, `localStorage`, Node test runner + VM/DOM harness hiện có.

**Tài liệu thiết kế:** `html/customer/customer-qr-payment-tip-design.md`

---

## Task 1: Operations hoàn tất dịch vụ và khóa Pay theo lifecycle

**Files:**

- Modify: `html/customer/customer-salon-operations.html`
- Modify: `html/customer/customer-salon-operations.test.mjs`

### Bước 1 — Viết test đỏ cho domain completion

Thêm test cho `completeServiceTicket(state, ticketId, now)`:

- Customer role bị từ chối và state không đổi.
- Staff/Front Desk hoàn tất ticket `in_service`, ghi đúng `completedAt`.
- Add-on `proposed` chặn hoàn tất; accepted/declined cho phép.
- Timestamp trước ticket/add-on/eligibility/front-desk event bị từ chối nguyên tử.
- Gọi lại ticket completed hợp lệ là idempotent.
- Unknown/duplicate/corrupt ticket fail closed.

Chạy:

```bash
node --test --test-name-pattern="complete service" html/customer/customer-salon-operations.test.mjs
```

Kỳ vọng: FAIL vì API chưa tồn tại.

### Bước 2 — Viết test đỏ cho UI/action gate

Khóa các contract:

- có nút `complete-service` và action đã đăng ký;
- nút chỉ bật cho Staff/Front Desk khi ticket đang làm và không còn add-on proposed;
- nút Pay disabled khi `in_service`, bật khi `completed` và có disabled reason song ngữ;
- handler Pay tự kiểm tra lifecycle, không chỉ tin trạng thái button;
- persistence fail rollback status/control và báo lỗi.

Chạy cùng pattern, xác nhận FAIL đúng lý do.

### Bước 3 — Implement domain tối thiểu

Trong `customer-salon-operations.html`:

- thêm `completeServiceTicket` bên cạnh các ticket domain action;
- preflight `operationsStateIntegrity`, role, exact ticket, proposed add-on và chronology trước mutation;
- ghi `status: 'completed'`, `completedAt` một lần;
- export trong `NEXORA_OPERATIONS_TEST_API`.

### Bước 4 — Implement UI tối thiểu

- thêm CTA “Hoàn tất dịch vụ / Complete service” trong Live Ticket;
- thêm VI/EN registry copy và disabled reasons;
- thêm `syncLiveTicketControls()` vào render cycle;
- register `complete-service` qua `commitOperations`;
- gate `open-ticket-tab` target `pay` ở handler trước khi route.

### Bước 5 — Verify và commit

```bash
node --test html/customer/customer-salon-operations.test.mjs
git add html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs
git commit -m "feat: complete salon service before checkout"
```

---

## Task 2: Customer completed-ticket gate và scan checkout candidates

**Files:**

- Modify: `html/customer/cutomer-reward.html`
- Modify: `html/customer/cutomer-reward.test.mjs`

### Bước 1 — Viết test đỏ cho handoff gate

Cập nhật fixture handoff thành ticket completed và thêm test:

- `in_service` không tạo checkout, không import add-on, không đổi pending context;
- exact `completed` ticket tạo/reuse checkout;
- re-entry `draft/pending_verification/confirmed/rejected` mở đúng view, không tạo artifact trùng;
- missing/duplicate/cross-business/corrupt Operations snapshot fail closed;
- gate áp dụng khi initialize từ URL và khi gọi domain trực tiếp.

Chạy:

```bash
node --test --test-name-pattern="completed ticket|checkout handoff" html/customer/cutomer-reward.test.mjs
```

Kỳ vọng ban đầu: test `in_service` FAIL vì handoff hiện vẫn mở checkout.

### Bước 2 — Implement common completed gate

- dùng `normalizeOperationsSnapshotForImport` một lần;
- yêu cầu đúng một ticket theo `guestCheckinId`, đúng business, `status === 'completed'` và chronology canonical trước `createCheckoutDraft`;
- truyền normalized snapshot vào import hoặc đảm bảo không có hai logic normalize lệch nhau;
- trả error code riêng `service_not_completed` cho ticket hợp lệ nhưng chưa xong.

### Bước 3 — Viết test đỏ cho scan candidate selector

Thêm pure API `listScanCheckoutCandidates(appState, operationsSnapshot)`:

- QR context business A chỉ thấy completed ticket A thuộc local guest check-in;
- không join bằng name/phone;
- in-service/missing/duplicate/corrupt không được liệt kê;
- kết quả ổn định gồm `guestCheckinId`, `ticketId`, `number`, `serviceKey`, `currentTotalCents`;
- không mutate input.

Thêm `prepareScanCheckout(appState, guestCheckinId, phoneLast4, operationsSnapshot, now)`:

- candidate exact mới được mở checkout;
- yêu cầu 4 số cuối khớp guest canonical, trừ khi session/profile authenticated đã khớp exact phone;
- gọi lại idempotent;
- candidate giả/cross-business không đổi state.

### Bước 4 — Implement domain tối thiểu và export test API

Tái sử dụng parser QR, normalizer Operations và `consumeGuestCheckoutHandoff`; không copy logic tạo checkout/add-on.

### Bước 5 — Verify và commit

```bash
node --test html/customer/cutomer-reward.test.mjs
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: gate scanned checkout on completed tickets"
```

---

## Task 3: Tip đúng staff/business từ QR

**Files:**

- Modify: `html/customer/cutomer-reward.html`
- Modify: `html/customer/cutomer-reward.test.mjs`

### Bước 1 — Viết test đỏ cho `prepareTipFromScan` và `createTipFromScan`

- staff QR canonical prefill exact business/staff và enabled method;
- business-only QR trả `staff_required` và không đổi state;
- cross-business/tampered/stale context fail closed nguyên tử;
- staff không có method trả `method_disabled`;
- selected method được giữ nếu vẫn enabled, nếu không fallback deterministic.
- đổi recipient/business ở UI sau scan vẫn bị `createTipFromScan` từ chối hoặc ghi đúng target QR; transaction không tin select.

### Bước 2 — Viết regression test cho `sendTip`

- `sendTip` lấy `businessId` từ selected canonical staff, không dùng constant;
- recipient khác business hiện tại bị chặn;
- pending không cộng điểm; confirm mới cộng đúng balance như test hiện có.

Chạy:

```bash
node --test --test-name-pattern="tip from scan|selected business" html/customer/cutomer-reward.test.mjs
```

Kỳ vọng: FAIL vì helper chưa tồn tại và `sendTip` đang hardcode business.

### Bước 3 — Implement tối thiểu

- thêm `prepareTipFromScan` cạnh `stageSalonScan`;
- sửa migration selected staff để tôn trọng `selectedBusinessId` thay vì ép Bitcoin Nail Bar;
- render recipient theo staff canonical của selected business;
- thêm `createTipFromScan` re-parse QR ngay lúc tạo; `sendTip` dùng action này khi có scan context và derive/validate staff owner ở entry khác;
- export helper cho test.

### Bước 4 — Verify và commit

```bash
node --test html/customer/cutomer-reward.test.mjs
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: route scanned staff QR to tip"
```

---

## Task 4: Scan intent UI cho check-in, tip và payment

**Files:**

- Modify: `html/customer/cutomer-reward.html`
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/customer-app-developer-spec.md`
- Modify: `html/customer/customer-app-independent-guide.md`

### Bước 1 — Viết UI contract test đỏ

Trong `scan-context-view` yêu cầu:

- giữ action check-in member/guest;
- có `open-scan-tip` và `open-scan-payment` đã đăng ký;
- tip disabled + visible/ARIA reason khi QR không có staff/method;
- payment select chỉ render completed candidates đúng business;
- payment yêu cầu 4 số cuối khi session/profile không sở hữu guest check-in;
- payment disabled + reason khi chưa completed;
- labels/copy VI/EN đều qua registry;
- vẫn đúng 31 screens, mobile bottom nav và desktop sidebar.

### Bước 2 — Implement scan context UI

- đổi copy header từ “check-in only” sang “quét để check-in, tip hoặc thanh toán”;
- thêm intent cards/buttons trong `scan-context-view`, mobile một cột và desktop hai cột;
- render ticket selector bằng DOM API/textContent, không `innerHTML` dữ liệu;
- `open-scan-tip` commit prefill rồi `navigateTo('tip')`;
- `open-scan-payment` commit common checkout helper rồi render checkout `pay`;
- mọi disabled control có `disabled`, `aria-disabled` và copy reason.

### Bước 3 — Cập nhật source-of-truth docs

- ghi rõ QR context router không đoán theo station;
- khóa completed gate cho ticket checkout;
- phân biệt legacy direct pay và ticket checkout;
- ghi prototype camera/payment callback là mô phỏng.

### Bước 4 — Verify và commit

```bash
node --test html/customer/cutomer-reward.test.mjs
node --test html/customer/customer-salon-operations.test.mjs
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs \
  html/customer/customer-app-developer-spec.md html/customer/customer-app-independent-guide.md
git commit -m "feat: add QR intent router for tip and payment"
```

---

## Task 5: Review, browser smoke và bàn giao

**Files:**

- Modify nếu cần: các file trong `html/customer` đã nêu trên

### Bước 1 — Independent code review

Review package phải gồm:

- range commit của bốn task;
- design + acceptance criteria;
- test output;
- danh sách file dirty ngoài scope phải giữ nguyên.

Sửa mọi Critical/Important finding theo TDD và chạy lại suite.

### Bước 2 — Static verification

```bash
node --test html/customer/cutomer-reward.test.mjs
node --test html/customer/customer-salon-operations.test.mjs
rg -n "@apply[^;]*(app-|ops-)" html/customer/*.html
git diff --check
```

### Bước 3 — Browser smoke trên local HTTP

Kịch bản bắt buộc:

1. Mở customer, scan staff QR → Tip đúng staff → pending → confirm.
2. Scan salon QR → guest service check-in → Operations Live Ticket.
3. Thử Pay khi `in_service` → disabled/có lý do.
4. Đổi role Staff/Front Desk → Complete service.
5. Quay customer → scan lại salon QR → chọn completed ticket → checkout.
6. Kiểm tra mobile viewport và desktop viewport; console không uncaught/Tailwind unknown utility.

### Bước 4 — Final status

Xác nhận chỉ file trong `html/customer` được commit; không stage/xóa `html/nexora/*` hoặc `html/tip-flow/*` đang là thay đổi của người dùng.
