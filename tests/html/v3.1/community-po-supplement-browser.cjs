/* PO supplement regression. Run after committing; all browser contexts are isolated and headless. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5503';
const output=process.env.COMMUNITY_PO_OUTPUT||'/tmp/community-po-supplement-qa';
const results=[],errors=[];
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
 try{
  for(const width of [390,834,1440]){
   const context=await browser.newContext({viewport:{width,height:960}});
   try{
    await context.addInitScript(()=>{for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');});
    const page=await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',error=>errors.push({width,message:error.message}));
    async function open(tab,account='business',extra=''){
     const file=account==='personal'?'staff-community.html':'community.html';
     await page.goto(base+'/html/v3.1/'+file+'?tab='+tab+'&account='+account+extra,{waitUntil:'domcontentloaded'});
     await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub);
    }
    async function check(name,fn){try{await fn();results.push({width,name,pass:true});console.log('PASS',width,name);}catch(error){results.push({width,name,pass:false,error:error.stack});console.log('FAIL',width,name,error.message.slice(0,500));await page.screenshot({path:path.join(output,width+'-'+name.replace(/\W/g,'-')+'-failure.png')}).catch(()=>{});}}
    await check('CN02 save image and identity reload',async()=>{
     await open('account','personal');const form=page.locator('[data-platform-profile]');await form.waitFor();
     const before=await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.me());
     await form.locator('[name=name]').fill('Brian Nguyen');await form.locator('[name=displayNickname]').fill('Brian Nguyễn AI');await form.locator('[name=bio]').fill('Founder VLINKPAY');
     const image=path.resolve(__dirname,'../../..','html/assets/icon-oneqr/issue-2040-oneqr-camera-3d.png');
     for(const field of ['avatar','cover']){const chooser=page.waitForEvent('filechooser');await form.locator('[data-profile-pick='+field+']').click();await (await chooser).setFiles(image);}
     await form.locator('[type=submit]').click();await page.waitForFunction(()=>document.querySelector('[data-platform-profile] [role=status]')?.textContent.includes('saved'));
     await page.reload();await form.waitFor();assert.equal(await form.locator('[name=displayNickname]').inputValue(),'Brian Nguyễn AI');
     const after=await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.me());assert.equal(after.id,before.id);assert.equal(after.nickname,before.nickname);assert.ok(after.avatar&&after.cover);
     await form.locator('[name=displayNickname]').fill('');await form.locator('[type=submit]').click();await page.waitForFunction(()=>document.querySelector('[data-platform-profile] [role=status]')?.textContent.includes('saved'));
     assert.equal(await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.me().displayName),'Brian Nguyen');await page.screenshot({path:path.join(output,width+'-profile.png')});
    });
    await check('Personal Page classification create and edit',async()=>{
     await open('pages','personal');await page.locator('#pageCards').waitFor();await page.locator('[data-template=page]:visible').first().click();const form=page.locator('#templateForm[data-kind=page]');
     await form.locator('[name=pageType][value=personal]').check();assert.equal(await form.locator('[name=industry]').isDisabled(),true);
     await form.locator('[name=title]').fill('BrianNguyenAI '+width);await form.locator('[name=handle]').fill('@brian.ai.'+width);await form.locator('[type=submit]').click();
     await page.locator('.po-page-supplement').waitFor();assert.ok((await page.locator('.page-profile-title').innerText()).includes('Personal / Creator Page'));
     await page.locator('.page-hero-actions [data-edit-page]').click();const edit=page.locator('#pageEditForm');await edit.waitFor();await edit.locator('[name=title]').fill('BrianNguyenAI edited '+width);await edit.locator('[type=submit]').click();await page.locator('.po-page-supplement').waitFor();assert.ok((await page.locator('#pageDetailTitle').innerText()).includes('edited'));
     await page.reload();await page.locator('.po-page-supplement').waitFor();assert.equal(await page.locator('[data-page-tab=services]').count(),0);
     await page.locator('[data-page-tab=about]').click();assert.equal((await page.locator('.page-tab-content').innerText()).includes('SIPOS'),false);assert.equal((await page.locator('.page-tab-content').innerText()).includes('Address & directions'),false);
    });
    await check('Page shared composer draft publish edit privacy',async()=>{
     await open('pages','business','&pageId=p1&pageMode=view&pageTab=posts');await page.locator('.po-page-supplement').waitFor();await page.locator('.page-hero-actions [data-po-page-action=compose]').click();const form=page.locator('[data-unified-composer]');await form.waitFor();
     await form.locator('[name=title]').fill('PO draft '+width);await form.locator('[name=body]').fill('Shared Page composer content');await form.locator('[name=publishAction][value=draft]').click();
     await page.locator('[data-po-page-action=edit-post]').filter({hasText:'Open draft'}).first().waitFor();
     const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('nexora-community-templates-v1')).pagePosts.find(row=>row.status==='draft'&&row.title.startsWith('PO draft')));assert.equal(record.pageId,'p1');
     await page.locator('[data-po-page-action=edit-post][data-value="'+record.id+'"]').click();await form.waitFor();assert.equal(await form.locator('[name=title]').inputValue(),'PO draft '+width);
     await form.locator('#social-visibility-button').click();await form.locator('[data-visibility-choice=private]').click();await form.locator('[name=publishAction][value=published]').click();await page.locator('[data-feed-post-id="'+record.id+'"]').waitFor();
     await page.locator('[data-po-page-action=edit-post][data-value="'+record.id+'"]').click();await form.waitFor();assert.equal(await form.locator('[name=visibility]').inputValue(),'private');await page.locator('.social-close').click();
     await open('pages','personal','&pageId=p1&pageMode=view&pageTab=posts');await page.locator('.po-page-supplement').waitFor();assert.equal(await page.locator('[data-feed-post-id="'+record.id+'"]').count(),0);
    });
    await check('BITCOIN PO tabs and contacts',async()=>{
     await open('pages','personal','&pageId=p1&pageMode=view&pageTab=posts');await page.locator('.po-page-supplement').waitFor();
     const actionBoxes=await page.locator('.page-hero-actions button').evaluateAll(nodes=>nodes.map(node=>{const rect=node.getBoundingClientRect();return {top:rect.top,width:rect.width};}));
     assert.ok(actionBoxes.slice(0,3).every(box=>Math.abs(box.top-actionBoxes[0].top)<2));assert.ok(actionBoxes[3].top>actionBoxes[0].top&&actionBoxes[3].width>actionBoxes[0].width*2);
     await page.screenshot({path:path.join(output,width+'-page-posts.png')});
     await page.locator('[data-po-page-action=contact]').click();await page.locator('.po-contact-menu').waitFor();assert.ok((await page.locator('.po-contact-menu').innerText()).includes('(346) 802-4906'));await page.locator('#closeModal').click();
     for(const tab of ['about','services','reviews','offers','events','videos']){await page.locator('[data-page-tab='+tab+']').click();await page.locator('[data-page-tab='+tab+'][aria-selected=true]').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(output,width+'-page-'+tab+'.png')});}
     await page.locator('[data-page-tab=about]').click();assert.ok((await page.locator('.page-tab-content').innerText()).includes('9793 Westheimer Rd'));
    });
    await check('Live purpose setup tools poll and reload',async()=>{
     await open('live','business','&composeLive=1');const setup=page.locator('[data-live-po-form=setup]');await setup.waitFor();
     const checks=await setup.locator('[name=destinations]').evaluateAll(nodes=>nodes.map(n=>n.checked));assert.ok(checks.length>=2&&checks.every(Boolean));
     await setup.locator('[name=title]').fill('PO Live '+width);await setup.locator('[data-live-po=purpose]').click();await page.locator('[data-live-po=pick-purpose][data-live-value=tutorial]').click();await page.locator('[data-live-po=return-setup]').click();await setup.locator('[type=submit]').click();
     await page.locator('.lv-stage').waitFor();await page.screenshot({path:path.join(output,width+'-live-host.png')});
     await page.locator('[data-live-po=panel][data-live-value=tools]').click();await page.locator('.lv-dialog').waitFor();await page.locator('.lv-dialog [data-live-po=panel][data-live-value=poll]').click();
     const poll=page.locator('[data-live-po-form=poll]');await poll.locator('[name=question]').fill('Which nail set?');await poll.locator('[name=choice]').nth(0).fill('French');await poll.locator('[name=choice]').nth(1).fill('Gel');await poll.locator('[type=submit]').click();await page.locator('.lv-dialog .lv-poll-row').first().waitFor();await page.locator('[data-live-po=close]').click();
     await page.locator('[data-live-po=viewer]').click();await page.locator('[data-live-po=vote][data-live-value="0"]').click();assert.equal(await page.locator('[data-live-po=vote][data-live-value="0"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-live-po=vote][data-live-value="1"]').isDisabled(),true);
     await page.locator('[data-live-po=host]').click();await page.locator('[data-live-po=panel][data-live-value=tools]').click();await page.locator('.lv-dialog [data-live-po=panel][data-live-value=flash]').click();const flash=page.locator('[data-live-po-form=flash]');await flash.locator('[name=name]').fill('Flash Deal −20% Gel Manicure');await flash.locator('[name=limit]').fill('5');await flash.locator('[type=submit]').click();await page.locator('.lv-dialog [data-lv-flash]').waitFor();await page.locator('[data-live-po=close]').click();
     const room=await page.evaluate(title=>Object.keys(localStorage).filter(key=>key.startsWith('nexora-v31:community-hub-tools:')).flatMap(key=>JSON.parse(localStorage.getItem(key)).liveRooms||[]).find(row=>row.title===title),'PO Live '+width);
     const offer=await page.evaluate(id=>JSON.parse(localStorage.getItem('nexora-community-templates-v1')).feed.find(row=>row.id===id),room.flash.dealId);assert.equal(offer.quantity,5);assert.equal(offer.pageId,'p1');assert.ok(offer.expiresAt>Date.now());assert.equal(room.poll.counts[0],1);
     await open('live','business','&liveId='+room.id);await page.locator('.lv-stage').waitFor();assert.equal(await page.locator('[data-live-po=vote][data-live-value="0"]').isDisabled(),true);
     await page.locator('[data-live-po=end]').click();await page.locator('[data-live-po-form=summary]').waitFor();await page.locator('[data-live-po=close]').click();
     await open('live','personal','&liveId='+room.id+'&liveOwner='+room.ownerId+'&liveView=viewer');assert.equal(await page.locator('[data-live-replay]').count(),0);assert.equal(await page.locator('[data-live-po=download]').count(),0);
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    });
    await check('Weekly live schedule keeps a stable link after reload',async()=>{
     await open('live','business','&composeLive=1');const setup=page.locator('[data-live-po-form=setup]');await setup.waitFor();await setup.locator('[name=title]').fill('Weekly PO '+width);await setup.locator('[data-live-po=schedule]').click();
     const form=page.locator('[data-live-po-form=schedule]');await form.locator('[name=date]').fill('2027-12-15');await form.locator('[name=time]').fill('18:30');await form.locator('[name=weekly]').check();await form.locator('[type=submit]').click();await page.locator('[data-live-po=start-scheduled]').waitFor();
     const rooms=await page.evaluate(title=>Object.keys(localStorage).filter(key=>key.startsWith('nexora-v31:community-hub-tools:')).flatMap(key=>JSON.parse(localStorage.getItem(key)).liveRooms||[]).filter(row=>row.title===title),'Weekly PO '+width);assert.equal(rooms.length,2);assert.equal(rooms[0].seriesId,rooms[1].seriesId);
     await open('live','business','&liveId='+rooms[0].seriesId);await page.locator('[data-live-po=start-scheduled]').waitFor();assert.ok((await page.locator('.lv-surface').innerText()).includes('Dec 15, 2027'));
    });
   }finally{await context.close();}
  }
 }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
 console.log('TOTAL',results.filter(row=>row.pass).length+'/'+results.length,'pageErrors='+errors.length);for(const error of errors)console.log('PAGE ERROR',error.width,error.message);process.exitCode=results.some(row=>!row.pass)||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
