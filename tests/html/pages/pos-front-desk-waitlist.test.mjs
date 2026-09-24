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
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
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
  for (const action of ['call', 'benefit']) {
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

for (const view of ['table', 'card']) {
  test(`waitlist ${view} actions show non-blocking SweetAlert feedback for the selected customer`, t => {
    const d = boot(t);
    const alerts = [];
    d.defaultView.Swal = {fire: options => alerts.push(options)};
    d.querySelector(`[data-wl-view="${view}"]`).click();
    const guest = d.querySelector('[data-wl-guest="maria-lopez"]');
    for (const [action, title, icon] of [
      ['benefit', 'Benefit offer sent to Maria Lopez.', 'success'],
      ['call', 'Calling Maria Lopez...', 'info'],
      ['arrived', 'Maria Lopez marked as arrived.', 'success']
    ]) {
      guest.querySelector(`[data-wl-action="${action}"]`).click();
      const notification = alerts.at(-1);
      assert.ok(notification, 'The action sends feedback to SweetAlert');
      assert.equal(notification.titleText, title);
      assert.equal(notification.icon, icon);
      assert.equal(notification.toast, true);
      assert.equal(notification.showConfirmButton, false);
      assert.ok(notification.timer > 0, 'Toast dismisses automatically');
      assert.equal(d.querySelector('#feedback').textContent, '');
    }
    assert.equal(alerts.length, 3);
    assert.equal(d.querySelector('[data-wl-guest="maria-lopez"]'), null);
  });
}

const smsKey = 'nexora:salon-sms-settings:v1:bitcoin-nail-bar-houston';
const change = (d, node) => node.dispatchEvent(new d.defaultView.Event('change'));
const input = (d, node) => node.dispatchEvent(new d.defaultView.Event('input'));

for (const view of ['table', 'card']) {
  test(`manual SMS in ${view} view opens for the selected guest and only records a demo on submit`, t => {
    const d = boot(t);
    d.querySelector(`[data-wl-view="${view}"]`).click();
    const open = () => d.querySelector('[data-wl-guest="maria-lopez"] [data-wl-action="sms"]').click();
    open();
    assert.equal(d.querySelector('dialog').open, true);
    assert.match(d.querySelector('[data-wl-sms-recipient]').textContent, /Maria Lopez.*\+1/);
    assert.match(d.querySelector('[data-wl-sms-preview]').textContent, /Hi Maria Lopez.*Bitcoin Nail Bar/);
    assert.doesNotMatch(d.querySelector('[data-wl-sms-preview]').textContent, /Return Notice|15 minutes/);
    assert.match(d.querySelector('[data-wl-sms-history]').textContent, /No SMS demos/);
    d.querySelector('[data-wl-sms-close]').click();open();
    assert.match(d.querySelector('[data-wl-sms-history]').textContent, /No SMS demos/);
    d.querySelector('[data-wl-sms-submit]').click();
    assert.match(d.querySelector('[data-wl-sms-status]').textContent, /Demo recorded for Maria Lopez.*No SMS was sent/);
    assert.equal(d.querySelector('[data-wl-sms-submit]').disabled, true);
    assert.equal(d.querySelectorAll('[data-wl-guest]').length, 3);
    d.querySelector('[data-wl-sms-close]').click();open();
    assert.match(d.querySelector('[data-wl-sms-history]').textContent, /Return Soon.*\nHi Maria Lopez/);
    assert.equal(d.querySelector('[data-wl-sms-submit]').disabled, false);
  });
}

test('front desk loads owner templates, ignores legacy automation pause, and never overwrites saved templates', t => {
  const d = boot(t);
  const saved = JSON.stringify({version:1,sections:{automation:{enabled:false,fields:{returnSoonMessage:'[Salon Name]: please return, [Customer Name]!',readyNowMessage:'Your turn!'}}}});
  d.defaultView.localStorage.setItem(smsKey,saved);
  d.querySelector('[data-wl-action="sms"]').click();
  const message=d.querySelector('[data-wl-sms-message]');
  assert.equal(message.value,'Bitcoin Nail Bar: please return, Sarah Nguyen!');
  message.value='Please return to the front desk.';input(d,message);
  d.querySelector('[data-wl-sms-submit]').click();
  assert.equal(d.defaultView.localStorage.getItem(smsKey),saved);
});

test('Wait Update requires a fresh confirmed estimate and respects owner disabling it', t => {
  const d = boot(t);
  d.querySelector('[data-wl-action="sms"]').click();
  const type=d.querySelector('[data-wl-sms-type]');
  assert.equal(type.querySelector('[value="wait-care"]').textContent,'Wait Update');
  type.value='wait-care';change(d,type);
  const submit=d.querySelector('[data-wl-sms-submit]'), status=d.querySelector('[data-wl-sms-status]');
  const wait=d.querySelector('[data-wl-sms-wait]'), confirmed=d.querySelector('[data-wl-sms-wait-confirmed]');
  assert.equal(wait.value,'');
  submit.click();assert.match(status.textContent,/unresolved/);
  wait.value='10–15 minutes';input(d,wait);submit.click();assert.match(status.textContent,/confirm/);
  confirmed.checked=true;wait.value='20 minutes';input(d,wait);assert.equal(confirmed.checked,false);
  confirmed.checked=true;
  d.defaultView.localStorage.setItem(smsKey,JSON.stringify({version:1,sections:{'wait-care':{enabled:false,fields:{}}}}));
  submit.click();assert.match(status.textContent,/disabled/);
  d.querySelector('[data-wl-sms-close]').click();d.querySelector('[data-wl-action="sms"]').click();
  assert.equal(type.querySelector('[value="wait-care"]').disabled,true);
  d.querySelector('[data-wl-sms-close]').click();
  d.defaultView.localStorage.removeItem(smsKey);d.querySelector('[data-wl-action="sms"]').click();
  type.value='wait-care';change(d,type);wait.value='10 minutes';input(d,wait);confirmed.checked=true;submit.click();
  assert.match(status.textContent,/Demo recorded/);
  assert.match(d.querySelector('[data-wl-sms-preview]').textContent,/Estimated wait: 10 minutes/);
});

test('Ready Now requires staff confirmation and stale waiting entries cannot be messaged', t => {
  const d=boot(t);
  d.querySelector('[data-wl-action="sms"]').click();
  const type=d.querySelector('[data-wl-sms-type]');type.value='ready-now';change(d,type);
  const send=d.querySelector('[data-wl-sms-submit]'), status=d.querySelector('[data-wl-sms-status]');
  send.click();assert.match(status.textContent,/Confirm the salon is ready/);
  d.querySelector('[data-wl-sms-ready-confirmed]').checked=true;
  d.querySelector('[data-wl-guest="sarah-nguyen"] [data-wl-action="arrived"]').click();
  send.click();assert.match(status.textContent,/no longer waiting/);
});

test('unresolved legacy placeholders and empty messages cannot be sent, and corrupt settings remain intact', t => {
  const d=boot(t);
  d.defaultView.localStorage.setItem(smsKey,JSON.stringify({version:1,sections:{automation:{enabled:true,fields:{returnSoonMessage:'Return in [Return Notice]'}}}}));
  d.querySelector('[data-wl-action="sms"]').click();
  const message=d.querySelector('[data-wl-sms-message]'), submit=d.querySelector('[data-wl-sms-submit]');
  submit.click();assert.match(d.querySelector('[data-wl-sms-status]').textContent,/unresolved/);
  message.value=' ';submit.click();assert.match(d.querySelector('[data-wl-sms-status]').textContent,/Enter a message/);
  d.querySelector('[data-wl-sms-close]').click();
  d.defaultView.localStorage.setItem(smsKey,'{broken');
  d.querySelector('[data-wl-action="sms"]').click();
  assert.equal(d.querySelector('dialog').open,false);
  assert.match(d.querySelector('#feedback').textContent,/Could not load SMS templates/);
  assert.equal(d.defaultView.localStorage.getItem(smsKey),'{broken');
});
