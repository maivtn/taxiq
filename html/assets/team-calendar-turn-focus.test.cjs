const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, existsSync} = require('node:fs');
const {JSDOM, VirtualConsole} = require('jsdom');

function bootCalendar(t, page) {
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(readFileSync(__dirname + '/../pages/' + page, 'utf8'), {
    url: 'https://example.test/html/pages/' + page, runScripts: 'outside-only', virtualConsole
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.structuredClone = structuredClone;
  w.matchMedia = () => ({matches: false});
  for (const script of w.document.querySelectorAll('script')) {
    if (script.src && !script.src.startsWith('https://example.test/')) continue;
    if (script.src.includes('nexora-shell')) continue;
    const path = script.src && __dirname + '/' + script.src.split('/').at(-1);
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
  return {model: w.NEXORA_TURN_SETTINGS, root, errors};
}

for (const page of ['pos-front-desk.html', 'team-calendar.html']) {
  test(page + ' retains keyboard focus when shared service ranges are added or removed', t => {
    const {model, root, errors} = bootCalendar(t, page);
    root.querySelector('[data-service-weight="1"]').focus();
    assert.equal(model.save({bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 1.5, 2, 3], serviceThresholds: [30, 70, 110, 200]}).ok, true);
    assert.equal(root.activeElement, root.querySelector('[data-service-weight="1"]'), 'adding ranges preserves the focused credit');

    root.querySelector('[data-service-weight="4"]').focus();
    assert.equal(model.save({bookingTurnCredit: 0.5, serviceWeights: [0.5, 1], serviceThresholds: [30]}).ok, true);
    assert.equal(root.activeElement, root.querySelector('[data-service-weight="1"]'), 'removing the focused range selects the nearest surviving credit');

    const reward = root.querySelector('#flat-rate');
    reward.value = '7'; reward.focus();
    assert.equal(model.save({bookingTurnCredit: 0.5, serviceWeights: [0.75], serviceThresholds: []}).ok, true);
    assert.equal(root.activeElement, reward, 'focus outside service ranges remains in place');
    assert.equal(reward.value, '7');
    assert.deepEqual(errors, []);
  });
}
