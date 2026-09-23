import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

function boot(t) {
  const dom = new JSDOM(readFileSync(new URL('../../../html/pages/pos-front-desk.html', import.meta.url), 'utf8'), {
    url: 'https://example.test/pages/pos-front-desk.html?tab=waitlist&section=waitlist',
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  for (const name of ['salon-data', 'front-desk-waitlist']) {
    dom.window.eval(readFileSync(new URL('../../../html/assets/' + name + '.js', import.meta.url), 'utf8'));
  }
  return dom.window.document;
}

test('switching waitlist views preserves guest details and exposes the selected view', t => {
  const d = boot(t);
  const root = d.querySelector('#front-desk-waitlist');
  assert.equal(root.hidden, false);
  assert.equal(root.querySelectorAll('tbody tr').length, 3, 'Table is the default view');
  const tableButton = root.querySelector('[data-wl-view="table"]');
  assert.ok(tableButton, 'Table view is available');
  assert.equal(tableButton.getAttribute('aria-pressed'), 'true');
  root.querySelector('[data-wl-view="card"]').click();
  assert.equal(root.querySelectorAll('article').length, 3);
  tableButton.click();
  assert.equal(tableButton.getAttribute('aria-pressed'), 'true');
  assert.equal(root.querySelector('[data-wl-view="card"]').getAttribute('aria-pressed'), 'false');
  const rows = root.querySelectorAll('tbody tr');
  assert.equal(rows.length, 3);
  for (const value of ['Sarah Nguyen', 'Classic Pedicure', 'Returning', '12–18 min', '28 min', '620', '2', 'Birthday gift', '$10 voucher']) {
    assert.ok(rows[0].textContent.includes(value), value);
  }
  root.querySelector('[data-wl-view="card"]').click();
  assert.equal(root.querySelectorAll('article').length, 3);
  assert.equal(root.querySelector('[data-wl-view="card"]').getAttribute('aria-pressed'), 'true');
});

test('table actions target the right guest and arrivals stay removed when switching views', t => {
  const d = boot(t);
  const root = d.querySelector('#front-desk-waitlist');
  const tableButton = root.querySelector('[data-wl-view="table"]');
  assert.ok(tableButton, 'Table view is available');
  tableButton.click();
  const maria = root.querySelector('[data-wl-guest="maria-lopez"]');
  for (const action of ['sms', 'call', 'benefit']) {
    maria.querySelector('[data-wl-action="' + action + '"]').click();
    assert.match(d.querySelector('#feedback').textContent, /Maria Lopez/);
  }
  maria.querySelector('[data-wl-action="arrived"]').click();
  assert.equal(root.querySelectorAll('tbody tr').length, 2);
  root.querySelector('[data-wl-view="card"]').click();
  assert.equal(root.querySelector('[data-wl-guest="maria-lopez"]'), null);
  root.querySelector('[data-wl-action="arrived"]').click();
  tableButton.click();
  assert.equal(root.querySelectorAll('tbody tr').length, 1);
  root.querySelector('[data-wl-action="arrived"]').click();
  assert.equal(root.querySelector('#wl-empty').hidden, false);
  root.querySelector('[data-wl-view="card"]').click();
  assert.equal(root.querySelectorAll('[data-wl-guest]').length, 0);
  assert.equal(root.querySelector('#wl-empty').hidden, false);
});
