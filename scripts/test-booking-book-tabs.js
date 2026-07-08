const fs = require("node:fs");
const path = require("node:path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const html = fs.readFileSync(path.join(__dirname, "../html/pages/booking-book-phase-1.html"), "utf8");

const tabTargets = Array.from(html.matchAll(/data-tab-target="([^"]+)"/g)).map((match) => match[1]);
const tabPanels = Array.from(html.matchAll(/data-tab-panel="([^"]+)"/g)).map((match) => match[1]);
const sidebarNav = html.match(/<nav class="sidebar-nav"[\s\S]*?<\/nav>/)?.[0] || "";
const sidebarNavItems = sidebarNav.match(/<button class="nav-item/g) || [];
const sidebarLucideIcons = Array.from(sidebarNav.matchAll(/<i class="lucide-menu-icon" data-lucide="([^"]+)" aria-hidden="true"><\/i>/g)).map((match) => match[1]);
const expectedSidebarIcons = [
  "home",
  "layout-dashboard",
  "users-round",
  "hand-coins",
  "star",
  "credit-card",
  "qr-code",
  "calendar-days",
  "chart-no-axes-combined",
  "settings",
  "circle-question-mark"
];
const bookingTab = html.match(/<button[^>]*data-tab-target="booking"[^>]*>/)?.[0] || "";
const bookingPanel = html.match(/<section[^>]*id="panel-booking"[^>]*>/)?.[0] || "";
const todayPanel = html.match(/<div class="booking-sub-panel is-active" id="booking-subpanel-today"[\s\S]*?<div class="booking-grid">/)?.[0] || "";
const teamPanel = html.match(/<div class="booking-sub-panel" id="booking-subpanel-team"[\s\S]*?<\/section>\s*<section class="tab-panel" id="panel-voice"/)?.[0] || "";
const settingsStart = html.indexOf('<section class="tab-panel" id="panel-settings"');
const settingsEnd = html.indexOf("<script>", settingsStart);
const settingsPanel = settingsStart >= 0 && settingsEnd > settingsStart ? html.slice(settingsStart, settingsEnd) : "";
const settingsTwoGridStart = settingsPanel.indexOf('<div class="settings-two-grid">');
const settingsSaveBarStart = settingsPanel.indexOf('<div class="settings-save-bar">', settingsTwoGridStart);
const settingsTwoGrid = settingsTwoGridStart >= 0 && settingsSaveBarStart > settingsTwoGridStart
  ? settingsPanel.slice(settingsTwoGridStart, settingsSaveBarStart)
  : "";
const techGridCss = html.match(/\.tech-grid\s*\{[\s\S]*?\n    \}/)?.[0] || "";
const techCardCss = html.match(/\.tech-card\s*\{[\s\S]*?\n    \}/)?.[0] || "";
const mobileMediaStart = html.lastIndexOf("@media (max-width: 767px)");
const mobileMediaCss = mobileMediaStart >= 0 ? html.slice(mobileMediaStart) : "";
const mobileTechCardCss = mobileMediaCss.match(/\.tech-card\s*\{[\s\S]*?\n      \}/)?.[0] || "";
const desktopMediaStart = html.indexOf("@media (min-width: 1024px)");
const desktopMediaEnd = html.indexOf("@media (max-width: 767px)", desktopMediaStart);
const desktopMediaCss = desktopMediaStart >= 0 && desktopMediaEnd > desktopMediaStart ? html.slice(desktopMediaStart, desktopMediaEnd) : "";
const desktopOverviewKpisCss = desktopMediaCss.match(/\.overview-kpis\s*\{[\s\S]*?\n      \}/)?.[0] || "";
const desktopBookingGridCss = desktopMediaCss.match(/\.booking-grid\s*\{[\s\S]*?\n      \}/)?.[0] || "";
const bookingSubPanelOverviewKpisCss = mobileMediaCss.match(/\.booking-sub-panel \.overview-kpis\s*\{[\s\S]*?\n      \}/)?.[0] || "";

assert(!tabTargets.includes("overview"), "Overview should not be available as a main tab");
assert(!tabTargets.includes("voice"), "AI Voice should not be available as a main tab");
assert(!tabPanels.includes("overview"), "Overview should not be exposed as a main tab panel");
assert(!tabPanels.includes("voice"), "AI Voice should not be exposed as a main tab panel");
assert(tabTargets.join(",") === "booking,plans,settings", "Booking Book should keep booking, plans, and settings tabs in order");
assert(sidebarNavItems.length > 0, "Sidebar should render menu items");
assert(sidebarLucideIcons.length === sidebarNavItems.length, "Every sidebar menu item should have a Lucide library icon");
assert(sidebarLucideIcons.join(",") === expectedSidebarIcons.join(","), "Sidebar should use the expected Lucide icons in order");
assert(!/<img class="sidebar-icon"/.test(sidebarNav), "Sidebar menu should not use broken image icons");
assert(!/public\/assets\/menu/.test(sidebarNav), "Sidebar menu should not depend on missing menu image assets");
assert(!/<svg class="lucide-menu-icon"/.test(sidebarNav), "Sidebar menu should not hard-code Lucide SVG markup");
assert(/src="https:\/\/unpkg\.com\/lucide@1\.23\.0\/dist\/umd\/lucide\.min\.js"/.test(html), "Page should load the pinned Lucide library");
assert(/window\.lucide[\s\S]*window\.lucide\.createIcons/.test(html), "Page should initialize Lucide icons after loading the library");
assert(/var DEFAULT_MAIN_TAB = 'booking';/.test(html), "Booking Book should default to the booking tab");
assert(/aria-selected="true"/.test(bookingTab), "Booking tab should be selected by default");
assert(/class="tab-panel is-active"/.test(bookingPanel), "Booking panel should be active by default");
assert(/grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/.test(html), "Mobile tabs should use a three-column grid");
assert(!/Tracking Rate/.test(todayPanel), "Lịch hôm nay should not show the Tracking Rate KPI card");
assert(!/4 sources/.test(todayPanel), "Lịch hôm nay should not show the Tracking Rate source badge");
assert((todayPanel.match(/class="overview-card kpi-card"/g) || []).length === 3, "Lịch hôm nay should render three KPI cards");
assert(/grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/.test(desktopOverviewKpisCss), "Desktop overview KPI grid should use three columns");
assert(/grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/.test(bookingSubPanelOverviewKpisCss), "Compact booking KPI grid should use three columns");
assert(!/booking-side-stack/.test(html), "Booking Book should not render or style the booking side stack");
assert(!/Khách Book Online/.test(todayPanel), "Lịch hôm nay should not show the online booking side card");
assert(!/data-online-/.test(todayPanel), "Lịch hôm nay should not keep hidden online booking side-stack hooks");
assert(!/data-automation-timeline/.test(todayPanel), "Lịch hôm nay should not show the automation timeline side card");
assert(!/reserveOnlineBooking|showAutomation|data-online-book-button/.test(html), "Booking side-stack JavaScript should be removed with the side stack");
assert(/grid-template-columns:\s*1fr;/.test(desktopBookingGridCss), "Desktop booking grid should be one column after removing the side stack");
assert(!/SMS Thợ Nhận Được/.test(teamPanel), "Đội thợ should not show the received SMS preview card");
assert(!/\bZelle\b/i.test(teamPanel), "Đội thợ should not show Zelle fields or rows");
assert(!/\bVenmo\b/i.test(teamPanel), "Đội thợ should not show Venmo fields or rows");
assert(!/tech-payment/.test(teamPanel), "Đội thợ should not render payment method blocks");
assert(!/Tip tháng này/.test(html), "Đội thợ should not render or create the Tip tháng này stat");
assert(!/Magic Fill - Tự Động Lấy Thông Tin/.test(settingsPanel), "Cấu hình tiệm should not show Magic Fill");
assert(!/data-settings-card="magic"/.test(settingsPanel), "Cấu hình tiệm should not render the Magic Fill card");
assert(!/Khuyến Mãi & Quà Tặng/.test(settingsPanel), "Cấu hình tiệm should not show the promotion and gift section");
assert(!/data-settings-action="new-offer"/.test(settingsPanel), "Cấu hình tiệm should not render the new offer action");
assert(!/Automation Timing/.test(settingsPanel), "Cấu hình tiệm should not show Automation Timing");
assert(!/settings-automation-card/.test(settingsPanel), "Cấu hình tiệm should not render the automation timing card");
assert(/settings-two-grid/.test(settingsTwoGrid), "Cấu hình tiệm should render a two-column settings grid");
assert(/Dịch Vụ & Giá[\s\S]*AI Voice/.test(settingsTwoGrid), "Desktop should place Dịch Vụ & Giá and AI Voice in the same two-column row");
assert(/display:\s*flex;/.test(techGridCss), "Đội thợ tech grid should use flex layout");
assert(/flex-wrap:\s*wrap;/.test(techGridCss), "Đội thợ tech cards should wrap onto new rows");
assert(/width:\s*280px;/.test(techCardCss), "Đội thợ tech cards should be 280px wide");
assert(/flex:\s*0 1 280px;/.test(techCardCss), "Đội thợ tech cards should wrap from a 280px basis without growing");
assert(/max-width:\s*100%;/.test(techCardCss), "Đội thợ tech cards should not overflow narrow screens");
assert(/width:\s*calc\(50% - 6px\);/.test(mobileTechCardCss), "Mobile Đội thợ tech cards should fit two columns with the grid gap");
assert(/flex:\s*0 1 calc\(50% - 6px\);/.test(mobileTechCardCss), "Mobile Đội thợ tech cards should wrap from a two-column basis");

console.log("booking book tabs regression passed");
