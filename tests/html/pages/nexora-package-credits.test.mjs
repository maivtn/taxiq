import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const page = new URL('../../../html/pages/nexora-packages.html', import.meta.url);
const assets = new URL('../../../html/assets/', import.meta.url);
function setup(t, tab = 'overview') {
  const dom = new JSDOM(readFileSync(page, 'utf8'), { url: `https://example.test/nexora-packages.html?tab=${tab}`, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  for (const name of ['nexora-package-billing-data.js', 'nexora-packages.js', 'nexora-credits.js', 'nexora-credit-checkout.js', 'nexora-ads-credit.js']) {
    const path = new URL(name, assets);
    if (existsSync(path)) window.eval(readFileSync(path, 'utf8'));
  }
  const q = selector => window.document.querySelector(selector);
  const input = (selector, value) => {
    q(selector).value = value;
    q(selector).dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  const consent = () => { q('[data-ads-consent]').checked = true; q('[data-ads-consent]').dispatchEvent(new window.Event('change', { bubbles: true })); };
  return { window, q, input, consent };
}

test('Usage opens by URL, filters shared AI Hub history, and returns to Overview', t => {
  const { q, window } = setup(t, 'usage');
  assert.ok(q('[data-package-panel="usage"]'), 'Usage panel exists');
  assert.equal(q('[data-package-panel="usage"]').hidden, false);
  assert.equal(q('[data-credits-voice-remaining]').textContent, '380');
  q('[data-credits-history-filter="voice"]').click();
  const rows = [...window.document.querySelectorAll('[data-credits-history] tr')];
  assert.equal(rows.length, 3);
  assert.ok(rows.every(row => row.textContent.includes('Voice')));
  q('[data-package-tab="overview"]').click();
  assert.equal(q('[data-package-panel="usage"]').hidden, true);
  assert.equal(q('[data-package-panel="overview"]').hidden, false);
});

test('Ads Credit opens as its own tab and stays out of Overview', t => {
  const { q, window } = setup(t, 'ads-credit');
  assert.equal(q('[data-package-panel="ads-credit"]').hidden, false);
  assert.equal(q('[data-package-tab="ads-credit"]').getAttribute('aria-selected'), 'true');
  assert.ok(q('[data-package-panel="ads-credit"] [data-ads-open]'));
  assert.equal(q('[data-package-panel="overview"] [data-ads-open]'), null);
  assert.doesNotMatch(window.document.body.textContent, /demo/i);
});

test('Ads top-up requires fresh consent after amount changes and rejects invalid custom amounts', t => {
  const { q, input, consent } = setup(t, 'ads-credit');
  assert.ok(q('[data-ads-open]'), 'Ads Credit entry is available in its tab');
  q('[data-ads-open]').click();
  assert.equal(q('[data-ads-submit]').disabled, true);
  consent();
  assert.equal(q('[data-ads-submit]').disabled, false);
  q('[data-ads-amount="custom"]').click();
  assert.equal(q('[data-ads-consent]').checked, false);
  for (const value of ['', '0', '-1', '10.001', '1e2', '10001', 'abc']) {
    input('[data-ads-custom]', value);
    consent();
    assert.equal(q('[data-ads-submit]').disabled, true, value);
  }
  input('[data-ads-custom]', '75.25');
  consent();
  assert.equal(q('[data-ads-submit]').disabled, false);
  assert.equal(q('[data-ads-total]').textContent, '$75.25');
});

test('Ads Credit is added once, recorded with a receipt, and isolated from Voice/SMS', t => {
  const { q, window, consent } = setup(t, 'ads-credit');
  assert.ok(q('[data-ads-open]'), 'Ads Credit entry is available in its tab');
  const smsBefore = window.NEXORA_CREDITS.readSmsCredits();
  q('[data-ads-open]').click();
  q('[data-ads-amount="100"]').click();
  consent();
  const submit = () => q('[data-ads-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  submit();
  submit();
  assert.equal(q('[data-ads-balance]').textContent, '$420.00');
  assert.equal(q('[data-ads-history] tr').textContent.includes('+$100.00'), true);
  assert.match(q('[data-ads-history] tr details').textContent, /Receipt ADS-/);
  assert.doesNotMatch(window.document.body.textContent, /demo/i);
  assert.equal(window.NEXORA_CREDITS.readSmsCredits(), smsBefore);
  q('[data-ads-open]').click();
  assert.equal(q('[data-ads-consent]').checked, false);
});

for (const [kind, packageId, expected] of [['sms', 'sms-500', '950'], ['voice', 'voice-100', '100']]) {
  test(`Credit Usage opens ${kind} checkout and updates only its purchased balance`, t => {
    const { q } = setup(t, 'usage');
    assert.ok(q(`[data-credits-action="${kind}-buy"]`), 'Original buy button is retained');
    q(`[data-credits-action="${kind}-buy"]`).click();
    assert.equal(q(`[data-${kind}-credit-modal]`).hidden, false);
    q(`[data-${kind}-credit-package="${packageId}"]`).click();
    q(`[data-${kind}-credit-confirm]`).click();
    assert.equal(q(`[data-${kind}-credit-modal]`).hidden, true);
    assert.equal(q(`[data-credits-${kind}-topup-balance]`).textContent, expected);
    assert.equal(q('[data-ads-balance]').textContent, '$320.00');
  });
}
