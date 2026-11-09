const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const repo = path.resolve(__dirname, '../../../..');
const output = process.env.EVIDENCE_DIR || '/tmp/taxiq-storefront-polish-20261109';
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8873';
const viewports = [{name:'phone',width:390,height:844},{name:'ipad',width:820,height:1180},{name:'desktop',width:1440,height:900}];
const livePath = '/html/v3.1/staff-community.html?tab=shop&account=personal&role=tech';
const originalPath = '/from-po/goi-community-giao-dev/04-MAN-HINH-PROTOTYPE/shell-community.html?section=shop';
fs.mkdirSync(output,{recursive:true});
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,file))).digest('hex');
async function prepare(context) {
  await context.addInitScript(() => {
    try {
      localStorage.setItem('nexora-community-tour-desktop-v1','1');
      localStorage.setItem('nexora-community-tour-mobile-v1','1');
      localStorage.setItem('nexora-community-v13',JSON.stringify({lang:'en',role:'personal'}));
    } catch {}
  });
}
async function inventory(page) {
  return page.locator('.store-head').evaluate(head => {
    const root=head.getRootNode();
    const pageView=root.querySelector('#page-view');
    return {text:pageView.innerText,actions:[...pageView.querySelectorAll('button,a')].map(button=>({text:button.textContent.trim(),action:button.dataset.action||'',section:button.dataset.section||'',href:button.getAttribute('href')}))};
  });
}
async function baseline(browser) {
  const result={sourceHash:hash('from-po/goi-community-giao-dev/04-MAN-HINH-PROTOTYPE/shell-community.html'),moduleHash:hash('html/v3.1/community/modules/hub-tools/index.html'),screens:[]};
  for (const viewport of viewports) for (const [name,url] of [['current',livePath],['po',originalPath]]) {
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.name==='phone',hasTouch:viewport.name!=='desktop'});
    try {
      await prepare(context);
      const page=await context.newPage();
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto(origin+url,{waitUntil:'domcontentloaded'});
      await page.locator('.store-head').waitFor({timeout:30000});
      await page.screenshot({path:path.join(output,`before-${name}-${viewport.name}.png`),animations:'disabled'});
      result.screens.push({name,viewport,errors,...await inventory(page)});
      console.log('BASELINE',name,viewport.name);
    } finally { await context.close(); }
  }
  fs.writeFileSync(path.join(output,'baseline.json'),JSON.stringify(result,null,2));
}
const artifact='docs/prototypes/my-storefront/my-storefront-polished-v1.html';
const packageOnly=process.argv.includes('--package-only');
const staffDesktopOnly=process.argv.includes('--staff-desktop-only');
const formsOnly=process.argv.includes('--forms-only');
const results=(packageOnly||staffDesktopOnly||formsOnly)&&fs.existsSync(path.join(output,'results.json'))?JSON.parse(fs.readFileSync(path.join(output,'results.json'))).results.filter(row=>formsOnly|| (packageOnly?row.name.startsWith('staff-'):row.name!=='staff-desktop')):[];
const clean=text=>String(text).replace(/[\p{Extended_Pictographic}\uFE0F\u200D＋✦✧▣⌖☎✉↗✓·●]/gu,'').replace(/\s+/g,' ').trim();
function saveResults(){fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({head:require('node:child_process').execSync('git rev-parse HEAD',{cwd:repo}).toString().trim(),originalPOHash:hash('from-po/goi-community-giao-dev/04-MAN-HINH-PROTOTYPE/shell-community.html'),artifactHash:hash(artifact),results},null,2));}
async function visible(page,selector){await page.locator(selector).first().waitFor({state:'visible'});}
async function click(page,selector){await page.locator(selector).first().click();}
async function closeEditor(page){await click(page,'#editor[open] .dialog-head [data-action="close-dialog"]');await page.locator('#editor').waitFor({state:'hidden'});}
async function formMetrics(page,id,viewport){
  const value=await page.locator(id).evaluate(form=>{
    const dialog=form.closest('dialog'),rect=dialog.getBoundingClientRect();
    return {rect:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},columns:getComputedStyle(form.querySelector('.form-grid')).gridTemplateColumns,overflow:dialog.scrollWidth>dialog.clientWidth+2,fields:[...form.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=file]),select,textarea')].map(input=>({name:input.name,font:parseFloat(getComputedStyle(input).fontSize),height:input.getBoundingClientRect().height})),selects:[...form.querySelectorAll('select')].map(input=>({name:input.name,padding:getComputedStyle(input).paddingRight,position:getComputedStyle(input).backgroundPosition,size:getComputedStyle(input).backgroundSize}))};
  });
  assert(!value.overflow,'Horizontal overflow in '+id);
  assert.equal(value.columns.split(' ').length,viewport.name==='phone'?1:2,'Responsive form columns '+id);
  assert(value.rect.left>=-1&&value.rect.right<=viewport.width+1&&value.rect.top>=-1&&value.rect.bottom<=viewport.height+1,'Dialog outside viewport '+JSON.stringify(value.rect));
  if(viewport.name==='phone')assert(value.fields.every(input=>input.font>=16),'Phone field font below 16px '+JSON.stringify(value.fields));
  assert(value.selects.every(select=>parseFloat(select.padding)>=44&&select.position.includes('16px')),'Select arrow spacing '+JSON.stringify(value.selects));
  return value;
}
async function layout(page,viewport){
  return page.locator('.store-head').evaluate((head,viewport)=>{
    const root=head.getRootNode(),view=root.querySelector('#page-view');
    const bounds=view.getBoundingClientRect();
    const problems=[...view.querySelectorAll('*')].filter(node=>{const rect=node.getBoundingClientRect();return rect.width>0&&rect.height>0&&getComputedStyle(node).position!=='fixed'&&(rect.left<bounds.left-2||rect.right>bounds.right+2);}).map(node=>({tag:node.tagName,class:node.className.baseVal||node.className,text:node.textContent.slice(0,60)}));
    const small=[...view.querySelectorAll('button,a')].filter(node=>{const rect=node.getBoundingClientRect();return rect.width>0&&rect.height>0&&(rect.height<43.5||rect.width<43.5);}).map(node=>({text:node.textContent,width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height}));
    return {overflow:view.scrollWidth>view.clientWidth+2,problems,small,toolColumns:getComputedStyle(view.querySelector('.store-tool-grid')).gridTemplateColumns,itemColumns:view.querySelector('.store-item-grid')?getComputedStyle(view.querySelector('.store-item-grid')).gridTemplateColumns:null};
  },viewport);
}
async function verifyFlow(browser,viewport,packaged){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.name==='phone',hasTouch:viewport.name!=='desktop'});
  const name=(packaged?'package':'staff')+'-'+viewport.name;
  const entry={name,viewport,checks:[],errors:[],failedRequests:[],pass:false};results.push(entry);
  let phase='open',page;
  const checkpoint=label=>{entry.checks.push(label);phase=label;console.log('CHECK',name,label);saveResults();};
  try{
    await prepare(context);page=await context.newPage();page.setDefaultTimeout(12000);
    page.on('pageerror',error=>entry.errors.push(error.stack||error.message));
    page.on('requestfailed',request=>{const error=request.failure()?.errorText;if(error==='net::ERR_ABORTED'&&(request.url().startsWith('blob:')||/\.mp4(?:\?|$)/.test(request.url()))){entry.revokedPreviews=(entry.revokedPreviews||0)+1;return;}if(!/fonts\.(googleapis|gstatic)\.com/.test(request.url())&&!request.url().startsWith('https://taxiq-nexora-touch.vercel.app/'))entry.failedRequests.push({url:request.url().slice(0,200),error});});
    const start=packaged?pathToFileURL(path.join(repo,artifact)).href:origin+livePath;
    await page.goto(start,{waitUntil:'domcontentloaded'});await visible(page,'.store-head');
    entry.role=await page.evaluate(()=>({role:window.NEXORA_COMMUNITY_SHARED.role,shop:window.NEXORA_COMMUNITY_SHARED.canAccessFeature('shop'),salonTools:['transfer','workers','services','hiring','posRecruitment'].map(feature=>window.NEXORA_COMMUNITY_SHARED.canAccessFeature(feature))}));
    assert(entry.role.shop&&entry.role.salonTools.every(value=>!value),'Personal storefront must not grant salon management');
    const baselineData=JSON.parse(fs.readFileSync(path.join(output,'baseline.json')));
    const before=baselineData.screens.find(row=>row.name==='current'&&row.viewport.name===viewport.name);
    const after=await inventory(page);
    assert.deepEqual(after.actions.map(action=>({...action,text:clean(action.text)})),before.actions.map(action=>({...action,text:clean(action.text)})),'Initial action/copy parity');
    assert.equal(clean(after.text),clean(before.text),'Initial page copy parity');
    entry.initialLayout=await layout(page,viewport);assert(!entry.initialLayout.overflow&&entry.initialLayout.problems.length===0,'Initial overflow '+JSON.stringify(entry.initialLayout));
    await page.screenshot({path:path.join(output,`after-${name}-empty.png`),animations:'disabled'});
    checkpoint('empty content, action parity and responsive layout');

    await click(page,'.store-head [data-action="edit-shop"]');await visible(page,'#shop-form');
    entry.shopForm=await formMetrics(page,'#shop-form',viewport);
    await page.screenshot({path:path.join(output,`after-${name}-setup-modal.png`),animations:'disabled'});
    let form=page.locator('#shop-form');
    await form.locator('[type=submit]').click();assert(await form.locator('[name=name]').evaluate(input=>input.validity.valueMissing),'Required store name');
    await form.locator('[name=name]').fill('Not saved');await form.locator('[name=email]').fill('invalid');
    await form.locator('[type=submit]').click();assert(await form.locator('[name=email]').evaluate(input=>input.validity.typeMismatch),'Invalid email');
    await form.locator('.dialog-actions [data-action="close-dialog"]').click();
    await click(page,'.store-tool-grid [data-action="edit-shop"]');assert.equal(await form.locator('[name=name]').inputValue(),'','Cancel must discard changes');
    await form.locator('[name=name]').pressSequentially('x'.repeat(75));assert.equal((await form.locator('[name=name]').inputValue()).length,70,'Store name maximum length');
    await page.keyboard.press('Escape');await page.locator('#editor').waitFor({state:'hidden'});
    await click(page,'.store-head [data-action="edit-shop"]');await page.mouse.click(2,2);await page.locator('#editor').waitFor({state:'hidden'});
    await click(page,'.store-head [data-action="edit-shop"]');
    await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
    await form.locator('[name=name]').fill('Linh Studio · Personal Storefront');await form.locator('[name=type]').selectOption('personal');
    for(const [field,value] of Object.entries({category:'Nail supplies and personal services',city:'Houston, TX',phone:'2815550198',email:'storefront-qa@example.com',hours:'Mon–Sat, 9am–6pm',website:'https://example.com/book',about:'Personal nail supplies and services in Houston. '+('Detailed storefront introduction with useful contact information. '.repeat(5))}))await form.locator('[name='+field+']').fill(value);
    await form.locator('[name=fulfillment][value=pickup]').check();await form.locator('[name=fulfillment][value=shipping]').check();
    await form.locator('[name=logo]').setInputFiles({name:'too-large.png',mimeType:'image/png',buffer:Buffer.alloc(1024*1024+1)});
    await form.locator('[type=submit]').click();await visible(page,'#shop-form');await page.getByText('Photo exceeds 1 MB. Choose a smaller photo.',{exact:true}).waitFor();
    const image=fs.readFileSync(path.join(repo,'html/v3.1/icon-oneqr/issue-2040-oneqr-store-3d.png'));
    await form.locator('[name=logo]').setInputFiles({name:'logo.png',mimeType:'image/png',buffer:image});
    await form.locator('[name=cover]').setInputFiles({name:'cover.png',mimeType:'image/png',buffer:image});
    await form.locator('[type=submit]').click();await page.locator('#editor').waitFor({state:'hidden'});
    assert.equal(await page.locator('.store-preview-title h2').textContent(),'Linh Studio · Personal Storefront');
    assert.equal(await page.locator('.store-progress').getAttribute('aria-valuenow'),'5');
    await click(page,'.store-head [data-action="edit-shop"]');assert.equal(await form.locator('[name=email]').inputValue(),'storefront-qa@example.com');
    await closeEditor(page);checkpoint('store form: required/email/upload validation, cancel, save, reopen');

    await click(page,'.store-empty [data-action="shop-add-product"]');await visible(page,'#item-form');
    entry.itemForm=await formMetrics(page,'#item-form',viewport);form=page.locator('#item-form');
    await form.locator('[type=submit]').click();assert(await form.locator('[name=title]').evaluate(input=>input.validity.valueMissing));
    await form.locator('[name=title]').fill('Professional nail supplies set');await form.locator('[name=description]').fill('A complete set with a long description. '+('All details remain readable without truncation. '.repeat(5)));
    await form.locator('[name=price]').fill('-1');await form.locator('[type=submit]').click();assert(await form.locator('[name=price]').evaluate(input=>input.validity.rangeUnderflow));
    await form.locator('[name=price]').fill('35.50');await form.locator('[name=category]').fill('Nail tools');await form.locator('[name=availability]').selectOption('preorder');await form.locator('[name=shareFeed]').uncheck();
    await form.locator('[name=image]').setInputFiles({name:'product.png',mimeType:'image/png',buffer:image});
    await page.screenshot({path:path.join(output,`after-${name}-item-modal.png`),animations:'disabled'});
    await form.locator('[type=submit]').click();await page.locator('#editor').waitFor({state:'hidden'});
    assert.equal(await page.locator('.store-progress').getAttribute('aria-valuenow'),'6');
    await click(page,'.store-tool-grid [data-action="shop-add-service"]');assert.equal(await form.locator('[name=kind]').inputValue(),'service');
    await form.locator('[name=title]').fill('Personal consultation service');await form.locator('[name=description]').fill('A service listing with an optional price.');await form.locator('[name=shareFeed]').uncheck();await form.locator('[type=submit]').click();await page.locator('#editor').waitFor({state:'hidden'});
    await click(page,'.store-section-title [data-action="shop-add-product"]');await form.locator('[name=kind]').selectOption('post');await form.locator('[name=title]').fill('About Linh Studio');await form.locator('[name=description]').fill('An introduction listing for the personal storefront.');await form.locator('[name=shareFeed]').uncheck();await form.locator('[type=submit]').click();await page.locator('#editor').waitFor({state:'hidden'});
    for(const [filter,count] of [['product',1],['service',1],['post',1],['all',3]]){await click(page,'[data-shop-filter='+filter+']');assert.equal(await page.locator('.store-item').count(),count,'Filter '+filter);}
    const product=page.locator('.store-item').filter({has:page.getByRole('heading',{name:'Professional nail supplies set',exact:true})});
    await product.locator('[data-edit-item]').click();await form.locator('[name=title]').fill('Discarded edit');await form.locator('.dialog-actions [data-action="close-dialog"]').click();assert.equal(await product.count(),1);
    await product.locator('[data-edit-item]').click();await form.locator('[name=availability]').selectOption('soldout');await form.locator('[type=submit]').click();await page.locator('#editor').waitFor({state:'hidden'});assert((await product.textContent()).includes('Unavailable'));
    entry.populatedLayout=await layout(page,viewport);assert(!entry.populatedLayout.overflow&&entry.populatedLayout.problems.length===0,'Populated overflow '+JSON.stringify(entry.populatedLayout));
    if(viewport.name==='phone')assert.equal(entry.populatedLayout.itemColumns.split(' ').length,2,'Phone listing grid must retain two columns');
    await page.locator('.store-item-grid').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`after-${name}-listings.png`),animations:'disabled'});
    checkpoint('product/service/introduction: validation, filters, edit and cancel');

    await click(page,'.store-tool-grid [data-action="shop-post"]');await visible(page,'#feed-form');
    await closeEditor(page);await click(page,'.store-section-title [data-action="shop-post"]');
    const post=page.locator('#feed-form');await post.locator('[name=body]').fill('Storefront QA update with a photo.');
    for(const [action,suffix] of [['social-more-tag','@'],['social-more-feeling','😊'],['social-more-checkin','Houston, TX']]){
      await click(page,'[data-action="social-more-toggle"]');await click(page,'[data-action="'+action+'"]');assert((await post.locator('[name=body]').inputValue()).includes(suffix));
    }
    await post.locator('[name=body]').fill('Storefront QA update with a photo.');
    await click(page,'[data-action="social-more-toggle"]');await click(page,'[data-action="social-more-close"]');
    const [videoChooser]=await Promise.all([page.waitForEvent('filechooser'),post.locator('label[for="post-video"]').click()]);
    await videoChooser.setFiles(path.join(repo,'html/v3.1/community/modules/hub-tools/media/e82ec27ae33377ad.mp4'));await visible(page,'.social-preview-item video');
    await click(page,'.social-preview-item [data-action="post-remove-media"]');assert.equal(await page.locator('.social-preview-item').count(),0);
    const media=post.locator('input[type=file][accept*="image"]');if(await media.count())await media.first().setInputFiles({name:'post.png',mimeType:'image/png',buffer:image});
    const audience=post.locator('[data-action="social-visibility-toggle"]');if(await audience.count()){await audience.click();await click(page,'[data-visibility-choice="friends"]');}
    await page.screenshot({path:path.join(output,`after-${name}-post-modal.png`),animations:'disabled'});
    await post.locator('[type=submit]').click();await page.locator('#editor').waitFor({state:'hidden'});assert.equal(await page.locator('.store-post').count(),1);
    await page.reload({waitUntil:'domcontentloaded'});await visible(page,'.store-head');assert.equal(await page.locator('.store-item').count(),3);assert.equal(await page.locator('.store-post').count(),1);
    await click(page,'.store-post [data-feed-delete]');await visible(page,'#delete-post-dialog[open]');await click(page,'[data-feed-delete-cancel]');assert.equal(await page.locator('.store-post').count(),1);
    await click(page,'.store-post [data-feed-delete]');await click(page,'[data-feed-delete-confirm]');assert.equal(await page.locator('.store-post').count(),0);
    await page.locator('.store-item').filter({has:page.getByRole('heading',{name:'Professional nail supplies set',exact:true})}).locator('[data-delete-item]').click();assert.equal(await page.locator('.store-item').count(),2);
    await click(page,'[data-shop-filter=product]');await page.getByText('No listings in this filter',{exact:true}).waitFor();await click(page,'[data-shop-filter=all]');
    checkpoint('post/photo, privacy, persistence, delete confirmation and removal');

    const links=await page.locator('.store-contact a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));assert(links.some(href=>href==='tel:2815550198'));assert(links.includes('mailto:storefront-qa@example.com'));assert(links.includes('https://example.com/book'));
    await page.locator('.store-connect-grid').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`after-${name}-bottom.png`),animations:'disabled'});
    checkpoint('contact URI, long content and scroll to final section');
    assert.equal(entry.errors.length,0,'Storefront JavaScript errors '+entry.errors.join('; '));

    if(packaged){
      const destinations=[];
      await page.route('https://taxiq-nexora-touch.vercel.app/**',async route=>{destinations.push(route.request().url());await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Community destination boundary</title>'});});
      for(const section of ['pages','deals','live','messages','groups','jobs','food','realestate']){
        phase='packaged destination '+section;
        const previous=destinations.length;await click(page,'.store-connect[data-section='+section+']');
        if(section==='live'){await page.getByRole('heading',{name:'Livestream & Video',exact:true}).waitFor();await page.locator('#editor.storefront-dialog').waitFor({state:'detached'});}
        else{await page.waitForURL(url=>url.origin==='https://taxiq-nexora-touch.vercel.app',{waitUntil:'domcontentloaded'});assert(destinations.length>previous,'Packaged destination '+section);}
        await page.goto(start,{waitUntil:'domcontentloaded'});await visible(page,'.store-head');
      }
      entry.destinations=destinations;
    }else{
      const destinations=[];
      for(const section of ['pages','deals','live','messages','groups','jobs','food','realestate']){
        phase='staff destination '+section;
        await click(page,'.store-connect[data-section='+section+']');const target=section==='messages'?'connect':section;
        if(section==='live'){await page.getByRole('heading',{name:'Livestream & Video',exact:true}).waitFor();await page.locator('#editor.storefront-dialog').waitFor({state:'detached'});}
        else await page.waitForURL(url=>url.searchParams.get('tab')===target);
        destinations.push({target,url:page.url()});
        await page.goto(origin+livePath,{waitUntil:'domcontentloaded'});await visible(page,'.store-head');
      }
      for(const [action,target] of [['shop-page','pages'],['shop-deal','deals']]){await click(page,'.store-tool-grid [data-action='+action+']');await page.waitForURL(url=>url.searchParams.get('tab')===target);destinations.push(target);await page.goto(origin+livePath,{waitUntil:'domcontentloaded'});await visible(page,'.store-head');}
      entry.destinations=destinations;
    }
    checkpoint('Community destinations and storefront tool navigation');
    if(!packaged&&viewport.name==='desktop'){
      await page.goto(origin+livePath+'&member=storefront-other-qa',{waitUntil:'domcontentloaded'});await visible(page,'.store-head');assert.equal(await page.locator('.store-progress').getAttribute('aria-valuenow'),'0','Another identity must not see the first storefront');
      await page.goto(origin+livePath,{waitUntil:'domcontentloaded'});await visible(page,'.store-head');assert.equal(await page.locator('.store-preview-title h2').textContent(),'Linh Studio · Personal Storefront');
      await page.goto(origin+'/html/v3.1/staff-community.html?tab=shop&account=business&role=tech',{waitUntil:'domcontentloaded'});await page.waitForURL(url=>url.searchParams.get('tab')==='feed');
      assert.equal(await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.canAccessFeature('shop')),false,'Linked staff must not gain business storefront management');
      checkpoint('personal identity isolation and linked-staff permission boundary');
    }
    assert.equal(entry.errors.length,0,'JavaScript errors '+entry.errors.join('; '));
    assert.equal(entry.failedRequests.length,0,'Failed essential requests '+JSON.stringify(entry.failedRequests));
    entry.pass=true;
  }catch(error){entry.failure={phase,message:error.message,stack:error.stack};if(page)await page.screenshot({path:path.join(output,'failure-'+name+'.png'),animations:'disabled'}).catch(()=>{});console.error('FAIL',name,phase,error.message);}
  finally{await context.close();saveResults();}
}
async function verifyModalLayouts(browser,viewport,packaged){
  const name=(packaged?'package':'staff')+'-'+viewport.name,entry=results.find(row=>row.name===name);
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.name==='phone',hasTouch:viewport.name!=='desktop'});
  try{
    await prepare(context);const page=await context.newPage();page.setDefaultTimeout(12000);
    await page.goto(packaged?pathToFileURL(path.join(repo,artifact)).href:origin+livePath,{waitUntil:'domcontentloaded'});await visible(page,'.store-head');
    entry.finalModalLayouts=[];
    for(const [trigger,form,suffix] of [['.store-head [data-action="edit-shop"]','#shop-form','setup-modal'],['.store-empty [data-action="shop-add-product"]','#item-form','item-modal']]){
      await click(page,trigger);await visible(page,form);const metrics=await formMetrics(page,form,viewport);
      assert.equal(metrics.columns.split(' ').length,viewport.name==='phone'?1:2,'Modal columns '+name);
      await page.screenshot({path:path.join(output,`after-${name}-${suffix}.png`),animations:'disabled'});
      await page.locator(form).locator('[type=submit]').scrollIntoViewIfNeeded();await page.locator(form).locator('.dialog-actions [data-action="close-dialog"]').click();await page.locator('#editor').waitFor({state:'hidden'});
      entry.finalModalLayouts.push({form,metrics});
    }
    console.log('FORM LAYOUT PASS',name);
  }catch(error){entry.pass=false;entry.failure={phase:'final form layouts',message:error.message};console.error('FORM LAYOUT FAIL',name,error.message);}
  finally{await context.close();saveResults();}
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    if(process.argv.includes('--baseline'))await baseline(browser);
    else {
      const before=JSON.parse(fs.readFileSync(path.join(output,'baseline.json')));
      assert.equal(before.sourceHash,hash('from-po/goi-community-giao-dev/04-MAN-HINH-PROTOTYPE/shell-community.html'),'Original PO was changed');
      for(const viewport of viewports.filter(viewport=>!staffDesktopOnly||viewport.name==='desktop'))for(const packaged of staffDesktopOnly?[false]:packageOnly?[true]:[false,true])await (formsOnly?verifyModalLayouts:verifyFlow)(browser,viewport,packaged);
      if(results.some(result=>!result.pass))process.exitCode=1;
      console.log('RESULT',results.filter(result=>result.pass).length+'/'+results.length);
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
