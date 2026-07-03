const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const files = [
  "html/assets/app.js",
  "html/assets/layout.js",
  "html/assets/app-data.js",
  "html/assets/app-data.json"
];

const banned = [
  /\bdemo\b/i,
  /\bmock\b/i,
  /\bMVP\b/,
  /\bICP\b/,
  /\bsample\b/i,
  /\bgo-live\b/i,
  /\bbackend\b/i,
  /\bstakeholder\b/i,
  /tenant_demo/i,
  /Business model/i,
  /API partner/i,
  /Static mock/i,
  /Backend enforcement/i,
  /loading\/error/i,
  /Developer Sandbox/i,
  /\bTEST\b/
];

const allowed = [];

const findings = [];
for (const file of files) {
  const fullPath = path.join(root, file);
  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (allowed.some(pattern => pattern.test(line))) return;
    const match = banned.find(pattern => pattern.test(line));
    if (match) findings.push(`${file}:${index + 1}: ${line.trim()}`);
  });
}

if (findings.length) {
  console.error("Found demo/internal UI copy:");
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("PASS no demo/internal UI copy in rendered assets");
