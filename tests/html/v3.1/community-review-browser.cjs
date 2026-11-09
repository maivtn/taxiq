const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5547';
const output=process.env.COMMUNITY_REVIEW_OUTPUT||'/tmp/community-review-ui';
const widths=(process.env.COMMUNITY_REVIEW_WIDTHS||'390,834,1440').split(',').map(Number);
const height=Number(process.env.COMMUNITY_REVIEW_HEIGHT||900);
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.COMMUNITY_BROWSER_CHANNEL?{channel:process.env.COMMUNITY_BROWSER_CHANNEL}:{})}),results=[],errors=[];
 try{
  for(const width of widths)for(const account of ['personal','business']){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
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
     if(width<=650){
      const rails=groups.locator('.community-group-rail');
      for(const rail of await rails.all()){
       await rail.scrollIntoViewIfNeeded();
       const section=rail.locator('..'),count=await rail.locator('.community-group-card').count();
       assert.equal(await section.locator('.community-group-swipe').count(),count>1?1:0);
       if(count>1){assert.equal(await section.locator('.community-group-swipe').isVisible(),true);assert.match(await section.locator('.community-group-swipe').innerText(),/Swipe to explore/);assert.equal(await rail.evaluate(node=>node.scrollWidth>node.clientWidth),true);}
      }
     }
     assert.ok(await groups.locator('.community-group-posts article').count()>0);
     const article=groups.locator('.community-group-posts article').first();await article.locator('[data-social-action=like]').click();assert.equal(await groups.locator('.community-group-posts article').first().locator('[data-social-action=like]').getAttribute('aria-pressed'),'true');
     await groups.locator('[data-po-my-groups]').click();
     if(account==='personal'){
      await groups.locator('.community-group-empty').waitFor();assert.equal(await groups.locator('.community-group-empty h4').innerText(),'No groups joined yet');
      assert.equal(await groups.locator('.community-group-swipe').count(),0);
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
     const friends=hub.locator('.community-extra-pane .friends-shell'),sent=friends.locator('[data-friends-tab=sent]');await sent.waitFor();
     const initialCount=await sent.locator('[data-count=sent]').innerText();
     for(const destination of ['sent','received','suggestions','all','sent']){
      const button=friends.locator(`.friends-nav [data-friends-tab="${destination}"]`);await button.click();
      await page.waitForFunction(destination=>document.querySelector(`.friends-nav [data-friends-tab="${destination}"]`)?.getAttribute('aria-current')==='page',destination);
      const icons=await friends.locator('.friends-nav button').evaluateAll(nodes=>nodes.map(node=>node.querySelectorAll('svg').length));assert.deepEqual(icons,[1,1,1,1]);
     }
     assert.equal(await friends.locator('#friendsTitle').innerText(),'Sent requests');assert.equal(await sent.locator('[data-count=sent]').innerText(),initialCount);
     await sent.screenshot({path:path.join(output,`${width}-${account}-sent-requests.png`)});

    });
    await check('Friend request cards match PO and keep response persistence',async()=>{
     await open('friends');const friends=hub.locator('.community-extra-pane .friends-shell');await friends.locator('.friends-nav').waitFor();
     await page.evaluate(()=>{
      const shared=window.NEXORA_COMMUNITY_SHARED,names=['Thảo Lê','Hà Nguyễn'];
      shared.change(data=>{data.friendRequests=(data.friendRequests||[]).filter(row=>!(row.to===shared.member&&names.includes(row.from)));for(const name of names)data.friendRequests.push({id:'qa-request-'+name,from:name,to:shared.member,status:'pending',createdAt:new Date().toISOString(),isSample:true});});
     });
     await friends.locator('.friends-nav [data-friends-tab=received]').click();await friends.locator('.friend-request-card').first().waitFor();
     const cards=friends.locator('.friend-request-card'),first=cards.filter({hasText:'Thảo Lê'}),second=cards.filter({hasText:'Hà Nguyễn'});
     assert.equal(await first.locator('.friend-sample').innerText(),'SAMPLE');assert.equal(await second.locator('.friend-sample').innerText(),'SAMPLE');
     const layout=await cards.evaluateAll(nodes=>nodes.map(card=>{const rect=node=>node.getBoundingClientRect(),box=rect(card),avatar=rect(card.querySelector('.friends-avatar')),info=rect(card.querySelector('.friend-request-info')),buttons=[...card.querySelectorAll('.friend-request-actions button')].map(rect);return {width:box.width,avatar:avatar.width,left:avatar.right<=info.left,actions:buttons.length===2&&Math.abs(buttons[0].y-buttons[1].y)<1&&Math.abs(buttons[0].width-buttons[1].width)<2,height:Math.max(...buttons.map(b=>b.height))};}));
     assert.ok(layout.every(row=>row.left&&row.avatar===47&&row.actions&&row.height<=32),JSON.stringify(layout));
     assert.equal(await first.locator('[data-friend-action=accept] span').evaluate(node=>getComputedStyle(node).color),'rgb(255, 255, 255)');
     const gridBox=await friends.locator('.friends-grid').boundingBox();assert.ok(layout.every(row=>Math.abs(row.width-gridBox.width)<2));
     assert.equal(await friends.locator('.friends-search').isVisible(),false);await friends.locator('.friends-content').screenshot({path:path.join(output,`${width}-${account}-friend-requests-po.png`)});
     await friends.locator('#findFriends').click();await page.waitForFunction(()=>document.querySelector('.friends-nav [data-friends-tab=suggestions]')?.getAttribute('aria-current')==='page');
     await friends.locator('.friends-nav [data-friends-tab=received]').click();await first.locator('[data-friend-action=accept]').click();await first.waitFor({state:'detached'});
     await second.locator('[data-friend-action=decline]').click();await second.waitFor({state:'detached'});
     await page.reload();await friends.locator('.friends-nav [data-friends-tab=received]').click();assert.equal(await cards.filter({hasText:'Thảo Lê'}).count(),0);assert.equal(await cards.filter({hasText:'Hà Nguyễn'}).count(),0);
     await friends.locator('.friends-nav [data-friends-tab=all]').click();await friends.locator('.friends-card').filter({hasText:'Thảo Lê'}).waitFor();
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    });
    await check('Contacts show avatars with message and call icons on the right',async()=>{
     await open('contacts');const connect=hub.locator('#connectPane'),rows=connect.locator('#contactRows .connect-contact');await rows.first().waitFor();
     const contacts=await rows.evaluateAll(nodes=>nodes.map(node=>{
      const avatar=node.querySelector('.contact-avatar'),main=node.querySelector('.contact-main'),actions=node.querySelector('.contact-actions'),a=avatar?.getBoundingClientRect(),m=main.getBoundingClientRect(),b=actions.getBoundingClientRect();
      return {avatar:!!avatar&&(!!avatar.querySelector('img')||!!avatar.textContent.trim()),inline:!!a&&a.right<=m.left+1&&m.right<=b.left+1&&Math.abs(a.y+a.height/2-b.y-b.height/2)<2,icons:[...actions.children].map(button=>({count:button.querySelectorAll('svg').length,label:button.getAttribute('aria-label'),text:button.textContent.trim()}))};
     }));assert.ok(contacts.length>0&&contacts.every(row=>row.avatar&&row.inline&&row.icons.length===2&&row.icons.every(icon=>icon.count===1&&icon.label&&!icon.text)),JSON.stringify(contacts));
     await rows.first().screenshot({path:path.join(output,`${width}-${account}-contact-row.png`)});
     const name=await rows.first().locator('.contact-main strong').innerText();await rows.first().locator('.contact-actions [data-contact-member]').click();
     await connect.locator('#detailTitle').waitFor();assert.equal(await connect.locator('#detailTitle').innerText(),name);
     await open('contacts');await rows.first().waitFor();await rows.first().locator('[data-start-call=voice]').click();
     const call=connect.locator('#connectActiveCall');await call.waitFor();assert.equal(await call.locator('h3').innerText(),name);
     await call.locator('[data-connect-action=end-call]').click();await call.waitFor({state:'detached'});
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
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
     const destinations=await nav.locator('[data-jobs-tab]').evaluateAll(nodes=>nodes.map(node=>node.dataset.jobsTab));
     for(const destination of destinations){
      await nav.locator(`[data-jobs-tab="${destination}"]`).click();
      assert.equal(await nav.locator(`[data-jobs-tab="${destination}"]`).getAttribute('aria-selected'),'true');
      const navigationBox=await nav.boundingBox(),workflowBox=await jobs.locator('#jobsWorkflow').boundingBox();
      assert.ok(Math.abs(navigationBox.width-workflowBox.width)<2,JSON.stringify({destination,navigationBox,workflowBox}));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     }
     await nav.locator(`[data-jobs-tab="${account==='personal'?'matched':'workers'}"]`).click();
     await jobs.locator('.jobs-workflow-head').screenshot({path:path.join(output,`${width}-${account}-jobs-full-width.png`)});
     if(account==='business'){
      const filters=jobs.locator('.jobs-worker-filters');await filters.locator('.ts-control').first().waitFor();
      assert.equal(await filters.locator('.ts-control svg').count(),2);
      const arrows=await filters.locator('.ts-control').evaluateAll(nodes=>nodes.map(node=>{const style=getComputedStyle(node,'::after');return {content:style.content,right:style.right,width:style.width,padding:getComputedStyle(node).paddingRight};}));assert.ok(arrows.every(arrow=>arrow.content==='""'&&arrow.right==='16px'&&arrow.width==='16px'&&parseFloat(arrow.padding)>=44),JSON.stringify(arrows));
      const filterBox=await filters.boundingBox();assert.ok(filterBox.height<=40,JSON.stringify(filterBox));
      const choose=async(id,value)=>{await filters.locator('[data-worker-filter="'+id+'"] .ts-control').click();const option=filters.locator('.ts-dropdown .option[data-value="'+value+'"]');await option.waitFor();assert.equal(await option.locator('svg').count(),1);await option.click();};
      await choose('poWorkerGroup','nail');assert.equal(await jobs.locator('#poWorkerGroup').inputValue(),'nail');
      await choose('poWorkerSkill','acrylic');assert.equal(await jobs.locator('#poWorkerSkill').inputValue(),'acrylic');assert.equal(await jobs.locator('#poWorkerGroup').inputValue(),'nail');
      for(const card of await jobs.locator('.jobs-worker-card').all())assert.match(await card.locator('.chips').innerText(),/acrylic/i);
      await choose('poWorkerSkill','');await choose('poWorkerGroup','all');
      const card=jobs.locator('.jobs-worker-card').first();await card.waitFor();
      const actions=card.locator('.jobs-worker-actions button');assert.equal(await actions.count(),2);
      const boxes=await actions.evaluateAll(nodes=>nodes.map(node=>({height:node.getBoundingClientRect().height,y:node.getBoundingClientRect().y,icons:node.querySelectorAll('svg').length,label:node.textContent.trim()})));
      assert.ok(boxes.every(box=>box.height<=30&&box.icons===1&&box.label)&&Math.abs(boxes[0].y-boxes[1].y)<2,JSON.stringify(boxes));
      await jobs.screenshot({path:path.join(output,`${width}-business-workers-compact.png`)});
      await card.locator('[data-jobs-extra=worker-profile]').click();await pane.locator('#jobsDialogTitle').waitFor();await pane.locator('[data-jobs-dialog] [data-jobs-action=dismiss]').first().click();
      await card.locator('[data-jobs-extra=worker-invite]').click();await pane.locator('#jobsInviteForm').waitFor();await pane.locator('[data-jobs-dialog] [data-jobs-action=dismiss]').first().click();
     }
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
     assert.equal(await avatar.evaluate(node=>getComputedStyle(node).outlineStyle),'solid');
     await editor.screenshot({path:path.join(output,`${width}-${account}-composer-avatar.png`)});
     await editor.locator('[data-action=close-dialog]').first().click();
     await page.waitForFunction(()=>!document.querySelector('.community-extra-pane.community-composer-overlay'));
     await openComposer();await editor.locator('.social-add-more').click();await editor.locator('[data-action=social-more-live]').click();
     await editor.locator('.social-live-avatar,[data-live-po-form=setup]').first().waitFor();
     if(await editor.locator('[data-live-po-form=setup]').count())await editor.locator('[data-live-po=close]').click();
     else{assert.equal((await editor.locator('.social-live-avatar').evaluate(node=>getComputedStyle(node).backgroundImage)).includes('nexora-bitcoin-nailbar.png'),account==='business');await editor.locator('[data-action=close-dialog]').first().click();}
     await page.waitForFunction(()=>!document.querySelector('.community-extra-pane.community-composer-overlay'));
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
    await check('Community sample rooms open and return',async()=>{
     await open('live');const extra=hub.locator('.community-extra-pane');await extra.locator('.live-card,.lv-directory-card').first().waitFor();
     // The PO livestream directory replaces the older chat-only sample room screen.
     if(await extra.locator('.lv-directory-card').count()){
      const rooms=extra.locator('.lv-directory-card');assert.ok(await rooms.count()>=7);assert.ok((await rooms.allTextContents()).every(text=>text.includes('Sample')));
      for(const index of [0,1]){const title=await rooms.nth(index).locator('strong').innerText();await rooms.nth(index).locator('[data-live-po=open]').click();await extra.locator('.lv-top h1').waitFor();assert.equal(await extra.locator('.lv-top h1').innerText(),title);const chat=extra.locator('[data-live-po-form=comment]');if(await chat.count()){await chat.locator('[name=message]').fill('QA sample room message');await chat.locator('[type=submit]').click();assert.ok((await extra.locator('.lv-stage').innerText()).includes('QA sample room message'));}await extra.locator('[data-live-po=back]').click();await rooms.first().waitFor();}
      await extra.locator('[data-live-po=start]').click();await extra.locator('[data-live-po-form=setup]').waitFor();await extra.locator('[data-live-po=close]').click();await page.screenshot({path:path.join(output,`${width}-${account}-live.png`)});return;
     }
     const cards=extra.locator('.live-card');
     assert.equal(await cards.count(),7);assert.equal(await extra.getByText('No live rooms yet. Create a room.',{exact:true}).count(),0);
     await extra.locator('.live-hero [data-feed-kind=video]').click();const videoForm=extra.locator('#feed-form');await videoForm.waitFor();
     assert.equal(await videoForm.locator('[name=kind]').inputValue(),'video');
     assert.equal(await videoForm.locator('select[name=pageId]').count(),account==='personal'?0:1);
     assert.equal(await videoForm.locator('[name=media]').getAttribute('accept'),'video/*');
     await extra.locator('#editor [data-action=close-dialog]').first().click();
     assert.ok((await cards.allTextContents()).every(text=>text.includes('SAMPLE ROOM')));
     const photos=cards.locator('.live-card-cover img');await photos.evaluateAll(async nodes=>Promise.all(nodes.map(image=>image.decode())));
     if(width<=650){
      const geometry=await cards.evaluateAll(nodes=>nodes.map(card=>{const rect=node=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}};return {cover:rect(card.querySelector('.live-card-cover')),image:rect(card.querySelector('.live-card-cover img')),metadata:rect(card.querySelector('.live-card-body small'))};}));
      assert.ok(geometry.every(({cover,image,metadata})=>image.top>=cover.top-1&&image.bottom<=cover.bottom+1&&image.left>=cover.left-1&&image.right<=cover.right+1&&metadata.top>=image.bottom),JSON.stringify(geometry));
      assert.ok((await cards.first().locator('.live-card-body small').innerText()).includes('Houston, TX'));
      await cards.first().scrollIntoViewIfNeeded();await cards.first().screenshot({path:path.join(output,`${width}-${account}-live-cover.png`)});
     }
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
     if(width<=650){
      const count=pages.locator('#pageCount'),hint=pages.locator('#pageSwipeHint'),cards=pages.locator('#pageCards>.page-card'),initial=await cards.count();
      assert.equal(await count.isVisible(),true);assert.equal(parseInt(await count.innerText(),10),initial);
      assert.equal(await hint.isVisible(),true);assert.match(await hint.innerText(),/Swipe pages · scroll down for posts/);
      const sample=cards.filter({has:page.locator('[data-open-page=sample-nail]')});
      assert.equal(await sample.locator('.community-page-sample').innerText(),'SAMPLE PAGE');
      assert.equal(await cards.filter({has:page.locator('[data-open-page=p1]')}).locator('.community-page-sample').count(),0);
      await pages.locator('#pageSearch').fill('Hoa Nail Studio');
      await page.waitForFunction(()=>document.querySelector('#pageCount')?.textContent.trim().startsWith('1 '));
      assert.equal(await cards.count(),1);assert.equal(await hint.isVisible(),false);assert.equal(await cards.locator('.community-page-sample').isVisible(),true);
      await pages.locator('#pageSearch').fill('no-matching-fanpage-qa');
      await page.waitForFunction(()=>document.querySelector('#pageCount')?.textContent.trim().startsWith('0 '));
      assert.equal(await cards.count(),0);assert.equal(await hint.isVisible(),false);
      await pages.locator('#pageSearch').fill('');
      await page.waitForFunction(expected=>parseInt(document.querySelector('#pageCount')?.textContent,10)===expected,initial);
      assert.equal(await hint.isVisible(),true);
     }
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
      const bodyBox=await sample.locator(':scope>p').last().boundingBox(),viewsBox=await sample.locator('.community-po-post-meta').boundingBox();assert.ok(viewsBox.y-bodyBox.y-bodyBox.height<=10,JSON.stringify({bodyBox,viewsBox}));
      await pane.locator('[data-feed-post-id="sample-store-design"]').screenshot({path:path.join(output,`${width}-business-sample-photo.png`)});
     }

    });
   }finally{await context.close();}
  }
 }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
 console.log('TOTAL',results.filter(r=>r.pass).length+'/'+results.length,'errors='+errors.length);process.exitCode=results.some(r=>!r.pass)||errors.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
