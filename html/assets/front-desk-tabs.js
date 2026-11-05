/* One definition for Front Desk navigation across the HTML prototype pages. */
(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;

  const host = document.querySelector('[data-front-desk-tabs]');
  if (!host || host.dataset.initialized) return;
  const tabs = [
    {id: 'overview', label: 'Overview', icon: 'overview', href: 'pos-front-desk-tickets.html?view=overview', view: 'overview'},
    {id: 'checkin', label: 'Check-in', icon: 'check-in', href: 'pos-front-desk.html?section=checkin', section: 'checkin'},
    {id: 'tickets', label: 'Tickets', icon: 'tickets', href: 'pos-front-desk-tickets.html', view: 'tickets', count: 'ticket-nav-count'},
    {id: 'turn-board', label: 'Turn Board', icon: 'turn-board', href: 'pos-front-desk-turn-board.html'},
    {id: 'staff', label: 'Staff', icon: 'staffs-clock', href: 'pos-front-desk-staff.html'},
    {id: 'checkout-customer', label: 'Checkout Customer', icon: 'checkout-customer', href: 'pos-direct-checkout.html?view=list', count: 'checkout-nav-count'},
    {id: 'gift-card-center', label: 'Gift Card Center', icon: 'gift-card-center', href: 'gift-card-center.html'},
    {id: 'completed', label: 'Completed Services', icon: 'completed-services', href: 'pos-completed-services.html'},
    {id: 'products-other-sales', label: 'Products & Other Sales', image: '../assets/icon-oneqr/issue-2040-oneqr-package-3d.png', style: 'products-other-sales', href: 'pos-products-other-sales.html', more: true},
    {id: 'booking', label: 'Booking', icon: 'appointments', href: 'pos-front-desk.html?section=appointments&bookingView=booking', section: 'appointments', more: true},
    {id: 'appointments', label: 'Appointments', image: '../assets/icon-oneqr/issue-2040-oneqr-calendar-days-3d.png', style: 'appointments', href: 'pos-front-desk.html?section=appointments&bookingView=appointment', section: 'appointments', more: true},
    {id: 'estimate', label: 'Estimate', icon: 'estimate', href: 'pos-front-desk.html?section=estimate', section: 'estimate', more: true},
    {id: 'staffs-clock', label: 'Staffs Clock', icon: 'staffs-clock', href: 'pos-front-desk.html?section=clock', section: 'clock', more: true},
    {id: 'customer-history', label: 'Customer History', icon: 'overview', href: 'pos-products-other-sales.html?section=history', more: true},
    {id: 'price-menu', label: 'Price Menu', image: '../assets/icon-oneqr/issue-2040-oneqr-list-3d.png', style: 'gift-card-center', href: 'pos-products-other-sales.html?section=pricemenu', more: true},
    {id: 'ai-voice', label: 'AI Voice', image: '../assets/icon-oneqr/issue-2040-oneqr-phone-3d.png', style: 'checkout-customer', href: 'pos-ai-voice.html', more: true}
  ];
  // Extra screens and chooser copy follow the Oct 27 PO Front Desk handoff.
  const screens = [
    {id: 'oneqr', label: 'One QR', artwork: 'qr-code', module: 'oneqr'},
    {id: 'payments', label: 'Payments', artwork: 'credit-card', module: 'payments'},
    {id: 'reviews', label: 'Reviews', artwork: 'star', module: 'reviews'},
    {id: 'analytics', label: 'Analytics', artwork: 'layout-list', module: 'analytics'},
    {id: 'community', label: 'Community', artwork: 'message-circle', module: 'community'},
    {id: 'aihub', label: 'AI Hub', artwork: 'sparkles', module: 'aihub'},
    {id: 'marketing', label: 'AI Marketing', artwork: 'megaphone', module: 'aihub&section=marketing'}
  ];
  let selectedScreens = [];
  const nodes = new Map();
  const scrollKey = 'nexora:front-desk-tabs-scroll:v1';
  const primary = document.createElement('div');
  primary.className = 'front-desk-primary-tabs';
  const more = document.createElement('button');
  more.type = 'button'; more.className = 'front-desk-more-toggle';
  more.dataset.posWorkflow = 'checkout-customer';
  more.setAttribute('aria-haspopup', 'dialog');
  more.setAttribute('aria-expanded', 'false');
  more.setAttribute('aria-controls', 'front-desk-more-panel');
  more.innerHTML = '<span class="front-desk-more-icon" aria-hidden="true">•••</span><span class="workflow-label">More</span>';
  const panel = document.createElement('div');
  panel.id = 'front-desk-more-panel'; panel.className = 'front-desk-more-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'front-desk-more-title');
  panel.innerHTML = '<div class="front-desk-more-head"><h2 id="front-desk-more-title">More tools</h2><button type="button" class="front-desk-more-close" aria-label="Close">×</button></div>';
  const secondary = document.createElement('div');
  secondary.className = 'front-desk-more-grid'; panel.appendChild(secondary);
  host.append(primary, more, panel);

  tabs.forEach(tab => {
    const node = document.createElement(tab.href ? 'a' : 'button');
    if (tab.href) node.href = tab.href;
    else node.type = 'button';
    node.dataset.frontDeskTab = tab.id;
    node.dataset.posWorkflow = tab.style || (tab.id === 'staff' ? 'staff' : tab.icon);
    if (tab.section) node.dataset.frontSection = tab.section;
    if (tab.view) node.dataset.frontView = tab.view;
    if (tab.id === 'completed') node.dataset.frontCompleted = '';
    const image = document.createElement('img');
    image.src = tab.image || '../assets/icons/pos-front-desk/' + tab.icon + '.svg';
    image.alt = ''; image.width = 48; image.height = 48; image.draggable = false;
    image.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'workflow-label'; label.textContent = tab.label;
    node.append(image, label);
    if (tab.count) {
      const count = document.createElement('span');
      count.id = tab.count; count.className = 'workflow-count'; count.hidden = true;
      node.appendChild(count);
    }
    nodes.set(tab.id, node); (tab.more ? secondary : primary).appendChild(node);
  });
  const addScreen = document.createElement('button');
  addScreen.type = 'button'; addScreen.className = 'front-desk-more-add';
  addScreen.setAttribute('aria-haspopup', 'dialog');
  addScreen.setAttribute('aria-expanded', 'false');
  addScreen.setAttribute('aria-controls', 'front-desk-screen-dialog');
  addScreen.innerHTML = '<span class="front-desk-more-add-icon" aria-hidden="true">＋</span><span>Add screen</span>';
  secondary.appendChild(addScreen);
  const screenDialog = document.createElement('dialog');
  screenDialog.id = 'front-desk-screen-dialog'; screenDialog.className = 'front-desk-screen-dialog';
  screenDialog.setAttribute('aria-labelledby', 'front-desk-screen-title');
  screenDialog.innerHTML = '<div class="front-desk-screen-head"><div><h2 id="front-desk-screen-title">Choose screens to show</h2><p>Add or remove screen shortcuts. When the row is full, find the rest under More.</p></div><button type="button" class="front-desk-screen-close" aria-label="Close">×</button></div><div class="front-desk-screen-options"></div>';
  host.appendChild(screenDialog);
  const screenOptions = screenDialog.querySelector('.front-desk-screen-options');

  function screenStorageKey() {
    let salon = window.NEXORA_ACTIVE_SALON;
    try { salon ||= window.NEXORA_SALON_DATA?.loadCatalog().salon; } catch (_) {}
    return 'nexora:front-desk-extra-screens:v1:' + (salon?.id || salon?.name || 'Bitcoin Nail Bar');
  }

  function renderScreens() {
    secondary.querySelectorAll('[data-front-desk-extra-screen]').forEach(node => node.remove());
    screenOptions.replaceChildren();
    screens.forEach(screen => {
      const selected = selectedScreens.includes(screen.id);
      const image = document.createElement('img');
      image.src = '../assets/icon-oneqr/issue-2040-oneqr-' + screen.artwork + '-3d.png';
      image.alt = ''; image.width = 32; image.height = 32; image.draggable = false;
      image.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'workflow-label'; label.textContent = screen.label;
      if (selected) {
        const link = document.createElement('a');
        link.href = 'dashboard.html?module=' + screen.module;
        link.dataset.frontDeskExtraScreen = screen.id;
        link.dataset.posWorkflow = 'appointments';
        link.append(image.cloneNode(), label.cloneNode(true));
        secondary.insertBefore(link, addScreen);
      }
      const option = document.createElement('button');
      option.type = 'button'; option.dataset.screenId = screen.id;
      option.setAttribute('aria-pressed', String(selected));
      option.setAttribute('aria-label', (selected ? 'Remove ' : 'Add ') + screen.label);
      const state = document.createElement('span');
      state.className = 'front-desk-screen-state'; state.setAttribute('aria-hidden', 'true');
      state.textContent = selected ? '✓' : '+';
      option.append(image, label, state);
      screenOptions.appendChild(option);
    });
    if (!panel.hidden) fitMorePanel();
  }

  function loadScreens() {
    selectedScreens = [];
    try {
      const saved = JSON.parse(localStorage.getItem(screenStorageKey()) || '[]');
      if (Array.isArray(saved)) selectedScreens = screens.filter(screen => saved.includes(screen.id)).map(screen => screen.id);
    } catch (_) { /* Keep the chooser usable when storage is unavailable. */ }
    renderScreens();
  }

  addScreen.addEventListener('click', () => {
    setMoreOpen(false);
    screenDialog.showModal();
    addScreen.setAttribute('aria-expanded', 'true');
    screenOptions.querySelector('button')?.focus();
  });
  screenDialog.querySelector('.front-desk-screen-close').addEventListener('click', () => screenDialog.close());
  screenDialog.addEventListener('close', () => {
    addScreen.setAttribute('aria-expanded', 'false');
    more.focus();
  });
  screenOptions.addEventListener('click', event => {
    const option = event.target.closest('[data-screen-id]');
    if (!option) return;
    const id = option.dataset.screenId;
    selectedScreens = selectedScreens.includes(id) ? selectedScreens.filter(value => value !== id) : [...selectedScreens, id];
    try { localStorage.setItem(screenStorageKey(), JSON.stringify(selectedScreens)); } catch (_) {}
    renderScreens();
    screenOptions.querySelector('[data-screen-id="' + id + '"]')?.focus();
  });
  host.dataset.initialized = 'true';
  try { primary.scrollLeft = Number(sessionStorage.getItem(scrollKey)) || 0; } catch (_) {}

  function setMoreOpen(open, restoreFocus = false) {
    panel.hidden = !open;
    more.setAttribute('aria-expanded', String(open));
    if (open) fitMorePanel();
    if (restoreFocus) more.focus();
  }

  function fitMorePanel() {
    panel.style.maxHeight = Math.max(0, window.innerHeight - panel.getBoundingClientRect().top - 16) + 'px';
  }

  more.addEventListener('click', () => setMoreOpen(panel.hidden));
  more.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault(); setMoreOpen(true); secondary.firstElementChild?.focus();
  });
  panel.querySelector('.front-desk-more-close').addEventListener('click', () => setMoreOpen(false, true));
  document.addEventListener('click', event => {
    if (!host.contains(event.target)) setMoreOpen(false);
  });
  host.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || panel.hidden) return;
    event.preventDefault(); event.stopPropagation(); setMoreOpen(false, true);
  });
  host.addEventListener('focusout', event => {
    if (event.relatedTarget && !host.contains(event.relatedTarget)) setMoreOpen(false);
  });

  function currentTab() {
    const page = location.pathname.split('/').pop(), params = new URLSearchParams(location.search);
    if (page === 'gift-card-center.html') return 'gift-card-center';
    if (page === 'pos-front-desk-staff.html') return 'staff';
    if (page === 'pos-front-desk-turn-board.html') return 'turn-board';
    if (page === 'pos-completed-services.html') return 'completed';
    if (page === 'pos-products-other-sales.html') return ({history:'customer-history',pricemenu:'price-menu'})[params.get('section')] || 'products-other-sales';
    if (page === 'pos-front-desk-tickets.html' || page === 'pos-direct-checkout.html') {
      const id = params.get(page === 'pos-direct-checkout.html' ? 'checkoutId' : 'ticketId');
      if (id) {
        try {
          const data = window.NEXORA_FRONT_DESK_DATA;
          if (data?.all().find(ticket => data.keyOf(ticket) === id)?.payment) return 'completed';
        } catch (_) { /* The page owns any saved-data error message. */ }
        if (params.get('mode') === 'checkout' || params.get('returnTo') === 'checkout') return 'checkout-customer';
      }
      return page === 'pos-direct-checkout.html' ? 'checkout-customer' : params.get('view') === 'overview' ? 'overview' : 'tickets';
    }
    const section = params.get('section') || params.get('tab');
    const bookingTab = params.get('bookingView') === 'appointment' || (!params.has('bookingView') && ['table', 'cards', 'calendar'].includes(params.get('view'))) ? 'appointments' : 'booking';
    const sections = {appointments: bookingTab, booking: bookingTab, checkin: 'checkin', waitlist: 'waitlist', estimate: 'estimate', clock: 'staffs-clock',
      assign: 'tickets', tickets: 'tickets', checkout: 'checkout-customer', overview: 'overview', staff: 'staff',
      turnboard: 'turn-board', 'turn-board': 'turn-board'};
    return Object.hasOwn(sections, section) ? sections[section] : params.has('view') ? bookingTab : 'overview';
  }

  function revealActive() {
    const active = primary.querySelector('[aria-current="page"]');
    if (!active) return;
    const bounds = primary.getBoundingClientRect(), tab = active.getBoundingClientRect();
    if (tab.left < bounds.left) primary.scrollLeft -= bounds.left - tab.left;
    else if (tab.right > bounds.right) primary.scrollLeft += tab.right - bounds.right;
  }

  function refreshCounts() {
    const data = window.NEXORA_FRONT_DESK_DATA;
    let rows;
    try { if (data) rows = data.all().filter(ticket => data.active(ticket) && data.visible(ticket)); } catch (_) {}
    [['ticket-nav-count', rows?.length], ['checkout-nav-count', rows?.filter(ticket => ticket.directCheckout || ticket.status === 'ready-to-pay').length]].forEach(([id, value]) => {
      const count = host.querySelector('#' + id);
      count.hidden = value == null; count.textContent = value == null ? '' : String(value);
    });
  }

  function sync(options = {}) {
    const active = options.active || currentTab();
    nodes.forEach((node, id) => {
      const selected = id === active;
      node.classList.toggle('active', selected);
      if (selected) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
    more.classList.toggle('active', tabs.some(tab => tab.id === active && tab.more));
    refreshCounts(); revealActive();
  }

  host.addEventListener('click', event => {
    if (event.target.closest('.front-desk-primary-tabs [data-front-desk-tab]')) setMoreOpen(false);
    const extraLink = event.target.closest('a[data-front-desk-extra-screen]');
    if (extraLink) setMoreOpen(false);
    const link = event.target.closest('a[data-front-desk-tab]');
    if (!link) return;
    setMoreOpen(false, panel.contains(link) && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey);
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = new URL(link.href);
    const localPage = location.pathname.split('/').pop();
    if (target.pathname !== location.pathname || !['pos-front-desk.html', 'pos-front-desk-tickets.html'].includes(localPage)) return;
    event.preventDefault();
    if (localPage === 'pos-front-desk.html' && link.dataset.frontDeskTab === currentTab()) return;
    const url = new URL(location.href);
    ['section', 'tab', 'view', 'bookingView', 'calendarView', 'ticket', 'ticketId', 'mode', 'settings', 'returnTo'].forEach(key => url.searchParams.delete(key));
    target.searchParams.forEach((value, key) => url.searchParams.set(key, value));
    if (url.href !== location.href) history.pushState(history.state, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  primary.addEventListener('scroll', () => { try { sessionStorage.setItem(scrollKey, String(primary.scrollLeft)); } catch (_) {} }, {passive: true});
  window.addEventListener('popstate', () => { setMoreOpen(false); sync(); });
  window.addEventListener('pageshow', () => sync());
  window.addEventListener('resize', () => { if (!panel.hidden) fitMorePanel(); revealActive(); });
  ['focus', 'storage', 'nexora:front-desk-data-changed', 'nexora:tickets-changed', 'nexora:pos-account-changed', 'nexora:pos-settings-changed'].forEach(name => window.addEventListener(name, refreshCounts));
  window.addEventListener('storage', event => { if (event.key === screenStorageKey() || event.key === null) loadScreens(); });
  function connect() {
    loadScreens();
    window.NEXORA_APPOINTMENTS_STORE?.subscribe?.(refreshCounts);
    sync();
  }
  window.NEXORA_FRONT_DESK_TABS = {sync, refreshCounts};
  sync();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', connect, {once: true});
  else connect();
})();
