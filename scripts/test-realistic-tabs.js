const fs = require("node:fs");
const path = require("node:path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const app = fs.readFileSync(path.join(__dirname, "../html/assets/app.js"), "utf8");

assert(/function activateSourceTab\(/.test(app), "tab clicks should use a shared activation helper");
assert(/function initSourceTabs\(/.test(app), "tab panels should initialize after every render");
assert(/role="tabpanel"/.test(app), "tab panels should expose tabpanel semantics");
assert(/history\.replaceState/.test(app), "panel tabs should be deep-linkable through the URL hash");

assert(/function applyReviewFilter\(/.test(app), "review filter tabs should update real screen state");
assert(/data-review-source=/.test(app), "review rows should carry a source for filtering");
assert(/data-review-count/.test(app), "review tabs should show filtered counts");
assert(/data-review-empty/.test(app), "review filtering should have an empty state");

assert(/function updateCheckoutSummary\(/.test(app), "checkout tip tabs should recalculate the receipt summary");
assert(/data-tip-value=/.test(app), "tip chips should expose numeric tip values");
assert(/data-checkout-total/.test(app), "checkout total should be addressable for live updates");

const posBlock = app.match(/function renderPos\(\)\{[\s\S]*?\/\* ─── CHECKOUT ─── \*\//)?.[0] || "";
const posTabsFragment = posBlock.match(/<div class="pos-tabs"[\s\S]*?<\/div>/)?.[0] || "";
assert(posBlock, "POS renderer should be discoverable");
assert(/class="pos-tabs"[\s\S]*role="tablist"/.test(posBlock), "POS tabs should use an accessible tablist");
assert(/const posTabs = \[/.test(posBlock), "POS tabs should be defined as a shared tab model");
assert((posBlock.match(/\["(?:checkin|turn-board|checkout)"/g) || []).length === 3, "POS should render three synchronized tab buttons");
assert(/class="tab-pill pos-tab/.test(posBlock), "POS tab buttons should share the pos-tab class");
assert(/data-tab="\$\{id\}"/.test(posBlock), "POS tab buttons should bind their id to data-tab");
assert(/\["checkin"/.test(posBlock), "POS Check-in tab should map to a real panel");
assert(/\["turn-board"/.test(posBlock), "POS Turn Board tab should map to a real panel");
assert(/\["checkout"/.test(posBlock), "POS Checkout tab should map to a real panel");
assert(/data-tab-panel="checkin"/.test(posBlock), "POS should render a Check-in panel");
assert(/data-tab-panel="turn-board"/.test(posBlock), "POS should render a Turn Board panel");
assert(/data-tab-panel="checkout"/.test(posBlock), "POS should render a Checkout panel");
assert(!/<span class="badge/.test(posTabsFragment), "POS tabs should not use passive badge spans");
assert(!/<a class="tab-pill/.test(posTabsFragment), "POS Checkout should work as a tab button before navigation");

console.log("realistic tabs regression passed");
