(function () {
  'use strict';

  var frame = document.querySelector('#community-staging, #community-hub, [data-community-v2]');
  if (!frame) return;
  var origin = location.protocol === 'file:' ? '*' : location.origin;
  var current = '';
  var detailOpen = false;
  var ready = false;
  var routes = ['feed', 'groups', 'market', 'pages', 'deals', 'jobs', 'shift', 'blog', 'connect', 'chatgroups', 'calls', 'privacy'];
  var aliases = {mkt:'market', fanpage:'pages', daywork:'shift', shifts:'shift', profile:'jobs', 'jobs-my-posts':'jobs', 'shift-payments':'shift', learning:'feed', events:'feed', dcats:'deals', dmatch:'deals', dopen:'deals', dlast:'deals', dlastt:'deals', dlastb:'deals', dcamp:'deals', dwallet:'deals', dcreate:'deals', dmanage:'deals', dredeem:'deals', dwish:'deals'};

  function route(value) {
    value = aliases[value] || value;
    return routes.indexOf(value) >= 0 ? value : 'feed';
  }
  function sidebar(value) {
    if (value === 'market') return 'groups';
    return ['chatgroups', 'calls', 'privacy'].indexOf(value) >= 0 ? 'connect' : value;
  }
  function send(type, values) {
    frame.contentWindow.postMessage(Object.assign({type:type}, values), origin);
  }
  function show(value, fromFrame, replace) {
    var next = route(value);
    var changed = next !== current;
    current = next;
    var url = new URL(location.href);
    url.searchParams.set('tab', next);
    // Legacy group links retain their group context in the parent URL.
    if (changed && detailOpen) {
      detailOpen = false;
      history.replaceState({community:next, communityPrevious:true}, '', url);
    } else if (changed && !replace) pushCommunityState({community:next}, '', url);
    else history.replaceState(Object.assign({}, history.state, {community:next}), '', url);
    if (window.NEXORA_SHELL) {
      window.NEXORA_SHELL.activeTab = sidebar(next);
      if (window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(sidebar(next));
    }
    if (ready && !fromFrame) send('nexora-community-navigate', {route:next});
    return true;
  }

  window.navigateCommunityHub = function (value) { return show(value, false, false); };
  window.activateCommunityTab = window.navigateCommunityHub;
  if (window.NEXORA_SHELL) {
    window.NEXORA_SHELL.isCommunity = true;
    window.NEXORA_SHELL.onNavigate = window.navigateCommunityHub;
  }
  function communityLanguage(){return localStorage.getItem('nexora-community-language')==='vi'?'vi':'en';}
  function syncLanguageControl(){
    var select=document.querySelector('.sidebar-account-language select');
    if(!select)return;
    if(!select.querySelector('option[value="vi"]'))select.add(new Option('Tiếng Việt','vi'));
    select.value=communityLanguage();
  }
  document.addEventListener('change',function(event){
    if(!event.target.matches('.sidebar-account-language select'))return;
    var language=event.target.value==='vi'?'vi':'en';
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

  window.addEventListener('message', function (event) {
    if (event.source !== frame.contentWindow || (location.protocol !== 'file:' && event.origin !== location.origin) || !event.data) return;
    var data = event.data;
    if (data.type === 'nexora-community-ready') {
      ready = true;
      send('nexora-community-language',{language:communityLanguage()});
      send('nexora-community-navigate', {route:current});
    }
    if (data.type === 'nexora-community-route' && ready) show(data.route, true, Boolean(data.replace));
    if (data.type === 'nexora-community-detail') {
      var open = Boolean(data.open);
      if (open && !detailOpen) pushCommunityState({community:current, communityDetail:true}, '', location.href);
      detailOpen = open;
      if (!open && history.state && history.state.communityDetail) history.back();
    }
    if (data.type === 'nexora-community-back') {
      if (history.state && history.state.communityPrevious) history.back();
      else show('feed', false, true);
    }
  });
  window.addEventListener('popstate', function () {
    var next = new URLSearchParams(location.search).get('tab');
    if (detailOpen) {
      detailOpen = false;
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
    show(new URLSearchParams(location.search).get('tab'), false, true);
    var source = new URL('../assets/community-v2/nexora-community-complete.html', location.href);
    source.searchParams.set('embedded', '1');
    source.searchParams.set('tab', current);
    source.searchParams.set('v', '20261029-mobile-finish');
    if (window.NEXORA_SHELL && window.NEXORA_SHELL.activePage === 'staff') {
      var name = window.NEXORA_SHELL.profileName || document.querySelector('.staff-profile-name')?.textContent;
      if (name) source.searchParams.set('member', name.trim());
    }
    frame.src = source.href;
  }
  recordInitialRoute();
})();
