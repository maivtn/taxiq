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
  const searchMetadata = {
    f2: { industry: 'drink', price: 6, keywords: 'tra sua boba milk tea do uong', evening: true },
    x1: { industry: 'bar', price: 3, keywords: 'bia bar beer happy hour' },
    f4: { industry: 'food', price: 25, keywords: 'an toi crawfish tom hai san dinner', evening: true },
    f3: { industry: 'bakery', price: null, keywords: 'banh ngot cake bakery sinh nhat' },
    a1: { industry: 'carwash', price: 12, keywords: 'rua xe car wash' },
    d1: { industry: 'dental', price: 79, keywords: 'nha si rang dental' },
    p1: { industry: 'pet', price: 45, keywords: 'cho meo thu cung pet grooming' },
    f1: { industry: 'food', price: 9, keywords: 'pho an trua an toi mon viet food', lunch: true },
    m1: { industry: 'market', price: null, keywords: 'cho sieu thi di cho market grocery' }
  };
  offers.forEach(offer => Object.assign(offer, searchMetadata[offer.id]));
  const ownOffers = [
    { id: 'own1', own: true, business: 'Bitcoin Nail Bar', group: 'beauty', industry: 'nail', price: null, keywords: 'pedicure chan nail', title: ['Nâng cấp pedicure: đá nóng + mặt nạ', 'Pedicure upgrade: hot stones + mask'], value: '+$15', valueLabel: ['THÊM', 'EXTRA'], condition: ['Khi làm pedicure', 'With a pedicure'], ...shop, color: '#6d28d9' },
    { id: 'own2', own: true, business: 'Bitcoin Nail Bar', group: 'beauty', industry: 'nail', price: 48, keywords: 'gel-x gel nail mong', title: ['Khách mới giảm 20% Gel-X', 'New customers get 20% off Gel-X'], value: '20%', valueLabel: ['GIẢM', 'OFF'], condition: ['Khách mới · 1 lần/khách', 'New customers · once per customer'], ...shop, color: '#db2777', quantity: 50, left: 31, rule: 'booking' }
  ];
  const hiddenOffers = [
    { id: 'n1', business: 'Golden Nails & Spa', group: 'beauty', industry: 'nail', price: 30, keywords: 'pedicure nail chan', title: ['Pedicure spa giảm $10 thứ 2–4', '$10 off spa pedicure Mon–Wed'], latitude: 29.7400, longitude: -95.4700 },
    { id: 'h1', business: 'Saigon Hair Studio', group: 'beauty', industry: 'hair', price: 25, keywords: 'toc cat hair', title: ['Cắt tóc tặng gội sấy', 'Haircut with free wash & blow-dry'], latitude: 29.7290, longitude: -95.4550 },
    { id: 's1', business: 'Lotus Spa Bellaire', group: 'beauty', industry: 'spa', price: 49, keywords: 'massage spa xoa bop', evening: true, title: ['Massage 60 phút giá $49', '60-minute massage for $49'], latitude: 29.7060, longitude: -95.4600 }
  ];
  window.OneQrDealCatalog = { shop, zips, offers, competitors, ownOffers, hiddenOffers };
})();
