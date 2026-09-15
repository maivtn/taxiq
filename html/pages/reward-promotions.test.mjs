import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const storageKey = 'nexora:reward-promotions:v1';
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const tick = () => new Promise(resolve => setImmediate(resolve));
const offer = (patch = {}) => ({
  id: 'offer-a', title: 'Add-On Upgrade', badge: 'UPGRADE', description: 'Selected add-ons only.',
  type: 'percent', value: 20, days: [...days], startTime: '00:00', endTime: '23:59',
  checkout: true, hero: true, public: 'private', paused: false,
  banners: [{id: 'banner-a', theme: 'purple'}], uses: 48, revenue: 620,
  services: 'Selected add-ons', audience: 'All customers', redemption: 'checkout', code: '',
  timing: 'now', startDate: '2026-09-15', endDate: '', allDay: true, createdAt: 1,
  ...patch
});
const catalog = (offers = [offer()]) => ({version: 2, pastRevenue: 220, pastUses: 8, offers});

async function boot(t, saved, beforeEval) {
  const dom = new JSDOM(readFileSync(new URL('./reward-promotions.html', import.meta.url), 'utf8'), {
    url: 'https://example.test/pages/reward-promotions.html', runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const w = dom.window, d = w.document;
  w.structuredClone = structuredClone;
  w.confirm = () => true;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.NEXORA_PROMOTION_ASSETS = {
    importFile: async file => ({id: 'asset-a', name: file.name, type: file.type, size: file.size, url: 'blob:asset-a'}),
    getUrl: async id => 'blob:' + id,
    release() {}, discard: async () => {}
  };
  if (saved !== undefined) w.localStorage.setItem(storageKey, typeof saved === 'string' ? saved : JSON.stringify(saved));
  await new Promise(resolve => w.addEventListener('load', resolve, {once: true}));
  if (beforeEval) beforeEval(w);
  w.eval(readFileSync(new URL('../assets/reward-promotions.js', import.meta.url), 'utf8'));
  await tick();
  const cards = () => [...d.querySelectorAll('.promotion-card[data-promotion-id]')];
  const card = id => cards().find(element => element.dataset.promotionId === id);
  const input = (selector, value) => {
    const element = d.querySelector(selector);
    assert.ok(element, selector + ' exists');
    if (typeof value === 'boolean') element.checked = value; else element.value = value;
    element.dispatchEvent(new w.Event('input', {bubbles: true}));
    element.dispatchEvent(new w.Event('change', {bubbles: true}));
    return element;
  };
  const field = (name, value) => input('#promotion-form [name="' + name + '"]', value);
  const submit = () => d.querySelector('#promotion-form').dispatchEvent(new w.Event('submit', {bubbles: true, cancelable: true}));
  const savedState = () => JSON.parse(w.localStorage.getItem(storageKey));
  const close = () => d.querySelector('[data-close-editor]').click();
  const upload = fileName => {
    const element = d.querySelector('#banner-upload');
    Object.defineProperty(element, 'files', {configurable: true, value: [new w.File(['image'], fileName, {type: 'image/png'})]});
    element.dispatchEvent(new w.Event('change', {bubbles: true}));
  };
  return {w, d, cards, card, input, field, submit, savedState, close, upload};
}

test('search matches badges and combines with enabled filters without changing overview counts', async t => {
  const runtime = await boot(t, catalog([offer(), offer({id: 'offer-b', title: 'Weekday Glow', badge: 'QUIET', paused: true, banners: [{id: 'b', theme: 'gold'}, {id: 'c', theme: 'rose'}]})]));
  const {d, cards, input} = runtime;
  assert.equal(d.querySelector('#stat-total').textContent, '2');
  assert.equal(d.querySelector('#stat-active').textContent, '1');
  assert.equal(d.querySelector('#stat-banners').textContent, '3');
  input('#promotion-search', '  quiet  ');
  assert.deepEqual(cards().map(card => card.dataset.promotionId), ['offer-b']);
  input('#promotion-filter', 'enabled');
  assert.equal(cards().length, 0);
  assert.equal(d.querySelector('#promotion-empty').hidden, false);
  assert.equal(d.querySelector('#stat-total').textContent, '2');
  assert.equal(d.querySelector('#stat-banners').textContent, '3');
  input('#promotion-filter', 'disabled');
  assert.equal(cards().length, 1);
  d.querySelector('#clear-filters').click();
  assert.equal(cards().length, 2);
  assert.equal(d.querySelector('#promotion-search').value, '');
});

test('six templates fill independent disabled drafts with the reference discount and schedule', async t => {
  const {w, d, close} = await boot(t, catalog([]));
  const before = w.localStorage.getItem(storageKey);
  const cases = [
    ['upgrade', 'percent', '20', days, '00:00', '23:59'],
    ['weekday', 'percent', '15', ['Tue', 'Wed', 'Thu'], '10:00', '14:00'],
    ['rebook', 'fixed', '5', days, '00:00', '23:59'],
    ['welcome', 'percent', '10', days, '00:00', '23:59'],
    ['food', 'fixed', '3', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], '11:00', '14:00'],
    ['retail', 'percent', '15', days, '00:00', '23:59']
  ];
  for (const [key, type, value, selectedDays, start, end] of cases) {
    d.querySelector('[data-template="' + key + '"]').click();
    assert.equal(d.querySelector('#promotion-editor').open, true);
    assert.equal(d.querySelector('[name="type"]').value, type, key);
    assert.equal(d.querySelector('[name="value"]').value, value, key);
    assert.deepEqual([...d.querySelectorAll('[name="days"]:checked')].map(input => input.value), selectedDays, key);
    assert.equal(d.querySelector('[name="startTime"]').value, start, key);
    assert.equal(d.querySelector('[name="endTime"]').value, end, key);
    assert.equal(d.querySelector('[name="hero"]').checked, true);
    assert.equal(d.querySelector('[name="public"]').checked, false);
    assert.equal(w.localStorage.getItem(storageKey), before, 'choosing ' + key + ' must not persist');
    close();
  }
});

test('blank creation saves once as disabled and restores the selected placements after reload', async t => {
  const {w, d, field, submit, savedState} = await boot(t, catalog([]));
  d.querySelector('#create-promotion').click();
  assert.equal(d.querySelector('[name="title"]').value, '');
  assert.equal(d.querySelector('[name="badge"]').value, '');
  assert.equal(d.querySelector('[name="description"]').value, '');
  assert.equal(d.querySelector('[name="type"]').value, 'percent');
  assert.equal(d.querySelector('[name="value"]').value, '10');
  assert.equal(d.querySelector('[name="startTime"]').value, '00:00');
  assert.equal(d.querySelector('[name="endTime"]').value, '23:59');
  assert.equal(d.querySelectorAll('[name="days"]:checked').length, 7);
  assert.equal(d.querySelector('[name="checkout"]').checked, true);
  assert.equal(d.querySelector('[name="hero"]').checked, false);
  field('title', 'Welcome September'); field('hero', true); field('checkout', false); field('public', true);
  submit(); submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  const [record] = savedState().offers;
  assert.equal(savedState().offers.length, 1);
  assert.equal(record.paused, true);
  assert.equal(record.hero, true);
  assert.equal(record.checkout, false);
  assert.equal(record.public, 'pending');
  assert.equal(record.banners[0].theme, 'purple');
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  restored.card(record.id).querySelector('[data-action="edit"]').click();
  assert.equal(restored.d.querySelector('[name="title"]').value, 'Welcome September');
  assert.equal(restored.d.querySelector('[name="public"]').checked, true);
});

test('invalid discounts, empty days and reversed hours keep the draft open and focus the invalid field', async t => {
  const {d, field, submit, savedState} = await boot(t, catalog([]));
  d.querySelector('#create-promotion').click();
  submit();
  assert.equal(d.activeElement.name, 'title');
  field('title', 'Valid name'); field('value', '101'); submit();
  assert.equal(d.activeElement.name, 'value');
  field('value', '0'); submit();
  assert.equal(d.activeElement.name, 'value');
  field('value', '15');
  for (const checkbox of d.querySelectorAll('[name="days"]')) checkbox.checked = false;
  submit();
  assert.equal(d.activeElement.name, 'days');
  d.querySelector('[name="days"]').checked = true;
  field('startTime', '14:00'); field('endTime', '10:00'); submit();
  assert.equal(d.activeElement.name, 'endTime');
  assert.equal(d.querySelector('#promotion-editor').open, true);
  assert.ok(d.querySelector('#promotion-error').textContent.trim());
  assert.equal(savedState().offers.length, 0);
});

test('switching editor language keeps merchant text and the selected banner', async t => {
  const {d, input, field, submit, savedState} = await boot(t, catalog([]));
  assert.equal(d.querySelector('#promotion-language').value, 'en');
  d.querySelector('[data-template="weekday"]').click();
  field('title', 'Merchant wording'); field('badge', 'MY BADGE'); field('description', 'Nội dung riêng của tiệm.');
  d.querySelector('#add-banner').click(); input('#banner-theme', 'gold');
  input('#editor-language', 'vi');
  assert.equal(d.querySelector('[name="title"]').value, 'Merchant wording');
  assert.equal(d.querySelector('[name="badge"]').value, 'MY BADGE');
  assert.equal(d.querySelector('[name="description"]').value, 'Nội dung riêng của tiệm.');
  assert.match(d.querySelector('#save-promotion').textContent, /Lưu/);
  assert.equal(d.querySelector('.banner-row[aria-current="true"] [data-banner-action="select"]').dataset.index, '1');
  input('#editor-language', 'en');
  assert.match(d.querySelector('#promotion-preview').textContent, /Merchant wording/);
  assert.equal(d.querySelector('.banner-row[aria-current="true"] [data-banner-action="select"]').dataset.index, '1');
  submit();
  assert.deepEqual(savedState().offers[0].banners.map(banner => banner.theme), ['purple', 'gold']);
});

test('cancel discards edits while save preserves unrelated legacy fields and performance', async t => {
  const original = offer();
  const {d, card, field, close, submit, savedState} = await boot(t, catalog([original]));
  card('offer-a').querySelector('[data-action="edit"]').click();
  field('title', 'Discard this title'); close();
  assert.equal(savedState().offers[0].title, original.title);
  card('offer-a').querySelector('[data-action="edit"]').click();
  field('title', 'Premium Add-On Upgrade'); submit();
  const saved = savedState().offers[0];
  assert.equal(saved.title, 'Premium Add-On Upgrade');
  for (const key of ['uses', 'revenue', 'services', 'audience', 'redemption', 'startDate', 'endDate']) assert.deepEqual(saved[key], original[key], key);
  assert.equal(saved.paused, false);
  assert.equal(d.querySelector('#promotion-editor').open, false);
});

test('duplicate immediately creates a private disabled copy without inheriting usage or changing the source', async t => {
  const original = offer({public: 'pending'});
  const {d, card, cards, savedState} = await boot(t, catalog([original]));
  const before = savedState().offers[0];
  card('offer-a').querySelector('[data-action="duplicate"]').click();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(cards().length, 2);
  const source = savedState().offers.find(item => item.id === 'offer-a');
  const copy = savedState().offers.find(item => item.id !== 'offer-a');
  assert.deepEqual(source, before);
  assert.match(copy.title, /Copy/i);
  assert.equal(copy.paused, true);
  assert.equal(copy.public, 'private');
  assert.equal(copy.uses, 0);
  assert.equal(copy.revenue, 0);
  assert.deepEqual(copy.days, original.days);
  assert.deepEqual(copy.banners.map(banner => banner.theme), ['purple']);
});

test('enable and disable update persisted state and filtered cards', async t => {
  const {w, d, card, cards, input, savedState} = await boot(t, catalog());
  card('offer-a').querySelector('[data-action="toggle"]').click();
  assert.equal(savedState().offers[0].paused, true);
  assert.equal(d.querySelector('#stat-active').textContent, '0');
  input('#promotion-filter', 'enabled'); assert.equal(cards().length, 0);
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  restored.input('#promotion-filter', 'disabled');
  restored.card('offer-a').querySelector('[data-action="toggle"]').click();
  assert.equal(restored.cards().length, 0);
  assert.equal(restored.savedState().offers[0].paused, false);
});

test('banner order sets the saved cover and the banner list stays between one and eight', async t => {
  const {d, card, input, submit, savedState} = await boot(t, catalog());
  card('offer-a').querySelector('[data-action="edit"]').click();
  d.querySelector('#add-banner').click(); input('#banner-theme', 'gold');
  d.querySelector('[data-banner-action="up"][data-index="1"]').click();
  submit();
  assert.deepEqual(savedState().offers[0].banners.map(banner => banner.theme), ['gold', 'purple']);
  card('offer-a').querySelector('[data-action="edit"]').click();
  for (let index = 0; index < 10; index++) d.querySelector('#add-banner').click();
  assert.equal(d.querySelectorAll('[data-banner-action="select"]').length, 8);
  for (let index = 0; index < 10; index++) d.querySelector('[data-banner-action="remove"][data-index="0"]').click();
  assert.equal(d.querySelectorAll('[data-banner-action="select"]').length, 1);
  assert.equal(d.querySelector('[data-banner-action="remove"]').disabled, true);
  submit();
  assert.equal(savedState().offers[0].banners.length, 1);
});

test('removing an earlier banner preserves the selected image and focuses its new select button', async t => {
  const banners = [{id: 'banner-a', theme: 'purple'}, {id: 'banner-b', theme: 'gold'}, {id: 'banner-c', theme: 'rose'}];
  const {d, card, submit, savedState} = await boot(t, catalog([offer({banners})]));
  card('offer-a').querySelector('[data-action="edit"]').click();
  const middle = d.querySelector('[data-banner-action="select"][data-index="1"]');
  middle.focus(); middle.click();
  d.querySelector('[data-banner-action="remove"][data-index="0"]').click();
  assert.ok(d.querySelector('#promotion-preview .theme-gold'));
  const selected = d.querySelector('.banner-row[aria-current="true"] [data-banner-action="select"]');
  assert.equal(selected.dataset.index, '0');
  assert.equal(d.activeElement, selected);
  submit();
  assert.deepEqual(savedState().offers[0].banners.map(banner => banner.id), ['banner-b', 'banner-c']);
});

test('choosing a template immediately changes only the selected banner and persists its theme after reload', async t => {
  const banners = [{id: 'banner-a', theme: 'purple'}, {id: 'banner-b', theme: 'gold'}];
  const {w, d, card, input, submit, savedState} = await boot(t, catalog([offer({banners})]));
  card('offer-a').querySelector('[data-action="edit"]').click();
  d.querySelector('[data-banner-action="select"][data-index="1"]').click();
  assert.equal(d.querySelector('#banner-theme').value, 'gold');
  input('#banner-theme', 'rose');
  assert.equal(d.querySelector('#banner-theme').value, 'rose');
  assert.ok(d.querySelector('#promotion-preview .theme-rose'));
  assert.equal(d.querySelectorAll('[data-banner-action="select"]').length, 2);
  assert.equal(d.querySelector('.banner-row[aria-current="true"] [data-banner-action="select"]').dataset.index, '1');
  assert.deepEqual(savedState().offers[0].banners, banners, 'preview does not save the draft');
  d.querySelector('[data-banner-action="select"][data-index="0"]').click();
  assert.equal(d.querySelector('#banner-theme').value, 'purple');
  assert.ok(d.querySelector('#promotion-preview .theme-purple'));
  submit();
  assert.deepEqual(savedState().offers[0].banners, [{id: 'banner-a', theme: 'purple'}, {id: 'banner-b', theme: 'rose'}]);
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  restored.card('offer-a').querySelector('[data-action="edit"]').click();
  restored.d.querySelector('[data-banner-action="select"][data-index="1"]').click();
  assert.equal(restored.d.querySelector('#banner-theme').value, 'rose');
  assert.ok(restored.d.querySelector('#promotion-preview .theme-rose'));
});

test('cancel discards a selected banner theme change', async t => {
  const banners = [{id: 'banner-a', theme: 'purple'}, {id: 'banner-b', theme: 'gold'}];
  const {d, card, input, close, savedState} = await boot(t, catalog([offer({banners})]));
  card('offer-a').querySelector('[data-action="edit"]').click();
  d.querySelector('[data-banner-action="select"][data-index="1"]').click();
  input('#banner-theme', 'rose');
  assert.ok(d.querySelector('#promotion-preview .theme-rose'));
  close();
  assert.deepEqual(savedState().offers[0].banners, banners);
  card('offer-a').querySelector('[data-action="edit"]').click();
  d.querySelector('[data-banner-action="select"][data-index="1"]').click();
  assert.equal(d.querySelector('#banner-theme').value, 'gold');
  assert.ok(d.querySelector('#promotion-preview .theme-gold'));
});

test('choosing a theme replaces only the selected uploaded banner with a template', async t => {
  const banners = [
    {id: 'banner-a', theme: 'purple', assetId: 'asset-a', name: 'First upload.png'},
    {id: 'banner-b', theme: 'purple', assetId: 'asset-b', name: 'Second upload.png'}
  ];
  const {d, card, input, submit, savedState} = await boot(t, catalog([offer({banners})]));
  card('offer-a').querySelector('[data-action="edit"]').click();
  await tick();
  assert.equal(d.querySelector('#banner-theme').selectedOptions[0].disabled, true);
  assert.match(d.querySelector('#banner-theme').selectedOptions[0].textContent, /uploaded/i);
  assert.equal(d.querySelector('#promotion-preview img').getAttribute('src'), 'blob:asset-a');
  input('#banner-theme', 'gold');
  assert.ok(d.querySelector('#promotion-preview .theme-gold'));
  assert.equal(d.querySelector('#promotion-preview img'), null);
  assert.equal(d.querySelectorAll('[data-banner-action="select"]').length, 2);
  submit();
  assert.deepEqual(savedState().offers[0].banners[0], {id: 'banner-a', theme: 'gold'});
  assert.deepEqual(savedState().offers[0].banners[1], banners[1]);
});

test('cancel restores focus to the matching template button after changing editor language', async t => {
  const {d, input, close} = await boot(t, catalog([]));
  const template = d.querySelector('[data-template="weekday"]');
  template.focus(); template.click();
  input('#editor-language', 'vi');
  close();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(d.activeElement, d.querySelector('[data-template="weekday"]'));
});

test('used and deletion-protected promotions cannot be deleted', async t => {
  const protectedOffers = [offer({id: 'used', uses: 1, canDelete: true}), offer({id: 'protected', uses: 0, canDelete: false})];
  const {d, card, cards, savedState} = await boot(t, catalog(protectedOffers));
  for (const id of ['used', 'protected']) {
    card(id).querySelector('.promo-more').open = true;
    card(id).querySelector('[data-action="delete"]').click();
    assert.equal(cards().length, 2);
    assert.ok(savedState().offers.some(offer => offer.id === id));
    assert.ok(d.querySelector('#promotion-feedback').textContent.trim());
  }
});

test('deleting an unused promotion respects cancellation and persists only the confirmed deletion', async t => {
  const {w, card, cards, savedState} = await boot(t, catalog([offer({id: 'unused', uses: 0, revenue: 0, canDelete: true}), offer({id: 'keep'})]));
  w.confirm = () => false;
  card('unused').querySelector('.promo-more').open = true;
  card('unused').querySelector('[data-action="delete"]').click();
  assert.equal(cards().length, 2);
  assert.ok(savedState().offers.some(offer => offer.id === 'unused'));
  w.confirm = () => true;
  card('unused').querySelector('[data-action="delete"]').click();
  assert.deepEqual(savedState().offers.map(offer => offer.id), ['keep']);
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  assert.deepEqual(restored.cards().map(card => card.dataset.promotionId), ['keep']);
});

test('merchant text stays literal in the live preview, saved card and promotion preview', async t => {
  const {d, field, submit, cards} = await boot(t, catalog([]));
  const title = '<img src=x onerror=alert(1)> Welcome';
  const description = '<svg onload=alert(2)> Save today';
  d.querySelector('#create-promotion').click();
  field('title', title); field('description', description);
  assert.ok(d.querySelector('#promotion-preview').textContent.includes(title));
  assert.equal(d.querySelector('#promotion-preview [onerror], #promotion-preview [onload]'), null);
  submit();
  assert.ok(cards()[0].textContent.includes(title));
  assert.equal(cards()[0].querySelector('[onload], [onerror]'), null);
  cards()[0].querySelector('[data-action="preview"]').click();
  assert.equal(d.querySelector('#promotion-poster-dialog').open, true);
  assert.ok(d.querySelector('#poster-output').textContent.includes(title));
  assert.ok(d.querySelector('#poster-details').textContent.includes(description));
  assert.equal(d.querySelector('#poster-output [onload], #poster-details [onload]'), null);
  d.querySelector('#close-poster').click();
  assert.equal(d.querySelector('#promotion-poster-dialog').open, false);
});

test('failed persistence leaves the saved record unchanged and keeps the editor available for retry', async t => {
  const {w, d, card, field, submit, savedState} = await boot(t, catalog());
  const before = w.localStorage.getItem(storageKey), setItem = w.Storage.prototype.setItem;
  w.Storage.prototype.setItem = function () { throw new w.DOMException('Storage full', 'QuotaExceededError'); };
  card('offer-a').querySelector('[data-action="toggle"]').click();
  assert.equal(w.localStorage.getItem(storageKey), before);
  assert.ok(d.querySelector('#promotion-feedback').textContent.trim());
  d.querySelector('#create-promotion').click(); field('title', 'Keep for retry'); submit();
  assert.equal(d.querySelector('#promotion-editor').open, true);
  assert.match(d.querySelector('#promotion-error').textContent, /storage|save/i);
  assert.equal(d.querySelector('[name="title"]').value, 'Keep for retry');
  assert.equal(savedState().offers.length, 1);
  w.Storage.prototype.setItem = setItem; submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(savedState().offers.length, 2);
});

test('cross-tab changes refresh cards and a remotely deleted offer cannot be recreated by a stale editor', async t => {
  const {w, d, card, cards, field, submit, savedState} = await boot(t, catalog());
  card('offer-a').querySelector('[data-action="edit"]').click();
  field('title', 'Unsaved local change');
  const next = JSON.stringify(catalog([offer({id: 'offer-b', title: 'Remote offer'})]));
  w.localStorage.setItem(storageKey, next);
  w.dispatchEvent(new w.StorageEvent('storage', {key: storageKey, newValue: next}));
  assert.deepEqual(cards().map(card => card.dataset.promotionId), ['offer-b']);
  assert.equal(d.querySelector('[name="title"]').value, 'Unsaved local change');
  submit();
  assert.equal(d.querySelector('#promotion-editor').open, true);
  assert.match(d.querySelector('#promotion-error').textContent, /deleted|changed|another tab/i);
  assert.deepEqual(savedState().offers.map(offer => offer.id), ['offer-b']);
});

test('version-one custom offers migrate without losing headline, schedule, eligibility or performance', async t => {
  const legacy = offer({type: 'custom', value: 'SPRING', theme: 'spring', startTime: '11:00', endTime: '14:00', allDay: false, days: ['Mon', 'Tue'], audience: 'Returning customers', redemption: 'code', code: 'SPRING10'});
  delete legacy.banners; delete legacy.hero; delete legacy.public;
  const {d, card, field, submit, savedState} = await boot(t, {version: 1, pastUses: 8, pastRevenue: 220, offers: [legacy]});
  card('offer-a').querySelector('[data-action="edit"]').click();
  assert.equal(d.querySelector('[name="type"]').value, 'custom');
  assert.equal(d.querySelector('[name="value"]').value, 'SPRING');
  assert.match(d.querySelector('#promotion-preview').textContent, /SPRING/);
  field('title', 'Seasonal loyalty offer'); submit();
  assert.equal(savedState().version, 2);
  const saved = savedState().offers[0];
  for (const key of ['type', 'value', 'days', 'startTime', 'endTime', 'audience', 'redemption', 'code', 'uses', 'revenue']) assert.deepEqual(saved[key], legacy[key], key);
  assert.equal(saved.banners.length, 1);
});

test('an unchanged version-one offer can be saved after another tab adds a different offer', async t => {
  const legacy = offer({theme: 'gold'});
  delete legacy.banners;
  const {w, d, card, field, submit, savedState} = await boot(t, {version: 1, offers: [legacy]});
  card('offer-a').querySelector('[data-action="edit"]').click();
  field('title', 'Updated local title');
  const added = {...legacy, id: 'offer-b', title: 'Added in another tab'};
  const next = JSON.stringify({version: 1, offers: [legacy, added]});
  w.localStorage.setItem(storageKey, next);
  w.dispatchEvent(new w.StorageEvent('storage', {key: storageKey, newValue: next}));
  submit();
  assert.equal(d.querySelector('#promotion-editor').open, false);
  assert.equal(savedState().offers.find(item => item.id === 'offer-a').title, 'Updated local title');
  assert.equal(savedState().offers.find(item => item.id === 'offer-b').title, 'Added in another tab');
});

test('legacy promotion previews include the redemption code and saved effective date range', async t => {
  const legacy = offer({type: 'custom', value: 'SPRING', theme: 'spring', redemption: 'code', code: 'SPRING10', startDate: '2099-09-01', endDate: '2099-09-30'});
  delete legacy.banners;
  const {d, card} = await boot(t, {version: 1, offers: [legacy]});
  card('offer-a').querySelector('[data-action="preview"]').click();
  const details = d.querySelector('#poster-details').textContent;
  assert.match(details, /SPRING10/);
  assert.match(details, /2099-09-01/);
  assert.match(details, /2099-09-30/);
});

test('opening the editor retains Vietnamese selected on the promotions page', async t => {
  const {d, input} = await boot(t, catalog([]));
  input('#promotion-language', 'vi');
  d.querySelector('#create-promotion').click();
  assert.equal(d.querySelector('#editor-language').value, 'vi');
  assert.match(d.querySelector('#save-promotion').textContent, /Lưu/);
});

test('damaged saved data is retained and can be loaded after retry instead of being replaced with fixtures', async t => {
  const {w, d, cards} = await boot(t, '{damaged');
  assert.equal(w.localStorage.getItem(storageKey), '{damaged');
  assert.equal(d.querySelector('#promotion-load-error').hidden, false);
  w.localStorage.setItem(storageKey, JSON.stringify(catalog()));
  d.querySelector('#retry-load').click();
  assert.equal(d.querySelector('#promotion-load-error').hidden, true);
  assert.equal(cards().length, 1);
});

test('pending banner upload blocks save and its resolved asset survives saved reload', async t => {
  let resolveUpload;
  const {w, d, field, upload, submit, savedState} = await boot(t, catalog([]), w => {
    w.NEXORA_PROMOTION_ASSETS.importFile = () => new Promise(resolve => { resolveUpload = resolve; });
  });
  d.querySelector('#create-promotion').click(); field('title', 'Uploaded offer'); upload('banner.png');
  assert.equal(d.querySelector('#save-promotion').disabled, true);
  submit(); assert.equal(savedState().offers.length, 0);
  resolveUpload({id: 'asset-upload', name: 'banner.png', type: 'image/png', size: 5, url: 'blob:asset-upload'});
  await tick();
  assert.equal(d.querySelector('#save-promotion').disabled, false);
  assert.equal(d.querySelectorAll('[data-banner-action="select"]').length, 2);
  submit();
  assert.equal(savedState().offers[0].banners[1].assetId, 'asset-upload');
  const restored = await boot(t, w.localStorage.getItem(storageKey));
  restored.cards()[0].querySelector('[data-action="edit"]').click();
  restored.d.querySelector('[data-banner-action="select"][data-index="1"]').click();
  await tick();
  assert.equal(restored.d.querySelector('#promotion-preview img').getAttribute('src'), 'blob:asset-upload');
});

test('upload completion from a closed draft cannot attach to the next promotion', async t => {
  let resolveUpload;
  const {d, field, upload, close, submit, savedState} = await boot(t, catalog([]), w => {
    w.NEXORA_PROMOTION_ASSETS.importFile = () => new Promise(resolve => { resolveUpload = resolve; });
  });
  d.querySelector('#create-promotion').click(); field('title', 'Abandoned offer'); upload('old.png'); close();
  d.querySelector('#create-promotion').click(); field('title', 'Current offer');
  resolveUpload({id: 'stale-asset', name: 'old.png', type: 'image/png', size: 5, url: 'blob:stale-asset'});
  await tick();
  assert.equal(d.querySelector('[name="title"]').value, 'Current offer');
  assert.equal(d.querySelectorAll('[data-banner-action="select"]').length, 1);
  submit();
  assert.equal(savedState().offers.length, 1);
  assert.equal(savedState().offers[0].title, 'Current offer');
  assert.equal(savedState().offers[0].banners.some(banner => banner.assetId === 'stale-asset'), false);
});
