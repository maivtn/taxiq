import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const page = readFileSync(new URL('../../../html/pages/qr-stations.html', import.meta.url), 'utf8');
const scripts = [
  'oneqr-action-appearance.js',
  'oneqr-industries.js',
  'oneqr-phone.js',
  'oneqr-experience.js',
  'oneqr-contact-card.js',
  'qr-stations-oneqr.js',
  'oneqr-tip.js'
].map(name => readFileSync(new URL('../../../html/assets/' + name, import.meta.url), 'utf8'));
const landingURL = 'https://example.test/html/customer/oneqr-landing.html';
const settle = () => new Promise(resolve => setImmediate(resolve));

function setup(t, writeText) {
  const dom = new JSDOM(page, {
    url: 'https://example.test/html/pages/qr-stations.html?tab=qr-stations',
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  if (writeText) {
    Object.defineProperty(dom.window.navigator, 'clipboard', { value: { writeText }, configurable: true });
  }
  scripts.forEach(script => dom.window.eval(script));
  const document = dom.window.document;
  const screen = document.querySelector('[data-tip-qr]');
  const action = name => screen.querySelector('[data-tip-action="' + name + '"]');
  return { window: dom.window, document, screen, action };
}

test('Tip QR exposes post-creation actions only after generating the QR', t => {
  const { document, screen, action } = setup(t);
  assert.equal(screen.closest('[data-qr-panel]').hidden, false);
  assert.equal(action('generate').hidden, false);
  assert.equal(screen.querySelector('[data-tip-code]').hidden, true);
  assert.equal(action('view').hidden, true);
  assert.equal(action('copy').hidden, true);
  assert.equal(screen.querySelector('.tip-qr-open-link').hidden, true);

  action('generate').click();
  assert.equal(action('generate').hidden, true);
  assert.equal(screen.querySelector('[data-tip-code]').hidden, false);
  assert.equal(action('view').hidden, false);
  assert.equal(action('copy').hidden, false);
  assert.equal(action('view').textContent.trim(), 'View QR to Download');
  assert.equal(action('copy').textContent.trim(), 'Copy link');
  const link = screen.querySelector('.tip-qr-open-link');
  assert.equal(link.hidden, false);
  assert.equal(link.href, landingURL);
  assert.equal(link.target, '_blank');
  assert.equal(document.activeElement, action('view'));
});

test('Tip QR view action and QR thumbnail open the existing download modal and restore focus', t => {
  const { window, document, screen, action } = setup(t);
  const modal = document.querySelector('[data-oneqr-view-modal]');
  action('generate').click();
  action('view').click();
  assert.equal(modal.getAttribute('aria-hidden'), 'false');
  assert.equal(modal.classList.contains('hidden'), false);
  assert.equal(document.body.style.overflow, 'hidden');
  assert.ok(modal.contains(document.querySelector('#oneqrViewDownload')));
  assert.ok(modal.contains(document.activeElement));

  modal.querySelector('[data-oneqr-view-close]').click();
  assert.equal(modal.getAttribute('aria-hidden'), 'true');
  assert.equal(document.activeElement, action('view'));

  screen.querySelector('[data-tip-code]').click();
  assert.equal(modal.getAttribute('aria-hidden'), 'false');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(modal.getAttribute('aria-hidden'), 'true');
  assert.equal(document.activeElement, screen.querySelector('[data-tip-code]'));
  assert.equal(document.body.style.overflow, '');
});

test('Tip QR copies the absolute customer link and confirms successful copying', async t => {
  const copied = [];
  const { action } = setup(t, value => { copied.push(value); return Promise.resolve(); });
  action('generate').click();
  action('copy').click();
  await settle();
  assert.deepEqual(copied, [landingURL]);
  assert.equal(action('copy').textContent.trim(), 'Copied');
  assert.equal(action('copy').classList.contains('is-copied'), true);
});

test('Tip QR uses a temporary clipboard fallback when Clipboard API is unavailable', async t => {
  const { document, action } = setup(t);
  const copied = [];
  document.execCommand = command => {
    assert.equal(command, 'copy');
    const textarea = document.querySelector('body > textarea');
    assert.equal(textarea.readOnly, true);
    copied.push(textarea.value);
    return true;
  };
  action('generate').click();
  action('copy').click();
  await settle();
  assert.deepEqual(copied, [landingURL]);
  assert.equal(document.querySelector('body > textarea'), null);
  assert.equal(document.activeElement, action('copy'));
  assert.equal(action('copy').textContent.trim(), 'Copied');
});

test('Tip QR falls back after Clipboard API rejects the copy', async t => {
  const { document, action } = setup(t, () => Promise.reject(new Error('Permission denied')));
  let fallbackValue;
  document.execCommand = () => {
    fallbackValue = document.querySelector('body > textarea').value;
    return true;
  };
  action('generate').click();
  action('copy').click();
  await settle();
  assert.equal(fallbackValue, landingURL);
  assert.equal(action('copy').textContent.trim(), 'Copied');
  assert.equal(document.querySelector('body > textarea'), null);
});

test('Tip QR does not report success when both clipboard methods fail and permits retry', async t => {
  let reject = true;
  const { document, screen, action } = setup(t, () => reject ? Promise.reject(new Error('Denied')) : Promise.resolve());
  document.execCommand = () => false;
  action('generate').click();
  action('copy').click();
  await settle();
  assert.equal(action('copy').textContent.trim(), 'Copy link');
  assert.equal(action('copy').classList.contains('is-copied'), false);
  assert.equal(document.querySelector('body > textarea'), null);
  assert.equal(document.activeElement, screen.querySelector('.tip-qr-open-link'));

  reject = false;
  action('copy').click();
  await settle();
  assert.equal(action('copy').textContent.trim(), 'Copied');
});

test('Tip QR preserves generated actions and translated copy feedback while switching language', async t => {
  const { window, screen, action } = setup(t, () => Promise.resolve());
  let restoreLabel;
  window.setTimeout = callback => { restoreLabel = callback; return 1; };
  action('generate').click();
  action('copy').click();
  await settle();
  screen.querySelector('[data-tip-language="vi"]').click();
  assert.equal(screen.lang, 'vi');
  assert.equal(action('view').textContent.trim(), 'Xem mã QR');
  assert.equal(action('copy').textContent.trim(), 'Đã sao chép');
  assert.equal(action('generate').hidden, true);
  assert.equal(action('view').hidden, false);
  assert.equal(action('copy').hidden, false);
  restoreLabel();
  assert.equal(action('copy').textContent.trim(), 'Sao chép');
  assert.equal(action('copy').classList.contains('is-copied'), false);
  screen.querySelector('[data-tip-language="en"]').click();
  assert.equal(action('view').textContent.trim(), 'View QR to Download');
  assert.equal(action('copy').textContent.trim(), 'Copy link');
});
