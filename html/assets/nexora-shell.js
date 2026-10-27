/* ==========================================================================
   Nexora shared shell — sidebar + header renderer
   Single source of truth for the merchant sidebar + top header. Include on any
   page that has <aside class="sidebar"> and <header class="header">; this
   replaces their contents with the shared shell so every page stays in sync.

   Per-page config (set BEFORE this script runs):
     window.NEXORA_SHELL = {
       activePage: 'booking' | 'community' | 'reward' | 'pos' | 'analytics' | 'review' | 'packages' | 'stations' | 'news-library' | 'owner-settings' | 'staff',
                                           // which functional group is native
       activeTab:  '<tabId>',              // initial highlighted sub-item
       showClearStorage: true,             // optional header action for local development
       onNavigate: function (tabId) {}     // optional; defaults to window.activateMainTab
     };
   Exposes window.NEXORA_SHELL.setActiveTab(tabId) so a page can keep the
   sidebar highlight in sync when its top tabs change.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.NEXORA_SHELL || {};
  var activePage = cfg.activePage || '';

  var PAGES = {
    dashboard: 'dashboard.html',
    booking: 'booking-book-phase-1.html',
    community: 'community.html',
    reward: 'salon-setup-reward.html',
    pos: 'pos-phase-1.html',
    analytics: 'pos-shop-income-report.html',
    review: 'nexora-review.html',
    packages: 'nexora-packages.html',
    stations: 'qr-stations.html',
    'news-library': 'news-library.html',
    'owner-settings': 'owner-setting.html'
  };

  var SIDEBAR_VISIBILITY_STORAGE_KEY = 'nexora.sidebar.visibility.v1';
  var SIDEBAR_EXPANDED_STORAGE_KEY = 'nexora.sidebar.expanded.v1';

  // Single source of truth for the whole sidebar.
  // group.page === activePage  -> native group: open, sub-items drive this page's tabs
  // group.page (other page)     -> foreign group: keeps its state, links across pages
  // group without page          -> section links (no destination yet)
  var COMMUNITY_ITEMS = [
      { label: 'Feed', tab: 'feed' },
      { label: 'Groups & Market', tab: 'groups' },
      { label: 'Jobs', tab: 'jobs' },
      { label: 'Extra shifts', tab: 'shift' },
      { label: 'Deals & Coupons', tab: 'deals', disabled: true, title: 'Coming soon' },
      { label: 'Messages & Calls', tab: 'connect' }
    ];

  // Sidebar groups and labels mirror the merchant navigation on Nexora Touch.
  var NAV = [
    { type: 'item', key: 'home', label: 'Home', icon: 'home' },
    { type: 'item', key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', page: 'dashboard' },
    { type: 'group', key: 'community', label: 'Community', icon: 'users-round', page: 'community', items: COMMUNITY_ITEMS },
    { type: 'group', key: 'booking', label: 'AI Hub', icon: 'sparkles', items: [
      { label: 'OneQR', page: 'stations', tab: 'one-qr', href: 'qr-stations.html' },
      { label: 'Reviews', page: 'review', tab: 'reviews', href: 'nexora-review.html' },
      { label: 'Analytics', placeholder: true }
    ] },
    { type: 'group', key: 'pos', label: 'POS', icon: 'store', page: 'pos', items: [
      { label: 'Front Desk', pages: ['pos', 'booking'], tab: 'front-desk', href: 'pos-front-desk.html' },
      { label: 'Customers', pages: ['pos', 'booking'], tab: 'customers', href: 'booking-book-phase-1.html?tab=customers' },
      { label: 'Call Log', page: 'booking', tab: 'calllog', href: 'booking-book-phase-1.html?tab=calllog' },
      { label: 'Salon Settings', pages: ['pos', 'booking'], tab: 'salon-settings', href: 'pos-salon-settings.html' },
      { label: 'Report', tab: 'report', href: 'pos-shop-income-report.html' },
      { label: 'Promotions', pages: ['pos', 'reward'], tab: 'promotions', href: 'reward-promotions.html' },
      { label: 'SMS Campaigns', page: 'booking', tab: 'sms-campaigns', href: 'nexora-sms-dashboard.html' },
      { label: 'Loyalty', page: 'reward', tab: 'loyalty', href: 'salon-setup-reward.html' },
      { label: 'Gift Card Center', placeholder: true },
      { label: 'Printer', tab: 'printer' }
    ] },
    { type: 'group', key: 'payments', label: 'Payments & Payouts', icon: 'wallet', items: [
      { label: 'Overview' },
      { label: 'Receive Payments', page: 'stations', tab: 'receive-payments', href: 'qr-stations.html?tab=accept-payment' },
      { label: 'Payment Activity' },
      { label: 'Tips', page: 'stations', tab: 'tips', href: 'qr-stations.html?tab=qr-stations' },
      { label: 'Payroll' },
      { label: 'Direct Savings' },
      { label: 'Category Management' }
    ] },
    { type: 'item', key: 'news-library', label: 'News & Library', icon: 'newspaper', page: 'news-library' },
    { type: 'item', key: 'support', label: 'Support', icon: 'circle-question-mark' },
    // Keep the locked visibility key; Setting is always reachable in the account menu.
    { type: 'item', key: 'settings', label: 'Settings', icon: 'settings', page: 'owner-settings', accountOnly: true }
  ];

  var treeNav = window.NEXORA_SHELL_NAV;
  var workspace = activePage === 'staff' ? 'staff' : (cfg.workspace || (activePage === 'pos' ? 'pos' : 'salon'));
  cfg.workspace = workspace;
  function visit(nodes, callback) {
    nodes.forEach(function (node) { callback(node); if (node.children) visit(node.children, callback); });
  }
  if (treeNav && activePage !== 'staff') {
    NAV = treeNav.nodes;
    visit(NAV, function (node) { node.type = node.children ? 'group' : 'item'; node.items = node.children; });
  }
  function routeActive(node) {
    if (!node.href || /^(?:https?:|\.\.\/)/.test(node.href)) return false;
    try {
      var current = new URL(window.location.href), target = new URL(node.href, current);
      if (target.pathname !== current.pathname) return false;
      if (target.pathname.endsWith('/dashboard.html')) return (target.searchParams.get('module') || '') === (current.searchParams.get('module') || '') && (!target.searchParams.has('section') || target.searchParams.get('section') === current.searchParams.get('section'));
      var matches = function(url) { return Array.from(url.searchParams).every(function(pair) { var value = current.searchParams.get(pair[0]); if (pair[0] === 'view' && value === null && current.pathname.endsWith('/booking-book-phase-1.html')) value = 'today'; return value === pair[1]; }); };
      if (!matches(target)) return false;
      var moreSpecific = false;
      if (treeNav && !node.children) visit(NAV, function(other) {
        if (!other.href || other.children || /^(?:https?:|\.\.\/)/.test(other.href)) return;
        var url = new URL(other.href, current);
        if (url.pathname === target.pathname && url.searchParams.size > target.searchParams.size && matches(url)) moreSpecific = true;
      });
      return !moreSpecific;
    } catch (_) { return false; }
  }

  function itemPages(node, item) {
    return item.pages || [item.page || node.page];
  }

  function itemIsActive(node, item, tab) {
    return itemPages(node, item).indexOf(activePage) !== -1 && !!item.tab && item.tab === tab;
  }

  function groupIsActive(node, tab) {
    return node.type === 'group' && node.items.some(function (item) { return routeActive(item) || itemIsActive(node, item, tab) || groupIsActive(item, tab); });
  }

  var expandedGroups = {};
  try {
    var savedGroups = JSON.parse(window.sessionStorage.getItem(SIDEBAR_EXPANDED_STORAGE_KEY) || '{}');
    if (savedGroups && typeof savedGroups === 'object') Object.keys(savedGroups).forEach(function (key) { if (typeof savedGroups[key] === 'boolean') expandedGroups[key] = savedGroups[key]; });
    visit(NAV, function (node) {
      if (node.type === 'group' && savedGroups && typeof savedGroups[node.key] === 'boolean') {
        expandedGroups[node.key] = savedGroups[node.key];
      }
    });
  } catch (e) {}

  function sidebarRoute() {
    var params = new URLSearchParams(window.location.search || '');
    return (window.location.pathname || '') + '|' + ['module', 'section', 'group', 'tab', 'view', 'bookingView'].map(function(key) { return params.get(key) || ''; }).join('|') + '|' + activeTab;
  }

  function normalizeExpandedGroups(preferActive) {
    if (activePage === 'staff') return;
    function normalize(nodes) {
      var groups = nodes.filter(function(node) { return node.type === 'group'; });
      var selected = preferActive && groups.find(function(node) { return groupIsActive(node, activeTab); });
      selected = selected || groups.find(function(node) { return expandedGroups[node.key] === true; });
      groups.forEach(function(node) {
        expandedGroups[node.key] = node === selected;
        normalize(node.children || node.items || []);
      });
    }
    normalize(NAV);
  }

  function saveExpandedGroups() {
    if (activePage === 'staff') return;
    try { window.sessionStorage.setItem(SIDEBAR_EXPANDED_STORAGE_KEY, JSON.stringify(expandedGroups)); } catch (e) {}
  }

  var LOCKED_SIDEBAR_KEYS = { settings: true };

  function sidebarNodeKey(node) {
    return node && node.key ? String(node.key) : '';
  }

  function sidebarMenuItemFromNode(node) {
    var key = sidebarNodeKey(node);
    return {
      key: key,
      label: node.label,
      locked: !!LOCKED_SIDEBAR_KEYS[key]
    };
  }

  var SIDEBAR_MENU_ITEMS = [];
  visit(NAV, function (node) { if (node.type !== 'divider') SIDEBAR_MENU_ITEMS.push(sidebarMenuItemFromNode(node)); });

  function sidebarMenuKeyMap() {
    var map = {};
    SIDEBAR_MENU_ITEMS.forEach(function (item) { map[item.key] = item; });
    return map;
  }

  function storage() {
    try { return window.localStorage || null; } catch (e) { return null; }
  }

  function normalizeHiddenSidebarKeys(keys) {
    var valid = sidebarMenuKeyMap();
    var seen = {};
    var hidden = [];
    if (!Array.isArray(keys)) return hidden;
    keys.forEach(function (rawKey) {
      var key = String(rawKey || '');
      if (!key || seen[key] || !valid[key] || valid[key].locked) return;
      seen[key] = true;
      hidden.push(key);
    });
    return hidden;
  }

  function getHiddenSidebarKeys() {
    var store = storage();
    if (!store) return [];
    try {
      var raw = store.getItem(SIDEBAR_VISIBILITY_STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      if (Array.isArray(data)) return normalizeHiddenSidebarKeys(data);
      if (data && Array.isArray(data.hiddenKeys)) return normalizeHiddenSidebarKeys(data.hiddenKeys);
      if (data && Array.isArray(data.hidden)) return normalizeHiddenSidebarKeys(data.hidden);
    } catch (e) {
      return [];
    }
    return [];
  }

  function legacyHiddenSidebarKeys(store) {
    try {
      var data = JSON.parse(store.getItem(SIDEBAR_VISIBILITY_STORAGE_KEY) || '[]');
      var keys = Array.isArray(data) ? data : (data.hiddenKeys || data.hidden || []);
      var valid = sidebarMenuKeyMap();
      return keys.filter(function(key) { return typeof key === 'string' && !valid[key]; });
    } catch (_) { return []; }
  }

  function setHiddenSidebarKeys(keys) {
    var hiddenKeys = normalizeHiddenSidebarKeys(keys);
    var store = storage();
    if (store) {
      try { store.setItem(SIDEBAR_VISIBILITY_STORAGE_KEY, JSON.stringify({ hiddenKeys: hiddenKeys.concat(legacyHiddenSidebarKeys(store)) })); } catch (e) {}
    }
    return hiddenKeys;
  }

  function hiddenSidebarKeySet() {
    var hidden = {};
    getHiddenSidebarKeys().forEach(function (key) { hidden[key] = true; });
    return hidden;
  }

  function visibleNav() {
    var hidden = hiddenSidebarKeySet();
    var nodes = [];
    NAV.forEach(function (node) {
      if (node.type === 'divider') {
        if (nodes.length && nodes[nodes.length - 1].type !== 'divider') nodes.push(node);
        return;
      }
      if (node.accountOnly || hidden[sidebarNodeKey(node)]) return;
      nodes.push(node);
    });
    while (nodes.length && nodes[nodes.length - 1].type === 'divider') nodes.pop();
    return nodes;
  }

  // Resolve the initial active tab: ?tab= wins, then config.
  var urlTab = '';
  try { urlTab = new URLSearchParams(window.location.search).get('tab') || ''; } catch (e) { urlTab = ''; }

  // A ?tab= no sub-item owns (stale bookmark, typo) must not win: the page falls back to its
  // own default tab, so honouring the bad value here would leave the sidebar highlighting
  // nothing while a panel is plainly on screen.
  var nativeTabs = [];
  visit(NAV, function (node) {
    if (node.type !== 'group' || !node.items) return;
    node.items.forEach(function (item) {
      if (item.tab && itemPages(node, item).indexOf(activePage) !== -1) nativeTabs.push(item.tab);
    });
  });
  if (cfg.isCommunity && activePage === 'staff') {
    nativeTabs = COMMUNITY_ITEMS.map(function (item) { return item.tab; }).concat(['profile']);
  }
  function sidebarTab(tab) {
    if (!tab) return '';
    if (treeNav && activePage !== 'staff') return tab;
    if (activePage === 'reward') return tab === 'promotions' ? 'promotions' : 'loyalty';
    if (activePage === 'review') return 'reviews';
    if (activePage === 'analytics') return 'analytics';
    if (activePage === 'stations') {
      if (tab === 'accept-payment') return 'receive-payments';
      return 'one-qr';
    }
    if (activePage === 'booking') {
      if (tab === 'booking') return 'front-desk';
      if (tab === 'settings') return 'salon-settings';
    }
    if (activePage === 'pos' && ['checkin', 'todaybooking', 'tickets', 'booking', 'clock', 'dispatch', 'appointments', 'estimate', 'turnboard', 'turn-board', 'checkout', 'completed-services'].indexOf(tab) !== -1) return 'front-desk';
    return tab;
  }
  urlTab = sidebarTab(urlTab);
  if (urlTab && nativeTabs.length && nativeTabs.indexOf(urlTab) === -1) urlTab = '';

  var activeTab = urlTab || sidebarTab(cfg.activeTab) || ({pos: 'front-desk', booking: 'front-desk', review: 'reviews', analytics: 'analytics', stations: 'one-qr', reward: 'loyalty', community: 'feed'}[activePage] || '');
  normalizeExpandedGroups(true);
  var lastSidebarRoute = sidebarRoute();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function iconWrap(icon) {
    return '<span class="sidebar-icon-wrap"><i class="lucide-menu-icon" data-lucide="' + esc(icon) + '" aria-hidden="true"></i></span>';
  }

  var CARET = '<svg class="nav-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>';

  function renderFlat(node) {
    var inner = iconWrap(node.icon) + '<span>' + esc(node.label) + '</span>';
    if (node.page) {
      var active = node.page === activePage;
      var href = PAGES[node.page] || '#';
      return '<a class="nav-item' + (active ? ' is-active' : '') + '" href="' + href + '">' + inner + '</a>';
    }
    return '<button class="nav-item" type="button">' + inner + '</button>';
  }

  function renderGroup(node) {
    var isNative = groupIsActive(node, activeTab);
    var expanded = expandedGroups[node.key] === true;
    var subId = 'nexora-subnav-' + node.key;

    var btn = '<button class="nav-item nav-parent' + (expanded ? ' is-expanded' : '') + (isNative ? ' is-active' : '') + '" type="button" data-sidebar-key="' + esc(node.key) + '"'
      + ' data-nav-group aria-expanded="' + (expanded ? 'true' : 'false') + '" aria-controls="' + subId + '">'
      + iconWrap(node.icon) + '<span>' + esc(node.label) + '</span>' + CARET + '</button>';

    var items = node.items.map(function (it) {
      var inner = '<span>' + esc(it.label) + '</span>';
      if (it.placeholder) return '<button class="nav-subitem" type="button">' + inner + '</button>';
      if (it.disabled) return '<button class="nav-subitem" type="button" disabled title="' + esc(it.title || '') + '">' + inner + '</button>';
      if (it.href) {
        var hrefActive = itemIsActive(node, it, activeTab);
        return '<a class="nav-subitem' + (hrefActive ? ' is-active' : '') + '"' + (it.tab ? ' data-shell-active-tab="' + esc(it.tab) + '" data-shell-pages="' + esc(itemPages(node, it).join(' ')) + '"' : '') + ' href="' + esc(it.href) + '">' + inner + '</a>';
      }
      if (node.page && node.page !== activePage) {
        // foreign group -> cross-page link
        var href = PAGES[node.page] + (it.tab ? ('?tab=' + encodeURIComponent(it.tab)) : '');
        return '<a class="nav-subitem" href="' + href + '">' + inner + '</a>';
      }
      if (node.page === activePage && it.tab) {
        var on = it.tab === activeTab;
        return '<button class="nav-subitem' + (on ? ' is-active' : '') + '" type="button" data-shell-tab="' + esc(it.tab) + '">' + inner + '</button>';
      }
      // section link without a destination yet
      return '<button class="nav-subitem" type="button">' + inner + '</button>';
    }).join('');

    return btn + '<div class="nav-subnav' + (expanded ? '' : ' is-collapsed') + '" id="' + subId + '" data-nav-subnav><div class="nav-subnav-inner">' + items + '</div></div>';
  }

  var TREE_ICONS = {home:'house', dashboard:'layout-dashboard', onboarding:'rocket', pos:'monitor', payments:'wallet-cards', community:'users-round', aihub:'sparkles', marketing:'megaphone', 'ai-voice':'headset', news:'newspaper', spinwheel:'circle-dot', oneqr:'qr-code', tools:'briefcase-business', reviews:'star', analytics:'chart-no-axes-combined', taxiq:'file-text', support:'life-buoy', settings:'settings'};
  function treeIcon(node) {
    return iconWrap(node.key === 'business-tools' ? 'briefcase-business' : (TREE_ICONS[node.iconKey] || 'circle'));
  }

  function renderTree(nodes, depth) {
    var hidden = hiddenSidebarKeySet();
    return nodes.filter(function (node) { return !node.accountOnly && !hidden[node.key]; }).map(function (node) {
      var active = node.href && node.href.indexOf('&view=') !== -1 ? routeActive(node) : node.page === activePage && node.tab ? node.tab === activeTab : routeActive(node);
      var label = ((depth === 0 || node.showIcon) && node.iconKey ? treeIcon(node) : '') + '<span class="shell-tree-label">' + esc(node.label) + '</span>' + (node.externalIndicator || node.newTab ? '<i class="sidebar-external-icon" data-lucide="arrow-up-right" aria-hidden="true"></i>' : '');
      var cls = depth ? 'nav-subitem' : 'nav-item';
      if (node.children) {
        var open = expandedGroups[node.key] === true, id = 'nexora-subnav-' + node.key;
        var ancestor = groupIsActive(node, activeTab);
        return '<div class="shell-tree-branch" data-depth="' + depth + '"><div class="shell-tree-row">' +
          (node.href ? '<a class="' + cls + (active ? ' is-active' : '') + '" href="' + esc(node.href) + '"' + (active ? ' aria-current="page"' : '') + '>' + label + '</a>' : '') +
          '<button class="' + cls + ' nav-parent' + (open ? ' is-expanded' : '') + (ancestor ? ' is-active' : '') + '" type="button" data-sidebar-key="' + esc(node.key) + '" data-nav-group aria-expanded="' + open + '" aria-controls="' + id + '"' + (node.href ? ' aria-label="' + esc(node.label) + '"' : '') + '>' + (node.href ? '' : label) + CARET + '</button></div>' +
          '<div class="nav-subnav' + (open ? '' : ' is-collapsed') + '" id="' + id + '" data-nav-subnav><div class="nav-subnav-inner">' + renderTree(node.children, depth + 1) + '</div></div></div>';
      }
      if (node.availability === 'unavailable') return '<button type="button" class="' + cls + '" data-shell-key="' + esc(node.key) + '" disabled>' + label + '</button>';
      if (!node.href) return '';
      var native = node.page === activePage && node.tab && node.href.split('?')[0] === (window.location.pathname || '').split('/').pop() && node.href.indexOf('&view=') === -1 && (typeof cfg.onNavigate === 'function' || typeof window.activateMainTab === 'function');
      return '<' + (native ? 'button type="button" data-shell-tab="' + esc(node.tab) + '"' : 'a href="' + esc(node.href) + '"' + (node.newTab ? ' target="_blank" rel="noopener noreferrer"' : '')) + ' class="' + cls + (active ? ' is-active' : '') + '" data-shell-key="' + esc(node.key) + '"' + (!native && node.page && node.tab && node.href.indexOf('&view=') === -1 ? ' data-shell-active-tab="' + esc(node.tab) + '" data-shell-pages="' + esc(node.page) + '"' : '') + (active ? ' aria-current="page"' : '') + '>' + label + (node.availability === 'preview' ? '<small class="shell-preview-tag">PREVIEW</small>' : '') + '</' + (native ? 'button' : 'a') + '>';
    }).join('');
  }

  function renderNav() {
    if (treeNav) return renderTree(visibleNav().filter(function(node) { return node.key !== 'public-home'; }), 0);
    return visibleNav().map(function (node) {
      if (node.type === 'divider') return '<div class="nav-divider"></div>';
      if (node.type === 'group') return renderGroup(node);
      return renderFlat(node);
    }).join('');
  }

  function renderMerchantSidebarHtml() {
    var home = treeNav && visibleNav().find(function(node) { return node.key === 'public-home'; });
    var injectedSalon = window.NEXORA_ACTIVE_SALON;
    var catalogSalon;
    try { catalogSalon = window.NEXORA_SALON_DATA && window.NEXORA_SALON_DATA.loadCatalog().salon; } catch (_) {}
    var salon = injectedSalon || catalogSalon;
    var salonName = salon && typeof salon.name === 'string' && salon.name.trim() ? salon.name.trim() : 'Bitcoin Nail Bar';
    var salonAvatar = salonName === 'Bitcoin Nail Bar' ? '<img class="sidebar-salon-logo" src="../assets/bitcoin-nailbar-logo.png" alt="">' : '<span class="avatar">' + esc(salonName.split(/\s+/).slice(0, 2).map(function(word) { return word[0]; }).join('')) + '</span>';
    return (treeNav ? '<div class="sidebar-brand"><img src="../assets/nexora-touch-logo.png" alt="Nexora Touch"></div>' + (home ? '<div class="sidebar-public-home">' + renderTree([home], 0) + '</div>' : '') : '') +
      '<div class="sidebar-account">' +
      '<button class="sidebar-panel sidebar-account-toggle" type="button" aria-label="Account menu" aria-expanded="false" aria-controls="nexora-account-menu" data-shell-account-toggle>' +
        (treeNav ? '<span class="profile-row">' + salonAvatar + '<span class="sidebar-salon-copy"><small class="sidebar-salon-kicker">CURRENT SALON</small><span class="profile-name">' + esc(salonName) + '</span></span></span>' : '<span class="profile-row"><span class="avatar">NT</span><span class="profile-name">NEXORA TOUCH</span></span>') + CARET +
      '</button>' +
      '<div class="sidebar-account-menu" id="nexora-account-menu" hidden>' +
        '<a href="owner-setting.html"><i data-lucide="settings" aria-hidden="true"></i><span>' + (treeNav ? 'Settings' : 'Setting') + '</span></a>' +
        '<a href="owner-setting.html?tab=business-verification"><i data-lucide="badge-check" aria-hidden="true"></i><span>' + 'Business Verification' + '</span></a>' +
      '</div>' +
      '</div>' +
      (treeNav ? '<div class="sidebar-section-label">Platform</div>' : '') +
      '<nav class="sidebar-nav" aria-label="Main menu">' + renderNav() + '</nav>' +
      '<div class="sidebar-panel plan-panel"><span class="plan-icon"><i data-lucide="crown" aria-hidden="true"></i></span>' +
        '<div class="plan-info"><div class="panel-title" title="Professional Pro">Professional Pro</div></div>' +
        '<button class="plan-button" type="button">' + 'Manage' + '</button>' +
      '</div>' +
      '<div class="sidebar-footer"><button class="logout-button" type="button"><span class="logout-icon"><i data-lucide="log-out" aria-hidden="true"></i></span><span>' + 'Sign out' + '</span></button></div>';
  }

  function renderStaffCommunityMenu() {
    var native = !!cfg.isCommunity;
    var active = native && COMMUNITY_ITEMS.some(function (item) { return item.tab === activeTab; });
    var open = active || !!cfg.expandCommunity;
    return '<button class="nav-item nav-parent staff-nav-item' + (open ? ' is-expanded' : '') + (active ? ' is-active' : '') + '" type="button" data-staff-group="community" data-nav-group aria-expanded="' + open + '" aria-controls="staff-subnav-community">' +
      iconWrap('users-round') + '<span>Community</span>' + CARET + '</button>' +
      '<div class="nav-subnav' + (open ? '' : ' is-collapsed') + '" id="staff-subnav-community" data-nav-subnav><div class="nav-subnav-inner">' +
      COMMUNITY_ITEMS.map(function (item) {
        var content = '<span>' + esc(item.label) + '</span>';
        if (item.disabled) return '<button class="nav-subitem" type="button" disabled title="' + esc(item.title) + '">' + content + '</button>';
        if (native) return '<button class="nav-subitem' + (activeTab === item.tab ? ' is-active' : '') + '" type="button" data-shell-tab="' + item.tab + '">' + content + '</button>';
        return '<a class="nav-subitem" href="staff-community.html?role=tech&amp;tab=' + item.tab + '">' + content + '</a>';
      }).join('') + '</div></div>';
  }

  var STAFF_WORKSPACE_ITEMS = [
    {label: 'My Salons', tab: 'my-salons', href: 'my-salons.html'},
    {label: 'My QR', tab: 'my-qr', href: 'staff-app.html#staff-my-qr-screen'},
    {label: 'My Earnings', tab: 'my-earnings'},
    {label: 'My Reviews', tab: 'my-reviews'},
    {label: 'Report', tab: 'report'}
  ];

  function renderStaffWorkspaceMenu() {
    var active = STAFF_WORKSPACE_ITEMS.some(function (item) { return item.tab === activeTab; });
    var open = active || !!cfg.expandWorkspace;
    return '<button class="nav-item nav-parent staff-nav-item' + (open ? ' is-expanded' : '') + (active ? ' is-active' : '') + '" type="button" data-staff-group="workspace" data-nav-group aria-expanded="' + open + '" aria-controls="staff-subnav-workspace">' +
      iconWrap('briefcase-business') + '<span>My Workspace</span>' + CARET + '</button>' +
      '<div class="nav-subnav' + (open ? '' : ' is-collapsed') + '" id="staff-subnav-workspace" data-nav-subnav><div class="nav-subnav-inner">' +
      STAFF_WORKSPACE_ITEMS.map(function (item) {
        var content = '<span>' + item.label + '</span>';
        var attributes = ' class="nav-subitem' + (activeTab === item.tab ? ' is-active' : '') + '" data-staff-nav="' + item.tab + '"';
        return item.href ? '<a' + attributes + ' href="' + item.href + '">' + content + '</a>' : '<button' + attributes + ' type="button">' + content + '</button>';
      }).join('') + '</div></div>';
  }

  var STAFF_SIDEBAR_HTML =
    '<div class="sidebar-panel staff-profile-panel">' +
      '<div class="staff-profile-row"><div class="staff-avatar">N2</div><div class="staff-profile-copy">' +
        '<div class="staff-profile-name">nexora 2</div>' +
        '<div class="staff-profile-id">Staff ID: NAIE5LMVX</div>' +
      '</div><i class="staff-profile-chevron" data-lucide="chevron-down" aria-hidden="true"></i></div>' +
    '</div>' +
    '<nav class="sidebar-nav staff-sidebar-nav" aria-label="Staff menu">' +
      '<a class="nav-item staff-nav-item" href="staff-app.html#staff-home-screen" data-staff-nav="home">' + iconWrap('home') + '<span>Home</span></a>' +
      '<a class="nav-item staff-nav-item' + (activeTab === 'dashboard' ? ' is-active' : '') + '" href="staff-dashboard.html" data-staff-nav="dashboard">' + iconWrap('layout-dashboard') + '<span>Dashboard</span></a>' +
      renderStaffCommunityMenu() +
      renderStaffWorkspaceMenu() +
      '<a class="nav-item staff-nav-item' + (activeTab === 'my-tickets' ? ' is-active' : '') + '" href="staff-work-orders.html" data-staff-nav="my-tickets">' + iconWrap('list-checks') + '<span>My Tickets</span><span class="staff-nav-count" data-staff-ticket-count hidden></span></a>' +
      '<a class="nav-item staff-nav-item' + (activeTab === 'my-calendar' ? ' is-active' : '') + '" href="pos-calendar.html" data-staff-nav="my-calendar">' + iconWrap('calendar-days') + '<span>My Calendar</span></a>' +
      (activeTab === 'staff-handbook' ? '<a class="nav-item staff-nav-item is-active" href="staff-handbook.html" data-staff-nav="staff-handbook">' + iconWrap('book-open-check') + '<span>Staff Handbook</span></a>' : '') +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="tips">' + iconWrap('circle-dollar-sign') + '<span>Tips</span></a>' +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="transactions">' + iconWrap('receipt') + '<span>Transactions</span></a>' +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="payout-methods">' + iconWrap('chart-no-axes-combined') + '<span>Payout Methods</span></a>' +
      '<a class="nav-item staff-nav-item' + (activeTab === 'profile' ? ' is-active' : '') + '" href="staff-community.html?role=tech&amp;tab=profile" data-staff-nav="profile">' + iconWrap('settings') + '<span>Profile</span></a>' +
    '</nav>' +
    '<div class="sidebar-footer"><button class="logout-button" type="button"><span class="logout-icon"><i data-lucide="log-out" aria-hidden="true"></i></span><span>Sign out</span></button></div>';

  var HEADER_HTML =
    '<div class="mobile-brand">' +
      '<button class="icon-button" type="button" data-shell-drawer-open aria-label="Open navigation menu" aria-controls="nexora-sidebar" aria-expanded="false">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
      '</button>' +
      '<img class="brand-logo" src="../assets/nexora-logo.svg" alt="Nexora Logo">' +
    '</div>' +
    '<label class="search">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
      '<input type="search" placeholder="Search tech, station, review...">' +
    '</label>' +
    (cfg.showClearStorage ?
      '<div class="header-actions"><button class="shell-clear-storage-button" type="button" data-shell-clear-storage aria-label="Clear local storage">' +
        '<i data-lucide="trash-2" aria-hidden="true"></i><span>Clear local storage</span>' +
      '</button></div>' : '');

  function merchantHeader() {
    var pos = workspace === 'pos';
    return '<div class="mobile-brand"><button class="icon-button" type="button" data-shell-drawer-open aria-label="Open navigation menu" aria-controls="nexora-sidebar" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' + '</button><a href="dashboard.html"><img class="brand-logo" src="../assets/nexora-logo.svg" alt="Nexora Touch"></a></div>' +
      '<form class="shell-workspace-search" action="dashboard.html"><label class="search"><i data-lucide="search" aria-hidden="true"></i><input name="q" type="search" aria-label="' + (pos ? 'Search SI POS tools' : 'Search products') + '" placeholder="' + (pos ? 'Search SI POS tools...' : 'Search products or features…') + '" autocomplete="off"' + (pos ? ' data-shell-function-search' : '') + '></label><div class="shell-function-results" hidden></div></form>' +
      '<div class="shell-workspace-actions">' + (cfg.showClearStorage ? '<button class="shell-clear-storage-button" type="button" data-shell-clear-storage aria-label="Clear local storage"><i data-lucide="trash-2" aria-hidden="true"></i><span>Clear local storage</span></button>' : '') + '<a href="owner-setting.html" aria-label="Business settings"><i data-lucide="store" aria-hidden="true"></i></a><a href="news-library.html?tab=news" aria-label="Nexora news"><i data-lucide="bell" aria-hidden="true"></i></a><a href="community.html?tab=connect" aria-label="Community messages"><i data-lucide="messages-square" aria-hidden="true"></i></a><a href="dashboard.html" aria-label="All products"><i data-lucide="grid-3x3" aria-hidden="true"></i></a></div>';
  }

  function navigate(tab) {
    var fn = (typeof cfg.onNavigate === 'function') ? cfg.onNavigate
      : (typeof window.activateMainTab === 'function' ? window.activateMainTab : null);
    if (fn) fn(tab);
  }

  function setActiveTab(tab) {
    tab = sidebarTab(tab);
    activeTab = tab;
    // Several legacy handlers synchronize the URL after invoking this setter.
    if (treeNav && activePage !== 'staff' && typeof window.queueMicrotask === 'function') window.queueMicrotask(function() { if (window.document && window.document.documentElement) refreshSidebar(); });
    var subs = document.querySelectorAll('.sidebar [data-shell-tab], .sidebar [data-shell-active-tab]');
    for (var i = 0; i < subs.length; i++) {
      var pages = subs[i].getAttribute('data-shell-pages');
      var selected = (!pages || pages.split(' ').indexOf(activePage) !== -1) && (subs[i].getAttribute('data-shell-tab') || subs[i].getAttribute('data-shell-active-tab')) === tab;
      subs[i].classList.toggle('is-active', selected);
      if (selected) subs[i].setAttribute('aria-current', 'page'); else subs[i].removeAttribute('aria-current');
    }
    if (activePage === 'staff') {
      var staffItems = document.querySelectorAll('.sidebar [data-staff-nav]');
      for (var j = 0; j < staffItems.length; j++) {
        var current = staffItems[j].getAttribute('data-staff-nav') === tab;
        staffItems[j].classList.toggle('is-active', current);
        if (current) staffItems[j].setAttribute('aria-current', 'page');
        else staffItems[j].removeAttribute('aria-current');
      }
      var staffGroups = {
        community: !!cfg.isCommunity && COMMUNITY_ITEMS.some(function (item) { return item.tab === tab; }),
        workspace: STAFF_WORKSPACE_ITEMS.some(function (item) { return item.tab === tab; })
      };
      Object.keys(staffGroups).forEach(function (key) {
        var parent = document.querySelector('[data-staff-group="' + key + '"]');
        if (!parent) return;
        parent.classList.toggle('is-active', staffGroups[key]);
        if (staffGroups[key]) {
          setGroupExpanded(parent, true);
        }
      });
    } else {
      visit(NAV, function (node) {
        if (node.type !== 'group') return;
        var toggle = document.querySelector('.sidebar [data-sidebar-key="' + node.key + '"]');
        if (!toggle) return;
        var active = groupIsActive(node, tab);
        toggle.classList.toggle('is-active', active);
        if (active) {
          setGroupExpanded(toggle, true);
        }
      });
      saveExpandedGroups();
    }
  }

  function setDrawer(open) {
    var sidebar = document.querySelector('aside.sidebar');
    var backdrop = document.querySelector('.nexora-shell-backdrop');
    var opener = document.querySelector('.header [data-shell-drawer-open]');
    if (sidebar) {
      sidebar.classList.toggle('is-open', open);
      var mobile = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 1366px)').matches;
      sidebar.inert = mobile && !open;
      if (document.body.classList) document.body.classList.toggle('nexora-drawer-open', mobile && open);
      if (mobile && open) { var first = sidebar.querySelector('button, a[href]'); if (first) first.focus(); }
      if (mobile && !open && sidebar.contains && sidebar.contains(document.activeElement) && opener) opener.focus();
    }
    if (backdrop) backdrop.classList.toggle('is-open', open);
    if (opener) {
      opener.setAttribute('aria-expanded', open ? 'true' : 'false');
      opener.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    }
  }

  function setGroupExpanded(toggle, open) {
    var sub = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!sub) return;
    if (open) {
      var parent = toggle.closest('[data-nav-subnav], .sidebar-nav');
      var peers = document.querySelectorAll('.sidebar [data-nav-group]');
      for (var i = 0; i < peers.length; i++) {
        if (peers[i] !== toggle && peers[i].closest('[data-nav-subnav], .sidebar-nav') === parent) setGroupExpanded(peers[i], false);
      }
    }
    sub.classList.toggle('is-collapsed', !open);
    toggle.classList.toggle('is-expanded', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (activePage !== 'staff') expandedGroups[sub.id.replace('nexora-subnav-', '')] = open;
  }

  function wireSidebar() {
    var accountToggle = document.querySelector('[data-shell-account-toggle]');
    var accountMenu = document.getElementById('nexora-account-menu');
    if (accountToggle && accountMenu) {
      accountToggle.addEventListener('click', function () {
        accountMenu.hidden = !accountMenu.hidden;
        accountToggle.setAttribute('aria-expanded', String(!accountMenu.hidden));
      });
      accountToggle.parentNode.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          accountMenu.hidden = true; accountToggle.setAttribute('aria-expanded', 'false'); accountToggle.focus();
        }
      });
    }
    // group expand / collapse
    var toggles = document.querySelectorAll('.sidebar [data-nav-group]');
    for (var i = 0; i < toggles.length; i++) {
      (function (toggle) {
        var sub = document.getElementById(toggle.getAttribute('aria-controls'));
        if (!sub) return;
        toggle.addEventListener('click', function () {
          setGroupExpanded(toggle, toggle.getAttribute('aria-expanded') !== 'true');
          saveExpandedGroups();
        });
      })(toggles[i]);
    }

    if (activePage === 'staff') {
      var openStaffGroup = Array.from(toggles).find(function(toggle) { return toggle.getAttribute('aria-expanded') === 'true'; });
      if (openStaffGroup) setGroupExpanded(openStaffGroup, true);
    }

    // same-page tab sub-items
    var tabs = document.querySelectorAll('.sidebar [data-shell-tab]');
    for (var j = 0; j < tabs.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var tab = btn.getAttribute('data-shell-tab');
          setActiveTab(tab);
          navigate(tab);
          setDrawer(false);
        });
      })(tabs[j]);
    }

    var nativeLinks = document.querySelectorAll('.sidebar a[data-shell-active-tab]');
    for (var k = 0; k < nativeLinks.length; k++) {
      nativeLinks[k].addEventListener('click', function(event) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        var target = new URL(this.href), current = new URL(window.location.href);
        var canNavigate = typeof cfg.onNavigate === 'function' || typeof window.activateMainTab === 'function';
        if (target.pathname !== current.pathname || !canNavigate) return;
        event.preventDefault();
        navigate(this.getAttribute('data-shell-active-tab'));
        setActiveTab(this.getAttribute('data-shell-active-tab'));
        setDrawer(false);
      });
    }

    var planButton = document.querySelector('.sidebar .plan-button');
    if (planButton) {
      planButton.addEventListener('click', function () {
        window.location.href = PAGES.packages + '?tab=overview';
        setDrawer(false);
      });
    }
  }

  function wire() {
    wireSidebar();
    var functionSearch = document.querySelector('[data-shell-function-search]');
    if (functionSearch) {
      var results = document.querySelector('.shell-function-results');
      function updateResults() {
        var normalize = function(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLocaleLowerCase(); };
        var query = normalize(functionSearch.value.trim());
        var matches = [];
        visit(NAV, function(node) { if (query && node.href && normalize(node.label).indexOf(query) !== -1) matches.push(node); });
        results.innerHTML = matches.map(function(node) { return '<a href="' + esc(node.href) + '">' + esc(node.label) + '</a>'; }).join('');
        results.hidden = !matches.length;
      }
      functionSearch.addEventListener('input', updateResults);
      functionSearch.form.addEventListener('submit', function(event) { event.preventDefault(); var first = results.querySelector('a'); if (first) window.location.href = first.href; });
      functionSearch.addEventListener('keydown', function(event) { if (event.key === 'Escape') results.hidden = true; if (event.key === 'ArrowDown') { var first = results.querySelector('a'); if (first) {event.preventDefault();first.focus();} } });
      document.addEventListener('click', function(event) { if (!functionSearch.form.contains(event.target)) results.hidden = true; });
    }
    document.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('.sidebar-account')) return;
      var menu = document.getElementById('nexora-account-menu'), toggle = document.querySelector('[data-shell-account-toggle]');
      if (menu && toggle) { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
    });
    // mobile drawer open / close
    var opener = document.querySelector('.header [data-shell-drawer-open]');
    if (opener) opener.addEventListener('click', function () {
      var sidebar = document.querySelector('aside.sidebar');
      setDrawer(!(sidebar && sidebar.classList.contains('is-open')));
    });
    var backdrop = document.querySelector('.nexora-shell-backdrop');
    if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setDrawer(false);
      if (event.key === 'Tab') {
        var sidebar = document.querySelector('aside.sidebar');
        if (!sidebar || !sidebar.classList.contains('is-open')) return;
        var focusable = Array.from(sidebar.querySelectorAll('a[href], button:not(:disabled), input, select')).filter(function(el) { return el.getClientRects().length > 0; });
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    // Explicitly confirmed reset for the pages that expose this development action.
    var clearStorageButton = document.querySelector('.header [data-shell-clear-storage]');
    if (clearStorageButton) {
      clearStorageButton.addEventListener('click', function () {
        if (typeof window.confirm === 'function' && !window.confirm('Clear all local storage for this site?')) return;
        try {
          window.localStorage.clear();
          var label = clearStorageButton.querySelector('span');
          if (label) label.textContent = 'Storage cleared';
          clearStorageButton.setAttribute('aria-label', 'Local storage cleared');
          clearStorageButton.disabled = true;
        } catch (e) {
          var errorLabel = clearStorageButton.querySelector('span');
          if (errorLabel) errorLabel.textContent = 'Unable to clear storage';
        }
      });
    }
  }

  function refreshSidebar() {
    var sidebar = document.querySelector('aside.sidebar');
    if (!sidebar || activePage === 'staff') return;
    var focused = document.activeElement;
    var focusKey = focused && focused.getAttribute ? focused.getAttribute('data-shell-key') : null;
    var focusGroup = focused && focused.getAttribute ? focused.getAttribute('data-sidebar-key') : null;
    var nav = sidebar.querySelector ? sidebar.querySelector('.sidebar-nav') : null;
    var scrollTop = nav ? nav.scrollTop : 0;
    var restoreFocus = focused && sidebar.contains && sidebar.contains(focused);
    var route = sidebarRoute();
    normalizeExpandedGroups(route !== lastSidebarRoute);
    lastSidebarRoute = route;
    sidebar.innerHTML = renderMerchantSidebarHtml();
    wireSidebar();
    nav = sidebar.querySelector ? sidebar.querySelector('.sidebar-nav') : null;
    if (nav) nav.scrollTop = scrollTop;
    if (restoreFocus && !sidebar.inert) {
      var replacement = focusKey ? sidebar.querySelector('[data-shell-key="' + focusKey + '"]') : focusGroup ? sidebar.querySelector('[data-sidebar-key="' + focusGroup + '"]') : null;
      if (replacement) replacement.focus({preventScroll: true});
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  var staffAssignmentsApi;
  var staffAssignmentsUnsubscribe;
  var staffCountEventsBound = false;

  function refreshStaffTicketCount() {
    var count = document.querySelector('[data-staff-ticket-count]');
    var api = window.NEXORA_SERVICE_ASSIGNMENTS;
    if (!count || !api || typeof api.load !== 'function') return;
    try {
      var state = api.load();
      var session = window.NEXORA_STAFF_SESSION;
      var actorId = session === undefined ? 'kayla' : session && (session.staff && Object.prototype.hasOwnProperty.call(session.staff, 'id') ? session.staff.id : session.technicianId);
      var technician = state.technicians.find(function (item) { return item.id === actorId; });
      var salonId = '';
      if (technician && technician.clockedIn) {
        if (session === undefined) {
          salonId = technician.clockedInSalonId;
          if (salonId === undefined) {
            var assigned = state.tickets.filter(function (ticket) { return ticket.services.some(function (line) { return line.techId === actorId; }); });
            var salonIds = Array.from(new Set((assigned.length ? assigned : state.tickets).map(function (ticket) { return ticket.salonId; }).filter(Boolean)));
            if (salonIds.length === 1) salonId = salonIds[0];
          }
        }
        else {
          var clock = session && session.clockIn;
          if (clock && !clock.endedAt && (!clock.startedAt || Date.parse(clock.startedAt) <= Date.now())) salonId = clock.salonId;
        }
      }
      var timeZone = {golden: 'America/New_York', elite: 'America/Chicago'}[salonId];
      var total = 0;
      if (actorId && timeZone) {
        var parts = new Intl.DateTimeFormat('en-US', {timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date());
        var today = ['year', 'month', 'day'].map(function (type) { return parts.find(function (part) { return part.type === type; }).value; }).join('-');
        state.tickets.forEach(function (ticket) {
          if ((ticket.salonId || 'golden') !== salonId || (ticket.date || state.date) !== today || ticket.payment) return;
          total += ticket.services.filter(function (service) { return service.techId === actorId && service.status !== 'completed'; }).length;
        });
      }
      count.textContent = String(total);
      count.removeAttribute('title');
    } catch (_) {
      count.textContent = '—';
      count.title = 'Unable to load My Tickets';
    }
    count.hidden = false;
  }

  function initStaffTicketCount() {
    if (activePage !== 'staff' || !document.querySelector('[data-staff-ticket-count]')) return;
    function connect() {
      var api = window.NEXORA_SERVICE_ASSIGNMENTS;
      if (!api || typeof api.load !== 'function') return;
      if (staffAssignmentsApi !== api) {
        if (staffAssignmentsUnsubscribe) staffAssignmentsUnsubscribe();
        staffAssignmentsApi = api;
        staffAssignmentsUnsubscribe = typeof api.subscribe === 'function' ? api.subscribe(refreshStaffTicketCount) : null;
      }
      refreshStaffTicketCount();
    }
    if (!staffCountEventsBound) {
      window.addEventListener('focus', connect);
      window.addEventListener('storage', function (event) {
        if (event.key === 'nexora-service-assignments-v1' || event.key === null) connect();
      });
      staffCountEventsBound = true;
    }
    if (window.NEXORA_SERVICE_ASSIGNMENTS) { connect(); return; }
    var script = document.querySelector('script[data-staff-assignments-loader], script[src="../assets/service-assignments.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = '../assets/service-assignments.js';
      script.dataset.staffAssignmentsLoader = '';
      script.addEventListener('load', connect, {once: true});
      document.head.appendChild(script);
    } else script.addEventListener('load', connect, {once: true});
  }

  function init() {
    var sidebar = document.querySelector('aside.sidebar');
    var header = document.querySelector('header.header');
    if (sidebar) sidebar.id = 'nexora-sidebar';
    if (sidebar) sidebar.innerHTML = activePage === 'staff' ? STAFF_SIDEBAR_HTML : renderMerchantSidebarHtml();
    if (document.body.setAttribute) document.body.setAttribute('data-nexora-workspace', workspace);
    if (header) header.innerHTML = treeNav && activePage !== 'staff' ? merchantHeader() : HEADER_HTML;
    saveExpandedGroups();

    // drawer backdrop (once)
    if (!document.querySelector('.nexora-shell-backdrop')) {
      var bd = document.createElement('div');
      bd.className = 'nexora-shell-backdrop';
      document.body.appendChild(bd);
    }

    wire();
    if (activePage === 'staff') setActiveTab(activeTab);
    if (typeof window.matchMedia === 'function') {
      var drawerMedia = window.matchMedia('(max-width: 1366px)');
      var syncDrawer = function() { setDrawer(false); };
      if (drawerMedia.addEventListener) drawerMedia.addEventListener('change', syncDrawer);
      setDrawer(false);
    }
    initStaffTicketCount();
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  // expose the highlight setter so pages can sync on top-tab changes
  window.NEXORA_SHELL = cfg;
  cfg.setActiveTab = setActiveTab;
  cfg.sidebarVisibilityStorageKey = SIDEBAR_VISIBILITY_STORAGE_KEY;
  cfg.sidebarMenuItems = SIDEBAR_MENU_ITEMS.slice();
  cfg.getHiddenSidebarKeys = getHiddenSidebarKeys;
  cfg.setHiddenSidebarKeys = setHiddenSidebarKeys;
  cfg.refreshSidebar = refreshSidebar;

  var shellReady = activePage !== 'staff' && document.querySelector('aside.sidebar') && document.querySelector('header.header');
  if (document.readyState === 'loading' && !shellReady) document.addEventListener('DOMContentLoaded', init);
  else init();
})();
