(function () {
  'use strict';

  var frame = document.querySelector('#community-staging, #community-hub, [data-community-v2]');
  if (!frame) return;
  var origin = location.protocol === 'file:' ? '*' : location.origin;
  var componentURL=new URL('community/community-hub.js?v=20261109-desktop-parity1',document.currentScript.src);
  var hub=null,clearPostOnBack=false,detailBackPending=false,clearContextOnBack=false,closedJobsTab=null;
  function clearContextLink(){var url=new URL(location.href);for(var key of ['groupId','jobId','shiftId','assignmentId','settlementId','invitationId'])url.searchParams.delete(key);history.replaceState(history.state,'',url);clearContextOnBack=false;}
  function clearPostLink(){var url=new URL(location.href);for(var key of ['post','postId','comment','commentId','thread','threadId'])url.searchParams.delete(key);history.replaceState(history.state,'',url);clearPostOnBack=false;}
  function clearDetailState(){if(history.state?.communityDetail){var state=Object.assign({},history.state);delete state.communityDetail;history.replaceState(state,'',location.href);}}
  var current = '';
  var detailOpen = false;
  var ready = false;
  function accountType() {
    var declared = new URLSearchParams(location.search).get('account');
    if (declared === 'personal' || declared === 'business') return declared;
    return window.NEXORA_SHELL?.activePage === 'staff' && window.NEXORA_SHELL.salonLinked === false ? 'personal' : 'business';
  }
  var routes = ['feed', 'groups', 'market', 'pages', 'deals', 'jobs', 'shift', 'blog', 'connect', 'chatgroups', 'contacts', 'calls', 'privacy', 'food', 'realestate', 'shop', 'transfer', 'reels', 'live', 'news', 'wallet', 'wheel', 'meet', 'account', 'assistant', 'notifications', 'stories', 'friends', 'people', 'post', 'page-tools', 'group-tools', 'food-market', 'explore'];
  var aliases = {mkt:'market', fanpage:'pages', daywork:'shift', shifts:'shift', profile:'jobs', 'jobs-my-posts':'jobs', 'jobs-applied':'jobs', 'shift-payments':'shift', learning:'feed', events:'feed', explore:'feed', dcats:'deals', dmatch:'deals', dopen:'deals', dlast:'deals', dlastt:'deals', dlastb:'deals', dcamp:'deals', dwallet:'deals', dcreate:'deals', dmanage:'deals', dredeem:'deals', dwish:'deals'};

  var contextKeys=['dealTab','groupId','jobsTab','jobId','profileRequired','shiftTab','shiftId','assignmentId','settlementId','invitationId','listingId','meetingId','meetView','recordId','wheelTab','foodPostId','reelId','pageId','pageTab','pageMode','pageScope','groupTab','composeKind','marketType','storyId','composeStory','personId','peopleView','friendsView','liveId','liveOwner','liveView','composeLive','claimOffer','editId','modal'];
  // Only Community is cloned. Other business tools retain their original destinations.
  var cloneRoot=new URL('./',location.href),pagesRoot=new URL('../pages/',cloneRoot);
  var clonePages=new Set(['community.html','community.htm','staff-community.html','index.html']);
  function syncShellLinks(){
    document.querySelectorAll('.shell a[href],.shell form[action]').forEach(function(node){
      var attribute=node.tagName==='FORM'?'action':'href',value=node.getAttribute(attribute);
      if(!value||/^(?:#|javascript:|mailto:|tel:)/i.test(value))return;
      var target=new URL(value,location.href),name=target.pathname.split('/').pop();
      if(target.origin===location.origin&&target.pathname===cloneRoot.pathname+name&&/\.html?$/.test(name)&&!clonePages.has(name)){
        // The shared header selects icon colors using the original relative href.
        if(node.matches('.shell-workspace-actions a'))node.style.color=getComputedStyle(node).color;
        target.pathname=pagesRoot.pathname+name;node.setAttribute(attribute,target.href);
      }
    });
  }
  new MutationObserver(syncShellLinks).observe(document.querySelector('.shell'),{childList:true,subtree:true});
  syncShellLinks();
  function routeContext(){var query=new URLSearchParams(location.search),result={};for(var key of contextKeys)if(query.has(key))result[key]=query.get(key);return result;}
  function route(value) {
    value = aliases[value] || value;
    return routes.indexOf(value) >= 0 && window.NEXORA_COMMUNITY_SHARED.canAccessFeature(value) ? value : 'feed';
  }
  function sidebar(value) {
    if (value === 'market') return 'groups';
    return ['chatgroups', 'contacts', 'calls', 'privacy'].indexOf(value) >= 0 ? 'connect' : value;
  }
  function send(type, values) {
    if(hub){if(type==='nexora-community-navigate')hub.navigate(values.route,values.context);if(type==='nexora-community-language')hub.setLanguage(values.language);if(type==='nexora-community-close-detail')hub.closeDetail();}
  }
  function show(value, fromFrame, replace) {
    var next = route(value);
    var changed = next !== current;
    current = next;
    var url = new URL(location.href);
    url.searchParams.set('account', accountType());
    url.searchParams.set('tab', next);if(next!=='friends')url.searchParams.delete('friendsView');if(!['pages','page-tools'].includes(next))for(var pageKey of ['pageId','pageMode','pageTab'])url.searchParams.delete(pageKey);var legacy={profile:['jobsTab','profile'],'jobs-my-posts':['jobsTab','myPosts'],'jobs-applied':['jobsTab','applied'],'shift-payments':['shiftTab','payments']}[value];if(legacy)url.searchParams.set(legacy[0],legacy[1]);
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
    if(data.type==='nexora-community-context'){var url=new URL(location.href),ctx=data.context||{};if(ctx.closeDetail){clearContextOnBack=detailOpen||detailBackPending;for(var key of ['groupId','jobId','shiftId','assignmentId','settlementId','invitationId'])url.searchParams.delete(key);}else{var keys=Object.hasOwn(ctx,'dealTab')?['dealTab']:Object.hasOwn(ctx,'jobsTab')?['jobsTab','jobId','profileRequired']:Object.hasOwn(ctx,'shiftTab')?['shiftTab','shiftId','assignmentId','settlementId','invitationId']:contextKeys;for(var key of keys){if(ctx[key])url.searchParams.set(key,ctx[key]);else url.searchParams.delete(key);}}history.replaceState(history.state,'',url);}
    if(data.type==='nexora-community-pos'&&window.NEXORA_COMMUNITY_SHARED.canAccessFeature('posRecruitment'))location.href='../pages/pos-recruitment.html';
    if (data.type === 'nexora-community-route' && ready) show(data.route, true, Boolean(data.replace));
    if(data.type==='nexora-feed-post-close'){clearPostOnBack=true;if(!detailOpen&&!detailBackPending)clearPostLink();}
    if (data.type === 'nexora-community-detail') {
      var open = Boolean(data.open);
      document.body.classList.toggle('community-detail-open',open);
      if (open && !detailOpen && !detailBackPending) pushCommunityState({community:current, communityDetail:true}, '', location.href);
      detailOpen = open;
      if (!open && !detailBackPending && history.state && history.state.communityDetail) {
        // Closing a saved Jobs form pops its modal entry, but keeps the resulting workspace.
        closedJobsTab=current==='jobs'?new URLSearchParams(location.search).get('jobsTab'):null;
        detailBackPending=true;history.back();
      }
      else if(!open&&clearPostOnBack&&!detailBackPending)clearPostLink();
    }
    if(data.type==='nexora-community-history-back'){if(history.state?.communityPrevious||history.length>1&&document.referrer)history.back();else receiveHubEvent({type:'nexora-community-back'});return;}
    if (data.type === 'nexora-community-back') {
      var pageParams=new URLSearchParams(location.search);if(pageParams.get('pageId')){navigatePage({pageId:pageParams.get('pageMode')==='edit'?pageParams.get('pageId'):'',pageMode:'view',pageScope:pageParams.get('pageScope')||'discover'});return;}
      if (history.state && history.state.communityPrevious) history.back();
      else show('feed', false, true);
    }
  }
  window.addEventListener('popstate', function () {
    if(clearPostOnBack)clearPostLink();if(clearContextOnBack)clearContextLink();
    if(detailBackPending){
      detailBackPending=false;
      clearDetailState();
      if(closedJobsTab){var jobsURL=new URL(location.href);jobsURL.searchParams.set('jobsTab',closedJobsTab);history.replaceState(history.state,'',jobsURL);closedJobsTab=null;}
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
    var originalTab=new URLSearchParams(location.search).get('tab');var dealAlias={dcats:'industry',dmatch:'match',dopen:'opening',dwallet:'wallet',dwish:'saved',dcreate:'create',dmanage:'manage',dredeem:'redeem',dcamp:'campaign'}[originalTab];if(dealAlias){var dealUrl=new URL(location.href);dealUrl.searchParams.set('dealTab',dealAlias);history.replaceState(history.state,'',dealUrl);}var originalUrl=new URL(location.href);var legacyContext={profile:['jobsTab','profile'],'jobs-my-posts':['jobsTab','myPosts'],'jobs-applied':['jobsTab','applied'],'shift-payments':['shiftTab','payments']}[originalTab];if(legacyContext){originalUrl.searchParams.set(legacyContext[0],legacyContext[1]);history.replaceState(history.state,'',originalUrl);}
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
      console.error('Community could not load.',error);
      var message=document.createElement('p');message.setAttribute('role','alert');message.textContent='Something went wrong. Please try again.';
      var retry=document.createElement('button');retry.type='button';retry.textContent='Try again';retry.addEventListener('click',function(){location.reload();});
      (frame.shadowRoot||frame).replaceChildren(message,retry);
      frame.dataset.communityReady='true';
    });
  }
  recordInitialRoute();
})();
