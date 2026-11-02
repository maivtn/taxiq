(() => {
  // PO demo offers/ZIP anchors. The original Test business profile remains in discovery.js.
  const shop = { latitude: 29.7373, longitude: -95.4636 };
  const zips = {
    '77401': [29.7056, -95.4630, 'Bellaire'],
    '77036': [29.7010, -95.5360, 'Sharpstown'],
    '77002': [29.7560, -95.3650, 'Downtown'],
    '77494': [29.7440, -95.8130, 'Katy']
  };
  const offers = [
    { id: 'f2', business: 'Saigon Boba Westheimer', group: 'food', title: ['Trà sữa mua 1 tặng 1', 'Buy one milk tea, get one free'], value: '1+1', valueLabel: ['TẶNG', 'FREE'], condition: ['Sau 3pm', 'After 3pm'], latitude: 29.7330, longitude: -95.4600, color: '#8b5cf6', quantity: 100, left: 62, rule: 'time', ruleText: ['3PM–10PM', '3PM–10PM'] },
    { id: 'x1', business: 'The Tap Room', group: 'food', title: ['Happy hour: bia $3', 'Happy hour: $3 beer'], value: '$3', valueLabel: ['BIA', 'BEER'], condition: ['4–7pm', '4–7pm'], latitude: 29.7400, longitude: -95.4540, color: '#78350f', rule: 'active' },
    { id: 'f4', business: 'Crawfish Cafe Westheimer', group: 'food', title: ['Tối nay: 2 lb tôm hùm đất giá $25', 'Tonight: 2 lb crawfish for $25'], value: '$25', valueLabel: ['GIÁ', 'PRICE'], condition: ['Sau 5pm', 'After 5pm'], latitude: 29.7350, longitude: -95.4750, color: '#dc2626', quantity: 30, left: 12, rule: 'time', ruleText: ['5PM–10PM', '5PM–10PM'] },
    { id: 'f3', business: 'Le Petit Bakery', group: 'food', title: ['Giảm 15% bánh sinh nhật', '15% off birthday cakes'], value: '15%', valueLabel: ['GIẢM', 'OFF'], condition: ['Đặt trước 1 ngày', 'Order one day ahead'], latitude: 29.7420, longitude: -95.4480, color: '#f472b6', rule: 'booking' },
    { id: 'a1', business: 'Sparkle Car Wash', group: 'auto', title: ['Rửa xe + hút bụi $12', 'Car wash + vacuum $12'], value: '$12', valueLabel: ['GIÁ', 'PRICE'], condition: ['Thứ 2–5', 'Mon–Thu'], latitude: 29.7310, longitude: -95.4400, color: '#0284c7', rule: 'active', ruleText: ['T2–T5', 'Mon–Thu'] },
    { id: 'd1', business: 'Smile Dental Bellaire', group: 'health', title: ['Khám + cạo vôi $79', 'Dental exam + cleaning $79'], value: '$79', valueLabel: ['GIÁ', 'PRICE'], condition: ['Khách mới', 'New customers'], latitude: 29.7070, longitude: -95.4650, color: '#14b8a6', quantity: 25, left: 9, rule: 'booking' },
    { id: 'p1', business: 'Paws Grooming', group: 'family', title: ['Tắm & cắt lông chó giảm $10', '$10 off dog bath & grooming'], value: '$10', valueLabel: ['GIẢM', 'OFF'], condition: ['Chó dưới 25 lb', 'Dogs under 25 lb'], latitude: 29.7120, longitude: -95.4250, color: '#65a30d', quantity: 40, left: 18, rule: 'booking' },
    { id: 'f1', business: 'Phở 24 Bellaire', group: 'food', title: ['Combo phở + nước $9', 'Pho + drink combo $9'], value: '$9', valueLabel: ['COMBO', 'COMBO'], condition: ['11h–14h', '11AM–2PM'], latitude: 29.7058, longitude: -95.4280, color: '#ef4444', rule: 'time', ruleText: ['11AM–2PM', '11AM–2PM'] },
    { id: 'm1', business: 'Viet Market Hillcroft', group: 'shop', title: ['Giảm $5 đơn từ $50', '$5 off orders of $50 or more'], value: '$5', valueLabel: ['GIẢM', 'OFF'], condition: ['Đơn từ $50', 'Orders of $50 or more'], latitude: 29.7015, longitude: -95.5350, color: '#16a34a', rule: 'active' }
  ];
  const competitors = [
    { latitude: 29.7400, longitude: -95.4700 },
    { latitude: 29.7290, longitude: -95.4550 },
    { latitude: 29.7060, longitude: -95.4600 }
  ];
  const copy = {
    en: {
      mainMenu: 'Main Menu', useLocation: 'Use my location', optional: '(optional)', view: 'View', close: 'Close',
      food: 'Food & drinks', auto: 'Auto', family: 'Family & pets', health: 'Health', shopping: 'Shopping',
      zipPlaceholder: 'Or enter ZIP (e.g. 77036)', shopTitle: 'Around Bitcoin Nail Bar',
      shopHint: 'Distances are measured from the QR shop. No location access needed.',
      mineTitle: 'My location', mineHint: 'Using your location · only for this visit', zipHint: 'Based on the ZIP you entered',
      zipError: 'Demo ZIPs: 77401, 77036, 77002, 77494',
      competitors: '{count} nearby Beauty deals are hidden based on Bitcoin Nail Bar settings.',
      count: 'Deals found: {count}', empty: 'No deals within {radius} mi.',
      coupon: 'COUPON · {left}/{quantity} left', deal: 'DEAL', booking: 'Booking required',
      active: 'Available now', activeDays: 'Available · {days}', directions: 'Directions',
      conditions: 'Conditions', source: "You're exploring from Bitcoin Nail Bar's QR."
    },
    vi: {
      mainMenu: 'Menu chính', useLocation: 'Dùng vị trí của tôi', optional: '(tuỳ chọn)', view: 'Xem', close: 'Đóng',
      food: 'Ăn uống', auto: 'Xe', family: 'Gia đình & thú cưng', health: 'Sức khoẻ', shopping: 'Mua sắm',
      zipPlaceholder: 'Hoặc nhập ZIP (vd 77036)', shopTitle: 'Quanh Bitcoin Nail Bar',
      shopHint: 'Mặc định theo vị trí tiệm tạo QR — không cần bật định vị',
      mineTitle: 'Vị trí của tôi', mineHint: 'Đang dùng vị trí của bạn · chỉ trong lượt xem này', zipHint: 'Theo ZIP bạn nhập',
      zipError: 'Demo có ZIP: 77401, 77036, 77002, 77494',
      competitors: '{count} deal nhóm Làm đẹp gần đây được ẩn theo cài đặt của Bitcoin Nail Bar.',
      count: 'Tìm thấy {count} chương trình', empty: 'Chưa có deal trong {radius} mi.',
      coupon: 'COUPON · còn {left}/{quantity}', deal: 'DEAL', booking: 'Cần đặt lịch',
      active: 'Áp dụng bây giờ', activeDays: 'Đang áp dụng · {days}', directions: 'Chỉ đường',
      conditions: 'Điều kiện', source: 'Bạn đang khám phá từ QR của Bitcoin Nail Bar.'
    }
  };
  const get = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  let state;
  let selectedOffer;
  let currentDistances = new Map();
  const text = value => Array.isArray(value) ? value[state.language === 'vi' ? 0 : 1] : value;
  const translate = (key, values = {}) => Object.entries(values).reduce((result, [name, value]) => result.replace(`{${name}}`, value), copy[state.language][key]);

  function miles(origin, destination) {
    const radians = value => value * Math.PI / 180;
    const lat = radians(destination.latitude - origin.latitude);
    const lng = radians(destination.longitude - origin.longitude);
    const a = Math.sin(lat / 2) ** 2 + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) * Math.sin(lng / 2) ** 2;
    return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function badges(offer) {
    const type = offer.quantity ? `<span class="nearby-offer-badge nearby-offer-coupon">🎟️ ${translate('coupon', { left: offer.left, quantity: offer.quantity })}</span>` : `<span class="nearby-offer-badge nearby-offer-deal">🏷️ ${translate('deal')}</span>`;
    const rule = offer.rule === 'booking' ? `📅 ${translate('booking')}` : offer.rule === 'time' ? `⏰ ${text(offer.ruleText)}` : `✅ ${offer.ruleText ? translate('activeDays', { days: text(offer.ruleText) }) : translate('active')}`;
    return `${type}<span class="nearby-offer-rule"><span class="nearby-offer-badge nearby-offer-${offer.rule}">${escape(rule)}</span></span>`;
  }

  function renderDetail() {
    const offer = offers.find(item => item.id === selectedOffer);
    if (!offer) return;
    get('nearbyOfferTitle').textContent = text(offer.title);
    const distance = (currentDistances.get(offer.id) ?? 0).toFixed(1);
    get('nearbyOfferDetail').innerHTML = `
      <p class="profile-name">${escape(offer.business)}</p>
      <p class="nearby-offer-detail-meta">${escape(text(offer.condition))} · ${distance} mi</p>
      ${badges(offer)}
      <section class="nearby-offer-conditions"><strong>${translate('conditions')}</strong><p>${escape(text(offer.condition))}</p>${offer.rule === 'booking' ? `<p>📅 ${translate('booking')}</p>` : ''}</section>
      <a class="outline-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=${offer.latitude},${offer.longitude}" target="_blank" rel="noopener noreferrer">📍 ${translate('directions')} · ${distance} mi</a>
      <p class="profile-note">${translate('source')}</p>`;
  }

  function render(next) {
    const previous = state;
    state = next;
    document.querySelectorAll('[data-nearby-copy]').forEach(element => { element.textContent = translate(element.dataset.nearbyCopy); });
    document.querySelectorAll('[data-nearby-aria]').forEach(element => { element.setAttribute('aria-label', translate(element.dataset.nearbyAria)); });
    document.querySelectorAll('[data-nearby-placeholder]').forEach(element => { element.placeholder = translate(element.dataset.nearbyPlaceholder); });
    get('nearbyZipError').textContent = translate('zipError');
    get('nearbyZipReset').hidden = state.origin !== 'zip';
    get('nearbyZipForm').hidden = state.origin === 'mine';
    if (previous && (previous.origin !== state.origin || previous.zip !== state.zip)) {
      get('nearbyZipError').hidden = true;
      get('nearbyZip').removeAttribute('aria-invalid');
    }
    if (state.zip) get('nearbyZip').value = state.zip;
    else if (previous && previous.origin !== state.origin) get('nearbyZip').value = '';
    const zip = zips[state.zip];
    get('nearbyAnchorIcon').textContent = state.origin === 'mine' ? '📡' : state.origin === 'zip' ? '✍️' : '🏪';
    get('nearbyAnchorTitle').textContent = state.origin === 'mine' ? translate('mineTitle') : zip ? `ZIP ${state.zip} · ${zip[2]}` : translate('shopTitle');
    get('nearbyAnchorHint').textContent = translate(state.origin === 'mine' ? 'mineHint' : zip ? 'zipHint' : 'shopHint');

    const origin = state.coordinates || shop;
    const radius = state.radius ?? Infinity;
    const hidden = competitors.filter(item => miles(origin, item) <= radius).length;
    get('nearbyCompetitors').hidden = hidden === 0;
    get('nearbyCompetitors').textContent = `🛡️ ${translate('competitors', { count: hidden })}`;
    const measured = offers.map(offer => ({ ...offer, distance: miles(origin, offer) }));
    currentDistances = new Map(measured.map(offer => [offer.id, offer.distance]));
    // PO offer fixtures have no business opening hours. Open now includes only verified-open businesses.
    const visible = measured.filter(offer => offer.distance <= radius && (state.industry === 'all' || state.industry === offer.group) && (!state.openOnly || offer.open === true)).sort((a, b) => a.distance - b.distance);
    get('nearbyOfferCount').textContent = translate('count', { count: visible.length });
    get('nearbyOffersEmpty').hidden = visible.length > 0;
    get('nearbyOffersEmpty').textContent = translate('empty', { radius: state.radius ?? '50' });
    get('nearbyOffers').innerHTML = visible.map(offer => `<li><button class="nearby-offer" type="button" data-offer="${offer.id}" aria-haspopup="dialog" aria-controls="nearbyOfferDialog" style="--offer-color:${offer.color}">
      <span class="nearby-offer-value"><span>${offer.value}</span><small>${escape(text(offer.valueLabel))}</small></span>
      <span class="nearby-offer-content"><strong>${escape(text(offer.title))}</strong><span class="nearby-offer-meta">${escape(offer.business)} · ${offer.distance.toFixed(1)} mi</span><span class="nearby-offer-meta">${escape(text(offer.condition))}</span>${badges(offer)}</span>
    </button></li>`).join('');
    if (get('nearbyOfferDialog').open) renderDetail();
  }

  get('nearbyZipForm').addEventListener('submit', event => {
    event.preventDefault();
    const zip = get('nearbyZip').value.trim();
    const anchor = zips[zip];
    get('nearbyZipError').hidden = Boolean(anchor);
    get('nearbyZip').setAttribute('aria-invalid', String(!anchor));
    if (!anchor) { get('nearbyZip').focus(); return; }
    document.dispatchEvent(new CustomEvent('oneqr-dev:nearby-origin', { detail: { zip, latitude: anchor[0], longitude: anchor[1] } }));
  });
  get('nearbyZip').addEventListener('input', () => {
    get('nearbyZipError').hidden = true;
    get('nearbyZip').removeAttribute('aria-invalid');
  });
  get('nearbyZipReset').addEventListener('click', () => document.querySelector('[data-origin="shop"]').click());
  get('nearbyOffers').addEventListener('click', event => {
    const button = event.target.closest('[data-offer]');
    if (!button) return;
    selectedOffer = button.dataset.offer;
    renderDetail();
    get('nearbyOfferDialog').showModal();
  });
  get('nearbyOfferClose').addEventListener('click', () => get('nearbyOfferDialog').close());
  get('nearbyOfferDialog').addEventListener('click', event => {
    const dialog = get('nearbyOfferDialog');
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  document.addEventListener('oneqr-dev:nearby-state', event => render(event.detail));
})();
