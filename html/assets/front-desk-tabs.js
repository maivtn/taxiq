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
    {id: 'gift-card-center', label: 'Gift Card Center', icon: 'gift-card-center'},
    {id: 'completed', label: 'Completed Services', icon: 'completed-services', href: 'pos-completed-services.html'},
    {id: 'products-other-sales', label: 'Products & Other Sales', image: '../assets/icon-oneqr/issue-2040-oneqr-package-3d.png', style: 'products-other-sales', href: 'pos-products-other-sales.html', more: true},
    {id: 'booking', label: 'Booking', icon: 'appointments', href: 'pos-front-desk.html?section=appointments&bookingView=booking', section: 'appointments', more: true},
    {id: 'appointments', label: 'Appointments', image: '../assets/icon-oneqr/issue-2040-oneqr-calendar-days-3d.png', style: 'appointments', href: 'pos-front-desk.html?section=appointments&bookingView=appointment', section: 'appointments', more: true},
    {id: 'estimate', label: 'Estimate', icon: 'estimate', href: 'pos-front-desk.html?section=estimate', section: 'estimate', more: true},
    {id: 'staffs-clock', label: 'Staffs Clock', icon: 'staffs-clock', href: 'pos-front-desk.html?section=clock', section: 'clock', more: true},
    {id: 'customer-history', label: 'Customer History', icon: 'overview', more: true},
    {id: 'price-menu', label: 'Price Menu', image: '../assets/icon-oneqr/issue-2040-oneqr-list-3d.png', style: 'gift-card-center', more: true},
    {id: 'ai-voice', label: 'AI Voice', image: '../assets/icon-oneqr/issue-2040-oneqr-phone-3d.png', style: 'checkout-customer', more: true},
    {id: 'waitlist', label: 'Live Waitlist', icon: 'tickets', style: 'waitlist', href: 'pos-front-desk.html?section=waitlist', section: 'waitlist', more: true}
  ];
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
  panel.innerHTML = '<div class="front-desk-more-head"><h2 id="front-desk-more-title">More</h2><button type="button" class="front-desk-more-close" aria-label="Close">×</button></div>';
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
    if (page === 'pos-front-desk-staff.html') return 'staff';
    if (page === 'pos-front-desk-turn-board.html') return 'turn-board';
    if (page === 'pos-completed-services.html') return 'completed';
    if (page === 'pos-products-other-sales.html') return 'products-other-sales';
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
  function connect() {
    window.NEXORA_APPOINTMENTS_STORE?.subscribe?.(refreshCounts);
    sync();
  }
  window.NEXORA_FRONT_DESK_TABS = {sync, refreshCounts};
  sync();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', connect, {once: true});
  else connect();
})();
