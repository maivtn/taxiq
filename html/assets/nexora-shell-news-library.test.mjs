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

test('renders News & Library as an expanded submenu group on its page', () => {
  const html = renderSidebar('news-library', 'event-zoom-schedule');

  assert.match(html, /class="nav-item nav-parent is-expanded"[\s\S]*?aria-controls="nexora-subnav-news-library"[\s\S]*?data-lucide="newspaper"[\s\S]*?<span>News &amp; Library<\/span>/);
  assert.match(html, /<div class="nav-subnav" id="nexora-subnav-news-library" data-nav-subnav>/);
  assert.match(html, /data-shell-tab="news"[\s\S]*?<span>News<\/span>[\s\S]*?data-shell-tab="event-zoom-schedule"[\s\S]*?<span>Event &amp; Zoom Schedule<\/span>[\s\S]*?data-shell-tab="compensation-plan"[\s\S]*?<span>Compensation Plan<\/span>/);

  for (const [tab, label] of [
    ['news', 'News'],
    ['event-zoom-schedule', 'Event &amp; Zoom Schedule'],
    ['compensation-plan', 'Compensation Plan']
  ]) {
    assert.match(html, new RegExp(`data-shell-tab="${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }

  assert.doesNotMatch(html, /data-shell-tab="presentation-video"/);
  assert.doesNotMatch(html, /<span>Presentation &amp; Video<\/span>/);
  assert.match(html, /class="nav-subitem is-active"[^>]*data-shell-tab="event-zoom-schedule"[\s\S]*?<span>Event &amp; Zoom Schedule<\/span>/);
});

test('links News & Library submenu items from other shared sidebar pages', () => {
  const html = renderSidebar('booking', 'booking');

  assert.match(html, /href="news-library\.html\?tab=news"[\s\S]*?<span>News<\/span>[\s\S]*?href="news-library\.html\?tab=event-zoom-schedule"[\s\S]*?<span>Event &amp; Zoom Schedule<\/span>[\s\S]*?href="news-library\.html\?tab=compensation-plan"[\s\S]*?<span>Compensation Plan<\/span>/);

  for (const [tab, label] of [
    ['news', 'News'],
    ['event-zoom-schedule', 'Event &amp; Zoom Schedule'],
    ['compensation-plan', 'Compensation Plan']
  ]) {
    assert.match(html, new RegExp(`href="news-library.html\\?tab=${tab}"[\\s\\S]*?<span>${label}<\\/span>`));
  }

  assert.doesNotMatch(html, /href="news-library\.html\?tab=presentation-video"/);
});

test('places News & Library directly above Support in the shared sidebar', () => {
  const html = renderSidebar('booking', 'booking');
  const newsIndex = html.indexOf('<span>News &amp; Library</span>');
  const supportIndex = html.indexOf('<span>Support</span>');
  const settingsIndex = html.indexOf('<span>Settings</span>');

  assert.ok(settingsIndex > -1, 'Settings must be rendered before the lower sidebar items');
  assert.ok(newsIndex > settingsIndex, 'News & Library should sit below Settings');
  assert.ok(supportIndex > newsIndex, 'Support should sit below News & Library');
  assert.doesNotMatch(html.slice(newsIndex, supportIndex), /<span>(Community|Reward|POS|Analytics|Settings)<\/span>/);
});
