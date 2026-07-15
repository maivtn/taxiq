### Task 4: Per-Business Wallet, Ledger và Idempotent Rewards

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:77-107,167-187,243-end`

**Interfaces:**
- Consumes: `state.balances`, `state.ledger`, `commitState()`.
- Produces: `appendLedger(appState, input): LedgerEntry`
- Produces: `redeemReward(appState, rewardKey, idempotencyKey, now): Result`
- Produces: `getBusinessBalance(appState, businessId): Balance`
- Produces: `renderBalances(): void`, `renderLedger(): void`, `renderRewards(): void`.

- [ ] **Step 1: Add tests for separate balances, insufficient points and idempotency**

Append:

```js
test('redeems from the source business only and is idempotent', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const glowBefore = app.balances['golden-glow-spa'].points;
  const first = api.redeemReward(app, 'credit5', 'redeem-click-1', 1000);
  const second = api.redeemReward(app, 'credit5', 'redeem-click-1', 2000);
  assert.equal(first.ok, true);
  assert.equal(second.redemption.id, first.redemption.id);
  assert.equal(app.balances['bitcoin-nail-bar'].points, 1950);
  assert.equal(app.balances['golden-glow-spa'].points, glowBefore);
  assert.equal(app.ledger.filter((entry) => entry.refId === first.redemption.id).length, 1);
});

test('rejects a reward when its source balance is insufficient', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  app.balances['bitcoin-nail-bar'].points = 100;
  const result = api.redeemReward(app, 'credit5', 'redeem-click-2', 1000);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'insufficient_points');
  assert.equal(app.balances['bitcoin-nail-bar'].points, 100);
  assert.equal(app.redemptions.length, 0);
  app.balances['bitcoin-nail-bar'].points = 1000;
  app.businesses['moon-coffee'].allianceId = 'other-alliance';
  assert.equal(api.redeemReward(app, 'moon', 'redeem-click-3', 2000).code, 'not_same_alliance');
});
```

- [ ] **Step 2: Run focused reward tests and verify failure**

Run:

```bash
node --test --test-name-pattern="redeems from|rejects a reward" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because ledger and reward domain functions are not exported.

- [ ] **Step 3: Implement reward domain and dynamic wallet/ledger rendering**

Replace `REWARDS` with seven business-aware fixtures:

```js
const REWARDS = {
  credit5: { key: 'credit5', sourceBusinessId: BUSINESS_ID, acceptingBusinessId: BUSINESS_ID, type: 'service_credit', cost: 500, title: { vi: 'Tín dụng dịch vụ $5', en: '$5 service credit' } },
  freepedi: { key: 'freepedi', sourceBusinessId: BUSINESS_ID, acceptingBusinessId: BUSINESS_ID, type: 'free_service', cost: 1000, title: { vi: 'Pedicure cơ bản miễn phí', en: 'Free classic pedicure' } },
  voucher25: { key: 'voucher25', sourceBusinessId: BUSINESS_ID, acceptingBusinessId: BUSINESS_ID, type: 'percent_code', cost: 800, title: { vi: 'Giảm 25% dịch vụ', en: '25% off any service' } },
  glow: { key: 'glow', sourceBusinessId: BUSINESS_ID, acceptingBusinessId: 'golden-glow-spa', type: 'service_credit', cost: 800, title: { vi: 'Tín dụng $10 tại Golden Glow', en: '$10 Golden Glow credit' } },
  moon: { key: 'moon', sourceBusinessId: BUSINESS_ID, acceptingBusinessId: 'moon-coffee', type: 'free_service', cost: 600, title: { vi: 'Đồ uống miễn phí', en: 'Free drink' } },
  bistro: { key: 'bistro', sourceBusinessId: BUSINESS_ID, acceptingBusinessId: 'golden-glow-spa', type: 'percent_code', cost: 450, title: { vi: 'Giảm 10% dịch vụ', en: '10% off service' } },
  gel: { key: 'gel', sourceBusinessId: BUSINESS_ID, acceptingBusinessId: BUSINESS_ID, type: 'free_service', cost: 2500, title: { vi: 'Nâng cấp sơn gel', en: 'Gel polish upgrade' } }
};
```

Add pure domain functions:

```js
function getBusinessBalance(appState, businessId) {
  return appState.balances[businessId] ?? { points: 0, credits: 0, expiringPoints: null };
}

function appendLedger(appState, { businessId, type, pointsDelta, refType, refId, now = Date.now() }) {
  const balance = getBusinessBalance(appState, businessId);
  if (!appState.balances[businessId]) appState.balances[businessId] = balance;
  if (balance.points + pointsDelta < 0) throw new Error('insufficient_points');
  const entry = { id: `ledger-${crypto.randomUUID()}`, businessId, type, pointsDelta, refType, refId, createdAt: new Date(now).toISOString() };
  balance.points += pointsDelta;
  appState.ledger.unshift(entry);
  return entry;
}

function redeemReward(appState, rewardKey, idempotencyKey, now = Date.now()) {
  const existing = appState.redemptions.find((item) => item.idempotencyKey === idempotencyKey);
  if (existing) return { ok: true, redemption: existing, idempotent: true };
  const reward = REWARDS[rewardKey];
  if (!reward) return { ok: false, code: 'unknown_reward' };
  const sourceBusiness = appState.businesses[reward.sourceBusinessId];
  const acceptingBusiness = appState.businesses[reward.acceptingBusinessId];
  if (reward.sourceBusinessId !== reward.acceptingBusinessId && sourceBusiness.allianceId !== acceptingBusiness.allianceId) return { ok: false, code: 'not_same_alliance' };
  const balance = getBusinessBalance(appState, reward.sourceBusinessId);
  if (balance.points < reward.cost) return { ok: false, code: 'insufficient_points', missing: reward.cost - balance.points };
  const redemption = { id: `red-${crypto.randomUUID()}`, idempotencyKey, rewardKey, sourceBusinessId: reward.sourceBusinessId, acceptingBusinessId: reward.acceptingBusinessId, cost: reward.cost, status: 'ready', qrPayload: `NEXORA:${rewardKey}:${idempotencyKey}`, createdAt: new Date(now).toISOString() };
  appState.redemptions.push(redemption);
  appendLedger(appState, { businessId: reward.sourceBusinessId, type: 'redeem', pointsDelta: -reward.cost, refType: 'redemption', refId: redemption.id, now });
  return { ok: true, redemption, idempotent: false };
}
```

Add stable render targets to Home/Wallet/History/Rewards:

```html
<strong data-balance-business="bitcoin-nail-bar" class="text-4xl font-black tracking-tight sm:text-5xl">2.450</strong>
<div id="wallet-business-list" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"></div>
<div id="ledger-list" class="space-y-3"></div>
<div id="reward-list" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"></div>
<p class="mt-4 text-xs leading-5 text-app-muted" data-en="Points apply to services only — never cash out. Each business sets its own reward prices; NEXORA only keeps the ledger." data-vi="Điểm chỉ dùng cho dịch vụ — không đổi tiền mặt. Mỗi doanh nghiệp tự đặt giá thưởng; NEXORA chỉ lưu sổ cái.">Điểm chỉ dùng cho dịch vụ — không đổi tiền mặt. Mỗi doanh nghiệp tự đặt giá thưởng; NEXORA chỉ lưu sổ cái.</p>
```

Implement renderers and reward handlers:

```js
function formatPoints(value, withUnit = true) {
  const language = state.profile.language;
  const number = new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(value);
  return withUnit ? `${number} ${language === 'vi' ? 'điểm' : 'points'}` : number;
}

function renderBalances() {
  document.querySelectorAll('[data-balance-business]').forEach((element) => {
    element.textContent = formatPoints(getBusinessBalance(state, element.dataset.balanceBusiness).points, false);
  });
  const list = document.getElementById('wallet-business-list');
  if (!list) return;
  list.innerHTML = Object.values(state.businesses).map((business) => {
    const balance = getBusinessBalance(state, business.id);
    return `<article class="app-card"><h2 class="font-black">${business.name}</h2><strong class="mt-5 block text-3xl font-black">${formatPoints(balance.points)}</strong><button type="button" class="app-button-secondary mt-5 w-full" data-action="open-business-history" data-business-id="${business.id}">${state.profile.language === 'vi' ? 'Lịch sử' : 'History'}</button></article>`;
  }).join('');
}

function renderLedger() {
  const list = document.getElementById('ledger-list');
  if (!list) return;
  const businessId = state.ui.selectedBusinessId;
  const entries = state.ledger.filter((entry) => entry.businessId === businessId);
  const labels = {
    vi: { visit: 'Điểm ghé tiệm', welcome: 'Quà chào mừng', redeem: 'Đổi phần thưởng', feedback: 'Phản hồi riêng', tip_bonus: 'Thưởng tip', visit_spend: 'Điểm thanh toán', directpay_bonus: 'Thưởng thanh toán trực tiếp', booking_bonus: 'Thưởng đặt lịch' },
    en: { visit: 'Visit points', welcome: 'Welcome gift', redeem: 'Reward redeemed', feedback: 'Private feedback', tip_bonus: 'Tip bonus', visit_spend: 'Payment points', directpay_bonus: 'Direct-pay bonus', booking_bonus: 'Booking bonus' }
  };
  list.innerHTML = entries.map((entry) => `<article class="app-card flex items-center gap-3"><div class="flex-1"><strong>${labels[state.profile.language][entry.type] ?? entry.type}</strong><p class="text-xs text-app-muted">${state.businesses[entry.businessId].name} · ${new Date(entry.createdAt).toLocaleDateString()}</p></div><strong class="${entry.pointsDelta >= 0 ? 'text-app-green' : 'text-app-red'}">${entry.pointsDelta > 0 ? '+' : ''}${formatPoints(entry.pointsDelta)}</strong></article>`).join('');
}

function renderRewards() {
  const list = document.getElementById('reward-list');
  if (!list) return;
  list.innerHTML = Object.values(REWARDS).map((reward) => {
    const balance = getBusinessBalance(state, reward.sourceBusinessId).points;
    const sameAlliance = reward.sourceBusinessId === reward.acceptingBusinessId || state.businesses[reward.sourceBusinessId].allianceId === state.businesses[reward.acceptingBusinessId].allianceId;
    const disabled = balance < reward.cost || !sameAlliance;
    const label = !sameAlliance ? (state.profile.language === 'vi' ? 'Khác liên minh' : 'Different alliance') : balance < reward.cost ? (state.profile.language === 'vi' ? `Cần thêm ${formatPoints(reward.cost - balance, false)}` : `${formatPoints(reward.cost - balance, false)} more`) : (state.profile.language === 'vi' ? 'Đổi quà' : 'Redeem');
    return `<article class="app-card flex flex-col"><h2 class="text-lg font-black">${reward.title[state.profile.language]}</h2><p class="mt-2 flex-1 text-sm text-app-muted">${state.businesses[reward.acceptingBusinessId].name}</p><div class="mt-5 flex items-center justify-between"><strong>${formatPoints(reward.cost)}</strong><button class="app-button-secondary" type="button" data-action="open-reward" data-reward-key="${reward.key}" ${disabled ? 'disabled aria-disabled="true"' : ''}>${label}</button></div></article>`;
  }).join('');
}

function openReward(key) {
  const reward = REWARDS[key];
  if (!reward) return;
  state.ui.currentRewardKey = key;
  saveState(state);
  document.getElementById('reward-title').textContent = reward.title[state.profile.language];
  document.getElementById('reward-business').textContent = state.businesses[reward.acceptingBusinessId].name;
  document.getElementById('reward-cost').textContent = formatPoints(reward.cost);
  const balance = getBusinessBalance(state, reward.sourceBusinessId).points;
  document.getElementById('reward-balance').textContent = formatPoints(balance);
  document.getElementById('reward-after').textContent = formatPoints(balance - reward.cost);
  navigateTo('redeem');
}

registerAction('open-business-history', (control) => { state.ui.selectedBusinessId = control.dataset.businessId; saveState(state); renderLedger(); navigateTo('history'); });
registerAction('open-reward', (control) => openReward(control.dataset.rewardKey));
registerAction('confirm-reward', (control) => {
  control.disabled = true;
  const key = `redeem-${state.ui.currentRewardKey}-${Date.now()}`;
  const result = commitState((draft) => redeemReward(draft, draft.ui.currentRewardKey, key));
  control.disabled = false;
  if (!result.ok) return showToast(result.code === 'not_same_alliance' ? (state.profile.language === 'vi' ? 'Hai doanh nghiệp không cùng liên minh.' : 'The businesses are not in the same alliance.') : (state.profile.language === 'vi' ? `Cần thêm ${result.missing} điểm` : `${result.missing} more points needed`), 'error');
  document.getElementById('reward-done-title').textContent = REWARDS[result.redemption.rewardKey].title[state.profile.language];
  document.getElementById('reward-done-cost').textContent = formatPoints(result.redemption.cost);
  renderApp();
  navigateTo('redeemdone');
});
```

Replace `renderDomainViews()` with:

```js
function renderDomainViews() {
  renderProfile();
  renderBalances();
  renderLedger();
  renderRewards();
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
getBusinessBalance,
appendLedger,
redeemReward,
```

- [ ] **Step 4: Run all tests**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS and no flat `pointBalance` remains.

- [ ] **Step 5: Commit wallet and rewards**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add per business rewards ledger"
```

---

