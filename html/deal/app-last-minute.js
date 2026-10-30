const baseDeals = [
  {
    id: "nx-gel-combo",
    category: "manicure",
    salon: "Nexora Touch Nail Spa",
    title: "Gel manicure + nail art tối giản",
    price: 39,
    original: 55,
    discount: "SAVE $16",
    distance: 0.8,
    rating: 4.9,
    reviews: 186,
    deadline: "Còn 2 ngày",
    badge: "NEXORA EXCLUSIVE",
    verified: true,
    inventory: 8,
    instant: true,
    image: "./assets/nexora-nail-deal-featured-banner.png",
    description: "Bộ gel manicure chỉn chu kèm 2 móng nail art tối giản. Phù hợp cho lịch hẹn nhanh trong tuần và được xác minh trực tiếp từ Nexora Touch.",
    schedule: "Mon–Thu · 10 AM–4 PM",
    location: "Garden Grove, CA",
    terms: "Appointment required. Soak-off, extra length và 3D art tính riêng. Mỗi khách dùng 1 lần; không cộng dồn ưu đãi khác.",
    bookingSlug: "bitcoin-nail-bar",
  },
  {
    id: "btc-new-set",
    category: "gel-x",
    salon: "Bitcoin Nail Bar",
    title: "Khách mới: giảm 20% full set Gel-X",
    price: 48,
    original: 60,
    discount: "20% OFF",
    distance: 1.4,
    rating: 4.8,
    reviews: 142,
    deadline: "Hôm nay · 4 suất",
    badge: "KHÁCH MỚI",
    verified: true,
    inventory: 4,
    instant: true,
    description: "Ưu đãi dành cho lần đặt lịch đầu tiên với full set Gel-X chiều dài short hoặc medium.",
    schedule: "Tue–Fri · 11 AM–5 PM",
    location: "West Garden Grove, CA",
    terms: "Khách mới. Giảm tối đa $12; charm, soak-off và extra length không bao gồm.",
    bookingSlug: "bitcoin-nail-bar",
  },
  {
    id: "glow-pedi",
    category: "pedicure",
    salon: "Glow Nail Atelier",
    title: "Weekday pedi reset + hot towel",
    price: 35,
    original: 50,
    discount: "SAVE $15",
    distance: 2.1,
    rating: 4.9,
    reviews: 98,
    deadline: "Mon–Thu · trước 3 PM",
    badge: "HAPPY HOUR",
    verified: true,
    offerClass: "deal",
    unlimitedInventory: true,
    inventory: null,
    instant: false,
    description: "Pedicure thư giãn trong tuần gồm chăm sóc cơ bản, sơn màu thường và hot towel.",
    schedule: "Mon–Thu · 10 AM–3 PM",
    location: "Garden Grove, CA",
    terms: "Không áp dụng gel polish hoặc French tips. Cần đặt lịch trước tối thiểu 2 giờ.",
    bookingSlug: "bitcoin-nail-bar",
  },
  {
    id: "luna-art",
    category: "nail-art",
    salon: "Luna Studio",
    title: "Nail art freestyle — 2 accent nails",
    price: 12,
    original: 20,
    discount: "SAVE $8",
    distance: 2.8,
    rating: 4.7,
    reviews: 74,
    deadline: "Còn 6 suất tuần này",
    badge: "ADD-ON DEAL",
    verified: false,
    inventory: 6,
    instant: false,
    description: "Thêm 2 accent nails freestyle vào bất kỳ manicure hoặc full set đủ điều kiện nào.",
    schedule: "Wed–Sun · giờ mở cửa",
    location: "Westminster, CA",
    terms: "Phải mua kèm dịch vụ manicure hoặc full set. Không gồm 3D art, portrait hoặc charm.",
    bookingSlug: "bitcoin-nail-bar",
  },
  {
    id: "serene-dip",
    category: "manicure",
    salon: "Serene Nails & Co.",
    title: "Dip powder refresh + soak-off",
    price: 42,
    original: 58,
    discount: "SAVE $16",
    distance: 3.4,
    rating: 4.8,
    reviews: 121,
    deadline: "Chỉ còn cuối tuần này",
    badge: "WEEKEND DROP",
    verified: true,
    inventory: 10,
    instant: true,
    description: "Dip powder refresh với soak-off bộ cũ, tạo form và một màu tiêu chuẩn.",
    schedule: "Sat–Sun · 9 AM–2 PM",
    location: "Anaheim, CA",
    terms: "Áp dụng một màu; ombré, French và extension tính thêm. Giới hạn 1 coupon/khách.",
    bookingSlug: "bitcoin-nail-bar",
  },
  {
    id: "opal-classic",
    category: "pedicure",
    salon: "Opal Beauty Lounge",
    title: "Classic mani + pedi weekday combo",
    price: 52,
    original: 70,
    discount: "SAVE $18",
    distance: 4.2,
    rating: 4.6,
    reviews: 63,
    deadline: "Kết thúc sau 5 ngày",
    badge: "COMBO DEAL",
    verified: true,
    inventory: 15,
    instant: false,
    description: "Combo manicure và pedicure cổ điển cho ngày thường, gồm sơn màu tiêu chuẩn.",
    schedule: "Mon–Wed · 10 AM–5 PM",
    location: "Fountain Valley, CA",
    terms: "Không áp dụng gel polish. Cần đặt lịch; không cộng dồn membership reward.",
    bookingSlug: "bitcoin-nail-bar",
  },
  {
    id: "harbor-dinner",
    category: "restaurant",
    salon: "Harbor Kitchen",
    title: "Chef's dinner rescue box",
    price: 8,
    original: 22,
    discount: "SAVE $14",
    distance: 0.6,
    rating: 4.8,
    reviews: 214,
    deadline: "Pickup by 8:45 PM",
    badge: "PREPARED TODAY",
    lastMinuteOnly: true,
    verified: true,
    inventory: 6,
    inventoryLabel: "6 hộp còn lại",
    instant: true,
    image: "./assets/last-minute-food-rescue.png",
    description: "Bữa tối do bếp chọn từ các món được chuẩn bị trong ngày, đóng hộp sẵn để khách đến nhận trước giờ đóng cửa.",
    schedule: "Hôm nay · nhận 8:15–8:45 PM",
    location: "Garden Grove, CA",
    terms: "Prepared today. Thành phần thay đổi theo tồn kho; xem thông tin dị ứng tại quầy. Cần nhận đúng giờ và bảo quản lạnh nếu chưa dùng ngay.",
    bookingSlug: "harbor-kitchen",
  },
  {
    id: "morning-pastry",
    category: "bakery",
    salon: "Morning Crumb Bakery",
    title: "Surprise pastry bag · baked today",
    price: 7,
    original: 21,
    discount: "SAVE $14",
    distance: 1.1,
    rating: 4.9,
    reviews: 167,
    deadline: "Pickup by 7 PM",
    badge: "BAKED TODAY",
    lastMinuteOnly: true,
    verified: true,
    inventory: 4,
    inventoryLabel: "4 túi còn lại",
    instant: true,
    image: "./assets/last-minute-food-rescue.png",
    description: "Túi bánh bất ngờ gồm croissant và pastry còn tươi trong ngày. Thành phần cụ thể tùy lượng bánh còn lại khi đóng gói.",
    schedule: "Hôm nay · nhận 6:30–7 PM",
    location: "Garden Grove, CA",
    terms: "Baked today. Có thể chứa gluten, trứng, sữa hoặc hạt. Không chọn từng loại bánh; cần nhận trước thời hạn hiển thị.",
    bookingSlug: "morning-crumb-bakery",
  },
  {
    id: "fresh-produce",
    category: "grocery",
    salon: "Fresh Lane Market",
    title: "Fresh produce rescue box",
    price: 10,
    original: 28,
    discount: "SAVE $18",
    distance: 1.7,
    rating: 4.7,
    reviews: 89,
    deadline: "Pickup by 8 PM",
    badge: "FRESH TODAY",
    lastMinuteOnly: true,
    verified: true,
    inventory: 5,
    inventoryLabel: "5 hộp còn lại",
    instant: true,
    description: "Hộp rau củ và trái cây còn tốt được cửa hàng tuyển chọn vào cuối ngày để bán nhanh thay vì bỏ đi.",
    schedule: "Hôm nay · nhận trước 8 PM",
    location: "Garden Grove, CA",
    terms: "Nội dung hộp thay đổi theo tồn kho. Kiểm tra sản phẩm khi nhận; không bao gồm hàng quá hạn hoặc không còn an toàn.",
    bookingSlug: "fresh-lane-market",
  },
  {
    id: "bloom-bouquet",
    category: "flowers",
    salon: "Bloom Local",
    title: "Florist's choice bouquet",
    price: 18,
    original: 45,
    discount: "SAVE $27",
    distance: 2.3,
    rating: 4.9,
    reviews: 104,
    deadline: "Pickup by 7:30 PM",
    badge: "SAME-DAY BLOOMS",
    lastMinuteOnly: true,
    verified: true,
    inventory: 3,
    inventoryLabel: "3 bó còn lại",
    instant: true,
    description: "Bó hoa do florist chọn từ hoa tươi trong ngày, phối sẵn và có thể nhận nhanh trước giờ đóng cửa.",
    schedule: "Hôm nay · nhận trước 7:30 PM",
    location: "Garden Grove, CA",
    terms: "Màu và loại hoa thay đổi theo tồn kho. Ảnh chỉ minh họa phong cách; cần nhận trong ngày.",
    bookingSlug: "bloom-local",
  },
  {
    id: "cho-viet-market-box",
    category: "market",
    salon: "Chợ Việt Garden Grove",
    title: "Combo rau củ & trái cây cuối buổi",
    price: 9,
    original: 24,
    discount: "SAVE $15",
    distance: 1.3,
    rating: 4.8,
    reviews: 118,
    deadline: "Nhận trước 6:30 PM",
    badge: "CHỢ TAN BUỔI",
    lastMinuteOnly: true,
    verified: true,
    inventory: 8,
    inventoryLabel: "8 phần còn lại",
    instant: true,
    image: "./assets/last-minute-food-rescue.png",
    description: "Combo rau củ và trái cây còn tươi trong ngày do tiểu thương chọn, đóng sẵn để khách nhận nhanh trước khi chợ tan buổi.",
    schedule: "Hôm nay · nhận tại sạp trước 6:30 PM",
    location: "Garden Grove, CA",
    terms: "Hàng còn tươi trong ngày và số lượng thực tế tại sạp. Không bao gồm hàng quá hạn; khách kiểm tra phần hàng khi nhận và cần đến trước giờ hiển thị.",
    bookingSlug: "cho-viet-garden-grove",
  },
  {
    id: "autoshine-express",
    category: "auto",
    salon: "AutoShine Express",
    title: "Express interior clean · cancellation slot",
    price: 19,
    original: 39,
    discount: "SAVE $20",
    distance: 2.8,
    rating: 4.7,
    reviews: 132,
    deadline: "Today · 6:15 PM",
    badge: "LAST OPENING",
    lastMinuteOnly: true,
    verified: true,
    inventory: 1,
    inventoryLabel: "1 suất còn lại",
    instant: true,
    description: "Suất vừa trống cho vệ sinh nhanh nội thất xe: hút bụi, lau bề mặt và kính bên trong.",
    schedule: "Hôm nay · 6:15 PM",
    location: "Garden Grove, CA",
    terms: "Áp dụng xe sedan hoặc compact SUV. Vết bẩn sâu, lông thú và detailing toàn bộ tính riêng.",
    bookingSlug: "autoshine-express",
  },
];

function safeRead(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

const customDeals = safeRead("nexora-custom-deals", []);
let deals = [...customDeals, ...baseDeals];
let savedDeals = new Set(safeRead("nexora-saved-deals", []));
let serviceRequests = safeRead("nexora-service-requests", []);
let claimedDeals = safeRead("nexora-claimed-deals", {});
let oneqrEarnings = Object.assign({
  scans: 0,
  menuViews: 0,
  dealOpens: 0,
  searches: 0,
  purchases: 0,
  adRevenue: 0,
  conversionBonus: 0,
}, safeRead("nexora-oneqr-earnings", {}));
if (localStorage.getItem("nexora-earnings-policy-version") !== "2") {
  const legacySearchRevenue = Number(oneqrEarnings.searches || 0) * .02;
  oneqrEarnings.adRevenue = Math.max(0, Number(oneqrEarnings.adRevenue || 0) - legacySearchRevenue);
  localStorage.setItem("nexora-earnings-policy-version", "2");
  localStorage.setItem("nexora-oneqr-earnings", JSON.stringify(oneqrEarnings));
}
let attributionEvents = safeRead("nexora-attribution-events", []);
let adsCredit = Number(localStorage.getItem("nexora-ads-credit") || 250);
let activeDealId = null;
let activeAttributionSource = null;
let toastTimer;
const sessionRevenueEvents = new Set();

const state = {
  activeIndustry: "beauty",
  activeBusinessCategory: "nail",
  activeCategory: "all",
  savedOnly: false,
  maxPrice: Number.POSITIVE_INFINITY,
  maxDistance: 5,
  verifiedOnly: false,
};

const dealGrid = document.querySelector("#dealGrid");
const emptyState = document.querySelector("#emptyState");
const navSavedCount = document.querySelector("#navSavedCount");
const searchInput = document.querySelector("#searchInput");
const locationInput = document.querySelector("#locationInput");
const sortSelect = document.querySelector("#sortSelect");
const resultsTitle = document.querySelector("#resultsTitle");
const resultsKicker = document.querySelector("#resultsKicker");
const dealDialog = document.querySelector("#dealDialog");
const requestDialog = document.querySelector("#requestDialog");
const mapDialog = document.querySelector("#mapDialog");
const filterDialog = document.querySelector("#filterDialog");
const businessDialog = document.querySelector("#businessDialog");
const oneqrDialog = document.querySelector("#oneqrDialog");
const couponClaimDialog = document.querySelector("#couponClaimDialog");
const openingHoldDialog = document.querySelector("#openingHoldDialog");
const functionBridgeDialog = document.querySelector("#functionBridgeDialog");
let trafficSource = null;
let incomingFunctionRoute = null;

const FUNCTION_ROUTE_MAP = {
  deals: "#discover",
  explore: "#discover",
  dcats: "#categories",
  categories: "#categories",
  dmatch: "#requests",
  match: "#requests",
  dopen: "#openings",
  openings: "#openings",
  dlast: "#last-minute",
  lastminute: "#last-minute",
  dlastt: "#my-open-slots",
  "my-open-slots": "#my-open-slots",
  coupons: "#coupons",
  dwallet: "#coupons",
  wallet: "#coupons",
  nearby: "#nearby",
};

function emitNexoraFunctionEvent(action, detail = {}) {
  const message = {
    type: "nexora:function-event",
    app: "nexora-deals",
    action,
    source: trafficSource || "nexora-deals",
    at: new Date().toISOString(),
    ...detail,
  };
  try {
    const events = safeRead("nexora-function-events", []);
    localStorage.setItem("nexora-function-events", JSON.stringify([message, ...events].slice(0, 50)));
  } catch {
    // Deep links remain functional when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent("nexora:function-event", { detail: message }));
  if (window.parent && window.parent !== window) window.parent.postMessage(message, "*");
  if (window.opener && !window.opener.closed) window.opener.postMessage(message, "*");
}

function buildTouchUrl(path, extra = {}) {
  const url = new URL(path, "https://nexoratouch.com");
  const incoming = new URLSearchParams(location.search);
  const language = document.querySelector("#languageSelect")?.value || localStorage.getItem("nexora-language") || "vi";
  url.searchParams.set("source", trafficSource || incoming.get("source") || "nexora-deals");
  url.searchParams.set("lang", language);
  ["campaign_id", "promotion_id", "oneqr_host", "ref"].forEach((key) => {
    if (incoming.get(key)) url.searchParams.set(key, incoming.get(key));
  });
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  url.searchParams.set("return_to", `${location.origin}${location.pathname}${location.search}${location.hash}`);
  return url.toString();
}

function buildNexoraAuthUrl(mode = "register") {
  const path = mode === "login" ? "/login" : "/register";
  const url = new URL(path, "https://nexoratouch.com");
  const returnUrl = `${location.origin}${location.pathname}${location.search}${location.hash}`;
  const language = document.querySelector("#languageSelect")?.value || localStorage.getItem("nexora-language") || "vi";
  url.searchParams.set("source", "nexora-deals");
  url.searchParams.set("lang", language);
  url.searchParams.set("returnUrl", returnUrl);
  return url.toString();
}

function updateNexoraAuthLinks() {
  document.querySelectorAll("[data-nexora-auth]").forEach((link) => {
    link.href = buildNexoraAuthUrl(link.dataset.nexoraAuth);
  });
}

const NEXORA_LANGUAGES = ["vi", "en", "es", "zh-TW", "ko"];
const NEXORA_HTML_LANG = { vi: "vi", en: "en", es: "es", "zh-TW": "zh-Hant", ko: "ko" };
const NEXORA_LOCALE = { vi: "vi-VN", en: "en-US", es: "es-US", "zh-TW": "zh-TW", ko: "ko-KR" };
const languageOriginalText = new WeakMap();
const languageRenderedText = new WeakMap();

const LANGUAGE_COPY = {
  en: {
    "Khám phá": "Discover",
    "Danh mục": "Categories",
    "Deal gần bạn": "Deals Nearby",
    "Coupon theo ngành": "Coupons by Category",
    "Khai trương": "Grand Openings",
    "Giờ trống của tôi": "My Open Slots",
    "Đăng nhập": "Log in",
    "Đăng ký": "Sign up",
    "Kết nối trực tiếp với Nexora Touch": "Connected directly to Nexora Touch",
    "Deal từ doanh nghiệp được kiểm duyệt và đồng bộ tự động.": "Business offers are reviewed and synced automatically.",
    "Luồng kết nối": "How it connects",
    "Trải nghiệm OneQR": "Try OneQR",
    "Cho doanh nghiệp": "For businesses",
    "Đã đồng bộ bộ lọc tìm kiếm": "Search filters synced",
    "Đã đồng bộ": "Synced",
    "Đổi tìm kiếm": "Edit search",
    "Hôm nay gần bạn": "What's worth trying",
    "có gì đáng thử?": "near you today?",
    "Một cửa vào cho deal, coupon, giờ trống và chương trình địa phương đã được Nexora xác minh.": "One place for verified local deals, coupons, open slots and programs.",
    "KHI KHÁCH ĐẾN TỪ ONEQR": "WHEN GUESTS ARRIVE FROM ONEQR",
    "Tiện ích và chương trình của tiệm luôn đứng trước": "The business menu and programs always come first",
    "Khám phá thêm chỉ hiển thị ngành bổ trợ; đối thủ trực tiếp của tiệm được chặn.": "Additional discovery shows complementary categories while direct competitors are blocked.",
    "THEO VỊ TRÍ": "BY LOCATION",
    "Xem ưu đãi quanh bạn": "See offers near you",
    "TÌM CHÍNH XÁC": "SEARCH PRECISELY",
    "Dịch vụ, giá và khu vực": "Service, price and area",
    "ĐƯỢC TÀI TRỢ · HERO": "SPONSORED · HERO",
    "Nhận tối nay": "Pick up tonight",
    "Được chuẩn bị hôm nay · nhận trước 8:45 PM": "Prepared today · pick up by 8:45 PM",
    "Xem chương trình →": "View offer →",
    "THEO ONEQR + VỊ TRÍ": "BY ONEQR + LOCATION",
    "Dành cho bạn": "For you",
    "Cập nhật trực tiếp": "Live updates",
    "Tất cả": "All",
    "Mọi ngành": "All categories",
    "Bán kính:": "Radius:",
    "Gần nhất": "Nearest",
    "Sắp hết hạn": "Expiring soon",
    "Sắp hết lượt": "Almost sold out",
    "Lấy coupon": "Get coupon",
    "Tìm deal:": "Search deals:",
    "Ví coupon": "Coupon wallet",
    "Tìm đúng ngành, danh mục và dịch vụ": "Find the right industry, category and service",
    "Khám phá ưu đãi": "Discover offers"
  },
  es: {
    "Khám phá": "Explorar", "Danh mục": "Categorías", "Deal gần bạn": "Ofertas cercanas",
    "Coupon theo ngành": "Cupones por categoría", "Khai trương": "Próximas aperturas",
    "Giờ trống của tôi": "Mis horarios libres", "Đăng nhập": "Iniciar sesión", "Đăng ký": "Crear cuenta",
    "Kết nối trực tiếp với Nexora Touch": "Conectado directamente con Nexora Touch",
    "Deal từ doanh nghiệp được kiểm duyệt và đồng bộ tự động.": "Las ofertas comerciales se revisan y sincronizan automáticamente.",
    "Luồng kết nối": "Cómo se conecta", "Trải nghiệm OneQR": "Probar OneQR", "Cho doanh nghiệp": "Para negocios",
    "Đã đồng bộ bộ lọc tìm kiếm": "Filtros de búsqueda sincronizados", "Đã đồng bộ": "Sincronizado", "Đổi tìm kiếm": "Cambiar búsqueda",
    "Hôm nay gần bạn": "¿Qué vale la pena probar", "có gì đáng thử?": "cerca de ti hoy?",
    "Một cửa vào cho deal, coupon, giờ trống và chương trình địa phương đã được Nexora xác minh.": "Un solo lugar para ofertas, cupones, horarios libres y programas locales verificados.",
    "KHI KHÁCH ĐẾN TỪ ONEQR": "CUANDO LOS CLIENTES LLEGAN DESDE ONEQR",
    "Tiện ích và chương trình của tiệm luôn đứng trước": "El menú y los programas del negocio aparecen primero",
    "Khám phá thêm chỉ hiển thị ngành bổ trợ; đối thủ trực tiếp của tiệm được chặn.": "La exploración adicional muestra categorías complementarias y bloquea competidores directos.",
    "THEO VỊ TRÍ": "POR UBICACIÓN", "Xem ưu đãi quanh bạn": "Ver ofertas cercanas",
    "TÌM CHÍNH XÁC": "BÚSQUEDA PRECISA", "Dịch vụ, giá và khu vực": "Servicio, precio y zona",
    "ĐƯỢC TÀI TRỢ · HERO": "PATROCINADO · DESTACADO", "Nhận tối nay": "Recoger esta noche",
    "Được chuẩn bị hôm nay · nhận trước 8:45 PM": "Preparado hoy · recoger antes de las 8:45 PM",
    "Xem chương trình →": "Ver oferta →", "THEO ONEQR + VỊ TRÍ": "POR ONEQR + UBICACIÓN",
    "Dành cho bạn": "Para ti", "Cập nhật trực tiếp": "Actualización en vivo", "Tất cả": "Todos",
    "Mọi ngành": "Todas las categorías", "Bán kính:": "Radio:", "Gần nhất": "Más cercanos",
    "Sắp hết hạn": "Próximos a vencer", "Sắp hết lượt": "Casi agotados", "Lấy coupon": "Obtener cupón",
    "Tìm deal:": "Buscar ofertas:", "Ví coupon": "Cartera de cupones",
    "Tìm đúng ngành, danh mục và dịch vụ": "Encuentra la industria, categoría y servicio correctos",
    "Khám phá ưu đãi": "Explorar ofertas"
  },
  "zh-TW": {
    "Khám phá": "探索", "Danh mục": "分類", "Deal gần bạn": "附近優惠", "Coupon theo ngành": "分類優惠券",
    "Khai trương": "新店開幕", "Giờ trống của tôi": "我的空檔", "Đăng nhập": "登入", "Đăng ký": "註冊",
    "Kết nối trực tiếp với Nexora Touch": "直接連接 Nexora Touch",
    "Deal từ doanh nghiệp được kiểm duyệt và đồng bộ tự động.": "商家優惠經審核後會自動同步。",
    "Luồng kết nối": "連接流程", "Trải nghiệm OneQR": "體驗 OneQR", "Cho doanh nghiệp": "商家專區",
    "Đã đồng bộ bộ lọc tìm kiếm": "搜尋條件已同步", "Đã đồng bộ": "已同步", "Đổi tìm kiếm": "修改搜尋",
    "Hôm nay gần bạn": "今天附近", "có gì đáng thử?": "有什麼值得體驗？",
    "Một cửa vào cho deal, coupon, giờ trống và chương trình địa phương đã được Nexora xác minh.": "一站探索經 Nexora 驗證的在地優惠、優惠券、空檔與活動。",
    "KHI KHÁCH ĐẾN TỪ ONEQR": "顧客從 ONEQR 進入時",
    "Tiện ích và chương trình của tiệm luôn đứng trước": "商家的選單與活動永遠優先顯示",
    "Khám phá thêm chỉ hiển thị ngành bổ trợ; đối thủ trực tiếp của tiệm được chặn.": "延伸探索只顯示互補類別，並隱藏直接競爭對手。",
    "THEO VỊ TRÍ": "依位置", "Xem ưu đãi quanh bạn": "查看附近優惠", "TÌM CHÍNH XÁC": "精準搜尋",
    "Dịch vụ, giá và khu vực": "服務、價格與地區", "ĐƯỢC TÀI TRỢ · HERO": "贊助 · 精選",
    "Nhận tối nay": "今晚取貨", "Được chuẩn bị hôm nay · nhận trước 8:45 PM": "今日製作 · 晚上 8:45 前取貨",
    "Xem chương trình →": "查看優惠 →", "THEO ONEQR + VỊ TRÍ": "依 ONEQR + 位置", "Dành cho bạn": "為你推薦",
    "Cập nhật trực tiếp": "即時更新", "Tất cả": "全部", "Mọi ngành": "所有分類", "Bán kính:": "範圍：",
    "Gần nhất": "距離最近", "Sắp hết hạn": "即將到期", "Sắp hết lượt": "即將額滿", "Lấy coupon": "領取優惠券",
    "Tìm deal:": "搜尋優惠：", "Ví coupon": "優惠券錢包", "Tìm đúng ngành, danh mục và dịch vụ": "找到正確的產業、分類與服務",
    "Khám phá ưu đãi": "探索優惠"
  },
  ko: {
    "Khám phá": "둘러보기", "Danh mục": "카테고리", "Deal gần bạn": "내 주변 혜택", "Coupon theo ngành": "업종별 쿠폰",
    "Khai trương": "신규 오픈", "Giờ trống của tôi": "내 빈 시간", "Đăng nhập": "로그인", "Đăng ký": "가입하기",
    "Kết nối trực tiếp với Nexora Touch": "Nexora Touch와 바로 연결",
    "Deal từ doanh nghiệp được kiểm duyệt và đồng bộ tự động.": "비즈니스 혜택은 검토 후 자동으로 동기화됩니다.",
    "Luồng kết nối": "연결 방식", "Trải nghiệm OneQR": "OneQR 체험", "Cho doanh nghiệp": "비즈니스용",
    "Đã đồng bộ bộ lọc tìm kiếm": "검색 필터 동기화 완료", "Đã đồng bộ": "동기화됨", "Đổi tìm kiếm": "검색 변경",
    "Hôm nay gần bạn": "오늘 내 주변에서", "có gì đáng thử?": "무엇을 경험할까요?",
    "Một cửa vào cho deal, coupon, giờ trống và chương trình địa phương đã được Nexora xác minh.": "Nexora가 인증한 지역 혜택, 쿠폰, 빈 시간과 프로그램을 한곳에서 만나보세요.",
    "KHI KHÁCH ĐẾN TỪ ONEQR": "고객이 ONEQR로 방문할 때",
    "Tiện ích và chương trình của tiệm luôn đứng trước": "매장 메뉴와 프로그램이 항상 먼저 표시됩니다",
    "Khám phá thêm chỉ hiển thị ngành bổ trợ; đối thủ trực tiếp của tiệm được chặn.": "추가 탐색에는 보완 업종만 표시되고 직접 경쟁 업체는 차단됩니다.",
    "THEO VỊ TRÍ": "위치 기준", "Xem ưu đãi quanh bạn": "주변 혜택 보기", "TÌM CHÍNH XÁC": "정확히 검색",
    "Dịch vụ, giá và khu vực": "서비스, 가격 및 지역", "ĐƯỢC TÀI TRỢ · HERO": "스폰서 · 추천",
    "Nhận tối nay": "오늘 밤 픽업", "Được chuẩn bị hôm nay · nhận trước 8:45 PM": "오늘 준비 · 오후 8:45까지 픽업",
    "Xem chương trình →": "혜택 보기 →", "THEO ONEQR + VỊ TRÍ": "ONEQR + 위치 기준", "Dành cho bạn": "회원님을 위한 추천",
    "Cập nhật trực tiếp": "실시간 업데이트", "Tất cả": "전체", "Mọi ngành": "모든 카테고리", "Bán kính:": "반경:",
    "Gần nhất": "가까운 순", "Sắp hết hạn": "마감 임박", "Sắp hết lượt": "수량 임박", "Lấy coupon": "쿠폰 받기",
    "Tìm deal:": "혜택 검색:", "Ví coupon": "쿠폰 지갑", "Tìm đúng ngành, danh mục và dịch vụ": "원하는 업종, 카테고리와 서비스 찾기",
    "Khám phá ưu đãi": "혜택 둘러보기"
  }
};

Object.assign(LANGUAGE_COPY.en, {
  "DỊCH VỤ": "SERVICE", "KHU VỰC": "AREA", "Tìm deal": "Search deals",
  "COUPON ĐÃ XÁC MINH": "VERIFIED COUPON", "MIỄN PHÍ ĐỂ KHÁM PHÁ": "FREE TO DISCOVER",
  "Giữ bằng SĐT · nhận qua SMS": "Claim by phone · receive via SMS", "ĐANG DIỄN RA": "HAPPENING NOW",
  "Giờ trống và hàng trong ngày": "Open slots and same-day inventory", "PHỔ BIẾN GẦN BẠN": "TRENDING NEARBY",
  "Deal được quan tâm nhiều": "Popular local offers", "NÓI ĐIỀU BẠN CẦN": "TELL US WHAT YOU NEED",
  "Nexora tìm thay cho bạn": "Let Nexora find it for you", "được xuất hiện tự nhiên miễn phí": "appear organically for free",
  "Tài trợ": "Sponsored", "luôn có nhãn rõ ràng": "always clearly labeled", "Vì sao tôi thấy nội dung này?": "Why am I seeing this?",
  "KHÁM PHÁ THEO NGÀNH NGHỀ": "BROWSE BY INDUSTRY", "Xem tất cả ngành nghề →": "View all industries →",
  "Ngành nghề": "Industry", "Lĩnh vực kinh doanh lớn": "Business sector", "Làm đẹp & chăm sóc cá nhân": "Beauty & personal care",
  "Ăn uống": "Food & drink", "Sức khỏe": "Health", "Nhà cửa": "Home services", "SẮP CÓ": "COMING SOON",
  "Một nhóm trong ngành nghề": "A category within an industry", "Dịch vụ Nail": "Nail services",
  "Dịch vụ cụ thể khách muốn tìm": "The specific service customers want", "Tất cả dịch vụ": "All services",
  "Bộ lọc": "Filters", "Sắp xếp:": "Sort:", "Đề xuất": "Recommended", "Tiết kiệm nhất": "Best savings",
  "Sắp kết thúc": "Ending soon", "Mở bản đồ": "Open map", "Khách mới": "New customers", "Hết hạn hôm nay": "Expires today",
  "DÀNH CHO DOANH NGHIỆP": "FOR BUSINESSES", "Tạo Deal, Coupon hoặc Last Minute trong Nexora Touch": "Create a Deal, Coupon or Last Minute offer in Nexora Touch",
  "Mở Promotion Studio ↗": "Open Promotion Studio ↗", "Không cần cài app": "No app required",
  "Khám phá nơi đáng thử": "Discover places worth trying", "ngay quanh bạn.": "right around you.",
  "Deal thật từ doanh nghiệp địa phương — tìm theo vị trí, nhu cầu và thời gian bạn muốn.": "Real offers from local businesses — search by location, need and timing.",
  "Khám phá gần tôi": "Explore near me", "Tìm theo nhu cầu": "Search by need", "ưu đãi đang chạy": "live offers",
  "nhóm ngành gần bạn": "nearby categories", "điểm trung bình": "average rating", "Tiện ích của tiệm luôn đứng trước": "The business experience always comes first",
  "Chỉ giới thiệu ngành bổ trợ, không chèn đối thủ trực tiếp.": "Only complementary categories are shown — never direct competitors.", "Đã xác minh": "Verified",
  "GẦN BẠN": "NEAR YOU", "Ưu đãi theo vị trí hiện tại": "Offers based on your location", "HÔM NAY": "TODAY",
  "Giờ trống và hàng còn tốt": "Open slots and fresh inventory", "LƯU VÀ DÙNG": "SAVE & USE", "Mã xác minh từ doanh nghiệp": "Verified codes from businesses"
});

Object.assign(LANGUAGE_COPY.es, {
  "DỊCH VỤ": "SERVICIO", "KHU VỰC": "ZONA", "Tìm deal": "Buscar ofertas",
  "COUPON ĐÃ XÁC MINH": "CUPÓN VERIFICADO", "MIỄN PHÍ ĐỂ KHÁM PHÁ": "GRATIS PARA EXPLORAR",
  "Giữ bằng SĐT · nhận qua SMS": "Obtener por teléfono · recibir por SMS", "ĐANG DIỄN RA": "DISPONIBLE AHORA",
  "Giờ trống và hàng trong ngày": "Horarios libres e inventario del día", "PHỔ BIẾN GẦN BẠN": "TENDENCIAS CERCA DE TI",
  "Deal được quan tâm nhiều": "Ofertas locales populares", "NÓI ĐIỀU BẠN CẦN": "DINOS QUÉ NECESITAS",
  "Nexora tìm thay cho bạn": "Nexora lo busca por ti", "được xuất hiện tự nhiên miễn phí": "aparecen orgánicamente gratis",
  "Tài trợ": "Patrocinado", "luôn có nhãn rõ ràng": "siempre identificado claramente", "Vì sao tôi thấy nội dung này?": "¿Por qué veo este contenido?",
  "KHÁM PHÁ THEO NGÀNH NGHỀ": "EXPLORAR POR INDUSTRIA", "Xem tất cả ngành nghề →": "Ver todas las industrias →",
  "Ngành nghề": "Industria", "Lĩnh vực kinh doanh lớn": "Sector comercial", "Làm đẹp & chăm sóc cá nhân": "Belleza y cuidado personal",
  "Ăn uống": "Comida y bebida", "Sức khỏe": "Salud", "Nhà cửa": "Servicios para el hogar", "SẮP CÓ": "PRÓXIMAMENTE",
  "Một nhóm trong ngành nghề": "Una categoría dentro de la industria", "Dịch vụ Nail": "Servicios de uñas",
  "Dịch vụ cụ thể khách muốn tìm": "El servicio específico que busca el cliente", "Tất cả dịch vụ": "Todos los servicios",
  "Bộ lọc": "Filtros", "Sắp xếp:": "Ordenar:", "Đề xuất": "Recomendados", "Tiết kiệm nhất": "Mayor ahorro",
  "Sắp kết thúc": "Terminan pronto", "Mở bản đồ": "Abrir mapa", "Khách mới": "Clientes nuevos", "Hết hạn hôm nay": "Vence hoy",
  "DÀNH CHO DOANH NGHIỆP": "PARA NEGOCIOS", "Tạo Deal, Coupon hoặc Last Minute trong Nexora Touch": "Crea una oferta, cupón o Last Minute en Nexora Touch",
  "Mở Promotion Studio ↗": "Abrir Promotion Studio ↗", "Không cần cài app": "Sin instalar una app",
  "Khám phá nơi đáng thử": "Descubre lugares que valen la pena", "ngay quanh bạn.": "muy cerca de ti.",
  "Deal thật từ doanh nghiệp địa phương — tìm theo vị trí, nhu cầu và thời gian bạn muốn.": "Ofertas reales de negocios locales — busca por ubicación, necesidad y horario.",
  "Khám phá gần tôi": "Explorar cerca de mí", "Tìm theo nhu cầu": "Buscar por necesidad", "ưu đãi đang chạy": "ofertas activas",
  "nhóm ngành gần bạn": "categorías cercanas", "điểm trung bình": "calificación media", "Tiện ích của tiệm luôn đứng trước": "La experiencia del negocio siempre va primero",
  "Chỉ giới thiệu ngành bổ trợ, không chèn đối thủ trực tiếp.": "Solo mostramos categorías complementarias, nunca competidores directos.", "Đã xác minh": "Verificado",
  "GẦN BẠN": "CERCA DE TI", "Ưu đãi theo vị trí hiện tại": "Ofertas según tu ubicación", "HÔM NAY": "HOY",
  "Giờ trống và hàng còn tốt": "Horarios libres e inventario fresco", "LƯU VÀ DÙNG": "GUARDAR Y USAR", "Mã xác minh từ doanh nghiệp": "Códigos verificados de negocios"
});

Object.assign(LANGUAGE_COPY["zh-TW"], {
  "DỊCH VỤ": "服務", "KHU VỰC": "地區", "Tìm deal": "搜尋優惠", "COUPON ĐÃ XÁC MINH": "已驗證優惠券",
  "MIỄN PHÍ ĐỂ KHÁM PHÁ": "免費探索", "Giữ bằng SĐT · nhận qua SMS": "以電話領取 · 簡訊接收", "ĐANG DIỄN RA": "現正進行",
  "Giờ trống và hàng trong ngày": "當日空檔與庫存", "PHỔ BIẾN GẦN BẠN": "附近熱門", "Deal được quan tâm nhiều": "熱門在地優惠",
  "NÓI ĐIỀU BẠN CẦN": "告訴我們你的需求", "Nexora tìm thay cho bạn": "讓 Nexora 為你尋找",
  "được xuất hiện tự nhiên miễn phí": "免費自然曝光", "Tài trợ": "贊助", "luôn có nhãn rõ ràng": "一律清楚標示",
  "Vì sao tôi thấy nội dung này?": "為什麼我會看到這個內容？", "KHÁM PHÁ THEO NGÀNH NGHỀ": "依產業探索",
  "Xem tất cả ngành nghề →": "查看所有產業 →", "Ngành nghề": "產業", "Lĩnh vực kinh doanh lớn": "商業領域",
  "Làm đẹp & chăm sóc cá nhân": "美容與個人護理", "Ăn uống": "餐飲", "Sức khỏe": "健康", "Nhà cửa": "居家服務", "SẮP CÓ": "即將推出",
  "Một nhóm trong ngành nghề": "產業中的一個分類", "Dịch vụ Nail": "美甲服務", "Dịch vụ cụ thể khách muốn tìm": "顧客想找的具體服務",
  "Tất cả dịch vụ": "所有服務", "Bộ lọc": "篩選", "Sắp xếp:": "排序：", "Đề xuất": "推薦", "Tiết kiệm nhất": "最省優惠",
  "Sắp kết thúc": "即將結束", "Mở bản đồ": "開啟地圖", "Khách mới": "新客戶", "Hết hạn hôm nay": "今天到期",
  "DÀNH CHO DOANH NGHIỆP": "商家專區", "Tạo Deal, Coupon hoặc Last Minute trong Nexora Touch": "在 Nexora Touch 建立優惠、優惠券或 Last Minute 活動",
  "Mở Promotion Studio ↗": "開啟 Promotion Studio ↗", "Không cần cài app": "無需安裝 App",
  "Khám phá nơi đáng thử": "探索值得體驗的好去處", "ngay quanh bạn.": "就在你身邊。",
  "Deal thật từ doanh nghiệp địa phương — tìm theo vị trí, nhu cầu và thời gian bạn muốn.": "在地商家的真實優惠 — 依位置、需求與時間搜尋。",
  "Khám phá gần tôi": "探索附近", "Tìm theo nhu cầu": "依需求搜尋", "ưu đãi đang chạy": "進行中優惠",
  "nhóm ngành gần bạn": "附近產業分類", "điểm trung bình": "平均評分", "Tiện ích của tiệm luôn đứng trước": "商家體驗永遠優先",
  "Chỉ giới thiệu ngành bổ trợ, không chèn đối thủ trực tiếp.": "只推薦互補類別，不插入直接競爭對手。", "Đã xác minh": "已驗證",
  "GẦN BẠN": "附近", "Ưu đãi theo vị trí hiện tại": "依目前位置顯示優惠", "HÔM NAY": "今天",
  "Giờ trống và hàng còn tốt": "空檔與新鮮庫存", "LƯU VÀ DÙNG": "儲存並使用", "Mã xác minh từ doanh nghiệp": "商家驗證優惠碼"
});

Object.assign(LANGUAGE_COPY.ko, {
  "DỊCH VỤ": "서비스", "KHU VỰC": "지역", "Tìm deal": "혜택 검색", "COUPON ĐÃ XÁC MINH": "인증 쿠폰",
  "MIỄN PHÍ ĐỂ KHÁM PHÁ": "무료 탐색", "Giữ bằng SĐT · nhận qua SMS": "전화번호로 받기 · SMS 수신", "ĐANG DIỄN RA": "지금 진행 중",
  "Giờ trống và hàng trong ngày": "당일 빈 시간과 재고", "PHỔ BIẾN GẦN BẠN": "내 주변 인기", "Deal được quan tâm nhiều": "인기 지역 혜택",
  "NÓI ĐIỀU BẠN CẦN": "필요한 것을 알려주세요", "Nexora tìm thay cho bạn": "Nexora가 대신 찾아드립니다",
  "được xuất hiện tự nhiên miễn phí": "무료로 자연 노출", "Tài trợ": "스폰서", "luôn có nhãn rõ ràng": "항상 명확하게 표시",
  "Vì sao tôi thấy nội dung này?": "이 콘텐츠가 표시되는 이유", "KHÁM PHÁ THEO NGÀNH NGHỀ": "업종별 둘러보기",
  "Xem tất cả ngành nghề →": "모든 업종 보기 →", "Ngành nghề": "업종", "Lĩnh vực kinh doanh lớn": "비즈니스 분야",
  "Làm đẹp & chăm sóc cá nhân": "뷰티 및 퍼스널 케어", "Ăn uống": "음식 및 음료", "Sức khỏe": "건강", "Nhà cửa": "홈 서비스", "SẮP CÓ": "출시 예정",
  "Một nhóm trong ngành nghề": "업종 내 카테고리", "Dịch vụ Nail": "네일 서비스", "Dịch vụ cụ thể khách muốn tìm": "고객이 찾는 구체적인 서비스",
  "Tất cả dịch vụ": "모든 서비스", "Bộ lọc": "필터", "Sắp xếp:": "정렬:", "Đề xuất": "추천", "Tiết kiệm nhất": "최대 할인",
  "Sắp kết thúc": "곧 종료", "Mở bản đồ": "지도 열기", "Khách mới": "신규 고객", "Hết hạn hôm nay": "오늘 만료",
  "DÀNH CHO DOANH NGHIỆP": "비즈니스용", "Tạo Deal, Coupon hoặc Last Minute trong Nexora Touch": "Nexora Touch에서 Deal, Coupon 또는 Last Minute 혜택 만들기",
  "Mở Promotion Studio ↗": "Promotion Studio 열기 ↗", "Không cần cài app": "앱 설치 불필요",
  "Khám phá nơi đáng thử": "경험할 만한 곳을 찾아보세요", "ngay quanh bạn.": "바로 내 주변에서.",
  "Deal thật từ doanh nghiệp địa phương — tìm theo vị trí, nhu cầu và thời gian bạn muốn.": "지역 비즈니스의 실제 혜택을 위치, 필요와 시간에 맞춰 찾아보세요.",
  "Khám phá gần tôi": "내 주변 둘러보기", "Tìm theo nhu cầu": "필요에 따라 검색", "ưu đãi đang chạy": "진행 중 혜택",
  "nhóm ngành gần bạn": "주변 업종", "điểm trung bình": "평균 평점", "Tiện ích của tiệm luôn đứng trước": "매장 경험이 항상 우선됩니다",
  "Chỉ giới thiệu ngành bổ trợ, không chèn đối thủ trực tiếp.": "보완 업종만 소개하고 직접 경쟁 업체는 표시하지 않습니다.", "Đã xác minh": "인증됨",
  "GẦN BẠN": "내 주변", "Ưu đãi theo vị trí hiện tại": "현재 위치 기반 혜택", "HÔM NAY": "오늘",
  "Giờ trống và hàng còn tốt": "빈 시간과 신선한 재고", "LƯU VÀ DÙNG": "저장 및 사용", "Mã xác minh từ doanh nghiệp": "비즈니스 인증 코드"
});

Object.assign(LANGUAGE_COPY.en, {
  "Tất cả ngành": "All industries", "BEAUTY & WELLNESS · GẦN BẠN": "BEAUTY & WELLNESS · NEAR YOU",
  "Đẹp hơn, thư giãn hơn": "Look your best and unwind", "ngay gần bạn.": "right near you.",
  "Nail, tóc, spa và chăm sóc cá nhân với deal đã được Nexora xác minh.": "Nails, hair, spa and personal care with Nexora-verified offers.",
  "Xem deal làm đẹp": "Explore beauty deals", "FOOD & MARKET · HÔM NAY": "FOOD & MARKET · TODAY",
  "Ăn ngon hôm nay": "Eat well today", "mua thông minh gần nhà.": "shop smarter close to home.",
  "Nhà hàng, tiệm bánh và chợ địa phương — từ coupon đến Last Minute trong ngày.": "Local restaurants, bakeries and markets — from coupons to same-day Last Minute offers.",
  "Khám phá đồ ăn": "Explore food deals", "HOME, AUTO & PET · GẦN BẠN": "HOME, AUTO & PET · NEAR YOU",
  "Việc cần làm quanh nhà": "Get everyday tasks handled", "tìm đúng người ngay.": "find the right local pro.",
  "Dịch vụ xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "Auto, home, pet and everyday services from verified local businesses.",
  "Xem dịch vụ gần tôi": "Explore nearby services"
});

Object.assign(LANGUAGE_COPY.es, {
  "Tất cả ngành": "Todas las industrias", "BEAUTY & WELLNESS · GẦN BẠN": "BELLEZA Y BIENESTAR · CERCA DE TI",
  "Đẹp hơn, thư giãn hơn": "Luce mejor y relájate", "ngay gần bạn.": "muy cerca de ti.",
  "Nail, tóc, spa và chăm sóc cá nhân với deal đã được Nexora xác minh.": "Uñas, cabello, spa y cuidado personal con ofertas verificadas por Nexora.",
  "Xem deal làm đẹp": "Explorar belleza", "FOOD & MARKET · HÔM NAY": "COMIDA Y MERCADO · HOY",
  "Ăn ngon hôm nay": "Come bien hoy", "mua thông minh gần nhà.": "compra mejor cerca de casa.",
  "Nhà hàng, tiệm bánh và chợ địa phương — từ coupon đến Last Minute trong ngày.": "Restaurantes, panaderías y mercados locales — desde cupones hasta ofertas Last Minute del día.",
  "Khám phá đồ ăn": "Explorar comida", "HOME, AUTO & PET · GẦN BẠN": "HOGAR, AUTO Y MASCOTAS · CERCA",
  "Việc cần làm quanh nhà": "Resuelve las tareas diarias", "tìm đúng người ngay.": "encuentra al profesional ideal.",
  "Dịch vụ xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "Servicios de auto, hogar, mascotas y vida diaria de negocios verificados.",
  "Xem dịch vụ gần tôi": "Ver servicios cercanos"
});

Object.assign(LANGUAGE_COPY["zh-TW"], {
  "Tất cả ngành": "所有產業", "BEAUTY & WELLNESS · GẦN BẠN": "美容與健康 · 就在附近",
  "Đẹp hơn, thư giãn hơn": "變美也放鬆", "ngay gần bạn.": "就在你身邊。",
  "Nail, tóc, spa và chăm sóc cá nhân với deal đã được Nexora xác minh.": "探索 Nexora 驗證的美甲、美髮、SPA 與個人護理優惠。",
  "Xem deal làm đẹp": "查看美容優惠", "FOOD & MARKET · HÔM NAY": "餐飲與市場 · 今天",
  "Ăn ngon hôm nay": "今天吃得更好", "mua thông minh gần nhà.": "在家附近聰明購物。",
  "Nhà hàng, tiệm bánh và chợ địa phương — từ coupon đến Last Minute trong ngày.": "在地餐廳、烘焙坊與市場，從優惠券到當日 Last Minute 優惠。",
  "Khám phá đồ ăn": "探索美食優惠", "HOME, AUTO & PET · GẦN BẠN": "居家、汽車與寵物 · 附近",
  "Việc cần làm quanh nhà": "處理日常大小事", "tìm đúng người ngay.": "立即找到合適專家。",
  "Dịch vụ xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "來自驗證商家的汽車、居家、寵物與日常服務。",
  "Xem dịch vụ gần tôi": "查看附近服務"
});

Object.assign(LANGUAGE_COPY.ko, {
  "Tất cả ngành": "모든 업종", "BEAUTY & WELLNESS · GẦN BẠN": "뷰티 & 웰니스 · 내 주변",
  "Đẹp hơn, thư giãn hơn": "더 아름답게, 더 편안하게", "ngay gần bạn.": "바로 내 주변에서.",
  "Nail, tóc, spa và chăm sóc cá nhân với deal đã được Nexora xác minh.": "Nexora가 인증한 네일, 헤어, 스파 및 퍼스널 케어 혜택입니다.",
  "Xem deal làm đẹp": "뷰티 혜택 보기", "FOOD & MARKET · HÔM NAY": "푸드 & 마켓 · 오늘",
  "Ăn ngon hôm nay": "오늘 더 맛있게", "mua thông minh gần nhà.": "가까운 곳에서 알뜰하게.",
  "Nhà hàng, tiệm bánh và chợ địa phương — từ coupon đến Last Minute trong ngày.": "지역 식당, 베이커리와 마켓의 쿠폰부터 당일 Last Minute 혜택까지 만나보세요.",
  "Khám phá đồ ăn": "푸드 혜택 보기", "HOME, AUTO & PET · GẦN BẠN": "홈, 자동차 & 반려동물 · 내 주변",
  "Việc cần làm quanh nhà": "일상의 할 일을 해결하세요", "tìm đúng người ngay.": "지금 맞는 전문가를 찾으세요.",
  "Dịch vụ xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "인증된 지역 비즈니스의 자동차, 홈, 반려동물 및 생활 서비스를 만나보세요.",
  "Xem dịch vụ gần tôi": "주변 서비스 보기"
});

Object.assign(LANGUAGE_COPY.en, {
  "Ưu đãi mới mỗi ngày": "Fresh offers every day", "Ưu đãi mới, khó bỏ lỡ": "Fresh offers worth catching",
  "đang ở ngay quanh bạn.": "are right around you.",
  "Deal độc quyền, chương trình lần đầu ra mắt và số lượng giới hạn từ doanh nghiệp địa phương đã được Nexora xác minh.": "Exclusive deals, first-time launches and limited offers from Nexora-verified local businesses.",
  "Khám phá ưu đãi mới": "Explore fresh offers", "Làm đẹp nhiều hơn": "More beauty and wellness",
  "chi ít hơn hôm nay.": "for less today.",
  "Khám phá deal mới, suất giờ vàng và ưu đãi giới hạn cho nail, tóc, spa và chăm sóc cá nhân.": "Discover fresh deals, golden-hour openings and limited offers for nails, hair, spa and personal care.",
  "Săn deal làm đẹp": "Find beauty deals", "Món ngon đáng thử": "Local flavors worth trying",
  "giá tốt khó bỏ lỡ.": "at prices worth catching.",
  "Combo đặc biệt, coupon trong ngày và Last Minute từ nhà hàng, tiệm bánh và chợ địa phương.": "Special combos, same-day coupons and Last Minute offers from local restaurants, bakeries and markets.",
  "Săn deal ăn uống": "Find food deals", "Việc cần làm hôm nay": "Get today's tasks handled",
  "deal tốt ngay gần nhà.": "with great deals close to home.",
  "Ưu đãi mới cho xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "Fresh offers for auto, home repair, pet care and everyday services from verified businesses.",
  "Tìm deal dịch vụ": "Find service deals", "NAIL & SPA · TRẢI NGHIỆM CAO CẤP": "NAIL & SPA · PREMIUM EXPERIENCE",
  "Thư giãn trọn vẹn": "Unwind completely", "ngay gần bạn.": "right near you.",
  "Ghế spa êm ái, kỹ thuật viên tận tâm và ưu đãi giới hạn cho manicure, pedicure và Gel-X.": "Plush spa chairs, attentive technicians and limited offers for manicures, pedicures and Gel-X.",
  "Khám phá Nail & Spa": "Explore Nail & Spa", "NHÀ HÀNG · TỐI NAY": "RESTAURANTS · TONIGHT",
  "Một bữa tối đáng nhớ": "A dinner worth remembering", "đang chờ gần bạn.": "is waiting nearby.",
  "Bàn đẹp, món đặc sắc và ưu đãi giới hạn từ nhà hàng địa phương đã xác minh.": "Beautiful tables, signature dishes and limited offers from verified local restaurants.",
  "Khám phá nhà hàng": "Explore restaurants", "TIỆM TÓC · PHONG CÁCH MỚI": "HAIR SALONS · A NEW LOOK",
  "Mái tóc bạn muốn": "The hair you want", "với giá dễ yêu.": "at a price you'll love.",
  "Cắt, tạo kiểu, nhuộm và phục hồi với ưu đãi mới từ salon gần bạn.": "Cuts, styling, color and treatments with fresh offers from salons near you.",
  "Tìm deal tiệm tóc": "Find hair salon deals", "KHÁCH SẠN · KỲ NGHỈ GẦN": "HOTELS · A GETAWAY NEARBY",
  "Đổi không khí": "Change the scenery", "không cần đi xa.": "without going far.",
  "Staycation, phòng đẹp và trải nghiệm nghỉ dưỡng với giá đặc biệt.": "Staycations, beautiful rooms and resort experiences at special prices.",
  "Khám phá khách sạn": "Explore hotels", "DU THUYỀN · TRẢI NGHIỆM BIỂN": "YACHTS · OCEAN EXPERIENCES",
  "Ra khơi theo cách": "Set sail in a way", "đáng nhớ nhất.": "you'll always remember.",
  "Chuyến ngắm hoàng hôn, tiệc riêng và trải nghiệm du thuyền được chọn lọc.": "Curated sunset cruises, private celebrations and yacht experiences.",
  "Khám phá du thuyền": "Explore yachts"
});

Object.assign(LANGUAGE_COPY.es, {
  "Ưu đãi mới mỗi ngày": "Ofertas nuevas cada día", "Ưu đãi mới, khó bỏ lỡ": "Ofertas nuevas que no querrás perder",
  "đang ở ngay quanh bạn.": "están muy cerca de ti.",
  "Deal độc quyền, chương trình lần đầu ra mắt và số lượng giới hạn từ doanh nghiệp địa phương đã được Nexora xác minh.": "Ofertas exclusivas, lanzamientos y promociones limitadas de negocios locales verificados por Nexora.",
  "Khám phá ưu đãi mới": "Explorar ofertas nuevas", "Làm đẹp nhiều hơn": "Más belleza y bienestar",
  "chi ít hơn hôm nay.": "por menos hoy.",
  "Khám phá deal mới, suất giờ vàng và ưu đãi giới hạn cho nail, tóc, spa và chăm sóc cá nhân.": "Descubre nuevas ofertas, horarios especiales y promociones limitadas de uñas, cabello, spa y cuidado personal.",
  "Săn deal làm đẹp": "Buscar ofertas de belleza", "Món ngon đáng thử": "Sabores locales para probar",
  "giá tốt khó bỏ lỡ.": "a precios irresistibles.",
  "Combo đặc biệt, coupon trong ngày và Last Minute từ nhà hàng, tiệm bánh và chợ địa phương.": "Combos especiales, cupones del día y ofertas Last Minute de restaurantes, panaderías y mercados locales.",
  "Săn deal ăn uống": "Buscar ofertas de comida", "Việc cần làm hôm nay": "Resuelve las tareas de hoy",
  "deal tốt ngay gần nhà.": "con ofertas cerca de casa.",
  "Ưu đãi mới cho xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "Nuevas ofertas de auto, reparaciones, mascotas y servicios diarios de negocios verificados.",
  "Tìm deal dịch vụ": "Buscar ofertas de servicios", "NAIL & SPA · TRẢI NGHIỆM CAO CẤP": "NAIL & SPA · EXPERIENCIA PREMIUM",
  "Thư giãn trọn vẹn": "Relájate por completo", "ngay gần bạn.": "muy cerca de ti.",
  "Ghế spa êm ái, kỹ thuật viên tận tâm và ưu đãi giới hạn cho manicure, pedicure và Gel-X.": "Sillones de spa cómodos, técnicos atentos y ofertas limitadas para manicura, pedicura y Gel-X.",
  "Khám phá Nail & Spa": "Explorar Nail & Spa", "NHÀ HÀNG · TỐI NAY": "RESTAURANTES · ESTA NOCHE",
  "Một bữa tối đáng nhớ": "Una cena para recordar", "đang chờ gần bạn.": "te espera muy cerca.",
  "Bàn đẹp, món đặc sắc và ưu đãi giới hạn từ nhà hàng địa phương đã xác minh.": "Mesas encantadoras, platos especiales y ofertas limitadas de restaurantes locales verificados.",
  "Khám phá nhà hàng": "Explorar restaurantes", "TIỆM TÓC · PHONG CÁCH MỚI": "SALONES · UN NUEVO ESTILO",
  "Mái tóc bạn muốn": "El cabello que deseas", "với giá dễ yêu.": "a un precio que amarás.",
  "Cắt, tạo kiểu, nhuộm và phục hồi với ưu đãi mới từ salon gần bạn.": "Cortes, peinados, color y tratamientos con ofertas nuevas de salones cercanos.",
  "Tìm deal tiệm tóc": "Buscar ofertas de salón", "KHÁCH SẠN · KỲ NGHỈ GẦN": "HOTELES · ESCAPADA CERCANA",
  "Đổi không khí": "Cambia de ambiente", "không cần đi xa.": "sin ir muy lejos.",
  "Staycation, phòng đẹp và trải nghiệm nghỉ dưỡng với giá đặc biệt.": "Escapadas, habitaciones hermosas y experiencias de resort a precios especiales.",
  "Khám phá khách sạn": "Explorar hoteles", "DU THUYỀN · TRẢI NGHIỆM BIỂN": "YATES · EXPERIENCIAS EN EL MAR",
  "Ra khơi theo cách": "Navega de una forma", "đáng nhớ nhất.": "que siempre recordarás.",
  "Chuyến ngắm hoàng hôn, tiệc riêng và trải nghiệm du thuyền được chọn lọc.": "Paseos al atardecer, celebraciones privadas y experiencias en yate seleccionadas.",
  "Khám phá du thuyền": "Explorar yates"
});

Object.assign(LANGUAGE_COPY["zh-TW"], {
  "Ưu đãi mới mỗi ngày": "每日都有新優惠", "Ưu đãi mới, khó bỏ lỡ": "不容錯過的全新優惠",
  "đang ở ngay quanh bạn.": "就在你身邊。",
  "Deal độc quyền, chương trình lần đầu ra mắt và số lượng giới hạn từ doanh nghiệp địa phương đã được Nexora xác minh.": "探索經 Nexora 驗證的在地商家獨家優惠、首發活動與限量名額。",
  "Khám phá ưu đãi mới": "探索全新優惠", "Làm đẹp nhiều hơn": "享受更多美容與放鬆",
  "chi ít hơn hôm nay.": "今天花得更少。",
  "Khám phá deal mới, suất giờ vàng và ưu đãi giới hạn cho nail, tóc, spa và chăm sóc cá nhân.": "探索美甲、美髮、SPA 與個人護理的全新優惠、黃金時段與限量名額。",
  "Săn deal làm đẹp": "查看美容優惠", "Món ngon đáng thử": "值得品嚐的在地美味",
  "giá tốt khó bỏ lỡ.": "好價格不容錯過。",
  "Combo đặc biệt, coupon trong ngày và Last Minute từ nhà hàng, tiệm bánh và chợ địa phương.": "在地餐廳、烘焙坊與市場的特別組合、當日優惠券與 Last Minute 優惠。",
  "Săn deal ăn uống": "查看餐飲優惠", "Việc cần làm hôm nay": "今天的事情一次搞定",
  "deal tốt ngay gần nhà.": "好優惠就在家附近。",
  "Ưu đãi mới cho xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "探索驗證商家的汽車、維修、寵物與日常服務新優惠。",
  "Tìm deal dịch vụ": "尋找服務優惠", "NAIL & SPA · TRẢI NGHIỆM CAO CẤP": "美甲與 SPA · 高級體驗",
  "Thư giãn trọn vẹn": "徹底放鬆享受", "ngay gần bạn.": "就在你附近。",
  "Ghế spa êm ái, kỹ thuật viên tận tâm và ưu đãi giới hạn cho manicure, pedicure và Gel-X.": "舒適的 SPA 座椅、細心的專業技師，以及美甲、足部護理與 Gel-X 的限量優惠。",
  "Khám phá Nail & Spa": "探索美甲與 SPA", "NHÀ HÀNG · TỐI NAY": "餐廳 · 今晚",
  "Một bữa tối đáng nhớ": "一頓值得回味的晚餐", "đang chờ gần bạn.": "就在你附近等你。",
  "Bàn đẹp, món đặc sắc và ưu đãi giới hạn từ nhà hàng địa phương đã xác minh.": "精緻座位、招牌料理與經驗證在地餐廳的限量優惠。",
  "Khám phá nhà hàng": "探索餐廳", "TIỆM TÓC · PHONG CÁCH MỚI": "髮廊 · 全新造型",
  "Mái tóc bạn muốn": "打造你想要的髮型", "với giá dễ yêu.": "價格也讓人喜歡。",
  "Cắt, tạo kiểu, nhuộm và phục hồi với ưu đãi mới từ salon gần bạn.": "附近髮廊的剪髮、造型、染髮與護理新優惠。",
  "Tìm deal tiệm tóc": "尋找髮廊優惠", "KHÁCH SẠN · KỲ NGHỈ GẦN": "飯店 · 鄰近度假",
  "Đổi không khí": "換個風景", "không cần đi xa.": "不必走遠。",
  "Staycation, phòng đẹp và trải nghiệm nghỉ dưỡng với giá đặc biệt.": "城市度假、精美客房與特別價格的度假體驗。",
  "Khám phá khách sạn": "探索飯店", "DU THUYỀN · TRẢI NGHIỆM BIỂN": "遊艇 · 海上體驗",
  "Ra khơi theo cách": "用最難忘的方式", "đáng nhớ nhất.": "揚帆出海。",
  "Chuyến ngắm hoàng hôn, tiệc riêng và trải nghiệm du thuyền được chọn lọc.": "精選日落航程、私人聚會與遊艇體驗。",
  "Khám phá du thuyền": "探索遊艇"
});

Object.assign(LANGUAGE_COPY.ko, {
  "Ưu đãi mới mỗi ngày": "매일 새로운 혜택", "Ưu đãi mới, khó bỏ lỡ": "놓치기 아까운 새로운 혜택",
  "đang ở ngay quanh bạn.": "바로 내 주변에 있습니다.",
  "Deal độc quyền, chương trình lần đầu ra mắt và số lượng giới hạn từ doanh nghiệp địa phương đã được Nexora xác minh.": "Nexora가 인증한 지역 비즈니스의 독점 혜택, 첫 출시 프로모션과 한정 혜택입니다.",
  "Khám phá ưu đãi mới": "새로운 혜택 보기", "Làm đẹp nhiều hơn": "뷰티와 웰니스를 더 많이",
  "chi ít hơn hôm nay.": "오늘은 더 저렴하게.",
  "Khám phá deal mới, suất giờ vàng và ưu đãi giới hạn cho nail, tóc, spa và chăm sóc cá nhân.": "네일, 헤어, 스파 및 퍼스널 케어의 새로운 혜택과 골든타임 한정 프로모션을 만나보세요.",
  "Săn deal làm đẹp": "뷰티 혜택 찾기", "Món ngon đáng thử": "맛볼 가치가 있는 동네 맛집",
  "giá tốt khó bỏ lỡ.": "놓치기 아까운 가격으로.",
  "Combo đặc biệt, coupon trong ngày và Last Minute từ nhà hàng, tiệm bánh và chợ địa phương.": "지역 식당, 베이커리와 마켓의 특별 세트, 당일 쿠폰과 Last Minute 혜택입니다.",
  "Săn deal ăn uống": "푸드 혜택 찾기", "Việc cần làm hôm nay": "오늘의 할 일을 해결하세요",
  "deal tốt ngay gần nhà.": "집 근처 좋은 혜택으로.",
  "Ưu đãi mới cho xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.": "인증된 비즈니스의 자동차, 수리, 반려동물 및 생활 서비스 새 혜택입니다.",
  "Tìm deal dịch vụ": "서비스 혜택 찾기", "NAIL & SPA · TRẢI NGHIỆM CAO CẤP": "네일 & 스파 · 프리미엄 경험",
  "Thư giãn trọn vẹn": "온전히 편안하게", "ngay gần bạn.": "바로 내 주변에서.",
  "Ghế spa êm ái, kỹ thuật viên tận tâm và ưu đãi giới hạn cho manicure, pedicure và Gel-X.": "편안한 스파 체어, 세심한 테크니션과 매니큐어, 페디큐어, Gel-X 한정 혜택을 만나보세요.",
  "Khám phá Nail & Spa": "네일 & 스파 둘러보기", "NHÀ HÀNG · TỐI NAY": "레스토랑 · 오늘 밤",
  "Một bữa tối đáng nhớ": "기억에 남을 저녁", "đang chờ gần bạn.": "가까운 곳에서 기다려요.",
  "Bàn đẹp, món đặc sắc và ưu đãi giới hạn từ nhà hàng địa phương đã xác minh.": "멋진 테이블, 시그니처 요리와 인증된 지역 레스토랑의 한정 혜택입니다.",
  "Khám phá nhà hàng": "레스토랑 둘러보기", "TIỆM TÓC · PHONG CÁCH MỚI": "헤어 살롱 · 새로운 스타일",
  "Mái tóc bạn muốn": "원하던 헤어스타일", "với giá dễ yêu.": "마음에 드는 가격으로.",
  "Cắt, tạo kiểu, nhuộm và phục hồi với ưu đãi mới từ salon gần bạn.": "가까운 살롱의 커트, 스타일링, 컬러 및 케어 새 혜택입니다.",
  "Tìm deal tiệm tóc": "헤어 살롱 혜택 찾기", "KHÁCH SẠN · KỲ NGHỈ GẦN": "호텔 · 가까운 휴식",
  "Đổi không khí": "분위기를 바꿔보세요", "không cần đi xa.": "멀리 갈 필요 없이.",
  "Staycation, phòng đẹp và trải nghiệm nghỉ dưỡng với giá đặc biệt.": "스테이케이션, 아름다운 객실과 특별한 가격의 리조트 경험입니다.",
  "Khám phá khách sạn": "호텔 둘러보기", "DU THUYỀN · TRẢI NGHIỆM BIỂN": "요트 · 바다 위 경험",
  "Ra khơi theo cách": "가장 기억에 남는 방식으로", "đáng nhớ nhất.": "바다로 떠나세요.",
  "Chuyến ngắm hoàng hôn, tiệc riêng và trải nghiệm du thuyền được chọn lọc.": "엄선된 선셋 크루즈, 프라이빗 모임과 요트 경험입니다.",
  "Khám phá du thuyền": "요트 둘러보기"
});

const LANGUAGE_META = {
  vi: { title: "Nexora Deals — Ưu đãi đẹp gần bạn", description: "Nexora Deals giúp bạn khám phá ưu đãi dịch vụ địa phương, bắt đầu với nail salon gần bạn." },
  en: { title: "Nexora Deals — Great offers near you", description: "Discover verified local service offers, coupons and open appointments near you." },
  es: { title: "Nexora Deals — Ofertas cerca de ti", description: "Descubre ofertas, cupones y horarios disponibles de negocios locales verificados." },
  "zh-TW": { title: "Nexora Deals — 探索附近好優惠", description: "探索經驗證的在地服務優惠、優惠券與可預約空檔。" },
  ko: { title: "Nexora Deals — 내 주변 좋은 혜택", description: "인증된 지역 서비스 혜택, 쿠폰과 예약 가능한 시간을 찾아보세요." }
};

const LANGUAGE_PREFIXES = {
  en: { "KHÁM PHÁ · ": "DISCOVER · ", "LAST MINUTE · CÒN ": "LAST MINUTE · ", "SẮP KHAI TRƯƠNG": "GRAND OPENING", "Nhận trước ": "Pick up by " },
  es: { "KHÁM PHÁ · ": "EXPLORAR · ", "LAST MINUTE · CÒN ": "LAST MINUTE · QUEDAN ", "SẮP KHAI TRƯƠNG": "PRÓXIMA APERTURA", "Nhận trước ": "Recoger antes de " },
  "zh-TW": { "KHÁM PHÁ · ": "探索 · ", "LAST MINUTE · CÒN ": "LAST MINUTE · 剩餘 ", "SẮP KHAI TRƯƠNG": "即將開幕", "Nhận trước ": "取貨期限 " },
  ko: { "KHÁM PHÁ · ": "둘러보기 · ", "LAST MINUTE · CÒN ": "LAST MINUTE · 잔여 ", "SẮP KHAI TRƯƠNG": "신규 오픈 예정", "Nhận trước ": "픽업 마감 " }
};

function translateDynamicLabel(key, language) {
  const prefixes = LANGUAGE_PREFIXES[language];
  if (!prefixes) return null;
  const prefix = Object.keys(prefixes).find((candidate) => key.startsWith(candidate));
  return prefix ? `${prefixes[prefix]}${key.slice(prefix.length)}` : null;
}

function translateTextNode(node, language) {
  if (!node?.nodeValue || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.parentElement?.tagName)) return;
  const current = node.nodeValue;
  const lastRendered = languageRenderedText.get(node);
  if (!languageOriginalText.has(node) || (lastRendered !== undefined && current !== lastRendered)) languageOriginalText.set(node, current);
  const source = languageOriginalText.get(node);
  const key = source.trim();
  if (!key) return;
  const translated = language === "vi" ? key : (LANGUAGE_COPY[language]?.[key] || translateDynamicLabel(key, language));
  const output = translated || key;
  const next = `${source.match(/^\s*/)?.[0] || ""}${output}${source.match(/\s*$/)?.[0] || ""}`;
  if (node.nodeValue !== next) node.nodeValue = next;
  languageRenderedText.set(node, next);
}

function translateDocument(language, root = document.body) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, language);
    return;
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    translateTextNode(node, language);
    node = walker.nextNode();
  }
  const meta = LANGUAGE_META[language] || LANGUAGE_META.vi;
  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
}

function applyLanguage(language, { announce = false } = {}) {
  const activeLanguage = NEXORA_LANGUAGES.includes(language) ? language : "vi";
  document.documentElement.lang = NEXORA_HTML_LANG[activeLanguage];
  document.documentElement.dataset.locale = NEXORA_LOCALE[activeLanguage];
  localStorage.setItem("nexora-language", activeLanguage);
  translateDocument(activeLanguage);
  updateHeroCarouselAccessibility(activeLanguage);
  updateNexoraAuthLinks();
  updateTouchLinks();
  if (announce) {
    const messages = {
      vi: "Đã chuyển sang Tiếng Việt. Nexora sẽ tiếp tục bằng ngôn ngữ này.",
      en: "English saved. Nexora will continue in this language.",
      es: "Idioma guardado. Nexora continuará en español.",
      "zh-TW": "已切換為繁體中文。Nexora 將沿用此語言。",
      ko: "한국어로 변경했습니다. Nexora에서도 이 언어가 유지됩니다."
    };
    showToast(messages[activeLanguage]);
  }
}

function initializeLanguageControl() {
  const select = document.querySelector("#languageSelect");
  if (!select) return;
  const params = new URLSearchParams(location.search);
  const requested = params.get("lang");
  const saved = localStorage.getItem("nexora-language");
  const browserLanguage = navigator.language?.toLowerCase().startsWith("zh") ? "zh-TW" : navigator.language?.split("-")[0];
  const language = NEXORA_LANGUAGES.includes(requested) ? requested : (NEXORA_LANGUAGES.includes(saved) ? saved : (NEXORA_LANGUAGES.includes(browserLanguage) ? browserLanguage : "vi"));
  select.value = language;
  applyLanguage(language);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") translateTextNode(mutation.target, select.value);
      mutation.addedNodes.forEach((node) => translateDocument(select.value, node));
    });
  });
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  select.addEventListener("change", () => {
    const url = new URL(location.href);
    url.searchParams.set("lang", select.value);
    history.replaceState(history.state, "", url);
    applyLanguage(select.value, { announce: true });
  });
}

const HERO_CAROUSEL_ITEMS = [
  {
    kicker: "KHÁM PHÁ · GARDEN GROVE, CA",
    headline: "Ưu đãi mới, khó bỏ lỡ",
    accent: "đang ở ngay quanh bạn.",
    description: "Deal độc quyền, chương trình lần đầu ra mắt và số lượng giới hạn từ doanh nghiệp địa phương đã được Nexora xác minh.",
    action: "Khám phá ưu đãi mới",
    href: "#nearby",
    label: "Tất cả ngành",
  },
  {
    kicker: "BEAUTY & WELLNESS · GẦN BẠN",
    headline: "Làm đẹp nhiều hơn",
    accent: "chi ít hơn hôm nay.",
    description: "Khám phá deal mới, suất giờ vàng và ưu đãi giới hạn cho nail, tóc, spa và chăm sóc cá nhân.",
    action: "Săn deal làm đẹp",
    href: "#categories",
    label: "Beauty & Wellness",
  },
  {
    kicker: "FOOD & MARKET · HÔM NAY",
    headline: "Món ngon đáng thử",
    accent: "giá tốt khó bỏ lỡ.",
    description: "Combo đặc biệt, coupon trong ngày và Last Minute từ nhà hàng, tiệm bánh và chợ địa phương.",
    action: "Săn deal ăn uống",
    href: "#last-minute",
    label: "Food & Market",
  },
  {
    kicker: "HOME, AUTO & PET · GẦN BẠN",
    headline: "Việc cần làm hôm nay",
    accent: "deal tốt ngay gần nhà.",
    description: "Ưu đãi mới cho xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.",
    action: "Tìm deal dịch vụ",
    href: "#nearby",
    label: "Home, Auto & Pet",
  },
  {
    kicker: "NAIL & SPA · TRẢI NGHIỆM CAO CẤP",
    headline: "Thư giãn trọn vẹn",
    accent: "ngay gần bạn.",
    description: "Ghế spa êm ái, kỹ thuật viên tận tâm và ưu đãi giới hạn cho manicure, pedicure và Gel-X.",
    action: "Khám phá Nail & Spa",
    href: "#categories",
    label: "Nail & Spa",
  },
  {
    kicker: "NHÀ HÀNG · TỐI NAY",
    headline: "Một bữa tối đáng nhớ",
    accent: "đang chờ gần bạn.",
    description: "Bàn đẹp, món đặc sắc và ưu đãi giới hạn từ nhà hàng địa phương đã xác minh.",
    action: "Khám phá nhà hàng",
    href: "#categories",
    label: "Nhà hàng",
  },
  {
    kicker: "TIỆM TÓC · PHONG CÁCH MỚI",
    headline: "Mái tóc bạn muốn",
    accent: "với giá dễ yêu.",
    description: "Cắt, tạo kiểu, nhuộm và phục hồi với ưu đãi mới từ salon gần bạn.",
    action: "Tìm deal tiệm tóc",
    href: "#categories",
    label: "Tiệm tóc",
  },
  {
    kicker: "KHÁCH SẠN · KỲ NGHỈ GẦN",
    headline: "Đổi không khí",
    accent: "không cần đi xa.",
    description: "Staycation, phòng đẹp và trải nghiệm nghỉ dưỡng với giá đặc biệt.",
    action: "Khám phá khách sạn",
    href: "#categories",
    label: "Khách sạn",
  },
  {
    kicker: "DU THUYỀN · TRẢI NGHIỆM BIỂN",
    headline: "Ra khơi theo cách",
    accent: "đáng nhớ nhất.",
    description: "Chuyến ngắm hoàng hôn, tiệc riêng và trải nghiệm du thuyền được chọn lọc.",
    action: "Khám phá du thuyền",
    href: "#categories",
    label: "Du thuyền",
  },
];

const HERO_CONTROL_COPY = {
  vi: { previous: "Nội dung trước", next: "Nội dung tiếp theo", pause: "Tạm dừng trình chiếu", play: "Tiếp tục trình chiếu", group: "Chọn ngành nghề nổi bật" },
  en: { previous: "Previous feature", next: "Next feature", pause: "Pause slideshow", play: "Play slideshow", group: "Choose a featured industry" },
  es: { previous: "Contenido anterior", next: "Contenido siguiente", pause: "Pausar presentación", play: "Reanudar presentación", group: "Elegir una industria destacada" },
  "zh-TW": { previous: "上一個精選", next: "下一個精選", pause: "暫停輪播", play: "繼續輪播", group: "選擇精選產業" },
  ko: { previous: "이전 추천", next: "다음 추천", pause: "슬라이드쇼 일시정지", play: "슬라이드쇼 재생", group: "추천 업종 선택" },
};

let heroCarouselPaused = false;

function updateHeroCarouselAccessibility(language = "vi") {
  const copy = HERO_CONTROL_COPY[language] || HERO_CONTROL_COPY.vi;
  document.querySelector("[data-hero-prev]")?.setAttribute("aria-label", copy.previous);
  document.querySelector("[data-hero-next]")?.setAttribute("aria-label", copy.next);
  document.querySelector("[data-hero-pause]")?.setAttribute("aria-label", heroCarouselPaused ? copy.play : copy.pause);
  document.querySelector(".discover-carousel-dots")?.setAttribute("aria-label", copy.group);
}

function initializeHeroCarousel() {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) return;
  const slides = [...root.querySelectorAll("[data-hero-slide]")];
  const dots = [...root.querySelectorAll("[data-hero-dot]")];
  const previous = root.querySelector("[data-hero-prev]");
  const next = root.querySelector("[data-hero-next]");
  const pause = root.querySelector("[data-hero-pause]");
  const kicker = root.querySelector("#heroLocationKicker");
  const headline = root.querySelector("#heroHeadlineMain");
  const accent = root.querySelector("#heroHeadlineAccent");
  const description = root.querySelector("#heroDescription");
  const action = root.querySelector("#heroPrimaryAction");
  const actionLabel = root.querySelector("#heroPrimaryActionLabel");
  const industryLabel = root.querySelector("#heroIndustryLabel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer = null;
  let pointerInside = false;
  let focusInside = false;

  const activeLanguage = () => document.querySelector("#languageSelect")?.value || "vi";

  function render(index, { userInitiated = false } = {}) {
    activeIndex = (index + HERO_CAROUSEL_ITEMS.length) % HERO_CAROUSEL_ITEMS.length;
    const item = HERO_CAROUSEL_ITEMS[activeIndex];
    slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === activeIndex));
    dots.forEach((dot, dotIndex) => {
      const selected = dotIndex === activeIndex;
      dot.classList.toggle("active", selected);
      if (selected) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    kicker.textContent = item.kicker;
    headline.textContent = item.headline;
    accent.textContent = item.accent;
    description.textContent = item.description;
    actionLabel.textContent = item.action;
    action.href = item.href;
    industryLabel.textContent = item.label;
    if (userInitiated) action.focus({ preventScroll: true });
  }

  function stopTimer() {
    window.clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    stopTimer();
    if (heroCarouselPaused || reduceMotion.matches || document.hidden || pointerInside || focusInside) return;
    timer = window.setInterval(() => render(activeIndex + 1), 6000);
  }

  function setPaused(paused) {
    heroCarouselPaused = paused;
    pause.setAttribute("aria-pressed", String(paused));
    pause.querySelector("span").textContent = paused ? "▶" : "Ⅱ";
    root.classList.toggle("is-paused", paused);
    updateHeroCarouselAccessibility(activeLanguage());
    startTimer();
  }

  previous.addEventListener("click", () => { render(activeIndex - 1); startTimer(); });
  next.addEventListener("click", () => { render(activeIndex + 1); startTimer(); });
  pause.addEventListener("click", () => setPaused(!heroCarouselPaused));
  dots.forEach((dot) => dot.addEventListener("click", () => { render(Number(dot.dataset.heroDot)); startTimer(); }));
  root.addEventListener("mouseenter", () => { pointerInside = true; stopTimer(); });
  root.addEventListener("mouseleave", () => { pointerInside = false; startTimer(); });
  root.addEventListener("focusin", () => { focusInside = true; stopTimer(); });
  root.addEventListener("focusout", () => { focusInside = false; startTimer(); });
  document.addEventListener("visibilitychange", startTimer);
  reduceMotion.addEventListener?.("change", startTimer);

  render(0);
  updateHeroCarouselAccessibility(activeLanguage());
  startTimer();
}

function updateTouchLinks() {
  const routes = {
    promotion: ["/dashboard/pos", { section: "promotions" }],
    oneqr: ["/dashboard/touchpoints", { tab: "stations", section: "one-qr" }],
    redeem: ["/dashboard/pos", { section: "redeem" }],
  };
  document.querySelectorAll("[data-touch-route]").forEach((link) => {
    const route = routes[link.dataset.touchRoute];
    if (route) link.href = buildTouchUrl(route[0], route[1]);
  });
}

const COMMUNITY_CATEGORY_MAP = {
  nail: "all",
  beauty: "all",
  manicure: "manicure",
  pedicure: "pedicure",
  "gel-x": "gel-x",
  gelx: "gel-x",
  "nail-art": "nail-art",
  nailart: "nail-art",
};

const COMMUNITY_SORT_TO_DEALS = {
  near: "nearest",
  nearest: "nearest",
  exp: "ending",
  expiry: "ending",
  ending: "ending",
  left: "ending",
  saving: "saving",
  recommended: "recommended",
};

const DEALS_SORT_TO_COMMUNITY = {
  nearest: "near",
  ending: "left",
  saving: "saving",
  recommended: "recommended",
};

const COMMUNITY_INDUSTRY_LABELS = {
  beauty: "Làm đẹp & chăm sóc cá nhân",
  food: "Ăn uống",
  shopping: "Mua sắm",
  health: "Sức khỏe",
  auto: "Xe & di chuyển",
  home: "Nhà cửa & sửa chữa",
};

const COMMUNITY_CATEGORY_LABELS = {
  nail: "Nail",
  hair: "Hair & Barber",
  spa: "Spa & Massage",
  lash: "Lash & Brow",
};

function setCategory(category = "all") {
  const mappedCategory = COMMUNITY_CATEGORY_MAP[String(category).toLocaleLowerCase("vi")] || "all";
  state.activeCategory = mappedCategory;
  document.querySelectorAll(".service-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.service === mappedCategory);
  });
}

function setTaxonomyLevel(selector, dataKey, value) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("active", button.dataset[dataKey] === value);
  });
}

function syncLocationLabels() {
  const area = locationInput.value.trim() || "Gần bạn";
  const heroKicker = document.querySelector("#heroLocationKicker");
  const mapTitle = document.querySelector("#mapDialogTitle");
  if (heroKicker) heroKicker.textContent = `KHÁM PHÁ · ${area.toLocaleUpperCase("vi")}`;
  if (mapTitle) mapTitle.textContent = `Deal gần ${area}`;
}

function serviceLabel(service) {
  return ({ all: "Tất cả dịch vụ", manicure: "Manicure", pedicure: "Pedicure", "gel-x": "Gel-X", "nail-art": "Nail Art" })[service] || "Tất cả dịch vụ";
}

function renderCommunityHandoff(params) {
  const handoff = document.querySelector("#communityHandoff");
  if (!handoff) return;
  const isCommunity = [params.get("source"), params.get("from"), params.get("ref")]
    .some((value) => String(value || "").toLocaleLowerCase("vi").includes("community"));
  handoff.hidden = !isCommunity;
  if (!isCommunity) return;

  trafficSource = "nexora-community";
  const labels = [];
  if (searchInput.value.trim()) labels.push(`⌕ ${searchInput.value.trim()}`);
  if (locationInput.value.trim()) labels.push(`⌖ ${locationInput.value.trim()}`);
  const industryLabel = COMMUNITY_INDUSTRY_LABELS[state.activeIndustry] || state.activeIndustry;
  const categoryLabel = COMMUNITY_CATEGORY_LABELS[state.activeBusinessCategory] || state.activeBusinessCategory;
  labels.push(`${industryLabel} › ${categoryLabel} › ${serviceLabel(state.activeCategory)}`);
  labels.push(`Trong ${state.maxDistance} mi`);
  labels.push(`Sắp xếp: ${sortSelect.options[sortSelect.selectedIndex]?.text || "Đề xuất"}`);
  const audience = params.get("audience");
  if (audience === "cust") labels.push("Cho khách hàng");
  if (audience === "pro") labels.push("Cho tiệm & thợ");
  document.querySelector("#communityHandoffFilters").innerHTML = labels
    .map((label) => `<span>${escapeHTML(label)}</span>`).join("");
}

function applyIncomingDealSearch() {
  const params = new URLSearchParams(location.search);
  const incomingSource = String(params.get("source") || params.get("from") || params.get("ref") || "").toLocaleLowerCase("vi");
  if (incomingSource.includes("community")) trafficSource = "nexora-community";
  else if (incomingSource.includes("oneqr")) trafficSource = "oneqr";
  else if (incomingSource.includes("touch")) trafficSource = "nexora-touch";
  const requestedFunction = String(params.get("route") || params.get("module") || params.get("view") || "").toLocaleLowerCase("vi");
  const query = params.get("q") || params.get("query");
  const area = params.get("location") || params.get("loc") || params.get("near");
  const radius = Number(params.get("radius") || params.get("distance"));
  const incomingIndustry = (params.get("industry") || "beauty").toLocaleLowerCase("vi");
  const incomingCategory = (params.get("category") || "nail").toLocaleLowerCase("vi");
  const legacyService = COMMUNITY_CATEGORY_MAP[incomingCategory] ? incomingCategory : null;
  const service = params.get("service") || legacyService;
  const sort = params.get("sort");

  if (query !== null) searchInput.value = query.slice(0, 120);
  if (area) locationInput.value = area.slice(0, 120);
  syncLocationLabels();
  if (Number.isFinite(radius) && radius >= 1 && radius <= 25) state.maxDistance = radius;
  if (incomingIndustry === "beauty") state.activeIndustry = "beauty";
  if (incomingCategory === "nail" || legacyService) state.activeBusinessCategory = "nail";
  setTaxonomyLevel("[data-industry-root]", "industryRoot", state.activeIndustry);
  setTaxonomyLevel("[data-business-category]", "businessCategory", state.activeBusinessCategory);
  if (service) setCategory(service);
  if (COMMUNITY_SORT_TO_DEALS[sort]) sortSelect.value = COMMUNITY_SORT_TO_DEALS[sort];
  if (FUNCTION_ROUTE_MAP[requestedFunction]) incomingFunctionRoute = FUNCTION_ROUTE_MAP[requestedFunction];
  if (requestedFunction === "dwallet" || requestedFunction === "wallet") incomingFunctionRoute = "#coupons";
  if (requestedFunction === "oneqr") incomingFunctionRoute = "#oneqr";
  renderCommunityHandoff(params);
  updateTouchLinks();

  const dealId = params.get("deal") || params.get("deal_id") || params.get("coupon_id");
  if (dealId && getDeal(dealId)) {
    window.requestAnimationFrame(() => openDeal(dealId, trafficSource));
  }
}

function syncSearchUrl() {
  const params = new URLSearchParams(location.search);
  params.set("q", searchInput.value.trim());
  params.set("location", locationInput.value.trim());
  params.set("radius", String(state.maxDistance));
  params.set("industry", state.activeIndustry);
  params.set("category", state.activeBusinessCategory);
  params.set("service", state.activeCategory);
  params.set("sort", DEALS_SORT_TO_COMMUNITY[sortSelect.value] || "recommended");
  params.set("sync", "community-v1");
  if (!params.get("source")) params.set("source", "nexora-deals");
  history.replaceState(null, "", `${location.pathname}?${params.toString()}#categories`);
  renderCommunityHandoff(params);
  try {
    sessionStorage.setItem("nexora-deals-search-context", JSON.stringify(Object.fromEntries(params.entries())));
  } catch {
    // URL remains the source of truth when storage is unavailable.
  }
}

function getDeal(id) {
  return deals.find((deal) => deal.id === id);
}

function getOfferClassification(value) {
  const rawInventory = typeof value === "object" && value !== null ? value.inventory : value;
  const forcedUnlimited = typeof value === "object" && value !== null && value.unlimitedInventory === true;
  const inventory = Number(rawInventory);
  const isCoupon = !forcedUnlimited && Number.isFinite(inventory) && inventory > 0;
  return {
    type: isCoupon ? "coupon" : "deal",
    inventory: isCoupon ? inventory : null,
    isCoupon,
  };
}

function getOfferValueLabel(dealType, price, original) {
  const saving = Math.max(0, Number(original) - Number(price));
  if (dealType === "Giảm phần trăm") return `${Math.round((saving / Math.max(1, Number(original))) * 100)}% OFF`;
  if (dealType === "Giảm số tiền") return `$${saving} OFF`;
  if (dealType === "Bundle") return `COMBO $${price}`;
  if (dealType === "Free add-on") return "FREE ADD-ON";
  return `$${price}`;
}

function dealTemplate(deal, index) {
  const saved = savedDeals.has(deal.id);
  const offerClass = getOfferClassification(deal);
  const imageStyle = deal.image ? ` style="background-image: linear-gradient(180deg, rgba(15,22,56,.05), rgba(15,22,56,.46)), url('${escapeHTML(deal.image)}')"` : "";
  return `
    <article class="deal-card ${offerClass.type}-offer" data-id="${escapeHTML(deal.id)}" data-category="${escapeHTML(deal.category)}">
      <div class="deal-visual ${deal.image ? "has-image" : "theme-" + ((index % 5) + 1)}"${imageStyle}>
        <span class="deal-badge">${escapeHTML(deal.badge)}</span>
        ${deal.verified ? '<span class="verified-badge">✓ VERIFIED</span>' : ""}
        <button class="save-button ${saved ? "saved" : ""}" type="button" data-save="${escapeHTML(deal.id)}" aria-label="${saved ? "Bỏ lưu" : "Lưu"} ${escapeHTML(deal.title)}">${saved ? "♥" : "♡"}</button>
      </div>
      <div class="deal-body">
        <div class="offer-kind ${offerClass.type}">${offerClass.isCoupon ? `🎟️ Coupon · ${offerClass.inventory} lượt` : "🏷️ Deal banner · Không giới hạn lượt"}</div>
        <div class="salon-line">
          <span>${escapeHTML(deal.salon)}</span>
          <span>· ${Number(deal.distance).toFixed(1)} mi</span>
          <span class="rating"><span class="star">★</span> ${escapeHTML(deal.rating)} (${escapeHTML(deal.reviews)})</span>
        </div>
        <h3>${escapeHTML(deal.title)}</h3>
        <div class="price-line">
          <strong>$${escapeHTML(deal.price)}</strong>
          <del>$${escapeHTML(deal.original)}</del>
          <span class="save-copy">${escapeHTML(deal.discount)}</span>
        </div>
        <div class="deal-footer">
          <span>◷ ${escapeHTML(deal.deadline)}</span>
          <button class="deal-open" type="button" data-open="${escapeHTML(deal.id)}">${offerClass.isCoupon ? "Lấy coupon" : "Xem deal"} →</button>
        </div>
      </div>
    </article>
  `;
}

function getVisibleDeals() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  let visibleDeals = deals.filter((deal) => {
    if (deal.lastMinuteOnly) return false;
    const matchesCategory = state.activeCategory === "all" || deal.category === state.activeCategory;
    const haystack = `${deal.title} ${deal.salon} ${deal.category}`.toLocaleLowerCase("vi");
    const matchesSaved = !state.savedOnly || savedDeals.has(deal.id);
    return matchesCategory
      && (!query || haystack.includes(query))
      && matchesSaved
      && deal.price <= state.maxPrice
      && deal.distance <= state.maxDistance
      && (!state.verifiedOnly || deal.verified);
  });

  if (sortSelect.value === "nearest") visibleDeals.sort((a, b) => a.distance - b.distance);
  if (sortSelect.value === "saving") visibleDeals.sort((a, b) => (b.original - b.price) - (a.original - a.price));
  if (sortSelect.value === "ending") visibleDeals.sort((a, b) => (getOfferClassification(a).inventory ?? Number.MAX_SAFE_INTEGER) - (getOfferClassification(b).inventory ?? Number.MAX_SAFE_INTEGER));
  return visibleDeals;
}

function updateSavedUI() {
  navSavedCount.textContent = savedDeals.size;
  const heroSave = document.querySelector('.featured-spotlight [data-save="nx-gel-combo"]');
  if (heroSave) {
    const isSaved = savedDeals.has("nx-gel-combo");
    heroSave.classList.toggle("saved", isSaved);
    heroSave.textContent = isSaved ? "♥" : "♡";
  }

  if (activeDealId) {
    const isSaved = savedDeals.has(activeDealId);
    const detailSave = document.querySelector("#saveDetailButton");
    detailSave.classList.toggle("saved", isSaved);
    detailSave.textContent = isSaved ? "♥ Đã lưu" : "♡ Lưu";
  }
}

function renderDeals() {
  const visibleDeals = getVisibleDeals();
  dealGrid.innerHTML = visibleDeals.map(dealTemplate).join("");
  dealGrid.hidden = visibleDeals.length === 0;
  emptyState.hidden = visibleDeals.length !== 0;

  if (state.savedOnly) {
    resultsKicker.textContent = "WISHLIST · LƯU TRÊN THIẾT BỊ NÀY";
    resultsTitle.textContent = savedDeals.size ? `${savedDeals.size} deal bạn đang theo dõi` : "Wishlist của bạn đang trống";
  } else {
    resultsKicker.textContent = `LÀM ĐẸP › NAIL › ${serviceLabel(state.activeCategory).toLocaleUpperCase("vi")} · TRONG ${state.maxDistance} MILES`;
    resultsTitle.textContent = `Deal nổi bật quanh ${document.querySelector("#locationInput").value || "bạn"}`;
  }

  const nearbySummaryTitle = document.querySelector("#nearbySummaryTitle");
  const nearbySummaryCopy = document.querySelector("#nearbySummaryCopy");
  if (nearbySummaryTitle) nearbySummaryTitle.textContent = `${visibleDeals.length} deal trong vòng ${state.maxDistance} miles`;
  if (nearbySummaryCopy) nearbySummaryCopy.textContent = `Kết quả đang khớp với ${locationInput.value.trim() || "vị trí của bạn"}.`;

  updateSavedUI();
}

let lastMinuteWindow = "all";
let lastMinuteIndustry = "all";

function applyLastMinuteFilters() {
  document.querySelectorAll("[data-last-window]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lastWindow === lastMinuteWindow);
  });
  document.querySelectorAll("[data-last-industry]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lastIndustry === lastMinuteIndustry);
  });
  let visibleCount = 0;
  document.querySelectorAll("[data-last-card]").forEach((card) => {
    const matchesWindow = lastMinuteWindow === "all" || card.dataset.window === lastMinuteWindow;
    const matchesIndustry = lastMinuteIndustry === "all" || card.dataset.industry === lastMinuteIndustry;
    card.hidden = !(matchesWindow && matchesIndustry);
    if (!card.hidden) visibleCount += 1;
  });
  const empty = document.querySelector("#lastMinuteEmpty");
  if (empty) empty.hidden = visibleCount > 0;
}

function filterLastMinute(windowName = "all") {
  lastMinuteWindow = windowName;
  applyLastMinuteFilters();
}

function filterLastMinuteIndustry(industry = "all") {
  lastMinuteIndustry = industry;
  applyLastMinuteFilters();
}

let couponFilter = "all";
const savedCoupons = new Set(safeRead("nexora-saved-coupons", []));
let couponClaims = safeRead("nexora-coupon-claims", {});
const couponCatalog = {
  nail20: { code: "NAIL20", business: "Nexora Touch Nail Spa", value: "20% OFF", title: "Gel-X cho khách mới", expiry: "10/15" },
  lunch5: { code: "LUNCH5", business: "Harbor Kitchen", value: "$5 OFF", title: "Đơn từ $25 trở lên", expiry: "Hôm nay" },
  market10: { code: "MARKET10", business: "Chợ Việt Garden Grove", value: "10% OFF", title: "Rau củ & trái cây từ $20", expiry: "6:30 PM" },
  qrlocal: { code: "QRLOCAL", business: "OneQR Local Reward", value: "$10 OFF", title: "Dịch vụ địa phương từ $50", expiry: "10/31" },
};
let openingHolds = safeRead("nexora-opening-holds", {});
const openingCatalog = {
  "pho-bellaire": { business: "Phở 24 Bellaire", offer: "Combo khai trương $9", openingDate: "2026-10-01" },
  "kayla-nails": { business: "Kayla Nails & Spa", offer: "Giảm 30% dịch vụ ngày mở cửa", openingDate: "2026-10-07" },
  "saigon-boba": { business: "Saigon Boba", offer: "Ly đầu tiên $1", openingDate: "2026-10-14" },
};

function couponClaimKey(type, id) {
  return `${type}:${id}`;
}

function normalizePhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

function maskPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 4 ? `••• ••• ${digits.slice(-4)}` : "SĐT đã xác nhận";
}

async function hashPhone(phone) {
  if (!window.crypto?.subtle) return `demo-${makeCouponCode()}`;
  const bytes = new TextEncoder().encode(phone);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatHoldDate(value) {
  return new Intl.DateTimeFormat("vi-VN", { month: "2-digit", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function renderCoupons() {
  let visibleCount = 0;
  document.querySelectorAll("[data-coupon-card]").forEach((card) => {
    const isSaved = savedCoupons.has(card.dataset.couponId);
    card.dataset.couponSaved = String(isSaved);
    const saveButton = card.querySelector("[data-coupon-save]");
    if (saveButton) {
      saveButton.textContent = isSaved ? "♥" : "♡";
      saveButton.setAttribute("aria-pressed", String(isSaved));
    }
    const claim = couponClaims[couponClaimKey("catalog", card.dataset.couponId)];
    const claimButton = card.querySelector("[data-coupon-claim]");
    if (claimButton) {
      claimButton.textContent = claim ? "Đã giữ" : "Lấy coupon";
      claimButton.classList.toggle("claimed", Boolean(claim));
      claimButton.setAttribute("aria-label", claim ? "Xem coupon đã giữ" : "Lấy coupon bằng số điện thoại");
    }
    const matches = couponFilter === "all"
      || (couponFilter === "saved" ? isSaved : card.dataset.couponKind === couponFilter);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  document.querySelectorAll("[data-coupon-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.couponFilter === couponFilter);
  });
  const count = document.querySelector("#couponSavedCount");
  if (count) count.textContent = String(Object.values(couponClaims).filter((claim) => claim.type === "catalog").length);
  const empty = document.querySelector("#couponEmpty");
  if (empty) empty.hidden = visibleCount > 0;
}

function selectCouponFilter(filter = "all") {
  couponFilter = filter;
  renderCoupons();
}

function toggleCouponSave(id) {
  if (savedCoupons.has(id)) savedCoupons.delete(id);
  else savedCoupons.add(id);
  localStorage.setItem("nexora-saved-coupons", JSON.stringify([...savedCoupons]));
  renderCoupons();
  showToast(savedCoupons.has(id) ? "Đã lưu coupon để xem sau." : "Đã bỏ coupon khỏi danh sách lưu.");
}

function getCouponClaimSummary(type, id) {
  if (type === "deal") {
    const deal = getDeal(id);
    return deal ? { title: deal.title, business: deal.salon, value: `$${deal.price}`, couponId: id } : null;
  }
  const coupon = couponCatalog[id];
  return coupon ? { ...coupon, couponId: id } : null;
}

function showCouponClaimSuccess(claim, summary) {
  document.querySelector("#couponClaimForm").hidden = true;
  const success = document.querySelector("#couponClaimSuccess");
  success.hidden = false;
  document.querySelector("#couponClaimSuccessCopy").textContent = `${summary.value} · ${summary.business} đã giữ cho ${claim.phoneMasked} đến ${formatHoldDate(claim.holdUntil)}. SMS xác nhận đã được tạo.`;
}

function openCouponClaim(id, type = "catalog") {
  const summary = getCouponClaimSummary(type, id);
  if (!summary) return;
  const form = document.querySelector("#couponClaimForm");
  form.reset();
  form.hidden = false;
  document.querySelector("#couponClaimSuccess").hidden = true;
  document.querySelector("#couponClaimId").value = id;
  document.querySelector("#couponClaimType").value = type;
  document.querySelector("#couponClaimTitle").textContent = summary.title;
  document.querySelector("#couponClaimSummary").textContent = `${summary.value} · ${summary.business}. Một suất sẽ được giữ 7 ngày theo số điện thoại.`;
  const existing = couponClaims[couponClaimKey(type, id)];
  if (existing) showCouponClaimSuccess(existing, summary);
  openModal(couponClaimDialog);
  if (!existing) window.setTimeout(() => document.querySelector("#couponClaimPhone")?.focus(), 120);
}

async function createCouponClaim(id, type, phone) {
  const summary = getCouponClaimSummary(type, id);
  const normalizedPhone = normalizePhone(phone);
  if (type === "deal" && !getOfferClassification(getDeal(id)).isCoupon) return null;
  if (!summary || !normalizedPhone) return null;
  const claim = {
    claimId: makeCouponCode(),
    couponId: id,
    type,
    phoneHash: await hashPhone(normalizedPhone),
    phoneMasked: maskPhone(normalizedPhone),
    holdUntil: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
    claimedAt: new Date().toISOString(),
    channel: trafficSource || "nexora-deals",
  };
  couponClaims[couponClaimKey(type, id)] = claim;
  localStorage.setItem("nexora-coupon-claims", JSON.stringify(couponClaims));
  if (type === "deal") {
    claimedDeals[id] = claim.claimId;
    localStorage.setItem("nexora-claimed-deals", JSON.stringify(claimedDeals));
  }
  renderCoupons();
  return { claim, summary };
}

async function submitCouponClaim(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const phone = normalizePhone(formData.get("phone"));
  if (!phone) {
    showToast("Vui lòng nhập số điện thoại hợp lệ.");
    return;
  }
  const type = String(formData.get("claimType") || "catalog");
  const id = String(formData.get("claimId") || "");
  const result = await createCouponClaim(id, type, phone);
  if (!result) return;
  const { claim, summary } = result;
  if (type === "deal") {
    document.querySelector("#couponCode").textContent = claim.phoneMasked;
    document.querySelector("#couponResult").hidden = false;
    document.querySelector("#claimDealButton").textContent = "Đã giữ coupon";
  }
  emitNexoraFunctionEvent("coupon_held", { coupon_id: id, coupon_type: type, claim_id: claim.claimId });
  event.currentTarget.reset();
  showCouponClaimSuccess(claim, summary);
  showToast("Đã giữ coupon. SMS xác nhận đã được tạo; không cần cài app.");
}

function formatOpeningDate(value) {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function renderOpeningHolds() {
  document.querySelectorAll("[data-opening-hold]").forEach((button) => {
    const held = openingHolds[button.dataset.openingHold];
    button.textContent = held ? "Đã giữ chỗ" : "Giữ chỗ qua SĐT";
    button.classList.toggle("held", Boolean(held));
  });
}

function showOpeningHoldSuccess(id, hold) {
  const opening = openingCatalog[id];
  document.querySelector("#openingHoldForm").hidden = true;
  document.querySelector("#openingHoldSuccess").hidden = false;
  document.querySelector("#openingHoldSuccessCopy").textContent = `${opening.business} đã giữ chỗ cho ${hold.phoneMasked}. Chưa phát coupon trước ngày mở cửa.`;
}

function openOpeningHold(id) {
  const opening = openingCatalog[id];
  if (!opening) return;
  const form = document.querySelector("#openingHoldForm");
  form.reset();
  form.hidden = false;
  document.querySelector("#openingHoldSuccess").hidden = true;
  document.querySelector("#openingHoldId").value = id;
  document.querySelector("#openingHoldTitle").textContent = opening.business;
  document.querySelector("#openingHoldSummary").textContent = `${opening.offer} · mở cửa ${formatOpeningDate(opening.openingDate)}. Nexora sẽ gửi SMS nhắc trước ngày mở cửa.`;
  const existing = openingHolds[id];
  if (existing) showOpeningHoldSuccess(id, existing);
  openModal(openingHoldDialog);
  if (!existing) window.setTimeout(() => document.querySelector("#openingHoldPhone")?.focus(), 120);
}

async function submitOpeningHold(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const id = String(data.get("openingId") || "");
  const phone = normalizePhone(data.get("phone"));
  const opening = openingCatalog[id];
  if (!opening || !phone) {
    showToast("Vui lòng nhập số điện thoại hợp lệ.");
    return;
  }
  const hold = {
    holdId: `OPEN-${makeCouponCode().replace("NX-", "")}`,
    openingId: id,
    phoneHash: await hashPhone(phone),
    phoneMasked: maskPhone(phone),
    openingDate: opening.openingDate,
    heldAt: new Date().toISOString(),
    channel: trafficSource || "nexora-deals",
  };
  openingHolds[id] = hold;
  localStorage.setItem("nexora-opening-holds", JSON.stringify(openingHolds));
  event.currentTarget.reset();
  showOpeningHoldSuccess(id, hold);
  renderOpeningHolds();
  emitNexoraFunctionEvent("opening_hold_created", { opening_id: id, hold_id: hold.holdId });
  showToast("Đã giữ chỗ khai trương. Không cần cài app.");
}

function tickLastMinuteCountdowns() {
  document.querySelectorAll("[data-countdown]").forEach((countdown) => {
    const remaining = Math.max(0, Number(countdown.dataset.countdown) || 0);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    countdown.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    countdown.dataset.countdown = String(Math.max(0, remaining - 1));
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function persistOneQREarnings() {
  localStorage.setItem("nexora-oneqr-earnings", JSON.stringify(oneqrEarnings));
}

function currency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function renderEarnings() {
  const total = Number(oneqrEarnings.adRevenue || 0) + Number(oneqrEarnings.conversionBonus || 0);
  document.querySelector("#earningScans").textContent = oneqrEarnings.scans || 0;
  document.querySelector("#earningOpens").textContent = oneqrEarnings.dealOpens || 0;
  document.querySelector("#earningSearches").textContent = oneqrEarnings.searches || 0;
  document.querySelector("#earningPurchases").textContent = oneqrEarnings.purchases || 0;
  document.querySelector("#engagementRevenue").textContent = currency(oneqrEarnings.adRevenue);
  document.querySelector("#purchaseRevenue").textContent = currency(oneqrEarnings.conversionBonus);
  document.querySelector("#earningsTotal").textContent = currency(total);
  const ledgerTotal = document.querySelector("#ledgerEarningsTotal");
  if (ledgerTotal) ledgerTotal.textContent = currency(total);
  const ledgerEngagement = document.querySelector("#ledgerEngagementRevenue");
  if (ledgerEngagement) ledgerEngagement.textContent = currency(oneqrEarnings.adRevenue);
  const ledgerPurchases = document.querySelector("#ledgerPurchaseRevenue");
  if (ledgerPurchases) ledgerPurchases.textContent = currency(oneqrEarnings.conversionBonus);
  renderAttributionEvents();
}

function recordOneQREvent(type, key = type) {
  const dedupeKey = `${type}:${key}`;
  if (sessionRevenueEvents.has(dedupeKey)) return false;
  sessionRevenueEvents.add(dedupeKey);
  if (type === "scan") oneqrEarnings.scans += 1;
  if (type === "menu") oneqrEarnings.menuViews += 1;
  if (type === "open") {
    oneqrEarnings.dealOpens += 1;
    oneqrEarnings.adRevenue = Number(oneqrEarnings.adRevenue || 0) + 0.05;
  }
  if (type === "search") {
    oneqrEarnings.searches += 1;
  }
  if (type === "purchase") {
    oneqrEarnings.purchases += 1;
    oneqrEarnings.conversionBonus = Number(oneqrEarnings.conversionBonus || 0) + 2;
  }
  const eventMeta = {
    scan: { label: "OneQR scan", amount: 0, icon: "⌗", detail: "Phiên QR được tạo · không tính tiền" },
    menu: { label: "Menu opened", amount: 0, icon: "▣", detail: "Tiện ích của tiệm · không tính tiền" },
    search: { label: "Deal search", amount: 0, icon: "⌕", detail: "Khách chủ động tìm · không tính tiền" },
    open: { label: "Qualified sponsored click", amount: .05, icon: "↗", detail: "Sponsored deal được mở hợp lệ" },
    purchase: { label: "Completed service", amount: 2, icon: "$", detail: "Giao dịch hoàn tất · pending review" },
  }[type] || { label: type, amount: 0, icon: "•", detail: "Attribution event" };
  attributionEvents.unshift({
    id: `evt-${Date.now()}-${type}`,
    type,
    key,
    createdAt: new Date().toISOString(),
    ...eventMeta,
  });
  attributionEvents = attributionEvents.slice(0, 30);
  localStorage.setItem("nexora-attribution-events", JSON.stringify(attributionEvents));
  persistOneQREarnings();
  renderEarnings();
  return true;
}

function renderAttributionEvents() {
  const container = document.querySelector("#attributionEventList");
  if (!container) return;
  if (!attributionEvents.length) {
    container.innerHTML = '<div class="event-empty">Chưa có sự kiện. Mở OneQR để xem luồng attribution hoạt động.</div>';
    return;
  }
  container.innerHTML = attributionEvents.slice(0, 10).map((item) => {
    const when = new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return `<div class="event-row ${Number(item.amount) > 0 ? "billable" : ""}"><span class="event-icon">${escapeHTML(item.icon)}</span><div><strong>${escapeHTML(item.label)}</strong><small>${escapeHTML(item.detail)} · ${escapeHTML(when)}</small></div><b>${Number(item.amount) > 0 ? `+${currency(item.amount)}` : "$0.00"}</b></div>`;
  }).join("");
}

function renderBusinessWorkspace() {
  const activeCount = 3 + customDeals.length;
  const count = document.querySelector("#activeCampaignCount");
  if (count) count.textContent = activeCount;
  ["#overviewAdsCredit", "#adsCreditBalance"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = currency(adsCredit);
  });
  renderEarnings();
}

function switchBusinessView(view = "overview") {
  document.querySelectorAll(".business-tabs [data-business-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.businessView === view);
  });
  document.querySelectorAll("[data-business-panel]").forEach((panel) => {
    const active = panel.dataset.businessPanel === view;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  renderBusinessWorkspace();
  document.querySelector(".business-tabs")?.scrollIntoView({ block: "start" });
}

function oneQRDealRows(items = deals.slice(0, 4)) {
  return `<div class="oneqr-deals">${items.map((deal) => `
    <article class="oneqr-deal">
      <div><small class="sponsored-label">SPONSORED · ONEQR PARTNER</small><strong>${escapeHTML(deal.title)}</strong><small>${escapeHTML(deal.salon)} · ${Number(deal.distance).toFixed(1)} mi · <b>$${escapeHTML(deal.price)}</b></small></div>
      <button type="button" data-oneqr-open="${escapeHTML(deal.id)}">Xem deal</button>
    </article>
  `).join("")}</div>`;
}

function renderOneQR(view = "menu", query = "") {
  document.querySelectorAll("[data-oneqr-view]").forEach((button) => button.classList.toggle("active", button.dataset.oneqrView === view));
  const container = document.querySelector("#oneqrView");
  if (view === "menu") {
    recordOneQREvent("menu");
    container.innerHTML = `
      <section class="oneqr-hero"><span>UTILITY FIRST</span><h3>Mọi thứ khách cần tại tiệm.</h3><p>Check-in, menu, booking và rewards mở ngay trên trình duyệt — không cần cài app.</p><button type="button" data-oneqr-view="deals">Khám phá quanh đây →</button></section>
      <div class="oneqr-utilities">
        <button type="button" data-oneqr-utility="Check-in"><span>✓</span><strong>Check-in</strong><small>Đến lượt nhanh</small></button>
        <button type="button" data-oneqr-utility="Đặt lịch"><span>◷</span><strong>Đặt lịch</strong><small>Xem chỗ trống</small></button>
        <button type="button" data-oneqr-utility="Rewards"><span>♡</span><strong>Rewards</strong><small>Xem quyền lợi</small></button>
        <button type="button" data-oneqr-utility="Gọi hỗ trợ"><span>⌁</span><strong>Hỗ trợ</strong><small>Gọi nhân viên</small></button>
      </div>
      <div class="oneqr-section-title"><div><span>SERVICE MENU</span><h3>Dịch vụ phổ biến</h3></div><button type="button" data-oneqr-view="search">Tìm deal</button></div>
      <div class="oneqr-services">
        <article class="oneqr-service"><div><strong>Gel-X Full Set</strong><small>60–75 min · từ $70</small></div><button type="button" data-oneqr-service="Gel-X">Tìm deal</button></article>
        <article class="oneqr-service"><div><strong>Gel Manicure</strong><small>45 min · từ $45</small></div><button type="button" data-oneqr-service="Manicure">Tìm deal</button></article>
        <article class="oneqr-service"><div><strong>Spa Pedicure</strong><small>50 min · từ $55</small></div><button type="button" data-oneqr-service="Pedicure">Tìm deal</button></article>
      </div>`;
    return;
  }
  if (view === "deals") {
    container.innerHTML = `<div class="oneqr-section-title"><div><span>NEARBY + DISCOVER</span><h3>Deal dành cho bạn</h3></div></div>${oneQRDealRows()}`;
    return;
  }
  const normalized = query.trim().toLocaleLowerCase("vi");
  const matches = normalized ? deals.filter((deal) => `${deal.title} ${deal.salon} ${deal.category}`.toLocaleLowerCase("vi").includes(normalized)) : deals.slice(0, 4);
  container.innerHTML = `
    <form class="oneqr-search" id="oneqrSearchForm"><input name="query" value="${escapeHTML(query)}" placeholder="Gel-X, manicure, pedicure..." aria-label="Tìm deal trong OneQR" /><button type="submit">Tìm</button></form>
    <div class="oneqr-section-title"><div><span>SEARCH DEALS</span><h3>${query ? `${matches.length} kết quả` : "Gợi ý gần bạn"}</h3></div></div>
    ${oneQRDealRows(matches)}`;
}

function openOneQR() {
  if (businessDialog?.open) closeModal(businessDialog);
  recordOneQREvent("scan");
  renderOneQR("menu");
  switchOneQRStage("guest");
  updateOneQRSimulator();
  openModal(oneqrDialog);
}

function switchOneQRStage(stage = "guest") {
  document.querySelectorAll("[data-oneqr-stage]").forEach((button) => {
    button.classList.toggle("active", button.dataset.oneqrStage === stage);
  });
  document.querySelectorAll("[data-oneqr-stage-panel]").forEach((panel) => {
    const active = panel.dataset.oneqrStagePanel === stage;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  if (stage === "performance") updateOneQRSimulator();
}

function updateOneQRSimulator() {
  const range = document.querySelector("#oneqrTrafficRange");
  if (!range) return;
  const daily = Number(range.value) || 800;
  const monthly = daily * 30;
  const discovery = Math.round(monthly * .21);
  const clicks = Math.round(monthly * .064);
  const bookings = Math.round(monthly * .012);
  const hostRevenue = (clicks * .05) + (bookings * 2);
  const formatter = new Intl.NumberFormat("en-US");
  document.querySelector("#dailyTrafficValue").textContent = formatter.format(daily);
  document.querySelector("#monthlyScans").textContent = formatter.format(monthly);
  document.querySelector("#discoveryOpens").textContent = formatter.format(discovery);
  document.querySelector("#qualifiedClicks").textContent = formatter.format(clicks);
  document.querySelector("#attributedBookings").textContent = formatter.format(bookings);
  document.querySelector("#projectedHostRevenue").textContent = `${currency(hostRevenue)} / tháng`;
}

function persistSavedDeals() {
  localStorage.setItem("nexora-saved-deals", JSON.stringify([...savedDeals]));
}

function toggleSaved(id) {
  const deal = getDeal(id);
  if (!deal) return;
  if (savedDeals.has(id)) {
    savedDeals.delete(id);
    showToast(`Đã bỏ “${deal.title}” khỏi wishlist.`);
  } else {
    savedDeals.add(id);
    showToast(`Đã lưu “${deal.title}” vào wishlist.`);
  }
  persistSavedDeals();
  renderDeals();
}

function openModal(dialog) {
  if (dialog && !dialog.open) dialog.showModal();
}

function closeModal(dialog) {
  if (dialog?.open) dialog.close();
}

function setActiveNavigation(hash) {
  const dealSubroutes = new Set(["#nearby", "#coupons", "#requests", "#openings", "#last-minute", "#my-open-slots"]);
  const primaryHash = dealSubroutes.has(hash) ? "#coupons" : hash;
  document.querySelectorAll(".desktop-nav a, .mobile-nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === primaryHash);
  });
}

function setActiveDealSubnav(hash) {
  const subroute = ({
    "#nearby": "nearby",
    "#coupons": "coupons",
    "#requests": "requests",
    "#openings": "openings",
    "#last-minute": "last-minute",
    "#my-open-slots": "my-open-slots",
  })[hash] || null;
  document.querySelectorAll("[data-deal-subroute]").forEach((link) => {
    link.classList.toggle("active", link.dataset.dealSubroute === subroute);
    if (link.dataset.dealSubroute === subroute) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function openDeal(id, source = null) {
  const deal = getDeal(id);
  if (!deal) return;
  const offerClass = getOfferClassification(deal);
  activeDealId = deal.id;
  activeAttributionSource = source;
  document.querySelector("#dealDialogTitle").textContent = deal.title;
  document.querySelector("#detailSalon").textContent = deal.salon;
  document.querySelector("#detailDistance").textContent = `· ${deal.distance.toFixed(1)} mi`;
  document.querySelector("#detailRating").textContent = `· ★ ${deal.rating} (${deal.reviews})`;
  document.querySelector("#detailPrice").textContent = `$${deal.price}`;
  document.querySelector("#detailOriginal").textContent = `$${deal.original}`;
  document.querySelector("#detailSaving").textContent = deal.discount;
  document.querySelector("#detailDescription").textContent = deal.description;
  document.querySelector("#detailSchedule").textContent = deal.schedule;
  document.querySelector("#detailLocation").textContent = deal.location;
  document.querySelector("#detailInventory").textContent = deal.inventoryLabel || (offerClass.isCoupon ? `${offerClass.inventory} coupon` : "Không giới hạn lượt");
  document.querySelector("#detailTerms").textContent = deal.terms;
  document.querySelector("#detailBadge").textContent = deal.badge;
  document.querySelector("#detailVerified").hidden = !deal.verified;
  const detailImage = document.querySelector("#detailImage");
  detailImage.hidden = !deal.image;
  if (deal.image) detailImage.src = deal.image;
  document.querySelector("#bookDealLink").href = buildTouchUrl(`/b/${encodeURIComponent(deal.bookingSlug || "bitcoin-nail-bar")}`, {
    deal: deal.id,
    promotion_id: deal.promotionId || null,
  });

  const existingClaim = offerClass.isCoupon ? couponClaims[couponClaimKey("deal", deal.id)] : null;
  const couponResult = document.querySelector("#couponResult");
  couponResult.hidden = !offerClass.isCoupon || !existingClaim;
  document.querySelector("#couponCode").textContent = existingClaim?.phoneMasked || "";
  const claimButton = document.querySelector("#claimDealButton");
  claimButton.dataset.offerClass = offerClass.type;
  claimButton.textContent = offerClass.isCoupon ? (existingClaim ? "Đã giữ coupon" : "Lấy coupon bằng SĐT") : "Đặt deal ngay";
  const attribution = document.querySelector("#oneqrAttribution");
  const purchaseButton = document.querySelector("#simulatePurchaseButton");
  attribution.hidden = source !== "oneqr";
  purchaseButton.disabled = sessionRevenueEvents.has(`purchase:${deal.id}`);
  purchaseButton.textContent = purchaseButton.disabled ? "Đã ghi nhận giao dịch demo" : "Mô phỏng mua dịch vụ · +$2.00 cho tiệm";
  updateSavedUI();
  emitNexoraFunctionEvent("deal_opened", { deal_id: deal.id, attribution: source || trafficSource || "nexora-deals" });
  openModal(dealDialog);
}

function simulatePurchase() {
  if (!activeDealId || activeAttributionSource !== "oneqr") return;
  const recorded = recordOneQREvent("purchase", activeDealId);
  const button = document.querySelector("#simulatePurchaseButton");
  button.disabled = true;
  button.textContent = "Đã ghi nhận giao dịch demo";
  showToast(recorded ? "Completed purchase đã vào ledger demo: +$2.00 cho tiệm." : "Giao dịch này đã được ghi nhận trong session.");
}

function makeCouponCode() {
  const bytes = new Uint8Array(4);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  return `NX-${[...bytes].map((byte) => byte.toString(36).toUpperCase().padStart(2, "0")).join("").slice(0, 8)}`;
}

function claimActiveDeal() {
  if (!activeDealId) return;
  const deal = getDeal(activeDealId);
  if (!getOfferClassification(deal).isCoupon) {
    document.querySelector("#bookDealLink")?.click();
    return;
  }
  openCouponClaim(activeDealId, "deal");
}

function renderRequests() {
  const requestList = document.querySelector("#requestList");
  document.querySelector("#requestCount").textContent = `${serviceRequests.length} nhu cầu`;
  if (!serviceRequests.length) {
    requestList.innerHTML = '<div class="request-empty">Chưa có nhu cầu nào. Offer phù hợp sẽ xuất hiện tại đây.</div>';
    return;
  }
  requestList.innerHTML = serviceRequests.map((request) => `
    <article class="request-item">
      <span>ĐANG NHẬN OFFER · ${escapeHTML(request.radius)} MI</span>
      <strong>${escapeHTML(request.service)}</strong>
      <small>Ngân sách $${escapeHTML(request.budget)} · ${escapeHTML(request.date)} · ${escapeHTML(request.time)}</small>
    </article>
  `).join("");
}

function openRequestDialog() {
  renderRequests();
  openModal(requestDialog);
}

function submitRequest(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const request = {
    id: `req-${Date.now()}`,
    service: formData.get("service"),
    budget: formData.get("budget"),
    radius: formData.get("radius"),
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes"),
  };
  serviceRequests.unshift(request);
  localStorage.setItem("nexora-service-requests", JSON.stringify(serviceRequests));
  renderRequests();
  emitNexoraFunctionEvent("deal_match_created", { request_id: request.id, service: request.service, radius: request.radius });
  event.currentTarget.reset();
  setDefaultDates();
  showToast("Đã đăng nhu cầu. Salon Nexora Verified trong bán kính sẽ nhận được thông báo.");
}

function renderMap(radius = Number(document.querySelector("#radiusRange").value)) {
  const nearbyDeals = deals.filter((deal) => deal.distance <= radius).sort((a, b) => a.distance - b.distance);
  document.querySelector("#radiusValue").textContent = `${radius} miles`;
  document.querySelector("#mapResultCount").textContent = `${nearbyDeals.length} deal đang mở`;
  const positions = [
    [24, 28], [66, 22], [39, 66], [77, 62], [13, 76], [83, 39], [53, 15],
  ];
  document.querySelector("#largeMapPins").innerHTML = nearbyDeals.map((deal, index) => {
    const [left, top] = positions[index % positions.length];
    return `<button class="large-map-pin" type="button" data-map-open="${escapeHTML(deal.id)}" style="left:${left}%;top:${top}%">$${escapeHTML(deal.price)}</button>`;
  }).join("");
  document.querySelector("#mapResults").innerHTML = nearbyDeals.map((deal) => `
    <button class="map-result-card" type="button" data-map-open="${escapeHTML(deal.id)}">
      <span>${deal.verified ? "✓ VERIFIED" : "LOCAL DEAL"} · ${deal.distance.toFixed(1)} MI</span>
      <strong>${escapeHTML(deal.title)}</strong>
      <small>${escapeHTML(deal.salon)} · $${escapeHTML(deal.price)}</small>
    </button>
  `).join("") || '<div class="request-empty">Không có deal trong bán kính này.</div>';
}

function openMapDialog() {
  renderMap();
  openModal(mapDialog);
}

function setDefaultDates() {
  const today = new Date();
  const requestDate = new Date(today);
  requestDate.setDate(today.getDate() + 2);
  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + 14);
  const requestInput = document.querySelector('#requestForm input[name="date"]');
  const expiryInput = document.querySelector('#merchantDealForm input[name="expiry"]');
  const todayString = today.toISOString().slice(0, 10);
  requestInput.min = todayString;
  expiryInput.min = todayString;
  if (!requestInput.value) requestInput.value = requestDate.toISOString().slice(0, 10);
  if (!expiryInput.value) expiryInput.value = expiryDate.toISOString().slice(0, 10);
}

function updateMerchantPreview() {
  const form = document.querySelector("#merchantDealForm");
  const formData = new FormData(form);
  const offerClass = getOfferClassification(formData.get("inventory"));
  const classifier = document.querySelector("#offerClassifier");
  const perCustomerField = document.querySelector("#perCustomerField");
  const perCustomerSelect = form.elements.perCustomer;
  classifier.classList.toggle("coupon", offerClass.isCoupon);
  classifier.classList.toggle("deal", !offerClass.isCoupon);
  document.querySelector("#offerClassIcon").textContent = offerClass.isCoupon ? "🎟️" : "🏷️";
  document.querySelector("#offerClassTitle").textContent = offerClass.isCoupon ? "Coupon có giới hạn" : "Deal banner không giới hạn";
  document.querySelector("#offerClassCopy").textContent = offerClass.isCoupon
    ? `Có ${offerClass.inventory} lượt để khách lấy coupon; hết lượt hệ thống tự dừng.`
    : "Không phát coupon và không trừ số lượng; khách xem giá hoặc mức OFF rồi đặt/mua theo điều kiện.";
  perCustomerSelect.disabled = !offerClass.isCoupon;
  perCustomerField.classList.toggle("is-disabled", !offerClass.isCoupon);
  updateCampaignEconomics(formData);
  const channels = [
    formData.get("crmSms") === "on" && "CRM/SMS",
    formData.get("nearby") === "on" && "Nearby",
    formData.get("discover") === "on" && "Discover",
    formData.get("searchDeals") === "on" && "Search",
    formData.get("oneqrRevenue") === "on" && "OneQR earnings",
  ].filter(Boolean);
  const price = Number(formData.get("price")) || 0;
  const original = Number(formData.get("original")) || 0;
  const offerValue = getOfferValueLabel(formData.get("dealType"), price, original);
  document.querySelector("#merchantPreview > span").textContent = offerClass.isCoupon ? "COUPON" : "DEAL BANNER";
  document.querySelector("#merchantPreview > div").innerHTML = `
    <small>Nexora Touch Nail Spa</small>
    <strong>${escapeHTML(formData.get("title") || "Untitled promotion")}</strong>
    <p><b>${escapeHTML(offerValue)}</b> <del>$${escapeHTML(formData.get("original") || "—")}</del> · ${offerClass.isCoupon ? `${offerClass.inventory} lượt có sẵn` : "không giới hạn số lượng"}</p>
    <small>${escapeHTML(channels.join(" · ") || "Chưa chọn kênh phân phối")}</small>
  `;
}

function updateCampaignEconomics(formData = new FormData(document.querySelector("#merchantDealForm"))) {
  const price = Number(formData.get("price")) || 0;
  const cost = Number(formData.get("serviceCost")) || 0;
  const upsell = Number(formData.get("expectedUpsell")) || 0;
  const feeRate = Math.min(50, Math.max(0, Number(formData.get("platformFee")) || 0)) / 100;
  const merchantReceives = price * (1 - feeRate);
  const contribution = merchantReceives + upsell - cost;
  const margin = price + upsell > 0 ? (contribution / (price + upsell)) * 100 : 0;
  const offerClass = getOfferClassification(formData.get("inventory"));
  const dailyCap = Math.max(1, Number(formData.get("dailyCap")) || 6);
  const forecastCapacity = offerClass.inventory || Math.max(30, dailyCap * 14);
  const lowBookings = Math.max(1, Math.round(forecastCapacity * .6));
  const highBookings = Math.max(lowBookings, Math.round(forecastCapacity * .85));
  const forecastGross = highBookings * (price + upsell);

  document.querySelector("#customerPays").textContent = currency(price);
  document.querySelector("#merchantReceives").textContent = currency(merchantReceives);
  document.querySelector("#contributionMargin").textContent = currency(contribution);
  document.querySelector("#marginPercent").textContent = `${Math.round(margin)}%`;
  document.querySelector("#entryTierPrice").textContent = currency(price).replace(".00", "");
  document.querySelector("#upgradeTierPrice").textContent = currency(price + 14).replace(".00", "");
  document.querySelector("#premiumTierPrice").textContent = currency(price + 34).replace(".00", "");
  document.querySelector("#forecastReach").textContent = `${(forecastCapacity * 80 / 1000).toFixed(1)}K–${(forecastCapacity * 105 / 1000).toFixed(1)}K`;
  document.querySelector("#forecastBookings").textContent = `${lowBookings}–${highBookings}`;
  document.querySelector("#forecastRevenue").textContent = `$${Math.round(forecastGross / 100) * 100}+`;

  const status = document.querySelector("#economicsStatus");
  const advice = document.querySelector("#economicsAdvice");
  if (margin >= 35) {
    status.textContent = "● Healthy margin";
    status.className = "economics-status healthy";
    advice.textContent = `Biên lợi nhuận tốt. Upgrade ${currency(price + 14).replace(".00", "")} có thể tăng order value mà không cần giảm sâu hơn.`;
  } else if (margin >= 20) {
    status.textContent = "● Watch margin";
    status.className = "economics-status warning";
    advice.textContent = "Margin hơi mỏng. Hãy giảm discount, tăng upsell hoặc chỉ mở campaign vào giờ thấp điểm.";
  } else {
    status.textContent = "● Margin risk";
    status.className = "economics-status risk";
    advice.textContent = "Campaign có nguy cơ lỗ. Nexora đề nghị tăng giá deal hoặc giảm chi phí dịch vụ trước khi publish.";
  }
}

const campaignPresets = {
  new: {
    insight: "Thứ Hai–Thứ Năm đang còn 38% công suất. Gợi ý: thu hút khách mới bằng Gel-X entry offer, sau đó upsell nail art.",
    title: "Khách mới: Gel-X full set + 2 accent nails",
    original: 80,
    price: 65,
    inventory: 30,
    dailyCap: 6,
    cost: 28,
    upsell: 12,
    terms: "New clients · Mon–Thu · Appointment required · Extra length và 3D art không bao gồm",
    sms: "Nexora Touch Nail Spa: Ưu đãi khách mới Gel-X full set chỉ $65. Xem deal & đặt lịch: {smart_link} Reply STOP to opt out.",
  },
  capacity: {
    insight: "Khoảng 10 AM–3 PM giữa tuần đang trống nhiều nhất. Campaign sẽ tự boost trong giờ thấp điểm và pause khi đạt 85% công suất.",
    title: "Midweek Gel Manicure Reset",
    original: 55,
    price: 42,
    inventory: 36,
    dailyCap: 8,
    cost: 19,
    upsell: 9,
    terms: "Mon–Thu · 10 AM–3 PM · Appointment required · Không cộng dồn offer khác",
    sms: "Nexora Touch Nail Spa: Lịch giữa tuần đang mở — Gel Manicure Reset $42. Đặt giờ: {smart_link} Reply STOP to opt out.",
  },
  winback: {
    insight: "Có 286 khách Gel-X chưa quay lại trong 45 ngày. Gợi ý gửi comeback offer có hạn thay vì giảm giá cho toàn bộ khách.",
    title: "Comeback Gel-X Refresh + Free Repair",
    original: 78,
    price: 62,
    inventory: 24,
    dailyCap: 5,
    cost: 27,
    upsell: 14,
    terms: "Dành cho khách chưa ghé 45 ngày · Hết hạn sau 14 ngày · Appointment required",
    sms: "We miss you at Nexora Touch Nail Spa. Gel-X Refresh $62 + free repair: {smart_link} Reply STOP to opt out.",
  },
  loyalty: {
    insight: "Khách quay lại trung bình sau 31 ngày. Gói 3 lần giúp tăng retention và giữ giá trị cao hơn coupon một lần.",
    title: "3-Visit Nail Care Pass + Free Nail Art",
    original: 165,
    price: 139,
    inventory: 20,
    dailyCap: 6,
    cost: 72,
    upsell: 18,
    terms: "3 visits trong 90 ngày · Không chuyển nhượng · Booking required",
    sms: "Nexora Touch Nail Spa: Nail Care Pass 3 lần $139 + free nail art. Xem quyền lợi: {smart_link} Reply STOP to opt out.",
  },
};

function selectCampaignGoal(goal) {
  document.querySelectorAll('.goal-grid input[name="campaignGoal"]').forEach((input) => input.closest("label").classList.toggle("active", input.value === goal));
  document.querySelector("#copilotInsight").textContent = campaignPresets[goal]?.insight || campaignPresets.new.insight;
}

function applyAICampaign() {
  const form = document.querySelector("#merchantDealForm");
  const goal = new FormData(form).get("campaignGoal") || "new";
  const preset = campaignPresets[goal];
  form.elements.title.value = preset.title;
  form.elements.original.value = preset.original;
  form.elements.price.value = preset.price;
  form.elements.inventory.value = preset.inventory;
  form.elements.dailyCap.value = preset.dailyCap;
  form.elements.serviceCost.value = preset.cost;
  form.elements.expectedUpsell.value = preset.upsell;
  form.elements.terms.value = preset.terms;
  form.elements.smsMessage.value = preset.sms;
  document.querySelector("#entryTierName").textContent = goal === "loyalty" ? "1-Visit Starter" : "Essential";
  document.querySelector("#upgradeTierName").textContent = goal === "loyalty" ? "3-Visit Care Pass" : "Service + Add-on";
  document.querySelector("#premiumTierName").textContent = goal === "loyalty" ? "VIP Quarterly Pass" : "Signature Experience";
  updateMerchantPreview();
  showToast("Campaign Copilot đã tạo offer, guardrails, CRM message và dự báo lợi nhuận.");
}

function submitMerchantDeal(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const marketplaceEnabled = formData.get("marketplace") === "on";
  const crmEnabled = formData.get("crmSms") === "on";
  const oneqrEnabled = formData.get("oneqrRevenue") === "on";
  const price = Number(formData.get("price"));
  const original = Number(formData.get("original"));
  const offerClass = getOfferClassification(formData.get("inventory"));
  const offerValue = getOfferValueLabel(formData.get("dealType"), price, original);
  if (price >= original) {
    showToast("Giá deal cần thấp hơn giá gốc.");
    return;
  }

  if (!marketplaceEnabled) {
    closeModal(businessDialog);
    showToast(crmEnabled ? "Promotion đã lưu và CRM/SMS campaign demo đã được xếp lịch." : "Promotion đã lưu trong Nexora Touch; marketplace đang tắt.");
    return;
  }

  const placements = [
    formData.get("nearby") === "on" && "Nearby",
    formData.get("discover") === "on" && "Discover",
    formData.get("searchDeals") === "on" && "Search",
  ].filter(Boolean);
  if (!placements.length) {
    showToast("Hãy chọn ít nhất một vị trí: Nearby, Discover hoặc Search.");
    return;
  }

  const newDeal = {
    id: `nxt-${Date.now()}`,
    category: formData.get("category"),
    salon: "Nexora Touch Nail Spa",
    title: formData.get("title"),
    price,
    original,
    discount: offerValue,
    dealType: formData.get("dealType"),
    offerClass: offerClass.type,
    unlimitedInventory: !offerClass.isCoupon,
    distance: 0.8,
    rating: 4.9,
    reviews: 186,
    deadline: offerClass.isCoupon ? `Đồng bộ vừa xong · ${offerClass.inventory} suất` : `Chạy đến ${formData.get("expiry")} · không giới hạn lượt`,
    badge: `${offerClass.isCoupon ? "COUPON" : "DEAL"} · ${oneqrEnabled ? "ONEQR" : "TOUCH"}`,
    verified: true,
    inventory: offerClass.inventory,
    instant: formData.get("booking") === "on",
    description: `${offerClass.isCoupon ? "Coupon có số lượng" : "Deal banner không giới hạn số lượng"} từ Nexora Touch, phân phối tới ${placements.join(", ")}${crmEnabled ? " và CRM/SMS khách đã opt-in" : ""}.`,
    schedule: `Đến ${formData.get("expiry")}`,
    location: "Garden Grove, CA",
    terms: formData.get("terms") || "Xem điều kiện tại salon.",
    bookingSlug: "bitcoin-nail-bar",
    source: "nexora-touch",
    promotionId: `promo-${Date.now()}`,
    placements,
    oneqrRevenue: oneqrEnabled,
    crmCampaign: crmEnabled ? {
      segment: formData.get("segment"),
      timing: formData.get("sendTiming"),
      message: formData.get("smsMessage"),
      consentRequired: true,
    } : null,
    campaignGoal: formData.get("campaignGoal"),
    dailyCap: Number(formData.get("dailyCap")),
    perCustomer: offerClass.isCoupon ? formData.get("perCustomer") : null,
    offerOptions: [
      { tier: "entry", price },
      { tier: "upgrade", price: price + 14 },
      { tier: "premium", price: price + 34 },
    ],
    unitEconomics: {
      serviceCost: Number(formData.get("serviceCost")),
      expectedUpsell: Number(formData.get("expectedUpsell")),
      platformFeePercent: Number(formData.get("platformFee")),
    },
    automations: {
      autoPause: formData.get("autoPause") === "on",
      smartBoost: formData.get("smartBoost") === "on",
      protectReturning: formData.get("protectReturning") === "on",
    },
  };
  customDeals.unshift(newDeal);
  localStorage.setItem("nexora-custom-deals", JSON.stringify(customDeals));
  deals = [newDeal, ...deals];
  state.activeCategory = "all";
  state.savedOnly = false;
  state.maxPrice = Number.POSITIVE_INFINITY;
  state.maxDistance = 5;
  document.querySelectorAll(".service-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.service === "all"));
  closeModal(businessDialog);
  renderDeals();
  document.querySelector(".results-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`Đã publish ${offerClass.isCoupon ? `Coupon ${offerClass.inventory} lượt` : "Deal banner không giới hạn"}: ${crmEnabled ? "CRM/SMS + " : ""}${placements.join(" + ")}${oneqrEnabled ? " + OneQR earnings" : ""}.`);
}

function applyFilters(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  state.maxPrice = Number(formData.get("maxPrice"));
  state.maxDistance = Number(formData.get("distance"));
  state.verifiedOnly = formData.get("verified") === "on";
  state.savedOnly = false;
  closeModal(filterDialog);
  renderDeals();
  syncSearchUrl();
  showToast("Đã áp dụng bộ lọc gần bạn.");
}

const DEAL_WORKSPACE_ROUTES = new Set([
  "#nearby",
  "#coupons",
  "#requests",
  "#openings",
  "#last-minute",
  "#my-open-slots",
]);

const dealWorkspace = document.querySelector("#dealWorkspace");

const workspaceIndustries = [
  ["all", "Mọi ngành", ""],
  ["beauty", "💅 Làm đẹp & chăm sóc cá nhân", "7"],
  ["food", "🍜 Ăn uống", "4"],
  ["shopping", "🛍️ Mua sắm", "6"],
  ["health", "🩺 Sức khoẻ", "4"],
  ["auto", "🚗 Xe & di chuyển", "4"],
  ["home", "🏠 Nhà cửa & sửa chữa", "1"],
  ["finance", "💼 Tài chính · pháp lý · địa ốc", "3"],
  ["education", "🎓 Giáo dục & đào tạo", "2"],
  ["family", "👶 Gia đình & thú cưng", "1"],
];

const couponTaxonomy = {"groups":[{"id":"beauty","ic":"💅","vi":"Làm đẹp & chăm sóc cá nhân","en":"Beauty & personal care"},{"id":"food","ic":"🍜","vi":"Ăn uống","en":"Food & drink"},{"id":"shop","ic":"🛍️","vi":"Mua sắm","en":"Shopping"},{"id":"health","ic":"🩺","vi":"Sức khoẻ","en":"Health"},{"id":"auto","ic":"🚗","vi":"Xe & di chuyển","en":"Auto & transport"},{"id":"home","ic":"🏠","vi":"Nhà cửa & sửa chữa","en":"Home & repair"},{"id":"finance","ic":"💼","vi":"Tài chính · pháp lý · địa ốc","en":"Finance · legal · real estate"},{"id":"travel","ic":"✈️","vi":"Du lịch & lưu trú","en":"Travel & stay"},{"id":"edu","ic":"🎓","vi":"Giáo dục & đào tạo","en":"Education & training"},{"id":"event","ic":"🎉","vi":"Sự kiện & giải trí","en":"Events & entertainment"},{"id":"family","ic":"👶","vi":"Gia đình & thú cưng","en":"Family & pets"},{"id":"biz","ic":"🏢","vi":"Dịch vụ doanh nghiệp & công nghệ","en":"Business services & tech"},{"id":"community","ic":"⛪","vi":"Cộng đồng & phi lợi nhuận","en":"Community & non-profit"}],"inds":[{"id":"nail","g":"beauty","vi":"Nail","en":"Nail salon","ic":"💅","kw":"gel-?x|bột|bot nail|acrylic|dip|sơn gel|son gel|nail|móng|mong tay"},{"id":"pedi","g":"beauty","vi":"Pedicure / chân","en":"Pedicure","ic":"🦶","kw":"pedi|chân|chan nuoc|foot"},{"id":"spa","g":"beauty","vi":"Spa & Massage","en":"Spa & massage","ic":"💆","kw":"massage|spa|xoa bóp|xoa bop|gội đầu dưỡng sinh|goi dau"},{"id":"lash","g":"beauty","vi":"Mi & chân mày","en":"Lashes & brows","ic":"👁️","kw":"mi\\b|lash|chân mày|chan may|brow"},{"id":"hair","g":"beauty","vi":"Tóc & salon","en":"Hair salon","ic":"💇","kw":"tóc|toc|hair|cắt|nhuộm|nhuom|uốn|uon"},{"id":"barber","g":"beauty","vi":"Barber / tóc nam","en":"Barbershop","ic":"💈","kw":"barber|tóc nam|toc nam|cạo râu|fade"},{"id":"skin","g":"beauty","vi":"Da & facial","en":"Skin & facial","ic":"🧖","kw":"facial|da mặt|da mat|skincare|trị mụn|tri mun|peel"},{"id":"pmu","g":"beauty","vi":"Phun xăm / PMU / xăm","en":"PMU & tattoo","ic":"🖋️","kw":"phun xăm|phun xam|phun xăm chân mày|phun xam chan may|phun môi|phun moi|pmu|xăm|xam\\b|tattoo|microblading|điêu khắc|dieu khac"},{"id":"medspa","g":"beauty","vi":"Thẩm mỹ y khoa","en":"Medspa & aesthetics","ic":"💉","kw":"botox|filler|laser|triệt lông|triet long|thẩm mỹ|tham my|medspa|nâng cơ|giảm mỡ"},{"id":"wax","g":"beauty","vi":"Wax / tẩy lông","en":"Waxing","ic":"🪒","kw":"wax|tẩy lông|tay long|sugaring"},{"id":"fitness","g":"beauty","vi":"Gym & thể hình","en":"Gym & fitness","ic":"🏋️","kw":"gym|thể hình|the hinh|fitness|tập|pt\\b|crossfit"},{"id":"yoga","g":"beauty","vi":"Yoga & pilates","en":"Yoga & pilates","ic":"🧘","kw":"yoga|pilates|thiền|thien|meditation"},{"id":"diet","g":"beauty","vi":"Giảm cân & dinh dưỡng","en":"Weight loss & nutrition","ic":"🥗","kw":"giảm cân|giam can|dinh dưỡng|dinh duong|detox|keto"},{"id":"food","g":"food","vi":"Nhà hàng / quán ăn","en":"Restaurant","ic":"🍜","kw":"nhà hàng|nha hang|quán ăn|quan an|phở|pho\\b|bún|bun bo|cơm|com tam|restaurant|lunch|dinner|ăn trưa|an trua|ăn tối"},{"id":"fastfood","g":"food","vi":"Bánh mì / ăn nhanh","en":"Fast food & sandwiches","ic":"🥖","kw":"bánh mì|banh mi|ăn nhanh|fast food|xôi|xoi|bánh cuốn"},{"id":"drink","g":"food","vi":"Cà phê / trà sữa","en":"Coffee & bubble tea","ic":"🧋","kw":"trà sữa|tra sua|cà phê|ca phe|cafe|coffee|boba|sinh tố|nước ép|nuoc ep"},{"id":"bakery","g":"food","vi":"Bánh / tiệc ngọt","en":"Bakery & desserts","ic":"🎂","kw":"bánh kem|banh kem|bánh sinh nhật|bakery|chè\\b|che\\b|dessert|kem\\b"},{"id":"hotpot","g":"food","vi":"Lẩu · nướng · buffet","en":"Hotpot · BBQ · buffet","ic":"🍲","kw":"lẩu|lau\\b|nướng|nuong|buffet|bbq|kbbq"},{"id":"seafood","g":"food","vi":"Hải sản","en":"Seafood","ic":"🦞","kw":"hải sản|hai san|cua|tôm|tom hùm|crawfish|seafood"},{"id":"vegan","g":"food","vi":"Chay","en":"Vegetarian & vegan","ic":"🥬","kw":"chay|vegan|vegetarian|thuần chay"},{"id":"foodtruck","g":"food","vi":"Food truck","en":"Food truck","ic":"🚚","kw":"food truck|xe đồ ăn|xe do an"},{"id":"bar","g":"food","vi":"Bar · pub · karaoke","en":"Bar · pub · karaoke","ic":"🍻","kw":"bar\\b|pub\\b|karaoke|nhậu|nhau\\b|bia\\b|beer|lounge"},{"id":"banquet","g":"food","vi":"Nhà hàng tiệc cưới","en":"Wedding banquet hall","ic":"🏛️","kw":"tiệc cưới|tiec cuoi|banquet|nhà hàng tiệc|hội trường"},{"id":"catering","g":"food","vi":"Catering / đặt tiệc","en":"Catering","ic":"🍽️","kw":"catering|đặt tiệc|dat tiec|nấu tiệc|party tray"},{"id":"homefood","g":"food","vi":"Đồ ăn nhà làm / online","en":"Home-cooked & online food","ic":"🥡","kw":"nhà làm|nha lam|đặt online|ship đồ ăn|homemade|đặc sản|dac san"},{"id":"market","g":"shop","vi":"Chợ / siêu thị","en":"Grocery & market","ic":"🛒","kw":"chợ|cho\\b|siêu thị|sieu thi|grocery|market|rau|thịt|thit\\b|gạo|gao\\b|nước mắm"},{"id":"convenience","g":"shop","vi":"Tiện lợi / tạp hoá","en":"Convenience store","ic":"🏪","kw":"tiện lợi|tien loi|tạp hoá|tap hoa|convenience|smoke shop|vape"},{"id":"supply","g":"shop","vi":"Supply nail & spa / đồ nghề","en":"Nail & spa supply","ic":"📦","kw":"supply|đồ nghề|do nghe|vật tư|vat tu|bột nail|máy mài|may mai|máy hút|ghế spa|ghe spa|đèn gel|sỉ\\b|wholesale"},{"id":"cosmetic","g":"shop","vi":"Mỹ phẩm / nước hoa","en":"Cosmetics & perfume","ic":"💄","kw":"mỹ phẩm|my pham|nước hoa|nuoc hoa|son môi|skincare shop|sephora"},{"id":"import","g":"shop","vi":"Hàng xách tay","en":"Imported goods","ic":"🧳","kw":"xách tay|xach tay|hàng mỹ|hang my|hàng nhật|order hàng"},{"id":"fashion","g":"shop","vi":"Thời trang / áo dài","en":"Fashion & áo dài","ic":"👗","kw":"quần áo|quan ao|áo dài|ao dai|thời trang|thoi trang|boutique"},{"id":"shoes","g":"shop","vi":"Giày / túi xách","en":"Shoes & bags","ic":"👜","kw":"giày|giay\\b|túi xách|tui xach|dép|sneaker"},{"id":"jewelry","g":"shop","vi":"Vàng bạc / trang sức","en":"Jewelry & gold","ic":"💍","kw":"vàng|vang bac|nữ trang|nu trang|trang sức|jewelry|kim cương|nhẫn"},{"id":"electronics","g":"shop","vi":"Điện thoại / điện tử","en":"Phones & electronics","ic":"📱","kw":"điện thoại|dien thoai|iphone|laptop|điện tử|dien tu|tivi|máy tính"},{"id":"furniture","g":"shop","vi":"Nội thất / gia dụng","en":"Furniture & appliances","ic":"🛋️","kw":"nội thất|noi that|furniture|sofa|giường|nệm|nem\\b|gia dụng|gia dung|máy giặt|tủ lạnh"},{"id":"flower","g":"shop","vi":"Hoa tươi / quà tặng","en":"Flowers & gifts","ic":"💐","kw":"hoa tươi|hoa tuoi|florist|quà|qua tang|gift shop|giỏ quà"},{"id":"eyewear","g":"shop","vi":"Kính thời trang","en":"Eyewear store","ic":"🕶️","kw":"kính mát|kinh mat|sunglass|gọng kính|gong kinh"},{"id":"dental","g":"health","vi":"Nha sĩ","en":"Dentist","ic":"🦷","kw":"nha sĩ|nha si|nha khoa|răng|rang\\b|dental|dentist|niềng|nieng|tẩy trắng|implant"},{"id":"eye","g":"health","vi":"Mắt kính / nhãn khoa","en":"Optometry","ic":"👓","kw":"mắt kính|mat kinh|đo mắt|do mat|optometr|eye exam|contact lens|nhãn khoa"},{"id":"clinic","g":"health","vi":"Bác sĩ gia đình / phòng khám","en":"Family doctor & clinic","ic":"🩺","kw":"bác sĩ|bac si|phòng khám|phong kham|clinic|khám|kham benh|chích ngừa|physical|urgent care"},{"id":"specialist","g":"health","vi":"Bác sĩ chuyên khoa","en":"Medical specialist","ic":"🫀","kw":"chuyên khoa|chuyen khoa|tim mạch|da liễu|da lieu|sản phụ|san phu|nội tiết|tiêu hoá|ung thư|cardio|dermatolog"},{"id":"chiro","g":"health","vi":"Chiropractor / vật lý trị liệu","en":"Chiropractic & physical therapy","ic":"🦴","kw":"chiro|nắn xương|nan xuong|vật lý trị liệu|vat ly tri lieu|physical therapy|đau lưng|dau lung|tai nạn xe"},{"id":"acupuncture","g":"health","vi":"Châm cứu / đông y","en":"Acupuncture & herbal","ic":"🌿","kw":"châm cứu|cham cuu|đông y|dong y|thuốc bắc|thuoc bac|acupuncture|bấm huyệt"},{"id":"pharm","g":"health","vi":"Nhà thuốc / thuốc bổ","en":"Pharmacy & supplements","ic":"💊","kw":"nhà thuốc|nha thuoc|pharmacy|thuốc bổ|thuoc bo|vitamin|thực phẩm chức năng"},{"id":"lab","g":"health","vi":"Xét nghiệm / chẩn đoán","en":"Lab & imaging","ic":"🔬","kw":"xét nghiệm|xet nghiem|lab test|siêu âm|sieu am|x-?quang|mri|ct scan"},{"id":"mental","g":"health","vi":"Tâm lý / tư vấn","en":"Mental health & counseling","ic":"🧠","kw":"tâm lý|tam ly|counsel|therapy|therapist|trầm cảm|tram cam|stress"},{"id":"homehealth","g":"health","vi":"Chăm sóc người già / tại nhà","en":"Home health & senior care","ic":"👴","kw":"người già|nguoi gia|home health|chăm sóc tại nhà|cham soc tai nha|dưỡng lão|duong lao|caregiver"},{"id":"carwash","g":"auto","vi":"Rửa xe / detailing","en":"Car wash & detailing","ic":"🧽","kw":"rửa xe|rua xe|car ?wash|detailing|đánh bóng xe|danh bong"},{"id":"mechanic","g":"auto","vi":"Sửa xe / thay nhớt","en":"Auto repair & oil change","ic":"🔧","kw":"sửa xe|sua xe|thay nhớt|thay nhot|oil change|mechanic|bảo dưỡng|bao duong|check engine"},{"id":"tire","g":"auto","vi":"Lốp / thắng","en":"Tires & brakes","ic":"🛞","kw":"lốp|lop xe|tire|thắng|thang xe|brake|bánh xe|banh xe"},{"id":"bodyshop","g":"auto","vi":"Body shop / sơn xe","en":"Body shop & paint","ic":"🚘","kw":"body shop|sơn xe|son xe|đụng xe|dung xe|collision|móp|mop\\b|dent"},{"id":"tint","g":"auto","vi":"Tint / phụ kiện / audio","en":"Tint · accessories · audio","ic":"🎛️","kw":"tint|dán kính|dan kinh|phụ kiện xe|phu kien xe|audio|loa xe|camera hành trình|ppf|wrap"},{"id":"dealer","g":"auto","vi":"Mua bán xe","en":"Car sales & dealer","ic":"🚙","kw":"mua xe|ban xe|bán xe|dealer|xe cũ|xe cu|used car|xe mới"},{"id":"carrental","g":"auto","vi":"Cho thuê xe","en":"Car rental","ic":"🔑","kw":"thuê xe|thue xe|rent a car|car rental|turo"},{"id":"ride","g":"auto","vi":"Đưa đón / taxi / sân bay","en":"Rides · taxi · airport","ic":"🚕","kw":"đưa đón|dua don|đưa rước|ride|taxi|sân bay|san bay|airport|shuttle|uber"},{"id":"bus","g":"auto","vi":"Xe đò / xe khách","en":"Intercity bus","ic":"🚌","kw":"xe đò|xe do|xe khách|xe khach|charter|đi dallas|đi cali"},{"id":"moving","g":"auto","vi":"Vận chuyển / dọn nhà","en":"Moving & hauling","ic":"🚚","kw":"vận chuyển|van chuyen|dọn nhà|don nha|moving|chở hàng|cho hang|hauling"},{"id":"cargo","g":"auto","vi":"Gửi hàng về VN / cargo","en":"Cargo to Vietnam","ic":"📦","kw":"gửi hàng|gui hang|gửi về việt nam|gui ve viet nam|cargo|ship về|ship ve|freight|thùng hàng|thung hang"},{"id":"inspection","g":"auto","vi":"Đăng kiểm / giấy tờ xe","en":"Inspection & registration","ic":"📋","kw":"đăng kiểm|dang kiem|inspection|registration|title xe|giấy tờ xe|giay to xe"},{"id":"clean","g":"home","vi":"Dọn dẹp nhà cửa","en":"House cleaning","ic":"🧹","kw":"dọn dẹp|don dep|cleaning|dọn nhà|lau nhà|maid"},{"id":"remodel","g":"home","vi":"Sửa nhà / remodel","en":"Remodeling & contractor","ic":"🔨","kw":"sửa nhà|sua nha|remodel|handyman|contractor|xây|xay dung|cải tạo"},{"id":"plumbing","g":"home","vi":"Điện / nước","en":"Electrical & plumbing","ic":"🔌","kw":"điện|dien nuoc|thợ điện|tho dien|nước|plumb|ống nước|ong nuoc|rò rỉ"},{"id":"hvac","g":"home","vi":"Điện lạnh / HVAC","en":"HVAC","ic":"❄️","kw":"máy lạnh|may lanh|hvac|ac repair|điện lạnh|dien lanh|sưởi|heater|furnace"},{"id":"roof","g":"home","vi":"Mái nhà / roofing","en":"Roofing","ic":"🏚️","kw":"mái|mai nha|roof|dột|dot\\b|gutter"},{"id":"floor","g":"home","vi":"Sàn / gạch / đá","en":"Flooring & tile","ic":"🧱","kw":"sàn|san go|gạch|gach\\b|tile|đá granite|countertop|laminate"},{"id":"paint","g":"home","vi":"Sơn nhà","en":"Painting","ic":"🎨","kw":"sơn nhà|son nha|painting|sơn tường"},{"id":"landscape","g":"home","vi":"Sân vườn / cây cảnh","en":"Landscaping","ic":"🌳","kw":"sân vườn|san vuon|landscap|cắt cỏ|cat co|cây cảnh|cay canh|tưới"},{"id":"pool","g":"home","vi":"Hồ bơi","en":"Pool service","ic":"🏊","kw":"hồ bơi|ho boi|pool|bể bơi"},{"id":"pest","g":"home","vi":"Diệt côn trùng","en":"Pest control","ic":"🐜","kw":"côn trùng|con trung|pest|mối|moi\\b|gián|chuột|termite"},{"id":"garage","g":"home","vi":"Cửa / garage / cửa sổ","en":"Doors · garage · windows","ic":"🚪","kw":"garage|cửa|cua so|window|cửa sổ|khoá cửa"},{"id":"security","g":"home","vi":"Camera / an ninh / smart home","en":"Security & smart home","ic":"📹","kw":"camera|an ninh|báo động|bao dong|alarm|smart home|ring"},{"id":"laundry","g":"home","vi":"Giặt ủi / dry clean","en":"Laundry & dry cleaning","ic":"👕","kw":"giặt|giat ui|ủi|dry clean|laundry|sửa quần áo|alteration"},{"id":"locksmith","g":"home","vi":"Thợ khoá","en":"Locksmith","ic":"🗝️","kw":"thợ khoá|tho khoa|locksmith|làm chìa|mất chìa"},{"id":"tax","g":"finance","vi":"Thuế / kế toán","en":"Tax & accounting","ic":"🧾","kw":"thuế|thue\\b|1099|khai thuế|tax|kế toán|ke toan|bookkeep|payroll|cpa"},{"id":"insurance","g":"finance","vi":"Bảo hiểm","en":"Insurance","ic":"🛡️","kw":"bảo hiểm|bao hiem|insurance|nhân thọ|nhan tho|obamacare|medicare"},{"id":"remit","g":"finance","vi":"Gửi tiền / đổi tiền","en":"Money transfer & exchange","ic":"💸","kw":"gửi tiền|gui tien|chuyển tiền|chuyen tien|đổi tiền|doi tien|remit|western union|vlinkpay"},{"id":"loan","g":"finance","vi":"Vay / mortgage","en":"Loans & mortgage","ic":"🏦","kw":"vay|mortgage|loan|tín dụng|tin dung|refinance|credit"},{"id":"immigration","g":"finance","vi":"Luật sư di trú","en":"Immigration lawyer","ic":"🛂","kw":"luật sư di trú|luat su di tru|di trú|di tru|immigration|bảo lãnh|bao lanh|thẻ xanh|the xanh|quốc tịch|quoc tich|h1b|eb5|đoàn tụ"},{"id":"injury","g":"finance","vi":"Luật sư tai nạn / thương tích","en":"Injury lawyer","ic":"⚖️","kw":"tai nạn|tai nan|thương tích|thuong tich|injury|kiện|kien tung|bồi thường|boi thuong"},{"id":"lawyer","g":"finance","vi":"Luật sư gia đình / kinh doanh","en":"Family & business lawyer","ic":"📜","kw":"luật sư|luat su|lawyer|attorney|ly hôn|ly hon|di chúc|hợp đồng|hop dong|llc"},{"id":"notary","g":"finance","vi":"Công chứng / dịch thuật","en":"Notary & translation","ic":"✒️","kw":"công chứng|cong chung|notary|dịch thuật|dich thuat|translation|giấy tờ"},{"id":"realtor","g":"finance","vi":"Địa ốc mua bán","en":"Real estate agent","ic":"🏡","kw":"địa ốc|dia oc|realtor|mua nhà|mua nha|bán nhà|ban nha|real estate|nhà đất"},{"id":"rental","g":"finance","vi":"Cho thuê / quản lý nhà","en":"Rental & property management","ic":"🏘️","kw":"cho thuê|cho thue|thuê nhà|thue nha|apartment|phòng trọ|phong tro|property management"},{"id":"invest","g":"finance","vi":"Đầu tư / crypto","en":"Investing & crypto","ic":"📈","kw":"đầu tư|dau tu|crypto|bitcoin|chứng khoán|chung khoan|stock|cryptomap"},{"id":"flight","g":"travel","vi":"Vé máy bay","en":"Flights","ic":"🛫","kw":"vé máy bay|ve may bay|flight|vé về việt nam|air ticket"},{"id":"tour","g":"travel","vi":"Tour / du lịch","en":"Tours","ic":"🗺️","kw":"tour|du lịch|du lich|hành hương|hanh huong|cruise|vmmtravel"},{"id":"hotel","g":"travel","vi":"Khách sạn / homestay","en":"Hotels & stays","ic":"🏨","kw":"khách sạn|khach san|hotel|homestay|resort|airbnb"},{"id":"visa","g":"travel","vi":"Visa / hộ chiếu / giấy tờ","en":"Visa & passport services","ic":"🪪","kw":"hộ chiếu|ho chieu|passport|visa việt nam|miễn thị thực|giấy tờ du lịch"},{"id":"vietschool","g":"edu","vi":"Trường Việt ngữ","en":"Vietnamese language school","ic":"🇻🇳","kw":"việt ngữ|viet ngu|tiếng việt|tieng viet|học tiếng"},{"id":"tutor","g":"edu","vi":"Dạy kèm / luyện thi","en":"Tutoring & test prep","ic":"📚","kw":"dạy kèm|day kem|luyện thi|luyen thi|tutor|sat\\b|toán|toan\\b|gia sư"},{"id":"beautyschool","g":"edu","vi":"Trường nail / thẩm mỹ (license)","en":"Beauty school & license","ic":"🎓","kw":"trường nail|truong nail|license|lớp nail|lop nail|khoá học|khoa hoc|đào tạo|dao tao|class|beauty school|cosmetology"},{"id":"driving","g":"edu","vi":"Dạy lái xe","en":"Driving school","ic":"🚦","kw":"lái xe|lai xe|driving|bằng lái|bang lai|thi bằng"},{"id":"esl","g":"edu","vi":"Tiếng Anh / ESL / quốc tịch","en":"English & citizenship classes","ic":"🗣️","kw":"esl|tiếng anh|tieng anh|english|thi quốc tịch|thi quoc tich"},{"id":"arts","g":"edu","vi":"Nhạc · hoạ · võ · năng khiếu","en":"Music · art · martial arts","ic":"🎹","kw":"piano|guitar|nhạc|nhac\\b|vẽ|ve tranh|võ|vo thuat|taekwondo|múa|ballet"},{"id":"vocational","g":"edu","vi":"Đào tạo nghề / kỹ năng","en":"Vocational & skills","ic":"🛠️","kw":"học nghề|hoc nghe|dạy nghề|kỹ năng|ky nang|coding|ai business|bootcamp"},{"id":"photo","g":"event","vi":"Chụp ảnh / quay phim","en":"Photo & video","ic":"📷","kw":"chụp ảnh|chup anh|quay phim|photograph|videograph|studio|ảnh cưới|anh cuoi"},{"id":"bridal","g":"event","vi":"Áo cưới / makeup cô dâu","en":"Bridal & makeup","ic":"👰","kw":"áo cưới|ao cuoi|makeup|trang điểm|trang diem|cô dâu|co dau|bridal"},{"id":"planner","g":"event","vi":"Tổ chức tiệc / sự kiện","en":"Event planning","ic":"🎪","kw":"tổ chức|to chuc|event|planner|sinh nhật|sinh nhat|tiệc|tiec\\b|thôi nôi"},{"id":"music","g":"event","vi":"Nhạc sống / MC / DJ","en":"Live music · MC · DJ","ic":"🎤","kw":"ban nhạc|ban nhac|mc\\b|dj|ca sĩ|ca si|nhạc sống|karaoke thuê"},{"id":"rentalevent","g":"event","vi":"Thuê rạp / bàn ghế / trang trí","en":"Party rentals & decor","ic":"🎈","kw":"thuê rạp|thue rap|bàn ghế|ban ghe|trang trí|trang tri|bong bóng|backdrop"},{"id":"entertain","g":"event","vi":"Giải trí / vui chơi","en":"Entertainment & recreation","ic":"🎳","kw":"bida|billiard|bowling|game|khu vui chơi|trampoline|arcade|golf"},{"id":"daycare","g":"family","vi":"Giữ trẻ / daycare","en":"Daycare","ic":"🧸","kw":"giữ trẻ|giu tre|daycare|nhà trẻ|nha tre|mầm non|mam non|preschool"},{"id":"kids","g":"family","vi":"Đồ trẻ em / mẹ & bé","en":"Kids & baby","ic":"🍼","kw":"trẻ em|tre em|em bé|em be|mẹ và bé|me va be|baby|đồ chơi|do choi"},{"id":"pet","g":"family","vi":"Thú cưng / grooming","en":"Pets & grooming","ic":"🐶","kw":"thú cưng|thu cung|chó|cho\\b|mèo|meo\\b|pet|grooming|cắt lông"},{"id":"vet","g":"family","vi":"Thú y","en":"Veterinary","ic":"🐾","kw":"thú y|thu y|vet\\b|bác sĩ thú|chích ngừa chó"},{"id":"senior","g":"family","vi":"Nhà dưỡng lão / sinh hoạt người già","en":"Senior living & adult daycare","ic":"🏡","kw":"dưỡng lão|duong lao|adult daycare|sinh hoạt người già|nursing home"},{"id":"print","g":"biz","vi":"In ấn / bảng hiệu","en":"Printing & signage","ic":"🖨️","kw":"in ấn|in an|bảng hiệu|bang hieu|sign|banner|name card|menu in|tờ rơi"},{"id":"marketing","g":"biz","vi":"Marketing / web / thiết kế","en":"Marketing · web · design","ic":"💻","kw":"marketing|website|web|thiết kế|thiet ke|logo|quảng cáo|quang cao|seo|ads"},{"id":"software","g":"biz","vi":"POS / phần mềm","en":"POS & software","ic":"🧾","kw":"pos|phần mềm|phan mem|software|app|nexora|đặt lịch|booking"},{"id":"staffing","g":"biz","vi":"Tuyển dụng / nhân sự","en":"Staffing & HR","ic":"👥","kw":"tuyển|tuyen dung|nhân sự|nhan su|staffing|thợ|tho nail|việc làm|viec lam"},{"id":"lease","g":"biz","vi":"Sang tiệm / mặt bằng / thuê ghế","en":"Business for sale · lease · booth","ic":"🏬","kw":"sang tiệm|sang tiem|mặt bằng|mat bang|thuê ghế|thue ghe|booth rent|for lease|sang nhượng"},{"id":"commercialclean","g":"biz","vi":"Vệ sinh công nghiệp","en":"Commercial cleaning","ic":"🧼","kw":"vệ sinh công nghiệp|ve sinh cong nghiep|janitor|commercial clean|lau kính"},{"id":"telecom","g":"biz","vi":"Viễn thông / internet","en":"Telecom & internet","ic":"📡","kw":"internet|wifi|viễn thông|vien thong|sim|điện thoại gói|phone plan"},{"id":"techrepair","g":"biz","vi":"Sửa điện thoại / máy tính","en":"Phone & computer repair","ic":"🛠️","kw":"sửa điện thoại|sua dien thoai|sửa máy tính|sua may tinh|repair|thay màn hình|unlock"},{"id":"equipment","g":"biz","vi":"Thiết bị ngành (nhà hàng, tiệm)","en":"Commercial equipment","ic":"⚙️","kw":"thiết bị|thiet bi|equipment|máy pha|bếp công nghiệp|bep cong nghiep|tủ đông|ghế cắt tóc"},{"id":"temple","g":"community","vi":"Chùa / nhà thờ","en":"Temple & church","ic":"🛕","kw":"chùa|chua\\b|nhà thờ|nha tho|church|temple|lễ|le hoi"},{"id":"association","g":"community","vi":"Hội đoàn / cộng đồng","en":"Associations","ic":"🤝","kw":"hội|hoi doan|cộng đồng|cong dong|association|hội chợ|hoi cho"},{"id":"charity","g":"community","vi":"Từ thiện / gây quỹ","en":"Charity & fundraising","ic":"❤️","kw":"từ thiện|tu thien|gây quỹ|gay quy|charity|donate|quyên góp"},{"id":"media","g":"community","vi":"Báo chí / radio / truyền hình","en":"Media & press","ic":"📰","kw":"báo|bao chi|radio|truyền hình|truyen hinh|tv|podcast|youtube channel"}]};

const workspaceCouponCounts = {
  nail: 3, spa: 1, lash: 1, hair: 1, skin: 1,
  food: 2, drink: 1, bakery: 1,
  market: 1, supply: 4, fashion: 1,
  dental: 1, eye: 1, clinic: 1, pharm: 1,
  carwash: 2, mechanic: 1, ride: 1,
  clean: 1, remodel: 1, landscape: 1,
};

const workspaceCategories = couponTaxonomy.groups.map((group) => ({
  id: group.id,
  industry: `${group.ic} ${group.vi}`,
  items: couponTaxonomy.inds
    .filter((item) => item.g === group.id)
    .map((item) => [item.ic, item.vi, workspaceCouponCounts[item.id] || 0, item.id, `${item.vi} ${item.en} ${item.kw}`]),
}));

function workspaceCouponGroupChips(active = "beauty") {
  return couponTaxonomy.groups.map((group) => {
    const total = couponTaxonomy.inds.filter((item) => item.g === group.id).length;
    return `<button class="dw-chip ${group.id === active ? "active" : ""}" type="button" data-dw-group="directory-industry" data-dw-value="${group.id}">${group.ic} ${escapeHTML(group.vi)} <small>${total}</small></button>`;
  }).join("");
}

function communityOfferGuide() {
  const types = [
    ["🎟️", "Phiếu hỗ trợ", "Suất ăn, nhu yếu phẩm hoặc đồ dùng học tập"],
    ["🤲", "Miễn / giảm phí", "Khám sức khỏe, pháp lý, khai thuế hoặc lớp học"],
    ["🎫", "Vé sự kiện", "Hội chợ, lễ hội, văn nghệ và chương trình gây quỹ"],
    ["📅", "Đăng ký giữ chỗ", "Hội thảo, lớp cộng đồng hoặc hoạt động thiện nguyện"],
    ["💛", "Coupon tài trợ", "Doanh nghiệp tài trợ để người đủ điều kiện sử dụng"],
    ["🙋", "Thưởng tình nguyện", "Quyền lợi từ doanh nghiệp địa phương theo số giờ đóng góp"],
  ];
  return `<aside class="dw-community-guide"><div class="dw-community-guide-copy"><span class="dw-community-badge">COMMUNITY PASS</span><h3>Ưu đãi cộng đồng · không chỉ là mã giảm giá</h3><p>Chương trình cần ghi rõ đối tượng, số suất, thời hạn, điều kiện và nguồn tài trợ.</p></div><div class="dw-community-types">${types.map(([icon, title, copy]) => `<article><span>${icon}</span><div><strong>${title}</strong><small>${copy}</small></div></article>`).join("")}</div></aside>`;
}

function workspaceIndustryChips(active = "all", group = "industry") {
  return workspaceIndustries.map(([id, label, count]) => `<button class="dw-chip ${id === active ? "active" : ""}" type="button" data-dw-group="${group}" data-dw-value="${id}">${label}${count ? ` <small>${count}</small>` : ""}</button>`).join("");
}

function workspaceDealCard(deal, index = 0) {
  const offerClass = getOfferClassification(deal);
  const progress = offerClass.isCoupon ? Math.max(12, Math.min(88, (offerClass.inventory / 18) * 100)) : 100;
  return `<article class="dw-ticket ${offerClass.type}-offer" data-dw-deal-card data-search="${escapeHTML(`${deal.title} ${deal.salon} ${deal.category}`.toLocaleLowerCase("vi"))}">
    <div class="dw-ticket-art"><div><span>${index % 2 ? "✨" : "🏷️"}</span><strong>$${escapeHTML(deal.price)}</strong><small>${escapeHTML(deal.discount || "GIÁ ĐẶC BIỆT")}</small></div></div>
    <div class="dw-ticket-body">
      <h3>${escapeHTML(deal.title)}</h3>
      <a href="#" data-open="${escapeHTML(deal.id)}">${escapeHTML(deal.salon)}</a>
      <div class="dw-ticket-meta"><span>📍 ${escapeHTML(deal.distance)} mi</span><span>⏳ ${escapeHTML(deal.deadline)}</span><span>✓ Đã xác minh</span></div>
      ${offerClass.isCoupon ? `<div class="dw-progress" title="Còn ${offerClass.inventory} lượt"><i style="--progress:${progress}%"></i></div>` : '<div class="dw-unlimited">🏷️ Deal banner · Không giới hạn số lượng</div>'}
      <div class="dw-ticket-actions"><button class="dw-primary ${offerClass.isCoupon ? "red" : "green"}" type="button" data-open="${escapeHTML(deal.id)}">${offerClass.isCoupon ? "Lấy coupon" : "Xem deal"}</button><button class="dw-secondary" type="button" data-save="${escapeHTML(deal.id)}" aria-label="Lưu deal">♡</button></div>
    </div>
  </article>`;
}

function renderNearbyWorkspace() {
  const regularDeals = deals.filter((deal) => !deal.lastMinuteOnly).slice(0, 6);
  return `<div class="dw-shell">
    <section class="dw-card dw-panel">
      <div class="dw-heading"><div><span class="dw-kicker">NEXORA DEALS · BELLAIRE, HOUSTON</span><h1>🔥 Deal gần bạn</h1><p>Radar, bản đồ và kết quả theo ngành, bán kính và nhu cầu sử dụng.</p></div><span class="dw-live">● Dữ liệu đang cập nhật</span></div>
      <form class="dw-search" data-dw-nearby-search><label><span>⌕</span><input name="query" value="${escapeHTML(searchInput?.value || "")}" placeholder="Tìm deal: gel-x, pedicure, massage, máy hút bụi..." /></label><select name="sort" aria-label="Sắp xếp"><option value="near">Gần nhất</option><option value="ending">Sắp hết hạn</option><option value="inventory">Sắp hết lượt</option></select></form>
      <div class="dw-chip-row">${workspaceIndustryChips("all", "nearby-industry")}<button class="dw-chip dashed" type="button">+ 4 nhóm chưa có deal gần bạn</button></div>
      <div class="dw-chip-row"><span class="dw-filter-label">Bán kính:</span>${["1 mi", "5 mi", "10 mi", "25 mi", "+ Online"].map((label, index) => `<button class="dw-chip ${index === 2 ? "active" : ""}" type="button" data-dw-group="radius">${label}</button>`).join("")}</div>
    </section>
    <div class="dw-nearby-layout">
      <aside class="dw-card dw-panel"><div class="dw-radar"><div class="dw-radar-grid"></div><div class="dw-radar-sweep"></div><span class="dw-radar-center">Bạn</span>${[[23,42,"🍜"],[43,30,"💅"],[67,39,"🦷"],[75,66,"🧋"],[34,72,"🛍️"],[56,58,"✨"],[18,67,"🚗"],[66,24,"💆"]].map(([x,y,icon], i) => `<span class="dw-pin" style="left:${x}%;top:${y}%;background:${i % 2 ? "#6648ec" : "#0fa6b5"}">${icon}</span>`).join("")}<small>29 deal trong 10 mi · 30 ghim</small></div><div class="dw-radar-tabs"><button type="button">📡 Radar</button><button type="button">🗺️ Bản đồ thật</button></div><p style="margin:12px 0 0;color:#6b7890;font-size:13px">Bấm vào deal để xem điều kiện, lịch và cách sử dụng.</p></aside>
      <section class="dw-results">
        <div class="dw-opening-strip"><div class="dw-section-label"><strong>🎊 Sắp khai trương gần bạn</strong><button class="dw-secondary" type="button" data-dw-route="#openings">Xem tất cả ›</button></div><div class="dw-opening-cards"><article class="dw-opening-mini"><strong>còn 3 ngày</strong><b>🍜 Phở 24 Bellaire</b><span>Combo $9 · 1.1 mi</span></article><article class="dw-opening-mini"><strong>còn 9 ngày</strong><b>💅 Kayla Nails & Spa</b><span>Giảm 30% · 8.5 mi</span></article><article class="dw-opening-mini"><strong>còn 16 ngày</strong><b>🧋 Saigon Boba</b><span>Ly đầu $1 · 6.2 mi</span></article><article class="dw-opening-mini"><strong>còn 24 ngày</strong><b>🦷 Nha khoa Minh Tâm</b><span>Khám + cạo vôi $49</span></article></div></div>
        <div class="dw-section-label"><span data-dw-result-count>${regularDeals.length} deal · trong 10 mi</span></div><div class="dw-ticket-grid">${regularDeals.map(workspaceDealCard).join("")}</div>
      </section>
    </div>
  </div>`;
}

function renderCouponDirectoryWorkspace() {
  return `<div class="dw-shell"><section class="dw-card"><div class="dw-directory-head"><div class="dw-heading"><div><span class="dw-kicker">119 NGÀNH NGHỀ · 13 NHÓM NGÀNH TỪ FILE BA</span><h1>🏷️ Coupon theo ngành</h1><p>Chọn một nhóm ngành hoặc tìm xuyên toàn bộ danh mục Nexora.</p></div><span class="dw-directory-total">119 ngành</span></div><form class="dw-search" style="grid-template-columns:1fr" data-dw-directory-search><label><span>⌕</span><input type="search" placeholder="Tìm ngành, dịch vụ hoặc từ khoá — ví dụ: nha sĩ, sửa xe, khai thuế" /></label></form><div class="dw-chip-row dw-directory-groups">${workspaceCouponGroupChips("beauty")}</div><p class="dw-directory-status" data-dw-directory-status>13 ngành trong nhóm Làm đẹp & chăm sóc cá nhân</p></div><div class="dw-directory-grid">${workspaceCategories.map((group) => `<section class="dw-category-group" data-dw-category-group data-dw-group-id="${group.id}" ${group.id === "beauty" ? "" : "hidden"}><h2>${group.industry} <small>${group.items.length} ngành</small></h2>${group.id === "community" ? communityOfferGuide() : ""}<div class="dw-category-cards">${group.items.map(([icon, name, count, id, search]) => `<button class="dw-category-card" type="button" data-dw-category="${escapeHTML(name)}" data-dw-industry-id="${id}" data-has-coupon="${count > 0}" data-search="${escapeHTML(search.toLocaleLowerCase("vi"))}"><span>${icon}</span><strong>${escapeHTML(name)}</strong><small>${count > 0 ? `${count} coupon đang chạy` : "Chưa có coupon · theo dõi"}</small></button>`).join("")}</div></section>`).join("")}<div class="dw-category-empty" data-dw-category-empty hidden>Chưa tìm thấy ngành hoặc dịch vụ phù hợp trong 119 ngành.</div></div></section></div>`;
}

function filterCouponDirectory(selectedGroup, rawQuery = "") {
  if (!dealWorkspace) return;
  const query = rawQuery.trim().toLocaleLowerCase("vi");
  const activeChip = dealWorkspace.querySelector('[data-dw-group="directory-industry"].active');
  const groupId = selectedGroup || activeChip?.dataset.dwValue || "beauty";
  let visibleCards = 0;

  dealWorkspace.querySelectorAll("[data-dw-category-group]").forEach((group) => {
    let groupVisibleCards = 0;
    group.querySelectorAll("[data-dw-category]").forEach((card) => {
      const matches = !query || card.dataset.search.includes(query);
      card.hidden = !matches;
      if (matches) groupVisibleCards += 1;
    });
    group.hidden = query ? groupVisibleCards === 0 : group.dataset.dwGroupId !== groupId;
    if (!group.hidden) visibleCards += groupVisibleCards;
  });

  const empty = dealWorkspace.querySelector("[data-dw-category-empty]");
  if (empty) empty.hidden = visibleCards > 0;
  const status = dealWorkspace.querySelector("[data-dw-directory-status]");
  if (status) {
    const group = couponTaxonomy.groups.find((item) => item.id === groupId);
    status.textContent = query
      ? `${visibleCards} ngành khớp “${rawQuery.trim()}” trong toàn bộ 119 ngành`
      : `${visibleCards} ngành trong nhóm ${group?.vi || "đã chọn"}`;
  }
}

function renderDealMatchWorkspace(query = "", areas = ["Bellaire, Houston", "Katy", "Sugar Land"]) {
  const selectedAreas = areas.length ? areas : ["Bellaire, Houston"];
  const areaSummary = selectedAreas.slice(0, 3).join(" · ") + (selectedAreas.length > 3 ? ` +${selectedAreas.length - 3} nơi` : "");
  const suggestions = ["Bellaire, Houston", "Katy, Texas", "Sugar Land, Texas", "Pearland, Texas", "Cypress, Texas", "The Woodlands, Texas", "Garden Grove, California", "Westminster, California", "San Jose, California", "TP. Hồ Chí Minh, Việt Nam", "Hà Nội, Việt Nam"];
  return `<div class="dw-match-layout"><section class="dw-card dw-match-box"><div class="dw-heading"><div><span class="dw-kicker">NÓI NHU CẦU · TÌM ĐỒNG THỜI NHIỀU KHU VỰC</span><h1>✦ Deal Match</h1><p>Gõ một câu, chọn nhiều nơi cần tìm. Nexora ghép deal phù hợp trên tất cả khu vực đã chọn.</p></div><span class="dw-area-count" data-dw-area-count>${selectedAreas.length} khu vực</span></div><form data-dw-match-form><div class="dw-match-input"><input name="need" value="${escapeHTML(query)}" placeholder="VD: gel-x dưới $40 cuối tuần" /><button type="submit" aria-label="Tìm bằng nhu cầu">🎤</button></div><div class="dw-chip-row">${["🦶 Pedicure < $35","✨ Gel-X cuối tuần","💆 Massage < $60","👁️ Nối mi","💇 Cắt tóc","🍜 Ăn trưa","📦 Supply","🧽 Rửa xe","🦷 Nha sĩ","🚕 Sân bay"].map((label) => `<button class="dw-chip" type="button" data-dw-match-suggestion="${escapeHTML(label.replace(/^[^ ]+ /, ""))}">${label}</button>`).join("")}</div><div class="dw-match-section"><strong>NGÀNH</strong><div class="dw-chip-row">${workspaceIndustryChips("all", "match-industry")}</div></div><div class="dw-match-section"><strong>KHU VỰC TÌM KIẾM</strong><div class="dw-chip-row"><button class="dw-chip" type="button" data-dw-group="match-location">📍 Gần tôi</button><button class="dw-chip active" type="button" data-dw-group="match-location">🗺️ Nhiều khu vực</button><button class="dw-chip" type="button" data-dw-group="match-location">🌐 Online</button></div><div class="dw-area-picker"><label><span>⌕</span><input type="text" list="dw-area-suggestions" data-dw-area-input placeholder="Nhập thành phố, ZIP code hoặc khu vực" /></label><datalist id="dw-area-suggestions">${suggestions.map((area) => `<option value="${escapeHTML(area)}"></option>`).join("")}</datalist><button class="dw-secondary" type="button" data-dw-add-area>Thêm khu vực</button></div><div class="dw-selected-areas" data-dw-selected-areas>${selectedAreas.map((area) => `<button class="dw-area-tag" type="button" data-dw-remove-area="${escapeHTML(area)}"><span>📍 ${escapeHTML(area)}</span><b aria-hidden="true">×</b></button>`).join("")}</div><input type="hidden" name="areas" value="${escapeHTML(selectedAreas.join("|"))}" /><p class="dw-area-help" data-dw-area-help>Đang tìm đồng thời ${selectedAreas.length} khu vực · có thể thêm thành phố, ZIP code hoặc khu vực khác.</p></div></form></section><section class="dw-card dw-match-results" data-dw-match-results><div class="dw-heading"><div><h2>${query ? `Kết quả cho “${escapeHTML(query)}”` : "Deal khớp nhiều khu vực"}</h2><p>Đang so khớp tại ${escapeHTML(areaSummary)}.</p></div></div>${deals.filter((deal) => !deal.lastMinuteOnly).slice(0, 2).map((deal) => `<article class="dw-match-result"><div class="dw-price-block">$${deal.price}</div><div><h3>${escapeHTML(deal.title)}</h3><p>${escapeHTML(deal.salon)} · 📍 ${deal.distance} mi · ⏳ ${escapeHTML(deal.deadline)}</p></div><button class="dw-primary" type="button" data-open="${escapeHTML(deal.id)}">Xem deal</button></article>`).join("")}<button class="dw-secondary" style="margin-top:14px" type="button" data-dw-save-wish>Không đúng? Đăng mong muốn</button></section><section class="dw-card dw-panel"><div class="dw-heading"><div><h2>Mong muốn của tôi</h2><p data-dw-wish-copy>Chưa có. Gõ một câu ở trên rồi bấm “Đăng mong muốn”.</p></div></div></section></div>`;
}

function syncDealMatchAreas() {
  if (!dealWorkspace) return [];
  const areas = [...dealWorkspace.querySelectorAll("[data-dw-remove-area]")].map((button) => button.dataset.dwRemoveArea);
  const hidden = dealWorkspace.querySelector('[data-dw-match-form] input[name="areas"]');
  if (hidden) hidden.value = areas.join("|");
  const count = dealWorkspace.querySelector("[data-dw-area-count]");
  if (count) count.textContent = `${areas.length} khu vực`;
  const help = dealWorkspace.querySelector("[data-dw-area-help]");
  if (help) help.textContent = `Đang tìm đồng thời ${areas.length} khu vực · có thể thêm thành phố, ZIP code hoặc khu vực khác.`;
  return areas;
}

function renderOpeningsWorkspace() {
  const rows = [
    ["#ff9700", "🍜", "còn 3 ngày", "Phở 24 Bellaire", "1.1 mi · Bellaire · 128 đã đăng ký", "Combo $9 · 100 suất đầu", "Giảm 15% cả bàn", "pho-bellaire"],
    ["#ee2756", "💅", "còn 9 ngày", "Kayla Nails & Spa · Katy", "8.5 mi · Katy · 47 đã đăng ký", "Giảm 30% mọi dịch vụ · 50 suất đầu", "Giảm 20% tuần khai trương", "kayla-nails"],
    ["#11b986", "🧋", "còn 16 ngày", "Saigon Boba Sugar Land", "6.2 mi · Sugar Land · 64 đã đăng ký", "Ly đầu $1 · 200 suất", "Mua 1 tặng 1", "saigon-boba"],
    ["#1994ed", "🦷", "còn 24 ngày", "Nha khoa Minh Tâm", "2.4 mi · Bellaire · 19 đã đăng ký", "Khám + cạo vôi $49 · 40 suất", "Tẩy trắng giảm 20%", "pho-bellaire"],
  ];
  return `<div class="dw-shell"><section class="dw-card dw-opening-page"><div class="dw-heading"><div><span class="dw-kicker">SỰ KIỆN ĐỊA PHƯƠNG · GIỮ CHỖ BẰNG SĐT</span><h1>🎊 Sắp khai trương gần bạn</h1><p>Tiệm mới trong bán kính — đăng ký sớm để giữ deal Người sáng lập có số lượng giới hạn.</p></div></div><div class="dw-chip-row">${["Tất cả","Tuần này","Tháng này","Vừa khai trương (30 ngày)"].map((label, i) => `<button class="dw-chip ${i === 0 ? "active" : ""}" type="button" data-dw-group="opening-window">${label}</button>`).join("")}</div><div class="dw-opening-list">${rows.map(([color,icon,time,name,meta,founder,week,id]) => `<article class="dw-opening-row" style="--accent:${color}"><div class="dw-opening-icon">${icon}</div><div class="dw-opening-copy"><span>⏳ <b>${time}</b></span><h3>${name}</h3><p>📍 ${meta}</p><div class="dw-opening-offer"><p>⭐ <b>Người sáng lập:</b> ${founder}</p><p>🎊 <b>Tuần khai trương:</b> ${week}</p></div><div class="dw-opening-actions"><button class="dw-primary red" type="button" data-opening-hold="${id}">🙋 Đăng ký sớm · giữ chỗ</button><button class="dw-secondary" type="button">📨 Rủ bạn</button><button class="dw-secondary" type="button">🗺️ Chỉ đường</button></div></div></article>`).join("")}</div></section></div>`;
}

function renderLastMinuteWorkspace() {
  const lastDeals = deals.filter((deal) => deal.lastMinuteOnly).slice(0, 5);
  return `<div class="dw-shell"><section class="dw-card"><header class="dw-lm-head"><div class="dw-lm-title"><span class="dw-lm-bolt">⚡</span><div><h1>Last Minute · giờ trống hôm nay</h1><p>Bán giờ trống cụ thể từ Booking, không phải mã giảm giá.</p></div></div><span class="dw-live">◷ Giờ địa phương</span><div class="dw-role-tabs"><button class="active" type="button" data-dw-lm-role="customer">🙋 Khách</button><button type="button" data-dw-lm-role="owner">🏪 Chủ tiệm</button><button type="button" data-dw-route="#my-open-slots">✂️ Thợ · cá nhân</button><button type="button" data-dw-lm-role="checkin">📲 Check-in</button><button type="button" data-dw-lm-role="rules">📐 Quy tắc & dữ liệu</button></div></header></section><div class="dw-lm-body"><section><div class="dw-phone"><div class="dw-phone-address">🔒 nexora.deals/last-minute?near=bellaire</div><div class="dw-phone-banner"><h2>⚡ Last minute hôm nay</h2><p>Giờ trống gần bạn · đặt ngay bằng SĐT · giá chỉ cho đúng giờ đó</p></div><div class="dw-chip-row">${["Tất cả","Trong 2 giờ","Chiều nay","Tối nay"].map((label, i) => `<button class="dw-chip ${i === 0 ? "active" : ""}" type="button" data-dw-group="lm-window">${label}</button>`).join("")}</div><div class="dw-slot-list">${lastDeals.map((deal, i) => `<article class="dw-slot-card"><div class="dw-slot-time">${["1:00 PM","1:30 PM","2:15 PM","5:30 PM","7:00 PM"][i]}<br><small>còn ${20 + i * 8}p</small></div><div><h3>${escapeHTML(deal.salon)} · ${escapeHTML(deal.title)}</h3><p>📍 ${deal.distance} mi · đóng bán trước giờ hẹn 15 phút</p></div><div class="dw-slot-price"><del>$${deal.original}</del><strong>$${deal.price}</strong><button class="dw-primary coral" type="button" data-open="${escapeHTML(deal.id)}">Đặt giờ này</button></div></article>`).join("")}</div></div></section><aside class="dw-explain" data-dw-lm-explain><section class="dw-card dw-explain-card"><h2>Khác gì Coupon và Chương trình?</h2><table class="dw-compare"><thead><tr><th></th><th>Chương trình</th><th>Coupon</th><th>⚡ Last Minute</th></tr></thead><tbody><tr><th>Bán cái gì</th><td>Mức giảm tự động</td><td>Mã giảm lấy trước</td><td><b>Một giờ trống cụ thể</b></td></tr><tr><th>Khách làm gì</th><td>Không cần làm gì</td><td>Lấy mã bằng SĐT</td><td><b>Đặt giờ đó ngay</b></td></tr><tr><th>Hết khi nào</th><td>Tới ngày kết thúc</td><td>Hết suất hoặc hết hạn</td><td><b>Khi giờ được đặt hoặc tới giờ</b></td></tr><tr><th>Cần Booking?</th><td>Không</td><td>Không</td><td><b>Bắt buộc</b></td></tr></tbody></table></section><section class="dw-card dw-explain-card"><h2>Luồng của khách</h2><div class="dw-flow">${[["1 · Thấy","Community, OneQR hoặc SMS"],["2 · Chọn giờ","Giờ + thợ + dịch vụ"],["3 · Nhập SĐT","Giữ chỗ tạm thời"],["4 · Xác nhận","SMS có giờ, giá, địa chỉ"],["5 · Tới tiệm","Check-in bằng SĐT"],["6 · Tính tiền","POS áp đúng giá"]].map(([a,b]) => `<article><strong>${a}</strong><p>${b}</p></article>`).join("")}</div></section></aside></div></div>`;
}

function renderOpenSlotsWorkspace(role = localStorage.getItem("nexora-worker-role") || "chair") {
  const roles = {
    freelance: {
      label: "🚗 Làm tự do",
      profile: "Thợ tự do · tự quản lý lịch",
      info: "Bạn sở hữu lịch và tự mở bán. Khách đặt bằng SĐT; địa điểm có thể là studio, tại nhà khách hoặc khu vực bạn nhận di chuyển.",
      scheduleCopy: "Bấm giờ trống để mở bán trực tiếp trên Last Minute.",
      openLabel: "Trống · mở bán trực tiếp ⚡",
      sellingLabel: "⚡ Đang bán trực tiếp $48 · bấm để thu hồi",
      helpTitle: "Hành động của người làm tự do",
      helpCopy: "Tự chọn khu vực phục vụ, giá Last Minute và cách nhận tiền. Booking thuộc về bạn và không cần tiệm duyệt.",
      warning: "Lịch cá nhân phải là nguồn thật. Khi khách đặt, Nexora khoá giờ và gửi SMS cho cả hai bên.",
      metrics: [["Lịch thuộc về", "Bạn"], ["Giá do", "Bạn đặt"], ["Booking vào", "NEXORA ID"], ["Tiền về", "VlinkPay của bạn"]],
      actions: [["area", "📍 Khu vực & phí di chuyển", "Bellaire + 8 mi"], ["calendar", "📅 Kết nối lịch cá nhân", "Đang đồng bộ"], ["payout", "💳 Tài khoản nhận tiền", "VlinkPay · ••4821"]],
      bulk: "Mở tất cả giờ trống đủ điều kiện",
    },
    chair: {
      label: "🪑 Thuê ghế",
      profile: "Thợ thuê ghế · Bella Salon",
      info: "Giờ của bạn là của bạn — tự mở bán. Bella Salon cho phép lịch xuất hiện trên máy check-in và hỗ trợ xác nhận khi khách đến.",
      scheduleCopy: "Bấm giờ trống để mở bán tại ghế Bella Salon.",
      openLabel: "Trống · mở bán tại Bella Salon ⚡",
      sellingLabel: "⚡ Đang bán $48 tại Bella Salon · bấm để thu hồi",
      helpTitle: "Hành động của thợ thuê ghế",
      helpCopy: "Bạn đặt giá và sở hữu booking. Tiệm cung cấp địa điểm, máy check-in và có thể nhận phần chia sẻ theo thỏa thuận thuê ghế.",
      warning: "Bella Salon phải bật “Chấp nhận Last Minute của thợ thuê ghế”. Một giờ chỉ được mở bán ở một lịch.",
      metrics: [["Lịch thuộc về", "Bạn"], ["Giá do", "Bạn đặt"], ["Check-in tại", "Bella Salon"], ["Tiền về", "Bạn · chia ghế nếu có"]],
      actions: [["chair-location", "🪑 Ghế & địa điểm", "Bella Salon · Ghế 06"], ["salon-checkin", "📲 Check-in của tiệm", "Đã cho phép"], ["chair-split", "💵 Chia sẻ với tiệm", "10% dịch vụ"]],
      bulk: "Đồng bộ và mở các giờ trống tại Bella Salon",
    },
    employee: {
      label: "🧑‍💼 Nhân viên tiệm",
      profile: "Nhân viên · Bella Salon",
      info: "Tiệm sở hữu lịch, dịch vụ và giá. Bạn chọn giờ muốn lấp; quản lý duyệt trước khi Nexora đưa lên Last Minute.",
      scheduleCopy: "Bấm giờ trống để gửi đề xuất cho quản lý tiệm.",
      openLabel: "Trống · gửi tiệm duyệt ⚡",
      sellingLabel: "⚡ Tiệm đang bán $48 · xem trạng thái",
      helpTitle: "Hành động của nhân viên tiệm",
      helpCopy: "Bạn không tự thay giá của tiệm. Hệ thống ghi đúng thợ thực hiện, commission và booking vào POS của Bella Salon.",
      warning: "Giờ chỉ xuất hiện công khai sau khi quản lý duyệt. Tiền vào tiệm; commission được tính theo hồ sơ nhân viên.",
      metrics: [["Lịch thuộc về", "Bella Salon"], ["Giá do", "Quản lý đặt"], ["Booking vào", "POS của tiệm"], ["Bạn nhận", "Commission 45%"]],
      actions: [["assigned-service", "✂️ Dịch vụ được giao", "Nail · Gel-X · Dip"], ["manager", "✅ Người duyệt", "Kayla · Chủ tiệm"], ["commission", "💰 Commission", "45% + tip"]],
      bulk: "Gửi tất cả giờ trống để tiệm duyệt",
    },
  };
  const activeRole = roles[role] ? role : "chair";
  const config = roles[activeRole];
  const times = [["12:00 PM","past","Đã qua"],["12:30 PM","past","Đã qua"],["1:00 PM","busy","Có lịch"],["1:30 PM","busy","Có lịch"],["2:00 PM","open",config.openLabel],["2:30 PM","booked","✓ Khách đặt qua ⚡"],["3:00 PM","selling",config.sellingLabel],["3:30 PM","open",config.openLabel],["4:00 PM","busy","Có lịch"],["4:30 PM","open",config.openLabel],["5:00 PM","open",config.openLabel]];
  return `<div class="dw-slots-layout" data-dw-worker-workspace="${activeRole}">
    <section class="dw-card dw-profile-card">
      <div class="dw-profile-row"><div class="dw-profile"><span>J</span><div><strong>Jessica Nguyen</strong><small>${config.profile}</small></div></div><div class="dw-role-tabs" aria-label="Chọn hình thức làm việc">${Object.entries(roles).map(([id, item]) => `<button class="${id === activeRole ? "active" : ""}" type="button" data-dw-worker-role="${id}" aria-pressed="${id === activeRole}">${item.label}</button>`).join("")}</div></div>
      <div class="dw-info-strip"><b>${config.label}:</b> ${config.info}</div>
      <div class="dw-ownership-grid">${config.metrics.map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join("")}</div>
    </section>
    <section class="dw-card dw-schedule"><div class="dw-heading"><div><h2>Giờ của tôi hôm nay</h2><p>${config.scheduleCopy}</p></div><span class="dw-role-badge">${config.label}</span></div><div class="dw-time-rows">${times.map(([time,status,label]) => `<div class="dw-time-row"><b>${time}</b><button class="dw-time-status ${status}" type="button" data-dw-slot data-dw-slot-state="${status}" data-dw-worker-slot-role="${activeRole}">${label}</button></div>`).join("")}</div><button class="dw-primary dw-bulk-action" type="button" data-dw-bulk-open="${activeRole}">${config.bulk}</button></section>
    <aside class="dw-card dw-slot-help"><h2>${config.helpTitle}</h2><p>${config.helpCopy}</p><div class="dw-role-actions">${config.actions.map(([id,title,value]) => `<button type="button" data-dw-role-action="${id}"><span><b>${title}</b><small>${value}</small></span><em>Thiết lập ›</em></button>`).join("")}</div><div class="dw-warning">⚠️ ${config.warning}</div><button class="dw-secondary dw-signin-action" type="button" data-dw-signin>Đăng nhập NEXORA ID để đồng bộ thật</button></aside>
  </div>`;
}

function renderDealWorkspace(route) {
  if (!dealWorkspace) return;
  const renderers = {
    "#nearby": renderNearbyWorkspace,
    "#coupons": renderCouponDirectoryWorkspace,
    "#requests": () => {
      const params = new URLSearchParams(location.search);
      const areas = (params.get("areas") || "").split("|").filter(Boolean);
      return renderDealMatchWorkspace(params.get("q") || "", areas.length ? areas : undefined);
    },
    "#openings": renderOpeningsWorkspace,
    "#last-minute": renderLastMinuteWorkspace,
    "#my-open-slots": renderOpenSlotsWorkspace,
  };
  const render = renderers[route];
  if (!render) return;
  document.body.classList.add("deal-workspace-mode");
  dealWorkspace.hidden = false;
  dealWorkspace.innerHTML = render();
  setActiveNavigation("#coupons");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeDealWorkspace() {
  document.body.classList.remove("deal-workspace-mode");
  if (dealWorkspace) {
    dealWorkspace.hidden = true;
    dealWorkspace.innerHTML = "";
  }
}

dealWorkspace?.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    event.preventDefault();
    openDeal(openButton.dataset.open, trafficSource);
    return;
  }
  const saveButton = event.target.closest("[data-save]");
  if (saveButton) {
    event.preventDefault();
    toggleSaved(saveButton.dataset.save);
    return;
  }
  const routeButton = event.target.closest("[data-dw-route]");
  if (routeButton) {
    const route = routeButton.dataset.dwRoute;
    const next = new URL(location.href);
    next.hash = route;
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    handleRoute(route);
    return;
  }
  const chip = event.target.closest("[data-dw-group]");
  if (chip) {
    chip.parentElement?.querySelectorAll(`[data-dw-group="${chip.dataset.dwGroup}"]`).forEach((item) => item.classList.toggle("active", item === chip));
    if (chip.dataset.dwGroup === "directory-industry") {
      const input = dealWorkspace.querySelector("[data-dw-directory-search] input");
      if (input) input.value = "";
      filterCouponDirectory(chip.dataset.dwValue, "");
      return;
    }
  }
  const category = event.target.closest("[data-dw-category]");
  if (category) {
    const next = new URL(location.href);
    next.searchParams.set("q", category.dataset.dwCategory);
    next.hash = "#nearby";
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    if (searchInput) searchInput.value = category.dataset.dwCategory;
    handleRoute("#nearby");
    return;
  }
  const suggestion = event.target.closest("[data-dw-match-suggestion]");
  if (suggestion) {
    const input = dealWorkspace.querySelector('[data-dw-match-form] input[name="need"]');
    if (input) { input.value = suggestion.dataset.dwMatchSuggestion; input.focus(); }
    return;
  }
  const addArea = event.target.closest("[data-dw-add-area]");
  if (addArea) {
    const input = dealWorkspace.querySelector("[data-dw-area-input]");
    const area = input?.value.trim();
    if (!area) { input?.focus(); showToast("Nhập thành phố, ZIP code hoặc khu vực cần thêm."); return; }
    const current = syncDealMatchAreas();
    if (current.some((item) => item.toLocaleLowerCase("vi") === area.toLocaleLowerCase("vi"))) {
      showToast("Khu vực này đã có trong danh sách.");
      return;
    }
    if (current.length >= 10) { showToast("Có thể tìm tối đa 10 khu vực cùng lúc."); return; }
    const button = document.createElement("button");
    button.className = "dw-area-tag";
    button.type = "button";
    button.dataset.dwRemoveArea = area;
    button.innerHTML = `<span>📍 ${escapeHTML(area)}</span><b aria-hidden="true">×</b>`;
    dealWorkspace.querySelector("[data-dw-selected-areas]")?.append(button);
    if (input) input.value = "";
    syncDealMatchAreas();
    showToast(`Đã thêm ${area} vào Deal Match.`);
    return;
  }
  const removeArea = event.target.closest("[data-dw-remove-area]");
  if (removeArea) {
    const current = syncDealMatchAreas();
    if (current.length <= 1) { showToast("Deal Match cần giữ lại ít nhất một khu vực."); return; }
    removeArea.remove();
    syncDealMatchAreas();
    return;
  }
  const wish = event.target.closest("[data-dw-save-wish]");
  if (wish) {
    const input = dealWorkspace.querySelector('[data-dw-match-form] input[name="need"]');
    const value = input?.value.trim();
    if (!value) { input?.focus(); showToast("Hãy gõ nhu cầu trước khi đăng mong muốn."); return; }
    const copy = dealWorkspace.querySelector("[data-dw-wish-copy]");
    if (copy) copy.textContent = `Đang theo dõi: “${value}”. Nexora sẽ báo khi có deal phù hợp.`;
    showToast("Đã lưu mong muốn vào NEXORA ID trên thiết bị này.");
    return;
  }
  const workerRole = event.target.closest("[data-dw-worker-role]");
  if (workerRole) {
    const role = workerRole.dataset.dwWorkerRole;
    localStorage.setItem("nexora-worker-role", role);
    dealWorkspace.innerHTML = renderOpenSlotsWorkspace(role);
    const roleNames = { freelance: "Làm tự do", chair: "Thuê ghế", employee: "Nhân viên tiệm" };
    showToast(`Đã chuyển sang chế độ ${roleNames[role]}. Quyền lịch, giá và tiền đã được cập nhật.`);
    return;
  }
  const roleAction = event.target.closest("[data-dw-role-action]");
  if (roleAction) {
    roleAction.classList.toggle("configured");
    const status = roleAction.querySelector("em");
    if (status) status.textContent = roleAction.classList.contains("configured") ? "Đã cập nhật ✓" : "Thiết lập ›";
    showToast("Đã cập nhật thiết lập cho hình thức làm việc này.");
    return;
  }
  const bulkOpen = event.target.closest("[data-dw-bulk-open]");
  if (bulkOpen) {
    const role = bulkOpen.dataset.dwBulkOpen;
    const targetState = role === "employee" ? "pending" : "selling";
    const labels = {
      freelance: "⚡ Đang bán trực tiếp $48 · bấm để thu hồi",
      chair: "⚡ Đang bán $48 tại Bella Salon · bấm để thu hồi",
      employee: "⏳ Đã gửi quản lý duyệt · bấm để huỷ",
    };
    dealWorkspace.querySelectorAll('[data-dw-slot-state="open"]').forEach((button) => {
      button.dataset.dwSlotState = targetState;
      button.className = `dw-time-status ${targetState}`;
      button.textContent = labels[role];
    });
    showToast(role === "employee" ? "Đã gửi các giờ trống cho quản lý Bella Salon duyệt." : "Đã mở các giờ trống đủ điều kiện trên Last Minute.");
    return;
  }
  const slot = event.target.closest("[data-dw-slot]");
  if (slot && ["open", "selling", "pending"].includes(slot.dataset.dwSlotState)) {
    const role = slot.dataset.dwWorkerSlotRole || "chair";
    const current = slot.dataset.dwSlotState;
    const openLabels = { freelance: "Trống · mở bán trực tiếp ⚡", chair: "Trống · mở bán tại Bella Salon ⚡", employee: "Trống · gửi tiệm duyệt ⚡" };
    const sellingLabels = { freelance: "⚡ Đang bán trực tiếp $48 · bấm để thu hồi", chair: "⚡ Đang bán $48 tại Bella Salon · bấm để thu hồi" };
    if (current === "selling" || current === "pending") {
      slot.dataset.dwSlotState = "open";
      slot.className = "dw-time-status open";
      slot.textContent = openLabels[role];
      showToast(current === "pending" ? "Đã huỷ đề xuất gửi quản lý." : "Đã thu hồi giờ trống khỏi Last Minute.");
      return;
    }
    if (role === "employee") {
      slot.dataset.dwSlotState = "pending";
      slot.className = "dw-time-status pending";
      slot.textContent = "⏳ Đã gửi quản lý duyệt · bấm để huỷ";
      showToast("Đã gửi giờ trống cho quản lý Bella Salon duyệt.");
      return;
    }
    slot.dataset.dwSlotState = "selling";
    slot.className = "dw-time-status selling";
    slot.textContent = sellingLabels[role];
    showToast(role === "freelance" ? "Đã mở bán trực tiếp. Booking và thanh toán sẽ vào NEXORA ID của bạn." : "Đã mở bán tại Bella Salon và đồng bộ máy check-in.");
    return;
  }
  if (event.target.closest("[data-dw-signin]")) {
    location.assign(buildNexoraAuthUrl("login"));
    return;
  }
  const role = event.target.closest("[data-dw-lm-role]");
  if (role) {
    const selected = role.dataset.dwLmRole;
    if (selected === "owner") showToast("Chủ tiệm tạo giờ trống từ Booking/POS; deal tự xuất hiện tại đây.");
    if (selected === "checkin") showToast("Check-in bằng SĐT sẽ tìm đúng lịch và giá Last Minute.");
    if (selected === "rules") showToast("Quy tắc: chỉ bán giờ thật, tự dừng khi có booking hoặc tới giờ đóng bán.");
    role.parentElement?.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button === role));
  }
});

dealWorkspace?.addEventListener("input", (event) => {
  if (event.target.closest("[data-dw-directory-search]")) {
    filterCouponDirectory(null, event.target.value);
  }
});

dealWorkspace?.addEventListener("submit", (event) => {
  if (event.target.matches("[data-dw-nearby-search]")) {
    event.preventDefault();
    const query = new FormData(event.target).get("query").trim().toLocaleLowerCase("vi");
    let count = 0;
    dealWorkspace.querySelectorAll("[data-dw-deal-card]").forEach((card) => {
      card.hidden = Boolean(query) && !card.dataset.search.includes(query);
      if (!card.hidden) count += 1;
    });
    const label = dealWorkspace.querySelector("[data-dw-result-count]");
    if (label) label.textContent = `${count} deal khớp “${query || "tất cả"}” · trong 10 mi`;
    return;
  }
  if (event.target.matches("[data-dw-match-form]")) {
    event.preventDefault();
    const value = new FormData(event.target).get("need").trim();
    if (!value) return;
    const next = new URL(location.href);
    next.searchParams.set("q", value);
    const areas = (new FormData(event.target).get("areas") || "").split("|").filter(Boolean);
    if (areas.length) next.searchParams.set("areas", areas.join("|"));
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    dealWorkspace.innerHTML = renderDealMatchWorkspace(value, areas);
    showToast(`Đã ghép nhu cầu tại ${areas.length} khu vực.`);
  }
});

function handleRoute(hash) {
  const route = hash || "#discover";
  setActiveDealSubnav(route);
  if (DEAL_WORKSPACE_ROUTES.has(route)) {
    state.savedOnly = false;
    renderDealWorkspace(route);
    emitNexoraFunctionEvent("open_function", { function: route.slice(1) });
    return;
  }
  closeDealWorkspace();
  if (route === "#openings") {
    state.savedOnly = false;
    setActiveNavigation("#coupons");
    document.querySelector("#openings").scrollIntoView({ behavior: "smooth", block: "start" });
    emitNexoraFunctionEvent("open_function", { function: "openings" });
    return;
  }
  if (route === "#coupon-wallet") {
    const next = new URL(location.href);
    next.hash = "#coupons";
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    handleRoute("#coupons");
    return;
  }
  if (route === "#my-open-slots") {
    state.savedOnly = false;
    setActiveNavigation(route);
    lastMinuteWindow = "all";
    lastMinuteIndustry = "beauty";
    applyLastMinuteFilters();
    document.querySelector("#last-minute").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Giờ trống của tôi là mục cá nhân; đăng nhập NEXORA ID để đăng và quản lý slot trống.");
    emitNexoraFunctionEvent("open_function", { function: "my-open-slots", auth_required: true });
    return;
  }
  if (route === "#oneqr") {
    openOneQR();
    emitNexoraFunctionEvent("open_function", { function: "oneqr" });
    return;
  }
  if (route === "#last-minute") {
    state.savedOnly = false;
    setActiveNavigation(route);
    lastMinuteWindow = "all";
    lastMinuteIndustry = "all";
    applyLastMinuteFilters();
    document.querySelector("#last-minute").scrollIntoView({ behavior: "smooth", block: "start" });
    emitNexoraFunctionEvent("open_function", { function: "last-minute" });
    return;
  }
  if (route === "#coupons") {
    state.savedOnly = false;
    setActiveNavigation(route);
    renderCoupons();
    document.querySelector("#coupons").scrollIntoView({ behavior: "smooth", block: "start" });
    emitNexoraFunctionEvent("open_function", { function: "coupons" });
    return;
  }
  if (route === "#nearby") {
    setActiveNavigation(route);
    openMapDialog();
    emitNexoraFunctionEvent("open_function", { function: "nearby" });
    return;
  }
  if (route === "#requests") {
    setActiveNavigation(route);
    openRequestDialog();
    emitNexoraFunctionEvent("open_function", { function: "deal-match" });
    return;
  }
  if (route === "#wishlist") {
    state.savedOnly = true;
    setActiveNavigation(route);
    renderDeals();
    document.querySelector(".results-heading").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (route === "#categories") {
    state.savedOnly = false;
    setActiveNavigation(route);
    renderDeals();
    document.querySelector("#categories").scrollIntoView({ behavior: "smooth", block: "start" });
    emitNexoraFunctionEvent("open_function", { function: "categories" });
    return;
  }
  state.savedOnly = false;
  setActiveNavigation("#discover");
  renderDeals();
}

document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.savedOnly = false;
  syncLocationLabels();
  renderDeals();
  syncSearchUrl();
  emitNexoraFunctionEvent("deal_search", {
    query: searchInput.value.trim(),
    location: locationInput.value.trim(),
    radius: state.maxDistance,
    service: state.activeCategory,
  });
  document.querySelector(".results-heading").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#communityHandoffEdit")?.addEventListener("click", () => {
  document.querySelector("#searchForm").scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => searchInput.focus(), 420);
});

document.querySelector("[data-discover-search]")?.addEventListener("click", () => {
  document.querySelector("#searchForm").scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => searchInput.focus(), 420);
  emitNexoraFunctionEvent("discover_action", { action: "search_deals", source: trafficSource });
});

document.querySelector("[data-discover-why]")?.addEventListener("click", () => {
  showToast("Nexora xếp hạng theo vị trí, nhu cầu và ngữ cảnh OneQR. Vị trí trả phí luôn có nhãn ‘Được tài trợ’.");
  emitNexoraFunctionEvent("discover_transparency", { source: trafficSource });
});

document.querySelectorAll("[data-last-window]").forEach((button) => {
  button.addEventListener("click", () => filterLastMinute(button.dataset.lastWindow));
});
document.querySelectorAll("[data-last-industry]").forEach((button) => {
  button.addEventListener("click", () => filterLastMinuteIndustry(button.dataset.lastIndustry));
});
document.querySelectorAll("[data-coupon-filter]").forEach((button) => {
  button.addEventListener("click", () => selectCouponFilter(button.dataset.couponFilter));
});
document.querySelectorAll("[data-coupon-save]").forEach((button) => {
  button.addEventListener("click", () => toggleCouponSave(button.dataset.couponSave));
});
document.addEventListener("click", (event) => {
  const openingButton = event.target.closest("[data-opening-hold]");
  if (openingButton) openOpeningHold(openingButton.dataset.openingHold);
  const claimButton = event.target.closest("[data-coupon-claim]");
  if (claimButton) openCouponClaim(claimButton.dataset.couponClaim, "catalog");
});
document.querySelector("[data-last-reset]")?.addEventListener("click", () => {
  lastMinuteWindow = "all";
  lastMinuteIndustry = "all";
  applyLastMinuteFilters();
});
tickLastMinuteCountdowns();
window.setInterval(tickLastMinuteCountdowns, 1000);
renderCoupons();
renderOpeningHolds();

searchInput.addEventListener("input", renderDeals);
sortSelect.addEventListener("change", () => {
  renderDeals();
  syncSearchUrl();
});

document.querySelectorAll("[data-industry-root]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.industryRoot !== "beauty") {
      showToast("Ngành này đang được chuẩn hóa danh mục trước khi mở deal.");
      return;
    }
    state.activeIndustry = "beauty";
    setTaxonomyLevel("[data-industry-root]", "industryRoot", "beauty");
  });
});

document.querySelectorAll("[data-business-category]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.businessCategory !== "nail") {
      showToast("Danh mục này sẽ mở sau Nail với bộ dịch vụ riêng.");
      return;
    }
    state.activeBusinessCategory = "nail";
    setTaxonomyLevel("[data-business-category]", "businessCategory", "nail");
  });
});

document.querySelectorAll(".service-chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeCategory = button.dataset.service;
    state.savedOnly = false;
    document.querySelectorAll(".service-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderDeals();
    syncSearchUrl();
  });
});

document.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save]");
  if (saveButton) {
    event.stopPropagation();
    toggleSaved(saveButton.dataset.save);
    return;
  }

  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    openDeal(openButton.dataset.open, trafficSource);
    return;
  }

  const oneQROpenButton = event.target.closest("[data-oneqr-open]");
  if (oneQROpenButton) {
    const id = oneQROpenButton.dataset.oneqrOpen;
    recordOneQREvent("open", id);
    closeModal(oneqrDialog);
    openDeal(id, "oneqr");
    return;
  }

  const mapOpenButton = event.target.closest("[data-map-open]");
  if (mapOpenButton) {
    const id = mapOpenButton.dataset.mapOpen;
    closeModal(mapDialog);
    openDeal(id, trafficSource);
  }
});

document.querySelector(".featured-spotlight").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openDeal(event.currentTarget.dataset.open, trafficSource);
  }
});

document.querySelectorAll(".request-button").forEach((button) => button.addEventListener("click", openRequestDialog));
document.querySelectorAll(".business-button").forEach((button) => button.addEventListener("click", () => {
  openModal(businessDialog);
  switchBusinessView("overview");
}));
document.querySelectorAll("[data-business-view]").forEach((button) => {
  button.addEventListener("click", () => switchBusinessView(button.dataset.businessView));
});
document.querySelectorAll(".function-bridge-launch").forEach((button) => button.addEventListener("click", () => openModal(functionBridgeDialog)));
document.querySelectorAll("[data-function-route]").forEach((button) => {
  button.addEventListener("click", () => {
    const route = FUNCTION_ROUTE_MAP[button.dataset.functionRoute] || "#discover";
    closeModal(functionBridgeDialog);
    const next = new URL(location.href);
    next.hash = route;
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    handleRoute(route);
  });
});
document.querySelectorAll(".oneqr-launch").forEach((button) => button.addEventListener("click", openOneQR));
document.querySelectorAll("[data-touch-route]").forEach((link) => {
  link.addEventListener("click", () => emitNexoraFunctionEvent("handoff_to_touch", { function: link.dataset.touchRoute }));
});
document.querySelector("#bookDealLink")?.addEventListener("click", () => {
  emitNexoraFunctionEvent("booking_handoff", { deal_id: activeDealId, attribution: activeAttributionSource || trafficSource || "nexora-deals" });
});
document.querySelector("#copyOneQRLink")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("https://oneqr.nexora.app/nx-garden-grove");
    showToast("Đã sao chép OneQR guest link.");
  } catch {
    showToast("OneQR link: oneqr.nexora.app/nx-garden-grove");
  }
});
document.querySelector("#demoTopupButton")?.addEventListener("click", () => {
  adsCredit += 100;
  localStorage.setItem("nexora-ads-credit", String(adsCredit));
  renderBusinessWorkspace();
  showToast("Đã thêm $100 Ads Credit vào ví demo.");
});
document.querySelector("#mapButton").addEventListener("click", openMapDialog);
document.querySelector("#filterButton").addEventListener("click", () => openModal(filterDialog));
document.querySelector("#claimDealButton").addEventListener("click", claimActiveDeal);
document.querySelector("#couponClaimForm").addEventListener("submit", submitCouponClaim);
document.querySelector("#openingHoldForm").addEventListener("submit", submitOpeningHold);
document.querySelector("#quickMatchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = document.querySelector("#quickMatchInput").value.trim();
  if (!value) return;
  document.querySelector('#requestForm [name="service"]').value = value;
  openRequestDialog();
  window.setTimeout(() => document.querySelector('#requestForm [name="budget"]')?.focus(), 120);
});
document.querySelector("#saveDetailButton").addEventListener("click", () => activeDealId && toggleSaved(activeDealId));
document.querySelector("#simulatePurchaseButton").addEventListener("click", simulatePurchase);
document.querySelector("#requestForm").addEventListener("submit", submitRequest);
document.querySelector("#merchantDealForm").addEventListener("submit", submitMerchantDeal);
document.querySelector("#filterForm").addEventListener("submit", applyFilters);

document.querySelector("#merchantDealForm").addEventListener("input", updateMerchantPreview);
document.querySelector("#aiOptimizeButton").addEventListener("click", applyAICampaign);
document.querySelectorAll('.goal-grid input[name="campaignGoal"]').forEach((input) => {
  input.addEventListener("change", () => selectCampaignGoal(input.value));
});
oneqrDialog.addEventListener("click", (event) => {
  const stageButton = event.target.closest("[data-oneqr-stage]");
  if (stageButton) {
    switchOneQRStage(stageButton.dataset.oneqrStage);
    return;
  }
  const reviewButton = event.target.closest("[data-ad-review]");
  if (reviewButton) {
    const row = reviewButton.closest(".ad-review-row");
    const status = row?.querySelector(".review-status");
    if (!row || !status) return;
    const approved = reviewButton.dataset.adReview === "approve";
    row.classList.remove("approved", "rejected");
    row.classList.add(approved ? "approved" : "rejected");
    status.className = `review-status ${approved ? "approved" : "rejected"}`;
    status.textContent = approved ? "Đã duyệt" : "Đã từ chối";
    row.querySelectorAll("[data-ad-review]").forEach((button) => { button.disabled = true; });
    showToast(approved ? "Đã duyệt. Quảng cáo sẵn sàng phân phối theo giới hạn của tiệm." : "Đã từ chối. Quảng cáo sẽ không xuất hiện trên OneQR này.");
    return;
  }
  const viewButton = event.target.closest("[data-oneqr-view]");
  if (viewButton) {
    renderOneQR(viewButton.dataset.oneqrView);
    return;
  }
  const serviceButton = event.target.closest("[data-oneqr-service]");
  if (serviceButton) {
    renderOneQR("search", serviceButton.dataset.oneqrService);
    return;
  }
  const utilityButton = event.target.closest("[data-oneqr-utility]");
  if (utilityButton) {
    showToast(`${utilityButton.dataset.oneqrUtility} mở ngay trong OneQR · không cần app.`);
    return;
  }
  const bannerButton = event.target.closest("[data-oneqr-banner]");
  if (bannerButton) {
    const recorded = recordOneQREvent("open", bannerButton.dataset.oneqrBanner);
    showToast(recorded ? "Qualified sponsored click đã vào attribution ledger." : "Sự kiện đã được ghi nhận trong phiên này.");
  }
});

document.querySelector("#oneqrTrafficRange")?.addEventListener("input", updateOneQRSimulator);

document.querySelector("#oneqrView").addEventListener("submit", (event) => {
  if (event.target.id !== "oneqrSearchForm") return;
  event.preventDefault();
  const query = new FormData(event.target).get("query") || "";
  recordOneQREvent("search", String(query).trim().toLocaleLowerCase("vi") || "all");
  renderOneQR("search", String(query));
  showToast("Đã ghi nhận lượt tìm kiếm để attribution · không tính phí.");
});
document.querySelector("#maxPriceValue").textContent = `$${document.querySelector('#filterForm input[name="maxPrice"]').value}`;
document.querySelector('#filterForm input[name="maxPrice"]').addEventListener("input", (event) => {
  document.querySelector("#maxPriceValue").textContent = `$${event.target.value}`;
});

document.querySelector("#radiusRange").addEventListener("input", (event) => renderMap(Number(event.target.value)));
document.querySelector("#useLocationButton").addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Trình duyệt này chưa hỗ trợ vị trí. Bạn vẫn có thể nhập city hoặc ZIP.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    () => {
      document.querySelector("#locationInput").value = "Vị trí hiện tại";
      showToast("Đã cập nhật vị trí. Kết quả được sắp theo khoảng cách.");
      renderMap();
    },
    () => showToast("Chưa thể đọc vị trí. Hãy nhập city hoặc ZIP để tiếp tục."),
    { enableHighAccuracy: false, timeout: 8000 },
  );
});

document.querySelectorAll("button[data-industry]").forEach((button) => {
  button.addEventListener("click", () => showToast(`${button.dataset.industry} đã nằm trong lộ trình mở rộng sau nail.`));
});

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.closest("dialog")));
});

[dealDialog, requestDialog, mapDialog, filterDialog, businessDialog, oneqrDialog, couponClaimDialog, openingHoldDialog, functionBridgeDialog].forEach((dialog) => {
  if (!dialog) return;
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeModal(dialog);
  });
});

document.querySelectorAll('.desktop-nav a, .deal-subnav a, .mobile-nav a:not([href="#profile"])').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const hash = link.getAttribute("href");
    const currentUrl = new URL(location.href);
    currentUrl.hash = hash;
    history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    handleRoute(hash);
  });
});

document.querySelectorAll('a[href="#profile"]').forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  showToast("Hồ sơ Nexora dùng chung cho wishlist, coupon và rewards.");
}));

function registerWebMCPTools() {
  const context = navigator.modelContext;
  if (!context?.registerTool) return;

  const toolDefinitions = [
    {
      name: "search_nearby_deals",
      description: "Tìm deal đang hoạt động theo ngành nghề, danh mục, dịch vụ và bán kính.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Từ khóa dịch vụ hoặc salon." },
          industry: { type: "string", enum: ["beauty"], description: "Ngành nghề cấp cao nhất." },
          category: { type: "string", enum: ["nail"], description: "Danh mục thuộc ngành nghề." },
          service: { type: "string", enum: ["all", "manicure", "pedicure", "gel-x", "nail-art"], description: "Dịch vụ cụ thể trong danh mục Nail." },
          maxDistance: { type: "number", minimum: 1, maximum: 25 },
        },
      },
      execute: async ({ query = "", industry = "beauty", category = "nail", service = "all", maxDistance = 5 } = {}) => {
        const normalized = query.toLocaleLowerCase("vi");
        if (industry !== "beauty" || category !== "nail") return [];
        return deals.filter((deal) => (
          (service === "all" || deal.category === service)
          && deal.distance <= maxDistance
          && `${deal.title} ${deal.salon}`.toLocaleLowerCase("vi").includes(normalized)
        )).map(({ id, title, salon, price, original, distance, verified }) => ({ id, title, salon, price, original, distance, verified }));
      },
    },
    {
      name: "save_deal_to_wishlist",
      description: "Lưu một deal vào wishlist trên thiết bị này.",
      inputSchema: { type: "object", properties: { dealId: { type: "string" } }, required: ["dealId"] },
      execute: async ({ dealId }) => {
        const deal = getDeal(dealId);
        if (!deal) return { ok: false, error: "Deal not found" };
        savedDeals.add(dealId);
        persistSavedDeals();
        renderDeals();
        return { ok: true, dealId, title: deal.title };
      },
    },
    {
      name: "create_service_request",
      description: "Tạo nhu cầu dịch vụ để salon Nexora Verified gửi offer.",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string" },
          budget: { type: "number", minimum: 10 },
          radius: { type: "number", minimum: 1, maximum: 25 },
          date: { type: "string" },
          time: { type: "string" },
        },
        required: ["service", "budget"],
      },
      execute: async ({ service, budget, radius = 5, date = "Linh hoạt", time = "Linh hoạt" }) => {
        const request = { id: `req-${Date.now()}`, service, budget, radius, date, time };
        serviceRequests.unshift(request);
        localStorage.setItem("nexora-service-requests", JSON.stringify(serviceRequests));
        renderRequests();
        return { ok: true, request };
      },
    },
    {
      name: "claim_coupon_by_phone",
      description: "Giữ một coupon Nexora trong 7 ngày bằng số điện thoại và tạo xác nhận SMS; không yêu cầu cài ứng dụng.",
      inputSchema: {
        type: "object",
        properties: {
          couponId: { type: "string", enum: ["nail20", "lunch5", "market10", "qrlocal"] },
          phone: { type: "string", description: "Số điện thoại của khách nhận SMS xác nhận." },
        },
        required: ["couponId", "phone"],
      },
      execute: async ({ couponId, phone }) => {
        const result = await createCouponClaim(couponId, "catalog", phone);
        if (!result) return { ok: false, error: "Invalid coupon or phone number" };
        return {
          ok: true,
          claimId: result.claim.claimId,
          phone: result.claim.phoneMasked,
          holdUntil: result.claim.holdUntil,
          status: "held_for_sms_confirmation",
        };
      },
    },
    {
      name: "open_nexora_promotion_sync",
      description: "Mở luồng tạo promotion trong Nexora Touch và phân phối sang Nexora Deals.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        openModal(businessDialog);
        return { ok: true, status: "merchant promotion composer opened" };
      },
    },
  ];

  toolDefinitions.forEach((tool) => {
    try {
      const result = context.registerTool(tool);
      if (result?.catch) result.catch(() => {});
    } catch {
      // Declarative tool attributes on the forms remain available as a fallback.
    }
  });
}

setDefaultDates();
renderRequests();
applyIncomingDealSearch();
renderDeals();
updateMerchantPreview();
renderBusinessWorkspace();
initializeLanguageControl();
initializeHeroCarousel();
updateNexoraAuthLinks();
registerWebMCPTools();

window.addEventListener("hashchange", () => {
  updateNexoraAuthLinks();
  handleRoute(location.hash);
});

if (incomingFunctionRoute) {
  const bridgedUrl = new URL(location.href);
  bridgedUrl.hash = incomingFunctionRoute;
  history.replaceState(null, "", `${bridgedUrl.pathname}${bridgedUrl.search}${bridgedUrl.hash}`);
  handleRoute(incomingFunctionRoute);
} else if (location.hash && location.hash !== "#discover") {
  handleRoute(location.hash);
}
