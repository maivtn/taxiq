import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

function createMemoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); },
    key(index) { return [...values.keys()][index] ?? null; },
    get length() { return values.size; },
    dump() { return Object.fromEntries(values); }
  };
}

function createClassList(initial = []) {
  const values = new Set(initial);
  return {
    add(...names) { names.forEach((name) => values.add(name)); },
    remove(...names) { names.forEach((name) => values.delete(name)); },
    contains(name) { return values.has(name); },
    toggle(name, force) {
      const active = force === undefined ? !values.has(name) : Boolean(force);
      if (active) values.add(name);
      else values.delete(name);
      return active;
    }
  };
}

function createStubElement({ id = '', dataset = {}, textContent = '', placeholder = '', classNames = [], onFocus = null, querySelectors = {} } = {}) {
  const attributes = {};
  return {
    id,
    dataset,
    textContent,
    placeholder,
    attributes,
    children: [],
    classList: createClassList(classNames),
    disabled: false,
    hidden: false,
    style: {},
    clicked: false,
    isConnected: true,
    innerHTML: '',
    append(...children) { this.children.push(...children); },
    prepend(...children) { this.children.unshift(...children); },
    replaceChildren(...children) { this.children = [...children]; },
    remove() { this.isConnected = false; },
    setAttribute(name, value) { attributes[name] = String(value); },
    getAttribute(name) { return attributes[name] ?? null; },
    removeAttribute(name) { delete attributes[name]; },
    getClientRects() { return this.isConnected && !this.hidden && !this.classList.contains('hidden') ? [{}] : []; },
    querySelector(selector) { return querySelectors[selector] ?? null; },
    querySelectorAll(selector) {
      const result = querySelectors[selector];
      return Array.isArray(result) ? result : result ? [result] : [];
    },
    closest() { return null; },
    click() { this.clicked = true; },
    focus() { onFocus?.(this); }
  };
}

function createDocumentStub({
  localizedNodes = [], placeholderNodes = [], languageControls = [],
  notificationControls = [], overlayCloseControls = [], balancePointNodes = [],
  balanceWithUnitNodes = [], balanceAvailableNodes = [], rewardGapValueNodes = [],
  rewardGapCopyNodes = [], rewardProgressNodes = [], signatureRewardControls = [],
  screenNodes = [], extraElements = [], selectorNodes = {}
} = {}) {
  const listeners = [];
  const elements = new Map([...screenNodes, ...extraElements].map((element) => [element.id, element]));
  const document = {
    listeners,
    documentElement: { lang: 'vi' },
    body: { classList: createClassList() },
    activeElement: null,
    addEventListener(type, handler) { listeners.push({ type, handler }); },
    createElement(tagName = '') {
      const element = createStubElement({ onFocus: (focused) => { document.activeElement = focused; } });
      element.tagName = String(tagName).toUpperCase();
      return element;
    },
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, createStubElement({ id, onFocus: (element) => { document.activeElement = element; } }));
      }
      return elements.get(id);
    },
    querySelector(selector) {
      const result = selectorNodes[selector];
      return Array.isArray(result) ? result[0] ?? null : result ?? null;
    },
    querySelectorAll(selector) {
      if (Object.prototype.hasOwnProperty.call(selectorNodes, selector)) {
        const result = selectorNodes[selector];
        return Array.isArray(result) ? result : result ? [result] : [];
      }
      if (selector === '[data-en][data-vi]') return localizedNodes;
      if (selector === '[data-en-ph][data-vi-ph]') return placeholderNodes;
      if (selector === '[data-language]') return languageControls;
      if (selector === '[data-action="open-notifications"]') return notificationControls;
      if (selector === '[data-action="close-overlay"]') return overlayCloseControls;
      if (selector === '[data-balance-points]') return balancePointNodes;
      if (selector === '[data-balance-with-unit]') return balanceWithUnitNodes;
      if (selector === '[data-balance-available]') return balanceAvailableNodes;
      if (selector === '[data-reward-gap-value]') return rewardGapValueNodes;
      if (selector === '[data-reward-gap-copy]') return rewardGapCopyNodes;
      if (selector === '[data-reward-progress]') return rewardProgressNodes;
      if (selector === '[data-signature-reward-cta]') return signatureRewardControls;
      if (selector === '.app-screen') return screenNodes;
      return [];
    }
  };
  elements.forEach((element) => {
    const focus = element.focus.bind(element);
    element.focus = (...args) => {
      document.activeElement = element;
      focus(...args);
    };
  });
  return document;
}

function testApi(seed = {}, {
  skipInit = true,
  document,
  randomUUID = () => '00000000-0000-4000-8000-000000000001',
  open = () => null,
  url = URL,
  blob = Blob,
  fileReader,
  image
} = {}) {
  const source = html();
  const script = source.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
  assert.ok(script, 'inline application script must exist');
  const storage = createMemoryStorage(seed);
  const window = {
    localStorage: storage,
    NEXORA_SKIP_INIT: skipInit,
    setTimeout() { return 1; },
    clearTimeout() {},
    open,
    lucide: null
  };
  if (document) window.document = document;
  const globals = {
    window,
    localStorage: storage,
    structuredClone,
    Intl,
    Date,
    Math,
    JSON,
    URL: url,
    Blob: blob,
    crypto: { randomUUID },
    console
  };
  if (document) globals.document = document;
  if (fileReader) globals.FileReader = fileReader;
  if (image) globals.Image = image;
  const context = vm.createContext(globals);
  vm.runInContext(script, context);
  return { api: window.NEXORA_TEST_API, storage, context };
}

function customerJourneyFixture() {
  return {
    guestCheckins: [{
      id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', name: 'Amy Nguyen',
      phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-anna',
      station: 'front', sourceQr: 'https://nexoratouch.com/touch/bitcoin-nail-bar/front',
      status: 'checked_in', pointsPending: 120, scannedAt: '2026-07-15T03:04:42.000Z',
      claimedAt: null
    }],
    checkoutDrafts: [{
      id: 'checkout-00000000-0000-4000-8000-000000000001', guestCheckinId: 'guest-checkin-1', businessId: 'bitcoin-nail-bar',
      lineItems: [
        { id: 'service-guest-checkin-1', type: 'service', label: 'Deluxe Pedicure', amountCents: 5500, sourceAddOnId: null },
        { id: 'promo-guest-checkin-1', type: 'discount', label: 'Promo NEW10', amountCents: -550, sourceAddOnId: null }
      ],
      status: 'confirmed', subtotalCents: 5500, discountCents: 550, beforeTipCents: 4950,
      tipBasisPoints: 2000, tipCents: 990, totalCents: 5940, method: 'Zelle',
      createdAt: '2026-07-15T03:10:00.000Z'
    }],
    paymentProofs: [{
      id: 'proof-00000000-0000-4000-8000-000000000002', checkoutDraftId: 'checkout-00000000-0000-4000-8000-000000000001', businessId: 'bitcoin-nail-bar',
      method: 'Zelle', amountCents: 5940, status: 'verified', note: '', imageDataUrl: '',
      rejectReason: null, createdAt: '2026-07-15T03:12:00.000Z', verifiedAt: '2026-07-15T03:13:00.000Z'
    }],
    receipts: [{
      id: 'receipt-00000000-0000-4000-8000-000000000003', checkoutDraftId: 'checkout-00000000-0000-4000-8000-000000000001', businessId: 'bitcoin-nail-bar',
      method: 'Zelle', tipCents: 990, totalCents: 5940,
      lineItems: [
        { id: 'service-guest-checkin-1', type: 'service', label: 'Deluxe Pedicure', amountCents: 5500, sourceAddOnId: null },
        { id: 'promo-guest-checkin-1', type: 'discount', label: 'Promo NEW10', amountCents: -550, sourceAddOnId: null }
      ],
      createdAt: '2026-07-15T03:13:00.000Z'
    }],
    guestRewardClaims: [
      { id: 'guest-claim-visit_spend-00000000-0000-4000-8000-000000000004', guestCheckinId: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', sourceType: 'visit_spend', sourceId: 'proof-00000000-0000-4000-8000-000000000002', points: 55, status: 'pending', createdAt: '2026-07-15T03:13:00.000Z', claimedAt: null },
      { id: 'guest-claim-directpay_bonus-00000000-0000-4000-8000-000000000005', guestCheckinId: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', sourceType: 'directpay_bonus', sourceId: 'proof-00000000-0000-4000-8000-000000000002', points: 5, status: 'pending', createdAt: '2026-07-15T03:13:00.000Z', claimedAt: null },
      { id: 'guest-claim-tip_bonus-00000000-0000-4000-8000-000000000006', guestCheckinId: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', sourceType: 'tip_bonus', sourceId: 'proof-00000000-0000-4000-8000-000000000002', points: 9, status: 'pending', createdAt: '2026-07-15T03:13:00.000Z', claimedAt: null }
    ],
    referrals: [{
      id: 'referral-1', referrerId: 'cust-jessica', code: 'JESSICA50', friendPhone: '8325550117',
      status: 'rewarded', rewardPoints: 50, businessId: 'bitcoin-nail-bar',
      createdAt: '2026-07-15T02:50:00.000Z', joinedAt: '2026-07-15T03:00:00.000Z',
      rewardedAt: '2026-07-15T03:16:00.000Z'
    }]
  };
}

test('creates versioned Vietnamese demo state with per-business balances', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  assert.equal(state.schemaVersion, 2);
  assert.equal(state.profile.language, 'vi');
  assert.equal(state.balances['bitcoin-nail-bar'].points, 2450);
  assert.equal(state.balances['golden-glow-spa'].points, 600);
  assert.equal(state.balances['moon-coffee'].points, 120);
  assert.equal('pointBalance' in state, false);
});

test('migrates customer journey collections into schema v2 without changing the storage key', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    schemaVersion: 1,
    profile: { language: 'vi' },
    guestCheckins: [{
      id: 'guest-checkin-1', businessId: 'bitcoin-nail-bar', name: 'Amy Nguyen',
      phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-anna',
      station: 'front', sourceQr: 'https://nexoratouch.com/touch/bitcoin-nail-bar/front',
      status: 'checked_in', pointsPending: 120, scannedAt: '2026-07-15T03:04:42.000Z',
      claimedAt: null
    }]
  });

  assert.equal(api.STORAGE_KEY, 'nexora.customer.prototype.v1');
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.guestCheckins.length, 1);
  assert.deepEqual(migrated.checkoutDrafts, []);
  assert.deepEqual(migrated.paymentProofs, []);
  assert.deepEqual(migrated.receipts, []);
  assert.deepEqual(migrated.guestRewardClaims, []);
  assert.deepEqual(migrated.referrals, []);
});

test('drops malformed cross-surface customer records during migration', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    guestCheckins: [{ id: 'bad', businessId: 'unknown' }],
    checkoutDrafts: [{ id: 'bad', totalCents: -1 }],
    paymentProofs: [{ id: 'bad', status: 'verified' }],
    referrals: [{ id: 'bad', status: 'cash_paid' }]
  });
  assert.deepEqual(migrated.guestCheckins, []);
  assert.deepEqual(migrated.checkoutDrafts, []);
  assert.deepEqual(migrated.paymentProofs, []);
  assert.deepEqual(migrated.referrals, []);
});

test('customer journey invariant keeps one fully canonical cross-surface chain', () => {
  const { api } = testApi();
  const migrated = api.migrateState(customerJourneyFixture());

  assert.equal(migrated.guestCheckins.length, 1);
  assert.equal(migrated.checkoutDrafts.length, 1);
  assert.equal(migrated.paymentProofs.length, 1);
  assert.equal(migrated.receipts.length, 1);
  assert.equal(migrated.guestRewardClaims.length, 3);
  assert.equal(migrated.guestRewardClaims.every((claim) => claim.status === 'pending'), true);
  assert.equal(migrated.referrals.length, 1);
  assert.equal(migrated.referrals[0].status, 'rewarded');
});

test('customer journey invariant cascades a rejected parent through every descendant', () => {
  const { api } = testApi();
  const fixture = customerJourneyFixture();
  fixture.checkoutDrafts[0].createdAt = '2026-07-15T03:00:00.000Z';

  const migrated = api.migrateState(fixture);

  assert.equal(migrated.guestCheckins.length, 1);
  assert.equal(migrated.checkoutDrafts.length, 0);
  assert.equal(migrated.paymentProofs.length, 0);
  assert.equal(migrated.receipts.length, 0);
  assert.equal(migrated.guestRewardClaims.length, 0);
});

test('operations snapshot invariant defaults corrupt data, clones valid arrays and never writes', () => {
  const { api } = testApi();
  let raw = null;
  let setCalls = 0;
  const storage = {
    getItem(key) {
      assert.equal(key, api.OPERATIONS_STORAGE_KEY);
      return raw;
    },
    setItem() { setCalls += 1; }
  };
  const empty = { serviceTickets: [], addOnRequests: [], staffEligibility: [] };

  assert.equal(JSON.stringify(api.readOperationsSnapshot(storage)), JSON.stringify(empty));
  raw = '{broken';
  assert.equal(JSON.stringify(api.readOperationsSnapshot(storage)), JSON.stringify(empty));
  raw = JSON.stringify({
    schemaVersion: 1,
    serviceTickets: [{ id: 'ticket-1', detail: { status: 'ready' } }],
    addOnRequests: [{ id: 'addon-request-1' }],
    staffEligibility: [{ staffProfileId: 'staff-anna' }]
  });
  const first = api.readOperationsSnapshot(storage);
  first.serviceTickets[0].detail.status = 'mutated';
  const second = api.readOperationsSnapshot(storage);

  assert.equal(second.serviceTickets[0].detail.status, 'ready');
  assert.equal(second.addOnRequests[0].id, 'addon-request-1');
  assert.equal(second.staffEligibility[0].staffProfileId, 'staff-anna');
  assert.equal(setCalls, 0);
});

test('customer journey invariant never changes balances or ledger during migration', () => {
  const { api } = testApi();
  const persisted = api.createDefaultState();
  Object.assign(persisted, customerJourneyFixture());
  const balancesBefore = JSON.stringify(persisted.balances);
  const ledgerBefore = JSON.stringify(persisted.ledger);

  const migrated = api.migrateState(persisted);

  assert.equal(JSON.stringify(migrated.balances), balancesBefore);
  assert.equal(JSON.stringify(migrated.ledger), ledgerBefore);
  assert.equal(migrated.guestRewardClaims[0].status, 'pending');
});

test('customer journey invariant rejects null terminal methods and mismatched proof or receipt methods', () => {
  const { api } = testApi();
  for (const status of ['pending_verification', 'confirmed', 'rejected']) {
    const fixture = customerJourneyFixture();
    fixture.checkoutDrafts[0].status = status;
    fixture.checkoutDrafts[0].method = null;
    fixture.paymentProofs[0].status = status === 'confirmed' ? 'verified' : status;
    fixture.paymentProofs[0].verifiedAt = status === 'pending_verification'
      ? null
      : '2026-07-15T03:13:00.000Z';
    assert.equal(api.migrateState(fixture).checkoutDrafts.length, 0, status);
  }

  const proofMismatch = customerJourneyFixture();
  proofMismatch.paymentProofs[0].method = 'Venmo';
  const migratedProofMismatch = api.migrateState(proofMismatch);
  assert.equal(migratedProofMismatch.checkoutDrafts.length, 0);
  assert.equal(migratedProofMismatch.paymentProofs.length, 0);
  assert.equal(migratedProofMismatch.receipts.length, 0);
  assert.equal(migratedProofMismatch.guestRewardClaims.length, 0);

  const receiptMismatch = customerJourneyFixture();
  receiptMismatch.receipts[0].method = 'Venmo';
  const migratedReceiptMismatch = api.migrateState(receiptMismatch);
  assert.equal(migratedReceiptMismatch.checkoutDrafts.length, 0);
  assert.equal(migratedReceiptMismatch.paymentProofs.length, 0);
  assert.equal(migratedReceiptMismatch.receipts.length, 0);
  assert.equal(migratedReceiptMismatch.guestRewardClaims.length, 0);
});

test('customer journey invariant recalculates line items, totals and basis-point tips', () => {
  const { api } = testApi();
  const variants = [
    ['unknown line type', (checkout) => { checkout.lineItems[1].type = 'fee'; }],
    ['wrong service sign', (checkout) => { checkout.lineItems[0].amountCents = -5000; }],
    ['add-on source on service', (checkout) => { checkout.lineItems[0].sourceAddOnId = 'addon-request-fake'; }],
    ['subtotal mismatch', (checkout) => {
      checkout.subtotalCents = 6100;
      checkout.beforeTipCents = 5600;
      checkout.totalCents = 6700;
    }],
    ['discount mismatch', (checkout) => {
      checkout.discountCents = 400;
      checkout.beforeTipCents = 5600;
      checkout.totalCents = 6700;
    }],
    ['tip mismatch', (checkout) => {
      checkout.tipCents = 1000;
      checkout.totalCents = 6500;
    }]
  ];

  for (const [label, mutate] of variants) {
    const fixture = customerJourneyFixture();
    mutate(fixture.checkoutDrafts[0]);
    const migrated = api.migrateState(fixture);
    assert.equal(migrated.checkoutDrafts.length, 0, label);
    assert.equal(migrated.paymentProofs.length, 0, `${label}: proof`);
    assert.equal(migrated.receipts.length, 0, `${label}: receipt`);
    assert.equal(migrated.guestRewardClaims.length, 0, `${label}: claim`);
  }
});

test('customer journey invariant rejects reversed chronology at every lifecycle boundary', () => {
  const { api } = testApi();
  const variants = [
    ['checkout before scan', 'checkoutDrafts', (fixture) => {
      fixture.checkoutDrafts[0].createdAt = '2026-07-15T03:00:00.000Z';
    }],
    ['proof before checkout', 'paymentProofs', (fixture) => {
      fixture.paymentProofs[0].createdAt = '2026-07-15T03:09:00.000Z';
    }],
    ['verification before proof', 'paymentProofs', (fixture) => {
      fixture.paymentProofs[0].verifiedAt = '2026-07-15T03:11:00.000Z';
    }],
    ['receipt before verification', 'receipts', (fixture) => {
      fixture.receipts[0].createdAt = '2026-07-15T03:12:30.000Z';
    }],
    ['claim before verification', 'guestRewardClaims', (fixture) => {
      fixture.guestRewardClaims[0].createdAt = '2026-07-15T03:12:30.000Z';
    }],
    ['claim completion before creation', 'guestRewardClaims', (fixture) => {
      fixture.guestRewardClaims[0].status = 'claimed';
      fixture.guestRewardClaims[0].claimedAt = '2026-07-15T03:12:30.000Z';
    }],
    ['referral joins before invite', 'referrals', (fixture) => {
      fixture.referrals[0].joinedAt = '2026-07-15T02:40:00.000Z';
    }],
    ['referral rewards before join', 'referrals', (fixture) => {
      fixture.referrals[0].rewardedAt = '2026-07-15T02:55:00.000Z';
    }]
  ];

  for (const [label, collection, mutate] of variants) {
    const fixture = customerJourneyFixture();
    mutate(fixture);
    assert.equal(api.migrateState(fixture)[collection].length, 0, label);
  }
});

test('customer journey invariant accepts claims only from unique verified same-business proofs', () => {
  const { api } = testApi();

  const pending = customerJourneyFixture();
  pending.checkoutDrafts[0].status = 'pending_verification';
  pending.paymentProofs[0].status = 'pending_verification';
  pending.paymentProofs[0].verifiedAt = null;
  assert.equal(api.migrateState(pending).guestRewardClaims.length, 0, 'pending proof');

  const rejected = customerJourneyFixture();
  rejected.checkoutDrafts[0].status = 'rejected';
  rejected.paymentProofs[0].status = 'rejected';
  rejected.paymentProofs[0].rejectReason = 'Amount mismatch';
  assert.equal(api.migrateState(rejected).guestRewardClaims.length, 0, 'rejected proof');

  const fake = customerJourneyFixture();
  fake.guestRewardClaims[0].sourceId = 'proof-fake';
  assert.equal(api.migrateState(fake).guestRewardClaims.length, 0, 'fake proof');

  const fakeType = customerJourneyFixture();
  fakeType.guestRewardClaims[0].sourceType = 'cashback';
  assert.equal(api.migrateState(fakeType).guestRewardClaims.length, 0, 'fake source type');

  const wrongBusiness = customerJourneyFixture();
  wrongBusiness.guestRewardClaims[0].businessId = 'golden-glow-spa';
  assert.equal(api.migrateState(wrongBusiness).guestRewardClaims.length, 0, 'wrong business');

  const duplicate = customerJourneyFixture();
  duplicate.guestRewardClaims.push({
    ...duplicate.guestRewardClaims[0],
    id: 'guest-claim-visit_spend-00000000-0000-4000-8000-000000000099'
  });
  assert.equal(api.migrateState(duplicate).guestRewardClaims.length, 0, 'duplicate logical claim');
});

test('persists state and recovers corrupt JSON into a timestamped backup', () => {
  const { api, storage } = testApi();
  const state = api.createDefaultState();
  state.profile.name = 'Lan Nguyen';
  api.saveState(state, storage);
  assert.equal(api.loadState(storage).profile.name, 'Lan Nguyen');

  storage.setItem(api.STORAGE_KEY, '{broken');
  const recovered = api.loadState(storage, () => 1720936800000);
  assert.equal(recovered.profile.language, 'vi');
  assert.equal(storage.getItem(`${api.STORAGE_KEY}.corrupt.1720936800000`), '{broken');
});

test('migrates valid JSON with malformed fields into the known state schema', () => {
  const { api, storage } = testApi();
  const defaults = api.createDefaultState();
  storage.setItem(api.STORAGE_KEY, JSON.stringify({
    profile: null,
    balances: [],
    session: 'invalid',
    wishes: {},
    preferences: { nearbyDeals: 'yes', unknownPreference: true },
    ui: { overlay: [] },
    unknownRoot: true
  }));

  const migrated = api.loadState(storage);
  assert.equal(JSON.stringify(migrated.profile), JSON.stringify(defaults.profile));
  assert.equal(JSON.stringify(migrated.balances), JSON.stringify(defaults.balances));
  assert.equal(JSON.stringify(migrated.session), JSON.stringify(defaults.session));
  assert.equal(JSON.stringify(migrated.wishes), JSON.stringify(defaults.wishes));
  assert.equal(migrated.preferences.nearbyDeals, defaults.preferences.nearbyDeals);
  assert.equal(migrated.ui.overlay, null);
  assert.equal('unknownPreference' in migrated.preferences, false);
  assert.equal('unknownRoot' in migrated, false);
  assert.equal(Object.keys(storage.dump()).some((key) => key.includes('.corrupt.')), false);

  const knownUpdate = api.migrateState({ profile: { name: 'Lan Nguyen', language: 'fr', unknownProfile: true } });
  assert.equal(knownUpdate.profile.name, 'Lan Nguyen');
  assert.equal(knownUpdate.profile.language, 'vi');
  assert.equal('unknownProfile' in knownUpdate.profile, false);
});

test('sanitizes collection elements and preserves valid nullable unions', () => {
  const { api } = testApi();
  const validLedger = {
    id: 'led-valid', businessId: 'golden-glow-spa', type: 'visit', pointsDelta: 80,
    refType: 'visit', refId: 'visit-2002', createdAt: '2026-07-15T10:00:00.000Z', futureField: 'kept'
  };
  const validVisit = {
    id: 'visit-2002', businessId: 'golden-glow-spa', staffProfileId: 'staff-maria',
    occurredAt: '2026-07-15T09:00:00.000Z', futureField: 'kept'
  };
  const validTip = {
    id: 'tip-2002', businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna',
    amount: 10, status: 'pending', createdAt: '2026-07-15T09:30:00.000Z', confirmedAt: null
  };
  const migrated = api.migrateState({
    ledger: [{}, { ...validLedger, businessId: 42 }, validLedger],
    visits: [null, validVisit],
    tips: [{}, validTip],
    wishes: [null, 'Pedicure deal', 42],
    savedOfferIds: ['offer-glow', null],
    welcomeClaims: ['7135550199', {}],
    offlineQueue: ['checkin-1', false],
    balances: {
      'bitcoin-nail-bar': { expiringPoints: { amount: 50, date: '2026-09-01', unknown: true } },
      'golden-glow-spa': { expiringPoints: { amount: '50', date: '2026-09-01' } },
      'moon-coffee': { expiringPoints: null }
    },
    ui: { currentRewardKey: 'gel', overlay: { kind: 'notice' } }
  });

  assert.equal(migrated.ledger.length, 1);
  assert.equal(migrated.ledger[0].businessId, 'golden-glow-spa');
  assert.equal(migrated.ledger[0].futureField, 'kept');
  assert.equal(migrated.visits.length, 1);
  assert.equal(migrated.visits[0].futureField, 'kept');
  assert.equal(migrated.tips.length, 1);
  assert.equal(JSON.stringify(migrated.wishes), JSON.stringify(['Pedicure deal']));
  assert.equal(JSON.stringify(migrated.savedOfferIds), JSON.stringify(['offer-glow']));
  assert.equal(JSON.stringify(migrated.welcomeClaims), JSON.stringify(['7135550199']));
  assert.equal(JSON.stringify(migrated.offlineQueue), JSON.stringify([]));
  assert.equal(JSON.stringify(migrated.balances['bitcoin-nail-bar'].expiringPoints), JSON.stringify({ amount: 50, date: '2026-09-01' }));
  assert.equal(migrated.balances['golden-glow-spa'].expiringPoints, null);
  assert.equal(migrated.balances['moon-coffee'].expiringPoints, null);
  assert.equal(migrated.ui.currentRewardKey, 'gel');
  assert.equal(JSON.stringify(migrated.ui.overlay), JSON.stringify({ kind: 'notice' }));

  const invalidUnions = api.migrateState({
    balances: { 'bitcoin-nail-bar': { expiringPoints: { amount: Infinity, date: 7 } } },
    ui: { currentRewardKey: 7, overlay: [] }
  });
  assert.equal(invalidUnions.balances['bitcoin-nail-bar'].expiringPoints, null);
  assert.equal(invalidUnions.ui.currentRewardKey, null);
  assert.equal(invalidUnions.ui.overlay, null);
});

test('fails closed for negative or malformed persisted balances', () => {
  const { api } = testApi();
  const defaults = api.createDefaultState();
  const migrated = api.migrateState({
    balances: {
      'bitcoin-nail-bar': { points: -10, credits: -2, expiringPoints: { amount: -1, date: '2026-09-01' } },
      'golden-glow-spa': { points: Number.NaN, credits: 'bad', expiringPoints: { amount: 10, date: '' } }
    }
  });
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, defaults.balances['bitcoin-nail-bar'].points);
  assert.equal(migrated.balances['bitcoin-nail-bar'].credits, defaults.balances['bitcoin-nail-bar'].credits);
  assert.equal(migrated.balances['bitcoin-nail-bar'].expiringPoints, null);
  assert.equal(migrated.balances['golden-glow-spa'].points, defaults.balances['golden-glow-spa'].points);
  assert.equal(migrated.balances['golden-glow-spa'].credits, defaults.balances['golden-glow-spa'].credits);
  assert.equal(migrated.balances['golden-glow-spa'].expiringPoints, null);
});

test('validates US phone and enforces OTP cooldown plus lockout', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.normalizeUsPhone('(832) 555-0148'), '8325550148');
  assert.equal(api.requestOtp(app, '123', 1000).ok, false);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 1000).ok, true);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 2000).code, 'cooldown');
  for (let attempt = 0; attempt < 5; attempt += 1) api.verifyOtp(app, '111111', 31000 + attempt);
  assert.ok(app.session.lockedUntil > 31004);
  assert.equal(api.verifyOtp(app, '246810', 32000).code, 'locked');
});

test('treats an OTP requested at epoch zero as active cooldown and persists it', () => {
  const { api, storage } = testApi();
  const app = api.createDefaultState();
  assert.equal(app.session.otpRequestedAt, null);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 0).ok, true);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 1).code, 'cooldown');

  api.saveState(app, storage);
  assert.equal(api.loadState(storage).session.otpRequestedAt, 0);
  assert.equal(api.migrateState({ session: { otpRequestedAt: '0' } }).session.otpRequestedAt, null);
});

test('resets expired OTP lockout before counting a new failed attempt', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  api.requestOtp(app, '(832) 555-0148', 1000);
  for (let attempt = 0; attempt < 5; attempt += 1) api.verifyOtp(app, '111111', 31000 + attempt);
  const afterLock = app.session.lockedUntil + 1;

  const result = api.verifyOtp(app, '111111', afterLock);
  assert.equal(result.code, 'invalid_code');
  assert.equal(app.session.otpAttempts, 1);
  assert.equal(app.session.lockedUntil, 0);
});

test('records consent decisions without making marketing a condition of points', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  api.recordConsent(app, 'business:bitcoin-nail-bar', 'revoke', 'onboarding_skip', 1000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(app.consents.at(-1).action, 'revoke');
  assert.equal(app.consents.at(-1).confirmedAt, null);
  api.setBusinessMarketing(app, 'bitcoin-nail-bar', true, 1500);
  assert.equal(app.preferences.businessMarketing['bitcoin-nail-bar'], true);
  api.setPreference(app, 'aiSuggestions', false, 2000);
  assert.equal(app.preferences.aiSuggestions, false);
  assert.equal(app.consents.at(-1).scope, 'aiSuggestions');

  assert.equal(api.setPreference(app, 'businessMarketing', false, 2500).code, 'unknown_preference');
  assert.equal(typeof app.preferences.businessMarketing, 'object');
});

test('rejects invalid consent timestamps without mutating consent history', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app);

  const result = api.recordConsent(app, 'networkOffers', 'grant', 'preferences', Infinity);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'invalid_time');
  assert.equal(JSON.stringify(app), before);
});

test('keeps single preference toggles atomic when consent ID generation fails', () => {
  const { api } = testApi({}, { randomUUID: () => { throw new Error('uuid unavailable'); } });
  const app = api.createDefaultState();
  const beforePreference = JSON.stringify(app);

  const preferenceResult = api.setPreference(app, 'aiSuggestions', false, 2000);
  assert.equal(preferenceResult.ok, false);
  assert.equal(preferenceResult.code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), beforePreference);

  const beforeBusiness = JSON.stringify(app);
  const businessResult = api.setBusinessMarketing(app, 'bitcoin-nail-bar', true, 2000);
  assert.equal(businessResult.ok, false);
  assert.equal(businessResult.code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), beforeBusiness);
});

test('stages canonical consent scopes and grants only pending scopes after SMS confirmation', () => {
  const { api } = testApi();
  const app = api.createDefaultState();

  assert.equal(api.stageConsentScopes(app, ['networkOffers']).ok, true);
  assert.equal(app.preferences.networkOffers, false);
  assert.equal(app.preferences.businessMarketing['bitcoin-nail-bar'], false);
  assert.equal(app.consents.length, 0);
  assert.equal(JSON.stringify(app.ui.pendingContext.consentScopes), JSON.stringify(['networkOffers']));

  const confirmed = api.confirmPendingConsent(app, 2000);
  assert.equal(confirmed.ok, true);
  assert.equal(app.preferences.networkOffers, true);
  assert.equal(app.preferences.businessMarketing['bitcoin-nail-bar'], false);
  assert.equal(app.consents.length, 1);
  assert.equal(app.consents[0].scope, 'networkOffers');
  assert.equal(app.consents[0].method, 'sms_y');
  assert.equal(app.consents[0].confirmedAt, '1970-01-01T00:00:02.000Z');
  assert.equal('consentScopes' in app.ui.pendingContext, false);
});

test('keeps multi-scope confirmation atomic when the second consent ID fails', () => {
  let uuidCall = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCall += 1;
      if (uuidCall === 2) throw new Error('second UUID unavailable');
      return '00000000-0000-4000-8000-000000000001';
    }
  });
  const app = api.createDefaultState();
  api.stageConsentScopes(app, ['business:bitcoin-nail-bar', 'networkOffers']);
  const before = JSON.stringify(app);

  const result = api.confirmPendingConsent(app, 2000);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), before);
});

test('keeps onboarding skip atomic when the second consent ID fails', () => {
  let uuidCall = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCall += 1;
      if (uuidCall === 2) throw new Error('second UUID unavailable');
      return '00000000-0000-4000-8000-000000000001';
    }
  });
  const app = api.createDefaultState();
  app.preferences.businessMarketing['bitcoin-nail-bar'] = true;
  app.preferences.networkOffers = true;
  app.ui.pendingContext.consentScopes = ['networkOffers'];
  const before = JSON.stringify(app);

  const result = api.skipPendingConsent(app, 2000);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), before);
});

test('handles failed preference and skip results in the UI without navigating or showing success', () => {
  const source = html();
  const skipAction = source.match(/registerAction\('skip-consent',[\s\S]*?registerAction\('confirm-double-opt-in'/)?.[0];
  const changeHandler = source.match(/function handleChange\(event\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*function handleKeydown/)?.[1];
  assert.ok(skipAction, 'skip action must be registered');
  assert.ok(changeHandler, 'change handler must be available');
  assert.match(skipAction, /const result = commitState/);
  assert.match(skipAction, /if \(!result\.ok\)[\s\S]*?showToast\([\s\S]*?['"]error['"][\s\S]*?return/);
  assert.ok(skipAction.indexOf('if (!result.ok)') < skipAction.indexOf("navigateTo('onb4')"));
  assert.ok((changeHandler.match(/if \(!result\.ok\)/g) || []).length >= 2);
  assert.match(changeHandler, /preferenceSaveFailed/);
});

test('round-trips only canonical pending consent scopes through migration', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    ui: { pendingContext: { consentScopes: ['networkOffers', 'legacyNetwork', 'business:bitcoin-nail-bar', 7] } }
  });

  assert.equal(
    JSON.stringify(migrated.ui.pendingContext.consentScopes),
    JSON.stringify(['networkOffers', 'business:bitcoin-nail-bar'])
  );
});

test('canonicalizes legacy network consent records without losing history or duplicating entries', () => {
  const legacyConsents = [
    {
      id: 'consent-legacy-grant', scope: 'network', action: 'grant', method: 'sms_y',
      createdAt: '2026-07-01T08:00:00.000Z', confirmedAt: '2026-07-01T08:00:00.000Z', auditSource: 'legacy-v0'
    },
    {
      id: 'consent-legacy-revoke', scope: 'network', action: 'revoke', method: 'preferences',
      createdAt: '2026-07-02T09:30:00.000Z', confirmedAt: null, auditSource: 'legacy-v0'
    }
  ];
  const { api, storage } = testApi({
    'nexora.customer.prototype.v1': JSON.stringify({ consents: legacyConsents })
  });

  const loaded = api.loadState(storage);
  assert.equal(loaded.consents.length, 2);
  assert.deepEqual(loaded.consents.map(({ scope }) => scope), ['networkOffers', 'networkOffers']);
  assert.equal(loaded.consents[0].confirmedAt, legacyConsents[0].confirmedAt);
  assert.equal(loaded.consents[1].createdAt, legacyConsents[1].createdAt);
  assert.equal(loaded.consents[1].auditSource, 'legacy-v0');

  api.saveState(loaded, storage);
  const reloaded = api.loadState(storage);
  const remigrated = api.migrateState(reloaded);
  assert.equal(remigrated.consents.length, 2);
  assert.deepEqual(remigrated.consents.map(({ id }) => id), legacyConsents.map(({ id }) => id));
  assert.deepEqual(remigrated.consents.map(({ action }) => action), ['grant', 'revoke']);
  assert.deepEqual(remigrated.consents.map(({ scope }) => scope), ['networkOffers', 'networkOffers']);
});

test('prevents a welcome gift from being claimed twice or by an existing account', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  assert.equal(api.claimWelcomeGift(app, '(832) 555-0148', 40000).code, 'existing_account');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(api.claimWelcomeGift(app, '(713) 555-0199', 80000).ok, true);
  assert.equal(api.claimWelcomeGift(app, '(713) 555-0199', 120000).code, 'already_claimed');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 25);
  assert.equal(app.ledger.filter((entry) => entry.refId === 'welcome-7135550199').length, 1);
});

test('rejects invalid welcome timestamps without partially mutating state', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app);

  const result = api.claimWelcomeGift(app, '(713) 555-0199', Infinity);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'invalid_time');
  assert.equal(JSON.stringify(app), before);
});

test('fails closed on malformed welcome-gift balances before UUID, OTP or claim mutation', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, { randomUUID: () => {
    uuidCalls += 1;
    return '00000000-0000-4000-8000-000000000077';
  } });
  const malformedBalances = [
    { points: -1, credits: 0, expiringPoints: null },
    { points: '2450', credits: 0, expiringPoints: null },
    { points: 2450, credits: 'bad', expiringPoints: null },
    { points: 2450, credits: 0, expiringPoints: { amount: 25, date: 'not-a-date' } },
    null
  ];
  malformedBalances.forEach((balance) => {
    const app = api.createDefaultState();
    app.balances['bitcoin-nail-bar'] = balance;
    const before = JSON.stringify(app);
    const result = api.claimWelcomeGift(app, '(713) 555-0199', 40000);
    assert.equal(result.code, 'invalid_balance');
    assert.equal(JSON.stringify(app), before);
  });
  assert.equal(uuidCalls, 0);
});

test('keeps welcome state atomic when UUID generation throws', () => {
  const { api } = testApi({}, { randomUUID: () => { throw new Error('uuid unavailable'); } });
  const app = api.createDefaultState();
  const before = JSON.stringify(app);

  const result = api.claimWelcomeGift(app, '(713) 555-0199', 40000);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), before);
});

test('requests a fresh OTP before routing an existing account to verification', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  app.session.otpRequestedAt = null;

  const result = api.requestExistingAccountOtp(app, '(832) 555-0148', 5000);
  assert.equal(result.ok, true);
  assert.equal(result.code, 'existing_account');
  assert.equal(app.session.phone, '8325550148');
  assert.equal(app.session.otpRequestedAt, 5000);
  assert.equal(api.requestExistingAccountOtp(app, '(832) 555-0148', 5001).code, 'cooldown');
});

test('stages scanning before confirmation and wires existing-account OTP before login2', () => {
  const source = html();
  const scanAction = source.match(/registerAction\('start-scan',[\s\S]*?registerAction\('enter-code'/)?.[0];
  assert.ok(scanAction, 'start-scan action must be available');
  assert.match(scanAction, /stageSalonScan/);
  assert.doesNotMatch(scanAction, /submitCheckin/);

  const claimAction = source.match(/registerAction\('claim-welcome',[\s\S]*?registerAction\('accept-consent'/)?.[0];
  assert.ok(claimAction, 'claim welcome action must be registered');
  assert.match(claimAction, /requestExistingAccountOtp/);
  assert.ok(claimAction.indexOf('requestExistingAccountOtp') < claimAction.indexOf("navigateTo('login2')"));
});

test('round-trips valid consent preferences and welcome claims through migration', () => {
  const { api, storage } = testApi();
  const app = api.createDefaultState();
  api.setBusinessMarketing(app, 'bitcoin-nail-bar', true, 1000);
  api.setPreference(app, 'aiSuggestions', false, 2000);
  api.claimWelcomeGift(app, '(713) 555-0199', 40000);
  app.consents.push({ id: '', scope: 7, action: 'grant' });
  api.saveState(app, storage);

  const loaded = api.loadState(storage);
  assert.equal(loaded.preferences.businessMarketing['bitcoin-nail-bar'], true);
  assert.equal(loaded.preferences.aiSuggestions, false);
  assert.equal(JSON.stringify(loaded.welcomeClaims), JSON.stringify(['7135550199']));
  assert.equal(loaded.consents.length, 2);
  assert.equal(loaded.consents[0].createdAt, '1970-01-01T00:00:01.000Z');
  assert.equal(loaded.ledger.filter((entry) => entry.refId === 'welcome-7135550199').length, 1);
});

test('round-trips marketing preferences for every known business', () => {
  const { api, storage } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.setBusinessMarketing(app, 'golden-glow-spa', true, 1000).ok, true);
  api.saveState(app, storage);

  const loaded = api.loadState(storage);
  assert.equal(loaded.preferences.businessMarketing['golden-glow-spa'], true);
  assert.equal(loaded.consents.at(-1).scope, 'business:golden-glow-spa');
});

test('redeems from the source business only and is idempotent', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const glowBefore = app.balances['golden-glow-spa'].points;
  const first = api.redeemReward(app, 'credit5', 'redeem-click-1', 1000);
  const second = api.redeemReward(app, 'credit5', 'redeem-click-1', 2000);
  assert.equal(first.ok, true);
  assert.equal(second.redemption.id, first.redemption.id);
  assert.equal(app.balances['bitcoin-nail-bar'].points, 1950);
  assert.equal(app.balances['golden-glow-spa'].points, glowBefore);
  assert.equal(app.ledger.filter((entry) => entry.refId === first.redemption.id).length, 1);
});

test('rejects a reward when its source balance is insufficient', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const redemptionsBefore = app.redemptions.length;
  app.balances['bitcoin-nail-bar'].points = 100;
  const result = api.redeemReward(app, 'credit5', 'redeem-click-2', 1000);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'insufficient_points');
  assert.equal(app.balances['bitcoin-nail-bar'].points, 100);
  assert.equal(app.redemptions.length, redemptionsBefore);
  app.balances['bitcoin-nail-bar'].points = 1000;
  app.businesses['moon-coffee'].allianceId = 'other-alliance';
  assert.equal(api.redeemReward(app, 'moon', 'redeem-click-3', 2000).code, 'not_same_alliance');
  assert.equal(api.redeemReward(app, '__proto__', 'redeem-click-4', 3000).code, 'unknown_reward');
});

test('rejects blank and conflicting idempotency keys without mutating rewards', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const beforeBlank = JSON.stringify(app);
  assert.equal(api.redeemReward(app, 'credit5', '   ', 1000).code, 'invalid_idempotency_key');
  assert.equal(JSON.stringify(app), beforeBlank);

  const first = api.redeemReward(app, 'credit5', 'redeem-click-conflict', 1000);
  assert.equal(first.ok, true);
  const beforeConflict = JSON.stringify(app);
  const conflict = api.redeemReward(app, 'freepedi', 'redeem-click-conflict', 2000);
  assert.equal(conflict.ok, false);
  assert.equal(conflict.code, 'idempotency_conflict');
  assert.equal(JSON.stringify(app), beforeConflict);
});

test('rejects noncanonical idempotent runtime state without another debit', () => {
  const { api } = testApi();
  const logicalConflict = api.createDefaultState();
  const voucher = api.redeemReward(logicalConflict, 'voucher25', 'logical-runtime-key', 1000);
  assert.equal(voucher.ok, true);
  voucher.redemption.idempotencyKey = ' logical-runtime-key ';
  const beforeConflict = JSON.stringify(logicalConflict);
  const conflict = api.redeemReward(logicalConflict, 'credit5', 'logical-runtime-key', 2000);
  assert.equal(conflict.ok, false);
  assert.equal(conflict.code, 'idempotency_conflict');
  assert.equal(JSON.stringify(logicalConflict), beforeConflict);

  const catalogMismatch = api.createDefaultState();
  const credit = api.redeemReward(catalogMismatch, 'credit5', 'catalog-runtime-key', 1000);
  assert.equal(credit.ok, true);
  credit.redemption.cost = 501;
  catalogMismatch.ledger.find((entry) => entry.refId === credit.redemption.id).pointsDelta = -501;
  const beforeMismatch = JSON.stringify(catalogMismatch);
  const retry = api.redeemReward(catalogMismatch, 'credit5', 'catalog-runtime-key', 2000);
  assert.equal(retry.ok, false);
  assert.equal(retry.code, 'invalid_state');
  assert.equal(JSON.stringify(catalogMismatch), beforeMismatch);
});

test('keeps ledger writes atomic for invalid input and ID generation failures', () => {
  const { api } = testApi({}, { randomUUID: () => { throw new Error('uuid unavailable'); } });
  const app = api.createDefaultState();
  const before = JSON.stringify(app);

  assert.equal(api.appendLedger(app, {
    businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: Infinity,
    refType: 'visit', refId: 'visit-invalid', now: 1000
  }).code, 'invalid_points_delta');
  assert.equal(JSON.stringify(app), before);
  assert.equal(api.appendLedger(app, {
    businessId: 'missing-business', type: 'visit', pointsDelta: 10,
    refType: 'visit', refId: 'visit-missing', now: 1000
  }).code, 'unknown_business');
  assert.equal(JSON.stringify(app), before);
  assert.equal(api.appendLedger(app, {
    businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: 10,
    refType: 'visit', refId: 'visit-null-time', now: null
  }).code, 'invalid_time');
  assert.equal(JSON.stringify(app), before);
  assert.equal(api.appendLedger(app, {
    businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: 10,
    refType: 'visit', refId: 'visit-uuid', now: 1000
  }).code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), before);
});

test('precomputes reward and ledger metadata before mutating redemption state', () => {
  let uuidCall = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCall += 1;
      if (uuidCall === 2) throw new Error('ledger UUID unavailable');
      return `00000000-0000-4000-8000-00000000000${uuidCall}`;
    }
  });
  const app = api.createDefaultState();
  const before = JSON.stringify(app);

  const result = api.redeemReward(app, 'credit5', 'reward-atomic', 1000);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), before);

  const invalidTime = api.redeemReward(app, 'credit5', 'reward-invalid-time', 9e15);
  assert.equal(invalidTime.ok, false);
  assert.equal(invalidTime.code, 'invalid_time');
  assert.equal(JSON.stringify(app), before);
});

test('returns domain results for rewards with missing businesses or alliance data', () => {
  const { api } = testApi();
  const missingBusiness = api.createDefaultState();
  delete missingBusiness.businesses['golden-glow-spa'];
  assert.equal(api.redeemReward(missingBusiness, 'glow', 'missing-business', 1000).code, 'unknown_business');

  const missingAlliance = api.createDefaultState();
  missingAlliance.businesses['golden-glow-spa'].allianceId = '';
  assert.equal(api.redeemReward(missingAlliance, 'glow', 'missing-alliance', 1000).code, 'invalid_alliance');
});

test('awards tip points only after confirmation and only once', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  assert.equal(api.createTip(app, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', staffName: 'Forged',
    amount: 10, method: 'Cash App', note: ''
  }, 500).code, 'method_disabled');
  const pending = api.createTip(app, {
    businessId: ' bitcoin-nail-bar ', staffProfileId: ' staff-anna ', staffName: 'Forged',
    amount: '10.00', method: ' Venmo ', note: 'Cảm ơn'
  }, 1000);

  assert.equal(pending.ok, true);
  assert.equal(pending.tip.staffName, 'Anna');
  assert.equal(pending.tip.tipMultiplier, 10);
  assert.equal(pending.tip.status, 'pending');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  app.businesses['bitcoin-nail-bar'].tipMultiplier = 99;

  const confirmed = api.confirmTipRecord(app, pending.tip.id, 2000);
  const retry = api.confirmTipRecord(app, pending.tip.id, 3000);
  assert.equal(confirmed.points, 100);
  assert.equal(retry.idempotent, true);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 100);
  assert.equal(app.ledger.filter((entry) => entry.refId === pending.tip.id).length, 1);
});

test('rejects tip and direct-payment confirmations from negative or malformed balances', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, { randomUUID: () => `00000000-0000-4000-8000-${String(++uuidCalls).padStart(12, '0')}` });
  const tipState = api.createDefaultState();
  const tip = api.createTip(tipState, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 1000);
  assert.equal(tip.ok, true);
  tipState.balances['bitcoin-nail-bar'].points = -1;
  const tipBefore = JSON.stringify(tipState);
  assert.equal(api.confirmTipRecord(tipState, tip.tip.id, 2000).code, 'invalid_balance');
  assert.equal(JSON.stringify(tipState), tipBefore);

  const paymentState = api.createDefaultState();
  const payment = api.createDirectPayment(paymentState, {
    businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
  }, 1000);
  assert.equal(payment.ok, true);
  paymentState.balances['bitcoin-nail-bar'] = { points: 'bad', credits: 0, expiringPoints: null };
  const paymentBefore = JSON.stringify(paymentState);
  assert.equal(api.confirmDirectPayment(paymentState, payment.payment.id, 2000).code, 'invalid_balance');
  assert.equal(JSON.stringify(paymentState), paymentBefore);
});

test('awards spend and direct-pay bonus only after salon confirms', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  assert.equal(api.createDirectPayment(app, {
    businessId: 'bitcoin-nail-bar', amount: 55, method: 'PayPal'
  }, 500).code, 'method_disabled');
  const pending = api.createDirectPayment(app, {
    businessId: ' bitcoin-nail-bar ', amount: '55.00', method: ' Zelle '
  }, 1000);

  assert.equal(pending.ok, true);
  assert.equal(pending.payment.directPayBonusPct, 20);
  assert.equal(pending.payment.status, 'pending');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  app.businesses['bitcoin-nail-bar'].directPayBonusPct = 90;

  const confirmed = api.confirmDirectPayment(app, pending.payment.id, 2000);
  const retry = api.confirmDirectPayment(app, pending.payment.id, 3000);
  assert.deepEqual([confirmed.spendPoints, confirmed.bonusPoints], [55, 11]);
  assert.equal(retry.idempotent, true);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 66);
  assert.equal(app.ledger.filter((entry) => entry.refId === pending.payment.id).length, 2);
});

test('rejects noncanonical transaction inputs before mutating state', () => {
  const { api } = testApi();
  const invalidInputs = [
    () => api.createTip(app, { businessId: 'missing', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo' }, 1000),
    () => api.createTip(app, { businessId: 'golden-glow-spa', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo' }, 1000),
    () => api.createTip(app, { businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 1.001, method: 'Venmo' }, 1000),
    () => api.createTip(app, { businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo' }, 9e15),
    () => api.createDirectPayment(app, { businessId: 'missing', amount: 55, method: 'Zelle' }, 1000),
    () => api.createDirectPayment(app, { businessId: 'bitcoin-nail-bar', amount: Infinity, method: 'Zelle' }, 1000),
    () => api.createDirectPayment(app, { businessId: 'bitcoin-nail-bar', amount: 55, method: 'PayPal' }, 1000),
    () => api.createDirectPayment(app, { businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle' }, null)
  ];
  const app = api.createDefaultState();
  invalidInputs.forEach((invoke) => {
    const before = JSON.stringify(app);
    assert.equal(invoke().ok, false);
    assert.equal(JSON.stringify(app), before);
  });

  const malformedUuid = testApi({}, { randomUUID: () => 'not-a-uuid' });
  const malformedState = malformedUuid.api.createDefaultState();
  const beforeUuid = JSON.stringify(malformedState);
  assert.equal(malformedUuid.api.createTip(malformedState, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 1000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(malformedState), beforeUuid);
});

test('canonicalizes persisted staff identity before creating a tip', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    staffProfiles: {
      'staff-anna': { id: 'forged-staff-id', name: 'Canonical Anna' }
    }
  });

  assert.equal(migrated.staffProfiles['staff-anna'].id, 'staff-anna');
  const result = api.createTip(migrated, {
    businessId: 'bitcoin-nail-bar',
    staffProfileId: 'staff-anna',
    staffName: '<img src=x onerror=alert(1)>',
    amount: 10,
    method: 'Venmo'
  }, 1000);
  assert.equal(result.ok, true);
  assert.equal(result.tip.staffName, 'Canonical Anna');
});

test('keeps tip and direct-payment confirmations atomic when ledger IDs fail', () => {
  let tipUuidCall = 0;
  const tipApi = testApi({}, {
    randomUUID: () => {
      tipUuidCall += 1;
      if (tipUuidCall === 2) throw new Error('tip ledger UUID unavailable');
      return `00000000-0000-4000-8000-00000000000${tipUuidCall}`;
    }
  }).api;
  const tipState = tipApi.createDefaultState();
  const pendingTip = tipApi.createTip(tipState, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 1000);
  const tipBefore = JSON.stringify(tipState);
  assert.equal(tipApi.confirmTipRecord(tipState, pendingTip.tip.id, 2000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(tipState), tipBefore);

  let paymentUuidCall = 0;
  const paymentApi = testApi({}, {
    randomUUID: () => {
      paymentUuidCall += 1;
      if (paymentUuidCall === 3) throw new Error('bonus ledger UUID unavailable');
      return `00000000-0000-4000-8000-00000000000${paymentUuidCall}`;
    }
  }).api;
  const paymentState = paymentApi.createDefaultState();
  const pendingPayment = paymentApi.createDirectPayment(paymentState, {
    businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
  }, 1000);
  const paymentBefore = JSON.stringify(paymentState);
  assert.equal(paymentApi.confirmDirectPayment(paymentState, pendingPayment.payment.id, 2000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(paymentState), paymentBefore);
});

test('rejects broken confirmed transaction relationships on idempotent retries', () => {
  let uuidCall = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCall += 1;
      return `00000000-0000-4000-8000-${String(uuidCall).padStart(12, '0')}`;
    }
  });

  const tipState = api.createDefaultState();
  const tip = api.createTip(tipState, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 1000).tip;
  api.confirmTipRecord(tipState, tip.id, 2000);
  tipState.ledger.find((entry) => entry.refId === tip.id).pointsDelta = 101;
  const tipBefore = JSON.stringify(tipState);
  assert.equal(api.confirmTipRecord(tipState, tip.id, 3000).code, 'invalid_state');
  assert.equal(JSON.stringify(tipState), tipBefore);

  const paymentState = api.createDefaultState();
  const payment = api.createDirectPayment(paymentState, {
    businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
  }, 1000).payment;
  api.confirmDirectPayment(paymentState, payment.id, 2000);
  paymentState.ledger.find((entry) => entry.refId === payment.id && entry.type === 'directpay_bonus').refType = 'tip';
  const paymentBefore = JSON.stringify(paymentState);
  assert.equal(api.confirmDirectPayment(paymentState, payment.id, 3000).code, 'invalid_state');
  assert.equal(JSON.stringify(paymentState), paymentBefore);
});

test('round-trips rule snapshots and reconciles transaction ledger pairs without touching rewards', () => {
  let uuidCall = 0;
  const { api, storage } = testApi({}, {
    randomUUID: () => {
      uuidCall += 1;
      return `00000000-0000-4000-8000-${String(uuidCall).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const tip = api.createTip(app, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 1000).tip;
  const payment = api.createDirectPayment(app, {
    businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
  }, 1100).payment;
  api.confirmTipRecord(app, tip.id, 2000);
  api.confirmDirectPayment(app, payment.id, 2100);
  const reward = rewardPair({
    redemption: { id: 'task5-reward', idempotencyKey: 'task5-reward' },
    ledger: { id: 'task5-reward-ledger' }
  });
  app.redemptions = [reward.redemption];
  app.ledger.push(
    reward.ledger,
    { ...app.ledger.find((entry) => entry.refId === tip.id), id: 'duplicate-tip-ledger' },
    {
      id: 'orphan-direct-ledger', businessId: 'bitcoin-nail-bar', type: 'directpay_bonus',
      pointsDelta: 999, refType: 'direct_payment', refId: 'missing-payment',
      createdAt: '2026-07-14T10:00:00.000Z'
    }
  );
  app.tips.push({ ...tip });

  const migrated = api.migrateState(app);
  assert.equal(migrated.tips.length, 1);
  assert.equal(migrated.directPayments.length, 1);
  assert.equal(migrated.tips[0].tipMultiplier, 10);
  assert.equal(migrated.directPayments[0].directPayBonusPct, 20);
  assert.equal(migrated.ledger.filter((entry) => entry.refId === tip.id).length, 1);
  assert.equal(migrated.ledger.filter((entry) => entry.refId === payment.id).length, 2);
  assert.equal(migrated.redemptions.length, 1);
  assert.equal(migrated.ledger.some((entry) => entry.id === reward.ledger.id), true);
  assert.equal(migrated.ledger.some((entry) => entry.id === 'orphan-direct-ledger'), false);

  api.saveState(migrated, storage);
  const loaded = api.loadState(storage);
  loaded.businesses['bitcoin-nail-bar'].tipMultiplier = 70;
  loaded.businesses['bitcoin-nail-bar'].directPayBonusPct = 70;
  assert.equal(api.confirmTipRecord(loaded, tip.id, 3000).points, 100);
  assert.deepEqual(
    [api.confirmDirectPayment(loaded, payment.id, 3000).spendPoints, api.confirmDirectPayment(loaded, payment.id, 3000).bonusPoints],
    [55, 11]
  );
});

test('prefers a valid transaction relation over a malformed duplicate ledger ID regardless of input order', () => {
  let uuidCall = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCall += 1;
      return `00000000-0000-4000-8000-${String(uuidCall).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const tip = api.createTip(app, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 1000).tip;
  const confirmedTip = api.confirmTipRecord(app, tip.id, 2000).tip;
  const validLedger = app.ledger.find((entry) => entry.refId === tip.id);
  const unrelatedLedger = app.ledger.filter((entry) => entry !== validLedger);
  const malformedDuplicate = {
    ...validLedger,
    businessId: 'golden-glow-spa',
    pointsDelta: 999
  };

  for (const relations of [
    [malformedDuplicate, validLedger],
    [validLedger, malformedDuplicate]
  ]) {
    const migrated = api.migrateState({
      ...app,
      tips: [confirmedTip],
      ledger: [...relations, ...unrelatedLedger]
    });
    assert.equal(migrated.tips.length, 1);
    assert.equal(migrated.ledger.filter((entry) => entry.refId === tip.id).length, 1);
    assert.equal(migrated.ledger.find((entry) => entry.refId === tip.id).businessId, 'bitcoin-nail-bar');
    assert.equal(migrated.redemptions.length, 1);
    assert.equal(migrated.ledger.some((entry) => entry.refId === 'red-demo'), true);
  }
});

function replayedPendingTransactionFixture(kind, claimVariant) {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const isTip = kind === 'tip';
  const created = isTip
    ? api.createTip(app, {
        businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
      }, 1000).tip
    : api.createDirectPayment(app, {
        businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
      }, 1000).payment;
  const collection = isTip ? 'tips' : 'directPayments';
  const contextKey = isTip ? 'tipId' : 'paymentId';
  const refType = isTip ? 'tip' : 'direct_payment';

  if (claimVariant === 'valid_reordered_duplicate') {
    const confirmed = isTip
      ? api.confirmTipRecord(app, created.id, 2000).tip
      : api.confirmDirectPayment(app, created.id, 2000).payment;
    app[collection] = [{ ...confirmed, status: 'pending', confirmedAt: null }];
    const linked = app.ledger.filter((entry) => entry.refId === created.id).reverse();
    const unrelated = app.ledger.filter((entry) => entry.refId !== created.id);
    app.ledger = [
      { refType, refId: ` ${created.id} ` },
      ...linked,
      { refType, refId: created.id },
      ...unrelated
    ];
  } else if (typeof claimVariant === 'object' && claimVariant !== null) {
    app.ledger = [
      {
        id: `raw-${kind}-type-claim`,
        businessId: 'golden-glow-spa',
        pointsDelta: 999,
        refId: ` ${created.id} `,
        createdAt: '2026-07-14T10:50:00.000Z',
        ...claimVariant
      },
      ...app.ledger
    ];
  } else {
    app.ledger = [
      { refType, refId: created.id },
      {
        id: `malformed-${kind}-claim`, businessId: 'golden-glow-spa', type: 'wrong_type',
        pointsDelta: 999, refType, refId: ` ${created.id} `, createdAt: 'not-a-time'
      },
      ...app.ledger
    ];
  }

  const balanceBefore = app.balances['bitcoin-nail-bar'].points;
  uuidCalls = 0;
  return {
    api,
    app,
    created,
    collection,
    contextKey,
    balanceBefore,
    uuidCallCount: () => uuidCalls
  };
}

function assertReplayedPendingTransactionIsQuarantined(kind, claimVariant) {
  const fixture = replayedPendingTransactionFixture(kind, claimVariant);
  const migrated = fixture.api.migrateState(fixture.app);
  const confirm = kind === 'tip' ? fixture.api.confirmTipRecord : fixture.api.confirmDirectPayment;

  assert.equal(migrated[fixture.collection].some((record) => record.id === fixture.created.id), false);
  assert.equal(migrated.ui.pendingContext[fixture.contextKey], null);
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, fixture.balanceBefore);
  assert.equal(migrated.ledger.some((entry) => entry.refId?.trim?.() === fixture.created.id), false);
  assert.equal(migrated.redemptions.some((redemption) => redemption.id === 'red-demo'), true);
  assert.equal(migrated.ledger.some((entry) => entry.refId === 'red-demo'), true);

  const ledgerBeforeRetry = JSON.stringify(migrated.ledger);
  const retry = confirm(migrated, fixture.created.id, 3000);
  assert.equal(retry.ok, false);
  assert.equal(retry.code, 'not_found');
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, fixture.balanceBefore);
  assert.equal(JSON.stringify(migrated.ledger), ledgerBeforeRetry);
  assert.equal(fixture.uuidCallCount(), 0);
}

test('quarantines replayed pending tips from valid or malformed raw tip ledger claims', () => {
  for (const variant of ['valid_reordered_duplicate', 'malformed']) {
    assertReplayedPendingTransactionIsQuarantined('tip', variant);
  }
});

test('quarantines replayed pending direct payments from valid or malformed raw payment ledger claims', () => {
  for (const variant of ['valid_reordered_duplicate', 'malformed']) {
    assertReplayedPendingTransactionIsQuarantined('payment', variant);
  }
});

test('classifies canonical tip types as raw tip claims when refType is missing or tampered', () => {
  for (const claim of [
    { type: 'tip_bonus' },
    { type: 'tip_bonus', refType: 'tampered' }
  ]) {
    assertReplayedPendingTransactionIsQuarantined('tip', claim);
  }
});

test('classifies both canonical direct payment types when refType is missing or tampered', () => {
  for (const type of ['visit_spend', 'directpay_bonus']) {
    for (const refType of [undefined, 'tampered']) {
      assertReplayedPendingTransactionIsQuarantined('payment', {
        type,
        ...(refType ? { refType } : {})
      });
    }
  }
});

test('claims both transaction namespaces from one cross-classified raw entry', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const tip = api.createTip(app, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 1000).tip;
  const payment = api.createDirectPayment(app, {
    businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
  }, 1000).payment;
  const sharedId = tip.id;
  payment.id = sharedId;
  app.ui.pendingContext.paymentId = sharedId;
  app.ledger = [
    {
      id: 'cross-classified-claim',
      businessId: 'bitcoin-nail-bar',
      type: 'visit_spend',
      pointsDelta: -55,
      refType: 'tip',
      refId: ` ${sharedId} `,
      createdAt: '2026-07-14T10:50:00.000Z'
    },
    ...app.ledger
  ];
  const balanceBefore = app.balances['bitcoin-nail-bar'].points;
  uuidCalls = 0;

  const migrated = api.migrateState(app);

  assert.equal(migrated.tips.some((record) => record.id === sharedId), false);
  assert.equal(migrated.directPayments.some((record) => record.id === sharedId), false);
  assert.equal(migrated.ui.pendingContext.tipId, null);
  assert.equal(migrated.ui.pendingContext.paymentId, null);
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balanceBefore);
  assert.equal(migrated.ledger.some((entry) => entry.refId?.trim?.() === sharedId), false);
  assert.equal(migrated.redemptions.some((redemption) => redemption.id === 'red-demo'), true);
  assert.equal(migrated.ledger.some((entry) => entry.refId === 'red-demo'), true);

  const ledgerBeforeRetry = JSON.stringify(migrated.ledger);
  assert.equal(api.confirmTipRecord(migrated, sharedId, 3000).code, 'not_found');
  assert.equal(api.confirmDirectPayment(migrated, sharedId, 3000).code, 'not_found');
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balanceBefore);
  assert.equal(JSON.stringify(migrated.ledger), ledgerBeforeRetry);
  assert.equal(uuidCalls, 0);
});

test('restores pending tip and payment receipts without creating replacement records', () => {
  const buildPending = (kind) => {
    const { api } = testApi();
    const app = api.createDefaultState();
    if (kind === 'tip') {
      const result = api.createTip(app, {
        businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
      }, 1000);
      app.ui.activeScreen = 'tipdone';
      return { api, app, id: result.tip.id };
    }
    const result = api.createDirectPayment(app, {
      businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
    }, 1000);
    app.ui.activeScreen = 'paydone';
    return { api, app, id: result.payment.id };
  };

  for (const kind of ['tip', 'payment']) {
    const { api, app, id } = buildPending(kind);
    const screenId = kind === 'tip' ? 'tipdone' : 'paydone';
    const home = createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] });
    const receipt = createStubElement({ id: screenId, classNames: ['app-screen', 'hidden'] });
    const document = createDocumentStub({ screenNodes: [home, receipt] });
    const raw = JSON.stringify(app);
    const loaded = testApi({ [api.STORAGE_KEY]: raw }, {
      skipInit: false,
      document,
      randomUUID: () => { throw new Error('reload must not create a transaction'); }
    });

    assert.equal(receipt.classList.contains('hidden'), false, kind);
    assert.equal(loaded.storage.getItem(api.STORAGE_KEY), raw, kind);
    assert.equal(vm.runInContext(`state.${kind === 'tip' ? 'tips' : 'directPayments'}.length`, loaded.context), 1, kind);
    assert.equal(vm.runInContext(`state.ui.pendingContext.${kind === 'tip' ? 'tipId' : 'paymentId'}`, loaded.context), id, kind);
    assert.equal(document.getElementById(kind === 'tip' ? 'tipdone-amount' : 'payment-confirmed-amount').textContent, kind === 'tip' ? '$10.00' : '$55.00');
  }
});

test('persists recipient method fallback and renders disabled reasons bilingually without unsafe receipt HTML', () => {
  const document = createDocumentStub();
  const { api, context, storage } = testApi({}, { skipInit: false, document });
  const recipient = document.getElementById('tip-recipient');
  recipient.value = 'staff-maria';
  context.handleChange({ target: recipient });

  const persisted = api.loadState(storage);
  assert.equal(persisted.ui.selectedStaffId, 'staff-maria');
  assert.equal(persisted.ui.selectedTipMethod, 'Zelle');
  const tipButtons = document.getElementById('tip-method-list').children;
  assert.equal(tipButtons.find((button) => button.textContent.includes('Venmo')).disabled, true);
  assert.match(tipButtons.find((button) => button.textContent.includes('Venmo')).textContent, /chưa bật/);

  context.setLanguage('en');
  const englishButtons = document.getElementById('tip-method-list').children;
  assert.match(englishButtons.find((button) => button.textContent.includes('Venmo')).textContent, /not enabled/);

  const source = html();
  for (const [start, end] of [
    ['renderTipResult', 'renderPaymentResult'],
    ['renderPaymentResult', 'renderDomainViews']
  ]) {
    const body = source.match(new RegExp(`function ${start}\\(\\) \\{([\\s\\S]*?)\\n\\s*\\}\\n\\n\\s*function ${end}`))?.[1];
    assert.ok(body, `${start} must be available`);
    assert.doesNotMatch(body, /innerHTML/);
    assert.match(body, /textContent/);
  }
  assert.match(source, /NEXORA[^<]*(?:không giữ tiền|never holds)/i);
  assert.match(source, /(?:10|15) (?:phút|minutes)/i);
});

test('opens an external payment only after the pending record is persisted by a user action', () => {
  let opened = 0;
  let persistedAtOpen = false;
  const document = createDocumentStub();
  document.getElementById('tip-recipient').value = 'staff-anna';
  document.getElementById('tip-custom-amount').value = '';
  document.getElementById('tip-note').value = 'Thanks';
  const action = createStubElement({ dataset: { action: 'send-tip' } });
  const { api, context, storage } = testApi({}, {
    skipInit: false,
    document,
    open() {
      opened += 1;
      persistedAtOpen = api.loadState(storage).tips.length === 1;
    }
  });
  const event = { target: { closest(selector) { return selector === '[data-action]' ? action : null; } } };

  context.handleAction(event);

  assert.equal(opened, 1);
  assert.equal(persistedAtOpen, true);
  assert.equal(api.loadState(storage).tips[0].status, 'pending');
});

test('round-trips valid reward ledger state and drops duplicate-sensitive records', () => {
  const { api, storage } = testApi();
  const ledger = {
    id: 'ledger-reward-1', businessId: 'bitcoin-nail-bar', type: 'redeem', pointsDelta: -500,
    refType: 'redemption', refId: 'redemption-1', createdAt: '2026-07-14T10:00:00.000Z'
  };
  const redemption = {
    id: 'redemption-1', idempotencyKey: 'reward-round-trip', rewardKey: 'credit5',
    sourceBusinessId: 'bitcoin-nail-bar', acceptingBusinessId: 'bitcoin-nail-bar', cost: 500,
    status: 'ready', qrPayload: 'NEXORA:credit5:reward-round-trip', createdAt: '2026-07-14T10:00:00.000Z'
  };
  const migrated = api.migrateState({
    ledger: [ledger, { ...ledger, refId: 'duplicate-ledger' }, { id: '', pointsDelta: 5 }],
    redemptions: [redemption, { ...redemption, id: 'redemption-duplicate' }, { id: '', cost: 5 }]
  });

  assert.equal(migrated.ledger.length, 1);
  assert.equal(migrated.redemptions.length, 1);
  assert.equal(migrated.redemptions[0].qrPayload, redemption.qrPayload);
  api.saveState(migrated, storage);
  const loaded = api.loadState(storage);
  assert.equal(JSON.stringify(loaded.ledger), JSON.stringify(migrated.ledger));
  assert.equal(JSON.stringify(loaded.redemptions), JSON.stringify(migrated.redemptions));
});

function rewardPair(overrides = {}) {
  const redemption = {
    id: 'redemption-integrity', idempotencyKey: 'reward-integrity', rewardKey: 'credit5',
    sourceBusinessId: 'bitcoin-nail-bar', acceptingBusinessId: 'bitcoin-nail-bar', cost: 500,
    status: 'ready', qrPayload: 'NEXORA:credit5:reward-integrity', createdAt: '2026-07-14T10:00:00.000Z',
    ...overrides.redemption
  };
  const ledger = {
    id: 'ledger-integrity', businessId: 'bitcoin-nail-bar', type: 'redeem', pointsDelta: -500,
    refType: 'redemption', refId: redemption.id, createdAt: redemption.createdAt,
    ...overrides.ledger
  };
  return { redemption, ledger };
}

function reloadPendingRewardClaims(redemptions, ledger) {
  const { api } = testApi();
  const persistedState = api.createDefaultState();
  persistedState.redemptions = redemptions;
  persistedState.ledger = ledger;
  persistedState.ui.activeScreen = 'redeem';
  persistedState.ui.activeModule = 'wallet';
  persistedState.ui.currentRewardKey = 'credit5';
  persistedState.ui.pendingContext.rewardAttempt = {
    rewardKey: ' credit5 ', idempotencyKey: ' pending-raw-claim ', completed: false
  };
  const raw = JSON.stringify(persistedState);
  const document = createDocumentStub({
    screenNodes: [
      createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] }),
      createStubElement({ id: 'rewards', classNames: ['app-screen', 'hidden'] }),
      createStubElement({ id: 'redeem', classNames: ['app-screen', 'hidden'] })
    ]
  });
  let idCalls = 0;
  const loaded = testApi({ [api.STORAGE_KEY]: raw }, {
    skipInit: false,
    document,
    randomUUID: () => {
      idCalls += 1;
      throw new Error('invalid pending claim must not create an ID');
    }
  });
  return {
    ...loaded,
    document,
    pointsBefore: persistedState.balances['bitcoin-nail-bar'].points,
    idCalls: () => idCalls
  };
}

test('normalizes persisted reward identity before an idempotent retry', () => {
  const { api } = testApi();
  const { redemption, ledger } = rewardPair({
    redemption: {
      idempotencyKey: '  normalized-retry  ',
      rewardKey: '  credit5  ',
      qrPayload: 'NEXORA:forged:payload'
    }
  });
  const migrated = api.migrateState({
    balances: { 'bitcoin-nail-bar': { points: 1337 } },
    redemptions: [redemption],
    ledger: [ledger]
  });

  assert.equal(migrated.redemptions[0].idempotencyKey, 'normalized-retry');
  assert.equal(migrated.redemptions[0].rewardKey, 'credit5');
  assert.equal(migrated.redemptions[0].qrPayload, 'NEXORA:credit5:normalized-retry');
  const balanceBefore = migrated.balances['bitcoin-nail-bar'].points;
  const retry = api.redeemReward(migrated, ' credit5 ', ' normalized-retry ', 1000);
  assert.equal(retry.ok, true);
  assert.equal(retry.idempotent, true);
  assert.equal(retry.redemption.id, redemption.id);
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balanceBefore);
  assert.equal(migrated.redemptions.length, 1);
  assert.equal(migrated.ledger.length, 1);
});

test('persists and renders the actual redemption receipt context', () => {
  let uuidCalls = 0;
  const document = createDocumentStub();
  const loaded = testApi({}, {
    document,
    skipInit: false,
    randomUUID: () => `00000000-0000-4000-8000-${String(++uuidCalls).padStart(12, '0')}`
  });
  loaded.context.openReward('credit5', false);
  const redeemed = loaded.api.confirmReward(false);
  assert.equal(redeemed.ok, true);
  const redemption = redeemed.redemption;
  assert.equal(vm.runInContext('state.ui.pendingContext.redemptionId', loaded.context), redemption.id);
  assert.equal(document.getElementById('reward-done-code').textContent, redemption.qrPayload);
  assert.equal(document.getElementById('reward-done-title').textContent, 'Tín dụng dịch vụ $5');
  assert.equal(document.getElementById('reward-done-status').textContent, 'Sẵn sàng');
  loaded.context.navigateTo('redeemdone', { focus: false });
  const persisted = loaded.api.loadState(loaded.storage);
  assert.equal(persisted.ui.pendingContext.redemptionId, redemption.id);

  const restoredDocument = createDocumentStub();
  const restored = testApi({ [loaded.api.STORAGE_KEY]: JSON.stringify(persisted) }, { document: restoredDocument, skipInit: false });
  assert.equal(vm.runInContext('state.ui.activeScreen', restored.context), 'redeemdone');
  assert.equal(restoredDocument.getElementById('reward-done-code').textContent, redemption.qrPayload);
});

test('rejects persisted receipts with invalid status and restores rewards safely', () => {
  const { api } = testApi();
  const persisted = api.createDefaultState();
  persisted.ui.activeScreen = 'redeemdone';
  persisted.ui.activeModule = 'wallet';
  persisted.ui.pendingContext.redemptionId = 'red-demo';
  persisted.redemptions[0].status = 'redeemed';
  const document = createDocumentStub();
  const loaded = testApi({ [api.STORAGE_KEY]: JSON.stringify(persisted) }, { document, skipInit: false });
  assert.equal(vm.runInContext('state.ui.activeScreen', loaded.context), 'rewards');
  assert.equal(vm.runInContext('state.ui.pendingContext.redemptionId', loaded.context), null);
});

test('deduplicates whitespace-equivalent persisted idempotency keys deterministically', () => {
  const { api } = testApi();
  const first = rewardPair({
    redemption: { id: 'redemption-a', idempotencyKey: ' duplicate-key ' },
    ledger: { id: 'ledger-a' }
  });
  const second = rewardPair({
    redemption: { id: 'redemption-b', idempotencyKey: 'duplicate-key' },
    ledger: { id: 'ledger-b' }
  });

  const migrate = (reverse) => api.migrateState({
    redemptions: reverse
      ? [second.redemption, first.redemption]
      : [first.redemption, second.redemption],
    ledger: reverse
      ? [second.ledger, first.ledger]
      : [first.ledger, second.ledger]
  });
  const forward = migrate(false);
  const reverse = migrate(true);

  assert.equal(forward.redemptions.length, 1);
  assert.equal(forward.redemptions[0].idempotencyKey, 'duplicate-key');
  assert.equal(forward.redemptions[0].id, 'redemption-a');
  assert.equal(forward.ledger.filter((entry) => entry.type === 'redeem').length, 1);
  assert.equal(reverse.redemptions[0].id, forward.redemptions[0].id);
  assert.equal(reverse.ledger.find((entry) => entry.type === 'redeem').id, 'ledger-a');
});

test('drops persisted catalog mismatches and canonicalizes reward QR payloads', () => {
  const { api } = testApi();
  const mismatches = [
    rewardPair({ redemption: { cost: 501 }, ledger: { pointsDelta: -501 } }),
    rewardPair({
      redemption: {
        sourceBusinessId: 'golden-glow-spa',
        acceptingBusinessId: 'golden-glow-spa'
      },
      ledger: { businessId: 'golden-glow-spa' }
    }),
    rewardPair({ redemption: { acceptingBusinessId: 'golden-glow-spa' } }),
    rewardPair({ redemption: { rewardKey: 'retired-reward' } })
  ];

  mismatches.forEach(({ redemption, ledger }) => {
    const migrated = api.migrateState({ redemptions: [redemption], ledger: [ledger] });
    assert.equal(migrated.redemptions.length, 0);
    assert.equal(migrated.ledger.filter((entry) => entry.type === 'redeem').length, 0);
  });

  const canonical = rewardPair({ redemption: { qrPayload: 'NEXORA:forged:payload' } });
  const migrated = api.migrateState({
    redemptions: [canonical.redemption],
    ledger: [canonical.ledger]
  });
  assert.equal(migrated.redemptions.length, 1);
  assert.equal(migrated.redemptions[0].qrPayload, 'NEXORA:credit5:reward-integrity');
});

test('binds restored pending attempts to normalized valid persisted reward state', () => {
  const validState = testApi().api.createDefaultState();
  const validPair = rewardPair({
    redemption: { idempotencyKey: ' restored-attempt ', rewardKey: ' credit5 ' }
  });
  validState.redemptions = [validPair.redemption];
  validState.ledger = [validPair.ledger];
  validState.ui.activeScreen = 'redeem';
  validState.ui.activeModule = 'wallet';
  validState.ui.currentRewardKey = 'credit5';
  validState.ui.pendingContext.rewardAttempt = {
    rewardKey: ' credit5 ', idempotencyKey: ' restored-attempt ', completed: false
  };
  const validRaw = JSON.stringify(validState);
  const validDocument = createDocumentStub({
    screenNodes: [
      createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] }),
      createStubElement({ id: 'rewards', classNames: ['app-screen', 'hidden'] }),
      createStubElement({ id: 'redeem', classNames: ['app-screen', 'hidden'] })
    ]
  });
  const valid = testApi({ 'nexora.customer.prototype.v1': validRaw }, {
    skipInit: false,
    document: validDocument,
    randomUUID: () => { throw new Error('valid retry must not create a new ID'); }
  });

  assert.equal(validDocument.getElementById('redeem').classList.contains('hidden'), false);
  assert.equal(vm.runInContext('state.ui.pendingContext.rewardAttempt.rewardKey', valid.context), 'credit5');
  assert.equal(vm.runInContext('state.ui.pendingContext.rewardAttempt.idempotencyKey', valid.context), 'restored-attempt');
  assert.equal(valid.storage.getItem(valid.api.STORAGE_KEY), validRaw);
  const balanceBefore = vm.runInContext("state.balances['bitcoin-nail-bar'].points", valid.context);
  const retry = valid.api.confirmReward(false);
  assert.equal(retry.ok, true);
  assert.equal(retry.idempotent, true);
  assert.equal(vm.runInContext("state.balances['bitcoin-nail-bar'].points", valid.context), balanceBefore);

  const invalidCases = [
    rewardPair({
      redemption: { idempotencyKey: ' pending-conflict ', rewardKey: 'voucher25', cost: 800 },
      ledger: { pointsDelta: -800 }
    }),
    rewardPair({
      redemption: { idempotencyKey: ' pending-conflict ', cost: 501 },
      ledger: { pointsDelta: -501 }
    }),
    rewardPair({
      redemption: { idempotencyKey: ' pending-conflict ', cost: '500' }
    })
  ];
  invalidCases.forEach((invalidPair) => {
    const invalidState = testApi().api.createDefaultState();
    invalidState.redemptions = [invalidPair.redemption];
    invalidState.ledger = [invalidPair.ledger];
    invalidState.ui.activeScreen = 'redeem';
    invalidState.ui.activeModule = 'wallet';
    invalidState.ui.currentRewardKey = 'credit5';
    invalidState.ui.pendingContext.rewardAttempt = {
      rewardKey: ' credit5 ', idempotencyKey: ' pending-conflict ', completed: false
    };
    const document = createDocumentStub({
      screenNodes: [
        createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] }),
        createStubElement({ id: 'rewards', classNames: ['app-screen', 'hidden'] }),
        createStubElement({ id: 'redeem', classNames: ['app-screen', 'hidden'] })
      ]
    });
    const loaded = testApi({
      'nexora.customer.prototype.v1': JSON.stringify(invalidState)
    }, { skipInit: false, document });
    const pointsBefore = invalidState.balances['bitcoin-nail-bar'].points;

    assert.equal(document.getElementById('rewards').classList.contains('hidden'), false);
    assert.equal(vm.runInContext('state.ui.pendingContext.rewardAttempt', loaded.context), null);
    assert.equal(loaded.api.confirmReward(false).code, 'no_pending_reward');
    assert.equal(vm.runInContext("state.balances['bitcoin-nail-bar'].points", loaded.context), pointsBefore);
  });
});

test('retains malformed raw reward claims when rejecting a pending attempt', () => {
  const variants = [
    { name: 'non-string reward key', redemption: { rewardKey: 17 } },
    { name: 'blank reward key', redemption: { rewardKey: '   ' } },
    { name: 'missing reward key', redemption: { rewardKey: undefined } },
    { name: 'missing required field', redemption: { sourceBusinessId: undefined } },
    { name: 'wrong catalog metadata', redemption: { cost: 501 }, ledger: { pointsDelta: -501 } }
  ];

  variants.forEach((variant) => {
    const pair = rewardPair({
      redemption: { idempotencyKey: ' pending-raw-claim ', ...variant.redemption },
      ledger: variant.ledger
    });
    const loaded = reloadPendingRewardClaims([pair.redemption], [pair.ledger]);

    assert.equal(loaded.document.getElementById('rewards').classList.contains('hidden'), false, variant.name);
    assert.equal(vm.runInContext('state.ui.pendingContext.rewardAttempt', loaded.context), null, variant.name);
    assert.equal(loaded.api.confirmReward(false).code, 'no_pending_reward', variant.name);
    assert.equal(
      vm.runInContext("state.balances['bitcoin-nail-bar'].points", loaded.context),
      loaded.pointsBefore,
      variant.name
    );
    assert.equal(loaded.idCalls(), 0, variant.name);
  });
});

test('clears a pending attempt when duplicate raw claims share its logical key', () => {
  const first = rewardPair({
    redemption: { id: 'raw-duplicate-a', idempotencyKey: ' pending-raw-claim ' },
    ledger: { id: 'raw-duplicate-ledger-a' }
  });
  const second = rewardPair({
    redemption: { id: 'raw-duplicate-b', idempotencyKey: 'pending-raw-claim' },
    ledger: { id: 'raw-duplicate-ledger-b' }
  });
  const loaded = reloadPendingRewardClaims(
    [first.redemption, second.redemption],
    [first.ledger, second.ledger]
  );

  assert.equal(loaded.document.getElementById('rewards').classList.contains('hidden'), false);
  assert.equal(vm.runInContext('state.ui.pendingContext.rewardAttempt', loaded.context), null);
  assert.equal(loaded.api.confirmReward(false).code, 'no_pending_reward');
  assert.equal(
    vm.runInContext("state.balances['bitcoin-nail-bar'].points", loaded.context),
    loaded.pointsBefore
  );
  assert.equal(loaded.idCalls(), 0);
});

test('keeps only one-to-one persisted redemption and redeem-ledger pairs', () => {
  const { api, storage } = testApi();
  const { redemption, ledger } = rewardPair();
  const visit = {
    id: 'ledger-visit-integrity', businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: 25,
    refType: 'visit', refId: 'visit-integrity', createdAt: '2026-07-14T09:00:00.000Z'
  };
  const unknownBusinessPair = rewardPair({
    redemption: { sourceBusinessId: 'missing-business', acceptingBusinessId: 'missing-business' },
    ledger: { businessId: 'missing-business' }
  });

  for (const malformed of [
    { redemptions: [redemption], ledger: [visit] },
    { redemptions: [], ledger: [ledger, visit] },
    { redemptions: [unknownBusinessPair.redemption], ledger: [unknownBusinessPair.ledger, visit] },
    { redemptions: [redemption], ledger: [{ ...ledger, pointsDelta: -499 }, visit] },
    { redemptions: [redemption], ledger: [{ ...ledger, businessId: 'golden-glow-spa' }, visit] }
  ]) {
    const migrated = api.migrateState(malformed);
    assert.equal(migrated.redemptions.length, 0);
    assert.deepEqual(migrated.ledger.map(({ id }) => id), [visit.id]);
  }

  const wrongRedemption = { ...redemption, cost: 700 };
  const wrongLedger = { ...ledger, businessId: 'golden-glow-spa', pointsDelta: -700 };
  for (const reverse of [false, true]) {
    const redemptions = reverse ? [redemption, wrongRedemption] : [wrongRedemption, redemption];
    const ledgerEntries = reverse ? [ledger, wrongLedger, visit] : [wrongLedger, ledger, visit];
    const migrated = api.migrateState({ redemptions, ledger: ledgerEntries });
    assert.equal(migrated.redemptions.length, 1);
    assert.equal(migrated.redemptions[0].cost, 500);
    assert.equal(migrated.ledger.filter((entry) => entry.type === 'redeem').length, 1);
    assert.equal(migrated.ledger.find((entry) => entry.type === 'redeem').pointsDelta, -500);
    assert.equal(migrated.ledger.some((entry) => entry.id === visit.id), true);

    api.saveState(migrated, storage);
    const loaded = api.loadState(storage);
    assert.equal(JSON.stringify(loaded.redemptions), JSON.stringify(migrated.redemptions));
    assert.equal(JSON.stringify(loaded.ledger), JSON.stringify(migrated.ledger));
  }
});

test('ships a consistent default redemption pair and rejects broken idempotent state', () => {
  const { api } = testApi();
  const defaults = api.createDefaultState();
  const demo = defaults.redemptions.find((item) => item.id === 'red-demo');
  assert.ok(demo);
  assert.equal(defaults.ledger.filter((entry) => entry.refId === demo.id).length, 1);

  const app = api.createDefaultState();
  const first = api.redeemReward(app, 'credit5', 'broken-idempotent-pair', 1000);
  assert.equal(first.ok, true);
  app.ledger = app.ledger.filter((entry) => entry.refId !== first.redemption.id);
  const before = JSON.stringify(app);
  const retry = api.redeemReward(app, 'credit5', 'broken-idempotent-pair', 2000);
  assert.equal(retry.ok, false);
  assert.equal(retry.code, 'invalid_state');
  assert.equal(JSON.stringify(app), before);
});

test('restores a persisted redeem screen and preview without writing storage or replacing its key', () => {
  const { api } = testApi();
  const persistedState = api.createDefaultState();
  persistedState.ui.activeScreen = 'redeem';
  persistedState.ui.activeModule = 'wallet';
  persistedState.ui.currentRewardKey = 'credit5';
  persistedState.ui.pendingContext.rewardAttempt = {
    rewardKey: 'credit5', idempotencyKey: 'persisted-reward-attempt', completed: false
  };
  const raw = JSON.stringify(persistedState);
  const home = createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] });
  const rewards = createStubElement({ id: 'rewards', classNames: ['app-screen', 'hidden'] });
  const redeem = createStubElement({ id: 'redeem', classNames: ['app-screen', 'hidden'] });
  const document = createDocumentStub({ screenNodes: [home, rewards, redeem] });

  const { context, storage } = testApi({ [api.STORAGE_KEY]: raw }, {
    skipInit: false,
    document,
    randomUUID: () => { throw new Error('bootstrap must not create an idempotency key'); }
  });

  assert.equal(home.classList.contains('hidden'), true);
  assert.equal(redeem.classList.contains('hidden'), false);
  assert.equal(redeem.classList.contains('is-active'), true);
  assert.equal(document.getElementById('reward-title').textContent, 'Tín dụng dịch vụ $5');
  assert.equal(document.getElementById('reward-cost').textContent, '500 điểm');
  assert.equal(document.getElementById('reward-after').textContent, '1.950 điểm');
  assert.equal(vm.runInContext('state.ui.pendingContext.rewardAttempt.idempotencyKey', context), 'persisted-reward-attempt');
  assert.equal(storage.getItem(api.STORAGE_KEY), raw);
});

test('falls back from a persisted redeem screen when its attempt is invalid', () => {
  const { api } = testApi();
  const persistedState = api.createDefaultState();
  persistedState.ui.activeScreen = 'redeem';
  persistedState.ui.activeModule = 'wallet';
  persistedState.ui.currentRewardKey = 'missing-reward';
  persistedState.ui.pendingContext.rewardAttempt = {
    rewardKey: 'missing-reward', idempotencyKey: 'invalid-reward-attempt', completed: false
  };
  const raw = JSON.stringify(persistedState);
  const home = createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] });
  const rewards = createStubElement({ id: 'rewards', classNames: ['app-screen', 'hidden'] });
  const redeem = createStubElement({ id: 'redeem', classNames: ['app-screen', 'hidden'] });
  const document = createDocumentStub({ screenNodes: [home, rewards, redeem] });

  const { context, storage } = testApi({ [api.STORAGE_KEY]: raw }, { skipInit: false, document });
  assert.equal(rewards.classList.contains('hidden'), false);
  assert.equal(redeem.classList.contains('hidden'), true);
  assert.equal(vm.runInContext('state.ui.activeScreen', context), 'rewards');
  assert.equal(vm.runInContext('state.ui.pendingContext.rewardAttempt', context), null);
  assert.equal(vm.runInContext('state.ui.currentRewardKey', context), null);
  assert.equal(storage.getItem(api.STORAGE_KEY), raw);
});

test('canonicalizes persisted business identity and keeps wallet and reward validation aligned', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    businesses: {
      'bitcoin-nail-bar': { id: 'spoofed-primary' },
      'golden-glow-spa': { id: 'spoofed-partner' }
    },
    ui: { selectedBusinessId: 'spoofed-primary' }
  });
  assert.equal(migrated.businesses['bitcoin-nail-bar'].id, 'bitcoin-nail-bar');
  assert.equal(migrated.businesses['golden-glow-spa'].id, 'golden-glow-spa');
  assert.equal(migrated.ui.selectedBusinessId, 'bitcoin-nail-bar');

  const document = createDocumentStub();
  const raw = JSON.stringify({
    businesses: { 'bitcoin-nail-bar': { id: 'spoofed-primary' } },
    balances: { 'bitcoin-nail-bar': { points: 1777 } }
  });
  const { context } = testApi({ [api.STORAGE_KEY]: raw }, { skipInit: false, document });
  assert.equal(document.getElementById('wallet-business-list').children[0].children[1].textContent, '1.777 điểm');
  const firstHistoryButton = document.getElementById('wallet-business-list').children[0].children.at(-1);
  assert.equal(firstHistoryButton.dataset.businessId, 'bitcoin-nail-bar');

  vm.runInContext("state.businesses['golden-glow-spa'].id = 'spoofed-runtime'; renderRewards()", context);
  const glowButton = document.getElementById('reward-list').children[3].children.at(-1).children.at(-1);
  assert.equal(glowButton.disabled, true);
  assert.equal(vm.runInContext("redeemReward(state, 'glow', 'spoofed-runtime-attempt', 1000).code", context), 'unknown_business');
});

test('reuses one persisted idempotency key for repeated confirmation of the same UI attempt', () => {
  let uuidCall = 0;
  const randomUUID = () => `00000000-0000-4000-8000-${String(++uuidCall).padStart(12, '0')}`;
  const { context: openingContext, storage } = testApi({}, { document: createDocumentStub(), randomUUID });

  openingContext.openReward('credit5', false);
  const attempt = vm.runInContext('structuredClone(state.ui.pendingContext.rewardAttempt)', openingContext);
  assert.equal(attempt.rewardKey, 'credit5');
  assert.ok(attempt.idempotencyKey.length > 0);
  assert.equal(apiState(storage).ui.pendingContext.rewardAttempt.idempotencyKey, attempt.idempotencyKey);

  const { context, api: contextApi, storage: reloadedStorage } = testApi(storage.dump(), { document: createDocumentStub(), randomUUID });
  assert.equal(
    vm.runInContext('state.ui.pendingContext.rewardAttempt.idempotencyKey', context),
    attempt.idempotencyKey
  );
  const first = contextApi.confirmReward(false);
  const second = contextApi.confirmReward(false);
  assert.equal(first.ok, true);
  assert.equal(second.redemption.id, first.redemption.id);
  assert.equal(vm.runInContext("state.balances['bitcoin-nail-bar'].points", context), 1950);
  assert.equal(
    apiState(reloadedStorage).redemptions.filter((item) => item.idempotencyKey === attempt.idempotencyKey).length,
    1
  );
});

const validBookingInput = {
  businessId: 'bitcoin-nail-bar',
  service: ' Gel manicure ',
  staff: ' Anna ',
  day: ' Thu 16 Jul ',
  time: ' 2:00 PM ',
  note: ' Màu hồng sữa '
};

test('keeps booking points pending, snapshots the rule and confirms exactly once', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const requested = api.createBookingRequest(app, validBookingInput, 1000);

  assert.equal(requested.ok, true);
  assert.equal(requested.booking.status, 'requested');
  assert.equal(requested.booking.service, 'Gel manicure');
  assert.equal(requested.booking.bookingBonus, 25);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(app.appointments.length, 0);
  assert.equal(app.ledger.some((entry) => entry.refId === requested.booking.id), false);

  app.businesses['bitcoin-nail-bar'].bookingBonus = 999;
  const first = api.confirmBookingRequest(app, requested.booking.id, 2000);
  const second = api.confirmBookingRequest(app, requested.booking.id, 3000);

  assert.equal(first.ok, true);
  assert.equal(first.idempotent, false);
  assert.equal(second.idempotent, true);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 25);
  assert.equal(app.appointments.length, 1);
  assert.equal(app.appointments[0].bookingId, requested.booking.id);
  assert.equal(app.ledger.filter((entry) => entry.refId === requested.booking.id).length, 1);
  assert.equal(uuidCalls, 3);
});

test('rejects noncanonical booking inputs and keeps create and confirm failures atomic', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const invalidCalls = [
    () => api.createBookingRequest(app, { ...validBookingInput, businessId: 'missing' }, 1000),
    () => api.createBookingRequest(app, { ...validBookingInput, service: '   ' }, 1000),
    () => api.createBookingRequest(app, { ...validBookingInput, staff: null }, 1000),
    () => api.createBookingRequest(app, { ...validBookingInput, day: '' }, 1000),
    () => api.createBookingRequest(app, { ...validBookingInput, time: ' ' }, 1000),
    () => api.createBookingRequest(app, validBookingInput, Infinity)
  ];
  invalidCalls.forEach((invoke) => {
    const before = JSON.stringify(app);
    assert.equal(invoke().ok, false);
    assert.equal(JSON.stringify(app), before);
  });

  const malformedUuid = testApi({}, { randomUUID: () => 'not-a-uuid' }).api;
  const malformedState = malformedUuid.createDefaultState();
  const malformedBefore = JSON.stringify(malformedState);
  assert.equal(malformedUuid.createBookingRequest(malformedState, validBookingInput, 1000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(malformedState), malformedBefore);

  let uuidCalls = 0;
  const confirmApi = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      if (uuidCalls === 3) throw new Error('booking ledger UUID unavailable');
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  }).api;
  const confirmState = confirmApi.createDefaultState();
  const booking = confirmApi.createBookingRequest(confirmState, validBookingInput, 1000).booking;
  const beforeConfirm = JSON.stringify(confirmState);
  assert.equal(confirmApi.confirmBookingRequest(confirmState, booking.id, 2000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(confirmState), beforeConfirm);
});

test('rejects broken confirmed booking relationships and supports a zero-point business', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const booking = api.createBookingRequest(app, validBookingInput, 1000).booking;
  api.confirmBookingRequest(app, booking.id, 2000);
  app.appointments[0].businessId = 'golden-glow-spa';
  const beforeRetry = JSON.stringify(app);
  assert.equal(api.confirmBookingRequest(app, booking.id, 3000).code, 'invalid_state');
  assert.equal(JSON.stringify(app), beforeRetry);

  const moonState = api.createDefaultState();
  const moonBefore = moonState.balances['moon-coffee'].points;
  const moon = api.createBookingRequest(moonState, {
    ...validBookingInput,
    businessId: 'moon-coffee',
    service: 'Latte tasting'
  }, 4000).booking;
  const confirmed = api.confirmBookingRequest(moonState, moon.id, 5000);
  assert.equal(confirmed.ok, true);
  assert.equal(confirmed.points, 0);
  assert.equal(moonState.appointments.length, 1);
  assert.equal(moonState.ledger.some((entry) => entry.refId === moon.id), false);
  assert.equal(moonState.balances['moon-coffee'].points, moonBefore);
});

test('quarantines downgraded booking claims during migration so confirmation cannot replay', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const booking = api.createBookingRequest(app, validBookingInput, 1000).booking;
  api.confirmBookingRequest(app, booking.id, 2000);
  app.bookingRequests = [{ ...app.bookingRequests[0], status: 'requested', confirmedAt: null }];
  const linked = app.ledger.find((entry) => entry.refId === booking.id);
  linked.refType = 'tampered';
  const balanceAfterAward = app.balances['bitcoin-nail-bar'].points;
  uuidCalls = 0;

  const migrated = api.migrateState(app);
  assert.equal(migrated.bookingRequests.some((item) => item.id === booking.id), false);
  assert.equal(migrated.appointments.some((item) => item.bookingId === booking.id), false);
  assert.equal(migrated.ledger.some((entry) => entry.refId === booking.id), false);
  assert.equal(migrated.ui.pendingContext.bookingId, null);
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balanceAfterAward);
  assert.equal(api.confirmBookingRequest(migrated, booking.id, 3000).code, 'not_found');
  assert.equal(uuidCalls, 0);
});

test('awards 15 points for one-star private feedback and blocks another award by visit', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const first = api.submitFeedback(app, {
    visitId: ' visit-1001 ', businessId: ' bitcoin-nail-bar ', stars: 1, text: ' Cần cải thiện '
  }, 1000);
  const second = api.submitFeedback(app, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: 'Lặp'
  }, 2000);

  assert.equal(first.ok, true);
  assert.equal(first.feedback.stars, 1);
  assert.equal(first.feedback.text, 'Cần cải thiện');
  assert.equal(second.code, 'already_submitted');
  assert.equal(app.feedback.length, 1);
  assert.equal(app.ledger.filter((entry) => entry.refId === first.feedback.id).length, 1);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 15);
  assert.equal(uuidCalls, 2);
});

test('validates feedback visit ownership and precomputes IDs before any mutation', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  for (const input of [
    { visitId: 'missing', businessId: 'bitcoin-nail-bar', stars: 5 },
    { visitId: 'visit-1001', businessId: 'golden-glow-spa', stars: 5 },
    { visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 0 },
    { visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 1.5 }
  ]) {
    const before = JSON.stringify(app);
    assert.equal(api.submitFeedback(app, input, 1000).ok, false);
    assert.equal(JSON.stringify(app), before);
  }

  let uuidCalls = 0;
  const atomicApi = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      if (uuidCalls === 2) throw new Error('feedback ledger UUID unavailable');
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  }).api;
  const atomicState = atomicApi.createDefaultState();
  const atomicBefore = JSON.stringify(atomicState);
  assert.equal(atomicApi.submitFeedback(atomicState, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: 'Tốt'
  }, 1000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(atomicState), atomicBefore);
});

test('rejects a broken runtime feedback relation and migration blocks replay of a raw claim', () => {
  let uuidCalls = 0;
  const { api, storage } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const feedback = api.submitFeedback(app, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 2, text: 'Riêng tư'
  }, 1000).feedback;
  app.ledger.find((entry) => entry.refId === feedback.id).pointsDelta = 999;
  const runtimeBefore = JSON.stringify(app);
  assert.equal(api.submitFeedback(app, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5
  }, 2000).code, 'invalid_state');
  assert.equal(JSON.stringify(app), runtimeBefore);

  app.feedback = [];
  app.feedbackClaims = [];
  const balanceAfterAward = app.balances['bitcoin-nail-bar'].points;
  const migrated = api.migrateState(app);
  api.saveState(migrated, storage);
  const loaded = api.loadState(storage);
  uuidCalls = 0;
  const ledgerBefore = JSON.stringify(loaded.ledger);
  const replay = api.submitFeedback(loaded, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5
  }, 3000);
  assert.equal(replay.code, 'already_submitted');
  assert.equal(loaded.balances['bitcoin-nail-bar'].points, balanceAfterAward);
  assert.equal(JSON.stringify(loaded.ledger), ledgerBefore);
  assert.equal(uuidCalls, 0);
});

test('restores book3, appointment and rating without writing storage during bootstrap', () => {
  let uuidCalls = 0;
  const setup = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const persistedState = setup.api.createDefaultState();
  const booking = setup.api.createBookingRequest(persistedState, validBookingInput, Date.UTC(2026, 6, 14)).booking;
  setup.api.confirmBookingRequest(persistedState, booking.id, Date.UTC(2026, 6, 14, 1));
  persistedState.ui.activeScreen = 'book3';
  persistedState.ui.activeModule = 'home';
  persistedState.ui.rating = 4;
  const raw = JSON.stringify(persistedState);

  const home = createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] });
  const book1 = createStubElement({ id: 'book1', classNames: ['app-screen', 'hidden'] });
  const book3 = createStubElement({ id: 'book3', classNames: ['app-screen', 'hidden'] });
  const appointmentCopy = createStubElement();
  const homeAppointment = createStubElement({
    id: 'home-appointment', classNames: ['hidden'], querySelectors: { '[data-appointment-copy]': appointmentCopy }
  });
  const ratingControls = [1, 2, 3, 4, 5].map((rating) => createStubElement({
    dataset: { action: 'set-rating', rating: String(rating) }
  }));
  const submitLabel = createStubElement();
  const submit = createStubElement({
    dataset: { action: 'submit-review' }, querySelectors: { span: submitLabel }
  });
  const document = createDocumentStub({
    screenNodes: [home, book1, book3],
    extraElements: [homeAppointment],
    selectorNodes: {
      '[data-action="set-rating"]': ratingControls,
      '[data-action="submit-review"]': submit
    }
  });
  const { storage } = testApi({ [setup.api.STORAGE_KEY]: raw }, {
    skipInit: false,
    document,
    randomUUID: () => { throw new Error('bootstrap must not create IDs'); }
  });

  assert.equal(book3.classList.contains('hidden'), false);
  assert.equal(document.getElementById('booking-pending').classList.contains('hidden'), true);
  assert.equal(document.getElementById('booking-confirmed').classList.contains('hidden'), false);
  assert.equal(homeAppointment.classList.contains('hidden'), false);
  assert.match(appointmentCopy.textContent, /Gel manicure.*Anna.*Thu 16 Jul.*2:00 PM/);
  assert.deepEqual(ratingControls.map((control) => control.attributes['aria-pressed']), ['true', 'true', 'true', 'true', 'false']);
  assert.equal(storage.getItem(setup.api.STORAGE_KEY), raw);
});

test('keeps Google sharing optional and unrewarded regardless of rating or private feedback', () => {
  const opened = [];
  const { context } = testApi({}, {
    open: (...args) => { opened.push(args); }
  });
  vm.runInContext(`submitFeedback(state, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 1, text: 'Cần cải thiện'
  }, 1000)`, context);
  const before = vm.runInContext('JSON.stringify(state)', context);

  assert.doesNotThrow(() => vm.runInContext("ACTIONS.get('open-google-review')()", context));
  assert.equal(opened.length, 1);
  assert.equal(vm.runInContext('JSON.stringify(state)', context), before);

  const source = html();
  assert.match(source, /data-action="open-google-review"/);
  const action = source.match(/registerAction\('open-google-review',[\s\S]*?\);/)?.[0];
  assert.ok(action);
  assert.doesNotMatch(action, /submitFeedback|appendLedger|commitState|rating/);
  assert.match(source, /optional[^<]*no points|tùy chọn[^<]*không điểm/i);
});

test('guards missing calendar bookings and downloads an escaped valid ICS for a confirmed fixture', () => {
  const captured = { blobs: [], revoked: [] };
  class CapturedBlob {
    constructor(parts, options) {
      this.parts = parts;
      this.options = options;
    }
  }
  const url = {
    createObjectURL(blob) {
      captured.blobs.push(blob);
      return `blob:calendar-${captured.blobs.length}`;
    },
    revokeObjectURL(value) { captured.revoked.push(value); }
  };
  let uuidCalls = 0;
  const document = createDocumentStub();
  const { context } = testApi({}, {
    document,
    url,
    blob: CapturedBlob,
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });

  assert.doesNotThrow(() => vm.runInContext("ACTIONS.get('add-calendar')()", context));
  assert.equal(captured.blobs.length, 0);

  vm.runInContext(`
    const calendarBooking = createBookingRequest(state, {
      businessId: 'bitcoin-nail-bar', service: 'Gel, manicure', staff: 'Anna',
      day: 'Thu 16 Jul', time: '2:00 PM', note: 'Pink; shine\\nNo fragrance'
    }, Date.UTC(2026, 6, 14));
    confirmBookingRequest(state, calendarBooking.booking.id, Date.UTC(2026, 6, 14, 1));
    ACTIONS.get('add-calendar')();
  `, context);

  assert.equal(captured.blobs.length, 1);
  const ics = captured.blobs[0].parts.join('');
  assert.match(ics, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/);
  assert.match(ics, /\r\nUID:[^\r\n]+\r\n/);
  assert.match(ics, /\r\nDTSTAMP:\d{8}T\d{6}Z\r\n/);
  assert.match(ics, /\r\nDTSTART:\d{8}T\d{6}Z\r\n/);
  assert.match(ics, /\r\nDTEND:\d{8}T\d{6}Z\r\n/);
  assert.match(ics, /SUMMARY:Gel\\, manicure at Bitcoin Nail Bar/);
  assert.match(ics, /DESCRIPTION:Pink\\; shine\\nNo fragrance/);
  assert.match(ics, /END:VEVENT\r\nEND:VCALENDAR\r\n$/);
  assert.deepEqual(captured.revoked, ['blob:calendar-1']);
});

test('derives feedback claim authority from the canonical visit for type-only and refType-only raw evidence', () => {
  for (const claimVariant of [
    { classifier: 'type_only', business: 'changed' },
    { classifier: 'type_only', business: 'missing' },
    { classifier: 'ref_type_only', business: 'changed' },
    { classifier: 'ref_type_only', business: 'missing' }
  ]) {
    const variantName = `${claimVariant.classifier}_${claimVariant.business}`;
    let uuidCalls = 0;
    const { api, storage } = testApi({}, {
      randomUUID: () => {
        uuidCalls += 1;
        return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
      }
    });
    const app = api.createDefaultState();
    const feedback = api.submitFeedback(app, {
      visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 3, text: 'Private'
    }, 1000).feedback;
    const feedbackLedger = app.ledger.find((entry) => entry.refId === feedback.id);
    const rawClaim = {
      ...feedbackLedger,
      businessId: 'golden-glow-spa',
      pointsDelta: 999
    };
    if (claimVariant.business === 'missing') delete rawClaim.businessId;
    if (claimVariant.classifier === 'type_only') delete rawClaim.refType;
    else delete rawClaim.type;
    app.feedback = [];
    app.feedbackClaims = [];
    app.ledger = [rawClaim, ...app.ledger.filter((entry) => entry !== feedbackLedger)];
    const balanceAfterAward = app.balances['bitcoin-nail-bar'].points;

    const migrated = api.migrateState(app);
    api.saveState(migrated, storage);
    const loaded = api.loadState(storage);
    uuidCalls = 0;
    const ledgerBefore = JSON.stringify(loaded.ledger);
    const retry = api.submitFeedback(loaded, {
      visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5
    }, 2000);

    assert.equal(loaded.feedback.length, 0, variantName);
    assert.equal(loaded.feedbackClaims.includes('visit-1001'), true, variantName);
    assert.equal(retry.code, 'already_submitted', variantName);
    assert.equal(loaded.balances['bitcoin-nail-bar'].points, balanceAfterAward, variantName);
    assert.equal(JSON.stringify(loaded.ledger), ledgerBefore, variantName);
    assert.equal(uuidCalls, 0, variantName);
  }
});

test('reconciles booking and feedback again after a cross-domain ledger ID collision', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const booking = api.createBookingRequest(app, validBookingInput, 1000).booking;
  api.confirmBookingRequest(app, booking.id, 2000);
  const feedback = api.submitFeedback(app, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 4, text: 'Private'
  }, 3000).feedback;
  const bookingLedger = app.ledger.find((entry) => entry.refId === booking.id);
  const feedbackLedger = app.ledger.find((entry) => entry.refId === feedback.id);
  feedbackLedger.id = bookingLedger.id;
  const balanceAfterAwards = app.balances['bitcoin-nail-bar'].points;

  const migrated = api.migrateState(app);
  assert.equal(migrated.bookingRequests.some((item) => item.id === booking.id), true);
  assert.equal(migrated.appointments.some((item) => item.bookingId === booking.id), true);
  assert.equal(migrated.ledger.filter((entry) => entry.id === bookingLedger.id).length, 1);
  assert.equal(migrated.ledger.find((entry) => entry.id === bookingLedger.id).type, 'booking_bonus');
  assert.equal(migrated.feedback.some((item) => item.id === feedback.id), false);
  assert.equal(migrated.feedbackClaims.includes('visit-1001'), true);

  uuidCalls = 0;
  const ledgerBefore = JSON.stringify(migrated.ledger);
  const retry = api.submitFeedback(migrated, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5
  }, 4000);
  assert.equal(retry.code, 'already_submitted');
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balanceAfterAwards);
  assert.equal(JSON.stringify(migrated.ledger), ledgerBefore);
  assert.equal(uuidCalls, 0);
});

test('quarantines booking relation and context when a transaction wins a duplicate ledger ID', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const booking = api.createBookingRequest(app, validBookingInput, 1000).booking;
  api.confirmBookingRequest(app, booking.id, 2000);
  const tip = api.createTip(app, {
    businessId: 'bitcoin-nail-bar', staffProfileId: 'staff-anna', amount: 10, method: 'Venmo'
  }, 3000).tip;
  api.confirmTipRecord(app, tip.id, 4000);
  const bookingLedger = app.ledger.find((entry) => entry.refId === booking.id);
  const tipLedger = app.ledger.find((entry) => entry.refId === tip.id);
  bookingLedger.id = tipLedger.id;
  const balanceAfterAwards = app.balances['bitcoin-nail-bar'].points;

  const migrated = api.migrateState(app);
  assert.equal(migrated.tips.some((item) => item.id === tip.id), true);
  assert.equal(migrated.ledger.filter((entry) => entry.id === tipLedger.id).length, 1);
  assert.equal(migrated.ledger.find((entry) => entry.id === tipLedger.id).type, 'tip_bonus');
  assert.equal(migrated.bookingRequests.some((item) => item.id === booking.id), false);
  assert.equal(migrated.appointments.some((item) => item.bookingId === booking.id), false);
  assert.equal(migrated.ui.pendingContext.bookingId, null);

  uuidCalls = 0;
  const ledgerBefore = JSON.stringify(migrated.ledger);
  const retry = api.confirmBookingRequest(migrated, booking.id, 5000);
  assert.equal(retry.code, 'not_found');
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balanceAfterAwards);
  assert.equal(JSON.stringify(migrated.ledger), ledgerBefore);
  assert.equal(uuidCalls, 0);
});

test('quarantines booking and feedback records with extra unrelated same-ref ledger entries', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, {
    randomUUID: () => {
      uuidCalls += 1;
      return `00000000-0000-4000-8000-${String(uuidCalls).padStart(12, '0')}`;
    }
  });
  const app = api.createDefaultState();
  const booking = api.createBookingRequest(app, validBookingInput, 1000).booking;
  api.confirmBookingRequest(app, booking.id, 2000);
  const feedback = api.submitFeedback(app, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: 'Private'
  }, 3000).feedback;
  app.ledger.push(
    {
      id: 'extra-booking-ref', businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: 0,
      refType: 'visit', refId: booking.id, createdAt: '2026-07-14T10:00:00.000Z'
    },
    {
      id: 'extra-feedback-ref', businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: 0,
      refType: 'visit', refId: feedback.id, createdAt: '2026-07-14T10:00:00.000Z'
    }
  );
  const balanceAfterAwards = app.balances['bitcoin-nail-bar'].points;

  const migrated = api.migrateState(app);
  assert.equal(migrated.bookingRequests.some((item) => item.id === booking.id), false);
  assert.equal(migrated.appointments.some((item) => item.bookingId === booking.id), false);
  assert.equal(migrated.ui.pendingContext.bookingId, null);
  assert.equal(migrated.feedback.some((item) => item.id === feedback.id), false);
  assert.equal(migrated.feedbackClaims.includes('visit-1001'), true);

  uuidCalls = 0;
  const ledgerBefore = JSON.stringify(migrated.ledger);
  assert.equal(api.confirmBookingRequest(migrated, booking.id, 4000).code, 'not_found');
  assert.equal(api.submitFeedback(migrated, {
    visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 1
  }, 5000).code, 'already_submitted');
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balanceAfterAwards);
  assert.equal(JSON.stringify(migrated.ledger), ledgerBefore);
  assert.equal(uuidCalls, 0);
});

function apiState(storage) {
  return JSON.parse(storage.getItem('nexora.customer.prototype.v1'));
}

test('accepts only HTTPS avatar URLs and keeps the existing avatar when blank', () => {
  const { api } = testApi();
  const current = 'https://images.example/avatar.png';
  assert.equal(api.validateAvatarUrl('', current).value, current);
  assert.equal(api.validateAvatarUrl('not a url', current).ok, false);
  assert.equal(api.validateAvatarUrl('http://images.example/avatar.png', current).ok, false);
  assert.equal(api.validateAvatarUrl('https://images.example/new.png', current).value, 'https://images.example/new.png');

  const source = html();
  const editAction = source.match(/registerAction\('edit-profile',[\s\S]*?registerAction\('payment-methods'/)?.[0];
  assert.ok(editAction, 'edit profile action must be registered');
  assert.match(editAction, /validateAvatarUrl/);
  assert.match(editAction, /setFieldError\('profile-edit-error', t\('invalidAvatar'\)\)[\s\S]*?return false/);
  assert.ok(editAction.indexOf('validateAvatarUrl') < editAction.indexOf('commitState'));
});

test('uses nested profile language with the shared translation dictionary', () => {
  const source = html();
  assert.doesNotMatch(source, /\bstate\.language\b/);
  assert.doesNotMatch(source, /state\.profile\.language\s*===\s*['"]vi['"]\s*\?/);
  assert.match(source, /const COPY\s*=/);
  assert.match(source, /function translate\(language, key, variables/);
  assert.match(source, /function t\(key, variables/);

  const { api } = testApi();
  assert.equal(api.translate('vi', 'continueTip', { amount: 15 }), 'Tiếp tục với $15');
  assert.equal(api.translate('en', 'continueTip', { amount: 15 }), 'Continue with $15');
  assert.equal(api.translate('unknown', 'offerSaved'), 'Đã lưu ưu đãi');
});

test('initializes the browser with defined entry-point dependencies', () => {
  const document = createDocumentStub();
  assert.doesNotThrow(() => testApi({}, { skipInit: false, document }));
  assert.deepEqual(document.listeners.map(({ type }) => type), ['click', 'input', 'change', 'keydown']);

  const source = html();
  for (const name of ['handleAction', 'handleInput', 'handleKeydown', 'renderApp']) {
    assert.match(source, new RegExp(`function ${name}\\(`), `${name} must be defined`);
  }
});

test('applies persisted English during bootstrap without saving state again', () => {
  const localized = createStubElement({ dataset: { vi: 'Xin chào', en: 'Hello' }, textContent: 'Xin chào' });
  const placeholder = createStubElement({ dataset: { viPh: 'Tìm kiếm', enPh: 'Search' }, placeholder: 'Tìm kiếm' });
  const viControl = createStubElement({ dataset: { language: 'vi' } });
  const enControl = createStubElement({ dataset: { language: 'en' } });
  const document = createDocumentStub({
    localizedNodes: [localized],
    placeholderNodes: [placeholder],
    languageControls: [viControl, enControl]
  });
  const storageKey = 'nexora.customer.prototype.v1';
  const persisted = JSON.stringify({ profile: { language: 'en' } });

  const { storage } = testApi({ [storageKey]: persisted }, { skipInit: false, document });

  assert.equal(document.documentElement.lang, 'en');
  assert.equal(localized.textContent, 'Hello');
  assert.equal(placeholder.placeholder, 'Search');
  assert.equal(viControl.attributes['aria-pressed'], 'false');
  assert.equal(enControl.attributes['aria-pressed'], 'true');
  assert.equal(storage.getItem(storageKey), persisted);

  const source = html();
  const applyLanguage = source.match(/function applyLanguage\(language\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*function setLanguage/)?.[1];
  assert.ok(applyLanguage, 'applyLanguage must be defined before setLanguage');
  assert.doesNotMatch(applyLanguage, /commitState|saveState/);
});

test('localizes the modal close control from persisted English', () => {
  const closeControl = createStubElement();
  const document = createDocumentStub({ overlayCloseControls: [closeControl] });
  const storageKey = 'nexora.customer.prototype.v1';

  testApi({ [storageKey]: JSON.stringify({ profile: { language: 'en' } }) }, { skipInit: false, document });

  assert.equal(closeControl.attributes['aria-label'], 'Close dialog');
});

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, 'cutomer-reward.html');

function html() {
  assert.ok(existsSync(target), 'cutomer-reward.html must exist');
  return readFileSync(target, 'utf8');
}

test('loads the approved frontend stack', () => {
  const source = html();
  assert.match(source, /@tailwindcss\/browser@4/);
  assert.match(source, /lucide(?:\.min)?\.js|unpkg\.com\/lucide/);
  assert.doesNotMatch(source, /bootstrap|font-awesome|fontawesome/i);
  assert.match(source, /id="app-shell"/);
  assert.match(source, /id="screen-region"/);
});

test('keeps Tailwind v4 stylesheet compilable', () => {
  const source = html();
  assert.doesNotMatch(
    source,
    /@apply\s+(?:[^;\n]*\s)?app-[\w-]+/,
    'Tailwind v4 cannot @apply a custom app-* component class'
  );
});

const requiredScreens = [
  'login1', 'login2', 'onb1', 'onb2', 'onb3', 'onb4', 'home', 'allmenu',
  'activity', 'wallet', 'history', 'rewards', 'redeem', 'redeemdone', 'scan',
  'tip', 'tipdone', 'pay', 'paydone', 'looks', 'addlook', 'review', 'book1',
  'book2', 'book3', 'explore', 'business', 'offers', 'referral', 'profile',
  'msgprefs'
];

function screenIds(source) {
  return [...source.matchAll(/<section\b[^>]*class="[^"]*\bapp-screen\b[^"]*"[^>]*>/g)]
    .map(([tag]) => tag.match(/\bid="([^"]+)"/)?.[1])
    .filter(Boolean);
}

test('contains the exact 31-screen inventory', () => {
  const ids = screenIds(html()).sort();
  assert.deepEqual(ids, [...requiredScreens].sort());
});

test('provides mobile bottom navigation and desktop sidebar', () => {
  const source = html();
  assert.match(source, /id="mobile-nav"[^>]*class="[^"]*lg:hidden/);
  assert.match(source, /id="desktop-sidebar"[^>]*class="[^"]*hidden[^"]*lg:flex/);
  assert.match(source, /const SCREEN_MODULE\s*=/);
  assert.match(source, /function navigateTo\(screenId/);
});

test('defines shared visual components and completes five root screens', () => {
  const source = html();
  for (const className of ['app-card', 'app-button', 'app-input', 'app-chip']) {
    assert.match(source, new RegExp(`\\.${className}\\s*\\{`));
  }
  for (const id of ['home', 'wallet', 'scan', 'explore', 'profile']) {
    assert.match(source, new RegExp(`<section[^>]+id="${id}"[^>]+data-ready="true"`));
  }
  assert.doesNotMatch(source, /class="[^"]*\b(phone|notch|status)\b/);
});

const detailScreens = [
  'login1', 'login2', 'onb1', 'onb2', 'onb3', 'onb4', 'allmenu', 'activity',
  'history', 'rewards', 'redeem', 'redeemdone', 'tip', 'tipdone', 'pay', 'paydone',
  'looks', 'addlook', 'review', 'book1', 'book2', 'book3', 'business', 'offers',
  'referral', 'msgprefs'
];

test('completes every detail screen', () => {
  const source = html();
  for (const id of detailScreens) {
    assert.match(source, new RegExp(`<section[^>]+id="${id}"[^>]+data-ready="true"`));
    assert.match(source, new RegExp(`id="${id}-title"`));
  }
  assert.equal((source.match(/data-ready="true"/g) || []).length, 31);
});

test('implements delegated interactions for the complete prototype', () => {
  const source = html();
  const functions = [
    'createDefaultState', 'migrateState', 'loadState', 'saveState',
    'navigateTo', 'setLanguage', 'showToast', 'openOverlay', 'closeOverlay',
    'renderApp', 'requestOtp', 'verifyOtp', 'recordConsent',
    'appendLedger', 'redeemReward', 'createTip', 'confirmTipRecord',
    'createDirectPayment', 'confirmDirectPayment', 'createBookingRequest',
    'confirmBookingRequest', 'submitFeedback', 'saveLookRecord',
    'toggleSavedOffer', 'addWishRecord', 'toggleFollowTech', 'submitCheckin'
  ];
  for (const name of functions) {
    assert.match(source, new RegExp(`function ${name}\\(`), `${name} must be implemented`);
  }
  assert.match(source, /function handleAction\(event\)/);
  assert.match(source, /document\.addEventListener\('click', handleAction\)/);
  assert.doesNotMatch(source, /\sonclick=/i);
});

test('keeps Vietnamese and English content in sync', () => {
  const source = html();
  const tags = source.match(/<[^!/][^>]*>/g) || [];
  for (const tag of tags) {
    if (/\bdata-en=/.test(tag)) assert.match(tag, /\bdata-vi=/, `missing data-vi: ${tag}`);
    if (/\bdata-vi=/.test(tag)) assert.match(tag, /\bdata-en=/, `missing data-en: ${tag}`);
    if (/\bdata-en-ph=/.test(tag)) assert.match(tag, /\bdata-vi-ph=/, `missing data-vi-ph: ${tag}`);
    if (/\bdata-vi-ph=/.test(tag)) assert.match(tag, /\bdata-en-ph=/, `missing data-en-ph: ${tag}`);
  }
  assert.match(source, /function setLanguage\(language\)/);
});

test('renders persisted profile and immediate per-business preferences', () => {
  const source = html();
  for (const hook of ['data-profile-name', 'data-profile-phone', 'data-profile-avatar', 'data-business-pref']) {
    assert.match(source, new RegExp(hook));
  }
  assert.match(source, /<[^>]+data-for-you(?:[\s=>])/);
  assert.match(source, /type="checkbox" checked disabled aria-disabled="true"/);
  assert.match(source, /function renderProfile\(\)/);
  assert.match(source, /function renderPreferences\(\)/);
  assert.match(source, /function handleChange\(event\)/);
  assert.match(source, /addEventListener\('change', handleChange\)/);
  assert.doesNotMatch(source, /data-action="save-preferences"/);
});

test('renders persisted balances across home wallet and rewards hooks', () => {
  const points = createStubElement({ dataset: { balancePoints: 'bitcoin-nail-bar' }, textContent: '2,450' });
  const withUnit = createStubElement({ dataset: { balanceWithUnit: 'bitcoin-nail-bar' }, textContent: '2.450 điểm' });
  const available = createStubElement({ dataset: { balanceAvailable: 'bitcoin-nail-bar' }, textContent: 'Có thể dùng 2.450 điểm' });
  const document = createDocumentStub({
    balancePointNodes: [points],
    balanceWithUnitNodes: [withUnit],
    balanceAvailableNodes: [available]
  });
  const storageKey = 'nexora.customer.prototype.v1';
  const { context } = testApi({
    [storageKey]: JSON.stringify({ balances: { 'bitcoin-nail-bar': { points: 2475 } } })
  }, { skipInit: false, document });

  assert.equal(points.textContent, '2.475');
  assert.equal(withUnit.textContent, '2.475 điểm');
  assert.equal(available.textContent, 'Có thể dùng 2.475 điểm');
  context.openReward('credit5', false);
  assert.equal(document.getElementById('reward-balance').textContent, '2.475 điểm');
  assert.equal(document.getElementById('reward-after').textContent, '1.975 điểm');

  const source = html();
  assert.ok((source.match(/data-balance-points=/g) || []).length >= 1);
  assert.match(source, /data-balance-business="bitcoin-nail-bar"/);
  assert.match(source, /data-balance-with-unit="bitcoin-nail-bar"/);
  assert.match(source, /data-balance-available="bitcoin-nail-bar"/);
  assert.match(source, /id="wallet-business-list"/);
  assert.match(source, /id="ledger-list"/);
  assert.match(source, /id="reward-list"/);
  assert.match(source, /function renderBalances\(\)/);
  assert.match(source, /function renderDomainViews\(\)\s*\{\s*renderProfile\(\);\s*renderBalances\(\);\s*renderLedger\(\);\s*renderRewards\(\);/);

  const claimAction = source.match(/registerAction\('claim-welcome',[\s\S]*?registerAction\('accept-consent'/)?.[0];
  assert.ok(claimAction.indexOf('renderBalances()') < claimAction.indexOf("navigateTo('onb2')"));
});

test('renders seven business-aware rewards without unsafe state HTML', () => {
  const document = createDocumentStub();
  testApi({
    'nexora.customer.prototype.v1': JSON.stringify({
      businesses: { 'bitcoin-nail-bar': { name: '<img src=x onerror=alert(1)>' } }
    })
  }, { skipInit: false, document });

  const walletCards = document.getElementById('wallet-business-list').children;
  const rewardCards = document.getElementById('reward-list').children;
  assert.equal(walletCards.length, 3);
  assert.equal(walletCards[0].children[0].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(rewardCards.length, 7);
  const gelButton = rewardCards.at(-1).children.at(-1).children.at(-1);
  assert.equal(gelButton.disabled, true);
  assert.equal(gelButton.textContent, 'Cần thêm 50');

  const source = html();
  assert.doesNotMatch(source, /data-signature-reward-cta/);
  assert.match(source, /<div id="wallet-business-list" class="[^"]*"><\/div>/);
  assert.match(source, /const REWARDS\s*=\s*\{/);
  for (const key of ['credit5', 'freepedi', 'voucher25', 'glow', 'moon', 'bistro', 'gel']) {
    assert.match(source, new RegExp(`${key}: \\{ key: '${key}'`));
  }
  for (const [start, end] of [
    ['renderBalances', 'LEDGER_LABEL_KEYS'],
    ['renderLedger', 'rewardAvailability'],
    ['renderRewards', 'renderDomainViews']
  ]) {
    const body = source.match(new RegExp(`function ${start}\\(.*?\\) \\{([\\s\\S]*?)\\n\\s*\\}\\n\\n\\s*(?:const |function )${end}`))?.[1];
    assert.ok(body, `${start} renderer must be available`);
    assert.doesNotMatch(body, /innerHTML/, `${start} must not interpolate persisted state as HTML`);
  }
});

test('covers accessibility, motion and UI edge states', () => {
  const source = html();
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
  for (const state of ['loading', 'empty', 'error']) {
    assert.match(source, new RegExp(`data-state="${state}"`));
  }
  const iconButtons = (source.match(/<button\b[^>]*class="[^"]*\bicon-button\b[^"]*"[^>]*>/g) || []);
  assert.ok(iconButtons.length > 0);
  for (const button of iconButtons) assert.match(button, /aria-label="[^"]+"/);
});

test('gives every enabled button an action and wires the known global controls', () => {
  const source = html();
  const buttons = source.match(/<button\b[\s\S]*?<\/button>/g) || [];
  const registeredActions = new Set([...source.matchAll(/registerAction\('([^']+)'/g)].map(([, action]) => action));
  for (const button of buttons) {
    const openingTag = button.match(/<button\b[^>]*>/)?.[0] ?? '';
    if (/\sdisabled(?:\s|=|>)/.test(openingTag)) continue;
    const interactive = /data-action=|data-nav-target=|data-explore-filter=|data-offer-filter=|data-payment-method=|data-book-(?:service|staff|day|time)=/.test(openingTag);
    assert.ok(interactive, `enabled button needs an action: ${button.slice(0, 160)}`);
    const action = openingTag.match(/data-action="([^"]+)"/)?.[1];
    if (action) assert.ok(registeredActions.has(action), `button action must be registered: ${action}`);
  }
  for (const action of ['open-notifications', 'edit-profile', 'payment-methods', 'privacy-details', 'logout', 'reset-demo']) {
    assert.match(source, new RegExp(`data-action="${action}"`));
    assert.ok(registeredActions.has(action), `global action must be registered: ${action}`);
  }
});

test('renders a raised mobile Scan control without changing desktop sidebar behavior', () => {
  const source = html();
  assert.match(source, /mobile-scan-button/);
  assert.match(source, /mobile-scan-icon/);
  assert.match(source, /item\.id === 'scan'/);
  assert.match(source, /id="desktop-nav"/);
  const desktopTemplate = source.match(/getElementById\('desktop-nav'\)\.innerHTML = ([\s\S]*?);\n\s*document\.getElementById\('mobile-nav'\)/)?.[1];
  assert.ok(desktopTemplate, 'desktop navigation template must be isolated');
  assert.match(desktopTemplate, /class="nav-item w-full"/);
  assert.doesNotMatch(desktopTemplate, /mobile-scan-(?:button|icon)/);
});

test('refreshes the unread notification label immediately after opening notifications', () => {
  const notification = createStubElement({ dataset: { action: 'open-notifications' } });
  const document = createDocumentStub({ notificationControls: [notification] });
  const { context } = testApi({}, { skipInit: false, document });
  const event = {
    target: {
      closest(selector) { return selector === '[data-action]' ? notification : null; }
    }
  };

  assert.equal(notification.attributes['aria-label'], 'Thông báo, 1 chưa đọc');
  context.handleAction(event);
  assert.equal(notification.attributes['aria-label'], 'Thông báo, 0 chưa đọc');
});

test('traps modal focus, closes with Escape and restores a safe focus target', () => {
  const document = createDocumentStub();
  const { context } = testApi({}, { document });
  const overlay = document.getElementById('app-overlay');
  const close = createStubElement({ dataset: { action: 'close-overlay' }, onFocus: (element) => { document.activeElement = element; } });
  const cancel = document.getElementById('overlay-cancel');
  const confirm = document.getElementById('overlay-confirm');
  overlay.querySelectorAll = () => [close, cancel, confirm];
  const trigger = document.getElementById('modal-trigger');
  const screenRegion = document.getElementById('screen-region');
  trigger.focus();

  context.openOverlay({ title: 'Kiểm tra', html: 'Nội dung', hideCancel: true }, trigger);
  const persistedOverlay = vm.runInContext('state.ui.overlay', context);
  assert.equal(JSON.stringify(persistedOverlay), '{"kind":"dialog"}');
  assert.equal(Object.values(persistedOverlay).some((value) => typeof value === 'function' || value === trigger), false);
  assert.equal(document.activeElement, confirm);

  let prevented = false;
  context.handleKeydown({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(document.activeElement, close);

  context.handleKeydown({ key: 'Tab', shiftKey: true, preventDefault() {} });
  assert.equal(document.activeElement, confirm);
  context.handleKeydown({ key: 'Escape', preventDefault() {} });
  assert.equal(overlay.attributes['aria-hidden'], 'true');
  assert.equal(document.activeElement, trigger);

  trigger.isConnected = false;
  context.openOverlay({ title: 'Kiểm tra', html: 'Nội dung' }, trigger);
  context.closeOverlay(null);
  assert.equal(document.activeElement, screenRegion);
});

test('cancel and confirm modal actions close the dialog and run the matching callback', () => {
  const document = createDocumentStub();
  const { context } = testApi({}, { document });
  const overlay = document.getElementById('app-overlay');
  const trigger = document.getElementById('modal-trigger');
  const cancel = document.getElementById('overlay-cancel');
  const confirm = document.getElementById('overlay-confirm');
  const results = [];
  const eventFor = (control) => ({
    target: { closest(selector) { return selector === '[data-action]' ? control : null; } }
  });

  cancel.dataset.action = 'cancel-overlay';
  confirm.dataset.action = 'confirm-overlay';
  context.openOverlay({ title: 'Cancel', html: 'Body', onCancel: () => results.push('cancel') }, trigger);
  context.handleAction(eventFor(cancel));
  assert.equal(overlay.attributes['aria-hidden'], 'true');

  context.openOverlay({ title: 'Confirm', html: 'Body', onConfirm: () => results.push('confirm') }, trigger);
  context.handleAction(eventFor(confirm));
  assert.equal(overlay.attributes['aria-hidden'], 'true');
  assert.deepEqual(results, ['cancel', 'confirm']);
});

test('keeps a modal form open when its confirm callback rejects validation', () => {
  const document = createDocumentStub();
  const { context } = testApi({}, { document });
  const overlay = document.getElementById('app-overlay');
  const trigger = document.getElementById('modal-trigger');
  let attempts = 0;

  context.openOverlay({
    title: 'Edit profile',
    html: '<input>',
    onConfirm: () => { attempts += 1; return false; }
  }, trigger);
  context.closeOverlay(true);

  assert.equal(attempts, 1);
  assert.equal(overlay.attributes['aria-hidden'], 'false');
  assert.equal(vm.runInContext('state.ui.overlay.kind', context), 'dialog');
});

test('clears a persisted modal marker after an accepted confirm callback', () => {
  const document = createDocumentStub();
  const { api, context, storage } = testApi({}, { document });
  context.openOverlay({
    title: 'Edit profile',
    html: '<input>',
    onConfirm: () => context.commitState((draft) => { draft.profile.name = 'Lan Nguyen'; })
  });

  context.closeOverlay(true);

  assert.equal(api.loadState(storage).profile.name, 'Lan Nguyen');
  assert.equal(api.loadState(storage).ui.overlay, null);
});

test('commitState swaps live state only after draft persistence succeeds', () => {
  const { context, storage } = testApi();
  const before = vm.runInContext('state.profile.name', context);
  const originalSetItem = storage.setItem.bind(storage);
  storage.setItem = () => { throw new Error('quota'); };
  const failed = context.commitState((draft) => { draft.profile.name = 'Unsaved'; return { ok: true }; });
  assert.equal(failed.code, 'persist_failed');
  assert.equal(vm.runInContext('state.profile.name', context), before);
  storage.setItem = originalSetItem;
  const saved = context.commitState((draft) => { draft.profile.name = 'Saved'; return { ok: true }; });
  assert.equal(saved.ok, true);
  assert.equal(vm.runInContext('state.profile.name', context), 'Saved');
  assert.equal(storage.getItem('nexora.customer.prototype.v1').includes('Saved'), true);
});

test('persists looks, saved offers and unique wishes', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.saveLookRecord(app, { businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-anna', staffName: 'Anna', service: 'Pedicure', color: '#710 Sea Glass', note: 'Da nhạy cảm', photoDataUrl: '' }, 1000).ok, true);
  assert.equal(api.toggleSavedOffer(app, 'offer-glow'), true);
  assert.equal(api.toggleSavedOffer(app, 'offer-glow'), false);
  assert.equal(api.addWishRecord(app, 'Pedicure deal').ok, true);
  assert.equal(api.addWishRecord(app, 'pedicure deal').code, 'duplicate');
  assert.equal(app.looks.at(0).note, 'Da nhạy cảm');
});

test('allows follow-tech only after a shared visit and never stores follower counts', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.canFollowTech(app, 'staff-anna'), true);
  assert.equal(api.canFollowTech(app, 'staff-stranger'), false);
  assert.equal(api.toggleFollowTech(app, 'staff-stranger').code, 'no_shared_visit');
  assert.equal(api.toggleFollowTech(app, 'staff-anna').following, true);
  const before = app.notifications.length;
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 1000).code, 'tech_opted_out');
  app.staffProfiles['staff-anna'].followNotifyOptIn = true;
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 2000).ok, true);
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 3000).code, 'already_notified');
  assert.equal(app.notifications.length, before + 1);
  assert.equal('followerCount' in app, false);
});

test('keeps look writes atomic across ownership, timestamp, UUID and photo migration checks', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app);
  assert.equal(api.saveLookRecord(app, { businessId: 'golden-glow-spa', visitId: 'visit-1001', staffProfileId: 'staff-anna', service: 'Gel' }, 1000).code, 'visit_business_mismatch');
  assert.equal(JSON.stringify(app), before);
  assert.equal(api.saveLookRecord(app, { businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-maria', service: 'Gel' }, 1000).code, 'staff_visit_mismatch');
  assert.equal(JSON.stringify(app), before);
  assert.equal(api.saveLookRecord(app, { businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-anna', service: 'Gel' }, Number.NaN).code, 'invalid_time');
  assert.equal(JSON.stringify(app), before);

  const photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';
  const saved = api.saveLookRecord(app, { businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-anna', service: 'Gel', photoDataUrl: photo }, 1000);
  assert.equal(saved.ok, true);
  assert.equal(saved.look.photoDataUrl, photo);
  assert.equal(api.migrateState(app).looks.at(0).photoDataUrl, photo);
});

test('does not mutate follows or notifications when notification inputs are invalid', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  api.toggleFollowTech(app, 'staff-anna');
  app.staffProfiles['staff-anna'].followNotifyOptIn = true;
  const before = JSON.stringify(app);
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', Infinity).code, 'invalid_time');
  assert.equal(JSON.stringify(app), before);
  const invalidUuidApi = testApi({}, { randomUUID: () => 'not-a-uuid' }).api;
  const invalidUuidApp = invalidUuidApi.createDefaultState();
  invalidUuidApi.toggleFollowTech(invalidUuidApp, 'staff-anna');
  invalidUuidApp.staffProfiles['staff-anna'].followNotifyOptIn = true;
  const invalidBefore = JSON.stringify(invalidUuidApp);
  assert.equal(invalidUuidApi.createTechMoveNotification(invalidUuidApp, 'staff-anna', 'golden-glow-spa', 1000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(invalidUuidApp), invalidBefore);
});

test('saves look metadata without a photo when localStorage quota is exhausted', () => {
  const document = createDocumentStub();
  const { context, storage } = testApi({}, { document });
  document.getElementById('look-service').value = 'Gel';
  document.getElementById('look-color').value = 'Sea Glass';
  document.getElementById('look-notes').value = 'Sensitive skin';
  document.getElementById('look-photo-preview').dataset.photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';
  const originalSetItem = storage.setItem.bind(storage);
  let writes = 0;
  storage.setItem = (key, value) => {
    writes += 1;
    if (writes === 1) {
      const error = new Error('quota');
      error.name = 'QuotaExceededError';
      throw error;
    }
    return originalSetItem(key, value);
  };
  const control = createStubElement({ dataset: { action: 'save-look' } });
  context.handleAction({ target: { closest: (selector) => selector === '[data-action]' ? control : null } });
  const saved = vm.runInContext('state.looks.find((look) => look.note === "Sensitive skin")', context);
  assert.equal(saved.note, 'Sensitive skin');
  assert.equal(saved.photoDataUrl, '');
});

test('upload-look opens the picker and file changes update the preview', async () => {
  const input = createStubElement({ id: 'look-photo-input' });
  const preview = createStubElement({ id: 'look-photo-preview' });
  input.matches = (selector) => selector === '[data-look-photo]';
  input.files = [{}];
  const document = createDocumentStub({ extraElements: [input, preview] });
  const { context } = testApi({}, { document });
  const photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';
  context.compressImage = async () => photo;
  const control = createStubElement({ dataset: { action: 'upload-look' } });
  context.handleAction({ target: { closest: (selector) => selector === '[data-action]' ? control : null } });
  assert.equal(input.clicked, true);

  await context.handleChange({ target: input });
  assert.equal(preview.dataset.photo, photo);
  assert.equal(preview.src, photo);
  assert.equal(preview.classList.contains('hidden'), false);
});

test('migrates followed technicians and looks only when visit ownership is canonical', () => {
  const { api } = testApi();
  const migrated = api.migrateState({
    followedTechIds: ['staff-maria', 'staff-anna', 'staff-maria'],
    looks: [
      { id: 'look-valid', businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-anna', createdAt: '2026-07-14T12:00:00.000Z', service: 'Gel' },
      { id: 'look-null-staff', businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: null, createdAt: '2026-07-14T12:01:00.000Z', service: 'Gel' },
      { id: 'look-wrong-staff', businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-maria', createdAt: '2026-07-14T12:02:00.000Z', service: 'Gel' },
      { id: 'look-wrong-business', businessId: 'golden-glow-spa', visitId: 'visit-1001', staffProfileId: 'staff-anna', createdAt: '2026-07-14T12:03:00.000Z', service: 'Gel' }
    ]
  });

  assert.deepEqual(migrated.followedTechIds, ['staff-anna']);
  assert.deepEqual(migrated.looks.map((look) => look.id), ['look-valid']);
  assert.equal(migrated.looks[0].staffProfileId, 'staff-anna');
  assert.equal(migrated.looks[0].businessId, 'bitcoin-nail-bar');
});

test('rejects tampered followed technicians and malformed opt-in values before UUID creation', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, { randomUUID: () => {
    uuidCalls += 1;
    return '00000000-0000-4000-8000-000000000099';
  } });
  const app = api.createDefaultState();
  app.followedTechIds = ['staff-maria'];
  app.staffProfiles['staff-maria'].followNotifyOptIn = true;
  const before = JSON.stringify(app);
  assert.equal(api.createTechMoveNotification(app, 'staff-maria', 'golden-glow-spa', 1000).code, 'no_shared_visit');
  assert.equal(JSON.stringify(app), before);
  assert.equal(uuidCalls, 0);

  app.followedTechIds = ['staff-anna'];
  for (const malformedOptIn of ['true', 1, 'false']) {
    app.staffProfiles['staff-anna'].followNotifyOptIn = malformedOptIn;
    const snapshot = JSON.stringify(app);
    assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 1000).code, 'tech_opted_out');
    assert.equal(JSON.stringify(app), snapshot);
  }
});

test('refreshes dynamic offer view and use labels after switching to English', () => {
  const saveLabel = createStubElement({ textContent: 'Lưu ưu đãi' });
  const saveControl = createStubElement({
    dataset: { action: 'save-offer', offerId: 'offer-glow' },
    querySelectors: { span: saveLabel }
  });
  const viewControl = createStubElement({ dataset: { action: 'view-offer', offerId: 'offer-glow' }, textContent: 'Xem' });
  const useControl = createStubElement({ dataset: { action: 'use-offer', rewardKey: 'glow' }, textContent: 'Dùng ưu đãi' });
  const body = createStubElement({ querySelectors: {
    '[data-action="view-offer"]': viewControl,
    '[data-action="use-offer"]': useControl
  } });
  const card = createStubElement({
    dataset: { offerId: 'offer-glow', category: 'beauty', search: 'glow' },
    querySelectors: {
      '[data-action="save-offer"]': saveControl,
      '.p-4': body
    }
  });
  const document = createDocumentStub({ selectorNodes: {
    '[data-offer-card]': [card],
    '[data-action="save-offer"]': [saveControl],
    '[data-offer-filter]': []
  } });
  const { context } = testApi({}, { document });
  context.renderOffers();
  assert.equal(viewControl.textContent, 'Xem');
  assert.equal(useControl.textContent, 'Dùng ưu đãi');
  context.setLanguage('en');
  assert.equal(viewControl.textContent, 'View');
  assert.equal(useControl.textContent, 'Use offer');
});

test('maps every declared data-action to a registered handler', () => {
  const source = html();
  const declared = new Set([...source.matchAll(/data-action="([^"]+)"/g)].map((match) => match[1]));
  const registered = new Set([...source.matchAll(/registerAction\('([^']+)'/g)].map((match) => match[1]));
  const missing = [...declared].filter((name) => !registered.has(name));
  assert.deepEqual(missing, []);
});

test('keeps all screen and back targets valid', () => {
  const source = html();
  const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, target] of source.matchAll(/data-(?:target|back-target)="([^"]+)"/g)) {
    assert.ok(ids.has(target), `missing target #${target}`);
  }
});

test('contains persistence, transaction and customer marketplace contracts', () => {
  const source = html();
  for (const token of ['nexora.customer.prototype.v1', 'confirmTipRecord', 'confirmDirectPayment', 'confirmBookingRequest', 'submitFeedback', 'toggleFollowTech']) assert.match(source, new RegExp(token));
  assert.doesNotMatch(source, /followerCount|followerList|Interview Invite|Find Work/);
  assert.doesNotMatch(source, /const state = \{\s*activeScreen/);
  assert.doesNotMatch(source, /state\.(?:language|activeScreen|activeModule|pointBalance|savedOffers|booking|rating)\b/);
});

test('removes obsolete pre-localStorage action functions', () => {
  const source = html();
  for (const name of ['startScan', 'selectTip', 'sendTip', 'confirmTip', 'sendPayment', 'confirmPayment', 'confirmReward', 'saveOffer', 'addWish', 'saveLook', 'submitReview', 'reviewBooking', 'confirmBooking']) {
    assert.doesNotMatch(source, new RegExp(`function ${name}\\(`));
  }
});

test('keeps platform stubs responsive instead of silently succeeding', () => {
  const source = html();
  for (const action of ['start-scan', 'enter-code', 'scan-receipt', 'show-directions', 'open-google-review', 'payment-methods', 'privacy-details']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
  assert.match(source, /catch\s*\{/);
});

test('stages a salon scan without awarding points and supports a different salon next', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app.balances);
  const first = api.stageSalonScan(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna');
  assert.equal(first.context.businessId, 'bitcoin-nail-bar');
  assert.equal(JSON.stringify(app.balances), before);
  const second = api.stageSalonScan(app, 'https://nexoratouch.com/touch/golden-glow-spa/lobby');
  assert.equal(second.context.businessId, 'golden-glow-spa');
  assert.equal(app.ui.selectedBusinessId, 'golden-glow-spa');
  assert.equal(JSON.stringify(app.balances), before);
});

function seedGuestCheckin(api, app, {
  payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front',
  serviceKey = 'deluxe-pedicure',
  staffProfileId = null,
  now = 1000
} = {}) {
  assert.equal(api.stageSalonScan(app, payload).ok, true);
  const created = api.createGuestCheckin(app, {
    name: 'Amy Nguyen', phone: '8325550198', serviceKey, staffProfileId
  }, now);
  assert.equal(created.ok, true);
  return created.guestCheckin;
}

test('calculates checkout promo tip and total in integer cents', () => {
  const { api } = testApi();
  const totals = api.calculateCheckoutTotals([
    { id: 'service', type: 'service', label: 'Deluxe Pedicure', amountCents: 5500 },
    { id: 'promo', type: 'discount', label: 'Promo NEW10', amountCents: -550 },
    { id: 'addon', type: 'addon', label: 'Gel Polish', amountCents: 1500 }
  ], 1800);
  assert.equal(JSON.stringify(totals), JSON.stringify({
    subtotalCents: 7000, discountCents: 550, beforeTipCents: 6450,
    tipCents: 1161, totalCents: 7611
  }));
});

test('rejects invalid checkout line-item signs and every unsafe integer total', () => {
  const { api } = testApi();
  for (const lineItems of [
    [{ id: 'service', type: 'service', label: 'Service', amountCents: -1 }],
    [{ id: 'discount', type: 'discount', label: 'Discount', amountCents: 1 }],
    [{ id: 'service', type: 'service', label: 'Service', amountCents: Number.MAX_SAFE_INTEGER + 1 }]
  ]) assert.equal(api.calculateCheckoutTotals(lineItems, 0).code, 'invalid_line_item');

  const sumOverflow = api.calculateCheckoutTotals([
    { id: 'service', type: 'service', label: 'Service', amountCents: Number.MAX_SAFE_INTEGER },
    { id: 'addon', type: 'addon', label: 'Add-on', amountCents: 1 }
  ], 0);
  assert.equal(sumOverflow.code, 'invalid_total');
  const tipOverflow = api.calculateCheckoutTotals([
    { id: 'service', type: 'service', label: 'Service', amountCents: 10_000_000_000_000 }
  ], 2000);
  assert.equal(tipOverflow.code, 'invalid_total');
});

test('builds checkout service prices from the business catalog and rejects caller tampering', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const before = JSON.stringify(app);
  const tampered = api.createCheckoutDraft(app, {
    guestCheckinId: guest.id,
    lineItems: [{ id: `service-${guest.id}`, type: 'service', label: 'Cheap Pedicure', amountCents: 1 }]
  }, 1000);
  assert.equal(tampered.code, 'invalid_line_items');
  assert.equal(JSON.stringify(app), before);

  const created = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
  assert.equal(created.ok, true);
  assert.equal(created.checkoutDraft.lineItems[0].amountCents, 5500);
  assert.equal(created.checkoutDraft.lineItems[0].label, 'Pedicure cao cấp');
  assert.equal(created.checkoutDraft.lineItems[1].amountCents, -550);
  assert.equal(created.checkoutDraft.beforeTipCents, 4950);
});

test('creates authoritative localized checkout drafts for all guest businesses', () => {
  for (const [payload, serviceKey, language, label, amountCents] of [
    ['https://nexoratouch.com/touch/bitcoin-nail-bar/front', 'acrylic-full-set', 'en', 'Acrylic Full Set', 6500],
    ['https://nexoratouch.com/touch/golden-glow-spa/lobby', 'signature-facial', 'vi', 'Chăm sóc da đặc trưng', 7500],
    ['https://nexoratouch.com/touch/moon-coffee/counter', 'signature-drink', 'en', 'Signature Drink', 800]
  ]) {
    const { api } = testApi();
    const app = api.createDefaultState();
    app.profile.language = language;
    const guest = seedGuestCheckin(api, app, { payload, serviceKey });
    const result = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
    assert.equal(result.ok, true);
    assert.equal(result.checkoutDraft.businessId, guest.businessId);
    assert.equal(result.checkoutDraft.lineItems.length, 1);
    assert.equal(result.checkoutDraft.lineItems[0].label, label);
    assert.equal(result.checkoutDraft.lineItems[0].amountCents, amountCents);
  }
});

test('fails closed when checkout or proof time precedes its parent event', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app, { now: 1000 });
  const beforeCheckout = JSON.stringify(app);
  assert.equal(api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 999).code, 'invalid_time_order');
  assert.equal(JSON.stringify(app), beforeCheckout);

  const created = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
  assert.equal(api.setCheckoutMethod(app, created.checkoutDraft.id, 'Card').ok, true);
  const beforeProof = JSON.stringify(app);
  assert.equal(api.submitCheckoutWithoutUpload(app, created.checkoutDraft.id, 999).code, 'invalid_time_order');
  assert.equal(JSON.stringify(app), beforeProof);
  assert.equal(api.submitCheckoutWithoutUpload(app, created.checkoutDraft.id, 1000).ok, true);
});

test('returns canonical checkout and pending proof idempotently without duplicates', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const first = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
  const again = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 2000);
  assert.equal(again.ok, true);
  assert.equal(again.idempotent, true);
  assert.equal(again.checkoutDraft.id, first.checkoutDraft.id);
  assert.equal(app.checkoutDrafts.length, 1);
  assert.equal(app.ui.pendingContext.checkoutDraftId, first.checkoutDraft.id);

  assert.equal(api.setCheckoutMethod(app, first.checkoutDraft.id, 'Pay at Counter').ok, true);
  const submitted = api.submitCheckoutWithoutUpload(app, first.checkoutDraft.id, 2000);
  const repeated = api.submitCheckoutWithoutUpload(app, first.checkoutDraft.id, 3000);
  assert.equal(repeated.ok, true);
  assert.equal(repeated.idempotent, true);
  assert.equal(repeated.proof.id, submitted.proof.id);
  assert.equal(app.paymentProofs.length, 1);
  assert.equal(app.ui.pendingContext.paymentProofId, submitted.proof.id);
});

test('rejects repeated checkout creation when the existing draft is mismatched', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const created = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
  created.checkoutDraft.lineItems[0].amountCents = 1;
  const before = JSON.stringify(app);
  assert.equal(api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 2000).code, 'invalid_existing_checkout');
  assert.equal(JSON.stringify(app), before);
});

test('rejects normalized-looking raw checkout and no-upload proof tampering on retries', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const created = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
  created.checkoutDraft.id = ` ${created.checkoutDraft.id} `;
  const beforeDraftRetry = JSON.stringify(app);
  assert.equal(api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 2000).code, 'invalid_existing_checkout');
  assert.equal(JSON.stringify(app), beforeDraftRetry);

  const second = api.createDefaultState();
  const secondGuest = seedGuestCheckin(api, second);
  const secondDraft = api.createCheckoutDraft(second, { guestCheckinId: secondGuest.id }, 1000).checkoutDraft;
  api.setCheckoutMethod(second, secondDraft.id, 'Card');
  const proof = api.submitCheckoutWithoutUpload(second, secondDraft.id, 1000).proof;
  proof.id = ` ${proof.id} `;
  proof.note = 'tampered retry note';
  second.ui.pendingContext.paymentProofId = null;
  const beforeProofRetry = JSON.stringify(second);
  assert.equal(api.submitCheckoutWithoutUpload(second, secondDraft.id, 2000).code, 'invalid_existing_proof');
  assert.equal(JSON.stringify(second), beforeProofRetry);
});

function createUuidSequence() {
  let calls = 0;
  return {
    randomUUID() {
      calls += 1;
      return `00000000-0000-4000-8000-${String(calls).padStart(12, '0')}`;
    },
    calls() { return calls; }
  };
}

test('rejects a semantic checkout duplicate with a whitespace guest parent before UUID or mutation', () => {
  const ids = createUuidSequence();
  const { api } = testApi({}, { randomUUID: () => ids.randomUUID() });
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const checkout = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000).checkoutDraft;
  checkout.guestCheckinId = ` ${guest.id} `;
  app.ui.pendingContext.checkoutDraftId = 'sentinel-checkout';
  const before = JSON.stringify(app);
  const uuidCalls = ids.calls();

  assert.equal(api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 2000).code, 'invalid_existing_checkout');
  assert.equal(JSON.stringify(app), before);
  assert.equal(ids.calls(), uuidCalls);
});

test('rejects a semantic proof duplicate with a whitespace checkout parent before UUID or mutation', () => {
  const ids = createUuidSequence();
  const { api } = testApi({}, { randomUUID: () => ids.randomUUID() });
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const checkout = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000).checkoutDraft;
  api.setCheckoutMethod(app, checkout.id, 'Card');
  const proof = api.submitCheckoutWithoutUpload(app, checkout.id, 1000).proof;
  checkout.status = 'draft';
  proof.checkoutDraftId = ` ${checkout.id} `;
  app.ui.pendingContext.paymentProofId = 'sentinel-proof';
  const before = JSON.stringify(app);
  const uuidCalls = ids.calls();

  assert.equal(api.submitCheckoutWithoutUpload(app, checkout.id, 2000).code, 'invalid_existing_proof');
  assert.equal(JSON.stringify(app), before);
  assert.equal(ids.calls(), uuidCalls);
});

test('rejects multiple semantic checkout candidates without choosing one or mutating context', () => {
  const ids = createUuidSequence();
  const { api } = testApi({}, { randomUUID: () => ids.randomUUID() });
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const checkout = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000).checkoutDraft;
  const duplicate = structuredClone(checkout);
  duplicate.id = 'checkout-00000000-0000-4000-8000-000000000099';
  duplicate.guestCheckinId = ` ${guest.id} `;
  app.checkoutDrafts.push(duplicate);
  app.ui.pendingContext.checkoutDraftId = 'sentinel-checkout';
  const before = JSON.stringify(app);
  const uuidCalls = ids.calls();

  assert.equal(api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 2000).code, 'invalid_existing_checkout');
  assert.equal(JSON.stringify(app), before);
  assert.equal(ids.calls(), uuidCalls);
});

test('rejects multiple semantic proof candidates without choosing one or mutating context', () => {
  const ids = createUuidSequence();
  const { api } = testApi({}, { randomUUID: () => ids.randomUUID() });
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const checkout = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000).checkoutDraft;
  api.setCheckoutMethod(app, checkout.id, 'Pay at Counter');
  const proof = api.submitCheckoutWithoutUpload(app, checkout.id, 1000).proof;
  const duplicate = structuredClone(proof);
  duplicate.id = 'proof-00000000-0000-4000-8000-000000000099';
  duplicate.checkoutDraftId = ` ${checkout.id} `;
  app.paymentProofs.push(duplicate);
  app.ui.pendingContext.paymentProofId = 'sentinel-proof';
  const before = JSON.stringify(app);
  const uuidCalls = ids.calls();

  assert.equal(api.submitCheckoutWithoutUpload(app, checkout.id, 2000).code, 'invalid_existing_proof');
  assert.equal(JSON.stringify(app), before);
  assert.equal(ids.calls(), uuidCalls);
});

test('keeps guest checkout pending with zero points and no receipt or claim', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const guest = seedGuestCheckin(api, app);
  const before = JSON.stringify({ balances: app.balances, ledger: app.ledger });
  const created = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
  api.setCheckoutMethod(app, created.checkoutDraft.id, 'Card');
  const result = api.submitCheckoutWithoutUpload(app, created.checkoutDraft.id, 1000);
  assert.equal(result.ok, true);
  assert.equal(created.checkoutDraft.status, 'pending_verification');
  assert.equal(result.proof.status, 'pending_verification');
  assert.equal(JSON.stringify({ balances: app.balances, ledger: app.ledger }), before);
  assert.equal(app.guestRewardClaims.length, 0);
  assert.equal(app.receipts.length, 0);
});

test('provides accessible nested checkout payment views and complete localized actions', () => {
  const source = html();
  assert.equal((source.match(/data-pay-view="(?:direct|checkout|payment-proof)"/g) || []).length, 3);
  assert.doesNotMatch(source, /\bconst SERVICE_CATALOG\b/);
  for (const action of ['open-guest-checkout', 'select-checkout-tip', 'select-checkout-method', 'continue-checkout']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
  for (const key of ['guestNotFound', 'serviceNotFound', 'checkoutFailed', 'selectPaymentMethod']) {
    assert.match(source, new RegExp(`vi:[\\s\\S]*?${key}:`), `missing Vietnamese ${key}`);
    assert.match(source, new RegExp(`en:[\\s\\S]*?${key}:`), `missing English ${key}`);
  }
  assert.match(source, /data-action="select-checkout-tip"[^>]*data-basis-points="0"[^>]*data-en="No Tip"[^>]*data-vi=/);
});

test('routes all four checkout methods without creating the wrong proof state', () => {
  for (const [method, expectedStatus, expectedProofs, expectedViLabel] of [
    ['Zelle', 'draft', 0, 'Zelle'],
    ['Venmo', 'draft', 0, 'Venmo'],
    ['Card', 'pending_verification', 1, 'Thẻ'],
    ['Pay at Counter', 'pending_verification', 1, 'Thanh toán tại quầy']
  ]) {
    const direct = createStubElement({ id: 'direct-payment-view', dataset: { payView: 'direct' } });
    const checkout = createStubElement({ id: 'guest-checkout-view', dataset: { payView: 'checkout' } });
    const proofView = createStubElement({ id: 'payment-proof-view', dataset: { payView: 'payment-proof' }, classNames: ['hidden'] });
    const proofTitle = createStubElement({ id: 'payment-proof-title' });
    const proofMethod = createStubElement({ id: 'payment-proof-method' });
    const proofAmount = createStubElement({ id: 'payment-proof-amount' });
    const proofStatus = createStubElement({ id: 'payment-proof-status' });
    const document = createDocumentStub({
      extraElements: [direct, checkout, proofView, proofTitle, proofMethod, proofAmount, proofStatus],
      selectorNodes: { '[data-pay-view]': [direct, checkout, proofView] }
    });
    const { context } = testApi({}, { document });
    vm.runInContext(`
      stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front');
      createGuestCheckin(state, { name: 'Amy Nguyen', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }, 1000);
      createCheckoutDraft(state, { guestCheckinId: state.guestCheckins[0].id }, 1000);
      setCheckoutMethod(state, state.ui.pendingContext.checkoutDraftId, ${JSON.stringify(method)});
      ACTIONS.get('continue-checkout')();
    `, context);
    const first = JSON.parse(vm.runInContext(`JSON.stringify({
      status: state.checkoutDrafts[0].status,
      proofCount: state.paymentProofs.length,
      proofStatus: state.paymentProofs[0]?.status ?? null,
      pendingProofId: state.ui.pendingContext.paymentProofId
    })`, context));
    assert.equal(first.status, expectedStatus, method);
    assert.equal(first.proofCount, expectedProofs, method);
    assert.equal(first.proofStatus, expectedProofs ? 'pending_verification' : null, method);
    assert.equal(Boolean(first.pendingProofId), expectedProofs === 1, method);
    assert.equal(proofView.attributes['aria-hidden'], 'false', method);
    assert.equal(proofMethod.textContent, expectedViLabel, method);

    vm.runInContext("ACTIONS.get('continue-checkout')()", context);
    assert.equal(vm.runInContext('state.paymentProofs.length', context), expectedProofs, `${method}: repeat`);
    vm.runInContext("state.profile.language = 'en'; renderPaymentProof()", context);
    assert.equal(proofMethod.textContent, method, `${method}: English label`);
  }
});

test('moves focus and synchronizes checkout selections and disabled reason', () => {
  const direct = createStubElement({ id: 'direct-payment-view', dataset: { payView: 'direct' } });
  const checkout = createStubElement({ id: 'guest-checkout-view', dataset: { payView: 'checkout' }, classNames: ['hidden'] });
  const proof = createStubElement({ id: 'payment-proof-view', dataset: { payView: 'payment-proof' }, classNames: ['hidden'] });
  const paymentAmount = createStubElement({ id: 'payment-amount' });
  const checkoutTitle = createStubElement({ id: 'guest-checkout-title' });
  const proofTitle = createStubElement({ id: 'payment-proof-title' });
  const itemList = createStubElement({ id: 'guest-checkout-items' });
  const beforeTip = createStubElement({ id: 'checkout-before-tip' });
  const total = createStubElement({ id: 'checkout-total' });
  const continueButton = createStubElement({ id: 'continue-checkout' });
  const disabledReason = createStubElement({ id: 'checkout-continue-reason', classNames: ['hidden'] });
  const tipButtons = [0, 1500, 1800, 2000].map((basisPoints) => createStubElement({
    dataset: { action: 'select-checkout-tip', basisPoints: String(basisPoints) }
  }));
  const methodButtons = ['Card', 'Zelle', 'Venmo', 'Pay at Counter'].map((method) => createStubElement({
    dataset: { action: 'select-checkout-method', method }
  }));
  const document = createDocumentStub({
    extraElements: [direct, checkout, proof, paymentAmount, checkoutTitle, proofTitle, itemList,
      beforeTip, total, continueButton, disabledReason],
    selectorNodes: {
      '[data-pay-view]': [direct, checkout, proof],
      '[data-action="select-checkout-tip"]': tipButtons,
      '[data-action="select-checkout-method"]': methodButtons
    }
  });
  const { api, context } = testApi({}, { document });
  vm.runInContext(`
    stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front');
    createGuestCheckin(state, { name: 'Amy Nguyen', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }, 1000);
    createCheckoutDraft(state, { guestCheckinId: state.guestCheckins[0].id }, 1000);
  `, context);

  context.renderGuestCheckout();
  assert.equal(itemList.children[0].children[0].textContent, 'Pedicure cao cấp');
  assert.equal(tipButtons[0].attributes['aria-pressed'], 'true');
  assert.equal(methodButtons.every((button) => button.attributes['aria-pressed'] === 'false'), true);
  assert.equal(continueButton.disabled, true);
  assert.equal(continueButton.attributes['aria-disabled'], 'true');
  assert.equal(disabledReason.classList.contains('hidden'), false);
  assert.equal(disabledReason.textContent, api.translate('vi', 'selectPaymentMethod'));

  vm.runInContext("setCheckoutMethod(state, state.ui.pendingContext.checkoutDraftId, 'Card')", context);
  context.renderGuestCheckout();
  assert.equal(methodButtons[0].attributes['aria-pressed'], 'true');
  assert.equal(continueButton.disabled, false);
  assert.equal(continueButton.attributes['aria-disabled'], 'false');
  assert.equal(disabledReason.classList.contains('hidden'), true);

  vm.runInContext("state.profile.language = 'en'", context);
  context.renderGuestCheckout();
  assert.equal(itemList.children[0].children[0].textContent, 'Deluxe Pedicure');

  for (const [viewName, focusTarget, activeView] of [
    ['checkout', checkoutTitle, checkout], ['payment-proof', proofTitle, proof], ['direct', paymentAmount, direct]
  ]) {
    context.showPayView(viewName);
    assert.equal(document.activeElement, focusTarget);
    assert.equal(activeView.attributes['aria-hidden'], 'false');
    for (const hiddenView of [direct, checkout, proof].filter((view) => view !== activeView)) {
      assert.equal(hiddenView.attributes['aria-hidden'], 'true');
      assert.equal(hiddenView.classList.contains('hidden'), true);
    }
  }
});

test('resets the nested pay view when the existing direct-payment route is reopened', () => {
  const home = createStubElement({ id: 'home', classNames: ['app-screen', 'is-active'] });
  const pay = createStubElement({ id: 'pay', classNames: ['app-screen', 'hidden'] });
  const direct = createStubElement({ id: 'direct-payment-view', dataset: { payView: 'direct' } });
  const checkout = createStubElement({ id: 'guest-checkout-view', dataset: { payView: 'checkout' }, classNames: ['hidden'] });
  const proof = createStubElement({ id: 'payment-proof-view', dataset: { payView: 'payment-proof' }, classNames: ['hidden'] });
  const paymentAmount = createStubElement({ id: 'payment-amount' });
  const document = createDocumentStub({
    screenNodes: [home, pay],
    extraElements: [direct, checkout, proof, paymentAmount],
    selectorNodes: { '[data-pay-view]': [direct, checkout, proof] }
  });
  const { context } = testApi({}, { document });

  context.showPayView('checkout');
  assert.equal(checkout.attributes['aria-hidden'], 'false');
  context.navigateTo('pay', { focus: false });
  assert.equal(direct.attributes['aria-hidden'], 'false');
  assert.equal(direct.classList.contains('hidden'), false);
  assert.equal(checkout.attributes['aria-hidden'], 'true');
});

function task4Api(api) {
  for (const name of ['submitPaymentProof', 'verifyPaymentProof', 'rejectPaymentProof',
    'removePaymentProofImage', 'retryRejectedCheckout', 'calculatePaymentProofRewards',
    'validateVerifiedPaymentAggregate']) {
    assert.equal(typeof api[name], 'function', `${name} must be exposed`);
  }
  return api;
}

function seedCheckoutDraft(api, app, {
  method = 'Zelle', tipBasisPoints = 1800, staffProfileId = 'staff-anna'
} = {}) {
  const guest = seedGuestCheckin(api, app, { staffProfileId });
  const created = api.createCheckoutDraft(app, { guestCheckinId: guest.id }, 1000);
  assert.equal(created.ok, true);
  assert.equal(api.setCheckoutTip(app, created.checkoutDraft.id, tipBasisPoints).ok, true);
  assert.equal(api.setCheckoutMethod(app, created.checkoutDraft.id, method).ok, true);
  return created.checkoutDraft;
}

function seedPendingProof(api, app, options = {}) {
  const checkout = seedCheckoutDraft(api, app, options);
  const result = ['Zelle', 'Venmo'].includes(checkout.method)
    ? api.submitPaymentProof(app, {
        checkoutDraftId: checkout.id,
        note: 'Zelle sent from Amy',
        imageDataUrl: 'data:image/jpeg;base64,AA=='
      }, 2000)
    : api.submitCheckoutWithoutUpload(app, checkout.id, 2000);
  assert.equal(result.ok, true);
  return { checkout, proof: result.proof };
}

test('Task 4 round 2 preflights owners and all artifact IDs before verify reject or retry', () => {
  const receiptId = 'receipt-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const claimId = 'guest-claim-visit_spend-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const variants = [
    ['duplicate semantic guest owner', (app) => {
      app.guestCheckins.push(structuredClone(app.guestCheckins[0]));
    }],
    ['noncanonical owner phone', (app) => {
      app.guestCheckins[0].phone = '(832) 555-0198';
    }],
    ['noncanonical raw owner identity', (app) => {
      app.guestCheckins[0].name = ` ${app.guestCheckins[0].name} `;
    }],
    ['unrelated malformed receipt ID', (app) => {
      app.receipts.push({ id: 'receipt-not-a-uuid', checkoutDraftId: 'checkout-unrelated' });
    }],
    ['unrelated semantic-duplicate receipt IDs', (app) => {
      app.receipts.push(
        { id: receiptId, checkoutDraftId: 'checkout-unrelated-a' },
        { id: receiptId, checkoutDraftId: 'checkout-unrelated-b' }
      );
    }],
    ['unrelated malformed claim ID', (app) => {
      app.guestRewardClaims.push({ id: 'guest-claim-tip_bonus-not-a-uuid', sourceId: 'proof-unrelated' });
    }],
    ['unrelated semantic-duplicate claim IDs', (app) => {
      app.guestRewardClaims.push(
        { id: claimId, sourceId: 'proof-unrelated-a' },
        { id: claimId, sourceId: 'proof-unrelated-b' }
      );
    }]
  ];
  for (const transition of ['verify', 'reject', 'retry']) {
    for (const [variant, mutate] of variants) {
      let uuidCalls = 0;
      let trackCalls = false;
      const ids = createUuidSequence();
      const api = task4Api(testApi({}, { randomUUID: () => {
        if (trackCalls) uuidCalls += 1;
        return ids.randomUUID();
      } }).api);
      const app = api.createDefaultState();
      const { proof } = seedPendingProof(api, app, { method: 'Zelle', staffProfileId: null });
      if (transition === 'retry') {
        assert.equal(api.rejectPaymentProof(app, proof.id, 'No match', 3000).ok, true);
      }
      mutate(app);
      const beforeBytes = JSON.stringify(app);
      const before = JSON.parse(beforeBytes);
      trackCalls = true;
      const result = transition === 'verify'
        ? api.verifyPaymentProof(app, proof.id, 3000)
        : transition === 'reject'
          ? api.rejectPaymentProof(app, proof.id, 'No match', 3000)
          : api.retryRejectedCheckout(app, proof.id, 'Pay at Counter', 4000);
      assert.equal(result.ok, false, `${transition}: ${variant}`);
      assert.deepEqual(JSON.parse(JSON.stringify(app)), before, `${transition}: ${variant}: deep state`);
      assert.equal(JSON.stringify(app), beforeBytes, `${transition}: ${variant}: byte state`);
      assert.equal(uuidCalls, 0, `${transition}: ${variant}: UUID preflight`);
    }
  }
});

test('Task 4 review formulas use subtotal and tip floors plus a fixed direct-pay bonus', () => {
  const api = task4Api(testApi().api);
  const rewardMap = (checkout) => Object.fromEntries(api.calculatePaymentProofRewards(checkout));
  assert.deepEqual(rewardMap({ subtotalCents: 99, tipCents: 99, method: 'Zelle' }), {
    directpay_bonus: 5
  });
  assert.deepEqual(rewardMap({ subtotalCents: 100, tipCents: 100, method: 'Zelle' }), {
    visit_spend: 1, directpay_bonus: 5, tip_bonus: 1
  });
  assert.deepEqual(rewardMap({ subtotalCents: 199, tipCents: 199, method: 'Card' }), {
    visit_spend: 1, directpay_bonus: 5, tip_bonus: 1
  });
  assert.deepEqual(rewardMap({ subtotalCents: 100, tipCents: 100, method: 'Pay at Counter' }), {
    visit_spend: 1, tip_bonus: 1
  });
});

test('Task 4 keeps uploaded proof pending then verifies formulas exactly once', () => {
  const loaded = testApi({}, { randomUUID: () => createUuidSequence().randomUUID() });
  const api = task4Api(loaded.api);
  const app = api.createDefaultState();
  const checkout = seedCheckoutDraft(api, app, { method: 'Zelle' });
  const memberSnapshot = JSON.stringify({ balances: app.balances, ledger: app.ledger });
  const submitted = api.submitPaymentProof(app, {
    checkoutDraftId: checkout.id,
    note: '  Zelle sent from Amy  ',
    imageDataUrl: 'data:image/jpeg;base64,AA=='
  }, 2000);
  assert.equal(submitted.ok, true);
  assert.equal(submitted.proof.status, 'pending_verification');
  assert.equal(submitted.proof.note, 'Zelle sent from Amy');
  assert.equal(app.receipts.length, 0);
  assert.equal(app.guestRewardClaims.length, 0);
  assert.equal(JSON.stringify({ balances: app.balances, ledger: app.ledger }), memberSnapshot);

  const verified = api.verifyPaymentProof(app, submitted.proof.id, 3000);
  assert.equal(verified.ok, true);
  assert.equal(verified.proof.status, 'verified');
  assert.equal(verified.receipt.method, 'Zelle');
  assert.equal(verified.receipt.tipCents, 891);
  assert.equal(verified.receipt.totalCents, 5841);
  assert.deepEqual(
    Object.fromEntries(verified.claims.map((claim) => [claim.sourceType, claim.points])),
    { visit_spend: 55, directpay_bonus: 5, tip_bonus: 8 }
  );
  assert.equal(verified.claims.every((claim) => claim.status === 'pending'
    && claim.sourceId === submitted.proof.id
    && claim.businessId === checkout.businessId), true);
  assert.equal(JSON.stringify({ balances: app.balances, ledger: app.ledger }), memberSnapshot);
  const snapshot = JSON.stringify(app);
  const repeated = api.verifyPaymentProof(app, submitted.proof.id, 4000);
  assert.equal(repeated.ok, true);
  assert.equal(repeated.idempotent, true);
  assert.equal(JSON.stringify(app), snapshot);
});

test('Task 4 rejects proof with canonical reason and never creates rewards or receipt', () => {
  const api = task4Api(testApi().api);
  const app = api.createDefaultState();
  const { proof } = seedPendingProof(api, app, { method: 'Venmo' });
  const memberSnapshot = JSON.stringify({ balances: app.balances, ledger: app.ledger });
  const rejected = api.rejectPaymentProof(app, proof.id, '  Amount does not match  ', 3000);
  assert.equal(rejected.ok, true);
  assert.equal(rejected.proof.status, 'rejected');
  assert.equal(rejected.proof.rejectReason, 'Amount does not match');
  assert.equal(app.receipts.length, 0);
  assert.equal(app.guestRewardClaims.length, 0);
  assert.equal(JSON.stringify({ balances: app.balances, ledger: app.ledger }), memberSnapshot);
  const snapshot = JSON.stringify(app);
  assert.equal(api.rejectPaymentProof(app, proof.id, 'different reason', 4000).idempotent, true);
  assert.equal(JSON.stringify(app), snapshot);
  assert.equal(api.verifyPaymentProof(app, proof.id, 4000).code, 'proof_not_pending');
});

test('Task 4 verifies Card and Pay at Counter through the same proof domain path', () => {
  for (const method of ['Card', 'Pay at Counter']) {
    const api = task4Api(testApi().api);
    const app = api.createDefaultState();
    const { proof } = seedPendingProof(api, app, { method, tipBasisPoints: 0, staffProfileId: null });
    const result = api.verifyPaymentProof(app, proof.id, 3000);
    assert.equal(result.ok, true, method);
    assert.equal(result.receipt.method, method);
    const expectedTypes = method === 'Card' ? ['visit_spend', 'directpay_bonus'] : ['visit_spend'];
    assert.equal(JSON.stringify(result.claims.map((claim) => claim.sourceType)), JSON.stringify(expectedTypes));
    assert.equal(result.claims[0].points, 55);
    if (method === 'Card') assert.equal(result.claims[1].points, 5);
  }
});

test('Task 4 keeps verification atomic across ID and chronology failures', () => {
  for (const failAt of [4, 5, 6, 7]) {
    let calls = 0;
    const { api: rawApi } = testApi({}, { randomUUID: () => {
      calls += 1;
      return calls === failAt
        ? 'invalid-id'
        : `00000000-0000-4000-8000-${String(calls).padStart(12, '0')}`;
    } });
    const api = task4Api(rawApi);
    const app = api.createDefaultState();
    const { proof } = seedPendingProof(api, app, { method: 'Zelle', staffProfileId: null });
    const before = JSON.stringify(app);
    assert.equal(api.verifyPaymentProof(app, proof.id, 3000).code, 'id_generation_failed');
    assert.equal(JSON.stringify(app), before, `ID call ${failAt}`);
  }

  const api = task4Api(testApi().api);
  const app = api.createDefaultState();
  const { proof } = seedPendingProof(api, app, { method: 'Zelle' });
  const before = JSON.stringify(app);
  assert.equal(api.verifyPaymentProof(app, proof.id, 1999).code, 'invalid_time_order');
  assert.equal(JSON.stringify(app), before);
});

test('Task 4 fails closed on checkout, proof, business, method, amount and semantic tampering', () => {
  const variants = [
    ['proof business', ({ proof }) => { proof.businessId = 'golden-glow-spa'; }],
    ['proof method', ({ proof }) => { proof.method = 'Venmo'; }],
    ['proof amount', ({ proof }) => { proof.amountCents += 1; }],
    ['proof parent whitespace', ({ proof }) => { proof.checkoutDraftId = ` ${proof.checkoutDraftId} `; }],
    ['checkout business', ({ checkout }) => { checkout.businessId = 'golden-glow-spa'; }],
    ['checkout method', ({ checkout }) => { checkout.method = 'Venmo'; }]
  ];
  for (const [label, tamper] of variants) {
    const api = task4Api(testApi().api);
    const app = api.createDefaultState();
    const seeded = seedPendingProof(api, app, { method: 'Zelle' });
    tamper(seeded);
    const before = JSON.stringify(app);
    assert.equal(api.verifyPaymentProof(app, seeded.proof.id, 3000).ok, false, label);
    assert.equal(JSON.stringify(app), before, label);
  }
});

test('Task 4 rejects semantic receipt or claim duplicates and malformed verified replay', () => {
  for (const artifact of ['receipt', 'claim']) {
    const api = task4Api(testApi().api);
    const app = api.createDefaultState();
    const { checkout, proof } = seedPendingProof(api, app, { method: 'Zelle' });
    if (artifact === 'receipt') app.receipts.push({ checkoutDraftId: ` ${checkout.id} ` });
    else app.guestRewardClaims.push({ sourceId: ` ${proof.id} ` });
    const before = JSON.stringify(app);
    assert.equal(api.verifyPaymentProof(app, proof.id, 3000).ok, false, artifact);
    assert.equal(JSON.stringify(app), before, artifact);
  }

  const api = task4Api(testApi().api);
  const app = api.createDefaultState();
  const { checkout, proof } = seedPendingProof(api, app, { method: 'Zelle' });
  assert.equal(api.verifyPaymentProof(app, proof.id, 3000).ok, true);
  app.receipts.push({ ...app.receipts[0], id: 'receipt-duplicate', checkoutDraftId: ` ${checkout.id} ` });
  const before = JSON.stringify(app);
  assert.equal(api.verifyPaymentProof(app, proof.id, 4000).ok, false);
  assert.equal(JSON.stringify(app), before);
});

test('Task 4 review aggregate rejects every malformed artifact ID, formula and owner mutation', () => {
  const variants = [
    ['receipt raw whitespace', (app) => { app.receipts[0].id = ` ${app.receipts[0].id} `; }],
    ['receipt non-v4 UUID', (app) => { app.receipts[0].id = 'receipt-00000000-0000-1000-8000-000000000004'; }],
    ['visit claim raw whitespace', (app) => { app.guestRewardClaims[0].id = ` ${app.guestRewardClaims[0].id} `; }],
    ['direct claim non-v4 UUID', (app) => { app.guestRewardClaims[1].id = 'guest-claim-directpay_bonus-00000000-0000-1000-8000-000000000006'; }],
    ['tip claim non-v4 UUID', (app) => { app.guestRewardClaims[2].id = 'guest-claim-tip_bonus-not-a-uuid'; }],
    ['wrong formula', (app) => { app.guestRewardClaims[0].points += 1; }],
    ['duplicate guest owner', (app) => { app.guestCheckins.push(structuredClone(app.guestCheckins[0])); }],
    ['noncanonical guest owner', (app) => { app.guestCheckins[0].phone = '(832) 555-0198'; }],
    ['missing receipt', (app) => { app.receipts = []; }],
    ['missing tip claim', (app) => { app.guestRewardClaims.pop(); }],
    ['receipt chronology', (app) => { app.receipts[0].createdAt = new Date(2999).toISOString(); }],
    ['claim chronology', (app) => { app.guestRewardClaims[0].createdAt = new Date(2999).toISOString(); }]
  ];
  for (const [label, mutate] of variants) {
    const ids = createUuidSequence();
    const api = task4Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
    const app = api.createDefaultState();
    const { proof } = seedPendingProof(api, app, { method: 'Zelle', staffProfileId: null });
    assert.equal(api.verifyPaymentProof(app, proof.id, 3000).ok, true, label);
    mutate(app);
    const before = JSON.stringify(app);
    assert.equal(api.validateVerifiedPaymentAggregate(app, proof.id).ok, false, label);
    assert.equal(api.verifyPaymentProof(app, proof.id, 4000).ok, false, label);
    assert.equal(JSON.stringify(app), before, `${label}: replay unchanged`);
  }
});

test('Task 4 review aggregate enforces collection-wide semantic ID uniqueness', () => {
  for (const collection of ['receipts', 'guestRewardClaims']) {
    const ids = createUuidSequence();
    const api = task4Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
    const app = api.createDefaultState();
    const { proof } = seedPendingProof(api, app, { method: 'Zelle', staffProfileId: null });
    assert.equal(api.verifyPaymentProof(app, proof.id, 3000).ok, true);
    const source = app[collection][0];
    app[collection].push({
      ...structuredClone(source),
      id: ` ${source.id} `,
      ...(collection === 'receipts' ? { checkoutDraftId: 'checkout-unrelated' } : { sourceId: 'proof-unrelated' })
    });
    const before = JSON.stringify(app);
    assert.equal(api.validateVerifiedPaymentAggregate(app, proof.id).ok, false, collection);
    assert.equal(api.verifyPaymentProof(app, proof.id, 4000).ok, false, collection);
    assert.equal(JSON.stringify(app), before, collection);
  }
});

test('Task 4 review aggregate preserves a canonical claimed reward lifecycle', () => {
  const ids = createUuidSequence();
  const api = task4Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
  const app = api.createDefaultState();
  const { proof } = seedPendingProof(api, app, { method: 'Zelle', staffProfileId: null });
  assert.equal(api.verifyPaymentProof(app, proof.id, 3000).ok, true);
  app.guestRewardClaims[0].status = 'claimed';
  app.guestRewardClaims[0].claimedAt = new Date(4000).toISOString();
  assert.equal(api.validateVerifiedPaymentAggregate(app, proof.id).ok, true);
  assert.equal(api.verifyPaymentProof(app, proof.id, 5000).idempotent, true);

  const persisted = customerJourneyFixture();
  persisted.guestRewardClaims[0].status = 'claimed';
  persisted.guestRewardClaims[0].claimedAt = '2026-07-15T03:14:00.000Z';
  const migrated = api.migrateState(persisted);
  assert.equal(migrated.checkoutDrafts.length, 1);
  assert.equal(migrated.paymentProofs.length, 1);
  assert.equal(migrated.guestRewardClaims.length, 3);
  assert.equal(migrated.guestRewardClaims[0].status, 'claimed');
});

test('Task 4 review aggregate keeps every verification ID collision atomic', () => {
  const positions = [
    [4, 'receipts', 'receipt'],
    [5, 'guestRewardClaims', 'guest-claim-visit_spend'],
    [6, 'guestRewardClaims', 'guest-claim-directpay_bonus'],
    [7, 'guestRewardClaims', 'guest-claim-tip_bonus']
  ];
  for (const [position, collection, prefix] of positions) {
    let calls = 0;
    const api = task4Api(testApi({}, { randomUUID: () => {
      calls += 1;
      return `00000000-0000-4000-8000-${String(calls).padStart(12, '0')}`;
    } }).api);
    const app = api.createDefaultState();
    const { proof } = seedPendingProof(api, app, { method: 'Zelle', staffProfileId: null });
    const uuid = `00000000-0000-4000-8000-${String(position).padStart(12, '0')}`;
    app[collection].push({ id: `${prefix}-${uuid}` });
    const before = JSON.stringify(app);
    assert.equal(api.verifyPaymentProof(app, proof.id, 3000).code, 'id_generation_failed', prefix);
    assert.equal(JSON.stringify(app), before, prefix);
  }
});

test('Task 4 review aggregate keeps retry UUID and chronology failures atomic', () => {
  for (const failAt of [4, 5]) {
    let calls = 0;
    const api = task4Api(testApi({}, { randomUUID: () => {
      calls += 1;
      return calls === failAt
        ? 'invalid-id'
        : `00000000-0000-4000-8000-${String(calls).padStart(12, '0')}`;
    } }).api);
    const app = api.createDefaultState();
    const { proof } = seedPendingProof(api, app, { method: 'Venmo', staffProfileId: null });
    assert.equal(api.rejectPaymentProof(app, proof.id, 'No match', 3000).ok, true);
    const before = JSON.stringify(app);
    assert.equal(api.retryRejectedCheckout(app, proof.id, 'Pay at Counter', 4000).code, 'id_generation_failed');
    assert.equal(JSON.stringify(app), before, `retry ID ${failAt}`);
  }

  const api = task4Api(testApi().api);
  const app = api.createDefaultState();
  const { proof } = seedPendingProof(api, app, { method: 'Venmo' });
  assert.equal(api.rejectPaymentProof(app, proof.id, 'No match', 3000).ok, true);
  const before = JSON.stringify(app);
  assert.equal(api.retryRejectedCheckout(app, proof.id, 'Zelle', 2999).code, 'invalid_time_order');
  assert.equal(JSON.stringify(app), before);
});

test('Task 4 review aggregate migration drops the entire tampered verified chain', () => {
  const variants = [
    ['receipt ID whitespace', (fixture) => { fixture.receipts[0].id = ` ${fixture.receipts[0].id} `; }],
    ['claim ID malformed', (fixture) => { fixture.guestRewardClaims[2].id = 'guest-claim-tip_bonus-invalid'; }],
    ['global receipt duplicate', (fixture) => { fixture.receipts.push(structuredClone(fixture.receipts[0])); }],
    ['global claim duplicate', (fixture) => { fixture.guestRewardClaims.push(structuredClone(fixture.guestRewardClaims[0])); }],
    ['duplicate owner', (fixture) => { fixture.guestCheckins.push(structuredClone(fixture.guestCheckins[0])); }],
    ['noncanonical owner', (fixture) => { fixture.guestCheckins[0].phone = '(832) 555-0198'; }],
    ['wrong formula', (fixture) => { fixture.guestRewardClaims[1].points = 6; }],
    ['missing receipt', (fixture) => { fixture.receipts = []; }],
    ['missing claim', (fixture) => { fixture.guestRewardClaims.pop(); }],
    ['receipt timestamp mismatch', (fixture) => { fixture.receipts[0].createdAt = '2026-07-15T03:14:00.000Z'; }],
    ['claim timestamp mismatch', (fixture) => { fixture.guestRewardClaims[0].createdAt = '2026-07-15T03:14:00.000Z'; }]
  ];
  const api = task4Api(testApi().api);
  for (const [label, mutate] of variants) {
    const fixture = customerJourneyFixture();
    mutate(fixture);
    const migrated = api.migrateState(fixture);
    assert.equal(migrated.checkoutDrafts.length, 0, `${label}: checkout`);
    assert.equal(migrated.paymentProofs.length, 0, `${label}: proof`);
    assert.equal(migrated.receipts.length, 0, `${label}: receipt`);
    assert.equal(migrated.guestRewardClaims.length, 0, `${label}: claims`);
  }
});

test('Task 4 accepts only sanitized JPEG proof images and locks verified proof images', () => {
  const api = task4Api(testApi().api);
  for (const imageDataUrl of ['data:image/png;base64,AA==', `data:image/jpeg;base64,${'A'.repeat(1_500_001)}`]) {
    const app = api.createDefaultState();
    const checkout = seedCheckoutDraft(api, app, { method: 'Zelle' });
    const before = JSON.stringify(app);
    assert.equal(api.submitPaymentProof(app, { checkoutDraftId: checkout.id, imageDataUrl }, 2000).code, 'invalid_image');
    assert.equal(JSON.stringify(app), before);
  }
  const app = api.createDefaultState();
  const { proof } = seedPendingProof(api, app, { method: 'Zelle' });
  assert.equal(api.verifyPaymentProof(app, proof.id, 3000).ok, true);
  const image = proof.imageDataUrl;
  assert.equal(api.removePaymentProofImage(app, proof.id).code, 'proof_locked');
  assert.equal(proof.imageDataUrl, image);
});

test('Task 4 retries rejected upload and counter checkouts without mutating history', () => {
  const uploadIds = createUuidSequence();
  const uploadApi = task4Api(testApi({}, { randomUUID: () => uploadIds.randomUUID() }).api);
  const uploadApp = uploadApi.createDefaultState();
  const upload = seedPendingProof(uploadApi, uploadApp, { method: 'Zelle' });
  uploadApi.rejectPaymentProof(uploadApp, upload.proof.id, 'No match', 3000);
  const oldUpload = JSON.stringify({ checkout: upload.checkout, proof: upload.proof });
  const retry = uploadApi.retryRejectedCheckout(uploadApp, upload.proof.id, 'Zelle', 4000);
  assert.equal(retry.ok, true, JSON.stringify(retry));
  assert.notEqual(retry.checkoutDraft.id, upload.checkout.id);
  assert.equal(retry.checkoutDraft.status, 'draft');
  assert.equal(retry.proof, null);
  assert.equal(JSON.stringify({ checkout: upload.checkout, proof: upload.proof }), oldUpload);
  const repeated = uploadApi.retryRejectedCheckout(uploadApp, upload.proof.id, 'Zelle', 5000);
  assert.equal(repeated.idempotent, true);
  assert.equal(repeated.checkoutDraft.id, retry.checkoutDraft.id);
  assert.equal(uploadApp.checkoutDrafts.length, 2);
  assert.equal(uploadApi.submitPaymentProof(uploadApp, {
    checkoutDraftId: retry.checkoutDraft.id, note: '', imageDataUrl: ''
  }, 5000).ok, true);

  const counterIds = createUuidSequence();
  const counterApi = task4Api(testApi({}, { randomUUID: () => counterIds.randomUUID() }).api);
  const counterApp = counterApi.createDefaultState();
  const counter = seedPendingProof(counterApi, counterApp, { method: 'Venmo' });
  counterApi.rejectPaymentProof(counterApp, counter.proof.id, 'No match', 3000);
  const counterRetry = counterApi.retryRejectedCheckout(counterApp, counter.proof.id, 'Pay at Counter', 4000);
  assert.equal(counterRetry.ok, true);
  assert.equal(counterRetry.checkoutDraft.status, 'pending_verification');
  assert.equal(counterRetry.proof.status, 'pending_verification');
  assert.equal(counterRetry.proof.method, 'Pay at Counter');
  assert.equal(counterApi.retryRejectedCheckout(counterApp, counter.proof.id, 'Pay at Counter', 5000).idempotent, true);
  assert.equal(counterApp.checkoutDrafts.length, 2);
  assert.equal(counterApp.paymentProofs.length, 2);
});

test('Task 4 payment proof and receipt controls are localized, safe and fully registered', () => {
  const source = html();
  assert.match(source, /label\.textContent = item\.label/);
  assert.match(source, /amount\.textContent = formatCents\(item\.amountCents\)/);
  const rejectedTag = source.match(/<section id="payment-rejected-view"[^>]*>/)?.[0] || '';
  assert.doesNotMatch(rejectedTag, /emerald|success/);
  for (const action of ['upload-payment-proof', 'remove-payment-proof', 'submit-payment-proof',
    'verify-payment-proof-demo', 'reject-payment-proof-demo', 'replace-payment-proof', 'pay-at-counter',
    'create-account-from-receipt', 'continue-as-guest']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
  for (const stateName of ['pending', 'confirmed', 'rejected']) {
    assert.match(source, new RegExp(`data-paydone-view="${stateName}"`));
  }
  for (const key of ['proofSavedWithoutImage', 'proofSubmitFailed', 'verificationFailed',
    'proofRejected', 'createAccount', 'continueGuest']) {
    assert.match(source, new RegExp(`vi:[\\s\\S]*?${key}:`), `missing Vietnamese ${key}`);
    assert.match(source, new RegExp(`en:[\\s\\S]*?${key}:`), `missing English ${key}`);
  }
});

test('Task 4 paydone states synchronize focus and aria while rendering canonical receipt labels as text', () => {
  const pending = createStubElement({ id: 'payment-pending-view', dataset: { paydoneView: 'pending' } });
  const confirmed = createStubElement({ id: 'payment-confirmed-view', dataset: { paydoneView: 'confirmed' }, classNames: ['hidden'] });
  const rejected = createStubElement({ id: 'payment-rejected-view', dataset: { paydoneView: 'rejected' }, classNames: ['hidden'] });
  const pendingTitle = createStubElement({ id: 'payment-pending-title' });
  const confirmedTitle = createStubElement({ id: 'payment-confirmed-title' });
  const rejectedTitle = createStubElement({ id: 'payment-rejected-title' });
  const receiptItems = createStubElement({ id: 'confirmed-receipt-items' });
  const receiptTotal = createStubElement({ id: 'confirmed-receipt-total' });
  const document = createDocumentStub({
    extraElements: [pending, confirmed, rejected, pendingTitle, confirmedTitle, rejectedTitle,
      receiptItems, receiptTotal, createStubElement({ id: 'payment-reject-reason' }),
      createStubElement({ id: 'direct-payment-result-view' })],
    selectorNodes: { '[data-paydone-view]': [pending, confirmed, rejected] }
  });
  const { api, context } = testApi({}, { document });
  task4Api(api);
  vm.runInContext(`
    const checkout = createCheckoutDraft(state, {
      guestCheckinId: createGuestCheckin(state,
        (stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front'),
        { name: 'Amy', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }), 1000).guestCheckin.id
    }, 1000).checkoutDraft;
    setCheckoutMethod(state, checkout.id, 'Zelle');
    const proof = submitPaymentProof(state, { checkoutDraftId: checkout.id, note: '', imageDataUrl: '' }, 2000).proof;
    verifyPaymentProof(state, proof.id, 3000);
    state.ui.pendingContext.paydoneKind = 'payment_proof';
    state.ui.activeScreen = 'paydone';
  `, context);
  context.renderPaydone();
  assert.equal(document.activeElement, confirmedTitle);
  assert.equal(confirmed.attributes['aria-hidden'], 'false');
  assert.equal(pending.attributes['aria-hidden'], 'true');
  assert.equal(rejected.attributes['aria-hidden'], 'true');
  assert.equal(receiptItems.children[0].children[0].textContent, 'Pedicure cao cấp');
  assert.equal(receiptTotal.textContent.length > 0, true);
});

test('Task 4 review Pay Done selects one discriminated source across render and reload', () => {
  const direct = createStubElement({ id: 'direct-payment-result-view' });
  const pending = createStubElement({ id: 'payment-pending-view', dataset: { paydoneView: 'pending' } });
  const confirmed = createStubElement({ id: 'payment-confirmed-view', dataset: { paydoneView: 'confirmed' }, classNames: ['hidden'] });
  const rejected = createStubElement({ id: 'payment-rejected-view', dataset: { paydoneView: 'rejected' }, classNames: ['hidden'] });
  const directTitle = createStubElement({ id: 'direct-paydone-title' });
  const confirmedTitle = createStubElement({ id: 'payment-confirmed-title' });
  const document = createDocumentStub({
    extraElements: [direct, pending, confirmed, rejected, directTitle, confirmedTitle,
      createStubElement({ id: 'payment-pending-title' }), createStubElement({ id: 'payment-rejected-title' }),
      createStubElement({ id: 'confirmed-receipt-items' }), createStubElement({ id: 'confirmed-receipt-total' }),
      createStubElement({ id: 'payment-reject-reason' })],
    selectorNodes: { '[data-paydone-view]': [pending, confirmed, rejected] }
  });
  const ids = createUuidSequence();
  const { api, context } = testApi({}, { document, randomUUID: () => ids.randomUUID() });
  task4Api(api);
  vm.runInContext(`
    const historicalDirect = createDirectPayment(state, {
      businessId: 'bitcoin-nail-bar', amount: 55, method: 'Zelle'
    }, 500).payment;
    const checkout = createCheckoutDraft(state, {
      guestCheckinId: createGuestCheckin(state,
        (stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front'),
        { name: 'Amy', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }), 1000).guestCheckin.id
    }, 1000).checkoutDraft;
    setCheckoutMethod(state, checkout.id, 'Zelle');
    const selectedProof = submitPaymentProof(state, {
      checkoutDraftId: checkout.id, note: '', imageDataUrl: ''
    }, 2000).proof;
    verifyPaymentProof(state, selectedProof.id, 3000);
    state.ui.pendingContext.paymentId = historicalDirect.id;
    state.ui.pendingContext.paymentProofId = selectedProof.id;
    state.ui.pendingContext.paydoneKind = 'payment_proof';
    state.ui.activeScreen = 'paydone';
  `, context);
  context.renderPaydone();
  context.renderPaymentResult();
  assert.equal(confirmed.classList.contains('hidden'), false);
  assert.equal(direct.classList.contains('hidden'), true);
  assert.equal(direct.attributes['aria-hidden'], 'true');
  assert.equal(document.activeElement, confirmedTitle);

  const raw = JSON.parse(vm.runInContext('JSON.stringify(state)', context));
  const migrated = api.migrateState(raw);
  assert.equal(migrated.directPayments.length, 1);
  assert.equal(migrated.paymentProofs.length, 1);
  assert.equal(migrated.ui.pendingContext.paydoneKind, 'payment_proof');
  assert.equal(migrated.ui.pendingContext.paymentId, null);
  assert.equal(typeof migrated.ui.pendingContext.paymentProofId, 'string');

  vm.runInContext(`
    state.ui.pendingContext.paydoneKind = 'direct_payment';
    state.ui.pendingContext.paymentId = state.directPayments[0].id;
    state.ui.pendingContext.paymentProofId = state.paymentProofs[0].id;
  `, context);
  context.renderPaydone();
  context.renderPaymentResult();
  assert.equal(direct.classList.contains('hidden'), false);
  assert.equal(direct.attributes['aria-hidden'], 'false');
  assert.equal(confirmed.attributes['aria-hidden'], 'true');
  assert.equal(document.activeElement, directTitle);
});

test('Task 4 review Pay Done never renders a tampered verified aggregate as confirmed', () => {
  const direct = createStubElement({ id: 'direct-payment-result-view' });
  const pending = createStubElement({ id: 'payment-pending-view', dataset: { paydoneView: 'pending' } });
  const confirmed = createStubElement({ id: 'payment-confirmed-view', dataset: { paydoneView: 'confirmed' }, classNames: ['hidden'] });
  const rejected = createStubElement({ id: 'payment-rejected-view', dataset: { paydoneView: 'rejected' }, classNames: ['hidden'] });
  const rejectedTitle = createStubElement({ id: 'payment-rejected-title' });
  const reason = createStubElement({ id: 'payment-reject-reason' });
  const document = createDocumentStub({
    extraElements: [direct, pending, confirmed, rejected, rejectedTitle, reason,
      createStubElement({ id: 'payment-pending-title' }), createStubElement({ id: 'payment-confirmed-title' }),
      createStubElement({ id: 'confirmed-receipt-items' }), createStubElement({ id: 'confirmed-receipt-total' })],
    selectorNodes: { '[data-paydone-view]': [pending, confirmed, rejected] }
  });
  const ids = createUuidSequence();
  const { context } = testApi({}, { document, randomUUID: () => ids.randomUUID() });
  vm.runInContext(`
    const checkout = createCheckoutDraft(state, {
      guestCheckinId: createGuestCheckin(state,
        (stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front'),
        { name: 'Amy', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }), 1000).guestCheckin.id
    }, 1000).checkoutDraft;
    setCheckoutMethod(state, checkout.id, 'Zelle');
    const proof = submitPaymentProof(state, { checkoutDraftId: checkout.id, note: '', imageDataUrl: '' }, 2000).proof;
    verifyPaymentProof(state, proof.id, 3000);
    state.guestRewardClaims[0].points += 1;
    state.ui.pendingContext.paydoneKind = 'payment_proof';
    state.ui.activeScreen = 'paydone';
  `, context);
  context.renderPaydone();
  assert.equal(confirmed.attributes['aria-hidden'], 'true');
  assert.equal(rejected.attributes['aria-hidden'], 'false');
  assert.equal(reason.textContent.length > 0, true);
  assert.equal(document.activeElement, rejectedTitle);
});

test('Task 4 round 2 integrity error hides unusable retries and executes only safe navigation', () => {
  const home = createStubElement({ id: 'home', classNames: ['app-screen', 'hidden'] });
  const paydone = createStubElement({ id: 'paydone', classNames: ['app-screen'] });
  const direct = createStubElement({ id: 'direct-payment-result-view' });
  const pending = createStubElement({ id: 'payment-pending-view', dataset: { paydoneView: 'pending' } });
  const confirmed = createStubElement({ id: 'payment-confirmed-view', dataset: { paydoneView: 'confirmed' }, classNames: ['hidden'] });
  const rejected = createStubElement({ id: 'payment-rejected-view', dataset: { paydoneView: 'rejected' }, classNames: ['hidden'] });
  const rejectedTitle = createStubElement({ id: 'payment-rejected-title' });
  const reason = createStubElement({ id: 'payment-reject-reason' });
  const replace = createStubElement({ dataset: { action: 'replace-payment-proof' } });
  const counter = createStubElement({ dataset: { action: 'pay-at-counter' } });
  replace.closest = (selector) => selector === '[data-action]' ? replace : null;
  counter.closest = (selector) => selector === '[data-action]' ? counter : null;
  const document = createDocumentStub({
    screenNodes: [home, paydone],
    extraElements: [direct, pending, confirmed, rejected, rejectedTitle, reason, replace, counter,
      createStubElement({ id: 'payment-pending-title' }), createStubElement({ id: 'payment-confirmed-title' }),
      createStubElement({ id: 'confirmed-receipt-items' }), createStubElement({ id: 'confirmed-receipt-total' })],
    selectorNodes: {
      '[data-paydone-view]': [pending, confirmed, rejected],
      '[data-action="replace-payment-proof"]': replace,
      '[data-action="pay-at-counter"]': counter
    }
  });
  const ids = createUuidSequence();
  const { context } = testApi({}, { document, randomUUID: () => ids.randomUUID() });
  vm.runInContext(`
    const checkout = createCheckoutDraft(state, {
      guestCheckinId: createGuestCheckin(state,
        (stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front'),
        { name: 'Amy', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }), 1000).guestCheckin.id
    }, 1000).checkoutDraft;
    setCheckoutMethod(state, checkout.id, 'Zelle');
    const proof = submitPaymentProof(state, { checkoutDraftId: checkout.id, note: '', imageDataUrl: '' }, 2000).proof;
    verifyPaymentProof(state, proof.id, 3000);
    state.guestRewardClaims[0].points += 1;
    state.ui.pendingContext.paydoneKind = 'payment_proof';
    state.ui.activeScreen = 'paydone';
    globalThis.integrityStateSnapshot = JSON.stringify(state);
  `, context);

  context.renderPaydone();
  assert.equal(rejected.attributes['aria-hidden'], 'false');
  for (const control of [replace, counter]) {
    assert.equal(control.disabled, true);
    assert.equal(control.classList.contains('hidden'), true);
    assert.equal(control.attributes['aria-hidden'], 'true');
    context.handleAction({ target: control });
  }
  assert.equal(vm.runInContext('JSON.stringify(state) === integrityStateSnapshot', context), true);
  const safe = rejected.children.find((child) => child.id === 'payment-integrity-safe-action');
  assert.ok(safe, 'integrity state must expose a safe action');
  assert.equal(safe.dataset.action, 'navigate');
  assert.equal(safe.dataset.target, 'home');
  assert.equal(safe.classList.contains('hidden'), false);
  safe.closest = (selector) => selector === '[data-action]' ? safe : null;
  context.handleAction({ target: safe });
  assert.equal(vm.runInContext('state.ui.activeScreen', context), 'home');
  assert.equal(home.classList.contains('hidden'), false);
});

function task5Api(api) {
  assert.equal(typeof api.mergeGuestJourney, 'function', 'mergeGuestJourney must be exposed');
  return api;
}

function seedVerifiedGuestReceipt(api, app, {
  phone = '8325550198', businessId = 'bitcoin-nail-bar', method = 'Zelle',
  tipBasisPoints = 1800, baseTime = 1000
} = {}) {
  const routes = {
    'bitcoin-nail-bar': ['https://nexoratouch.com/touch/bitcoin-nail-bar/front', 'deluxe-pedicure'],
    'golden-glow-spa': ['https://nexoratouch.com/touch/golden-glow-spa/lobby', 'signature-facial'],
    'moon-coffee': ['https://nexoratouch.com/touch/moon-coffee/counter', 'signature-drink']
  };
  const route = routes[businessId];
  assert.ok(route, `missing test route for ${businessId}`);
  assert.equal(api.stageSalonScan(app, route[0]).ok, true);
  const createdGuest = api.createGuestCheckin(app, {
    name: 'Amy Nguyen', phone, serviceKey: route[1], staffProfileId: null
  }, baseTime);
  assert.equal(createdGuest.ok, true);
  const createdCheckout = api.createCheckoutDraft(app, {
    guestCheckinId: createdGuest.guestCheckin.id
  }, baseTime + 100);
  assert.equal(createdCheckout.ok, true);
  assert.equal(api.setCheckoutTip(app, createdCheckout.checkoutDraft.id, tipBasisPoints).ok, true);
  assert.equal(api.setCheckoutMethod(app, createdCheckout.checkoutDraft.id, method).ok, true);
  const submitted = ['Zelle', 'Venmo'].includes(method)
    ? api.submitPaymentProof(app, {
        checkoutDraftId: createdCheckout.checkoutDraft.id,
        note: '', imageDataUrl: ''
      }, baseTime + 200)
    : api.submitCheckoutWithoutUpload(app, createdCheckout.checkoutDraft.id, baseTime + 200);
  assert.equal(submitted.ok, true);
  const verified = api.verifyPaymentProof(app, submitted.proof.id, baseTime + 300);
  assert.equal(verified.ok, true);
  return {
    guest: createdGuest.guestCheckin,
    checkout: createdCheckout.checkoutDraft,
    proof: submitted.proof,
    receipt: verified.receipt,
    claims: verified.claims
  };
}

function bindMergePhone(app, phone = '8325550198') {
  app.session.phone = phone;
  app.profile.phone = phone;
}

test('Task 5 merges an authoritative verified guest aggregate once without generating IDs on replay', () => {
  const ids = createUuidSequence();
  const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
  const app = api.createDefaultState();
  const fixture = seedVerifiedGuestReceipt(api, app);
  bindMergePhone(app);
  const beforePoints = app.balances['bitcoin-nail-bar'].points;
  const expectedPoints = fixture.claims.reduce((total, claim) => total + claim.points, 0);

  const merged = api.mergeGuestJourney(app, '(832) 555-0198', 3000);

  assert.equal(merged.ok, true);
  assert.equal(merged.claimedCount, fixture.claims.length);
  assert.equal(merged.claimedPoints, expectedPoints);
  assert.equal(app.balances['bitcoin-nail-bar'].points, beforePoints + expectedPoints);
  const claimed = app.guestRewardClaims.filter((claim) => claim.sourceId === fixture.proof.id);
  assert.equal(claimed.every((claim) => claim.status === 'claimed'
    && claim.claimedAt === new Date(3000).toISOString()), true);
  assert.equal(app.guestCheckins.find((row) => row.id === fixture.guest.id).claimedAt, new Date(3000).toISOString());
  assert.equal(api.validateVerifiedPaymentAggregate(app, fixture.proof.id).ok, true);
  const claimLedgers = app.ledger.filter((entry) => entry.refType === 'guest_claim');
  assert.equal(claimLedgers.length, fixture.claims.length);
  for (const claim of claimed) {
    const linked = claimLedgers.filter((entry) => entry.refId === claim.id);
    assert.equal(linked.length, 1);
    assert.equal(linked[0].businessId, claim.businessId);
    assert.equal(linked[0].type, claim.sourceType);
    assert.equal(linked[0].pointsDelta, claim.points);
    assert.equal(linked[0].createdAt, claim.claimedAt);
  }

  const snapshot = JSON.stringify(app);
  const calls = ids.calls();
  assert.equal(JSON.stringify(api.mergeGuestJourney(app, '8325550198', 4000)), JSON.stringify({
    ok: true, claimedPoints: 0, claimedCount: 0
  }));
  assert.equal(JSON.stringify(app), snapshot);
  assert.equal(ids.calls(), calls);
});

test('Task 5 rejects invalid, different, or session/profile-mismatched phones byte-for-byte', () => {
  for (const [label, sessionPhone, profilePhone, input] of [
    ['different phone', '8325550198', '8325550198', '8325550100'],
    ['invalid input', '8325550198', '8325550198', '555'],
    ['session mismatch', '8325550100', '8325550198', '8325550198'],
    ['profile mismatch', '8325550198', '8325550100', '8325550198']
  ]) {
    const ids = createUuidSequence();
    const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
    const app = api.createDefaultState();
    seedVerifiedGuestReceipt(api, app);
    app.session.phone = sessionPhone;
    app.profile.phone = profilePhone;
    const before = JSON.stringify(app);
    const calls = ids.calls();
    const result = api.mergeGuestJourney(app, input, 3000);
    assert.equal(result.ok, false, label);
    assert.equal(result.code, 'phone_mismatch', label);
    assert.equal(JSON.stringify(app), before, label);
    assert.equal(ids.calls(), calls, label);
  }
});

test('Task 5 merges multiple verified salons into exact per-business balances and ledgers', () => {
  const ids = createUuidSequence();
  const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
  const app = api.createDefaultState();
  const nail = seedVerifiedGuestReceipt(api, app, {
    businessId: 'bitcoin-nail-bar', baseTime: 1000
  });
  const spa = seedVerifiedGuestReceipt(api, app, {
    businessId: 'golden-glow-spa', baseTime: 2000
  });
  bindMergePhone(app);
  const before = Object.fromEntries(Object.entries(app.balances).map(([id, balance]) => [id, balance.points]));
  const expectedByBusiness = {};
  for (const claim of [...nail.claims, ...spa.claims]) {
    expectedByBusiness[claim.businessId] = (expectedByBusiness[claim.businessId] ?? 0) + claim.points;
  }

  const merged = api.mergeGuestJourney(app, '8325550198', 4000);

  assert.equal(merged.ok, true);
  assert.equal(merged.claimedCount, nail.claims.length + spa.claims.length);
  assert.equal(merged.claimedPoints, Object.values(expectedByBusiness).reduce((sum, value) => sum + value, 0));
  assert.equal(app.balances['bitcoin-nail-bar'].points, before['bitcoin-nail-bar'] + expectedByBusiness['bitcoin-nail-bar']);
  assert.equal(app.balances['golden-glow-spa'].points, before['golden-glow-spa'] + expectedByBusiness['golden-glow-spa']);
  assert.equal(app.balances['moon-coffee'].points, before['moon-coffee']);
  for (const claim of [...nail.claims, ...spa.claims]) {
    assert.equal(app.ledger.filter((entry) => entry.refType === 'guest_claim'
      && entry.refId === claim.id && entry.businessId === claim.businessId
      && entry.type === claim.sourceType && entry.pointsDelta === claim.points).length, 1);
  }
});

test('Task 5 preflights the whole batch and rolls back every claim when one balance or ID fails', () => {
  {
    const ids = createUuidSequence();
    const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
    const app = api.createDefaultState();
    seedVerifiedGuestReceipt(api, app, { businessId: 'bitcoin-nail-bar', baseTime: 1000 });
    seedVerifiedGuestReceipt(api, app, { businessId: 'golden-glow-spa', baseTime: 2000 });
    bindMergePhone(app);
    app.balances['golden-glow-spa'].points = -1;
    const before = JSON.stringify(app);
    const calls = ids.calls();
    assert.equal(api.mergeGuestJourney(app, '8325550198', 4000).code, 'invalid_balance');
    assert.equal(JSON.stringify(app), before);
    assert.equal(ids.calls(), calls);
  }

  {
    let failMergeId = false;
    let mergeCalls = 0;
    const ids = createUuidSequence();
    const api = task5Api(testApi({}, { randomUUID: () => {
      if (failMergeId) {
        mergeCalls += 1;
        return mergeCalls === 2 ? 'not-a-uuid' : `aaaaaaaa-aaaa-4aaa-8aaa-${String(mergeCalls).padStart(12, '0')}`;
      }
      return ids.randomUUID();
    } }).api);
    const app = api.createDefaultState();
    seedVerifiedGuestReceipt(api, app);
    bindMergePhone(app);
    const before = JSON.stringify(app);
    failMergeId = true;
    assert.equal(api.mergeGuestJourney(app, '8325550198', 3000).code, 'id_generation_failed');
    assert.equal(JSON.stringify(app), before);
  }
});

test('Task 5 fails closed on duplicate or tampered owner, artifact, formula and chronology data', () => {
  const variants = [
    ['duplicate owner', (app) => app.guestCheckins.push(structuredClone(app.guestCheckins[0]))],
    ['noncanonical owner ID', (app) => { app.guestCheckins[0].id = ` ${app.guestCheckins[0].id} `; }],
    ['claim owner mismatch', (app) => { app.guestRewardClaims[0].businessId = 'golden-glow-spa'; }],
    ['duplicate claim ID', (app) => app.guestRewardClaims.push(structuredClone(app.guestRewardClaims[0]))],
    ['proof owner mismatch', (app) => { app.paymentProofs[0].businessId = 'golden-glow-spa'; }],
    ['unrelated malformed proof ID', (app) => {
      app.paymentProofs.push({ id: 'proof-not-a-uuid', status: 'pending_verification' });
    }],
    ['duplicate receipt ID', (app) => app.receipts.push(structuredClone(app.receipts[0]))],
    ['formula tamper', (app) => { app.guestRewardClaims[0].points += 1; }],
    ['claim chronology tamper', (app) => { app.guestRewardClaims[0].createdAt = new Date(5000).toISOString(); }],
    ['duplicate ledger ID', (app) => app.ledger.push(structuredClone(app.ledger[0]))]
  ];
  for (const [label, mutate] of variants) {
    const ids = createUuidSequence();
    const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
    const app = api.createDefaultState();
    seedVerifiedGuestReceipt(api, app);
    bindMergePhone(app);
    mutate(app);
    const before = JSON.stringify(app);
    const calls = ids.calls();
    assert.equal(api.mergeGuestJourney(app, '8325550198', 6000).ok, false, label);
    assert.equal(JSON.stringify(app), before, label);
    assert.equal(ids.calls(), calls, label);
  }

  const ids = createUuidSequence();
  const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
  const app = api.createDefaultState();
  seedVerifiedGuestReceipt(api, app);
  bindMergePhone(app);
  const before = JSON.stringify(app);
  assert.equal(api.mergeGuestJourney(app, '8325550198', 1299).code, 'invalid_time_order');
  assert.equal(JSON.stringify(app), before);
  assert.equal(ids.calls(), 7);
});

test('Task 5 enforces the pending and claimed guest-claim ledger lifecycle', () => {
  {
    const ids = createUuidSequence();
    const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
    const app = api.createDefaultState();
    const fixture = seedVerifiedGuestReceipt(api, app);
    bindMergePhone(app);
    app.ledger.unshift({
      id: 'ledger-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      businessId: fixture.claims[0].businessId,
      type: fixture.claims[0].sourceType,
      pointsDelta: fixture.claims[0].points,
      refType: 'guest_claim',
      refId: fixture.claims[0].id,
      createdAt: new Date(3000).toISOString()
    });
    const before = JSON.stringify(app);
    assert.equal(api.mergeGuestJourney(app, '8325550198', 3000).ok, false);
    assert.equal(JSON.stringify(app), before);
  }

  for (const [label, mutate] of [
    ['missing claimed ledger', (app, claim) => {
      app.ledger = app.ledger.filter((entry) => entry.refId !== claim.id);
    }],
    ['wrong claimed ledger', (app, claim) => {
      app.ledger.find((entry) => entry.refId === claim.id).pointsDelta += 1;
    }],
    ['ambiguous claimed ledger ref', (app, claim) => {
      const entry = app.ledger.find((row) => row.refId === claim.id);
      app.ledger.push({ ...structuredClone(entry), id: 'ledger-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' });
    }],
    ['wrong check-in claimed timestamp', (app, claim) => {
      app.guestCheckins.find((row) => row.id === claim.guestCheckinId).claimedAt = new Date(3500).toISOString();
    }]
  ]) {
    const ids = createUuidSequence();
    const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
    const app = api.createDefaultState();
    const fixture = seedVerifiedGuestReceipt(api, app);
    bindMergePhone(app);
    assert.equal(api.mergeGuestJourney(app, '8325550198', 3000).ok, true);
    mutate(app, fixture.claims[0]);
    const before = JSON.stringify(app);
    const calls = ids.calls();
    assert.equal(api.mergeGuestJourney(app, '8325550198', 4000).ok, false, label);
    assert.equal(JSON.stringify(app), before, label);
    assert.equal(ids.calls(), calls, label);
  }
});

test('Task 5 claimed guest rewards survive canonical migration and reload validation', () => {
  const ids = createUuidSequence();
  const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
  const app = api.createDefaultState();
  const fixture = seedVerifiedGuestReceipt(api, app);
  bindMergePhone(app);
  assert.equal(api.mergeGuestJourney(app, '8325550198', 3000).ok, true);
  const balance = app.balances['bitcoin-nail-bar'].points;

  const migrated = api.migrateState(structuredClone(app));

  assert.equal(migrated.guestRewardClaims.length, fixture.claims.length);
  assert.equal(migrated.guestRewardClaims.every((claim) => claim.status === 'claimed'), true);
  assert.equal(migrated.ledger.filter((entry) => entry.refType === 'guest_claim').length, fixture.claims.length);
  assert.equal(migrated.balances['bitcoin-nail-bar'].points, balance);
  assert.equal(api.validateVerifiedPaymentAggregate(migrated, fixture.proof.id).ok, true);
  const snapshot = JSON.stringify(migrated);
  assert.equal(JSON.stringify(api.mergeGuestJourney(migrated, '8325550198', 4000)), JSON.stringify({
    ok: true, claimedPoints: 0, claimedCount: 0
  }));
  assert.equal(JSON.stringify(migrated), snapshot);
});

test('Task 5 migration never heals an ambiguous claimed guest ledger ID into a replayable state', () => {
  const ids = createUuidSequence();
  const api = task5Api(testApi({}, { randomUUID: () => ids.randomUUID() }).api);
  const app = api.createDefaultState();
  seedVerifiedGuestReceipt(api, app);
  bindMergePhone(app);
  assert.equal(api.mergeGuestJourney(app, '8325550198', 3000).ok, true);
  const guestLedger = app.ledger.find((entry) => entry.refType === 'guest_claim');
  app.ledger.push(structuredClone(guestLedger));

  const migrated = api.migrateState(structuredClone(app));
  const before = JSON.stringify(migrated);
  const result = api.mergeGuestJourney(migrated, '8325550198', 4000);

  assert.equal(result.ok, false);
  assert.equal(JSON.stringify(migrated), before);
});

test('Task 5 receipt CTAs prefill login or return to the scan camera without consuming claims', () => {
  const home = createStubElement({ id: 'home', classNames: ['app-screen', 'hidden'] });
  const pay = createStubElement({ id: 'pay', classNames: ['app-screen', 'hidden'] });
  const paydone = createStubElement({ id: 'paydone', classNames: ['app-screen'] });
  const login1 = createStubElement({ id: 'login1', classNames: ['app-screen', 'hidden'] });
  const scan = createStubElement({ id: 'scan', classNames: ['app-screen', 'hidden'] });
  const directView = createStubElement({ id: 'direct-payment-view', dataset: { payView: 'direct' } });
  const checkoutView = createStubElement({ id: 'guest-checkout-view', dataset: { payView: 'checkout' }, classNames: ['hidden'] });
  const proofView = createStubElement({ id: 'payment-proof-view', dataset: { payView: 'payment-proof' }, classNames: ['hidden'] });
  const cameraView = createStubElement({ id: 'scan-camera-view', dataset: { scanView: 'camera' }, classNames: ['hidden'] });
  const contextView = createStubElement({ id: 'scan-context-view', dataset: { scanView: 'context' } });
  const guestView = createStubElement({ id: 'scan-guest-view', dataset: { scanView: 'guest' }, classNames: ['hidden'] });
  const phone = createStubElement({ id: 'login-phone' });
  const toastRegion = createStubElement({ id: 'toast-region' });
  const document = createDocumentStub({
    screenNodes: [home, pay, paydone, login1, scan],
    extraElements: [directView, checkoutView, proofView, cameraView, contextView, guestView,
      phone, toastRegion, createStubElement({ id: 'form-error-state', classNames: ['hidden'] }),
      createStubElement({ id: 'scan-demo-business' })],
    selectorNodes: {
      '[data-pay-view]': [directView, checkoutView, proofView],
      '[data-scan-view]': [cameraView, contextView, guestView],
      '[data-scan-customer]': createStubElement(),
      '[data-scan-balance]': createStubElement(),
      '[data-scan-staff]': createStubElement(),
      '[data-scan-service]': createStubElement()
    }
  });
  const ids = createUuidSequence();
  const { context } = testApi({}, { document, randomUUID: () => ids.randomUUID() });
  vm.runInContext(`
    const checkout = createCheckoutDraft(state, {
      guestCheckinId: createGuestCheckin(state,
        (stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front'),
        { name: 'Amy', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }), 1000).guestCheckin.id
    }, 1000).checkoutDraft;
    setCheckoutMethod(state, checkout.id, 'Zelle');
    const rejectedProof = submitPaymentProof(state, {
      checkoutDraftId: checkout.id, note: '', imageDataUrl: ''
    }, 2000).proof;
    rejectPaymentProof(state, rejectedProof.id, 'No match', 3000);
    state.ui.pendingContext.paydoneKind = 'payment_proof';
    state.ui.activeScreen = 'paydone';
    globalThis.rejectedCheckoutSnapshot = JSON.stringify(state.checkoutDrafts[0]);
    globalThis.rejectedProofSnapshot = JSON.stringify(state.paymentProofs[0]);
  `, context);
  vm.runInContext("ACTIONS.get('replace-payment-proof')()", context);
  assert.equal(vm.runInContext('state.checkoutDrafts.length', context), 2);
  assert.equal(vm.runInContext('JSON.stringify(state.checkoutDrafts[0]) === rejectedCheckoutSnapshot', context), true);
  assert.equal(vm.runInContext('JSON.stringify(state.paymentProofs[0]) === rejectedProofSnapshot', context), true);
  assert.equal(vm.runInContext('state.ui.activeScreen', context), 'pay');
  assert.equal(proofView.classList.contains('hidden'), false);

  vm.runInContext(`
    const retry = state.checkoutDrafts[1];
    const proof = submitPaymentProof(state, {
      checkoutDraftId: retry.id, note: '', imageDataUrl: ''
    }, Date.now() + 1000).proof;
    verifyPaymentProof(state, proof.id, Date.now() + 2000);
    state.ui.pendingContext.paydoneKind = 'payment_proof';
    state.ui.activeScreen = 'paydone';
    globalThis.claimSnapshot = JSON.stringify(state.guestRewardClaims);
  `, context);
  vm.runInContext("ACTIONS.get('create-account-from-receipt')()", context);
  assert.equal(phone.value, '8325550198');
  assert.equal(vm.runInContext('state.ui.activeScreen', context), 'login1');
  assert.equal(document.activeElement, phone);
  assert.equal(vm.runInContext('JSON.stringify(state.guestRewardClaims) === claimSnapshot', context), true);

  vm.runInContext("ACTIONS.get('continue-as-guest')()", context);
  assert.equal(vm.runInContext('state.ui.activeScreen', context), 'scan');
  assert.equal(cameraView.attributes['aria-hidden'], 'false');
  assert.equal(contextView.attributes['aria-hidden'], 'true');
  assert.equal(toastRegion.children[0].children[1].textContent, 'Điểm đang chờ; dùng cùng số điện thoại để nhận sau.');
  assert.equal(vm.runInContext('state.guestRewardClaims.every((claim) => claim.status === "pending")', context), true);
  assert.equal(vm.runInContext('JSON.stringify(state.guestRewardClaims) === claimSnapshot', context), true);

  vm.runInContext("state.profile.language = 'en'; ACTIONS.get('continue-as-guest')()", context);
  assert.equal(toastRegion.children[0].children[1].textContent, 'Rewards are pending; use the same phone to claim later.');
  assert.equal(vm.runInContext('JSON.stringify(state.guestRewardClaims) === claimSnapshot', context), true);
});

function otpDocument() {
  const home = createStubElement({ id: 'home', classNames: ['app-screen', 'hidden'] });
  const login2 = createStubElement({ id: 'login2', classNames: ['app-screen'] });
  const otpCode = createStubElement({ id: 'otp-code' });
  otpCode.value = '246810';
  return createDocumentStub({
    screenNodes: [home, login2],
    extraElements: [otpCode, createStubElement({ id: 'otp-error', classNames: ['hidden'] }),
      createStubElement({ id: 'toast-region' }),
      createStubElement({ id: 'form-error-state', classNames: ['hidden'] })],
    selectorNodes: {
      '[data-scan-customer]': createStubElement(),
      '[data-scan-balance]': createStubElement(),
      '[data-scan-staff]': createStubElement(),
      '[data-scan-service]': createStubElement()
    }
  });
}

test('Task 5 OTP verification atomically authenticates and merges matching guest rewards', () => {
  const seedIds = createUuidSequence();
  const seedApi = testApi({}, { randomUUID: () => seedIds.randomUUID() }).api;
  const app = seedApi.createDefaultState();
  const now = Date.now();
  const fixture = seedVerifiedGuestReceipt(seedApi, app, { baseTime: now - 5000 });
  app.session.authenticated = false;
  assert.equal(seedApi.requestOtp(app, '8325550198', now - 1000).ok, true);
  const beforePoints = app.balances['bitcoin-nail-bar'].points;
  const expected = fixture.claims.reduce((sum, claim) => sum + claim.points, 0);
  const actionIds = createUuidSequence();
  const { storage, context } = testApi({
    [seedApi.STORAGE_KEY]: JSON.stringify(app)
  }, { document: otpDocument(), randomUUID: () => actionIds.randomUUID() });

  vm.runInContext("ACTIONS.get('verify-otp')()", context);

  const saved = apiState(storage);
  assert.equal(saved.session.authenticated, true);
  assert.equal(saved.session.phone, '8325550198');
  assert.equal(saved.profile.phone, '8325550198');
  assert.equal(saved.guestRewardClaims.every((claim) => claim.status === 'claimed'), true);
  assert.equal(saved.balances['bitcoin-nail-bar'].points, beforePoints + expected);
  assert.equal(saved.ui.activeScreen, 'home');
});

test('Task 5 OTP merge failure leaves authentication, profile, claims and ledger byte-identical', () => {
  const ids = createUuidSequence();
  const api = testApi({}, { randomUUID: () => ids.randomUUID() }).api;
  const app = api.createDefaultState();
  const now = Date.now();
  seedVerifiedGuestReceipt(api, app, { baseTime: now - 5000 });
  app.session.authenticated = false;
  assert.equal(api.requestOtp(app, '8325550198', now - 1000).ok, true);
  const loaded = testApi({
    [api.STORAGE_KEY]: JSON.stringify(app)
  }, { document: otpDocument(), randomUUID: () => ids.randomUUID() });
  vm.runInContext(`
    state.guestRewardClaims[0].points += 1;
    globalThis.beforeFailedOtpMerge = JSON.stringify(state);
  `, loaded.context);

  vm.runInContext("ACTIONS.get('verify-otp')()", loaded.context);

  assert.equal(vm.runInContext('JSON.stringify(state) === beforeFailedOtpMerge', loaded.context), true);
  assert.equal(vm.runInContext('state.session.authenticated', loaded.context), false);
  assert.notEqual(vm.runInContext('state.profile.phone', loaded.context), '8325550198');
  assert.equal(vm.runInContext("state.ledger.some((entry) => entry.refType === 'guest_claim')", loaded.context), false);
});

test('Task 5 OTP treats a normalized matching noncanonical guest owner as an atomic merge failure', () => {
  const ids = createUuidSequence();
  const api = testApi({}, { randomUUID: () => ids.randomUUID() }).api;
  const app = api.createDefaultState();
  const now = Date.now();
  seedVerifiedGuestReceipt(api, app, { baseTime: now - 5000 });
  app.session.authenticated = false;
  assert.equal(api.requestOtp(app, '8325550198', now - 1000).ok, true);
  const loaded = testApi({
    [api.STORAGE_KEY]: JSON.stringify(app)
  }, { document: otpDocument(), randomUUID: () => ids.randomUUID() });
  vm.runInContext(`
    state.guestCheckins[0].phone = '(832) 555-0198';
    globalThis.beforeNoncanonicalOtpMerge = JSON.stringify(state);
  `, loaded.context);

  vm.runInContext("ACTIONS.get('verify-otp')()", loaded.context);

  assert.equal(vm.runInContext('JSON.stringify(state) === beforeNoncanonicalOtpMerge', loaded.context), true);
  assert.equal(vm.runInContext('state.session.authenticated', loaded.context), false);
  assert.notEqual(vm.runInContext('state.profile.phone', loaded.context), '8325550198');
});

test('Task 5 OTP verification without a matching guest logs in without creating claim ledgers', () => {
  const api = testApi().api;
  const app = api.createDefaultState();
  app.session.authenticated = false;
  assert.equal(api.requestOtp(app, '8325550198', Date.now() - 1000).ok, true);
  const ledger = JSON.stringify(app.ledger);
  const loaded = testApi({
    [api.STORAGE_KEY]: JSON.stringify(app)
  }, { document: otpDocument() });

  vm.runInContext("ACTIONS.get('verify-otp')()", loaded.context);

  const saved = apiState(loaded.storage);
  assert.equal(saved.session.authenticated, true);
  assert.equal(saved.profile.phone, '8325550198');
  assert.equal(JSON.stringify(saved.ledger), ledger);
  assert.equal(saved.guestRewardClaims.length, 0);
});

test('Task 4 quota fallback persists proof metadata without image and reports an error', () => {
  const document = createDocumentStub({ extraElements: [
    createStubElement({ id: 'payment-proof-note' }), createStubElement({ id: 'payment-proof-error' }),
    createStubElement({ id: 'toast-region' }), createStubElement({ id: 'form-error-state', classNames: ['hidden'] }),
    createStubElement({ id: 'payment-pending-view', dataset: { paydoneView: 'pending' } }),
    createStubElement({ id: 'payment-confirmed-view', dataset: { paydoneView: 'confirmed' }, classNames: ['hidden'] }),
    createStubElement({ id: 'payment-rejected-view', dataset: { paydoneView: 'rejected' }, classNames: ['hidden'] }),
    createStubElement({ id: 'direct-payment-result-view' })
  ], selectorNodes: {
    '[data-paydone-view]': [],
    '[data-scan-customer]': createStubElement(),
    '[data-scan-balance]': createStubElement(),
    '[data-scan-staff]': createStubElement(),
    '[data-scan-service]': createStubElement()
  } });
  const { api, context, storage } = testApi({}, { document });
  task4Api(api);
  vm.runInContext(`
    stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front');
    createGuestCheckin(state, { name: 'Amy', phone: '8325550198', serviceKey: 'deluxe-pedicure', staffProfileId: null }, 1000);
    createCheckoutDraft(state, { guestCheckinId: state.guestCheckins[0].id }, 1000);
    setCheckoutMethod(state, state.checkoutDrafts[0].id, 'Zelle');
    pendingProofImageDataUrl = 'data:image/jpeg;base64,AA==';
  `, context);
  let writes = 0;
  const originalSetItem = storage.setItem.bind(storage);
  storage.setItem = (key, value) => {
    writes += 1;
    if (writes === 1) {
      const error = new Error('quota');
      error.name = 'QuotaExceededError';
      throw error;
    }
    return originalSetItem(key, value);
  };
  vm.runInContext("ACTIONS.get('submit-payment-proof')()", context);
  assert.equal(vm.runInContext('state.paymentProofs.length', context), 1);
  assert.equal(vm.runInContext('state.paymentProofs[0].imageDataUrl', context), '');
  assert.equal(document.getElementById('toast-region').children[0].className.includes('text-app-red'), true);
});

test('Task 4 review image converts PNG input to a bounded sanitized JPEG', async () => {
  const document = createDocumentStub();
  const canvas = createStubElement();
  let drawn = null;
  canvas.getContext = () => ({
    drawImage(image, x, y, width, height) { drawn = { image, x, y, width, height }; }
  });
  canvas.toDataURL = (type, quality) => {
    assert.equal(type, 'image/jpeg');
    assert.equal(quality, 0.78);
    return 'data:image/jpeg;base64,AAAA';
  };
  const createElement = document.createElement.bind(document);
  document.createElement = (tagName) => tagName === 'canvas' ? canvas : createElement(tagName);
  class StubFileReader {
    readAsDataURL() {
      this.result = 'data:image/png;base64,AAAA';
      this.onload();
    }
  }
  class StubImage {
    set src(value) {
      this.source = value;
      this.width = 1440;
      this.height = 720;
      this.onload();
    }
  }
  const { context } = testApi({}, { document, fileReader: StubFileReader, image: StubImage });
  const result = await context.compressImage({ type: 'image/png' });
  assert.equal(result, 'data:image/jpeg;base64,AAAA');
  assert.equal(canvas.width, 720);
  assert.equal(canvas.height, 360);
  assert.deepEqual({ x: drawn.x, y: drawn.y, width: drawn.width, height: drawn.height }, {
    x: 0, y: 0, width: 720, height: 360
  });
});

test('Task 4 review image fully clears a stale valid preview after a later compression error', async () => {
  const fileInput = createStubElement({ id: 'payment-proof-file' });
  const preview = createStubElement({ id: 'payment-proof-preview', classNames: ['hidden'] });
  const remove = createStubElement({ id: 'remove-payment-proof', classNames: ['hidden'] });
  const error = createStubElement({ id: 'payment-proof-error', classNames: ['hidden'] });
  const document = createDocumentStub({ extraElements: [fileInput, preview, remove, error] });
  const { context } = testApi({}, { document });
  vm.runInContext("compressImage = async () => 'data:image/jpeg;base64,AAAA'", context);
  fileInput.files = [{ name: 'valid.png' }];
  fileInput.value = '/tmp/valid.png';
  await context.handleChange({ target: fileInput });
  assert.equal(preview.src, 'data:image/jpeg;base64,AAAA');
  assert.equal(preview.classList.contains('hidden'), false);
  assert.equal(remove.classList.contains('hidden'), false);

  vm.runInContext("compressImage = async () => { throw new Error('decode failed'); }", context);
  fileInput.files = [{ name: 'invalid.png' }];
  fileInput.value = '/tmp/invalid.png';
  await context.handleChange({ target: fileInput });
  assert.equal(fileInput.value, '');
  assert.equal(preview.src, '');
  assert.equal(preview.classList.contains('hidden'), true);
  assert.equal(remove.classList.contains('hidden'), true);
  assert.equal(vm.runInContext('pendingProofImageDataUrl', context), '');
  assert.equal(error.classList.contains('hidden'), false);
});

test('Task 4 refuses tampered artifacts in pending and rejected idempotent paths', () => {
  const uploadApi = task4Api(testApi().api);
  const uploadApp = uploadApi.createDefaultState();
  const upload = seedPendingProof(uploadApi, uploadApp, { method: 'Zelle' });
  uploadApp.receipts.push({ checkoutDraftId: upload.checkout.id });
  const uploadBefore = JSON.stringify(uploadApp);
  assert.equal(uploadApi.submitPaymentProof(uploadApp, {
    checkoutDraftId: upload.checkout.id, note: '', imageDataUrl: ''
  }, 3000).ok, false);
  assert.equal(JSON.stringify(uploadApp), uploadBefore);

  const counterApi = task4Api(testApi().api);
  const counterApp = counterApi.createDefaultState();
  const counter = seedPendingProof(counterApi, counterApp, { method: 'Pay at Counter' });
  counterApp.guestRewardClaims.push({ sourceId: counter.proof.id });
  const counterBefore = JSON.stringify(counterApp);
  assert.equal(counterApi.submitCheckoutWithoutUpload(counterApp, counter.checkout.id, 3000).ok, false);
  assert.equal(JSON.stringify(counterApp), counterBefore);

  const rejectedApi = task4Api(testApi().api);
  const rejectedApp = rejectedApi.createDefaultState();
  const rejected = seedPendingProof(rejectedApi, rejectedApp, { method: 'Venmo' });
  rejectedApi.rejectPaymentProof(rejectedApp, rejected.proof.id, 'No match', 3000);
  rejectedApp.receipts.push({ checkoutDraftId: rejected.checkout.id });
  const rejectedBefore = JSON.stringify(rejectedApp);
  assert.equal(rejectedApi.rejectPaymentProof(rejectedApp, rejected.proof.id, 'No match', 4000).ok, false);
  assert.equal(JSON.stringify(rejectedApp), rejectedBefore);
});

test('Task 4 Replace Proof routes no-upload retries to pending paydone', () => {
  const source = html();
  const handler = source.match(/registerAction\('replace-payment-proof',[\s\S]*?registerAction\('pay-at-counter'/)?.[0] || '';
  assert.match(handler, /if \(result\.proof\)[\s\S]*?navigateTo\('paydone'\)/);
  assert.match(handler, /showPayView\('payment-proof'\)/);
});

test('creates a guest check-in claim without crediting the signed-in profile', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  api.stageSalonScan(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front');
  const before = app.balances['bitcoin-nail-bar'].points;
  const result = api.createGuestCheckin(app, {
    name: 'Amy Nguyen', phone: '832-555-0198', serviceKey: 'deluxe-pedicure', staffProfileId: null
  }, Date.parse('2026-07-15T03:04:42.000Z'));
  assert.equal(result.ok, true);
  assert.equal(result.guestCheckin.businessId, 'bitcoin-nail-bar');
  assert.equal(result.guestCheckin.pointsPending, 120);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(app.ledger.some((entry) => entry.refId === result.guestCheckin.id), false);
  assert.equal(app.profile.points, undefined);
});

test('completes a staged member salon check-in through the existing offline and duplicate rules', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna';
  api.stageSalonScan(app, payload);
  const before = app.balances['bitcoin-nail-bar'].points;
  const queued = api.completeMemberSalonCheckin(app, false, 1000);
  assert.equal(queued.ok, true);
  assert.equal(queued.queued, true);
  assert.equal(queued.checkin.sourceQr, payload);
  assert.equal(queued.checkin.scannedAt, new Date(1000).toISOString());
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(api.completeMemberSalonCheckin(app, true, 6000).code, 'duplicate_checkin');
});

test('rejects missing or tampered staged member context and cross-business guest staff', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = JSON.stringify(app);
  assert.equal(api.completeMemberSalonCheckin(app, true, 1000).code, 'missing_scan_context');
  assert.equal(JSON.stringify(app), before);

  api.stageSalonScan(app, 'https://nexoratouch.com/touch/golden-glow-spa/lobby');
  const staged = JSON.stringify(app);
  const guest = api.createGuestCheckin(app, {
    name: 'Amy Nguyen', phone: '832-555-0198', serviceKey: 'deluxe-pedicure', staffProfileId: 'staff-anna'
  }, 1000);
  assert.equal(guest.code, 'invalid_guest');
  assert.equal(JSON.stringify(app), staged);

  app.ui.pendingContext.scanContext.businessId = 'moon-coffee';
  const tampered = JSON.stringify(app);
  assert.equal(api.completeMemberSalonCheckin(app, true, 1000).code, 'invalid_scan_context');
  assert.equal(JSON.stringify(app), tampered);
});

test('provides nested multi-salon and guest scan views with localized copy and safe actions', () => {
  const source = html();
  assert.equal((source.match(/data-scan-view="(?:camera|context|guest)"/g) || []).length, 3);
  assert.match(source, /id="scan-demo-business"/);
  assert.match(source, /id="guest-checkin-view"/);
  for (const key of ['invalidGuest', 'noPreference', 'notAvailable', 'guestCheckinSuccess']) {
    assert.match(source, new RegExp(`vi:[\\s\\S]*?${key}:`), `missing Vietnamese ${key}`);
    assert.match(source, new RegExp(`en:[\\s\\S]*?${key}:`), `missing English ${key}`);
  }

  const startAction = source.match(/registerAction\('start-scan',[\s\S]*?registerAction\('enter-code'/)?.[0];
  assert.ok(startAction);
  assert.match(startAction, /scan-demo-business/);
  assert.doesNotMatch(startAction, /https:\/\/nexoratouch\.com\/touch/);
  const enterAction = source.match(/registerAction\('enter-code',[\s\S]*?registerAction\('member-salon-checkin'/)?.[0];
  assert.ok(enterAction);
  assert.match(enterAction, /openManualSalonCode/);
  assert.doesNotMatch(enterAction, /navigateTo\('onb1'\)/);
  const memberAction = source.match(/registerAction\('member-salon-checkin',[\s\S]*?registerAction\('open-guest-checkin'/)?.[0];
  assert.ok(memberAction);
  assert.match(memberAction, /completeMemberSalonCheckin/);
  assert.match(source, /function renderScanContext\(\)[\s\S]*?\.textContent/);
});

test('scopes runtime guest services and staff to the staged business catalog', () => {
  const { api, context } = testApi();
  const app = api.createDefaultState();
  api.stageSalonScan(app, 'https://nexoratouch.com/touch/golden-glow-spa/lobby');
  const guest = { name: 'Amy Nguyen', phone: '832-555-0198', staffProfileId: null };

  for (const serviceKey of ['arbitrary-service', 'deluxe-pedicure']) {
    const before = JSON.stringify(app);
    assert.equal(api.createGuestCheckin(app, { ...guest, serviceKey }, 1000).code, 'invalid_guest');
    assert.equal(JSON.stringify(app), before);
  }
  const beforeStaff = JSON.stringify(app);
  assert.equal(api.createGuestCheckin(app, {
    ...guest, serviceKey: 'signature-facial', staffProfileId: 'staff-anna'
  }, 1000).code, 'invalid_guest');
  assert.equal(JSON.stringify(app), beforeStaff);
  assert.equal(api.createGuestCheckin(app, { ...guest, serviceKey: 'signature-facial' }, 1000).ok, true);

  for (const [businessId, serviceKey, amountCents] of [
    ['bitcoin-nail-bar', 'deluxe-pedicure', 5500],
    ['bitcoin-nail-bar', 'acrylic-full-set', 6500],
    ['golden-glow-spa', 'signature-facial', 7500],
    ['moon-coffee', 'signature-drink', 800]
  ]) {
    assert.equal(vm.runInContext(
      `getGuestServiceDefinition('${businessId}', '${serviceKey}').amountCents`, context
    ), amountCents);
  }
});

test('drops persisted guest check-ins with arbitrary services or cross-business staff', () => {
  const { api } = testApi();
  const golden = {
    id: 'guest-checkin-golden', businessId: 'golden-glow-spa', name: 'Amy Nguyen',
    phone: '8325550198', serviceKey: 'signature-facial', staffProfileId: null,
    station: 'lobby', sourceQr: 'https://nexoratouch.com/touch/golden-glow-spa/lobby',
    status: 'checked_in', pointsPending: 80, scannedAt: '2026-07-15T03:04:42.000Z',
    claimedAt: null
  };
  assert.equal(api.migrateState({ guestCheckins: [golden] }).guestCheckins.length, 1);
  for (const tampered of [
    { ...golden, serviceKey: 'anything-goes' },
    { ...golden, serviceKey: 'deluxe-pedicure' },
    { ...golden, staffProfileId: 'staff-anna' }
  ]) {
    assert.deepEqual(api.migrateState({ guestCheckins: [tampered] }).guestCheckins, []);
  }
});

test('renders localized guest options only for the staged business and refreshes language', () => {
  const service = createStubElement({ id: 'guest-service' });
  const staff = createStubElement({ id: 'guest-staff' });
  const document = createDocumentStub({
    extraElements: [service, staff],
    selectorNodes: {
      '[data-scan-customer]': createStubElement(),
      '[data-scan-balance]': createStubElement(),
      '[data-scan-staff]': createStubElement(),
      '[data-scan-service]': createStubElement()
    }
  });
  const { context } = testApi({}, { document });
  vm.runInContext("commitState((draft) => stageSalonScan(draft, 'https://nexoratouch.com/touch/golden-glow-spa/lobby'))", context);

  context.renderGuestCheckinOptions();
  assert.deepEqual(service.children.map((option) => option.value), ['signature-facial']);
  assert.match(service.children[0].textContent, /^Chăm sóc da đặc trưng/);
  assert.deepEqual(staff.children.map((option) => option.value), ['']);
  assert.equal(staff.children[0].textContent, 'Không yêu cầu');

  context.setLanguage('en');
  assert.match(service.children[0].textContent, /^Signature Facial/);
  assert.equal(staff.children[0].textContent, 'No preference');

  vm.runInContext("stageSalonScan(state, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front')", context);
  context.renderGuestCheckinOptions();
  assert.deepEqual(staff.children.map((option) => option.value), ['', 'staff-anna', 'staff-maria']);
});

test('moves focus into every active nested scan view while hiding the previous view', () => {
  const camera = createStubElement({ id: 'scan-camera-view', dataset: { scanView: 'camera' } });
  const contextView = createStubElement({ id: 'scan-context-view', dataset: { scanView: 'context' }, classNames: ['hidden'] });
  const guest = createStubElement({ id: 'guest-checkin-view', dataset: { scanView: 'guest' }, classNames: ['hidden'] });
  const selector = createStubElement({ id: 'scan-demo-business' });
  const heading = createStubElement({ id: 'scan-context-business' });
  const name = createStubElement({ id: 'guest-name' });
  const document = createDocumentStub({
    extraElements: [camera, contextView, guest, selector, heading, name],
    selectorNodes: { '[data-scan-view]': [camera, contextView, guest] }
  });
  const { context } = testApi({}, { document });

  for (const [viewName, target, activeView] of [
    ['context', heading, contextView], ['guest', name, guest], ['camera', selector, camera]
  ]) {
    context.setScanView(viewName);
    assert.equal(document.activeElement, target);
    assert.equal(activeView.attributes['aria-hidden'], 'false');
    for (const hiddenView of [camera, contextView, guest].filter((view) => view !== activeView)) {
      assert.equal(hiddenView.attributes['aria-hidden'], 'true');
      assert.equal(hiddenView.classList.contains('hidden'), true);
    }
  }
  assert.match(html(), /id="scan-context-business"[^>]*tabindex="-1"/);
});

test('keeps invalid manual salon codes inline and returns focus to the active context on success', () => {
  const camera = createStubElement({ id: 'scan-camera-view', dataset: { scanView: 'camera' } });
  const contextView = createStubElement({ id: 'scan-context-view', dataset: { scanView: 'context' }, classNames: ['hidden'] });
  const guestView = createStubElement({ id: 'guest-checkin-view', dataset: { scanView: 'guest' }, classNames: ['hidden'] });
  const trigger = createStubElement({ id: 'manual-trigger' });
  const heading = createStubElement({ id: 'scan-context-business' });
  const selector = createStubElement({ id: 'scan-demo-business' });
  const guestName = createStubElement({ id: 'guest-name' });
  const service = createStubElement({ id: 'guest-service' });
  const staff = createStubElement({ id: 'guest-staff' });
  const scanCustomer = createStubElement();
  const scanBalance = createStubElement();
  const scanStaff = createStubElement();
  const scanService = createStubElement();
  const document = createDocumentStub({
    extraElements: [camera, contextView, guestView, trigger, heading, selector, guestName, service, staff],
    selectorNodes: {
      '[data-scan-view]': [camera, contextView, guestView],
      '[data-scan-customer]': scanCustomer,
      '[data-scan-balance]': scanBalance,
      '[data-scan-staff]': scanStaff,
      '[data-scan-service]': scanService
    }
  });
  const { api, context } = testApi({}, { document });

  context.openManualSalonCode(trigger);
  const content = document.getElementById('overlay-content').children[0];
  assert.equal(content.tagName, 'DIV');
  const label = content.children[0];
  const input = label.children[0];
  const error = content.children[1];
  assert.equal(document.activeElement, input);
  assert.equal(error.getAttribute('role'), 'alert');

  input.value = 'not-a-qr';
  assert.equal(context.closeOverlay(true), false);
  assert.equal(document.getElementById('app-overlay').attributes['aria-hidden'], 'false');
  assert.equal(input.attributes['aria-invalid'], 'true');
  assert.equal(error.textContent, 'URL QR salon không hợp lệ.');
  assert.equal(error.classList.contains('hidden'), false);
  assert.equal(document.activeElement, input);

  input.value = 'https://nexoratouch.com/touch/golden-glow-spa/lobby';
  assert.equal(context.closeOverlay(true), true);
  assert.equal(input.attributes['aria-invalid'], 'false');
  assert.equal(error.classList.contains('hidden'), true);
  assert.equal(document.activeElement, heading);
  assert.equal(vm.runInContext('state.ui.pendingContext.scanContext.businessId', context), 'golden-glow-spa');
  assert.equal(api.translate('en', 'manualSalonCodeInvalid'), 'Enter a valid salon QR URL.');
});

test('queues offline QR check-in and awards points after retry with scan timestamp', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const queued = api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', false, 1000);
  assert.equal(queued.checkin.status, 'queued');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  api.retryQueuedCheckins(app, true, 5000);
  assert.equal(queued.checkin.status, 'confirmed');
  assert.equal(queued.checkin.scannedAt, new Date(1000).toISOString());
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 120);
  assert.equal(api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', true, 6000).code, 'duplicate_checkin');
});

test('rejects a future persisted scan within the same duplicate window', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna';
  const queued = api.submitCheckin(app, payload, false, 1000);
  assert.equal(queued.ok, true);
  queued.checkin.scannedAt = new Date(1000 + 60 * 1000).toISOString();
  const before = JSON.stringify(app);
  assert.equal(api.submitCheckin(app, payload, true, 1000).code, 'duplicate_checkin');
  assert.equal(JSON.stringify(app), before);
});

test('strictly validates Nexora QR origin, route and staff ownership', () => {
  const { api } = testApi();
  assert.equal(api.parseNexoraQr('https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna').ok, true);
  for (const payload of [
    'http://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna',
    'https://evil.example/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna',
    'https://nexoratouch.com/touch/unknown/front?staffProfileId=staff-anna',
    'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-missing',
    'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=',
    'https://nexoratouch.com/touch/bitcoin-nail-bar/front?x=1'
  ]) assert.equal(api.parseNexoraQr(payload).code, 'invalid_qr', payload);
});

test('does not partially mutate online check-in when ledger ID generation fails', () => {
  let calls = 0;
  const { api } = testApi({}, { randomUUID: () => {
    calls += 1;
    if (calls === 2) throw new Error('ledger id unavailable');
    return '00000000-0000-4000-8000-000000000002';
  } });
  const app = api.createDefaultState();
  const before = JSON.stringify(app);
  assert.equal(api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', true, 1000).code, 'id_generation_failed');
  assert.equal(JSON.stringify(app), before);
});

test('quarantines tampered persisted check-in claims and queue references', () => {
  const { api } = testApi();
  const id = 'checkin-00000000-0000-4000-8000-000000000003';
  const scannedAt = '1970-01-01T00:00:01.000Z';
  const payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna';
  const migrated = api.migrateState({
    checkins: [{ id, businessId: 'bitcoin-nail-bar', station: 'front', staffProfileId: 'staff-anna', sourceQr: payload, scannedAt, status: 'queued', confirmedAt: null }],
    offlineQueue: [id, 'missing'],
    ledger: [{ id: 'raw-checkin-claim', businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: 120, refType: 'checkin', refId: id, createdAt: scannedAt }]
  });
  assert.equal(JSON.stringify(migrated.checkins), '[]');
  assert.equal(JSON.stringify(migrated.offlineQueue), '[]');
  assert.equal(migrated.ledger.some((entry) => entry.refId === id), false);
});

test('fails closed on malformed check-in balances before UUID or queue mutation', () => {
  const payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna';
  for (const malformed of [
    undefined,
    null,
    { points: '120', credits: 0, expiringPoints: null },
    { points: Number.NaN, credits: 0, expiringPoints: null },
    { points: -1, credits: 0, expiringPoints: null },
    { points: 120, credits: Number.NaN, expiringPoints: null },
    { points: 120, credits: 0, expiringPoints: { amount: '80', date: '2026-08-30' } }
  ]) {
    let uuidCalls = 0;
    const { api } = testApi({}, { randomUUID: () => {
      uuidCalls += 1;
      return '00000000-0000-4000-8000-000000000004';
    } });
    const app = api.createDefaultState();
    app.balances['bitcoin-nail-bar'] = malformed;
    const before = JSON.stringify(app);
    assert.equal(api.submitCheckin(app, payload, true, 1000).code, 'invalid_balance');
    assert.equal(JSON.stringify(app), before);
    assert.equal(uuidCalls, 0);

    const validApi = testApi().api;
    const queuedApp = validApi.createDefaultState();
    const queued = validApi.submitCheckin(queuedApp, payload, false, 1000);
    assert.equal(queued.ok, true);
    queuedApp.balances['bitcoin-nail-bar'] = malformed;
    const queuedBefore = JSON.stringify(queuedApp);
    const retry = validApi.retryQueuedCheckins(queuedApp, true, 5000);
    assert.equal(retry.ok, true);
    assert.equal(JSON.stringify(queuedApp), queuedBefore);
    assert.equal(queued.checkin.status, 'queued');
  }
});

test('rejects a missing offline queue before completeCheckin can partially mutate', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const queued = api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', false, 1000);
  assert.equal(queued.ok, true);
  app.offlineQueue = null;
  const before = JSON.stringify(app);
  assert.equal(api.completeCheckin(app, queued.checkin, 5000).code, 'invalid_state');
  assert.equal(JSON.stringify(app), before);
});

test('prunes stale offline queue IDs while retrying valid queued check-ins', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const queued = api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', false, 1000);
  assert.equal(queued.ok, true);
  app.offlineQueue.push('missing-checkin');
  const beforePoints = app.balances['bitcoin-nail-bar'].points;
  const result = api.retryQueuedCheckins(app, true, 5000);
  assert.equal(result.ok, true);
  assert.equal(result.retried, 1);
  assert.equal(app.offlineQueue.length, 0);
  assert.equal(app.balances['bitcoin-nail-bar'].points, beforePoints + 120);
  assert.equal(app.ledger.filter((entry) => entry.refType === 'checkin').length, 1);
  assert.equal(queued.checkin.status, 'confirmed');
});

test('migration keeps the earliest check-in in a business window and quarantines later claims', () => {
  const { api } = testApi();
  const firstId = 'checkin-00000000-0000-4000-8000-000000000101';
  const laterId = 'checkin-00000000-0000-4000-8000-000000000102';
  const payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna';
  const firstScannedAt = new Date(1000).toISOString();
  const laterScannedAt = new Date(1801).toISOString();
  const first = { id: firstId, businessId: 'bitcoin-nail-bar', station: 'front', staffProfileId: 'staff-anna', sourceQr: payload, scannedAt: firstScannedAt, status: 'queued', confirmedAt: null };
  const later = { id: laterId, businessId: 'bitcoin-nail-bar', station: 'front', staffProfileId: 'staff-anna', sourceQr: payload, scannedAt: laterScannedAt, status: 'confirmed', confirmedAt: new Date(2000).toISOString() };
  const migrated = api.migrateState({
    checkins: [later, first],
    offlineQueue: [laterId, firstId],
    ledger: [{ id: 'ledger-duplicate-checkin', businessId: 'bitcoin-nail-bar', type: 'visit', pointsDelta: 120, refType: 'checkin', refId: laterId, createdAt: laterScannedAt }]
  });
  assert.equal(migrated.checkins.length, 1);
  assert.equal(migrated.checkins[0].id, firstId);
  assert.equal(migrated.offlineQueue.length, 1);
  assert.equal(migrated.offlineQueue[0], firstId);
  assert.equal(migrated.ledger.some((entry) => entry.refId === laterId), false);
});

test('retry drops same-business queued duplicates without awarding twice', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, { randomUUID: () => {
    uuidCalls += 1;
    return '00000000-0000-4000-8000-000000000101';
  } });
  const app = api.createDefaultState();
  const payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna';
  const first = api.submitCheckin(app, payload, false, 1000);
  assert.equal(first.ok, true);
  const duplicate = {
    ...first.checkin,
    id: 'checkin-00000000-0000-4000-8000-000000000102',
    scannedAt: new Date(1801).toISOString(),
    status: 'queued',
    confirmedAt: null
  };
  app.checkins = [duplicate, first.checkin];
  app.offlineQueue = [first.checkin.id, duplicate.id];
  const before = app.balances['bitcoin-nail-bar'].points;
  const result = api.retryQueuedCheckins(app, true, 5000);
  assert.equal(result.ok, true);
  assert.equal(result.retried, 1);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 120);
  assert.equal(app.ledger.filter((entry) => entry.refType === 'checkin').length, 1);
  assert.equal(app.checkins.some((checkin) => checkin.id === duplicate.id), false);
  assert.equal(app.offlineQueue.length, 0);
  assert.equal(uuidCalls, 2);
});

test('completeCheckin rejects a later same-business duplicate before UUID or queue mutation', () => {
  let uuidCalls = 0;
  const { api } = testApi({}, { randomUUID: () => {
    uuidCalls += 1;
    return '00000000-0000-4000-8000-000000000121';
  } });
  const app = api.createDefaultState();
  const payload = 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna';
  const first = api.submitCheckin(app, payload, false, 1000);
  assert.equal(first.ok, true);
  const duplicate = {
    ...first.checkin,
    id: 'checkin-00000000-0000-4000-8000-000000000122',
    scannedAt: new Date(1801).toISOString(),
    status: 'queued',
    confirmedAt: null
  };
  app.checkins = [first.checkin, duplicate];
  app.offlineQueue = [first.checkin.id, duplicate.id];
  const before = JSON.stringify(app);
  const result = api.completeCheckin(app, duplicate, 5000);
  assert.equal(result.code, 'duplicate_checkin');
  assert.equal(JSON.stringify(app), before);
  const earlierResult = api.completeCheckin(app, first.checkin, 5000);
  assert.equal(earlierResult.code, 'duplicate_checkin');
  assert.equal(JSON.stringify(app), before);
  assert.equal(uuidCalls, 1);
});

test('retry preserves different businesses and scans at or beyond 120 minutes', () => {
  let uuidCounter = 0;
  const { api } = testApi({}, { randomUUID: () => `00000000-0000-4000-8000-${String(++uuidCounter).padStart(12, '0')}` });
  const app = api.createDefaultState();
  const first = api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', false, 1000);
  assert.equal(first.ok, true);
  const laterSameBusiness = {
    ...first.checkin,
    id: 'checkin-00000000-0000-4000-8000-000000000112',
    scannedAt: new Date(1000 + (120 * 60 * 1000)).toISOString(),
    status: 'queued',
    confirmedAt: null
  };
  const otherBusiness = {
    ...first.checkin,
    id: 'checkin-00000000-0000-4000-8000-000000000113',
    businessId: 'golden-glow-spa',
    station: 'front',
    staffProfileId: null,
    sourceQr: 'https://nexoratouch.com/touch/golden-glow-spa/front',
    scannedAt: new Date(1801).toISOString(),
    status: 'queued',
    confirmedAt: null
  };
  app.checkins = [laterSameBusiness, otherBusiness, first.checkin];
  app.offlineQueue = [laterSameBusiness.id, otherBusiness.id, first.checkin.id];
  const bitcoinBefore = app.balances['bitcoin-nail-bar'].points;
  const goldenBefore = app.balances['golden-glow-spa'].points;
  const result = api.retryQueuedCheckins(app, true, 8000);
  assert.equal(result.ok, true);
  assert.equal(result.retried, 3);
  assert.equal(app.balances['bitcoin-nail-bar'].points, bitcoinBefore + 240);
  assert.equal(app.balances['golden-glow-spa'].points, goldenBefore + 80);
  assert.equal(app.ledger.filter((entry) => entry.refType === 'checkin').length, 3);
  assert.equal(app.offlineQueue.length, 0);
});

test('retry quarantines malformed queued check-ins without throwing or awarding', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const malformed = {
    id: 'checkin-00000000-0000-4000-8000-000000000114',
    businessId: 'bitcoin-nail-bar',
    station: 'front',
    staffProfileId: null,
    sourceQr: 'https://nexoratouch.com/touch/bitcoin-nail-bar/front',
    scannedAt: Symbol('malformed-time'),
    status: 'queued',
    confirmedAt: null
  };
  app.checkins = [malformed];
  app.offlineQueue = [malformed.id];
  const beforePoints = app.balances['bitcoin-nail-bar'].points;
  const beforeLedger = JSON.stringify(app.ledger);
  assert.doesNotThrow(() => api.completeCheckin(app, malformed, 5000));
  assert.doesNotThrow(() => api.retryQueuedCheckins(app, true, 5000));
  assert.equal(app.offlineQueue.length, 0);
  assert.equal(app.checkins.length, 0);
  assert.equal(app.balances['bitcoin-nail-bar'].points, beforePoints);
  assert.equal(JSON.stringify(app.ledger), beforeLedger);
});

test('completeCheckin rejects malformed domain collections before mutation', () => {
  const { api } = testApi();
  for (const field of ['businesses', 'balances', 'staffProfiles', 'checkins', 'ledger', 'offlineQueue']) {
    const app = api.createDefaultState();
    const pending = api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', false, 1000);
    assert.equal(pending.ok, true);
    app[field] = null;
    const before = JSON.stringify(app);
    assert.equal(api.completeCheckin(app, pending.checkin, 5000).code, 'invalid_state', field);
    assert.equal(JSON.stringify(app), before, field);
  }
});
