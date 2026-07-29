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

const packageItems = [
  ['overview', 'Overview'],
  ['nexora', 'Subscriptions'],
  ['voice', 'AI Voice Plans'],
  ['credits', 'Credit Usage'],
  ['history', 'Purchase History']
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

test('uses Ai Hub as the booking sidebar group label', () => {
  const html = renderSidebar('booking', 'booking');
  assert.match(html, /data-lucide="calendar-days"[\s\S]*?<span>Ai Hub<\/span>/);
  assert.doesNotMatch(html, /<span>Booking Hub<\/span>/);
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

test('renders all five Package Management submenu items on the native Packages page', () => {
  const html = renderSidebar('packages', 'overview');
  for (const [tab, label] of packageItems) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`data-shell-tab="${tab}"[\\s\\S]*?<span>${escapedLabel}<\\/span>`));
  }
  assert.match(html, /class="nav-item nav-parent is-expanded"[\s\S]*?<span>Package Management<\/span>/);
  assert.match(html, /class="nav-item nav-parent is-expanded"[\s\S]*?data-lucide="crown"/);
  assert.match(html, /data-nav-subnav[\s\S]*?data-shell-tab="overview"/);
});

test('links every Reward submenu from pages that share the sidebar', () => {
  const html = renderSidebar('booking', 'booking');
  for (const [tab, label] of rewardItems) {
    assert.match(html, new RegExp(`href="salon-setup-reward.html\\?tab=${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }
});

test('does not render the SMS submenu item under POS', () => {
  const html = renderSidebar('pos', 'dispatch');
  assert.doesNotMatch(html, /data-shell-tab="sms"/);
  assert.match(html, /data-shell-tab="booking"[\s\S]*?<span>Booking<\/span>/);
  assert.doesNotMatch(html, /data-shell-tab="appointments"/);
});

test('labels the POS dispatch tab as Operations in the sidebar', () => {
  const html = renderSidebar('pos', 'dispatch');
  assert.match(html, /data-shell-tab="dispatch"[\s\S]*?<span>Operations<\/span>/);
  assert.doesNotMatch(html, /data-shell-tab="dispatch"[\s\S]*?<span>Dispatch<\/span>/);
});

test('keeps the shared sidebar in the drawer state through 1200px', () => {
  assert.match(shellCss, /@media\s*\(max-width:\s*1200px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?transform:\s*translateX\(-105%\)/);
  assert.match(shellCss, /@media\s*\(min-width:\s*1201px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?display:\s*flex/);
  assert.match(shellCss, /@media\s*\(min-width:\s*1201px\)[\s\S]*?\.app-area\s*\{[\s\S]*?padding-left:\s*288px/);
});

test('keeps inline shell pages on the same 1201px desktop breakpoint', () => {
  for (const file of INLINE_SHELL_PAGES) {
    const html = readFileSync(new URL(`../pages/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?display:\s*flex/);
    assert.match(html, /@media\s*\(min-width:\s*1201px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?display:\s*flex/);
  }
});

test('exposes an accessible hamburger drawer contract', () => {
  assert.match(shellSource, /data-shell-drawer-open[^>]*aria-label="Open navigation menu"[^>]*aria-controls="nexora-sidebar"[^>]*aria-expanded="false"/);
  assert.match(shellSource, /sidebar\.id\s*=\s*'nexora-sidebar'/);
  assert.match(shellSource, /opener\.setAttribute\('aria-expanded', open \? 'true' : 'false'\)/);
  assert.match(shellSource, /event\.key === 'Escape'[\s\S]*?setDrawer\(false\)/);
});
