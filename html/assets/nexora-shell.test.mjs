import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SHELL_URL = new URL('./nexora-shell.js', import.meta.url);
const shellSource = readFileSync(SHELL_URL, 'utf8');

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
  ['history', 'Lịch sử mua gói']
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

test('renders all four Package Management submenu items on the native Packages page', () => {
  const html = renderSidebar('packages', 'overview');
  for (const [tab, label] of packageItems) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`data-shell-tab="${tab}"[\\s\\S]*?<span>${escapedLabel}<\\/span>`));
  }
  assert.match(html, /class="nav-item nav-parent is-expanded"[\s\S]*?<span>Package Management<\/span>/);
  assert.match(html, /data-nav-subnav[\s\S]*?data-shell-tab="overview"/);
});

test('links every Reward submenu from pages that share the sidebar', () => {
  const html = renderSidebar('booking', 'booking');
  for (const [tab, label] of rewardItems) {
    assert.match(html, new RegExp(`href="salon-setup-reward.html\\?tab=${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }
});
