import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const COMMUNITY_URL = new URL('./community.html', import.meta.url);
const COMMUNITY_CSS_URL = new URL('../assets/community-page.css', import.meta.url);

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

test('starts the five page tabs with one roving keyboard stop and a visible focus ring', () => {
  const html = source();
  assert.match(html, /class="page-tab is-active"[^>]*role="tab"[^>]*aria-selected="true"[^>]*tabindex="0"[^>]*data-tab-target="feed"/);
  for (const tab of ['groups', 'learning', 'jobs', 'events']) {
    assert.match(html, new RegExp(`class="page-tab"[^>]*role="tab"[^>]*aria-selected="false"[^>]*tabindex="-1"[^>]*data-tab-target="${tab}"`));
  }
  assert.equal((html.match(/class="page-tab[^\"]*"[^>]*aria-selected="true"/g) || []).length, 1);
  assert.match(html, /\.page-tab:focus-visible\s*\{[^}]*outline:\s*2px\s+solid/);
});

test('keeps Feed active by default and synchronizes submenu and page tabs', () => {
  const html = source();
  const runtime = readFileSync(new URL('../assets/community-page.js', import.meta.url), 'utf8');
  assert.match(html, /class="nav-subitem is-active"[^>]*data-tab-target="feed"[^>]*aria-controls="panel-feed"/);
  assert.match(html, /class="page-tab is-active"[^>]*aria-selected="true"[^>]*data-tab-target="feed"/);
  assert.match(html, /class="tab-panel is-active"[^>]*id="panel-feed"[^>]*data-tab-panel="feed"/);
  assert.match(runtime, /document\.querySelectorAll\('\[data-tab-target\]'\)/);
  assert.match(runtime, /panels\[index\]\.hidden = !panelActive/);
  assert.match(runtime, /window\.NEXORA_SHELL\.setActiveTab\(tabId\)/);
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
  assert.match(html, /data-feed-attachment-status/);
  assert.match(html, /data-feed-attachment-clear/);
  assert.match(html, /data-feed-filter="announcements"/);
  assert.match(html, /data-feed-list/);
  assert.match(html, /Needs your attention/);
  assert.match(html, /Community insights/);
});

test('renders multi-group management and a privacy-aware Create Group dialog', () => {
  const html = source();
  for (const copy of ['Total groups', 'Total members', 'Unread messages', 'Pending requests']) assert.match(html, new RegExp(copy));
  for (const type of ['all', 'staff', 'customer', 'mixed', 'archived']) assert.match(html, new RegExp(`data-group-filter="${type}"`));
  assert.match(html, /data-group-search/);
  assert.match(html, /data-group-grid/);
  assert.match(html, /data-create-group-open/);
  assert.match(html, /role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="create-group-title"/);
  for (const name of ['groupName', 'groupDescription', 'groupType', 'groupVisibility', 'groupPosting']) assert.match(html, new RegExp(`name="${name}"`));
  assert.match(html, /data-mixed-privacy-confirm/);
  assert.match(html, /data-group-settings-dialog/);
  for (const name of ['manageGroupDescription', 'manageGroupVisibility', 'manageGroupPosting']) assert.match(html, new RegExp(`name="${name}"`));
});

test('renders the group chat, thread, member, and moderation workspace', () => {
  const html = source();
  for (const marker of ['data-group-list-view', 'data-group-chat-view', 'data-message-list', 'data-group-member-rail', 'data-group-thread-panel', 'data-message-composer']) assert.match(html, new RegExp(marker));
  for (const copy of ['Back to Groups', 'Join Requests', 'Pinned Messages']) assert.match(html, new RegExp(copy));
  assert.match(html, /aria-label="Search messages"/);
  assert.match(html, /data-message-search-input/);
  assert.match(html, /data-message-attachment-status/);
  assert.match(html, /aria-expanded="false"[^>]*aria-controls="group-member-panel"[^>]*data-members-open/);
  assert.match(html, /id="group-member-panel"[^>]*tabindex="-1"[^>]*aria-label="Group members"[^>]*data-group-member-rail/);
  assert.match(html, /aria-label="Close members"[^>]*data-members-close/);
  assert.match(html, /id="group-thread-panel"[^>]*aria-label="Message thread"[^>]*data-group-thread-panel/);
  assert.equal((html.match(/data-group-overlay-background/g) || []).length, 2);
  assert.match(html, /aria-label="Close thread"/);
  assert.match(html, /aria-label="Attach photo"/);
  assert.match(html, /aria-label="Attach file"/);
});

test('renders owner Learning recommendations, progress, workshop, and sharing', () => {
  const html = source();
  for (const copy of ['Recommended for your salon', 'Continue Learning', 'Saved resources', 'Upcoming live workshop', 'Share to Staff Group']) assert.match(html, new RegExp(copy));
  for (const category of ['operations', 'marketing', 'team-management', 'customer-experience']) assert.match(html, new RegExp(`data-course-filter="${category}"`));
  assert.match(html, /data-course-grid/);
  assert.match(html, /data-share-course-dialog/);
});

test('adds owner job metrics, filters, pipeline, and management actions', () => {
  const html = source();
  for (const copy of ['Create Job Post', 'Active Posts', 'New Matches', 'Contact Requests', 'Interviews', 'Matched', 'Contact Requested', 'Interviewing', 'Closed', 'Save Candidate', 'Share with manager']) assert.match(html, new RegExp(copy));
  for (const filter of ['skill', 'distance', 'availability', 'compensation']) assert.match(html, new RegExp(`data-candidate-filter="${filter}"`));
  assert.match(html, /data-create-job-dialog/);
  assert.match(html, /data-active-job-list/);
  assert.match(html, /data-job-metric="active-posts"/);
  assert.match(html, /data-job-empty[^>]*role="status"/);
  assert.match(html, /data-job-clear-filters/);
});

test('gives every Community filter, Event view, and initial RSVP selection programmatic state', () => {
  const html = source();
  const runtime = readFileSync(new URL('../assets/community-page.js', import.meta.url), 'utf8');
  for (const attribute of ['data-feed-filter', 'data-group-filter', 'data-course-filter', 'data-event-filter', 'data-event-view']) {
    const buttons = [...html.matchAll(new RegExp(`<button[^>]*${attribute}="[^"]+"[^>]*>`, 'g'))].map((match) => match[0]);
    assert.ok(buttons.length >= 2, `${attribute} must render a selection set`);
    assert.ok(buttons.every((button) => /aria-pressed="(?:true|false)"/.test(button)), `${attribute} must expose aria-pressed`);
    assert.equal(buttons.filter((button) => /aria-pressed="true"/.test(button)).length, 1, `${attribute} must start with one pressed control`);
  }
  assert.match(runtime, /data-event-rsvp[\s\S]*aria-pressed/);
});

test('renders event views, filters, RSVP details, and creation controls', () => {
  const html = source();
  for (const copy of ['Create Event', 'List', 'Calendar', 'RSVP', 'Attendees', 'Linked group', 'Reminder']) assert.match(html, new RegExp(copy));
  for (const type of ['all', 'staff-training', 'customer-event', 'promotion', 'industry']) assert.match(html, new RegExp(`data-event-filter="${type}"`));
  assert.match(html, /data-event-list/);
  assert.match(html, /data-event-calendar/);
  for (const name of ['eventTitle', 'eventDescription', 'eventType', 'eventStart', 'eventEnd', 'eventMode', 'eventLocation', 'eventAudience', 'eventCapacity', 'eventRsvp', 'eventReminder']) assert.match(html, new RegExp(`name="${name}"`));
});

test('keeps dialogs, notices, tabs, and shared shell accessible and connected', () => {
  const html = source();
  const dialogs = [...html.matchAll(/<[^>]+role="dialog"[^>]*>/g)].map((match) => match[0]);
  assert.ok(dialogs.length >= 4);
  for (const dialog of dialogs) {
    assert.match(dialog, /aria-modal="true"/);
    assert.match(dialog, /aria-labelledby="[^"]+"/);
  }
  assert.match(html, /data-community-notice[^>]*role="status"[^>]*aria-live="polite"/);
  for (const tab of ['feed', 'groups', 'learning', 'jobs', 'events']) {
    assert.equal((html.match(new RegExp(`id="panel-${tab}"`, 'g')) || []).length, 1);
  }
  assert.match(html, /activePage:\s*'community'/);
  assert.match(html, /onNavigate:\s*activateCommunityTab/);
});

test('provides responsive Community layouts, reduced motion, and legible focus and text', () => {
  const html = source();
  const css = readFileSync(COMMUNITY_CSS_URL, 'utf8');
  const inlineCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('\n');
  const assetSizes = [...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
  const inlineSizes = [...inlineCss.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
  assert.ok(assetSizes.length > 0);
  assert.ok(inlineSizes.length > 0);
  assert.ok(assetSizes.every((size) => size >= 11), `Community asset CSS contains text smaller than 11px: ${assetSizes.filter((size) => size < 11).join(', ')}`);
  assert.ok(inlineSizes.every((size) => size >= 11), `Community page CSS contains text smaller than 11px: ${inlineSizes.filter((size) => size < 11).join(', ')}`);
  assert.match(css, /\.community-dialog-backdrop\[hidden\]\s*\{[^}]*display:\s*none!important/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*2px\s+solid/);
  assert.doesNotMatch(css, /outline:\s*(?:[3-9]|\d{2,})px/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.community-dialog-backdrop\s*\{[^}]*padding:\s*16px/);
  assert.doesNotMatch(css, /@media\s*\(max-width:\s*900px\)\{[^\n]*\.group-member-rail:not\(\.is-mobile-open\)\{display:none\}/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[^\n]*\.group-member-rail:not\(\.is-mobile-open\)\{display:none\}/);
  assert.match(css, /\.group-member-rail>h3~h3\{margin-top:22px\}/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.community-dialog[\s\S]*?\.community-notice[\s\S]*?\.group-thread-panel[^{]*\{[^}]*transition:\s*none!important/);
});

test('uses the Nexora palette for Learning surfaces', () => {
  const css = readFileSync(COMMUNITY_CSS_URL, 'utf8');
  const learningStart = css.indexOf('.learning-hero');
  const learningEnd = css.indexOf('.owner-jobs-heading-actions');
  const learningCss = css.slice(learningStart, learningEnd);
  assert.ok(learningStart >= 0 && learningEnd > learningStart);
  assert.doesNotMatch(learningCss, /#[0-9a-f]{3,8}\b/i);
});

test('removes the unused legacy Owner Jobs notice styling', () => {
  assert.doesNotMatch(source(), /\.owner-jobs-notice\s*\{/);
});
