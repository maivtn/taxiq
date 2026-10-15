(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const catalog = window.ONEQR_INDUSTRIES;
  const GROUPS = catalog.groups;
  const industries = catalog.industries;
  const TILE_BACKGROUNDS = window.ONEQR_ACTION_APPEARANCE.backgrounds;
  // Freepik / Flaticon Special Lineal Color PNGs. Credit is below the grid.
  const SHARED_ICON_KEYS = new Set([
    'nail', 'spa', 'hair', 'tattoo', 'fitness', 'restaurant', 'coffee',
    'seafood', 'food-truck', 'retail', 'apparel', 'jewelry', 'electronics',
    'home', 'furniture', 'flowers', 'travel', 'entertainment', 'repair',
    'cosmetics', 'takeaway'
  ]);
  const FLATICON_IDS = {
    medical: 5256176, car: 9835784, microphone: 2972039, business: 3094836,
    teamwork: 1865736, camera: 7640413, pet: 8418363, dental: 5714921,
    garden: 842870, party: 9109172, 'ice-cream': 2200569, construction: 10295941,
    baby: 9593079, grocery: 3194525, education: 306846, finance: 2523092,
    puzzle: 4406319, pharmacy: 9069025, boba: 4645854, meat: 995856,
    professional: 12692369, plumbing: 7853370, laundry: 1685982,
    music: 1514194, law: 1208147, 'pet-grooming': 6245877
  };
  const GROUP_ICONS = {
    beauty: 'spa', food: 'restaurant', personal: 'professional', showbiz: 'microphone',
    service: 'repair', store: 'retail', houseauto: 'construction', health: 'medical',
    family: 'education', events: 'party', finance: 'finance', pro: 'business',
    community: 'teamwork', other: 'puzzle'
  };
  const INDUSTRY_ICONS = {
    nails: 'nail', hair: 'hair', lash: 'cosmetics', tattoo: 'tattoo',
    cafe: 'coffee', truck: 'food-truck', trainer: 'fitness', mua: 'cosmetics',
    kol: 'camera', freelance: 'electronics', photo: 'camera', songwriter: 'music',
    band: 'music', model: 'apparel', actor: 'entertainment', gym: 'fitness',
    tutor: 'education', ride: 'car', shopvn: 'retail', grocery: 'grocery',
    butcher: 'meat', seafood: 'seafood', boba: 'boba', icecream: 'ice-cream',
    foodsupply: 'takeaway', beautyproducts: 'cosmetics', supplement: 'pharmacy',
    supply: 'repair', goldshop: 'jewelry', jewelry: 'jewelry', gems: 'jewelry',
    florist: 'flowers', furniture: 'furniture', boutique: 'apparel', thrift: 'apparel',
    petstore: 'pet', wig: 'hair', auto: 'repair', bodyshop: 'car', tires: 'car',
    towing: 'car', autoglass: 'car', dealer: 'car', autoparts: 'repair',
    lawn: 'garden', landscape: 'garden', plumber: 'plumbing', electric: 'repair',
    hvac: 'repair', pest: 'home', pool: 'home', appliance: 'electronics',
    painting: 'repair', solar: 'electronics', locksmith: 'repair', gas: 'car',
    carwash: 'car', carrental: 'car', moving: 'home', laundry: 'laundry',
    alteration: 'apparel', phonerepair: 'electronics', dental: 'dental',
    acupuncture: 'spa', pharmacy: 'pharmacy', vet: 'pet', medspa: 'spa',
    pmu: 'cosmetics', childcare: 'baby', driving: 'car', music: 'music',
    martial: 'fitness', dance: 'entertainment', photobooth: 'camera',
    catering: 'restaurant', notary: 'law', translation: 'education', mortgage: 'home',
    staffing: 'teamwork', legal: 'law', realestate: 'home', insurance: 'finance',
    security: 'law', taxservice: 'finance', travel: 'travel', itservice: 'electronics',
    karaoke: 'microphone', petgroom: 'pet-grooming', petboard: 'pet', funeral: 'flowers'
  };
  function flaticonImage(key, size = 36) {
    const path = SHARED_ICON_KEYS.has(key)
      ? `../assets/promotions/industry-icons/${key}.png`
      : `../assets/oneqr/industry-icons/${key}-${FLATICON_IDS[key]}.png`;
    return `<img src="${path}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">`;
  }
  function industryIcon(industry) {
    const key = INDUSTRY_ICONS[industry.id] || GROUP_ICONS[industry.groupId] || 'puzzle';
    return flaticonImage(key);
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
    tabs.innerHTML = [`<button class="group-tab ${state.group === 'all' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === 'all'}" data-group="all">${flaticonImage('retail', 20)}${allLabel}<span>${industries.length}</span></button>`]
      .concat(GROUPS.map((group) => `<button class="group-tab ${state.group === group.id ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === group.id}" data-group="${group.id}">${flaticonImage(GROUP_ICONS[group.id] || 'puzzle', 20)}${label(group)}<span>${group.items.split('|').length}</span></button>`)).join('');
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
