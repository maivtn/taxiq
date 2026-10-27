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
    window.eval(asset('nexora-salon-home.js'));
  } else {
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

test('Onboarding requires real entries, preserves browser drafts, and keeps industries independent', () => {
  const sentinel = 'keep-existing-pos-data';
  const dom = loadPage('nexora-getting-started.html', { 'existing-pos-store': sentinel });
  let stored;
  try {
    const { window } = dom;
    submit(window);
    assert.match(window.document.getElementById('nxw-progress-label').textContent, /^0\/4/);
    enter(window, 'name', 'Demo Studio');
    enter(window, 'address', '123 Example Avenue');
    enter(window, 'phone', '(312) 555-0100');
    submit(window);
    assert.match(window.document.getElementById('nxw-progress-label').textContent, /^1\/4/);
    assert.equal(window.document.querySelector('[data-setup-step="0"]').dataset.completed, 'true');
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
  } finally { reopened.window.close(); }
});

test('QR preparation rejects an empty guest menu and saves once a tile is enabled', () => {
  const dom = loadPage('nexora-getting-started.html');
  try {
    const { window } = dom;
    click(window, '[data-setup-step="3"]');
    enter(window, 'qrLabel', 'Demo Studio');
    enter(window, 'qrLocation', 'Front counter');
    for (const input of window.document.querySelectorAll('#nxw-setup-form input[type="checkbox"]')) if (input.checked) input.click();
    submit(window);
    assert.equal(window.document.getElementById('nxw-save-status').textContent, 'Choose at least one item to use.');
    assert.equal(window.document.querySelector('[data-setup-step="3"]').dataset.completed, 'false');
    click(window, '[name="qrBooking"]');
    submit(window);
    assert.equal(window.document.querySelector('[data-setup-step="3"]').dataset.completed, 'true');
    assert.match(window.document.getElementById('nxw-entered-preview').textContent, /Book appointment/);
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
