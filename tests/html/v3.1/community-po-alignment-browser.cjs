const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5530';
const output=process.env.COMMUNITY_PO_OUTPUT||'/tmp/community-po-alignment';
const results=[],errors=[];
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [390,834,1440])for(const account of ['personal','business']){
   const context=await browser.newContext({viewport:{width,height:900}});
   try{
    await context.addInitScript(()=>{for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');});
    const page=await context.newPage();page.setDefaultTimeout(12000);page.on('dialog',dialog=>dialog.accept());
    page.on('pageerror',error=>errors.push({width,account,error:error.message}));
    const entry=base+'/html/v3.1/'+(account==='personal'?'staff-community.html':'community.html')+'?account='+account;
    const hub=page.locator('#community-staging,#community-hub'),pane=hub.locator('.community-extra-pane');
    const member='PO '+account+' '+width;
    async function open(route,name=member){await page.goto(entry+'&tab='+route+'&member='+encodeURIComponent(name),{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub);}
    async function check(name,fn){try{await fn();results.push({width,account,name,pass:true});console.log('PASS',width,account,name);}catch(error){results.push({width,account,name,pass:false,error:error.message});console.log('FAIL',width,account,name,error.message);await page.screenshot({path:path.join(output,`${width}-${account}-${name.replace(/\W+/g,'-')}-failure.png`)}).catch(()=>{});}}
    for(const route of ['feed','groups','pages','jobs','connect','deals','shop','live','news','food','realestate'])await check(route+' layout',async()=>{
     await open(route);
     if(['food','realestate'].includes(route)){await hub.locator('.community-document-pane iframe').waitFor();await page.frameLocator('.community-document-pane iframe').locator(route==='food'?'#hero':'.hero').waitFor();}
     else if(['shop','live','news'].includes(route)){
      await pane.locator(route==='shop'?'.store-head':'.'+route+'-hero').waitFor();
      assert.equal(await pane.locator('.topbar').isVisible(),false,'One shared header');
      assert.equal(await pane.locator('.mobile-nav-row').isVisible(),false,'One shared navigation');
      if(route==='shop')assert.equal(await pane.locator('[data-action="shop-add-service"]').count(),2);
     }else if(route==='deals')await pane.locator('.deal-hero').waitFor();
     else if(route==='connect')await hub.locator('#connectPane .native-body').waitFor();
     else await hub.locator('#communityPane #'+(route==='deals'?'communityDealsView':route+'View')).waitFor();
     if(['groups','pages'].includes(route))assert.equal(await hub.locator('#'+route+'View>.feature-intro').isVisible(),true,'PO introduction visible');
     if(route==='pages')assert.equal(await hub.locator('#pageCards').evaluate(node=>getComputedStyle(node).flexDirection),'row','Fanpages scroll horizontally');
     if(route==='pages')assert.equal(await hub.locator('#pageSectionTitle').evaluate(node=>getComputedStyle(node).clipPath),'none','PO directory heading is readable');
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No page overflow');
     assert.equal(await hub.locator('[data-community-region]').evaluateAll(nodes=>nodes.some(node=>node.shadowRoot)),false);
     if(!['food','realestate'].includes(route))assert.equal(page.frames().length,1);
     await page.screenshot({path:path.join(output,`${route}-${account}-${width}.png`)});
    });
    await check('storefront CRUD and identity isolation',async()=>{
     await open('shop');await pane.locator('.store-head').waitFor();
     await pane.locator('.store-head [data-action="edit-shop"]').click();
     let form=pane.locator('#shop-form');await form.locator('[name=name]').fill(member+' Store');
     if(account==='personal')assert.deepEqual(await form.locator('[name=type] option').evaluateAll(nodes=>nodes.map(node=>node.value)),['personal']);
     else await form.locator('[name=type]').selectOption('salon');
     await form.locator('[name=about]').fill('Store introduction');await form.locator('[name=phone]').fill('7135550142');await form.locator('[name=hours]').fill('Mon–Sat, 9am–6pm');
     assert.equal(await form.locator('[name=fulfillment][value=onsite]').count(),account==='personal'?0:1);
     await form.locator('[type=submit]').click();await pane.locator('#editor').waitFor({state:'hidden'});
     await pane.locator('.store-tool-grid [data-action="shop-add-product"]').first().click();form=pane.locator('#item-form');
     assert.equal(await form.locator('[name=kind] option[value=service]').count(),account==='personal'?0:1);
     if(account==='personal'){
      await form.locator('[name=kind]').evaluate(select=>{select.add(new Option('Service','service'));select.value='service';});
      await form.locator('[name=title]').fill('Blocked salon service');await form.locator('[name=description]').fill('Service must not be saved');await form.locator('[type=submit]').click();
      assert.equal(await pane.locator('#editor').isVisible(),true,'Service submission is rejected');assert.equal(await pane.locator('.store-item').count(),0);
      await form.locator('[name=kind]').selectOption('product');
     }
     await form.locator('[name=title]').fill('PO product');await form.locator('[name=price]').fill('15');await form.locator('[name=description]').fill('Product description');
     await form.locator('[name=shareFeed]').uncheck();await form.locator('[type=submit]').click();await pane.locator('#editor').waitFor({state:'hidden'});
     await pane.locator('[data-edit-item]').first().click();await pane.locator('#item-form [name=title]').fill('PO product edited');await pane.locator('#item-form [type=submit]').click();await pane.locator('#editor').waitFor({state:'hidden'});
     if(account==='business'){
      await pane.locator('.store-tool-grid [data-action="shop-add-service"]').first().click();await pane.locator('#item-form [name=title]').fill('PO service');await pane.locator('#item-form [name=description]').fill('Business service description');await pane.locator('#item-form [name=shareFeed]').uncheck();await pane.locator('#item-form [type=submit]').click();await pane.locator('#editor').waitFor({state:'hidden'});
     }
     await pane.locator('.store-tool-grid [data-action="shop-post"]').first().click();await pane.locator('#feed-form [name=body]').fill('PO store update '+member);await pane.locator('#feed-form [type=submit]').click();await pane.locator('#editor').waitFor({state:'hidden'});
     await page.reload();await pane.locator('.store-head').waitFor();assert.equal(await pane.locator('.store-preview-title h2').innerText(),member+' Store');
     assert.equal(await pane.locator('.store-item').count(),account==='personal'?1:2);assert.ok((await pane.locator('.store-post-list').innerText()).includes('PO store update '+member));
     await open('shop',member+' other');await pane.locator('.store-head').waitFor();assert.equal(await pane.locator('.store-item').count(),0);assert.equal(await pane.locator('.store-post').count(),0,'Other identities cannot manage storefront posts');assert.equal(await pane.locator('.store-progress').getAttribute('aria-valuenow'),'0');
     await open('shop');await pane.locator('.store-head').waitFor();assert.equal(await pane.locator('.store-item h3').filter({hasText:'PO product edited'}).count(),1);
     await pane.locator('.store-item').filter({hasText:'PO product edited'}).locator('[data-delete-item]').click();assert.equal(await pane.locator('.store-item h3').filter({hasText:'PO product edited'}).count(),0);
     await page.reload();await pane.locator('.store-head').waitFor();assert.equal(await pane.locator('.store-item').count(),account==='personal'?0:1);
    });
    await check('group filters and PO Jobs actions',async()=>{
     await open('groups');const groups=hub.locator('#groupsView');await groups.locator('[data-po-my-groups]').click();assert.equal(await groups.locator('[data-po-my-groups]').getAttribute('aria-pressed'),'true');
     await groups.locator('.subtabs [data-po-group-discover]').click();assert.equal(await groups.locator('[data-po-my-groups]').getAttribute('aria-pressed'),'false');
     await groups.locator('[data-po-group-search]').fill('No matching group 987654');assert.equal(await groups.locator('[data-community-group-card]').count(),0);await groups.locator('[data-po-group-search]').fill('');
     await groups.locator('[data-community-group-action=filters]').click();await groups.locator('#communityGroupFilters').waitFor();
     await groups.locator('[data-community-group-action=detail]').first().click();await hub.locator('[data-community-group-dialog]').waitFor();
     await open('jobs');const hero=hub.locator('.community-po-jobs-hero');await hero.waitFor();
     if(account==='personal'){
      await hero.locator('[data-template=seeking]').click();await hub.locator('#templateForm[data-kind=seeking]').waitFor();
      await open('jobs');await hero.locator('[data-jobs-tab=matched]').click();await page.waitForURL(url=>url.searchParams.get('jobsTab')==='matched');
     }else{await hero.locator('[data-view=daywork]').click();await page.waitForURL(url=>url.searchParams.get('tab')==='shift');}
    });
   }finally{await context.close();}
  }
 }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
 console.log('TOTAL',results.filter(row=>row.pass).length+'/'+results.length,'errors='+errors.length);process.exitCode=results.some(row=>!row.pass)||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
