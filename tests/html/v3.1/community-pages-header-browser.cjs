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
    for (const width of [390, 662, 834, 1280, 1440]) for (const account of ['personal', 'business']) {
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
          assert.equal(await hub.locator('.community-heading h1:visible').innerText(), 'Fanpage');
          const navigation = hub.locator('.mobile-nav:visible,.top .tabs:visible').first();
          assert.deepEqual(await navigation.locator('.tab:visible').evaluateAll(nodes => nodes.map(node => node.dataset.view || 'more')), ['feed', 'market', 'pages', 'jobs', 'more']);
          assert.deepEqual(await navigation.locator('.tab:visible > span:not(.tab-new)').allTextContents(), ['Feed', 'Groups', 'Fanpage', 'Jobs', 'More']);
          const navBoxes = await navigation.locator('.tab:visible').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().y));
          assert.ok(navBoxes.every(y => Math.abs(y - navBoxes[0]) < 2), 'All five primary destinations fit on one row');
          const cards = view.locator('#pageCards .page-card');
          assert.equal(await cards.count(), 17, 'All existing Page records remain available');
          const wide = (await hub.locator('#communityPane').boundingBox()).width > 800;
          const geometry = await view.locator('#pageCards').evaluate(node => {
            const bounds = node.getBoundingClientRect();
            return { display: getComputedStyle(node).display, width: node.clientWidth, scroll: node.scrollWidth,
              cards: [...node.children].map(card => { const box = card.getBoundingClientRect(); return {left:box.left-bounds.left,right:box.right-bounds.left,top:box.top}; }) };
          });
          assert.equal(geometry.display, wide ? 'grid' : 'flex');
          if (wide) {
            assert.ok(geometry.scroll <= geometry.width + 1, 'Desktop directory needs no horizontal scrolling');
            assert.ok(geometry.cards.every(card => card.left >= -1 && card.right <= geometry.width + 1), 'Every Page card fits the desktop content area');
            assert.ok(new Set(geometry.cards.map(card => Math.round(card.top))).size > 1, 'Pages flow onto additional rows');
          } else assert.ok(geometry.scroll > geometry.width, 'Mobile retains its swipeable Page rail');
          if (width < 801) {
            const tabs = hub.locator('.mobile-nav .mobile-tab:visible');
            assert.equal(await tabs.count(), 5);
            assert.deepEqual(await tabs.evaluateAll(nodes => nodes.map(node => node.dataset.view || 'more')), ['feed', 'market', 'pages', 'jobs', 'more']);
          }
          await page.screenshot({ path: path.join(output, `header-${width}-${account}.png`) });
        });
        await check('shared location and role-specific Create from Pages', async () => {
          await open();
          const location = hub.locator('#communityLocation');
          await location.click();
          await hub.locator('#viewerLocationTitle').waitFor();
          await hub.locator('#closeModal').click();
          await hub.locator('#viewerLocationTitle').waitFor({ state: 'hidden' });
          await page.waitForFunction(() => !history.state?.communityDetail);
          const before = page.url();
          await hub.locator('#communityCreate').click();
          const menu = hub.locator('#communityCreateMenu');
          await menu.waitFor();
          assert.equal(page.url(), before, 'Opening Create preserves the current Page route');
          const kinds = await menu.locator('[data-create-kind]').evaluateAll(nodes => nodes.map(node => node.dataset.createKind));
          assert.deepEqual(kinds, ['blog','photos','reels','live','showcase','tip','question','poll','event','sale','want',...(account === 'personal' ? ['seeking'] : ['deal','hiring'])]);
          await page.keyboard.press('Escape');
          await menu.waitFor({ state: 'hidden' });
        });
        await check('secondary destinations remain accessible through More', async () => {
          for (const [selector, route, content] of [
            ['[data-quick-view="deals"]', 'deals', '.deal-hero'],
            ['[data-quick-view="connect"]', 'connect', '#connectPane .native-body'],
            ['[data-community-extra="news"]', 'blog', '#blogView'],
            ['[data-quick-view="daywork"]', 'shift', '#dayworkView']
          ]) {
            await open();
            await hub.locator('.community-nav-more:visible').click();
            await hub.locator('#ecosystemMenu').locator(selector).click();
            await page.waitForURL(url => url.searchParams.get('tab') === route);
            await hub.locator(content).waitFor();
            const navigation = hub.locator('.mobile-nav:visible,.top .tabs:visible').first();
            assert.equal(await navigation.locator(route === 'shift' ? '[data-view="jobs"]' : '.community-nav-more').getAttribute('aria-current'), 'page');
            await navigation.locator('[data-view="pages"]').click();
            await view.locator('#pageCards .page-card').first().waitFor();
          }
        });
        await check('direct secondary routes retain selection and a working location dialog', async () => {
          for (const route of ['connect','blog','reels']) {
            await page.goto(entry.replace('tab=pages', 'tab=' + route), { waitUntil:'domcontentloaded' });
            await page.waitForFunction(() => document.querySelector('#community-staging,#community-hub')?.dataset.communityReady === 'true');
            const more = hub.locator('.community-nav-more:visible');
            assert.equal(await more.getAttribute('aria-current'), 'page', 'Direct links select More');
            await hub.locator('#communityLocation').click();
            await hub.locator('#viewerLocationTitle').waitFor();
            await hub.locator('#viewerCity').selectOption('Dallas');
            await hub.locator('#viewerLocationSave').click();
            await hub.locator('#viewerLocationTitle').waitFor({ state:'hidden' });
            await page.waitForFunction(() => !history.state?.communityDetail);
            assert.equal(new URL(page.url()).searchParams.get('tab'), route, 'Saving location retains the active screen');
            assert.equal(await hub.locator('#communityLocation').innerText(), 'Dallas, TX');
            assert.equal(await hub.locator('.community-location-overlay').count(), 0);
            await hub.locator('#communityLocation').click();
            await hub.locator('#viewerLocationTitle').waitFor();
            await page.goBack();
            await hub.locator('#viewerLocationTitle').waitFor({ state:'hidden' });
            assert.equal(new URL(page.url()).searchParams.get('tab'), route, 'Back closes the location dialog');
          }
        });
        await check('Pages shares navigation styling and routes with other tabs', async () => {
          await open();
          const nav = hub.locator('.mobile-nav:visible,.top .tabs:visible').first();
          const snapshot = () => nav.evaluate(node => {
            const active = node.querySelector('.tab.active');
            const style = getComputedStyle(active);
            return {
              active: Object.fromEntries(['backgroundColor', 'backgroundImage', 'borderRadius', 'fontSize', 'padding', 'minHeight'].map(key => [key, style[key]])),
              buttons: [...node.querySelectorAll('.tab')].filter(button => button.getClientRects().length).map(button => {
                const box = button.getBoundingClientRect();
                return { route: button.dataset.view || 'more', x: Math.round(box.x), width: Math.round(box.width), height: Math.round(box.height) };
              })
            };
          });
          const pages = await snapshot();
          for (const [view, route] of [['feed', 'feed'], ['market', 'market'], ['jobs', 'jobs'], ['pages', 'pages']]) {
            await nav.locator(`.tab[data-view="${view}"]`).click();
            await page.waitForURL(url => url.searchParams.get('tab') === route);
            await page.waitForFunction(view => document.querySelector('.mobile-nav .tab.active')?.dataset.view === view, view);
            if (width < 801) assert.deepEqual(await snapshot(), pages, 'Mobile tab geometry and selected styling stay consistent on ' + route);
          }
          await view.locator('.community-pages-hero').waitFor();
          await nav.locator('.community-nav-more').click();
          const menu = hub.locator('#ecosystemMenu');
          await menu.waitFor();
          assert.equal(await menu.locator('[data-quick-view="deals"]').isVisible(), true);
          assert.equal(await menu.locator('[data-quick-view="connect"]').isVisible(), true);
          await page.keyboard.press('Escape');
          await menu.waitFor({ state: 'hidden' });
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
          await hub.locator('.top .tabs [data-view="pages"]:visible,.mobile-nav [data-view="pages"]:visible').first().click();
          await page.waitForURL(url => !url.searchParams.has('pageId'));
          await view.locator('.community-pages-hero').waitFor();
          assert.equal(await filters.locator('[data-page-scope="following"]').getAttribute('aria-pressed'), 'true');
        });
        for (const route of ['feed', 'shop', 'deals', 'reels']) await check('shortcut ' + route, async () => {
          await open();
          await view.locator(`.community-pages-shortcuts :is([data-po-route="${route}"],[data-view="${route}"])`).click();
          await page.waitForURL(url => url.searchParams.get('tab') === route);
          await hub.locator({ feed: '#feedView', shop: '.store-head', deals: '.deal-hero', reels: '.reels-hero' }[route]).waitFor();
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
