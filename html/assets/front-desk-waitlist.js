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
  // Sample recipients only. This prototype never calls an SMS provider.
  guests.forEach((guest, index) => { guest.phone = '+1 (713) 555-010' + index; });
  const smsHistory = new Map();
  const smsDefaults = {
    'return-soon': 'Hi [Customer Name], your turn at [Salon Name] is coming up. Please return soon: [OneQR Link]',
    'ready-now': 'Hi [Customer Name], we\'re ready for you at [Salon Name]. Please come to the front desk now. Details: [OneQR Link]',
    'wait-care': 'Hi [Customer Name], thanks for your patience at [Salon Name]. Estimated wait: [Wait Time]. Updates: [OneQR Link]'
  };
  const smsFields = { 'return-soon': 'returnSoonMessage', 'ready-now': 'readyNowMessage', 'wait-care': 'waitCareMessage' };
  const smsStorageKey = 'nexora:salon-sms-settings:v1:' + window.NEXORA_SALON_DATA.SALON_ID;
  let smsGuest = null;
  let smsSubmitted = false;

  function smsSettings() {
    const raw = localStorage.getItem(smsStorageKey);
    if (!raw) return { sections: {} };
    const saved = JSON.parse(raw);
    if (saved.version !== 1 || !saved.sections || typeof saved.sections !== 'object' || Array.isArray(saved.sections)) throw new Error('Invalid settings');
    Object.values(saved.sections).forEach(section => {
      if (!section || typeof section.enabled !== 'boolean' || !section.fields || typeof section.fields !== 'object' || Array.isArray(section.fields) || Object.values(section.fields).some(value => typeof value !== 'string')) throw new Error('Invalid section');
    });
    return saved;
  }

  function loadSmsTemplate() {
    let saved;
    try { saved = smsSettings(); }
    catch (_) { smsStatus.textContent = 'Could not load saved templates. Review SMS Settings before sending.'; smsSubmit.disabled = true; return; }
    const type = smsType.value;
    const section = saved.sections[type === 'wait-care' ? 'wait-care' : 'automation'];
    const text = section?.fields[smsFields[type]] ?? smsDefaults[type];
    const tokens = { '[Customer Name]': smsGuest.name, '[Salon Name]': catalog.salon.name, '[OneQR Link]': 'nexora.app/q/demo-' + smsGuest.id };
    smsMessage.value = text.replace(/\[[^\]\n]+\]/g, token => tokens[token] ?? token);
    smsWait.value = '';
    smsWaitConfirmed.checked = false;
    smsReadyConfirmed.checked = false;
    smsStatus.textContent = '';
    smsSubmit.disabled = smsSubmitted;
    updateSmsPreview();
  }

  function updateSmsPreview() {
    const needsWait = smsMessage.value.includes('[Wait Time]');
    smsWaitGroup.hidden = !needsWait;
    smsReadyGroup.hidden = smsType.value !== 'ready-now';
    const text = smsMessage.value.replaceAll('[Wait Time]', smsWait.value.trim() || '[Wait Time]');
    smsPreview.textContent = text || 'Your message will appear here.';
    smsCount.textContent = Array.from(text).length + ' characters';
    return text;
  }

  function openSms(guest) {
    let saved;
    try { saved = smsSettings(); }
    catch (_) { notify('Could not load SMS templates. Review SMS Settings before sending.', 'error'); return; }
    smsGuest = guest;
    smsSubmitted = false;
    smsDialog.querySelectorAll('input, select, textarea').forEach(field => { field.disabled = false; });
    smsDialog.querySelector('[data-wl-sms-recipient]').textContent = guest.name + ' · ' + guest.phone;
    smsDialog.querySelector('[data-wl-sms-visit]').textContent = guest.service + ' · Waiting estimate: ' + guest.eta;
    const careOption = smsType.querySelector('[value="wait-care"]');
    careOption.disabled = saved.sections['wait-care']?.enabled === false;
    careOption.hidden = careOption.disabled;
    smsType.value = 'return-soon';
    const last = smsHistory.get(guest.id);
    smsDialog.querySelector('[data-wl-sms-history]').textContent = last
      ? 'Last demo this session: ' + last.time + ' · ' + last.type + '\n' + last.message
      : 'No SMS demos recorded for this customer in this session.';
    loadSmsTemplate();
    smsDialog.showModal();
  }

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
    '<p id="wl-empty" class="wl-empty" hidden>No customers waiting right now.</p>' +
    '<dialog class="wl-sms-dialog" aria-labelledby="wl-sms-title">' +
      '<div class="wl-sms-heading"><h2 id="wl-sms-title">Send Waitlist SMS</h2><button type="button" data-wl-sms-close aria-label="Close SMS composer">×</button></div>' +
      '<p class="wl-sms-help">Prototype · Sample customers and phone numbers. No real SMS is sent.</p>' +
      '<p class="wl-sms-recipient" data-wl-sms-recipient></p><p class="wl-sms-help" data-wl-sms-visit></p>' +
      '<label class="wl-sms-field">Message type<select data-wl-sms-type><option value="return-soon">Return Soon</option><option value="ready-now">Ready Now</option><option value="wait-care">Wait Care</option></select></label>' +
      '<p class="wl-sms-help">Uses the owner’s saved template. Edits here apply only to this message. Changing the message type loads that template.</p>' +
      '<label class="wl-sms-field">Message<textarea data-wl-sms-message rows="4"></textarea></label>' +
      '<div data-wl-sms-wait-group hidden><label class="wl-sms-field">Current estimated wait<input data-wl-sms-wait maxlength="50" placeholder="e.g. 15–20 minutes"></label>' +
      '<label class="wl-sms-check"><input type="checkbox" data-wl-sms-wait-confirmed>I checked this waiting estimate with the team.</label></div>' +
      '<label class="wl-sms-check" data-wl-sms-ready-group hidden><input type="checkbox" data-wl-sms-ready-confirmed>The salon is ready to serve this customer.</label>' +
      '<div class="wl-sms-preview"><strong>Customer preview</strong><p data-wl-sms-preview></p><small data-wl-sms-count></small></div>' +
      '<details class="wl-sms-history"><summary>Last contact in this demo</summary><p data-wl-sms-history></p></details>' +
      '<p class="wl-sms-status" data-wl-sms-status role="status" aria-live="polite"></p>' +
      '<div class="wl-sms-actions"><button type="button" data-wl-sms-close>Close</button><button type="button" class="primary" data-wl-sms-submit>Send SMS (demo)</button></div>' +
    '</dialog>';
  const smsDialog = root.querySelector('.wl-sms-dialog');
  const smsType = root.querySelector('[data-wl-sms-type]');
  const smsMessage = root.querySelector('[data-wl-sms-message]');
  const smsWait = root.querySelector('[data-wl-sms-wait]');
  const smsWaitGroup = root.querySelector('[data-wl-sms-wait-group]');
  const smsWaitConfirmed = root.querySelector('[data-wl-sms-wait-confirmed]');
  const smsReadyGroup = root.querySelector('[data-wl-sms-ready-group]');
  const smsReadyConfirmed = root.querySelector('[data-wl-sms-ready-confirmed]');
  const smsPreview = root.querySelector('[data-wl-sms-preview]');
  const smsCount = root.querySelector('[data-wl-sms-count]');
  const smsStatus = root.querySelector('[data-wl-sms-status]');
  const smsSubmit = root.querySelector('[data-wl-sms-submit]');
  smsType.addEventListener('change', loadSmsTemplate);
  smsMessage.addEventListener('input', updateSmsPreview);
  smsWait.addEventListener('input', () => { smsWaitConfirmed.checked = false; updateSmsPreview(); });
  smsDialog.querySelectorAll('[data-wl-sms-close]').forEach(button => button.addEventListener('click', () => smsDialog.close()));
  smsSubmit.addEventListener('click', () => {
    if (smsSubmitted) return;
    if (!guests.some(guest => guest.id === smsGuest.id)) { smsStatus.textContent = 'This customer is no longer waiting. Close this message.'; return; }
    try {
      if (smsType.value === 'wait-care' && smsSettings().sections['wait-care']?.enabled === false) {
        smsStatus.textContent = 'Wait Care has been disabled in SMS Settings.'; return;
      }
    } catch (_) { smsStatus.textContent = 'Could not check SMS settings. Please try again.'; return; }
    const text = updateSmsPreview();
    if (!text.trim()) { smsStatus.textContent = 'Enter a message before sending.'; smsMessage.focus(); return; }
    if (/\[[^\]\n]+\]/.test(text)) { smsStatus.textContent = 'Complete or remove the unresolved fields before sending.'; return; }
    if (!smsWaitGroup.hidden && (!smsWait.value.trim() || !smsWaitConfirmed.checked)) {
      smsStatus.textContent = 'Enter and confirm the current waiting estimate.'; return;
    }
    if (smsType.value === 'ready-now' && !smsReadyConfirmed.checked) {
      smsStatus.textContent = 'Confirm the salon is ready to serve this customer.'; return;
    }
    smsSubmitted = true;
    smsSubmit.disabled = true;
    smsDialog.querySelectorAll('input, select, textarea').forEach(field => { field.disabled = true; });
    smsHistory.set(smsGuest.id, { type: smsType.selectedOptions[0].textContent, message: text, time: new Date().toLocaleTimeString() });
    smsStatus.textContent = 'Demo recorded for ' + smsGuest.name + '. No SMS was sent. The waiting list is unchanged.';
  });
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
    if (action === 'sms') openSms(guest);
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
