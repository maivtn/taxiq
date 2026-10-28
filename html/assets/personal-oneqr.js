(function () {
  'use strict';
  const api = window.NEXORA_PERSONAL_QR;
  const host = document.querySelector('[data-personal-oneqr-app]');
  const publicHost = document.querySelector('[data-personal-qr-public]');
  if (!api || (!host && !publicHost)) return;
  const state = api.read();
  const params = new URL(location.href).searchParams;
  if (host) {
    state.salonId = api.linked ? state.salonId || api.salons[0].id : null;
    try { api.save(state); } catch (_) { /* Saving remains explicit below. */ }
  }
  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  let savedSnapshot = clone(state);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const iconPath = icon => api.isIconImage(icon) ? icon : '../assets/icon-oneqr/issue-2040-oneqr-' + (api.icons.includes(icon) ? icon : 'link') + '-3d.png';
  const image = (icon, cls = '') => '<img class="' + cls + '" src="' + esc(iconPath(icon)) + '" alt="">';
  const background = link => window.ONEQR_ACTION_APPEARANCE?.backgrounds.includes(link.background) ? ' style="background:' + esc(link.background) + ';color:#fff"' : '';
  const lucide = name => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const button = (label, action, primary = false, icon = '') => '<button class="pqr-button' + (primary ? ' is-primary' : '') + '" type="button" data-pqr-action="' + action + '">' + (icon ? lucide(icon) : '') + label + '</button>';
  const icons = () => { if (window.lucide) window.lucide.createIcons(); if (window.ONEQR_ACTION_APPEARANCE) window.ONEQR_ACTION_APPEARANCE.mount(); };
  const tabs = [{ id: 'one-qr', label: 'One QR', icon: 'scan-line' }, { id: 'advertising', label: 'Advertising', icon: 'megaphone' }, { id: 'tip-qr', label: 'Tip QR', icon: 'hand-coins' }, { id: 'accept-payment', label: 'Accept Payment', icon: 'credit-card' }, { id: 'referral-link', label: 'Referral Link', icon: 'share-2' }];
  const aliases = { 'my-qr': 'tip-qr', 'qr-stations': 'tip-qr', 'payout-methods': 'accept-payment', ads: 'advertising' };
  let current = 'one-qr';
  let advertisingElement = null;
  let advertisingController = null;
  let paymentController = null;
  const iconReads = new Map();
  const dialog = document.createElement('dialog');
  dialog.className = 'pqr-dialog'; dialog.setAttribute('aria-labelledby', 'pqr-dialog-title'); document.body.append(dialog);
  function feedback(message, error = false) {
    document.querySelectorAll('[data-pqr-feedback]').forEach(node => { node.textContent = message; node.classList.toggle('is-error', error); node.setAttribute('role', error ? 'alert' : 'status'); });
  }
  function reconcile(fresh) {
    Object.keys(fresh).forEach(key => {
      if (key === 'profile' || key === 'payments') {
        const merged = { ...fresh[key] };
        Object.keys(state[key]).forEach(field => {
          if (!same(state[key][field], savedSnapshot[key][field])) merged[field] = state[key][field];
        });
        state[key] = merged;
      } else if (key === 'leads' || same(state[key], savedSnapshot[key])) state[key] = clone(fresh[key]);
    });
    savedSnapshot = clone(fresh);
  }
  function persist(message, fields = ['name', 'greeting', 'links']) {
    try {
      const fresh = api.read();
      fields.forEach(key => {
        if (key === 'profile' || key === 'payments') {
          const merged = { ...fresh[key] };
          Object.keys(state[key]).forEach(field => {
            if (!same(state[key][field], savedSnapshot[key][field])) merged[field] = state[key][field];
          });
          fresh[key] = merged;
        } else if (!same(state[key], savedSnapshot[key])) fresh[key] = clone(state[key]);
      });
      api.save(fresh);
      fields.forEach(key => { state[key] = clone(fresh[key]); });
      reconcile(fresh);
      if (message) feedback(message); return true;
    }
    catch (_) { feedback('Could not save. Please try again.', true); return false; }
  }
  function openDialog(title, content) {
    dialog.innerHTML = '<div class="pqr-dialog-head"><h2 id="pqr-dialog-title">' + esc(title) + '</h2><button type="button" class="pqr-icon-button" data-pqr-action="close" aria-label="Close">' + lucide('x') + '</button></div><div class="pqr-dialog-body">' + content + '</div>';
    if (!dialog.open) dialog.showModal(); icons(); drawQR(dialog);
  }
  function qrMarkup(value, size = 112) { return '<div class="pqr-qr-code" role="img" aria-label="Personal QR code" data-pqr-qr="' + esc(value) + '" data-size="' + size + '"></div>'; }
  function drawQR(container = document) {
    container.querySelectorAll('[data-pqr-qr]').forEach(node => {
      if (node.dataset.rendered) return;
      if (typeof window.QRCode === 'function') {
        try { new window.QRCode(node, { text: node.dataset.pqrQr, width: Number(node.dataset.size), height: Number(node.dataset.size), correctLevel: window.QRCode.CorrectLevel.M }); node.dataset.rendered = 'true'; }
        catch (_) { node.innerHTML = image('qr-code'); }
      } else node.innerHTML = image('qr-code');
    });
  }
  function phone() {
    const profile = state.profile;
    const links = api.visibleLinks(state, host ? api.linked : Boolean(state.salonId));
    const contactButtons = [button('Save contact', 'vcard', false, 'contact-round'), button('Add to Wallet', 'wallet', false, 'wallet-cards'), button('Send yours', 'exchange', false, 'user-plus'), button('Share card', 'share', false, 'share-2')];
    if (profile.showPhone && profile.phone.trim()) contactButtons.push(button('Call', 'call', false, 'phone'), button('Text', 'text', false, 'message-square'));
    return '<article class="pqr-phone"><header class="pqr-phone-hero"><div class="pqr-avatar">' + (profile.avatar ? '<img src="' + esc(profile.avatar) + '" alt="' + esc(profile.name) + '">' : image('user-round', 'pqr-default-avatar')) + '</div><h2>' + esc(profile.name) + '</h2><p data-public-greeting>' + esc(state.greeting) + '</p></header><div class="pqr-phone-body">' +
      '<div class="pqr-quick-actions">' + contactButtons.join('') + '</div>' +
      (links.length ? '<h3>My links</h3><div class="pqr-public-links">' + links.map(link => '<button class="pqr-public-link" type="button" data-pqr-link="' + esc(link.id) + '"' + background(link) + '>' + image(link.icon) + '<span>' + esc(link.name) + '</span>' + lucide('arrow-up-right') + '</button>').join('') + '</div>' : '') +
      (profile.bio.trim() ? '<section class="pqr-about"><h3>About me</h3><p>' + esc(profile.bio) + '</p></section>' : '') +
      (profile.showEmail && profile.email.trim() ? '<p class="pqr-muted" data-public-email>' + esc(profile.email) + '</p>' : '') +
      (profile.showPhone && profile.phone.trim() ? '<p class="pqr-muted" data-public-phone>' + esc(profile.phone) + '</p>' : '') +
      (state.ads && state.adIndustries.length ? '<section class="pqr-sponsored" data-ad-industry="' + esc(state.adIndustries[0]) + '" aria-label="Sponsored content"><small>Sponsored · Demo data</small><p>Sample sponsored content</p></section>' : '') +
      button('Add to Home Screen', 'home', false, 'circle-plus').replace('pqr-button', 'pqr-button pqr-home') +
      '<p class="pqr-feedback" data-pqr-feedback role="status" aria-live="polite"></p></div><footer class="pqr-phone-footer">Nexora · One QR</footer></article>';
  }
  function refreshPreview() {
    document.querySelectorAll('[data-pqr-phone]').forEach(node => { node.innerHTML = phone(); });
    const title = document.querySelector('[data-pqr-card-name]'); if (title) title.textContent = state.name;
    icons();
  }
  function stats(values) { return '<div class="pqr-activity">' + ['QR scans', 'Action clicks', 'Contacts saved'].map((label, index) => '<div class="pqr-stat"><span>' + label + '</span><strong>' + values[index] + '</strong></div>').join('') + '</div>'; }
  function buildMain() {
    return `<section class="pqr-section">
      <section class="pqr-card"><div class="pqr-card-head"><h2>Today’s activity</h2><span class="pqr-demo">Demo data</span></div>${stats([284, 163, 56])}</section>
      <section class="oneqr-qrcard pqr-master-card">${qrMarkup(api.publicUrl())}<div class="oneqr-qrcard-detail"><div class="oneqr-qrcard-title-row"><h3 data-pqr-card-name>${esc(state.name)}</h3><a class="qr-open-link" href="${esc(api.publicUrl())}" target="_blank" rel="noopener" aria-label="Open OneQR landing page">${lucide('external-link')}</a></div><div class="oneqr-qrcard-url">${esc(api.publicUrl())}</div><p>This QR code stays the same. Content and permissions behind it can be updated anytime.</p><div class="oneqr-qrcard-actions">${button('View QR', 'qr', true, 'eye')}${button('Copy URL', 'copy', false, 'copy')}${button('Print', 'print', false, 'printer')}</div></div></section>
      <div class="oneqr-builder pqr-builder">
        <section class="oneqr-panel oneqr-modules"><div class="oneqr-panel-head oneqr-module-heading"><h3>Modules</h3><div class="oneqr-module-toolbar">${button('Contact card', 'profile', false, 'contact-round')}</div></div>
          <form class="oneqr-module-link-form" data-pqr-add-form>${lucide('link-2')}<input name="url" inputmode="url" aria-label="Paste a link to add a module" placeholder="Paste any link — website, Google review, YouTube, Instagram..." required><button type="submit">Add</button></form>
          <p class="oneqr-module-hint">Add a link, then edit the title and destination below.</p><div class="oneqr-module-list pqr-link-list" data-pqr-links></div>
          <div class="oneqr-module-actions">${button('Add Module', 'add', false, 'plus')}${button('Reset to recommended', 'reset', false, 'rotate-ccw')}</div><p class="oneqr-module-hint" data-pqr-module-status role="status">Save Settings to keep your module changes.</p>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-pqr-icon-upload hidden>
        </section>
        <section class="oneqr-panel oneqr-config"><div class="oneqr-panel-head"><h3>Configuration</h3><span class="oneqr-badge">Master QR</span></div><label class="oneqr-field pqr-field">OneQR Name<input data-pqr-name maxlength="100" value="${esc(state.name)}" required></label><label class="oneqr-field pqr-field">Welcome Message<textarea data-pqr-greeting maxlength="300" rows="3">${esc(state.greeting)}</textarea></label>${button('Save Settings', 'save', true, 'save').replace('pqr-button', 'pqr-button pqr-save')}<p class="pqr-feedback" data-pqr-feedback role="status" aria-live="polite"></p></section>
        <section class="oneqr-panel oneqr-preview"><div class="oneqr-panel-head"><h3>Live Preview</h3><span class="oneqr-pill">Mobile</span></div><a class="pqr-preview-link" href="${esc(api.publicUrl())}" target="_blank" rel="noopener">${lucide('external-link')}Public page</a><div data-pqr-phone>${phone()}</div></section>
      </div>
      <section class="pqr-card"><div class="pqr-card-head"><h2>Shared profile</h2>${button('Contact card', 'profile')}</div><div class="pqr-output-grid">${[['qr-code', 'QR page'], ['user-round', 'vCard'], ['wallet', 'Apple / Google Wallet'], ['phone', 'Contact details']].map(([icon, label]) => '<div class="pqr-output">' + image(icon) + '<span>' + label + '</span></div>').join('')}</div></section>
      <section class="pqr-card"><div class="pqr-card-head"><div><h2>OneQR performance</h2><p class="pqr-muted">Last 30 days</p></div><span class="pqr-demo">Demo data</span></div>${stats([315, 163, 56])}<div data-pqr-distribution></div></section>
      <section class="pqr-card"><div class="pqr-card-head"><h2>Contacts sent back</h2><span class="pqr-demo" data-pqr-lead-count>${state.leads.length}</span></div><div data-pqr-leads></div></section>
    </section>`;
  }
  function moduleButton(action, index, label, content) {
    return '<button type="button" data-pqr-action="' + action + '" data-index="' + index + '" aria-label="' + esc(label) + '">' + content + '</button>';
  }
  function renderLinks() {
    const list = document.querySelector('[data-pqr-links]'); if (!list) return;
    list.innerHTML = state.links.length ? state.links.map((link, index) => {
      const title = esc(link.name);
      const hint = link.kind === 'payment' && !api.hasPayment(state) ? 'Payment not configured' : ['tip', 'booking'].includes(link.kind) && !api.linked ? 'No salon linked' : '';
      return `<div class="oneqr-module pqr-module" data-link-index="${index}" data-link-id="${esc(link.id)}">
        <div class="pqr-module-order">${moduleButton('up', index, 'Move up', lucide('arrow-up'))}${moduleButton('down', index, 'Move down', lucide('arrow-down'))}</div>
        <div class="oneqr-module-icon-tools"><span class="oneqr-module-icon">${image(link.icon)}</span><button class="oneqr-module-background${link.background ? ' has-color' : ''}" type="button" data-pqr-action="background" data-index="${index}" aria-label="Choose card background for ${title}"${link.background ? ' style="--action-swatch:' + esc(link.background) + '"' : ''}><span></span></button><span>${moduleButton('icon', index, 'Choose icon for ' + link.name, 'Change icon')}${moduleButton('upload', index, 'Upload icon for ' + link.name, 'Upload')}</span></div>
        <div class="oneqr-module-fields"><input class="oneqr-module-title-input" data-link-field="name" aria-label="Module title: ${title}" maxlength="100" value="${title}"><div class="oneqr-module-url-field">${lucide('link-2')}<input data-link-field="url" aria-label="Link for ${title}" maxlength="500" value="${esc(api.moduleUrl(state, link))}" spellcheck="false">${moduleButton('module-copy', index, 'Copy link for ' + link.name, lucide('copy'))}${moduleButton('module-open', index, 'Open link for ' + link.name, lucide('external-link'))}</div>${hint ? '<small class="pqr-module-hint">' + hint + '</small>' : ''}</div>
        <div class="oneqr-module-side"><input class="pqr-toggle" type="checkbox" aria-label="Toggle ${title} module" data-link-field="enabled"${link.enabled ? ' checked' : ''}><button class="oneqr-module-remove" type="button" data-pqr-action="remove" data-index="${index}">Remove</button></div></div>`;
    }).join('') : '<p class="pqr-muted">No modules yet. Add a module.</p>';
    list.querySelectorAll('[data-pqr-action=up]').forEach((node, index) => { node.disabled = index === 0; });
    list.querySelectorAll('[data-pqr-action=down]').forEach((node, index) => { node.disabled = index === state.links.length - 1; });
    const distribution = document.querySelector('[data-pqr-distribution]');
    if (distribution) distribution.innerHTML = api.visibleLinks(state, api.linked).map((link, index) => '<div class="pqr-performance-row"><span>' + esc(link.name) + '</span><div class="pqr-bar"><span style="width:' + Math.max(12, 80 - index * 19) + '%"></span></div><span>' + Math.max(12, 80 - index * 19) + '</span></div>').join('');
    icons();
  }
  function renderLeads() {
    const list = document.querySelector('[data-pqr-leads]'); if (!list) return;
    list.innerHTML = state.leads.length ? state.leads.map(lead => '<div class="pqr-method"><div><h3>' + esc(lead.name) + '</h3><p class="pqr-muted">' + esc([lead.phone, lead.email].filter(Boolean).join(' · ')) + '</p></div><span class="pqr-muted">' + new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</span></div>').join('') : '<div class="pqr-empty">No data yet</div>';
    document.querySelector('[data-pqr-lead-count]').textContent = state.leads.length;
  }
  // Reuse the Receive Tips salon list from the existing staff-app My QR screen.
  function tipPanel() {
    if (!api.linked) return '<section class="pqr-card"><div class="pqr-empty">' + image('hand-coins') + '<h2>No salon linked</h2><p>No valid Tip QR yet. Link a salon or wait for confirmation.</p></div><div class="pqr-actions">' + button('Try again', 'retry') + '<a class="pqr-button" href="' + esc(api.page()) + '">One QR</a></div></section>';
    return '<section class="pqr-card pqr-tip-list" data-salon-qr-list><div class="pqr-card-head"><div><p class="pqr-tip-eyebrow">Accept Payments</p><h2>Payment &amp; Tip QR</h2></div><span class="pqr-demo">' + api.salons.length + ' salons</span></div><div class="pqr-salon-rows">' + api.salons.map(salon => {
      const target = tipUrl(salon.id);
      return '<article class="pqr-salon-row">' + qrMarkup(target, 62) + '<div class="pqr-salon-copy"><h3>' + esc(salon.name) + '</h3><p>Customer payments &amp; tips</p><span class="pqr-url">' + esc(target) + '</span></div><div class="pqr-salon-actions"><button class="pqr-icon-button" type="button" data-pqr-salon-view="' + salon.id + '" aria-label="View ' + esc(salon.name) + ' salon QR">' + lucide('eye') + '</button><button class="pqr-icon-button is-primary" type="button" data-pqr-salon-copy="' + salon.id + '" aria-label="Copy ' + esc(salon.name) + ' salon QR link">' + lucide('link') + '</button></div></article>';
    }).join('') + '</div></section>';
  }
  function showTipQr(salonId) {
    const salon = api.salons.find(item => item.id === salonId);
    if (!api.linked || !salon) return;
    openDialog('Payment & Tip QR', '<div class="pqr-tip-detail"><h2>' + esc(salon.name) + '</h2><p>' + esc(state.profile.name) + '</p><span class="pqr-status">Active</span>' + qrMarkup(tipUrl(salon.id), 216) + '<p class="pqr-url">' + esc(tipUrl(salon.id)) + '</p><div class="pqr-actions"><button type="button" class="pqr-button" data-pqr-salon-copy="' + salon.id + '">' + lucide('link') + 'Copy Link</button>' + button('Print', 'browser-print', false, 'printer') + '<button type="button" class="pqr-button is-primary" data-pqr-tip-save="' + salon.id + '">' + lucide('download') + 'Save QR</button></div></div>');
  }
  function paymentPanel() {
    return '<div class="rp-root" data-pqr-receive-payment></div>';
  }
  function mountPayment() {
    paymentController = window.NEXORA_RECEIVE_PAYMENT_METHODS.mount(host.querySelector('[data-pqr-receive-payment]'), {
      methods: api.methodConfig, read: api.read, getPayment: api.payment, isConfigured: api.configuredPayment,
      paymentUrl: () => api.publicUrl('payment'), qrMarkup, drawQR, copy,
      onChange(method, values, original) {
        const latest = api.read();
        const merged = api.payment(latest, method);
        Object.keys(values).forEach(key => { if (!same(values[key], original[key])) merged[key] = values[key]; });
        const previous = state.payments;
        state.payments = { ...latest.payments, [method]: merged };
        if (!persist(undefined, ['payments'])) { state.payments = previous; return false; }
        refreshPreview(); return true;
      }
    });
  }
  // The QR and URL are the existing invite link supplied in the reference screenshot.
  function referralPanel() {
    const url = api.referralUrl(state);
    const staffId = new URL(url || api.publicUrl()).searchParams.get('staff') || state.staffId;
    return '<section class="pqr-referral-card"><header><h2>Referral &amp; Join Salon QR</h2><span class="pqr-referral-gift">' + lucide('gift') + '</span></header><fieldset class="pqr-referral-placement"><legend>SELECT PLACEMENT LEG</legend><div>' + [['left', 'Left Leg'], ['right', 'Right Leg']].map(([leg, label]) => '<label><input type="radio" name="referral-placement" value="' + leg + '"' + (state.referralPlacement === leg ? ' checked' : '') + '><span>' + label + '</span></label>').join('') + '</div></fieldset>' + (url ? '<div class="pqr-referral-code">' + qrMarkup(url, 136) + '</div>' + (api.linked ? '<div class="pqr-referral-id"><span>Staff ID: ' + esc(staffId) + '</span><button class="pqr-icon-button" type="button" data-pqr-action="staff-id-copy" aria-label="Copy Staff ID">' + lucide('copy') + '</button></div>' : '') + '<div class="pqr-referral-url"><input aria-label="Invite link" value="' + esc(url) + '" readonly>' + button('Copy', 'referral-copy') + '</div>' : '<div class="pqr-empty">No invite link yet</div>') + '</section>';
  }
  function adPanel() {
    return '<div class="pqr-advertising" data-pqr-advertising></div>';
  }
  function mountAdvertising() {
    const slot = host.querySelector('[data-pqr-advertising]');
    if (!advertisingElement) {
      const template = document.createElement('template');
      template.innerHTML = window.NEXORA_PERSONAL_ADVERTISING_TEMPLATE;
      advertisingElement = template.content.firstElementChild;
    }
    slot.append(advertisingElement);
    if (advertisingController) { advertisingController.refresh(); return; }
    advertisingController = window.NEXORA_ONEQR_ADVERTISING.mount(advertisingElement, {
      accountType: 'personal', accountId: state.id, readOwner: api.read,
      onActivationChange({ activated, adsEnabled, allowedIndustries, industrySelection }) {
        const previous = { ads: state.ads, consent: state.consent, adIndustries: state.adIndustries, adIndustrySelection: state.adIndustrySelection };
        state.ads = adsEnabled; state.consent = activated; state.adIndustries = allowedIndustries; state.adIndustrySelection = industrySelection;
        if (!persist(undefined, ['ads', 'consent', 'adIndustries', 'adIndustrySelection'])) { Object.assign(state, previous); return false; }
        refreshPreview(); return true;
      }
    });
  }
  function navigate(tab, updateURL = true) {
    if (dialog.open) dialog.close();
    if (paymentController) { paymentController.destroy(); paymentController = null; }
    if (advertisingController) advertisingController.close();
    tab = aliases[tab] || tab; current = tabs.some(item => item.id === tab) ? tab : 'one-qr';
    if (updateURL) { const target = new URL(location.href); target.searchParams.delete('view'); target.searchParams.set('tab', current); history.pushState({}, '', target); }
    host.innerHTML = '<div class="pqr-heading"><div><h1>My One QR</h1><p>One QR code to share your information and links.</p></div><span class="pqr-demo">Personal · ' + (api.linked ? 'Salon linked' : 'No salon linked') + '</span></div>' +
      '<nav class="qr-tabs pqr-tabs" role="tablist" aria-label="One QR">' + tabs.map(item => '<button class="qr-tab' + (item.id === current ? ' is-active' : '') + '" id="pqr-tab-' + item.id + '" type="button" role="tab" aria-selected="' + (item.id === current) + '" aria-controls="pqr-panel" data-pqr-tab="' + item.id + '"><span class="qr-tab-icon">' + lucide(item.icon) + '</span><span>' + item.label + '</span></button>').join('') + '</nav><div id="pqr-panel" role="tabpanel" aria-labelledby="pqr-tab-' + current + '">' + ({ 'one-qr': buildMain, 'tip-qr': tipPanel, 'accept-payment': paymentPanel, 'referral-link': referralPanel, advertising: adPanel }[current])() + '</div><p class="pqr-feedback" data-pqr-feedback role="status" aria-live="polite"></p>';
    if (current === 'one-qr') { renderLinks(); renderLeads(); syncIconUploads(); }
    if (current === 'advertising') mountAdvertising();
    if (current === 'accept-payment') mountPayment();
    if (window.NEXORA_SHELL && window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(current);
    icons(); drawQR(host);
  }
  api.navigate = navigate;
  function editProfile() {
    const profile = clone(state.profile);
    openDialog('Contact card', '<form data-pqr-profile-form><div class="pqr-dialog-fields"><label class="pqr-field full">Display name<input name="name" value="' + esc(profile.name) + '" maxlength="100" required></label><label class="pqr-field full">About me<textarea name="bio" maxlength="500">' + esc(profile.bio) + '</textarea></label><label class="pqr-field">Phone number<input name="phone" type="tel" value="' + esc(profile.phone) + '"></label><label class="pqr-field">Email<input name="email" type="email" value="' + esc(profile.email) + '"></label><label class="pqr-field full">Profile photo<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"></label></div><fieldset class="pqr-terms"><legend>Public information</legend><label class="pqr-consent"><input name="showPhone" type="checkbox"' + (profile.showPhone ? ' checked' : '') + '>Phone number</label><label class="pqr-consent"><input name="showEmail" type="checkbox"' + (profile.showEmail ? ' checked' : '') + '>Email</label></fieldset><p class="pqr-feedback" data-pqr-profile-error role="alert"></p><div class="pqr-actions"><button class="pqr-button is-primary" type="submit">Save Settings</button>' + button('Cancel', 'close') + '</div></form>');
    const form = dialog.querySelector('form');
    let avatar = profile.avatar;
    form.elements.avatar.addEventListener('change', () => {
      const file = form.elements.avatar.files[0]; if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return;
      const reader = new FileReader(); reader.onload = () => { avatar = reader.result; }; reader.readAsDataURL(file);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.elements.name.value.trim()) { dialog.querySelector('[data-pqr-profile-error]').textContent = 'Enter a display name.'; return; }
      const prior = state.profile;
      const values = { name: form.elements.name.value.trim(), bio: form.elements.bio.value.trim(), phone: form.elements.phone.value.trim(), email: form.elements.email.value.trim(), showPhone: form.elements.showPhone.checked, showEmail: form.elements.showEmail.checked, avatar };
      state.profile = { ...api.read().profile };
      Object.keys(values).forEach(key => { if (!same(values[key], profile[key])) state.profile[key] = values[key]; });
      if (!persist(undefined, ['profile'])) { state.profile = prior; dialog.querySelector('[data-pqr-profile-error]').textContent = 'Could not save. Please try again.'; return; }
      dialog.close(); refreshPreview();
      document.querySelectorAll('.staff-profile-name').forEach(node => { node.textContent = state.profile.name; });
      feedback('Settings saved.');
    });
  }
  function addLink(value = '') {
    openDialog('Add Module', '<form data-pqr-new-link><label class="pqr-field">Module title<input name="name" maxlength="100" required></label><label class="pqr-field">URL<input name="url" value="' + esc(value) + '" maxlength="500" required></label><p class="pqr-feedback" data-pqr-link-error role="alert"></p><button type="submit" class="pqr-button is-primary">Add Module</button></form>');
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault(); const form = event.currentTarget;
      if (!form.elements.name.value.trim() || !api.validUrl(form.elements.url.value.trim())) { dialog.querySelector('[data-pqr-link-error]').textContent = 'Enter a title and a valid URL.'; return; }
      state.links.push({ id: 'link-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), name: form.elements.name.value.trim(), url: form.elements.url.value.trim(), icon: 'link', enabled: true });
      dialog.close(); document.querySelector('[data-pqr-add-form]').reset(); renderLinks(); refreshPreview(); feedback('Save Settings to keep your module changes.');
    });
  }
  function updateAppearance(id, field, value) {
    const link = state.links.find(item => item.id === id); if (!link) return;
    if (field === 'icon' && iconReads.has(id)) { iconReads.get(id).abort(); iconReads.delete(id); }
    link[field] = value; renderLinks(); refreshPreview();
    const status = host.querySelector('[data-pqr-module-status]');
    if (status) status.textContent = 'Module appearance updated. Select Save Settings to keep it.';
  }
  function syncIconUploads() {
    if (!host) return;
    host.querySelectorAll('[data-pqr-action=save]').forEach(control => { control.disabled = iconReads.size > 0; control.setAttribute('aria-busy', String(iconReads.size > 0)); });
  }
  function uploadModuleIcon(input) {
    const file = input.files[0], id = input.dataset.linkId; input.value = '';
    if (!file || !state.links.some(item => item.id === id)) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 1024 * 1024) { feedback('Use a PNG, JPG, WebP, or GIF image smaller than 1 MB.', true); return; }
    if (iconReads.has(id)) iconReads.get(id).abort();
    const reader = new FileReader(); iconReads.set(id, reader);
    syncIconUploads();
    const finish = () => { if (iconReads.get(id) === reader) iconReads.delete(id); syncIconUploads(); };
    reader.onload = () => { if (iconReads.get(id) !== reader) return; finish(); if (api.isIconImage(reader.result)) updateAppearance(id, 'icon', reader.result); };
    reader.onerror = () => { finish(); feedback('Could not read this image. Please try another file.', true); };
    reader.onabort = finish; reader.readAsDataURL(file);
  }
  function saveDraft() {
    if (iconReads.size) return;
    const error = api.validate(state);
    if (error) {
      if (current !== 'one-qr') navigate('one-qr');
      const field = error.field === 'name' ? host.querySelector('[data-pqr-name]') : error.field === 'link' ? host.querySelectorAll('[data-link-index]')[error.index].querySelector('[data-link-field="' + (!state.links[error.index].name.trim() ? 'name' : 'url') + '"]') : null;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); } else editProfile();
      feedback(error.message, true); return;
    }
    persist('Settings saved.');
  }
  async function copy(value) {
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(value); copied = true; }
      else {
        const input = document.createElement('textarea'); input.value = value; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select();
        try { copied = Boolean(document.execCommand && document.execCommand('copy')); } finally { input.remove(); }
      }
    } catch (_) { copied = false; }
    feedback(copied ? 'Link copied.' : 'Could not copy the link.');
    if (!copied) openDialog('Copy URL', '<label class="pqr-field">URL<input value="' + esc(value) + '" readonly></label>');
  }
  function showQr(value, print = false) {
    openDialog(print ? 'Print' : 'View QR', '<div style="text-align:center"><h2>' + esc(state.name) + '</h2>' + qrMarkup(value, 216) + '<p class="pqr-url">' + esc(value) + '</p><span class="pqr-demo">Demo data</span></div><div class="pqr-actions">' + (print ? button('Print', 'browser-print', true, 'printer') : '<a class="pqr-button is-primary" href="' + esc(value) + '" target="_blank" rel="noopener">Public page</a>') + '</div>');
  }
  function tipUrl(salonId = state.salonId) {
    return api.salons.find(item => item.id === salonId)?.tipUrl || '';
  }
  function exchangeContact() {
    openDialog('Send yours', '<form data-pqr-exchange-form><label class="pqr-field">Display name<input name="name" maxlength="100" required></label><label class="pqr-field">Phone number<input type="tel" name="phone" maxlength="50"></label><label class="pqr-field">Email<input type="email" name="email" maxlength="150"></label><p class="pqr-muted">This prototype uses demo data and preview responses.</p><p class="pqr-feedback" data-pqr-exchange-error role="alert"></p><button class="pqr-button is-primary" type="submit">Send yours</button></form>');
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault(); const form = event.currentTarget;
      if (!form.elements.name.value.trim() || (!form.elements.phone.value.trim() && !form.elements.email.value.trim())) { dialog.querySelector('[data-pqr-exchange-error]').textContent = 'Enter your contact information.'; return; }
      const lead = { id: Date.now().toString(), name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(), email: form.elements.email.value.trim(), createdAt: new Date().toISOString() };
      // Public actions read the last saved owner state, preserving a newer edit from another tab.
      const saved = api.read(); saved.leads.unshift(lead);
      try { api.save(saved); state.leads = saved.leads; }
      catch (_) { dialog.querySelector('[data-pqr-exchange-error]').textContent = 'Could not save. Please try again.'; return; }
      dialog.close(); renderLeads(); feedback('Contact sent.');
    });
  }
  document.addEventListener('click', async event => {
    const tab = event.target.closest('[data-pqr-tab]'); if (tab && host) { navigate(tab.dataset.pqrTab); return; }
    const link = event.target.closest('[data-pqr-link]');
    if (link) {
      const item = api.visibleLinks(state, host ? api.linked : Boolean(state.salonId)).find(row => row.id === link.dataset.pqrLink);
      if (item) openDialog(item.name, '<p class="pqr-url">' + esc(item.url) + '</p><p class="pqr-muted">This prototype uses demo data and preview responses; it does not process payments, tips, or balance changes.</p>');
      return;
    }
    const salonView = event.target.closest('[data-pqr-salon-view]'); if (salonView) { showTipQr(salonView.dataset.pqrSalonView); return; }
    const salonCopy = event.target.closest('[data-pqr-salon-copy]'); if (salonCopy && api.linked) { await copy(tipUrl(salonCopy.dataset.pqrSalonCopy)); return; }
    const tipSave = event.target.closest('[data-pqr-tip-save]'); if (tipSave) {
      const canvas = dialog.querySelector('canvas'); if (canvas) { const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = tipSave.dataset.pqrTipSave + '-tip-qr.png'; link.click(); } return;
    }
    const tipShare = event.target.closest('[data-pqr-tip-share]'); if (tipShare && api.linked) {
      const target = tipUrl(tipShare.dataset.pqrTipShare);
      try { if (navigator.share) await navigator.share({ title: 'Payment & Tip QR', url: target }); else await copy(target); } catch (_) { /* Closing the share sheet leaves the invite unchanged. */ } return;
    }
    const choice = event.target.closest('[data-pqr-icon]'); if (choice) { if (api.icons.includes(choice.dataset.pqrIcon)) updateAppearance(choice.dataset.linkId, 'icon', choice.dataset.pqrIcon); dialog.close(); return; }
    const swatch = event.target.closest('[data-pqr-background]'); if (swatch) { const value = window.ONEQR_ACTION_APPEARANCE.backgrounds[Number(swatch.dataset.pqrBackground)] || ''; updateAppearance(swatch.dataset.linkId, 'background', value); dialog.close(); return; }
    const control = event.target.closest('[data-pqr-action]'); if (!control) return;
    const action = control.dataset.pqrAction, index = Number(control.dataset.index);
    if (action === 'close') dialog.close();
    else if (action === 'profile') editProfile();
    else if (action === 'save') saveDraft();
    else if (action === 'add') addLink();
    else if (action === 'reset') { iconReads.forEach(reader => reader.abort()); iconReads.clear(); state.links = api.template(api.linked); renderLinks(); refreshPreview(); feedback('Save Settings to keep your module changes.'); }
    else if (action === 'remove') { const link = state.links[index]; if (link && iconReads.has(link.id)) iconReads.get(link.id).abort(); state.links.splice(index, 1); renderLinks(); refreshPreview(); }
    else if (action === 'up' || action === 'down') { const target = index + (action === 'up' ? -1 : 1); if (target >= 0 && target < state.links.length) { [state.links[index], state.links[target]] = [state.links[target], state.links[index]]; renderLinks(); refreshPreview(); } }
    else if (action === 'icon' && state.links[index]) openDialog('Choose an icon', '<div class="pqr-icon-grid">' + api.icons.map(icon => '<button class="pqr-icon-choice" type="button" data-pqr-icon="' + icon + '" data-link-id="' + esc(state.links[index].id) + '" aria-label="' + icon + '">' + image(icon) + '</button>').join('') + '</div>');
    else if (action === 'background' && state.links[index]) openDialog('Choose a card background', '<div class="pqr-icon-grid pqr-background-grid">' + ['', ...window.ONEQR_ACTION_APPEARANCE.backgrounds].map((color, value) => '<button class="pqr-icon-choice" type="button" data-pqr-background="' + (value - 1) + '" data-link-id="' + esc(state.links[index].id) + '" aria-label="' + (color ? 'Use gradient ' + value : 'Use white') + '"><span style="background:' + (color || '#fff') + '"></span></button>').join('') + '</div>');
    else if (action === 'upload' && state.links[index]) { const input = host.querySelector('[data-pqr-icon-upload]'); input.dataset.linkId = state.links[index].id; input.click(); }
    else if (action === 'module-copy' && state.links[index]) await copy(api.moduleUrl(state, state.links[index]));
    else if (action === 'module-open' && state.links[index] && api.validUrl(state.links[index].url)) window.open(api.moduleUrl(state, state.links[index]), '_blank', 'noopener');
    else if (action === 'qr' || action === 'print') showQr(api.publicUrl(), action === 'print');
    else if (action === 'copy' || action === 'share') await copy(api.publicUrl());
    else if (action === 'browser-print') window.print();
    else if (action === 'tip-view' && api.linked) showQr(tipUrl());
    else if (action === 'tip-copy' && api.linked) await copy(tipUrl());
    else if (action === 'payment-view' && api.hasPayment(state)) showQr(api.publicUrl('payment'));
    else if (action === 'payment-copy' && api.hasPayment(state)) await copy(api.publicUrl('payment'));
    else if (action === 'referral-copy' && state.referral) await copy(api.referralUrl(state));
    else if (action === 'staff-id-copy') await copy(new URL(api.referralUrl(state)).searchParams.get('staff') || state.staffId);
    else if (action === 'referral-add' && state.referral) { if (!state.links.some(item => item.kind === 'referral')) state.links.push({ id: 'referral', name: 'Join me', url: state.referral, icon: 'share-2', kind: 'referral', enabled: true }); navigate('one-qr'); feedback('Save Settings to keep your module changes.'); }
    else if (action === 'preview') openDialog('Live Preview', '<div data-pqr-phone>' + phone() + '</div>');
    else if (action === 'retry') { if (current === 'referral-link') { state.referral = api.read().referral; } navigate(current, false); feedback(current === 'tip-qr' ? 'No valid salon link yet.' : 'No data yet'); }
    else if (action === 'exchange') exchangeContact();
    else if (action === 'vcard') {
      const blob = new Blob([api.vcard(state)], { type: 'text/vcard;charset=utf-8' }); const value = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = value; anchor.download = 'oneqr-personal.vcf'; anchor.click(); setTimeout(() => URL.revokeObjectURL(value), 1000); feedback('vCard downloaded.');
    } else if (action === 'wallet' || action === 'home' || action === 'call' || action === 'text') {
      openDialog(control.textContent.trim(), '<p class="pqr-muted">This prototype uses demo data and preview responses.</p>' + (['call', 'text'].includes(action) && state.profile.showPhone ? '<p>' + esc(state.profile.phone) + '</p>' : ''));
    }
  });
  if (host) {
    host.addEventListener('input', event => {
      if (event.target.matches('[data-pqr-name]')) { state.name = event.target.value; event.target.removeAttribute('aria-invalid'); refreshPreview(); }
      if (event.target.matches('[data-pqr-greeting]')) { state.greeting = event.target.value; refreshPreview(); }
      if (event.target.matches('[data-link-field]')) {
        const row = state.links[Number(event.target.closest('[data-link-index]').dataset.linkIndex)]; const field = event.target.dataset.linkField;
        if (!row) return;
        row[field] = field === 'enabled' ? event.target.checked : event.target.value; event.target.removeAttribute('aria-invalid'); refreshPreview();
      }
    });
    host.addEventListener('change', event => {
      if (event.target.matches('[data-pqr-icon-upload]')) uploadModuleIcon(event.target);
      if (event.target.matches('[name=referral-placement]')) {
        const previous = state.referralPlacement;
        state.referralPlacement = event.target.value === 'right' ? 'right' : 'left';
        if (!persist(undefined, ['referralPlacement'])) state.referralPlacement = previous;
        navigate('referral-link', false);
      }
      if (event.target.matches('[data-pqr-salon]') && api.linked && api.salons.some(item => item.id === event.target.value)) { state.salonId = event.target.value; persist(undefined, ['salonId']); navigate('tip-qr', false); }
    });
    host.addEventListener('submit', event => { if (event.target.matches('[data-pqr-add-form]')) { event.preventDefault(); const input = event.target.elements.url; if (!api.validUrl(input.value.trim())) { input.setAttribute('aria-invalid', 'true'); feedback('Enter a valid URL.', true); return; } addLink(input.value.trim()); } });
    host.addEventListener('keydown', event => {
      const tab = event.target.closest('[data-pqr-tab]'); if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const index = tabs.findIndex(item => item.id === current); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      navigate(tabs[next].id); host.querySelector('[data-pqr-tab="' + tabs[next].id + '"]').focus();
    });
    window.addEventListener('popstate', () => { navigate(new URL(location.href).searchParams.get('tab'), false); });
    const frameView = params.get('view');
    if (frameView && ['dashboard', 'community', 'profile'].includes(frameView)) {
      host.innerHTML = '<div class="pqr-heading"><h1>' + ({ dashboard: 'Dashboard', community: 'Community', profile: 'Profile' }[frameView]) + '</h1><span class="pqr-demo">Personal</span></div><section class="pqr-card"><div class="pqr-card-head"><h2>One QR</h2><a class="pqr-button is-primary" href="' + esc(api.page()) + '">One QR</a></div><p class="pqr-muted">Shown according to your current permissions</p>' + (frameView === 'profile' ? button('Contact card', 'profile') : '') + '</section>';
      window.NEXORA_SHELL.activeTab = frameView;
      if (window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(frameView);
      if (frameView === 'community') window.NEXORA_SHELL.isCommunity = true;
    } else navigate(params.get('tab') || 'one-qr', false);
  } else {
    const view = params.get('view');
    if (view === 'payment' || view === 'tip') {
      const hasTip = Boolean(state.salonId) && api.salons.some(item => item.id === params.get('salon'));
      const available = view === 'payment' ? api.hasPayment(state) : hasTip;
      publicHost.innerHTML = '<section class="pqr-card"><div class="pqr-card-head"><h1>' + (view === 'payment' ? 'Accept Payment' : 'Tip QR') + '</h1><span class="pqr-demo">Demo data</span></div><h2>' + esc(state.profile.name) + '</h2>' + (available ? (view === 'payment' ? api.enabledPayments(state).map(method => '<div class="pqr-method">' + method + '</div>').join('') : '<p>' + esc(api.salons.find(item => item.id === params.get('salon')).name) + '</p>') : '<p class="pqr-muted">' + (view === 'payment' ? 'Payment not configured' : 'No valid QR yet') + '</p>') + '<p class="pqr-muted">This prototype uses demo data; it does not process payments, tips, or balance changes.</p><a class="pqr-button" href="' + esc(api.publicUrl()) + '">Personal page</a></section>';
    } else publicHost.innerHTML = '<div data-pqr-phone>' + phone() + '</div>';
  }
  window.addEventListener('storage', event => {
    if (event.key !== api.KEY) return;
    const fresh = api.read(); state.leads = fresh.leads;
    if (publicHost) { Object.assign(state, fresh); if (!params.get('view') || params.get('view') === 'profile') refreshPreview(); }
    else {
      const previousLinks = state.links;
      const previousName = state.name;
      const previousGreeting = state.greeting;
      reconcile(fresh);
      if (!same(previousLinks, state.links)) renderLinks();
      const nameInput = document.querySelector('[data-pqr-name]');
      const greetingInput = document.querySelector('[data-pqr-greeting]');
      if (nameInput && previousName !== state.name) nameInput.value = state.name;
      if (greetingInput && previousGreeting !== state.greeting) greetingInput.value = state.greeting;
      renderLeads(); refreshPreview();
      if (advertisingController && current === 'advertising') advertisingController.refresh();
      if (paymentController && current === 'accept-payment') paymentController.render();
    }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  icons(); drawQR();
})();
