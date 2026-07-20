import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const REWARD_PAGE = new URL('./salon-setup-reward.html', import.meta.url);

function source() {
  return readFileSync(REWARD_PAGE, 'utf8');
}

const sections = [
  ['overview', 'Overview'],
  ['earn-rules', 'Earn Rules'],
  ['reward-catalog', 'Reward Catalog'],
  ['customers', 'Customers'],
  ['loyalty-activity', 'Activity'],
  ['analytics', 'Analytics']
];

test('uses six synchronized loyalty management tabs and submenu items', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Rewards<\/title>/);
  for (const [target, label] of sections) {
    assert.match(html, new RegExp(`class="page-tab[^\"]*"[^>]*data-tab-target="${target}"[^>]*aria-controls="panel-${target}"[\\s\\S]*?<span>${label}<\\/span>`));
    assert.match(html, new RegExp(`data-nav-subitem-target="${target}"[^>]*>${label}<\\/button>`));
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
