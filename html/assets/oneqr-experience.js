(function () {
  'use strict';

  var PROFILE_KEY = 'taxiq:oneqr-contact-card';
  var LEADS_KEY = 'taxiq:oneqr-leads';
  var phoneControl = window.NEXORA_ONEQR_PHONE;
  var defaults = {
    name: 'Bitcoin Nail Bar', title: 'Nail salon · Houston', phone: '+1 (346) 802-4906',
    email: 'hello@bitcoinnailbar.com', website: 'https://bitcoinnailbar.com',
    address: '9793 Westheimer Rd, Suite A', city: 'Houston', region: 'TX', zip: '77042',
    bio: 'Beauty, care, and a better booking experience.', blurb: '', addressMode: 'full',
    showPhone: true, showHours: true, openTime: '09:30', closeTime: '19:00', closedDays: [],
    theme: 'indigo', configured: false
  };

  function readProfile() {
    try {
      var card = Object.assign({}, defaults, JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'));
      card.phone = phoneControl.format(card.phone);
      return card;
    }
    catch (error) { return Object.assign({}, defaults); }
  }

  function escapeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function address(card) {
    if (card.addressMode === 'hidden') return '';
    return (card.addressMode === 'area' ? [card.city, card.region] : [card.address, card.city, card.region, card.zip]).filter(Boolean).join(', ');
  }

  function displayTime(value) {
    var match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match) return '';
    var hour = Number(match[1]);
    return (hour % 12 || 12) + ':' + match[2] + (hour >= 12 ? ' PM' : ' AM');
  }

  function hours(card) {
    if (!card.showHours || !card.openTime || !card.closeTime) return '';
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var closed = (card.closedDays || []).filter(function (day) { return Number.isInteger(day) && day >= 0 && day <= 6; });
    if (closed.length === 7) return 'Closed every day';
    return displayTime(card.openTime) + '–' + displayTime(card.closeTime) + (closed.length ? ' · Closed ' + closed.map(function (day) { return days[day]; }).join(', ') : ' · Daily');
  }

  function pageUrl() { return new URL('../customer/oneqr-landing.html', window.location.href).href; }
  function feedback(message) {
    document.querySelectorAll('[data-oneqr-feedback]').forEach(function (node) { node.textContent = message; });
  }

  function download(content, type, filename) {
    var url = URL.createObjectURL(new Blob([content], { type: type }));
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function downloadVCard(card) {
    function value(text) { return String(text || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
    var fullAddress = card.addressMode === 'full' && address(card);
    var lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + value(card.name),
      card.title ? 'TITLE:' + value(card.title) : '',
      card.showPhone && card.phone ? 'TEL;TYPE=WORK:' + value(card.phone) : '',
      card.email ? 'EMAIL:' + value(card.email) : '', card.website ? 'URL:' + value(card.website) : '',
      fullAddress ? 'ADR;TYPE=WORK:;;' + value(card.address) + ';' + value(card.city) + ';' + value(card.region) + ';' + value(card.zip) + ';' : '',
      card.bio ? 'NOTE:' + value(card.bio) : '', 'END:VCARD'];
    var filename = String(card.name || 'oneqr-contact').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'oneqr-contact';
    download(lines.filter(Boolean).join('\r\n') + '\r\n', 'text/vcard;charset=utf-8', filename + '.vcf');
  }

  function readLeads() {
    try {
      var saved = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(function (lead) { return lead && typeof lead.name === 'string' && lead.source === pageUrl(); }) : [];
    } catch (error) { return []; }
  }

  function saveLeads(leads) {
    var saved = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
    var others = Array.isArray(saved) ? saved.filter(function (lead) { return lead && lead.source !== pageUrl(); }) : [];
    localStorage.setItem(LEADS_KEY, JSON.stringify(others.concat(leads)));
    document.dispatchEvent(new CustomEvent('oneqr:leads-changed'));
  }

  function render() {
    var card = readProfile();
    document.querySelectorAll('[data-oneqr-about]').forEach(function (node) {
      var description = card.blurb || 'This is the official page for ' + card.name + '. Each button above does one thing — book, see prices, tip, or save our number. No app needed.';
      var rows = [['clock-3', hours(card)], ['map-pin', address(card)], ['phone', card.showPhone ? card.phone : '']];
      node.innerHTML = '<h4>About this page</h4><p>' + escapeText(description) + '</p><div>' + rows.filter(function (row) { return row[1]; }).map(function (row) {
        return '<span><i data-lucide="' + row[0] + '" aria-hidden="true"></i><b>' + escapeText(row[1]) + '</b></span>';
      }).join('') + '</div>';
    });
    document.querySelectorAll('[data-oneqr-action="call"], [data-oneqr-action="text"]').forEach(function (button) { button.hidden = !card.showPhone || !card.phone; });
    document.querySelectorAll('[data-oneqr-action="directions"]').forEach(function (button) { button.hidden = card.addressMode !== 'full' || !address(card); });
    document.querySelectorAll('[data-oneqr-page-url]').forEach(function (node) {
      var url = new URL(pageUrl());
      node.textContent = url.host + url.pathname;
    });
    if (document.querySelector('[data-oneqr-public]')) {
      var brand = document.querySelector('.oneqr-scan-brand-name');
      if (brand) brand.textContent = card.name;
      document.title = card.name + ' - OneQR';
    }
    if (window.ONEQR_ACTION_APPEARANCE) window.ONEQR_ACTION_APPEARANCE.mount();
    if (window.lucide) window.lucide.createIcons();
  }

  var exchangeDialog = document.createElement('dialog');
  exchangeDialog.className = 'oneqr-experience-dialog';
  exchangeDialog.setAttribute('aria-labelledby', 'oneqrExchangeTitle');
  exchangeDialog.innerHTML = '<form id="oneqrExchangeForm"><div class="oneqr-dialog-heading"><h2 id="oneqrExchangeTitle">Send your contact</h2><button type="button" data-close-exchange aria-label="Close">×</button></div>' +
    '<p id="oneqrExchangeRecipient"></p><label>Name<input name="name" autocomplete="name" maxlength="100" required></label>' +
    '<div class="oneqr-phone-field"><label for="oneqr-exchange-phone">Phone</label>' + phoneControl.markup('oneqr-exchange-phone', true) + '</div>' +
    '<label>Email (optional)<input name="email" type="email" autocomplete="email" maxlength="200"></label>' +
    '<label class="oneqr-consent"><input name="consent" type="checkbox"><span>I agree to receive SMS from this business. Optional — you can send your contact without agreeing.</span></label>' +
    '<p class="oneqr-info-note">Prototype: contacts are saved in this browser for the business inbox.</p><p id="oneqrExchangeError" role="alert"></p>' +
    '<div class="oneqr-dialog-actions"><button type="button" data-close-exchange>Cancel</button><button class="is-primary" type="submit">Send my contact</button></div></form>';
  document.body.appendChild(exchangeDialog);
  var exchangePhone = phoneControl.mount(exchangeDialog);
  exchangeDialog.querySelectorAll('[data-close-exchange]').forEach(function (button) { button.addEventListener('click', function () { exchangeDialog.close(); }); });
  exchangeDialog.addEventListener('click', function (event) { if (event.target === exchangeDialog) exchangeDialog.close(); });
  exchangeDialog.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var name = form.elements.name.value.trim();
    var phone = exchangePhone.read();
    var error = exchangeDialog.querySelector('#oneqrExchangeError');
    if (!name || !phone || !/\d/.test(phone)) { error.textContent = 'Enter your name and a phone number.'; return; }
    var leads = readLeads();
    var capturedAt = new Date().toISOString();
    leads.unshift({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 8), name: name, phone: phone,
      email: form.elements.email.value.trim(), smsConsent: form.elements.consent.checked,
      consentAt: form.elements.consent.checked ? capturedAt : null, createdAt: capturedAt, source: pageUrl() });
    try { saveLeads(leads); }
    catch (error) { exchangeDialog.querySelector('#oneqrExchangeError').textContent = 'Could not save your contact. Browser storage is unavailable.'; return; }
    exchangeDialog.close();
    feedback('Contact sent to ' + readProfile().name + (form.elements.consent.checked ? ' · SMS consent given.' : ' · No SMS consent.'));
  });

  document.addEventListener('click', async function (event) {
    var button = event.target.closest('[data-oneqr-action]');
    if (!button) return;
    var card = readProfile();
    var action = button.dataset.oneqrAction;
    var preview = Boolean(button.closest('.oneqr-phone'));
    if (action === 'exchange') {
      exchangeDialog.querySelector('form').reset();
      exchangePhone.set('');
      exchangeDialog.querySelector('#oneqrExchangeRecipient').textContent = card.name + ' will receive your contact.';
      exchangeDialog.querySelector('#oneqrExchangeError').textContent = '';
      exchangeDialog.showModal();
    } else if (action === 'save') {
      downloadVCard(card);
      feedback('vCard downloaded. Open the file to save this contact.');
    } else if (action === 'wallet') {
      feedback('Wallet preview: ' + card.name + ' · ' + card.title + '. Adding a pass is simulated in this prototype.');
    } else if (action === 'home') {
      feedback(preview ? 'Open the customer QR page, then use your browser menu → Add to Home Screen (iPhone: Share → Add to Home Screen).' : 'Use your browser menu → Add to Home Screen. On iPhone, tap Share → Add to Home Screen.');
    } else if (action === 'share') {
      try {
        if (!preview && navigator.share) await navigator.share({ title: card.name, url: pageUrl() });
        else { await navigator.clipboard.writeText(pageUrl()); feedback('Customer page link copied.'); }
      } catch (error) { if (error.name !== 'AbortError') feedback('Share this page: ' + pageUrl()); }
    } else if ((action === 'call' || action === 'text') && card.showPhone && card.phone) {
      if (preview) feedback((action === 'call' ? 'Call preview: ' : 'Text preview: ') + card.phone);
      else window.location.href = (action === 'call' ? 'tel:' : 'sms:') + card.phone.replace(/[^\d+]/g, '');
    } else if (action === 'directions' && card.addressMode === 'full' && address(card)) {
      if (preview) feedback('Directions preview: ' + address(card));
      else window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address(card)), '_blank', 'noopener,noreferrer');
    }
  });

  document.addEventListener('oneqr:contact-saved', render);
  window.addEventListener('storage', function (event) {
    if (event.key === PROFILE_KEY || event.key === null) render();
    if (event.key === LEADS_KEY || event.key === null) document.dispatchEvent(new CustomEvent('oneqr:leads-changed'));
  });
  window.NEXORA_ONEQR_PROFILE = { defaults: defaults, read: readProfile, address: address, hours: hours,
    displayTime: displayTime, escapeText: escapeText, pageUrl: pageUrl, download: download,
    downloadVCard: downloadVCard, readLeads: readLeads, saveLeads: saveLeads, render: render };
  render();
})();
