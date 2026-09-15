import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const SOURCE_DIR = new URL('../../../html/assets/', import.meta.url);

const SHELL_SOURCE = readFileSync(new URL('./nexora-shell.js', SOURCE_DIR), 'utf8');
const STAFF_STYLE = readFileSync(new URL('./staff-shell.css', SOURCE_DIR), 'utf8');
const ASSIGNMENTS_SOURCE = readFileSync(new URL('./service-assignments.js', SOURCE_DIR), 'utf8');
const ASSIGNMENTS_KEY = 'nexora-service-assignments-v1';

function staffShell(options = {}) {
  const instant = options.instant || '2026-09-16T03:30:00.000Z';
  const line = (id, techId = 'kayla', status = 'not-sent') => ({id, techId, status, revision: 1, price: 40});
  const state = {version: 1, date: '2026-09-15', turnEntries: [], technicians: [
    {id: 'kayla', clockedIn: true, clockedInSalonId: 'golden'},
    {id: 'lana', clockedIn: true, clockedInSalonId: 'elite'},
  ], tickets: [
    {id: 'today', salonId: 'golden', services: [line('own-1'), line('own-2'), line('done', 'kayla', 'completed'), line('other', 'lana')]},
    {id: 'yesterday', salonId: 'golden', date: '2026-09-14', services: [line('old')]},
    {id: 'other-salon', salonId: 'elite', services: [line('away'), line('lana-elite', 'lana')]},
  ]};
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside class="sidebar staff-sidebar"></aside>
    <script>window.NEXORA_SHELL = { activePage: 'staff', activeTab: 'dashboard' };</script>
    ${options.missingStore ? '' : `<script>${ASSIGNMENTS_SOURCE}</script>`}
    <script>${SHELL_SOURCE}</script>
  </body></html>`, {
    runScripts: 'dangerously',
    url: 'https://staff.nexora.test/html/pages/staff-dashboard.html?technician=lana',
    beforeParse(window) {
      const RealDate = window.Date;
      window.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [instant])); }
        static now() { return new RealDate(instant).getTime(); }
      };
      if (Object.hasOwn(options, 'session')) window.NEXORA_STAFF_SESSION = options.session;
      if (!options.useDemo) window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(state));
    },
  });
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom;
}

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
  assert.equal(calendarLink?.previousElementSibling?.getAttribute('data-staff-nav'), 'my-tickets');
  assert.equal(dom.window.document.querySelector('[data-staff-nav="my-tickets"]')?.classList.contains('is-active'), false);

  dom.window.close();
});

test('every staff page shows its own salon-local pending count and updates after reassignment or removal', async () => {
  const dom = staffShell();
  const count = () => dom.window.document.querySelector('[data-staff-ticket-count]');
  assert.equal(count().hidden, false);
  assert.equal(count().textContent, '2');
  await dom.window.NEXORA_SERVICE_ASSIGNMENTS.assign('own-1', 'lana');
  assert.equal(count().textContent, '1');
  await dom.window.NEXORA_SERVICE_ASSIGNMENTS.editService('own-2', 'remove');
  assert.equal(count().hidden, false);
  assert.equal(count().textContent, '0');
  dom.window.close();
});

test('sidebar count uses the explicit staff session and never falls back from a signed-out session', () => {
  const signedIn = staffShell({instant: '2026-09-16T04:30:00.000Z', session: {staff: {id: 'lana'}, clockIn: {salonId: 'elite'}}});
  assert.equal(signedIn.window.document.querySelector('[data-staff-ticket-count]').textContent, '1');
  signedIn.window.close();
  const signedOut = staffShell({session: null});
  const count = signedOut.window.document.querySelector('[data-staff-ticket-count]');
  assert.equal(count.hidden, false);
  assert.equal(count.textContent, '0');
  signedOut.window.close();
});

test('sidebar does not invent a clock-in for missing, ended, invalid or future session clocks', () => {
  for (const clock of [undefined, null, {salonId: 'golden', endedAt: '2026-09-16T02:00:00Z'}, {salonId: 'golden', startedAt: '2026-09-17T00:00:00Z'}, {salonId: 'golden', startedAt: 'invalid'}]) {
    const session = {staff: {id: 'kayla'}};
    if (clock !== undefined) session.clockIn = clock;
    const dom = staffShell({session});
    assert.equal(dom.window.document.querySelector('[data-staff-ticket-count]').textContent, '0');
    dom.window.close();
  }
  const dom = staffShell({session: {staff: {id: 'kayla'}, clockIn: {salonId: 'golden', startedAt: '2026-09-16T00:00:00Z'}}});
  const state = dom.window.NEXORA_SERVICE_ASSIGNMENTS.load();
  state.technicians.find(technician => technician.id === 'kayla').clockedIn = false;
  dom.window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(state));
  dom.window.dispatchEvent(new dom.window.Event('focus'));
  assert.equal(dom.window.document.querySelector('[data-staff-ticket-count]').textContent, '0');
  dom.window.close();
});

test('staff pages without the assignment script load it once and refresh counts after storage and focus events', () => {
  const dom = staffShell({missingStore: true});
  const {window} = dom;
  const scripts = window.document.querySelectorAll('script[src="../assets/service-assignments.js"]');
  assert.equal(scripts.length, 1);
  window.eval(ASSIGNMENTS_SOURCE);
  scripts[0].dispatchEvent(new window.Event('load'));
  const count = window.document.querySelector('[data-staff-ticket-count]');
  assert.equal(count.hidden, false);
  assert.equal(count.textContent, '2');
  const state = window.NEXORA_SERVICE_ASSIGNMENTS.load();
  state.tickets[0].services[0].techId = 'lana';
  window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(state));
  window.dispatchEvent(new window.StorageEvent('storage', {key: ASSIGNMENTS_KEY}));
  assert.equal(count.textContent, '1');
  state.tickets[0].services[1].status = 'completed';
  window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(state));
  window.dispatchEvent(new window.Event('focus'));
  assert.equal(count.textContent, '0');
  dom.window.close();
});

test('staff sidebar links to My Tickets immediately above My Calendar and highlights only Tickets', () => {
  const dom = new JSDOM(`<!doctype html><html><head><style>${STAFF_STYLE}</style></head><body>
    <aside class="sidebar staff-sidebar" data-shell-sidebar></aside>
    <header class="topbar" data-shell-header></header>
    <script>window.NEXORA_SHELL = { activePage: 'staff', activeTab: 'my-tickets' };</script>
    <script>${SHELL_SOURCE}</script>
  </body></html>`, {
    runScripts: 'dangerously',
    url: 'https://staff.nexora.test/html/pages/staff-work-orders.html',
  });
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

  const ticketsLink = dom.window.document.querySelector('[data-staff-nav="my-tickets"]');
  assert.equal(ticketsLink?.getAttribute('href'), 'staff-work-orders.html');
  assert.equal(ticketsLink?.textContent.trim(), 'My Tickets');
  assert.ok(ticketsLink?.querySelector('[data-lucide="list-checks"]'));
  assert.equal(ticketsLink?.classList.contains('is-active'), true);
  assert.equal(ticketsLink?.nextElementSibling?.getAttribute('data-staff-nav'), 'my-calendar');
  assert.equal(ticketsLink?.nextElementSibling?.classList.contains('is-active'), false);

  const count = ticketsLink?.querySelector('[data-staff-ticket-count]');
  assert.ok(count);
  assert.equal(count.hidden, true);
  assert.equal(count.textContent, '');
  assert.equal(dom.window.getComputedStyle(count).display, 'none');
  count.hidden = false;
  count.textContent = '1';
  assert.equal(dom.window.getComputedStyle(count).backgroundColor, 'rgb(239, 75, 100)');
  assert.equal(dom.window.getComputedStyle(count).color, 'rgb(255, 255, 255)');

  dom.window.close();
});


test('sidebar reads the existing Work Orders demo without changing its data', () => {
  const dom = staffShell({useDemo:true, instant:'2026-09-15T16:00:00.000Z'});
  try {
    assert.equal(dom.window.document.querySelector('[data-staff-ticket-count]').textContent, '1');
    assert.equal(dom.window.localStorage.getItem(ASSIGNMENTS_KEY), null);
  } finally { dom.window.close(); }
});
