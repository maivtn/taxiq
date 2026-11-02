(() => {
  // Keep the original Test business profile alongside the PO demo offers.
  const copy = {
    en: {
      language: 'Language', fromQr: 'From the QR of', back: 'Back', nav: 'Explore',
      nearbyNav: 'Nearby', dealsNav: 'Search Deals', nearbyTitle: 'Explore nearby',
      nearbySubtitle: 'See places, services and programs available.',
      dealsTitle: 'Search Deals', dealsSubtitle: 'Pick a program to see its price and conditions.',
      searchPlaceholder: 'Search deals: pedicure, facial, coffee…', areaRadius: 'Area & radius',
      distancesFrom: 'Distances from', myLocation: 'My location', radius: 'Radius',
      allIndustries: 'All industries', industry: 'Fast food & sandwiches', openNow: 'Open now',
      listTitle: 'Places to explore', businessCount: 'Businesses: {count}', thisShop: 'This shop',
      noDeals: 'No deals yet', viewBusiness: 'View business →', dealCount: 'Deals found: 0',
      emptyDealsTitle: 'No matching deals', emptyDealsHint: 'Try another keyword, industry or area.',
      emptyNearbyTitle: 'No businesses match',
      emptyNearbyHint: 'Try another industry, a wider radius, or turn off Open now.',
      business: 'Business', close: 'Close', profile: 'Business profile', directions: 'Directions',
      profileDeals: 'Deals', profileNoDeals: 'No deals right now. This business is still listed in Explore.',
      sourceNote: "You're exploring from Bitcoin Nail Bar's QR.", menu: 'One QR menu',
      locationDenied: 'Location is off, so distances are measured from Bitcoin Nail Bar.',
      locationUnsupported: "This browser can't share a location, so distances are measured from Bitcoin Nail Bar."
    },
    vi: {
      language: 'Ngôn ngữ', fromQr: 'Từ QR của', back: 'Quay lại', nav: 'Khám phá',
      nearbyNav: 'Khám phá quanh đây', dealsNav: 'Tìm ưu đãi cho tôi', nearbyTitle: 'Khám phá quanh đây',
      nearbySubtitle: 'Xem địa điểm, dịch vụ và chương trình đang có.',
      dealsTitle: 'Tìm ưu đãi cho tôi', dealsSubtitle: 'Chọn một chương trình để xem giá và điều kiện.',
      searchPlaceholder: 'Tìm ưu đãi: pedicure, facial, coffee…', areaRadius: 'Khu vực & bán kính',
      distancesFrom: 'Tính khoảng cách từ', myLocation: 'Vị trí của tôi', radius: 'Bán kính',
      allIndustries: 'Tất cả ngành', industry: 'Bánh mì / ăn nhanh', openNow: 'Đang mở cửa',
      listTitle: 'Địa điểm để khám phá', businessCount: '{count} doanh nghiệp', thisShop: 'Tiệm này',
      noDeals: 'Chưa có ưu đãi', viewBusiness: 'Xem doanh nghiệp →', dealCount: 'Tìm thấy 0 chương trình',
      emptyDealsTitle: 'Chưa có ưu đãi phù hợp', emptyDealsHint: 'Thử từ khóa, ngành hoặc khu vực khác.',
      emptyNearbyTitle: 'Không có doanh nghiệp phù hợp',
      emptyNearbyHint: 'Thử ngành khác, bán kính rộng hơn hoặc bỏ lọc Đang mở cửa.',
      business: 'Doanh nghiệp', close: 'Đóng', profile: 'Hồ sơ doanh nghiệp', directions: 'Chỉ đường',
      profileDeals: 'Chương trình của doanh nghiệp',
      profileNoDeals: 'Hiện chưa có chương trình khuyến mãi. Doanh nghiệp vẫn hiển thị trong Explore.',
      sourceNote: 'Bạn đang khám phá từ QR của Bitcoin Nail Bar.', menu: 'Menu One QR',
      locationDenied: 'Chưa có quyền vị trí nên khoảng cách tính từ Bitcoin Nail Bar.',
      locationUnsupported: 'Trình duyệt không hỗ trợ vị trí nên khoảng cách tính từ Bitcoin Nail Bar.'
    }
  };
  const get = id => document.getElementById(id);
  const page = document.body.dataset.discoveryPage;
  const params = new URLSearchParams(window.location.search);
  let language = params.get('lang') === 'vi' ? 'vi' : 'en';
  const business = { latitude: 30.2729209, longitude: -97.74438630000002, industry: 'fastfood', open: true };
  const state = { radius: page === 'nearby' ? 3 : null, industry: 'all', origin: 'shop', distance: 0, locationWarning: null, coordinates: null, zip: '' };
  // Share the selected area between Nearby and Search only within this browser tab.
  const contextKey = 'oneqr-dev:discovery-context';
  try {
    const context = JSON.parse(sessionStorage.getItem(contextKey) || 'null');
    if (context && typeof context === 'object') {
      if ((context.radius === null && page === 'deals') || [1, 3, 5, 10, 25, 50].includes(context.radius)) state.radius = context.radius;
      const zip = window.OneQrDealCatalog?.zips[context.zip];
      const coordinates = context.coordinates;
      if (context.origin === 'zip' && zip) {
        Object.assign(state, { origin: 'zip', zip: context.zip, coordinates: { latitude: zip[0], longitude: zip[1] } });
      } else if (context.origin === 'mine' && Number.isFinite(coordinates?.latitude) && Math.abs(coordinates.latitude) <= 90 && Number.isFinite(coordinates?.longitude) && Math.abs(coordinates.longitude) <= 180) {
        Object.assign(state, { origin: 'mine', coordinates: { latitude: coordinates.latitude, longitude: coordinates.longitude } });
      }
      if (state.coordinates) state.distance = distanceFromShop(state.coordinates.latitude, state.coordinates.longitude);
    }
  } catch { /* Storage may be unavailable in local HTML previews. */ }
  let locationRequest = 0;

  function updateResults() {
    const visible = (state.industry === 'all' || state.industry === business.industry || state.industry === 'food')
      && (state.radius === null || state.distance <= state.radius)
      && (!get('openNow')?.checked || business.open);
    if (page === 'nearby') {
      get('businessList').hidden = !visible;
      get('emptyNearby').hidden = visible;
      get('businessCount').textContent = copy[language].businessCount.replace('{count}', visible ? '1' : '0');
      get('businessDistance').textContent = `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(state.distance)} mi`;
    }
    document.querySelectorAll('[data-radius]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.radius) === state.radius));
    });
    document.querySelectorAll('[data-industry]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.industry === state.industry));
    });
    document.querySelectorAll('[data-origin]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.origin === state.origin));
      if (button.getAttribute('role') === 'switch') button.setAttribute('aria-checked', String(button.dataset.origin === state.origin));
    });
    get('locationWarning').hidden = !state.locationWarning;
    get('locationWarning').textContent = state.locationWarning ? copy[language][state.locationWarning] : '';
    try {
      sessionStorage.setItem(contextKey, JSON.stringify({ radius: state.radius, origin: state.origin, coordinates: state.coordinates, zip: state.zip }));
    } catch { /* Filters still work when session storage is unavailable. */ }
    if (page === 'nearby') document.dispatchEvent(new CustomEvent('oneqr-dev:nearby-state', { detail: { ...state, language, openOnly: Boolean(get('openNow')?.checked) } }));
    if (page === 'deals') document.dispatchEvent(new CustomEvent('oneqr-dev:search-state', { detail: { ...state, language, query: get('dealSearch').value } }));
  }

  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next;
    document.title = `HTML One QR Dev — ${copy[next][page === 'nearby' ? 'nearbyTitle' : 'dealsTitle']}`;
    document.querySelectorAll('[data-copy]').forEach(element => {
      element.textContent = copy[next][element.dataset.copy];
    });
    document.querySelectorAll('[data-copy-aria]').forEach(element => {
      element.setAttribute('aria-label', copy[next][element.dataset.copyAria]);
    });
    document.querySelectorAll('[data-copy-placeholder]').forEach(element => {
      element.placeholder = copy[next][element.dataset.copyPlaceholder];
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-selected', String(button.dataset.language === next));
    });
    get('languageCode').textContent = next.toUpperCase();
    document.querySelectorAll('[data-local-page]').forEach(link => {
      link.href = `${link.dataset.localPage}?lang=${next}`;
    });
    document.dispatchEvent(new CustomEvent('oneqr-dev:language-change', { detail: next }));
    updateResults();
  }

  function closeLanguage() {
    get('languageMenu').hidden = true;
    get('languageToggle').setAttribute('aria-expanded', 'false');
  }

  get('languageToggle').addEventListener('click', () => {
    const open = get('languageMenu').hidden;
    get('languageMenu').hidden = !open;
    get('languageToggle').setAttribute('aria-expanded', String(open));
    if (open) get('languageMenu').querySelector('[aria-selected="true"]').focus();
  });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.language);
      closeLanguage();
      get('languageToggle').focus();
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.language')) closeLanguage();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !get('languageMenu').hidden) {
      closeLanguage();
      get('languageToggle').focus();
    }
    if (event.target.closest('#languageMenu') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const options = [...get('languageMenu').querySelectorAll('[data-language]')];
      const index = options.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[next]?.focus();
    }
  });
  document.querySelectorAll('[data-radius]').forEach(button => {
    button.addEventListener('click', () => {
      state.radius = Number(button.dataset.radius);
      updateResults();
    });
  });
  document.querySelectorAll('[data-industry]').forEach(button => {
    button.addEventListener('click', () => {
      state.industry = button.dataset.industry;
      updateResults();
    });
  });
  get('openNow')?.addEventListener('change', updateResults);
  if (get('dealSearch')) get('dealSearch').value = (params.get('q') || '').slice(0, 100);
  get('dealSearch')?.addEventListener('input', updateResults);

  function distanceFromShop(latitude, longitude) {
    const radians = degrees => degrees * Math.PI / 180;
    const latDifference = radians(latitude - business.latitude);
    const lngDifference = radians(longitude - business.longitude);
    const a = Math.sin(latDifference / 2) ** 2 + Math.cos(radians(business.latitude)) * Math.cos(radians(latitude)) * Math.sin(lngDifference / 2) ** 2;
    return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  document.querySelector('[data-origin="shop"]').addEventListener('click', () => {
    locationRequest += 1;
    document.querySelector('[data-origin="mine"]').disabled = false;
    Object.assign(state, { origin: 'shop', distance: 0, locationWarning: null, coordinates: null, zip: '' });
    updateResults();
  });
  document.querySelector('[data-origin="mine"]').addEventListener('click', event => {
    if (page === 'nearby' && state.origin === 'mine') {
      document.querySelector('[data-origin="shop"]').click();
      return;
    }
    const request = ++locationRequest;
    const button = event.currentTarget;
    if (!navigator.geolocation) {
      state.locationWarning = 'locationUnsupported';
      updateResults();
      return;
    }
    button.disabled = true;
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== locationRequest) return;
      button.disabled = false;
      state.origin = 'mine';
      state.coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      state.zip = '';
      state.distance = distanceFromShop(position.coords.latitude, position.coords.longitude);
      state.locationWarning = null;
      updateResults();
    }, () => {
      if (request !== locationRequest) return;
      button.disabled = false;
      Object.assign(state, { origin: 'shop', distance: 0, locationWarning: 'locationDenied', coordinates: null, zip: '' });
      updateResults();
    }, { timeout: 10000, maximumAge: 60000 });
  });

  document.addEventListener('oneqr-dev:nearby-origin', event => {
    const next = event.detail;
    if (page !== 'nearby' || !Number.isFinite(next?.latitude) || !Number.isFinite(next?.longitude)) return;
    locationRequest += 1;
    document.querySelector('[data-origin="mine"]').disabled = false;
    Object.assign(state, { origin: 'zip', coordinates: { latitude: next.latitude, longitude: next.longitude }, zip: next.zip, locationWarning: null, distance: distanceFromShop(next.latitude, next.longitude) });
    updateResults();
  });

  const dialog = get('businessDialog');
  if (dialog) {
    get('viewBusiness').addEventListener('click', () => dialog.showModal());
    get('closeBusiness').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }
  setLanguage(language);
})();
