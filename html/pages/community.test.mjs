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
  assert.match(html, /class="nav-subitem is-active"[^>]*data-tab-target="feed"[^>]*aria-controls="panel-feed"/);
  assert.match(html, /class="page-tab is-active"[^>]*aria-selected="true"[^>]*data-tab-target="feed"/);
  assert.match(html, /class="tab-panel is-active"[^>]*id="panel-feed"[^>]*data-tab-panel="feed"/);
  assert.match(html, /document\.querySelectorAll\('\[data-tab-target\]'\)/);
  assert.match(html, /panel\.hidden = !isActive/);
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
