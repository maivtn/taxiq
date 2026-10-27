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
    {id: 'waitlist', label: 'Live Waitlist', icon: 'tickets', style: 'waitlist', href: 'pos-front-desk.html?section=waitlist', section: 'waitlist'},
    {id: 'turn-board', label: 'Turn Board', icon: 'turn-board', href: 'pos-front-desk-turn-board.html'},
    {id: 'staff', label: 'Staff', icon: 'staffs-clock', href: 'pos-front-desk-staff.html'},
    {id: 'checkout-customer', label: 'Checkout Customer', icon: 'checkout-customer', href: 'pos-direct-checkout.html?view=list', count: 'checkout-nav-count'},
    {id: 'products-other-sales', label: 'Products & Other Sales', image: '../assets/icon-oneqr/issue-2040-oneqr-shopping-bag-3d.png', style: 'products-other-sales', href: 'pos-products-other-sales.html'},
    {id: 'completed', label: 'Completed Services', icon: 'completed-services', href: 'pos-completed-services.html'},
    {id: 'booking', label: 'Booking', icon: 'appointments', href: 'pos-front-desk.html?section=appointments', section: 'appointments'},
    {id: 'estimate', label: 'Estimate', icon: 'estimate', href: 'pos-front-desk.html?section=estimate', section: 'estimate'},
    {id: 'staffs-clock', label: 'Staffs Clock', icon: 'staffs-clock'},
    {id: 'customer-history', label: 'Customer History', icon: 'overview'}
  ];
  const nodes = new Map();
  const scrollKey = 'nexora:front-desk-tabs-scroll:v1';

  tabs.forEach(tab => {
    const node = document.createElement(tab.href ? 'a' : 'button');
    if (tab.href) node.href = tab.href;
    else { node.type = 'button'; node.disabled = true; }
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
    nodes.set(tab.id, node); host.appendChild(node);
  });
  host.dataset.initialized = 'true';
  try { host.scrollLeft = Number(sessionStorage.getItem(scrollKey)) || 0; } catch (_) {}

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
      }
      return page === 'pos-direct-checkout.html' ? 'checkout-customer' : params.get('view') === 'overview' ? 'overview' : 'tickets';
    }
    const section = params.get('section') || params.get('tab');
    const sections = {appointments: 'booking', booking: 'booking', checkin: 'checkin', waitlist: 'waitlist', estimate: 'estimate',
      assign: 'tickets', tickets: 'tickets', checkout: 'checkout-customer', overview: 'overview', staff: 'staff',
      turnboard: 'turn-board', 'turn-board': 'turn-board'};
    return Object.hasOwn(sections, section) ? sections[section] : params.has('view') ? 'booking' : 'overview';
  }

  function revealActive() {
    const active = host.querySelector('[aria-current="page"]');
    if (!active) return;
    const bounds = host.getBoundingClientRect(), tab = active.getBoundingClientRect();
    if (tab.left < bounds.left) host.scrollLeft -= bounds.left - tab.left;
    else if (tab.right > bounds.right) host.scrollLeft += tab.right - bounds.right;
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
    refreshCounts(); revealActive();
  }

  host.addEventListener('click', event => {
    const link = event.target.closest('a[data-front-desk-tab]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
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
  host.addEventListener('scroll', () => { try { sessionStorage.setItem(scrollKey, String(host.scrollLeft)); } catch (_) {} }, {passive: true});
  window.addEventListener('popstate', () => sync());
  window.addEventListener('pageshow', () => sync());
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
