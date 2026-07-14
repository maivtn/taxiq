# Customer Reward LocalStorage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện `cutomer-reward.html` thành prototype customer 31 màn hình có action đầy đủ, dữ liệu nhất quán và persist bằng `localStorage`.

**Architecture:** Giữ một file HTML tự chạy, nhưng chia JavaScript nội tuyến thành demo database, pure domain actions, renderer và interaction controller. Mọi mutation đi qua domain action, lưu state có version rồi render lại; `window.NEXORA_TEST_API` chỉ expose các pure function cho Node test và không tạo dependency runtime mới.

**Tech Stack:** HTML5, Tailwind CSS Browser CDN v4, Lucide Icons, vanilla JavaScript, `localStorage`, Node.js built-in test runner.

## Global Constraints

- Chỉ tạo hoặc sửa file trong `html/customer`.
- Giữ đúng 31 screen ID hiện có; không thêm hoặc xóa screen.
- Giữ Tailwind CSS Browser CDN v4 và Lucide; không thêm Bootstrap, jQuery hoặc package runtime khác.
- Tiếng Việt là mặc định cho state mới; EN/VI phải đổi runtime và text động phải đi qua dictionary.
- NEXORA không giữ tiền; tip và payment chỉ tạo record mô phỏng giao dịch trực tiếp.
- Không gộp điểm giữa business; mọi balance và ledger entry phải có `businessId`.
- Tip, direct payment và booking chỉ cộng điểm sau khi business xác nhận.
- Feedback riêng cộng 15 điểm với mọi rating; Google Review không cộng điểm và không review-gating.
- Consent marketing là tùy chọn; Skip vẫn giữ điểm; record consent/revoke có timestamp.
- Follow-tech chỉ có khi tồn tại visit chung; không hiển thị follower count hoặc follower list.
- Không dùng `@apply` với custom utility `app-*`.
- Mỗi task chỉ commit đúng `html/customer/cutomer-reward.html` và `html/customer/cutomer-reward.test.mjs` khi các file đó thay đổi.

## File Structure

- Modify: `html/customer/cutomer-reward.html` — toàn bộ UI, state engine, domain actions, renderer và event controller của prototype.
- Modify: `html/customer/cutomer-reward.test.mjs` — static contract tests và pure domain tests chạy bằng Node built-ins.
- Reference only: `html/customer/customer-reward-localstorage-design.md` — thiết kế đã duyệt.
- Reference only: `html/customer/customer-app-developer-spec.md` — source of truth cho customer behavior.
- Reference only: `html/customer/three-sided-marketplace-spec.md` — source of truth cho follow-tech phía customer.

---

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

### Task 2: Global Renderer, Modal Controller và Responsive Scan Navigation

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:31-48,69-76,77-107,220-241,270-357,515-556`

**Interfaces:**
- Consumes: `state`, `commitState()`, `saveState()` from Task 1.
- Produces: `t(key: string): string`
- Produces: `renderApp(): void`, `renderNavigation(): void`, `renderGlobalState(): void`
- Produces: `openOverlay(config: OverlayConfig): void`, `closeOverlay(result?: boolean): void`
- Produces: `registerAction(name: string, handler: (control: HTMLElement) => void): void`

- [ ] **Step 1: Add static contracts for global actions and the special Scan button**

Append:

```js
test('gives every enabled button an action and wires the known global controls', () => {
  const source = html();
  const buttons = source.match(/<button\b[\s\S]*?<\/button>/g) || [];
  for (const button of buttons) {
    if (/\bdisabled\b/.test(button)) continue;
    const interactive = /data-action=|data-nav-target=|data-explore-filter=|data-offer-filter=|data-payment-method=|data-book-(?:service|staff|day|time)=/.test(button);
    assert.ok(interactive, `enabled button needs an action: ${button.slice(0, 160)}`);
  }
  for (const action of ['open-notifications', 'edit-profile', 'logout', 'reset-demo']) {
    assert.match(source, new RegExp(`data-action="${action}"`));
  }
});

test('renders a raised mobile Scan control without changing desktop sidebar behavior', () => {
  const source = html();
  assert.match(source, /mobile-scan-button/);
  assert.match(source, /mobile-scan-icon/);
  assert.match(source, /item\.id === 'scan'/);
  assert.match(source, /id="desktop-nav"/);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="every enabled button|raised mobile Scan" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL listing the notification, Edit Profile, Logout controls and missing Scan classes.

- [ ] **Step 3: Implement the renderer, modal controller and mobile Scan treatment**

Add component CSS inside `@layer components`:

```css
.mobile-scan-button { @apply relative -mt-5 flex min-h-20 flex-col items-center justify-start gap-1 text-[11px] font-bold text-app-muted focus-visible:outline-2 focus-visible:outline-app-cyan; }
.mobile-scan-icon { @apply grid size-14 place-items-center rounded-full border-4 border-app-panel bg-gradient-to-br from-app-purple to-app-pink text-white shadow-[0_10px_28px_rgba(124,61,255,.55)]; }
.mobile-scan-button[aria-current="page"] { @apply text-app-pink; }
.field-error { @apply mt-1 text-xs font-bold text-app-red; }
```

Give the two notification buttons, Edit Profile and Logout explicit actions, and add prototype management rows under the Profile settings list:

```html
<button type="button" class="grid size-11 place-items-center rounded-xl border border-app-line bg-app-card text-app-muted" data-action="open-notifications" aria-label="Thông báo">
  <i data-lucide="bell" class="size-5" aria-hidden="true"></i>
</button>
```

```html
<button type="button" class="app-button-secondary mt-5 w-full" data-action="edit-profile" data-en="Edit profile" data-vi="Chỉnh sửa hồ sơ">Chỉnh sửa hồ sơ</button>
```

```html
<button type="button" class="app-button-secondary w-full" data-action="payment-methods"><i data-lucide="credit-card" class="size-4" aria-hidden="true"></i><span data-en="Payment methods" data-vi="Phương thức thanh toán">Phương thức thanh toán</span></button>
<button type="button" class="app-button-secondary w-full" data-action="privacy-details"><i data-lucide="shield-check" class="size-4" aria-hidden="true"></i><span data-en="Privacy details" data-vi="Thông tin riêng tư">Thông tin riêng tư</span></button>
<button type="button" class="app-button-secondary w-full" data-action="reset-demo"><i data-lucide="rotate-ccw" class="size-4" aria-hidden="true"></i><span data-en="Reset demo data" data-vi="Đặt lại dữ liệu mẫu">Đặt lại dữ liệu mẫu</span></button>
<button type="button" class="app-button-secondary w-full border-app-red/30 text-app-red" data-action="logout"><i data-lucide="log-out" class="size-4" aria-hidden="true"></i><span data-en="Log out" data-vi="Đăng xuất">Đăng xuất</span></button>
```

Replace the overlay body with a controller-friendly dialog:

```html
<div id="app-overlay" class="fixed inset-0 z-[80] hidden items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center" data-overlay aria-hidden="true">
  <div class="app-card max-h-[min(88dvh,720px)] w-full max-w-md overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="overlay-title">
    <div class="flex items-start justify-between gap-4">
      <div><p class="eyebrow" data-en="NEXORA notice" data-vi="Thông báo NEXORA">Thông báo NEXORA</p><h2 id="overlay-title" class="mt-1 text-xl font-black"></h2></div>
      <button type="button" class="icon-button" data-action="close-overlay" aria-label="Đóng"><i data-lucide="x" class="size-5" aria-hidden="true"></i></button>
    </div>
    <div id="overlay-content" class="mt-4 text-sm leading-6 text-app-muted"></div>
    <div id="overlay-actions" class="mt-5 grid gap-2 sm:grid-cols-2">
      <button id="overlay-cancel" type="button" class="app-button-secondary" data-action="cancel-overlay"></button>
      <button id="overlay-confirm" type="button" class="app-button" data-action="confirm-overlay"></button>
    </div>
  </div>
</div>
```

Replace `renderNavigation`, `openOverlay`, `closeOverlay` and add the shared renderer/action registry:

```js
const COPY = {
  vi: { cancel: 'Hủy', confirm: 'Xác nhận', dataReset: 'Dữ liệu mẫu đã được đặt lại', loggedOut: 'Đã đăng xuất' },
  en: { cancel: 'Cancel', confirm: 'Confirm', dataReset: 'Demo data was reset', loggedOut: 'Signed out' }
};

function t(key) {
  return COPY[state.profile.language]?.[key] ?? COPY.vi[key] ?? key;
}

function renderNavigation() {
  const language = state.profile.language;
  document.getElementById('desktop-nav').innerHTML = NAV_ITEMS.map((item) => `
    <button type="button" class="nav-item w-full" data-nav-target="${item.id}">
      <i data-lucide="${item.icon}" class="size-5" aria-hidden="true"></i><span>${item[language]}</span>
    </button>`).join('');
  document.getElementById('mobile-nav').innerHTML = NAV_ITEMS.map((item) => item.id === 'scan' ? `
    <button type="button" class="mobile-scan-button" data-nav-target="scan">
      <span class="mobile-scan-icon"><i data-lucide="scan-line" class="size-6" aria-hidden="true"></i></span><span>${item[language]}</span>
    </button>` : `
    <button type="button" class="mobile-nav-item" data-nav-target="${item.id}">
      <i data-lucide="${item.icon}" class="size-5" aria-hidden="true"></i><span>${item[language]}</span>
    </button>`).join('');
}

function updateNavigation() {
  document.querySelectorAll('[data-nav-target]').forEach((control) => {
    const active = control.dataset.navTarget === state.ui.activeModule;
    if (active) control.setAttribute('aria-current', 'page');
    else control.removeAttribute('aria-current');
  });
}

function navigateTo(screenId, options = {}) {
  const next = document.getElementById(screenId) || document.getElementById('home');
  document.querySelectorAll('.app-screen').forEach((screen) => {
    const active = screen === next;
    screen.classList.toggle('hidden', !active);
    screen.classList.toggle('is-active', active);
  });
  state.ui.activeScreen = next.id;
  state.ui.activeModule = SCREEN_MODULE[next.id] || 'home';
  saveState(state);
  updateNavigation();
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (options.focus !== false) document.getElementById('screen-region').focus({ preventScroll: true });
}

function setLanguage(language) {
  commitState((draft) => { draft.profile.language = language === 'en' ? 'en' : 'vi'; });
  document.querySelectorAll('[data-en][data-vi]').forEach((element) => { element.textContent = element.dataset[state.profile.language]; });
  document.querySelectorAll('[data-en-ph][data-vi-ph]').forEach((element) => { element.placeholder = element.dataset[`${state.profile.language}Ph`]; });
  renderApp();
  navigateTo(state.ui.activeScreen, { focus: false });
}

function openOverlay({ title, html, confirmLabel = t('confirm'), cancelLabel = t('cancel'), onConfirm = null, onCancel = null, hideCancel = false }) {
  state.ui.overlay = { onConfirm, onCancel };
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-content').innerHTML = html;
  document.getElementById('overlay-confirm').textContent = confirmLabel;
  const cancel = document.getElementById('overlay-cancel');
  cancel.textContent = cancelLabel;
  cancel.classList.toggle('hidden', hideCancel);
  const overlay = document.getElementById('app-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overflow-hidden');
  document.getElementById('overlay-confirm').focus();
  if (window.lucide) window.lucide.createIcons();
}

function closeOverlay(result = null) {
  const callbacks = state.ui.overlay;
  state.ui.overlay = null;
  const overlay = document.getElementById('app-overlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
  if (result === true && callbacks?.onConfirm) callbacks.onConfirm();
  if (result === false && callbacks?.onCancel) callbacks.onCancel();
}

const ACTIONS = new Map();
function registerAction(name, handler) { ACTIONS.set(name, handler); }

function renderGlobalState() {
  document.documentElement.lang = state.profile.language;
  document.querySelectorAll('[data-language]').forEach((control) => control.setAttribute('aria-pressed', String(control.dataset.language === state.profile.language)));
  const unread = state.notifications.filter((item) => !item.read).length;
  document.querySelectorAll('[data-action="open-notifications"]').forEach((button) => {
    button.setAttribute('aria-label', state.profile.language === 'vi' ? `Thông báo, ${unread} chưa đọc` : `Notifications, ${unread} unread`);
  });
}

function renderApp() {
  renderNavigation();
  renderGlobalState();
  updateNavigation();
  renderDomainViews();
  if (window.lucide) window.lucide.createIcons();
}

function handleKeydown(event) {
  if (event.key === 'Escape' && state.ui.overlay) closeOverlay(null);
}
```

Update `handleAction` so generic actions use the registry and add the first global registrations:

```js
function handleAction(event) {
  const nav = event.target.closest('[data-nav-target]');
  if (nav) return navigateTo(nav.dataset.navTarget);
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled) return;
  const handler = ACTIONS.get(control.dataset.action);
  if (handler) handler(control, event);
}

registerAction('navigate', (control) => navigateTo(control.dataset.target));
registerAction('back', (control) => navigateTo(control.dataset.backTarget));
registerAction('language', (control) => setLanguage(control.dataset.language));
registerAction('close-overlay', () => closeOverlay(null));
registerAction('cancel-overlay', () => closeOverlay(false));
registerAction('confirm-overlay', () => closeOverlay(true));
registerAction('open-notifications', () => {
  commitState((draft) => draft.notifications.forEach((item) => { item.read = true; }));
  navigateTo('activity');
});
registerAction('logout', () => openOverlay({
  title: state.profile.language === 'vi' ? 'Đăng xuất?' : 'Sign out?',
  html: state.profile.language === 'vi' ? 'Dữ liệu điểm vẫn được giữ trên thiết bị này.' : 'Your reward data stays on this device.',
  onConfirm: () => { commitState((draft) => { draft.session.authenticated = false; }); navigateTo('login1'); showToast(t('loggedOut')); }
}));
registerAction('reset-demo', () => openOverlay({
  title: state.profile.language === 'vi' ? 'Đặt lại dữ liệu mẫu?' : 'Reset demo data?',
  html: state.profile.language === 'vi' ? 'Điểm, lịch sử và tùy chọn sẽ trở về dữ liệu ban đầu.' : 'Points, history and preferences return to their defaults.',
  onConfirm: () => { state = createDefaultState(); saveState(state); renderApp(); navigateTo('home'); showToast(t('dataReset')); }
}));
```

Keep a single `renderDomainViews()` stub at this task boundary so later tasks can extend it without changing `renderApp`:

```js
function renderDomainViews() {
}
```

- [ ] **Step 4: Run the complete Node suite**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; the enabled-button test reports no missing action.

- [ ] **Step 5: Commit the global interaction shell**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: complete customer app shell interactions"
```

---

### Task 3: Auth, Onboarding, Profile và Consent Persistence

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:161-166,194-205,220-233,243-end`

**Interfaces:**
- Consumes: versioned state and action registry from Tasks 1–2.
- Produces: `normalizeUsPhone(value: string): string`
- Produces: `requestOtp(appState, phone, now): Result`
- Produces: `verifyOtp(appState, code, now): Result`
- Produces: `recordConsent(appState, scope, action, method, now): ConsentRecord`
- Produces: `setPreference(appState, key, value, now): Result`
- Produces: `setBusinessMarketing(appState, businessId, value, now): Result`
- Produces: `claimWelcomeGift(appState, phone, now): Result`
- Produces: `renderProfile(): void`, `renderPreferences(): void`.

- [ ] **Step 1: Add domain tests for validation, cooldown, lockout and consent**

Append:

```js
test('validates US phone and enforces OTP cooldown plus lockout', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.normalizeUsPhone('(832) 555-0148'), '8325550148');
  assert.equal(api.requestOtp(app, '123', 1000).ok, false);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 1000).ok, true);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 2000).code, 'cooldown');
  for (let attempt = 0; attempt < 5; attempt += 1) api.verifyOtp(app, '111111', 31000 + attempt);
  assert.ok(app.session.lockedUntil > 31004);
  assert.equal(api.verifyOtp(app, '246810', 32000).code, 'locked');
});

test('records consent decisions without making marketing a condition of points', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  api.recordConsent(app, 'business:bitcoin-nail-bar', 'revoke', 'onboarding_skip', 1000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(app.consents.at(-1).action, 'revoke');
  api.setBusinessMarketing(app, 'bitcoin-nail-bar', true, 1500);
  assert.equal(app.preferences.businessMarketing['bitcoin-nail-bar'], true);
  api.setPreference(app, 'aiSuggestions', false, 2000);
  assert.equal(app.preferences.aiSuggestions, false);
  assert.equal(app.consents.at(-1).scope, 'aiSuggestions');
});

test('prevents a welcome gift from being claimed twice or by an existing account', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  assert.equal(api.claimWelcomeGift(app, '(832) 555-0148', 40000).code, 'existing_account');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(api.claimWelcomeGift(app, '(713) 555-0199', 80000).ok, true);
  assert.equal(api.claimWelcomeGift(app, '(713) 555-0199', 120000).code, 'already_claimed');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 25);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="OTP cooldown|consent decisions" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because auth and consent domain functions are absent.

- [ ] **Step 3: Implement auth/onboarding domain functions and replace the four onboarding screens**

Add these pure functions before UI renderers and export them through `NEXORA_TEST_API`:

```js
function normalizeUsPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

function requestOtp(appState, rawPhone, now = Date.now()) {
  const phone = normalizeUsPhone(rawPhone);
  if (phone.length !== 10) return { ok: false, code: 'invalid_phone' };
  if (appState.session.otpRequestedAt && now - appState.session.otpRequestedAt < 30000) return { ok: false, code: 'cooldown', retryAt: appState.session.otpRequestedAt + 30000 };
  appState.session.phone = phone;
  appState.session.otpCode = '246810';
  appState.session.otpRequestedAt = now;
  appState.session.otpAttempts = 0;
  return { ok: true, code: 'sent', demoCode: '246810' };
}

function verifyOtp(appState, code, now = Date.now()) {
  if (appState.session.lockedUntil > now) return { ok: false, code: 'locked', retryAt: appState.session.lockedUntil };
  if (!/^\d{6}$/.test(String(code)) || String(code) !== appState.session.otpCode) {
    appState.session.otpAttempts += 1;
    if (appState.session.otpAttempts >= 5) appState.session.lockedUntil = now + 15 * 60 * 1000;
    return { ok: false, code: appState.session.lockedUntil > now ? 'locked' : 'invalid_code' };
  }
  appState.session.authenticated = true;
  appState.session.otpAttempts = 0;
  appState.session.lockedUntil = 0;
  return { ok: true, code: 'verified' };
}

function recordConsent(appState, scope, action, method, now = Date.now()) {
  const record = { id: `consent-${crypto.randomUUID()}`, scope, action, method, createdAt: new Date(now).toISOString(), confirmedAt: action === 'grant' ? new Date(now).toISOString() : null };
  appState.consents.push(record);
  return record;
}

function setPreference(appState, key, value, now = Date.now()) {
  if (!(key in appState.preferences)) return { ok: false, code: 'unknown_preference' };
  appState.preferences[key] = Boolean(value);
  recordConsent(appState, key, value ? 'grant' : 'revoke', 'preferences', now);
  return { ok: true };
}

function setBusinessMarketing(appState, businessId, value, now = Date.now()) {
  appState.preferences.businessMarketing[businessId] = Boolean(value);
  recordConsent(appState, `business:${businessId}`, value ? 'grant' : 'revoke', 'preferences', now);
  return { ok: true };
}

function claimWelcomeGift(appState, rawPhone, now = Date.now()) {
  const phone = normalizeUsPhone(rawPhone);
  if (phone.length !== 10) return { ok: false, code: 'invalid_phone' };
  const otp = requestOtp(appState, phone, now);
  if (!otp.ok) return otp;
  if (phone === appState.profile.phone) return { ok: false, code: 'existing_account' };
  if (appState.welcomeClaims.includes(phone)) return { ok: false, code: 'already_claimed' };
  appState.welcomeClaims.push(phone);
  appState.balances[BUSINESS_ID].points += 25;
  appState.ledger.unshift({ id: `ledger-${crypto.randomUUID()}`, businessId: BUSINESS_ID, type: 'welcome', pointsDelta: 25, refType: 'onboarding', refId: `welcome-${phone}`, createdAt: new Date(now).toISOString() });
  return { ok: true, code: 'claimed', points: 25 };
}
```

Replace the login country prefix with `+1`, use placeholder `(832) 555-0148`, change login buttons to `request-otp` and `verify-otp`, and add inline error containers:

```html
<span class="grid min-h-11 place-items-center rounded-xl border border-app-line bg-app-panel px-3 text-sm font-bold">+1</span>
<input id="login-phone" class="app-input" type="tel" inputmode="tel" autocomplete="tel" placeholder="(832) 555-0148">
<p id="login-phone-error" class="field-error hidden" role="alert"></p>
<button class="app-button mt-5 w-full" type="button" data-action="request-otp"><span data-en="Continue" data-vi="Tiếp tục">Tiếp tục</span></button>
```

```html
<p class="mt-2 rounded-xl bg-app-cyan/5 p-3 text-xs text-app-cyan" data-en="Prototype code: 246810" data-vi="Mã dùng thử: 246810">Mã dùng thử: 246810</p>
<p id="otp-error" class="field-error hidden" role="alert"></p>
<button class="app-button mt-5 w-full" type="button" data-action="verify-otp"><span data-en="Verify & sign in" data-vi="Xác thực & đăng nhập">Xác thực & đăng nhập</span></button>
<button id="otp-resend" class="mt-4 min-h-11 w-full text-sm font-bold text-app-cyan" type="button" data-action="resend-code" data-en="Resend code" data-vi="Gửi lại mã">Gửi lại mã</button>
```

Replace `onb1`–`onb4` content while keeping the section elements and titles:

```html
<!-- onb1 body -->
<div class="mx-auto max-w-xl"><p class="eyebrow" data-en="Welcome gift" data-vi="Quà chào mừng">Quà chào mừng</p><h1 id="onb1-title" class="mt-2 text-3xl font-black" data-en="25 points are waiting" data-vi="25 điểm đang chờ bạn">25 điểm đang chờ bạn</h1><p class="mt-3 text-sm text-app-muted" data-en="Gifted by Bitcoin Nail Bar. Enter your phone to claim it." data-vi="Bitcoin Nail Bar tặng bạn. Nhập số điện thoại để nhận.">Bitcoin Nail Bar tặng bạn. Nhập số điện thoại để nhận.</p><input id="onb-phone" class="app-input mt-6" type="tel" placeholder="(832) 555-0148"><p id="onb-phone-error" class="field-error hidden" role="alert"></p><button class="app-button mt-5 w-full" type="button" data-action="claim-welcome" data-en="Claim 25 points" data-vi="Nhận 25 điểm">Nhận 25 điểm</button></div>
```

```html
<!-- onb2 body -->
<div class="mx-auto max-w-xl"><p class="eyebrow" data-en="Optional messages" data-vi="Tin nhắn tùy chọn">Tin nhắn tùy chọn</p><h1 id="onb2-title" class="mt-2 text-3xl font-black" data-en="Choose what to receive" data-vi="Chọn nội dung muốn nhận">Chọn nội dung muốn nhận</h1><label class="app-card mt-6 flex items-start gap-3"><input class="mt-1 size-5 accent-app-purple" type="checkbox" data-consent-choice="business"><span><strong data-en="Rewards & offers from Bitcoin Nail Bar" data-vi="Điểm và ưu đãi từ Bitcoin Nail Bar">Điểm và ưu đãi từ Bitcoin Nail Bar</strong><small class="block text-app-muted" data-en="Up to 4 marketing messages per month." data-vi="Tối đa 4 tin tiếp thị mỗi tháng.">Tối đa 4 tin tiếp thị mỗi tháng.</small></span></label><label class="app-card mt-3 flex items-start gap-3"><input class="mt-1 size-5 accent-app-purple" type="checkbox" data-consent-choice="network"><span><strong data-en="Nearby partner offers" data-vi="Ưu đãi từ đối tác gần bạn">Ưu đãi từ đối tác gần bạn</strong></span></label><p id="consent-error" class="field-error hidden" role="alert"></p><button class="app-button mt-5 w-full" type="button" data-action="accept-consent" data-en="Agree & continue" data-vi="Đồng ý & tiếp tục">Đồng ý & tiếp tục</button><button class="app-button-secondary mt-3 w-full" type="button" data-action="skip-consent" data-en="Skip — points only" data-vi="Bỏ qua — chỉ nhận điểm">Bỏ qua — chỉ nhận điểm</button><p class="mt-4 text-xs leading-5 text-app-muted" data-en="Consent is not required to receive points. STOP/HELP supported." data-vi="Không bắt buộc đồng ý để nhận điểm. Hỗ trợ STOP/HELP.">Không bắt buộc đồng ý để nhận điểm. Hỗ trợ STOP/HELP.</p></div>
```

```html
<!-- onb3 body -->
<div class="mx-auto max-w-xl"><p class="eyebrow" data-en="Double opt-in" data-vi="Xác nhận hai bước">Xác nhận hai bước</p><h1 id="onb3-title" class="mt-2 text-3xl font-black" data-en="Confirm your number" data-vi="Xác nhận số điện thoại">Xác nhận số điện thoại</h1><div class="app-card mt-6 text-sm leading-6 text-app-muted">Nexora: Bitcoin Nail Bar added 25 pts. Reply Y to confirm messages. STOP=cancel HELP=help.</div><button class="app-button mt-5 w-full" type="button" data-action="confirm-double-opt-in" data-en="Reply Y (demo)" data-vi="Trả lời Y (mô phỏng)">Trả lời Y (mô phỏng)</button></div>
```

```html
<!-- onb4 body -->
<div class="mx-auto grid min-h-[65vh] max-w-xl place-items-center text-center"><div class="w-full"><span class="mx-auto grid size-20 place-items-center rounded-3xl bg-app-green/10 text-app-green"><i data-lucide="party-popper" class="size-10" aria-hidden="true"></i></span><h1 id="onb4-title" class="mt-6 text-3xl font-black" data-en="25 points are waiting" data-vi="25 điểm đã sẵn sàng">25 điểm đã sẵn sàng</h1><p class="mt-3 text-sm text-app-muted" data-en="Stored in your Bitcoin Nail Bar balance." data-vi="Đã lưu trong số dư Bitcoin Nail Bar của bạn.">Đã lưu trong số dư Bitcoin Nail Bar của bạn.</p><button class="app-button mt-5 w-full" type="button" data-action="finish-onboarding" data-en="Enter app" data-vi="Vào ứng dụng">Vào ứng dụng</button></div></div>
```

In Profile, add renderer hooks to the existing name, phone and avatar elements:

```html
<img data-profile-avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" alt="Ảnh hồ sơ Jessica" class="size-24 rounded-3xl object-cover">
<h2 data-profile-name class="mt-4 text-xl font-black">Jessica Nguyen</h2>
<p data-profile-phone class="mt-1 text-sm text-app-muted">(832) 555-0148</p>
```

Replace the preferences controls so transactional messages cannot be disabled, business marketing is per business, and every editable toggle saves immediately. Remove the old Save button and use this explanatory line instead:

```html
<label class="mt-4 flex min-h-14 items-center justify-between gap-4 border-t border-app-line pt-4"><span><strong class="block text-sm" data-en="Booking and receipt messages" data-vi="Tin lịch hẹn và biên nhận">Tin lịch hẹn và biên nhận</strong><small class="text-app-muted" data-en="Transactional messages are always delivered" data-vi="Tin giao dịch luôn được gửi">Tin giao dịch luôn được gửi</small></span><input class="size-5 accent-app-purple" type="checkbox" checked disabled aria-disabled="true"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm">Bitcoin Nail Bar</strong><small class="text-app-muted" data-en="Marketing offers from this business" data-vi="Ưu đãi tiếp thị từ doanh nghiệp này">Ưu đãi tiếp thị từ doanh nghiệp này</small></span><input class="size-5 accent-app-purple" type="checkbox" data-business-pref="bitcoin-nail-bar"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="Nearby partner offers" data-vi="Ưu đãi đối tác gần bạn">Ưu đãi đối tác gần bạn</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="networkOffers"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="Booking reminders" data-vi="Nhắc lịch hẹn">Nhắc lịch hẹn</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="bookingReminders"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="Nearby deal notifications" data-vi="Thông báo ưu đãi gần bạn">Thông báo ưu đãi gần bạn</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="nearbyDeals"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="AI suggestions from history" data-vi="Gợi ý AI từ lịch sử">Gợi ý AI từ lịch sử</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="aiSuggestions"></label>
<p class="text-center text-xs text-app-muted" data-en="Each change is saved immediately on this device." data-vi="Mỗi thay đổi được lưu ngay trên thiết bị này.">Mỗi thay đổi được lưu ngay trên thiết bị này.</p>
```

Register handlers and profile/preferences renderers:

```js
function setFieldError(id, message = '') {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('hidden', !message);
}

function renderProfile() {
  document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = state.profile.name; });
  document.querySelectorAll('[data-profile-phone]').forEach((element) => { element.textContent = `(${state.profile.phone.slice(0, 3)}) ${state.profile.phone.slice(3, 6)}-${state.profile.phone.slice(6)}`; });
  document.querySelectorAll('[data-profile-avatar]').forEach((element) => { element.src = state.profile.avatar; });
  renderPreferences();
}

function renderPreferences() {
  document.querySelectorAll('[data-pref]').forEach((input) => {
    input.checked = Boolean(state.preferences[input.dataset.pref]);
  });
  document.querySelectorAll('[data-business-pref]').forEach((input) => { input.checked = Boolean(state.preferences.businessMarketing[input.dataset.businessPref]); });
  document.querySelector('[data-for-you]')?.classList.toggle('hidden', !state.preferences.aiSuggestions);
}

function renderDomainViews() {
  renderProfile();
}

function handleChange(event) {
  const businessPref = event.target.closest('[data-business-pref]');
  if (businessPref) {
    commitState((draft) => setBusinessMarketing(draft, businessPref.dataset.businessPref, businessPref.checked));
    renderPreferences();
    showToast(state.profile.language === 'vi' ? 'Đã lưu tùy chọn doanh nghiệp.' : 'Business preference saved.');
    return;
  }
  const pref = event.target.closest('[data-pref]');
  if (!pref) return;
  commitState((draft) => setPreference(draft, pref.dataset.pref, pref.checked));
  renderPreferences();
  showToast(state.profile.language === 'vi' ? 'Đã lưu tùy chọn' : 'Preference saved');
}

registerAction('request-otp', () => {
  const result = commitState((draft) => requestOtp(draft, document.getElementById('login-phone').value));
  if (!result.ok) return setFieldError('login-phone-error', state.profile.language === 'vi' ? 'Nhập số điện thoại US gồm 10 số.' : 'Enter a 10-digit US phone number.');
  setFieldError('login-phone-error');
  navigateTo('login2');
});
registerAction('verify-otp', () => {
  const result = commitState((draft) => verifyOtp(draft, document.getElementById('otp-code').value));
  if (!result.ok) return setFieldError('otp-error', result.code === 'locked' ? (state.profile.language === 'vi' ? 'Đã khóa 15 phút do nhập sai nhiều lần.' : 'Locked for 15 minutes after too many attempts.') : (state.profile.language === 'vi' ? 'Mã phải đúng 6 số.' : 'Enter the valid 6-digit code.'));
  setFieldError('otp-error');
  navigateTo('home');
});
registerAction('resend-code', () => {
  const result = commitState((draft) => requestOtp(draft, draft.session.phone));
  showToast(result.ok ? (state.profile.language === 'vi' ? 'Đã gửi lại mã 246810' : 'Code 246810 resent') : (state.profile.language === 'vi' ? 'Vui lòng chờ đủ 30 giây.' : 'Please wait for the 30-second cooldown'), result.ok ? 'success' : 'error');
});
registerAction('claim-welcome', () => {
  const result = commitState((draft) => claimWelcomeGift(draft, document.getElementById('onb-phone').value));
  if (result.code === 'existing_account') { showToast(state.profile.language === 'vi' ? 'Số này đã có tài khoản; hãy xác thực để đăng nhập.' : 'This number already has an account; verify to sign in.'); return navigateTo('login2'); }
  if (!result.ok) return setFieldError('onb-phone-error', result.code === 'already_claimed' ? (state.profile.language === 'vi' ? 'Số này đã nhận quà chào mừng.' : 'This number already claimed the welcome gift.') : (state.profile.language === 'vi' ? 'Nhập số điện thoại US hợp lệ.' : 'Enter a valid US phone number.'));
  navigateTo('onb2');
});
registerAction('accept-consent', () => {
  const choices = [...document.querySelectorAll('[data-consent-choice]:checked')].map((input) => input.dataset.consentChoice);
  if (!choices.length) return setFieldError('consent-error', state.profile.language === 'vi' ? 'Chọn ít nhất một mục hoặc dùng Bỏ qua.' : 'Choose at least one option or Skip.');
  commitState((draft) => choices.forEach((choice) => {
    if (choice === 'business') { draft.preferences.businessMarketing[BUSINESS_ID] = true; recordConsent(draft, `business:${BUSINESS_ID}`, 'grant', 'onboarding'); }
    else { draft.preferences.networkOffers = true; recordConsent(draft, 'network', 'grant', 'onboarding'); }
  }));
  navigateTo('onb3');
});
registerAction('skip-consent', () => {
  commitState((draft) => { draft.preferences.businessMarketing[BUSINESS_ID] = false; draft.preferences.networkOffers = false; recordConsent(draft, `business:${BUSINESS_ID}`, 'revoke', 'onboarding_skip'); recordConsent(draft, 'network', 'revoke', 'onboarding_skip'); });
  navigateTo('onb4');
});
registerAction('confirm-double-opt-in', () => { commitState((draft) => recordConsent(draft, `business:${BUSINESS_ID}`, 'grant', 'sms_y')); navigateTo('onb4'); });
registerAction('finish-onboarding', () => {
  openOverlay({ title: state.profile.language === 'vi' ? 'Bật thông báo?' : 'Turn on notifications?', html: state.profile.language === 'vi' ? 'Nhận xác nhận lịch, thanh toán và cảnh báo điểm sắp hết hạn.' : 'Get booking, payment and point-expiry updates.', confirmLabel: state.profile.language === 'vi' ? 'Bật thông báo' : 'Turn on', cancelLabel: state.profile.language === 'vi' ? 'Để sau' : 'Maybe later', onConfirm: () => { commitState((draft) => { draft.preferences.pushPermission = 'granted'; }); navigateTo('home'); }, onCancel: () => { commitState((draft) => { draft.preferences.pushPermission = 'later'; draft.ui.pushPromptCount += 1; }); navigateTo('home'); } });
});
registerAction('edit-profile', () => openOverlay({
  title: state.profile.language === 'vi' ? 'Chỉnh sửa hồ sơ' : 'Edit profile',
  html: `<label class="block font-bold">${state.profile.language === 'vi' ? 'Họ tên' : 'Name'}<input id="profile-name-input" class="app-input mt-2" value="${state.profile.name.replaceAll('"', '&quot;')}"></label><label class="mt-4 block font-bold">${state.profile.language === 'vi' ? 'Điện thoại' : 'Phone'}<input id="profile-phone-input" class="app-input mt-2" value="${state.profile.phone}"></label><label class="mt-4 block font-bold">${state.profile.language === 'vi' ? 'URL ảnh đại diện' : 'Avatar URL'}<input id="profile-avatar-input" class="app-input mt-2" value="${state.profile.avatar.replaceAll('"', '&quot;')}"></label><p id="profile-edit-error" class="field-error hidden" role="alert"></p>`,
  onConfirm: () => {
    const phone = normalizeUsPhone(document.getElementById('profile-phone-input').value);
    const name = document.getElementById('profile-name-input').value.trim();
    if (!name || phone.length !== 10) return showToast(state.profile.language === 'vi' ? 'Tên và số điện thoại chưa hợp lệ.' : 'Name and phone are invalid.', 'error');
    const avatar = document.getElementById('profile-avatar-input').value.trim();
    commitState((draft) => { draft.profile.name = name; draft.profile.phone = phone; draft.profile.avatar = avatar || draft.profile.avatar; }); renderApp();
  }
}));
registerAction('payment-methods', () => openOverlay({
  title: state.profile.language === 'vi' ? 'Phương thức thanh toán' : 'Payment methods',
  html: ['Zelle', 'Venmo', 'Cash App'].map((method) => `<label class="flex items-center justify-between rounded-xl bg-app-panel p-3"><span>${method}</span><input type="checkbox" data-customer-method="${method}" ${state.profile.paymentMethods.includes(method) ? 'checked' : ''}></label>`).join(''),
  onConfirm: () => { const methods = [...document.querySelectorAll('[data-customer-method]:checked')].map((input) => input.dataset.customerMethod); commitState((draft) => { draft.profile.paymentMethods = methods; }); showToast(state.profile.language === 'vi' ? 'Đã lưu phương thức.' : 'Payment methods saved.'); }
}));
registerAction('privacy-details', () => openOverlay({ title: state.profile.language === 'vi' ? 'Quyền riêng tư' : 'Privacy', html: state.profile.language === 'vi' ? 'Dữ liệu mẫu chỉ lưu trong trình duyệt này. Looks chỉ dành cho bạn và business của visit.' : 'Demo data stays in this browser. Looks are visible only to you and the visit business.', hideCancel: true }));
```

Add these exact properties to the existing `window.NEXORA_TEST_API` object literal:

```js
normalizeUsPhone,
requestOtp,
verifyOtp,
recordConsent,
setPreference,
setBusinessMarketing,
claimWelcomeGift,
```

- [ ] **Step 4: Run the suite and verify pass**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; Vietnamese remains the new-state default.

- [ ] **Step 5: Commit auth and consent flows**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: persist customer auth consent and profile"
```

---

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

### Task 6: Booking Request và Compliant Feedback

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:144-160,243-end`

**Interfaces:**
- Consumes: `appendLedger()`, action registry and `state.ui.bookingDraft`.
- Produces: `createBookingRequest(appState, input, now): Result`
- Produces: `confirmBookingRequest(appState, bookingId, now): Result`
- Produces: `submitFeedback(appState, input, now): Result`
- Produces: `renderBooking(): void`, `renderAppointment(): void`, `renderFeedback(): void`.

- [ ] **Step 1: Add booking and review compliance tests**

Append:

```js
test('keeps booking bonus pending until business confirmation', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const result = api.createBookingRequest(app, { businessId: 'bitcoin-nail-bar', service: 'Gel manicure', staff: 'Anna', day: 'Thu 16 Jul', time: '2:00 PM', note: 'Màu hồng sữa' }, 1000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(result.booking.status, 'requested');
  api.confirmBookingRequest(app, result.booking.id, 2000);
  api.confirmBookingRequest(app, result.booking.id, 3000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 25);
  assert.equal(app.appointments.length, 1);
});

test('awards 15 points for one-star private feedback and blocks duplicates', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const first = api.submitFeedback(app, { visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 1, text: 'Cần cải thiện' }, 1000);
  const second = api.submitFeedback(app, { visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: 'Lặp' }, 2000);
  assert.equal(first.ok, true);
  assert.equal(second.code, 'already_submitted');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 15);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="booking bonus|one-star private" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because booking and feedback domain functions are absent.

- [ ] **Step 3: Implement booking and feedback domains plus confirmed UI**

Add pure functions:

```js
function createBookingRequest(appState, input, now = Date.now()) {
  if (![input.service, input.staff, input.day, input.time].every(Boolean)) return { ok: false, code: 'missing_selection' };
  const booking = { id: `book-${crypto.randomUUID()}`, businessId: input.businessId, service: input.service, staff: input.staff, day: input.day, time: input.time, note: input.note ?? '', status: 'requested', createdAt: new Date(now).toISOString(), confirmedAt: null };
  appState.bookingRequests.push(booking);
  appState.ui.pendingContext.bookingId = booking.id;
  return { ok: true, booking };
}

function confirmBookingRequest(appState, bookingId, now = Date.now()) {
  const booking = appState.bookingRequests.find((item) => item.id === bookingId);
  if (!booking) return { ok: false, code: 'not_found' };
  const points = appState.businesses[booking.businessId].bookingBonus;
  if (booking.status === 'confirmed') return { ok: true, booking, points, idempotent: true };
  booking.status = 'confirmed';
  booking.confirmedAt = new Date(now).toISOString();
  appState.appointments.push({ id: `appt-${booking.id}`, bookingId: booking.id, businessId: booking.businessId, service: booking.service, staff: booking.staff, day: booking.day, time: booking.time, status: 'confirmed' });
  if (points > 0) appendLedger(appState, { businessId: booking.businessId, type: 'booking_bonus', pointsDelta: points, refType: 'booking', refId: booking.id, now });
  return { ok: true, booking, points, idempotent: false };
}

function submitFeedback(appState, input, now = Date.now()) {
  if (!Number.isInteger(input.stars) || input.stars < 1 || input.stars > 5) return { ok: false, code: 'invalid_rating' };
  if (appState.feedback.some((item) => item.visitId === input.visitId)) return { ok: false, code: 'already_submitted' };
  const feedback = { id: `feedback-${crypto.randomUUID()}`, visitId: input.visitId, businessId: input.businessId, stars: input.stars, text: input.text ?? '', createdAt: new Date(now).toISOString() };
  appState.feedback.push(feedback);
  appendLedger(appState, { businessId: input.businessId, type: 'feedback', pointsDelta: 15, refType: 'feedback', refId: feedback.id, now });
  return { ok: true, feedback, points: 15 };
}
```

Add a separate confirmation action and calendar action to `book3`, plus a Google Review action on Feedback:

```html
<button id="booking-demo-confirm" class="app-button mt-5 w-full" type="button" data-action="confirm-booking-demo" data-en="Simulate salon confirmation" data-vi="Mô phỏng tiệm xác nhận">Mô phỏng tiệm xác nhận</button>
<button id="booking-calendar" class="app-button-secondary mt-3 hidden w-full" type="button" data-action="add-calendar" data-en="Add to calendar" data-vi="Thêm vào lịch">Thêm vào lịch</button>
```

```html
<p class="mt-4 rounded-xl bg-app-green/5 p-3 text-xs leading-5 text-app-muted" data-en="Earn 15 points for private feedback at any rating. Google sharing is optional and never rewarded." data-vi="Nhận 15 điểm cho phản hồi riêng ở mọi mức sao. Chia sẻ Google là tùy chọn và không được thưởng.">Nhận 15 điểm cho phản hồi riêng ở mọi mức sao. Chia sẻ Google là tùy chọn và không được thưởng.</p>
<button type="button" class="app-button-secondary mt-3 w-full" data-action="open-google-review" data-en="Share on Google (optional · no points)" data-vi="Chia sẻ lên Google (tùy chọn · không điểm)">Chia sẻ lên Google (tùy chọn · không điểm)</button>
```

Replace booking/review handlers:

```js
function setRating(rating) {
  state.ui.rating = Number(rating);
  saveState(state);
  document.querySelectorAll('[data-action="set-rating"]').forEach((button) => {
    const active = Number(button.dataset.rating) <= state.ui.rating;
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('svg, i')?.classList.toggle('fill-current', active);
  });
}

registerAction('set-rating', (control) => setRating(control.dataset.rating));
registerAction('review-booking', () => {
  renderBooking();
  navigateTo('book2');
});
registerAction('confirm-booking', () => {
  state.ui.bookingDraft.note = document.getElementById('booking-note').value.trim();
  const result = commitState((draft) => createBookingRequest(draft, draft.ui.bookingDraft));
  if (!result.ok) return showToast(state.profile.language === 'vi' ? 'Chọn đủ dịch vụ, thợ, ngày và giờ.' : 'Choose service, technician, day and time.', 'error');
  renderBooking();
  navigateTo('book3');
});
registerAction('confirm-booking-demo', () => {
  commitState((draft) => confirmBookingRequest(draft, draft.ui.pendingContext.bookingId));
  renderApp();
  renderBooking();
});
registerAction('add-calendar', () => {
  const booking = state.bookingRequests.find((item) => item.id === state.ui.pendingContext.bookingId);
  const content = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${booking.service} at ${state.businesses[booking.businessId].name}\nDESCRIPTION:${booking.note}\nEND:VEVENT\nEND:VCALENDAR`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/calendar' }));
  link.download = 'nexora-booking.ics';
  link.click();
  URL.revokeObjectURL(link.href);
});
registerAction('submit-review', () => {
  const result = commitState((draft) => submitFeedback(draft, { visitId: 'visit-1001', businessId: BUSINESS_ID, stars: draft.ui.rating, text: document.getElementById('review-notes').value.trim() }));
  if (!result.ok) return showToast(result.code === 'already_submitted' ? (state.profile.language === 'vi' ? 'Lượt ghé này đã gửi phản hồi.' : 'Feedback was already sent for this visit.') : (state.profile.language === 'vi' ? 'Hãy chọn từ 1 đến 5 sao.' : 'Choose 1 to 5 stars.'), 'error');
  renderApp();
  navigateTo('home');
  showToast(state.profile.language === 'vi' ? 'Đã gửi phản hồi riêng và cộng 15 điểm.' : 'Private feedback sent and 15 points added.');
});
registerAction('open-google-review', () => window.open('https://www.google.com/search?q=Bitcoin+Nail+Bar+reviews', '_blank', 'noopener,noreferrer'));
```

Before resolving a generic `data-action` in `handleAction`, persist booking-chip choices with this exact branch:

```js
for (const field of ['service', 'staff', 'day', 'time']) {
  const bookingControl = event.target.closest(`[data-book-${field}]`);
  if (bookingControl) {
    const datasetKey = `book${field[0].toUpperCase()}${field.slice(1)}`;
    commitState((draft) => { draft.ui.bookingDraft[field] = bookingControl.dataset[datasetKey]; });
    selectExclusive(bookingControl, `[data-book-${field}]`);
    return;
  }
}
```

Implement booking renderers and call them from `renderDomainViews()`:

```js
function renderBooking() {
  const draft = state.ui.bookingDraft;
  document.getElementById('booking-service-summary').textContent = draft.service;
  document.getElementById('booking-staff-summary').textContent = draft.staff;
  document.getElementById('booking-time-summary').textContent = `${draft.day} · ${draft.time}`;
  const booking = state.bookingRequests.find((item) => item.id === state.ui.pendingContext.bookingId);
  if (!booking) return;
  const confirmed = booking.status === 'confirmed';
  document.getElementById('booking-pending').classList.toggle('hidden', confirmed);
  document.getElementById('booking-confirmed').classList.toggle('hidden', !confirmed);
  document.getElementById('booking-confirmed').classList.toggle('flex', confirmed);
  document.getElementById('booking-demo-confirm').classList.toggle('hidden', confirmed);
  document.getElementById('booking-calendar').classList.toggle('hidden', !confirmed);
}

function renderAppointment() {
  const container = document.getElementById('home-appointment');
  if (!container) return;
  const appointment = state.appointments.at(-1);
  container.classList.toggle('hidden', !appointment);
  if (appointment) container.querySelector('[data-appointment-copy]').textContent = `${appointment.service} · ${appointment.staff} · ${appointment.day} ${appointment.time}`;
}

function renderFeedback() {
  const alreadySubmitted = state.feedback.some((item) => item.visitId === 'visit-1001');
  const submit = document.querySelector('[data-action="submit-review"]');
  if (!submit) return;
  submit.disabled = alreadySubmitted;
  submit.setAttribute('aria-disabled', String(alreadySubmitted));
  submit.querySelector('span').textContent = alreadySubmitted ? (state.profile.language === 'vi' ? 'Đã gửi phản hồi' : 'Feedback sent') : (state.profile.language === 'vi' ? 'Gửi phản hồi + nhận 15 điểm' : 'Send feedback + earn 15 points');
  setRating(state.ui.rating);
}
```

Add a Home appointment target:

```html
<article id="home-appointment" class="app-card hidden"><p class="eyebrow" data-en="Upcoming appointment" data-vi="Lịch hẹn sắp tới">Lịch hẹn sắp tới</p><strong class="mt-2 block" data-appointment-copy></strong><span class="mt-2 inline-flex rounded-full bg-app-green/10 px-2 py-1 text-xs font-bold text-app-green" data-en="Confirmed" data-vi="Đã xác nhận">Đã xác nhận</span></article>
```

Replace `renderDomainViews()` with the current accumulated list and keep the 31 screen inventory unchanged:

```js
function renderDomainViews() {
  renderProfile();
  renderBalances();
  renderLedger();
  renderRewards();
  renderTipMethods();
  renderTipResult();
  renderPaymentResult();
  renderBooking();
  renderAppointment();
  renderFeedback();
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
createBookingRequest,
confirmBookingRequest,
submitFeedback,
```

- [ ] **Step 4: Run all tests**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; 1-star feedback awards 15 and Google action has no ledger mutation.

- [ ] **Step 5: Commit booking and feedback**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add confirmed bookings and compliant feedback"
```

---

### Task 7: Looks, Offers, Explore và Follow-Tech Persistence

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:119-152,206-219,229-231,243-end`

**Interfaces:**
- Consumes: state store, visits, action registry and shared modal.
- Produces: `saveLookRecord(appState, input, now): Result`
- Produces: `toggleSavedOffer(appState, offerId): boolean`
- Produces: `addWishRecord(appState, text): Result`
- Produces: `removeWishRecord(appState, text): boolean`
- Produces: `canFollowTech(appState, staffProfileId): boolean`
- Produces: `toggleFollowTech(appState, staffProfileId): Result`
- Produces: `createTechMoveNotification(appState, staffProfileId, newBusinessId, now): Result`
- Produces: `renderLooks()`, `renderOffers()`, `renderWishes()`, `renderExplore()`, `renderActivity()`.

- [ ] **Step 1: Add persistence and eligibility tests**

Append:

```js
test('persists looks, saved offers and unique wishes', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.saveLookRecord(app, { businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-anna', staffName: 'Anna', service: 'Pedicure', color: '#710 Sea Glass', note: 'Da nhạy cảm', photoDataUrl: '' }, 1000).ok, true);
  assert.equal(api.toggleSavedOffer(app, 'offer-glow'), true);
  assert.equal(api.toggleSavedOffer(app, 'offer-glow'), false);
  assert.equal(api.addWishRecord(app, 'Pedicure deal').ok, true);
  assert.equal(api.addWishRecord(app, 'pedicure deal').code, 'duplicate');
  assert.equal(app.looks.at(-1).note, 'Da nhạy cảm');
});

test('allows follow-tech only after a shared visit and never stores follower counts', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.canFollowTech(app, 'staff-anna'), true);
  assert.equal(api.canFollowTech(app, 'staff-stranger'), false);
  assert.equal(api.toggleFollowTech(app, 'staff-stranger').code, 'no_shared_visit');
  assert.equal(api.toggleFollowTech(app, 'staff-anna').following, true);
  const before = app.notifications.length;
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 1000).code, 'tech_opted_out');
  app.staffProfiles['staff-anna'].followNotifyOptIn = true;
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 2000).ok, true);
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 3000).code, 'already_notified');
  assert.equal(app.notifications.length, before + 1);
  assert.equal('followerCount' in app, false);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="persists looks|follow-tech only" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because content persistence and follow-tech functions are absent.

- [ ] **Step 3: Implement content domains, photo selection and dynamic cards**

Add pure functions:

```js
function saveLookRecord(appState, input, now = Date.now()) {
  if (![input.service, input.color, input.note, input.photoDataUrl].some((value) => String(value ?? '').trim())) return { ok: false, code: 'empty_look' };
  const look = { id: `look-${crypto.randomUUID()}`, businessId: input.businessId, visitId: input.visitId ?? null, staffProfileId: input.staffProfileId ?? null, staffName: input.staffName ?? '', service: input.service ?? '', color: input.color ?? '', note: input.note ?? '', photoDataUrl: input.photoDataUrl ?? '', createdAt: new Date(now).toISOString() };
  appState.looks.unshift(look);
  return { ok: true, look };
}

function toggleSavedOffer(appState, offerId) {
  const index = appState.savedOfferIds.indexOf(offerId);
  if (index >= 0) { appState.savedOfferIds.splice(index, 1); return false; }
  appState.savedOfferIds.push(offerId);
  return true;
}

function addWishRecord(appState, text) {
  const value = String(text ?? '').trim();
  if (!value) return { ok: false, code: 'empty' };
  if (appState.wishes.some((wish) => wish.toLocaleLowerCase() === value.toLocaleLowerCase())) return { ok: false, code: 'duplicate' };
  appState.wishes.push(value);
  return { ok: true, value };
}

function removeWishRecord(appState, text) {
  const index = appState.wishes.indexOf(text);
  if (index < 0) return false;
  appState.wishes.splice(index, 1);
  return true;
}

function canFollowTech(appState, staffProfileId) {
  return appState.visits.some((visit) => visit.staffProfileId === staffProfileId);
}

function toggleFollowTech(appState, staffProfileId) {
  if (!canFollowTech(appState, staffProfileId)) return { ok: false, code: 'no_shared_visit' };
  const index = appState.followedTechIds.indexOf(staffProfileId);
  if (index >= 0) { appState.followedTechIds.splice(index, 1); return { ok: true, following: false }; }
  appState.followedTechIds.push(staffProfileId);
  return { ok: true, following: true };
}

function createTechMoveNotification(appState, staffProfileId, newBusinessId, now = Date.now()) {
  const staff = appState.staffProfiles[staffProfileId];
  if (!staff) return { ok: false, code: 'unknown_staff' };
  if (!appState.followedTechIds.includes(staffProfileId)) return { ok: false, code: 'not_following' };
  if (!staff.followNotifyOptIn) return { ok: false, code: 'tech_opted_out' };
  const dedupeKey = `tech-move:${staffProfileId}:${newBusinessId}`;
  if (appState.notifications.some((item) => item.dedupeKey === dedupeKey)) return { ok: false, code: 'already_notified' };
  const business = appState.businesses[newBusinessId];
  const notification = { id: `note-${crypto.randomUUID()}`, dedupeKey, type: 'tech_move', title: { vi: `${staff.name} giờ làm tại ${business.name}`, en: `${staff.name} now works at ${business.name}` }, target: 'business', businessId: newBusinessId, read: false, createdAt: new Date(now).toISOString() };
  appState.notifications.unshift(notification);
  return { ok: true, notification };
}
```

Add a hidden file input and preview inside Add Look:

```html
<input id="look-photo-input" class="sr-only" type="file" accept="image/jpeg,image/png" data-look-photo>
<img id="look-photo-preview" class="mt-3 hidden max-h-48 w-full rounded-2xl object-cover" alt="Ảnh kiểu đã chọn">
```

Add an explicit receipt-scanning prototype control to My Looks:

```html
<button type="button" class="app-button-secondary" data-action="scan-receipt"><i data-lucide="scan-text" class="size-4" aria-hidden="true"></i><span data-en="Scan receipt" data-vi="Quét hóa đơn">Quét hóa đơn</span></button>
```

Give offers and businesses stable IDs and actions:

```html
<article class="app-card" data-offer-card data-offer-id="offer-glow" data-category="beauty" data-search="golden glow facial spa">
  <button type="button" class="app-button-secondary" data-action="view-offer" data-offer-id="offer-glow">Xem</button>
  <button type="button" class="app-button-secondary" data-action="save-offer" data-offer-id="offer-glow"><span data-en="Save offer" data-vi="Lưu ưu đãi">Lưu ưu đãi</span></button>
  <button type="button" class="app-button" data-action="use-offer" data-reward-key="glow" data-en="Use offer" data-vi="Dùng ưu đãi">Dùng ưu đãi</button>
</article>
<button class="app-chip" type="button" aria-pressed="false" data-offer-filter="saved" data-en="Saved" data-vi="Đã lưu">Đã lưu</button>
```

```html
<article class="app-card" data-business-card data-business-id="bitcoin-nail-bar" data-category="nail" data-search="bitcoin nail bar gel manicure">
  <button type="button" class="app-button-secondary" data-action="view-business" data-business-id="bitcoin-nail-bar">Xem doanh nghiệp</button>
</article>
<button type="button" class="app-button-secondary" data-action="toggle-favorite" data-favorite-business="bitcoin-nail-bar" aria-pressed="true"><i data-lucide="heart" class="size-4" aria-hidden="true"></i><span data-en="Favorite" data-vi="Yêu thích">Yêu thích</span></button>
```

Replace Activity's static cards with a render target so visit actions and notifications reflect persisted state:

```html
<div id="activity-list" class="space-y-3"></div>
```

Implement image compression and renderers:

```js
function compressImage(file, maxEdge = 720, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('decode_failed'));
      image.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderLooks() {
  const grid = document.getElementById('looks-grid');
  if (!grid) return;
  grid.innerHTML = state.looks.map((look) => {
    const following = state.followedTechIds.includes(look.staffProfileId);
    return `<article class="app-card overflow-hidden p-0">${look.photoDataUrl ? `<img src="${look.photoDataUrl}" alt="${look.color || look.service}" class="aspect-square w-full object-cover">` : '<div class="grid aspect-square place-items-center bg-app-panel"><i data-lucide="image" class="size-8 text-app-muted"></i></div>'}<div class="p-3"><strong class="block text-sm">${look.color || look.service}</strong><p class="mt-1 text-xs text-app-muted">${look.service} · ${look.staffName}</p><div class="mt-3 grid grid-cols-2 gap-2"><button type="button" class="app-button-secondary" data-action="view-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Xem' : 'View'}</button><button type="button" class="app-button-secondary" data-action="rebook-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Đặt lại' : 'Rebook'}</button><button type="button" class="app-button-secondary" data-action="toggle-follow-tech" data-staff-id="${look.staffProfileId}">${following ? (state.profile.language === 'vi' ? 'Đang theo dõi' : 'Following') : (state.profile.language === 'vi' ? 'Theo thợ' : 'Follow tech')}</button><button type="button" class="app-button-secondary" data-action="tip-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Gửi tip' : 'Tip'}</button><button type="button" class="app-button-secondary border-app-red/30 text-app-red" data-action="delete-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Xóa' : 'Delete'}</button></div></div></article>`;
  }).join('');
}

function renderOffers() {
  document.querySelectorAll('[data-offer-id]').forEach((element) => {
    const saved = state.savedOfferIds.includes(element.dataset.offerId);
    if (element.matches('[data-action="save-offer"]')) {
      element.setAttribute('aria-pressed', String(saved));
      element.querySelector('span').textContent = saved ? (state.profile.language === 'vi' ? 'Đã lưu' : 'Saved') : (state.profile.language === 'vi' ? 'Lưu ưu đãi' : 'Save offer');
    }
  });
  filterOffers(document.getElementById('offer-search')?.value ?? '');
}

function renderWishes() {
  const list = document.getElementById('wish-list');
  if (!list) return;
  list.innerHTML = state.wishes.map((wish) => `<li class="flex items-center justify-between gap-3 rounded-xl bg-app-panel p-3"><span>${wish}</span><button type="button" class="icon-button" data-action="remove-wish" data-wish="${wish.replaceAll('"', '&quot;')}" aria-label="${state.profile.language === 'vi' ? 'Xóa mong muốn' : 'Remove wish'}"><i data-lucide="x" class="size-4"></i></button></li>`).join('');
}

function renderExplore() {
  const business = state.businesses[state.ui.selectedBusinessId] ?? state.businesses[BUSINESS_ID];
  const title = document.getElementById('business-title');
  if (title) title.textContent = business.name;
  document.querySelectorAll('[data-favorite-business]').forEach((control) => {
    const favorite = Boolean(state.businesses[control.dataset.favoriteBusiness]?.favorite);
    control.setAttribute('aria-pressed', String(favorite));
    control.querySelector('span').textContent = favorite ? (state.profile.language === 'vi' ? 'Đã yêu thích' : 'Favorite') : (state.profile.language === 'vi' ? 'Thêm yêu thích' : 'Add favorite');
  });
  filterExplore(document.getElementById('explore-search')?.value ?? '');
}

function renderActivity() {
  const list = document.getElementById('activity-list');
  if (!list) return;
  const visitCards = state.visits.map((visit) => {
    const following = state.followedTechIds.includes(visit.staffProfileId);
    return `<article class="app-card"><p class="eyebrow">${state.profile.language === 'vi' ? 'Lượt ghé gần đây' : 'Recent visit'}</p><strong class="mt-2 block">${visit.service} · ${visit.staffName}</strong><button type="button" class="app-button-secondary mt-3" data-action="toggle-follow-tech" data-staff-id="${visit.staffProfileId}">${following ? (state.profile.language === 'vi' ? 'Đang theo dõi thợ' : 'Following tech') : (state.profile.language === 'vi' ? 'Theo dõi thợ này' : 'Follow this tech')}</button></article>`;
  });
  const notifications = state.notifications.map((item) => `<button type="button" class="app-card w-full text-left" data-action="open-notification" data-notification-id="${item.id}"><strong>${typeof item.title === 'object' ? item.title[state.profile.language] : item.title}</strong><p class="mt-1 text-xs text-app-muted">${new Date(item.createdAt).toLocaleString()}</p></button>`);
  list.innerHTML = [...visitCards, ...notifications].join('');
}
```

Update `filterOffers` so `saved` uses `state.savedOfferIds`, and register handlers:

```js
function filterOffers(query = '') {
  const term = query.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('[data-offer-card]').forEach((card) => {
    const id = card.dataset.offerId;
    const categoryMatch = state.ui.offerFilter === 'all' || (state.ui.offerFilter === 'saved' ? state.savedOfferIds.includes(id) : card.dataset.category === state.ui.offerFilter);
    const show = categoryMatch && card.dataset.search.includes(term);
    card.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });
  document.getElementById('offers-empty-state')?.classList.toggle('hidden', visible > 0);
}

registerAction('upload-look', () => document.getElementById('look-photo-input').click());
registerAction('scan-receipt', () => openOverlay({ title: state.profile.language === 'vi' ? 'Quét hóa đơn' : 'Scan receipt', html: state.profile.language === 'vi' ? 'Prototype mô phỏng OCR. Bản thật sẽ mở camera, đọc dịch vụ và giá từ hóa đơn.' : 'This prototype simulates OCR. Production will open the camera and read service and price from the receipt.', hideCancel: true }));
registerAction('save-look', () => {
  const input = { businessId: BUSINESS_ID, visitId: 'visit-1001', staffProfileId: 'staff-anna', staffName: 'Anna', service: document.getElementById('look-service').value.trim(), color: document.getElementById('look-color').value.trim(), note: document.getElementById('look-notes').value.trim(), photoDataUrl: document.getElementById('look-photo-preview').dataset.photo ?? '' };
  let result;
  try {
    result = commitState((draft) => saveLookRecord(draft, input));
  } catch (error) {
    const quotaExceeded = error?.name === 'QuotaExceededError' || error?.code === 22;
    if (!quotaExceeded || !input.photoDataUrl) throw error;
    const savedLook = state.looks[0];
    savedLook.photoDataUrl = '';
    saveState(state);
    result = { ok: true, look: savedLook };
    showToast(state.profile.language === 'vi' ? 'Bộ nhớ ảnh đã đầy; đã lưu thông tin kiểu không kèm ảnh.' : 'Image storage is full; look details were saved without the photo.', 'error');
  }
  if (!result.ok) return showToast(state.profile.language === 'vi' ? 'Thêm ảnh, dịch vụ, màu hoặc ghi chú.' : 'Add a photo, service, color or note.', 'error');
  renderLooks(); navigateTo('looks');
});
registerAction('save-offer', (control) => { const saved = commitState((draft) => toggleSavedOffer(draft, control.dataset.offerId)); renderOffers(); showToast(saved ? (state.profile.language === 'vi' ? 'Đã lưu ưu đãi' : 'Offer saved') : (state.profile.language === 'vi' ? 'Đã bỏ lưu' : 'Offer removed')); });
registerAction('view-offer', (control) => openOverlay({ title: control.closest('[data-offer-card]').querySelector('h2').textContent, html: state.profile.language === 'vi' ? 'Xem điều kiện, thời hạn và business phát hành trước khi dùng.' : 'Review terms, expiry and issuing business before use.', hideCancel: true }));
registerAction('use-offer', (control) => openReward(control.dataset.rewardKey));
registerAction('add-wish', () => { const input = document.getElementById('wish-input'); const result = commitState((draft) => addWishRecord(draft, input.value)); if (!result.ok) return showToast(result.code === 'duplicate' ? (state.profile.language === 'vi' ? 'Mong muốn này đã tồn tại.' : 'This wish already exists.') : (state.profile.language === 'vi' ? 'Hãy nhập mong muốn.' : 'Enter a wish.'), 'error'); input.value = ''; renderWishes(); });
registerAction('remove-wish', (control) => { commitState((draft) => removeWishRecord(draft, control.dataset.wish)); renderWishes(); });
registerAction('toggle-follow-tech', (control) => { const result = commitState((draft) => toggleFollowTech(draft, control.dataset.staffId)); if (!result.ok) return showToast(state.profile.language === 'vi' ? 'Chỉ theo dõi thợ đã từng phục vụ bạn.' : 'You can only follow a tech from a shared visit.', 'error'); renderLooks(); renderActivity(); });
registerAction('view-look', (control) => { const look = state.looks.find((item) => item.id === control.dataset.lookId); openOverlay({ title: look.color || look.service, html: `<p><strong>${look.service}</strong></p><p class="mt-2">${look.note || (state.profile.language === 'vi' ? 'Không có ghi chú.' : 'No note.')}</p><p class="mt-2 text-app-muted">${look.staffName} · ${state.businesses[look.businessId].name}</p>`, hideCancel: true }); });
registerAction('rebook-look', (control) => { const look = state.looks.find((item) => item.id === control.dataset.lookId); state.ui.bookingDraft = { businessId: look.businessId, service: look.service, staff: look.staffName, day: 'Thu 16 Jul', time: '2:00 PM', note: `${look.color} ${look.note}`.trim() }; saveState(state); renderBooking(); navigateTo('book1'); });
registerAction('tip-look', (control) => { const look = state.looks.find((item) => item.id === control.dataset.lookId); state.ui.selectedStaffId = look.staffProfileId; saveState(state); navigateTo('tip'); });
registerAction('delete-look', (control) => openOverlay({ title: state.profile.language === 'vi' ? 'Xóa kiểu này?' : 'Delete this look?', html: state.profile.language === 'vi' ? 'Thao tác chỉ ảnh hưởng dữ liệu mẫu trên thiết bị.' : 'This only changes local demo data.', onConfirm: () => { commitState((draft) => { draft.looks = draft.looks.filter((item) => item.id !== control.dataset.lookId); }); renderLooks(); } }));
registerAction('view-business', (control) => { state.ui.selectedBusinessId = control.dataset.businessId; saveState(state); navigateTo('business'); });
registerAction('toggle-favorite', (control) => { commitState((draft) => { const business = draft.businesses[control.dataset.favoriteBusiness]; business.favorite = !business.favorite; }); renderExplore(); });
registerAction('show-directions', () => window.open('https://www.google.com/maps/search/?api=1&query=Bitcoin+Nail+Bar+Houston', '_blank', 'noopener,noreferrer'));
registerAction('open-notification', (control) => {
  const notification = state.notifications.find((item) => item.id === control.dataset.notificationId);
  if (!notification) return;
  commitState((draft) => { const current = draft.notifications.find((item) => item.id === notification.id); current.read = true; if (notification.businessId) draft.ui.selectedBusinessId = notification.businessId; });
  renderGlobalState();
  navigateTo(notification.target || 'activity');
});
```

Before generic `data-action` resolution in `handleAction`, restore filter behavior with exact state fields:

```js
const exploreFilter = event.target.closest('[data-explore-filter]');
if (exploreFilter) {
  commitState((draft) => { draft.ui.exploreFilter = exploreFilter.dataset.exploreFilter; });
  selectExclusive(exploreFilter, '[data-explore-filter]');
  filterExplore(document.getElementById('explore-search').value);
  return;
}
const offerFilter = event.target.closest('[data-offer-filter]');
if (offerFilter) {
  commitState((draft) => { draft.ui.offerFilter = offerFilter.dataset.offerFilter; });
  selectExclusive(offerFilter, '[data-offer-filter]');
  filterOffers(document.getElementById('offer-search').value);
  return;
}
```

Replace `filterExplore` state access with `state.ui.exploreFilter`:

```js
const categoryMatch = state.ui.exploreFilter === 'all' || card.dataset.category.split(' ').includes(state.ui.exploreFilter);
```

Make `handleChange` asynchronous and put this photo branch before the preference branches:

```js
async function handleChange(event) {
  if (event.target.matches('[data-look-photo]')) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      const preview = document.getElementById('look-photo-preview');
      preview.src = dataUrl;
      preview.dataset.photo = dataUrl;
      preview.classList.remove('hidden');
    } catch {
      showToast(state.profile.language === 'vi' ? 'Không thể đọc ảnh này.' : 'Could not read this image.', 'error');
    }
    return;
  }
  if (event.target.id === 'tip-recipient') {
    commitState((draft) => { draft.ui.selectedStaffId = event.target.value; });
    renderTipMethods();
    return;
  }
  const businessPref = event.target.closest('[data-business-pref]');
  if (businessPref) {
    commitState((draft) => setBusinessMarketing(draft, businessPref.dataset.businessPref, businessPref.checked));
    renderPreferences();
    showToast(state.profile.language === 'vi' ? 'Đã lưu tùy chọn doanh nghiệp.' : 'Business preference saved.');
    return;
  }
  const pref = event.target.closest('[data-pref]');
  if (!pref) return;
  commitState((draft) => setPreference(draft, pref.dataset.pref, pref.checked));
  renderPreferences();
  showToast(state.profile.language === 'vi' ? 'Đã lưu tùy chọn' : 'Preference saved');
}
```

Replace `renderDomainViews()` with the accumulated renderer list:

```js
function renderDomainViews() {
  renderProfile();
  renderBalances();
  renderLedger();
  renderRewards();
  renderTipMethods();
  renderTipResult();
  renderPaymentResult();
  renderBooking();
  renderAppointment();
  renderFeedback();
  renderLooks();
  renderOffers();
  renderWishes();
  renderExplore();
  renderActivity();
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
saveLookRecord,
toggleSavedOffer,
addWishRecord,
removeWishRecord,
canFollowTech,
toggleFollowTech,
createTechMoveNotification,
```

- [ ] **Step 4: Run all tests**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; the customer side contains no hiring/profile marketplace data.

- [ ] **Step 5: Commit persisted content and follow-tech**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: persist customer looks offers and follows"
```

---

### Task 8: Action Audit, Bilingual Dynamic Copy và Final Responsive Verification

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:1-end`

**Interfaces:**
- Consumes: every action and renderer from Tasks 1–7.
- Produces: a complete action registry with no enabled silent controls.
- Produces: final verified mobile bottom navigation and desktop sidebar behavior.
- Produces: `parseNexoraQr(payload): Result`, `submitCheckin(appState, payload, online, now): Result`, `retryQueuedCheckins(appState, online, now): Result`.

- [ ] **Step 1: Add final cross-screen contract tests**

Append:

```js
test('maps every declared data-action to a registered handler', () => {
  const source = html();
  const declared = new Set([...source.matchAll(/data-action="([^"]+)"/g)].map((match) => match[1]));
  const registered = new Set([...source.matchAll(/registerAction\('([^']+)'/g)].map((match) => match[1]));
  const missing = [...declared].filter((name) => !registered.has(name));
  assert.deepEqual(missing, []);
});

test('keeps all screen and back targets valid', () => {
  const source = html();
  const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, target] of source.matchAll(/data-(?:target|back-target)="([^"]+)"/g)) {
    assert.ok(ids.has(target), `missing target #${target}`);
  }
});

test('contains persistence, transaction and customer marketplace contracts', () => {
  const source = html();
  for (const token of ['nexora.customer.prototype.v1', 'confirmTipRecord', 'confirmDirectPayment', 'confirmBookingRequest', 'submitFeedback', 'toggleFollowTech']) assert.match(source, new RegExp(token));
  assert.doesNotMatch(source, /followerCount|followerList|Interview Invite|Find Work/);
  assert.doesNotMatch(source, /const state = \{\s*activeScreen/);
  assert.doesNotMatch(source, /state\.(?:language|activeScreen|activeModule|pointBalance|savedOffers|booking|rating)\b/);
});

test('removes obsolete pre-localStorage action functions', () => {
  const source = html();
  for (const name of ['startScan', 'selectTip', 'sendTip', 'confirmTip', 'sendPayment', 'confirmPayment', 'confirmReward', 'saveOffer', 'addWish', 'saveLook', 'submitReview', 'reviewBooking', 'confirmBooking']) {
    assert.doesNotMatch(source, new RegExp(`function ${name}\\(`));
  }
});

test('keeps platform stubs responsive instead of silently succeeding', () => {
  const source = html();
  for (const action of ['start-scan', 'enter-code', 'scan-receipt', 'show-directions', 'open-google-review', 'payment-methods', 'privacy-details']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
  assert.match(source, /catch\s*\{/);
});

test('queues offline QR check-in and awards points after retry with scan timestamp', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const queued = api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', false, 1000);
  assert.equal(queued.checkin.status, 'queued');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  api.retryQueuedCheckins(app, true, 5000);
  assert.equal(queued.checkin.status, 'confirmed');
  assert.equal(queued.checkin.scannedAt, new Date(1000).toISOString());
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 120);
  assert.equal(api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', true, 6000).code, 'duplicate_checkin');
});
```

- [ ] **Step 2: Run the final suite and fix every reported contract gap**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected before the cleanup: FAIL only for action names still present in markup but not registered. Do not weaken the test; register each missing action or disable the control with a visible explanation.

- [ ] **Step 3: Complete remaining external-integration actions and bilingual render pass**

Add production-format QR parsing and offline queue functions, then expose `parseNexoraQr`, `submitCheckin` and `retryQueuedCheckins` through `window.NEXORA_TEST_API`:

```js
function parseNexoraQr(payload) {
  try {
    const url = new URL(payload);
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname !== 'nexoratouch.com' || parts[0] !== 'touch' || parts.length < 3) return { ok: false, code: 'invalid_qr' };
    return { ok: true, businessId: parts[1], station: parts[2], staffProfileId: url.searchParams.get('staffProfileId') || null };
  } catch {
    return { ok: false, code: 'invalid_qr' };
  }
}

function completeCheckin(appState, checkin, now = Date.now()) {
  if (checkin.status === 'confirmed') return { ok: true, checkin, idempotent: true };
  checkin.status = 'confirmed';
  checkin.confirmedAt = new Date(now).toISOString();
  const business = appState.businesses[checkin.businessId];
  appendLedger(appState, { businessId: checkin.businessId, type: 'visit', pointsDelta: business.checkinPoints, refType: 'checkin', refId: checkin.id, now: new Date(checkin.scannedAt).getTime() });
  return { ok: true, checkin, points: business.checkinPoints, idempotent: false };
}

function submitCheckin(appState, payload, online = true, now = Date.now()) {
  const parsed = parseNexoraQr(payload);
  if (!parsed.ok || !appState.businesses[parsed.businessId]) return { ok: false, code: 'invalid_qr' };
  const duplicate = appState.checkins.some((item) => item.businessId === parsed.businessId && now - new Date(item.scannedAt).getTime() < 120 * 60 * 1000);
  if (duplicate) return { ok: false, code: 'duplicate_checkin' };
  const checkin = { id: `checkin-${crypto.randomUUID()}`, businessId: parsed.businessId, station: parsed.station, staffProfileId: parsed.staffProfileId, sourceQr: payload, scannedAt: new Date(now).toISOString(), status: online ? 'sending' : 'queued', confirmedAt: null };
  appState.checkins.push(checkin);
  if (!online) { appState.offlineQueue.push(checkin.id); return { ok: true, checkin, queued: true }; }
  return completeCheckin(appState, checkin, now);
}

function retryQueuedCheckins(appState, online = true, now = Date.now()) {
  if (!online) return { ok: false, code: 'offline', retried: 0 };
  const ids = [...appState.offlineQueue];
  let retried = 0;
  for (const id of ids) {
    const checkin = appState.checkins.find((item) => item.id === id);
    if (checkin && checkin.status === 'queued') { completeCheckin(appState, checkin, now); retried += 1; }
  }
  appState.offlineQueue = appState.offlineQueue.filter((id) => !ids.includes(id));
  return { ok: true, retried };
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
parseNexoraQr,
submitCheckin,
retryQueuedCheckins,
```

Register the remaining prototype integrations with explicit feedback:

```js
registerAction('start-scan', () => {
  const line = document.getElementById('scan-line');
  const loading = document.getElementById('scan-loading-state');
  line.classList.remove('hidden');
  loading.classList.remove('hidden');
  window.setTimeout(() => {
    line.classList.add('hidden');
    loading.classList.add('hidden');
    const result = commitState((draft) => submitCheckin(draft, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', navigator.onLine));
    if (!result.ok) return showToast(result.code === 'duplicate_checkin' ? (state.profile.language === 'vi' ? 'Bạn vừa check-in tại đây; vui lòng thử lại sau.' : 'You recently checked in here; try again later.') : (state.profile.language === 'vi' ? 'Mã QR không hợp lệ.' : 'Invalid QR code.'), 'error');
    renderApp();
    if (result.queued) showToast(state.profile.language === 'vi' ? 'Mạng yếu — check-in đang chờ gửi lại.' : 'Weak connection — check-in queued for retry.');
    else showToast(state.profile.language === 'vi' ? 'Check-in thành công và đã cộng điểm.' : 'Check-in complete and points added.');
    navigateTo('home');
  }, 900);
});
registerAction('enter-code', () => navigateTo('onb1'));
registerAction('simulate-geo-push', () => { commitState((draft) => draft.notifications.unshift({ id: `note-${crypto.randomUUID()}`, type: 'nearby', title: { vi: 'Golden Glow Spa ở gần bạn', en: 'Golden Glow Spa is nearby' }, target: 'business', businessId: 'golden-glow-spa', read: false, createdAt: new Date().toISOString() })); renderGlobalState(); showToast(state.profile.language === 'vi' ? 'Đã tạo thông báo ưu đãi gần bạn.' : 'Nearby-offer notification created.'); });
registerAction('simulate-wish-push', () => { commitState((draft) => draft.notifications.unshift({ id: `note-${crypto.randomUUID()}`, type: 'wish_match', title: { vi: 'Có ưu đãi mới khớp mong muốn', en: 'A new offer matches your wish' }, target: 'offers', read: false, createdAt: new Date().toISOString() })); renderGlobalState(); showToast(state.profile.language === 'vi' ? 'Đã mô phỏng ưu đãi phù hợp.' : 'Matching offer simulated.'); });
registerAction('copy-referral', async () => {
  const url = `https://nexora.example/invite/${state.profile.referralCode}`;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    else {
      const input = document.createElement('textarea'); input.value = url; document.body.append(input); input.select();
      if (!document.execCommand('copy')) throw new Error('copy_failed');
      input.remove();
    }
    showToast(state.profile.language === 'vi' ? 'Đã sao chép liên kết.' : 'Invite link copied.');
  } catch {
    showToast(state.profile.language === 'vi' ? 'Không thể sao chép. Hãy chọn và sao chép thủ công.' : 'Could not copy. Please copy it manually.', 'error');
  }
});
```

Delete the obsolete function declarations named by the `removes obsolete pre-localStorage action functions` test. Replace the old three-argument `selectExclusive` with this stateless helper, because domain state is already committed in the filter, payment and booking branches:

```js
function selectExclusive(control, selector) {
  document.querySelectorAll(selector).forEach((button) => button.setAttribute('aria-pressed', String(button === control)));
}
```

In the existing `implements delegated interactions for the complete prototype` test, replace its old function-name array with the final architecture list:

```js
const functions = [
  'createDefaultState', 'migrateState', 'loadState', 'saveState',
  'navigateTo', 'setLanguage', 'showToast', 'openOverlay', 'closeOverlay',
  'renderApp', 'requestOtp', 'verifyOtp', 'recordConsent',
  'appendLedger', 'redeemReward', 'createTip', 'confirmTipRecord',
  'createDirectPayment', 'confirmDirectPayment', 'createBookingRequest',
  'confirmBookingRequest', 'submitFeedback', 'saveLookRecord',
  'toggleSavedOffer', 'addWishRecord', 'toggleFollowTech', 'submitCheckin'
];
```

Add the online retry listener inside `initializeApp()` after the document listeners:

```js
window.addEventListener('online', () => {
  const result = commitState((draft) => retryQueuedCheckins(draft, true));
  if (result.retried > 0) {
    renderApp();
    showToast(state.profile.language === 'vi' ? `Đã gửi lại ${result.retried} check-in.` : `${result.retried} queued check-in(s) sent.`);
  }
});
```

Update `setLanguage` to persist `state.profile.language`, then call `renderApp()` and restore the active screen:

```js
function setLanguage(language) {
  commitState((draft) => { draft.profile.language = language === 'en' ? 'en' : 'vi'; });
  document.querySelectorAll('[data-en][data-vi]').forEach((element) => { element.textContent = element.dataset[state.profile.language]; });
  document.querySelectorAll('[data-en-ph][data-vi-ph]').forEach((element) => { element.placeholder = element.dataset[`${state.profile.language}Ph`]; });
  renderApp();
  navigateTo(state.ui.activeScreen, { focus: false });
}
```

Update `navigateTo` to persist `ui.activeScreen` and `ui.activeModule`, and ensure `renderActivity()` routes notification taps through their saved target:

```js
function navigateTo(screenId, options = {}) {
  const next = document.getElementById(screenId) || document.getElementById('home');
  document.querySelectorAll('.app-screen').forEach((screen) => { const active = screen === next; screen.classList.toggle('hidden', !active); screen.classList.toggle('is-active', active); });
  state.ui.activeScreen = next.id;
  state.ui.activeModule = SCREEN_MODULE[next.id] || 'home';
  saveState(state);
  updateNavigation();
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (options.focus !== false) document.getElementById('screen-region').focus({ preventScroll: true });
}
```

Add `data-action="enter-code"` to the manual-code Scan button, and add explicit simulate buttons to Explore/Offers using `simulate-geo-push` and `simulate-wish-push`. Ensure every generated dynamic button uses an action already registered before re-running the contract test.

Update the Referral explanatory copy to the paid-visit rule:

```html
<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-white/75" data-en="Your friend receives points from the first business they check in at. Your reward is released after their first paid visit." data-vi="Bạn bè nhận điểm từ doanh nghiệp đầu tiên họ check-in. Điểm của bạn chỉ được cộng sau lượt ghé có thanh toán đầu tiên của họ.">Bạn bè nhận điểm từ doanh nghiệp đầu tiên họ check-in. Điểm của bạn chỉ được cộng sau lượt ghé có thanh toán đầu tiên của họ.</p>
```

- [ ] **Step 4: Run automated and browser smoke verification**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS with exit code 0.

Run:

```bash
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: no output and exit code 0.

Start the static server:

```bash
python3 -m http.server 8124 --directory html
```

Open `http://127.0.0.1:8124/customer/cutomer-reward.html` and verify:

- Mobile 390×844: Scan button is raised and does not cover content; bottom safe-area padding is visible.
- Desktop 1440×900: bottom nav is hidden, sidebar is visible, all five roots navigate.
- Console: no JavaScript, Tailwind unknown-utility or Lucide errors.
- Reload after saving a wish, offer and preference: changes remain.
- Tip/pay/booking: pending balance is unchanged; demo confirmation updates the correct business balance exactly once.
- Feedback at 1 star: adds 15 points exactly once.
- Logout: returns to `login1` while wallet data remains.

Stop the server with `Ctrl-C` after verification.

- [ ] **Step 5: Commit the verified complete prototype**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "test: verify complete customer reward prototype"
```

---

## Completion Checklist

- [ ] `node --test html/customer/cutomer-reward.test.mjs` exits 0.
- [ ] `git diff --check` exits 0 for both implementation files.
- [ ] Exactly 31 `.app-screen` sections remain.
- [ ] Every enabled button has a real handler or valid navigation target.
- [ ] `localStorage` reload preserves all approved state categories.
- [ ] No transaction adds points while pending.
- [ ] No cross-business balance is accidentally mutated.
- [ ] No owner/staff hiring marketplace UI appears in customer app.
- [ ] Mobile and desktop navigation both pass visual smoke verification.
