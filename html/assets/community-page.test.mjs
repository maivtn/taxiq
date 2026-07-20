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
  Object.assign(window, overrides.window || {});
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
    removeAttribute(name) { delete this.attributes[name]; },
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

function createTabsDom() {
  const names = ['feed', 'groups', 'learning', 'jobs', 'events'];
  const pageTabs = names.map((name, index) => fakeElement({
    role: 'tab',
    'data-tab-target': name,
    'aria-selected': index === 0 ? 'true' : 'false',
    tabindex: index === 0 ? '0' : '-1'
  }));
  const sidebarTabs = names.map((name, index) => {
    const tab = fakeElement({ 'data-shell-tab': name });
    tab.classList.toggle('is-active', index === 0);
    return tab;
  });
  const panels = names.map((name, index) => {
    const panel = fakeElement({ 'data-tab-panel': name, id: `panel-${name}` });
    panel.hidden = index !== 0;
    return panel;
  });
  const dom = createDelegatedDom({
    panelSelector: '#no-feature-panel',
    selectorAllMap: {
      '[data-tab-target]': pageTabs,
      '.page-tabs [role="tab"]': pageTabs,
      '[data-tab-panel]': panels
    }
  });
  for (const node of [...pageTabs, ...sidebarTabs, ...panels]) {
    node.ownerDocument = dom.document;
    node.parentNode = dom.document;
  }
  return { ...dom, names, pageTabs, sidebarTabs, panels };
}

function createGroupDom() {
  const focusableSelector = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href]';
  const groupFilters = ['all', 'staff', 'customer', 'mixed', 'archived'].map((type) => fakeElement({
    'data-group-filter': type,
    'aria-pressed': type === 'all' ? 'true' : 'false'
  }));
  const elements = {
    list: fakeElement(),
    chat: fakeElement(),
    messageList: fakeElement(),
    activeName: fakeElement(),
    activePrivacy: fakeElement(),
    activeMembers: fakeElement(),
    chatHead: fakeElement({ 'data-group-overlay-background': '' }),
    messageColumn: fakeElement({ 'data-group-overlay-background': '' }),
    membersTrigger: fakeElement({ 'data-members-open': '', 'aria-expanded': 'false', 'aria-controls': 'group-member-panel' }),
    threadTrigger: fakeElement({ 'data-thread-open': 'staff-message-1', 'aria-expanded': 'false', 'aria-controls': 'group-thread-panel' }),
    memberFirst: fakeElement(),
    memberLast: fakeElement(),
    memberRail: fakeElement({ id: 'group-member-panel', 'aria-label': 'Group members' }),
    memberList: fakeElement(),
    joins: fakeElement(),
    pinned: fakeElement(),
    threadFirst: fakeElement({ 'data-thread-close': '' }),
    threadLast: fakeElement(),
    threadPanel: fakeElement({ id: 'group-thread-panel', 'aria-label': 'Message thread' }),
    threadMessages: fakeElement(),
    searchInput: fakeElement({ 'data-message-search-input': '' }),
    searchSummary: fakeElement(),
    attachmentStatus: fakeElement(),
    attachmentName: fakeElement(),
    settingsDialog: fakeElement({ 'data-group-settings-dialog': '' }),
    settingsDescription: fakeElement({ name: 'manageGroupDescription' }),
    settingsVisibility: fakeElement({ name: 'manageGroupVisibility' }),
    settingsPosting: fakeElement({ name: 'manageGroupPosting' }),
    settingsError: fakeElement()
  };
  elements.chat.hidden = true;
  elements.threadPanel.hidden = true;
  elements.attachmentStatus.hidden = true;
  elements.settingsDialog.hidden = true;
  elements.settingsDialog.selectorMap['input,select,textarea'] = elements.settingsDescription;
  elements.memberRail.selectorMap[focusableSelector] = [elements.memberFirst, elements.memberLast];
  elements.threadPanel.selectorMap[focusableSelector] = [elements.threadFirst, elements.threadLast];
  const panel = fakeElement({ id: 'panel-groups' });
  const selectorMap = {
    '#panel-groups': panel,
    '[data-group-list-view]': elements.list,
    '[data-group-chat-view]': elements.chat,
    '[data-message-list]': elements.messageList,
    '[data-active-group-name]': elements.activeName,
    '[data-active-group-privacy]': elements.activePrivacy,
    '[data-active-group-members]': elements.activeMembers,
    '[data-members-open]': elements.membersTrigger,
    '[data-group-member-rail]': elements.memberRail,
    '[data-member-list]': elements.memberList,
    '[data-join-requests]': elements.joins,
    '[data-pinned-messages]': elements.pinned,
    '[data-group-thread-panel]': elements.threadPanel,
    '[data-thread-messages]': elements.threadMessages,
    '[data-message-search-input]': elements.searchInput,
    '[data-message-search-summary]': elements.searchSummary,
    '[data-message-attachment-status]': elements.attachmentStatus,
    '[data-message-attachment-name]': elements.attachmentName,
    '[data-group-settings-dialog]': elements.settingsDialog,
    '[name="manageGroupDescription"]': elements.settingsDescription,
    '[name="manageGroupVisibility"]': elements.settingsVisibility,
    '[name="manageGroupPosting"]': elements.settingsPosting,
    '[data-group-settings-error]': elements.settingsError
  };
  const documentListeners = {};
  const body = {
    appendChild(node) { node.parentNode = body; },
    removeChild(node) { node.parentNode = null; }
  };
  const document = {
    readyState: 'loading',
    activeElement: null,
    body,
    createElement() { return fakeElement(); },
    addEventListener(type, listener) {
      if (!documentListeners[type]) documentListeners[type] = [];
      documentListeners[type].push(listener);
    },
    querySelector(selector) { return selectorMap[selector] || null; },
    querySelectorAll(selector) {
      if (selector === '[data-group-filter]') return groupFilters;
      if (selector === '[data-thread-open]') return [elements.threadTrigger];
      if (selector === '[data-group-overlay-background]') return [elements.chatHead, elements.messageColumn];
      return [];
    }
  };
  panel.parentNode = document;
  for (const element of Object.values(elements)) {
    element.ownerDocument = document;
    if (!element.parentNode) element.parentNode = panel;
  }

  function fire(type, target) {
    const handlers = panel.listeners[type] || [];
    assert.ok(handlers.length, `panel must delegate ${type} events`);
    if (!target.parentNode) target.parentNode = panel;
    const event = { target, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    handlers.forEach((handler) => handler(event));
    return event;
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

  return { document, elements, groupFilters, panel, fire, fireDocument };
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

test('targets known Feed groups and persists escaped demo attachment metadata atomically', () => {
  const api = loadApi();
  const beforeInvalid = JSON.stringify(api.state.posts);
  assert.equal(api.addFeedPost('Private update', 'missing-group').ok, false);
  assert.equal(JSON.stringify(api.state.posts), beforeInvalid);

  const selected = api.selectFeedAttachment('file', '<summer-guide>.pdf');
  assert.equal(selected.ok, true);
  const selectedSnapshot = JSON.stringify({ posts: api.state.posts, attachment: api.state.feedAttachment });
  assert.equal(api.addFeedPost('Must not broaden', 'unknown-target').ok, false);
  assert.equal(JSON.stringify({ posts: api.state.posts, attachment: api.state.feedAttachment }), selectedSnapshot);
  const posted = api.addFeedPost('VIP preview details', 'vip-club');
  assert.equal(posted.ok, true);
  assert.equal(posted.post.groupId, 'vip-club');
  assert.equal(posted.post.group, 'VIP Nail Club');
  assert.equal(posted.post.audience, 'customer');
  assert.deepEqual(JSON.parse(JSON.stringify(posted.post.attachment)), {
    kind: 'file',
    name: '<summer-guide>.pdf'
  });
  assert.equal(api.state.feedAttachment, null);

  const invalidAttachmentSnapshot = JSON.stringify(api.state);
  assert.equal(api.selectFeedAttachment('executable', 'unsafe.exe').ok, false);
  assert.equal(JSON.stringify(api.state), invalidAttachmentSnapshot);
});

test('renders known Feed audience choices and supports selecting and clearing demo filenames', () => {
  const list = fakeElement();
  const audience = fakeElement({ 'data-feed-audience': '' });
  const status = fakeElement({ 'data-feed-attachment-status': '' });
  const name = fakeElement({ 'data-feed-attachment-name': '' });
  status.hidden = true;
  const dom = createDelegatedDom({
    panelSelector: '#no-feature-panel',
    selectorMap: {
      '[data-feed-list]': list,
      '[data-feed-audience]': audience,
      '[data-feed-attachment-status]': status,
      '[data-feed-attachment-name]': name
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });

  assert.match(audience.innerHTML, /value="staff-main"[^>]*>Nexora Touch Staff/);
  assert.match(audience.innerHTML, /value="vip-club"[^>]*>VIP Nail Club/);
  dom.fireDocument('click', fakeElement({ 'data-demo-attachment': 'file' }));
  assert.equal(api.state.feedAttachment.kind, 'file');
  assert.match(name.textContent, /\.pdf$/);
  assert.equal(status.hidden, false);
  dom.fireDocument('click', fakeElement({ 'data-feed-attachment-clear': '' }));
  assert.equal(api.state.feedAttachment, null);
  assert.equal(status.hidden, true);

  api.selectFeedAttachment('file', '<unsafe-name>.pdf');
  api.addFeedPost('Attachment escaping', 'staff-main');
  assert.match(list.innerHTML, /&lt;unsafe-name&gt;\.pdf/);
  assert.doesNotMatch(list.innerHTML, /<unsafe-name>/);
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

test('renders every Learning card with format, duration, level, rating, and progress metadata', () => {
  const grid = fakeElement();
  const saved = fakeElement();
  const dom = createDelegatedDom({
    panelSelector: '#no-feature-panel',
    selectorMap: {
      '[data-course-grid]': grid,
      '[data-saved-course-list]': saved
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });

  assert.ok(api.state.courses.every((course) => course.format && course.duration && course.level));
  assert.ok(api.state.courses.every((course) => Number.isFinite(course.rating) && course.rating >= 0 && course.rating <= 5));
  for (const course of api.state.courses) {
    assert.match(grid.innerHTML, new RegExp(course.format));
    assert.match(grid.innerHTML, new RegExp(course.duration));
    assert.match(grid.innerHTML, new RegExp(course.level));
    assert.match(grid.innerHTML, new RegExp(String(course.rating).replace('.', '\\.')));
    assert.match(grid.innerHTML, new RegExp(`${course.progress}%`));
  }
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
  assert.equal(api.filterGroups('', 'all').some((group) => group.id === created.group.id), false);
  assert.equal(api.filterGroups('', 'mixed').some((group) => group.id === created.group.id), false);
  assert.equal(api.filterGroups('', 'archived').filter((group) => group.id === created.group.id).length, 1);
  assert.equal(api.toggleArchivedGroup(created.group.id).group.archived, false);
  assert.equal(api.filterGroups('', 'all').some((group) => group.id === created.group.id), true);
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

test('excludes archived groups from active cards, summaries, unread counts, and pending requests', () => {
  const grid = fakeElement();
  const search = fakeElement({ 'data-group-search': '' });
  const total = fakeElement();
  const members = fakeElement();
  const unread = fakeElement();
  const pending = fakeElement();
  const dom = createDelegatedDom({
    panelSelector: '#no-feature-panel',
    selectorMap: {
      '[data-group-grid]': grid,
      '[data-group-search]': search,
      '[data-group-total]': total,
      '[data-member-total]': members,
      '[data-unread-total]': unread,
      '[data-pending-total]': pending
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  const archived = api.state.groups.find((group) => group.id === 'staff-main');
  api.toggleArchivedGroup(archived.id);
  api.renderGroups();
  const active = api.state.groups.filter((group) => !group.archived);
  const activePending = active.reduce((sum, group) => sum + api.state.joinRequests[group.id].length, 0);

  assert.equal(total.textContent, active.length);
  assert.equal(members.textContent, active.reduce((sum, group) => sum + group.members, 0));
  assert.equal(unread.textContent, active.reduce((sum, group) => sum + group.unread, 0));
  assert.equal(pending.textContent, activePending);
  assert.doesNotMatch(grid.innerHTML, /Nexora Touch Staff/);

  api.state.groupFilter = 'archived';
  api.renderGroups();
  assert.match(grid.innerHTML, /Nexora Touch Staff/);
  assert.doesNotMatch(grid.innerHTML, /data-group-open="staff-main"/);
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
  const ownerSnapshot = JSON.stringify(api.state.members['staff-main']);
  assert.equal(api.setMemberRole('staff-main', 'owner-nexora', 'member').ok, false);
  assert.equal(JSON.stringify(api.state.members['staff-main']), ownerSnapshot);
  assert.equal(api.state.members['staff-main'].filter((member) => member.role === 'owner').length, 1);
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

test('resolves per-group join requests with Staff-directory and customer eligibility guardrails', () => {
  const api = loadApi();
  const staffGroup = api.state.groups.find((group) => group.id === 'staff-main');
  const vipGroup = api.state.groups.find((group) => group.id === 'vip-club');
  const staffRequest = api.state.joinRequests['staff-main'][0];
  const customerRequest = api.state.joinRequests['vip-club'][0];
  const staffMemberCount = staffGroup.members;
  const vipMemberCount = vipGroup.members;

  assert.equal(staffRequest.memberType, 'staff');
  assert.equal(staffRequest.source, 'staff-directory');
  const approvedStaff = api.resolveJoinRequest('staff-main', staffRequest.id, 'approve');
  assert.equal(approvedStaff.ok, true);
  assert.equal(staffGroup.members, staffMemberCount + 1);
  assert.equal(api.state.joinRequests['staff-main'].some((request) => request.id === staffRequest.id), false);
  assert.equal(api.state.members['staff-main'].some((member) => member.id === staffRequest.memberId && member.memberType === 'staff'), true);
  assert.equal(api.state.members['vip-club'].some((member) => member.id === staffRequest.memberId), false);

  const approvedCustomer = api.resolveJoinRequest('vip-club', customerRequest.id, 'approve');
  assert.equal(approvedCustomer.ok, true);
  assert.equal(vipGroup.members, vipMemberCount + 1);
  assert.equal(api.state.members['vip-club'].some((member) => member.id === customerRequest.memberId && member.memberType === 'customer'), true);

  api.state.joinRequests['staff-main'].push({
    id: 'invalid-customer-request',
    memberId: 'customer-never-staff',
    name: 'Customer Never Staff',
    memberType: 'customer',
    source: 'verified-customer'
  });
  const invalidSnapshot = JSON.stringify({
    requests: api.state.joinRequests['staff-main'],
    members: api.state.members['staff-main'],
    count: staffGroup.members
  });
  assert.equal(api.resolveJoinRequest('staff-main', 'invalid-customer-request', 'approve').ok, false);
  assert.equal(JSON.stringify({
    requests: api.state.joinRequests['staff-main'],
    members: api.state.members['staff-main'],
    count: staffGroup.members
  }), invalidSnapshot);
  assert.equal(api.resolveJoinRequest('staff-main', 'invalid-customer-request', 'decline').ok, true);
  assert.equal(api.state.members['staff-main'].some((member) => member.id === 'customer-never-staff'), false);
});

test('persists group settings, message search, attachments, reports, and member mutes in session state', () => {
  const api = loadApi();
  const staff = api.state.groups.find((group) => group.id === 'staff-main');
  const vipSnapshot = JSON.stringify(api.state.groups.find((group) => group.id === 'vip-club'));
  const updated = api.updateGroup('staff-main', {
    description: 'Private operating updates only.',
    visibility: 'private',
    posting: 'moderators'
  });
  assert.equal(updated.ok, true);
  assert.equal(staff.description, 'Private operating updates only.');
  assert.equal(staff.posting, 'moderators');
  assert.equal(JSON.stringify(api.state.groups.find((group) => group.id === 'vip-club')), vipSnapshot);

  const search = api.searchMessages('staff-main', 'coverage');
  assert.equal(search.ok, true);
  assert.deepEqual(JSON.parse(JSON.stringify(search.messages.map((message) => message.id))), ['staff-message-1']);
  assert.equal(api.searchMessages('missing', 'coverage').ok, false);

  assert.equal(api.selectMessageAttachment('staff-main', 'file', 'shift-plan.pdf').ok, true);
  const pendingAttachmentSnapshot = JSON.stringify(api.state.messageAttachments);
  assert.equal(api.sendMessage('staff-main', ' ').ok, false);
  assert.equal(JSON.stringify(api.state.messageAttachments), pendingAttachmentSnapshot);
  const sent = api.sendMessage('staff-main', 'Please review the attachment.');
  assert.equal(sent.ok, true);
  assert.deepEqual(JSON.parse(JSON.stringify(sent.message.attachment)), { kind: 'file', name: 'shift-plan.pdf' });
  assert.equal(api.state.messageAttachments['staff-main'], undefined);

  const reported = api.reportMessage('staff-main', 'staff-message-2');
  assert.equal(reported.ok, true);
  assert.equal(reported.message.reported, true);
  assert.equal(api.state.reports.filter((report) => report.messageId === 'staff-message-2').length, 1);
  const muted = api.toggleMutedMember('staff-main', 'member-sophie');
  assert.equal(muted.ok, true);
  assert.equal(muted.member.muted, true);
  assert.equal(api.state.members['vip-club'].find((member) => member.id === 'member-sophie').muted, undefined);

  const failureSnapshot = JSON.stringify({ reports: api.state.reports, members: api.state.members, attachments: api.state.messageAttachments });
  assert.equal(api.reportMessage('staff-main', 'missing').ok, false);
  assert.equal(api.toggleMutedMember('staff-main', 'owner-nexora').ok, false);
  assert.equal(api.selectMessageAttachment('missing', 'file', 'nope.pdf').ok, false);
  assert.equal(JSON.stringify({ reports: api.state.reports, members: api.state.members, attachments: api.state.messageAttachments }), failureSnapshot);
});

test('delegates group list, detail, thread, members, and back navigation', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, window: { innerWidth: 390 }, setTimeout() { return 1; }, clearTimeout() {} });
  assert.equal(dom.groupFilters.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(dom.groupFilters[0].getAttribute('aria-pressed'), 'true');
  dom.fire('click', dom.groupFilters[4]);
  assert.equal(dom.groupFilters[0].getAttribute('aria-pressed'), 'false');
  assert.equal(dom.groupFilters[4].getAttribute('aria-pressed'), 'true');
  dom.fire('click', dom.groupFilters[0]);
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

test('makes mobile member and thread overlays modal, keyboard-contained, and focus-restoring', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, window: { innerWidth: 390 }, setTimeout() { return 1; }, clearTimeout() {} });
  dom.fire('click', fakeElement({ 'data-group-open': 'staff-main' }));

  dom.document.activeElement = dom.elements.membersTrigger;
  dom.fire('click', dom.elements.membersTrigger);
  assert.equal(api.state.memberDrawerOpen, true);
  assert.equal(dom.elements.membersTrigger.getAttribute('aria-expanded'), 'true');
  assert.equal(dom.elements.memberRail.getAttribute('role'), 'dialog');
  assert.equal(dom.elements.memberRail.getAttribute('aria-modal'), 'true');
  assert.equal(dom.elements.chatHead.getAttribute('inert'), '');
  assert.equal(dom.elements.messageColumn.getAttribute('aria-hidden'), 'true');
  assert.equal(dom.document.activeElement, dom.elements.memberFirst);
  assert.equal(dom.fireDocument('keydown', dom.elements.memberFirst, { key: 'Tab', shiftKey: true }).defaultPrevented, true);
  assert.equal(dom.document.activeElement, dom.elements.memberLast);
  assert.equal(dom.fireDocument('keydown', dom.elements.memberLast, { key: 'Tab' }).defaultPrevented, true);
  assert.equal(dom.document.activeElement, dom.elements.memberFirst);
  assert.equal(dom.fireDocument('keydown', dom.elements.memberFirst, { key: 'Escape' }).defaultPrevented, true);
  assert.equal(api.state.memberDrawerOpen, false);
  assert.equal(dom.elements.membersTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(dom.elements.memberRail.getAttribute('aria-modal'), null);
  assert.equal(dom.elements.chatHead.getAttribute('inert'), null);
  assert.equal(dom.elements.messageColumn.getAttribute('aria-hidden'), null);
  assert.equal(dom.document.activeElement, dom.elements.membersTrigger);

  dom.document.activeElement = dom.elements.threadTrigger;
  dom.fire('click', dom.elements.threadTrigger);
  assert.equal(api.state.activeThreadId, 'staff-message-1');
  assert.equal(dom.elements.threadTrigger.getAttribute('aria-expanded'), 'true');
  assert.equal(dom.elements.threadPanel.getAttribute('role'), 'dialog');
  assert.equal(dom.elements.threadPanel.getAttribute('aria-modal'), 'true');
  assert.equal(dom.document.activeElement, dom.elements.threadFirst);
  assert.equal(dom.fireDocument('keydown', dom.elements.threadFirst, { key: 'Tab', shiftKey: true }).defaultPrevented, true);
  assert.equal(dom.document.activeElement, dom.elements.threadLast);
  assert.equal(dom.fireDocument('keydown', dom.elements.threadLast, { key: 'Tab' }).defaultPrevented, true);
  assert.equal(dom.document.activeElement, dom.elements.threadFirst);
  assert.equal(dom.fireDocument('keydown', dom.elements.threadFirst, { key: 'Escape' }).defaultPrevented, true);
  assert.equal(api.state.activeThreadId, '');
  assert.equal(dom.elements.threadTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(dom.elements.threadPanel.hidden, true);
  assert.equal(dom.elements.threadPanel.getAttribute('aria-modal'), null);
  assert.equal(dom.elements.chatHead.getAttribute('aria-hidden'), null);
  assert.equal(dom.document.activeElement, dom.elements.threadTrigger);
});

test('keeps desktop member and thread panels non-modal', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, window: { innerWidth: 1024 }, setTimeout() { return 1; }, clearTimeout() {} });
  dom.fire('click', fakeElement({ 'data-group-open': 'staff-main' }));
  assert.equal(dom.elements.membersTrigger.getAttribute('aria-expanded'), 'true');
  assert.equal(dom.elements.memberRail.getAttribute('aria-hidden'), 'false');

  dom.document.activeElement = dom.elements.threadTrigger;
  dom.fire('click', dom.elements.threadTrigger);
  assert.equal(api.state.activeThreadId, 'staff-message-1');
  assert.equal(dom.elements.memberRail.hidden, true);
  assert.equal(dom.elements.threadPanel.hidden, false);
  assert.equal(dom.elements.threadPanel.getAttribute('role'), null);
  assert.equal(dom.elements.threadPanel.getAttribute('aria-modal'), null);
  assert.equal(dom.elements.messageColumn.getAttribute('inert'), null);
  assert.equal(dom.document.activeElement, dom.elements.threadTrigger);

  dom.fire('click', dom.elements.threadFirst);
  assert.equal(api.state.activeThreadId, '');
  assert.equal(dom.elements.memberRail.hidden, false);
  assert.equal(dom.elements.threadPanel.hidden, true);
  assert.equal(dom.elements.membersTrigger.getAttribute('aria-expanded'), 'true');
});

test('delegates composer, reply, reaction, moderation, and role-change actions', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  dom.fire('click', fakeElement({ 'data-group-open': 'staff-main' }));

  dom.elements.searchInput.value = 'coverage';
  dom.fire('input', dom.elements.searchInput);
  assert.equal(api.state.messageSearch, 'coverage');
  assert.match(dom.elements.messageList.innerHTML, /staff-message-1/);
  assert.doesNotMatch(dom.elements.messageList.innerHTML, /staff-message-2/);
  dom.elements.searchInput.value = '';
  dom.fire('input', dom.elements.searchInput);

  dom.fire('click', fakeElement({ 'data-group-attachment': 'file' }));
  assert.equal(api.state.messageAttachments['staff-main'].kind, 'file');
  assert.match(dom.elements.attachmentName.textContent, /\.pdf$/);
  assert.equal(dom.elements.attachmentStatus.hidden, false);

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
  assert.equal(api.state.messages['staff-main'].at(-1).attachment.kind, 'file');
  assert.equal(api.state.messageAttachments['staff-main'], undefined);
  assert.equal(dom.elements.attachmentStatus.hidden, true);
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
  dom.fire('click', fakeElement({ 'data-message-id': 'staff-message-2', 'data-message-report': '' }));
  assert.equal(moderated.reported, true);
  dom.fire('click', fakeElement({ 'data-member-mute': 'member-sophie' }));
  assert.equal(api.state.members['staff-main'].find((member) => member.id === 'member-sophie').muted, true);

  const roleSelect = fakeElement({ 'data-member-role': 'member-sophie' });
  roleSelect.value = 'admin';
  dom.fire('change', roleSelect);
  assert.equal(api.state.members['staff-main'].find((member) => member.id === 'member-sophie').role, 'admin');
  assert.equal(api.state.members['vip-club'].find((member) => member.id === 'member-sophie').role, 'member');

  const request = api.state.joinRequests['staff-main'][0];
  const beforeMemberCount = api.state.groups.find((group) => group.id === 'staff-main').members;
  dom.fire('click', fakeElement({ 'data-join-request-action': 'approve', 'data-join-request-id': request.id }));
  assert.equal(api.state.joinRequests['staff-main'].some((item) => item.id === request.id), false);
  assert.equal(api.state.groups.find((group) => group.id === 'staff-main').members, beforeMemberCount + 1);

  dom.fire('click', fakeElement({ 'data-group-manage': 'staff-main' }));
  assert.equal(dom.elements.settingsDialog.hidden, false);
  assert.equal(dom.elements.settingsDescription.value, api.state.groups.find((group) => group.id === 'staff-main').description);
  dom.elements.settingsDescription.value = 'Managed from the session dialog.';
  dom.elements.settingsVisibility.value = 'private';
  dom.elements.settingsPosting.value = 'owner';
  const settingsForm = fakeElement({ 'data-group-settings-form': '' }, {
    '[name="manageGroupDescription"]': dom.elements.settingsDescription,
    '[name="manageGroupVisibility"]': dom.elements.settingsVisibility,
    '[name="manageGroupPosting"]': dom.elements.settingsPosting,
    '[data-group-settings-error]': dom.elements.settingsError
  });
  dom.fire('submit', settingsForm);
  assert.equal(api.state.groups.find((group) => group.id === 'staff-main').description, 'Managed from the session dialog.');
  assert.equal(api.state.groups.find((group) => group.id === 'staff-main').posting, 'owner');
  assert.equal(dom.elements.settingsDialog.hidden, true);
});

test('escapes user messages and thread replies in rendered markup', () => {
  const dom = createGroupDom();
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  api.openGroup('staff-main');
  api.selectMessageAttachment('staff-main', 'file', '<img src=x onerror=alert(2)>.pdf');
  const sent = api.sendMessage('staff-main', '<img src=x onerror=alert(1)>');
  api.addThreadReply('staff-main', sent.message.id, '<script>alert(1)</script>');
  api.state.activeThreadId = sent.message.id;
  api.renderGroupChat();

  assert.match(dom.elements.messageList.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(dom.elements.messageList.innerHTML, /&lt;img src=x onerror=alert\(2\)&gt;\.pdf/);
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

test('publishes validated Jobs into session state and updates the rendered active-post metric', () => {
  const activeList = fakeElement();
  const metrics = Object.fromEntries(['active-posts', 'new-matches', 'contact-requests', 'interviews'].map((name) => [name, fakeElement()]));
  const dom = createDelegatedDom({
    panelSelector: '#panel-jobs',
    selectorMap: {
      '[data-active-job-list]': activeList,
      ...Object.fromEntries(Object.entries(metrics).map(([name, node]) => [`[data-job-metric="${name}"]`, node]))
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  const initialCount = api.state.jobPosts.length;
  const invalidSnapshot = JSON.stringify(api.state.jobPosts);

  assert.equal(api.publishJobPost({ jobTitle: '', jobSkills: 'Gel-X', jobDistance: 10 }).ok, false);
  assert.equal(JSON.stringify(api.state.jobPosts), invalidSnapshot);
  const published = api.publishJobPost({
    jobTitle: '<img src=x onerror=alert(1)> Nail Tech',
    jobSkills: 'Gel-X, Design',
    jobDistance: 12,
    jobAvailability: 'Friday through Sunday',
    jobCompensation: 'split-6-4'
  });

  assert.equal(published.ok, true);
  assert.equal(api.state.jobPosts.length, initialCount + 1);
  assert.equal(api.state.jobPosts[0], published.job);
  assert.equal(published.job.status, 'active');
  assert.equal(metrics['active-posts'].textContent, initialCount + 1);
  assert.match(activeList.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt; Nail Tech/);
  assert.doesNotMatch(activeList.innerHTML, /<img/);
});

test('delegated Jobs publish reports success only after mutating active job state', () => {
  const title = fakeElement({ name: 'jobTitle' });
  const skills = fakeElement({ name: 'jobSkills' });
  const distance = fakeElement({ name: 'jobDistance' });
  const availability = fakeElement({ name: 'jobAvailability' });
  const compensation = fakeElement({ name: 'jobCompensation' });
  const error = fakeElement({ 'data-job-form-error': '' });
  const notice = fakeElement({ 'data-community-notice': '' });
  const dialog = fakeElement({ 'data-create-job-dialog': '' }, { 'input,select,textarea': title });
  dialog.hidden = false;
  title.value = 'Weekend Nail Technician';
  skills.value = 'Gel-X, Design';
  distance.value = '15';
  availability.value = 'Weekends';
  compensation.value = 'weekly-guarantee';
  const form = fakeElement({ 'data-create-job-form': '' }, {
    '[name="jobTitle"]': title,
    '[name="jobSkills"]': skills,
    '[name="jobDistance"]': distance,
    '[name="jobAvailability"]': availability,
    '[name="jobCompensation"]': compensation,
    '[data-job-form-error]': error
  });
  form.reset = function () { this.wasReset = true; };
  const activeCount = fakeElement();
  const activeList = fakeElement();
  const dom = createDelegatedDom({
    panelSelector: '#panel-jobs',
    selectorMap: {
      '[data-create-job-dialog]': dialog,
      '[data-job-form-error]': error,
      '[data-community-notice]': notice,
      '[data-job-metric="active-posts"]': activeCount,
      '[data-active-job-list]': activeList
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  const before = api.state.jobPosts.length;

  dom.firePanel('submit', form);
  assert.equal(api.state.jobPosts.length, before + 1);
  assert.equal(api.state.jobPosts[0].title, 'Weekend Nail Technician');
  assert.equal(activeCount.textContent, before + 1);
  assert.equal(form.wasReset, true);
  assert.equal(dialog.hidden, true);
  assert.match(notice.textContent, /published/i);
});

test('delegates Jobs filters, pipeline actions, and privacy-safe sharing', () => {
  const notice = fakeElement({ 'data-community-notice': '' });
  const empty = fakeElement({ 'data-job-empty': '', role: 'status' });
  empty.hidden = true;
  const filters = Object.fromEntries(['skill', 'distance', 'availability', 'compensation'].map((name) => {
    const node = fakeElement({ 'data-candidate-filter': name });
    node.value = 'all';
    return [name, node];
  }));
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
      '[data-job-empty]': empty,
      ...Object.fromEntries(Object.entries(counts).map(([stage, node]) => [`[data-stage-count="${stage}"]`, node]))
    },
    selectorAllMap: {
      '[data-owner-candidate]': Object.values(cards),
      '[data-candidate-filter]': Object.values(filters)
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });

  const skillFilter = filters.skill;
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

  skillFilter.value = 'Design';
  dom.firePanel('change', skillFilter);
  filters.availability.value = 'weekdays';
  dom.firePanel('change', filters.availability);
  assert.equal(cards.a7.hidden, true);
  assert.equal(cards.c2.hidden, true);
  assert.equal(empty.hidden, false);
  assert.match(empty.innerHTML, /No candidates match/i);
  assert.match(empty.innerHTML, /data-job-clear-filters/);

  dom.firePanel('click', fakeElement({ 'data-job-clear-filters': '' }));
  assert.deepEqual(JSON.parse(JSON.stringify(api.state.candidateFilters)), {
    skill: 'all',
    maxDistance: 'all',
    availability: 'all',
    compensation: 'all'
  });
  assert.ok(Object.values(filters).every((filter) => filter.value === 'all'));
  assert.equal(empty.hidden, true);
  assert.equal(cards.a7.hidden, false);
  assert.equal(cards.c2.hidden, false);
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

  assert.equal(filters.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(filters[0].getAttribute('aria-pressed'), 'true');
  assert.equal(views.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(views[0].getAttribute('aria-pressed'), 'true');
  assert.equal((detail.innerHTML.match(/aria-pressed="true"/g) || []).length, 1);

  dom.firePanel('click', filters[1]);
  assert.equal(api.state.eventFilter, 'staff-training');
  assert.equal(filters[0].getAttribute('aria-pressed'), 'false');
  assert.equal(filters[1].getAttribute('aria-pressed'), 'true');
  assert.match(list.innerHTML, /Staff Training/);
  assert.doesNotMatch(list.innerHTML, /Customer Event/);
  dom.firePanel('click', views[1]);
  assert.equal(api.state.eventView, 'calendar');
  assert.equal(views[0].getAttribute('aria-pressed'), 'false');
  assert.equal(views[1].getAttribute('aria-pressed'), 'true');
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

  api.setEventRsvp(event.id, 'declined');
  assert.equal((detail.innerHTML.match(/aria-pressed="true"/g) || []).length, 1);
  assert.match(detail.innerHTML, /aria-pressed="true"[^>]*data-event-rsvp="declined"/);
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

test('synchronizes initial and changed Feed and Learning filter button states for assistive technology', () => {
  const feedList = fakeElement();
  const courseGrid = fakeElement();
  const savedCourses = fakeElement();
  const feedFilters = ['all', 'announcements', 'staff', 'customer', 'saved'].map((name) => fakeElement({ 'data-feed-filter': name }));
  const courseFilters = ['all', 'operations', 'marketing', 'team-management', 'customer-experience'].map((name) => fakeElement({ 'data-course-filter': name }));
  const dom = createDelegatedDom({
    panelSelector: '#no-feature-panel',
    selectorMap: {
      '[data-feed-list]': feedList,
      '[data-course-grid]': courseGrid,
      '[data-saved-course-list]': savedCourses
    },
    selectorAllMap: {
      '[data-feed-filter]': feedFilters,
      '[data-course-filter]': courseFilters
    }
  });
  const api = loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });

  assert.equal(feedFilters.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(feedFilters[0].getAttribute('aria-pressed'), 'true');
  assert.equal(courseFilters.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(courseFilters[0].getAttribute('aria-pressed'), 'true');

  dom.fireDocument('click', feedFilters[2]);
  assert.equal(api.state.feedFilter, 'staff');
  assert.equal(feedFilters[0].getAttribute('aria-pressed'), 'false');
  assert.equal(feedFilters[2].getAttribute('aria-pressed'), 'true');
  dom.fireDocument('click', courseFilters[2]);
  assert.equal(api.state.courseFilter, 'marketing');
  assert.equal(courseFilters[0].getAttribute('aria-pressed'), 'false');
  assert.equal(courseFilters[2].getAttribute('aria-pressed'), 'true');
});

test('supports roving five-tab keyboard activation without changing sidebar aria state', () => {
  const dom = createTabsDom();
  const shell = {
    setActiveTab(name) {
      dom.sidebarTabs.forEach((tab) => tab.classList.toggle('is-active', tab.getAttribute('data-shell-tab') === name));
    }
  };
  const api = loadApi({ document: dom.document, window: { NEXORA_SHELL: shell }, setTimeout() { return 1; }, clearTimeout() {} });

  api.activateTab('feed');
  const assertActive = (name) => {
    const index = dom.names.indexOf(name);
    assert.equal(dom.pageTabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length, 1);
    assert.equal(dom.pageTabs.filter((tab) => tab.getAttribute('tabindex') === '0').length, 1);
    assert.equal(dom.panels.filter((panel) => !panel.hidden).length, 1);
    assert.equal(dom.pageTabs[index].getAttribute('aria-selected'), 'true');
    assert.equal(dom.pageTabs[index].getAttribute('tabindex'), '0');
    assert.equal(dom.panels[index].hidden, false);
    assert.equal(dom.document.activeElement, dom.pageTabs[index]);
    assert.equal(dom.sidebarTabs.filter((tab) => tab.classList.contains('is-active')).length, 1);
    assert.equal(dom.sidebarTabs[index].classList.contains('is-active'), true);
    assert.ok(dom.sidebarTabs.every((tab) => tab.getAttribute('aria-selected') === null));
    assert.ok(dom.sidebarTabs.every((tab) => tab.getAttribute('tabindex') === null));
  };

  dom.document.activeElement = dom.pageTabs[0];
  assert.equal(dom.fireDocument('keydown', dom.pageTabs[0], { key: 'ArrowRight' }).defaultPrevented, true);
  assertActive('groups');
  assert.equal(dom.fireDocument('keydown', dom.pageTabs[1], { key: 'End' }).defaultPrevented, true);
  assertActive('events');
  assert.equal(dom.fireDocument('keydown', dom.pageTabs[4], { key: 'ArrowRight' }).defaultPrevented, true);
  assertActive('feed');
  assert.equal(dom.fireDocument('keydown', dom.pageTabs[0], { key: 'ArrowLeft' }).defaultPrevented, true);
  assertActive('events');
  assert.equal(dom.fireDocument('keydown', dom.pageTabs[4], { key: 'Home' }).defaultPrevented, true);
  assertActive('feed');
});

test('opens one active dialog, traps focus, closes from Escape and backdrop, and restores its opener', () => {
  const title = fakeElement({ name: 'jobTitle' });
  const cancel = fakeElement({ 'data-dialog-close': '' });
  const submit = fakeElement();
  const shareField = fakeElement({ name: 'courseGroup' });
  const shareCancel = fakeElement({ 'data-share-course-close': '', 'data-dialog-close': '' });
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
  const shareDialog = fakeElement(
    { 'data-share-course-dialog': '' },
    {
      'input,select,textarea': shareField,
      'button': shareCancel,
      [focusableSelector]: [shareField, shareCancel]
    }
  );
  shareDialog.hidden = true;
  const error = fakeElement();
  const dom = createDelegatedDom({
    panelSelector: '#panel-jobs',
    selectorMap: {
      '[data-create-job-dialog]': dialog,
      '[data-share-course-dialog]': shareDialog,
      '[data-staff-group-options]': shareField,
      '[name="jobTitle"]': title,
      '[data-job-form-error]': error
    }
  });
  for (const node of [dialog, title, cancel, submit, shareDialog, shareField, shareCancel]) node.ownerDocument = dom.document;
  loadApi({ document: dom.document, setTimeout() { return 1; }, clearTimeout() {} });
  const opener = fakeElement({ 'data-create-job-open': '' });
  const shareOpener = fakeElement({ 'data-course-share': 'course-retention' });
  opener.ownerDocument = dom.document;
  shareOpener.ownerDocument = dom.document;
  shareOpener.parentNode = dom.document;
  dom.document.activeElement = opener;

  dom.firePanel('click', opener);
  assert.equal(dialog.hidden, false);
  assert.equal(dom.document.activeElement, title);
  const reverseWrapped = dom.fireDocument('keydown', title, { key: 'Tab', shiftKey: true });
  assert.equal(reverseWrapped.defaultPrevented, true);
  assert.equal(dom.document.activeElement, submit);
  dom.document.activeElement = submit;
  const wrapped = dom.fireDocument('keydown', submit, { key: 'Tab' });
  assert.equal(wrapped.defaultPrevented, true);
  assert.equal(dom.document.activeElement, title);
  dom.firePanel('click', cancel);
  assert.equal(dialog.hidden, true);
  assert.equal(dom.document.activeElement, opener);

  dom.firePanel('click', opener);
  dom.fireDocument('click', shareOpener);
  assert.equal(dialog.hidden, true);
  assert.equal(shareDialog.hidden, false);
  assert.equal([dialog, shareDialog].filter((item) => !item.hidden).length, 1);
  assert.equal(dom.document.activeElement, shareField);
  dom.fireDocument('keydown', shareField, { key: 'Escape' });
  assert.equal(shareDialog.hidden, true);
  assert.equal(dom.document.activeElement, shareOpener);

  dom.firePanel('click', opener);
  dom.fireDocument('click', dialog);
  assert.equal(dialog.hidden, true);
  assert.equal(dom.document.activeElement, opener);
});

export { loadApi };
