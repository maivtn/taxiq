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
    contact: { icon: 'message-circle', en: 'Send a message', vi: 'Gửi tin nhắn', descEn: 'Ask a quick question', descVi: 'Gửi câu hỏi nhanh' },
    contactcard: { icon: 'contact-round', en: 'Save contact', vi: 'Lưu liên hệ', descEn: 'Open the business contact card', descVi: 'Mở danh thiếp doanh nghiệp' }
  };

  const DEFAULTS = {
    beauty: ['booking', 'services', 'tip', 'review', 'giftcard'],
    food: ['menu', 'order', 'reservation', 'directions', 'review'],
    personal: ['portfolio', 'booking', 'consult', 'tip', 'contactcard'],
    showbiz: ['portfolio', 'tickets', 'booking', 'tip', 'contactcard'],
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
    artist: ['portfolio', 'tickets', 'tip', 'booking', 'contactcard'],
    retail: ['shop', 'promotion', 'giftcard', 'directions', 'review']
  };

  const TILE_BACKGROUNDS = [
    'linear-gradient(135deg, #F472B6, #BE185D)',
    'linear-gradient(135deg, #60A5FA, #1D4ED8)',
    'linear-gradient(135deg, #34D399, #047857)',
    'linear-gradient(135deg, #FBBF24, #B45309)',
    'linear-gradient(135deg, #A78BFA, #6D28D9)',
    'linear-gradient(135deg, #FB923C, #C2410C)',
    'linear-gradient(135deg, #22D3EE, #0E7490)',
    'linear-gradient(135deg, #F87171, #B91C1C)',
    'linear-gradient(135deg, #EC4899, #7E22CE)',
    'linear-gradient(135deg, #6366F1, #312E81)',
    'linear-gradient(135deg, #14B8A6, #0F766E)',
    'linear-gradient(135deg, #06B6D4, #0369A1)',
    'linear-gradient(135deg, #84CC16, #3F6212)',
    'linear-gradient(135deg, #EAB308, #A16207)',
    'linear-gradient(135deg, #F97316, #9A3412)',
    'linear-gradient(135deg, #EF4444, #991B1B)',
    'linear-gradient(135deg, #D946EF, #86198F)',
    'linear-gradient(135deg, #8B5CF6, #5B21B6)',
    'linear-gradient(135deg, #0EA5E9, #075985)',
    'linear-gradient(135deg, #10B981, #065F46)',
    'linear-gradient(135deg, #F43F5E, #9F1239)',
    'linear-gradient(135deg, #64748B, #334155)',
    'linear-gradient(135deg, #A855F7, #4338CA)',
    'linear-gradient(135deg, #2DD4BF, #155E75)'
  ];
  const ACTION_ICON_CHOICES = [
    'link-2', 'globe-2', 'external-link', 'qr-code', 'mouse-pointer-click',
    'calendar-check', 'calendar-check-2', 'calendar-days', 'calendar-range', 'clock-3',
    'phone', 'phone-call', 'mail', 'message-circle', 'message-square',
    'messages-square', 'send', 'navigation', 'map-pin', 'map-pinned',
    'home', 'building-2', 'store', 'briefcase-business', 'user',
    'users', 'contact-round', 'id-card', 'user-check', 'user-plus',
    'star', 'heart', 'gift', 'crown', 'gem',
    'sparkles', 'badge-check', 'shield-check', 'check-circle', 'circle-plus',
    'shopping-bag', 'credit-card', 'wallet', 'wallet-cards', 'coins',
    'dollar-sign', 'circle-dollar-sign', 'receipt', 'receipt-text', 'hand-coins',
    'image', 'video', 'play', 'monitor', 'smartphone',
    'tablet', 'radio', 'menu', 'list', 'tags',
    'ticket-percent', 'megaphone', 'bell', 'book-open', 'graduation-cap',
    'file-text', 'folder', 'clipboard-list', 'calculator', 'code-2',
    'printer', 'newspaper', 'rocket', 'zap', 'settings',
    'activity', 'bar-chart-3', 'chart-no-axes-combined', 'trending-up', 'sprout', 'infinity',
    'badge', 'badge-dollar-sign', 'blocks', 'apple', 'list-checks',
    'utensils', 'heart-handshake', 'ticket', 'images', 'file-check-2',
    'clipboard-check', 'clipboard-x', 'file-question', 'folder-tree', 'notebook-pen',
    'pencil', 'square-pen', 'save', 'download', 'upload-cloud',
    'copy', 'eye', 'search', 'scan-line', 'share-2',
    'refresh-cw', 'rotate-ccw', 'undo-2', 'sliders-horizontal', 'settings-2',
    'shield', 'shield-plus', 'info', 'circle-help', 'circle-question-mark',
    'alert-triangle', 'triangle-alert', 'octagon-alert', 'check', 'circle-check',
    'circle-check-big', 'x-circle', 'trash-2', 'inbox', 'voicemail',
    'phone-forwarded', 'phone-off', 'message-circle-question', 'message-circle-off', 'users-round',
    'user-circle', 'user-round-check', 'user-x', 'key-round', 'languages',
    'layers', 'layers-2', 'layers-3', 'layout-dashboard', 'layout-grid',
    'layout-template', 'list-filter', 'panel-left', 'panel-top', 'arrow-left-right'
  ];

  const industries = GROUPS.flatMap((group) => group.items.split('|').map((raw) => {
    const [id, en, vi] = raw.split('~');
    return { id, en, vi, groupId: group.id, icon: group.icon, color: group.color };
  }));

  const STORAGE_KEY = 'taxiq:oneqr-industry-template';
  const CONTACT_STORAGE_KEY = 'taxiq:oneqr-contact-card';
  const INDUSTRY_SELECTION_KEY = 'taxiq:oneqr-industry-selection';
  const INDUSTRY_DRAFT_KEY = 'taxiq:oneqr-industry-draft';
  const EDITOR_DOCUMENT_TITLE = document.title;
  const DEFAULT_CONTACT_CARD = {
    name: 'Bitcoin Nail Bar',
    title: 'Nail salon · Houston',
    phone: '(346) 802-4906',
    email: 'hello@bitcoinnailbar.com',
    website: 'https://bitcoinnailbar.com',
    address: '9793 Westheimer Rd, Suite A',
    city: 'Houston',
    region: 'TX',
    bio: 'Beauty, care, and a better booking experience.',
    addressMode: 'full',
    showPhone: true,
    showHours: true,
    openTime: '09:30',
    closeTime: '19:00',
    theme: 'indigo',
    configured: false
  };
  const state = {
    language: 'en',
    group: 'all',
    query: '',
    actionQuery: '',
    selected: null,
    reviewIds: [],
    enabled: new Set(),
    customActionIds: new Set(),
    actionTitles: {},
    actionLinks: {},
    actionIcons: {},
    editingIconId: null,
    reviewSnapshot: null,
    applied: null
  };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const groupById = (id) => GROUPS.find((group) => group.id === id);
  const industryById = (id) => industries.find((industry) => industry.id === id);
  const label = (record) => record[state.language] || record.en;
  const actionLabel = (record) => state.language === 'vi' ? record.vi : record.en;
  const actionDescription = (record) => state.language === 'vi' ? record.descVi : record.descEn;
  const actionIds = (industry) => [...(SPECIAL_DEFAULTS[industry.id] || DEFAULTS[industry.groupId])];
  const escapeAttribute = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const DEFAULT_ACTION_LINKS = {
    booking: 'https://booking.nexoratouch.com/bitcoin-nail-bar',
    tip: 'https://pay.nexoratouch.com/bitcoin-nail-bar',
    review: 'https://g.page/r/bitcoin-nail-bar/review',
    call: 'tel:+13468024906',
    directions: 'https://maps.google.com/?q=Bitcoin+Nail+Bar',
    contact: 'sms:+13468024906',
    contactcard: 'https://nexoratouch.com/c/bitcoin-nail-bar'
  };
  let contactCard = loadContactCard();
  let contactDraft = { ...contactCard };

  function actionLink(id) {
    if (typeof state.actionLinks[id] !== 'string') {
      state.actionLinks[id] = DEFAULT_ACTION_LINKS[id] || `https://nexoratouch.com/o/bitcoin-nail-bar/${id}`;
    }
    return state.actionLinks[id];
  }

  function actionTitleValue(id) {
    return typeof state.actionTitles[id] === 'string' ? state.actionTitles[id] : actionLabel(MODULES[id]);
  }

  function displayActionTitle(id) {
    return actionTitleValue(id).trim() || actionLabel(MODULES[id]);
  }

  function actionIconValue(id) {
    return typeof state.actionIcons[id] === 'string' && state.actionIcons[id] ? state.actionIcons[id] : MODULES[id].icon;
  }

  function isUploadedIcon(value) {
    return /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value);
  }

  function actionIconMarkup(id) {
    const icon = actionIconValue(id);
    return isUploadedIcon(icon)
      ? `<img src="${escapeAttribute(icon)}" alt="">`
      : `<i data-lucide="${escapeAttribute(icon)}" aria-hidden="true"></i>`;
  }

  function isCustomLinkId(id) {
    return typeof id === 'string' && id.startsWith('custom-link-');
  }

  function ensureCustomLinkModules(ids) {
    (Array.isArray(ids) ? ids : []).forEach((id) => {
      if (!isCustomLinkId(id) || MODULES[id]) return;
      MODULES[id] = {
        icon: 'link-2',
        en: 'New link',
        vi: 'Liên kết mới',
        descEn: 'Open your custom destination',
        descVi: 'Mở đường dẫn tùy chỉnh'
      };
    });
  }

  function sortActionsByActive() {
    const activeIds = state.reviewIds.filter((id) => state.enabled.has(id));
    const inactiveIds = state.reviewIds.filter((id) => !state.enabled.has(id));
    state.reviewIds = [...activeIds, ...inactiveIds];
  }

  function savedCustomActionIds(saved) {
    if (!saved) return [];
    if (Array.isArray(saved.customActionIds)) return saved.customActionIds.filter((id) => MODULES[id]);
    const industry = industryById(saved.industryId);
    const recommended = new Set(industry ? actionIds(industry) : []);
    return (saved.reviewIds || saved.actionIds || []).filter((id) => MODULES[id] && !recommended.has(id));
  }

  function loadAppliedTemplate() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || !industryById(saved.industryId) || !Array.isArray(saved.actionIds)) return null;
      return saved;
    } catch (error) {
      return null;
    }
  }

  function saveAppliedTemplate(payload) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      showToast(state.language === 'vi' ? 'Không thể lưu trên trình duyệt này.' : 'This browser could not save the template.');
    }
  }

  function loadContactCard() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(CONTACT_STORAGE_KEY) || 'null');
      return saved && typeof saved === 'object' ? { ...DEFAULT_CONTACT_CARD, ...saved } : { ...DEFAULT_CONTACT_CARD };
    } catch (error) {
      return { ...DEFAULT_CONTACT_CARD };
    }
  }

  function persistContactCard() {
    try {
      window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contactCard));
    } catch (error) {
      showToast('This browser could not save the contact card.');
    }
  }

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
      const actionCount = actionIds(industry).length;
      const actionCopy = state.language === 'vi' ? `${actionCount} hành động sẵn có` : `${actionCount} actions ready`;
      const tileBackground = TILE_BACKGROUNDS[industries.indexOf(industry) % TILE_BACKGROUNDS.length];
      return `<button class="industry-card ${selected ? 'is-selected' : ''}" type="button" data-industry="${industry.id}" aria-pressed="${selected}" style="--card-gradient:${tileBackground}"><span class="industry-card-icon">${industry.icon}</span><div><strong>${label(industry)}</strong><small>${label(group)} · ${actionCopy}</small></div><span class="selected-check"><i data-lucide="check"></i></span></button>`;
    }).join('');
    grid.querySelectorAll('[data-industry]').forEach((button) => button.addEventListener('click', () => selectIndustry(button.dataset.industry)));
    refreshIcons();
  }

  function selectIndustry(id) {
    applyIndustrySelection(id);
    if (document.body.dataset.oneqrScreen === 'industry-picker') {
      try {
        window.localStorage.setItem(INDUSTRY_SELECTION_KEY, id);
      } catch (error) {
        // Navigation still works when storage is unavailable.
      }
      window.location.href = 'oneqr-industry-templates.html';
      return;
    }
    renderIndustries();
    renderPreview();
    setProgress(1);
    returnToTemplateEditor();
  }

  function applyIndustrySelection(id) {
    const industry = industryById(id);
    if (!industry) return;
    const recommendedIds = actionIds(industry);
    const recommendedSet = new Set(recommendedIds);
    const customIds = [...state.customActionIds].filter((actionId) => MODULES[actionId] && !recommendedSet.has(actionId));
    const enabledCustomIds = customIds.filter((actionId) => state.enabled.has(actionId));
    state.selected = id;
    state.reviewIds = [...recommendedIds, ...customIds];
    state.customActionIds = new Set(customIds);
    state.enabled = new Set([...recommendedIds, ...enabledCustomIds]);
    sortActionsByActive();
  }

  function renderPreview() {
    const industry = industryById(state.selected);
    $('#preview-empty').hidden = Boolean(industry);
    $('#preview-selected').hidden = !industry;
    renderCustomerLivePreview();
    $('#preview-state').textContent = industry ? (state.language === 'vi' ? 'Sẵn sàng xem' : 'Ready to review') : (state.language === 'vi' ? 'Chưa chọn' : 'Not selected');
    $('#preview-state').classList.toggle('is-ready', Boolean(industry));
    if (!industry) return;
    const group = groupById(industry.groupId);
    const ids = state.reviewIds.length ? state.reviewIds : actionIds(industry);
    $('#preview-title').textContent = state.language === 'vi' ? 'Xem trước mẫu' : 'Template preview';
    $('#selected-template-icon').textContent = industry.icon;
    $('#selected-template-name').textContent = label(industry);
    $('#selected-template-group').textContent = label(group);
    $('#starter-action-count').textContent = state.language === 'vi' ? `${ids.length} hành động khởi đầu` : `${ids.length} starter actions`;
    $('#starter-actions').innerHTML = ids.map((id) => {
      const action = MODULES[id];
      const custom = state.customActionIds.has(id);
      const source = custom ? (state.language === 'vi' ? 'Bạn đã thêm' : 'Added by you') : (state.language === 'vi' ? 'Đề xuất' : 'Recommended');
      return `<div class="starter-action"><span>${actionIconMarkup(id)}</span><strong>${escapeAttribute(displayActionTitle(id))}</strong><small class="${custom ? 'is-custom' : ''}">${source}</small></div>`;
    }).join('');
    $('#review-template-button-label').textContent = state.applied && state.applied.industryId === industry.id
      ? (state.language === 'vi' ? 'Chỉnh sửa mẫu đang dùng' : 'Edit applied template')
      : (state.language === 'vi' ? 'Xem lại menu khởi đầu' : 'Review this starter menu');
    renderEditorActions();
    refreshIcons();
  }

  function renderEditorActions() {
    const container = $('#template-editor-actions');
    const industry = industryById(state.selected);
    if (!container || !industry) return;
    const group = groupById(industry.groupId);
    const activeCount = state.reviewIds.filter((id) => state.enabled.has(id)).length;
    $('#editor-template-name').textContent = label(industry);
    $('#editor-template-meta').textContent = `${label(group)} · ${state.language === 'vi' ? 'Bản nháp menu khách hàng' : 'Customer menu draft'}`;
    $('#editor-action-count').textContent = state.language === 'vi'
      ? `${activeCount}/${state.reviewIds.length} hành động đang bật`
      : `${activeCount}/${state.reviewIds.length} active ${state.reviewIds.length === 1 ? 'action' : 'actions'}`;
    $('#editor-list-status').textContent = state.language === 'vi'
      ? `${activeCount} hành động đang bật · Kéo tay nắm hoặc dùng nút mũi tên để sắp xếp`
      : `${activeCount} active ${activeCount === 1 ? 'action' : 'actions'} · Drag the handle or use the arrows to reorder`;
    container.innerHTML = state.reviewIds.map((id, index) => {
      const action = MODULES[id];
      const dragLabel = state.language === 'vi' ? `Kéo để sắp xếp ${action.vi}` : `Drag to reorder ${action.en}`;
      const linkLabel = state.language === 'vi' ? `Đường dẫn cho ${displayActionTitle(id)}` : `Link for ${displayActionTitle(id)}`;
      const titleLabel = state.language === 'vi' ? `Tên hiển thị cho ${action.vi}` : `Display title for ${action.en}`;
      const canMoveUp = index > 0 && state.enabled.has(state.reviewIds[index - 1]) === state.enabled.has(id);
      const canMoveDown = index < state.reviewIds.length - 1 && state.enabled.has(state.reviewIds[index + 1]) === state.enabled.has(id);
      return `<article class="template-editor-action" data-editor-action="${id}"><button class="editor-drag-handle" type="button" draggable="true" data-editor-drag-handle="${id}" aria-label="${dragLabel}" title="${dragLabel}"><i data-lucide="grip-vertical"></i></button><div class="editor-action-icon-tools"><span class="template-editor-action-icon">${actionIconMarkup(id)}</span><span><button type="button" data-choose-action-icon="${id}" aria-label="Choose icon for ${escapeAttribute(displayActionTitle(id))}">Change icon</button><button type="button" data-upload-action-icon="${id}" aria-label="Upload icon for ${escapeAttribute(displayActionTitle(id))}">Upload</button></span></div><div class="template-editor-action-copy"><input class="editor-action-title" type="text" data-editor-action-title="${id}" value="${escapeAttribute(actionTitleValue(id))}" aria-label="${titleLabel}"><label class="editor-action-link"><i data-lucide="link-2" aria-hidden="true"></i><input type="text" inputmode="url" data-editor-action-link="${id}" value="${escapeAttribute(actionLink(id))}" aria-label="${escapeAttribute(linkLabel)}" spellcheck="false"></label></div><span class="editor-action-controls"><button type="button" data-editor-action-move="up" aria-label="Move ${action.en} up" ${canMoveUp ? '' : 'disabled'}><i data-lucide="chevron-up"></i></button><button type="button" data-editor-action-move="down" aria-label="Move ${action.en} down" ${canMoveDown ? '' : 'disabled'}><i data-lucide="chevron-down"></i></button><button class="editor-action-remove" type="button" data-editor-action-remove aria-label="Remove ${action.en}"><i data-lucide="x"></i></button></span><label class="toggle"><input type="checkbox" data-editor-action-toggle="${id}" ${state.enabled.has(id) ? 'checked' : ''} aria-label="${escapeAttribute(displayActionTitle(id))}"><span></span></label></article>`;
    }).join('');
    container.querySelectorAll('[data-choose-action-icon]').forEach((button) => button.addEventListener('click', () => openActionIconPicker(button.dataset.chooseActionIcon)));
    container.querySelectorAll('[data-upload-action-icon]').forEach((button) => button.addEventListener('click', () => {
      state.editingIconId = button.dataset.uploadActionIcon;
      $('#action-icon-upload').click();
    }));
    container.querySelectorAll('[data-editor-action-title]').forEach((input) => input.addEventListener('input', () => {
      state.actionTitles[input.dataset.editorActionTitle] = input.value;
      renderCustomerLivePreview();
      renderPerformance();
    }));
    container.querySelectorAll('[data-editor-action-link]').forEach((input) => input.addEventListener('input', () => {
      state.actionLinks[input.dataset.editorActionLink] = input.value;
    }));
    container.querySelectorAll('[data-editor-action-toggle]').forEach((input) => input.addEventListener('change', () => {
      if (input.checked) state.enabled.add(input.dataset.editorActionToggle);
      else state.enabled.delete(input.dataset.editorActionToggle);
      sortActionsByActive();
      renderPreview();
    }));
    container.querySelectorAll('[data-editor-action-move]').forEach((button) => button.addEventListener('click', () => {
      const row = button.closest('[data-editor-action]');
      moveAction(row.dataset.editorAction, button.dataset.editorActionMove);
    }));
    container.querySelectorAll('[data-editor-action-remove]').forEach((button) => button.addEventListener('click', () => {
      removeAction(button.closest('[data-editor-action]').dataset.editorAction);
    }));
    bindEditorDragReorder();
    renderPerformance();
    refreshIcons();
  }

  function renderPerformance() {
    const container = $('#performance-action-list');
    if (!container) return;
    const active = state.reviewIds.filter((id) => state.enabled.has(id)).slice(0, 4);
    const demoClicks = [68, 52, 29, 14];
    const maximum = demoClicks[0];
    container.innerHTML = active.map((id, index) => {
      const clicks = demoClicks[index];
      const width = Math.max(10, Math.round((clicks / maximum) * 100));
      const title = escapeAttribute(displayActionTitle(id));
      return `<div class="performance-action-row"><span title="${title}">${title}</span><i style="--performance-width:${width}%" aria-hidden="true"></i><strong>${clicks}</strong></div>`;
    }).join('');
  }

  function showIndustryPicker() {
    $('#template-editor-view').hidden = true;
    $('#industry-picker-view').hidden = false;
    $('.template-workspace').classList.add('is-picker-mode');
    $('.industry-page').classList.remove('is-editor-mode');
    $('.industry-page').classList.add('is-picker-page');
    document.title = 'Choose Industry | One QR';
    setProgress(1);
    window.setTimeout(() => $('#industry-search-input').focus(), 0);
  }

  function showTemplateEditor() {
    $('#template-editor-view').hidden = false;
    $('#industry-picker-view').hidden = true;
    $('.template-workspace').classList.remove('is-picker-mode');
    $('.industry-page').classList.remove('is-picker-page');
    $('.industry-page').classList.add('is-editor-mode');
    document.title = EDITOR_DOCUMENT_TITLE;
    renderEditorActions();
  }

  function openIndustryPickerPage() {
    try {
      window.sessionStorage.setItem(INDUSTRY_DRAFT_KEY, JSON.stringify({
        selected: state.selected,
        reviewIds: state.reviewIds,
        enabledIds: [...state.enabled],
        customActionIds: [...state.customActionIds],
        actionTitles: state.actionTitles,
        actionLinks: state.actionLinks,
        actionIcons: state.actionIcons,
        language: state.language
      }));
    } catch (error) {
      // The separate picker page can still open without draft persistence.
    }
    window.location.href = 'oneqr-industry-picker.html';
  }

  function returnToTemplateEditor() {
    showTemplateEditor();
  }

  function addPastedLink() {
    const input = $('#editor-link-input');
    const url = input.value.trim();
    if (!url) {
      input.focus();
      showToast(state.language === 'vi' ? 'Dán một đường dẫn trước khi thêm.' : 'Paste a link before adding it.');
      return;
    }
    let id = `custom-link-${Date.now().toString(36)}`;
    while (MODULES[id]) id = `${id}-1`;
    ensureCustomLinkModules([id]);
    state.reviewIds.push(id);
    state.enabled.add(id);
    state.customActionIds.add(id);
    state.actionTitles[id] = state.language === 'vi' ? 'Liên kết mới' : 'New link';
    state.actionLinks[id] = url;
    sortActionsByActive();
    input.value = '';
    renderPreview();
    const titleInput = $(`[data-editor-action-title="${id}"]`);
    titleInput?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    titleInput?.focus({ preventScroll: true });
    titleInput?.select();
    showToast(state.language === 'vi' ? 'Đã thêm liên kết mới vào trang OneQR.' : 'New link added to your OneQR page.');
  }

  function openReview() {
    const industry = industryById(state.selected);
    if (!industry) return;
    state.reviewSnapshot = {
      selected: state.selected,
      reviewIds: [...state.reviewIds],
      enabled: new Set(state.enabled),
      customActionIds: new Set(state.customActionIds)
    };
    const secondary = state.language === 'vi' ? industry.en : industry.vi;
    $('#review-template-icon').textContent = industry.icon;
    $('#review-template-name').textContent = label(industry);
    $('#review-template-name-secondary').textContent = secondary;
    renderReviewActions();
    openModal($('#template-review-modal'));
    setProgress(2);
  }

  function currentReviewIds() {
    return [...state.reviewIds];
  }

  function renderReviewActions() {
    const ids = currentReviewIds();
    $('#review-actions').innerHTML = ids.map((id, index) => {
      const action = MODULES[id];
      const dragLabel = state.language === 'vi' ? `Kéo để sắp xếp ${action.vi}` : `Drag to reorder ${action.en}`;
      const custom = state.customActionIds.has(id);
      const source = custom ? (state.language === 'vi' ? 'Bạn thêm' : 'Your action') : (state.language === 'vi' ? 'Đề xuất' : 'Recommended');
      const canMoveUp = index > 0 && state.enabled.has(ids[index - 1]) === state.enabled.has(id);
      const canMoveDown = index < ids.length - 1 && state.enabled.has(ids[index + 1]) === state.enabled.has(id);
      return `<div class="review-action" data-review-action="${id}"><button class="drag-handle" type="button" draggable="true" data-drag-handle="${id}" aria-label="${dragLabel}" title="${dragLabel}"><i data-lucide="grip-vertical"></i></button><span class="review-action-icon">${actionIconMarkup(id)}</span><div><strong>${escapeAttribute(displayActionTitle(id))} <em class="review-action-source ${custom ? 'is-custom' : ''}">${source}</em></strong><small>${actionDescription(action)}</small></div><span class="review-action-controls"><button type="button" data-action-move="up" aria-label="Move ${action.en} up" ${canMoveUp ? '' : 'disabled'}><i data-lucide="chevron-up"></i></button><button type="button" data-action-move="down" aria-label="Move ${action.en} down" ${canMoveDown ? '' : 'disabled'}><i data-lucide="chevron-down"></i></button><button class="review-action-remove" type="button" data-action-remove aria-label="Remove ${action.en}"><i data-lucide="x"></i></button></span><label class="toggle"><input type="checkbox" data-action-toggle="${id}" ${state.enabled.has(id) ? 'checked' : ''} aria-label="${escapeAttribute(displayActionTitle(id))}"><span></span></label></div>`;
    }).join('');
    $('#review-actions').querySelectorAll('[data-action-toggle]').forEach((input) => input.addEventListener('change', () => {
      if (input.checked) state.enabled.add(input.dataset.actionToggle);
      else state.enabled.delete(input.dataset.actionToggle);
      sortActionsByActive();
      renderPhoneActions();
      updateActiveCount();
      renderPreview();
    }));
    $('#review-actions').querySelectorAll('[data-action-move]').forEach((button) => button.addEventListener('click', () => {
      const row = button.closest('[data-review-action]');
      moveAction(row.dataset.reviewAction, button.dataset.actionMove);
    }));
    $('#review-actions').querySelectorAll('[data-action-remove]').forEach((button) => button.addEventListener('click', () => {
      removeAction(button.closest('[data-review-action]').dataset.reviewAction);
    }));
    bindDragReorder();
    renderPhoneActions();
    updateActiveCount();
    refreshIcons();
  }

  function updateActiveCount() {
    const count = currentReviewIds().filter((id) => state.enabled.has(id)).length;
    $('#review-active-count').textContent = state.language === 'vi'
      ? `${count} hành động đang bật · Kéo tay nắm hoặc dùng nút mũi tên để sắp xếp`
      : `${count} active ${count === 1 ? 'action' : 'actions'} · Drag the handle or use the arrows to reorder`;
  }

  function moveAction(id, direction) {
    const from = state.reviewIds.indexOf(id);
    const to = direction === 'up' ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= state.reviewIds.length) return;
    if (state.enabled.has(id) !== state.enabled.has(state.reviewIds[to])) return;
    [state.reviewIds[from], state.reviewIds[to]] = [state.reviewIds[to], state.reviewIds[from]];
    renderReviewActions();
    renderPreview();
  }

  function removeAction(id) {
    state.reviewIds = state.reviewIds.filter((actionId) => actionId !== id);
    state.enabled.delete(id);
    state.customActionIds.delete(id);
    if (isCustomLinkId(id)) {
      delete state.actionTitles[id];
      delete state.actionLinks[id];
      delete state.actionIcons[id];
      delete MODULES[id];
    }
    renderReviewActions();
    renderPreview();
  }

  let draggedActionId = null;
  let pointerDrag = null;

  function moveActionTo(id, targetId, placeAfter) {
    if (!id || !targetId || id === targetId) return false;
    if (state.enabled.has(id) !== state.enabled.has(targetId)) return false;
    const nextIds = state.reviewIds.filter((actionId) => actionId !== id);
    const targetIndex = nextIds.indexOf(targetId);
    if (targetIndex < 0) return false;
    nextIds.splice(targetIndex + (placeAfter ? 1 : 0), 0, id);
    state.reviewIds = nextIds;
    return true;
  }

  function bindDragReorder() {
    const container = $('#review-actions');
    container.querySelectorAll('[data-drag-handle]').forEach((handle) => {
      handle.addEventListener('dragstart', (event) => {
        draggedActionId = handle.dataset.dragHandle;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', draggedActionId);
        handle.closest('[data-review-action]').classList.add('is-dragging');
      });
      handle.addEventListener('dragend', () => {
        draggedActionId = null;
        container.querySelectorAll('.is-dragging, .is-drag-over').forEach((item) => item.classList.remove('is-dragging', 'is-drag-over'));
      });
      handle.addEventListener('keydown', (event) => {
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        moveAction(handle.dataset.dragHandle, event.key === 'ArrowUp' ? 'up' : 'down');
        document.querySelector(`[data-drag-handle="${handle.dataset.dragHandle}"]`)?.focus();
      });
      handle.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') return;
        event.preventDefault();
        pointerDrag = {
          id: handle.dataset.dragHandle,
          targetId: handle.dataset.dragHandle,
          placeAfter: false
        };
        handle.closest('[data-review-action]').classList.add('is-dragging');
      });
    });
    container.querySelectorAll('[data-review-action]').forEach((row) => {
      row.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        container.querySelectorAll('.is-drag-over').forEach((item) => item.classList.remove('is-drag-over'));
        if (row.dataset.reviewAction !== draggedActionId) row.classList.add('is-drag-over');
      });
      row.addEventListener('dragleave', () => row.classList.remove('is-drag-over'));
      row.addEventListener('drop', (event) => {
        event.preventDefault();
        const bounds = row.getBoundingClientRect();
        const placeAfter = event.clientY > bounds.top + bounds.height / 2;
        const sourceId = draggedActionId || event.dataTransfer.getData('text/plain');
        if (moveActionTo(sourceId, row.dataset.reviewAction, placeAfter)) {
          renderReviewActions();
          renderPreview();
          showToast(state.language === 'vi' ? 'Đã cập nhật thứ tự hiển thị.' : 'Display order updated.');
        }
      });
    });
  }

  function bindEditorDragReorder() {
    const container = $('#template-editor-actions');
    container.querySelectorAll('[data-editor-drag-handle]').forEach((handle) => {
      handle.addEventListener('dragstart', (event) => {
        draggedActionId = handle.dataset.editorDragHandle;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', draggedActionId);
        handle.closest('[data-editor-action]').classList.add('is-dragging');
      });
      handle.addEventListener('dragend', () => {
        draggedActionId = null;
        container.querySelectorAll('.is-dragging, .is-drag-over').forEach((item) => item.classList.remove('is-dragging', 'is-drag-over'));
      });
      handle.addEventListener('keydown', (event) => {
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        moveAction(handle.dataset.editorDragHandle, event.key === 'ArrowUp' ? 'up' : 'down');
        document.querySelector(`[data-editor-drag-handle="${handle.dataset.editorDragHandle}"]`)?.focus();
      });
    });
    container.querySelectorAll('[data-editor-action]').forEach((row) => {
      row.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        container.querySelectorAll('.is-drag-over').forEach((item) => item.classList.remove('is-drag-over'));
        if (row.dataset.editorAction !== draggedActionId) row.classList.add('is-drag-over');
      });
      row.addEventListener('dragleave', () => row.classList.remove('is-drag-over'));
      row.addEventListener('drop', (event) => {
        event.preventDefault();
        const bounds = row.getBoundingClientRect();
        const placeAfter = event.clientY > bounds.top + bounds.height / 2;
        const sourceId = draggedActionId || event.dataTransfer.getData('text/plain');
        if (moveActionTo(sourceId, row.dataset.editorAction, placeAfter)) {
          renderReviewActions();
          renderPreview();
          showToast(state.language === 'vi' ? 'Đã cập nhật thứ tự hiển thị.' : 'Display order updated.');
        }
      });
    });
  }

  function updatePointerDrag(event) {
    if (!pointerDrag) return;
    event.preventDefault();
    const container = $('#review-actions');
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-review-action]');
    container.querySelectorAll('.is-drag-over').forEach((item) => item.classList.remove('is-drag-over'));
    if (!row || row.dataset.reviewAction === pointerDrag.id) return;
    const bounds = row.getBoundingClientRect();
    pointerDrag.targetId = row.dataset.reviewAction;
    pointerDrag.placeAfter = event.clientY > bounds.top + bounds.height / 2;
    row.classList.add('is-drag-over');
  }

  function finishPointerDrag(applyMove) {
    if (!pointerDrag) return;
    const pending = pointerDrag;
    pointerDrag = null;
    $('#review-actions').querySelectorAll('.is-dragging, .is-drag-over').forEach((item) => item.classList.remove('is-dragging', 'is-drag-over'));
    if (applyMove && moveActionTo(pending.id, pending.targetId, pending.placeAfter)) {
      renderReviewActions();
      renderPreview();
      showToast(state.language === 'vi' ? 'Đã cập nhật thứ tự hiển thị.' : 'Display order updated.');
    }
  }

  function setContactFormValues() {
    const values = {
      '#contact-name': contactDraft.name,
      '#contact-title': contactDraft.title,
      '#contact-phone': contactDraft.phone,
      '#contact-email': contactDraft.email,
      '#contact-website': contactDraft.website,
      '#contact-address': contactDraft.address,
      '#contact-city': contactDraft.city,
      '#contact-state': contactDraft.region,
      '#contact-bio': contactDraft.bio,
      '#contact-open-time': contactDraft.openTime,
      '#contact-close-time': contactDraft.closeTime
    };
    Object.entries(values).forEach(([selector, value]) => { $(selector).value = value || ''; });
    $$('#contact-card-form [name="contact-address-mode"]').forEach((input) => { input.checked = input.value === contactDraft.addressMode; });
    $('#contact-show-phone').checked = Boolean(contactDraft.showPhone);
    $('#contact-show-hours').checked = Boolean(contactDraft.showHours);
    $('#contact-add-action').checked = true;
    $$('[data-contact-theme]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.contactTheme === contactDraft.theme)));
  }

  function readContactForm() {
    contactDraft = {
      ...contactDraft,
      name: $('#contact-name').value.trim(),
      title: $('#contact-title').value.trim(),
      phone: $('#contact-phone').value.trim(),
      email: $('#contact-email').value.trim(),
      website: $('#contact-website').value.trim(),
      address: $('#contact-address').value.trim(),
      city: $('#contact-city').value.trim(),
      region: $('#contact-state').value.trim(),
      bio: $('#contact-bio').value.trim(),
      addressMode: $('#contact-card-form [name="contact-address-mode"]:checked')?.value || 'full',
      showPhone: $('#contact-show-phone').checked,
      showHours: $('#contact-show-hours').checked,
      openTime: $('#contact-open-time').value,
      closeTime: $('#contact-close-time').value
    };
  }

  function displayTime(value) {
    if (!value || !value.includes(':')) return '';
    const [hours, minutes] = value.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  }

  function cardAddress(card) {
    if (card.addressMode === 'hidden') return '';
    const area = [card.city, card.region].filter(Boolean).join(', ');
    return card.addressMode === 'area' ? area : [card.address, area].filter(Boolean).join(', ');
  }

  function contactAddress() {
    return cardAddress(contactDraft);
  }

  function renderContactPreview() {
    const name = contactDraft.name || 'Your business';
    $('#contact-card-preview').dataset.theme = contactDraft.theme;
    $('#contact-preview-avatar').textContent = name.charAt(0).toUpperCase();
    $('#contact-preview-name').textContent = name;
    $('#contact-preview-title').textContent = contactDraft.title || 'Business contact';
    $('#contact-preview-bio').textContent = contactDraft.bio || 'Your official OneQR contact card.';
    $('#contact-preview-phone').textContent = contactDraft.phone || 'Phone not added';
    $('#contact-preview-email').textContent = contactDraft.email || 'Email not added';
    $('#contact-preview-address').textContent = contactAddress() || 'Address hidden';
    $('#contact-preview-hours').textContent = `${displayTime(contactDraft.openTime)}–${displayTime(contactDraft.closeTime)}`;
    $('#contact-preview-phone-row').hidden = !contactDraft.showPhone || !contactDraft.phone;
    $('#contact-preview-email-row').hidden = !contactDraft.email;
    $('#contact-preview-address-row').hidden = !contactAddress();
    $('#contact-preview-hours-row').hidden = !contactDraft.showHours || !contactDraft.openTime || !contactDraft.closeTime;
    $('#contact-hours-row').hidden = !contactDraft.showHours;
    refreshIcons();
  }

  function renderContactStatus() {
    const status = $('#contact-card-status');
    if (!status) return;
    status.textContent = contactCard.configured
      ? (state.language === 'vi' ? 'Đã thiết lập · Chỉnh sửa' : 'Ready · Edit details')
      : (state.language === 'vi' ? 'Cần thiết lập' : 'Needs setup');
  }

  function openContactCard() {
    contactDraft = { ...contactCard };
    setContactFormValues();
    renderContactPreview();
    openModal($('#contact-card-modal'));
  }

  function importContactDemo() {
    if (!$('#contact-google-url').value.trim()) {
      showToast('Paste a Google Business Profile URL first.');
      return;
    }
    contactDraft = { ...contactDraft, ...DEFAULT_CONTACT_CARD, configured: contactDraft.configured, theme: contactDraft.theme };
    setContactFormValues();
    renderContactPreview();
    showToast('Business details imported for this prototype.');
  }

  function vCardValue(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }

  function downloadVCard() {
    readContactForm();
    const includeAddress = contactDraft.addressMode !== 'hidden' && (contactDraft.address || contactDraft.city || contactDraft.region);
    const street = contactDraft.addressMode === 'area' ? '' : contactDraft.address;
    const lines = [
      'BEGIN:VCARD', 'VERSION:3.0', `FN:${vCardValue(contactDraft.name)}`,
      contactDraft.title ? `TITLE:${vCardValue(contactDraft.title)}` : '',
      contactDraft.showPhone && contactDraft.phone ? `TEL;TYPE=CELL:${vCardValue(contactDraft.phone)}` : '',
      contactDraft.email ? `EMAIL:${vCardValue(contactDraft.email)}` : '',
      contactDraft.website ? `URL:${vCardValue(contactDraft.website)}` : '',
      includeAddress ? `ADR;TYPE=WORK:;;${vCardValue(street)};${vCardValue(contactDraft.city)};${vCardValue(contactDraft.region)};;` : '',
      contactDraft.bio ? `NOTE:${vCardValue(contactDraft.bio)}` : '', 'END:VCARD'
    ].filter(Boolean).join('\r\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/vcard;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(contactDraft.name || 'oneqr-contact').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'oneqr-contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('vCard downloaded.');
  }

  function saveContactCard(event) {
    event.preventDefault();
    readContactForm();
    contactCard = { ...contactDraft, configured: true };
    persistContactCard();
    let actionAdded = false;
    if ($('#contact-add-action').checked && state.selected && !state.reviewIds.includes('contactcard')) {
      state.reviewIds.push('contactcard');
      state.enabled.add('contactcard');
      if (!actionIds(industryById(state.selected)).includes('contactcard')) state.customActionIds.add('contactcard');
      sortActionsByActive();
      actionAdded = true;
      renderPreview();
    }
    renderContactStatus();
    renderCustomerLivePreview();
    closeModal($('#contact-card-modal'));
    showToast(actionAdded ? 'Contact card saved and added to the menu draft.' : 'Contact card saved.');
  }

  function customerActionMarkup(active) {
    return active.length ? active.map((id) => {
      const action = MODULES[id];
      const tag = id === 'contactcard' ? 'button' : 'div';
      const attribute = id === 'contactcard' ? ' type="button" data-phone-contact-card' : '';
      return `<${tag} class="phone-action"${attribute}><span>${actionIconMarkup(id)}</span><strong>${escapeAttribute(displayActionTitle(id))}</strong></${tag}>`;
    }).join('') : `<div class="no-results"><p>${state.language === 'vi' ? 'Bật ít nhất một hành động cho khách.' : 'Turn on at least one customer action.'}</p></div>`;
  }

  function renderActionContainer(container, active) {
    if (!container) return;
    container.innerHTML = customerActionMarkup(active);
    container.querySelector('[data-phone-contact-card]')?.addEventListener('click', openContactCard);
  }

  function renderCustomerFrame(prefix) {
    const businessName = contactCard.name || 'Bitcoin Nail Bar';
    const address = cardAddress(contactCard);
    const hours = contactCard.showHours && contactCard.openTime && contactCard.closeTime
      ? `${displayTime(contactCard.openTime)}–${displayTime(contactCard.closeTime)}`
      : '';
    $(`#${prefix}-business-name`).textContent = businessName;
    $(`#${prefix}-featured-name`).textContent = businessName;
    $(`#${prefix}-help-title`).textContent = state.language === 'vi' ? 'Hôm nay chúng tôi có thể giúp gì?' : 'How can we help you today?';
    $(`#${prefix}-call`).hidden = !contactCard.showPhone || !contactCard.phone;
    $(`#${prefix}-text`).hidden = !contactCard.showPhone || !contactCard.phone;
    $(`#${prefix}-directions`).hidden = !address;
    $(`#${prefix}-info-address`).lastChild.textContent = address;
    $(`#${prefix}-info-address`).hidden = !address;
    $(`#${prefix}-info-hours`).lastChild.textContent = `${state.language === 'vi' ? 'Mở cửa hằng ngày' : 'Open daily'} · ${hours}`;
    $(`#${prefix}-info-hours`).hidden = !hours;
  }

  function renderCustomerLivePreview() {
    const preview = $('#customer-live-preview');
    const industry = industryById(state.selected);
    if (!preview) return;
    preview.hidden = !industry;
    if (!industry) return;
    const active = currentReviewIds().filter((id) => state.enabled.has(id));
    renderCustomerFrame('customer-live');
    $('#customer-live-count').textContent = state.language === 'vi'
      ? `${active.length} hành động đang bật`
      : `${active.length} active ${active.length === 1 ? 'action' : 'actions'}`;
    renderActionContainer($('#customer-live-actions'), active);
    refreshIcons();
  }

  function renderPhoneActions() {
    const active = currentReviewIds().filter((id) => state.enabled.has(id));
    renderCustomerFrame('review-live');
    renderActionContainer($('#phone-actions'), active);
    renderCustomerLivePreview();
    refreshIcons();
  }

  function renderActionLibrary() {
    const query = state.actionQuery.trim().toLocaleLowerCase();
    const available = Object.entries(MODULES).filter(([id, action]) => {
      if (isCustomLinkId(id)) return false;
      if (state.reviewIds.includes(id)) return false;
      return !query || `${action.en} ${action.vi} ${action.descEn} ${action.descVi}`.toLocaleLowerCase().includes(query);
    });
    const grid = $('#action-library-grid');
    if (!available.length) {
      grid.innerHTML = `<div class="no-results"><span><i data-lucide="${state.reviewIds.length === Object.keys(MODULES).length ? 'check-circle-2' : 'search-x'}"></i></span><h3>${state.language === 'vi' ? 'Không còn hành động phù hợp' : 'No available actions found'}</h3><p>${state.language === 'vi' ? 'Thử từ khóa khác hoặc đóng thư viện.' : 'Try another search or close the library.'}</p></div>`;
      refreshIcons();
      return;
    }
    grid.innerHTML = available.map(([id, action]) => `<button class="action-library-item" type="button" data-add-action="${id}"><span><i data-lucide="${action.icon}"></i></span><div><strong>${actionLabel(action)}</strong><small>${actionDescription(action)}</small></div><i data-lucide="plus"></i></button>`).join('');
    grid.querySelectorAll('[data-add-action]').forEach((button) => button.addEventListener('click', () => addAction(button.dataset.addAction)));
    refreshIcons();
  }

  function openActionLibrary() {
    state.actionQuery = '';
    $('#action-search-input').value = '';
    renderActionLibrary();
    openModal($('#template-action-modal'));
  }

  function addAction(id) {
    if (!MODULES[id] || state.reviewIds.includes(id)) return;
    state.reviewIds.push(id);
    state.enabled.add(id);
    if (actionIds(industryById(state.selected)).includes(id)) state.customActionIds.delete(id);
    else state.customActionIds.add(id);
    sortActionsByActive();
    renderReviewActions();
    renderPreview();
    renderActionLibrary();
    showToast(state.language === 'vi' ? `Đã thêm “${MODULES[id].vi}”.` : `“${MODULES[id].en}” added to the menu.`);
  }

  function resetReviewActions() {
    const industry = industryById(state.selected);
    if (!industry) return;
    const recommendedIds = actionIds(industry);
    const recommendedSet = new Set(recommendedIds);
    const customIds = [...state.customActionIds].filter((id) => MODULES[id] && !recommendedSet.has(id));
    const enabledCustomIds = customIds.filter((id) => state.enabled.has(id));
    state.reviewIds = [...recommendedIds, ...customIds];
    state.customActionIds = new Set(customIds);
    state.enabled = new Set([...recommendedIds, ...enabledCustomIds]);
    sortActionsByActive();
    renderReviewActions();
    renderPreview();
    const customCount = customIds.length;
    showToast(state.language === 'vi'
      ? `Đã khôi phục đề xuất${customCount ? ` và giữ ${customCount} action bạn tự thêm` : ''}.`
      : `Recommendations restored${customCount ? `; ${customCount} added ${customCount === 1 ? 'action was' : 'actions were'} kept` : ''}.`);
  }

  function applyTemplate() {
    const activeIds = currentReviewIds().filter((id) => state.enabled.has(id));
    if (!activeIds.length) {
      showToast(state.language === 'vi' ? 'Hãy bật ít nhất một hành động trước khi áp dụng.' : 'Turn on at least one action before applying.');
      return;
    }
    const industry = industryById(state.selected);
    const payload = {
      version: 2,
      industryId: industry.id,
      industryLabel: industry.en,
      groupId: industry.groupId,
      language: state.language,
      actionIds: activeIds,
      reviewIds: currentReviewIds(),
      customActionIds: [...state.customActionIds].filter((id) => state.reviewIds.includes(id)),
      actionTitles: Object.fromEntries(currentReviewIds().map((id) => [id, actionTitleValue(id)])),
      actionLinks: Object.fromEntries(currentReviewIds().map((id) => [id, actionLink(id)])),
      actionIcons: Object.fromEntries(currentReviewIds().filter((id) => state.actionIcons[id]).map((id) => [id, state.actionIcons[id]])),
      actions: activeIds.map((id) => ({ id, label: displayActionTitle(id), icon: actionIconValue(id), url: actionLink(id) })),
      appliedAt: new Date().toISOString()
    };
    state.applied = payload;
    state.reviewSnapshot = null;
    saveAppliedTemplate(payload);
    closeModal($('#template-review-modal'));
    $('#success-action-count').textContent = activeIds.length;
    $('#success-template-name').textContent = label(industry);
    $('#success-message').textContent = state.language === 'vi'
      ? `Mẫu ${industry.vi} đã được áp dụng. Hãy kiểm tra đường dẫn và nhãn trước khi chia sẻ mã QR.`
      : `The ${industry.en} template has been applied. Review links and labels before sharing your QR.`;
    setProgress(3);
    renderAppliedTemplate();
    renderPreview();
    openModal($('#template-success-modal'));
  }

  function setProgress(step) {
    $$('[data-progress-step]').forEach((item) => {
      const itemStep = Number(item.dataset.progressStep);
      item.classList.toggle('is-active', itemStep === step);
      item.classList.toggle('is-complete', itemStep < step || (step === 3 && itemStep === 3));
    });
  }

  function renderAppliedTemplate() {
    const bar = $('#applied-template-bar');
    const industry = state.applied && industryById(state.applied.industryId);
    bar.hidden = !industry;
    if (!industry) return;
    const count = state.applied.actionIds.length;
    const customCount = savedCustomActionIds(state.applied).filter((id) => state.applied.actionIds.includes(id)).length;
    $('#applied-template-icon').textContent = industry.icon;
    $('#applied-template-name').textContent = state.language === 'vi' ? industry.vi : industry.en;
    $('#applied-template-meta').textContent = state.language === 'vi'
      ? `${count} hành động đang bật${customCount ? ` · ${customCount} action tự thêm` : ''}`
      : `${count} active customer ${count === 1 ? 'action' : 'actions'}${customCount ? ` · ${customCount} added by you` : ''}`;
    refreshIcons();
  }

  function setActionIcon(id, icon) {
    if (!MODULES[id]) return;
    if (icon) state.actionIcons[id] = icon;
    else delete state.actionIcons[id];
    renderPreview();
  }

  function renderActionIconPicker() {
    const id = state.editingIconId;
    if (!id || !MODULES[id]) return;
    $('#icon-picker-action-name').textContent = displayActionTitle(id);
    const selected = actionIconValue(id);
    $('#action-icon-grid').innerHTML = ACTION_ICON_CHOICES.map((icon) => `<button type="button" data-action-icon-choice="${icon}" class="${selected === icon ? 'is-selected' : ''}" aria-label="Use ${icon} icon" aria-pressed="${selected === icon}"><i data-lucide="${icon}" aria-hidden="true"></i></button>`).join('');
    $('#reset-action-icon').disabled = !state.actionIcons[id];
    $('#action-icon-grid').querySelectorAll('[data-action-icon-choice]').forEach((button) => button.addEventListener('click', () => {
      setActionIcon(id, button.dataset.actionIconChoice);
      closeModal($('#action-icon-modal'));
    }));
    refreshIcons();
  }

  function openActionIconPicker(id) {
    if (!MODULES[id]) return;
    state.editingIconId = id;
    renderActionIconPicker();
    openModal($('#action-icon-modal'));
  }

  function uploadActionIcon(event) {
    const file = event.target.files?.[0];
    const id = state.editingIconId;
    event.target.value = '';
    if (!file || !id || !MODULES[id]) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
      showToast(state.language === 'vi' ? 'Chỉ hỗ trợ PNG, JPG, WebP hoặc GIF.' : 'Use a PNG, JPG, WebP, or GIF image.');
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast(state.language === 'vi' ? 'Icon phải nhỏ hơn 1 MB.' : 'Icon must be smaller than 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string' || !isUploadedIcon(reader.result)) return;
      setActionIcon(id, reader.result);
      closeModal($('#action-icon-modal'));
      showToast(state.language === 'vi' ? 'Đã tải icon lên.' : 'Icon uploaded.');
    });
    reader.readAsDataURL(file);
  }

  const modalOpeners = new WeakMap();

  function openModal(modal) {
    modalOpeners.set(modal, document.activeElement);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => modal.querySelector('.template-modal-dialog button, .template-modal-dialog a, .template-modal-dialog input')?.focus(), 0);
  }

  function closeModal(modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (!$$('.template-modal:not([hidden])').length) document.body.style.overflow = '';
    const opener = modalOpeners.get(modal);
    if (opener && opener.offsetParent !== null && typeof opener.focus === 'function') opener.focus();
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
    renderAppliedTemplate();
    renderContactStatus();
    if (!$('#template-review-modal').hidden) {
      const industry = industryById(state.selected);
      $('#review-template-name').textContent = label(industry);
      $('#review-template-name-secondary').textContent = language === 'vi' ? industry.en : industry.vi;
      renderReviewActions();
    }
    if (!$('#template-action-modal').hidden) renderActionLibrary();
  }

  function closeReview() {
    closeModal($('#template-review-modal'));
    if (state.reviewSnapshot) {
      state.selected = state.reviewSnapshot.selected;
      state.reviewIds = [...state.reviewSnapshot.reviewIds];
      state.enabled = new Set(state.reviewSnapshot.enabled);
      state.customActionIds = new Set(state.reviewSnapshot.customActionIds);
      state.reviewSnapshot = null;
      renderIndustries();
      renderPreview();
    }
    setProgress(1);
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
    $('#add-action-button').addEventListener('click', openActionLibrary);
    $('#reset-actions-button').addEventListener('click', resetReviewActions);
    $('#action-search-input').addEventListener('input', (event) => {
      state.actionQuery = event.target.value;
      renderActionLibrary();
    });
    $('#apply-template-button').addEventListener('click', applyTemplate);
    $$('[data-close-template-modal]').forEach((button) => button.addEventListener('click', closeReview));
    $$('[data-close-action-modal]').forEach((button) => button.addEventListener('click', () => closeModal($('#template-action-modal'))));
    $$('[data-close-icon-modal]').forEach((button) => button.addEventListener('click', () => closeModal($('#action-icon-modal'))));
    $$('[data-close-success-modal]').forEach((button) => button.addEventListener('click', () => closeModal($('#template-success-modal'))));
    $$('[data-show-business-rule]').forEach((button) => button.addEventListener('click', () => openModal($('#template-help-modal'))));
    $$('[data-close-help-modal]').forEach((button) => button.addEventListener('click', () => closeModal($('#template-help-modal'))));
    $$('[data-change-template], [data-open-industry-picker]').forEach((button) => button.addEventListener('click', openIndustryPickerPage));
    $('#close-industry-picker').addEventListener('click', returnToTemplateEditor);
    $('#open-contact-card-button').addEventListener('click', openContactCard);
    $('#editor-contact-card').addEventListener('click', openContactCard);
    $('#editor-add-action').addEventListener('click', openActionLibrary);
    $('#editor-reset-actions').addEventListener('click', resetReviewActions);
    $('#editor-review-template').addEventListener('click', applyTemplate);
    $('#action-icon-upload').addEventListener('change', uploadActionIcon);
    $('#reset-action-icon').addEventListener('click', () => {
      const id = state.editingIconId;
      if (!id) return;
      setActionIcon(id, null);
      closeModal($('#action-icon-modal'));
    });
    $('#editor-add-link').addEventListener('click', addPastedLink);
    $('#editor-link-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addPastedLink();
      }
    });
    $$('[data-close-contact-card]').forEach((button) => button.addEventListener('click', () => closeModal($('#contact-card-modal'))));
    $('#contact-card-form').addEventListener('submit', saveContactCard);
    $('#contact-card-form').addEventListener('input', () => { readContactForm(); renderContactPreview(); });
    $('#contact-card-form').addEventListener('change', () => { readContactForm(); renderContactPreview(); });
    $$('[data-contact-theme]').forEach((button) => button.addEventListener('click', () => {
      contactDraft.theme = button.dataset.contactTheme;
      $$('[data-contact-theme]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      renderContactPreview();
    }));
    $('#contact-import-button').addEventListener('click', importContactDemo);
    $('#download-vcard-button').addEventListener('click', downloadVCard);
    document.addEventListener('pointermove', updatePointerDrag, { passive: false });
    document.addEventListener('pointerup', () => finishPointerDrag(true));
    document.addEventListener('pointercancel', () => finishPointerDrag(false));
    document.addEventListener('keydown', (event) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        const pickerOpen = !$('#industry-picker-view').hidden;
        $(pickerOpen ? '#industry-search-input' : '#editor-link-input').focus();
      }
      if (event.key === 'Escape') {
        const openModals = $$('.template-modal:not([hidden])');
        const topModal = openModals[openModals.length - 1];
        if (topModal === $('#template-review-modal')) closeReview();
        else if (topModal) closeModal(topModal);
      }
    });
  }

  function initIndustryPickerPage() {
    state.applied = loadAppliedTemplate();
    try {
      const draft = JSON.parse(window.sessionStorage.getItem(INDUSTRY_DRAFT_KEY) || 'null');
      state.selected = industryById(draft?.selected)?.id || industryById(state.applied?.industryId)?.id || 'nails';
      state.language = draft?.language === 'vi' ? 'vi' : 'en';
    } catch (error) {
      state.selected = industryById(state.applied?.industryId)?.id || 'nails';
    }
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
    $$('[data-language]').forEach((button) => button.addEventListener('click', () => {
      state.language = button.dataset.language;
      $$('[data-language]').forEach((item) => {
        const active = item.dataset.language === state.language;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderGroups();
      renderIndustries();
    }));
    $$('[data-language]').forEach((button) => {
      const active = button.dataset.language === state.language;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        $('#industry-search-input').focus();
      }
    });
    renderGroups();
    renderIndustries();
    refreshIcons();
  }

  if (document.body.dataset.oneqrScreen === 'industry-picker') {
    initIndustryPickerPage();
    return;
  }

  state.applied = loadAppliedTemplate();
  let draftState = null;
  try {
    draftState = JSON.parse(window.sessionStorage.getItem(INDUSTRY_DRAFT_KEY) || 'null');
    window.sessionStorage.removeItem(INDUSTRY_DRAFT_KEY);
  } catch (error) {
    draftState = null;
  }
  ensureCustomLinkModules(draftState?.reviewIds);
  ensureCustomLinkModules(state.applied?.reviewIds || state.applied?.actionIds);
  if (draftState && industryById(draftState.selected)) {
    state.selected = draftState.selected;
    state.reviewIds = (draftState.reviewIds || []).filter((id) => MODULES[id]);
    state.enabled = new Set((draftState.enabledIds || []).filter((id) => MODULES[id]));
    state.customActionIds = new Set((draftState.customActionIds || []).filter((id) => MODULES[id]));
    state.actionTitles = draftState.actionTitles && typeof draftState.actionTitles === 'object' ? { ...draftState.actionTitles } : {};
    state.actionLinks = draftState.actionLinks && typeof draftState.actionLinks === 'object' ? { ...draftState.actionLinks } : {};
    state.actionIcons = draftState.actionIcons && typeof draftState.actionIcons === 'object' ? { ...draftState.actionIcons } : {};
    state.language = draftState.language === 'vi' ? 'vi' : 'en';
  } else if (state.applied) {
    const appliedIndustry = industryById(state.applied.industryId);
    state.selected = appliedIndustry.id;
    state.reviewIds = (state.applied.reviewIds || state.applied.actionIds).filter((id) => MODULES[id]);
    state.enabled = new Set(state.applied.actionIds.filter((id) => MODULES[id]));
    state.customActionIds = new Set(savedCustomActionIds(state.applied));
    state.actionTitles = state.applied.actionTitles && typeof state.applied.actionTitles === 'object' ? { ...state.applied.actionTitles } : {};
    state.actionLinks = state.applied.actionLinks && typeof state.applied.actionLinks === 'object' ? { ...state.applied.actionLinks } : {};
    state.actionIcons = state.applied.actionIcons && typeof state.applied.actionIcons === 'object' ? { ...state.applied.actionIcons } : {};
  } else {
    const defaultIndustry = industryById('nails');
    state.selected = defaultIndustry.id;
    state.reviewIds = actionIds(defaultIndustry);
    state.enabled = new Set(state.reviewIds);
  }
  try {
    const pendingIndustryId = window.localStorage.getItem(INDUSTRY_SELECTION_KEY);
    window.localStorage.removeItem(INDUSTRY_SELECTION_KEY);
    if (industryById(pendingIndustryId)) applyIndustrySelection(pendingIndustryId);
  } catch (error) {
    // Keep the restored editor state when storage is unavailable.
  }
  sortActionsByActive();
  bindEvents();
  renderGroups();
  renderIndustries();
  renderPreview();
  renderAppliedTemplate();
  renderContactStatus();
  showTemplateEditor();
  refreshIcons();
}());
