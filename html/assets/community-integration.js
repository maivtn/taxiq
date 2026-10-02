(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var role = params.get('role') === 'tech' ? 'tech' : 'owner';
  var frame = document.getElementById('community-hub');
  var routes = ['feed', 'groups', 'mkt', 'jobs', 'profile', 'shift', 'deals', 'dcats', 'dmatch', 'dopen', 'dlast', 'dlastt', 'dlastb', 'dcamp', 'dwallet', 'dcreate', 'dmanage', 'dredeem', 'dwish', 'connect', 'chatgroups', 'calls', 'privacy', 'pos', 'kiosk', 'tlib', 'learning', 'events'];
  var ready = false;
  var current = validRoute(params.get('tab'));

  function validRoute(tab) {
    return routes.indexOf(tab) === -1 ? 'feed' : tab;
  }

  function sidebarTab(tab) {
    if (role === 'tech') return 'community';
    if (tab === 'mkt') return 'groups';
    if (tab === 'profile') return 'jobs';
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
    var legacy = current === 'learning' || current === 'events';
    frame.hidden = legacy;
    document.body.classList.toggle('community-hub-active', !legacy);
    syncLocation(current);
    if (!legacy && !frame.getAttribute('src')) {
      frame.src = 'community-hub.html?role=' + role + '&tab=' + encodeURIComponent(current);
    } else if (!legacy && ready && !fromFrame) {
      frame.contentWindow.postMessage({type: 'nexora-community-navigate', route: current}, window.location.origin);
    }
    return !legacy;
  }

  window.navigateCommunityHub = function (tab) { return show(tab, false); };
  window.addEventListener('message', function (event) {
    if (event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
    if (frame.hidden || !event.data || event.data.type !== 'nexora-community-route') return;
    var tab = validRoute(event.data.route);
    if (!show(tab, true)) window.activateCommunityTab(tab);
  });
  frame.addEventListener('load', function () {
    ready = true;
    if (!frame.hidden) show(current, false);
  });
  // Load lazily when opening an existing Learning or Events deep link.
  window.activateCommunityTab(current);
})();
