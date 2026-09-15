import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const shellSource = readFileSync(new URL('./nexora-shell.js', import.meta.url), 'utf8');
const pageDirectory = new URL('../pages/', import.meta.url);

const cases = [
  ['booking-book-phase-1.html', '../assets/salon-data.js'],
  ['community.html', 'https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js'],
  ['salon-setup-reward.html', '../assets/promotions-store.js'],
  ['change-icon.html', 'https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js'],
  ['reward-promotions.html', 'https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js']
];

function pageSource(file) {
  return readFileSync(new URL(file, pageDirectory), 'utf8');
}

function shellStateBeforeDependency(file, dependency) {
  const source = pageSource(file);
  const dependencyTag = `<script src="${dependency}"></script>`;
  assert.ok(source.includes(dependencyTag), `${file} should contain its later dependency marker`);
  const prefix = source.slice(0, source.indexOf(dependencyTag));
  const dom = new JSDOM(`${prefix}</body></html>`, {
    runScripts: 'outside-only',
    url: `https://example.test/html/pages/${file}?tab=overview`
  });
  try {
    for (const script of dom.window.document.querySelectorAll('script')) {
      if (script.src.endsWith('/assets/nexora-shell.js')) dom.window.eval(shellSource);
      else if (script.textContent.includes('window.NEXORA_SHELL')) dom.window.eval(script.textContent);
    }

    return {
      sidebarId: dom.window.document.querySelector('aside.sidebar')?.id || '',
      rewardLabels: Array.from(dom.window.document.querySelectorAll('#nexora-subnav-reward .nav-subitem span:last-child'), (node) => node.textContent)
    };
  } finally {
    dom.window.close();
  }
}

test('salon pages leave sidebar and header rendering to the shared shell', () => {
  for (const [file] of cases) {
    const dom = new JSDOM(pageSource(file));
    try {
      assert.equal(dom.window.document.querySelector('aside.sidebar')?.childElementCount, 0, `${file} has a duplicated sidebar`);
      assert.equal(dom.window.document.querySelector('header.header')?.childElementCount, 0, `${file} has a duplicated header`);
    } finally {
      dom.window.close();
    }
  }
});

test('shared shell renders the complete Reward menu before later page dependencies execute', () => {
  for (const [file, dependency] of cases) {
    const state = shellStateBeforeDependency(file, dependency);
    assert.equal(state?.sidebarId, 'nexora-sidebar', `${file} loaded its page dependencies before the shared shell`);
    assert.ok(state.rewardLabels.includes('AI Offers'), `${file} omitted AI Offers before its page dependencies`);
    assert.ok(state.rewardLabels.includes('Promotions'), `${file} omitted Promotions before its page dependencies`);
  }
});

test('Promotions renders shared shell icons after Lucide becomes available', () => {
  const dom = new JSDOM(pageSource('reward-promotions.html'), {
    runScripts: 'outside-only',
    url: 'https://example.test/html/pages/reward-promotions.html'
  });
  let iconRenders = 0;
  try {
    for (const script of dom.window.document.querySelectorAll('script')) {
      if (script.src.endsWith('/assets/nexora-shell.js')) dom.window.eval(shellSource);
      else if (script.src.includes('/lucide@')) {
        dom.window.lucide = { createIcons() { iconRenders += 1; } };
      } else if (script.textContent.includes('window.NEXORA_SHELL') || script.textContent.includes('lucide.createIcons')) {
        dom.window.eval(script.textContent);
      }
    }

    assert.equal(iconRenders, 1);
    assert.ok(dom.window.document.querySelectorAll('#nexora-sidebar [data-lucide]').length > 0);
  } finally {
    dom.window.close();
  }
});
