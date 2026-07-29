import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const PAGE_URL = new URL('./nexora-credits.html', import.meta.url);
const CSS_URL = new URL('../assets/nexora-credits.css', import.meta.url);
const JS_URL = new URL('../assets/nexora-credits.js', import.meta.url);
const BOOKING_URL = new URL('./booking-book-phase-1.html', import.meta.url);
const PACKAGES_URL = new URL('./nexora-packages.html', import.meta.url);
const SHELL_JS_URL = new URL('../assets/nexora-shell.js', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-credits.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function loadCreditsRuntime(seed, document) {
  const window = {};
  const context = vm.createContext({
    window,
    document: document || { querySelector() { return null; }, querySelectorAll() { return []; } },
    Intl,
    Number,
    Date
  });
  vm.runInContext(readFileSync(JS_URL, 'utf8'), context);
  return { api: window.NEXORA_CREDITS };
}

test('creates the Credits Management page with the monthly plan and SMS credit cards', () => {
  const html = source();

  assert.match(html, /<title>Nexora Touch - Credits Management<\/title>/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-credits\.css">/);
  assert.match(html, /<main class="content" aria-label="Credits management content">/);
  assert.match(html, /href="booking-book-phase-1\.html\?tab=sms-campaigns"[^>]*data-credits-back/);
  assert.match(html, /data-credits-card="plan"/);
  assert.match(html, /data-credits-card="sms-topup"/);
  assert.match(html, /data-credits-history/);
  assert.doesNotMatch(html, /credits-heading-badge/);
  assert.match(html, /activePage:\s*'booking'/);
  assert.match(html, /activeTab:\s*'sms-campaigns'/);
});

test('exposes SMS purchase and monthly plan reset information', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const runtime = readFileSync(JS_URL, 'utf8');

  assert.match(html, /href="booking-book-phase-1\.html\?tab=sms-campaigns&amp;openCredits=1"/);
  for (const page of [html, packages]) {
    assert.match(page, /class="credits-reset-action"[\s\S]*<time data-credits-plan-expiry/);
    assert.doesNotMatch(page, /Reset \/ month/);
    assert.match(page, /Expires <time data-credits-plan-expiry/);
  }
  assert.match(runtime, /function renderPlanExpiryDate\(/);
  assert.match(runtime, /data-credits-plan-expiry/);
});

test('labels the SMS top-up action in Vietnamese', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');

  assert.match(html, />Mua SMS credit<\/span>/);
  assert.match(packages, />Mua SMS credit<\/span>/);
  assert.doesNotMatch(html, />Buy SMS Credits<\/span>/);
  assert.doesNotMatch(packages, />Buy SMS Credits<\/span>/);
});

test('adds a confirmed local storage clear action to the Credits and Package headers', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const shell = readFileSync(SHELL_JS_URL, 'utf8');

  assert.match(html, /showClearStorage:\s*true/);
  assert.match(packages, /showClearStorage:\s*true/);
  assert.match(shell, /data-shell-clear-storage/);
  assert.match(shell, /localStorage\.clear\(\)/);
  assert.match(shell, /window\.confirm\(/);
});

test('keeps credit state out of browser local storage', () => {
  const runtime = readFileSync(JS_URL, 'utf8');

  assert.doesNotMatch(runtime, /localStorage/);
  assert.doesNotMatch(runtime, /taxiq:sms-(?:credits|credit-wallet|credit-history)/);
});

test('matches the compact monthly plan and rollover credit layout in both pages', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  for (const page of [html, packages]) {
    assert.match(page, /data-credits-card="plan"/);
    assert.doesNotMatch(page, /credits-plan-allowance/);
    assert.match(page, /class="credits-usage-row credits-usage-row-minutes"/);
    assert.match(page, /class="credits-usage-row credits-usage-row-sms"/);
    assert.match(page, /class="credits-usage-row credits-usage-row-sms"[\s\S]*?class="credits-usage-heading"><span>SMS used<\/span>/);
    assert.match(page, /data-credits-voice-used/);
    assert.match(page, /data-credits-sms-plan-used/);
    assert.match(page, /data-credits-voice-progress/);
    assert.match(page, /data-credits-sms-plan-progress/);
    assert.doesNotMatch(page, /credits-card-note-plan/);
    assert.match(page, /data-credits-card="sms-topup"/);
    assert.match(page, /Không hết hạn/);
    assert.doesNotMatch(page, /Không bị reset/);
    assert.match(page, /data-credits-sms-topup-balance/);
    assert.match(page, /data-credits-sms-topup-usage/);
    assert.match(page, /data-credits-sms-topup-usage[\s\S]*?class="credits-usage-icon credits-usage-icon-sms"[\s\S]*?SMS Credits used/);
    assert.doesNotMatch(page, /class="credits-card-note credits-card-note-topup"/);
    assert.doesNotMatch(page, /SMS Credits sẽ tự động được dùng khi 1,000 SMS trong gói Pro đã hết/);
    assert.doesNotMatch(page, /credits-card-voice/);
    assert.doesNotMatch(page, /credits-sms-breakdown/);
    assert.doesNotMatch(page, /credits-voice-allowance/);
  }

  assert.match(css, /\.credits-balance-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.credits-balance-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.doesNotMatch(css, /\.credits-plan-allowance/);
  assert.match(css, /\.credits-usage-row\s*\{/);
  assert.match(css, /\.credits-usage-progress\s*\{/);
  assert.doesNotMatch(css, /\.credits-card-note(?:-plan|-topup)?\s*\{/);
  assert.doesNotMatch(css, /\.credits-card-note-plan/);
  assert.match(css, /\.credits-card-topup\s*\{/);
});

test('keeps Credit Usage cards compact without hiding their usage details', () => {
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(css, /\.credits-balance-grid\s*\{[\s\S]*?gap:\s*12px/);
  assert.match(css, /\.credits-card\s*\{\s*padding:\s*14px;/);
  assert.match(css, /\.credits-card-head\s*\{[\s\S]*?gap:\s*9px/);
  assert.match(css, /\.credits-plan-usage\s*\{[\s\S]*?gap:\s*12px[\s\S]*?margin-top:\s*12px/);
  assert.match(css, /\.credits-usage-progress\s*\{[\s\S]*?height:\s*6px[\s\S]*?margin-top:\s*5px/);
  assert.doesNotMatch(css, /\.credits-card-note\s*\{/);
  assert.match(css, /\.credits-topup-usage\s*\{\s*margin-top:\s*12px/);
  assert.match(css, /\.credits-plan-remaining\s*\{[\s\S]*?display:\s*grid/);
  assert.match(css, /\.credits-plan-remaining > \.credits-label\s*\{[\s\S]*?font-weight:\s*400/);
  assert.match(css, /\.credits-plan-remaining-values\s*\{[\s\S]*?display:\s*flex/);
  assert.match(css, /\.credits-plan-remaining strong\s*\{[\s\S]*?font-size:\s*29px/);
  assert.match(css, /\.credits-plan-remaining-unit\s*\{/);
});

test('reduces Pro and SMS Credits typography on mobile', () => {
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*?\.credits-card\s*\{[^}]*padding:\s*10px/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*?\.credits-card-head h2\s*\{[^}]*font-size:\s*14px/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*?\.credits-plan-subtitle,[\s\S]*?\.credits-topup-subtitle\s*\{[^}]*font-size:\s*8px/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*?\.credits-reset-action,[\s\S]*?\.credits-rollover-badge\s*\{[^}]*font-size:\s*8px/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*?\.credits-label\s*\{[^}]*font-size:\s*9px/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*?\.credits-plan-remaining strong,[\s\S]*?\.credits-topup-balance\s*\{[^}]*font-size:\s*18px/);
});

test('matches the reference card hierarchy and Pro monthly allowance', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const runtime = readFileSync(JS_URL, 'utf8');

  for (const page of [html, packages]) {
    const planCard = page.match(/data-credits-card="plan"[\s\S]*?<\/article>/)?.[0] || '';
    const topupCard = page.match(/data-credits-card="sms-topup"[\s\S]*?<\/article>/)?.[0] || '';
    assert.match(planCard, /<h2 id="plan-credits-title">Pro<\/h2>/);
    assert.match(planCard, /<h2 id="plan-credits-title">Pro<\/h2>\s*<p class="credits-plan-subtitle">AI Voice Plan<\/p>/);
    assert.doesNotMatch(planCard, /credits-plan-allowance/);
    assert.doesNotMatch(planCard, /credits-card-kicker[^>]*>Monthly plan<\/span>/);
    assert.match(topupCard, /<h2 id="sms-credits-title">SMS Credits<\/h2>[\s\S]*?<p class="credits-topup-subtitle">/);
    assert.doesNotMatch(topupCard, /Purchased balance/);
  }

  assert.match(runtime, /const SMS_PLAN_ALLOWANCE = 1000/);
});

test('uses the reference default credit usage data in both Credit Usage views', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const runtime = readFileSync(JS_URL, 'utf8');

  for (const page of [html, packages]) {
    const planCard = page.match(/data-credits-card="plan"[\s\S]*?<\/article>/)?.[0] || '';
    const topupCard = page.match(/data-credits-card="sms-topup"[\s\S]*?<\/article>/)?.[0] || '';
    assert.match(planCard, /data-credits-voice-used>620<\/span>/);
    assert.match(planCard, /data-credits-sms-plan-used>1,000<\/span>/);
    assert.match(planCard, /class="credits-plan-remaining"[\s\S]*?class="credits-label">Còn lại<\/span>[\s\S]*?class="credits-plan-remaining-values"[\s\S]*?data-credits-voice-remaining>380[\s\S]*?data-credits-sms-plan-remaining>0/);
    assert.match(topupCard, /class="credits-usage-heading"><span>SMS Credits used<\/span>/);
    assert.doesNotMatch(topupCard, /SMS Credits used \(sau khi gói hết\)/);
    assert.match(topupCard, /data-credits-sms-topup-balance>450<\/strong>/);
    assert.doesNotMatch(topupCard, /class="credits-topup-total"/);
    assert.match(topupCard, /data-credits-sms-topup-used>50<\/span>/);
    assert.match(topupCard, /data-credits-sms-topup-usage-total>500<\/span>/);
    assert.doesNotMatch(topupCard, /data-credits-sms-topup-usage hidden/);
    assert.match(topupCard, /width:10%/);
    assert.match(page, /Dùng khi SMS trong gói đã hết/);
  }

  assert.match(runtime, /const SMS_STARTING_CREDITS = 0/);
  assert.match(runtime, /const SMS_STARTING_TOPUP_BALANCE = 450/);
  assert.match(runtime, /const SMS_STARTING_TOPUP_TOTAL = 500/);
    assert.match(runtime, /const VOICE_USED_MINUTES = 620/);
});

test('keeps usage icons free of an extra outer border', () => {
  const css = readFileSync(CSS_URL, 'utf8');
  const iconRule = css.match(/\.credits-usage-icon\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(iconRule, /border:\s*0/);
  assert.match(iconRule, /border-radius:\s*0/);
  assert.doesNotMatch(css, /\.credits-usage-icon-sms\s*\{[^}]*border-radius/);
});

test('keeps progress bars without visible percentage labels', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  assert.doesNotMatch(html, /credits-usage-percent/);
  assert.doesNotMatch(packages, /credits-usage-percent/);
  assert.doesNotMatch(css, /\.credits-usage-percent\s*\{/);
});

test('renders monthly usage percentages and rollover SMS usage from the wallet', () => {
  const targets = new Map();
  const makeTarget = () => ({ textContent: '', innerHTML: '', hidden: false, style: {}, setAttribute() {} });
  const selectors = [
    '[data-credits-page]',
    '[data-credits-history]',
    '[data-credits-sms-topup-balance]',
    '[data-credits-sms-plan-used]',
    '[data-credits-sms-plan-total]',
    '[data-credits-voice-remaining]',
    '[data-credits-voice-warning]',
    '[data-credits-voice-warning-remaining]',
    '[data-credits-sms-plan-remaining]',
    '[data-credits-sms-plan-progress]',
    '[data-credits-sms-plan-progress-track]',
    '[data-credits-voice-used]',
    '[data-credits-voice-total]',
    '[data-credits-voice-progress]',
    '[data-credits-voice-progress-track]',
    '[data-credits-sms-topup-usage]',
    '[data-credits-sms-topup-used]',
    '[data-credits-sms-topup-usage-total]',
    '[data-credits-sms-topup-progress]',
    '[data-credits-sms-topup-progress-track]',
  ];
  selectors.forEach((selector) => targets.set(selector, makeTarget()));
  const document = {
    querySelector(selector) {
      return targets.get(selector) || null;
    },
    querySelectorAll() {
      return [];
    }
  };

  const { api } = loadCreditsRuntime({}, document);
  api.renderCreditsPage();

  assert.equal(targets.get('[data-credits-voice-used]').textContent, '620');
  assert.equal(targets.get('[data-credits-voice-total]').textContent, '1,000');
  assert.equal(targets.get('[data-credits-voice-remaining]').textContent, '380');
  assert.equal(targets.get('[data-credits-voice-warning]').hidden, true);
  assert.equal(targets.get('[data-credits-voice-warning-remaining]').textContent, '380');
  assert.equal(targets.get('[data-credits-voice-progress]').style.width, '62%');
  assert.equal(targets.get('[data-credits-sms-plan-used]').textContent, '1,000');
  assert.equal(targets.get('[data-credits-sms-plan-total]').textContent, '1,000');
  assert.equal(targets.get('[data-credits-sms-plan-remaining]').textContent, '0');
  assert.equal(targets.get('[data-credits-sms-plan-progress]').style.width, '100%');
  assert.equal(targets.get('[data-credits-sms-topup-balance]').textContent, '450');
  assert.equal(targets.get('[data-credits-sms-topup-used]').textContent, '50');
  assert.equal(targets.get('[data-credits-sms-topup-usage-total]').textContent, '500');
  assert.equal(targets.get('[data-credits-sms-topup-progress]').style.width, '10%');
  assert.equal(targets.get('[data-credits-sms-topup-usage]').hidden, false);
});

test('renders both credit balances, progress indicators, and usage history', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  assert.doesNotMatch(html, /Recent activity across SMS and Voice/);
  assert.doesNotMatch(packages, /Recent activity across SMS and Voice/);
  assert.match(html, /Pro/);
  assert.match(packages, /Pro/);
  assert.match(html, /SMS Credits/);
  assert.match(packages, /SMS Credits/);
  assert.doesNotMatch(html, /credits-balance-unit/);
  assert.doesNotMatch(packages, /credits-balance-unit/);
  assert.doesNotMatch(html, /Total available/);
  assert.doesNotMatch(packages, /Total available/);
  assert.doesNotMatch(html, /<span class="credits-balance-unit">AI Voice minutes<\/span>/);
  assert.doesNotMatch(packages, /<span class="credits-balance-unit">AI Voice minutes<\/span>/);
  assert.doesNotMatch(html, /Credits are shared with SMS Campaigns/);
  assert.doesNotMatch(packages, /Credits are shared with SMS Campaigns/);
  assert.doesNotMatch(html, /Top-ups are managed through your voice plan/);
  assert.doesNotMatch(packages, /Top-ups are managed through your voice plan/);
  assert.match(html, /data-credits-sms-topup-balance/);
  assert.match(html, /data-credits-voice-used/);
  assert.match(html, /credits-usage-progress/);
  assert.match(packages, /credits-usage-progress/);
  assert.match(html, /<th scope="col">Product<\/th>/);
  assert.match(html, /<th scope="col">Activity<\/th>/);
  assert.match(html, /<th scope="col">Usage<\/th>/);
  assert.match(html, /<th scope="col">Date<\/th>/);
  assert.doesNotMatch(html, /<th scope="col">Balance after<\/th>/);
  assert.doesNotMatch(packages, /<th scope="col">Balance after<\/th>/);
  assert.match(runtime, /SMS_STARTING_CREDITS\s*=\s*0/);
  assert.match(runtime, /VOICE_USED_MINUTES\s*=\s*620/);
  assert.match(runtime, /VOICE_TOTAL_MINUTES\s*=\s*1000/);
  assert.doesNotMatch(runtime, /localStorage/);
  assert.doesNotMatch(runtime, /taxiq:sms-(?:credits|credit-wallet|credit-history)/);
  assert.match(runtime, /function readSmsCredits\(\)/);
  assert.match(runtime, /function writeSmsCredits\(value\)/);
  assert.match(runtime, /function readSmsWallet\(\)/);
  assert.match(runtime, /function addSmsTopupCredits\(value\)/);
  assert.match(runtime, /function consumeSmsCredits\(value\)/);
  assert.match(runtime, /function recordSmsCreditPurchase\(/);
  assert.match(runtime, /credits-amount-positive/);
  assert.match(runtime, /function renderHistoryDate\(value\)/);
  assert.match(runtime, /credits-history-date/);
  assert.doesNotMatch(runtime, /escapeHTML\(item\.balance\)/);
  assert.match(runtime, /function setProgress\(/);
  assert.match(runtime, /data-credits-sms-plan-progress/);
  assert.match(runtime, /data-credits-voice-progress/);
  assert.match(readFileSync(BOOKING_URL, 'utf8'), /recordSmsCreditPurchase\(/);
  assert.match(readFileSync(BOOKING_URL, 'utf8'), /addSmsTopupCredits\(/);
  assert.match(readFileSync(BOOKING_URL, 'utf8'), /consumeSmsCredits\(/);
  assert.match(html, /data-credits-sms-plan-used/);
  assert.match(html, /data-credits-sms-topup-balance/);
  assert.match(packages, /data-credits-sms-plan-used/);
  assert.match(packages, /data-credits-sms-topup-balance/);
  assert.doesNotMatch(html, /Estimated value/);
  assert.doesNotMatch(html, /data-credits-sms-value/);
  assert.doesNotMatch(packages, /Estimated value/);
  assert.doesNotMatch(packages, /data-credits-sms-value/);
  assert.match(css, /\.credits-balance-grid\s*\{/);
  assert.match(css, /\.credits-card-foot\s*\{[\s\S]*?border-top:\s*0/);
  assert.match(css, /\.credits-usage-progress\s*\{/);
  assert.match(css, /\.credits-history-scroll\s*\{/);
  assert.match(css, /\.credits-amount-positive\s*\{/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
});

test('adds a conditional Voice warning card above Usage history', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const runtime = readFileSync(JS_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  for (const page of [html, packages]) {
    const warningIndex = page.indexOf('class="credits-voice-warning"');
    const historyIndex = page.indexOf('class="credits-history-section"');
    assert.ok(warningIndex >= 0, 'Voice warning card must exist');
    assert.ok(warningIndex < historyIndex, 'Voice warning card must appear above Usage history');
    assert.match(page, /data-credits-voice-warning[^>]*role="status"[^>]*hidden/);
    assert.match(page, /AI Voice sắp hết/);
    assert.match(page, /tắt chế độ AI Voice hoặc nâng cấp gói/);
    assert.match(page, /data-credits-voice-warning-remaining/);
  }

  assert.match(runtime, /const VOICE_LOW_BALANCE_THRESHOLD\s*=\s*200/);
  assert.match(runtime, /function renderVoiceWarning\(/);
  assert.match(runtime, /renderVoiceWarning\(voiceRemaining\)/);
  assert.match(css, /\.credits-voice-warning\s*\{[\s\S]*?display:\s*flex/);
  assert.match(css, /\.credits-voice-warning\[hidden\]\s*\{\s*display:\s*none/);
});

test('filters usage history by All, SMS, and Voice products', () => {
  const html = source();
  const packages = readFileSync(PACKAGES_URL, 'utf8');
  const runtime = readFileSync(JS_URL, 'utf8');
  const historyTarget = { innerHTML: '' };
  const filterButtons = ['all', 'sms', 'voice'].map(function (filter) {
    return {
      dataset: { creditsHistoryFilter: filter },
      classList: { toggle() {} },
      setAttribute() {},
      addEventListener() {}
    };
  });
  const document = {
    querySelector(selector) {
      return selector === '[data-credits-history]' ? historyTarget : null;
    },
    querySelectorAll(selector) {
      return selector === '[data-credits-history-filter]' ? filterButtons : [];
    }
  };
  const { api } = loadCreditsRuntime({}, document);

  for (const page of [html, packages]) {
    assert.match(page, /data-credits-history-filter="all"/);
    assert.match(page, /data-credits-history-filter="sms"/);
    assert.match(page, /data-credits-history-filter="voice"/);
  }
  assert.match(runtime, /function setHistoryFilter\(filter\)/);
  assert.doesNotMatch(html, /Jul 28, 2026 · 10:42 AM/);
  assert.doesNotMatch(packages, /Jul 28, 2026 · 10:42 AM/);
  assert.match(html, /credits-history-date[^>]*>[\s\S]*?Jul 28, 2026[\s\S]*?<small>10:42 AM<\/small>/);
  assert.match(packages, /credits-history-date[^>]*>[\s\S]*?Jul 28, 2026[\s\S]*?<small>10:42 AM<\/small>/);

  api.setHistoryFilter('voice');
  assert.match(historyTarget.innerHTML, /credits-product-badge-voice/);
  assert.doesNotMatch(historyTarget.innerHTML, /credits-product-badge-sms/);
  assert.match(historyTarget.innerHTML, /credits-history-date[\s\S]*?Jul 28, 2026<small>10:42 AM<\/small>/);

  api.setHistoryFilter('sms');
  assert.match(historyTarget.innerHTML, /credits-product-badge-sms/);
  assert.doesNotMatch(historyTarget.innerHTML, /credits-product-badge-voice/);
});

test('keeps credit state in memory only for the current runtime', () => {
  const firstRuntime = loadCreditsRuntime({});
  assert.deepEqual(JSON.parse(JSON.stringify(firstRuntime.api.readSmsWallet())), {
    planRemaining: 0,
    topupBalance: 450,
    topupTotal: 500,
    cycleKey: firstRuntime.api.readSmsWallet().cycleKey
  });
  assert.equal(firstRuntime.api.addSmsTopupCredits(500), 950);

  const secondRuntime = loadCreditsRuntime({});
  assert.equal(secondRuntime.api.readSmsCredits(), 450);
});

test('consumes rollover SMS credits after the Pro allowance is exhausted', () => {
  const { api } = loadCreditsRuntime({});

  const result = api.consumeSmsCredits(100);

  assert.deepEqual(JSON.parse(JSON.stringify(result)), { success: true, balance: 350 });
  assert.deepEqual(JSON.parse(JSON.stringify(api.readSmsWallet())), {
    planRemaining: 0,
    topupBalance: 350,
    topupTotal: 500,
    cycleKey: api.readSmsWallet().cycleKey
  });
});

test('adds purchased SMS credits to the non-resetting top-up balance', () => {
  const { api } = loadCreditsRuntime({});

  assert.equal(api.addSmsTopupCredits(500), 950);
  assert.deepEqual(JSON.parse(JSON.stringify(api.readSmsWallet())), {
    planRemaining: 0,
    topupBalance: 950,
    topupTotal: 1000,
    cycleKey: api.readSmsWallet().cycleKey
  });
});

test('keeps the Credits Management runtime syntactically valid', () => {
  assert.doesNotThrow(() => new Function(readFileSync(JS_URL, 'utf8')));
});

test('keeps credit actions visible while hovering or focusing the card', () => {
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(css, /\.credits-card-foot\s*\{[\s\S]*?min-width:\s*0;/);
  assert.match(css, /\.credits-action\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?visibility:\s*visible;/);
  assert.match(css, /\.credits-action(?::hover|:focus-visible)[^{]*\{[\s\S]*?opacity:\s*1;[\s\S]*?visibility:\s*visible;/);
});

test('keeps the SMS credit action readable on hover', () => {
  const css = readFileSync(CSS_URL, 'utf8');
  const actionRule = css.match(/\.credits-action\s*\{([^}]*)\}/)?.[1] || '';
  const primaryRule = css.match(/\.credits-action-primary\s*\{([^}]*)\}/)?.[1] || '';
  const primaryHoverRule = css.match(/\.credits-action-primary:hover\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(actionRule, /transition:/);
  assert.match(primaryRule, /background-color:\s*#4648d8\s*!important/);
  assert.match(primaryRule, /color:\s*#fff\s*!important/);
  assert.match(primaryHoverRule, /background-color:\s*#393bc8\s*!important/);
  assert.match(primaryHoverRule, /color:\s*#fff\s*!important/);
  assert.match(css, /\.credits-action-primary span\s*\{[^}]*display:\s*inline\s*!important[^}]*opacity:\s*1\s*!important/);
  assert.match(css, /\.credits-action-primary svg\s*\{[^}]*display:\s*inline-flex\s*!important[^}]*opacity:\s*1\s*!important/);
});

test('shows Voice usage history activity without phone numbers', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(html, /<th scope="col">Activity<\/th>/);
  assert.match(html, /<th scope="col">Usage<\/th>/);
  assert.match(html, /<span class="credits-history-activity"><strong>Incoming call<\/strong><\/span>/);
  assert.doesNotMatch(html, /\+1 \(713\) 555-0182|\+1 \(832\) 555-0104|\+1 \(281\) 555-0199/);
  assert.doesNotMatch(runtime, /phone:\s*'\+1 \(713\) 555-0182'/);
  assert.doesNotMatch(runtime, /phone:\s*'\+1 \(832\) 555-0104'/);
  assert.doesNotMatch(runtime, /phone:\s*'\+1 \(281\) 555-0199'/);
  assert.match(runtime, /activity:\s*'Incoming call'/);
  assert.match(runtime, /credits-history-activity/);
  assert.match(css, /\.credits-history-activity\s*{/);
  assert.match(css, /\.credits-history-activity strong\s*\{[^}]*font-weight:\s*400/);
  assert.match(css, /\.credits-history-table td:nth-child\(2\)\s*\{\s*font-weight:\s*400/);
});

test('keeps the credits history caption screen-reader only', () => {
  const html = source();
  const srOnlyRule = readFileSync(CSS_URL, 'utf8').match(/\.sr-only\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(html, /<caption class="sr-only">Recent SMS and Voice credit usage<\/caption>/);
  assert.match(srOnlyRule, /position:\s*absolute/);
  assert.match(srOnlyRule, /width:\s*1px/);
  assert.match(srOnlyRule, /height:\s*1px/);
  assert.match(srOnlyRule, /overflow:\s*hidden/);
  assert.match(srOnlyRule, /white-space:\s*nowrap/);
});
