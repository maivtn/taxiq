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
  const iconPath = icon => '../assets/icon-oneqr/issue-2040-oneqr-' + (api.icons.includes(icon) ? icon : 'link') + '-3d.png';
  const image = (icon, cls = '') => '<img class="' + cls + '" src="' + iconPath(icon) + '" alt="">';
  const lucide = name => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const button = (label, action, primary = false, icon = '') => '<button class="pqr-button' + (primary ? ' is-primary' : '') + '" type="button" data-pqr-action="' + action + '">' + (icon ? lucide(icon) : '') + label + '</button>';
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const tabs = [{ id: 'one-qr', label: 'One QR', icon: 'scan-line' }, { id: 'advertising', label: 'Quảng cáo', icon: 'megaphone' }, { id: 'tip-qr', label: 'Tip QR', icon: 'hand-coins' }, { id: 'accept-payment', label: 'Accept Payment', icon: 'credit-card' }, { id: 'referral-link', label: 'Referral Link', icon: 'share-2' }];
  const aliases = { 'my-qr': 'tip-qr', 'qr-stations': 'tip-qr', 'payout-methods': 'accept-payment', ads: 'advertising' };
  let current = 'one-qr';
  let advertisingElement = null;
  let advertisingController = null;
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
    catch (_) { feedback('Không thể lưu. Vui lòng thử lại.', true); return false; }
  }
  function openDialog(title, content) {
    dialog.innerHTML = '<div class="pqr-dialog-head"><h2 id="pqr-dialog-title">' + esc(title) + '</h2><button type="button" class="pqr-icon-button" data-pqr-action="close" aria-label="Đóng">' + lucide('x') + '</button></div><div class="pqr-dialog-body">' + content + '</div>';
    if (!dialog.open) dialog.showModal(); icons(); drawQR(dialog);
  }
  function qrMarkup(value, size = 112) { return '<div class="pqr-qr-code" role="img" aria-label="Mã QR cá nhân" data-pqr-qr="' + esc(value) + '" data-size="' + size + '"></div>'; }
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
    const contactButtons = [button('Lưu liên hệ', 'vcard', false, 'contact-round'), button('Thêm vào ví', 'wallet', false, 'wallet-cards'), button('Gửi liên hệ', 'exchange', false, 'user-plus'), button('Chia sẻ', 'share', false, 'share-2')];
    if (profile.showPhone && profile.phone.trim()) contactButtons.push(button('Gọi', 'call', false, 'phone'), button('Nhắn tin', 'text', false, 'message-square'));
    return '<article class="pqr-phone"><header class="pqr-phone-hero"><div class="pqr-avatar">' + (profile.avatar ? '<img src="' + esc(profile.avatar) + '" alt="' + esc(profile.name) + '">' : image('user-round', 'pqr-default-avatar')) + '</div><h2>' + esc(profile.name) + '</h2><p data-public-greeting>' + esc(state.greeting) + '</p></header><div class="pqr-phone-body">' +
      '<div class="pqr-quick-actions">' + contactButtons.join('') + '</div>' +
      (links.length ? '<h3>Các liên kết của tôi</h3><div class="pqr-public-links">' + links.map(link => '<button class="pqr-public-link" type="button" data-pqr-link="' + esc(link.id) + '">' + image(link.icon) + '<span>' + esc(link.name) + '</span>' + lucide('arrow-up-right') + '</button>').join('') + '</div>' : '') +
      (profile.bio.trim() ? '<section class="pqr-about"><h3>Đôi nét về tôi</h3><p>' + esc(profile.bio) + '</p></section>' : '') +
      (profile.showEmail && profile.email.trim() ? '<p class="pqr-muted" data-public-email>' + esc(profile.email) + '</p>' : '') +
      (profile.showPhone && profile.phone.trim() ? '<p class="pqr-muted" data-public-phone>' + esc(profile.phone) + '</p>' : '') +
      (state.ads ? '<section class="pqr-sponsored" aria-label="Nội dung tài trợ"><small>Được tài trợ · Dữ liệu minh hoạ</small><p>Nội dung tài trợ mẫu</p></section>' : '') +
      button('Thêm vào màn hình chính', 'home', false, 'circle-plus').replace('pqr-button', 'pqr-button pqr-home') +
      '<p class="pqr-feedback" data-pqr-feedback role="status" aria-live="polite"></p></div><footer class="pqr-phone-footer">Nexora · One QR</footer></article>';
  }
  function refreshPreview() {
    document.querySelectorAll('[data-pqr-phone]').forEach(node => { node.innerHTML = phone(); });
    const title = document.querySelector('[data-pqr-card-name]'); if (title) title.textContent = state.name;
    icons();
  }
  function stats(values) { return '<div class="pqr-activity">' + ['Lượt quét QR', 'Lượt bấm liên kết', 'Lượt lưu liên hệ'].map((label, index) => '<div class="pqr-stat"><span>' + label + '</span><strong>' + values[index] + '</strong></div>').join('') + '</div>'; }
  function buildMain() {
    return '<section class="pqr-section">' +
      '<section class="pqr-card"><div class="pqr-card-head"><h2>Hoạt động hôm nay</h2><span class="pqr-demo">Dữ liệu minh hoạ</span></div>' + stats([284, 163, 56]) + '</section>' +
      '<section class="pqr-card pqr-qr-card">' + qrMarkup(api.publicUrl()) + '<div class="pqr-qr-detail"><h2 data-pqr-card-name>' + esc(state.name) + '</h2><a class="pqr-url" href="' + esc(api.publicUrl()) + '" target="_blank" rel="noopener">' + esc(api.publicUrl()) + '</a><div class="pqr-actions">' + button('Xem QR', 'qr', true, 'eye') + button('Sao chép URL', 'copy', false, 'copy') + button('Xem bản in', 'print', false, 'printer') + '</div></div></section>' +
      '<div class="pqr-builder"><section class="pqr-card"><div class="pqr-card-head"><h2>Nội dung hiển thị</h2>' + button('Danh thiếp cá nhân', 'profile', false, 'contact-round') + '</div><form class="pqr-add-link" data-pqr-add-form><input class="pqr-input" name="url" aria-label="URL" placeholder="URL" required><button class="pqr-button" type="submit">Thêm</button></form><div class="pqr-link-list" data-pqr-links></div><div class="pqr-actions">' + button('Thêm nội dung', 'add', false, 'plus') + button('Khôi phục mẫu', 'reset', false, 'rotate-ccw') + '</div></section>' +
      '<section class="pqr-card"><div class="pqr-card-head"><h2>Cấu hình</h2></div><label class="pqr-field">Tên One QR<input data-pqr-name maxlength="100" value="' + esc(state.name) + '" required></label><label class="pqr-field">Lời chào<textarea data-pqr-greeting maxlength="300" rows="3">' + esc(state.greeting) + '</textarea></label>' + button('Lưu thay đổi', 'save', true, 'save').replace('pqr-button', 'pqr-button pqr-save') + '<p class="pqr-feedback" data-pqr-feedback role="status" aria-live="polite"></p></section>' +
      '<section class="pqr-card"><div class="pqr-card-head"><h2>Xem trước</h2><a class="pqr-button" href="' + esc(api.publicUrl()) + '" target="_blank" rel="noopener">' + lucide('external-link') + 'Trang công khai</a></div><div data-pqr-phone>' + phone() + '</div></section></div>' +
      '<section class="pqr-card"><div class="pqr-card-head"><h2>Thông tin dùng chung</h2>' + button('Danh thiếp cá nhân', 'profile') + '</div><div class="pqr-output-grid">' + [['qr-code', 'Trang QR'], ['user-round', 'vCard'], ['wallet', 'Thẻ trong ví điện thoại'], ['phone', 'Thông tin liên hệ']].map(([icon, label]) => '<div class="pqr-output">' + image(icon) + '<span>' + label + '</span></div>').join('') + '</div></section>' +
      '<section class="pqr-card"><div class="pqr-card-head"><div><h2>Hiệu quả One QR</h2><p class="pqr-muted">30 ngày</p></div><span class="pqr-demo">Dữ liệu minh hoạ</span></div>' + stats([315, 163, 56]) + '<div data-pqr-distribution></div></section>' +
      '<section class="pqr-card"><div class="pqr-card-head"><h2>Liên hệ nhận được</h2><span class="pqr-demo" data-pqr-lead-count>' + state.leads.length + '</span></div><div data-pqr-leads></div></section></section>';
  }
  function renderLinks() {
    const list = document.querySelector('[data-pqr-links]'); if (!list) return;
    list.innerHTML = state.links.length ? state.links.map((link, index) => '<div class="pqr-link-row" data-link-index="' + index + '"><div class="pqr-link-head"><button type="button" class="pqr-icon-button" data-pqr-action="icon" data-index="' + index + '" aria-label="Đổi biểu tượng">' + image(link.icon) + '</button><input class="pqr-input pqr-link-title" aria-label="Tên nội dung" data-link-field="name" maxlength="100" value="' + esc(link.name) + '"><input class="pqr-toggle" type="checkbox" aria-label="Hiển thị ' + esc(link.name) + '" data-link-field="enabled"' + (link.enabled ? ' checked' : '') + '></div><input class="pqr-input" aria-label="URL" data-link-field="url" maxlength="500" value="' + esc(link.url) + '"><div class="pqr-link-tools"><span class="pqr-muted">' + (link.kind === 'payment' && !api.hasPayment(state) ? 'Chưa cấu hình nhận thanh toán' : ['tip', 'booking'].includes(link.kind) && !api.linked ? 'Chưa liên kết tiệm' : '') + '</span>' +
      '<button class="pqr-icon-button" type="button" data-pqr-action="up" data-index="' + index + '" aria-label="Đổi thứ tự: lên"' + (!index ? ' disabled' : '') + '>' + lucide('arrow-up') + '</button><button class="pqr-icon-button" type="button" data-pqr-action="down" data-index="' + index + '" aria-label="Đổi thứ tự: xuống"' + (index === state.links.length - 1 ? ' disabled' : '') + '>' + lucide('arrow-down') + '</button><button class="pqr-icon-button" type="button" data-pqr-action="remove" data-index="' + index + '" aria-label="Xoá nội dung">' + lucide('trash-2') + '</button></div></div>').join('') : '<p class="pqr-muted">Chưa thêm liên kết. Thêm nội dung.</p>';
    const distribution = document.querySelector('[data-pqr-distribution]');
    if (distribution) distribution.innerHTML = api.visibleLinks(state, api.linked).map((link, index) => '<div class="pqr-performance-row"><span>' + esc(link.name) + '</span><div class="pqr-bar"><span style="width:' + Math.max(12, 80 - index * 19) + '%"></span></div><span>' + Math.max(12, 80 - index * 19) + '</span></div>').join('');
    icons();
  }
  function renderLeads() {
    const list = document.querySelector('[data-pqr-leads]'); if (!list) return;
    list.innerHTML = state.leads.length ? state.leads.map(lead => '<div class="pqr-method"><div><h3>' + esc(lead.name) + '</h3><p class="pqr-muted">' + esc([lead.phone, lead.email].filter(Boolean).join(' · ')) + '</p></div><span class="pqr-muted">' + new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</span></div>').join('') : '<div class="pqr-empty">Chưa có dữ liệu</div>';
    document.querySelector('[data-pqr-lead-count]').textContent = state.leads.length;
  }
  function tipPanel() {
    if (!api.linked) return '<section class="pqr-card"><div class="pqr-empty">' + image('hand-coins') + '<h2>Chưa liên kết tiệm</h2><p>Tip QR chưa có QR hợp lệ. Liên kết tiệm hoặc chờ xác nhận.</p></div><div class="pqr-actions">' + button('Thử lại', 'retry') + '<a class="pqr-button" href="' + esc(api.page()) + '">One QR</a></div></section>';
    const salon = api.salons.find(item => item.id === state.salonId) || api.salons[0];
    const target = new URL(api.publicUrl('tip')); target.searchParams.set('salon', salon.id);
    return '<div class="pqr-two-col"><section class="pqr-card"><div class="pqr-card-head"><h2>Tip QR</h2><span class="pqr-demo">Dữ liệu minh hoạ</span></div><label class="pqr-field">My Salons<select data-pqr-salon>' + api.salons.map(item => '<option value="' + item.id + '"' + (item.id === salon.id ? ' selected' : '') + '>' + item.name + '</option>').join('') + '</select></label><div class="pqr-qr-card">' + qrMarkup(target.href) + '<div class="pqr-qr-detail"><h2>' + esc(state.profile.name) + '</h2><p>' + esc(salon.name) + '</p><span class="pqr-status">Đã liên kết tiệm</span></div></div><div class="pqr-actions">' + button('Xem QR', 'tip-view', true, 'eye') + button('Sao chép URL', 'tip-copy', false, 'copy') + '</div></section><section class="pqr-card"><h2>QR nhận tip</h2><p class="pqr-muted">Dùng lại QR nhận tip của cá nhân theo tiệm hợp lệ.</p><p class="pqr-muted">Prototype dùng dữ liệu mẫu; không thực hiện thanh toán, gửi tip hoặc thay đổi số dư.</p></section></div>';
  }
  function paymentPanel() {
    return '<div class="pqr-two-col"><section class="pqr-card"><div class="pqr-card-head"><h2>Accept Payment</h2><span class="pqr-demo">Dữ liệu minh hoạ</span></div>' + (api.hasPayment(state) ? '<div class="pqr-qr-card">' + qrMarkup(api.publicUrl('payment')) + '<div class="pqr-qr-detail"><h2>' + esc(state.profile.name) + '</h2><p>QR nhận thanh toán cá nhân</p></div></div><div class="pqr-actions">' + button('Xem QR', 'payment-view', true, 'eye') + button('Sao chép URL', 'payment-copy', false, 'copy') + '</div>' : '<div class="pqr-empty">' + image('credit-card') + '<h2>Chưa cấu hình nhận thanh toán</h2><p>Bổ sung phương thức nhận tiền.</p></div>') + '</section><section class="pqr-card"><div class="pqr-card-head"><h2>Phương thức nhận tiền</h2></div>' + api.methods.map(method => '<div class="pqr-method"><div><h3>' + method + '</h3><p class="pqr-muted">' + esc(state.payments[method] || 'Chưa cấu hình') + '</p></div><button class="pqr-button" type="button" data-pqr-method="' + method + '">Chỉnh sửa</button></div>').join('') + '</section></div>';
  }
  function referralPanel() {
    return '<section class="pqr-card"><div class="pqr-card-head"><h2>Referral Link</h2><span class="pqr-demo">Dữ liệu minh hoạ</span></div>' + (state.referral ? '<div class="pqr-qr-card">' + qrMarkup(state.referral) + '<div class="pqr-qr-detail"><h2>Liên kết giới thiệu</h2><p class="pqr-url">' + esc(state.referral) + '</p><div class="pqr-actions">' + button('Sao chép URL', 'referral-copy', true, 'copy') + button('Thêm vào One QR', 'referral-add', false, 'plus') + '</div></div></div>' : '<div class="pqr-empty">Chưa có liên kết giới thiệu</div>' + button('Thử lại', 'retry')) + '</section>';
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
      onActivationChange({ activated, adsEnabled }) {
        const previous = { ads: state.ads, consent: state.consent };
        state.ads = adsEnabled; state.consent = activated;
        if (!persist(undefined, ['ads', 'consent'])) { Object.assign(state, previous); return false; }
        refreshPreview(); return true;
      }
    });
  }
  function navigate(tab, updateURL = true) {
    if (advertisingController) advertisingController.close();
    tab = aliases[tab] || tab; current = tabs.some(item => item.id === tab) ? tab : 'one-qr';
    if (updateURL) { const target = new URL(location.href); target.searchParams.delete('view'); target.searchParams.set('tab', current); history.pushState({}, '', target); }
    host.innerHTML = '<div class="pqr-heading"><div><h1>One QR của tôi</h1><p>Một mã QR để chia sẻ thông tin và các liên kết của bạn.</p></div><span class="pqr-demo">Personal · ' + (api.linked ? 'Đã liên kết tiệm' : 'Chưa liên kết tiệm') + '</span></div>' +
      '<nav class="qr-tabs pqr-tabs" role="tablist" aria-label="One QR">' + tabs.map(item => '<button class="qr-tab' + (item.id === current ? ' is-active' : '') + '" id="pqr-tab-' + item.id + '" type="button" role="tab" aria-selected="' + (item.id === current) + '" aria-controls="pqr-panel" data-pqr-tab="' + item.id + '"><span class="qr-tab-icon">' + lucide(item.icon) + '</span><span>' + item.label + '</span></button>').join('') + '</nav><div id="pqr-panel" role="tabpanel" aria-labelledby="pqr-tab-' + current + '">' + ({ 'one-qr': buildMain, 'tip-qr': tipPanel, 'accept-payment': paymentPanel, 'referral-link': referralPanel, advertising: adPanel }[current])() + '</div><p class="pqr-feedback" data-pqr-feedback role="status" aria-live="polite"></p>';
    if (current === 'one-qr') { renderLinks(); renderLeads(); }
    if (current === 'advertising') mountAdvertising();
    if (window.NEXORA_SHELL && window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(current);
    icons(); drawQR(host);
  }
  api.navigate = navigate;
  function editProfile() {
    const profile = clone(state.profile);
    openDialog('Danh thiếp cá nhân', '<form data-pqr-profile-form><div class="pqr-dialog-fields"><label class="pqr-field full">Tên hiển thị<input name="name" value="' + esc(profile.name) + '" maxlength="100" required></label><label class="pqr-field full">Đôi nét về tôi<textarea name="bio" maxlength="500">' + esc(profile.bio) + '</textarea></label><label class="pqr-field">Số điện thoại<input name="phone" type="tel" value="' + esc(profile.phone) + '"></label><label class="pqr-field">Email<input name="email" type="email" value="' + esc(profile.email) + '"></label><label class="pqr-field full">Ảnh đại diện<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"></label></div><fieldset class="pqr-terms"><legend>Thông tin muốn công khai</legend><label class="pqr-consent"><input name="showPhone" type="checkbox"' + (profile.showPhone ? ' checked' : '') + '>Số điện thoại</label><label class="pqr-consent"><input name="showEmail" type="checkbox"' + (profile.showEmail ? ' checked' : '') + '>Email</label></fieldset><p class="pqr-feedback" data-pqr-profile-error role="alert"></p><div class="pqr-actions"><button class="pqr-button is-primary" type="submit">Lưu thay đổi</button>' + button('Huỷ', 'close') + '</div></form>');
    const form = dialog.querySelector('form');
    let avatar = profile.avatar;
    form.elements.avatar.addEventListener('change', () => {
      const file = form.elements.avatar.files[0]; if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return;
      const reader = new FileReader(); reader.onload = () => { avatar = reader.result; }; reader.readAsDataURL(file);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.elements.name.value.trim()) { dialog.querySelector('[data-pqr-profile-error]').textContent = 'Thiếu tên hiển thị.'; return; }
      const prior = state.profile;
      const values = { name: form.elements.name.value.trim(), bio: form.elements.bio.value.trim(), phone: form.elements.phone.value.trim(), email: form.elements.email.value.trim(), showPhone: form.elements.showPhone.checked, showEmail: form.elements.showEmail.checked, avatar };
      state.profile = { ...api.read().profile };
      Object.keys(values).forEach(key => { if (!same(values[key], profile[key])) state.profile[key] = values[key]; });
      if (!persist(undefined, ['profile'])) { state.profile = prior; dialog.querySelector('[data-pqr-profile-error]').textContent = 'Không thể lưu. Vui lòng thử lại.'; return; }
      dialog.close(); refreshPreview();
      document.querySelectorAll('.staff-profile-name').forEach(node => { node.textContent = state.profile.name; });
      feedback('Đã lưu thay đổi.');
    });
  }
  function addLink(value = '') {
    openDialog('Thêm nội dung', '<form data-pqr-new-link><label class="pqr-field">Tên nội dung<input name="name" maxlength="100" required></label><label class="pqr-field">URL<input name="url" value="' + esc(value) + '" maxlength="500" required></label><p class="pqr-feedback" data-pqr-link-error role="alert"></p><button type="submit" class="pqr-button is-primary">Thêm nội dung</button></form>');
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault(); const form = event.currentTarget;
      if (!form.elements.name.value.trim() || !api.validUrl(form.elements.url.value.trim())) { dialog.querySelector('[data-pqr-link-error]').textContent = 'Thiếu tên hoặc URL không hợp lệ.'; return; }
      state.links.push({ id: 'link-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), name: form.elements.name.value.trim(), url: form.elements.url.value.trim(), icon: 'link', enabled: true });
      dialog.close(); document.querySelector('[data-pqr-add-form]').reset(); renderLinks(); refreshPreview(); feedback('Lưu thay đổi để giữ nội dung đang chỉnh.');
    });
  }
  function saveDraft() {
    const error = api.validate(state);
    if (error) {
      if (current !== 'one-qr') navigate('one-qr');
      const field = error.field === 'name' ? host.querySelector('[data-pqr-name]') : error.field === 'link' ? host.querySelectorAll('[data-link-index]')[error.index].querySelector('[data-link-field="' + (!state.links[error.index].name.trim() ? 'name' : 'url') + '"]') : null;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); } else editProfile();
      feedback(error.message, true); return;
    }
    persist('Đã lưu thay đổi.');
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
    feedback(copied ? 'Đã sao chép URL.' : 'Không thể sao chép URL.');
    if (!copied) openDialog('Sao chép URL', '<label class="pqr-field">URL<input value="' + esc(value) + '" readonly></label>');
  }
  function showQr(value, print = false) {
    openDialog(print ? 'Xem bản in' : 'Xem QR', '<div style="text-align:center"><h2>' + esc(state.name) + '</h2>' + qrMarkup(value, 216) + '<p class="pqr-url">' + esc(value) + '</p><span class="pqr-demo">Dữ liệu minh hoạ</span></div><div class="pqr-actions">' + (print ? button('Print', 'browser-print', true, 'printer') : '<a class="pqr-button is-primary" href="' + esc(value) + '" target="_blank" rel="noopener">Trang công khai</a>') + '</div>');
  }
  function tipUrl() {
    const target = new URL(api.publicUrl('tip')); target.searchParams.set('salon', state.salonId); return target.href;
  }
  function exchangeContact() {
    openDialog('Gửi liên hệ', '<form data-pqr-exchange-form><label class="pqr-field">Tên hiển thị<input name="name" maxlength="100" required></label><label class="pqr-field">Số điện thoại<input type="tel" name="phone" maxlength="50"></label><label class="pqr-field">Email<input type="email" name="email" maxlength="150"></label><p class="pqr-muted">Prototype dùng dữ liệu mẫu và phản hồi trong bản xem trước.</p><p class="pqr-feedback" data-pqr-exchange-error role="alert"></p><button class="pqr-button is-primary" type="submit">Gửi liên hệ</button></form>');
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault(); const form = event.currentTarget;
      if (!form.elements.name.value.trim() || (!form.elements.phone.value.trim() && !form.elements.email.value.trim())) { dialog.querySelector('[data-pqr-exchange-error]').textContent = 'Bổ sung thông tin liên hệ.'; return; }
      const lead = { id: Date.now().toString(), name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(), email: form.elements.email.value.trim(), createdAt: new Date().toISOString() };
      // Public actions read the last saved owner state, preserving a newer edit from another tab.
      const saved = api.read(); saved.leads.unshift(lead);
      try { api.save(saved); state.leads = saved.leads; }
      catch (_) { dialog.querySelector('[data-pqr-exchange-error]').textContent = 'Không thể lưu. Vui lòng thử lại.'; return; }
      dialog.close(); renderLeads(); feedback('Đã gửi liên hệ.');
    });
  }
  function editMethod(method) {
    const originalValue = state.payments[method] || '';
    openDialog('Phương thức nhận tiền · ' + method, '<form data-pqr-payment-form><label class="pqr-field">' + method + '<input name="identifier" maxlength="200" value="' + esc(state.payments[method] || '') + '"></label><p class="pqr-muted">Prototype dùng dữ liệu mẫu; không thực hiện thanh toán.</p><p class="pqr-feedback" data-pqr-payment-error role="alert"></p><button class="pqr-button is-primary" type="submit">Lưu thay đổi</button></form>');
    dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); const previous = state.payments[method]; const value = event.currentTarget.elements.identifier.value.trim(); state.payments[method] = value === originalValue ? api.read().payments[method] || '' : value; if (!persist(undefined, ['payments'])) { state.payments[method] = previous; dialog.querySelector('[data-pqr-payment-error]').textContent = 'Không thể lưu. Vui lòng thử lại.'; return; } dialog.close(); navigate('accept-payment', false); feedback('Đã lưu thay đổi.'); });
  }
  document.addEventListener('click', async event => {
    const tab = event.target.closest('[data-pqr-tab]'); if (tab && host) { navigate(tab.dataset.pqrTab); return; }
    const link = event.target.closest('[data-pqr-link]');
    if (link) {
      const item = api.visibleLinks(state, host ? api.linked : Boolean(state.salonId)).find(row => row.id === link.dataset.pqrLink);
      if (item) openDialog(item.name, '<p class="pqr-url">' + esc(item.url) + '</p><p class="pqr-muted">Prototype dùng dữ liệu mẫu và phản hồi trong bản xem trước; không thực hiện thanh toán, gửi tip hoặc thay đổi số dư.</p>');
      return;
    }
    const method = event.target.closest('[data-pqr-method]'); if (method) { editMethod(method.dataset.pqrMethod); return; }
    const choice = event.target.closest('[data-pqr-icon]'); if (choice) { const row = state.links[Number(choice.dataset.index)]; if (row && api.icons.includes(choice.dataset.pqrIcon)) row.icon = choice.dataset.pqrIcon; dialog.close(); renderLinks(); refreshPreview(); return; }
    const control = event.target.closest('[data-pqr-action]'); if (!control) return;
    const action = control.dataset.pqrAction, index = Number(control.dataset.index);
    if (action === 'close') dialog.close();
    else if (action === 'profile') editProfile();
    else if (action === 'save') saveDraft();
    else if (action === 'add') addLink();
    else if (action === 'reset') { state.links = api.template(api.linked); renderLinks(); refreshPreview(); feedback('Lưu thay đổi để giữ nội dung đang chỉnh.'); }
    else if (action === 'remove') { state.links.splice(index, 1); renderLinks(); refreshPreview(); }
    else if (action === 'up' || action === 'down') { const target = index + (action === 'up' ? -1 : 1); if (target >= 0 && target < state.links.length) { [state.links[index], state.links[target]] = [state.links[target], state.links[index]]; renderLinks(); refreshPreview(); } }
    else if (action === 'icon') openDialog('Đổi biểu tượng', '<div class="pqr-icon-grid">' + api.icons.map(icon => '<button class="pqr-icon-choice" type="button" data-pqr-icon="' + icon + '" data-index="' + index + '" aria-label="' + icon + '">' + image(icon) + '</button>').join('') + '</div>');
    else if (action === 'qr' || action === 'print') showQr(api.publicUrl(), action === 'print');
    else if (action === 'copy' || action === 'share') await copy(api.publicUrl());
    else if (action === 'browser-print') window.print();
    else if (action === 'tip-view' && api.linked) showQr(tipUrl());
    else if (action === 'tip-copy' && api.linked) await copy(tipUrl());
    else if (action === 'payment-view' && api.hasPayment(state)) showQr(api.publicUrl('payment'));
    else if (action === 'payment-copy' && api.hasPayment(state)) await copy(api.publicUrl('payment'));
    else if (action === 'referral-copy' && state.referral) await copy(state.referral);
    else if (action === 'referral-add' && state.referral) { if (!state.links.some(item => item.kind === 'referral')) state.links.push({ id: 'referral', name: 'Tham gia cùng tôi', url: state.referral, icon: 'share-2', kind: 'referral', enabled: true }); navigate('one-qr'); feedback('Lưu thay đổi để giữ nội dung đang chỉnh.'); }
    else if (action === 'preview') openDialog('Xem trước', '<div data-pqr-phone>' + phone() + '</div>');
    else if (action === 'retry') { if (current === 'referral-link') { state.referral = api.read().referral; } navigate(current, false); feedback(current === 'tip-qr' ? 'Chưa có liên kết tiệm hợp lệ.' : 'Chưa có dữ liệu'); }
    else if (action === 'exchange') exchangeContact();
    else if (action === 'vcard') {
      const blob = new Blob([api.vcard(state)], { type: 'text/vcard;charset=utf-8' }); const value = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = value; anchor.download = 'oneqr-personal.vcf'; anchor.click(); setTimeout(() => URL.revokeObjectURL(value), 1000); feedback('Đã tải vCard.');
    } else if (action === 'wallet' || action === 'home' || action === 'call' || action === 'text') {
      openDialog(control.textContent.trim(), '<p class="pqr-muted">Prototype dùng dữ liệu mẫu và phản hồi trong bản xem trước.</p>' + (['call', 'text'].includes(action) && state.profile.showPhone ? '<p>' + esc(state.profile.phone) + '</p>' : ''));
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
      if (event.target.matches('[data-pqr-salon]') && api.linked && api.salons.some(item => item.id === event.target.value)) { state.salonId = event.target.value; persist(undefined, ['salonId']); navigate('tip-qr', false); }
    });
    host.addEventListener('submit', event => { if (event.target.matches('[data-pqr-add-form]')) { event.preventDefault(); const input = event.target.elements.url; if (!api.validUrl(input.value.trim())) { input.setAttribute('aria-invalid', 'true'); feedback('URL không hợp lệ.', true); return; } addLink(input.value.trim()); } });
    host.addEventListener('keydown', event => {
      const tab = event.target.closest('[data-pqr-tab]'); if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const index = tabs.findIndex(item => item.id === current); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      navigate(tabs[next].id); host.querySelector('[data-pqr-tab="' + tabs[next].id + '"]').focus();
    });
    window.addEventListener('popstate', () => { navigate(new URL(location.href).searchParams.get('tab'), false); });
    const frameView = params.get('view');
    if (frameView && ['dashboard', 'community', 'profile'].includes(frameView)) {
      host.innerHTML = '<div class="pqr-heading"><h1>' + ({ dashboard: 'Dashboard', community: 'Community', profile: 'Profile' }[frameView]) + '</h1><span class="pqr-demo">Personal</span></div><section class="pqr-card"><div class="pqr-card-head"><h2>One QR</h2><a class="pqr-button is-primary" href="' + esc(api.page()) + '">One QR</a></div><p class="pqr-muted">Hiển thị theo quyền hiện có</p>' + (frameView === 'profile' ? button('Danh thiếp cá nhân', 'profile') : '') + '</section>';
      window.NEXORA_SHELL.activeTab = frameView;
      if (window.NEXORA_SHELL.setActiveTab) window.NEXORA_SHELL.setActiveTab(frameView);
      if (frameView === 'community') window.NEXORA_SHELL.isCommunity = true;
    } else navigate(params.get('tab') || 'one-qr', false);
  } else {
    const view = params.get('view');
    if (view === 'payment' || view === 'tip') {
      const hasTip = Boolean(state.salonId) && api.salons.some(item => item.id === params.get('salon'));
      const available = view === 'payment' ? api.hasPayment(state) : hasTip;
      publicHost.innerHTML = '<section class="pqr-card"><div class="pqr-card-head"><h1>' + (view === 'payment' ? 'Accept Payment' : 'Tip QR') + '</h1><span class="pqr-demo">Dữ liệu minh hoạ</span></div><h2>' + esc(state.profile.name) + '</h2>' + (available ? (view === 'payment' ? api.methods.filter(method => state.payments[method]).map(method => '<div class="pqr-method">' + method + '</div>').join('') : '<p>' + esc(api.salons.find(item => item.id === params.get('salon')).name) + '</p>') : '<p class="pqr-muted">' + (view === 'payment' ? 'Chưa cấu hình nhận thanh toán' : 'Chưa có QR hợp lệ') + '</p>') + '<p class="pqr-muted">Prototype dùng dữ liệu mẫu; không thực hiện thanh toán, gửi tip hoặc thay đổi số dư.</p><a class="pqr-button" href="' + esc(api.publicUrl()) + '">Trang cá nhân</a></section>';
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
    }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  icons(); drawQR();
})();
