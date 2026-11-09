const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5547';
const output=process.env.COMMUNITY_REVIEW_OUTPUT||'/tmp/community-review-ui';
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const browser=await chromium.launch({headless:true}),results=[],errors=[];
 try{
  for(const width of [390,834,1440])for(const account of ['personal','business']){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   try{
    await context.addInitScript(()=>{for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');});
    const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push({width,account,error:e.message}));
    const entry=`${base}/html/v3.1/${account==='personal'?'staff-community.html':'community.html'}?account=${account}`;
    const hub=page.locator('#community-staging,#community-hub'),pane=hub.locator('#communityPane');
    const open=async route=>{await page.goto(entry+'&tab='+route,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub);};
    const check=async(name,run)=>{try{await run();results.push({width,account,name,pass:true});console.log('PASS',width,account,name);}catch(e){results.push({width,account,name,pass:false,error:e.stack});console.log('FAIL',width,account,name,e.message);await page.screenshot({path:path.join(output,`${width}-${account}-${name.replace(/\W/g,'-')}-failed.png`)}).catch(()=>{});}};
    await check('groups recommendations latest and empty state',async()=>{
     await open('groups');const groups=pane.locator('#groupsView');await groups.locator('.community-group-latest').waitFor();
     assert.equal(await groups.locator('.community-group-section>h3').first().innerText(),'Groups for you');
     assert.equal(await groups.locator('.community-group-latest>h3').innerText(),'New group posts');
     assert.ok(await groups.locator('.community-group-posts article').count()>0);
     const article=groups.locator('.community-group-posts article').first();await article.locator('[data-social-action=like]').click();assert.equal(await groups.locator('.community-group-posts article').first().locator('[data-social-action=like]').getAttribute('aria-pressed'),'true');
     await groups.locator('[data-po-my-groups]').click();
     if(account==='personal'){
      await groups.locator('.community-group-empty').waitFor();assert.equal(await groups.locator('.community-group-empty h4').innerText(),'No groups joined yet');
      await groups.locator('.community-group-empty [data-template=group]').click();await pane.locator('#templateForm[data-kind=group]').waitFor();await pane.locator('#closeModal').click();
      await groups.locator('.community-group-empty [data-po-group-discover]').click();
     }else await groups.locator('[data-po-group-discover]').click();
     assert.ok((await groups.locator(':scope>.feature-intro').boundingBox()).height<=115);
     await groups.screenshot({path:path.join(output,`${width}-${account}-groups.png`)});
    });
    await check('market sell save persistence and two columns',async()=>{
     await open('market');const market=pane.locator('#marketView');await market.locator('.feature-intro #createSale').waitFor();
     const hero=market.locator(':scope>.feature-intro'),sale=hero.locator('#createSale');
     const hb=await hero.boundingBox(),sb=await sale.boundingBox();assert.ok(sb.x+sb.width>=hb.x+hb.width-20);assert.ok(hb.height<=115);
     await sale.click();await pane.locator('#listingForm').waitFor();await pane.locator('#closeModal').click();
     const cards=market.locator('#listings>.listing');assert.ok(await cards.count()>1);
     assert.equal(await cards.locator('.chips:visible').count(),0);
     const first=cards.first(),id=await first.getAttribute('data-listing-id');await first.locator('.community-market-save').click();assert.equal(await first.locator('.community-market-save').getAttribute('aria-pressed'),'true');
     const a=await cards.nth(0).boundingBox(),b=await cards.nth(1).boundingBox();assert.ok(Math.abs(a.y-b.y)<2);assert.ok(b.x>=a.x+a.width);assert.ok(Math.abs(a.width-b.width)<2);
     const c=await cards.nth(2).boundingBox();assert.ok(c.y>=a.y+a.height);assert.ok(Math.abs(c.x-a.x)<2);
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     await page.reload();const saved=market.locator(`[data-listing-id="${id}"] .community-market-save`);await saved.waitFor();assert.equal(await saved.getAttribute('aria-pressed'),'true');await saved.click();assert.equal(await saved.getAttribute('aria-pressed'),'false');
     await market.screenshot({path:path.join(output,`${width}-${account}-market.png`)});
    });
    await check('Fanpage navigation latest posts and page links',async()=>{
     await open('pages');const pages=pane.locator('#pagesView');await pages.locator('#pageLatestPosts article').first().waitFor();
     assert.ok((await hub.locator('[data-i18n=pages]').allTextContents()).every(text=>text==='Fanpage'));
     assert.equal(await pages.locator('#pageLatestTitle').innerText(),'New posts from Pages');
     assert.ok((await pages.locator(':scope>.feature-intro').boundingBox()).height<=115);
     await pages.locator('#pageLatestPosts [data-open-page]').first().click();await pane.locator('[data-page-detail-id]').waitFor();
     await open('pages');await pages.locator('#pageLatestPosts article').first().waitFor();await pages.screenshot({path:path.join(output,`${width}-${account}-pages.png`)});
    });
    await check('storefront service tool add edit and compact layout',async()=>{
     await open('shop');const shop=hub.locator('.community-extra-pane #page-view');await shop.locator('.store-section-title').first().waitFor();
     const section=shop.locator('.store-section-title:has([data-action=shop-add-product])').first();
     const heading=await section.locator('h2').boundingBox(),button=await section.locator('button').boundingBox();assert.ok(button.x>heading.x+heading.width-2);assert.ok(button.y<heading.y+heading.height+12);
     const tiles=await shop.locator('.store-connect').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));assert.ok(tiles.length>=6&&tiles.every(height=>height<=58));
     assert.ok(await shop.locator('[data-action=shop-add-service]').count()>0);
     await shop.locator('.store-tool-grid [data-action=shop-add-service]').first().click();const form=hub.locator('.community-extra-pane #item-form');await form.waitFor();assert.equal(await form.locator('[name=kind]').inputValue(),'service');
     await form.locator('[name=title]').fill('QA service '+width);await form.locator('[name=description]').fill('QA service details');await form.locator('[name=shareFeed]').uncheck();await form.locator('[type=submit]').click();await hub.locator('.community-extra-pane #editor').waitFor({state:'hidden'});
     await page.reload();await shop.locator('.store-item').filter({hasText:'QA service '+width}).waitFor();
     await shop.locator('[data-shop-filter=service]').click();assert.ok((await shop.locator('.store-item').allTextContents()).some(text=>text.includes('QA service '+width)));
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     await shop.screenshot({path:path.join(output,`${width}-${account}-shop.png`)});
    });
   }finally{await context.close();}
  }
 }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
 console.log('TOTAL',results.filter(r=>r.pass).length+'/'+results.length,'errors='+errors.length);process.exitCode=results.some(r=>!r.pass)||errors.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
