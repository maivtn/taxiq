(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var frame = document.getElementById('community-hub');
  var role = (frame.getAttribute('data-community-role') || params.get('role')) === 'tech' ? 'tech' : 'owner';
  var routes = ['feed', 'groups', 'mkt', 'jobs', 'profile', 'shift', 'deals', 'dcats', 'dmatch', 'dopen', 'dlast', 'dlastt', 'dlastb', 'dcamp', 'dwallet', 'dcreate', 'dmanage', 'dredeem', 'dwish', 'connect', 'chatgroups', 'calls', 'privacy', 'pos', 'kiosk', 'tlib', 'learning', 'events'];
  var ready = false;
  var current = validRoute(params.get('tab'));

  function validRoute(tab) {
    if (tab === 'learn') tab = 'learning';
    return routes.indexOf(tab) === -1 ? 'feed' : tab;
  }

  function sidebarTab(tab) {
    if (tab === 'mkt') return 'groups';
    if (tab === 'profile') return role === 'tech' ? 'profile' : 'jobs';
    if (['chatgroups', 'calls', 'privacy'].indexOf(tab) !== -1) return 'connect';
    if (tab.charAt(0) === 'd' || ['pos', 'kiosk', 'tlib'].indexOf(tab) !== -1) return 'deals';
    return tab;
  }

  function syncLocation(tab) {
    var url = new URL(window.location.href);
    url.searchParams.set('role', role);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
    if (window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(sidebarTab(tab));
  }

  function show(tab, fromFrame) {
    current = validRoute(tab);
    frame.hidden = false;
    document.body.classList.add('community-hub-active');
    syncLocation(current);
    if (!frame.getAttribute('src')) {
      frame.src = 'community-hub.html?role=' + role + '&tab=' + encodeURIComponent(current);
    } else if (ready && !fromFrame) {
      frame.contentWindow.postMessage({type: 'nexora-community-navigate', route: current}, window.location.origin);
    }
    return true;
  }

  window.navigateCommunityHub = function (tab) { return show(tab, false); };
  window.addEventListener('message', function (event) {
    if (event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
    if (!ready || frame.hidden || !event.data || event.data.type !== 'nexora-community-route') return;
    var tab = validRoute(event.data.route);
    show(tab, true);
  });
  frame.addEventListener('load', function () {
    ready = true;
    if (!frame.hidden) show(current, false);
  });
  // Every Community section stays inside the same hub.
  show(current, false);
})();
