# Customer Loyalty Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện prototype Loyalty phía khách hàng với ba loại số dư, năm reward type, phát hành an toàn, vòng đời instrument, lịch sử bù trừ và các trạng thái Demo/QA.

**Architecture:** Tiếp tục dùng một HTML tự chứa và `localStorage`. Mở rộng lớp domain hiện tại bằng các hàm chuẩn hóa balance, catalog và instrument; UI chỉ render state và gọi domain action. Dữ liệu schema v3 được migrate sang schema v4, còn các API cũ được giữ bằng wrapper tương thích để không làm gãy hành trình khách hàng hiện hữu.

**Tech Stack:** HTML, Tailwind CDN/CSS hiện hữu, JavaScript thuần, Node.js `node:test`, `vm` test harness.

## Global Constraints

- Chỉ sửa `html/customer/cutomer-reward.html` và `html/customer/cutomer-reward.test.mjs`; không sửa các file quản trị.
- Không thêm dependency runtime hoặc build step.
- Tiếng Việt là mặc định; vẫn giữ bản dịch Anh/Việt.
- Mọi thay đổi production code phải đi sau một test đỏ tương ứng.
- Dữ liệu v3 phải migrate mà không mất ledger, redemption hoặc các collection không thuộc Loyalty.
- Khu vực mô phỏng phải ghi rõ `Demo/QA — không thuộc production`.
- Không tự động hoàn điểm khi instrument hết hạn.
- Không can thiệp các thay đổi chưa commit của người dùng ngoài hai file trong phạm vi.

---

## File map

- `html/customer/cutomer-reward.html`: markup, CSS, catalog seed, schema/migration, Loyalty domain functions, render functions, event actions và test API.
- `html/customer/cutomer-reward.test.mjs`: test migration, invariant, catalog, issuance, lifecycle, rendering, accessibility và regression.
- `docs/superpowers/specs/2026-07-20-customer-loyalty-completion-design.md`: đặc tả đã duyệt, chỉ đọc trong quá trình triển khai.

### Task 1: Schema v4 và ba loại số dư

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:252`
- Modify: `html/customer/cutomer-reward.html:655`
- Modify: `html/customer/cutomer-reward.html:1746`
- Modify: `html/customer/cutomer-reward.html:5542`
- Modify: `html/customer/cutomer-reward.html:6045`

**Interfaces:**
- Produces: `normalizePointBalance(raw, fallback, now)`, `getBusinessBalance(appState, businessId)`, `replacePointBalance(appState, businessId, next, now)`.
- Balance shape: `{ available, pending, lifetime, points, credits, expiringPoints, version, updatedAt }`; `points` là compatibility mirror và luôn bằng `available`.

- [ ] **Step 1: Viết test đỏ cho default state và migration v3 → v4**

```js
test('creates schema v4 wallets with distinct available pending and lifetime balances', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const wallet = state.balances['bitcoin-nail-bar'];
  assert.equal(state.schemaVersion, 4);
  assert.equal(state.profile.language, 'vi');
  assert.deepEqual(
    { available: wallet.available, pending: wallet.pending, lifetime: wallet.lifetime },
    { available: 2450, pending: 120, lifetime: 4270 }
  );
  assert.equal(wallet.points, wallet.available);
  assert.equal(wallet.version, 1);
  assert.match(wallet.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('migrates a legacy points balance without changing spendable value', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    schemaVersion: 3,
    profile: { language: 'vi' },
    balances: { 'bitcoin-nail-bar': { points: 730, credits: 0, expiringPoints: null } }
  });
  assert.equal(migrated.balances['bitcoin-nail-bar'].available, 730);
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, 730);
  assert.equal(migrated.balances['bitcoin-nail-bar'].pending, 0);
  assert.equal(migrated.balances['bitcoin-nail-bar'].lifetime, 730);
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run:

```bash
node --test --test-name-pattern='schema v4 wallets|legacy points balance' html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì schema vẫn là 3 và balance chưa có `available/pending/lifetime/version`.

- [ ] **Step 3: Thêm normalization và migrate schema**

```js
const SCHEMA_VERSION = 4;

function normalizePointBalance(raw, fallback, now = Date.now()) {
  const source = isRecord(raw) ? raw : {};
  const base = isRecord(fallback) ? fallback : {};
  const nonNegative = (value, fallbackValue = 0) => Number.isSafeInteger(value) && value >= 0 ? value : fallbackValue;
  const positive = (value, fallbackValue = 1) => Number.isSafeInteger(value) && value > 0 ? value : fallbackValue;
  const available = nonNegative(source.available ?? source.points ?? base.available ?? base.points, 0);
  const pending = nonNegative(source.pending ?? base.pending, 0);
  const lifetime = nonNegative(source.lifetime ?? base.lifetime, available);
  const version = positive(source.version ?? base.version, 1);
  const updatedAt = validStoredTimestamp(source.updatedAt) ? source.updatedAt : domainTimestamp(now).value;
  return { ...base, ...source, available, pending, lifetime, points: available, version, updatedAt };
}

function replacePointBalance(appState, businessId, next, now = Date.now()) {
  const current = getBusinessBalance(appState, businessId);
  const normalized = normalizePointBalance(next, current, now);
  normalized.version = current.version + 1;
  normalized.points = normalized.available;
  appState.balances = { ...appState.balances, [businessId]: normalized };
  return normalized;
}
```

Sau `mergeRecord` trong `migrateState`, normalize từng business balance. Sửa mọi mutation `points: nextPoints` sang `replacePointBalance(..., { ...balance, available: nextPoints })` để mirror không lệch.

- [ ] **Step 4: Chạy test schema và các test balance hiện hữu**

```bash
node --test --test-name-pattern='schema v4 wallets|legacy points balance|balance|ledger|welcome gift' html/customer/cutomer-reward.test.mjs
```

Expected: các test mới PASS; test cũ dùng `.points` tiếp tục PASS nhờ compatibility mirror.

- [ ] **Step 5: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add customer point wallet balances"
```

### Task 2: Catalog đủ năm loại và eligibility

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:978`
- Modify: `html/customer/cutomer-reward.html:6045`
- Modify: `html/customer/cutomer-reward.html:13482`

**Interfaces:**
- Produces: `validateRewardDefinition(reward)`, `getRewardEligibility(appState, reward, locationId)`.
- Eligibility result: `{ eligible, code, missingPoints, eligibleLocationIds }`.

- [ ] **Step 1: Viết test đỏ cho catalog semantics**

```js
test('defines all five customer reward types with required semantics', () => {
  const { api } = testApi();
  const rewards = Object.values(api.REWARDS).filter(api.isPurchasableReward);
  assert.deepEqual(new Set(rewards.map((reward) => reward.type)), new Set([
    'gift_card', 'dollar_discount', 'percent_discount', 'free_service', 'free_product'
  ]));
  rewards.forEach((reward) => assert.deepEqual(api.validateRewardDefinition(reward), { ok: true }));
  assert.ok(rewards.find((reward) => reward.type === 'percent_discount').maximumDiscountCents > 0);
  assert.ok(rewards.find((reward) => reward.type === 'free_product').linkedItemId);
});

test('uses available points only and reports paused stock limit and location failures', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  state.balances['bitcoin-nail-bar'] = {
    ...state.balances['bitcoin-nail-bar'], available: 100, points: 100, pending: 5000
  };
  assert.equal(api.getRewardEligibility(state, api.REWARDS.credit5, 'bitcoin-nail-bar').code, 'insufficient_points');
  assert.equal(api.getRewardEligibility(state, { ...api.REWARDS.credit5, status: 'paused' }, 'bitcoin-nail-bar').code, 'reward_paused');
  assert.equal(api.getRewardEligibility(state, { ...api.REWARDS.credit5, stock: 0 }, 'bitcoin-nail-bar').code, 'out_of_stock');
  assert.equal(api.getRewardEligibility(state, api.REWARDS.credit5, 'moon-coffee').code, 'wrong_location');
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

```bash
node --test --test-name-pattern='all five customer reward types|uses available points only' html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì catalog chỉ có ba type và eligibility còn đọc `points`.

- [ ] **Step 3: Mở rộng `REWARDS` và thêm validator**

Mỗi reward seed phải có đầy đủ field. Dùng các demo item cụ thể:

```js
gift5: {
  key: 'gift5', type: 'gift_card', cost: 500, valueCents: 500,
  title: { vi: 'Gift Card $5', en: '$5 Gift Card' },
  description: { vi: 'Dùng dần cho dịch vụ đủ điều kiện.', en: 'Stored value for eligible services.' },
  conditions: { vi: 'Không đổi lại thành điểm.', en: 'Cannot be converted back to points.' },
  eligibleLocationIds: ['bitcoin-nail-bar'], stackingRule: 'not_stackable',
  status: 'active', validityDays: 90, perCustomerLimit: 2, stock: 50
},
productOil: {
  key: 'productOil', type: 'free_product', cost: 1100, linkedItemId: 'sku-cuticle-oil',
  title: { vi: 'Dầu dưỡng biểu bì miễn phí', en: 'Free cuticle oil' },
  eligibleLocationIds: ['bitcoin-nail-bar'], stackingRule: 'not_stackable',
  status: 'active', validityDays: 30, perCustomerLimit: 1, stock: 12
}
```

Chuyển `service_credit` thành `dollar_discount`; bổ sung `valueCents`, `minimumSpendCents`. Bổ sung `maximumDiscountCents` cho mọi `percent_discount` và `linkedItemId` cho `free_service`.

- [ ] **Step 4: Thêm `getRewardEligibility` và giữ wrapper UI**

```js
function getRewardEligibility(appState, reward, locationId = reward?.acceptingBusinessId) {
  const definition = validateRewardDefinition(reward);
  if (!definition.ok) return { eligible: false, code: definition.code };
  if (reward.status !== 'active') return { eligible: false, code: 'reward_paused' };
  if (reward.stock === 0) return { eligible: false, code: 'out_of_stock' };
  if (!reward.eligibleLocationIds.includes(locationId)) {
    return { eligible: false, code: 'wrong_location', eligibleLocationIds: [...reward.eligibleLocationIds] };
  }
  const issuedCount = Array.isArray(appState.redemptions)
    ? appState.redemptions.filter((instrument) => isRecord(instrument)
      && instrument.rewardKey === reward.key
      && instrument.customerId === appState.profile.id
      && ['issued', 'redeemed'].includes(instrument.status)).length
    : 0;
  if (issuedCount >= reward.perCustomerLimit) return { eligible: false, code: 'limit_reached' };
  const available = getBusinessBalance(appState, reward.sourceBusinessId).available;
  const missingPoints = Math.max(0, reward.cost - available);
  return missingPoints > 0
    ? { eligible: false, code: 'insufficient_points', missingPoints }
    : { eligible: true, code: 'eligible', missingPoints: 0 };
}
```

`rewardAvailability` chuyển domain result sang translation key nhưng không tự tính balance nữa.

- [ ] **Step 5: Chạy targeted tests rồi commit**

```bash
node --test --test-name-pattern='reward|redeem|catalog|eligib|alliance' html/customer/cutomer-reward.test.mjs
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: complete customer reward catalog semantics"
```

Expected: test catalog mới và các test reward cũ PASS.

### Task 3: Atomic instrument issuance, stale version và migration redemption

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:2055`
- Modify: `html/customer/cutomer-reward.html:2220`
- Modify: `html/customer/cutomer-reward.html:8642`
- Modify: `html/customer/cutomer-reward.html:10180`

**Interfaces:**
- Produces: `issueReward(appState, request)`, `normalizeRewardInstrument(value)`, `isValidRewardInstrument(appState, value)`.
- Keeps: `redeemReward(appState, rewardKey, idempotencyKey, now)` as a compatibility wrapper.
- Request: `{ rewardKey, idempotencyKey, expectedBalanceVersion, issuingLocationId, now }`.

- [ ] **Step 1: Viết test đỏ cho stale và snapshot**

```js
test('stops stale issuance without mutating wallet ledger or instruments', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const before = structuredClone({ balances: state.balances, ledger: state.ledger, redemptions: state.redemptions });
  const result = api.issueReward(state, {
    rewardKey: 'credit5', idempotencyKey: 'attempt-stale',
    expectedBalanceVersion: state.balances['bitcoin-nail-bar'].version - 1,
    issuingLocationId: 'bitcoin-nail-bar', now: Date.parse('2026-07-20T10:00:00.000Z')
  });
  assert.equal(result.code, 'stale_balance');
  assert.deepEqual({ balances: state.balances, ledger: state.ledger, redemptions: state.redemptions }, before);
});

test('atomically issues a catalog snapshot and returns it for duplicate confirmation', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const request = {
    rewardKey: 'credit5', idempotencyKey: 'attempt-1',
    expectedBalanceVersion: state.balances['bitcoin-nail-bar'].version,
    issuingLocationId: 'bitcoin-nail-bar', now: Date.parse('2026-07-20T10:00:00.000Z')
  };
  const first = api.issueReward(state, request);
  const second = api.issueReward(state, request);
  assert.equal(first.ok, true);
  assert.equal(first.instrument.status, 'issued');
  assert.equal(first.instrument.catalogSnapshot.type, 'dollar_discount');
  assert.match(first.instrument.code, /^NT-/);
  assert.equal(second.instrument.id, first.instrument.id);
  assert.equal(second.idempotent, true);
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

```bash
node --test --test-name-pattern='stale issuance|catalog snapshot' html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì chưa có `issueReward` và instrument vẫn dùng `status: ready`.

- [ ] **Step 3: Implement issuance và compatibility wrapper**

`issueReward` phải validate toàn bộ trước khi tạo ID; sau đó dựng `nextBalance`, `instrument`, `ledgerEntry` trong biến cục bộ rồi mới assign ba collection. Instrument lưu snapshot dữ liệu hiển thị, `expiresAt = issuedAt + validityDays`, `remainingValueCents` chỉ có cho Gift Card.

```js
function redeemReward(appState, rewardKey, idempotencyKey, now = Date.now()) {
  const reward = getRewardDefinition(rewardKey);
  const balance = reward ? getBusinessBalance(appState, reward.sourceBusinessId) : null;
  return issueReward(appState, {
    rewardKey, idempotencyKey,
    expectedBalanceVersion: balance?.version,
    issuingLocationId: reward?.acceptingBusinessId,
    now
  });
}
```

Return compatibility aliases `{ redemption: instrument, instrument }` để test và code cũ tiếp tục hoạt động.

- [ ] **Step 4: Migrate instrument cũ**

`normalizeRewardInstrument` đổi `ready → issued`, `cost → pointsSpent`, `createdAt → issuedAt`; bổ sung `catalogSnapshot`, `code`, `eligibleLocationIds`, `expiresAt`. `isValidRewardInstrument` kiểm tra snapshot thay vì yêu cầu catalog hiện tại giống tuyệt đối, nhờ đó reward đã issued vẫn hợp lệ khi catalog paused hoặc được chỉnh sửa.

- [ ] **Step 5: Lưu version trong pending attempt và xử lý stale UI result**

`openReward` lưu:

```js
{
  rewardKey: reward.key,
  idempotencyKey,
  expectedBalanceVersion: balance.version,
  issuingLocationId: reward.acceptingBusinessId,
  completed: false
}
```

`confirmReward` map `stale_balance`, `reward_paused`, `wrong_location`, `out_of_stock`, `limit_reached` thành mã lỗi cụ thể và không navigate sang success khi thất bại.

- [ ] **Step 6: Chạy test issuance/regression rồi commit**

```bash
node --test --test-name-pattern='redeem|redemption|instrument|idempot|stale|atomic' html/customer/cutomer-reward.test.mjs
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: issue versioned customer reward instruments"
```

Expected: các test atomic/idempotency cũ và mới PASS.

### Task 4: Lifecycle, Gift Card, refund và void

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html` cạnh các Loyalty domain functions

**Interfaces:**
- Produces: `settlePendingPoints`, `reversePointTransaction`, `voidRewardInstrument`, `consumeGiftCard`, `expireRewardInstruments`.

- [ ] **Step 1: Viết test đỏ riêng cho từng transition**

```js
test('settles pending points into available without double counting lifetime', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const before = structuredClone(state.balances['bitcoin-nail-bar']);
  const result = api.settlePendingPoints(state, 'bitcoin-nail-bar', 40, 'payment verified', Date.parse('2026-07-20T11:00:00Z'));
  assert.equal(result.ok, true);
  assert.equal(result.balance.pending, before.pending - 40);
  assert.equal(result.balance.available, before.available + 40);
  assert.equal(result.balance.lifetime, before.lifetime);
});

test('voids one unused instrument and restores points through a linked event', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const issued = api.redeemReward(state, 'credit5', 'void-me').instrument;
  const originalDebit = state.ledger.find((entry) => entry.refType === 'redemption' && entry.refId === issued.id);
  const result = api.voidRewardInstrument(state, issued.id, { restorePoints: true, reason: 'Manager correction' });
  assert.equal(result.instrument.status, 'voided');
  assert.equal(result.ledger.reversalOf, originalDebit.id);
  assert.equal(result.ledger.pointsDelta, issued.pointsSpent);
});

test('partially consumes gift card value without converting it back to points', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const issued = api.redeemReward(state, 'gift5', 'gift-use').instrument;
  const availableAfterIssuance = state.balances['bitcoin-nail-bar'].available;
  const result = api.consumeGiftCard(state, issued.id, 200, 'bitcoin-nail-bar');
  assert.equal(result.instrument.remainingValueCents, 300);
  assert.equal(result.instrument.status, 'issued');
  assert.equal(state.balances['bitcoin-nail-bar'].available, availableAfterIssuance);
});

test('expires an issued instrument without returning points', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const issued = api.redeemReward(state, 'credit5', 'expire-me', Date.parse('2026-01-01T00:00:00Z')).instrument;
  const available = state.balances['bitcoin-nail-bar'].available;
  api.expireRewardInstruments(state, Date.parse('2027-01-01T00:00:00Z'));
  assert.equal(state.redemptions.find((row) => row.id === issued.id).status, 'expired');
  assert.equal(state.balances['bitcoin-nail-bar'].available, available);
});
```

Thêm test `reversePointTransaction` với cả full và partial amount, yêu cầu `reversalOf` và không sửa entry gốc.

- [ ] **Step 2: Chạy test để xác nhận RED**

```bash
node --test --test-name-pattern='settles pending|voids one unused|partially consumes gift|expires an issued|reverses point transaction' html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì các lifecycle function chưa tồn tại.

- [ ] **Step 3: Implement transition guard và ledger append-only**

Mỗi function phải:

1. validate toàn bộ input và current status;
2. tạo timestamp/ID trước mutation;
3. dựng next balance/instrument/ledger;
4. assign state một lần sau khi mọi bước thành công;
5. trả domain code ổn định như `not_issued`, `wrong_location`, `amount_exceeds_remaining`, `already_reversed`.

`consumeGiftCard` đặt `redeemed` chỉ khi remaining về 0. `expireRewardInstruments` chỉ chuyển các instrument `issued` có `expiresAt <= now`; không ghi credit ledger.

- [ ] **Step 4: Export API và chạy targeted tests**

Thêm năm function vào `window.NEXORA_TEST_API`, sau đó chạy:

```bash
node --test --test-name-pattern='pending points|void|gift card|expire|refund|revers' html/customer/cutomer-reward.test.mjs
```

- [ ] **Step 5: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add customer reward lifecycle events"
```

### Task 5: Wallet, catalog, confirmation, receipt và history UI

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:289`
- Modify: `html/customer/cutomer-reward.html:311`
- Modify: `html/customer/cutomer-reward.html:314`
- Modify: `html/customer/cutomer-reward.html:317`
- Modify: `html/customer/cutomer-reward.html:10136`
- Modify: `html/customer/cutomer-reward.html:13392`
- Modify: `html/customer/cutomer-reward.html:13507`

**Interfaces:**
- Produces: `renderWalletSummary()`, `renderRewardPreview(reward)`, `renderRewardReceipt()`, `renderInstrumentStatus(instrument)`, `setWalletViewState(status)`.

- [ ] **Step 1: Viết structural/render tests đỏ**

```js
test('renders distinct wallet balances and accessible loading error states', () => {
  const source = html();
  assert.match(source, /id="wallet-available"/);
  assert.match(source, /id="wallet-pending"/);
  assert.match(source, /id="wallet-lifetime"/);
  assert.match(source, /id="wallet-loading"[^>]*aria-live="polite"/);
  assert.match(source, /id="wallet-error"[^>]*role="alert"/);
});

test('reward review identifies the customer conditions location and exact balance change', () => {
  const source = html();
  for (const id of ['reward-customer', 'reward-conditions', 'reward-location', 'reward-balance', 'reward-after']) {
    assert.match(source, new RegExp(`id="${id}"`));
  }
  assert.match(source, /id="reward-flow-status"[^>]*aria-live="polite"/);
  assert.match(source, /id="reward-flow-error"[^>]*role="alert"/);
});

test('reward receipt exposes lifecycle expiry and gift card remaining value', () => {
  const source = html();
  for (const id of ['reward-done-status', 'reward-done-issued-at', 'reward-done-expires-at', 'reward-done-remaining']) {
    assert.match(source, new RegExp(`id="${id}"`));
  }
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

```bash
node --test --test-name-pattern='distinct wallet balances|reward review identifies|reward receipt exposes' html/customer/cutomer-reward.test.mjs
```

Expected: FAIL do thiếu các element mới.

- [ ] **Step 3: Cập nhật markup Wallet**

Thêm grid ba balance card với ID ổn định, `wallet-updated-at`, skeleton rows, empty state và retry button. `renderBalances` đọc `.available/.pending/.lifetime`; tier dùng lifetime thay vì available.

- [ ] **Step 4: Cập nhật catalog/review/result/history renderer**

- Catalog card: badge type, description, conditions summary, location/status reason.
- Review: customer name, conditions, location, minimum spend, stacking, max discount nếu là percent.
- Result/instrument card: status text+icon, issued/expires, Gift Card remaining.
- History: label `pending`, `settled`, `refund_reversal`, `void_restoration`, `expired`; entry có `reversalOf` hiển thị liên kết mô tả.
- UI reward tabs phân loại theo instrument lifecycle thay vì chỉ dựa vào check-in.

- [ ] **Step 5: Thêm submitting/stale/failed state**

Trước commit, handler đặt button `disabled`, `aria-busy="true"`, status text “Đang phát hành…”. Domain result `stale_balance` giữ màn review, cập nhật balance và hiển thị nút xác nhận lại; lỗi khác hiển thị `reward-flow-error`; success mới navigate.

- [ ] **Step 6: Chạy render và reward UI tests rồi commit**

```bash
node --test --test-name-pattern='wallet|reward|redeem|instrument|history|loading|stale|focus' html/customer/cutomer-reward.test.mjs
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: complete customer loyalty screens"
```

### Task 6: Panel Demo/QA dùng domain actions

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html` trong Wallet markup và action registry

**Interfaces:**
- Produces: `runLoyaltyDemoAction(appState, action, payload, now)`.
- Supported actions: `settle_pending`, `toggle_pause`, `make_stale`, `partial_refund`, `void_restore`, `consume_gift_card`, `expire_instruments`.

- [ ] **Step 1: Viết test đỏ cho panel và dispatcher**

```js
test('labels loyalty simulation controls as Demo QA and not production', () => {
  const source = html();
  assert.match(source, /id="loyalty-demo-panel"/);
  assert.match(source, /Demo\/QA — không thuộc production/);
  for (const action of ['settle_pending', 'toggle_pause', 'make_stale', 'partial_refund', 'void_restore', 'consume_gift_card', 'expire_instruments']) {
    assert.match(source, new RegExp(`data-loyalty-demo="${action}"`));
  }
});

test('routes Demo QA actions through loyalty domain functions', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  const before = state.balances['bitcoin-nail-bar'].available;
  const result = api.runLoyaltyDemoAction(state, 'settle_pending', {
    businessId: 'bitcoin-nail-bar', amount: 20
  }, Date.parse('2026-07-20T12:00:00Z'));
  assert.equal(result.ok, true);
  assert.equal(state.balances['bitcoin-nail-bar'].available, before + 20);
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

```bash
node --test --test-name-pattern='Demo QA|routes Demo' html/customer/cutomer-reward.test.mjs
```

Expected: FAIL do chưa có panel/dispatcher.

- [ ] **Step 3: Thêm panel thu gọn và event handlers**

Panel dùng `<details id="loyalty-demo-panel">`; mỗi button có `data-loyalty-demo`. Một delegated action gọi `commitState(draft => runLoyaltyDemoAction(...))`, sau đó `renderApp()` và toast kết quả. Không handler nào sửa trực tiếp balance, ledger, catalog state hoặc instrument ngoài domain function.

Catalog override demo được lưu trong `state.ui.loyaltyDemo.catalogStatus`; `getRewardDefinition` trả base reward cộng override để pause/unpause không sửa constant.

- [ ] **Step 4: Test tất cả demo actions và commit**

```bash
node --test --test-name-pattern='Demo QA|settle pending|paused|stale|refund|void|gift card|expire' html/customer/cutomer-reward.test.mjs
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add loyalty QA simulation controls"
```

### Task 7: Accessibility, tiếng Việt và full regression

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:36`
- Modify: `html/customer/cutomer-reward.html:8714`
- Modify: `html/customer/cutomer-reward.html:8926`
- Modify: `html/customer/cutomer-reward.html:9941`

**Interfaces:**
- Consumes all Task 1–6 interfaces.
- Produces no new domain API; closes accessibility/i18n regression.

- [ ] **Step 1: Viết test đỏ cho ngôn ngữ và a11y**

```js
test('defaults every new loyalty state label to Vietnamese without mixed copy', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  assert.equal(state.profile.language, 'vi');
  for (const key of ['availableBalance', 'pendingBalance', 'lifetimeBalance', 'rewardPaused', 'staleBalance', 'voidRestoration']) {
    assert.equal(typeof api.COPY.vi[key], 'string');
    assert.equal(typeof api.COPY.en[key], 'string');
  }
});

test('loyalty controls expose status text keyboard focus and AA color pairs', () => {
  const source = html();
  assert.match(source, /aria-busy/);
  assert.match(source, /role="alert"/);
  assert.match(source, /focus-visible:outline/);
  assert.ok(contrastRatio('#f7f7ff', '#0d1024') >= 4.5);
  assert.ok(contrastRatio('#9da6c9', '#0d1024') >= 4.5);
});
```

Thêm test modal hiện hữu để xác nhận Escape và focus return vẫn PASS sau khi thêm detail/QA controls.

- [ ] **Step 2: Chạy test để xác nhận RED**

```bash
node --test --test-name-pattern='new loyalty state label|loyalty controls expose|traps modal focus' html/customer/cutomer-reward.test.mjs
```

Expected: test copy mới FAIL trước khi thêm keys; focus test cũ vẫn cho biết baseline.

- [ ] **Step 3: Hoàn thiện COPY và default language**

Thêm đầy đủ key Vi/En cho balance, reward types, lifecycle, eligibility, submitting/stale/failed, ledger reversal và Demo/QA. Đặt `createDefaultState().profile.language = 'vi'`; mọi text động dùng `t()` hoặc localized reward metadata.

- [ ] **Step 4: Chạy targeted Loyalty suite**

```bash
node --test --test-name-pattern='wallet|reward|redeem|redemption|instrument|points|balance|ledger|refund|void|stale|gift card|accessibility|focus|Vietnamese' html/customer/cutomer-reward.test.mjs
```

Expected: tất cả test được chọn PASS, không có warning hoặc uncaught error.

- [ ] **Step 5: Chạy full suite và phân loại mọi failure**

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: Loyalty tests mới và regression liên quan PASS. Nếu full suite còn lỗi baseline không thuộc Loyalty, ghi lại test name và chứng minh số lỗi không tăng so với baseline 67; mọi failure do thay đổi này phải được sửa trước khi tiếp tục.

- [ ] **Step 6: Kiểm tra diff và HTML thủ công**

```bash
git diff --check
git diff --stat
rg -n "available|pending|lifetime|gift_card|free_product|stale_balance|loyalty-demo-panel" html/customer/cutomer-reward.html
```

Mở file ở viewport mobile và desktop, kiểm tra Wallet, reward review, success, history, Demo/QA, keyboard Tab/Escape và không có overflow ngang.

- [ ] **Step 7: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "test: verify completed customer loyalty flow"
```

## Final verification gate

Trước khi báo hoàn thành:

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check HEAD~1..HEAD
git status --short
```

Báo chính xác số test pass/fail, nêu rõ failure baseline còn lại nếu có, và không tuyên bố toàn bộ suite đạt khi exit code khác 0.
