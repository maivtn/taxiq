(function () {
  'use strict';

  var state = {
    posts: [
      { id:'feed-announcement-1', kind:'announcement', audience:'staff', author:'Nexora Touch', role:'Owner', group:'Nexora Touch Staff', time:'12 min ago', body:'Friday hours are updated. Please review your station coverage before 4 PM.', reactions:{ '👍':4 }, comments:[], saved:false, pinned:false },
      { id:'feed-customer-1', kind:'post', audience:'customer', author:'Maya Lewis', role:'VIP Customer', group:'VIP Nail Club', time:'34 min ago', body:'Which summer chrome shade works best with short almond nails?', reactions:{ '💜':6 }, comments:[], saved:false, pinned:false },
      { id:'feed-staff-1', kind:'post', audience:'staff', author:'Mia Tran', role:'Admin', group:'Nexora Touch Staff', time:'1 hr ago', body:'The new Gel-X color cards are ready at station two.', reactions:{ '✨':3 }, comments:[], saved:false, pinned:false }
    ],
    feedFilter: 'all',
    groups: [
      { id:'staff-main', name:'Nexora Touch Staff', type:'staff', visibility:'private', members:12, unread:8, activity:'5 min ago', archived:false, description:'Daily operations, schedules, and team announcements.' },
      { id:'vip-club', name:'VIP Nail Club', type:'customer', visibility:'private', members:68, unread:14, activity:'18 min ago', archived:false, description:'Early access, care tips, and VIP-only offers.' },
      { id:'weekend-promos', name:'Weekend Promotions', type:'mixed', visibility:'private', members:24, unread:3, activity:'1 hr ago', archived:false, description:'Coordinate weekend campaigns with staff and loyal customers.' },
      { id:'new-hire', name:'New Hire Onboarding', type:'staff', visibility:'private', members:6, unread:0, activity:'Yesterday', archived:false, description:'Training, policies, and first-week checklists.' }
    ],
    groupFilter: 'all',
    activeGroupId: '',
    activeThreadId: '',
    memberDrawerOpen: false,
    members: {
      'staff-main': [
        { id:'owner-nexora', name:'Nexora Touch', role:'owner', status:'online' },
        { id:'admin-mia', name:'Mia Tran', role:'admin', status:'online' },
        { id:'member-linh', name:'Linh Nguyen', role:'moderator', status:'away' },
        { id:'member-sophie', name:'Sophie Carter', role:'member', status:'offline' }
      ],
      'vip-club': [
        { id:'owner-nexora', name:'Nexora Touch', role:'owner', status:'online' },
        { id:'vip-maya', name:'Maya Lewis', role:'moderator', status:'online' },
        { id:'member-sophie', name:'Sophie Carter', role:'member', status:'offline' },
        { id:'vip-noah', name:'Noah Williams', role:'member', status:'away' }
      ],
      'weekend-promos': [
        { id:'owner-nexora', name:'Nexora Touch', role:'owner', status:'online' },
        { id:'admin-mia', name:'Mia Tran', role:'admin', status:'online' },
        { id:'vip-maya', name:'Maya Lewis', role:'member', status:'online' }
      ],
      'new-hire': [
        { id:'owner-nexora', name:'Nexora Touch', role:'owner', status:'online' },
        { id:'member-linh', name:'Linh Nguyen', role:'moderator', status:'away' },
        { id:'new-emily', name:'Emily Pham', role:'member', status:'online' }
      ]
    },
    messages: {
      'staff-main': [
        { id:'staff-message-1', authorId:'owner-nexora', body:'Friday coverage is the priority this week. Please confirm your hours.', time:'9:05 AM', pinned:true, reactions:{ '👍':3 }, replies:[{ id:'reply-1', authorId:'admin-mia', body:'Front desk is covered until 6 PM.', time:'9:12 AM' },{ id:'reply-2', authorId:'member-linh', body:'I can cover the closing shift.', time:'9:18 AM' }] },
        { id:'staff-message-2', authorId:'admin-mia', body:'The new Gel-X color cards are at station two.', time:'10:24 AM', pinned:false, reactions:{ '✨':2 }, replies:[] },
        { id:'staff-message-3', authorId:'member-sophie', body:'I completed the sanitation checklist.', time:'11:03 AM', pinned:false, reactions:{}, replies:[] }
      ],
      'vip-club': [
        { id:'vip-message-1', authorId:'owner-nexora', body:'VIP members get first access to the summer color preview.', time:'Yesterday', pinned:true, reactions:{ '💜':12 }, replies:[] },
        { id:'vip-message-2', authorId:'member-sophie', body:'Can appointments be booked directly from the preview?', time:'Yesterday', pinned:false, reactions:{}, replies:[] }
      ]
    },
    messageSequence: 0,
    viewerReactions: {},
    courses: [
      { id:'course-retention', title:'Customer retention playbook', category:'customer-experience', categoryLabel:'Customer Experience', duration:'18 min', progress:65, saved:false },
      { id:'course-pricing', title:'Pricing services for healthy margins', category:'operations', categoryLabel:'Operations', duration:'24 min', progress:20, saved:false },
      { id:'course-instagram', title:'Instagram content in 30 minutes a week', category:'marketing', categoryLabel:'Marketing', duration:'16 min', progress:0, saved:false },
      { id:'course-one-on-ones', title:'Run better one-on-ones', category:'team-management', categoryLabel:'Team Management', duration:'12 min', progress:80, saved:false }
    ],
    courseFilter: 'all',
    activeShareCourseId: '',
    noticeTimer: 0
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function findPost(postId) {
    var index;
    for (index = 0; index < state.posts.length; index += 1) {
      if (state.posts[index].id === postId) return state.posts[index];
    }
    return null;
  }

  function findGroup(groupId) {
    var index;
    for (index = 0; index < state.groups.length; index += 1) {
      if (state.groups[index].id === groupId) return state.groups[index];
    }
    return null;
  }

  function findCourse(courseId) {
    var index;
    for (index = 0; index < state.courses.length; index += 1) {
      if (state.courses[index].id === courseId) return state.courses[index];
    }
    return null;
  }

  function groupDefaults(type) {
    if (type === 'staff' || type === 'mixed') return { visibility: 'private', joining: 'invite-only', posting: 'members' };
    if (type === 'customer') return { visibility: 'private', joining: 'approval', posting: 'members' };
    return null;
  }

  function filterGroups(query, type) {
    var search = String(query == null ? '' : query).replace(/^\s+|\s+$/g, '').toLowerCase();
    var selected = type || 'all';
    return state.groups.filter(function (group) {
      var matchesFilter = selected === 'all' || (selected === 'archived' ? group.archived : group.type === selected);
      var haystack = (group.name + ' ' + group.description).toLowerCase();
      return matchesFilter && haystack.indexOf(search) !== -1;
    });
  }

  function createGroup(input) {
    var details = input || {};
    var name = String(details.name == null ? '' : details.name).replace(/^\s+|\s+$/g, '');
    var defaults = groupDefaults(details.type);
    var id = 'group-' + new Date().getTime();
    var suffix = 1;
    var group;
    if (!name) return { ok: false, error: 'Enter a group name.' };
    if (!defaults) return { ok: false, error: 'Choose a valid group type.' };
    if (details.type === 'mixed' && details.privacyAcknowledged !== true) return { ok: false, error: 'Confirm the Mixed group privacy acknowledgement.' };
    while (findGroup(id)) {
      id = 'group-' + new Date().getTime() + '-' + suffix;
      suffix += 1;
    }
    group = {
      id: id,
      name: name,
      type: details.type,
      visibility: details.type === 'customer' && details.visibility === 'discoverable' ? 'discoverable' : defaults.visibility,
      joining: defaults.joining,
      posting: ['members', 'moderators', 'owner'].indexOf(details.posting) !== -1 ? details.posting : defaults.posting,
      members: 1,
      unread: 0,
      activity: 'Just now',
      archived: false,
      description: String(details.description == null ? '' : details.description).replace(/^\s+|\s+$/g, '')
    };
    state.groups.push(group);
    state.members[group.id] = [{ id:'owner-nexora', name:'Nexora Touch', role:'owner', status:'online' }];
    state.messages[group.id] = [];
    return { ok: true, group: group };
  }

  function updateGroup(groupId, changes) {
    var group = findGroup(groupId);
    var updates = changes || {};
    var validPosting = ['members', 'moderators', 'owner'];
    if (!group) return { ok: false, error: 'Group not found.' };
    if (Object.prototype.hasOwnProperty.call(updates, 'visibility')) {
      if (updates.visibility === 'discoverable' && group.type !== 'customer') return { ok: false, error: 'Only Customer groups can be discoverable.' };
      if (updates.visibility !== 'private' && updates.visibility !== 'discoverable') return { ok: false, error: 'Choose a valid visibility.' };
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'posting')) {
      if (validPosting.indexOf(updates.posting) === -1) return { ok: false, error: 'Choose a valid posting permission.' };
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'visibility')) group.visibility = updates.visibility;
    if (Object.prototype.hasOwnProperty.call(updates, 'description')) group.description = String(updates.description == null ? '' : updates.description).replace(/^\s+|\s+$/g, '');
    if (Object.prototype.hasOwnProperty.call(updates, 'posting')) group.posting = updates.posting;
    return { ok: true, group: group };
  }

  function toggleArchivedGroup(groupId) {
    var group = findGroup(groupId);
    if (!group) return { ok: false, error: 'Group not found.' };
    group.archived = !group.archived;
    return { ok: true, group: group };
  }

  function findMember(groupId, memberId) {
    var members = state.members[groupId] || [];
    var index;
    for (index = 0; index < members.length; index += 1) {
      if (members[index].id === memberId) return members[index];
    }
    return null;
  }

  function findMessage(groupId, messageId) {
    var messages = state.messages[groupId] || [];
    var index;
    for (index = 0; index < messages.length; index += 1) {
      if (messages[index].id === messageId) return messages[index];
    }
    return null;
  }

  function nextChatId(prefix) {
    state.messageSequence += 1;
    return prefix + '-' + new Date().getTime() + '-' + state.messageSequence;
  }

  function openGroup(groupId) {
    var group = findGroup(groupId);
    if (!group) return { ok: false, error: 'Group not found.' };
    state.activeGroupId = groupId;
    state.activeThreadId = '';
    state.memberDrawerOpen = false;
    return { ok: true, value: group, group: group };
  }

  function sendMessage(groupId, body) {
    var group = findGroup(groupId);
    var text = String(body == null ? '' : body).replace(/^\s+|\s+$/g, '');
    var message;
    if (!group) return { ok: false, error: 'Group not found.' };
    if (!text) return { ok: false, error: 'Write a message before sending.' };
    if (!state.messages[groupId]) state.messages[groupId] = [];
    message = { id:nextChatId('message'), authorId:'owner-nexora', body:text, time:'Just now', pinned:false, reactions:{}, replies:[] };
    state.messages[groupId].push(message);
    return { ok: true, value: message, message: message };
  }

  function addMessageReaction(groupId, messageId, emoji) {
    var group = findGroup(groupId);
    var message;
    var reaction = String(emoji == null ? '' : emoji).replace(/^\s+|\s+$/g, '');
    if (!group) return { ok: false, error: 'Group not found.' };
    message = findMessage(groupId, messageId);
    if (!message) return { ok: false, error: 'Message not found.' };
    if (!reaction) return { ok: false, error: 'Choose a reaction.' };
    message.reactions[reaction] = (message.reactions[reaction] || 0) + 1;
    return { ok: true, value: message, message: message };
  }

  function addThreadReply(groupId, messageId, body) {
    var group = findGroup(groupId);
    var message;
    var text = String(body == null ? '' : body).replace(/^\s+|\s+$/g, '');
    var reply;
    if (!group) return { ok: false, error: 'Group not found.' };
    message = findMessage(groupId, messageId);
    if (!message) return { ok: false, error: 'Message not found.' };
    if (!text) return { ok: false, error: 'Write a reply before sending.' };
    reply = { id:nextChatId('reply'), authorId:'owner-nexora', body:text, time:'Just now' };
    message.replies.push(reply);
    return { ok: true, value: reply, reply: reply, message: message };
  }

  function setMemberRole(groupId, memberId, role) {
    var group = findGroup(groupId);
    var member;
    if (!group) return { ok: false, error: 'Group not found.' };
    member = findMember(groupId, memberId);
    if (!member) return { ok: false, error: 'Member not found.' };
    if (['admin', 'moderator', 'member'].indexOf(role) === -1) return { ok: false, error: 'Choose admin, moderator, or member.' };
    member.role = role;
    return { ok: true, value: member, member: member };
  }

  function moderateMessage(groupId, messageId, action) {
    var group = findGroup(groupId);
    var messages;
    var message;
    var index;
    if (!group) return { ok: false, error: 'Group not found.' };
    message = findMessage(groupId, messageId);
    if (!message) return { ok: false, error: 'Message not found.' };
    if (action === 'pin') {
      message.pinned = !message.pinned;
      return { ok: true, value: message, message: message };
    }
    if (action === 'delete') {
      messages = state.messages[groupId];
      for (index = 0; index < messages.length; index += 1) {
        if (messages[index].id === messageId) {
          messages.splice(index, 1);
          break;
        }
      }
      if (state.activeThreadId === messageId) state.activeThreadId = '';
      return { ok: true, value: message, message: message };
    }
    return { ok: false, error: 'Choose a valid moderation action.' };
  }

  function filterFeedPosts(filter) {
    var selected = filter || 'all';
    return state.posts.filter(function (post) {
      if (selected === 'all') return true;
      if (selected === 'announcements') return post.kind === 'announcement';
      if (selected === 'saved') return post.saved;
      return post.audience === selected;
    }).sort(function (first, second) {
      return Number(second.pinned) - Number(first.pinned);
    });
  }

  function addFeedPost(text, audience) {
    var body = String(text == null ? '' : text).replace(/^\s+|\s+$/g, '');
    var createdPost;
    if (!body) return { ok: false, error: 'Write something before posting.' };
    createdPost = {
      id: 'feed-post-' + (state.posts.length + 1) + '-' + new Date().getTime(),
      kind: 'post',
      audience: ['staff', 'customer'].indexOf(audience) !== -1 ? audience : 'all',
      author: 'Nexora Touch',
      role: 'Owner',
      group: 'Nexora Touch Community',
      time: 'Just now',
      body: body,
      reactions: {},
      comments: [],
      saved: false,
      pinned: false
    };
    state.posts.unshift(createdPost);
    renderFeed();
    return { ok: true, post: createdPost };
  }

  function togglePostReaction(postId, emoji) {
    var post = findPost(postId);
    var amount;
    var reactionKey;
    var reacted;
    if (!post || !emoji) return { ok: false, error: 'Post not found.' };
    reactionKey = postId + '|' + emoji;
    amount = post.reactions[emoji] || 0;
    reacted = !state.viewerReactions[reactionKey];
    if (reacted) {
      post.reactions[emoji] = amount + 1;
      state.viewerReactions[reactionKey] = true;
    } else {
      post.reactions[emoji] = amount > 0 ? amount - 1 : 0;
      delete state.viewerReactions[reactionKey];
    }
    renderFeed();
    return { ok: true, post: post, count: post.reactions[emoji], reacted: reacted };
  }

  function addFeedComment(postId, body) {
    var post = findPost(postId);
    var text = String(body == null ? '' : body).replace(/^\s+|\s+$/g, '');
    if (!post) return { ok: false, error: 'Post not found.' };
    if (!text) return { ok: false, error: 'Write a comment before posting.' };
    post.comments.push({ author: 'Nexora Touch', body: text, time: 'Just now' });
    renderFeed();
    return { ok: true, post: post };
  }

  function toggleSavedPost(postId) {
    var post = findPost(postId);
    if (!post) return { ok: false, error: 'Post not found.' };
    post.saved = !post.saved;
    renderFeed();
    return { ok: true, post: post };
  }

  function togglePinnedPost(postId) {
    var post = findPost(postId);
    if (!post) return { ok: false, error: 'Post not found.' };
    post.pinned = !post.pinned;
    renderFeed();
    return { ok: true, post: post };
  }

  function filterCourses(category) {
    var selected = category || 'all';
    return state.courses.filter(function (course) {
      return selected === 'all' || course.category === selected;
    });
  }

  function toggleSavedCourse(courseId) {
    var course = findCourse(courseId);
    if (!course) return { ok: false, error: 'Course not found.' };
    course.saved = !course.saved;
    renderCourses();
    return { ok: true, course: course };
  }

  function setCourseProgress(courseId, percent) {
    var course = findCourse(courseId);
    var progress = Number(percent);
    if (!course) return { ok: false, error: 'Course not found.' };
    if (isNaN(progress)) progress = 0;
    course.progress = Math.max(0, Math.min(100, progress));
    renderCourses();
    return { ok: true, course: course };
  }

  function shareCourse(courseId, groupId) {
    var course = findCourse(courseId);
    var group = findGroup(groupId);
    var post;
    if (!course) return { ok: false, error: 'Course not found.' };
    if (!group || group.type !== 'staff') return { ok: false, error: 'Choose a Staff group to share this course.' };
    post = {
      id: 'feed-course-' + (state.posts.length + 1) + '-' + new Date().getTime(),
      kind: 'announcement',
      audience: 'staff',
      groupId: group.id,
      author: 'Nexora Touch',
      role: 'Owner',
      group: group.name,
      time: 'Just now',
      body: 'Learning resource shared: ' + course.title + '.',
      reactions: {},
      comments: [],
      saved: false,
      pinned: false
    };
    state.posts.unshift(post);
    renderFeed();
    return { ok: true, course: course, group: group, post: post };
  }

  function showCommunityNotice(message) {
    var oldNotice = document.querySelector('[data-community-notice]');
    var notice;
    if (oldNotice && oldNotice.parentNode) oldNotice.parentNode.removeChild(oldNotice);
    if (!document.createElement || !document.body) return;
    notice = document.createElement('div');
    notice.className = 'community-notice';
    notice.setAttribute('data-community-notice', '');
    notice.setAttribute('role', 'status');
    notice.textContent = message;
    document.body.appendChild(notice);
    window.clearTimeout(state.noticeTimer);
    state.noticeTimer = window.setTimeout(function () {
      if (notice.parentNode) notice.parentNode.removeChild(notice);
    }, 2600);
  }

  function renderComments(post) {
    var html = '';
    var index;
    for (index = 0; index < post.comments.length; index += 1) {
      html += '<p class="feed-comment"><strong>' + escapeHtml(post.comments[index].author) + '</strong> ' + escapeHtml(post.comments[index].body) + '</p>';
    }
    return html;
  }

  function renderReactions(post) {
    var html = '';
    var emoji;
    var hasReaction = false;
    for (emoji in post.reactions) {
      if (Object.prototype.hasOwnProperty.call(post.reactions, emoji)) {
        hasReaction = true;
        html += '<button type="button" class="feed-reaction" data-feed-reaction="' + escapeHtml(emoji) + '" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(emoji) + ' ' + post.reactions[emoji] + '</button>';
      }
    }
    if (!hasReaction) html = '<span class="feed-no-reactions">Be the first to react</span>';
    return html;
  }

  function renderPost(post) {
    return '<article class="feed-post community-card" data-feed-post="' + escapeHtml(post.id) + '">' +
      '<header class="feed-post-head"><div><strong>' + escapeHtml(post.author) + '</strong><span>' + escapeHtml(post.role) + ' · ' + escapeHtml(post.group) + '</span></div><div class="feed-post-meta"><span>' + escapeHtml(post.time) + '</span>' + (post.pinned ? '<span class="feed-pin-label">Pinned</span>' : '') + '</div></header>' +
      '<p class="feed-post-body">' + escapeHtml(post.body) + '</p>' +
      '<div class="feed-reaction-row">' + renderReactions(post) + '<button type="button" class="feed-reaction" data-feed-reaction="👍" data-post-id="' + escapeHtml(post.id) + '">👍 React</button></div>' +
      '<div class="feed-post-actions"><button type="button" data-feed-save data-post-id="' + escapeHtml(post.id) + '">' + (post.saved ? 'Saved' : 'Save') + '</button><button type="button" data-feed-pin data-post-id="' + escapeHtml(post.id) + '">' + (post.pinned ? 'Unpin' : 'Pin') + '</button></div>' +
      '<div class="feed-comments">' + renderComments(post) + '</div>' +
      '<form class="feed-comment-form" data-feed-comment-form data-post-id="' + escapeHtml(post.id) + '"><label class="sr-only" for="comment-' + escapeHtml(post.id) + '">Comment on this post</label><input id="comment-' + escapeHtml(post.id) + '" name="comment" type="text" placeholder="Write a comment..."><button type="submit">Comment</button></form>' +
      '</article>';
  }

  function renderFeed() {
    var list = document.querySelector('[data-feed-list]');
    var posts;
    var index;
    var html = '';
    if (!list) return;
    posts = filterFeedPosts(state.feedFilter);
    for (index = 0; index < posts.length; index += 1) html += renderPost(posts[index]);
    list.innerHTML = html || '<p class="community-empty-state">No posts match this filter yet.</p>';
  }

  function renderGroups() {
    var grid = document.querySelector('[data-group-grid]');
    var search = document.querySelector('[data-group-search]');
    var total = document.querySelector('[data-group-total]');
    var members = document.querySelector('[data-member-total]');
    var unread = document.querySelector('[data-unread-total]');
    var query;
    var groups;
    if (!grid) return;
    query = search ? search.value : '';
    groups = filterGroups(query, state.groupFilter);
    grid.innerHTML = groups.length ? groups.map(function (group) {
      return '<article class="group-card community-card" data-group-id="' + escapeHtml(group.id) + '"><div class="group-card-head"><span class="group-avatar">' + escapeHtml(group.name.slice(0, 2).toUpperCase()) + '</span><div><h3>' + escapeHtml(group.name) + '</h3><span class="group-type-badge">' + escapeHtml(group.type) + '</span><span class="group-privacy-badge">' + escapeHtml(group.visibility) + '</span></div></div><p>' + escapeHtml(group.description) + '</p><dl><div><dt>Members</dt><dd>' + group.members + '</dd></div><div><dt>Unread</dt><dd>' + group.unread + '</dd></div><div><dt>Activity</dt><dd>' + escapeHtml(group.activity) + '</dd></div></dl><footer><button type="button" data-group-open="' + escapeHtml(group.id) + '">Open Chat</button><button type="button" data-group-manage="' + escapeHtml(group.id) + '">Manage</button><button type="button" data-group-archive="' + escapeHtml(group.id) + '">' + (group.archived ? 'Restore' : 'Archive') + '</button></footer></article>';
    }).join('') : '<div class="community-empty"><h3>No groups found</h3><p>Change the filter or create a new group.</p></div>';
    if (total) total.textContent = state.groups.filter(function (group) { return !group.archived; }).length;
    if (members) members.textContent = state.groups.reduce(function (sum, group) { return sum + group.members; }, 0);
    if (unread) unread.textContent = state.groups.reduce(function (sum, group) { return sum + group.unread; }, 0);
  }

  function renderCourseCard(course) {
    return '<article class="course-card community-card" data-course-id="' + escapeHtml(course.id) + '">' +
      '<div class="course-card-head"><span>' + escapeHtml(course.categoryLabel) + '</span><button type="button" data-course-save="' + escapeHtml(course.id) + '">' + (course.saved ? 'Saved' : 'Save') + '</button></div>' +
      '<h4>' + escapeHtml(course.title) + '</h4><p>' + escapeHtml(course.duration) + ' · Owner education</p>' +
      '<div class="course-progress"><div role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + course.progress + '"><span style="width:' + course.progress + '%"></span></div><strong>' + course.progress + '%</strong></div>' +
      '<footer><button type="button" data-course-continue="' + escapeHtml(course.id) + '">' + (course.progress ? 'Continue' : 'Start learning') + '</button><button type="button" data-course-share="' + escapeHtml(course.id) + '">Share</button></footer>' +
      '</article>';
  }

  function renderCourses() {
    var grid = document.querySelector('[data-course-grid]');
    var saved = document.querySelector('[data-saved-course-list]');
    var courses;
    if (!grid) return;
    courses = filterCourses(state.courseFilter);
    grid.innerHTML = courses.map(renderCourseCard).join('') || '<p class="community-empty-state">No courses match this filter yet.</p>';
    if (saved) saved.innerHTML = state.courses.filter(function (course) { return course.saved; }).map(function (course) { return '<button type="button" data-course-continue="' + escapeHtml(course.id) + '">' + escapeHtml(course.title) + '</button>'; }).join('') || '<p>No saved resources yet.</p>';
  }

  function renderMessageReactions(message) {
    var html = '';
    var emoji;
    for (emoji in message.reactions) {
      if (Object.prototype.hasOwnProperty.call(message.reactions, emoji)) {
        html += '<button type="button" data-message-id="' + escapeHtml(message.id) + '" data-message-reaction="' + escapeHtml(emoji) + '">' + escapeHtml(emoji) + ' ' + message.reactions[emoji] + '</button>';
      }
    }
    html += '<button type="button" aria-label="Add thumbs up reaction" data-message-id="' + escapeHtml(message.id) + '" data-message-reaction="👍">+ 👍</button>';
    return html;
  }

  function renderMessage(message) {
    var author = findMember(state.activeGroupId, message.authorId) || { name: 'Community member', role: 'member' };
    return '<article class="group-message" data-message-id="' + escapeHtml(message.id) + '">' +
      '<header><span class="group-message-avatar">' + escapeHtml(author.name.slice(0, 2).toUpperCase()) + '</span><div><strong>' + escapeHtml(author.name) + '</strong><span>' + escapeHtml(author.role) + ' · ' + escapeHtml(message.time) + '</span></div>' + (message.pinned ? '<span class="message-pinned">Pinned</span>' : '') + '</header>' +
      '<p>' + escapeHtml(message.body) + '</p>' +
      '<footer><div class="message-reactions">' + renderMessageReactions(message) + '</div><button type="button" data-thread-open="' + escapeHtml(message.id) + '">' + message.replies.length + ' replies</button><button type="button" data-message-id="' + escapeHtml(message.id) + '" data-message-moderation="pin">' + (message.pinned ? 'Unpin' : 'Pin') + '</button><button type="button" data-message-id="' + escapeHtml(message.id) + '" data-message-moderation="delete">Delete</button></footer>' +
      '</article>';
  }

  function renderMemberRail() {
    var list = document.querySelector('[data-member-list]');
    var joins = document.querySelector('[data-join-requests]');
    var pinned = document.querySelector('[data-pinned-messages]');
    var messages = state.messages[state.activeGroupId] || [];
    var roles = ['owner', 'admin', 'moderator', 'member'];
    var labels = { owner:'Owner', admin:'Admins', moderator:'Moderators', member:'Members' };
    var groupMembers = state.members[state.activeGroupId] || [];
    var html = '';
    var roleIndex;
    var memberIndex;
    var member;
    var pinnedMessages;
    if (!list) return;
    for (roleIndex = 0; roleIndex < roles.length; roleIndex += 1) {
      html += '<section class="member-role-group"><h4>' + labels[roles[roleIndex]] + '</h4>';
      for (memberIndex = 0; memberIndex < groupMembers.length; memberIndex += 1) {
        member = groupMembers[memberIndex];
        if (member.role === roles[roleIndex]) {
          html += '<div class="group-member"><span class="member-status is-' + escapeHtml(member.status) + '" aria-label="' + escapeHtml(member.status) + '"></span><span><strong>' + escapeHtml(member.name) + '</strong><small>' + escapeHtml(member.status) + '</small></span>';
          if (member.role === 'owner') {
            html += '<span class="member-owner-label">Owner</span>';
          } else {
            html += '<label class="sr-only" for="role-' + escapeHtml(member.id) + '">Role for ' + escapeHtml(member.name) + '</label><select id="role-' + escapeHtml(member.id) + '" data-member-role="' + escapeHtml(member.id) + '"><option value="admin"' + (member.role === 'admin' ? ' selected' : '') + '>Admin</option><option value="moderator"' + (member.role === 'moderator' ? ' selected' : '') + '>Moderator</option><option value="member"' + (member.role === 'member' ? ' selected' : '') + '>Member</option></select>';
          }
          html += '</div>';
        }
      }
      html += '</section>';
    }
    list.innerHTML = html;
    if (joins) joins.innerHTML = '<div class="join-request"><span><strong>Jamie Lee</strong><small>Verified customer</small></span><button type="button" data-join-request-action="approve">Approve</button><button type="button" data-join-request-action="decline">Decline</button></div>';
    if (pinned) {
      pinnedMessages = messages.filter(function (message) { return message.pinned; });
      pinned.innerHTML = pinnedMessages.length ? pinnedMessages.map(function (message) { return '<button type="button" data-thread-open="' + escapeHtml(message.id) + '">' + escapeHtml(message.body) + '</button>'; }).join('') : '<p class="group-side-empty">No pinned messages.</p>';
    }
  }

  function renderThread() {
    var panel = document.querySelector('[data-group-thread-panel]');
    var memberRail = document.querySelector('[data-group-member-rail]');
    var messages = document.querySelector('[data-thread-messages]');
    var message;
    var author;
    var html = '';
    var index;
    if (!panel || !memberRail) return;
    if (!state.activeThreadId) {
      panel.hidden = true;
      panel.classList.remove('is-mobile-open');
      memberRail.hidden = false;
      memberRail.classList.toggle('is-mobile-open', state.memberDrawerOpen);
      return;
    }
    message = findMessage(state.activeGroupId, state.activeThreadId);
    if (!message) {
      state.activeThreadId = '';
      renderThread();
      return;
    }
    panel.hidden = false;
    panel.classList.add('is-mobile-open');
    memberRail.hidden = true;
    author = findMember(state.activeGroupId, message.authorId) || { name: 'Community member' };
    html = '<article class="thread-message is-parent"><strong>' + escapeHtml(author.name) + '</strong><p>' + escapeHtml(message.body) + '</p><span>' + escapeHtml(message.time) + '</span></article>';
    for (index = 0; index < message.replies.length; index += 1) {
      author = findMember(state.activeGroupId, message.replies[index].authorId) || { name: 'Community member' };
      html += '<article class="thread-message"><strong>' + escapeHtml(author.name) + '</strong><p>' + escapeHtml(message.replies[index].body) + '</p><span>' + escapeHtml(message.replies[index].time) + '</span></article>';
    }
    messages.innerHTML = html;
  }

  function renderGroupChat() {
    var group = findGroup(state.activeGroupId);
    var list = document.querySelector('[data-message-list]');
    var name = document.querySelector('[data-active-group-name]');
    var privacy = document.querySelector('[data-active-group-privacy]');
    var members = document.querySelector('[data-active-group-members]');
    var messages;
    if (!group || !list) return;
    messages = state.messages[group.id] || [];
    if (name) name.textContent = group.name;
    if (privacy) privacy.textContent = group.visibility.charAt(0).toUpperCase() + group.visibility.slice(1);
    if (members) members.textContent = group.members + ' members';
    list.innerHTML = messages.length ? messages.map(renderMessage).join('') : '<p class="community-empty-state">No messages yet. Start the conversation.</p>';
    renderMemberRail();
    renderThread();
  }

  function renderGroupWorkspace() {
    var list = document.querySelector('[data-group-list-view]');
    var chat = document.querySelector('[data-group-chat-view]');
    if (!list || !chat) return;
    list.hidden = !!state.activeGroupId;
    chat.hidden = !state.activeGroupId;
    if (state.activeGroupId) renderGroupChat();
  }

  function updateGroupFilterButtons() {
    var buttons = document.querySelectorAll('[data-group-filter]');
    var index;
    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].classList.toggle('is-active', buttons[index].getAttribute('data-group-filter') === state.groupFilter);
    }
  }

  function updateCourseFilterButtons() {
    var buttons = document.querySelectorAll('[data-course-filter]');
    var index;
    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].classList.toggle('is-active', buttons[index].getAttribute('data-course-filter') === state.courseFilter);
    }
  }

  function setShareCourseDialog(open, courseId) {
    var dialog = document.querySelector('[data-share-course-dialog]');
    var options = document.querySelector('[data-staff-group-options]');
    var course = findCourse(courseId || state.activeShareCourseId);
    var staffGroups;
    if (!dialog) return;
    if (open && !course) return;
    if (open) {
      state.activeShareCourseId = course.id;
      staffGroups = state.groups.filter(function (group) { return group.type === 'staff' && !group.archived; });
      if (options) options.innerHTML = staffGroups.map(function (group) { return '<option value="' + escapeHtml(group.id) + '">' + escapeHtml(group.name) + '</option>'; }).join('');
    }
    dialog.hidden = !open;
    if (open && options) options.focus();
  }

  function setCreateGroupDialog(open) {
    var dialog = document.querySelector('[data-create-group-dialog]');
    var name = document.querySelector('[name="groupName"]');
    if (!dialog) return;
    dialog.hidden = !open;
    if (open && name) name.focus();
  }

  function updateMixedPrivacyConfirmation() {
    var type = document.querySelector('[name="groupType"]');
    var confirmation = document.querySelector('.mixed-confirm');
    var checkbox = document.querySelector('[data-mixed-privacy-confirm]');
    if (!type || !confirmation) return;
    confirmation.hidden = type.value !== 'mixed';
    if (type.value !== 'mixed' && checkbox) checkbox.checked = false;
  }

  function activateCommunityTab(tabId) {
    var tabs = document.querySelectorAll('[data-tab-target]');
    var panels = document.querySelectorAll('[data-tab-panel]');
    var index;
    for (index = 0; index < tabs.length; index += 1) {
      var tabActive = tabs[index].getAttribute('data-tab-target') === tabId;
      tabs[index].classList.toggle('is-active', tabActive);
      tabs[index].setAttribute('aria-selected', tabActive ? 'true' : 'false');
    }
    for (index = 0; index < panels.length; index += 1) {
      var panelActive = panels[index].getAttribute('data-tab-panel') === tabId;
      panels[index].classList.toggle('is-active', panelActive);
      panels[index].hidden = !panelActive;
    }
    return tabId;
  }

  function closestWithAttribute(node, attribute) {
    while (node && node !== document) {
      if (node.getAttribute && node.getAttribute(attribute) !== null) return node;
      node = node.parentNode;
    }
    return null;
  }

  function handleGroupsClick(event) {
    var target = event.target;
    var open = closestWithAttribute(target, 'data-group-open');
    var back = closestWithAttribute(target, 'data-groups-back');
    var thread = closestWithAttribute(target, 'data-thread-open');
    var threadClose = closestWithAttribute(target, 'data-thread-close');
    var reaction = closestWithAttribute(target, 'data-message-reaction');
    var moderation = closestWithAttribute(target, 'data-message-moderation');
    var membersOpen = closestWithAttribute(target, 'data-members-open');
    var groupFilter = closestWithAttribute(target, 'data-group-filter');
    var createGroupOpen = closestWithAttribute(target, 'data-create-group-open');
    var dialogClose = closestWithAttribute(target, 'data-dialog-close');
    var groupArchive = closestWithAttribute(target, 'data-group-archive');
    var groupManage = closestWithAttribute(target, 'data-group-manage');
    var attachment = closestWithAttribute(target, 'data-group-attachment');
    var mention = closestWithAttribute(target, 'data-group-mention');
    var emoji = closestWithAttribute(target, 'data-group-emoji');
    var search = closestWithAttribute(target, 'data-message-search');
    var settings = closestWithAttribute(target, 'data-group-settings');
    var joinRequest = closestWithAttribute(target, 'data-join-request-action');
    var result;
    var input;
    var rail;
    if (open) {
      result = openGroup(open.getAttribute('data-group-open'));
      if (result.ok) renderGroupWorkspace();
      else showCommunityNotice(result.error);
      return;
    }
    if (back) {
      state.activeGroupId = '';
      state.activeThreadId = '';
      state.memberDrawerOpen = false;
      renderGroupWorkspace();
      return;
    }
    if (thread) {
      state.activeThreadId = thread.getAttribute('data-thread-open');
      renderThread();
      return;
    }
    if (threadClose) {
      state.activeThreadId = '';
      renderThread();
      return;
    }
    if (reaction) {
      result = addMessageReaction(state.activeGroupId, reaction.getAttribute('data-message-id'), reaction.getAttribute('data-message-reaction'));
      if (result.ok) renderGroupChat();
      else showCommunityNotice(result.error);
      return;
    }
    if (moderation) {
      result = moderateMessage(state.activeGroupId, moderation.getAttribute('data-message-id'), moderation.getAttribute('data-message-moderation'));
      if (result.ok) {
        renderGroupChat();
        showCommunityNotice(moderation.getAttribute('data-message-moderation') === 'delete' ? 'Message deleted.' : (result.message.pinned ? 'Message pinned.' : 'Message unpinned.'));
      } else {
        showCommunityNotice(result.error);
      }
      return;
    }
    if (membersOpen) {
      state.memberDrawerOpen = !state.memberDrawerOpen;
      rail = document.querySelector('[data-group-member-rail]');
      if (rail) rail.classList.toggle('is-mobile-open', state.memberDrawerOpen);
      return;
    }
    if (groupFilter) {
      state.groupFilter = groupFilter.getAttribute('data-group-filter');
      updateGroupFilterButtons();
      renderGroups();
      return;
    }
    if (createGroupOpen) {
      setCreateGroupDialog(true);
      return;
    }
    if (dialogClose) {
      setCreateGroupDialog(false);
      return;
    }
    if (groupArchive) {
      result = toggleArchivedGroup(groupArchive.getAttribute('data-group-archive'));
      if (result.ok) {
        renderGroups();
        showCommunityNotice(result.group.archived ? 'Group archived.' : 'Group restored.');
      } else {
        showCommunityNotice(result.error);
      }
      return;
    }
    if (groupManage || settings) {
      showCommunityNotice('Group settings are ready for the full Community release.');
      return;
    }
    if (attachment) {
      showCommunityNotice(attachment.getAttribute('data-group-attachment') + ' attachments are ready for the full Community release.');
      return;
    }
    if (mention || emoji) {
      input = document.querySelector('[data-message-input]');
      if (input) {
        input.value += mention ? '@' : '☺';
        input.focus();
      }
      return;
    }
    if (search) {
      showCommunityNotice('Message search is ready for the full Community release.');
      return;
    }
    if (joinRequest) showCommunityNotice(joinRequest.getAttribute('data-join-request-action') === 'approve' ? 'Join request approved.' : 'Join request declined.');
  }

  function bindGroupControls() {
    var panel = document.querySelector('#panel-groups');
    if (!panel) return;
    panel.addEventListener('click', handleGroupsClick);
    panel.addEventListener('submit', function (event) {
      var form = event.target;
      var result;
      var error;
      if (form && form.getAttribute && form.getAttribute('data-message-composer') !== null) {
        event.preventDefault();
        result = sendMessage(state.activeGroupId, form.querySelector('[data-message-input]').value);
        error = form.querySelector('[data-message-error]');
        if (error) error.textContent = result.ok ? '' : result.error;
        if (result.ok) {
          form.querySelector('[data-message-input]').value = '';
          renderGroupChat();
        }
      } else if (form && form.getAttribute && form.getAttribute('data-thread-form') !== null) {
        event.preventDefault();
        result = addThreadReply(state.activeGroupId, state.activeThreadId, form.querySelector('[data-thread-input]').value);
        error = form.querySelector('[data-thread-error]');
        if (error) error.textContent = result.ok ? '' : result.error;
        if (result.ok) {
          form.querySelector('[data-thread-input]').value = '';
          renderGroupChat();
        }
      } else if (form && form.getAttribute && form.getAttribute('data-create-group-form') !== null) {
        event.preventDefault();
        result = createGroup({
          name: form.querySelector('[name="groupName"]').value,
          description: form.querySelector('[name="groupDescription"]').value,
          type: form.querySelector('[name="groupType"]').value,
          visibility: form.querySelector('[name="groupVisibility"]').value,
          posting: form.querySelector('[name="groupPosting"]').value,
          privacyAcknowledged: form.querySelector('[data-mixed-privacy-confirm]').checked
        });
        form.querySelector('[data-group-form-error]').textContent = result.ok ? '' : result.error;
        if (result.ok) {
          form.reset();
          updateMixedPrivacyConfirmation();
          setCreateGroupDialog(false);
          renderGroups();
          showCommunityNotice('Group created.');
        }
      }
    });
    panel.addEventListener('input', function (event) {
      var target = event.target;
      if (target && target.getAttribute && target.getAttribute('data-group-search') !== null) renderGroups();
    });
    panel.addEventListener('change', function (event) {
      var target = event.target;
      var result;
      if (!target || !target.getAttribute) return;
      if (target.getAttribute('name') === 'groupType') updateMixedPrivacyConfirmation();
      if (target.getAttribute('data-member-role') !== null) {
        result = setMemberRole(state.activeGroupId, target.getAttribute('data-member-role'), target.value);
        if (result.ok) renderMemberRail();
        else showCommunityNotice(result.error);
      }
    });
  }

  function bindFeedControls() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      var tab = closestWithAttribute(target, 'data-tab-target');
      var filter = closestWithAttribute(target, 'data-feed-filter');
      var reaction = closestWithAttribute(target, 'data-feed-reaction');
      var save = closestWithAttribute(target, 'data-feed-save');
      var pin = closestWithAttribute(target, 'data-feed-pin');
      var attachment = closestWithAttribute(target, 'data-demo-attachment');
      var focusComposer = closestWithAttribute(target, 'data-focus-feed-composer');
      if (tab) {
        activateCommunityTab(tab.getAttribute('data-tab-target'));
        if (typeof window.setDrawer === 'function') window.setDrawer(false);
      } else if (filter) {
        state.feedFilter = filter.getAttribute('data-feed-filter');
        updateFilterButtons();
        renderFeed();
      } else if (reaction) {
        togglePostReaction(reaction.getAttribute('data-post-id'), reaction.getAttribute('data-feed-reaction'));
      } else if (save) {
        toggleSavedPost(save.getAttribute('data-post-id'));
      } else if (pin) {
        togglePinnedPost(pin.getAttribute('data-post-id'));
      } else if (attachment) {
        showCommunityNotice(attachment.getAttribute('data-demo-attachment') + ' attachments are ready for the full Community release.');
      } else if (focusComposer) {
        var composer = document.querySelector('#community-post-body');
        if (composer) composer.focus();
      }
    });

    document.addEventListener('submit', function (event) {
      var form = event.target;
      var result;
      if (form && form.getAttribute && form.getAttribute('data-feed-composer') !== null) {
        event.preventDefault();
        result = addFeedPost(document.querySelector('#community-post-body').value, document.querySelector('[data-feed-audience]').value);
        document.querySelector('[data-feed-error]').textContent = result.ok ? '' : result.error;
        if (result.ok) {
          document.querySelector('#community-post-body').value = '';
          showCommunityNotice('Your post is live.');
        }
      } else if (form && form.getAttribute && form.getAttribute('data-feed-comment-form') !== null) {
        event.preventDefault();
        result = addFeedComment(form.getAttribute('data-post-id'), form.querySelector('[name="comment"]').value);
        if (!result.ok) showCommunityNotice(result.error);
      }
    });
  }

  function bindLearningControls() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      var filter = closestWithAttribute(target, 'data-course-filter');
      var save = closestWithAttribute(target, 'data-course-save');
      var continueCourse = closestWithAttribute(target, 'data-course-continue');
      var share = closestWithAttribute(target, 'data-course-share');
      var close = closestWithAttribute(target, 'data-share-course-close');
      var workshop = closestWithAttribute(target, 'data-learning-workshop');
      var course;
      var result;
      if (filter) {
        state.courseFilter = filter.getAttribute('data-course-filter');
        updateCourseFilterButtons();
        renderCourses();
      } else if (save) {
        result = toggleSavedCourse(save.getAttribute('data-course-save'));
        if (!result.ok) showCommunityNotice(result.error);
      } else if (continueCourse) {
        course = findCourse(continueCourse.getAttribute('data-course-continue'));
        if (!course) showCommunityNotice('Course not found.');
        else {
          setCourseProgress(course.id, course.progress + 10);
          showCommunityNotice(course.progress === 100 ? 'Course completed.' : 'Learning progress updated.');
        }
      } else if (share) {
        setShareCourseDialog(true, share.getAttribute('data-course-share'));
      } else if (close) {
        setShareCourseDialog(false);
      } else if (workshop) {
        showCommunityNotice('Your workshop seat is reserved.');
      }
    });

    document.addEventListener('submit', function (event) {
      var form = event.target;
      var result;
      var error;
      if (!form || !form.getAttribute || form.getAttribute('data-share-course-form') === null) return;
      event.preventDefault();
      result = shareCourse(state.activeShareCourseId, form.querySelector('[name="courseGroup"]').value);
      error = form.querySelector('[data-share-course-error]');
      if (error) error.textContent = result.ok ? '' : result.error;
      if (result.ok) {
        setShareCourseDialog(false);
        showCommunityNotice('Course shared with ' + result.group.name + '.');
      }
    });
  }

  function updateFilterButtons() {
    var buttons = document.querySelectorAll('[data-feed-filter]');
    var index;
    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].classList.toggle('is-active', buttons[index].getAttribute('data-feed-filter') === state.feedFilter);
    }
  }

  window.NEXORA_COMMUNITY = {
    state: state,
    addFeedPost: addFeedPost,
    filterFeedPosts: filterFeedPosts,
    togglePostReaction: togglePostReaction,
    addFeedComment: addFeedComment,
    toggleSavedPost: toggleSavedPost,
    togglePinnedPost: togglePinnedPost,
    filterCourses: filterCourses,
    toggleSavedCourse: toggleSavedCourse,
    setCourseProgress: setCourseProgress,
    shareCourse: shareCourse,
    groupDefaults: groupDefaults,
    filterGroups: filterGroups,
    createGroup: createGroup,
    updateGroup: updateGroup,
    toggleArchivedGroup: toggleArchivedGroup,
    openGroup: openGroup,
    sendMessage: sendMessage,
    addMessageReaction: addMessageReaction,
    addThreadReply: addThreadReply,
    setMemberRole: setMemberRole,
    moderateMessage: moderateMessage,
    renderGroups: renderGroups,
    renderGroupChat: renderGroupChat,
    renderCourses: renderCourses,
    activateTab: activateCommunityTab
  };
  window.activateCommunityTab = activateCommunityTab;
  window.showCommunityNotice = showCommunityNotice;

  bindFeedControls();
  bindGroupControls();
  bindLearningControls();
  renderFeed();
  renderGroups();
  renderGroupWorkspace();
  renderCourses();
}());
