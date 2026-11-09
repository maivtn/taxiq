const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5503';
const output=process.env.COMMUNITY_DISCOVERY_OUTPUT||'/tmp/community-discovery-samples';
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'chrome',args:['--mute-audio']}),results=[],errors=[];
 try{
  for(const width of [390,1280])for(const account of ['personal','business']){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   try{
    await context.addInitScript(()=>{for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');});
    const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push({width,account,error:e.message}));
    const entry=`${base}/html/v3.1/${account==='personal'?'staff-community.html':'community.html'}?account=${account}&jobsTab=${account==='personal'?'browse':'workers'}&shiftTab=my-shifts`;
    const host=page.locator('#community-staging,#community-hub'),feed=host.locator('#communityPane #feedView');
    const open=async(tab='feed')=>{await page.goto(entry+'&tab='+tab,{waitUntil:'domcontentloaded'});await host.locator('.community-nav-more:visible').first().waitFor();};
    const ready=async()=>{await feed.locator('#communityPOReels .reel-mini').last().waitFor();await feed.locator('.page-discovery-card').first().waitFor();};
    const check=async(name,run)=>{try{await run();results.push({width,account,name,pass:true});console.log('PASS',width,account,name);}catch(e){results.push({width,account,name,pass:false,error:e.stack});console.log('FAIL',width,account,name,e.message);await page.screenshot({path:path.join(output,`${width}-${account}-${name.replace(/\W/g,'-')}-failed.png`)}).catch(()=>{});}};
    const play=async(root,id)=>{const video=root.locator(`video[data-reel-view="${id}"]`);await video.evaluate(node=>{node.muted=true;});await root.locator(`[data-reel-play="${id}"]`).click();await page.waitForFunction(id=>[...document.querySelectorAll('video[data-reel-view]')].some(video=>video.dataset.reelView===id&&!video.paused&&video.currentTime>0),id);await video.evaluate(node=>node.pause());};
    await check('Feed and Reels show four playable samples',async()=>{
     await open(account==='personal'?'feed':'jobs');
     if(account==='business'){assert.equal(new URL(page.url()).searchParams.get('tab'),'jobs');await host.locator('.tab[data-view="feed"]:visible').first().click();}
     await ready();const clips=feed.locator('#communityPOReels .reel-mini');assert.equal(await clips.count(),4);
     const ids=await clips.locator('video').evaluateAll(nodes=>nodes.map(node=>node.dataset.reelView));assert.equal(new Set(ids).size,4);
     assert.equal(await clips.locator('.reel-mini-sample').count(),4);
     for(const id of ids)await play(feed.locator('#communityPOReels'),id);
     await feed.locator('#communityPOReels').screenshot({path:path.join(output,`${width}-${account}-reels-feed.png`)});
     await feed.locator('#communityPOReels [data-section="reels"]').click();const reels=host.locator('.community-extra-pane');await reels.locator('.reels-hero').waitFor();
     assert.equal(await reels.locator('.reel-showcase-card').count(),4);assert.equal(await reels.locator('.reel-sample-label').count(),4);
     await play(reels,'demo-reel-colors');await open();await ready();assert.equal(await clips.count(),4);
    });
    await check('Six nearby Page cards load images and open their matching records',async()=>{
     await open();await ready();const cards=feed.locator('.page-discovery-card');assert.equal(await cards.count(),6);
     const items=await cards.evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.footerPage,title:node.querySelector('strong').textContent.trim(),cover:getComputedStyle(node.querySelector('.page-discovery-photo')).backgroundImage.match(/url\(["']?(.*?)["']?\)$/)?.[1]})));
     assert.equal(new Set(items.map(item=>item.id)).size,6);assert.ok(items.every(item=>item.title&&item.cover));
     await page.evaluate(async items=>{await Promise.all(items.map(item=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(Error('Cover failed: '+item.id));image.src=item.cover;})));},items);
     await feed.locator('.page-discovery-feed').screenshot({path:path.join(output,`${width}-${account}-pages-nearby.png`)});
     for(const {id} of items){await feed.locator(`[data-footer-page="${id}"]`).click();await page.waitForURL(url=>url.searchParams.get('pageId')===id);await host.locator(`[data-page-detail-id="${id}"]`).waitFor();await open();await ready();}
     await feed.locator('[data-footer-route="pages"]').click();await host.locator('#pagesView #pageCards>.page-card').first().waitFor();assert.equal(new URL(page.url()).searchParams.get('tab'),'pages');
    });
    await check('Existing Page edits survive seed migration and reload',async()=>{
     await open();await ready();
     await page.evaluate(()=>{const w=document.querySelector('#communityPane').communityModule.window,key='nexora-community-templates-v1',data=JSON.parse(w.localStorage.getItem(key));data.pages=data.pages.filter(page=>page.id!=='sample-community');const page=data.pages.find(page=>page.id==='p3');page.title='Saved "Lotus" & friends';page.description='Saved description';data.pages.push({...page,id:'qa-owned-page',title:'Saved custom Page',isSample:false});w.localStorage.setItem(key,JSON.stringify(data));});
     await page.reload({waitUntil:'domcontentloaded'});await ready();
     assert.equal(await feed.locator('[data-footer-page="p3"] strong').innerText(),'Saved "Lotus" & friends');
     const saved=await page.evaluate(()=>{const w=document.querySelector('#communityPane').communityModule.window;return JSON.parse(w.localStorage.getItem('nexora-community-templates-v1')).pages;});
     assert.equal(saved.filter(page=>page.id==='sample-community').length,1);assert.equal(saved.filter(page=>page.id==='qa-owned-page').length,1);assert.equal(saved.find(page=>page.id==='p3').description,'Saved description');
     assert.equal(await feed.locator('.page-discovery-card').count(),6);assert.equal(await feed.locator('#communityPOReels .reel-mini').count(),4);
    });
   }finally{await context.close();}
  }
 }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
 console.log('TOTAL',results.filter(row=>row.pass).length+'/'+results.length,'errors='+errors.length);process.exitCode=results.some(row=>!row.pass)||errors.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
