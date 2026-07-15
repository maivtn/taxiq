### Task 5: Tip và Direct Payment Pending-to-Confirmed Flows

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:123-135,243-end`

**Interfaces:**
- Consumes: `appendLedger()` and per-business rules.
- Produces: `createTip(appState, input, now): Result`
- Produces: `confirmTipRecord(appState, tipId, now): Result`
- Produces: `createDirectPayment(appState, input, now): Result`
- Produces: `confirmDirectPayment(appState, paymentId, now): Result`
- Produces: `renderTipResult(): void`, `renderPaymentResult(): void`.

- [ ] **Step 1: Add transaction tests proving pending records do not award points**

Append:

```js
test('awards tip points only after confirmation and only once', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  assert.equal(api.createTip(app, { businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', staffName: 'Anna', amount: 10, method: 'Cash App', note: '' }, 500).code, 'method_disabled');
  const pending = api.createTip(app, { businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', staffName: 'Anna', amount: 10, method: 'Venmo', note: 'Cảm ơn' }, 1000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(pending.tip.status, 'pending');
  const confirmed = api.confirmTipRecord(app, pending.tip.id, 2000);
  api.confirmTipRecord(app, pending.tip.id, 3000);
  assert.equal(confirmed.points, 100);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 100);
});

test('awards spend and direct-pay bonus only after salon confirms', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  assert.equal(api.createDirectPayment(app, { businessId: 'bitcoin-nail-bar', amount: 55, method: 'PayPal' }, 500).code, 'method_disabled');
  const pending = api.createDirectPayment(app, { businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle' }, 1000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  const confirmed = api.confirmDirectPayment(app, pending.payment.id, 2000);
  api.confirmDirectPayment(app, pending.payment.id, 3000);
  assert.deepEqual([confirmed.spendPoints, confirmed.bonusPoints], [55, 11]);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 66);
});
```

- [ ] **Step 2: Run focused transaction tests and verify failure**

Run:

```bash
node --test --test-name-pattern="tip points|direct-pay bonus" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because transaction domain functions are absent.

- [ ] **Step 3: Implement transaction domain functions and context-driven receipts**

Add exact domain functions:

```js
function createTip(appState, input, now = Date.now()) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount < 1) return { ok: false, code: 'invalid_amount' };
  const staff = appState.staffProfiles[input.staffProfileId];
  if (!staff || staff.businessId !== input.businessId) return { ok: false, code: 'unknown_staff' };
  if (!staff.methods.includes(input.method)) return { ok: false, code: 'method_disabled' };
  const tip = { id: `tip-${crypto.randomUUID()}`, businessId: input.businessId, staffProfileId: input.staffProfileId, staffName: input.staffName, amount, method: input.method, note: input.note ?? '', status: 'pending', createdAt: new Date(now).toISOString(), confirmedAt: null };
  appState.tips.push(tip);
  appState.ui.pendingContext.tipId = tip.id;
  return { ok: true, tip };
}

function confirmTipRecord(appState, tipId, now = Date.now()) {
  const tip = appState.tips.find((item) => item.id === tipId);
  if (!tip) return { ok: false, code: 'not_found' };
  const points = Math.round(tip.amount * appState.businesses[tip.businessId].tipMultiplier);
  if (tip.status === 'confirmed') return { ok: true, tip, points, idempotent: true };
  tip.status = 'confirmed';
  tip.confirmedAt = new Date(now).toISOString();
  appendLedger(appState, { businessId: tip.businessId, type: 'tip_bonus', pointsDelta: points, refType: 'tip', refId: tip.id, now });
  return { ok: true, tip, points, idempotent: false };
}

function createDirectPayment(appState, input, now = Date.now()) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount < 1) return { ok: false, code: 'invalid_amount' };
  const business = appState.businesses[input.businessId];
  if (!business) return { ok: false, code: 'unknown_business' };
  if (!business.methods.includes(input.method)) return { ok: false, code: 'method_disabled' };
  const payment = { id: `pay-${crypto.randomUUID()}`, businessId: input.businessId, amount, method: input.method, status: 'pending', createdAt: new Date(now).toISOString(), confirmedAt: null };
  appState.directPayments.push(payment);
  appState.ui.pendingContext.paymentId = payment.id;
  return { ok: true, payment };
}

function confirmDirectPayment(appState, paymentId, now = Date.now()) {
  const payment = appState.directPayments.find((item) => item.id === paymentId);
  if (!payment) return { ok: false, code: 'not_found' };
  const spendPoints = Math.round(payment.amount);
  const bonusPoints = Math.round(payment.amount * appState.businesses[payment.businessId].directPayBonusPct / 100);
  if (payment.status === 'confirmed') return { ok: true, payment, spendPoints, bonusPoints, idempotent: true };
  payment.status = 'confirmed';
  payment.confirmedAt = new Date(now).toISOString();
  appendLedger(appState, { businessId: payment.businessId, type: 'visit_spend', pointsDelta: spendPoints, refType: 'direct_payment', refId: payment.id, now });
  appendLedger(appState, { businessId: payment.businessId, type: 'directpay_bonus', pointsDelta: bonusPoints, refType: 'direct_payment', refId: payment.id, now });
  return { ok: true, payment, spendPoints, bonusPoints, idempotent: false };
}
```

Give the recipient select stable staff IDs, add custom amount and a render target for staff-enabled methods, and add IDs for all receipt values:

```html
<select id="tip-recipient" class="app-input mt-1"><option value="staff-anna">Anna · Nail technician</option><option value="staff-maria">Maria · Nail technician</option></select>
<input id="tip-custom-amount" class="app-input mt-3" type="number" min="1" step="1" data-en-ph="Custom amount" data-vi-ph="Số tiền khác" placeholder="Số tiền khác">
<div id="tip-method-list" class="mt-4 grid grid-cols-3 gap-2"></div>
<strong id="tipdone-recipient">Anna</strong>
<strong id="tipdone-method">Venmo</strong>
<strong id="tipdone-points">+100 điểm</strong>
```

Add IDs to Payment summary/result:

```html
<strong id="payment-business-receives">$55.00</strong>
<strong id="payment-result-method">Zelle</strong>
<strong id="payment-confirmed-amount">$55.00</strong>
<strong id="payment-confirmed-points">+66 điểm</strong>
```

Register exact UI handlers:

```js
function renderTipMethods() {
  const staffId = document.getElementById('tip-recipient')?.value || state.ui.selectedStaffId;
  const staff = state.staffProfiles[staffId];
  const methods = ['Venmo', 'Zelle', 'Cash App'];
  if (!staff) return;
  if (!staff.methods.includes(state.ui.selectedTipMethod)) state.ui.selectedTipMethod = staff.methods[0];
  document.getElementById('tip-method-list').innerHTML = methods.map((method) => {
    const enabled = staff.methods.includes(method);
    return `<button type="button" class="app-chip justify-center" data-tip-method="${method}" aria-pressed="${enabled && method === state.ui.selectedTipMethod}" ${enabled ? '' : 'disabled aria-disabled="true"'}>${method}${enabled ? '' : ' · unavailable'}</button>`;
  }).join('');
}

function openExternalPayment(method, amount, recipient) {
  const links = {
    Venmo: `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(recipient)}&amount=${amount.toFixed(2)}`,
    Zelle: 'https://www.zellepay.com/get-started',
    'Cash App': `https://cash.app/$${encodeURIComponent(recipient)}/${amount.toFixed(2)}`
  };
  window.open(links[method], '_blank', 'noopener,noreferrer');
}

registerAction('select-tip', (control) => {
  commitState((draft) => { draft.ui.selectedTip = Number(control.dataset.amount); });
  document.getElementById('tip-custom-amount').value = '';
  document.querySelectorAll('[data-action="select-tip"]').forEach((button) => button.setAttribute('aria-pressed', String(button === control)));
});
registerAction('send-tip', () => {
  const recipient = document.getElementById('tip-recipient');
  const custom = Number(document.getElementById('tip-custom-amount').value);
  const amount = custom >= 1 ? custom : state.ui.selectedTip;
  const staff = state.staffProfiles[recipient.value];
  const result = commitState((draft) => createTip(draft, { businessId: BUSINESS_ID, staffProfileId: staff.id, staffName: staff.name, amount, method: draft.ui.selectedTipMethod, note: document.getElementById('tip-note').value.trim() }));
  if (!result.ok) return showToast(result.code === 'method_disabled' ? (state.profile.language === 'vi' ? 'Thợ chưa bật phương thức này.' : 'The staff member has not enabled this method.') : (state.profile.language === 'vi' ? 'Số tiền tip tối thiểu là $1.' : 'Minimum tip is $1.'), 'error');
  openExternalPayment(result.tip.method, result.tip.amount, result.tip.staffName);
  renderTipResult();
  navigateTo('tipdone');
});
registerAction('confirm-tip', () => { commitState((draft) => confirmTipRecord(draft, draft.ui.pendingContext.tipId)); renderApp(); renderTipResult(); });
registerAction('send-payment', () => {
  const result = commitState((draft) => createDirectPayment(draft, { businessId: draft.ui.selectedBusinessId, amount: document.getElementById('payment-amount').value, method: draft.ui.paymentMethod }));
  if (!result.ok) return showToast(result.code === 'method_disabled' ? (state.profile.language === 'vi' ? 'Tiệm chưa bật phương thức này.' : 'The business has not enabled this method.') : (state.profile.language === 'vi' ? 'Số tiền phải từ $1.' : 'Amount must be at least $1.'), 'error');
  openExternalPayment(result.payment.method, result.payment.amount, state.businesses[result.payment.businessId].name);
  renderPaymentResult();
  navigateTo('paydone');
});
registerAction('confirm-payment', () => { commitState((draft) => confirmDirectPayment(draft, draft.ui.pendingContext.paymentId)); renderApp(); renderPaymentResult(); });
```

Implement renderers:

```js
function renderTipResult() {
  const tip = state.tips.find((item) => item.id === state.ui.pendingContext.tipId);
  if (!tip) return;
  const points = Math.round(tip.amount * state.businesses[tip.businessId].tipMultiplier);
  document.getElementById('tipdone-amount').textContent = `$${tip.amount.toFixed(2)}`;
  document.getElementById('tipdone-recipient').textContent = tip.staffName;
  document.getElementById('tipdone-method').textContent = tip.method;
  document.getElementById('tipdone-points').textContent = `+${formatPoints(points)}`;
  document.getElementById('tip-pending').classList.toggle('hidden', tip.status === 'confirmed');
  document.getElementById('tip-confirmed').classList.toggle('hidden', tip.status !== 'confirmed');
}

function renderPaymentResult() {
  const payment = state.directPayments.find((item) => item.id === state.ui.pendingContext.paymentId);
  if (!payment) return;
  const bonus = Math.round(payment.amount * state.businesses[payment.businessId].directPayBonusPct / 100);
  document.getElementById('payment-confirmed-amount').textContent = `$${payment.amount.toFixed(2)}`;
  document.getElementById('payment-result-method').textContent = payment.method;
  document.getElementById('payment-confirmed-points').textContent = `+${formatPoints(Math.round(payment.amount) + bonus)}`;
  document.getElementById('payment-pending').classList.toggle('hidden', payment.status === 'confirmed');
  document.getElementById('payment-confirmed').classList.toggle('hidden', payment.status !== 'confirmed');
}
```

Extend `handleInput` for live amount summary and add the payment/tip-method branches before generic actions:

```js
if (event.target.id === 'payment-amount') {
  const amount = Math.max(0, Number(event.target.value) || 0);
  document.getElementById('payment-business-receives').textContent = `$${amount.toFixed(2)}`;
}
```

```js
const tipMethod = event.target.closest('[data-tip-method]');
if (tipMethod) { commitState((draft) => { draft.ui.selectedTipMethod = tipMethod.dataset.tipMethod; }); selectExclusive(tipMethod, '[data-tip-method]'); return; }
const paymentMethod = event.target.closest('[data-payment-method]');
if (paymentMethod) { commitState((draft) => { draft.ui.paymentMethod = paymentMethod.dataset.paymentMethod; }); selectExclusive(paymentMethod, '[data-payment-method]'); return; }
```

At the start of `handleChange`, keep the method list in sync when the recipient changes:

```js
if (event.target.id === 'tip-recipient') {
  commitState((draft) => { draft.ui.selectedStaffId = event.target.value; });
  renderTipMethods();
  return;
}
```

Call `renderTipMethods()` from `renderDomainViews()`.

Replace `renderDomainViews()` with:

```js
function renderDomainViews() {
  renderProfile();
  renderBalances();
  renderLedger();
  renderRewards();
  renderTipMethods();
  renderTipResult();
  renderPaymentResult();
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
createTip,
confirmTipRecord,
createDirectPayment,
confirmDirectPayment,
```

- [ ] **Step 4: Run all tests**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; pending records add zero points and repeat confirmation is idempotent.

- [ ] **Step 5: Commit payment flows**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: persist pending tip and direct payments"
```

---

