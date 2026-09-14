import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const page = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const runtimeUrl = new URL('../assets/booking-settings-tabs.js', import.meta.url);

function loadFeature(hash = '', query = '?tab=settings') {
  const dom = new JSDOM(page, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: `https://merchant.nexora.test/html/pages/booking-book-phase-1.html${query}${hash}`,
  });
  const { window } = dom;
  const styles = window.document.createElement('style');
  styles.textContent = readFileSync(new URL('../assets/booking-settings-tabs.css', import.meta.url), 'utf8');
  window.document.head.appendChild(styles);
  const cards = [...window.document.querySelectorAll('#panel-settings .settings-card')];
  assert.ok(existsSync(runtimeUrl), 'Settings tabs runtime must exist');
  window.eval(readFileSync(runtimeUrl, 'utf8'));
  return { dom, window, document: window.document, cards };
}

function tab(document, name) {
  const button = document.querySelector(`[data-settings-tab="${name}"]`);
  assert.ok(button, `Expected ${name} tab`);
  return button;
}

function assertActive(document, name) {
  const saveBar = document.querySelector('.settings-save-bar');
  assert.equal(saveBar.hidden, name === 'knowledge');
  assert.equal(document.defaultView.getComputedStyle(saveBar).display === 'none', name === 'knowledge');
  const selected = [...document.querySelectorAll('[data-settings-tab]')]
    .filter((button) => button.getAttribute('aria-selected') === 'true');
  assert.deepEqual(selected.map((button) => button.dataset.settingsTab), [name]);
  document.querySelectorAll('[data-settings-tab]').forEach((button) => {
    const active = button.dataset.settingsTab === name;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    assert.equal(button.tabIndex, active ? 0 : -1);
    assert.equal(panel.hidden, !active);
    assert.equal(panel.getAttribute('role'), 'tabpanel');
    assert.equal(panel.getAttribute('aria-labelledby'), button.id);
  });
}

test('groups existing settings cards into five accessible tabs with business hours in Salon information', (t) => {
  const { dom, document, cards } = loadFeature();
  t.after(() => dom.window.close());
  assert.equal(document.querySelector('[data-settings-tabs]').getAttribute('role'), 'tablist');
  assert.equal(document.querySelector('[data-settings-tabs]').hidden, false);
  assertActive(document, 'information');
  const expected = [
    ['information', ['Salon Info', 'Operating Hours', 'Holiday & Closures', 'Booking Policies']],
    ['services', ['Services & Pricing']],
    ['voice', ['AIAI Voice', 'Booking SMS Notifications']],
    ['knowledge', ['Knowledge files']],
    ['team', ['Team']],
  ];
  for (const [name, titles] of expected) {
    const panel = document.getElementById(tab(document, name).getAttribute('aria-controls'));
    assert.deepEqual([...panel.querySelectorAll('.settings-card-title')].map((title) => title.textContent.trim()), titles);
    panel.querySelectorAll('.settings-card').forEach((card) => assert.ok(cards.includes(card)));
  }
  assert.equal(document.querySelector('[data-settings-tab="hours"]'), null);
  assert.equal(document.querySelector('[data-settings-tab-panel="hours"]'), null);
  assert.equal(document.querySelectorAll('#panel-settings .settings-card').length, cards.length);
  for (const selector of ['[data-service-modal]', '[data-settings-holiday-modal]', '.settings-save-bar']) {
    const node = document.querySelector(selector);
    assert.ok(node.closest('#panel-settings'));
    assert.equal(node.closest('[data-settings-tab-panel]'), null, `${selector} must remain outside hidden subpanels`);
  }
});

test('switching settings sections retains unsaved values and existing action listeners', (t) => {
  const { dom, window, document } = loadFeature();
  t.after(() => dom.window.close());
  const name = document.querySelector('.settings-salon-name-field input');
  name.value = 'Updated salon name';
  const save = document.querySelector('[data-settings-action="save"]');
  save.addEventListener('click', () => { name.dataset.saved = name.value; });
  const topTabsBefore = [...document.querySelectorAll('[data-tab-target]')].map((button) => button.outerHTML);
  tab(document, 'knowledge').click();
  assertActive(document, 'knowledge');
  assert.equal(document.querySelector('[data-settings-knowledge]').closest('[hidden]'), null);
  tab(document, 'information').click();
  assertActive(document, 'information');
  assert.equal(document.querySelector('.settings-salon-name-field input'), name);
  assert.equal(name.value, 'Updated salon name');
  save.click();
  assert.equal(name.dataset.saved, 'Updated salon name');
  assert.deepEqual([...document.querySelectorAll('[data-tab-target]')].map((button) => button.outerHTML), topTabsBefore);
  assert.equal(window.location.search, '?tab=settings');
});

test('arrow keys wrap tabs while Home and End focus the first and last sections', (t) => {
  const { dom, window, document } = loadFeature();
  t.after(() => dom.window.close());
  tab(document, 'information').focus();
  for (const [key, expected] of [['ArrowLeft', 'team'], ['ArrowRight', 'information'], ['End', 'team'], ['Home', 'information'], ['ArrowRight', 'services']]) {
    const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    document.activeElement.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
    assertActive(document, expected);
    assert.equal(document.activeElement, tab(document, expected));
    assert.equal(window.location.hash, '#settings-' + expected);
  }
});

test('subtab clicks update shareable URLs without losing query parameters or duplicating history', (t) => {
  const { dom, window, document } = loadFeature('', '?tab=settings&salon=demo');
  t.after(() => dom.window.close());
  window.history.replaceState({ tab: 'settings', source: 'sidebar' }, '', window.location.href);
  const originalLength = window.history.length;
  tab(document, 'services').click();
  assert.equal(window.location.search, '?tab=settings&salon=demo');
  assert.equal(window.location.hash, '#settings-services');
  assert.equal(window.history.state.source, 'sidebar');
  assert.equal(window.history.length, originalLength + 1);
  tab(document, 'services').click();
  assert.equal(window.history.length, originalLength + 1);
  tab(document, 'knowledge').click();
  assert.equal(window.location.hash, '#settings-knowledge');
  const reloaded = loadFeature(window.location.hash, window.location.search);
  t.after(() => reloaded.dom.window.close());
  assertActive(reloaded.document, 'knowledge');
});

test('Back and Forward restore each subtab including the default URL without adding history', { timeout: 3000 }, async (t) => {
  const { dom, window, document } = loadFeature();
  t.after(() => dom.window.close());
  tab(document, 'services').click();
  tab(document, 'knowledge').click();
  assert.equal(window.location.hash, '#settings-knowledge');
  const historyLength = window.history.length;
  async function travel(direction, expected) {
    const changed = new Promise((resolve) => window.addEventListener('popstate', resolve, { once: true }));
    window.history[direction]();
    await changed;
    assertActive(document, expected);
    assert.equal(window.history.length, historyLength);
  }
  await travel('back', 'services');
  await travel('back', 'information');
  assert.equal(window.location.hash, '');
  await travel('forward', 'services');
  await travel('forward', 'knowledge');
});

test('legacy business-hours URLs open Salon information without hijacking main navigation', (t) => {
  const { dom, window, document } = loadFeature('#settings-hours', '?tab=booking');
  t.after(() => dom.window.close());
  const start = page.indexOf('    function getValidMainTab(');
  const end = page.indexOf('    function activateSubTab(', start);
  window.eval('var DEFAULT_MAIN_TAB = "booking"; function setBookingFilterOpen() {}\n' + page.slice(start, end));
  window.activateMainTabFromUrl();
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert.equal(window.location.search, '?tab=booking');
  assert.equal(document.querySelector('[data-tab-target="booking"]').getAttribute('aria-selected'), 'true');
  assert.equal(document.getElementById('panel-settings').classList.contains('is-active'), false);
  window.activateMainTab('settings');
  assertActive(document, 'information');
  assert.equal(window.location.hash, '#settings-hours');
  assert.equal(document.getElementById('panel-settings').classList.contains('is-active'), true);
});

test('knowledge preview anchors select the right section and unrelated anchors are ignored', (t) => {
  const { dom, window, document } = loadFeature('#settings-knowledge');
  t.after(() => dom.window.close());
  assertActive(document, 'knowledge');
  window.history.replaceState(null, '', '?tab=settings#settings-hours');
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assertActive(document, 'information');
  window.history.replaceState(null, '', '?tab=settings#other-feature');
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assertActive(document, 'information');
});

test('initialization is idempotent and Team relocation keeps its existing panel', (t) => {
  const { dom, window, document } = loadFeature();
  t.after(() => dom.window.close());
  const originalTeam = document.querySelector('[data-booking-sub-panel="team"]');
  const start = page.indexOf('    function moveTeamPanelToSettings()');
  const end = page.indexOf('    function activateBookingSubTab(', start);
  assert.ok(start > 0 && end > start);
  window.eval(`${page.slice(start, end)}\nmoveTeamPanelToSettings();`);
  window.eval(readFileSync(runtimeUrl, 'utf8'));
  tab(document, 'team').click();
  assertActive(document, 'team');
  assert.equal(document.querySelector('[data-settings-team-slot]').firstElementChild, originalTeam);
  assert.equal(originalTeam.closest('[data-settings-tab-panel]').dataset.settingsTabPanel, 'team');
  assert.equal(document.querySelectorAll('[data-settings-tab]').length, 5);
});
