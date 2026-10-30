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
const sortSelect = document.querySelector("#sortSelect");
const resultsTitle = document.querySelector("#resultsTitle");
const resultsKicker = document.querySelector("#resultsKicker");
const dealDialog = document.querySelector("#dealDialog");
const requestDialog = document.querySelector("#requestDialog");
const mapDialog = document.querySelector("#mapDialog");
const filterDialog = document.querySelector("#filterDialog");
const businessDialog = document.querySelector("#businessDialog");
const oneqrDialog = document.querySelector("#oneqrDialog");

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
    resultsKicker.textContent = `GẦN BẠN · TRONG ${state.maxDistance} MILES`;
    resultsTitle.textContent = `Deal nổi bật quanh ${document.querySelector("#locationInput").value || "bạn"}`;
  }

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
  document.querySelector("#bookDealLink").href = `https://nexoratouch.com/b/${encodeURIComponent(deal.bookingSlug || "bitcoin-nail-bar")}?deal=${encodeURIComponent(deal.id)}`;

  const existingCode = claimedDeals[deal.id];
  const couponResult = document.querySelector("#couponResult");
  couponResult.hidden = !existingCode;
  document.querySelector("#couponCode").textContent = existingCode || "";
  document.querySelector("#claimDealButton").textContent = existingCode ? "Đã nhận deal" : "Nhận deal";
  const attribution = document.querySelector("#oneqrAttribution");
  const purchaseButton = document.querySelector("#simulatePurchaseButton");
  attribution.hidden = source !== "oneqr";
  purchaseButton.disabled = sessionRevenueEvents.has(`purchase:${deal.id}`);
  purchaseButton.textContent = purchaseButton.disabled ? "Đã ghi nhận giao dịch demo" : "Mô phỏng mua dịch vụ · +$2.00 cho tiệm";
  updateSavedUI();
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
  if (!claimedDeals[activeDealId]) {
    claimedDeals[activeDealId] = makeCouponCode();
    localStorage.setItem("nexora-claimed-deals", JSON.stringify(claimedDeals));
    document.querySelector("#couponCode").textContent = claimedDeals[activeDealId];
    document.querySelector("#couponResult").hidden = false;
    document.querySelector("#claimDealButton").textContent = "Đã nhận deal";
    showToast(`Coupon đã sẵn sàng. Còn ${deal.inventory} suất tại ${deal.salon}.`);
  } else {
    showToast("Coupon này đã nằm trong ví deal của bạn.");
  }
}

function copyCoupon() {
  const code = document.querySelector("#couponCode").textContent;
  if (!code) return;
  navigator.clipboard?.writeText(code).then(
    () => showToast("Đã copy coupon code."),
    () => showToast(`Coupon code: ${code}`),
  );
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
  document.querySelectorAll(".category-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.category === "all"));
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
  showToast("Đã áp dụng bộ lọc gần bạn.");
}

function handleRoute(hash) {
  const route = hash || "#discover";
  if (route === "#last-minute") {
    state.savedOnly = false;
    setActiveNavigation(route);
    lastMinuteWindow = "all";
    lastMinuteIndustry = "all";
    applyLastMinuteFilters();
    document.querySelector("#last-minute").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (route === "#nearby") {
    setActiveNavigation(route);
    openMapDialog();
    return;
  }
  if (route === "#requests") {
    setActiveNavigation(route);
    openRequestDialog();
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
    return;
  }
  state.savedOnly = false;
  setActiveNavigation("#discover");
  renderDeals();
}

document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.savedOnly = false;
  renderDeals();
  document.querySelector(".results-heading").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-last-window]").forEach((button) => {
  button.addEventListener("click", () => filterLastMinute(button.dataset.lastWindow));
});
document.querySelectorAll("[data-last-industry]").forEach((button) => {
  button.addEventListener("click", () => filterLastMinuteIndustry(button.dataset.lastIndustry));
});
document.querySelector("[data-last-reset]")?.addEventListener("click", () => {
  lastMinuteWindow = "all";
  lastMinuteIndustry = "all";
  applyLastMinuteFilters();
});
tickLastMinuteCountdowns();
window.setInterval(tickLastMinuteCountdowns, 1000);

searchInput.addEventListener("input", renderDeals);
sortSelect.addEventListener("change", renderDeals);

document.querySelectorAll(".category-chip").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.category === "more") {
      document.querySelector(".industry-expansion").scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("Hair, spa, lashes và các ngành khác đã sẵn cấu trúc để mở sau nail.");
      return;
    }
    state.activeCategory = button.dataset.category;
    state.savedOnly = false;
    document.querySelectorAll(".category-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderDeals();
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
    openDeal(openButton.dataset.open);
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
    openDeal(id);
  }
});

document.querySelector(".featured-spotlight").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openDeal("nx-gel-combo");
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
document.querySelectorAll(".oneqr-launch").forEach((button) => button.addEventListener("click", openOneQR));
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
document.querySelector("#copyCouponButton").addEventListener("click", copyCoupon);
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

[dealDialog, requestDialog, mapDialog, filterDialog, businessDialog, oneqrDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeModal(dialog);
  });
});

document.querySelectorAll('.desktop-nav a, .mobile-nav a:not([href="#profile"])').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const hash = link.getAttribute("href");
    history.replaceState(null, "", hash);
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
      description: "Tìm deal dịch vụ đang hoạt động theo từ khóa, danh mục và bán kính.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Từ khóa dịch vụ hoặc salon." },
          category: { type: "string", enum: ["all", "manicure", "pedicure", "gel-x", "nail-art"] },
          maxDistance: { type: "number", minimum: 1, maximum: 25 },
        },
      },
      execute: async ({ query = "", category = "all", maxDistance = 5 } = {}) => {
        const normalized = query.toLocaleLowerCase("vi");
        return deals.filter((deal) => (
          (category === "all" || deal.category === category)
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
renderDeals();
updateMerchantPreview();
renderBusinessWorkspace();
registerWebMCPTools();

if (location.hash && location.hash !== "#discover") handleRoute(location.hash);
