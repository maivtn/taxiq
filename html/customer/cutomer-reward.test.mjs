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

function createStubElement({ dataset = {}, textContent = '', placeholder = '' } = {}) {
  const attributes = {};
  return {
    dataset,
    textContent,
    placeholder,
    attributes,
    setAttribute(name, value) { attributes[name] = String(value); }
  };
}

function createDocumentStub({ localizedNodes = [], placeholderNodes = [], languageControls = [] } = {}) {
  const listeners = [];
  const elements = new Map();
  return {
    listeners,
    documentElement: { lang: 'vi' },
    addEventListener(type, handler) { listeners.push({ type, handler }); },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { innerHTML: '' });
      return elements.get(id);
    },
    querySelectorAll(selector) {
      if (selector === '[data-en][data-vi]') return localizedNodes;
      if (selector === '[data-en-ph][data-vi-ph]') return placeholderNodes;
      if (selector === '[data-language]') return languageControls;
      return [];
    }
  };
}

function testApi(seed = {}, { skipInit = true, document } = {}) {
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
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' },
    console
  };
  if (document) globals.document = document;
  const context = vm.createContext(globals);
  vm.runInContext(script, context);
  return { api: window.NEXORA_TEST_API, storage };
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
  assert.deepEqual(document.listeners.map(({ type }) => type), ['click', 'input', 'keydown']);

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
