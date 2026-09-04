import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const SHELL_SOURCE = readFileSync(new URL('./nexora-shell.js', import.meta.url), 'utf8');

test('staff sidebar links to My Calendar and marks it active on the calendar page', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside class="sidebar staff-sidebar" data-shell-sidebar></aside>
    <header class="topbar" data-shell-header></header>
    <script>window.NEXORA_SHELL = { activePage: 'staff', activeTab: 'my-calendar' };</script>
    <script>${SHELL_SOURCE}</script>
  </body></html>`, {
    runScripts: 'dangerously',
    url: 'https://staff.nexora.test/html/pages/pos-calendar.html',
  });
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

  const calendarLink = dom.window.document.querySelector('[data-staff-nav="my-calendar"]');
  assert.equal(calendarLink?.getAttribute('href'), 'pos-calendar.html');
  assert.match(calendarLink?.textContent || '', /My Calendar/);
  assert.equal(calendarLink?.classList.contains('is-active'), true);
  assert.equal(calendarLink?.querySelector('[data-staff-calendar-count]')?.textContent.trim(), '4');

  dom.window.close();
});
