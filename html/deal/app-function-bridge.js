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
    inventory: 12,
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
  url.searchParams.set("source", trafficSource || incoming.get("source") || "nexora-deals");
  ["campaign_id", "promotion_id", "oneqr_host", "ref"].forEach((key) => {
    if (incoming.get(key)) url.searchParams.set(key, incoming.get(key));
  });
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  url.searchParams.set("return_to", `${location.origin}${location.pathname}${location.search}${location.hash}`);
  return url.toString();
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
  if (heroKicker) heroKicker.textContent = `NAIL DEALS · ${area.toLocaleUpperCase("vi")}`;
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
  if (requestedFunction === "dwallet" || requestedFunction === "wallet") incomingFunctionRoute = "#coupon-wallet";
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

function dealTemplate(deal, index) {
  const saved = savedDeals.has(deal.id);
  const imageStyle = deal.image ? ` style="background-image: linear-gradient(180deg, rgba(15,22,56,.05), rgba(15,22,56,.46)), url('${escapeHTML(deal.image)}')"` : "";
  return `
    <article class="deal-card" data-id="${escapeHTML(deal.id)}" data-category="${escapeHTML(deal.category)}">
      <div class="deal-visual ${deal.image ? "has-image" : "theme-" + ((index % 5) + 1)}"${imageStyle}>
        <span class="deal-badge">${escapeHTML(deal.badge)}</span>
        ${deal.verified ? '<span class="verified-badge">✓ VERIFIED</span>' : ""}
        <button class="save-button ${saved ? "saved" : ""}" type="button" data-save="${escapeHTML(deal.id)}" aria-label="${saved ? "Bỏ lưu" : "Lưu"} ${escapeHTML(deal.title)}">${saved ? "♥" : "♡"}</button>
      </div>
      <div class="deal-body">
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
          <button class="deal-open" type="button" data-open="${escapeHTML(deal.id)}">Xem deal →</button>
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
  if (sortSelect.value === "ending") visibleDeals.sort((a, b) => a.inventory - b.inventory);
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
let couponView = "explore";
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

function couponPin(code) {
  const windowId = Math.floor(Date.now() / 30000);
  let value = 17;
  for (const character of `${code}:${windowId}`) value = ((value * 131) + character.charCodeAt(0)) | 0;
  return String(Math.abs(value) % 1000000).padStart(6, "0");
}

function couponQrPattern(seed) {
  let value = [...seed].reduce((sum, character) => (sum * 31) + character.charCodeAt(0), 7) & 0x7fffffff;
  return Array.from({ length: 121 }, (_, index) => {
    const row = Math.floor(index / 11);
    const column = index % 11;
    const finder = (row < 3 && column < 3) || (row < 3 && column > 7) || (row > 7 && column < 3);
    value = (value * 1103515245 + 12345) & 0x7fffffff;
    return `<i class="${finder || ((value >> 16) & 1) ? "on" : ""}"></i>`;
  }).join("");
}

function updateCouponPin() {
  const pin = document.querySelector("[data-wallet-pin]");
  if (!pin) return;
  pin.textContent = couponPin(pin.dataset.walletPin);
  const progress = document.querySelector("[data-pin-progress]");
  if (progress) progress.style.width = `${((30 - (Math.floor(Date.now() / 1000) % 30)) / 30) * 100}%`;
}

function renderCouponWallet() {
  const container = document.querySelector("#couponWalletContent");
  if (!container) return;
  const claimed = Object.values(couponClaims)
    .filter((claim) => claim.type === "catalog" && couponCatalog[claim.couponId])
    .map((claim) => ({ ...claim, ...couponCatalog[claim.couponId] }));
  if (!claimed.length) {
    container.innerHTML = `<div class="coupon-wallet-empty"><span>▣</span><strong>Chưa có coupon đã giữ</strong><p>Chọn Lấy coupon, nhập SĐT và hệ thống sẽ gửi SMS xác nhận.</p><button type="button" data-coupon-view="explore">Khám phá coupon →</button></div>`;
    return;
  }
  const coupon = claimed[0];
  container.innerHTML = `<article class="coupon-wallet-pass"><div class="coupon-pass-qr" aria-label="QR coupon dùng khi không check-in bằng số điện thoại">${couponQrPattern(coupon.claimId)}</div><div class="coupon-pass-main"><span>ĐÃ GIỮ QUA SĐT · NEXORA VERIFIED</span><strong>${escapeHTML(coupon.value)} · ${escapeHTML(coupon.title)}</strong><p>${escapeHTML(coupon.business)} · ${escapeHTML(coupon.phoneMasked)} · giữ đến ${escapeHTML(formatHoldDate(coupon.holdUntil))}</p><div class="coupon-pass-code"><b>${escapeHTML(coupon.claimId)}</b><span>PIN động</span><strong data-wallet-pin="${escapeHTML(coupon.claimId)}">${couponPin(coupon.claimId)}</strong></div><div class="coupon-pin-track"><i data-pin-progress></i></div><small>Check-in bằng SĐT là luồng chính. QR + PIN đổi mỗi 30 giây chỉ dùng khi khách không muốn đọc SĐT tại quầy.</small></div></article><aside class="coupon-wallet-actions"><strong>Xác nhận &amp; hỗ trợ</strong><button type="button" data-wallet-action="sms">Gửi lại SMS</button><button type="button" data-wallet-action="terms">Xem điều kiện</button><button type="button" data-wallet-action="share">Chia sẻ coupon</button><p>${claimed.length} coupon đã giữ · POS sẽ kiểm tra điều kiện và giới hạn theo SĐT.</p></aside>`;
  updateCouponPin();
}

function openCouponView(view = "explore") {
  couponView = ["explore", "wallet"].includes(view) ? view : "explore";
  document.querySelectorAll("[data-coupon-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.couponPanel !== couponView;
  });
  document.querySelectorAll(".coupon-mode-tabs [data-coupon-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.couponView === couponView);
    button.setAttribute("aria-selected", String(button.dataset.couponView === couponView));
  });
  if (couponView === "wallet") renderCouponWallet();
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
  renderCouponWallet();
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
  renderCouponWallet();
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
  document.querySelectorAll(".desktop-nav a, .mobile-nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === hash);
  });
}

function openDeal(id, source = null) {
  const deal = getDeal(id);
  if (!deal) return;
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
  document.querySelector("#detailInventory").textContent = deal.inventoryLabel || `${deal.inventory} coupon`;
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

  const existingClaim = couponClaims[couponClaimKey("deal", deal.id)];
  const couponResult = document.querySelector("#couponResult");
  couponResult.hidden = !existingClaim;
  document.querySelector("#couponCode").textContent = existingClaim?.phoneMasked || "";
  document.querySelector("#claimDealButton").textContent = existingClaim ? "Đã giữ coupon" : "Lấy coupon bằng SĐT";
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
  updateCampaignEconomics(formData);
  const channels = [
    formData.get("crmSms") === "on" && "CRM/SMS",
    formData.get("nearby") === "on" && "Nearby",
    formData.get("discover") === "on" && "Discover",
    formData.get("searchDeals") === "on" && "Search",
    formData.get("oneqrRevenue") === "on" && "OneQR earnings",
  ].filter(Boolean);
  document.querySelector("#merchantPreview > div").innerHTML = `
    <small>Nexora Touch Nail Spa</small>
    <strong>${escapeHTML(formData.get("title") || "Untitled promotion")}</strong>
    <p><b>$${escapeHTML(formData.get("price") || "—")}</b> <del>$${escapeHTML(formData.get("original") || "—")}</del> · ${escapeHTML(formData.get("inventory") || "0")} coupons</p>
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
  const inventory = Number(formData.get("inventory")) || 0;
  const lowBookings = Math.max(1, Math.round(inventory * .6));
  const highBookings = Math.max(lowBookings, Math.round(inventory * .85));
  const forecastGross = highBookings * (price + upsell);

  document.querySelector("#customerPays").textContent = currency(price);
  document.querySelector("#merchantReceives").textContent = currency(merchantReceives);
  document.querySelector("#contributionMargin").textContent = currency(contribution);
  document.querySelector("#marginPercent").textContent = `${Math.round(margin)}%`;
  document.querySelector("#entryTierPrice").textContent = currency(price).replace(".00", "");
  document.querySelector("#upgradeTierPrice").textContent = currency(price + 14).replace(".00", "");
  document.querySelector("#premiumTierPrice").textContent = currency(price + 34).replace(".00", "");
  document.querySelector("#forecastReach").textContent = `${(inventory * 80 / 1000).toFixed(1)}K–${(inventory * 105 / 1000).toFixed(1)}K`;
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
    discount: `SAVE $${original - price}`,
    distance: 0.8,
    rating: 4.9,
    reviews: 186,
    deadline: `Đồng bộ vừa xong · ${formData.get("inventory")} suất`,
    badge: oneqrEnabled ? "SPONSORED · ONEQR" : "SYNCED FROM TOUCH",
    verified: true,
    inventory: Number(formData.get("inventory")),
    instant: formData.get("booking") === "on",
    description: `Promotion từ Nexora Touch, phân phối tới ${placements.join(", ")}${crmEnabled ? " và CRM/SMS khách đã opt-in" : ""}.`,
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
    perCustomer: formData.get("perCustomer"),
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
  showToast(`Đã publish: ${crmEnabled ? "CRM/SMS + " : ""}${placements.join(" + ")}${oneqrEnabled ? " + OneQR earnings" : ""}.`);
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

function handleRoute(hash) {
  const route = hash || "#discover";
  if (route === "#openings") {
    state.savedOnly = false;
    setActiveNavigation("#coupons");
    document.querySelector("#openings").scrollIntoView({ behavior: "smooth", block: "start" });
    emitNexoraFunctionEvent("open_function", { function: "openings" });
    return;
  }
  if (route === "#coupon-wallet") {
    state.savedOnly = false;
    setActiveNavigation("#coupons");
    renderCoupons();
    openCouponView("wallet");
    document.querySelector("#coupons").scrollIntoView({ behavior: "smooth", block: "start" });
    emitNexoraFunctionEvent("open_function", { function: "coupon-wallet" });
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
    openCouponView("explore");
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
  const viewButton = event.target.closest("[data-coupon-view]");
  if (viewButton) openCouponView(viewButton.dataset.couponView);
  const walletButton = event.target.closest("[data-open-coupon-wallet]");
  if (walletButton) {
    closeModal(couponClaimDialog);
    openCouponView("wallet");
    document.querySelector("#coupons").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const walletAction = event.target.closest("[data-wallet-action]");
  if (!walletAction) return;
  const labels = { sms: "SMS xác nhận", terms: "Điều kiện coupon", share: "Liên kết chia sẻ" };
  showToast(`${labels[walletAction.dataset.walletAction]} sẽ lấy từ bản ghi coupon thật khi kết nối backend.`);
});
document.querySelector("[data-last-reset]")?.addEventListener("click", () => {
  lastMinuteWindow = "all";
  lastMinuteIndustry = "all";
  applyLastMinuteFilters();
});
tickLastMinuteCountdowns();
window.setInterval(tickLastMinuteCountdowns, 1000);
renderCoupons();
renderCouponWallet();
renderOpeningHolds();
window.setInterval(updateCouponPin, 1000);

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
    openDeal("nx-gel-combo", trafficSource);
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

document.querySelectorAll('.desktop-nav a, .mobile-nav a:not([href="#profile"])').forEach((link) => {
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
registerWebMCPTools();

if (incomingFunctionRoute) {
  const bridgedUrl = new URL(location.href);
  bridgedUrl.hash = incomingFunctionRoute;
  history.replaceState(null, "", `${bridgedUrl.pathname}${bridgedUrl.search}${bridgedUrl.hash}`);
  handleRoute(incomingFunctionRoute);
} else if (location.hash && location.hash !== "#discover") {
  handleRoute(location.hash);
}
