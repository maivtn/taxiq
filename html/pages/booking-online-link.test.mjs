import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const RUNTIME_URL = new URL('../assets/booking-online-link.js', import.meta.url);
const BOOKING_BOOK_URL = new URL('./booking-book-phase-1.html', import.meta.url);

function loadRuntime(overrides = {}) {
  assert.ok(existsSync(RUNTIME_URL), 'booking-online-link.js must exist');
  const browserWindow = {
    document: null,
    location: { href: 'https://merchant.nexora.test/html/pages/booking-book-phase-1.html' },
    setTimeout,
    ...overrides
  };

  vm.runInNewContext(readFileSync(RUNTIME_URL, 'utf8'), {
    URL,
    Promise,
    window: browserWindow
  });

  return browserWindow.NEXORA_BOOKING_LINK;
}

test('resolves the customer booking page on the current deployed origin', () => {
  const api = loadRuntime();

  assert.equal(
    api.resolveBookingUrl(
      'https://merchant.nexora.test/html/pages/booking-book-phase-1.html?tab=booking',
      '../customer/booking.html'
    ),
    'https://merchant.nexora.test/html/customer/booking.html'
  );
});

test('copies the exact resolved booking URL with the Clipboard API', async () => {
  const api = loadRuntime();
  let copiedText = '';
  const clipboard = {
    writeText(text) {
      copiedText = text;
      return Promise.resolve();
    }
  };

  await api.copyText(
    'https://merchant.nexora.test/html/customer/booking.html',
    clipboard,
    null
  );

  assert.equal(copiedText, 'https://merchant.nexora.test/html/customer/booking.html');
});

test('falls back to a temporary textarea when Clipboard API is unavailable', async () => {
  const api = loadRuntime();
  let appendedTextarea = null;
  let copiedSelection = '';
  const document = {
    body: {
      appendChild(element) {
        appendedTextarea = element;
      }
    },
    createElement(tagName) {
      assert.equal(tagName, 'textarea');
      return {
        value: '',
        select() {
          copiedSelection = this.value;
        },
        remove() {
          appendedTextarea = null;
        }
      };
    },
    execCommand(command) {
      assert.equal(command, 'copy');
      return true;
    }
  };

  await api.copyText(
    'https://merchant.nexora.test/html/customer/booking.html',
    null,
    document
  );

  assert.equal(copiedSelection, 'https://merchant.nexora.test/html/customer/booking.html');
  assert.equal(appendedTextarea, null);
});

test('falls back to a temporary textarea when Clipboard API rejects the copy', async () => {
  const api = loadRuntime();
  let copiedSelection = '';
  const document = {
    body: { appendChild() {} },
    createElement() {
      return {
        value: '',
        setAttribute() {},
        style: {},
        select() { copiedSelection = this.value; },
        remove() {}
      };
    },
    execCommand() { return true; }
  };

  await api.copyText(
    'https://merchant.nexora.test/html/customer/booking.html',
    { writeText() { return Promise.reject(new Error('permission denied')); } },
    document
  );

  assert.equal(copiedSelection, 'https://merchant.nexora.test/html/customer/booking.html');
});

test('encodes the exact booking URL and degrades when QRCode is unavailable', () => {
  const api = loadRuntime();
  const bookingUrl = 'https://merchant.nexora.test/html/customer/booking.html';
  const container = {
    encodedText: 'stale',
    replaceChildren() {
      this.encodedText = '';
    }
  };
  function FakeQRCode(target, options) {
    target.encodedText = options.text;
    target.renderedSize = [options.width, options.height];
  }
  FakeQRCode.CorrectLevel = { M: 'medium' };

  assert.equal(api.renderBookingQr(container, bookingUrl, FakeQRCode), true);
  assert.equal(container.encodedText, bookingUrl);
  assert.deepEqual(container.renderedSize, [224, 224]);

  assert.equal(api.renderBookingQr(container, bookingUrl, undefined), false);
  assert.equal(container.encodedText, '');
});

test('initializes visible links, copy, and QR with one absolute booking URL', async () => {
  const api = loadRuntime();
  const bookingUrl = 'https://merchant.nexora.test/html/customer/booking.html';
  const listeners = {};
  function eventNode(name, extra = {}) {
    return {
      name,
      addEventListener(type, listener) { listeners[name + ':' + type] = listener; },
      ...extra
    };
  }
  const urlText = { tagName: 'SPAN', textContent: '' };
  const urlAnchor = {
    tagName: 'A',
    textContent: '',
    href: '',
    setAttribute(name, value) { if (name === 'href') this.href = value; }
  };
  const copyButton = eventNode('copy');
  const copyStatus = { textContent: '' };
  const qrButton = eventNode('qr');
  const qrDialog = { shown: false, showModal() { this.shown = true; } };
  const qrContainer = { replaceChildren() {} };
  const qrFallback = { hidden: true };
  const closeButton = eventNode('close');
  const selectorMap = new Map([
    ['[data-booking-online-copy]', copyButton],
    ['[data-booking-online-copy-status]', copyStatus],
    ['[data-booking-online-qr-open]', qrButton],
    ['[data-booking-online-qr-dialog]', qrDialog],
    ['[data-booking-online-qr]', qrContainer],
    ['[data-booking-online-qr-fallback]', qrFallback],
    ['[data-booking-online-qr-close]', closeButton]
  ]);
  const share = {
    ready: false,
    getAttribute(name) {
      if (name === 'data-booking-online-ready') return this.ready ? 'true' : null;
      if (name === 'data-booking-path') return '../customer/booking.html';
      return null;
    },
    setAttribute(name) { if (name === 'data-booking-online-ready') this.ready = true; },
    querySelector(selector) { return selectorMap.get(selector) || null; },
    querySelectorAll(selector) {
      assert.equal(selector, '[data-booking-online-url]');
      return [urlText, urlAnchor];
    }
  };
  const document = { querySelector() { return share; } };
  let copiedText = '';
  let qrText = '';
  function FakeQRCode(target, options) { qrText = options.text; }
  FakeQRCode.CorrectLevel = { M: 'medium' };

  const result = api.initialize(document, {
    location: { href: 'https://merchant.nexora.test/html/pages/booking-book-phase-1.html?tab=booking' },
    navigator: { clipboard: { writeText(text) { copiedText = text; return Promise.resolve(); } } },
    QRCode: FakeQRCode,
    setTimeout() {}
  });
  listeners['copy:click']();
  await Promise.resolve();
  await Promise.resolve();
  listeners['qr:click']();

  assert.equal(result.url, bookingUrl);
  assert.equal(urlText.textContent, bookingUrl);
  assert.equal(urlAnchor.textContent, bookingUrl);
  assert.equal(urlAnchor.href, bookingUrl);
  assert.equal(copiedText, bookingUrl);
  assert.equal(qrText, bookingUrl);
  assert.equal(qrDialog.shown, true);
  assert.equal(qrFallback.hidden, true);
});

test('places the online booking share control beside the AI Voice guide', () => {
  assert.ok(existsSync(BOOKING_BOOK_URL), 'booking-book-phase-1.html must exist');
  const html = readFileSync(BOOKING_BOOK_URL, 'utf8');
  const headingLinks = html.match(/<div class="page-heading-links">[\s\S]*?<\/div>\s*<div class="page-tabs"/)?.[0] || '';

  assert.match(headingLinks, /AI Voice setup guide/);
  assert.match(headingLinks, /data-booking-online-share[^>]*data-booking-path="\.\.\/customer\/booking\.html"/);
  assert.match(headingLinks, /Link booking online/);
  assert.match(headingLinks, /data-booking-online-url/);
  assert.match(headingLinks, /data-booking-online-copy[^>]*aria-label="Copy online booking link"/);
  assert.match(headingLinks, /data-booking-online-copy[^>]*>[\s\S]*?class="bi bi-copy"/);
  assert.match(headingLinks, /data-booking-online-qr-open[^>]*aria-label="Show online booking QR code"/);
  assert.match(headingLinks, /data-booking-online-qr-open[^>]*>[\s\S]*?class="bi bi-qr-code"/);
});

test('provides an accessible QR dialog and loads the booking link runtime', () => {
  const html = readFileSync(BOOKING_BOOK_URL, 'utf8');

  assert.match(html, /<dialog[^>]*data-booking-online-qr-dialog[^>]*aria-labelledby="booking-online-qr-title"/);
  assert.match(html, /data-booking-online-qr(?:\s|>)/);
  assert.match(html, /data-booking-online-qr-fallback[^>]*hidden/);
  assert.match(html, /data-booking-online-qr-close[^>]*aria-label="Close booking QR code"/);
  assert.match(html, /data-booking-online-copy-status[^>]*aria-live="polite"/);
  assert.match(html, /<script src="\.\.\/assets\/booking-online-link\.js"><\/script>/);
});
