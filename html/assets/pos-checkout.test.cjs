const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const runtime = fs.readFileSync(path.join(__dirname, 'pos-checkout.js'), 'utf8');

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

function runCheckout(record) {
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
    ['[data-checkout-add-service-select]', element()],
    ['[data-checkout-add-service-tech]', element()],
    ['[data-checkout-add-product-select]', element()],
    ['[data-checkout-add-product-price]', element()],
  ]);
  const document = {
    querySelector(selector) { return selectors.get(selector) || null; },
    querySelectorAll() { return []; },
    addEventListener() {},
  };
  const window = {
    location: { search: '?bookingId=booking-1' },
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
      loadAll() { return [record]; },
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

  return selectors;
}

test('checkout formats service prices and totals with comma thousand separators', () => {
  const selectors = runCheckout({
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
