(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const catalog = window.ONEQR_INDUSTRIES;
  const GROUPS = catalog.groups;
  const industries = catalog.industries;
  const TILE_BACKGROUNDS = window.ONEQR_ACTION_APPEARANCE.backgrounds;
  const appearance = window.ONEQR_ACTION_APPEARANCE;
  const GROUP_ICONS = {
    "beauty": "sparkles",
    "food": "utensils",
    "personal": "user-round",
    "showbiz": "music",
    "service": "bell",
    "store": "store",
    "houseauto": "wrench",
    "health": "heart",
    "family": "award",
    "events": "cake",
    "finance": "wallet",
    "pro": "briefcase",
    "community": "users-round",
    "other": "square"
  };
  const INDUSTRY_ICONS = {
    "nails": "paintbrush",
    "hair": "wand-2",
    "massage": "flower-2",
    "lash": "sparkles",
    "tattoo": "paintbrush",
    "restaurant": "utensils",
    "cafe": "coffee",
    "truck": "truck",
    "solo": "user-round",
    "trainer": "trophy",
    "mua": "paintbrush",
    "coach": "message-circle",
    "kol": "instagram",
    "freelance": "briefcase",
    "photo": "camera",
    "artist": "music",
    "songwriter": "music",
    "band": "music",
    "model": "camera",
    "actor": "tv",
    "mc": "message-circle",
    "gym": "trophy",
    "tutor": "award",
    "ride": "car",
    "home": "home",
    "shopvn": "store",
    "retail": "shopping-bag",
    "grocery": "store",
    "butcher": "chef-hat",
    "seafood": "utensils",
    "boba": "coffee",
    "icecream": "cake",
    "foodsupply": "package",
    "beautyproducts": "sparkles",
    "supplement": "heart",
    "supply": "package",
    "goldshop": "crown",
    "jewelry": "crown",
    "gems": "sparkles",
    "florist": "flower-2",
    "printing": "image",
    "furniture": "home",
    "boutique": "shopping-bag",
    "thrift": "shopping-bag",
    "petstore": "heart",
    "wig": "wand-2",
    "auto": "wrench",
    "bodyshop": "car",
    "tires": "car",
    "towing": "truck",
    "autoglass": "car",
    "dealer": "car",
    "autoparts": "wrench",
    "lawn": "flower-2",
    "landscape": "flower-2",
    "construction": "building-2",
    "plumber": "wrench",
    "electric": "zap",
    "hvac": "settings",
    "roofing": "home",
    "pest": "home",
    "pool": "home",
    "appliance": "settings",
    "flooring": "home",
    "painting": "paintbrush",
    "solar": "zap",
    "locksmith": "settings-2",
    "gas": "car",
    "carwash": "car",
    "carrental": "car",
    "moving": "truck",
    "laundry": "settings",
    "alteration": "shopping-bag",
    "phonerepair": "phone",
    "clinic": "heart",
    "dental": "heart",
    "acupuncture": "flower-2",
    "chiro": "heart",
    "optical": "user-round",
    "pharmacy": "heart",
    "vet": "heart",
    "medspa": "sparkles",
    "pmu": "paintbrush",
    "childcare": "users-round",
    "school": "award",
    "driving": "car",
    "music": "music",
    "martial": "trophy",
    "dance": "music",
    "wedding": "heart",
    "venue": "building-2",
    "partyrental": "cake",
    "photobooth": "camera",
    "catering": "chef-hat",
    "moneytransfer": "wallet",
    "notary": "receipt",
    "translation": "globe-2",
    "mortgage": "home",
    "staffing": "users-round",
    "legal": "briefcase",
    "realestate": "home",
    "bizbroker": "briefcase",
    "insurance": "circle-check",
    "security": "circle-check",
    "taxservice": "receipt",
    "travel": "map",
    "itservice": "settings-2",
    "agency": "megaphone",
    "worship": "building-2",
    "nonprofit": "heart",
    "karaoke": "music",
    "petgroom": "heart",
    "petboard": "home",
    "funeral": "flower-2",
    "other": "square"
  };
  function industryImage(key, size = 36) { return appearance.image(key, size); }
  function industryIcon(industry) {
    return industryImage(INDUSTRY_ICONS[industry.id] || GROUP_ICONS[industry.groupId] || 'square');
  }
  const state = { group: 'all', query: '', language: 'en', selected: 'nails' };
  const groupById = id => GROUPS.find(group => group.id === id);
  const label = record => record[state.language] || record.en;
  const actionIds = catalog.recommended;
  const refreshIcons = () => window.lucide?.createIcons();
  try {
    const draft = JSON.parse(sessionStorage.getItem('taxiq:oneqr-editor-draft') || 'null');
    const saved = JSON.parse(localStorage.getItem('taxiq:oneqr-config') || 'null');
    const applied = draft?.industrySelection || saved?.industrySelection || JSON.parse(localStorage.getItem('taxiq:oneqr-industry-template') || 'null');
    state.selected = applied?.industryId || 'nails';
  } catch (error) { /* Use the default selection. */ }
  function renderGroups() {
    const tabs = $('#industry-group-tabs');
    const allLabel = state.language === 'vi' ? 'Tất cả' : 'All industries';
    tabs.innerHTML = [`<button class="group-tab ${state.group === 'all' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === 'all'}" data-group="all">${industryImage('store', 20)}${allLabel}<span>${industries.length}</span></button>`]
      .concat(GROUPS.map((group) => `<button class="group-tab ${state.group === group.id ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === group.id}" data-group="${group.id}">${industryImage(GROUP_ICONS[group.id] || 'square', 20)}${label(group)}<span>${group.items.split('|').length}</span></button>`)).join('');
    tabs.querySelectorAll('[data-group]').forEach((button) => button.addEventListener('click', () => {
      state.group = button.dataset.group;
      renderGroups();
      renderIndustries();
    }));
  }

  function filteredIndustries() {
    const query = state.query.trim().toLocaleLowerCase();
    return industries.filter((industry) => {
      const matchesGroup = state.group === 'all' || industry.groupId === state.group;
      const group = groupById(industry.groupId);
      const haystack = `${industry.en} ${industry.vi} ${group.en} ${group.vi}`.toLocaleLowerCase();
      return matchesGroup && (!query || haystack.includes(query));
    });
  }

  function renderIndustries() {
    const matches = filteredIndustries();
    const grid = $('#industry-grid');
    const noun = state.language === 'vi' ? 'mẫu ngành phù hợp' : `matching ${matches.length === 1 ? 'template' : 'templates'}`;
    $('#industry-result-count').textContent = state.language === 'vi' ? `${matches.length} ${noun}` : `${matches.length} ${noun}`;
    $('#clear-industry-filter').hidden = state.group === 'all' && !state.query;
    if (!matches.length) {
      grid.innerHTML = `<div class="no-results"><span><i data-lucide="search-x"></i></span><h3>${state.language === 'vi' ? 'Không tìm thấy ngành phù hợp' : 'No matching industry found'}</h3><p>${state.language === 'vi' ? 'Thử từ khóa ngắn hơn hoặc xem tất cả nhóm.' : 'Try a shorter keyword or browse all groups.'}</p></div>`;
      refreshIcons();
      return;
    }
    grid.innerHTML = matches.map((industry) => {
      const group = groupById(industry.groupId);
      const selected = state.selected === industry.id;
      const actionCount = actionIds(industry).length;
      const actionCopy = state.language === 'vi' ? `${actionCount} hành động sẵn có` : `${actionCount} actions ready`;
      const tileBackground = TILE_BACKGROUNDS[industries.indexOf(industry) % TILE_BACKGROUNDS.length];
      return `<button class="industry-card ${selected ? 'is-selected' : ''}" type="button" data-industry="${industry.id}" aria-pressed="${selected}" style="--card-gradient:${tileBackground}"><span class="industry-card-icon" aria-hidden="true">${industryIcon(industry)}</span><div><strong>${label(industry)}</strong><small>${label(group)} · ${actionCopy}</small></div><span class="selected-check"><i data-lucide="check"></i></span></button>`;
    }).join('');
    grid.querySelectorAll('[data-industry]').forEach((button) => button.addEventListener('click', () => selectIndustry(button.dataset.industry)));
    refreshIcons();
  }


  function selectIndustry(id) {
    try { sessionStorage.setItem('taxiq:oneqr-pending-industry', id); }
    catch (error) { $('#industry-result-count').textContent = 'Could not keep your selection. Please try again.'; return; }
    window.location.href = 'qr-stations.html?tab=one-qr';
  }
  $('#industry-search-input').addEventListener('input', event => { state.query = event.target.value; renderIndustries(); });
  $('#clear-industry-filter').addEventListener('click', () => {
    state.group = 'all'; state.query = ''; $('#industry-search-input').value = '';
    renderGroups(); renderIndustries();
  });
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    state.language = button.dataset.language;
    document.querySelectorAll('[data-language]').forEach(item => {
      item.classList.toggle('is-active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    renderGroups(); renderIndustries();
  }));
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      event.preventDefault(); $('#industry-search-input').focus();
    }
  });
  renderGroups(); renderIndustries(); refreshIcons();
})();
