const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'../../..');
const output=process.env.COMMUNITY_SEARCH_OUTPUT||'/tmp/taxiq-community-search';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.mp4':'video/mp4'};
const server=http.createServer(async(req,res)=>{try{const file=path.resolve(repo,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(repo+path.sep))throw Error('Invalid path');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
(async()=>{
  await fs.mkdir(output,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;const results=[],errors=[];
  try{
    browser=await chromium.launch({headless:true});const origin='http://127.0.0.1:'+server.address().port;
    for(const width of [320,390,834,1280])for(const account of ['business','personal']){
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      try{
        await context.addInitScript(()=>{if(location.protocol==='http:')for(const key of ['nexora-community-tour-mobile-v1','nexora-community-tour-desktop-v1'])localStorage.setItem(key,'1');});
        const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push({width,account,error:error.message}));
        const url=origin+'/html/v3.1/'+(account==='personal'?'staff-community.html?account=personal&role=tech':'community.html?account=business')+'&tab=feed';
        const dialog=page.locator('#community-search-dialog'),feed=page.locator('#communityPane');
        const open=async()=>{if(width<768)await page.locator('.app-area>.header .shell-search-toggle').click();else await page.locator('.app-area>.header input[type="search"]').click();await dialog.waitFor();await page.waitForFunction(()=>window.NEXORA_COMMUNITY_PEOPLE?.list().length>0);await dialog.locator('.community-search-person').first().waitFor();};
        async function check(name,fn){try{await fn();results.push({width,account,name,pass:true});console.log('PASS',width,account,name);}catch(error){results.push({width,account,name,pass:false,error:error.stack});console.log('FAIL',width,account,name,error.message);await page.screenshot({path:path.join(output,`${width}-${account}-${name.replace(/\W+/g,'-')}.png`)}).catch(()=>{});}}
        await page.goto(url,{waitUntil:'domcontentloaded'});await feed.locator('#feedPosts article').first().waitFor();
        await check('header scope, localDiscovery removal, opening and layout',async()=>{
          assert.equal(await page.locator('#localDiscovery,.community-header-location,#mobile-header-search').count(),0);
          assert.equal(await page.locator('.app-area>.header .shell-search-toggle').isVisible(),width<768);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
          await open();assert.equal(await dialog.locator('input').evaluate(el=>el===document.activeElement),true);
          assert.equal(await dialog.getByRole('heading',{name:'Recent',exact:true}).count(),1);
          assert.equal(await dialog.getByRole('heading',{name:'People you may know',exact:true}).count(),1);
          const box=await dialog.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);if(width<=800){assert.equal(box.y,0);assert.equal(Math.round(box.height),900);}
          assert.equal(await dialog.evaluate(el=>el.scrollWidth>el.clientWidth),false);
          await dialog.screenshot({path:path.join(output,`${width}-${account}-search.png`)});
          await dialog.locator('[data-search-back]').click();await dialog.waitFor({state:'hidden'});
        });
        await check('Back and Escape retain the Community route and Feed scroll',async()=>{
          await feed.evaluate(el=>el.querySelector('.native-body').scrollTop=240);
          const scroll=await feed.evaluate(el=>el.querySelector('.native-body').scrollTop),before=page.url();
          await open();await page.goBack();await dialog.waitFor({state:'hidden'});assert.equal(page.url(),before);
          assert.equal(await feed.evaluate(el=>el.querySelector('.native-body').scrollTop),scroll);
          await open();await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(page.url(),before);
        });
        await check('recent actions, text search, request persistence and Remove',async()=>{
          await open();assert.equal(await dialog.locator('[data-search-see-all]').count(),0);await dialog.locator('[data-search-options="setting"]').click();await dialog.locator('[data-search-remove="setting"]').click();assert.equal(await dialog.locator('[data-search-recent="setting"]').count(),0);
          const first=dialog.locator('[data-search-add]').first(),id=await first.getAttribute('data-search-add');await first.click();
          assert.equal(await page.evaluate(id=>window.NEXORA_COMMUNITY_PEOPLE.state().sent.includes(id),id),true);
          assert.equal(await dialog.locator(`[data-search-add="${id}"]`).count(),0);
          const remove=dialog.locator('[data-search-hide]').first(),hidden=await remove.getAttribute('data-search-hide');await remove.click();assert.equal(await dialog.locator(`[data-search-hide="${hidden}"]`).count(),0);
          await dialog.locator('input').fill('Mai');await dialog.locator('input').press('Enter');await dialog.locator('[data-search-person]').first().waitFor();
          assert.match(await dialog.locator('.community-search-body').innerText(),/Mai/);
          await dialog.locator('input').fill('blog');await dialog.locator('[data-search-route="blog"]').waitFor();
          await dialog.locator('[data-search-back]').click();await dialog.waitFor({state:'hidden'});
          await page.reload({waitUntil:'domcontentloaded'});await feed.locator('#feedPosts article').first().waitFor();await open();
          assert.equal(await dialog.locator('[data-search-recent="setting"]').count(),0);assert.equal(await dialog.locator('[data-search-recent="Mai"]').count(),1);
          assert.equal(await page.evaluate(id=>window.NEXORA_COMMUNITY_PEOPLE.state().sent.includes(id),id),true);assert.equal(await dialog.locator(`[data-search-hide="${hidden}"]`).count(),0);
          await dialog.locator('[data-search-back]').click();await dialog.waitFor({state:'hidden'});
        });
        await check('liked posts and Community result navigation',async()=>{
          const like=feed.locator('[data-social-action="like"]').first(),id=await like.getAttribute('data-social-post');if(await like.getAttribute('aria-pressed')!=='true')await like.click();
          await open();await dialog.locator('[data-search-liked]').click();await dialog.locator(`[data-search-post="${id}"]`).waitFor();
          await dialog.locator(`[data-search-post="${id}"]`).click();await dialog.waitFor({state:'hidden'});await feed.locator('[data-social-post-detail]').waitFor();await feed.locator('[data-social-action="close"]').first().click();
          await open();await dialog.locator('input').fill('blog');await dialog.locator('[data-search-route="blog"]').click();await page.waitForURL(url=>url.searchParams.get('tab')==='blog');assert.equal(await dialog.isVisible(),false);
          assert.equal(await page.locator('#localDiscovery,.community-header-location').count(),0);
        });
      }finally{await context.close();}
    }
    const context=await browser.newContext({viewport:{width:390,height:844}});
    try{const page=await context.newPage();for(const entry of ['dashboard.html','nexora-packages.html','pos-front-desk.html','staff-dashboard.html']){await page.goto(origin+'/html/pages/'+entry,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('.header.shell-header'));assert.equal(await page.locator('.app-area>.header .shell-search-toggle').count(),0);results.push({name:'Search hidden: '+entry,pass:true});console.log('PASS Search hidden',entry);}}finally{await context.close();}
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
  console.log('TOTAL',results.filter(row=>row.pass).length+'/'+results.length,'pageErrors='+errors.length);assert.equal(errors.length,0,JSON.stringify(errors));assert.ok(results.every(row=>row.pass),'Search browser regression failed');
})().catch(error=>{console.error(error);process.exitCode=1;});
