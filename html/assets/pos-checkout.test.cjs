const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const runtime = fs.readFileSync(path.join(__dirname, 'pos-checkout.js'), 'utf8');
const page = fs.readFileSync(path.join(__dirname, '../pages/pos-checkout.html'), 'utf8');

function element(overrides) {
  const classes = new Set();
  return Object.assign({
    hidden: false,
    textContent: '',
    innerHTML: '',
    value: '',
    disabled: false,
    dataset: {},
    style: {},
    className: '',
    classList: {
      add(name) { classes.add(name); },
      contains(name) { return classes.has(name); },
      remove(name) { classes.delete(name); },
      toggle(name, force) {
        const enabled = force === undefined ? !classes.has(name) : Boolean(force);
        if (enabled) classes.add(name);
        else classes.delete(name);
      }
    },
    setAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
  }, overrides || {});
}

function runCheckout(record, options) {
  options = options || {};
  const storage = new Map(options.sessionEntries || []);
  const listeners = {};
  const selectors = new Map([
    ['[data-checkout-root]', element()],
    ['[data-checkout-empty]', element()],
    ['[data-checkout-meta]', element()],
    ['[data-checkout-customer-badge]', element()],
    ['[data-checkout-status-badge]', element()],
    ['[data-checkout-lines]', element()],
    ['[data-checkout-tip-tech]', element()],
    ['[data-checkout-tip-amount]', element()],
    ['[data-checkout-pay-methods]', element()],
    ['[data-checkout-subtotal]', element()],
    ['[data-checkout-tip-total]', element()],
    ['[data-checkout-discount-row]', element()],
    ['[data-checkout-discount-amount]', element()],
    ['[data-checkout-method-label]', element()],
    ['[data-checkout-total]', element()],
    ['[data-checkout-charge]', element()],
    ['[data-checkout-split]', element({ hidden: true })],
    ['[data-checkout-split-status]', element()],
    ['[data-checkout-add-service-select]', element()],
    ['[data-checkout-add-service-tech]', element()],
    ['[data-checkout-add-product-select]', element()],
    ['[data-checkout-add-product-price]', element()],
  ]);
  const document = {
    querySelector(selector) { return selectors.get(selector) || null; },
    querySelectorAll() { return []; },
    addEventListener(type, handler) { listeners[type] = handler; },
  };
  const window = {
    location: { search: options.search || '?bookingId=booking-1' },
    sessionStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
    NEXORA_SALON_DATA: {
      loadCatalog() {
        return {
          services: [{ id: 'svc-deluxe', name: 'Deluxe package', price: 1234.56, active: true }],
          technicians: [{ name: 'Lan T.', active: true }],
        };
      },
      findService(catalog, id) {
        return (catalog.services || []).find((service) => service.id === id) || null;
      },
    },
    NEXORA_APPOINTMENTS_STORE: {
      loadAll() { return record ? [record] : []; },
      update(id, patch) { return { ok: true, record: Object.assign({}, record, patch) }; },
    },
  };

  vm.runInNewContext(runtime, {
    window,
    document,
    URLSearchParams,
    Date,
    Number,
    Object,
    String,
    Array,
  });

  return { selectors, storage, listeners };
}

function eventTarget(selector, node) {
  return Object.assign({
    closest(candidate) { return candidate === selector ? this : null; },
    matches(candidate) { return candidate === selector; },
  }, node || {});
}

test('checkout formats service prices and totals with comma thousand separators', () => {
  const { selectors } = runCheckout({
    id: 'booking-1',
    customerName: 'Sarah Lee',
    technicianName: 'Lan T.',
    startAt: '2026-08-04T10:00:00',
    serviceDetails: [{ name: 'Deluxe package', price: 1234.56, technicianName: 'Lan T.' }],
    metadata: {},
  });

  assert.match(selectors.get('[data-checkout-lines]').innerHTML, /\$1,234\.56/);
  assert.equal(selectors.get('[data-checkout-subtotal]').textContent, '$1,234.56');
  assert.equal(selectors.get('[data-checkout-tip-total]').textContent, '$15.00');
  assert.equal(selectors.get('[data-checkout-total]').textContent, '$1,249.56');
  assert.equal(selectors.get('[data-checkout-charge]').textContent, 'Charge $1,249.56');
  assert.match(selectors.get('[data-checkout-add-service-select]').innerHTML, /Deluxe package — \$1,234\.56/);
});

test('checkout opens Queue order snapshots from orderId links', () => {
  const snapshot = {
    id: 'queue-walkin-9',
    orderId: 'walkin-9',
    customerName: 'Lisa Truong',
    phone: '(281) 903-5517',
    startAt: '2026-08-12T13:32:00',
    technicianName: 'Kim',
    serviceDetails: [
      { name: 'Acrylic — Full Set', price: 70, technicianName: 'Kim' },
    ],
    metadata: { queueCheckout: true },
  };
  const { selectors } = runCheckout(null, {
    search: '?orderId=walkin-9&source=queue',
    sessionEntries: [['nexora:queue-checkout:v1:walkin-9', JSON.stringify(snapshot)]],
  });

  assert.equal(selectors.get('[data-checkout-root]').hidden, false);
  assert.equal(selectors.get('[data-checkout-empty]').hidden, true);
  assert.match(selectors.get('[data-checkout-meta]').textContent, /Lisa Truong/);
  assert.match(selectors.get('[data-checkout-lines]').innerHTML, /Acrylic — Full Set/);
  assert.match(selectors.get('[data-checkout-lines]').innerHTML, /Kim/);
  assert.equal(selectors.get('[data-checkout-subtotal]').textContent, '$70.00');
  assert.equal(selectors.get('[data-checkout-total]').textContent, '$85.00');
});

test('checkout page reserves a split payment detail area in the Payment method section', () => {
  assert.match(page, /<div class="checkout-split-payment" data-checkout-split hidden>/);
  assert.match(page, /data-checkout-split-status/);
});

test('Split pay renders two payment types and keeps their amounts equal to the checkout total', () => {
  const { selectors, listeners } = runCheckout({
    id: 'booking-1',
    customerName: 'Sarah Lee',
    technicianName: 'Lan T.',
    startAt: '2026-08-04T10:00:00',
    serviceDetails: [{ name: 'Deluxe package', price: 70, technicianName: 'Lan T.' }],
    metadata: {},
  });

  listeners.click({
    target: eventTarget('[data-checkout-pay]', { dataset: { checkoutPay: 'Split pay' } }),
  });

  const split = selectors.get('[data-checkout-split]');
  assert.equal(split.hidden, false);
  assert.match(split.innerHTML, /data-checkout-split-method="0"[\s\S]*<option value="Card" selected>Card<\/option>/);
  assert.match(split.innerHTML, /data-checkout-split-method="1"[\s\S]*<option value="Cash" selected>Cash<\/option>/);
  assert.match(split.innerHTML, /data-checkout-split-amount="0"[\s\S]*value="42\.50"/);
  assert.match(split.innerHTML, /data-checkout-split-amount="1"[\s\S]*value="42\.50"/);
  assert.equal(selectors.get('[data-checkout-method-label]').textContent, 'Split pay · Card $42.50 + Cash $42.50');

  listeners.change({
    target: eventTarget('[data-checkout-split-amount]', {
      dataset: { checkoutSplitAmount: '0' },
      value: '30',
    }),
  });
  assert.match(split.innerHTML, /data-checkout-split-amount="0"[\s\S]*value="30\.00"/);
  assert.match(split.innerHTML, /data-checkout-split-amount="1"[\s\S]*value="55\.00"/);
  assert.equal(selectors.get('[data-checkout-method-label]').textContent, 'Split pay · Card $30.00 + Cash $55.00');

  listeners.change({
    target: eventTarget('[data-checkout-split-method]', {
      dataset: { checkoutSplitMethod: '1' },
      value: 'Gift Card',
    }),
  });
  assert.equal(selectors.get('[data-checkout-method-label]').textContent, 'Split pay · Card $30.00 + Gift Card $55.00');
});
