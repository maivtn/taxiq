(function () {
  'use strict';

  const GROUPS = [
    { id: 'beauty', icon: '✨', en: 'Beauty & care', vi: 'Làm đẹp & chăm sóc', color: '#fce7f3', items: 'nails~Nail salon & spa~Tiệm nail & spa|hair~Hair salon & barber~Salon tóc & barber|massage~Massage & wellness~Massage & thư giãn|lash~Lash & brow studio~Mi & chân mày|tattoo~Tattoo & piercing~Xăm & khuyên' },
    { id: 'food', icon: '🍽️', en: 'Food & beverage', vi: 'Ẩm thực & đồ uống', color: '#ffedd5', items: 'restaurant~Restaurant~Nhà hàng|cafe~Cafe & bakery~Cà phê & bánh|truck~Food truck~Xe đồ ăn' },
    { id: 'personal', icon: '🧑‍💼', en: 'Personal brand', vi: 'Thương hiệu cá nhân', color: '#e0e7ff', items: 'solo~Independent professional~Chuyên gia độc lập|trainer~Personal trainer~Huấn luyện viên cá nhân|mua~Makeup artist~Chuyên viên trang điểm|coach~Coach & consultant~Huấn luyện & tư vấn|kol~Creator & influencer~Nhà sáng tạo nội dung|freelance~Freelancer~Người làm tự do|photo~Photographer~Nhiếp ảnh gia' },
    { id: 'showbiz', icon: '🎤', en: 'Entertainment talent', vi: 'Nghệ thuật & giải trí', color: '#fae8ff', items: 'artist~Singer & artist~Ca sĩ & nghệ sĩ|songwriter~Songwriter & producer~Nhạc sĩ & nhà sản xuất|band~Band & music group~Ban nhạc|model~Model~Người mẫu|actor~Actor & performer~Diễn viên|mc~MC & host~MC & người dẫn chương trình' },
    { id: 'service', icon: '🛎️', en: 'Everyday services', vi: 'Dịch vụ thường ngày', color: '#dbeafe', items: 'gym~Gym & fitness studio~Phòng gym & fitness|tutor~Tutor & learning service~Gia sư & học tập|ride~Transportation service~Dịch vụ vận chuyển|home~Home service professional~Dịch vụ tại nhà|shopvn~Vietnamese local shop~Cửa hàng Việt' },
    { id: 'store', icon: '🛍️', en: 'Retail & specialty stores', vi: 'Bán lẻ & cửa hàng chuyên biệt', color: '#dcfce7', items: 'retail~Retail store~Cửa hàng bán lẻ|grocery~Grocery & market~Tạp hóa & siêu thị|butcher~Butcher shop~Cửa hàng thịt|seafood~Seafood market~Cửa hàng hải sản|boba~Boba tea shop~Trà sữa|icecream~Ice cream & dessert~Kem & tráng miệng|foodsupply~Food supplier~Nhà cung cấp thực phẩm|beautyproducts~Beauty products store~Mỹ phẩm|supplement~Vitamin & supplements~Vitamin & thực phẩm bổ sung|supply~Professional supply store~Vật tư chuyên dụng|goldshop~Gold shop~Tiệm vàng|jewelry~Jewelry store~Trang sức|gems~Gemstone store~Đá quý|florist~Florist~Cửa hàng hoa|printing~Printing & signs~In ấn & bảng hiệu|furniture~Furniture store~Nội thất|boutique~Fashion boutique~Thời trang boutique|thrift~Thrift & resale~Đồ cũ & ký gửi|petstore~Pet supply store~Cửa hàng thú cưng|wig~Wig & hair products~Tóc giả & sản phẩm tóc' },
    { id: 'houseauto', icon: '🔧', en: 'Home & auto', vi: 'Nhà cửa & xe cộ', color: '#fef3c7', items: 'auto~Auto repair~Sửa chữa ô tô|bodyshop~Auto body shop~Đồng sơn ô tô|tires~Tire shop~Cửa hàng lốp xe|towing~Towing service~Cứu hộ xe|autoglass~Auto glass~Kính ô tô|dealer~Auto dealer~Đại lý xe|autoparts~Auto parts store~Phụ tùng ô tô|lawn~Lawn care~Chăm sóc sân cỏ|landscape~Landscaping~Thiết kế cảnh quan|construction~Construction contractor~Nhà thầu xây dựng|plumber~Plumbing service~Dịch vụ ống nước|electric~Electrician~Thợ điện|hvac~HVAC service~Điện lạnh & HVAC|roofing~Roofing contractor~Mái nhà|pest~Pest control~Kiểm soát côn trùng|pool~Pool service~Dịch vụ hồ bơi|appliance~Appliance repair~Sửa thiết bị gia dụng|flooring~Flooring service~Sàn nhà|painting~Painting service~Sơn nhà|solar~Solar installer~Lắp đặt điện mặt trời|locksmith~Locksmith~Thợ khóa|gas~Gas station~Trạm xăng|carwash~Car wash & detailing~Rửa & chăm sóc xe|carrental~Car rental~Cho thuê xe|moving~Moving service~Dịch vụ chuyển nhà|laundry~Laundry & dry cleaning~Giặt ủi & giặt khô|alteration~Tailor & alteration~May đo & sửa đồ|phonerepair~Phone & electronics repair~Sửa điện thoại & điện tử' },
    { id: 'health', icon: '🩺', en: 'Health & wellness', vi: 'Sức khỏe & trị liệu', color: '#ccfbf1', items: 'clinic~Medical clinic~Phòng khám|dental~Dental clinic~Nha khoa|acupuncture~Acupuncture~Châm cứu|chiro~Chiropractic clinic~Trị liệu cột sống|optical~Optical store~Cửa hàng kính|pharmacy~Pharmacy~Nhà thuốc|vet~Veterinary clinic~Phòng khám thú y|medspa~Medical spa~Thẩm mỹ y khoa|pmu~Permanent makeup studio~Phun xăm thẩm mỹ' },
    { id: 'family', icon: '🎓', en: 'Family & education', vi: 'Gia đình & giáo dục', color: '#e0f2fe', items: 'childcare~Childcare & daycare~Nhà trẻ & giữ trẻ|school~School & learning center~Trường & trung tâm học tập|driving~Driving school~Trường dạy lái xe|music~Music school~Trường âm nhạc|martial~Martial arts school~Võ đường|dance~Dance studio~Trường dạy nhảy' },
    { id: 'events', icon: '🎉', en: 'Events & hospitality', vi: 'Sự kiện & dịch vụ tiệc', color: '#ffe4e6', items: 'wedding~Wedding planner~Tổ chức đám cưới|venue~Event venue~Địa điểm sự kiện|partyrental~Party rental~Cho thuê đồ tiệc|photobooth~Photo booth service~Dịch vụ photo booth|catering~Catering service~Dịch vụ tiệc' },
    { id: 'finance', icon: '💳', en: 'Finance & support', vi: 'Tài chính & hỗ trợ', color: '#ecfccb', items: 'moneytransfer~Money transfer~Chuyển tiền|notary~Notary service~Dịch vụ công chứng|translation~Translation service~Dịch thuật|mortgage~Mortgage service~Dịch vụ thế chấp|staffing~Staffing agency~Cung ứng nhân sự' },
    { id: 'pro', icon: '🏢', en: 'Professional services', vi: 'Dịch vụ chuyên nghiệp', color: '#ede9fe', items: 'legal~Law firm~Văn phòng luật|realestate~Real estate agent~Môi giới bất động sản|bizbroker~Business broker~Môi giới doanh nghiệp|insurance~Insurance agency~Đại lý bảo hiểm|security~Security service~Dịch vụ bảo vệ|taxservice~Tax & accounting~Thuế & kế toán|travel~Travel agency~Đại lý du lịch|itservice~IT service~Dịch vụ công nghệ|agency~Marketing agency~Công ty marketing' },
    { id: 'community', icon: '🤝', en: 'Community & lifestyle', vi: 'Cộng đồng & phong cách sống', color: '#f3e8ff', items: 'worship~Place of worship~Cơ sở tôn giáo|nonprofit~Nonprofit organization~Tổ chức phi lợi nhuận|karaoke~Karaoke & entertainment~Karaoke & giải trí|petgroom~Pet grooming~Chăm sóc thú cưng|petboard~Pet boarding~Khách sạn thú cưng|funeral~Funeral service~Dịch vụ tang lễ' },
    { id: 'other', icon: '🧩', en: 'Other business', vi: 'Ngành nghề khác', color: '#f2f4f7', items: 'other~Other / build your own~Khác / tự thiết lập' }
  ];

  const MODULES = {
    booking: { icon: 'calendar-check', en: 'Book an appointment', vi: 'Đặt lịch', descEn: 'Let customers choose a time', descVi: 'Cho khách chọn thời gian' },
    services: { icon: 'list-checks', en: 'View services', vi: 'Xem dịch vụ', descEn: 'Show services and prices', descVi: 'Hiển thị dịch vụ và giá' },
    tip: { icon: 'badge-dollar-sign', en: 'Send a tip', vi: 'Gửi tiền tip', descEn: 'Accept a quick thank-you payment', descVi: 'Nhận tiền tip nhanh' },
    review: { icon: 'star', en: 'Leave a review', vi: 'Đánh giá', descEn: 'Build trust with new customers', descVi: 'Tăng uy tín với khách mới' },
    giftcard: { icon: 'gift', en: 'Buy a gift card', vi: 'Mua thẻ quà tặng', descEn: 'Sell digital gift cards', descVi: 'Bán thẻ quà tặng điện tử' },
    menu: { icon: 'utensils', en: 'View menu', vi: 'Xem thực đơn', descEn: 'Show items, options, and prices', descVi: 'Hiển thị món và giá' },
    order: { icon: 'shopping-bag', en: 'Order online', vi: 'Đặt món trực tuyến', descEn: 'Start an online order', descVi: 'Bắt đầu đặt món' },
    reservation: { icon: 'calendar-days', en: 'Reserve a table', vi: 'Đặt bàn', descEn: 'Choose a date and party size', descVi: 'Chọn ngày và số khách' },
    shop: { icon: 'store', en: 'Shop products', vi: 'Mua sản phẩm', descEn: 'Browse products available now', descVi: 'Xem sản phẩm đang bán' },
    quote: { icon: 'clipboard-list', en: 'Request a quote', vi: 'Yêu cầu báo giá', descEn: 'Collect the details needed to estimate', descVi: 'Thu thập thông tin để báo giá' },
    call: { icon: 'phone', en: 'Call now', vi: 'Gọi ngay', descEn: 'Connect with the business', descVi: 'Liên hệ trực tiếp' },
    directions: { icon: 'map-pin', en: 'Get directions', vi: 'Chỉ đường', descEn: 'Open the business location', descVi: 'Mở địa điểm doanh nghiệp' },
    donate: { icon: 'heart-handshake', en: 'Donate', vi: 'Quyên góp', descEn: 'Support the organization', descVi: 'Ủng hộ tổ chức' },
    tickets: { icon: 'ticket', en: 'Get tickets', vi: 'Mua vé', descEn: 'Reserve a place at the event', descVi: 'Đặt chỗ cho sự kiện' },
    portfolio: { icon: 'images', en: 'View portfolio', vi: 'Xem hồ sơ năng lực', descEn: 'See recent work and highlights', descVi: 'Xem dự án nổi bật' },
    consult: { icon: 'messages-square', en: 'Book a consultation', vi: 'Đặt lịch tư vấn', descEn: 'Schedule an introduction', descVi: 'Đặt lịch trao đổi ban đầu' },
    apply: { icon: 'file-check-2', en: 'Start an application', vi: 'Bắt đầu đăng ký', descEn: 'Share information securely', descVi: 'Gửi thông tin an toàn' },
    promotion: { icon: 'megaphone', en: 'See current offers', vi: 'Xem ưu đãi', descEn: 'Show active promotions', descVi: 'Hiển thị khuyến mãi hiện tại' },
    contact: { icon: 'message-circle', en: 'Send a message', vi: 'Gửi tin nhắn', descEn: 'Ask a quick question', descVi: 'Gửi câu hỏi nhanh' }
  };

  const DEFAULTS = {
    beauty: ['booking', 'services', 'tip', 'review', 'giftcard'],
    food: ['menu', 'order', 'reservation', 'directions', 'review'],
    personal: ['portfolio', 'booking', 'consult', 'tip', 'contact'],
    showbiz: ['portfolio', 'tickets', 'booking', 'tip', 'contact'],
    service: ['services', 'booking', 'quote', 'call', 'review'],
    store: ['shop', 'promotion', 'directions', 'call', 'review'],
    houseauto: ['services', 'quote', 'booking', 'call', 'review'],
    health: ['services', 'booking', 'call', 'directions', 'review'],
    family: ['services', 'booking', 'apply', 'call', 'review'],
    events: ['portfolio', 'quote', 'booking', 'call', 'review'],
    finance: ['services', 'consult', 'apply', 'call', 'review'],
    pro: ['services', 'consult', 'quote', 'contact', 'review'],
    community: ['services', 'tickets', 'donate', 'directions', 'contact'],
    other: ['services', 'booking', 'contact', 'directions', 'review']
  };

  const SPECIAL_DEFAULTS = {
    nails: ['booking', 'services', 'tip', 'review', 'giftcard'],
    restaurant: ['menu', 'order', 'reservation', 'directions', 'review'],
    nonprofit: ['donate', 'tickets', 'contact', 'directions', 'review'],
    legal: ['consult', 'services', 'contact', 'directions', 'review'],
    carwash: ['services', 'booking', 'promotion', 'directions', 'review'],
    artist: ['portfolio', 'tickets', 'tip', 'booking', 'contact'],
    retail: ['shop', 'promotion', 'giftcard', 'directions', 'review']
  };

  const industries = GROUPS.flatMap((group) => group.items.split('|').map((raw) => {
    const [id, en, vi] = raw.split('~');
    return { id, en, vi, groupId: group.id, icon: group.icon, color: group.color };
  }));

  const state = { language: 'en', group: 'all', query: '', selected: null, enabled: new Set(), extraAdded: false };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const groupById = (id) => GROUPS.find((group) => group.id === id);
  const industryById = (id) => industries.find((industry) => industry.id === id);
  const label = (record) => record[state.language] || record.en;
  const actionLabel = (record) => state.language === 'vi' ? record.vi : record.en;
  const actionDescription = (record) => state.language === 'vi' ? record.descVi : record.descEn;
  const actionIds = (industry) => [...(SPECIAL_DEFAULTS[industry.id] || DEFAULTS[industry.groupId])];

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function renderGroups() {
    const tabs = $('#industry-group-tabs');
    const allLabel = state.language === 'vi' ? 'Tất cả' : 'All industries';
    tabs.innerHTML = [`<button class="group-tab ${state.group === 'all' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === 'all'}" data-group="all">${allLabel}<span>${industries.length}</span></button>`]
      .concat(GROUPS.map((group) => `<button class="group-tab ${state.group === group.id ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === group.id}" data-group="${group.id}">${group.icon} ${label(group)}<span>${group.items.split('|').length}</span></button>`)).join('');
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
      return `<button class="industry-card ${selected ? 'is-selected' : ''}" type="button" data-industry="${industry.id}" aria-pressed="${selected}" style="--card-soft:${industry.color}"><span class="industry-card-icon">${industry.icon}</span><div><strong>${label(industry)}</strong><small>${label(group)}</small></div><span class="selected-check"><i data-lucide="check"></i></span></button>`;
    }).join('');
    grid.querySelectorAll('[data-industry]').forEach((button) => button.addEventListener('click', () => selectIndustry(button.dataset.industry)));
    refreshIcons();
  }

  function selectIndustry(id) {
    const industry = industryById(id);
    state.selected = id;
    state.enabled = new Set(actionIds(industry));
    state.extraAdded = false;
    renderIndustries();
    renderPreview();
  }

  function renderPreview() {
    const industry = industryById(state.selected);
    $('#preview-empty').hidden = Boolean(industry);
    $('#preview-selected').hidden = !industry;
    $('#preview-state').textContent = industry ? (state.language === 'vi' ? 'Sẵn sàng xem' : 'Ready to review') : (state.language === 'vi' ? 'Chưa chọn' : 'Not selected');
    $('#preview-state').classList.toggle('is-ready', Boolean(industry));
    if (!industry) return;
    const group = groupById(industry.groupId);
    const ids = actionIds(industry);
    $('#preview-title').textContent = state.language === 'vi' ? 'Xem trước mẫu' : 'Template preview';
    $('#selected-template-icon').textContent = industry.icon;
    $('#selected-template-name').textContent = label(industry);
    $('#selected-template-group').textContent = label(group);
    $('#starter-action-count').textContent = state.language === 'vi' ? `${ids.length} hành động khởi đầu` : `${ids.length} starter actions`;
    $('#starter-actions').innerHTML = ids.map((id) => {
      const action = MODULES[id];
      return `<div class="starter-action"><span><i data-lucide="${action.icon}"></i></span><strong>${actionLabel(action)}</strong><small>${state.language === 'vi' ? 'Đề xuất' : 'Recommended'}</small></div>`;
    }).join('');
    refreshIcons();
  }

  function openReview() {
    const industry = industryById(state.selected);
    if (!industry) return;
    const secondary = state.language === 'vi' ? industry.en : industry.vi;
    $('#review-template-icon').textContent = industry.icon;
    $('#review-template-name').textContent = label(industry);
    $('#review-template-name-secondary').textContent = secondary;
    renderReviewActions();
    openModal($('#template-review-modal'));
    $$('[data-progress-step]').forEach((item) => item.classList.toggle('is-complete', item.dataset.progressStep === '1'));
    $('[data-progress-step="2"]').classList.add('is-active');
  }

  function currentReviewIds() {
    const ids = actionIds(industryById(state.selected));
    if (state.extraAdded && !ids.includes('promotion')) ids.push('promotion');
    return ids;
  }

  function renderReviewActions() {
    const ids = currentReviewIds();
    $('#review-actions').innerHTML = ids.map((id) => {
      const action = MODULES[id];
      return `<div class="review-action"><span class="review-action-icon"><i data-lucide="${action.icon}"></i></span><div><strong>${actionLabel(action)}</strong><small>${actionDescription(action)}</small></div><label class="toggle"><input type="checkbox" data-action-toggle="${id}" ${state.enabled.has(id) ? 'checked' : ''} aria-label="${actionLabel(action)}"><span></span></label></div>`;
    }).join('');
    $('#review-actions').querySelectorAll('[data-action-toggle]').forEach((input) => input.addEventListener('change', () => {
      if (input.checked) state.enabled.add(input.dataset.actionToggle);
      else state.enabled.delete(input.dataset.actionToggle);
      renderPhoneActions();
    }));
    renderPhoneActions();
    refreshIcons();
  }

  function renderPhoneActions() {
    const active = currentReviewIds().filter((id) => state.enabled.has(id));
    $('#phone-actions').innerHTML = active.length ? active.map((id) => {
      const action = MODULES[id];
      return `<div class="phone-action"><span><i data-lucide="${action.icon}"></i></span><strong>${actionLabel(action)}</strong><i data-lucide="chevron-right"></i></div>`;
    }).join('') : `<div class="no-results"><p>${state.language === 'vi' ? 'Bật ít nhất một hành động cho khách.' : 'Turn on at least one customer action.'}</p></div>`;
    refreshIcons();
  }

  function addAction() {
    if (state.extraAdded) {
      showToast(state.language === 'vi' ? 'Hành động ưu đãi đã có trong menu.' : 'Current offers is already in the menu.');
      return;
    }
    state.extraAdded = true;
    state.enabled.add('promotion');
    renderReviewActions();
    showToast(state.language === 'vi' ? 'Đã thêm “Xem ưu đãi”. Bạn vẫn có thể tắt hành động này.' : '“See current offers” added. You can still turn it off.');
  }

  function applyTemplate() {
    if (!state.enabled.size) {
      showToast(state.language === 'vi' ? 'Hãy bật ít nhất một hành động trước khi áp dụng.' : 'Turn on at least one action before applying.');
      return;
    }
    const industry = industryById(state.selected);
    closeModal($('#template-review-modal'));
    $('#success-action-count').textContent = state.enabled.size;
    $('#success-message').textContent = state.language === 'vi'
      ? `Mẫu ${industry.vi} đã được áp dụng. Hãy kiểm tra đường dẫn và nhãn trước khi chia sẻ mã QR.`
      : `The ${industry.en} template has been applied. Review links and labels before sharing your QR.`;
    $$('[data-progress-step]').forEach((item) => {
      item.classList.add('is-complete');
      item.classList.toggle('is-active', item.dataset.progressStep === '3');
    });
    openModal($('#template-success-modal'));
  }

  function openModal(modal) {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => modal.querySelector('button, a, input')?.focus(), 0);
  }

  function closeModal(modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (!$$('.template-modal:not([hidden])').length) document.body.style.overflow = '';
  }

  let toastTimer;
  function showToast(message) {
    const toast = $('#template-toast');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2600);
  }

  function setLanguage(language) {
    state.language = language;
    $$('[data-language]').forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderGroups();
    renderIndustries();
    renderPreview();
    if (!$('#template-review-modal').hidden) {
      const industry = industryById(state.selected);
      $('#review-template-name').textContent = label(industry);
      $('#review-template-name-secondary').textContent = language === 'vi' ? industry.en : industry.vi;
      renderReviewActions();
    }
  }

  function bindEvents() {
    $('#industry-search-input').addEventListener('input', (event) => {
      state.query = event.target.value;
      renderIndustries();
    });
    $('#clear-industry-filter').addEventListener('click', () => {
      state.group = 'all';
      state.query = '';
      $('#industry-search-input').value = '';
      renderGroups();
      renderIndustries();
    });
    $$('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
    $('#review-template-button').addEventListener('click', openReview);
    $('#add-action-button').addEventListener('click', addAction);
    $('#apply-template-button').addEventListener('click', applyTemplate);
    $$('[data-close-template-modal]').forEach((button) => button.addEventListener('click', () => closeModal($('#template-review-modal'))));
    $$('[data-close-success-modal]').forEach((button) => button.addEventListener('click', () => closeModal($('#template-success-modal'))));
    $$('[data-show-business-rule]').forEach((button) => button.addEventListener('click', () => openModal($('#template-help-modal'))));
    $$('[data-close-help-modal]').forEach((button) => button.addEventListener('click', () => closeModal($('#template-help-modal'))));
    $$('[data-change-template]').forEach((button) => button.addEventListener('click', () => $('#industry-search-input').focus()));
    document.addEventListener('keydown', (event) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        $('#industry-search-input').focus();
      }
      if (event.key === 'Escape') $$('.template-modal:not([hidden])').forEach(closeModal);
    });
  }

  bindEvents();
  renderGroups();
  renderIndustries();
  renderPreview();
  refreshIcons();
}());
