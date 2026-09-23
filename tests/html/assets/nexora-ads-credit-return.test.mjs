import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const SOURCE_DIR = new URL('../../../html/pages/', import.meta.url);
const PAGE = readFileSync(new URL('./nexora-packages.html', SOURCE_DIR), 'utf8');
const SCRIPT = readFileSync(new URL('../assets/nexora-ads-credit.js', SOURCE_DIR), 'utf8');
const CREDIT_KEY = 'nexora:ads-credit:v1';

function boot(t) {
  const url = 'https://example.test/pages/nexora-packages.html?tab=ads-credit&campaignId=campaign-a&returnTo=' + encodeURIComponent('reward-promotions.html?tab=campaigns&campaignId=campaign-a');
  const dom = new JSDOM(PAGE, {url, runScripts: 'outside-only'});
  t.after(() => dom.window.close());
  const {window} = dom;
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  window.localStorage.setItem(CREDIT_KEY, JSON.stringify({balanceCents: 0, holdCents: 0, history: []}));
  window.eval(SCRIPT);
  return {w: window, d: window.document};
}

test('shows a safe return to the preserved campaign and persists a completed top-up', t => {
  const {w, d} = boot(t);
  const context = d.querySelector('[data-ads-return-context]');
  const back = d.querySelector('[data-ads-return]');
  assert.equal(context.hidden, false);
  assert.equal(back.getAttribute('href'), 'reward-promotions.html?tab=campaigns&campaignId=campaign-a');
  assert.match(context.textContent, /campaign-a/);

  d.querySelector('[data-ads-open]').click();
  d.querySelector('[data-ads-consent]').checked = true;
  d.querySelector('[data-ads-consent]').dispatchEvent(new w.Event('change', {bubbles: true}));
  d.querySelector('[data-ads-form]').dispatchEvent(new w.Event('submit', {bubbles: true, cancelable: true}));
  const saved = JSON.parse(w.localStorage.getItem(CREDIT_KEY));
  assert.equal(saved.balanceCents, 10000);
  assert.equal(saved.history[0].cents, 10000);
  assert.equal(d.querySelector('[data-ads-return]').hidden, false);
  assert.match(d.querySelector('[data-ads-status]').textContent, /Return to campaign/i);
});

test('rejects an external return URL', t => {
  const dom = new JSDOM(PAGE, {url: 'https://example.test/pages/nexora-packages.html?tab=ads-credit&returnTo=https%3A%2F%2Fevil.example', runScripts: 'outside-only'});
  t.after(() => dom.window.close());
  dom.window.eval(SCRIPT);
  assert.equal(dom.window.document.querySelector('[data-ads-return-context]').hidden, true);
});
