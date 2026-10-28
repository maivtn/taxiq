/* Shared prototype data for Personal One QR and its public page. No payment requests. */
(function () {
  'use strict';
  const KEY = 'nexora.personal-oneqr.v1';
  const icons = ['user-round', 'instagram', 'credit-card', 'share-2', 'hand-coins', 'calendar-check', 'globe-2', 'link', 'phone', 'mail', 'qr-code', 'wallet', 'megaphone'];
  const methods = ['Zelle', 'Apple Cash', 'Venmo', 'PayPal', 'Cash App'];
  const salons = [{ id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar' }, { id: 'lux-nail-lounge', name: 'Lux Nail Lounge' }];
  const url = new URL(location.href);
  const linked = url.pathname.endsWith('/frame-staff.html') || (!url.pathname.endsWith('/frame-personal.html') && url.searchParams.get('account') === 'staff');
  const pagesBase = new URL(location.pathname.includes('/customer/') ? '../pages/' : './', location.href);
  const publicBase = new URL('../customer/oneqr-personal.html', pagesBase);
  publicBase.searchParams.set('id', 'personal-demo');
  function page(tab = 'one-qr') {
    const target = new URL('oneqr-personal.html', pagesBase);
    target.searchParams.set('account', linked ? 'staff' : 'personal'); target.searchParams.set('tab', tab); return target.href;
  }
  function publicUrl(view) { const target = new URL(publicBase); if (view) target.searchParams.set('view', view); return target.href; }
  function template(isLinked) {
    return isLinked ? [
      { id: 'tip', name: 'Gửi tip cho tôi', url: publicUrl('tip') + '&salon=' + salons[0].id, icon: 'hand-coins', enabled: true, kind: 'tip' },
      { id: 'booking', name: 'Đặt lịch với tôi tại tiệm', url: new URL('../customer/booking.html', pagesBase).href, icon: 'calendar-check', enabled: true, kind: 'booking' },
      { id: 'instagram', name: 'Instagram của tôi', url: 'https://www.instagram.com/', icon: 'instagram', enabled: true },
      { id: 'payment', name: 'Gửi thanh toán', url: publicUrl('payment'), icon: 'credit-card', enabled: true, kind: 'payment' }
    ] : [
      { id: 'profile', name: 'Hồ sơ cá nhân', url: publicUrl('profile'), icon: 'user-round', enabled: true },
      { id: 'instagram', name: 'Instagram của tôi', url: 'https://www.instagram.com/', icon: 'instagram', enabled: true },
      { id: 'payment', name: 'Gửi thanh toán', url: publicUrl('payment'), icon: 'credit-card', enabled: true, kind: 'payment' },
      { id: 'referral', name: 'Tham gia cùng tôi', url: 'https://vlinkpay.com/?ref=C884A316', icon: 'share-2', enabled: true, kind: 'referral' }
    ];
  }
  function defaults() {
    return { version: 1, id: 'personal-demo', name: 'NGUYỄN MINH AN — One QR', greeting: 'Xin chào, mình là An. Rất vui được kết nối với bạn!',
      profile: { name: 'Nguyễn Minh An', bio: '', phone: '', email: '', showPhone: false, showEmail: false, avatar: '' },
      links: template(linked), salonId: linked ? salons[0].id : null, payments: {}, referral: 'https://vlinkpay.com/?ref=C884A316', ads: false, consent: false, leads: [] };
  }
  function read() {
    const initial = defaults();
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (data && data.version === 1) {
        const result = { ...initial, ...data, profile: { ...initial.profile, ...data.profile } };
        result.links = Array.isArray(data.links) ? data.links.filter(item => item && typeof item.name === 'string' && typeof item.url === 'string').map(item => ({ ...item, icon: icons.includes(item.icon) ? item.icon : 'link' })) : initial.links;
        result.leads = Array.isArray(data.leads) ? data.leads : [];
        result.payments = data.payments && typeof data.payments === 'object' ? data.payments : {};
        return result;
      }
      localStorage.setItem(KEY, JSON.stringify(initial));
    } catch (_) { /* In-memory demo remains usable when storage is unavailable. */ }
    return initial;
  }
  function save(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
  function validUrl(value) { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch (_) { return false; } }
  function hasPayment(state) { return methods.some(method => state.payments[method] && state.payments[method].trim()); }
  function visibleLinks(state, isLinked = Boolean(state.salonId)) {
    return state.links.filter(item => item.enabled && item.name.trim() && validUrl(item.url) && (item.kind !== 'payment' || hasPayment(state)) && (!['tip', 'booking'].includes(item.kind) || isLinked));
  }
  function validate(state) {
    if (!state.name.trim()) return { field: 'name', message: 'Thiếu tên One QR.' };
    if (!state.profile.name.trim()) return { field: 'profile', message: 'Thiếu tên hiển thị.' };
    const index = state.links.findIndex(item => !item.name.trim() || !validUrl(item.url));
    return index < 0 ? null : { field: 'link', index, message: 'Thiếu tên hoặc URL không hợp lệ.' };
  }
  function vcard(state) {
    const value = text => String(text || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, match => '\\' + match);
    return ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + value(state.profile.name),
      state.profile.showPhone && state.profile.phone ? 'TEL:' + value(state.profile.phone) : '',
      state.profile.showEmail && state.profile.email ? 'EMAIL:' + value(state.profile.email) : '',
      state.profile.bio ? 'NOTE:' + value(state.profile.bio) : '', 'URL:' + publicUrl(), 'END:VCARD'].filter(Boolean).join('\r\n');
  }
  window.NEXORA_PERSONAL_QR = { KEY, linked, icons, methods, salons, page, publicUrl, template, read, save, validUrl, hasPayment, visibleLinks, validate, vcard };
})();
