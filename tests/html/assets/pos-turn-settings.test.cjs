const SOURCE_DIR = require('node:path').resolve(__dirname, '../../../html/assets');

const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {JSDOM} = require('jsdom');

const key = 'nexora:turn-settings:v1:test-salon';
function boot(t, stored) {
  const dom = new JSDOM('', {url: 'https://example.test', runScripts: 'outside-only'});
  t.after(() => dom.window.close());
  dom.window.NEXORA_SALON_DATA = {loadCatalog: () => ({salon: {id: 'test-salon'}})};
  if (stored) dom.window.localStorage.setItem(key, JSON.stringify(stored));
  dom.window.eval(readFileSync(SOURCE_DIR + '/pos-turn-settings.js', 'utf8'));
  return {model: dom.window.NEXORA_TURN_SETTINGS, storage: dom.window.localStorage};
}

test('additional ranges persist and use every boundary including the final unbounded range', t => {
  const {model, storage} = boot(t);
  const settings = {bookingTurnCredit: 0.5, serviceWeights: [0.25, 0.5, 1, 1.5, 2, 3], serviceThresholds: [10, 30, 70, 110, 150.25]};
  assert.equal(model.save(settings).ok, true);
  for (const [amount, expected] of [[0, 0.25], [9.99, 0.25], [10, 0.5], [30, 1], [70, 1.5], [110, 2], [150.24, 2], [150.25, 3], [1000, 3]]) {
    assert.equal(model.serviceCredit(amount), expected, 'credit for $' + amount);
  }
  const reloaded = boot(t, JSON.parse(storage.getItem(key))).model;
  assert.equal(reloaded.serviceCredit(150.25), 3);
  assert.deepEqual(Array.from(reloaded.labels), ['$0–9.99', '$10–29.99', '$30–69.99', '$70–109.99', '$110–150.24', '$150.25+']);
});

test('one service range covers all non-negative amounts and supports zero credit', t => {
  const {model} = boot(t);
  assert.equal(model.save({bookingTurnCredit: 0, serviceWeights: [0], serviceThresholds: []}).ok, true);
  assert.deepEqual(Array.from(model.labels), ['$0+']);
  for (const amount of [0, 0.29, 110, 10000]) assert.equal(model.serviceCredit(amount), 0);
  assert.equal(model.save({bookingTurnCredit: 0, serviceWeights: [2.75]}).ok, true);
  assert.equal(model.serviceCredit(10000), 2.75);
});

test('Calendar-style saves and validation retain matching saved thresholds for any number of ranges', t => {
  const settings = {bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 2, 3, 4], serviceThresholds: [20, 50, 100, 200]};
  const {model} = boot(t, settings);
  const policy = {bookingTurnCredit: 2, serviceWeights: [0.25, 0.75, 1.25, 2.25, 3.25]};
  assert.equal(model.validate(policy), '');
  assert.equal(model.save(policy).ok, true);
  assert.deepEqual(Array.from(model.load().serviceThresholds), [20, 50, 100, 200]);
  assert.equal(model.serviceCredit(200), 3.25);
  assert.equal(model.save({...policy, serviceWeights: [1, 2]}).ok, false, 'omitted thresholds cannot define a different range count');
});

test('draft calculations support decimal boundaries without persisting or replacing saved ranges', t => {
  const {model, storage} = boot(t);
  const draft = {bookingTurnCredit: 0.5, serviceWeights: [0.25, 1.25], serviceThresholds: [0.29]};
  assert.equal(model.serviceCredit(0.28, draft), 0.25);
  assert.equal(model.serviceCredit(0.29, draft), 1.25);
  assert.equal(model.serviceCredit(45), 1);
  assert.equal(storage.getItem(key), null);
});

test('legacy four-range credits migrate while invalid stored counts use defaults', t => {
  const legacy = {bookingTurnCredit: 1.25, serviceWeights: [0, 2, 3, 4]};
  const {model} = boot(t, legacy);
  assert.equal(model.load().bookingTurnCredit, 1.25);
  assert.deepEqual(Array.from(model.load().serviceThresholds), [30, 70, 110]);
  assert.equal(model.serviceCredit(30), 2);
  for (const value of [{...legacy, serviceWeights: [4, 5]}, {...legacy, serviceThresholds: [30]}]) {
    const broken = boot(t, value).model;
    assert.equal(broken.load().bookingTurnCredit, 0.5);
    assert.equal(broken.serviceCredit(30), 1);
  }
});

test('mismatched, empty, sparse, and invalid ranges never replace saved settings', t => {
  const {model, storage} = boot(t);
  const valid = {bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 2], serviceThresholds: [0.29, 100]};
  assert.equal(model.save(valid).ok, true);
  const original = storage.getItem(key);
  for (const invalid of [
    {...valid, serviceWeights: [], serviceThresholds: []},
    {...valid, serviceWeights: [1, 2]},
    {...valid, serviceWeights: new Array(3)},
    ...[[], new Array(2), [0, 100], [30, 30], [40, 30], [30.001, 100], [30, Infinity], [30, Number.MAX_SAFE_INTEGER], [30, '100']].map(serviceThresholds => ({...valid, serviceThresholds}))
  ]) {
    assert.ok(model.validate(invalid));
    assert.equal(model.save(invalid).ok, false);
    assert.equal(storage.getItem(key), original);
  }
});
