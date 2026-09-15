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
  const newMember = () => ({id: crypto.randomUUID(), name: '', relationship: 'Family member', tickets: []});
  let draft, activeId, category = 'All', search = '', catalog, submitted = false, toastTimer;
  function reset() {
    draft = {id: crypto.randomUUID(), mode: 'single', contact: {name: '', phone: ''}, smsConsent: false, members: [newMember()]};
    activeId = draft.members[0].id;
    submitted = false;
    search = ''; category = 'All';
  }
  reset();

  const icon = name => '<svg class="ci-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ({
    user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8m6 9a7 7 0 0 0-4-6.3"/>',
    add: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0m4-14v6m-3-3h6"/>',
    trash: '<path d="M3 6h18M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-5 4v7m4-7v7"/>',
    search: '<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
    link: '<path d="M9 17H7a5 5 0 0 1 0-10h2m6 0h2a5 5 0 0 1 0 10h-2M8 12h8"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    receipt: '<path d="M4 3v18l4-2 4 2 4-2 4 2V3l-4 2-4-2-4 2-4-2Zm4 6h8m-8 4h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  }[name] || '') + '</svg>';
  root.innerHTML = `
    <div class="ci-heading"><div><h2>Nice to meet you!</h2><p>Tell us who we’re checking in and add family members when needed.</p></div><span class="ci-step"><strong>1</strong> Build check-in</span></div>
    <div id="ci-entry" class="ci-layout">
      <div class="ci-main ci-surface">
        <section aria-labelledby="ci-contact-title">
          <h3 id="ci-contact-title">${icon('user')}Primary contact</h3><p class="ci-subcopy">Only this person needs a name and mobile phone.</p>
          <div class="ci-contact-fields"><label>Mobile phone <b>*</b><input id="ci-contact-phone" type="tel" autocomplete="tel" maxlength="24" required></label><label>Name <b>*</b><input id="ci-contact-name" autocomplete="name" maxlength="100" required></label></div>
          <label class="ci-consent"><input id="ci-consent" type="checkbox"><span>Text me offers, reminders &amp; rewards from Nexora Touch Nail Spa. Message and data rates may apply.</span></label>
        </section>
        <section class="ci-section" aria-labelledby="ci-mode-title">
          <h3 id="ci-mode-title">${icon('users')}Who are you checking in?</h3><p class="ci-subcopy">The single-guest flow stays fast. Family mode adds a separate ticket for each person.</p>
          <div class="ci-mode-grid" role="group" aria-label="Check-in mode">
            <button type="button" data-ci-mode="single" aria-pressed="true"><span class="ci-mode-icon">${icon('user')}</span><span><strong>Just me</strong><small>One guest, one ticket</small></span></button>
            <button type="button" data-ci-mode="family" aria-pressed="false"><span class="ci-mode-icon">${icon('users')}</span><span><strong>Family / Group</strong><small>Multiple linked tickets</small></span></button>
          </div>
          <div id="ci-family" hidden><div class="ci-member-heading"><strong>Family members</strong><button type="button" data-ci-add-member>${icon('add')}Add Family Member</button></div><div id="ci-member-tabs" role="group" aria-label="Choose a member"></div><div id="ci-member-editor"></div></div>
          <div id="ci-single-selection" class="ci-selected-list" hidden></div>
        </section>
        <section class="ci-section" aria-labelledby="ci-services-title">
          <div class="ci-active-guest">${icon('user')}<div><span>Adding services for</span><strong id="ci-active-name"></strong></div><em>Unlimited services</em></div>
          <h3 id="ci-services-title">${icon('grid')}Choose services</h3><p class="ci-subcopy">Tap as many services as needed. Every service stays with the active guest.</p>
          <label class="ci-search">${icon('search')}<input id="ci-service-search" type="search" placeholder="Search services" aria-label="Search services"></label>
          <div id="ci-categories" role="group" aria-label="Service categories"></div>
          <div id="ci-catalog-results" class="ci-service-grid"></div>
        </section>
      </div>
      <aside class="ci-summary ci-surface" aria-labelledby="ci-summary-title">
        <div class="ci-summary-heading"><h3 id="ci-summary-title">${icon('receipt')}Check-in summary</h3><span id="ci-mode-badge" class="ci-badge"></span></div>
        <div class="ci-summary-contact"><div class="ci-avatar" id="ci-contact-avatar" aria-hidden="true">G</div><div><strong id="ci-summary-name"></strong><span id="ci-summary-phone"></span></div></div>
        <div class="ci-summary-counts"><div class="ci-summary-row"><span>Guests</span><strong id="ci-summary-guests">1</strong></div><div class="ci-summary-row"><span>Selected services</span><strong id="ci-summary-services">0</strong></div></div>
        <div class="ci-summary-total"><span>Estimated total</span><strong id="ci-summary-total"></strong></div>
        <button class="primary ci-review-button" type="button" data-ci-review><span>Review Check-in</span>${icon('arrow')}</button>
        <div class="ci-summary-note">${icon('link')}<span>Family members receive separate tickets linked to one primary contact.</span></div>
      </aside>
    </div>
    <section id="ci-success" class="ci-success ci-surface" hidden aria-labelledby="ci-success-title"><span class="ci-success-icon" aria-hidden="true">${icon('check')}</span><h2 id="ci-success-title" tabindex="-1">You’re checked in!</h2><p id="ci-success-copy"></p><div id="ci-success-tickets"></div><div class="ci-success-actions"><a class="ci-primary-link" href="pos-front-desk-tickets.html"><span>View Tickets</span>${icon('arrow')}</a><button type="button" data-ci-new>${icon('plus')}<span>New Check-in</span></button></div></section>
    <dialog id="ci-review-dialog" aria-labelledby="ci-review-title">
      <header class="ci-review-heading"><h2 id="ci-review-title">Review family check-in</h2><button type="button" data-ci-close aria-label="Close review">${icon('close')}</button></header>
      <div class="ci-review-body"><div class="ci-review-contact"><div><strong id="ci-review-contact-name"></strong><span id="ci-review-contact-phone"></span></div><span id="ci-review-guest-count"></span></div><div id="ci-review-members"></div><p id="ci-review-error" class="ci-error" role="alert"></p></div>
      <footer class="ci-review-footer"><div class="ci-review-total"><strong id="ci-review-total"></strong><span>Payment is collected at checkout.</span></div><div class="ci-review-actions"><button type="button" data-ci-close>Back</button><button type="button" class="primary" data-ci-submit></button></div></footer>
    </dialog><div id="ci-toast" class="ci-toast" role="status"></div>`;

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

  const initials = name => (name.trim() || 'Guest').split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  function showToast(message) {
    $('#ci-toast').textContent = message;
    $('#ci-toast').classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => $('#ci-toast').classList.remove('show'), 2100);
  }
  function renderSummary() {
    const list = members();
    $('#ci-summary-name').textContent = draft.contact.name.trim() || 'Primary contact';
    $('#ci-summary-phone').textContent = (draft.contact.phone.trim() || 'Phone required') + ' · Primary contact';
    $('#ci-contact-avatar').textContent = initials(draft.contact.name);
    $('#ci-mode-badge').textContent = draft.mode === 'family' ? 'Family Group' : 'Single guest';
    $('#ci-summary-guests').textContent = list.length;
    $('#ci-summary-services').textContent = list.reduce((count, member) => count + member.tickets.length, 0);
    const total = totals(list);
    $('#ci-summary-total').innerHTML = money(total.cents) + (total.pending ? '<small> + pricing pending</small>' : '');
    $('#ci-active-name').textContent = memberName(active());
    $('#ci-member-tabs').innerHTML = draft.members.map((member, index) => `<button type="button" data-ci-member="${esc(member.id)}" aria-pressed="${member.id === activeId}"><strong>${esc(memberName(member))}</strong><small>${esc(index === 0 ? 'Primary contact' : member.relationship)}</small></button>`).join('');
    const editorName = $('#ci-editor-name');
    if (editorName) {editorName.textContent = memberName(active()); $('#ci-editor-avatar').textContent = initials(memberName(active()));}
  }
  function renderMember() {
    const member = active();
    const family = draft.mode === 'family';
    $('#ci-family').hidden = !family;
    root.querySelectorAll('[data-ci-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.ciMode === draft.mode)));
    const first = member === draft.members[0];
    const lines = member.tickets.map((line, index) => `<div class="ci-service-line" data-ci-line="${esc(line.id)}"><div class="ci-line-copy"><strong>${esc(line.serviceName)}</strong><small>${line.durationMin} min · ${esc(linePrice(line))}</small></div><select data-ci-technician="${esc(line.id)}" aria-label="Technician for ${esc(line.serviceName)}"><option value="">Anyone</option>${catalog.technicians.filter(tech => tech.active).map(tech => `<option value="${esc(tech.id)}" ${line.technicianId === tech.id ? 'selected' : ''}>${esc(tech.name)}</option>`).join('')}</select><button type="button" data-ci-remove-service="${esc(line.id)}" aria-label="Remove ${esc(line.serviceName)}">${icon('close')}</button></div>`).join('');
    $('#ci-member-editor').innerHTML = family ? `<div class="ci-editor-top"><div class="ci-editor-title"><div class="ci-avatar" id="ci-editor-avatar"></div><div><strong id="ci-editor-name"></strong><span>${first ? 'Required primary contact' : 'Name is optional'}</span></div></div>${first ? '' : `<button type="button" data-ci-remove-member aria-label="Remove member">${icon('trash')}</button>`}</div><div class="ci-member-fields"><label>Member name ${first ? '*' : '(optional)'}<input id="ci-member-name" maxlength="100" value="${esc(first ? draft.contact.name : member.name)}" ${first ? 'required' : ''}></label><label>Relationship (optional)<select id="ci-member-relationship">${['Family member', 'Adult', 'Child', 'Friend'].map(value => `<option ${member.relationship === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label></div><div class="ci-selected-list" id="ci-selected-services">${lines || '<div class="ci-services-empty">No services yet. Choose from the catalog below.</div>'}</div><p class="ci-member-note">No additional phone number is required.</p>` : '';
    $('#ci-single-selection').hidden = family || !member.tickets.length;
    $('#ci-single-selection').innerHTML = family ? '' : lines;
    renderSummary();
  }
  function renderCatalog() {
    const services = catalog.services.filter(service => service.active);
    const categories = ['All', ...new Set(services.map(categoryName))];
    if (!categories.includes(category)) category = 'All';
    $('#ci-categories').innerHTML = categories.map(name => `<button type="button" data-ci-category="${esc(name)}" aria-pressed="${category === name}">${esc(name)}</button>`).join('');
    const matches = services.filter(service => (category === 'All' || categoryName(service) === category) && (service.name + ' ' + (service.aliases || []).join(' ')).toLowerCase().includes(search.toLowerCase().trim()));
    $('#ci-catalog-results').innerHTML = matches.length ? matches.map(service => `<button type="button" class="ci-service-card" data-ci-add-service="${esc(service.id)}"><span class="ci-card-copy"><strong>${esc(service.name)}</strong><small>${service.durationMin} min</small></span><span class="ci-card-action"><span class="ci-card-price">${esc(linePrice(service))}</span><span class="ci-service-add">${icon('plus')}</span></span></button>`).join('') : '<p class="ci-services-empty">No services match your search and category.</p>';
  }
  function validation() {
    return !draft.contact.name.trim() || !/^\d{10}$/.test(phoneKey(draft.contact.phone)) ? 'Representative name and a complete mobile phone are required.' : '';
  }
  function review() {
    if (submitted) return;
    $('#ci-review-contact-name').textContent = (draft.contact.name.trim() || 'Primary contact') + ' · Primary contact';
    $('#ci-review-contact-phone').textContent = draft.contact.phone.trim() || 'Phone required';
    $('#ci-review-guest-count').textContent = members().length + ' guest' + (members().length === 1 ? '' : 's');
    $('#ci-review-members').innerHTML = members().map(member => `<article class="ci-review-member"><div><strong>${esc(memberName(member))}</strong><span>${esc(estimate([member]))}</span></div><div class="ci-review-services">${member.tickets.length ? member.tickets.map(line => `<p><span>${esc(line.serviceName)} · ${esc(catalog.technicians.find(tech => tech.id === line.technicianId)?.name || 'Anyone')}</span><b>${esc(linePrice(line))}</b></p>`).join('') : '<p class="ci-review-empty">Services can be selected later at the front desk.</p>'}</div></article>`).join('');
    $('#ci-review-total').textContent = estimate(members()) + ' total';
    $('#ci-review-error').textContent = validation();
    $('[data-ci-submit]').textContent = 'Check In ' + members().length + ' Guest' + (members().length === 1 ? '' : 's');
    $('[data-ci-submit]').disabled = false;
    $('#ci-review-dialog').showModal();
  }
  function submit() {
    const button = $('[data-ci-submit]');
    if (submitted || button.disabled) return;
    const error = validation();
    if (error) {$('#ci-review-error').textContent = error; return;}
    button.disabled = true;
    try {
      const result = store.checkIn({...draft, members: members()});
      if (!result.ok) {$('#ci-review-error').textContent = result.error.message; button.disabled = false; return;}
      submitted = true;
      $('#ci-review-dialog').close();
      $('#ci-entry').hidden = true;
      $('#ci-success').hidden = false;
      $('#ci-success-copy').textContent = result.records.length + ' guest' + (result.records.length === 1 ? ' is' : 's are') + ' in the waiting queue. Your tickets are ready.';
      $('#ci-success-tickets').innerHTML = result.records.map(record => `<a class="ci-success-ticket" data-ci-ticket-link href="${esc(ticketLink(record.id))}"><span><small>Ticket</small><strong>#${esc(record.metadata.checkIn.ticketNumber)}</strong></span><span><strong>${esc(record.customerName)}</strong><small>${record.tickets.length} service${record.tickets.length === 1 ? '' : 's'} · Waiting</small></span><span class="ci-ticket-arrow" aria-hidden="true">${icon('arrow')}</span></a>`).join('');
      $('#ci-success-title').focus();
    } catch (_) {
      $('#ci-review-error').textContent = 'Unable to save this check-in. Your details are still here. Please try again.';
      button.disabled = false;
    }
  }

  root.addEventListener('input', event => {
    const input = event.target;
    if (input.id === 'ci-contact-name') {
      draft.contact.name = input.value;
      if (active() === draft.members[0] && $('#ci-member-name')) $('#ci-member-name').value = input.value;
      renderSummary();
    }
    if (input.id === 'ci-contact-phone') {draft.contact.phone = input.value; renderSummary();}
    if (input.id === 'ci-member-name') {
      if (active() === draft.members[0]) {draft.contact.name = input.value; $('#ci-contact-name').value = input.value;}
      else active().name = input.value;
      renderSummary();
    }
    if (input.id === 'ci-service-search') {search = input.value; renderCatalog();}
  });
  root.addEventListener('change', event => {
    const input = event.target;
    if (input.id === 'ci-consent') draft.smsConsent = input.checked;
    if (input.id === 'ci-member-relationship') {active().relationship = input.value; renderSummary();}
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
      activeId = draft.members[0].id;
      renderMember();
    }
    if (button.hasAttribute('data-ci-add-member')) {const member = newMember(); member.name = 'Guest ' + (draft.members.length + 1); draft.members.push(member); activeId = member.id; renderMember(); $('#ci-member-name').focus();}
    if (button.hasAttribute('data-ci-member')) {activeId = button.dataset.ciMember; renderMember(); $('[data-ci-member="' + activeId + '"]').focus();}
    if (button.hasAttribute('data-ci-remove-member')) {
      if (active() === draft.members[0]) return;
      if (active().tickets.length && !window.confirm('Remove ' + memberName(active()) + ' and selected services?')) return;
      draft.members = draft.members.filter(member => member.id !== activeId);
      activeId = draft.members[0].id;
      renderMember();
    }
    if (button.hasAttribute('data-ci-add-service')) {
      const service = catalog.services.find(item => item.id === button.dataset.ciAddService && item.active);
      if (service) {active().tickets.push({id: crypto.randomUUID(), serviceId: service.id, serviceName: service.name, price: service.price, durationMin: service.durationMin, technicianId: null}); renderMember(); showToast(service.name + ' added to ' + memberName(active()));}
    }
    if (button.hasAttribute('data-ci-remove-service')) {active().tickets = active().tickets.filter(line => line.id !== button.dataset.ciRemoveService); renderMember();}
    if (button.hasAttribute('data-ci-category')) {category = button.dataset.ciCategory; renderCatalog(); [...root.querySelectorAll('[data-ci-category]')].find(item => item.dataset.ciCategory === category)?.focus();}
    if (button.hasAttribute('data-ci-review')) review();
    if (button.hasAttribute('data-ci-close')) $('#ci-review-dialog').close();
    if (button.hasAttribute('data-ci-submit')) submit();
    if (button.hasAttribute('data-ci-new')) {
      reset();
      ['#ci-contact-name', '#ci-contact-phone', '#ci-service-search'].forEach(selector => {$(selector).value = '';});
      $('#ci-consent').checked = false;
      $('#ci-entry').hidden = false; $('#ci-success').hidden = true;
      catalog = window.NEXORA_SALON_DATA.loadCatalog();
      renderMember(); renderCatalog(); $('#ci-contact-phone').focus();
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
