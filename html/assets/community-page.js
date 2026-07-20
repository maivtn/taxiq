(function () {
  'use strict';

  var state = {
    posts: [
      { id:'feed-announcement-1', kind:'announcement', audience:'staff', author:'Nexora Touch', role:'Owner', group:'Nexora Touch Staff', time:'12 min ago', body:'Friday hours are updated. Please review your station coverage before 4 PM.', reactions:{ '👍':4 }, comments:[], saved:false, pinned:false },
      { id:'feed-customer-1', kind:'post', audience:'customer', author:'Maya Lewis', role:'VIP Customer', group:'VIP Nail Club', time:'34 min ago', body:'Which summer chrome shade works best with short almond nails?', reactions:{ '💜':6 }, comments:[], saved:false, pinned:false },
      { id:'feed-staff-1', kind:'post', audience:'staff', author:'Mia Tran', role:'Admin', group:'Nexora Touch Staff', time:'1 hr ago', body:'The new Gel-X color cards are ready at station two.', reactions:{ '✨':3 }, comments:[], saved:false, pinned:false }
    ],
    feedFilter: 'all',
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
    activateTab: activateCommunityTab
  };
  window.activateCommunityTab = activateCommunityTab;
  window.showCommunityNotice = showCommunityNotice;

  bindFeedControls();
  renderFeed();
}());
