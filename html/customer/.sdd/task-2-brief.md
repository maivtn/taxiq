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

