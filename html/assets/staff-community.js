(function () {
  'use strict';

  const routes = new Set([
    'feed', 'groups', 'mkt', 'jobs', 'profile', 'shift', 'deals', 'dcats',
    'dwish', 'dmatch', 'dopen', 'dlast', 'dlastt', 'dwallet', 'connect',
    'chatgroups', 'calls', 'privacy', 'learning', 'events'
  ]);
  const labels = {
    feed: 'Community', groups: 'Groups & Market', jobs: 'Jobs',
    profile: 'Tech Profile', shift: 'Extra Shifts', deals: 'Deals & Coupons',
    connect: 'Messages & Calls', learning: 'Learning', events: 'Events'
  };
  const previews = [];

  function validRoute(route) {
    if (route === 'learn') route = 'learning';
    return routes.has(route) ? route : null;
  }

  function menuRoute(route) {
    if (route === 'mkt') return 'groups';
    if (['chatgroups', 'calls', 'privacy'].includes(route)) return 'connect';
    if (route.startsWith('d')) return 'deals';
    return route;
  }

  function update(preview, route) {
    preview.route = route;
    const active = menuRoute(route);
    preview.shell.dataset.staffMenuActive = active;
    preview.shell.querySelector('[data-staff-community-title]').textContent = labels[active];
    preview.shell.querySelector('[data-staff-community-fullscreen]').href = 'staff-community.html?role=tech&tab=' + encodeURIComponent(route);
    preview.shell.querySelectorAll('[data-staff-sidebar] [data-staff-community-tab]').forEach(link => {
      const selected = link.dataset.staffCommunityTab === active;
      link.classList.toggle('bg-white/10', selected);
      link.classList.toggle('text-white', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      if (selected) link.closest('details').open = true;
    });
  }

  function send(preview) {
    if (!preview.ready) return;
    preview.frame.contentWindow.postMessage({
      type: 'nexora-community-navigate', route: preview.route
    }, preview.origin === 'null' ? '*' : preview.origin);
  }

  document.querySelectorAll('[data-staff-community-shell]').forEach(shell => {
    const frame = shell.querySelector('[data-staff-community-frame]');
    const source = new URL(frame.src, location.href);
    const loaded = frame.contentDocument;
    const preview = {
      shell, frame, origin: source.origin,
      route: validRoute(source.searchParams.get('tab')) || 'feed',
      ready: !!loaded && loaded.readyState === 'complete' && loaded.URL === source.href
    };
    previews.push(preview);
    update(preview, preview.route);

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
