/* Receive-payment configuration from Nexora staging /dashboard/touchpoints?section=payment.
 * Shared by Personal and Staff. All changes use the caller's local prototype store. */
(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = name => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const button = (label, action, cls = '') => '<button class="workflow-btn ' + cls + '" type="button" data-rp-action="' + action + '">' + label + '</button>';
  function mount(root, options) {
    const methods = options.methods;
    const dialog = document.createElement('dialog');
    dialog.className = 'pqr-dialog rp-dialog'; dialog.setAttribute('aria-labelledby', 'rp-dialog-title'); document.body.append(dialog);
    const readers = new Set();
    const logo = method => '<img class="rp-provider-logo" src="' + esc(new URL('../pages/assets/icons/' + method.image, location.href).href) + '" alt="' + esc(method.label) + ' logo">';
    const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };
    const record = method => options.getPayment(options.read(), method.label);
    const row = (label, value) => '<div class="rp-detail-row"><dt>' + label + '</dt><dd>' + esc(value || 'Not Configured') + '</dd></div>';
    function open(title, body, method) {
      dialog.innerHTML = '<header class="rp-dialog-heading">' + (method ? logo(method) : '') + '<h2 id="rp-dialog-title">' + esc(title) + '</h2><button class="rp-close" type="button" data-rp-action="close" aria-label="Close">' + icon('x') + '</button></header>' + body;
      if (!dialog.open) dialog.showModal(); refreshIcons(); options.drawQR(dialog);
    }
    function render() {
      const owner = options.read();
      const url = options.paymentUrl();
      root.innerHTML = '<section class="payout-methods-card rp-payment-card"><div class="payout-methods-head"><h2>' + icon('qr-code') + 'Payment QR</h2></div><div class="rp-direct-payment">' + options.qrMarkup(url, 112) + '<div class="direct-payment-detail"><h2>' + esc(owner.profile.name) + '</h2><a class="direct-payment-link" href="' + esc(url) + '" target="_blank" rel="noopener"><span>' + esc(url) + '</span>' + icon('external-link') + '</a><p>Scan to pay ' + esc(owner.profile.name) + '</p><div class="rp-payment-actions">' + button(icon('qr-code') + 'View QR to Download', 'payment-qr', 'is-info') + button(icon('copy') + 'Copy Payment Link', 'copy') + button(icon('clipboard-list') + 'Payment Activity', 'activity', 'is-soft-brand') + '</div></div></div></section><section class="payout-methods-card"><div class="payout-methods-head"><h2>' + icon('wallet-cards') + 'Receive Payment Methods</h2></div><div class="payout-methods-list">' + methods.map(method => {
        const item = options.getPayment(owner, method.label);
        const configured = options.isConfigured(owner, method.label);
        const summary = configured ? (method.id === 'vlinkpay' ? ['USDV ' + item.usdv, 'USDT ' + item.usdt].filter((_, index) => index ? item.usdt : item.usdv).join(' · ') : [item.holder, item.identifier].filter(Boolean).join(' · ')) : 'Not Configured';
        return '<article class="payout-method-row" data-rp-row="' + method.id + '"><button class="payout-toggle' + (item.enabled ? ' is-on' : '') + '" type="button" role="switch" aria-checked="' + Boolean(item.enabled) + '" aria-label="Toggle ' + esc(method.label) + '" data-rp-toggle="' + method.id + '"><span></span></button><span class="payout-method-icon">' + logo(method) + '</span><div class="payout-method-copy"><strong>' + esc(method.label) + '</strong><span' + (!configured ? ' class="rp-not-configured"' : '') + '>' + esc(summary) + '</span></div><div class="payout-method-actions"><button class="payout-action is-view" type="button" data-rp-view="' + method.id + '" aria-label="View ' + esc(method.label) + ' Payout Details">' + icon('eye') + '<span>View</span></button><button class="payout-action is-edit" type="button" data-rp-edit="' + method.id + '" aria-label="Edit ' + esc(method.label) + ' Payout Account">' + icon('pencil') + '<span>Edit</span></button></div></article>';
      }).join('') + '</div></section>';
      options.drawQR(root); refreshIcons();
    }
    function view(method) {
      const item = record(method);
      const qr = (value, label) => value ? '<img class="rp-uploaded-qr" src="' + esc(value) + '" alt="' + esc(label) + ' QR code">' : '<p class="rp-no-qr">No QR code uploaded.</p>';
      const body = method.id === 'vlinkpay' ? '<div class="rp-wallet-view">' + ['usdv', 'usdt'].map(token => '<section><h3>' + token.toUpperCase() + '</h3>' + qr(item['qr' + token], token.toUpperCase()) + '<dl>' + row('WALLET ADDRESS', item[token]) + '</dl></section>').join('') + '</div>' : qr(item.qr, method.label) + '<dl>' + row(method.id === 'zelle' ? 'ZELLE REGISTERED NAME' : 'ACCOUNT HOLDER NAME', item.holder) + row(method.id === 'zelle' ? 'EMAIL OR PHONE' : 'ACCOUNT IDENTIFIER', item.identifier) + '</dl>';
      open(method.label, '<div class="rp-dialog-body rp-view-body">' + body + '</div><footer class="rp-dialog-footer">' + button('CLOSE', 'close', 'is-primary') + '</footer>', method);
    }
    const field = (label, name, value, placeholder, required = false) => '<label class="rp-field"><span>' + label + (required ? ' <b>*</b>' : '') + '</span><input name="' + name + '" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '" maxlength="300"' + (required ? ' required' : '') + '></label>';
    function edit(method) {
      const original = record(method);
      const uploads = { qr: original.qr, qrusdv: original.qrusdv, qrusdt: original.qrusdt };
      const versions = { qr: 0, qrusdv: 0, qrusdt: 0 };
      let pending = 0;
      const upload = (name = 'qr') => '<div class="rp-upload" data-rp-upload="' + name + '"><label class="rp-upload-label">QR CODE (OPTIONAL)</label><div class="rp-upload-controls"><button class="rp-photo" type="button" data-rp-photo="' + name + '">' + icon('camera') + 'Take photo</button><label class="rp-choose-file">' + icon('upload') + '<span>Choose file</span><input type="file" name="' + name + '" accept="image/jpeg,image/png" data-rp-file="' + name + '"></label><input type="file" accept="image/jpeg,image/png" capture="environment" data-rp-camera="' + name + '" hidden></div><div data-rp-preview="' + name + '"></div></div>';
      const wallet = method.id === 'vlinkpay';
      const details = wallet ? '<div class="rp-network-note">' + icon('info') + '<span>Only provide VRC20 network addresses. Nexora cannot reverse transactions sent to the wrong network or address.</span></div><h3>VLINKPAY CRYPTO ADDRESSES</h3><p>Enter at least 1 wallet address</p>' + [['usdv', 'USD VLINK'], ['usdt', 'USD Tether']].map(([token, label]) => '<section class="rp-token"><div class="rp-token-heading"><strong>' + label + '</strong><span>' + token.toUpperCase() + '</span></div>' + field('WALLET ADDRESS', token, original[token], 'WALLET ADDRESS') + '<small>Network: VRC20</small>' + upload('qr' + token) + '</section>').join('') + '<details class="rp-wallet-help" open><summary>HOW TO GET YOUR WALLET ADDRESS</summary><ol><li><strong>Open app VLINKPAY</strong><p>Sign in to your merchant VLINKPAY account on your phone.</p></li><li><strong>Choose Top-up for Purchase &gt; Receive Token</strong><p>On the app home screen, choose Top-up for Purchase &gt; Receive Token.</p></li><li><strong>Choose token</strong><p>Choose USDV or USDT. Both use the VRC20 network for this flow, but each token has its own address.</p></li><li><strong>Copy &amp; paste into Nexora</strong><p>Copy each address from the app, then paste the matching address here.</p></li></ol></details>' : field('ACCOUNT HOLDER NAME', 'holder', original.holder, 'e.g. Anna Smith', true) + field('ACCOUNT IDENTIFIER', 'identifier', original.identifier, method.placeholder, true) + upload();
      open(wallet ? 'VLINKPAY ACCOUNT' : method.label.toUpperCase() + ' ACCOUNT', '<form data-rp-form><div class="rp-dialog-body"><p class="rp-subtitle">Specify receiving target identifier</p>' + details + (!wallet ? '<p class="rp-file-help">You can either take a photo or upload from your device. Accepted formats: JPG, PNG, JPEG. Max size: 5MB per file.</p>' : '') + '<p class="rp-receiving-note">' + icon('info') + '<span>' + (wallet ? 'Make sure the recipient information is correct before saving.' : 'Please enter the correct receiving account information. This will be used to receive payments.') + '</span></p><p class="pqr-feedback is-error" data-rp-error role="alert"></p></div><footer class="rp-dialog-footer">' + button('CANCEL', 'close') + '<button class="workflow-btn is-primary" type="submit">SAVE</button></footer></form>', method);
      const form = dialog.querySelector('form');
      function preview(name) {
        const target = form.querySelector('[data-rp-preview="' + name + '"]'); if (!target) return;
        target.innerHTML = uploads[name] ? '<div class="rp-preview-image"><img src="' + esc(uploads[name]) + '" alt="Payout QR Code"><button type="button" class="rp-delete" data-rp-delete="' + name + '">' + icon('trash-2') + '<span>Delete</span></button></div>' : '';
        refreshIcons();
      }
      Object.keys(uploads).forEach(preview);
      form.querySelectorAll('[data-rp-file], [data-rp-camera]').forEach(input => input.addEventListener('change', () => {
        const file = input.files && input.files[0]; if (!file) return;
        const error = form.querySelector('[data-rp-error]');
        if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) { error.textContent = 'Accepted formats: JPG, PNG, JPEG. Max size: 5MB per file.'; input.value = ''; return; }
        const name = input.dataset.rpFile || input.dataset.rpCamera;
        const version = ++versions[name];
        const reader = new FileReader(); readers.add(reader); pending++; form.querySelector('[type=submit]').disabled = true;
        const done = () => { readers.delete(reader); pending--; if (form.isConnected) form.querySelector('[type=submit]').disabled = pending > 0; };
        reader.onload = () => { if (form.isConnected && dialog.open && versions[name] === version) { uploads[name] = reader.result; error.textContent = ''; preview(name); } done(); };
        reader.onerror = () => { if (form.isConnected && versions[name] === version) error.textContent = 'Could not save. Please try again.'; done(); };
        reader.onabort = done; reader.readAsDataURL(file);
      }));
      form.addEventListener('click', event => {
        const photo = event.target.closest('[data-rp-photo]'); if (photo) form.querySelector('[data-rp-camera="' + photo.dataset.rpPhoto + '"]').click();
        const remove = event.target.closest('[data-rp-delete]'); if (remove) { versions[remove.dataset.rpDelete]++; uploads[remove.dataset.rpDelete] = ''; preview(remove.dataset.rpDelete); }
      });
      form.querySelectorAll('[name=usdv], [name=usdt]').forEach(input => input.addEventListener('input', () => form.elements.usdv.setCustomValidity('')));
      form.addEventListener('submit', event => {
        event.preventDefault(); if (pending) return;
        const values = { ...original, ...uploads, enabled: true };
        for (const name of wallet ? ['usdv', 'usdt'] : ['holder', 'identifier']) values[name] = form.elements[name].value.trim();
        if (wallet && !values.usdv && !values.usdt) { form.elements.usdv.setCustomValidity('Enter at least 1 wallet address'); form.elements.usdv.reportValidity(); return; }
        if (!wallet && (!values.holder || !values.identifier)) { const missing = !values.holder ? form.elements.holder : form.elements.identifier; missing.setCustomValidity('Specify receiving target identifier'); missing.reportValidity(); missing.addEventListener('input', () => missing.setCustomValidity(''), {once:true}); return; }
        if (options.onChange(method.label, values, original) === false) { form.querySelector('[data-rp-error]').textContent = 'Could not save. Please try again.'; return; }
        dialog.close(); render();
      });
    }
    function paymentQr() {
      open('Payment QR', '<div class="rp-dialog-body rp-view-body"><div class="rp-payment-brand"><img src="../assets/nexora-logo.svg" alt="Nexora"><strong>NEXORA</strong></div>' + options.qrMarkup(options.paymentUrl(), 232) + '<p>Customers scan to pay</p><p class="pqr-url">' + esc(options.paymentUrl()) + '</p><div class="rp-payment-actions">' + button('Copy', 'copy') + button('Download', 'download', 'is-primary') + button('Print QR', 'print') + '</div></div>');
    }
    const onClick = event => {
      const editButton = event.target.closest('[data-rp-edit]');
      const viewButton = event.target.closest('[data-rp-view]');
      const toggle = event.target.closest('[data-rp-toggle]');
      const method = methods.find(item => item.id === (editButton && editButton.dataset.rpEdit || viewButton && viewButton.dataset.rpView || toggle && toggle.dataset.rpToggle));
      if (method && editButton) edit(method);
      if (method && viewButton) view(method);
      if (method && toggle) { const previous = record(method); if (options.onChange(method.label, { ...previous, enabled: !previous.enabled }, previous) !== false) render(); }
      const action = event.target.closest('[data-rp-action]'); if (!action) return;
      if (action.dataset.rpAction === 'close') dialog.close();
      if (action.dataset.rpAction === 'copy') options.copy(options.paymentUrl());
      if (action.dataset.rpAction === 'payment-qr') paymentQr();
      if (action.dataset.rpAction === 'activity') open('Payment Activity', '<div class="rp-dialog-body"><p class="pqr-empty">No data yet</p></div>');
      if (action.dataset.rpAction === 'print') window.print();
      if (action.dataset.rpAction === 'download') {
        const canvas = dialog.querySelector('canvas');
        if (canvas) { const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = 'personal-payment-qr.png'; link.click(); }
      }
    };
    root.addEventListener('click', onClick); dialog.addEventListener('click', onClick);
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    render();
    return { render, destroy() { readers.forEach(reader => reader.abort()); readers.clear(); dialog.close(); dialog.remove(); root.removeEventListener('click', onClick); } };
  }
  window.NEXORA_RECEIVE_PAYMENT_METHODS = { mount };
})();
