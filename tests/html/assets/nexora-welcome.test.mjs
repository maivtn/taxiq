import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const asset = (name) => readFileSync(new URL(`../../../html/assets/${name}`, import.meta.url), 'utf8');
const page = (name) => readFileSync(new URL(`../../../html/pages/${name}`, import.meta.url), 'utf8');

function loadPage(name, saved = {}) {
  const dom = new JSDOM(page(name), { url: `http://localhost/html/pages/${name}`, runScripts: 'outside-only' });
  const { window } = dom;
  window.matchMedia = () => ({ matches: true });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  for (const [key, value] of Object.entries(saved)) window.localStorage.setItem(key, value);
  window.eval(asset('nexora-icons.js'));
  if (name === 'salon-home.html') {
    window.eval(asset('nexora-shell-nav.js'));
    window.eval(asset('nexora-salon-audio.js'));
    window.eval(asset('nexora-salon-home.js'));
  } else {
    if (name === 'nexora-getting-started.html') {
      window.eval(asset('vendor/tom-select/tom-select.complete.min.js'));
      window.NEXORA_APPOINTMENT_SERVICE_CATALOG = { load: () => Promise.resolve({ categories: [] }) };
      window.eval(asset('pos-salon-services.js'));
      window.eval(asset('pos-salon-settings.js'));
      window.eval(asset('nexora-staff-setup.js'));
      window.eval(asset('oneqr-industries.js'));
      window.eval(asset('oneqr-action-appearance.js'));
      window.eval(asset('oneqr-industry-picker.js'));
      window.eval(asset('nexora-qr-setup.js'));
      window.QRCode = Object.assign(function (container, options) {
        const image = window.document.createElement('img');
        image.alt = 'Scan to Join';
        container.appendChild(image);
        container.dataset.qrValue = options.text;
      }, { CorrectLevel: { M: 0 } });
      window.eval(asset('qr-stations-workflows.js'));
    }
    window.eval(asset('nexora-welcome-data.js'));
    window.eval(asset('nexora-welcome.js'));
    if (name === 'nexora-home.html') window.eval(asset('nexora-business-directory.js'));
  }
  return dom;
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert.ok(element, `Expected control ${selector}`);
  element.click();
  return element;
}

function enter(window, name, value) {
  const input = window.document.querySelector(`#nxw-setup-form [name="${name}"]`);
  assert.ok(input, `Expected field ${name}`);
  input.value = value;
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
}

function submit(window) {
  window.document.getElementById('nxw-setup-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

test('Salon Home uses the PO showcases and slideshow with local module destinations', () => {
  const dom = loadPage('salon-home.html');
  try {
    const { window } = dom;
    assert.equal(window.document.querySelectorAll('#salon-slide-dots button').length, 12);
    assert.equal(window.document.querySelectorAll('#salon-products .salon-product').length, 12);
    assert.equal(window.document.querySelectorAll('#salon-intro-video video').length, 2);
    click(window, '#salon-slide-prev');
    assert.equal(window.document.getElementById('salon-home-title').textContent, 'Analytics');
    click(window, '#salon-slide-next');
    assert.equal(window.document.getElementById('salon-home-title').textContent, 'SI POS');
    assert.match(window.document.querySelector('#salon-slide-link').href, /dashboard\.html\?module=pos$/);
    click(window, '#salon-slide-dots button:nth-child(5)');
    assert.equal(window.document.getElementById('salon-home-title').textContent, 'Spin Wheel');
    assert.equal(window.document.querySelector('#salon-slide-dots button:nth-child(5)').getAttribute('aria-current'), 'true');
    assert.equal(window.document.getElementById('salon-slide-play').getAttribute('aria-label'), 'Play slideshow');
  } finally { dom.window.close(); }
});

test('PO feature explorer changes product and renders the selected One QR preview', () => {
  const dom = loadPage('salon-home.html');
  try {
    const { window } = dom;
    const product = [...window.document.querySelectorAll('#explorer-products button')].find((button) => button.textContent === 'One QR');
    assert.ok(product);
    product.click();
    const booking = [...window.document.querySelectorAll('#explorer-feature-list button')].find((button) => button.textContent.endsWith('Book appointment'));
    assert.ok(booking);
    booking.click();
    assert.equal(window.document.getElementById('explorer-feature-name').textContent, 'Book appointment');
    assert.match(window.document.getElementById('explorer-screen').getAttribute('aria-label'), /Book appointment/);
    assert.match(window.document.querySelector('#explorer-module-link').href, /dashboard\.html\?module=oneqr$/);
    assert.ok([...window.document.querySelectorAll('#explorer-feature-list button[aria-pressed="true"]')].some((button) => button.textContent.endsWith('Book appointment')));
  } finally { dom.window.close(); }
});

test('every Salon Home feature renders the selected screen without script errors', () => {
  const dom = loadPage('salon-home.html');
  try {
    const { window } = dom;
    const errors = [];
    window.addEventListener('error', event => { errors.push(event.error); event.preventDefault(); });
    const names = [...window.document.querySelectorAll('#explorer-products button')].map(button => button.textContent);
    for (const name of names) {
      [...window.document.querySelectorAll('#explorer-products button')].find(button => button.textContent === name).click();
      const labels = [...window.document.querySelectorAll('#explorer-feature-list button span:nth-child(2)')].map(label => label.textContent);
      for (const [index, label] of labels.entries()) {
        window.document.querySelectorAll('#explorer-feature-list button')[index].click();
        assert.equal(errors.length, 0, `${name}: ${label}: ${errors[0]?.message}`);
        assert.equal(window.document.querySelector('#explorer-screen .explorer-screen-head span').textContent, label, `${name}: selected preview must update`);
        assert.ok(window.document.querySelector('#explorer-screen .explorer-screen-body').childElementCount > 0, `${name}: ${label}: preview must contain a visual`);
      }
    }
  } finally { dom.window.close(); }
});

test('Onboarding requires real entries, preserves browser drafts, and keeps industries independent', () => {
  const sentinel = 'keep-existing-pos-data';
  const dom = loadPage('nexora-getting-started.html', { 'existing-pos-store': sentinel });
  let stored;
  try {
    const { window } = dom;
    submit(window);
    assert.match(window.document.getElementById('nxw-progress-label').textContent, /^0\/4/);
    enter(window, 'name', 'Demo Studio');
    enter(window, 'street', '123 Example Avenue, Suite 100');
    enter(window, 'phone', '(312) 555-0100');
    submit(window);
    assert.match(window.document.getElementById('nxw-progress-label').textContent, /^0\/4/);
    enter(window, 'city', 'Chicago');
    enter(window, 'region', 'Illinois');
    enter(window, 'zip', '60601');
    enter(window, 'country', 'US');
    enter(window, 'bookingPhone', '(346) 680-2333');
    enter(window, 'timeZone', 'America/Chicago');
    click(window, '[name="hoursOpen0"]');
    assert.equal(window.document.querySelector('[name="hoursFrom0"]').disabled, true);
    for (let day = 1; day < 7; day++) {
      enter(window, `hoursFrom${day}`, '09:00');
      enter(window, `hoursTo${day}`, '18:00');
    }
    submit(window);
    assert.match(window.document.getElementById('nxw-progress-label').textContent, /^1\/4/);
    assert.equal(window.document.querySelector('[data-setup-step="0"]').dataset.completed, 'true');
    const preview = window.document.getElementById('nxw-entered-preview').textContent;
    assert.match(preview, /123 Example Avenue, Suite 100, Chicago, Illinois, 60601, US/);
    assert.match(preview, /\+1 \(312\) 555-0100/);
    assert.match(preview, /America\/Chicago/);
    assert.match(preview, /SundayClosed/);
    click(window, '[data-industry="retail"]');
    assert.match(window.document.getElementById('nxw-progress-label').textContent, /^0\/4/);
    assert.equal(window.document.querySelector('[name="name"]').value, '');
    click(window, '[data-industry="nail"]');
    click(window, '[data-setup-step="0"]');
    assert.equal(window.document.querySelector('[name="name"]').value, 'Demo Studio');
    stored = window.localStorage.getItem(window.NEXORA_WELCOME.storageKey);
    assert.equal(window.localStorage.getItem('existing-pos-store'), sentinel);
  } finally { dom.window.close(); }
  const reopened = loadPage('nexora-getting-started.html', { 'nexora.local-onboarding.v1': stored });
  try {
    assert.match(reopened.window.document.getElementById('nxw-progress-label').textContent, /^1\/4/);
    assert.equal(reopened.window.document.querySelector('[data-setup-step="1"]').getAttribute('aria-current'), 'step');
    click(reopened.window, '[data-setup-step="0"]');
    assert.equal(reopened.window.document.querySelector('[name="city"]').value, 'Chicago');
    assert.equal(reopened.window.document.querySelector('[name="phoneCountry"]').value, 'US');
    assert.equal(reopened.window.document.querySelector('[name="bookingPhone"]').value, '(346) 680-2333');
    assert.equal(reopened.window.document.querySelector('[name="hoursOpen0"]').checked, false);
    assert.equal(reopened.window.document.querySelector('[name="hoursFrom1"]').value, '09:00');
  } finally { reopened.window.close(); }
});

test('Services preparation reuses categories and the service editor while saving only onboarding drafts', async () => {
  const storageKey = 'nexora.local-onboarding.v1';
  const posKey = 'nexora:service-approval:v1:bitcoin-nail-bar-houston';
  const catalog = [{ id: 'manicure', name: 'Manicure', services: [{ id: 'milk-honey', name: 'Milk & Honey', price: 10, durationMin: 30, active: true }] }];
  const dom = loadPage('nexora-getting-started.html', {
    [storageKey]: JSON.stringify({ industry: 'nail', drafts: { nail: { services: { fields: { serviceCatalog: catalog, serviceApprovals: [] }, completed: false } } } }),
    [posKey]: 'keep-pos-settings'
  });
  try {
    const { window } = dom;
    const doc = window.document;
    click(window, '[data-setup-step="1"]');
    await Promise.resolve();
    assert.equal(doc.querySelector('[name="item1Name"]'), null);
    assert.ok(doc.querySelector('[data-service-filter="manicure"]'));
    const search = doc.querySelector('[data-service-search]');
    search.value = 'no-match';
    search.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.match(doc.querySelector('[data-approval-services]').textContent, /No services match your search/);
    click(window, '[data-service-clear]');
    click(window, '[data-service-view="card"]');
    assert.match(doc.querySelector('.salon-service-card').textContent, /Milk & Honey/);
    click(window, '[data-salon-service-edit="milk-honey"]');
    const price = doc.querySelector('[data-service-edit-price]');
    price.value = '25';
    doc.querySelector('[data-service-approval]').checked = true;
    doc.querySelector('[data-service-editor-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(doc.querySelector('[data-service-editor]').hidden, true);
    submit(window);
    assert.equal(doc.querySelector('[data-setup-step="1"]').dataset.completed, 'true');
    click(window, '[data-service-view="list"]');
    const inlinePrice = doc.querySelector('[data-inline-field="price"]');
    inlinePrice.value = '35';
    inlinePrice.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(doc.querySelector('[data-setup-step="1"]').dataset.completed, 'false');
    click(window, '[data-service-add="manicure"]');
    assert.equal(doc.querySelector('#service-editor-title').textContent, 'New Service');
    click(window, '[data-service-editor-close]');
    assert.equal(doc.querySelectorAll('[data-salon-service-row]').length, 1);
    const saved = JSON.parse(window.localStorage.getItem(storageKey)).drafts.nail.services.fields;
    assert.equal(Number(saved.serviceCatalog[0].services[0].price), 35);
    assert.deepEqual(saved.serviceApprovals, ['milk-honey']);
    assert.equal(window.localStorage.getItem(posKey), 'keep-pos-settings');
    click(window, '[data-setup-step="2"]');
    click(window, '[data-setup-step="1"]');
    await Promise.resolve();
    assert.equal(doc.querySelector('[data-inline-field="price"]').value, '35');
  } finally { dom.window.close(); }
});

test('Menu preparation reuses the catalog editor without service duration and keeps industries independent', async () => {
  const storageKey = 'nexora.local-onboarding.v1';
  const dom = loadPage('nexora-getting-started.html', {
    [storageKey]: JSON.stringify({ industry: 'restaurant', drafts: { restaurant: { menu: { fields: { item1Name: 'Beef phở', item1Price: '16', item2Name: 'Spring rolls', item2Price: '9' } } } } })
  });
  try {
    const { window } = dom;
    const doc = window.document;
    click(window, '[data-setup-step="1"]');
    await Promise.resolve();
    assert.equal(doc.getElementById('nxw-step-title').textContent, 'Prepare the menu');
    assert.ok(doc.querySelector('[data-menu-catalog]'));
    assert.equal(doc.querySelector('[data-service-search]').placeholder, 'Search menu items...');
    assert.equal(doc.querySelector('[data-inline-field="durationMin"]'), null);
    assert.doesNotMatch(doc.querySelector('[data-approval-services]').textContent, /Approval|Duration|Add Service/);
    click(window, '[data-salon-service-edit="onboarding-menu-item-1"]');
    assert.equal(doc.getElementById('service-editor-title').textContent, 'Edit item');
    assert.equal(doc.querySelector('[data-service-edit-duration]').disabled, true);
    assert.equal(doc.querySelector('[data-service-edit-duration]').closest('label').hidden, true);
    assert.equal(doc.querySelector('[data-service-edit-fee]').closest('label').hidden, true);
    assert.equal(doc.querySelector('.salon-service-approval').hidden, true);
    doc.querySelector('[data-service-edit-price]').value = '0';
    doc.querySelector('[data-service-edit-description]').value = 'Rice noodles and beef';
    doc.querySelector('[data-service-editor-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(doc.querySelector('[data-service-editor]').hidden, true);
    submit(window);
    assert.equal(doc.querySelector('[data-setup-step="1"]').dataset.completed, 'true');
    const saved = JSON.parse(window.localStorage.getItem(storageKey)).drafts.restaurant.menu.fields;
    assert.equal(saved.item1Name, 'Beef phở');
    assert.equal(saved.menuCatalog[0].services[0].price, 0);
    assert.equal(saved.menuCatalog[0].services[0].description, 'Rice noodles and beef');
    assert.equal(Object.hasOwn(saved.menuCatalog[0].services[0], 'durationMin'), false);
    click(window, '[data-service-view="card"]');
    assert.match(doc.querySelector('.salon-service-card').textContent, /\$0\.00/);
    assert.doesNotMatch(doc.querySelector('.salon-service-card').textContent, /min/);
    click(window, '[data-industry="food"]');
    click(window, '[data-setup-step="1"]');
    await Promise.resolve();
    assert.ok(doc.querySelector('[data-service-filter="menu-food"]'));
    assert.doesNotMatch(doc.querySelector('[data-approval-services]').textContent, /Beef phở|Gel manicure/);
    submit(window);
    assert.match(doc.getElementById('nxw-save-status').textContent, /Enter an item name and a valid price/);
    click(window, '[data-industry="restaurant"]');
    click(window, '[data-setup-step="1"]');
    await Promise.resolve();
    assert.equal(doc.querySelector('[data-inline-field="price"]').value, '0');
  } finally { dom.window.close(); }
});

test('Staff preparation saves complete profiles, assignments, schedules, and unfinished editor drafts', async () => {
  const storageKey = 'nexora.local-onboarding.v1';
  const hours = { timeZone: 'America/Chicago' };
  for (let day = 0; day < 7; day++) Object.assign(hours, { [`hoursOpen${day}`]: 'true', [`hoursFrom${day}`]: '09:00', [`hoursTo${day}`]: '18:00' });
  const catalog = [{ id: 'manicure', name: 'Manicure', services: [{ id: 'milk-honey', name: 'Milk & Honey', price: 10, durationMin: 30 }] }];
  const dom = loadPage('nexora-getting-started.html', {
    [storageKey]: JSON.stringify({ industry: 'nail', drafts: { nail: { business: { fields: hours }, services: { fields: { serviceCatalog: catalog } } } } }),
    'existing-pos-store': 'keep-pos-data'
  });
  try {
    const { window } = dom;
    const doc = window.document;
    const change = (selector, value) => {
      const input = doc.querySelector(selector);
      input.value = value;
      input.dispatchEvent(new window.Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    };
    click(window, '[data-setup-step="2"]');
    await Promise.resolve();
    assert.equal(doc.querySelector('[name="staff1Name"]'), null);
    submit(window);
    assert.equal(doc.querySelector('[data-setup-step="2"]').dataset.completed, 'false');
    click(window, '[data-staff-add]');
    change('[data-staff-form] [name="name"]', 'Demo Tech');
    change('[data-staff-form] [name="phone"]', '909123456');
    change('[data-staff-form] [name="phoneCountry"]', 'VN');
    change('[data-staff-form] [name="email"]', 'demo@example.com');
    change('[data-staff-form] [name="posRole"]', 'manager');
    change('[data-staff-form] [name="payStructure"]', 'weekly');
    change('[data-staff-form] [name="weeklySalary"]', '1000');
    click(window, '[data-staff-form] [name="tipsEnabled"]');
    click(window, '[data-staff-service="milk-honey"]');
    click(window, '[data-staff-day-off="6"]');
    assert.equal(doc.querySelector('[data-staff-start="6"]').disabled, true);
    doc.querySelector('[data-staff-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(doc.querySelector('[data-staff-overlay]').hidden, true);
    assert.match(doc.querySelector('[data-staff-grid]').textContent, /Demo Tech/);
    assert.match(doc.querySelector('[data-staff-grid]').textContent, /\+84 909123456/);
    submit(window);
    assert.equal(doc.querySelector('[data-setup-step="2"]').dataset.completed, 'true');
    const staff = JSON.parse(window.localStorage.getItem(storageKey)).drafts.nail.staff.fields.staffMembers[0];
    assert.equal(staff.payStructure, 'weekly');
    assert.equal(staff.weeklySalary, '1000');
    assert.equal(staff.tipsEnabled, false);
    assert.deepEqual(staff.serviceIds, ['milk-honey']);
    assert.equal(staff.weekly[6].off, true);
    click(window, `[data-tech-detail-open="${staff.id}"]`);
    change('[data-staff-form] [name="phone"]', '909999999');
    click(window, '[data-staff-close]');
    assert.equal(doc.querySelector('[data-setup-step="2"]').dataset.completed, 'false');
    click(window, '[data-setup-step="1"]');
    click(window, '[data-setup-step="2"]');
    await Promise.resolve();
    click(window, `[data-tech-detail-open="${staff.id}"]`);
    assert.equal(doc.querySelector('[data-staff-form] [name="phone"]').value, '909999999');
    click(window, '[data-staff-discard]');
    assert.equal(doc.querySelector('[data-staff-form] [name="phone"]').value, '909123456');
    click(window, '[data-staff-close]');
    assert.equal(window.localStorage.getItem('existing-pos-store'), 'keep-pos-data');
    click(window, '[name="staffMode"][value="invite"]');
    const invitationUrl = window.NEXORA_QR_WORKFLOWS.STAFF_INVITE_URL;
    assert.equal(doc.querySelector('[name="inviteConfirmed"]'), null);
    assert.equal(doc.querySelector('[data-staff-invite-qr]').dataset.qrValue, invitationUrl);
    assert.equal(doc.querySelector('.staff-invite-link').value, invitationUrl);
    assert.equal(doc.getElementById('nxw-entered-preview').hidden, true);
    const copied = [];
    Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: { writeText: async value => copied.push(value) } });
    click(window, '[data-staff-invite-action="copy"]');
    await new Promise(resolve => window.setTimeout(resolve, 0));
    assert.deepEqual(copied, [invitationUrl]);
    click(window, '[data-staff-invite-action="share"]');
    await new Promise(resolve => window.setTimeout(resolve, 0));
    assert.deepEqual(copied, [invitationUrl, invitationUrl]);
    assert.match(doc.querySelector('[data-staff-invite-status]').textContent, /Sharing is unavailable/);
    submit(window);
    assert.equal(doc.querySelector('[data-setup-step="2"]').dataset.completed, 'true');
    assert.equal(JSON.parse(window.localStorage.getItem(storageKey)).drafts.nail.staff.fields.staffInviteUrl, invitationUrl);
  } finally { dom.window.close(); }
});

test('QR preparation starts empty and saves after a destination is added', () => {
  const dom = loadPage('nexora-getting-started.html');
  try {
    const { window } = dom;
    click(window, '[data-setup-step="3"]');
    const name = window.document.querySelector('[data-qr-name]');
    name.value = 'Demo Studio';
    name.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(window.document.querySelectorAll('[data-qr-row]').length, 0);
    submit(window);
    assert.equal(window.document.getElementById('nxw-save-status').textContent, 'Choose at least one item to use.');
    assert.equal(window.document.querySelector('[data-setup-step="3"]').dataset.completed, 'false');
    const destination = window.document.querySelector('[data-qr-link-input]');
    destination.value = 'https://example.com';
    destination.dispatchEvent(new window.Event('input', { bubbles: true }));
    window.document.querySelector('[data-qr-link-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    submit(window);
    assert.equal(window.document.querySelector('[data-setup-step="3"]').dataset.completed, 'true');
    assert.equal(window.document.getElementById('nxw-entered-preview'), null);
    assert.equal(window.document.querySelector('[data-qr-add-module]'), null);
    assert.equal(window.document.querySelector('[data-qr-reset]'), null);
    const saved = JSON.parse(window.localStorage.getItem(window.NEXORA_WELCOME.storageKey)).drafts.nail.qr.fields;
    assert.equal(saved.qrName, 'Demo Studio');
    assert.equal(saved.qrModules.filter(item => item.enabled).length, 1);
  } finally { dom.window.close(); }
});

test('QR preparation preserves custom modules, icons, order, greeting, and the previous draft fields', () => {
  const storageKey = 'nexora.local-onboarding.v1';
  const dom = loadPage('nexora-getting-started.html', {
    [storageKey]: JSON.stringify({ industry: 'nail', drafts: { nail: { qr: { fields: { qrLabel: 'Old internal name', qrLocation: 'Front counter', qrCheckin: 'true', qrServices: 'false', qrBooking: 'true', qrReviews: 'false', qrTips: 'false', qrPayment: 'false' } } } } })
  });
  try {
    const { window } = dom;
    const doc = window.document;
    const enterQr = (selector, value) => { const input = doc.querySelector(selector); input.value = value; input.dispatchEvent(new window.Event('input', { bubbles: true })); };
    click(window, '[data-setup-step="3"]');
    assert.equal(doc.querySelector('[data-qr-name]').value, 'Old internal name');
    assert.deepEqual([...doc.querySelectorAll('[data-qr-row]')].map(row => row.dataset.qrRow), ['booking', 'checkin']);
    enterQr('[data-qr-welcome]', 'Welcome guest');
    enterQr('[data-qr-link-input]', 'javascript:alert(1)');
    doc.querySelector('[data-qr-link-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(doc.querySelectorAll('[data-qr-row]').length, 2);
    enterQr('[data-qr-link-input]', 'https://example.com');
    doc.querySelector('[data-qr-link-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    const custom = [...doc.querySelectorAll('[data-qr-row]')].find(row => row.dataset.qrRow.startsWith('custom-')).dataset.qrRow;
    enterQr(`[data-qr-row="${custom}"] [data-qr-module-title]`, 'Website');
    click(window, `[data-qr-row="${custom}"] [data-qr-action="up"]`);
    assert.equal(doc.querySelectorAll('[data-qr-row]')[1].dataset.qrRow, custom);
    click(window, `[data-qr-row="${custom}"] [data-qr-action="icon"]`);
    click(window, '[data-qr-icon="camera"]');
    assert.match(doc.querySelector(`[data-qr-row="${custom}"] .nxqr-module-icon img`).src, /oneqr-camera-3d\.png$/);
    submit(window);
    const saved = JSON.parse(window.localStorage.getItem(storageKey)).drafts.nail.qr.fields;
    assert.equal(saved.qrLocation, 'Front counter');
    assert.equal(saved.welcomeMessage, 'Welcome guest');
    assert.equal(saved.qrModules.find(item => item.id === custom).icon, 'camera');
    assert.equal(doc.getElementById('nxw-entered-preview'), null);
    click(window, `[data-qr-row="${custom}"] [data-qr-action="remove"]`);
    assert.equal(doc.querySelector(`[data-qr-row="${custom}"]`), null);
    assert.equal(doc.querySelectorAll('[data-qr-row]').length, 2);
    assert.equal(doc.querySelector('[data-qr-welcome]').value, 'Welcome guest');
    assert.equal(doc.querySelector('[data-setup-step="3"]').dataset.completed, 'false');
  } finally { dom.window.close(); }
});

test('Table QR reuses the industry picker while keeping the onboarding industry and custom modules', () => {
  const storageKey = 'nexora.local-onboarding.v1';
  const dom = loadPage('nexora-getting-started.html', {
    [storageKey]: JSON.stringify({ industry: 'restaurant', drafts: {} }),
    'taxiq:oneqr-config': 'existing-qr-settings'
  });
  try {
    const { window } = dom;
    const doc = window.document;
    const change = (selector, value) => { const input = doc.querySelector(selector); input.value = value; input.dispatchEvent(new window.Event('input', { bubbles: true })); };
    const moduleIds = () => [...doc.querySelectorAll('[data-qr-row]')].map(row => row.dataset.qrRow);
    click(window, '[data-setup-step="2"]');
    assert.deepEqual(moduleIds(), []);
    click(window, '[data-qr-change-industry]');
    click(window, '.industry-card[data-industry="restaurant"]');
    assert.deepEqual(moduleIds(), ['menu', 'order', 'reservation', 'directions', 'review']);
    change('[data-qr-name]', 'Table 01');
    change('[data-qr-welcome]', 'Welcome guest');
    change('[data-qr-link-input]', 'https://example.com');
    doc.querySelector('[data-qr-link-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    const customId = moduleIds().find(id => id.startsWith('custom-'));
    change(`[data-qr-row="${customId}"] [data-qr-module-title]`, 'Website');
    submit(window);
    assert.equal(doc.querySelector('[data-setup-step="2"]').dataset.completed, 'true');
    click(window, '[data-qr-change-industry]');
    assert.equal(doc.querySelector('.industry-card[data-industry="restaurant"]').getAttribute('aria-pressed'), 'true');
    click(window, '[data-group="pro"]');
    change('#industry-search-input', 'Law firm');
    assert.equal(doc.querySelectorAll('.industry-card').length, 1);
    click(window, '.industry-card[data-industry="legal"]');
    assert.equal(doc.querySelector('[data-qr-overlay]').hidden, true);
    assert.equal(doc.querySelector('.nxw-industry[aria-pressed="true"]').dataset.industry, 'restaurant');
    assert.equal(doc.querySelector('[data-setup-step="2"]').dataset.completed, 'false');
    assert.deepEqual(moduleIds(), ['consult', 'services', 'contact', 'directions', 'review', customId]);
    assert.equal(doc.querySelector('[data-qr-name]').value, 'Table 01');
    assert.equal(doc.querySelector('[data-qr-welcome]').value, 'Welcome guest');
    submit(window);
    assert.equal(doc.querySelector('[data-setup-step="2"]').dataset.completed, 'true');
    const saved = JSON.parse(window.localStorage.getItem(storageKey));
    assert.equal(saved.industry, 'restaurant');
    assert.equal(saved.drafts.restaurant.qr.fields.qrIndustryId, 'legal');
    assert.equal(saved.drafts.restaurant.qr.fields.qrModules.find(item => item.id === customId).title, 'Website');
    assert.equal(window.localStorage.getItem('taxiq:oneqr-config'), 'existing-qr-settings');
    assert.equal(window.sessionStorage.getItem('taxiq:oneqr-pending-industry'), null);
    click(window, '[data-setup-step="1"]');
    click(window, '[data-setup-step="2"]');
    assert.match(doc.querySelector('[data-qr-industry-label]').textContent, /Law firm/);
    assert.ok(moduleIds().includes(customId));
    assert.equal(doc.querySelector('[data-qr-reset]'), null);
    assert.equal(doc.getElementById('nxw-entered-preview'), null);
  } finally { dom.window.close(); }
});

test('Help search, product filter and keyboard tabs update the same local onboarding view', () => {
  const dom = loadPage('nexora-getting-started.html');
  try {
    const { window } = dom;
    click(window, '[data-onboard-tab="help"]');
    const search = window.document.getElementById('nxw-help-search');
    search.value = 'never-matches-any-po-feature';
    search.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.match(window.document.getElementById('nxw-help-list').textContent, /No matching feature/);
    search.value = '';
    search.dispatchEvent(new window.Event('input', { bubbles: true }));
    const filter = window.document.getElementById('nxw-help-filter');
    filter.value = 'aimarketing';
    filter.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(window.document.querySelectorAll('[data-help-entry]').length, 2);
    assert.match(window.document.querySelector('#nxw-help-detail a').href, /\/html\/pages\/nexora-sms-dashboard\.html$/);
    const tab = window.document.querySelector('[data-onboard-tab="help"]');
    tab.focus();
    tab.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert.equal(window.document.querySelector('[data-onboard-tab="products"]').getAttribute('aria-selected'), 'true');
    assert.equal(window.document.getElementById('nxw-panel-products').hidden, false);
  } finally { dom.window.close(); }
});

test('Every new page renders its own local content without PO frame or page links', () => {
  for (const filename of ['nexora-home.html', 'salon-home.html', 'nexora-getting-started.html']) {
    const dom = loadPage(filename);
    try {
      assert.equal(dom.window.document.documentElement.lang, 'en');
      assert.equal(dom.window.document.querySelectorAll('iframe').length, 0);
      for (const link of dom.window.document.querySelectorAll('a[href]')) {
        if (filename === 'salon-home.html' && link.classList.contains('salon-icon-credit')) {
          assert.equal(link.href, 'https://www.flaticon.com/authors/special/flat?author_id=1&type=standard');
          continue;
        }
        assert.equal(new URL(link.href).origin, 'http://localhost', `${filename}: ${link.href}`);
        assert.doesNotMatch(link.href, /from-po/);
      }
      assert.doesNotMatch(dom.window.document.querySelector('main').textContent, /undefined/);
    } finally { dom.window.close(); }
  }
});

test('Public Home keeps the PO three-group catalog distinct from the Salon showcases', () => {
  const dom = loadPage('nexora-home.html');
  try {
    const { document } = dom.window;
    assert.equal(document.querySelectorAll('.nxw-card').length, 12);
    const titles = [...document.querySelectorAll('.nxw-card-top strong')].map((node) => node.textContent);
    assert.ok(titles.includes('AI Voice SMS'));
    assert.ok(titles.includes('AI Marketing Tool'));
    assert.equal(titles.includes('SMS Campaign'), false);
    assert.match(document.getElementById('nxw-products').textContent, /Daily operations/);
    assert.match(document.getElementById('nxw-products').textContent, /Customer connection/);
    assert.match(document.getElementById('nxw-products').textContent, /Growth & creativity/);
  } finally { dom.window.close(); }
});
