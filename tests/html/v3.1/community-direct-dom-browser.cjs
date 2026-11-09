const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5504';
const output=process.env.COMMUNITY_TEST_EVIDENCE||'/tmp/community-direct-dom';
(async()=>{
  await fs.mkdir(output,{recursive:true});
  const browser=await chromium.launch({headless:true}),results=[],errors=[];
  try{
    for(const width of [390,1280])for(const account of ['business','personal']){
      const context=await browser.newContext({viewport:{width,height:900}});
      try{
        await context.addInitScript(()=>{for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');});
        const page=await context.newPage();page.setDefaultTimeout(15000);
        page.on('pageerror',e=>errors.push({width,account,error:e.message}));
        page.on('request',request=>{if(request.resourceType()==='fetch'&&/\.html(?:\?|$)/.test(request.url()))errors.push({width,account,error:'Unexpected HTML embedding: '+request.url()});});
        page.on('console',message=>{if(message.type()==='error'&&/Community (pane|addition)|native shell/.test(message.text()))errors.push({width,account,error:message.text()});});
        const entry=base+'/html/v3.1/'+(account==='personal'?'staff-community.html':'community.html')+'?account='+account;
        const hub=page.locator('#community-staging,#community-hub'),feed=hub.locator('#communityPane');
        async function open(route){await page.goto(entry+'&tab='+route,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub);}
        async function check(name,fn){try{await fn();results.push({width,account,name,pass:true});console.log('PASS',width,account,name);}catch(e){results.push({width,account,name,pass:false,error:e.stack});console.log('FAIL',width,account,name,e.message.slice(0,350));await page.screenshot({path:path.join(output,`${width}-${account}-${name.replace(/\W+/g,'-')}.png`)}).catch(()=>{});}}
        await check('Feed footer, three page links and reload',async()=>{
          await open('feed');await feed.locator('#communityPOPeople .people-card').first().waitFor();
          assert.equal(await feed.evaluate(el=>el.tagName),'SECTION');assert.equal(page.frames().length,1);
          assert.equal(await feed.evaluate(el=>el.shadowRoot===null&&!el.hasAttribute('src')&&!el.hasAttribute('data-src')),true);
          assert.equal(await page.evaluate(()=>!!document.querySelector('#communityPane #feedTitle')),true);
          const footer=feed.locator('#communityFeedFooter');await footer.scrollIntoViewIfNeeded();
          assert.equal(await footer.locator('.page-discovery-card').count(),3);await footer.screenshot({path:path.join(output,`${width}-${account}-footer.png`)});
          for(const id of ['sample-food','sample-cafe','sample-nail']){
            await feed.locator(`[data-footer-page="${id}"]`).click();await page.waitForURL(url=>url.searchParams.get('pageId')===id);
            await feed.locator(`[data-page-detail-id="${id}"]`).waitFor();assert.equal(page.frames().length,1);
            await page.reload();await feed.locator(`[data-page-detail-id="${id}"]`).waitFor();await open('feed');await footer.waitFor();
          }
          await feed.locator('[data-footer-route="pages"]').click();await page.waitForURL(url=>url.searchParams.get('tab')==='pages');await feed.locator('#pageCards .page-card').first().waitFor();
        });
        for(const route of ['groups','market','pages','jobs','shift','blog','connect','contacts','chatgroups','calls','privacy','friends','reels','live','news','wallet','wheel','meet','account','notifications','stories','people',...(account==='business'?['shop','transfer']:[])])await check('direct '+route,async()=>{
          await open(route);
          if(['connect','contacts','chatgroups','calls','privacy'].includes(route))await hub.locator('#connectPane .native-body').waitFor();
          else if(['groups','market','pages','jobs','shift','blog','transfer'].includes(route))await feed.locator('#'+({shift:'daywork',transfer:'jobs'}[route]||route)+'View').waitFor();
          else await hub.locator('.community-extra-pane > section:visible').waitFor();
          assert.equal(page.frames().length,1);assert.equal(await hub.locator('iframe').count(),0);
          assert.equal(await hub.locator('[data-community-region]').evaluateAll(nodes=>nodes.some(node=>node.shadowRoot)),false);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        });
        await check('Deals tabs and business modules',async()=>{
          await open('deals');
          await feed.locator('[data-deal-route="nearby"]').waitFor();
          for(const route of ['nearby','match','opening','wallet',...(account==='business'?['campaign','redeem']:[])]){
            const button=feed.locator('[data-deal-route="'+route+'"]');
            if(!(await button.isVisible()))await feed.locator('.community-deals-business summary').click();
            await button.click();await feed.locator('.community-deals-frame:visible .native-body').waitFor();
            assert.equal(page.frames().length,1);assert.equal(await feed.locator('iframe').count(),0);
          }
        });
        await check('Footer Live News and Food, Back to Feed',async()=>{
          for(const route of ['live','news','food']){
            await open('feed');await feed.locator('[data-footer-route="'+route+'"]').click();await page.waitForURL(url=>url.searchParams.get('tab')===route);
            if(route==='food'){await hub.locator('.community-document-pane iframe').waitFor();await page.frameLocator('.community-document-pane iframe').locator('#hero').waitFor();}
            else await hub.locator(route==='live'?'.live-hero':'.news-hero').waitFor();
            await hub.locator('.community-back-to-feed').click();await page.waitForURL(url=>url.searchParams.get('tab')==='feed');await feed.locator('#communityFeedFooter').waitFor();
          }
        });
        await check('Real Estate iframe and Back',async()=>{
          await open('realestate');await hub.locator('.community-document-pane iframe').waitFor();await page.frameLocator('.community-document-pane iframe').locator('.hero').waitFor();
          assert.equal(page.frames().length,2);await hub.locator('.community-back-to-feed').click();await feed.locator('#feedView').waitFor();
        });
      }finally{await context.close();}
    }
  }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
  console.log('TOTAL',results.filter(x=>x.pass).length+'/'+results.length,'errors='+errors.length);process.exitCode=results.some(x=>!x.pass)||errors.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
