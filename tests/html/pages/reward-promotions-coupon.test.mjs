import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const page = new URL('../../../html/pages/reward-promotions.html', import.meta.url);
const storageKey = 'nexora:reward-promotions:v1';
const tick = () => new Promise(resolve => setImmediate(resolve));

async function boot(t, saved) {
  const dom = new JSDOM(readFileSync(page, 'utf8'), {
    url: 'https://nexora.test/pages/reward-promotions.html', runScripts: 'outside-only'
  });
  const w = dom.window, d = w.document;
  t.after(() => dom.window.close());
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  if (saved) w.localStorage.setItem(storageKey, JSON.stringify(saved));
  await new Promise(resolve => w.addEventListener('load', resolve, {once: true}));
  for (const script of d.scripts) {
    const src = script.getAttribute('src');
    if (src && !src.startsWith('../assets/')) continue;
    w.eval(src ? readFileSync(new URL(src, page), 'utf8') : script.textContent);
  }
  await tick();
  const form = d.querySelector('#promotion-form');
  const field = name => form.elements.namedItem(name);
  const set = (name, value) => {
    const element = field(name);
    if (name === 'offerType') element.value = value;
    else if (Array.isArray(value)) [...element.options].forEach(option => { option.selected = value.includes(option.value); });
    else element.value = value;
    const target = name === 'offerType' ? form.querySelector('[name="offerType"]:checked') : element;
    target.dispatchEvent(new w.Event('input', {bubbles: true}));
    target.dispatchEvent(new w.Event('change', {bubbles: true}));
  };
  const savedState = () => JSON.parse(w.localStorage.getItem(storageKey));
  const save = async (id = 'save-promotion') => { d.getElementById(id).click(); await tick(); };
  const createCoupon = () => {
    d.querySelector('#create-promotion').click();
    set('offerType', 'coupon');
    for (const [name, value] of Object.entries({title: 'Coupon audit', startDate: '2026-10-10', endDate: '2026-10-31', totalSlots: '20', perPersonLimit: '1', holdDays: '7'})) set(name, value);
  };
  return {w, d, form, field, set, savedState, save, createCoupon};
}

test('Coupon reveals eligibility and requires dates, quantity and uses per phone without changing Deal requirements', async t => {
  const r = await boot(t);
  r.d.querySelector('#create-promotion').click();
  assert.equal(r.field('offerType').value, 'deal');
  assert.equal(r.d.querySelector('#coupon-settings').hidden, true);
  for (const name of ['startDate', 'endDate', 'totalSlots', 'perPersonLimit']) assert.equal(r.field(name).required, false, name);
  r.set('offerType', 'coupon');
  assert.equal(r.d.querySelector('#coupon-settings').hidden, false);
  assert.equal(r.d.querySelector('#coupon-eligibility').hidden, false);
  for (const name of ['startDate', 'endDate', 'totalSlots', 'perPersonLimit']) assert.equal(r.field(name).required, true, name);
  assert.equal(r.field('perPersonLimit').value, '1');
  for (const name of ['checkIn', 'checkout', 'hero', 'public']) assert.equal(r.field(name).checked, true, name);
  for (const name of ['serviceScope', 'customerGroup', 'stacking', 'exclusions']) assert.equal(r.field(name).closest('[hidden]'), null, name);
  r.set('offerType', 'deal');
  assert.equal(r.d.querySelector('#coupon-settings').hidden, true);
  for (const name of ['totalSlots', 'perPersonLimit', 'holdDays']) assert.equal(r.field(name).disabled, true, name);
  for (const name of ['startDate', 'endDate', 'totalSlots', 'perPersonLimit']) assert.equal(r.field(name).required, false, name);
});

test('invalid Coupon schedules and counts cannot be saved', async t => {
  const r = await boot(t);
  const originalCount = r.savedState().offers.length;
  r.createCoupon();
  const cases = [
    ['startDate', '', 'startDate'], ['endDate', '', 'endDate'],
    ['endDate', '2026-10-09', 'endDate'],
    ['totalSlots', '', 'totalSlots'], ['totalSlots', '0', 'totalSlots'], ['totalSlots', '2.5', 'totalSlots'],
    ['perPersonLimit', '', 'perPersonLimit'], ['perPersonLimit', '-1', 'perPersonLimit'], ['perPersonLimit', '1.5', 'perPersonLimit'],
    ['holdDays', '0', 'holdDays'], ['holdDays', '1.5', 'holdDays']
  ];
  for (const [name, value, invalidField] of cases) {
    const validValue = r.field(name).value;
    r.set(name, value);
    await r.save();
    assert.equal(r.d.querySelector('#promotion-editor').open, true, name + '=' + value);
    assert.ok(r.d.querySelector('#promotion-error').textContent, name);
    assert.equal(r.field(invalidField).getAttribute('aria-invalid'), 'true', name);
    assert.equal(r.savedState().offers.length, originalCount);
    r.set(name, validValue);
  }
});

test('Coupon eligibility, limits and hold survive save and reopening the existing editor', async t => {
  const r = await boot(t);
  r.createCoupon();
  r.set('serviceScope', 'selected');
  r.set('serviceIds', ['classic-pedicure', 'gel-manicure']);
  r.set('customerGroup', 'new');
  r.set('stacking', 'exclusive');
  r.set('exclusions', 'Excludes retail and tips.');
  await r.save();
  const offer = r.savedState().offers.find(item => item.title === 'Coupon audit');
  assert.ok(offer);
  assert.equal(offer.offerType, 'coupon');
  assert.deepEqual([offer.totalSlots, offer.perPersonLimit, offer.holdDays], [20, 1, 7]);
  assert.equal(offer.customerGroup, 'new');
  assert.deepEqual(offer.serviceIds, ['classic-pedicure', 'gel-manicure']);
  assert.equal(offer.exclusions, 'Excludes retail and tips.');
  r.d.querySelector('[data-promotion-id="' + offer.id + '"] [data-action="edit"]').click();
  await tick();
  assert.equal(r.field('offerType').value, 'coupon');
  assert.deepEqual(['totalSlots', 'perPersonLimit', 'holdDays'].map(name => r.field(name).value), ['20', '1', '7']);
  assert.equal(r.d.querySelector('#coupon-eligibility').hidden, false);
  assert.equal(r.field('customerGroup').value, 'new');
  const terms = r.d.querySelector('#studio-preview-terms').textContent;
  assert.match(terms, /Classic Pedicure, Gel Manicure/);
  assert.match(terms, /New customers/);
  assert.match(terms, /Uses per phone number: 1/);
  assert.match(terms, /Oct 10, 2026 → Oct 31, 2026/);
});

test('Coupon can explicitly keep a claim until its end date without a hold-day override', async t => {
  const r = await boot(t);
  r.createCoupon();
  r.set('holdDays', '');
  await r.save();
  const offer = r.savedState().offers.find(item => item.title === 'Coupon audit');
  assert.ok(offer);
  assert.equal(offer.holdDays, null);
  assert.equal(offer.perPersonLimit, 1);
});

test('Coupon selected-service eligibility blocks saving an empty selection', async t => {
  const r = await boot(t);
  r.createCoupon();
  r.set('serviceScope', 'selected');
  r.set('serviceIds', []);
  await r.save();
  assert.equal(r.d.querySelector('#promotion-editor').open, true);
  assert.equal(r.field('serviceIds').getAttribute('aria-invalid'), 'true');
  r.set('serviceIds', ['classic-pedicure']);
  await r.save();
  assert.ok(r.savedState().offers.find(item => item.title === 'Coupon audit'));
});

test('changing a draft back to Deal omits coupon limits and keeps existing Deal date behavior', async t => {
  const r = await boot(t);
  r.createCoupon();
  r.set('offerType', 'deal');
  r.set('startDate', '');
  r.set('endDate', '');
  await r.save();
  const offer = r.savedState().offers.find(item => item.title === 'Coupon audit');
  assert.ok(offer);
  assert.equal(offer.offerType, 'deal');
  assert.deepEqual([offer.totalSlots, offer.perPersonLimit, offer.holdDays], [null, null, null]);
});

test('Coupon settings remain independent when duplicating a promotion and filtering by type', async t => {
  const r = await boot(t);
  r.createCoupon();
  await r.save();
  const offer = r.savedState().offers.find(item => item.title === 'Coupon audit');
  r.d.querySelector('[data-promotion-id="' + offer.id + '"] [data-action="duplicate"]').click();
  await tick();
  const duplicate = r.savedState().offers.find(item => item.id !== offer.id && item.title.startsWith('Coupon audit'));
  assert.equal(duplicate.offerType, 'coupon');
  assert.deepEqual([duplicate.totalSlots, duplicate.perPersonLimit, duplicate.holdDays], [20, 1, 7]);
  assert.equal(duplicate.paused, true);
  const filter = r.d.querySelector('#promotion-offer-filter');
  filter.value = 'coupon';
  filter.dispatchEvent(new r.w.Event('change', {bubbles: true}));
  assert.equal(r.d.querySelectorAll('.promotion-card[data-promotion-id]').length, 2);
  r.d.querySelector('[data-promotion-id="' + duplicate.id + '"] [data-action="edit"]').click();
  r.set('totalSlots', '30');
  await r.save();
  assert.equal(r.savedState().offers.find(item => item.id === offer.id).totalSlots, 20);
  assert.equal(r.savedState().offers.find(item => item.id === duplicate.id).totalSlots, 30);
});

test('changing approved Coupon rules creates another Public review version', async t => {
  const r = await boot(t);
  r.createCoupon();
  await r.save('submit-promotion-approval');
  const state = r.savedState();
  const approved = state.offers.find(item => item.title === 'Coupon audit');
  approved.public = 'approved';
  const next = await boot(t, state);
  next.d.querySelector('[data-promotion-id="' + approved.id + '"] [data-action="edit"]').click();
  next.set('perPersonLimit', '2');
  await next.save('submit-promotion-approval');
  const changed = next.savedState().offers.find(item => item.id === approved.id);
  assert.equal(changed.public, 'pending');
  assert.equal(changed.publicationVersion, approved.publicationVersion + 1);
  assert.equal(changed.publicationHistory.at(-1).snapshot.perPersonLimit, 2);
});

test('legacy Deal records keep their eligibility and existing metadata when edited', async t => {
  const initial = await boot(t);
  const state = initial.savedState();
  const offer = state.offers[0];
  delete offer.offerType;
  offer.serviceScope = 'legacy';
  offer.customerGroup = 'legacy';
  offer.stacking = 'legacy';
  offer.services = 'Existing POS add-ons';
  offer.audience = 'Existing customer rule';
  offer.redemption = 'checkout';
  offer.uses = 48;
  const r = await boot(t, state);
  r.d.querySelector('[data-promotion-id="' + offer.id + '"] [data-action="edit"]').click();
  assert.equal(r.field('offerType').value, 'deal');
  assert.equal(r.d.querySelector('#coupon-eligibility').hidden, true);
  r.set('title', 'Updated legacy Deal');
  await r.save();
  const changed = r.savedState().offers.find(item => item.id === offer.id);
  for (const name of ['serviceScope', 'customerGroup', 'stacking', 'services', 'audience', 'redemption', 'uses']) assert.equal(changed[name], offer[name], name);
  assert.equal(changed.startDate, undefined);
  assert.equal(changed.endDate, undefined);
});

test('Coupon templates prefill the intended customer group without inventing inventory', async t => {
  const r = await boot(t);
  for (const [template, group] of [['wellness-first', 'new'], ['rebook-save', 'returning']]) {
    r.d.querySelector('[data-phase-template="' + template + '"]').click();
    assert.equal(r.field('offerType').value, 'coupon');
    assert.equal(r.field('customerGroup').value, group);
    assert.equal(r.field('totalSlots').value, '');
    assert.equal(r.field('perPersonLimit').value, '1');
    assert.equal(r.d.querySelector('#coupon-eligibility').hidden, false);
    r.d.querySelector('[data-close-editor]').click();
  }
});
