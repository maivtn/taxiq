const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.COMMUNITY_BASE_URL || 'http://127.0.0.1:5530';
const output = process.env.COMMUNITY_PAGES_OUTPUT || '/tmp/community-pages-header';
const results = [], errors = [];

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 834, 1440]) for (const account of ['personal', 'business']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      try {
        await context.addInitScript(() => {
          for (const key of ['nexora-community-tour-desktop-v1', 'nexora-community-tour-mobile-v1']) localStorage.setItem(key, '1');
        });
        const page = await context.newPage();
        page.setDefaultTimeout(12000);
        page.on('pageerror', error => errors.push({ width, account, error: error.message }));
        const entry = base + '/html/v3.1/' + (account === 'personal' ? 'staff-community.html' : 'community.html') + '?account=' + account + '&tab=pages';
        const hub = page.locator('#community-staging,#community-hub');
        const view = hub.locator('#pagesView');
        const filters = view.locator('.community-pages-filters');
        async function open() {
          await page.goto(entry, { waitUntil: 'domcontentloaded' });
          await view.locator('#pageCards .page-card').first().waitFor();
          await page.waitForFunction(() => document.querySelector('#pagesView h2')?.textContent === 'Pages & Fanpages');
        }
        async function check(name, run) {
          try { await run(); results.push({ width, account, name, pass: true }); console.log('PASS', width, account, name); }
          catch (error) {
            results.push({ width, account, name, pass: false, error: error.stack }); console.log('FAIL', width, account, name, error.message);
            await page.screenshot({ path: path.join(output, `${width}-${account}-${name.replace(/\W+/g, '-')}-failure.png`) }).catch(() => {});
          }
        }
        await check('PO header order and responsive navigation', async () => {
          await open();
          assert.equal(await view.locator('.community-pages-shortcuts button').count(), 5);
          assert.equal(await view.locator('.community-pages-shortcuts .active').getAttribute('aria-current'), 'page');
          const boxes = await Promise.all(['.community-pages-shortcuts', '.community-pages-hero', '.community-pages-search', '.community-pages-filters'].map(selector => view.locator(selector).boundingBox()));
          for (let i = 1; i < boxes.length; i++) assert.ok(boxes[i].y >= boxes[i - 1].y + boxes[i - 1].height - 1, 'Header blocks follow the PO order');
          assert.deepEqual((await filters.locator('button').allTextContents()).slice(0, 5), ['All', 'My Pages', 'Nail salons', 'Food', 'Community']);
          assert.equal(await view.locator('#pageIndustryFilter').isVisible(), false);
          assert.equal((await view.innerText()).includes('undefined'), false, 'Translation preserves whitespace');
          assert.equal(await view.locator('.community-pages-hero button svg').count(), 1, 'Create has one plus icon');
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          if (width < 801) {
            const tabs = hub.locator('.mobile-nav .mobile-tab:visible');
            assert.equal(await tabs.count(), 5);
            assert.deepEqual(await tabs.evaluateAll(nodes => nodes.map(node => node.dataset.view || 'more')), ['feed', 'market', 'pages', 'jobs', 'more']);
            await page.waitForFunction(() => getComputedStyle(document.querySelector('.mobile-nav [data-view="pages"]')).backgroundColor === 'rgb(101, 81, 223)');
          }
          await page.screenshot({ path: path.join(output, `header-${width}-${account}.png`) });
        });
        await check('search submit and category filters', async () => {
          await open();
          await view.locator('#pageSearch').fill('no matching page 987654');
          await view.locator('.community-pages-search button').click();
          assert.equal(await view.locator('#pageCards .page-card').count(), 0);
          assert.ok(await view.locator('#pageCards .empty').isVisible());
          await view.locator('#pageSearch').fill('');
          for (const [category, industry] of [['Nail & làm đẹp', 'beauty'], ['Nhà hàng & ăn uống', 'restaurant']]) {
            const filter = filters.locator(`[data-page-category="${category}"]`);
            await filter.click();
            assert.equal(await filter.getAttribute('aria-pressed'), 'true');
            const industries = await view.locator('#pageCards .page-card').evaluateAll(nodes => nodes.map(node => node.dataset.industry));
            assert.ok(industries.length > 0 && industries.every(value => value === industry));
            assert.equal(await filters.locator('.active').count(), 1);
          }
          await view.locator('.community-pages-shortcuts [data-page-scope]').click();
          assert.equal(await filters.locator('[data-page-scope="discover"]').getAttribute('aria-pressed'), 'true');
          assert.ok(await view.locator('#pageCards [data-industry="beauty"]').count());
          assert.ok(await view.locator('#pageCards [data-industry="restaurant"]').count());
        });
        await check('create community Page and My Pages', async () => {
          await open();
          await view.locator('.community-pages-hero [data-template="page"]').click();
          const form = hub.locator('#templateForm[data-kind="page"]');
          await form.locator('[name="title"]').fill('Header QA Community');
          await form.locator('[name="handle"]').fill('header.qa.' + account + width);
          await form.locator('[name="industry"]').selectOption('Dịch vụ khác');
          await form.locator('[name="city"]').fill('Houston, TX');
          await form.locator('[name="description"]').fill('Community page created from the Pages header.');
          await form.locator('[name="primaryAction"]').selectOption('Nhắn tin');
          await form.locator('[name="poCategory"]').selectOption('community');
          await form.locator('[type="submit"]').click();
          await form.waitFor({ state: 'hidden' });
          await open();
          await filters.locator('[data-page-scope="mine"]').click();
          assert.ok((await view.locator('#pageCards').innerText()).includes('Header QA Community'));
          assert.equal(await view.locator('#pageCards [data-follow-page]').count(), 0);
          await filters.locator('[data-page-category="Cộng đồng"]').click();
          assert.equal(await filters.locator('[data-page-scope="mine"]').getAttribute('aria-pressed'), 'false');
          assert.deepEqual(await view.locator('#pageCards h3').allTextContents(), ['Header QA Community']);
        });
        await check('Following and Page detail reload and return', async () => {
          await open();
          const follow = view.locator('#pageCards [data-follow-page]').first();
          const id = await follow.getAttribute('data-follow-page');
          await follow.click();
          await filters.locator('[data-page-scope="following"]').click();
          assert.equal(await view.locator('#pageCards [data-open-page]').count(), 1);
          await view.locator(`#pageCards [data-open-page="${id}"]`).click();
          await page.waitForURL(url => url.searchParams.get('pageId') === id);
          await hub.locator('#communityPageScreen').waitFor();
          assert.equal(await view.locator('.community-pages-hero').isVisible(), false);
          assert.equal(await view.locator('.community-pages-shortcuts').isVisible(), false);
          await page.reload();
          await hub.locator('#communityPageScreen [data-page-screen-back="list"]').click();
          await page.waitForURL(url => !url.searchParams.has('pageId'));
          await view.locator('.community-pages-hero').waitFor();
          assert.equal(await filters.locator('[data-page-scope="following"]').getAttribute('aria-pressed'), 'true');
        });
        for (const route of ['feed', 'shop', 'deals', 'reels']) await check('shortcut ' + route, async () => {
          await open();
          await view.locator(`.community-pages-shortcuts :is([data-po-route="${route}"],[data-view="${route}"])`).click();
          await page.waitForURL(url => url.searchParams.get('tab') === route);
          await hub.locator({ feed: '#feedView', shop: '.store-head', deals: '#communityDealsView', reels: '.reels-hero' }[route]).waitFor();
          assert.equal(page.frames().length, 1);
        });
      } finally { await context.close(); }
    }
  } finally {
    await browser.close();
    await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  }
  console.log('TOTAL', results.filter(row => row.pass).length + '/' + results.length, 'errors=' + errors.length);
  process.exitCode = results.some(row => !row.pass) || errors.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
