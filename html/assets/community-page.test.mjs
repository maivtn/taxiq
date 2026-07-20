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
    disabled: false,
    ownerDocument: null,
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
    querySelector(selector) {
      const value = this.selectorMap[selector];
      return Array.isArray(value) ? (value[0] || null) : (value || null);
    },
    querySelectorAll(selector) {
      const value = this.selectorMap[selector];
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    },
    focus() {
      this.focused = true;
      if (this.ownerDocument) this.ownerDocument.activeElement = this;
    }
  };
}

function createDelegatedDom({ panelSelector, selectorMap = {}, selectorAllMap = {} }) {
  const panel = fakeElement();
  const documentListeners = {};
  const appended = [];
  const body = {
    appendChild(node) {
      node.parentNode = body;
      appended.push(node);
    },
    removeChild(node) {
      node.parentNode = null;
      const index = appended.indexOf(node);
      if (index >= 0) appended.splice(index, 1);
    }
  };
  const document = {
    readyState: 'loading',
    activeElement: null,
    body,
    createElement() {
      const node = fakeElement();
      node.ownerDocument = document;
      return node;
    },
    addEventListener(type, listener) {
      if (!documentListeners[type]) documentListeners[type] = [];
      documentListeners[type].push(listener);
    },
    querySelector(selector) {
      if (selector === panelSelector) return panel;
      return selectorMap[selector] || null;
    },
    querySelectorAll(selector) { return selectorAllMap[selector] || []; }
  };
  panel.parentNode = document;
  panel.ownerDocument = document;

  function fireOn(node, type, target, additions = {}) {
    const handlers = node.listeners[type] || [];
    assert.ok(handlers.length, `${type} must be delegated`);
    const event = {
      target,
      key: additions.key,
      shiftKey: Boolean(additions.shiftKey),
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }
    };
    handlers.forEach((handler) => handler(event));
    return event;
  }

  function firePanel(type, target, additions) {
    if (!target.parentNode) target.parentNode = panel;
    return fireOn(panel, type, target, additions);
  }

  function fireDocument(type, target, additions = {}) {
    const handlers = documentListeners[type] || [];
    assert.ok(handlers.length, `document must handle ${type}`);
    const event = {
      target,
      key: additions.key,
      shiftKey: Boolean(additions.shiftKey),
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }
    };
    handlers.forEach((handler) => handler(event));
    return event;
  }

  return { document, panel, appended, firePanel, fireDocument };
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
  const beforeRejectedShare = JSON.stringify(api.state.posts);
  assert.equal(api.shareCourse('course-retention', 'vip-club').ok, false);
  assert.equal(JSON.stringify(api.state.posts), beforeRejectedShare);
  const shared = api.shareCourse('course-retention', 'staff-main');
  assert.equal(shared.ok, true);
  assert.equal(api.state.posts[0], shared.post);
  assert.equal(shared.post.groupId, 'staff-main');
  assert.equal(shared.post.group, 'Nexora Touch Staff');
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

test('delegates Jobs filters, pipeline actions, and privacy-safe sharing', () => {
  const notice = fakeElement({ 'data-community-notice': '' });
  const saves = { a7: fakeElement({ 'data-owner-job-action': 'save' }), c2: fakeElement({ 'data-owner-job-action': 'save' }) };
  const cards = {
    a7: fakeElement({ 'data-owner-candidate': 'a7' }, { '[data-owner-job-action="save"]': saves.a7 }),
    c2: fakeElement({ 'data-owner-candidate': 'c2' }, { '[data-owner-job-action="save"]': saves.c2 })
  };
  const counts = Object.fromEntries(['matched', 'contact-requested', 'interviewing', 'closed'].map((stage) => [stage, fakeElement()]));
  const dom = createDelegatedDom({
    panelSelector: '#panel-jobs',
    selectorMap: {
      '[data-community-notice]': notice,
      ...Object.fromEntries(Object.entries(counts).map(([stage, node]) => [`[data-stage-count="${stage}"]`, node]))
    },
    selectorAllMap: { '[data-owner-candidate]': Object.values(cards) }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });

  const skillFilter = fakeElement({ 'data-candidate-filter': 'skill' });
  skillFilter.value = 'Pedicure';
  dom.firePanel('change', skillFilter);
  assert.equal(cards.a7.hidden, true);
  assert.equal(cards.c2.hidden, false);

  const request = fakeElement({ 'data-owner-job-action': 'request-contact' });
  request.parentNode = cards.a7;
  dom.firePanel('click', request);
  assert.equal(api.state.candidates.find((candidate) => candidate.id === 'a7').stage, 'contact-requested');
  assert.equal(counts['contact-requested'].textContent, 1);
  assert.equal(request.textContent, 'Contact requested');

  const beforeShare = JSON.stringify(api.state.candidates);
  const share = fakeElement({ 'data-owner-job-action': 'share' });
  share.parentNode = cards.c2;
  dom.firePanel('click', share);
  assert.equal(JSON.stringify(api.state.candidates), beforeShare);
  assert.match(notice.textContent || dom.appended.at(-1).textContent, /Anonymous candidate summary shared/);
});

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

test('seeds every salon event type and validates event creation fields in order', () => {
  const api = loadApi();
  assert.deepEqual(
    [...new Set(api.state.events.map((event) => event.type))].sort(),
    ['customer-event', 'industry', 'promotion', 'staff-training']
  );
  assert.equal(api.createEvent({ title: 'Bad type', type: 'party' }).error, 'Choose a valid event type.');
  assert.equal(api.createEvent({ title: 'No start', type: 'industry' }).error, 'Choose a future start time.');
  assert.equal(api.createEvent({ title: 'Bad end', type: 'industry', start: '2099-08-12T10:00', end: '2099-08-12T09:00' }).error, 'End time must be after start time.');
  assert.equal(api.createEvent({ title: 'Bad capacity', type: 'industry', start: '2099-08-12T10:00', end: '2099-08-12T11:00', capacity: 0 }).error, 'Capacity must be at least one.');
  assert.equal(api.createEvent({ title: 'Missing capacity', type: 'industry', start: '2099-08-12T10:00', end: '2099-08-12T11:00', audience: 'staff-main' }).error, 'Capacity must be at least one.');
  assert.equal(api.createEvent({ title: 'Bad group', type: 'industry', start: '2099-08-12T10:00', end: '2099-08-12T11:00', capacity: 10, audience: 'missing' }).error, 'Choose an existing audience group.');
});

test('keeps RSVP and Feed announcements scoped to known events and groups', () => {
  const api = loadApi();
  const event = api.state.events[0];
  const beforePosts = api.state.posts.length;
  assert.equal(api.setEventRsvp('missing', 'going').ok, false);
  assert.equal(api.announceEvent('missing', event.audience).ok, false);
  assert.equal(api.announceEvent(event.id, 'missing').ok, false);
  const announced = api.announceEvent(event.id, event.audience);
  assert.equal(announced.ok, true);
  assert.equal(api.state.posts.length, beforePosts + 1);
  assert.equal(announced.post.kind, 'announcement');
  assert.equal(announced.post.groupId, event.audience);
});

test('keeps failed Event operations atomic', () => {
  const api = loadApi();
  const event = api.state.events[0];
  const eventSnapshot = JSON.stringify(event);
  const eventsSnapshot = JSON.stringify(api.state.events);
  const postsSnapshot = JSON.stringify(api.state.posts);
  const activeEventId = api.state.activeEventId;

  assert.equal(api.setEventRsvp(event.id, 'unknown').ok, false);
  assert.equal(JSON.stringify(event), eventSnapshot);
  assert.equal(api.createEvent({ title: 'Invalid event', type: 'industry', start: 'not-a-date' }).ok, false);
  assert.equal(JSON.stringify(api.state.events), eventsSnapshot);
  assert.equal(api.state.activeEventId, activeEventId);
  assert.equal(api.announceEvent(event.id, 'missing').ok, false);
  assert.equal(JSON.stringify(api.state.posts), postsSnapshot);
});

test('delegates Event list and calendar controls and escapes rendered event content', () => {
  const list = fakeElement();
  const calendar = fakeElement();
  const detail = fakeElement();
  const filters = ['all', 'staff-training', 'customer-event', 'promotion', 'industry'].map((type) => fakeElement({ 'data-event-filter': type }));
  const views = ['list', 'calendar'].map((view) => fakeElement({ 'data-event-view': view }));
  const dom = createDelegatedDom({
    panelSelector: '#panel-events',
    selectorMap: {
      '[data-event-list]': list,
      '[data-event-calendar]': calendar,
      '[data-event-detail]': detail
    },
    selectorAllMap: {
      '[data-event-filter]': filters,
      '[data-event-view]': views
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });

  dom.firePanel('click', filters[1]);
  assert.equal(api.state.eventFilter, 'staff-training');
  assert.match(list.innerHTML, /Staff Training/);
  assert.doesNotMatch(list.innerHTML, /Customer Event/);
  dom.firePanel('click', views[1]);
  assert.equal(api.state.eventView, 'calendar');
  assert.equal(list.hidden, true);
  assert.equal(calendar.hidden, false);
  assert.match(calendar.innerHTML, /event-calendar-day/);

  const event = api.state.events.find((item) => item.type === 'staff-training');
  event.title = '<img src=x onerror=alert(1)>';
  event.description = '<script>alert(2)</script>';
  event.location = '<b>Back room</b>';
  event.attendees = ['<svg onload=alert(3)>'];
  api.renderEvents();
  assert.match(list.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(list.innerHTML, /&lt;script&gt;alert\(2\)&lt;\/script&gt;/);
  assert.match(list.innerHTML, /&lt;b&gt;Back room&lt;\/b&gt;/);
  assert.match(calendar.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(detail.innerHTML, /&lt;svg onload=alert\(3\)&gt;/);
  assert.doesNotMatch(list.innerHTML + calendar.innerHTML + detail.innerHTML, /<(?:img|script|svg|b)[ >]/);
});

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

test('opens one active dialog, traps focus, closes from Escape and backdrop, and restores its opener', () => {
  const title = fakeElement({ name: 'jobTitle' });
  const cancel = fakeElement({ 'data-dialog-close': '' });
  const submit = fakeElement();
  const focusableSelector = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href]';
  const dialog = fakeElement(
    { 'data-create-job-dialog': '' },
    {
      'input,select,textarea': title,
      'button': cancel,
      'input,select,textarea,button': cancel,
      [focusableSelector]: [title, cancel, submit]
    }
  );
  dialog.hidden = true;
  const error = fakeElement();
  const dom = createDelegatedDom({
    panelSelector: '#panel-jobs',
    selectorMap: {
      '[data-create-job-dialog]': dialog,
      '[name="jobTitle"]': title,
      '[data-job-form-error]': error
    }
  });
  for (const node of [dialog, title, cancel, submit]) node.ownerDocument = dom.document;
  loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  const opener = fakeElement({ 'data-create-job-open': '' });
  opener.ownerDocument = dom.document;
  dom.document.activeElement = opener;

  dom.firePanel('click', opener);
  assert.equal(dialog.hidden, false);
  assert.equal(dom.document.activeElement, title);
  dom.document.activeElement = submit;
  const wrapped = dom.fireDocument('keydown', submit, { key: 'Tab' });
  assert.equal(wrapped.defaultPrevented, true);
  assert.equal(dom.document.activeElement, title);
  dom.fireDocument('keydown', title, { key: 'Escape' });
  assert.equal(dialog.hidden, true);
  assert.equal(dom.document.activeElement, opener);

  dom.firePanel('click', opener);
  dom.fireDocument('click', dialog);
  assert.equal(dialog.hidden, true);
  assert.equal(dom.document.activeElement, opener);
});

export { loadApi };
