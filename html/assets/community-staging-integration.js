(function () {
  'use strict';
  var frame = document.getElementById('community-staging');
  var current = '';
  var isPOS = frame.getAttribute('data-context') === 'pos';
  function route(value) {
    var aliases = {mkt:'market',shifts:'shift',profile:'jobs',learning:'feed',events:'feed'};
    value = aliases[value] || value;
    return ['feed','groups','market','jobs','jobs-my-posts','shift','shift-payments','connect','chatgroups','calls','privacy','pos-recruitment'].indexOf(value) < 0 ? 'feed' : value;
  }
  function sidebar(tab) {
    if (tab === 'market') return 'groups';
    if (tab === 'jobs-my-posts') return 'jobs';
    if (tab === 'shift-payments') return 'shift';
    return ['chatgroups','calls','privacy'].indexOf(tab) >= 0 ? 'connect' : tab;
  }
  function show(value, fromFrame, replace) {
    var next = route(value), changed = next !== current;
    current = next;
    var url = new URL(location.href);
    url.searchParams.set('tab', next);
    if (changed && !replace) history.pushState({community:next}, '', url);
    else if (replace) history.replaceState({community:next}, '', url);
    if (!isPOS) {
      window.NEXORA_SHELL.activeTab = sidebar(next);
      if (window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(sidebar(next));
    }
    if (!frame.getAttribute('src')) frame.src = 'community-staging.html?tab=' + encodeURIComponent(next) + (isPOS ? '&context=pos' : '');
    else if (!fromFrame) frame.contentWindow.postMessage({type:'nexora-community-navigate',route:next}, location.origin);
    return true;
  }
  window.navigateCommunityHub = function (tab) { return show(tab, false, false); };
  window.activateCommunityTab = window.navigateCommunityHub;
  window.addEventListener('message', function (event) {
    if (event.source !== frame.contentWindow || event.origin !== location.origin || !event.data) return;
    if (event.data.type === 'nexora-community-route') show(event.data.route, true, false);
    if (event.data.type === 'nexora-community-ready') show(current, false, true);
    if (event.data.type === 'nexora-community-pos') location.href = 'pos-recruitment.html';
    if (event.data.type === 'nexora-community-staff') location.href = 'pos-staff.html';
    if (event.data.type === 'nexora-community-open') location.href = 'community.html?tab=' + encodeURIComponent(event.data.route || 'jobs');
  });
  window.addEventListener('popstate', function () { show(new URLSearchParams(location.search).get('tab'), false, true); });
  show(new URLSearchParams(location.search).get('tab') || (isPOS ? 'pos-recruitment' : 'feed'), false, true);
})();
