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

assert(!tabTargets.includes("overview"), "Overview should not be available as a main tab");
assert(!tabTargets.includes("voice"), "AI Voice should not be available as a main tab");
assert(!tabPanels.includes("overview"), "Overview should not be exposed as a main tab panel");
assert(!tabPanels.includes("voice"), "AI Voice should not be exposed as a main tab panel");
assert(tabTargets.join(",") === "booking,plans,settings", "Booking Book should keep booking, plans, and settings tabs in order");
assert(/var DEFAULT_MAIN_TAB = 'booking';/.test(html), "Booking Book should default to the booking tab");
assert(/aria-selected="true"/.test(bookingTab), "Booking tab should be selected by default");
assert(/class="tab-panel is-active"/.test(bookingPanel), "Booking panel should be active by default");
assert(/grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/.test(html), "Mobile tabs should use a three-column grid");
assert(!/Tracking Rate/.test(todayPanel), "Lịch hôm nay should not show the Tracking Rate KPI card");
assert(!/4 sources/.test(todayPanel), "Lịch hôm nay should not show the Tracking Rate source badge");
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

console.log("booking book tabs regression passed");
