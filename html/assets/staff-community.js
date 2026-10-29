(function () {
  'use strict';

  const routes = new Set([
    'feed', 'groups', 'mkt', 'market', 'pages', 'blog', 'jobs', 'profile', 'shift', 'deals', 'dcats',
    'dwish', 'dmatch', 'dopen', 'dlast', 'dlastt', 'dwallet', 'connect',
    'chatgroups', 'calls', 'privacy', 'learning', 'events'
  ]);
  const labels = {
    pages:'Pages',blog:'Blog',market:'Groups & Market',feed: 'Community', groups: 'Groups & Market', jobs: 'Jobs',
    profile: 'Tech Profile', shift: 'Extra Shifts', deals: 'Deals & Coupons',
    connect: 'Messages & Calls', learning: 'Learning', events: 'Events'
  };
  const previews = [];

  function validRoute(route) {
    if (route === 'learn') route = 'learning';
    return routes.has(route) ? route : null;
  }

  function menuRoute(route) {
    if (route === 'mkt'||route === 'market') return 'groups';
    if (['chatgroups', 'calls', 'privacy'].includes(route)) return 'connect';
    if (route.startsWith('d')) return 'deals';
    return route;
  }

  function update(preview, route) {
    preview.route = route;
    const active = menuRoute(route);
    preview.shell.dataset.staffMenuActive = active;
    preview.shell.querySelector('[data-staff-community-title]').textContent = labels[active];
    const full=new URL('staff-community.html',location.href);full.searchParams.set('role','tech');full.searchParams.set('tab',route);for(const [key,value]of Object.entries(preview.context||{}))if(value)full.searchParams.set(key,value);preview.shell.querySelector('[data-staff-community-fullscreen]').href=full.href;
    preview.shell.querySelectorAll('[data-staff-sidebar] summary[data-current-group]').forEach(summary => summary.removeAttribute('data-current-group'));
    preview.shell.querySelectorAll('[data-staff-sidebar] [data-staff-community-tab]').forEach(link => {
      const selected = link.dataset.staffCommunityTab === active;
      link.classList.toggle('bg-white/10', selected);
      link.classList.toggle('text-white', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      const group = link.closest('details');
      if (selected && group) { group.open = true; group.querySelector('summary').setAttribute('data-current-group', 'true'); }
    });
  }

  function send(preview) {
    if (!preview.ready) return;
    if(preview.hub){const context=preview.route==='profile'?{jobsTab:'profile'}:{};preview.hub.navigate(preview.route==='profile'?'jobs':preview.route,{...preview.context,...context});return;}
    preview.frame.contentWindow.postMessage({
      type: 'nexora-community-navigate', route: preview.route
    }, preview.origin === 'null' ? '*' : preview.origin);
  }

  document.querySelectorAll('[data-staff-community-shell]').forEach(shell => {
    const frame = shell.querySelector('[data-staff-community-frame]');
    const native=frame.hasAttribute('data-community-preview');
    const source = new URL(native?'staff-community.html?tab='+frame.dataset.communityPreview:frame.src, location.href);
    const loaded = frame.contentDocument;
    const preview = {
      shell, frame, origin: source.origin,context:{},history:[],
      route: validRoute(source.searchParams.get('tab')) || 'feed',
      ready: !!loaded && loaded.readyState === 'complete' && loaded.URL === source.href
    };
    previews.push(preview);
    update(preview, preview.route);

    if(native){const start=()=>window.NEXORA_COMMUNITY_HUB.mount(frame,{params:new URLSearchParams({tab:preview.route,role:'staff',member:'David Le',account:'business',embedded:'1'}),notify:message=>{if(message.type==='nexora-community-route'){const route=validRoute(message.route);if(route){if(route!==preview.route)preview.history.push(preview.route);update(preview,route);}}if(message.type==='nexora-community-back'){update(preview,preview.history.pop()||'feed');send(preview);}if(message.type==='nexora-community-context'){const context=message.context||{};if(context.closeDetail){for(const key of ['groupId','jobId','shiftId','assignmentId','settlementId','invitationId'])delete preview.context[key];}else preview.context={...context};update(preview,preview.route);}}}).then(hub=>{preview.hub=hub;preview.ready=true;send(preview);});if(window.NEXORA_COMMUNITY_HUB)start();else{window.communityPreviewLoader||=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='../assets/community-v2/community-hub.js?v=20261029-community-dev-handoff-v9';script.onload=resolve;script.onerror=reject;document.head.append(script);});window.communityPreviewLoader.then(start).catch(console.error);}}
    frame.addEventListener('load', function () {
      preview.ready = true;
      send(preview);
    });
    shell.addEventListener('click', function (event) {
      const link = event.target.closest('[data-staff-community-tab]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const route = validRoute(link.dataset.staffCommunityTab);
      if (!route) return;
      event.preventDefault();
      update(preview, route);
      send(preview);
      shell.querySelector('[data-staff-sidebar] [data-staff-menu-close]')?.click();
    });
    send(preview);
  });

  window.addEventListener('message', function (event) {
    const preview = previews.find(item => item.frame.contentWindow === event.source);
    if (!preview || !preview.ready || event.origin !== preview.origin) return;
    const message = event.data || {};
    if (message.type !== 'nexora-community-route') return;
    const route = validRoute(message.route);
    if (route) update(preview, route);
  });
})();
