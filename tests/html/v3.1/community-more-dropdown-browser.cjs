const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const repo = path.resolve(__dirname, '../../..');
const output = process.env.COMMUNITY_MORE_OUTPUT || '/tmp/taxiq-community-more';
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
const server = http.createServer(async (request, response) => {
  try {
    const file = path.resolve(repo, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (!file.startsWith(repo + path.sep)) throw new Error('Invalid path');
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(await fs.readFile(file));
  } catch {
    response.statusCode = 404;
    response.end();
  }
});

(async () => {
  await fs.mkdir(output, {recursive:true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const results = [];
  try {
    browser = await chromium.launch({headless:true});
    const base = process.env.COMMUNITY_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    for (const width of [1280, 390]) for (const account of ['business', 'personal']) {
      const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      try {
        await context.addInitScript(() => {
          localStorage.setItem('nexora-community-tour-desktop-v1', '1');
          localStorage.setItem('nexora-community-tour-mobile-v1', '1');
        });
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const entry = account === 'personal' ? 'staff-community.html?account=personal&role=tech' : 'community.html?account=business';
        const open = async tab => {
          await page.goto(base + '/html/v3.1/' + entry + '&tab=' + tab, {waitUntil:'domcontentloaded'});
          await page.locator('.community-nav-more:visible').first().waitFor();
        };
        await open('feed');
        const host = page.locator('#community-staging,#community-hub');
        const more = host.locator('.community-nav-more:visible').first();
        const menu = host.locator('#ecosystemMenu');
        const check = async (name, action) => {
          try {
            await action();
            results.push({width,account,name,pass:true});
            console.log('PASS', width, account, name);
          } catch (error) {
            results.push({width,account,name,pass:false,error:error.message});
            console.error('FAIL', width, account, name, error.message);
            await page.screenshot({path:path.join(output, width+'-'+account+'-'+name.replace(/\W+/g,'-')+'.png')});
          }
        };
        await check('responsive More presentation and Escape', async () => {
          await more.click();
          await menu.waitFor();
          const box = await menu.boundingBox();
          if (width > 800) {
            assert.equal(await menu.getAttribute('role'), 'menu');
            assert.equal(await menu.getAttribute('aria-modal'), null);
            const trigger = await more.boundingBox();
            assert.ok(box.y >= trigger.y + trigger.height && box.y <= trigger.y + trigger.height + 16);
            assert.ok(box.width <= 502 && box.height <= 562);
            assert.equal(await host.locator('.community-menu-heading').isVisible(), true);
            assert.equal(await host.locator('.community-menu-backdrop').evaluate(node => getComputedStyle(node).backgroundColor), 'rgba(0, 0, 0, 0)');
            await page.keyboard.press('End');
            assert.equal(await menu.locator('[role="menuitem"]:visible').last().evaluate(node => node.getRootNode().activeElement === node), true);
            await page.keyboard.press('Home');
            assert.equal(await menu.locator('[role="menuitem"]:visible').first().evaluate(node => node.getRootNode().activeElement === node), true);
          } else {
            assert.equal(await menu.getAttribute('role'), 'dialog');
            assert.equal(await menu.getAttribute('aria-modal'), 'true');
            const app = await host.locator(':scope > .app').boundingBox();
            assert.ok(box.x>=app.x&&box.y>=app.y&&box.x+box.width<=app.x+app.width+1);
            assert.ok(box.y+box.height<=app.y+app.height+1);
            assert.equal(await host.locator('.community-menu-close').isVisible(), true);
            await page.keyboard.press('Shift+Tab');
            assert.equal(await menu.locator('button:visible').last().evaluate(node => node.getRootNode().activeElement === node), true);
          }
          await page.screenshot({path:path.join(output, width+'-'+account+'-more.png')});
          await page.keyboard.press('Escape');
          await menu.waitFor({state:'hidden'});
          assert.equal(await more.getAttribute('aria-expanded'), 'false');
          assert.equal(await more.evaluate(node => node.getRootNode().activeElement === node), true);
        });
        await check('Blog and Messages live in More and retain their destinations', async () => {
          const tabs = host.locator('.top .tabs');
          assert.equal(await tabs.locator('[data-view="blog"],[data-view="connect"]').count(), 0);
          for (const [view, route, destination] of [['blog','blog','#communityPane #blogView'],['connect','connect','#connectPane #messagesPanel']]) {
            await more.click();
            await menu.waitFor();
            const item = menu.locator(`[data-quick-view="${view}"]`);
            assert.equal(await item.count(), 1);
            await item.click();
            await page.waitForURL(url => url.searchParams.get('tab') === route);
            await host.locator(destination).waitFor();
            await menu.waitFor({state:'hidden'});
            assert.equal(await more.getAttribute('aria-current'), 'page');
            assert.equal(await tabs.locator('[data-view="blog"],[data-view="connect"]').count(), 0);
            await page.reload();
            await host.locator(destination).waitFor();
            assert.equal(await more.getAttribute('aria-current'), 'page');
          }
          await host.locator('.tab[data-view="feed"]:visible').first().click();
          await page.waitForURL(url => url.searchParams.get('tab') === 'feed');
          assert.equal(await more.getAttribute('aria-current'), 'false');
        });
        await check('outside click closes More and destinations still navigate', async () => {
          await more.click();
          await menu.waitFor();
          const app = await host.locator(':scope > .app').boundingBox();
          await page.mouse.click(app.x+app.width-4, app.y+app.height/2);
          await menu.waitFor({state:'hidden'});
          await more.click();
          assert.equal(await menu.locator('[data-community-extra="people"]').count(),0);
          await menu.locator('[data-community-extra="friends"]').click();
          await page.waitForURL(url => url.searchParams.get('tab') === 'friends');
          await menu.waitFor({state:'hidden'});
        });
        await open('feed');
        await check('Feed spacing after discovery toolbar removal', async () => {
          await page.locator('#communityPane').locator('#feedTitle').waitFor({state:'attached'});
          assert.equal(await host.locator('#localDiscovery,.community-header-location').count(),0);
          if (width <= 800) {
            assert.equal(await host.locator('.community-heading-tools').isVisible(), false);
          }
          if (account === 'business') {
            assert.equal(await host.locator('#communityPane #feedTitle').isVisible(), false);
          }
          if (width > 800) {
            await host.locator('#communityPane #feedComposerCard').waitFor();
            const tabs = await host.locator('.top .tabs').boundingBox();
            const content = await page.locator('#communityPane .native-body').boundingBox();
            assert.ok(content.y-tabs.y-tabs.height <= 36, 'Feed content should sit close below navigation');
          }
        });
        await check('PO photo composer remains available', async () => {
          await page.locator('#communityPane').locator('.feed-media-shortcuts [data-po-route="post"]').click();
          const dialog = host.locator('#editor.community-photo-composer');
          await dialog.waitFor();
          await page.waitForFunction(() => history.state?.communityDetail === true);
          assert.equal(await dialog.locator('.social-media-pick img').count(), 1);
          await dialog.locator('[data-action="social-more-toggle"]').click();
          await dialog.locator('#social-more-sheet').waitFor();
          await dialog.locator('[data-action="social-more-close"]').click();
          await dialog.locator('[data-action="close-dialog"]').click();
          await dialog.waitFor({state:'hidden'});
          // Closing a modal traverses the parent's history asynchronously.
          await page.waitForFunction(() => !history.state?.communityDetail && !document.body.classList.contains('community-detail-open'));
        });
        await check('Connect section headings stay removed', async () => {
          for (const [tab,panel] of [['chatgroups','groups'],['calls','calls'],['contacts','contacts']]) {
            await open(tab);
            const connect = page.locator('#connectPane');
            await connect.locator('#'+panel+'Panel').waitFor();
            assert.equal(await connect.locator('#'+panel+'Panel .screen-title').count(), 0);
          }
        });
        await check('no browser errors', async () => assert.deepEqual(errors, [], 'Community should not raise browser errors'));
      } finally {
        await context.close();
      }
    }
    await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results,null,2));
    assert.equal(results.filter(result => !result.pass).length, 0, 'Browser checks failed; see '+output);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode=1;});
