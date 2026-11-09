const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'../../..');
const output=process.env.ECOSYSTEM_OUTPUT||'/tmp/taxiq-header-ecosystem';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
  try {
    const file=path.resolve(repo,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!file.startsWith(repo+path.sep))throw Error('Invalid path');
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.end(await fs.readFile(file));
  }catch{res.statusCode=404;res.end();}
});
(async()=>{
  await fs.mkdir(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser; const results=[],errors=[];
  try {
    browser=await chromium.launch({headless:true});
    const origin='http://127.0.0.1:'+server.address().port;
    const headerSignatures=new Map();
    for(const width of [320,390,834,1440])for(const entry of ['pages/dashboard.html','pages/pos-front-desk.html','pages/staff-profile.html?account=personal','v3.1/community.html?account=business&tab=feed','v3.1/staff-community.html?account=personal&role=tech&tab=feed']) {
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      try {
        const page=await context.newPage();page.setDefaultTimeout(15000);
        await context.addInitScript(()=>{for(const key of ['nexora-community-tour-mobile-v1','nexora-community-tour-desktop-v1'])localStorage.setItem(key,'1');});
        page.on('pageerror',error=>errors.push({width,entry,error:error.message}));
        await page.goto(origin+'/html/'+entry,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>document.querySelector('.header.shell-header .shell-ecosystem-toggle'));
        await page.waitForFunction(()=>document.querySelector('link[data-shell-ecosystem-style]')?.sheet);
        if(entry.startsWith('v3.1/')){
          const signature=await page.locator('.header').evaluate(el=>({height:el.getBoundingClientRect().height,controls:Array.from(el.querySelectorAll('.shell-workspace-actions > a,.shell-workspace-actions > button,.shell-ecosystem-toggle')).map(control=>({label:control.getAttribute('aria-label'),width:control.getBoundingClientRect().width,height:control.getBoundingClientRect().height,color:getComputedStyle(control).color,icon:control.querySelector('svg')?.outerHTML||control.querySelector('img')?.getAttribute('src')}))}));
          if(entry.includes('staff-community'))assert.deepEqual(signature,headerSignatures.get(width));else headerSignatures.set(width,signature);
        }
        const toggle=page.locator('.header .shell-ecosystem-toggle'),panel=page.locator('.header .shell-ecosystem-panel');
        const before=page.url();
        await toggle.click();await panel.waitFor();
        assert.equal(page.url(),before);
        assert.equal(await toggle.getAttribute('aria-expanded'),'true');
        assert.equal(await panel.getByRole('menuitem').count(),6);
        await page.waitForFunction(()=>Array.from(document.querySelectorAll('.shell-ecosystem-item img')).every(img=>img.complete&&img.naturalWidth>0));
        const geometry=await panel.evaluate(el=>({box:el.getBoundingClientRect().toJSON(),overflow:el.scrollWidth>el.clientWidth,columns:getComputedStyle(el.querySelector('.shell-ecosystem-grid')).gridTemplateColumns.split(' ').length}));
        assert.ok(geometry.box.x>=0&&geometry.box.right<=width+1,JSON.stringify(geometry));
        assert.equal(geometry.overflow,false);
        assert.equal(geometry.columns,width<768?3:4);
        if(width>=768)assert.equal(geometry.box.width,500);
        await page.screenshot({path:path.join(output,`${width}-${entry.split('/')[1].split('.')[0]}.png`)});
        await toggle.click();await panel.waitFor({state:'hidden'});
        await toggle.click();await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
        assert.equal(await toggle.evaluate(el=>el===document.activeElement),true);
        await toggle.press('ArrowUp');await panel.waitFor();
        assert.equal(await page.locator(':focus img').getAttribute('alt'),'VLINKPAY');
        await page.keyboard.press('Home');assert.equal(await page.locator(':focus img').getAttribute('alt'),'VMMToken');
        await page.keyboard.press('Escape');
        const overflow=await page.evaluate(()=>document.body.style.overflow);
        await toggle.click();
        if(width<768){assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');await page.locator('.shell-ecosystem-backdrop').click({position:{x:2,y:500}});}
        else await page.locator('.shell-header-language').click();
        await panel.waitFor({state:'hidden'});
        assert.equal(await page.evaluate(()=>document.body.style.overflow),overflow);
        const travel=panel.getByRole('menuitem',{name:'VMMTRAVEL'});
        await toggle.click();await travel.click();assert.equal(page.url(),before);assert.equal(await panel.isVisible(),true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.header .shell-search-toggle').count(),entry.startsWith('v3.1/')?1:0);
        assert.equal(await page.locator('#localDiscovery,.community-header-location').count(),0);
        results.push({width,entry,pass:true});console.log('PASS',width,entry);
      }catch(error){results.push({width,entry,pass:false,error:error.stack});console.error('FAIL',width,entry,error.message);}
      finally{await context.close();}
    }
  }finally{
    await browser?.close();await new Promise(resolve=>server.close(resolve));
    await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));
  }
  console.log('TOTAL',results.filter(result=>result.pass).length+'/'+results.length,'pageErrors='+errors.length);
  assert.equal(errors.length,0,JSON.stringify(errors));assert.ok(results.every(result=>result.pass));
})().catch(error=>{console.error(error);process.exitCode=1;});
