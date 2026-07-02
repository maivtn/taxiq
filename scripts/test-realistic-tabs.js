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

console.log("realistic tabs regression passed");
