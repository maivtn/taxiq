const fs = require("node:fs");
const path = require("node:path");

const appPath = path.join(__dirname, "..", "html", "assets", "app.js");
const dataPath = path.join(__dirname, "..", "html", "assets", "mock-data.json");
const source = fs.readFileSync(appPath, "utf8");
const mockData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const billingBlock = source.match(/function renderBilling\(\)\{[\s\S]*?\n}\n\nfunction renderSettings/)?.[0] || "";
const billingGuideBlock = source.match(/billing:\{[\s\S]*?\n  \},\n  settings:/)?.[0] || "";
const billingModalBlock = source.match(/\/\* BILLING MODALS \*\/[\s\S]*?\n};\n\nfunction openModal/)?.[0] || "";
const billingData = JSON.stringify({
  plans: mockData.plans,
  invoices: mockData.invoices
});
const billingSurface = `${billingGuideBlock}\n${billingBlock}\n${billingModalBlock}\n${billingData}`;

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
  "API access",
  "API Partner",
  "Architecture Impact",
  "Business Model",
  "4242",
  "Embedded Tax IQ",
  "Future",
  "Jul 1, 2026",
  "marketplace",
  "Partner model",
  "Partner API",
  "backend",
  "Production Billing Rules"
].forEach(term=>{
  assert(!new RegExp(escapeRegex(term), "i").test(billingSurface), `Billing should not include demo/internal copy: ${term}`);
});

[
  /Loading\s+State\s+Pattern/i,
  /webhooks?/i
].forEach(pattern=>{
  assert(!pattern.test(billingSurface), `Billing should not include demo/internal copy matching ${pattern}`);
});

assert(billingBlock, "renderBilling block should be discoverable");
assert(billingGuideBlock, "billing page guide should be discoverable");
assert(billingModalBlock, "billing modal block should be discoverable");
assert(/Plan Summary/.test(billingBlock), "Billing should show a customer-facing plan summary");
assert(/Billing Controls/.test(billingBlock), "Billing should show customer-facing billing controls");
assert(/Plans/.test(billingBlock), "Billing should keep plan table");
assert(/Invoices & Approvals/.test(billingBlock), "Billing should keep invoices table");
assert(/Plan Change Review/.test(billingModalBlock), "Billing plan modal should be a real plan change workflow");
assert(/download invoices/i.test(billingGuideBlock), "Billing guide should direct users to practical invoice actions");
console.log("PASS billing removes demo/internal copy");
