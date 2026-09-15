import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const source = readFileSync(new URL('./nexora-shell.js', import.meta.url), 'utf8');

function boot(t, page, tab, savedSession = [], configure) {
  const dom = new JSDOM('<!doctype html><aside class="sidebar"></aside><header class="header"></header>', {
    url: 'https://nexora.test/html/pages/' + page + '.html',
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  savedSession.forEach(([key, value]) => window.sessionStorage.setItem(key, value));
  window.NEXORA_SHELL = { activePage: page, activeTab: tab };
  configure?.(window);
  window.eval(source);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  return window;
}

function session(window) {
  return Object.entries(window.sessionStorage);
}

function group(window, key) {
  return window.document.querySelector('[aria-controls="nexora-subnav-' + key + '"]');
}

function assertRewardExpanded(window) {
  assert.ok(group(window, 'reward'), 'shared Reward menu is rendered');
  assert.equal(group(window, 'reward').getAttribute('aria-expanded'), 'true');
  const reward = window.document.getElementById('nexora-subnav-reward');
  assert.equal(reward.classList.contains('is-collapsed'), false);
  assert.deepEqual(Array.from(reward.querySelectorAll('.nav-subitem'), node => node.textContent), [
    'Overview', 'Earn Rules', 'Reward Catalog', 'AI Offers', 'Promotions', 'Customers', 'Loyalty Activity', 'Analytics'
  ]);
}

test('keeps Reward visible when moving from Promotions through Booking and POS', t => {
  const promotions = boot(t, 'reward', 'promotions');
  assertRewardExpanded(promotions);
  const booking = boot(t, 'booking', 'booking', session(promotions));
  assertRewardExpanded(booking);
  assert.equal(group(booking, 'booking').getAttribute('aria-expanded'), 'true');
  const pos = boot(t, 'pos', 'front-desk', session(booking));
  assertRewardExpanded(pos);
  assert.equal(group(pos, 'booking').getAttribute('aria-expanded'), 'true');
});

test('preserves manually opened and closed groups across reloads and sidebar refreshes', t => {
  const booking = boot(t, 'booking', 'booking');
  group(booking, 'reward').click();
  assertRewardExpanded(booking);
  booking.NEXORA_SHELL.refreshSidebar();
  assertRewardExpanded(booking);
  const reloaded = boot(t, 'booking', 'booking', session(booking));
  assertRewardExpanded(reloaded);
  group(reloaded, 'reward').click();
  const pos = boot(t, 'pos', 'front-desk', session(reloaded));
  assert.equal(group(pos, 'reward').getAttribute('aria-expanded'), 'false');
  const reward = boot(t, 'reward', 'ai-offers', session(pos));
  assertRewardExpanded(reward);
});

test('sidebar navigation still works when session storage is unavailable', t => {
  const window = boot(t, 'booking', 'booking', [], window => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage blocked'); } });
  });
  group(window, 'reward').click();
  assertRewardExpanded(window);
  window.NEXORA_SHELL.refreshSidebar();
  assertRewardExpanded(window);
});

test('both Promotions links reach the standalone Promotions page', t => {
  const window = boot(t, 'booking', 'booking');
  const links = Array.from(window.document.querySelectorAll('.sidebar a')).filter(node => node.textContent === 'Promotions');
  assert.equal(links.length, 2);
  links.forEach(link => assert.equal(link.getAttribute('href'), 'reward-promotions.html'));
});

test('staff keeps its separate menu without changing saved salon groups', t => {
  const reward = boot(t, 'reward', 'promotions');
  const saved = session(reward);
  const staff = boot(t, 'staff', 'my-tickets', saved);
  assert.equal(group(staff, 'reward'), null);
  assert.ok(staff.document.querySelector('.sidebar [data-staff-nav="my-tickets"].is-active'));
  assert.ok(staff.document.querySelector('.sidebar [data-staff-nav="my-calendar"]'));
  assert.deepEqual(session(staff), saved);
  assertRewardExpanded(boot(t, 'booking', 'booking', session(staff)));
});

test('renders the shared sidebar while the rest of the document is still loading', t => {
  const dom = new JSDOM('<!doctype html><aside class="sidebar">Old menu</aside><header class="header"></header>', { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  assert.equal(dom.window.document.readyState, 'loading');
  dom.window.NEXORA_SHELL = { activePage: 'reward', activeTab: 'promotions' };
  dom.window.eval(source);
  assertRewardExpanded(dom.window);
});

test('still initializes after parsing when loaded before the sidebar exists', t => {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  dom.window.NEXORA_SHELL = { activePage: 'reward', activeTab: 'overview' };
  dom.window.eval(source);
  dom.window.document.body.innerHTML = '<aside class="sidebar"></aside><header class="header"></header>';
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  assertRewardExpanded(dom.window);
});

test('waits for staff page dependencies before choosing an assignment loader', t => {
  const dom = new JSDOM('<!doctype html><aside class="sidebar"></aside><header class="header"></header>', { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.NEXORA_SHELL = { activePage: 'staff', activeTab: 'my-tickets' };
  window.eval(source);
  assert.equal(window.document.querySelectorAll('script').length, 0, 'must not inject a duplicate before the parser reaches the page dependency');
  const dependency = window.document.createElement('script');
  dependency.src = '../assets/service-assignments.js';
  window.document.body.append(dependency);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  assert.equal(window.document.querySelectorAll('script').length, 1);
  assert.ok(window.document.querySelector('[data-staff-nav="my-tickets"]'));
});
