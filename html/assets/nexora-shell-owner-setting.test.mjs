import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SHELL_URL = new URL('./nexora-shell.js', import.meta.url);
const shellSource = readFileSync(SHELL_URL, 'utf8');

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

test('renders Settings as an expanded submenu group on the Owner Settings page', () => {
  const html = renderSidebar('owner-settings', 'sub-account');

  assert.match(html, /class="nav-item nav-parent is-expanded"[\s\S]*?aria-controls="nexora-subnav-settings"[\s\S]*?data-lucide="settings"[\s\S]*?<span>Settings<\/span>/);
  assert.match(html, /<div class="nav-subnav" id="nexora-subnav-settings" data-nav-subnav>/);

  for (const [tab, label] of [
    ['account', 'Account'],
    ['business-verification', 'Business Verification'],
    ['sub-account', 'Sub Account'],
    ['affiliate-link', 'Affiliate Link'],
    ['terms-privacy', 'Terms &amp; Privacy']
  ]) {
    assert.match(html, new RegExp(`data-shell-tab="${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }

  assert.match(html, /class="nav-subitem is-active"[^>]*data-shell-tab="sub-account"[\s\S]*?<span>Sub Account<\/span>/);
  assert.doesNotMatch(html, /<a class="nav-item is-active" href="owner-setting\.html">[\s\S]*?<span>Settings<\/span><\/a>/);
});

test('links Settings submenu items from other shared sidebar pages', () => {
  const html = renderSidebar('booking', 'booking');

  for (const [tab, label] of [
    ['account', 'Account'],
    ['business-verification', 'Business Verification'],
    ['sub-account', 'Sub Account'],
    ['affiliate-link', 'Affiliate Link'],
    ['terms-privacy', 'Terms &amp; Privacy']
  ]) {
    assert.match(html, new RegExp(`href="owner-setting.html\\?tab=${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }
});
