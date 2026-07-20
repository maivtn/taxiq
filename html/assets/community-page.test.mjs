import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SCRIPT_URL = new URL('./community-page.js', import.meta.url);

function loadApi(overrides = {}) {
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
  const context = {
    window,
    document,
    URLSearchParams,
    setTimeout,
    clearTimeout,
    console
  };
  if (overrides.Date) context.Date = overrides.Date;
  vm.runInNewContext(readFileSync(SCRIPT_URL, 'utf8'), context);
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

test('toggles the viewer reaction on a Feed post', () => {
  const api = loadApi();
  api.togglePostReaction('feed-announcement-1', '👍');
  assert.equal(api.togglePostReaction('feed-announcement-1', '👍').post.reactions['👍'], 4);
});

test('applies privacy-first group defaults and creates multiple groups', () => {
  const api = loadApi();
  const groupDefaults = (type) => JSON.parse(JSON.stringify(api.groupDefaults(type)));
  assert.deepEqual(groupDefaults('staff'), { visibility: 'private', joining: 'invite-only', posting: 'members' });
  assert.deepEqual(groupDefaults('customer'), { visibility: 'private', joining: 'approval', posting: 'members' });
  assert.deepEqual(groupDefaults('mixed'), { visibility: 'private', joining: 'invite-only', posting: 'members' });
  assert.equal(api.createGroup({ name: '', type: 'staff' }).ok, false);
  assert.equal(api.createGroup({ name: 'Holiday VIPs', type: 'mixed', privacyAcknowledged: false }).ok, false);
  const created = api.createGroup({ name: 'Holiday VIPs', type: 'mixed', privacyAcknowledged: true });
  assert.equal(created.ok, true);
  assert.equal(api.updateGroup(created.group.id, { posting: 'moderators' }).group.posting, 'moderators');
  assert.equal(api.toggleArchivedGroup(created.group.id).group.archived, true);
  assert.ok(api.filterGroups('', 'all').length >= 5);
});

test('rejects invalid group creation and keeps failed updates atomic', () => {
  const api = loadApi();
  const customer = api.state.groups[1];
  const originalDescription = customer.description;
  const originalVisibility = customer.visibility;
  const originalPosting = customer.posting;
  const invalidType = api.createGroup({ name: 'Invalid type', type: 'public' });
  const failedUpdate = api.updateGroup(customer.id, {
    visibility: 'discoverable',
    description: 'This change must not persist.',
    posting: 'everyone'
  });

  assert.equal(invalidType.ok, false);
  assert.match(invalidType.error, /valid group type/i);
  assert.equal(failedUpdate.ok, false);
  assert.equal(customer.visibility, originalVisibility);
  assert.equal(customer.description, originalDescription);
  assert.equal(customer.posting, originalPosting);
});

test('creates four unique group IDs within one millisecond', () => {
  function FixedDate() {}
  FixedDate.prototype.getTime = function () { return 1720000000000; };
  const api = loadApi({ Date: FixedDate });
  const created = ['One', 'Two', 'Three', 'Four'].map((name) => api.createGroup({ name, type: 'staff' }));
  const ids = created.map((result) => result.group.id);

  assert.ok(created.every((result) => result.ok));
  assert.equal(new Set(ids).size, 4);
  assert.ok(ids.every((id) => id.indexOf('group-1720000000000') === 0));
});

test('keeps chat, threads, and roles isolated per group', () => {
  const api = loadApi();
  const vipMessages = api.state.messages['vip-club'];
  assert.equal(api.openGroup('missing').ok, false);
  assert.equal(api.openGroup('staff-main').ok, true);
  assert.equal(api.sendMessage('staff-main', ' ').ok, false);
  const sent = api.sendMessage('staff-main', '  Please confirm Friday coverage.  ');
  assert.equal(sent.ok, true);
  assert.equal(sent.message.body, 'Please confirm Friday coverage.');
  assert.equal(api.state.messages['vip-club'], vipMessages);
  assert.equal(api.addThreadReply('staff-main', sent.message.id, 'I can cover 9–5.').ok, true);
  assert.equal(sent.message.replies.length, 1);
  assert.equal(api.setMemberRole('staff-main', 'member-linh', 'moderator').ok, true);
  assert.equal(api.setMemberRole('staff-main', 'member-linh', 'owner').ok, false);
});

test('validates reactions and owner moderation within the selected group', () => {
  const api = loadApi();
  assert.equal(api.addMessageReaction('missing', 'staff-message-1', '👍').ok, false);
  assert.equal(api.addMessageReaction('staff-main', 'missing', '👍').ok, false);
  assert.equal(api.addMessageReaction('staff-main', 'staff-message-1', ' ').ok, false);
  assert.equal(api.addMessageReaction('staff-main', 'staff-message-1', '👍').message.reactions['👍'], 4);
  assert.equal(api.moderateMessage('staff-main', 'staff-message-2', 'pin').message.pinned, true);
  assert.equal(api.moderateMessage('staff-main', 'staff-message-3', 'delete').ok, true);
  assert.equal(api.state.messages['staff-main'].some((message) => message.id === 'staff-message-3'), false);
  assert.equal(api.state.messages['vip-club'].length, 2);
});

export { loadApi };
