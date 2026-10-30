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
    image: "./assets/nexora-nail-deal-featured-banner.jpg",
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
    image: "./assets/last-minute-food-rescue.jpg",
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
    image: "./assets/last-minute-food-rescue.jpg",
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
    image: "./assets/last-minute-food-rescue.jpg",
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
  {
    id: "luna-nails-pedicure",
    category: "nail",
    salon: "Luna Nail Lounge",
    title: "Luxury pedicure · cancellation opening",
    price: 28,
    original: 42,
    discount: "SAVE $14",
    distance: 0.9,
    rating: 4.9,
    reviews: 286,
    deadline: "Today · 3:30 PM",
    badge: "OPENING JUST RELEASED",
    lastMinuteOnly: true,
    verified: true,
    inventory: 1,
    inventoryLabel: "1 giờ vừa trống",
    instant: true,
    image: "./assets/hero-nail-spa-luxury-v1.jpg",
    description: "Một suất pedicure vừa được mở lại do khách đổi lịch, gồm ngâm chân, chăm sóc móng và massage thư giãn.",
    schedule: "Hôm nay · 3:30 PM",
    location: "Garden Grove, CA",
    terms: "Cần đến trước 10 phút. Gel polish và nâng cấp dịch vụ tính riêng.",
    bookingSlug: "luna-nail-lounge",
  },
  {
    id: "velvet-hair-blowout",
    category: "hair",
    salon: "Velvet Hair Studio",
    title: "Wash & blowout · opening today",
    price: 35,
    original: 55,
    discount: "SAVE $20",
    distance: 1.6,
    rating: 4.8,
    reviews: 173,
    deadline: "Today · 4:15 PM",
    badge: "SALON OPENING",
    lastMinuteOnly: true,
    verified: true,
    inventory: 1,
    inventoryLabel: "1 ghế vừa trống",
    instant: true,
    image: "./assets/hero-hair-salon-v1.jpg",
    description: "Suất gội và tạo kiểu blowout vừa trống trong lịch hôm nay, xác nhận trực tiếp với salon.",
    schedule: "Hôm nay · 4:15 PM",
    location: "Garden Grove, CA",
    terms: "Giá áp dụng tóc ngắn hoặc trung bình; tóc dài và tạo kiểu đặc biệt có phụ phí.",
    bookingSlug: "velvet-hair-studio",
  },
  {
    id: "serenity-massage",
    category: "spa",
    salon: "Serenity Day Spa",
    title: "60-minute massage · same-day opening",
    price: 49,
    original: 75,
    discount: "SAVE $26",
    distance: 2.1,
    rating: 4.9,
    reviews: 201,
    deadline: "Today · 5:00 PM",
    badge: "SAME-DAY SPA",
    lastMinuteOnly: true,
    verified: true,
    inventory: 1,
    inventoryLabel: "1 phòng còn trống",
    instant: true,
    image: "./assets/hero-beauty-wellness-v1.jpg",
    description: "Suất massage thư giãn 60 phút còn trống trong ngày, dành cho khách có thể đến đúng giờ.",
    schedule: "Hôm nay · 5:00 PM",
    location: "Garden Grove, CA",
    terms: "Không cộng dồn ưu đãi khác. Cần xác nhận tình trạng sức khỏe trước dịch vụ.",
    bookingSlug: "serenity-day-spa",
  },
  {
    id: "pacific-hotel-tonight",
    category: "hotel",
    salon: "Pacific Garden Hotel",
    title: "King room · tonight only",
    price: 89,
    original: 149,
    discount: "SAVE $60",
    distance: 3.2,
    rating: 4.7,
    reviews: 418,
    deadline: "Check-in tonight",
    badge: "ROOM TONIGHT",
    lastMinuteOnly: true,
    verified: true,
    inventory: 2,
    inventoryLabel: "2 phòng còn lại",
    instant: true,
    image: "./assets/hero-hotel-v1.jpg",
    description: "Phòng king còn trống cho đêm nay, đặt nhanh và nhận xác nhận trực tiếp từ khách sạn.",
    schedule: "Tối nay · nhận phòng sau 3 PM",
    location: "Garden Grove, CA",
    terms: "Giá chưa gồm thuế và tiền cọc phát sinh. Cần giấy tờ hợp lệ khi nhận phòng.",
    bookingSlug: "pacific-garden-hotel",
  },
  {
    id: "harbor-sunset-cruise",
    category: "experience",
    salon: "Harbor Sunset Cruises",
    title: "Sunset harbor cruise · seats released",
    price: 39,
    original: 65,
    discount: "SAVE $26",
    distance: 8.4,
    rating: 4.9,
    reviews: 352,
    deadline: "Board by 5:40 PM",
    badge: "DEPARTS TODAY",
    lastMinuteOnly: true,
    verified: true,
    inventory: 4,
    inventoryLabel: "4 chỗ vừa mở",
    instant: true,
    image: "./assets/hero-yacht-v1.jpg",
    description: "Các chỗ còn lại trên chuyến du ngoạn ngắm hoàng hôn hôm nay, xác nhận ngay bằng số điện thoại.",
    schedule: "Hôm nay · khởi hành 6 PM",
    location: "Newport Beach, CA",
    terms: "Cần có mặt trước giờ khởi hành 20 phút. Lịch có thể thay đổi theo thời tiết.",
    bookingSlug: "harbor-sunset-cruises",
  },
  {
    id: "reform-pilates-class",
    category: "fitness",
    salon: "Reform Pilates Studio",
    title: "Reformer class · late opening",
    price: 12,
    original: 25,
    discount: "SAVE $13",
    distance: 1.9,
    rating: 4.8,
    reviews: 146,
    deadline: "Class starts 6:30 PM",
    badge: "CLASS OPENING",
    lastMinuteOnly: true,
    verified: true,
    inventory: 2,
    inventoryLabel: "2 thảm còn trống",
    instant: true,
    description: "Hai chỗ vừa trống trong lớp reformer Pilates chiều nay, dành cho người đã từng tập cơ bản.",
    schedule: "Hôm nay · 6:30 PM",
    location: "Garden Grove, CA",
    terms: "Đến trước 10 phút. Không phù hợp lớp đầu tiên nếu chưa được hướng dẫn máy reformer.",
    bookingSlug: "reform-pilates-studio",
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
let dealMatchWishes = safeRead("nexora-deal-match-wishes", []);
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

let wishlistView = "all";

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
const aiGuideDialog = document.querySelector("#aiGuideDialog");
let trafficSource = null;
let incomingFunctionRoute = null;

const NEXORA_WORKER_ROLES = new Set(["worker", "tech", "technician", "freelance", "chair", "booth", "employee"]);

function getNexoraViewerRole() {
  const role = new URLSearchParams(location.search).get("role");
  return String(role || "guest").trim().toLocaleLowerCase("en");
}

function hasWorkerWorkspaceAccess() {
  return NEXORA_WORKER_ROLES.has(getNexoraViewerRole());
}

function syncRoleNavigation() {
  const allowed = hasWorkerWorkspaceAccess();
  document.querySelectorAll("[data-worker-only]").forEach((element) => {
    element.hidden = !allowed;
  });
}

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
  const language = document.querySelector("#languageSelect")?.value || localStorage.getItem("nexora-language") || "en";
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
  const language = document.querySelector("#languageSelect")?.value || localStorage.getItem("nexora-language") || "en";
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

function hasAuthenticatedNexoraSession() {
  return document.documentElement.dataset.authenticated === "true"
    || window.NEXORA_AUTH?.isAuthenticated === true;
}

function syncAuthenticatedHeader() {
  const isAuthenticated = hasAuthenticatedNexoraSession();
  document.querySelectorAll("[data-authenticated-only]").forEach((element) => {
    element.hidden = !isAuthenticated;
  });
  document.querySelectorAll("[data-guest-only]").forEach((element) => {
    element.hidden = isAuthenticated;
  });
}

const NEXORA_LANGUAGES = ["en"];
const NEXORA_HTML_LANG = { vi: "vi", en: "en", es: "es", "zh-TW": "zh-Hant", ko: "ko" };
const NEXORA_LOCALE = { vi: "vi-VN", en: "en-US", es: "es-US", "zh-TW": "zh-TW", ko: "ko-KR" };
const NEXORA_LANGUAGE_CODES = { vi: "VI", en: "EN", es: "ES", "zh-TW": "繁中", ko: "KO" };
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
  "Ưu đãi & Mã giảm": "Deals & Coupons",
    "Đã lưu": "Wishlist",
  "Ưu đãi gần bạn": "Deals Nearby",
  "Mã giảm theo ngành": "Coupons by Category",
  "Tìm theo nhu cầu": "Deal Match",
  "Sắp khai trương": "Grand Openings",
  "Ưu đãi phút chót": "Last Minute",
  "Làm đẹp & Sức khỏe": "Beauty & Wellness",
  "Ẩm thực & Chợ": "Food & Market",
  "Nhà, Xe & Thú cưng": "Home, Auto & Pet",
  "LÀM ĐẸP & SỨC KHỎE · GẦN BẠN": "BEAUTY & WELLNESS · NEAR YOU",
  "ẨM THỰC & CHỢ · HÔM NAY": "FOOD & MARKET · TODAY",
  "NHÀ, XE & THÚ CƯNG · GẦN BẠN": "HOME, AUTO & PET · NEAR YOU",
  "TIẾT KIỆM $20": "SAVE $20",
  "GIẢM 20%": "20% OFF",
  "2 MÓN $29": "2 FOR $29"
});
Object.assign(LANGUAGE_COPY.es, {
  "Ưu đãi & Mã giảm": "Ofertas y cupones",
  "Đã lưu": "Guardados",
  "Ưu đãi gần bạn": "Ofertas cercanas",
  "Mã giảm theo ngành": "Cupones por categoría",
  "Tìm theo nhu cầu": "Coincidencia de ofertas",
  "Sắp khai trương": "Próximas aperturas",
  "Ưu đãi phút chót": "Último minuto",
  "Làm đẹp & Sức khỏe": "Belleza y bienestar",
  "Ẩm thực & Chợ": "Comida y mercado",
  "Nhà, Xe & Thú cưng": "Hogar, auto y mascotas",
  "LÀM ĐẸP & SỨC KHỎE · GẦN BẠN": "BELLEZA Y BIENESTAR · CERCA DE TI",
  "ẨM THỰC & CHỢ · HÔM NAY": "COMIDA Y MERCADO · HOY",
  "NHÀ, XE & THÚ CƯNG · GẦN BẠN": "HOGAR, AUTO Y MASCOTAS · CERCA DE TI",
  "TIẾT KIỆM $20": "AHORRA $20",
  "GIẢM 20%": "20% MENOS",
  "2 MÓN $29": "2 POR $29"
});
Object.assign(LANGUAGE_COPY["zh-TW"], {
  "Ưu đãi & Mã giảm": "優惠與優惠券",
  "Đã lưu": "已儲存",
  "Ưu đãi gần bạn": "附近優惠",
  "Mã giảm theo ngành": "分類優惠券",
  "Tìm theo nhu cầu": "需求配對",
  "Sắp khai trương": "即將開幕",
  "Ưu đãi phút chót": "限時優惠",
  "Làm đẹp & Sức khỏe": "美容與健康",
  "Ẩm thực & Chợ": "餐飲與市場",
  "Nhà, Xe & Thú cưng": "居家、汽車與寵物",
  "LÀM ĐẸP & SỨC KHỎE · GẦN BẠN": "美容與健康 · 附近",
  "ẨM THỰC & CHỢ · HÔM NAY": "餐飲與市場 · 今日",
  "NHÀ, XE & THÚ CƯNG · GẦN BẠN": "居家、汽車與寵物 · 附近",
  "TIẾT KIỆM $20": "現省 $20",
  "GIẢM 20%": "折扣 20%",
  "2 MÓN $29": "2 份 $29"
});
Object.assign(LANGUAGE_COPY.ko, {
  "Ưu đãi & Mã giảm": "혜택 및 쿠폰",
  "Đã lưu": "저장됨",
  "Ưu đãi gần bạn": "내 주변 혜택",
  "Mã giảm theo ngành": "업종별 쿠폰",
  "Tìm theo nhu cầu": "맞춤 혜택 찾기",
  "Sắp khai trương": "신규 오픈 예정",
  "Ưu đãi phút chót": "마감 임박 혜택",
  "Làm đẹp & Sức khỏe": "뷰티 & 웰니스",
  "Ẩm thực & Chợ": "푸드 & 마켓",
  "Nhà, Xe & Thú cưng": "홈, 자동차 & 반려동물",
  "LÀM ĐẸP & SỨC KHỎE · GẦN BẠN": "뷰티 & 웰니스 · 내 주변",
  "ẨM THỰC & CHỢ · HÔM NAY": "푸드 & 마켓 · 오늘",
  "NHÀ, XE & THÚ CƯNG · GẦN BẠN": "홈, 자동차 & 반려동물 · 내 주변",
  "TIẾT KIỆM $20": "$20 절약",
  "GIẢM 20%": "20% 할인",
  "2 MÓN $29": "2개 $29"
});

const BRAND_LANGUAGE_LABELS = {
  vi: "ƯU ĐÃI",
  en: "DEALS",
  es: "OFERTAS",
  "zh-TW": "優惠",
  ko: "혜택"
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
  "Khám phá gần tôi": "Explore near me", "Tìm theo nhu cầu": "Deal Match", "ưu đãi đang chạy": "live offers",
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

Object.assign(LANGUAGE_COPY.en, {
  "ƯU ĐÃI ĐANG CHẠY": "LIVE OFFERS", "COUPON MỚI": "NEW COUPON",
  "DEAL GẦN BẠN": "NEARBY DEAL", "COUPON GIỚI HẠN": "LIMITED COUPON",
  "DEAL TỐI NAY": "TONIGHT'S DEAL", "ƯU ĐÃI KHÁCH MỚI": "NEW CLIENT OFFER",
  "GIÁ ĐẶC BIỆT": "SPECIAL RATE", "TRẢI NGHIỆM ĐẶC BIỆT": "SPECIAL EXPERIENCE",
  "Đã xác minh · cập nhật trực tiếp": "Verified · live updates",
  "Đã xác minh · số lượng có hạn": "Verified · limited availability",
  "Xem ưu đãi": "View offer"
});

Object.assign(LANGUAGE_COPY.es, {
  "ƯU ĐÃI ĐANG CHẠY": "OFERTAS EN VIVO", "COUPON MỚI": "CUPÓN NUEVO",
  "DEAL GẦN BẠN": "OFERTA CERCANA", "COUPON GIỚI HẠN": "CUPÓN LIMITADO",
  "DEAL TỐI NAY": "OFERTA DE ESTA NOCHE", "ƯU ĐÃI KHÁCH MỚI": "OFERTA PARA CLIENTES NUEVOS",
  "GIÁ ĐẶC BIỆT": "TARIFA ESPECIAL", "TRẢI NGHIỆM ĐẶC BIỆT": "EXPERIENCIA ESPECIAL",
  "Đã xác minh · cập nhật trực tiếp": "Verificado · actualizado en vivo",
  "Đã xác minh · số lượng có hạn": "Verificado · disponibilidad limitada",
  "Xem ưu đãi": "Ver oferta"
});

Object.assign(LANGUAGE_COPY["zh-TW"], {
  "ƯU ĐÃI ĐANG CHẠY": "即時優惠", "COUPON MỚI": "全新優惠券",
  "DEAL GẦN BẠN": "附近優惠", "COUPON GIỚI HẠN": "限量優惠券",
  "DEAL TỐI NAY": "今晚優惠", "ƯU ĐÃI KHÁCH MỚI": "新客優惠",
  "GIÁ ĐẶC BIỆT": "特別價格", "TRẢI NGHIỆM ĐẶC BIỆT": "特別體驗",
  "Đã xác minh · cập nhật trực tiếp": "已驗證 · 即時更新",
  "Đã xác minh · số lượng có hạn": "已驗證 · 名額有限",
  "Xem ưu đãi": "查看優惠"
});

Object.assign(LANGUAGE_COPY.ko, {
  "ƯU ĐÃI ĐANG CHẠY": "실시간 혜택", "COUPON MỚI": "새 쿠폰",
  "DEAL GẦN BẠN": "주변 혜택", "COUPON GIỚI HẠN": "한정 쿠폰",
  "DEAL TỐI NAY": "오늘 밤 혜택", "ƯU ĐÃI KHÁCH MỚI": "신규 고객 혜택",
  "GIÁ ĐẶC BIỆT": "특별 요금", "TRẢI NGHIỆM ĐẶC BIỆT": "특별한 경험",
  "Đã xác minh · cập nhật trực tiếp": "인증 완료 · 실시간 업데이트",
  "Đã xác minh · số lượng có hạn": "인증 완료 · 한정 수량",
  "Xem ưu đãi": "혜택 보기"
});

Object.assign(LANGUAGE_COPY.en, {
  "MINH BẠCH · SỐ LIỆU DEMO": "TRANSPARENT · DEMO METRICS",
  "Doanh nghiệp tham gia. Người dùng chia sẻ. Kết quả được đo.": "Businesses participate. Users share. Results are measured.",
  "Khối này minh họa cách Nexora biến lượt khám phá thành coupon, booking và doanh thu có thể đối chiếu.": "This section shows how Nexora turns discovery into coupons, bookings and attributable revenue.",
  "Xem kết quả cho doanh nghiệp": "View business results",
  "doanh nghiệp kết nối": "connected businesses",
  "ngành nghề & danh mục": "industries & categories",
  "lượt khám phá mỗi tháng": "monthly discovery views",
  "coupon + booking": "coupons + bookings",
  "Dữ liệu minh họa · không phải số liệu vận hành thực tế. Sẽ tự cập nhật khi kết nối Nexora Touch Analytics.": "Illustrative data · not live operating metrics. It will update automatically once Nexora Touch Analytics is connected.",
  "NGƯỜI DÙNG NÓI GÌ": "WHAT USERS SAY",
  "Chia sẻ từ cộng đồng": "Shared by the community",
  "Review minh họa — chỉ hiển thị công khai sau khi được xác minh.": "Illustrative reviews — published only after verification.",
  "Khách hàng · Garden Grove": "Customer · Garden Grove",
  "Khách hàng · Houston": "Customer · Houston",
  "Khách hàng · Westminster": "Customer · Westminster",
  "“Tôi thấy lịch nail trống gần nhà và đặt được đúng giờ mình cần, không phải gọi từng tiệm.”": "“I found a nearby nail opening at the exact time I needed, without calling each salon.”",
  "“Coupon được lưu bằng số điện thoại nên tới quầy mở lại rất nhanh. Điều kiện ưu đãi cũng rõ ràng.”": "“The coupon was saved to my phone number, so it was quick to retrieve at checkout. The terms were clear too.”",
  "“Last Minute giúp tôi mua túi bánh cuối ngày với giá tốt và biết chính xác giờ phải đến nhận.”": "“Last Minute helped me get an end-of-day pastry bag at a great price and showed the exact pickup time.”",
  "Đã dùng Deal Nearby": "Used Deal Nearby",
  "Đã dùng Coupon": "Used Coupon",
  "Đã dùng Last Minute": "Used Last Minute",
  "KẾT QUẢ DOANH NGHIỆP NHÌN THẤY": "RESULTS BUSINESSES CAN SEE",
  "Từ hiển thị đến doanh thu": "From impressions to revenue",
  "30 ngày · chiến dịch mẫu": "30 days · sample campaign",
  "Lượt hiển thị": "Impressions",
  "Bấm xem deal": "Deal views",
  "Lưu coupon": "Coupons saved",
  "Đã redeem": "Redeemed",
  "Doanh thu quy về campaign": "Campaign-attributed revenue",
  "Đo từ nguồn hiển thị → tương tác → giao dịch": "Measured from impression → interaction → transaction",
  "Doanh nghiệp biết kênh nào mang khách tới, ưu đãi nào được dùng và chi phí nào tạo ra doanh thu.": "Businesses can see which channel brings customers, which offers are redeemed and which spending generates revenue."
});

Object.assign(LANGUAGE_COPY.es, {
  "MINH BẠCH · SỐ LIỆU DEMO": "TRANSPARENCIA · DATOS DE DEMOSTRACIÓN",
  "Doanh nghiệp tham gia. Người dùng chia sẻ. Kết quả được đo.": "Los negocios participan. Los usuarios comparten. Los resultados se miden.",
  "Khối này minh họa cách Nexora biến lượt khám phá thành coupon, booking và doanh thu có thể đối chiếu.": "Esta sección muestra cómo Nexora convierte el descubrimiento en cupones, reservas e ingresos atribuibles.",
  "Xem kết quả cho doanh nghiệp": "Ver resultados para negocios",
  "doanh nghiệp kết nối": "negocios conectados",
  "ngành nghề & danh mục": "sectores y categorías",
  "lượt khám phá mỗi tháng": "vistas de descubrimiento al mes",
  "coupon + booking": "cupones + reservas",
  "Dữ liệu minh họa · không phải số liệu vận hành thực tế. Sẽ tự cập nhật khi kết nối Nexora Touch Analytics.": "Datos ilustrativos · no son métricas operativas reales. Se actualizarán al conectar Nexora Touch Analytics.",
  "NGƯỜI DÙNG NÓI GÌ": "LO QUE DICEN LOS USUARIOS",
  "Chia sẻ từ cộng đồng": "Compartido por la comunidad",
  "Review minh họa — chỉ hiển thị công khai sau khi được xác minh.": "Reseñas ilustrativas — solo se publican después de verificarlas.",
  "Khách hàng · Garden Grove": "Cliente · Garden Grove",
  "Khách hàng · Houston": "Cliente · Houston",
  "Khách hàng · Westminster": "Cliente · Westminster",
  "“Tôi thấy lịch nail trống gần nhà và đặt được đúng giờ mình cần, không phải gọi từng tiệm.”": "“Encontré una cita de uñas cerca a la hora exacta que necesitaba, sin llamar a cada salón.”",
  "“Coupon được lưu bằng số điện thoại nên tới quầy mở lại rất nhanh. Điều kiện ưu đãi cũng rõ ràng.”": "“El cupón quedó guardado con mi teléfono y fue muy rápido recuperarlo en caja. Las condiciones también eran claras.”",
  "“Last Minute giúp tôi mua túi bánh cuối ngày với giá tốt và biết chính xác giờ phải đến nhận.”": "“Last Minute me permitió comprar una bolsa de pan del día a buen precio y saber la hora exacta de recogida.”",
  "Đã dùng Deal Nearby": "Usó Deal Nearby",
  "Đã dùng Coupon": "Usó Coupon",
  "Đã dùng Last Minute": "Usó Last Minute",
  "KẾT QUẢ DOANH NGHIỆP NHÌN THẤY": "RESULTADOS QUE VE EL NEGOCIO",
  "Từ hiển thị đến doanh thu": "De impresiones a ingresos",
  "30 ngày · chiến dịch mẫu": "30 días · campaña de muestra",
  "Lượt hiển thị": "Impresiones",
  "Bấm xem deal": "Vistas de la oferta",
  "Lưu coupon": "Cupones guardados",
  "Đã redeem": "Canjeados",
  "Doanh thu quy về campaign": "Ingresos atribuidos a la campaña",
  "Đo từ nguồn hiển thị → tương tác → giao dịch": "Medido desde impresión → interacción → transacción",
  "Doanh nghiệp biết kênh nào mang khách tới, ưu đãi nào được dùng và chi phí nào tạo ra doanh thu.": "El negocio ve qué canal trae clientes, qué ofertas se canjean y qué inversión genera ingresos."
});

Object.assign(LANGUAGE_COPY["zh-TW"], {
  "MINH BẠCH · SỐ LIỆU DEMO": "透明呈現 · 示範數據",
  "Doanh nghiệp tham gia. Người dùng chia sẻ. Kết quả được đo.": "商家加入、用戶分享、成效可衡量。",
  "Khối này minh họa cách Nexora biến lượt khám phá thành coupon, booking và doanh thu có thể đối chiếu.": "本區示範 Nexora 如何把探索流量轉化為優惠券、預約與可歸因營收。",
  "Xem kết quả cho doanh nghiệp": "查看商家成效",
  "doanh nghiệp kết nối": "已連結商家",
  "ngành nghề & danh mục": "產業與分類",
  "lượt khám phá mỗi tháng": "每月探索瀏覽",
  "coupon + booking": "優惠券 + 預約",
  "Dữ liệu minh họa · không phải số liệu vận hành thực tế. Sẽ tự cập nhật khi kết nối Nexora Touch Analytics.": "示範數據 · 非實際營運數據。連接 Nexora Touch Analytics 後將自動更新。",
  "NGƯỜI DÙNG NÓI GÌ": "用戶怎麼說",
  "Chia sẻ từ cộng đồng": "社群分享",
  "Review minh họa — chỉ hiển thị công khai sau khi được xác minh.": "示範評論 — 僅在完成驗證後公開。",
  "Khách hàng · Garden Grove": "顧客 · Garden Grove",
  "Khách hàng · Houston": "顧客 · Houston",
  "Khách hàng · Westminster": "顧客 · Westminster",
  "“Tôi thấy lịch nail trống gần nhà và đặt được đúng giờ mình cần, không phải gọi từng tiệm.”": "「我找到住家附近剛好符合時間的美甲空檔，不必一家一家打電話。」",
  "“Coupon được lưu bằng số điện thoại nên tới quầy mở lại rất nhanh. Điều kiện ưu đãi cũng rõ ràng.”": "「優惠券綁定手機號碼，到櫃檯很快就能調出，使用條件也很清楚。」",
  "“Last Minute giúp tôi mua túi bánh cuối ngày với giá tốt và biết chính xác giờ phải đến nhận.”": "「Last Minute 讓我用好價格買到當日烘焙袋，也清楚知道取貨時間。」",
  "Đã dùng Deal Nearby": "使用過 Deal Nearby",
  "Đã dùng Coupon": "使用過優惠券",
  "Đã dùng Last Minute": "使用過 Last Minute",
  "KẾT QUẢ DOANH NGHIỆP NHÌN THẤY": "商家看得到的成果",
  "Từ hiển thị đến doanh thu": "從曝光到營收",
  "30 ngày · chiến dịch mẫu": "30 天 · 示範活動",
  "Lượt hiển thị": "曝光次數",
  "Bấm xem deal": "優惠瀏覽",
  "Lưu coupon": "已儲存優惠券",
  "Đã redeem": "已兌換",
  "Doanh thu quy về campaign": "活動歸因營收",
  "Đo từ nguồn hiển thị → tương tác → giao dịch": "由曝光來源 → 互動 → 交易進行衡量",
  "Doanh nghiệp biết kênh nào mang khách tới, ưu đãi nào được dùng và chi phí nào tạo ra doanh thu.": "商家可了解哪些管道帶來顧客、哪些優惠被使用，以及哪些投入創造營收。"
});

Object.assign(LANGUAGE_COPY.ko, {
  "MINH BẠCH · SỐ LIỆU DEMO": "투명성 · 데모 지표",
  "Doanh nghiệp tham gia. Người dùng chia sẻ. Kết quả được đo.": "비즈니스가 참여하고, 사용자가 공유하며, 성과가 측정됩니다.",
  "Khối này minh họa cách Nexora biến lượt khám phá thành coupon, booking và doanh thu có thể đối chiếu.": "이 영역은 Nexora가 탐색을 쿠폰, 예약, 추적 가능한 매출로 전환하는 방식을 보여줍니다.",
  "Xem kết quả cho doanh nghiệp": "비즈니스 성과 보기",
  "doanh nghiệp kết nối": "연결된 비즈니스",
  "ngành nghề & danh mục": "업종 및 카테고리",
  "lượt khám phá mỗi tháng": "월간 탐색 조회",
  "coupon + booking": "쿠폰 + 예약",
  "Dữ liệu minh họa · không phải số liệu vận hành thực tế. Sẽ tự cập nhật khi kết nối Nexora Touch Analytics.": "예시 데이터 · 실제 운영 지표가 아닙니다. Nexora Touch Analytics 연결 후 자동으로 업데이트됩니다.",
  "NGƯỜI DÙNG NÓI GÌ": "사용자 이야기",
  "Chia sẻ từ cộng đồng": "커뮤니티 후기",
  "Review minh họa — chỉ hiển thị công khai sau khi được xác minh.": "예시 후기 — 검증 후에만 공개됩니다.",
  "Khách hàng · Garden Grove": "고객 · Garden Grove",
  "Khách hàng · Houston": "고객 · Houston",
  "Khách hàng · Westminster": "고객 · Westminster",
  "“Tôi thấy lịch nail trống gần nhà và đặt được đúng giờ mình cần, không phải gọi từng tiệm.”": "“살롱마다 전화하지 않고도 집 근처에서 원하는 시간의 네일 예약을 찾았어요.”",
  "“Coupon được lưu bằng số điện thoại nên tới quầy mở lại rất nhanh. Điều kiện ưu đãi cũng rõ ràng.”": "“쿠폰이 전화번호에 저장돼 결제할 때 바로 찾을 수 있었고 이용 조건도 명확했어요.”",
  "“Last Minute giúp tôi mua túi bánh cuối ngày với giá tốt và biết chính xác giờ phải đến nhận.”": "“Last Minute로 당일 빵 꾸러미를 좋은 가격에 구매하고 정확한 픽업 시간도 확인했어요.”",
  "Đã dùng Deal Nearby": "Deal Nearby 이용",
  "Đã dùng Coupon": "쿠폰 이용",
  "Đã dùng Last Minute": "Last Minute 이용",
  "KẾT QUẢ DOANH NGHIỆP NHÌN THẤY": "비즈니스가 확인하는 성과",
  "Từ hiển thị đến doanh thu": "노출에서 매출까지",
  "30 ngày · chiến dịch mẫu": "30일 · 샘플 캠페인",
  "Lượt hiển thị": "노출 수",
  "Bấm xem deal": "혜택 조회",
  "Lưu coupon": "쿠폰 저장",
  "Đã redeem": "사용 완료",
  "Doanh thu quy về campaign": "캠페인 기여 매출",
  "Đo từ nguồn hiển thị → tương tác → giao dịch": "노출 경로 → 상호작용 → 거래로 측정",
  "Doanh nghiệp biết kênh nào mang khách tới, ưu đãi nào được dùng và chi phí nào tạo ra doanh thu.": "비즈니스는 어떤 채널이 고객을 유입하고, 어떤 혜택이 사용되며, 어떤 지출이 매출을 만드는지 확인할 수 있습니다."
});

Object.assign(LANGUAGE_COPY.en, {
  "Dành cho doanh nghiệp": "For businesses",
  "Dữ liệu minh họa": "Illustrative data",
  "HAI HÀNH TRÌNH · MỘT HỆ SINH THÁI": "TWO JOURNEYS · ONE ECOSYSTEM",
  "Bạn đến để tìm ưu đãi hay để tăng khách?": "Are you here to find offers or grow your business?",
  "Nexora giữ trải nghiệm khách hàng đơn giản, đồng thời cho doanh nghiệp một luồng vận hành và đo lường thống nhất.": "Nexora keeps the customer experience simple while giving businesses one connected workflow for operations and measurement.",
  "DÀNH CHO KHÁCH HÀNG": "FOR CUSTOMERS",
  "Khám phá và dùng ưu đãi, không cần cài app": "Discover and use offers without installing an app",
  "Tìm đúng thứ bạn cần": "Find exactly what you need",
  "Theo vị trí, ngành nghề, thời gian hoặc quét OneQR tại tiệm.": "Search by location, industry or time, or scan OneQR at a business.",
  "Giữ bằng số điện thoại": "Claim with your phone number",
  "Coupon và xác nhận được gửi qua SMS; điều kiện luôn hiển thị rõ.": "Coupons and confirmations arrive by SMS with clear terms.",
  "Dùng tại quầy hoặc đặt lịch": "Redeem at checkout or book",
  "Đưa mã xác minh, check-in hoặc hoàn tất booking với doanh nghiệp.": "Show the verification code, check in or complete the booking with the business.",
  "Tìm deal gần tôi": "Find deals near me",
  "Nói điều tôi cần": "Tell Nexora what I need",
  "Tạo một lần, phân phối và đo lường trên toàn Nexora": "Create once, distribute and measure across Nexora",
  "Tạo trong Nexora Touch Promotion": "Create in Nexora Touch Promotion",
  "Chọn Deal, Coupon, Last Minute, mục tiêu và điều kiện sử dụng.": "Choose Deal, Coupon or Last Minute, then set the goal and terms.",
  "Phân phối đúng kênh": "Distribute through the right channels",
  "CRM/SMS, OneQR, Deal Nearby, Search Deals và vị trí tài trợ.": "CRM/SMS, OneQR, Deals Nearby, Search Deals and sponsored placements.",
  "Thấy kết quả thật": "See measurable results",
  "Theo dõi lượt xem, coupon, booking, redeem và doanh thu quy về campaign.": "Track views, coupons, bookings, redemptions and campaign-attributed revenue.",
  "Xem cách hoạt động": "See how it works",
  "Tạo promotion": "Create a promotion",
  "BẮT ĐẦU VỚI NEXORA": "GET STARTED WITH NEXORA",
  "Chọn hành trình phù hợp với bạn": "Choose the journey that fits you",
  "Khách hàng khám phá miễn phí. Doanh nghiệp tạo và quản lý chương trình trong Nexora Touch.": "Customers discover for free. Businesses create and manage programs in Nexora Touch.",
  "Tìm ưu đãi gần tôi": "Find offers near me",
  "Giải pháp cho doanh nghiệp": "Business solutions",
  "$5 OFF bữa trưa từ $25": "$5 OFF lunch on $25+",
  "Túi bánh nướng hôm nay $7": "Today's pastry bag $7",
  "Combo người sáng lập $9": "Founders combo $9"
});

Object.assign(LANGUAGE_COPY.es, {
  "Dành cho doanh nghiệp": "Para negocios",
  "Dữ liệu minh họa": "Datos ilustrativos",
  "HAI HÀNH TRÌNH · MỘT HỆ SINH THÁI": "DOS RECORRIDOS · UN ECOSISTEMA",
  "Bạn đến để tìm ưu đãi hay để tăng khách?": "¿Vienes a encontrar ofertas o a atraer más clientes?",
  "Nexora giữ trải nghiệm khách hàng đơn giản, đồng thời cho doanh nghiệp một luồng vận hành và đo lường thống nhất.": "Nexora simplifica la experiencia del cliente y conecta la operación y la medición del negocio.",
  "DÀNH CHO KHÁCH HÀNG": "PARA CLIENTES",
  "Khám phá và dùng ưu đãi, không cần cài app": "Descubre y usa ofertas sin instalar una app",
  "Tìm đúng thứ bạn cần": "Encuentra exactamente lo que necesitas",
  "Theo vị trí, ngành nghề, thời gian hoặc quét OneQR tại tiệm.": "Busca por ubicación, sector u horario, o escanea OneQR en el negocio.",
  "Giữ bằng số điện thoại": "Obtén la oferta con tu teléfono",
  "Coupon và xác nhận được gửi qua SMS; điều kiện luôn hiển thị rõ.": "Recibe cupones y confirmaciones por SMS con condiciones claras.",
  "Dùng tại quầy hoặc đặt lịch": "Canjea en caja o reserva",
  "Đưa mã xác minh, check-in hoặc hoàn tất booking với doanh nghiệp.": "Muestra el código, registra tu llegada o completa la reserva con el negocio.",
  "Tìm deal gần tôi": "Buscar ofertas cerca de mí",
  "Nói điều tôi cần": "Decir lo que necesito",
  "Tạo một lần, phân phối và đo lường trên toàn Nexora": "Crea una vez, distribuye y mide en todo Nexora",
  "Tạo trong Nexora Touch Promotion": "Crear en Nexora Touch Promotion",
  "Chọn Deal, Coupon, Last Minute, mục tiêu và điều kiện sử dụng.": "Elige Deal, Coupon o Last Minute y define el objetivo y las condiciones.",
  "Phân phối đúng kênh": "Distribuye en los canales correctos",
  "CRM/SMS, OneQR, Deal Nearby, Search Deals và vị trí tài trợ.": "CRM/SMS, OneQR, Ofertas cercanas, Buscar ofertas y espacios patrocinados.",
  "Thấy kết quả thật": "Mide resultados reales",
  "Theo dõi lượt xem, coupon, booking, redeem và doanh thu quy về campaign.": "Mide vistas, cupones, reservas, canjes e ingresos atribuidos a la campaña.",
  "Xem cách hoạt động": "Ver cómo funciona",
  "Tạo promotion": "Crear una promoción",
  "BẮT ĐẦU VỚI NEXORA": "COMIENZA CON NEXORA",
  "Chọn hành trình phù hợp với bạn": "Elige el recorrido adecuado para ti",
  "Khách hàng khám phá miễn phí. Doanh nghiệp tạo và quản lý chương trình trong Nexora Touch.": "Los clientes exploran gratis. Los negocios crean y administran programas en Nexora Touch.",
  "Tìm ưu đãi gần tôi": "Buscar ofertas cerca de mí",
  "Giải pháp cho doanh nghiệp": "Soluciones para negocios",
  "$5 OFF bữa trưa từ $25": "$5 OFF en almuerzo de $25+",
  "Túi bánh nướng hôm nay $7": "Bolsa de pan de hoy $7",
  "Combo người sáng lập $9": "Combo de apertura $9"
});

Object.assign(LANGUAGE_COPY["zh-TW"], {
  "Dành cho doanh nghiệp": "商家專區",
  "Dữ liệu minh họa": "示範數據",
  "HAI HÀNH TRÌNH · MỘT HỆ SINH THÁI": "兩種旅程 · 一個生態系",
  "Bạn đến để tìm ưu đãi hay để tăng khách?": "你要找優惠，還是為商家增加顧客？",
  "Nexora giữ trải nghiệm khách hàng đơn giản, đồng thời cho doanh nghiệp một luồng vận hành và đo lường thống nhất.": "Nexora 讓顧客體驗保持簡單，同時為商家提供整合的營運與成效衡量流程。",
  "DÀNH CHO KHÁCH HÀNG": "顧客專區",
  "Khám phá và dùng ưu đãi, không cần cài app": "無需安裝 App，即可探索並使用優惠",
  "Tìm đúng thứ bạn cần": "找到真正需要的服務",
  "Theo vị trí, ngành nghề, thời gian hoặc quét OneQR tại tiệm.": "依位置、產業、時間搜尋，或在商家掃描 OneQR。",
  "Giữ bằng số điện thoại": "以手機號碼領取",
  "Coupon và xác nhận được gửi qua SMS; điều kiện luôn hiển thị rõ.": "優惠券與確認訊息透過簡訊送達，條件清楚顯示。",
  "Dùng tại quầy hoặc đặt lịch": "到店兌換或預約",
  "Đưa mã xác minh, check-in hoặc hoàn tất booking với doanh nghiệp.": "向商家出示驗證碼、報到或完成預約。",
  "Tìm deal gần tôi": "尋找附近優惠",
  "Nói điều tôi cần": "告訴 Nexora 我的需求",
  "Tạo một lần, phân phối và đo lường trên toàn Nexora": "建立一次，即可在 Nexora 全平台分發並衡量",
  "Tạo trong Nexora Touch Promotion": "在 Nexora Touch Promotion 建立",
  "Chọn Deal, Coupon, Last Minute, mục tiêu và điều kiện sử dụng.": "選擇 Deal、Coupon 或 Last Minute，並設定目標與使用條件。",
  "Phân phối đúng kênh": "透過正確管道分發",
  "CRM/SMS, OneQR, Deal Nearby, Search Deals và vị trí tài trợ.": "CRM/簡訊、OneQR、附近優惠、搜尋優惠與贊助版位。",
  "Thấy kết quả thật": "看見可衡量的成果",
  "Theo dõi lượt xem, coupon, booking, redeem và doanh thu quy về campaign.": "追蹤瀏覽、優惠券、預約、兌換與活動歸因營收。",
  "Xem cách hoạt động": "查看運作方式",
  "Tạo promotion": "建立促銷活動",
  "BẮT ĐẦU VỚI NEXORA": "開始使用 NEXORA",
  "Chọn hành trình phù hợp với bạn": "選擇適合你的旅程",
  "Khách hàng khám phá miễn phí. Doanh nghiệp tạo và quản lý chương trình trong Nexora Touch.": "顧客可免費探索；商家在 Nexora Touch 建立並管理活動。",
  "Tìm ưu đãi gần tôi": "尋找附近優惠",
  "Giải pháp cho doanh nghiệp": "商家解決方案",
  "$5 OFF bữa trưa từ $25": "午餐滿 $25 減 $5",
  "Túi bánh nướng hôm nay $7": "今日烘焙袋 $7",
  "Combo người sáng lập $9": "創店優惠套餐 $9"
});

Object.assign(LANGUAGE_COPY.ko, {
  "Dành cho doanh nghiệp": "비즈니스용",
  "Dữ liệu minh họa": "예시 데이터",
  "HAI HÀNH TRÌNH · MỘT HỆ SINH THÁI": "두 가지 여정 · 하나의 생태계",
  "Bạn đến để tìm ưu đãi hay để tăng khách?": "혜택을 찾으시나요, 고객을 늘리고 싶으신가요?",
  "Nexora giữ trải nghiệm khách hàng đơn giản, đồng thời cho doanh nghiệp một luồng vận hành và đo lường thống nhất.": "Nexora는 고객 경험을 간단하게 유지하면서 비즈니스에 통합 운영 및 성과 측정 흐름을 제공합니다.",
  "DÀNH CHO KHÁCH HÀNG": "고객용",
  "Khám phá và dùng ưu đãi, không cần cài app": "앱 설치 없이 혜택을 찾고 사용하세요",
  "Tìm đúng thứ bạn cần": "필요한 서비스를 정확히 찾기",
  "Theo vị trí, ngành nghề, thời gian hoặc quét OneQR tại tiệm.": "위치, 업종, 시간으로 검색하거나 매장에서 OneQR을 스캔하세요.",
  "Giữ bằng số điện thoại": "전화번호로 혜택 받기",
  "Coupon và xác nhận được gửi qua SMS; điều kiện luôn hiển thị rõ.": "쿠폰과 확인 메시지는 SMS로 전송되며 이용 조건이 명확히 표시됩니다.",
  "Dùng tại quầy hoặc đặt lịch": "매장에서 사용하거나 예약하기",
  "Đưa mã xác minh, check-in hoặc hoàn tất booking với doanh nghiệp.": "인증 코드를 제시하고 체크인하거나 비즈니스와 예약을 완료하세요.",
  "Tìm deal gần tôi": "주변 혜택 찾기",
  "Nói điều tôi cần": "필요한 것 말하기",
  "Tạo một lần, phân phối và đo lường trên toàn Nexora": "한 번 만들고 Nexora 전체에서 배포 및 측정",
  "Tạo trong Nexora Touch Promotion": "Nexora Touch Promotion에서 만들기",
  "Chọn Deal, Coupon, Last Minute, mục tiêu và điều kiện sử dụng.": "Deal, Coupon 또는 Last Minute을 선택하고 목표와 조건을 설정하세요.",
  "Phân phối đúng kênh": "적절한 채널로 배포",
  "CRM/SMS, OneQR, Deal Nearby, Search Deals và vị trí tài trợ.": "CRM/SMS, OneQR, 주변 혜택, 혜택 검색 및 스폰서 영역.",
  "Thấy kết quả thật": "측정 가능한 결과 확인",
  "Theo dõi lượt xem, coupon, booking, redeem và doanh thu quy về campaign.": "조회, 쿠폰, 예약, 사용 및 캠페인 기여 매출을 추적하세요.",
  "Xem cách hoạt động": "작동 방식 보기",
  "Tạo promotion": "프로모션 만들기",
  "BẮT ĐẦU VỚI NEXORA": "NEXORA 시작하기",
  "Chọn hành trình phù hợp với bạn": "나에게 맞는 여정을 선택하세요",
  "Khách hàng khám phá miễn phí. Doanh nghiệp tạo và quản lý chương trình trong Nexora Touch.": "고객은 무료로 탐색하고 비즈니스는 Nexora Touch에서 프로그램을 만들고 관리합니다.",
  "Tìm ưu đãi gần tôi": "주변 혜택 찾기",
  "Giải pháp cho doanh nghiệp": "비즈니스 솔루션",
  "$5 OFF bữa trưa từ $25": "$25 이상 점심 $5 할인",
  "Túi bánh nướng hôm nay $7": "오늘의 베이커리 백 $7",
  "Combo người sáng lập $9": "오픈 기념 콤보 $9"
});

Object.assign(LANGUAGE_COPY.en, {
  "Coupon đã xác minh": "Verified coupons",
  "Phở 24 Bellaire · còn 3 ngày": "Phở 24 Bellaire · opens in 3 days",
  "Nguồn ưu đãi từ Nexora Touch": "Offers powered by Nexora Touch",
  "Doanh nghiệp tạo chương trình một lần, Nexora kiểm duyệt và đồng bộ đến đây.": "Businesses create a program once; Nexora reviews it and syncs it here.",
  "Xem luồng kết nối": "View connection flow",
  "Một phần của hệ sinh thái Nexora — từ khám phá đến booking và redeem.": "Part of the Nexora ecosystem — from discovery to booking and redemption.",
  "Vận hành bởi Nexora Touch LLC · Houston, Texas": "Operated by Nexora Touch LLC · Houston, Texas",
  "Tải ứng dụng": "Download the app",
  "Quét để tải Nexora Touch": "Scan to download Nexora Touch",
  "Quét QR tương ứng hoặc bấm vào App Store / Google Play.": "Scan the matching QR code or tap App Store / Google Play.",
  "Mở App Store": "Open App Store", "Mở Google Play": "Open Google Play",
  "Sản phẩm": "Products", "Đăng deal doanh nghiệp ↗": "Publish a business offer ↗",
  "Pháp lý": "Legal", "Khách chưa đăng ký": "Guest users", "Thành viên NEXORA ID": "NEXORA ID members",
  "Điều khoản sử dụng": "Terms of Use", "Quyền riêng tư": "Privacy",
  "Quy tắc nền tảng": "Platform rules", "Điều khoản doanh nghiệp": "Business Terms",
  "Nội dung được tài trợ": "Sponsored Content", "Điều khoản SMS": "SMS Terms"
});

Object.assign(LANGUAGE_COPY.es, {
  "Coupon đã xác minh": "Cupones verificados",
  "Phở 24 Bellaire · còn 3 ngày": "Phở 24 Bellaire · abre en 3 días",
  "Nguồn ưu đãi từ Nexora Touch": "Ofertas impulsadas por Nexora Touch",
  "Doanh nghiệp tạo chương trình một lần, Nexora kiểm duyệt và đồng bộ đến đây.": "El negocio crea el programa una vez; Nexora lo revisa y lo sincroniza aquí.",
  "Xem luồng kết nối": "Ver flujo de conexión",
  "Một phần của hệ sinh thái Nexora — từ khám phá đến booking và redeem.": "Parte del ecosistema Nexora: desde el descubrimiento hasta la reserva y el canje.",
  "Vận hành bởi Nexora Touch LLC · Houston, Texas": "Operado por Nexora Touch LLC · Houston, Texas",
  "Tải ứng dụng": "Descargar la aplicación",
  "Quét để tải Nexora Touch": "Escanea para descargar Nexora Touch",
  "Quét QR tương ứng hoặc bấm vào App Store / Google Play.": "Escanea el QR correspondiente o toca App Store / Google Play.",
  "Mở App Store": "Abrir App Store", "Mở Google Play": "Abrir Google Play",
  "Sản phẩm": "Productos", "Đăng deal doanh nghiệp ↗": "Publicar una oferta comercial ↗",
  "Pháp lý": "Legal", "Khách chưa đăng ký": "Usuarios invitados", "Thành viên NEXORA ID": "Miembros NEXORA ID",
  "Điều khoản sử dụng": "Términos de uso", "Quyền riêng tư": "Privacidad",
  "Quy tắc nền tảng": "Reglas de la plataforma", "Điều khoản doanh nghiệp": "Términos para negocios",
  "Nội dung được tài trợ": "Contenido patrocinado", "Điều khoản SMS": "Términos de SMS"
});

Object.assign(LANGUAGE_COPY["zh-TW"], {
  "Coupon đã xác minh": "已驗證優惠券",
  "Phở 24 Bellaire · còn 3 ngày": "Phở 24 Bellaire · 3 天後開幕",
  "Nguồn ưu đãi từ Nexora Touch": "由 Nexora Touch 提供的優惠",
  "Doanh nghiệp tạo chương trình một lần, Nexora kiểm duyệt và đồng bộ đến đây.": "商家只需建立一次活動，Nexora 審核後便會同步到這裡。",
  "Xem luồng kết nối": "查看連接流程",
  "Một phần của hệ sinh thái Nexora — từ khám phá đến booking và redeem.": "Nexora 生態系的一部分——從探索、預約到兌換。",
  "Vận hành bởi Nexora Touch LLC · Houston, Texas": "由 Nexora Touch LLC · Houston, Texas 營運",
  "Tải ứng dụng": "下載應用程式",
  "Quét để tải Nexora Touch": "掃描下載 Nexora Touch",
  "Quét QR tương ứng hoặc bấm vào App Store / Google Play.": "掃描對應的 QR Code，或點選 App Store / Google Play。",
  "Mở App Store": "開啟 App Store", "Mở Google Play": "開啟 Google Play",
  "Sản phẩm": "產品", "Đăng deal doanh nghiệp ↗": "發布商家優惠 ↗",
  "Pháp lý": "法律資訊", "Khách chưa đăng ký": "訪客", "Thành viên NEXORA ID": "NEXORA ID 會員",
  "Điều khoản sử dụng": "使用條款", "Quyền riêng tư": "隱私權",
  "Quy tắc nền tảng": "平台規則", "Điều khoản doanh nghiệp": "商家條款",
  "Nội dung được tài trợ": "贊助內容", "Điều khoản SMS": "簡訊條款"
});

Object.assign(LANGUAGE_COPY.ko, {
  "Coupon đã xác minh": "인증된 쿠폰",
  "Phở 24 Bellaire · còn 3 ngày": "Phở 24 Bellaire · 3일 후 오픈",
  "Nguồn ưu đãi từ Nexora Touch": "Nexora Touch가 제공하는 혜택",
  "Doanh nghiệp tạo chương trình một lần, Nexora kiểm duyệt và đồng bộ đến đây.": "비즈니스가 프로그램을 한 번 만들면 Nexora가 검토한 뒤 이곳에 동기화합니다.",
  "Xem luồng kết nối": "연결 흐름 보기",
  "Một phần của hệ sinh thái Nexora — từ khám phá đến booking và redeem.": "탐색부터 예약과 사용까지 이어지는 Nexora 생태계의 일부입니다.",
  "Vận hành bởi Nexora Touch LLC · Houston, Texas": "Nexora Touch LLC · Houston, Texas 운영",
  "Tải ứng dụng": "앱 다운로드",
  "Quét để tải Nexora Touch": "스캔하여 Nexora Touch 다운로드",
  "Quét QR tương ứng hoặc bấm vào App Store / Google Play.": "해당 QR 코드를 스캔하거나 App Store / Google Play을 누르세요.",
  "Mở App Store": "App Store 열기", "Mở Google Play": "Google Play 열기",
  "Sản phẩm": "제품", "Đăng deal doanh nghiệp ↗": "비즈니스 혜택 등록 ↗",
  "Pháp lý": "법적 고지", "Khách chưa đăng ký": "게스트 사용자", "Thành viên NEXORA ID": "NEXORA ID 회원",
  "Điều khoản sử dụng": "이용약관", "Quyền riêng tư": "개인정보 보호",
  "Quy tắc nền tảng": "플랫폼 규칙", "Điều khoản doanh nghiệp": "비즈니스 약관",
  "Nội dung được tài trợ": "스폰서 콘텐츠", "Điều khoản SMS": "SMS 약관"
});

Object.assign(LANGUAGE_COPY.en, {
  "Tăng khách với Nexora": "Grow with Nexora", "Khách khám phá miễn phí · Doanh nghiệp tạo và đo lường promotion trong Nexora Touch": "Customers discover for free · Businesses create and measure promotions in Nexora Touch", "Dùng vị trí": "Use location",
  "TỪ LƯU LƯỢNG SẴN CÓ ĐẾN KHÁCH MỚI": "TURN EXISTING TRAFFIC INTO NEW CUSTOMERS", "Xem Nexora có thể tạo ra gì cho doanh nghiệp của bạn": "See what Nexora can create for your business", "Mô phỏng theo lượt quét OneQR mỗi ngày, sau đó chọn ngành và mục tiêu để bắt đầu đúng luồng trong Nexora Touch.": "Estimate from daily OneQR scans, then choose your industry and goal to start in the right Nexora Touch flow.",
  "MÔ PHỎNG TĂNG TRƯỞNG": "GROWTH ESTIMATE", "Lượt quét OneQR mỗi ngày": "Daily OneQR scans", "lượt quét / tháng": "scans / month", "mở trang khám phá": "discovery opens", "tương tác hợp lệ": "qualified interactions", "booking có thể quy về": "attributable bookings", "Ước tính minh họa, không phải cam kết kết quả. Tỷ lệ thực tế thay đổi theo ngành, vị trí, ưu đãi và lưu lượng của từng doanh nghiệp.": "Illustrative estimate, not a result guarantee. Actual rates vary by industry, location, offer and business traffic.",
  "CHỌN ĐIỂM BẮT ĐẦU": "CHOOSE YOUR START", "Nhận lộ trình phù hợp với ngành và mục tiêu": "Get a path matched to your industry and goal", "Ngành nghề": "Industry", "City hoặc ZIP": "City or ZIP", "Mục tiêu chính": "Primary goal", "Nhà hàng & ăn uống": "Restaurants & food", "Tóc & barber": "Hair & barber", "Spa & massage": "Spa & massage", "Bán lẻ & chợ": "Retail & market", "Ngành khác": "Other industry", "Thu hút khách mới": "Attract new customers", "Lấp lịch hoặc công suất trống": "Fill open capacity", "Kéo khách cũ quay lại": "Bring customers back", "Tạo thêm giá trị từ OneQR": "Create more value from OneQR", "Bắt đầu với Nexora Touch": "Get started with Nexora Touch", "Xem Campaign Studio": "View Campaign Studio", "Không cần cài app cho khách; doanh nghiệp giữ quyền kiểm soát giá, số lượng và điều kiện.": "No customer app required; businesses keep control of pricing, quantity and terms.",
  "Xem bản demo Campaign Studio": "View Campaign Studio demo", "Tạo promotion ngay": "Create a promotion now", "KỊCH BẢN MẪU · SALON 8 GHẾ": "SAMPLE SCENARIO · 8-CHAIR SALON", "30 ngày · mục tiêu lấp lịch Mon–Thu": "30 days · goal: fill Mon–Thu", "Bắt đầu tăng khách": "Start growing", "Tìm deal": "Find deals", "Tăng khách": "Grow business"
});
Object.assign(LANGUAGE_COPY.es, {
  "Tăng khách với Nexora": "Atrae clientes con Nexora", "Khách khám phá miễn phí · Doanh nghiệp tạo và đo lường promotion trong Nexora Touch": "Los clientes exploran gratis · Los negocios crean y miden promociones en Nexora Touch", "Dùng vị trí": "Usar ubicación",
  "TỪ LƯU LƯỢNG SẴN CÓ ĐẾN KHÁCH MỚI": "CONVIERTE TU TRÁFICO EN CLIENTES", "Xem Nexora có thể tạo ra gì cho doanh nghiệp của bạn": "Descubre lo que Nexora puede crear para tu negocio", "Mô phỏng theo lượt quét OneQR mỗi ngày, sau đó chọn ngành và mục tiêu để bắt đầu đúng luồng trong Nexora Touch.": "Estima desde los escaneos diarios de OneQR y elige tu sector y objetivo para comenzar en Nexora Touch.",
  "MÔ PHỎNG TĂNG TRƯỞNG": "ESTIMACIÓN DE CRECIMIENTO", "Lượt quét OneQR mỗi ngày": "Escaneos OneQR diarios", "lượt quét / tháng": "escaneos / mes", "mở trang khám phá": "aperturas de descubrimiento", "tương tác hợp lệ": "interacciones calificadas", "booking có thể quy về": "reservas atribuibles", "Ước tính minh họa, không phải cam kết kết quả. Tỷ lệ thực tế thay đổi theo ngành, vị trí, ưu đãi và lưu lượng của từng doanh nghiệp.": "Estimación ilustrativa, no una garantía. Los resultados varían por sector, ubicación, oferta y tráfico.",
  "CHỌN ĐIỂM BẮT ĐẦU": "ELIGE DÓNDE COMENZAR", "Nhận lộ trình phù hợp với ngành và mục tiêu": "Recibe una ruta según tu sector y objetivo", "Ngành nghề": "Sector", "City hoặc ZIP": "Ciudad o código postal", "Mục tiêu chính": "Objetivo principal", "Nhà hàng & ăn uống": "Restaurantes y comida", "Tóc & barber": "Cabello y barbería", "Spa & massage": "Spa y masajes", "Bán lẻ & chợ": "Retail y mercado", "Ngành khác": "Otro sector", "Thu hút khách mới": "Atraer nuevos clientes", "Lấp lịch hoặc công suất trống": "Llenar capacidad disponible", "Kéo khách cũ quay lại": "Recuperar clientes", "Tạo thêm giá trị từ OneQR": "Crear más valor con OneQR", "Bắt đầu với Nexora Touch": "Comenzar con Nexora Touch", "Xem Campaign Studio": "Ver Campaign Studio", "Không cần cài app cho khách; doanh nghiệp giữ quyền kiểm soát giá, số lượng và điều kiện.": "Sin app para el cliente; el negocio controla precios, cantidades y condiciones.",
  "Xem bản demo Campaign Studio": "Ver demo de Campaign Studio", "Tạo promotion ngay": "Crear promoción ahora", "KỊCH BẢN MẪU · SALON 8 GHẾ": "ESCENARIO DE MUESTRA · SALÓN DE 8 SILLAS", "30 ngày · mục tiêu lấp lịch Mon–Thu": "30 días · objetivo: llenar lun–jue", "Bắt đầu tăng khách": "Empezar a crecer", "Tìm deal": "Buscar ofertas", "Tăng khách": "Atraer clientes"
});
Object.assign(LANGUAGE_COPY["zh-TW"], {
  "Tăng khách với Nexora": "用 Nexora 增加顧客", "Khách khám phá miễn phí · Doanh nghiệp tạo và đo lường promotion trong Nexora Touch": "顧客免費探索 · 商家在 Nexora Touch 建立並衡量促銷", "Dùng vị trí": "使用位置",
  "TỪ LƯU LƯỢNG SẴN CÓ ĐẾN KHÁCH MỚI": "把既有流量變成新顧客", "Xem Nexora có thể tạo ra gì cho doanh nghiệp của bạn": "看看 Nexora 能為你的商家帶來什麼", "Mô phỏng theo lượt quét OneQR mỗi ngày, sau đó chọn ngành và mục tiêu để bắt đầu đúng luồng trong Nexora Touch.": "依每日 OneQR 掃描量試算，再選擇產業與目標，進入合適的 Nexora Touch 流程。", "MÔ PHỎNG TĂNG TRƯỞNG": "成長試算", "Lượt quét OneQR mỗi ngày": "每日 OneQR 掃描", "lượt quét / tháng": "每月掃描", "mở trang khám phá": "開啟探索頁", "tương tác hợp lệ": "有效互動", "booking có thể quy về": "可歸因預約", "Ước tính minh họa, không phải cam kết kết quả. Tỷ lệ thực tế thay đổi theo ngành, vị trí, ưu đãi và lưu lượng của từng doanh nghiệp.": "僅為示範估算，不保證結果；實際成效依產業、位置、優惠與流量而異。",
  "CHỌN ĐIỂM BẮT ĐẦU": "選擇起點", "Nhận lộ trình phù hợp với ngành và mục tiêu": "取得符合產業與目標的路徑", "Ngành nghề": "產業", "City hoặc ZIP": "城市或郵遞區號", "Mục tiêu chính": "主要目標", "Nhà hàng & ăn uống": "餐廳與餐飲", "Tóc & barber": "美髮與理髮", "Spa & massage": "SPA 與按摩", "Bán lẻ & chợ": "零售與市場", "Ngành khác": "其他產業", "Thu hút khách mới": "吸引新顧客", "Lấp lịch hoặc công suất trống": "填補空檔與產能", "Kéo khách cũ quay lại": "召回舊顧客", "Tạo thêm giá trị từ OneQR": "提升 OneQR 價值", "Bắt đầu với Nexora Touch": "開始使用 Nexora Touch", "Xem Campaign Studio": "查看 Campaign Studio", "Không cần cài app cho khách; doanh nghiệp giữ quyền kiểm soát giá, số lượng và điều kiện.": "顧客無需安裝 App；商家保有價格、數量與條件控制權。", "Xem bản demo Campaign Studio": "查看 Campaign Studio 示範", "Tạo promotion ngay": "立即建立促銷", "KỊCH BẢN MẪU · SALON 8 GHẾ": "示範情境 · 8 席沙龍", "30 ngày · mục tiêu lấp lịch Mon–Thu": "30 天 · 目標：填滿週一至週四", "Bắt đầu tăng khách": "開始增加顧客", "Tìm deal": "找優惠", "Tăng khách": "增加顧客"
});
Object.assign(LANGUAGE_COPY.ko, {
  "Tăng khách với Nexora": "Nexora로 고객 늘리기", "Khách khám phá miễn phí · Doanh nghiệp tạo và đo lường promotion trong Nexora Touch": "고객은 무료 탐색 · 비즈니스는 Nexora Touch에서 프로모션 생성 및 측정", "Dùng vị trí": "현재 위치",
  "TỪ LƯU LƯỢNG SẴN CÓ ĐẾN KHÁCH MỚI": "기존 트래픽을 신규 고객으로", "Xem Nexora có thể tạo ra gì cho doanh nghiệp của bạn": "Nexora가 비즈니스에 만들 수 있는 가치를 확인하세요", "Mô phỏng theo lượt quét OneQR mỗi ngày, sau đó chọn ngành và mục tiêu để bắt đầu đúng luồng trong Nexora Touch.": "일일 OneQR 스캔을 기준으로 추정한 뒤 업종과 목표를 선택해 Nexora Touch에서 시작하세요.", "MÔ PHỎNG TĂNG TRƯỞNG": "성장 추정", "Lượt quét OneQR mỗi ngày": "일일 OneQR 스캔", "lượt quét / tháng": "월간 스캔", "mở trang khám phá": "탐색 페이지 열기", "tương tác hợp lệ": "유효 상호작용", "booking có thể quy về": "기여 예약", "Ước tính minh họa, không phải cam kết kết quả. Tỷ lệ thực tế thay đổi theo ngành, vị trí, ưu đãi và lưu lượng của từng doanh nghiệp.": "예시 추정치이며 결과를 보장하지 않습니다. 실제 비율은 업종, 위치, 혜택 및 트래픽에 따라 달라집니다.",
  "CHỌN ĐIỂM BẮT ĐẦU": "시작점 선택", "Nhận lộ trình phù hợp với ngành và mục tiêu": "업종과 목표에 맞는 경로 받기", "Ngành nghề": "업종", "City hoặc ZIP": "도시 또는 ZIP", "Mục tiêu chính": "주요 목표", "Nhà hàng & ăn uống": "레스토랑 및 식음료", "Tóc & barber": "헤어 및 바버", "Spa & massage": "스파 및 마사지", "Bán lẻ & chợ": "리테일 및 마켓", "Ngành khác": "기타 업종", "Thu hút khách mới": "신규 고객 유치", "Lấp lịch hoặc công suất trống": "빈 예약 및 용량 채우기", "Kéo khách cũ quay lại": "기존 고객 재방문", "Tạo thêm giá trị từ OneQR": "OneQR 가치 확대", "Bắt đầu với Nexora Touch": "Nexora Touch 시작", "Xem Campaign Studio": "Campaign Studio 보기", "Không cần cài app cho khách; doanh nghiệp giữ quyền kiểm soát giá, số lượng và điều kiện.": "고객 앱 설치 없이 비즈니스가 가격, 수량 및 조건을 직접 관리합니다.", "Xem bản demo Campaign Studio": "Campaign Studio 데모 보기", "Tạo promotion ngay": "지금 프로모션 만들기", "KỊCH BẢN MẪU · SALON 8 GHẾ": "샘플 시나리오 · 8석 살롱", "30 ngày · mục tiêu lấp lịch Mon–Thu": "30일 · 월–목 예약 채우기", "Bắt đầu tăng khách": "성장 시작", "Tìm deal": "혜택 찾기", "Tăng khách": "고객 늘리기"
});

Object.assign(LANGUAGE_COPY.en, {
  "Đóng": "Close",
  "Thời gian áp dụng": "Valid hours", "Địa điểm": "Location", "Còn lại": "Availability", "Điều kiện chính": "Key terms", "♡ Lưu": "♡ Save", "Đặt lịch ↗": "Book now ↗", "Deal được đồng bộ từ Nexora Touch · Nexora là nguồn dữ liệu chính thức": "Offer synced from Nexora Touch · Nexora is the official data source",
  "LẤY COUPON · KHÔNG CẦN APP": "GET COUPON · NO APP REQUIRED",
  "Giữ coupon bằng số điện thoại": "Reserve a coupon by phone",
  "Nhập SĐT": "Enter phone number",
  "Giữ một suất": "Reserve one spot",
  "Nhận SMS": "Receive SMS",
  "Số điện thoại": "Phone number",
  "Tôi đồng ý nhận SMS xác nhận coupon này. Có thể trả lời STOP để dừng.": "I agree to receive an SMS confirmation for this coupon. Reply STOP to opt out.",
  "Giữ coupon và gửi SMS": "Reserve coupon and send SMS",
  "SĐT được chuẩn hoá và bảo vệ. POS dùng SĐT để kiểm tra điều kiện, giới hạn mỗi người và redeem.": "Your phone number is protected. The business uses it to verify eligibility, per-person limits and redemption.",
  "Đã giữ coupon": "Coupon reserved",
  "SẮP KHAI TRƯƠNG · KHÔNG CẦN APP": "GRAND OPENING · NO APP REQUIRED",
  "Giữ chỗ ngày mở cửa": "Reserve an opening-day spot",
  "Tôi đồng ý nhận SMS xác nhận và nhắc lịch khai trương. Có thể trả lời STOP để dừng.": "I agree to receive an SMS confirmation and opening-day reminder. Reply STOP to opt out.",
  "Giữ chỗ và nhận SMS": "Reserve a spot and receive SMS",
  "Không phát mã coupon trước ngày mở cửa. SĐT được chuẩn hoá và bảo vệ.": "Coupons are not issued before opening day. Your phone number is protected.",
  "Đã giữ chỗ": "Spot reserved",
  "Hoàn tất": "Done",
});

const LANGUAGE_PLACEHOLDERS = {
  vi: { location: "City hoặc ZIP", businessCity: "Houston, TX hoặc 77057" },
  en: { location: "City or ZIP", businessCity: "Houston, TX or 77057" },
  es: { location: "Ciudad o código postal", businessCity: "Houston, TX o 77057" },
  "zh-TW": { location: "城市或郵遞區號", businessCity: "Houston, TX 或 77057" },
  ko: { location: "도시 또는 ZIP", businessCity: "Houston, TX 또는 77057" }
};

const AI_GUIDE_COPY = {
  vi: {
    label: "Hỏi Nexora AI", fab: "Trợ lý AI", nudgeTitle: "Chưa biết bắt đầu từ đâu?", nudgeCopy: "Trợ lý Nexora đưa bạn đến đúng chức năng chỉ trong vài bước.", nudgeAction: "Bắt đầu",
    eyebrow: "NEXORA AI CONCIERGE", title: "Tôi có thể giúp bạn bắt đầu đúng chỗ", intro: "Chọn một mục tiêu hoặc mô tả điều bạn cần. Nexora sẽ chuẩn bị lộ trình và bộ lọc phù hợp.", trust: "KHÔNG CẦN ĐĂNG NHẬP", agentName: "NEXORA CONCIERGE", message: "Chào bạn. Hãy chọn mục tiêu gần nhất với điều bạn muốn làm.", selectedMessage: "Đã hiểu. Bạn có thể thêm dịch vụ hoặc khu vực để lộ trình chính xác hơn.",
    step1: "Mục tiêu", step1Copy: "Chọn hướng đi", step2: "Nhu cầu", step2Copy: "Thêm chi tiết", step3: "Kết quả", step3Copy: "Mở đúng công cụ", choiceTitle: "Bạn muốn làm gì?", choiceCopy: "Chọn một mục để Nexora chuẩn bị bước tiếp theo.", detailTitle: "Thêm chi tiết để gợi ý chính xác hơn", detailCopy: "Không bắt buộc — bạn có thể tạo lộ trình ngay.",
    nearby: "Deal gần tôi", nearbyCopy: "Ưu đãi theo vị trí hiện tại", today: "Ưu đãi hôm nay", todayCopy: "Giờ trống và hàng còn tốt", request: "Nói điều tôi cần", requestCopy: "Khớp nhu cầu, giá và khu vực", coupon: "Tìm coupon", couponCopy: "Theo ngành và dịch vụ", business: "Tôi là doanh nghiệp", businessCopy: "Tạo và phân phối promotion",
    needLabel: "Dịch vụ, mức giá hoặc thời gian", needPlaceholder: "Ví dụ: pedicure dưới $40 chiều nay", areaLabel: "Khu vực", areaPlaceholder: "City hoặc ZIP", submit: "Tạo lộ trình", resultKicker: "LỘ TRÌNH ĐỀ XUẤT", whyLabel: "VÌ SAO PHÙ HỢP", reset: "Chọn lại", privacy: "Nội dung bạn nhập chỉ dùng để định tuyến trong phiên này. Vị trí chỉ được xin khi bạn chọn tìm gần mình.",
    reasons: { nearby: "Ưu tiên khoảng cách và các ưu đãi đã được xác minh quanh bạn.", today: "Ưu tiên thời gian còn lại, giờ trống và khả năng nhận trong ngày.", request: "Phù hợp khi nhu cầu có nhiều điều kiện như giá, thời gian hoặc nhiều khu vực.", coupon: "Phù hợp khi bạn muốn lưu mã có số lượng, thời hạn và điều kiện rõ ràng.", business: "Mở đúng không gian để tạo, phân phối và đo hiệu quả chương trình." },
    routes: {
      nearby: ["Deal Nearby", "Xem ưu đãi đã xác minh quanh khu vực của bạn.", "Mở Deal Nearby"],
      today: ["Last Minute", "Tìm lịch trống và hàng còn tốt cần được bán trong hôm nay.", "Xem ưu đãi hôm nay"],
      request: ["Deal Match", "Mô tả nhu cầu, ngân sách và nhiều khu vực để Nexora tìm đúng kết quả.", "Mở Deal Match"],
      coupon: ["Coupon theo ngành", "Duyệt coupon có số lượng, thời hạn và điều kiện rõ ràng.", "Xem coupon"],
      business: ["Nexora Touch cho doanh nghiệp", "Tạo Deal, Coupon, Last Minute và chọn kênh phân phối trong Promotion Studio.", "Mở công cụ doanh nghiệp"]
    }
  },
  en: {
    label: "Ask Nexora AI", fab: "AI Guide", nudgeTitle: "Not sure where to start?", nudgeCopy: "Nexora guides you to the right experience in a few simple steps.", nudgeAction: "Start",
    eyebrow: "NEXORA AI CONCIERGE", title: "Let’s get you to the right place", intro: "Choose a goal or describe what you need. Nexora will prepare the right path and filters.", trust: "NO SIGN-IN REQUIRED", agentName: "NEXORA CONCIERGE", message: "Welcome. Choose the goal that best matches what you want to do.", selectedMessage: "Got it. Add a service or area if you want a more precise route.",
    step1: "Goal", step1Copy: "Choose a direction", step2: "Details", step2Copy: "Refine the need", step3: "Result", step3Copy: "Open the right tool", choiceTitle: "What would you like to do?", choiceCopy: "Choose one option and Nexora will prepare the next step.", detailTitle: "Add details for a more precise recommendation", detailCopy: "Optional — you can create your route now.",
    nearby: "Deals near me", nearbyCopy: "Offers based on your location", today: "Offers for today", todayCopy: "Open slots and fresh surplus", request: "Tell me what I need", requestCopy: "Match needs, price and areas", coupon: "Find coupons", couponCopy: "By category and service", business: "I run a business", businessCopy: "Create and distribute promotions",
    needLabel: "Service, budget or time", needPlaceholder: "Example: pedicure under $40 today", areaLabel: "Area", areaPlaceholder: "City or ZIP", submit: "Create my route", resultKicker: "RECOMMENDED PATH", whyLabel: "WHY IT FITS", reset: "Start over", privacy: "What you enter is used only to route this session. Location is requested only when you choose nearby search.",
    reasons: { nearby: "Prioritizes distance and verified offers around you.", today: "Prioritizes remaining time, open appointments and same-day pickup.", request: "Best for needs with multiple conditions such as budget, timing or several areas.", coupon: "Best when you want a saved code with clear quantity, expiration and terms.", business: "Opens the right workspace to create, distribute and measure a promotion." },
    routes: {
      nearby: ["Deals Nearby", "See verified offers around your selected area.", "Open Deals Nearby"], today: ["Last Minute", "Find open appointments and good items available today.", "See today’s offers"], request: ["Deal Match", "Describe your need, budget and multiple areas for a focused match.", "Open Deal Match"], coupon: ["Coupons by category", "Browse coupons with clear quantity, expiration and terms.", "View coupons"], business: ["Nexora Touch for business", "Create Deals, Coupons and Last Minute offers, then choose distribution channels.", "Open business tools"]
    }
  },
  es: {
    label: "Preguntar a Nexora AI", fab: "Guía AI", nudgeTitle: "¿No sabes por dónde empezar?", nudgeCopy: "Nexora te lleva a la experiencia correcta en pocos pasos.", nudgeAction: "Comenzar",
    eyebrow: "NEXORA AI CONCIERGE", title: "Te ayudamos a comenzar en el lugar correcto", intro: "Elige un objetivo o describe lo que necesitas. Nexora preparará la ruta y los filtros adecuados.", trust: "SIN INICIAR SESIÓN", agentName: "NEXORA CONCIERGE", message: "Bienvenido. Elige el objetivo que mejor coincida con lo que deseas hacer.", selectedMessage: "Entendido. Añade un servicio o una zona si quieres una ruta más precisa.",
    step1: "Objetivo", step1Copy: "Elige una dirección", step2: "Detalles", step2Copy: "Afina la necesidad", step3: "Resultado", step3Copy: "Abre la herramienta", choiceTitle: "¿Qué quieres hacer?", choiceCopy: "Elige una opción y Nexora preparará el siguiente paso.", detailTitle: "Añade detalles para una recomendación más precisa", detailCopy: "Opcional — puedes crear la ruta ahora.",
    nearby: "Ofertas cerca de mí", nearbyCopy: "Según tu ubicación", today: "Ofertas de hoy", todayCopy: "Citas y productos disponibles", request: "Decir lo que necesito", requestCopy: "Combina necesidad, precio y zonas", coupon: "Buscar cupones", couponCopy: "Por categoría y servicio", business: "Tengo un negocio", businessCopy: "Crear y distribuir promociones",
    needLabel: "Servicio, presupuesto u horario", needPlaceholder: "Ejemplo: pedicure por menos de $40 hoy", areaLabel: "Zona", areaPlaceholder: "Ciudad o código postal", submit: "Crear mi ruta", resultKicker: "RUTA RECOMENDADA", whyLabel: "POR QUÉ ENCAJA", reset: "Elegir de nuevo", privacy: "Lo que escribes solo se usa para dirigir esta sesión. La ubicación se solicita únicamente al buscar cerca.",
    reasons: { nearby: "Prioriza la distancia y las ofertas verificadas a tu alrededor.", today: "Prioriza el tiempo restante, las citas libres y la recogida hoy.", request: "Ideal para necesidades con varias condiciones como presupuesto, horario o zonas.", coupon: "Ideal para guardar un código con cantidad, vencimiento y condiciones claras.", business: "Abre el espacio correcto para crear, distribuir y medir una promoción." },
    routes: {
      nearby: ["Ofertas cercanas", "Mira ofertas verificadas alrededor de tu zona.", "Abrir ofertas cercanas"], today: ["Last Minute", "Encuentra citas libres y productos disponibles hoy.", "Ver ofertas de hoy"], request: ["Deal Match", "Describe tu necesidad, presupuesto y varias zonas para encontrar coincidencias.", "Abrir Deal Match"], coupon: ["Cupones por categoría", "Explora cupones con cantidad, vencimiento y condiciones claras.", "Ver cupones"], business: ["Nexora Touch para negocios", "Crea ofertas, cupones y Last Minute, y elige los canales de distribución.", "Abrir herramientas"]
    }
  },
  "zh-TW": {
    label: "詢問 Nexora AI", fab: "AI 導覽", nudgeTitle: "不確定從哪裡開始？", nudgeCopy: "Nexora 只需幾個步驟即可帶你前往正確功能。", nudgeAction: "開始",
    eyebrow: "NEXORA AI CONCIERGE", title: "帶你從正確的位置開始", intro: "選擇目標或描述需求，Nexora 會準備合適的路徑與篩選條件。", trust: "無需登入", agentName: "NEXORA CONCIERGE", message: "歡迎。請選擇最符合你目前需求的目標。", selectedMessage: "了解。如需更精準的路徑，可加入服務或地區。",
    step1: "目標", step1Copy: "選擇方向", step2: "需求", step2Copy: "補充細節", step3: "結果", step3Copy: "開啟正確工具", choiceTitle: "你想做什麼？", choiceCopy: "選擇一項，Nexora 會準備下一步。", detailTitle: "加入細節以獲得更精準的建議", detailCopy: "非必填 — 現在即可建立路徑。",
    nearby: "附近優惠", nearbyCopy: "依目前位置", today: "今日優惠", todayCopy: "空檔與當日好物", request: "說出我的需求", requestCopy: "配對需求、價格與地區", coupon: "尋找優惠券", couponCopy: "依分類與服務", business: "我是商家", businessCopy: "建立與分發活動",
    needLabel: "服務、預算或時間", needPlaceholder: "例如：今天 $40 以下的足部護理", areaLabel: "地區", areaPlaceholder: "城市或郵遞區號", submit: "建立我的路徑", resultKicker: "建議路徑", whyLabel: "適合原因", reset: "重新選擇", privacy: "輸入內容只用於本次導覽。只有選擇附近搜尋時才會要求位置。",
    reasons: { nearby: "優先顯示你周邊的距離與已驗證優惠。", today: "優先考量剩餘時間、可預約空檔與當日取貨。", request: "適合包含預算、時間或多個地區等多重條件的需求。", coupon: "適合儲存數量、期限與條件清楚的優惠碼。", business: "開啟正確工作區，以建立、分發並衡量活動成效。" },
    routes: {
      nearby: ["附近優惠", "查看你所選地區附近的驗證優惠。", "開啟附近優惠"], today: ["Last Minute", "尋找今天可預約的空檔與當日可取商品。", "查看今日優惠"], request: ["Deal Match", "描述需求、預算與多個地區，取得精準配對。", "開啟 Deal Match"], coupon: ["分類優惠券", "瀏覽數量、期限和條件清楚的優惠券。", "查看優惠券"], business: ["Nexora Touch 商家工具", "建立 Deal、Coupon、Last Minute 並選擇分發管道。", "開啟商家工具"]
    }
  },
  ko: {
    label: "Nexora AI에 질문", fab: "AI 가이드", nudgeTitle: "어디서 시작할지 모르시나요?", nudgeCopy: "Nexora가 몇 단계 안에 알맞은 기능으로 안내합니다.", nudgeAction: "시작",
    eyebrow: "NEXORA AI CONCIERGE", title: "알맞은 곳에서 시작하도록 도와드릴게요", intro: "목표를 선택하거나 필요한 것을 설명하면 Nexora가 경로와 필터를 준비합니다.", trust: "로그인 없이 이용", agentName: "NEXORA CONCIERGE", message: "환영합니다. 하려는 일과 가장 가까운 목표를 선택하세요.", selectedMessage: "알겠습니다. 더 정확한 경로를 원하면 서비스나 지역을 추가하세요.",
    step1: "목표", step1Copy: "방향 선택", step2: "세부 정보", step2Copy: "필요 정리", step3: "결과", step3Copy: "도구 열기", choiceTitle: "무엇을 하고 싶으신가요?", choiceCopy: "하나를 선택하면 Nexora가 다음 단계를 준비합니다.", detailTitle: "더 정확한 추천을 위한 세부 정보", detailCopy: "선택 사항 — 지금 바로 경로를 만들 수 있습니다.",
    nearby: "내 주변 혜택", nearbyCopy: "현재 위치 기준", today: "오늘의 혜택", todayCopy: "빈 예약과 당일 상품", request: "필요한 것 말하기", requestCopy: "필요·가격·지역 매칭", coupon: "쿠폰 찾기", couponCopy: "업종 및 서비스별", business: "비즈니스를 운영해요", businessCopy: "프로모션 생성 및 배포",
    needLabel: "서비스, 예산 또는 시간", needPlaceholder: "예: 오늘 $40 이하 페디큐어", areaLabel: "지역", areaPlaceholder: "도시 또는 ZIP", submit: "경로 만들기", resultKicker: "추천 경로", whyLabel: "적합한 이유", reset: "다시 선택", privacy: "입력 내용은 이번 안내 경로에만 사용됩니다. 주변 검색을 선택할 때만 위치를 요청합니다.",
    reasons: { nearby: "주변 거리와 인증된 혜택을 우선합니다.", today: "남은 시간, 빈 예약과 당일 픽업을 우선합니다.", request: "예산, 시간 또는 여러 지역 등 조건이 많은 요구에 적합합니다.", coupon: "수량, 만료일과 조건이 명확한 코드를 저장할 때 적합합니다.", business: "프로모션을 만들고 배포하며 성과를 측정할 작업 공간을 엽니다." },
    routes: {
      nearby: ["내 주변 혜택", "선택한 지역 주변의 인증 혜택을 확인하세요.", "주변 혜택 열기"], today: ["Last Minute", "오늘 가능한 빈 예약과 좋은 당일 상품을 찾으세요.", "오늘 혜택 보기"], request: ["Deal Match", "필요 사항, 예산, 여러 지역을 입력해 정확히 매칭하세요.", "Deal Match 열기"], coupon: ["업종별 쿠폰", "수량, 만료일과 조건이 명확한 쿠폰을 살펴보세요.", "쿠폰 보기"], business: ["Nexora Touch 비즈니스", "Deal, Coupon, Last Minute를 만들고 배포 채널을 선택하세요.", "비즈니스 도구 열기"]
    }
  }
};

function getAIGuideCopy(language = document.querySelector("#languageSelect")?.value || "en") {
  return AI_GUIDE_COPY[language] || AI_GUIDE_COPY.vi;
}

function updateAIGuideLanguage(language) {
  const copy = getAIGuideCopy(language);
  const values = {
    "[data-ai-label]": copy.label, "[data-ai-fab-label]": copy.fab, "[data-ai-nudge-title]": copy.nudgeTitle, "[data-ai-nudge-copy]": copy.nudgeCopy, "[data-ai-nudge-action]": copy.nudgeAction,
    "[data-ai-eyebrow]": copy.eyebrow, "[data-ai-title]": copy.title, "[data-ai-intro]": copy.intro, "[data-ai-trust]": copy.trust, "[data-ai-agent-name]": copy.agentName, "[data-ai-message]": copy.message,
    "[data-ai-step1]": copy.step1, "[data-ai-step1-copy]": copy.step1Copy, "[data-ai-step2]": copy.step2, "[data-ai-step2-copy]": copy.step2Copy, "[data-ai-step3]": copy.step3, "[data-ai-step3-copy]": copy.step3Copy,
    "[data-ai-choice-title]": copy.choiceTitle, "[data-ai-choice-copy]": copy.choiceCopy, "[data-ai-detail-title]": copy.detailTitle, "[data-ai-detail-copy]": copy.detailCopy,
    "[data-ai-option-nearby]": copy.nearby, "[data-ai-option-nearby-copy]": copy.nearbyCopy, "[data-ai-option-today]": copy.today, "[data-ai-option-today-copy]": copy.todayCopy,
    "[data-ai-option-request]": copy.request, "[data-ai-option-request-copy]": copy.requestCopy, "[data-ai-option-coupon]": copy.coupon, "[data-ai-option-coupon-copy]": copy.couponCopy,
    "[data-ai-option-business]": copy.business, "[data-ai-option-business-copy]": copy.businessCopy, "[data-ai-need-label]": copy.needLabel, "[data-ai-area-label]": copy.areaLabel,
    "[data-ai-submit]": copy.submit, "[data-ai-result-kicker]": copy.resultKicker, "[data-ai-why-label]": copy.whyLabel, "[data-ai-reset]": copy.reset, "[data-ai-privacy]": copy.privacy
  };
  Object.entries(values).forEach(([selector, value]) => document.querySelectorAll(selector).forEach((node) => { node.textContent = value; }));
  const form = document.querySelector("#aiGuideForm");
  form?.querySelector('[name="need"]')?.setAttribute("placeholder", copy.needPlaceholder);
  form?.querySelector('[name="area"]')?.setAttribute("placeholder", copy.areaPlaceholder);
  const result = document.querySelector("#aiGuideResult");
  if (result && !result.hidden) renderAIGuideResult(result.dataset.intent || "request");
}

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
  const translated = language === "vi" ? key : (LANGUAGE_COPY[language]?.[key] || window.NEXORA_DEAL_PRESENTATION?.translate(key) || translateDynamicLabel(key, language));
  if (node.parentElement?.tagName === "OPTION" && !node.parentElement.hasAttribute("value")) node.parentElement.setAttribute("value", key);
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
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);
}

function applyLanguage(language, { announce = false } = {}) {
  const activeLanguage = "en";
  document.documentElement.lang = "en-US";
  document.documentElement.dataset.locale = NEXORA_LOCALE[activeLanguage];
  localStorage.setItem("nexora-language", activeLanguage);
  const compactLanguageCode = document.querySelector("#languageCode");
  if (compactLanguageCode) compactLanguageCode.textContent = NEXORA_LANGUAGE_CODES[activeLanguage];
  translateDocument(activeLanguage);
  [dealDialog, couponClaimDialog, openingHoldDialog].forEach((dialog) => dialog?.querySelector(".dialog-close")?.setAttribute("aria-label", activeLanguage === "en" ? "Close" : "Đóng"));
  document.querySelector(".coupon-claim-steps")?.setAttribute("aria-label", activeLanguage === "en" ? "How to claim a coupon" : "Quy trình lấy coupon");
  const chromeCopy = activeLanguage === "en" ? {
    skip: "Skip navigation and go to main content", home: "Nexora Deals home", primary: "Primary navigation",
    languageControl: "Nexora account language", languageSelect: "Choose language", dealsMenu: "Deals and coupons menu",
    aiGuide: "Open Nexora AI Guide"
  } : {
    skip: "Bỏ qua menu, đến nội dung chính", home: "Trang chủ Nexora Deals", primary: "Điều hướng chính",
    languageControl: "Ngôn ngữ tài khoản Nexora", languageSelect: "Chọn ngôn ngữ", dealsMenu: "Menu Ưu đãi và Mã giảm",
    aiGuide: "Mở Nexora AI Guide"
  };
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) skipLink.textContent = chromeCopy.skip;
  document.querySelector(".brand")?.setAttribute("aria-label", chromeCopy.home);
  document.querySelector(".desktop-nav")?.setAttribute("aria-label", chromeCopy.primary);
  document.querySelector(".language-control")?.setAttribute("aria-label", chromeCopy.languageControl);
  document.querySelector("#languageSelect")?.setAttribute("aria-label", chromeCopy.languageSelect);
  document.querySelector(".deal-subnav:not(.wishlist-subnav)")?.setAttribute("aria-label", chromeCopy.dealsMenu);
  document.querySelector(".ai-guide-fab")?.setAttribute("aria-label", chromeCopy.aiGuide);
  document.querySelectorAll("[data-brand-label]").forEach((label) => {
    label.textContent = BRAND_LANGUAGE_LABELS[activeLanguage];
  });
  const placeholders = LANGUAGE_PLACEHOLDERS[activeLanguage] || LANGUAGE_PLACEHOLDERS.vi;
  document.querySelector("#locationInput")?.setAttribute("placeholder", placeholders.location);
  document.querySelector('#businessStartForm input[name="city"]')?.setAttribute("placeholder", placeholders.businessCity);
  updateLandingGrowthEstimate();
  updateHeroCarouselAccessibility(activeLanguage);
  updateNexoraAuthLinks();
  updateTouchLinks();
  updateAIGuideLanguage(activeLanguage);
  updateConnectionStatus();
  if (DEAL_WORKSPACE_ROUTES.has(location.hash) && dealWorkspace && !dealWorkspace.hidden) renderDealWorkspace(location.hash);
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
  const language = NEXORA_LANGUAGES.includes(requested) ? requested : (NEXORA_LANGUAGES.includes(saved) ? saved : (NEXORA_LANGUAGES.includes(browserLanguage) ? browserLanguage : "en"));
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
    kicker: "KHÁM PHÁ · GẦN BẠN",
    headline: "Ưu đãi mới, khó bỏ lỡ",
    accent: "đang ở ngay quanh bạn.",
    description: "Deal độc quyền, chương trình lần đầu ra mắt và số lượng giới hạn từ doanh nghiệp địa phương đã được Nexora xác minh.",
    action: "Khám phá ưu đãi mới",
    href: "#nearby",
    label: "Tất cả ngành",
    offerType: "ƯU ĐÃI ĐANG CHẠY",
    offerValue: "124+",
    offerMeta: "Đã xác minh · cập nhật trực tiếp",
  },
  {
    kicker: "LÀM ĐẸP & SỨC KHỎE · GẦN BẠN",
    headline: "Làm đẹp nhiều hơn",
    accent: "chi ít hơn hôm nay.",
    description: "Khám phá deal mới, suất giờ vàng và ưu đãi giới hạn cho nail, tóc, spa và chăm sóc cá nhân.",
    action: "Săn deal làm đẹp",
    href: "#categories",
    label: "Làm đẹp & Sức khỏe",
    offerType: "COUPON MỚI",
    offerValue: "-25%",
    offerMeta: "Đã xác minh · số lượng có hạn",
  },
  {
    kicker: "ẨM THỰC & CHỢ · HÔM NAY",
    headline: "Món ngon đáng thử",
    accent: "giá tốt khó bỏ lỡ.",
    description: "Combo đặc biệt, coupon trong ngày và Last Minute từ nhà hàng, tiệm bánh và chợ địa phương.",
    action: "Săn deal ăn uống",
    href: "#last-minute",
    label: "Ẩm thực & Chợ",
    offerType: "LAST MINUTE",
    offerValue: "$8",
    offerMeta: "Đã xác minh · số lượng có hạn",
  },
  {
    kicker: "NHÀ, XE & THÚ CƯNG · GẦN BẠN",
    headline: "Việc cần làm hôm nay",
    accent: "deal tốt ngay gần nhà.",
    description: "Ưu đãi mới cho xe, sửa chữa, thú cưng và tiện ích hằng ngày từ doanh nghiệp đã xác minh.",
    action: "Tìm deal dịch vụ",
    href: "#nearby",
    label: "Nhà, Xe & Thú cưng",
    offerType: "DEAL GẦN BẠN",
    offerValue: "TIẾT KIỆM $20",
    offerMeta: "Đã xác minh · số lượng có hạn",
  },
  {
    kicker: "NAIL & SPA · TRẢI NGHIỆM CAO CẤP",
    headline: "Thư giãn trọn vẹn",
    accent: "ngay gần bạn.",
    description: "Ghế spa êm ái, kỹ thuật viên tận tâm và ưu đãi giới hạn cho manicure, pedicure và Gel-X.",
    action: "Khám phá Nail & Spa",
    href: "#categories",
    label: "Nail & Spa",
    offerType: "COUPON GIỚI HẠN",
    offerValue: "GIẢM 20%",
    offerMeta: "Đã xác minh · số lượng có hạn",
  },
  {
    kicker: "NHÀ HÀNG · TỐI NAY",
    headline: "Một bữa tối đáng nhớ",
    accent: "đang chờ gần bạn.",
    description: "Bàn đẹp, món đặc sắc và ưu đãi giới hạn từ nhà hàng địa phương đã xác minh.",
    action: "Khám phá nhà hàng",
    href: "#categories",
    label: "Nhà hàng",
    offerType: "DEAL TỐI NAY",
    offerValue: "2 MÓN $29",
    offerMeta: "Đã xác minh · số lượng có hạn",
  },
  {
    kicker: "TIỆM TÓC · PHONG CÁCH MỚI",
    headline: "Mái tóc bạn muốn",
    accent: "với giá dễ yêu.",
    description: "Cắt, tạo kiểu, nhuộm và phục hồi với ưu đãi mới từ salon gần bạn.",
    action: "Tìm deal tiệm tóc",
    href: "#categories",
    label: "Tiệm tóc",
    offerType: "ƯU ĐÃI KHÁCH MỚI",
    offerValue: "-30%",
    offerMeta: "Đã xác minh · số lượng có hạn",
  },
  {
    kicker: "KHÁCH SẠN · KỲ NGHỈ GẦN",
    headline: "Đổi không khí",
    accent: "không cần đi xa.",
    description: "Staycation, phòng đẹp và trải nghiệm nghỉ dưỡng với giá đặc biệt.",
    action: "Khám phá khách sạn",
    href: "#categories",
    label: "Khách sạn",
    offerType: "GIÁ ĐẶC BIỆT",
    offerValue: "$129",
    offerMeta: "Đã xác minh · số lượng có hạn",
  },
  {
    kicker: "DU THUYỀN · TRẢI NGHIỆM BIỂN",
    headline: "Ra khơi theo cách",
    accent: "đáng nhớ nhất.",
    description: "Chuyến ngắm hoàng hôn, tiệc riêng và trải nghiệm du thuyền được chọn lọc.",
    action: "Khám phá du thuyền",
    href: "#categories",
    label: "Du thuyền",
    offerType: "TRẢI NGHIỆM ĐẶC BIỆT",
    offerValue: "-20%",
    offerMeta: "Đã xác minh · số lượng có hạn",
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
  const offerFlash = root.querySelector("#heroOfferFlash");
  const offerType = root.querySelector("#heroOfferType");
  const offerValue = root.querySelector("#heroOfferValue");
  const offerTitle = root.querySelector("#heroOfferTitle");
  const offerMeta = root.querySelector("#heroOfferMeta");
  const offerAction = root.querySelector("#heroOfferAction");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer = null;
  let pointerInside = false;
  let focusInside = false;

  const activeLanguage = () => document.querySelector("#languageSelect")?.value || "en";

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
    offerType.textContent = item.offerType;
    offerValue.textContent = item.offerValue;
    offerTitle.textContent = item.label;
    offerMeta.textContent = item.offerMeta;
    offerAction.href = item.href;
    offerFlash.classList.remove("is-refreshing");
    void offerFlash.offsetWidth;
    offerFlash.classList.add("is-refreshing");
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
    if (!state.savedOnly && deal.lastMinuteOnly) return false;
    const matchesCategory = state.activeCategory === "all" || deal.category === state.activeCategory;
    const haystack = `${deal.title} ${deal.salon} ${deal.category}`.toLocaleLowerCase("vi");
    const matchesSaved = !state.savedOnly || savedDeals.has(deal.id);
    const offerClass = getOfferClassification(deal);
    const matchesWishlistView = !state.savedOnly
      || wishlistView === "all"
      || (wishlistView === "last-minute" && deal.lastMinuteOnly)
      || (wishlistView === "coupon" && !deal.lastMinuteOnly && offerClass.isCoupon)
      || (wishlistView === "deal" && !deal.lastMinuteOnly && !offerClass.isCoupon);
    return matchesCategory
      && (!query || haystack.includes(query))
      && matchesSaved
      && matchesWishlistView
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
  const openingCount = Object.keys(openingHolds || {}).length;
  navSavedCount.textContent = savedDeals.size + openingCount;
  updateWishlistMenuCounts();
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

function updateWishlistMenuCounts() {
  const saved = deals.filter((deal) => savedDeals.has(deal.id));
  const counts = {
    deal: saved.filter((deal) => !deal.lastMinuteOnly && !getOfferClassification(deal).isCoupon).length,
    coupon: saved.filter((deal) => !deal.lastMinuteOnly && getOfferClassification(deal).isCoupon).length,
    "last-minute": saved.filter((deal) => deal.lastMinuteOnly).length,
    openings: Object.keys(openingHolds || {}).length,
  };
  counts.all = counts.deal + counts.coupon + counts["last-minute"] + counts.openings;
  document.querySelectorAll("[data-wishlist-count]").forEach((badge) => {
    badge.textContent = counts[badge.dataset.wishlistCount] || 0;
  });
}

function renderOpeningWishlist() {
  return Object.entries(openingHolds).map(([id, hold]) => {
    const opening = openingCatalog[id];
    if (!opening) return "";
    return `<article class="deal-card wishlist-opening-card">
      <div class="wishlist-opening-visual"><span>🎊</span><small>ĐANG THEO DÕI</small></div>
      <div class="deal-body"><div class="offer-kind coupon">Khai trương · Đã giữ chỗ</div><h3>${escapeHTML(opening.business)}</h3><p>${escapeHTML(opening.offer)}</p><div class="wishlist-opening-meta"><span>📅 ${escapeHTML(formatOpeningDate(opening.openingDate))}</span><span>📱 ${escapeHTML(hold.phoneMasked || "Đã xác nhận")}</span></div><button class="deal-open" type="button" data-opening-hold="${escapeHTML(id)}">Xem xác nhận</button></div>
    </article>`;
  }).join("");
}

function renderDeals() {
  const showingOpenings = state.savedOnly && wishlistView === "openings";
  const visibleDeals = showingOpenings ? [] : getVisibleDeals();
  const openingMarkup = showingOpenings ? renderOpeningWishlist() : "";
  dealGrid.innerHTML = showingOpenings ? openingMarkup : visibleDeals.map(dealTemplate).join("");
  const resultCount = showingOpenings ? Object.keys(openingHolds).length : visibleDeals.length;
  dealGrid.hidden = resultCount === 0;
  emptyState.hidden = resultCount !== 0;

  const dealLayout = document.querySelector(".deal-layout");
  const nearbyCard = document.querySelector(".nearby-card");
  const resultControls = document.querySelector(".result-controls");
  const emptyAction = emptyState.querySelector(".request-button");
  dealLayout?.classList.toggle("wishlist-mode", state.savedOnly);
  if (nearbyCard) nearbyCard.hidden = state.savedOnly;
  if (resultControls) resultControls.hidden = state.savedOnly;
  if (emptyAction) emptyAction.hidden = state.savedOnly;

  if (state.savedOnly) {
    const labels = { all: "Tất cả đã lưu", deal: "Deal đã lưu", coupon: "Coupon đã lưu", "last-minute": "Last Minute đã lưu", openings: "Khai trương đang theo dõi" };
    resultsKicker.textContent = "WISHLIST · NEXORA ID";
    resultsTitle.textContent = resultCount ? `${labels[wishlistView]} · ${resultCount}` : `${labels[wishlistView]} đang trống`;
    const emptyTitle = emptyState.querySelector("h3");
    const emptyCopy = emptyState.querySelector("p");
    if (emptyTitle) emptyTitle.textContent = `${labels[wishlistView]} đang trống`;
    if (emptyCopy) emptyCopy.textContent = wishlistView === "openings" ? "Đăng ký sớm ở mục Khai trương để sự kiện xuất hiện tại đây." : "Bấm biểu tượng trái tim ở ưu đãi bạn quan tâm để lưu lại tại đây.";
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
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
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
    return deal ? { title: workspaceDealText(deal, "title"), business: deal.salon, value: `$${deal.price}`, couponId: id } : null;
  }
  const coupon = couponCatalog[id];
  const englishTitles = { nail20: "Gel-X for new customers", lunch5: "Orders of $25 or more", market10: "Produce purchases of $20 or more", qrlocal: "Local services of $50 or more" };
  return coupon ? { ...coupon, title: workspaceEnglish() ? englishTitles[id] || coupon.title : coupon.title, couponId: id } : null;
}

function showCouponClaimSuccess(claim, summary) {
  document.querySelector("#couponClaimForm").hidden = true;
  const success = document.querySelector("#couponClaimSuccess");
  success.hidden = false;
  document.querySelector("#couponClaimSuccessCopy").textContent = workspaceCopy(`${summary.value} · ${summary.business} đã giữ cho ${claim.phoneMasked} đến ${formatHoldDate(claim.holdUntil)}. SMS xác nhận đã được tạo.`, `${summary.value} · ${summary.business} is reserved for ${claim.phoneMasked} until ${formatHoldDate(claim.holdUntil)}. A confirmation SMS has been prepared.`);
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
  document.querySelector("#couponClaimSummary").textContent = workspaceCopy(`${summary.value} · ${summary.business}. Một suất sẽ được giữ 7 ngày theo số điện thoại.`, `${summary.value} · ${summary.business}. One coupon will be reserved for seven days using your phone number.`);
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
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function renderOpeningHolds() {
  document.querySelectorAll("[data-opening-hold]").forEach((button) => {
    const held = openingHolds[button.dataset.openingHold];
    button.textContent = held
      ? workspaceCopy("Đã giữ chỗ", "Spot reserved")
      : button.closest("#dealWorkspace")
        ? workspaceCopy("🙋 Đăng ký sớm · giữ chỗ", "🙋 Register early · reserve a spot")
        : workspaceCopy("Giữ chỗ qua SĐT", "Reserve by phone");
    button.classList.toggle("held", Boolean(held));
  });
}

function showOpeningHoldSuccess(id, hold) {
  const opening = openingCatalog[id];
  document.querySelector("#openingHoldForm").hidden = true;
  document.querySelector("#openingHoldSuccess").hidden = false;
  document.querySelector("#openingHoldSuccessCopy").textContent = workspaceCopy(
    `${opening.business} đã giữ chỗ cho ${hold.phoneMasked}. Chưa phát coupon trước ngày mở cửa.`,
    `${opening.business} reserved a spot for ${hold.phoneMasked}. Coupons are not issued before opening day.`
  );
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
  const englishOffers = { "pho-bellaire": "$9 grand opening combo", "kayla-nails": "30% off services on opening day", "saigon-boba": "First drink for $1" };
  document.querySelector("#openingHoldSummary").textContent = workspaceCopy(
    `${opening.offer} · mở cửa ${formatOpeningDate(opening.openingDate)}. Nexora sẽ gửi SMS nhắc trước ngày mở cửa.`,
    `${englishOffers[id] || opening.offer} · opens ${formatOpeningDate(opening.openingDate)}. Nexora will send an SMS reminder before opening day.`
  );
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
    showToast(workspaceCopy("Vui lòng nhập số điện thoại hợp lệ.", "Please enter a valid phone number."));
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
  showToast(workspaceCopy("Đã giữ chỗ khai trương. Không cần cài app.", "Your opening-day spot is reserved. No app required."));
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

const ROUTE_LABELS = {
  vi: { discover: "Khám phá", nearby: "Deal gần bạn", coupons: "Coupon theo ngành", requests: "Deal Match", openings: "Khai trương", "last-minute": "Last Minute", "my-open-slots": "Giờ trống của tôi", wishlist: "Wishlist", categories: "Danh mục", legal: "Trung tâm pháp lý" },
  en: { discover: "Discover", nearby: "Deals nearby", coupons: "Coupons by industry", requests: "Deal Match", openings: "Grand openings", "last-minute": "Last Minute", "my-open-slots": "My open slots", wishlist: "Wishlist", categories: "Categories", legal: "Legal Center" },
  es: { discover: "Explorar", nearby: "Ofertas cercanas", coupons: "Cupones por sector", requests: "Deal Match", openings: "Próximas aperturas", "last-minute": "Último minuto", "my-open-slots": "Mis horarios libres", wishlist: "Favoritos", categories: "Categorías", legal: "Centro legal" },
  "zh-TW": { discover: "探索", nearby: "附近優惠", coupons: "產業優惠券", requests: "優惠配對", openings: "即將開幕", "last-minute": "限時優惠", "my-open-slots": "我的空檔", wishlist: "收藏", categories: "分類", legal: "法律中心" },
  ko: { discover: "둘러보기", nearby: "주변 혜택", coupons: "업종별 쿠폰", requests: "혜택 매칭", openings: "오픈 예정", "last-minute": "라스트 미닛", "my-open-slots": "내 빈 시간", wishlist: "저장 목록", categories: "카테고리", legal: "법률 센터" },
};

function announceRoute(route = "#discover") {
  const status = document.querySelector("#routeStatus");
  if (!status) return;
  const language = document.querySelector("#languageSelect")?.value || "en";
  const routeKey = String(route).replace(/^#/, "") || "discover";
  const label = ROUTE_LABELS[language]?.[routeKey] || ROUTE_LABELS.vi[routeKey] || routeKey;
  status.textContent = language === "vi" ? `Đã mở ${label}` : language === "es" ? `Se abrió ${label}` : language === "zh-TW" ? `已開啟${label}` : language === "ko" ? `${label} 열림` : `${label} opened`;
}

function updateConnectionStatus() {
  const banner = document.querySelector("#connectionStatus");
  if (!banner) return;
  const language = document.querySelector("#languageSelect")?.value || "en";
  const copy = {
    vi: ["Bạn đang offline", "Các nội dung đã mở vẫn xem được; lấy coupon, đăng nhập và đặt lịch cần kết nối mạng."],
    en: ["You are offline", "Previously opened content remains available; claiming, signing in and booking require a connection."],
    es: ["Estás sin conexión", "El contenido abierto sigue disponible; reclamar, iniciar sesión y reservar requieren conexión."],
    "zh-TW": ["目前離線", "已開啟的內容仍可查看；領取優惠券、登入與預約需要網路連線。"],
    ko: ["오프라인 상태입니다", "이미 연 콘텐츠는 볼 수 있지만 쿠폰 받기, 로그인, 예약에는 인터넷 연결이 필요합니다."],
  }[language] || ["You are offline", "A network connection is required to continue."];
  banner.querySelector("[data-connection-title]").textContent = copy[0];
  banner.querySelector("[data-connection-copy]").textContent = copy[1];
  banner.hidden = navigator.onLine;
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
    const when = new Date(item.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `<div class="event-row ${Number(item.amount) > 0 ? "billable" : ""}"><span class="event-icon">${escapeHTML(item.icon)}</span><div><strong>${escapeHTML(item.label)}</strong><small>${escapeHTML(window.NEXORA_DEAL_PRESENTATION?.translate(item.detail) || item.detail)} · ${escapeHTML(when)}</small></div><b>${Number(item.amount) > 0 ? `+${currency(item.amount)}` : "$0.00"}</b></div>`;
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

function inferAIGuideIntent(value) {
  const query = String(value || "").toLocaleLowerCase("vi");
  if (/doanh nghiệp|chủ tiệm|quảng cáo|promotion|business|merchant|negocio|商家|비즈니스/.test(query)) return "business";
  if (/coupon|mã giảm|voucher|cupón|優惠券|쿠폰/.test(query)) return "coupon";
  if (/hôm nay|tối nay|chiều nay|last minute|today|tonight|hoy|今日|오늘/.test(query)) return "today";
  if (/gần tôi|gần đây|near me|nearby|cerca|附近|주변/.test(query)) return "nearby";
  return "request";
}

let aiGuideSelectedIntent = "";

function setAIGuideStep(step) {
  document.querySelectorAll("[data-ai-step]").forEach((item) => {
    const itemStep = Number(item.dataset.aiStep);
    item.classList.toggle("active", itemStep === step);
    item.classList.toggle("complete", itemStep < step);
  });
}

function setAIGuideSelection(intent = "") {
  aiGuideSelectedIntent = intent;
  document.querySelectorAll("[data-ai-intent]").forEach((button) => {
    const selected = button.dataset.aiIntent === intent;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function renderAIGuideResult(intent, need = "", area = "") {
  const result = document.querySelector("#aiGuideResult");
  if (!result) return;
  const copy = getAIGuideCopy();
  const route = copy.routes[intent] || copy.routes.request;
  const suffix = [need, area].filter(Boolean).join(" · ");
  result.dataset.intent = intent;
  result.dataset.need = need;
  result.dataset.area = area;
  result.hidden = false;
  document.querySelector("#aiGuideResultTitle").textContent = route[0];
  document.querySelector("#aiGuideResultCopy").textContent = suffix ? `${route[1]} ${suffix}` : route[1];
  document.querySelector("#aiGuideResultReason").textContent = copy.reasons?.[intent] || copy.reasons?.request || "";
  document.querySelector("#aiGuideResultAction").textContent = route[2];
  const tags = document.querySelector("#aiGuideResultTags");
  if (tags) {
    tags.replaceChildren();
    [need, area].filter(Boolean).forEach((value) => {
      const tag = document.createElement("span");
      tag.textContent = value;
      tags.append(tag);
    });
  }
  setAIGuideSelection(intent);
  setAIGuideStep(3);
  result.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
}

function resetAIGuide() {
  const copy = getAIGuideCopy();
  setAIGuideSelection("");
  setAIGuideStep(1);
  document.querySelector("#aiGuideForm")?.reset();
  const result = document.querySelector("#aiGuideResult");
  if (result) result.hidden = true;
  const message = document.querySelector("[data-ai-message]");
  if (message) message.textContent = copy.message;
  window.setTimeout(() => document.querySelector("[data-ai-intent]")?.focus(), 80);
}

function openAIGuide() {
  localStorage.setItem("nexora-ai-guide-seen", "1");
  const nudge = document.querySelector("#aiGuideNudge");
  if (nudge) nudge.hidden = true;
  updateAIGuideLanguage(document.querySelector("#languageSelect")?.value || "en");
  openModal(aiGuideDialog);
  const result = document.querySelector("#aiGuideResult");
  setAIGuideStep(result && !result.hidden ? 3 : aiGuideSelectedIntent ? 2 : 1);
  window.setTimeout(() => aiGuideDialog?.querySelector(aiGuideSelectedIntent ? '[name="need"]' : "[data-ai-intent]")?.focus(), 120);
}

function openAIGuideRoute(intent, need = "", area = "") {
  if (need && searchInput) searchInput.value = need;
  if (area && locationInput) locationInput.value = area;
  closeModal(aiGuideDialog);
  if (intent === "business") {
    openModal(businessDialog);
    return;
  }
  const routes = { nearby: "#nearby", today: "#last-minute", request: "#requests", coupon: "#coupons" };
  const hash = routes[intent] || "#requests";
  const url = new URL(location.href);
  url.hash = hash;
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  handleRoute(hash);
  if (intent === "request" && need) {
    const field = dealWorkspace?.querySelector('[data-dw-match-form] input[name="need"]');
    if (field) {
      field.value = need;
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

function initializeAIGuideNudge() {
  if (localStorage.getItem("nexora-ai-guide-seen")) return;
  window.setTimeout(() => {
    const nudge = document.querySelector("#aiGuideNudge");
    if (nudge && (!location.hash || location.hash === "#discover")) nudge.hidden = false;
  }, 1200);
}

function setActiveNavigation(hash) {
  const dealSubroutes = new Set(["#nail-salons", "#nearby", "#coupons", "#requests", "#openings", "#last-minute", "#my-open-slots"]);
  const primaryHash = dealSubroutes.has(hash) ? "#coupons" : hash;
  document.querySelectorAll(".desktop-nav a, .mobile-nav a").forEach((link) => {
    const active = link.getAttribute("href") === primaryHash;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function setActiveDealSubnav(hash) {
  const subroute = ({
    "#nail-salons": "nail-salons",
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
  const isWishlist = hash === "#wishlist";
  const isLegal = hash === "#legal";
  const dealMenu = document.querySelector(".deal-subnav:not(.wishlist-subnav)");
  const wishlistMenu = document.querySelector(".wishlist-subnav");
  if (dealMenu) dealMenu.hidden = isWishlist || isLegal;
  if (wishlistMenu) wishlistMenu.hidden = !isWishlist || isLegal;
}

function openDeal(id, source = null) {
  const deal = getDeal(id);
  if (!deal) return;
  const offerClass = getOfferClassification(deal);
  activeDealId = deal.id;
  activeAttributionSource = source;
  document.querySelector("#dealDialogTitle").textContent = workspaceDealText(deal, "title");
  document.querySelector("#detailSalon").textContent = deal.salon;
  document.querySelector("#detailDistance").textContent = `· ${deal.distance.toFixed(1)} mi`;
  document.querySelector("#detailRating").textContent = `· ★ ${deal.rating} (${deal.reviews})`;
  document.querySelector("#detailPrice").textContent = `$${deal.price}`;
  document.querySelector("#detailOriginal").textContent = `$${deal.original}`;
  document.querySelector("#detailSaving").textContent = deal.discount;
  document.querySelector("#detailDescription").textContent = workspaceDealText(deal, "description");
  document.querySelector("#detailSchedule").textContent = workspaceDealText(deal, "schedule");
  document.querySelector("#detailLocation").textContent = deal.location;
  document.querySelector("#detailInventory").textContent = deal.inventoryLabel || (offerClass.isCoupon ? `${offerClass.inventory} coupon` : workspaceCopy("Không giới hạn lượt", "Unlimited availability"));
  document.querySelector("#detailTerms").textContent = workspaceDealText(deal, "terms");
  document.querySelector("#detailBadge").textContent = workspaceDealText(deal, "badge");
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
  claimButton.textContent = offerClass.isCoupon ? (existingClaim ? workspaceCopy("Đã giữ coupon", "Coupon reserved") : workspaceCopy("Lấy coupon bằng SĐT", "Get coupon by phone")) : workspaceCopy("Đặt deal ngay", "Book this deal");
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
      <span>ACCEPTING OFFERS · ${escapeHTML(request.radius)} MI</span>
      <strong>${escapeHTML(request.service)}</strong>
      <small>Budget $${escapeHTML(request.budget)} · ${escapeHTML(formatHoldDate(`${request.date}T12:00:00`))} · ${escapeHTML(window.NEXORA_DEAL_PRESENTATION?.translate(request.time) || request.time)}</small>
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
  form.elements.title.value = window.NEXORA_DEAL_PRESENTATION?.translate(preset.title) || preset.title;
  form.elements.original.value = preset.original;
  form.elements.price.value = preset.price;
  form.elements.inventory.value = preset.inventory;
  form.elements.dailyCap.value = preset.dailyCap;
  form.elements.serviceCost.value = preset.cost;
  form.elements.expectedUpsell.value = preset.upsell;
  form.elements.terms.value = window.NEXORA_DEAL_PRESENTATION?.translate(preset.terms) || preset.terms;
  form.elements.smsMessage.value = window.NEXORA_DEAL_PRESENTATION?.translate(preset.sms) || preset.sms;
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
  "#nail-salons",
  "#nearby",
  "#coupons",
  "#requests",
  "#openings",
  "#last-minute",
  "#my-open-slots",
  "#legal",
]);

const dealWorkspace = document.querySelector("#dealWorkspace");
let legalView = "overview";

const LEGAL_COPY = {
  vi: {
    eyebrow: "NEXORA DEALS · TRUNG TÂM PHÁP LÝ",
    title: "Rõ quyền lợi trước khi bạn dùng ưu đãi",
    intro: "Một nơi để khách hàng và doanh nghiệp hiểu cách Nexora Deals vận hành, dữ liệu nào được dùng và ai chịu trách nhiệm cho từng ưu đãi.",
    status: "Dự thảo sản phẩm · Cần luật sư Hoa Kỳ duyệt trước khi phát hành chính thức",
    effective: "Có hiệu lực dự kiến: 01/10/2026 · Phiên bản 1.0",
    languageNote: "Bản tiếng Việt và tiếng Anh được tách riêng. Nếu có khác biệt sau khi phát hành, bản được chỉ định trong điều khoản chính thức sẽ được ưu tiên.",
    tabs: {
      overview: ["Tổng quan", "⌂"],
      guest: ["Khách (Guest)", "◌"],
      member: ["Thành viên", "●"],
      terms: ["Điều khoản", "§"],
      privacy: ["Quyền riêng tư", "◉"],
      business: ["Doanh nghiệp", "▣"],
      offers: ["Quy tắc ưu đãi", "🏷️"],
      sponsored: ["Quảng cáo", "AD"],
      california: ["California", "CA"],
      sms: ["SMS", "✉"],
    },
    docs: {
      overview: {
        title: "Legal Center của Nexora Deals",
        lead: "Nexora Deals là lớp khám phá deal, coupon, Last Minute và chương trình địa phương kết nối với Nexora Touch và OneQR.",
        sections: [
          ["Ai vận hành", "Nền tảng được vận hành bởi Nexora Touch LLC. Hỗ trợ sản phẩm: support@nexoratouch.com. Địa chỉ liên hệ: 5444 Westheimer Rd, Ste 1000, Houston, TX 77056-5318, United States."],
          ["Nexora làm gì", "Nexora cung cấp công nghệ khám phá, tìm kiếm, quảng cáo, giữ chỗ, đo lường và chuyển tiếp sang doanh nghiệp. Nexora Deals không phải bên bán, không thu tiền cho ưu đãi và không xử lý hoàn tiền. Doanh nghiệp đăng ưu đãi là bên cung cấp và chịu trách nhiệm về dịch vụ, giá, thuế, an toàn, chính sách hoàn/hủy và thực hiện ưu đãi."],
          ["Trước khi sử dụng", "Hãy đọc điều kiện ngay trên thẻ và trang chi tiết: ngày hết hạn, số lượng, đối tượng, giờ áp dụng, địa điểm, đặt lịch và chính sách hủy. Việc bấm “Lấy coupon” không bảo đảm còn chỗ nếu ưu đãi yêu cầu doanh nghiệp xác nhận."],
        ],
      },
      guest: {
        title: "Điều khoản dành cho Khách chưa đăng ký",
        lead: "Guest có thể khám phá Nexora Deals mà không cần tạo tài khoản; chỉ những hành động cần nhận, giữ hoặc xác nhận ưu đãi mới yêu cầu thêm thông tin.",
        sections: [
          ["Khám phá không cần tài khoản", "Bạn có thể mở trang, tìm kiếm, lọc ngành, xem Deal Nearby, danh mục, quảng cáo và điều kiện ưu đãi mà không cần NEXORA ID. Một số tính năng có thể lưu lựa chọn tạm thời trên thiết bị để trang hoạt động đúng."],
          ["Vị trí và tìm kiếm", "Nexora có thể dùng khu vực bạn nhập, địa chỉ IP hoặc vị trí gần đúng để hiển thị kết quả phù hợp. Vị trí chính xác chỉ được dùng sau khi bạn cho phép và bạn có thể tắt quyền này trong trình duyệt hoặc thiết bị."],
          ["Lấy coupon bằng số điện thoại", "Một số coupon hoặc giữ chỗ cho phép Guest nhập số điện thoại mà không cần đăng ký. Số điện thoại được dùng để chống nhận trùng, gửi xác nhận, tra cứu tại POS và redeem đúng ưu đãi. Nhập số điện thoại không tự động tạo tài khoản thành viên."],
          ["SMS giao dịch và marketing", "SMS xác nhận coupon, booking hoặc check-in phục vụ hành động bạn vừa yêu cầu. SMS marketing hoặc chương trình tiếp theo cần sự đồng ý riêng khi pháp luật yêu cầu; bạn có thể trả lời STOP để dừng và HELP để nhận hỗ trợ."],
          ["Giới hạn của chế độ Guest", "Guest có thể không đồng bộ Wishlist, lịch sử coupon, Deal Match, rewards hoặc booking giữa nhiều thiết bị. Nếu trình duyệt bị xóa dữ liệu hoặc đổi thiết bị, lựa chọn lưu cục bộ có thể mất."],
          ["Khi nào dữ liệu được chuyển cho doanh nghiệp", "Doanh nghiệp không nhận danh tính chỉ vì bạn xem một deal. Thông tin cần thiết chỉ được chuyển khi bạn lấy coupon, đặt lịch, giữ chỗ, check-in hoặc yêu cầu doanh nghiệp liên hệ."],
          ["Trách nhiệm khi sử dụng ưu đãi", "Bạn phải kiểm tra giá, ngày hết hạn, điều kiện, địa điểm, giờ áp dụng và chính sách hủy trước khi sử dụng. Không được dùng số điện thoại của người khác, tạo lượt nhận giả, vượt giới hạn hoặc chuyển nhượng ưu đãi trái điều kiện."],
          ["Chuyển sang Thành viên", "Khi bạn chọn đăng ký hoặc đăng nhập NEXORA ID, dữ liệu đủ điều kiện trên thiết bị có thể được liên kết vào tài khoản sau khi màn hình xác nhận giải thích phạm vi đồng bộ. Việc đăng ký không tự động cho phép marketing."],
        ],
      },
      member: {
        title: "Điều khoản dành cho Thành viên NEXORA ID",
        lead: "Thành viên có trải nghiệm được đồng bộ và quản lý bằng NEXORA ID trên các dịch vụ Nexora được kết nối.",
        sections: [
          ["Tài khoản và đăng nhập", "Bạn phải cung cấp thông tin chính xác, bảo vệ mã đăng nhập và thông báo khi nghi ngờ tài khoản bị truy cập trái phép. Một NEXORA ID có thể dùng cho các dịch vụ Nexora được kết nối nhưng quyền truy cập vẫn phụ thuộc vai trò của bạn."],
          ["Hồ sơ và đồng bộ", "Nexora có thể đồng bộ ngôn ngữ, khu vực, Wishlist, Deal Match, coupon, booking, check-in, rewards và lựa chọn thông báo để bạn tiếp tục trên thiết bị khác. Màn hình liên quan phải cho biết dữ liệu nào được dùng cho từng chức năng."],
          ["Wishlist và Deal Match", "Wishlist lưu những ưu đãi bạn quan tâm; Deal Match dùng nhu cầu, ngân sách, thời gian và khu vực bạn chọn để tìm kết quả. Đăng một nhu cầu không bảo đảm có deal, giá hoặc chỗ trống và không tự động gửi danh tính cho mọi doanh nghiệp."],
          ["Coupon, booking và lịch sử", "Coupon đã nhận, trạng thái redeem, booking, hủy, no-show và giao dịch có thể được lưu vào tài khoản để thực hiện ưu đãi, hỗ trợ, chống gian lận và giải quyết tranh chấp. Doanh nghiệp chỉ nhận phần dữ liệu cần để phục vụ hành động tương ứng."],
          ["Cá nhân hóa và quảng cáo", "Nexora có thể dùng hoạt động trong tài khoản để sắp xếp kết quả, gợi ý ưu đãi và đo hiệu quả. Nội dung trả phí vẫn phải có nhãn Quảng cáo hoặc Được tài trợ; bạn có thể thực hiện các lựa chọn quyền riêng tư được cung cấp."],
          ["Thông báo và consent", "Bạn có thể quản lý SMS, email và push theo từng mục đích. Đồng ý nhận thông báo giao dịch không đồng nghĩa với đồng ý nhận marketing; việc rút consent marketing không làm mất các thông báo cần thiết để hoàn tất booking hoặc giao dịch đang mở."],
          ["Rewards và quyền lợi", "Điểm, ví coupon, ưu đãi thành viên hoặc quyền lợi có thể có quy tắc riêng về điều kiện, thời hạn và giới hạn. Rewards không phải tiền mặt trừ khi điều khoản cụ thể nói khác và Nexora có thể sửa số dư phát sinh từ gian lận hoặc lỗi kỹ thuật."],
          ["Tạm khóa và chấm dứt", "Nexora có thể tạm khóa tính năng hoặc tài khoản khi có rủi ro bảo mật, gian lận, lạm dụng coupon hoặc vi phạm điều khoản. Booking, coupon và nghĩa vụ giữa khách với doanh nghiệp đã phát sinh vẫn do doanh nghiệp xử lý theo điều kiện đã công bố và luật áp dụng."],
          ["Quản lý và xóa tài khoản", "Bạn có thể yêu cầu truy cập, sửa hoặc xóa tài khoản theo luật áp dụng. Một số dữ liệu có thể được giữ trong thời gian cần thiết để hoàn tất giao dịch, tuân thủ thuế và kế toán, giải quyết tranh chấp, bảo mật hoặc ngăn gian lận."],
        ],
      },
      terms: {
        title: "Điều khoản sử dụng",
        lead: "Các nguyên tắc nền tảng áp dụng khi bạn truy cập, tìm kiếm, lưu, nhận hoặc sử dụng ưu đãi trên Nexora Deals.",
        sections: [
          ["Tài khoản và tính chính xác", "Bạn có thể khám phá mà không cần tài khoản. Những chức năng như đồng bộ Wishlist, coupon, giữ chỗ hoặc rewards có thể yêu cầu NEXORA ID. Bạn phải cung cấp thông tin chính xác, bảo vệ thông tin đăng nhập và không sử dụng danh tính hoặc số điện thoại của người khác khi chưa được phép."],
          ["Vai trò của doanh nghiệp", "Doanh nghiệp quyết định nội dung, điều kiện, số lượng, giá, lịch, khả năng phục vụ và việc chấp nhận ưu đãi của họ. Nexora có thể kiểm tra định dạng, danh tính doanh nghiệp hoặc dấu hiệu gian lận nhưng việc “đã xác minh” không phải bảo đảm về chất lượng hay kết quả dịch vụ."],
          ["Hành vi bị cấm", "Không được tạo tài khoản giả, thu thập mã tự động, bán lại coupon trái phép, can thiệp giới hạn lượt dùng, đăng nội dung sai lệch, giả mạo đánh giá, tấn công hệ thống hoặc dùng nền tảng cho hoạt động bất hợp pháp."],
          ["Nội dung và sở hữu trí tuệ", "Thương hiệu, giao diện, phần mềm và nội dung do Nexora tạo thuộc Nexora hoặc bên cấp phép. Doanh nghiệp vẫn sở hữu nội dung họ gửi nhưng cho Nexora quyền hiển thị, định dạng, dịch, phân phối và đo lường nội dung đó để vận hành và quảng bá chương trình."],
          ["Giới hạn hợp lý", "Dịch vụ có thể thay đổi, tạm ngừng hoặc có lỗi. Trong phạm vi pháp luật cho phép, Nexora không chịu trách nhiệm cho dịch vụ trực tiếp của doanh nghiệp hoặc thiệt hại gián tiếp. Không nội dung nào loại trừ quyền người tiêu dùng bắt buộc theo luật áp dụng."],
        ],
      },
      privacy: {
        title: "Thông báo quyền riêng tư",
        lead: "Chúng tôi chỉ thu thập dữ liệu cần để vận hành trải nghiệm, chống gian lận, đo hiệu quả và hỗ trợ người dùng.",
        sections: [
          ["Dữ liệu có thể được thu thập", "Thông tin NEXORA ID và liên hệ; vị trí gần đúng hoặc vị trí chính xác khi bạn cho phép; từ khóa, bộ lọc, Wishlist và nhu cầu Deal Match; coupon, booking, check-in, redeem và giao dịch; dữ liệu thiết bị, nhật ký, OneQR scan, lượt xem/click và nguồn giới thiệu; nội dung doanh nghiệp cung cấp."],
          ["Mục đích sử dụng", "Cung cấp kết quả gần bạn; lưu và đồng bộ lựa chọn; chuyển coupon hoặc booking cho đúng doanh nghiệp; gửi thông báo bạn yêu cầu; bảo mật và ngăn lạm dụng; đo chiến dịch; cải thiện sản phẩm; hỗ trợ và tuân thủ pháp luật."],
          ["Khi dữ liệu được chia sẻ", "Với doanh nghiệp khi bạn nhận coupon, đặt lịch, giữ chỗ hoặc yêu cầu họ liên hệ; với nhà cung cấp dịch vụ hỗ trợ hạ tầng, liên lạc, phân tích hoặc chống gian lận; với cơ quan có thẩm quyền khi pháp luật yêu cầu; hoặc trong giao dịch tổ chức hợp pháp. Chúng tôi không cho doanh nghiệp xem dữ liệu của bạn chỉ vì bạn lướt qua một thẻ."],
          ["Lựa chọn của bạn", "Bạn có thể từ chối vị trí chính xác, tắt thông báo, rút đồng ý marketing, xóa dữ liệu lưu trên thiết bị và yêu cầu truy cập, sửa hoặc xóa dữ liệu theo luật áp dụng. Một số hồ sơ được giữ lâu hơn để hoàn tất giao dịch, giải quyết tranh chấp, ngăn gian lận hoặc tuân thủ pháp luật."],
          ["Trẻ em và bảo mật", "Nexora Deals không hướng đến trẻ em dưới 13 tuổi. Chúng tôi áp dụng biện pháp kỹ thuật và tổ chức phù hợp, nhưng không hệ thống truyền hoặc lưu trữ nào an toàn tuyệt đối."],
        ],
      },
      business: {
        title: "Điều khoản dành cho doanh nghiệp",
        lead: "Áp dụng cho chủ doanh nghiệp, người quản lý và người được ủy quyền tạo Promotion, Deal, Coupon, Last Minute hoặc quảng cáo qua Nexora Touch và OneQR.",
        sections: [
          ["Quyền đại diện và hồ sơ", "Người tạo chương trình xác nhận mình có quyền đại diện cho doanh nghiệp, địa điểm hoặc người cung cấp dịch vụ được nêu. Hồ sơ doanh nghiệp, giấy phép, địa chỉ, thông tin thuế, tài khoản nhận tiền và người liên hệ phải chính xác, còn hiệu lực và được cập nhật khi thay đổi."],
          ["Nội dung và bằng chứng", "Mọi tuyên bố về giá, phần trăm giảm, giá gốc, kết quả, chất lượng, đánh giá, hình ảnh, thời hạn và số lượng phải trung thực, không gây hiểu nhầm và có bằng chứng hợp lý trước khi đăng. Doanh nghiệp phải có quyền sử dụng tên, hình ảnh, logo, nhạc, đánh giá và nội dung tải lên."],
          ["Phân loại chương trình", "Deal là chương trình hoặc banner không giới hạn số mã; Coupon có mã/QR và số lượng hoặc giới hạn lượt; Last Minute gắn với tồn kho dễ hỏng hoặc một giờ trống cụ thể. Doanh nghiệp không được chọn sai loại để tránh giới hạn, phí, điều kiện redeem hoặc nghĩa vụ công bố chính sách hoàn/hủy."],
          ["Giá, phí và điều kiện", "Doanh nghiệp phải hiển thị rõ giá cuối cùng, phí bắt buộc, thuế khi có thể xác định, mức chi tiêu tối thiểu, khách đủ điều kiện, địa điểm, giờ áp dụng, hạn dùng, số lượt, chính sách hủy và điều kiện không cộng dồn trước khi khách nhận hoặc mua. Giá gạch ngang phải là giá tham chiếu có thật, không được nâng giá rồi tạo giảm giá giả."],
          ["Tồn kho, lịch và thực hiện", "Doanh nghiệp chịu trách nhiệm đồng bộ số lượng, giờ trống và khả năng phục vụ; tạm dừng chương trình khi hết hàng hoặc đầy lịch; đào tạo nhân viên redeem; và thực hiện đúng điều kiện khách đã nhận. Nexora có thể tự ẩn chương trình khi hết hạn, hết lượng, lịch đầy hoặc phát hiện dữ liệu không nhất quán."],
          ["Hoàn tiền, hủy và tranh chấp", "Doanh nghiệp phải công bố rõ chính sách hoàn tiền, hủy, đổi lịch và no-show trước khi khách nhận hoặc sử dụng ưu đãi; đồng thời trực tiếp xử lý yêu cầu của khách. Giao dịch thanh toán diễn ra giữa khách và doanh nghiệp. Nexora Deals là kênh khám phá/quảng cáo, không phải bên bán, không thu tiền và không phát hành khoản hoàn tiền cho giao dịch đó."],
          ["Dữ liệu khách và SMS", "Chỉ được dùng dữ liệu khách cho mục đích khách đã yêu cầu hoặc đồng ý. Không được tải xuống, bán, chia sẻ hoặc dùng số điện thoại, vị trí, lịch sử booking hay coupon để marketing ngoài phạm vi cho phép. SMS marketing cần consent phù hợp, nhận diện người gửi, lưu bằng chứng đồng ý và hỗ trợ STOP/HELP; consent không phải điều kiện mua hàng."],
          ["Quảng cáo và OneQR", "Vị trí trả phí phải giữ nhãn “Được tài trợ” hoặc “Quảng cáo”. Doanh nghiệp không được che nhãn, giả mạo kết quả tự nhiên, tạo click/scan/giao dịch giả hoặc khuyến khích nhân viên tự tương tác để tăng doanh thu. Mở menu và tiện ích OneQR cơ bản không tự động là click quảng cáo tính phí."],
          ["Ngành được quản lý và nội dung cấm", "Các lĩnh vực như y tế, tài chính, pháp lý, rượu, thuốc, dịch vụ người lớn, cờ bạc, sản phẩm hạn chế độ tuổi hoặc hoạt động cần giấy phép có thể bị yêu cầu tài liệu bổ sung, giới hạn khu vực/đối tượng hoặc không được chấp nhận. Cấm hàng giả, nội dung nguy hiểm, phân biệt đối xử, lừa đảo và chương trình vi phạm pháp luật."],
          ["Kiểm tra và xử lý vi phạm", "Nexora có thể yêu cầu bằng chứng, sửa nội dung, tạm dừng phân phối, hủy chương trình hoặc khóa quyền tạo quảng cáo khi có rủi ro cho khách, gian lận hoặc vi phạm. Doanh nghiệp vẫn chịu trách nhiệm với các nghĩa vụ, hoàn tiền và tranh chấp đã phát sinh trước khi chương trình bị dừng."],
        ],
      },
      offers: {
        title: "Quy tắc Deal, Coupon & Last Minute",
        lead: "Ba loại ưu đãi có cách sử dụng khác nhau; nhãn trên thẻ phải cho khách biết họ đang nhận loại nào.",
        sections: [
          ["Deal", "Ưu đãi dạng banner hoặc chương trình công khai, thường không giới hạn số mã. Deal có thể có điều kiện về chi tiêu tối thiểu, khách mới, ngày/giờ, dịch vụ hoặc địa điểm và vẫn phụ thuộc khả năng phục vụ của doanh nghiệp."],
          ["Coupon", "Có mã hoặc QR và có thể bị giới hạn số lượng, một lần mỗi khách, ngày hết hạn hoặc điều kiện cộng dồn. Coupon được tính là đã dùng khi doanh nghiệp xác nhận redeem; chụp màn hình hoặc chuyển mã không làm thay đổi điều kiện gốc."],
          ["Last Minute", "Là tồn kho, hàng dễ hỏng hoặc một giờ trống cụ thể được bán gần thời điểm sử dụng. Giá chỉ áp dụng cho đúng sản phẩm, thợ, địa điểm, giờ nhận hoặc khung đặt đã hiển thị. Giữ chỗ chỉ hoàn tất khi màn hình xác nhận xuất hiện."],
          ["Giá, phí và chính sách hoàn/hủy", "Giá gạch ngang phải là giá tham chiếu trung thực. Doanh nghiệp phải công bố giá, phí bắt buộc và chính sách hoàn tiền, hủy hoặc đổi lịch ngay trên điều kiện ưu đãi. Khách thanh toán trực tiếp cho doanh nghiệp; Nexora Deals không thu tiền và không xử lý hoàn tiền."],
          ["Hết hạn và thay đổi", "Doanh nghiệp không được đổi điều kiện sau khi khách đã nhận coupon theo cách gây bất lợi trái luật. Nexora có thể ẩn, tạm dừng hoặc hủy ưu đãi sai lệch, hết hàng, không an toàn, gian lận hoặc vi phạm chính sách."],
        ],
      },
      sponsored: {
        title: "Nội dung được tài trợ và quảng cáo",
        lead: "Doanh nghiệp có thể trả tiền để tăng phân phối, nhưng vị trí trả phí phải được nhận biết rõ và không được giả làm kết quả tự nhiên.",
        sections: [
          ["Nhãn rõ ràng", "Vị trí trả phí được gắn nhãn như “Được tài trợ” hoặc “Quảng cáo” ngay trên nội dung, dễ thấy trên điện thoại và dùng cùng ngôn ngữ với trải nghiệm đang mở."],
          ["Cách xếp hạng", "Kết quả tự nhiên có thể dựa vào vị trí, độ liên quan, thời gian, tình trạng còn chỗ, chất lượng dữ liệu và lựa chọn của người dùng. Kết quả tài trợ còn có thể dựa vào ngân sách, giá thầu và phạm vi chiến dịch; việc trả tiền không biến doanh nghiệp thành “tốt nhất”."],
          ["Đo lường qua OneQR", "Nexora có thể ghi nhận scan, lượt hiển thị, click đủ điều kiện, booking, redeem hoặc giao dịch hoàn tất để báo cáo và tính phí/chia sẻ doanh thu. Scan menu và thao tác tiện ích cơ bản không tự động trở thành một click quảng cáo tính phí."],
          ["Trách nhiệm nội dung", "Nhà quảng cáo phải chứng minh tuyên bố về giá, tiết kiệm, thời hạn và tính sẵn có. Nexora có thể từ chối hoặc gỡ quảng cáo gây hiểu nhầm, thiếu thông tin bắt buộc, vi phạm quyền sở hữu trí tuệ hoặc nhắm mục tiêu không phù hợp."],
        ],
      },
      california: {
        title: "Quyền riêng tư California",
        lead: "Nếu CCPA/CPRA áp dụng cho bạn hoặc cho hoạt động của chúng tôi, bạn có các quyền dưới đây mà không bị phân biệt đối xử.",
        sections: [
          ["Các quyền chính", "Yêu cầu biết và nhận bản sao dữ liệu; sửa dữ liệu không chính xác; xóa dữ liệu trong các trường hợp áp dụng; biết các nhóm bên nhận dữ liệu; từ chối việc bán hoặc chia sẻ cho quảng cáo theo hành vi xuyên ngữ cảnh; và giới hạn việc dùng dữ liệu nhạy cảm khi luật yêu cầu."],
          ["Global Privacy Control", "Khi pháp luật yêu cầu, chúng tôi sẽ xử lý tín hiệu Global Privacy Control hợp lệ từ trình duyệt hoặc thiết bị như một yêu cầu từ chối cho trình duyệt/thiết bị đó."],
          ["Gửi yêu cầu", "Email support@nexoratouch.com với tiêu đề “California Privacy Request” và mô tả quyền bạn muốn thực hiện. Chúng tôi có thể cần xác minh danh tính hoặc quyền của đại diện được ủy quyền. Không gửi giấy tờ nhạy cảm nếu chưa được yêu cầu qua kênh bảo mật."],
          ["Thông báo tại thời điểm thu thập", "Màn hình xin vị trí, số điện thoại, check-in, booking hoặc redeem phải giải thích dữ liệu nào được lấy và mục đích ngay trước hoặc tại thời điểm thu thập."],
        ],
      },
      sms: {
        title: "Điều khoản SMS và liên lạc",
        lead: "SMS giao dịch và SMS marketing là hai mục đích khác nhau. Đồng ý nhận marketing không phải điều kiện để mua hàng.",
        sections: [
          ["Bạn đồng ý điều gì", "Khi chủ động nhập số và xác nhận, bạn cho phép bên được nêu trên màn hình gửi tin liên quan đến coupon, giữ chỗ, booking, check-in hoặc chương trình đã chọn. Tin marketing chỉ được gửi khi có sự đồng ý phù hợp."],
          ["Tần suất và chi phí", "Tần suất thay đổi theo hoạt động. Phí tin nhắn và dữ liệu của nhà mạng có thể áp dụng. Việc gửi có thể dùng hệ thống tự động, nhưng bạn không bắt buộc phải đồng ý nhận marketing để mua hoặc nhận dịch vụ."],
          ["Dừng và hỗ trợ", "Trả lời STOP, QUIT, END, REVOKE, OPT OUT, CANCEL hoặc UNSUBSCRIBE để rút lại đồng ý; trả lời HELP để được hỗ trợ. Yêu cầu hợp lệ sẽ được xử lý trong thời hạn pháp luật cho phép. Sau khi opt out, bạn có thể nhận một tin xác nhận cuối cùng."],
          ["Đúng số điện thoại", "Bạn xác nhận mình là người dùng hợp pháp của số đã cung cấp và sẽ báo nếu số được đổi hoặc chuyển cho người khác. Nhà mạng không chịu trách nhiệm cho tin bị chậm hoặc không gửi được."],
        ],
      },
    },
  },
  en: {
    eyebrow: "NEXORA DEALS · LEGAL CENTER",
    title: "Know your rights before using an offer",
    intro: "One place for customers and businesses to understand how Nexora Deals works, what data is used, and who is responsible for each offer.",
    status: "Product draft · U.S. legal review required before official release",
    effective: "Proposed effective date: October 1, 2026 · Version 1.0",
    languageNote: "Vietnamese and English are maintained separately. If versions differ after release, the version designated in the official terms will control.",
    tabs: {
      overview: ["Overview", "⌂"],
      guest: ["Guest", "◌"],
      member: ["Member", "●"],
      terms: ["Terms", "§"],
      privacy: ["Privacy", "◉"],
      business: ["Businesses", "▣"],
      offers: ["Offer rules", "🏷️"],
      sponsored: ["Advertising", "AD"],
      california: ["California", "CA"],
      sms: ["SMS", "✉"],
    },
    docs: {
      overview: {
        title: "Nexora Deals Legal Center",
        lead: "Nexora Deals is the discovery layer for deals, coupons, Last Minute inventory, and local programs connected to Nexora Touch and OneQR.",
        sections: [
          ["Operator", "The platform is operated by Nexora Touch LLC. Product support: support@nexoratouch.com. Contact address: 5444 Westheimer Rd, Ste 1000, Houston, TX 77056-5318, United States."],
          ["What Nexora does", "Nexora provides discovery, search, advertising, reservation, measurement, and merchant handoff technology. Nexora Deals is not the seller, does not collect payment for an offer, and does not issue refunds. The publishing merchant supplies the service and is responsible for quality, safety, pricing, taxes, refund/cancellation terms, and fulfillment."],
          ["Before you use an offer", "Read the conditions on the card and detail page, including expiration, quantity, eligibility, hours, location, booking, and cancellation terms. Claiming a coupon does not guarantee availability when merchant confirmation is required."],
        ],
      },
      guest: {
        title: "Guest User Terms",
        lead: "Guests may explore Nexora Deals without creating an account; additional information is requested only when an offer must be claimed, held, or confirmed.",
        sections: [
          ["Browse without an account", "You may open the site, search, filter by industry, view Deal Nearby, categories, ads, and offer conditions without a NEXORA ID. Some choices may be stored temporarily on your device so the experience works correctly."],
          ["Location and search", "Nexora may use an area you enter, IP-derived location, or approximate location to show relevant results. Precise location is used only after permission, and you may disable that permission in your browser or device."],
          ["Claim by phone number", "Some coupons and reservations allow a Guest to enter a phone number without registering. The number may be used to prevent duplicate claims, send confirmation, locate the offer at the POS, and redeem it correctly. Entering a number does not automatically create a member account."],
          ["Transactional and marketing texts", "Confirmation texts about a coupon, booking, or check-in support the action you requested. Marketing or later campaigns require separate consent where required by law; reply STOP to opt out and HELP for assistance."],
          ["Guest limitations", "Guest mode may not sync Wishlists, coupon history, Deal Match, rewards, or bookings across devices. Locally stored choices may be lost if browser data is cleared or you change devices."],
          ["When merchants receive information", "A merchant does not receive your identity merely because you viewed a deal. Necessary information is shared only when you claim, book, reserve, check in, or ask the merchant to contact you."],
          ["Using offers responsibly", "Review price, expiration, conditions, location, hours, and cancellation rules before use. You may not use another person's number, create fraudulent claims, evade limits, or transfer an offer contrary to its terms."],
          ["Becoming a Member", "If you register or sign in with NEXORA ID, eligible device data may be linked to your account only after the confirmation screen explains the sync. Registration does not by itself authorize marketing."],
        ],
      },
      member: {
        title: "NEXORA ID Member Terms",
        lead: "Members receive a synchronized experience managed through NEXORA ID across connected Nexora services.",
        sections: [
          ["Account and sign-in", "Provide accurate information, protect your credentials, and notify us if you suspect unauthorized access. One NEXORA ID may work across connected Nexora services, but access remains limited by your assigned role."],
          ["Profile and sync", "Nexora may sync language, area, Wishlist, Deal Match, coupons, bookings, check-ins, rewards, and notification choices across devices. Each relevant screen should explain what information is used for that feature."],
          ["Wishlist and Deal Match", "Wishlist stores offers you care about; Deal Match uses the need, budget, time, and areas you choose to find results. Posting a need does not guarantee an offer, price, or availability and does not automatically disclose your identity to every merchant."],
          ["Coupons, bookings, and history", "Claimed coupons, redemption status, bookings, cancellations, no-shows, and transactions may be stored to fulfill offers, provide support, prevent fraud, and resolve disputes. Merchants receive only the data needed for the relevant action."],
          ["Personalization and advertising", "Nexora may use account activity to rank results, recommend offers, and measure performance. Paid content must still carry an Ad or Sponsored label, and available privacy choices remain available to you."],
          ["Notifications and consent", "You may manage SMS, email, and push by purpose. Consent to transactional notices is not consent to marketing; withdrawing marketing consent does not prevent notices needed to complete an open booking or transaction."],
          ["Rewards and benefits", "Points, coupon wallet items, member offers, or benefits may have separate eligibility, expiration, and limit rules. Rewards are not cash unless specific terms say otherwise, and balances caused by fraud or technical error may be corrected."],
          ["Suspension and termination", "Nexora may restrict features or suspend an account for security risk, fraud, coupon abuse, or a terms violation. Existing bookings, coupons, and duties between the customer and merchant remain the merchant’s responsibility under the published offer terms and applicable law."],
          ["Account management and deletion", "You may request access, correction, or deletion as provided by applicable law. Some records may be retained as needed to complete transactions, comply with tax and accounting duties, resolve disputes, secure the service, or prevent fraud."],
        ],
      },
      terms: {
        title: "Terms of Use",
        lead: "These platform rules apply when you access, search, save, claim, or use an offer on Nexora Deals.",
        sections: [
          ["Accounts and accuracy", "You may browse without an account. Features such as synced Wishlists, coupons, reservations, or rewards may require a NEXORA ID. You must provide accurate information, protect your credentials, and not use another person's identity or phone number without permission."],
          ["Merchant role", "Merchants control their offer content, conditions, quantity, price, schedule, capacity, and fulfillment. Nexora may review formatting, merchant identity, or fraud signals, but a “verified” label is not a guarantee of service quality or outcome."],
          ["Prohibited conduct", "You may not create fake accounts, harvest codes, unlawfully resell coupons, evade usage limits, publish misleading content, manipulate reviews, attack the service, or use the platform for unlawful activity."],
          ["Content and intellectual property", "Nexora-created brands, interfaces, software, and content belong to Nexora or its licensors. Merchants retain their submitted content but grant Nexora permission to display, format, translate, distribute, and measure it to operate and promote the program."],
          ["Reasonable limitations", "The service may change, pause, or contain errors. To the extent permitted by law, Nexora is not responsible for services performed by merchants or indirect losses. Nothing limits non-waivable consumer rights under applicable law."],
        ],
      },
      privacy: {
        title: "Privacy Notice",
        lead: "We collect data needed to operate the experience, prevent fraud, measure performance, and support users.",
        sections: [
          ["Data we may collect", "NEXORA ID and contact data; approximate or precise location when permitted; search terms, filters, Wishlists, and Deal Match requests; coupon, booking, check-in, redemption, and transaction data; device data, logs, OneQR scans, views/clicks, attribution source; and merchant-provided content."],
          ["How we use data", "To provide nearby results; save and sync selections; route coupons and bookings to the correct merchant; send requested notices; secure the service and prevent abuse; measure campaigns; improve products; provide support; and comply with law."],
          ["When data is disclosed", "To a merchant when you claim, book, reserve, or ask to be contacted; to service providers supporting infrastructure, communications, analytics, or fraud prevention; to authorities when legally required; or in a lawful organizational transaction. A merchant does not receive your identity merely because you viewed a card."],
          ["Your choices", "You may decline precise location, turn off notifications, withdraw marketing consent, clear locally saved data, and request access, correction, or deletion where applicable. Some records may be retained to complete transactions, resolve disputes, prevent fraud, or comply with law."],
          ["Children and security", "Nexora Deals is not directed to children under 13. We use appropriate technical and organizational safeguards, but no transmission or storage system is completely secure."],
        ],
      },
      business: {
        title: "Business Terms",
        lead: "These terms apply to owners, managers, and authorized users who create Promotions, Deals, Coupons, Last Minute offers, or advertising through Nexora Touch and OneQR.",
        sections: [
          ["Authority and business profile", "The person creating a program confirms authority to act for the named business, location, or service provider. Business records, licenses, address, tax details, payout account, and contacts must be accurate, current, and updated when they change."],
          ["Content and substantiation", "Every statement about price, discount, reference price, outcome, quality, review, image, duration, and availability must be truthful, not misleading, and reasonably supported before publication. The business must have permission to use all names, images, logos, music, reviews, and uploaded content."],
          ["Program classification", "A Deal is a program or banner without a limited code inventory; a Coupon uses a code or QR with quantity or redemption limits; Last Minute is tied to perishable inventory or a specific open time. Businesses may not misclassify a program to avoid limits, fees, redemption rules, or the duty to disclose refund and cancellation terms."],
          ["Prices, fees, and conditions", "The final price, mandatory fees, determinable taxes, minimum spend, eligibility, location, hours, expiration, quantity, cancellation policy, and stacking restrictions must be clear before claim or purchase. A strikethrough price must be a genuine reference price and may not be inflated to create a false discount."],
          ["Inventory, schedule, and fulfillment", "The business must sync inventory, open times, and service capacity; pause programs when sold out or fully booked; train staff to redeem; and honor the terms the customer received. Nexora may automatically hide an offer when it expires, sells out, reaches capacity, or contains inconsistent data."],
          ["Refunds, cancellations, and disputes", "The business must clearly publish its refund, cancellation, rescheduling, and no-show terms before a customer claims or uses an offer and must handle customer requests directly. Payment takes place between the customer and the business. Nexora Deals is a discovery/advertising channel, is not the seller, does not collect payment, and does not issue refunds for that transaction."],
          ["Customer data and SMS", "Customer data may be used only for the purpose requested or consented to. A business may not download, sell, share, or use phone, location, booking, or coupon data for unauthorized marketing. Marketing texts require appropriate consent, sender identification, proof of consent, and STOP/HELP support; consent is not a condition of purchase."],
          ["Advertising and OneQR", "Paid placements must retain a “Sponsored” or “Ad” label. Businesses may not hide labels, impersonate organic results, create fraudulent clicks/scans/transactions, or ask staff to self-interact for revenue. Opening a menu or using a basic OneQR utility does not automatically count as a billable ad click."],
          ["Regulated categories and prohibited content", "Healthcare, financial, legal, alcohol, drug, adult, gambling, age-restricted, and licensed services may require additional documentation, audience/location restrictions, or may be rejected. Counterfeits, dangerous content, discrimination, fraud, and unlawful programs are prohibited."],
          ["Review and enforcement", "Nexora may request proof, require corrections, pause distribution, cancel a program, or suspend advertising privileges when there is customer risk, fraud, or a violation. The business remains responsible for obligations, refunds, and disputes created before suspension."],
        ],
      },
      offers: {
        title: "Deal, Coupon & Last Minute Rules",
        lead: "The three offer types work differently, and each card must clearly identify what the customer is receiving.",
        sections: [
          ["Deals", "A public banner or program that is generally not limited by a code count. A Deal may have minimum-spend, new-customer, time, service, or location conditions and remains subject to merchant capacity."],
          ["Coupons", "A code or QR that may be limited by quantity, one per customer, expiration, or stacking rules. A Coupon is used when the merchant confirms redemption; screenshots or transfers do not change the original terms."],
          ["Last Minute", "Perishable inventory or a specific open time sold near the time of use. The price applies only to the displayed item, professional, location, pickup time, or appointment window. A hold is complete only after confirmation appears."],
          ["Prices, fees, and refund/cancellation terms", "Strikethrough prices must be truthful reference prices. The merchant must publish the price, mandatory fees, and refund, cancellation, or rescheduling terms in the offer conditions. Customers pay the merchant directly; Nexora Deals does not collect payment or issue refunds."],
          ["Expiration and changes", "A merchant may not disadvantage a customer by unlawfully changing terms after claim. Nexora may hide, pause, or cancel offers that are misleading, unavailable, unsafe, fraudulent, or violate policy."],
        ],
      },
      sponsored: {
        title: "Sponsored Content and Advertising",
        lead: "Businesses may pay for distribution, but paid placement must be recognizable and must not impersonate organic results.",
        sections: [
          ["Clear labels", "Paid placements use labels such as “Sponsored” or “Ad” on the content itself, visible on mobile and in the same language as the experience."],
          ["Ranking", "Organic results may consider location, relevance, time, availability, data quality, and user choices. Sponsored ranking may also consider budget, bid, and campaign scope; payment does not mean the business is “best”."],
          ["OneQR measurement", "Nexora may measure scans, impressions, qualified clicks, bookings, redemptions, or completed transactions for reporting, billing, and revenue share. Opening a menu or using a basic utility does not automatically become a billable ad click."],
          ["Advertiser responsibility", "Advertisers must support claims about price, savings, duration, and availability. Nexora may reject or remove ads that mislead, omit required information, infringe rights, or use inappropriate targeting."],
        ],
      },
      california: {
        title: "California Privacy Rights",
        lead: "If the CCPA/CPRA applies to you or our activities, you may exercise the following rights without discrimination.",
        sections: [
          ["Core rights", "Request to know and receive a copy; correct inaccurate information; delete when applicable; learn categories of recipients; opt out of sale or sharing for cross-context behavioral advertising; and limit sensitive information use where required."],
          ["Global Privacy Control", "Where required, we will treat a valid Global Privacy Control signal from a browser or device as an opt-out request for that browser or device."],
          ["Submit a request", "Email support@nexoratouch.com with the subject “California Privacy Request” and describe the right you wish to exercise. We may verify your identity or an authorized agent's authority. Do not send sensitive documents unless requested through a secure channel."],
          ["Notice at collection", "Location, phone, check-in, booking, and redemption screens should explain what data is collected and why at or before collection."],
        ],
      },
      sms: {
        title: "SMS and Communications Terms",
        lead: "Transactional messages and marketing messages serve different purposes. Marketing consent is not a condition of purchase.",
        sections: [
          ["Your consent", "When you enter a number and confirm, you authorize the sender identified on screen to send messages about the selected coupon, reservation, booking, check-in, or program. Marketing texts are sent only with appropriate consent."],
          ["Frequency and cost", "Frequency varies by activity. Carrier message and data rates may apply. Messages may use automated technology, but you are not required to consent to marketing to purchase or receive services."],
          ["Stop and help", "Reply STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, or UNSUBSCRIBE to withdraw consent; reply HELP for support. Valid requests are honored within the legally permitted period. You may receive one final confirmation message."],
          ["Correct phone number", "You confirm that you are the authorized user of the number and will notify us if it changes or is reassigned. Carriers are not liable for delayed or undelivered messages."],
        ],
      },
    },
  },
};

function getLegalCopy() {
  const language = document.querySelector("#languageSelect")?.value || "en";
  return LEGAL_COPY[language] || LEGAL_COPY.en;
}

function renderLegalCenter() {
  const copy = getLegalCopy();
  const active = copy.docs[legalView] ? legalView : "overview";
  const doc = copy.docs[active];
  const language = document.querySelector("#languageSelect")?.value || "en";
  const translationPending = !LEGAL_COPY[language];
  const isVietnamese = language === "vi";
  const businessChecklist = active === "business" ? `<section class="legal-business-checklist">
    <span class="legal-sidebar-icon">▣</span>
    <h3>${isVietnamese ? "Kiểm tra trước khi publish" : "Before you publish"}</h3>
    <ul>
      <li>${isVietnamese ? "Giá và mức tiết kiệm có bằng chứng" : "Price and savings are substantiated"}</li>
      <li>${isVietnamese ? "Điều kiện, phí và hạn dùng hiển thị rõ" : "Terms, fees, and expiration are clear"}</li>
      <li>${isVietnamese ? "Tồn kho hoặc lịch đã đồng bộ" : "Inventory or schedule is synced"}</li>
      <li>${isVietnamese ? "SMS chỉ gửi tới khách đã consent" : "SMS is limited to consented customers"}</li>
    </ul>
    <a class="legal-business-action" href="${buildTouchUrl("/dashboard/pos", { section: "promotions", from: "business-legal" })}" target="_blank" rel="noreferrer">${isVietnamese ? "Mở Nexora Touch Promotion" : "Open Nexora Touch Promotion"}</a>
  </section>` : "";
  const audienceChecklist = active === "guest" ? `<section class="legal-business-checklist">
    <span class="legal-sidebar-icon">◌</span>
    <h3>${isVietnamese ? "Bạn có thể dùng ngay" : "What you can do now"}</h3>
    <ul>
      <li>${isVietnamese ? "Xem và tìm deal không cần tài khoản" : "Browse and search deals without an account"}</li>
      <li>${isVietnamese ? "Vị trí chính xác chỉ dùng khi bạn cho phép" : "Precise location is used only with permission"}</li>
      <li>${isVietnamese ? "Nhập số điện thoại không tự động tạo tài khoản" : "Entering a phone number does not create an account"}</li>
      <li>${isVietnamese ? "Tin marketing cần sự đồng ý riêng" : "Marketing messages require separate consent"}</li>
    </ul>
  </section>` : active === "member" ? `<section class="legal-business-checklist">
    <span class="legal-sidebar-icon">●</span>
    <h3>${isVietnamese ? "Quyền của Thành viên" : "Member controls"}</h3>
    <ul>
      <li>${isVietnamese ? "Đồng bộ Wishlist, Deal Match và coupon" : "Sync Wishlist, Deal Match, and coupons"}</li>
      <li>${isVietnamese ? "Quản lý thông báo theo từng mục đích" : "Manage notifications by purpose"}</li>
      <li>${isVietnamese ? "Xem lịch sử và trạng thái sử dụng ưu đãi" : "View offer history and redemption status"}</li>
      <li>${isVietnamese ? "Yêu cầu truy cập, sửa hoặc xóa tài khoản" : "Request access, correction, or account deletion"}</li>
    </ul>
  </section>` : "";
  return `<div class="legal-center" data-legal-center>
    <header class="legal-hero">
      <div><span class="legal-eyebrow">${copy.eyebrow}</span><h1>${copy.title}</h1><p>${copy.intro}</p></div>
      <div class="legal-version"><span>${copy.effective}</span><strong>${copy.status}</strong></div>
    </header>
    ${translationPending ? `<div class="legal-language-warning">⚠ ${language === "es" ? "La traducción legal certificada aún está en revisión. Se muestra la versión oficial en inglés." : language === "zh-TW" ? "法律翻譯仍在專業審核中，目前顯示英文正式版本。" : "법률 번역은 전문 검토 중이며 현재 공식 영문 버전이 표시됩니다."}</div>` : ""}
    <nav class="legal-tabs" aria-label="Legal documents">${Object.entries(copy.tabs).map(([id, [label, icon]]) => `<button type="button" class="${id === active ? "active" : ""}" data-legal-view="${id}" aria-pressed="${id === active}"><span>${icon}</span>${label}</button>`).join("")}</nav>
    <div class="legal-layout">
      <article class="legal-document dw-card">
        <div class="legal-document-heading"><span>${copy.eyebrow}</span><h2>${doc.title}</h2><p>${doc.lead}</p></div>
        <div class="legal-sections">${doc.sections.map(([title, body], index) => `<section><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${title}</h3><p>${body}</p></div></section>`).join("")}</div>
      </article>
      <aside class="legal-sidebar">
        ${businessChecklist}
        ${audienceChecklist}
        <section class="dw-card"><span class="legal-sidebar-icon">✓</span><h3>${language === "vi" ? "Thiết kế để dễ hiểu" : "Designed for clarity"}</h3><p>${copy.languageNote}</p></section>
        <section class="dw-card"><span class="legal-sidebar-icon">@</span><h3>${language === "vi" ? "Liên hệ" : "Contact"}</h3><a href="mailto:support@nexoratouch.com">support@nexoratouch.com</a><p>Nexora Touch LLC<br>5444 Westheimer Rd, Ste 1000<br>Houston, TX 77056-5318</p></section>
        <section class="legal-status-card" aria-label="${isVietnamese ? "Thông tin pháp lý hiện hành" : "Current legal information"}">
          <span class="legal-sidebar-icon">§</span>
          <h3>${isVietnamese ? "Thông tin pháp lý hiện hành" : "Current legal information"}</h3>
          <dl>
            <div><dt>${isVietnamese ? "Đơn vị vận hành" : "Operator"}</dt><dd>Nexora Touch LLC</dd></div>
            <div><dt>${isVietnamese ? "Yêu cầu quyền riêng tư" : "Privacy requests"}</dt><dd><a href="mailto:support@nexoratouch.com">support@nexoratouch.com</a></dd></div>
            <div><dt>${isVietnamese ? "Vai trò của Nexora" : "Nexora’s role"}</dt><dd>${isVietnamese ? "Kênh khám phá và quảng cáo; không thu tiền cho ưu đãi." : "Discovery and advertising channel; no offer payments are collected."}</dd></div>
            <div><dt>${isVietnamese ? "Hoàn tiền & hủy" : "Refunds & cancellations"}</dt><dd>${isVietnamese ? "Doanh nghiệp phải công bố chính sách và xử lý trực tiếp với khách." : "The merchant must publish its policy and handle requests directly."}</dd></div>
          </dl>
          <p>${isVietnamese ? "Điều khoản và Thông báo quyền riêng tư trên trang này giải thích các quy tắc hiện tại dành cho người dùng." : "The Terms and Privacy Notice on this page explain the current user-facing rules."}</p>
          <div class="legal-status-links">
            <button type="button" data-legal-view="terms">${isVietnamese ? "Xem Điều khoản" : "View Terms"}</button>
            <button type="button" data-legal-view="privacy">${isVietnamese ? "Xem Quyền riêng tư" : "View Privacy"}</button>
            <button class="wide" type="button" data-legal-view="california">${isVietnamese ? "Quyền riêng tư California" : "California Privacy Rights"}</button>
          </div>
        </section>
      </aside>
    </div>
  </div>`;
}

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

const couponTaxonomy = {"groups":[{"id":"beauty","ic":"💅","vi":"Làm đẹp & chăm sóc cá nhân","en":"Beauty & personal care"},{"id":"food","ic":"🍜","vi":"Ăn uống","en":"Food & drink"},{"id":"shop","ic":"🛍️","vi":"Mua sắm & chợ","en":"Shopping & markets"},{"id":"health","ic":"🩺","vi":"Sức khỏe & Wellness","en":"Health & wellness"},{"id":"auto","ic":"🚗","vi":"Xe & di chuyển","en":"Auto & transport"},{"id":"home","ic":"🏠","vi":"Nhà cửa & sửa chữa","en":"Home & repair"},{"id":"finance","ic":"💼","vi":"Tài chính · pháp lý · địa ốc","en":"Finance · legal · real estate"},{"id":"travel","ic":"✈️","vi":"Du lịch · khách sạn · homestay","en":"Travel · hotels · homestays"},{"id":"edu","ic":"🎓","vi":"Giáo dục & đào tạo","en":"Education & training"},{"id":"event","ic":"🎉","vi":"Sự kiện & giải trí","en":"Events & entertainment"},{"id":"family","ic":"👶","vi":"Gia đình & thú cưng","en":"Family & pets"},{"id":"biz","ic":"🏢","vi":"Dịch vụ doanh nghiệp & công nghệ","en":"Business services & tech"},{"id":"community","ic":"⛪","vi":"Cộng đồng & phi lợi nhuận","en":"Community & non-profit"}],"inds":[{"id":"nail","g":"beauty","vi":"Nail","en":"Nail salon","ic":"💅","kw":"gel-?x|bột|bot nail|acrylic|dip|sơn gel|son gel|nail|móng|mong tay|pedicure|manicure|builder gel|hard gel|soak off|chân|chan"},{"id":"spa","g":"beauty","vi":"Spa & Massage","en":"Spa & massage","ic":"💆","kw":"massage|spa|xoa bóp|xoa bop|gội đầu dưỡng sinh|goi dau"},{"id":"lash","g":"beauty","vi":"Mi & chân mày","en":"Lashes & brows","ic":"👁️","kw":"mi\\b|lash|chân mày|chan may|brow"},{"id":"hair","g":"beauty","vi":"Tóc & salon","en":"Hair salon","ic":"💇","kw":"tóc|toc|hair|cắt|nhuộm|nhuom|uốn|uon"},{"id":"barber","g":"beauty","vi":"Barber / tóc nam","en":"Barbershop","ic":"💈","kw":"barber|tóc nam|toc nam|cạo râu|fade"},{"id":"skin","g":"beauty","vi":"Da & facial","en":"Skin & facial","ic":"🧖","kw":"facial|da mặt|da mat|skincare|trị mụn|tri mun|peel"},{"id":"pmu","g":"beauty","vi":"Phun xăm / PMU / xăm","en":"PMU & tattoo","ic":"🖋️","kw":"phun xăm|phun xam|phun xăm chân mày|phun xam chan may|phun môi|phun moi|pmu|xăm|xam\\b|tattoo|microblading|điêu khắc|dieu khac"},{"id":"medspa","g":"beauty","vi":"Thẩm mỹ y khoa","en":"Medspa & aesthetics","ic":"💉","kw":"botox|filler|laser|triệt lông|triet long|thẩm mỹ|tham my|medspa|nâng cơ|giảm mỡ"},{"id":"wax","g":"beauty","vi":"Wax / tẩy lông","en":"Waxing","ic":"🪒","kw":"wax|tẩy lông|tay long|sugaring"},{"id":"fitness","g":"beauty","vi":"Gym & thể hình","en":"Gym & fitness","ic":"🏋️","kw":"gym|thể hình|the hinh|fitness|tập|pt\\b|crossfit"},{"id":"yoga","g":"beauty","vi":"Yoga & pilates","en":"Yoga & pilates","ic":"🧘","kw":"yoga|pilates|thiền|thien|meditation"},{"id":"diet","g":"beauty","vi":"Giảm cân & dinh dưỡng","en":"Weight loss & nutrition","ic":"🥗","kw":"giảm cân|giam can|dinh dưỡng|dinh duong|detox|keto"},{"id":"food","g":"food","vi":"Nhà hàng / quán ăn","en":"Restaurant","ic":"🍜","kw":"nhà hàng|nha hang|quán ăn|quan an|phở|pho\\b|bún|bun bo|cơm|com tam|restaurant|lunch|dinner|ăn trưa|an trua|ăn tối"},{"id":"fastfood","g":"food","vi":"Bánh mì / ăn nhanh","en":"Fast food & sandwiches","ic":"🥖","kw":"bánh mì|banh mi|ăn nhanh|fast food|xôi|xoi|bánh cuốn"},{"id":"drink","g":"food","vi":"Cà phê / trà sữa","en":"Coffee & bubble tea","ic":"🧋","kw":"trà sữa|tra sua|cà phê|ca phe|cafe|coffee|boba|sinh tố|nước ép|nuoc ep"},{"id":"bakery","g":"food","vi":"Bánh / tiệc ngọt","en":"Bakery & desserts","ic":"🎂","kw":"bánh kem|banh kem|bánh sinh nhật|bakery|chè\\b|che\\b|dessert|kem\\b"},{"id":"hotpot","g":"food","vi":"Lẩu · nướng · buffet","en":"Hotpot · BBQ · buffet","ic":"🍲","kw":"lẩu|lau\\b|nướng|nuong|buffet|bbq|kbbq"},{"id":"seafood","g":"food","vi":"Hải sản","en":"Seafood","ic":"🦞","kw":"hải sản|hai san|cua|tôm|tom hùm|crawfish|seafood"},{"id":"vegan","g":"food","vi":"Chay","en":"Vegetarian & vegan","ic":"🥬","kw":"chay|vegan|vegetarian|thuần chay"},{"id":"foodtruck","g":"food","vi":"Food truck","en":"Food truck","ic":"🚚","kw":"food truck|xe đồ ăn|xe do an"},{"id":"bar","g":"food","vi":"Bar · pub · karaoke","en":"Bar · pub · karaoke","ic":"🍻","kw":"bar\\b|pub\\b|karaoke|nhậu|nhau\\b|bia\\b|beer|lounge"},{"id":"banquet","g":"food","vi":"Nhà hàng tiệc cưới","en":"Wedding banquet hall","ic":"🏛️","kw":"tiệc cưới|tiec cuoi|banquet|nhà hàng tiệc|hội trường"},{"id":"catering","g":"food","vi":"Catering / đặt tiệc","en":"Catering","ic":"🍽️","kw":"catering|đặt tiệc|dat tiec|nấu tiệc|party tray"},{"id":"homefood","g":"food","vi":"Đồ ăn nhà làm / online","en":"Home-cooked & online food","ic":"🥡","kw":"nhà làm|nha lam|đặt online|ship đồ ăn|homemade|đặc sản|dac san"},{"id":"market","g":"shop","vi":"Chợ / siêu thị","en":"Grocery & market","ic":"🛒","kw":"chợ|cho\\b|siêu thị|sieu thi|grocery|market|rau|thịt|thit\\b|gạo|gao\\b|nước mắm"},{"id":"convenience","g":"shop","vi":"Tiện lợi / tạp hoá","en":"Convenience store","ic":"🏪","kw":"tiện lợi|tien loi|tạp hoá|tap hoa|convenience|smoke shop|vape"},{"id":"supply","g":"shop","vi":"Supply nail & spa / đồ nghề","en":"Nail & spa supply","ic":"📦","kw":"supply|đồ nghề|do nghe|vật tư|vat tu|bột nail|máy mài|may mai|máy hút|ghế spa|ghe spa|đèn gel|sỉ\\b|wholesale"},{"id":"cosmetic","g":"shop","vi":"Mỹ phẩm / nước hoa","en":"Cosmetics & perfume","ic":"💄","kw":"mỹ phẩm|my pham|nước hoa|nuoc hoa|son môi|skincare shop|sephora"},{"id":"import","g":"shop","vi":"Hàng xách tay","en":"Imported goods","ic":"🧳","kw":"xách tay|xach tay|hàng mỹ|hang my|hàng nhật|order hàng"},{"id":"fashion","g":"shop","vi":"Thời trang / áo dài","en":"Fashion & áo dài","ic":"👗","kw":"quần áo|quan ao|áo dài|ao dai|thời trang|thoi trang|boutique"},{"id":"shoes","g":"shop","vi":"Giày / túi xách","en":"Shoes & bags","ic":"👜","kw":"giày|giay\\b|túi xách|tui xach|dép|sneaker"},{"id":"jewelry","g":"shop","vi":"Vàng bạc / trang sức","en":"Jewelry & gold","ic":"💍","kw":"vàng|vang bac|nữ trang|nu trang|trang sức|jewelry|kim cương|nhẫn"},{"id":"electronics","g":"shop","vi":"Điện thoại / điện tử","en":"Phones & electronics","ic":"📱","kw":"điện thoại|dien thoai|iphone|laptop|điện tử|dien tu|tivi|máy tính"},{"id":"furniture","g":"shop","vi":"Nội thất / gia dụng","en":"Furniture & appliances","ic":"🛋️","kw":"nội thất|noi that|furniture|sofa|giường|nệm|nem\\b|gia dụng|gia dung|máy giặt|tủ lạnh"},{"id":"flower","g":"shop","vi":"Hoa tươi / quà tặng","en":"Flowers & gifts","ic":"💐","kw":"hoa tươi|hoa tuoi|florist|quà|qua tang|gift shop|giỏ quà"},{"id":"eyewear","g":"shop","vi":"Kính thời trang","en":"Eyewear store","ic":"🕶️","kw":"kính mát|kinh mat|sunglass|gọng kính|gong kinh"},{"id":"dental","g":"health","vi":"Nha sĩ","en":"Dentist","ic":"🦷","kw":"nha sĩ|nha si|nha khoa|răng|rang\\b|dental|dentist|niềng|nieng|tẩy trắng|implant"},{"id":"eye","g":"health","vi":"Mắt kính / nhãn khoa","en":"Optometry","ic":"👓","kw":"mắt kính|mat kinh|đo mắt|do mat|optometr|eye exam|contact lens|nhãn khoa"},{"id":"clinic","g":"health","vi":"Bác sĩ gia đình / phòng khám","en":"Family doctor & clinic","ic":"🩺","kw":"bác sĩ|bac si|phòng khám|phong kham|clinic|khám|kham benh|chích ngừa|physical|urgent care"},{"id":"specialist","g":"health","vi":"Bác sĩ chuyên khoa","en":"Medical specialist","ic":"🫀","kw":"chuyên khoa|chuyen khoa|tim mạch|da liễu|da lieu|sản phụ|san phu|nội tiết|tiêu hoá|ung thư|cardio|dermatolog"},{"id":"chiro","g":"health","vi":"Chiropractor / vật lý trị liệu","en":"Chiropractic & physical therapy","ic":"🦴","kw":"chiro|nắn xương|nan xuong|vật lý trị liệu|vat ly tri lieu|physical therapy|đau lưng|dau lung|tai nạn xe"},{"id":"acupuncture","g":"health","vi":"Châm cứu / đông y","en":"Acupuncture & herbal","ic":"🌿","kw":"châm cứu|cham cuu|đông y|dong y|thuốc bắc|thuoc bac|acupuncture|bấm huyệt"},{"id":"pharm","g":"health","vi":"Nhà thuốc / thuốc bổ","en":"Pharmacy & supplements","ic":"💊","kw":"nhà thuốc|nha thuoc|pharmacy|thuốc bổ|thuoc bo|vitamin|thực phẩm chức năng"},{"id":"lab","g":"health","vi":"Xét nghiệm / chẩn đoán","en":"Lab & imaging","ic":"🔬","kw":"xét nghiệm|xet nghiem|lab test|siêu âm|sieu am|x-?quang|mri|ct scan"},{"id":"mental","g":"health","vi":"Tâm lý / tư vấn","en":"Mental health & counseling","ic":"🧠","kw":"tâm lý|tam ly|counsel|therapy|therapist|trầm cảm|tram cam|stress"},{"id":"homehealth","g":"health","vi":"Chăm sóc người già / tại nhà","en":"Home health & senior care","ic":"👴","kw":"người già|nguoi gia|home health|chăm sóc tại nhà|cham soc tai nha|dưỡng lão|duong lao|caregiver"},{"id":"carwash","g":"auto","vi":"Rửa xe / detailing","en":"Car wash & detailing","ic":"🧽","kw":"rửa xe|rua xe|car ?wash|detailing|đánh bóng xe|danh bong"},{"id":"mechanic","g":"auto","vi":"Sửa xe / thay nhớt","en":"Auto repair & oil change","ic":"🔧","kw":"sửa xe|sua xe|thay nhớt|thay nhot|oil change|mechanic|bảo dưỡng|bao duong|check engine"},{"id":"tire","g":"auto","vi":"Lốp / thắng","en":"Tires & brakes","ic":"🛞","kw":"lốp|lop xe|tire|thắng|thang xe|brake|bánh xe|banh xe"},{"id":"bodyshop","g":"auto","vi":"Body shop / sơn xe","en":"Body shop & paint","ic":"🚘","kw":"body shop|sơn xe|son xe|đụng xe|dung xe|collision|móp|mop\\b|dent"},{"id":"tint","g":"auto","vi":"Tint / phụ kiện / audio","en":"Tint · accessories · audio","ic":"🎛️","kw":"tint|dán kính|dan kinh|phụ kiện xe|phu kien xe|audio|loa xe|camera hành trình|ppf|wrap"},{"id":"dealer","g":"auto","vi":"Mua bán xe","en":"Car sales & dealer","ic":"🚙","kw":"mua xe|ban xe|bán xe|dealer|xe cũ|xe cu|used car|xe mới"},{"id":"carrental","g":"auto","vi":"Cho thuê xe","en":"Car rental","ic":"🔑","kw":"thuê xe|thue xe|rent a car|car rental|turo"},{"id":"ride","g":"auto","vi":"Đưa đón / taxi / sân bay","en":"Rides · taxi · airport","ic":"🚕","kw":"đưa đón|dua don|đưa rước|ride|taxi|sân bay|san bay|airport|shuttle|uber"},{"id":"bus","g":"auto","vi":"Xe đò / xe khách","en":"Intercity bus","ic":"🚌","kw":"xe đò|xe do|xe khách|xe khach|charter|đi dallas|đi cali"},{"id":"moving","g":"auto","vi":"Vận chuyển / dọn nhà","en":"Moving & hauling","ic":"🚚","kw":"vận chuyển|van chuyen|dọn nhà|don nha|moving|chở hàng|cho hang|hauling"},{"id":"cargo","g":"auto","vi":"Gửi hàng về VN / cargo","en":"Cargo to Vietnam","ic":"📦","kw":"gửi hàng|gui hang|gửi về việt nam|gui ve viet nam|cargo|ship về|ship ve|freight|thùng hàng|thung hang"},{"id":"inspection","g":"auto","vi":"Đăng kiểm / giấy tờ xe","en":"Inspection & registration","ic":"📋","kw":"đăng kiểm|dang kiem|inspection|registration|title xe|giấy tờ xe|giay to xe"},{"id":"clean","g":"home","vi":"Dọn dẹp nhà cửa","en":"House cleaning","ic":"🧹","kw":"dọn dẹp|don dep|cleaning|dọn nhà|lau nhà|maid"},{"id":"remodel","g":"home","vi":"Sửa nhà / remodel","en":"Remodeling & contractor","ic":"🔨","kw":"sửa nhà|sua nha|remodel|handyman|contractor|xây|xay dung|cải tạo"},{"id":"plumbing","g":"home","vi":"Điện / nước","en":"Electrical & plumbing","ic":"🔌","kw":"điện|dien nuoc|thợ điện|tho dien|nước|plumb|ống nước|ong nuoc|rò rỉ"},{"id":"hvac","g":"home","vi":"Điện lạnh / HVAC","en":"HVAC","ic":"❄️","kw":"máy lạnh|may lanh|hvac|ac repair|điện lạnh|dien lanh|sưởi|heater|furnace"},{"id":"roof","g":"home","vi":"Mái nhà / roofing","en":"Roofing","ic":"🏚️","kw":"mái|mai nha|roof|dột|dot\\b|gutter"},{"id":"floor","g":"home","vi":"Sàn / gạch / đá","en":"Flooring & tile","ic":"🧱","kw":"sàn|san go|gạch|gach\\b|tile|đá granite|countertop|laminate"},{"id":"paint","g":"home","vi":"Sơn nhà","en":"Painting","ic":"🎨","kw":"sơn nhà|son nha|painting|sơn tường"},{"id":"landscape","g":"home","vi":"Sân vườn / cây cảnh","en":"Landscaping","ic":"🌳","kw":"sân vườn|san vuon|landscap|cắt cỏ|cat co|cây cảnh|cay canh|tưới"},{"id":"pool","g":"home","vi":"Hồ bơi","en":"Pool service","ic":"🏊","kw":"hồ bơi|ho boi|pool|bể bơi"},{"id":"pest","g":"home","vi":"Diệt côn trùng","en":"Pest control","ic":"🐜","kw":"côn trùng|con trung|pest|mối|moi\\b|gián|chuột|termite"},{"id":"garage","g":"home","vi":"Cửa / garage / cửa sổ","en":"Doors · garage · windows","ic":"🚪","kw":"garage|cửa|cua so|window|cửa sổ|khoá cửa"},{"id":"security","g":"home","vi":"Camera / an ninh / smart home","en":"Security & smart home","ic":"📹","kw":"camera|an ninh|báo động|bao dong|alarm|smart home|ring"},{"id":"laundry","g":"home","vi":"Giặt ủi / dry clean","en":"Laundry & dry cleaning","ic":"👕","kw":"giặt|giat ui|ủi|dry clean|laundry|sửa quần áo|alteration"},{"id":"locksmith","g":"home","vi":"Thợ khoá","en":"Locksmith","ic":"🗝️","kw":"thợ khoá|tho khoa|locksmith|làm chìa|mất chìa"},{"id":"tax","g":"finance","vi":"Thuế / kế toán","en":"Tax & accounting","ic":"🧾","kw":"thuế|thue\\b|1099|khai thuế|tax|kế toán|ke toan|bookkeep|payroll|cpa"},{"id":"insurance","g":"finance","vi":"Bảo hiểm","en":"Insurance","ic":"🛡️","kw":"bảo hiểm|bao hiem|insurance|nhân thọ|nhan tho|obamacare|medicare"},{"id":"remit","g":"finance","vi":"Gửi tiền / đổi tiền","en":"Money transfer & exchange","ic":"💸","kw":"gửi tiền|gui tien|chuyển tiền|chuyen tien|đổi tiền|doi tien|remit|western union|nexora touch pay"},{"id":"loan","g":"finance","vi":"Vay / mortgage","en":"Loans & mortgage","ic":"🏦","kw":"vay|mortgage|loan|tín dụng|tin dung|refinance|credit"},{"id":"immigration","g":"finance","vi":"Luật sư di trú","en":"Immigration lawyer","ic":"🛂","kw":"luật sư di trú|luat su di tru|di trú|di tru|immigration|bảo lãnh|bao lanh|thẻ xanh|the xanh|quốc tịch|quoc tich|h1b|eb5|đoàn tụ"},{"id":"injury","g":"finance","vi":"Luật sư tai nạn / thương tích","en":"Injury lawyer","ic":"⚖️","kw":"tai nạn|tai nan|thương tích|thuong tich|injury|kiện|kien tung|bồi thường|boi thuong"},{"id":"lawyer","g":"finance","vi":"Luật sư gia đình / kinh doanh","en":"Family & business lawyer","ic":"📜","kw":"luật sư|luat su|lawyer|attorney|ly hôn|ly hon|di chúc|hợp đồng|hop dong|llc"},{"id":"notary","g":"finance","vi":"Công chứng / dịch thuật","en":"Notary & translation","ic":"✒️","kw":"công chứng|cong chung|notary|dịch thuật|dich thuat|translation|giấy tờ"},{"id":"realtor","g":"finance","vi":"Địa ốc mua bán","en":"Real estate agent","ic":"🏡","kw":"địa ốc|dia oc|realtor|mua nhà|mua nha|bán nhà|ban nha|real estate|nhà đất"},{"id":"rental","g":"finance","vi":"Cho thuê / quản lý nhà","en":"Rental & property management","ic":"🏘️","kw":"cho thuê|cho thue|thuê nhà|thue nha|apartment|phòng trọ|phong tro|property management"},{"id":"invest","g":"finance","vi":"Đầu tư / crypto","en":"Investing & crypto","ic":"📈","kw":"đầu tư|dau tu|crypto|bitcoin|chứng khoán|chung khoan|stock|cryptomap"},{"id":"flight","g":"travel","vi":"Vé máy bay","en":"Flights","ic":"🛫","kw":"vé máy bay|ve may bay|flight|vé về việt nam|air ticket"},{"id":"tour","g":"travel","vi":"Tour / du lịch","en":"Tours","ic":"🗺️","kw":"tour|du lịch|du lich|hành hương|hanh huong|cruise|vmmtravel"},{"id":"hotel","g":"travel","vi":"Khách sạn / homestay","en":"Hotels & stays","ic":"🏨","kw":"khách sạn|khach san|hotel|homestay|resort|airbnb"},{"id":"visa","g":"travel","vi":"Visa / hộ chiếu / giấy tờ","en":"Visa & passport services","ic":"🪪","kw":"hộ chiếu|ho chieu|passport|visa việt nam|miễn thị thực|giấy tờ du lịch"},{"id":"vietschool","g":"edu","vi":"Trường Việt ngữ","en":"Vietnamese language school","ic":"🇻🇳","kw":"việt ngữ|viet ngu|tiếng việt|tieng viet|học tiếng"},{"id":"tutor","g":"edu","vi":"Dạy kèm / luyện thi","en":"Tutoring & test prep","ic":"📚","kw":"dạy kèm|day kem|luyện thi|luyen thi|tutor|sat\\b|toán|toan\\b|gia sư"},{"id":"beautyschool","g":"edu","vi":"Trường nail / thẩm mỹ (license)","en":"Beauty school & license","ic":"🎓","kw":"trường nail|truong nail|license|lớp nail|lop nail|khoá học|khoa hoc|đào tạo|dao tao|class|beauty school|cosmetology"},{"id":"driving","g":"edu","vi":"Dạy lái xe","en":"Driving school","ic":"🚦","kw":"lái xe|lai xe|driving|bằng lái|bang lai|thi bằng"},{"id":"esl","g":"edu","vi":"Tiếng Anh / ESL / quốc tịch","en":"English & citizenship classes","ic":"🗣️","kw":"esl|tiếng anh|tieng anh|english|thi quốc tịch|thi quoc tich"},{"id":"arts","g":"edu","vi":"Nhạc · hoạ · võ · năng khiếu","en":"Music · art · martial arts","ic":"🎹","kw":"piano|guitar|nhạc|nhac\\b|vẽ|ve tranh|võ|vo thuat|taekwondo|múa|ballet"},{"id":"vocational","g":"edu","vi":"Đào tạo nghề / kỹ năng","en":"Vocational & skills","ic":"🛠️","kw":"học nghề|hoc nghe|dạy nghề|kỹ năng|ky nang|coding|ai business|bootcamp"},{"id":"photo","g":"event","vi":"Chụp ảnh / quay phim","en":"Photo & video","ic":"📷","kw":"chụp ảnh|chup anh|quay phim|photograph|videograph|studio|ảnh cưới|anh cuoi"},{"id":"bridal","g":"event","vi":"Áo cưới / makeup cô dâu","en":"Bridal & makeup","ic":"👰","kw":"áo cưới|ao cuoi|makeup|trang điểm|trang diem|cô dâu|co dau|bridal"},{"id":"planner","g":"event","vi":"Tổ chức tiệc / sự kiện","en":"Event planning","ic":"🎪","kw":"tổ chức|to chuc|event|planner|sinh nhật|sinh nhat|tiệc|tiec\\b|thôi nôi"},{"id":"music","g":"event","vi":"Nhạc sống / MC / DJ","en":"Live music · MC · DJ","ic":"🎤","kw":"ban nhạc|ban nhac|mc\\b|dj|ca sĩ|ca si|nhạc sống|karaoke thuê"},{"id":"rentalevent","g":"event","vi":"Thuê rạp / bàn ghế / trang trí","en":"Party rentals & decor","ic":"🎈","kw":"thuê rạp|thue rap|bàn ghế|ban ghe|trang trí|trang tri|bong bóng|backdrop"},{"id":"entertain","g":"event","vi":"Giải trí / vui chơi","en":"Entertainment & recreation","ic":"🎳","kw":"bida|billiard|bowling|game|khu vui chơi|trampoline|arcade|golf"},{"id":"daycare","g":"family","vi":"Giữ trẻ / daycare","en":"Daycare","ic":"🧸","kw":"giữ trẻ|giu tre|daycare|nhà trẻ|nha tre|mầm non|mam non|preschool"},{"id":"kids","g":"family","vi":"Đồ trẻ em / mẹ & bé","en":"Kids & baby","ic":"🍼","kw":"trẻ em|tre em|em bé|em be|mẹ và bé|me va be|baby|đồ chơi|do choi"},{"id":"pet","g":"family","vi":"Thú cưng / grooming","en":"Pets & grooming","ic":"🐶","kw":"thú cưng|thu cung|chó|cho\\b|mèo|meo\\b|pet|grooming|cắt lông"},{"id":"vet","g":"family","vi":"Thú y","en":"Veterinary","ic":"🐾","kw":"thú y|thu y|vet\\b|bác sĩ thú|chích ngừa chó"},{"id":"senior","g":"family","vi":"Nhà dưỡng lão / sinh hoạt người già","en":"Senior living & adult daycare","ic":"🏡","kw":"dưỡng lão|duong lao|adult daycare|sinh hoạt người già|nursing home"},{"id":"print","g":"biz","vi":"In ấn / bảng hiệu","en":"Printing & signage","ic":"🖨️","kw":"in ấn|in an|bảng hiệu|bang hieu|sign|banner|name card|menu in|tờ rơi"},{"id":"marketing","g":"biz","vi":"Marketing / web / thiết kế","en":"Marketing · web · design","ic":"💻","kw":"marketing|website|web|thiết kế|thiet ke|logo|quảng cáo|quang cao|seo|ads"},{"id":"software","g":"biz","vi":"POS / phần mềm","en":"POS & software","ic":"🧾","kw":"pos|phần mềm|phan mem|software|app|nexora|đặt lịch|booking"},{"id":"staffing","g":"biz","vi":"Tuyển dụng / nhân sự","en":"Staffing & HR","ic":"👥","kw":"tuyển|tuyen dung|nhân sự|nhan su|staffing|thợ|tho nail|việc làm|viec lam"},{"id":"lease","g":"biz","vi":"Sang tiệm / mặt bằng / thuê ghế","en":"Business for sale · lease · booth","ic":"🏬","kw":"sang tiệm|sang tiem|mặt bằng|mat bang|thuê ghế|thue ghe|booth rent|for lease|sang nhượng"},{"id":"commercialclean","g":"biz","vi":"Vệ sinh công nghiệp","en":"Commercial cleaning","ic":"🧼","kw":"vệ sinh công nghiệp|ve sinh cong nghiep|janitor|commercial clean|lau kính"},{"id":"telecom","g":"biz","vi":"Viễn thông / internet","en":"Telecom & internet","ic":"📡","kw":"internet|wifi|viễn thông|vien thong|sim|điện thoại gói|phone plan"},{"id":"techrepair","g":"biz","vi":"Sửa điện thoại / máy tính","en":"Phone & computer repair","ic":"🛠️","kw":"sửa điện thoại|sua dien thoai|sửa máy tính|sua may tinh|repair|thay màn hình|unlock"},{"id":"equipment","g":"biz","vi":"Thiết bị ngành (nhà hàng, tiệm)","en":"Commercial equipment","ic":"⚙️","kw":"thiết bị|thiet bi|equipment|máy pha|bếp công nghiệp|bep cong nghiep|tủ đông|ghế cắt tóc"},{"id":"temple","g":"community","vi":"Chùa / nhà thờ","en":"Temple & church","ic":"🛕","kw":"chùa|chua\\b|nhà thờ|nha tho|church|temple|lễ|le hoi"},{"id":"association","g":"community","vi":"Hội đoàn / cộng đồng","en":"Associations","ic":"🤝","kw":"hội|hoi doan|cộng đồng|cong dong|association|hội chợ|hoi cho"},{"id":"charity","g":"community","vi":"Từ thiện / gây quỹ","en":"Charity & fundraising","ic":"❤️","kw":"từ thiện|tu thien|gây quỹ|gay quy|charity|donate|quyên góp"},{"id":"media","g":"community","vi":"Báo chí / radio / truyền hình","en":"Media & press","ic":"📰","kw":"báo|bao chi|radio|truyền hình|truyen hinh|tv|podcast|youtube channel"},{"id":"wellness","g":"health","ic":"🌿","vi":"Trung tâm Wellness","en":"Wellness center","kw":"wellness|chăm sóc sức khỏe|cham soc suc khoe|wellbeing"},{"id":"meditation","g":"health","ic":"🧘","vi":"Thiền & thư giãn","en":"Meditation & relaxation","kw":"thiền|thien|meditation|mindfulness|relaxation"},{"id":"sauna","g":"health","ic":"♨️","vi":"Sauna & phục hồi","en":"Sauna & recovery","kw":"sauna|xông hơi|xong hoi|recovery"},{"id":"homestay","g":"travel","ic":"🏡","vi":"Homestay & nhà nghỉ B&B","en":"Homestays & bed and breakfast","kw":"homestay|bed and breakfast|b&b|nhà nghỉ|nha nghi"},{"id":"resort","g":"travel","ic":"🏝️","vi":"Resort & khu nghỉ dưỡng","en":"Resorts & retreats","kw":"resort|retreat|nghỉ dưỡng|nghi duong"},{"id":"vacationrental","g":"travel","ic":"🏘️","vi":"Nhà & căn hộ nghỉ dưỡng","en":"Vacation homes & apartments","kw":"vacation rental|holiday home|căn hộ|can ho|airbnb"},{"id":"camping","g":"travel","ic":"🏕️","vi":"Camping · glamping · RV","en":"Camping · glamping · RV parks","kw":"camping|glamping|rv park|cắm trại|cam trai"},{"id":"farmersmarket","g":"shop","ic":"🥬","vi":"Chợ nông sản","en":"Farmers markets","kw":"farmers market|nông sản|nong san|produce market"},{"id":"nightmarket","g":"shop","ic":"🏮","vi":"Chợ đêm & chợ trời","en":"Night & flea markets","kw":"night market|flea market|chợ đêm|cho dem|chợ trời|cho troi"},{"id":"wholesale","g":"shop","ic":"📦","vi":"Chợ sỉ & bán buôn","en":"Wholesale markets","kw":"wholesale|chợ sỉ|cho si|bán buôn|ban buon"},{"id":"headspa","g":"beauty","ic":"✿","vi":"Head Spa / gội đầu dưỡng sinh","en":"Head spa & scalp care","kw":"head spa|scalp|gội đầu|goi dau|dưỡng sinh|duong sinh"}]};

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
  industry: group,
  items: couponTaxonomy.inds
    .filter((item) => item.g === group.id)
    .map((item) => ({ ...item, count: workspaceCouponCounts[item.id] || 0, search: `${item.vi} ${item.en} ${item.kw}` })),
}));

function workspaceEnglish() {
  return document.querySelector("#languageSelect")?.value === "en";
}

function workspaceCopy(vi, en) {
  return workspaceEnglish() ? en : vi;
}

function workspaceIndustryIcon(key, size = 24) {
  return window.NEXORA_INDUSTRY_ICONS.image(key, { size, className: "deal-industry-icon" });
}

function workspaceCouponGroupChips(active = "beauty") {
  const language = workspaceEnglish() ? "en" : "vi";
  return couponTaxonomy.groups.map((group) => {
    const total = couponTaxonomy.inds.filter((item) => item.g === group.id).length;
    return `<button class="dw-chip ${group.id === active ? "active" : ""}" type="button" data-dw-group="directory-industry" data-dw-value="${group.id}">${workspaceIndustryIcon("group:" + group.id)} ${escapeHTML(group[language])} <small>${total}</small></button>`;
  }).join("");
}

function communityOfferGuide() {
  const types = workspaceEnglish() ? [
    ["🎟️", "Support voucher", "Meals, essentials or school supplies"],
    ["🤲", "Free or reduced-fee services", "Health care, legal help, tax filing or classes"],
    ["🎫", "Event ticket", "Fairs, festivals, performances and fundraisers"],
    ["📅", "Reserved spot", "Workshops, community classes and volunteer events"],
    ["💛", "Sponsored coupon", "A business funds an offer for eligible people"],
    ["🙋", "Volunteer reward", "Local business benefits based on hours contributed"],
  ] : [
    ["🎟️", "Phiếu hỗ trợ", "Suất ăn, nhu yếu phẩm hoặc đồ dùng học tập"],
    ["🤲", "Miễn / giảm phí", "Khám sức khỏe, pháp lý, khai thuế hoặc lớp học"],
    ["🎫", "Vé sự kiện", "Hội chợ, lễ hội, văn nghệ và chương trình gây quỹ"],
    ["📅", "Đăng ký giữ chỗ", "Hội thảo, lớp cộng đồng hoặc hoạt động thiện nguyện"],
    ["💛", "Coupon tài trợ", "Doanh nghiệp tài trợ để người đủ điều kiện sử dụng"],
    ["🙋", "Thưởng tình nguyện", "Quyền lợi từ doanh nghiệp địa phương theo số giờ đóng góp"],
  ];
  return `<aside class="dw-community-guide"><div class="dw-community-guide-copy"><span class="dw-community-badge">COMMUNITY PASS</span><h3>${workspaceCopy("Ưu đãi cộng đồng · không chỉ là mã giảm giá", "Community offers beyond discount codes")}</h3><p>${workspaceCopy("Chương trình cần ghi rõ đối tượng, số suất, thời hạn, điều kiện và nguồn tài trợ.", "Each program must clearly state eligibility, quantity, expiration, terms and funding source.")}</p></div><div class="dw-community-types">${types.map(([icon, title, copy]) => `<article><span>${icon}</span><div><strong>${title}</strong><small>${copy}</small></div></article>`).join("")}</div></aside>`;
}

function workspaceIndustryChips(active = "all", group = "industry") {
  const englishLabels = { all: "All industries", beauty: "💅 Beauty & personal care", food: "🍜 Food & drink", shopping: "🛍️ Shopping", health: "🩺 Health", auto: "🚗 Auto & transport", home: "🏠 Home & repair", finance: "💼 Finance · legal · real estate", education: "🎓 Education & training", family: "👶 Family & pets" };
  return workspaceIndustries.map(([id, label, count]) => `<button class="dw-chip ${id === active ? "active" : ""}" type="button" data-dw-group="${group}" data-dw-value="${id}">${id === "all" ? "" : workspaceIndustryIcon("group:" + ({shopping:"shop",education:"edu"}[id] || id)) + " "}${escapeHTML((workspaceEnglish() ? englishLabels[id] : label).replace(/^[^\p{L}\p{N}]+/u, ""))}${count ? ` <small>${count}</small>` : ""}</button>`).join("");
}

function workspaceDealText(deal, field) {
  if (!workspaceEnglish()) return deal[field];
  const english = {
    "nx-gel-combo": { title: "Gel manicure + minimalist nail art", deadline: "2 days left", description: "A polished gel manicure with two minimalist accent nails. Ideal for a quick weekday appointment and verified directly through Nexora Touch.", terms: "Appointment required. Soak-off, extra length and 3D art cost extra. One use per customer; cannot be combined with other offers." },
    "btc-new-set": { title: "New customers: 20% off a full Gel-X set", deadline: "Today · 4 spots", badge: "NEW CUSTOMERS", description: "First-appointment offer for a short- or medium-length full Gel-X set.", terms: "New customers only. Maximum discount $12; charms, soak-off and extra length are excluded." },
    "glow-pedi": { title: "Weekday pedicure reset + hot towel", deadline: "Mon–Thu · before 3 PM", description: "A relaxing weekday pedicure with basic care, regular polish and a hot towel.", terms: "Gel polish and French tips are excluded. Book at least two hours in advance." },
    "luna-art": { title: "Freestyle nail art — 2 accent nails", deadline: "6 spots left this week", schedule: "Wed–Sun · business hours", description: "Add two freestyle accent nails to any eligible manicure or full set.", terms: "Must be purchased with a manicure or full set. 3D art, portraits and charms are excluded." },
    "serene-dip": { title: "Dip powder refresh + soak-off", deadline: "This weekend only", description: "Refresh your dip powder set with removal of the old set, shaping and one standard color.", terms: "One color included; ombré, French and extensions cost extra. Limit one coupon per customer." },
    "opal-classic": { title: "Classic manicure + pedicure weekday combo", deadline: "Ends in 5 days", description: "A classic weekday manicure and pedicure combo with standard polish.", terms: "Gel polish is excluded. Appointment required; cannot be combined with membership rewards." },
  };
  return english[deal.id]?.[field] || deal[field];
}

function workspaceDealCard(deal, index = 0) {
  const offerClass = getOfferClassification(deal);
  const progress = offerClass.isCoupon ? Math.max(12, Math.min(88, (offerClass.inventory / 18) * 100)) : 100;
  return `<article class="dw-ticket ${offerClass.type}-offer" data-dw-deal-card data-deal-id="${escapeHTML(deal.id)}" data-search="${escapeHTML(`${deal.title} ${workspaceDealText(deal, "title")} ${deal.salon} ${deal.category}`.toLocaleLowerCase("vi"))}">
    <div class="dw-ticket-art"><div><span>${index % 2 ? "✨" : "🏷️"}</span><strong>$${escapeHTML(deal.price)}</strong><small>${escapeHTML(deal.discount || workspaceCopy("GIÁ ĐẶC BIỆT", "SPECIAL PRICE"))}</small></div></div>
    <div class="dw-ticket-body">
      <h3>${escapeHTML(workspaceDealText(deal, "title"))}</h3>
      <a href="#" data-open="${escapeHTML(deal.id)}">${escapeHTML(deal.salon)}</a>
      <div class="dw-ticket-meta"><span>📍 ${escapeHTML(deal.distance)} mi</span><span>⏳ ${escapeHTML(workspaceDealText(deal, "deadline"))}</span><span>✓ ${workspaceCopy("Đã xác minh", "Verified")}</span></div>
      ${offerClass.isCoupon ? `<div class="dw-progress" title="${workspaceCopy(`Còn ${offerClass.inventory} lượt`, `${offerClass.inventory} left`)}"><i style="--progress:${progress}%"></i></div>` : `<div class="dw-unlimited">🏷️ ${workspaceCopy("Deal banner · Không giới hạn số lượng", "Deal banner · Unlimited availability")}</div>`}
      <div class="dw-ticket-actions"><button class="dw-primary ${offerClass.isCoupon ? "red" : "green"}" type="button" data-open="${escapeHTML(deal.id)}">${offerClass.isCoupon ? workspaceCopy("Lấy coupon", "Get coupon") : workspaceCopy("Xem deal", "View deal")}</button><button class="dw-secondary" type="button" data-save="${escapeHTML(deal.id)}" aria-label="${workspaceCopy("Lưu deal", "Save deal")}">♡</button></div>
    </div>
  </article>`;
}

function renderNearbyWorkspace() {
  const regularDeals = deals.filter((deal) => !deal.lastMinuteOnly);
  const openingCards = workspaceEnglish() ? [
    ["3 days left", "🍜 Phở 24 Bellaire", "$9 combo · 1.1 mi"],
    ["9 days left", "💅 Kayla Nails & Spa", "30% off · 8.5 mi"],
    ["16 days left", "🧋 Saigon Boba", "First drink $1 · 6.2 mi"],
    ["24 days left", "🦷 Minh Tâm Dental", "Exam + cleaning $49"],
  ] : [
    ["còn 3 ngày", "🍜 Phở 24 Bellaire", "Combo $9 · 1.1 mi"],
    ["còn 9 ngày", "💅 Kayla Nails & Spa", "Giảm 30% · 8.5 mi"],
    ["còn 16 ngày", "🧋 Saigon Boba", "Ly đầu $1 · 6.2 mi"],
    ["còn 24 ngày", "🦷 Nha khoa Minh Tâm", "Khám + cạo vôi $49"],
  ];
  return `<div class="dw-shell">
    <section class="dw-card dw-panel dw-nearby-controls">
      <div class="dw-heading"><div><span class="dw-kicker">NEXORA DEALS · BELLAIRE, HOUSTON</span><h1>🔥 ${workspaceCopy("Deal gần bạn", "Deals Nearby")}</h1></div><span class="dw-live">● ${workspaceCopy("Dữ liệu đang cập nhật", "Data updating")}</span></div>
      <form class="dw-search dw-nearby-toolbar" data-dw-nearby-search><label><span>⌕</span><input name="query" value="${escapeHTML(searchInput?.value || "")}" aria-label="${workspaceCopy("Tìm deal", "Search deals")}" placeholder="${workspaceCopy("Tìm dịch vụ, tên tiệm hoặc ưu đãi…", "Search services, businesses or offers…")}" /></label>
      <details class="dw-nearby-picker" data-nearby-picker><summary>☷ <span data-nearby-summary>${workspaceCopy("Mọi ngành · 10 mi", "All industries · 10 mi")}</span>⌄</summary><div class="dw-nearby-popover"><h3>${workspaceCopy("Tùy chỉnh tìm kiếm", "Refine your search")}</h3><label>${workspaceCopy("Ngành nghề", "Industry")}<select name="industry"><option value="all">${workspaceCopy("Mọi ngành", "All industries")}</option>${couponTaxonomy.groups.map(g=>`<option value="${g.id}" data-industry-icon="group:${g.id}">${escapeHTML(workspaceEnglish()?g.en:g.vi)}</option>`).join('')}</select></label><label>${workspaceCopy("Khoảng cách", "Distance")}<select name="radius">${[1,5,10,25].map(n=>`<option value="${n}" ${n===10?'selected':''}>${n} mi</option>`).join('')}</select></label><label>${workspaceCopy("Sắp xếp", "Sort")}<select name="sort"><option value="near">${workspaceCopy("Gần nhất", "Nearest")}</option><option value="price">${workspaceCopy("Giá thấp nhất", "Lowest price")}</option><option value="inventory">${workspaceCopy("Sắp hết lượt", "Almost sold out")}</option></select></label><div class="dw-nearby-popover-actions"><button class="dw-secondary" type="reset">${workspaceCopy("Đặt lại", "Reset")}</button><button class="dw-primary" type="submit">${workspaceCopy("Áp dụng", "Apply")}</button></div></div></details><button class="dw-primary" type="submit">${workspaceCopy("Tìm", "Search")}</button><button class="dw-secondary" type="reset">${workspaceCopy("Đặt lại", "Reset")}</button></form>
    </section>
    <div class="dw-nearby-layout">
      <aside class="dw-card dw-panel"><div class="dw-radar"><div class="dw-radar-grid"></div><div class="dw-radar-sweep"></div><span class="dw-radar-center">${workspaceCopy("Bạn", "You")}</span>${[[23,42,"🍜"],[43,30,"💅"],[67,39,"🦷"],[75,66,"🧋"],[34,72,"🛍️"],[56,58,"✨"],[18,67,"🚗"],[66,24,"💆"]].map(([x,y,icon], i) => `<span class="dw-pin" style="left:${x}%;top:${y}%;background:${i % 2 ? "#6648ec" : "#0fa6b5"}">${icon}</span>`).join("")}<small>${workspaceCopy("29 deal trong 10 mi · 30 ghim", "29 deals within 10 mi · 30 pins")}</small></div><div class="dw-radar-tabs"><button type="button">📡 Radar</button><button type="button">🗺️ ${workspaceCopy("Bản đồ thật", "Map")}</button></div><p style="margin:12px 0 0;color:#6b7890;font-size:13px">${workspaceCopy("Bấm vào deal để xem điều kiện, lịch và cách sử dụng.", "Select a deal to see its terms, schedule and how to use it.")}</p></aside>
      <section class="dw-results">
        <div class="dw-opening-strip"><div class="dw-section-label"><strong>🎊 ${workspaceCopy("Sắp khai trương gần bạn", "Grand openings near you")}</strong><button class="dw-secondary" type="button" data-dw-route="#openings">${workspaceCopy("Xem tất cả ›", "View all ›")}</button></div><div class="dw-opening-cards">${openingCards.map(([time, business, offer]) => `<article class="dw-opening-mini"><strong>${time}</strong><b>${business}</b><span>${offer}</span></article>`).join("")}</div></div>
        <div class="dw-section-label"><span data-dw-result-count>${workspaceCopy(`${regularDeals.length} deal · trong 10 mi`, `${regularDeals.length} deals · within 10 mi`)}</span></div><div class="dw-ticket-grid">${regularDeals.map(workspaceDealCard).join("")}</div>
      </section>
    </div>
  </div>`;
}

function nearbyDealGroup(deal) {
 const category=deal.category;
 if(['nail','manicure','gel-x','pedicure','nail-art','spa','hair','fitness'].includes(category))return 'beauty';
 if(['restaurant','bakery'].includes(category))return 'food';
 if(['grocery','market','flowers'].includes(category))return 'shop';
 if(category==='hotel')return 'travel';
 if(category==='experience')return 'event';
 return category;
}
function applyNearbyFilters() {
 const form=dealWorkspace?.querySelector('[data-dw-nearby-search]');if(!form)return;
 const data=new FormData(form),query=String(data.get('query')||'').trim().toLocaleLowerCase('vi'),industry=data.get('industry'),radius=Number(data.get('radius')),sort=data.get('sort');
 const grid=dealWorkspace.querySelector('.dw-ticket-grid');if(!grid)return;
 const cards=[...grid.querySelectorAll('[data-dw-deal-card]')];let count=0;
 const lookup=id=>deals.find(d=>d.id===id);
 cards.sort((a,b)=>{const x=lookup(a.dataset.dealId)||{},y=lookup(b.dataset.dealId)||{};return sort==='price'?Number(x.price)-Number(y.price):sort==='inventory'?Number(x.inventory??Infinity)-Number(y.inventory??Infinity):Number(x.distance??Infinity)-Number(y.distance??Infinity);}).forEach(card=>{
  const deal=lookup(card.dataset.dealId)||{};
  card.hidden=(query&&!query.split(/\s+/).every(term=>card.dataset.search.includes(term)))||(industry!=='all'&&nearbyDealGroup(deal)!==industry)||!Number.isFinite(Number(deal.distance))||Number(deal.distance)>radius;
  if(!card.hidden)count++;grid.append(card);
 });
 const group=couponTaxonomy.groups.find(g=>g.id===industry),label=group?(workspaceEnglish()?group.en:group.vi):workspaceCopy('Mọi ngành','All industries');
 form.querySelector('[data-nearby-summary]').textContent=`${label} · ${radius} mi`;
 const radarLabel=dealWorkspace.querySelector('.dw-radar small');if(radarLabel)radarLabel.textContent=workspaceCopy(`Radar minh họa · ${count} kết quả trong ${radius} mi`,`Illustrative radar · ${count} results within ${radius} mi`);
 const countLabel=dealWorkspace.querySelector('[data-dw-result-count]');if(countLabel)countLabel.textContent=workspaceCopy(`${count} deal · trong ${radius} mi`,`${count} deals · within ${radius} mi`);
 let empty=grid.querySelector('[data-nearby-empty]');if(!empty){empty=document.createElement('p');empty.dataset.nearbyEmpty='';grid.append(empty);}empty.hidden=count>0;empty.textContent=workspaceCopy('Chưa có deal khớp. Thử tăng khoảng cách hoặc đặt lại bộ lọc.','No matching offers. Try a wider radius or reset the filters.');
}
dealWorkspace?.addEventListener('reset',event=>{if(!event.target.matches('[data-dw-nearby-search]'))return;event.preventDefault();const form=event.target;form.elements.query.value='';form.elements.industry.value='all';form.elements.radius.value='10';form.elements.sort.value='near';applyNearbyFilters();form.querySelector('[data-nearby-picker]').open=false;});
dealWorkspace?.addEventListener('change',event=>{if(event.target.closest('[data-dw-nearby-search]'))applyNearbyFilters();});
document.addEventListener('click',event=>{const picker=dealWorkspace?.querySelector('[data-nearby-picker]');if(picker&&!picker.contains(event.target))picker.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const picker=dealWorkspace?.querySelector('[data-nearby-picker]');if(picker)picker.open=false;}});

function couponGroupImage(groupId) {
 const images={beauty:'hero-nail-spa-luxury-v1.jpg',food:'hero-restaurant-v1.jpg',shop:'hero-food-market-v1.jpg',health:'hero-beauty-wellness-v1.jpg',travel:'hero-hotel-v1.jpg',auto:'hero-local-services-v1.jpg',home:'hero-local-services-v1.jpg',finance:'hero-local-discovery-v2.jpg',edu:'hero-local-discovery-v2.jpg',event:'hero-yacht-v1.jpg',family:'hero-local-discovery-v2.jpg',biz:'hero-local-services-v1.jpg',community:'hero-local-discovery-v2.jpg'};
 return './assets/'+(images[groupId]||images.beauty);
}
function renderNailCouponServices() {
 const services=[['💅','Manicure','Manicure'],['🦶','Pedicure','Pedicure'],['✨','Gel-X / nối móng','Gel-X / extensions'],['◈','Acrylic / móng bột','Acrylic nails'],['◌','Dip powder','Dip powder'],['✦','Builder gel / hard gel','Builder gel / hard gel'],['🎨','Nail art / thiết kế móng','Nail art / designs'],['♡','Chăm sóc móng trẻ em','Kids nail care'],['↻','Tháo móng / sửa móng','Removal / nail repair'],['✧','Waxing tại nail salon','Salon waxing']];
 return `<section id="nailCouponServices" class="dw-nail-services" hidden><div><span class="dw-kicker">${workspaceCopy('DỊCH VỤ TRONG NAIL SALON','SERVICES AT A NAIL SALON')}</span><h3>${workspaceCopy('Bạn muốn làm dịch vụ nào?','What would you like to book?')}</h3><p>${workspaceCopy('Chọn dịch vụ để khám phá các ưu đãi phù hợp.','Choose a service to explore matching offers.')}</p></div><div class="dw-nail-service-grid">${services.map(([icon,vi,en],index)=>`<button type="button" data-dw-category="${["manicure","pedicure","gel-x","acrylic","dip","builder gel","nail art","kids","removal","waxing"][index]}"><span>${workspaceIndustryIcon(["nail","pedi","nail","nail","nail","nail","nail","kids","nail","wax"][index])}</span>${escapeHTML(workspaceCopy(vi,en))}<b>→</b></button>`).join('')}</div></section>`;
}
function renderCouponDirectoryWorkspace() {
  const language = workspaceEnglish() ? "en" : "vi";
  return `<div class="dw-shell"><section class="dw-card"><div class="dw-directory-head"><div class="dw-heading"><div><span class="dw-kicker">${workspaceCopy("129 NGÀNH NGHỀ · 13 NHÓM NGÀNH", "129 INDUSTRIES · 13 GROUPS")}</span><h1>🏷️ ${workspaceCopy("Coupon theo ngành", "Coupons by Category")}</h1><p>${workspaceCopy("Chọn một nhóm ngành hoặc tìm xuyên toàn bộ danh mục Nexora.", "Choose an industry group or search the entire Nexora directory.")}</p></div><span class="dw-directory-total">${workspaceCopy("129 ngành", "129 industries")}</span></div><form class="dw-search" style="grid-template-columns:1fr" data-dw-directory-search><label><span>⌕</span><input type="search" placeholder="${workspaceCopy("Tìm ngành, dịch vụ hoặc từ khoá — ví dụ: nha sĩ, sửa xe, khai thuế", "Search industries, services or keywords — for example: dentist, car repair, tax filing")}" /></label></form><details class="dw-category-picker" data-dw-category-picker><summary><span><small>${workspaceCopy("NHÓM NGÀNH", "INDUSTRY GROUP")}</small><strong data-dw-selected-group>${workspaceIndustryIcon("group:beauty")} ${workspaceCopy("Làm đẹp & chăm sóc cá nhân", "Beauty & personal care")}</strong></span><span class="dw-picker-chevron" aria-hidden="true">⌄</span></summary><div class="dw-chip-row dw-directory-groups">${workspaceCouponGroupChips("beauty")}</div></details><p class="dw-directory-status" data-dw-directory-status>${workspaceCopy("13 ngành trong nhóm Làm đẹp & chăm sóc cá nhân", "13 industries in Beauty & personal care")}</p></div><div class="dw-directory-grid">${workspaceCategories.map((group) => `<section class="dw-category-group" data-dw-category-group data-dw-group-id="${group.id}" ${group.id === "beauty" ? "" : "hidden"}><h2>${workspaceIndustryIcon("group:" + group.id)} ${escapeHTML(group.industry[language])} <small>${group.items.length} ${workspaceCopy("ngành", "industries")}</small></h2>${group.id === "community" ? communityOfferGuide() : ""}${group.id === "beauty" ? renderNailCouponServices() : ""}<div class="dw-category-cards">${group.items.map((item) => `<button class="dw-category-card ${group.items[0]===item?'dw-category-featured':''}" type="button" ${item.id === "nail" ? `data-dw-nail-menu aria-expanded="false" aria-controls="nailCouponServices"` : `data-dw-category="${escapeHTML(item[language])}"`} data-dw-industry-id="${item.id}" data-has-coupon="${item.count > 0}" data-search="${escapeHTML(item.search.toLocaleLowerCase("vi"))}">${group.items[0]===item?`<img class="dw-category-photo" src="${couponGroupImage(group.id)}" alt="" loading="lazy"/><em class="dw-category-image-note">${workspaceCopy("Ảnh minh họa", "Illustration")}</em>`:""}<span class="dw-category-icon">${workspaceIndustryIcon(item.id)}</span><strong>${escapeHTML(item[language])}</strong><small>${item.count > 0 ? workspaceCopy(`${item.count} coupon đang chạy`, `${item.count} active coupons`) : workspaceCopy("0 coupon · Khám phá →", "0 coupons · Explore →")}</small></button>`).join("")}</div></section>`).join("")}<div class="dw-category-empty" data-dw-category-empty hidden>${workspaceCopy("Chưa tìm thấy ngành hoặc dịch vụ phù hợp trong 129 ngành.", "No matching industry or service among the 129 categories.")}</div></div></section></div>`;
}

function filterCouponDirectory(selectedGroup, rawQuery = "") {
  if (!dealWorkspace) return;
  const query = rawQuery.trim().toLocaleLowerCase("vi");
  const activeChip = dealWorkspace.querySelector('[data-dw-group="directory-industry"].active');
  const groupId = selectedGroup || activeChip?.dataset.dwValue || "beauty";
  let visibleCards = 0;

  dealWorkspace.querySelectorAll("[data-dw-category-group]").forEach((group) => {
    let groupVisibleCards = 0;
    group.querySelectorAll(".dw-category-card").forEach((card) => {
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
      ? workspaceCopy(`${visibleCards} ngành khớp “${rawQuery.trim()}” trong toàn bộ 129 ngành`, `${visibleCards} industries match “${rawQuery.trim()}” across all 129 categories`)
      : workspaceCopy(`${visibleCards} ngành trong nhóm ${group?.vi || "đã chọn"}`, `${visibleCards} industries in ${group?.en || "the selected group"}`);
  }
}

const dealMatchAreaLevels = {
  world: { icon: "🌍", label: "Toàn thế giới" },
  country: { icon: "🏳️", label: "Quốc gia" },
  state: { icon: "🗺️", label: "Tiểu bang / tỉnh" },
  city: { icon: "🏙️", label: "Thành phố" },
  area: { icon: "⌖", label: "Khu vực" },
};

const DEAL_MATCH_COPY = {
  vi: {
    kicker: "KHÁCH MUỐN · DOANH NGHIỆP ĐÁP · NEXORA TỰ GHÉP",
    intro: "Gõ hoặc nói một câu. Có deal khớp thì hiện ngay; chưa có thì đăng mong muốn để doanh nghiệp ở đúng khu vực biết.",
    placeholder: "VD: gel-x dưới $40 gần Garden Grove cuối tuần",
    searchLabel: "Tìm bằng nhu cầu",
    industries: "NGÀNH NGHỀ · 13 NHÓM / 129 NGÀNH",
    areaHeading: "KHU VỰC", allIndustries: "Mọi ngành", allServices: "Cả nhóm",
    nearMe: "Gần tôi", multiArea: "Nhiều khu vực", online: "Online", radius: "Bán kính:",
    country: "Quốc gia", worldwide: "Toàn thế giới", state: "Tiểu bang / tỉnh", city: "Thành phố", area: "Khu vực", addArea: "Thêm nơi này",
    aiReads: "AI hiểu là:", unknownService: "Dịch vụ", anyPrice: "Giá bất kỳ", weekend: "Cuối tuần",
    resultsDefault: "Deal phù hợp trong khu vực đã chọn", matchingAt: "Đang so khớp tại", viewDeal: "Xem deal",
    emptyTitle: "Chưa có deal trong phạm vi này", emptyCopy: "Gõ điều bạn muốn để Nexora tìm và chuyển thành mong muốn khi chưa có deal phù hợp.",
    moreTitle: "Muốn thêm lựa chọn?", noneTitle: "Chưa doanh nghiệp nào có deal này",
    wishPrompt: "Đăng mong muốn để doanh nghiệp trong các khu vực đã chọn thấy nhu cầu đã gom — khi có deal khớp Nexora sẽ báo.",
    saveWish: "Đăng mong muốn này · 1 chạm", wishesTitle: "Mong muốn của tôi",
    wishesCopy: "Tự hết hạn sau 14 ngày; doanh nghiệp chỉ thấy nhu cầu đã gom, không thấy danh tính của bạn.",
    wishesEmpty: "Chưa có. Gõ một câu ở trên rồi bấm “Đăng mong muốn”.", waiting: "Đang chờ doanh nghiệp", viewed: "doanh nghiệp đã xem", remove: "Bỏ",
  },
  en: {
    kicker: "CUSTOMERS ASK · BUSINESSES RESPOND · NEXORA MATCHES",
    intro: "Type or say what you need. Matching deals appear immediately; if none are available, post your request for businesses in the selected areas.",
    placeholder: "Example: Gel-X under $40 near Garden Grove this weekend",
    searchLabel: "Search with Deal Match",
    industries: "INDUSTRIES · 13 GROUPS / 129 CATEGORIES",
    areaHeading: "AREA", allIndustries: "All industries", allServices: "All in this group",
    nearMe: "Near me", multiArea: "Multiple areas", online: "Online", radius: "Radius:",
    country: "Country", worldwide: "Worldwide", state: "State / province", city: "City", area: "Area", addArea: "Add this area",
    aiReads: "AI understood:", unknownService: "Service", anyPrice: "Any price", weekend: "Weekend",
    resultsDefault: "Deals in your selected areas", matchingAt: "Matching in", viewDeal: "View deal",
    emptyTitle: "No deals in this area yet", emptyCopy: "Tell Nexora what you need. If no deal matches, you can post the request for businesses to respond.",
    moreTitle: "Want more options?", noneTitle: "No business has this deal yet",
    wishPrompt: "Post your request so businesses in the selected areas can see aggregated demand. Nexora will notify you when a deal matches.",
    saveWish: "Post this request · one tap", wishesTitle: "My requests",
    wishesCopy: "Requests expire after 14 days. Businesses see aggregated demand, not your identity.",
    wishesEmpty: "No requests yet. Type what you need above, then choose “Post this request.”", waiting: "Waiting for businesses", viewed: "businesses viewed", remove: "Remove",
  },
};

function getDealMatchLanguage() {
  return document.querySelector("#languageSelect")?.value === "en" ? "en" : "vi";
}

function getDealMatchCopy() {
  return DEAL_MATCH_COPY[getDealMatchLanguage()];
}

function dealMatchAreaCount(count) {
  return getDealMatchLanguage() === "en" ? `${count} ${count === 1 ? "area" : "areas"}` : `${count} khu vực`;
}

function dealMatchAreaHelp(count) {
  return getDealMatchLanguage() === "en"
    ? `Searching ${count} ${count === 1 ? "area" : "areas"} at the same time. Combine countries, states or provinces, cities, and local areas.`
    : `Đang tìm đồng thời ${count} khu vực. Có thể kết hợp nhiều quốc gia, tiểu bang/tỉnh, thành phố và khu vực.`;
}

function localizeDealMatchDeal(deal, field) {
  const language = getDealMatchLanguage();
  const overrides = language === "en" ? {
    "nx-gel-combo": { title: "Gel manicure + minimalist nail art", deadline: "2 days left" },
    "btc-new-set": { title: "New customers: 20% off a full Gel-X set", deadline: "Today · 4 spots" },
    "glow-pedi": { title: "Weekday pedicure reset + hot towel", deadline: "Mon–Thu · before 3 PM" },
  } : {
    "nx-gel-combo": { title: "Sơn gel + vẽ móng tối giản", deadline: "Còn 2 ngày" },
    "btc-new-set": { title: "Khách mới: giảm 20% bộ Gel-X đầy đủ", deadline: "Hôm nay · 4 suất" },
    "glow-pedi": { title: "Chăm sóc chân ngày thường + khăn nóng", deadline: "Thứ Hai–Thứ Năm · trước 3 giờ chiều" },
  };
  const value = overrides[deal.id]?.[field] || deal[field];
  if (language === "en" && field === "deadline") {
    return String(value).replace(/^Còn (\d+) ngày$/i, "$1 days left").replace(/^Hôm nay · (\d+) suất$/i, "Today · $1 spots").replace("trước", "before");
  }
  return value;
}

const dealMatchCategoryAliases = {
  manicure: "nail", "gel-x": "nail", "nail-art": "nail", pedicure: "pedi",
  restaurant: "food", grocery: "market", flowers: "flower", auto: "carwash",
};

function normalizeDealMatchText(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi");
}

function inferDealMatchAreaLevel(area = "") {
  const value = normalizeDealMatchText(area.trim());
  if (["toan the gioi", "worldwide", "global"].includes(value)) return "world";
  if (/^\d{4,10}(?:-\d{4})?$/.test(value) || /^(quan|huyen|district|county|borough)\b/.test(value)) return "area";
  const geo = getDealMatchGeo();
  const countryNames = Object.values(geo.countries).map((country) => normalizeDealMatchText(country.n.replace(/^\S+\s*/, "")));
  if (countryNames.includes(value)) return "country";
  const firstPart = normalizeDealMatchText(area.split(",")[0]);
  const stateNames = Object.values(geo.countries).flatMap((country) => Object.values(country.s || {}).map((state) => normalizeDealMatchText(state.n)));
  if (stateNames.includes(firstPart)) return "state";
  const parts = area.split(",").length;
  return parts >= 4 ? "area" : "city";
}

function renderDealMatchAreaTag(area, level = inferDealMatchAreaLevel(area)) {
  const config = dealMatchAreaLevels[level] || dealMatchAreaLevels.city;
  return `<button class="dw-area-tag" type="button" data-dw-remove-area="${escapeHTML(area)}" data-dw-area-tag-level="${level}"><span>${config.icon} ${escapeHTML(area)}</span><b aria-hidden="true">×</b></button>`;
}

function parseDealMatchQuery(query = "") {
  const normalized = normalizeDealMatchText(query);
  let service = null;
  let bestLength = 0;
  couponTaxonomy.inds.forEach((item) => {
    try {
      const match = normalized.match(new RegExp(normalizeDealMatchText(item.kw), "i"));
      if (match && match[0].length > bestLength) {
        service = item;
        bestLength = match[0].length;
      }
    } catch {}
  });
  const priceMatch = query.match(/(?:dưới|under|<|tối đa|max)?\s*\$?\s*(\d{2,4})\s*(?:\$|usd|đô)?/i);
  return {
    service,
    maxPrice: priceMatch ? Number(priceMatch[1]) : null,
    weekend: /cuối tuần|weekend|thứ 7|chủ nhật|\bt7\b|\bcn\b/i.test(query),
  };
}

function renderDealMatchParsed(query, areas) {
  if (!query.trim()) return "";
  const copy = getDealMatchCopy();
  const language = getDealMatchLanguage();
  const parsed = parseDealMatchQuery(query);
  const location = areas.some((area) => inferDealMatchAreaLevel(area) === "world") ? copy.worldwide : areas.slice(0, 2).join(" · ");
  return `<span class="dw-ai-label">✦ ${copy.aiReads}</span><span>${parsed.service ? `${workspaceIndustryIcon(parsed.service.id)} ${escapeHTML(parsed.service[language] || parsed.service.vi)}` : `? ${copy.unknownService}`}</span><span>${parsed.maxPrice ? `≤ $${parsed.maxPrice}` : copy.anyPrice}</span><span>🗺️ ${escapeHTML(location || copy.nearMe)}</span>${parsed.weekend ? `<span>📅 ${copy.weekend}</span>` : ""}`;
}

function renderDealMatchIndustryOptions() {
  const language = getDealMatchLanguage();
  return `<option value="all" data-industry-icon="other">${getDealMatchCopy().allIndustries}</option>${couponTaxonomy.groups.map((group) => `<option value="${group.id}" data-industry-icon="group:${group.id}">${escapeHTML(group[language] || group.vi)}</option>`).join("")}`;
}

function renderDealMatchServiceOptions(groupId = "") {
  const language = getDealMatchLanguage();
  return `<option value="all" data-industry-icon="${groupId && groupId !== "all" ? "group:" + groupId : "other"}">${getDealMatchCopy().allServices}</option>${couponTaxonomy.inds.filter((item) => item.g === groupId).map((item) => `<option value="${item.id}" data-industry-icon="${item.id}">${escapeHTML(item[language] || item.vi)}</option>`).join("")}`;
}

function initializeDealMatchSelects() {
  if (!window.TomSelect || !dealWorkspace) return;
  dealWorkspace.querySelectorAll("select[data-dw-match-select]").forEach((select) => {
    if (select.tomselect || select.disabled) return;
    const choice = (data) => {
      const option = Array.from(select.options).find((item) => item.value === String(data.value));
      const artwork = window.NEXORA_INDUSTRY_ICONS.image(option?.dataset.industryIcon || "other", {
        size: 20, className: "deal-industry-icon industry-choice-icon",
      });
      return `<div class="dw-match-select-choice"><span class="dw-match-select-icon">${artwork}</span><span>${escapeHTML(option?.textContent || data.text)}</span></div>`;
    };
    const control = new window.TomSelect(select, {
      create: false, maxItems: 1, maxOptions: null, controlInput: null,
      hideSelected: false, closeAfterSelect: true, searchField: [],
      render: { option: choice, item: choice },
    });
    control.control.setAttribute("aria-labelledby", `${select.id}Label`);
    control.on("dropdown_open", () => {
      const bounds = control.control.getBoundingClientRect();
      const nav = document.querySelector(".mobile-nav");
      const bottom = nav?.getClientRects().length ? nav.getBoundingClientRect().top : window.innerHeight;
      const header = document.querySelector(".deal-subnav");
      const top = Math.max(16, header?.getBoundingClientRect().bottom || 0);
      const below = Math.max(0, bottom - bounds.bottom - 16);
      const above = Math.max(0, bounds.top - top - 16);
      const opensUp = below < 264 && above > below;
      control.wrapper.classList.toggle("dw-select-opens-up", opensUp);
      control.wrapper.style.setProperty("--dw-select-available", `${Math.max(44, opensUp ? above : below)}px`);
    });
  });
}

function destroyDealMatchSelects() {
  dealWorkspace?.querySelectorAll("select[data-dw-match-select]").forEach((select) => select.tomselect?.destroy());
}

function syncDealMatchSuggestion(value) {
  const select = dealWorkspace?.querySelector('[data-dw-match-select="suggestion"]');
  if (!select) return;
  const selected = Array.from(select.options).some((option) => option.value === value) ? value : "all";
  if (select.value === selected) return;
  if (select.tomselect) select.tomselect.setValue(selected, true);
  else select.value = selected;
}

function getDealMatchGeo() {
  return window.NEXORA_DEAL_MATCH_GEO || { countries: {}, groups: [] };
}

function renderDealMatchCountryOptions() {
  const geo = getDealMatchGeo();
  const copy = getDealMatchCopy();
  const english = getDealMatchLanguage() === "en";
  let regionNames;
  try { regionNames = english ? new Intl.DisplayNames(["en"], { type: "region" }) : null; } catch {}
  return `<option value="">${copy.country}</option><option value="world">🌍 ${copy.worldwide}</option>${geo.groups.map(([vi, en, codes]) => `<optgroup label="${escapeHTML(english ? en : vi)}">${codes.filter((code) => geo.countries[code]).map((code) => {
    const raw = geo.countries[code].n;
    const flag = raw.match(/^\S+\s/)?.[0] || "";
    const name = regionNames?.of(code) || raw.replace(/^\S+\s*/, "");
    return `<option value="${code}">${escapeHTML(`${flag}${name}`)}</option>`;
  }).join("")}</optgroup>`).join("")}`;
}

function dealMatchAreaSummary(areas) {
  const copy = getDealMatchCopy();
  if (areas.some((area) => inferDealMatchAreaLevel(area) === "world")) return copy.worldwide;
  return areas.slice(0, 3).join(" · ") + (areas.length > 3 ? ` +${areas.length - 3} ${getDealMatchLanguage() === "en" ? "more" : "nơi"}` : "");
}

function getDealMatchResults(query, areas, industry = "all", service = "all", mode = "multi", radius = 5) {
  const parsed = parseDealMatchQuery(query);
  const worldwide = areas.some((area) => inferDealMatchAreaLevel(area) === "world");
  const requestedService = service !== "all" ? service : parsed.service?.id;
  return deals.filter((deal) => {
    if (deal.lastMinuteOnly) return false;
    const dealService = dealMatchCategoryAliases[deal.category] || deal.category;
    const taxonomyItem = couponTaxonomy.inds.find((item) => item.id === dealService);
    if (industry !== "all" && taxonomyItem?.g !== industry) return false;
    if (requestedService && dealService !== requestedService) return false;
    if (parsed.maxPrice && Number(deal.price) > parsed.maxPrice) return false;
    if (parsed.weekend && !/sat|sun|weekend|cuối tuần/i.test(`${deal.schedule} ${deal.deadline}`)) return false;
    if (mode === "near" && (deal.distance == null || Number(deal.distance) > Number(radius))) return false;
    if (mode === "online" && deal.distance != null && !/online|trực tuyến/i.test(`${deal.location} ${deal.schedule}`)) return false;
    if (mode === "multi" && !worldwide && areas.length) {
      const dealLocation = normalizeDealMatchText(deal.location);
      const inArea = areas.some((area) => dealLocation.includes(normalizeDealMatchText(area.split(",")[0])));
      if (!inArea) return false;
    }
    return true;
  }).sort((a, b) => Number(a.price) - Number(b.price));
}

function renderDealMatchResultList(query, areas, industry = "all", service = "all", mode = "multi", radius = 5) {
  const copy = getDealMatchCopy();
  const matches = getDealMatchResults(query, areas, industry, service, mode, radius);
  const cards = matches.slice(0, 6).map((deal) => `<article class="dw-match-result"><div class="dw-price-block">$${deal.price}</div><div><h3>${escapeHTML(localizeDealMatchDeal(deal, "title"))}</h3><p>${escapeHTML(deal.salon)} · 📍 ${escapeHTML(deal.location)} · ⏳ ${escapeHTML(localizeDealMatchDeal(deal, "deadline"))}</p></div><button class="dw-primary" type="button" data-open="${escapeHTML(deal.id)}">${copy.viewDeal}</button></article>`).join("");
  if (!query.trim()) return cards || `<div class="dw-match-empty"><b>${copy.emptyTitle}</b><p>${copy.emptyCopy}</p></div>`;
  const prompt = `<div class="dw-match-empty"><b>${matches.length ? copy.moreTitle : copy.noneTitle}</b><p>${copy.wishPrompt}</p><button class="dw-primary" type="button" data-dw-save-wish>🙋 ${copy.saveWish}</button></div>`;
  return cards + (matches.length < 2 ? prompt : "");
}

function renderDealMatchWishes() {
  const copy = getDealMatchCopy();
  if (!dealMatchWishes.length) return `<p class="dw-muted">${copy.wishesEmpty}</p>`;
  return dealMatchWishes.map((wish) => {
    const matches = getDealMatchResults(wish.text, wish.areas || [], "all", wish.service || "all", wish.mode || "multi", wish.radius || 5);
    const english = getDealMatchLanguage() === "en";
    const place = wish.mode === "near" ? `${copy.nearMe} · ${wish.radius || 5} mi` : wish.mode === "online" ? "Online" : dealMatchAreaSummary(wish.areas || []) || copy.multiArea;
    const matchLabel = matches.length ? `✓ ${matches.length} ${english ? (matches.length === 1 ? "matching deal" : "matching deals") : "deal khớp"}` : `⏳ ${copy.waiting}`;
    const dayLabel = english ? `${wish.days || 14} days` : `${wish.days || 14} ngày`;
    return `<article class="dw-wish-card ${matches.length ? "matched" : ""}"><div><h3>${escapeHTML(wish.text)}</h3><p>${matchLabel} · 👀 ${wish.seen || 0} ${copy.viewed} · ⏳ ${dayLabel}</p><small>🗺️ ${escapeHTML(place)}</small></div><button class="dw-secondary" type="button" data-dw-remove-wish="${escapeHTML(wish.id)}">${copy.remove}</button></article>`;
  }).join("");
}

function renderDealMatchWorkspace(query = "", areas = ["Garden Grove, California"]) {
  const copy = getDealMatchCopy();
  const english = getDealMatchLanguage() === "en";
  const selectedAreas = areas.length ? areas : ["Garden Grove, California"];
  const areaSummary = dealMatchAreaSummary(selectedAreas);
  const initialResults = getDealMatchResults(query, selectedAreas);
  const suggestions = english
    ? [["🦶 Pedicure < $35","pedicure under $35"],["✨ Gel-X this weekend","gel-x under $45 this weekend"],["💆 Massage < $60","60-minute massage under $60"],["👁️ Eyelash extensions","discounted eyelash extensions"],["💇 Haircut","men's haircut under $25"],["🍜 Lunch","lunch combo under $15"],["📦 Nail supply","wholesale nail powder deal"],["🧽 Car wash","car wash under $20"],["🦷 Dentist","new-patient dental exam"],["🚕 Airport ride","airport transportation"]]
    : [["🦶 Pedicure < $35","pedicure dưới $35"],["✨ Gel-X cuối tuần","gel-x dưới $45 cuối tuần"],["💆 Massage < $60","massage 60 phút dưới $60"],["👁️ Nối mi","nối mi giảm giá"],["💇 Cắt tóc","cắt tóc nam dưới $25"],["🍜 Ăn trưa","combo ăn trưa dưới $15"],["📦 Supply","bột nail sỉ giảm giá"],["🧽 Rửa xe","rửa xe dưới $20"],["🦷 Nha sĩ","nha sĩ khám răng khách mới"],["🚕 Sân bay","đưa đón sân bay"]];
  return `<div class="dw-match-layout">
    <section class="dw-card dw-match-box">
      <div class="dw-heading"><div><span class="dw-kicker">${copy.kicker}</span><h1>✦ Deal Match</h1><p>${copy.intro}</p></div><span class="dw-area-count" data-dw-area-count>${dealMatchAreaCount(selectedAreas.length)}</span></div>
      <form data-dw-match-form>
        <div class="dw-match-input"><input name="need" value="${escapeHTML(query)}" placeholder="${copy.placeholder}" autocomplete="off" /><button type="submit" aria-label="${copy.searchLabel}"><svg class="dw-mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg></button></div>
        <div class="dw-match-suggestion-select dw-match-select"><label class="sr-only" id="dwMatchSuggestionLabel" for="dwMatchSuggestion">${copy.searchLabel}</label><select id="dwMatchSuggestion" data-dw-match-select="suggestion"><option value="all" data-industry-icon="other" ${suggestions.some(([, value]) => value === query) ? "" : "selected"}>${copy.unknownService}</option>${suggestions.map(([label, value], index) => `<option value="${escapeHTML(value)}" data-industry-icon="${["pedi","nail","spa","lash","hair","food","supply","carwash","dental","ride"][index]}" ${value === query ? "selected" : ""}>${escapeHTML(label.replace(/^[^\p{L}\p{N}]+/u, ""))}</option>`).join("")}</select></div>
        <div class="dw-parsed" data-dw-match-parsed>${renderDealMatchParsed(query, selectedAreas)}</div>
        <div class="dw-match-section"><strong>${copy.industries}</strong><div class="dw-match-filter-selects"><div class="dw-match-select" data-dw-match-industries><label class="sr-only" id="dwMatchIndustryLabel" for="dwMatchIndustry">${copy.allIndustries}</label><select id="dwMatchIndustry" name="industry" data-dw-match-select="industry">${renderDealMatchIndustryOptions()}</select></div><div class="dw-match-select" data-dw-match-services hidden><label class="sr-only" id="dwMatchServiceLabel" for="dwMatchService">${copy.allServices}</label><select id="dwMatchService" name="service" data-dw-match-select="service" disabled>${renderDealMatchServiceOptions()}</select></div></div></div>
        <div class="dw-match-section"><strong>${copy.areaHeading}</strong><div class="dw-chip-row"><button class="dw-chip" type="button" data-dw-group="match-location" data-dw-value="near">📍 ${copy.nearMe}</button><button class="dw-chip active" type="button" data-dw-group="match-location" data-dw-value="multi">🗺️ ${copy.multiArea}</button><button class="dw-chip" type="button" data-dw-group="match-location" data-dw-value="online">🌐 ${copy.online}</button></div>
          <div class="dw-radius-row hidden" data-dw-radius-row><span>${copy.radius}</span>${[1,5,10,25].map((radius) => `<button class="dw-chip ${radius === 5 ? "active" : ""}" type="button" data-dw-group="match-radius" data-dw-value="${radius}">${radius} mi</button>`).join("")}</div>
          <div class="dw-geo-picker" data-dw-geo-picker><select data-dw-geo-country aria-label="${copy.country}">${renderDealMatchCountryOptions()}</select><select data-dw-geo-state aria-label="${copy.state}" disabled><option value="">${copy.state}</option></select><select data-dw-geo-city aria-label="${copy.city}" disabled><option value="">${copy.city}</option></select><select data-dw-geo-area aria-label="${copy.area}" disabled><option value="">${copy.area}</option></select><button class="dw-secondary" type="button" data-dw-add-area>${copy.addArea}</button></div>
          <div class="dw-selected-areas" data-dw-selected-areas>${selectedAreas.map((area) => renderDealMatchAreaTag(area)).join("")}</div><input type="hidden" name="areas" value="${escapeHTML(selectedAreas.join("|"))}" /><p class="dw-area-help" data-dw-area-help>${dealMatchAreaHelp(selectedAreas.length)}</p>
        </div>
      </form>
    </section>
    <section class="dw-card dw-match-results" data-dw-match-results><div class="dw-heading"><div><h2 data-dw-match-results-title>${query ? `${initialResults.length} ${english ? (initialResults.length === 1 ? "matching deal" : "matching deals") : "deal khớp"}` : copy.resultsDefault}</h2><p data-dw-area-summary>${copy.matchingAt} ${escapeHTML(areaSummary)}.</p></div></div><div data-dw-match-results-list>${renderDealMatchResultList(query, selectedAreas)}</div></section>
    <section class="dw-card dw-panel"><div class="dw-heading"><div><h2>${copy.wishesTitle}</h2><p>${copy.wishesCopy}</p></div></div><div data-dw-wish-list>${renderDealMatchWishes()}</div></section>
  </div>`;
}

function syncDealMatchAreas() {
  if (!dealWorkspace) return [];
  const areas = [...dealWorkspace.querySelectorAll("[data-dw-remove-area]")].map((button) => button.dataset.dwRemoveArea);
  const hidden = dealWorkspace.querySelector('[data-dw-match-form] input[name="areas"]');
  if (hidden) hidden.value = areas.join("|");
  const worldwide = areas.some((area) => inferDealMatchAreaLevel(area) === "world");
  const count = dealWorkspace.querySelector("[data-dw-area-count]");
  const copy = getDealMatchCopy();
  if (count) count.textContent = worldwide ? copy.worldwide : dealMatchAreaCount(areas.length);
  const help = dealWorkspace.querySelector("[data-dw-area-help]");
  if (help) help.textContent = worldwide ? (getDealMatchLanguage() === "en" ? "Searching deals worldwide." : "Đang tìm deal trên toàn thế giới.") : dealMatchAreaHelp(areas.length);
  const summary = dealWorkspace.querySelector("[data-dw-area-summary]");
  if (summary) summary.textContent = `${copy.matchingAt} ${dealMatchAreaSummary(areas)}.`;
  return areas;
}

function updateDealMatchPreview() {
  if (!dealWorkspace?.querySelector("[data-dw-match-form]")) return;
  const query = dealWorkspace.querySelector('[data-dw-match-form] input[name="need"]')?.value.trim() || "";
  const areas = syncDealMatchAreas();
  const industry = dealWorkspace.querySelector('[data-dw-match-select="industry"]')?.value || "all";
  const service = dealWorkspace.querySelector('[data-dw-match-select="service"]')?.value || "all";
  const mode = dealWorkspace.querySelector('[data-dw-group="match-location"].active')?.dataset.dwValue || "multi";
  const radius = Number(dealWorkspace.querySelector('[data-dw-group="match-radius"].active')?.dataset.dwValue || 5);
  const matches = getDealMatchResults(query, areas, industry, service, mode, radius);
  const parsed = dealWorkspace.querySelector("[data-dw-match-parsed]");
  if (parsed) parsed.innerHTML = renderDealMatchParsed(query, areas);
  const title = dealWorkspace.querySelector("[data-dw-match-results-title]");
  const copy = getDealMatchCopy();
  const english = getDealMatchLanguage() === "en";
  if (title) title.textContent = query ? `${matches.length} ${english ? (matches.length === 1 ? "matching deal" : "matching deals") : "deal khớp"}` : copy.resultsDefault;
  const list = dealWorkspace.querySelector("[data-dw-match-results-list]");
  if (list) list.innerHTML = renderDealMatchResultList(query, areas, industry, service, mode, radius);
  const summary = dealWorkspace.querySelector("[data-dw-area-summary]");
  if (summary) summary.textContent = mode === "near" ? (english ? `Searching within ${radius} mi.` : `Đang tìm trong bán kính ${radius} mi.`) : mode === "online" ? (english ? "Searching online deals." : "Đang tìm các deal dùng Online.") : `${copy.matchingAt} ${dealMatchAreaSummary(areas)}.`;
}

function fillDealMatchGeoSelect(select, entries, placeholder) {
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>${entries.map(([value, label]) => `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`).join("")}`;
  select.disabled = entries.length === 0;
}

function syncDealMatchGeoSelectors(changed) {
  const copy = getDealMatchCopy();
  const countrySelect = dealWorkspace.querySelector("[data-dw-geo-country]");
  const stateSelect = dealWorkspace.querySelector("[data-dw-geo-state]");
  const citySelect = dealWorkspace.querySelector("[data-dw-geo-city]");
  const areaSelect = dealWorkspace.querySelector("[data-dw-geo-area]");
  const country = getDealMatchGeo().countries[countrySelect?.value];
  if (changed === "country") {
    fillDealMatchGeoSelect(stateSelect, country ? Object.entries(country.s).map(([code, state]) => [code, state.n]) : [], copy.state);
    fillDealMatchGeoSelect(citySelect, [], copy.city);
    fillDealMatchGeoSelect(areaSelect, [], copy.area);
  }
  const state = country?.s?.[stateSelect?.value];
  if (changed === "state") {
    fillDealMatchGeoSelect(citySelect, state ? Object.keys(state.c).map((city) => [city, city]) : [], copy.city);
    fillDealMatchGeoSelect(areaSelect, [], copy.area);
  }
  if (changed === "city") {
    const areas = state?.c?.[citySelect?.value] || [];
    fillDealMatchGeoSelect(areaSelect, areas.map((area) => [area, area]), copy.area);
  }
}

function renderOpeningsWorkspace() {
  const rows = workspaceEnglish() ? [
    ["#ff9700", "🍜", "3 days left", "Phở 24 Bellaire", "1.1 mi · Bellaire · 128 registered", "$9 combo · first 100 spots", "15% off for the whole table", "pho-bellaire"],
    ["#ee2756", "💅", "9 days left", "Kayla Nails & Spa · Katy", "8.5 mi · Katy · 47 registered", "30% off all services · first 50 spots", "20% off during opening week", "kayla-nails"],
    ["#11b986", "🧋", "16 days left", "Saigon Boba Sugar Land", "6.2 mi · Sugar Land · 64 registered", "First drink $1 · 200 spots", "Buy one, get one free", "saigon-boba"],
    ["#1994ed", "🦷", "24 days left", "Minh Tâm Dental", "2.4 mi · Bellaire · 19 registered", "Exam + cleaning $49 · 40 spots", "20% off whitening", "pho-bellaire"],
  ] : [
    ["#ff9700", "🍜", "còn 3 ngày", "Phở 24 Bellaire", "1.1 mi · Bellaire · 128 đã đăng ký", "Combo $9 · 100 suất đầu", "Giảm 15% cả bàn", "pho-bellaire"],
    ["#ee2756", "💅", "còn 9 ngày", "Kayla Nails & Spa · Katy", "8.5 mi · Katy · 47 đã đăng ký", "Giảm 30% mọi dịch vụ · 50 suất đầu", "Giảm 20% tuần khai trương", "kayla-nails"],
    ["#11b986", "🧋", "còn 16 ngày", "Saigon Boba Sugar Land", "6.2 mi · Sugar Land · 64 đã đăng ký", "Ly đầu $1 · 200 suất", "Mua 1 tặng 1", "saigon-boba"],
    ["#1994ed", "🦷", "còn 24 ngày", "Nha khoa Minh Tâm", "2.4 mi · Bellaire · 19 đã đăng ký", "Khám + cạo vôi $49 · 40 suất", "Tẩy trắng giảm 20%", "pho-bellaire"],
  ];
  return `<div class="dw-shell"><section class="dw-card dw-opening-page"><div class="dw-heading"><div><span class="dw-kicker">${workspaceCopy("SỰ KIỆN ĐỊA PHƯƠNG · GIỮ CHỖ BẰNG SĐT", "LOCAL EVENTS · RESERVE BY PHONE")}</span><h1>🎊 ${workspaceCopy("Sắp khai trương gần bạn", "Grand openings near you")}</h1><p>${workspaceCopy("Tiệm mới trong bán kính — đăng ký sớm để giữ deal Người sáng lập có số lượng giới hạn.", "Discover new businesses nearby and reserve a limited founder offer before opening day.")}</p></div></div><div class="dw-chip-row">${(workspaceEnglish() ? ["All", "This week", "This month", "Recently opened (30 days)"] : ["Tất cả","Tuần này","Tháng này","Vừa khai trương (30 ngày)"]).map((label, i) => `<button class="dw-chip ${i === 0 ? "active" : ""}" type="button" data-dw-group="opening-window">${label}</button>`).join("")}</div><div class="dw-opening-list">${rows.map(([color,icon,time,name,meta,founder,week,id]) => `<article class="dw-opening-row" style="--accent:${color}"><div class="dw-opening-icon">${icon}</div><div class="dw-opening-copy"><span>⏳ <b>${time}</b></span><h3>${name}</h3><p>📍 ${meta}</p><div class="dw-opening-offer"><p>⭐ <b>${workspaceCopy("Người sáng lập:", "Founder offer:")}</b> ${founder}</p><p>🎊 <b>${workspaceCopy("Tuần khai trương:", "Opening week:")}</b> ${week}</p></div><div class="dw-opening-actions"><button class="dw-primary red" type="button" data-opening-hold="${id}">🙋 ${workspaceCopy("Đăng ký sớm · giữ chỗ", "Register early · reserve a spot")}</button><button class="dw-secondary" type="button">📨 ${workspaceCopy("Rủ bạn", "Invite a friend")}</button><button class="dw-secondary" type="button">🗺️ ${workspaceCopy("Chỉ đường", "Directions")}</button></div></div></article>`).join("")}</div></section></div>`;
}

function renderLastMinuteCustomer() {
  const lastDeals = deals.filter((deal) => deal.lastMinuteOnly).slice(0, 12);
  const categoryFor = (deal) => ({ restaurant: "food", bakery: "bakery", grocery: "market", market: "market", flowers: "flower", auto: "auto", nail: "beauty", hair: "beauty", spa: "beauty", hotel: "hotel", experience: "experience", fitness: "fitness" }[deal.category] || "service");
  const categoryMeta = workspaceEnglish() ? {
    food: ["🍜", "Restaurants"], bakery: ["🥐", "Bakeries"], market: ["🛒", "Grocery & markets"],
    beauty: ["💅", "Nail · Hair · Spa"], fitness: ["🧘", "Fitness & classes"], hotel: ["🏨", "Hotels"],
    experience: ["⛵", "Tours & experiences"], flower: ["💐", "Flowers"], auto: ["🚗", "Auto services"], service: ["⚡", "Services"],
  } : {
    food: ["🍜", "Nhà hàng"], bakery: ["🥐", "Tiệm bánh"], market: ["🛒", "Chợ & thực phẩm"],
    beauty: ["💅", "Nail · Tóc · Spa"], fitness: ["🧘", "Fitness & lớp học"], hotel: ["🏨", "Khách sạn"],
    experience: ["⛵", "Tour & trải nghiệm"], flower: ["💐", "Hoa tươi"], auto: ["🚗", "Xe & dịch vụ"], service: ["⚡", "Dịch vụ"],
  };
  const vietnameseCopy = {
    "harbor-dinner": ["Hộp bữa tối do bếp chọn", "CHẾ BIẾN TRONG NGÀY"],
    "morning-pastry": ["Túi bánh bất ngờ nướng trong ngày", "BÁNH TƯƠI HÔM NAY"],
    "fresh-produce": ["Hộp rau củ và trái cây tươi cuối ngày", "TƯƠI TRONG NGÀY"],
    "bloom-bouquet": ["Bó hoa tươi do tiệm chọn", "HOA TƯƠI CÙNG NGÀY"],
    "cho-viet-market-box": ["Combo rau củ và trái cây cuối buổi", "CHỢ TAN BUỔI"],
    "autoshine-express": ["Suất vệ sinh nhanh nội thất xe vừa trống", "SUẤT TRỐNG CUỐI"],
    "luna-nails-pedicure": ["Pedicure cao cấp vừa trống lịch", "GIỜ NAIL VỪA MỞ"],
    "velvet-hair-blowout": ["Gội và tạo kiểu vừa trống ghế", "GIỜ SALON VỪA MỞ"],
    "serenity-massage": ["Massage 60 phút còn giờ hôm nay", "SPA TRONG NGÀY"],
    "pacific-hotel-tonight": ["Phòng King giá tốt cho đêm nay", "PHÒNG TRỐNG TỐI NAY"],
    "harbor-sunset-cruise": ["Du ngoạn ngắm hoàng hôn còn chỗ", "KHỞI HÀNH HÔM NAY"],
    "reform-pilates-class": ["Lớp Reformer Pilates vừa trống chỗ", "LỚP HỌC SẮP BẮT ĐẦU"],
  };
  const englishInventory = {
    "harbor-dinner": "6 boxes left", "morning-pastry": "4 bags left", "fresh-produce": "5 boxes left", "bloom-bouquet": "3 bouquets left",
    "cho-viet-market-box": "8 portions left", "autoshine-express": "1 spot left", "luna-nails-pedicure": "1 opening available",
    "velvet-hair-blowout": "1 chair available", "serenity-massage": "1 room available", "pacific-hotel-tonight": "2 rooms left",
    "harbor-sunset-cruise": "4 seats available", "reform-pilates-class": "2 spots available",
  };
  const times = ["1:00 PM", "1:30 PM", "2:15 PM", "5:30 PM", "6:15 PM", "7:00 PM", "3:30 PM", "4:15 PM", "5:00 PM", workspaceCopy("Tối nay", "Tonight"), "6:00 PM", "6:30 PM"];
  const windows = ["soon", "soon", "afternoon", "evening", "evening", "evening", "afternoon", "afternoon", "evening", "evening", "evening", "evening"];
  const categories = [...new Set(lastDeals.map(categoryFor))];
  return `<section class="dw-lm-customer" aria-label="${workspaceCopy("Last Minute dành cho khách hàng", "Last Minute offers for customers")}">
    <div class="dw-lm-customer-hero"><div><span class="dw-kicker">${workspaceCopy("GIÁ TỐT CHỈ CÒN HÔM NAY · KHÔNG CẦN CÀI APP", "TODAY'S BEST PRICES · NO APP REQUIRED")}</span><h2>${workspaceCopy("Chọn nhanh trước khi hết giờ", "Choose before time runs out")}</h2><p>${workspaceCopy("Đặt giờ trống vừa mở hoặc giữ phần hàng tươi cuối ngày ở gần bạn. Giá và số lượng được cập nhật trực tiếp.", "Book a newly open appointment or reserve fresh goods nearby. Prices and availability update live.")}</p></div><div class="dw-lm-location"><span>📍</span><div><small>${workspaceCopy("Khu vực của bạn", "Your area")}</small><b>Garden Grove, CA</b></div><button type="button" data-dw-route="#requests">${workspaceCopy("Đổi nơi", "Change area")}</button></div></div>
    <div class="dw-lm-filterbar"><div><b>${workspaceCopy("Khi nào?", "When?")}</b><div class="dw-chip-row">${(workspaceEnglish() ? [["all","All"],["soon","Within 2 hours"],["afternoon","This afternoon"],["evening","Tonight"]] : [["all","Tất cả"],["soon","Trong 2 giờ"],["afternoon","Chiều nay"],["evening","Tối nay"]]).map(([value,label], i) => `<button class="dw-chip ${i === 0 ? "active" : ""}" type="button" data-dw-group="lm-window" data-dw-value="${value}">${label}</button>`).join("")}</div></div><div><b>${workspaceCopy("Loại ưu đãi", "Offer type")}</b><div class="dw-chip-row"><button class="dw-chip active" type="button" data-dw-group="lm-category" data-dw-value="all">${workspaceCopy("Mọi ngành", "All industries")}</button>${categories.map((category) => `<button class="dw-chip" type="button" data-dw-group="lm-category" data-dw-value="${category}">${workspaceIndustryIcon({beauty:"nail",experience:"tour",service:"other"}[category] || category)} ${categoryMeta[category][1]}</button>`).join("")}</div></div></div>
    <div class="dw-lm-results-head"><div><h2>${workspaceCopy("Đang có gần bạn", "Available near you")}</h2><p>${workspaceCopy("Chọn và giữ ngay — ưu đãi tự biến mất khi hết giờ hoặc hết số lượng.", "Book or reserve now. Offers close when time or inventory runs out.")}</p></div><strong data-dw-lm-count>${workspaceCopy(`${lastDeals.length} lựa chọn`, `${lastDeals.length} options`)}</strong></div>
    <div class="dw-lm-market-grid">${lastDeals.map((deal, i) => {
      const category = categoryFor(deal);
      const meta = categoryMeta[category];
      const localized = workspaceEnglish()
        ? [deal.id === "cho-viet-market-box" ? "End-of-day produce & fruit box" : deal.title, deal.badge === "CHỢ TAN BUỔI" ? "END-OF-DAY MARKET" : (deal.badge || "LAST MINUTE")]
        : (vietnameseCopy[deal.id] || [deal.title, deal.badge || "LAST MINUTE"]);
      const windowName = windows[i % windows.length];
      const actionLabel = workspaceEnglish()
        ? ({ food: "Reserve this", bakery: "Reserve this", market: "Reserve this", flower: "Reserve this", beauty: "Book this time", auto: "Book this time", fitness: "Reserve a spot", experience: "Reserve a spot", hotel: "Book tonight" }[category] || "View & book")
        : ({ food: "Giữ phần này", bakery: "Giữ phần này", market: "Giữ phần này", flower: "Giữ phần này", beauty: "Đặt giờ này", auto: "Đặt giờ này", fitness: "Giữ chỗ ngay", experience: "Giữ chỗ ngay", hotel: "Đặt đêm nay" }[category] || "Xem & đặt ngay");
      return `<article class="dw-lm-market-card" data-dw-lm-card data-dw-lm-window="${windowName}" data-dw-lm-category="${category}">
        <div class="dw-lm-card-visual ${deal.image ? "has-image" : ""}" ${deal.image ? `style="--lm-image:url('${escapeHTML(deal.image)}')"` : ""}><span>${meta[0]}</span><div><small>${escapeHTML(localized[1])}</small><b>${escapeHTML(workspaceEnglish() ? (englishInventory[deal.id] || `${deal.inventory || 1} left`) : (deal.inventoryLabel || `${deal.inventory || 1} suất còn lại`))}</b></div></div>
        <div class="dw-lm-card-body"><div class="dw-lm-card-time"><span>⚡ ${times[i % times.length]}</span><b>${workspaceCopy(`còn ${20 + i * 8} phút`, `${20 + i * 8} min left`)}</b></div><h3>${escapeHTML(localized[0])}</h3><a href="#" data-open="${escapeHTML(deal.id)}">${escapeHTML(deal.salon)}</a><p>📍 ${deal.distance} mi · ${escapeHTML(deal.location)}<br>★ ${deal.rating} (${deal.reviews}) · ${workspaceCopy("Đã xác minh", "Verified")}</p><div class="dw-lm-card-price"><span><del>$${deal.original}</del><strong>$${deal.price}</strong></span><button class="dw-primary coral" type="button" data-open="${escapeHTML(deal.id)}">${actionLabel}</button></div></div>
      </article>`;
    }).join("")}</div>
    <div class="dw-lm-empty" data-dw-lm-empty hidden><span>⚡</span><h3>${workspaceCopy("Chưa có lựa chọn trong bộ lọc này", "No offers match these filters")}</h3><p>${workspaceCopy("Thử chọn thời gian hoặc ngành khác; giờ trống mới sẽ xuất hiện liên tục trong ngày.", "Try another time or industry. New openings appear throughout the day.")}</p></div>
  </section>`;
}

function filterLastMinuteCustomer() {
  if (!dealWorkspace) return;
  const windowName = dealWorkspace.querySelector('[data-dw-group="lm-window"].active')?.dataset.dwValue || "all";
  const category = dealWorkspace.querySelector('[data-dw-group="lm-category"].active')?.dataset.dwValue || "all";
  let visible = 0;
  dealWorkspace.querySelectorAll("[data-dw-lm-card]").forEach((card) => {
    const show = (windowName === "all" || card.dataset.dwLmWindow === windowName) && (category === "all" || card.dataset.dwLmCategory === category);
    card.hidden = !show;
    if (show) visible += 1;
  });
  const count = dealWorkspace.querySelector("[data-dw-lm-count]");
  if (count) count.textContent = workspaceCopy(`${visible} lựa chọn`, `${visible} options`);
  const empty = dealWorkspace.querySelector("[data-dw-lm-empty]");
  if (empty) empty.hidden = visible > 0;
}

function renderLastMinuteOwner() {
  const ownerSlots = [
    ["1:00 PM", "busy", "Có lịch"],
    ["1:30 PM", "selling", "⚡ Đang bán $28 · Pedicure · Tâm"],
    ["2:00 PM", "open", "Trống · bấm để mở bán"],
    ["2:30 PM", "booked", "✓ Đã đặt qua Last Minute"],
    ["3:00 PM", "selling", "⚡ Đang bán $48 · Gel-X · Ann"],
    ["3:30 PM", "open", "Trống · bấm để mở bán"],
  ];
  return `<div class="dw-lm-admin-grid"><section class="dw-card dw-lm-settings"><div class="dw-heading"><div><span class="dw-kicker">NEXORA TOUCH · POS PROMOTIONS</span><h2>Chủ tiệm bật một lần, hệ thống tự làm mỗi ngày</h2><p>Giờ trống thật lấy từ Booking. Có khách đặt, slot được khoá và gỡ khỏi Community, OneQR, AI Voice và SMS cùng lúc.</p></div><span class="dw-sync-badge">● Bản xem trước</span></div><div class="dw-toggle-row"><span><b>📅 Booking đang bật</b><small>Nguồn duy nhất của giờ, thợ và dịch vụ.</small></span><button class="active" type="button" data-dw-lm-toggle="booking" aria-pressed="true">Bật</button></div><div class="dw-toggle-row"><span><b>⚡ Last Minute tự động</b><small>Chỉ mở các slot đủ điều kiện.</small></span><button class="active" type="button" data-dw-lm-toggle="automation" aria-pressed="true">Bật</button></div><div class="dw-lm-rule-grid"><label><span>Mở bán trước</span><select><option>2 giờ</option><option selected>3 giờ</option><option>Cả ngày</option></select></label><label><span>Đóng bán trước</span><select><option selected>15 phút</option><option>30 phút</option></select></label><label><span>Mức giảm</span><select><option selected>20%</option><option>$10</option><option>Giá cố định</option></select></label><label><span>Tối đa / ngày</span><input value="6 giờ" readonly /></label></div><div class="dw-lm-channel-list"><strong>Kênh phân phối</strong>${["Community Last Minute","Banner máy check-in","AI Voice khi khách gọi","Trang tiệm / Booking","SMS khách đã đồng ý"].map((label, index) => `<button class="${index < 4 ? "active" : ""}" type="button" data-dw-lm-channel aria-pressed="${index < 4}"><i></i>${label}</button>`).join("")}</div><div class="dw-warning">⚠️ Không cộng với Deal/Coupon khác. Khách vừa huỷ lịch giá gốc không được đặt lại chính slot đó bằng giá Last Minute.</div><a class="dw-primary dw-link-button" href="https://nexoratouch.com/dashboard/pos?section=promotions&amp;goal=last-minute&amp;source=nexora-deals" target="_blank" rel="noreferrer">Mở cài đặt thật trong Nexora Touch</a></section><section class="dw-card dw-lm-board"><div class="dw-heading"><div><h2>Bảng hôm nay · Kayla Nails &amp; Spa</h2><p>Bấm slot trống để mô phỏng mở bán hoặc thu hồi.</p></div><span class="dw-role-badge">Booking live</span></div><div class="dw-ownership-grid"><article><span>Đang bán</span><strong data-dw-lm-selling-count>2 slot</strong></article><article><span>Đã đặt</span><strong>1 slot</strong></article><article><span>Đang giữ</span><strong>0 slot</strong></article><article><span>Chưa mở bán</span><strong data-dw-lm-open-count>2 slot</strong></article></div><div class="dw-time-rows">${ownerSlots.map(([time,status,label]) => `<div class="dw-time-row"><b>${time}</b><button class="dw-time-status ${status}" type="button" data-dw-owner-slot data-dw-slot-state="${status}" ${["busy","booked"].includes(status) ? "disabled" : ""}>${label}</button></div>`).join("")}</div><div class="dw-info-strip"><b>Hạ tầng đúng:</b> released → held → booked → checked_in / no_show. Mỗi slot chỉ có một trạng thái và một nguồn lịch.</div></section></div>`;
}

function renderLastMinuteCheckin() {
  return `<div class="dw-lm-admin-grid"><section class="dw-card dw-checkin-preview"><span class="dw-kicker">ONEQR / STATION CHECK-IN</span><h2>Nhập số điện thoại để nhận đúng lịch và giá đã chốt</h2><div class="dw-info-strip"><b>⚡ Còn 4 giờ trống hôm nay</b> · khách walk-in có thể đặt ngay tại máy.</div><form data-dw-lm-checkin-form><label><span>Số điện thoại</span><input name="phone" value="7135550142" inputmode="tel" autocomplete="tel" /></label><div class="dw-chip-row"><button class="dw-chip" type="button" data-dw-checkin-phone="7135550142">Lan · đặt 1:30</button><button class="dw-chip" type="button" data-dw-checkin-phone="7135550177">Minh · tới trễ</button><button class="dw-chip" type="button" data-dw-checkin-phone="7135550199">Walk-in</button></div><button class="dw-primary" type="submit">Tra lịch &amp; check-in</button></form><div class="dw-checkin-result" data-dw-checkin-result><span>✓</span><div><strong>Lan · 1:30 PM · Pedicure với Tâm</strong><p>Giá Last Minute $28 (gốc $35) · booking_id và lm_id đã sẵn sàng cho POS.</p></div></div></section><aside class="dw-card dw-explain-card"><h2>Máy check-in tra 3 tầng</h2><div class="dw-flow dw-flow-compact">${[["1 · Khách","Chuẩn hoá SĐT"],["2 · Booking","Tìm reservation còn hiệu lực"],["3 · Last Minute","Đọc lm_id, slot, thợ và giá"],["4 · POS","Xếp đúng thợ, áp giá đã chốt"]].map(([a,b]) => `<article><strong>${a}</strong><p>${b}</p></article>`).join("")}</div><table class="dw-compare"><tbody><tr><th>Tới đúng giờ</th><td>Check-in và áp giá Last Minute.</td></tr><tr><th>Tới trễ</th><td>Hết grace period thì mất slot; gợi ý slot kế tiếp.</td></tr><tr><th>Walk-in</th><td>Hiện các slot đang ở trạng thái released.</td></tr><tr><th>No-show</th><td>Ghi theo phone_hash để áp chính sách sau này.</td></tr></tbody></table></aside></div>`;
}

function renderLastMinuteRules() {
  const fields = [
    ["lm_id", "Mã một lần mở bán"], ["slot_id · tech_id · service_id", "Nguồn từ Booking"],
    ["price_orig · price_lm · floor", "Giá gốc, giá chốt, giá sàn"], ["released_at · closes_at · hold_until", "Mốc mở, đóng và giữ"],
    ["status", "released / held / booked / checked_in / no_show / expired / withdrawn"], ["booking_id · phone_hash", "Lịch phát sinh và định danh bảo vệ"],
    ["channel", "community / kiosk / voice / sms / page"], ["issuer_type · issuer_id · payee_id", "Ai mở bán, ai nhận tiền"],
  ];
  return `<div class="dw-lm-rules"><section class="dw-card dw-panel"><span class="dw-kicker">VÒNG ĐỜI SLOT</span><h2>Một giờ chỉ thuộc một trạng thái tại một thời điểm</h2><div class="dw-life"><span>trống</span><b>→</b><span class="released">released</span><b>→</b><span class="held">held</span><b>→</b><span class="booked">booked</span><b>→</b><span class="checked">checked_in</span><b>/</b><span class="expired">no_show</span></div><p class="dw-muted">Booked phải gỡ cùng lúc khỏi mọi kênh. Held quá hạn quay lại released; chưa ai đặt tới giờ đóng bán thì expired.</p></section><section class="dw-card dw-panel"><h2>Dữ liệu hạ tầng phải lưu</h2><table class="dw-compare"><thead><tr><th>Trường</th><th>Ý nghĩa</th></tr></thead><tbody>${fields.map(([field,meaning]) => `<tr><th><code>${field}</code></th><td>${meaning}</td></tr>`).join("")}</tbody></table></section><section class="dw-card dw-panel"><h2>Phần còn cần chốt trước khi nối thật</h2><div class="dw-open-decisions">${["Thời gian giữ slot khi khách xác nhận","Grace period khi khách tới trễ","Có thu cọc hay không và đi qua phương thức thanh toán Nexora Touch nào","Chính sách no-show và khách vừa huỷ lịch","Có cho cộng với Deal/Coupon khác","Giới hạn slot/ngày theo tiệm hay theo thợ","Phí Nexora/OneQR khi booking hoàn tất","Last Minute có xuất hiện trên trang SEO hay chỉ noindex"].map((item, index) => `<article><b>${String(index + 1).padStart(2,"0")}</b><span>${item}</span></article>`).join("")}</div></section></div>`;
}

function renderLastMinuteRole(role = "customer") {
  if (role === "owner") return renderLastMinuteOwner();
  if (role === "checkin") return renderLastMinuteCheckin();
  if (role === "rules") return renderLastMinuteRules();
  return renderLastMinuteCustomer();
}

function renderLastMinuteWorkspace() {
  const workerAction = hasWorkerWorkspaceAccess()
    ? `<button type="button" data-dw-route="#my-open-slots">✂️ ${workspaceCopy("Giờ trống của tôi", "My open slots")}</button>`
    : "";
  return `<div class="dw-shell"><section class="dw-card"><header class="dw-lm-head"><div class="dw-lm-title"><span class="dw-lm-bolt">⚡</span><div><h1>${workspaceCopy("Last Minute gần bạn", "Last Minute near you")}</h1><p>${workspaceCopy("Đặt giờ trống hoặc giữ phần hàng tươi còn lại — giá chỉ còn trong hôm nay.", "Book an open appointment or reserve fresh goods at today's limited price.")}</p></div></div><span class="dw-live">● ${workspaceCopy("Cập nhật trực tiếp", "Live updates")}</span>${workerAction ? `<div class="dw-role-tabs">${workerAction}</div>` : ""}</header></section><div data-dw-lm-role-panel>${renderLastMinuteRole("customer")}</div></div>`;
}

function renderWorkerAccessGate() {
  return `<div class="dw-shell"><section class="dw-card dw-worker-gate"><span class="dw-worker-gate-icon">🔒</span><span class="dw-kicker">NEXORA ID · KHU VỰC CÁ NHÂN</span><h1>Giờ trống của tôi chỉ dành cho thợ</h1><p>Khách hàng không nhìn thấy lịch làm việc, thiết lập giá hoặc thông tin nhận tiền. Sau khi đăng nhập, Nexora ID sẽ xác nhận bạn là thợ tự do, thợ thuê ghế hoặc nhân viên tiệm.</p><div class="dw-worker-gate-actions"><button class="dw-primary" type="button" data-dw-signin>Đăng nhập NEXORA ID</button><button class="dw-secondary" type="button" data-dw-route="#last-minute">Xem Last Minute công khai</button></div><small>Bản đang chạy chỉ mô phỏng điều hướng theo vai trò. Hạ tầng thật phải kiểm tra quyền ở máy chủ trước khi trả dữ liệu lịch.</small></section></div>`;
}

function renderOpenSlotsWorkspace(role = localStorage.getItem("nexora-worker-role") || "chair") {
  if (!hasWorkerWorkspaceAccess()) return renderWorkerAccessGate();
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
      metrics: [["Lịch thuộc về", "Bạn"], ["Giá do", "Bạn đặt"], ["Booking vào", "NEXORA ID"], ["Tiền về", "Tài khoản payout của bạn"]],
      actions: [["area", "📍 Khu vực & phí di chuyển", "Bellaire + 8 mi"], ["calendar", "📅 Kết nối lịch cá nhân", "Đang đồng bộ"], ["payout", "💳 Tài khoản nhận tiền", "Nexora Touch Pay · ••4821"]],
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
    "#nail-salons": renderNailDirectory,
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
    "#legal": renderLegalCenter,
  };
  const render = renderers[route];
  if (!render) return;
  document.body.classList.add("deal-workspace-mode");
  document.body.classList.toggle("legal-workspace-mode", route === "#legal");
  dealWorkspace.hidden = false;
  destroyDealMatchSelects();
  dealWorkspace.innerHTML = render();
  if (route === "#requests") initializeDealMatchSelects();
  if (route === "#nearby") applyNearbyFilters();
  if (route === "#nail-salons") initializeNailDirectory();
  setActiveNavigation(route === "#legal" ? "#legal" : "#coupons");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeDealWorkspace() {
  document.body.classList.remove("deal-workspace-mode");
  document.body.classList.remove("legal-workspace-mode");
  if (dealWorkspace) {
    destroyDealMatchSelects();
    dealWorkspace.hidden = true;
    dealWorkspace.innerHTML = "";
  }
}

dealWorkspace?.addEventListener("click", (event) => {
  const legalButton = event.target.closest("[data-legal-view]");
  if (legalButton) {
    event.preventDefault();
    legalView = legalButton.dataset.legalView || "overview";
    const next = new URL(location.href);
    next.searchParams.set("legal", legalView);
    next.hash = "#legal";
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    renderDealWorkspace("#legal");
    return;
  }
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
      const picker = chip.closest("[data-dw-category-picker]");
      const selectedLabel = picker?.querySelector("[data-dw-selected-group]");
      const selectedGroup = couponTaxonomy.groups.find((group) => group.id === chip.dataset.dwValue);
      if (selectedLabel && selectedGroup) selectedLabel.innerHTML = `${workspaceIndustryIcon("group:" + selectedGroup.id)} ${escapeHTML(workspaceEnglish() ? selectedGroup.en : selectedGroup.vi)}`;
      if (picker) picker.open = false;
      filterCouponDirectory(chip.dataset.dwValue, "");
      return;
    }
    if (chip.dataset.dwGroup === "match-location") {
      const mode = chip.dataset.dwValue;
      dealWorkspace.querySelector("[data-dw-geo-picker]")?.classList.toggle("hidden", mode !== "multi");
      dealWorkspace.querySelector("[data-dw-radius-row]")?.classList.toggle("hidden", mode !== "near");
      updateDealMatchPreview();
      return;
    }
    if (chip.dataset.dwGroup === "match-radius") {
      updateDealMatchPreview();
      return;
    }
    if (["lm-window", "lm-category"].includes(chip.dataset.dwGroup)) {
      filterLastMinuteCustomer();
      return;
    }
  }
  const nailMenu = event.target.closest('[data-dw-nail-menu]');
  if(nailMenu){const panel=dealWorkspace.querySelector('#nailCouponServices');if(panel){panel.hidden=!panel.hidden;nailMenu.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});}return;}
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
  const addArea = event.target.closest("[data-dw-add-area]");
  if (addArea) {
    const english = getDealMatchLanguage() === "en";
    const geo = getDealMatchGeo().countries;
    const countryCode = dealWorkspace.querySelector("[data-dw-geo-country]")?.value || "";
    const stateCode = dealWorkspace.querySelector("[data-dw-geo-state]")?.value || "";
    const city = dealWorkspace.querySelector("[data-dw-geo-city]")?.value || "";
    const neighborhood = dealWorkspace.querySelector("[data-dw-geo-area]")?.value || "";
    let selectedLevel = "country";
    let area = "";
    if (countryCode === "world") {
      selectedLevel = "world";
      area = english ? "Worldwide" : "Toàn thế giới";
    } else if (countryCode && geo[countryCode]) {
      const fallbackCountryName = geo[countryCode].n.replace(/^\S+\s*/, "");
      let countryName = fallbackCountryName;
      if (english) {
        try { countryName = new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || fallbackCountryName; } catch {}
      }
      const stateName = geo[countryCode].s?.[stateCode]?.n || "";
      if (neighborhood) { selectedLevel = "area"; area = `${neighborhood}, ${city}, ${stateName}, ${countryName}`; }
      else if (city) { selectedLevel = "city"; area = `${city}, ${stateName}, ${countryName}`; }
      else if (stateName) { selectedLevel = "state"; area = `${stateName}, ${countryName}`; }
      else area = countryName;
    }
    if (!area) { showToast(english ? "Choose a country or Worldwide before adding." : "Chọn quốc gia hoặc Toàn thế giới trước khi thêm."); return; }
    const current = syncDealMatchAreas();
    if (current.some((item) => item.toLocaleLowerCase("vi") === area.toLocaleLowerCase("vi"))) {
      showToast(english ? "This area is already in your list." : "Khu vực này đã có trong danh sách.");
      return;
    }
    if (selectedLevel !== "world" && current.length >= 10) { showToast(english ? "You can search up to 10 areas at once." : "Có thể tìm tối đa 10 khu vực cùng lúc."); return; }
    const selectedAreas = dealWorkspace.querySelector("[data-dw-selected-areas]");
    if (selectedLevel === "world") {
      selectedAreas?.replaceChildren();
    } else {
      selectedAreas?.querySelector('[data-dw-area-tag-level="world"]')?.remove();
    }
    const button = document.createElement("button");
    button.className = "dw-area-tag";
    button.type = "button";
    button.dataset.dwRemoveArea = area;
    button.dataset.dwAreaTagLevel = selectedLevel;
    button.innerHTML = `<span>${dealMatchAreaLevels[selectedLevel]?.icon || "📍"} ${escapeHTML(area)}</span><b aria-hidden="true">×</b>`;
    selectedAreas?.append(button);
    syncDealMatchAreas();
    updateDealMatchPreview();
    showToast(selectedLevel === "world"
      ? (english ? "Deal Match will search worldwide." : "Deal Match sẽ tìm trên toàn thế giới.")
      : (english ? `Added ${area} to Deal Match.` : `Đã thêm ${area} vào Deal Match.`));
    return;
  }
  const removeArea = event.target.closest("[data-dw-remove-area]");
  if (removeArea) {
    const current = syncDealMatchAreas();
    if (current.length <= 1) { showToast(getDealMatchLanguage() === "en" ? "Deal Match needs at least one area." : "Deal Match cần giữ lại ít nhất một khu vực."); return; }
    removeArea.remove();
    syncDealMatchAreas();
    updateDealMatchPreview();
    return;
  }
  const wish = event.target.closest("[data-dw-save-wish]");
  if (wish) {
    const english = getDealMatchLanguage() === "en";
    const input = dealWorkspace.querySelector('[data-dw-match-form] input[name="need"]');
    const value = input?.value.trim();
    if (!value) { input?.focus(); showToast(english ? "Describe what you need before saving a request." : "Hãy gõ nhu cầu trước khi đăng mong muốn."); return; }
    const parsed = parseDealMatchQuery(value);
    if (!parsed.service) { showToast(english ? "Name the service you need, such as Gel-X, massage or dentist." : "Hãy nói rõ dịch vụ cần tìm, ví dụ Gel-X, massage hoặc nha sĩ."); return; }
    const areas = syncDealMatchAreas();
    const mode = dealWorkspace.querySelector('[data-dw-group="match-location"].active')?.dataset.dwValue || "multi";
    const radius = Number(dealWorkspace.querySelector('[data-dw-group="match-radius"].active')?.dataset.dwValue || 5);
    if (!dealMatchWishes.some((item) => normalizeDealMatchText(item.text) === normalizeDealMatchText(value) && JSON.stringify(item.areas) === JSON.stringify(areas))) {
      dealMatchWishes.unshift({ id: `wish-${Date.now()}`, text: value, service: parsed.service.id, maxPrice: parsed.maxPrice, weekend: parsed.weekend, areas, mode, radius, seen: 0, days: 14 });
      localStorage.setItem("nexora-deal-match-wishes", JSON.stringify(dealMatchWishes));
    }
    const list = dealWorkspace.querySelector("[data-dw-wish-list]");
    if (list) list.innerHTML = renderDealMatchWishes();
    showToast(english ? "Request saved. Businesses see only aggregated demand, not your identity." : "Đã đăng mong muốn. Doanh nghiệp chỉ thấy nhu cầu đã gom, chưa thấy danh tính của bạn.");
    return;
  }
  const removeWish = event.target.closest("[data-dw-remove-wish]");
  if (removeWish) {
    dealMatchWishes = dealMatchWishes.filter((item) => item.id !== removeWish.dataset.dwRemoveWish);
    localStorage.setItem("nexora-deal-match-wishes", JSON.stringify(dealMatchWishes));
    const list = dealWorkspace.querySelector("[data-dw-wish-list]");
    if (list) list.innerHTML = renderDealMatchWishes();
    showToast(getDealMatchLanguage() === "en" ? "Request removed." : "Đã bỏ mong muốn này.");
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
    role.parentElement?.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button === role));
    const panel = dealWorkspace.querySelector("[data-dw-lm-role-panel]");
    if (panel) panel.innerHTML = renderLastMinuteRole(selected);
    const messages = {
      customer: "Đang xem trải nghiệm đặt giờ của khách.",
      owner: "Đây là bản xem trước; cấu hình thật nằm trong Nexora Touch Booking/POS.",
      checkin: "Check-in dùng SĐT để tìm đúng booking và giá Last Minute đã chốt.",
      rules: "Đang xem vòng đời slot và hợp đồng dữ liệu cần nối với hạ tầng.",
    };
    showToast(messages[selected] || "Đã chuyển chế độ Last Minute.");
    return;
  }
  const lmToggle = event.target.closest("[data-dw-lm-toggle]");
  if (lmToggle) {
    const nextActive = !lmToggle.classList.contains("active");
    lmToggle.classList.toggle("active", nextActive);
    lmToggle.setAttribute("aria-pressed", String(nextActive));
    lmToggle.textContent = nextActive ? "Bật" : "Tắt";
    const booking = dealWorkspace.querySelector('[data-dw-lm-toggle="booking"]');
    const automation = dealWorkspace.querySelector('[data-dw-lm-toggle="automation"]');
    if (automation?.classList.contains("active") && !booking?.classList.contains("active")) {
      automation.classList.remove("active");
      automation.setAttribute("aria-pressed", "false");
      automation.textContent = "Tắt";
      showToast("Last Minute đã tắt vì Booking là nguồn giờ bắt buộc.");
    } else {
      showToast(`${lmToggle.dataset.dwLmToggle === "booking" ? "Booking" : "Tự động Last Minute"} đã ${nextActive ? "bật" : "tắt"} trong bản xem trước.`);
    }
    return;
  }
  const lmChannel = event.target.closest("[data-dw-lm-channel]");
  if (lmChannel) {
    const nextActive = !lmChannel.classList.contains("active");
    lmChannel.classList.toggle("active", nextActive);
    lmChannel.setAttribute("aria-pressed", String(nextActive));
    showToast(`Kênh phân phối đã ${nextActive ? "bật" : "tắt"} trong bản xem trước.`);
    return;
  }
  const ownerSlot = event.target.closest("[data-dw-owner-slot]");
  if (ownerSlot && ["open", "selling"].includes(ownerSlot.dataset.dwSlotState)) {
    const nextState = ownerSlot.dataset.dwSlotState === "open" ? "selling" : "open";
    ownerSlot.dataset.dwSlotState = nextState;
    ownerSlot.className = `dw-time-status ${nextState}`;
    ownerSlot.textContent = nextState === "selling" ? "⚡ Đang bán $48 · bấm để thu hồi" : "Trống · bấm để mở bán";
    const sellingCount = dealWorkspace.querySelectorAll('[data-dw-owner-slot][data-dw-slot-state="selling"]').length;
    const openCount = dealWorkspace.querySelectorAll('[data-dw-owner-slot][data-dw-slot-state="open"]').length;
    const sellingLabel = dealWorkspace.querySelector("[data-dw-lm-selling-count]");
    const openLabel = dealWorkspace.querySelector("[data-dw-lm-open-count]");
    if (sellingLabel) sellingLabel.textContent = `${sellingCount} slot`;
    if (openLabel) openLabel.textContent = `${openCount} slot`;
    showToast(nextState === "selling" ? "Đã phát hành giờ trống lên các kênh đang bật." : "Đã thu hồi giờ trống khỏi mọi kênh.");
    return;
  }
  const checkinPhone = event.target.closest("[data-dw-checkin-phone]");
  if (checkinPhone) {
    const input = dealWorkspace.querySelector('[data-dw-lm-checkin-form] input[name="phone"]');
    if (input) input.value = checkinPhone.dataset.dwCheckinPhone;
    dealWorkspace.querySelector("[data-dw-lm-checkin-form]")?.requestSubmit();
    return;
  }
});

dealWorkspace?.addEventListener("input", (event) => {
  if (event.target.closest("[data-dw-directory-search]")) {
    filterCouponDirectory(null, event.target.value);
  }
  if (event.target.matches('[data-dw-match-form] input[name="need"]')) {
    syncDealMatchSuggestion(event.target.value);
    updateDealMatchPreview();
  }
});

dealWorkspace?.addEventListener("change", (event) => {
  const select = event.target;
  if (select.matches('[data-dw-match-select="suggestion"]')) {
    if (select.value === "all") return;
    const input = dealWorkspace.querySelector('[data-dw-match-form] input[name="need"]');
    if (input) { input.value = select.value; input.focus(); }
    updateDealMatchPreview();
    return;
  }
  if (select.matches('[data-dw-match-select="industry"]')) {
    const services = dealWorkspace.querySelector("[data-dw-match-services]");
    const service = services?.querySelector("select");
    if (service) {
      service.tomselect?.destroy();
      service.innerHTML = renderDealMatchServiceOptions(select.value);
      service.value = "all";
      service.disabled = select.value === "all";
      services.hidden = service.disabled;
      initializeDealMatchSelects();
    }
    updateDealMatchPreview();
    return;
  }
  if (select.matches('[data-dw-match-select="service"]')) {
    updateDealMatchPreview();
    return;
  }
  if (event.target.matches("[data-dw-geo-country]")) syncDealMatchGeoSelectors("country");
  if (event.target.matches("[data-dw-geo-state]")) syncDealMatchGeoSelectors("state");
  if (event.target.matches("[data-dw-geo-city]")) syncDealMatchGeoSelectors("city");
});

dealWorkspace?.addEventListener("submit", (event) => {
  if (event.target.matches("[data-dw-lm-checkin-form]")) {
    event.preventDefault();
    const phone = String(new FormData(event.target).get("phone") || "").replace(/\D/g, "");
    const result = dealWorkspace.querySelector("[data-dw-checkin-result]");
    if (!result) return;
    if (phone.endsWith("0142")) {
      result.className = "dw-checkin-result success";
      result.innerHTML = "<span>✓</span><div><strong>Lan · 1:30 PM · Pedicure với Tâm</strong><p>Giá Last Minute $28 (gốc $35) · booking_id và lm_id đã sẵn sàng cho POS.</p></div>";
      showToast("Đã tìm đúng lịch và giá Last Minute của Lan.");
    } else if (phone.endsWith("0177")) {
      result.className = "dw-checkin-result warning";
      result.innerHTML = "<span>!</span><div><strong>Minh đã quá grace period của slot 1:00 PM</strong><p>Không tự áp giá cũ. Có thể đề nghị slot 2:15 PM còn trống và tạo booking mới.</p></div>";
      showToast("Lịch cũ đã trễ; hệ thống đang gợi ý slot kế tiếp.");
    } else {
      result.className = "dw-checkin-result neutral";
      result.innerHTML = "<span>⚡</span><div><strong>Không có reservation đang hiệu lực</strong><p>Hiện 4 slot released cho khách walk-in; chỉ chốt giá sau khi khách chọn giờ và xác nhận SĐT.</p></div>";
      showToast("Đây là khách walk-in; chưa áp bất kỳ giá giảm nào.");
    }
    return;
  }
  if (event.target.matches("[data-dw-nearby-search]")) {
    event.preventDefault();
    applyNearbyFilters();
    const picker=dealWorkspace.querySelector('[data-nearby-picker]');if(picker)picker.open=false;
    return;
  }
  if (event.target.matches("[data-dw-match-form]")) {
    event.preventDefault();
    const value = new FormData(event.target).get("need").trim();
    if (!value) {
      event.target.querySelector('input[name="need"]')?.focus();
      showToast("Hãy gõ điều bạn đang cần tìm.");
      return;
    }
    const next = new URL(location.href);
    next.searchParams.set("q", value);
    const areas = (new FormData(event.target).get("areas") || "").split("|").filter(Boolean);
    if (areas.length) next.searchParams.set("areas", areas.join("|"));
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    updateDealMatchPreview();
    const mode = dealWorkspace.querySelector('[data-dw-group="match-location"].active')?.dataset.dwValue || "multi";
    showToast(mode === "multi" ? `Đã ghép nhu cầu tại ${areas.length} khu vực.` : mode === "near" ? "Đã tìm deal gần vị trí của bạn." : "Đã tìm deal dùng Online.");
  }
});

function handleRoute(hash) {
  const route = hash || "#discover";
  announceRoute(route);
  document.body.classList.toggle("landing-discover-mode", route === "#discover");
  setActiveDealSubnav(route);
  if (DEAL_WORKSPACE_ROUTES.has(route)) {
    if (route === "#legal") {
      const requestedLegalView = new URLSearchParams(location.search).get("legal");
      if (LEGAL_COPY.vi.docs[requestedLegalView]) legalView = requestedLegalView;
    }
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
    state.activeCategory = "all";
    searchInput.value = "";
    wishlistView = "all";
    setActiveNavigation(route);
    document.querySelectorAll("[data-wishlist-view]").forEach((button) => button.classList.toggle("active", button.dataset.wishlistView === wishlistView));
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
  if (route === "#download-app") {
    setActiveNavigation("#discover");
    document.querySelector("#download-app")?.scrollIntoView({ behavior: "smooth", block: "center" });
    emitNexoraFunctionEvent("open_function", { function: "download-app" });
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

function updateLandingGrowthEstimate() {
  const range = document.querySelector("#landingTrafficRange");
  if (!range) return;
  const daily = Number(range.value || 0);
  const monthly = daily * 30;
  const format = (value) => Math.round(value).toLocaleString(document.documentElement.lang || "en");
  document.querySelector("#landingTrafficValue").textContent = format(daily);
  document.querySelector("#landingMonthlyScans").textContent = format(monthly);
  document.querySelector("#landingDiscoveryOpens").textContent = format(monthly * 0.21);
  document.querySelector("#landingQualifiedClicks").textContent = format(monthly * 0.064);
  document.querySelector("#landingAttributedBookings").textContent = format(monthly * 0.012);
}

document.querySelector("#landingTrafficRange")?.addEventListener("input", updateLandingGrowthEstimate);
document.querySelector("#businessStartForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const url = new URL(buildNexoraAuthUrl("register"));
  url.searchParams.set("role", "business");
  url.searchParams.set("intent", "promotion");
  url.searchParams.set("industry", String(formData.get("industry") || "other"));
  url.searchParams.set("city", String(formData.get("city") || "").trim());
  url.searchParams.set("goal", String(formData.get("goal") || "new_customers"));
  location.href = url.toString();
});
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
document.querySelectorAll(".site-footer [data-legal-view]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    legalView = link.dataset.legalView || "overview";
    const next = new URL(location.href);
    next.searchParams.set("legal", legalView);
    next.hash = "#legal";
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    handleRoute("#legal");
  });
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
function requestCurrentLocation() {
  if (!navigator.geolocation) {
    showToast("Trình duyệt này chưa hỗ trợ vị trí. Bạn vẫn có thể nhập city hoặc ZIP.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    () => {
      locationInput.value = "Vị trí hiện tại";
      showToast("Đã cập nhật vị trí. Kết quả được sắp theo khoảng cách.");
      syncLocationLabels();
      renderMap();
    },
    () => showToast("Chưa thể đọc vị trí. Hãy nhập city hoặc ZIP để tiếp tục."),
    { enableHighAccuracy: false, timeout: 8000 },
  );
}
document.querySelectorAll("[data-use-current-location]").forEach((button) => button.addEventListener("click", requestCurrentLocation));

document.querySelectorAll("button[data-industry]").forEach((button) => {
  button.addEventListener("click", () => showToast(`${button.dataset.industry} đã nằm trong lộ trình mở rộng sau nail.`));
});

document.querySelectorAll(".ai-guide-launch").forEach((button) => button.addEventListener("click", openAIGuide));
document.querySelector("[data-ai-nudge-close]")?.addEventListener("click", () => {
  const nudge = document.querySelector("#aiGuideNudge");
  if (nudge) nudge.hidden = true;
  localStorage.setItem("nexora-ai-guide-seen", "1");
});
document.querySelectorAll("[data-ai-intent]").forEach((button) => {
  button.addEventListener("click", () => {
    setAIGuideSelection(button.dataset.aiIntent);
    setAIGuideStep(2);
    const result = document.querySelector("#aiGuideResult");
    if (result) result.hidden = true;
    const copy = getAIGuideCopy();
    const message = document.querySelector("[data-ai-message]");
    if (message) message.textContent = copy.selectedMessage;
    document.querySelector('#aiGuideForm [name="need"]')?.focus();
  });
});
document.querySelector("#aiGuideForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const need = String(data.get("need") || "").trim();
  const area = String(data.get("area") || "").trim();
  renderAIGuideResult(aiGuideSelectedIntent || inferAIGuideIntent(need), need, area);
});
document.querySelector("#aiGuideResultAction")?.addEventListener("click", () => {
  const result = document.querySelector("#aiGuideResult");
  openAIGuideRoute(result?.dataset.intent || "request", result?.dataset.need || "", result?.dataset.area || "");
});
document.querySelector("[data-ai-reset]")?.addEventListener("click", resetAIGuide);

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.closest("dialog")));
});

[dealDialog, requestDialog, mapDialog, filterDialog, businessDialog, oneqrDialog, couponClaimDialog, openingHoldDialog, functionBridgeDialog, aiGuideDialog].forEach((dialog) => {
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

document.querySelectorAll("[data-wishlist-view]").forEach((button) => {
  button.addEventListener("click", () => {
    wishlistView = button.dataset.wishlistView || "all";
    document.querySelectorAll("[data-wishlist-view]").forEach((item) => item.classList.toggle("active", item === button));
    renderDeals();
    document.querySelector(".results-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          industry: { type: "string", description: "Mã một trong 13 nhóm ngành, ví dụ beauty, food, shop hoặc health." },
          category: { type: "string", description: "Mã một trong 129 ngành nghề của Nexora." },
          service: { type: "string", description: "Dịch vụ cụ thể hoặc all." },
          areas: { type: "array", items: { type: "string" }, maxItems: 10, description: "Phạm vi tìm kiếm gồm toàn thế giới, quốc gia, tiểu bang/tỉnh, thành phố, ZIP code hoặc nhiều khu vực cùng lúc." },
          maxDistance: { type: "number", minimum: 1, maximum: 25 },
        },
      },
      execute: async ({ query = "", industry = "", category = "", service = "all", areas = [], maxDistance = 5 } = {}) => {
        const normalized = query.toLocaleLowerCase("vi");
        const taxonomyMatch = couponTaxonomy.inds.find((item) => item.id === category);
        if (industry && taxonomyMatch && taxonomyMatch.g !== industry) return [];
        const requestedCategory = service !== "all" ? service : category;
        const normalizedAreas = areas.map((area) => area.toLocaleLowerCase("vi"));
        const worldwide = normalizedAreas.some((area) => ["toàn thế giới", "worldwide", "global"].includes(area));
        return deals.filter((deal) => (
          (!requestedCategory || requestedCategory === "all" || requestedCategory === "nail" || deal.category === requestedCategory)
          && deal.distance <= maxDistance
          && `${deal.title} ${deal.salon}`.toLocaleLowerCase("vi").includes(normalized)
          && (!normalizedAreas.length || worldwide || normalizedAreas.some((area) => deal.location.toLocaleLowerCase("vi").includes(area.split(",")[0])))
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
          areas: { type: "array", items: { type: "string" }, maxItems: 10 },
          date: { type: "string" },
          time: { type: "string" },
          notes: { type: "string", maxLength: 500 },
        },
        required: ["service", "budget"],
      },
      execute: async ({ service, budget, radius = 5, areas = [], date = "Linh hoạt", time = "Linh hoạt", notes = "" }) => {
        const request = { id: `req-${Date.now()}`, service, budget, radius, areas: areas.slice(0, 10), date, time, notes };
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
      name: "book_last_minute_slot",
      description: "Giữ một giờ trống Last Minute thật từ Booking bằng số điện thoại. Slot phải có thợ, dịch vụ, giờ và giá đã chốt.",
      inputSchema: {
        type: "object",
        properties: {
          dealId: { type: "string" },
          phone: { type: "string" },
        },
        required: ["dealId", "phone"],
      },
      execute: async ({ dealId, phone }) => {
        const deal = getDeal(dealId);
        const normalizedPhone = normalizePhone(phone);
        if (!deal?.lastMinuteOnly) return { ok: false, error: "Last Minute slot not found" };
        if (!normalizedPhone) return { ok: false, error: "Valid phone number required" };
        const stamp = Date.now();
        return {
          ok: true,
          status: "held",
          lmId: `lm-${stamp}`,
          slotId: `slot-${deal.id}`,
          bookingId: null,
          phone: maskPhone(normalizedPhone),
          holdUntil: new Date(stamp + 5 * 60 * 1000).toISOString(),
          price: deal.price,
          message: "Demo hold only. Production must confirm through the shared Booking service before creating booking_id.",
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
updateLandingGrowthEstimate();
renderRequests();
applyIncomingDealSearch();
renderDeals();
updateMerchantPreview();
renderBusinessWorkspace();
initializeLanguageControl();
initializeHeroCarousel();
initializeAIGuideNudge();
syncRoleNavigation();
updateNexoraAuthLinks();
syncAuthenticatedHeader();
registerWebMCPTools();
updateConnectionStatus();
announceRoute(location.hash || "#discover");

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

window.addEventListener("hashchange", () => {
  syncRoleNavigation();
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
