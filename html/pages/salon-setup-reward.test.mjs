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
  ['ai-offers', 'AI Offers', 'AI Offers'],
  ['customers', 'Customers', 'Customers'],
  ['loyalty-activity', 'Activity', 'Loyalty Activity'],
  ['analytics', 'Analytics', 'Analytics']
];

test('uses seven synchronized loyalty management tabs and submenu items', () => {
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

test('keeps points-earning Bonus Points out of the Reward Catalog picker', () => {
  const html = source();
  const rewardCatalog = html.match(/id="panel-reward-catalog"[\s\S]*?(?=\n            <section class="tab-panel" id="panel-customers")/);
  assert.ok(rewardCatalog, 'missing Reward Catalog panel');
  assert.match(rewardCatalog[0], /data-reward-type[^>]*data-reward-value="\$5\.00"/);
  assert.match(rewardCatalog[0], /data-reward-type[^>]*data-reward-value="15% off"/);
  assert.match(rewardCatalog[0], /data-reward-type[^>]*data-reward-value="Free Gel Add-on"/);
  assert.doesNotMatch(rewardCatalog[0], /<b>Bonus Points<\/b>/);
  assert.match(html, /<h3>Bonus events<\/h3>/);
});

test('keeps Create Reward focused on points redemption', () => {
  const html = source();
  const rewardCatalog = html.match(/id="panel-reward-catalog"[\s\S]*?(?=\n            <section class="tab-panel" id="panel-ai-offers")/);
  assert.ok(rewardCatalog, 'missing Reward Catalog panel');
  for (const type of ['gift_card', 'dollar_discount', 'percent_discount', 'free_service', 'free_product']) {
    assert.match(rewardCatalog[0], new RegExp(`data-reward-type-key="${type}"`));
  }
  assert.match(rewardCatalog[0], /data-reward-points-input/);
  assert.match(rewardCatalog[0], /data-reward-minimum-spend-input/);
  assert.match(rewardCatalog[0], /data-reward-maximum-discount-input/);
  assert.doesNotMatch(rewardCatalog[0], /After Verified Review|After Tip|After Visit|After Referral/);
  assert.doesNotMatch(rewardCatalog[0], /Review Window|SMS Guest Fallback|Push Notification/);
});

test('persists redemption settings when creating reward cards', () => {
  const html = source();
  assert.match(html, /function getRewardDraft\(\)[\s\S]*?pointsCost:/);
  assert.match(html, /function getRewardDraft\(\)[\s\S]*?minimumSpend:/);
  assert.match(html, /function getRewardDraft\(\)[\s\S]*?maximumDiscount:/);
  assert.match(html, /function getRewardDraft\(\)[\s\S]*?eligibleServices:/);
  assert.match(html, /function getRewardDraft\(\)[\s\S]*?validLocations:/);
  assert.match(html, /function programInnerHTML\(dateLabel, draft\)/);
  assert.match(html, /var rewardTypeCards = document\.querySelectorAll\('\[data-reward-builder\] \[data-reward-type\]'\)/);
  assert.match(html, /var defaultType = document\.querySelector\('\[data-reward-builder\] \[data-reward-type-key="gift_card"\]'\)/);
  assert.match(html, /data-reward-points/);
  assert.match(html, /data-reward-minimum-spend/);
});

test('uses a single-screen Create Reward form', () => {
  const html = source();
  assert.match(html, /data-reward-form/);
  assert.match(html, /data-reward-section="details"/);
  assert.match(html, /data-reward-advanced="redemption"/);
  assert.match(html, /data-reward-advanced="availability"/);
  assert.match(html, /data-reward-preview/);
  assert.match(html, /<button class="btn g" type="button" data-publish-reward>Publish Reward<\/button>/);
  assert.doesNotMatch(html, /data-reward-steps|data-wizard-step|data-wizard-next|data-wizard-back|data-wizard-save/);
  assert.doesNotMatch(html, />3 steps<|>Continue <|>Back<\/button>/);
});

test('uses progressive disclosure for advanced reward settings', () => {
  const html = source();
  assert.match(html, /<details class="reward-disclosure" data-reward-advanced="redemption">/);
  assert.match(html, /<summary>More redemption rules<\/summary>/);
  assert.match(html, /<details class="reward-disclosure" data-reward-advanced="availability">/);
  assert.match(html, /<summary>Availability &amp; limits<\/summary>/);
  assert.doesNotMatch(html, /data-reward-advanced="redemption" open|data-reward-advanced="availability" open/);
  assert.match(html, /data-reward-contextual="minimum-spend"/);
  assert.match(html, /data-reward-contextual="maximum-discount"/);
  assert.match(html, /function updateRewardContext\(\)/);
});

test('keeps the second confirmation modal as a compact summary', () => {
  const html = source();
  assert.match(html, /function buildRewardConfirmationHTML\(draft\)/);
  assert.match(html, /Back &amp; edit|Back & edit/);
  assert.match(html, /confirmButtonText: editing \? 'Save changes' : 'Confirm & create'/);
  assert.match(html, /html: buildRewardConfirmationHTML\(draft\)/);
});

test('adds AI Offers as a separate loyalty management tab', () => {
  const html = source();
  assert.match(html, /data-nav-subitem-target="ai-offers"[^>]*>AI Offers<\/button>/);
  assert.match(html, /class="page-tab[^"]*"[^>]*data-tab-target="ai-offers"[\s\S]*?<span>AI Offers<\/span>/);
  assert.match(html, /id="panel-ai-offers"[^>]*data-tab-panel="ai-offers"/);
  assert.match(html, /id="panel-reward-catalog"[^>]*data-tab-panel="reward-catalog"/);
});

test('shows anonymous demand and reviewable AI offer suggestions', () => {
  const html = source();
  const panel = html.match(/id="panel-ai-offers"[\s\S]*?(?=\n            <section class="tab-panel" id="panel-customers")/);
  assert.ok(panel, 'missing AI Offers panel');
  assert.match(panel[0], /Customer demand near you/);
  assert.match(panel[0], /12[\s\S]*pedicure deal/);
  assert.match(panel[0], /7[\s\S]*Gel-X under \$60/);
  assert.match(panel[0], /data-ai-offer-card="pedi"/);
  assert.match(panel[0], /data-ai-offer-card="gelx"/);
  assert.match(panel[0], /AI only suggests/);
  assert.match(panel[0], /Customer identity is never revealed/);
  assert.match(panel[0], /data-ai-offer-review/);
  assert.match(panel[0], /data-ai-offer-dismiss/);
});

test('provides an AI offer editor and publish interaction hooks', () => {
  const html = source();
  assert.match(html, /data-ai-offer-dialog hidden/);
  assert.match(html, /data-ai-offer-field="title"/);
  assert.match(html, /data-ai-offer-field="value"/);
  assert.match(html, /data-ai-offer-field="schedule"/);
  assert.match(html, /data-ai-offer-publish/);
  assert.match(html, /function openAiOfferEditor\(offerId\)/);
  assert.match(html, /function dismissAiOffer\(offerId\)/);
  assert.match(html, /function publishAiOffer\(event\)/);
  assert.match(html, /data-ai-offer-review/);
  assert.match(html, /data-ai-offer-dismiss/);
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
