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
  const boardScripts = [];
  for (const script of dom.window.document.querySelectorAll('script')) {
    if (script.src && !script.src.startsWith('https://example.test/')) continue;
    if (script.src.includes('nexora-shell')) continue;
    const path = script.src && new URL('../assets/' + script.src.split('/').at(-1), import.meta.url);
    if (path && !existsSync(path)) continue;
    const source = path ? readFileSync(path, 'utf8') : script.textContent;
    // Browser classic scripts share global lexical bindings across the board assets.
    if (page === 'pos-front-desk-turn-board.html') boardScripts.push(source);
    else w.eval(source);
  }
  if (boardScripts.length) w.eval(boardScripts.join('\n'));
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

test('editable Up to amounts include their boundary and persist after saving and reloading', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.w.close());
  app.w.setBoardMode('grid');
  const recorded = app.d.querySelector('.turn-cell.done').textContent;
  app.w.openTurnRules();
  const thresholds = [...app.d.querySelectorAll('[data-service-upper-bound]')];
  assert.equal(thresholds.length, 3, 'Up to amounts for the first three ranges can be edited');
  thresholds.forEach((input, index) => { input.value = ['50.25', '90', '150'][index]; });
  thresholds[0].dispatchEvent(new app.w.Event('input', {bubbles: true}));
  assert.equal(app.d.querySelector('[data-service-range-start="0"]').textContent, '$50.26');
  assert.match(app.d.querySelector('#turn-rules-preview-result').textContent, /0\.5 turns/);
  assert.equal(app.w.calculateTurnCredit(45), 1, 'a preview must not apply an unsaved rule');
  app.w.saveTurnRules();
  assert.equal(app.d.querySelector('#turn-rules-modal').classList.contains('show'), false);
  const reloaded = boot('pos-front-desk-turn-board.html', saved(app)); t.after(() => reloaded.w.close());
  for (const [amount, credit] of [[0, 0.5], [50.25, 0.5], [50.26, 1], [90, 1], [90.01, 1.5], [150, 1.5], [150.01, 2]]) {
    assert.equal(reloaded.w.calculateTurnCredit(amount), credit, `credit for $${amount}`);
  }
  reloaded.w.openTurnRules();
  assert.equal(reloaded.d.querySelector('[data-service-upper-bound]').value, '50.25');
  app.w.renderTurnBoard();
  assert.equal(app.d.querySelector('.turn-cell.done').textContent, recorded);
  app.w.openAddTurn(0);
  assert.equal(app.d.querySelector('#add-turn-credit').value, '0.5');
  assert.deepEqual(app.errors, []); assert.deepEqual(reloaded.errors, []);
});

test('invalid or cancelled range edits never replace saved rules and storage errors keep the draft open', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.w.close());
  app.w.openTurnRules();
  const input = app.d.querySelector('[data-service-upper-bound]');
  assert.ok(input, 'the amount field is available');
  const original = JSON.stringify(app.w.NEXORA_TURN_SETTINGS.load());
  for (const invalid of ['', '-1', '69.99', '70', '30.001', '-0.001', 'Infinity', '1e100']) {
    input.value = invalid;
    input.dispatchEvent(new app.w.Event('input', {bubbles: true}));
    app.w.saveTurnRules();
    assert.ok(app.d.querySelector('#turn-rules-modal').classList.contains('show'));
    assert.ok(app.d.querySelector('#turn-rules-error').textContent);
    assert.equal(JSON.stringify(app.w.NEXORA_TURN_SETTINGS.load()), original);
  }
  input.value = '50';
  app.d.querySelector('#turn-rules-modal .modal-actions .btn').click();
  app.w.openTurnRules();
  assert.equal(input.value, '29.99');
  input.value = '50';
  app.w.Storage.prototype.setItem = () => { throw new Error('Storage full'); };
  app.w.saveTurnRules();
  assert.ok(app.d.querySelector('#turn-rules-modal').classList.contains('show'));
  assert.equal(input.value, '50');
  assert.match(app.d.querySelector('#turn-rules-error').textContent, /Could not save/);
  assert.equal(app.w.calculateTurnCredit(45), 1);
  assert.deepEqual(app.errors, []);
});

test('custom ranges synchronize Calendar labels and survive saving booking policy in both calendars', t => {
  const board = boot('pos-front-desk-turn-board.html'); t.after(() => board.w.close());
  const calendar = boot('pos-front-desk.html'); t.after(() => calendar.w.close());
  const root = openCalendar(calendar);
  const result = board.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 1.5, 2], serviceThresholds: [50, 90, 150]});
  assert.equal(result.ok, true);
  syncStorage(board, calendar);
  assert.match(root.querySelector('[data-service-weight="0"]').closest('label').textContent, /\$0–49\.99/);
  root.querySelector('#turn-credit').value = '2';
  root.querySelector('#save-policy').click();
  assert.equal(calendar.w.NEXORA_TURN_SETTINGS.serviceCredit(45), 0.5);
  const standalone = boot('team-calendar.html', saved(calendar)); t.after(() => standalone.w.close());
  standalone.d.querySelector('#reward-settings-button').click();
  assert.match(standalone.d.querySelector('[data-service-weight="3"]').closest('label').textContent, /\$150\+/);
  standalone.d.querySelector('#turn-credit').value = '3';
  standalone.d.querySelector('#save-policy').click();
  assert.equal(standalone.w.NEXORA_TURN_SETTINGS.serviceCredit(45), 0.5);
  for (const app of [board, calendar, standalone]) assert.deepEqual(app.errors, []);
});

test('old saved credits migrate to default amounts and malformed ranges fall back safely', t => {
  const source = boot('pos-front-desk-turn-board.html'); t.after(() => source.w.close());
  source.w.saveTurnRules();
  const key = Object.keys(saved(source)).find(key => key.includes('turn-settings'));
  const old = {bookingTurnCredit: 1.25, serviceWeights: [0, 2, 3, 4]};
  const migrated = boot('pos-front-desk-turn-board.html', {[key]: JSON.stringify(old)}); t.after(() => migrated.w.close());
  assert.equal(migrated.w.NEXORA_TURN_SETTINGS.load().bookingTurnCredit, 1.25);
  assert.equal(migrated.w.calculateTurnCredit(30), 2);
  assert.deepEqual(Array.from(migrated.w.NEXORA_TURN_SETTINGS.load().serviceThresholds || []), [30, 70, 110]);
  for (const thresholds of [[50, 40, 100], [0, 70, 110], [30, 70], [30, 70, null], [30.001, 70, 110]]) {
    const broken = boot('pos-front-desk-turn-board.html', {[key]: JSON.stringify({...old, serviceThresholds: thresholds})});
    try { assert.equal(broken.w.calculateTurnCredit(30), 1); } finally { broken.w.close(); }
  }
});


test('Up to accepts zero and decimal cents without shifting the inclusive boundary', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.w.close());
  app.w.openTurnRules();
  const inputs = [...app.d.querySelectorAll('[data-service-upper-bound]')];
  assert.equal(inputs.length, 3);
  inputs.forEach((input, index) => { input.value = ['0', '0.29', '0.58'][index]; });
  inputs[0].dispatchEvent(new app.w.Event('input', {bubbles: true}));
  assert.deepEqual([...app.d.querySelectorAll('[data-service-range-start]')].map(output => output.textContent), ['$0.01', '$0.30', '$0.59']);
  app.d.querySelector('#turn-rules-form button[type="submit"]').click();
  assert.equal(app.d.querySelector('#turn-rules-modal').classList.contains('show'), false);
  for (const [amount, credit] of [[0, 0.5], [0.01, 1], [0.29, 1], [0.30, 1.5], [0.58, 1.5], [0.59, 2]]) {
    assert.equal(app.w.calculateTurnCredit(amount), credit, `credit for $${amount}`);
  }
  app.w.openTurnRules();
  assert.deepEqual(inputs.map(input => input.value), ['0.00', '0.29', '0.58']);
  assert.deepEqual(app.errors, []);
});

test('adding multiple ranges preserves edits and saves their inclusive limits and credits', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.w.close());
  app.w.openTurnRules();
  const add = app.d.querySelector('#turn-rules-add-range');
  assert.ok(add, 'Add range is available');
  app.d.querySelector('[data-service-weight="0"]').value = '0.25';
  add.click();
  assert.equal(app.d.querySelectorAll('[data-service-weight]').length, 5);
  assert.equal(app.d.querySelector('#turn-rules-count').textContent, '5 ranges');
  assert.equal(app.d.querySelector('[data-service-weight="0"]').value, '0.25');
  assert.equal(app.d.querySelector('[data-service-weight="4"]').value, '2.5', 'new range earns half a turn more than the last range');
  assert.equal(app.d.querySelector('[data-service-upper-bound="3"]').value, '');
  app.w.saveTurnRules();
  assert.ok(app.d.querySelector('#turn-rules-modal').classList.contains('show'), 'new range requires its Up to amount');
  assert.equal(app.w.NEXORA_TURN_SETTINGS.load().serviceWeights.length, 4);
  app.d.querySelector('[data-service-upper-bound="3"]').value = '149.99';
  app.d.querySelector('[data-service-weight="4"]').value = '2.75';
  add.click();
  assert.equal(app.d.querySelector('[data-service-weight="5"]').value, '3.25', 'the next suggestion follows the edited draft credit');
  app.d.querySelector('[data-service-upper-bound="4"]').value = '199.99';
  app.d.querySelector('[data-service-weight="5"]').value = '3';
  const preview = app.d.querySelector('#turn-rules-preview-amount');
  preview.value = '200'; preview.dispatchEvent(new app.w.Event('input', {bubbles: true}));
  assert.match(app.d.querySelector('#turn-rules-preview-result').textContent, /3 turns/);
  assert.equal(app.w.calculateTurnCredit(200), 2, 'added rows remain a draft');
  app.d.querySelector('#turn-rules-form button[type="submit"]').click();
  const reloaded = boot('pos-front-desk-turn-board.html', saved(app)); t.after(() => reloaded.w.close());
  reloaded.w.openTurnRules();
  assert.equal(reloaded.d.querySelectorAll('[data-service-weight]').length, 6);
  assert.equal(reloaded.d.querySelectorAll('.turn-range-unlimited').length, 1);
  for (const [amount, credit] of [[20, 0.25], [149.99, 2], [150, 2.75], [199.99, 2.75], [200, 3]]) {
    assert.equal(reloaded.w.calculateTurnCredit(amount), credit, `credit for $${amount}`);
  }
  assert.deepEqual(app.errors, []); assert.deepEqual(reloaded.errors, []);
});

test('new range credit suggestions handle zero and decimals while keeping invalid drafts unsaved', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.w.close());
  for (const [lastCredit, expected] of [['0', '0.5'], ['0.57', '1.07'], ['', ''], ['-1', '']]) {
    app.w.openTurnRules();
    app.d.querySelector('[data-service-weight="3"]').value = lastCredit;
    app.d.querySelector('#turn-rules-add-range').click();
    assert.equal(app.d.querySelector('[data-service-weight="4"]').value, expected);
    assert.equal(app.d.querySelector('[data-service-weight="3"]').value, lastCredit);
    assert.equal(app.w.NEXORA_TURN_SETTINGS.load().serviceWeights.length, 4);
  }
  assert.deepEqual(app.errors, []);
});

test('removing ranges merges coverage, cancel restores saved rows, and a single unlimited range is valid', t => {
  const app = boot('pos-front-desk-turn-board.html'); t.after(() => app.w.close());
  app.w.openTurnRules();
  const remove = app.d.querySelector('[data-remove-service-range="1"]');
  assert.ok(remove, 'ranges can be removed from the draft');
  remove.click();
  assert.equal(app.d.querySelectorAll('[data-service-weight]').length, 3);
  assert.equal(app.d.querySelector('[data-service-weight="1"]').value, '1.5');
  assert.equal(app.d.querySelector('[data-service-upper-bound="1"]').value, '109.99');
  assert.equal(app.d.querySelector('[data-service-range-start="0"]').textContent, '$30.00');
  app.d.querySelector('[data-remove-service-range="2"]').click();
  assert.equal(app.d.querySelectorAll('[data-service-upper-bound]').length, 1);
  app.d.querySelector('#turn-rules-modal .modal-actions .btn').click();
  app.w.openTurnRules();
  assert.equal(app.d.querySelectorAll('[data-service-weight]').length, 4);
  for (let index = 0; index < 3; index++) app.d.querySelector('[data-remove-service-range="0"]').click();
  assert.equal(app.d.querySelector('#turn-rules-count').textContent, '1 range');
  assert.equal(app.d.querySelector('[data-remove-service-range="0"]').disabled, true);
  assert.equal(app.d.querySelectorAll('[data-service-upper-bound]').length, 0);
  app.w.saveTurnRules(); app.w.openTurnRules();
  assert.equal(app.w.calculateTurnCredit(0), 2);
  assert.equal(app.w.calculateTurnCredit(500), 2);
  app.d.querySelector('#turn-rules-add-range').click();
  assert.equal(app.d.querySelectorAll('[data-service-weight]').length, 2);
  assert.equal(app.d.querySelector('[data-service-upper-bound="0"]').value, '');
  assert.equal(app.d.querySelector('[data-service-weight="1"]').value, '2.5');
  app.d.querySelector('#turn-rules-add-range').click();
  assert.equal(app.d.querySelector('[data-service-weight="2"]').value, '3');
  assert.deepEqual(app.errors, []);
});

test('range count changes synchronize open Calendar fields while preserving reward drafts', t => {
  const board = boot('pos-front-desk-turn-board.html'), calendar = boot('pos-front-desk.html');
  t.after(() => { board.w.close(); calendar.w.close(); });
  const root = openCalendar(calendar);
  root.querySelector('[data-structure="flat"]').click();
  root.querySelector('#flat-rate').value = '8';
  const result = board.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 1.5, 2, 3], serviceThresholds: [30, 70, 110, 150]});
  assert.equal(result.ok, true);
  syncStorage(board, calendar);
  assert.equal(root.querySelectorAll('[data-service-weight]').length, 5);
  assert.match(root.querySelector('[data-service-weight="4"]').closest('label').textContent, /\$150\+/);
  assert.equal(root.querySelector('#flat-rate').value, '8');
  root.querySelector('[data-service-weight="4"]').value = '3.5';
  root.querySelector('#save-policy').click();
  assert.equal(calendar.w.NEXORA_TURN_SETTINGS.serviceCredit(150), 3.5);
  const standalone = boot('team-calendar.html', saved(calendar)); t.after(() => standalone.w.close());
  standalone.d.querySelector('#reward-settings-button').click();
  assert.equal(standalone.d.querySelectorAll('[data-service-weight]').length, 5);
  board.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 1, serviceWeights: [2], serviceThresholds: []});
  syncStorage(board, standalone);
  assert.equal(standalone.d.querySelectorAll('[data-service-weight]').length, 1);
  assert.match(standalone.d.querySelector('[data-service-weight]').closest('label').textContent, /\$0\+/);
  standalone.d.querySelector('#save-policy').click();
  assert.equal(standalone.w.NEXORA_TURN_SETTINGS.serviceCredit(500), 2);
  for (const app of [board, calendar, standalone]) assert.deepEqual(app.errors, []);
});

test('synchronizing a different range count keeps keyboard focus inside the open turn rules', t => {
  const source = boot('pos-front-desk-turn-board.html'), app = boot('pos-front-desk-turn-board.html');
  t.after(() => { source.w.close(); app.w.close(); });
  app.w.openTurnRules();
  source.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 1.5, 2, 3], serviceThresholds: [30, 70, 110, 150]});
  syncStorage(source, app);
  assert.equal(app.d.activeElement, app.d.querySelector('[data-service-upper-bound="0"]'));
  app.d.querySelector('[data-service-weight="4"]').focus();
  source.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 0.5, serviceWeights: [2], serviceThresholds: []});
  syncStorage(source, app);
  assert.equal(app.d.activeElement, app.d.querySelector('[data-service-weight="0"]'));
  const booking = app.d.querySelector('#booking-turn-credit');
  booking.focus();
  source.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 0.5, serviceWeights: [1, 2], serviceThresholds: [50]});
  syncStorage(source, app);
  assert.equal(app.d.activeElement, booking, 'sync leaves controls outside the rows focused');
  app.d.querySelector('[data-service-upper-bound="0"]').focus();
  source.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 0.5, serviceWeights: [2], serviceThresholds: []});
  syncStorage(source, app);
  assert.equal(app.d.activeElement, app.d.querySelector('[data-service-weight="0"]'), 'a removed amount field falls back to its remaining credit');
  assert.deepEqual(app.errors, []);
});
