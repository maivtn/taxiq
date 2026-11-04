(() => {
  const stage = document.getElementById('eco-stage');
  if (!stage) return;

  // Public platform URLs only. API endpoints remain unset until the platform
  // owners provide and approve their documentation and credentials.
  const vlink = 'https://vlinkpay.com/';
  const map = 'https://cryptomap360.com/#ecosystem';
  const nexora = 'https://nexoratouch.com/';
  const apiDocs = {
    // Add only verified, public API documentation URLs using the node IDs below.
  };
  const nodes = [
    {id:'tokenization',name:'Tokenization',icon:'◈',url:map,related:['gift-card-center'],vi:'Lớp tài sản số được giới thiệu trong sơ đồ VLINKPAY.',en:'A digital-asset layer shown in the VLINKPAY ecosystem.'},
    {id:'wallet',name:'VLINKPAY Wallet',icon:'▣',url:vlink,related:['one-qr','payments-payouts'],vi:'Điểm truy cập ví trong mạng lưới VLINKPAY.',en:'Wallet access within the VLINKPAY network.'},
    {id:'crypto-card',name:'Crypto Card',icon:'▤',url:map,related:['payments-payouts'],vi:'Nhánh thẻ chi tiêu được giới thiệu trên CRYPTOMAP360.',en:'The card-spending branch shown on CRYPTOMAP360.'},
    {id:'merchant',name:'Merchant Solutions',icon:'⌘',url:vlink,related:['si-pos','payments-payouts','tax-iq'],vi:'Các giải pháp hướng tới doanh nghiệp và hoạt động bán hàng.',en:'Business-facing solutions for merchant activity.'},
    {id:'charity',name:'Charity',icon:'♡',url:map,related:['community'],vi:'Nhánh cộng đồng và đóng góp trong hệ sinh thái.',en:'The community and giving branch of the ecosystem.'},
    {id:'gift',name:'Gift Card Center',icon:'◇',url:vlink,related:['gift-card-center','si-pos'],vi:'Quà tặng số và hành trình phát hành, sử dụng thẻ.',en:'Digital gifts and the card issuance and redemption journey.'},
    {id:'merchant-atm',name:'Merchant ATM',icon:'▥',url:vlink,related:['payments-payouts'],vi:'Mạng lưới điểm giao dịch dành cho merchant.',en:'A network of merchant transaction locations.'},
    {id:'mobile-atm',name:'Mobile ATM',icon:'✺',url:vlink,related:['payments-payouts'],vi:'Điểm chạm giao dịch di động trong mạng lưới.',en:'Mobile transaction touchpoints in the network.'},
    {id:'nailhub',name:'Nailhub.ai',icon:'✦',url:'https://nailhub.ai/',related:['community','si-pos'],vi:'Nền tảng kết nối salon, thợ nail và cơ hội việc làm.',en:'A platform connecting salons, nail professionals and work opportunities.'},
    {id:'exchange',name:'Exchange Hub',icon:'⇄',url:map,related:['payments-payouts'],vi:'Nhánh trao đổi được giới thiệu trong sơ đồ VLINKPAY.',en:'The exchange branch shown in the VLINKPAY ecosystem.'},
    {id:'gateway',name:'Payment Gateway',icon:'↗',url:vlink,related:['one-qr','payments-payouts'],vi:'Lớp thanh toán dành cho hoạt động thương mại.',en:'A payment layer for commerce activity.'},
    {id:'program',name:'Program Hub',icon:'✧',url:map,related:['ai-hub','ai-voice-sms','ai-marketing','spin-wheel','analytics','reviews'],vi:'Không gian chương trình trong mạng lưới VLINKPAY.',en:'The program branch within the VLINKPAY network.'},
    {id:'cryptomap360',name:'CRYPTOMAP360',icon:'◎',url:'https://cryptomap360.com/',related:['community','analytics'],type:'platform',vi:'Nền tảng khám phá địa điểm và doanh nghiệp trong hệ sinh thái.',en:'A platform for discovering places and businesses in the ecosystem.'},
    {id:'nexora-touch',name:'NEXORA TOUCH',icon:'✦',url:nexora,related:['si-pos','one-qr','payments-payouts','ai-hub','reviews','gift-card-center','analytics','community','tax-iq','ai-voice-sms','ai-marketing','spin-wheel'],type:'platform',source:'nexora',vi:'Nền tảng vận hành và chăm sóc khách hàng với 12 sản phẩm NEXORA TOUCH.',en:'The service-business platform connecting all 12 NEXORA TOUCH products.'}
  ];
  const products = {
    'si-pos':['SI POS','products/si-pos/index.html','▤'],
    'one-qr':['One QR','products/one-qr/index.html','▧'],
    'payments-payouts':['Payments & Payouts','products/payments-payouts/index.html','$'],
    'ai-hub':['AI Hub','products/ai-hub/index.html','✧'],
    'reviews':['Reviews','products/reviews/index.html','☆'],
    'gift-card-center':['Gift Card Center','products/gift-card-center/index.html','▣'],
    'analytics':['Analytics','products/analytics/index.html','▥'],
    'community':['Community','products/community/index.html','♧'],
    'tax-iq':['TAX IQ','products/tax-iq/index.html','▦'],
    'ai-voice-sms':['AI Voice SMS','products/ai-voice-sms/index.html','◉'],
    'ai-marketing':['AI Marketing Tool','products/ai-marketing/index.html','✧'],
    'spin-wheel':['Spin Wheel','products/spin-wheel/index.html','◉']
  };
  const words = {
    vi:['BẢN ĐỒ HỆ SINH THÁI','thành phần','SẢN PHẨM ĐANG XEM','MỐI LIÊN HỆ CÓ THỂ CÓ','API sẽ kết nối khi có endpoint được xác nhận','Xem nền tảng','Chọn sản phẩm để xem liên kết','12 sản phẩm NEXORA TOUCH','Chọn một sản phẩm để xem các mối liên hệ trong hệ sinh thái.','Xem trang giới thiệu'],
    en:['ECOSYSTEM MAP','components','SELECTED PRODUCT','POSSIBLE CONNECTIONS','API link pending a confirmed endpoint','Visit platform','Select a product to explore its connections','12 NEXORA TOUCH products','Select a product to explore its ecosystem connections.','Explore product'],
    zh:['生态系统地图','组成部分','所选产品','可能的关联','API 链接等待确认接口','查看平台','选择产品查看关联','12 款 NEXORA TOUCH 产品','选择产品以查看其在生态系统中的关联。','了解产品'],
    ko:['생태계 지도','구성 요소','선택한 제품','가능한 연결','API 연결은 엔드포인트 확인 후 제공','플랫폼 보기','제품을 선택해 연결을 살펴보세요','NEXORA TOUCH 제품 12개','제품을 선택하여 생태계 연결을 살펴보세요.','제품 살펴보기'],
    es:['MAPA DEL ECOSISTEMA','componentes','PRODUCTO SELECCIONADO','POSIBLES CONEXIONES','API pendiente de un endpoint confirmado','Ver plataforma','Elige un producto para ver sus conexiones','12 productos NEXORA TOUCH','Elige un producto para explorar sus conexiones en el ecosistema.','Explorar producto'],
    ja:['エコシステムマップ','構成要素','選択中の製品','考えられるつながり','API はエンドポイント確認後に接続','プラットフォームを見る','製品を選んでつながりを見る','NEXORA TOUCH の12製品','製品を選択してエコシステム内のつながりを確認してください。','製品を見る'],
    th:['แผนที่ระบบนิเวศ','องค์ประกอบ','ผลิตภัณฑ์ที่เลือก','ความเชื่อมโยงที่เป็นไปได้','รอยืนยัน API endpoint','ดูแพลตฟอร์ม','เลือกผลิตภัณฑ์เพื่อดูการเชื่อมต่อ','12 ผลิตภัณฑ์ NEXORA TOUCH','เลือกผลิตภัณฑ์เพื่อดูความเชื่อมโยงในระบบนิเวศ','ดูผลิตภัณฑ์'],
    ar:['خريطة المنظومة','مكونات','المنتج المحدد','روابط محتملة','رابط API بانتظار تأكيد نقطة الاتصال','زيارة المنصة','اختر منتجًا لاستكشاف الروابط','12 منتجًا من NEXORA TOUCH','اختر منتجًا لاستكشاف روابطه في المنظومة.','استكشف المنتج'],
    fr:['CARTE DE L’ÉCOSYSTÈME','composants','PRODUIT SÉLECTIONNÉ','CONNEXIONS POSSIBLES','API en attente d’un endpoint confirmé','Voir la plateforme','Choisissez un produit pour voir ses liens','12 produits NEXORA TOUCH','Choisissez un produit pour découvrir ses liens dans l’écosystème.','Découvrir le produit']
  };
  const canvas = document.getElementById('eco-canvas');
  const grid = document.getElementById('eco-node-grid');
  const platformGrid = document.getElementById('eco-platform-grid');
  const svg = document.getElementById('eco-wires');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'gift';
  let selectedNexora = 'gift-card-center';
  let lang = document.documentElement.lang || 'vi';
  const nexoraGrid = document.getElementById('eco-nexora-grid');
  const detail = document.getElementById('eco-detail');
  const summary = detail.querySelector('.eco-nexora-summary');
  const tourToggle = document.getElementById('eco-tour-toggle');
  const tourLabels = {
    vi:['Phát hiệu ứng','Tạm dừng hiệu ứng'], en:['Play animation','Pause animation'],
    zh:['播放动画','暂停动画'], ko:['애니메이션 재생','애니메이션 일시정지'],
    es:['Reproducir animación','Pausar animación'], ja:['アニメーションを再生','アニメーションを一時停止'],
    th:['เล่นภาพเคลื่อนไหว','หยุดภาพเคลื่อนไหวชั่วคราว'], ar:['تشغيل الحركة','إيقاف الحركة مؤقتًا'],
    fr:['Lancer l’animation','Mettre l’animation en pause']
  };
  const productIds = Object.keys(products);
  const laneDefs = [
    ['wallet','merchant-atm','mobile-atm','gateway'],
    ['merchant','gift','nailhub','charity'],
    ['tokenization','crypto-card','exchange','program']
  ];
  const laneLabels = {
    vi:['THANH TOÁN & GIAO DỊCH','DOANH NGHIỆP & CỘNG ĐỒNG','TÀI SẢN & CHƯƠNG TRÌNH'],
    en:['PAYMENTS & TRANSACTIONS','BUSINESS & COMMUNITY','ASSETS & PROGRAMS'],
    zh:['支付与交易','商户与社区','资产与计划'],
    ko:['결제 및 거래','비즈니스 및 커뮤니티','자산 및 프로그램'],
    es:['PAGOS Y TRANSACCIONES','NEGOCIOS Y COMUNIDAD','ACTIVOS Y PROGRAMAS'],
    ja:['決済と取引','ビジネスとコミュニティ','資産とプログラム'],
    th:['การชำระเงินและธุรกรรม','ธุรกิจและชุมชน','สินทรัพย์และโปรแกรม'],
    ar:['المدفوعات والمعاملات','الأعمال والمجتمع','الأصول والبرامج'],
    fr:['PAIEMENTS ET TRANSACTIONS','ENTREPRISES ET COMMUNAUTÉ','ACTIFS ET PROGRAMMES']
  };
  const displayOrder = laneDefs.flat().concat(['cryptomap360','nexora-touch']);
  const laneByNode = new Map();
  laneDefs.forEach((ids, index) => {
    const lane = document.createElement('div');
    lane.className = 'eco-lane';
    const heading = document.createElement('div');
    heading.className = 'eco-lane-heading';
    const title = document.createElement('strong');
    title.className = 'eco-lane-title';
    title.id = `eco-lane-title-${index + 1}`;
    heading.append(title);
    const items = document.createElement('div');
    items.className = 'eco-lane-items';
    lane.setAttribute('role', 'group');
    lane.setAttribute('aria-labelledby', title.id);
    lane.append(heading, items);
    grid.append(lane);
    ids.forEach(id => laneByNode.set(id, items));
  });
  const tourDuration = 5000;
  let tourActive = false;
  let stageVisible = false;
  let tourTimer;
  let lastRenderedProduct;

  function updateTourToggle() {
    const label = (tourLabels[lang] || tourLabels.en)[tourActive ? 1 : 0];
    tourToggle.textContent = tourActive ? 'Ⅱ' : '▶';
    tourToggle.setAttribute('aria-pressed', String(tourActive));
    tourToggle.setAttribute('aria-label', label);
    tourToggle.title = label;
  }

  function scheduleTour() {
    clearTimeout(tourTimer);
    const running = tourActive && stageVisible && !document.hidden && !reducedMotion.matches &&
      !detail.matches(':hover') && !stage.matches(':focus-within');
    detail.classList.toggle('is-touring', running);
    summary.setAttribute('aria-live', running ? 'off' : 'polite');
    if (!running) return;
    tourTimer = setTimeout(() => {
      const next = (productIds.indexOf(selectedNexora) + 1) % productIds.length;
      selectedNexora = productIds[next];
      selected = nodes.find(node => node.related.includes(selectedNexora))?.id || selected;
      renderSelection();
      scheduleTour();
    }, tourDuration);
  }

  function setTour(active) {
    tourActive = active && !reducedMotion.matches;
    updateTourToggle();
    scheduleTour();
  }

  Object.entries(products).forEach(([id, product], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'eco-nexora-item';
    button.dataset.product = id;
    button.style.setProperty('--i', index);
    button.setAttribute('aria-pressed', String(id === selectedNexora));
    const icon = document.createElement('span');
    icon.className = 'eco-nexora-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = product[2];
    const name = document.createElement('strong');
    name.textContent = product[0];
    button.append(icon, name);
    button.addEventListener('click', () => {
      setTour(false);
      selectedNexora = id;
      selected = nodes.find(node => node.related.includes(id))?.id || selected;
      renderSelection();
    });
    nexoraGrid.append(button);
  });

  nodes.forEach(node => {
    const index = displayOrder.indexOf(node.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `eco-node${node.type === 'platform' ? ' eco-platform-node' : ''}`;
    button.dataset.id = node.id;
    button.style.setProperty('--i', index);
    button.setAttribute('aria-label', node.name);
    button.setAttribute('aria-pressed', String(node.id === selected));
    const icon = document.createElement('span');
    icon.className = 'eco-node-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent = node.icon;
    const copy = document.createElement('span');
    copy.className = 'eco-node-copy';
    const name = document.createElement('strong');
    name.textContent = node.name;
    copy.append(name);
    if (node.id === 'nailhub') {
      const logo = document.createElement('img');
      logo.className = 'eco-nailhub-logo';
      logo.src = 'assets/nailhub-logo.svg';
      logo.alt = '';
      logo.setAttribute('aria-hidden', 'true');
      button.append(logo);
    } else if (node.id === 'cryptomap360') {
      const logo = document.createElement('img');
      logo.className = 'eco-cryptomap-logo';
      logo.src = 'assets/cryptomap360-logo.png';
      logo.alt = '';
      logo.setAttribute('aria-hidden', 'true');
      button.append(logo, copy);
    } else if (node.id === 'nexora-touch') {
      const logo = document.createElement('img');
      logo.className = 'eco-node-logo';
      logo.src = 'assets/nexora-logo-light.png';
      logo.alt = '';
      logo.setAttribute('aria-hidden', 'true');
      button.append(logo);
    } else {
      button.append(icon, copy);
    }
    button.addEventListener('click', () => {
      setTour(false);
      selected = node.id;
      selectedNexora = node.related[0];
      renderSelection();
    });
    (node.type === 'platform' ? platformGrid : laneByNode.get(node.id)).append(button);
  });

  function renderSelection() {
    const node = nodes.find(item => item.id === selected);
    document.querySelectorAll('.eco-node').forEach(button => {
      const item = nodes.find(entry => entry.id === button.dataset.id);
      button.setAttribute('aria-pressed', String(button.dataset.id === selected));
      button.classList.toggle('is-related', item.related.includes(selectedNexora));
    });
    nexoraGrid.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.product === selectedNexora));
      button.classList.toggle('is-related', node.related.includes(button.dataset.product));
    });
    const product = products[selectedNexora];
    document.getElementById('eco-nexora-title').textContent = product[0];
    const card = document.querySelector(`.ecosystem-item[href="${product[1]}"]`);
    document.getElementById('eco-nexora-description').textContent = card?.querySelector('span[data-i18n]')?.textContent || '';
    document.getElementById('eco-nexora-link').href = product[1];
    if (selectedNexora !== lastRenderedProduct && !reducedMotion.matches) {
      summary.classList.remove('is-changing');
      void summary.offsetWidth;
      summary.classList.add('is-changing');
    }
    lastRenderedProduct = selectedNexora;
    const related = document.getElementById('eco-related');
    const label = document.createElement('small');
    label.textContent = words[lang][3];
    related.replaceChildren(label, ...nodes.filter(item => item.related.includes(selectedNexora)).map(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.name;
      button.setAttribute('aria-pressed', String(item.id === selected));
      button.addEventListener('click', () => { setTour(false); selected = item.id; renderSelection(); });
      return button;
    }));
    const platform = document.getElementById('eco-platform-link');
    platform.href = node.url;
    platform.setAttribute('aria-label', `${words[lang]?.[5] || words.en[5]}: ${node.name}`);
    const api = document.getElementById('eco-api-link');
    const pending = document.querySelector('[data-eco="apiPending"]');
    if (apiDocs[node.id]) {
      api.href = apiDocs[node.id];
      api.hidden = false;
      pending.hidden = true;
    } else {
      api.removeAttribute('href');
      api.hidden = true;
      pending.hidden = false;
    }
    drawWires();
  }

  function renderLanguage(next) {
    lang = words[next] ? next : 'en';
    updateTourToggle();
    grid.querySelectorAll('.eco-lane-title').forEach((title, index) => {
      title.textContent = (laneLabels[lang] || laneLabels.en)[index];
    });
    document.querySelectorAll('[data-eco]').forEach(element => {
      const keys = ['mapLabel','platforms','selected','touchpoints','apiPending','visitPlatform','selectHint','nexoraProducts','chooseNexora','viewProduct'];
      const index = keys.indexOf(element.dataset.eco);
      if (index !== -1) element.textContent = words[lang][index];
    });
    renderSelection();
  }

  function center(element) {
    let x = element.offsetWidth / 2, y = element.offsetHeight / 2;
    let current = element;
    while (current && current !== canvas) {
      x += current.offsetLeft;
      y += current.offsetTop;
      current = current.offsetParent;
    }
    return {x,y};
  }

  function drawWires() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    svg.replaceChildren();
    const nexora = center(document.getElementById('eco-nexora-hub'));
    const vlink = center(document.getElementById('eco-vlink-hub'));
    function path(d, className) {
      const line = document.createElementNS('http://www.w3.org/2000/svg','path');
      line.setAttribute('d',d);
      line.setAttribute('class',className);
      svg.append(line);
    }
    const activeNode = nodes.find(node => node.id === selected);
    const activeButton = canvas.querySelector(`[data-id="${selected}"]`);
    if (!activeNode || !activeButton) return;
    const point = center(activeButton);
    const sourceHub = document.getElementById(activeNode.source === 'nexora' ? 'eco-nexora-hub' : 'eco-vlink-hub');
    const source = activeNode.source === 'nexora' ? nexora : vlink;
    const startY = source.y + sourceHub.offsetHeight / 2 - 5;
    const distance = Math.max(42, point.y - startY);
    path(`M ${source.x} ${startY} C ${source.x} ${startY + Math.min(72, distance * .35)}, ${point.x} ${point.y - Math.min(72, distance * .35)}, ${point.x} ${point.y}`,'eco-wire is-active');
    const endpoint = document.createElementNS('http://www.w3.org/2000/svg','circle');
    endpoint.setAttribute('cx', point.x);
    endpoint.setAttribute('cy', point.y);
    endpoint.setAttribute('r', 5);
    endpoint.setAttribute('class', 'eco-wire-endpoint');
    svg.append(endpoint);
  }

  tourToggle.addEventListener('click', () => setTour(!tourActive));
  detail.addEventListener('pointerenter', scheduleTour);
  detail.addEventListener('pointerleave', scheduleTour);
  stage.addEventListener('focusin', scheduleTour);
  stage.addEventListener('focusout', () => requestAnimationFrame(scheduleTour));
  document.addEventListener('visibilitychange', scheduleTour);
  reducedMotion.addEventListener?.('change', event => { if (event.matches) setTour(false); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      stageVisible = entries[0].isIntersecting;
      if (stageVisible && !detail.classList.contains('is-revealing')) {
        detail.classList.add('is-revealing');
        setTimeout(() => detail.classList.remove('is-revealing'), 1000);
      }
      scheduleTour();
    }, {threshold:0.2}).observe(stage);
  } else {
    stageVisible = true;
  }
  document.addEventListener('nexora:language-change', event => renderLanguage(event.detail.language));
  window.addEventListener('resize', () => requestAnimationFrame(drawWires), {passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(drawWires)).observe(canvas);
  renderLanguage(lang);
  setTour(true);
  requestAnimationFrame(drawWires);
})();
