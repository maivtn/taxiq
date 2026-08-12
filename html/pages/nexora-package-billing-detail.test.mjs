import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const PAGE_URL = new URL('./nexora-package-billing-detail.html', import.meta.url);
const DETAIL_CSS_URL = new URL('../assets/nexora-package-billing-detail.css', import.meta.url);
const DETAIL_JS_URL = new URL('../assets/nexora-package-billing-detail.js', import.meta.url);
const BILLING_DATA_URL = new URL('../assets/nexora-package-billing-data.js', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-package-billing-detail.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function fakeElement(options = {}) {
  const listeners = {};
  return {
    hidden: Boolean(options.hidden),
    innerHTML: '',
    textContent: '',
    style: { overflow: '' },
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
    querySelector() { return null; },
    setAttribute() {}
  };
}

function createBillingRuntime(search) {
  assert.ok(existsSync(DETAIL_JS_URL), 'nexora-package-billing-detail.js must exist');
  const root = fakeElement();
  const documentListeners = {};
  const document = {
    body: {
      style: { overflow: '' },
      classList: { add() {}, remove() {} }
    },
    querySelector(selector) {
      if (selector === '[data-billing-detail-root]') return root;
      return null;
    },
    addEventListener(type, handler) {
      documentListeners[type] = handler;
    },
    dispatch(type, event = {}) {
      if (documentListeners[type]) documentListeners[type]({ preventDefault() {}, ...event });
    }
  };
  const context = {
    Date,
    Intl,
    URLSearchParams,
    document,
    window: {
      location: { search },
      lucide: { createIcons() {} }
    }
  };

  vm.runInNewContext(readFileSync(BILLING_DATA_URL, 'utf8'), context);
  vm.runInNewContext(readFileSync(DETAIL_JS_URL, 'utf8'), context);
  return { document, root };
}

test('creates Billing Detail from the Salon shared-shell skeleton', () => {
  const html = source();

  assert.match(html, /<html lang="en-US">/);
  assert.match(html, /<title>Nexora Touch - Billing Details<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar" aria-label="Dashboard sidebar"><\/aside>/);
  assert.match(html, /<div class="app-area">/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Billing details content">/);
  assert.match(html, /<a[^>]*href="nexora-packages\.html\?tab=history"[^>]*>[\s\S]*?Back to Package History/);
  assert.match(html, /data-billing-detail-root/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-package-billing-detail\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-package-billing-data\.js"><\/script>\s*<script src="\.\.\/assets\/nexora-package-billing-detail\.js"><\/script>/);
  assert.match(html, /activePage:\s*'packages'/);
  assert.match(html, /activeTab:\s*'history'/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
});

test('renders a paid billing record with invoice and receipt downloads', () => {
  const html = createBillingRuntime('?transaction=NXR-20260810-0003').root.innerHTML;

  assert.match(html, /Receipt from NEXORA Touch/);
  assert.match(html, /billing-detail-status is-paid[\s\S]*?>Paid</);
  assert.match(html, /\$79\.00/);
  assert.match(html, /Download invoice/);
  assert.match(html, /href="assets\/billing-documents\/Invoice-NX-2026-0810-023749\.pdf"[^>]*download="Invoice-NX-2026-0810-023749\.pdf"/);
  assert.match(html, /Download receipt/);
  assert.match(html, /href="assets\/billing-documents\/Receipt-RCPT-2026-0810-023749\.pdf"[^>]*download="Receipt-RCPT-2026-0810-023749\.pdf"/);
  assert.match(html, /Receipt #RCPT-2026-0810-023749/);
  assert.match(html, /Invoice number[\s\S]*?NX-2026-0810-023749/);
  assert.match(html, /Visa[\s\S]*?4242/);
  assert.match(html, /Stripe/);
  assert.match(html, /Professional Pro/);
  assert.match(html, /Amount paid[\s\S]*?\$79\.00/);
  assert.doesNotMatch(html, /data-billing-pay-now/);
});

test('renders a payment-due invoice without a receipt download', () => {
  const html = createBillingRuntime('?transaction=SMS-20260811-0001').root.innerHTML;

  assert.match(html, /Invoice from NEXORA Touch/);
  assert.match(html, /billing-detail-status is-payment-due[\s\S]*?>Payment due</);
  assert.match(html, /\$179\.00/);
  assert.match(html, /Amount due/);
  assert.match(html, /Due August 18, 2026/);
  assert.match(html, /Download invoice/);
  assert.match(html, /href="assets\/billing-documents\/Invoice-NX-2026-0811-1CCEE7\.pdf"[^>]*download="Invoice-NX-2026-0811-1CCEE7\.pdf"/);
  assert.match(html, /data-billing-pay-now[\s\S]*?Pay now/);
  assert.doesNotMatch(html, /Download receipt/);
  assert.doesNotMatch(html, /Receipt number/);
});

test('renders an overdue invoice with an explicit warning', () => {
  const html = createBillingRuntime('?transaction=VMS-20260701-0002').root.innerHTML;

  assert.match(html, /billing-detail-status is-overdue[\s\S]*?>Overdue</);
  assert.match(html, /This invoice is overdue/);
  assert.match(html, /\$199\.00/);
  assert.match(html, /data-billing-pay-now[\s\S]*?Pay now/);
  assert.doesNotMatch(html, /Download receipt/);
});

test('shows a safe not-found state for an unknown transaction', () => {
  const html = createBillingRuntime('?transaction=missing').root.innerHTML;

  assert.match(html, /Billing record not found/);
  assert.match(html, /nexora-packages\.html\?tab=history/);
  assert.doesNotMatch(html, /NXR-20260810-0003/);
});

test('loads responsive Billing Detail styles', () => {
  assert.ok(existsSync(DETAIL_CSS_URL), 'nexora-package-billing-detail.css must exist');
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');

  assert.match(css, /\.billing-detail-page\s*\{/);
  assert.match(css, /\.billing-detail-summary,[\s\S]*?\.billing-detail-document[\s\S]*?\{/);
  assert.match(css, /\.billing-detail-action:focus-visible[\s\S]*?\{/);
  assert.match(css, /@media \(max-width: 640px\)/);
});
