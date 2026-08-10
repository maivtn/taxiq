import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./nexora-products-billing.html', import.meta.url);
const CSS_URL = new URL('../assets/nexora-products-billing.css', import.meta.url);
const JS_URL = new URL('../assets/nexora-products-billing.js', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-products-billing.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the Products & Billing page from the shared merchant shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Products &amp; Billing<\/title>/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-products-billing\.css">/);
  assert.match(html, /<aside class="sidebar" aria-label="Dashboard sidebar"><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Products and billing content">/);
  assert.match(html, /activePage:\s*'products-billing'/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-products-billing\.js"><\/script>/);
  assert.ok(existsSync(CSS_URL), 'nexora-products-billing.css must exist');
  assert.ok(existsSync(JS_URL), 'nexora-products-billing.js must exist');
});

test('matches the screenshot heading and tabs without the booking return action', () => {
  const html = source();
  assert.match(html, /<span class="products-billing-kicker">Products &amp; Billing<\/span>/);
  assert.match(html, /<h1[^>]*>Manage every NEXORA product in one place\.<\/h1>/);
  assert.match(html, /Plans, usage and billing stay separate from daily operations\./);
  assert.doesNotMatch(html, /products-booking-link|Back to Booking|href="booking-book-phase-1\.html"/);

  const tabs = [...html.matchAll(/data-products-billing-tab="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tabs, ['overview', 'history', 'payment-methods']);
  assert.match(html, /Overview/);
  assert.match(html, /Billing history/);
  assert.match(html, /Payment methods/);
});

test('renders the overview metric cards and product cards from the reference screen', () => {
  const html = source();
  for (const value of ['Active services', 'Estimated monthly total', 'Next invoice']) {
    assert.match(html, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(html, />3<\/strong>/);
  assert.match(html, />\$377<\/strong>/);
  assert.match(html, />Aug 17<\/strong>/);

  for (const product of ['AI Phone', 'Tax IQ', 'QR Tips &amp; Reviews', 'Rewards', 'Booking']) {
    assert.match(html, new RegExp(`<h2[^>]*>${product}<\\/h2>`));
  }

  assert.match(html, /\$199<span>\/month<\/span>/);
  assert.match(html, /\$0<span> during trial<\/span>/);
  assert.match(html, /\$79<span>\/month<\/span>/);
  assert.match(html, /\$49<span>\/month<\/span>/);
  assert.match(html, /\$99<span>\/month<\/span>/);
  assert.match(html, /Voice minutes[\s\S]*?842 \/ 1,000/);
  assert.match(html, /Reports analyzed[\s\S]*?8 \/ 20/);
  assert.match(html, /QR scans[\s\S]*?684 \/ 1,000/);
  assert.match(html, /Members[\s\S]*?0 \/ 500/);
  assert.match(html, /Appointments[\s\S]*?286 \/ 500/);
  assert.match(html, /Explore product/);
});

test('ships responsive styling and tab switching hooks for the billing page', () => {
  source();
  const css = readFileSync(CSS_URL, 'utf8');
  const js = readFileSync(JS_URL, 'utf8');

  assert.match(css, /\.products-billing-page\s*\{/);
  assert.match(css, /\.products-summary-grid\s*\{/);
  assert.match(css, /\.product-card\s*\{/);
  assert.doesNotMatch(css, /products-booking-link/);
  assert.match(css, /@media \(min-width: 1180px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);

  assert.match(js, /querySelectorAll\('\[data-products-billing-tab\]'\)/);
  assert.match(js, /querySelectorAll\('\[data-products-billing-panel\]'\)/);
  assert.match(js, /function activateTab/);
});
