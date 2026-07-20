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
    viewerReactions: {},
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
      group.visibility = updates.visibility;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'description')) group.description = String(updates.description == null ? '' : updates.description).replace(/^\s+|\s+$/g, '');
    if (Object.prototype.hasOwnProperty.call(updates, 'posting')) {
      if (validPosting.indexOf(updates.posting) === -1) return { ok: false, error: 'Choose a valid posting permission.' };
      group.posting = updates.posting;
    }
    return { ok: true, group: group };
  }

  function toggleArchivedGroup(groupId) {
    var group = findGroup(groupId);
    if (!group) return { ok: false, error: 'Group not found.' };
    group.archived = !group.archived;
    return { ok: true, group: group };
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

  function updateGroupFilterButtons() {
    var buttons = document.querySelectorAll('[data-group-filter]');
    var index;
    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].classList.toggle('is-active', buttons[index].getAttribute('data-group-filter') === state.groupFilter);
    }
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
      var groupFilter = closestWithAttribute(target, 'data-group-filter');
      var createGroupOpen = closestWithAttribute(target, 'data-create-group-open');
      var dialogClose = closestWithAttribute(target, 'data-dialog-close');
      var groupArchive = closestWithAttribute(target, 'data-group-archive');
      var groupOpen = closestWithAttribute(target, 'data-group-open');
      var groupManage = closestWithAttribute(target, 'data-group-manage');
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
      } else if (groupFilter) {
        state.groupFilter = groupFilter.getAttribute('data-group-filter');
        updateGroupFilterButtons();
        renderGroups();
      } else if (createGroupOpen) {
        setCreateGroupDialog(true);
      } else if (dialogClose) {
        setCreateGroupDialog(false);
      } else if (groupArchive) {
        var archiveResult = toggleArchivedGroup(groupArchive.getAttribute('data-group-archive'));
        if (archiveResult.ok) {
          renderGroups();
          showCommunityNotice(archiveResult.group.archived ? 'Group archived.' : 'Group restored.');
        } else {
          showCommunityNotice(archiveResult.error);
        }
      } else if (groupOpen) {
        showCommunityNotice('Group chat opens in the next Community update.');
      } else if (groupManage) {
        showCommunityNotice('Group management opens in the next Community update.');
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

    document.addEventListener('input', function (event) {
      var target = event.target;
      if (target && target.getAttribute && target.getAttribute('data-group-search') !== null) renderGroups();
    });

    document.addEventListener('change', function (event) {
      var target = event.target;
      if (target && target.getAttribute && target.getAttribute('name') === 'groupType') updateMixedPrivacyConfirmation();
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
    groupDefaults: groupDefaults,
    filterGroups: filterGroups,
    createGroup: createGroup,
    updateGroup: updateGroup,
    toggleArchivedGroup: toggleArchivedGroup,
    renderGroups: renderGroups,
    activateTab: activateCommunityTab
  };
  window.activateCommunityTab = activateCommunityTab;
  window.showCommunityNotice = showCommunityNotice;

  bindFeedControls();
  renderFeed();
  renderGroups();
}());
