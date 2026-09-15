import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

function boot(query = '?section=checkin', seed) {
  const dom = new JSDOM(readFileSync(new URL('./pos-front-desk.html', import.meta.url), 'utf8'), {
    url: 'https://example.test/pages/pos-front-desk.html' + query, runScripts: 'outside-only'
  });
  const w = dom.window;
  w.structuredClone = structuredClone;
  w.matchMedia = () => ({matches: false});
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  for (const name of ['salon-data', 'appointment-tickets', 'appointments-store']) {
    w.eval(readFileSync(new URL('../assets/' + name + '.js', import.meta.url), 'utf8'));
  }
  if (seed) seed(w);
  for (const name of ['pos-turn-settings', 'team-calendar-content', 'pos-front-desk', 'service-assignments', 'front-desk-assignments', 'pos-estimate', 'front-desk-estimate', 'front-desk-checkin']) {
    const path = new URL('../assets/' + name + '.js', import.meta.url);
    w.eval(readFileSync(path, 'utf8'));
  }
  return dom;
}

function fill(w, selector, value, event = 'input') {
  const input = w.document.querySelector(selector);
  assert.ok(input, selector + ' exists');
  input.value = value;
  input.dispatchEvent(new w.Event(event, {bubbles: true}));
}
function contact(w) {
  fill(w, '#ci-contact-name', 'Brian <family>');
  fill(w, '#ci-contact-phone', '(806) 388-8899');
}

test('Check-in navigation opens its own section and preserves drafts through other tabs and history', () => {
  const dom = boot(), w = dom.window, d = w.document;
  assert.ok(d.querySelector('#front-desk-checkin'));
  assert.equal(d.querySelector('#front-desk-checkin').hidden, false);
  assert.equal(d.querySelector('#appointments').hidden, true);
  assert.equal(d.querySelector('[data-front-section="checkin"]').getAttribute('aria-current'), 'page');
  assert.equal(d.querySelector('[data-ci-mode="single"]').getAttribute('aria-pressed'), 'true');
  contact(w);
  d.querySelector('[data-front-section="estimate"]').click();
  assert.equal(d.querySelector('#front-desk-checkin').hidden, true);
  assert.equal(d.querySelector('#front-desk-estimate').hidden, false);
  d.querySelector('[data-front-section="checkin"]').click();
  assert.equal(d.querySelector('#ci-contact-name').value, 'Brian <family>');
  assert.equal(d.querySelector('#front-desk-estimate').hidden, true);
  d.querySelector('[data-front-section="appointments"]').click();
  assert.equal(d.querySelector('#appointments').hidden, false);
  assert.equal(d.querySelector('#front-desk-checkin').hidden, true);
  w.history.replaceState(null, '', '?tab=checkin&source=test');
  w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert.equal(d.querySelector('#front-desk-checkin').hidden, false);
  assert.equal(new URL(w.location.href).searchParams.get('tab'), 'checkin');
  w.close();
});

test('Family members keep repeated services and individual technicians when switching modes and tabs', () => {
  const dom = boot(), w = dom.window, d = w.document;
  contact(w);
  d.querySelector('[data-ci-add-service="mani"]').click();
  d.querySelector('[data-ci-add-service="mani"]').click();
  const lines = d.querySelectorAll('[data-ci-line]');
  assert.equal(lines.length, 2);
  fill(w, '[data-ci-line]:first-child select', 't1', 'change');
  fill(w, '[data-ci-line]:last-child select', 't2', 'change');
  d.querySelector('[data-ci-mode="family"]').click();
  assert.equal(d.querySelectorAll('[data-ci-member]').length, 2);
  fill(w, '#ci-member-name', 'Anna');
  fill(w, '#ci-member-relationship', 'Child', 'change');
  d.querySelector('[data-ci-add-service="pedi"]').click();
  d.querySelectorAll('[data-ci-member]')[0].click();
  assert.equal(d.querySelectorAll('[data-ci-line]').length, 2);
  assert.deepEqual([...d.querySelectorAll('[data-ci-line] select')].map(s => s.value), ['t1', 't2']);
  d.querySelector('[data-ci-mode="single"]').click();
  assert.equal(d.querySelector('#ci-summary-guests').textContent, '1');
  d.querySelector('[data-ci-mode="family"]').click();
  assert.equal(d.querySelector('#ci-member-name').value, 'Anna');
  assert.equal(d.querySelector('#ci-member-relationship').value, 'Child');
  assert.equal(d.querySelectorAll('[data-ci-line]').length, 1);
  d.querySelector('[data-ci-add-member]').click();
  d.querySelector('[data-ci-remove-member]').click();
  assert.equal(d.querySelectorAll('[data-ci-member]').length, 2);
  assert.match(d.querySelector('#ci-summary-total').textContent, /74.00/);
  assert.equal(d.querySelector('family'), null);
  w.close();
});

test('Review validates the contact, supports guests without services and creates each member once', () => {
  const dom = boot(), w = dom.window, d = w.document;
  d.querySelector('[data-ci-review]').click();
  assert.equal(d.querySelector('#ci-review-dialog').open, false);
  assert.match(d.querySelector('#ci-error').textContent, /name/i);
  contact(w);
  fill(w, '#ci-contact-phone', '123');
  d.querySelector('[data-ci-review]').click();
  assert.match(d.querySelector('#ci-error').textContent, /phone/i);
  fill(w, '#ci-contact-phone', '(806) 388-8899');
  d.querySelector('[data-ci-mode="family"]').click();
  d.querySelector('[data-ci-add-service="mani"]').click();
  d.querySelector('[data-ci-review]').click();
  assert.equal(d.querySelector('#ci-review-dialog').open, true);
  assert.match(d.querySelector('#ci-review-members').textContent, /Guest 2/);
  assert.match(d.querySelector('#ci-review-members').textContent, /Services can be selected later/);
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll().length, 0);
  const submit = d.querySelector('[data-ci-submit]');
  submit.click(); submit.click();
  const records = w.NEXORA_APPOINTMENTS_STORE.loadAll();
  assert.equal(records.length, 2);
  assert.deepEqual([...records].map(r => r.customerName), ['Brian <family>', 'Guest 2']);
  assert.equal(records[0].metadata.checkIn.id, records[1].metadata.checkIn.id);
  assert.equal(records[0].metadata.checkIn.smsConsent, false);
  assert.equal(d.querySelector('#ci-success').hidden, false);
  assert.equal(d.querySelectorAll('[data-ci-ticket-link]').length, 2);
  d.querySelector('[data-ci-new]').click();
  assert.equal(d.querySelector('#ci-contact-name').value, '');
  assert.equal(d.querySelector('#ci-summary-guests').textContent, '1');
  w.close();
});

test('Search combines category and text and marks unknown prices as pending', () => {
  const dom = boot(), w = dom.window, d = w.document;
  fill(w, '#ci-service-search', 'manicure');
  assert.ok(d.querySelector('[data-ci-add-service="mani"]'));
  assert.equal(d.querySelector('[data-ci-add-service="pedi"]'), null);
  d.querySelector('[data-ci-category="Pedicure"]').click();
  assert.equal(d.querySelectorAll('[data-ci-add-service]').length, 0);
  assert.match(d.querySelector('#ci-catalog-results').textContent, /No services/);
  fill(w, '#ci-service-search', '');
  d.querySelector('[data-ci-category="All"]').click();
  d.querySelector('[data-ci-add-service="kid"]').click();
  assert.match(d.querySelector('#ci-summary-total').textContent, /pricing pending/i);
  assert.match(d.querySelector('[data-ci-line]').textContent, /Price at checkout/);
  w.close();
});

test('Lookup can use today’s booking and checks it in without duplicating the representative', () => {
  const dom = boot('?section=checkin', w => {
    w.NEXORA_APPOINTMENTS_STORE.create({id: 'booking-brian', customerName: 'Brian', phone: '8063888899', startAt: new Date(), tickets: [{id: 'booked-mani', serviceId: 'mani', technicianId: 't2', price: 18, durationMin: 30}], status: 'confirmed'});
  }), w = dom.window, d = w.document;
  fill(w, '#ci-contact-phone', '+1 (806) 388-8899');
  d.querySelector('[data-ci-lookup]').click();
  assert.equal(d.querySelector('#ci-contact-name').value, 'Brian');
  d.querySelector('[data-ci-booking="booking-brian"]').click();
  assert.equal(d.querySelector('[data-ci-line] select').value, 't2');
  d.querySelector('[data-ci-review]').click();
  assert.match(d.querySelector('#ci-review-total').textContent, /18.00/);
  d.querySelector('[data-ci-submit]').click();
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll().length, 1);
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll()[0].id, 'booking-brian');
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll()[0].status, 'checked-in');
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll()[0].tickets[0].price, 18);
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll()[0].tickets[0].durationMin, 30);
  w.close();
});

test('A failed save leaves review and draft intact for retry', () => {
  const dom = boot(), w = dom.window, d = w.document;
  contact(w);
  d.querySelector('[data-ci-review]').click();
  const original = w.Storage.prototype.setItem;
  w.Storage.prototype.setItem = () => { throw new Error('Quota exceeded'); };
  d.querySelector('[data-ci-submit]').click();
  assert.equal(d.querySelector('#ci-review-dialog').open, true);
  assert.ok(d.querySelector('#ci-review-error').textContent.length > 0);
  assert.equal(d.querySelector('[data-ci-submit]').disabled, false);
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll().length, 0);
  w.Storage.prototype.setItem = original;
  d.querySelector('[data-ci-submit]').click();
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll().length, 1);
  w.close();
});

for (const detach of ['new-visit', 'different-phone']) test('Leaving a booking refreshes the reviewed price: ' + detach, () => {
  const dom = boot('?section=checkin', w => {
    w.NEXORA_APPOINTMENTS_STORE.create({id: 'special-booking', customerName: 'Brian', phone: '8063888899', startAt: new Date(), tickets: [{id: 'special-mani', serviceId: 'mani', price: 18, durationMin: 30}], status: 'confirmed'});
  }), w = dom.window, d = w.document;
  fill(w, '#ci-contact-phone', '8063888899');
  d.querySelector('[data-ci-lookup]').click();
  d.querySelector('[data-ci-booking="special-booking"]').click();
  if (detach === 'new-visit') d.querySelector('[data-ci-clear-booking]').click();
  else fill(w, '#ci-contact-phone', '2025550147');
  d.querySelector('[data-ci-review]').click();
  assert.match(d.querySelector('#ci-review-total').textContent, /22.00/);
  assert.match(d.querySelector('#ci-review-members').textContent, /45 min/);
  d.querySelector('[data-ci-submit]').click();
  const records = w.NEXORA_APPOINTMENTS_STORE.loadAll();
  assert.equal(records.find(record => record.id === 'special-booking').status, 'confirmed');
  assert.equal(records.find(record => record.metadata.checkIn).tickets[0].price, 22);
  w.close();
});
