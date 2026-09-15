const SOURCE_DIR = require('node:path').resolve(__dirname, '../../../html/assets');

const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, existsSync} = require('node:fs');
const {JSDOM, VirtualConsole} = require('jsdom');

function bootCalendar(t, page) {
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(readFileSync(SOURCE_DIR + '/../pages/' + page, 'utf8'), {
    url: 'https://example.test/html/pages/' + page, runScripts: 'outside-only', virtualConsole
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.structuredClone = structuredClone;
  w.matchMedia = () => ({matches: false});
  for (const script of w.document.querySelectorAll('script')) {
    if (script.src && !script.src.startsWith('https://example.test/')) continue;
    if (script.src.includes('nexora-shell')) continue;
    const path = script.src && SOURCE_DIR + '/' + script.src.split('/').at(-1);
    if (path && !existsSync(path)) continue;
    w.eval(path ? readFileSync(path, 'utf8') : script.textContent);
  }
  let root = w.document;
  if (page === 'pos-front-desk.html') {
    w.document.querySelector('[data-view="calendar"]').click();
    w.document.querySelector('#calendar-reward-settings').click();
    root = w.document.querySelector('#team-calendar').shadowRoot;
  } else {
    root.querySelector('#reward-settings-button').click();
  }
  return {model: w.NEXORA_TURN_SETTINGS, storage: w.localStorage, root, errors};
}

for (const page of ['pos-front-desk.html', 'team-calendar.html']) {
  test(page + ' keeps booking and reward focus while shared service ranges change outside the policy', t => {
    const {model, root, errors} = bootCalendar(t, page);
    assert.equal(root.querySelector('#weighted-turn-settings'), null, 'service ranges are managed outside booking policy');
    assert.equal(root.querySelectorAll('[data-service-weight]').length, 0);
    const booking = root.querySelector('#turn-credit');
    booking.focus();
    assert.equal(model.save({bookingTurnCredit: 1.25, serviceWeights: [0.5, 1, 1.5, 2, 3], serviceThresholds: [30, 70, 110, 200]}).ok, true);
    assert.equal(root.activeElement, booking);
    assert.equal(booking.value, '1.25', 'booking credit remains synchronized');

    const reward = root.querySelector('#flat-rate');
    reward.value = '7'; reward.focus();
    assert.equal(model.save({bookingTurnCredit: 0.5, serviceWeights: [0.75], serviceThresholds: []}).ok, true);
    assert.equal(root.activeElement, reward);
    assert.equal(reward.value, '7');
    assert.deepEqual(errors, []);
  });

  test(page + ' saves booking credit while preserving the latest service ranges even before storage events arrive', t => {
    const {model, storage, root, errors} = bootCalendar(t, page);
    assert.equal(model.save({bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 1.5, 2, 3], serviceThresholds: [30, 70, 110, 200]}).ok, true);
    const key = Object.keys(storage).find(key => key.includes('turn-settings'));
    const latest = {bookingTurnCredit: 0.5, serviceWeights: [0.25, 1.75], serviceThresholds: [50.25]};
    storage.setItem(key, JSON.stringify(latest));
    root.querySelector('#turn-credit').value = '3';
    root.querySelector('#save-policy').click();
    assert.equal(root.querySelector('#reward-settings-drawer').getAttribute('aria-hidden'), 'true');
    assert.deepEqual(JSON.parse(storage.getItem(key)), {...latest, bookingTurnCredit: 3});
    assert.equal(model.serviceCredit(50.24), 0.25);
    assert.equal(model.serviceCredit(50.25), 1.75);
    assert.deepEqual(errors, []);
  });
}
