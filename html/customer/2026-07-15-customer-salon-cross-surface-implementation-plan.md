# Kế hoạch triển khai Customer Salon Cross-surface

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện hành trình Salon Scan → Guest Check-in → Checkout → Payment Proof → Payment Confirmed → Referral trong Customer App, đồng thời tạo companion prototype riêng cho Live Ticket, Staff Eligibility và Add-on Approval.

**Architecture:** Giữ nguyên đúng 31 `.app-screen` trong `cutomer-reward.html`; các trạng thái mới của Customer App là nested flow views bên trong `scan`, `pay`, `paydone` và `referral`. Tạo `customer-salon-operations.html` cho các flow Salon/Staff, dùng localStorage key riêng và chỉ đọc snapshot Customer App đã sanitize; Customer App có thể đọc snapshot Operations để nhập line item add-on đã accepted, nhưng không artifact nào ghi vào key thuộc artifact kia.

**Tech Stack:** HTML5, Tailwind CSS Browser CDN v4, Lucide Icons, vanilla JavaScript, `localStorage`, Node.js built-in test runner.

## Global Constraints

- Chỉ tạo hoặc sửa file trong `html/customer`.
- Giữ nguyên tên `cutomer-reward.html` và đúng 31 `.app-screen` hiện có.
- Không thêm runtime package; Customer App và companion đều dùng Tailwind Browser CDN v4 + Lucide.
- Tiếng Việt mặc định; mọi copy động phải có EN/VI trong dictionary.
- Customer App tiếp tục dùng key `nexora.customer.prototype.v1`; tăng `schemaVersion` từ `1` lên `2` để migrate dữ liệu cũ trong cùng key.
- Companion dùng key `nexora.customer.crosssurface.v1`, `schemaVersion: 1`.
- Customer key sở hữu `guestCheckins`, `checkoutDrafts`, `paymentProofs`, `receipts`, `guestRewardClaims`, `referrals`.
- Operations key sở hữu `serviceTickets`, `addOnRequests`, `staffEligibility`.
- NEXORA không giữ tiền. Card, Zelle, Venmo và Pay at Counter đều là đường thanh toán ngoài NEXORA trong prototype.
- Payment proof chỉ là bằng chứng chờ Front Desk xác minh; proof pending/rejected cộng `0` điểm.
- Điểm guest chỉ nằm trong `guestRewardClaims`; chỉ merge vào một business balance sau khi account được xác thực bằng cùng số điện thoại.
- Mỗi balance/ledger/reward claim phải có một `businessId`; không hiển thị tổng điểm cross-business.
- Referral trong Customer App là điểm do business tài trợ; không dùng ký hiệu `$` và không đưa affiliate cash vào flow.
- Live Ticket/Add-on/Staff Eligibility là mô phỏng cross-surface, không phải hiring marketplace.
- Mọi mutation phải atomic, idempotent và đi qua domain function; action lỗi không được hiển thị success.
- Mọi control enabled phải có action; disabled control phải có `disabled`/`aria-disabled` và lý do.
- Không dùng `@apply` với custom class `app-*`.
- Mỗi task kết thúc bằng test, diff check, review gate và commit riêng.

## Phân quyền sở hữu state

`customer-salon-cross-surface-design.md` liệt kê `serviceTickets`, `addOnRequests`, `staffEligibility` trong phần mở rộng Customer App nhưng đồng thời yêu cầu companion ghi state vận hành vào key riêng. Plan này chọn một owner duy nhất để tránh hai nguồn sự thật:

| Data | Owner | Artifact còn lại được làm gì |
|---|---|---|
| Guest check-in, checkout, proof, receipt, referral, guest reward claim | Customer key | Companion đọc snapshot đã sanitize |
| Live ticket, staff eligibility, add-on | Operations key | Customer đọc snapshot đã sanitize để nhập accepted add-on |

Cross-surface join dùng `guestCheckinId` và `ticketId`; không join theo tên hoặc số điện thoại hiển thị.

## Cấu trúc file

- Modify: `html/customer/cutomer-reward.html` — nested customer flows, schema v2, domain actions, renderers và controller.
- Modify: `html/customer/cutomer-reward.test.mjs` — domain/state/static contract tests; inventory vẫn đúng 31 screens.
- Create: `html/customer/customer-salon-operations.html` — standalone Salon/Staff companion prototype.
- Create: `html/customer/customer-salon-operations.test.mjs` — persistence, state transition, action và storage-isolation tests.
- Modify: `html/customer/customer-app-developer-spec.md` — contract guest check-in, checkout/proof/receipt và referral UI.
- Modify: `html/customer/customer-touch-business-document.md` — business workflow/state diagrams.
- Modify: `html/customer/customer-app-independent-guide.md` — state/action/testing handoff.
- Modify: `html/customer/customer-salon-cross-surface-design.md` — final ownership table và implemented screen map; không đổi trạng thái “Chờ review” nếu chưa có Product Owner approval.

## Hợp đồng screen và nested view

Customer App không thêm `.app-screen`; chỉ thêm nested view:

| Existing screen | Nested view IDs |
|---|---|
| `scan` | `scan-camera-view`, `scan-context-view`, `guest-checkin-view` |
| `pay` | `direct-payment-view`, `guest-checkout-view`, `payment-proof-view` |
| `paydone` | `payment-pending-view`, `payment-confirmed-view`, `payment-rejected-view` |
| `referral` | `referral-summary`, `referral-qr`, `referral-invite-list` |

Companion screen IDs:

| Screen | ID |
|---|---|
| Customer Live Ticket | `ops-liveticket` |
| Staff Not Eligible | `ops-staffnoteligible` |
| Approve Add-on | `ops-addonapproval` |

## Hợp đồng helper hiện có được các task sử dụng

Các task dưới đây được phép gọi các helper đã có sẵn trong `cutomer-reward.html`; implementer không đổi chữ ký của chúng:

```js
normalizedRequiredText(value): string | null
normalizeUsPhone(value): string
validStoredTimestamp(value): boolean
getValidBusiness(appState, businessId): object | null
domainTimestamp(now): { ok: true, value: string } | { ok: false, code: string }
createDomainId(prefix): { ok: true, value: string } | { ok: false, code: string }
appendLedger(appState, input): LedgerEntry | { ok: false, code: string }
commitState(mutator): unknown | { ok: false, code: string }
compressImage(file, maxEdge?, quality?): Promise<string>
sanitizeLookPhoto(value): string
navigateTo(screenId, options?): void
registerAction(name, handler): void
```

Trong test, `testApi()` tiếp tục là harness hiện có: nó nạp script bằng `vm`, inject memory `localStorage`, UUID xác định và trả `{ api, storage, context }`. Các fixture mới phải được khai báo ngay trong task đầu tiên sử dụng chúng; không dựa vào fixture ẩn.

---

### Task 1: Schema Customer v2 và hợp đồng cross-surface

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:126-220`
- Modify: `html/customer/cutomer-reward.html:265-455`
- Modify: `html/customer/cutomer-reward.html:455-1360`

**Interfaces:**
- Produces: `CUSTOMER_SCHEMA_VERSION = 2`
- Produces: `OPERATIONS_STORAGE_KEY = 'nexora.customer.crosssurface.v1'`
- Produces: `normalizeGuestCheckin(appState, value): GuestCheckin | null`
- Produces: `normalizeCheckoutDraft(appState, value): CheckoutDraft | null`
- Produces: `normalizePaymentProof(appState, value): PaymentProof | null`
- Produces: `normalizeReceipt(appState, value): Receipt | null`
- Produces: `normalizeGuestRewardClaim(appState, value): GuestRewardClaim | null`
- Produces: `normalizeReferral(appState, value): Referral | null`
- Produces: `readOperationsSnapshot(storage): OperationsSnapshot`

- [ ] **Step 1: Write failing schema and migration tests**

Add after the existing base state tests:

```js
test('migrates customer journey collections into schema v2 without changing the storage key', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    schemaVersion: 1,
    profile: { language: 'vi' },
    guestCheckins: [{
      id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', name: 'Amy Nguyen',
      phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny',
      station: 'front', sourceQr: 'https://nexoratouch.com/touch/bitcoin-nail-bar/front',
      status: 'checked_in', pointsPending: 120, scannedAt: '2026-07-15T03:04:42.000Z',
      claimedAt: null
    }]
  });

  assert.equal(api.STORAGE_KEY, 'nexora.customer.prototype.v1');
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.guestCheckins.length, 1);
  assert.deepEqual(migrated.checkoutDrafts, []);
  assert.deepEqual(migrated.paymentProofs, []);
  assert.deepEqual(migrated.receipts, []);
  assert.deepEqual(migrated.guestRewardClaims, []);
  assert.deepEqual(migrated.referrals, []);
});

test('drops malformed cross-surface customer records during migration', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    guestCheckins: [{ id: 'bad', businessId: 'unknown' }],
    checkoutDrafts: [{ id: 'bad', totalCents: -1 }],
    paymentProofs: [{ id: 'bad', status: 'verified' }],
    referrals: [{ id: 'bad', status: 'cash_paid' }]
  });
  assert.deepEqual(migrated.guestCheckins, []);
  assert.deepEqual(migrated.checkoutDrafts, []);
  assert.deepEqual(migrated.paymentProofs, []);
  assert.deepEqual(migrated.referrals, []);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="schema v2|cross-surface customer" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because schema version 2 and journey collections are absent.

- [ ] **Step 3: Add schema constants and default collections**

Change the version constant and add the operations key:

```js
const STORAGE_KEY = 'nexora.customer.prototype.v1';
const OPERATIONS_STORAGE_KEY = 'nexora.customer.crosssurface.v1';
const SCHEMA_VERSION = 2;
```

Add these root fields in `createDefaultState()` after `checkins`:

```js
guestCheckins: [],
checkoutDrafts: [],
paymentProofs: [],
receipts: [],
guestRewardClaims: [],
referrals: [],
```

Extend `ui.pendingContext` with stable nullable references and one scan context:

```js
scanContext: null,
guestCheckinId: null,
checkoutDraftId: null,
paymentProofId: null,
```

Add collection field contracts:

```js
guestCheckins: {
  id: 'string', businessId: 'string', name: 'string', phone: 'string', serviceKey: 'string',
  staffProfileId: 'nullableString', station: 'string', sourceQr: 'string', status: 'string',
  pointsPending: 'number', scannedAt: 'string', claimedAt: 'nullableString'
},
checkoutDrafts: {
  id: 'string', guestCheckinId: 'string', businessId: 'string', status: 'string',
  subtotalCents: 'number', discountCents: 'number', tipCents: 'number', totalCents: 'number',
  method: 'nullableString', createdAt: 'string'
},
paymentProofs: {
  id: 'string', checkoutDraftId: 'string', businessId: 'string', method: 'string',
  amountCents: 'number', status: 'string', createdAt: 'string', verifiedAt: 'nullableString'
},
receipts: {
  id: 'string', checkoutDraftId: 'string', businessId: 'string', method: 'string',
  tipCents: 'number', totalCents: 'number', createdAt: 'string'
},
guestRewardClaims: {
  id: 'string', guestCheckinId: 'string', businessId: 'string', sourceType: 'string',
  sourceId: 'string', points: 'number', status: 'string', createdAt: 'string', claimedAt: 'nullableString'
},
referrals: {
  id: 'string', referrerId: 'string', code: 'string', friendPhone: 'string', status: 'string',
  rewardPoints: 'number', businessId: 'nullableString', createdAt: 'string',
  joinedAt: 'nullableString', rewardedAt: 'nullableString'
}
```

- [ ] **Step 4: Add explicit normalizers and operations snapshot reader**

Add these status constants and shared helpers after `validStoredTimestamp`:

```js
const CHECKOUT_STATUSES = new Set(['draft', 'pending_verification', 'confirmed', 'rejected']);
const PROOF_STATUSES = new Set(['draft', 'pending_verification', 'verified', 'rejected']);
const REFERRAL_STATUSES = new Set(['invited', 'joined', 'rewarded']);
const REFERRAL_REWARD_POINTS = 50;
const CHECKOUT_METHODS = new Set(['Card', 'Zelle', 'Venmo', 'Pay at Counter']);
const TIP_BASIS_POINTS = new Set([0, 1500, 1800, 2000]);

function nonNegativeCents(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function replaceState(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
}

function readOperationsSnapshot(storage = window.localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(OPERATIONS_STORAGE_KEY) || 'null');
    if (!isRecord(raw) || raw.schemaVersion !== 1) return { serviceTickets: [], addOnRequests: [], staffEligibility: [] };
    return {
      serviceTickets: Array.isArray(raw.serviceTickets) ? structuredClone(raw.serviceTickets) : [],
      addOnRequests: Array.isArray(raw.addOnRequests) ? structuredClone(raw.addOnRequests) : [],
      staffEligibility: Array.isArray(raw.staffEligibility) ? structuredClone(raw.staffEligibility) : []
    };
  } catch {
    return { serviceTickets: [], addOnRequests: [], staffEligibility: [] };
  }
}

function normalizeGuestCheckin(appState, value) {
  if (!isRecord(value)) return null;
  const id = normalizedRequiredText(value.id);
  const businessId = normalizedRequiredText(value.businessId);
  const name = normalizedRequiredText(value.name);
  const phone = normalizeUsPhone(value.phone);
  const serviceKey = normalizedRequiredText(value.serviceKey);
  const station = normalizedRequiredText(value.station);
  const sourceQr = normalizedRequiredText(value.sourceQr);
  const staffProfileId = value.staffProfileId === null ? null : normalizedRequiredText(value.staffProfileId);
  const scannedAt = validStoredTimestamp(value.scannedAt) ? value.scannedAt : null;
  const claimedAt = value.claimedAt === null || validStoredTimestamp(value.claimedAt) ? value.claimedAt : undefined;
  if (!id || !getValidBusiness(appState, businessId) || !name || phone.length !== 10 || !serviceKey
    || !station || !sourceQr || value.status !== 'checked_in' || !Number.isSafeInteger(value.pointsPending)
    || value.pointsPending < 0 || !scannedAt || claimedAt === undefined) return null;
  return { id, businessId, name, phone, serviceKey, staffProfileId, station, sourceQr,
    status: 'checked_in', pointsPending: value.pointsPending, scannedAt, claimedAt };
}

function normalizeLineItems(value) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const lineItems = value.map((item) => ({
    id: normalizedRequiredText(item?.id),
    type: normalizedRequiredText(item?.type),
    label: normalizedRequiredText(item?.label),
    amountCents: Number.isSafeInteger(item?.amountCents) ? item.amountCents : null,
    sourceAddOnId: item?.sourceAddOnId === null || item?.sourceAddOnId === undefined
      ? null : normalizedRequiredText(item.sourceAddOnId)
  }));
  return lineItems.some((item) => !item.id || !item.type || !item.label || item.amountCents === null) ? null : lineItems;
}

function normalizeCheckoutDraft(appState, value) {
  if (!isRecord(value)) return null;
  const id = normalizedRequiredText(value.id);
  const guestCheckinId = normalizedRequiredText(value.guestCheckinId);
  const businessId = normalizedRequiredText(value.businessId);
  const lineItems = normalizeLineItems(value.lineItems);
  const status = CHECKOUT_STATUSES.has(value.status) ? value.status : null;
  const method = value.method === null || CHECKOUT_METHODS.has(value.method) ? value.method : undefined;
  const createdAt = validStoredTimestamp(value.createdAt) ? value.createdAt : null;
  const cents = ['subtotalCents', 'discountCents', 'beforeTipCents', 'tipCents', 'totalCents']
    .map((key) => nonNegativeCents(value[key]));
  if (!id || !appState.guestCheckins.some((row) => row.id === guestCheckinId && row.businessId === businessId)
    || !getValidBusiness(appState, businessId) || !lineItems || !status || method === undefined
    || !TIP_BASIS_POINTS.has(value.tipBasisPoints) || cents.includes(null) || !createdAt) return null;
  const [subtotalCents, discountCents, beforeTipCents, tipCents, totalCents] = cents;
  if (beforeTipCents !== subtotalCents - discountCents || totalCents !== beforeTipCents + tipCents) return null;
  return { id, guestCheckinId, businessId, lineItems, status, subtotalCents, discountCents,
    beforeTipCents, tipBasisPoints: value.tipBasisPoints, tipCents, totalCents, method, createdAt };
}

function normalizePaymentProof(appState, value) {
  if (!isRecord(value)) return null;
  const id = normalizedRequiredText(value.id);
  const checkoutDraftId = normalizedRequiredText(value.checkoutDraftId);
  const checkout = appState.checkoutDrafts.find((row) => row.id === checkoutDraftId);
  const businessId = normalizedRequiredText(value.businessId);
  const method = CHECKOUT_METHODS.has(value.method) ? value.method : null;
  const status = PROOF_STATUSES.has(value.status) ? value.status : null;
  const amountCents = nonNegativeCents(value.amountCents);
  const createdAt = validStoredTimestamp(value.createdAt) ? value.createdAt : null;
  const verifiedAt = value.verifiedAt === null || validStoredTimestamp(value.verifiedAt) ? value.verifiedAt : undefined;
  if (!id || !checkout || checkout.businessId !== businessId || !method || !status || amountCents === null
    || amountCents !== checkout.totalCents || !createdAt || verifiedAt === undefined) return null;
  const aligned = (status === 'verified' && checkout.status === 'confirmed' && verifiedAt)
    || (status === 'rejected' && checkout.status === 'rejected' && verifiedAt)
    || (['draft', 'pending_verification'].includes(status)
      && ['draft', 'pending_verification'].includes(checkout.status) && verifiedAt === null);
  if (!aligned) return null;
  return { id, checkoutDraftId, businessId, method, amountCents, status,
    note: typeof value.note === 'string' ? value.note.slice(0, 280) : '',
    imageDataUrl: sanitizeLookPhoto(value.imageDataUrl), rejectReason: normalizedRequiredText(value.rejectReason),
    createdAt, verifiedAt };
}

function normalizeReceipt(appState, value) {
  if (!isRecord(value)) return null;
  const checkout = appState.checkoutDrafts.find((row) => row.id === normalizedRequiredText(value.checkoutDraftId));
  const createdAt = validStoredTimestamp(value.createdAt) ? value.createdAt : null;
  return normalizedRequiredText(value.id) && checkout?.status === 'confirmed'
    && value.businessId === checkout.businessId && value.totalCents === checkout.totalCents && createdAt
    ? { id: value.id.trim(), checkoutDraftId: checkout.id, businessId: checkout.businessId,
      method: checkout.method, tipCents: checkout.tipCents, totalCents: checkout.totalCents,
      lineItems: structuredClone(checkout.lineItems), createdAt }
    : null;
}

function normalizeGuestRewardClaim(appState, value) {
  if (!isRecord(value)) return null;
  const checkin = appState.guestCheckins.find((row) => row.id === normalizedRequiredText(value.guestCheckinId));
  const createdAt = validStoredTimestamp(value.createdAt) ? value.createdAt : null;
  const claimedAt = value.claimedAt === null || validStoredTimestamp(value.claimedAt) ? value.claimedAt : undefined;
  const status = ['pending', 'claimed'].includes(value.status) ? value.status : null;
  return normalizedRequiredText(value.id) && checkin && value.businessId === checkin.businessId
    && normalizedRequiredText(value.sourceType) && normalizedRequiredText(value.sourceId)
    && Number.isSafeInteger(value.points) && value.points > 0 && status && createdAt && claimedAt !== undefined
    && ((status === 'pending' && claimedAt === null) || (status === 'claimed' && claimedAt))
    ? { id: value.id.trim(), guestCheckinId: checkin.id, businessId: checkin.businessId,
      sourceType: value.sourceType.trim(), sourceId: value.sourceId.trim(), points: value.points,
      status, createdAt, claimedAt }
    : null;
}

function normalizeReferral(appState, value) {
  if (!isRecord(value)) return null;
  const id = normalizedRequiredText(value.id);
  const referrerId = normalizedRequiredText(value.referrerId);
  const code = normalizedRequiredText(value.code);
  const friendPhone = normalizeUsPhone(value.friendPhone);
  const status = REFERRAL_STATUSES.has(value.status) ? value.status : null;
  const createdAt = validStoredTimestamp(value.createdAt) ? value.createdAt : null;
  const rewardedAt = value.rewardedAt === null || validStoredTimestamp(value.rewardedAt) ? value.rewardedAt : undefined;
  const joinedAt = value.joinedAt === null || validStoredTimestamp(value.joinedAt) ? value.joinedAt : undefined;
  const businessId = value.businessId === null ? null : normalizedRequiredText(value.businessId);
  if (!id || referrerId !== appState.profile.id || !code || friendPhone.length !== 10 || !status
    || !Number.isSafeInteger(value.rewardPoints) || value.rewardPoints < 0 || !createdAt
    || joinedAt === undefined || rewardedAt === undefined) return null;
  const aligned = status === 'invited'
    ? joinedAt === null && rewardedAt === null && businessId === null && value.rewardPoints === 0
    : status === 'joined'
      ? joinedAt && rewardedAt === null && businessId === null && value.rewardPoints === 0
      : joinedAt && rewardedAt && getValidBusiness(appState, businessId) && value.rewardPoints === REFERRAL_REWARD_POINTS;
  if (!aligned) return null;
  return { id, referrerId, code, friendPhone, status, rewardPoints: value.rewardPoints,
    businessId, createdAt, joinedAt, rewardedAt };
}
```

Thay phần merge sáu collection bằng đoạn thứ tự cố định sau để mọi foreign key chỉ trỏ tới record đã sống sót:

```js
const normalizeList = (values, normalizer) => Array.isArray(values)
  ? values.map((value) => normalizer(appState, value)).filter(Boolean)
  : [];
appState.guestCheckins = normalizeList(incoming.guestCheckins, normalizeGuestCheckin);
appState.checkoutDrafts = normalizeList(incoming.checkoutDrafts, normalizeCheckoutDraft);
appState.paymentProofs = normalizeList(incoming.paymentProofs, normalizePaymentProof);
appState.receipts = normalizeList(incoming.receipts, normalizeReceipt);
appState.guestRewardClaims = normalizeList(incoming.guestRewardClaims, normalizeGuestRewardClaim);
appState.referrals = normalizeList(incoming.referrals, normalizeReferral);
for (const [field, collection] of [
  ['guestCheckinId', appState.guestCheckins], ['checkoutDraftId', appState.checkoutDrafts],
  ['paymentProofId', appState.paymentProofs]
]) {
  if (appState.ui.pendingContext[field] !== null
    && !collection.some((row) => row.id === appState.ui.pendingContext[field])) appState.ui.pendingContext[field] = null;
}
```

- [ ] **Step 5: Expose contracts and verify focused tests pass**

Add to `window.NEXORA_TEST_API`:

```js
OPERATIONS_STORAGE_KEY,
readOperationsSnapshot,
normalizeGuestCheckin,
normalizeCheckoutDraft,
normalizePaymentProof,
normalizeReceipt,
normalizeGuestRewardClaim,
normalizeReferral,
```

Run:

```bash
node --test --test-name-pattern="schema v2|cross-surface customer" html/customer/cutomer-reward.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Run migration regression and commit**

Run:

```bash
node --test --test-name-pattern="migrates|persists state|malformed" html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: all selected tests PASS; diff check has no output.

Commit:

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add customer journey schema v2"
```

**Review gate:** Reviewer verifies old v1 JSON migrates, malformed records fail closed, no points change during migration and the storage key remains unchanged.

---

### Task 2: Quét đa salon và luồng Guest Check-in lồng

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:2980-3180`
- Modify: `html/customer/cutomer-reward.html:190-207`
- Modify: `html/customer/cutomer-reward.html:269-330`
- Modify: `html/customer/cutomer-reward.html:1980-2330`
- Modify: `html/customer/cutomer-reward.html:4041-4065`

**Interfaces:**
- Consumes: `parseNexoraQr`, `submitCheckin`, schema v2 pending context.
- Produces: `stageSalonScan(appState, payload): {ok, context}`
- Produces: `createGuestCheckin(appState, input, now?): {ok, guestCheckin}`
- Produces: `completeMemberSalonCheckin(appState, online, now?): CheckinResult`
- Produces actions: `start-scan`, `enter-code`, `member-salon-checkin`, `open-guest-checkin`, `submit-guest-checkin`.

- [ ] **Step 1: Write failing multi-salon and guest tests**

```js
test('stages a salon scan without awarding points and supports a different salon next', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app.balances);
  const first = api.stageSalonScan(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna');
  assert.equal(first.context.businessId, 'bitcoin-nail-bar');
  assert.equal(JSON.stringify(app.balances), before);
  const second = api.stageSalonScan(app, 'https://nexoratouch.com/touch/golden-glow-spa/lobby');
  assert.equal(second.context.businessId, 'golden-glow-spa');
  assert.equal(app.ui.selectedBusinessId, 'golden-glow-spa');
});

test('creates a guest check-in claim without crediting the signed-in profile', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  api.stageSalonScan(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front');
  const before = app.balances['bitcoin-nail-bar'].points;
  const result = api.createGuestCheckin(app, {
    name: 'Amy Nguyen', phone: '832-555-0198', serviceKey: 'deluxe-pedicure', staffProfileId: null
  }, Date.parse('2026-07-15T03:04:42.000Z'));
  assert.equal(result.ok, true);
  assert.equal(result.guestCheckin.pointsPending, 120);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(app.ledger.some((entry) => entry.refId === result.guestCheckin.id), false);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

```bash
node --test --test-name-pattern="stages a salon scan|creates a guest check-in" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because `stageSalonScan` and `createGuestCheckin` are missing.

- [ ] **Step 3: Implement pure scan staging and guest creation**

Add after `parseNexoraQr`:

```js
function stageSalonScan(appState, payload) {
  if (!isRecord(appState?.ui?.pendingContext)) return { ok: false, code: 'invalid_state' };
  const parsed = parseNexoraQr(payload);
  if (!parsed.ok) return parsed;
  const business = getValidBusiness(appState, parsed.businessId);
  if (!business) return { ok: false, code: 'unknown_business' };
  const context = { payload, businessId: parsed.businessId, station: parsed.station, staffProfileId: parsed.staffProfileId };
  appState.ui.selectedBusinessId = parsed.businessId;
  appState.ui.pendingContext.scanContext = context;
  return { ok: true, context, business };
}

function createGuestCheckin(appState, input, now = Date.now()) {
  const context = appState?.ui?.pendingContext?.scanContext;
  if (!isRecord(context) || !isRecord(input) || !Array.isArray(appState.guestCheckins)) {
    return { ok: false, code: 'invalid_state' };
  }
  const name = normalizedRequiredText(input.name);
  const phone = normalizeUsPhone(input.phone);
  const serviceKey = normalizedRequiredText(input.serviceKey);
  const staffProfileId = input.staffProfileId === null ? null : normalizedRequiredText(input.staffProfileId);
  if (!name || phone.length !== 10 || !serviceKey
    || (staffProfileId && CHECKIN_STAFF_BUSINESSES[staffProfileId] !== context.businessId)) return { ok: false, code: 'invalid_guest' };
  const business = getValidBusiness(appState, context.businessId);
  if (!business || !Number.isSafeInteger(business.checkinPoints) || business.checkinPoints < 0) {
    return { ok: false, code: 'invalid_rule' };
  }
  const timestamp = domainTimestamp(now);
  if (!timestamp.ok) return timestamp;
  const id = createDomainId('guest-checkin');
  if (!id.ok) return id;
  const guestCheckin = {
    id: id.value, businessId: context.businessId, name, phone, serviceKey,
    staffProfileId, station: context.station, sourceQr: context.payload,
    status: 'checked_in', pointsPending: business.checkinPoints, scannedAt: timestamp.value, claimedAt: null
  };
  appState.guestCheckins = [...appState.guestCheckins, guestCheckin];
  appState.ui.pendingContext.guestCheckinId = guestCheckin.id;
  return { ok: true, guestCheckin };
}
```

- [ ] **Step 4: Replace hardcoded scan behavior with nested views**

Inside the existing `scan` section, keep the camera surface and add:

```html
<div id="scan-camera-view" data-scan-view="camera">
  <label class="mt-5 block text-sm font-bold" for="scan-demo-business" data-en="Demo salon QR" data-vi="QR salon mô phỏng">QR salon mô phỏng</label>
  <select id="scan-demo-business" class="app-input mt-2">
    <option value="https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna">Bitcoin Nail Bar</option>
    <option value="https://nexoratouch.com/touch/golden-glow-spa/lobby">Golden Glow Spa</option>
    <option value="https://nexoratouch.com/touch/moon-coffee/counter">Moon Coffee</option>
  </select>
  <button type="button" class="app-button mt-4 w-full" data-action="start-scan" data-en="Scan salon QR" data-vi="Quét QR salon">Quét QR salon</button>
  <button type="button" class="app-button-secondary mt-3 w-full" data-action="enter-code" data-en="Enter code" data-vi="Nhập mã">Nhập mã</button>
</div>

<div id="scan-context-view" class="hidden" data-scan-view="context">
  <div class="app-card">
    <p class="eyebrow" data-en="Salon recognized" data-vi="Đã nhận diện salon">Đã nhận diện salon</p>
    <h2 id="scan-context-business" class="mt-2 text-xl font-black"></h2>
    <dl class="mt-4 space-y-3 text-sm">
      <div class="flex justify-between"><dt data-en="Customer" data-vi="Khách hàng">Khách hàng</dt><dd data-scan-customer class="font-bold"></dd></div>
      <div class="flex justify-between"><dt data-en="Rewards available" data-vi="Điểm hiện có">Điểm hiện có</dt><dd data-scan-balance class="font-bold"></dd></div>
      <div class="flex justify-between"><dt data-en="Favorite staff" data-vi="Thợ yêu thích">Thợ yêu thích</dt><dd data-scan-staff class="font-bold"></dd></div>
      <div class="flex justify-between"><dt data-en="Last service" data-vi="Dịch vụ gần nhất">Dịch vụ gần nhất</dt><dd data-scan-service class="font-bold"></dd></div>
    </dl>
  </div>
  <button type="button" class="app-button mt-4 w-full" data-action="member-salon-checkin" data-en="Check in here" data-vi="Check-in tại đây">Check-in tại đây</button>
  <button type="button" class="app-button-secondary mt-3 w-full" data-action="open-guest-checkin" data-en="Continue as guest" data-vi="Tiếp tục với tư cách khách">Tiếp tục với tư cách khách</button>
</div>

<form id="guest-checkin-view" class="hidden" data-scan-view="guest" novalidate>
  <div class="app-card space-y-4">
    <label class="block text-sm font-bold">Name<input id="guest-name" class="app-input mt-2" autocomplete="name"></label>
    <label class="block text-sm font-bold">Phone<input id="guest-phone" class="app-input mt-2" type="tel" inputmode="tel" autocomplete="tel"></label>
    <label class="block text-sm font-bold">Service<select id="guest-service" class="app-input mt-2"><option value="deluxe-pedicure">Deluxe Pedicure — $55</option><option value="acrylic-full-set">Acrylic Full Set — $65</option></select></label>
    <label class="block text-sm font-bold">Technician<select id="guest-staff" class="app-input mt-2"><option value="">No preference</option><option value="staff-anna">Anna</option><option value="staff-maria">Maria</option></select></label>
    <p id="guest-checkin-error" class="field-error hidden" role="alert"></p>
    <button type="button" class="app-button w-full" data-action="submit-guest-checkin" data-en="Check in now" data-vi="Check-in ngay">Check-in ngay</button>
  </div>
</form>
```

The manual-code action uses this exact overlay control; it must not route to onboarding:

```js
function openManualSalonCode(trigger) {
  const content = document.createElement('label');
  content.className = 'block text-sm font-bold';
  content.textContent = state.profile.language === 'vi' ? 'URL QR salon' : 'Salon QR URL';
  const input = document.createElement('input');
  input.id = 'manual-salon-code';
  input.className = 'app-input mt-2';
  input.placeholder = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front';
  content.append(input);
  openOverlay({
    title: state.profile.language === 'vi' ? 'Nhập mã salon' : 'Enter salon code',
    content,
    onConfirm: () => {
      const result = commitState((draft) => stageSalonScan(draft, input.value));
      if (!result.ok) return showToast(t('invalidQr'), 'error');
      renderScanContext();
      setScanView('context');
    }
  }, trigger);
}
```

- [ ] **Step 5: Register actions and render scan context**

Add the view controller and renderer:

```js
function setScanView(name) {
  document.querySelectorAll('[data-scan-view]').forEach((view) => {
    const active = view.dataset.scanView === name;
    view.classList.toggle('hidden', !active);
    view.setAttribute('aria-hidden', String(!active));
  });
}

function renderScanContext() {
  const context = state.ui.pendingContext.scanContext;
  const business = context ? getValidBusiness(state, context.businessId) : null;
  if (!business) return setScanView('camera');
  const balance = state.balances[business.id];
  document.getElementById('scan-context-business').textContent = business.name;
  document.querySelector('[data-scan-customer]').textContent = state.profile.name;
  document.querySelector('[data-scan-balance]').textContent = `${balance.points} ${t('points')}`;
  document.querySelector('[data-scan-staff]').textContent = context.staffProfileId
    ? (state.staffProfiles[context.staffProfileId]?.name || t('noPreference')) : t('noPreference');
  document.querySelector('[data-scan-service]').textContent = t('notAvailable');
}
```

Replace both existing scan registrations with these exact actions:

```js
registerAction('start-scan', () => {
  const line = document.getElementById('scan-line');
  const loading = document.getElementById('scan-loading-state');
  line?.classList.remove('hidden');
  loading?.classList.remove('hidden');
  window.setTimeout(() => {
    line?.classList.add('hidden');
    loading?.classList.add('hidden');
    const payload = document.getElementById('scan-demo-business').value;
    const result = commitState((draft) => stageSalonScan(draft, payload));
    if (!result.ok) return showToast(t('invalidQr'), 'error');
    renderScanContext();
    setScanView('context');
  }, 450);
});
registerAction('enter-code', (control) => openManualSalonCode(control));
registerAction('member-salon-checkin', () => {
  const context = state.ui.pendingContext.scanContext;
  const result = context
    ? commitState((draft) => submitCheckin(draft, context.payload, window.navigator?.onLine !== false))
    : { ok: false, code: 'missing_scan_context' };
  if (!result.ok) return showToast(result.code === 'duplicate_checkin' ? t('recentCheckin') : t('invalidQr'), 'error');
  renderApp();
  showToast(result.queued ? t('checkinQueued') : t('checkinSuccess'));
  navigateTo('home');
});
registerAction('open-guest-checkin', () => setScanView('guest'));
registerAction('submit-guest-checkin', () => {
  const result = commitState((draft) => createGuestCheckin(draft, {
    name: document.getElementById('guest-name').value,
    phone: document.getElementById('guest-phone').value,
    serviceKey: document.getElementById('guest-service').value,
    staffProfileId: document.getElementById('guest-staff').value || null
  }));
  if (!result.ok) return setFieldError('guest-checkin-error', t('invalidGuest'));
  setFieldError('guest-checkin-error');
  renderApp();
  showToast(t('guestCheckinSuccess'));
  navigateTo('pay');
});
```

Expose the Task 2 domain functions in `window.NEXORA_TEST_API`:

```js
stageSalonScan,
createGuestCheckin,
```

- [ ] **Step 6: Verify tests, screen inventory and commit**

```bash
node --test --test-name-pattern="salon scan|guest check-in|31-screen|screen inventory|QR" html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: focused tests PASS; `.app-screen` count stays 31.

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add multi-salon guest check-in flow"
```

**Review gate:** Reviewer verifies two different salon QR values select different business balances, guest check-in awards no profile points, Enter Code is functional, and existing offline member check-in remains intact.

---

### Task 3: Tính tiền Guest Checkout và điều hướng thanh toán

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs` after guest check-in tests.
- Modify: `html/customer/cutomer-reward.html:135-140`
- Modify: `html/customer/cutomer-reward.html:2320-2590`
- Modify: `html/customer/cutomer-reward.html:3190-3250`
- Modify: `html/customer/cutomer-reward.html:4040-4140`

**Interfaces:**
- Consumes: `guestCheckinId`, `CHECKOUT_METHODS`, `TIP_BASIS_POINTS`, operations snapshot reader.
- Produces: `calculateCheckoutTotals(lineItems, tipBasisPoints): CheckoutTotals`
- Produces: `createCheckoutDraft(appState, input, now?): {ok, checkoutDraft}`
- Produces: `setCheckoutTip(appState, checkoutDraftId, basisPoints): Result`
- Produces: `setCheckoutMethod(appState, checkoutDraftId, method): Result`
- Produces: `submitCheckoutWithoutUpload(appState, checkoutDraftId, now?): Result`
- Produces actions: `open-guest-checkout`, `select-checkout-tip`, `select-checkout-method`, `continue-checkout`.

- [ ] **Step 1: Write failing money tests using integer cents**

```js
function seedGuestCheckin(api, app, overrides = {}) {
  const scan = api.stageSalonScan(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front');
  assert.equal(scan.ok, true);
  const created = api.createGuestCheckin(app, {
    name: 'Amy Nguyen', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-anna',
    ...overrides
  }, 1000);
  assert.equal(created.ok, true);
  return created.guestCheckin;
}

test('calculates checkout promo tip and total in integer cents', () => {
  const { api } = testApi();
  const totals = api.calculateCheckoutTotals([
    { id: 'service', type: 'service', label: 'Deluxe Pedicure', amountCents: 5500 },
    { id: 'promo', type: 'discount', label: 'Promo NEW10', amountCents: -550 },
    { id: 'addon', type: 'addon', label: 'Gel Polish', amountCents: 1500 }
  ], 1800);
  assert.equal(JSON.stringify(totals), JSON.stringify({
    subtotalCents: 7000, discountCents: 550, beforeTipCents: 6450,
    tipCents: 1161, totalCents: 7611
  }));
});

test('keeps a checkout draft unconfirmed until payment verification', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const result = api.createCheckoutDraft(app, {
    guestCheckinId: guest.id,
    lineItems: [{ id: 'service', type: 'service', label: 'Deluxe Pedicure', amountCents: 5500 }]
  }, 1000);
  assert.equal(result.checkoutDraft.status, 'draft');
  assert.equal(app.guestRewardClaims.length, 0);
  assert.equal(app.receipts.length, 0);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

```bash
node --test --test-name-pattern="checkout promo|checkout draft" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because checkout domain functions are missing.

- [ ] **Step 3: Implement totals and draft actions**

```js
const SERVICE_CATALOG = Object.freeze({
  'deluxe-pedicure': { label: 'Deluxe Pedicure', amountCents: 5500 },
  'acrylic-full-set': { label: 'Acrylic Full Set', amountCents: 6500 }
});

function calculateCheckoutTotals(lineItems, tipBasisPoints = 0) {
  if (!Array.isArray(lineItems) || !TIP_BASIS_POINTS.has(tipBasisPoints)) return { ok: false, code: 'invalid_checkout' };
  const canonical = lineItems.map((item) => ({
    id: normalizedRequiredText(item?.id), type: normalizedRequiredText(item?.type),
    label: normalizedRequiredText(item?.label), amountCents: Number.isSafeInteger(item?.amountCents) ? item.amountCents : null
  }));
  if (canonical.some((item) => !item.id || !item.type || !item.label || item.amountCents === null)) return { ok: false, code: 'invalid_line_item' };
  const positive = canonical.filter((item) => item.amountCents > 0).reduce((sum, item) => sum + item.amountCents, 0);
  const discount = Math.abs(canonical.filter((item) => item.amountCents < 0).reduce((sum, item) => sum + item.amountCents, 0));
  const beforeTipCents = positive - discount;
  if (!Number.isSafeInteger(beforeTipCents) || beforeTipCents < 0) return { ok: false, code: 'invalid_total' };
  const tipCents = Math.round(beforeTipCents * tipBasisPoints / 10000);
  return { subtotalCents: positive, discountCents: discount, beforeTipCents, tipCents, totalCents: beforeTipCents + tipCents };
}

function createCheckoutDraft(appState, input, now = Date.now()) {
  if (!isRecord(input)) return { ok: false, code: 'invalid_checkout' };
  const guestCheckin = appState.guestCheckins.find((row) => row.id === input.guestCheckinId);
  if (!guestCheckin || appState.checkoutDrafts.some((row) => row.guestCheckinId === guestCheckin.id && row.status !== 'rejected')) {
    const existing = appState.checkoutDrafts.find((row) => row.guestCheckinId === input.guestCheckinId && row.status !== 'rejected');
    if (!existing) return { ok: false, code: 'guest_not_found' };
    appState.ui.pendingContext.checkoutDraftId = existing.id;
    return { ok: true, checkoutDraft: existing, idempotent: true };
  }
  const lineItems = normalizeLineItems(input.lineItems);
  const totals = lineItems ? calculateCheckoutTotals(lineItems, 0) : { ok: false };
  if (!lineItems || totals.ok === false) return { ok: false, code: 'invalid_line_items' };
  const timestamp = domainTimestamp(now);
  const id = createDomainId('checkout');
  if (!timestamp.ok || !id.ok) return !timestamp.ok ? timestamp : id;
  const checkoutDraft = {
    id: id.value, guestCheckinId: guestCheckin.id, businessId: guestCheckin.businessId,
    lineItems: structuredClone(lineItems), status: 'draft', ...totals,
    tipBasisPoints: 0, method: null, createdAt: timestamp.value
  };
  appState.checkoutDrafts.push(checkoutDraft);
  appState.ui.pendingContext.checkoutDraftId = checkoutDraft.id;
  return { ok: true, checkoutDraft };
}

function setCheckoutTip(appState, checkoutDraftId, basisPoints) {
  const draft = appState.checkoutDrafts.find((row) => row.id === checkoutDraftId);
  if (!draft || draft.status !== 'draft' || !TIP_BASIS_POINTS.has(basisPoints)) return { ok: false, code: 'invalid_tip' };
  const totals = calculateCheckoutTotals(draft.lineItems, basisPoints);
  if (totals.ok === false) return totals;
  Object.assign(draft, totals, { tipBasisPoints: basisPoints });
  return { ok: true, checkoutDraft: draft };
}

function setCheckoutMethod(appState, checkoutDraftId, method) {
  const draft = appState.checkoutDrafts.find((row) => row.id === checkoutDraftId);
  if (!draft || draft.status !== 'draft' || !CHECKOUT_METHODS.has(method)) return { ok: false, code: 'invalid_method' };
  draft.method = method;
  return { ok: true, checkoutDraft: draft };
}

function submitCheckoutWithoutUpload(appState, checkoutDraftId, now = Date.now()) {
  const checkout = appState.checkoutDrafts.find((row) => row.id === checkoutDraftId);
  if (!checkout || checkout.status !== 'draft' || !['Card', 'Pay at Counter'].includes(checkout.method)) {
    return { ok: false, code: 'invalid_checkout_state' };
  }
  const timestamp = domainTimestamp(now);
  const id = createDomainId('proof');
  if (!timestamp.ok || !id.ok) return !timestamp.ok ? timestamp : id;
  const proof = { id: id.value, checkoutDraftId: checkout.id, businessId: checkout.businessId,
    method: checkout.method, amountCents: checkout.totalCents, status: 'pending_verification',
    note: '', imageDataUrl: '', rejectReason: null, createdAt: timestamp.value, verifiedAt: null };
  appState.paymentProofs.push(proof);
  checkout.status = 'pending_verification';
  appState.ui.pendingContext.paymentProofId = proof.id;
  return { ok: true, proof };
}
```

- [ ] **Step 4: Add nested Guest Checkout UI inside `pay`**

Immediately after the existing pay-screen heading, insert `<div id="direct-payment-view" data-pay-view="direct">`. Immediately before the new Guest Checkout section, insert `</div>`, so every pre-existing direct-payment control remains byte-for-byte unchanged inside that wrapper. Add this button as the wrapper’s final child, then add the exact nested views:

```html
<button type="button" class="app-button-secondary mt-3 w-full" data-action="open-guest-checkout" data-en="Guest checkout" data-vi="Thanh toán khách">Thanh toán khách</button>
<section id="guest-checkout-view" class="hidden" data-pay-view="checkout" aria-labelledby="guest-checkout-title">
  <div class="app-card">
    <h2 id="guest-checkout-title" class="text-xl font-black" data-en="Guest Checkout" data-vi="Thanh toán khách">Thanh toán khách</h2>
    <div id="guest-checkout-items" class="mt-4 divide-y divide-dashed"></div>
    <div class="mt-4 flex justify-between text-xl font-black"><span data-en="Before Tip" data-vi="Trước tip">Trước tip</span><strong id="checkout-before-tip"></strong></div>
  </div>
  <fieldset class="app-card mt-4"><legend class="font-black" data-en="Tip technician" data-vi="Tip cho thợ">Tip cho thợ</legend>
    <div class="mt-3 grid grid-cols-2 gap-3">
      <button type="button" class="app-chip" data-action="select-checkout-tip" data-basis-points="0">No Tip</button>
      <button type="button" class="app-chip" data-action="select-checkout-tip" data-basis-points="1500">15%</button>
      <button type="button" class="app-chip" data-action="select-checkout-tip" data-basis-points="1800">18%</button>
      <button type="button" class="app-chip" data-action="select-checkout-tip" data-basis-points="2000">20%</button>
    </div>
  </fieldset>
  <fieldset class="app-card mt-4"><legend class="font-black" data-en="Payment method" data-vi="Phương thức thanh toán">Phương thức thanh toán</legend>
    <div class="mt-3 grid gap-3">
      <button type="button" class="app-button-secondary" data-action="select-checkout-method" data-method="Card">Card</button>
      <button type="button" class="app-button-secondary" data-action="select-checkout-method" data-method="Zelle">Zelle</button>
      <button type="button" class="app-button-secondary" data-action="select-checkout-method" data-method="Venmo">Venmo</button>
      <button type="button" class="app-button-secondary" data-action="select-checkout-method" data-method="Pay at Counter">Pay at Counter</button>
    </div>
  </fieldset>
  <p id="checkout-error" class="field-error hidden" role="alert"></p>
  <button id="continue-checkout" type="button" class="app-button mt-4 w-full" data-action="continue-checkout" disabled data-en="Continue" data-vi="Tiếp tục">Tiếp tục</button>
</section>
<section id="payment-proof-view" class="hidden" data-pay-view="payment-proof" aria-labelledby="payment-proof-title">
  <div class="app-card">
    <h2 id="payment-proof-title" class="text-xl font-black" data-en="Payment Proof" data-vi="Bằng chứng thanh toán">Bằng chứng thanh toán</h2>
    <div class="mt-4 flex justify-between"><span id="payment-proof-method"></span><strong id="payment-proof-amount"></strong></div>
  </div>
</section>
```

Add the renderer; it reads cents only from state:

```js
const formatCents = (cents) => new Intl.NumberFormat(state.profile.language === 'vi' ? 'vi-VN' : 'en-US', {
  style: 'currency', currency: 'USD'
}).format(cents / 100);

function showPayView(name) {
  document.querySelectorAll('[data-pay-view]').forEach((view) => view.classList.toggle('hidden', view.dataset.payView !== name));
}

function renderGuestCheckout() {
  const draft = state.checkoutDrafts.find((row) => row.id === state.ui.pendingContext.checkoutDraftId);
  if (!draft) return;
  const list = document.getElementById('guest-checkout-items');
  list.replaceChildren(...draft.lineItems.map((item) => {
    const row = document.createElement('div');
    row.className = 'flex justify-between gap-3 py-2';
    const label = document.createElement('span');
    const amount = document.createElement('strong');
    label.textContent = item.label;
    amount.textContent = formatCents(item.amountCents);
    row.append(label, amount);
    return row;
  }));
  document.getElementById('checkout-before-tip').textContent = formatCents(draft.beforeTipCents);
  document.querySelectorAll('[data-action="select-checkout-tip"]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.basisPoints) === draft.tipBasisPoints));
  });
  document.querySelectorAll('[data-action="select-checkout-method"]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.method === draft.method));
  });
  document.getElementById('continue-checkout').disabled = !draft.method;
}

function renderPaymentProof() {
  const draft = state.checkoutDrafts.find((row) => row.id === state.ui.pendingContext.checkoutDraftId);
  if (!draft) return;
  document.getElementById('payment-proof-method').textContent = draft.method;
  document.getElementById('payment-proof-amount').textContent = formatCents(draft.totalCents);
}
```

- [ ] **Step 5: Route by method**

Register the checkout actions and route by method:

```js
registerAction('open-guest-checkout', () => {
  const guest = state.guestCheckins.find((row) => row.id === state.ui.pendingContext.guestCheckinId);
  if (!guest) return showToast(t('guestNotFound'), 'error');
  const service = SERVICE_CATALOG[guest.serviceKey];
  if (!service) return showToast(t('serviceNotFound'), 'error');
  const lineItems = [{ id: `service-${guest.id}`, type: 'service', label: service.label, amountCents: service.amountCents }];
  if (guest.serviceKey === 'deluxe-pedicure') lineItems.push({ id: `promo-${guest.id}`, type: 'discount', label: 'Promo NEW10', amountCents: -550 });
  const result = commitState((draft) => createCheckoutDraft(draft, { guestCheckinId: guest.id, lineItems }));
  if (!result.ok) return showToast(t('checkoutFailed'), 'error');
  renderGuestCheckout();
  showPayView('checkout');
});
registerAction('select-checkout-tip', (control) => {
  const result = commitState((draft) => setCheckoutTip(draft, draft.ui.pendingContext.checkoutDraftId, Number(control.dataset.basisPoints)));
  if (!result.ok) return showToast(t('checkoutFailed'), 'error');
  renderGuestCheckout();
});
registerAction('select-checkout-method', (control) => {
  const result = commitState((draft) => setCheckoutMethod(draft, draft.ui.pendingContext.checkoutDraftId, control.dataset.method));
  if (!result.ok) return showToast(t('checkoutFailed'), 'error');
  renderGuestCheckout();
});
registerAction('continue-checkout', () => {
  const draft = state.checkoutDrafts.find((row) => row.id === state.ui.pendingContext.checkoutDraftId);
  if (!draft?.method) return setFieldError('checkout-error', t('selectPaymentMethod'));
  if (['Zelle', 'Venmo'].includes(draft.method)) {
    renderPaymentProof();
    showPayView('payment-proof');
    return;
  }
  const proof = commitState((next) => submitCheckoutWithoutUpload(next, draft.id));
  if (!proof.ok) return setFieldError('checkout-error', t('checkoutFailed'));
  navigateTo('paydone');
});
```

Expose the Task 3 domain functions in `window.NEXORA_TEST_API`:

```js
calculateCheckoutTotals,
createCheckoutDraft,
setCheckoutTip,
setCheckoutMethod,
submitCheckoutWithoutUpload,
```

Card means pay on the salon terminal; Pay at Counter means Front Desk collects payment. Both remain `pending_verification` until a demo Front Desk confirmation.

- [ ] **Step 6: Verify and commit**

```bash
node --test --test-name-pattern="checkout|direct payment|tip points" html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: focused tests PASS; existing direct-payment tests remain green.

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add guest checkout totals"
```

**Review gate:** Reviewer recalculates `$55.00 - $5.50 + $15.00 + 18% = $76.11`, verifies no floating-point drift and confirms checkout draft creates no points/receipt.

---

### Task 4: Vòng đời Payment Proof và biên nhận đã xác nhận

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs` after checkout tests.
- Modify: `html/customer/cutomer-reward.html:135-140`
- Modify: `html/customer/cutomer-reward.html` near `compressImage`, transaction functions and pay renderers.

**Interfaces:**
- Produces: `submitPaymentProof(appState, input, now?): {ok, proof}`
- Produces: `verifyPaymentProof(appState, proofId, now?): {ok, proof, receipt, claims}`
- Produces: `rejectPaymentProof(appState, proofId, reason, now?): {ok, proof}`
- Produces: `removePaymentProofImage(appState, proofId): Result`
- Produces actions: `upload-payment-proof`, `remove-payment-proof`, `submit-payment-proof`, `verify-payment-proof-demo`, `reject-payment-proof-demo`.

- [ ] **Step 1: Write failing lifecycle and idempotency tests**

```js
function seedCheckoutDraft(api, app, { method = 'Zelle', tipBasisPoints = 1800 } = {}) {
  const guest = seedGuestCheckin(api, app);
  const created = api.createCheckoutDraft(app, {
    guestCheckinId: guest.id,
    lineItems: [
      { id: 'service', type: 'service', label: 'Deluxe Pedicure', amountCents: 5500 },
      { id: 'promo', type: 'discount', label: 'Promo NEW10', amountCents: -550 }
    ]
  }, 500);
  assert.equal(created.ok, true);
  assert.equal(api.setCheckoutTip(app, created.checkoutDraft.id, tipBasisPoints).ok, true);
  assert.equal(api.setCheckoutMethod(app, created.checkoutDraft.id, method).ok, true);
  return created.checkoutDraft;
}

test('keeps proof pending without points then verifies exactly once', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const checkout = seedCheckoutDraft(api, app, { method: 'Zelle' });
  const before = JSON.stringify(app.balances);
  const submitted = api.submitPaymentProof(app, {
    checkoutDraftId: checkout.id, note: 'Zelle sent from Amy', imageDataUrl: 'data:image/jpeg;base64,AA=='
  }, 1000);
  assert.equal(submitted.proof.status, 'pending_verification');
  assert.equal(JSON.stringify(app.balances), before);
  assert.equal(app.guestRewardClaims.length, 0);

  const verified = api.verifyPaymentProof(app, submitted.proof.id, 2000);
  assert.equal(verified.proof.status, 'verified');
  assert.equal(app.receipts.length, 1);
  assert.ok(app.guestRewardClaims.length >= 1);
  const snapshot = JSON.stringify(app);
  assert.equal(api.verifyPaymentProof(app, submitted.proof.id, 3000).idempotent, true);
  assert.equal(JSON.stringify(app), snapshot);
});

test('rejects payment proof without receipt or reward claim', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const checkout = seedCheckoutDraft(api, app, { method: 'Venmo' });
  const submitted = api.submitPaymentProof(app, { checkoutDraftId: checkout.id, note: '', imageDataUrl: '' }, 1000);
  const rejected = api.rejectPaymentProof(app, submitted.proof.id, 'Amount does not match', 2000);
  assert.equal(rejected.proof.status, 'rejected');
  assert.equal(app.receipts.length, 0);
  assert.equal(app.guestRewardClaims.length, 0);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

```bash
node --test --test-name-pattern="proof pending|rejects payment proof" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because proof actions are absent.

- [ ] **Step 3: Implement proof submission and verification atomically**

```js
function submitPaymentProof(appState, input, now = Date.now()) {
  if (!isRecord(input)) return { ok: false, code: 'invalid_proof' };
  const checkout = appState.checkoutDrafts.find((row) => row.id === input.checkoutDraftId);
  if (!checkout || checkout.status !== 'draft' || !['Zelle', 'Venmo'].includes(checkout.method)) {
    return { ok: false, code: 'invalid_checkout_state' };
  }
  const timestamp = domainTimestamp(now);
  const id = createDomainId('proof');
  const note = typeof input.note === 'string' ? input.note.trim().slice(0, 280) : '';
  const imageDataUrl = input.imageDataUrl ? sanitizeLookPhoto(input.imageDataUrl) : '';
  if (!timestamp.ok || !id.ok || (input.imageDataUrl && !imageDataUrl)) {
    return !timestamp.ok ? timestamp : !id.ok ? id : { ok: false, code: 'invalid_image' };
  }
  const proof = {
    id: id.value, checkoutDraftId: checkout.id, businessId: checkout.businessId,
    method: checkout.method, amountCents: checkout.totalCents, status: 'pending_verification',
    note, imageDataUrl, rejectReason: null, createdAt: timestamp.value, verifiedAt: null
  };
  appState.paymentProofs.push(proof);
  checkout.status = 'pending_verification';
  appState.ui.pendingContext.paymentProofId = proof.id;
  return { ok: true, proof };
}

function proofClaims(appState, checkout, proof, now) {
  const guestCheckin = appState.guestCheckins.find((row) => row.id === checkout.guestCheckinId);
  const business = getValidBusiness(appState, checkout.businessId);
  if (!guestCheckin || !business) return { ok: false, code: 'invalid_proof_owner' };
  const values = [
    ['visit_spend', Math.round(checkout.beforeTipCents / 100)],
    ['directpay_bonus', ['Zelle', 'Venmo'].includes(checkout.method)
      ? Math.round(Math.round(checkout.beforeTipCents / 100) * business.directPayBonusPct / 100) : 0],
    ['tip_bonus', checkout.tipCents > 0 && guestCheckin.staffProfileId
      ? Math.round(checkout.tipCents / 100 * business.tipMultiplier) : 0]
  ].filter(([, points]) => points > 0);
  const timestamp = domainTimestamp(now);
  if (!timestamp.ok) return timestamp;
  const claims = [];
  for (const [sourceType, points] of values) {
    const id = createDomainId('guest-claim');
    if (!id.ok) return id;
    claims.push({ id: id.value, guestCheckinId: guestCheckin.id, businessId: checkout.businessId,
      sourceType, sourceId: proof.id, points, status: 'pending', createdAt: timestamp.value, claimedAt: null });
  }
  return { ok: true, claims, timestamp: timestamp.value };
}

function verifyPaymentProof(appState, proofId, now = Date.now()) {
  const proof = appState.paymentProofs.find((row) => row.id === proofId);
  if (!proof) return { ok: false, code: 'proof_not_found' };
  if (proof.status === 'verified') {
    return { ok: true, proof,
      receipt: appState.receipts.find((row) => row.checkoutDraftId === proof.checkoutDraftId),
      claims: appState.guestRewardClaims.filter((row) => row.sourceId === proof.id), idempotent: true };
  }
  if (proof.status !== 'pending_verification') return { ok: false, code: 'proof_not_pending' };
  const checkout = appState.checkoutDrafts.find((row) => row.id === proof.checkoutDraftId);
  if (!checkout || checkout.status !== 'pending_verification') return { ok: false, code: 'checkout_not_pending' };
  const receiptId = createDomainId('receipt');
  const prepared = proofClaims(appState, checkout, proof, now);
  if (!receiptId.ok || !prepared.ok) return !receiptId.ok ? receiptId : prepared;
  const receipt = { id: receiptId.value, checkoutDraftId: checkout.id, businessId: checkout.businessId,
    method: checkout.method, tipCents: checkout.tipCents, totalCents: checkout.totalCents,
    lineItems: structuredClone(checkout.lineItems), createdAt: prepared.timestamp };
  proof.status = 'verified';
  proof.verifiedAt = prepared.timestamp;
  checkout.status = 'confirmed';
  appState.receipts.push(receipt);
  appState.guestRewardClaims.push(...prepared.claims);
  return { ok: true, proof, receipt, claims: prepared.claims };
}

function rejectPaymentProof(appState, proofId, reason, now = Date.now()) {
  const proof = appState.paymentProofs.find((row) => row.id === proofId);
  if (!proof) return { ok: false, code: 'proof_not_found' };
  if (proof.status === 'rejected') return { ok: true, proof, idempotent: true };
  if (proof.status !== 'pending_verification') return { ok: false, code: 'proof_not_pending' };
  const checkout = appState.checkoutDrafts.find((row) => row.id === proof.checkoutDraftId);
  const rejectReason = normalizedRequiredText(reason);
  const timestamp = domainTimestamp(now);
  if (!checkout || !rejectReason || !timestamp.ok) return !timestamp.ok ? timestamp : { ok: false, code: 'invalid_rejection' };
  proof.status = 'rejected';
  proof.rejectReason = rejectReason.slice(0, 280);
  proof.verifiedAt = timestamp.value;
  checkout.status = 'rejected';
  return { ok: true, proof };
}

function removePaymentProofImage(appState, proofId) {
  const proof = appState.paymentProofs.find((row) => row.id === proofId);
  if (!proof || proof.status === 'verified') return { ok: false, code: 'proof_locked' };
  proof.imageDataUrl = '';
  return { ok: true, proof };
}
```

- [ ] **Step 4: Add Payment Proof and paydone states**

Replace the Task 3 proof shell with this exact content:

```html
<section id="payment-proof-view" class="hidden" data-pay-view="payment-proof" aria-labelledby="payment-proof-title">
  <div class="app-card">
    <div class="flex items-center justify-between"><h2 id="payment-proof-title" class="text-xl font-black" data-en="Payment Proof" data-vi="Bằng chứng thanh toán">Bằng chứng thanh toán</h2><span class="status-badge">Proof</span></div>
    <div class="mt-5 flex justify-between text-xl font-black"><span id="payment-proof-method"></span><strong id="payment-proof-amount"></strong></div>
  </div>
  <div class="app-card mt-4">
    <label class="sr-only" for="payment-proof-file" data-en="Payment proof image" data-vi="Ảnh bằng chứng thanh toán">Ảnh bằng chứng thanh toán</label><input id="payment-proof-file" class="sr-only" type="file" accept="image/jpeg,image/png">
    <button type="button" class="app-button-secondary w-full" data-action="upload-payment-proof" data-en="Upload screenshot" data-vi="Tải ảnh bằng chứng">Tải ảnh bằng chứng</button>
    <img id="payment-proof-preview" class="mt-3 hidden max-h-64 w-full rounded-2xl object-contain" alt="Payment proof preview">
    <button id="remove-payment-proof" type="button" class="app-link mt-2 hidden" data-action="remove-payment-proof" data-en="Remove image" data-vi="Xóa ảnh">Xóa ảnh</button>
    <label class="mt-4 block text-sm font-bold" for="payment-proof-note" data-en="Note" data-vi="Ghi chú">Ghi chú</label>
    <textarea id="payment-proof-note" class="app-input mt-2" maxlength="280"></textarea>
    <p id="payment-proof-error" class="field-error hidden" role="alert"></p>
    <button type="button" class="app-button mt-4 w-full" data-action="submit-payment-proof" data-en="Submit proof" data-vi="Gửi bằng chứng">Gửi bằng chứng</button>
  </div>
</section>
```

Inside the existing `paydone` screen, wrap the old content or replace it with these three nested states:

```html
<section id="payment-pending-view" data-paydone-view="pending" class="app-card text-center">
  <i data-lucide="clock-3" class="mx-auto h-10 w-10 text-amber-600"></i>
  <h2 class="mt-3 text-xl font-black" data-en="Pending Front Desk verification" data-vi="Đang chờ lễ tân xác minh">Đang chờ lễ tân xác minh</h2>
  <div class="mt-5 grid grid-cols-2 gap-3"><button type="button" class="app-button" data-action="verify-payment-proof-demo">Verify demo</button><button type="button" class="app-button-secondary" data-action="reject-payment-proof-demo">Reject demo</button></div>
</section>
<section id="payment-confirmed-view" data-paydone-view="confirmed" class="hidden">
  <div class="app-card"><div class="flex justify-between"><h2 class="text-xl font-black" data-en="Payment Confirmed" data-vi="Đã xác nhận thanh toán">Đã xác nhận thanh toán</h2><span class="status-badge text-emerald-700">Paid</span></div><div id="confirmed-receipt-items" class="mt-4 divide-y divide-dashed"></div><div class="mt-4 flex justify-between text-xl font-black"><span>Total Paid</span><strong id="confirmed-receipt-total"></strong></div></div>
  <button type="button" class="app-button mt-4 w-full" data-action="navigate" data-target="review">Leave Review</button>
  <div class="app-card mt-4"><button type="button" class="app-button w-full" data-action="create-account-from-receipt">Create NEXORA Account</button><button type="button" class="app-button-secondary mt-3 w-full" data-action="continue-as-guest">Continue as Guest</button></div>
</section>
<section id="payment-rejected-view" data-paydone-view="rejected" class="hidden app-card">
  <i data-lucide="circle-x" class="h-10 w-10 text-rose-600"></i><h2 class="mt-3 text-xl font-black" data-en="Proof rejected" data-vi="Bằng chứng bị từ chối">Bằng chứng bị từ chối</h2><p id="payment-reject-reason" class="mt-2 text-sm text-slate-600"></p>
  <button type="button" class="app-button mt-4 w-full" data-action="replace-payment-proof">Replace Proof</button><button type="button" class="app-button-secondary mt-3 w-full" data-action="pay-at-counter">Pay at Counter</button>
</section>
```

Add exact UI state and action wiring:

```js
let pendingProofImageDataUrl = '';

function showPaydoneView(name) {
  document.querySelectorAll('[data-paydone-view]').forEach((view) => view.classList.toggle('hidden', view.dataset.paydoneView !== name));
}

function renderPaydone() {
  const proof = state.paymentProofs.find((row) => row.id === state.ui.pendingContext.paymentProofId);
  if (!proof) return;
  showPaydoneView(proof.status === 'verified' ? 'confirmed' : proof.status === 'rejected' ? 'rejected' : 'pending');
  if (proof.status === 'rejected') document.getElementById('payment-reject-reason').textContent = proof.rejectReason || t('proofRejected');
  if (proof.status !== 'verified') return;
  const receipt = state.receipts.find((row) => row.checkoutDraftId === proof.checkoutDraftId);
  if (!receipt) return;
  const list = document.getElementById('confirmed-receipt-items');
  const receiptRows = [...receipt.lineItems];
  if (receipt.tipCents > 0) receiptRows.push({ label: t('tip'), amountCents: receipt.tipCents });
  list.replaceChildren(...receiptRows.map((item) => {
    const row = document.createElement('div'); row.className = 'flex justify-between py-2';
    const label = document.createElement('span'); const amount = document.createElement('strong');
    label.textContent = item.label; amount.textContent = formatCents(item.amountCents); row.append(label, amount); return row;
  }));
  document.getElementById('confirmed-receipt-total').textContent = formatCents(receipt.totalCents);
}

registerAction('upload-payment-proof', () => document.getElementById('payment-proof-file').click());
document.getElementById('payment-proof-file').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    pendingProofImageDataUrl = await compressImage(file);
    const preview = document.getElementById('payment-proof-preview');
    preview.src = pendingProofImageDataUrl; preview.classList.remove('hidden');
    document.getElementById('remove-payment-proof').classList.remove('hidden');
  } catch { setFieldError('payment-proof-error', t('invalidImage')); }
});
registerAction('remove-payment-proof', () => {
  pendingProofImageDataUrl = '';
  const preview = document.getElementById('payment-proof-preview');
  preview.removeAttribute('src'); preview.classList.add('hidden');
  document.getElementById('remove-payment-proof').classList.add('hidden');
});
registerAction('submit-payment-proof', () => {
  const input = { checkoutDraftId: state.ui.pendingContext.checkoutDraftId,
    note: document.getElementById('payment-proof-note').value, imageDataUrl: pendingProofImageDataUrl };
  let result = commitState((draft) => submitPaymentProof(draft, input));
  if (!result.ok && result.code === 'persist_failed' && input.imageDataUrl) {
    result = commitState((draft) => submitPaymentProof(draft, { ...input, imageDataUrl: '' }));
    if (result.ok) showToast(t('proofSavedWithoutImage'), 'error');
  }
  if (!result.ok) return setFieldError('payment-proof-error', t('proofSubmitFailed'));
  pendingProofImageDataUrl = '';
  renderApp(); navigateTo('paydone'); renderPaydone();
});
registerAction('verify-payment-proof-demo', () => {
  const result = commitState((draft) => verifyPaymentProof(draft, draft.ui.pendingContext.paymentProofId));
  if (!result.ok) return showToast(t('verificationFailed'), 'error');
  renderApp(); renderPaydone();
});
registerAction('reject-payment-proof-demo', () => {
  const result = commitState((draft) => rejectPaymentProof(draft, draft.ui.pendingContext.paymentProofId, 'Amount does not match'));
  if (!result.ok) return showToast(t('verificationFailed'), 'error');
  renderApp(); renderPaydone();
});
registerAction('replace-payment-proof', () => { showPayView('payment-proof'); navigateTo('pay'); });
registerAction('pay-at-counter', () => showToast(t('askFrontDesk')));
```

Expose the Task 4 domain functions in `window.NEXORA_TEST_API`:

```js
submitPaymentProof,
verifyPaymentProof,
rejectPaymentProof,
removePaymentProofImage,
```

- [ ] **Step 5: Add renderer/action tests and verify**

Add this static regression test:

```js
test('payment proof and receipt controls are safe and fully registered', () => {
  const source = html();
  assert.match(source, /label\.textContent = item\.label/);
  assert.match(source, /amount\.textContent = formatCents\(item\.amountCents\)/);
  const rejectedTag = source.match(/<section id="payment-rejected-view"[^>]*>/)?.[0] || '';
  assert.doesNotMatch(rejectedTag, /emerald|success/);
  for (const action of ['upload-payment-proof', 'remove-payment-proof', 'submit-payment-proof',
    'verify-payment-proof-demo', 'reject-payment-proof-demo', 'replace-payment-proof', 'pay-at-counter']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
});
```

```bash
node --test --test-name-pattern="proof|receipt|enabled button|action" html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: selected tests PASS.

- [ ] **Step 6: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add payment proof verification"
```

**Review gate:** Reviewer verifies pending/rejected states award zero points, verification is idempotent, receipt totals match the immutable checkout snapshot and guest claims do not alter the active member balance.

---

### Task 5: Nhận tài khoản guest và hợp nhất điểm thưởng

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs` near auth/payment tests.
- Modify: `html/customer/cutomer-reward.html` near OTP, ledger and proof domain functions.

**Interfaces:**
- Consumes: verified guest claims and existing `appendLedger` validation.
- Produces: `mergeGuestJourney(appState, phone, now?): {ok, claimedPoints, claimedCount}`
- Produces actions: `create-account-from-receipt`, `continue-as-guest`.

- [ ] **Step 1: Write failing account merge tests**

```js
function seedVerifiedGuestReceipt(api, app, { phone, businessId }) {
  const checkout = seedCheckoutDraft(api, app, { method: 'Zelle' });
  const guest = app.guestCheckins.find((row) => row.id === checkout.guestCheckinId);
  guest.phone = phone;
  guest.businessId = businessId;
  checkout.businessId = businessId;
  const submitted = api.submitPaymentProof(app, { checkoutDraftId: checkout.id, note: '', imageDataUrl: '' }, 1000);
  assert.equal(submitted.ok, true);
  const verified = api.verifyPaymentProof(app, submitted.proof.id, 2000);
  assert.equal(verified.ok, true);
  return { guest, checkout, proof: submitted.proof, claims: verified.claims };
}

test('merges verified guest claims into the matching phone account once', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const fixture = seedVerifiedGuestReceipt(api, app, { phone: '8325550198', businessId: 'bitcoin-nail-bar' });
  app.session.phone = '8325550198';
  app.profile.phone = '8325550198';
  const before = app.balances['bitcoin-nail-bar'].points;
  const merged = api.mergeGuestJourney(app, '8325550198', 3000);
  assert.equal(merged.ok, true);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + merged.claimedPoints);
  assert.equal(app.guestRewardClaims.every((claim) => claim.status === 'claimed'), true);
  const snapshot = JSON.stringify(app);
  assert.equal(api.mergeGuestJourney(app, '8325550198', 4000).claimedCount, 0);
  assert.equal(JSON.stringify(app), snapshot);
});

test('does not merge guest claims for a different phone', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  seedVerifiedGuestReceipt(api, app, { phone: '8325550198', businessId: 'bitcoin-nail-bar' });
  const before = JSON.stringify(app);
  assert.equal(api.mergeGuestJourney(app, '8325550100', 3000).code, 'phone_mismatch');
  assert.equal(JSON.stringify(app), before);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

```bash
node --test --test-name-pattern="merges verified guest|different phone" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because merge action is absent.

- [ ] **Step 3: Implement atomic claim merge**

```js
function mergeGuestJourney(appState, phoneInput, now = Date.now()) {
  const phone = normalizeUsPhone(phoneInput);
  if (phone.length !== 10 || normalizeUsPhone(appState.session.phone) !== phone
    || normalizeUsPhone(appState.profile.phone) !== phone) return { ok: false, code: 'phone_mismatch' };
  const matchingCheckins = appState.guestCheckins.filter((row) => row.phone === phone);
  if (matchingCheckins.length === 0) return { ok: false, code: 'phone_mismatch' };
  const eligibleIds = new Set(matchingCheckins.map((row) => row.id));
  const targets = appState.guestRewardClaims.filter((claim) => claim.status === 'pending' && eligibleIds.has(claim.guestCheckinId));
  if (targets.length === 0) return { ok: true, claimedPoints: 0, claimedCount: 0 };
  const timestamp = domainTimestamp(now);
  if (!timestamp.ok) return timestamp;
  const draft = structuredClone(appState);
  let claimedPoints = 0;
  for (const target of targets) {
    const claim = draft.guestRewardClaims.find((row) => row.id === target.id);
    const checkin = draft.guestCheckins.find((row) => row.id === claim.guestCheckinId);
    if (!checkin || checkin.businessId !== claim.businessId || claim.points <= 0) return { ok: false, code: 'invalid_claim_owner' };
    const entry = appendLedger(draft, { businessId: claim.businessId, type: claim.sourceType,
      pointsDelta: claim.points, refType: 'guest_claim', refId: claim.id, now });
    if (entry?.ok === false) return entry;
    claim.status = 'claimed';
    claim.claimedAt = timestamp.value;
    claimedPoints += claim.points;
  }
  for (const checkin of draft.guestCheckins.filter((row) => eligibleIds.has(row.id))) {
    const remaining = draft.guestRewardClaims.some((claim) => claim.guestCheckinId === checkin.id && claim.status === 'pending');
    if (!remaining) checkin.claimedAt = timestamp.value;
  }
  replaceState(appState, draft);
  return { ok: true, claimedPoints, claimedCount: targets.length };
}
```

- [ ] **Step 4: Wire receipt account actions**

Register the receipt actions:

```js
registerAction('create-account-from-receipt', () => {
  const guest = state.guestCheckins.find((row) => row.id === state.ui.pendingContext.guestCheckinId);
  if (!guest) return showToast(t('guestNotFound'), 'error');
  document.getElementById('login-phone').value = guest.phone;
  navigateTo('login1');
  document.getElementById('login-phone').focus();
});
registerAction('continue-as-guest', () => {
  showToast(state.profile.language === 'vi'
    ? 'Điểm đang chờ; dùng cùng số điện thoại để nhận sau.'
    : 'Rewards are pending; use the same phone to claim later.');
  setScanView('camera');
  navigateTo('scan');
});
```

Replace the existing `verify-otp` action with an atomic OTP + optional claim mutation:

```js
registerAction('verify-otp', () => {
  const result = commitState((draft) => {
    const verified = verifyOtp(draft, document.getElementById('otp-code').value);
    if (!verified.ok) return verified;
    draft.profile.phone = draft.session.phone;
    const hasMatchingGuest = draft.guestCheckins.some((row) => row.phone === draft.session.phone);
    const merge = hasMatchingGuest
      ? mergeGuestJourney(draft, draft.session.phone)
      : { ok: true, claimedPoints: 0, claimedCount: 0 };
    return merge.ok ? { ...verified, merge } : merge;
  });
  if (!result.ok) return setFieldError('otp-error', t(result.code === 'locked' ? 'otpLocked' : 'invalidOtp'));
  setFieldError('otp-error');
  renderApp();
  if (result.merge.claimedPoints > 0) showToast(`${result.merge.claimedPoints} ${t('points')}`);
  navigateTo('home');
});
```

Expose the Task 5 domain function in `window.NEXORA_TEST_API`:

```js
mergeGuestJourney,
```

- [ ] **Step 5: Verify and commit**

```bash
node --test --test-name-pattern="guest claim|OTP|ledger|business balances" html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: selected tests PASS.

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: merge verified guest rewards"
```

**Review gate:** Reviewer verifies phone ownership, all-or-nothing ledger writes, per-business balances and repeated merge safety.

---

### Task 6: QR giới thiệu, chia sẻ và lịch sử đủ điều kiện

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs` near referral/static UI tests.
- Modify: `html/customer/cutomer-reward.html:238-240`
- Modify: `html/customer/cutomer-reward.html` near referral constants/actions/renderers.

**Interfaces:**
- Produces: `createReferralInvite(appState, input, now?): Result`
- Produces: `advanceReferral(appState, referralId, event, now?): Result`
- Produces: `releaseReferralReward(appState, referralId, businessId, now?): Result`
- Produces actions: `share-referral`, `show-referral-qr`, `simulate-referral-joined`, `simulate-referral-paid-visit`.

- [ ] **Step 1: Write failing referral state tests**

```js
test('does not release referral points before a qualifying paid visit', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const created = api.createReferralInvite(app, { friendPhone: '8325550111' }, 1000);
  assert.equal(created.referral.status, 'invited');
  api.advanceReferral(app, created.referral.id, 'joined', 2000);
  assert.equal(app.referrals.find((row) => row.id === created.referral.id).status, 'joined');
  assert.equal(app.ledger.some((entry) => entry.refId === created.referral.id), false);
  const rewarded = api.releaseReferralReward(app, created.referral.id, 'bitcoin-nail-bar', 3000);
  assert.equal(rewarded.referral.status, 'rewarded');
  assert.equal(rewarded.points, 50);
});

test('blocks self referral by normalized phone', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app);
  assert.equal(api.createReferralInvite(app, { friendPhone: app.profile.phone }, 1000).code, 'self_referral');
  assert.equal(JSON.stringify(app), before);
});
```

- [ ] **Step 2: Run tests and verify failure**

```bash
node --test --test-name-pattern="referral points|self referral" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because referral domain functions are absent.

- [ ] **Step 3: Implement referral lifecycle**

```js
function createReferralInvite(appState, input, now = Date.now()) {
  const friendPhone = normalizeUsPhone(input?.friendPhone);
  const ownerPhone = normalizeUsPhone(appState.profile.phone);
  if (friendPhone.length !== 10) return { ok: false, code: 'invalid_phone' };
  if (friendPhone === ownerPhone) return { ok: false, code: 'self_referral' };
  const existing = appState.referrals.find((row) => row.friendPhone === friendPhone && row.status !== 'rewarded');
  if (existing) return { ok: true, referral: existing, idempotent: true };
  const timestamp = domainTimestamp(now);
  const id = createDomainId('referral');
  if (!timestamp.ok || !id.ok) return !timestamp.ok ? timestamp : id;
  const referral = { id: id.value, referrerId: appState.profile.id, code: appState.profile.referralCode,
    friendPhone, status: 'invited', rewardPoints: 0, businessId: null,
    createdAt: timestamp.value, joinedAt: null, rewardedAt: null };
  appState.referrals.push(referral);
  return { ok: true, referral };
}

function advanceReferral(appState, referralId, event, now = Date.now()) {
  const referral = appState.referrals.find((row) => row.id === referralId);
  if (!referral) return { ok: false, code: 'referral_not_found' };
  if (event !== 'joined') return { ok: false, code: 'invalid_referral_event' };
  if (referral.status === 'joined' || referral.status === 'rewarded') return { ok: true, referral, idempotent: true };
  if (referral.status !== 'invited') return { ok: false, code: 'invalid_referral_state' };
  const timestamp = domainTimestamp(now);
  if (!timestamp.ok) return timestamp;
  referral.status = 'joined';
  referral.joinedAt = timestamp.value;
  return { ok: true, referral };
}

function releaseReferralReward(appState, referralId, businessId, now = Date.now()) {
  const current = appState.referrals.find((row) => row.id === referralId);
  if (!current || !getValidBusiness(appState, businessId)) return { ok: false, code: 'invalid_referral_business' };
  if (current.status === 'rewarded') return { ok: true, referral: current, points: current.rewardPoints, idempotent: true };
  if (current.status !== 'joined') return { ok: false, code: 'paid_visit_required' };
  const timestamp = domainTimestamp(now);
  if (!timestamp.ok) return timestamp;
  const draft = structuredClone(appState);
  const referral = draft.referrals.find((row) => row.id === referralId);
  const entry = appendLedger(draft, { businessId, type: 'referral', pointsDelta: REFERRAL_REWARD_POINTS,
    refType: 'referral', refId: referral.id, now });
  if (entry?.ok === false) return entry;
  referral.status = 'rewarded'; referral.rewardPoints = REFERRAL_REWARD_POINTS;
  referral.businessId = businessId; referral.rewardedAt = timestamp.value;
  replaceState(appState, draft);
  return { ok: true, referral: appState.referrals.find((row) => row.id === referralId), points: REFERRAL_REWARD_POINTS };
}
```

- [ ] **Step 4: Expand existing referral screen**

Replace the inner content of the existing `referral` screen, without adding `.app-screen`:

```html
<section id="referral-summary" class="app-card">
  <div class="flex justify-between gap-3"><div><p class="text-sm font-bold" data-en="Your NEXORA Referral Code" data-vi="Mã giới thiệu NEXORA">Mã giới thiệu NEXORA</p><strong id="referral-code" class="mt-2 block text-3xl text-violet-600"></strong></div><span class="status-badge">Customer</span></div>
  <label class="mt-4 block text-sm font-bold" for="referral-friend-phone" data-en="Friend phone" data-vi="Số điện thoại bạn bè">Số điện thoại bạn bè</label><input id="referral-friend-phone" class="app-input mt-2" type="tel" inputmode="tel">
  <div id="referral-qr" class="mx-auto mt-5 grid w-44 grid-cols-9 rounded-2xl bg-white p-3 shadow" aria-label="Referral QR"></div>
  <p id="referral-error" class="field-error hidden" role="alert"></p>
  <button type="button" class="app-button mt-5 w-full" data-action="share-referral" data-en="Share Referral Link" data-vi="Chia sẻ link giới thiệu">Chia sẻ link giới thiệu</button>
</section>
<section class="mt-4 grid grid-cols-3 gap-3 text-center"><div class="app-card p-3"><span class="text-xs">Invited</span><strong id="referral-invited-count" class="block text-2xl"></strong></div><div class="app-card p-3"><span class="text-xs">Joined</span><strong id="referral-joined-count" class="block text-2xl"></strong></div><div class="app-card p-3"><span class="text-xs">Rewarded</span><strong id="referral-rewarded-count" class="block text-2xl"></strong></div></section>
<section id="referral-invite-list" class="app-card mt-4" aria-label="Referral history"></section>
```

Add deterministic prototype QR and safe list rendering:

```js
function renderReferralQr(code) {
  const host = document.getElementById('referral-qr');
  const seed = [...code].reduce((value, char) => ((value * 33) ^ char.charCodeAt(0)) >>> 0, 5381);
  host.replaceChildren(...Array.from({ length: 81 }, (_, index) => {
    const cell = document.createElement('span');
    const finder = (index % 9 < 3 && Math.floor(index / 9) < 3)
      || (index % 9 > 5 && Math.floor(index / 9) < 3) || (index % 9 < 3 && Math.floor(index / 9) > 5);
    const dark = finder || (((seed >>> (index % 24)) ^ (index * 13)) & 1) === 1;
    cell.className = `aspect-square ${dark ? 'bg-slate-950' : 'bg-white'}`;
    return cell;
  }));
}

function referralDemoButton(action, referralId, label) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'app-link mt-2';
  button.dataset.action = action; button.dataset.referralId = referralId; button.textContent = label;
  return button;
}

function renderReferrals() {
  document.getElementById('referral-code').textContent = state.profile.referralCode;
  renderReferralQr(state.profile.referralCode);
  for (const status of ['invited', 'joined', 'rewarded']) {
    document.getElementById(`referral-${status}-count`).textContent = String(state.referrals.filter((row) => row.status === status).length);
  }
  const list = document.getElementById('referral-invite-list');
  list.replaceChildren(...state.referrals.map((referral) => {
    const row = document.createElement('div'); row.className = 'border-b border-dashed py-3 last:border-0';
    const top = document.createElement('div'); top.className = 'flex justify-between gap-3';
    const phone = document.createElement('span'); const status = document.createElement('strong');
    phone.textContent = `••• ${referral.friendPhone.slice(-4)}`;
    status.textContent = referral.status === 'rewarded' ? `+${referral.rewardPoints} ${t('points')}` : referral.status;
    top.append(phone, status); row.append(top);
    if (referral.status === 'invited') row.append(referralDemoButton('simulate-referral-joined', referral.id, 'Simulate joined'));
    if (referral.status === 'joined') row.append(referralDemoButton('simulate-referral-paid-visit', referral.id, 'Simulate paid visit'));
    return row;
  }));
}
```

Register actions:

```js
registerAction('share-referral', async () => {
  const result = commitState((draft) => createReferralInvite(draft, { friendPhone: document.getElementById('referral-friend-phone').value }));
  if (!result.ok) return setFieldError('referral-error', t(result.code === 'self_referral' ? 'selfReferral' : 'invalidPhone'));
  const url = `https://nexoratouch.com/r/${encodeURIComponent(result.referral.code)}?invite=${encodeURIComponent(result.referral.id)}`;
  try {
    if (navigator.share) await navigator.share({ title: 'NEXORA', text: REFERRAL_COPY[state.profile.language], url });
    else await navigator.clipboard.writeText(url);
    setFieldError('referral-error'); showToast(t('referralShared'));
  } catch (error) { if (error?.name !== 'AbortError') setFieldError('referral-error', t('shareFailed')); }
  renderReferrals();
});
registerAction('simulate-referral-joined', (control) => {
  const result = commitState((draft) => advanceReferral(draft, control.dataset.referralId, 'joined'));
  if (!result.ok) return showToast(t('referralUpdateFailed'), 'error'); renderApp(); renderReferrals();
});
registerAction('simulate-referral-paid-visit', (control) => {
  const result = commitState((draft) => releaseReferralReward(draft, control.dataset.referralId, draft.ui.selectedBusinessId));
  if (!result.ok) return showToast(t('referralUpdateFailed'), 'error'); renderApp(); renderReferrals();
});
```

Expose the Task 6 functions in `window.NEXORA_TEST_API`:

```js
createReferralInvite,
advanceReferral,
releaseReferralReward,
```

- [ ] **Step 5: Verify and commit**

```bash
node --test --test-name-pattern="referral|31-screen|enabled button|data-action" html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: selected tests PASS and app-screen inventory remains 31.

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: complete customer referral history"
```

**Review gate:** Reviewer verifies native-share fallback, self-referral block, paid-visit release and that screenshot cash copy was intentionally converted to business-funded points.

---

### Task 7: Nền tảng Salon Operations Companion

**Files:**
- Create: `html/customer/customer-salon-operations.html`
- Create: `html/customer/customer-salon-operations.test.mjs`

**Interfaces:**
- Produces: `OPS_STORAGE_KEY = 'nexora.customer.crosssurface.v1'`
- Produces: `createOperationsState(): OperationsState`
- Produces: `loadOperationsState(storage): OperationsState`
- Produces: `saveOperationsState(state, storage): void`
- Produces: `commitOperations(mutator): Result`
- Produces: `readCustomerSnapshot(storage): CustomerSnapshot`
- Produces: `window.NEXORA_OPERATIONS_TEST_API`.

- [ ] **Step 1: Create failing storage-isolation tests**

Create `customer-salon-operations.test.mjs` with this exact harness before the tests:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('./customer-salon-operations.html', import.meta.url), 'utf8');

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

function testApi(initial = {}) {
  const script = SOURCE.match(/<script id="operations-app-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'operations script must exist');
  const storage = createMemoryStorage(initial);
  let uuid = 0;
  const window = { localStorage: storage, NEXORA_OPS_SKIP_INIT: true };
  const context = vm.createContext({
    window, localStorage: storage, structuredClone, console, URL, Date,
    crypto: { randomUUID: () => `00000000-0000-4000-8000-${String(++uuid).padStart(12, '0')}` }
  });
  window.window = window;
  vm.runInContext(script, context);
  return { api: window.NEXORA_OPERATIONS_TEST_API, storage, context };
}
```

Then add:

```js
test('uses a separate operations key and never rewrites customer storage', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const customerJson = JSON.stringify({ schemaVersion: 2, profile: { id: 'cust-jessica' }, guestCheckins: [] });
  const { api, storage } = testApi({ [customerKey]: customerJson });
  const state = api.createOperationsState();
  api.saveOperationsState(state, storage);
  assert.equal(api.OPS_STORAGE_KEY, 'nexora.customer.crosssurface.v1');
  assert.equal(storage.getItem(customerKey), customerJson);
  assert.ok(storage.getItem(api.OPS_STORAGE_KEY));
});

test('sanitizes customer snapshot before companion use', () => {
  const { api } = testApi();
  const snapshot = api.readCustomerSnapshot(createMemoryStorage({
    'nexora.customer.prototype.v1': JSON.stringify({
      schemaVersion: 2,
      profile: { id: 'cust-amy', name: '<img>', phone: '8325550198' },
      guestCheckins: [{ id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny' }],
      secret: 'drop-me'
    })
  }));
  assert.equal(snapshot.profile.name, '<img>');
  assert.equal('secret' in snapshot, false);
});
```

- [ ] **Step 2: Run the new test and verify failure**

```bash
node --test html/customer/customer-salon-operations.test.mjs
```

Expected: FAIL because the companion HTML/API is absent.

- [ ] **Step 3: Create the standalone companion shell**

Create a mobile-first Tailwind/Lucide HTML with this head and shell:

```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>NEXORA Salon Operations Companion</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"></script>
  <style type="text/tailwindcss">
    @theme { --color-nexora-violet: #c026d3; --color-nexora-blue: #3284ff; }
    body { @apply m-0 min-h-screen bg-slate-100 font-sans text-slate-950; }
    .ops-card { @apply rounded-3xl border border-slate-200 bg-white p-4 shadow-sm; }
    .ops-button { @apply min-h-12 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-blue-500 px-4 font-black text-white; }
    .ops-button-secondary { @apply min-h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold; }
    .ops-input { @apply min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4; }
  </style>
</head>
<body>
<main id="ops-app" class="min-h-screen bg-slate-100 text-slate-950">
  <header class="sticky top-0 z-20 bg-slate-950 px-4 py-3 text-white">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-3">
      <div><p class="text-xs text-white/60">NEXORA TOUCH</p><h1 class="font-black">Salon Operations Companion</h1></div>
      <label class="text-xs font-bold">Role<select id="ops-role" class="ml-2 rounded-lg bg-white px-2 py-1 text-slate-950"><option>Customer</option><option>Front Desk</option><option>Staff</option></select></label>
    </div>
  </header>
  <div class="mx-auto max-w-5xl p-4">
    <section id="ops-liveticket" data-ops-screen="liveticket"></section>
    <section id="ops-staffnoteligible" class="hidden" data-ops-screen="staffnoteligible"></section>
    <section id="ops-addonapproval" class="hidden" data-ops-screen="addonapproval"></section>
  </div>
  <div id="ops-toast" class="sr-only" role="status" aria-live="polite"></div>
</main>
<script id="operations-app-script"></script>
</body>
</html>
```

Replace the single script comment immediately with the default-state function from Step 4; the returned shape is:

```js
{
  schemaVersion: 1,
  updatedAt: new Date().toISOString(),
  serviceTickets: [],
  addOnRequests: [],
  staffEligibility: [],
  ui: { activeScreen: 'liveticket', role: 'Customer', selectedTicketId: null, selectedStaffId: null }
}
```

- [ ] **Step 4: Implement versioned persistence and read-only bridge**

Insert this exact script body (Task 8 and Task 9 append their domain/render functions above `initializeOperations`):

```js
const OPS_STORAGE_KEY = 'nexora.customer.crosssurface.v1';
const CUSTOMER_STORAGE_KEY = 'nexora.customer.prototype.v1';
const OPS_SCHEMA_VERSION = 1;

function opsRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function opsText(value) { const text = typeof value === 'string' ? value.trim() : ''; return text || null; }
function opsTimestamp(now) {
  if (typeof now !== 'number' || !Number.isFinite(now)) return { ok: false, code: 'invalid_time' };
  try { return { ok: true, value: new Date(now).toISOString() }; } catch { return { ok: false, code: 'invalid_time' }; }
}
function opsStoredTimestamp(value) {
  const milliseconds = typeof value === 'string' ? Date.parse(value) : NaN;
  const timestamp = opsTimestamp(milliseconds);
  return timestamp.ok && timestamp.value === value;
}
function opsId(prefix) {
  try {
    const value = crypto.randomUUID();
    return /^[0-9a-f-]{36}$/i.test(value) ? { ok: true, value: `${prefix}-${value}` } : { ok: false, code: 'id_failed' };
  } catch { return { ok: false, code: 'id_failed' }; }
}

function createOperationsState() {
  return { schemaVersion: OPS_SCHEMA_VERSION, updatedAt: new Date().toISOString(),
    serviceTickets: [], addOnRequests: [], staffEligibility: [],
    ui: { activeScreen: 'liveticket', role: 'Customer', selectedTicketId: null, selectedStaffId: null } };
}

function normalizeOperationsState(value) {
  const fallback = createOperationsState();
  if (!opsRecord(value) || value.schemaVersion !== OPS_SCHEMA_VERSION) return fallback;
  const screens = new Set(['liveticket', 'staffnoteligible', 'addonapproval']);
  const roles = new Set(['Customer', 'Front Desk', 'Staff']);
  return { schemaVersion: OPS_SCHEMA_VERSION,
    updatedAt: opsText(value.updatedAt) || fallback.updatedAt,
    serviceTickets: Array.isArray(value.serviceTickets) ? structuredClone(value.serviceTickets.filter(opsRecord)) : [],
    addOnRequests: Array.isArray(value.addOnRequests) ? structuredClone(value.addOnRequests.filter(opsRecord)) : [],
    staffEligibility: Array.isArray(value.staffEligibility) ? structuredClone(value.staffEligibility.filter(opsRecord)) : [],
    ui: { activeScreen: screens.has(value.ui?.activeScreen) ? value.ui.activeScreen : 'liveticket',
      role: roles.has(value.ui?.role) ? value.ui.role : 'Customer',
      selectedTicketId: opsText(value.ui?.selectedTicketId), selectedStaffId: opsText(value.ui?.selectedStaffId) } };
}

function loadOperationsState(storage = window.localStorage) {
  try { return normalizeOperationsState(JSON.parse(storage.getItem(OPS_STORAGE_KEY) || 'null')); }
  catch { return createOperationsState(); }
}

function saveOperationsState(value, storage = window.localStorage) {
  const normalized = normalizeOperationsState(value);
  normalized.updatedAt = new Date().toISOString();
  storage.setItem(OPS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function readCustomerSnapshot(storage = window.localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(CUSTOMER_STORAGE_KEY) || 'null');
    if (!opsRecord(raw) || raw.schemaVersion !== 2) return { profile: null, businesses: {}, guestCheckins: [] };
    const profile = opsRecord(raw.profile) && opsText(raw.profile.id)
      ? { id: raw.profile.id.trim(), name: opsText(raw.profile.name) || '', phone: String(raw.profile.phone || '').replace(/\D/g, '').slice(-10) }
      : null;
    const businesses = {};
    for (const [key, value] of Object.entries(opsRecord(raw.businesses) ? raw.businesses : {})) {
      if (opsRecord(value) && opsText(value.id) === key && opsText(value.name)) businesses[key] = { id: key, name: value.name.trim() };
    }
    const guestCheckins = (Array.isArray(raw.guestCheckins) ? raw.guestCheckins : []).flatMap((row) => {
      if (!opsRecord(row) || !opsText(row.id) || !businesses[row.businessId] || !opsText(row.serviceKey)) return [];
      return [{ id: row.id.trim(), businessId: row.businessId, name: opsText(row.name) || '',
        phone: String(row.phone || '').replace(/\D/g, '').slice(-10), serviceKey: row.serviceKey.trim(),
        staffProfileId: opsText(row.staffProfileId) }];
    });
    return { profile, businesses, guestCheckins };
  } catch { return { profile: null, businesses: {}, guestCheckins: [] }; }
}

let operationsState = loadOperationsState();

function commitOperations(mutator, storage = window.localStorage) {
  const draft = structuredClone(operationsState);
  let result;
  try { result = mutator(draft); } catch (error) { return { ok: false, code: 'mutation_failed', error }; }
  if (result?.ok === false) return result;
  try { operationsState = saveOperationsState(draft, storage); }
  catch (error) { return { ok: false, code: 'persist_failed', error }; }
  return result;
}

function initializeOperations() {
  const role = document.getElementById('ops-role');
  role.value = operationsState.ui.role;
  role.addEventListener('change', () => {
    const result = commitOperations((draft) => { draft.ui.role = role.value; return { ok: true }; });
    if (!result.ok) role.value = operationsState.ui.role;
  });
  window.lucide?.createIcons();
}

window.NEXORA_OPERATIONS_TEST_API = { OPS_STORAGE_KEY, CUSTOMER_STORAGE_KEY, createOperationsState,
  normalizeOperationsState, loadOperationsState, saveOperationsState, readCustomerSnapshot, commitOperations };
if (!window.NEXORA_OPS_SKIP_INIT) initializeOperations();
```

- [ ] **Step 5: Verify and commit**

```bash
node --test html/customer/customer-salon-operations.test.mjs
git diff --check -- html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs
```

Expected: storage tests PASS; diff check has no output.

```bash
git add html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs
git commit -m "feat: add salon operations companion"
```

**Review gate:** Reviewer verifies distinct key ownership, customer key remains byte-for-byte unchanged, state reload works and role switch copy is explicit.

---

### Task 8: Luồng Live Ticket và điều kiện nhân viên

**Files:**
- Modify: `html/customer/customer-salon-operations.test.mjs`
- Modify: `html/customer/customer-salon-operations.html`

**Interfaces:**
- Consumes: sanitized guest check-in snapshot.
- Produces: `createServiceTicket(state, guestCheckin, now?): Result`
- Produces: `evaluateStaffEligibility(state, ticketId, serviceKey, staffId): Result`
- Produces: `chooseRecommendedStaff(state, ticketId, staffId, now?): Result`
- Produces: `askFrontDesk(state, ticketId, now?): Result`
- Produces actions: `open-ticket-tab`, `review-staff-eligibility`, `choose-recommended-staff`, `ask-front-desk`.

- [ ] **Step 1: Write failing ticket and eligibility tests**

```js
function seedTicket(api) {
  const state = api.createOperationsState();
  const created = api.createServiceTicket(state, {
    id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', name: 'Amy Nguyen', phone: '8325550198',
    serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny'
  }, 1000);
  assert.equal(created.ok, true);
  return state;
}

test('creates one live ticket per guest check-in and keeps cents canonical', () => {
  const { api } = testApi();
  const state = api.createOperationsState();
  const guest = { id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny' };
  const first = api.createServiceTicket(state, guest, 1000);
  const second = api.createServiceTicket(state, guest, 2000);
  assert.equal(first.ticket.status, 'in_service');
  assert.equal(first.ticket.currentTotalCents, 4950);
  assert.equal(second.idempotent, true);
  assert.equal(state.serviceTickets.length, 1);
});

test('does not switch an ineligible staff member until customer chooses a recommendation', () => {
  const { api } = testApi();
  const state = seedTicket(api);
  const ticket = state.serviceTickets[0];
  const result = api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny');
  assert.equal(result.eligible, false);
  assert.equal(ticket.staffProfileId, 'staff-jenny');
  api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', 2000);
  assert.equal(ticket.staffProfileId, 'staff-kevin');
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test --test-name-pattern="live ticket|ineligible staff" html/customer/customer-salon-operations.test.mjs
```

Expected: FAIL because domain functions are absent.

- [ ] **Step 3: Implement ticket and eligibility state**

Append these constants and domain functions before `initializeOperations`:

```js
const OPS_SERVICES = Object.freeze({
  'deluxe-pedicure': { label: 'Deluxe Pedicure', amountCents: 5500 },
  'acrylic-full-set': { label: 'Acrylic Full Set', amountCents: 6500 }
});
const OPS_STAFF = Object.freeze({
  'staff-jenny': { id: 'staff-jenny', name: 'Jenny', businessId: 'bitcoin-nail-bar', serviceSkills: ['deluxe-pedicure'], available: true },
  'staff-tina': { id: 'staff-tina', name: 'Tina', businessId: 'bitcoin-nail-bar', serviceSkills: ['acrylic-full-set'], available: false },
  'staff-kevin': { id: 'staff-kevin', name: 'Kevin', businessId: 'bitcoin-nail-bar', serviceSkills: ['acrylic-full-set', 'deluxe-pedicure'], available: true }
});

function normalizeOpsLineItems(value) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const items = value.map((item) => ({ id: opsText(item?.id), type: opsText(item?.type), label: opsText(item?.label),
    amountCents: Number.isSafeInteger(item?.amountCents) ? item.amountCents : null,
    sourceAddOnId: opsText(item?.sourceAddOnId) }));
  return items.some((item) => !item.id || !item.type || !item.label || item.amountCents === null) ? null : items;
}
function normalizeServiceTicket(value) {
  const lineItems = normalizeOpsLineItems(value?.lineItems);
  const total = lineItems?.reduce((sum, item) => sum + item.amountCents, 0);
  return opsRecord(value) && opsText(value.id) && opsText(value.guestCheckinId) && opsText(value.businessId)
    && OPS_SERVICES[value.serviceKey] && ['waiting', 'in_service', 'completed'].includes(value.status)
    && lineItems && total === value.currentTotalCents && opsStoredTimestamp(value.createdAt)
    ? { ...structuredClone(value), id: value.id.trim(), guestCheckinId: value.guestCheckinId.trim(),
      businessId: value.businessId.trim(), lineItems, currentTotalCents: total }
    : null;
}
function normalizeStaffEligibility(value, tickets) {
  const ticket = tickets.find((row) => row.id === value?.ticketId);
  return opsRecord(value) && ticket && OPS_SERVICES[value.serviceKey] && OPS_STAFF[value.requestedStaffId]
    && typeof value.eligible === 'boolean' && Array.isArray(value.recommendedStaffIds)
    && value.recommendedStaffIds.every((id) => OPS_STAFF[id]?.businessId === ticket.businessId)
    ? structuredClone(value) : null;
}

function createServiceTicket(state, guestCheckin, now = Date.now()) {
  if (!opsRecord(guestCheckin) || !opsText(guestCheckin.id) || !opsText(guestCheckin.businessId)) return { ok: false, code: 'invalid_guest' };
  const existing = state.serviceTickets.find((row) => row.guestCheckinId === guestCheckin.id);
  if (existing) return { ok: true, ticket: existing, idempotent: true };
  const service = OPS_SERVICES[guestCheckin.serviceKey];
  if (!service) return { ok: false, code: 'unknown_service' };
  const id = opsId('ticket'); const timestamp = opsTimestamp(now);
  if (!id.ok || !timestamp.ok) return !id.ok ? id : timestamp;
  const lineItems = [{ id: `${id.value}-service`, type: 'service', label: service.label, amountCents: service.amountCents }];
  if (guestCheckin.serviceKey === 'deluxe-pedicure') lineItems.push({ id: `${id.value}-promo`, type: 'discount', label: 'Promo NEW10', amountCents: -550 });
  const ticket = { id: id.value, number: state.serviceTickets.length + 104, guestCheckinId: guestCheckin.id,
    businessId: guestCheckin.businessId, serviceKey: guestCheckin.serviceKey, status: 'in_service',
    staffProfileId: opsText(guestCheckin.staffProfileId), lineItems,
    currentTotalCents: lineItems.reduce((sum, item) => sum + item.amountCents, 0),
    frontDeskRequestedAt: null, createdAt: timestamp.value, completedAt: null };
  state.serviceTickets.push(ticket); state.ui.selectedTicketId = ticket.id;
  return { ok: true, ticket };
}

function evaluateStaffEligibility(state, ticketId, serviceKey, staffId) {
  const ticket = state.serviceTickets.find((row) => row.id === ticketId);
  const requested = OPS_STAFF[staffId];
  if (!ticket || !OPS_SERVICES[serviceKey] || !requested || requested.businessId !== ticket.businessId) return { ok: false, code: 'invalid_eligibility_request' };
  const eligible = requested.available && requested.serviceSkills.includes(serviceKey);
  const recommendedStaffIds = eligible ? [] : Object.values(OPS_STAFF)
    .filter((staff) => staff.businessId === ticket.businessId && staff.available && staff.serviceSkills.includes(serviceKey))
    .map((staff) => staff.id);
  const result = { id: `eligibility-${ticket.id}-${state.staffEligibility.length + 1}`, ticketId: ticket.id,
    serviceKey, requestedStaffId: staffId, eligible, recommendedStaffIds, selectedStaffId: null };
  state.staffEligibility.push(result);
  state.ui.selectedTicketId = ticket.id;
  state.ui.selectedStaffId = recommendedStaffIds[0] || null;
  return { ok: true, ...result };
}

function chooseRecommendedStaff(state, ticketId, staffId, now = Date.now()) {
  const ticket = state.serviceTickets.find((row) => row.id === ticketId);
  const latest = [...state.staffEligibility].reverse().find((row) => row.ticketId === ticketId);
  if (!ticket || !latest || !latest.recommendedStaffIds.includes(staffId)) return { ok: false, code: 'staff_not_recommended' };
  const staff = OPS_STAFF[staffId]; const timestamp = opsTimestamp(now);
  if (!staff || staff.businessId !== ticket.businessId || !staff.available || !timestamp.ok) return !timestamp.ok ? timestamp : { ok: false, code: 'staff_unavailable' };
  ticket.staffProfileId = staffId; latest.selectedStaffId = staffId; state.ui.selectedStaffId = staffId;
  return { ok: true, ticket, staff, selectedAt: timestamp.value };
}

function askFrontDesk(state, ticketId, now = Date.now()) {
  const ticket = state.serviceTickets.find((row) => row.id === ticketId);
  const timestamp = opsTimestamp(now);
  if (!ticket || !timestamp.ok) return !timestamp.ok ? timestamp : { ok: false, code: 'ticket_not_found' };
  if (ticket.frontDeskRequestedAt) return { ok: true, ticket, idempotent: true };
  ticket.frontDeskRequestedAt = timestamp.value;
  return { ok: true, ticket };
}
```

In `normalizeOperationsState()`, replace the generic Task 7 cloning for tickets and eligibility with foreign-key ordered normalization:

```js
const serviceTickets = (Array.isArray(value.serviceTickets) ? value.serviceTickets : [])
  .map(normalizeServiceTicket).filter(Boolean);
const staffEligibility = (Array.isArray(value.staffEligibility) ? value.staffEligibility : [])
  .map((row) => normalizeStaffEligibility(row, serviceTickets)).filter(Boolean);
return { schemaVersion: OPS_SCHEMA_VERSION, updatedAt: opsText(value.updatedAt) || fallback.updatedAt,
  serviceTickets,
  addOnRequests: Array.isArray(value.addOnRequests) ? structuredClone(value.addOnRequests.filter(opsRecord)) : [],
  staffEligibility,
  ui: { activeScreen: screens.has(value.ui?.activeScreen) ? value.ui.activeScreen : 'liveticket',
    role: roles.has(value.ui?.role) ? value.ui.role : 'Customer',
    selectedTicketId: opsText(value.ui?.selectedTicketId), selectedStaffId: opsText(value.ui?.selectedStaffId) } };
```

- [ ] **Step 4: Implement the two companion screens**

Fill the first two sections with static controls:

```html
<section id="ops-liveticket" data-ops-screen="liveticket">
  <div class="ops-card"><div class="flex justify-between"><h2 id="ops-ticket-number" class="font-black"></h2><span id="ops-ticket-status" class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600"></span></div></div>
  <div class="ops-card mt-4"><div id="ops-ticket-items" class="divide-y divide-dashed"></div><div class="mt-4 flex justify-between text-xl font-black"><span>Current Total</span><strong id="ops-ticket-total"></strong></div></div>
  <div class="ops-card mt-4"><p class="text-sm font-bold">Technician</p><div class="mt-3 flex items-center justify-between"><strong id="ops-ticket-staff"></strong><div class="flex gap-2"><button type="button" class="ops-button-secondary" data-ops-action="call-tech">Call</button><button type="button" class="ops-button-secondary" data-ops-action="message-tech">Msg</button></div></div><button type="button" class="ops-button-secondary mt-4 w-full" data-ops-action="review-staff-eligibility">Review staff eligibility</button></div>
  <nav class="mt-4 grid grid-cols-4 gap-2"><button type="button" class="ops-button" data-ops-action="open-ticket-tab" data-target="liveticket">Ticket</button><button type="button" class="ops-button-secondary" data-ops-action="open-ticket-tab" data-target="pay">Pay</button><button type="button" class="ops-button-secondary" data-ops-action="open-ticket-tab" data-target="review">Review</button><button type="button" class="ops-button-secondary" data-ops-action="open-ticket-tab" data-target="reward">Reward</button></nav>
</section>
<section id="ops-staffnoteligible" class="hidden" data-ops-screen="staffnoteligible">
  <div class="ops-card"><div class="flex justify-between"><h2 class="font-black">Requested Staff Warning</h2><span class="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">Review</span></div><p id="ops-eligibility-warning" class="mt-3 text-sm text-slate-600"></p><dl class="mt-4 space-y-3"><div class="flex justify-between"><dt>Requested Staff</dt><dd id="ops-requested-staff" class="font-bold"></dd></div><div class="flex justify-between"><dt>Service</dt><dd id="ops-requested-service" class="font-bold"></dd></div></dl></div>
  <div class="ops-card mt-4"><h3 class="font-black">Recommended</h3><div id="ops-recommended-staff" class="mt-3 grid gap-3"></div></div>
  <button id="ops-choose-staff" type="button" class="ops-button mt-4 w-full" data-ops-action="choose-recommended-staff" disabled>Choose staff</button><button type="button" class="ops-button-secondary mt-3 w-full" data-ops-action="ask-front-desk">Ask Front Desk</button>
</section>
```

Append the action registry and safe renderers:

```js
const OPS_ACTIONS = new Map();
let operationsCustomerSnapshot = { profile: null, businesses: {}, guestCheckins: [] };
function registerOpsAction(name, handler) { OPS_ACTIONS.set(name, handler); }
function showOpsScreen(name) {
  document.querySelectorAll('[data-ops-screen]').forEach((screen) => screen.classList.toggle('hidden', screen.dataset.opsScreen !== name));
}
function opsMoney(cents) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100); }
function opsToast(message) { const toast = document.getElementById('ops-toast'); toast.textContent = message; toast.className = 'fixed bottom-4 left-4 rounded-xl bg-slate-950 px-4 py-3 text-white'; }

function renderLiveTicket() {
  const ticket = operationsState.serviceTickets.find((row) => row.id === operationsState.ui.selectedTicketId);
  if (!ticket) return;
  document.getElementById('ops-ticket-number').textContent = `#${ticket.number}`;
  document.getElementById('ops-ticket-status').textContent = ticket.status.replace('_', ' ');
  document.getElementById('ops-ticket-total').textContent = opsMoney(ticket.currentTotalCents);
  document.getElementById('ops-ticket-staff').textContent = OPS_STAFF[ticket.staffProfileId]?.name || 'Unassigned';
  document.getElementById('ops-ticket-items').replaceChildren(...ticket.lineItems.map((item) => {
    const row = document.createElement('div'); row.className = 'flex justify-between py-2';
    const label = document.createElement('span'); const amount = document.createElement('strong');
    label.textContent = item.label; amount.textContent = opsMoney(item.amountCents); row.append(label, amount); return row;
  }));
}

function renderEligibility() {
  const ticketId = operationsState.ui.selectedTicketId;
  const result = [...operationsState.staffEligibility].reverse().find((row) => row.ticketId === ticketId);
  if (!result) return;
  const requested = OPS_STAFF[result.requestedStaffId];
  document.getElementById('ops-eligibility-warning').textContent = `${requested.name} is not eligible for ${OPS_SERVICES[result.serviceKey].label}.`;
  document.getElementById('ops-requested-staff').textContent = requested.name;
  document.getElementById('ops-requested-service').textContent = OPS_SERVICES[result.serviceKey].label;
  const host = document.getElementById('ops-recommended-staff');
  host.replaceChildren(...result.recommendedStaffIds.map((staffId) => {
    const staff = OPS_STAFF[staffId]; const button = document.createElement('button');
    button.type = 'button'; button.className = 'ops-button-secondary text-left'; button.dataset.opsAction = 'select-recommended-staff'; button.dataset.staffId = staffId;
    button.textContent = `${staff.name} · ${staff.available ? 'Available' : 'Unavailable'}`;
    button.setAttribute('aria-pressed', String(operationsState.ui.selectedStaffId === staffId)); return button;
  }));
  const selected = OPS_STAFF[operationsState.ui.selectedStaffId];
  const choose = document.getElementById('ops-choose-staff'); choose.disabled = !selected;
  choose.textContent = selected ? `Choose ${selected.name}` : 'Choose staff';
}

registerOpsAction('review-staff-eligibility', () => {
  const ticket = operationsState.serviceTickets.find((row) => row.id === operationsState.ui.selectedTicketId);
  const result = commitOperations((draft) => {
    const evaluated = evaluateStaffEligibility(draft, ticket.id, 'acrylic-full-set', ticket.staffProfileId);
    if (evaluated.ok) draft.ui.activeScreen = 'staffnoteligible';
    return evaluated;
  });
  if (!result.ok) return opsToast('Cannot evaluate staff'); renderEligibility(); showOpsScreen('staffnoteligible');
});
registerOpsAction('select-recommended-staff', (control) => {
  const result = commitOperations((draft) => { draft.ui.selectedStaffId = control.dataset.staffId; return { ok: true }; });
  if (!result.ok) return opsToast('Cannot select staff'); renderEligibility();
});
registerOpsAction('choose-recommended-staff', () => {
  const result = commitOperations((draft) => {
    const chosen = chooseRecommendedStaff(draft, draft.ui.selectedTicketId, operationsState.ui.selectedStaffId);
    if (chosen.ok) draft.ui.activeScreen = 'liveticket';
    return chosen;
  });
  if (!result.ok) return opsToast('Cannot choose staff'); renderLiveTicket(); showOpsScreen('liveticket');
});
registerOpsAction('ask-front-desk', () => {
  const result = commitOperations((draft) => askFrontDesk(draft, draft.ui.selectedTicketId));
  opsToast(result.ok ? 'Front Desk has been notified' : 'Request failed');
});
registerOpsAction('call-tech', () => opsToast('Demo only: open the device dialer in production.'));
registerOpsAction('message-tech', () => opsToast('Demo only: open messaging in production.'));
registerOpsAction('open-ticket-tab', (control) => opsToast(control.dataset.target === 'liveticket' ? 'Ticket is open' : `${control.dataset.target} continues in Customer App.`));

function handleOpsClick(event) {
  const control = event.target.closest('[data-ops-action]');
  if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true') return;
  OPS_ACTIONS.get(control.dataset.opsAction)?.(control);
}
```

At the start of `initializeOperations()`, create the ticket from persisted customer data or an explicit demo guest, then attach the click handler and render:

```js
operationsCustomerSnapshot = readCustomerSnapshot();
const guest = operationsCustomerSnapshot.guestCheckins[0] || { id: 'guest-checkin-demo', businessId: 'bitcoin-nail-bar', name: 'Amy Nguyen', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny' };
if (operationsCustomerSnapshot.guestCheckins.length === 0) operationsCustomerSnapshot = {
  profile: { id: 'cust-demo', name: guest.name, phone: guest.phone },
  businesses: { 'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' } },
  guestCheckins: [guest]
};
if (!operationsState.serviceTickets.some((row) => row.guestCheckinId === guest.id)) commitOperations((draft) => createServiceTicket(draft, guest));
document.addEventListener('click', handleOpsClick);
renderLiveTicket();
showOpsScreen(operationsState.ui.activeScreen);
```

Expose Task 8 domain functions in `window.NEXORA_OPERATIONS_TEST_API`:

```js
createServiceTicket,
evaluateStaffEligibility,
chooseRecommendedStaff,
askFrontDesk,
```

- [ ] **Step 5: Verify and commit**

```bash
node --test html/customer/customer-salon-operations.test.mjs
git diff --check -- html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs
```

Expected: all companion tests PASS.

```bash
git add html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs
git commit -m "feat: add live ticket staff routing"
```

**Review gate:** Reviewer verifies no automatic staff replacement, recommendation/button copy stays aligned, wrong-business staff is rejected and customer data is rendered with `textContent`.

---

### Task 9: Duyệt add-on và cầu nối item đã chấp nhận

**Files:**
- Modify: `html/customer/customer-salon-operations.test.mjs`
- Modify: `html/customer/customer-salon-operations.html`
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Produces in companion: `proposeAddOn(state, input, now?): Result`
- Produces in companion: `resolveAddOn(state, addOnId, decision, phoneLast4, customerSnapshot, now?): Result`
- Produces in Customer App: `importAcceptedAddOns(appState, checkoutDraftId, operationsSnapshot): Result`
- Produces actions: `open-addon`, `accept-addon`, `decline-addon`, `confirm-addon-phone`.

- [ ] **Step 1: Write failing atomic add-on tests**

```js
function seedTicketWithCustomer(api, { phone }) {
  const state = seedTicket(api);
  const ticket = state.serviceTickets[0];
  const customerSnapshot = { profile: { id: 'cust-amy', name: 'Amy Nguyen', phone }, businesses: {
    'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' }
  }, guestCheckins: [{ id: ticket.guestCheckinId, businessId: ticket.businessId, name: 'Amy Nguyen', phone,
    serviceKey: ticket.serviceKey, staffProfileId: ticket.staffProfileId }] };
  return { state, customerSnapshot, ticket };
}

test('accepts an add-on once after matching guest phone last four', () => {
  const { api } = testApi();
  const { state, customerSnapshot, ticket } = seedTicketWithCustomer(api, { phone: '8325550198' });
  const proposed = api.proposeAddOn(state, {
    ticketId: ticket.id, staffProfileId: 'staff-jenny', label: 'Gel Polish', amountCents: 1500
  }, 1000);
  assert.equal(ticket.currentTotalCents, 4950);
  const accepted = api.resolveAddOn(state, proposed.addOn.id, 'accepted', '0198', customerSnapshot, 2000);
  assert.equal(accepted.addOn.status, 'accepted');
  assert.equal(ticket.currentTotalCents, 6450);
  const snapshot = JSON.stringify(state);
  assert.equal(api.resolveAddOn(state, proposed.addOn.id, 'accepted', '0198', customerSnapshot, 3000).idempotent, true);
  assert.equal(JSON.stringify(state), snapshot);
});

test('decline or wrong phone confirmation never changes ticket total', () => {
  const { api } = testApi();
  const fixture = seedTicketWithCustomer(api, { phone: '8325550198' });
  const proposed = api.proposeAddOn(fixture.state, { ticketId: fixture.ticket.id, staffProfileId: 'staff-jenny', label: 'Gel Polish', amountCents: 1500 }, 1000);
  assert.equal(api.resolveAddOn(fixture.state, proposed.addOn.id, 'accepted', '0000', fixture.customerSnapshot, 2000).code, 'phone_mismatch');
  api.resolveAddOn(fixture.state, proposed.addOn.id, 'declined', '0198', fixture.customerSnapshot, 3000);
  assert.equal(fixture.ticket.currentTotalCents, 4950);
});
```

Add this failing bridge test to `cutomer-reward.test.mjs`:

```js
test('imports an accepted operations add-on once by guest check-in id', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const checkout = seedCheckoutDraft(api, app, { method: 'Card', tipBasisPoints: 0 });
  const operations = { serviceTickets: [{ id: 'ticket-1', guestCheckinId: checkout.guestCheckinId,
    businessId: checkout.businessId }], addOnRequests: [{ id: 'addon-1', ticketId: 'ticket-1',
    businessId: checkout.businessId, label: 'Gel Polish', amountCents: 1500, status: 'accepted' }],
    staffEligibility: [] };
  const first = api.importAcceptedAddOns(app, checkout.id, operations);
  const second = api.importAcceptedAddOns(app, checkout.id, operations);
  assert.equal(first.importedCount, 1);
  assert.equal(second.importedCount, 0);
  assert.equal(checkout.lineItems.filter((item) => item.sourceAddOnId === 'addon-1').length, 1);
  assert.equal(checkout.totalCents, 6450);
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test --test-name-pattern="add-on once|wrong phone" html/customer/customer-salon-operations.test.mjs
node --test --test-name-pattern="imports an accepted operations add-on" html/customer/cutomer-reward.test.mjs
```

Expected: both commands FAIL because add-on and bridge functions are absent.

- [ ] **Step 3: Implement proposed → accepted/declined lifecycle**

Append to the companion script:

```js
function proposeAddOn(state, input, now = Date.now()) {
  const ticket = state.serviceTickets.find((row) => row.id === input?.ticketId);
  const staff = OPS_STAFF[input?.staffProfileId];
  const label = opsText(input?.label); const amountCents = input?.amountCents;
  if (!ticket || !staff || staff.businessId !== ticket.businessId || !label
    || !Number.isSafeInteger(amountCents) || amountCents <= 0) return { ok: false, code: 'invalid_addon' };
  const existing = state.addOnRequests.find((row) => row.ticketId === ticket.id && row.label === label && row.status === 'proposed');
  if (existing) return { ok: true, addOn: existing, idempotent: true };
  const id = opsId('addon'); const timestamp = opsTimestamp(now);
  if (!id.ok || !timestamp.ok) return !id.ok ? id : timestamp;
  const addOn = { id: id.value, ticketId: ticket.id, guestCheckinId: ticket.guestCheckinId,
    businessId: ticket.businessId, staffProfileId: input.staffProfileId, label, amountCents,
    status: 'proposed', createdAt: timestamp.value, resolvedAt: null };
  state.addOnRequests.push(addOn);
  return { ok: true, addOn };
}

function resolveAddOn(state, addOnId, decision, phoneLast4, customerSnapshot, now = Date.now()) {
  const addOn = state.addOnRequests.find((row) => row.id === addOnId);
  if (!addOn) return { ok: false, code: 'addon_not_found' };
  if (addOn.status !== 'proposed') {
    return addOn.status === decision ? { ok: true, addOn, idempotent: true } : { ok: false, code: 'addon_already_resolved' };
  }
  if (state.ui.role !== 'Customer') return { ok: false, code: 'customer_approval_required' };
  if (!['accepted', 'declined'].includes(decision)) return { ok: false, code: 'invalid_decision' };
  const ticket = state.serviceTickets.find((row) => row.id === addOn.ticketId);
  const guest = customerSnapshot?.guestCheckins?.find((row) => row.id === addOn.guestCheckinId);
  const digits = String(phoneLast4 || '').replace(/\D/g, '');
  if (!ticket || !guest || guest.businessId !== ticket.businessId || digits.length !== 4 || !guest.phone.endsWith(digits)) {
    return { ok: false, code: 'phone_mismatch' };
  }
  const timestamp = opsTimestamp(now);
  if (!timestamp.ok) return timestamp;
  if (decision === 'accepted') {
    if (ticket.lineItems.some((item) => item.sourceAddOnId === addOn.id)) return { ok: false, code: 'duplicate_addon_item' };
    ticket.lineItems.push({ id: `${ticket.id}-addon-${addOn.id}`, type: 'addon', label: addOn.label,
      amountCents: addOn.amountCents, sourceAddOnId: addOn.id });
    ticket.currentTotalCents += addOn.amountCents;
  }
  addOn.status = decision; addOn.resolvedAt = timestamp.value;
  return { ok: true, addOn, ticket };
}

function normalizeAddOnRequest(value, tickets) {
  const ticket = tickets.find((row) => row.id === value?.ticketId);
  const status = ['proposed', 'accepted', 'declined'].includes(value?.status) ? value.status : null;
  const resolvedAt = value?.resolvedAt === null || opsStoredTimestamp(value?.resolvedAt) ? value.resolvedAt : undefined;
  return opsRecord(value) && ticket && value.guestCheckinId === ticket.guestCheckinId
    && value.businessId === ticket.businessId && OPS_STAFF[value.staffProfileId]?.businessId === ticket.businessId
    && opsText(value.id) && opsText(value.label) && Number.isSafeInteger(value.amountCents) && value.amountCents > 0
    && status && opsStoredTimestamp(value.createdAt) && resolvedAt !== undefined
    && ((status === 'proposed' && resolvedAt === null) || (status !== 'proposed' && resolvedAt))
    ? { id: value.id.trim(), ticketId: ticket.id, guestCheckinId: ticket.guestCheckinId,
      businessId: ticket.businessId, staffProfileId: value.staffProfileId, label: value.label.trim(),
      amountCents: value.amountCents, status, createdAt: value.createdAt, resolvedAt }
    : null;
}
```

In `normalizeOperationsState()`, replace the Task 8 `addOnRequests` field with:

```js
addOnRequests: (Array.isArray(value.addOnRequests) ? value.addOnRequests : [])
  .map((row) => normalizeAddOnRequest(row, serviceTickets)).filter(Boolean),
```

- [ ] **Step 4: Implement Add-on Approval screen**

Fill the third companion section and add an entry control to the Live Ticket card:

```html
<button type="button" class="ops-button-secondary mt-3 w-full" data-ops-action="open-addon">Review suggested add-on</button>
<section id="ops-addonapproval" class="hidden" data-ops-screen="addonapproval">
  <div class="ops-card"><div class="flex justify-between"><h2 id="ops-addon-staff" class="font-black"></h2><span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">Approval</span></div><div class="mt-5 rounded-2xl bg-slate-50 p-8 text-center"><strong id="ops-addon-label" class="block text-lg"></strong><span id="ops-addon-amount" class="font-black"></span></div><dl class="mt-4 space-y-3"><div class="flex justify-between"><dt>Current Total</dt><dd id="ops-addon-current" class="font-bold"></dd></div><div class="flex justify-between text-xl font-black"><dt>New Total</dt><dd id="ops-addon-new"></dd></div></dl></div>
  <div class="mt-4 grid grid-cols-2 gap-3"><button type="button" class="ops-button-secondary" data-ops-action="decline-addon">Decline</button><button type="button" class="ops-button" data-ops-action="accept-addon">Accept</button></div>
  <div class="ops-card mt-4"><label class="text-sm font-bold" for="ops-addon-phone">Guest confirm last 4 phone</label><input id="ops-addon-phone" class="ops-input mt-2" inputmode="numeric" maxlength="4"><p id="ops-addon-error" class="mt-2 hidden text-sm text-rose-600" role="alert"></p><button id="ops-addon-confirm" type="button" class="ops-button mt-3 w-full" data-ops-action="confirm-addon-phone" disabled>Confirm</button></div>
</section>
```

Append exact UI state and actions:

```js
let pendingAddOnDecision = null;
function selectedAddOn() { return operationsState.addOnRequests.find((row) => row.ticketId === operationsState.ui.selectedTicketId && row.status === 'proposed'); }
function renderAddOn() {
  const addOn = selectedAddOn(); const ticket = operationsState.serviceTickets.find((row) => row.id === operationsState.ui.selectedTicketId);
  if (!addOn || !ticket) return;
  document.getElementById('ops-addon-staff').textContent = `${OPS_STAFF[addOn.staffProfileId].name} suggested`;
  document.getElementById('ops-addon-label').textContent = addOn.label;
  document.getElementById('ops-addon-amount').textContent = `+ ${opsMoney(addOn.amountCents)}`;
  document.getElementById('ops-addon-current').textContent = opsMoney(ticket.currentTotalCents);
  document.getElementById('ops-addon-new').textContent = opsMoney(ticket.currentTotalCents + addOn.amountCents);
}
function updateAddOnConfirm() {
  const digits = document.getElementById('ops-addon-phone').value.replace(/\D/g, '');
  document.getElementById('ops-addon-confirm').disabled = !pendingAddOnDecision || digits.length !== 4;
}
registerOpsAction('open-addon', () => {
  const result = commitOperations((draft) => {
    const proposed = proposeAddOn(draft, { ticketId: draft.ui.selectedTicketId,
      staffProfileId: draft.serviceTickets.find((row) => row.id === draft.ui.selectedTicketId).staffProfileId,
      label: 'Gel Polish', amountCents: 1500 });
    if (proposed.ok) draft.ui.activeScreen = 'addonapproval';
    return proposed;
  });
  if (!result.ok) return opsToast('Cannot open add-on'); pendingAddOnDecision = null; renderAddOn(); showOpsScreen('addonapproval');
});
registerOpsAction('accept-addon', () => { pendingAddOnDecision = 'accepted'; updateAddOnConfirm(); });
registerOpsAction('decline-addon', () => { pendingAddOnDecision = 'declined'; updateAddOnConfirm(); });
registerOpsAction('confirm-addon-phone', () => {
  const addOn = selectedAddOn();
  const result = commitOperations((draft) => {
    const resolved = resolveAddOn(draft, addOn.id, pendingAddOnDecision,
      document.getElementById('ops-addon-phone').value, operationsCustomerSnapshot);
    if (resolved.ok) draft.ui.activeScreen = 'liveticket';
    return resolved;
  });
  const error = document.getElementById('ops-addon-error');
  error.classList.toggle('hidden', result.ok); error.textContent = result.ok ? '' : 'Phone confirmation does not match.';
  if (!result.ok) return;
  pendingAddOnDecision = null; renderLiveTicket(); showOpsScreen('liveticket');
});
document.getElementById('ops-addon-phone').addEventListener('input', (event) => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4); updateAddOnConfirm();
});
```

Expose companion functions:

```js
proposeAddOn,
resolveAddOn,
```

- [ ] **Step 5: Import accepted add-on into checkout safely**

Add to Customer App:

```js
function importAcceptedAddOns(appState, checkoutDraftId, operationsSnapshot) {
  const checkout = appState.checkoutDrafts.find((row) => row.id === checkoutDraftId);
  if (!checkout || checkout.status !== 'draft' || !isRecord(operationsSnapshot)) return { ok: false, code: 'invalid_checkout_state' };
  const ticket = (Array.isArray(operationsSnapshot.serviceTickets) ? operationsSnapshot.serviceTickets : [])
    .find((row) => row?.guestCheckinId === checkout.guestCheckinId);
  if (!ticket) return { ok: true, importedCount: 0, idempotent: true };
  if (ticket.businessId !== checkout.businessId) return { ok: false, code: 'cross_business_ticket' };
  const accepted = (Array.isArray(operationsSnapshot.addOnRequests) ? operationsSnapshot.addOnRequests : [])
    .filter((row) => row?.ticketId === ticket.id && row.status === 'accepted');
  const additions = [];
  for (const addOn of accepted) {
    if (!normalizedRequiredText(addOn.id) || !normalizedRequiredText(addOn.label)
      || !Number.isSafeInteger(addOn.amountCents) || addOn.amountCents <= 0 || addOn.businessId !== checkout.businessId) {
      return { ok: false, code: 'invalid_accepted_addon' };
    }
    if (!checkout.lineItems.some((item) => item.sourceAddOnId === addOn.id)) additions.push({
      id: `addon-${addOn.id}`, type: 'addon', label: addOn.label.trim(), amountCents: addOn.amountCents, sourceAddOnId: addOn.id
    });
  }
  if (additions.length === 0) return { ok: true, importedCount: 0, idempotent: true };
  const nextItems = [...checkout.lineItems, ...additions];
  const totals = calculateCheckoutTotals(nextItems, checkout.tipBasisPoints);
  if (totals.ok === false) return totals;
  checkout.lineItems = nextItems; Object.assign(checkout, totals);
  return { ok: true, importedCount: additions.length, checkoutDraft: checkout };
}
```

In `open-guest-checkout`, immediately after successful `createCheckoutDraft`, run the bridge and fail closed before rendering:

```js
const imported = commitState((draft) => importAcceptedAddOns(
  draft, draft.ui.pendingContext.checkoutDraftId, readOperationsSnapshot(window.localStorage)
));
if (!imported.ok) return showToast(t('addonImportFailed'), 'error');
```

Expose it in `window.NEXORA_TEST_API`:

```js
importAcceptedAddOns,
```

- [ ] **Step 6: Verify storage isolation and commit**

```bash
node --test html/customer/customer-salon-operations.test.mjs
node --test --test-name-pattern="checkout|accepted add-on|storage" html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: selected tests PASS and customer/operations keys remain isolated.

```bash
git add html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: connect approved add-ons to checkout"
```

**Review gate:** Reviewer verifies wrong last-four, double accept, decline, cross-business ticket and duplicate import all fail without partial totals.

---

### Task 10: Rà soát action, responsive và tài liệu cuối

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/customer-salon-operations.test.mjs`
- Modify: `html/customer/cutomer-reward.html`
- Modify: `html/customer/customer-salon-operations.html`
- Modify: `html/customer/customer-app-developer-spec.md`
- Modify: `html/customer/customer-touch-business-document.md`
- Modify: `html/customer/customer-app-independent-guide.md`
- Modify: `html/customer/customer-salon-cross-surface-design.md`

**Interfaces:**
- Consumes every domain/action/renderer from Tasks 1–9.
- Produces final static action coverage, bilingual copy coverage, browser smoke checklist and updated docs.

- [ ] **Step 1: Add final static contract tests**

Add this customer contract test:

```js
test('keeps 31 app screens and exposes every salon nested view accessibly', () => {
  const source = html();
  assert.equal(screenIds(source).length, 31);
  for (const id of ['scan-camera-view', 'scan-context-view', 'guest-checkin-view', 'guest-checkout-view',
    'payment-proof-view', 'payment-pending-view', 'payment-confirmed-view', 'payment-rejected-view',
    'referral-summary', 'referral-qr', 'referral-invite-list']) {
    assert.match(source, new RegExp(`id="${id}"`));
  }
  assert.match(source, /<label[^>]*for="payment-proof-file"/);
  assert.match(source, /id="payment-proof-error"[^>]*role="alert"/);
  assert.doesNotMatch(source, /@apply[^;]*(?:app-|ops-)/);
});
```

Add this companion contract test:

```js
test('companion screens actions labels and storage live-region are complete', () => {
  for (const id of ['ops-liveticket', 'ops-staffnoteligible', 'ops-addonapproval']) {
    assert.match(SOURCE, new RegExp(`id="${id}"[^>]*data-ops-screen=`));
  }
  const registered = new Set([...SOURCE.matchAll(/registerOpsAction\('([^']+)'/g)].map((match) => match[1]));
  const controls = [...SOURCE.matchAll(/<button\b([^>]*)>/g)].map((match) => match[1]);
  for (const attributes of controls) {
    const action = attributes.match(/data-ops-action="([^"]+)"/)?.[1];
    assert.ok(action, `button missing data-ops-action: ${attributes}`);
    assert.ok(registered.has(action), `unregistered operations action: ${action}`);
  }
  for (const inputId of [...SOURCE.matchAll(/<input\b[^>]*id="([^"]+)"/g)].map((match) => match[1])) {
    assert.match(SOURCE, new RegExp(`<label[^>]*for="${inputId}"`));
  }
  assert.match(SOURCE, /id="ops-toast"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.doesNotMatch(SOURCE, /@apply[^;]*(?:app-|ops-)/);
});
```

- [ ] **Step 2: Run static tests and verify the contracts pass**

```bash
node --test --test-name-pattern="screen|action|accessibility|language|Tailwind" html/customer/cutomer-reward.test.mjs
node --test --test-name-pattern="screen|action|accessibility|storage" html/customer/customer-salon-operations.test.mjs
```

Expected: selected tests PASS.

- [ ] **Step 3: Complete bilingual and accessibility audit**

Add these exact new keys inside both existing `COPY.vi` and `COPY.en` objects:

```js
// COPY.vi
points: 'điểm', invalidGuest: 'Vui lòng kiểm tra tên, số điện thoại và dịch vụ.',
noPreference: 'Không ưu tiên', notAvailable: 'Chưa có', guestCheckinSuccess: 'Đã check-in khách.',
guestNotFound: 'Không tìm thấy lượt check-in khách.', serviceNotFound: 'Không tìm thấy dịch vụ.',
checkoutFailed: 'Không thể tạo thanh toán.', selectPaymentMethod: 'Vui lòng chọn phương thức thanh toán.',
invalidImage: 'Ảnh không hợp lệ.', proofSavedWithoutImage: 'Đã lưu bằng chứng không kèm ảnh do giới hạn bộ nhớ.',
proofSubmitFailed: 'Không thể gửi bằng chứng.', verificationFailed: 'Không thể cập nhật xác minh.',
proofRejected: 'Lễ tân đã từ chối bằng chứng.', askFrontDesk: 'Vui lòng trao đổi với lễ tân.',
selfReferral: 'Không thể tự giới thiệu chính mình.', referralShared: 'Đã chia sẻ link giới thiệu.',
shareFailed: 'Không thể chia sẻ link.', referralUpdateFailed: 'Không thể cập nhật giới thiệu.',
addonImportFailed: 'Không thể nhập add-on đã duyệt.',

// COPY.en
points: 'points', invalidGuest: 'Check the name, phone, and service.',
noPreference: 'No preference', notAvailable: 'Not available', guestCheckinSuccess: 'Guest checked in.',
guestNotFound: 'Guest check-in was not found.', serviceNotFound: 'Service was not found.',
checkoutFailed: 'Checkout could not be created.', selectPaymentMethod: 'Select a payment method.',
invalidImage: 'The image is invalid.', proofSavedWithoutImage: 'Proof was saved without the image because storage is full.',
proofSubmitFailed: 'Proof could not be submitted.', verificationFailed: 'Verification could not be updated.',
proofRejected: 'Front Desk rejected the proof.', askFrontDesk: 'Please ask Front Desk.',
selfReferral: 'You cannot refer yourself.', referralShared: 'Referral link shared.',
shareFailed: 'Referral link could not be shared.', referralUpdateFailed: 'Referral could not be updated.',
addonImportFailed: 'The approved add-on could not be imported.',
```

Add companion dynamic copy and its language helper:

```js
const OPS_COPY = Object.freeze({
  vi: { in_service: 'Đang làm', waiting: 'Đang chờ', completed: 'Hoàn tất', accepted: 'Đã chấp nhận',
    declined: 'Đã từ chối', available: 'Sẵn sàng', unavailable: 'Chưa sẵn sàng', choose: 'Chọn',
    frontDeskSent: 'Đã báo lễ tân', requestFailed: 'Không thể gửi yêu cầu',
    notEligible: (staff, service) => `${staff} chưa đủ điều kiện cho ${service}.` },
  en: { in_service: 'In service', waiting: 'Waiting', completed: 'Completed', accepted: 'Accepted',
    declined: 'Declined', available: 'Available', unavailable: 'Unavailable', choose: 'Choose',
    frontDeskSent: 'Front Desk has been notified', requestFailed: 'Request failed',
    notEligible: (staff, service) => `${staff} is not eligible for ${service}.` }
});
const opsLanguage = () => document.documentElement.lang === 'en' ? 'en' : 'vi';
const opsT = (key, ...args) => {
  const value = OPS_COPY[opsLanguage()][key];
  return typeof value === 'function' ? value(...args) : value;
};
```

Replace the dynamic hardcoded strings in Task 8 with these exact assignments:

```js
document.getElementById('ops-ticket-status').textContent = opsT(ticket.status);
document.getElementById('ops-eligibility-warning').textContent = opsT('notEligible', requested.name, OPS_SERVICES[result.serviceKey].label);
button.textContent = `${staff.name} · ${opsT(staff.available ? 'available' : 'unavailable')}`;
choose.textContent = selected ? `${opsT('choose')} ${selected.name}` : opsT('choose');
opsToast(result.ok ? opsT('frontDeskSent') : opsT('requestFailed'));
```

Set the companion’s default visible static copy to Vietnamese while preserving enum values:

```html
<h1 class="font-black">Vận hành Salon</h1>
<label class="text-xs font-bold">Vai trò<select id="ops-role" class="ml-2 rounded-lg bg-white px-2 py-1 text-slate-950"><option value="Customer">Khách hàng</option><option value="Front Desk">Lễ tân</option><option value="Staff">Nhân viên</option></select></label>
<span>Thành tiền hiện tại</span>
<button type="button" class="ops-button-secondary mt-4 w-full" data-ops-action="review-staff-eligibility">Kiểm tra điều kiện nhân viên</button>
<h2 class="font-black">Cảnh báo nhân viên được yêu cầu</h2>
<h3 class="font-black">Đề xuất</h3>
<button type="button" class="ops-button-secondary mt-3 w-full" data-ops-action="ask-front-desk">Nhờ lễ tân hỗ trợ</button>
<button type="button" class="ops-button-secondary" data-ops-action="decline-addon">Từ chối</button>
<button type="button" class="ops-button" data-ops-action="accept-addon">Chấp nhận</button>
<label class="text-sm font-bold" for="ops-addon-phone">Khách xác nhận 4 số cuối điện thoại</label>
```

Use text and Lucide icons together for non-neutral statuses by replacing the status containers with:

```html
<span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600"><i data-lucide="sparkles" class="h-3 w-3" aria-hidden="true"></i><span id="ops-ticket-status"></span></span>
<span class="status-badge inline-flex items-center gap-1 text-emerald-700"><i data-lucide="circle-check" class="h-3 w-3" aria-hidden="true"></i><span>Paid</span></span>
```

Synchronize disabled state with an accessible reason:

```js
function setDisabledReason(control, disabled, reason) {
  control.disabled = disabled;
  control.setAttribute('aria-disabled', String(disabled));
  if (disabled) control.setAttribute('title', reason); else control.removeAttribute('title');
}
setDisabledReason(document.getElementById('ops-choose-staff'), !selected, 'Chọn một nhân viên được đề xuất trước.');
setDisabledReason(document.getElementById('ops-addon-confirm'), !pendingAddOnDecision || digits.length !== 4,
  'Chọn Chấp nhận/Từ chối và nhập đủ 4 số cuối.');
```

Add reduced-motion behavior to the companion stylesheet:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Run responsive browser smoke**

Serve only the workspace:

```bash
python3 -m http.server 4173 --directory .
```

Open:

```text
http://localhost:4173/html/customer/cutomer-reward.html
http://localhost:4173/html/customer/customer-salon-operations.html
```

Verify widths 360, 390, 768, 1024 and 1440 px. Customer uses bottom navigation below `lg` and sidebar from `lg`; companion role switch and all action bars remain visible without horizontal overflow.

- [ ] **Step 5: Update source documentation**

Append this section to `customer-app-developer-spec.md`:

```markdown
## Customer Salon Scan, Guest Checkout và Payment Proof

### Mục đích và điểm vào

Customer mở screen `scan`, quét QR `https://nexoratouch.com/touch/{businessId}/{station}` và xác nhận đúng salon trước khi check-in. Người chưa đăng nhập dùng `guest-checkin-view`; thành viên tiếp tục dùng member check-in hiện có. Guest Checkout bắt đầu từ một `guestCheckinId`, không bắt đầu từ tên hoặc số điện thoại tự do.

### UI và dữ liệu

- `scan`: `scan-camera-view` → `scan-context-view` → `guest-checkin-view`.
- `pay`: `guest-checkout-view` → `payment-proof-view` cho Zelle/Venmo.
- `paydone`: `payment-pending-view` → `payment-confirmed-view` hoặc `payment-rejected-view`.
- Số tiền lưu bằng integer cents; tip lưu bằng basis points `0 | 1500 | 1800 | 2000`.
- Customer key sở hữu `guestCheckins`, `checkoutDrafts`, `paymentProofs`, `receipts`, `guestRewardClaims`, `referrals`.

### Hành vi và trạng thái

`checkoutDraft.status` đi `draft → pending_verification → confirmed | rejected`. `paymentProof.status` đi `draft → pending_verification → verified | rejected`. Pending hoặc rejected không tạo receipt, không cộng balance và không ghi ledger. Verified tạo receipt bất biến và các `guestRewardClaims.status = pending`; claim chỉ merge sau OTP với đúng số điện thoại, vào đúng `businessId`, đúng một lần.

### Ranh giới backend

Prototype chỉ mô phỏng camera, upload, Front Desk verification và thanh toán bằng localStorage. Card, Zelle, Venmo và Pay at Counter chuyển tiền bên ngoài NEXORA; Payment Proof không chuyển tiền và không chứng minh giao dịch đã hoàn tất cho tới khi Front Desk xác minh. Production cần API idempotency, object storage có scan malware, payment/deep-link integration, OTP/SMS và audit log phía server.

### Edge cases

- QR sai origin/path/business/station bị từ chối mà không đổi state.
- Hai lần mở checkout cho cùng guest trả draft hiện có.
- Proof verify/reject lặp lại không tạo receipt, claim hoặc ledger trùng.
- localStorage quota đầy: thử lưu metadata proof không ảnh và báo rõ cho khách.
- Add-on khác business, sai ticket, sai 4 số cuối hoặc đã resolve bị từ chối atomic.
- Referral tự giới thiệu, chưa joined hoặc chưa có paid visit không được cộng điểm.

### Acceptance tests

1. Quét hai QR salon khác nhau hiển thị đúng business và balance riêng.
2. Guest check-in không thay đổi balance của member đang đăng nhập.
3. `$55.00 - $5.50 + $15.00 + 18%` cho total `$76.11` bằng integer cents.
4. Proof pending/rejected tạo `0` điểm; verified tạo đúng một receipt và pending claims.
5. OTP khác số guest không merge; OTP cùng số merge đúng business một lần.
6. Referral chỉ release `50` điểm business-funded sau sự kiện paid visit.
```

Append this workflow block to `customer-touch-business-document.md`:

````markdown
## Quy trình Salon Scan đa điểm

```text
Salon QR → nhận diện business/station
  ├─ Thành viên → member check-in hiện có
  └─ Guest → guest check-in → live ticket → checkout
       → Card/Pay at Counter hoặc Zelle/Venmo proof
       → Front Desk xác minh
          ├─ verified → receipt + pending guest reward claims
          └─ rejected → thay proof hoặc trả tại quầy
```

NEXORA không giữ tiền. Mọi payment method là đường thanh toán ngoài NEXORA; companion chỉ mô phỏng tác vụ vận hành. Customer App sở hữu dữ liệu guest/payment/referral trong `nexora.customer.prototype.v1`; companion sở hữu ticket/staff/add-on trong `nexora.customer.crosssurface.v1`. Hai artifact chỉ đọc snapshot đã sanitize của nhau, join bằng `guestCheckinId`/`ticketId`, và không ghi vào key của artifact còn lại.
````

Append this handoff section to `customer-app-independent-guide.md`:

```markdown
## Handoff Customer Salon Cross-surface

- Entry files: `cutomer-reward.html` và `customer-salon-operations.html`.
- Storage: Customer schema v2 tại `nexora.customer.prototype.v1`; Operations schema v1 tại `nexora.customer.crosssurface.v1`.
- Customer domain actions: `stageSalonScan`, `createGuestCheckin`, `createCheckoutDraft`, `submitPaymentProof`, `verifyPaymentProof`, `mergeGuestJourney`, `createReferralInvite`, `releaseReferralReward`, `importAcceptedAddOns`.
- Operations domain actions: `createServiceTicket`, `evaluateStaffEligibility`, `chooseRecommendedStaff`, `proposeAddOn`, `resolveAddOn`.
- Frontend simulation: QR camera, file upload, Call/Message, Front Desk verification, payment handoff và paid-visit referral event.
- External production dependencies: API/auth, OTP/SMS, camera permission, object storage, malware scan, payment/deep links, webhook verification, server ledger và audit log.
- Verification: `node --test html/customer/cutomer-reward.test.mjs` và `node --test html/customer/customer-salon-operations.test.mjs`.
```

Replace the ownership/map subsection in `customer-salon-cross-surface-design.md` with:

```markdown
## Quyền sở hữu state đã chốt

| State | Owner duy nhất | Artifact còn lại |
|---|---|---|
| Guest check-in, checkout, proof, receipt, guest claim, referral | `nexora.customer.prototype.v1` | Companion chỉ đọc snapshot đã sanitize |
| Service ticket, staff eligibility, add-on request | `nexora.customer.crosssurface.v1` | Customer chỉ đọc accepted add-on đã sanitize |

Cross-surface join chỉ dùng `guestCheckinId` và `ticketId`; không join theo tên hoặc số điện thoại hiển thị. `cutomer-reward.html` vẫn đúng 31 `.app-screen`; các flow mới là nested views. `customer-salon-operations.html` chứa ba screen độc lập `ops-liveticket`, `ops-staffnoteligible`, `ops-addonapproval`. Trạng thái tài liệu vẫn là **Chờ review** cho tới khi Product Owner phê duyệt.
```

- [ ] **Step 6: Run complete verification**

```bash
node --test html/customer/cutomer-reward.test.mjs
node --test html/customer/customer-salon-operations.test.mjs
git diff --check -- html/customer
rg -n "onClick=|onclick=|javascript:" html/customer/cutomer-reward.html html/customer/customer-salon-operations.html
```

Expected:

- all old and new tests PASS;
- diff check has no output;
- inline-action search has no output;
- Customer App still has exactly 31 `.app-screen` IDs;
- both localStorage keys reload independently.

- [ ] **Step 7: Commit final integration**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs html/customer/customer-app-developer-spec.md html/customer/customer-touch-business-document.md html/customer/customer-app-independent-guide.md html/customer/customer-salon-cross-surface-design.md
git commit -m "docs: finalize customer salon cross-surface flow"
```

**Review gate:** One reviewer audits spec compliance and one reviewer audits code quality/security. No merge until both confirm money/points/consent/referral boundaries and complete action coverage.

## Thứ tự phụ thuộc giữa các task

```text
Task 1 schema
  ├─ Task 2 scan + guest check-in
  │    └─ Task 3 checkout
  │         └─ Task 4 proof + receipt
  │              ├─ Task 5 account merge
  │              └─ Task 6 referral
  └─ Task 7 companion foundation
       └─ Task 8 live ticket + staff eligibility
            └─ Task 9 add-on bridge

Tasks 5, 6 and 7 may run in parallel after their dependencies.
Task 10 starts only after Tasks 1–9 are approved.
```

## Ánh xạ tiêu chí hoàn thành với bộ screenshot

| Screenshot feature | Delivering task |
|---|---|
| Nexora Touch Scan | Task 2 |
| Guest Check-in | Task 2 |
| Customer Live Ticket | Tasks 7–8 |
| Staff Not Eligible | Task 8 |
| Approve Add-on | Task 9 |
| Guest Checkout | Task 3 |
| Payment Proof | Task 4 |
| Payment Confirmed | Tasks 4–5 |
| My Referrals | Task 6 |

## Quy trình thực thi

For each task:

1. Dispatch one fresh implementer agent with only that task brief and dependency interfaces.
2. Implementer follows TDD, runs focused tests, then commits only in-scope files.
3. Dispatch a spec-compliance reviewer; implementer fixes all Critical/Important findings.
4. Dispatch a code-quality reviewer; implementer fixes all Critical/Important findings.
5. Run focused regression again before marking the task complete.
6. Do not start a dependent task until the current review gate passes.
