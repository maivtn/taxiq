/* ==========================================================================
   Nexora shared shell — sidebar + header renderer
   Single source of truth for the merchant sidebar + top header. Include on any
   page that has <aside class="sidebar"> and <header class="header">; this
   replaces their contents with the shared shell so every page stays in sync.

   Per-page config (set BEFORE this script runs):
     window.NEXORA_SHELL = {
       activePage: 'booking' | 'community' | 'reward' | 'pos' | 'review' | 'packages' | 'stations' | 'news-library' | 'owner-settings' | 'staff',
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
    booking: 'booking-book-phase-1.html',
    community: 'community.html',
    reward: 'salon-setup-reward.html',
    pos: 'pos-phase-1.html',
    review: 'nexora-review.html',
    packages: 'nexora-packages.html',
    stations: 'qr-stations.html',
    'news-library': 'news-library.html',
    'owner-settings': 'owner-setting.html'
  };

  var SIDEBAR_VISIBILITY_STORAGE_KEY = 'nexora.sidebar.visibility.v1';

  // Single source of truth for the whole sidebar.
  // group.page === activePage  -> native group: open, sub-items drive this page's tabs
  // group.page (other page)     -> foreign group: collapsed, sub-items link across pages
  // group without page          -> section links (no destination yet)
  var NAV = [
    { type: 'item', key: 'home', label: 'Home', icon: 'home' },
    { type: 'divider' },
    { type: 'item', key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { type: 'group', key: 'payments', label: 'Payments & Payouts', icon: 'wallet', items: [
      { label: 'Overview' },
      { label: 'Customer Payments' },
      { label: 'Tips' },
      { label: 'Payroll' },
      { label: 'Direct Savings' }
    ] },
    { type: 'item', key: 'review', label: 'Reviews', icon: 'star', page: 'review' },
    { type: 'item', key: 'stations', label: 'Stations & QR Codes', icon: 'qr-code', page: 'stations' },
    { type: 'group', key: 'booking', label: 'Ai Hub', icon: 'calendar-days', page: 'booking', items: [
      { label: 'Booking', tab: 'booking' },
      { label: 'Customers', tab: 'customers' },
      { label: 'Call Log', tab: 'calllog' },
      { label: 'SMS Campaigns', tab: 'sms-campaigns' },
      { label: 'QR Codes', tab: 'qr-codes' },
      { label: 'Plans', tab: 'plans' },
      { label: 'Salon Settings', tab: 'settings' }
    ] },
    { type: 'group', key: 'community', label: 'Community', icon: 'users-round', page: 'community', items: [
      { label: 'Feed', tab: 'feed' },
      { label: 'Groups', tab: 'groups' },
      { label: 'Learning', tab: 'learning' },
      { label: 'Jobs', tab: 'jobs' },
      { label: 'Events', tab: 'events' }
    ] },
    { type: 'group', key: 'reward', label: 'Reward', icon: 'gift', page: 'reward', items: [
      { label: 'Overview', tab: 'overview' },
      { label: 'Earn Rules', tab: 'earn-rules' },
      { label: 'Reward Catalog', tab: 'reward-catalog' },
      { label: 'Customers', tab: 'customers' },
      { label: 'Loyalty Activity', tab: 'loyalty-activity' },
      { label: 'Analytics', tab: 'analytics' }
    ] },
    { type: 'item', key: 'pos', label: 'POS', icon: 'monitor', page: 'pos' },
    { type: 'item', key: 'analytics', label: 'Analytics', icon: 'chart-no-axes-combined' },
    { type: 'item', key: 'settings', label: 'Settings', icon: 'settings', page: 'owner-settings' },
    { type: 'item', key: 'news-library', label: 'News & Library', icon: 'newspaper', page: 'news-library' },
    { type: 'item', key: 'support', label: 'Support', icon: 'circle-question-mark' }
  ];

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

  var SIDEBAR_MENU_ITEMS = NAV.filter(function (node) {
    return node.type !== 'divider';
  }).map(sidebarMenuItemFromNode);

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

  function setHiddenSidebarKeys(keys) {
    var hiddenKeys = normalizeHiddenSidebarKeys(keys);
    var store = storage();
    if (store) {
      try { store.setItem(SIDEBAR_VISIBILITY_STORAGE_KEY, JSON.stringify({ hiddenKeys: hiddenKeys })); } catch (e) {}
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
      if (hidden[sidebarNodeKey(node)]) return;
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
  NAV.forEach(function (node) {
    if (node.type !== 'group' || node.page !== activePage || !node.items) return;
    node.items.forEach(function (it) { if (it.tab) nativeTabs.push(it.tab); });
  });
  if (urlTab && nativeTabs.length && nativeTabs.indexOf(urlTab) === -1) urlTab = '';

  var activeTab = urlTab || cfg.activeTab || '';

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
    var isNative = node.page && node.page === activePage;
    var expanded = !!isNative; // active page's own group starts open
    var subId = 'nexora-subnav-' + node.key;

    var btn = '<button class="nav-item nav-parent' + (expanded ? ' is-expanded' : '') + '" type="button"'
      + ' data-nav-group aria-expanded="' + (expanded ? 'true' : 'false') + '" aria-controls="' + subId + '">'
      + iconWrap(node.icon) + '<span>' + esc(node.label) + '</span>' + CARET + '</button>';

    var items = node.items.map(function (it) {
      var inner = '<span class="nav-subitem-dot" aria-hidden="true"></span><span>' + esc(it.label) + '</span>';
      if (node.page && !isNative) {
        // foreign group -> cross-page link
        var href = PAGES[node.page] + (it.tab ? ('?tab=' + encodeURIComponent(it.tab)) : '');
        return '<a class="nav-subitem" href="' + href + '">' + inner + '</a>';
      }
      if (isNative && it.tab) {
        var on = it.tab === activeTab;
        return '<button class="nav-subitem' + (on ? ' is-active' : '') + '" type="button" data-shell-tab="' + esc(it.tab) + '">' + inner + '</button>';
      }
      // section link without a destination yet
      return '<button class="nav-subitem" type="button">' + inner + '</button>';
    }).join('');

    return btn + '<div class="nav-subnav' + (expanded ? '' : ' is-collapsed') + '" id="' + subId + '" data-nav-subnav><div class="nav-subnav-inner">' + items + '</div></div>';
  }

  function renderNav() {
    return visibleNav().map(function (node) {
      if (node.type === 'divider') return '<div class="nav-divider"></div>';
      if (node.type === 'group') return renderGroup(node);
      return renderFlat(node);
    }).join('');
  }

  function renderMerchantSidebarHtml() {
    return '<div class="sidebar-panel">' +
        '<div class="profile-row"><div class="avatar">NT</div><div>' +
          '<div class="profile-name">NEXORA TOUCH</div>' +
          '<div class="profile-email">merchant@nexoratouch.com</div>' +
        '</div></div>' +
      '</div>' +
      '<nav class="sidebar-nav" aria-label="Main menu">' + renderNav() + '</nav>' +
      '<div class="sidebar-panel plan-panel">' +
        '<div class="plan-info"><div class="panel-kicker">Current Plan</div><div class="panel-title">Pro Plan</div></div>' +
        '<button class="plan-button" type="button">Manage</button>' +
      '</div>' +
      '<div class="sidebar-footer"><button class="logout-button" type="button"><span class="logout-icon"><i data-lucide="log-out" aria-hidden="true"></i></span><span>Sign out</span></button></div>';
  }

  var STAFF_SIDEBAR_HTML =
    '<div class="sidebar-panel staff-profile-panel">' +
      '<div class="staff-profile-row"><div class="staff-avatar">N2</div><div class="staff-profile-copy">' +
        '<div class="staff-profile-name">nexora 2</div>' +
        '<div class="staff-profile-id">Staff ID: NAIE5LMVX</div>' +
      '</div><i class="staff-profile-chevron" data-lucide="chevron-down" aria-hidden="true"></i></div>' +
    '</div>' +
    '<nav class="sidebar-nav staff-sidebar-nav" aria-label="Staff menu">' +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="home">' + iconWrap('home') + '<span>Home</span></a>' +
      '<a class="nav-item staff-nav-item' + (activeTab === 'dashboard' ? ' is-active' : '') + '" href="staff-dashboard.html" data-staff-nav="dashboard">' + iconWrap('layout-dashboard') + '<span>Dashboard</span></a>' +
      '<button class="nav-item nav-parent is-expanded staff-nav-item" type="button" data-nav-group aria-expanded="true" aria-controls="staff-subnav-workspace">' +
        iconWrap('briefcase-business') + '<span>My Workspace</span>' + CARET +
      '</button>' +
      '<div class="nav-subnav" id="staff-subnav-workspace" data-nav-subnav><div class="nav-subnav-inner">' +
        '<a class="nav-subitem" href="#" data-staff-nav="my-qr"><span class="nav-subitem-dot" aria-hidden="true"></span><span>My QR</span></a>' +
        '<a class="nav-subitem" href="#" data-staff-nav="my-earnings"><span class="nav-subitem-dot" aria-hidden="true"></span><span>My Earnings</span></a>' +
        '<a class="nav-subitem" href="#" data-staff-nav="my-reviews"><span class="nav-subitem-dot" aria-hidden="true"></span><span>My Reviews</span></a>' +
        '<a class="nav-subitem' + (activeTab === 'my-salons' ? ' is-active' : '') + '" href="my-salons.html" data-staff-nav="my-salons"><span class="nav-subitem-dot" aria-hidden="true"></span><span>My Salons</span></a>' +
      '</div></div>' +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="tips">' + iconWrap('circle-dollar-sign') + '<span>Tips</span></a>' +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="transactions">' + iconWrap('receipt') + '<span>Transactions</span></a>' +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="payout-methods">' + iconWrap('chart-no-axes-combined') + '<span>Payout Methods</span></a>' +
      '<a class="nav-item staff-nav-item" href="#" data-staff-nav="profile">' + iconWrap('settings') + '<span>Profile</span></a>' +
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

  function navigate(tab) {
    var fn = (typeof cfg.onNavigate === 'function') ? cfg.onNavigate
      : (typeof window.activateMainTab === 'function' ? window.activateMainTab : null);
    if (fn) fn(tab);
  }

  function setActiveTab(tab) {
    activeTab = tab;
    var subs = document.querySelectorAll('.sidebar [data-shell-tab]');
    for (var i = 0; i < subs.length; i++) {
      subs[i].classList.toggle('is-active', subs[i].getAttribute('data-shell-tab') === tab);
    }
  }

  function setDrawer(open) {
    var sidebar = document.querySelector('aside.sidebar');
    var backdrop = document.querySelector('.nexora-shell-backdrop');
    var opener = document.querySelector('.header [data-shell-drawer-open]');
    if (sidebar) sidebar.classList.toggle('is-open', open);
    if (backdrop) backdrop.classList.toggle('is-open', open);
    if (opener) {
      opener.setAttribute('aria-expanded', open ? 'true' : 'false');
      opener.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    }
  }

  function wireSidebar() {
    // group expand / collapse
    var toggles = document.querySelectorAll('.sidebar [data-nav-group]');
    for (var i = 0; i < toggles.length; i++) {
      (function (toggle) {
        var sub = document.getElementById(toggle.getAttribute('aria-controls'));
        if (!sub) return;
        toggle.addEventListener('click', function () {
          var collapsed = sub.classList.toggle('is-collapsed');
          toggle.classList.toggle('is-expanded', !collapsed);
          toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        });
      })(toggles[i]);
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
    sidebar.innerHTML = renderMerchantSidebarHtml();
    wireSidebar();
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function init() {
    var sidebar = document.querySelector('aside.sidebar');
    var header = document.querySelector('header.header');
    if (sidebar) sidebar.id = 'nexora-sidebar';
    if (sidebar) sidebar.innerHTML = activePage === 'staff' ? STAFF_SIDEBAR_HTML : renderMerchantSidebarHtml();
    if (header) header.innerHTML = HEADER_HTML;

    // drawer backdrop (once)
    if (!document.querySelector('.nexora-shell-backdrop')) {
      var bd = document.createElement('div');
      bd.className = 'nexora-shell-backdrop';
      document.body.appendChild(bd);
    }

    wire();
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
