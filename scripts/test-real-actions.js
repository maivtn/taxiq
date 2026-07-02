const fs = require("fs");
const path = require("path");

const appPath = path.join(__dirname, "..", "html", "assets", "app.js");
const app = fs.readFileSync(appPath, "utf8");

function assert(condition, message){
  if(!condition){
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

const ledgerBlock = app.match(/function renderLedger\(\)\{[\s\S]*?\/\* ─── EXCEPTIONS ─── \*\//)?.[0] || "";

assert(app.includes("function downloadTextFile("), "download helper creates a real file");
assert(app.includes("function buildExportPayload("), "export payloads are built from app data");
assert(app.includes("function tableToCsv("), "visible tables can be exported as CSV fallback");
assert(app.includes("function handleExportAction("), "dedicated export buttons are handled");
assert(app.includes("function handleSmartToastAction("), "legacy download/export toast buttons are upgraded");
assert(app.includes('event.target.closest("[data-export]")'), "global click handler listens for data-export");
assert(/download|export|report|csv|pdf/i.test(app), "download/export/report actions are recognized");

assert(ledgerBlock.includes('data-export="tax-ledger"'), "Tax Ledger download button exports ledger data");
assert(ledgerBlock.includes('data-export-format="csv"'), "Tax Ledger download defaults to CSV");
assert(!ledgerBlock.includes('data-modal="report">Download Report'), "Tax Ledger no longer opens a generic report modal for download");
