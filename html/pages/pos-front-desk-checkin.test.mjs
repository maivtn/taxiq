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
  w.confirm = () => true;
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
  assert.equal(d.querySelectorAll('[data-ci-member]').length, 1);
  d.querySelector('[data-ci-add-member]').click();
  assert.equal(d.querySelectorAll('[data-ci-member]').length, 2);
  assert.equal(d.querySelector('#ci-member-name').value, 'Guest 2');
  fill(w, '#ci-member-name', 'Anna');
  fill(w, '#ci-member-relationship', 'Child', 'change');
  d.querySelector('[data-ci-add-service="pedi"]').click();
  d.querySelectorAll('[data-ci-member]')[0].click();
  assert.equal(d.querySelectorAll('[data-ci-line]').length, 2);
  assert.deepEqual([...d.querySelectorAll('[data-ci-line] select')].map(s => s.value), ['t1', 't2']);
  d.querySelector('[data-ci-mode="single"]').click();
  assert.equal(d.querySelector('#ci-summary-guests').textContent, '1');
  d.querySelector('[data-ci-mode="family"]').click();
  d.querySelectorAll('[data-ci-member]')[1].click();
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
  assert.equal(d.querySelector('#ci-review-dialog').open, true);
  assert.match(d.querySelector('#ci-review-error').textContent, /name/i);
  d.querySelector('[data-ci-submit]').click();
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll().length, 0);
  d.querySelector('[data-ci-close]').click();
  contact(w);
  fill(w, '#ci-contact-phone', '123');
  d.querySelector('[data-ci-review]').click();
  assert.match(d.querySelector('#ci-review-error').textContent, /phone/i);
  d.querySelector('[data-ci-close]').click();
  fill(w, '#ci-contact-phone', '(806) 388-8899');
  d.querySelector('[data-ci-mode="family"]').click();
  d.querySelector('[data-ci-add-member]').click();
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

test('The primary member editor keeps its name synchronized and can check in alone in family mode', () => {
  const dom = boot(), w = dom.window, d = w.document;
  contact(w);
  d.querySelector('[data-ci-mode="family"]').click();
  assert.equal(d.querySelectorAll('[data-ci-member]').length, 1);
  fill(w, '#ci-member-name', 'Brian updated');
  assert.equal(d.querySelector('#ci-contact-name').value, 'Brian updated');
  fill(w, '#ci-contact-name', 'Brian again');
  assert.equal(d.querySelector('#ci-member-name').value, 'Brian again');
  d.querySelector('[data-ci-add-service="mani"]').click();
  assert.ok(d.querySelector('#ci-member-editor [data-ci-line]'));
  d.querySelector('[data-ci-review]').click();
  d.querySelector('[data-ci-submit]').click();
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll().length, 1);
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll()[0].customerName, 'Brian again');
  assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll()[0].metadata.checkIn.mode, 'family');
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

test('Removing a member with services requires confirmation and keeps the draft when cancelled', () => {
  const dom = boot(), w = dom.window, d = w.document;
  contact(w);
  d.querySelector('[data-ci-mode="family"]').click();
  d.querySelector('[data-ci-add-member]').click();
  d.querySelector('[data-ci-add-service="mani"]').click();
  w.confirm = () => false;
  d.querySelector('[data-ci-remove-member]').click();
  assert.equal(d.querySelectorAll('[data-ci-member]').length, 2);
  assert.equal(d.querySelectorAll('[data-ci-line]').length, 1);
  w.confirm = () => true;
  d.querySelector('[data-ci-remove-member]').click();
  assert.equal(d.querySelectorAll('[data-ci-member]').length, 1);
  assert.equal(d.querySelector('[data-ci-mode="family"]').getAttribute('aria-pressed'), 'true');
  w.close();
});
