import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const PAGE_URL = new URL('./staff-work-orders.html', import.meta.url);
const PAGE_HTML = readFileSync(PAGE_URL, 'utf8');

function loadPage(serviceCatalog = null) {
  const dom = new JSDOM(PAGE_HTML, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://staff.nexora.test/html/pages/staff-work-orders.html',
    beforeParse(window) {
      window.scrollTo = () => {};
      window.NEXORA_APPOINTMENT_SERVICE_CATALOG = {
        load() { return serviceCatalog ? Promise.resolve(serviceCatalog) : new Promise(() => {}); },
      };
    },
  });

  return { dom, window: dom.window };
}

const SERVICE_CATALOG = {
  categories: [
    {
      id: 'nails',
      name: 'Nails',
      services: [
        { id: 'polish-change', name: 'Polish Change', type: 'service', price: 15, durationMin: 20 },
        { id: 'nail-art', name: 'Nail Art', type: 'service', price: 12, durationMin: 15 },
      ],
    },
    {
      id: 'pedicure',
      name: 'Pedicure',
      services: [
        { id: 'spa-pedicure', name: 'Spa Pedicure', type: 'service', price: 55, durationMin: 45 },
      ],
    },
  ],
};

async function openAddServiceModal(window) {
  click(window, '[data-select-salon="golden"]');
  click(window, '[data-featured-ticket] [data-ticket-id="WO-1051"]');
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  click(window, '[data-request-service="WO-1051"]');
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

test('View calendar carries the selected date and salon to My Calendar', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  const calendarLink = window.document.querySelector('[data-view-calendar]');

  assert.equal(calendarLink?.getAttribute('href'), `pos-calendar.html?date=${window.document.querySelector('[data-date-filter]')?.value}&salon=golden`);

  dom.window.close();
});

test('Today returns the date filter to the current day', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  const dateInput = window.document.querySelector('[data-date-filter]');
  const today = dateInput?.value;

  click(window, '[data-date-step="1"]');
  assert.notEqual(dateInput?.value, today);

  click(window, '[data-date-today]');
  assert.equal(dateInput?.value, today);
  assert.equal(window.document.querySelector('[data-date-label]')?.textContent.trim(), 'Today');

  dom.window.close();
});

test('service search icon stays inside the input after Lucide renders the SVG', () => {
  const { dom, window } = loadPage();
  const { document } = window;
  const sourceIcon = document.querySelector('.service-picker-search [data-lucide="search"]');
  const renderedIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  assert.ok(sourceIcon, 'Expected the service search icon to exist');
  renderedIcon.setAttribute('class', 'lucide lucide-search');
  sourceIcon.replaceWith(renderedIcon);

  assert.equal(window.getComputedStyle(renderedIcon).position, 'absolute');
  assert.equal(window.getComputedStyle(renderedIcon).left, '12px');
  assert.equal(window.getComputedStyle(document.querySelector('[data-service-picker-search]')).paddingLeft, '37px');

  dom.window.close();
});

test('Add service selects and adds multiple catalog services in one confirmation', async () => {
  const { dom, window } = loadPage(SERVICE_CATALOG);
  await openAddServiceModal(window);

  click(window, '[data-catalog-service="polish-change"]');
  click(window, '[data-catalog-service="nail-art"]');

  assert.equal(window.document.querySelector('[data-confirm-service-picker]')?.textContent.trim(), 'Add services (2)');
  assert.equal(window.document.querySelectorAll('[data-catalog-service][aria-pressed="true"]').length, 2);

  click(window, '[data-confirm-service-picker]');
  const serviceNames = [...window.document.querySelectorAll('[data-detail-panel] .service-name')].map((element) => element.textContent);
  const pendingNames = [...window.document.querySelectorAll('[data-customer-approval] .customer-approval-chip-name')].map((element) => element.textContent);
  assert.equal(serviceNames.filter((name) => name.includes('Polish Change')).length, 0);
  assert.equal(serviceNames.filter((name) => name.includes('Nail Art')).length, 0);
  assert.equal(pendingNames.filter((name) => name.includes('Polish Change')).length, 1);
  assert.equal(pendingNames.filter((name) => name.includes('Nail Art')).length, 1);

  dom.window.close();
});

test('Add service permits the same catalog service again in a later confirmation', async () => {
  const { dom, window } = loadPage(SERVICE_CATALOG);
  await openAddServiceModal(window);

  click(window, '[data-catalog-service="polish-change"]');
  click(window, '[data-confirm-service-picker]');
  click(window, '[data-request-service="WO-1051"]');
  click(window, '[data-catalog-service="polish-change"]');
  click(window, '[data-confirm-service-picker]');

  const pendingNames = [...window.document.querySelectorAll('[data-customer-approval] .customer-approval-chip-name')].map((element) => element.textContent);
  assert.equal(pendingNames.filter((name) => name.includes('Polish Change')).length, 2);

  dom.window.close();
});

test('approved pending services move into the main service table', async () => {
  const { dom, window } = loadPage(SERVICE_CATALOG);
  await openAddServiceModal(window);

  click(window, '[data-catalog-service="polish-change"]');
  click(window, '[data-confirm-service-picker]');
  const approvalCode = window.document.querySelector('[data-approval-code]');
  approvalCode.value = '0127';
  click(window, '[data-approve-services="WO-1051"]');

  const serviceNames = [...window.document.querySelectorAll('[data-detail-panel] .service-name')].map((element) => element.textContent);
  assert.equal(serviceNames.filter((name) => name.includes('Polish Change')).length, 1);
  assert.equal(window.document.querySelector('[data-customer-approval]'), null);

  dom.window.close();
});

test('service categories collapse so opening one closes the previous category', async () => {
  const { dom, window } = loadPage(SERVICE_CATALOG);
  await openAddServiceModal(window);
  const categories = [...window.document.querySelectorAll('[data-service-picker-category]')];

  assert.equal(categories.length, 2);
  assert.equal(categories.every((category) => category.tagName === 'DETAILS'), true);
  assert.equal(categories.every((category) => category.open === false), true);

  categories[0].open = true;
  categories[0].dispatchEvent(new window.Event('toggle'));
  categories[1].open = true;
  categories[1].dispatchEvent(new window.Event('toggle'));

  assert.equal(categories[0].open, false);
  assert.equal(categories[1].open, true);

  dom.window.close();
});

test('service picker keeps each option compact without duration or category metadata', async () => {
  const { dom, window } = loadPage(SERVICE_CATALOG);
  await openAddServiceModal(window);

  assert.equal(window.document.querySelectorAll('.service-picker-meta').length, 0);
  assert.equal(window.document.querySelector('[data-catalog-service="polish-change"] .service-picker-name')?.textContent.trim(), 'Polish Change');
  assert.equal(window.document.querySelector('[data-catalog-service="polish-change"] .service-picker-price')?.textContent.trim(), '$15.00');

  dom.window.close();
});

test('work order details omit legacy add-ons and exclude them from the total', () => {
  const { dom, window } = loadPage();

  click(window, '[data-select-salon="golden"]');
  click(window, '[data-status-filter="in-service"]');
  click(window, '[data-orders-list] [data-ticket-id="WO-1042"]');

  assert.equal(window.document.querySelectorAll('[data-detail-panel] .addon-row').length, 0);
  assert.equal(window.document.querySelector('[data-detail-panel] .ticket-total strong')?.textContent.trim(), '$42.00');

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
