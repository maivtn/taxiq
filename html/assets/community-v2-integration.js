(function () {
  'use strict';

  var frame = document.querySelector('#community-staging, #community-hub, [data-community-v2]');
  if (!frame) return;
  var origin = location.protocol === 'file:' ? '*' : location.origin;
  var componentURL=new URL('community-v2/community-hub.js?v=20261030-mobile-nav-layout-v36',document.currentScript.src);
  var hub=null,fallbackFrame=null,clearPostOnBack=false,detailBackPending=false,clearContextOnBack=false;
  function clearContextLink(){var url=new URL(location.href);for(var key of ['groupId','jobId','shiftId','assignmentId','settlementId','invitationId'])url.searchParams.delete(key);history.replaceState(history.state,'',url);clearContextOnBack=false;}
  function clearPostLink(){var url=new URL(location.href);for(var key of ['post','postId','comment','commentId','thread','threadId'])url.searchParams.delete(key);history.replaceState(history.state,'',url);clearPostOnBack=false;}
  function clearDetailState(){if(history.state?.communityDetail){var state=Object.assign({},history.state);delete state.communityDetail;history.replaceState(state,'',location.href);}}
  var current = '';
  var detailOpen = false;
  var ready = false;
  var routes = ['feed', 'groups', 'market', 'pages', 'deals', 'jobs', 'shift', 'blog', 'connect', 'chatgroups', 'calls', 'privacy'];
  var aliases = {mkt:'market', fanpage:'pages', daywork:'shift', shifts:'shift', profile:'jobs', 'jobs-my-posts':'jobs', 'jobs-applied':'jobs', 'shift-payments':'shift', learning:'feed', events:'feed', dcats:'deals', dmatch:'deals', dopen:'deals', dlast:'deals', dlastt:'deals', dlastb:'deals', dcamp:'deals', dwallet:'deals', dcreate:'deals', dmanage:'deals', dredeem:'deals', dwish:'deals'};

  var contextKeys=['groupId','jobsTab','jobId','profileRequired','shiftTab','shiftId','assignmentId','settlementId','invitationId'];
  function routeContext(){var query=new URLSearchParams(location.search),result={};for(var key of contextKeys)if(query.has(key))result[key]=query.get(key);return result;}
  function route(value) {
    value = aliases[value] || value;
    return routes.indexOf(value) >= 0 ? value : 'feed';
  }
  function sidebar(value) {
    if (value === 'market') return 'groups';
    return ['chatgroups', 'calls', 'privacy'].indexOf(value) >= 0 ? 'connect' : value;
  }
  function send(type, values) {
    if(hub){if(type==='nexora-community-navigate')hub.navigate(values.route,values.context);if(type==='nexora-community-language')hub.setLanguage(values.language);if(type==='nexora-community-close-detail')hub.closeDetail();}
    else if(fallbackFrame)fallbackFrame.contentWindow.postMessage(Object.assign({type:type},values),origin);
  }
  function show(value, fromFrame, replace) {
    var next = route(value);
    var changed = next !== current;
    current = next;
    var url = new URL(location.href);
    url.searchParams.set('tab', next);if(next!=='pages')for(var pageKey of ['pageId','pageMode','pageTab'])url.searchParams.delete(pageKey);var legacy={profile:['jobsTab','profile'],'jobs-my-posts':['jobsTab','myPosts'],'jobs-applied':['jobsTab','applied'],'shift-payments':['shiftTab','payments']}[value];if(legacy)url.searchParams.set(legacy[0],legacy[1]);
    // Legacy group links retain their group context in the parent URL.
    if(detailBackPending) {
      // Finish the pending modal traversal before writing the next route entry.
    } else if (changed && detailOpen) {
      detailOpen = false;
      history.replaceState({community:next, communityPrevious:true}, '', url);
    } else if (changed && !replace) pushCommunityState({community:next}, '', url);
    else history.replaceState(Object.assign({}, history.state, {community:next}), '', url);
    if (window.NEXORA_SHELL) {
      window.NEXORA_SHELL.activeTab = sidebar(next);
      if (window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(sidebar(next));
    }
    if (ready && !fromFrame) send('nexora-community-navigate', {route:next,context:routeContext()});
    return true;
  }

  window.navigateCommunityHub = function (value) { return show(value, false, false); };
  window.activateCommunityTab = window.navigateCommunityHub;
  if (window.NEXORA_SHELL) {
    window.NEXORA_SHELL.isCommunity = true;
    window.NEXORA_SHELL.onNavigate = window.navigateCommunityHub;
  }
  function communityLanguage(){return 'en';}
  localStorage.setItem('nexora-community-language','en');
  function syncLanguageControl(){
    var select=document.querySelector('.sidebar-account-language select');
    if(!select)return;
    select.querySelector('option[value="vi"]')?.remove();
    select.value=communityLanguage();
  }
  document.addEventListener('change',function(event){
    if(!event.target.matches('.sidebar-account-language select'))return;
    var language='en';event.target.value='en';
    localStorage.setItem('nexora-community-language',language);
    if(ready)send('nexora-community-language',{language:language});
  });
  var sidebarElement=document.querySelector('.sidebar');
  if(sidebarElement)new MutationObserver(syncLanguageControl).observe(sidebarElement,{childList:true,subtree:true});
  syncLanguageControl();
  frame.hidden = false;
  var main=frame.closest('main');
  main.classList.add('community-v2-content');
  var header=document.querySelector('.app-area > .header');
  function enhanceHeaderSearch(){
    var searchInput=header?.querySelector('input[type="search"]');
    var searchArea=searchInput?.closest('form')||searchInput?.closest('.search');
    if(!searchArea||header.querySelector('.community-search-toggle'))return;
    searchArea.classList.add('community-shell-search');
    if(!searchArea.id)searchArea.id='community-shell-search';
    var searchToggle=document.createElement('button');
    searchToggle.type='button';searchToggle.className='icon-button community-search-toggle';
    searchToggle.setAttribute('aria-label',searchInput.getAttribute('aria-label')||searchInput.placeholder);
    searchToggle.setAttribute('aria-controls',searchArea.id);searchToggle.setAttribute('aria-expanded','false');
    searchToggle.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    (header.querySelector('.shell-workspace-actions,.header-actions')||header).prepend(searchToggle);
    function setSearchOpen(open){document.body.classList.toggle('community-search-open',open);searchToggle.setAttribute('aria-expanded',String(open));if(open)searchInput.focus();else searchToggle.focus();}
    searchToggle.addEventListener('click',function(){setSearchOpen(searchToggle.getAttribute('aria-expanded')!=='true');});
    searchArea.addEventListener('keydown',function(event){if(event.key==='Escape'){event.preventDefault();setSearchOpen(false);}});
  }
  enhanceHeaderSearch();
  if(header)new MutationObserver(enhanceHeaderSearch).observe(header,{childList:true,subtree:true});
  function resizeCommunity(){
    var height=window.visualViewport?window.visualViewport.height:window.innerHeight;
    document.documentElement.style.setProperty('--community-viewport-height',Math.round(height)+'px');
    if(header)document.documentElement.style.setProperty('--community-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
  }
  if(header&&window.ResizeObserver)new ResizeObserver(resizeCommunity).observe(header);
  window.addEventListener('resize',resizeCommunity);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',resizeCommunity);
  resizeCommunity();
  document.body.classList.add('community-hub-active');

  function navigatePage(data){
    var pageURL=new URL(location.href);pageURL.searchParams.set('tab','pages');
    if(data.type!=='nexora-community-page-state')for(var previousKey of ['post','postId','comment','commentId','thread','threadId','groupId','jobsTab','jobId','profileRequired','shiftTab','shiftId','assignmentId','settlementId','invitationId'])pageURL.searchParams.delete(previousKey);
    for(var field of ['pageId','pageMode','pageTab','pageScope']){if(typeof data[field]==='string'&&data[field])pageURL.searchParams.set(field,data[field]);else pageURL.searchParams.delete(field);}
    if(!pageURL.searchParams.has('pageId')){pageURL.searchParams.delete('pageMode');pageURL.searchParams.delete('pageTab');}
    if(data.type==='nexora-community-page-state')history.replaceState(history.state,'',pageURL);
    else if(data.replace)location.replace(pageURL);else location.assign(pageURL);
  }
  function receiveHubEvent(data) {
    if(data.type==='nexora-community-page-navigate'||data.type==='nexora-community-page-state'){navigatePage(data);return;}
    if (data.type === 'nexora-community-ready'&&fallbackFrame) {
      ready = true;
      send('nexora-community-language',{language:communityLanguage()});
      send('nexora-community-navigate', {route:current,context:routeContext()});
    }
    if(data.type==='nexora-community-context'){var url=new URL(location.href),ctx=data.context||{};if(ctx.closeDetail){clearContextOnBack=detailOpen||detailBackPending;for(var key of ['groupId','jobId','shiftId','assignmentId','settlementId','invitationId'])url.searchParams.delete(key);}else{var keys=Object.hasOwn(ctx,'jobsTab')?['jobsTab','jobId','profileRequired']:Object.hasOwn(ctx,'shiftTab')?['shiftTab','shiftId','assignmentId','settlementId','invitationId']:contextKeys;for(var key of keys){if(ctx[key])url.searchParams.set(key,ctx[key]);else url.searchParams.delete(key);}}history.replaceState(history.state,'',url);}
    if(data.type==='nexora-community-pos')location.href='pos-recruitment.html';
    if (data.type === 'nexora-community-route' && ready) show(data.route, true, Boolean(data.replace));
    if(data.type==='nexora-feed-post-close'){clearPostOnBack=true;if(!detailOpen&&!detailBackPending)clearPostLink();}
    if (data.type === 'nexora-community-detail') {
      var open = Boolean(data.open);
      document.body.classList.toggle('community-detail-open',open);
      if (open && !detailOpen && !detailBackPending) pushCommunityState({community:current, communityDetail:true}, '', location.href);
      detailOpen = open;
      if (!open && !detailBackPending && history.state && history.state.communityDetail) {detailBackPending=true;history.back();}
      else if(!open&&clearPostOnBack&&!detailBackPending)clearPostLink();
    }
    if (data.type === 'nexora-community-back') {
      var pageParams=new URLSearchParams(location.search);if(pageParams.get('pageId')){navigatePage({pageId:pageParams.get('pageMode')==='edit'?pageParams.get('pageId'):'',pageMode:'view',pageScope:pageParams.get('pageScope')||'discover'});return;}
      if (history.state && history.state.communityPrevious) history.back();
      else show('feed', false, true);
    }
  }
  window.addEventListener('message',function(event){if(fallbackFrame&&event.source===fallbackFrame.contentWindow&&(location.protocol==='file:'||event.origin===location.origin)&&event.data)receiveHubEvent(event.data);});
  window.addEventListener('popstate', function () {
    if(clearPostOnBack)clearPostLink();if(clearContextOnBack)clearContextLink();
    if(detailBackPending){
      detailBackPending=false;
      clearDetailState();
      if(current!==route(new URLSearchParams(location.search).get('tab'))){var url=new URL(location.href);url.searchParams.set('tab',current);pushCommunityState({community:current},'',url);}
      show(current,true,true);
      if(detailOpen)pushCommunityState({community:current,communityDetail:true},'',location.href);
      return;
    }
    var next = new URLSearchParams(location.search).get('tab');
    if (detailOpen) {
      clearContextLink();detailOpen = false;
      send('nexora-community-close-detail');
    }
    show(next, false, true);
  });

  var pushState = history.pushState.bind(history);
  // Mark entries created by this page so Back never leaves Community unexpectedly.
  function pushCommunityState(state, title, url) {
    pushState(Object.assign({}, state, {communityPrevious:true}), title, url);
  }
  // Keep ownership local instead of replacing the browser's history API.
  function recordInitialRoute() {
    clearDetailState();
    var originalTab=new URLSearchParams(location.search).get('tab');var originalUrl=new URL(location.href);var legacyContext={profile:['jobsTab','profile'],'jobs-my-posts':['jobsTab','myPosts'],'jobs-applied':['jobsTab','applied'],'shift-payments':['shiftTab','payments']}[originalTab];if(legacyContext){originalUrl.searchParams.set(legacyContext[0],legacyContext[1]);history.replaceState(history.state,'',originalUrl);}
    show(originalTab, false, true);
    var params=new URLSearchParams(location.search);
    params.set('tab',current);
    if (window.NEXORA_SHELL && window.NEXORA_SHELL.activePage === 'staff') {
      var name = window.NEXORA_SHELL.profileName || document.querySelector('.staff-profile-name')?.textContent;
      if (name&&!params.has('member')) params.set('member', name.trim());params.set('role','staff');params.set('account',window.NEXORA_SHELL.salonLinked===false?'personal':'business');
    }
    function mount(){return window.NEXORA_COMMUNITY_HUB.mount(frame,{params:params,notify:receiveHubEvent});}
    var load=window.NEXORA_COMMUNITY_HUB?Promise.resolve():new Promise(function(resolve,reject){var script=document.createElement('script');script.src=componentURL.href;script.onload=resolve;script.onerror=reject;document.head.append(script);});
    load.then(mount).then(function(api){hub=api;ready=true;send('nexora-community-language',{language:communityLanguage()});send('nexora-community-navigate',{route:current,context:routeContext()});}).catch(function(error){
      console.error('Community native shell could not load; using the standalone preview.',error);
      fallbackFrame=document.createElement('iframe');fallbackFrame.title=frame.getAttribute('aria-label')||'NEXORA Community';fallbackFrame.style.cssText='display:block;width:100%;height:100%;border:0';
      var source=new URL('nexora-community-complete.html',componentURL);params.set('tab',current);params.set('embedded','1');params.set('v','20261029-community-tour-actions-v21');source.search=params.toString();
      (frame.shadowRoot||frame).replaceChildren(fallbackFrame);fallbackFrame.src=source.href;
    });
  }
  recordInitialRoute();
})();
