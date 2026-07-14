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
    createElement() { return createStubElement(); },
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
  return document;
}

function testApi(seed = {}, {
  skipInit = true,
  document,
  randomUUID = () => '00000000-0000-4000-8000-000000000001',
  open = () => null,
  url = URL,
  blob = Blob
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
  const context = vm.createContext(globals);
  vm.runInContext(script, context);
  return { api: window.NEXORA_TEST_API, storage, context };
}

test('creates versioned Vietnamese demo state with per-business balances', () => {
  const { api } = testApi();
  const state = api.createDefaultState();
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.profile.language, 'vi');
  assert.equal(state.balances['bitcoin-nail-bar'].points, 2450);
  assert.equal(state.balances['golden-glow-spa'].points, 600);
  assert.equal(state.balances['moon-coffee'].points, 120);
  assert.equal('pointBalance' in state, false);
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

test('routes scanning through welcome claim and wires existing-account OTP before login2', () => {
  const source = html();
  const scanAction = source.match(/registerAction\('start-scan',[\s\S]*?registerAction\('enter-code'/)?.[0];
  assert.ok(scanAction, 'start-scan action must be available');
  assert.match(scanAction, /submitCheckin/);

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
