import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const REWARD_PAGE = new URL('./salon-setup-reward.html', import.meta.url);

function source() {
  return readFileSync(REWARD_PAGE, 'utf8');
}

const sections = [
  ['overview', 'Overview', 'Overview'],
  ['earn-rules', 'Earn Rules', 'Earn Rules'],
  ['reward-catalog', 'Reward Catalog', 'Reward Catalog'],
  ['customers', 'Customers', 'Customers'],
  ['loyalty-activity', 'Activity', 'Loyalty Activity'],
  ['analytics', 'Analytics', 'Analytics']
];

test('uses six synchronized loyalty management tabs and submenu items', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Rewards<\/title>/);
  for (const [target, tabLabel, submenuLabel] of sections) {
    assert.match(html, new RegExp(`class="page-tab[^\"]*"[^>]*data-tab-target="${target}"[^>]*aria-controls="panel-${target}"[\\s\\S]*?<span>${tabLabel}<\\/span>`));
    assert.match(html, new RegExp(`data-nav-subitem-target="${target}"[^>]*>${submenuLabel}<\\/button>`));
    assert.match(html, new RegExp(`id="panel-${target}"[^>]*data-tab-panel="${target}"`));
  }
  assert.match(html, /data-tab-target="overview"[^>]*aria-selected="true"/);
});

test('adapts the loyalty management content from the customer mockup', () => {
  const html = source();
  for (const content of [
    'Active members', 'Program health', 'Recent redemptions', 'Reward performance',
    'Base earning', 'Bonus events', 'Point lifecycle',
    'Supported types', 'Free Gel Add-on', '$10 Come Back',
    'Customer Wallets', 'Available points', 'View wallet',
    'Loyalty Activity', 'Immutable point and reward history', 'Audit policy',
    'Reward cost', 'Influenced revenue', 'Returning customers', 'Points expiring soon'
  ]) {
    assert.ok(html.includes(content), `missing loyalty content: ${content}`);
  }
});

test('keeps the existing reward builder inside Reward Catalog', () => {
  const html = source();
  assert.match(html, /id="panel-reward-catalog"[\s\S]*?data-reward-catalog-view[\s\S]*?data-show-reward-builder[\s\S]*?data-reward-builder hidden/);
  assert.match(html, /data-reward-builder[\s\S]*?data-create-title>Create Reward/);
  assert.match(html, /function showRewardBuilder\(open\)/);
  assert.match(html, /activateMainTab\('reward-catalog'\)/);
});

test('renders and updates the Redemptions and return revenue chart', () => {
  const html = source();
  assert.match(html, /<select[^>]*data-loyalty-analytics-range[^>]*aria-label="Analytics date range"/);
  assert.match(html, /<option value="17d" selected>Jul 1–17, 2026<\/option>/);
  assert.match(html, /data-loyalty-analytics-chart[^>]*role="img"/);
  assert.match(html, /data-chart-series="revenue"/);
  assert.match(html, /data-chart-series="redemptions"/);
  assert.match(html, /data-analytics-revenue-total/);
  assert.match(html, /data-analytics-redemptions-total/);
  assert.match(html, /const LOYALTY_ANALYTICS_RANGES =/);
  assert.match(html, /function renderLoyaltyAnalytics\(rangeKey\)/);
  assert.match(html, /loyaltyAnalyticsRange\.addEventListener\('change'/);
  assert.match(html, /<title>' \+ label \+ ': \$' \+ revenue/);
  assert.match(html, /<title>' \+ label \+ ': ' \+ redemptions \+ ' redemptions/);
});

test('recalculates chart totals and SVG series when the analytics range changes', () => {
  const html = source();
  const analyticsScript = html.match(/const LOYALTY_ANALYTICS_RANGES =[\s\S]*?(?=\n    document\.querySelectorAll\('\[data-view-wallet\]')/);
  assert.ok(analyticsScript, 'missing executable loyalty analytics script');

  const chart = {
    innerHTML: '',
    ariaLabel: '',
    setAttribute(name, value) {
      if (name === 'aria-label') this.ariaLabel = value;
    }
  };
  const range = {
    value: '17d',
    changeHandler: null,
    addEventListener(eventName, handler) {
      if (eventName === 'change') this.changeHandler = handler;
    }
  };
  const revenueTotal = { textContent: '' };
  const redemptionsTotal = { textContent: '' };
  const period = { textContent: '' };
  const nodes = new Map([
    ['[data-loyalty-analytics-chart]', chart],
    ['[data-loyalty-analytics-range]', range],
    ['[data-analytics-revenue-total]', revenueTotal],
    ['[data-analytics-redemptions-total]', redemptionsTotal],
    ['[data-loyalty-chart-period]', period]
  ]);

  vm.runInNewContext(analyticsScript[0], {
    document: { querySelector(selector) { return nodes.get(selector) || null; } }
  });

  assert.equal(revenueTotal.textContent, '$12,840');
  assert.equal(redemptionsTotal.textContent, '261');
  assert.match(chart.innerHTML, /data-chart-series="revenue"/);
  assert.match(chart.innerHTML, /data-chart-series="redemptions"/);
  assert.equal(typeof range.changeHandler, 'function');

  range.value = '30d';
  range.changeHandler();
  assert.equal(revenueTotal.textContent, '$21,460');
  assert.equal(redemptionsTotal.textContent, '438');
  assert.equal(period.textContent, 'Performance across the last 30 days');
  assert.match(chart.ariaLabel, /438 redemptions and \$21,460 return revenue/);
});
