import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const PAGE_URL = new URL('./staff-work-orders.html', import.meta.url);
const PAGE_HTML = readFileSync(PAGE_URL, 'utf8');

function loadPage() {
  const dom = new JSDOM(PAGE_HTML, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://staff.nexora.test/html/pages/staff-work-orders.html',
    beforeParse(window) {
      window.scrollTo = () => {};
      window.NEXORA_APPOINTMENT_SERVICE_CATALOG = {
        load() { return new Promise(() => {}); },
      };
    },
  });

  return { dom, window: dom.window };
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert.ok(element, `Expected ${selector} to exist`);
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  return element;
}

test('highlights the most recently assigned ticket without duplicating it in Up next', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');

  const featured = window.document.querySelector('[data-featured-ticket-id]');
  const upcomingIds = [...window.document.querySelectorAll('[data-orders-list] [data-ticket-id]')]
    .map((ticket) => ticket.getAttribute('data-ticket-id'));

  assert.ok(featured, 'Newest assigned ticket must be highlighted');
  assert.equal(featured.getAttribute('data-featured-ticket-id'), 'WO-1051');
  assert.match(featured.textContent, /New assignment/);
  assert.match(featured.textContent, /Sophia Martinez/);
  assert.deepEqual(upcomingIds, ['WO-1048']);

  dom.window.close();
});

test('View ticket opens the highlighted assignment in the existing detail flow', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  click(window, '[data-featured-ticket] [data-ticket-id="WO-1051"]');

  assert.equal(window.document.querySelector('[data-workspace]').classList.contains('is-detail-mode'), true);
  assert.equal(window.document.querySelector('[data-detail-panel] .detail-code')?.textContent.trim(), 'WO-1051');

  dom.window.close();
});

test('starting the highlighted ticket promotes the next assigned ticket', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  click(window, '[data-featured-ticket] [data-ticket-id="WO-1051"]');
  click(window, '[data-start-ticket="WO-1051"]');

  assert.equal(window.document.querySelector('[data-featured-ticket-id]')?.getAttribute('data-featured-ticket-id'), 'WO-1048');
  assert.equal(window.document.querySelector('[data-detail-panel] .detail-code')?.textContent.trim(), 'WO-1051');

  dom.window.close();
});

test('View calendar moves focus to the existing date picker', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  click(window, '[data-view-calendar]');

  assert.equal(window.document.activeElement, window.document.querySelector('[data-date-filter]'));

  dom.window.close();
});

test('Up next renders a compact readable appointment summary', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  const upcoming = window.document.querySelector('[data-orders-list] [data-ticket-id="WO-1048"]');

  assert.equal(upcoming?.querySelector('.order-time-value')?.textContent.trim(), '9:30');
  assert.equal(upcoming?.querySelector('.order-time-period')?.textContent.trim(), 'AM');
  assert.equal(upcoming?.querySelector('.customer-name')?.textContent.trim(), 'Emma Williams · Deluxe Pedicure');
  assert.equal(upcoming?.querySelector('.order-service')?.textContent.trim(), '75 min · Station 08');

  dom.window.close();
});

test('status filters omit All and show live counts with Assigned active by default', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  const filters = [...window.document.querySelectorAll('[data-status-filter]')];

  assert.deepEqual(filters.map((filter) => filter.getAttribute('data-status-filter')), ['assigned', 'in-service', 'completed']);
  assert.equal(filters[0].getAttribute('aria-selected'), 'true');
  assert.deepEqual(filters.map((filter) => filter.querySelector('[data-status-count]')?.textContent.trim()), ['2', '1', '1']);

  dom.window.close();
});

test('each status chip has its own soft background color', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  const backgrounds = [...window.document.querySelectorAll('[data-status-filter]')]
    .map((filter) => window.getComputedStyle(filter).backgroundColor);

  assert.equal(new Set(backgrounds).size, 3);

  dom.window.close();
});
