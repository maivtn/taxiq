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

function createStubElement({ id = '', dataset = {}, textContent = '', placeholder = '', classNames = [], onFocus = null } = {}) {
  const attributes = {};
  return {
    id,
    dataset,
    textContent,
    placeholder,
    attributes,
    classList: createClassList(classNames),
    disabled: false,
    hidden: false,
    style: {},
    isConnected: true,
    innerHTML: '',
    setAttribute(name, value) { attributes[name] = String(value); },
    getAttribute(name) { return attributes[name] ?? null; },
    removeAttribute(name) { delete attributes[name]; },
    getClientRects() { return this.isConnected && !this.hidden && !this.classList.contains('hidden') ? [{}] : []; },
    closest() { return null; },
    focus() { onFocus?.(this); }
  };
}

function createDocumentStub({
  localizedNodes = [], placeholderNodes = [], languageControls = [],
  notificationControls = [], overlayCloseControls = [], balancePointNodes = [],
  balanceWithUnitNodes = [], balanceAvailableNodes = [], rewardGapValueNodes = [],
  rewardGapCopyNodes = [], rewardProgressNodes = [], signatureRewardControls = []
} = {}) {
  const listeners = [];
  const elements = new Map();
  const document = {
    listeners,
    documentElement: { lang: 'vi' },
    body: { classList: createClassList() },
    activeElement: null,
    addEventListener(type, handler) { listeners.push({ type, handler }); },
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, createStubElement({ id, onFocus: (element) => { document.activeElement = element; } }));
      }
      return elements.get(id);
    },
    querySelector() { return null; },
    querySelectorAll(selector) {
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
      return [];
    }
  };
  return document;
}

function testApi(seed = {}, { skipInit = true, document, randomUUID = () => '00000000-0000-4000-8000-000000000001' } = {}) {
  const source = html();
  const script = source.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
  assert.ok(script, 'inline application script must exist');
  const storage = createMemoryStorage(seed);
  const window = {
    localStorage: storage,
    NEXORA_SKIP_INIT: skipInit,
    setTimeout() { return 1; },
    clearTimeout() {},
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
    URL,
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
  assert.equal(JSON.stringify(migrated.offlineQueue), JSON.stringify(['checkin-1']));
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
  const scanBody = source.match(/function startScan\(\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*function selectTip/)?.[1];
  assert.ok(scanBody, 'startScan body must be available');
  assert.match(scanBody, /navigateTo\('onb1'\)/);
  assert.doesNotMatch(scanBody, /navigateTo\('onb2'\)/);

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
    'navigateTo', 'setLanguage', 'showToast', 'openOverlay', 'closeOverlay',
    'startScan', 'selectTip', 'sendTip', 'confirmTip', 'sendPayment',
    'confirmPayment', 'openReward', 'confirmReward', 'filterExplore',
    'filterOffers', 'saveOffer', 'addWish', 'saveLook', 'setRating',
    'submitReview', 'reviewBooking', 'confirmBooking'
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
  context.openReward('gel', false);
  assert.equal(document.getElementById('reward-balance').textContent, '2.475 điểm');
  assert.equal(document.getElementById('reward-after').textContent, '1.675 điểm');

  const source = html();
  assert.ok((source.match(/data-balance-points=/g) || []).length >= 4);
  assert.match(source, /data-balance-with-unit="bitcoin-nail-bar"/);
  assert.match(source, /data-balance-available="bitcoin-nail-bar"/);
  assert.match(source, /function renderBalances\(\)/);
  assert.match(source, /function renderDomainViews\(\)\s*\{\s*renderProfile\(\);\s*renderBalances\(\);/);

  const claimAction = source.match(/registerAction\('claim-welcome',[\s\S]*?registerAction\('accept-consent'/)?.[0];
  assert.ok(claimAction.indexOf('renderBalances()') < claimAction.indexOf("navigateTo('onb2')"));
});

test('derives reward gap progress and CTA state from the current balance', () => {
  function rewardDocument() {
    const gapValue = createStubElement({ dataset: { rewardGapValue: '' }, textContent: '—' });
    const gapCopy = createStubElement({ dataset: { rewardGapCopy: '' }, textContent: 'Đang tính…' });
    const progress = createStubElement({ dataset: { rewardProgress: '' } });
    const cta = createStubElement({ dataset: { signatureRewardCta: '' }, textContent: 'Đang tính…' });
    cta.disabled = true;
    return {
      gapValue, gapCopy, progress, cta,
      document: createDocumentStub({
        rewardGapValueNodes: [gapValue], rewardGapCopyNodes: [gapCopy],
        rewardProgressNodes: [progress], signatureRewardControls: [cta]
      })
    };
  }

  const below = rewardDocument();
  testApi({
    'nexora.customer.prototype.v1': JSON.stringify({ balances: { 'bitcoin-nail-bar': { points: 2475 } } })
  }, { skipInit: false, document: below.document });
  assert.equal(below.gapValue.textContent, '525');
  assert.equal(below.gapCopy.textContent, 'Còn 525 điểm để nhận quà tiếp theo');
  assert.equal(below.progress.style.width, '82.5%');
  assert.equal(below.cta.textContent, 'Cần thêm 525 điểm');
  assert.equal(below.cta.disabled, true);
  assert.equal(below.cta.dataset.action, undefined);

  const eligible = rewardDocument();
  testApi({
    'nexora.customer.prototype.v1': JSON.stringify({ balances: { 'bitcoin-nail-bar': { points: 3250 } } })
  }, { skipInit: false, document: eligible.document });
  assert.equal(eligible.progress.style.width, '100%');
  assert.equal(eligible.cta.disabled, false);
  assert.equal(eligible.cta.dataset.action, 'navigate');
  assert.equal(eligible.cta.dataset.target, 'rewards');
  assert.equal(eligible.cta.textContent, 'Xem phần thưởng');

  const source = html();
  assert.match(source, /nextRewardGap:/);
  assert.match(source, /signatureRewardLocked:/);
  assert.match(source, /signatureRewardReady:/);
  assert.doesNotMatch(source, /w-\[76%\]/);
  assert.doesNotMatch(source, /data-signature-reward-cta[^>]*550/);
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
