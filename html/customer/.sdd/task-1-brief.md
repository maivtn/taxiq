### Task 1: Versioned Demo Database và Test Harness

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs:1-126`
- Modify: `html/customer/cutomer-reward.html:243-269`

**Interfaces:**
- Produces: `createDefaultState(): AppState`
- Produces: `migrateState(value: unknown): AppState`
- Produces: `loadState(storage: Storage, now?: () => number): AppState`
- Produces: `saveState(appState: AppState, storage: Storage): void`
- Produces: `commitState(mutator: (draft: AppState) => unknown): unknown`
- Produces: `window.NEXORA_TEST_API` containing pure functions used by later tests.

- [ ] **Step 1: Add the runtime extraction and storage tests**

Add these imports and helpers after the existing imports in `cutomer-reward.test.mjs`:

```js
import vm from 'node:vm';

function createMemoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); },
    key(index) { return [...values.keys()][index] ?? null; },
    get length() { return values.size; },
    dump() { return Object.fromEntries(values); }
  };
}

function testApi(seed = {}) {
  const source = html();
  const script = source.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
  assert.ok(script, 'inline application script must exist');
  const storage = createMemoryStorage(seed);
  const window = {
    localStorage: storage,
    NEXORA_SKIP_INIT: true,
    setTimeout() { return 1; },
    clearTimeout() {},
    lucide: null
  };
  const context = vm.createContext({
    window,
    localStorage: storage,
    structuredClone,
    Intl,
    Date,
    Math,
    JSON,
    URL,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' },
    console
  });
  vm.runInContext(script, context);
  return { api: window.NEXORA_TEST_API, storage };
}

test('creates versioned Vietnamese demo state with per-business balances', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.profile.language, 'vi');
  assert.equal(state.balances['bitcoin-nail-bar'].points, 2450);
  assert.equal(state.balances['golden-glow-spa'].points, 600);
  assert.equal(state.balances['moon-coffee'].points, 120);
  assert.equal('pointBalance' in state, false);
});

test('persists state and recovers corrupt JSON into a timestamped backup', () => {
  const { api, storage } = testApi();
  const state = api.createDefaultState();
  state.profile.name = 'Lan Nguyen';
  api.saveState(state, storage);
  assert.equal(api.loadState(storage).profile.name, 'Lan Nguyen');

  storage.setItem(api.STORAGE_KEY, '{broken');
  const recovered = api.loadState(storage, () => 1720936800000);
  assert.equal(recovered.profile.language, 'vi');
  assert.equal(storage.getItem(`${api.STORAGE_KEY}.corrupt.1720936800000`), '{broken');
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="versioned|persists state" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because `window.NEXORA_TEST_API` and storage functions are not defined.

- [ ] **Step 3: Replace the current flat state with the versioned database**

Replace the current `const state = { ... };` block with this complete foundation. Keep `SCREEN_MODULE`, `ROOT_SCREENS`, `NAV_ITEMS` and reward constants immediately after it.

```js
const STORAGE_KEY = 'nexora.customer.prototype.v1';
const SCHEMA_VERSION = 1;
const BUSINESS_ID = 'bitcoin-nail-bar';

function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    session: {
      authenticated: true,
      phone: '8325550148',
      otpCode: '246810',
      otpRequestedAt: 0,
      otpAttempts: 0,
      lockedUntil: 0
    },
    profile: {
      id: 'cust-jessica',
      name: 'Jessica Nguyen',
      phone: '8325550148',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      language: 'vi',
      referralCode: 'JESSICA50',
      paymentMethods: ['Zelle', 'Venmo']
    },
    businesses: {
      'bitcoin-nail-bar': {
        id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar', allianceId: 'houston-beauty',
        tipMultiplier: 10, directPayBonusPct: 20, bookingBonus: 25, checkinPoints: 120,
        methods: ['Zelle', 'Venmo', 'Cash App'], favorite: true
      },
      'golden-glow-spa': {
        id: 'golden-glow-spa', name: 'Golden Glow Spa', allianceId: 'houston-beauty',
        tipMultiplier: 5, directPayBonusPct: 10, bookingBonus: 20, checkinPoints: 80,
        methods: ['Zelle', 'Venmo'], favorite: false
      },
      'moon-coffee': {
        id: 'moon-coffee', name: 'Moon Coffee', allianceId: 'houston-beauty',
        tipMultiplier: 2, directPayBonusPct: 5, bookingBonus: 0, checkinPoints: 10,
        methods: ['Cash App'], favorite: false
      }
    },
    staffProfiles: {
      'staff-anna': { id: 'staff-anna', name: 'Anna', businessId: BUSINESS_ID, methods: ['Venmo', 'Zelle'], followNotifyOptIn: false },
      'staff-maria': { id: 'staff-maria', name: 'Maria', businessId: BUSINESS_ID, methods: ['Zelle', 'Cash App'], followNotifyOptIn: true }
    },
    balances: {
      'bitcoin-nail-bar': { points: 2450, credits: 0, expiringPoints: null },
      'golden-glow-spa': { points: 600, credits: 0, expiringPoints: null },
      'moon-coffee': { points: 120, credits: 0, expiringPoints: { amount: 80, date: '2026-08-30' } }
    },
    ledger: [
      { id: 'led-visit-1', businessId: BUSINESS_ID, type: 'visit', pointsDelta: 120, refType: 'visit', refId: 'visit-1001', createdAt: '2026-07-14T10:42:00.000Z' },
      { id: 'led-redeem-1', businessId: BUSINESS_ID, type: 'redeem', pointsDelta: -800, refType: 'redemption', refId: 'red-demo', createdAt: '2026-07-11T15:00:00.000Z' },
      { id: 'led-welcome-1', businessId: BUSINESS_ID, type: 'welcome', pointsDelta: 25, refType: 'onboarding', refId: 'welcome-demo', createdAt: '2026-06-01T12:00:00.000Z' }
    ],
    consents: [],
    welcomeClaims: [],
    preferences: {
      businessMarketing: { [BUSINESS_ID]: false },
      networkOffers: false,
      bookingReminders: true,
      nearbyDeals: true,
      aiSuggestions: true,
      pushPermission: 'prompt'
    },
    visits: [
      { id: 'visit-1001', businessId: BUSINESS_ID, staffProfileId: 'staff-anna', staffName: 'Anna', service: 'Gel manicure', occurredAt: '2026-07-12T16:00:00.000Z' }
    ],
    checkins: [],
    redemptions: [],
    tips: [],
    directPayments: [],
    bookingRequests: [],
    appointments: [],
    looks: [
      { id: 'look-galaxy', businessId: BUSINESS_ID, visitId: 'visit-1001', staffProfileId: 'staff-anna', staffName: 'Anna', service: 'Gel manicure', color: 'OPI Bubble Bath #S86', note: 'Galaxy chrome', photoDataUrl: '', createdAt: '2026-07-12T16:20:00.000Z' }
    ],
    feedback: [],
    savedOfferIds: [],
    wishes: ['Gói spa đôi cuối tuần'],
    followedTechIds: [],
    notifications: [
      { id: 'note-welcome', type: 'system', title: { vi: 'Điểm mới đã được cộng', en: 'New points were added' }, target: 'history', read: false, createdAt: '2026-07-14T10:43:00.000Z' }
    ],
    offlineQueue: [],
    ui: {
      activeScreen: 'home', activeModule: 'home', selectedBusinessId: BUSINESS_ID,
      selectedTip: 10, selectedTipMethod: 'Venmo', selectedStaffId: 'staff-anna',
      paymentMethod: 'Zelle', rating: 0, currentRewardKey: null,
      exploreFilter: 'all', offerFilter: 'all', pendingContext: {},
      bookingDraft: { businessId: BUSINESS_ID, service: 'Gel manicure', staff: 'Anna', day: 'Thu 16 Jul', time: '2:00 PM', note: '' },
      overlay: null, pushPromptCount: 0
    }
  };
}

function mergeRecord(defaultValue, incomingValue) {
  if (!incomingValue || typeof incomingValue !== 'object' || Array.isArray(incomingValue)) return structuredClone(defaultValue);
  const result = structuredClone(defaultValue);
  for (const [key, value] of Object.entries(incomingValue)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = mergeRecord(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function migrateState(value) {
  const defaults = createDefaultState();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
  const migrated = mergeRecord(defaults, value);
  migrated.schemaVersion = SCHEMA_VERSION;
  migrated.updatedAt = new Date().toISOString();
  delete migrated.pointBalance;
  delete migrated.savedOffers;
  return migrated;
}

function loadState(storage = window.localStorage, now = () => Date.now()) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = createDefaultState();
    storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return migrateState(JSON.parse(raw));
  } catch {
    storage.setItem(`${STORAGE_KEY}.corrupt.${now()}`, raw);
    const fresh = createDefaultState();
    storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveState(appState, storage = window.localStorage) {
  appState.updatedAt = new Date().toISOString();
  storage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

let state = loadState();

function commitState(mutator) {
  const result = mutator(state);
  saveState(state);
  return result;
}
```

At the bottom of the script, replace direct initialization with this testable entry point:

```js
function initializeApp() {
  document.addEventListener('click', handleAction);
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleChange);
  document.addEventListener('keydown', handleKeydown);
  renderApp();
}

window.NEXORA_TEST_API = {
  STORAGE_KEY,
  createDefaultState,
  migrateState,
  loadState,
  saveState
};

if (!window.NEXORA_SKIP_INIT) initializeApp();
```

- [ ] **Step 4: Run the full suite and verify pass**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all existing and new tests PASS with exit code 0.

- [ ] **Step 5: Commit the database foundation**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add customer prototype local storage state"
```

---

