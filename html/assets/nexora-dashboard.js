/* Catalog browsing only. Operational data remains owned by the existing stores. */
(function () {
  'use strict';
  var catalog = window.NEXORA_PRODUCT_CATALOG;
  var routes = window.NEXORA_SHELL_NAV;
  var browser = document.getElementById('module-browser');
  var detail = document.getElementById('module-detail');
  if (!catalog || !browser || !detail) return;
  var search = document.getElementById('search'), category = document.getElementById('category');
  var cards = Array.from(document.querySelectorAll('#cards [data-module]'));
  var lastModule = '';
  var moduleOpens = {}, usageKey = 'nexora-dashboard-module-opens-v1';
  try {
    var saved = JSON.parse(localStorage.getItem(usageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) moduleOpens = saved;
  } catch (_) {}
  function openCount(key) { return Number.isSafeInteger(moduleOpens[key]) && moduleOpens[key] > 0 ? moduleOpens[key] : 0; }
  function sortCards() {
    cards.sort(function (a, b) {
      return Number(b.dataset.module === 'pos') - Number(a.dataset.module === 'pos') ||
        Number(catalog[a.dataset.module].availability === 'preview') - Number(catalog[b.dataset.module].availability === 'preview') ||
        openCount(b.dataset.module) - openCount(a.dataset.module) ||
        a.querySelector('.card-name').textContent.localeCompare(b.querySelector('.card-name').textContent, 'en');
    });
    cards.forEach(function (card, index) { card.style.setProperty('--card-index', index); document.getElementById('cards').appendChild(card); });
  }
  function normalize(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase(); }
  function params() { return new URLSearchParams(window.location.search); }
  function updateURL(next, replace) {
    var url = new URL(window.location.href); url.search = next.toString();
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }
  function filterCards() {
    var query = normalize(search.value.trim()), count = 0;
    cards.forEach(function (card) {
      card.hidden = !((category.value === 'all' || card.dataset.category.split(/\s+/).includes(category.value)) && (!query || normalize(card.textContent + ' ' + card.dataset.search).includes(query)));
      if (!card.hidden) count++;
    });
    document.getElementById('result-count').textContent = count + ' products';
    document.getElementById('empty').hidden = count > 0;
    document.getElementById('clear-filter').hidden = !query && category.value === 'all';
  }
  function saveFilters() {
    var next = params();
    if (search.value) next.set('q', search.value); else next.delete('q');
    if (category.value !== 'all') next.set('category', category.value); else next.delete('category');
    updateURL(next, true); filterCards();
  }
  function reset() { search.value = ''; category.value = 'all'; saveFilters(); search.focus(); }
  function actionIcon(kind) {
    return window.NEXORA_ICONS.contentNode(kind || 'tools', { size:36, lazy:true });
  }
  function link(item, index, pos, workflow) {
    var demo = item.demo === 'wheel';
    var href = item.url ? routes.resolve(item.url) : '';
    var unavailable = !!(item.linkPending || item.unavailable || (!href && !demo));
    var node = document.createElement(demo ? 'button' : href && !unavailable ? 'a' : 'div');
    if (demo) { node.type = 'button'; node.addEventListener('click', function () { window.NEXORA_WHEEL_DEMO.open(); }); }
    if (unavailable) node.setAttribute('aria-disabled', 'true');
    node.className = 'detail-link' + (unavailable ? ' unavailable' : '');
    if (pos) {
      node.classList.add('pos-action');
      if (workflow && index === 0) node.classList.add('primary');
      var top = document.createElement('span'); top.className = 'pos-action-top'; top.appendChild(actionIcon(item.icon));
      if (workflow) { var step = document.createElement('span'); step.className = 'pos-action-step'; step.textContent = String(index + 1); step.setAttribute('aria-hidden', 'true'); top.appendChild(step); }
      node.appendChild(top);
    } else {
      var artwork = document.createElement('span'); artwork.className = 'detail-link-icon'; artwork.appendChild(actionIcon(item.icon)); node.appendChild(artwork);
    }
    var copy = document.createElement('span'); copy.className = 'detail-link-copy'; copy.textContent = item.label + (unavailable && !item.linkPending ? ' · unavailable' : ''); node.appendChild(copy);
    if (item.description) { var description = document.createElement('small'); description.textContent = item.description; copy.appendChild(description); }
    if ((href || demo) && !unavailable) {
      if (href) node.href = href;
      if (item.newTab && /^https?:/.test(href)) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
      var arrow = document.createElement('i'); arrow.dataset.lucide = 'arrow-up-right'; arrow.className = 'detail-link-arrow'; arrow.setAttribute('aria-hidden','true'); node.appendChild(arrow);
    }
    return node;
  }
  function renderGroup(product, index) {
    var group = product.groups[index], host = document.getElementById('detail-links');
    var marketingView = product.key === 'aihub' && group.name === 'Marketing Assistant';
    var title = marketingView ? 'AI Marketing Tool' : product.title;
    // The PO marketing deep link has its own presentation within AI Hub.
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-title').prepend(window.NEXORA_ICONS.contentNode(marketingView ? 'marketing' : product.iconKey, { size:42 }));
    document.getElementById('detail-description').textContent = marketingView ? 'Choose an audience, prepare an SMS campaign and review results in one illustrated journey.' : product.description;
    document.getElementById('detail-status').textContent = marketingView ? 'Interface preview' : product.status;
    document.getElementById('detail-status').classList.toggle('pending', marketingView || product.availability === 'preview');
    document.getElementById('detail-product-page').href = marketingView ? 'products/ai-marketing/index.html' : product.landingHref;
    document.title = title + ' · Nexora Touch';
    host.replaceChildren(); host.setAttribute('aria-labelledby', 'module-group-' + index);
    host.id = 'detail-links';
    Array.from(document.querySelectorAll('#detail-tabs button')).forEach(function (tab, i) { tab.setAttribute('aria-selected', String(index === i)); tab.tabIndex = index === i ? 0 : -1; });
    if (group.upcoming) { var note = document.createElement('p'); note.className = 'detail-upcoming'; note.textContent = group.upcoming; host.appendChild(note); }
    (group.sections || [group]).forEach(function (section) {
      var wrap = document.createElement('section'); wrap.className = 'detail-section';
      if (group.sections) { var heading = document.createElement('h3'); heading.textContent = section.name; wrap.appendChild(heading); }
      var list = document.createElement('div'); list.className = 'detail-link-list';
      var pos = product.key === 'pos' && !group.sections;
      list.classList.toggle('pos-actions', pos);
      (section.items || []).forEach(function (item, i) { list.appendChild(link(item, i, pos, pos && index === 0)); });
      wrap.appendChild(list); host.appendChild(wrap);
    });
    if (product.key === 'pos' && index === 0) {
      var panel = document.createElement('section'); panel.className = 'menu-sync-panel';
      panel.innerHTML = '<div><h3>Auto-updating service menu</h3><p>Design preview: each salon has its own menu. Edit services, prices and durations in Salon Settings → Services; the customer menu opens the salon’s Nexora data.</p><small>Bitcoin Nail Bar is the sample salon in this design</small></div><div class="menu-sync-actions"><a href="../menu/menu.html">View customer menu ↗</a><a href="pos-salon-settings.html?section=services">Manage services ↗</a></div>';
      var salon = window.NEXORA_ACTIVE_SALON;
      if (salon && typeof salon.name === 'string' && salon.name.trim()) panel.querySelector('small').textContent = salon.name.trim();
      panel.querySelector('h3').prepend(window.NEXORA_ICONS.contentNode('list', { size:26 }));
      host.appendChild(panel);
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    var marketing = document.getElementById('detail-marketing-preview');
    if (marketing) marketing.hidden = !marketingView;
  }
  function renderRoute(focus) {
    var state = params(), key = state.get('module'), product = Object.prototype.hasOwnProperty.call(catalog, key) && !catalog[key].hidden ? catalog[key] : null;
    search.value = state.get('q') || '';
    category.value = Array.from(category.options).some(function (o) { return o.value === state.get('category'); }) ? state.get('category') : 'all';
    filterCards();
    browser.hidden = !!product; detail.hidden = !product;
    document.title = product ? product.title + ' · Nexora Touch' : 'Nexora Touch - Dashboard';
    window.NEXORA_SHELL?.refreshSidebar?.();
    if (!product) { if (focus && lastModule) document.querySelector('[data-module="' + lastModule + '"]')?.focus(); return; }
    lastModule = product.key;
    document.querySelector('.detail-pos-back').href = 'dashboard.html?module=pos';
    document.querySelector('.detail-pos-back').hidden = product.key === 'pos';
    document.querySelector('#detail-marketing-preview .detail-marketing-heading a').href = 'products/ai-marketing/index.html';
    var tax = document.getElementById('detail-tax-preview'); if (tax) tax.hidden = product.key !== 'taxiq';
    var tabs = document.getElementById('detail-tabs'); tabs.replaceChildren();
    var index = state.get('section') === 'marketing' && product.key === 'aihub' ? 1 : Number(state.get('group')) || 0;
    if (!product.groups[index]) index = 0;
    product.groups.forEach(function (group, i) {
      var tab = document.createElement('button'); tab.type = 'button'; tab.role = 'tab'; tab.id = 'module-group-' + i; tab.textContent = group.name; tab.setAttribute('aria-controls','detail-links');
      function choose() { var next = params(); next.set('group', String(i)); if (product.key === 'aihub' && i === 1) next.set('section', 'marketing'); else next.delete('section'); updateURL(next, true); renderGroup(product, i); window.NEXORA_SHELL?.refreshSidebar?.(); }
      tab.addEventListener('click', choose);
      tab.addEventListener('keydown', function (event) {
        var count = product.groups.length, target = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : event.key === 'ArrowRight' ? (i + 1) % count : event.key === 'ArrowLeft' ? (i + count - 1) % count : -1;
        if (target < 0) return; event.preventDefault(); tabs.children[target].click(); tabs.children[target].focus();
      });
      tabs.appendChild(tab);
    });
    renderGroup(product, index);
    if (focus) detail.focus();
  }
  cards.forEach(function (card) {
    var key = card.dataset.module;
    var cardIcon = card.querySelector('.card-icon');
    cardIcon.replaceChildren(window.NEXORA_ICONS.contentNode(key, {size: 52}));
    card.addEventListener('click', function () {
      moduleOpens[key] = openCount(key) + 1;
      try { localStorage.setItem(usageKey, JSON.stringify(moduleOpens)); } catch (_) {}
      sortCards();
      var next = params(); next.set('module', key); next.delete('section'); next.delete('group'); updateURL(next); renderRoute(true);
    });
  });
  document.getElementById('detail-back').addEventListener('click', function () { var next = params(); ['module','section','group'].forEach(function (key) { next.delete(key); }); updateURL(next); renderRoute(true); });
  search.addEventListener('input', saveFilters); category.addEventListener('change', saveFilters);
  document.getElementById('clear-filter').addEventListener('click', reset);
  document.getElementById('empty-reset').addEventListener('click', reset);
  window.addEventListener('popstate', function () { renderRoute(false); });
  // Keep handoff bookmarks and old product links useful after splitting the PO page.
  if (location.hash && /^(#module-|#pos-|#salon-|#dashboard-onboarding|#modules)/.test(location.hash)) {
    var target = new URL(routes.resolve(location.hash), location.href);
    if (target.pathname !== location.pathname) { location.replace(target.href); return; }
    var next = params(); target.searchParams.forEach(function (value, key) { next.set(key, value); });
    var url = new URL(location.href); url.search = next.toString(); url.hash = ''; history.replaceState({}, '', url);
  }
  sortCards();
  renderRoute(false);
})();
