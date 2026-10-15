(function () {
  'use strict';
  const dialog = document.getElementById('contact-card-modal');
  if (!dialog) return;
  const $ = selector => dialog.querySelector(selector);
  const $$ = selector => Array.from(dialog.querySelectorAll(selector));
  const CONTACT_STORAGE_KEY = 'taxiq:oneqr-contact-card';
  const profile = window.NEXORA_ONEQR_PROFILE;
  const DEFAULT_CONTACT_CARD = profile.defaults;

  let contactDraft = { ...DEFAULT_CONTACT_CARD };
  function refreshIcons() { window.lucide?.createIcons(); }
  function showToast(message) { $('#contact-feedback').textContent = message; }
  function loadContactCard() {
    return profile.read();
  }
  function setContactFormValues() {
    const values = {
      '#contact-name': contactDraft.name,
      '#contact-title': contactDraft.title,
      '#contact-phone': contactDraft.phone,
      '#contact-email': contactDraft.email,
      '#contact-website': contactDraft.website,
      '#contact-address': contactDraft.address,
      '#contact-city': contactDraft.city,
      '#contact-state': contactDraft.region,
      '#contact-zip': contactDraft.zip,
      '#contact-bio': contactDraft.bio,
      '#contact-blurb': contactDraft.blurb,
      '#contact-open-time': contactDraft.openTime,
      '#contact-close-time': contactDraft.closeTime
    };
    Object.entries(values).forEach(([selector, value]) => { $(selector).value = value || ''; });
    $$('#contact-card-form [name="contact-address-mode"]').forEach((input) => { input.checked = input.value === contactDraft.addressMode; });
    $('#contact-show-phone').checked = Boolean(contactDraft.showPhone);
    $('#contact-show-hours').checked = Boolean(contactDraft.showHours);
    $$('#contact-closed-days input').forEach(input => { input.checked = (contactDraft.closedDays || []).includes(Number(input.value)); });
    $('#contact-add-action').checked = true;
    $$('[data-contact-theme]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.contactTheme === contactDraft.theme)));
  }

  function readContactForm() {
    contactDraft = {
      ...contactDraft,
      name: $('#contact-name').value.trim(),
      title: $('#contact-title').value.trim(),
      phone: $('#contact-phone').value.trim(),
      email: $('#contact-email').value.trim(),
      website: $('#contact-website').value.trim(),
      address: $('#contact-address').value.trim(),
      city: $('#contact-city').value.trim(),
      region: $('#contact-state').value.trim(),
      zip: $('#contact-zip').value.trim(),
      bio: $('#contact-bio').value.trim(),
      blurb: $('#contact-blurb').value.trim(),
      addressMode: $('#contact-card-form [name="contact-address-mode"]:checked')?.value || 'full',
      showPhone: $('#contact-show-phone').checked,
      showHours: $('#contact-show-hours').checked,
      openTime: $('#contact-open-time').value,
      closeTime: $('#contact-close-time').value,
      closedDays: $$('#contact-closed-days input:checked').map(input => Number(input.value))
    };
  }

  function cardAddress(card) {
    return profile.address(card);
  }

  function contactAddress() {
    return cardAddress(contactDraft);
  }

  function renderContactPreview() {
    const name = contactDraft.name || 'Your business';
    $('#contact-card-preview').dataset.theme = contactDraft.theme;
    $('#contact-preview-avatar').textContent = name.charAt(0).toUpperCase();
    $('#contact-preview-name').textContent = name;
    $('#contact-preview-title').textContent = contactDraft.title || 'Business contact';
    $('#contact-preview-bio').textContent = contactDraft.bio || 'Your official OneQR contact card.';
    $('#contact-preview-phone').textContent = contactDraft.phone || 'Phone not added';
    $('#contact-preview-email').textContent = contactDraft.email || 'Email not added';
    $('#contact-preview-address').textContent = contactAddress() || 'Address hidden';
    $('#contact-preview-hours').textContent = profile.hours(contactDraft);
    $('#contact-preview-phone-row').hidden = !contactDraft.showPhone || !contactDraft.phone;
    $('#contact-preview-email-row').hidden = !contactDraft.email;
    $('#contact-preview-address-row').hidden = !contactAddress();
    $('#contact-preview-hours-row').hidden = !contactDraft.showHours || !contactDraft.openTime || !contactDraft.closeTime;
    $('#contact-hours-row').hidden = !contactDraft.showHours;
    $('#contact-closed-days').hidden = !contactDraft.showHours;
    refreshIcons();
  }


  function importContactDemo() {
    if (!$('#contact-google-url').value.trim()) {
      showToast('Paste a Google Business Profile URL first.');
      return;
    }
    contactDraft = { ...contactDraft, ...DEFAULT_CONTACT_CARD, configured: contactDraft.configured, theme: contactDraft.theme };
    setContactFormValues();
    renderContactPreview();
    showToast('Business details imported for this prototype.');
  }

  function downloadVCard() {
    readContactForm();
    profile.downloadVCard(contactDraft);
    showToast('vCard downloaded.');
  }


  function openContactCard() {
    contactDraft = loadContactCard();
    setContactFormValues();
    renderContactPreview();
    showToast('');
    dialog.showModal();
  }
  $('#contact-card-form').addEventListener('submit', event => {
    event.preventDefault();
    readContactForm();
    const card = { ...contactDraft, configured: true };
    try { localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(card)); }
    catch (error) { showToast('Could not save the contact card. Please try again.'); return; }
    document.dispatchEvent(new CustomEvent('oneqr:contact-saved', { detail: { card, addAction: $('#contact-add-action').checked } }));
    dialog.close();
  });
  $$('#contact-card-form input, #contact-card-form textarea').forEach(input => {
    input.addEventListener('input', () => { readContactForm(); renderContactPreview(); });
    input.addEventListener('change', () => { readContactForm(); renderContactPreview(); });
  });
  $$('[data-contact-theme]').forEach(button => button.addEventListener('click', () => {
    contactDraft.theme = button.dataset.contactTheme;
    $$('[data-contact-theme]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderContactPreview();
  }));
  $$('[data-close-contact-card]').forEach(button => button.addEventListener('click', () => dialog.close()));
  $('#contact-import-button').addEventListener('click', importContactDemo);
  $('#download-vcard-button').addEventListener('click', downloadVCard);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  window.NEXORA_CONTACT_CARD = { open: openContactCard };
})();
