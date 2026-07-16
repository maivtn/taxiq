# Customer Task 5 Blocking Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm cho service check-in và tip từ QR retry an toàn, đồng thời không lộ dữ liệu hồ sơ ở màn scan khi người dùng chưa xác thực.

**Architecture:** Giữ authority trong localStorage và domain state hiện có, không đưa transaction authority vào URL. Service check-in dùng exact-semantic replay trong cửa sổ 120 phút; tip từ QR giữ explicit entry intent và ID transaction đã tạo để replay đúng record; scan summary chỉ đọc dữ liệu thành viên khi session và profile phone khớp nhau.

**Tech Stack:** HTML mobile-first, Tailwind browser runtime, JavaScript thuần, Node.js `node:test`, localStorage.

## Global Constraints

- Chỉ sửa file trong `html/customer`.
- Không chạm hoặc stage thay đổi người dùng trong `html/pages`.
- Mỗi thay đổi production phải có test đỏ trước và test xanh sau.
- Không thêm URL transaction authority.
- Chạy full customer suite, Operations suite, `git diff --check` và guard `@apply` trước commit.

---

### Task 1: Idempotent service check-in retry

**Files:**
- Modify: `html/customer/cutomer-reward.html`
- Test: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/customer-app-developer-spec.md`
- Modify: `html/customer/customer-app-independent-guide.md`

**Interfaces:**
- Consumes: `createGuestCheckin(appState, input, now)`, `CHECKIN_WINDOW_MS`, `normalizeGuestCheckin`.
- Produces: `{ ok: true, guestCheckin, idempotent: true }` cho một exact replay canonical trong 120 phút; `{ ok: false, code: 'ambiguous_guest_checkin' }` cho replay mơ hồ/hỏng.

- [x] Viết domain tests cho exact retry, ambiguous/corrupt fail-closed, service khác trong cửa sổ và cùng service ngoài cửa sổ.
- [x] Chạy targeted tests và xác nhận duplicate hiện tại làm test thất bại.
- [x] Thêm preflight exact semantic trước UUID/mutation; reuse record duy nhất và cập nhật pending ID.
- [x] Viết action tests cho double-submit và retry sau navigation failure cùng route lại một guest ID.
- [x] Chạy targeted tests đến khi pass.

### Task 2: Persistent scan-tip replay authority

**Files:**
- Modify: `html/customer/cutomer-reward.html`
- Test: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/customer-app-developer-spec.md`
- Modify: `html/customer/customer-app-independent-guide.md`

**Interfaces:**
- Consumes: `prepareTipFromScan`, `prepareGenericTipContext`, `createTipFromScan`, `sendTip`.
- Produces: `ui.pendingContext.tipEntryIntent` (`generic | scan`) và `tipScanReplayId`; exact scan replay trả cùng tip với `idempotent: true`.

- [x] Viết domain/action tests cho double invoke, save/reload/same-QR replay, different-QR replacement, atomic validation của full replay bundle/context-swap, terminal prior tip và explicit switch sang generic.
- [x] Chạy targeted tests và xác nhận retry hiện tạo generic tip thứ hai hoặc bị mất scan authority.
- [x] Persist explicit intent/replay ID; validate unique canonical pending tip và exact amount/method/note/QR target trước khi replay.
- [x] Giữ scan intent fail-closed khi replay context thiếu/hỏng; `prepareGenericTipContext` là thao tác duy nhất chuyển sang generic.
- [x] Chạy targeted tests đến khi pass.

### Task 3: Signed-out scan privacy and OTP ownership cleanup

**Files:**
- Modify: `html/customer/cutomer-reward.html`
- Test: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/customer-app-developer-spec.md`
- Modify: `html/customer/customer-app-independent-guide.md`

**Interfaces:**
- Consumes: `renderScanContext`, `syncScanPaymentOwnership`, `setLanguage`.
- Produces: localized signed-out placeholders; verified-only member summary; stale last-4 error cleared when candidate becomes owned.

- [x] Viết DOM test VI/EN/logout với retained name, phone và balance; xác nhận dữ liệu hiện đang bị lộ.
- [x] Viết test candidate same-identity trở thành owned sau OTP; xác nhận stale error hiện còn lại.
- [x] Render private member fields chỉ khi authenticated session phone khớp profile phone; xóa retained member prefill khỏi guest inputs; thêm copy VI/EN.
- [x] Clear scan payment error code/UI khi candidate owned hoặc biến mất.
- [x] Chạy targeted tests đến khi pass.

### Task 4: Documentation and final verification

**Files:**
- Modify: `html/customer/customer-app-developer-spec.md`
- Modify: `html/customer/customer-app-independent-guide.md`
- Modify if relevant: `html/customer/customer-qr-payment-tip-design.md`

- [x] Ghi rõ exact replay window 120 phút, scan-tip intent/replay persistence và signed-out privacy.
- [x] Chạy `node --test html/customer/cutomer-reward.test.mjs`.
- [x] Chạy `node --test html/customer/customer-salon-operations.test.mjs`.
- [x] Chạy `git diff --check -- html/customer` và guard không có `@apply app-*`/`ops-*`.
- [x] Stage chỉ file `html/customer`, kiểm tra cached diff rồi commit.
