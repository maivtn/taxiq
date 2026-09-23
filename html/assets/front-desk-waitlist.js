(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;
  const root = document.querySelector('#front-desk-waitlist');
  if (!root) return;
  const catalog = window.NEXORA_SALON_DATA.loadCatalog();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const initials = name => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const TONES = ['wl-tone-a', 'wl-tone-b', 'wl-tone-c'];
  let view = 'table';

  let guests = [
    {id: 'sarah-nguyen', name: 'Sarah Nguyen', service: 'Classic Pedicure', status: 'Returning', eta: '12–18 min', elapsed: '28 min', points: 620, benefitCount: 2, tags: ['Birthday gift', '$10 voucher']},
    {id: 'maria-lopez', name: 'Maria Lopez', service: 'Acrylic Full Set', status: 'Waiting Outside', eta: '25–35 min', elapsed: '9 min', points: 180, benefitCount: 1, tags: ['Member 10%']},
    {id: 'jessica-lee', name: 'Jessica Lee', service: 'Gel Manicure', status: 'No Response', eta: 'Ready soon', elapsed: '41 min', points: 505, benefitCount: 2, tags: ['$5 reward', 'Wait Care eligible']}
  ];

  function identity(guest, index) {
    return '<div class="wl-card-top">' +
      '<span class="wl-avatar ' + TONES[index % TONES.length] + '" aria-hidden="true">' + esc(initials(guest.name)) + '</span>' +
      '<div class="wl-id"><strong>' + esc(guest.name) + '</strong><span>' + esc(guest.service) + '</span></div></div>';
  }

  function tags(guest) {
    return guest.tags.length ? '<div class="wl-tags">' + guest.tags.map(tag => '<span class="wl-tag">' + esc(tag) + '</span>').join('') + '</div>' : '';
  }

  function actions() {
    return '<div class="wl-actions">' +
      '<button type="button" class="primary" data-wl-action="sms">Send SMS</button>' +
      '<button type="button" data-wl-action="call">Call Customer</button>' +
      '<button type="button" class="wl-benefit" data-wl-action="benefit">Offer Benefit</button>' +
      '<button type="button" data-wl-action="arrived">Mark Arrived</button></div>';
  }

  function card(guest, index) {
    const stats = [['ETA', guest.eta], ['Elapsed', guest.elapsed], ['Points', guest.points], ['Benefits', guest.benefitCount]];
    return '<article class="wl-card" data-wl-guest="' + esc(guest.id) + '">' +
      '<div class="wl-card-heading">' + identity(guest, index) + '<span class="wl-status">' + esc(guest.status) + '</span></div>' +
      '<div class="wl-stats">' + stats.map(([label, value]) => '<div><strong>' + esc(value) + '</strong><span>' + esc(label) + '</span></div>').join('') + '</div>' +
      tags(guest) + actions() + '</article>';
  }

  function table() {
    return '<table aria-label="Waiting customers"><thead><tr>' +
      ['Customer / Service', 'Status', 'ETA', 'Elapsed', 'Points', 'Benefits', 'Actions'].map(label => '<th scope="col">' + label + '</th>').join('') +
      '</tr></thead><tbody>' + guests.map((guest, index) =>
        '<tr data-wl-guest="' + esc(guest.id) + '"><td>' + identity(guest, index) + '</td>' +
        '<td><span class="wl-status">' + esc(guest.status) + '</span></td>' +
        '<td>' + esc(guest.eta) + '</td><td>' + esc(guest.elapsed) + '</td><td>' + esc(guest.points) + '</td>' +
        '<td><span class="wl-benefit-count">' + esc(guest.benefitCount) + (guest.benefitCount === 1 ? ' benefit' : ' benefits') + '</span>' + tags(guest) + '</td>' +
        '<td>' + actions() + '</td></tr>'
      ).join('') + '</tbody></table>';
  }

  function renderList() {
    const list = root.querySelector('#wl-cards');
    list.className = view === 'table' ? 'wl-table-wrap' : 'wl-list';
    list.innerHTML = guests.length ? (view === 'table' ? table() : guests.map(card).join('')) : '';
    if (view === 'table' && guests.length) {
      list.tabIndex = 0;
      list.setAttribute('role', 'region');
      list.setAttribute('aria-label', 'Waiting customers table');
    } else {
      ['tabindex', 'role', 'aria-label'].forEach(name => list.removeAttribute(name));
    }
    list.hidden = !guests.length;
    root.querySelector('#wl-empty').hidden = !!guests.length;
    root.querySelectorAll('[data-wl-view]').forEach(button => {
      const active = button.dataset.wlView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function notify(message, icon = 'success') {
    const feedback = document.querySelector('#feedback');
    if (window.Swal && typeof window.Swal.fire === 'function') {
      feedback.textContent = '';
      window.Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        titleText: message,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 3000,
        timerProgressBar: true
      });
    } else {
      feedback.textContent = message;
    }
  }

  root.innerHTML =
    '<div class="wl-heading"><div><h2>Live Waitlist</h2><p>' + esc(catalog.salon.name) + ' · ' + esc(catalog.salon.location) + '</p></div>' +
    '<div class="views wl-views" role="group" aria-label="Waitlist view">' +
      '<button type="button" data-wl-view="table" aria-controls="wl-cards">Table</button>' +
      '<button type="button" data-wl-view="card" aria-controls="wl-cards">Cards</button></div></div>' +
    '<div id="wl-cards" class="wl-list"></div>' +
    '<p id="wl-empty" class="wl-empty" hidden>No customers waiting right now.</p>';
  renderList();

  root.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-wl-view]');
    if (viewButton) {
      view = viewButton.dataset.wlView;
      renderList();
      return;
    }
    const button = event.target.closest('[data-wl-action]');
    if (!button) return;
    const cardEl = button.closest('[data-wl-guest]');
    const guest = guests.find(item => item.id === cardEl.dataset.wlGuest);
    if (!guest) return;
    const action = button.dataset.wlAction;
    if (action === 'sms') notify('SMS sent to ' + guest.name + '.');
    else if (action === 'call') notify('Calling ' + guest.name + '...', 'info');
    else if (action === 'benefit') notify('Benefit offer sent to ' + guest.name + '.');
    else if (action === 'arrived') {
      guests = guests.filter(item => item.id !== guest.id);
      renderList();
      notify(guest.name + ' marked as arrived.');
    }
  });

  function renderSection() {
    const params = new URLSearchParams(location.search);
    const waitlist = (params.get('section') || params.get('tab')) === 'waitlist';
    root.hidden = !waitlist;
    if (!waitlist) return;
    ['#appointments', '#service-assignments', '#front-desk-estimate', '#front-desk-checkin'].forEach(selector => {
      const section = document.querySelector(selector);
      if (section) section.hidden = true;
    });
    document.querySelectorAll('[data-front-section]').forEach(link => {
      const active = link.dataset.frontSection === 'waitlist';
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  document.querySelector('[data-front-section="waitlist"]').addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const url = new URL(location.href);
    url.searchParams.set('section', 'waitlist'); url.searchParams.set('tab', 'waitlist');
    ['ticket', 'view', 'calendarView'].forEach(key => url.searchParams.delete(key));
    if (url.href !== location.href) history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  window.addEventListener('popstate', renderSection);
  renderSection();
})();
