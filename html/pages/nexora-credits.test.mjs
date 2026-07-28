import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./nexora-credits.html', import.meta.url);
const CSS_URL = new URL('../assets/nexora-credits.css', import.meta.url);
const JS_URL = new URL('../assets/nexora-credits.js', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-credits.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the Credits Management page with a return path to SMS Campaigns', () => {
  const html = source();

  assert.match(html, /<title>Nexora Touch - Credits Management<\/title>/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-credits\.css">/);
  assert.match(html, /<main class="content" aria-label="Credits management content">/);
  assert.match(html, /href="booking-book-phase-1\.html\?tab=sms-campaigns"[^>]*data-credits-back/);
  assert.match(html, /data-credits-card="sms"/);
  assert.match(html, /data-credits-card="voice"/);
  assert.match(html, /data-credits-history/);
  assert.match(html, /activePage:\s*'booking'/);
  assert.match(html, /activeTab:\s*'sms-campaigns'/);
});

test('exposes SMS purchase and AI Voice plan actions', () => {
  const html = source();

  assert.match(html, /href="booking-book-phase-1\.html\?tab=sms-campaigns&amp;openCredits=1"/);
  assert.match(html, /href="nexora-packages\.html\?tab=voice"/);
});

test('renders both credit balances, progress indicators, and usage history', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(html, /data-credits-sms-balance/);
  assert.match(html, /data-credits-sms-progress/);
  assert.match(html, /data-credits-voice-balance/);
  assert.match(html, /data-credits-voice-progress/);
  assert.match(html, /<th scope="col">Product<\/th>/);
  assert.match(html, /<th scope="col">Activity<\/th>/);
  assert.match(html, /<th scope="col">Amount<\/th>/);
  assert.match(html, /<th scope="col">Date<\/th>/);
  assert.match(html, /<th scope="col">Balance after<\/th>/);
  assert.match(runtime, /SMS_STARTING_CREDITS\s*=\s*847/);
  assert.match(runtime, /VOICE_USED_MINUTES\s*=\s*487/);
  assert.match(runtime, /VOICE_TOTAL_MINUTES\s*=\s*1000/);
  assert.match(runtime, /taxiq:sms-credits/);
  assert.match(runtime, /function readSmsCredits\(\)/);
  assert.match(runtime, /function writeSmsCredits\(value\)/);
  assert.match(css, /\.credits-balance-grid\s*\{/);
  assert.match(css, /\.credits-history-scroll\s*\{/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
});

test('keeps the Credits Management runtime syntactically valid', () => {
  assert.doesNotThrow(() => new Function(readFileSync(JS_URL, 'utf8')));
});

test('keeps credit actions visible while hovering or focusing the card', () => {
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(css, /\.credits-card-foot\s*\{[\s\S]*?min-width:\s*0;/);
  assert.match(css, /\.credits-action\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?visibility:\s*visible;/);
  assert.match(css, /\.credits-action(?::hover|:focus-visible)[^{]*\{[\s\S]*?opacity:\s*1;[\s\S]*?visibility:\s*visible;/);
});

test('keeps the SMS credit action readable on hover', () => {
  const css = readFileSync(CSS_URL, 'utf8');
  const actionRule = css.match(/\.credits-action\s*\{([^}]*)\}/)?.[1] || '';
  const primaryHoverRule = css.match(/\.credits-action-primary:hover\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(actionRule, /transition:/);
  assert.match(primaryHoverRule, /background:\s*var\(--nexora-brand-dark\)/);
  assert.match(primaryHoverRule, /color:\s*#fff/);
});

test('shows Voice usage history per incoming phone number', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(html, /<th scope="col">Activity<\/th>/);
  assert.match(runtime, /phone:\s*'\+1 \(713\) 555-0182'/);
  assert.match(runtime, /phone:\s*'\+1 \(832\) 555-0104'/);
  assert.match(runtime, /credits-history-activity/);
  assert.match(css, /\.credits-history-activity\s*{/);
});

test('keeps the credits history caption screen-reader only', () => {
  const html = source();
  const srOnlyRule = readFileSync(CSS_URL, 'utf8').match(/\.sr-only\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(html, /<caption class="sr-only">Recent SMS and Voice credit usage<\/caption>/);
  assert.match(srOnlyRule, /position:\s*absolute/);
  assert.match(srOnlyRule, /width:\s*1px/);
  assert.match(srOnlyRule, /height:\s*1px/);
  assert.match(srOnlyRule, /overflow:\s*hidden/);
  assert.match(srOnlyRule, /white-space:\s*nowrap/);
});
