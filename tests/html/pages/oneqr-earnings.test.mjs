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
test('missing eligibility blocks activation even with consent and explains the missing conditions', t => {
  const { d, click, change } = setup(t);
  for (const scenario of ['incomplete', 'pending', 'rejected', 'wallet']) {
    change('#scenario', scenario); click('[data-view="settings"]'); click('#consent');
    assert.equal(d.querySelector('[data-action="toggle"]').disabled, true);
    assert.match(d.querySelector('[data-eligibility]').textContent, /KYB/);
  }
  change('#scenario', 'wallet'); click('[data-view="payouts"]');
  assert.ok(d.querySelector('[data-wallet-blocked]'));
  assert.equal(d.querySelectorAll('[data-action="pay"]').length, 0);
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
test('empty, loading and error previews hide financial data; retry restores the sample and VI dates use tháng', t => {
  const { d, click, change } = setup(t);
  for (const value of ['empty', 'loading', 'error']) {
    change('#scenario', value);
    assert.equal(d.querySelectorAll('[data-balance]').length, 0);
    assert.ok(d.querySelector('[data-state="' + value + '"]'));
  }
  click('[data-action="retry"]');
  assert.equal(d.querySelector('[data-balance="available"]').textContent, '$70.00');
  change('#language', 'vi'); click('[data-view="activity"]');
  assert.match(d.querySelector('[data-activity-row]').textContent, /tháng 9/);
  change('#period-filter', '2026-08');
  assert.equal(d.querySelectorAll('[data-activity-row]').length, 0);
});
