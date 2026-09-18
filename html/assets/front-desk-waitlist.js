(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;
  const root = document.querySelector('#front-desk-waitlist');
  if (!root) return;
  const catalog = window.NEXORA_SALON_DATA.loadCatalog();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const initials = name => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const TONES = ['wl-tone-a', 'wl-tone-b', 'wl-tone-c'];

  let guests = [
    {id: 'sarah-nguyen', name: 'Sarah Nguyen', service: 'Classic Pedicure', status: 'Returning', eta: '12–18 min', elapsed: '28 min', points: 620, benefitCount: 2, tags: ['Birthday gift', '$10 voucher']},
    {id: 'maria-lopez', name: 'Maria Lopez', service: 'Acrylic Full Set', status: 'Waiting Outside', eta: '25–35 min', elapsed: '9 min', points: 180, benefitCount: 1, tags: ['Member 10%']},
    {id: 'jessica-lee', name: 'Jessica Lee', service: 'Gel Manicure', status: 'No Response', eta: 'Ready soon', elapsed: '41 min', points: 505, benefitCount: 2, tags: ['$5 reward', 'Wait Care eligible']}
  ];

  function card(guest, index) {
    const stats = [['ETA', guest.eta], ['Elapsed', guest.elapsed], ['Points', guest.points], ['Benefits', guest.benefitCount]];
    return '<article class="wl-card" data-wl-guest="' + esc(guest.id) + '">' +
      '<div class="wl-card-top">' +
        '<span class="wl-avatar ' + TONES[index % TONES.length] + '" aria-hidden="true">' + esc(initials(guest.name)) + '</span>' +
        '<div class="wl-id"><strong>' + esc(guest.name) + '</strong><span>' + esc(guest.service) + '</span><span class="wl-status">' + esc(guest.status) + '</span></div>' +
      '</div>' +
      '<div class="wl-stats">' + stats.map(([label, value]) => '<div><strong>' + esc(value) + '</strong><span>' + esc(label) + '</span></div>').join('') + '</div>' +
      (guest.tags.length ? '<div class="wl-tags">' + guest.tags.map(tag => '<span class="wl-tag">' + esc(tag) + '</span>').join('') + '</div>' : '') +
      '<div class="wl-actions">' +
        '<button type="button" class="primary" data-wl-action="sms">Send SMS</button>' +
        '<button type="button" data-wl-action="call">Call Customer</button>' +
        '<button type="button" class="wl-benefit" data-wl-action="benefit">Offer Benefit</button>' +
        '<button type="button" data-wl-action="arrived">Mark Arrived</button>' +
      '</div></article>';
  }

  function renderList() {
    root.querySelector('#wl-cards').innerHTML = guests.map(card).join('');
    root.querySelector('#wl-empty').hidden = !!guests.length;
  }

  root.innerHTML =
    '<div class="wl-heading"><div><h2>Live Waitlist</h2><p>' + esc(catalog.salon.name) + ' · ' + esc(catalog.salon.location) + '</p></div></div>' +
    '<section class="wl-panel" aria-labelledby="wl-panel-title"><h3 id="wl-panel-title">Customers waiting</h3>' +
      '<div id="wl-cards" class="wl-list"></div>' +
      '<p id="wl-empty" class="wl-empty" hidden>No customers waiting right now.</p>' +
    '</section>' +
    '<p class="wl-note">Interactive prototype · Sample data only. SMS, calls, and benefit offers are simulated and do not contact real customers.</p>';
  renderList();

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-wl-action]');
    if (!button) return;
    const cardEl = button.closest('[data-wl-guest]');
    const guest = guests.find(item => item.id === cardEl.dataset.wlGuest);
    if (!guest) return;
    const feedback = document.querySelector('#feedback');
    const action = button.dataset.wlAction;
    if (action === 'sms') feedback.textContent = 'SMS sent to ' + guest.name + ' (demo).';
    else if (action === 'call') feedback.textContent = 'Calling ' + guest.name + '... (demo).';
    else if (action === 'benefit') feedback.textContent = 'Benefit offer sent to ' + guest.name + ' (demo).';
    else if (action === 'arrived') {
      guests = guests.filter(item => item.id !== guest.id);
      feedback.textContent = guest.name + ' marked as arrived.';
      renderList();
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
