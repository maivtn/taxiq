import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';

function boot(page, saved = {}) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(readFileSync(new URL(page, import.meta.url), 'utf8'), {
    url: 'https://example.test/html/pages/' + page, runScripts: 'outside-only', virtualConsole: vc
  });
  const w = dom.window;
  w.structuredClone = structuredClone;
  w.matchMedia = () => ({matches: false});
  for (const [key, value] of Object.entries(saved)) w.localStorage.setItem(key, value);
  for (const script of dom.window.document.querySelectorAll('script')) {
    if (script.src && !script.src.startsWith('https://example.test/')) continue;
    if (script.src.includes('nexora-shell')) continue;
    const path = script.src && new URL('../assets/' + script.src.split('/').at(-1), import.meta.url);
    if (path && !existsSync(path)) continue;
    w.eval(path ? readFileSync(path, 'utf8') : script.textContent);
  }
  for (const el of w.document.querySelectorAll("[onclick]")) el.onclick = w.Function("event", el.getAttribute("onclick"));
  return {dom, w, d: w.document, errors};
}
function openCalendar(app) {
  app.d.querySelector('[data-view="calendar"]').click();
  app.d.querySelector('#calendar-reward-settings').click();
  return app.d.querySelector('#team-calendar').shadowRoot;
}
function saved(app) { return Object.fromEntries(Object.entries(app.w.localStorage)); }

test('saved booking and service turns flow from Calendar to Turn Board and back after reload', t => {
  const calendar = boot('pos-front-desk.html'); t.after(() => calendar.dom.window.close());
  const root = openCalendar(calendar);
  assert.equal(root.querySelectorAll('[data-service-weight]').length, 4, 'Calendar exposes shared service turns');
  root.querySelector('#turn-credit').value = '1.5';
  root.querySelectorAll('[data-service-weight]')[1].value = '2';
  root.querySelector('#turn-credit').dispatchEvent(new calendar.w.Event('input', {bubbles: true}));
  root.querySelector('#save-policy').click();
  assert.equal(root.querySelector('#reward-settings-drawer').getAttribute('aria-hidden'), 'true');
  assert.match(root.querySelector('.policy-chip').textContent, /1.5 booking turn/);

  const board = boot('pos-front-desk-turn-board.html', saved(calendar)); t.after(() => board.dom.window.close());
  board.w.openTurnRules();
  assert.equal(board.d.querySelector('#booking-turn-credit').value, '1.5');
  assert.equal(board.d.querySelectorAll('[data-service-weight]')[1].value, '2');
  board.w.openAddTurn(0);
  assert.equal(board.d.querySelector('#add-turn-credit').value, '2');
  board.w.closeAddTurn();
  board.d.querySelector('#booking-turn-credit').value = '0';
  board.d.querySelectorAll('[data-service-weight]')[1].value = '0.5';
  board.w.saveTurnRules();
  assert.match(board.d.querySelector('.compact-row:not(.header)').textContent, /4T/, 'existing turns are unchanged');

  const reloaded = boot('pos-front-desk.html', saved(board)); t.after(() => reloaded.dom.window.close());
  const updated = openCalendar(reloaded);
  assert.equal(updated.querySelector('#turn-credit').value, '0');
  assert.equal(updated.querySelectorAll('[data-service-weight]')[1].value, '0.5');
  assert.equal(updated.querySelector('.tech-overview-row').children[4].textContent, '0.0');
  for (const app of [calendar, board, reloaded]) assert.deepEqual(app.errors, []);
});

test('cancel and invalid turn values never save settings', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.dom.window.close());
  assert.equal(typeof app.w.openTurnRules, 'function', 'settings load when opened');
  app.w.openTurnRules();
  const input = app.d.querySelector('[data-service-weight]');
  input.value = '8';
  app.d.querySelector('#turn-rules-modal .modal-actions .btn').click();
  app.w.openTurnRules();
  assert.equal(input.value, '0.5');
  for (const invalid of ['', '-1', 'Infinity']) {
    input.value = invalid; app.w.saveTurnRules();
    assert.ok(app.d.querySelector('#turn-rules-modal').classList.contains('show'));
    assert.equal(app.w.calculateTurnCredit(20), 0.5);
  }
  assert.deepEqual(app.errors, []);
});

function syncStorage(from, to) {
  for (const [key, value] of Object.entries(saved(from))) {
    const oldValue = to.w.localStorage.getItem(key);
    to.w.localStorage.setItem(key, value);
    to.w.dispatchEvent(new to.w.StorageEvent('storage', {key, oldValue, newValue: value, storageArea: to.w.localStorage}));
  }
}

test('open forms synchronize shared turns across tabs while preserving reward drafts and custom overrides', t => {
  const calendar = boot('pos-front-desk.html'), board = boot('pos-front-desk-turn-board.html');
  t.after(() => { calendar.dom.window.close(); board.dom.window.close(); });
  const root = openCalendar(calendar);
  root.querySelector('[data-structure="flat"]').click();
  root.querySelector('#flat-rate').value = '7';
  root.querySelector('[name="scope"][value="technician"]').checked = true;
  root.querySelector('[name="scope"][value="technician"]').dispatchEvent(new calendar.w.Event('change', {bubbles: true}));
  const override = root.querySelector('[data-override-tech]');
  override.querySelector('[data-override-mode]').value = 'custom';
  override.querySelector('[data-override-turn]').value = '1.25';
  board.w.openTurnRules();
  board.d.querySelector('#booking-turn-credit').value = '2';
  board.w.saveTurnRules();
  syncStorage(board, calendar);
  assert.equal(root.querySelector('#turn-credit').value, '2');
  assert.equal(root.querySelector('#flat-rate').value, '7');
  assert.equal(root.querySelector('[data-override-turn]').value, '1.25');
  root.querySelector('#save-policy').click();
  calendar.d.querySelector('#calendar-reward-settings').click();
  assert.equal(root.querySelector('[data-override-turn]').value, '1.25', 'custom credit survives reopening');
  board.w.openTurnRules();
  root.querySelectorAll('[data-service-weight]')[1].value = '1.25';
  root.querySelector('#save-policy').click();
  syncStorage(calendar, board);
  assert.equal(board.d.querySelectorAll('[data-service-weight]')[1].value, '1.25');
  board.w.openAddTurn(0);
  assert.equal(board.d.querySelector('#add-turn-credit').value, '1.25');
  board.d.querySelector('#add-turn-reason').value = 'Missing service';
  board.w.saveAddedTurn();
  assert.match(board.d.querySelector('.compact-row:not(.header)').textContent, /5.25T/);
  assert.deepEqual(calendar.errors, []); assert.deepEqual(board.errors, []);
});

test('Calendar rejects empty or negative turns and leaves its drawer open if storage fails', t => {
  const app = boot('pos-front-desk.html'); t.after(() => app.dom.window.close());
  const root = openCalendar(app);
  for (const selector of ['#turn-credit', '[data-service-weight]']) {
    const input = root.querySelector(selector), original = input.value;
    for (const value of ['', '-1']) {
      input.value = value;
      input.dispatchEvent(new app.w.Event('input', {bubbles: true}));
      assert.equal(root.querySelector('#save-policy').disabled, true);
      assert.equal(app.w.NEXORA_TURN_SETTINGS.load().bookingTurnCredit, 0.5);
    }
    input.value = original;
  }
  root.querySelector('#turn-credit').value = '1';
  root.querySelector('#turn-credit').dispatchEvent(new app.w.Event('input', {bubbles: true}));
  app.w.Storage.prototype.setItem = () => { throw new Error('Storage full'); };
  root.querySelector('#save-policy').click();
  assert.equal(root.querySelector('#reward-settings-drawer').getAttribute('aria-hidden'), 'false');
  assert.match(root.querySelector('#policy-validation').textContent, /Could not save/);
  assert.match(root.querySelector('.policy-chip').textContent, /0.5 booking turn/);
  assert.deepEqual(app.errors, []);
});

test('standalone Team Calendar reads the same saved defaults and handles damaged settings', t => {
  const board = boot('pos-front-desk-turn-board.html'); t.after(() => board.dom.window.close());
  board.w.openTurnRules(); board.d.querySelector('#booking-turn-credit').value = '3'; board.w.saveTurnRules();
  const standalone = boot('team-calendar.html', saved(board)); t.after(() => standalone.dom.window.close());
  standalone.d.querySelector('#reward-settings-button').click();
  assert.equal(standalone.d.querySelector('#turn-credit').value, '3');
  const key = Object.keys(saved(board)).find(key => key.includes('turn-settings'));
  const broken = boot('pos-front-desk-turn-board.html', {[key]: '{broken'}); t.after(() => broken.dom.window.close());
  assert.equal(broken.w.calculateTurnCredit(29.99), 0.5);
  assert.equal(broken.w.calculateTurnCredit(30), 1);
  assert.equal(broken.w.calculateTurnCredit(70), 1.5);
  assert.equal(broken.w.calculateTurnCredit(110), 2);
  assert.deepEqual(standalone.errors, []); assert.deepEqual(broken.errors, []);
});

test('Overview shows fractional booking credits without rounding them to tenths', t => {
  const app = boot('pos-front-desk.html'); t.after(() => app.dom.window.close());
  const root = openCalendar(app);
  root.querySelector('#turn-credit').value = '1.25';
  root.querySelector('#save-policy').click();
  const row = [...root.querySelectorAll('.tech-overview-row')].find(row => row.children[1].textContent === '3');
  assert.ok(row, 'demo includes a technician with three completed bookings');
  assert.equal(row.children[4].textContent, '3.75');
  assert.deepEqual(app.errors, []);
});

test('changing service weights preserves existing Turn Grid credits after rerender', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.dom.window.close());
  app.w.setBoardMode('grid');
  const before = app.d.querySelector('.turn-cell.done').textContent;
  app.w.openTurnRules();
  app.d.querySelectorAll('[data-service-weight]')[1].value = '8';
  app.w.saveTurnRules(); app.w.renderTurnBoard();
  assert.equal(app.d.querySelector('.turn-cell.done').textContent, before);
  app.w.openAddTurn(0);
  assert.equal(app.d.querySelector('#add-turn-credit').value, '8');
});
