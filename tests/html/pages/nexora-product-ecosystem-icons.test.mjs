import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const products = new URL('../../../html/pages/products/', import.meta.url);
const artwork = await readFile(new URL('../../assets/nexora-icons.js', products), 'utf8');
const landing = await readFile(new URL('landing.js', products), 'utf8');
const slugs = ['si-pos', 'one-qr', 'payments-payouts', 'ai-hub', 'reviews', 'gift-card-center', 'analytics', 'community', 'tax-iq', 'ai-voice-sms', 'ai-marketing', 'spin-wheel'];

async function open(slug) {
  const dom = new JSDOM(await readFile(new URL(`${slug}/index.html`, products), 'utf8'), {
    url: `https://example.test/html/pages/products/${slug}/index.html`,
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(dom.window.document, 'currentScript', {
    configurable: true,
    value: dom.window.document.querySelector('script[src*="nexora-icons.js"]')
  });
  dom.window.eval(artwork);
  Object.defineProperty(dom.window.document, 'currentScript', {
    configurable: true,
    value: dom.window.document.querySelector('script[src*="landing.js"]')
  });
  dom.window.eval(landing);
  return dom;
}

test('all product maps and their lists use matching local artwork with twelve distinct product icons', async () => {
  for (const slug of slugs) {
    const dom = await open(slug);
    try {
      const { document } = dom.window;
      const icons = [...document.querySelectorAll('[data-ecosystem-icon]')];
      assert.equal(icons.length, 24, slug);
      const sources = new Map();
      for (const node of icons) {
        const image = node.querySelector('img:not(.is-secondary)');
        assert.ok(image, node.dataset.ecosystemIcon);
        assert.equal(image.alt, '');
        assert.equal(image.getAttribute('aria-hidden'), 'true');
        assert.equal(node.querySelector('svg'), null);
        const file = new URL(`../../../${new URL(image.src).pathname.slice(1)}`, import.meta.url);
        assert.ok(existsSync(file), file.href);
        const previous = sources.get(node.dataset.ecosystemIcon);
        if (previous) assert.equal(image.src, previous);
        sources.set(node.dataset.ecosystemIcon, image.src);
      }
      assert.equal(sources.size, 12);
      assert.equal(new Set(sources.values()).size, 12);
      assert.equal(document.querySelectorAll('[data-icon-credit="icons8"]').length, 1);
      assert.ok(document.querySelector('[data-ecosystem-icon="ai-voice-sms"] .is-secondary'));
    } finally { dom.window.close(); }
  }
});

test('changing ecosystem focus and language preserves product navigation and consistent artwork', async () => {
  const dom = await open('community');
  try {
    const { document } = dom.window;
    const target = document.querySelector('.ecosystem-node[href="../analytics/index.html"]');
    const href = target.getAttribute('href');
    const source = target.querySelector('img').src;
    target.dispatchEvent(new dom.window.FocusEvent('focus'));
    assert.equal(document.querySelector('.ecosystem-spotlight-title').textContent, 'Analytics');
    assert.equal(document.querySelector('.ecosystem-spotlight-link').getAttribute('href'), href);
    const language = document.getElementById('language');
    language.value = 'en';
    language.dispatchEvent(new dom.window.Event('change'));
    assert.equal(target.getAttribute('href'), href);
    assert.equal(target.querySelector('img').src, source);
    assert.equal(document.querySelector('.ecosystem-center strong').textContent, 'Community');
  } finally { dom.window.close(); }
});
