const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'../../..'),output=process.env.LANGUAGE_OUTPUT||'/tmp/taxiq-community-language';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{try{const file=path.resolve(repo,'.'+new URL(req.url,'http://x').pathname);if(!file.startsWith(repo+path.sep))throw Error();res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
(async()=>{
  await fs.mkdir(output,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;const results=[],errors=[];
  try{
    browser=await chromium.launch({headless:true});const origin='http://127.0.0.1:'+server.address().port;
    for(const width of [390,1440])for(const account of ['business','personal']){
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      try{
        await context.addInitScript(()=>{for(const key of ['nexora-community-tour-mobile-v1','nexora-community-tour-desktop-v1'])localStorage.setItem(key,'1');});
        const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push({width,account,error:e.message}));
        await page.goto(origin+'/html/v3.1/'+(account==='business'?'community.html?account=business':'staff-community.html?account=personal')+'&tab=feed',{waitUntil:'domcontentloaded'});
        await page.locator('#feedPosts article').first().waitFor();
        await page.waitForFunction(()=>document.querySelector('link[data-shell-language-style]')?.sheet);
        if(width<768){
          assert.equal(Math.round((await page.locator('#feedComposerCard .feed-avatar').boundingBox()).height),42);
          assert.equal(Math.round((await page.locator('#feedComposerCard .feed-prompt-text').boundingBox()).height),42);
        }
        const menu=page.locator('.shell-language-menu'),toggle=page.locator('.shell-header-language');
        async function choose(locale){await toggle.click();await menu.locator('[data-shell-language="'+locale+'"]').click();await page.waitForFunction(locale=>document.documentElement.lang===locale,locale);await page.waitForTimeout(150);}
        for(const locale of ['vi','en','es-MX','zh-Hans','fr','ar','pt']){
          try{
            await choose(locale);
            const state=await page.evaluate(()=>{const api=window.NEXORA_COMMUNITY_LANGUAGE;return{selected:api.get(),stored:localStorage.getItem('nexora-community-language'),dir:document.documentElement.dir,expected:api.translate('Feed'),feed:document.getElementById('feedTitle').textContent.trim()};});
            assert.equal(state.selected,locale);assert.equal(state.stored,locale);assert.equal(state.feed,state.expected);assert.equal(state.dir,locale==='ar'?'rtl':'ltr');
            await toggle.click();assert.equal(await menu.locator('[aria-selected="true"]').getAttribute('data-shell-language'),locale);
            const box=await menu.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);await page.screenshot({path:path.join(output,`${width}-${account}-${locale}.png`)});
            await page.keyboard.press('Escape');assert.equal(await menu.isVisible(),false);
            results.push({width,account,locale,pass:true});console.log('PASS',width,account,locale);
          }catch(error){results.push({width,account,locale,pass:false,error:error.stack});console.error('FAIL',width,account,locale,error.message);}
        }
        await choose('vi');await page.reload({waitUntil:'domcontentloaded'});await page.locator('#feedPosts article').first().waitFor();
        assert.equal(await page.evaluate(()=>window.NEXORA_COMMUNITY_LANGUAGE.get()),'vi');
        await page.evaluate(()=>window.navigateCommunityHub('groups'));await page.waitForURL(url=>url.searchParams.get('tab')==='groups');
        await page.evaluate(()=>window.navigateCommunityHub('feed'));await page.waitForURL(url=>url.searchParams.get('tab')==='feed');
        if(width<768)await page.locator('.shell-search-toggle').click();else await page.locator('.header input[type="search"]').click();
        const search=page.locator('#community-search-dialog');await search.waitFor();
        await page.waitForFunction(()=>document.querySelector('#community-search-dialog')?.textContent.includes(window.NEXORA_COMMUNITY_LANGUAGE.translate('People you may know')));
        await search.locator('[data-search-close]').click();await choose('en');
        await page.evaluate(()=>window.navigateCommunityHub('jobs'));await page.locator('#jobsWorkflow').waitFor();
        if(account==='personal')assert.equal(await page.locator('.jobs-personal-editbar,.jobs-personal-demo,[data-jobs-copy-action]').count(),0);
        else{
          await page.locator('[data-jobs-tab="workers"]').click();await page.locator('[data-worker-filter="poWorkerGroup"]').waitFor();
          for(const id of ['poWorkerGroup','poWorkerSkill']){
            const control=page.locator('[data-worker-filter="'+id+'"]');assert.equal(await control.locator('.jobs-worker-choice svg').count(),0);
            assert.equal(await control.locator('.ts-control').evaluate(el=>getComputedStyle(el,'::after').right),'16px');
            await control.locator('.ts-control').click();assert.equal(await control.locator('.ts-dropdown .jobs-worker-choice svg').count(),0);await page.keyboard.press('Escape');
          }
        }
      }finally{await context.close();}
    }
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
  console.log('TOTAL',results.filter(row=>row.pass).length+'/'+results.length,'pageErrors='+errors.length);assert.equal(errors.length,0,JSON.stringify(errors));assert.ok(results.every(row=>row.pass));
})().catch(e=>{console.error(e);process.exitCode=1;});
