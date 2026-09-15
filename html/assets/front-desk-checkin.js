(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;
  const root = document.querySelector('#front-desk-checkin');
  if (!root) return;
  const store = window.NEXORA_APPOINTMENTS_STORE;
  const $ = selector => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const money = cents => '$' + (cents / 100).toFixed(2);
  const phoneKey = value => String(value || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  const newMember = () => ({id: crypto.randomUUID(), name: '', relationship: '', tickets: []});
  let draft, activeId, category = 'All', search = '', catalog, submitted = false;
  function reset() {
    draft = {id: crypto.randomUUID(), mode: 'single', contact: {name: '', phone: ''}, smsConsent: false, members: [newMember()]};
    activeId = draft.members[0].id;
    submitted = false;
    search = ''; category = 'All';
  }
  reset();

  root.innerHTML = `
    <div class="ci-heading"><div><span class="ci-eyebrow">WELCOME TO THE SALON</span><h2>Guest check-in</h2><p>One guest or the whole family. A personal ticket for everyone.</p></div><span class="ci-step">1 · Details <span>→</span> 2 · Review</span></div>
    <div id="ci-entry" class="ci-layout">
      <div class="ci-main ci-surface">
        <section aria-labelledby="ci-contact-title">
          <div class="ci-section-title"><span class="ci-section-number">1</span><div><h3 id="ci-contact-title">Primary contact</h3><p>The person checking in and the contact for this visit.</p></div></div>
          <div class="ci-contact-fields"><label>Mobile phone <span class="ci-required">*</span><div class="ci-phone-field"><input id="ci-contact-phone" type="tel" autocomplete="tel" placeholder="(555) 000-0000" maxlength="24" required><button type="button" data-ci-lookup>Find guest</button></div></label><label>Full name <span class="ci-required">*</span><input id="ci-contact-name" autocomplete="name" placeholder="Enter the primary contact’s name" maxlength="100" required></label></div>
          <div id="ci-lookup-results" aria-live="polite"></div><div id="ci-selected-booking" hidden></div>
          <label class="ci-consent"><input id="ci-consent" type="checkbox"><span>Guest agrees to receive text reminders and offers. <span class="ci-muted">Optional.</span></span></label>
        </section>
        <section class="ci-section" aria-labelledby="ci-mode-title">
          <div class="ci-section-title"><span class="ci-section-number">2</span><div><h3 id="ci-mode-title">Who are you checking in?</h3><p>Choose a service and a preferred technician for each guest.</p></div></div>
          <div class="ci-mode-grid" role="group" aria-label="Check-in mode">
            <button type="button" data-ci-mode="single" aria-pressed="true"><span class="ci-mode-icon" aria-hidden="true">♙</span><span><strong>Just me</strong><small>One guest, one ticket</small></span><span class="ci-radio" aria-hidden="true"></span></button>
            <button type="button" data-ci-mode="family" aria-pressed="false"><span class="ci-mode-icon" aria-hidden="true">♙♙</span><span><strong>Family / Group</strong><small>Multiple linked tickets</small></span><span class="ci-radio" aria-hidden="true"></span></button>
          </div>
          <div id="ci-family" hidden><div class="ci-member-heading"><h4>Group members</h4><button type="button" data-ci-add-member>＋ Add member</button></div><div id="ci-member-tabs" role="group" aria-label="Choose a member"></div><div id="ci-member-editor"></div></div>
        </section>
        <section class="ci-section" aria-labelledby="ci-services-title">
          <div class="ci-section-title"><span class="ci-section-number">3</span><div><h3 id="ci-services-title">Choose services</h3><p>Add services now, or let the front desk help later.</p></div></div>
          <div class="ci-active-guest"><span>Adding services for <strong id="ci-active-name"></strong></span><span id="ci-active-count"></span></div>
          <div id="ci-selected-services"></div>
          <label class="ci-search"><span class="ci-sr-only">Search services</span><input id="ci-service-search" type="search" placeholder="Search services…"></label>
          <div id="ci-categories" role="group" aria-label="Service categories"></div>
          <div id="ci-catalog-results" class="ci-service-grid"></div>
        </section>
      </div>
      <aside class="ci-summary ci-surface" aria-labelledby="ci-summary-title">
        <div class="ci-summary-heading"><h3 id="ci-summary-title">Check-in summary</h3><span id="ci-mode-badge" class="ci-badge"></span></div>
        <div class="ci-summary-contact"><span class="ci-avatar" id="ci-contact-avatar" aria-hidden="true">G</span><div><strong id="ci-summary-name"></strong><small id="ci-summary-phone"></small></div></div>
        <div class="ci-summary-row"><span>Guests</span><strong id="ci-summary-guests">1</strong></div>
        <div class="ci-summary-row"><span>Selected services</span><strong id="ci-summary-services">0</strong></div>
        <div id="ci-summary-members"></div>
        <div class="ci-summary-total"><span>Estimated total</span><strong id="ci-summary-total"></strong></div>
        <p class="ci-muted ci-price-note">Service estimate only. Tax, tip and discounts are confirmed at checkout.</p>
        <p id="ci-error" class="ci-error" role="alert"></p>
        <button class="primary ci-review-button" type="button" data-ci-review>Review Check-in <span aria-hidden="true">→</span></button>
        <p class="ci-summary-note">Each guest receives a separate ticket linked to the primary contact.</p>
      </aside>
    </div>
    <section id="ci-success" class="ci-success ci-surface" hidden aria-labelledby="ci-success-title"><span class="ci-success-icon" aria-hidden="true">✓</span><h2 id="ci-success-title" tabindex="-1">You’re checked in!</h2><p id="ci-success-copy"></p><div id="ci-success-tickets"></div><div class="ci-success-actions"><a class="ci-primary-link" href="pos-front-desk-tickets.html">View Tickets →</a><button type="button" data-ci-new>New Check-in</button></div></section>
    <dialog id="ci-review-dialog" aria-labelledby="ci-review-title"><div class="ci-review-heading"><div><span class="ci-eyebrow">READY TO CHECK IN</span><h2 id="ci-review-title">Review check-in</h2></div><button type="button" data-ci-close aria-label="Close review">×</button></div><p id="ci-review-contact"></p><div id="ci-review-members"></div><div class="ci-review-total"><span>Estimated total</span><strong id="ci-review-total"></strong></div><p class="ci-muted">Tax, tip and discounts are confirmed at checkout.</p><p id="ci-review-error" class="ci-error" role="alert"></p><div class="ci-review-actions"><button type="button" data-ci-close>Back to edit</button><button type="button" class="primary" data-ci-submit></button></div></dialog>`;

  const members = () => draft.mode === 'family' ? draft.members : draft.members.slice(0, 1);
  const active = () => draft.members.find(member => member.id === activeId) || draft.members[0];
  const memberName = member => member === draft.members[0] ? (draft.contact.name.trim() || 'Primary guest') : (member.name.trim() || 'Guest ' + (draft.members.indexOf(member) + 1));
  const totals = list => list.flatMap(member => member.tickets).reduce((total, line) => {
    if (line.price == null) total.pending = true;
    else total.cents += Math.round(line.price * 100);
    return total;
  }, {cents: 0, pending: false});
  const estimate = list => {const total = totals(list); return money(total.cents) + (total.pending ? ' + pricing pending' : '');};
  const linePrice = line => line.price == null ? 'Price at checkout' : money(Math.round(line.price * 100));
  const categoryName = service => service.categoryName || service.requiredSkill || 'Other services';
  const ticketLink = id => 'pos-front-desk-tickets.html?ticketId=' + encodeURIComponent(id) + '&mode=edit';

  function renderSummary() {
    const list = members();
    $('#ci-summary-name').textContent = draft.contact.name.trim() || 'Primary contact';
    $('#ci-summary-phone').textContent = draft.contact.phone.trim() || 'Add a mobile phone';
    $('#ci-contact-avatar').textContent = (draft.contact.name.trim() || 'Guest').split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
    $('#ci-mode-badge').textContent = draft.mode === 'family' ? 'Family / Group' : 'Single guest';
    $('#ci-summary-guests').textContent = list.length;
    $('#ci-summary-services').textContent = list.reduce((count, member) => count + member.tickets.length, 0);
    $('#ci-summary-total').textContent = estimate(list);
    $('#ci-summary-members').innerHTML = list.map(member => `<div class="ci-summary-member"><span>${esc(memberName(member))}<small>${member.tickets.length} service${member.tickets.length === 1 ? '' : 's'}</small></span><strong>${esc(estimate([member]))}</strong></div>`).join('');
    $('#ci-active-name').textContent = memberName(active());
    $('#ci-active-count').textContent = active().tickets.length + ' selected';
    $('[data-ci-remove-member]')?.setAttribute('aria-label', 'Remove ' + memberName(active()));
    $('#ci-member-tabs').innerHTML = draft.members.map(member => `<button type="button" data-ci-member="${esc(member.id)}" aria-pressed="${member.id === activeId}">${esc(memberName(member))}<span>${member.tickets.length}</span></button>`).join('');
  }
  function renderMember() {
    const member = active();
    $('#ci-family').hidden = draft.mode !== 'family';
    root.querySelectorAll('[data-ci-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.ciMode === draft.mode)));
    const first = member === draft.members[0];
    $('#ci-member-editor').innerHTML = first ? '<p class="ci-primary-member">Primary contact · Name and phone are entered above.</p>' : `<div class="ci-member-fields"><label>Member name <span class="ci-muted">(optional)</span><input id="ci-member-name" maxlength="100" value="${esc(member.name)}" placeholder="${esc(memberName(member))}"></label><label>Relationship <span class="ci-muted">(optional)</span><select id="ci-member-relationship">${['', 'Spouse / Partner', 'Child', 'Parent', 'Friend', 'Other'].map(value => `<option value="${esc(value)}" ${member.relationship === value ? 'selected' : ''}>${esc(value || 'Select relationship')}</option>`).join('')}</select></label><button type="button" data-ci-remove-member aria-label="Remove ${esc(memberName(member))}">Remove</button></div>`;
    $('#ci-selected-services').innerHTML = member.tickets.length ? member.tickets.map((line, index) => `<article class="ci-service-line" data-ci-line="${esc(line.id)}"><span class="ci-line-number">${index + 1}</span><div class="ci-line-copy"><strong>${esc(line.serviceName)}</strong><small>${line.durationMin} min · ${esc(linePrice(line))}</small></div><label>Preferred technician<select data-ci-technician="${esc(line.id)}"><option value="">Anyone available</option>${catalog.technicians.filter(tech => tech.active).map(tech => `<option value="${esc(tech.id)}" ${line.technicianId === tech.id ? 'selected' : ''}>${esc(tech.name)}</option>`).join('')}</select></label><button type="button" data-ci-remove-service="${esc(line.id)}" aria-label="Remove ${esc(line.serviceName)} service ${index + 1}">×</button></article>`).join('') : '<p class="ci-services-empty">No services selected yet. You can check in now and choose later.</p>';
    renderSummary();
  }
  function renderCatalog() {
    const services = catalog.services.filter(service => service.active);
    const categories = ['All', ...new Set(services.map(categoryName))];
    if (!categories.includes(category)) category = 'All';
    $('#ci-categories').innerHTML = categories.map(name => `<button type="button" data-ci-category="${esc(name)}" aria-pressed="${category === name}">${esc(name)}</button>`).join('');
    const matches = services.filter(service => (category === 'All' || categoryName(service) === category) && (service.name + ' ' + (service.aliases || []).join(' ')).toLowerCase().includes(search.toLowerCase().trim()));
    $('#ci-catalog-results').innerHTML = matches.length ? matches.map(service => `<button type="button" class="ci-service-card" data-ci-add-service="${esc(service.id)}"><span class="ci-service-icon" aria-hidden="true">${esc(service.icon || '✦')}</span><span class="ci-card-copy"><strong>${esc(service.name)}</strong><small>${service.durationMin} min · ${esc(categoryName(service))}</small></span><span class="ci-card-price">${esc(linePrice(service))}<b aria-hidden="true">＋</b></span></button>`).join('') : '<p class="ci-services-empty">No services match your search and category.</p>';
  }
  function renderBooking() {
    const selected = $('#ci-selected-booking');
    selected.hidden = !draft.appointmentId;
    selected.innerHTML = draft.appointmentId ? '<span>✓ Using the selected booking for the primary guest.</span><button type="button" data-ci-clear-booking>Use a new visit</button>' : '';
  }
  function detachBooking() {
    if (!draft.appointmentId) return;
    delete draft.appointmentId;
    catalog = window.NEXORA_SALON_DATA.loadCatalog();
    draft.members[0].tickets = draft.members[0].tickets.map(line => {
      const service = catalog.services.find(item => item.id === line.serviceId);
      return service ? {...line, serviceName: service.name, price: service.price, durationMin: service.durationMin} : line;
    });
    renderMember(); renderCatalog(); renderBooking();
  }
  function lookup() {
    const phone = phoneKey(draft.contact.phone);
    if (!/^\d{10}$/.test(phone)) {$('#ci-lookup-results').textContent = 'Enter a complete mobile phone to find a guest.'; return;}
    const records = store.loadAll().filter(record => phoneKey(record.phone) === phone).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (!records.length) {$('#ci-lookup-results').textContent = 'New guest — enter their name to continue.'; return;}
    if (!draft.contact.name.trim()) {
      draft.contact.name = records[0].metadata.checkIn?.contact?.name || records[0].customerName;
      $('#ci-contact-name').value = draft.contact.name;
      renderSummary();
    }
    const today = new Date();
    const isToday = value => new Date(value).toDateString() === today.toDateString();
    const bookings = records.filter(record => ['pending', 'confirmed'].includes(record.status) && isToday(record.startAt));
    let saved = {};
    try {saved = JSON.parse(localStorage.getItem('nexora:front-desk-ticket-workspaces:v1') || '{}');} catch (_) {}
    const open = records.filter(record => record.status === 'checked-in' && record.metadata.checkIn && !saved?.[record.id]?.payment && !saved?.[record.id]?.cancelled);
    $('#ci-lookup-results').innerHTML = `<p>Guest found: <strong>${esc(draft.contact.name)}</strong></p>` + bookings.map(record => `<div class="ci-lookup-row"><span>Today · ${esc(new Date(record.startAt).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'}))} · ${esc(record.serviceNames.join(', ') || 'Services to be selected')}</span><button type="button" data-ci-booking="${esc(record.id)}">Use booking</button></div>`).join('') + (open.length ? `<div class="ci-open-visits"><strong>${open.length} open ticket${open.length === 1 ? '' : 's'} using this phone</strong>${open.map(record => `<a href="${esc(ticketLink(record.id))}">${esc(record.customerName)} · #${esc(record.metadata.checkIn.ticketNumber)}</a>`).join('')}<button type="button" data-ci-another>Check in another guest</button></div>` : '');
  }
  function validation() {
    if (!draft.contact.name.trim()) return {message: 'Enter the primary contact’s name.', field: '#ci-contact-name'};
    if (!/^\d{10}$/.test(phoneKey(draft.contact.phone))) return {message: 'Enter a complete 10-digit mobile phone.', field: '#ci-contact-phone'};
    return null;
  }
  function review() {
    if (submitted) return;
    const error = validation();
    $('#ci-error').textContent = error?.message || '';
    if (error) {$(error.field).focus(); return;}
    $('#ci-review-contact').textContent = draft.contact.name.trim() + ' · ' + draft.contact.phone.trim() + ' · Primary contact';
    $('#ci-review-members').innerHTML = members().map(member => `<article class="ci-review-member"><div><strong>${esc(memberName(member))}</strong><span>${esc(estimate([member]))}</span></div>${member.relationship ? '<p class="ci-muted">' + esc(member.relationship) + '</p>' : ''}${member.tickets.length ? member.tickets.map(line => `<p><span>${esc(line.serviceName)}<small>${esc(catalog.technicians.find(tech => tech.id === line.technicianId)?.name || 'Anyone available')} · ${line.durationMin} min</small></span><b>${esc(linePrice(line))}</b></p>`).join('') : '<p class="ci-muted">Services can be selected later at the front desk.</p>'}</article>`).join('');
    $('#ci-review-total').textContent = estimate(members());
    $('#ci-review-error').textContent = '';
    $('[data-ci-submit]').textContent = 'Check In ' + members().length + ' Guest' + (members().length === 1 ? '' : 's');
    $('[data-ci-submit]').disabled = false;
    $('#ci-review-dialog').showModal();
  }
  function submit() {
    const button = $('[data-ci-submit]');
    if (submitted || button.disabled) return;
    button.disabled = true;
    try {
      const result = store.checkIn({...draft, members: members()});
      if (!result.ok) {$('#ci-review-error').textContent = result.error.message; button.disabled = false; return;}
      submitted = true;
      $('#ci-review-dialog').close();
      $('#ci-entry').hidden = true;
      $('#ci-success').hidden = false;
      $('#ci-success-copy').textContent = result.records.length + ' guest' + (result.records.length === 1 ? ' is' : 's are') + ' in the waiting queue. Your tickets are ready.';
      $('#ci-success-tickets').innerHTML = result.records.map(record => `<a class="ci-success-ticket" data-ci-ticket-link href="${esc(ticketLink(record.id))}"><span><small>Ticket</small><strong>#${esc(record.metadata.checkIn.ticketNumber)}</strong></span><span><strong>${esc(record.customerName)}</strong><small>${record.tickets.length} service${record.tickets.length === 1 ? '' : 's'} · Waiting</small></span><span aria-hidden="true">↗</span></a>`).join('');
      $('#ci-success-title').focus();
    } catch (_) {
      $('#ci-review-error').textContent = 'Unable to save this check-in. Your details are still here. Please try again.';
      button.disabled = false;
    }
  }

  root.addEventListener('input', event => {
    const input = event.target;
    if (input.id === 'ci-contact-name') {draft.contact.name = input.value; renderSummary();}
    if (input.id === 'ci-contact-phone') {
      if (phoneKey(draft.contact.phone) !== phoneKey(input.value)) {detachBooking(); $('#ci-lookup-results').textContent = '';}
      draft.contact.phone = input.value; renderSummary();
    }
    if (input.id === 'ci-member-name') {active().name = input.value; renderSummary();}
    if (input.id === 'ci-service-search') {search = input.value; renderCatalog();}
  });
  root.addEventListener('change', event => {
    const input = event.target;
    if (input.id === 'ci-consent') draft.smsConsent = input.checked;
    if (input.id === 'ci-member-relationship') active().relationship = input.value;
    if (input.hasAttribute('data-ci-technician')) {
      const line = active().tickets.find(ticket => ticket.id === input.dataset.ciTechnician);
      if (line) line.technicianId = input.value || null;
    }
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-ci-mode')) {
      draft.mode = button.dataset.ciMode;
      if (draft.mode === 'family' && draft.members.length === 1) draft.members.push(newMember());
      activeId = draft.members[draft.mode === 'family' ? 1 : 0].id;
      renderMember();
    }
    if (button.hasAttribute('data-ci-add-member')) {const member = newMember(); draft.members.push(member); activeId = member.id; renderMember(); $('#ci-member-name').focus();}
    if (button.hasAttribute('data-ci-member')) {activeId = button.dataset.ciMember; renderMember(); $('[data-ci-member="' + activeId + '"]').focus();}
    if (button.hasAttribute('data-ci-remove-member')) {
      if (active() === draft.members[0]) return;
      draft.members = draft.members.filter(member => member.id !== activeId);
      activeId = draft.members[0].id;
      if (draft.members.length === 1) draft.mode = 'single';
      renderMember();
    }
    if (button.hasAttribute('data-ci-add-service')) {
      const service = catalog.services.find(item => item.id === button.dataset.ciAddService && item.active);
      if (service) {active().tickets.push({id: crypto.randomUUID(), serviceId: service.id, serviceName: service.name, price: service.price, durationMin: service.durationMin, technicianId: null}); renderMember();}
    }
    if (button.hasAttribute('data-ci-remove-service')) {active().tickets = active().tickets.filter(line => line.id !== button.dataset.ciRemoveService); renderMember();}
    if (button.hasAttribute('data-ci-category')) {category = button.dataset.ciCategory; renderCatalog(); [...root.querySelectorAll('[data-ci-category]')].find(item => item.dataset.ciCategory === category)?.focus();}
    if (button.hasAttribute('data-ci-lookup')) lookup();
    if (button.hasAttribute('data-ci-another')) {$('#ci-lookup-results').textContent = 'Checking in another guest with this contact phone.'; $('#ci-contact-name').focus();}
    if (button.hasAttribute('data-ci-booking')) {
      const record = store.loadAll().find(row => row.id === button.dataset.ciBooking);
      if (!record) return;
      draft.appointmentId = record.id;
      draft.contact.name = record.customerName;
      $('#ci-contact-name').value = record.customerName;
      draft.members[0].tickets = record.tickets.map(line => ({...line}));
      activeId = draft.members[0].id;
      renderMember(); renderBooking();
    }
    if (button.hasAttribute('data-ci-clear-booking')) detachBooking();
    if (button.hasAttribute('data-ci-review')) review();
    if (button.hasAttribute('data-ci-close')) $('#ci-review-dialog').close();
    if (button.hasAttribute('data-ci-submit')) submit();
    if (button.hasAttribute('data-ci-new')) {
      reset();
      ['#ci-contact-name', '#ci-contact-phone', '#ci-service-search'].forEach(selector => {$(selector).value = '';});
      $('#ci-consent').checked = false;
      $('#ci-lookup-results').textContent = ''; $('#ci-error').textContent = '';
      $('#ci-entry').hidden = false; $('#ci-success').hidden = true;
      catalog = window.NEXORA_SALON_DATA.loadCatalog();
      renderBooking(); renderMember(); renderCatalog(); $('#ci-contact-phone').focus();
    }
  });

  function renderSection() {
    const params = new URLSearchParams(location.search);
    const checkin = (params.get('section') || params.get('tab')) === 'checkin';
    root.hidden = !checkin;
    if (!checkin) {if ($('#ci-review-dialog').open) $('#ci-review-dialog').close(); return;}
    ['#appointments', '#service-assignments', '#front-desk-estimate'].forEach(selector => {const section = document.querySelector(selector); if (section) section.hidden = true;});
    document.querySelectorAll('[data-front-section]').forEach(link => {
      const selected = link.dataset.frontSection === 'checkin';
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  document.querySelector('[data-front-section="checkin"]').addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const url = new URL(location.href);
    url.searchParams.set('section', 'checkin'); url.searchParams.set('tab', 'checkin');
    ['ticket', 'view', 'calendarView'].forEach(key => url.searchParams.delete(key));
    if (url.href !== location.href) history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  window.addEventListener('popstate', renderSection);
  catalog = window.NEXORA_SALON_DATA.loadCatalog();
  renderMember(); renderCatalog(); renderSection();
})();
