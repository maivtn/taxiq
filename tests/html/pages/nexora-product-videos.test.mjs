import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const products = new URL('../../../html/pages/products/', import.meta.url);
const script = await readFile(new URL('product-video.js', products), 'utf8');
const vendor = await readFile(new URL('../../assets/vendor/sweetalert2.all.min.js', products), 'utf8');
const selected = ['si-pos', 'one-qr', 'payments-payouts', 'ai-hub', 'reviews', 'gift-card-center', 'community', 'tax-iq', 'ai-voice-sms', 'ai-marketing'];

async function page(slug) {
  const html = await readFile(new URL(`${slug}/index.html`, products), 'utf8');
  const dom = new JSDOM(html, {
    url: `https://example.test/html/pages/products/${slug}/index.html`,
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  dom.window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  dom.window.scrollTo = () => {};
  dom.window.eval(vendor);
  dom.window.eval(script);
  return dom;
}

test('selected product videos are clickable locally without loading an iframe before a click', async () => {
  for (const slug of selected) {
    const dom = await page(slug);
    try {
      const { document } = dom.window;
      const button = document.querySelector('.product-video-trigger');
      assert.ok(button, slug);
      assert.equal(button.tagName, 'BUTTON');
      assert.equal(button.getAttribute('aria-haspopup'), 'dialog');
      assert.equal(document.querySelector('.video-placeholder'), null);
      assert.equal(document.querySelector('[data-video-pending]'), null);
      assert.equal(document.querySelector('iframe'), null);
      assert.ok(document.querySelector('script[src*="vendor/sweetalert2"]'));
    } finally { dom.window.close(); }
  }
});

test('Gift Card opens the requested E-Gift Hub videos and switches the source with the page language', async () => {
  const dom = await page('gift-card-center');
  try {
    const { document } = dom.window;
    const button = document.querySelector('.product-video-trigger');
    button.click();
    let frame = document.querySelector('.product-video-modal-frame iframe');
    assert.equal(new URL(frame.src).pathname, '/embed/58ir33CHnF0');
    assert.equal(new URL(frame.src).searchParams.get('autoplay'), '1');
    assert.match(frame.allow, /autoplay/);
    dom.window.Swal.close();
    const select = document.getElementById('language');
    select.value = 'en';
    select.dispatchEvent(new dom.window.Event('change'));
    button.click();
    frame = document.querySelector('.product-video-modal-frame iframe');
    assert.equal(new URL(frame.src).pathname, '/embed/sflECSu8wl4');
  } finally { dom.window.close(); }
});

test('closing a product video stops and removes its iframe, and reopening starts a fresh player', async () => {
  const dom = await page('one-qr');
  try {
    const { document } = dom.window;
    const button = document.querySelector('.product-video-trigger');
    button.click();
    const original = document.querySelector('.product-video-modal-frame iframe');
    dom.window.Swal.close();
    assert.equal(original.src, 'about:blank');
    assert.equal(original.isConnected, false);
    assert.equal(document.querySelector('.product-video-modal-frame iframe'), null);
    button.click();
    const reopened = document.querySelector('.product-video-modal-frame iframe');
    assert.notEqual(reopened, original);
    assert.equal(new URL(reopened.src).pathname, '/embed/SvhDWLvEUqQ');
  } finally { dom.window.close(); }
});

test('products without a matching video retain their original pending state', async () => {
  for (const slug of ['analytics', 'spin-wheel']) {
    const dom = await page(slug);
    try {
      assert.ok(dom.window.document.querySelector('.video-placeholder'));
      assert.ok(dom.window.document.querySelector('[data-video-pending]'));
      assert.equal(dom.window.document.querySelector('.product-video-trigger'), null);
    } finally { dom.window.close(); }
  }
});
