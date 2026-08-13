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

test('renders News & Library as a flat active sidebar item on its page', () => {
  const html = renderSidebar('news-library', 'event-zoom-schedule');

  assert.match(html, /<a class="nav-item is-active" href="news-library\.html">[\s\S]*?data-lucide="newspaper"[\s\S]*?<span>News &amp; Library<\/span><\/a>/);
  assert.doesNotMatch(html, /aria-controls="nexora-subnav-news-library"/);
  assert.doesNotMatch(html, /id="nexora-subnav-news-library"/);
  assert.doesNotMatch(html, /data-shell-tab="(?:news|event-zoom-schedule|compensation-plan|presentation-video)"/);
  assert.doesNotMatch(html, /<span>Presentation &amp; Video<\/span>/);
});

test('links News & Library as a flat sidebar item from other shared sidebar pages', () => {
  const html = renderSidebar('booking', 'booking');

  assert.match(html, /<a class="nav-item" href="news-library\.html">[\s\S]*?data-lucide="newspaper"[\s\S]*?<span>News &amp; Library<\/span><\/a>/);
  assert.doesNotMatch(html, /news-library\.html\?tab=/);
  assert.doesNotMatch(html, /id="nexora-subnav-news-library"/);
});

test('places News & Library directly above Support in the shared sidebar', () => {
  const html = renderSidebar('booking', 'booking');
  const newsIndex = html.indexOf('<span>News &amp; Library</span>');
  const supportIndex = html.indexOf('<span>Support</span>');
  const settingsIndex = html.indexOf('<span>Settings</span>');

  assert.ok(settingsIndex > -1, 'Settings must be rendered before the lower sidebar items');
  assert.ok(newsIndex > settingsIndex, 'News & Library should sit below Settings');
  assert.ok(supportIndex > newsIndex, 'Support should sit below News & Library');
  assert.doesNotMatch(html.slice(newsIndex, supportIndex), /<span>(News|Event &amp; Zoom Schedule|Compensation Plan|Community|Reward|POS|Analytics|Settings)<\/span>/);
});
