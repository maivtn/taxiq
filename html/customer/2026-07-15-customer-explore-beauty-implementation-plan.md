# Customer Explore Beauty Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển Explore Customer thành beauty-only directory data-driven, có search/category/distance/fallback, business profile và favorite persistence mà không lưu catalog hoặc tọa độ khách vào localStorage.

**Architecture:** `BEAUTY_DIRECTORY` là fixture công khai chỉ đọc, production thay bằng `GET /explore`. Pure selectors normalize/filter/rank dữ liệu; renderer tạo DOM an toàn; localStorage chỉ giữ `businessRelations`, UI filters và last-observed permission. Plan này chạy sau Reward Entitlements và nâng schema `3 → 4`.

**Tech Stack:** Single-file HTML, Tailwind CSS Browser CDN v4, Lucide Icons, vanilla JavaScript, Geolocation/Permissions adapter, versioned localStorage, Node `node:test` + `vm` harness.

## Global Constraints

- Chỉ sửa file dưới `html/customer`; không stage hoặc sửa file ngoài phạm vi.
- Rewards Task 1-6 phải review sạch và Customer schema phải là `3` trước khi bắt đầu plan này.
- Giữ storage key `nexora.customer.prototype.v1`; migration `3 → 4` giữ rewardEntitlements, balances, ledger, checkouts, proof và receipts.
- Giữ đúng 31 `.app-screen`; tiếp tục dùng `explore` và `business`.
- Customer Explore V1 chỉ có `nail`, `spa`, `hair`, `lashes-brows`, `barber`, `massage`.
- Không xóa Moon Coffee khỏi Wallet/Check-in/point redemption; chỉ loại khỏi Explore directory và Explore copy/filter.
- Public directory, image, rating, proof metrics và customer coordinates không được persist vào localStorage.
- `preferences.locationPermission` chỉ là last-observed UI state; mỗi session phải re-check browser authority.
- Location denied/unavailable không chặn Explore; fallback sort theo tên.
- Sponsored nằm trong slot riêng, luôn có label EN/VI và proof; không giả làm organic nearest.
- Proof metrics read-only, có period/computedAt; favorite/filter action không được mutate proof.
- Explore chỉ link Rewards bằng `businessId`; không reserve/apply reward.
- Không đưa Find Work, Hiring, anonymous tech profile hoặc owner data vào Customer App.
- Tiếng Việt mặc định; dynamic copy EN/VI; mobile bottom nav/desktop sidebar giữ nguyên.
- Renderer không interpolate persisted/API data bằng `innerHTML`.
- Không `@apply` custom `app-*`; không thêm framework thứ hai.

---

## File map

| File | Trách nhiệm |
|---|---|
| `html/customer/cutomer-reward.html` | Directory fixture, schema v4, selectors, location adapter, Explore/Profile renderer và actions |
| `html/customer/cutomer-reward.test.mjs` | Migration, category, ranking, privacy, UI/action/a11y contracts |
| `html/customer/customer-app-developer-spec.md` | Beauty-only override, backend contract, edge cases, acceptance |
| `html/customer/customer-reward-localstorage-design.md` | Schema v4 và precise-location non-persistence |
| `html/customer/customer-app-independent-guide.md` | Explore entry/actions/dependencies |
| `html/customer/customer-explore-beauty-design.md` | Design source, implementation status |

### Task 0: Preflight dependency gate

**Files:** Không sửa file.

**Interfaces:**
- Consumes: Reward Entitlements plan đã hoàn tất.
- Produces: evidence schema/interface sẵn sàng cho migration v4.

- [ ] **Step 1: Chạy preflight**

```bash
rg -n "const SCHEMA_VERSION = 3|rewardEntitlements|rewardManager|businessFilter" html/customer/cutomer-reward.html
node --test html/customer/cutomer-reward.test.mjs
git status --short
```

Expected: schema đúng `3`; bốn Reward interfaces có mặt; customer suite PASS. Nếu thiếu bất kỳ điều kiện nào, dừng Explore và quay lại completion gate của Reward plan. Không tiếp tục bằng cách tự tạo compatibility shim trong Explore.

### Task 1: Beauty directory và schema v4

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:1-900, 1200-2200`
- Modify: `html/customer/cutomer-reward.html:316-760, 2525-3630, 8040-8080`

**Interfaces:**
- Consumes: schema v3, `createDefaultState`, `migrateState`, `getValidBusiness`, `ui.rewardManager.businessFilter`.
- Produces: `BEAUTY_CATEGORIES`, `BEAUTY_SERVICE_CATALOG`, `BEAUTY_DIRECTORY`, `getDirectoryBusiness`, `normalizeBeautyService`, `normalizeBeautyDirectoryEntry`, `normalizeBusinessRelations`, `normalizeExploreUi`, `businessRelations`, `ui.explore`; mở rộng canonical validator của Rewards filter bằng directory IDs.

- [ ] **Step 1: Viết failing migration/catalog tests**

```js
test('migrates schema v3 favorites to v4 business relations without persisting directory data', () => {
  const { api } = testApi();
  const legacy = api.createDefaultState();
  api.submitFeedback(legacy, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: ''
  }, 1_000);
  seedVerifiedGuestReceipt(api, legacy, { phone: legacy.profile.phone, baseTime: 2_000 });
  legacy.schemaVersion = 3;
  legacy.businesses['bitcoin-nail-bar'].favorite = true;
  delete legacy.businessRelations;
  delete legacy.ui.explore;
  delete legacy.preferences.locationPermission;
  legacy.ui.rewardManager.businessFilter = 'luna-hair-studio';
  const authorityBefore = structuredClone({
    rewardEntitlements: legacy.rewardEntitlements, balances: legacy.balances,
    ledger: legacy.ledger, checkoutDrafts: legacy.checkoutDrafts,
    paymentProofs: legacy.paymentProofs, receipts: legacy.receipts
  });
  const migrated = api.migrateState(legacy);
  assert.equal(migrated.schemaVersion, 4);
  assert.deepEqual(migrated.businessRelations['bitcoin-nail-bar'], {
    favorite: true, lastViewedAt: null
  });
  assert.deepEqual(migrated.ui.explore, {
    query: '', category: 'all', selectedBusinessId: null
  });
  assert.equal(Object.hasOwn(migrated, 'beautyDirectory'), false);
  assert.equal(Object.hasOwn(migrated.preferences, 'customerCoordinates'), false);
  assert.equal(migrated.ui.rewardManager.businessFilter, 'luna-hair-studio');
  assert.deepEqual(structuredClone({
    rewardEntitlements: migrated.rewardEntitlements, balances: migrated.balances,
    ledger: migrated.ledger, checkoutDrafts: migrated.checkoutDrafts,
    paymentProofs: migrated.paymentProofs, receipts: migrated.receipts
  }), authorityBefore);
  migrated.businessRelations['bitcoin-nail-bar'].favorite = false;
  migrated.businesses['bitcoin-nail-bar'].favorite = true;
  const reloaded = api.migrateState(migrated);
  assert.equal(reloaded.businessRelations['bitcoin-nail-bar'].favorite, false);
  assert.equal(reloaded.ui.rewardManager.businessFilter, 'luna-hair-studio');
});

test('normalizes hostile v4 Explore state without overwriting valid relations', () => {
  const { api } = testApi();
  const raw = api.createDefaultState();
  raw.businessRelations = JSON.parse('{"bitcoin-nail-bar":{"favorite":false,"lastViewedAt":null},"__proto__":{"favorite":true,"lastViewedAt":null},"unknown-shop":{"favorite":"yes","lastViewedAt":"tomorrow"}}');
  raw.ui.explore = { query: 42, category: 'coffee', selectedBusinessId: '__proto__' };
  raw.preferences.locationPermission = 'always';
  const migrated = api.migrateState(raw);
  assert.deepEqual(migrated.businessRelations, {
    'bitcoin-nail-bar': { favorite: false, lastViewedAt: null }
  });
  assert.deepEqual(migrated.ui.explore, {
    query: '', category: 'all', selectedBusinessId: null
  });
  assert.equal(migrated.preferences.locationPermission, 'prompt');
});

test('beauty directory exposes only the approved six categories', () => {
  const { api } = testApi();
  assert.deepEqual([...api.BEAUTY_CATEGORIES], [
    'nail', 'spa', 'hair', 'lashes-brows', 'barber', 'massage'
  ]);
  assert.equal(api.BEAUTY_DIRECTORY.some((item) => item.category === 'coffee'), false);
  assert.equal(api.BEAUTY_DIRECTORY.every((item) => api.normalizeBeautyDirectoryEntry(item)), true);
  assert.equal(Object.entries(api.BEAUTY_SERVICE_CATALOG).every(([id, service]) =>
    id === service.id && api.normalizeBeautyService(service)), true);
});
```

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="schema v3 favorites|hostile v4 Explore|approved six categories" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì schema vẫn v3 và directory interfaces chưa tồn tại.

- [ ] **Step 3: Thêm category enum và sáu fixture entries**

```js
const BEAUTY_CATEGORIES = Object.freeze([
  'nail', 'spa', 'hair', 'lashes-brows', 'barber', 'massage'
]);
const BEAUTY_TIME_ZONE = 'America/Chicago';

const BEAUTY_SERVICE_CATALOG = Object.freeze({
  manicure: Object.freeze({ id: 'manicure', label: Object.freeze({ vi: 'Làm móng tay', en: 'Manicure' }), durationMinutes: 45, priceCents: 4500 }),
  pedicure: Object.freeze({ id: 'pedicure', label: Object.freeze({ vi: 'Chăm sóc móng chân', en: 'Pedicure' }), durationMinutes: 60, priceCents: 5500 }),
  gel: Object.freeze({ id: 'gel', label: Object.freeze({ vi: 'Sơn gel bổ sung', en: 'Gel add-on' }), durationMinutes: 20, priceCents: 1500 }),
  facial: Object.freeze({ id: 'facial', label: Object.freeze({ vi: 'Chăm sóc da mặt', en: 'Facial' }), durationMinutes: 60, priceCents: 7500 }),
  'skin-care': Object.freeze({ id: 'skin-care', label: Object.freeze({ vi: 'Liệu trình da', en: 'Skin treatment' }), durationMinutes: 75, priceCents: 9500 }),
  haircut: Object.freeze({ id: 'haircut', label: Object.freeze({ vi: 'Cắt tóc', en: 'Haircut' }), durationMinutes: 45, priceCents: 4500 }),
  color: Object.freeze({ id: 'color', label: Object.freeze({ vi: 'Nhuộm tóc', en: 'Hair color' }), durationMinutes: 120, priceCents: 12000 }),
  lashes: Object.freeze({ id: 'lashes', label: Object.freeze({ vi: 'Nối mi', en: 'Lash extensions' }), durationMinutes: 90, priceCents: 9000 }),
  brows: Object.freeze({ id: 'brows', label: Object.freeze({ vi: 'Tạo dáng chân mày', en: 'Brow shaping' }), durationMinutes: 30, priceCents: 3500 }),
  fade: Object.freeze({ id: 'fade', label: Object.freeze({ vi: 'Cắt fade', en: 'Fade haircut' }), durationMinutes: 40, priceCents: 3500 }),
  beard: Object.freeze({ id: 'beard', label: Object.freeze({ vi: 'Tỉa râu', en: 'Beard trim' }), durationMinutes: 20, priceCents: 2000 }),
  swedish: Object.freeze({ id: 'swedish', label: Object.freeze({ vi: 'Massage Thụy Điển', en: 'Swedish massage' }), durationMinutes: 60, priceCents: 8000 }),
  'deep-tissue': Object.freeze({ id: 'deep-tissue', label: Object.freeze({ vi: 'Massage mô sâu', en: 'Deep tissue massage' }), durationMinutes: 60, priceCents: 9500 })
});

function beautyEntry(id, name, category, searchTerms, services, lat, lng, rating, price, badges, sponsored) {
  return Object.freeze({
    id, name, category, serviceIds: Object.freeze(services),
    searchTerms: Object.freeze({
      vi: Object.freeze(searchTerms.vi), en: Object.freeze(searchTerms.en)
    }),
    location: Object.freeze({ lat, lng }), address: `${name}, Houston, TX`,
    hours: Object.freeze([Object.freeze({ day: 3, open: '09:30', close: '19:30' })]),
    rating, startingPriceCents: price,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371',
    badges: Object.freeze(badges), sponsored, openedAt: '2026-07-01T00:00:00.000Z',
    proof: Object.freeze({ periodDays: 30, checkinCount: 128,
      receiptPriceCents: price, looksCount: 24, computedAt: '2026-07-15T00:00:00.000Z' })
  });
}

const BEAUTY_DIRECTORY = Object.freeze([
  beautyEntry('bitcoin-nail-bar', 'Bitcoin Nail Bar', 'nail',
    { vi: ['làm móng', 'sơn gel', 'pedicure'], en: ['manicure', 'gel', 'pedicure'] },
    ['manicure', 'pedicure'], 29.7604, -95.3698, 4.9, 4500, ['verified'], false),
  beautyEntry('golden-glow-spa', 'Golden Glow Spa', 'spa',
    { vi: ['chăm sóc da', 'spa'], en: ['facial', 'skin care', 'spa'] },
    ['facial', 'skin-care'], 29.7499, -95.3584, 4.8, 7500, ['verified'], false),
  beautyEntry('luna-hair-studio', 'Luna Hair Studio', 'hair',
    { vi: ['cắt tóc', 'nhuộm tóc'], en: ['haircut', 'hair color'] },
    ['haircut', 'color'], 29.7420, -95.3780, 4.8, 4500, [], false),
  beautyEntry('blink-brow-lash', 'Blink Brow & Lash', 'lashes-brows',
    { vi: ['nối mi', 'chân mày'], en: ['lashes', 'brows'] },
    ['lashes', 'brows'], 29.7550, -95.3900, 4.7, 3500, ['verified'], true),
  beautyEntry('heights-barber-house', 'Heights Barber House', 'barber',
    { vi: ['cắt tóc nam', 'tỉa râu'], en: ['fade', 'beard trim'] },
    ['fade', 'beard'], 29.7985, -95.3980, 4.9, 2000, ['verified'], false),
  beautyEntry('serenity-massage', 'Serenity Massage', 'massage',
    { vi: ['massage thư giãn', 'massage sâu'], en: ['swedish', 'deep tissue'] },
    ['swedish', 'deep-tissue'], 29.7350, -95.4010, 4.8, 8000, ['verified'], false)
]);

function getDirectoryBusiness(businessId) {
  return typeof businessId === 'string' && businessId !== '__proto__'
    ? BEAUTY_DIRECTORY.find((entry) => entry.id === businessId) ?? null
    : null;
}
```

Hai normalizer chạy trong fail-closed `try/catch` để getter/proxy hostile trả `null`. `normalizeBeautyService` kiểm exact keys, ID/key alignment, localized label exact, duration safe integer dương và price cents không âm. `normalizeBeautyDirectoryEntry` phải kiểm exact own keys gồm `id/name/category/serviceIds/searchTerms/location/address/hours/rating/startingPriceCents/imageUrl/badges/sponsored/openedAt/proof`; normalized non-empty `name`/`address`; lowercase kebab ID không phải prototype key; category whitelist; unique service IDs đều tồn tại trong service catalog; `startingPriceCents` bằng minimum price của service IDs; localized search arrays không rỗng, unique và đã normalize; lat/lng lần lượt trong `[-90,90]`/`[-180,180]`; integer cents không âm; rating `0..5`; URL parse được với protocol `https:`; hours unique và sort theo `day`, có `day` integer `0..6`, giờ canonical `HH:mm` và `open < close`; badges unique chỉ nhận `verified`; `sponsored` là boolean exact; `openedAt` hợp lệ; proof có exact keys `periodDays/checkinCount/receiptPriceCents/looksCount/computedAt`, toàn bộ counts/cents là safe integer không âm và timestamp hợp lệ. `just-opened` phải derive từ `openedAt`, không lưu như badge. Hàm trả object clone canonical hoặc `null`, tuyệt đối không trả raw object/getter.

- [ ] **Step 4: Thêm schema v4 migration**

Thay `SCHEMA_VERSION = 3` bằng `4`. `createDefaultState` thêm:

```js
businessRelations: {
  'bitcoin-nail-bar': { favorite: true, lastViewedAt: null },
  'golden-glow-spa': { favorite: false, lastViewedAt: null }
}
```

Preferences thêm `locationPermission: 'prompt'`; `ui.explore` thêm `{ query: '', category: 'all', selectedBusinessId: null }`. Chỉ branch `raw.schemaVersion === 3` mới copy boolean favorite hợp lệ từ `businesses`; reload schema v4 giữ `businessRelations` đã lưu. Normalizer v4 dùng exact keys, directory ID whitelist, boolean exact, nullable valid timestamp, normalized query, category whitelist, permission enum và không copy directory/location.

Trong schema v4, `getDirectoryBusiness` đã được định nghĩa/export ngay trong Task 1, trước migration normalizer. Normalize `ui.rewardManager.businessFilter` bằng `getValidBusiness` **hoặc** helper này; stale/unknown/prototype ID reset `null`, còn directory-only ID như `luna-hair-studio` phải sống qua save/reload. Đây chỉ là display filter, không thay đổi transactional `ui.selectedBusinessId` và không cấp quyền reward cho business mới. `normalizeBusinessRelations` và `normalizeExploreUi` trả clone canonical hoặc `null` để các direct actions Task 4 có thể preflight toàn nested state.

- [ ] **Step 5: Chạy GREEN và full regression**

```bash
node --test --test-name-pattern="schema v3 favorites|hostile v4 Explore|approved six categories|beauty directory" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
```

Expected: focused và full suite PASS.

- [ ] **Step 6: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add beauty directory schema"
```

### Task 2: Pure search, distance và sponsored ranking

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:900-2400`
- Modify: `html/customer/cutomer-reward.html:760-1060, 6090-6120`

**Interfaces:**
- Consumes: Task 1 canonical directory.
- Produces: `normalizeExploreQuery`, `normalizeSessionLocation`, `haversineMiles`, `deriveBeautyPresentation`, `selectBeautyBusinesses`.

- [ ] **Step 1: Viết failing selector tests**

```js
test('selects beauty businesses by service without mutating the directory', () => {
  const { api } = testApi();
  const before = JSON.stringify(api.BEAUTY_DIRECTORY);
  const result = api.selectBeautyBusinesses(api.BEAUTY_DIRECTORY, {
    query: 'pedicure', category: 'nail'
  }, null, Date.parse('2026-07-15T12:00:00.000Z'));
  assert.deepEqual(result.organic.map((item) => item.id), ['bitcoin-nail-bar']);
  assert.equal(JSON.stringify(api.BEAUTY_DIRECTORY), before);
});

test('sorts organic by distance and keeps sponsored in a separate labeled slot', () => {
  const { api } = testApi();
  const result = api.selectBeautyBusinesses(api.BEAUTY_DIRECTORY, {
    query: '', category: 'all'
  }, { lat: 29.7604, lng: -95.3698 }, Date.parse('2026-07-15T12:00:00.000Z'));
  assert.equal(result.organic[0].id, 'bitcoin-nail-bar');
  assert.equal(result.organic.some((item) => item.sponsored), false);
  assert.deepEqual(result.sponsored.map((item) => item.id), ['blink-brow-lash']);
  assert.equal(result.sponsored.length, 1);
  assert.equal(result.sponsored[0].proof.periodDays, 30);
  assert.equal(result.organic.find((item) => item.id === 'luna-hair-studio').isJustOpened, true);
});

test('sorts organic alphabetically by locale when location is unavailable', () => {
  const { api } = testApi();
  const result = api.selectBeautyBusinesses(api.BEAUTY_DIRECTORY, {
    query: '', category: 'all', language: 'en'
  }, null, Date.parse('2026-07-15T12:00:00.000Z'));
  assert.deepEqual(result.organic.map((item) => item.name), [
    'Bitcoin Nail Bar', 'Golden Glow Spa', 'Heights Barber House',
    'Luna Hair Studio', 'Serenity Massage'
  ]);
  assert.equal(result.organic.every((item) => item.distanceMiles === null), true);
});
```

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="selects beauty businesses|sorts organic by distance|alphabetically by locale" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì selector interfaces chưa có.

- [ ] **Step 3: Thêm pure selectors**

```js
function normalizeExploreQuery(value) {
  return typeof value === 'string'
    ? value.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ')
    : '';
}

function normalizeSessionLocation(value) {
  return Number.isFinite(value?.lat) && Number.isFinite(value?.lng)
    && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180
    ? { lat: value.lat, lng: value.lng } : null;
}

function haversineMiles(origin, destination) {
  const values = [origin?.lat, origin?.lng, destination?.lat, destination?.lng];
  if (!values.every(Number.isFinite)
    || Math.abs(origin.lat) > 90 || Math.abs(destination.lat) > 90
    || Math.abs(origin.lng) > 180 || Math.abs(destination.lng) > 180) return null;
  const radians = (degree) => degree * Math.PI / 180;
  const dLat = radians(destination.lat - origin.lat);
  const dLng = radians(destination.lng - origin.lng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(origin.lat)) * Math.cos(radians(destination.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deriveBeautyPresentation(entry, now) {
  const openedAge = now - Date.parse(entry.openedAt);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: BEAUTY_TIME_ZONE, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(now)).filter((part) => part.type !== 'literal')
    .map((part) => [part.type, part.value]));
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const hours = entry.hours.find((row) => row.day === day) ?? null;
  const toMinutes = (value) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  return {
    isJustOpened: Number.isSafeInteger(now) && openedAge >= 0 && openedAge <= 30 * 86_400_000,
    openStatus: hours && minutes >= toMinutes(hours.open) && minutes < toMinutes(hours.close)
      ? { state: 'open', closesAt: hours.close } : { state: 'closed', closesAt: null },
    proofAsOf: entry.proof.computedAt,
    proofPeriodDays: entry.proof.periodDays
  };
}

function selectBeautyBusinesses(directory, filters, sessionLocation, now = Date.now()) {
  const query = normalizeExploreQuery(filters?.query);
  const locale = filters?.language === 'en' ? 'en' : 'vi';
  const category = filters?.category === 'all' || BEAUTY_CATEGORIES.includes(filters?.category)
    ? filters.category : null;
  if (category === null || !Array.isArray(directory) || !Number.isSafeInteger(now)) {
    return { ok: false, code: 'invalid_explore_filter' };
  }
  const location = normalizeSessionLocation(sessionLocation);
  const candidates = directory.map((entry) => normalizeBeautyDirectoryEntry(entry)).filter(Boolean)
    .filter((entry) => category === 'all' || entry.category === category)
    .filter((entry) => normalizeExploreQuery([
      entry.name, entry.category, ...entry.serviceIds,
      ...entry.searchTerms.vi, ...entry.searchTerms.en
    ].join(' ')).includes(query))
    .map((entry) => ({ ...entry, ...deriveBeautyPresentation(entry, now),
      distanceMiles: haversineMiles(location, entry.location) }));
  const alphabetical = (left, right) => left.name.localeCompare(right.name, locale);
  const distanceTieBreak = (left, right) => right.rating - left.rating || alphabetical(left, right);
  const sponsored = candidates.filter((entry) => entry.sponsored)
    .sort(distanceTieBreak).slice(0, 1);
  const organicCandidates = candidates.filter((entry) => !entry.sponsored);
  const organic = !location ? organicCandidates.sort(alphabetical) : organicCandidates.sort((left, right) => {
    if (left.distanceMiles !== null && right.distanceMiles !== null) {
      return left.distanceMiles - right.distanceMiles || distanceTieBreak(left, right);
    }
    if (left.distanceMiles !== null) return -1;
    if (right.distanceMiles !== null) return 1;
    return alphabetical(left, right);
  });
  return { ok: true, organic, sponsored,
    locationStatus: location ? 'granted' : 'unavailable', computedAt: now };
}
```

Migration/UI normalization reset category không hợp lệ về `all`; domain selector reject caller input không hợp lệ. Khi có session location, organic xếp distance tăng dần rồi rating giảm dần/tên locale; khi location denied/unavailable hoặc invalid, **toàn bộ organic xếp tên theo locale**, không dùng rating. Prototype hiển thị proof bằng copy “Dữ liệu {periodDays} ngày · tính đến {computedAt}”/“{periodDays}-day data · as of {computedAt}”, không gọi là realtime. Hours adapter dùng timezone fixture `America/Chicago`; production thay bằng timezone từ API canonical. Test thêm cases cho `__proto__`, invalid category, non-array directory, `NaN`/out-of-range coordinates, rating/name tie-break khi có location, exact alphabetical order khi không có location, boundary open/close và chứng minh input không bị mutate.

- [ ] **Step 4: Chạy GREEN, hostile input và no-mutation suite**

```bash
node --test --test-name-pattern="beauty businesses|distance|sponsored|location|query" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
```

Expected: focused và full suite PASS.

- [ ] **Step 5: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: rank nearby beauty businesses"
```

### Task 3: Data-driven Explore UI và location fallback

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:2740-3400, 6900-end`
- Modify: `html/customer/cutomer-reward.html:243-255, 5300-5400, 6090-6120, 6240-6280, 7180-7220`

**Interfaces:**
- Consumes: `selectBeautyBusinesses`, schema v4.
- Produces: `renderExploreDirectory`, `setExploreCategory`, `setExploreQuery`, `refreshExplorePermission`, `requestExploreLocation`, session-only `exploreLocation`.

- [ ] **Step 1: Viết failing UI contract tests**

```js
test('renders beauty-only Explore containers and accessible filters', () => {
  const source = html();
  assert.equal(screenIds(source).length, 31);
  assert.match(source, /id="explore-results"/);
  assert.match(source, /<h1[^>]*id="explore-title"/);
  assert.match(source, /id="explore"[^>]*aria-labelledby="explore-title"/);
  assert.match(source, /data-en="Explore near you"[^>]*data-vi="Khám phá gần bạn"/);
  assert.match(source, /id="explore-result-status"[^>]*aria-live="polite"/);
  assert.match(source, /id="explore-location-status"/);
  assert.match(source, /for="explore-search"[^>]*data-en="Search beauty businesses"/);
  assert.match(source, /data-en-aria-label="Beauty categories"[^>]*data-vi-aria-label="Danh mục làm đẹp"/);
  assert.match(source, /id="explore-sponsored-title"[^>]*data-en="Sponsored"[^>]*data-vi="Được tài trợ"/);
  for (const category of ['all', 'nail', 'spa', 'hair', 'lashes-brows', 'barber', 'massage']) {
    assert.match(source, new RegExp(`data-explore-category="${category}"`));
  }
  for (const action of ['set-explore-category', 'request-explore-location', 'retry-explore',
    'view-business', 'toggle-favorite', 'book-business', 'show-directions', 'view-business-rewards']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
  assert.doesNotMatch(source, /data-explore-category="coffee"/);
});

test('keeps precise Explore coordinates in memory for the current page session only', () => {
  const navigator = {
    geolocation: { getCurrentPosition(success) {
      success({ coords: { latitude: 29.7604, longitude: -95.3698 } });
    } }
  };
  const { api, context, storage } = testApi({}, {
    skipInit: false, document: createDocumentStub(), navigator
  });
  vm.runInContext('requestExploreLocation()', context);
  assert.equal(vm.runInContext('exploreLocation.lat', context), 29.7604);
  const raw = storage.getItem(api.STORAGE_KEY);
  assert.equal(raw.includes('29.7604'), false);
  assert.equal(raw.includes('-95.3698'), false);
  assert.equal(api.loadState(storage).preferences.locationPermission, 'granted');
  const reloaded = testApi({ [api.STORAGE_KEY]: raw }, { skipInit: false,
    document: createDocumentStub(), navigator: {} });
  assert.equal(vm.runInContext('exploreLocation', reloaded.context), null);
});

test('distinguishes denied permission from unavailable geolocation', () => {
  const denied = testApi({}, { skipInit: false, document: createDocumentStub(),
    navigator: { geolocation: { getCurrentPosition(success, error) { error({ code: 1 }); } } } });
  vm.runInContext('requestExploreLocation()', denied.context);
  assert.equal(denied.api.loadState(denied.storage).preferences.locationPermission, 'denied');
  const unavailable = testApi({}, { skipInit: false, document: createDocumentStub(), navigator: {} });
  vm.runInContext('requestExploreLocation()', unavailable.context);
  assert.equal(unavailable.api.loadState(unavailable.storage).preferences.locationPermission, 'prompt');
  assert.equal(vm.runInContext('exploreLocationStatus', unavailable.context), 'unavailable');
});

test('Explore filters normalize state and invalid category is atomic', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.setExploreCategory(app, 'nail').ok, true);
  assert.equal(api.setExploreQuery(app, '  Sơn   GEL ').ok, true);
  assert.equal(app.ui.explore.category, 'nail');
  assert.equal(app.ui.explore.query, 'sơn gel');
  const before = JSON.stringify(app);
  assert.equal(api.setExploreCategory(app, 'coffee').code, 'invalid_explore_filter');
  assert.equal(JSON.stringify(app), before);
});
```

Mở rộng `testApi` option để inject `navigator` vào VM; mặc định không có navigator nhằm giữ regression hiện tại.

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="beauty-only Explore containers|coordinates in memory|denied permission|Explore filters" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì markup vẫn là static Nails/Spa/Coffee cards.

- [ ] **Step 3: Thay static cards bằng containers**

```html
<h1 id="explore-title" class="text-2xl font-black" data-en="Explore near you" data-vi="Khám phá gần bạn">Khám phá gần bạn</h1>
<label class="sr-only" for="explore-search" data-en="Search beauty businesses" data-vi="Tìm tiệm làm đẹp">Tìm tiệm làm đẹp</label>
<input id="explore-search" class="app-input pl-11" type="search"
  data-en-ph="Search nail, spa, hair…" data-vi-ph="Tìm nail, spa, tóc…"
  placeholder="Tìm nail, spa, tóc…">
<div id="explore-category-list" class="mt-3 flex gap-2 overflow-x-auto" role="toolbar"
  aria-label="Danh mục làm đẹp" data-en-aria-label="Beauty categories" data-vi-aria-label="Danh mục làm đẹp">
  <button type="button" class="app-chip" aria-pressed="true" data-action="set-explore-category" data-explore-category="all" data-en="All" data-vi="Tất cả">Tất cả</button>
  <button type="button" class="app-chip" aria-pressed="false" data-action="set-explore-category" data-explore-category="nail" data-en="Nail" data-vi="Nail">Nail</button>
  <button type="button" class="app-chip" aria-pressed="false" data-action="set-explore-category" data-explore-category="spa" data-en="Spa" data-vi="Spa">Spa</button>
  <button type="button" class="app-chip" aria-pressed="false" data-action="set-explore-category" data-explore-category="hair" data-en="Hair" data-vi="Tóc">Tóc</button>
  <button type="button" class="app-chip" aria-pressed="false" data-action="set-explore-category" data-explore-category="lashes-brows" data-en="Lashes & brows" data-vi="Mi & chân mày">Mi & chân mày</button>
  <button type="button" class="app-chip" aria-pressed="false" data-action="set-explore-category" data-explore-category="barber" data-en="Barber" data-vi="Tóc nam">Tóc nam</button>
  <button type="button" class="app-chip" aria-pressed="false" data-action="set-explore-category" data-explore-category="massage" data-en="Massage" data-vi="Massage">Massage</button>
</div>
<div class="mt-3 flex items-center justify-between gap-3">
  <p id="explore-location-status" class="text-sm text-app-muted"></p>
  <button type="button" class="app-button-secondary" data-action="request-explore-location"
    data-en="Use my location" data-vi="Dùng vị trí của tôi">Dùng vị trí của tôi</button>
</div>
<p id="explore-result-status" class="sr-only" aria-live="polite" aria-atomic="true"></p>
<section id="explore-sponsored" class="mt-4 hidden" aria-labelledby="explore-sponsored-title">
  <h2 id="explore-sponsored-title" class="text-sm font-black" data-en="Sponsored" data-vi="Được tài trợ">Được tài trợ</h2>
  <div id="explore-sponsored-result" class="mt-2"></div>
</section>
<div id="explore-results" class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"></div>
<div id="explore-loading-state" class="app-card mt-4 hidden" data-state="loading" role="status"
  data-en="Loading beauty businesses" data-vi="Đang tải tiệm làm đẹp">Đang tải tiệm làm đẹp</div>
<div id="explore-empty-state" class="app-card mt-4 hidden" data-state="empty"
  data-en="No matching beauty businesses" data-vi="Không tìm thấy tiệm phù hợp">Không tìm thấy tiệm phù hợp</div>
<div id="explore-error-state" class="app-card mt-4 hidden" data-state="error">
  <p data-en="Explore could not load" data-vi="Không thể tải Khám phá">Không thể tải Khám phá</p>
  <button type="button" class="app-button-secondary mt-3" data-action="retry-explore"
    data-en="Try again" data-vi="Thử lại">Thử lại</button>
</div>
```

Đăng ký đủ actions `set-explore-category`, `request-explore-location`, `retry-explore`, `view-business`, `toggle-favorite`, `book-business`, `show-directions`, `view-business-rewards`. `setExploreCategory`/`setExploreQuery` validate exact `ui.explore` shape rồi mutate candidate state; input handler cancel timer cũ và commit query sau đúng 150 ms. Mở rộng test harness bằng injectable `setTimeout/clearTimeout` để assert gõ liên tiếp chỉ commit query cuối một lần. `renderExploreDirectory({ status: 'loading'|'ready'|'error', directory })` phải làm loading/error/empty/retry states reachable; malformed selector result đi `error`, zero result đi `empty`, không hiển thị stale cards.

- [ ] **Step 4: Thêm session location adapter và safe renderer**

```js
let exploreLocation = null;
let exploreLocationStatus = 'prompt';
let exploreSearchTimer = null;

async function refreshExplorePermission() {
  const permissions = globalThis.navigator?.permissions;
  if (!permissions?.query) {
    exploreLocationStatus = 'unavailable';
    return { ok: true, state: 'unavailable' };
  }
  try {
    const result = await permissions.query({ name: 'geolocation' });
    const state = ['granted', 'denied', 'prompt'].includes(result.state) ? result.state : 'prompt';
    exploreLocationStatus = state;
    commitState((draft) => { draft.preferences.locationPermission = state; });
    return { ok: true, state };
  } catch {
    exploreLocationStatus = 'unavailable';
    return { ok: true, state: 'unavailable' };
  }
}

function requestExploreLocation() {
  const geolocation = globalThis.navigator?.geolocation;
  if (!geolocation) {
    exploreLocation = null;
    exploreLocationStatus = 'unavailable';
    renderExploreDirectory();
    return;
  }
  geolocation.getCurrentPosition((position) => {
    exploreLocation = normalizeSessionLocation({
      lat: position.coords.latitude, lng: position.coords.longitude
    });
    if (!exploreLocation) {
      exploreLocationStatus = 'unavailable';
      renderExploreDirectory();
      return;
    }
    exploreLocationStatus = 'granted';
    commitState((draft) => { draft.preferences.locationPermission = 'granted'; });
    renderExploreDirectory();
  }, (error) => {
    exploreLocation = null;
    exploreLocationStatus = error?.code === 1 ? 'denied' : 'unavailable';
    if (error?.code === 1) {
      commitState((draft) => { draft.preferences.locationPermission = 'denied'; });
    }
    renderExploreDirectory();
  }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 });
}
```

Khi vào Explore lần đầu mỗi page session, gọi `refreshExplorePermission()` một lần để cập nhật hint; không tự gọi geolocation và không suy ra quyền hiện tại từ localStorage. `renderExploreDirectory` phải dùng `document.createElement`, `textContent`, `loading="lazy"`, separate sponsored/organic containers và result live region. Mỗi sponsored card có visible label cùng proof-as-of line; renderer chỉ nhận selector slot đã cap một record. Category buttons sync `aria-pressed`; dynamic image alt, location notice, retry labels và toolbar accessible name có EN/VI parity. Sau Back từ profile, focus trả về card đã mở; keyboard không phụ thuộc horizontal scroll. Search input debounce đúng 150 ms; `exploreLocation`/`exploreLocationStatus` không đi qua `commitState`. Test harness phải capture mọi `localStorage.setItem` và assert không payload nào chứa precise coordinates; privacy scan dùng `rg -ni "customerCoordinates|beautyDirectory|exploreLocation|latitude|longitude"` rồi review từng match, không coi tên in-memory interface là persisted field.

- [ ] **Step 5: Chạy GREEN, privacy scan và full suite**

```bash
node --test --test-name-pattern="Explore|location|directory|category|accessibility" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
rg -ni "customerCoordinates|beautyDirectory|exploreLocation|latitude|longitude" html/customer/cutomer-reward.html
```

Expected: tests PASS; `rg` chỉ được match tên interface trong test/constant, không match persisted state fields.

- [ ] **Step 6: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: render beauty-only Explore"
```

### Task 4: Business Profile, favorite, booking, directions và Rewards link

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:2400-3400, 6900-end`
- Modify: `html/customer/cutomer-reward.html:256-270, 6240-6300, 7180-7260`

**Interfaces:**
- Consumes: Task 1 `getDirectoryBusiness`, canonical directory, `normalizeBusinessRelations`, `normalizeExploreUi` and `businessRelations`.
- Produces: `hasCanonicalExploreActionState`, `markBeautyBusinessViewed`, `toggleFavoriteBusiness`, `buildBeautyDirectionsUrl`, `openBusinessRewards`, fail-closed `openBeautyBooking`, data-driven profile.

- [ ] **Step 1: Viết failing action/security tests**

```js
test('favorite and directions use canonical business ids without mutating proof', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const proofBefore = JSON.stringify(api.BEAUTY_DIRECTORY[0].proof);
  assert.equal(api.toggleFavoriteBusiness(app, 'bitcoin-nail-bar', 1_000).ok, true);
  assert.equal(app.businessRelations['bitcoin-nail-bar'].favorite, false);
  assert.equal(app.businessRelations['bitcoin-nail-bar'].lastViewedAt, null);
  assert.equal(api.markBeautyBusinessViewed(app, 'bitcoin-nail-bar', 1_500).ok, true);
  assert.equal(app.businessRelations['bitcoin-nail-bar'].lastViewedAt,
    new Date(1_500).toISOString());
  assert.equal(JSON.stringify(api.BEAUTY_DIRECTORY[0].proof), proofBefore);
  assert.match(api.buildBeautyDirectionsUrl('bitcoin-nail-bar').href,
    /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
  assert.equal(api.toggleFavoriteBusiness(app, '__proto__', 2_000).code, 'unknown_business');
});

test('Explore reward link selects business without reserving a reward', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify({ rewardEntitlements: app.rewardEntitlements,
    balances: app.balances, ledger: app.ledger, redemptions: app.redemptions,
    checkoutDrafts: app.checkoutDrafts });
  const result = api.openBusinessRewards(app, 'bitcoin-nail-bar');
  assert.equal(result.ok, true);
  assert.equal(app.ui.rewardManager.businessFilter, 'bitcoin-nail-bar');
  assert.equal(app.ui.explore.selectedBusinessId, 'bitcoin-nail-bar');
  assert.equal(JSON.stringify({ rewardEntitlements: app.rewardEntitlements,
    balances: app.balances, ledger: app.ledger, redemptions: app.redemptions,
    checkoutDrafts: app.checkoutDrafts }), before);
  assert.equal(api.openBusinessRewards(app, '__proto__').code, 'unknown_business');
});

test('booking stays disabled until each directory business has canonical service and staff authority', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app);
  for (const businessId of ['bitcoin-nail-bar', 'golden-glow-spa', 'luna-hair-studio']) {
    assert.equal(api.openBeautyBooking(app, businessId).code, 'booking_unavailable');
    assert.equal(JSON.stringify(app), before, businessId);
  }
});

test('profile actions reject malformed nested UI state without throwing or partial mutation', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  app.ui.explore = { selectedBusinessId: null };
  const before = JSON.stringify(app);
  assert.doesNotThrow(() => api.markBeautyBusinessViewed(app, 'bitcoin-nail-bar', 1_000));
  assert.equal(api.markBeautyBusinessViewed(app, 'bitcoin-nail-bar', 1_000).code,
    'invalid_customer_state');
  assert.equal(api.openBusinessRewards(app, 'bitcoin-nail-bar').code, 'invalid_customer_state');
  assert.equal(JSON.stringify(app), before);
});
```

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="favorite and directions|reward link selects|booking stays disabled|malformed nested UI" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL vì canonical profile/action interfaces chưa có.

- [ ] **Step 3: Thêm strict domain helpers**

```js
function hasCanonicalExploreActionState(appState) {
  const relations = normalizeBusinessRelations(appState?.businessRelations);
  const explore = normalizeExploreUi(appState?.ui?.explore);
  return Boolean(relations && explore);
}

function toggleFavoriteBusiness(appState, businessId, now = Date.now()) {
  const business = getDirectoryBusiness(businessId);
  if (!business) return { ok: false, code: 'unknown_business' };
  if (!hasCanonicalExploreActionState(appState)) {
    return { ok: false, code: 'invalid_customer_state' };
  }
  const relation = appState.businessRelations[businessId] ?? { favorite: false, lastViewedAt: null };
  appState.businessRelations = { ...appState.businessRelations,
    [businessId]: { favorite: !relation.favorite, lastViewedAt: relation.lastViewedAt } };
  return { ok: true, favorite: !relation.favorite };
}

function markBeautyBusinessViewed(appState, businessId, now = Date.now()) {
  if (!getDirectoryBusiness(businessId)) return { ok: false, code: 'unknown_business' };
  if (!hasCanonicalExploreActionState(appState)) {
    return { ok: false, code: 'invalid_customer_state' };
  }
  const timestamp = domainTimestamp(now);
  if (!timestamp.ok) return timestamp;
  const relation = appState.businessRelations[businessId] ?? { favorite: false, lastViewedAt: null };
  appState.businessRelations = { ...appState.businessRelations,
    [businessId]: { favorite: relation.favorite, lastViewedAt: timestamp.value } };
  appState.ui.explore.selectedBusinessId = businessId;
  return { ok: true, businessId };
}

function buildBeautyDirectionsUrl(businessId) {
  const business = getDirectoryBusiness(businessId);
  if (!business) return { ok: false, code: 'unknown_business' };
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', business.address);
  return { ok: true, href: url.href };
}

function openBusinessRewards(appState, businessId) {
  if (!getDirectoryBusiness(businessId)) return { ok: false, code: 'unknown_business' };
  const rewards = appState?.ui?.rewardManager;
  const filter = rewards?.businessFilter;
  if (!hasCanonicalExploreActionState(appState)
    || !hasExactOwnKeys(rewards, ['statusFilter', 'selectedEntitlementId', 'businessFilter'])
    || !['available', 'used', 'expired'].includes(rewards.statusFilter)
    || (rewards.selectedEntitlementId !== null
      && typeof rewards.selectedEntitlementId !== 'string')
    || (filter !== null && !getValidBusiness(appState, filter) && !getDirectoryBusiness(filter))) {
    return { ok: false, code: 'invalid_customer_state' };
  }
  appState.ui.explore.selectedBusinessId = businessId;
  appState.ui.rewardManager.statusFilter = 'available';
  appState.ui.rewardManager.businessFilter = businessId;
  return { ok: true, target: 'rewards' };
}

function openBeautyBooking(appState, businessId) {
  if (!getDirectoryBusiness(businessId)) return { ok: false, code: 'unknown_business' };
  return { ok: false, code: 'booking_unavailable' };
}
```

- [ ] **Step 4: Render profile và wire actions**

Profile render service/price/proof/badges từ directory + `BEAUTY_SERVICE_CATALOG` bằng `textContent`; `view-business` gọi `markBeautyBusinessViewed`, còn favorite không được giả làm view event. Directions mở URL từ helper; Rewards action navigate sau successful `commitState`. Trong V1, directory chưa có canonical business-specific booking service IDs, staff roster và availability tương thích với booking screen hiện tại, nên **mọi** Book control render disabled với reason `Chưa hỗ trợ đặt lịch/Booking not available`; `openBeautyBooking` luôn fail closed và không đụng `ui.bookingDraft`. Chỉ mở Book trong plan sau khi cả service/staff/availability authority được bổ sung theo từng business; tuyệt đối không ghép service directory hoặc nhân viên Bitcoin vào tiệm khác. `ui.explore.selectedBusinessId` chỉ là profile context. Mọi profile action preflight full nested UI/relations trước mutation, direct malformed call không throw và không mutate một phần. Thay notification handler cũ để validate bằng directory; invalid notification/business ID phải error, không fallback sang Bitcoin Nail Bar. UI action Rewards có test storage `setItem` throw: `commitState` rollback cả two UI fields, không navigate; success save/reload giữ directory `businessFilter` nhưng không đổi transactional collections.

- [ ] **Step 5: Chạy GREEN và full suite**

```bash
node --test --test-name-pattern="favorite|directions|business profile|reward link|booking" html/customer/cutomer-reward.test.mjs
node --test html/customer/cutomer-reward.test.mjs
```

Expected: focused và full suite PASS.

- [ ] **Step 6: Commit**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: connect beauty business profiles"
```

### Task 5: Tài liệu, responsive/a11y contracts và final verification

**Files:**
- Modify: `html/customer/customer-app-developer-spec.md:396-432, 479-570, 640-end`
- Modify: `html/customer/customer-reward-localstorage-design.md:85-145, 160-220`
- Modify: `html/customer/customer-app-independent-guide.md:35-90, 150-210, 230-245`
- Modify: `html/customer/customer-explore-beauty-design.md:1-8`
- Test: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: beauty-only source-of-truth docs, complete static contracts, implementation status.

- [ ] **Step 1: Viết failing documentation/static contract test**

```js
test('documents beauty-only Explore and location privacy across customer docs', () => {
  const files = ['customer-app-developer-spec.md', 'customer-reward-localstorage-design.md',
    'customer-app-independent-guide.md', 'customer-explore-beauty-design.md'];
  for (const file of files) {
    const source = readFileSync(join(here, file), 'utf8');
    assert.match(source, /Nail.*Spa.*Hair.*Lashes.*Barber.*Massage/is, file);
    assert.match(source, /không lưu.*tọa độ|does not persist.*coordinates/i, file);
  }
});
```

- [ ] **Step 2: Chạy RED**

```bash
node --test --test-name-pattern="documents beauty-only Explore" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL ở developer/localStorage/independent docs chưa cập nhật.

- [ ] **Step 3: Cập nhật đúng bốn tài liệu**

Developer spec J1 thay category list Customer Explore bằng sáu beauty categories và ghi rõ other industries ngoài scope. LocalStorage design ghi schema v4, session-only coordinates. Independent guide ghi actions/dependencies. Design chỉ ghi `Đã triển khai · chờ broad review`; chưa được ghi “review sạch” trong task này.

- [ ] **Step 4: Chạy verification đầy đủ**

```bash
node --test html/customer/cutomer-reward.test.mjs
node --test html/customer/customer-salon-operations.test.mjs
git diff --check -- html/customer
if rg -n "data-explore-category=\"coffee\"|onclick=|javascript:|TODO|TBD|FIXME" html/customer/cutomer-reward.html html/customer/customer-app-developer-spec.md html/customer/customer-reward-localstorage-design.md html/customer/customer-app-independent-guide.md html/customer/customer-explore-beauty-design.md; then exit 1; fi
```

Expected: suites PASS; diff check sạch; `rg` không có kết quả trong Explore scope.

- [ ] **Step 5: Browser checklist nếu backend khả dụng**

Serve port `4173`, kiểm 360/390/768/1024/1440 px: six filters, horizontal chip scroll, no overflow, search debounce, location grant/deny, sponsored label, empty/error, profile/favorite/book/directions/reward link. Nếu browser backend không khả dụng, ghi rõ pending.

- [ ] **Step 6: Commit**

```bash
git add html/customer/customer-app-developer-spec.md html/customer/customer-reward-localstorage-design.md html/customer/customer-app-independent-guide.md html/customer/customer-explore-beauty-design.md html/customer/cutomer-reward.test.mjs
git commit -m "docs: finalize customer beauty Explore"
```

## Completion gate

- Mỗi Task 1-5 có fresh implementer, task-scoped spec/code review và fix loop cho Critical/Important.
- Sau Task 5, broad reviewer kiểm toàn range của Explore, bao gồm privacy, proof immutability và Rewards boundary.
- Chỉ sau verdict Approved, đổi design status thành `Đã triển khai và review`, chạy lại hai suites + `git diff --check`, rồi commit riêng `docs: approve customer beauty Explore`.
- Final evidence phải nêu rõ browser smoke pass hoặc pending; không suy diễn từ static tests.
