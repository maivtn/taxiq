const fs = require("node:fs");
const path = require("node:path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const pagePath = path.join(__dirname, "../html/pages/mobile-two-account-tailwind-lucide.html");
const pageDir = path.dirname(pagePath);
const html = fs.readFileSync(pagePath, "utf8");
const inlineScripts = Array.from(html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)).map((match) => match[1]);

assert(inlineScripts.length >= 1, "Mobile two-account page should include inline scripts");

inlineScripts.forEach((script, index) => {
  try {
    new Function(script);
  } catch (error) {
    throw new Error(`Inline script ${index} should parse: ${error.message}`);
  }
});

assert(
  /src="https:\/\/unpkg\.com\/lucide@1\.23\.0\/dist\/umd\/lucide\.min\.js"/.test(html),
  "Lucide should be pinned to a concrete UMD build"
);
assert(!/lucide@latest/.test(html), "Lucide should not use the moving latest tag");
assert(/function renderLucideIcons\(\)/.test(html), "Page should define a guarded Lucide render helper");
assert(!/(?<!window\.)\blucide\.createIcons/.test(html), "Page should not call lucide.createIcons directly without a window guard");
assert(/window\.lucide && typeof window\.lucide\.createIcons === 'function'/.test(html), "Lucide render helper should guard missing CDN globals");

assert(
  !/document\.querySelector\('\[data-salon-modal-close\]'\)\.addEventListener/.test(html),
  "Salon modal close handler should guard missing modal nodes"
);
assert(
  !/document\.querySelector\('\[data-salon-modal-print\]'\)\.addEventListener/.test(html),
  "Salon modal print handler should guard missing modal nodes"
);
assert(!/salonQrModal\.addEventListener/.test(html), "Salon QR modal overlay handler should guard missing modal nodes");
assert(/if \(!myQrCard \|\| !salonQrList\) return;/.test(html), "My QR tab handler should guard missing tab panels");
assert(/if \(!salonQrModal\) return;/.test(html), "Salon QR button handler should guard missing modal");

const localAssetRefs = Array.from(html.matchAll(/(?:src|data-salon-logo)="(\.?\/?assets\/[^"]+)"/g)).map((match) => match[1]);
localAssetRefs.forEach((assetRef) => {
  assert(fs.existsSync(path.join(pageDir, assetRef)), `Local page asset should exist: ${assetRef}`);
});

assert(!/kayla-bui-profile\.jpg|jessica-m-review\.jpg|emily-t-review\.jpg/.test(html), "Broken local profile/review images should not be requested");
assert(!/data-avatar-image/.test(html), "Unused avatar image fallback hooks should be removed");

console.log("mobile two-account tailwind lucide regression passed");
