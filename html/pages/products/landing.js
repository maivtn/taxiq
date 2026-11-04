(() => {
  const data = JSON.parse(document.getElementById('page-data').textContent);
  const select = document.getElementById('language');
  const allowed = ['vi', 'en', 'zh', 'ko', 'es', 'ja', 'th', 'ar', 'fr'];
  const saved = localStorage.getItem('nexora-dashboard-language-v1');
  let lang = allowed.includes(saved) ? saved : 'vi';
  const localeCatalog = window.NEXORA_PRODUCT_LOCALES || {};
  const originalLocaleText = new WeakMap();
  let lastTranslationLanguage = null;
  const translateText = (value, code = lang) => {
    if (code === 'vi') return value;
    const source = String(value);
    const trimmed = source.trim();
    const translated = localeCatalog[trimmed]?.[code];
    if (translated) return source.replace(trimmed, translated);
    if (trimmed.includes(' · ')) {
      const pieces = trimmed.split(' · ');
      const result = pieces.map(piece => localeCatalog[piece]?.[code] || piece).join(' · ');
      if (result !== trimmed) return source.replace(trimmed, result);
    }
    return source;
  };
  const translateTree = (value, code) => {
    if (typeof value === 'string') return translateText(value, code);
    if (Array.isArray(value)) return value.map(item => translateTree(item, code));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateTree(item, code)]));
    return value;
  };
  const fillProductLanguages = value => {
    if (!value || typeof value !== 'object') return;
    if (!Array.isArray(value) && 'vi' in value && 'en' in value) {
      allowed.slice(2).forEach(code => {
        if (!(code in value)) value[code] = translateTree(value.en, code);
      });
    }
    Object.values(value).forEach(fillProductLanguages);
  };
  fillProductLanguages(data);
  const translateRenderedCopy = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, svg')) continue;
      if (lang === 'vi') {
        const original = originalLocaleText.get(node);
        if (original && lastTranslationLanguage && node.nodeValue === translateText(original, lastTranslationLanguage)) node.nodeValue = original;
        continue;
      }
      if (!originalLocaleText.has(node) || (
        node.nodeValue !== translateText(originalLocaleText.get(node)) &&
        node.nodeValue !== translateText(originalLocaleText.get(node), lastTranslationLanguage)
      )) {
        originalLocaleText.set(node, node.nodeValue);
      }
      node.nodeValue = translateText(originalLocaleText.get(node));
    }
    document.querySelectorAll('[aria-label], [title], [placeholder]').forEach(node => {
      for (const attribute of ['aria-label', 'title', 'placeholder']) {
        if (!node.hasAttribute(attribute)) continue;
        const key = `localeOriginal${attribute.replace(/[^a-z]/gi, '')}`;
        if (lang === 'vi') {
          const original = node.dataset[key];
          if (original && lastTranslationLanguage && node.getAttribute(attribute) === translateText(original, lastTranslationLanguage)) node.setAttribute(attribute, original);
          continue;
        }
        if (!node.dataset[key] || (
          node.getAttribute(attribute) !== translateText(node.dataset[key]) &&
          node.getAttribute(attribute) !== translateText(node.dataset[key], lastTranslationLanguage)
        )) node.dataset[key] = node.getAttribute(attribute);
        node.setAttribute(attribute, translateText(node.dataset[key]));
      }
    });
    if (lang !== 'vi') document.title = translateText(document.title);
    lastTranslationLanguage = lang === 'vi' ? null : lang;
  };
  let sceneIndex = 0;
  let heroIndex = 0;
  let heroPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let heroHovered = false;
  let heroTimer;
  const hero = document.querySelector('.hero');
  const oneqrDemo = hero.querySelector('.oneqr-hero-demo');

  const pick = (value) => value?.[lang] || value?.en || value?.vi || '';
  const escapeHTML = (text) => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const all = selector => [...document.querySelectorAll(selector)];
  const iconPaths = {
    storefront:'<path d="M3 10h18l-2-6H5l-2 6Zm1 0v10h16V10M8 20v-6h8v6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3"/>',
    repeat:'<path d="M4 8h13l-3-3M20 16H7l3 3M17 8l-3 3M7 16l3-3"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/>',
    card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    chart:'<path d="M3 20h18M6 16v-5M11 16V7M16 16v-9M21 16V4"/>',
    qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/>',
    sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"/>',
    touch:'<path d="M9 13V5a2 2 0 0 1 4 0v6l1-1a2 2 0 0 1 3 1 2 2 0 0 1 3 2l-1 5a5 5 0 0 1-5 4h-2a5 5 0 0 1-4-2l-4-5a2 2 0 0 1 3-3l2 1Z"/>',
    network:'<circle cx="12" cy="4" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M11 6 6 17M13 6l5 11M7 19h10"/>',
    wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 9V5a2 2 0 0 1 2-2h12M15 13h6v4h-6a2 2 0 0 1 0-4Z"/>',
    coins:'<circle cx="9" cy="14" r="6"/><path d="M9 10v8M11 11.5c-2-1-4-.2-4 1 0 2 4 1 4 3 0 1.2-2 2-4 1M15 3h6v6"/>',
    send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
    headset:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 14H2v5h4v-5H4Zm16 0h2v5h-4v-5h2ZM18 19a5 5 0 0 1-5 3h-2"/>',
    sparkle:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/>',
    star:'<path d="m12 2 3.1 6.4 7.1 1-5.1 5 1.2 7.1-6.3-3.3-6.3 3.3 1.2-7.1-5.1-5 7.1-1L12 2Z"/>',
    message:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l2-4a8.5 8.5 0 1 1 15-4.5Z"/><path d="M8 11h8M8 14h5"/>',
    gift:'<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-7 0-7-6-3-6 2 0 3 3 3 6Zm0 0c7 0 7-6 3-6-2 0-3 3-3 6Z"/>',
    palette:'<path d="M12 2a10 10 0 1 0 0 20h2a2 2 0 0 0 1-4 2 2 0 0 1 0-4h2a5 5 0 0 0 5-5A10 10 0 0 0 12 2Z"/><path d="M7 10h.01M11 6h.01M17 8h.01M6 15h.01"/>',
    badge:'<circle cx="12" cy="9" r="6"/><path d="m8 14-1 8 5-3 5 3-1-8"/>',
    bag:'<path d="M4 8h16l-1 13H5L4 8ZM8 9V6a4 4 0 0 1 8 0v3"/>',
    files:'<rect x="7" y="3" width="13" height="17" rx="2"/><path d="M4 7v13a2 2 0 0 0 2 2h10M10 8h7M10 12h7M10 16h4"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    newspaper:'<path d="M4 4h16v15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7M7 8h5v5H7zM15 8h3M15 11h3M7 16h11"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18M10 13v2h4v-2"/>',
    tag:'<path d="M3 12V4h8l10 10-7 7L3 12Z"/><circle cx="8" cy="8" r="1"/>',
    book:'<path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v15"/>',
    phone:'<path d="M7 3 4 6c-1 1 0 6 5 11s10 6 11 5l3-3-5-4-3 2c-3-1-5-3-6-6l2-3-4-5Z"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 18h.01"/>',
    usercheck:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 16l2 2 4-4"/>',
    heart:'<path d="M20 5a5 5 0 0 0-7 0l-1 1-1-1a5 5 0 0 0-7 7l8 9 8-9a5 5 0 0 0 0-7Z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    edit:'<path d="M4 20h16M6 16l-1 3 3-1L20 6l-3-3L6 16Z"/>',
    wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7M20 8l-6 3M18 18l-5-4M6 18l5-4M4 8l6 3"/>',
    play:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>',
    receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3ZM9 8h6M9 12h6M9 16h4"/>',
    shield:'<path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>'
  };
  const featureIconNames = {
    'si-pos':['storefront','calendar','repeat','list','users','card','user','chart'],
    'one-qr':['qr','sliders','usercheck','calendar','list','tag','star','coins','card','gift','network','send'],
    'payments-payouts':['wallet','coins','send','card'],
    'ai-hub':['headset','sliders','sparkle','wallet'],
    'reviews':['star','message','network','chart'],
    'gift-card-center':['gift','palette','badge','bag','files','qr','chart','clock'],
    'analytics':['chart','badge','qr','storefront'],
    'community':['newspaper','users','storefront','briefcase','clock','tag','book','message'],
    'tax-iq':['wallet','chart','receipt','shield'],
    'ai-voice-sms':['phone','help','calendar','usercheck','message','target','heart','chart'],
    'ai-marketing':['users','edit','message','chart'],
    'spin-wheel':['wheel','gift','sliders','play']
  };
  const lineIcon = kind => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[kind] || iconPaths.sparkle}</svg>`;
  const directionPaths = {
    right:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    left:'<path d="M20 12H5m6-6-6 6 6 6"/>',
    down:'<path d="M12 4v15m-6-6 6 6 6-6"/>',
    up:'<path d="M12 20V5m-6 6 6-6 6 6"/>'
  };
  const directionIcon = direction => `<svg class="direction-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${directionPaths[direction]}</svg>`;
  function normalizeDirectionalIcons() {
    const directions = {'↗':'right','→':'right','›':'right','←':'left','‹':'left','↑':'up','↓':'down'};
    all('a, button').forEach(control => {
      const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) if (/[↗→›←‹↑↓]/.test(walker.currentNode.textContent)) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const parts = node.textContent.split(/([↗→›←‹↑↓])/);
        const fragment = document.createDocumentFragment();
        parts.forEach(part => {
          if (!part) return;
          if (!directions[part]) { fragment.append(document.createTextNode(part)); return; }
          const holder = document.createElement('span');
          holder.innerHTML = directionIcon(directions[part]);
          fragment.append(holder.firstElementChild);
        });
        node.replaceWith(fragment);
      });
    });
  }
  const ecosystemCopy = {
    'si-pos':['SI POS','Quản lý quầy, lịch hẹn, lượt thợ, phiếu dịch vụ và doanh số trong một luồng.','Manage the front desk, bookings, staff turns, service tickets and sales in one flow.'],
    'one-qr':['One QR','Menu QR do tiệm cấu hình để khách chọn check-in, dịch vụ, tip hoặc ưu đãi.','A salon-configured QR menu for check-in, services, tipping and offers.'],
    'payments-payouts':['Payments & Payouts','Theo dõi khoản thu, tip, chi trả thợ và giao dịch thanh toán.','Track income, tips, staff payouts and payment activity.'],
    'ai-hub':['AI Hub','Không gian hỗ trợ lễ tân, cuộc gọi, lịch hẹn và tiếp thị.','A workspace for reception, calls, bookings and marketing support.'],
    'reviews':['Reviews','Mời khách đánh giá, xem phản hồi và chăm sóc trải nghiệm sau dịch vụ.','Invite reviews, see feedback and follow up after a visit.'],
    'gift-card-center':['Gift Card Center','Thiết kế, phát hành, quản lý và nhận thanh toán bằng thẻ quà tặng.','Design, issue, manage and redeem gift cards.'],
    'analytics':['Analytics','Xem xu hướng tip, hiệu suất điểm QR và dữ liệu vận hành.','See tipping trends, QR touchpoint performance and operations data.'],
    'community':['Community','Bản xem trước kết nối Bảng tin, Nhóm & Chợ, Fanpage, Việc làm, ưu đãi và trò chuyện.','A preview bringing together Feed, Groups & Market, Pages, Jobs, offers and conversations.'],
    'tax-iq':['Tax IQ','Định hướng sắp xếp thu nhập, chi phí và biên lai.','A proposed place to organize income, expenses and receipts.'],
    'ai-voice-sms':['AI Voice SMS','AI hỗ trợ tiếp nhận cuộc gọi; SMS giúp xác nhận lịch và chăm sóc khách.','AI assists with calls; SMS supports booking confirmations and guest follow-up.'],
    'ai-marketing':['AI Marketing Tool','Chọn nhóm khách, chuẩn bị chiến dịch SMS và theo dõi kết quả.','Choose audiences, prepare SMS campaigns and review results.'],
    'spin-wheel':['Spin Wheel','Tạo kiểu vòng quay, giải thưởng và quy tắc trước khi chạy chiến dịch.','Preview a prize wheel, rewards and rules before a live campaign.']
  };
  const ecosystemMap = document.querySelector('.ecosystem-map');
  const ecosystemVisual = document.querySelector('.ecosystem-visual');
  const ecosystemNodes = ecosystemMap ? all('.ecosystem-node') : [];
  const ecosystemProducts = ecosystemVisual ? all('.ecosystem-product') : [];
  const ecosystemSlugs = ecosystemMap ? [data.slug, ...ecosystemNodes.map(node => node.getAttribute('href').split('/')[1])] : [];
  let ecosystemIndex = 0;
  let ecosystemVisible = false;
  let ecosystemPaused = false;
  let ecosystemTimer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ecosystemSpotlight;

  if (ecosystemMap) {
    ecosystemSpotlight = document.createElement('div');
    ecosystemSpotlight.className = 'ecosystem-spotlight';
    ecosystemSpotlight.innerHTML = '<div class="ecosystem-spotlight-head"><small></small><button class="ecosystem-spotlight-toggle" type="button"></button></div><strong class="ecosystem-spotlight-title"></strong><p></p><a class="ecosystem-spotlight-link"></a>';
    ecosystemVisual.querySelector('.ecosystem-map-hint').after(ecosystemSpotlight);
    ecosystemSpotlight.querySelector('button').addEventListener('click', () => {
      ecosystemPaused = !ecosystemPaused;
      scheduleEcosystem();
    });
    ecosystemNodes.forEach(node => {
      const slug = node.getAttribute('href').split('/')[1];
      node.addEventListener('mouseenter', () => selectEcosystem(slug));
      node.addEventListener('focus', () => selectEcosystem(slug));
    });
    ecosystemProducts.forEach(node => {
      const slug = node.classList.contains('is-current') ? data.slug : node.getAttribute('href').split('/')[1];
      node.addEventListener('mouseenter', () => selectEcosystem(slug));
      node.addEventListener('focus', () => selectEcosystem(slug));
    });
  }

  function selectEcosystem(slug) {
    const index = ecosystemSlugs.indexOf(slug);
    if (index < 0) return;
    ecosystemIndex = index;
    paintEcosystem();
    scheduleEcosystem();
  }

  function paintEcosystem() {
    if (!ecosystemMap) return;
    const slug = ecosystemSlugs[ecosystemIndex];
    const copy = ecosystemCopy[slug];
    const isCurrent = slug === data.slug;
    const activeNode = ecosystemNodes.find(node => node.getAttribute('href').split('/')[1] === slug);
    const accent = isCurrent
      ? ecosystemMap.querySelector('.ecosystem-center').style.getPropertyValue('--node-color')
      : activeNode.style.getPropertyValue('--node-color');
    ecosystemNodes.forEach(node => node.classList.toggle('is-active', node === activeNode));
    ecosystemProducts.forEach(node => {
      const itemSlug = node.classList.contains('is-current') ? data.slug : node.getAttribute('href').split('/')[1];
      node.classList.toggle('is-spotlight', itemSlug === slug);
    });
    all('.ecosystem-lines path').forEach((path, index) => path.classList.toggle('is-active', ecosystemNodes[index] === activeNode));
    ecosystemMap.querySelector('.ecosystem-center').classList.toggle('is-active', isCurrent);
    ecosystemSpotlight.style.setProperty('--spotlight-color', accent);
    ecosystemSpotlight.querySelector('small').textContent = lang === 'vi' ? 'SẢN PHẨM' : 'PRODUCT';
    ecosystemSpotlight.querySelector('strong').textContent = copy[0];
    ecosystemSpotlight.querySelector('p').textContent = copy[lang === 'vi' ? 1 : 2];
    const link = ecosystemSpotlight.querySelector('a');
    link.href = isCurrent ? '#overview' : `../${slug}/index.html`;
    link.innerHTML = `${isCurrent
      ? (lang === 'vi' ? 'Đang xem sản phẩm này' : 'Viewing this product')
      : (lang === 'vi' ? 'Xem trang sản phẩm' : 'View product page')} ${directionIcon(isCurrent ? 'up' : 'right')}`;
    if (!reducedMotion.matches) {
      ecosystemSpotlight.classList.remove('is-changing');
      void ecosystemSpotlight.offsetWidth;
      ecosystemSpotlight.classList.add('is-changing');
    }
    translateRenderedCopy();
  }

  function scheduleEcosystem() {
    clearTimeout(ecosystemTimer);
    if (!ecosystemMap) return;
    const running = ecosystemVisible && !ecosystemPaused && !document.hidden && !reducedMotion.matches &&
      !ecosystemVisual.matches(':hover,:focus-within');
    ecosystemMap.classList.toggle('is-running', running);
    ecosystemSpotlight.setAttribute('aria-live', running ? 'off' : 'polite');
    const toggle = ecosystemSpotlight.querySelector('button');
    const iconState = ecosystemPaused ? 'play' : 'pause';
    if (toggle.dataset.iconState !== iconState) {
      toggle.innerHTML = ecosystemPaused ? lineIcon('play') : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5v14M15 5v14"/></svg>';
      toggle.dataset.iconState = iconState;
    }
    toggle.setAttribute('aria-pressed', String(!ecosystemPaused));
    toggle.setAttribute('aria-label', lang === 'vi'
      ? (ecosystemPaused ? 'Tiếp tục hiệu ứng' : 'Tạm dừng hiệu ứng')
      : (ecosystemPaused ? 'Resume animation' : 'Pause animation'));
    if (!running) return;
    ecosystemTimer = setTimeout(() => {
      ecosystemIndex = (ecosystemIndex + 1) % ecosystemSlugs.length;
      paintEcosystem();
      scheduleEcosystem();
    }, 4600);
  }

  function paintOneQrChoice() {
    if (!oneqrDemo) return;
    const response = oneqrDemo.querySelector('.oneqr-demo-response');
    const selected = oneqrDemo.querySelector('[data-oneqr-option][aria-pressed="true"]');
    const language = lang === 'vi' ? 'vi' : 'en';
    response.textContent = selected
      ? (language === 'vi'
        ? `Minh họa: ${selected.getAttribute('data-oneqr-detail-vi')}`
        : `${translateText('Preview')}: ${translateText(selected.getAttribute('data-oneqr-detail-en'))}`)
      : (language === 'vi' ? response.getAttribute('data-vi') : translateText(response.getAttribute('data-en')));
    translateRenderedCopy();
  }

  function paintHeroSlide() {
    const scenes = data.scenes[lang] || data.scenes.en;
    const firstLead = pick(data.lead);
    const firstDeck = pick(data.deck);
    const customSlides = data.heroSlides?.[lang] || data.heroSlides?.en;
    const lead = customSlides ? customSlides[heroIndex][0] : (heroIndex === 0 ? firstLead : scenes[heroIndex][0]);
    const deck = customSlides ? customSlides[heroIndex][1] : (heroIndex === 0 ? firstDeck : scenes[heroIndex][1]);
    const sceneLabel = customSlides ? customSlides[heroIndex][2] : (heroIndex === 0
      ? (lang === 'vi' ? 'Tổng quan sản phẩm' : 'Product overview')
      : scenes[heroIndex][0]);
    hero.querySelector('[data-lead]').textContent = lead;
    const deckNode = hero.querySelector('[data-deck]');
    deckNode.textContent = deck;
    deckNode.hidden = !deck;
    hero.querySelector('[data-hero-scene]').textContent = sceneLabel;
    all('[data-hero-media]').forEach((media, index) => media.dataset.active = String(index === heroIndex));
    if (oneqrDemo) {
      oneqrDemo.hidden = heroIndex !== 1;
      hero.classList.toggle('oneqr-menu-active', heroIndex === 1);
    }
    all('[data-hero-dot]').forEach((dot, index) => dot.setAttribute('aria-current', String(index === heroIndex)));
    all('[data-voice-state]').forEach((state, index) => state.dataset.active = String(index === heroIndex));
    translateRenderedCopy();
  }

  function syncHeroTimer() {
    clearInterval(heroTimer);
    if (!heroPaused && !document.hidden && !heroHovered && !hero.contains(document.activeElement)) {
      heroTimer = setInterval(() => {
        heroIndex = (heroIndex + 1) % 3;
        paintHeroSlide();
      }, 6500);
    }
    const playButton = hero.querySelector('[data-hero-play]');
    playButton.innerHTML = heroPaused ? lineIcon('play') : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5v14M15 5v14"/></svg>';
    playButton.setAttribute('aria-pressed', String(heroPaused));
    playButton.setAttribute('aria-label', lang === 'vi'
      ? (heroPaused ? 'Tiếp tục trình chiếu' : 'Tạm dừng trình chiếu')
      : (heroPaused ? 'Resume slideshow' : 'Pause slideshow'));
  }

  function spinWheelIcon(kind) {
    const paths = {
      wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7M20 8l-6 3M18 18l-5-4M6 18l5-4M4 8l6 3"/>',
      percent:'<circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 19 19 5"/>',
      gift:'<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-7 0-7-6-3-6 2 0 3 3 3 6Zm0 0c7 0 7-6 3-6-2 0-3 3-3 6Z"/>',
      care:'<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/><path d="M9 16c.6 1.2 1.6 1.8 3 1.8"/>',
      rules:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"/>',
      play:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>',
      empty:'<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[kind] || paths.gift}</svg>`;
  }

  function productMock() {
    const vi = lang === 'vi';
    const featureNames = (data.old.features[lang] || data.old.features.en).map(item => item[0]);
    const row = (icon, label) => `<div class="mock-row"><span class="mock-icon">${lineIcon(icon)}</span><strong>${escapeHTML(label)}</strong></div>`;
    switch (data.slug) {
      case 'si-pos': return `<div class="mock-board mock-pos"><div class="mock-board-top"><strong>SI POS · ${vi?'Trung tâm vận hành':'Operations hub'}</strong><img src="../../assets/nexora-logo-light.png" alt="Nexora Touch"></div><div class="mock-stats"><span>1<small>${vi?'Tiếp đón':'Check-in'}</small></span><span>2<small>Turn Board</small></span><span>3<small>Checkout</small></span></div><div class="mock-pos-flow">${row('calendar',vi?'Lịch hẹn':'Appointments')}${row('repeat','Turn Board')}${row('list',vi?'Phiếu dịch vụ':'Service tickets')}${row('chart',vi?'Thanh toán & doanh số':'Checkout & sales')}</div></div>`;
      case 'one-qr': return `<div class="mock-qr-layout"><div class="mock-qr-stand"><div class="mock-qr" aria-label="${vi?'Minh họa mã QR':'QR illustration'}">${Array.from({length:49}, (_,i) => `<i class="${[0,1,2,3,4,5,6,7,13,14,20,21,27,28,29,30,31,32,33,34,35,41,42,43,44,45,46,47,48,9,11,17,23,25,37,39,18,24,38].includes(i)?'filled':''}"></i>`).join('')}</div><small>One QR</small></div><span class="mock-flow-arrow" aria-hidden="true">${directionIcon('right')}</span><div class="mock-qr-phone"><div class="mock-qr-phone-top"><span></span>NEXORA TOUCH</div><div class="mock-qr-menu"><strong>${vi?'Menu của tiệm':'Salon menu'}</strong><small>${vi?'Các mục do doanh nghiệp cấu hình':'Items configured by the business'}</small>${row('usercheck',vi?'Xác nhận đến tiệm':'Check in')}${row('calendar',vi?'Đặt lịch':'Book')}${row('list',vi?'Dịch vụ & giá':'Services & prices')}${row('tag',vi?'Ưu đãi':'Offers')}${row('star',vi?'Đánh giá':'Reviews')}${row('card',vi?'Tiền boa & thanh toán':'Tip & pay')}<em>${vi?'Khách chọn mục cần dùng':'Guest chooses an action'}</em></div></div></div>`;
      case 'payments-payouts': return `<div class="mock-board"><div class="mock-board-top"><strong>Payments & Payouts</strong><span>ACTIVITY</span></div>${row('wallet',featureNames[0])}${row('coins',featureNames[1])}${row('send',featureNames[2])}</div>`;
      case 'ai-hub': return `<div class="mock-board"><div class="mock-board-top"><strong>AI Hub</strong><span>ASSISTANTS</span></div><div class="mock-two"><div><b>${lineIcon('headset')}</b><strong>AI Receptionist</strong><small>${vi?'Lịch hẹn · Cuộc gọi':'Bookings · Calls'}</small></div><div><b>${lineIcon('sparkle')}</b><strong>Marketing Assistant</strong><small>SMS · Campaigns</small></div></div></div>`;
      case 'ai-voice-sms': return `<div class="mock-board"><div class="mock-board-top"><strong>AI Voice SMS</strong><span>AI HUB</span></div>${row('phone',vi?'Hướng dẫn AI Voice':'AI Voice setup guide')}${row('message',vi?'Chiến dịch SMS':'SMS Campaigns')}${row('list',vi?'Nhật ký cuộc gọi':'Call log')}</div>`;
      case 'ai-marketing': return `<div class="mock-board"><div class="mock-board-top"><strong>AI Marketing Tool</strong><span>CAMPAIGNS</span></div><div class="mock-marketing-steps"><span>${vi?'Nhóm khách':'Audience'}</span><b>${directionIcon('right')}</b><span>${vi?'Nội dung':'Content'}</span><b>${directionIcon('right')}</b><span>${vi?'Kết quả':'Results'}</span></div>${row('message','SMS Campaigns')}${row('tag',vi?'Ưu đãi POS':'POS offers')}</div>`;
      case 'spin-wheel': {
        const prizeKinds = ['percent','gift','care','percent','gift','care','gift','empty'];
        const segments = prizeKinds.map((kind,index) => {
          const angle = index * 45 + 22.5;
          return `<span class="mock-wheel-segment" style="transform:translate(-50%,-50%) rotate(${angle}deg) translateY(calc(var(--mock-wheel-radius)*-1)) rotate(${-angle}deg)">${spinWheelIcon(kind)}</span>`;
        }).join('');
        const details = [
          ['wheel',vi?'Chọn kiểu thiết kế và số ô':'Template and segments'],
          ['gift',vi?'Ảnh, tên và số lượng giải':'Prize image, name, quantity'],
          ['percent',vi?'Tỷ lệ trúng':'Winning chance'],
          ['rules',vi?'Thời gian và lượt quay':'Game rules']
        ];
        return `<div class="mock-board spin-product-preview"><div class="mock-board-top"><strong>Spin Wheel</strong><span>${vi?'VÒNG QUAY SỐ · BẢN XEM TRƯỚC':'DIGITAL WHEEL · PREVIEW'}</span></div><div class="mock-wheel-layout"><div class="mock-wheel" role="img" aria-label="${vi?'Vòng quay số minh họa với tám ô giải':'Digital preview wheel with eight segments'}">${segments}</div><div class="mock-wheel-actions"><small>${vi?'THIẾT LẬP CHIẾN DỊCH':'CAMPAIGN SETUP'}</small>${details.map(([kind,title])=>`<span>${spinWheelIcon(kind)}<b>${title}</b></span>`).join('')}</div></div></div>`;
      }
      case 'reviews': return `<div class="mock-board"><div class="mock-board-top"><strong>Reviews</strong><span>FEEDBACK</span></div><div class="mock-review"><span>★★★★★</span><div class="mock-skeleton"></div><div class="mock-skeleton short"></div><small>${vi?'Phản hồi sau dịch vụ':'After-service feedback'}</small></div></div>`;
      case 'gift-card-center': return `<div class="mock-gift"><div class="mock-gift-card"><small>NEXORA TOUCH</small><strong>GIFT CARD</strong><span>${lineIcon('gift')}</span></div><div class="mock-gift-side">${row('gift',vi?'Phát hành thẻ':'Issue card')}${row('files',vi?'Quản lý thẻ':'Manage cards')}${row('qr',vi?'Thanh toán bằng thẻ':'Redeem card')}</div></div>`;
      case 'analytics': return `<div class="mock-board"><div class="mock-board-top"><strong>Analytics</strong><span>TRENDS</span></div><div class="mock-chart">${[34,60,47,77,56,88,68,96].map(n=>`<span style="height:${n}%"></span>`).join('')}</div><div class="mock-chart-footer"><span>${vi?'Xu hướng tip':'Tip trends'}</span><span>QR</span></div></div>`;
      case 'community': return `<div class="mock-board mock-community-board"><div class="mock-board-top"><strong>Community</strong><span>${vi?'BẢN XEM TRƯỚC TƯƠNG TÁC':'INTERACTIVE PREVIEW'}</span></div><div class="mock-community-tabs"><span>${vi?'Bảng tin':'Feed'}</span><span>${vi?'Nhóm & Chợ':'Groups & Market'}</span><span>Fanpage</span></div><div class="mock-community-post"><span class="mock-community-avatar">N</span><div><strong>${vi?'Tiệm trong khu vực':'Local salon'}</strong><small>${vi?'Tin, hỏi đáp & mẹo nghề':'Updates, questions & tips'}</small></div></div><div class="mock-community-detail"><span>${lineIcon('briefcase')} ${vi?'Việc làm & Ca làm thêm':'Jobs & extra shifts'}</span><span>${lineIcon('tag')} Deal & Coupon</span></div><small class="mock-community-foot">${vi?'Bản xem trước tại máy · chưa kết nối hệ thống thật':'Local preview · not connected to live services'}</small></div>`;
      case 'tax-iq': return `<div class="mock-board"><div class="mock-board-top"><strong>Tax IQ</strong><span>${vi?'ĐỀ XUẤT':'PROPOSED'}</span></div>${row('wallet',featureNames[0])}${row('chart',featureNames[1])}${row('receipt',featureNames[2])}</div>`;
      default: return '';
    }
  }

  function paintScene() {
    const scenes = data.scenes[lang] || data.scenes.en;
    const [title, copy] = scenes[sceneIndex];
    all('[data-scene-title]').forEach(node => node.textContent = title);
    all('[data-scene-copy]').forEach(node => node.textContent = copy);
    document.querySelector('.display-icon').innerHTML = lineIcon((featureIconNames[data.slug] || [])[sceneIndex] || 'sparkle');
    all('.scenario-button').forEach((button, index) => {
      button.setAttribute('aria-selected', index === sceneIndex ? 'true' : 'false');
      button.tabIndex = index === sceneIndex ? 0 : -1;
    });
  }

  function render() {
    const labels = data.labels[lang] || data.labels.en;
    const uiLanguage = lang === 'vi' ? 'vi' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    select.value = lang;
    all('[data-label]').forEach(node => node.textContent = labels[Number(node.dataset.label)]);
    all('[data-ui-vi][data-ui-en]').forEach(node => {
      node.textContent = node.getAttribute(`data-ui-${uiLanguage}`);
    });
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll?.firstChild?.nodeType === Node.TEXT_NODE) heroScroll.firstChild.nodeValue = uiLanguage === 'vi' ? 'CUỘN ĐỂ KHÁM PHÁ ' : 'SCROLL TO EXPLORE ';
    document.querySelector('.top nav').setAttribute('aria-label', uiLanguage === 'vi' ? 'Điều hướng sản phẩm' : 'Product navigation');
    select.setAttribute('aria-label', uiLanguage === 'vi' ? 'Ngôn ngữ' : 'Language');
    document.querySelector('.breadcrumb')?.setAttribute('aria-label', uiLanguage === 'vi' ? 'Đường dẫn trang' : 'Breadcrumb');
    document.querySelector('.hero-visual').setAttribute('aria-label', uiLanguage === 'vi' ? 'Minh họa sản phẩm' : 'Product illustration');
    document.querySelector('.scenario-list').setAttribute('aria-label', uiLanguage === 'vi' ? 'Tình huống sử dụng sản phẩm' : 'Product scenarios');
    document.querySelector('.product-footer-bottom nav').setAttribute('aria-label', uiLanguage === 'vi' ? 'Liên kết pháp lý và hệ sinh thái' : 'Legal and ecosystem links');
    document.querySelector('#overview h2').textContent = lang === 'vi'
      ? `${data.name} là gì?` : `What is ${data.name}?`;
    document.querySelector('#features h2').textContent = lang === 'vi'
      ? `Khám phá ${data.name} qua từng tính năng`
      : `Explore ${data.name} by feature`;
    all('[data-home-vi][data-home-en]').forEach(node => {
      node.textContent = node.getAttribute(`data-home-${lang === 'vi' ? 'vi' : 'en'}`);
    });
    document.querySelector('.home-link').setAttribute('aria-label', lang === 'vi' ? 'Về trang chủ' : 'Back to home');
    all('[data-status]').forEach(node => node.textContent = pick(data.old.status));
    const heroLead = pick(data.lead);
    const heroDeck = pick(data.deck);
    all('[data-lead]').forEach(node => node.textContent = heroLead);
    all('[data-deck]').forEach(node => {
      const copy = node.closest('.journey') && data.journeyDescription
        ? data.journeyDescription[lang]
        : heroDeck;
      node.textContent = copy;
      node.hidden = !copy;
    });
    hero.setAttribute('aria-label', lang === 'vi' ? `Ảnh giới thiệu ${data.name}` : `${data.name} photo slideshow`);
    hero.querySelector('[data-hero-industry]').textContent = data.slug === 'community'
      ? (lang === 'vi' ? 'CỘNG ĐỒNG NGÀNH LÀM ĐẸP' : 'BEAUTY COMMUNITY SCENES')
      : (lang === 'vi' ? 'MINH HỌA CHO TIỆM LÀM ĐẸP' : 'SALON INDUSTRY SCENES');
    hero.querySelector('[data-hero-prev]').setAttribute('aria-label', lang === 'vi' ? 'Ảnh trước' : 'Previous image');
    hero.querySelector('[data-hero-next]').setAttribute('aria-label', lang === 'vi' ? 'Ảnh tiếp theo' : 'Next image');
    all('[data-hero-dot]').forEach((dot, index) => dot.setAttribute('aria-label', lang === 'vi' ? `Xem ảnh ${index + 1}` : `View image ${index + 1}`));
    all('[data-summary]').forEach(node => node.textContent = pick(data.old.summary));
    all('[data-connect]').forEach(node => node.textContent = pick(data.connect));
    const map = document.querySelector('.ecosystem-map');
    if (map) {
      map.setAttribute('aria-label', lang === 'vi' ? 'Khám phá 12 sản phẩm Nexora Touch' : 'Explore 12 Nexora Touch products');
      all('.ecosystem-map-hint[data-vi][data-en]').forEach(node => {
        node.textContent = node.getAttribute(`data-${lang === 'vi' ? 'vi' : 'en'}`);
      });
      all('.ecosystem-node').forEach(node => node.setAttribute('aria-label', `${lang === 'vi' ? 'Khám phá' : 'Explore'} ${node.title}`));
      paintEcosystem();
      scheduleEcosystem();
    }
    all('[data-note]').forEach(node => node.textContent = pick(data.note));
    all('[data-feature-intro]').forEach(node => node.textContent = pick(data.old.headline));
    const storyLanguage = lang === 'vi' ? 'vi' : 'en';
    const storyLabels = data.slug === 'community'
      ? (storyLanguage === 'vi'
        ? {problem:'Điểm nghẽn hiện tại', goal:'Mục tiêu Community', how:'Cách cộng đồng vận hành', value:'Giá trị mang lại'}
        : {problem:'The current challenge', goal:'The Community goal', how:'How the community works', value:'The value it brings'})
      : (storyLanguage === 'vi'
        ? {problem:'Vấn đề doanh nghiệp gặp', goal:'Sản phẩm giúp gì', how:'Vận hành ra sao', value:'Giá trị mang lại'}
        : {problem:'The business challenge', goal:'What the product does', how:'How it works', value:'The value for your business'});
    document.querySelector('[data-story-nav]').textContent = storyLanguage === 'vi' ? 'Giá trị' : 'Value';
    document.querySelector('[data-video-nav]').textContent = storyLanguage === 'vi' ? 'Video' : 'Video';
    document.querySelector('[data-story-kicker]').textContent = data.slug === 'community'
      ? (storyLanguage === 'vi' ? 'DÀNH CHO CỘNG ĐỒNG' : 'FOR THE COMMUNITY')
      : (storyLanguage === 'vi' ? 'DÀNH CHO DOANH NGHIỆP' : 'FOR YOUR BUSINESS');
    document.querySelector('[data-video-kicker]').textContent = storyLanguage === 'vi' ? 'VIDEO GIỚI THIỆU' : 'PRODUCT VIDEO';
    document.querySelector('[data-story-heading]').textContent = data.slug === 'community'
      ? (storyLanguage === 'vi' ? 'Community mở ra hành trình nào cho người dùng?' : 'What journeys could Community bring together?')
      : (storyLanguage === 'vi' ? 'Sản phẩm giải quyết gì và vận hành ra sao?' : 'What does this product solve and how does it work?');
    all('[data-story-label]').forEach(node => node.textContent = storyLabels[node.dataset.storyLabel]);
    all('[data-story-field]').forEach(node => node.textContent = data.story[node.dataset.storyField][storyLanguage]);
    all('.voice-explainer [data-vi][data-en]').forEach(node => {
      node.textContent = node.getAttribute(`data-${storyLanguage}`);
    });
    all('.voice-hero-status [data-vi][data-en]').forEach(node => {
      node.textContent = node.getAttribute(`data-${storyLanguage}`);
    });
    all('.oneqr-showcase [data-vi][data-en], .oneqr-hero-demo [data-vi][data-en], .oneqr-merchant [data-vi][data-en]').forEach(node => {
      node.textContent = node.getAttribute(`data-${storyLanguage}`);
    });
    if (oneqrDemo) {
      oneqrDemo.setAttribute('aria-label', storyLanguage === 'vi' ? 'Menu One QR trên điện thoại, bản minh họa' : 'Illustrative One QR phone menu');
      oneqrDemo.querySelector('.oneqr-demo-options').setAttribute('aria-label', storyLanguage === 'vi' ? 'Chọn một mục trong menu minh họa' : 'Choose an item from the sample menu');
    }
    const oneqrPair = document.querySelector('.oneqr-menu-pair');
    if (oneqrPair) oneqrPair.setAttribute('aria-label', storyLanguage === 'vi' ? 'Hai ví dụ về menu One QR do doanh nghiệp cấu hình' : 'Two examples of business-configured One QR menus');
    const oneqrRoute = document.querySelector('.oneqr-merchant-route');
    if (oneqrRoute) oneqrRoute.setAttribute('aria-label', storyLanguage === 'vi' ? 'Đường dẫn đến One QR trong dashboard' : 'Path to One QR in the dashboard');
    paintOneQrChoice();
    all('.community-roles [data-vi][data-en]').forEach(node => {
      node.textContent = node.getAttribute(`data-${storyLanguage}`);
    });
    all('.community-hero-panel [data-vi][data-en]').forEach(node => {
      node.textContent = node.getAttribute(`data-${storyLanguage}`);
    });
    document.querySelector('[data-video-title]').textContent = storyLanguage === 'vi'
      ? `Video giới thiệu ${data.name}` : `Introducing ${data.name} on video`;
    const hasVideo = !document.querySelector('.video-placeholder');
    document.querySelector('[data-video-description]').textContent = storyLanguage === 'vi'
      ? (hasVideo ? 'Xem quy trình và các tính năng chính của sản phẩm qua video.' : 'Video giới thiệu quy trình và tính năng chính sẽ được cập nhật tại đây.')
      : (hasVideo ? 'See the product workflow and key features in the video.' : 'A video walkthrough of the workflow and key features will be added here.');
    const pending = document.querySelector('[data-video-pending]');
    if (pending) pending.textContent = storyLanguage === 'vi' ? 'Video giới thiệu đang được cập nhật' : 'Product video coming soon';
    const video = document.querySelector('.video-placeholder, .video-player');
    if (video) {
      const videoLabel = storyLanguage === 'vi' ? `Video giới thiệu ${data.name}` : `Introduction video for ${data.name}`;
      if (video.matches('.video-placeholder')) video.setAttribute('aria-label', `${videoLabel}: ${pending.textContent}`);
      else if (video.tagName === 'IFRAME') video.title = videoLabel;
      else video.setAttribute('aria-label', videoLabel);
    }
    const bonus = document.querySelector('[data-bonus]');
    if (data.bonus) {
      bonus.hidden = false;
      bonus.textContent = pick(data.bonus);
    }

    const scenes = data.scenes[lang] || data.scenes.en;
    document.querySelector('.scenario-list').innerHTML = scenes.map(([title], index) =>
      `<button class="scenario-button" type="button" role="tab" aria-selected="${index === sceneIndex}" data-scene="${index}"><span><strong>${escapeHTML(title)}</strong></span><span aria-hidden="true">${directionIcon('right')}</span></button>`
    ).join('');
    all('.scenario-button').forEach(button => button.addEventListener('click', () => {
      sceneIndex = Number(button.dataset.scene);
      paintScene();
    }));
    paintScene();
    const displayBody = document.querySelector('.display-body');
    if (!displayBody.querySelector('.display-copy')) {
      const displayCopy = document.createElement('div');
      displayCopy.className = 'display-copy';
      ['.display-icon', '.display-kicker', 'h3[data-scene-title]', 'p[data-scene-copy]'].forEach(selector => {
        displayCopy.append(displayBody.querySelector(selector));
      });
      displayBody.prepend(displayCopy);
    }
    const mockTarget = document.querySelector('.product-mock') || document.querySelector('.display-line');
    if (mockTarget.classList.contains('display-line')) {
      mockTarget.outerHTML = `<div class="product-mock">${productMock()}</div>`;
    } else {
      mockTarget.innerHTML = productMock();
    }

    const features = data.old.features[lang] || data.old.features.en;
    document.getElementById('feature-toc').innerHTML = features.map(([title], index) =>
      `<a href="#feature-${String(index + 1).padStart(2,'0')}">${escapeHTML(title)}</a>`
    ).join('');
    document.getElementById('feature-grid').innerHTML = features.map(([title, desc], index) => {
      const icon = (featureIconNames[data.slug] || [])[index] || 'sparkle';
      return `<article class="feature-card" id="feature-${String(index + 1).padStart(2,'0')}"><div class="feature-card-head"><span class="feature-icon" aria-hidden="true">${lineIcon(icon)}</span></div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(desc)}</p></article>`;
    }).join('');

    const steps = data.path[lang] || data.path.en;
    document.getElementById('journey-steps').innerHTML = steps.map((step, index) =>
      `<div class="journey-step"><span>${escapeHTML(labels[16])} ${index + 1}</span><strong>${escapeHTML(step)}</strong></div>`
    ).join('');

    let faq = lang === 'vi' ? [
      [`${data.name} giúp giải quyết việc gì?`, data.deck.vi],
      [`${data.name} hoạt động như thế nào?`, data.story.how.vi],
      [`${data.name} gồm những tính năng nào?`, features.map(([title]) => title).join(', ') + '.'],
      [`${data.name} hiện đã sử dụng được chưa?`, `${data.old.status.vi}. ${data.note.vi}`],
      [`Sản phẩm kết nối với phần nào khác?`, data.connect.vi]
    ] : [
      [translateText(`What is ${data.name} for?`), pick(data.deck)],
      [translateText(`How does ${data.name} work?`), pick(data.story.how)],
      [translateText(`What features are included in ${data.name}?`), features.map(([title]) => title).join(', ') + '.'],
      [translateText(`Is ${data.name} available now?`), `${pick(data.old.status)}. ${pick(data.note)}`],
      [translateText('How does it connect to other products?'), pick(data.connect)]
    ];
    if (data.faq) faq = data.faq[lang] || data.faq.en;
    if (data.slug === 'ai-voice-sms') {
      faq = lang === 'vi' ? [
        ['AI Receptionist là gì?', 'Đây là lễ tân bằng giọng nói, tiếp nhận cuộc gọi theo chế độ tiệm chọn, trả lời thông tin đã thiết lập và ghi nhận nhu cầu của khách khi nhân viên đang bận.'],
        ['AI có thể kiểm tra lịch thợ và nhận biết khách cũ không?', 'Khi đã kết nối lịch và hồ sơ khách, AI có thể đối chiếu số điện thoại, dịch vụ, thợ và giờ trống trước khi đề xuất lịch hẹn. Nhân viên nên kiểm tra yêu cầu cần xác nhận hoặc xử lý đặc biệt.'],
        ['SMS phối hợp với AI Voice như thế nào?', 'Sau cuộc gọi, tiệm có thể gửi xác nhận lịch, nhắc hẹn và tin chăm sóc. Tin tự động theo check-in hoặc thanh toán chỉ chạy khi luồng tương ứng được cấu hình và bật.'],
        ['Có thể gửi chiến dịch cho từng nhóm khách không?', 'SMS Campaigns có các nhóm như khách mới, 15/30/60 ngày chưa quay lại, VIP và sinh nhật. Tiệm chọn nhóm, soạn tin, gửi ngay hoặc lên lịch, rồi xem trạng thái gửi.'],
        ['Tiệm cần chuẩn bị gì để bắt đầu?', 'Thiết lập chuyển tiếp số điện thoại, cập nhật thông tin tiệm để AI trả lời, kiểm tra lịch hẹn và quyền SMS; chỉ gửi chiến dịch cho khách đã đồng ý nhận tin.']
      ] : [
        ['What is AI Receptionist?', 'It is a voice assistant that handles calls using the salon’s chosen answering mode, responds with configured information and captures guest needs while staff are busy.'],
        ['Can AI check technician availability and recognize returning guests?', 'When the calendar and guest profiles are connected, AI can match caller numbers, services, technicians and open time slots before suggesting an appointment. Staff should review requests that need confirmation or special handling.'],
        ['How does SMS work with AI Voice?', 'The salon can follow a call with a booking confirmation, reminder or care message. Automated check-in or post-payment texts run only when the relevant flow is configured and enabled.'],
        ['Can I message different customer groups?', 'SMS Campaigns includes groups such as new, 15/30/60-day inactive, VIP and birthday guests. Choose an audience, draft a message, send now or schedule it, and review delivery status.'],
        ['What does a salon need to get started?', 'Set up call forwarding, provide salon information for AI answers, check booking and SMS access, and send campaigns only to guests who have agreed to receive messages.']
      ];
      if (lang !== 'vi' && lang !== 'en') faq = faq.map(([question, answer]) => [translateText(question), translateText(answer)]);
    }
    document.getElementById('faq-list').innerHTML = faq.map(([question, answer]) =>
      `<details><summary>${escapeHTML(question)}</summary><p>${escapeHTML(answer)}</p></details>`
    ).join('');
    document.title = data.seoTitle[lang] || data.seoTitle.en;
    paintHeroSlide();
    syncHeroTimer();
    normalizeDirectionalIcons();
    translateRenderedCopy();
  }

  hero.querySelector('[data-hero-prev]').addEventListener('click', () => {
    heroIndex = (heroIndex + 2) % 3;
    paintHeroSlide();
    syncHeroTimer();
  });
  hero.querySelector('[data-hero-next]').addEventListener('click', () => {
    heroIndex = (heroIndex + 1) % 3;
    paintHeroSlide();
    syncHeroTimer();
  });
  all('[data-hero-dot]').forEach(dot => dot.addEventListener('click', () => {
    heroIndex = Number(dot.dataset.heroDot);
    paintHeroSlide();
    syncHeroTimer();
  }));
  hero.querySelector('[data-hero-play]').addEventListener('click', () => {
    heroPaused = !heroPaused;
    syncHeroTimer();
  });
  all('[data-oneqr-option]').forEach(option => option.addEventListener('click', () => {
    all('[data-oneqr-option]').forEach(item => item.setAttribute('aria-pressed', String(item === option)));
    paintOneQrChoice();
    heroPaused = true;
    syncHeroTimer();
  }));
  hero.addEventListener('mouseenter', () => { heroHovered = true; syncHeroTimer(); });
  hero.addEventListener('mouseleave', () => { heroHovered = false; syncHeroTimer(); });
  hero.addEventListener('focusin', syncHeroTimer);
  hero.addEventListener('focusout', () => setTimeout(syncHeroTimer, 0));
  document.addEventListener('visibilitychange', syncHeroTimer);
  let touchStart;
  hero.addEventListener('touchstart', event => {
    touchStart = {x:event.changedTouches[0].screenX, y:event.changedTouches[0].screenY};
  }, {passive:true});
  hero.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].screenX - touchStart.x;
    const dy = event.changedTouches[0].screenY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      heroIndex = (heroIndex + (dx < 0 ? 1 : 2)) % 3;
      paintHeroSlide();
      syncHeroTimer();
    }
  }, {passive:true});

  select.addEventListener('change', event => {
    lang = event.target.value;
    localStorage.setItem('nexora-dashboard-language-v1', lang);
    render();
  });
  render();
  if (ecosystemMap) {
    ecosystemVisual.addEventListener('pointerenter', scheduleEcosystem);
    ecosystemVisual.addEventListener('pointerleave', scheduleEcosystem);
    ecosystemVisual.addEventListener('focusin', scheduleEcosystem);
    ecosystemVisual.addEventListener('focusout', () => requestAnimationFrame(scheduleEcosystem));
    document.addEventListener('visibilitychange', scheduleEcosystem);
    reducedMotion.addEventListener?.('change', scheduleEcosystem);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        ecosystemVisible = entries[0].isIntersecting;
        scheduleEcosystem();
      }, {threshold:0.2}).observe(ecosystemVisual);
    } else {
      ecosystemVisible = true;
      scheduleEcosystem();
    }
  }
})();
