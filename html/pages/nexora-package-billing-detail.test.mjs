import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const PAGE_URL = new URL('./nexora-package-billing-detail.html', import.meta.url);
const DETAIL_CSS_URL = new URL('../assets/nexora-package-billing-detail.css', import.meta.url);
const DETAIL_JS_URL = new URL('../assets/nexora-package-billing-detail.js', import.meta.url);
const BILLING_DATA_URL = new URL('../assets/nexora-package-billing-data.js', import.meta.url);
const SHELL_JS_URL = new URL('../assets/nexora-shell.js', import.meta.url);
const PDF_GENERATOR_URL = new URL('../../scripts/generate-nexora-billing-pdfs.py', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-package-billing-detail.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function fakeElement(options = {}) {
  const listeners = {};
  const attributes = new Map();
  const element = {
    dataset: options.dataset || {},
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
    focus() {
      element.focused = true;
      if (options.onFocus) options.onFocus(element);
    },
    querySelector(selector) {
      return options.querySelector ? options.querySelector(selector) : null;
    },
    querySelectorAll(selector) {
      return options.querySelectorAll ? options.querySelectorAll(selector) : [];
    },
    hasAttribute(name) {
      return attributes.has(name);
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    }
  };
  return element;
}

function createBillingRuntime(search, mutateRecords, options = {}) {
  assert.ok(existsSync(DETAIL_JS_URL), 'nexora-package-billing-detail.js must exist');
  let activeElement = null;
  const swalCalls = [];
  const alertCalls = [];
  const root = fakeElement();
  const modalSummary = fakeElement();
  const modalClose = fakeElement({ onFocus: (element) => { activeElement = element; } });
  const modalChoice = fakeElement({ onFocus: (element) => { activeElement = element; } });
  const modalContinue = fakeElement({ onFocus: (element) => { activeElement = element; } });
  const modalFocusables = [modalClose, modalChoice, modalContinue];
  const modal = fakeElement({
    hidden: true,
    querySelector(selector) {
      if (selector === '[data-billing-payment-summary]') return modalSummary;
      if (selector === '[data-billing-payment-close]') return modalClose;
      return null;
    },
    querySelectorAll() {
      return modalFocusables;
    }
  });
  const shell = fakeElement();
  const payNowTarget = fakeElement({
    dataset: { billingPayNow: 'SMS-20260811-0001' },
    onFocus: (element) => { activeElement = element; }
  });
  payNowTarget.closest = (selector) => selector === '[data-billing-pay-now]' ? payNowTarget : null;
  const resendEmailTarget = fakeElement({
    dataset: {
      billingEmailAction: 'resend',
      billingTransaction: 'NXR-20260810-0003'
    }
  });
  const reminderTarget = fakeElement({
    dataset: {
      billingEmailAction: 'reminder',
      billingTransaction: 'SMS-20260811-0001'
    }
  });
  resendEmailTarget.closest = (selector) => selector === '[data-billing-email-action]' ? resendEmailTarget : null;
  reminderTarget.closest = (selector) => selector === '[data-billing-email-action]' ? reminderTarget : null;
  const documentListeners = {};
  const document = {
    body: {
      style: { overflow: '' },
      classList: { add() {}, remove() {} }
    },
    querySelector(selector) {
      if (selector === '[data-billing-detail-root]') return root;
      if (selector === '[data-billing-payment-modal]') return modal;
      if (selector === '.shell') return shell;
      return null;
    },
    addEventListener(type, handler) {
      documentListeners[type] = handler;
    },
    dispatch(type, event = {}) {
      if (documentListeners[type]) documentListeners[type]({ preventDefault() {}, ...event });
    }
  };
  Object.defineProperty(document, 'activeElement', {
    get() {
      return activeElement;
    }
  });
  const context = {
    Date,
    Intl,
    URLSearchParams,
    document,
    window: {
      location: { search },
      lucide: { createIcons() {} },
      alert(message) { alertCalls.push(message); },
      ...(options.withoutSwal ? {} : {
        Swal: { fire(config) { swalCalls.push(config); } }
      })
    }
  };

  vm.runInNewContext(readFileSync(BILLING_DATA_URL, 'utf8'), context);
  if (mutateRecords) mutateRecords(context.window.NEXORA_PACKAGE_BILLING_RECORDS);
  vm.runInNewContext(readFileSync(DETAIL_JS_URL, 'utf8'), context);
  return {
    alertCalls,
    document,
    modal,
    modalChoice,
    modalClose,
    modalContinue,
    modalSummary,
    payNowTarget,
    reminderTarget,
    resendEmailTarget,
    root,
    shell,
    swalCalls
  };
}

function billingRecords() {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(BILLING_DATA_URL, 'utf8'), context);
  return context.window.NEXORA_PACKAGE_BILLING_RECORDS;
}

function cssRule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `CSS rule for "${selector}" must exist`);
  return match[1];
}

function pdfBBoxWords(documentPath) {
  const bbox = execFileSync('pdftotext', ['-bbox-layout', documentPath, '-'], { encoding: 'utf8' });
  return [...bbox.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]+)<\/word>/g)]
    .map((match) => ({
      xMin: Number(match[1]),
      yMin: Number(match[2]),
      xMax: Number(match[3]),
      yMax: Number(match[4]),
      text: match[5]
    }));
}

function pdfSvgImagePlacements(documentPath) {
  const svg = execFileSync('pdftocairo', ['-svg', '-f', '1', '-l', '1', documentPath, '-'], { encoding: 'utf8' });
  const placements = [...svg.matchAll(/<use xlink:href="#source-\d+"[^>]*transform="matrix\(([-\d.]+),\s*0,\s*0,\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)"/g)]
    .map((match) => {
      const scaleX = Math.abs(Number(match[1]));
      const scaleY = Math.abs(Number(match[2]));
      const x = Number(match[3]);
      const y = Number(match[4]);
      return {
        x,
        y,
        width: 256 * scaleX,
        height: 256 * scaleY
      };
    });

  return [...new Map(placements.map((placement) => [
    `${placement.x.toFixed(3)}:${placement.y.toFixed(3)}:${placement.width.toFixed(3)}:${placement.height.toFixed(3)}`,
    placement
  ])).values()];
}

function pdfTextFillColors(documentPath) {
  const svg = execFileSync('pdftocairo', ['-svg', '-f', '1', '-l', '1', documentPath, '-'], { encoding: 'utf8' });
  return [...new Set(
    [...svg.matchAll(/<g fill="rgb\(([^"]+)\)" fill-opacity="1">/g)]
      .map((match) => match[1])
  )];
}

test('creates Billing Detail from the Salon shared-shell skeleton', () => {
  const html = source();

  assert.match(html, /<html lang="en-US">/);
  assert.match(html, /<title>NEXORA TOUCH - Billing Details<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar" aria-label="Dashboard sidebar"><\/aside>/);
  assert.match(html, /<div class="app-area">/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Billing details content">/);
  assert.match(html, /<a[^>]*href="nexora-packages\.html\?tab=history"[^>]*>[\s\S]*?Back to Package History/);
  assert.doesNotMatch(html, /Back to Billing History/);
  assert.match(html, /data-billing-detail-root/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-package-billing-detail\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-package-billing-data\.js"><\/script>\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/sweetalert2@11"><\/script>\s*<script src="\.\.\/assets\/nexora-package-billing-detail\.js"><\/script>/);
  assert.match(html, /activePage:\s*'packages'/);
  assert.match(html, /activeTab:\s*'history'/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
});

test('renders a paid billing record with invoice and receipt downloads', () => {
  const html = createBillingRuntime('?transaction=NXR-20260810-0003').root.innerHTML;

  assert.match(html, /Receipt from NEXORA TOUCH/);
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
  assert.match(html, /Transaction ID[\s\S]*?NXR-20260810-0003/);
  assert.match(html, /Processor transaction ID[\s\S]*?pi_3NX_023749/);
  assert.match(html, /Professional Pro/);
  assert.match(html, /Tax \(0%\)/);
  assert.match(html, /Amount paid[\s\S]*?\$79\.00/);
  assert.match(html, /data-billing-email-action="resend"/);
  assert.match(html, /data-billing-transaction="NXR-20260810-0003"/);
  assert.match(html, />Resend email</);
  assert.doesNotMatch(html, /data-billing-email-action="reminder"|>Send reminder</);
  assert.doesNotMatch(html, /data-billing-pay-now/);
});

test('explains when an expected billing document is not available', () => {
  const html = createBillingRuntime('?transaction=NXR-20260810-0003', (records) => {
    records[0].invoiceFile = null;
    records[0].receiptFile = null;
  }).root.innerHTML;

  assert.match(html, /aria-disabled="true"[\s\S]*?Download invoice/);
  assert.match(html, /aria-disabled="true"[\s\S]*?Download receipt/);
  assert.match(html, /Document is not available yet/);
  assert.doesNotMatch(html, /href=""/);
});

test('renders a payment-due invoice without a receipt download', () => {
  const html = createBillingRuntime('?transaction=SMS-20260811-0001').root.innerHTML;

  assert.match(html, /Invoice from NEXORA TOUCH/);
  assert.match(html, /billing-detail-status is-payment-due[\s\S]*?>Payment due</);
  assert.match(html, /\$179\.00/);
  assert.match(html, /Amount due/);
  assert.match(html, /Due August 18, 2026/);
  assert.match(html, /Download invoice/);
  assert.match(html, /href="assets\/billing-documents\/Invoice-NX-2026-0811-1CCEE7\.pdf"[^>]*download="Invoice-NX-2026-0811-1CCEE7\.pdf"/);
  assert.match(html, /data-billing-email-action="reminder"/);
  assert.match(html, /data-billing-transaction="SMS-20260811-0001"/);
  assert.match(html, />Send reminder</);
  assert.doesNotMatch(html, /data-billing-email-action="resend"|>Resend email</);
  assert.match(html, /data-billing-pay-now[\s\S]*?Pay now/);
  assert.doesNotMatch(html, /Download receipt/);
  assert.doesNotMatch(html, /Receipt number/);
});

test('omits the duplicate summary header from billing summary cards', () => {
  const paidHTML = createBillingRuntime('?transaction=NXR-20260810-0003').root.innerHTML;
  const unpaidHTML = createBillingRuntime('?transaction=SMS-20260811-0001').root.innerHTML;
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');

  assert.doesNotMatch(`${paidHTML}\n${unpaidHTML}`, /billing-detail-summary-head/);
  assert.doesNotMatch(`${paidHTML}\n${unpaidHTML}`, /billing-detail-brand/);
  assert.doesNotMatch(css, /\.billing-detail-summary-head\b/);
  assert.doesNotMatch(css, /\.billing-detail-brand\b/);
});

test('keeps billing summary main flush after removing the summary header', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const summaryMainRules = [...css.matchAll(/\.billing-detail-summary-main\s*\{([^}]*)\}/g)]
    .map((match) => match[1]);

  assert.ok(summaryMainRules.length > 0, 'billing summary main styles must exist');
  summaryMainRules.forEach((rule) => {
    assert.doesNotMatch(rule, /margin-top:/);
  });
});

test('omits billing periods for Voice Credit in detail and PDF views', () => {
  const html = createBillingRuntime('?transaction=SMS-20260811-0001').root.innerHTML;
  const record = billingRecords().find((item) => item.transactionId === 'SMS-20260811-0001');
  const invoiceText = execFileSync('pdftotext', [fileURLToPath(new URL(record.invoiceFile, PAGE_URL)), '-'], { encoding: 'utf8' });

  assert.match(html, /<td data-label="Description"><strong>Voice Credit<\/strong><\/td>/);
  assert.doesNotMatch(html, /<strong>Voice Credit<\/strong><span>\s*<\/span>/);
  assert.doesNotMatch(html, /Voice Credit[\s\S]*?Aug 11-Sep 11, 2026/);
  assert.doesNotMatch(invoiceText, /Voice Credit[\s\S]*?Aug 11-Sep 11, 2026/);
});

test('renders an overdue invoice with an explicit warning', () => {
  const html = createBillingRuntime('?transaction=VMS-20260701-0002').root.innerHTML;

  assert.match(html, /billing-detail-status is-overdue[\s\S]*?>Overdue</);
  assert.match(html, /This invoice is overdue/);
  assert.match(html, /\$199\.00/);
  assert.match(html, /data-billing-email-action="reminder"/);
  assert.match(html, /data-billing-transaction="VMS-20260701-0002"/);
  assert.match(html, />Send reminder</);
  assert.doesNotMatch(html, /data-billing-email-action="resend"|>Resend email</);
  assert.match(html, /data-billing-pay-now[\s\S]*?Pay now/);
  assert.doesNotMatch(html, /Download receipt/);
});

test('shows a safe not-found state for an unknown transaction', () => {
  const html = createBillingRuntime('?transaction=missing').root.innerHTML;

  assert.match(html, /Billing record not found/);
  assert.match(html, /nexora-packages\.html\?tab=history[^>]*>[\s\S]*?Back to Package History/);
  assert.doesNotMatch(html, /NXR-20260810-0003/);
});

test('provides an accessible demo payment UI for unpaid invoices', () => {
  const html = source();

  assert.match(html, /data-billing-payment-modal hidden aria-hidden="true"/);
  assert.match(html, /role="dialog" aria-modal="true"/);
  assert.match(html, /id="billing-payment-title"[^>]*>Pay invoice</);
  assert.match(html, /data-billing-payment-summary/);
  assert.match(html, /NEXORA TOUCH secure billing/);
  assert.match(html, /Demo only - payment processing is not connected\./);
  assert.match(html, /data-billing-payment-close/);
});

test('opens and closes the Pay now demo payment UI', () => {
  const runtime = createBillingRuntime('?transaction=SMS-20260811-0001');

  runtime.root.dispatch('click', { target: runtime.payNowTarget });
  assert.equal(runtime.modal.hidden, false);
  assert.match(runtime.modalSummary.innerHTML, /Voice Credit/);
  assert.match(runtime.modalSummary.innerHTML, /NX-2026-0811-1CCEE7/);
  assert.match(runtime.modalSummary.innerHTML, /\$179\.00/);
  assert.equal(runtime.modalClose.focused, true);
  assert.equal(runtime.shell.hasAttribute('inert'), true);

  let tabWasPrevented = false;
  runtime.document.dispatch('keydown', {
    key: 'Tab',
    shiftKey: true,
    preventDefault() { tabWasPrevented = true; }
  });
  assert.equal(tabWasPrevented, true);
  assert.equal(runtime.modalContinue.focused, true);

  tabWasPrevented = false;
  runtime.document.dispatch('keydown', {
    key: 'Tab',
    shiftKey: false,
    preventDefault() { tabWasPrevented = true; }
  });
  assert.equal(tabWasPrevented, true);
  assert.equal(runtime.modalClose.focused, true);

  runtime.document.dispatch('keydown', { key: 'Escape' });
  assert.equal(runtime.modal.hidden, true);
  assert.equal(runtime.payNowTarget.focused, true);
  assert.equal(runtime.shell.hasAttribute('inert'), false);
});

test('confirms a paid billing email resend with SweetAlert', () => {
  const runtime = createBillingRuntime('?transaction=NXR-20260810-0003');

  runtime.root.dispatch('click', { target: runtime.resendEmailTarget });

  assert.equal(runtime.swalCalls.length, 1);
  assert.equal(runtime.swalCalls[0].icon, 'success');
  assert.equal(runtime.swalCalls[0].title, 'Email resent successfully');
  assert.equal(runtime.swalCalls[0].text, 'Billing documents were sent to billing@bitcoinnailbar.com.');
  assert.equal(runtime.swalCalls[0].confirmButtonText, 'Done');
  assert.deepEqual(runtime.alertCalls, []);
});

test('confirms an unpaid payment reminder with SweetAlert', () => {
  const runtime = createBillingRuntime('?transaction=SMS-20260811-0001');

  runtime.root.dispatch('click', { target: runtime.reminderTarget });

  assert.equal(runtime.swalCalls.length, 1);
  assert.equal(runtime.swalCalls[0].icon, 'success');
  assert.equal(runtime.swalCalls[0].title, 'Payment reminder sent successfully');
  assert.equal(runtime.swalCalls[0].text, 'A payment reminder was sent to billing@bitcoinnailbar.com.');
  assert.equal(runtime.swalCalls[0].confirmButtonText, 'Done');
  assert.deepEqual(runtime.alertCalls, []);
});

test('falls back to native alert when SweetAlert is unavailable', () => {
  const runtime = createBillingRuntime('?transaction=NXR-20260810-0003', null, { withoutSwal: true });

  runtime.root.dispatch('click', { target: runtime.resendEmailTarget });

  assert.deepEqual(runtime.swalCalls, []);
  assert.deepEqual(runtime.alertCalls, [
    'Email resent successfully\nBilling documents were sent to billing@bitcoinnailbar.com.'
  ]);
});

test('uses uppercase NEXORA TOUCH across billing surfaces and generated documents', () => {
  assert.ok(existsSync(SHELL_JS_URL), 'nexora-shell.js must exist');
  const shellRuntime = readFileSync(SHELL_JS_URL, 'utf8');
  assert.match(shellRuntime, /<div class="profile-name">NEXORA TOUCH<\/div>/);
  assert.doesNotMatch(shellRuntime, /<div class="profile-name">Nexora Touch<\/div>/);

  const paidHTML = createBillingRuntime('?transaction=NXR-20260810-0003').root.innerHTML;
  const unpaidHTML = createBillingRuntime('?transaction=SMS-20260811-0001').root.innerHTML;
  assert.match(paidHTML, /Receipt from NEXORA TOUCH/);
  assert.match(unpaidHTML, /Invoice from NEXORA TOUCH/);
  assert.doesNotMatch(`${paidHTML}\n${unpaidHTML}`, /NEXORA Touch|Nexora Touch/);

  billingRecords().forEach((record) => {
    assert.equal(record.seller.name, 'NEXORA TOUCH');
    assert.equal(record.seller.legalName, 'NEXORA TOUCH, LLC');

    const invoicePath = fileURLToPath(new URL(record.invoiceFile, PAGE_URL));
    const invoiceInfo = execFileSync('pdfinfo', [invoicePath], { encoding: 'utf8' });
    const invoiceText = execFileSync('pdftotext', [invoicePath, '-'], { encoding: 'utf8' });
    assert.match(invoiceInfo, /Author:\s+NEXORA TOUCH/);
    assert.doesNotMatch(invoiceInfo, /NEXORA Touch|Nexora Touch/);
    assert.match(invoiceText, /NEXORA TOUCH/);
    assert.doesNotMatch(invoiceText, /NEXORA Touch|Nexora Touch/);

    if (record.receiptFile) {
      const receiptPath = fileURLToPath(new URL(record.receiptFile, PAGE_URL));
      const receiptInfo = execFileSync('pdfinfo', [receiptPath], { encoding: 'utf8' });
      const receiptText = execFileSync('pdftotext', [receiptPath, '-'], { encoding: 'utf8' });
      assert.match(receiptInfo, /Author:\s+NEXORA TOUCH/);
      assert.doesNotMatch(receiptInfo, /NEXORA Touch|Nexora Touch/);
      assert.match(receiptText, /NEXORA TOUCH/);
      assert.doesNotMatch(receiptText, /NEXORA Touch|Nexora Touch/);
    }
  });
});

test('provides real PDF download documents that match billing records', () => {
  assert.ok(existsSync(PDF_GENERATOR_URL), 'NEXORA billing PDF generator must exist');

  billingRecords().forEach((record) => {
    const invoiceURL = new URL(record.invoiceFile, PAGE_URL);
    assert.ok(existsSync(invoiceURL), `Invoice PDF must exist for ${record.transactionId}`);
    assert.equal(readFileSync(invoiceURL).subarray(0, 5).toString(), '%PDF-');
    const invoiceInfo = execFileSync('pdfinfo', [fileURLToPath(invoiceURL)], { encoding: 'utf8' });
    assert.match(invoiceInfo, /Page size:\s+595\.276 x 841\.89 pts \(A4\)/);
    const invoiceText = execFileSync('pdftotext', [fileURLToPath(invoiceURL), '-'], { encoding: 'utf8' });
    assert.match(invoiceText, /NEXORA TOUCH/);
    assert.match(invoiceText, new RegExp(record.seller.legalName));
    assert.match(invoiceText, new RegExp(record.seller.addressLines[0]));
    assert.match(invoiceText, new RegExp(record.billTo.addressLines[0]));
    assert.match(invoiceText, new RegExp(record.invoiceNumber));
    record.lineItems.forEach((item) => {
      assert.match(invoiceText, new RegExp(item.description));
    });
    assert.match(invoiceText, new RegExp(`\\$${record.total}\\.00`));
    assert.match(invoiceText, /Amount due/);

    if (record.paymentStatus === 'paid') {
      const receiptURL = new URL(record.receiptFile, PAGE_URL);
      assert.ok(existsSync(receiptURL), `Receipt PDF must exist for ${record.transactionId}`);
      assert.equal(readFileSync(receiptURL).subarray(0, 5).toString(), '%PDF-');
      const receiptInfo = execFileSync('pdfinfo', [fileURLToPath(receiptURL)], { encoding: 'utf8' });
      assert.match(receiptInfo, /Page size:\s+595\.276 x 841\.89 pts \(A4\)/);
      const receiptText = execFileSync('pdftotext', [fileURLToPath(receiptURL), '-'], { encoding: 'utf8' });
      assert.match(receiptText, /NEXORA TOUCH/);
      assert.match(receiptText, new RegExp(record.receiptNumber));
      assert.match(receiptText, new RegExp(record.invoiceNumber));
      assert.match(receiptText, /Visa - 4242/);
      assert.match(receiptText, /Amount paid/);
      assert.match(receiptText, new RegExp(`\\$${record.total}\\.00`));
      return;
    }

    assert.equal(record.receiptFile, null);
  });
});

test('keeps PDF Invoice and Receipt titles modest for printed documents', () => {
  const documents = billingRecords().flatMap((record) => [
    { path: record.invoiceFile, title: 'Invoice' },
    ...(record.receiptFile ? [{ path: record.receiptFile, title: 'Receipt' }] : [])
  ]);

  documents.forEach((document) => {
    const documentPath = fileURLToPath(new URL(document.path, PAGE_URL));
    const titleWord = pdfBBoxWords(documentPath)
      .filter((word) => word.text === document.title && word.yMin < 110)
      .sort((left, right) => left.yMin - right.yMin)[0];

    assert.ok(titleWord, `${document.title} title must exist in ${document.path}`);
    assert.ok(
      titleWord.yMax - titleWord.yMin <= 17.5,
      `${document.title} title must stay compact in ${document.path}`
    );
  });
});

test('prints PDF headers with document title and logo instead of brand text or status', () => {
  const documents = billingRecords().flatMap((record) => [
    { path: record.invoiceFile, title: 'Invoice' },
    ...(record.receiptFile ? [{ path: record.receiptFile, title: 'Receipt' }] : [])
  ]);
  const statusWords = new Set(['PAID', 'PAYMENT', 'DUE', 'OVERDUE']);

  documents.forEach((document) => {
    const documentPath = fileURLToPath(new URL(document.path, PAGE_URL));
    const words = pdfBBoxWords(documentPath);
    const title = words
      .filter((word) => word.text === document.title && word.yMin < 90)
      .sort((left, right) => left.yMin - right.yMin)[0];
    const headerWords = words.filter((word) => word.yMin < 95).map((word) => word.text);
    const logo = pdfSvgImagePlacements(documentPath)
      .filter((placement) => placement.x > 470 && placement.y < 90)
      .sort((left, right) => right.x - left.x)[0];

    assert.ok(title, `${document.title} title must be the first text in ${document.path}`);
    assert.ok(logo, `NEXORA logo must print in the right side of the ${document.title} header`);
    assert.ok(logo.x > title.xMax, `NEXORA logo must sit to the right of ${document.title} in ${document.path}`);
    assert.ok(
      Math.abs((logo.y + logo.height / 2) - ((title.yMin + title.yMax) / 2)) <= 18,
      `NEXORA logo must align vertically with ${document.title} in ${document.path}`
    );
    assert.equal(headerWords.includes('NEXORA'), false, `Text brand must not print in the ${document.title} header`);
    assert.equal(headerWords.includes('TOUCH'), false, `Text brand must not print in the ${document.title} header`);
    assert.equal(headerWords.some((word) => statusWords.has(word)), false, `Status must not print in the ${document.title} header`);
  });
});

test('keeps PDF amount labels visually separated from headline totals', () => {
  billingRecords().forEach((record) => {
    const documentPath = fileURLToPath(new URL(record.invoiceFile, PAGE_URL));
    const bbox = execFileSync('pdftotext', ['-bbox-layout', documentPath, '-'], { encoding: 'utf8' });
    const label = bbox.match(/<word[^>]*yMax="([\d.]+)"[^>]*>Amount<\/word>\s*<word[^>]*>(?:due|paid)<\/word>/);
    const amount = bbox.match(new RegExp(`<word[^>]*yMin="([\\d.]+)"[^>]*>\\$${record.total}\\.00<\\/word>`));

    assert.ok(label, `Headline amount label bounding box must exist in ${record.invoiceNumber}`);
    assert.ok(amount, `Headline total bounding box must exist in ${record.invoiceNumber}`);
    assert.ok(
      Number(amount[1]) >= Number(label[1]) + 2,
      `Headline total must not overlap its label in ${record.invoiceNumber}`
    );
  });
});

test('aligns PDF content to equal left and right page margins', () => {
  const documents = billingRecords().flatMap((record) => [
    { path: record.invoiceFile, title: 'Invoice', total: record.total },
    ...(record.receiptFile ? [{ path: record.receiptFile, title: 'Receipt', total: record.total }] : [])
  ]);

  documents.forEach((document) => {
    const documentPath = fileURLToPath(new URL(document.path, PAGE_URL));
    const bbox = execFileSync('pdftotext', ['-bbox-layout', documentPath, '-'], { encoding: 'utf8' });
    const pageWidth = Number(bbox.match(/<page width="([\d.]+)"/)?.[1]);
    const words = [...bbox.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]+)<\/word>/g)]
      .map((match) => ({
        xMin: Number(match[1]),
        yMin: Number(match[2]),
        xMax: Number(match[3]),
        yMax: Number(match[4]),
        text: match[5]
      }));
    const title = words.find((word) => word.text === document.title && word.yMin < 120);
    const seller = words.find((word) => word.text === 'Seller');
    const description = words.find((word) => word.text === 'Description');
    const lineItemAmount = words
      .filter((word) => word.text === `$${document.total}.00` && word.yMin > description.yMax && word.yMin < description.yMax + 80)
      .sort((left, right) => right.xMax - left.xMax)[0];

    assert.ok(Number.isFinite(pageWidth), `Page width must be measurable in ${document.path}`);
    assert.ok(title && seller && description && lineItemAmount, `Alignment anchors must exist in ${document.path}`);

    [seller, description].forEach((anchor) => {
      assert.ok(
        Math.abs(anchor.xMin - title.xMin) <= 0.75,
        `${anchor.text} must share the left content guide in ${document.path}`
      );
    });
    assert.ok(
      Math.abs(title.xMin - (pageWidth - lineItemAmount.xMax)) <= 0.75,
      `Left and right content margins must match in ${document.path}`
    );
  });
});

test('renders four rounded corners on the PDF amount surface', () => {
  const paidRecord = billingRecords().find((record) => record.paymentStatus === 'paid');
  const documentPath = fileURLToPath(new URL(paidRecord.invoiceFile, PAGE_URL));
  const svg = execFileSync('pdftocairo', ['-svg', '-f', '1', '-l', '1', documentPath, '-'], { encoding: 'utf8' });
  const roundedClipPaths = [...new Set(
    [...svg.matchAll(/<path clip-rule="evenodd" d="([^"]+)"/g)].map((match) => match[1])
  )];

  assert.equal(roundedClipPaths.length, 1, 'Amount surface must expose one rounded clip path');
  roundedClipPaths.forEach((path) => {
    assert.ok(
      (path.match(/\bC\b/g) || []).length >= 4,
      'Amount surface must curve all four corners'
    );
  });
});

test('omits PDF status badges from printed document headers', () => {
  const documents = billingRecords().flatMap((record) => [
    record.invoiceFile,
    ...(record.receiptFile ? [record.receiptFile] : [])
  ]);

  documents.forEach((path) => {
    const documentPath = fileURLToPath(new URL(path, PAGE_URL));
    const headerWords = pdfBBoxWords(documentPath)
      .filter((word) => word.yMin < 95)
      .map((word) => word.text);

    assert.equal(headerWords.includes('PAID'), false, `Paid status must not print in ${path}`);
    assert.equal(headerWords.includes('PAYMENT'), false, `Payment due status must not print in ${path}`);
    assert.equal(headerWords.includes('DUE'), false, `Payment due status must not print in ${path}`);
    assert.equal(headerWords.includes('OVERDUE'), false, `Overdue status must not print in ${path}`);
  });
});

test('loads responsive Billing Detail styles', () => {
  assert.ok(existsSync(DETAIL_CSS_URL), 'nexora-package-billing-detail.css must exist');
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const documentIconRule = css.match(/\.billing-detail-document-icon svg\s*\{([\s\S]*?)\}/)?.[1] || '';

  assert.match(css, /\.billing-detail-page\s*\{/);
  assert.match(css, /\.billing-detail-summary,[\s\S]*?\.billing-detail-document[\s\S]*?\{/);
  assert.match(css, /\.billing-detail-action:focus-visible[\s\S]*?\{/);
  assert.match(css, /\.billing-payment-modal\s*\{/);
  assert.match(css, /\.billing-payment-dialog\s*\{/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(documentIconRule, /stroke-width:\s*1\.25;/);
});

test('keeps the billing summary amount compact on screen without changing print typography', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const summaryAmountRule = /\.billing-detail-summary-main h2\s*\{([^}]*)\}/.exec(css)?.[1] || '';
  const mobileRules = css.slice(css.indexOf('@media (max-width: 640px)'), css.indexOf('@page'));
  const mobileSummaryAmountRule = /\.billing-detail-summary-main h2\s*\{([^}]*)\}/.exec(mobileRules)?.[1] || '';
  const printRules = css.slice(css.indexOf('@media print'));
  const printSummaryAmountRule = /\.billing-detail-summary-main h2\s*\{([^}]*)\}/.exec(printRules)?.[1] || '';

  assert.match(summaryAmountRule, /font-size:\s*clamp\(28px,\s*4vw,\s*38px\)/);
  assert.match(summaryAmountRule, /font-weight:\s*600/);
  assert.match(mobileSummaryAmountRule, /font-size:\s*28px/);
  assert.match(printSummaryAmountRule, /font-size:\s*30pt/);
});

test('keeps screen typography calm with only regular and semibold weights', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const screenRules = css.slice(0, css.indexOf('@page'));
  const invalidWeights = [...screenRules.matchAll(/font-weight:\s*(\d+)/g)]
    .map((match) => Number(match[1]))
    .filter((weight) => ![400, 600].includes(weight));

  assert.deepEqual(invalidWeights, []);
});

test('keeps billing detail meta labels readable without uppercase transform', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const metaLabelRule = cssRule(css, '.billing-detail-meta dt');

  assert.match(metaLabelRule, /text-transform:\s*none;/);
  assert.match(metaLabelRule, /letter-spacing:\s*0;/);
});

test('keeps printed billing labels and document titles compact with calm weights', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const printRules = css.slice(css.indexOf('@media print'));
  const eyebrowRule = cssRule(printRules, '.billing-detail-eyebrow');
  const documentTitleRule = cssRule(printRules, '.billing-detail-document-head h2');
  const invalidWeights = [...css.matchAll(/font-weight:\s*(\d+)/g)]
    .map((match) => Number(match[1]))
    .filter((weight) => ![400, 600].includes(weight));

  assert.match(eyebrowRule, /font-size:\s*9pt/);
  assert.match(eyebrowRule, /font-weight:\s*400/);
  assert.match(documentTitleRule, /font-size:\s*13pt/);
  assert.match(documentTitleRule, /font-weight:\s*600/);
  assert.deepEqual(invalidWeights, []);
});

test('prints billing detail text in black instead of muted screen colors', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const printRules = css.slice(css.indexOf('@media print'));
  const printTextColorRule = /\.billing-detail-summary,[\s\S]*?\.billing-detail-summary \*,[\s\S]*?\.billing-detail-document,[\s\S]*?\.billing-detail-document \*,[\s\S]*?\.billing-detail-empty,[\s\S]*?\.billing-detail-empty \*\s*\{([\s\S]*?)\}/.exec(printRules)?.[1] || '';
  const disallowedMutedPrintColors = /color:\s*(?:var\(--nexora-(?:muted|subtle|text)\)|#(?:0b1f42|64748b|94a3b8))\b/i;

  assert.match(printTextColorRule, /color:\s*#000\s*!important;/);
  assert.equal(disallowedMutedPrintColors.test(printRules), false);
});

test('generates PDF billing text in black instead of gray or navy', () => {
  const documents = billingRecords().flatMap((record) => [
    record.invoiceFile,
    ...(record.receiptFile ? [record.receiptFile] : [])
  ]);

  documents.forEach((path) => {
    const documentPath = fileURLToPath(new URL(path, PAGE_URL));
    assert.deepEqual(pdfTextFillColors(documentPath), ['0%, 0%, 0%'], `${path} text must render in black`);
  });
});

test('prints browser billing headers with document label and NEXORA logo instead of status', () => {
  const paidHTML = createBillingRuntime('?transaction=NXR-20260810-0003').root.innerHTML;
  const unpaidHTML = createBillingRuntime('?transaction=SMS-20260811-0001').root.innerHTML;
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const printRules = css.slice(css.indexOf('@media print'));

  assert.match(paidHTML, /billing-detail-print-document-label">Receipt<\/span>/);
  assert.match(unpaidHTML, /billing-detail-print-document-label">Invoice<\/span>/);
  assert.match(paidHTML, /class="billing-detail-print-logo"[^>]*src="https:\/\/nexoratouch\.com\/homepage\/assets\/images\/icon-nexora\.png"[^>]*alt="NEXORA TOUCH logo"/);
  assert.match(unpaidHTML, /class="billing-detail-print-logo"[^>]*src="https:\/\/nexoratouch\.com\/homepage\/assets\/images\/icon-nexora\.png"[^>]*alt="NEXORA TOUCH logo"/);
  assert.match(cssRule(css, '.billing-detail-print-logo'), /display:\s*none;/);
  assert.match(cssRule(printRules, '.billing-detail-screen-document-label'), /display:\s*none;/);
  assert.match(cssRule(printRules, '.billing-detail-print-document-label'), /display:\s*inline;/);
  assert.match(cssRule(printRules, '.billing-detail-print-logo'), /display:\s*block;/);
  assert.match(cssRule(printRules, '.billing-detail-document-icon'), /display:\s*none;/);
  assert.match(cssRule(printRules, '.billing-detail-status'), /display:\s*none\s*!important;/);
});

test('keeps billing detail buttons compact on screen', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const actionRule = /\.billing-detail-action\s*\{([^}]*)\}/.exec(css)?.[1] || '';
  const paymentButtonRule = /\.billing-payment-secondary,\s*\.billing-payment-primary\s*\{([^}]*)\}/.exec(css)?.[1] || '';

  assert.match(actionRule, /min-height:\s*38px/);
  assert.match(actionRule, /padding:\s*7px 12px/);
  assert.match(paymentButtonRule, /min-height:\s*38px/);
  assert.match(paymentButtonRule, /padding:\s*7px 12px/);
});

test('keeps billing detail actions auto width on desktop and fitted to one row on mobile', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const mobileRules = css.slice(css.indexOf('@media (max-width: 640px)'), css.indexOf('@page'));
  const actionsRule = cssRule(css, '.billing-detail-actions');
  const actionRule = cssRule(css, '.billing-detail-action');
  const actionGroupRule = cssRule(css, '.billing-detail-action-group');
  const mobileActionsRule = cssRule(mobileRules, '.billing-detail-actions');
  const mobileActionRule = cssRule(mobileRules, '.billing-detail-action');
  const mobileActionGroupRule = cssRule(mobileRules, '.billing-detail-action-group');

  assert.match(actionsRule, /display:\s*flex;/);
  assert.match(actionsRule, /flex-wrap:\s*nowrap;/);
  assert.match(actionsRule, /width:\s*fit-content;/);
  assert.match(actionsRule, /max-width:\s*100%;/);
  assert.match(actionRule, /flex:\s*0 0 auto;/);
  assert.match(actionGroupRule, /flex:\s*0 0 auto;/);
  assert.match(mobileActionsRule, /display:\s*flex;/);
  assert.match(mobileActionsRule, /width:\s*100%;/);
  assert.match(mobileActionsRule, /gap:\s*6px;/);
  assert.match(mobileActionRule, /flex:\s*1 1 0;/);
  assert.match(mobileActionRule, /min-width:\s*0;/);
  assert.match(mobileActionRule, /min-height:\s*34px;/);
  assert.match(mobileActionRule, /padding:\s*6px 7px;/);
  assert.match(mobileActionRule, /font-size:\s*10px;/);
  assert.match(mobileActionGroupRule, /flex:\s*1 1 0;/);
  assert.match(mobileActionGroupRule, /min-width:\s*0;/);
});

test('keeps mobile billing detail meta labels and values on one row', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const mobileRules = css.slice(css.indexOf('@media (max-width: 640px)'), css.indexOf('@page'));
  const mobileMetaRule = cssRule(mobileRules, '.billing-detail-meta');
  const mobileMetaItemRule = cssRule(mobileRules, '.billing-detail-meta div');
  const mobileMetaValueRule = cssRule(mobileRules, '.billing-detail-meta dd');

  assert.match(mobileMetaRule, /gap:\s*10px;/);
  assert.match(mobileMetaItemRule, /display:\s*flex;/);
  assert.match(mobileMetaItemRule, /align-items:\s*baseline;/);
  assert.match(mobileMetaItemRule, /justify-content:\s*space-between;/);
  assert.match(mobileMetaItemRule, /gap:\s*8px;/);
  assert.match(mobileMetaValueRule, /margin:\s*0;/);
  assert.match(mobileMetaValueRule, /text-align:\s*right;/);
});

test('keeps mobile line item dates underneath descriptions without narrow wrapping', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const mobileStart = css.indexOf('@media (max-width: 640px)');
  const mobileEnd = css.indexOf('@page', mobileStart);
  const mobileRules = css.slice(mobileStart, mobileEnd);
  const descriptionRule = mobileRules.match(/\.billing-detail-table td\[data-label="Description"\],[\s\S]*?\.billing-detail-table td\[data-label="Description"\]:first-child\s*\{([\s\S]*?)\}/)?.[1] || '';
  const descriptionChildrenRule = mobileRules.match(/\.billing-detail-table td\[data-label="Description"\]::before,[\s\S]*?\.billing-detail-table td\[data-label="Description"\] span\s*\{([\s\S]*?)\}/)?.[1] || '';
  const descriptionPeriodRule = [...mobileRules.matchAll(/\.billing-detail-table td\[data-label="Description"\] span\s*\{([\s\S]*?)\}/g)]
    .map((match) => match[1])
    .find((rule) => /white-space:\s*nowrap;/.test(rule)) || '';

  assert.match(descriptionRule, /grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(descriptionRule, /text-align:\s*left;/);
  assert.match(descriptionChildrenRule, /grid-column:\s*1;/);
  assert.match(descriptionPeriodRule, /white-space:\s*nowrap;/);
});

test('keeps printed numeric column headers aligned with their values', () => {
  const html = createBillingRuntime('?transaction=NXR-20260810-0003').root.innerHTML;
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const printRules = css.slice(css.indexOf('@media print'));
  const numberCellRule = /\.billing-detail-table-number\s*\{([^}]*)\}/.exec(printRules)?.[1] || '';

  assert.match(html, /<colgroup>[\s\S]*?billing-detail-col-description[\s\S]*?billing-detail-col-qty[\s\S]*?billing-detail-col-unit[\s\S]*?billing-detail-col-amount[\s\S]*?<\/colgroup>/);
  assert.match(html, /<th scope="col" class="billing-detail-table-number">Qty<\/th>/);
  assert.match(html, /<th scope="col" class="billing-detail-table-number">Unit price<\/th>/);
  assert.match(html, /<th scope="col" class="billing-detail-table-number">Amount<\/th>/);
  assert.match(html, /<td class="billing-detail-table-number" data-label="Qty">1<\/td>/);
  assert.match(html, /<td class="billing-detail-table-number" data-label="Unit price">\$79\.00<\/td>/);
  assert.match(html, /<td class="billing-detail-table-number" data-label="Amount"><strong>\$79\.00<\/strong><\/td>/);
  assert.match(printRules, /\.billing-detail-col-description\s*\{[\s\S]*?width:\s*52%;/);
  assert.match(printRules, /\.billing-detail-col-qty\s*\{[\s\S]*?width:\s*10%;/);
  assert.match(printRules, /\.billing-detail-col-unit,[\s\S]*?\.billing-detail-col-amount\s*\{[\s\S]*?width:\s*19%;/);
  assert.match(numberCellRule, /text-align:\s*right;/);
  assert.match(numberCellRule, /font-variant-numeric:\s*tabular-nums;/);
});

test('prints Billing Detail on A4 without app chrome or split billing rows', () => {
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');
  const printRules = css.slice(css.indexOf('@media print'));

  assert.match(css, /@page\s*\{[\s\S]*?size:\s*A4 portrait;[\s\S]*?margin:\s*12mm;/);
  assert.match(printRules, /\.sidebar,[\s\S]*?\.header,[\s\S]*?\.billing-detail-back,[\s\S]*?\.billing-detail-actions,[\s\S]*?\.billing-payment-modal[\s\S]*?display:\s*none\s*!important;/);
  assert.match(printRules, /\.app-area\s*\{[\s\S]*?padding-left:\s*0\s*!important;/);
  assert.match(printRules, /\.content\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?padding:\s*0;/);
  assert.match(printRules, /\.shell,\s*\.app-area,\s*\.content,\s*\.billing-detail-page\s*\{[^}]*background:\s*#fff\s*!important;/);
  assert.match(printRules, /\.billing-detail-table\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?table-layout:\s*fixed;/);
  assert.match(printRules, /\.billing-detail-table tr,[\s\S]*?\.billing-detail-totals div[\s\S]*?break-inside:\s*avoid;/);
  assert.match(printRules, /\.billing-detail-summary,[\s\S]*?\.billing-detail-document[\s\S]*?box-shadow:\s*none;/);
});
