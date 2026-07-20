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

test('renders one Booking Book-style page tab for every Community submenu', () => {
  const html = source();
  assert.match(html, /class="page-tabs" role="tablist" aria-label="Community sections"/);
  for (const tab of ['feed', 'groups', 'learning', 'jobs', 'events']) {
    assert.match(html, new RegExp(`class="page-tab[^\"]*"[^>]*data-tab-target="${tab}"[^>]*aria-controls="panel-${tab}"`));
    assert.match(html, new RegExp(`id="panel-${tab}"[^>]*data-tab-panel="${tab}"`));
  }
});

test('keeps Feed active by default and synchronizes submenu and page tabs', () => {
  const html = source();
  const runtime = readFileSync(new URL('../assets/community-page.js', import.meta.url), 'utf8');
  assert.match(html, /class="nav-subitem is-active"[^>]*data-tab-target="feed"[^>]*aria-controls="panel-feed"/);
  assert.match(html, /class="page-tab is-active"[^>]*aria-selected="true"[^>]*data-tab-target="feed"/);
  assert.match(html, /class="tab-panel is-active"[^>]*id="panel-feed"[^>]*data-tab-panel="feed"/);
  assert.match(runtime, /document\.querySelectorAll\('\[data-tab-target\]'\)/);
  assert.match(runtime, /panels\[index\]\.hidden = !panelActive/);
});

test('adapts the salon Owner side of the AI Matching mockup', () => {
  const html = source();
  assert.match(html, /Owner Jobs/);
  assert.match(html, /Gel-X techs are job-hunting within 10 miles of you/);
  assert.match(html, /Anonymous candidates for your post/);
  assert.match(html, /Tech #A7 — Gel-X · Design · 5 yrs/);
  assert.match(html, /94% match/);
  assert.match(html, /Tech #C2 — Gel-X · Pedicure · 2 yrs/);
  assert.match(html, /71% match/);
  assert.match(html, /AI ranks anonymous tech profiles/);
  assert.match(html, /Contact is a two-way door/);
  assert.match(html, /data-owner-job-action="request-contact"/);
  assert.match(html, /data-owner-job-action="dismiss"/);
});

test('keeps Owner Jobs action buttons sized to their content', () => {
  const html = source();
  assert.equal((html.match(/class="owner-job-actions"/g) || []).length, 2);
  assert.match(html, /\.owner-job-actions\s*\{[\s\S]*?display:\s*flex;/);
  assert.match(html, /\.owner-action\s*\{[\s\S]*?width:\s*fit-content;[\s\S]*?flex:\s*0 0 auto;/);
});

test('loads the page-scoped Community assets and renders the owner Feed regions', () => {
  const html = source();
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/community-page\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/community-page\.js"><\/script>/);
  assert.match(html, /data-feed-composer/);
  assert.match(html, /data-feed-audience/);
  assert.match(html, /data-feed-filter="announcements"/);
  assert.match(html, /data-feed-list/);
  assert.match(html, /Needs your attention/);
  assert.match(html, /Community insights/);
});
