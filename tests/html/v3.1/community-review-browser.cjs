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
     const location=hub.locator('#communityLocation');if(await location.isVisible()){
      const box=await location.boundingBox();assert.ok(box.height<=26&&box.width<=145,JSON.stringify(box));
      const title=await hub.locator('.community-heading h1:visible').boundingBox(),create=await hub.locator('#communityCreate').boundingBox();
      assert.ok(Math.abs(create.y+create.height/2-(title.y+box.y+box.height)/2)<4);
      await location.click();await pane.locator('#viewerLocationTitle').waitFor();await pane.locator('#closeModal').click();
     }
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
     await hub.locator('.community-nav-more:visible').first().click();const menu=hub.locator('#ecosystemMenu');await menu.waitFor();
     assert.equal(await menu.locator('[data-community-extra="people"]').count(),0);
     assert.equal(await menu.locator('[data-community-extra="explore"]').count(),0);
     const tools=menu.locator('[data-community-menu-group=tools] .ecosystem-item');
     assert.equal(await tools.count(),7);
     const menuURL=page.url();
     for(const tile of await tools.all()){
      assert.equal(await tile.isDisabled(),true);assert.equal(await tile.getAttribute('aria-disabled'),'true');
      assert.equal(await tile.locator('img').count(),1);assert.ok((await tile.innerText()).trim());
      await tile.scrollIntoViewIfNeeded();const box=await tile.locator('.ecosystem-item-icon').boundingBox();
      await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
      assert.equal(page.url(),menuURL);assert.equal(await menu.isVisible(),true);
     }
     assert.equal(await hub.locator('#tourCard:visible,.community-assistant-overlay:visible').count(),0);

     await menu.locator('[data-community-extra="friends"]').click();await page.waitForURL(url=>url.searchParams.get('tab')==='friends');await menu.waitFor({state:'hidden'});
    });
    await check('market sell save persistence and two columns',async()=>{
     await open('market');const market=pane.locator('#marketView');await market.locator('#tabButtons #createSale').waitFor();
     const hero=market.locator(':scope>.feature-intro'),sale=market.locator('#tabButtons #createSale');
     await hero.locator('[data-template="group"]').click();await pane.locator('#templateForm[data-kind=group]').waitFor();await pane.locator('#closeModal').click();
     assert.equal(await hero.locator('#createSale').count(),0);
     assert.equal(await market.locator('[data-market-info-toggle]').count(),0);
     assert.deepEqual(await market.locator('#tabButtons [data-tab]').evaluateAll(nodes=>nodes.map(node=>node.dataset.tab)),['all','sale','want']);
     const tabBox=await market.locator('#tabButtons [data-tab=all]').boundingBox(),saleBox=await sale.boundingBox();assert.ok(Math.abs(tabBox.y-saleBox.y)<6);
     for(const tab of ['sale','want','all']){await market.locator('#tabButtons [data-tab='+tab+']').click();await sale.waitFor();}
     const search=market.locator('#searchInput'),searchButton=market.locator('#marketSearchButton');
     const inputBox=await search.boundingBox(),searchBox=await searchButton.boundingBox();assert.ok(searchBox.x>=inputBox.x+inputBox.width);assert.ok(Math.abs(searchBox.y-inputBox.y)<6);
     await search.fill('zz-no-market-result-zz');await searchButton.click();await market.locator('#listings .empty').waitFor();
     await search.fill('');await searchButton.click();
     const photos=market.locator('#listings>.listing>.listing-photo');assert.equal(await photos.count(),await market.locator('#listings>.listing').count());
     await photos.evaluateAll(async nodes=>{await Promise.all(nodes.map(image=>{image.loading='eager';return image.decode();}));});
     assert.ok(await photos.evaluateAll(nodes=>nodes.every(image=>image.naturalWidth>0&&getComputedStyle(image).objectFit==='contain')));
     await sale.click();await pane.locator('#listingForm').waitFor();await pane.locator('#closeModal').click();
     const cards=market.locator('#listings>.listing');assert.ok(await cards.count()>1);
     assert.equal(await cards.locator('.chips:visible').count(),0);
     await page.waitForFunction(()=>[...document.querySelectorAll('#marketView #listings .listing-actions>.btn')].every(button=>button.querySelector('svg,img')));
     const actions=await cards.locator('.listing-actions>.btn').evaluateAll(nodes=>nodes.map(node=>({height:node.getBoundingClientRect().height,label:node.textContent.trim(),icon:!!node.querySelector('svg,img')})));
     assert.ok(actions.length>0&&actions.every(action=>action.height<=28&&action.label&&action.icon),JSON.stringify(actions));
     const contact=cards.locator('[data-action=contact]').first(),contactBox=await contact.boundingBox(),saveBox=await contact.locator('..').locator('.community-market-save').boundingBox();assert.ok(Math.abs(contactBox.y-saveBox.y)<2);
     const first=cards.first(),id=await first.getAttribute('data-listing-id');await first.locator('.community-market-save').click();assert.equal(await first.locator('.community-market-save').getAttribute('aria-pressed'),'true');
     const a=await cards.nth(0).boundingBox(),b=await cards.nth(1).boundingBox();assert.ok(Math.abs(a.y-b.y)<2);assert.ok(b.x>=a.x+a.width);assert.ok(Math.abs(a.width-b.width)<2);
     const c=await cards.nth(2).boundingBox();assert.ok(c.y>=a.y+a.height);assert.ok(Math.abs(c.x-a.x)<2);
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     await page.reload();const saved=market.locator(`[data-listing-id="${id}"] .community-market-save`);await saved.waitFor();assert.equal(await saved.getAttribute('aria-pressed'),'true');await saved.click();assert.equal(await saved.getAttribute('aria-pressed'),'false');
     await market.screenshot({path:path.join(output,`${width}-${account}-market.png`)});
    });
    await check('Jobs role tabs stay compact on one horizontal row',async()=>{
     await open('jobs');const jobs=pane.locator('#jobsView'),nav=jobs.locator('.jobs-nav');await nav.waitFor();
     const sizes=await nav.locator('.jobs-tab').evaluateAll(nodes=>nodes.map(node=>{const rect=node.getBoundingClientRect();return {y:rect.y,height:rect.height,width:rect.width,label:node.textContent.trim(),icon:!!node.querySelector('img,svg')};}));
     assert.ok(sizes.length>=6&&sizes.every(tab=>tab.height<=30&&Math.abs(tab.y-sizes[0].y)<2&&tab.label&&tab.icon),JSON.stringify(sizes));
     assert.ok(new Set(sizes.map(tab=>Math.round(tab.width))).size>1);
     await nav.locator('[data-jobs-tab=myPosts]').click();await jobs.locator('[data-jobs-post-status]').first().waitFor();
     await nav.locator('[data-jobs-tab=browse]').click();await jobs.locator('#jobPosts').waitFor();
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     await nav.screenshot({path:path.join(output,`${width}-${account}-jobs-tabs.png`)});
    });
    await check('Business identity uses salon logo in composer live and profile',async()=>{
     const openComposer=async()=>{const create=hub.locator('#communityCreate');if(await create.isVisible()){await create.click();await hub.locator('#communityCreateMenu [data-create-kind=photos]').click();}else await pane.locator('#feedComposerCard .feed-prompt').click();};
     await open('feed');await openComposer();
     const extra=hub.locator('.community-extra-pane'),editor=extra.locator('#editor[open]');await editor.locator('.social-identity').waitFor();
     const avatar=editor.locator('.social-identity .compose-avatar');
     assert.equal((await avatar.evaluate(node=>getComputedStyle(node).backgroundImage)).includes('nexora-bitcoin-nailbar.png'),account==='business');
     await editor.screenshot({path:path.join(output,`${width}-${account}-composer-avatar.png`)});
     await editor.locator('[data-action=close-dialog]').first().click();
     await openComposer();await editor.locator('.social-add-more').click();await editor.locator('[data-action=social-more-live]').click();
     await editor.locator('.social-live-avatar').waitFor();assert.equal((await editor.locator('.social-live-avatar').evaluate(node=>getComputedStyle(node).backgroundImage)).includes('nexora-bitcoin-nailbar.png'),account==='business');
     await editor.locator('[data-action=close-dialog]').first().click();
     await open('privacy');const profile=hub.locator('#connectPane #privacyPanel .person .avatar');await profile.waitFor();
     assert.equal((await profile.evaluate(node=>getComputedStyle(node).backgroundImage)).includes('nexora-bitcoin-nailbar.png'),account==='business');
    });
    await check('Reels keeps five working shortcuts without social actions',async()=>{
     await open('reels');const extra=hub.locator('.community-extra-pane'),nav=extra.locator('.community-reels-shortcuts');await nav.waitFor();
     assert.equal(await nav.locator('button').count(),5);assert.equal(await nav.locator('button').nth(4).getAttribute('aria-current'),'page');
     await extra.locator('video').first().waitFor();
     assert.ok((await extra.locator('.reels-hero').boundingBox()).height<=115);
     await extra.locator('.reels-hero [data-feed-kind=reel]').click();await extra.locator('#editor[open]').waitFor();await extra.locator('#editor [data-action=close-dialog]').first().click();
     assert.equal(await extra.locator('[data-expansion-reel-like],[data-expansion-reel-comment],[data-expansion-reel-share]').count(),0);
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     await page.screenshot({path:path.join(output,`${width}-${account}-reels.png`)});
     for(const [index,route] of [[0,'feed'],[1,'pages'],[2,'shop'],[3,'deals']]){
      await nav.locator('button').nth(index).click();await page.waitForFunction(route=>new URL(location.href).searchParams.get('tab')===route,route);
      await open('reels');await nav.waitFor();
     }
    });
    await check('Community rooms samples open chat and return',async()=>{
     await open('live');const extra=hub.locator('.community-extra-pane'),cards=extra.locator('.live-card');await cards.first().waitFor();
     assert.equal(await cards.count(),7);assert.equal(await extra.getByText('No live rooms yet. Create a room.',{exact:true}).count(),0);
     await extra.locator('.live-hero [data-feed-kind=video]').click();const videoForm=extra.locator('#feed-form');await videoForm.waitFor();
     assert.equal(await videoForm.locator('[name=kind]').inputValue(),'video');
     assert.equal(await videoForm.locator('select[name=pageId]').count(),account==='personal'?0:1);
     assert.equal(await videoForm.locator('[name=media]').getAttribute('accept'),'video/*');
     await extra.locator('#editor [data-action=close-dialog]').first().click();
     assert.ok((await cards.allTextContents()).every(text=>text.includes('SAMPLE ROOM')));
     const photos=cards.locator('.live-card-cover img');await photos.evaluateAll(async nodes=>Promise.all(nodes.map(image=>image.decode())));
     await cards.first().locator('[data-live-open]').click();await extra.locator('#live-chat-form').waitFor();
     await extra.locator('#live-chat-form [name=message]').fill('QA sample room message');await extra.locator('#live-chat-form button').click();
     assert.ok((await extra.locator('.live-chat-list').innerText()).includes('QA sample room message'));
     await extra.locator('[data-action=live-back]').click();await cards.first().waitFor();
     await cards.nth(1).locator('[data-live-open]').click();await extra.locator('#live-chat-form').waitFor();await extra.locator('[data-action=live-back]').click();
     await page.screenshot({path:path.join(output,`${width}-${account}-live.png`)});
    });
    await check('News and Blog use local icons and retain tab navigation',async()=>{
     await open('news');const news=hub.locator('.community-extra-pane .news-mode-tabs');await news.waitFor();
     assert.equal(await news.locator('img').count(),2);await news.locator('img').evaluateAll(async nodes=>Promise.all(nodes.map(image=>image.decode())));
     await news.locator('[data-news-mode=blog]').click();const blog=pane.locator('#blogView .community-news-tabs');await blog.waitFor();
     assert.equal(await blog.locator('img').count(),2);await blog.locator('img').evaluateAll(async nodes=>Promise.all(nodes.map(image=>image.decode())));
     assert.equal(await blog.locator('[data-community-news-tab=blog]').getAttribute('aria-selected'),'true');
     await blog.screenshot({path:path.join(output,`${width}-${account}-news-blog-tabs.png`)});
     await blog.locator('[data-community-news-tab=news]').click();await news.waitFor();
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
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
     if(account==='personal')assert.equal((await shop.locator('.store-setup-top strong').innerText()).trim(),'3/6');
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
     await open('feed');await pane.locator('#communityPOPeople .people-card').first().waitFor();
     const peopleButtons=await pane.locator('#communityPOPeople .people-card .people-actions button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
     assert.ok(peopleButtons.length>0&&peopleButtons.every(height=>height<=28));
     if(account==='business'){
      await open('feed');const sample=pane.locator('[data-feed-post-id="sample-store-design"]');await sample.waitFor();
      assert.equal(await sample.locator('.community-social-gallery:visible').count(),0);
      assert.equal(await sample.locator('.community-feed-post-byline .community-feed-post-location').innerText(),'Houston, TX');
      assert.equal(await sample.locator(':scope > .chips').getByText('Houston, TX',{exact:true}).count(),0);
      const timeBox=await sample.locator('.community-feed-post-byline time').boundingBox(),placeBox=await sample.locator('.community-feed-post-location').boundingBox();assert.ok(Math.abs(timeBox.y-placeBox.y)<3);
      await pane.locator('[data-feed-post-id="sample-store-design"]').screenshot({path:path.join(output,`${width}-business-sample-photo.png`)});
     }

    });
   }finally{await context.close();}
  }
 }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
 console.log('TOTAL',results.filter(r=>r.pass).length+'/'+results.length,'errors='+errors.length);process.exitCode=results.some(r=>!r.pass)||errors.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
