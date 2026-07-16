# Customer Scan Demo Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm ba shortcut Check-in, Payment và Tip dưới camera mô phỏng, luôn mở kịch bản cố định Bitcoin Nail Bar / Anna.

**Architecture:** Bổ sung một state preparer tập trung để thiết lập context demo cố định mà không tạo transaction, sau đó dùng một dispatcher UI nhỏ để mở form/màn hình hiện có. Markup mới chỉ khai báo ba action trong camera view; action registry tiếp tục là điểm điều phối sự kiện duy nhất.

**Tech Stack:** HTML, Tailwind CSS v4 Browser CDN, Lucide Browser, JavaScript thuần, Node.js built-in test runner.

## Global Constraints

- Giữ nguyên dropdown QR salon, “Quét QR salon”, “Nhập mã” và toàn bộ intent router sau khi quét.
- Cả ba shortcut luôn dùng Bitcoin Nail Bar; Tip luôn dùng Anna.
- Shortcut chỉ chuẩn bị context và điều hướng, không tự tạo check-in, tip hoặc payment.
- Payment và tip vẫn là chuyển tiền trực tiếp; NEXORA không giữ tiền và điểm chỉ được cộng sau xác nhận doanh nghiệp.
- Nội dung mới phải có `data-en` và `data-vi`, icon phải dùng Lucide, vùng chạm tối thiểu 44px.
- Chỉ sửa `html/customer/cutomer-reward.html` và `html/customer/cutomer-reward.test.mjs`.

---

### Task 1: Bộ chuẩn bị state cho kịch bản demo cố định

**Files:**
- Modify: `html/customer/cutomer-reward.html:337-365,585-626,9090-9161`
- Test: `html/customer/cutomer-reward.test.mjs` gần các test `stageSalonScan` và `prepareGenericTipContext`

**Interfaces:**
- Consumes: `stageSalonScan(appState, payload)`, `prepareGenericTipContext(appState, input)`, `getValidBusiness(appState, businessId)`.
- Produces: `prepareFixedScanDemo(appState, intent) -> { ok, intent, targetScreen, member?, business, staff? }` và constant nội bộ `FIXED_SCAN_DEMO`.

- [ ] **Step 1: Viết test thất bại cho ba intent cố định**

Thêm test sau vào `html/customer/cutomer-reward.test.mjs`:

```js
test('prepares fixed scan demo intents without creating transactions', () => {
  const { api } = testApi();
  const transactionSnapshot = (app) => JSON.stringify({
    checkins: app.checkins,
    guestCheckins: app.guestCheckins,
    tips: app.tips,
    directPayments: app.directPayments,
    ledger: app.ledger
  });

  const checkinApp = api.createDefaultState();
  checkinApp.ui.selectedBusinessId = 'golden-glow-spa';
  const checkinBefore = transactionSnapshot(checkinApp);
  const checkin = api.prepareFixedScanDemo(checkinApp, 'checkin');
  assert.equal(checkin.ok, true);
  assert.equal(checkin.targetScreen, 'scan');
  assert.equal(checkin.member, true);
  assert.equal(checkinApp.ui.pendingContext.scanContext.businessId, 'bitcoin-nail-bar');
  assert.equal(checkinApp.ui.pendingContext.scanContext.staffProfileId, 'staff-anna');
  assert.equal(transactionSnapshot(checkinApp), checkinBefore);

  const paymentApp = api.createDefaultState();
  paymentApp.ui.selectedBusinessId = 'golden-glow-spa';
  const paymentBefore = transactionSnapshot(paymentApp);
  const payment = api.prepareFixedScanDemo(paymentApp, 'payment');
  assert.equal(payment.ok, true);
  assert.equal(payment.targetScreen, 'pay');
  assert.equal(paymentApp.ui.selectedBusinessId, 'bitcoin-nail-bar');
  assert.equal(paymentApp.ui.payViewIntent, 'direct');
  assert.equal(transactionSnapshot(paymentApp), paymentBefore);

  const tipApp = api.createDefaultState();
  tipApp.ui.selectedBusinessId = 'golden-glow-spa';
  const tipBefore = transactionSnapshot(tipApp);
  const tip = api.prepareFixedScanDemo(tipApp, 'tip');
  assert.equal(tip.ok, true);
  assert.equal(tip.targetScreen, 'tip');
  assert.equal(tipApp.ui.selectedBusinessId, 'bitcoin-nail-bar');
  assert.equal(tipApp.ui.selectedStaffId, 'staff-anna');
  assert.equal(tipApp.ui.pendingContext.tipEntryIntent, 'generic');
  assert.equal(transactionSnapshot(tipApp), tipBefore);

  const invalidApp = api.createDefaultState();
  const invalidBefore = JSON.stringify(invalidApp);
  assert.equal(api.prepareFixedScanDemo(invalidApp, 'unknown').code, 'invalid_demo_intent');
  assert.equal(JSON.stringify(invalidApp), invalidBefore);
});
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `node --test --test-name-pattern="prepares fixed scan demo intents" html/customer/cutomer-reward.test.mjs`

Expected: FAIL với `api.prepareFixedScanDemo is not a function`.

- [ ] **Step 3: Thêm constant và implementation tối thiểu**

Thêm gần `BUSINESS_ID`:

```js
const FIXED_SCAN_DEMO = Object.freeze({
  businessId: BUSINESS_ID,
  staffProfileId: 'staff-anna',
  payload: 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna'
});
```

Thêm sau `prepareGenericTipContext`:

```js
function prepareFixedScanDemo(appState, intent) {
  if (!isRecord(appState?.ui) || !['checkin', 'payment', 'tip'].includes(intent)) {
    return { ok: false, code: 'invalid_demo_intent' };
  }
  if (intent === 'checkin') {
    const staged = stageSalonScan(appState, FIXED_SCAN_DEMO.payload);
    if (!staged.ok) return staged;
    const member = appState.session.authenticated === true
      && /^\d{10}$/.test(appState.session.phone)
      && appState.profile.phone === appState.session.phone;
    return { ...staged, intent, targetScreen: 'scan', member };
  }
  if (intent === 'payment') {
    const business = getValidBusiness(appState, FIXED_SCAN_DEMO.businessId);
    if (!business) return { ok: false, code: 'unknown_business' };
    appState.ui.selectedBusinessId = business.id;
    appState.ui.payViewIntent = 'direct';
    return { ok: true, intent, targetScreen: 'pay', business };
  }
  const prepared = prepareGenericTipContext(appState, {
    businessId: FIXED_SCAN_DEMO.businessId,
    preferredStaffId: FIXED_SCAN_DEMO.staffProfileId
  });
  return prepared.ok
    ? { ...prepared, intent, targetScreen: 'tip' }
    : prepared;
}
```

Thêm `prepareFixedScanDemo` vào `window.NEXORA_TEST_API`.

- [ ] **Step 4: Chạy test và xác nhận GREEN**

Run: `node --test --test-name-pattern="prepares fixed scan demo intents" html/customer/cutomer-reward.test.mjs`

Expected: PASS, không có warning hoặc error.

- [ ] **Step 5: Chạy nhóm test QR/tip/payment liên quan**

Run: `node --test --test-name-pattern="scan|tip|direct payment" html/customer/cutomer-reward.test.mjs`

Expected: tất cả test được chọn PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: prepare fixed customer scan demos"
```

### Task 2: Ba action card và dispatcher điều hướng

**Files:**
- Modify: `html/customer/cutomer-reward.html:190-203,7561-7600,7791-7828`
- Test: `html/customer/cutomer-reward.test.mjs` gần test static scan views tại dòng khoảng 6742

**Interfaces:**
- Consumes: `prepareFixedScanDemo(appState, intent)`, `openServiceCheckinForm(useProfile)`, `renderTipMethods()`, `navigateTo(screenId)`.
- Produces: `openFixedScanDemo(intent)`, actions `simulate-checkin`, `simulate-payment`, `simulate-tip` và ba button tương ứng.

- [ ] **Step 1: Viết test thất bại cho UI, thứ tự và wiring**

Thêm test sau vào `html/customer/cutomer-reward.test.mjs`:

```js
test('shows three fixed demo shortcuts below the scan camera controls', () => {
  const source = html();
  const cameraStart = source.indexOf('id="scan-camera-view"');
  const contextStart = source.indexOf('id="scan-context-view"');
  assert.ok(cameraStart > -1 && contextStart > cameraStart);
  const cameraView = source.slice(cameraStart, contextStart);
  assert.ok(cameraView.indexOf('id="scan-demo-actions-title"') > cameraView.indexOf('data-action="enter-code"'));
  assert.match(cameraView, /id="scan-demo-actions-title"[^>]*data-en="SIMULATE"[^>]*data-vi="MÔ PHỎNG"/);
  assert.deepEqual(
    [...cameraView.matchAll(/data-action="simulate-(checkin|payment|tip)"/g)].map((match) => match[1]),
    ['checkin', 'payment', 'tip']
  );
  for (const [action, en, vi] of [
    ['checkin', 'Check-in', 'Check-in'],
    ['payment', 'Payment', 'Thanh toán'],
    ['tip', 'Tip', 'Tip']
  ]) {
    assert.match(cameraView, new RegExp(`data-action="simulate-${action}"[\\s\\S]*?data-en="${en}"[^>]*data-vi="${vi}"`));
    assert.match(source, new RegExp(`registerAction\\('simulate-${action}', \\(\\) => openFixedScanDemo\\('${action}'\\)\\)`));
  }
});

test('fixed scan demo dispatcher opens existing flows without submitting transactions', () => {
  const source = html();
  const dispatcher = source.match(/function openFixedScanDemo\(intent\)[\s\S]*?registerAction\('simulate-checkin'/)?.[0];
  assert.ok(dispatcher);
  assert.match(dispatcher, /prepareFixedScanDemo\(draft, intent\)/);
  assert.match(dispatcher, /openServiceCheckinForm\(result\.member\)/);
  assert.match(dispatcher, /navigateTo\('pay'\)/);
  assert.match(dispatcher, /renderTipMethods\(\)/);
  assert.match(dispatcher, /navigateTo\('tip'/);
  assert.doesNotMatch(dispatcher, /createGuestCheckin|createTip|createDirectPayment|sendTip|sendPayment/);
});
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `node --test --test-name-pattern="fixed demo shortcuts|fixed scan demo dispatcher" html/customer/cutomer-reward.test.mjs`

Expected: FAIL vì `scan-demo-actions-title` và các action chưa tồn tại.

- [ ] **Step 3: Thêm ba action card dưới nút Nhập mã**

Chèn ngay sau button `data-action="enter-code"` trong `scan-camera-view`:

```html
<section class="mx-auto mt-6 w-full max-w-[360px]" aria-labelledby="scan-demo-actions-title">
  <h2 id="scan-demo-actions-title" class="eyebrow" data-en="SIMULATE" data-vi="MÔ PHỎNG">MÔ PHỎNG</h2>
  <div class="mt-3 grid grid-cols-3 gap-2">
    <button type="button" class="app-card flex min-h-24 flex-col items-center justify-center gap-2 p-3 text-center transition hover:border-app-cyan focus-visible:border-app-cyan" data-action="simulate-checkin"><span class="grid size-9 place-items-center rounded-xl bg-app-cyan/10 text-app-cyan"><i data-lucide="user-round-check" class="size-5" aria-hidden="true"></i></span><span class="text-xs font-black" data-en="Check-in" data-vi="Check-in">Check-in</span></button>
    <button type="button" class="app-card flex min-h-24 flex-col items-center justify-center gap-2 p-3 text-center transition hover:border-app-pink focus-visible:border-app-pink" data-action="simulate-payment"><span class="grid size-9 place-items-center rounded-xl bg-app-purple/10 text-app-pink"><i data-lucide="credit-card" class="size-5" aria-hidden="true"></i></span><span class="text-xs font-black" data-en="Payment" data-vi="Thanh toán">Thanh toán</span></button>
    <button type="button" class="app-card flex min-h-24 flex-col items-center justify-center gap-2 p-3 text-center transition hover:border-app-green focus-visible:border-app-green" data-action="simulate-tip"><span class="grid size-9 place-items-center rounded-xl bg-app-green/10 text-app-green"><i data-lucide="badge-dollar-sign" class="size-5" aria-hidden="true"></i></span><span class="text-xs font-black" data-en="Tip" data-vi="Tip">Tip</span></button>
  </div>
</section>
```

- [ ] **Step 4: Thêm dispatcher và đăng ký action**

Thêm gần các scan actions:

```js
function openFixedScanDemo(intent) {
  const result = commitState((draft) => prepareFixedScanDemo(draft, intent));
  if (!result.ok) {
    showToast(t('scanIntentFailed'), 'error');
    return result;
  }
  if (intent === 'checkin') {
    const opened = openServiceCheckinForm(result.member);
    if (!opened.ok) showToast(t('scanIntentFailed'), 'error');
    return opened;
  }
  if (intent === 'payment') {
    navigateTo('pay');
    return result;
  }
  renderTipMethods();
  navigateTo('tip', { persist: false });
  return result;
}

registerAction('simulate-checkin', () => openFixedScanDemo('checkin'));
registerAction('simulate-payment', () => openFixedScanDemo('payment'));
registerAction('simulate-tip', () => openFixedScanDemo('tip'));
```

- [ ] **Step 5: Chạy test mục tiêu và xác nhận GREEN**

Run: `node --test --test-name-pattern="fixed demo shortcuts|fixed scan demo dispatcher" html/customer/cutomer-reward.test.mjs`

Expected: cả hai test PASS.

- [ ] **Step 6: Chạy toàn bộ test và kiểm tra source**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: toàn bộ test PASS; `git diff --check` không in lỗi.

- [ ] **Step 7: Kiểm tra giao diện mobile**

Run: `python3 -m http.server 4173`

Mở `http://localhost:4173/html/customer/cutomer-reward.html`, chuyển tới tab Scan và kiểm tra ở viewport 432 × 754:

- section MÔ PHỎNG nằm dưới “Nhập mã”;
- ba action nằm cùng một hàng, không tràn ngang, không cắt nhãn;
- Check-in mở form dịch vụ đã điền Jessica/Anna;
- Payment mở màn thanh toán Bitcoin Nail Bar;
- Tip mở màn tip cho Anna;
- đổi dropdown sang Golden Glow Spa không làm thay đổi kịch bản cố định của ba shortcut.

- [ ] **Step 8: Commit Task 2**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add customer scan demo shortcuts"
```
