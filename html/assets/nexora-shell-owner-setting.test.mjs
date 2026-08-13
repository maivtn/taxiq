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

test('renders Settings as a flat active sidebar item on the Owner Settings page', () => {
  const html = renderSidebar('owner-settings', 'sub-account');

  assert.match(html, /<a class="nav-item is-active" href="owner-setting\.html">[\s\S]*?data-lucide="settings"[\s\S]*?<span>Settings<\/span><\/a>/);
  assert.doesNotMatch(html, /aria-controls="nexora-subnav-settings"/);
  assert.doesNotMatch(html, /id="nexora-subnav-settings"/);
  assert.doesNotMatch(html, /data-shell-tab="(?:account|business-verification|sub-account|staff|affiliate-link|terms-privacy|sidebar-menu)"/);
});

test('links Settings as a flat sidebar item from other shared sidebar pages', () => {
  const html = renderSidebar('booking', 'booking');

  assert.match(html, /<a class="nav-item" href="owner-setting\.html">[\s\S]*?data-lucide="settings"[\s\S]*?<span>Settings<\/span><\/a>/);
  assert.doesNotMatch(html, /owner-setting\.html\?tab=/);
  assert.doesNotMatch(html, /id="nexora-subnav-settings"/);
});
