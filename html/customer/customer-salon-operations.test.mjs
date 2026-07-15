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

function testApi(initial = {}, {
  randomUUID = (() => {
    let uuid = 0;
    return () => `00000000-0000-4000-8000-${String(++uuid).padStart(12, '0')}`;
  })()
} = {}) {
  const script = SOURCE.match(/<script id="operations-app-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'operations script must exist');
  const storage = createMemoryStorage(initial);
  const window = { localStorage: storage, NEXORA_OPS_SKIP_INIT: true };
  const context = vm.createContext({
    window, localStorage: storage, structuredClone, console, URL, Date,
    crypto: { randomUUID }
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

function createWriteThenThrowOnceStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  let shouldThrow = true;
  return {
    peek(key) { return values.has(key) ? values.get(key) : null; },
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) {
      values.set(key, String(value));
      if (shouldThrow) {
        shouldThrow = false;
        throw new Error('write completed before failure');
      }
    },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function guestCheckin(overrides = {}) {
  return {
    id: 'guest-checkin-1',
    businessId: 'bitcoin-nail-bar',
    name: 'Amy Nguyen',
    phone: '8325550198',
    serviceKey: 'deluxe-pedicure',
    staffProfileId: 'staff-jenny',
    ...overrides
  };
}

function seedServiceTicket(api, overrides = {}, now = 1000) {
  const state = api.createOperationsState();
  const created = api.createServiceTicket(state, guestCheckin(overrides), now);
  assert.equal(created.ok, true);
  return { state, ticket: created.ticket };
}

function seedTicketWithCustomer(api, { phone = '8325550198' } = {}) {
  const { state, ticket } = seedServiceTicket(api);
  return {
    state,
    ticket,
    customerSnapshot: {
      profile: { id: 'cust-amy', name: 'Amy Nguyen', phone },
      businesses: { 'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' } },
      guestCheckins: [{
        id: ticket.guestCheckinId, businessId: ticket.businessId, name: 'Amy Nguyen', phone,
        serviceKey: ticket.serviceKey, staffProfileId: ticket.staffProfileId
      }]
    }
  };
}

function createStubNode({ id = '', screen = '', target = '', action = '', actionTarget = '' } = {}) {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  const node = {
    id,
    value: '',
    textContent: '',
    className: '',
    children: [],
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
    dispatch(type, init = {}) {
      const event = {
        type,
        target: node,
        defaultPrevented: false,
        preventDefault() { event.defaultPrevented = true; },
        ...init
      };
      for (const handler of listeners.get(type) || []) handler(event);
      return event;
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    removeAttribute(name) { attributes.delete(name); },
    getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
    append(...items) { node.children.push(...items); },
    replaceChildren(...items) { node.children = [...items]; },
    focus() {
      node.focusCount += 1;
      node.onFocus?.();
    },
    closest(selector) {
      if (selector === '[data-ops-screen-target]' && node.dataset.opsScreenTarget) return node;
      if (selector === '[data-ops-action]' && node.dataset.opsAction) return node;
      return null;
    }
  };
  if (screen) node.dataset.opsScreen = screen;
  if (target) node.dataset.opsScreenTarget = target;
  if (action) node.dataset.opsAction = action;
  if (actionTarget) node.dataset.target = actionTarget;
  return node;
}

function uiApi({
  storage = createAuditStorage(),
  lucide,
  href = 'https://example.test/customer/customer-salon-operations.html',
  prefillStale = false,
  throwLocationAccessor = false
} = {}) {
  const script = SOURCE.match(/<script id="operations-app-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'operations script must exist');
  const role = createStubNode({ id: 'ops-role' });
  const status = createStubNode({ id: 'ops-toast' });
  const copy = createStubNode({ id: 'ops-role-copy' });
  const screens = ['liveticket', 'staffnoteligible', 'addonapproval'].map((screen) => createStubNode({
    id: `ops-${screen}`, screen
  }));
  const screenButtons = ['liveticket', 'staffnoteligible', 'addonapproval'].map((target) => createStubNode({ target }));
  const dynamicIds = [
    'ops-entry-error', 'ops-ticket-empty', 'ops-ticket-content', 'ops-ticket-number',
    'ops-ticket-status', 'ops-ticket-business', 'ops-ticket-items', 'ops-ticket-total',
    'ops-ticket-staff', 'ops-eligibility-warning', 'ops-requested-staff',
    'ops-requested-service', 'ops-recommended-staff', 'ops-choose-staff',
    'ops-addon-staff', 'ops-addon-label', 'ops-addon-amount', 'ops-addon-current',
    'ops-addon-new', 'ops-addon-phone', 'ops-addon-error', 'ops-addon-confirm'
  ];
  const dynamicNodes = dynamicIds.map((id) => createStubNode({ id }));
  const actionButtons = {
    review: createStubNode({ action: 'review-staff-eligibility' }),
    ticket: createStubNode({ action: 'open-ticket-tab', actionTarget: 'liveticket' }),
    pay: createStubNode({ action: 'open-ticket-tab', actionTarget: 'pay' }),
    reviewTab: createStubNode({ action: 'open-ticket-tab', actionTarget: 'review' }),
    reward: createStubNode({ action: 'open-ticket-tab', actionTarget: 'reward' }),
    call: createStubNode({ action: 'call-tech' }),
    message: createStubNode({ action: 'message-tech' }),
    choose: dynamicNodes.find((node) => node.id === 'ops-choose-staff'),
    frontDesk: createStubNode({ action: 'ask-front-desk' }),
    openAddon: createStubNode({ action: 'open-addon' }),
    acceptAddon: createStubNode({ action: 'accept-addon' }),
    declineAddon: createStubNode({ action: 'decline-addon' }),
    confirmAddon: dynamicNodes.find((node) => node.id === 'ops-addon-confirm')
  };
  actionButtons.choose.dataset.opsAction = 'choose-recommended-staff';
  actionButtons.confirmAddon.dataset.opsAction = 'confirm-addon-phone';
  const byId = new Map([
    [role.id, role], [status.id, status], [copy.id, copy],
    ...screens.map((node) => [node.id, node]), ...dynamicNodes.map((node) => [node.id, node])
  ]);
  if (prefillStale) {
    for (const id of ['ops-ticket-number', 'ops-ticket-status', 'ops-ticket-business', 'ops-ticket-total',
      'ops-ticket-staff', 'ops-eligibility-warning', 'ops-requested-staff', 'ops-requested-service']) {
      byId.get(id).textContent = 'STALE';
    }
    byId.get('ops-ticket-items').children = [createStubNode({ id: 'stale-ticket-row' })];
    byId.get('ops-recommended-staff').children = [createStubNode({ id: 'stale-staff-card' })];
  }
  const documentListeners = new Map();
  const document = {
    activeElement: null,
    getElementById(id) { return byId.get(id) || null; },
    createElement() { return createStubNode(); },
    querySelectorAll(selector) {
      if (selector === '[data-ops-screen]') return screens;
      if (selector === '[data-ops-screen-target]') return screenButtons;
      if (selector === '[data-ops-action]') {
        return [
          ...Object.values(actionButtons),
          ...byId.get('ops-recommended-staff').children.filter((node) => node.dataset.opsAction)
        ];
      }
      return [];
    },
    addEventListener(type, handler) {
      const values = documentListeners.get(type) || [];
      values.push(handler);
      documentListeners.set(type, values);
    },
    dispatchClick(target) {
      for (const handler of documentListeners.get('click') || []) handler({ target });
    },
    dispatchKeydown(target, key) {
      const event = {
        target,
        key,
        defaultPrevented: false,
        preventDefault() { event.defaultPrevented = true; }
      };
      for (const handler of documentListeners.get('keydown') || []) handler(event);
      return event;
    }
  };
  for (const node of [...screens, ...screenButtons, role]) {
    node.onFocus = () => { document.activeElement = node; };
  }
  const window = { localStorage: storage };
  if (throwLocationAccessor) {
    Object.defineProperty(window, 'location', {
      configurable: true,
      get() { throw new Error('location blocked'); }
    });
  } else {
    window.location = { href };
  }
  if (lucide !== undefined) window.lucide = lucide;
  const context = vm.createContext({
    window, localStorage: storage, structuredClone, console, URL, Date, document,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' }
  });
  window.window = window;
  vm.runInContext(script, context);
  return {
    api: window.NEXORA_OPERATIONS_TEST_API, storage, document, role, status, copy,
    screens, screenButtons, byId, actionButtons, window
  };
}

function customerStorageJson(guestCheckins, businesses = {
  'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' },
  'golden-glow-spa': { id: 'golden-glow-spa', name: 'Golden Glow Spa' },
  'moon-coffee': { id: 'moon-coffee', name: 'Moon Coffee' }
}) {
  return JSON.stringify({
    schemaVersion: 2,
    profile: { id: 'cust-amy', name: 'Amy Nguyen', phone: '8325550198' },
    businesses,
    guestCheckins
  });
}

function persistedOperationsBytes({
  guest = guestCheckin({ id: 'guest-checkin-old', serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' }),
  activeScreen = 'liveticket',
  withEligibility = false
} = {}) {
  const { api } = testApi();
  const state = api.createOperationsState();
  const created = api.createServiceTicket(state, guest, 1000);
  assert.equal(created.ok, true);
  if (withEligibility) {
    assert.equal(api.evaluateStaffEligibility(state, created.ticket.id, guest.serviceKey, guest.staffProfileId).ok, true);
  }
  state.ui.activeScreen = activeScreen;
  return JSON.stringify(state);
}

function throwingLocalStorageApi() {
  const script = SOURCE.match(/<script id="operations-app-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'operations script must exist');
  const window = { NEXORA_OPS_SKIP_INIT: true };
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() { throw new Error('localStorage blocked'); }
  });
  const context = vm.createContext({
    window, structuredClone, console, URL, Date,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' }
  });
  window.window = window;
  vm.runInContext(script, context);
  return { api: window.NEXORA_OPERATIONS_TEST_API, context };
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

test('strict domain normalization drops ambiguous tickets while preserving safe add-on records', () => {
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

  assert.deepEqual(plain(normalized.serviceTickets), []);
  assert.deepEqual(plain(normalized.addOnRequests), []);
  assert.deepEqual(plain(normalized.staffEligibility), []);
  assert.equal({}.polluted, undefined);
});

test('save does not mutate caller input and returns the normalized state it persisted', () => {
  const { api } = testApi();
  const storage = createMemoryStorage();
  const { state: input } = seedServiceTicket(api);
  input.updatedAt = '2026-07-15T03:04:42.000Z';
  input.ui.role = 'Staff';
  const before = JSON.stringify(input);

  const saved = api.saveOperationsState(input, storage);

  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(plain(saved), JSON.parse(storage.getItem(api.OPS_STORAGE_KEY)));
  saved.serviceTickets[0].lineItems[0].label = 'changed';
  assert.equal(input.serviceTickets[0].lineItems[0].label, 'Deluxe Pedicure');
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

test('customer bridge never satisfies guest ownership through inherited or reserved business keys', () => {
  const { api } = testApi();
  const customerJson = `{
    "schemaVersion": 2,
    "businesses": {
      "bitcoin-nail-bar": { "id": "bitcoin-nail-bar", "name": "Bitcoin Nail Bar" },
      "constructor": { "id": "constructor", "name": "Reserved" },
      "toString": { "id": "toString", "name": "Inherited" },
      "__proto__": { "id": "__proto__", "name": "Prototype" }
    },
    "guestCheckins": [
      { "id": "guest-checkin-constructor", "businessId": "constructor", "serviceKey": "deluxe-pedicure", "staffProfileId": null },
      { "id": "guest-checkin-tostring", "businessId": "toString", "serviceKey": "deluxe-pedicure", "staffProfileId": null },
      { "id": "guest-checkin-prototype", "businessId": "__proto__", "serviceKey": "deluxe-pedicure", "staffProfileId": null },
      { "id": "guest-checkin-orphan", "businessId": "valueOf", "serviceKey": "deluxe-pedicure", "staffProfileId": null }
    ]
  }`;
  const storage = createAuditStorage({ [api.CUSTOMER_STORAGE_KEY]: customerJson });

  const snapshot = api.readCustomerSnapshot(storage);

  assert.deepEqual(plain(snapshot.businesses), {
    'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' }
  });
  assert.deepEqual(plain(snapshot.guestCheckins), []);
  assert.deepEqual(storage.calls.filter((call) => call.method !== 'getItem'), []);
  assert.equal(storage.peek(api.CUSTOMER_STORAGE_KEY), customerJson);
});

test('commit applies and persists a successful canonical mutation atomically', () => {
  const { api, storage } = testApi();
  const result = api.commitOperations((draft) => {
    draft.ui.role = 'Staff';
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

test('write-then-throw storage restores exact existing bytes and removes newly-created keys', () => {
  const { api } = testApi();
  const existingBytes = ' { "schemaVersion": 1, "sentinel": true }\n';

  for (const initialBytes of [existingBytes, null]) {
    const initial = initialBytes === null ? {} : { [api.OPS_STORAGE_KEY]: initialBytes };
    const saveStorage = createWriteThenThrowOnceStorage(initial);
    assert.throws(
      () => api.saveOperationsState(api.createOperationsState(), saveStorage),
      (error) => error?.code === 'persist_failed'
    );
    assert.equal(saveStorage.peek(api.OPS_STORAGE_KEY), initialBytes);

    const commitStorage = createWriteThenThrowOnceStorage(initial);
    const beforeState = plain(api.getOperationsState());
    const result = api.commitOperations((draft) => {
      draft.ui.role = 'Staff';
      return { ok: true };
    }, commitStorage);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'persist_failed');
    assert.equal(commitStorage.peek(api.OPS_STORAGE_KEY), initialBytes);
    assert.deepEqual(plain(api.getOperationsState()), beforeState);
  }
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

test('creates one canonical live ticket per exact guest check-in with integer cents', () => {
  const { api } = testApi();
  const state = api.createOperationsState();
  const guest = guestCheckin();

  const first = api.createServiceTicket(state, guest, 1000);
  const afterFirst = JSON.stringify(state);
  const replay = api.createServiceTicket(state, guest, Number.NaN);

  assert.equal(first.ok, true);
  assert.equal(first.ticket.guestCheckinId, guest.id);
  assert.equal(first.ticket.number, 104);
  assert.equal(first.ticket.status, 'in_service');
  assert.equal(first.ticket.currentTotalCents, 4950);
  assert.deepEqual(plain(first.ticket.lineItems).map(({ type, amountCents }) => ({ type, amountCents })), [
    { type: 'service', amountCents: 5500 },
    { type: 'discount', amountCents: -550 }
  ]);
  assert.equal(replay.ok, true);
  assert.equal(replay.idempotent, true);
  assert.equal(replay.ticket.id, first.ticket.id);
  assert.equal(JSON.stringify(state), afterFirst);
});

test('uses the authoritative multi-business service catalog without mixing promos', () => {
  const cases = [
    ['bitcoin-nail-bar', 'acrylic-full-set', 6500],
    ['golden-glow-spa', 'signature-facial', 7500],
    ['moon-coffee', 'signature-drink', 800]
  ];
  for (const [businessId, serviceKey, total] of cases) {
    const { api } = testApi();
    const state = api.createOperationsState();
    const result = api.createServiceTicket(state, guestCheckin({
      id: `guest-checkin-${businessId}`,
      businessId,
      serviceKey,
      staffProfileId: null
    }), 1000);
    assert.equal(result.ok, true);
    assert.equal(result.ticket.businessId, businessId);
    assert.equal(result.ticket.serviceKey, serviceKey);
    assert.equal(result.ticket.lineItems.length, 1);
    assert.equal(result.ticket.currentTotalCents, total);
  }
});

test('rejects invalid guest, cross-business service, and cross-business staff before ID generation', () => {
  const { api, context } = testApi();
  const state = api.createOperationsState();
  let uuidCalls = 0;
  context.crypto.randomUUID = () => {
    uuidCalls += 1;
    return '00000000-0000-4000-8000-000000000099';
  };
  for (const guest of [
    guestCheckin({ id: ' guest-checkin-1 ' }),
    guestCheckin({ businessId: 'unknown-business' }),
    guestCheckin({ businessId: 'golden-glow-spa', serviceKey: 'deluxe-pedicure', staffProfileId: null }),
    guestCheckin({ businessId: 'golden-glow-spa', serviceKey: 'signature-facial', staffProfileId: 'staff-jenny' }),
    guestCheckin({ staffProfileId: 'staff-unknown' })
  ]) {
    const before = JSON.stringify(state);
    assert.equal(api.createServiceTicket(state, guest, 1000).ok, false);
    assert.equal(JSON.stringify(state), before);
  }
  assert.equal(uuidCalls, 0);
});

test('fails closed on malformed or semantically duplicate ticket persistence before mutation', () => {
  for (const tamper of [
    (state) => state.serviceTickets.push(structuredClone(state.serviceTickets[0])),
    (state) => { state.serviceTickets[0].lineItems.push(structuredClone(state.serviceTickets[0].lineItems[0])); },
    (state) => { state.serviceTickets[0].number = '104'; },
    (state) => {
      const copy = structuredClone(state.serviceTickets[0]);
      copy.id = 'ticket-00000000-0000-4000-8000-000000000099';
      copy.guestCheckinId = 'guest-checkin-other';
      state.serviceTickets.push(copy);
    }
  ]) {
    const { api, context } = testApi();
    const { state } = seedServiceTicket(api);
    tamper(state);
    let uuidCalls = 0;
    context.crypto.randomUUID = () => {
      uuidCalls += 1;
      return '00000000-0000-4000-8000-000000000100';
    };
    const before = JSON.stringify(state);
    const result = api.createServiceTicket(state, guestCheckin({ id: 'guest-checkin-2' }), 2000);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'invalid_state');
    assert.equal(JSON.stringify(state), before);
    assert.equal(uuidCalls, 0);
  }
});

test('keeps ticket IDs, timestamps, and numbers collision-safe', () => {
  const { api, context } = testApi();
  const { state, ticket } = seedServiceTicket(api);
  const beforeCollision = JSON.stringify(state);
  context.crypto.randomUUID = () => ticket.id.slice('ticket-'.length);
  const collision = api.createServiceTicket(state, guestCheckin({ id: 'guest-checkin-2' }), 2000);
  assert.equal(collision.code, 'id_collision');
  assert.equal(JSON.stringify(state), beforeCollision);

  context.crypto.randomUUID = () => '00000000-0000-4000-8000-000000000099';
  const invalidTime = api.createServiceTicket(state, guestCheckin({ id: 'guest-checkin-2' }), Infinity);
  assert.equal(invalidTime.code, 'invalid_time');
  assert.equal(JSON.stringify(state), beforeCollision);

  const created = api.createServiceTicket(state, guestCheckin({ id: 'guest-checkin-2' }), 2000);
  assert.equal(created.ok, true);
  assert.equal(created.ticket.number, 105);
});

test('strict migration rejects whole ambiguous ticket collections and reconciles dependent UI', () => {
  const { api } = testApi();
  const { state } = seedServiceTicket(api);
  const duplicate = structuredClone(state.serviceTickets[0]);
  duplicate.id = 'ticket-00000000-0000-4000-8000-000000000099';
  state.serviceTickets.push(duplicate);
  state.ui.selectedTicketId = duplicate.id;
  state.ui.selectedStaffId = 'staff-kevin';
  state.ui.activeScreen = 'staffnoteligible';

  const normalized = api.normalizeOperationsState(state);

  assert.deepEqual(plain(normalized.serviceTickets), []);
  assert.deepEqual(plain(normalized.staffEligibility), []);
  assert.equal(normalized.ui.selectedTicketId, null);
  assert.equal(normalized.ui.selectedStaffId, null);
  assert.equal(normalized.ui.activeScreen, 'liveticket');
});

test('evaluates requested staff exactly without replacing them and returns honest recommendations', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' });
  const beforeStaff = ticket.staffProfileId;

  const result = api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny');
  const afterFirst = JSON.stringify(state);
  const replay = api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny');

  assert.equal(result.ok, true);
  assert.equal(result.eligible, false);
  assert.equal(ticket.staffProfileId, beforeStaff);
  assert.ok(result.recommendedStaffIds.includes('staff-tina'));
  assert.ok(result.recommendedStaffIds.includes('staff-kevin'));
  assert.equal(replay.idempotent, true);
  assert.equal(JSON.stringify(state), afterFirst);
});

test('eligibility runtime and persistence bind to the ticket actual service and requested staff', () => {
  const { api } = testApi();
  for (const [serviceKey, staffId] of [
    ['acrylic-full-set', 'staff-jenny'],
    ['deluxe-pedicure', 'staff-kevin']
  ]) {
    const { state, ticket } = seedServiceTicket(api);
    const before = JSON.stringify(state);
    const result = api.evaluateStaffEligibility(state, ticket.id, serviceKey, staffId);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'invalid_eligibility_request');
    assert.equal(JSON.stringify(state), before);
  }

  const { state, ticket } = seedServiceTicket(api);
  state.staffEligibility = [{
    id: `eligibility-${ticket.id.slice('ticket-'.length)}-acrylic-full-set-jenny`,
    ticketId: ticket.id,
    serviceKey: 'acrylic-full-set',
    requestedStaffId: 'staff-jenny',
    eligible: false,
    recommendedStaffIds: ['staff-tina', 'staff-kevin', 'staff-maria'],
    selectedStaffId: null,
    selectedAt: null
  }];
  state.ui.selectedStaffId = 'staff-kevin';
  const normalized = api.normalizeOperationsState(state);
  assert.deepEqual(plain(normalized.staffEligibility), []);
  assert.equal(normalized.ui.selectedStaffId, null);
});

test('rejects wrong-business eligibility and unavailable recommendations atomically', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' });
  for (const [serviceKey, staffId] of [
    ['signature-facial', 'staff-jenny'],
    ['acrylic-full-set', 'staff-spa-linh'],
    ['missing-service', 'staff-jenny']
  ]) {
    const before = JSON.stringify(state);
    assert.equal(api.evaluateStaffEligibility(state, ticket.id, serviceKey, staffId).ok, false);
    assert.equal(JSON.stringify(state), before);
  }
  assert.equal(api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny').ok, true);
  const beforeChoice = JSON.stringify(state);
  const unavailable = api.chooseRecommendedStaff(state, ticket.id, 'staff-tina', 2000);
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.code, 'staff_unavailable');
  assert.equal(JSON.stringify(state), beforeChoice);
});

test('chooses only an available recommendation with stored chronology and exact replay', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' }, 1000);
  assert.equal(api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny').ok, true);
  const beforeEarly = JSON.stringify(state);
  assert.equal(api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', 999).code, 'invalid_time_order');
  assert.equal(JSON.stringify(state), beforeEarly);

  const chosen = api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', 2000);
  const afterChosen = JSON.stringify(state);
  const replay = api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', Number.NaN);

  assert.equal(chosen.ok, true);
  assert.equal(ticket.staffProfileId, 'staff-kevin');
  assert.equal(chosen.selectedAt, '1970-01-01T00:00:02.000Z');
  assert.equal(replay.ok, true);
  assert.equal(replay.idempotent, true);
  assert.equal(JSON.stringify(state), afterChosen);
});

test('resolved staff eligibility cannot persist the warning as the active screen', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' });
  assert.equal(api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny').ok, true);
  assert.equal(api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', 2000).ok, true);
  state.ui.activeScreen = 'staffnoteligible';

  const normalized = api.normalizeOperationsState(state);

  assert.equal(normalized.ui.activeScreen, 'liveticket');
  assert.equal(normalized.ui.selectedStaffId, 'staff-kevin');
});

test('the latest eligibility event is authoritative over every older ineligible event', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' });
  assert.equal(api.evaluateStaffEligibility(state, ticket.id, ticket.serviceKey, ticket.staffProfileId).ok, true);
  assert.equal(api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', 2000).ok, true);
  assert.equal(api.evaluateStaffEligibility(state, ticket.id, ticket.serviceKey, ticket.staffProfileId).eligible, true);
  const before = JSON.stringify(state);

  const staleChoice = api.chooseRecommendedStaff(state, ticket.id, 'staff-maria', 3000);

  assert.equal(staleChoice.ok, false);
  assert.equal(staleChoice.code, 'staff_not_recommended');
  assert.equal(JSON.stringify(state), before);
  state.ui.activeScreen = 'staffnoteligible';
  const normalized = api.normalizeOperationsState(state);
  assert.equal(normalized.ui.activeScreen, 'liveticket');
});

test('fails eligibility closed when persisted events are duplicated or tampered', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' });
  assert.equal(api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny').ok, true);
  state.staffEligibility.push(structuredClone(state.staffEligibility[0]));
  const before = JSON.stringify(state);
  const result = api.evaluateStaffEligibility(state, ticket.id, 'acrylic-full-set', 'staff-jenny');
  assert.equal(result.code, 'invalid_state');
  assert.equal(JSON.stringify(state), before);
});

test('front desk requests are chronological, atomic, and idempotent', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api, {}, 1000);
  const before = JSON.stringify(state);
  assert.equal(api.askFrontDesk(state, ticket.id, 999).code, 'invalid_time_order');
  assert.equal(JSON.stringify(state), before);

  const requested = api.askFrontDesk(state, ticket.id, 2000);
  const afterRequested = JSON.stringify(state);
  const replay = api.askFrontDesk(state, ticket.id, Infinity);
  assert.equal(requested.ok, true);
  assert.equal(ticket.frontDeskRequestedAt, '1970-01-01T00:00:02.000Z');
  assert.equal(replay.idempotent, true);
  assert.equal(JSON.stringify(state), afterRequested);
});

test('completed tickets reject every staff and front-desk live-routing operation unchanged', () => {
  {
    const { api } = testApi();
    const { state, ticket } = seedServiceTicket(api);
    ticket.status = 'completed';
    ticket.completedAt = '1970-01-01T00:00:03.000Z';
    const before = JSON.stringify(state);
    const result = api.evaluateStaffEligibility(state, ticket.id, ticket.serviceKey, ticket.staffProfileId);
    assert.equal(result.code, 'ticket_completed');
    assert.equal(JSON.stringify(state), before);
  }
  {
    const { api } = testApi();
    const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' });
    assert.equal(api.evaluateStaffEligibility(state, ticket.id, ticket.serviceKey, ticket.staffProfileId).ok, true);
    ticket.status = 'completed';
    ticket.completedAt = '1970-01-01T00:00:03.000Z';
    const before = JSON.stringify(state);
    assert.equal(api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', 2000).code, 'ticket_completed');
    assert.equal(JSON.stringify(state), before);
  }
  {
    const { api } = testApi();
    const { state, ticket } = seedServiceTicket(api);
    ticket.status = 'completed';
    ticket.completedAt = '1970-01-01T00:00:03.000Z';
    const before = JSON.stringify(state);
    assert.equal(api.askFrontDesk(state, ticket.id, 2000).code, 'ticket_completed');
    assert.equal(JSON.stringify(state), before);
  }
});

test('normalization rejects staff and front-desk timestamps after ticket completion', () => {
  {
    const { api } = testApi();
    const { state, ticket } = seedServiceTicket(api, { serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny' });
    assert.equal(api.evaluateStaffEligibility(state, ticket.id, ticket.serviceKey, ticket.staffProfileId).ok, true);
    assert.equal(api.chooseRecommendedStaff(state, ticket.id, 'staff-kevin', 4000).ok, true);
    ticket.status = 'completed';
    ticket.completedAt = '1970-01-01T00:00:03.000Z';
    const normalized = api.normalizeOperationsState(state);
    assert.equal(normalized.serviceTickets.length, 1);
    assert.deepEqual(plain(normalized.staffEligibility), []);
    assert.equal(normalized.ui.selectedStaffId, null);
  }
  {
    const { api } = testApi();
    const { state, ticket } = seedServiceTicket(api);
    assert.equal(api.askFrontDesk(state, ticket.id, 4000).ok, true);
    ticket.status = 'completed';
    ticket.completedAt = '1970-01-01T00:00:03.000Z';
    const normalized = api.normalizeOperationsState(state);
    assert.deepEqual(plain(normalized.serviceTickets), []);
    assert.equal(normalized.ui.selectedTicketId, null);
  }
});

test('initialization selects the exact query guest and always enters Customer Live Ticket', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const first = guestCheckin({ id: 'guest-checkin-first' });
  const second = guestCheckin({
    id: 'guest-checkin-second', serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny'
  });
  const storage = createAuditStorage({ [customerKey]: customerStorageJson([first, second]) });
  const harness = uiApi({
    storage,
    href: 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-second'
  });
  const state = harness.api.getOperationsState();

  assert.equal(state.serviceTickets.length, 1);
  assert.equal(state.serviceTickets[0].guestCheckinId, second.id);
  assert.equal(state.ui.selectedTicketId, state.serviceTickets[0].id);
  assert.equal(state.ui.activeScreen, 'liveticket');
  assert.equal(harness.screens[0].classList.contains('hidden'), false);
  assert.equal(harness.api.getPayHandoff(), null);
});

test('invalid or ambiguous query entry fails accessibly without first-guest or demo fallback', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const customerJson = customerStorageJson([guestCheckin({ id: 'guest-checkin-first' })]);
  for (const query of [
    'guestCheckinId=guest-checkin-missing',
    'guestCheckinId=guest-checkin-first&guestCheckinId=guest-checkin-first',
    'guestCheckinId=%20guest-checkin-first%20'
  ]) {
    const storage = createAuditStorage({ [customerKey]: customerJson });
    const harness = uiApi({
      storage,
      href: `https://example.test/customer/customer-salon-operations.html?${query}`
    });
    assert.equal(harness.api.getOperationsState().serviceTickets.length, 0);
    assert.equal(harness.api.getPayHandoff(), null);
    assert.match(harness.status.textContent, /guest check-in|lượt check-in/i);
    assert.equal(harness.byId.get('ops-entry-error').classList.contains('hidden'), false);
  }
});

test('blocked query entry renders only inert Live Ticket error and globally ignores stale ticket actions', () => {
  const operationsKey = 'nexora.customer.crosssurface.v1';
  const customerKey = 'nexora.customer.prototype.v1';
  const customerJson = customerStorageJson([guestCheckin({ id: 'guest-checkin-real' })]);
  for (const query of [
    'guestCheckinId=guest-checkin-missing',
    'guestCheckinId=guest-checkin-real&guestCheckinId=guest-checkin-real'
  ]) {
    const storage = createAuditStorage({
      [operationsKey]: persistedOperationsBytes({ activeScreen: 'staffnoteligible', withEligibility: true }),
      [customerKey]: customerJson
    });
    const harness = uiApi({
      storage,
      href: `https://example.test/customer/customer-salon-operations.html?${query}`,
      prefillStale: true
    });
    const before = JSON.stringify(harness.api.getOperationsState());
    const entryMessage = harness.status.textContent;

    assert.equal(harness.screens[0].classList.contains('hidden'), false);
    assert.equal(harness.screens[1].classList.contains('hidden'), true);
    assert.equal(harness.screens[2].classList.contains('hidden'), true);
    assert.equal(harness.byId.get('ops-ticket-content').classList.contains('hidden'), true);
    for (const id of ['ops-ticket-number', 'ops-ticket-status', 'ops-ticket-business', 'ops-ticket-total',
      'ops-ticket-staff', 'ops-eligibility-warning', 'ops-requested-staff', 'ops-requested-service']) {
      assert.equal(harness.byId.get(id).textContent, '');
    }
    assert.deepEqual(harness.byId.get('ops-ticket-items').children, []);
    assert.deepEqual(harness.byId.get('ops-recommended-staff').children, []);
    for (const control of Object.values(harness.actionButtons)) assert.equal(control.disabled, true);
    assert.equal(harness.screenButtons[1].disabled, true);
    assert.equal(harness.screenButtons[2].disabled, true);

    for (const control of Object.values(harness.actionButtons)) harness.document.dispatchClick(control);
    assert.equal(JSON.stringify(harness.api.getOperationsState()), before);
    assert.equal(harness.api.getPayHandoff(), null);
    assert.equal(harness.status.textContent, entryMessage);
  }
});

test('ticket persistence failure blocks stale state, panels, renderers, actions, and Pay handoff', () => {
  const operationsKey = 'nexora.customer.crosssurface.v1';
  const customerKey = 'nexora.customer.prototype.v1';
  const priorBytes = persistedOperationsBytes({ activeScreen: 'addonapproval' })
    .replaceAll('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000009');
  const storage = createAuditStorage({
    [operationsKey]: priorBytes,
    [customerKey]: customerStorageJson([guestCheckin({ id: 'guest-checkin-new' })])
  }, { failSet: true });
  const harness = uiApi({
    storage,
    href: 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-new',
    prefillStale: true
  });
  const before = JSON.stringify(harness.api.getOperationsState());
  const entryMessage = harness.status.textContent;

  assert.equal(harness.screens[0].classList.contains('hidden'), false);
  assert.equal(harness.screens[1].classList.contains('hidden'), true);
  assert.equal(harness.screens[2].classList.contains('hidden'), true);
  assert.equal(harness.byId.get('ops-ticket-number').textContent, '');
  assert.equal(harness.byId.get('ops-ticket-items').children.length, 0);
  harness.document.dispatchClick(harness.actionButtons.pay);
  harness.document.dispatchClick(harness.actionButtons.frontDesk);
  assert.equal(harness.api.getPayHandoff(), null);
  assert.equal(JSON.stringify(harness.api.getOperationsState()), before);
  assert.equal(harness.status.textContent, entryMessage);
});

test('without a query initialization may use the demo guest but still starts Live Ticket, never Pay', () => {
  const harness = uiApi();
  const state = harness.api.getOperationsState();
  assert.equal(state.serviceTickets.length, 1);
  assert.equal(state.serviceTickets[0].guestCheckinId, 'guest-checkin-demo');
  assert.equal(state.ui.activeScreen, 'liveticket');
  assert.equal(harness.api.getPayHandoff(), null);
});

test('a first-load demo never outranks or renumbers a later real sanitized guest', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const storage = createAuditStorage();
  const demo = uiApi({ storage });
  assert.equal(demo.api.getOperationsState().serviceTickets[0].guestCheckinId, 'guest-checkin-demo');

  storage.setItem(customerKey, customerStorageJson([guestCheckin({ id: 'guest-checkin-real' })]));
  const real = uiApi({ storage });
  const state = real.api.getOperationsState();

  assert.equal(state.serviceTickets.length, 1);
  assert.equal(state.serviceTickets[0].guestCheckinId, 'guest-checkin-real');
  assert.equal(state.serviceTickets[0].number, 104);
  assert.equal(state.ui.selectedTicketId, state.serviceTickets[0].id);
  assert.equal(state.ui.activeScreen, 'liveticket');
});

test('explicit Pay action alone prepares and navigates the exact guest handoff', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({ id: 'guest-checkin-pay' });
  const href = 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-pay';
  const harness = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }), href
  });
  assert.equal(harness.api.getPayHandoff(), null);

  harness.document.dispatchClick(harness.actionButtons.call);
  assert.equal(harness.api.getPayHandoff(), null);
  assert.match(harness.status.textContent, /demo|dialer/i);

  harness.document.dispatchClick(harness.actionButtons.pay);
  assert.deepEqual(plain(harness.api.getPayHandoff()), { guestCheckinId: guest.id });
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  assert.equal(
    harness.window.location.href,
    'https://example.test/customer/cutomer-reward.html?handoff=guest-checkout&guestCheckinId=guest-checkin-pay'
  );
});

test('staff warning is conditional and recommendation CTA, availability, and ARIA stay aligned', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({
    id: 'guest-checkin-ineligible', serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny'
  });
  const harness = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }),
    href: 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-ineligible'
  });

  harness.document.dispatchClick(harness.actionButtons.review);

  const state = harness.api.getOperationsState();
  assert.equal(state.ui.activeScreen, 'staffnoteligible');
  assert.equal(state.serviceTickets[0].staffProfileId, 'staff-jenny');
  assert.equal(harness.byId.get('ops-requested-staff').textContent, 'Jenny');
  assert.equal(harness.byId.get('ops-requested-service').textContent, 'Acrylic Full Set');
  const cards = harness.byId.get('ops-recommended-staff').children;
  const tina = cards.find((card) => card.dataset.staffId === 'staff-tina');
  const kevin = cards.find((card) => card.dataset.staffId === 'staff-kevin');
  assert.equal(tina.disabled, true);
  assert.match(tina.textContent, /Unavailable|Không sẵn sàng/);
  assert.equal(kevin.getAttribute('aria-pressed'), 'true');
  assert.equal(kevin.getAttribute('aria-selected'), null);
  assert.equal(harness.actionButtons.choose.textContent, 'Choose Kevin / Chọn Kevin');

  harness.document.dispatchClick(harness.actionButtons.choose);
  assert.equal(harness.api.getOperationsState().serviceTickets[0].staffProfileId, 'staff-kevin');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
});

test('eligible requested staff stays on Live Ticket and never shows the warning screen', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({ id: 'guest-checkin-eligible' });
  const harness = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }),
    href: 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-eligible'
  });
  harness.document.dispatchClick(harness.actionButtons.review);
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  assert.equal(harness.api.getOperationsState().staffEligibility[0].eligible, true);
  assert.match(harness.status.textContent, /eligible|phù hợp/i);
});

test('live ticket and customer business labels render as inert text with exact ticket values', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({ id: 'guest-checkin-xss', name: '<img src=x onerror=alert(1)>' });
  const businesses = {
    'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: '<svg onload=alert(1)>' }
  };
  const harness = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([guest], businesses) }),
    href: 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-xss'
  });
  assert.equal(harness.byId.get('ops-ticket-number').textContent, '#104');
  assert.equal(harness.byId.get('ops-ticket-status').textContent, 'In Service / Đang làm');
  assert.equal(harness.byId.get('ops-ticket-business').textContent, '<svg onload=alert(1)>');
  assert.equal(harness.byId.get('ops-ticket-total').textContent, '$49.50');
  assert.deepEqual(
    harness.byId.get('ops-ticket-items').children.map((row) => row.children[0].textContent),
    ['Deluxe Pedicure', 'Promo NEW10']
  );
});

test('every enabled static and dynamic Task 8 action dispatches its state, UI, or handoff effect', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({
    id: 'guest-checkin-actions', serviceKey: 'acrylic-full-set', staffProfileId: 'staff-jenny'
  });
  const harness = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }),
    href: 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-actions'
  });

  harness.document.dispatchClick(harness.actionButtons.call);
  assert.match(harness.status.textContent, /dialer/i);
  harness.document.dispatchClick(harness.actionButtons.message);
  assert.match(harness.status.textContent, /messaging/i);
  harness.document.dispatchClick(harness.actionButtons.ticket);
  assert.match(harness.status.textContent, /ticket is open/i);
  harness.document.dispatchClick(harness.actionButtons.reviewTab);
  assert.match(harness.status.textContent, /review continues/i);
  harness.document.dispatchClick(harness.actionButtons.reward);
  assert.match(harness.status.textContent, /reward continues/i);

  harness.document.dispatchClick(harness.actionButtons.review);
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'staffnoteligible');
  const maria = harness.byId.get('ops-recommended-staff').children
    .find((card) => card.dataset.staffId === 'staff-maria');
  assert.equal(maria.disabled, false);
  harness.document.dispatchClick(maria);
  assert.equal(harness.api.getOperationsState().ui.selectedStaffId, 'staff-maria');
  assert.equal(harness.actionButtons.choose.textContent, 'Choose Maria / Chọn Maria');
  assert.equal(harness.byId.get('ops-recommended-staff').children
    .find((card) => card.dataset.staffId === 'staff-maria').getAttribute('aria-pressed'), 'true');

  harness.document.dispatchClick(harness.actionButtons.frontDesk);
  assert.ok(harness.api.getOperationsState().serviceTickets[0].frontDeskRequestedAt);
  harness.document.dispatchClick(harness.actionButtons.choose);
  assert.equal(harness.api.getOperationsState().serviceTickets[0].staffProfileId, 'staff-maria');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  harness.document.dispatchClick(harness.actionButtons.pay);
  assert.deepEqual(plain(harness.api.getPayHandoff()), { guestCheckinId: guest.id });
});

test('all delegated controls are registered and companion keeps exactly three operations screens', () => {
  const actions = [...SOURCE.matchAll(/data-ops-action="([^"]+)"/g)].map((match) => match[1]);
  const { api } = testApi();
  const registered = api.getRegisteredOpsActions();
  for (const action of new Set(actions)) assert.ok(registered.includes(action), `unregistered ${action}`);
  assert.equal((SOURCE.match(/data-ops-screen="/g) || []).length, 3);
  assert.match(SOURCE, /Ticket[\s\S]*Pay[\s\S]*Review[\s\S]*Reward/);
  assert.doesNotMatch(SOURCE, /location\.(?:href|assign)\s*=.*pay|navigate.*pay/i);
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

  harness.document.dispatchClick(harness.actionButtons.openAddon);
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  assert.equal(harness.actionButtons.openAddon.disabled, true);

  harness.role.value = 'Customer';
  harness.role.dispatch('change');

  harness.document.dispatchClick(harness.actionButtons.openAddon);
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

test('ARIA tabs support ArrowLeft, ArrowRight, Home, and End with persisted activation', () => {
  const harness = uiApi();
  const [live, eligibility, addon] = harness.screenButtons;
  assert.equal(eligibility.disabled, true);
  assert.equal(eligibility.getAttribute('aria-disabled'), 'true');
  assert.equal(addon.disabled, true);
  harness.document.dispatchClick(harness.actionButtons.openAddon);
  harness.document.dispatchClick(live);
  assert.equal(addon.disabled, false);

  const right = harness.document.dispatchKeydown(live, 'ArrowRight');
  assert.equal(right.defaultPrevented, true);
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'addonapproval');
  assert.equal(harness.document.activeElement, addon);
  assert.equal(addon.getAttribute('aria-selected'), 'true');

  harness.document.dispatchKeydown(addon, 'End');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'addonapproval');
  assert.equal(harness.document.activeElement, addon);

  harness.document.dispatchKeydown(addon, 'Home');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  assert.equal(harness.document.activeElement, live);

  harness.document.dispatchKeydown(live, 'ArrowLeft');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'addonapproval');
  assert.equal(harness.document.activeElement, addon);

  harness.document.dispatchKeydown(addon, 'ArrowRight');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  assert.equal(harness.document.activeElement, live);
  assert.equal(JSON.parse(harness.storage.peek(harness.api.OPS_STORAGE_KEY)).ui.activeScreen, 'liveticket');
});

test('failed keyboard tab persistence restores previous state, ARIA, panel, and focus', () => {
  const storage = createAuditStorage({}, { failSet: true });
  const harness = uiApi({ storage });
  const [live, eligibility] = harness.screenButtons;

  const event = harness.document.dispatchKeydown(live, 'ArrowRight');

  assert.equal(event.defaultPrevented, true);
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  assert.equal(live.getAttribute('aria-selected'), 'true');
  assert.equal(live.getAttribute('tabindex'), '0');
  assert.equal(eligibility.getAttribute('aria-selected'), 'false');
  assert.equal(eligibility.getAttribute('tabindex'), '-1');
  assert.equal(harness.screens[0].classList.contains('hidden'), false);
  assert.equal(harness.screens[1].classList.contains('hidden'), true);
  assert.equal(harness.document.activeElement, live);
  assert.equal(storage.peek(harness.api.OPS_STORAGE_KEY), null);
  assert.match(harness.status.textContent, /not saved|không thể lưu/i);
});

test('initialization tolerates missing Lucide and unavailable storage', () => {
  const storage = createAuditStorage({}, { failGet: true });
  const harness = uiApi({ storage });
  assert.equal(harness.role.value, 'Customer');
  assert.equal(harness.screens[0].classList.contains('hidden'), false);
  assert.equal(harness.screens[1].classList.contains('hidden'), true);
});

test('throwing localStorage accessor still exports a safe API and preserves in-memory state', () => {
  const { api } = throwingLocalStorageApi();
  assert.ok(api);
  const loaded = api.loadOperationsState();
  const snapshot = api.readCustomerSnapshot();
  const before = plain(api.getOperationsState());

  assert.equal(loaded.schemaVersion, 1);
  assert.deepEqual(plain(snapshot), { profile: null, businesses: {}, guestCheckins: [] });
  assert.throws(
    () => api.saveOperationsState(api.createOperationsState()),
    (error) => error?.code === 'persist_failed' && /storage/i.test(error.message)
  );
  const committed = api.commitOperations((draft) => {
    draft.ui.role = 'Staff';
    return { ok: true };
  });
  assert.equal(committed.ok, false);
  assert.equal(committed.code, 'persist_failed');
  assert.deepEqual(plain(api.getOperationsState()), before);
});

test('accepts an authoritative add-on once after exact guest phone confirmation', () => {
  const { api } = testApi();
  const fixture = seedTicketWithCustomer(api);
  const proposed = api.proposeAddOn(fixture.state, {
    ticketId: fixture.ticket.id,
    staffProfileId: fixture.ticket.staffProfileId,
    label: 'Gel Polish',
    amountCents: 1500
  }, 1000);
  assert.equal(proposed.ok, true);
  assert.equal(fixture.ticket.currentTotalCents, 4950);

  const accepted = api.resolveAddOn(
    fixture.state, proposed.addOn.id, 'accepted', '0198', fixture.customerSnapshot, 2000
  );
  assert.equal(accepted.ok, true);
  assert.equal(accepted.addOn.status, 'accepted');
  assert.equal(fixture.ticket.currentTotalCents, 6450);
  assert.equal(fixture.ticket.lineItems.filter((item) => item.sourceAddOnId === proposed.addOn.id).length, 1);

  const snapshot = JSON.stringify(fixture.state);
  const replay = api.resolveAddOn(
    fixture.state, proposed.addOn.id, 'accepted', '0198', fixture.customerSnapshot, 3000
  );
  assert.equal(replay.idempotent, true);
  assert.equal(JSON.stringify(fixture.state), snapshot);
});

test('wrong phone, changed decision, duplicate owners, and decline are atomic', () => {
  const { api } = testApi();
  const fixture = seedTicketWithCustomer(api);
  const proposed = api.proposeAddOn(fixture.state, {
    ticketId: fixture.ticket.id, staffProfileId: 'staff-jenny', businessId: 'bitcoin-nail-bar',
    label: 'Gel Polish', amountCents: 1500
  }, 1000);
  for (const [last4, snapshot] of [
    ['0000', fixture.customerSnapshot],
    ['(0198)', fixture.customerSnapshot],
    ['0198', { ...fixture.customerSnapshot, guestCheckins: [
      ...fixture.customerSnapshot.guestCheckins, structuredClone(fixture.customerSnapshot.guestCheckins[0])
    ] }]
  ]) {
    const before = JSON.stringify(fixture.state);
    assert.equal(api.resolveAddOn(fixture.state, proposed.addOn.id, 'accepted', last4, snapshot, 2000).ok, false);
    assert.equal(JSON.stringify(fixture.state), before);
  }
  assert.equal(api.resolveAddOn(
    fixture.state, proposed.addOn.id, 'declined', '0198', fixture.customerSnapshot, 2000
  ).ok, true);
  assert.equal(fixture.ticket.currentTotalCents, 4950);
  const beforeReplay = JSON.stringify(fixture.state);
  assert.equal(api.resolveAddOn(
    fixture.state, proposed.addOn.id, 'accepted', '0198', fixture.customerSnapshot, 3000
  ).code, 'addon_already_resolved');
  assert.equal(JSON.stringify(fixture.state), beforeReplay);
});

test('proposal binds to catalog, active ticket, current staff, chronology, uniqueness, and UUID collision', () => {
  const cases = [
    ['arbitrary label', { label: 'Mystery', amountCents: 1500 }],
    ['arbitrary amount', { label: 'Gel Polish', amountCents: 1 }],
    ['wrong staff', { label: 'Gel Polish', amountCents: 1500, staffProfileId: 'staff-kevin' }],
    ['wrong business', { label: 'Gel Polish', amountCents: 1500, businessId: 'golden-glow-spa' }]
  ];
  for (const [, overrides] of cases) {
    const { api } = testApi();
    const fixture = seedTicketWithCustomer(api);
    const before = JSON.stringify(fixture.state);
    const result = api.proposeAddOn(fixture.state, {
      ticketId: fixture.ticket.id, staffProfileId: fixture.ticket.staffProfileId,
      businessId: fixture.ticket.businessId, label: 'Gel Polish', amountCents: 1500, ...overrides
    }, 1000);
    assert.equal(result.ok, false);
    assert.equal(JSON.stringify(fixture.state), before);
  }

  const { api } = testApi();
  const completed = seedTicketWithCustomer(api);
  completed.ticket.status = 'completed';
  completed.ticket.completedAt = new Date(2000).toISOString();
  const completedBefore = JSON.stringify(completed.state);
  assert.equal(api.proposeAddOn(completed.state, {
    ticketId: completed.ticket.id, staffProfileId: 'staff-jenny', businessId: 'bitcoin-nail-bar',
    label: 'Gel Polish', amountCents: 1500
  }, 1500).code, 'ticket_completed');
  assert.equal(JSON.stringify(completed.state), completedBefore);

  const first = seedTicketWithCustomer(api);
  const created = api.proposeAddOn(first.state, {
    ticketId: first.ticket.id, staffProfileId: 'staff-jenny', businessId: 'bitcoin-nail-bar',
    label: 'Gel Polish', amountCents: 1500
  }, 999);
  assert.equal(created.code, 'invalid_time_order');
  assert.equal(first.state.addOnRequests.length, 0);
});

test('add-on UUID failures, collisions, roles, completed tickets, and resolution time are atomic', () => {
  let uuidCall = 0;
  const values = [
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000002'
  ];
  const { api } = testApi({}, { randomUUID: () => values[uuidCall++] });
  const first = seedTicketWithCustomer(api);
  const proposal = api.proposeAddOn(first.state, {
    ticketId: first.ticket.id, staffProfileId: 'staff-jenny', businessId: 'bitcoin-nail-bar',
    label: 'Gel Polish', amountCents: 1500
  }, 1000);
  assert.equal(proposal.ok, true);
  const secondGuest = guestCheckin({ id: 'guest-checkin-2' });
  const second = api.createServiceTicket(first.state, secondGuest, 1000);
  assert.equal(second.ok, true);
  const beforeCollision = JSON.stringify(first.state);
  assert.equal(api.proposeAddOn(first.state, {
    ticketId: second.ticket.id, staffProfileId: 'staff-jenny', businessId: 'bitcoin-nail-bar',
    label: 'Gel Polish', amountCents: 1500
  }, 1000).code, 'id_collision');
  assert.equal(JSON.stringify(first.state), beforeCollision);

  first.state.ui.selectedTicketId = first.ticket.id;
  first.state.ui.role = 'Staff';
  const roleBefore = JSON.stringify(first.state);
  assert.equal(api.resolveAddOn(
    first.state, proposal.addOn.id, 'accepted', '0198', first.customerSnapshot, 2000
  ).code, 'customer_approval_required');
  assert.equal(JSON.stringify(first.state), roleBefore);
  first.state.ui.role = 'Customer';
  const timeBefore = JSON.stringify(first.state);
  assert.equal(api.resolveAddOn(
    first.state, proposal.addOn.id, 'accepted', '0198', first.customerSnapshot, 999
  ).code, 'invalid_time_order');
  assert.equal(JSON.stringify(first.state), timeBefore);
  first.ticket.status = 'completed';
  first.ticket.completedAt = new Date(1500).toISOString();
  const completedBefore = JSON.stringify(first.state);
  assert.equal(api.resolveAddOn(
    first.state, proposal.addOn.id, 'accepted', '0198', first.customerSnapshot, 1400
  ).code, 'ticket_completed');
  assert.equal(JSON.stringify(first.state), completedBefore);

  let invalidUuidCalls = 0;
  const invalid = testApi({}, { randomUUID: () => (
    invalidUuidCalls++ === 0 ? '00000000-0000-4000-8000-000000000011' : 'not-a-uuid'
  ) });
  const invalidFixture = seedTicketWithCustomer(invalid.api);
  const invalidBefore = JSON.stringify(invalidFixture.state);
  assert.equal(invalid.api.proposeAddOn(invalidFixture.state, {
    ticketId: invalidFixture.ticket.id, staffProfileId: 'staff-jenny', businessId: 'bitcoin-nail-bar',
    label: 'Gel Polish', amountCents: 1500
  }, 1000).code, 'id_failed');
  assert.equal(JSON.stringify(invalidFixture.state), invalidBefore);
});

test('strict add-on reconciliation rejects duplicate semantics and mismatched accepted line items all-or-none', () => {
  const { api } = testApi();
  const fixture = seedTicketWithCustomer(api);
  const proposed = api.proposeAddOn(fixture.state, {
    ticketId: fixture.ticket.id, staffProfileId: 'staff-jenny', businessId: 'bitcoin-nail-bar',
    label: 'Gel Polish', amountCents: 1500
  }, 1000);
  api.resolveAddOn(fixture.state, proposed.addOn.id, 'accepted', '0198', fixture.customerSnapshot, 2000);
  const canonical = api.normalizeOperationsState(fixture.state);
  assert.equal(canonical.addOnRequests.length, 1);
  assert.equal(canonical.serviceTickets[0].lineItems.length, 3);

  for (const mutate of [
    (state) => state.addOnRequests.push(structuredClone(state.addOnRequests[0])),
    (state) => { state.serviceTickets[0].lineItems[2].amountCents = 1499; },
    (state) => { state.addOnRequests[0].businessId = 'golden-glow-spa'; },
    (state) => { state.addOnRequests[0].resolvedAt = new Date(500).toISOString(); }
  ]) {
    const tampered = structuredClone(fixture.state);
    mutate(tampered);
    const normalized = api.normalizeOperationsState(tampered);
    assert.deepEqual(plain(normalized.addOnRequests), []);
    assert.deepEqual(plain(normalized.serviceTickets), []);
    assert.equal(normalized.ui.activeScreen, 'liveticket');
  }
});

test('only explicit Pay action performs the exact same-origin checkout handoff and keeps retry state on failure', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({ id: 'guest-checkin-route' });
  const href = 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-route';
  const harness = uiApi({ storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }), href });
  harness.document.dispatchClick(harness.actionButtons.call);
  assert.equal(harness.window.location.href, href);
  harness.document.dispatchClick(harness.actionButtons.pay);
  assert.equal(
    harness.window.location.href,
    'https://example.test/customer/cutomer-reward.html?handoff=guest-checkout&guestCheckinId=guest-checkin-route'
  );
  assert.deepEqual(plain(harness.api.getPayHandoff()), { guestCheckinId: guest.id });

  const failed = uiApi({ storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }), href });
  Object.defineProperty(failed.window, 'location', {
    value: { href, assign() { throw new Error('blocked'); } }, configurable: true
  });
  failed.document.dispatchClick(failed.actionButtons.pay);
  assert.deepEqual(plain(failed.api.getPayHandoff()), { guestCheckinId: guest.id });
  assert.equal(failed.window.location.href, href);
  assert.match(failed.status.textContent, /retry|thử lại/i);

  const blockedAccessor = uiApi({ storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }), href });
  Object.defineProperty(blockedAccessor.window, 'location', {
    configurable: true,
    get() { throw new Error('location blocked'); }
  });
  assert.doesNotThrow(() => blockedAccessor.document.dispatchClick(blockedAccessor.actionButtons.pay));
  assert.deepEqual(plain(blockedAccessor.api.getPayHandoff()), { guestCheckinId: guest.id });
  assert.match(blockedAccessor.status.textContent, /retry|thử lại/i);
});

test('add-on UI executes open decision sanitized phone and confirm with accessible reset', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({ id: 'guest-checkin-addon-ui' });
  const harness = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }),
    href: 'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-addon-ui'
  });
  const phone = harness.byId.get('ops-addon-phone');
  const confirm = harness.actionButtons.confirmAddon;
  assert.equal(harness.screenButtons[2].disabled, true);

  harness.document.dispatchClick(harness.actionButtons.openAddon);
  assert.equal(harness.api.getOperationsState().addOnRequests[0].status, 'proposed');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'addonapproval');
  assert.equal(harness.byId.get('ops-addon-staff').textContent, 'Jenny suggested / đề xuất');
  assert.equal(harness.byId.get('ops-addon-label').textContent, 'Gel Polish');
  assert.equal(harness.byId.get('ops-addon-amount').textContent, '+ $15.00');
  assert.equal(harness.byId.get('ops-addon-current').textContent, '$49.50');
  assert.equal(harness.byId.get('ops-addon-new').textContent, '$64.50');
  assert.equal(confirm.disabled, true);

  harness.document.dispatchClick(harness.actionButtons.acceptAddon);
  phone.value = '(01)98';
  phone.dispatch('input');
  assert.equal(phone.value, '0198');
  assert.equal(confirm.disabled, false);
  assert.equal(confirm.getAttribute('aria-disabled'), 'false');
  harness.document.dispatchClick(confirm);

  const accepted = harness.api.getOperationsState();
  assert.equal(accepted.addOnRequests[0].status, 'accepted');
  assert.equal(accepted.serviceTickets[0].currentTotalCents, 6450);
  assert.equal(accepted.ui.activeScreen, 'liveticket');
  assert.equal(phone.value, '');
  assert.equal(confirm.disabled, true);
  assert.equal(harness.screenButtons[2].disabled, true);
  assert.equal(harness.screens[0].focusCount > 0, true);
});

test('pending add-on blocks the registered staff switch without state or storage loss', () => {
  const setup = testApi();
  const guest = guestCheckin({
    id: 'guest-checkin-pending-switch', serviceKey: 'acrylic-full-set', staffProfileId: 'staff-tina'
  });
  const { state, ticket } = seedServiceTicket(setup.api, {
    id: guest.id, serviceKey: guest.serviceKey, staffProfileId: guest.staffProfileId
  });
  const eligibility = setup.api.evaluateStaffEligibility(state, ticket.id, ticket.serviceKey, ticket.staffProfileId);
  assert.equal(eligibility.ok, true);
  assert.equal(setup.api.proposeAddOn(state, {
    ticketId: ticket.id,
    businessId: ticket.businessId,
    staffProfileId: ticket.staffProfileId,
    label: 'Gel Polish',
    amountCents: 1500
  }, 2000).ok, true);
  state.ui.activeScreen = 'staffnoteligible';
  const storage = createAuditStorage({
    [setup.api.OPS_STORAGE_KEY]: JSON.stringify(state),
    [setup.api.CUSTOMER_STORAGE_KEY]: customerStorageJson([guest])
  });
  const harness = uiApi({
    storage,
    href: `https://example.test/customer/customer-salon-operations.html?guestCheckinId=${guest.id}`
  });
  const beforeState = JSON.stringify(harness.api.getOperationsState());
  const beforeStorage = storage.peek(setup.api.OPS_STORAGE_KEY);
  const writesBefore = storage.calls.filter((call) => call.method === 'setItem').length;

  harness.document.dispatchClick(harness.actionButtons.choose);

  assert.equal(JSON.stringify(harness.api.getOperationsState()), beforeState);
  assert.equal(storage.peek(setup.api.OPS_STORAGE_KEY), beforeStorage);
  assert.equal(storage.calls.filter((call) => call.method === 'setItem').length, writesBefore);
  assert.match(harness.status.textContent, /cannot choose|không thể chọn/i);
});

test('commit rejects any lossy post-mutation normalization before touching storage', () => {
  const setup = testApi();
  const { state, ticket } = seedServiceTicket(setup.api);
  assert.equal(setup.api.proposeAddOn(state, {
    ticketId: ticket.id,
    businessId: ticket.businessId,
    staffProfileId: ticket.staffProfileId,
    label: 'Gel Polish',
    amountCents: 1500
  }, 2000).ok, true);
  const raw = JSON.stringify(state);
  const storage = createAuditStorage({ [setup.api.OPS_STORAGE_KEY]: raw });
  const loaded = testApi({ [setup.api.OPS_STORAGE_KEY]: raw });
  const before = JSON.stringify(loaded.api.getOperationsState());

  const result = loaded.api.commitOperations((draft) => {
    draft.serviceTickets[0].staffProfileId = 'staff-kevin';
    return { ok: true };
  }, storage);

  assert.deepEqual(plain(result), { ok: false, code: 'invalid_state' });
  assert.equal(JSON.stringify(loaded.api.getOperationsState()), before);
  assert.equal(storage.peek(setup.api.OPS_STORAGE_KEY), raw);
  assert.equal(storage.calls.some((call) => ['setItem', 'removeItem'].includes(call.method)), false);
});

test('commit rejects every noncanonical root envelope before any storage access', () => {
  const variants = [
    ['unexpected root key', (draft) => { draft.unexpected = true; }],
    ['missing schema version', (draft) => { delete draft.schemaVersion; }],
    ['wrong schema version', (draft) => { draft.schemaVersion = 2; }],
    ['missing updated timestamp', (draft) => { delete draft.updatedAt; }],
    ['noncanonical updated timestamp', (draft) => { draft.updatedAt = '1970-01-01T00:00:00Z'; }],
    ['missing tickets', (draft) => { delete draft.serviceTickets; }],
    ['missing add-ons', (draft) => { delete draft.addOnRequests; }],
    ['missing eligibility', (draft) => { delete draft.staffEligibility; }],
    ['missing UI', (draft) => { delete draft.ui; }]
  ];

  for (const [label, mutate] of variants) {
    const loaded = testApi();
    const storage = createAuditStorage({ sentinel: 'unchanged' });
    const before = JSON.stringify(loaded.api.getOperationsState());
    const result = loaded.api.commitOperations((draft) => {
      mutate(draft);
      return { ok: true };
    }, storage);

    assert.deepEqual(plain(result), { ok: false, code: 'invalid_state' }, label);
    assert.equal(JSON.stringify(loaded.api.getOperationsState()), before, label);
    assert.equal(storage.peek('sentinel'), 'unchanged', label);
    assert.equal(storage.calls.length, 0, label);
  }
});

test('operations entry and checkout routing require HTTP(S), exact filenames, and exact queries', () => {
  const { api } = testApi();
  const guest = guestCheckin({ id: 'guest-checkin-strict-route' });
  const snapshot = {
    profile: null,
    businesses: { 'bitcoin-nail-bar': { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' } },
    guestCheckins: [guest]
  };
  for (const valid of [
    'https://example.test/customer/customer-salon-operations.html',
    'http://example.test/customer/customer-salon-operations.html',
    `https://example.test/customer/customer-salon-operations.html?guestCheckinId=${guest.id}`
  ]) assert.equal(api.resolveOperationsEntry(snapshot, valid).ok, true, valid);
  for (const invalid of [
    'file:///tmp/customer-salon-operations.html',
    'ftp://example.test/customer/customer-salon-operations.html',
    'https://example.test/customer/cutomer-reward.html',
    'https://example.test/customer/customer-salon-operations.html?unknown=1',
    `https://example.test/customer/customer-salon-operations.html?guestCheckinId=${guest.id}&unknown=1`,
    `https://example.test/customer/customer-salon-operations.html?guestCheckinId=${guest.id}&guestCheckinId=${guest.id}`
  ]) assert.equal(api.resolveOperationsEntry(snapshot, invalid).ok, false, invalid);

  assert.deepEqual(plain(api.buildOperationsCheckoutUrl(
    `http://example.test/customer/customer-salon-operations.html?guestCheckinId=${guest.id}`,
    guest.id
  )), {
    ok: true,
    href: `http://example.test/customer/cutomer-reward.html?handoff=guest-checkout&guestCheckinId=${guest.id}`
  });
  for (const invalid of [
    'file:///tmp/customer-salon-operations.html',
    'https://example.test/customer/cutomer-reward.html',
    'https://example.test/customer/customer-salon-operations.html?unknown=1',
    'https://example.test/customer/customer-salon-operations.html?guestCheckinId=guest-checkin-other'
  ]) assert.equal(api.buildOperationsCheckoutUrl(invalid, guest.id).ok, false, invalid);
});

test('operations initialization guards a throwing location getter and focuses route errors', () => {
  assert.doesNotThrow(() => uiApi({ throwLocationAccessor: true }));
  const blocked = uiApi({
    href: 'https://example.test/customer/customer-salon-operations.html?unknown=1'
  });
  const error = blocked.byId.get('ops-entry-error');
  assert.equal(error.focusCount > 0, true);
});

test('add-on controls follow Customer role, ticket support, staff assignment, and lifecycle', () => {
  const customerKey = 'nexora.customer.prototype.v1';
  const guest = guestCheckin({ id: 'guest-checkin-addon-controls' });
  const harness = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([guest]) }),
    href: `https://example.test/customer/customer-salon-operations.html?guestCheckinId=${guest.id}`
  });
  const phone = harness.byId.get('ops-addon-phone');
  assert.equal(harness.actionButtons.openAddon.disabled, false);
  harness.document.dispatchClick(harness.actionButtons.openAddon);
  assert.equal(harness.screenButtons[2].disabled, false);
  assert.equal(harness.actionButtons.acceptAddon.disabled, false);
  harness.document.dispatchClick(harness.actionButtons.acceptAddon);
  phone.value = '0198';
  phone.dispatch('input');

  harness.role.value = 'Staff';
  harness.role.dispatch('change');
  assert.equal(harness.api.getOperationsState().ui.activeScreen, 'liveticket');
  assert.equal(harness.actionButtons.openAddon.disabled, true);
  assert.equal(harness.actionButtons.acceptAddon.disabled, true);
  assert.equal(harness.actionButtons.declineAddon.disabled, true);
  assert.equal(phone.disabled, true);
  assert.equal(phone.value, '');
  assert.equal(harness.actionButtons.confirmAddon.disabled, true);

  harness.role.value = 'Customer';
  harness.role.dispatch('change');
  assert.equal(harness.screenButtons[2].disabled, false);
  harness.document.dispatchClick(harness.screenButtons[2]);
  harness.document.dispatchClick(harness.actionButtons.declineAddon);
  phone.value = '0198';
  phone.dispatch('input');
  harness.document.dispatchClick(harness.actionButtons.confirmAddon);
  assert.equal(harness.api.getOperationsState().addOnRequests[0].status, 'declined');
  assert.equal(harness.actionButtons.openAddon.disabled, true);
  assert.equal(harness.screenButtons[2].disabled, true);

  const unsupportedGuest = guestCheckin({
    id: 'guest-checkin-unsupported-addon', businessId: 'golden-glow-spa',
    serviceKey: 'signature-facial', staffProfileId: 'staff-spa-linh'
  });
  const unsupported = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([unsupportedGuest]) }),
    href: `https://example.test/customer/customer-salon-operations.html?guestCheckinId=${unsupportedGuest.id}`
  });
  assert.equal(unsupported.actionButtons.openAddon.disabled, true);

  const unassignedGuest = guestCheckin({ id: 'guest-checkin-unassigned-addon', staffProfileId: null });
  const unassigned = uiApi({
    storage: createAuditStorage({ [customerKey]: customerStorageJson([unassignedGuest]) }),
    href: `https://example.test/customer/customer-salon-operations.html?guestCheckinId=${unassignedGuest.id}`
  });
  assert.equal(unassigned.actionButtons.openAddon.disabled, true);

  assert.match(SOURCE, /id="ops-addon-error"[^>]+tabindex="-1"/);
  assert.match(SOURCE, /id="ops-entry-error"[^>]+tabindex="-1"/);
});

test('operations UUID-backed ticket and add-on IDs are lowercase canonical values', () => {
  const { api } = testApi();
  const { state, ticket } = seedServiceTicket(api);
  const upperTicket = structuredClone(state);
  upperTicket.serviceTickets[0].id = ticket.id.toUpperCase();
  upperTicket.serviceTickets[0].lineItems.forEach((item) => {
    item.id = item.id.replace(ticket.id, ticket.id.toUpperCase());
  });
  upperTicket.ui.selectedTicketId = ticket.id.toUpperCase();
  assert.equal(api.normalizeOperationsState(upperTicket).serviceTickets.length, 0);

  const proposed = api.proposeAddOn(state, {
    ticketId: ticket.id, businessId: ticket.businessId, staffProfileId: ticket.staffProfileId,
    label: 'Gel Polish', amountCents: 1500
  }, 2000);
  assert.equal(proposed.ok, true);
  const upperAddOn = structuredClone(state);
  upperAddOn.addOnRequests[0].id = proposed.addOn.id.toUpperCase();
  assert.equal(api.normalizeOperationsState(upperAddOn).serviceTickets.length, 0);
});
