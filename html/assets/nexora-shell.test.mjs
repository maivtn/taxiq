import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SHELL_URL = new URL('./nexora-shell.js', import.meta.url);
const SHELL_CSS_URL = new URL('./nexora-shell.css', import.meta.url);
const shellSource = readFileSync(SHELL_URL, 'utf8');
const shellCss = readFileSync(SHELL_CSS_URL, 'utf8');
const INLINE_SHELL_PAGES = [
  'booking-book-phase-1.html',
  'community.html',
  'salon-setup-reward.html',
  'change-icon.html'
];

const rewardItems = [
  ['overview', 'Overview'],
  ['earn-rules', 'Earn Rules'],
  ['reward-catalog', 'Reward Catalog'],
  ['ai-offers', 'AI Offers'],
  ['customers', 'Customers'],
  ['loyalty-activity', 'Loyalty Activity'],
  ['analytics', 'Analytics']
];

function classList() {
  return { add() {}, remove() {}, toggle() {}, contains() { return false; } };
}

function makeLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

function renderSidebar(activePage, activeTab, hiddenKeys = []) {
  const sidebar = { innerHTML: '', classList: classList() };
  const header = { innerHTML: '' };
  let backdrop = null;
  const localStorage = makeLocalStorage({
    'nexora.sidebar.visibility.v1': JSON.stringify({ hiddenKeys })
  });
  const document = {
    readyState: 'complete',
    body: { appendChild(node) { backdrop = node; } },
    createElement() { return { className: '', classList: classList(), addEventListener() {} }; },
    addEventListener() {},
    querySelector(selector) {
      if (selector === 'aside.sidebar') return sidebar;
      if (selector === 'header.header') return header;
      if (selector === '.nexora-shell-backdrop') return backdrop;
      return null;
    },
    querySelectorAll() { return []; }
  };
  const window = {
    NEXORA_SHELL: { activePage, activeTab },
    location: { search: '' },
    localStorage
  };
  vm.runInNewContext(shellSource, { window, document, URLSearchParams });
  return sidebar.innerHTML;
}

function bootShellForVisibility(hiddenKeys = []) {
  const sidebar = { innerHTML: '', classList: classList() };
  const header = { innerHTML: '' };
  let backdrop = null;
  const localStorage = makeLocalStorage({
    'nexora.sidebar.visibility.v1': JSON.stringify({ hiddenKeys })
  });
  const document = {
    readyState: 'complete',
    body: { appendChild(node) { backdrop = node; } },
    createElement() { return { className: '', classList: classList(), addEventListener() {} }; },
    addEventListener() {},
    querySelector(selector) {
      if (selector === 'aside.sidebar') return sidebar;
      if (selector === 'header.header') return header;
      if (selector === '.nexora-shell-backdrop') return backdrop;
      return null;
    },
    querySelectorAll() { return []; }
  };
  const window = {
    NEXORA_SHELL: { activePage: 'booking', activeTab: 'booking' },
    location: { search: '' },
    localStorage
  };
  vm.runInNewContext(shellSource, { window, document, URLSearchParams });
  return { window, sidebar, localStorage };
}

function bootShellWithPlanButton() {
  const listeners = {};
  const sidebar = { innerHTML: '', classList: classList() };
  const header = { innerHTML: '' };
  const planButton = {
    addEventListener(type, handler) {
      listeners[type] = handler;
    }
  };
  let backdrop = null;
  const document = {
    readyState: 'complete',
    body: { appendChild(node) { backdrop = node; } },
    createElement() { return { className: '', classList: classList(), addEventListener() {} }; },
    addEventListener() {},
    getElementById() { return null; },
    querySelector(selector) {
      if (selector === 'aside.sidebar') return sidebar;
      if (selector === 'header.header') return header;
      if (selector === '.sidebar .plan-button') return planButton;
      if (selector === '.nexora-shell-backdrop') return backdrop;
      return null;
    },
    querySelectorAll() { return []; }
  };
  const window = {
    NEXORA_SHELL: { activePage: 'booking', activeTab: 'booking' },
    location: { search: '', href: 'booking-book-phase-1.html' }
  };
  vm.runInNewContext(shellSource, { window, document, URLSearchParams });
  return { listeners, window };
}

function mediaBlock(source, minWidth) {
  const pattern = new RegExp(`@media\\s*\\(min-width:\\s*${minWidth}px\\)\\s*\\{`);
  const match = source.match(pattern);
  if (!match) return '';
  const start = match.index;
  const bodyStart = start + match[0].length;
  const nextMedia = source.slice(bodyStart).search(/\n\s*@media\s*\(/);
  const end = nextMedia === -1 ? source.length : bodyStart + nextMedia;
  return source.slice(start, end);
}

test('uses Ai Hub as the booking sidebar group label', () => {
  const html = renderSidebar('booking', 'booking');
  assert.match(html, /data-lucide="calendar-days"[\s\S]*?<span>Ai Hub<\/span>/);
  assert.doesNotMatch(html, /<span>Booking Hub<\/span>/);
});

test('labels the Ai Hub booking sidebar item as Booking', () => {
  const html = renderSidebar('booking', 'booking');
  const bookingItem = html.match(/data-shell-tab="booking"[\s\S]*?<\/button>/)?.[0] || '';
  assert.match(bookingItem, /<span>Booking<\/span>/);
  assert.doesNotMatch(bookingItem, /Booking Book/);
});

test('keeps inline Booking sidebar fallback labels concise', () => {
  for (const file of ['booking-book-phase-1.html', 'change-icon.html']) {
    const html = readFileSync(new URL(`../pages/${file}`, import.meta.url), 'utf8');
    const bookingItem = html.match(/<button class="nav-subitem[^"]*" type="button" data-tab-target="booking"[\s\S]*?<\/button>/)?.[0] || '';
    assert.match(bookingItem, /<span>Booking<\/span>/);
    assert.doesNotMatch(bookingItem, /Booking Book/);
  }
});

test('renders all Reward submenu buttons on the native Reward page', () => {
  const html = renderSidebar('reward', 'overview');
  for (const [tab, label] of rewardItems) {
    assert.match(html, new RegExp(`data-shell-tab="${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }
  assert.doesNotMatch(html, /data-shell-tab="reward-dashboard"/);
  assert.doesNotMatch(html, /data-shell-tab="create-reward"/);
});

test('links and activates Reviews on the native Review page', () => {
  const html = renderSidebar('review', '');
  assert.match(html, /<a class="nav-item is-active" href="nexora-review\.html">[\s\S]*?<span>Reviews<\/span>/);
});

test('keeps Stations & QR Codes flat without QR Stations or OneQR submenu items', () => {
  const merchantHtml = renderSidebar('booking', 'booking');
  assert.match(merchantHtml, /<a class="nav-item" href="qr-stations\.html">[\s\S]*?<span>Stations &amp; QR Codes<\/span><\/a>/);
  assert.doesNotMatch(merchantHtml, /href="qr-stations\.html\?tab=/);
  assert.doesNotMatch(merchantHtml, /id="nexora-subnav-stations"/);

  const stationsHtml = renderSidebar('stations', 'qr-stations');
  assert.match(stationsHtml, /<a class="nav-item is-active" href="qr-stations\.html">[\s\S]*?<span>Stations &amp; QR Codes<\/span><\/a>/);
  assert.doesNotMatch(stationsHtml, /data-shell-tab="(?:qr-stations|one-qr)"/);
  assert.doesNotMatch(stationsHtml, /id="nexora-subnav-stations"/);
});

test('keeps Settings sidebar navigation flat without Owner Settings tab subitems', () => {
  const merchantHtml = renderSidebar('booking', 'booking');
  assert.doesNotMatch(merchantHtml, /<button class="nav-item" type="button">[\s\S]*?<span>Staff<\/span><\/button>/);
  assert.doesNotMatch(merchantHtml, /href="owner-setting\.html\?tab=staff"[\s\S]*?<span>Staff<\/span>/);
  assert.match(merchantHtml, /<a class="nav-item" href="owner-setting\.html">[\s\S]*?<span>Settings<\/span>/);

  const settingsHtml = renderSidebar('owner-settings', 'staff');
  assert.match(settingsHtml, /<a class="nav-item is-active" href="owner-setting\.html">[\s\S]*?<span>Settings<\/span>/);
  assert.doesNotMatch(settingsHtml, /data-shell-tab="staff"/);
  assert.doesNotMatch(settingsHtml, /id="nexora-subnav-settings"/);
});

test('hides shared merchant sidebar items from saved Settings visibility', () => {
  const html = renderSidebar('booking', 'booking', ['dashboard', 'support', 'settings']);

  assert.doesNotMatch(html, />Dashboard</);
  assert.doesNotMatch(html, />Support</);
  assert.match(html, /data-lucide="settings"[\s\S]*?<span>Settings<\/span>/);
});

test('exposes sidebar visibility helpers that keep Settings visible', () => {
  const runtime = bootShellForVisibility(['dashboard']);
  const api = runtime.window.NEXORA_SHELL;

  assert.equal(api.sidebarVisibilityStorageKey, 'nexora.sidebar.visibility.v1');
  assert.ok(api.sidebarMenuItems.some((item) => item.key === 'settings' && item.locked === true));
  assert.deepEqual(Array.from(api.getHiddenSidebarKeys()), ['dashboard']);
  assert.deepEqual(Array.from(api.setHiddenSidebarKeys(['analytics', 'settings', 'missing'])), ['analytics']);
  assert.equal(runtime.localStorage.getItem('nexora.sidebar.visibility.v1'), JSON.stringify({ hiddenKeys: ['analytics'] }));
});

test('renders the Staff sidebar with its staff-only navigation', () => {
  const html = renderSidebar('staff', 'dashboard');
  assert.match(html, /class="sidebar-panel staff-profile-panel"/);
  for (const label of ['Home', 'Dashboard', 'My Workspace', 'My QR', 'My Earnings', 'My Reviews', 'My Salons', 'Tips', 'Transactions', 'Payout Methods', 'Profile', 'Sign out']) {
    assert.match(html, new RegExp(`>${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`));
  }
  assert.match(html, /data-lucide="briefcase-business"/);
  assert.match(html, /data-lucide="log-out"/);
  assert.match(html, /class="nav-item[^"]*is-active[^"]*"[^>]*data-staff-nav="dashboard"/);
});

test('adds a sign-out icon to the sidebar footer action', () => {
  const html = renderSidebar('', '');
  assert.match(html, /class="logout-button"[\s\S]*data-lucide="log-out"[\s\S]*<span>Sign out<\/span><\/button>/);
});

test('does not render Package Management as a sidebar menu', () => {
  for (const [activePage, activeTab] of [['booking', 'booking'], ['packages', 'overview']]) {
    const html = renderSidebar(activePage, activeTab);
    assert.doesNotMatch(html, /<span>Package Management<\/span>/);
    assert.doesNotMatch(html, /data-shell-tab="(?:overview|nexora|voice|history)"[\s\S]*?Package/);
    assert.doesNotMatch(html, /href="nexora-packages\.html\?tab=/);
  }
});

test('opens the Package Management overview from the plan button', () => {
  const runtime = bootShellWithPlanButton();
  assert.equal(typeof runtime.listeners.click, 'function');
  runtime.listeners.click();
  assert.equal(runtime.window.location.href, 'nexora-packages.html?tab=overview');
});

test('links every Reward submenu from pages that share the sidebar', () => {
  const html = renderSidebar('booking', 'booking');
  for (const [tab, label] of rewardItems) {
    assert.match(html, new RegExp(`href="salon-setup-reward.html\\?tab=${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }
});

test('renders POS as a flat active sidebar item on the POS page', () => {
  const html = renderSidebar('pos', 'checkin');
  assert.match(html, /<a class="nav-item is-active" href="pos-phase-1\.html">[\s\S]*?data-lucide="monitor"[\s\S]*?<span>POS<\/span><\/a>/);
  assert.doesNotMatch(html, /aria-controls="nexora-subnav-pos"/);
  assert.doesNotMatch(html, /id="nexora-subnav-pos"/);
  assert.doesNotMatch(html, /href="pos-phase-1\.html\?tab=/);
});

test('links POS as a flat sidebar item from other shared sidebar pages', () => {
  const html = renderSidebar('booking', 'booking');
  const posIndex = html.indexOf('<span>POS</span>');
  const analyticsIndex = html.indexOf('<span>Analytics</span>', posIndex);
  const posSlice = html.slice(posIndex, analyticsIndex);

  assert.ok(posIndex > -1, 'POS should render in the shared sidebar');
  assert.ok(analyticsIndex > posIndex, 'Analytics should sit below POS');
  assert.match(html, /<a class="nav-item" href="pos-phase-1\.html">[\s\S]*?data-lucide="monitor"[\s\S]*?<span>POS<\/span><\/a>/);
  assert.doesNotMatch(posSlice, /nav-subitem|Today Booking|Queue &amp; Tech Assign|Time Clock|Management/);
  assert.doesNotMatch(html, /id="nexora-subnav-pos"/);
  assert.doesNotMatch(html, /href="pos-phase-1\.html\?tab=/);
});

test('links both income reports from the shared Analytics group', () => {
  const html = renderSidebar('booking', 'booking');

  assert.match(html, /aria-controls="nexora-subnav-analytics"/);
  assert.match(html, /href="pos-shop-income-report\.html"[\s\S]*?<span>Store Income<\/span>/);
  assert.match(html, /href="pos-service-income-report\.html"[\s\S]*?<span>Service Income<\/span>/);
});

test('expands Analytics and highlights the active standalone report', () => {
  const html = renderSidebar('analytics', 'service-income');

  assert.match(html, /data-nav-group aria-expanded="true" aria-controls="nexora-subnav-analytics"/);
  assert.match(html, /class="nav-subitem is-active" href="pos-service-income-report\.html"/);
  assert.match(html, /class="nav-subitem" href="pos-shop-income-report\.html"/);
});

test('keeps the shared sidebar in the drawer state through 1366px', () => {
  assert.match(shellCss, /@media\s*\(max-width:\s*1366px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?transform:\s*translateX\(-105%\)/);
  assert.match(shellCss, /@media\s*\(min-width:\s*1367px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?display:\s*flex/);
  assert.match(shellCss, /@media\s*\(min-width:\s*1367px\)[\s\S]*?\.app-area\s*\{[\s\S]*?padding-left:\s*288px/);
});

test('keeps inline shell pages on the same 1366px desktop breakpoint', () => {
  for (const file of INLINE_SHELL_PAGES) {
    const html = readFileSync(new URL(`../pages/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(mediaBlock(html, 1024), /\.sidebar\s*\{[\s\S]*?display:\s*flex/);
    assert.match(mediaBlock(html, 1366), /\.sidebar\s*\{[\s\S]*?display:\s*flex/);
  }
});

test('provides the shared two-line date time display class', () => {
  assert.match(shellCss, /\.credits-history-date\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*2px;/);
  assert.match(shellCss, /\.credits-history-date small\s*\{[\s\S]*?display:\s*block;[\s\S]*?font-size:\s*10px;[\s\S]*?font-weight:\s*700;/);
});

test('exposes an accessible hamburger drawer contract', () => {
  assert.match(shellSource, /data-shell-drawer-open[^>]*aria-label="Open navigation menu"[^>]*aria-controls="nexora-sidebar"[^>]*aria-expanded="false"/);
  assert.match(shellSource, /sidebar\.id\s*=\s*'nexora-sidebar'/);
  assert.match(shellSource, /opener\.setAttribute\('aria-expanded', open \? 'true' : 'false'\)/);
  assert.match(shellSource, /event\.key === 'Escape'[\s\S]*?setDrawer\(false\)/);
});
