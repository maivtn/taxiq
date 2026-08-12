import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('./check-in-mobile.html', import.meta.url), 'utf8');

function runtimeScript() {
  const scripts = [...SOURCE.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  const script = scripts.at(-1)?.[1];
  assert.ok(script, 'check-in mobile runtime script must exist');
  return script;
}

function createElement(id = '') {
  const classes = new Set();
  return {
    id,
    hidden: false,
    value: '',
    textContent: '',
    innerHTML: '',
    dataset: {},
    classList: {
      add(...names) { names.forEach((name) => classes.add(name)); },
      remove(...names) { names.forEach((name) => classes.delete(name)); },
      contains(name) { return classes.has(name); },
      toggle(name, force) {
        const next = force === undefined ? !classes.has(name) : Boolean(force);
        if (next) classes.add(name);
        else classes.delete(name);
        return next;
      }
    },
    addEventListener() {},
    focus() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    setAttribute(name, value) { this[name] = String(value); },
    getAttribute(name) { return this[name] || null; }
  };
}

function createCheckinRuntime() {
  const ids = [
    'serviceAccordion', 'selectedServices', 'selectedServiceChips', 'selectedServicesEmpty',
    'serviceSelectedCount', 'serviceTotalDuration', 'serviceTotalPrice', 'serviceNote',
    'serviceNoteCard', 'techGrid', 'checkinBtn', 'nameInput', 'phoneInput', 'toast',
    'kioskLanguageMenu', 'kioskLanguageTrigger', 'serviceDetailsModal', 'kiosk-done-card'
  ];
  const byId = new Map(ids.map((id) => [id, createElement(id)]));
  const document = {
    body: createElement('body'),
    documentElement: createElement('html'),
    getElementById(id) { return byId.get(id) || null; },
    querySelectorAll() { return []; },
    addEventListener() {}
  };
  const storage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };
  const window = {
    localStorage: storage,
    lucide: { createIcons() {} },
    scrollTo() {}
  };
  window.window = window;
  const context = vm.createContext({
    window,
    document,
    localStorage: storage,
    fetch: () => new Promise(() => {}),
    console,
    Date,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(runtimeScript(), context);
  return { byId, context };
}

test('shows technician selection before choose services in the check-in form', () => {
  const formState = SOURCE.match(/<div id="formState" class="hidden">([\s\S]*?)<button class="checkin-btn"/)?.[1] || '';
  const technicianIndex = formState.indexOf('id="techGrid"');
  const servicesIndex = formState.indexOf('class="card service-selection-card"');

  assert.notEqual(technicianIndex, -1);
  assert.notEqual(servicesIndex, -1);
  assert.ok(technicianIndex < servicesIndex, 'technician selection should appear before Choose services');
});

test('shows SMS consent immediately below the check-in button', () => {
  const buttonIndex = SOURCE.indexOf('<button class="checkin-btn" id="checkinBtn"');
  const consentIndex = SOURCE.indexOf('<div class="consent">', buttonIndex);
  const doneScreenIndex = SOURCE.indexOf('<!-- ===== Done screen ===== -->', buttonIndex);

  assert.notEqual(buttonIndex, -1);
  assert.notEqual(consentIndex, -1);
  assert.ok(consentIndex > buttonIndex, 'SMS consent should appear after the check-in button');
  assert.ok(consentIndex < doneScreenIndex, 'SMS consent should stay inside the form before the done screen');
  assert.match(SOURCE, /<button class="checkin-btn" id="checkinBtn"[\s\S]*?<\/button>\s*<div class="consent">\s*<input type="checkbox" id="smsConsent">\s*<label for="smsConsent">I agree to receive text messages from Bitcoin Nail Bar \(offers, reminders\s*&amp; rewards\)\. Msg &amp; data rates may apply\. Reply STOP anytime to opt out\.<\/label>\s*<\/div>/);
});

test('hides beverage sections from the check-in service picker', () => {
  const { byId, context } = createCheckinRuntime();

  vm.runInContext(`
    SERVICE_CATEGORIES = normalizeMenuData({
      sections: [{
        id: 'manicure',
        title: 'Manicure',
        kind: 'service',
        items: [{ name: 'Gel Manicure', priceLabel: '$45' }]
      }, {
        id: 'complimentary-cocktails',
        title: 'Complimentary Drinks',
        kind: 'beverage',
        items: [{ name: 'Mojito', priceLabel: 'Complimentary' }]
      }]
    });
    SERVICES = SERVICE_CATEGORIES.flatMap(category => category.items);
    renderServices();
  `, context);

  const html = byId.get('serviceAccordion').innerHTML;
  assert.match(html, /Gel Manicure/);
  assert.doesNotMatch(html, /Complimentary Drinks/);
  assert.doesNotMatch(html, /Mojito/);
});

test('renders service categories as name plus count chips', () => {
  const { byId, context } = createCheckinRuntime();

  vm.runInContext(`
    SERVICE_CATEGORIES = [{
      id: 'pedicure',
      title: 'Pedicure',
      kind: 'service',
      items: [
        { id: 'pedicure--0', name: 'Classic Pedicure', priceLabel: '$40', price: 40, durationMinutes: 30 },
        { id: 'pedicure--1', name: 'Gel Add-On', priceLabel: '$20', price: 20, durationMinutes: 0 }
      ]
    }];
    SERVICES = SERVICE_CATEGORIES.flatMap(category => category.items);
    renderServices();
  `, context);

  const html = byId.get('serviceAccordion').innerHTML;
  assert.match(html, /class="category-trigger category-chip"/);
  assert.match(html, /class="category-chip-name">Pedicure<\/span>/);
  assert.match(html, /class="category-chip-number">2<\/span>/);
  assert.doesNotMatch(html, /category-kind/);
});

test('groups category chips inline in one wrapper before service panels', () => {
  const { byId, context } = createCheckinRuntime();

  vm.runInContext(`
    SERVICE_CATEGORIES = [{
      id: 'pedicure',
      title: 'Pedicure',
      kind: 'service',
      items: [{ id: 'pedicure--0', name: 'Classic Pedicure', priceLabel: '$40', price: 40, durationMinutes: 30 }]
    }, {
      id: 'manicure',
      title: 'Manicure',
      kind: 'service',
      items: [{ id: 'manicure--0', name: 'Gel Manicure', priceLabel: '$45', price: 45, durationMinutes: 45 }]
    }];
    SERVICES = SERVICE_CATEGORIES.flatMap(category => category.items);
    renderServices();
  `, context);

  const html = byId.get('serviceAccordion').innerHTML;
  assert.match(html, /<div class="category-chip-list"[^>]*>[\s\S]*category-chip-name">Pedicure<\/span>[\s\S]*category-chip-name">Manicure<\/span>[\s\S]*<\/div><div class="category-panel-list">/);
  assert.doesNotMatch(html, /<article class="service-category[^"]*" data-category-id/);
});

test('does not render chevron icons inside category chips', () => {
  const { byId, context } = createCheckinRuntime();

  vm.runInContext(`
    SERVICE_CATEGORIES = [{
      id: 'pedicure',
      title: 'Pedicure',
      kind: 'service',
      items: [{ id: 'pedicure--0', name: 'Classic Pedicure', priceLabel: '$40', price: 40, durationMinutes: 30 }]
    }];
    SERVICES = SERVICE_CATEGORIES.flatMap(category => category.items);
    renderServices();
  `, context);

  const html = byId.get('serviceAccordion').innerHTML;
  const chipList = html.match(/<div class="category-chip-list"[^>]*>([\s\S]*?)<\/div><div class="category-panel-list">/)?.[1] || '';
  assert.doesNotMatch(chipList, /data-lucide="chevron-down"/);
  assert.doesNotMatch(chipList, /<i\b/);
});

test('allows guest check-in without choosing a service', async () => {
  const { byId, context } = createCheckinRuntime();

  byId.get('nameInput').value = 'Mia Nguyen';

  vm.runInContext('updateCheckinBtn();', context);
  assert.equal(byId.get('checkinBtn').disabled, false);

  await vm.runInContext('checkIn();', context);

  assert.doesNotMatch(byId.get('toast').textContent, /Please choose at least one service|service list changed/i);
  assert.match(byId.get('kiosk-done-card').innerHTML, /You're checked in, Mia Nguyen!/);
});

test('keeps technicians selectable after services are chosen', () => {
  const { byId, context } = createCheckinRuntime();

  const selectedTech = vm.runInContext(`
    SERVICE_CATEGORIES = [{
      id: 'pedicure',
      title: 'Pedicure',
      kind: 'service',
      items: [{ id: 'classic-pedicure', name: 'Classic Pedicure', priceLabel: '$40', price: 40, durationMinutes: 30 }]
    }];
    SERVICES = SERVICE_CATEGORIES.flatMap(category => category.items);
    selectedServices = ['classic-pedicure'];
    TECHS.forEach(tech => { if (tech.id !== 'first') tech.services = []; });
    renderTechs();
    selectTech('kim');
    selectedTech;
  `, context);

  const html = byId.get('techGrid').innerHTML;
  assert.doesNotMatch(html, /Not available for this service/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /class="tech[^"]*\bdisabled\b/);
  assert.equal(selectedTech, 'kim');
});
