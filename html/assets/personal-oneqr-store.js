/* Shared prototype data for Personal One QR and its public page. No payment requests. */
(function () {
  'use strict';
  const KEY = 'nexora.personal-oneqr.v1';
  const icons = window.ONEQR_ACTION_APPEARANCE ? window.ONEQR_ACTION_APPEARANCE.icons : ['user-round', 'instagram', 'credit-card', 'share-2', 'hand-coins', 'calendar-check', 'globe-2', 'link', 'phone', 'mail', 'qr-code', 'wallet', 'megaphone'];
  const isIconImage = value => /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value || '');
  const legacyLabels = { 'Gửi tip cho tôi': 'Send me a tip', 'Đặt lịch với tôi tại tiệm': 'Book an appointment with me', 'Instagram của tôi': 'My Instagram', 'Gửi thanh toán': 'Send a payment', 'Hồ sơ cá nhân': 'Personal profile', 'Tham gia cùng tôi': 'Join me' };
  const methodConfig = [
    { id: 'zelle', label: 'Zelle', image: 'zelle.png', placeholder: 'Enter Zelle email or phone...' },
    { id: 'cashapp', label: 'Cash App', image: 'cash_app.png', placeholder: 'Enter Cash App $cashtag, email, or phone...' },
    { id: 'venmo', label: 'Venmo', image: 'venmo.png', placeholder: 'Enter Venmo @username...' },
    { id: 'vlinkpay', label: 'VLINKPAY Wallet', image: 'vlinkpay.png' },
    { id: 'applecash', label: 'Apple Cash', image: 'apple_cash.png', placeholder: 'Enter Apple Cash email or phone...' },
    { id: 'paypal', label: 'PayPal', image: 'paypal.png', placeholder: 'email@paypal.com' }
  ];
  const methods = methodConfig.map(method => method.label);
  function payment(state, method) {
    const value = state.payments && state.payments[method];
    const previous = typeof value === 'string' ? { enabled: Boolean(value.trim()), identifier: value } : value || {};
    return { enabled: false, holder: '', identifier: '', qr: '', usdv: '', usdt: '', qrusdv: '', qrusdt: '', ...previous };
  }
  function configuredPayment(state, method) {
    const item = payment(state, method);
    return method === 'VLINKPAY Wallet' ? Boolean(item.usdv.trim() || item.usdt.trim()) : Boolean(item.identifier.trim());
  }
  function enabledPayments(state) { return methods.filter(method => payment(state, method).enabled && configuredPayment(state, method)); }
  // Existing Receive Tips QR targets from staff-app.html, kept verbatim.
  const salons = [
    { id: 'bitcoin-nail-bar', name: 'Bitcoin Nail Bar', tipUrl: 'https://pay.nexoratouch.com/salon/bitcoin-nail-bar' },
    { id: 'lux-nail-lounge', name: 'Lux Nail Lounge', tipUrl: 'https://pay.nexoratouch.com/salon/lux-nail-lounge/staff/david-le918747' },
    { id: 'rose-studio-nails', name: 'Rose Studio Nails', tipUrl: 'https://pay.nexoratouch.com/salon/rose-studio-nails/staff/david-le918747' }
  ];
  const url = new URL(location.href);
  const linked = url.pathname.endsWith('/frame-staff.html') || url.pathname.endsWith('/oneqr-staff.html') || (!url.pathname.endsWith('/frame-personal.html') && url.searchParams.get('account') === 'staff');
  const pagesBase = new URL(location.pathname.includes('/customer/') ? '../pages/' : './', location.href);
  const publicBase = new URL('../customer/oneqr-personal.html', pagesBase);
  publicBase.searchParams.set('id', 'personal-demo');
  function page(tab = 'one-qr') {
    const target = new URL(linked ? 'oneqr-staff.html' : 'oneqr-personal.html', pagesBase);
    if (!linked) target.searchParams.set('account', 'personal');
    target.searchParams.set('tab', tab); return target.href;
  }
  function publicUrl(view) { const target = new URL(publicBase); if (view) target.searchParams.set('view', view); return target.href; }
  function referralUrl(state) {
    if (!validUrl(state.referral)) return '';
    const target = new URL(state.referral);
    target.searchParams.set('leg', state.referralPlacement === 'right' ? 'right' : 'left');
    return target.href;
  }
  function moduleUrl(state, link) {
    if (link.kind !== 'referral' || !validUrl(link.url) || !validUrl(state.referral)) return link.url;
    const current = new URL(link.url), invite = new URL(state.referral);
    current.searchParams.delete('leg'); invite.searchParams.delete('leg');
    return current.href === invite.href ? referralUrl(state) : link.url;
  }
  function template(isLinked) {
    return isLinked ? [
      { id: 'tip', name: 'Send me a tip', url: salons[0].tipUrl, icon: 'hand-coins', enabled: true, kind: 'tip' },
      { id: 'booking', name: 'Book an appointment with me', url: new URL('../customer/booking.html', pagesBase).href, icon: 'calendar-check', enabled: true, kind: 'booking' },
      { id: 'instagram', name: 'My Instagram', url: 'https://www.instagram.com/', icon: 'instagram', enabled: true },
      { id: 'payment', name: 'Send a payment', url: publicUrl('payment'), icon: 'credit-card', enabled: true, kind: 'payment' }
    ] : [
      { id: 'profile', name: 'Personal profile', url: publicUrl('profile'), icon: 'user-round', enabled: true },
      { id: 'instagram', name: 'My Instagram', url: 'https://www.instagram.com/', icon: 'instagram', enabled: true },
      { id: 'payment', name: 'Send a payment', url: publicUrl('payment'), icon: 'credit-card', enabled: true, kind: 'payment' },
      { id: 'referral', name: 'Join me', url: 'https://localhost:3000/?ref=93176C31&leg=left&staff=NAIE5LMVX', icon: 'share-2', enabled: true, kind: 'referral' }
    ];
  }
  function defaults() {
    return { version: 1, id: 'personal-demo', name: 'NGUYỄN MINH AN — One QR', greeting: 'Hi, I’m An. Nice to meet you!',
      profile: { name: 'Nguyễn Minh An', bio: '', phone: '', email: '', showPhone: false, showEmail: false, avatar: '' },
      links: template(linked), salonId: linked ? salons[0].id : null, payments: {}, referral: 'https://localhost:3000/?ref=93176C31&leg=left&staff=NAIE5LMVX', referralPlacement: 'left', staffId: 'NAIE5LMVX', ads: false, consent: false, adIndustries: [], leads: [] };
  }
  function read() {
    const initial = defaults();
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (data && data.version === 1) {
        const result = { ...initial, ...data, profile: { ...initial.profile, ...data.profile } };
        result.links = Array.isArray(data.links) ? data.links.filter(item => item && typeof item.name === 'string' && typeof item.url === 'string').map(item => ({ ...item, icon: icons.includes(item.icon) || isIconImage(item.icon) ? item.icon : 'link', background: window.ONEQR_ACTION_APPEARANCE?.backgrounds.includes(item.background) ? item.background : '' })) : initial.links;
        result.adIndustries = Array.isArray(data.adIndustries) ? [...new Set(data.adIndustries.filter(item => typeof item === 'string'))] : [];
        result.referralPlacement = data.referralPlacement === 'right' ? 'right' : 'left';
        result.links.forEach(link => { if (Object.hasOwn(legacyLabels, link.name)) link.name = legacyLabels[link.name]; });
        if (result.greeting === 'Xin chào, mình là An. Rất vui được kết nối với bạn!') result.greeting = initial.greeting;
        if (['https://vlinkpay.com/?ref=C884A316', 'https://vlinkpay.com?ref=C884A316'].includes(result.referral)) {
          result.referral = initial.referral;
          result.links.forEach(link => { if (link.kind === 'referral' && /vlinkpay\.com\/?\?ref=C884A316$/.test(link.url)) link.url = referralUrl(result); });
        }
        result.links.forEach(link => {
          link.url = moduleUrl(result, link);
          if (link.kind === 'tip') {
            const salon = salons.find(item => link.url === publicUrl('tip') + '&salon=' + item.id);
            if (salon) link.url = salon.tipUrl;
          }
        });
        result.leads = Array.isArray(data.leads) ? data.leads : [];
        const legacyPayments = data.payments && typeof data.payments === 'object' ? data.payments : {};
        result.payments = Object.fromEntries(methods.map(method => [method, payment({ payments: legacyPayments }, method)]));
        return result;
      }
      localStorage.setItem(KEY, JSON.stringify(initial));
    } catch (_) { /* In-memory demo remains usable when storage is unavailable. */ }
    return initial;
  }
  function save(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
  function validUrl(value) { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch (_) { return false; } }
  function hasPayment(state) { return enabledPayments(state).length > 0; }
  function visibleLinks(state, isLinked = Boolean(state.salonId)) {
    return state.links.filter(item => item.enabled && item.name.trim() && validUrl(item.url) && (item.kind !== 'payment' || hasPayment(state)) && (!['tip', 'booking'].includes(item.kind) || isLinked)).map(item => ({ ...item, url: moduleUrl(state, item) }));
  }
  function validate(state) {
    if (!state.name.trim()) return { field: 'name', message: 'Enter a OneQR name.' };
    if (!state.profile.name.trim()) return { field: 'profile', message: 'Enter a display name.' };
    const index = state.links.findIndex(item => !item.name.trim() || !validUrl(item.url));
    return index < 0 ? null : { field: 'link', index, message: 'Enter a title and a valid URL.' };
  }
  function vcard(state) {
    const value = text => String(text || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, match => '\\' + match);
    return ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + value(state.profile.name),
      state.profile.showPhone && state.profile.phone ? 'TEL:' + value(state.profile.phone) : '',
      state.profile.showEmail && state.profile.email ? 'EMAIL:' + value(state.profile.email) : '',
      state.profile.bio ? 'NOTE:' + value(state.profile.bio) : '', 'URL:' + publicUrl(), 'END:VCARD'].filter(Boolean).join('\r\n');
  }
  window.NEXORA_PERSONAL_QR = { KEY, linked, icons, isIconImage, methods, methodConfig, payment, configuredPayment, enabledPayments, salons, page, publicUrl, referralUrl, moduleUrl, template, read, save, validUrl, hasPayment, visibleLinks, validate, vcard };
})();
