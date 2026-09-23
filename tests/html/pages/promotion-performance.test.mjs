import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const SOURCE_DIR = new URL('../../../html/pages/', import.meta.url);
const PAGE_URL = new URL('./promotion-performance.html', SOURCE_DIR);
const SCRIPT_URL = new URL('../assets/promotion-performance.js', SOURCE_DIR);
const STORAGE_KEY = 'nexora:reward-promotions:v1';

const fixture = {
  version: 2,
  offers: [
    {
      id: 'offer-a', title: 'Weekday Glow', badge: 'QUIET HOURS', paused: false,
      public: 'approved', uses: 12, revenue: 820,
      performance: {
        updatedAt: '2026-09-23T10:30:00-05:00',
        sources: {
          internal: {impressions: 900, clicks: 150, bookings: 18, posUses: 9, discount: 72, revenue: 540},
          organic: {impressions: 600, clicks: 90, bookings: 10, posUses: 3, discount: 24, revenue: 180},
          paid: {impressions: 1200, clicks: 180, bookings: 14, posUses: 5, discount: 40, revenue: 310, spend: 84, held: 12, adjustments: -4},
          unknown: {impressions: 0, clicks: 0, bookings: 0, posUses: 2, discount: 16, revenue: 110}
        },
        events: [
          {id: 'evt-click', at: '2026-09-23T09:10:00-05:00', campaignId: 'campaign-a', type: 'Click', placement: 'Search Deals', cost: 0.5, status: 'Recorded', result: 'Offer detail opened', ledgerId: 'ADS-LDG-101'},
          {id: 'evt-duplicate', at: '2026-09-23T09:12:00-05:00', campaignId: 'campaign-a', type: 'Click', placement: 'Search Deals', cost: 0, status: 'Rejected', result: 'Duplicate click', reason: 'Duplicate within validation window'},
          {id: 'evt-adjust', at: '2026-09-23T09:30:00-05:00', campaignId: 'campaign-a', type: 'Adjustment', placement: 'Explore', cost: -4, status: 'Adjusted', result: 'Invalid activity correction', ledgerId: 'ADS-LDG-102'}
        ]
      }
    },
    {id: 'offer-empty', title: 'New Offer', badge: 'NEW', paused: true, public: 'private'}
  ],
  campaigns: [
    {id: 'campaign-a', promotionId: 'offer-a', name: 'Houston traffic', status: 'approved', dailyBudget: 20, totalBudget: 200, spent: 84, held: 12, impressions: 1200, clicks: 180, bookings: 14, attributedRevenue: 310}
  ]
};

async function boot(t, url = 'https://example.test/pages/promotion-performance.html?promotionId=offer-a') {
  assert.ok(existsSync(PAGE_URL), 'promotion-performance.html must exist');
  assert.ok(existsSync(SCRIPT_URL), 'promotion-performance.js must exist');
  const dom = new JSDOM(readFileSync(PAGE_URL, 'utf8'), {url, runScripts: 'outside-only'});
  t.after(() => dom.window.close());
  dom.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fixture));
  dom.window.eval(readFileSync(SCRIPT_URL, 'utf8'));
  return {w: dom.window, d: dom.window.document};
}

test('provides a dedicated Salon Owner performance page in the merchant shell', () => {
  assert.ok(existsSync(PAGE_URL));
  const html = readFileSync(PAGE_URL, 'utf8');
  assert.match(html, /<title>[^<]*Promotion Performance[^<]*<\/title>/i);
  assert.match(html, /activePage:\s*'reward'/);
  assert.match(html, /activeTab:\s*'promotions'/);
  assert.match(html, /href="reward-promotions\.html"/);
  for (const label of ['Views', 'Clicks', 'Bookings', 'POS uses', 'Discount given', 'Related revenue']) {
    assert.match(html, new RegExp(label, 'i'));
  }
  assert.match(html, /Billable activity/i);
  assert.match(html, /src="\.\.\/assets\/promotion-performance\.js/);
  assert.match(html, /href="\.\.\/assets\/promotion-performance\.css/);
});

test('renders promotion totals, source comparison, campaign metrics and billable reasons', async t => {
  const {d} = await boot(t);
  assert.equal(d.querySelector('#performance-promotion').value, 'offer-a');
  assert.equal(d.querySelector('[data-metric="impressions"]').textContent, '2,700');
  assert.equal(d.querySelector('[data-metric="clicks"]').textContent, '420');
  assert.equal(d.querySelector('[data-metric="bookings"]').textContent, '42');
  assert.equal(d.querySelector('[data-metric="posUses"]').textContent, '19');
  assert.equal(d.querySelector('[data-metric="discount"]').textContent, '$152.00');
  assert.equal(d.querySelector('[data-metric="revenue"]').textContent, '$1,140.00');
  assert.match(d.querySelector('#performance-source-body').textContent, /Internal/);
  assert.match(d.querySelector('#performance-source-body').textContent, /Public organic/);
  assert.match(d.querySelector('#performance-source-body').textContent, /Paid Boost/);
  assert.match(d.querySelector('#performance-campaigns').textContent, /Houston traffic/);
  assert.match(d.querySelector('#performance-campaigns').textContent, /15\.0%/);
  assert.match(d.querySelector('#performance-campaigns').textContent, /3\.7x/);
  const activity = d.querySelector('#performance-events').textContent;
  assert.match(activity, /Duplicate within validation window/);
  assert.match(activity, /ADS-LDG-101/);
  assert.match(activity, /Adjusted/);
});

test('filters source totals without presenting unavailable measurements as zero', async t => {
  const {w, d} = await boot(t);
  const source = d.querySelector('#performance-source');
  source.value = 'paid';
  source.dispatchEvent(new w.Event('change', {bubbles: true}));
  assert.equal(d.querySelector('[data-metric="impressions"]').textContent, '1,200');
  assert.equal(d.querySelector('[data-metric="revenue"]').textContent, '$310.00');

  const promotion = d.querySelector('#performance-promotion');
  promotion.value = 'offer-empty';
  promotion.dispatchEvent(new w.Event('change', {bubbles: true}));
  assert.equal(d.querySelector('#performance-empty').hidden, false);
  assert.equal(d.querySelector('[data-metric="impressions"]').textContent, 'No data');
  assert.equal(d.querySelector('#performance-events').textContent.trim(), 'No billable activity for this period.');
});
