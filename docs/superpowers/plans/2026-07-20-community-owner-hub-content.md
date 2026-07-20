# Community Owner Hub Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the five existing Community tabs with an interactive salon-owner hub for feed activity, multiple groups and chat, learning, hiring, and events while leaving the shared sidebar unchanged.

**Architecture:** Keep the semantic tab panels in `community.html`, load one page-scoped stylesheet, and move Community state and interactions into one page-scoped classic JavaScript asset. The JavaScript exposes pure state operations through `window.NEXORA_COMMUNITY` for dependency-free Node tests and exposes `window.activateCommunityTab` for the existing shared-shell callback.

**Tech Stack:** HTML5, CSS3, browser JavaScript ES5-compatible syntax, Lucide icons, Node.js built-in test runner, Node `vm` for state-operation tests.

## Global Constraints

- Keep the existing shared sidebar, the five page tabs, and their names: Feed, Groups, Learning, Jobs, and Events.
- The page is an owner/manager merchant UI; staff and customers are represented only as group members.
- Support multiple Staff, Customer, and Mixed groups.
- Staff groups are private and invite-only; Customer groups are private by default; Mixed groups are private and require explicit privacy acknowledgement.
- Demo state is browser-session-only and resets on refresh.
- Do not implement a backend, real-time networking, authentication, real uploads, notification delivery, or customer/staff application screens.
- Keep UI copy in English to match the existing Community page.
- Preserve the Jobs identity-sharing and employment guardrail copy.
- Use the existing Nexora visual tokens and Lucide icon library; add no dependencies.

## File Structure

- Modify `html/pages/community.html` — semantic tab content, dialogs, asset links, and shared-shell configuration.
- Modify `html/pages/community.test.mjs` — source-level structure, accessibility, and regression assertions.
- Create `html/assets/community-page.css` — styles only for Community content and responsive components; no shared sidebar rules.
- Create `html/assets/community-page.js` — page state, pure state operations, renderers, event delegation, dialog behavior, and tab activation.
- Create `html/assets/community-page.test.mjs` — dependency-free tests for the state operations exposed by the page script.

The approved design is `docs/superpowers/specs/2026-07-20-community-owner-hub-content-design.md`.

---

### Task 1: Extract the Community runtime and build the Feed tab

**Files:**
- Create: `html/assets/community-page.css`
- Create: `html/assets/community-page.js`
- Create: `html/assets/community-page.test.mjs`
- Modify: `html/pages/community.html:6659,6871-6878,6984-7074`
- Modify: `html/pages/community.test.mjs`

**Interfaces:**
- Consumes: existing `[data-tab-target]`, `[data-tab-panel]`, and `window.NEXORA_SHELL.onNavigate` integration.
- Produces: `window.activateCommunityTab(tabId)`, `window.NEXORA_COMMUNITY`, `addFeedPost(text, audience)`, `filterFeedPosts(filter)`, `togglePostReaction(postId, emoji)`, `addFeedComment(postId, body)`, `toggleSavedPost(postId)`, `togglePinnedPost(postId)`, and shared `showCommunityNotice(message)` behavior used by later tasks.

- [ ] **Step 1: Add failing source assertions for the page assets and Feed regions**

Append this test to `html/pages/community.test.mjs`:

```js
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
```

- [ ] **Step 2: Create a failing runtime test harness**

Create `html/assets/community-page.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SCRIPT_URL = new URL('./community-page.js', import.meta.url);

function loadApi() {
  const document = {
    readyState: 'loading',
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    body: { appendChild() {} }
  };
  const window = {
    document,
    location: { search: '' },
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(readFileSync(SCRIPT_URL, 'utf8'), {
    window,
    document,
    URLSearchParams,
    setTimeout,
    clearTimeout,
    console
  });
  return window.NEXORA_COMMUNITY;
}

test('adds and filters owner Feed posts', () => {
  const api = loadApi();
  assert.equal(api.addFeedPost('  ', 'all').ok, false);
  const result = api.addFeedPost('Team meeting moves to 8:30 AM.', 'staff');
  assert.equal(result.ok, true);
  assert.equal(api.filterFeedPosts('staff')[0].body, 'Team meeting moves to 8:30 AM.');
  assert.ok(api.filterFeedPosts('announcements').every((post) => post.kind === 'announcement'));
  assert.equal(api.togglePostReaction('feed-announcement-1', '👍').ok, true);
  assert.equal(api.addFeedComment('feed-announcement-1', 'Confirmed.').ok, true);
  assert.equal(api.toggleSavedPost('feed-announcement-1').post.saved, true);
  assert.equal(api.togglePinnedPost('feed-announcement-1').post.pinned, true);
});

export { loadApi };
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
node --test html/pages/community.test.mjs html/assets/community-page.test.mjs
```

Expected: FAIL because `community-page.js`, the asset links, and Feed regions do not exist.

- [ ] **Step 4: Add the Feed semantic structure and page asset links**

Add the stylesheet after `nexora-shell.css`, replace the Feed placeholder, load `community-page.js` before the shell configuration, and retain the five current page tabs. The Feed panel structure must be:

```html
<section class="tab-panel is-active" id="panel-feed" data-tab-panel="feed" role="tabpanel" aria-label="Community Feed">
  <div class="community-panel-head">
    <div><span class="community-eyebrow">Owner community</span><h2>Feed</h2><p>Stay on top of conversations across every salon group.</p></div>
    <button class="community-primary" type="button" data-focus-feed-composer><i data-lucide="square-pen" aria-hidden="true"></i>Create post</button>
  </div>
  <div class="community-layout community-layout-feed">
    <div class="community-main-stack">
      <form class="feed-composer community-card" data-feed-composer>
        <label for="community-post-body">Share an update</label>
        <textarea id="community-post-body" rows="3" placeholder="Share an announcement, question, or update..."></textarea>
        <div class="feed-composer-actions">
          <select aria-label="Post audience" data-feed-audience><option value="all">All groups</option><option value="staff">Staff groups</option><option value="customer">Customer groups</option></select>
          <button type="button" data-demo-attachment="photo">Photo</button><button type="button" data-demo-attachment="file">File</button><button type="button" data-demo-attachment="poll">Poll</button>
          <button class="community-primary" type="submit">Post</button>
        </div>
        <p class="community-field-error" data-feed-error aria-live="polite"></p>
      </form>
      <div class="community-filter-row" aria-label="Feed filters">
        <button class="is-active" type="button" data-feed-filter="all">All</button><button type="button" data-feed-filter="announcements">Announcements</button><button type="button" data-feed-filter="staff">Staff</button><button type="button" data-feed-filter="customer">Customers</button><button type="button" data-feed-filter="saved">Saved</button>
      </div>
      <div class="feed-list" data-feed-list></div>
    </div>
    <aside class="community-side-stack">
      <section class="community-card attention-card"><h3>Needs your attention</h3><button type="button"><strong>3</strong><span>Pending join requests</span></button><button type="button"><strong>2</strong><span>Customer questions</span></button><button type="button"><strong>1</strong><span>Reported message</span></button></section>
      <section class="community-card insight-card"><h3>Community insights</h3><dl><div><dt>Active members</dt><dd>86</dd></div><div><dt>Engagement</dt><dd>+18%</dd></div><div><dt>Top group</dt><dd>VIP Nail Club</dd></div><div><dt>Avg. response</dt><dd>24 min</dd></div></dl></section>
    </aside>
  </div>
</section>
```

- [ ] **Step 5: Implement the base runtime and Feed state operations**

Create `community-page.js` as an IIFE. Use these three initial posts:

```js
state.posts = [
  { id:'feed-announcement-1', kind:'announcement', audience:'staff', author:'Nexora Touch', role:'Owner', group:'Nexora Touch Staff', time:'12 min ago', body:'Friday hours are updated. Please review your station coverage before 4 PM.', reactions:{ '👍':4 }, comments:[], saved:false, pinned:false },
  { id:'feed-customer-1', kind:'post', audience:'customer', author:'Maya Lewis', role:'VIP Customer', group:'VIP Nail Club', time:'34 min ago', body:'Which summer chrome shade works best with short almond nails?', reactions:{ '💜':6 }, comments:[], saved:false, pinned:false },
  { id:'feed-staff-1', kind:'post', audience:'staff', author:'Mia Tran', role:'Admin', group:'Nexora Touch Staff', time:'1 hr ago', body:'The new Gel-X color cards are ready at station two.', reactions:{ '✨':3 }, comments:[], saved:false, pinned:false }
];
```

Implement `escapeHtml`, `activateCommunityTab`, all eight Feed interfaces, render cards into `[data-feed-list]`, and bind Feed controls through event delegation. Export the API exactly as:

```js
window.NEXORA_COMMUNITY = {
  state: state,
  addFeedPost: addFeedPost,
  filterFeedPosts: filterFeedPosts,
  togglePostReaction: togglePostReaction,
  addFeedComment: addFeedComment,
  toggleSavedPost: toggleSavedPost,
  togglePinnedPost: togglePinnedPost,
  activateTab: activateCommunityTab
};
window.activateCommunityTab = activateCommunityTab;
```

`addFeedPost` returns `{ ok: false, error: 'Write something before posting.' }` for blank input and `{ ok: true, post: createdPost }` for valid input. New posts use kind `post`, author `Nexora Touch`, role `Owner`, and timestamp `Just now`.

- [ ] **Step 6: Add the shared Community and Feed styles**

In `community-page.css`, define the reusable classes used above and the Feed card layout. Use these exact layout constraints:

```css
.community-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:20px}.community-eyebrow{color:var(--nexora-electric);font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.community-panel-head h2{margin:4px 0 6px;color:var(--nexora-ink);font-size:28px}.community-panel-head p{margin:0;color:var(--nexora-muted);font-size:14px}.community-primary{display:inline-flex;min-height:40px;align-items:center;justify-content:center;gap:8px;border:0;border-radius:10px;background:linear-gradient(135deg,var(--nexora-electric),var(--nexora-violet));padding:0 16px;color:#fff;font-weight:800}.community-card{border:1px solid var(--nexora-border);border-radius:16px;background:#fff;box-shadow:0 10px 28px rgba(8,31,73,.06)}.community-layout{display:grid;gap:20px}.community-layout-feed{grid-template-columns:minmax(0,1fr) 280px}.community-main-stack,.community-side-stack{display:grid;align-content:start;gap:16px}.feed-composer{padding:18px}.feed-composer textarea{width:100%;margin-top:10px;resize:vertical}.feed-composer-actions,.community-filter-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.feed-list{display:grid;gap:14px}.feed-post{padding:18px}.community-field-error{min-height:18px;margin:8px 0 0;color:var(--nexora-danger);font-size:12px}@media(max-width:980px){.community-layout-feed{grid-template-columns:1fr}}@media(max-width:640px){.community-panel-head{align-items:stretch;flex-direction:column}.community-filter-row{overflow-x:auto;flex-wrap:nowrap}.community-filter-row button{flex:0 0 auto}}
```

- [ ] **Step 7: Run tests and syntax checks for GREEN**

Run:

```bash
node --test html/pages/community.test.mjs html/assets/community-page.test.mjs
node --check html/assets/community-page.js
git diff --check
```

Expected: all tests pass, JavaScript syntax exits 0, and `git diff --check` prints nothing.

- [ ] **Step 8: Commit the Feed deliverable**

```bash
git add html/pages/community.html html/pages/community.test.mjs html/assets/community-page.css html/assets/community-page.js html/assets/community-page.test.mjs
git commit -m "feat: build Community owner feed"
```

---

### Task 2: Build multiple-group discovery and creation

**Files:**
- Modify: `html/pages/community.html` (`panel-groups` and Create Group dialog)
- Modify: `html/pages/community.test.mjs`
- Modify: `html/assets/community-page.css`
- Modify: `html/assets/community-page.js`
- Modify: `html/assets/community-page.test.mjs`

**Interfaces:**
- Consumes: Task 1 `state`, `escapeHtml`, `showCommunityNotice`, and event-delegation setup.
- Produces: `groupDefaults(type)`, `filterGroups(query, type)`, `createGroup(input)`, `updateGroup(groupId, changes)`, `toggleArchivedGroup(groupId)`, `renderGroups()`, and `[data-group-id]` selection used by Task 3.

- [ ] **Step 1: Add failing group-model tests**

Append tests that assert Staff, Customer, and Mixed defaults; create four groups with unique IDs; reject blank names; and require `privacyAcknowledged: true` for Mixed groups:

```js
test('applies privacy-first group defaults and creates multiple groups', () => {
  const api = loadApi();
  assert.deepEqual(api.groupDefaults('staff'), { visibility: 'private', joining: 'invite-only', posting: 'members' });
  assert.deepEqual(api.groupDefaults('customer'), { visibility: 'private', joining: 'approval', posting: 'members' });
  assert.deepEqual(api.groupDefaults('mixed'), { visibility: 'private', joining: 'invite-only', posting: 'members' });
  assert.equal(api.createGroup({ name: '', type: 'staff' }).ok, false);
  assert.equal(api.createGroup({ name: 'Holiday VIPs', type: 'mixed', privacyAcknowledged: false }).ok, false);
  const created = api.createGroup({ name: 'Holiday VIPs', type: 'mixed', privacyAcknowledged: true });
  assert.equal(created.ok, true);
  assert.equal(api.updateGroup(created.group.id, { posting: 'moderators' }).group.posting, 'moderators');
  assert.equal(api.toggleArchivedGroup(created.group.id).group.archived, true);
  assert.ok(api.filterGroups('', 'all').length >= 5);
});
```

- [ ] **Step 2: Add failing source assertions for Groups UI**

Append:

```js
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
});
```

- [ ] **Step 3: Run the two Community test files and verify RED**

Run `node --test html/pages/community.test.mjs html/assets/community-page.test.mjs`.

Expected: FAIL because group operations and Group UI controls do not exist.

- [ ] **Step 4: Replace the Groups placeholder with the list workspace**

Replace `panel-groups` with this list view and dialog; Task 3 adds the chat view beside it:

```html
<section class="tab-panel" id="panel-groups" data-tab-panel="groups" role="tabpanel" aria-label="Community Groups" hidden>
  <div data-group-list-view>
    <div class="community-panel-head"><div><span class="community-eyebrow">Salon communities</span><h2>Groups</h2><p>Create focused spaces for your staff and customers.</p></div><button class="community-primary" type="button" data-create-group-open>Create Group</button></div>
    <div class="group-summary-grid"><article><span>Total groups</span><strong data-group-total>4</strong></article><article><span>Total members</span><strong data-member-total>110</strong></article><article><span>Unread messages</span><strong data-unread-total>25</strong></article><article><span>Pending requests</span><strong>3</strong></article></div>
    <div class="group-toolbar"><label><span class="sr-only">Search groups</span><input type="search" placeholder="Search groups..." data-group-search></label><div class="community-filter-row"><button class="is-active" type="button" data-group-filter="all">All</button><button type="button" data-group-filter="staff">Staff</button><button type="button" data-group-filter="customer">Customer</button><button type="button" data-group-filter="mixed">Mixed</button><button type="button" data-group-filter="archived">Archived</button></div></div>
    <div class="group-grid" data-group-grid></div>
  </div>
  <div class="community-dialog-backdrop" data-create-group-dialog hidden>
    <section class="community-dialog" role="dialog" aria-modal="true" aria-labelledby="create-group-title">
      <header><h2 id="create-group-title">Create Group</h2><button type="button" aria-label="Close Create Group" data-dialog-close>×</button></header>
      <form data-create-group-form>
        <label>Group name<input name="groupName" required></label><label>Description<textarea name="groupDescription" rows="3"></textarea></label>
        <label>Group type<select name="groupType"><option value="staff">Staff</option><option value="customer">Customer</option><option value="mixed">Mixed</option></select></label>
        <label>Visibility<select name="groupVisibility"><option value="private">Private</option><option value="discoverable">Discoverable to verified customers</option></select></label>
        <label>Who can post<select name="groupPosting"><option value="members">All members</option><option value="moderators">Admins and moderators</option><option value="owner">Owner only</option></select></label>
        <label class="mixed-confirm" hidden><input type="checkbox" data-mixed-privacy-confirm> I understand staff and customers can see one another in this group.</label>
        <p class="community-field-error" data-group-form-error aria-live="polite"></p>
        <footer><button type="button" data-dialog-close>Cancel</button><button class="community-primary" type="submit">Create Group</button></footer>
      </form>
    </section>
  </div>
</section>
```

- [ ] **Step 5: Implement group state and pure operations**

Seed these exact groups in `state.groups`:

```js
[
  { id:'staff-main', name:'Nexora Touch Staff', type:'staff', visibility:'private', members:12, unread:8, activity:'5 min ago', archived:false, description:'Daily operations, schedules, and team announcements.' },
  { id:'vip-club', name:'VIP Nail Club', type:'customer', visibility:'private', members:68, unread:14, activity:'18 min ago', archived:false, description:'Early access, care tips, and VIP-only offers.' },
  { id:'weekend-promos', name:'Weekend Promotions', type:'mixed', visibility:'private', members:24, unread:3, activity:'1 hr ago', archived:false, description:'Coordinate weekend campaigns with staff and loyal customers.' },
  { id:'new-hire', name:'New Hire Onboarding', type:'staff', visibility:'private', members:6, unread:0, activity:'Yesterday', archived:false, description:'Training, policies, and first-week checklists.' }
]
```

Expose `groupDefaults`, `filterGroups`, `createGroup`, `updateGroup`, and `toggleArchivedGroup` on `NEXORA_COMMUNITY`. `createGroup` returns explicit errors for blank name, unknown type, and missing Mixed acknowledgement; successful groups receive an ID based on `group-` plus `Date.now()` and start with one member. `updateGroup` permits description, posting, and Customer-group discoverability changes but refuses public/discoverable visibility for Staff and Mixed groups.

- [ ] **Step 6: Render and bind group management**

Render each group as an actionable card with type/privacy badges, member/unread/activity values, Open Chat, Manage, and Archive controls. Use this renderer contract:

```js
function renderGroups() {
  var grid = document.querySelector('[data-group-grid]');
  if (!grid) return;
  var query = document.querySelector('[data-group-search]').value;
  var groups = filterGroups(query, state.groupFilter);
  grid.innerHTML = groups.length ? groups.map(function (group) {
    return '<article class="group-card community-card" data-group-id="' + escapeHtml(group.id) + '"><div class="group-card-head"><span class="group-avatar">' + escapeHtml(group.name.slice(0, 2).toUpperCase()) + '</span><div><h3>' + escapeHtml(group.name) + '</h3><span class="group-type-badge">' + escapeHtml(group.type) + '</span><span class="group-privacy-badge">' + escapeHtml(group.visibility) + '</span></div></div><p>' + escapeHtml(group.description) + '</p><dl><div><dt>Members</dt><dd>' + group.members + '</dd></div><div><dt>Unread</dt><dd>' + group.unread + '</dd></div><div><dt>Activity</dt><dd>' + escapeHtml(group.activity) + '</dd></div></dl><footer><button type="button" data-group-open="' + escapeHtml(group.id) + '">Open Chat</button><button type="button" data-group-manage="' + escapeHtml(group.id) + '">Manage</button><button type="button" data-group-archive="' + escapeHtml(group.id) + '">' + (group.archived ? 'Restore' : 'Archive') + '</button></footer></article>';
  }).join('') : '<div class="community-empty"><h3>No groups found</h3><p>Change the filter or create a new group.</p></div>';
  document.querySelector('[data-group-total]').textContent = state.groups.filter(function (group) { return !group.archived; }).length;
  document.querySelector('[data-member-total]').textContent = state.groups.reduce(function (sum, group) { return sum + group.members; }, 0);
  document.querySelector('[data-unread-total]').textContent = state.groups.reduce(function (sum, group) { return sum + group.unread; }, 0);
}
```

Bind search/filter, dialog submit, and archive in the panel's delegated handler; after each mutation call `renderGroups()` and `showCommunityNotice()`.

- [ ] **Step 7: Add Groups styles and responsive dialog rules**

Add `.group-summary-grid`, `.group-toolbar`, `.group-grid`, `.group-card`, `.group-type-badge`, `.community-dialog-backdrop`, `.community-dialog`, and form-field rules. Use four summary columns above 1100px, two columns between 640px and 1099px, and one column below 640px. The dialog must be at most `640px` wide and `calc(100vh - 32px)` tall with internal scrolling.

- [ ] **Step 8: Verify GREEN and commit**

Run the two test files, `node --check html/assets/community-page.js`, and `git diff --check`. Expected: all pass.

```bash
git add html/pages/community.html html/pages/community.test.mjs html/assets/community-page.css html/assets/community-page.js html/assets/community-page.test.mjs
git commit -m "feat: add multi-group Community management"
```

---

### Task 3: Add group chat, threads, members, and moderation

**Files:**
- Modify: `html/pages/community.html` (`panel-groups` detail workspace)
- Modify: `html/pages/community.test.mjs`
- Modify: `html/assets/community-page.css`
- Modify: `html/assets/community-page.js`
- Modify: `html/assets/community-page.test.mjs`

**Interfaces:**
- Consumes: Task 2 group IDs and group-card `[data-group-id]` actions.
- Produces: `openGroup(groupId)`, `sendMessage(groupId, body)`, `addMessageReaction(groupId, messageId, emoji)`, `addThreadReply(groupId, messageId, body)`, and `setMemberRole(groupId, memberId, role)`.

- [ ] **Step 1: Add failing chat state tests**

Test that `openGroup('staff-main')` succeeds, blank messages fail, a valid message appends to only that group, a thread reply increments replies, and a member role accepts only `admin`, `moderator`, or `member`:

```js
test('keeps chat, threads, and roles isolated per group', () => {
  const api = loadApi();
  assert.equal(api.openGroup('missing').ok, false);
  assert.equal(api.openGroup('staff-main').ok, true);
  assert.equal(api.sendMessage('staff-main', ' ').ok, false);
  const sent = api.sendMessage('staff-main', 'Please confirm Friday coverage.');
  assert.equal(sent.ok, true);
  assert.equal(api.addThreadReply('staff-main', sent.message.id, 'I can cover 9–5.').ok, true);
  assert.equal(api.setMemberRole('staff-main', 'member-linh', 'moderator').ok, true);
  assert.equal(api.setMemberRole('staff-main', 'member-linh', 'owner').ok, false);
});
```

- [ ] **Step 2: Add failing structure assertions**

Append:

```js
test('renders the group chat, thread, member, and moderation workspace', () => {
  const html = source();
  for (const marker of ['data-group-list-view', 'data-group-chat-view', 'data-message-list', 'data-group-member-rail', 'data-group-thread-panel', 'data-message-composer']) assert.match(html, new RegExp(marker));
  for (const copy of ['Back to Groups', 'Join Requests', 'Pinned Messages']) assert.match(html, new RegExp(copy));
  assert.match(html, /aria-label="Search messages"/);
  assert.match(html, /aria-label="Close thread"/);
  assert.match(html, /aria-label="Attach photo"/);
  assert.match(html, /aria-label="Attach file"/);
});
```

- [ ] **Step 3: Run tests and verify RED**

Run the two Community test files. Expected: FAIL on missing chat operations and markup.

- [ ] **Step 4: Add the hidden chat-detail workspace**

Inside `panel-groups`, wrap the Task 2 content in `[data-group-list-view]` and add `[data-group-chat-view hidden]` with:

- Header containing Back to Groups, group identity, Search, Members, and Settings.
- `[data-message-list]` main timeline.
- `[data-group-side-panel="members"]` member rail grouped by roles.
- `[data-group-side-panel="thread"] hidden` focused thread with Close Thread.
- Message form containing `[data-message-input]`, Mention, Emoji, Photo, File, and Send controls.

Use this semantic shell:

```html
<div data-group-chat-view hidden>
  <header class="group-chat-head"><button type="button" data-groups-back>Back to Groups</button><div><h2 data-active-group-name>Group</h2><p><span data-active-group-privacy>Private</span> · <span data-active-group-members>0 members</span></p></div><button type="button" aria-label="Search messages">Search</button><button type="button" data-members-open>Members</button><button type="button" data-group-settings>Settings</button></header>
  <div class="group-chat-shell"><div class="group-message-column"><div class="message-list" data-message-list></div><form class="message-composer" data-message-composer><label class="sr-only" for="group-message-input">Message</label><textarea id="group-message-input" data-message-input rows="2" placeholder="Write a message..."></textarea><button type="button" aria-label="Mention a member">@</button><button type="button" aria-label="Choose emoji">☺</button><button type="button" aria-label="Attach photo">Photo</button><button type="button" aria-label="Attach file">File</button><button class="community-primary" type="submit">Send</button><p data-message-error aria-live="polite"></p></form></div><aside class="group-member-rail" data-group-member-rail><h3>Members</h3><div data-member-list></div><h3>Join Requests</h3><div data-join-requests></div><h3>Pinned Messages</h3><div data-pinned-messages></div></aside><aside class="group-thread-panel" data-group-thread-panel hidden><button type="button" aria-label="Close thread" data-thread-close>×</button><h3>Thread</h3><div data-thread-messages></div><form data-thread-form><input data-thread-input aria-label="Reply to thread"><button type="submit">Reply</button></form></aside></div>
</div>
```

- [ ] **Step 5: Seed members and messages and implement pure chat operations**

Use these exact member and message seeds:

```js
state.members = [
  { id:'owner-nexora', name:'Nexora Touch', role:'owner', status:'online' },
  { id:'admin-mia', name:'Mia Tran', role:'admin', status:'online' },
  { id:'member-linh', name:'Linh Nguyen', role:'moderator', status:'away' },
  { id:'member-sophie', name:'Sophie Carter', role:'member', status:'offline' }
];
state.messages = {
  'staff-main': [
    { id:'staff-message-1', authorId:'owner-nexora', body:'Friday coverage is the priority this week. Please confirm your hours.', time:'9:05 AM', pinned:true, reactions:{ '👍':3 }, replies:[{ id:'reply-1', authorId:'admin-mia', body:'Front desk is covered until 6 PM.', time:'9:12 AM' },{ id:'reply-2', authorId:'member-linh', body:'I can cover the closing shift.', time:'9:18 AM' }] },
    { id:'staff-message-2', authorId:'admin-mia', body:'The new Gel-X color cards are at station two.', time:'10:24 AM', pinned:false, reactions:{ '✨':2 }, replies:[] },
    { id:'staff-message-3', authorId:'member-sophie', body:'I completed the sanitation checklist.', time:'11:03 AM', pinned:false, reactions:{}, replies:[] }
  ],
  'vip-club': [
    { id:'vip-message-1', authorId:'owner-nexora', body:'VIP members get first access to the summer color preview.', time:'Yesterday', pinned:true, reactions:{ '💜':12 }, replies:[] },
    { id:'vip-message-2', authorId:'member-sophie', body:'Can appointments be booked directly from the preview?', time:'Yesterday', pinned:false, reactions:{}, replies:[] }
  ]
};
```

Expose all five interfaces listed for this task. Every operation returns `{ ok, error?, value? }`, validates the group/message/member, trims body text, and does not mutate another group's arrays.

- [ ] **Step 6: Render chat and bind interactions**

Open Chat switches list/detail without changing the top-level Groups tab. Back restores the list. Use one handler entry point:

```js
function handleGroupsClick(event) {
  var open = event.target.closest('[data-group-open]');
  if (open) { openGroup(open.getAttribute('data-group-open')); renderGroupChat(); return; }
  if (event.target.closest('[data-groups-back]')) { state.activeGroupId = ''; renderGroupWorkspace(); return; }
  var thread = event.target.closest('[data-thread-open]');
  if (thread) { state.activeThreadId = thread.getAttribute('data-thread-open'); renderThread(); return; }
  if (event.target.closest('[data-thread-close]')) { state.activeThreadId = ''; renderThread(); return; }
  var reaction = event.target.closest('[data-message-reaction]');
  if (reaction) { addMessageReaction(state.activeGroupId, reaction.getAttribute('data-message-id'), reaction.getAttribute('data-message-reaction')); renderGroupChat(); return; }
  var moderation = event.target.closest('[data-message-moderation]');
  if (moderation) { moderateMessage(state.activeGroupId, moderation.getAttribute('data-message-id'), moderation.getAttribute('data-message-moderation')); renderGroupChat(); }
}
```

Bind send, thread reply, role change, member drawer, and demo attachment forms/actions to the same `panel-groups` event-delegation boundary.

The thread panel replaces the member rail on desktop. Below 760px it receives `.is-mobile-open` and covers the group workspace below its header.

- [ ] **Step 7: Add chat layout styles**

Use `.group-chat-shell{display:grid;grid-template-columns:minmax(0,1fr) 280px}` above 900px and one column below. Style messages as readable timeline rows, not speech bubbles for every message. Give the composer a sticky bottom position within the chat workspace, a visible focus state, and a minimum 44px send target.

- [ ] **Step 8: Verify GREEN and commit**

Run both tests, JavaScript syntax check, and diff check. Expected: all pass.

```bash
git add html/pages/community.html html/pages/community.test.mjs html/assets/community-page.css html/assets/community-page.js html/assets/community-page.test.mjs
git commit -m "feat: add Community group chat workspace"
```

---

### Task 4: Populate Learning with owner education and progress

**Files:**
- Modify: `html/pages/community.html` (`panel-learning`)
- Modify: `html/pages/community.test.mjs`
- Modify: `html/assets/community-page.css`
- Modify: `html/assets/community-page.js`
- Modify: `html/assets/community-page.test.mjs`

**Interfaces:**
- Consumes: Task 1 notice helper and Task 2 Staff groups.
- Produces: `filterCourses(category)`, `toggleSavedCourse(courseId)`, `setCourseProgress(courseId, percent)`, and `shareCourse(courseId, groupId)`.

- [ ] **Step 1: Add failing Learning tests**

Cover four course categories, course filtering, save toggling, progress clamping from 0 to 100, and rejection when sharing to a non-Staff group.

```js
test('filters, saves, progresses, and safely shares owner courses', () => {
  const api = loadApi();
  assert.ok(api.filterCourses('operations').every((course) => course.category === 'operations'));
  assert.equal(api.toggleSavedCourse('course-retention').ok, true);
  assert.equal(api.setCourseProgress('course-retention', 125).course.progress, 100);
  assert.equal(api.shareCourse('course-retention', 'vip-club').ok, false);
  assert.equal(api.shareCourse('course-retention', 'staff-main').ok, true);
});
```

- [ ] **Step 2: Add failing Learning structure assertions**

Append:

```js
test('renders owner Learning recommendations, progress, workshop, and sharing', () => {
  const html = source();
  for (const copy of ['Recommended for your salon', 'Continue Learning', 'Saved resources', 'Upcoming live workshop', 'Share to Staff Group']) assert.match(html, new RegExp(copy));
  for (const category of ['operations', 'marketing', 'team-management', 'customer-experience']) assert.match(html, new RegExp(`data-course-filter="${category}"`));
  assert.match(html, /data-course-grid/);
  assert.match(html, /data-share-course-dialog/);
});
```

- [ ] **Step 3: Run tests and verify RED**

Expected: FAIL because the Learning placeholder and missing course API remain.

- [ ] **Step 4: Replace the Learning placeholder**

Use this panel structure; `renderCourses()` fills the grids:

```html
<section class="tab-panel" id="panel-learning" data-tab-panel="learning" role="tabpanel" aria-label="Community Learning" hidden>
  <div class="community-panel-head"><div><span class="community-eyebrow">Owner education</span><h2>Learning</h2><p>Build stronger operations, marketing, and teams.</p></div></div>
  <article class="learning-hero community-card"><div><span>Recommended for your salon</span><h3>Turn first-time guests into regulars</h3><p>Build a follow-up rhythm that improves retention without discounting.</p><button class="community-primary" type="button" data-course-continue="course-retention">Continue learning</button></div><strong>65%</strong></article>
  <div class="community-filter-row"><button class="is-active" type="button" data-course-filter="all">All</button><button type="button" data-course-filter="operations">Operations</button><button type="button" data-course-filter="marketing">Marketing</button><button type="button" data-course-filter="team-management">Team Management</button><button type="button" data-course-filter="customer-experience">Customer Experience</button></div>
  <div class="learning-layout"><div><h3>Continue Learning</h3><div class="course-grid" data-course-grid></div></div><aside class="community-side-stack"><section class="community-card"><h3>Upcoming live workshop</h3><strong>Build a high-performing front desk</strong><p>August 12 · 10:00 AM · 45 min</p><button type="button">Reserve seat</button></section><section class="community-card"><h3>Saved resources</h3><div data-saved-course-list></div></section></aside></div>
  <div class="community-dialog-backdrop" data-share-course-dialog hidden><section class="community-dialog" role="dialog" aria-modal="true" aria-labelledby="share-course-title"><header><h2 id="share-course-title">Share to Staff Group</h2><button type="button" aria-label="Close Share Course" data-dialog-close>×</button></header><form data-share-course-form><label>Staff group<select name="courseGroup" data-staff-group-options></select></label><p data-share-course-error aria-live="polite"></p><footer><button type="button" data-dialog-close>Cancel</button><button class="community-primary" type="submit">Share course</button></footer></form></section></div>
</section>
```

- [ ] **Step 5: Seed courses and implement operations**

Seed exactly these initial courses:

- `Customer retention playbook` — Customer Experience, 18 min, 65% progress.
- `Pricing services for healthy margins` — Operations, 24 min, 20% progress.
- `Instagram content in 30 minutes a week` — Marketing, 16 min, 0% progress.
- `Run better one-on-ones` — Team Management, 12 min, 80% progress.

Expose the four task interfaces. `shareCourse` appends a Feed announcement scoped to the selected Staff group and returns a validation error for other group types.

- [ ] **Step 6: Bind Learning controls and add styles**

Bind filters, Save, Continue, simulated progress, share-dialog open/close/submit, and empty search results. The filter entry point is:

```js
function renderCourses() {
  var grid = document.querySelector('[data-course-grid]');
  if (!grid) return;
  var courses = filterCourses(state.courseFilter);
  grid.innerHTML = courses.map(renderCourseCard).join('');
  document.querySelector('[data-saved-course-list]').innerHTML = state.courses.filter(function (course) { return course.saved; }).map(function (course) { return '<button type="button" data-course-continue="' + escapeHtml(course.id) + '">' + escapeHtml(course.title) + '</button>'; }).join('') || '<p>No saved resources yet.</p>';
}
```

Use a three-column course grid above 1100px, two columns down to 700px, and one below. Progress bars include a visible numeric percentage and `aria-valuenow`.

- [ ] **Step 7: Verify GREEN and commit**

Run both tests, JS syntax, and diff check. Expected: all pass.

```bash
git add html/pages/community.html html/pages/community.test.mjs html/assets/community-page.css html/assets/community-page.js html/assets/community-page.test.mjs
git commit -m "feat: populate Community learning hub"
```

---

### Task 5: Extend Owner Jobs with metrics, filters, and pipeline

**Files:**
- Modify: `html/pages/community.html` (`panel-jobs`)
- Modify: `html/pages/community.test.mjs`
- Modify: `html/assets/community-page.css`
- Modify: `html/assets/community-page.js`
- Modify: `html/assets/community-page.test.mjs`

**Interfaces:**
- Consumes: existing candidate IDs `a7` and `c2`, Request contact, Dismiss, and guardrail copy.
- Produces: `filterCandidates(filters)`, `moveCandidate(candidateId, stage)`, `toggleSavedCandidate(candidateId)`, and job-post dialog validation.

- [ ] **Step 1: Add failing Jobs operation tests**

Append:

```js
test('filters and moves privacy-protected candidates through the owner pipeline', () => {
  const api = loadApi();
  assert.equal(api.filterCandidates({ skill: 'Gel-X', maxDistance: 5 })[0].id, 'a7');
  assert.equal(api.moveCandidate('a7', 'contact-requested').ok, true);
  assert.equal(api.moveCandidate('a7', 'interviewing').ok, true);
  assert.equal(api.moveCandidate('a7', 'unknown').ok, false);
  assert.equal(api.toggleSavedCandidate('a7').candidate.saved, true);
});
```

- [ ] **Step 2: Extend source regressions before implementation**

Keep every existing Owner Jobs assertion and append:

```js
test('adds owner job metrics, filters, pipeline, and management actions', () => {
  const html = source();
  for (const copy of ['Create Job Post', 'Active Posts', 'New Matches', 'Contact Requests', 'Interviews', 'Matched', 'Contact Requested', 'Interviewing', 'Closed', 'Save Candidate', 'Share with manager']) assert.match(html, new RegExp(copy));
  for (const filter of ['skill', 'distance', 'availability', 'compensation']) assert.match(html, new RegExp(`data-candidate-filter="${filter}"`));
  assert.match(html, /data-create-job-dialog/);
});
```

- [ ] **Step 3: Run tests and verify RED**

Expected: existing six source tests still pass, new Jobs tests fail.

- [ ] **Step 4: Add metrics, filters, actions, pipeline, and job-post dialog**

Retain the demand card, active post, both candidate cards, match percentages, explanations, and guardrail. Add four summary metrics before candidates, a filter row, Save and Share actions on each candidate, a pipeline summary after candidates, and a Create Job Post dialog with role title, skills, distance, availability, and compensation preference fields.

Use these structural markers so rendering and tests remain stable:

```html
<button class="community-primary" type="button" data-create-job-open>Create Job Post</button>
<div class="job-metric-grid"><article><span>Active Posts</span><strong>1</strong></article><article><span>New Matches</span><strong>4</strong></article><article><span>Contact Requests</span><strong>2</strong></article><article><span>Interviews</span><strong>1</strong></article></div>
<div class="job-filter-row"><select data-candidate-filter="skill" aria-label="Filter by skill"><option value="all">All skills</option><option value="Gel-X">Gel-X</option><option value="Design">Design</option><option value="Pedicure">Pedicure</option></select><select data-candidate-filter="distance" aria-label="Filter by distance"><option value="all">Any distance</option><option value="5">Within 5 miles</option><option value="10">Within 10 miles</option></select><select data-candidate-filter="availability" aria-label="Filter by availability"><option value="all">Any availability</option><option value="weekdays">Weekdays</option><option value="weekends">Weekends</option></select><select data-candidate-filter="compensation" aria-label="Filter by compensation"><option value="all">Any compensation</option><option value="split-6-4">Split 6/4</option><option value="weekly-guarantee">Weekly guarantee</option></select></div>
<div class="job-pipeline" data-job-pipeline><article><span>Matched</span><strong data-stage-count="matched">2</strong></article><article><span>Contact Requested</span><strong data-stage-count="contact-requested">0</strong></article><article><span>Interviewing</span><strong data-stage-count="interviewing">0</strong></article><article><span>Closed</span><strong data-stage-count="closed">0</strong></article></div>
<div class="community-dialog-backdrop" data-create-job-dialog hidden><section class="community-dialog" role="dialog" aria-modal="true" aria-labelledby="create-job-title"><header><h2 id="create-job-title">Create Job Post</h2><button type="button" aria-label="Close Create Job Post" data-dialog-close>×</button></header><form data-create-job-form><label>Role title<input name="jobTitle" required></label><label>Required skills<input name="jobSkills" required></label><label>Maximum distance<input name="jobDistance" type="number" min="1" value="10"></label><label>Availability<input name="jobAvailability"></label><label>Compensation preference<select name="jobCompensation"><option value="split-6-4">Split 6/4</option><option value="weekly-guarantee">Weekly guarantee</option></select></label><p data-job-form-error aria-live="polite"></p><footer><button type="button" data-dialog-close>Cancel</button><button class="community-primary" type="submit">Publish post</button></footer></form></section></div>
```

- [ ] **Step 5: Implement candidate state operations**

Model the two existing candidates with structured skill, distance, availability, compensation, stage, and saved fields. Request contact moves a candidate to `contact-requested`; the job actions keep the existing privacy notice. Share with manager produces only a session toast and does not expose identity.

Use this transition guard:

```js
function moveCandidate(candidateId, stage) {
  var allowed = ['matched', 'contact-requested', 'interviewing', 'closed'];
  var candidate = null;
  state.candidates.some(function (item) {
    if (item.id !== candidateId) return false;
    candidate = item;
    return true;
  });
  if (!candidate) return { ok:false, error:'Candidate not found.' };
  if (allowed.indexOf(stage) === -1) return { ok:false, error:'Choose a valid hiring stage.' };
  candidate.stage = stage;
  return { ok:true, candidate:candidate };
}
```

- [ ] **Step 6: Style enhanced Jobs without regressing button sizing**

Add metric and pipeline grids while preserving `.owner-job-actions{display:flex}` and `.owner-action{width:fit-content;flex:0 0 auto}`. Collapse four metrics to two then one columns at the shared breakpoints.

```css
.job-metric-grid,.job-pipeline{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.job-metric-grid article,.job-pipeline article{border:1px solid var(--nexora-border);border-radius:14px;background:#fff;padding:16px}.owner-job-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.owner-action{width:fit-content;flex:0 0 auto}@media(max-width:900px){.job-metric-grid,.job-pipeline{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.job-metric-grid,.job-pipeline{grid-template-columns:1fr}}
```

- [ ] **Step 7: Verify GREEN and commit**

Run both tests, JS syntax, and diff check. Expected: all pass, including the pre-existing privacy and button-size tests.

```bash
git add html/pages/community.html html/pages/community.test.mjs html/assets/community-page.css html/assets/community-page.js html/assets/community-page.test.mjs
git commit -m "feat: extend Community owner jobs"
```

---

### Task 6: Populate Events with creation, filters, calendar, and RSVP

**Files:**
- Modify: `html/pages/community.html` (`panel-events` and Create Event dialog)
- Modify: `html/pages/community.test.mjs`
- Modify: `html/assets/community-page.css`
- Modify: `html/assets/community-page.js`
- Modify: `html/assets/community-page.test.mjs`

**Interfaces:**
- Consumes: Task 2 groups and Task 1 Feed announcements.
- Produces: `filterEvents(type)`, `createEvent(input)`, `setEventRsvp(eventId, status)`, and `announceEvent(eventId, groupId)`.

- [ ] **Step 1: Add failing Events state tests**

```js
test('creates, filters, RSVPs, and announces salon events', () => {
  const api = loadApi();
  assert.ok(api.filterEvents('staff-training').every((event) => event.type === 'staff-training'));
  assert.equal(api.createEvent({ title: '', start: '2026-08-12T10:00' }).ok, false);
  assert.equal(api.createEvent({ title: 'Past event', type: 'customer-event', start: '2000-01-01T18:00', end: '2000-01-01T20:00', audience: 'vip-club', capacity: 30 }).ok, false);
  const created = api.createEvent({ title: 'Fall VIP Preview', type: 'customer-event', start: '2099-09-05T18:00', end: '2099-09-05T20:00', audience: 'vip-club', capacity: 30 });
  assert.equal(created.ok, true);
  assert.equal(api.setEventRsvp(created.event.id, 'going').ok, true);
  assert.equal(api.setEventRsvp(created.event.id, 'unknown').ok, false);
  assert.equal(api.announceEvent(created.event.id, 'vip-club').ok, true);
});
```

- [ ] **Step 2: Add failing Events structure assertions**

Append:

```js
test('renders event views, filters, RSVP details, and creation controls', () => {
  const html = source();
  for (const copy of ['Create Event', 'List', 'Calendar', 'RSVP', 'Attendees', 'Linked group', 'Reminder']) assert.match(html, new RegExp(copy));
  for (const type of ['all', 'staff-training', 'customer-event', 'promotion', 'industry']) assert.match(html, new RegExp(`data-event-filter="${type}"`));
  assert.match(html, /data-event-list/);
  assert.match(html, /data-event-calendar/);
  for (const name of ['eventTitle', 'eventDescription', 'eventType', 'eventStart', 'eventEnd', 'eventMode', 'eventLocation', 'eventAudience', 'eventCapacity', 'eventRsvp', 'eventReminder']) assert.match(html, new RegExp(`name="${name}"`));
});
```

- [ ] **Step 3: Run tests and verify RED**

Expected: FAIL because Events remains a placeholder and the API is missing.

- [ ] **Step 4: Replace the Events placeholder**

Use this panel and dialog structure:

```html
<section class="tab-panel" id="panel-events" data-tab-panel="events" role="tabpanel" aria-label="Community Events" hidden>
  <div class="community-panel-head"><div><span class="community-eyebrow">Salon calendar</span><h2>Events</h2><p>Plan training, customer experiences, promotions, and networking.</p></div><button class="community-primary" type="button" data-create-event-open>Create Event</button></div>
  <div class="event-toolbar"><div class="community-filter-row"><button class="is-active" type="button" data-event-filter="all">All</button><button type="button" data-event-filter="staff-training">Staff Training</button><button type="button" data-event-filter="customer-event">Customer Event</button><button type="button" data-event-filter="promotion">Promotion</button><button type="button" data-event-filter="industry">Industry</button></div><div><button class="is-active" type="button" data-event-view="list">List</button><button type="button" data-event-view="calendar">Calendar</button></div></div>
  <div class="event-layout"><div data-event-list></div><div data-event-calendar hidden></div><aside class="community-card" data-event-detail><h3>Event details</h3><p>Select an event to view RSVP, Attendees, Linked group, and Reminder status.</p></aside></div>
  <div class="community-dialog-backdrop" data-create-event-dialog hidden><section class="community-dialog" role="dialog" aria-modal="true" aria-labelledby="create-event-title"><header><h2 id="create-event-title">Create Event</h2><button type="button" aria-label="Close Create Event" data-dialog-close>×</button></header><form data-create-event-form><label>Title<input name="eventTitle" required></label><label>Description<textarea name="eventDescription"></textarea></label><label>Type<select name="eventType"><option value="staff-training">Staff Training</option><option value="customer-event">Customer Event</option><option value="promotion">Promotion</option><option value="industry">Industry</option></select></label><label>Starts<input name="eventStart" type="datetime-local" required></label><label>Ends<input name="eventEnd" type="datetime-local" required></label><label>Mode<select name="eventMode"><option value="in-person">In person</option><option value="online">Online</option></select></label><label>Location<input name="eventLocation"></label><label>Audience<select name="eventAudience" data-event-group-options></select></label><label>Capacity<input name="eventCapacity" type="number" min="1" value="20"></label><label><input name="eventRsvp" type="checkbox" checked> RSVP required</label><label><input name="eventReminder" type="checkbox" checked> Send reminder</label><p data-event-form-error aria-live="polite"></p><footer><button type="button" data-dialog-close>Cancel</button><button class="community-primary" type="submit">Create Event</button></footer></form></section></div>
</section>
```

- [ ] **Step 5: Seed events and implement operations**

Seed `Gel-X Quality Workshop`, `VIP Summer Color Preview`, `Back-to-School Promotion Launch`, and `Local Salon Owners Meetup`, covering all four types. Validate title, known type, start/end order, positive capacity, known audience, and allowed RSVP values `going`, `maybe`, `declined`.

`announceEvent` appends a scoped Feed announcement and returns an error for unknown event or group.

Use this creation validation order:

```js
function createEvent(input) {
  var title = String(input.title || '').trim();
  var types = ['staff-training', 'customer-event', 'promotion', 'industry'];
  if (!title) return { ok:false, error:'Enter an event title.' };
  if (types.indexOf(input.type) === -1) return { ok:false, error:'Choose a valid event type.' };
  if (!input.start || new Date(input.start) <= new Date()) return { ok:false, error:'Choose a future start time.' };
  if (!input.end || new Date(input.end) <= new Date(input.start)) return { ok:false, error:'End time must be after start time.' };
  if (Number(input.capacity) < 1) return { ok:false, error:'Capacity must be at least one.' };
  if (!state.groups.some(function (group) { return group.id === input.audience; })) return { ok:false, error:'Choose an existing audience group.' };
  var event = { id:'event-' + Date.now(), title:title, description:String(input.description || '').trim(), type:input.type, start:input.start, end:input.end, mode:input.mode || 'in-person', location:String(input.location || '').trim(), audience:input.audience, capacity:Number(input.capacity), rsvp:'maybe', reminder:input.reminder !== false };
  state.events.unshift(event);
  return { ok:true, event:event };
}
```

- [ ] **Step 6: Render and style both event views**

List cards show date, type, host, location/online, group, capacity, RSVP totals, and reminder. Calendar groups events by date in a seven-column desktop grid and an agenda list below 760px. Bind view switch, filters, RSVP, detail selection, creation dialog, and announcement action.

```css
.event-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.event-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px}.event-list{display:grid;gap:12px}.event-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}@media(max-width:900px){.event-layout{grid-template-columns:1fr}.event-toolbar{align-items:stretch;flex-direction:column}}@media(max-width:760px){.event-calendar{display:block}.event-calendar-day{display:grid;grid-template-columns:72px 1fr}}
```

- [ ] **Step 7: Verify GREEN and commit**

Run both tests, JS syntax, and diff check. Expected: all pass.

```bash
git add html/pages/community.html html/pages/community.test.mjs html/assets/community-page.css html/assets/community-page.js html/assets/community-page.test.mjs
git commit -m "feat: add Community salon events"
```

---

### Task 7: Complete accessibility, responsive behavior, and full regression verification

**Files:**
- Modify: `html/pages/community.html`
- Modify: `html/pages/community.test.mjs`
- Modify: `html/assets/community-page.css`
- Modify: `html/assets/community-page.js`
- Modify: `html/assets/community-page.test.mjs`

**Interfaces:**
- Consumes: all tab components and runtime interfaces from Tasks 1–6.
- Produces: verified keyboard/dialog/tab behavior and a clean final test baseline.

- [ ] **Step 1: Add failing accessibility and integration assertions**

Append to the source test:

```js
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
```

Append to the runtime test:

```js
test('keeps all five Community state domains available and independently mutable', () => {
  const api = loadApi();
  const originalGroups = api.state.groups.length;
  const originalEvents = api.state.events.length;
  api.addFeedPost('Independent feed change', 'staff');
  api.createGroup({ name: 'Independent group', type: 'staff' });
  api.toggleSavedCourse('course-retention');
  api.toggleSavedCandidate('a7');
  api.setEventRsvp(api.state.events[0].id, 'going');
  assert.equal(api.state.groups.length, originalGroups + 1);
  assert.equal(api.state.events.length, originalEvents);
  assert.ok(Array.isArray(api.state.posts));
  assert.ok(Array.isArray(api.state.courses));
  assert.ok(Array.isArray(api.state.candidates));
});
```

- [ ] **Step 2: Run the full tests and verify RED**

Run:

```bash
node --test html/pages/community.test.mjs html/assets/community-page.test.mjs
```

Expected: FAIL on any missing dialog labels, live region, or integration behavior.

- [ ] **Step 3: Fix focus management and live-region behavior**

Implement one dialog helper that records the opener, focuses the first field, traps Tab within the active dialog, closes on Escape/backdrop/Cancel, and returns focus. Use one `[data-community-notice] role="status" aria-live="polite"` node for confirmation messages. Field errors remain local and use `aria-live="polite"`.

```js
var activeDialog = null;
var dialogOpener = null;
function openDialog(dialog, opener) {
  activeDialog = dialog;
  dialogOpener = opener || document.activeElement;
  dialog.hidden = false;
  var first = dialog.querySelector('input,select,textarea,button');
  if (first) first.focus();
}
function closeDialog(dialog) {
  (dialog || activeDialog).hidden = true;
  activeDialog = null;
  if (dialogOpener && typeof dialogOpener.focus === 'function') dialogOpener.focus();
  dialogOpener = null;
}
function handleDialogKeydown(event) {
  if (!activeDialog) return;
  if (event.key === 'Escape') { closeDialog(activeDialog); return; }
  if (event.key !== 'Tab') return;
  var focusable = activeDialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href]');
  if (!focusable.length) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
```

- [ ] **Step 4: Finish responsive and reduced-motion CSS**

At 760px and below, stack headers, make primary actions full-width when paired with headings, turn group chat side panels into drawers, convert the event calendar to agenda mode, and ensure dialogs use 16px viewport margins. Add:

```css
@media (prefers-reduced-motion:reduce){.community-dialog,.community-notice,.group-thread-panel{scroll-behavior:auto;transition:none!important}}
```

Ensure focus outlines use a 2px visible ring and no text is smaller than 11px.

- [ ] **Step 5: Run automated verification for GREEN**

Run:

```bash
node --test html/pages/community.test.mjs html/assets/community-page.test.mjs
node --check html/assets/community-page.js
git diff --check
```

Expected: all tests pass, syntax exits 0, and diff check is silent.

- [ ] **Step 6: Perform manual responsive verification**

Serve the workspace:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/html/pages/community.html` and verify at 1440px, 1024px, 768px, and 390px widths:

- Every page tab activates the matching panel.
- Sidebar navigation and mobile drawer are unchanged.
- Feed posting/filtering works.
- Multiple groups can be created and filtered.
- Staff and Customer chat state stays isolated.
- Thread/member panels remain usable at each width.
- Learning filtering/save/share works.
- Jobs filtering and pipeline actions preserve privacy copy.
- Events creation, filters, views, and RSVP work.
- Dialogs close with Escape and return focus.
- No horizontal page overflow appears.

- [ ] **Step 7: Commit final integration fixes**

```bash
git add html/pages/community.html html/pages/community.test.mjs html/assets/community-page.css html/assets/community-page.js html/assets/community-page.test.mjs
git commit -m "test: verify Community owner hub experience"
```

- [ ] **Step 8: Record final evidence**

Run:

```bash
git status --short
git log -7 --oneline
node --test html/pages/community.test.mjs html/assets/community-page.test.mjs
```

Expected: clean worktree, at least seven task commits plus any required review-fix commits, and zero test failures.
