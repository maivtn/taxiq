import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const storageKey = 'nexora:reward-promotions:v1';

async function boot(t, saved, beforeEval) {
  const dom = new JSDOM(readFileSync(new URL('./reward-promotions.html', import.meta.url), 'utf8'), {
    url: 'https://example.test/pages/reward-promotions.html', runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const w = dom.window, d = w.document;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  if (saved) w.localStorage.setItem(storageKey, saved);
  await new Promise(resolve => w.addEventListener('load', resolve, {once: true}));
  if (beforeEval) beforeEval(w);
  w.eval(readFileSync(new URL('../assets/reward-promotions.js', import.meta.url), 'utf8'));
  const rows = () => Array.from(d.querySelectorAll('[data-promotion-id]'));
  const row = (title) => rows().find(element => element.textContent.includes(title));
  const field = (name, value) => {
    const input = d.querySelector(`#promotion-form [name="${name}"]`);
    if (typeof value === 'boolean') input.checked = value;
    else input.value = value;
    input.dispatchEvent(new w.Event('input', {bubbles: true}));
    input.dispatchEvent(new w.Event('change', {bubbles: true}));
    return input;
  };
  const submit = () => d.querySelector('#promotion-form').dispatchEvent(new w.Event('submit', {bubbles: true, cancelable: true}));
  return {w, d, rows, row, field, submit};
}

test('demo promotions support combined search, status filters and clearing an empty result', async t => {
  const {w, d, rows} = await boot(t);
  assert.equal(rows().length, 3);
  for (const title of ['Add-On Upgrade', 'Rebook & Save', 'Weekday Glow']) assert.ok(rows().some(row => row.textContent.includes(title)));
  assert.equal(d.querySelector('#stat-active').textContent, '2');
  assert.equal(d.querySelector('#stat-scheduled').textContent, '1');
  const search = d.querySelector('#promotion-search');
  search.value = '  REBOOK  ';
  search.dispatchEvent(new w.Event('input', {bubbles: true}));
  assert.equal(rows().length, 1);
  assert.match(rows()[0].textContent, /Rebook & Save/);
  d.querySelector('[data-filter="active"]').click();
  assert.equal(rows().length, 1);
  d.querySelector('[data-filter="scheduled"]').click();
  assert.equal(rows().length, 0);
  assert.equal(d.querySelector('#promotion-empty').hidden, false);
  d.querySelector('#clear-filters').click();
  assert.equal(search.value, '');
  assert.equal(rows().length, 3);
  assert.equal(d.querySelector('#promotion-empty').hidden, true);
});

test('creating an offer requires all three steps and persists it across reload', async t => {
  const {w, d, rows, row, field, submit} = await boot(t);
  d.querySelector('#create-promotion').click();
  assert.equal(d.querySelector('#promotion-editor').open, true);
  assert.equal(d.querySelector('[name="title"]').value, 'New Customer');
  field('title', 'Welcome September');
  field('description', 'Save $12 on your first visit.');
  field('value', '12');
  assert.match(d.querySelector('#promotion-preview').textContent, /Welcome September/);
  assert.match(d.querySelector('#promotion-preview').textContent, /\$12 OFF/);
  submit();
  assert.equal(d.querySelector('[data-editor-step="2"]').hidden, false);
  assert.equal(rows().length, 3);
  field('audience', 'First-time customers');
  submit();
  assert.equal(d.querySelector('[data-editor-step="3"]').hidden, false);
  assert.match(d.querySelector('#promotion-review').textContent, /Welcome September/);
  assert.equal(rows().length, 3);
  submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(rows().length, 4);
  assert.ok(row('Welcome September'));
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  assert.equal(restored.rows().length, 4);
  restored.row('Welcome September').querySelector('[data-action="edit"]').click();
  assert.equal(restored.d.querySelector('[name="value"]').value, '12');
  assert.equal(restored.d.querySelector('[name="audience"]').value, 'First-time customers');
});

test('quick-start samples update offer details and allow a free reward without a numeric discount', async t => {
  const {d, submit} = await boot(t);
  d.querySelector('#create-promotion').click();
  const sample = title => Array.from(d.querySelectorAll('#promotion-samples button')).find(button => button.textContent.includes(title));
  sample('Rebook & Save').click();
  assert.equal(d.querySelector('[name="title"]').value, 'Rebook & Save');
  assert.equal(d.querySelector('[name="type"]').value, 'fixed');
  assert.equal(d.querySelector('[name="value"]').value, '5');
  assert.match(d.querySelector('#promotion-preview').textContent, /\$5 OFF/);
  sample('Birthday Reward').click();
  assert.equal(d.querySelector('[name="type"]').value, 'free');
  assert.match(d.querySelector('#promotion-preview').textContent, /FREE/);
  submit();
  assert.equal(d.querySelector('[data-editor-step="2"]').hidden, false);
  assert.equal(d.querySelector('#promotion-error').textContent.trim(), '');
});

test('custom sample headlines survive selection, saving and editing after reload', async t => {
  const {w, d, row, submit} = await boot(t);
  d.querySelector('#create-promotion').click();
  Array.from(d.querySelectorAll('#promotion-samples button')).find(button => button.textContent.includes('Seasonal Offer')).click();
  assert.equal(d.querySelector('[name="type"]').value, 'custom');
  assert.equal(d.querySelector('[name="value"]').value, 'SPRING');
  assert.equal(d.querySelector('[data-preview-value]').textContent, 'SPRING');
  submit(); submit(); submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.ok(row('Seasonal Offer'));
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  restored.row('Seasonal Offer').querySelector('[data-action="edit"]').click();
  assert.equal(restored.d.querySelector('[name="value"]').value, 'SPRING');
  assert.equal(restored.d.querySelector('[data-preview-value]').textContent, 'SPRING');
  restored.field('type', 'percent');
  restored.field('value', '25');
  restored.field('type', 'custom');
  restored.field('value', 'SUMMER');
  assert.equal(restored.d.querySelector('[data-preview-value]').textContent, 'SUMMER');
  restored.submit(); restored.submit(); restored.submit();
  assert.equal(restored.d.querySelector('#promotion-editor').open, false);
  assert.match(restored.row('Seasonal Offer').textContent, /SUMMER/);
});

test('editing an existing offer preserves its discount, schedule and performance', async t => {
  const {d, rows, row, field, submit} = await boot(t);
  row('Add-On Upgrade').querySelector('[data-action="edit"]').click();
  const names = ['type', 'value', 'description', 'services', 'redemption', 'startDate', 'endDate'];
  const before = Object.fromEntries(names.map(name => [name, d.querySelector(`[name="${name}"]`).value]));
  field('title', 'Premium Add-On Upgrade');
  submit(); submit(); submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(rows().length, 3);
  const edited = row('Premium Add-On Upgrade');
  assert.match(edited.textContent, /\$620/);
  assert.match(edited.textContent, /48 uses/);
  edited.querySelector('[data-action="edit"]').click();
  for (const name of names) assert.equal(d.querySelector(`[name="${name}"]`).value, before[name], `${name} retained`);
});

test('invalid percentage and reversed schedule cannot advance or save an offer', async t => {
  const {d, rows, field, submit} = await boot(t);
  d.querySelector('#create-promotion').click();
  field('type', 'percent'); field('value', '101');
  submit();
  assert.equal(d.querySelector('[data-editor-step="1"]').hidden, false);
  assert.ok(d.querySelector('#promotion-error').textContent.trim());
  assert.equal(rows().length, 3);
  field('value', '15'); submit();
  assert.equal(d.querySelector('[data-editor-step="2"]').hidden, false);
  field('timing', 'scheduled'); field('startDate', '2099-09-15'); field('endDate', '2099-09-14');
  submit();
  assert.equal(d.querySelector('[data-editor-step="2"]').hidden, false);
  assert.ok(d.querySelector('#promotion-error').textContent.trim());
  assert.equal(rows().length, 3);
  field('endDate', '2099-09-30'); submit(); submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(rows().length, 4);
  assert.equal(d.querySelector('#stat-scheduled').textContent, '2');
});

test('pausing and resuming an offer updates the status, filters and persisted counters', async t => {
  const {w, d, rows, row} = await boot(t);
  row('Rebook & Save').querySelector('[data-action="toggle"]').click();
  assert.equal(d.querySelector('#stat-active').textContent, '1');
  d.querySelector('[data-filter="paused"]').click();
  assert.equal(rows().length, 1);
  assert.match(rows()[0].textContent, /Rebook & Save/);
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  restored.d.querySelector('[data-filter="paused"]').click();
  assert.equal(restored.rows().length, 1);
  restored.rows()[0].querySelector('[data-action="toggle"]').click();
  assert.equal(restored.rows().length, 0);
  assert.equal(restored.d.querySelector('#stat-active').textContent, '2');
  restored.d.querySelector('[data-filter="active"]').click();
  assert.equal(restored.rows().length, 2);
});

test('promotion text stays literal in the live preview, review and saved list', async t => {
  const {d, row, field, submit} = await boot(t);
  const title = '<img src=x onerror=alert(1)> Welcome';
  const description = '<svg onload=alert(2)> Save today';
  d.querySelector('#create-promotion').click();
  field('title', title); field('description', description);
  const preview = d.querySelector('#promotion-preview');
  assert.ok(preview.textContent.includes(title));
  assert.ok(preview.textContent.includes(description));
  assert.equal(preview.querySelector('img, svg'), null);
  submit(); submit();
  const review = d.querySelector('#promotion-review');
  assert.ok(review.textContent.includes(title));
  assert.equal(review.querySelector('img, svg'), null);
  submit();
  assert.ok(row(title));
  assert.equal(row(title).querySelector('img, [onload], [onerror]'), null);
});

test('creating a poster uses the selected promotion and can be closed', async t => {
  const {d, row} = await boot(t);
  row('Add-On Upgrade').querySelector('[data-action="poster"]').click();
  assert.equal(d.querySelector('#promotion-poster-dialog').open, true);
  assert.match(d.querySelector('#poster-output').textContent, /Add-On Upgrade/);
  assert.match(d.querySelector('#poster-output').textContent, /20%/);
  d.querySelector('#close-poster').click();
  assert.equal(d.querySelector('#promotion-poster-dialog').open, false);
});

test('duplicating an offer opens an independent copy and only adds it after saving', async t => {
  const {w, d, rows, row, field, submit} = await boot(t);
  const revenue = d.querySelector('#stat-revenue').textContent;
  const redemptions = d.querySelector('#stat-redemptions').textContent;
  row('Add-On Upgrade').querySelector('[data-action="duplicate"]').click();
  assert.equal(d.querySelector('#promotion-editor').open, true);
  assert.equal(d.querySelector('[name="title"]').value, 'Add-On Upgrade (copy)');
  assert.equal(d.querySelector('[name="type"]').value, 'percent');
  assert.equal(d.querySelector('[name="value"]').value, '20');
  assert.equal(rows().length, 3);
  field('title', 'Weekend Add-On Upgrade');
  field('value', '25');
  submit(); submit(); submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(rows().length, 4);
  assert.ok(row('Weekend Add-On Upgrade'));
  assert.equal(d.querySelector('#stat-revenue').textContent, revenue);
  assert.equal(d.querySelector('#stat-redemptions').textContent, redemptions);
  d.querySelector('#promotion-sort').value = 'newest';
  d.querySelector('#promotion-sort').dispatchEvent(new w.Event('change'));
  assert.match(rows()[0].textContent, /Weekend Add-On Upgrade/);
  const original = rows().find(element => element.textContent.includes('Add-On Upgrade') && !element.textContent.includes('Weekend Add-On Upgrade'));
  original.querySelector('[data-action="edit"]').click();
  assert.equal(d.querySelector('[name="value"]').value, '20');
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  assert.equal(restored.rows().length, 4);
  restored.row('Weekend Add-On Upgrade').querySelector('[data-action="edit"]').click();
  assert.equal(restored.d.querySelector('[name="value"]').value, '25');
});

test('invalid or unavailable saved storage falls back to usable demo promotions', async t => {
  for (const saved of ['{bad json', 'null']) {
    const runtime = await boot(t, saved);
    assert.equal(runtime.rows().length, 3);
    runtime.row('Rebook & Save').querySelector('[data-action="edit"]').click();
    assert.equal(runtime.d.querySelector('#promotion-editor').open, true);
  }
  const blocked = await boot(t, undefined, w => {
    Object.defineProperty(w, 'localStorage', {get() { throw new w.DOMException('Storage blocked', 'SecurityError'); }});
  });
  assert.equal(blocked.rows().length, 3);
  blocked.d.querySelector('[data-filter="active"]').click();
  assert.equal(blocked.rows().length, 2);
});

test('failed persistence leaves offers unchanged and preserves the editor for a successful retry', async t => {
  const {w, d, rows, row, field, submit} = await boot(t);
  const setItem = w.Storage.prototype.setItem;
  w.Storage.prototype.setItem = function () { throw new w.DOMException('Storage full', 'QuotaExceededError'); };
  row('Rebook & Save').querySelector('[data-action="toggle"]').click();
  assert.equal(d.querySelector('#stat-active').textContent, '2');
  assert.ok(d.querySelector('#promotion-feedback').textContent.trim());
  d.querySelector('#create-promotion').click();
  field('title', 'Offer kept for retry');
  submit(); submit(); submit();
  assert.equal(d.querySelector('#promotion-editor').open, true);
  assert.match(d.querySelector('#promotion-error').textContent, /storage|save/i);
  assert.equal(d.querySelector('[name="title"]').value, 'Offer kept for retry');
  assert.equal(rows().length, 3);
  w.Storage.prototype.setItem = setItem;
  submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(rows().length, 4);
  assert.ok(row('Offer kept for retry'));
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  assert.ok(restored.row('Offer kept for retry'));
});
