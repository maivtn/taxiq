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

function testApi(seed = {}) {
  const source = html();
  const script = source.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
  assert.ok(script, 'inline application script must exist');
  const storage = createMemoryStorage(seed);
  const window = {
    localStorage: storage,
    NEXORA_SKIP_INIT: true,
    setTimeout() { return 1; },
    clearTimeout() {},
    lucide: null
  };
  const context = vm.createContext({
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
  });
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
