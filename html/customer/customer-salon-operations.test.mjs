import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('./customer-salon-operations.html', import.meta.url), 'utf8');

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

function testApi(initial = {}) {
  const script = SOURCE.match(/<script id="operations-app-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'operations script must exist');
  const storage = createMemoryStorage(initial);
  let uuid = 0;
  const window = { localStorage: storage, NEXORA_OPS_SKIP_INIT: true };
  const context = vm.createContext({
    window, localStorage: storage, structuredClone, console, URL, Date,
    crypto: { randomUUID: () => `00000000-0000-4000-8000-${String(++uuid).padStart(12, '0')}` }
  });
  window.window = window;
  vm.runInContext(script, context);
  return { api: window.NEXORA_OPERATIONS_TEST_API, storage, context };
}

function createAuditStorage(initial = {}, { failSet = false, failGet = false } = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    peek(key) { return values.has(key) ? values.get(key) : null; },
    getItem(key) {
      calls.push({ method: 'getItem', key });
      if (failGet) throw new Error('storage unavailable');
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      calls.push({ method: 'setItem', key, value: String(value) });
      if (failSet) throw new Error('quota exceeded');
      values.set(key, String(value));
    },
    removeItem(key) {
      calls.push({ method: 'removeItem', key });
      values.delete(key);
    },
    clear() {
      calls.push({ method: 'clear' });
      values.clear();
    }
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function createStubNode({ id = '', screen = '', target = '' } = {}) {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  const node = {
    id,
    value: '',
    textContent: '',
    disabled: false,
    dataset: {},
    focusCount: 0,
    classList: {
      add(...names) { names.forEach((name) => classes.add(name)); },
      remove(...names) { names.forEach((name) => classes.delete(name)); },
      contains(name) { return classes.has(name); },
      toggle(name, force) {
        const next = force === undefined ? !classes.has(name) : Boolean(force);
        if (next) classes.add(name); else classes.delete(name);
        return next;
      }
    },
    addEventListener(type, handler) {
      const values = listeners.get(type) || [];
      values.push(handler);
      listeners.set(type, values);
    },
    dispatch(type) {
      for (const handler of listeners.get(type) || []) handler({ type, target: node });
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
    focus() { node.focusCount += 1; },
    closest(selector) {
      if (selector === '[data-ops-screen-target]' && node.dataset.opsScreenTarget) return node;
      return null;
    }
  };
  if (screen) node.dataset.opsScreen = screen;
  if (target) node.dataset.opsScreenTarget = target;
  return node;
}

function uiApi({ storage = createAuditStorage(), lucide } = {}) {
  const script = SOURCE.match(/<script id="operations-app-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'operations script must exist');
  const role = createStubNode({ id: 'ops-role' });
  const status = createStubNode({ id: 'ops-toast' });
  const copy = createStubNode({ id: 'ops-role-copy' });
  const screens = ['liveticket', 'staffnoteligible', 'addonapproval'].map((screen) => createStubNode({
    id: `ops-${screen}`, screen
  }));
  const screenButtons = ['liveticket', 'staffnoteligible', 'addonapproval'].map((target) => createStubNode({ target }));
  const byId = new Map([[role.id, role], [status.id, status], [copy.id, copy], ...screens.map((node) => [node.id, node])]);
  const documentListeners = new Map();
  const document = {
    getElementById(id) { return byId.get(id) || null; },
    querySelectorAll(selector) {
      if (selector === '[data-ops-screen]') return screens;
      if (selector === '[data-ops-screen-target]') return screenButtons;
      return [];
    },
    addEventListener(type, handler) {
      const values = documentListeners.get(type) || [];
      values.push(handler);
      documentListeners.set(type, values);
    },
    dispatchClick(target) {
      for (const handler of documentListeners.get('click') || []) handler({ target });
    }
  };
  const window = { localStorage: storage };
  if (lucide !== undefined) window.lucide = lucide;
  const context = vm.createContext({
    window, localStorage: storage, structuredClone, console, URL, Date, document,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' }
  });
  window.window = window;
  vm.runInContext(script, context);
  return { api: window.NEXORA_OPERATIONS_TEST_API, storage, document, role, status, copy, screens, screenButtons };
}

test('uses a separate operations key and never rewrites customer storage', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const customerJson = JSON.stringify({ schemaVersion: 2, profile: { id: 'cust-jessica' }, guestCheckins: [] });
  const { api, storage } = testApi({ [customerKey]: customerJson });
  const state = api.createOperationsState();
  api.saveOperationsState(state, storage);
  assert.equal(api.OPS_STORAGE_KEY, 'nexora.customer.crosssurface.v1');
  assert.equal(storage.getItem(customerKey), customerJson);
  assert.ok(storage.getItem(api.OPS_STORAGE_KEY));
});

test('sanitizes customer snapshot before companion use', () => {
  const { api } = testApi();
  const snapshot = api.readCustomerSnapshot(createMemoryStorage({
    'nexora.customer.prototype.v1': JSON.stringify({
      schemaVersion: 2,
      profile: { id: 'cust-amy', name: '<img>', phone: '8325550198' },
      guestCheckins: [{ id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny' }],
      secret: 'drop-me'
    })
  }));
  assert.equal(snapshot.profile.name, '<img>');
  assert.equal('secret' in snapshot, false);
});

test('storage operations target the exact owned key and never mutate the customer key', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const customerJson = '{"schemaVersion":2,"profile":{"id":"cust-amy"}}';
  const { api } = testApi();
  const storage = createAuditStorage({ [customerKey]: customerJson });

  api.saveOperationsState(api.createOperationsState(), storage);
  api.loadOperationsState(storage);
  api.readCustomerSnapshot(storage);

  const mutations = storage.calls.filter((call) => ['setItem', 'removeItem', 'clear'].includes(call.method));
  assert.equal(mutations.length, 1);
  assert.deepEqual(mutations.map(({ method, key }) => ({ method, key })), [
    { method: 'setItem', key: 'nexora.customer.crosssurface.v1' }
  ]);
  assert.equal(storage.peek(customerKey), customerJson);
});

test('save, load, and reload persist a normalized v1 operations state', () => {
  const { api } = testApi();
  const storage = createMemoryStorage();
  const state = api.createOperationsState();
  state.updatedAt = '2026-07-15T03:04:42.000Z';
  state.serviceTickets.push({ id: 'ticket-safe', label: 'Safe data', cents: 5500 });
  state.ui.role = 'Front Desk';
  state.ui.activeScreen = 'addonapproval';

  const saved = api.saveOperationsState(state, storage);
  const loaded = api.loadOperationsState(storage);
  const reloaded = testApi({ [api.OPS_STORAGE_KEY]: storage.getItem(api.OPS_STORAGE_KEY) }).api.getOperationsState();

  assert.equal(saved.schemaVersion, 1);
  assert.match(saved.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.deepEqual(plain(loaded), plain(saved));
  assert.deepEqual(plain(reloaded), plain(saved));
});

test('invalid JSON, storage failures, and wrong schemas fall back safely', () => {
  const { api } = testApi();
  for (const storage of [
    createMemoryStorage({ [api.OPS_STORAGE_KEY]: '{bad json' }),
    createMemoryStorage({ [api.OPS_STORAGE_KEY]: JSON.stringify({ schemaVersion: 99 }) }),
    createAuditStorage({}, { failGet: true })
  ]) {
    const state = api.loadOperationsState(storage);
    assert.equal(state.schemaVersion, 1);
    assert.deepEqual(plain(state.serviceTickets), []);
    assert.equal(state.ui.activeScreen, 'liveticket');
    assert.equal(state.ui.role, 'Customer');
    assert.match(state.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  }
});

test('normalization rejects invalid timestamps, arrays, screens, and roles deterministically', () => {
  const { api } = testApi();
  const normalized = api.normalizeOperationsState({
    schemaVersion: 1,
    updatedAt: '2026-07-15T03:04:42Z',
    serviceTickets: 'not-an-array',
    addOnRequests: null,
    staffEligibility: {},
    ui: { activeScreen: 'admin', role: 'Owner', selectedTicketId: 4, selectedStaffId: {} }
  });

  assert.match(normalized.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.notEqual(normalized.updatedAt, '2026-07-15T03:04:42Z');
  assert.deepEqual(plain(normalized.serviceTickets), []);
  assert.deepEqual(plain(normalized.addOnRequests), []);
  assert.deepEqual(plain(normalized.staffEligibility), []);
  assert.deepEqual(plain(normalized.ui), {
    activeScreen: 'liveticket', role: 'Customer', selectedTicketId: null, selectedStaffId: null
  });
});

test('structured arrays accept only safe own plain records and deep-clone them', () => {
  const { api } = testApi();
  const inherited = Object.create({ inherited: true });
  inherited.id = 'ticket-inherited';
  const dangerous = JSON.parse('{"id":"ticket-danger","nested":{"__proto__":{"polluted":true}}}');
  const safe = { id: 'ticket-safe', nested: { label: 'plain text' }, tags: ['a', 1, true, null] };
  const normalized = api.normalizeOperationsState({
    schemaVersion: 1,
    updatedAt: '2026-07-15T03:04:42.000Z',
    serviceTickets: [safe, inherited, new Date(), dangerous, { id: 'ticket-html', label: '<script>alert(1)</script>' }],
    addOnRequests: [{ id: 'addon-safe', amountCents: 1500 }, null, []],
    staffEligibility: [{ id: 'eligibility-safe', eligible: false }],
    ui: {}
  });

  assert.deepEqual(plain(normalized.serviceTickets), [safe]);
  assert.deepEqual(plain(normalized.addOnRequests), [{ id: 'addon-safe', amountCents: 1500 }]);
  assert.deepEqual(plain(normalized.staffEligibility), [{ id: 'eligibility-safe', eligible: false }]);
  normalized.serviceTickets[0].nested.label = 'changed';
  assert.equal(safe.nested.label, 'plain text');
  assert.equal({}.polluted, undefined);
});

test('save does not mutate caller input and returns the normalized state it persisted', () => {
  const { api } = testApi();
  const storage = createMemoryStorage();
  const input = {
    schemaVersion: 1,
    updatedAt: '2026-07-15T03:04:42.000Z',
    serviceTickets: [{ id: 'ticket-1', nested: { value: 1 } }],
    addOnRequests: [], staffEligibility: [],
    ui: { activeScreen: 'liveticket', role: 'Staff', selectedTicketId: 'ticket-1', selectedStaffId: null }
  };
  const before = JSON.stringify(input);

  const saved = api.saveOperationsState(input, storage);

  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(plain(saved), JSON.parse(storage.getItem(api.OPS_STORAGE_KEY)));
  saved.serviceTickets[0].nested.value = 2;
  assert.equal(input.serviceTickets[0].nested.value, 1);
});

test('customer bridge returns only allowlisted sanitized fields and never writes storage', () => {
  const { api } = testApi();
  const customerKey = api.CUSTOMER_STORAGE_KEY;
  const customerJson = JSON.stringify({
    schemaVersion: 2,
    profile: { id: 'cust-amy', name: '<img src=x onerror=alert(1)>', phone: '(832) 555-0198', paymentMethods: ['secret'] },
    businesses: {
      'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin <b>Nail</b> Bar', tipMultiplier: 10 }
    },
    guestCheckins: [{
      id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', name: '<svg onload=alert(1)>',
      phone: '832-555-0198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny',
      sourceQr: 'drop-me', pointsPending: 120
    }],
    session: { otpCode: '246810' }, ledger: [{ pointsDelta: 999 }], paymentProofs: [{ secret: true }]
  });
  const storage = createAuditStorage({ [customerKey]: customerJson });

  const snapshot = api.readCustomerSnapshot(storage);

  assert.deepEqual(Object.keys(snapshot).sort(), ['businesses', 'guestCheckins', 'profile']);
  assert.deepEqual(plain(snapshot.profile), { id: 'cust-amy', name: '<img src=x onerror=alert(1)>', phone: '8325550198' });
  assert.deepEqual(plain(snapshot.businesses), {
    'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin <b>Nail</b> Bar' }
  });
  assert.deepEqual(plain(snapshot.guestCheckins), [{
    id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', name: '<svg onload=alert(1)>',
    phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-jenny'
  }]);
  assert.equal(storage.peek(customerKey), customerJson);
  assert.deepEqual(storage.calls.filter((call) => call.method !== 'getItem'), []);
});

test('customer bridge rejects malformed IDs, relationships, fields, dangerous keys, and duplicate rows', () => {
  const { api } = testApi();
  const raw = JSON.parse(`{
    "schemaVersion": 2,
    "profile": { "id": " cust-amy ", "name": "Ambiguous", "phone": "123" },
    "businesses": {
      "bitcoin-nail-bar": { "id": "bitcoin-nail-bar", "name": "Bitcoin Nail Bar" },
      "bad key": { "id": "bad key", "name": "Bad" },
      "mismatch": { "id": "other", "name": "Mismatch" },
      "__proto__": { "id": "__proto__", "name": "Danger" }
    },
    "guestCheckins": [
      { "id": "guest-checkin-dup", "businessId": "bitcoin-nail-bar", "name": "One", "phone": "8325550198", "serviceKey": "deluxe-pedicure", "staffProfileId": null },
      { "id": "guest-checkin-dup", "businessId": "bitcoin-nail-bar", "name": "Two", "phone": "8325550198", "serviceKey": "deluxe-pedicure", "staffProfileId": null },
      { "id": " guest-checkin-space ", "businessId": "bitcoin-nail-bar", "serviceKey": "deluxe-pedicure", "staffProfileId": null },
      { "id": "guest-checkin-unknown", "businessId": "missing", "serviceKey": "deluxe-pedicure", "staffProfileId": null },
      { "id": "guest-checkin-service", "businessId": "bitcoin-nail-bar", "serviceKey": "Bad Service", "staffProfileId": null },
      { "id": "guest-checkin-staff", "businessId": "bitcoin-nail-bar", "serviceKey": "deluxe-pedicure", "staffProfileId": "unknown" },
      { "id": "guest-checkin-valid", "businessId": "bitcoin-nail-bar", "name": "Valid", "phone": "not-a-phone", "serviceKey": "deluxe-pedicure", "staffProfileId": null, "constructor": { "polluted": true } }
    ]
  }`);

  const snapshot = api.readCustomerSnapshot(createMemoryStorage({
    [api.CUSTOMER_STORAGE_KEY]: JSON.stringify(raw)
  }));

  assert.equal(snapshot.profile, null);
  assert.deepEqual(plain(snapshot.businesses), {
    'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' }
  });
  assert.deepEqual(plain(snapshot.guestCheckins), []);
  assert.equal({}.polluted, undefined);
});

test('commit applies and persists a successful mutation atomically', () => {
  const { api, storage } = testApi();
  const result = api.commitOperations((draft) => {
    draft.ui.role = 'Staff';
    draft.serviceTickets.push({ id: 'ticket-1', label: 'Safe' });
    return { ok: true, code: 'changed' };
  });

  assert.deepEqual(plain(result), { ok: true, code: 'changed' });
  assert.equal(api.getOperationsState().ui.role, 'Staff');
  assert.equal(JSON.parse(storage.getItem(api.OPS_STORAGE_KEY)).ui.role, 'Staff');
});

test('commit rolls back memory and storage when a mutator returns an error', () => {
  const { api, storage } = testApi();
  const beforeState = plain(api.getOperationsState());
  const beforeStorage = storage.getItem(api.OPS_STORAGE_KEY);

  const result = api.commitOperations((draft) => {
    draft.ui.role = 'Staff';
    return { ok: false, code: 'denied' };
  });

  assert.deepEqual(plain(result), { ok: false, code: 'denied' });
  assert.deepEqual(plain(api.getOperationsState()), beforeState);
  assert.equal(storage.getItem(api.OPS_STORAGE_KEY), beforeStorage);
});

test('commit rolls back memory and storage when a mutator throws', () => {
  const { api, storage } = testApi();
  const beforeState = plain(api.getOperationsState());
  const beforeStorage = storage.getItem(api.OPS_STORAGE_KEY);

  const result = api.commitOperations((draft) => {
    draft.ui.role = 'Front Desk';
    throw new Error('boom');
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'mutation_failed');
  assert.match(result.error.message, /boom/);
  assert.deepEqual(plain(api.getOperationsState()), beforeState);
  assert.equal(storage.getItem(api.OPS_STORAGE_KEY), beforeStorage);
});

test('commit rolls back memory and leaves storage unchanged on quota failure', () => {
  const { api } = testApi();
  const existing = JSON.stringify(api.createOperationsState());
  const storage = createAuditStorage({ [api.OPS_STORAGE_KEY]: existing }, { failSet: true });
  const beforeState = plain(api.getOperationsState());

  const result = api.commitOperations((draft) => {
    draft.ui.role = 'Staff';
    return { ok: true };
  }, storage);

  assert.equal(result.ok, false);
  assert.equal(result.code, 'persist_failed');
  assert.deepEqual(plain(api.getOperationsState()), beforeState);
  assert.equal(storage.peek(api.OPS_STORAGE_KEY), existing);
  assert.equal(storage.calls.some((call) => call.key === api.CUSTOMER_STORAGE_KEY && call.method !== 'getItem'), false);
});

test('separate operations instances keep independent state and isolated keys', () => {
  const first = testApi();
  const second = testApi();

  first.api.commitOperations((draft) => { draft.ui.role = 'Front Desk'; return { ok: true }; });
  second.api.commitOperations((draft) => { draft.ui.role = 'Staff'; return { ok: true }; });

  assert.equal(first.api.getOperationsState().ui.role, 'Front Desk');
  assert.equal(second.api.getOperationsState().ui.role, 'Staff');
  assert.equal(JSON.parse(first.storage.getItem(first.api.OPS_STORAGE_KEY)).ui.role, 'Front Desk');
  assert.equal(JSON.parse(second.storage.getItem(second.api.OPS_STORAGE_KEY)).ui.role, 'Staff');
});

test('UUID helper accepts only canonical UUID v4 values', () => {
  const { api, context } = testApi();
  assert.equal(api.opsId('ticket').ok, true);
  context.crypto.randomUUID = () => '00000000-0000-1000-8000-000000000001';
  assert.equal(api.opsId('ticket').code, 'id_failed');
  context.crypto.randomUUID = () => '00000000-0000-4000-7000-000000000001';
  assert.equal(api.opsId('ticket').code, 'id_failed');
  context.crypto.randomUUID = () => 'not-a-uuid';
  assert.equal(api.opsId('ticket').code, 'id_failed');
});

test('standalone shell uses mobile viewport, browser CDNs, and no build dependency', () => {
  assert.match(SOURCE, /<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">/);
  assert.match(SOURCE, /https:\/\/cdn\.jsdelivr\.net\/npm\/@tailwindcss\/browser@4/);
  assert.match(SOURCE, /https:\/\/unpkg\.com\/lucide@0\.468\.0\/dist\/umd\/lucide\.min\.js/);
  assert.match(SOURCE, /class="[^"]*max-w-5xl/);
  assert.doesNotMatch(SOURCE, /type="module"|node_modules|require\(|import\s+.*\s+from/);
  assert.doesNotMatch(SOURCE, /onclick\s*=|javascript:/i);
});

test('shell renders useful cards for all three screens with accessible controls', () => {
  for (const screen of ['liveticket', 'staffnoteligible', 'addonapproval']) {
    const section = SOURCE.match(new RegExp(`<section id="ops-${screen}"[\\s\\S]*?<\\/section>`))?.[0];
    assert.ok(section, `missing ${screen} section`);
    assert.match(section, /ops-card/);
    assert.match(section, /<h2/);
  }
  assert.match(SOURCE, /Vai trò \/ Role/);
  assert.match(SOURCE, /aria-label="Chọn vai trò vận hành \/ Select operations role"/);
  assert.match(SOURCE, /role="tablist"/);
  assert.equal((SOURCE.match(/data-ops-screen-target=/g) || []).length, 3);
  assert.match(SOURCE, /id="ops-toast"[^>]*role="status"[^>]*aria-live="polite"/);
});

test('role and screen controls persist operations state with hidden, aria, and focus sync', () => {
  const harness = uiApi();
  harness.role.value = 'Staff';
  harness.role.dispatch('change');

  assert.equal(harness.api.getOperationsState().ui.role, 'Staff');
  assert.match(harness.copy.textContent, /Staff/);
  assert.match(harness.status.textContent, /Staff/);

  harness.document.dispatchClick(harness.screenButtons[2]);
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'addonapproval');
  assert.equal(harness.screens[0].classList.contains('hidden'), true);
  assert.equal(harness.screens[0].getAttribute('aria-hidden'), 'true');
  assert.equal(harness.screens[2].classList.contains('hidden'), false);
  assert.equal(harness.screens[2].getAttribute('aria-hidden'), 'false');
  assert.equal(harness.screenButtons[2].getAttribute('aria-selected'), 'true');
  assert.equal(harness.screens[2].focusCount, 1);
  assert.equal(JSON.parse(harness.storage.peek(harness.api.OPS_STORAGE_KEY)).ui.activeScreen, 'addonapproval');
});

test('role persistence failure restores the select and state with an accessible status', () => {
  const storage = createAuditStorage({}, { failSet: true });
  const harness = uiApi({ storage });
  harness.role.value = 'Front Desk';

  harness.role.dispatch('change');

  assert.equal(harness.role.value, 'Customer');
  assert.equal(harness.api.getOperationsState().ui.role, 'Customer');
  assert.equal(storage.peek(harness.api.OPS_STORAGE_KEY), null);
  assert.match(harness.status.textContent, /không thể lưu|not saved/i);
  assert.equal(storage.calls.some((call) => call.key === harness.api.CUSTOMER_STORAGE_KEY && call.method !== 'getItem'), false);
});

test('initialization tolerates missing Lucide and unavailable storage', () => {
  const storage = createAuditStorage({}, { failGet: true });
  const harness = uiApi({ storage });
  assert.equal(harness.role.value, 'Customer');
  assert.equal(harness.screens[0].classList.contains('hidden'), false);
  assert.equal(harness.screens[1].classList.contains('hidden'), true);
});
