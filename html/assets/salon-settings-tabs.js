/* Shared Salon Settings navigation for the settings workspace and separate pages. */
(function () {
  'use strict';

  const host = document.querySelector('[data-salon-settings-tabs]');
  if (!host || host.dataset.initialized) return;
  const page = location.pathname.split('/').pop();
  const tabs = [
    {id: 'information', label: 'Salon Information', icon: 'building-2'},
    {id: 'sms', label: 'SMS Settings', icon: 'message-square'},
    {id: 'staff', label: 'Staff', icon: 'users-round'},
    {id: 'staff-schedule', label: 'Staff Schedule', icon: 'calendar-range'},
    {id: 'services', label: 'Services', icon: 'list'},
    {id: 'roles', label: 'Roles & Permissions', icon: 'shield-check'},
    {id: 'access-pin', label: 'Access & PIN', icon: 'key-round'},
    {id: 'payment-fees', label: 'Payment Methods & Fees', icon: 'credit-card'},
    {id: 'stations', label: 'Stations', icon: 'armchair'},
    {id: 'operating-standards', label: 'Operating Standards', icon: 'clipboard-check', href: 'pos-operating-standards.html'}
  ];
  const nodes = new Map();

  tabs.forEach(tab => {
    const local = page === 'pos-salon-settings.html' && !tab.href;
    const node = document.createElement(local ? 'button' : 'a');
    node.dataset.salonSettingsTab = tab.id;
    if (local) {
      node.type = 'button';
      node.dataset.settingsTab = tab.id;
    } else node.href = tab.href || 'pos-salon-settings.html?section=' + tab.id;
    const icon = document.createElement('i');
    icon.dataset.lucide = tab.icon;
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = tab.label;
    node.append(icon, label);
    nodes.set(tab.id, node);
    host.appendChild(node);
  });
  host.dataset.initialized = 'true';

  function sync(section) {
    let active = page === 'pos-operating-standards.html' ? 'operating-standards' : section || new URLSearchParams(location.search).get('section') || 'staff';
    if (active === 'staff-requests') active = 'staff-schedule';
    if (!nodes.has(active)) active = 'staff';
    nodes.forEach((node, id) => {
      const selected = id === active;
      node.classList.toggle('active', selected);
      if (selected) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
  }

  window.NEXORA_SALON_SETTINGS_TABS = {sync};
  window.addEventListener('pageshow', () => sync());
  sync();
})();
