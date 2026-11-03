(() => {
  'use strict';
  const dialog = document.getElementById('contact-card-modal');
  if (!dialog) return;
  const profile = window.NEXORA_ONEQR_PROFILE;
  const cardKey = 'taxiq:oneqr-contact-review:card';
  const configKey = 'taxiq:oneqr-contact-review:config';
  const $ = selector => dialog.querySelector(selector);
  const $$ = selector => [...dialog.querySelectorAll(selector)];
  const esc = profile.escapeText;
  const icons = () => window.lucide?.createIcons();
  const clone = value => JSON.parse(JSON.stringify(value));
  const roster = [
    { id: 'mary-nguyen', name: 'Mary Nguyen', role: 'manager', avatar: '../oneqr-dev/assets/avatars/mary-demo.jpg' },
    { id: 'kim-nguyen', name: 'Kim Nguyen', role: 'technician', avatar: '../oneqr-dev/assets/avatars/kim-demo.jpg' },
    { id: 'chloe', name: 'Chloe', role: 'technician', avatar: '' }
  ];
  const groupTitle = group => group === 'manager' ? 'Manager' : 'Technician';
  const member = id => roster.find(person => person.id === id);
  const contactGroup = contact => contact.role || member(contact.memberId)?.role || '';
  const contactName = contact => contact.name ?? member(contact.memberId)?.name ?? '';
  const team = card => (card.teamContacts || []).filter(person => person && person.id && person.memberId);
  function isContactModule(name, details = {}) {
    return ['Contact', 'Save contact', 'Contact card', 'Contact Card'].includes(name) || ['contact', 'vcard'].includes(details.catalogType);
  }
  function settings() {
    try { return JSON.parse(localStorage.getItem(configKey) || 'null'); }
    catch { return null; }
  }
  function isEnabled() {
    const saved = settings();
    if (!saved || saved.enabled === false || saved.oneqrEnabled === false) return false;
    const order = saved.moduleOrderByRole?.customer || [];
    const enabled = saved.enabledByRole?.customer || [];
    return order.some(name => enabled.includes(name) && isContactModule(name, saved.moduleDetailsByRole?.customer?.[name]));
  }
  function cardFor(shop, id = 'shop') {
    if (id === 'shop') return { ...shop, company: shop.name, contactId: 'shop', avatar: '' };
    const contact = team(shop).find(person => person.id === id && person.shopId === shop.shopId);
    const person = contact && member(contact.memberId);
    if (!person) return null;
    return { ...shop, name: contactName(contact), title: contact.title, company: shop.name, contactId: contact.id, avatar: person.avatar };
  }
  function contactUrl(id) {
    const url = new URL(profile.pageUrl());
    url.searchParams.set('contact', id);
    return url.href;
  }
  function avatar(person, extra = '') {
    return '<span class="contact-team-avatar ' + extra + '" aria-hidden="true">' + esc(person.name.trim().charAt(0).toUpperCase()) + (person.avatar ? '<img src="' + esc(person.avatar) + '" alt="" data-contact-photo>' : '') + '</span>';
  }
  document.addEventListener('error', event => {
    if (event.target.matches?.('[data-contact-photo]')) event.target.remove();
  }, true);
  const fieldMap = {
    name: '#contact-name', title: '#contact-title', email: '#contact-email', website: '#contact-website',
    address: '#contact-address', city: '#contact-city', region: '#contact-state', zip: '#contact-zip',
    bio: '#contact-bio', blurb: '#contact-blurb', openTime: '#contact-open-time', closeTime: '#contact-close-time'
  };
  $('[data-contact-phone]').innerHTML = window.NEXORA_ONEQR_PHONE.markup('contact-phone');
  const phone = window.NEXORA_ONEQR_PHONE.mount($('[data-contact-phone]'));
  let draft = clone(profile.read());
  let baseline = '';
  let addActionBaseline = true;
  let tab = 'shop';
  let selectedPreview = 'shop';
  let opener;
  const say = message => { $('#contact-feedback').textContent = message; };
  function readShop() {
    Object.entries(fieldMap).forEach(([key, selector]) => { draft[key] = $(selector).value.trim(); });
    draft.phone = phone.read();
    draft.addressMode = $('[name="contact-address-mode"]:checked')?.value || 'full';
    draft.showPhone = $('#contact-show-phone').checked;
    draft.showHours = $('#contact-show-hours').checked;
    draft.closedDays = $$('#contact-closed-days input:checked').map(input => Number(input.value));
  }
  function fillShop() {
    Object.entries(fieldMap).forEach(([key, selector]) => { $(selector).value = draft[key] || ''; });
    phone.set(draft.phone);
    $$('[name="contact-address-mode"]').forEach(input => { input.checked = input.value === draft.addressMode; });
    $('#contact-show-phone').checked = Boolean(draft.showPhone);
    $('#contact-show-hours').checked = Boolean(draft.showHours);
    $$('#contact-closed-days input').forEach(input => { input.checked = (draft.closedDays || []).includes(Number(input.value)); });
    $$('[data-contact-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.contactTheme === draft.theme)));
  }
  function sync() {
    const enabled = isEnabled();
    document.querySelectorAll('[data-contact-customer-state]').forEach(node => {
      node.textContent = enabled ? 'Shown on customer page' : 'Hidden from customer page';
      node.classList.toggle('is-shown', enabled);
    });
    document.querySelectorAll('.oneqr-phone-quick-actions [data-review-open-contact]').forEach(button => { button.hidden = !enabled; });
    if (dialog.open) renderTeam();
    if (picker.open) renderPicker();
    if (menu.open && !enabled) { menu.close(); pageFeedback('This contact is unavailable'); }
  }
  function changed() {
    $('#contact-unsaved').hidden = JSON.stringify(draft) === baseline && $('#contact-add-action').checked === addActionBaseline;
    renderPreview();
  }
  function setTab(next, focus = false) {
    tab = next;
    $$('[data-contact-tab]').forEach(button => {
      const active = button.dataset.contactTab === next;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
    $('#contact-shop-panel').hidden = next !== 'shop';
    $('#contact-team-panel').hidden = next !== 'team';
    if (next !== 'team') closeMemberPicker();
  }
  function shareState(contact) {
    const saved = team(profile.read()).find(person => person.id === contact.id && person.shopId === draft.shopId);
    if (!saved) return 'Save this contact to get a link.';
    if (!contact.public || !saved.public || !member(contact.memberId)) return 'Turn on Public contact to share this contact.';
    return '';
  }
  function savePublicContact(contact, publicState) {
    const card = clone(profile.read());
    let savedContact = team(card).find(person => person.id === contact.id && person.shopId === draft.shopId);
    if (!savedContact) {
      const name = contactName(contact).trim();
      if (!name) {
        const field = $('#contact-team-list').querySelector('[data-contact-row="' + CSS.escape(contact.id) + '"] [data-team-name]');
        field.value = '';
        field.setAttribute('aria-invalid', 'true');
        field.reportValidity();
        return false;
      }
      savedContact = { ...contact, name, role: contactGroup(contact), group: contactGroup(contact), title: contact.title?.trim() || groupTitle(contactGroup(contact)) };
      card.teamContacts.push(savedContact);
    }
    savedContact.public = publicState;
    card.configured = true;
    try { localStorage.setItem(cardKey, JSON.stringify(card)); }
    catch { say('Could not save the contact card. Please try again.'); return false; }
    contact.public = publicState;
    draft.configured = true;
    const baselineCard = JSON.parse(baseline);
    baselineCard.configured = true;
    const baselineContact = team(baselineCard).find(person => person.id === contact.id && person.shopId === draft.shopId);
    if (baselineContact) baselineContact.public = publicState;
    else baselineCard.teamContacts.push(clone(savedContact));
    baseline = JSON.stringify(baselineCard);
    document.dispatchEvent(new CustomEvent('oneqr:contact-saved', { detail: { card, addAction: false } }));
    say('Contact card saved.');
    return true;
  }
  function renderTeam() {
    const contacts = team(draft);
    $('#contact-team-count').textContent = contacts.length;
    $('#contact-team-list').innerHTML = contacts.length ? contacts.map(contact => {
      const person = member(contact.memberId);
      const note = shareState(contact);
      const role = contactGroup(contact);
      return '<article class="contact-team-row' + (selectedPreview === contact.id ? ' is-active' : '') + '" data-contact-row="' + esc(contact.id) + '" tabindex="0" aria-label="' + esc(contactName(contact) || 'Contact') + '"' + (selectedPreview === contact.id ? ' aria-current="true"' : '') + '>' +
        '<div class="contact-team-identity">' + avatar({ name: contactName(contact), avatar: person?.avatar }) + '<div class="contact-inline-fields"><label class="contact-field"><span>Name</span><input type="text" data-team-name value="' + esc(contactName(contact)) + '" maxlength="100" autocomplete="off" required></label><label class="contact-field"><span>Role</span><select data-team-role aria-label="Role"><option value="manager"' + (role === 'manager' ? ' selected' : '') + '>Manager</option><option value="technician"' + (role === 'technician' ? ' selected' : '') + '>Technician</option></select></label></div></div>' +
        '<div class="contact-team-row-controls"><label class="contact-public-switch contact-row-public"><span>Public contact</span><input type="checkbox" role="switch" data-team-public' + (contact.public ? ' checked' : '') + '></label>' +
        '<div class="contact-team-actions"><button type="button" data-team-action="copy"' + (note ? ' disabled' : '') + '>Copy link</button><button type="button" data-team-action="qr"' + (note ? ' disabled' : '') + '>View QR</button><button type="button" data-team-action="download"' + (note ? ' disabled' : '') + '>Download QR</button></div><button type="button" class="contact-remove-button" data-team-action="remove">Remove</button></div>' +
        (note ? '<p class="contact-share-note">' + esc(note) + '</p>' : '') + '</article>';
    }).join('') : '<div class="contact-team-empty"><img src="../assets/icon-oneqr/issue-2040-oneqr-users-round-3d.png" alt=""><strong>No team contacts yet</strong></div>';
  }
  function renderPreview() {
    const options = [{ id: 'shop', name: draft.name || 'Your business' }].concat(team(draft).map(contact => ({ id: contact.id, name: contactName(contact).toUpperCase() })));
    if (!options.some(option => option.id === selectedPreview)) selectedPreview = 'shop';
    const select = $('#contact-preview-person');
    select.innerHTML = options.map(option => '<option value="' + esc(option.id) + '">' + esc(option.name) + '</option>').join('');
    select.value = selectedPreview;
    const card = cardFor(draft, selectedPreview) || cardFor(draft);
    const person = selectedPreview !== 'shop';
    const name = card.name || 'Your business';
    $('#contact-card-preview').dataset.theme = draft.theme;
    $('#contact-preview-avatar').innerHTML = esc(name.charAt(0).toUpperCase()) + (card.avatar ? '<img src="' + esc(card.avatar) + '" alt="" data-contact-photo>' : '');
    $('#contact-preview-name').textContent = person ? name.toUpperCase() : name;
    $('#contact-preview-title').textContent = card.title || 'Business contact';
    $('#contact-preview-company').hidden = !person;
    $('#contact-preview-company').textContent = card.company;
    $('#contact-preview-bio').textContent = card.bio;
    const details = { phone: card.showPhone ? card.phone : '', email: card.email, website: card.website, address: profile.address(card), hours: profile.hours(card) };
    Object.entries(details).forEach(([key, value]) => {
      $('#contact-preview-' + key).textContent = key === 'phone' ? formatPhone(value) : value;
      $('#contact-preview-' + key + '-row').hidden = !value;
    });
    $('#contact-hours-row').hidden = !draft.showHours;
    $('#contact-closed-days').hidden = !draft.showHours;
    $('[data-review-draft-action="call"]').hidden = !details.phone;
    $('[data-review-draft-action="directions"]').hidden = draft.addressMode !== 'full' || !details.address;
    syncActiveContact();
    icons();
  }
  function syncActiveContact() {
    $$('#contact-team-list [data-contact-row]').forEach(row => {
      const active = row.dataset.contactRow === selectedPreview;
      row.classList.toggle('is-active', active);
      if (active) row.setAttribute('aria-current', 'true');
      else row.removeAttribute('aria-current');
    });
  }
  function selectContact(id) {
    selectedPreview = id;
    renderPreview();
  }
  function formatPhone(value) {
    return String(value || '').replace(/^\+1\s*/, '');
  }
  function results() {
    const search = $('#contact-member-search').value.trim().toLowerCase();
    const choices = roster.filter(person => (person.name + ' ' + groupTitle(person.role)).toLowerCase().includes(search));
    const groups = [{ role: 'manager', label: 'Managers' }, { role: 'technician', label: 'Technicians' }];
    $('#contact-member-groups').innerHTML = choices.length ? groups.map(group => {
      const people = choices.filter(person => person.role === group.role);
      if (!people.length) return '';
      return '<fieldset class="contact-member-group"><legend>' + group.label + '</legend>' + people.map(person => {
        const duplicate = team(draft).some(contact => contact.memberId === person.id);
        return '<div class="contact-member-option">' + avatar(person) + '<span><strong>' + esc(person.name.toUpperCase()) + '</strong><small>' + groupTitle(person.role) + '</small></span>' + (duplicate ? '<span class="contact-member-added">Added</span>' : '<button type="button" class="contact-review-button is-primary" data-add-member="' + esc(person.id) + '" aria-label="Add ' + esc(person.name) + '">Add</button>') + '</div>';
      }).join('') + '</fieldset>';
    }).join('') : '<p class="contact-share-note">' + (roster.length ? 'No matching team members' : 'No team contacts yet') + '</p>';
    icons();
  }
  function addMember(id) {
    const person = member(id);
    if (!person || team(draft).some(contact => contact.memberId === id)) return;
    draft.teamContacts.push({
      id: person.id, memberId: person.id, shopId: draft.shopId, name: person.name,
      role: person.role, group: person.role, title: groupTitle(person.role), public: true
    });
    selectedPreview = person.id;
    renderTeam(); changed(); results(); openMemberPicker();
    ($('#contact-member-results [data-add-member]') || $('#contact-member-search')).focus();
  }
  function openMemberPicker() {
    if (!$('#contact-member-results').hidden) return;
    results();
    $('#contact-member-results').hidden = false;
    $('#contact-member-search').setAttribute('aria-expanded', 'true');
    $('[data-contact-member-combobox]').classList.add('is-open');
  }
  function closeMemberPicker() {
    $('#contact-member-results').hidden = true;
    $('#contact-member-search').setAttribute('aria-expanded', 'false');
    $('[data-contact-member-combobox]').classList.remove('is-open');
  }
  function open() {
    opener = document.activeElement;
    draft = clone(profile.read());
    baseline = JSON.stringify(draft);
    selectedPreview = 'shop';
    fillShop();
    addActionBaseline = true;
    $('#contact-add-action').checked = addActionBaseline;
    $('#contact-member-search').value = '';
    closeMemberPicker(); setTab('shop'); renderTeam(); changed(); sync(); say('');
    dialog.showModal();
  }
  function validate() {
    const missingName = team(draft).find(contact => !contactName(contact).trim());
    if (missingName) {
      setTab('team');
      const field = $('#contact-team-list').querySelector('[data-contact-row="' + CSS.escape(missingName.id) + '"] [data-team-name]');
      field.setAttribute('aria-invalid', 'true');
      field.value = '';
      field.reportValidity();
      return false;
    }
    const invalid = team(draft).find(contact => !['manager', 'technician'].includes(contactGroup(contact)));
    if (invalid) {
      setTab('team'); selectContact(invalid.id);
      say('This contact is unavailable');
      const field = $('#contact-team-list').querySelector('[data-contact-row="' + CSS.escape(invalid.id) + '"] [data-team-role]');
      field.setAttribute('aria-invalid', 'true'); field.focus();
      return false;
    }
    const duplicates = new Set();
    for (const contact of team(draft)) {
      if (duplicates.has(contact.memberId)) { setTab('team'); selectContact(contact.id); return false; }
      duplicates.add(contact.memberId);
    }
    const fields = $$('#contact-shop-panel input, #contact-shop-panel textarea');
    const invalidShop = fields.find(field => !field.checkValidity());
    if (invalidShop) { setTab('shop'); invalidShop.reportValidity(); return false; }
    return true;
  }
  $('#contact-card-form').addEventListener('submit', event => {
    event.preventDefault(); readShop();
    if (!validate()) return;
    const card = { ...draft, configured: true, teamContacts: team(draft).map(contact => ({ ...contact, name: contactName(contact).trim(), role: contactGroup(contact), group: contactGroup(contact), title: contact.title?.trim() || groupTitle(contactGroup(contact)) })) };
    try { localStorage.setItem(cardKey, JSON.stringify(card)); }
    catch { say('Could not save the contact card. Please try again.'); return; }
    document.dispatchEvent(new CustomEvent('oneqr:contact-saved', { detail: { card, addAction: $('#contact-add-action').checked } }));
    dialog.close(); sync();
  });
  $$('#contact-shop-panel input, #contact-shop-panel textarea').forEach(input => {
    input.addEventListener('input', () => { readShop(); changed(); });
    input.addEventListener('change', () => { readShop(); changed(); });
  });
  $$('[data-contact-theme]').forEach(button => button.addEventListener('click', () => {
    draft.theme = button.dataset.contactTheme;
    $$('[data-contact-theme]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    changed();
  }));
  $$('[data-contact-tab]').forEach(button => {
    button.addEventListener('click', () => setTab(button.dataset.contactTab));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); setTab(event.key === 'Home' ? 'shop' : event.key === 'End' ? 'team' : tab === 'shop' ? 'team' : 'shop', true);
    });
  });
  $('#contact-member-search').addEventListener('focus', openMemberPicker);
  $('#contact-member-search').addEventListener('input', () => { openMemberPicker(); results(); });
  $('.contact-member-search').addEventListener('click', () => { $('#contact-member-search').focus(); openMemberPicker(); });
  $('#contact-member-results').addEventListener('click', event => {
    if (event.target.closest('[data-close-member-picker]')) {
      $('#contact-member-search').focus(); closeMemberPicker();
      return;
    }
    const button = event.target.closest('[data-add-member]');
    if (button) addMember(button.dataset.addMember);
  });
  $('[data-contact-member-combobox]').addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('#contact-member-results').hidden) {
      event.preventDefault(); event.stopPropagation();
      $('#contact-member-search').focus(); closeMemberPicker();
    } else if (event.key === 'ArrowDown' && event.target === $('#contact-member-search')) {
      event.preventDefault(); openMemberPicker();
      $('#contact-member-results [data-add-member]')?.focus();
    }
  });
  $('[data-contact-member-combobox]').addEventListener('focusout', event => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeMemberPicker();
  });
  document.addEventListener('click', event => {
    if (!event.composedPath().includes($('[data-contact-member-combobox]'))) closeMemberPicker();
  });
  $('#contact-preview-person').addEventListener('change', event => selectContact(event.target.value));
  $('#contact-import-button').addEventListener('click', () => {
    if (!$('#contact-google-url').value.trim()) { say('Paste a Google Business Profile URL first.'); return; }
    draft = { ...draft, ...clone(profile.defaults), teamContacts: draft.teamContacts, configured: draft.configured, theme: draft.theme };
    fillShop(); changed(); say('Business details imported for this prototype.');
  });
  $('#download-vcard-button').addEventListener('click', () => {
    readShop(); profile.downloadVCard(cardFor(draft, selectedPreview) || cardFor(draft));
    say('vCard downloaded. Open the file to save this contact.');
  });
  $$('[data-review-draft-action]').forEach(button => button.addEventListener('click', () => say(button.dataset.reviewDraftAction === 'call' ? 'Call preview: ' + formatPhone(draft.phone) : 'Directions preview: ' + profile.address(draft))));
  $$('[data-close-contact-card]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  function backdrop(modal) {
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
    });
  }
  backdrop(dialog);

  // Sharing remains a link to the existing customer demo. This review changes only the Builder.
  const qr = document.createElement('dialog');
  qr.className = 'contact-review-popup contact-qr-popup';
  qr.setAttribute('aria-labelledby', 'contact-qr-title');
  qr.innerHTML = '<header><div><small>View QR · Demo preview</small><h2 id="contact-qr-title"></h2><p id="contact-qr-subtitle"></p></div><button type="button" data-qr-close aria-label="Close">×</button></header><div class="contact-qr-art" id="contact-person-qr" role="img" aria-label="Contact QR"></div><label for="contact-person-link">Copy link</label><input id="contact-person-link" readonly><p id="contact-qr-feedback" role="status"></p><footer><button type="button" data-qr-copy>Copy link</button><button type="button" data-qr-download>Download QR</button><a id="contact-open-person" target="_blank" rel="noopener">Open contact</a></footer>';
  document.body.append(qr); backdrop(qr);
  let qrId = null;
  let qrOpener;
  async function copyLink(id, target = $('#contact-feedback')) {
    const shop = profile.read();
    if (!team(shop).some(person => person.id === id && person.public && person.shopId === shop.shopId && member(person.memberId))) {
      target.textContent = 'This contact is unavailable';
      return;
    }
    const url = contactUrl(id);
    try { await navigator.clipboard.writeText(url); target.textContent = 'Customer page link copied.'; }
    catch {
      if (!qr.open) showQR(id);
      const input = qr.querySelector('input'); input.focus(); input.select();
      qr.querySelector('#contact-qr-feedback').textContent = 'Could not copy. Select the link and copy it manually.';
    }
  }
  function showQR(id) {
    const shop = profile.read();
    const contact = team(shop).find(person => person.id === id && person.public && person.shopId === shop.shopId);
    const card = contact && cardFor(shop, id);
    if (!card) { say('This contact is unavailable'); return; }
    qrId = id; qrOpener = document.activeElement;
    qr.querySelector('#contact-qr-title').textContent = card.name.toUpperCase();
    qr.querySelector('#contact-qr-subtitle').textContent = card.title + ' · ' + card.company;
    qr.querySelector('#contact-person-link').value = contactUrl(id);
    qr.querySelector('#contact-open-person').href = contactUrl(id);
    qr.querySelector('#contact-qr-feedback').textContent = '';
    const art = qr.querySelector('#contact-person-qr'); art.replaceChildren();
    const download = qr.querySelector('[data-qr-download]');
    download.disabled = typeof window.QRCode !== 'function';
    if (window.QRCode) new window.QRCode(art, { text: contactUrl(id), width: 240, height: 240, colorDark: '#172033', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    else qr.querySelector('#contact-qr-feedback').textContent = 'This contact is unavailable';
    if (!qr.open) qr.showModal();
  }
  function downloadQR(id) {
    if (qrId !== id || !qr.open) showQR(id);
    const canvas = qr.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png'); link.download = 'bitcoin-nail-bar-' + id + '-qr.png';
    document.body.append(link); link.click(); link.remove();
  }
  qr.querySelector('[data-qr-close]').addEventListener('click', () => qr.close());
  qr.addEventListener('close', () => qrOpener?.isConnected && qrOpener.focus());
  qr.querySelector('[data-qr-copy]').addEventListener('click', () => copyLink(qrId, qr.querySelector('#contact-qr-feedback')));
  qr.querySelector('[data-qr-download]').addEventListener('click', () => downloadQR(qrId));
  $('#contact-team-list').addEventListener('focusin', event => {
    const row = event.target.closest('[data-contact-row]');
    if (row && row.dataset.contactRow !== selectedPreview) selectContact(row.dataset.contactRow);
  });
  $('#contact-team-list').addEventListener('keydown', event => {
    if (!event.target.matches('[data-contact-row]') || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    selectContact(event.target.dataset.contactRow);
  });
  $('#contact-team-list').addEventListener('input', event => {
    const field = event.target.closest('[data-team-name]');
    if (!field) return;
    const row = field.closest('[data-contact-row]');
    const contact = team(draft).find(person => person.id === row.dataset.contactRow);
    if (!contact) return;
    contact.name = field.value;
    field.removeAttribute('aria-invalid');
    row.setAttribute('aria-label', field.value.trim() || 'Contact');
    const badge = row.querySelector('.contact-team-avatar');
    if (!badge.querySelector('img')) badge.textContent = field.value.trim().charAt(0).toUpperCase();
    changed();
  });
  $('#contact-team-list').addEventListener('change', event => {
    const field = event.target.closest('[data-team-public], [data-team-role]');
    if (!field) return;
    const id = field.closest('[data-contact-row]').dataset.contactRow;
    const contact = team(draft).find(person => person.id === id);
    if (!contact) return;
    if (field.hasAttribute('data-team-role')) {
      contact.role = field.value;
      contact.group = contactGroup(contact);
      contact.title = groupTitle(contact.role);
      field.removeAttribute('aria-invalid');
    } else {
      if (!savePublicContact(contact, field.checked)) {
        field.checked = Boolean(contact.public);
        return;
      }
      renderTeam();
      $('#contact-team-list').querySelector('[data-contact-row="' + CSS.escape(id) + '"] [data-team-public]')?.focus();
    }
    changed();
  });
  $('#contact-team-list').addEventListener('click', event => {
    const row = event.target.closest('[data-contact-row]');
    if (row && !event.target.closest('[data-team-action="remove"]')) selectContact(row.dataset.contactRow);
    const button = event.target.closest('[data-team-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.teamAction;
    const id = button.closest('[data-contact-row]')?.dataset.contactRow;
    if (action === 'copy') copyLink(id);
    if (action === 'qr') showQR(id);
    if (action === 'download') downloadQR(id);
    if (action === 'remove') {
      const contacts = team(draft);
      const index = contacts.findIndex(contact => contact.id === id);
      const nextId = contacts[index + 1]?.id || contacts[index - 1]?.id;
      draft.teamContacts = contacts.filter(contact => contact.id !== id);
      renderTeam(); changed();
      results();
      const nextField = nextId && $('#contact-team-list').querySelector('[data-contact-row="' + CSS.escape(nextId) + '"] [data-team-name]');
      (nextField || $('#contact-member-search')).focus();
    }
  });

  const menu = document.createElement('dialog');
  menu.className = 'contact-review-popup';
  menu.setAttribute('aria-labelledby', 'review-menu-title');
  menu.innerHTML = '<header><h2 id="review-menu-title">Contact</h2><button type="button" data-review-menu-close aria-label="Close">×</button></header><nav class="contact-review-menu" aria-label="Business contact actions"><button type="button" data-oneqr-action="call"><i data-lucide="phone" aria-hidden="true"></i>Call</button><button type="button" data-oneqr-action="text"><i data-lucide="message-square" aria-hidden="true"></i>Text</button><button type="button" data-review-picker><i data-lucide="contact-round" aria-hidden="true"></i>Save contact</button><button type="button" data-oneqr-action="directions"><i data-lucide="navigation" aria-hidden="true"></i>Directions</button><button type="button" data-oneqr-action="exchange"><i data-lucide="user-plus" aria-hidden="true"></i>Send yours</button><button type="button" data-oneqr-action="share"><i data-lucide="share-2" aria-hidden="true"></i>Share card</button></nav><p class="contact-popup-feedback" data-oneqr-feedback role="status"></p>';
  document.body.append(menu); backdrop(menu);
  const picker = document.createElement('dialog');
  picker.className = 'contact-review-popup contact-review-picker';
  picker.setAttribute('aria-labelledby', 'review-picker-title');
  picker.innerHTML = '<form><header><h2 id="review-picker-title">Save contact</h2><button type="button" data-picker-close aria-label="Close">×</button></header><div class="contact-review-picker-body"><div id="review-picker-groups"></div><section class="contact-selected-card" id="review-selected-card"></section><p class="contact-popup-feedback" id="review-picker-feedback" role="status"></p></div><footer><button type="button" data-picker-close>Cancel</button><button type="submit" class="is-primary">Save contact</button></footer></form>';
  document.body.append(picker); backdrop(picker);
  let selected = 'shop';
  let pickerOpener;
  function pageFeedback(message) {
    document.querySelectorAll('[data-oneqr-feedback]').forEach(node => { node.textContent = message; });
  }
  function publicContacts() {
    const shop = profile.read();
    const unique = new Set();
    return team(shop).filter(person => {
      if (!person.public || person.shopId !== shop.shopId || !member(person.memberId) || unique.has(person.memberId)) return false;
      unique.add(person.memberId); return true;
    });
  }
  function renderPicker() {
    const shop = profile.read();
    const contacts = publicContacts();
    const groups = [
      { title: 'Shop', cards: [cardFor(shop)] },
      { title: 'Managers', cards: contacts.filter(person => contactGroup(person) === 'manager').map(person => cardFor(shop, person.id)) },
      { title: 'Technicians', cards: contacts.filter(person => contactGroup(person) === 'technician').map(person => cardFor(shop, person.id)) }
    ];
    const active = isEnabled();
    const available = groups.flatMap(group => group.cards);
    const card = active && available.find(person => person.contactId === selected);
    picker.querySelector('#review-picker-groups').innerHTML = active ? groups.filter(group => group.cards.length).map(group => '<fieldset><legend>' + group.title + '</legend>' + group.cards.map(person => '<label class="contact-picker-person">' + avatar(person) + '<span><strong>' + esc(person.contactId === 'shop' ? person.name : person.name.toUpperCase()) + '</strong><small>' + esc(person.title) + '</small></span><input type="radio" name="contact" value="' + esc(person.contactId) + '"' + (person.contactId === selected ? ' checked' : '') + '></label>').join('') + '</fieldset>').join('') : '';
    picker.querySelector('[type="submit"]').disabled = !card;
    picker.querySelector('#review-selected-card').innerHTML = card ? '<strong>' + esc(card.contactId === 'shop' ? card.name : card.name.toUpperCase()) + '</strong><p>' + esc(card.title) + '</p>' + (card.contactId !== 'shop' ? '<p>' + esc(card.company) + '</p>' : '') + [card.showPhone ? formatPhone(card.phone) : '', card.email, card.website, profile.address(card)].filter(Boolean).map(value => '<p>' + esc(value) + '</p>').join('') : '<strong>This contact is unavailable</strong>';
    icons();
  }
  function openPicker() {
    if (!isEnabled()) { pageFeedback('This contact is unavailable'); return; }
    pickerOpener = document.activeElement;
    selected = 'shop'; renderPicker();
    picker.querySelector('#review-picker-feedback').textContent = '';
    if (!picker.open) picker.showModal();
  }
  picker.addEventListener('change', event => { if (event.target.name === 'contact') { selected = event.target.value; renderPicker(); picker.querySelector('input:checked')?.focus(); } });
  picker.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const valid = selected === 'shop' || publicContacts().some(person => person.id === selected);
    if (!isEnabled() || !valid) { renderPicker(); return; }
    profile.downloadVCard(cardFor(profile.read(), selected));
    picker.querySelector('#review-picker-feedback').textContent = 'vCard downloaded. Open the file to save this contact.';
  });
  picker.querySelectorAll('[data-picker-close]').forEach(button => button.addEventListener('click', () => picker.close()));
  picker.addEventListener('close', () => pickerOpener?.isConnected && pickerOpener.focus());
  menu.querySelector('[data-review-menu-close]').addEventListener('click', () => menu.close());
  menu.querySelector('[data-review-picker]').addEventListener('click', openPicker);
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-review-open-contact]');
    if (!button) return;
    if (!isEnabled()) { pageFeedback('This contact is unavailable'); return; }
    const shop = profile.read();
    menu.querySelectorAll('[data-oneqr-action="call"], [data-oneqr-action="text"]').forEach(node => { node.hidden = !shop.showPhone || !shop.phone; });
    menu.querySelector('[data-oneqr-action="directions"]').hidden = shop.addressMode !== 'full' || !profile.address(shop);
    pageFeedback(''); icons(); menu.showModal();
  });
  document.addEventListener('oneqr:settings-saved', sync);
  window.addEventListener('storage', event => { if ([cardKey, configKey, null].includes(event.key)) { sync(); if (qr.open) { const person = team(profile.read()).find(contact => contact.id === qrId && contact.public); if (!person) qr.close(); } } });
  window.NEXORA_CONTACT_REVIEW = { isEnabled, isContactModule, cardFor, contactUrl };
  window.NEXORA_CONTACT_CARD = { open, openPicker, sync };
  sync(); icons();
})();
