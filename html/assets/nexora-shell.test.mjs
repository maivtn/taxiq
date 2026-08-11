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
  'booking-book-src-app-shell.html',
  'community.html',
  'salon-setup-reward.html',
  'change-icon.html'
];

const rewardItems = [
  ['overview', 'Overview'],
  ['earn-rules', 'Earn Rules'],
  ['reward-catalog', 'Reward Catalog'],
  ['customers', 'Customers'],
  ['loyalty-activity', 'Loyalty Activity'],
  ['analytics', 'Analytics']
];

function classList() {
  return { add() {}, remove() {}, toggle() {}, contains() { return false; } };
}

function renderSidebar(activePage, activeTab) {
  const sidebar = { innerHTML: '', classList: classList() };
  const header = { innerHTML: '' };
  let backdrop = null;
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
    location: { search: '' }
  };
  vm.runInNewContext(shellSource, { window, document, URLSearchParams });
  return sidebar.innerHTML;
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

test('does not render the SMS submenu item under POS', () => {
  const html = renderSidebar('pos', 'checkin');
  assert.doesNotMatch(html, /data-shell-tab="sms"/);
  assert.match(html, /data-shell-tab="booking"[\s\S]*?<span>Booking<\/span>/);
  assert.doesNotMatch(html, /data-shell-tab="appointments"/);
});

test('labels the POS Check-in, Tickets, and Customers tabs in the sidebar', () => {
  const html = renderSidebar('pos', 'checkin');
  assert.match(html, /data-shell-tab="checkin"[\s\S]*?<span>Check-in<\/span>/);
  assert.match(html, /data-shell-tab="tickets"[\s\S]*?<span>Tickets<\/span>/);
  assert.match(html, /data-shell-tab="customers"[\s\S]*?<span>Customers<\/span>/);
  assert.doesNotMatch(html, /data-shell-tab="dispatch"/);
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
