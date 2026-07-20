import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const COMMUNITY_URL = new URL('./community.html', import.meta.url);

function source() {
  assert.ok(existsSync(COMMUNITY_URL), 'community.html must exist');
  return readFileSync(COMMUNITY_URL, 'utf8');
}

test('creates the Community page from the dashboard shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Community<\/title>/);
  assert.match(html, /<aside class="sidebar"/);
  assert.match(html, /<header class="header">/);
  assert.match(html, /<main class="content" aria-label="Community content">/);
  assert.match(html, /<h1 class="page-title">Community<\/h1>/);
});

test('shows the expanded Community submenu from the reference', () => {
  const html = source();
  assert.match(html, /class="nav-item nav-parent is-expanded"[^>]*aria-expanded="true"[^>]*aria-controls="community-subnav"/);
  assert.match(html, /data-lucide="users-round"[^>]*>[\s\S]*?<span>Community<\/span>/);
  assert.match(html, /class="nav-subnav" id="community-subnav" data-nav-subnav/);
  for (const item of ['Feed', 'Groups', 'Learning', 'Jobs', 'Events']) {
    assert.match(html, new RegExp(`<span>${item}<\\/span>`));
  }
  assert.match(html, /class="nav-subitem is-active"[^>]*>[\s\S]*?<span>Feed<\/span>/);
});

test('does not render page tabs or tab content', () => {
  const html = source();
  assert.doesNotMatch(html, /class="page-tabs/);
  assert.doesNotMatch(html, /class="tab-content/);
  assert.doesNotMatch(html, /data-tab-panel=/);
  assert.doesNotMatch(html, /role="tabpanel"/);
});
