import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const pages = new URL('../../../html/pages/', import.meta.url);
const originalFile = new URL('nexora-home.html', pages);
const reviewFile = new URL('nexora-home-po-review.html', pages);

function parse(file) {
  return new JSDOM(readFileSync(file, 'utf8'), {
    url: `https://nexora.test/html/pages/${file.pathname.split('/').pop()}`,
    virtualConsole: new VirtualConsole(),
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
}

// JSDOM exercises the original event handlers, not viewport rendering or touch.
function boot(t, width = 1440) {
  const dom = parse(reviewFile);
  t.after(() => dom.window.close());
  const w = dom.window;
  Object.defineProperty(w, 'innerWidth', { value: width });
  w.matchMedia = media => ({
    media,
    matches: !/prefers-reduced-motion|hover|pointer/.test(media) &&
      [...media.matchAll(/\((min|max)-width:\s*(\d+)px\)/g)].every(([, bound, size]) =>
        bound === 'min' ? width >= Number(size) : width <= Number(size)),
    addEventListener() {},
    removeEventListener() {}
  });
  for (const script of w.document.querySelectorAll('script')) {
    if (script.type === 'application/ld+json') continue;
    if (script.hasAttribute('src')) {
      const path = script.getAttribute('src').split('?')[0];
      w.eval(readFileSync(new URL(path, pages), 'utf8'));
    } else {
      w.eval(script.textContent);
    }
  }
  return w;
}

test('PO review preserves the original content, controls, media, destinations and scripts', t => {
  const original = parse(originalFile);
  const review = parse(reviewFile);
  t.after(() => { original.window.close(); review.window.close(); });
  const signatures = doc => ({
    text: [...doc.body.querySelectorAll('*')]
      .filter(el => !el.children.length && !['SCRIPT', 'STYLE'].includes(el.tagName))
      .map(el => el.textContent.trim()).filter(Boolean),
    links: [...doc.querySelectorAll('a')].map(el => el.outerHTML),
    media: [...doc.querySelectorAll('img, iframe, video')].map(el => el.outerHTML),
    forms: [...doc.querySelectorAll('form')].map(el => el.outerHTML),
    buttons: [...doc.querySelectorAll('button')].map(el => el.outerHTML),
    scripts: [...doc.querySelectorAll('script')].map(el => el.outerHTML)
  });
  assert.deepEqual(signatures(review.window.document), signatures(original.window.document));
  assert.equal(review.window.document.querySelectorAll('dialog, [role="dialog"]').length, 0);
});

test('PO review directly referenced local resources and public destinations are available', t => {
  const dom = parse(reviewFile);
  t.after(() => dom.window.close());
  for (const node of dom.window.document.querySelectorAll('[src], a[href], link[href]')) {
    const value = node.getAttribute('src') || node.getAttribute('href');
    if (!value || value.startsWith('#') || /^(?:[a-z]+:|\/\/)/i.test(value)) continue;
    assert.ok(existsSync(new URL(value.split(/[?#]/)[0], pages)), value);
  }
});

for (const width of [390, 768, 1024, 1440]) {
  test(`PO review menu and app popover keep their open/close behavior at ${width}px (DOM only)`, t => {
    const w = boot(t, width), d = w.document;
    const menu = d.getElementById('menu-toggle');
    menu.click();
    assert.equal(menu.getAttribute('aria-expanded'), 'true');
    assert.ok(d.getElementById('main-nav').classList.contains('open'));
    const group = d.querySelector('.nav-trigger');
    group.click();
    assert.equal(group.getAttribute('aria-expanded'), 'true');
    assert.equal(d.getElementById(group.getAttribute('aria-controls')).hidden, false);
    d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(menu.getAttribute('aria-expanded'), 'false');
    assert.equal(group.getAttribute('aria-expanded'), 'false');
    const apps = d.getElementById('apps-trigger');
    apps.click();
    assert.equal(d.getElementById('apps-menu').hidden, false);
    d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(d.getElementById('apps-menu').hidden, true);
    assert.equal(d.activeElement, apps);
    apps.click();
    d.body.dispatchEvent(new w.Event('pointerdown', { bubbles: true }));
    assert.equal(d.getElementById('apps-menu').hidden, true);
  });
}

test('PO review slide controls retain twelve destinations, previous/next, direct selection and pause', t => {
  const w = boot(t), d = w.document;
  const dots = [...d.querySelectorAll('#hero-slide-dots button')];
  const link = () => d.querySelector('.hero-buttons a').getAttribute('href');
  assert.equal(dots.length, 12);
  assert.equal(link(), 'products/si-pos/index.html');
  d.getElementById('hero-slide-next').click();
  assert.equal(link(), 'products/one-qr/index.html');
  assert.equal(d.querySelectorAll('.hero-device-features > div').length, 6);
  assert.ok(d.querySelector('.hero-device-features').textContent.includes('Check-in'));
  assert.equal(dots[1].getAttribute('aria-current'), 'true');
  d.getElementById('hero-slide-prev').click();
  assert.equal(link(), 'products/si-pos/index.html');
  dots[11].click();
  assert.equal(link(), 'products/spin-wheel/index.html');
  const pause = d.getElementById('hero-slide-pause');
  const before = pause.getAttribute('aria-label');
  pause.click();
  assert.notEqual(pause.getAttribute('aria-label'), before);
  pause.click();
  assert.equal(pause.getAttribute('aria-label'), before);
});

test('PO review directory tabs and profile selection keep their original behavior', t => {
  const w = boot(t), d = w.document;
  const tabs = () => [...d.querySelectorAll('#industry-tabs button')];
  assert.equal(tabs().length, 5);
  assert.equal(d.getElementById('industry-profile').dataset.sector, 'nail');
  tabs()[1].click();
  assert.equal(d.getElementById('industry-profile').dataset.sector, 'hair');
  assert.equal(tabs()[1].getAttribute('aria-pressed'), 'true');
  const businesses = [...d.querySelectorAll('.industry-directory-card')];
  assert.ok(businesses.length > 1);
  const selected = businesses[1].querySelector('strong').textContent;
  businesses[1].click();
  assert.equal(d.getElementById('industry-business-name').textContent, selected);
});

test('PO review ecosystem selections and tour toggle keep their pressed states', t => {
  const w = boot(t), d = w.document;
  const nodes = [...d.querySelectorAll('.eco-node')];
  assert.ok(nodes.length > 1);
  nodes[1].click();
  assert.equal(nodes[1].getAttribute('aria-pressed'), 'true');
  assert.equal(d.querySelectorAll('.eco-node[aria-pressed="true"]').length, 1);
  const tour = d.getElementById('eco-tour-toggle');
  const before = tour.getAttribute('aria-pressed');
  tour.click();
  assert.notEqual(tour.getAttribute('aria-pressed'), before);
});

test('PO review language changes still update dynamic slides, directory and form labels', t => {
  const w = boot(t), d = w.document;
  const select = d.getElementById('language');
  const heading = () => d.querySelector('[data-contact-i18n="formTitle"]').textContent;
  const vietnamese = heading();
  select.value = 'en';
  select.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(d.documentElement.lang, 'en');
  assert.equal(d.getElementById('language-code').textContent, 'EN');
  assert.notEqual(heading(), vietnamese);
  assert.equal(d.getElementById('hero-slide-next').getAttribute('aria-label'), 'Next product');
  select.value = 'vi';
  select.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(heading(), vietnamese);
});

test('PO review form keeps required validation and prepares the original contact payload for copying', async t => {
  const w = boot(t), d = w.document;
  const form = d.getElementById('home-contact-form');
  const copied = [];
  Object.defineProperty(w.navigator, 'clipboard', {
    value: { writeText: async text => { copied.push(text); } }
  });
  assert.equal(form.checkValidity(), false);
  d.getElementById('contact-copy').click();
  assert.equal(copied.length, 0);
  form.elements.name.value = 'PO Review';
  form.elements.email.value = 'invalid';
  form.elements.topic.value = 'support';
  form.elements.message.value = 'Homepage review';
  form.elements.consent.checked = true;
  assert.equal(form.elements.email.validity.typeMismatch, true);
  form.elements.email.value = 'po-review@example.test';
  assert.equal(form.checkValidity(), true);
  d.getElementById('contact-copy').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(copied.length, 1);
  assert.ok(copied[0].includes('po-review@example.test'));
  assert.ok(copied[0].includes('Homepage review'));
  assert.equal(d.getElementById('contact-status').hidden, false);
  assert.ok(d.getElementById('contact-status').textContent.includes('support@nexoratouch.com'));
});

test('PO review video button retains the original embed and cover transition', t => {
  const w = boot(t), d = w.document;
  d.getElementById('video-play').click();
  assert.equal(d.getElementById('video-cover').hidden, true);
  assert.equal(d.getElementById('video-frame').hidden, false);
  assert.equal(d.getElementById('video-frame').src, 'https://www.youtube-nocookie.com/embed/ghegM-w3NAM?autoplay=1&rel=0');
});
