const fs = require("node:fs");
const path = require("node:path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const app = fs.readFileSync(path.join(__dirname, "../html/assets/app.js"), "utf8");

assert(/function getQuickPayState\(/.test(app), "Quick Pay should read workflow state from controls");
assert(/function validateQuickPayState\(/.test(app), "Quick Pay should validate amount, worker, contact, and memo before create");
assert(/function createQuickPayRecord\(/.test(app), "Quick Pay should create a structured payment record");
assert(/function persistQuickPayRecord\(/.test(app), "Quick Pay records should persist for the session");
assert(/function hydrateQuickPayRecords\(/.test(app), "Quick Pay records should hydrate into payout data");

assert(/data-pay-type=/.test(app), "payment type cards should expose data-pay-type");
assert(/data-tax-treatment=/.test(app), "payment type cards should expose tax treatment");
assert(/data-approval-limit=/.test(app), "payment type cards should expose approval limit");
assert(/data-worker-type=/.test(app), "worker cards should expose W2/1099 classification");
assert(/data-source-select/.test(app), "payment source select should be part of workflow state");
assert(/data-payment-date/.test(app), "payment date should be part of workflow state");
assert(/data-payment-memo/.test(app), "memo should be part of workflow state");
assert(/data-create-quick-pay/.test(app), "create payment button should have a dedicated action hook");

assert(/data-preview-tax-treatment/.test(app), "preview should show tax treatment");
assert(/data-preview-risk/.test(app), "preview should show approval/evidence risk");
assert(/data-preview-evidence/.test(app), "preview should show evidence status");
assert(/data-quick-pay-audit/.test(app), "Quick Pay should surface audit/ledger status");
assert(/const recentRows = \(data\.payouts \|\| \[\]\)/.test(app), "Quick Pay recent list should render from payout data");

console.log("quick pay workflow regression passed");
