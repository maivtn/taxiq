# Customer Reward Entitlements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bổ sung My Rewards, Reward Detail và Use Reward chạy song song với point redemption, tự áp một reward hợp lệ vào checkout đã hoàn tất và chỉ consume sau payment confirmation.

**Architecture:** Giữ `REWARDS`/`redemptions` hiện tại cho point redemption; thêm `REWARD_CAMPAIGNS` chỉ đọc và collection `rewardEntitlements` có lifecycle riêng. Domain action là authority cho issue/reserve/apply/remove/consume; renderer chỉ phản ánh state. Customer schema nâng tuần tự từ `2` lên `3`.

> **Supersede note 16/07/2026:** completion gate trong Task 4 bên dưới đã **được thay thế (superseded)** bởi `customer-qr-payment-tip-design.md` và `2026-07-16-customer-qr-payment-tip-implementation-plan.md`. QR release sở hữu `completeServiceTicket`, common completed-ticket handoff và Scan Payment router; reward-entitlements chỉ consume contract đó, không triển khai lại. Phần reward schema/UI của kế hoạch này chưa vì vậy được coi là đã triển khai.

**Tech Stack:** Single-file HTML, Tailwind CSS Browser CDN v4, Lucide Icons, vanilla JavaScript, versioned localStorage, Node `node:test` + `vm` harness.

## Global Constraints

- Chỉ sửa file dưới `html/customer`; không stage hoặc sửa file ngoài phạm vi.
- Giữ storage key `nexora.customer.prototype.v1`; migration schema `2 → 3` không xóa balances, ledger, redemptions, guest checkout, proof hoặc receipts.
- Giữ đúng 31 `.app-screen`; ba UI mới là nested views trong `rewards` và `pay`.
- Tiếng Việt mặc định; mọi copy động có EN/VI parity.
- Chỉ dùng Tailwind Browser CDN v4 và Lucide; không `@apply` custom utility `app-*`.
- NEXORA không giữ tiền; pending/rejected payment không consume reward hoặc cộng điểm.
- Feedback riêng luôn `+15` điểm cho mọi rating; Google Review không phát điểm/reward.
- Mỗi ticket tối đa một reward; salon promo vẫn tồn tại; reward không làm total âm.
- `Use Reward` chỉ reserve; chỉ checkout của ticket completed mới apply; chỉ payment confirmed mới `used`.
- Reward và ledger luôn gắn đúng một `businessId`; không cash-out, transfer hoặc cross-business.
- Tiền dùng integer cents; giữ tip basis hiện tại trước reward credit.
- Mọi mutation quan trọng atomic và idempotent; localStorage save failure phải rollback.
- Giữ strict HTTP(S), exact filename/query và same-origin handoff đã có.

---

## File map

| File | Trách nhiệm |
|---|---|
| `html/customer/cutomer-reward.html` | Catalog, schema v3, domain actions, checkout integration, nested views, renderer/action registry |
| `html/customer/cutomer-reward.test.mjs` | RED/GREEN tests cho migration, lifecycle, checkout authority, UI contracts |
| `html/customer/customer-salon-operations.html` | Salon completion transition và Pay handoff gate |
| `html/customer/customer-salon-operations.test.mjs` | Completion/Pay permission, lifecycle và persistence regression |
| `html/customer/customer-app-developer-spec.md` | Screen behavior, backend boundary, edge cases, acceptance tests |
| `html/customer/customer-reward-localstorage-design.md` | Schema v3, state ownership, migration và localStorage behavior |
| `html/customer/customer-app-independent-guide.md` | Luồng vận hành độc lập và action inventory |
| `html/customer/customer-reward-entitlements-design.md` | Design source đã duyệt; cập nhật trạng thái sau implementation |

### Task 1: Schema v3 và canonical reward entitlement

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:1-2200`
- Modify: `html/customer/cutomer-reward.html:316-1260, 2525-3750, 8040-8070`

**Interfaces:**
- Consumes: `isRecord`, `hasExactOwnKeys`, `normalizedRequiredText`, `validStoredTimestamp`, `createDefaultState`, `migrateState`.
- Produces: `REWARD_CAMPAIGNS`, `REWARD_ENTITLEMENT_STATUSES`, `migrateCustomerLegacyToV2`, `migrateCustomerV2ToV3`, `normalizeRewardEntitlement(appState, value)`, `findRewardSourceAggregate`, `isCanonicalRewardAggregate`, `validateRewardAggregateCollection`, `reconcileRewardEntitlements`, `rewardEntitlements[]`, `ui.rewardManager`, `ui.pendingContext.checkoutStep`.

- [ ] **Step 1: Viết failing tests cho default state, migration và hostile records**

```js
test('migrates schema v2 to v3 without changing legacy authority', () => {
  const { api } = testApi();
  const legacy = api.createDefaultState();
  legacy.schemaVersion = 2;
  const journey = customerJourneyFixture();
  legacy.guestCheckins = journey.guestCheckins;
  legacy.checkoutDrafts = journey.checkoutDrafts;
  legacy.paymentProofs = journey.paymentProofs;
  legacy.receipts = journey.receipts;
  legacy.guestRewardClaims = journey.guestRewardClaims;
  delete legacy.rewardEntitlements;
  delete legacy.ui.rewardManager;
  const before = JSON.stringify({
    balances: legacy.balances, ledger: legacy.ledger,
    redemptions: legacy.redemptions
  });
  const migrated = api.migrateState(legacy);
  assert.equal(migrated.schemaVersion, 3);
  assert.deepEqual(migrated.rewardEntitlements, []);
  assert.deepEqual(migrated.ui.rewardManager, {
    statusFilter: 'available', selectedEntitlementId: null, businessFilter: null
  });
  assert.equal(migrated.ui.pendingContext.checkoutStep, 'checkout');
  assert.deepEqual({
    tipBasisCents: migrated.checkoutDrafts[0].tipBasisCents,
    rewardEntitlementId: migrated.checkoutDrafts[0].rewardEntitlementId,
    rewardCreditCents: migrated.checkoutDrafts[0].rewardCreditCents,
    rewardAppliedAt: migrated.checkoutDrafts[0].rewardAppliedAt
  }, { tipBasisCents: 4950, rewardEntitlementId: null,
    rewardCreditCents: 0, rewardAppliedAt: null });
  assert.deepEqual({
    rewardEntitlementId: migrated.receipts[0].rewardEntitlementId,
    rewardCreditCents: migrated.receipts[0].rewardCreditCents
  }, { rewardEntitlementId: null, rewardCreditCents: 0 });
  assert.equal(JSON.stringify({ balances: migrated.balances, ledger: migrated.ledger,
    redemptions: migrated.redemptions }), before);
});

test('drops malformed and prototype-polluted reward entitlements', () => {
  const { api } = testApi();
  const raw = api.createDefaultState();
  raw.rewardEntitlements = [{ id: '__proto__', campaignId: 'review-credit-5' }];
  assert.deepEqual(api.migrateState(raw).rewardEntitlements, []);
});

test('chains only known legacy versions through schema v3 and reloads v3 strictly', () => {
  const { api } = testApi();
  for (const sourceVersion of [undefined, 1, 2]) {
    const raw = completeLegacyCustomerFixture(api);
    if (sourceVersion === undefined) delete raw.schemaVersion;
    else raw.schemaVersion = sourceVersion;
    const migrated = api.migrateState(raw);
    assert.equal(migrated.schemaVersion, 3, String(sourceVersion));
    assert.equal(migrated.checkoutDrafts.length, 1, String(sourceVersion));
    assert.equal(migrated.paymentProofs.length, 1, String(sourceVersion));
    assert.equal(migrated.receipts.length, 1, String(sourceVersion));
    const reloaded = api.migrateState(migrated);
    assert.equal(reloaded.schemaVersion, 3);
    assert.equal(reloaded.checkoutDrafts.length, 1);
    assert.equal(reloaded.rewardEntitlements.length, migrated.rewardEntitlements.length);
  }
  const future = api.migrateState({ schemaVersion: 99, balances: { forged: 999 } });
  assert.equal(future.schemaVersion, 3);
  assert.equal(Object.hasOwn(future.balances, 'forged'), false);
  assert.deepEqual(future.checkoutDrafts, []);
});
```

Thêm test-local `completeLegacyCustomerFixture(api)` bằng `createDefaultState()` cộng **toàn bộ** `guestCheckins`, `checkoutDrafts`, `paymentProofs`, `receipts` và `guestRewardClaims` từ `customerJourneyFixture`; fixture không được bỏ owner/claim của verified aggregate. Khi cập nhật suite, `customerJourneyFixture()` và mọi partial fixture đang mô tả state hiện đại phải khai `schemaVersion: 2`; chỉ những test migration legacy chủ ý mới bỏ version hoặc dùng `1`.

- [ ] **Step 2: Chạy RED**

Run:

```bash
node --test --test-name-pattern="schema v2 to v3|known legacy versions|prototype-polluted reward" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì schema vẫn là `2` và chưa có reward state.

- [ ] **Step 3: Thêm catalog, state shape và canonical normalizer**

Thay `SCHEMA_VERSION = 2` bằng `3`, thêm:

```js
const REWARD_CAMPAIGNS = Object.freeze({
  'review-credit-5': Object.freeze({
    id: 'review-credit-5', businessId: BUSINESS_ID, sourceType: 'feedback',
    benefitType: 'service_credit', valueCents: 500, points: 0,
    minimumPurchaseCents: 2500, eligibleServiceIds: Object.freeze(['*']),
    combinableWithRewards: false, durationDays: 30,
    title: Object.freeze({ vi: 'Thưởng đánh giá', en: 'Review Reward' }),
    description: Object.freeze({ vi: 'Dùng cho dịch vụ đủ điều kiện.', en: 'Use toward an eligible service.' })
  }),
  'tip-points-50': Object.freeze({
    id: 'tip-points-50', businessId: BUSINESS_ID, sourceType: 'tip',
    benefitType: 'points_bonus', valueCents: 0, points: 50,
    minimumPurchaseCents: 0, eligibleServiceIds: Object.freeze([]),
    combinableWithRewards: false, durationDays: 0,
    title: Object.freeze({ vi: 'Tip & Nhận điểm', en: 'Tip & Earn' }),
    description: Object.freeze({ vi: 'Nhận sau khi tip được xác nhận.', en: 'Earned after a confirmed technician tip.' })
  })
});
const REWARD_ENTITLEMENT_STATUSES = new Set(['available', 'reserved', 'applied', 'used', 'expired']);
const REWARD_ENTITLEMENT_ID_PATTERN = /^reward-entitlement-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function normalizeLocalizedCopy(value) {
  if (!hasExactOwnKeys(value, ['vi', 'en'])) return null;
  const vi = normalizedRequiredText(value.vi);
  const en = normalizedRequiredText(value.en);
  return vi && en ? { vi, en } : null;
}

function normalizeRewardEntitlement(appState, value) {
  const keys = ['id', 'campaignId', 'customerId', 'businessId', 'sourceType', 'sourceId',
    'benefitType', 'title', 'description', 'valueCents', 'points', 'minimumPurchaseCents',
    'eligibleServiceIds', 'combinableWithRewards', 'status', 'issuedAt', 'expiresAt',
    'reservedAt', 'reservedTicketId', 'appliedAt', 'appliedCheckoutId', 'usedAt', 'idempotencyKey'];
  if (!hasExactOwnKeys(value, keys)) return null;
  const campaign = Object.hasOwn(REWARD_CAMPAIGNS, value.campaignId)
    ? REWARD_CAMPAIGNS[value.campaignId] : null;
  const title = normalizeLocalizedCopy(value.title);
  const description = normalizeLocalizedCopy(value.description);
  const nullableTime = (input) => input === null || validStoredTimestamp(input);
  if (!campaign || !REWARD_ENTITLEMENT_ID_PATTERN.test(value.id)
    || value.id !== value.id.toLowerCase() || value.customerId !== appState.profile.id
    || !getValidBusiness(appState, value.businessId) || value.businessId !== campaign.businessId
    || value.sourceType !== campaign.sourceType || !normalizedRequiredText(value.sourceId)
    || normalizedRequiredText(value.sourceId) !== value.sourceId
    || value.benefitType !== campaign.benefitType || !title || !description
    || JSON.stringify(title) !== JSON.stringify(campaign.title)
    || JSON.stringify(description) !== JSON.stringify(campaign.description)
    || value.valueCents !== campaign.valueCents || value.points !== campaign.points
    || value.minimumPurchaseCents !== campaign.minimumPurchaseCents
    || JSON.stringify(value.eligibleServiceIds) !== JSON.stringify([...campaign.eligibleServiceIds])
    || value.combinableWithRewards !== false || !REWARD_ENTITLEMENT_STATUSES.has(value.status)
    || !validStoredTimestamp(value.issuedAt) || !validStoredTimestamp(value.expiresAt)
    || !nullableTime(value.reservedAt) || !nullableTime(value.appliedAt)
    || !nullableTime(value.usedAt)
    || value.idempotencyKey !== `${value.campaignId}:${value.sourceId}`
    || Date.parse(value.expiresAt) !== Date.parse(value.issuedAt)
      + campaign.durationDays * 86_400_000) return null;
  return structuredClone(value);
}
```

`createDefaultState()` thêm `rewardEntitlements: []`, `ui.rewardManager: { statusFilter: 'available', selectedEntitlementId: null, businessFilter: null }` và `ui.pendingContext.checkoutStep: 'checkout'`. Ở schema v3, `businessFilter` chỉ nhận `null` hoặc ID được `getValidBusiness` xác nhận; Explore Task 1 sẽ mở rộng validator bằng directory canonical khi nâng schema v4.

Tách migration thành chain có version gate rõ ràng: versionless/schema `1` đi qua `migrateCustomerLegacyToV2(raw)`, kết quả đó và source version `2` đi qua `migrateCustomerV2ToV3(raw)`, còn schema `3` chỉ strict-normalize. Adapter `2→3` chạy **trước** khi set `schemaVersion = 3` và add `tipBasisCents = subtotalCents - discountCents`, checkout reward defaults, receipt reward defaults, reward manager và checkout step. Unknown/future version fail closed về default và không được permissive merge. Đồng thời Task 1 cập nhật totals/create-checkout hiện tại, thêm `schemaVersion: 2` vào mọi fixture state hiện đại và sửa mọi exact expected fixture để checkout v3 mới luôn có `tipBasisCents` explicit, dù reward calculation chỉ được mở rộng ở Task 4. Sau adapter, mọi v3 normalizer yêu cầu explicit exact keys; record khai là v3 nhưng thiếu keys bị reject thay vì được backfill. `migrateState` sau đó normalize/dedupe entitlement theo cả `id` và `idempotencyKey`; export interfaces mới trong test API.

Toàn bộ normalizer nằm trong fail-closed `try/catch` để getter/proxy hostile trả `null`, không thoát exception. Sau generic field validation, normalizer phải kiểm shape theo status: `available` không có reserve/apply/use reference; `reserved` có `reservedAt` nhưng chưa có apply/use; `applied` có đúng `reservedTicketId`, `appliedAt`, `appliedCheckoutId`; service credit `used` có đủ các reference trước đó và `usedAt`; points bonus được issue thẳng `used` nên chỉ có `usedAt`; `expired` chỉ hợp lệ từ `available|reserved` và không được giữ apply reference. Ticket reference chỉ được syntax-check bằng Operations ID pattern vì ticket không thuộc Customer localStorage; applied checkout phải có đúng một active local owner, còn rejected checkout cũ chỉ là audit snapshot. Timestamp phải tăng theo `issuedAt ≤ reservedAt ≤ appliedAt ≤ usedAt` khi field tương ứng tồn tại.

Sau khi feedback/tips/ledger đã reconcile, `isCanonicalRewardAggregate` kết hợp structural normalizer với source authority. `findRewardSourceAggregate` trả thêm canonical `issuedAt`: review credit yêu cầu đúng một feedback source và đúng một `feedback +15` ledger pair cùng `businessId`, với `feedback.createdAt === ledger.createdAt === entitlement.issuedAt`; tip benefit yêu cầu đúng một confirmed tip source và đúng một `tip_bonus` ledger pair có points/business đúng snapshot, với `tip.confirmedAt === ledger.createdAt === entitlement.issuedAt`. Vì vậy entitlement mới không thể bám vào source lịch sử rồi tự chọn timestamp mới. `validateRewardAggregateCollection` kiểm **toàn collection** bằng các aggregate rules này, unique `id`/`idempotencyKey`, reserved-per-business và active-applied-owner invariants. Orphan, forged, cross-business hoặc duplicate aggregate bị loại atomic; ambiguous group bị loại toàn bộ, không tự chọn theo thứ tự. Migration không tự phát reward còn thiếu. Mọi expire/reserve/apply/remove/consume action chạy collection preflight trước và sau candidate mutation, không chỉ validate target record.

- [ ] **Step 4: Chạy GREEN và full regression**

```bash
node --test --test-name-pattern="schema v2 to v3|known legacy versions|prototype-polluted reward" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
```

Expected: focused PASS; full suite PASS với số test cũ + 2.

- [ ] **Step 5: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add reward entitlement schema"
```

### Task 2: Phát Review Reward và Tip & Earn idempotent

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:900-2200`
- Modify: `html/customer/cutomer-reward.html:4706-4825, 5148-5215`

**Interfaces:**
- Consumes: `REWARD_CAMPAIGNS`, `normalizeRewardEntitlement`, `findRewardSourceAggregate`, `submitFeedback`, `confirmTipRecord`, `createDomainId`, `domainTimestamp`.
- Produces: `issueRewardEntitlement(appState, campaignId, sourceId, status, now)` và atomic feedback/tip integration.

- [ ] **Step 1: Viết failing tests cho feedback và tip confirmation**

```js
test('feedback gives fifteen points plus one review credit for every rating', () => {
  const { api } = testApi();
  for (const stars of [1, 5]) {
    const app = api.createDefaultState();
    const result = api.submitFeedback(app, {
      visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars, text: 'Private feedback'
    }, 1_000);
    assert.equal(result.points, 15);
    assert.equal(app.rewardEntitlements.length, 1);
    assert.equal(app.rewardEntitlements[0].campaignId, 'review-credit-5');
    assert.equal(app.rewardEntitlements[0].status, 'available');
    assert.equal(api.submitFeedback(app, {
      visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars, text: 'Again'
    }, 2_000).code, 'already_submitted');
    assert.equal(app.rewardEntitlements.length, 1);
  }
});

test('tip points benefit exists only after confirmation', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const created = api.createTip(app, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 5,
    method: 'Zelle', note: ''
  }, 1_000);
  assert.equal(app.rewardEntitlements.length, 0);
  assert.equal(api.confirmTipRecord(app, created.tip.id, 2_000).ok, true);
  assert.equal(app.rewardEntitlements[0].campaignId, 'tip-points-50');
  assert.equal(app.rewardEntitlements[0].status, 'used');
  assert.equal(api.confirmTipRecord(app, created.tip.id, 3_000).idempotent, true);
  assert.equal(app.rewardEntitlements.length, 1);
});

test('cross-business feedback and tip keep points but cannot issue Bitcoin campaign benefits', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  app.visits.push({ id: 'visit-golden', businessId: 'golden-glow-spa' });
  app.staffProfiles['staff-golden'] = { id: 'staff-golden', name: 'Gia',
    businessId: 'golden-glow-spa', methods: ['Zelle'], followNotifyOptIn: false };
  assert.equal(api.submitFeedback(app, {
    visitId: 'visit-golden', businessId: 'golden-glow-spa', stars: 5, text: ''
  }, 1_000).points, 15);
  const tip = api.createTip(app, {
    businessId: 'golden-glow-spa', staffProfileId: 'staff-golden', amount: 10,
    method: 'Zelle', note: ''
  }, 2_000);
  assert.equal(api.confirmTipRecord(app, tip.tip.id, 3_000).points, 50);
  assert.deepEqual(app.rewardEntitlements, []);
});

test('migration drops an entitlement whose authoritative source aggregate is missing', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  api.submitFeedback(app, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: ''
  }, 1_000);
  app.ledger = app.ledger.filter((entry) => entry.refType !== 'feedback');
  assert.deepEqual(api.migrateState(app).rewardEntitlements, []);
});

test('issuer rejects prototype campaign keys and generated UUID collisions atomically', () => {
  const prototypeFixture = canonicalRewardSourceFixture({ campaignId: 'review-credit-5' });
  const prototypeBefore = JSON.stringify(prototypeFixture.app);
  assert.equal(prototypeFixture.api.issueRewardEntitlement(
    prototypeFixture.app, '__proto__', prototypeFixture.sourceId, 'available', 1_000
  ).code, 'invalid_reward_campaign');
  assert.equal(JSON.stringify(prototypeFixture.app), prototypeBefore);

  const collision = canonicalRewardSourceFixture({
    campaignId: 'review-credit-5', generatedIdAlreadyOwned: true
  });
  const collisionBefore = JSON.stringify(collision.app);
  assert.equal(collision.api.issueRewardEntitlement(
    collision.app, 'review-credit-5', collision.sourceId, 'available', collision.issuedAt
  ).code, 'id_generation_failed');
  assert.equal(JSON.stringify(collision.app), collisionBefore);
});

test('issuer rejects a structurally valid idempotent record detached from source time', () => {
  const fixture = canonicalRewardSourceFixture({ campaignId: 'review-credit-5' });
  const entitlement = fixture.app.rewardEntitlements[0];
  entitlement.issuedAt = new Date(Date.parse(entitlement.issuedAt) + 1_000).toISOString();
  entitlement.expiresAt = new Date(Date.parse(entitlement.expiresAt) + 1_000).toISOString();
  const before = JSON.stringify(fixture.app);
  assert.equal(fixture.api.issueRewardEntitlement(
    fixture.app, 'review-credit-5', fixture.sourceId, 'available', fixture.issuedAt
  ).code, 'invalid_reward_state');
  assert.equal(JSON.stringify(fixture.app), before);
});
```

`canonicalRewardSourceFixture` là test-local helper tạo feedback+ledger source canonical với timestamp trùng nhau và cho phép inject `randomUUID` trùng một entitlement ID đã sở hữu; không export helper qua production API.

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="review credit for every rating|tip points benefit|cross-business feedback|authoritative source aggregate|issuer rejects" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì feedback/tip chưa phát benefit.

- [ ] **Step 3: Thêm issuer canonical**

```js
function issueRewardEntitlement(appState, campaignId, sourceId, status, now = Date.now()) {
  const campaign = Object.hasOwn(REWARD_CAMPAIGNS, campaignId)
    ? REWARD_CAMPAIGNS[campaignId] : null;
  const canonicalSourceId = normalizedRequiredText(sourceId);
  const expectedStatus = campaign?.benefitType === 'service_credit' ? 'available' : 'used';
  if (!campaign || status !== expectedStatus
    || !canonicalSourceId || canonicalSourceId !== sourceId
    || !Array.isArray(appState?.rewardEntitlements)) return { ok: false, code: 'invalid_reward_campaign' };
  const preflight = validateRewardAggregateCollection(appState, appState.rewardEntitlements);
  if (!preflight.ok) return { ok: false, code: 'invalid_reward_state' };
  const source = findRewardSourceAggregate(appState, campaign, canonicalSourceId);
  if (!source.ok || source.businessId !== campaign.businessId) {
    return { ok: false, code: 'invalid_reward_source' };
  }
  const idempotencyKey = `${campaignId}:${canonicalSourceId}`;
  const existing = appState.rewardEntitlements.filter((item) => item.idempotencyKey === idempotencyKey);
  if (existing.length === 1 && isCanonicalRewardAggregate(appState, existing[0])
    && existing[0].issuedAt === source.issuedAt) {
    return { ok: true, entitlement: existing[0], idempotent: true };
  }
  if (existing.length) return { ok: false, code: 'invalid_reward_state' };
  const timestamp = domainTimestamp(now);
  const id = createDomainId('reward-entitlement');
  if (!timestamp.ok || timestamp.value !== source.issuedAt || !id.ok) {
    return !timestamp.ok ? timestamp
      : timestamp.value !== source.issuedAt ? { ok: false, code: 'invalid_reward_source' } : id;
  }
  if (appState.rewardEntitlements.some((item) => item.id === id.value)) {
    return { ok: false, code: 'id_generation_failed' };
  }
  const expiresAt = new Date(Date.parse(timestamp.value) + campaign.durationDays * 86_400_000).toISOString();
  const entitlement = {
    id: id.value, campaignId, customerId: appState.profile.id,
    businessId: campaign.businessId, sourceType: campaign.sourceType, sourceId: canonicalSourceId,
    benefitType: campaign.benefitType, title: structuredClone(campaign.title),
    description: structuredClone(campaign.description), valueCents: campaign.valueCents,
    points: campaign.points, minimumPurchaseCents: campaign.minimumPurchaseCents,
    eligibleServiceIds: [...campaign.eligibleServiceIds], combinableWithRewards: false,
    status, issuedAt: timestamp.value, expiresAt, reservedAt: null,
    reservedTicketId: null, appliedAt: null, appliedCheckoutId: null,
    usedAt: status === 'used' ? timestamp.value : null, idempotencyKey
  };
  const candidate = [...appState.rewardEntitlements, entitlement];
  const candidateState = { ...appState, rewardEntitlements: candidate };
  if (!validateRewardAggregateCollection(candidateState, candidate).ok) {
    return { ok: false, code: 'invalid_reward_state' };
  }
  appState.rewardEntitlements = candidate;
  return { ok: true, entitlement, idempotent: false };
}
```

`findRewardSourceAggregate` thực hiện đúng reconciliation rule của Task 1 và chỉ trả một canonical feedback+ledger hoặc confirmed tip+ledger aggregate cùng `issuedAt`. Ghép issuer vào candidate aggregate của `submitFeedback` và `confirmTipRecord`; source + ledger phải đã có trên candidate trước khi gọi issuer và timestamp action phải bằng canonical `issuedAt`, rồi chạy `validateRewardAggregateCollection` trước khi assign state thật. `confirmTipRecord` chỉ phát campaign `tip-points-50` khi authoritative tip calculation cho đúng `50` điểm; tip amount/business khác vẫn theo ledger hiện tại nhưng không tạo benefit card sai mệnh giá. Google Review action không gọi issuer.

- [ ] **Step 4: Chạy GREEN và atomicity regression**

```bash
node --test --test-name-pattern="feedback|tip points benefit|tip confirmation|atomic" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
```

Expected: focused và full suite PASS.

- [ ] **Step 5: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: issue review and tip rewards"
```

### Task 3: Reserve, eligibility và reward state machine

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:900-2400`
- Modify: `html/customer/cutomer-reward.html:760-1060, 1300-1715`

**Interfaces:**
- Consumes: canonical entitlement, guest check-in, checkout draft, `normalizeOperationsSnapshotForImport`, existing test helper `acceptedOperationsSnapshot`.
- Produces: `expireRewardEntitlements`, `reserveRewardEntitlement`, pure `evaluateRewardForCheckout`.

- [ ] **Step 1: Viết failing lifecycle tests**

```js
test('reserves one credit and evaluates only a completed matching ticket', () => {
  const { api } = testApi();
  const fixture = rewardCheckoutFixture(api, { ticketStatus: 'completed' });
  assert.equal(api.reserveRewardEntitlement(fixture.app, fixture.entitlement.id, 1_000).ok, true);
  const reservedSnapshot = JSON.stringify(fixture.app);
  assert.equal(api.reserveRewardEntitlement(
    fixture.app, fixture.entitlement.id, 1_500
  ).idempotent, true);
  assert.equal(JSON.stringify(fixture.app), reservedSnapshot);
  const eligible = api.evaluateRewardForCheckout(
    fixture.app, fixture.entitlement, fixture.checkout, fixture.operations, 2_000
  );
  assert.equal(eligible.ok, true);
  assert.equal(eligible.rewardCreditCents, 500);
  assert.equal(fixture.app.rewardEntitlements[0].status, 'reserved');
  assert.equal(fixture.checkout.rewardCreditCents, 0);
});

test('rejects wrong ticket customer state service expiry and minimum atomically', () => {
  const { api } = testApi();
  for (const variant of ['in_service', 'cross_business', 'wrong_customer', 'confirmed',
    'rejected', 'existing_proof', 'service_mismatch', 'expired', 'below_minimum']) {
    const fixture = rewardCheckoutFixture(api, { variant });
    api.reserveRewardEntitlement(fixture.app, fixture.entitlement.id, 1_000);
    const before = JSON.stringify(fixture.app);
    assert.equal(api.evaluateRewardForCheckout(
      fixture.app, fixture.entitlement, fixture.checkout, fixture.operations, 2_000
    ).ok, false, variant);
    assert.equal(JSON.stringify(fixture.app), before, variant);
  }
});

test('distinguishes corrupt authority from ordinary reward ineligibility', () => {
  const { api } = testApi();
  for (const [variant, code] of [
    ['session_phone_mismatch', 'reward_not_eligible'],
    ['duplicate_guest_owner', 'invalid_checkout_state'],
    ['noncanonical_checkout', 'invalid_checkout_state'],
    ['duplicate_ticket_owner', 'invalid_operations_snapshot'],
    ['orphan_reward_source', 'invalid_reward_state']
  ]) {
    const fixture = rewardCheckoutFixture(api, { variant });
    const before = JSON.stringify(fixture.app);
    assert.equal(api.evaluateRewardForCheckout(
      fixture.app, fixture.entitlement, fixture.checkout, fixture.operations, 2_000
    ).code, code, variant);
    assert.equal(JSON.stringify(fixture.app), before, variant);
  }
});

test('expires only due available or reserved credits and is idempotent', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const feedback = api.submitFeedback(app, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: ''
  }, 1_000);
  const issued = { entitlement: app.rewardEntitlements.find((item) =>
    item.sourceId === feedback.feedback.id) };
  const expiry = Date.parse(issued.entitlement.expiresAt);
  assert.equal(api.expireRewardEntitlements(app, expiry).changed, 1);
  assert.equal(app.rewardEntitlements[0].status, 'expired');
  assert.equal(api.expireRewardEntitlements(app, expiry + 1).changed, 0);
});
```

Ngay trước các test trên, thêm test-local helper `rewardCheckoutFixture(api, options)`. Helper phải dùng `submitFeedback` để tạo source aggregate + entitlement thật, rồi dùng `seedGuestCheckin`, `createCheckoutDraft` và `acceptedOperationsSnapshot`; happy path set authenticated profile/session phone bằng canonical guest phone, rồi chuyển ticket sang `completed` với `completedAt` canonical. Mỗi variant chỉ thay đúng một guard để lỗi không bị che bởi điều kiện khác. Không export fixture qua `NEXORA_TEST_API`.

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="reserves one credit|rejects wrong ticket|corrupt authority|expires only" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì state-machine functions và checkout reward fields chưa có.

- [ ] **Step 3: Thêm reserve và evaluator**

```js
function reserveRewardEntitlement(appState, entitlementId, now = Date.now()) {
  const timestamp = domainTimestamp(now);
  const preflight = validateRewardAggregateCollection(appState, appState?.rewardEntitlements);
  if (!preflight.ok) return { ok: false, code: 'invalid_reward_state' };
  const matches = Array.isArray(appState?.rewardEntitlements)
    ? appState.rewardEntitlements.filter((item) => item.id === entitlementId) : [];
  const target = matches.length === 1 ? matches[0] : null;
  if (!target || !isCanonicalRewardAggregate(appState, target) || !timestamp.ok
    || target.benefitType !== 'service_credit' || !['available', 'reserved'].includes(target.status)
    || Date.parse(target.expiresAt) <= Date.parse(timestamp.value)) {
    return { ok: false, code: 'reward_unavailable' };
  }
  const reservedForBusiness = appState.rewardEntitlements.filter((item) =>
    item.businessId === target.businessId && item.status === 'reserved');
  if (target.status === 'reserved') {
    return reservedForBusiness.length === 1
      ? { ok: true, entitlement: target, idempotent: true }
      : { ok: false, code: 'invalid_reward_state' };
  }
  const candidate = structuredClone(appState.rewardEntitlements);
  const candidateTarget = candidate.find((item) => item.id === target.id);
  candidate.filter((item) => item.id !== candidateTarget.id
    && item.businessId === candidateTarget.businessId && item.status === 'reserved')
    .forEach((item) => Object.assign(item, { status: 'available', reservedAt: null, reservedTicketId: null }));
  Object.assign(candidateTarget, { status: 'reserved', reservedAt: timestamp.value, reservedTicketId: null });
  const candidateState = { ...appState, rewardEntitlements: candidate };
  if (!validateRewardAggregateCollection(candidateState, candidate).ok) {
    return { ok: false, code: 'invalid_reward_state' };
  }
  appState.rewardEntitlements = candidate;
  return { ok: true, entitlement: candidateTarget };
}

function evaluateRewardForCheckout(appState, entitlement, checkout, operationsSnapshot, now = Date.now()) {
  const timestamp = domainTimestamp(now);
  const operations = normalizeOperationsSnapshotForImport(operationsSnapshot);
  const rewardPreflight = validateRewardAggregateCollection(appState, appState?.rewardEntitlements);
  if (!timestamp.ok) return { ok: false, code: 'invalid_reward_request' };
  if (!operations.ok) return { ok: false, code: 'invalid_operations_snapshot' };
  if (!rewardPreflight.ok || !isCanonicalRewardAggregate(appState, entitlement)) {
    return { ok: false, code: 'invalid_reward_state' };
  }
  const guestMatches = Array.isArray(appState?.guestCheckins)
    ? appState.guestCheckins.filter((row) => row.id === checkout?.guestCheckinId) : [];
  const guest = guestMatches.length === 1 ? guestMatches[0] : null;
  const activeCheckoutOwners = Array.isArray(appState?.checkoutDrafts)
    ? appState.checkoutDrafts.filter((row) => row.id === checkout?.id) : [];
  const storedCheckout = activeCheckoutOwners.length === 1 ? activeCheckoutOwners[0] : null;
  const ticketMatches = operations.serviceTickets.filter((row) => row.guestCheckinId === guest?.id);
  const ticket = ticketMatches.length === 1 ? ticketMatches[0] : null;
  const linkedProofs = Array.isArray(appState?.paymentProofs)
    ? appState.paymentProofs.filter((row) => row.checkoutDraftId === checkout?.id) : [];
  if (!guest || !normalizeGuestCheckin(appState, guest) || !storedCheckout
    || !isCanonicalCheckoutForGuest(appState, storedCheckout, guest)
    || JSON.stringify(storedCheckout) !== JSON.stringify(checkout)) {
    return { ok: false, code: 'invalid_checkout_state' };
  }
  if (!ticket) return { ok: false, code: 'invalid_operations_snapshot' };
  const profilePhone = normalizeUsPhone(appState?.profile?.phone);
  const sessionPhone = normalizeUsPhone(appState?.session?.phone);
  const guestPhone = normalizeUsPhone(guest.phone);
  const serviceEligible = entitlement.eligibleServiceIds.includes('*')
    || entitlement.eligibleServiceIds.includes(guest.serviceKey);
  const eligibleSubtotal = storedCheckout.lineItems
    .filter((item) => item.type === 'service' || item.type === 'addon')
    .reduce((sum, item) => sum + item.amountCents, 0);
  if (appState?.session?.authenticated !== true || !profilePhone || !sessionPhone || !guestPhone
    || profilePhone !== sessionPhone || sessionPhone !== guestPhone
    || ticket.status !== 'completed' || ticket.serviceKey !== guest.serviceKey
    || storedCheckout.status !== 'draft' || linkedProofs.length !== 0 || !serviceEligible
    || entitlement.status !== 'reserved' || entitlement.businessId !== checkout.businessId
    || ticket.businessId !== checkout.businessId
    || Date.parse(entitlement.expiresAt) <= Date.parse(timestamp.value)
    || !Number.isSafeInteger(eligibleSubtotal) || eligibleSubtotal < entitlement.minimumPurchaseCents
    || checkout.rewardEntitlementId !== null) return { ok: false, code: 'reward_not_eligible' };
  return { ok: true, ticket,
    rewardCreditCents: Math.min(entitlement.valueCents, storedCheckout.beforeTipCents) };
}
```

Toàn bộ evaluator nằm trong fail-closed `try/catch`; duplicate/non-canonical Customer owner trả `invalid_checkout_state`, malformed/duplicate Operations authority trả `invalid_operations_snapshot`, và corrupt/orphan/duplicate Reward authority trả `invalid_reward_state`. Chỉ customer/business/service/minimum/expiry/status không đủ điều kiện mới trả `reward_not_eligible`; các structural code phải abort handoff ở Task 4. `expireRewardEntitlements` cũng chạy aggregate preflight toàn collection, clone collection, chuyển duy nhất service credit `available|reserved` có `expiresAt <= now` sang `expired`, giữ lịch sử `reservedAt` nếu có, không đụng `applied|used`, rồi aggregate-validate candidate trước assign. Ba checkout reward fields đã được adapter Task 1 thêm cho v2 và là exact keys bắt buộc ở v3. Pure evaluator không mutate checkout, entitlement hoặc Operations snapshot. `reservedTicketId` chỉ được set khi Task 4 thực sự apply vào ticket completed.

- [ ] **Step 4: Chạy GREEN và full suite**

```bash
node --test --test-name-pattern="reward application|reward state|completed matching ticket|expires only" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
```

Expected: focused và full suite PASS.

- [ ] **Step 5: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: reserve and evaluate checkout rewards"
```

### Task 4: Checkout totals, proof và confirmed consumption

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:2200-2750, 6000-6900`
- Modify: `html/customer/cutomer-reward.html:630-700, 1060-1715, 1889-2415, 2525-2680`
- Modify: `html/customer/customer-salon-operations.test.mjs:900-1100, 1600-1850`
- Modify: `html/customer/customer-salon-operations.html:75-95, 500-525, 1000-1220, 1380-1460, 1810-1870`

**Interfaces:**
- Consumes: Task 3 state machine, `calculateCheckoutTotals`, `createCheckoutDraft`, `consumeGuestCheckoutHandoff`, `verifyPaymentProof`, `rejectPaymentProof`, `retryRejectedCheckout`, Operations ticket lifecycle.
- Produces: `completeServiceTicket`, Operations Pay gate, `applyReservedRewardToCheckout`, `removeCheckoutReward`, checkout/receipt reward snapshots, auto-apply trong completed-ticket handoff, atomic `applied → used`.

- [ ] **Step 1: Viết failing arithmetic và payment-authority tests**

```js
test('reward credit keeps promo and tip basis while preventing negative totals', () => {
  const { api } = testApi();
  const items = [
    { id: 'service-1', type: 'service', label: 'Deluxe Pedicure', amountCents: 5500, sourceAddOnId: null },
    { id: 'addon-1', type: 'addon', label: 'Gel Polish', amountCents: 1500,
      sourceAddOnId: 'addon-00000000-0000-4000-8000-000000000001' },
    { id: 'promo-1', type: 'discount', label: 'Promo NEW10', amountCents: -550, sourceAddOnId: null }
  ];
  assert.deepEqual(api.calculateCheckoutTotals(items, 1800, 500), {
    subtotalCents: 7000, discountCents: 550, rewardCreditCents: 500,
    tipBasisCents: 6450, beforeTipCents: 5950, tipCents: 1161, totalCents: 7111
  });
  assert.equal(api.calculateCheckoutTotals(items, 0, 7000).code, 'invalid_reward_credit');
});

test('applies and removes a reserved reward with one atomic checkout owner', () => {
  const { api } = testApi();
  const fixture = rewardCheckoutFixture(api, { ticketStatus: 'completed' });
  api.reserveRewardEntitlement(fixture.app, fixture.entitlement.id, 1_000);
  assert.equal(api.applyReservedRewardToCheckout(
    fixture.app, fixture.checkout.id, fixture.operations, 2_000
  ).ok, true);
  assert.equal(fixture.app.rewardEntitlements[0].status, 'applied');
  assert.equal(fixture.app.checkoutDrafts[0].rewardCreditCents, 500);
  const appliedSnapshot = JSON.stringify(fixture.app);
  assert.equal(api.applyReservedRewardToCheckout(
    fixture.app, fixture.checkout.id, fixture.operations, 2_500
  ).idempotent, true);
  assert.equal(JSON.stringify(fixture.app), appliedSnapshot);
  assert.equal(api.removeCheckoutReward(fixture.app, fixture.checkout.id, 3_000).ok, true);
  assert.equal(fixture.app.rewardEntitlements[0].status, 'reserved');
  assert.equal(fixture.app.checkoutDrafts[0].rewardCreditCents, 0);
  const removedSnapshot = JSON.stringify(fixture.app);
  assert.equal(api.removeCheckoutReward(
    fixture.app, fixture.checkout.id, 3_500
  ).idempotent, true);
  assert.equal(JSON.stringify(fixture.app), removedSnapshot);
});

test('cannot remove a reward after payment proof is pending', () => {
  const { api } = testApi();
  const fixture = rewardCheckoutFixture(api, { ticketStatus: 'completed' });
  api.reserveRewardEntitlement(fixture.app, fixture.entitlement.id, 1_000);
  api.applyReservedRewardToCheckout(fixture.app, fixture.checkout.id, fixture.operations, 2_000);
  api.setCheckoutMethod(fixture.app, fixture.checkout.id, 'Zelle');
  api.submitPaymentProof(fixture.app, {
    checkoutDraftId: fixture.checkout.id, note: '', imageDataUrl: ''
  }, 3_000);
  const before = JSON.stringify(fixture.app);
  assert.equal(api.removeCheckoutReward(fixture.app, fixture.checkout.id, 4_000).code,
    'reward_locked');
  assert.equal(JSON.stringify(fixture.app), before);
});

test('only verified proof consumes an applied entitlement once', () => {
  const { api } = testApi();
  const rejected = appliedRewardProofFixture(api);
  api.rejectPaymentProof(rejected.app, rejected.proof.id, 'Mismatch', 2_000);
  assert.equal(rejected.app.rewardEntitlements[0].status, 'applied');
  const verified = appliedRewardProofFixture(api);
  assert.equal(api.verifyPaymentProof(verified.app, verified.proof.id, 3_000).ok, true);
  assert.equal(verified.app.rewardEntitlements[0].status, 'used');
  assert.equal(api.verifyPaymentProof(verified.app, verified.proof.id, 4_000).idempotent, true);
  assert.equal(verified.app.rewardEntitlements.filter((item) => item.status === 'used').length, 1);
});

test('rejected proof keeps reward and retry transfers the active checkout owner', () => {
  const { api } = testApi();
  const fixture = appliedRewardProofFixture(api);
  assert.equal(api.rejectPaymentProof(fixture.app, fixture.proof.id, 'Mismatch', 2_000).ok, true);
  const retry = api.retryRejectedCheckout(fixture.app, fixture.proof.id, 'Zelle', 3_000);
  assert.equal(retry.ok, true);
  assert.equal(retry.checkoutDraft.rewardCreditCents, 500);
  assert.equal(fixture.app.rewardEntitlements[0].status, 'applied');
  assert.equal(fixture.app.rewardEntitlements[0].appliedCheckoutId, retry.checkoutDraft.id);
  assert.equal(fixture.app.checkoutDrafts.filter((row) =>
    row.status !== 'rejected' && row.rewardEntitlementId === fixture.app.rewardEntitlements[0].id
  ).length, 1);
});

test('Operations exposes Pay only after salon completes the exact ticket', () => {
  const fixture = operationsTicketFixture({ role: 'Front Desk', status: 'in_service' });
  assert.equal(fixture.api.canOpenTicketPayment(fixture.state, fixture.ticket.id).ok, false);
  assert.equal(fixture.api.completeServiceTicket(fixture.state, fixture.ticket.id, 2_000).ok, true);
  assert.equal(fixture.ticket.status, 'completed');
  assert.equal(fixture.api.canOpenTicketPayment(fixture.state, fixture.ticket.id).ok, true);
  assert.equal(fixture.api.completeServiceTicket(fixture.state, fixture.ticket.id, 3_000).idempotent, true);
});
```

Thêm test-local `appliedRewardProofFixture(api)` ngay trước test: tái sử dụng `rewardCheckoutFixture`, reserve + apply, set tip/method, rồi gọi `submitPaymentProof`; trả đúng `{ app, checkout, entitlement, proof }`. Helper không được export qua production API. Trong Operations test, thêm `operationsTicketFixture` test-local dựa trên fixture tạo ticket hiện có, không export production.

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="reward credit keeps promo|verified proof consumes|rejected proof keeps|cannot remove" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì totals chưa nhận reward credit và proof chưa consume entitlement.

- [ ] **Step 3: Mở rộng checkout/receipt schema và totals**

Thay totals function bằng:

```js
function calculateCheckoutTotals(lineItems, tipBasisPoints = 0, rewardCreditCents = 0) {
  if (!TIP_BASIS_POINTS.has(tipBasisPoints)) return { ok: false, code: 'invalid_checkout' };
  const canonical = normalizeLineItems(lineItems);
  if (!canonical) return { ok: false, code: 'invalid_line_item' };
  const subtotalCents = canonical.filter((item) => item.type !== 'discount')
    .reduce((sum, item) => sum + item.amountCents, 0);
  const discountCents = canonical.filter((item) => item.type === 'discount')
    .reduce((sum, item) => sum - item.amountCents, 0);
  const tipBasisCents = subtotalCents - discountCents;
  if (!Number.isSafeInteger(rewardCreditCents) || rewardCreditCents < 0
    || rewardCreditCents > tipBasisCents) return { ok: false, code: 'invalid_reward_credit' };
  const beforeTipCents = tipBasisCents - rewardCreditCents;
  const tipCents = Math.round(tipBasisCents * tipBasisPoints / 10000);
  const totalCents = beforeTipCents + tipCents;
  if (![subtotalCents, discountCents, tipBasisCents, beforeTipCents, tipCents, totalCents]
    .every(Number.isSafeInteger) || totalCents < 0) return { ok: false, code: 'invalid_total' };
  return { subtotalCents, discountCents, rewardCreditCents, tipBasisCents,
    beforeTipCents, tipCents, totalCents };
}
```

Mọi checkout v3 mới phải tạo explicit keys (adapter Task 1 chỉ xử lý record v2):

```js
rewardEntitlementId: null,
rewardCreditCents: 0,
rewardAppliedAt: null
```

Receipt snapshot thêm `rewardEntitlementId` và `rewardCreditCents`; adapter Task 1 đã thêm `null`/`0` cho receipt v2, còn mọi record v3 phải có explicit keys. Proof/receipt normalizer reject mọi mismatch với checkout. `verifyPaymentProof` chỉ commit receipt, claims, checkout, proof và entitlement used sau khi toàn bộ candidate objects canonical.

`applyReservedRewardToCheckout` phải clone candidate checkout + entitlement, gọi evaluator, tính totals bằng signature mới rồi commit cả hai; set `reservedTicketId`, `appliedAt`, `appliedCheckoutId` cùng thời điểm. Gọi lại cùng entitlement + checkout canonical trả `ok/idempotent` và không đổi timestamp. `removeCheckoutReward` chỉ nhận checkout `draft` chưa có proof, trả `applied → reserved`, clear `reservedTicketId`/apply reference ở entitlement, clear ba reward fields ở checkout và tính lại totals; gọi lại trên checkout đã clear trả `ok/idempotent` không mutation. Checkout `pending_verification|confirmed|rejected` trả `reward_locked` và không mutate proof/amount. Cả hai reject duplicate active checkout owner và duplicate entitlement owner trước mutation; focused tests gọi reserve/apply/remove hai lần và snapshot state lần hai.

Mở rộng `retrySnapshotMatches` với ba reward fields. `retryRejectedCheckout` copy reward snapshot sang checkout retry và atomically retarget `entitlement.appliedCheckoutId`; rejected checkout cũ giữ immutable reward snapshot phục vụ audit nhưng không tính là active owner. Idempotent retry phải trả đúng cùng checkout và không retarget lần hai. Rejected proof không consume; chỉ verified proof của active retry mới chuyển `used`.

- [ ] **Step 4: Auto-apply trong strict completed-ticket handoff**

Thêm `completeServiceTicket(state, ticketId, now)`: chỉ `Front Desk|Staff`, đúng một `in_service` ticket, không có add-on pending, timestamp sau mọi event; set `status='completed'` + `completedAt` atomic; gọi lại ticket completed canonical trả idempotent. `canOpenTicketPayment` chỉ true cho ticket completed. Live Ticket có control mô phỏng hoàn tất chỉ cho role salon; nút Pay của Customer disabled với lý do EN/VI cho tới completed, action handler cũng re-check domain thay vì tin DOM.

Ở Customer, trước `createCheckoutDraft`, normalize Operations snapshot và yêu cầu đúng một ticket của guest có `status === 'completed'`; missing/in-service/duplicate ticket trả `service_not_completed` atomic. Đây là payment gate chung, không phụ thuộc reward. Sau `createCheckoutDraft` + `importAcceptedAddOns`, gọi:

```js
const rewardResult = applyReservedRewardToCheckout(
  draft, created.checkoutDraft.id, operationsSnapshot, now
);
if (!rewardResult.ok
  && !['no_reserved_reward', 'reward_not_eligible'].includes(rewardResult.code)) {
  return rewardResult;
}
draft.ui.pendingContext.checkoutStep = rewardResult.ok ? 'reward' : 'checkout';
```

Không có hoặc chưa đủ điều kiện dùng reserved reward vẫn mở checkout bình thường và giữ reward `reserved` để khách chọn/giữ lại; chỉ corrupt/duplicate authority mới abort handoff. Test regression phải đổi các handoff fixtures hợp lệ sang completed và thêm hostile in-service handoff assert không tạo checkout.

Error taxonomy của handoff là closed set: chỉ `no_reserved_reward` và `reward_not_eligible` được soft-continue. `invalid_reward_state`, `invalid_checkout_state`, `invalid_operations_snapshot`, unknown code hoặc exception đều rollback candidate checkout/add-on/reward và không navigate. Không tái sử dụng `reward_not_eligible` cho structural/source/duplicate corruption.

- [ ] **Step 5: Chạy GREEN và downstream authority matrix**

```bash
node --test --test-name-pattern="checkout|proof|receipt|reward credit|verified proof|rejected proof keeps|cannot remove" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
node --test html/customer/customer-salon-operations.test.mjs
```

Expected: cả ba commands PASS; existing add-on/proof/receipt authority không regress.

- [ ] **Step 6: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git add html/customer/customer-salon-operations.html html/customer/customer-salon-operations.test.mjs
git commit -m "feat: consume rewards on confirmed checkout"
```

### Task 5: My Rewards, Reward Detail và Use Reward UI

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:2740-3400, 6900-end`
- Modify: `html/customer/cutomer-reward.html:175-190, 130-140, 5300-5400, 5960-6050, 7068-7125, 7690-7765`

**Interfaces:**
- Consumes: Task 1-4 domain interfaces.
- Produces: nested views `reward-entitlements-view`, `reward-detail-view`, `redeem-catalog-view`, `reward-application-view`; complete action registry và bilingual renderers.

- [ ] **Step 1: Viết failing static/action/a11y tests**

```js
test('adds reward nested views without increasing the 31-screen inventory', () => {
  const source = html();
  assert.equal(screenIds(source).length, 31);
  for (const id of ['reward-entitlements-view', 'reward-detail-view',
    'redeem-catalog-view', 'reward-application-view']) {
    assert.match(source, new RegExp(`id="${id}"`));
  }
  for (const action of ['set-reward-status-filter', 'view-reward-entitlement',
    'reserve-reward-entitlement', 'save-reward-for-later', 'open-redeem-catalog',
    'open-tip-campaign', 'remove-checkout-reward', 'continue-reward-checkout']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tab"[^>]*aria-selected="true"/);
  assert.match(source, /role="tab"[^>]*tabindex="0"/);
  assert.match(source, /id="reward-application-title"/);
  assert.match(source, /aria-live="polite"/);
});
```

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="reward nested views" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì nested views/actions chưa tồn tại.

- [ ] **Step 3: Thêm nested markup**

Trong screen `rewards`, thay reward list đơn lẻ bằng:

```html
<div class="flex items-center justify-between gap-3">
  <h1 id="rewards-title" class="text-2xl font-black" data-en="Rewards" data-vi="Phần thưởng">Phần thưởng</h1>
  <button type="button" class="app-button-secondary" data-action="open-redeem-catalog"
    data-en="Redeem points" data-vi="Đổi điểm">Đổi điểm</button>
</div>
<section id="reward-entitlements-view" data-rewards-view="entitlements">
  <div role="tablist" aria-label="Trạng thái phần thưởng" data-en-aria-label="Reward status" data-vi-aria-label="Trạng thái phần thưởng" class="mt-4 grid grid-cols-3 gap-2">
    <button role="tab" tabindex="0" aria-selected="true" data-action="set-reward-status-filter" data-status="available" data-en="Available" data-vi="Khả dụng">Khả dụng</button>
    <button role="tab" tabindex="-1" aria-selected="false" data-action="set-reward-status-filter" data-status="used" data-en="Used" data-vi="Đã dùng">Đã dùng</button>
    <button role="tab" tabindex="-1" aria-selected="false" data-action="set-reward-status-filter" data-status="expired" data-en="Expired" data-vi="Hết hạn">Hết hạn</button>
  </div>
  <p id="reward-result-status" class="sr-only" aria-live="polite"></p>
  <div id="reward-entitlement-list" class="mt-4 grid gap-4 md:grid-cols-2"></div>
</section>
<section id="reward-detail-view" class="hidden" data-rewards-view="detail" aria-hidden="true"></section>
<section id="redeem-catalog-view" class="hidden" data-rewards-view="catalog" aria-hidden="true">
  <div id="reward-list" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"></div>
</section>
```

Thêm `reward-application-view` với `data-pay-view="reward-application"`, heading focusable `reward-application-title`, ticket lines, promo, Reward Credit, saved amount, Remove Reward và Continue to Tip & Payment.

- [ ] **Step 4: Thêm safe renderers và actions**

Renderer dùng `document.createElement`, `textContent`, locale date formatter và `setDisabledReason`; không dùng `innerHTML` cho persisted data. Available bucket gồm `available|reserved|applied` với badge/action tương ứng; Used chỉ `used`; Expired chỉ `expired`. Ở Available, render campaign `tip-points-50` thành opportunity card “50 pts · Tip & Earn” từ catalog, không tạo entitlement trước confirmation; opportunity và entitlement đều phải qua `businessFilter`. Action `open-tip-campaign` đi tới Tip; sau confirmed tip, benefit record chỉ xuất hiện trong Used. Action reserve/remove gọi `commitState`; Continue chỉ persist `ui.pendingContext.checkoutStep = 'checkout'`, không mutation money. Copy registry phải có tab/detail/minimum/services/expiry/combinability/saved/unavailable/status keys ở cả EN/VI.

Mở rộng `showPayView` focus map với `reward-application`. Handoff set `checkoutStep = 'reward'` khi apply thành công; initialization/reload đọc step canonical để mở reward application trước Guest Checkout, còn không có applied reward luôn mở checkout. Tab key handler hỗ trợ ArrowLeft/ArrowRight/Home/End, roving `tabindex`, sync `aria-selected` và focus; static + behavioral tests kiểm cả VI/EN accessible names.

`renderRewardEntitlements` áp đồng thời `statusFilter` và `businessFilter`; filter business không có kết quả phải hiện empty state, không tự fallback sang business khác. Nút quay lại danh sách Explore/Rewards được phép clear `businessFilter`, nhưng reserve/apply luôn dùng `entitlement.businessId` canonical.

- [ ] **Step 5: Chạy GREEN, action scan và full suite**

```bash
node --test --test-name-pattern="reward manager|reward detail|reward application|accessibility|language" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
if rg -n "onclick=|javascript:" html/customer/cutomer-reward.html; then exit 1; fi
git diff --check -- html/customer
```

Expected: tests PASS; `rg` không có kết quả; diff check exit `0`.

- [ ] **Step 6: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add customer reward manager views"
```

### Task 6: Tài liệu, acceptance matrix và final verification

**Files:**
- Modify: `html/customer/customer-app-developer-spec.md:226-282, 360-370, 479-570, 640-end`
- Modify: `html/customer/customer-reward-localstorage-design.md:85-145, 190-220`
- Modify: `html/customer/customer-app-independent-guide.md:35-90, 150-210, 230-245`
- Modify: `html/customer/customer-reward-entitlements-design.md:1-8`
- Test: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: implemented schema/actions/UI from Tasks 1-5.
- Produces: developer/backend contract, QA acceptance mapping và final status.

- [ ] **Step 1: Viết failing documentation contract test**

```js
test('documents reward lifecycle and confirmed-payment authority', () => {
  const files = ['customer-app-developer-spec.md', 'customer-reward-localstorage-design.md',
    'customer-app-independent-guide.md', 'customer-reward-entitlements-design.md'];
  for (const file of files) {
    const source = readFileSync(join(here, file), 'utf8');
    assert.match(source, /available.*reserved.*applied.*used/s, file);
    assert.match(source, /payment confirmed|thanh toán.*xác nhận/i, file);
    assert.match(source, /một reward|one reward/i, file);
  }
});
```

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="documents reward lifecycle" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL ở tài liệu chưa có lifecycle mới.

- [ ] **Step 3: Cập nhật đúng bốn tài liệu**

Developer spec thêm Purpose/Entry/UI/Behavior/Backend/Edge cases/Acceptance. LocalStorage design ghi schema v3 và atomic transition. Independent guide ghi entry/action/dependency. Design chỉ ghi `Đã triển khai · chờ broad review`; chưa được ghi “review sạch” trong task này.

- [ ] **Step 4: Chạy verification đầy đủ**

```bash
node --test html/customer/cutomer-reward.test.mjs
node --test html/customer/customer-salon-operations.test.mjs
git diff --check -- html/customer
if rg -n "TODO|TBD|FIXME|onclick=|javascript:" html/customer/customer-reward-entitlements-design.md html/customer/customer-app-developer-spec.md html/customer/customer-reward-localstorage-design.md html/customer/customer-app-independent-guide.md html/customer/cutomer-reward.html; then exit 1; fi
```

Expected: hai suites PASS; diff check sạch; `rg` không có kết quả trong scope mới.

- [ ] **Step 5: Browser checklist nếu backend khả dụng**

Serve port `4173`, kiểm 360/390/768/1024/1440 px: tabs, detail, reserve, completed-ticket checkout, promo + reward, remove, pending/rejected và confirmed. Nếu browser backend không khả dụng, ghi rõ pending; không báo pass.

- [ ] **Step 6: Commit**

```bash
git add html/customer/customer-app-developer-spec.md html/customer/customer-reward-localstorage-design.md html/customer/customer-app-independent-guide.md html/customer/customer-reward-entitlements-design.md html/customer/cutomer-reward.test.mjs
git commit -m "docs: finalize customer reward entitlements"
```

## Completion gate

- Mỗi Task 1-6 có fresh implementer, task-scoped spec/code review và fix loop cho Critical/Important.
- Sau Task 6, chạy broad review cho toàn range từ commit trước Task 1 đến HEAD.
- Chỉ sau verdict Approved, đổi design status thành `Đã triển khai và review`, chạy lại hai suites + `git diff --check`, rồi commit riêng `docs: approve customer reward entitlements`.
- Không bắt đầu Explore Beauty nếu Rewards schema chưa ở v3 và review cuối chưa sạch.
