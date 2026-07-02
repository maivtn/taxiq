const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "../html");
const vietnamesePattern = /[À-ỹ]/u;
const allowedExtensions = new Set([".html", ".js", ".json"]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
}

const offenders = [];

for (const file of walk(root)) {
  if (!allowedExtensions.has(path.extname(file))) continue;
  const relative = path.relative(path.join(__dirname, ".."), file);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    if (vietnamesePattern.test(line)) {
      offenders.push(`${relative}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (offenders.length) {
  console.error("Expected US English UI copy, found Vietnamese text:");
  console.error(offenders.slice(0, 80).join("\n"));
  if (offenders.length > 80) {
    console.error(`...and ${offenders.length - 80} more`);
  }
  process.exit(1);
}

console.log("US English copy scan passed");
