import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const PAGE_URL = new URL('./pos-calendar.html', import.meta.url);

function loadPage(query = '') {
  assert.equal(existsSync(PAGE_URL), true, 'pos-calendar.html must exist');
  const html = readFileSync(PAGE_URL, 'utf8');
  const dom = new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: `https://staff.nexora.test/html/pages/pos-calendar.html${query}`,
  });
  return { dom, window: dom.window };
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert.ok(element, `Expected ${selector} to exist`);
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  return element;
}

test('My Calendar renders a seven-day selector and today schedule', () => {
  const { dom, window } = loadPage('?salon=golden');

  assert.equal(window.document.querySelectorAll('[data-calendar-day]').length, 7);
  assert.equal(window.document.querySelectorAll('[data-calendar-day].is-selected').length, 1);
  assert.equal(window.document.querySelectorAll('[data-calendar-appointment]').length, 4);
  assert.match(window.document.querySelector('[data-calendar-heading]')?.textContent || '', /4 appointments/);

  const firstTicket = window.document.querySelector('[data-calendar-appointment]');
  assert.match(firstTicket?.getAttribute('href') || '', /^staff-work-orders\.html\?salon=golden&ticket=WO-/);

  dom.window.close();
});

test('Today restores the selected date after another day is chosen', () => {
  const { dom, window } = loadPage();
  const calendar = window.document.querySelector('[data-calendar]');
  const today = calendar?.getAttribute('data-selected-date');
  const otherDay = [...window.document.querySelectorAll('[data-calendar-day]')]
    .find((day) => day.getAttribute('data-date') !== today);

  assert.ok(otherDay, 'Expected a non-today day in the visible week');
  otherDay.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.notEqual(calendar?.getAttribute('data-selected-date'), today);

  click(window, '[data-calendar-today]');
  assert.equal(calendar?.getAttribute('data-selected-date'), today);
  assert.equal(window.document.querySelector('[data-calendar-day].is-selected')?.getAttribute('data-date'), today);

  dom.window.close();
});

test('date query selects that date and preserves the salon in the back link', () => {
  const { dom, window } = loadPage('?date=2030-02-14&salon=elite');

  assert.equal(window.document.querySelector('[data-calendar]')?.getAttribute('data-selected-date'), '2030-02-14');
  assert.equal(window.document.querySelector('[data-work-orders-link]')?.getAttribute('href'), 'staff-work-orders.html?salon=elite');

  dom.window.close();
});
