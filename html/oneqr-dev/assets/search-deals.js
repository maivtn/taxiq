(() => {
  const icon = window.OneQrIcons.image;
  const line = window.OneQrIcons.line;
  const { shop, zips, offers, ownOffers, hiddenOffers } = window.OneQrDealCatalog;
  const catalog = [...ownOffers, ...offers, ...hiddenOffers];
  // Query parsing, competitor filtering and requests mirror the PO's local demo.
  const dictionary = [
    ['nail', 'nail|mong|gel|pedicure|pedi|chan|manicure|dip'], ['hair', 'toc|hair|cat toc|nhuom'],
    ['spa', 'massage|spa|xoa bop|facial'], ['food', 'an|pho|com|bun|food|dinner|lunch|an toi|an trua|nha hang|tom|crawfish'],
    ['drink', 'tra sua|boba|cafe|ca phe|coffee|nuoc|milk tea|do uong'], ['bakery', 'banh|cake|bakery'],
    ['carwash', 'rua xe|car wash|xe'], ['pet', 'cho|meo|pet|thu cung|grooming'],
    ['dental', 'rang|nha si|dental'], ['market', 'cho|sieu thi|market|grocery']
  ];
  const copy = {
    en: {
      mainMenu: 'Main Menu', find: 'Find', searchPlaceholder: 'What would you like? e.g. milk tea nearby',
      suggestions: 'Search suggestions', quick: ['milk tea nearby', 'massage under $50', 'dinner tonight', 'car wash', 'pedicure', 'birthday cake'],
      aroundShop: 'Around Bitcoin Nail Bar', myLocation: 'My location', searchAround: 'Search around:',
      changeArea: 'Want to change? Go to Deals Nearby to use your location or enter a ZIP.',
      industry: 'industry:', price: 'price ≤', tonight: 'tonight', lunch: 'lunchtime', around: 'around:',
      competitors: '{count} results from other Beauty businesses are hidden based on Bitcoin Nail Bar settings.',
      count: 'Deals found: {count}', noMatch: 'No deal matches “{query}” yet',
      wishHint: 'Leave your phone number — when a nearby business has a matching deal, you receive one message. Nearby businesses also see this request.',
      phone: 'Phone number', phoneError: 'Enter a valid phone number.', wish: 'Post a request',
      wishDone: 'Request posted — nearby businesses will see it', wishPosted: 'Request posted',
      close: 'Close', coupon: 'COUPON · {left}/{quantity} left', deal: 'DEAL', booking: 'Booking required',
      active: 'Available now', activeDays: 'Available · {days}', directions: 'Directions', conditions: 'Conditions',
      source: "You're exploring from Bitcoin Nail Bar's QR."
    },
    vi: {
      mainMenu: 'Menu chính', find: 'Tìm', searchPlaceholder: 'Bạn muốn gì? vd: trà sữa gần đây',
      suggestions: 'Gợi ý tìm kiếm', quick: ['trà sữa gần đây', 'massage dưới $50', 'ăn tối nay', 'rửa xe', 'pedicure', 'bánh sinh nhật'],
      aroundShop: 'Quanh Bitcoin Nail Bar', myLocation: 'Vị trí của tôi', searchAround: 'Tìm quanh:',
      changeArea: 'Muốn đổi? Vào Deals Nearby để bật vị trí của bạn hoặc nhập ZIP.',
      industry: 'ngành:', price: 'giá ≤', tonight: 'tối nay', lunch: 'buổi trưa', around: 'quanh:',
      competitors: '{count} kết quả của tiệm cùng nhóm Làm đẹp được ẩn theo cài đặt của Bitcoin Nail Bar.',
      count: 'Tìm thấy {count} chương trình', noMatch: 'Chưa có deal khớp “{query}”',
      wishHint: 'Để lại SĐT — khi tiệm gần đây có deal đúng ý, bạn nhận 1 tin nhắn. Tiệm gần đó cũng thấy nhu cầu này.',
      phone: 'Số điện thoại', phoneError: 'Vui lòng nhập số điện thoại hợp lệ.', wish: 'Đăng mong muốn',
      wishDone: 'Đã đăng mong muốn — tiệm gần đây sẽ thấy', wishPosted: 'Đã đăng mong muốn',
      close: 'Đóng', coupon: 'COUPON · còn {left}/{quantity}', deal: 'DEAL', booking: 'Cần đặt lịch',
      active: 'Áp dụng bây giờ', activeDays: 'Đang áp dụng · {days}', directions: 'Chỉ đường', conditions: 'Điều kiện',
      source: 'Bạn đang khám phá từ QR của Bitcoin Nail Bar.'
    }
  };
  const get = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const requests = new Map();
  let state;
  let selectedOffer;
  let distances = new Map();
  const text = value => Array.isArray(value) ? value[state.language === 'vi' ? 0 : 1] : value;
  const translate = (key, values = {}) => Object.entries(values).reduce((result, [name, value]) => result.replace(`{${name}}`, value), copy[state.language][key]);

  function parse(query) {
    const value = normalize(query);
    const parsed = { industries: [], max: null, time: null };
    dictionary.forEach(([industry, pattern]) => {
      if (new RegExp(`(^|\\s)(${pattern})(\\s|$)`).test(value)) parsed.industries.push(industry);
    });
    const maximum = value.match(/(?:duoi|under|<|toi da|max)\s*\$?\s*(\d+)/) || value.match(/\$\s*(\d+)\s*(?:tro xuong|or less)/);
    if (maximum) parsed.max = Number(maximum[1]);
    if (/toi nay|tonight|buoi toi|dinner|an toi/.test(value)) parsed.time = 'evening';
    else if (/trua|lunch/.test(value)) parsed.time = 'lunch';
    if (parsed.industries.includes('pet') && !/sieu thi|market/.test(value)) parsed.industries = parsed.industries.filter(industry => industry !== 'market');
    if (!/sieu thi|market|grocery|di cho/.test(value)) parsed.industries = parsed.industries.filter(industry => industry !== 'market');
    if (!/rua xe|car wash/.test(value)) parsed.industries = parsed.industries.filter(industry => industry !== 'carwash');
    return parsed;
  }

  function miles(origin, destination) {
    const radians = value => value * Math.PI / 180;
    const lat = radians(destination.latitude - origin.latitude);
    const lng = radians(destination.longitude - origin.longitude);
    const a = Math.sin(lat / 2) ** 2 + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) * Math.sin(lng / 2) ** 2;
    return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function badges(offer) {
    const type = offer.quantity ? `<span class="nearby-offer-badge nearby-offer-coupon">${icon('coupon')} ${translate('coupon', { left: offer.left, quantity: offer.quantity })}</span>` : `<span class="nearby-offer-badge nearby-offer-deal">${icon('deal')} ${translate('deal')}</span>`;
    if (!offer.rule) return type;
    const rule = offer.rule === 'booking' ? `${translate('booking')}` : offer.rule === 'time' ? `${text(offer.ruleText)}` : `${offer.ruleText ? translate('activeDays', { days: text(offer.ruleText) }) : translate('active')}`;
    return `${type}<span class="nearby-offer-rule"><span class="nearby-offer-badge nearby-offer-${offer.rule}">${icon(offer.rule === 'booking' ? 'calendar' : offer.rule === 'time' ? 'clock' : 'active')} ${escape(rule)}</span></span>`;
  }

  function renderDetail() {
    const offer = catalog.find(item => item.id === selectedOffer);
    if (!offer) return;
    get('searchOfferTitle').textContent = text(offer.title);
    const distance = (distances.get(offer.id) ?? 0).toFixed(1);
    get('searchOfferDetail').innerHTML = `<p class="profile-name">${escape(offer.business)}</p>
      <p class="nearby-offer-detail-meta">${escape(text(offer.condition))} · ${distance} mi</p>${badges(offer)}
      <section class="nearby-offer-conditions"><strong>${translate('conditions')}</strong><p>${escape(text(offer.condition))}</p></section>
      <a class="outline-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=${offer.latitude},${offer.longitude}" target="_blank" rel="noopener noreferrer">${line('navigation')} ${translate('directions')} · ${distance} mi</a>
      <p class="profile-note">${translate('source')}</p>`;
  }

  function render(next) {
    const previousQuery = state?.query;
    const previousLanguage = state?.language;
    state = next;
    const query = state.query.trim();
    document.querySelectorAll('[data-search-copy]').forEach(element => { element.textContent = translate(element.dataset.searchCopy); });
    document.querySelectorAll('[data-search-aria]').forEach(element => { element.setAttribute('aria-label', translate(element.dataset.searchAria)); });
    document.querySelectorAll('[data-search-placeholder]').forEach(element => { element.placeholder = translate(element.dataset.searchPlaceholder); });
    if (previousLanguage !== state.language) {
      get('searchSuggestions').innerHTML = copy[state.language].quick.map(value => `<button class="chip" type="button" data-query="${escape(value)}">${escape(value)}</button>`).join('');
    }
    const zip = zips[state.zip];
    const anchor = state.origin === 'mine' ? translate('myLocation') : zip ? `ZIP ${state.zip} · ${zip[2]}` : translate('aroundShop');
    get('searchGuide').innerHTML = `${translate('searchAround')} <b>${escape(anchor)}</b>. <a href="nearby.html?lang=${state.language}">${translate('changeArea')}</a>`;
    const parsed = parse(query);
    const tags = parsed.industries.map(industry => `${translate('industry')} ${industry}`);
    if (parsed.max !== null) tags.push(`${translate('price')} $${parsed.max}`);
    if (parsed.time) tags.push(translate(parsed.time === 'evening' ? 'tonight' : 'lunch'));
    tags.push(`${translate('around')} ${anchor}`);
    get('searchParsed').hidden = !query;
    get('searchParsed').innerHTML = tags.map(tag => `<span>${escape(tag)}</span>`).join('');
    const origin = state.coordinates || shop;
    const measured = catalog.map(offer => ({ ...offer, distance: miles(origin, offer) }));
    distances = new Map(measured.map(offer => [offer.id, offer.distance]));
    const matches = query ? measured.filter(offer => {
      const words = normalize([...offer.title, offer.keywords, offer.business].join(' '));
      const industry = parsed.industries.length ? parsed.industries.includes(offer.industry) || (parsed.industries.includes('food') && offer.group === 'food') : normalize(query).split(/\s+/).some(word => word.length > 3 && words.includes(word));
      return industry && (parsed.max === null || offer.price !== null && offer.price <= parsed.max)
        && (!parsed.time || offer[parsed.time]);
    }) : [];
    const hidden = matches.filter(offer => !offer.own && offer.group === 'beauty').length;
    const visible = matches.filter(offer => offer.own || offer.group !== 'beauty').sort((a, b) => Number(Boolean(b.own)) - Number(Boolean(a.own)) || a.distance - b.distance);
    get('searchCompetitors').hidden = hidden === 0;
    get('searchCompetitors').innerHTML = `${icon('filter')} ${escape(translate('competitors', { count: hidden }))}`;
    get('searchCount').textContent = query ? translate('count', { count: visible.length }) : '';
    get('searchOffers').hidden = visible.length === 0;
    get('searchOffers').innerHTML = visible.map(offer => `<li><button class="nearby-offer" type="button" data-offer="${offer.id}" aria-haspopup="dialog" aria-controls="searchOfferDialog" style="--offer-color:${offer.color}">
      <span class="nearby-offer-value"><span>${offer.value}</span><small>${escape(text(offer.valueLabel))}</small></span>
      <span class="nearby-offer-content"><strong>${escape(text(offer.title))}</strong><span class="nearby-offer-meta">${escape(offer.business)} · ${offer.distance.toFixed(1)} mi</span><span class="nearby-offer-meta">${escape(text(offer.condition))}</span>${badges(offer)}</span>
    </button></li>`).join('');
    get('searchWish').hidden = !query || visible.length > 0;
    get('searchWishTitle').textContent = translate('noMatch', { query });
    if (previousQuery !== state.query) {
      get('wishPhone').value = '';
      get('wishPhone').removeAttribute('aria-invalid');
      get('wishPhoneError').hidden = true;
    }
    const posted = requests.has(normalize(query));
    get('wishSubmit').disabled = posted;
    get('wishSubmitLabel').textContent = translate(posted ? 'wishPosted' : 'wish');
    get('wishStatus').hidden = !posted;
    get('wishStatus').innerHTML = posted ? `${icon('active')} ${escape(translate('wishDone'))}` : '';
    if (get('searchOfferDialog').open) renderDetail();
  }

  get('searchForm').addEventListener('submit', event => {
    event.preventDefault();
    get('dealSearch').dispatchEvent(new Event('input', { bubbles: true }));
    // Keep query deep links without exposing phone numbers or location coordinates.
    const url = new URL(window.location.href);
    const query = get('dealSearch').value.trim();
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    try { window.history.replaceState(null, '', url); } catch { /* file:// previews may restrict history. */ }
  });
  get('searchSuggestions').addEventListener('click', event => {
    const button = event.target.closest('[data-query]');
    if (!button) return;
    get('dealSearch').value = button.dataset.query;
    get('searchForm').requestSubmit();
  });
  get('wishPhone').addEventListener('input', () => {
    get('wishPhoneError').hidden = true;
    get('wishPhone').removeAttribute('aria-invalid');
  });
  get('searchWish').addEventListener('submit', event => {
    event.preventDefault();
    if (!state?.query.trim() || get('wishSubmit').disabled) return;
    const digits = get('wishPhone').value.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      get('wishPhoneError').hidden = false;
      get('wishPhone').setAttribute('aria-invalid', 'true');
      get('wishPhone').focus();
      return;
    }
    // Local demo only, matching the PO. No SMS or request is sent to a business.
    requests.set(normalize(state.query.trim()), { query: state.query.trim() });
    render(state);
  });
  get('searchOffers').addEventListener('click', event => {
    const button = event.target.closest('[data-offer]');
    if (!button) return;
    selectedOffer = button.dataset.offer;
    renderDetail();
    get('searchOfferDialog').showModal();
  });
  get('searchOfferClose').addEventListener('click', () => get('searchOfferDialog').close());
  get('searchOfferDialog').addEventListener('click', event => {
    const dialog = get('searchOfferDialog');
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  document.addEventListener('oneqr-dev:search-state', event => render(event.detail));
})();
