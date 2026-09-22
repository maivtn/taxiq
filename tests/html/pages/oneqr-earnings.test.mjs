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
  assert.match(d.querySelector('[data-consent-audit]').dataset.policyVersion, /ONEQR-ADS-REF-REV-2026-09-21-v1/);
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
  assert.match(d.querySelector('dialog [data-policy-link]').dataset.policyVersion, /ONEQR-ADS-REF-REV-2026-09-21-v1/);
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

test('phone navigation switches sections and resets filters without accepting policy', t => {
  const { d, change } = setup(t);
  change('#earnings-view', 'activity');
  change('#status-filter', 'hold');
  assert.equal(d.querySelectorAll('[data-activity-row]').length, 1);
  change('#earnings-view', 'payouts');
  assert.equal(d.querySelectorAll('[data-payout-status]').length, 3);
  assert.equal(d.querySelector('[aria-current="page"]').dataset.view, 'payouts');
  change('#earnings-view', 'activity');
  assert.equal(d.querySelectorAll('[data-activity-row]').length, 5);
  change('#earnings-view', 'settings');
  assert.equal(d.querySelector('#consent').checked, false);
  assert.equal(d.querySelector('[data-action="toggle"]').disabled, true);
});

test('phone earnings cards retain column labels after filtering and changing language', t => {
  const { d, click, change } = setup(t);
  change('#language', 'vi');
  for (const view of ['activity', 'reserves', 'payouts', 'settings']) {
    click('.eq-nav [data-view="' + view + '"]');
    const table = d.querySelector('table');
    const headers = Array.from(table.querySelectorAll('th'), th => th.textContent.trim());
    for (const row of table.querySelectorAll('tbody tr')) {
      Array.from(row.cells).forEach((cell, i) => assert.equal(cell.dataset.label, headers[i]));
    }
  }
  click('.eq-nav [data-view="activity"]');
  change('#status-filter', 'hold');
  assert.equal(d.querySelector('[data-activity-row] td').dataset.label, 'Hoạt động / chiến dịch');
  change('#period-filter', '2026-08');
  assert.equal(d.querySelector('td[colspan]').hasAttribute('data-label'), false);
});

test('policy links open a readable page in the current language without accepting consent', t => {
  const { d, click, change } = setup(t);
  click('[data-view="settings"]');
  for (const lang of ['en', 'vi']) {
    change('#language', lang);
    const link = d.querySelector('[data-policy-link]');
    assert.ok(link, 'Consent must link to the full policy');
    assert.equal(new URL(link.href).searchParams.get('lang'), lang);
    assert.equal(link.target, '_blank');
    assert.equal(d.querySelector('#consent').checked, false);
    const policyFile = new URL('../../../html/pages/' + new URL(link.href).pathname.split('/').pop(), import.meta.url);
    assert.ok(existsSync(policyFile));
  }
  assert.equal(d.querySelector('[data-policy-link]').textContent.trim(), 'Chính sách kiếm tiền OneQR');
});

test('policy language switching preserves the section and returns to monetization settings', t => {
  const policyPage = new URL('../../../html/pages/oneqr-policy.html', import.meta.url);
  const dom = new JSDOM(readFileSync(policyPage, 'utf8'), { url: 'https://example.test/html/pages/oneqr-policy.html?lang=en#reserves', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  dom.window.eval(readFileSync(new URL('../../../html/assets/oneqr-policy.js', import.meta.url), 'utf8'));
  const d = dom.window.document;
  assert.equal(d.documentElement.lang, 'en');
  assert.equal(d.querySelector('h1 [lang="en"]').hidden, false);
  assert.equal(d.querySelector('h1 [lang="vi"]').hidden, true);
  d.querySelector('#policy-language').value = 'vi';
  d.querySelector('#policy-language').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.equal(d.documentElement.lang, 'vi');
  assert.equal(dom.window.location.hash, '#reserves');
  assert.equal(d.querySelector('h1 [lang="vi"]').hidden, false);
  assert.equal(d.querySelector('h1 [lang="en"]').hidden, true);
  const back = new URL(d.querySelector('[data-back-to-earnings]').href);
  assert.equal(back.searchParams.get('lang'), 'vi');
  assert.equal(back.hash, '#settings');
  for (const link of d.querySelectorAll('.policy-toc a')) assert.ok(d.querySelector(link.hash));
  const earnings = new JSDOM(readFileSync(page, 'utf8'), { url: back.href, runScripts: 'outside-only' });
  t.after(() => earnings.window.close());
  earnings.window.eval(readFileSync(script, 'utf8'));
  assert.equal(earnings.window.document.querySelector('[aria-current="page"]').dataset.view, 'settings');
  assert.equal(earnings.window.document.querySelector('#consent').checked, false);
});

test('phone policy contents start collapsed and rate cards keep the correct language labels', t => {
  const dom = new JSDOM(readFileSync(new URL('../../../html/pages/oneqr-policy.html', import.meta.url), 'utf8'), { url: 'https://example.test/html/pages/oneqr-policy.html?lang=vi', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  let onResize;
  const media = { matches: true, addEventListener: (event, handler) => { onResize = handler; } };
  dom.window.matchMedia = () => media;
  dom.window.eval(readFileSync(new URL('../../../html/assets/oneqr-policy.js', import.meta.url), 'utf8'));
  const d = dom.window.document;
  assert.equal(d.querySelector('.policy-contents').open, false);
  d.querySelector('.policy-contents').open = true;
  assert.equal(d.querySelectorAll('.policy-toc a').length, 12);
  for (const lang of ['vi', 'en']) {
    const table = d.querySelector('[data-policy-lang="' + lang + '"] table');
    const headers = Array.from(table.querySelectorAll('th'), th => th.textContent.trim());
    Array.from(table.querySelector('tbody tr').cells).forEach((cell, i) => assert.equal(cell.dataset.label, headers[i]));
  }
  media.matches = false; onResize();
  assert.equal(d.querySelector('.policy-contents').open, true);
  media.matches = true; onResize();
  assert.equal(d.querySelector('.policy-contents').open, false);
});
