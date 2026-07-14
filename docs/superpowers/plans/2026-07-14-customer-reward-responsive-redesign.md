# Customer Reward Responsive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo `html/customer/cutomer-reward.html` thành ứng dụng Customer Reward responsive có đủ 31 màn, giữ các luồng demo hiện tại, dùng bottom navigation trên mobile/tablet và sidebar trên desktop.

**Architecture:** Sản phẩm là một file HTML độc lập dùng Tailwind CSS v4 Browser CDN, Lucide Browser CDN và JavaScript thuần. UI dùng một state object, một map screen-to-module, event delegation và các component class Tailwind dùng chung; test contract bằng Node.js built-in test runner và kiểm tra browser trên local static server.

**Tech Stack:** HTML5, Tailwind CSS v4 Browser CDN, Lucide Browser CDN, JavaScript ES2020, Node.js `node:test`, local static server.

## Global Constraints

- Chỉ tạo sản phẩm mới tại `html/customer/cutomer-reward.html`; không sửa `html/customer/customer-app-prototype.html`.
- Giữ đủ 31 screen ID trong `html/customer/customer-app-developer-spec.md`.
- Mobile dưới 768px dùng một cột và bottom navigation; tablet 768–1023px vẫn dùng bottom navigation; desktop từ 1024px dùng sidebar cố định khoảng 248px.
- Giữ bảng màu gần đen, tím, hồng, cyan, xanh lá, vàng và đỏ đã duyệt.
- Dùng Tailwind CSS v4 Browser CDN và Lucide Browser CDN; không dùng Bootstrap, Bootstrap Icons hoặc Font Awesome.
- Giữ đầy đủ nội dung EN/VI và chuyển ngôn ngữ không reload.
- Không thêm backend, authentication service, persistence hoặc payment integration thật.
- Control tương tác có vùng chạm tối thiểu 44px khi phù hợp, focus rõ, accessible label và hỗ trợ `prefers-reduced-motion`.
- File phải chạy qua static server hiện có mà không cần build.

---

## File Structure

- Create: `html/customer/cutomer-reward.html` — toàn bộ shell responsive, 31 màn, theme, component và logic demo.
- Create: `html/customer/cutomer-reward.test.mjs` — contract test cho dependency, screen inventory, responsive shell, translation, accessibility và JavaScript API.
- Reference only: `html/customer/customer-app-prototype.html` — nguồn nội dung và hành vi demo hiện có.
- Reference only: `html/customer/customer-app-developer-spec.md` — nguồn screen inventory, mapping và quy tắc nghiệp vụ.

---

### Task 1: Contract Test Và HTML Foundation

**Files:**
- Create: `html/customer/cutomer-reward.test.mjs`
- Create: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: Node.js built-in `node:test`, `node:assert/strict`, `node:fs`, `node:path`.
- Produces: HTML có `#app-shell`, `#screen-region`, Tailwind Browser CDN, Lucide Browser CDN và theme token nền tảng.

- [ ] **Step 1: Viết contract test đầu tiên để yêu cầu file và dependency**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, 'cutomer-reward.html');

function html() {
  assert.ok(existsSync(target), 'cutomer-reward.html must exist');
  return readFileSync(target, 'utf8');
}

test('loads the approved frontend stack', () => {
  const source = html();
  assert.match(source, /@tailwindcss\/browser@4/);
  assert.match(source, /lucide(?:\.min)?\.js|unpkg\.com\/lucide/);
  assert.doesNotMatch(source, /bootstrap|font-awesome|fontawesome/i);
  assert.match(source, /id="app-shell"/);
  assert.match(source, /id="screen-region"/);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại vì file chưa tồn tại**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: FAIL với `cutomer-reward.html must exist`.

- [ ] **Step 3: Tạo HTML foundation tối thiểu**

```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#070816">
  <title>NEXORA TOUCH — Customer Rewards</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style type="text/tailwindcss">
    @theme {
      --color-app-bg: #070816;
      --color-app-panel: #0d1024;
      --color-app-card: #12162f;
      --color-app-line: #252c51;
      --color-app-text: #f7f7ff;
      --color-app-muted: #9da6c9;
      --color-app-purple: #7c3dff;
      --color-app-pink: #d946ef;
      --color-app-cyan: #22d3ee;
      --color-app-green: #34d399;
      --color-app-gold: #fbbf24;
      --color-app-red: #fb7185;
    }
    @layer base {
      html { color-scheme: dark; }
      body { @apply m-0 min-h-dvh bg-app-bg text-app-text antialiased; }
      button, input, select, textarea { font: inherit; }
    }
  </style>
</head>
<body>
  <div id="app-shell" class="min-h-dvh">
    <main id="screen-region" tabindex="-1"></main>
  </div>
  <script>
    if (window.lucide) window.lucide.createIcons();
  </script>
</body>
</html>
```

- [ ] **Step 4: Chạy test để xác nhận foundation pass**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: PASS `loads the approved frontend stack`.

- [ ] **Step 5: Commit foundation**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: scaffold responsive customer reward app"
```

---

### Task 2: Responsive Shell, Navigation Và 31-Screen Inventory

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: `#app-shell`, `#screen-region` từ Task 1.
- Produces: `SCREEN_MODULE`, `navigateTo(screenId)`, `#desktop-sidebar`, `#mobile-nav` và 31 section `.app-screen`.

- [ ] **Step 1: Thêm test cho inventory và hai dạng navigation**

```js
const requiredScreens = [
  'login1', 'login2', 'onb1', 'onb2', 'onb3', 'onb4', 'home', 'allmenu',
  'activity', 'wallet', 'history', 'rewards', 'redeem', 'redeemdone', 'scan',
  'tip', 'tipdone', 'pay', 'paydone', 'looks', 'addlook', 'review', 'book1',
  'book2', 'book3', 'explore', 'business', 'offers', 'referral', 'profile',
  'msgprefs'
];

function screenIds(source) {
  return [...source.matchAll(/<section\b[^>]*class="[^"]*\bapp-screen\b[^"]*"[^>]*>/g)]
    .map(([tag]) => tag.match(/\bid="([^"]+)"/)?.[1])
    .filter(Boolean);
}

test('contains the exact 31-screen inventory', () => {
  const ids = screenIds(html()).sort();
  assert.deepEqual(ids, [...requiredScreens].sort());
});

test('provides mobile bottom navigation and desktop sidebar', () => {
  const source = html();
  assert.match(source, /id="mobile-nav"[^>]*class="[^"]*lg:hidden/);
  assert.match(source, /id="desktop-sidebar"[^>]*class="[^"]*hidden[^"]*lg:flex/);
  assert.match(source, /const SCREEN_MODULE\s*=/);
  assert.match(source, /function navigateTo\(screenId/);
});
```

- [ ] **Step 2: Chạy test để xác nhận thiếu inventory và navigation**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: 1 test cũ PASS, 2 test mới FAIL.

- [ ] **Step 3: Tạo shell responsive và navigation markup**

```html
<div id="app-shell" class="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
  <aside id="desktop-sidebar" class="hidden min-h-dvh border-r border-app-line bg-app-panel lg:sticky lg:top-0 lg:flex lg:flex-col">
    <div class="px-6 py-7"><span class="text-lg font-black">NEXORA TOUCH</span></div>
    <nav aria-label="Điều hướng chính" class="px-3" data-nav-surface="desktop"></nav>
  </aside>
  <div class="min-w-0">
    <header id="mobile-header" class="sticky top-0 z-40 border-b border-app-line bg-app-bg/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur lg:hidden"></header>
    <main id="screen-region" class="mx-auto w-full max-w-[1200px] px-4 pb-[calc(6.75rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-8 lg:pb-10" tabindex="-1">
      <!-- 31 section elements are inserted here in the exact requiredScreens order. -->
    </main>
  </div>
  <nav id="mobile-nav" class="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-app-line bg-app-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Điều hướng chính" data-nav-surface="mobile"></nav>
</div>
```

Mỗi section dùng đúng cấu trúc sau, thay `SCREEN_ID` bằng từng giá trị trong `requiredScreens`; chỉ `home` có thêm `is-active`, các section còn lại thêm `hidden`:

```html
<section class="app-screen is-active" id="home" data-module="home" aria-labelledby="home-title"></section>
<section class="app-screen hidden" id="wallet" data-module="wallet" aria-labelledby="wallet-title"></section>
```

- [ ] **Step 4: Thêm map và hàm điều hướng dùng chung**

```js
const SCREEN_MODULE = {
  home:'home', allmenu:'home', activity:'home', tip:'home', tipdone:'home',
  pay:'home', paydone:'home', looks:'home', addlook:'home', review:'home',
  offers:'home', book1:'home', book2:'home', book3:'home', login1:'home', login2:'home',
  wallet:'wallet', history:'wallet', rewards:'wallet', redeem:'wallet', redeemdone:'wallet',
  scan:'scan', onb1:'scan', onb2:'scan', onb3:'scan', onb4:'scan',
  explore:'explore', business:'explore',
  profile:'profile', referral:'profile', msgprefs:'profile'
};

const ROOT_SCREENS = ['home', 'wallet', 'scan', 'explore', 'profile'];

function navigateTo(screenId, options = {}) {
  const next = document.getElementById(screenId) || document.getElementById('home');
  document.querySelectorAll('.app-screen').forEach((screen) => {
    const active = screen === next;
    screen.classList.toggle('hidden', !active);
    screen.classList.toggle('is-active', active);
  });
  state.activeScreen = next.id;
  state.activeModule = SCREEN_MODULE[next.id] || 'home';
  updateNavigation();
  next.scrollTop = 0;
  if (options.focus !== false) document.getElementById('screen-region').focus({ preventScroll: true });
}
```

- [ ] **Step 5: Chạy test để xác nhận inventory và navigation pass**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: 3 tests PASS.

- [ ] **Step 6: Commit responsive shell**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add responsive customer reward shell"
```

---

### Task 3: Shared Visual System Và Năm Root Screens

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: 31 section, navigation shell và `navigateTo()` từ Task 2.
- Produces: component class `.app-card`, `.app-button`, `.app-input`, `.app-chip`; hoàn thiện `home`, `wallet`, `scan`, `explore`, `profile`.

- [ ] **Step 1: Thêm test cho component và root screen content**

```js
test('defines shared visual components and completes five root screens', () => {
  const source = html();
  for (const className of ['app-card', 'app-button', 'app-input', 'app-chip']) {
    assert.match(source, new RegExp(`\\.${className}\\s*\\{`));
  }
  for (const id of ['home', 'wallet', 'scan', 'explore', 'profile']) {
    assert.match(source, new RegExp(`<section[^>]+id="${id}"[^>]+data-ready="true"`));
  }
  assert.doesNotMatch(source, /class="[^"]*\b(phone|notch|status)\b/);
});
```

- [ ] **Step 2: Chạy test để xác nhận root screen chưa hoàn thiện**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: FAIL tại test `defines shared visual components and completes five root screens`.

- [ ] **Step 3: Tạo component class dùng chung**

```css
@layer components {
  .app-card { @apply rounded-2xl border border-app-line bg-app-card p-4 shadow-[0_16px_40px_rgba(0,0,0,.18)]; }
  .app-button { @apply inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-app-purple to-app-pink px-4 py-3 text-sm font-extrabold text-white transition active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-cyan disabled:cursor-not-allowed disabled:opacity-50; }
  .app-button-secondary { @apply app-button border border-app-line bg-none bg-app-panel text-app-text shadow-none; }
  .app-input { @apply min-h-11 w-full rounded-xl border border-app-line bg-app-panel px-3.5 py-3 text-sm text-app-text outline-none placeholder:text-app-muted focus:border-app-cyan focus:ring-2 focus:ring-app-cyan/20; }
  .app-chip { @apply inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-app-line bg-app-card px-4 text-xs font-bold text-app-muted transition hover:border-app-purple hover:text-white aria-pressed:border-transparent aria-pressed:bg-app-purple aria-pressed:text-white; }
  .icon-button { @apply inline-grid size-11 place-items-center rounded-xl border border-app-line bg-app-card text-app-muted hover:text-white focus-visible:outline-2 focus-visible:outline-app-cyan; }
  .section-title { @apply text-base font-extrabold tracking-tight sm:text-lg; }
}
```

- [ ] **Step 4: Hoàn thiện năm root screen bằng dữ liệu thực tế**

Chuyển nội dung từ các vùng tham chiếu sau và đổi sang component mới:

- `home`: prototype dòng 196–268; balance hero, quick actions, upcoming appointment, activity và offer nổi bật.
- `explore`: dòng 269–390; search, filter, business list, proof metrics và ảnh doanh nghiệp.
- `wallet`: dòng 391–424; số dư tách theo business, expiry warning và lịch sử gần đây.
- `scan`: dòng 509–529; camera scan surface, trạng thái idle/scanning/success và manual code action.
- `profile`: dòng 813–837; customer identity, language, message preferences, referral và logout.

Ảnh dùng URL cố định và có `alt` có nghĩa:

```html
<img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80" alt="Không gian salon Golden Glow" class="h-full w-full object-cover">
<img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80" alt="Quầy cà phê Moon Coffee" class="h-full w-full object-cover">
```

Mỗi root section thêm `data-ready="true"`, heading có ID tương ứng như `home-title`, và mọi action dùng `data-action` thay vì inline `onclick`.

- [ ] **Step 5: Chạy contract test**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: 4 tests PASS.

- [ ] **Step 6: Commit visual system và root screens**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: build customer reward root screens"
```

---

### Task 4: Hoàn Thiện 26 Detail Screens

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: component class và năm root screen từ Task 3.
- Produces: 26 detail section có nội dung thực, heading, Back target và action control.

- [ ] **Step 1: Thêm test để cấm section rỗng và yêu cầu 26 màn detail hoàn thiện**

```js
const detailScreens = [
  'login1', 'login2', 'onb1', 'onb2', 'onb3', 'onb4', 'allmenu', 'activity',
  'history', 'rewards', 'redeem', 'redeemdone', 'tip', 'tipdone', 'pay', 'paydone',
  'looks', 'addlook', 'review', 'book1', 'book2', 'book3', 'business', 'offers',
  'referral', 'msgprefs'
];

test('completes every detail screen', () => {
  const source = html();
  for (const id of detailScreens) {
    assert.match(source, new RegExp(`<section[^>]+id="${id}"[^>]+data-ready="true"`));
    assert.match(source, new RegExp(`id="${id}-title"`));
  }
  assert.equal((source.match(/data-ready="true"/g) || []).length, 31);
});
```

- [ ] **Step 2: Chạy test để xác nhận 26 detail screen chưa hoàn thiện**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: FAIL tại screen detail đầu tiên chưa có `data-ready="true"`.

- [ ] **Step 3: Port nhóm Wallet và Rewards**

Hoàn thiện từ prototype: `rewards` dòng 425–477, `redeem` 743–763, `redeemdone` 764–782, `history` 1145–1168. Mỗi reward action dùng `data-action="open-reward" data-reward-key="..."`; confirm dùng `data-action="confirm-reward"`.

- [ ] **Step 4: Port nhóm Discovery và Engagement**

Hoàn thiện: `business` 478–508, `looks` 631–692, `addlook` 693–721, `review` 722–742, `activity` 783–812, `offers` 913–995, `allmenu` 1205–1229. Search/filter dùng input có label, offer có save state, Looks dùng ảnh và form thực tế.

- [ ] **Step 5: Port nhóm Transaction**

Hoàn thiện: `tip` 530–556, `tipdone` 557–582, `pay` 583–604, `paydone` 605–630. Giữ nguyên nguyên tắc tiền đi trực tiếp tới business/staff, pending trước confirmed và chỉ cộng điểm sau confirmed.

- [ ] **Step 6: Port Auth và Onboarding**

Hoàn thiện: `onb1` 838–860, `onb2` 861–880, `onb3` 881–898, `onb4` 899–912, `login1` 1111–1127, `login2` 1128–1144. Giữ double opt-in, consent không phải điều kiện nhận điểm và luồng OTP.

- [ ] **Step 7: Port Booking và Profile detail**

Hoàn thiện: `book1` 1030–1064, `book2` 1065–1086, `book3` 1087–1110, `referral` 996–1029, `msgprefs` 1169–1204. Booking giữ request/pending/confirmed; messaging giữ toggle consent độc lập.

Mọi detail screen dùng header chuẩn:

```html
<div class="mb-5 flex items-center gap-3">
  <button class="icon-button" type="button" data-action="back" data-back-target="home" aria-label="Quay lại">
    <i data-lucide="arrow-left" aria-hidden="true"></i>
  </button>
  <div>
    <p class="text-xs font-bold uppercase tracking-[.18em] text-app-muted" data-en="Rewards" data-vi="Phần thưởng">Phần thưởng</p>
    <h1 id="rewards-title" class="text-2xl font-black tracking-tight" data-en="Redeem rewards" data-vi="Đổi phần thưởng">Đổi phần thưởng</h1>
  </div>
</div>
```

- [ ] **Step 8: Chạy contract test**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: 5 tests PASS và đếm đúng `data-ready="true"` bằng 31.

- [ ] **Step 9: Commit detail screens**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: complete customer reward screen inventory"
```

---

### Task 5: State, Event Delegation Và Các Luồng Tương Tác

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: `SCREEN_MODULE`, `navigateTo()` và markup `data-action` từ Task 2–4.
- Produces: `state`, `handleAction(event)`, `setLanguage(lang)`, overlay/toast API và handler cho mọi flow chính.

- [ ] **Step 1: Thêm test cho API tương tác bắt buộc và cấm inline handler**

```js
const requiredFunctions = [
  'navigateTo', 'setLanguage', 'showToast', 'openOverlay', 'closeOverlay',
  'startScan', 'selectTip', 'sendTip', 'confirmTip', 'sendPayment',
  'confirmPayment', 'openReward', 'confirmReward', 'filterExplore',
  'filterOffers', 'saveOffer', 'addWish', 'saveLook', 'setRating',
  'submitReview', 'reviewBooking', 'confirmBooking'
];

test('exposes maintainable interaction modules through event delegation', () => {
  const source = html();
  for (const fn of requiredFunctions) {
    assert.match(source, new RegExp(`function ${fn}\\(`));
  }
  assert.match(source, /document\.addEventListener\(['"]click['"],\s*handleAction\)/);
  assert.doesNotMatch(source, /\sonclick=/i);
});
```

- [ ] **Step 2: Chạy test để xác nhận API còn thiếu**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: FAIL tại function đầu tiên chưa có.

- [ ] **Step 3: Tạo state object duy nhất**

```js
const state = {
  activeScreen: 'home',
  activeModule: 'home',
  language: 'vi',
  balances: { bnb: 2450, glow: 600, moon: 120 },
  selectedTip: 10,
  rating: 5,
  currentReward: null,
  consent: { rewards: false, partners: false },
  filters: { explore: 'all', offers: 'all', offerCategory: 'all' },
  pending: { tip: false, payment: false, booking: false, reward: false },
  savedOffers: new Set(),
  wishes: [],
  looks: []
};
```

- [ ] **Step 4: Tạo event delegation dispatcher**

```js
function handleAction(event) {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  const actions = {
    navigate: () => navigateTo(control.dataset.target),
    back: () => navigateTo(control.dataset.backTarget || 'home'),
    language: () => setLanguage(control.dataset.language),
    'start-scan': () => startScan(),
    'select-tip': () => selectTip(Number(control.dataset.amount), control),
    'send-tip': () => sendTip(),
    'confirm-tip': () => confirmTip(),
    'send-payment': () => sendPayment(),
    'confirm-payment': () => confirmPayment(),
    'open-reward': () => openReward(control.dataset.rewardKey),
    'confirm-reward': () => confirmReward(),
    'save-offer': () => saveOffer(control),
    'add-wish': () => addWish(),
    'save-look': () => saveLook(),
    'set-rating': () => setRating(Number(control.dataset.rating)),
    'submit-review': () => submitReview(),
    'review-booking': () => reviewBooking(),
    'confirm-booking': () => confirmBooking(),
    'close-overlay': () => closeOverlay(control.closest('[data-overlay]'))
  };
  actions[action]?.();
}

document.addEventListener('click', handleAction);
```

- [ ] **Step 5: Port và chuẩn hóa logic flow**

Chuyển logic từ prototype dòng 1295–1697 vào các function bắt buộc. Mỗi action phải:

- validate input trước khi đổi màn;
- set `state.pending.<flow>` và disable nút gửi lặp;
- render pending state trước confirmed state;
- cập nhật balance/history đúng lúc confirmed;
- gọi `showToast(key)` cho feedback nhẹ;
- gọi lại `window.lucide.createIcons()` sau khi chèn DOM động.

Overlay API dùng một cơ chế chung:

```js
let returnFocus = null;
function openOverlay(overlay, trigger = document.activeElement) {
  returnFocus = trigger;
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
}

function closeOverlay(overlay) {
  if (!overlay) return;
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  returnFocus?.focus();
  returnFocus = null;
}
```

- [ ] **Step 6: Chạy contract test**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: 6 tests PASS và không có `onclick=`.

- [ ] **Step 7: Commit interaction layer**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: restore customer reward interactions"
```

---

### Task 6: Translation, Accessibility Và Edge States

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html`

**Interfaces:**
- Consumes: component markup và event/action API từ Task 3–5.
- Produces: translation coverage, `setLanguage()`, accessible shared controls, reduced motion, loading/empty/pending/success/error patterns.

- [ ] **Step 1: Thêm test cho translation pair, accessibility và reduced motion**

```js
function tagsWith(source, attribute) {
  return [...source.matchAll(new RegExp(`<[^>]+${attribute}="[^"]*"[^>]*>`, 'g'))].map(([tag]) => tag);
}

test('pairs every translated label and placeholder', () => {
  const source = html();
  for (const tag of tagsWith(source, 'data-en')) assert.match(tag, /data-vi="/);
  for (const tag of tagsWith(source, 'data-vi')) assert.match(tag, /data-en="/);
  for (const tag of tagsWith(source, 'data-en-ph')) assert.match(tag, /data-vi-ph="/);
});

test('includes shared accessibility and edge-state contracts', () => {
  const source = html();
  assert.match(source, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(source, /data-state="loading"/);
  assert.match(source, /data-state="empty"/);
  assert.match(source, /data-state="error"/);
  assert.match(source, /aria-live="polite"/);
  for (const tag of source.matchAll(/<button\b[^>]*class="[^"]*icon-button[^"]*"[^>]*>/g)) {
    assert.match(tag[0], /aria-label="[^"]+"/);
  }
});
```

- [ ] **Step 2: Chạy test để xác nhận translation hoặc edge-state còn thiếu**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: ít nhất 1 test mới FAIL trước khi hoàn thiện.

- [ ] **Step 3: Hoàn thiện translation runtime**

```js
function setLanguage(language) {
  state.language = language === 'en' ? 'en' : 'vi';
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-en][data-vi]').forEach((element) => {
    element.textContent = element.dataset[state.language];
  });
  document.querySelectorAll('[data-en-ph][data-vi-ph]').forEach((element) => {
    element.placeholder = element.dataset[`${state.language}Ph`];
  });
  document.querySelectorAll('[data-language]').forEach((control) => {
    control.setAttribute('aria-pressed', String(control.dataset.language === state.language));
  });
}
```

Mọi text nhìn thấy trên 31 màn, toast, modal, bottom sheet, empty state và validation message phải có cặp `data-en`/`data-vi`; placeholder dùng `data-en-ph`/`data-vi-ph`.

- [ ] **Step 4: Thêm shared state patterns và reduced motion**

```html
<div class="app-card animate-pulse" data-state="loading" aria-label="Đang tải">
  <div class="h-4 w-2/3 rounded bg-app-line"></div>
</div>
<div class="app-card text-center" data-state="empty">
  <i data-lucide="inbox" class="mx-auto mb-3 size-6 text-app-muted" aria-hidden="true"></i>
  <p data-en="Nothing here yet" data-vi="Chưa có dữ liệu">Chưa có dữ liệu</p>
</div>
<div class="app-card border-app-red/40" data-state="error" role="alert">
  <p data-en="Something went wrong. Please try again." data-vi="Đã xảy ra lỗi. Vui lòng thử lại.">Đã xảy ra lỗi. Vui lòng thử lại.</p>
</div>
<div id="toast-region" aria-live="polite" aria-atomic="true"></div>
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Chạy toàn bộ contract test**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: 8 tests PASS, 0 FAIL.

- [ ] **Step 6: Commit translation và accessibility**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add bilingual accessible reward states"
```

---

### Task 7: Local Web Run Và Browser Responsive QA

**Files:**
- Modify if QA finds defects: `html/customer/cutomer-reward.html`
- Modify if contract changes are required: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: final artifact và contract test từ Task 1–6.
- Produces: local web URL đã chạy, browser QA ở bốn viewport và xác nhận các flow chính.

- [ ] **Step 1: Chạy contract test và kiểm tra HTML source trước browser QA**

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: 8 tests PASS, 0 FAIL.

Run: `rg -n 'onclick=|bootstrap|font-awesome|class="[^"]*\b(phone|notch|status)\b' html/customer/cutomer-reward.html`

Expected: không có output.

- [ ] **Step 2: Khởi động local static server và giữ process chạy**

Run: `python3 -m http.server 8123 -d html`

Expected: server lắng nghe tại `http://localhost:8123/`.

- [ ] **Step 3: Mở trang mới và xác nhận dependency tải thành công**

Open: `http://localhost:8123/customer/cutomer-reward.html`

Expected: Tailwind style được áp dụng, Lucide icon hiển thị, không có lỗi JavaScript trong console và Home là màn active đầu tiên.

- [ ] **Step 4: Kiểm tra responsive ở bốn viewport**

Kiểm tra lần lượt:

- 375 x 812: một cột, bottom navigation hiển thị, không có horizontal overflow, content không bị nav che.
- 768 x 1024: bottom navigation vẫn hiển thị, card phù hợp chuyển 2 cột.
- 1024 x 768: sidebar hiển thị, bottom navigation ẩn, main content không đè sidebar.
- 1440 x 900: content tối đa khoảng 1200px, dashboard/list dùng 2–3 cột hợp lý, form không kéo quá rộng.

Tại mỗi viewport, chạy trong console:

```js
({
  viewport: [innerWidth, innerHeight],
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  activeScreen: document.querySelector('.app-screen.is-active')?.id,
  mobileNavVisible: getComputedStyle(document.querySelector('#mobile-nav')).display !== 'none',
  sidebarVisible: getComputedStyle(document.querySelector('#desktop-sidebar')).display !== 'none'
})
```

Expected: `overflow` bằng 0; navigation surface đúng breakpoint.

- [ ] **Step 5: Chạy các flow chính bằng browser**

Thực hiện và xác nhận:

- Login → OTP → Home.
- Onboarding → consent skip/agree → double opt-in → points waiting.
- Scan idle → scanning → success.
- Tip select → pending → confirmed.
- Direct payment → pending → confirmed.
- Wallet → reward → redeem → claimed reward.
- Booking select → review → request pending → confirmed.
- Explore search/filter → business detail.
- Offers filter/save → add wish.
- Looks create → private review → referral → message preferences.
- Chuyển VI → EN tại Profile rồi kiểm tra Home, Wallet, modal và toast.

Expected: không có dead button, screen active đúng module, sidebar/bottom-nav highlight đúng, balance chỉ đổi ở bước confirmed.

- [ ] **Step 6: Sửa từng lỗi QA và chạy lại verification đầy đủ**

Sau mỗi lỗi, thêm hoặc cập nhật assertion trong `cutomer-reward.test.mjs` nếu có thể tái hiện bằng source contract, chạy test thất bại, sửa HTML tối thiểu rồi chạy test pass.

Run cuối:

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: 8 tests PASS, `git diff --check` không có output.

- [ ] **Step 7: Commit bản đã qua browser QA**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "test: verify responsive customer reward flows"
```
