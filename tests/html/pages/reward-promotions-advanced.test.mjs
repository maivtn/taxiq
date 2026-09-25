import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const page = new URL('../../../html/pages/reward-promotions.html', import.meta.url);
const key = 'nexora:reward-promotions:v1';
const tick = () => new Promise(resolve => setImmediate(resolve));

async function boot(t, saved) {
  const dom = new JSDOM(readFileSync(page, 'utf8'), {
    url: 'https://nexora.test/pages/reward-promotions.html', runScripts: 'outside-only'
  });
  const w = dom.window, d = w.document;
  t.after(() => dom.window.close());
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  if (saved) w.localStorage.setItem(key, JSON.stringify(saved));
  await new Promise(resolve => w.addEventListener('load', resolve, {once: true}));
  for (const script of d.scripts) {
    const src = script.getAttribute('src');
    if (src && !src.startsWith('../assets/')) continue;
    w.eval(src ? readFileSync(new URL(src, page), 'utf8') : script.textContent);
  }
  await tick();
  return {w, d, form: d.querySelector('#promotion-form'), saved: () => JSON.parse(w.localStorage.getItem(key))};
}

test('advanced settings remain visible when the heading is clicked', async t => {
  const {d} = await boot(t);
  d.querySelector('#create-promotion').click();
  await tick();
  const advanced = d.querySelector('.phase-advanced');
  const heading = advanced.querySelector('.phase-advanced-heading, summary');
  assert.ok(heading, 'advanced settings heading exists');
  heading.click();
  assert.equal(d.querySelector('#paid-advertising-fields').closest('details:not([open])'), null);
});

test('organic Search Deals and paid placements are distinct and placement overview opens', async t => {
  const {d} = await boot(t);
  d.querySelector('#create-promotion').click();
  await tick();
  const organic = d.querySelector('[name="public"]').closest('label');
  assert.match(organic.textContent, /Search Deals listing/i);
  assert.match(organic.textContent, /Free/i);
  const sponsored = [...d.querySelectorAll('[name="paidPlacement"]')].map(input => input.closest('label').textContent.trim());
  assert.equal(sponsored.length, 3);
  sponsored.forEach(label => assert.match(label, /Sponsored/i));
  const preview = d.querySelector('#preview-paid-placements');
  assert.ok(preview, 'placement overview action is available');
  preview.click();
  const dialog = d.querySelector('#paid-placement-overview-dialog');
  assert.equal(dialog.open, true);
  assert.deepEqual([...dialog.querySelectorAll('[data-paid-placement-overview] h3')].map(heading => heading.textContent.trim()), [
    'Explore & Nearby', 'Search Deals', 'Network banner'
  ]);
  const oneQrDestinations = [...dialog.querySelectorAll('[data-oneqr-destination]')].map(destination => ({
    id: destination.dataset.oneqrDestination,
    title: destination.querySelector('strong').textContent.trim(),
    description: destination.querySelector('small').textContent.trim()
  }));
  assert.deepEqual(oneQrDestinations, [
    {id: 'nearby', title: 'Deals Nearby / Explore', description: 'Khám phá địa điểm quanh bạn'},
    {id: 'search', title: 'Search Deals', description: 'Tìm ưu đãi theo dịch vụ'}
  ]);
  d.querySelector('#close-paid-placement-overview').click();
  assert.equal(dialog.open, false);
});

test('simplified paid settings retain schedule, targeting and budget when saved and reopened', async t => {
  const {d, form, saved} = await boot(t);
  d.querySelector('#create-promotion').click();
  await tick();
  const controls = form.elements;
  assert.equal(controls.namedItem('budgetCap'), null);
  assert.equal(controls.namedItem('audiencePhase1'), null);
  assert.equal(d.querySelector('#paid-advertising-fields').closest('details:not([open])'), null);
  assert.equal(d.querySelector('#paid-advertising-fields').hidden, false);
  controls.title.value = 'Simple paid promotion';
  controls.startDate.value = '2026-10-01';
  controls.endDate.value = '2026-10-31';
  controls.promotionArea.value = 'Austin';
  controls.paidBoost.click();
  assert.equal(d.querySelector('#paid-advertising-fields').hidden, false);
  controls.boostBudget.value = '200';
  controls.paidDailyBudget.value = '20';
  controls.paidObjective.value = 'bookings';
  d.querySelector('#save-promotion-draft').click();
  await tick();
  const offer = saved().offers.find(item => item.title === 'Simple paid promotion');
  assert.ok(offer);
  const campaign = saved().campaigns.find(item => item.promotionId === offer.id);
  assert.deepEqual([campaign.startDate, campaign.endDate, campaign.area, campaign.totalBudget, campaign.dailyBudget, campaign.objective],
    ['2026-10-01', '2026-10-31', 'Austin', 200, 20, 'bookings']);
  assert.equal(campaign.creativeId, offer.banners[0].id);
  const restored = await boot(t, saved());
  restored.d.querySelector('[data-promotion-id="' + offer.id + '"] [data-action="edit"]').click();
  await tick();
  assert.equal(restored.form.elements.startDate.value, '2026-10-01');
  assert.equal(restored.form.elements.endDate.value, '2026-10-31');
  assert.equal(restored.form.elements.paidObjective.value, 'bookings');
  restored.form.elements.paidBoost.click();
  assert.equal(restored.d.querySelector('#paid-advertising-fields').hidden, false);
  assert.equal(restored.form.elements.paidBoost.checked, false);
  restored.d.querySelector('#save-promotion-draft').click();
  await tick();
  assert.equal(restored.saved().offers.find(item => item.id === offer.id).paidBoost, false);
  assert.equal(restored.saved().campaigns.some(item => item.promotionId === offer.id), false);
});

test('paid advertising still requires a sponsored channel with all settings visible', async t => {
  const {d, form} = await boot(t);
  d.querySelector('#create-promotion').click();
  await tick();
  form.elements.title.value = 'Needs a channel';
  form.elements.paidBoost.click();
  form.querySelectorAll('[name="paidPlacement"]').forEach(input => { input.checked = false; });
  d.querySelector('#save-promotion-draft').click();
  assert.equal(d.querySelector('#paid-advertising-fields').closest('details:not([open])'), null);
  assert.equal(d.activeElement.name, 'paidPlacement');
  assert.equal(d.querySelector('#promotion-editor').open, true);
  await tick();
});

test('editing a legacy promotion preserves its stored promotion budget cap', async t => {
  const initial = await boot(t);
  const state = initial.saved();
  const offer = state.offers[0];
  offer.budgetCap = 350;
  offer.audiencePhase1 = 'existing';
  const {d, form, saved} = await boot(t, state);
  d.querySelector('[data-promotion-id="' + offer.id + '"] [data-action="edit"]').click();
  await tick();
  form.elements.title.value = 'Updated legacy title';
  d.querySelector('#save-promotion-draft').click();
  await tick();
  const updated = saved().offers.find(item => item.id === offer.id);
  assert.equal(updated.budgetCap, 350);
  assert.equal(updated.audiencePhase1, 'existing');
});
