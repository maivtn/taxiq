(function () {
  'use strict';
  // All mutations in this prototype stay in this browser. Production scripts,
  // endpoints, sessions, payment processing and realtime calls are not imported.
  var T = window.COMMUNITY_STAGING_TEMPLATES;
  var production = window.COMMUNITY_PRODUCTION_DATA;
  if (production) Object.assign(T, production.templates);
  var jobDetails = window.COMMUNITY_STAGING_JOB_DETAILS || [];
  var view = document.getElementById('community-view');
  var dialogs = document.getElementById('community-dialogs');
  var isPOS = new URLSearchParams(location.search).get('context') === 'pos';
  var route = 'feed', page = 1, modal = '', selectedPost = null, selectedJob = null, selectedGroup = '';
  var feedFilter = 'All', jobFilter = 'All', shiftFilter = 'Upcoming', groupFilter = 'All';
  var compose = {type:'Show your work', content:'', places:['Main feed'], featured:false, photos:[]};
  var jobForm = {}, returnFocus = null;
  var activeGroup = '';
  var defaults = {posts:[],groups:[],joins:[],jobs:[],shifts:[],messages:[],likes:{},comments:{},hidden:[],privacy:{},nickname:'quan.pm',closed:[]};
  var state;
  try { state = Object.assign({}, defaults, JSON.parse(localStorage.getItem('nexora-community-staging-v1') || '{}')); }
  catch (_) { state = Object.assign({}, defaults); }
  state.groupMembership = state.groupMembership || {};
  function groupInfo(name) { return production && production.groups.find(function (group) { return group.name === name; }); }
  function isJoined(name) {
    if (Object.prototype.hasOwnProperty.call(state.groupMembership, name)) return state.groupMembership[name];
    return state.joins.includes(name) || !!(groupInfo(name) || {}).joined;
  }
  function joinedGroups() {
    return Array.from(new Set((production ? production.groups.map(function (group) { return group.name; }) : []).concat(state.joins))).filter(isJoined);
  }
  function toggleJoined(name) {
    var joined = !isJoined(name);
    state.groupMembership[name] = joined;
    state.joins = state.joins.filter(function (value) { return value !== name; });
    if (joined) state.joins.push(name);
    save();
  }
  function save() { try { localStorage.setItem('nexora-community-staging-v1', JSON.stringify(state)); } catch (_) {} }
  function q(selector, root) { return (root || document).querySelector(selector); }
  function qa(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }
  function text(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function label(el) { return el.getAttribute('aria-label') || text(el); }
  function fragment(html) { var root = document.createElement('div'); root.innerHTML = html; return root; }
  function source(key, selector) { return q(selector, fragment((T[key].main||'')+(T[key].dialogs||[]).join(''))); }
  function el(tag, value, cls) { var node = document.createElement(tag); node.textContent = value; if (cls) node.className = cls; return node; }
  function date(value) { return new Date(value || Date.now()).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}); }
  function id() { return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 7); }
  function setText(root, selector, value) { var node = q(selector, root); if (node) node.textContent = value; }
  function button(root, name) { return qa('button',root).find(function (b) { return label(b) === name; }); }
  function replaceText(root, old, value) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode())) if (node.textContent.includes(old)) node.textContent = node.textContent.split(old).join(value);
  }
  function selectChip(b, group) {
    qa('button',group || b.parentElement).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); x.classList.toggle('community-selected', x === b); });
  }
  function normalizeDates(root) {
    qa('time[datetime]',root).forEach(function (t) { t.textContent = date(t.dateTime); });
    replaceText(root, 'Mon, Oct 26', 'Oct 26, 2026');
  }
  function closeDialog() {
    dialogs.innerHTML = ''; modal = '';
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }
  function openDialog(key, markup) {
    returnFocus = document.activeElement;
    dialogs.innerHTML = '';
    var overlay = el('div', '', 'community-overlay');
    overlay.innerHTML = markup || (T[key].dialogs || []).join('');
    dialogs.appendChild(overlay); modal = key;
    qa('input,textarea',overlay).forEach(function (input) {
      if (input.tagName === 'TEXTAREA') input.value = input.textContent;
    });
    normalizeDates(overlay);
    if(key==='shift-create'){var start=q('input[name="startTime"]',overlay),end=q('input[name="endTime"]',overlay);if(start)start.value='12:00';if(end)end.value='18:00';var workers=q('input[name="workersNeeded"]',overlay);if(workers)workers.value='1';}
    var first = q('input:not([disabled]),textarea:not([disabled]),button:not([disabled])',overlay);
    if (first) first.focus();
    return overlay;
  }
  function navigate(next, notify, groupId) {
    var aliases = {mkt:'market',shifts:'shift'};
    next = aliases[next] || next;
    if (!T[next]) next = 'feed';
    var group = production && production.groups.find(function (item) { return item.id === groupId; });
    activeGroup = next === 'feed' && group ? group.name : '';
    route = next; page = 1; closeDialog(); render(); window.scrollTo(0,0);
    if (notify !== false && parent !== window) parent.postMessage({type:'nexora-community-route',route:route === 'chat' ? 'connect' : /^job-(create|preview)$/.test(route) ? 'jobs' : route,group:group ? group.id : ''}, location.origin);
    if (parent === window) { var u=new URL(location.href);u.searchParams.set('tab',route);if(group)u.searchParams.set('group',group.id);else u.searchParams.delete('group');history.pushState({},'',u); }
  }
  function feedSection() { return q('section[aria-label="Feed"],section[aria-label="Groups & Market"]', view); }
  function postCard(post) {
    var candidates=qa('article',fragment(T.feed.main));
    var model=candidates.find(function(c){return text(q('header',c)).includes(post.type);})||candidates[0];
    var card=model.cloneNode(true);
    card.dataset.post = post.id;
    setText(card, 'header p', production ? production.profileName : 'Quan PM');
    setText(card, 'header span[aria-hidden="true"]', production ? production.profileInitials : 'QP');
    setText(card, 'header p + span', post.type);
    setText(card, 'time', date(post.created));
    var content = q(':scope > p',card); content.textContent = post.content;
    qa('[aria-label^="Open photo"]',card).forEach(function (b) { b.remove(); });
    if (post.type === 'Buy & sell') content.prepend(el('p', (post.price ? '$'+post.price+' · ' : '') + (post.region || ''), 'font-bold mb-2'));
    (post.photos || []).forEach(function (src, index) { var b=el('button','','community-upload-preview'); b.setAttribute('aria-label','Open photo '+(index+1)+' of '+post.photos.length);var img=el('img');img.src=src;img.alt='Photo from '+(production?production.profileName:'Quan PM');b.appendChild(img);content.after(b); });
    qa('[aria-label="Posted in"] li',card).slice(1).forEach(function (x) {x.remove();});
    var places=q('[aria-label="Posted in"]',card); places.innerHTML='';
    (post.places || ['Main feed']).forEach(function (place) { var li=el('li'), b=el('button',place,'rounded-lg bg-nexoraSurfaceMuted px-2 py-0.5 text-xs font-semibold text-nexoraMuted');li.appendChild(b);places.appendChild(li); });
    var like=q('[title="Like"]',card);like.lastChild.textContent='0 likes';
    var comments=qa('button[aria-expanded]',card).find(function (b) {return /comment/.test(text(b));});if(comments)comments.lastChild.textContent='0 comments';
    if (post.featured) q('header',card).appendChild(el('span','Sponsored','text-xs font-bold text-nexoraSubtle'));
    return card;
  }
  function renderFeed() {
    var section=feedSection();if(!section)return;
    var sourceCards=qa('article',section);sourceCards.forEach(function(card,i){card.dataset.post=card.dataset.sourcePost||'source-'+i;});
    var holder=sourceCards[0] && sourceCards[0].parentElement;
    if(!holder){holder=el('div','','space-y-4');section.appendChild(holder);}
    state.posts.slice().reverse().forEach(function(post){holder.prepend(postCard(post));});
    qa('article[data-post]',section).forEach(function(card){
      var key=card.dataset.post,own=state.posts.find(function(x){return x.id===key;});
      var buySell = own ? own.type === 'Buy & sell' : text(q('header',card)).includes('Buy & sell');
      var places = own ? (own.places||[]) : qa('[aria-label="Posted in"] button',card).map(text);
      var hidden=state.hidden.indexOf(key)>=0 || feedFilter==='My drafts' || (feedFilter==='All buy & sell' && !buySell);
      if(route==='market' && !buySell)hidden=true;
      if(activeGroup && !places.includes(activeGroup))hidden=true;
      if(feedFilter!=='All' && feedFilter!=='All buy & sell' && feedFilter!=='My drafts' && !places.includes(feedFilter))hidden=true;
      card.classList.toggle('community-hidden', hidden);
      var like=q('[title="Like"]',card);if(like&&state.likes[key]){like.setAttribute('aria-pressed','true');like.classList.add('text-nexoraDanger');var num=parseInt(text(like),10)||0;like.lastChild.textContent=(num+1)+' likes';}
    });
    var empty=qa('p',section).find(function(p){return text(p)==='No posts yet. Be the first to share something.';});
    var visible=qa('article[data-post]',section).some(function(c){return !c.classList.contains('community-hidden');});
    if(empty)empty.classList.toggle('community-hidden',visible);
    if(!visible&&!empty)section.appendChild(el('p','No posts yet. Be the first to share something.','rounded-2xl border border-nexoraBorder bg-white p-8 text-center text-sm text-nexoraMuted'));
    var filters=q('[aria-label="Show posts from"]',section);if(filters)qa('button',filters).forEach(function(b){b.classList.toggle('community-selected',text(b)===(route==='market'?'All buy & sell':feedFilter));});
  }
  function groupName(card){var b=q('button[aria-label^="View group"]',card);return b?b.getAttribute('aria-label').replace(/^View group /,''):text(q('p',card));}
  function renderGroups(){
    var list=route==='groups'?q('section[aria-label="Groups & Market"] ul',view):null;
    if(list){var model=q('li',list);state.groups.filter(function(g){return !g.private;}).forEach(function(g){var card=model.cloneNode(true);var old=groupName(card);replaceText(card,old,g.name);var btn=q('[aria-label^="View group"]',card);if(btn)btn.setAttribute('aria-label','View group '+g.name);var join=q('[aria-label^="Join ·"],[aria-label^="Joined ·"]',card);if(join)join.setAttribute('aria-label','Join · '+g.name);list.appendChild(card);});}
    qa('button[aria-label^="Join ·"],button[aria-label^="Joined ·"]',view).forEach(function(b){
      var name=label(b).replace(/^(?:Join|Joined) · /,''), joined=isJoined(name);
      b.setAttribute('aria-pressed',String(joined));b.setAttribute('aria-label',(joined?'Joined · ':'Join · ')+name);
      b.replaceChildren(el('span',joined?'Joined':'Join'));
    });
    qa('h2',view).filter(function(h){return /^Your groups/.test(text(h));}).forEach(function(h){
      var names=joinedGroups(), section=h.closest('section');h.textContent='Your groups '+names.length;
      if(!section)return;
      qa('ul,p,button[data-group]',section).forEach(function(node){node.remove();});
      var list=el('ul','','mt-3 space-y-2');
      names.forEach(function(name){var li=el('li'),b=el('button',name,'block w-full rounded-lg p-2 text-left text-sm font-semibold hover:bg-nexoraSurfaceMuted');b.dataset.group=name;li.appendChild(b);list.appendChild(li);});
      section.appendChild(list);
    });
  }
  function sourceJobs(){return ['jobs','jobs-2','jobs-3','jobs-4'].flatMap(function(k){return qa('section[aria-label="Browse jobs"] ul > li',fragment(T[k].main));});}
  var jobCards=sourceJobs();
  function renderJobs(){
    var section=q('section[aria-label="Browse jobs"]',view);if(!section)return;
    var list=q('ul',section);if(!list)return;
    var search=q('input[type="search"]',section),area=q('select',section);
    var query=search?search.value.toLowerCase():'';var areaText=area&&area.selectedIndex>0?text(area.options[area.selectedIndex]):'';
    var cards=jobCards.filter(function(c){var t=text(c);return (!query||t.toLowerCase().includes(query))&&(!areaText||t.includes(areaText)||t.includes(', '+(area.value||'')))&&(jobFilter==='All'||(jobFilter==='Seeking work'?t.includes('Seeking work'):!t.includes('Seeking work')));});
    list.innerHTML='';cards.slice((page-1)*12,page*12).forEach(function(c){var copy=c.cloneNode(true);copy.dataset.job=String(jobCards.indexOf(c));list.appendChild(copy);});
    var count=qa('p',section).find(function(p){return /^\d+ posts?$/.test(text(p));});if(count)count.textContent=cards.length+' posts';
    var results=qa('p',section).find(function(p){return /^Showing /.test(text(p));});if(results)results.textContent='Showing '+(cards.length?(page-1)*12+1:0)+' to '+Math.min(page*12,cards.length)+' of '+cards.length+' results';
    var pagination=q('[aria-label="Pagination"]',section);if(pagination){qa('button',pagination).forEach(function(b){var name=label(b);if(name==='Previous')b.disabled=page===1;else if(name==='Next')b.disabled=page>=Math.ceil(cards.length/12);else {var number=Number(name);b.disabled=number>Math.max(1,Math.ceil(cards.length/12));b.classList.toggle('community-selected',number===page);}});}
  }
  function myJobCard(job){
    var model=source('jobs-my-posts','section[aria-label="My posts"] > ul > li');
    if(!model)return null;model.dataset.localJob=job.id;
    var title=q('h3',model);if(title)title.textContent=job.title;
    replaceText(model,'Recruiting',job.status||'Pending review');replaceText(model,'TT-FBABEA','TT-'+job.id.slice(-6).toUpperCase());replaceText(model,'Oct 13, 2026',date(job.created));
    replaceText(model,'Openings: 6','Openings: '+(job.openings||1));replaceText(model,'Flexible',job.schedule||'Full-time');replaceText(model,'$6,000 / week',job.salary||'Pay negotiable');
    return model;
  }
  function renderMyJobs(){var s=q('section[aria-label="My posts"]',view);if(!s)return;var list=q('ul',s);if(list){state.jobs.forEach(function(job){var c=myJobCard(job);if(c)list.prepend(c);});qa('li',list).forEach(function(c){var key=c.dataset.localJob||'source';if(state.closed.includes(key))replaceText(c,'Recruiting','Closed');});}var count=qa('p',s).find(function(p){return /^\d+ posts?$/.test(text(p));});if(count)count.textContent=(state.jobs.length+1)+' posts';}
  function renderShifts(){
    var s=q('section[aria-labelledby="owner-shifts-title"]',view);if(!s)return;
    var model=source('shift-past','article[id^="owner-shift-"]');
    if(shiftFilter==='Upcoming'&&model)state.shifts.forEach(function(shift){var card=model.cloneNode(true);card.removeAttribute('id');card.dataset.localShift=shift.id;replaceText(card,'TEST',shift.title);replaceText(card,'Party',shift.type);var displayDate=shift.shiftDate?date(shift.shiftDate+'T12:00:00'):date(shift.created);replaceText(card,'Oct 26, 2026',displayDate);replaceText(card,'Mon, Oct 26',displayDate);replaceText(card,'1:00 PM – 6:00 PM',shiftTime(shift.start)+' – '+shiftTime(shift.end));replaceText(card,'$3,999','$'+shift.pay);replaceText(card,'0/1 booked','0/'+shift.techs+' booked');s.appendChild(card);});
    if(shiftFilter==='Upcoming'&&state.shifts.length){replaceText(s,'Showing 0 to 0 of 0 results','Showing 1 to '+state.shifts.length+' of '+state.shifts.length+' results');var p=qa('p',s).find(function(p){return text(p)==='No shifts here yet.';});if(p)p.remove();}
  }
  function render(){
    var key=route;
    if(isPOS && route==='job-create')key='pos-job-create';
    if(route==='shift'&&shiftFilter==='Past')key='shift-past';
    view.innerHTML=activeGroup && production && production.groupFeeds[activeGroup] ? production.groupFeeds[activeGroup].main : T[key].main;
    if(isPOS&&route==='job-preview'){var preview=q('section[aria-label="Post a Job"]',view);var pos=fragment(T['pos-job-create'].main);var form=q('section[aria-label="Post a Job"]',pos);if(preview&&form){form.replaceWith(preview);var quick=q('section[aria-labelledby="owner-job-quick-preview-title"]',pos);if(quick)quick.remove();view.innerHTML=pos.innerHTML;}}
    normalizeDates(view);renderGroups();
    var salaryDefault=q('#owner-job-salary-type',view);if(salaryDefault)salaryDefault.value='Negotiable';
    if(route==='feed'||route==='market')renderFeed();
    if(route==='jobs')renderJobs();
    if(route==='jobs-my-posts')renderMyJobs();
    if(route==='pos-recruitment'){var list=q('section[aria-label="Job postings"] ul',view);if(list)state.jobs.forEach(function(job){var c=myJobCard(job);if(c)list.prepend(c);});}
    if(route==='shift')renderShifts();
    if(route==='privacy'){
      replaceText(view,'quan.pm',state.nickname);
      qa('select[id^="privacy-"]',view).forEach(function(s){s.value=state.privacy[s.id]||({'privacy-phone':'ConnectionsAndSharedGroups','privacy-email':'Nobody','privacy-strangers':'ToRequests','privacy-calls':'ConnectionsAndSharedGroups'}[s.id]);});
      qa('a[href^="sms:"]',view).forEach(function(a){a.href='#';});
      replaceText(view,'https://staging-web.nexoratouch.com/community?tab=connect&handle=@quan.pm','community.html?tab=connect');
    }
    if(route==='chat') { var container=q('.header-message-chat-thread-list',view);if(container)state.messages.forEach(function(msg){container.appendChild(el('p',msg.text,'community-message'));}); }
    if(route==='chatgroups')state.groups.filter(function(g){return g.private;}).forEach(function(g){var heading=qa('h3',view).find(function(h){return text(h)==='YOUR GROUPS';});if(heading){var b=el('button',g.name+' No messages yet','community-demo-card block w-full text-left');b.dataset.chat=g.name;heading.parentElement.appendChild(b);}});
  }
  function beginCompose(type){compose={type:type||'Show your work',content:'',places:['Main feed'],featured:false,photos:[]};showCompose(1);}
  function stashCompose(){var root=q('.community-overlay');if(!root)return;var content=q('#composer-content',root);if(content)compose.content=content.value;['category','price','region'].forEach(function(k){var input=q('#composer-'+k,root);if(input)compose[k]=input.value;});}
  function setPlaceChoice(button, selected) {
    button.setAttribute('aria-pressed',String(selected));
    button.classList.toggle('community-selected',selected);
    if (!production) return;
    ['border-indigo-500','bg-nexoraBrandSoft'].forEach(function(cls){button.classList.toggle(cls,selected);});
    ['border-nexoraBorder','bg-white'].forEach(function(cls){button.classList.toggle(cls,!selected);});
    var mark=q(':scope > span:last-child[aria-hidden]',button);
    if(mark){
      ['border-indigo-600','bg-indigo-600','text-white'].forEach(function(cls){mark.classList.toggle(cls,selected);});
      mark.classList.toggle('border-slate-300',!selected);
      mark.innerHTML=selected?production.placeCheckMarkup:'';
    }
  }
  function showCompose(step){
    var key=step===1?(compose.type==='Buy & sell'?'compose-market':'compose-1'):step===2?(compose.type==='Buy & sell'&&T['compose-2-market']?'compose-2-market':'compose-2'):compose.featured?'compose-featured':'compose-3';
    var root=openDialog(key);compose.step=step;
    if(step===1){q('#composer-content',root).value=compose.content;qa('[role="radio"]',root).forEach(function(b){b.setAttribute('aria-checked',String(text(b)===compose.type));b.classList.toggle('community-selected',text(b)===compose.type);});['category','price','region'].forEach(function(k){var input=q('#composer-'+k,root);if(input&&compose[k])input.value=compose[k];});renderPhotos(root);}
    if(step===2){
      var choices=qa('button[aria-pressed]',root);
      choices.forEach(function(b,i){b.dataset.place=b.dataset.place||(i===0?'Main feed':text(q('span.font-bold,span.font-semibold,p.font-bold',b))||text(b).split(' Nail techs')[0].split(' Everyone')[0]);});
      var allowed=choices.filter(function(b){return !b.disabled;}).map(function(b){return b.dataset.place;});
      compose.places=compose.places.filter(function(name){return allowed.includes(name);});
      choices.forEach(function(b){setPlaceChoice(b,compose.places.includes(b.dataset.place));});
      var summary=qa('p',root).find(function(p){return /\d+\/3 places selected/.test(text(p));});
      if(summary)summary.textContent=summary.textContent.replace(/\d+\/3 places selected/,compose.places.length+'/3 places selected');
    }
    if(step===3){replaceText(root,'Show your work',compose.type);replaceText(root,'Main feed',compose.places.join(' · '));}
  }
  function renderPhotos(root){var list=q('[aria-label="Photos"],ul',root);if(!list)return;qa('.community-upload-preview',root).forEach(function(n){n.remove();});compose.photos.forEach(function(src,i){var wrap=el('li','','community-upload-preview');var img=el('img');img.src=src;img.alt='Photo '+(i+1);wrap.appendChild(img);var b=el('button','×');b.setAttribute('aria-label','Remove photo');b.dataset.photo=i;wrap.appendChild(b);list.appendChild(wrap);});}
  function upload(accept,multiple,done){var input=el('input');input.type='file';input.accept=accept;input.multiple=multiple;input.hidden=true;document.body.appendChild(input);input.addEventListener('change',function(){var files=Array.from(input.files||[]).slice(0,multiple?6:1);Promise.all(files.map(function(file){return new Promise(function(resolve){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.readAsDataURL(file);});})).then(function(data){done(data);input.remove();});});input.click();}
  function publishPost(){state.posts.unshift({id:id(),type:compose.type,content:compose.content,places:compose.places,price:compose.price,region:compose.region,featured:compose.featured,photos:compose.photos,created:new Date().toISOString()});compose.places.forEach(function(name){if(name!=='Main feed'){state.groupMembership[name]=true;if(!state.joins.includes(name))state.joins.push(name);}});save();closeDialog();feedFilter='All';navigate(compose.type==='Buy & sell'?'market':'feed');}
  function openGroup(name){
    selectedGroup=name;
    var sourceMarkup=production && production.groupDetails[name];
    var localGroup=state.groups.find(function(group){return group.name===name;});
    var root=openDialog('group-detail',sourceMarkup || (production && localGroup ? production.groupDetails['Thuế & 1099 cho thợ (TAX IQ)'] : ''));
    if(!sourceMarkup){
      setText(root,'h2',name);
      var rules=qa('h3',root).find(function(h){return text(h)==='Group rules';});
      if(rules){var section=rules.parentElement;if(localGroup && localGroup.rules)setText(section,'p',localGroup.rules);else section.remove();}
    }
    var joined=isJoined(name), membership=qa('dt',root).find(function(dt){return text(dt)==='Membership';});
    if(membership && membership.nextElementSibling)membership.nextElementSibling.textContent=joined?'Joined':'Not joined';
    var join=button(root,'Join group')||button(root,'Leave group')||button(root,'Joined');
    if(join)join.textContent=joined?'Leave group':'Join group';
  }
  function showGroupFeed(name){var info=groupInfo(name);feedFilter=info?'All':name;navigate('feed',true,info && info.id);}
  function openJob(card) {
    var title = q('h3', card) || q('.line-clamp-2.font-black', card);
    var index = card.dataset.job;
    var detail = index !== undefined ? jobDetails[Number(index)] : jobDetails.find(function (item) { return item.title.trim() === text(title); });
    if (!detail) return;
    selectedJob = card;
    // Each source record contains its own complete salon, compensation,
    // address, contact, description and media, including seeking-work posts.
    openDialog('job-detail', detail.markup);
  }
  function shiftChoice(groupName) {
    var fieldset = qa('fieldset', dialogs).find(function (group) { return text(q('legend', group)) === groupName; });
    var heading = qa('p', dialogs).find(function (node) { return text(node) === groupName; });
    var group = fieldset || (heading && heading.parentElement);
    return group && q('button[aria-pressed="true"]', group);
  }
  function selectShiftChip(b) {
    var multiple = b.parentElement.previousElementSibling && text(b.parentElement.previousElementSibling) === 'Services';
    var wasSelected = b.getAttribute('aria-pressed') === 'true';
    var activeClass = source('shift-create', 'button[aria-pressed="true"]').className;
    var inactiveClass = source('shift-create', 'button[aria-pressed="false"]').className;
    qa('button', b.parentElement).forEach(function (chip) {
      var selected = chip === b ? (multiple ? !wasSelected : true) : (multiple && chip.getAttribute('aria-pressed') === 'true');
      chip.setAttribute('aria-pressed', String(selected));
      chip.className = selected ? activeClass : inactiveClass;
    });
  }
  function selectedShiftDate() {
    var choice = text(shiftChoice('When')) || 'Today';
    var offset = {'Today':0,'Tomorrow':1,'In 2 days':2,'In 3 days':3}[choice];
    var day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() + offset);
    return {when:choice, dayOffset:offset, shiftDate:[day.getFullYear(),String(day.getMonth()+1).padStart(2,'0'),String(day.getDate()).padStart(2,'0')].join('-')};
  }
  function shiftTime(value) {
    var parts = value.split(':');
    var day = new Date(2000, 0, 1, Number(parts[0]), Number(parts[1]));
    return day.toLocaleTimeString('en-US', {hour:'numeric',minute:'2-digit'});
  }
  function commentSection(card){var existing=q('[data-comments]',card);if(existing)return existing;var template=source('feed-comments','article');var textarea=q('textarea',template);if(!textarea)return null;var section=textarea.closest('form')||textarea.parentElement.parentElement.parentElement;section=section.cloneNode(true);section.dataset.comments='';if(card.dataset.post!=='source-0')qa('ul',section).forEach(function(ul){ul.innerHTML='';});card.appendChild(section);var post=card.dataset.post;(state.comments[post]||[]).forEach(function(msg){section.appendChild(el('p',msg,'mt-3 rounded-xl bg-nexoraSurfaceMuted p-3 text-sm'));});return section;}
  function stashJob(){qa('input,textarea,select',view).forEach(function(input){if(input.id)jobForm[input.id]=input.type==='checkbox'?input.checked:(input.dataset.isoValue||input.value);});var editor=q('.ql-editor[contenteditable="true"]',view);if(editor)jobForm.content=editor.innerHTML;var skills=q('[aria-label="Desired skills"]',view);if(skills)jobForm.skills=qa('[aria-pressed="true"]',skills).map(text);}
  function restoreJob(){Object.keys(jobForm).forEach(function(key){var input=document.getElementById(key);if(input){if(input.type==='checkbox')input.checked=jobForm[key];else input.value=jobForm[key];}});var editor=q('.ql-editor[contenteditable="true"]',view);if(editor&&jobForm.content)editor.innerHTML=jobForm.content;}
  function jobPreview(){stashJob();var title=q('#owner-job-title',view),editor=q('.ql-editor[contenteditable="true"]',view);if(!title.value.trim()){title.focus();title.classList.add('community-inline-error');return;}if(!editor||text(editor).length<100){if(editor){editor.classList.add('community-inline-error');editor.focus();}return;}route='job-preview';render();setText(view,'article h4',jobForm['owner-job-title']);var previewEditor=q('article .ql-editor',view);if(previewEditor)previewEditor.innerHTML=jobForm.content;var dds=qa('article dd',view);if(dds[0])dds[0].textContent=jobForm['owner-job-openings']||1;if(dds[1])dds[1].textContent=({'FullTime':'Full-time','PartTime':'Part-time','Flexible':'Flexible'}[jobForm['owner-job-schedule']]||'Full-time');if(dds[2])dds[2].textContent=salaryText();}
  function salaryText(){return jobForm['owner-job-salary-type']==='Guaranteed'&&jobForm['owner-job-weekly-salary']?'$'+Number(jobForm['owner-job-weekly-salary']).toLocaleString('en-US')+' / week':jobForm['owner-job-salary-type']==='NoGuaranteed'?'No guaranteed salary':'Pay negotiable';}
  function publishJob(draft){stashJob();var title=jobForm['owner-job-title']||'Your job title appears here';var job={id:id(),title:title,status:draft?'Draft':'Pending review',created:new Date().toISOString(),openings:jobForm['owner-job-openings'],schedule:({'FullTime':'Full-time','PartTime':'Part-time','Flexible':'Flexible'}[jobForm['owner-job-schedule']]||'Full-time'),content:jobForm.content,salary:salaryText(),skills:jobForm.skills||[]};if(jobForm.editId){var idx=state.jobs.findIndex(function(j){return j.id===jobForm.editId;});if(idx>=0)state.jobs[idx]=Object.assign(job,{id:jobForm.editId});else state.jobs.push(job);}else state.jobs.push(job);save();navigate(isPOS?'pos-recruitment':'jobs-my-posts');}
  document.addEventListener('click',function(event){
    var b=event.target.closest('button,a');if(!b)return;
    if(b.disabled||b.getAttribute('aria-disabled')==='true'){event.preventDefault();return;}
    var name=label(b), value=text(b), inDialog=!!b.closest('#community-dialogs');
    if(value==='Show more'||value==='Show less'){
      var details=b.previousElementSibling;
      if(details){
        var expand=value==='Show more';
        if(expand){details.dataset.collapsedClass=details.className;Array.from(details.classList).filter(function(cls){return /^line-clamp-/.test(cls);}).forEach(function(cls){details.classList.remove(cls);});}
        else if(details.dataset.collapsedClass)details.className=details.dataset.collapsedClass;
        b.textContent=expand?'Show less':'Show more';b.setAttribute('aria-expanded',String(expand));
      }
      return;
    }
    if(b.tagName==='A'&&(b.getAttribute('href')==='#'||b.dataset.externalHref||b.dataset.nailhub)){event.preventDefault();if(b.dataset.nailhub){var selectedCard=b.closest('li')||selectedJob;if(selectedCard)openJob(selectedCard);}return;}
    if(name==='Close'||value==='Cancel'){closeDialog();return;}
    if(b.dataset.photo!==undefined){compose.photos.splice(Number(b.dataset.photo),1);renderPhotos(q('.community-overlay'));return;}
    if(b.dataset.group){openGroup(b.dataset.group);return;}
    if(b.dataset.chat){navigate('chat');return;}
    var nav=b.closest('nav[aria-label="Community sections"]');
    if(nav){var routes={'Feed':'feed','Groups & Market':'groups','Jobs':'jobs','Extra shifts':'shift','Messages & Calls':'connect'};navigate(routes[value]);return;}
    if(b.getAttribute('role')==='tab'){
      if(isPOS&&value==='Staff'){parent.postMessage({type:'nexora-community-staff'},location.origin);return;}
      if(isPOS&&value==='Recruitment'){navigate('pos-recruitment');return;}
      var tabs={'Industry groups':'groups','Classifieds · Buy & sell':'market','Browse Jobs':'jobs','My Posts':'jobs-my-posts','My extra shifts':'shift','Zelle payments':'shift-payments','Messages':'connect','Group chats':'chatgroups','Calls':'calls','Privacy & NEXORA ID':'privacy'};
      if(tabs[value]){navigate(tabs[value]);return;}
      if(b.closest('[aria-label="Filter communities"]')){groupFilter=value;qa('button',b.parentElement).forEach(function(tab){tab.setAttribute('aria-selected',String(tab===b));tab.classList.toggle('community-selected',tab===b);});var list=b.closest('[role="tablist"]').nextElementSibling;qa('li',list).forEach(function(li){var title=text(li);li.classList.toggle('community-hidden',groupFilter==='City'&&!/Dallas|Austin|Houston/.test(title)||groupFilter==='Topic'&&/Dallas|Austin|Houston/.test(title));});return;}
    }
    if(inDialog){
      if(/^compose/.test(modal)){
        if(b.getAttribute('role')==='radio'){
          if(compose.step===1){stashCompose();compose.type=value;showCompose(1);return;}
          if(compose.step===3&&/^Free|^Featured/.test(value)){compose.featured=value.startsWith('Featured');showCompose(3);return;}
          if(compose.step===3){qa('[role="radio"]',b.closest('[role="radiogroup"]')).forEach(function(r){r.setAttribute('aria-checked',String(r===b));r.classList.toggle('community-selected',r===b);});return;}
        }
        if(b.hasAttribute('aria-pressed')&&compose.step===2){var place=b.dataset.place;var pos=compose.places.indexOf(place);if(pos>=0)compose.places.splice(pos,1);else if(compose.places.length<3)compose.places.push(place);setPlaceChoice(b,compose.places.includes(place));var summary=qa('p',dialogs).find(function(p){return text(p).includes('/3 places selected');});if(summary)summary.textContent=compose.places.length+'/3 places selected · Each person sees the post only once, even across groups';return;}
        if(value==='Next'){stashCompose();if(compose.step===1&&!compose.content.trim()){var c=q('#composer-content',dialogs);c.classList.add('community-inline-error');c.focus();return;}if(compose.step===1&&compose.type==='Buy & sell'){var missing=qa('#composer-price,#composer-region',dialogs).find(function(input){return !input.value.trim();});if(missing){missing.classList.add('community-inline-error');missing.focus();return;}}if(compose.step===2&&!compose.places.length)return;showCompose(compose.step+1);return;}
        if(value==='Back'){showCompose(compose.step-1);return;}
        if(value==='Use suggestion'){compose.places=['Main feed'];showCompose(2);return;}
        if(name==='Add photos'){upload('image/*',true,function(images){compose.photos=compose.photos.concat(images).slice(0,6);renderPhotos(q('.community-overlay'));});return;}
        if(value==='Post'){publishPost();return;}
        // The paid checkout is intentionally kept out of the offline demo.
        if(value==='Continue to payment')return;
      }
      if(modal==='new-group'&&value==='Create group'){
        var input=q('#community-group-name',dialogs),nameGroup=input.value.trim();if(!nameGroup){input.focus();input.classList.add('community-inline-error');return;}
        state.groups.push({id:id(),name:nameGroup,rules:q('#community-group-rules',dialogs).value,industry:q('#community-group-industry',dialogs).value,type:q('#community-group-type',dialogs).value});state.joins.push(nameGroup);save();closeDialog();navigate('groups');return;
      }
      if(modal==='group-detail'){
        if(value==='Join group'||value==='Leave group'||value==='Joined'){toggleJoined(selectedGroup);var nameToOpen=selectedGroup;render();openGroup(nameToOpen);return;}
        if(value==='View group feed'){showGroupFeed(selectedGroup);return;}
        if(value==='View post & comments'){var postBody=text(q('p.whitespace-pre-wrap',b.closest('li')));showGroupFeed(selectedGroup);var card=qa('article',view).find(function(c){return text(q(':scope > p',c))===postBody;});if(card){commentSection(card);card.scrollIntoView({block:'center'});}return;}
      }
      if(modal==='job-detail'&&value==='Message'){closeDialog();navigate('chat');return;}
      if(modal==='job-services'&&value==='Apply selection'){
        var selected=qa('input[type="checkbox"]:checked',dialogs).map(function(c){return text(c.closest('label'));});jobForm.services=selected;closeDialog();var serviceButton=button(view,'Choose from salon menu');if(serviceButton){var section=serviceButton.parentElement;if(section){var p=qa('p',section).find(function(x){return text(x).startsWith('No services selected');});if(p)p.textContent=selected.join(' · ');}}
        qa('[aria-label="Desired skills"] button',view).forEach(function(skill){if(selected.some(function(s){return s.toLowerCase().includes(text(skill).toLowerCase());})){skill.setAttribute('aria-pressed','true');skill.classList.add('community-selected');}});return;
      }
      if(modal==='shift-create'){
        if(b.getAttribute('aria-pressed')!==null){selectShiftChip(b);return;}
        if(value==='Post shift'){
          var inputs=qa('input',dialogs),title=inputs.find(function(i){return i.type==='text';}),pay=inputs.find(function(i){return i.inputMode==='decimal'||i.type==='number'&&i.step!=='1';});
          var labeled=function(copy){var l=qa('label',dialogs).find(function(l){return text(l).startsWith(copy);});return l&&(q('input',l)||l.htmlFor&&document.getElementById(l.htmlFor));};
          title=labeled('Title')||title;pay=labeled('Pay per tech ($)')||pay;var techs=labeled('Techs needed');
          if(!title||!title.value.trim()||!pay||!Number(pay.value)){[title,pay].filter(Boolean).forEach(function(i){if(!i.value)i.classList.add('community-inline-error');});return;}
          var times=qa('input[type="time"]',dialogs);var typeButton=shiftChoice('Shift type');var selectedDate=selectedShiftDate();
          state.shifts.unshift({id:id(),title:title.value,type:text(typeButton)||'Party',pay:pay.value,techs:techs?techs.value:1,start:times[0]?times[0].value:'12:00',end:times[1]?times[1].value:'18:00',when:selectedDate.when,dayOffset:selectedDate.dayOffset,shiftDate:selectedDate.shiftDate,created:new Date().toISOString()});save();shiftFilter='Upcoming';closeDialog();navigate('shift');return;
        }
      }
      if(modal==='private-group'&&value==='Create'){var groupInput=q('#connect-group-title',dialogs);if(!groupInput.value.trim())return;state.groups.push({id:id(),name:groupInput.value.trim(),private:true});save();closeDialog();navigate('chatgroups');return;}
      if(modal==='nickname'&&value==='Save'){var nick=q('#connect-nickname',dialogs).value.trim();if(!/^[a-z0-9.]{3,20}$/.test(nick)){q('#connect-nickname',dialogs).classList.add('community-inline-error');return;}state.nickname=nick;save();closeDialog();render();return;}
      if(modal==='report'&&value==='Send report'){if(selectedPost){state.hidden.push(selectedPost.dataset.post);save();}closeDialog();render();return;}
    }
    if(value.startsWith("What's on your mind")||['Show your work','Trade tip','Q&A','Buy & sell'].includes(value)&&!b.closest('article')){beginCompose(value.startsWith("What's")?'Show your work':value);return;}
    if(b.closest('[aria-label="Show posts from"]')){feedFilter=value;if(value==='All buy & sell'){navigate('market');return;}if(groupInfo(value)){showGroupFeed(value);return;}navigate('feed');return;}
    if(name.startsWith('View group ')){openGroup(name.replace(/^View group /,''));return;}
    if(/^(?:Join|Joined) · /.test(name)){toggleJoined(name.replace(/^(?:Join|Joined) · /,''));render();return;}
    if(value==='New group'){openDialog('new-group');return;}
    if(value==='Create group'){openDialog('private-group');return;}
    if(value==='Join'&&route==='chatgroups'){var cardGroup=b.closest('li');var groupText=text(q('p',cardGroup));if(groupText&&!state.joins.includes(groupText)){state.joins.push(groupText);save();b.textContent='Joined';}return;}
    var post=b.closest('article[data-post]');
    if(post){
      if(name==='More actions'){selectedPost=post;var menu=q('[role="menu"]',post);if(menu){menu.remove();b.setAttribute('aria-expanded','false');}else{menu=el('div','','absolute right-0 top-9 z-10 rounded-xl border border-nexoraBorder bg-white p-1 shadow-lg');menu.setAttribute('role','menu');var report=el('button','Report','rounded-lg px-4 py-2 text-sm hover:bg-nexoraSurfaceMuted');report.setAttribute('role','menuitem');menu.appendChild(report);b.parentElement.appendChild(menu);b.setAttribute('aria-expanded','true');}return;}
      if(value==='Report'){selectedPost=post;openDialog('report');return;}
      if(b.title==='Like'){var key=post.dataset.post;state.likes[key]=!state.likes[key];save();var num=parseInt(value,10)||0;var liked=state.likes[key];b.setAttribute('aria-pressed',String(liked));b.classList.toggle('text-nexoraDanger',liked);b.lastChild.textContent=(num+(liked?1:-1))+' likes';return;}
      if(/\d+ comments?$/.test(value)){var existingComments=q('[data-comments]',post);if(existingComments)existingComments.remove();else commentSection(post);b.setAttribute('aria-expanded',String(!existingComments));return;}
      if(value==='Post'){var input=q('textarea',post);if(!input||!input.value.trim())return;var postKey=post.dataset.post;state.comments[postKey]=state.comments[postKey]||[];state.comments[postKey].push(input.value.trim());save();q('[data-comments]',post).appendChild(el('p',input.value.trim(),'mt-3 rounded-xl bg-nexoraSurfaceMuted p-3 text-sm'));input.value='';b.disabled=true;return;}
      if(value==='Reply'){var commentInput=q('textarea',post);if(commentInput)commentInput.focus();return;}
      if(b.closest('[aria-label="Posted in"]')){if(value==='Main feed'){feedFilter='Main feed';navigate('feed');}else openGroup(value);return;}
    }
    if(name.startsWith('Open photo')||name.startsWith('Photo ')||name==='View cover photo'){
      var img=q('img',b);if(img){var overlay=el('div','','community-overlay');var image=img.cloneNode();image.className='local-photo';var close=el('button','×','local-photo-close');close.setAttribute('aria-label','Close');overlay.append(image,close);dialogs.replaceChildren(overlay);modal='photo';}return;
    }
    if(b.closest('section[aria-label="Browse jobs"] li')){openJob(b.closest('li'));return;}
    if(b.closest('section[aria-label="Browse jobs"] [aria-label="Post type"]')){jobFilter=value;selectChip(b,b.parentElement);page=1;renderJobs();return;}
    if(route==='jobs'&&b.closest('[aria-label="Pagination"]')){if(name==='Next')page++;else if(name==='Previous')page--;else page=Number(value)||1;renderJobs();return;}
    if(value==='Open in POS'){parent.postMessage({type:'nexora-community-pos'},location.origin);return;}
    if(value==='Post a Job'||value==='Try posting a new job'){jobForm={};navigate('job-create');return;}
    if(value==='View on Community'){parent.postMessage({type:'nexora-community-open',route:'jobs'},location.origin);return;}
    if(isPOS&&value==='Messages'){navigate('chat');return;}
    if(name==='Back to recruitment'){navigate(isPOS?'pos-recruitment':'jobs');return;}
    if(value==='Preview posting'){jobPreview();return;}
    if(value==='Back to edit'){navigate('job-create');restoreJob();return;}
    if(value==='Save draft'){publishJob(true);return;}
    if(value==='Post to NailHub'){publishJob(false);return;}
    if(value==='Choose from salon menu'){stashJob();openDialog('job-services');return;}
    if(value==='Write with AI'){
      var jobTitle=q('#owner-job-title',view),jobEditor=q('.ql-editor[contenteditable="true"]',view);if(!jobTitle.value.trim()){jobTitle.focus();jobTitle.classList.add('community-inline-error');return;}
      var sample=source('job-detail','.ql-editor');if(jobEditor&&sample){jobEditor.textContent=jobTitle.value+'\n\n'+text(sample);jobEditor.dispatchEvent(new Event('input',{bubbles:true}));}return;
    }
    if(b.closest('[aria-label="Desired skills"]')){var checked=b.getAttribute('aria-pressed')==='true';b.setAttribute('aria-pressed',String(!checked));b.classList.toggle('community-selected',!checked);return;}
    if(value==='Choose image'||value==='Take photo'||name==='Attach image'){upload('image/*',false,function(images){if(!images.length)return;var img=el('img','','h-24 w-24 rounded-xl object-cover mt-2');img.src=images[0];img.alt=value||name;b.parentElement.appendChild(img);});return;}
    if(value==='Add'&&route==='job-create'){var container=b.parentElement,input=q('input',container);if(input&&input.value.trim()){container.after(el('p',input.value.trim(),'text-sm text-nexoraBrand'));input.value='';}return;}
    if(b.classList.contains('ql-bold')||b.classList.contains('ql-italic')||b.classList.contains('ql-underline')){document.execCommand(b.classList.contains('ql-bold')?'bold':b.classList.contains('ql-italic')?'italic':'underline');return;}
    if(value==='Undo'||value==='Redo'){document.execCommand(value.toLowerCase());return;}
    if(/^Applicants/.test(value)){openDialog('job-applicants');return;}
    if(value==='Close recruitment'){var jobItem=b.closest('li');var jobId=jobItem&&jobItem.dataset.localJob||'source';if(!state.closed.includes(jobId))state.closed.push(jobId);save();replaceText(jobItem,'Recruiting','Closed');b.disabled=true;return;}
    if(value==='Edit'&&(route==='jobs-my-posts'||route==='pos-recruitment')){var item=b.closest('li');var existing=state.jobs.find(function(j){return item&&j.id===item.dataset.localJob;});jobForm={editId:existing?existing.id:'source','owner-job-title':existing?existing.title:text(q('h3',item)),content:existing?existing.content:''};navigate('job-create');restoreJob();return;}
    if(route==='jobs-my-posts'&&b.closest('[aria-label="Post status"]')){selectChip(b,b.parentElement);qa('section[aria-label="My posts"] > ul > li',view).forEach(function(c){c.classList.toggle('community-hidden',value!=='All'&&!text(c).includes(value));});return;}
    if(value==='Post a shift'){openDialog('shift-create');return;}
    if(route==='shift'&&['Upcoming','Past','Cancelled'].includes(value)){shiftFilter=value;render();if(value==='Cancelled'){var s=q('section[aria-labelledby="owner-shifts-title"]',view);qa('[data-local-shift],button[aria-expanded]',s).forEach(function(c){c.remove();});}return;}
    if(value==='Cancellation policy'){var policy=q('#shift-policy-title',view),section=policy&&policy.closest('section');if(section){section.hidden=!section.hidden;b.setAttribute('aria-expanded',String(!section.hidden));}return;}
    if(route==='shift'&&b.getAttribute('aria-expanded')!==null&&b.closest('section[aria-labelledby="owner-shifts-title"]')){var expanded=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!expanded));var detail=b.nextElementSibling;if(expanded&&detail&&detail.dataset.shiftExpanded!==undefined)detail.remove();else if(!expanded){detail=el('p','No techs yet.','rounded-xl bg-white p-4 text-sm text-nexoraMuted');detail.dataset.shiftExpanded='';b.after(detail);}return;}
    if(b.closest('[aria-label="Payment direction"]')){selectChip(b,b.parentElement);return;}
    if(name==='Back to messages'){navigate('connect');return;}
    if(route==='connect'&&b.closest('li')){navigate('chat');return;}
    if(route==='chatgroups'&&b.closest('li')&&!['Join','Joined'].includes(value)){navigate('chat');return;}
    if(name==='Send message'){sendMessage();return;}
    if(name==='Search in chat'){var chat=q('.header-message-chat',view),old=q('[data-chat-search]',chat);if(old){old.remove();return;}var search=el('input');search.type='search';search.placeholder='Search in chat';search.dataset.chatSearch='';search.className='m-3 rounded-lg border border-nexoraBorder p-2';q('.header-message-chat-head',chat).after(search);search.focus();return;}
    // Calling controls are retained from staging; the local prototype has no realtime call service.
    if(/^Voice call|^Video call/.test(name))return;
    if(name==='Message options'){var row=b.closest('[id^="chat-message"]');if(row){row.classList.toggle('community-selected');}return;}
    if(value==='Change nickname'){var nickRoot=openDialog('nickname');q('#connect-nickname',nickRoot).value=state.nickname;return;}
    if(['Share ID','Share','Copy link'].includes(value)){var link=new URL('community.html?tab=connect',location.href).href;if(navigator.clipboard)navigator.clipboard.writeText(link).catch(function(){});return;}
    if(['NX-1001','713-555-0144','name@email.com'].includes(value)){var searchField=q('input[type="search"]',view);if(searchField){searchField.value=value;searchField.dispatchEvent(new Event('input',{bubbles:true}));}return;}
  });
  function sendMessage(){var input=q('.header-message-chat input[placeholder="Type a message..."]',view)||q('.header-message-chat textarea',view);if(!input||!input.value.trim())return;var content=input.value.trim();state.messages.push({text:content,created:new Date().toISOString()});save();var container=q('.header-message-chat-thread-list',view);if(container){container.appendChild(el('p',content,'community-message'));container.scrollTop=container.scrollHeight;}input.value='';var send=button(view,'Send message');if(send)send.disabled=true;}
  document.addEventListener('submit',function(e){e.preventDefault();if(e.target.closest('.header-message-chat'))sendMessage();});
  document.addEventListener('input',function(e){
    var input=e.target;input.classList.remove('community-inline-error');
    if(input.matches('section[aria-label="Browse jobs"] input[type="search"]')){page=1;renderJobs();}
    if(input.matches('section[aria-label="My posts"] input[type="search"]')){var search=input.value.toLowerCase();qa('section[aria-label="My posts"] > ul > li',view).forEach(function(c){c.classList.toggle('community-hidden',!text(c).toLowerCase().includes(search));});}
    if(input.id==='composer-content'){compose.content=input.value;var counter=q('[aria-live]',input.parentElement)||qa('p',input.parentElement).find(function(p){return /\/ 1500/.test(text(p));});if(counter)counter.textContent=input.value.length+' / 1500';}
    if(input.matches('article[data-post] textarea')){var postButton=button(input.closest('article'),'Post');if(postButton)postButton.disabled=!input.value.trim();}
    if(input.id==='community-report-reason'){var reportButton=button(dialogs,'Send report');if(reportButton)reportButton.disabled=!input.value.trim();}
    if(input.id==='connect-nickname'){var saveButton=button(dialogs,'Save');if(saveButton)saveButton.disabled=!/^[a-z0-9.]{3,20}$/.test(input.value.trim())||input.value===state.nickname;}
    if(input.id==='connect-group-title'){var createButton=button(dialogs,'Create');if(createButton)createButton.disabled=!input.value.trim();}
    if(input.matches('.header-message-chat input,.header-message-chat textarea')){var send=button(view,'Send message');if(send)send.disabled=!input.value.trim();}
    if(input.dataset.chatSearch!==undefined){qa('[id^="chat-message-"]',view).forEach(function(row){row.classList.toggle('community-hidden',!text(row).toLowerCase().includes(input.value.toLowerCase()));});}
    if(input.matches('input[type="search"]')&&input.closest('#community-dialogs')&&modal==='job-services'){qa('[aria-label="Salon services"] li',dialogs).forEach(function(li){li.classList.toggle('community-hidden',!text(li).toLowerCase().includes(input.value.toLowerCase()));});}
    if(route==='job-create'){
      var quick=q('[aria-labelledby="owner-job-quick-preview-title"]',view);if(input.id==='owner-job-title'&&quick){var title=q('p.font-black',quick);if(title)title.textContent=input.value||'Your job title appears here';}
      if(input.classList.contains('ql-editor')){var counter=qa('p[aria-live]',view).find(function(p){return /\/ 5000/.test(text(p));});if(counter)counter.textContent=text(input).length+' / 5000';var undo=button(view,'Undo');if(undo)undo.disabled=false;}
    }
    if(route==='connect'&&input.matches('input[type="search"]')){var term=input.value.toLowerCase();qa('ul li',view).filter(function(li){return !li.closest('nav[aria-label="Community sections"]');}).forEach(function(li){li.classList.toggle('community-hidden',!!term&&!text(li).toLowerCase().includes(term));});}
  });
  document.addEventListener('focusin',function(e){var input=e.target;if(input.dataset.isoValue!==undefined){input.type='date';input.value=input.dataset.isoValue;}});
  document.addEventListener('focusout',function(e){var input=e.target;if(input.type==='date'){input.dataset.isoValue=input.value;input.type='text';input.value=input.dataset.isoValue?date(input.dataset.isoValue+'T12:00:00'):'';}});
  document.addEventListener('change',function(e){var input=e.target;
    if(route==='jobs'&&input.tagName==='SELECT'){page=1;renderJobs();}
    if(route==='job-preview'&&input.type==='checkbox'){var publish=button(view,'Post to NailHub');if(publish)publish.disabled=!input.checked;}
    if(input.id==='owner-job-salary-type'){var salary=q('#owner-job-weekly-salary');if(salary)salary.disabled=input.selectedIndex!==0;}
    if(route==='privacy'&&input.id.startsWith('privacy-')){state.privacy[input.id]=input.value;save();}
    if(modal==='shift-create'&&input.type==='radio'){qa('input[type="radio"]',dialogs).forEach(function(r){if(r!==input)r.checked=false;});}
    if(modal==='job-services'&&input.type==='checkbox'){var count=qa('input[type="checkbox"]:checked',dialogs).length;var summary=qa('p',dialogs).find(function(p){return /services selected/.test(text(p));});if(summary)summary.textContent=count+' services selected';}
    if(modal==='job-services'&&input.tagName==='SELECT'){var selected=text(input.options[input.selectedIndex]);qa('[aria-label="Salon services"] li',dialogs).forEach(function(li){li.classList.toggle('community-hidden',selected!=='All groups'&&!text(li).includes(selected));});}
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){closeDialog();return;}
    if(e.key==='Enter'&&!e.shiftKey&&e.target.closest('.header-message-chat')&&e.target.matches('input,textarea')){e.preventDefault();sendMessage();}
    if(e.key==='Tab'&&modal){var focusable=qa('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]',dialogs).filter(function(n){return n.offsetParent!==null;});if(!focusable.length)return;var first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
  dialogs.addEventListener('click',function(e){if(e.target.classList.contains('community-overlay'))closeDialog();});
  window.addEventListener('message',function(event){if(event.source!==parent||event.origin!==location.origin||!event.data)return;if(event.data.type==='nexora-community-navigate'){feedFilter='All';navigate(event.data.route,false,event.data.group);}});
  window.addEventListener('popstate',function(){var params=new URLSearchParams(location.search);navigate(params.get('tab')||'feed',false,params.get('group'));});
  var initialParams=new URLSearchParams(location.search);
  navigate(initialParams.get('tab')||'feed',false,initialParams.get('group'));
  if(parent!==window)parent.postMessage({type:'nexora-community-ready'},location.origin);
})();
