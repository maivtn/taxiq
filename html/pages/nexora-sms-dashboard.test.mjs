import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, ResourceLoader } from 'jsdom';

const html = readFileSync(new URL('./nexora-sms-dashboard.html', import.meta.url), 'utf8');
const shellSource = readFileSync(new URL('../assets/nexora-shell.js', import.meta.url), 'utf8');

function inlineScriptContaining(document, marker) {
  const script = Array.from(document.querySelectorAll('script:not([src])'))
    .find(node => node.textContent.includes(marker));
  assert.ok(script, `inline script containing ${marker} must exist`);
  return script.textContent;
}

test('renders the shared merchant sidebar while local SMS dashboard views remain usable', t => {
  const dom = new JSDOM(html, {
    url: 'https://nexora.test/html/pages/nexora-sms-dashboard.html?view=landingpage',
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const { window } = dom;

  window.eval(inlineScriptContaining(window.document, 'window.NEXORA_SHELL'));
  window.eval(shellSource);
  window.eval(inlineScriptContaining(window.document, 'const PRICE_PER_SMS'));

  const sidebarLabels = Array.from(
    window.document.querySelectorAll('#nexora-sidebar .nav-subitem'),
    node => node.textContent.trim()
  );
  assert.ok(sidebarLabels.includes('AI Offers'));
  assert.ok(sidebarLabels.includes('Promotions'));

  const localNav = window.document.querySelector('#mainNav.sms-dashboard-tabs');
  assert.ok(localNav, 'page-specific navigation remains in the content area');
  assert.equal(window.document.querySelector('#view-landingpage').classList.contains('active'), true);

  localNav.querySelector('[data-view="sms"]').click();
  assert.equal(window.document.querySelector('#view-sms').classList.contains('active'), true);
  assert.equal(window.document.querySelector('#view-landingpage').classList.contains('active'), false);
});

test('renders the shared sidebar without waiting for the Lucide CDN', async t => {
  class DelayedLucideLoader extends ResourceLoader {
    fetch(url) {
      if (url.includes('unpkg.com/lucide')) {
        const delayed = new Promise(() => {});
        delayed.abort = () => {};
        return delayed;
      }
      if (url.endsWith('/assets/nexora-shell.js')) return Promise.resolve(Buffer.from(shellSource));
      if (url.endsWith('.css')) return Promise.resolve(Buffer.from(''));
      return Promise.resolve(Buffer.from(''));
    }
  }

  const dom = new JSDOM(html, {
    url: 'https://nexora.test/html/pages/nexora-sms-dashboard.html',
    runScripts: 'dangerously',
    resources: new DelayedLucideLoader()
  });
  t.after(() => dom.window.close());

  await new Promise(resolve => setTimeout(resolve, 40));
  assert.ok(dom.window.document.querySelector('#nexora-sidebar .sidebar-nav'));
});
