import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const page = new URL('../../../html/pages/oneqr-earnings.html', import.meta.url);
const script = new URL('../../../html/assets/oneqr-earnings.js', import.meta.url);
function setup(t) {
  assert.ok(existsSync(page), 'Earnings page must exist');
  const dom = new JSDOM(readFileSync(page, 'utf8'), { url: 'https://example.test/html/pages/oneqr-earnings.html', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  dom.window.eval(readFileSync(script, 'utf8'));
  const d = dom.window.document;
  const click = s => { assert.ok(d.querySelector(s), s); d.querySelector(s).click(); };
  const change = (s, v) => { d.querySelector(s).value = v; d.querySelector(s).dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
  return { d, click, change };
}
test('activation requires explicit consent and disabling preserves balances and consent audit', t => {
  const { d, click } = setup(t);
  click('[data-view="settings"]');
  assert.equal(d.querySelector('#consent').checked, false);
  assert.equal(d.querySelector('[data-action="toggle"]').disabled, true);
  click('#consent'); click('[data-action="toggle"]');
  assert.equal(d.querySelector('[data-monetization-status]').dataset.monetizationStatus, 'enabled');
  assert.match(d.querySelector('[data-consent-audit]').textContent, /ONEQR-ADS-REF-REV-2026-09-21-v1/);
  click('[data-action="toggle"]');
  assert.equal(d.querySelector('[data-monetization-status]').dataset.monetizationStatus, 'disabled');
  click('[data-view="overview"]');
  assert.equal(d.querySelector('[data-balance="available"]').textContent, '$70.00');
});
test('filters activities and opens the original transaction with policy and source', t => {
  const { d, click, change } = setup(t);
  click('[data-view="activity"]'); change('#status-filter', 'hold');
  assert.equal(d.querySelectorAll('[data-activity-row]').length, 1);
  click('[data-detail="E-104"]');
  assert.match(d.querySelector('dialog').textContent, /E-104/);
  assert.match(d.querySelector('dialog').textContent, /ONEQR-ADS-REF-REV-2026-09-21-v1/);
  assert.match(d.querySelector('dialog').textContent, /Bitcoin Nail Bar/);
  assert.equal(d.querySelector('dialog').open, true);
  click('[data-action="close"]');
  assert.equal(d.querySelector('dialog').open, false);
});
test('reserve balance excludes the separately displayed dispute hold and history distinguishes unconfirmed payouts', t => {
  const { d, click } = setup(t);
  assert.equal(d.querySelector('[data-balance="reserve"]').textContent, '$15.00');
  assert.equal(d.querySelector('[data-balance="hold"]').textContent, '$5.00');
  click('[data-view="reserves"]');
  assert.match(d.querySelector('[data-reserve-equation]').textContent, /\$60.00.*\$20.00.*\$20.00.*\$20.00/s);
  click('[data-view="payouts"]');
  assert.equal(d.querySelectorAll('[data-payout-status="paid"]').length, 1);
  assert.equal(d.querySelectorAll('[data-payout-status="reconciling"]').length, 1);
  assert.equal(d.querySelectorAll('[data-payout-status="failed"]').length, 1);
});
test('Vietnamese dates use tháng and period filters show the empty result', t => {
  const { d, click, change } = setup(t);
  change('#language', 'vi'); click('[data-view="activity"]');
  assert.match(d.querySelector('[data-activity-row]').textContent, /tháng 9/);
  change('#period-filter', '2026-08');
  assert.equal(d.querySelectorAll('[data-activity-row]').length, 0);
});
