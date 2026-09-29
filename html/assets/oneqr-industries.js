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

  const DEFAULT_ACTION_LINKS = {
    booking: 'https://booking.nexoratouch.com/bitcoin-nail-bar',
    tip: 'https://pay.nexoratouch.com/bitcoin-nail-bar',
    review: 'https://g.page/r/bitcoin-nail-bar/review',
    call: 'tel:+13468024906',
    directions: 'https://maps.google.com/?q=Bitcoin+Nail+Bar',
    contact: 'sms:+13468024906',
    contactcard: 'https://nexoratouch.com/c/bitcoin-nail-bar'
  };

  const industries = GROUPS.flatMap(group => group.items.split('|').map(raw => {
    const [id, en, vi] = raw.split('~');
    return { id, en, vi, groupId: group.id, icon: group.icon };
  }));
  window.ONEQR_INDUSTRIES = {
    groups: GROUPS, modules: MODULES, industries,
    recommended: industry => [...(SPECIAL_DEFAULTS[industry.id] || DEFAULTS[industry.groupId])],
    actionUrl: id => DEFAULT_ACTION_LINKS[id] || 'https://nexoratouch.com/o/bitcoin-nail-bar/' + id
  };
})();
