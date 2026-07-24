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

test('links and activates Package Management on the native Packages page', () => {
  const html = renderSidebar('packages', '');
  assert.match(html, /<a class="nav-item is-active" href="nexora-packages\.html">[\s\S]*?<span>Quản lý gói<\/span>/);
});

test('links every Reward submenu from pages that share the sidebar', () => {
  const html = renderSidebar('booking', 'booking');
  for (const [tab, label] of rewardItems) {
    assert.match(html, new RegExp(`href="salon-setup-reward.html\\?tab=${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }
});
