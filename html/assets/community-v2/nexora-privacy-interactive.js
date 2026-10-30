(() => {
  const contextParams=new URLSearchParams(location.search);
  const currentMember=contextParams.get('member')||'BITCOIN NAIL BAR';
  const currentRole=['staff','tech'].includes(contextParams.get('role'))||contextParams.get('account')==='personal'?'staff':'owner';
  const currentAccount=contextParams.get('account')==='personal'?'personal':'business';
  const key = 'nexora-connect-preview-v2'+(currentMember==='BITCOIN NAIL BAR'?'':':'+encodeURIComponent(currentMember));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const tourSeenKey = 'nexora-connect-guide-seen-v1';
  let profileUrl = 'https://nexoratouch.com/community?tab=connect&handle=@bitcoin.nail.bar';
  const inviteUrl = 'https://nexoratouch.com/';
  const defaults = {phone:'shared', email:'nobody', messages:'requests', calls:'shared', request:'pending', sentMessages:{}, sourceChats:{}, deletedCalls:[], createdGroups:[], joinedCommunities:[], connections:[], chatPrefs:{}, archivedChats:[], deletedChats:[], reportedChats:[],clearedChats:{},callHistory:[],messageMeta:{},profile:{}};
  const members = [
    {name:'Mai Nguyễn', id:'NX-2041', handle:'@mai.nail', detail:'request'},
    {name:'Kim Tuyen', id:'NX-2042', handle:'@kim.tuyen', phone:'7135550144', detail:'chat-kim'},
    {name:'Sally Thanh Hoang', id:'NX-2043', handle:'@sally.hoang', email:'sally@example.com', detail:'chat-sally'},
    ...(window.NEXORA_COMMUNITY_DEMO?.connect?.members||[])
  ];
  const callTime=(days,hour,minute)=>{const date=new Date();date.setDate(date.getDate()-days);date.setHours(hour,minute,0,0);if(date>new Date())date.setDate(date.getDate()-1);return date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' · '+date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});};
  const calls = [
    {name:'Kim Tuyen',id:'call-1',type:'outgoing-voice',summary:'Outgoing · Voice · '+callTime(0,9,25)},
    {name:'Mai Nguyễn',id:'call-2',type:'missed-video',summary:'Missed · Video · '+callTime(1,14,24)},
    {name:'Sally Thanh Hoang',id:'call-4',type:'missed-voice',summary:'Missed · Voice · '+callTime(1,10,41)},
    {name:'Kim Tuyen',id:'call-5',type:'outgoing-voice',summary:'Outgoing · Voice · '+callTime(2,16,10)},
    {name:'Mai Nguyễn',id:'call-6',type:'outgoing-video',summary:'Outgoing · Video · '+callTime(3,11,5)},
    ...(window.NEXORA_COMMUNITY_DEMO?.connect?.calls||[]).map(call=>({...call,summary:(call.type.startsWith('missed-')?'Missed':'Outgoing')+' · '+(call.type.endsWith('video')?'Video':'Voice')+' · '+callTime(call.days,call.hour,call.minute)}))
  ];
  const communities = [
    {id:'dallas', name:'Dallas – Fort Worth Nail Technicians', type:'city', detail:'Dallas – Fort Worth · 962 members'},
    {id:'tax', name:'Taxes & 1099 for Technicians', type:'topic', detail:'624 members'},
    {id:'ai', name:'Learning AI', type:'topic', detail:'387 members'}
  ];
  const $ = selector => document.querySelector(selector);
  const parentMessageOrigin = location.protocol === 'file:' ? '*' : location.origin;
  const esc = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const initials = value => String(value || '').trim().split(/\s+/).filter(Boolean).slice(0,2).map(word=>[...word][0]).join('').toLocaleUpperCase();
  const phoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l1 5-2 2a16 16 0 0 0 6 6l2-2 5 1v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2z"/></svg>';
  const videoIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></svg>';
  const imageIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m4 17 5-5 3 3 3-3 5 5"/></svg>';
  const micIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8"/></svg>';
  const emojiIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 2.4 3 4 3s3-1 4-3M8.5 9h.01M15.5 9h.01"/></svg>';
  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return withDemoChats(value && typeof value === 'object' ? {...clone(defaults),...value} : clone(defaults));
    } catch { return withDemoChats(clone(defaults)); }
  }
  function withDemoChats(value) {
    const sources=value.sourceChats&&typeof value.sourceChats==='object'&&!Array.isArray(value.sourceChats)?value.sourceChats:{};
    value.sourceChats={...Object.fromEntries((window.NEXORA_COMMUNITY_DEMO?.connect?.chats||[]).filter(chat=>chat.recipient!==currentMember).map(chat=>[chat.id,{recipient:chat.recipient,reference:chat.reference,sourceId:'demo:'+chat.id}])),...sources};
    for(const chat of window.NEXORA_COMMUNITY_DEMO?.connect?.chats||[]){const source=value.sourceChats[chat.id];if(source?.sourceId==='demo:'+chat.id)source.reference=chat.reference;}
    return value;
  }
  let state = load();
  if (!Array.isArray(state.deletedCalls)) state.deletedCalls = [];
  if (!Array.isArray(state.createdGroups)) state.createdGroups = [];
  if (!Array.isArray(state.joinedCommunities)) state.joinedCommunities = [];
  if (!Array.isArray(state.connections)) state.connections = [];
  if (!state.sentMessages || typeof state.sentMessages !== 'object' || Array.isArray(state.sentMessages)) state.sentMessages = {};
  if (!state.chatPrefs || typeof state.chatPrefs !== 'object' || Array.isArray(state.chatPrefs)) state.chatPrefs = {};
  for (const field of ['archivedChats','deletedChats','reportedChats']) if (!Array.isArray(state[field])) state[field] = [];
  if (!state.sourceChats || typeof state.sourceChats !== 'object' || Array.isArray(state.sourceChats)) state.sourceChats = {};
  let savedSnapshot=clone(state),mediaGeneration=0;
  let section = 'privacy';
  let currentDetail = '';
  const chatDrafts = new Map();
  function rememberChatDraft(){const input=$('#messageText');if(currentDetail&&input)chatDrafts.set(currentDetail,{text:input.value,attachment:pendingChatAttachment});}
  let callFilter = 'all';
  let communityFilter = 'all';
  let lastDeletedCall = null;
  let swipeStart = null;
  let suppressCallClickUntil = 0;
  let tourActive = false;
  let tourPaused = false;
  let tourHeld = false;
  let tourTimer = null;
  let tourIndex = 0;
  let tourPreviousSection = 'messages';
  const tourSteps = [
    {section:'messages',title:'Messages',description:() => state.request === 'pending' ? 'Find people above. Open View to review the new request.' : 'Find someone above, then add or message them.'},
    {section:'calls',title:'Calls',description:() => 'Tap the phone or camera icon to call. Use Missed calls to filter.'},
    {section:'groups',title:'Group chats',description:() => 'Open a chat or create a group.'},
    {section:'privacy',title:'Settings',description:() => 'Share your profile and choose who can contact you.'}
  ];
  function mergeChanges(latest,before,after) {
    if(JSON.stringify(before)===JSON.stringify(after))return latest;
    if(Array.isArray(after)) {
      const old=Array.isArray(before)?before:[],now=Array.isArray(latest)?latest:[];
      const token=item=>item&&typeof item==='object'?String(item.id||JSON.stringify(item)):JSON.stringify(item);
      const removed=new Set(old.filter(item=>!after.some(row=>token(row)===token(item))).map(token));
      const rows=now.filter(item=>!removed.has(token(item)));
      for(const item of after){const prior=old.find(row=>token(row)===token(item));if(!prior||JSON.stringify(prior)!==JSON.stringify(item)){const index=rows.findIndex(row=>token(row)===token(item));if(index>=0)rows[index]=clone(item);else rows.push(clone(item));}}
      return rows;
    }
    if(after&&typeof after==='object') {
      const result=latest&&typeof latest==='object'&&!Array.isArray(latest)?clone(latest):{};
      for(const name of new Set([...Object.keys(before||{}),...Object.keys(after)])) {if(!Object.hasOwn(after,name)){if(Object.hasOwn(before||{},name))delete result[name];}else result[name]=mergeChanges(result[name],before?.[name],after[name]);}
      return result;
    }
    return after;
  }
  function save() {
    try {const latest=load(),next=mergeChanges(latest,savedSnapshot,state);localStorage.setItem(key,JSON.stringify(next));state=next;savedSnapshot=clone(next);return true;}
    catch {state=clone(savedSnapshot);return false;}
  }
  function mutate(operation){state=load();savedSnapshot=clone(state);operation(state);return save();}
  function blockedNames(){const names=Object.entries(state.chatPrefs).filter(([,pref])=>pref?.blocked).map(([id])=>members.find(person=>person.detail===id)?.name||state.sourceChats[id]?.recipient||(id==='chat-mai'?'Mai Nguyễn':id));if(state.request==='blocked')names.push('Mai Nguyễn');return [...new Set(names)];}
  function isBlocked(name){return blockedNames().includes(name);}
  function changed(){window.dispatchEvent(new CustomEvent('nexora-connect-render'));}

  function toast(message, undo = false) {
    const el = $('#toast');
    $('#toastMessage').textContent = message;
    $('#toastUndo').classList.toggle('hidden', !undo);
    el.classList.remove('hidden');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { el.classList.add('hidden'); lastDeletedCall = null; }, undo ? 10000 : 3200);
  }
  function renderSummaries() {
    document.querySelectorAll('[data-quick-setting]').forEach(select => { select.value = state[select.dataset.quickSetting]; });
    $('#blockedSummary').textContent = String(blockedNames().length)+' '+(blockedNames().length===1?'account':'accounts');
    changed();
  }
  function setMessageView(next) {
    $('#directPanel').classList.toggle('hidden', next !== 'direct');
    $('#groupsPanel').classList.toggle('hidden', next !== 'groups');
    document.querySelectorAll('.message-intro').forEach(element => element.classList.toggle('hidden', next === 'groups'));
    $('#messagesPanel').setAttribute('aria-labelledby', next === 'groups' ? 'groupsTitle' : 'messagesTitle');
  }
  function showSection(next) {
    rememberChatDraft();mediaGeneration++;
    closeChatRecording();pendingChatAttachment=null;
    section = next;
    currentDetail = '';
    document.body.dataset.section = next;
    $('#connectStage').classList.remove('detail-open', 'default-preview');
    $('#memberQuery').value = '';
    renderMemberResults();
    for (const name of ['messages','calls','privacy']) {
      $('#' + name + 'Panel').classList.toggle('hidden', name !== (next === 'groups' ? 'messages' : next));
    }
    $('#detailPanel').classList.add('hidden');
    $('#callPreview').classList.add('hidden');
    document.querySelectorAll('[data-section]').forEach(button => {
      const active = button.dataset.section === next;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    if (next === 'messages' || next === 'groups') {
      setMessageView(next === 'groups' ? 'groups' : 'direct');
      renderMessages();
    }
    if (next === 'calls') renderCalls();
    if (next === 'groups') renderGroups();
    if (next === 'privacy') renderSummaries();
    if (window.parent !== window) window.parent.postMessage({type:'nexora-connect-section',section:next}, parentMessageOrigin);
    if (window.parent !== window) window.parent.postMessage({type:'nexora-connect-detail',open:false}, parentMessageOrigin);
    window.scrollTo({top:0,behavior:'instant'});changed();
  }
  function clearTourTimer() {
    if (tourTimer !== null) window.clearTimeout(tourTimer);
    tourTimer = null;
  }
  function scheduleTourAdvance() {
    clearTourTimer();
    if (!tourActive || tourPaused || tourHeld || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    tourTimer = window.setTimeout(() => {
      if (tourIndex === tourSteps.length - 1) finishTour(true);
      else { tourIndex += 1; renderTourStep(); }
    }, 4300);
  }
  function renderTourStep() {
    const step = tourSteps[tourIndex];
    showSection(step.section);
    document.querySelectorAll('.page-tabs .tour-target').forEach(button => {
      button.classList.remove('tour-target');
      button.removeAttribute('aria-describedby');
    });
    const target = document.querySelector('.page-tabs [data-section="' + step.section + '"]');
    target?.classList.add('tour-target');
    target?.setAttribute('aria-describedby','tourDescription');
    $('#tourProgress').textContent = 'SMART GUIDE · ' + (tourIndex + 1) + ' OF ' + tourSteps.length;
    $('#tourTitle').textContent = step.title;
    $('#tourDescription').textContent = step.description();
    $('#tourNextBtn').textContent = tourIndex === tourSteps.length - 1 ? 'Finish' : 'Next';
    $('#tourPauseBtn').textContent = tourPaused ? 'Resume' : 'Pause';
    scheduleTourAdvance();
  }
  function finishTour(restoreSection) {
    if (!tourActive) return;
    clearTourTimer();
    tourActive = false;
    $('#tourPanel').classList.add('hidden');
    document.querySelectorAll('.page-tabs .tour-target').forEach(button => {
      button.classList.remove('tour-target');
      button.removeAttribute('aria-describedby');
    });
    try { localStorage.setItem(tourSeenKey,'1'); } catch {}
    if (restoreSection) showSection(tourPreviousSection);
  }
  function startTour() {
    if (tourActive) finishTour(false);
    tourPreviousSection = section;
    tourIndex = 0;
    tourPaused = false;
    tourHeld = false;
    tourActive = true;
    $('#tourPanel').classList.remove('hidden');
    renderTourStep();
  }
  function detailShell(title, subtitle, content, actions = '') {
    return '<button class="back" data-back>← Back to ' + esc(section === 'privacy' ? 'Settings' : section === 'calls' ? 'Calls' : section === 'groups' ? 'Group chats' : 'Messages') + '</button>' +
      '<div class="chat-heading"><div><h2 class="screen-title" tabindex="-1" id="detailTitle">' + esc(title) + '</h2>' +
      '<p class="screen-subtitle">' + esc(subtitle) + '</p></div>' + actions + '</div>' + content;
  }
  let pendingChatAttachment = null;
  let chatRecorder = null;
  let chatStream = null;
  let chatRecordingTimer = null;
  let discardChatRecording = false;
  const ui = (en, vi) => document.documentElement.lang === 'vi' ? vi : en;
  const chatGifFiles = ['nexora-chat-gif-hello.gif','nexora-chat-gif-thanks.gif'];
  function chatMessageMarkup(message, initials) {
    const type = message.type || 'text';
    let media = '';
    if (type === 'image' && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(message.src || '')) media = '<img class="chat-media-image" src="' + message.src + '" alt="Shared photo">';
    if (type === 'audio' && /^data:audio\/(?:webm|mp4|ogg)(?:;codecs=[a-z0-9.-]+)?;base64,[A-Za-z0-9+/=]+$/i.test(message.src || '')) media = '<audio controls src="' + message.src + '" aria-label="Voice message"></audio>';
    if (type === 'gif' && chatGifFiles.includes(message.src)) media = '<img class="chat-media-image" src="' + message.src + '" alt="GIF animation">';
    if (type === 'sticker') media = '<span class="chat-sticker" aria-label="Sticker">' + esc(message.sticker || '✨') + '</span>';
    const text = message.text ? '<span class="chat-message-text">' + esc(message.text) + '</span>' : '';
    const contents = media || text ? media + text : '<span class="chat-message-text">Message</span>';
    return '<div class="chat-message ' + (message.mine ? 'mine' : 'theirs') + '" data-connect-message-id="'+esc(message.id)+'">' + (message.mine ? '' : '<span class="chat-inline-avatar" aria-hidden="true">' + esc(initials) + '</span>') + '<div class="thread-bubble' + (message.mine ? ' mine' : '') + '">' + contents + '</div></div>';
  }
  const chatMenuIcons = {
    inbox:'<path d="M4 4h16v13H8l-4 3V4z"/>',profile:'<circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/>',theme:'<circle cx="12" cy="12" r="9"/><path d="M12 3a4 4 0 0 0 0 8 4 4 0 0 1 0 8"/>',emoji:'<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 2.5 3 4 3s3-1 4-3M8.5 9h.01M15.5 9h.01"/>',nickname:'<path d="m4 20 4-.8L20 7l-3-3L5 16zM15 6l3 3"/>',group:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M17 12v8m-4-4h8"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',mute:'<path d="M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3V9zM10 21h4M3 3l18 18"/>',block:'<circle cx="12" cy="12" r="9"/><path d="m5.5 5.5 13 13"/>',restrict:'<path d="M4 5h16v13H8l-4 3V5zM4 20 20 4"/>',read:'<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',archive:'<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 13h4"/>',delete:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',report:'<path d="M12 3 2 21h20L12 3zM12 9v5m0 3h.01"/>'
  };
  function chatMenuIcon(kind){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+chatMenuIcons[kind]+'</svg>';}
  function chatPref(id){return state.chatPrefs[id] || (state.chatPrefs[id]={});}
  function chatMenuRow(action,icon,label,detail='',danger=false){return '<button type="button" role="menuitem" class="chat-menu-row'+(danger?' danger':'')+'" data-chat-menu-action="'+action+'">'+chatMenuIcon(icon)+'<span><strong>'+esc(label)+'</strong>'+(detail?'<small>'+esc(detail)+'</small>':'')+'</span><span class="chat-menu-chevron" aria-hidden="true">›</span></button>';}
  function chatMenuMarkup(id,name){const pref=chatPref(id);return '<div id="conversationMenu" class="chat-menu hidden" role="menu" aria-label="'+esc(ui('Conversation options','Tùy chọn cuộc trò chuyện'))+'">'+
    chatMenuRow('inbox','inbox',ui('Open messages','Mở hộp thư'))+chatMenuRow('profile','profile',ui('View profile','Xem hồ sơ'))+
    '<hr>'+chatMenuRow('theme','theme',ui('Change theme','Đổi chủ đề'))+chatMenuRow('emoji','emoji',ui('Quick emoji','Biểu tượng nhanh'))+chatMenuRow('nickname','nickname',ui('Nickname','Biệt danh'))+
    '<hr>'+chatMenuRow('group','group',ui('Create group','Tạo nhóm'))+chatMenuRow('encryption','lock',ui('End-to-end encrypted chat','Trò chuyện mã hóa đầu cuối'),ui('Available after secure messaging launches','Có khi hệ thống mã hóa được triển khai'))+
    '<hr>'+chatMenuRow('mute','mute',pref.muted?ui('Turn notifications on','Bật thông báo'):ui('Mute notifications','Tắt thông báo'))+chatMenuRow('block','block',pref.blocked?ui('Unblock','Bỏ chặn'):ui('Block','Chặn'))+chatMenuRow('restrict','restrict',pref.restricted?ui('Remove restriction','Bỏ hạn chế'):ui('Restrict','Hạn chế'))+chatMenuRow('read','read',ui('Read receipts','Xác nhận đã đọc'),pref.readReceipts===false?ui('Off','Tắt'):ui('On','Bật'))+
    '<hr>'+chatMenuRow('archive','archive',state.archivedChats.includes(id)?ui('Unarchive chat','Bỏ lưu trữ'):ui('Archive chat','Lưu trữ cuộc trò chuyện'))+chatMenuRow('delete','delete',ui('Delete chat','Xóa cuộc trò chuyện'),'',true)+chatMenuRow('report','report',ui('Report','Báo cáo'),'',true)+
    '<div class="chat-menu-subpanel hidden" id="chatMenuSubpanel"></div></div>';}
  let currentMessages=[];
  function thread(name, context, messages, threadId, allowCalls = false) {
    const seeded=state.clearedChats?.[threadId]?[]:messages.map((message,index)=>({...message,id:message.id||threadId+'-seed-'+index,author:message.author||(message.mine?currentMember:name),createdAt:message.createdAt||new Date(new Date().setHours(9,index,0,0)).toISOString()}));
    const allMessages = state.deletedChats.includes(threadId) ? [] : [...seeded, ...(Array.isArray(state.sentMessages[threadId]) ? state.sentMessages[threadId] : [])];
    currentMessages=allMessages;
    const initials = name.split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase();
    const group = threadId.startsWith('group-');
    const pref=group?{}:chatPref(threadId),displayName=pref.nickname||name,blocked=Boolean(pref.blocked)||isBlocked(name);
    const bubbles = allMessages.length ? allMessages.map(message => chatMessageMarkup(message, initials)).join('') : '<p class="chat-empty">No messages yet. Say hello.</p>';
    const actions = '<div class="chat-actions">' + (allowCalls&&!blocked ? '<button class="chat-action" data-start-call="voice" aria-label="Voice call ' + esc(name) + '" title="Voice call">' + phoneIcon + '<span>Call</span></button><button class="chat-action" data-start-call="video" aria-label="Video call ' + esc(name) + '" title="Video call">' + videoIcon + '<span>Video</span></button>' : '') + '<button class="chat-action chat-close" data-back aria-label="Close conversation" title="Close conversation">×</button></div>';
    const tools = [['photo',imageIcon,'Photo'],['voice',micIcon,'Voice'],['sticker','✦','Stickers'],['gif','GIF','GIF'],['emoji',emojiIcon,'Emoji']].map(([kind,icon,label])=>'<button type="button" class="chat-tool" data-chat-tool="' + kind + '" aria-label="' + label + '" title="' + label + '">' + icon + '<span>' + label + '</span></button>').join('');
    return '<button class="back" data-back>← Back to ' + esc(section === 'groups' ? 'Group chats' : 'Messages') + '</button>' +
      '<div class="chat-heading"><div class="chat-person"><span class="chat-avatar" aria-hidden="true">' + esc(initials) + (group ? '' : '<i class="chat-online-dot"></i>') + '</span><div class="chat-person-copy"><div class="chat-title-line"><h2 class="screen-title" tabindex="-1" id="detailTitle">' + esc(displayName) + '</h2>'+(group?'':'<button type="button" class="chat-menu-toggle" data-chat-menu-toggle aria-label="'+esc(ui('Conversation options','Tùy chọn cuộc trò chuyện'))+'" aria-controls="conversationMenu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>')+'</div><p class="screen-subtitle">' + (group ? 'Group chat' : blocked?esc(ui('Blocked','Đã chặn')):pref.restricted?esc(ui('Restricted','Đã hạn chế')):'<span class="chat-live-status">Active now</span>') + '</p></div></div>' + actions + (group?'':chatMenuMarkup(threadId,name))+'</div>' +
      '<div class="chat-conversation"><div class="chat-message-list"><span class="chat-context">' + esc(context) + '</span>' + bubbles + '</div></div>' +
      '<div class="chat-composer"><div class="chat-tools" role="toolbar" aria-label="Message tools">' + tools + '</div><input id="chatPhotoInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden><div id="chatPicker" class="chat-picker hidden"></div><div id="chatAttachmentPreview" class="chat-attachment-preview hidden"></div><div class="composer"><label class="sr-only" for="messageText">Message</label><textarea id="messageText" class="demo-textarea" rows="1" placeholder="'+esc(blocked?ui('Unblock to send messages','Bỏ chặn để gửi tin nhắn'):ui('Write a message...','Viết tin nhắn...'))+'"'+(blocked?' disabled':'')+'></textarea><button class="primary" data-send-message="' + esc(threadId) + '" aria-label="Send message"'+(blocked?' disabled':'')+'><span>Send</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-5 16-3-7-8-1zM12 13l8-9"/></svg></button><button type="button" class="chat-like" data-chat-like aria-label="Send a quick emoji" title="Send a quick emoji"'+(blocked?' disabled':'')+'>'+esc(pref.quickEmoji||'👍')+'</button></div></div>';
  }
  function openChatMenuPanel(action){
    const panel=$('#chatMenuSubpanel'),pref=chatPref(currentDetail),member=members.find(item=>item.detail===currentDetail || (currentDetail==='chat-mai'&&item.detail==='request'));
    if(!panel)return;
    let html='';
    if(action==='profile')html='<strong>'+esc(ui('Profile','Hồ sơ'))+'</strong><p>'+esc(member?member.name+' · '+member.id+' · '+member.handle:ui('Profile details are unavailable.','Chưa có thông tin hồ sơ.'))+'</p>';
    if(action==='theme')html='<strong>'+esc(ui('Choose a theme','Chọn chủ đề'))+'</strong><div>'+[['default',ui('NEXORA blue','Xanh NEXORA')],['purple',ui('Purple','Tím')],['pink',ui('Pink','Hồng')],['gold',ui('Gold','Vàng')]].map(([value,label])=>'<button type="button" class="chat-menu-choice" data-chat-theme="'+value+'" aria-pressed="'+((pref.theme||'default')===value)+'">'+esc(label)+'</button>').join('')+'</div>';
    if(action==='emoji')html='<strong>'+esc(ui('Quick emoji','Biểu tượng nhanh'))+'</strong><p>'+esc(ui('Choose the one-tap reaction beside the message box.','Chọn biểu tượng gửi nhanh cạnh ô nhắn tin.'))+'</p><div>'+['👍','❤️','😊','👏','✨','🎉'].map(value=>'<button type="button" class="chat-menu-choice" data-chat-quick-emoji="'+value+'" aria-pressed="'+((pref.quickEmoji||'👍')===value)+'">'+value+'</button>').join('')+'</div>';
    if(action==='nickname')html='<label for="chatNicknameDraft">'+esc(ui('Nickname in this conversation','Biệt danh trong cuộc trò chuyện'))+'</label><input id="chatNicknameDraft" class="demo-input" maxlength="35" value="'+esc(pref.nickname||'')+'" placeholder="'+esc(ui('Enter a nickname','Nhập biệt danh'))+'"><div class="inline-actions"><button type="button" class="primary" data-chat-save-nickname>'+esc(ui('Save','Lưu'))+'</button></div>';
    if(action==='read')html='<strong>'+esc(ui('Read receipts','Xác nhận đã đọc'))+'</strong><p>'+esc(ui('Control whether this conversation shows when you read a message.','Chọn hiển thị trạng thái đã đọc cho cuộc trò chuyện này.'))+'</p><div>'+[['on',ui('On','Bật')],['off',ui('Off','Tắt')]].map(([value,label])=>'<button type="button" class="chat-menu-choice" data-chat-receipts="'+value+'" aria-pressed="'+((pref.readReceipts!==false)===(value==='on'))+'">'+esc(label)+'</button>').join('')+'</div>';
    if(action==='encryption')html='<strong>'+esc(ui('End-to-end encrypted chat','Trò chuyện mã hóa đầu cuối'))+'</strong><p>'+esc(ui('Coming soon.','Sắp có.'))+'</p>';
    if(action==='delete')html='<strong class="warning">'+esc(ui('Delete this chat?','Xóa cuộc trò chuyện này?'))+'</strong><p>'+esc(ui('Delete this conversation?','Xóa cuộc trò chuyện này?'))+'</p><div class="inline-actions"><button type="button" class="secondary" data-chat-cancel>'+esc(ui('Cancel','Hủy'))+'</button><button type="button" class="primary" data-chat-confirm-delete>'+esc(ui('Delete chat','Xóa cuộc trò chuyện'))+'</button></div>';
    if(action==='report')html='<label for="chatReportReason">'+esc(ui('Why are you reporting this chat?','Lý do báo cáo cuộc trò chuyện'))+'</label><select id="chatReportReason" class="demo-select"><option value="spam">'+esc(ui('Spam','Tin rác'))+'</option><option value="harassment">'+esc(ui('Harassment','Quấy rối'))+'</option><option value="fraud">'+esc(ui('Scam or fraud','Lừa đảo'))+'</option><option value="other">'+esc(ui('Other','Khác'))+'</option></select><button type="button" class="primary" data-chat-confirm-report>'+esc(ui('Report','Báo cáo'))+'</button>';
    panel.innerHTML=html;panel.classList.toggle('hidden',!html);panel.parentElement.scrollTop=0;
    if(action==='nickname')$('#chatNicknameDraft')?.focus();
  }
  function renderChatAttachment() {
    const panel=$('#chatAttachmentPreview');if(!panel)return;
    if(!pendingChatAttachment){panel.classList.add('hidden');panel.innerHTML='';return;}
    const item=pendingChatAttachment;
    const content=item.type==='image'?'<img src="'+item.src+'" alt="Photo ready to send">':item.type==='audio'?'<audio controls src="'+item.src+'" aria-label="Voice message ready to send"></audio>':item.type==='gif'?'<img src="'+item.src+'" alt="GIF ready to send">':item.type==='sticker'?'<span class="chat-sticker">'+esc(item.sticker)+'</span>':'';
    const label=({image:'Photo ready to send',audio:'Voice message ready to send',gif:'GIF ready to send',sticker:'Sticker ready to send'})[item.type]||'Attachment ready to send';
    panel.innerHTML=content+'<span>'+esc(label)+'</span><button type="button" data-chat-remove-attachment aria-label="Remove attachment">×</button>';
    panel.classList.remove('hidden');
  }
  function appendChatMessage(threadId,message) {
    const bridge=window.NEXORA_COMMUNITY_CONNECT,prepared=bridge?.prepareMessage(threadId,message);if(prepared===false)return false;
    const outgoing={...(prepared||message),mine:true,id:message.id||'message-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),author:currentMember,createdAt:new Date().toISOString()};
    const shared=bridge?.persistMessage(threadId,outgoing);if(shared===false)return false;
    if(shared===undefined){state.deletedChats=state.deletedChats.filter(id=>id!==threadId);if(!Array.isArray(state.sentMessages[threadId]))state.sentMessages[threadId]=[];state.sentMessages[threadId].push(outgoing);if(!save()){toast(ui('Could not save this message.','Không lưu được tin nhắn.'));return false;}}
    bridge?.afterMessage(threadId);
    pendingChatAttachment=null;const field=$('#messageText');if(field)field.value='';chatDrafts.delete(threadId);renderConversationPreviews();if(section==='groups')renderGroups();showDetail(currentDetail);$('#messageText')?.focus();toast(ui('Message sent.','Đã gửi tin nhắn.'));return true;
  }
  function closeChatRecording(discard=true) {
    discardChatRecording=discard;
    if(chatRecordingTimer){clearTimeout(chatRecordingTimer);chatRecordingTimer=null;}
    if(chatRecorder&&chatRecorder.state!=='inactive')chatRecorder.stop();
    else if(chatStream){chatStream.getTracks().forEach(track=>track.stop());chatStream=null;}
  }
  async function toggleChatRecording() {
    if(chatRecorder&&chatRecorder.state==='recording'){closeChatRecording(false);return;}
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){toast(ui('Voice recording is unavailable in this browser.','Trình duyệt này chưa hỗ trợ ghi âm.'));return;}
    try{
      const owner=currentDetail,generation=mediaGeneration;
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(currentDetail!==owner||mediaGeneration!==generation){stream.getTracks().forEach(track=>track.stop());return;}chatStream=stream;
      const preferred=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
      const chunks=[],recordingStream=chatStream;discardChatRecording=false;chatRecorder=new MediaRecorder(recordingStream,preferred?{mimeType:preferred}:undefined);const recording=chatRecorder;
      chatRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      chatRecorder.onstop=async()=>{const skip=discardChatRecording||currentDetail!==owner||mediaGeneration!==generation;recordingStream.getTracks().forEach(track=>track.stop());if(chatRecorder===recording){chatStream=null;chatRecorder=null;$('#detailPanel [data-chat-tool="voice"]')?.classList.remove('recording');}if(skip)return;const blob=new Blob(chunks,{type:chunks[0]?.type||preferred||'audio/webm'});if(!blob.size||blob.size>700000){toast(ui('Keep voice messages under 700 KB.','Tin thoại cần dưới 700 KB.'));return;}const reader=new FileReader();reader.onload=()=>{if(currentDetail!==owner||mediaGeneration!==generation)return;pendingChatAttachment={type:'audio',src:String(reader.result)};renderChatAttachment();toast(ui('Voice message ready. Tap Send.','Tin thoại đã sẵn sàng. Bấm Gửi.'));};reader.readAsDataURL(blob);};
      chatRecorder.start();$('#detailPanel [data-chat-tool="voice"]')?.classList.add('recording');toast(ui('Recording… Tap Voice again to stop.','Đang ghi âm… Bấm Tin thoại lần nữa để dừng.'));
      chatRecordingTimer=setTimeout(()=>closeChatRecording(false),30000);
    }catch{chatStream?.getTracks().forEach(track=>track.stop());chatStream=null;toast(ui('Microphone permission was not granted.','Chưa được cấp quyền dùng micro.'));}
  }
  function showDetail(kind, defaultPreview = false) {
    if(currentDetail)rememberChatDraft();
    if(currentDetail&&currentDetail!==kind){mediaGeneration++;closeChatRecording();pendingChatAttachment=null;}
    $('#memberQuery').value = '';
    renderMemberResults();
    currentDetail = kind;
    let html = '';
    if (kind === 'blocked') {
      html = detailShell('Blocked accounts', 'People you block appear here.',
        '<div class="surface"><p>' + (blockedNames().length?blockedNames().map(esc).join(', '):'No blocked accounts.') + '</p></div>');
    } else if (kind === 'nickname') {
      html = detailShell('Edit nickname', 'Your nickname is used to find and share your profile.',
        '<div class="surface"><div class="form-line"><label for="nicknameDraft">Nickname</label><input id="nicknameDraft" class="demo-input" value="@bitcoin.nail.bar"></div><button class="primary" data-preview-nickname>Save</button><p id="nicknameResult" class="muted-note"></p></div>');
    } else if (kind === 'request' && state.request === 'pending') {
      html = detailShell('Mai Nguyễn', 'Message request · White waiting chairs',
        '<div class="surface"><div class="thread-bubble">Hi, are the white chairs still available? Could I see their condition and the price for six?</div><div class="inline-actions"><button class="primary" data-request-action="accepted">Accept & reply</button><button class="secondary" data-request-action="ignored">Ignore</button><button class="secondary" data-request-action="blocked">Block</button></div></div>');
    } else if (kind === 'request' && state.request === 'accepted') {
      html = thread('Mai Nguyễn','About your 12 white waiting chairs',[{text:'Hi, are the white chairs still available? Could I see their condition and the price for six?'}],'chat-mai',true);
    } else if (kind === 'request' && state.request === 'ignored') {
      html = detailShell('Mai Nguyễn', 'Message request ignored', '<div class="surface"><p>This request was ignored.</p></div>');
    } else if (kind === 'request' && state.request === 'blocked') {
      html = detailShell('Mai Nguyễn', 'Account blocked', '<div class="surface"><p>Mai Nguyễn is blocked. You can review the blocked list under Settings.</p></div>');
    } else if (kind === 'chat-mai') {
      html = thread('Mai Nguyễn','About your 12 white waiting chairs',[{text:'Hi, are the white chairs still available? Could I see their condition and the price for six?'}],'chat-mai',true);
    } else if (kind === 'chat-kim') {
      html = thread('Kim Tuyen','Support shift at BITCOIN NAIL BAR',[{text:'Hi, does the salon still need someone for gel manicures this weekend?'},{text:'Yes, we need help from 9 AM to 6 PM, with a lunch break. Do you do Gel-X?',mine:true},{text:'Yes, I do. I will send you some of my recent work.'},{text:'Please send a few examples and your available dates. I will confirm the schedule this afternoon.',mine:true}],'chat-kim',true);
    } else if (kind === 'chat-sally') {
      html = thread('Sally Thanh Hoang','Gel-X design and appointment',[{text:'Could you send me a photo of the milky pink Gel-X design the salon just posted?'},{text:'Sure, that design has a little shimmer and gems on two nails. Would you like medium or long nails?',mine:true},{text:'I would like medium nails so typing stays comfortable. Do you have any openings on Friday afternoon?'}],'chat-sally',true);
    } else if (state.sourceChats[kind]) {
      const source = state.sourceChats[kind];
      const messages=window.NEXORA_COMMUNITY_DEMO?.connect?.chats?.find(chat=>chat.id===kind)?.messages||[];
      html = thread(source.recipient, source.reference, messages, kind, true);
    } else if (kind.startsWith('group-')&&window.NEXORA_COMMUNITY_CONNECT) {
      const room=window.NEXORA_COMMUNITY_CONNECT.resolveThread(kind);
      if(!room){currentMessages=[];pendingChatAttachment=null;mediaGeneration++;closeChatRecording();const panel=$('#detailPanel');panel.replaceChildren();panel.classList.add('hidden');currentDetail='';showSection('groups');return false;}
      html=thread(room.name,room.context||'Group chat',room.messages||[],kind,Boolean(room.allowCalls));
    } else if (kind.startsWith('group-')) {
      const names = {'group-houston':'Houston Nail Technicians','group-art':'Learn Gel-X & Nail Art','group-new':'New Nail Technicians'};
      const custom = state.createdGroups.find(group => group.id === kind);
      const joined = communities.find(group => 'group-community-' + group.id === kind && state.joinedCommunities.includes(group.id));
      if (!names[kind] && !custom && !joined) return;
      const messages = kind === 'group-new' || custom || joined ? [] : [{text:kind === 'group-houston' ? 'We are replacing our salon furniture and have 12 white waiting chairs. Let me know if you need the dimensions.' : 'I am practicing fine-line floral designs on nail tips. Would anyone in Houston like to join the next practice session?'},{text:kind === 'group-houston' ? 'I need six chairs for the waiting area. Could you send the price per chair and the pickup location?' : 'I would like to join. I will bring a liner brush and sample tips. What other colors should I prepare?'}];
      html = thread(names[kind] || custom?.name || joined.name, 'Group chat', messages, kind);
    } else if (kind.startsWith('call-')) {
      const call = calls.find(item => item.id === kind && !state.deletedCalls.includes(item.id));
      if (!call) return;
      html = detailShell(call.name, '', '<div class="surface"><h2>' + esc(call.summary) + '</h2><div class="inline-actions"><button class="chat-action" data-start-call="voice" data-call-name="' + esc(call.name) + '">' + phoneIcon + 'Voice call</button><button class="chat-action" data-start-call="video" data-call-name="' + esc(call.name) + '">' + videoIcon + 'Video call</button></div></div>');
    }
    if (!html) return;
    if (section === 'privacy') for (const name of ['messages','calls','privacy']) $('#' + name + 'Panel').classList.add('hidden');
    const panel = $('#detailPanel');
    panel.innerHTML = html;
    const draft=chatDrafts.get(kind);
    if(draft){const input=panel.querySelector('#messageText');if(input)input.value=draft.text;pendingChatAttachment=draft.attachment;}
    panel.classList.toggle('chat-detail', kind.startsWith('chat-') || kind.startsWith('group-') || (kind === 'request' && state.request === 'accepted'));
    panel.dataset.chatTheme=chatPref(kind).theme||'default';
    renderChatAttachment();
    requestAnimationFrame(()=>{const list=panel.querySelector('.chat-message-list');if(list)list.scrollTop=list.scrollHeight;});
    panel.classList.remove('hidden');
    if (window.parent !== window) window.parent.postMessage({type:'nexora-connect-detail',open:true}, parentMessageOrigin);
    $('#connectStage').classList.add('detail-open');
    $('#connectStage').classList.toggle('default-preview', defaultPreview);
    document.querySelectorAll('.row-button.is-selected').forEach(button => button.classList.remove('is-selected'));
    document.querySelector('[data-detail="' + kind + '"]')?.classList.add('is-selected');
    if (!defaultPreview) {
      $('#detailTitle').focus();
      window.scrollTo({top:0,behavior:'instant'});
    }
    changed();
  }
  function renderMessages() {
    let sourceList = $('#communitySourceChats');
    if (!sourceList) { sourceList = document.createElement('div'); sourceList.id = 'communitySourceChats'; $('#directPanel .surface:nth-child(2)').append(sourceList); }
    sourceList.innerHTML = Object.entries(state.sourceChats).filter(([id])=>!state.archivedChats.includes(id)&&!state.deletedChats.includes(id)).map(([id,source])=>'<button class="row-button" data-detail="'+esc(id)+'" data-initials="'+esc(initials(source.recipient))+'"><span><strong>'+esc(chatPref(id).nickname||source.recipient)+'</strong><small>'+esc(source.reference)+'</small></span><span class="arrow">›</span></button>').join('');
    $('#requestCount').textContent = state.request === 'pending' ? '1' : '0';
    $('#requestRow').innerHTML = state.request === 'pending'
      ? '<button class="row-button" data-detail="request" data-initials="MN"><span><strong>Mai Nguyễn</strong><small>Are the white chairs still available?</small></span><span class="arrow">View ›</span></button>'
      : '<p>No new requests.</p>';
    let accepted = $('#acceptedRow');
    if (!accepted) {
      accepted = document.createElement('div');
      accepted.id = 'acceptedRow';
      $('#directPanel .surface:nth-child(2)').append(accepted);
    }
    accepted.innerHTML = state.request === 'accepted' && !state.archivedChats.includes('chat-mai') && !state.deletedChats.includes('chat-mai') ? '<button class="row-button" data-detail="chat-mai" data-initials="MN"><span><strong>Mai Nguyễn</strong><small>About your 12 white waiting chairs</small></span><span class="arrow">›</span></button>' : '';
    for(const id of ['chat-kim','chat-sally']){const row=document.querySelector('#directPanel .surface:nth-child(2) [data-detail="'+id+'"]');if(row){row.style.display=state.archivedChats.includes(id)||state.deletedChats.includes(id)?'none':'';row.querySelector('strong').textContent=chatPref(id).nickname||members.find(member=>member.detail===id)?.name||'';}}
    $('#recentChatsEmpty').classList.toggle('hidden',['chat-kim','chat-sally','chat-mai',...Object.keys(state.sourceChats)].some(id=>!state.archivedChats.includes(id)&&!state.deletedChats.includes(id)&&(id!=='chat-mai'||state.request==='accepted')));
    const archived=state.archivedChats.filter(id=>!state.deletedChats.includes(id));
    $('#archivedChatsCard').classList.toggle('hidden',archived.length===0);
    $('#archivedChatRows').innerHTML=archived.map(id=>{const person=members.find(member=>member.detail===id||(id==='chat-mai'&&member.detail==='request'))||(state.sourceChats[id]?{name:state.sourceChats[id].recipient}:null);if(!person)return '';return '<button class="row-button" data-detail="'+esc(id)+'" data-initials="'+esc(initials(person.name))+'"><span><strong>'+esc(chatPref(id).nickname||person.name)+'</strong><small>'+esc(ui('Archived · tap to open','Đã lưu trữ · bấm để mở'))+'</small></span><span class="arrow">›</span></button>';}).join('');
    renderConversationPreviews();
    renderConnections();changed();
  }
  function renderConnections() {
    const card = $('#connectionsCard');
    const connected = members.filter(member => state.connections.includes(member.id));
    card.classList.toggle('hidden', connected.length === 0);
    $('#connectionCount').textContent = String(connected.length);
    $('#connectionRows').innerHTML = connected.map(member => {
      const initials = member.name.split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase();
      const detail = member.detail === 'request' && state.request === 'accepted' ? 'chat-mai' : member.detail;
      return '<button class="row-button" data-detail="' + detail + '" data-initials="' + esc(initials) + '"><span><strong>' + esc(member.name) + '</strong><small>' + esc(member.handle) + ' · ' + esc(member.id) + '</small></span><span class="arrow">›</span></button>';
    }).join('');
  }
  const conversationSamples={'chat-kim':'Please send a few examples and your available dates. I will confirm the schedule this afternoon.','chat-sally':'I would like medium nails so typing stays comfortable. Do you have any openings on Friday afternoon?','group-houston':'Could you send the price per chair and the pickup location?','group-art':'I will bring a liner brush and sample tips. What other colors should I prepare?',...Object.fromEntries((window.NEXORA_COMMUNITY_DEMO?.connect?.chats||[]).map(chat=>[chat.id,chat.messages.at(-1)?.text||'']))};
  function renderConversationPreviews() {
    for (const id of ['chat-kim','chat-sally','group-houston','group-art','group-new','chat-mai',...Object.keys(state.sourceChats)]) {
      const messages = state.sentMessages[id];
      const preview = document.querySelector('[data-detail="' + id + '"] small');
      if (preview && Array.isArray(messages) && messages.length) preview.textContent = chatPreviewText(messages[messages.length - 1]);
      else if(preview&&conversationSamples[id])preview.textContent=conversationSamples[id];
    }
  }
  function chatPreviewText(message){const label=message.text||({image:ui('Photo','Ảnh'),audio:ui('Voice message','Tin thoại'),sticker:ui('Sticker','Nhãn dán'),gif:'GIF'}[message.type]||ui('Message','Tin nhắn'));return label+ui(' · Just now',' · Vừa xong');}
  function renderGroups() {
    const groupRows = [...state.createdGroups, ...communities.filter(group => state.joinedCommunities.includes(group.id)).map(group => ({...group,id:'group-community-' + group.id}))];
    $('#customGroups').innerHTML = groupRows.map(group => {
      const messages = state.sentMessages[group.id];
      const preview = Array.isArray(messages) && messages.length ? chatPreviewText(messages[messages.length - 1]) : 'No messages yet';
      const initials = group.name.split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase();
      return '<button class="row-button" data-detail="' + esc(group.id) + '" data-initials="' + esc(initials) + '"><span><strong>' + esc(group.name) + '</strong><small>' + esc(preview) + '</small></span><span class="arrow">›</span></button>';
    }).join('');
    document.querySelectorAll('[data-community-filter]').forEach(button => button.classList.toggle('active', button.dataset.communityFilter === communityFilter));
    $('#discoveryGroups').innerHTML = communities.filter(group => communityFilter === 'all' || group.type === communityFilter).map(group => {
      const joined = state.joinedCommunities.includes(group.id);
      return '<div class="discovery-row"><span><strong>' + esc(group.name) + '</strong><small>' + esc(group.detail) + '</small></span><button class="secondary" data-join-community="' + group.id + '"' + (joined ? ' disabled' : '') + '>' + (joined ? 'Joined' : 'Join') + '</button></div>';
    }).join('');changed();
  }
  function renderCalls() {
    document.querySelectorAll('[data-call-filter]').forEach(button => button.classList.toggle('active', button.dataset.callFilter === callFilter));
    const filtered = calls.filter(call => !state.deletedCalls.includes(call.id) && (callFilter === 'all' || (callFilter === 'missed' ? call.type.startsWith('missed-') : call.type === callFilter)));
    $('#callRows').innerHTML = filtered.length
      ? filtered.map(call => {
          const initials = call.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
          const missed = call.type.startsWith('missed-');
          return '<div class="call-item" data-call-id="' + call.id + '"><div class="call-front"><button class="call-main" data-detail="' + call.id + '" aria-label="View call details for ' + esc(call.name) + '"><span class="call-avatar" aria-hidden="true">' + esc(initials) + '</span><span class="call-text"><strong' + (missed ? ' class="missed"' : '') + '>' + esc(call.name) + '</strong><small>' + esc(call.summary) + '</small></span></button><div class="call-actions"><button class="call-icon-button" data-start-call="voice" data-call-name="' + esc(call.name) + '" aria-label="Voice call ' + esc(call.name) + '" title="Voice call">' + phoneIcon + '</button><button class="call-icon-button" data-start-call="video" data-call-name="' + esc(call.name) + '" aria-label="Video call ' + esc(call.name) + '" title="Video call">' + videoIcon + '</button></div><button class="call-more" data-reveal-call="' + call.id + '" aria-label="Show delete for call with ' + esc(call.name) + '">⋯</button></div><button class="call-delete" data-delete-call="' + call.id + '" aria-label="Delete call with ' + esc(call.name) + ', ' + esc(call.summary) + '">Delete</button></div>';
        }).join('')
      : '<p class="muted-note">No calls in this view.</p>';
    for(const button of document.querySelectorAll('#callRows [data-start-call]'))if(isBlocked(button.dataset.callName))button.disabled=true;changed();
  }
  function renderMemberResults() {
    const query = $('#memberQuery').value.trim();
    const active = document.activeElement === $('#memberQuery');
    $('#memberResults').classList.toggle('hidden', !query && !active);
    if (!query) {
      $('#memberResults').innerHTML = '<div class="search-results-head"><strong>Find & add people</strong><span>Search by name, @nickname, NEXORA ID or full phone number.</span></div>';
      return;
    }
    const phoneLike = /^[+()\d\s.-]+$/.test(query);
    const digits = query.replace(/\D/g,'');
    const phone = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
    const fullPhone = phoneLike && phone.length === 10;
    const found = phoneLike
      ? fullPhone ? members.filter(member => member.phone === phone) : []
      : members.filter(member => [member.name,member.id,member.handle,member.email || ''].join(' ').toLowerCase().includes(query.toLowerCase()));
    const title = '<div class="search-results-head"><strong>' + (found.length ? 'People on NEXORA' : 'Find & add people') + '</strong><span>' + (phoneLike ? 'Phone search uses the complete number.' : 'Choose Add to save someone to your connections.') + '</span></div>';
    if (phoneLike && !fullPhone) {
      $('#memberResults').innerHTML = title + '<div class="search-empty">Enter a complete 10-digit US phone number to search.</div>';
      return;
    }
    if (found.length) {
      $('#memberResults').innerHTML = title + found.map(member => {
        const initials = member.name.split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase();
        const added = state.connections.includes(member.id);
        const detail = member.detail === 'request' && state.request === 'accepted' ? 'chat-mai' : member.detail;
        return '<div class="member-hit"><span class="member-hit-avatar" aria-hidden="true">' + esc(initials) + '</span><div class="member-hit-copy"><strong>' + esc(member.name) + '</strong><small>' + esc(member.handle) + ' · ' + esc(member.id) + '</small></div><div class="member-hit-actions"><button type="button" class="member-add' + (added ? ' is-added' : '') + '" data-add-member="' + esc(member.id) + '" aria-label="' + (added ? 'Already added ' : 'Add ') + esc(member.name) + ' to Connections"' + (added ? ' disabled' : '') + '>' + (added ? '✓ Added' : '+ Add') + '</button><button type="button" class="member-view" data-detail="' + detail + '" aria-label="' + (detail === 'request' ? 'View message request from ' : 'Chat with ') + esc(member.name) + '">' + (detail === 'request' ? 'View' : 'Chat') + '</button></div></div>';
      }).join('');
      return;
    }
    const sms = fullPhone ? '<a href="sms:+1' + phone + '?body=' + encodeURIComponent('Join me on NEXORA: ' + inviteUrl) + '">Invite by SMS</a>' : '';
    $('#memberResults').innerHTML = title + '<div class="search-empty"><strong>No matching profile found</strong><p>This person may not be on NEXORA, or may have phone search turned off. You can invite them instead.</p><div class="search-invite-actions">' + sms + '<button type="button" data-share-invite>Share link</button><button type="button" data-copy-invite>Copy link</button></div></div>';
  }
  async function copy(value, success) {
    try { await navigator.clipboard.writeText(value); toast(success); }
    catch { toast('Copy is unavailable in this browser.'); }
  }
  document.addEventListener('click', async event => {
    const openMenu=$('#conversationMenu');if(openMenu&&!event.target.closest('#conversationMenu,[data-chat-menu-toggle]')){openMenu.classList.add('hidden');$('#detailPanel [data-chat-menu-toggle]')?.setAttribute('aria-expanded','false');}
    const target = event.target.closest('button');
    if (!target) return;
    if(target.dataset.chatMenuToggle!==undefined){const menu=$('#conversationMenu'),opening=menu?.classList.contains('hidden');menu?.classList.toggle('hidden',!opening);target.setAttribute('aria-expanded',String(Boolean(opening)));if(opening)menu?.querySelector('button')?.focus();return;}
    if(target.dataset.chatMenuAction){const action=target.dataset.chatMenuAction,id=currentDetail,pref=chatPref(id);if(action==='inbox'){showSection('messages');return;}if(action==='group'){showSection('groups');$('#createGroupBtn')?.click();return;}if(action==='mute'||action==='block'||action==='restrict'){const field={mute:'muted',block:'blocked',restrict:'restricted'}[action];pref[field]=!pref[field];if(!save()){pref[field]=!pref[field];toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}showDetail(id);toast(pref[field]?ui('Updated.','Đã cập nhật.'):ui('Setting turned off.','Đã tắt cài đặt.'));return;}if(action==='archive'){const wasArchived=state.archivedChats.includes(id);state.archivedChats=wasArchived?state.archivedChats.filter(item=>item!==id):[...state.archivedChats,id];if(!save()){state.archivedChats=wasArchived?[...state.archivedChats,id]:state.archivedChats.filter(item=>item!==id);toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}showSection('messages');toast(wasArchived?ui('Chat returned to Recent.','Đã đưa cuộc trò chuyện về Tin gần đây.'):ui('Chat moved to Archived.','Đã chuyển cuộc trò chuyện vào Lưu trữ.'));return;}openChatMenuPanel(action);return;}
    if(target.dataset.chatTheme){const id=currentDetail,pref=chatPref(id),old=pref.theme;pref.theme=target.dataset.chatTheme;if(save()){showDetail(id);toast(ui('Theme changed.','Đã đổi chủ đề.'));}else{pref.theme=old;toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));}return;}
    if(target.dataset.chatQuickEmoji){const id=currentDetail,pref=chatPref(id),old=pref.quickEmoji;pref.quickEmoji=target.dataset.chatQuickEmoji;if(save()){showDetail(id);toast(ui('Quick emoji changed.','Đã đổi biểu tượng nhanh.'));}else{pref.quickEmoji=old;toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));}return;}
    if(target.dataset.chatReceipts){const id=currentDetail,pref=chatPref(id),old=pref.readReceipts;pref.readReceipts=target.dataset.chatReceipts==='on';if(save()){showDetail(id);toast(ui('Read receipt preference saved.','Đã lưu lựa chọn xác nhận đã đọc.'));}else{pref.readReceipts=old;toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));}return;}
    if(target.dataset.chatSaveNickname!==undefined){const id=currentDetail,value=$('#chatNicknameDraft')?.value.trim()||'',pref=chatPref(id),old=pref.nickname;pref.nickname=value;if(save()){showDetail(id);toast(ui('Nickname saved.','Đã lưu biệt danh.'));}else{pref.nickname=old;toast(ui('Could not save this nickname.','Không lưu được biệt danh.'));}return;}
    if(target.dataset.chatCancel!==undefined){$('#chatMenuSubpanel')?.classList.add('hidden');return;}
    if(target.dataset.chatConfirmDelete!==undefined){const id=currentDetail,oldDeleted=state.deletedChats,oldArchived=state.archivedChats,oldMessages=state.sentMessages[id];state.deletedChats=[...new Set([...state.deletedChats,id])];state.clearedChats={...(state.clearedChats||{}),[id]:true};chatDrafts.delete(id);state.archivedChats=state.archivedChats.filter(item=>item!==id);delete state.sentMessages[id];if(save()){showSection('messages');toast(ui('Chat deleted.','Đã xóa cuộc trò chuyện.'));}else{state.deletedChats=oldDeleted;state.archivedChats=oldArchived;if(oldMessages)state.sentMessages[id]=oldMessages;toast(ui('Could not delete this chat.','Không xóa được cuộc trò chuyện.'));}return;}
    if(target.dataset.chatConfirmReport!==undefined){const id=currentDetail,reason=$('#chatReportReason')?.value||'other';state.reportedChats.push({id,reason,at:new Date().toISOString()});if(save()){showDetail(id);toast(ui('Report recorded locally. Nothing was sent.','Báo cáo đã lưu trên máy; chưa gửi đi.'));}else{state.reportedChats.pop();toast(ui('Could not save the report.','Không lưu được báo cáo.'));}return;}
    if (target.dataset.chatTool) {
      const kind=target.dataset.chatTool,picker=$('#chatPicker');
      if(kind==='photo'){$('#chatPhotoInput')?.click();return;}
      if(kind==='voice'){await toggleChatRecording();return;}
      if(!picker)return;
      if(!picker.classList.contains('hidden')&&picker.dataset.kind===kind){picker.classList.add('hidden');return;}
      picker.dataset.kind=kind;
      if(kind==='gif')picker.innerHTML='<strong>Choose a GIF</strong><div class="chat-picker-grid">'+chatGifFiles.map((file,index)=>'<button type="button" data-chat-choice="gif" data-chat-value="'+file+'"><img src="'+file+'" alt="'+(index?'Thank you GIF':'Hello GIF')+'"></button>').join('')+'</div>';
      else if(kind==='sticker')picker.innerHTML='<strong>Choose a sticker</strong><div class="chat-picker-grid">'+['👏','💜','✨','👍','🎉','😊'].map(value=>'<button type="button" class="chat-picker-sticker" data-chat-choice="sticker" data-chat-value="'+value+'" aria-label="Sticker '+value+'">'+value+'</button>').join('')+'</div>';
      else picker.innerHTML='<strong>Choose an emoji</strong><div class="chat-picker-grid">'+['😊','😂','👍','❤️','👏','🎉','🙏','✨'].map(value=>'<button type="button" class="chat-picker-sticker" data-chat-choice="emoji" data-chat-value="'+value+'" aria-label="Emoji '+value+'">'+value+'</button>').join('')+'</div>';
      picker.classList.remove('hidden');return;
    }
    if(target.dataset.chatChoice){
      const kind=target.dataset.chatChoice,value=target.dataset.chatValue;
      if(kind==='gif'&&!chatGifFiles.includes(value))return;
      if(['sticker','emoji'].includes(kind)&&!['👏','💜','✨','👍','🎉','😊','😂','❤️','🙏'].includes(value))return;
      if(kind==='emoji'){$('#messageText').value+=value;$('#messageText').focus();}
      else{pendingChatAttachment=kind==='gif'?{type:'gif',src:value}:{type:'sticker',sticker:value};renderChatAttachment();}
      $('#chatPicker')?.classList.add('hidden');return;
    }
    if(target.dataset.chatRemoveAttachment!==undefined){pendingChatAttachment=null;renderChatAttachment();return;}
    if(target.dataset.chatLike!==undefined){const id=$('#detailPanel [data-send-message]')?.dataset.sendMessage,emoji=chatPref(id).quickEmoji||'👍',field=$('#messageText');if(!id||chatPref(id).blocked)return;if(field?.value.trim()||pendingChatAttachment){field.value+=emoji;field.focus();return;}appendChatMessage(id,{type:'sticker',sticker:emoji});return;}
    if (target.dataset.detail?.startsWith('call-') && Date.now() < suppressCallClickUntil) { event.preventDefault(); return; }
    if (target.id === 'toastUndo') {
      const callToRestore = lastDeletedCall || state.deletedCalls[state.deletedCalls.length - 1];
      if (callToRestore) {
        state.deletedCalls = state.deletedCalls.filter(id => id !== callToRestore);
        lastDeletedCall = null;
        if(!save()){toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}
        renderCalls();
        toast('Call restored.');
      }
      return;
    }
    if (target.dataset.deleteCall) {
      const id = target.dataset.deleteCall;
      if (!state.deletedCalls.includes(id)) state.deletedCalls.push(id);
      lastDeletedCall = id;
      if(!save()){toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}
      renderCalls();
      if (currentDetail === id) {
        showSection('calls');
      }
      toast('Call removed from Recent.', true);
      return;
    }
    if (target.dataset.revealCall) {
      const row = target.closest('.call-item');
      document.querySelectorAll('.call-item.revealed').forEach(item => { if (item !== row) item.classList.remove('revealed'); });
      row.classList.toggle('revealed');
      return;
    }
    if (target.id === 'tourStartBtn') { startTour(); return; }
    if (target.id === 'tourPauseBtn') { tourPaused = !tourPaused; target.textContent = tourPaused ? 'Resume' : 'Pause'; scheduleTourAdvance(); return; }
    if (target.id === 'tourNextBtn') {
      if (tourIndex === tourSteps.length - 1) finishTour(true);
      else { tourIndex += 1; renderTourStep(); }
      return;
    }
    if (target.id === 'tourSkipBtn') { finishTour(true); return; }
    if (target.id === 'newMessageBtn') { if (tourActive) finishTour(false); showSection('messages'); $('#memberQuery').focus(); return; }
    if (target.dataset.addMember) {
      const member = members.find(item => item.id === target.dataset.addMember);
      if (!member || state.connections.includes(member.id)) return;
      state.connections.push(member.id);
      if(!save()){toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}
      renderConnections();
      $('#memberQuery').value = '';
      $('#memberQuery').blur();
      renderMemberResults();
      toast(member.name + ' added to Connections.');
      return;
    }
    if (target.dataset.section) { if (tourActive) finishTour(false); showSection(target.dataset.section); return; }
    if (target.dataset.back !== undefined) { showSection(section); return; }
    if (target.dataset.detail) { showDetail(target.dataset.detail); return; }
    if (target.dataset.callFilter) {
      callFilter = target.dataset.callFilter;
      renderCalls();
      $('#detailPanel').classList.add('hidden');
      $('#connectStage').classList.remove('detail-open', 'default-preview');
      return;
    }
    if (target.dataset.communityFilter) { communityFilter = target.dataset.communityFilter; renderGroups(); return; }
    if (target.dataset.joinCommunity) {
      const id = target.dataset.joinCommunity;
      if (!state.joinedCommunities.includes(id)) state.joinedCommunities.push(id);
      if(!save()){toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}
      renderGroups();
      toast('Joined.');
      return;
    }
    if (target.id === 'createGroupBtn') {
      $('#groupName').value = '';
      $('#confirmCreateGroup').disabled = true;
      $('#createGroupDialog').classList.remove('hidden');
      $('#groupName').focus();
      return;
    }
    if (target.id === 'cancelCreateGroup') {
      $('#createGroupDialog').classList.add('hidden');
      $('#createGroupBtn').focus();
      return;
    }
    if (target.id === 'confirmCreateGroup') {
      const name = $('#groupName').value.trim();
      if (!name) return;
      const id = 'group-custom-' + Date.now().toString(36);
      state.createdGroups.unshift({id,name});
      if(!save()){toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}
      renderGroups();
      $('#createGroupDialog').classList.add('hidden');
      showDetail(id);
      toast('Group created.');
      return;
    }
    if (target.dataset.startCall) {
      const name = target.dataset.callName || $('#detailTitle')?.textContent || 'this member';if(isBlocked(name)){toast(ui('Blocked','Đã chặn'));return;}
      $('#callPreviewTitle').textContent = target.dataset.startCall === 'video' ? 'Video call · ' + name : 'Voice call · ' + name;
      $('#callPreviewText').textContent = ui('Calling…','Đang gọi…');
      $('#callPreview').classList.remove('hidden');
      $('#closeCallPreview').focus();
      return;
    }
    if (target.id === 'closeCallPreview') { $('#callPreview').classList.add('hidden'); return; }
    if (target.id === 'editBtn') { showDetail('nickname'); return; }
    if (target.id === 'copyBtn') { await copy(profileUrl,'Profile link copied.'); return; }
    if (target.id === 'shareBtn') {
      if (navigator.share) { try { await navigator.share({title:'BITCOIN NAIL BAR on NEXORA',url:profileUrl}); } catch {} }
      else await copy(profileUrl,'Profile link copied.');
      return;
    }
    if (target.dataset.requestAction) {
      state.request = target.dataset.requestAction;
      if(!save()){toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}
      renderMessages();
      renderMemberResults();
      renderSummaries();
      if (state.request === 'accepted') showDetail('chat-mai');
      else showSection('messages');
      return;
    }
    if (target.dataset.sendMessage) {
      if(chatRecorder?.state==='recording'){toast(ui('Stop recording before sending.','Dừng ghi âm trước khi gửi.'));return;}
      const value = $('#messageText').value.trim();
      if (!value&&!pendingChatAttachment) { toast(ui('Write a message first.','Viết tin nhắn trước khi gửi.')); $('#messageText').focus(); return; }
      const id = target.dataset.sendMessage;
      appendChatMessage(id,{text:value,...(pendingChatAttachment||{})});
      return;
    }
    if (target.dataset.shareInvite !== undefined) {
      if (navigator.share) { try { await navigator.share({title:'Join NEXORA',url:inviteUrl}); } catch {} }
      else await copy(inviteUrl,'Invitation link copied.');
      return;
    }
    if (target.dataset.copyInvite !== undefined) { await copy(inviteUrl,'Invitation link copied.'); return; }
    if (target.dataset.previewNickname !== undefined) {
      const value = $('#nicknameDraft').value.trim();
      $('#nicknameResult').textContent = value || 'Enter a nickname first.';
    }
  });
  $('#callRows').addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('.call-delete')) return;
    const row = event.target.closest('.call-item');
    if (row) swipeStart = {id:row.dataset.callId, x:event.clientX, y:event.clientY};
  });
  $('#callRows').addEventListener('pointerup', event => {
    if (!swipeStart || event.pointerType !== 'touch') return;
    const row = event.target.closest('.call-item');
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    if (row?.dataset.callId === swipeStart.id && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      document.querySelectorAll('.call-item.revealed').forEach(item => item.classList.remove('revealed'));
      if (dx < 0) row.classList.add('revealed');
      suppressCallClickUntil = Date.now() + 350;
    }
    swipeStart = null;
  });
  $('#callRows').addEventListener('pointercancel', () => { swipeStart = null; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && tourActive) { finishTour(true); return; }
    if (event.key === 'Escape' && $('#conversationMenu') && !$('#conversationMenu').classList.contains('hidden')) {$('#conversationMenu').classList.add('hidden');$('#detailPanel [data-chat-menu-toggle]')?.setAttribute('aria-expanded','false');$('#detailPanel [data-chat-menu-toggle]')?.focus();return;}
    if (event.key === 'Escape' && !$('#callPreview').classList.contains('hidden')) $('#callPreview').classList.add('hidden');
    if (event.key === 'Escape' && !$('#createGroupDialog').classList.contains('hidden')) $('#createGroupDialog').classList.add('hidden');
    if (event.key === 'Escape' && document.activeElement?.id === 'memberQuery') {
      $('#memberQuery').value = '';
      renderMemberResults();
      $('#memberQuery').blur();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && document.activeElement?.id === 'messageText') {
      $('#detailPanel [data-send-message]')?.click();
    }
  });
  $('#memberQuery').addEventListener('input', renderMemberResults);
  $('#backToCommunityBtn').addEventListener('click',()=>{if(window.parent!==window)window.parent.postMessage({type:'nexora-connect-back-community'},parentMessageOrigin);else location.href='nexora-community-complete.html?view=feed';});
  $('#groupName').addEventListener('input', () => { $('#confirmCreateGroup').disabled = !$('#groupName').value.trim(); });
  document.addEventListener('change', event => {
    if(event.target.id==='chatPhotoInput'){
      const file=event.target.files?.[0];if(!file)return;
      if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>700000){toast(ui('Choose a PNG, JPG, WebP or GIF under 700 KB.','Chọn ảnh PNG, JPG, WebP hoặc GIF dưới 700 KB.'));event.target.value='';return;}
      const owner=currentDetail,generation=mediaGeneration;const reader=new FileReader();reader.onload=()=>{if(currentDetail!==owner||mediaGeneration!==generation)return;pendingChatAttachment={type:'image',src:String(reader.result)};renderChatAttachment();$('#messageText')?.focus();};reader.onerror=()=>toast(ui('Could not read this photo.','Không đọc được ảnh này.'));reader.readAsDataURL(file);event.target.value='';return;
    }
    const setting = event.target.dataset.quickSetting;
    if (!setting || !['phone','email','messages','calls'].includes(setting)) return;
    state[setting] = event.target.value;
    if(!save()){renderSummaries();toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));}
  });
  $('#inviteSmsBtn').href = 'sms:?body=' + encodeURIComponent('Join me on NEXORA: ' + inviteUrl);
  $('#memberQuery').addEventListener('focus', renderMemberResults);
  const setSearchPlaceholder = () => {
    const short = window.matchMedia('(max-width:680px)').matches;
    const english = localStorage.getItem('nexora-community-language') !== 'vi';
    $('#memberQuery').placeholder = english
      ? (short ? 'Find people to add' : 'Find people to add — name, @nickname, NX-ID, phone')
      : (short ? 'Tìm người để thêm' : 'Tìm người để thêm — tên, @nickname, NX-ID, số điện thoại');
  };
  window.addEventListener('resize', setSearchPlaceholder);
  setSearchPlaceholder();
  document.addEventListener('click', event => {
    if (!event.target.closest('.global-search') && event.target.id !== 'newMessageBtn') $('#memberResults').classList.add('hidden');
  });
  $('#tourPanel').addEventListener('mouseenter', () => { tourHeld = true; clearTourTimer(); });
  $('#tourPanel').addEventListener('mouseleave', () => { tourHeld = false; scheduleTourAdvance(); });
  $('#tourPanel').addEventListener('focusin', () => { tourHeld = true; clearTourTimer(); });
  $('#tourPanel').addEventListener('focusout', event => {
    if ($('#tourPanel').contains(event.relatedTarget)) return;
    tourHeld = false;
    scheduleTourAdvance();
  });
  window.NEXORA_CONNECT_CORE={currentMember,currentRole,currentAccount,key,members,getState:()=>clone(state),read:()=>clone(load()),mutate,save,toast,showDetail,showSection,renderGroups,renderMessages,renderCalls,renderSummaries,renderMemberResults,rememberChatDraft,appendChatMessage,getContext:()=>({section,currentDetail,messages:clone(currentMessages),communityFilter,callFilter}),isBlocked,chatPref,escape:esc,initials,setProfileURL:value=>{profileUrl=value;},refresh:()=>{state=load();savedSnapshot=clone(state);renderSummaries();renderMessages();renderGroups();renderCalls();if(currentDetail)showDetail(currentDetail);}};
  renderSummaries();
  renderConversationPreviews();
  function setupCompactConnectTools(){
    const stage=$('#connectStage'),search=$('.global-search'),add=$('#newMessageBtn'),guide=$('#tourStartBtn'),actions=$('.page-head .head-actions'),tabs=$('.page-tabs');
    const wrapper=document.createElement('div');wrapper.className='connect-search-tools';search.before(wrapper);wrapper.append(search);
    const media=matchMedia('(max-width:800px)');
    function sync(){if(media.matches){wrapper.append(add);tabs.append(guide);}else{actions.prepend(add);actions.append(guide);}}
    media.addEventListener('change',sync);sync();
    const profile=$('#privacyPanel .profile-grid'),qr=$('#profileQr'),share=$('#privacyPanel .profile-grid > .actions');
    if(profile&&qr&&share){
      const tools=document.createElement('div');tools.id='compactProfileTools';tools.className='compact-profile-tools is-expanded';profile.append(tools);tools.append(qr,share);
    }
  }
  setupCompactConnectTools();
  const params = new URLSearchParams(location.search);
  if (params.get('embedded') === '1') document.body.classList.add('embedded');
  const requestedSection = params.get('section');
  showSection(['messages', 'calls', 'groups', 'privacy'].includes(requestedSection) ? requestedSection : 'messages');
  if (requestedSection === 'messages' && ['chat-kim','request'].includes(params.get('detail'))) showDetail(params.get('detail'));
  window.addEventListener('message', event => {
    if (event.source !== window.parent || (location.protocol !== 'file:' && event.origin !== location.origin) || event.data?.type !== 'nexora-open-contact') return;
    const contact=event.data.contact;
    if (!contact || typeof contact.recipient !== 'string' || typeof contact.sourceId !== 'string') return;
    const id='chat-community-'+encodeURIComponent(contact.sourceId).slice(0,220);
    state.sourceChats[id]={recipient:contact.recipient.slice(0,160),reference:String(contact.reference||'').slice(0,300),sourceId:contact.sourceId};
    state.deletedChats=state.deletedChats.filter(value=>value!==id);
    state.archivedChats=state.archivedChats.filter(value=>value!==id);
    if(!save()){toast(ui('Could not save this choice.','Không lưu được lựa chọn này.'));return;}showSection('messages');showDetail(id);
  });
  window.addEventListener('message', event => {if (event.source !== window.parent || (location.protocol !== 'file:' && event.origin !== location.origin)) return;if (event.data?.type === 'nexora-open-section' && ['messages','calls','groups','privacy'].includes(event.data.section)) showSection(event.data.section);if (event.data?.type === 'nexora-back') {const close=document.querySelector('#connectWorkflowDialog [data-connect-action="close-dialog"]')||document.querySelector('#connectMemberDrawer button[data-connect-action="close-members"]')||document.querySelector('#connectActiveCall:not(.is-minimized) [data-connect-action="minimize-call"]');if(close){close.click();if(currentDetail&&window.parent!==window)window.parent.postMessage({type:'nexora-connect-detail',open:!!currentDetail,force:true},parentMessageOrigin);return;}if(currentDetail)showSection(section);}if (event.data?.type === 'nexora-open-request' && state.request === 'pending') {showSection('messages');showDetail('request');}});
  let hasSeenTour = false;
  try { hasSeenTour = localStorage.getItem(tourSeenKey) === '1'; } catch {}
  if (params.get('tour') === '1' || (params.get('embedded') !== '1' && !hasSeenTour && !params.get('detail') && (!requestedSection || requestedSection === 'messages'))) {
    window.requestAnimationFrame(startTour);
  }
})();
