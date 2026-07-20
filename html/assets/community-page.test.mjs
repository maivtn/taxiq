import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SCRIPT_URL = new URL('./community-page.js', import.meta.url);

function loadApi(overrides = {}) {
  const document = overrides.document || {
    readyState: 'loading',
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    body: { appendChild() {} }
  };
  const testSetTimeout = overrides.setTimeout || setTimeout;
  const testClearTimeout = overrides.clearTimeout || clearTimeout;
  const window = {
    document,
    location: { search: '' },
    setTimeout: testSetTimeout,
    clearTimeout: testClearTimeout
  };
  const context = {
    window,
    document,
    URLSearchParams,
    setTimeout: testSetTimeout,
    clearTimeout: testClearTimeout,
    console
  };
  if (overrides.Date) context.Date = overrides.Date;
  vm.runInNewContext(readFileSync(SCRIPT_URL, 'utf8'), context);
  return window.NEXORA_COMMUNITY;
}

function fakeElement(attributes = {}, selectorMap = {}) {
  const listeners = {};
  const classes = new Set();
  return {
    attributes: { ...attributes },
    selectorMap,
    listeners,
    parentNode: null,
    hidden: false,
    value: '',
    textContent: '',
    innerHTML: '',
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
      toggle(name, force) {
        const enabled = force === undefined ? !classes.has(name) : Boolean(force);
        if (enabled) classes.add(name);
        else classes.delete(name);
        return enabled;
      }
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
    },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(type, listener) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(listener);
    },
    querySelector(selector) { return this.selectorMap[selector] || null; },
    focus() { this.focused = true; }
  };
}

function createGroupDom() {
  const elements = {
    list: fakeElement(),
    chat: fakeElement(),
    messageList: fakeElement(),
    activeName: fakeElement(),
    activePrivacy: fakeElement(),
    activeMembers: fakeElement(),
    memberRail: fakeElement(),
    memberList: fakeElement(),
    joins: fakeElement(),
    pinned: fakeElement(),
    threadPanel: fakeElement(),
    threadMessages: fakeElement()
  };
  elements.chat.hidden = true;
  elements.threadPanel.hidden = true;
  const panel = fakeElement({ id: 'panel-groups' });
  const selectorMap = {
    '#panel-groups': panel,
    '[data-group-list-view]': elements.list,
    '[data-group-chat-view]': elements.chat,
    '[data-message-list]': elements.messageList,
    '[data-active-group-name]': elements.activeName,
    '[data-active-group-privacy]': elements.activePrivacy,
    '[data-active-group-members]': elements.activeMembers,
    '[data-group-member-rail]': elements.memberRail,
    '[data-member-list]': elements.memberList,
    '[data-join-requests]': elements.joins,
    '[data-pinned-messages]': elements.pinned,
    '[data-group-thread-panel]': elements.threadPanel,
    '[data-thread-messages]': elements.threadMessages
  };
  const documentListeners = {};
  const body = {
    appendChild(node) { node.parentNode = body; },
    removeChild(node) { node.parentNode = null; }
  };
  const document = {
    readyState: 'loading',
    body,
    createElement() { return fakeElement(); },
    addEventListener(type, listener) {
      if (!documentListeners[type]) documentListeners[type] = [];
      documentListeners[type].push(listener);
    },
    querySelector(selector) { return selectorMap[selector] || null; },
    querySelectorAll() { return []; }
  };
  panel.parentNode = document;

  function fire(type, target) {
    const handlers = panel.listeners[type] || [];
    assert.ok(handlers.length, `panel must delegate ${type} events`);
    if (!target.parentNode) target.parentNode = panel;
    const event = { target, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    handlers.forEach((handler) => handler(event));
    return event;
  }

  return { document, elements, panel, fire };
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

test('filters, saves, progresses, and safely shares owner courses', () => {
  const api = loadApi();
  for (const category of ['operations', 'marketing', 'team-management', 'customer-experience']) {
    assert.ok(api.filterCourses(category).every((course) => course.category === category));
  }
  assert.equal(api.toggleSavedCourse('course-retention').ok, true);
  assert.equal(api.setCourseProgress('course-retention', 125).course.progress, 100);
  assert.equal(api.setCourseProgress('course-retention', -25).course.progress, 0);
  assert.equal(api.shareCourse('course-retention', 'vip-club').ok, false);
  assert.equal(api.shareCourse('course-retention', 'staff-main').ok, true);
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

test('keeps membership and role changes isolated per group', () => {
  const api = loadApi();
  assert.ok(Array.isArray(api.state.members['staff-main']));
  assert.ok(Array.isArray(api.state.members['vip-club']));
  const staffSophie = api.state.members['staff-main'].find((member) => member.id === 'member-sophie');
  const vipSophie = api.state.members['vip-club'].find((member) => member.id === 'member-sophie');
  assert.notEqual(staffSophie, vipSophie);
  assert.equal(api.setMemberRole('staff-main', 'member-sophie', 'admin').ok, true);
  assert.equal(staffSophie.role, 'admin');
  assert.equal(vipSophie.role, 'member');
  assert.equal(api.setMemberRole('vip-club', 'member-linh', 'moderator').ok, false);

  const created = api.createGroup({ name: 'Solo owners', type: 'staff' });
  assert.equal(created.ok, true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(api.state.members[created.group.id])),
    [{ id: 'owner-nexora', name: 'Nexora Touch', role: 'owner', status: 'online' }]
  );
  assert.deepEqual(JSON.parse(JSON.stringify(api.state.messages[created.group.id])), []);
});

test('delegates group list, detail, thread, members, and back navigation', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  dom.fire('click', fakeElement({ 'data-group-open': 'staff-main' }));
  assert.equal(api.state.activeGroupId, 'staff-main');
  assert.equal(dom.elements.list.hidden, true);
  assert.equal(dom.elements.chat.hidden, false);
  assert.match(dom.elements.memberList.innerHTML, /Linh Nguyen/);
  assert.doesNotMatch(dom.elements.memberList.innerHTML, /Maya Lewis/);

  dom.fire('click', fakeElement({ 'data-thread-open': 'staff-message-1' }));
  assert.equal(api.state.activeThreadId, 'staff-message-1');
  assert.equal(dom.elements.threadPanel.hidden, false);
  assert.equal(dom.elements.memberRail.hidden, true);

  dom.fire('click', fakeElement({ 'data-thread-close': '' }));
  assert.equal(api.state.activeThreadId, '');
  assert.equal(dom.elements.threadPanel.hidden, true);
  assert.equal(dom.elements.memberRail.hidden, false);

  dom.fire('click', fakeElement({ 'data-members-open': '' }));
  assert.equal(dom.elements.memberRail.classList.contains('is-mobile-open'), true);
  dom.fire('click', fakeElement({ 'data-groups-back': '' }));
  dom.fire('click', fakeElement({ 'data-group-open': 'vip-club' }));
  assert.match(dom.elements.memberList.innerHTML, /Maya Lewis/);
  assert.doesNotMatch(dom.elements.memberList.innerHTML, /Linh Nguyen/);
  dom.fire('click', fakeElement({ 'data-groups-back': '' }));
  assert.equal(api.state.activeGroupId, '');
  assert.equal(dom.elements.list.hidden, false);
  assert.equal(dom.elements.chat.hidden, true);
});

test('delegates composer, reply, reaction, moderation, and role-change actions', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  dom.fire('click', fakeElement({ 'data-group-open': 'staff-main' }));

  const messageInput = fakeElement();
  const messageError = fakeElement();
  messageInput.value = '  Delegated message  ';
  const composer = fakeElement(
    { 'data-message-composer': '' },
    { '[data-message-input]': messageInput, '[data-message-error]': messageError }
  );
  const beforeMessages = api.state.messages['staff-main'].length;
  assert.equal(dom.fire('submit', composer).defaultPrevented, true);
  assert.equal(api.state.messages['staff-main'].length, beforeMessages + 1);
  assert.equal(api.state.messages['staff-main'].at(-1).body, 'Delegated message');
  assert.equal(messageInput.value, '');

  dom.fire('click', fakeElement({ 'data-thread-open': 'staff-message-1' }));
  const threadInput = fakeElement();
  const threadError = fakeElement();
  threadInput.value = '  Delegated reply  ';
  const threadForm = fakeElement(
    { 'data-thread-form': '' },
    { '[data-thread-input]': threadInput, '[data-thread-error]': threadError }
  );
  const threadMessage = api.state.messages['staff-main'].find((message) => message.id === 'staff-message-1');
  const beforeReplies = threadMessage.replies.length;
  dom.fire('submit', threadForm);
  assert.equal(threadMessage.replies.length, beforeReplies + 1);
  assert.equal(threadMessage.replies.at(-1).body, 'Delegated reply');

  const beforeReaction = threadMessage.reactions['👍'];
  dom.fire('click', fakeElement({ 'data-message-id': 'staff-message-1', 'data-message-reaction': '👍' }));
  assert.equal(threadMessage.reactions['👍'], beforeReaction + 1);
  const moderated = api.state.messages['staff-main'].find((message) => message.id === 'staff-message-2');
  dom.fire('click', fakeElement({ 'data-message-id': 'staff-message-2', 'data-message-moderation': 'pin' }));
  assert.equal(moderated.pinned, true);

  const roleSelect = fakeElement({ 'data-member-role': 'member-sophie' });
  roleSelect.value = 'admin';
  dom.fire('change', roleSelect);
  assert.equal(api.state.members['staff-main'].find((member) => member.id === 'member-sophie').role, 'admin');
  assert.equal(api.state.members['vip-club'].find((member) => member.id === 'member-sophie').role, 'member');
});

test('escapes user messages and thread replies in rendered markup', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  api.openGroup('staff-main');
  const sent = api.sendMessage('staff-main', '<img src=x onerror=alert(1)>');
  api.addThreadReply('staff-main', sent.message.id, '<script>alert(1)</script>');
  api.state.activeThreadId = sent.message.id;
  api.renderGroupChat();

  assert.match(dom.elements.messageList.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(dom.elements.messageList.innerHTML, /<img/);
  assert.match(dom.elements.threadMessages.innerHTML, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(dom.elements.threadMessages.innerHTML, /<script>/);
});

test('filters and moves privacy-protected candidates through the owner pipeline', () => {
  const api = loadApi();
  assert.equal(api.filterCandidates({ skill: 'Gel-X', maxDistance: 5 })[0].id, 'a7');
  assert.equal(api.moveCandidate('a7', 'contact-requested').ok, true);
  assert.equal(api.moveCandidate('a7', 'interviewing').ok, true);
  assert.equal(api.moveCandidate('a7', 'unknown').ok, false);
  assert.equal(api.toggleSavedCandidate('a7').candidate.saved, true);
});

test('validates owner job posts before publishing', () => {
  const api = loadApi();
  assert.equal(api.validateJobPost({ jobTitle: '', jobSkills: 'Gel-X', jobDistance: 10 }).ok, false);
  assert.equal(api.validateJobPost({ jobTitle: 'Nail Tech', jobSkills: '', jobDistance: 10 }).ok, false);
  assert.equal(api.validateJobPost({ jobTitle: 'Nail Tech', jobSkills: 'Gel-X', jobDistance: 0 }).ok, false);
  assert.equal(api.validateJobPost({ jobTitle: 'Nail Tech', jobSkills: 'Gel-X', jobDistance: 10 }).ok, true);
});

export { loadApi };
