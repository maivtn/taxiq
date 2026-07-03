const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "html", "assets", "app.js"), "utf8");

function assert(condition, message){
  if(!condition){
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

const settingsBlock = app.match(/function renderSettings\(\)\{[\s\S]*?\/\* ─── NOTIFICATIONS ─── \*\//)?.[0] || "";

assert(settingsBlock, "renderSettings block should be discoverable");
assert(!settingsBlock.includes('["api","API Keys"]'), "Settings tabs should not include API Keys");
assert(!settingsBlock.includes('data-tab-panel="api"'), "Settings should not render an API Keys tab panel");
assert(!settingsBlock.includes('panel("API Keys"'), "Settings should not render the API Keys panel");
assert(!settingsBlock.includes('data-modal="create-api-key"'), "Settings should not expose a Create API Key button");
assert(!settingsBlock.includes("data.apiKeys"), "Settings should not read API key data");
assert(!app.includes('"create-api-key"'), "Create API Key modal should be removed from the app");
assert(!app.includes("data-rotate-key"), "API key rotate action should be removed from the app");
assert(!app.includes("data-revoke-key"), "API key revoke action should be removed from the app");
