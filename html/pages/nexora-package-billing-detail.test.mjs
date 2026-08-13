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

function createBillingRuntime(search, mutateRecords) {
  assert.ok(existsSync(DETAIL_JS_URL), 'nexora-package-billing-detail.js must exist');
  let activeElement = null;
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
      lucide: { createIcons() {} }
    }
  };

  vm.runInNewContext(readFileSync(BILLING_DATA_URL, 'utf8'), context);
  if (mutateRecords) mutateRecords(context.window.NEXORA_PACKAGE_BILLING_RECORDS);
  vm.runInNewContext(readFileSync(DETAIL_JS_URL, 'utf8'), context);
  return { document, modal, modalChoice, modalClose, modalContinue, modalSummary, payNowTarget, root, shell };
}

function billingRecords() {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(BILLING_DATA_URL, 'utf8'), context);
  return context.window.NEXORA_PACKAGE_BILLING_RECORDS;
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
  assert.match(html, /<a[^>]*href="nexora-packages\.html\?tab=history"[^>]*>[\s\S]*?Back to Billing History/);
  assert.doesNotMatch(html, /Back to Package History/);
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
  assert.match(html, /nexora-packages\.html\?tab=history[^>]*>[\s\S]*?Back to Billing History/);
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
    const brand = words.find((word) => word.text === 'NEXORA' && word.yMin < 70);
    const seller = words.find((word) => word.text === 'Seller');
    const description = words.find((word) => word.text === 'Description');
    const lineItemAmount = words
      .filter((word) => word.text === `$${document.total}.00` && word.yMin > description.yMax && word.yMin < description.yMax + 80)
      .sort((left, right) => right.xMax - left.xMax)[0];

    assert.ok(Number.isFinite(pageWidth), `Page width must be measurable in ${document.path}`);
    assert.ok(title && brand && seller && description && lineItemAmount, `Alignment anchors must exist in ${document.path}`);

    [brand, seller, description].forEach((anchor) => {
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

test('renders four rounded corners on PDF status and amount surfaces', () => {
  const paidRecord = billingRecords().find((record) => record.paymentStatus === 'paid');
  const documentPath = fileURLToPath(new URL(paidRecord.invoiceFile, PAGE_URL));
  const svg = execFileSync('pdftocairo', ['-svg', '-f', '1', '-l', '1', documentPath, '-'], { encoding: 'utf8' });
  const roundedClipPaths = [...new Set(
    [...svg.matchAll(/<path clip-rule="evenodd" d="([^"]+)"/g)].map((match) => match[1])
  )];

  assert.equal(roundedClipPaths.length, 2, 'Status and Amount surfaces must each expose one rounded clip path');
  roundedClipPaths.forEach((path) => {
    assert.ok(
      (path.match(/\bC\b/g) || []).length >= 4,
      'Each rounded surface must curve all four corners'
    );
  });
});

test('keeps the paid status badge compact with centered text', () => {
  const paidRecord = billingRecords().find((record) => record.paymentStatus === 'paid');
  const documentPath = fileURLToPath(new URL(paidRecord.invoiceFile, PAGE_URL));
  const svg = execFileSync('pdftocairo', ['-svg', '-f', '1', '-l', '1', documentPath, '-'], { encoding: 'utf8' });
  const roundedClipPaths = [...new Set(
    [...svg.matchAll(/<path clip-rule="evenodd" d="([^"]+)"/g)].map((match) => match[1])
  )];
  const bounds = roundedClipPaths.map((path) => {
    const points = [...path.matchAll(/([\d.]+)\s+([\d.]+)/g)];
    const xValues = points.map((point) => Number(point[1]));
    return { xMin: Math.min(...xValues), xMax: Math.max(...xValues) };
  });
  const statusBounds = bounds.sort((left, right) => (left.xMax - left.xMin) - (right.xMax - right.xMin))[0];
  const bbox = execFileSync('pdftotext', ['-bbox-layout', documentPath, '-'], { encoding: 'utf8' });
  const paidWord = bbox.match(/<word xMin="([\d.]+)"[^>]*xMax="([\d.]+)"[^>]*>PAID<\/word>/);

  assert.ok(paidWord, 'Paid status text bounding box must exist');
  const badgeWidth = statusBounds.xMax - statusBounds.xMin;
  const badgeCenter = (statusBounds.xMin + statusBounds.xMax) / 2;
  const textCenter = (Number(paidWord[1]) + Number(paidWord[2])) / 2;

  assert.ok(badgeWidth <= 52, 'Paid badge must remain compact');
  assert.ok(Math.abs(badgeCenter - textCenter) <= 1, 'Paid badge text must be centered');
});

test('loads responsive Billing Detail styles', () => {
  assert.ok(existsSync(DETAIL_CSS_URL), 'nexora-package-billing-detail.css must exist');
  const css = readFileSync(DETAIL_CSS_URL, 'utf8');

  assert.match(css, /\.billing-detail-page\s*\{/);
  assert.match(css, /\.billing-detail-summary,[\s\S]*?\.billing-detail-document[\s\S]*?\{/);
  assert.match(css, /\.billing-detail-action:focus-visible[\s\S]*?\{/);
  assert.match(css, /\.billing-payment-modal\s*\{/);
  assert.match(css, /\.billing-payment-dialog\s*\{/);
  assert.match(css, /@media \(max-width: 640px\)/);
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
