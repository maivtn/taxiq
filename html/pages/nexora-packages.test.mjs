import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const PAGE_URL = new URL('./nexora-packages.html', import.meta.url);
const BOOKING_PAGE_URL = new URL('./booking-book-phase-1.html', import.meta.url);
const SHELL_CSS_URL = new URL('../assets/nexora-shell.css', import.meta.url);
const PACKAGE_CSS_URL = new URL('../assets/nexora-packages.css', import.meta.url);
const PACKAGE_JS_URL = new URL('../assets/nexora-packages.js', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-packages.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function decodeEntities(value) {
  return value.replace(/&amp;/g, '&');
}

function fakeElement(dataset = {}) {
  return {
    dataset,
    hidden: false,
    tabIndex: 0,
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },
    addEventListener() {},
    focus() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    setAttribute() {}
  };
}

function fakeInteractiveElement(dataset = {}, options = {}) {
  const listeners = {};
  const attributes = new Set(options.attributes || []);
  const element = {
    dataset,
    hidden: Boolean(options.hidden),
    style: { overflow: '' },
    value: options.value || '',
    type: options.type || '',
    textContent: '',
    innerHTML: '',
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    dispatch(type, event = {}) {
      if (listeners[type]) listeners[type]({ preventDefault() {}, ...event });
    },
    focus() {},
    hasAttribute(name) {
      return attributes.has(name);
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    setAttribute(name) {
      attributes.add(name);
    },
    querySelector(selector) {
      return options.querySelector ? options.querySelector(selector) : null;
    },
    querySelectorAll(selector) {
      return options.querySelectorAll ? options.querySelectorAll(selector) : [];
    }
  };
  return element;
}

function createPackageActionRuntime(options = {}) {
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  const monthlyBillingButton = fakeInteractiveElement({ packageBillingCycle: 'monthly' });
  const yearlyBillingButton = fakeInteractiveElement({ packageBillingCycle: 'yearly' });
  const trialButton = fakeInteractiveElement({ planTrial: 'Pro' }, { attributes: ['data-plan-trial'] });
  const buyButton = fakeInteractiveElement({ planSelect: options.plan || 'Pro' }, { attributes: ['data-plan-select'] });
  const overview = fakeInteractiveElement();
  const purchaseHistory = fakeInteractiveElement();
  const tabs = ['overview', 'nexora', 'voice', 'history'].map((packageTab) => fakeInteractiveElement({ packageTab }));
  const panels = ['overview', 'nexora', 'voice', 'history'].map((packagePanel) => fakeInteractiveElement({ packagePanel }));
  const priceElements = [
    fakeInteractiveElement({ monthlyAmount: '29', billingPeriodFormat: 'spaced' }),
    fakeInteractiveElement({ monthlyAmount: '79', billingPeriodFormat: 'spaced' }),
    fakeInteractiveElement({ monthlyAmount: '99', billingPeriodFormat: 'compact' }),
    fakeInteractiveElement({ monthlyAmount: '199', billingPeriodFormat: 'compact' }),
    fakeInteractiveElement({ monthlyAmount: '349', billingPeriodFormat: 'compact' })
  ];
  const comparePriceCells = [
    fakeInteractiveElement({ monthlyAmount: '29' }),
    fakeInteractiveElement({ monthlyAmount: '79' })
  ];
  const paymentClose = fakeInteractiveElement();
  const paymentChildren = new Map([
    ['[data-package-payment-list]', fakeInteractiveElement()],
    ['[data-package-payment-title]', fakeInteractiveElement()],
    ['[data-package-invoice-product]', fakeInteractiveElement()],
    ['[data-package-invoice-plan]', fakeInteractiveElement()],
    ['[data-package-invoice-payment]', fakeInteractiveElement()],
    ['[data-package-invoice-total]', fakeInteractiveElement()],
    ['[data-package-payment-confirm-label]', fakeInteractiveElement()],
    ['[data-package-payment-close]', paymentClose],
    ['[data-package-payment-status]', fakeInteractiveElement()],
    ['[data-package-card-form]', fakeInteractiveElement({}, { hidden: true })],
    ['[data-package-card-error]', fakeInteractiveElement()]
  ]);
  const paymentModal = fakeInteractiveElement({}, {
    hidden: true,
    querySelector(selector) {
      return paymentChildren.get(selector) || null;
    }
  });
  const trialModal = fakeInteractiveElement({}, {
    hidden: true,
    querySelector(selector) {
      if (selector === '[data-trial-required]') return fakeInteractiveElement({}, { value: 'Demo Salon' });
      return null;
    }
  });

  const context = {
    Date,
    Intl,
    URL,
    document: {
      body: {
        classList: { add() {}, remove() {} },
        style: { overflow: '' }
      },
      addEventListener() {},
      querySelector(selector) {
        if (selector === '[data-package-overview]') return overview;
        if (selector === '[data-purchase-history]') return purchaseHistory;
        if (selector === '[data-package-payment-modal]') return paymentModal;
        if (selector === '[data-package-trial-modal]') return trialModal;
        if (selector === '[data-billing-compare-label]') return fakeInteractiveElement();
        return null;
      },
      querySelectorAll(selector) {
        if (selector === '[data-package-tab]') return tabs;
        if (selector === '[data-package-panel]') return panels;
        if (selector === '[data-package-billing-cycle]') return [monthlyBillingButton, yearlyBillingButton];
        if (selector === '[data-billing-price]') return priceElements;
        if (selector === '[data-billing-compare-price]') return comparePriceCells;
        if (selector.includes('data-plan-trial')) return [trialButton, buyButton];
        if (selector.includes('data-plan-select')) return [buyButton];
        return [];
      }
    },
    window: {
      addEventListener() {},
      history: { pushState() {}, replaceState() {} },
      location: { href: 'https://example.test/nexora-packages.html?tab=voice' },
      localStorage: { getItem() { return null; }, setItem() {} },
      lucide: { createIcons() {} },
      setInterval() {}
    }
  };

  vm.runInNewContext(runtime, context);
  if (options.billingCycle === 'yearly') yearlyBillingButton.dispatch('click');
  return {
    trialButton,
    buyButton,
    paymentModal,
    trialModal,
    monthlyBillingButton,
    yearlyBillingButton,
    priceElements,
    comparePriceCells,
    invoiceTotal: paymentChildren.get('[data-package-invoice-total]')
  };
}

function renderPackageHistoryHTML() {
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  const purchaseHistory = fakeElement();
  const overview = fakeElement();
  const tabs = ['overview', 'nexora', 'voice', 'history'].map((packageTab) => fakeElement({ packageTab }));
  const panels = ['overview', 'nexora', 'voice', 'history'].map((packagePanel) => fakeElement({ packagePanel }));
  const fixedNow = new Date('2026-08-04T12:00:00+07:00');
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [fixedNow]));
    }

    static now() {
      return fixedNow.getTime();
    }
  }
  Object.setPrototypeOf(FixedDate, Date);

  const context = {
    Date: FixedDate,
    Intl,
    URL,
    document: {
      body: {
        classList: { add() {}, remove() {} },
        style: { overflow: '' }
      },
      addEventListener() {},
      querySelector(selector) {
        if (selector === '[data-package-overview]') return overview;
        if (selector === '[data-purchase-history]') return purchaseHistory;
        if (selector === '[data-package-payment-modal]') return null;
        if (selector === '[data-package-trial-modal]') return null;
        return null;
      },
      querySelectorAll(selector) {
        if (selector === '[data-package-tab]') return tabs;
        if (selector === '[data-package-panel]') return panels;
        if (selector === '[data-nexora-select], [data-plan-select]') return [];
        return [];
      }
    },
    window: {
      addEventListener() {},
      history: { pushState() {}, replaceState() {} },
      location: { href: 'https://example.test/nexora-packages.html?tab=history' },
      localStorage: { getItem() { return null; }, setItem() {} },
      lucide: { createIcons() {} },
      setInterval() {}
    }
  };
  vm.runInNewContext(runtime, context);
  return purchaseHistory.innerHTML;
}

function renderPackageOverviewHTML() {
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  const overview = fakeElement();
  const purchaseHistory = fakeElement();
  const tabs = ['overview', 'nexora', 'voice', 'history'].map((packageTab) => fakeElement({ packageTab }));
  const panels = ['overview', 'nexora', 'voice', 'history'].map((packagePanel) => fakeElement({ packagePanel }));

  const context = {
    Date,
    Intl,
    URL,
    document: {
      body: {
        classList: { add() {}, remove() {} },
        style: { overflow: '' }
      },
      addEventListener() {},
      querySelector(selector) {
        if (selector === '[data-package-overview]') return overview;
        if (selector === '[data-purchase-history]') return purchaseHistory;
        if (selector === '[data-package-payment-modal]') return null;
        if (selector === '[data-package-trial-modal]') return null;
        return null;
      },
      querySelectorAll(selector) {
        if (selector === '[data-package-tab]') return tabs;
        if (selector === '[data-package-panel]') return panels;
        if (selector === '[data-nexora-select], [data-plan-select]') return [];
        if (selector === '[data-package-billing-cycle]') return [];
        if (selector === '[data-billing-price]') return [];
        if (selector === '[data-billing-compare-price]') return [];
        if (selector === '[data-countdown]') return [];
        return [];
      }
    },
    window: {
      addEventListener() {},
      history: { pushState() {}, replaceState() {} },
      location: { href: 'https://example.test/nexora-packages.html?tab=overview' },
      localStorage: { getItem() { return null; }, setItem() {} },
      lucide: { createIcons() {} },
      setInterval() {}
    }
  };
  vm.runInNewContext(runtime, context);
  return overview.innerHTML;
}

test('creates the empty Package Management page from the shared shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Package Management<\/title>/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<aside class="sidebar" aria-label="Dashboard sidebar"><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Package management content">/);
  assert.match(html, /activePage:\s*'packages'/);
});

test('adds the package heading and ordered management tabs', () => {
  const html = source();
  assert.match(html, /<h1 class="page-title"[^>]*>Package Management<\/h1>/);
  assert.match(html, /<p class="page-description"[^>]*>Manage NEXORA and AI Voice plans for your salon\.<\/p>/);
  const tabs = [...html.matchAll(/data-package-tab="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tabs, ['overview', 'nexora', 'voice', 'history']);
  assert.match(html, /role="tablist"/);
  assert.match(html, /Overview/);
  assert.match(html, /<span>Subscriptions<\/span>/);
  assert.match(html, /data-package-tab="nexora"[\s\S]*?data-lucide="gem"/);
  assert.match(html, /<span>AI Voice Plans<\/span>/);
  const voiceTab = html.match(/<button[^>]*data-package-tab="voice"[\s\S]*?<\/button>/)?.[0] || '';
  assert.match(voiceTab, /data-package-icon="phone-sparkles"/);
  assert.equal((voiceTab.match(/<svg\b/g) || []).length, 1);
  assert.match(voiceTab, /data-phone-shape="handset"/);
  assert.doesNotMatch(voiceTab, /<rect\b/);
  assert.doesNotMatch(voiceTab, /data-lucide="(?:phone|sparkles)"/);
  assert.doesNotMatch(html, /<span>Voice \+ SMS<\/span>/);
  assert.doesNotMatch(html, /<span>Credit Usage<\/span>/);
  assert.doesNotMatch(html, /data-package-tab="credits"/);
  assert.doesNotMatch(html, /data-package-panel="credits"/);
  const historyTab = html.match(/<button[^>]*data-package-tab="history"[\s\S]*?<\/button>/)?.[0] || '';
  assert.match(historyTab, /<span>Package History<\/span>/);
  assert.doesNotMatch(historyTab, /Purchase History/);
  assert.equal((html.match(/class="package-tab is-active"/g) || []).length, 1);
});

test('places Monthly and Yearly billing-cycle sub-tabs below paid-plan headings', () => {
  const html = source();
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  const billingSwitches = [...html.matchAll(/<div class="package-billing-switch" role="group" aria-label="Billing cycle">([\s\S]*?)<\/div>/g)].map((match) => match[1]);
  const nexoraPanel = html.match(/<section[^>]*data-package-panel="nexora"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
  const voicePanel = html.match(/<section[^>]*data-package-panel="voice"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
  const nexoraHeadingIndex = nexoraPanel.indexOf('class="nexora-package-heading"');
  const nexoraBillingIndex = nexoraPanel.indexOf('class="package-billing-switch"');
  const nexoraPlanGridIndex = nexoraPanel.indexOf('class="nexora-plan-grid"');
  const voiceHeroIndex = voicePanel.indexOf('class="plans-hero"');
  const voiceBillingIndex = voicePanel.indexOf('class="package-billing-switch"');
  const voicePlanGridIndex = voicePanel.indexOf('class="plans-grid package-plan-grid"');
  const pageHeadingStart = html.indexOf('<div class="page-heading package-heading">');
  const pageHeadingEnd = html.indexOf('<section id="package-panel-overview"', pageHeadingStart);
  const pageHeading = pageHeadingStart >= 0 && pageHeadingEnd > pageHeadingStart ? html.slice(pageHeadingStart, pageHeadingEnd) : '';

  assert.equal(billingSwitches.length, 2, 'NEXORA and AI Voice paid-plan panels should each expose billing-cycle sub-tabs');
  assert.doesNotMatch(pageHeading, /class="package-billing-switch"/);
  assert.ok(nexoraHeadingIndex >= 0, 'NEXORA package heading should render in the Subscriptions panel');
  assert.ok(nexoraBillingIndex > nexoraHeadingIndex, 'NEXORA billing-cycle sub-tabs should sit below the NEXORA package heading');
  assert.ok(nexoraPlanGridIndex > nexoraBillingIndex, 'NEXORA plan cards should sit below the billing-cycle sub-tabs');
  assert.ok(voiceBillingIndex > voiceHeroIndex, 'AI Voice billing-cycle sub-tabs should sit below the panel offer heading');
  assert.ok(voicePlanGridIndex > voiceBillingIndex, 'AI Voice plan cards should sit below the billing-cycle sub-tabs');
  billingSwitches.forEach((billingSwitch) => {
    assert.match(billingSwitch, /<button(?=[^>]*data-package-billing-cycle="monthly")(?=[^>]*aria-pressed="true")[^>]*>[\s\S]*?<span>Monthly<\/span>/);
    assert.match(billingSwitch, /<button(?=[^>]*data-package-billing-cycle="yearly")(?=[^>]*aria-pressed="false")[^>]*>[\s\S]*?<span>Yearly<\/span>[\s\S]*?<span class="package-billing-discount-chip">-20%<\/span>/);
  });

  assert.match(css, /\.package-billing-switch\s*\{/);
  assert.match(css, /\.package-billing-button\s*\{/);
  assert.match(css, /\.package-billing-button\.is-active\s*\{/);
  assert.match(css, /\.package-billing-discount-chip\s*\{[\s\S]*?background:\s*rgba\(239,\s*68,\s*68,\s*0\.12\)/);
  assert.match(css, /\.package-billing-discount-chip\s*\{[\s\S]*?color:\s*var\(--nexora-danger\)/);
});

test('synchronizes package tabs with URL state and browser history', () => {
  const html = source();
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  assert.match(runtime, /searchParams\.get\('tab'\)/);
  assert.match(runtime, /pushState/);
  assert.match(runtime, /addEventListener\('popstate'/);
  assert.match(runtime, /NEXORA_PACKAGE_SELECT_TAB/);
  assert.match(html, /onNavigate:\s*function \(tabId\)/);
  assert.match(html, /NEXORA_PACKAGE_SELECT_TAB\(tabId/);
});

test('renders the NEXORA plan cards and comparison table', () => {
  const html = source();
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  const nexoraPanel = html.match(/<section[^>]*data-package-panel="nexora"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
  assert.match(nexoraPanel, /class="nexora-package-content/);
  assert.match(nexoraPanel, /data-nexora-plan="starter"/);
  assert.match(nexoraPanel, /data-nexora-plan="pro"/);
  assert.match(nexoraPanel, /data-nexora-plan="enterprise"/);
  assert.equal((nexoraPanel.match(/data-nexora-plan=/g) || []).length, 3);
  assert.doesNotMatch(nexoraPanel, /Lite Pack \(Free\)/);
  assert.doesNotMatch(nexoraPanel, /data-nexora-select="Lite"/);
  assert.match(nexoraPanel, /Professional Pro/);
  assert.match(nexoraPanel, /Compare Plans/);
  const compareTable = nexoraPanel.match(/<table class="nexora-compare-table">([\s\S]*?)<\/table>/)?.[1] || '';
  assert.equal((compareTable.match(/scope="col"/g) || []).length, 4);
  assert.doesNotMatch(compareTable, />Lite</);
  assert.match(compareTable, />Starter</);
  assert.match(compareTable, />Pro</);
  assert.match(compareTable, />Enterprise</);
  assert.match(compareTable, /Google reviews/);
  assert.match(compareTable, /Premium NFC/);
  assert.match(css, /\.nexora-plan-grid\s*\{/);
  assert.match(css, /\.nexora-compare-table-wrap\s*\{/);
  assert.match(css, /\.nexora-compare-table\s*\{/);
  assert.match(css, /\.nexora-compare-table \.is-highlighted/);
  assert.match(css, /\.nexora-compare-table caption\s*\{[\s\S]*?position:\s*absolute/);
  assert.match(css, /\.nexora-plan-grid\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/);
  assert.match(css, /\.nexora-plan-grid \.nexora-plan-card\s*\{[\s\S]*?flex:\s*0 0 100%;/);
  assert.match(css, /@media \(min-width: 768px\)\s*\{[\s\S]*?\.nexora-plan-grid \.nexora-plan-card\s*\{[\s\S]*?flex:\s*0 0 calc\(33\.333% - 11px\);/);
});

test('opens a payment modal for paid plans and a Booking-style form for the AI Voice trial', () => {
  const html = source();
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  assert.equal((html.match(/data-nexora-select=/g) || []).length, 3);
  assert.equal((html.match(/data-plan-select=/g) || []).length, 3);
  assert.match(html, /data-package-payment-modal/);
  assert.match(html, /data-package-trial-modal/);
  assert.match(html, /data-package-payment-list/);
  assert.match(html, /data-package-invoice-plan/);
  assert.match(html, /data-package-invoice-payment/);
  assert.match(html, /data-package-invoice-total/);
  assert.match(html, /data-trial-field="salon"/);
  assert.match(html, /data-trial-field="owner"/);
  assert.match(html, /data-trial-field="phone"/);
  assert.match(html, /data-trial-field="email"/);
  assert.match(html, /data-package-trial-submit/);
  assert.match(runtime, /PACKAGE_PAYMENT_METHODS/);
  assert.match(runtime, /data-nexora-select/);
  assert.match(runtime, /data-plan-select/);
  assert.match(runtime, /openPackagePaymentModal/);
  assert.match(runtime, /openPackageTrialModal/);
  assert.match(runtime, /submitPackageTrial/);
  assert.match(runtime, /data-package-payment-confirm/);
  assert.equal((runtime.match(/product: 'NEXPRA TOUCH'/g) || []).length, 3);
  assert.match(css, /\.package-payment-modal\s*\{/);
  assert.match(css, /\.package-payment-list\s*\{/);
  assert.match(css, /\.package-payment-invoice\s*\{/);
  assert.match(css, /\.package-trial-modal\s*\{/);
  assert.match(css, /\.package-trial-grid\s*\{/);
});

test('renders separate trial and purchase actions for the Pro AI Voice plan', () => {
  const html = source();
  const voicePanel = html.match(/<section[^>]*data-package-panel="voice"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
  const proCard = voicePanel.match(/<article class="service-plan-card is-recommended" data-plan-card="pro">([\s\S]*?)<\/article>/)?.[1] || '';
  assert.match(proCard, /data-plan-trial="Pro"[\s\S]*?>Start 14-Day Free Trial<\/button>/);
  assert.match(proCard, /data-plan-select="Pro"[\s\S]*data-plan-buy[\s\S]*?>Choose Pro<\/button>/);
  assert.doesNotMatch(proCard, /No credit card required · Cancel anytime/);
  assert.equal((proCard.match(/<button class="plan-select-button/g) || []).length, 2);

  const trialRuntime = createPackageActionRuntime();
  trialRuntime.trialButton.dispatch('click');
  assert.equal(trialRuntime.trialModal.hidden, false);
  assert.equal(trialRuntime.paymentModal.hidden, true);

  const buyRuntime = createPackageActionRuntime();
  buyRuntime.buyButton.dispatch('click');
  assert.equal(buyRuntime.paymentModal.hidden, false);
  assert.equal(buyRuntime.trialModal.hidden, true);
});

test('switches paid package prices and payment totals to rounded yearly values', () => {
  const html = source();
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');

  assert.match(html, /data-billing-price data-monthly-amount="29" data-billing-period-format="spaced"/);
  assert.match(html, /data-billing-price data-monthly-amount="199" data-billing-period-format="compact"/);
  assert.match(runtime, /function formatYearlyBillingAmount\(monthlyAmount\)/);
  assert.match(runtime, /Math\.round\(monthlyAmount \* 12 \* 0\.8\)/);
  assert.match(runtime, /function renderBillingPrices\(\)/);
  assert.match(runtime, /data-billing-compare-price/);

  const yearlyRuntime = createPackageActionRuntime({ billingCycle: 'yearly', plan: 'Pro' });
  yearlyRuntime.buyButton.dispatch('click');

  assert.equal(yearlyRuntime.priceElements[0].innerHTML, '$278 <span>/ yr</span>');
  assert.equal(yearlyRuntime.priceElements[1].innerHTML, '$758 <span>/ yr</span>');
  assert.equal(yearlyRuntime.priceElements[2].innerHTML, '$950<span>/yr</span>');
  assert.equal(yearlyRuntime.priceElements[3].innerHTML, '$1,910<span>/yr</span>');
  assert.equal(yearlyRuntime.priceElements[4].innerHTML, '$3,350<span>/yr</span>');
  assert.equal(yearlyRuntime.invoiceTotal.textContent, '$1,910/yr');

  const monthlyRuntime = createPackageActionRuntime({ billingCycle: 'monthly', plan: 'Pro' });
  monthlyRuntime.buyButton.dispatch('click');
  assert.equal(monthlyRuntime.invoiceTotal.textContent, '$199/mo');
});

test('shows a SweetAlert pending message when the Free Trial is submitted twice', () => {
  const html = source();
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  assert.match(html, /sweetalert2@11/);
  assert.match(runtime, /let freeTrialSubmitted = false/);
  assert.match(runtime, /function showPendingTrialAlert/);
  assert.match(runtime, /window\.Swal\.fire/);
  assert.match(runtime, /details\.trial && freeTrialSubmitted/);
  assert.match(runtime, /freeTrialSubmitted = true/);
  assert.match(runtime, /Yêu cầu Free Trial đã được gửi và đang chờ xử lý/i);
  assert.match(runtime, /đã được gửi và đang chờ xử lý/i);
});

test('validates and submits the Free Trial information form before showing the pending state', () => {
  const html = source();
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  assert.match(html, /data-package-trial-form/);
  assert.match(html, /data-trial-required/);
  assert.match(html, /data-trial-chip/);
  assert.match(html, /data-trial-day/);
  assert.match(runtime, /validatePackageTrialForm/);
  assert.match(runtime, /submitPackageTrial/);
  assert.match(runtime, /freeTrialSubmitted = true/);
  assert.match(runtime, /showPendingTrialAlert/);
  assert.match(html, /data-package-trial-submit/);
});

test('copies the Booking Book Plans content into the Voice + SMS panel', () => {
  const html = source();
  const booking = readFileSync(BOOKING_PAGE_URL, 'utf8');
  const voicePanel = html.match(/<section[^>]*data-package-panel="voice"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
  assert.match(booking, /data-tab-panel="plans"[\s\S]*?service-plan-card/);
  assert.match(voicePanel, /class="package-plan-content"/);
  assert.match(voicePanel, /data-plan-card="starter"/);
  assert.match(voicePanel, /data-plan-card="pro"/);
  assert.match(voicePanel, /data-plan-card="elite"/);
  assert.match(voicePanel, /ROI Calculator/);
  assert.match(voicePanel, /No risk to you/);
  assert.match(voicePanel, /AI Voice \+ SMS Campaigns/);
  assert.match(voicePanel, /Start 14-Day Free Trial/);
});

test('renders the Products & Billing overview inside Package Management overview tab', () => {
  const html = source();
  const overviewHTML = renderPackageOverviewHTML();

  assert.match(html, /<script src="\.\.\/assets\/nexora-packages\.js"><\/script>/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-products-billing\.css">/);
  assert.match(html, /data-package-panel="overview"/);
  assert.match(html, /data-package-overview/);
  assert.match(overviewHTML, /Manage every NEXORA product in one place\./);
  assert.match(overviewHTML, /Products &amp; Billing/);
  assert.doesNotMatch(overviewHTML, /products-booking-link|Back to Booking|href="booking-book-phase-1\.html"/);
  assert.match(overviewHTML, /Active services[\s\S]*?<strong>3<\/strong>/);
  assert.match(overviewHTML, /Estimated monthly total[\s\S]*?<strong>\$377<\/strong>/);
  assert.match(overviewHTML, /Next invoice[\s\S]*?<strong>Aug 17<\/strong>/);

  for (const product of ['AI Phone', 'Tax IQ', 'QR Tips &amp; Reviews', 'Rewards', 'Booking']) {
    assert.match(overviewHTML, new RegExp(`<h2>${product}<\\/h2>`));
  }

  assert.match(overviewHTML, /Voice minutes[\s\S]*?842 \/ 1,000/);
  assert.match(overviewHTML, /Reports analyzed[\s\S]*?8 \/ 20/);
  assert.match(overviewHTML, /QR scans[\s\S]*?684 \/ 1,000/);
  assert.match(overviewHTML, /Members[\s\S]*?0 \/ 500/);
  assert.match(overviewHTML, /Appointments[\s\S]*?286 \/ 500/);
  assert.doesNotMatch(overviewHTML, /package-owned-card|Remaining Time|Auto Renew/);
});

test('provides the package purchase history panel and transaction data contract', () => {
  const html = source();
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  assert.match(html, /data-package-panel="history"/);
  assert.match(html, /data-purchase-history/);
  assert.match(runtime, /PURCHASE_HISTORY/);
  assert.match(runtime, /purchasedAt/);
  assert.match(runtime, /transactionId/);
  assert.match(runtime, /term: '1 month'/);
  assert.match(runtime, /validUntil/);
  assert.match(runtime, /amount/);
  assert.match(runtime, /function getPackageHistoryStatus/);
  assert.match(runtime, /function renderPurchaseHistory/);
  assert.doesNotMatch(runtime, /package-history-head/);
  assert.match(runtime, /<th scope="col">Term<\/th>/);
  assert.match(runtime, /<th scope="col">Valid Until<\/th>/);
  assert.match(runtime, /<th scope="col">Status<\/th>/);
  assert.match(runtime, /item\.term/);
  assert.match(runtime, /item\.validUntil/);
  assert.match(runtime, /package-history-status-badge/);
  assert.doesNotMatch(runtime, />Paid</);
  assert.match(css, /\.package-history/);
  assert.doesNotMatch(css, /\.package-history-head/);
  assert.match(css, /\.package-history-table/);
  assert.match(css, /\.package-history-term/);
  assert.match(css, /\.package-history-valid-until/);
  assert.match(css, /\.package-history-status-badge/);
  assert.match(css, /\.package-history-table caption\s*\{[\s\S]*?position:\s*absolute/);
});

test('renders package history columns in the requested order with package activity status', () => {
  const historyHTML = renderPackageHistoryHTML();
  const columnLabels = [...historyHTML.matchAll(/<th scope="col">([^<]+)<\/th>/g)].map((match) => decodeEntities(match[1]));
  assert.deepEqual(columnLabels, [
    'Date & time',
    'Amount',
    'Package',
    'Term',
    'Valid Until',
    'Status',
    'Transaction ID'
  ]);

  const firstRow = historyHTML.match(/<tbody>\s*<tr>([\s\S]*?)<\/tr>/)?.[1] || '';
  const rowLabels = [...firstRow.matchAll(/<td\b[^>]*data-label="([^"]+)"/g)].map((match) => decodeEntities(match[1]));
  assert.deepEqual(rowLabels, [
    'Date & time',
    'Amount',
    'Package',
    'Term',
    'Valid Until',
    'Status',
    'Transaction ID'
  ]);
  assert.match(historyHTML, /package-history-status-badge is-active[\s\S]*?>Active</);
  assert.match(historyHTML, /package-history-status-badge is-expired[\s\S]*?>Expired</);
  assert.doesNotMatch(historyHTML, />Paid</);
});

test('loads package-specific presentation styles', () => {
  const html = source();
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-packages\.css">/);
  assert.match(css, /\.package-tabs/);
  assert.match(css, /\.package-tab\.is-active/);
  assert.match(css, /\.visually-hidden\s*\{[\s\S]*?position:\s*absolute[\s\S]*?width:\s*1px[\s\S]*?height:\s*1px/);
  assert.match(css, /\.swal2-popup\s*\{[\s\S]*?font-family:\s*Inter/);
  assert.match(css, /\.swal2-popup\s*\{[\s\S]*?border-radius:\s*16px/);
  assert.match(css, /\.swal2-styled\.swal2-confirm\s*\{[\s\S]*?background:\s*linear-gradient\(90deg/);
  assert.match(css, /\.swal2-icon\.swal2-info\s*\{[\s\S]*?color:\s*var\(--nexora-brand\)/);
});

test('matches the Booking Hub tab treatment', () => {
  const html = source();
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  assert.equal((html.match(/class="package-tab-icon(?: package-tab-icon-dual)?"/g) || []).length, 4);
  assert.match(css, /\.package-tab\s*\{[\s\S]*?border:\s*1px\s+solid\s+var\(--nexora-border\)/);
  assert.match(css, /\.package-tab\s*\{[\s\S]*?border-radius:\s*12px/);
  assert.match(css, /\.package-tab-icon\s*\{[\s\S]*?width:\s*28px[\s\S]*?height:\s*28px/);
  assert.match(css, /\.package-tab\.is-active\s*\{[\s\S]*?linear-gradient\(90deg,\s*var\(--nexora-electric\),\s*var\(--nexora-violet\)\)/);
});

test('applies the Inter font through the shared shell', () => {
  const shellCss = readFileSync(SHELL_CSS_URL, 'utf8');
  assert.match(shellCss, /html,\s*body\s*\{[\s\S]*?font-family:\s*["']Inter["']/);
});
