const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'../../..');
const output=process.env.COMMUNITY_CREATE_OUTPUT||'/tmp/taxiq-header-create';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
const server=http.createServer(async(req,res)=>{
  try{const file=path.resolve(repo,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(repo+path.sep))throw Error('Invalid path');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}
  catch{res.statusCode=404;res.end();}
});
(async()=>{
  await fs.mkdir(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;const results=[];
  try{
    browser=await chromium.launch({headless:true});
    const base='http://127.0.0.1:'+server.address().port;
    for(const width of [320,390,430])for(const account of ['business','personal']){
      const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      try{
        await context.addInitScript(()=>{localStorage.setItem('nexora-community-tour-mobile-v1','1');localStorage.setItem('nexora-community-tour-desktop-v1','1');});
        const page=await context.newPage();page.setDefaultTimeout(12000);
        const errors=[];page.on('pageerror',error=>errors.push(error.message));
        const entry=account==='personal'?'staff-community.html?account=personal&role=tech':'community.html?account=business';
        const open=async(tab='feed')=>{await page.goto(base+'/html/v3.1/'+entry+'&tab='+tab,{waitUntil:'domcontentloaded'});await page.locator('#communityCreate').waitFor();};
        const menu=page.locator('#communityCreateMenu'),trigger=page.locator('#communityCreate');
        async function expanded(){await menu.waitFor();assert.equal(await trigger.getAttribute('aria-expanded'),'true');assert.equal(await menu.evaluate(el=>el.ownerDocument===document),true);const box=await menu.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);assert.ok(box.y+box.height<=844);assert.ok(await menu.locator('[role="menuitem"]').count()>=12);}
        async function check(name,fn){try{await fn();results.push({width,account,name,pass:true});console.log('PASS',width,account,name);}catch(error){results.push({width,account,name,pass:false,error:error.stack});console.log('FAIL',width,account,name,error.message);await page.screenshot({path:path.join(output,`${width}-${account}-${name.replace(/\W+/g,'-')}.png`)}).catch(()=>{});}}
        await check('native menu opens even when Feed is unavailable',async()=>{
          await page.route('**/nexora-community-prototype.html*',route=>route.abort());
          await open();await trigger.tap();await expanded();await trigger.tap();await menu.waitFor({state:'hidden'});
          await page.unroute('**/nexora-community-prototype.html*');
        });
        await check('open close outside Escape keyboard scroll and role actions',async()=>{
          await open();await trigger.tap();await expanded();
          assert.equal(await menu.locator('[data-create-kind="deal"]').count(),account==='business'?1:0);
          assert.equal(await menu.locator('[data-create-kind="seeking"]').count(),account==='personal'?1:0);
          await menu.locator('[data-create-kind="photos"]').scrollIntoViewIfNeeded();
          assert.equal(await menu.locator('img').evaluateAll(nodes=>nodes.every(node=>node.complete&&node.naturalWidth>0)),true);
          await menu.evaluate(el=>el.scrollTop=0);await page.screenshot({path:path.join(output,`${width}-${account}-dropdown.png`)});
          await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
          await trigger.press('ArrowDown');await expanded();await page.keyboard.press('End');assert.equal(await menu.locator('[data-create-kind="live"]').evaluate(el=>el.getRootNode().activeElement===el),true);
          await page.keyboard.press('Escape');await trigger.tap();await page.locator('.community-heading h1').tap();await menu.waitFor({state:'hidden'});
        });
        await check('open from Pages without changing route',async()=>{
          await open('pages');const before=page.url();await trigger.tap();await expanded();assert.equal(page.url(),before);await page.keyboard.press('Escape');
        });
        await check('create actions open their existing forms',async()=>{
          await open();const frame=page.frameLocator('#communityPane');await frame.locator('#feedComposerCard').waitFor();
          for(const kind of ['showcase','tip','question','poll','event']){
            await trigger.tap();await menu.locator(`[data-create-kind="${kind}"]`).tap();
            await frame.locator(`#templateForm[data-kind="${kind}"]`).waitFor();await frame.locator('#closeModal').click();
          }
          for(const kind of ['sale','want']){await trigger.tap();await menu.locator(`[data-create-kind="${kind}"]`).tap();await frame.locator('#listingForm').waitFor();assert.equal(await frame.locator('#listingForm [name="type"]').inputValue(),kind);await frame.locator('#closeModal').click();}
          await trigger.tap();await menu.locator('[data-create-kind="blog"]').tap();await frame.locator('#blogForm').waitFor();await frame.locator('#closeModal').click();
          if(account==='personal'){await trigger.tap();await menu.locator('[data-create-kind="seeking"]').tap();await frame.locator('#templateForm[data-kind="seeking"]').waitFor();await frame.locator('#closeModal').click();}
          await trigger.tap();await menu.locator('[data-create-kind="photos"]').tap();await page.locator('.community-extra-pane #editor[open]').waitFor();assert.equal(await menu.isVisible(),false);
          await page.locator('.community-extra-pane #editor[open] [data-action="close-dialog"]').click();
        });
        assert.deepEqual(errors,[]);
      }finally{await context.close();}
    }
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));}
  assert.ok(results.every(row=>row.pass),'Create menu browser regression failed');
})().catch(error=>{console.error(error);process.exitCode=1;});
