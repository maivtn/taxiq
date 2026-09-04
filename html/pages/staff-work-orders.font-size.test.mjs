import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const PAGE_URL = new URL('./staff-work-orders.html', import.meta.url);
const NEXORA_SHELL_URL = new URL('../assets/nexora-shell.css', import.meta.url);
const STAFF_SHELL_URL = new URL('../assets/staff-shell.css', import.meta.url);
const PAGE_HTML = readFileSync(PAGE_URL, 'utf8')
  .replace('<link rel="stylesheet" href="../assets/nexora-shell.css">', `<style>${readFileSync(NEXORA_SHELL_URL, 'utf8')}</style>`)
  .replace('<link rel="stylesheet" href="../assets/staff-shell.css">', `<style>${readFileSync(STAFF_SHELL_URL, 'utf8')}</style>`);

function collectSmallFontSizes(rules, violations = []) {
  for (const rule of rules) {
    if (rule.cssRules) {
      collectSmallFontSizes(rule.cssRules, violations);
      continue;
    }

    const fontSize = rule.style?.getPropertyValue('font-size');
    const pixelValue = fontSize?.match(/^(\d+(?:\.\d+)?)px$/);
    if (pixelValue && Number(pixelValue[1]) < 11) {
      violations.push(`${rule.selectorText}: ${fontSize}`);
    }
  }

  return violations;
}

test('page styles never set readable text below 11px', () => {
  const dom = new JSDOM(PAGE_HTML);
  const violations = collectSmallFontSizes(dom.window.document.styleSheets[0].cssRules);

  assert.deepEqual(violations, []);

  dom.window.close();
});

test('staff profile identifier stays at least 11px after shared shell styles load', () => {
  const dom = new JSDOM(PAGE_HTML);
  const profileId = dom.window.document.createElement('div');
  profileId.className = 'staff-profile-id';
  profileId.textContent = 'Staff ID: NAIE5LMVX';
  dom.window.document.body.append(profileId);

  assert.equal(dom.window.getComputedStyle(profileId).fontSize, '11px');

  dom.window.close();
});
