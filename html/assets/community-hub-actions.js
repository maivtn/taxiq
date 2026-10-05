(function () {
  'use strict';

  const script = document.currentScript;
  const moduleKey = script.dataset.communityModule;
  const hubOrigin = new URL(script.src).origin;
  if (!['feed', 'jobsTech', 'jobsOwner', 'profile', 'shift', 'connect'].includes(moduleKey)) return;

  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = new URL('community-hub-actions.css', script.src).href;
  document.head.appendChild(styles);

  const one = selector => document.querySelector(selector);
  const all = selector => Array.from(document.querySelectorAll(selector));
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
  const text = (vi, en) => window.__lang && window.__lang() === 'en' ? en : vi;
  const savedJobs = new Set();
  const applications = new Map();
  let activePost = null;
  let activeJob = null;
  let activeCandidate = null;
  let dialog = null;

  function button(action, id, label, primary, disabled) {
    return '<button type="button" class="community-action-button' + (primary ? ' is-primary' : '') + '" data-community-action="' + action + '" data-community-id="' + escape(id) + '"' + (disabled ? ' disabled' : '') + '>' + escape(label) + '</button>';
  }

  function rows(values) {
    return '<div class="community-action-summary">' + values.map(([label, value]) => '<div><span>' + escape(label) + '</span><strong>' + escape(value) + '</strong></div>').join('') + '</div>';
  }

  function dateLabel(value) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00') : new Date(value);
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  }

  function closeDialog() {
    if (dialog && dialog.open) dialog.close();
  }

  function showDialog(title, body, footer) {
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'community-action-dialog';
      dialog.setAttribute('aria-labelledby', 'community-action-title');
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
      });
      document.body.appendChild(dialog);
    }
    dialog.innerHTML = '<div class="community-action-dialog-head"><h2 id="community-action-title">' + escape(title) + '</h2><button type="button" class="community-action-close" data-community-action="close" aria-label="' + text('Đóng', 'Close') + '">×</button></div><div class="community-action-dialog-body">' + body + '</div>' + (footer ? '<div class="community-action-dialog-foot">' + footer + '</div>' : '');
    if (!dialog.open) dialog.showModal();
  }

  function navigate(action, context) {
    closeDialog();
    parent.postMessage({cmd: 'communityAction', action, context}, hubOrigin === 'null' ? '*' : hubOrigin);
  }

  function refreshJobs() {
    if (moduleKey === 'jobsTech') drawBoard();
    else renderAll();
  }

  function getJob(id) {
    return (moduleKey === 'jobsTech' ? boardList() : posts).find(post => String(post.id) === String(id));
  }

  function jobActions(post) {
    const id = String(post.id);
    const saved = savedJobs.has(id);
    let html = button('job', id, text('Xem chi tiết', 'View details'));
    html += '<button type="button" class="community-action-button" data-community-action="save-job" data-community-id="' + escape(id) + '" aria-pressed="' + saved + '">' + text(saved ? '★ Đã lưu' : '☆ Lưu tin', saved ? '★ Saved' : '☆ Save job') + '</button>';
    if (moduleKey === 'jobsTech' && post.k === 'hire') html += button('apply', id, text(applications.has(id) ? 'Xem hồ sơ đã gửi' : 'Ứng tuyển', applications.has(id) ? 'View application' : 'Apply'), true);
    return '<div class="community-action-toolbar">' + html + '</div>';
  }

  function openPost(id, focusComment) {
    const post = POSTS.find(item => String(item.id) === String(id));
    if (!post) return;
    activePost = post;
    const comments = post.cm.map(comment => '<div class="community-action-comment"><strong>' + escape(comment.who) + '</strong><div class="community-action-meta">' + escape(dateLabel(comment.at)) + '</div><p>' + escape(comment.x) + '</p></div>').join('');
    const body = '<p class="community-action-meta">' + escape(post.who) + ' · ' + escape(post.ago) + '</p><p>' + escape(post.x) + '</p>' + (post.type === 'mkt' ? rows([[text('Giá', 'Price'), '$' + post.price], [text('Khu vực', 'Location'), post.city]]) : '') + (post.ph ? '<div class="community-action-photo">' + post.ph.map(escape).join(' ') + '</div>' : '') + '<div class="community-action-comments"><strong>' + text('Bình luận', 'Comments') + ' (' + post.cm.length + ')</strong>' + (comments || '<p class="community-action-meta">' + text('Chưa có bình luận. Bắt đầu cuộc trò chuyện bên dưới.', 'No comments yet. Start the conversation below.') + '</p>') + '</div><form class="community-action-form" data-community-form="comment"><label>' + text('Bình luận của bạn', 'Your comment') + '<textarea name="comment" required maxlength="2000" placeholder="' + text('Viết bình luận…', 'Write a comment…') + '"></textarea></label><button class="community-action-button is-primary" type="submit">' + text('Gửi bình luận', 'Post comment') + '</button></form>';
    showDialog(text('Bài viết', 'Post'), body, post.type === 'mkt' ? button('seller-chat', post.id, text('Nhắn người bán', 'Message seller'), true) : '');
    if (focusComment) one('[name="comment"]').focus();
  }

  function openGroup(id) {
    const group = D(id);
    if (!group) return;
    const groupPosts = POSTS.filter(post => post.dests.includes(group.id));
    const body = '<p>' + escape(group.d) + '</p>' + rows([[text('Loại nhóm', 'Group type'), KINDN[group.k]], [text('Trạng thái', 'Membership'), text(group.joined ? 'Đã tham gia' : 'Chưa tham gia', group.joined ? 'Joined' : 'Not joined')]]) + '<p><strong>' + text('Nội quy', 'Group rules') + '</strong><br>' + escape(group.rules || text('Chia sẻ đúng chủ đề, tôn trọng thành viên và không đăng spam.', 'Stay on topic, respect members, and avoid spam.')) + '</p><div class="community-action-comments"><strong>' + text('Bài viết trong nhóm', 'Group posts') + '</strong>' + (groupPosts.map(post => '<div class="community-action-comment"><strong>' + escape(post.who) + '</strong><p>' + escape(post.x) + '</p>' + button('post', post.id, text('Xem bài & bình luận', 'View post & comments')) + '</div>').join('') || '<p class="community-action-meta">' + text('Chưa có bài viết trong nhóm này.', 'This group has no posts yet.') + '</p>') + '</div>';
    showDialog(group.n, body, button('membership', group.id, text(group.joined ? 'Rời nhóm' : 'Tham gia nhóm', group.joined ? 'Leave group' : 'Join group')) + button('group-feed', group.id, text('Xem bảng tin nhóm', 'View group feed')) + button('group-chat', group.id, text('Mở trò chuyện nhóm', 'Open group chat'), true, !group.joined));
  }

  function enhanceFeed() {
    all('#feed [data-p]').forEach(card => {
      const id = card.dataset.p;
      const comments = card.querySelector('.pfoot button:nth-child(2)');
      if (comments) { comments.dataset.communityAction = 'comment'; comments.dataset.communityId = id; }
      card.querySelector('.pfoot').insertAdjacentHTML('beforeend', button('post', id, text('Xem bài', 'View post')));
    });
    all('#gList .gcard').forEach(card => {
      const membership = card.querySelector('[data-gjoin], [data-gleave]');
      if (membership) card.children[1].insertAdjacentHTML('beforeend', '<div class="community-action-toolbar">' + button('group', membership.dataset.gjoin || membership.dataset.gleave, text('Xem nhóm', 'View group')) + '</div>');
    });
    const groups = DEST.filter(group => group.joined && group.id !== 'feed');
    all('#myGroups .row').forEach((row, index) => row.insertAdjacentHTML('beforeend', button('group', groups[index].id, text('Xem nhóm', 'View group'))));
  }

  function openJob(id) {
    const post = getJob(id);
    if (!post) return;
    activeJob = post;
    const ownPost = post.mine || post.ownerMine || (moduleKey === 'jobsTech' && mine.some(item => item.card.id === post.id));
    let footer = ownPost ? '' : button('job-chat', id, text(post.k === 'hire' ? 'Nhắn tiệm' : 'Nhắn thợ', post.k === 'hire' ? 'Message salon' : 'Message tech'));
    if (moduleKey === 'jobsTech' && post.k === 'hire') footer += button('apply', id, text(applications.has(String(id)) ? 'Xem hồ sơ đã gửi' : 'Ứng tuyển bằng hồ sơ', applications.has(String(id)) ? 'View application' : 'Apply with profile'), true);
    else if ((moduleKey === 'jobsOwner' || moduleKey === 'profile') && role === 'owner' && post.k === 'seek') footer += button('candidate', post.w, text('Xem hồ sơ thợ', 'View tech profile')) + button('invite', post.w, text('Mời phỏng vấn', 'Invite to interview'), true);
    showDialog(post.t, '<p class="community-action-meta">' + escape(post.w) + '</p>' + rows([[text('Khu vực', 'Location'), post.c], [text('Mức lương', 'Compensation'), post.a], [text('Loại tin', 'Post type'), text(post.k === 'hire' ? 'Tiệm tuyển thợ' : 'Thợ tìm việc', post.k === 'hire' ? 'Salon hiring' : 'Tech seeking work')]]) + '<p>' + escape(post.b) + '</p>', footer);
  }

  function openApplication(id) {
    const post = getJob(id);
    if (!post) return;
    activeJob = post;
    const application = applications.get(String(id));
    const applicant = moduleKey === 'jobsTech' ? ME : me();
    const summary = rows([[text('Người ứng tuyển', 'Applicant'), applicant.name], [text('Khu vực', 'Location'), applicant.city], [text('Gửi tới', 'To'), post.w]]);
    if (application) {
      showDialog(text('Hồ sơ đã gửi', 'Submitted application'), '<div class="community-action-status">' + text('✓ Đã gửi ứng tuyển · Chờ tiệm phản hồi', '✓ Application sent · Awaiting salon response') + '</div>' + summary + '<p class="community-action-meta">' + dateLabel(application.at) + '</p><p>' + escape(application.note) + '</p>', button('job-chat', id, text('Nhắn tiệm', 'Message salon'), true));
      return;
    }
    showDialog(text('Ứng tuyển', 'Apply') + ' · ' + post.t, summary + '<p class="community-action-meta">' + text('Tiệm nhận tên, khu vực và lời giới thiệu. Số điện thoại vẫn được giữ riêng tư.', 'The salon receives your name, location, and introduction. Your phone number stays private.') + '</p><form class="community-action-form" data-community-form="application"><label>' + text('Lời giới thiệu gửi tiệm', 'Introduction for the salon') + '<textarea name="note" required maxlength="2000">' + escape(text('Chào tiệm, mình quan tâm vị trí này và muốn trao đổi thêm về công việc.', 'Hello, I am interested in this position and would like to discuss the opportunity.')) + '</textarea></label><button type="submit" class="community-action-button is-primary">' + text('Gửi ứng tuyển', 'Submit application') + '</button></form>');
  }

  function openCandidate(name) {
    const ownProfile = me();
    const candidate = TECHS.find(item => item.name === name) || (ownProfile.name === name ? ownProfile : null);
    const post = posts.find(item => item.w === name);
    if (!candidate && !post) return;
    const details = candidate ? rows([[text('Khu vực', 'Location'), candidate.city], [text('Kinh nghiệm', 'Experience'), candidate.years], [text('Kỹ năng', 'Skills'), candidate.skills.join(', ')], [text('Lịch mong muốn', 'Availability'), candidate.type.join(', ')]]) : '<p>' + escape(post.b) + '</p>';
    showDialog(name, details + '<p class="community-action-meta">' + text('Liên hệ trong NEXORA để trao đổi trước khi chia sẻ số điện thoại.', 'Message in NEXORA before sharing phone numbers.') + '</p>', button('candidate-chat', name, text('Nhắn thợ', 'Message tech')) + button('invite', name, text('Mời phỏng vấn', 'Invite to interview'), true));
  }

  function openInvite(name) {
    const existing = invites.find(item => item.to === name);
    if (existing) return openSentInvite(invites.indexOf(existing));
    activeCandidate = name;
    showDialog(text('Mời phỏng vấn', 'Invite to interview') + ' · ' + name, '<form class="community-action-form" data-community-form="invite"><label>' + text('Lời mời gửi thợ', 'Invitation message') + '<textarea name="note" required maxlength="2000">' + escape(text('Chào bạn, Kayla Nails & Spa muốn mời bạn trao đổi về công việc và thử tay nghề.', 'Hello, Kayla Nails & Spa would like to invite you to discuss the role and arrange a skills trial.')) + '</textarea></label><div class="community-action-date-row"><label>' + text('Ngày hẹn (tùy chọn)', 'Interview date (optional)') + '<input type="date" name="date"></label><label>' + text('Giờ hẹn (tùy chọn)', 'Interview time (optional)') + '<input type="time" name="time"></label></div><button class="community-action-button is-primary" type="submit">' + text('Gửi lời mời', 'Send invitation') + '</button></form>');
  }

  function openSentInvite(index) {
    const invitation = invites[index];
    if (!invitation) return;
    showDialog(text('Lời mời đã gửi', 'Sent invitation'), rows([[text('Gửi tới', 'To'), invitation.to], [text('Tiệm', 'Salon'), invitation.from], [text('Trạng thái', 'Status'), text(invitation.st === 'ok' ? 'Đã chấp nhận' : invitation.st === 'no' ? 'Đã từ chối' : 'Chờ thợ phản hồi', invitation.st === 'ok' ? 'Accepted' : invitation.st === 'no' ? 'Declined' : 'Awaiting response')]]) + (invitation.date ? '<p>' + escape(dateLabel(invitation.date) + (invitation.time ? ' · ' + invitation.time : '')) + '</p>' : '') + '<p>' + escape(invitation.note || text('Mời phỏng vấn thử tay nghề.', 'Invitation for an interview and skills trial.')) + '</p>', button('candidate-chat', invitation.to, text('Nhắn thợ', 'Message tech'), true));
  }

  function openShift(id) {
    const shift = S.SH.find(item => item.id === id);
    if (!shift) return;
    const application = myApp(shift);
    const isOwn = role === 'owner' && shift.own;
    const taken = shift.apps.filter(item => ['locked', 'checked', 'done'].includes(item.st)).length;
    const available = hl(shift) > 0 && taken < shift.need && (!application || application.st === 'invited');
    const statuses = {
      applied: text('Chờ duyệt', 'Awaiting approval'), invited: text('Đã mời', 'Invited'),
      locked: text('Đã chốt', 'Confirmed'), checked: text('Đã check-in', 'Checked in'),
      done: text('Hoàn thành', 'Completed'), noshow: text('Vắng mặt', 'No-show'),
      rejected: text('Không được chọn', 'Not selected'), cancel_t: text('Thợ đã huỷ', 'Tech cancelled'),
      cancel_s: text('Tiệm đã huỷ', 'Salon cancelled')
    };
    const body = rows([[text('Tiệm', 'Salon'), shift.salon], [text('Thời gian', 'Schedule'), shift.time], [text('Dịch vụ', 'Services'), shift.svc.join(', ')], [text('Trả công', 'Pay'), '$' + shift.pay + ' + tips'], [text('Cọc tạm giữ', 'Deposit hold'), '$' + dep(shift)], [text('Đã chốt', 'Confirmed'), taken + '/' + shift.need]]) + policyBar(shift) + (isOwn ? '<div class="community-action-comments"><strong>' + text('Thợ đăng ký', 'Applicants') + '</strong>' + (shift.apps.map(item => '<p>' + escape(item.n) + ' · ' + escape(statuses[item.st] || item.st) + '</p>').join('') || '<p class="community-action-meta">' + text('Chưa có thợ đăng ký.', 'No applicants yet.') + '</p>') + '</div>' : '');
    let footer = isOwn ? button('manage-shift', id, text('Quản lý thợ đăng ký', 'Manage applicants')) : button('shift-chat', id, text('Nhắn tiệm', 'Message salon'));
    if (role === 'tech') footer += button('take-shift', id, text(available ? 'Nhận / ứng tuyển ca' : 'Ca đã đăng ký hoặc hết chỗ', available ? 'Accept / apply for shift' : 'Already applied or full'), true, !available);
    if (isOwn) footer += button('share-shift', id, text('Chia sẻ vào nhóm tiệm', 'Share to staff group'), true);
    showDialog(shift.title, body, footer);
  }

  function openChat(context) {
    const name = String(context.name || '').trim();
    if (!name) return;
    if (S.BLOCK.includes(name)) return toast(text('Bạn đã chặn người này. Bỏ chặn trong Riêng tư để nhắn tin.', 'You blocked this person. Unblock them in Privacy to message.'));
    const type = context.group ? 'group' : 'dm';
    let conversation = S.CH.find(item => item.name === name && item.t === type);
    if (!conversation) {
      conversation = {id: 'community-' + Date.now() + '-' + S.CH.length, t: type, name, sub: String(context.subtitle || ''), unread: 0, msgs: []};
      if (type === 'group') conversation.members = [{n: text('Bạn', 'You'), role: 'Bạn', online: 1}];
      S.CH.unshift(conversation);
    }
    if (context.shift) conversation.msgs.push({id: ++mid, me: 1, f: 'Bạn', x: context.shift.title, communityShift: context.shift, t: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})});
    tab = type;
    one('#q').value = '';
    openRoom(conversation.id);
    one('#inp').value = String(context.draft || '');
    setSendIcon();
    one('#inp').focus();
  }

  if (moduleKey === 'feed') {
    const original = render;
    render = function () { original(); enhanceFeed(); };
    render();
  } else if (moduleKey === 'jobsTech') {
    const original = cardHTML;
    cardHTML = function (post, fresh) { return original(post, fresh).replace(/<\/div>$/, jobActions(post) + '</div>'); };
    drawBoard();
  } else if (moduleKey === 'jobsOwner' || moduleKey === 'profile') {
    const originalJobs = drawJobs;
    drawJobs = function () {
      originalJobs();
      const visiblePosts = posts.filter(visible);
      all('#jobs .job').forEach((card, index) => card.insertAdjacentHTML('beforeend', jobActions(visiblePosts[index])));
    };
    const originalSent = drawSent;
    drawSent = function () {
      originalSent();
      all('#sentList > div').forEach((item, index) => item.insertAdjacentHTML('beforeend', button('sent-invite', index, text('Xem lời mời', 'View invitation'))));
    };
    const originalMatches = drawMatches;
    drawMatches = function () {
      originalMatches();
      all('#matchList .match').forEach(item => item.insertAdjacentHTML('beforeend', button('candidate', item.querySelector('b').textContent, text('Hồ sơ', 'Profile'))));
    };
    renderAll();
  } else if (moduleKey === 'shift') {
    const original = render;
    render = function () {
      original();
      all('.shift[data-s], .shift[data-m], .shift[data-o]').forEach(card => card.insertAdjacentHTML('beforeend', '<div class="community-action-toolbar">' + button('shift', card.dataset.s || card.dataset.m || card.dataset.o, text('Xem chi tiết ca', 'View shift details')) + '</div>'));
    };
    render();
  } else if (moduleKey === 'connect') {
    const original = bodyOf;
    bodyOf = function (message) {
      if (!message.communityShift) return original(message);
      const shift = message.communityShift;
      return '<div class="scard"><strong>' + escape(shift.title) + '</strong><div class="community-action-meta">' + escape(shift.salon) + ' · ' + escape(shift.time) + ' · $' + escape(shift.pay) + ' + tips</div>' + button('shared-shift', shift.id, text('Xem ca & nhận', 'View & accept shift'), true) + '</div>';
    };
  }

  document.addEventListener('click', function (event) {
    const target = event.target.closest('button');
    if (!target) return;
    let action = target.dataset.communityAction;
    let id = target.dataset.communityId;
    if (moduleKey === 'feed' && target.hasAttribute('data-msg')) { action = 'seller-chat'; id = target.dataset.msg; }
    if ((moduleKey === 'jobsOwner' || moduleKey === 'profile') && target.hasAttribute('data-invite')) { action = 'invite'; id = target.dataset.invite; }
    if ((moduleKey === 'jobsOwner' || moduleKey === 'profile') && target.hasAttribute('data-apply')) { action = 'apply'; id = target.dataset.apply; }
    if (moduleKey === 'connect' && target.hasAttribute('data-toast') && target.closest('.scard')) { action = 'shared-shift'; id = 's1'; }
    if (!action) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (action === 'close') return closeDialog();
    if (action === 'post' || action === 'comment') return openPost(id, action === 'comment');
    if (action === 'group') return openGroup(id);
    if (action === 'membership') {
      if (!canPost()) { closeDialog(); return needTerms(); }
      const group = D(id);
      group.joined = !group.joined;
      render();
      return openGroup(id);
    }
    if (action === 'group-feed') return navigate('groupFeed', {id});
    if (action === 'group-chat') return navigate('chat', {name: D(id).n, subtitle: D(id).d, group: true});
    if (action === 'seller-chat') {
      const post = POSTS.find(item => String(item.id) === String(id));
      return navigate('chat', {name: post.who, subtitle: post.city, draft: text('Chào bạn, món này còn không? ', 'Hello, is this still available? ') + post.x});
    }
    if (action === 'job') return openJob(id);
    if (action === 'apply') return openApplication(id);
    if (action === 'save-job') { savedJobs.has(String(id)) ? savedJobs.delete(String(id)) : savedJobs.add(String(id)); return refreshJobs(); }
    if (action === 'job-chat') { const post = getJob(id); return navigate('chat', {name: post.w, subtitle: post.c, draft: text('Mình muốn trao đổi về tin: ', 'I would like to discuss: ') + post.t}); }
    if (action === 'candidate') return openCandidate(id);
    if (action === 'invite') return openInvite(id);
    if (action === 'sent-invite') return openSentInvite(Number(id));
    if (action === 'candidate-chat') return navigate('chat', {name: id, subtitle: text('Trao đổi công việc', 'Job discussion')});
    if (action === 'shift') return openShift(id);
    if (action === 'shared-shift') return navigate('shift', {id});
    if (action === 'take-shift') { closeDialog(); return take(id); }
    if (action === 'manage-shift') { closeDialog(); const card = all('.shift[data-o]').find(item => item.dataset.o === id); if (card) card.scrollIntoView({behavior: 'smooth', block: 'center'}); return; }
    if (action === 'shift-chat' || action === 'share-shift') {
      const shift = S.SH.find(item => item.id === id);
      return navigate('chat', {name: action === 'share-shift' ? shift.salon + ' · Staff' : shift.salon, subtitle: shift.time, group: action === 'share-shift', shift: action === 'share-shift' ? {id: shift.id, title: shift.title, salon: shift.salon, time: shift.time, pay: shift.pay} : null, draft: action === 'shift-chat' ? text('Mình muốn hỏi về ca: ', 'I would like to ask about the shift: ') + shift.title : ''});
    }
  }, true);

  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!form.dataset.communityForm) return;
    event.preventDefault();
    const values = new FormData(form);
    const note = String(values.get('note') || '').trim();
    if (form.dataset.communityForm === 'comment') {
      if (!canPost()) { closeDialog(); return needTerms(); }
      const comment = String(values.get('comment') || '').trim();
      if (!comment) return;
      activePost.cm.push({who: ACC[acc].name, x: comment, at: new Date().toISOString()});
      render();
      openPost(activePost.id, true);
    } else if (form.dataset.communityForm === 'application') {
      if (!note) return;
      applications.set(String(activeJob.id), {note, at: new Date().toISOString()});
      refreshJobs();
      openApplication(activeJob.id);
    } else if (form.dataset.communityForm === 'invite') {
      if (!note) return;
      const name = activeCandidate;
      invite(name);
      const invitation = invites.find(item => item.to === name);
      invitation.note = note;
      invitation.date = String(values.get('date') || '');
      invitation.time = String(values.get('time') || '');
      openSentInvite(invites.indexOf(invitation));
    }
  });

  window.addEventListener('message', function (event) {
    if (event.source !== parent || event.origin !== hubOrigin) return;
    const message = event.data || {};
    if (message.cmd === 'view' || message.cmd === 'stopTour') closeDialog();
    if (message.cmd !== 'communityContext') return;
    const context = message.context || {};
    if (moduleKey === 'connect' && message.action === 'chat') openChat(context);
    if (moduleKey === 'shift' && message.action === 'shift') openShift(context.id);
    if (moduleKey === 'feed' && message.action === 'groupFeed' && D(context.id)) { filt = context.id; render(); }
  });
})();
