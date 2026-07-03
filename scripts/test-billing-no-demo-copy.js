const fs = require("node:fs");
const path = require("node:path");

const appPath = path.join(__dirname, "..", "html", "assets", "app.js");
const source = fs.readFileSync(appPath, "utf8");
const billingBlock = source.match(/function renderBilling\(\)\{[\s\S]*?\n}\n\nfunction renderSettings/)?.[0] || "";
const billingGuideBlock = source.match(/billing:\{[\s\S]*?\n  \},\n  settings:/)?.[0] || "";
const billingSurface = `${billingGuideBlock}\n${billingBlock}`;

function assert(condition, message){
  if(!condition){
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function escapeRegex(value){
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

[
  "Business Model Decision",
  "ICP Packaging",
  "Best initial ICP",
  "MVP",
  "demo",
  "Example CPA package",
  "skeleton",
  "API Partner",
  "Future",
  "Partner model",
  "backend",
  "Production Billing Rules"
].forEach(term=>{
  assert(!new RegExp(escapeRegex(term), "i").test(billingSurface), `Billing should not include demo/internal copy: ${term}`);
});

[
  /Loading\s+State\s+Pattern/i
].forEach(pattern=>{
  assert(!pattern.test(billingSurface), `Billing should not include demo/internal copy matching ${pattern}`);
});

assert(billingBlock, "renderBilling block should be discoverable");
assert(billingGuideBlock, "billing page guide should be discoverable");
assert(/Plan Summary/.test(billingBlock), "Billing should show a customer-facing plan summary");
assert(/Billing Controls/.test(billingBlock), "Billing should show customer-facing billing controls");
assert(/Plans/.test(billingBlock), "Billing should keep plan table");
assert(/Invoices & Approvals/.test(billingBlock), "Billing should keep invoices table");
assert(/download invoices/i.test(billingGuideBlock), "Billing guide should direct users to practical invoice actions");
console.log("PASS billing removes demo/internal copy");
