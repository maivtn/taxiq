const fs=require('node:fs'),path=require('node:path');const {webkit,devices}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output='/tmp/community-iphone-contracts-20261106';fs.mkdirSync(output,{recursive:true});const results=[];
(async()=>{
 for(const role of ['owner','staff']){
  const context=await webkit.launchPersistentContext('/tmp/community-iphone-extra-recheck-profile-'+role,{headless:false,...devices['iPhone 8'],viewport:{width:375,height:667},locale:'en-US'});const page=await context.newPage();
  const pane=()=>page.locator('#community-staging,#community-hub').locator('.community-extra-pane');async function open(route){await page.goto('http://127.0.0.1:5503/html/v3.1/'+(role==='owner'?'community.html?':'staff-community.html?role=tech&account=personal&')+'tab='+route,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub);}
  if(role==='owner')for(const route of ['shop','reels','live','news']){await open(route);const duplicated=await pane().locator('.topbar').isVisible();const screenshot='duplicate-header-'+route+'-'+role+'-375x667.png';await page.screenshot({path:path.join(output,screenshot)});results.push({name:'one shared shell header',role,route,pass:!duplicated,actualInnerHeaderVisible:duplicated,screenshot});}
  await open('news');const article=pane().locator('.news-card').filter({hasText:'IPHONE QA Community update '+role}).first();await article.waitFor();const time=article.locator('time');await time.scrollIntoViewIfNeeded();const actual=await time.innerText(),screenshot='news-date-'+role+'-375x667.png';await page.screenshot({path:path.join(output,screenshot)});results.push({name:'US display date format',role,route:'news',pass:/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(actual),actual,expected:'MMM D, YYYY',screenshot});await context.close();
 }
 const result={engine:'WebKit',version:'26.5',viewport:{width:375,height:667},results,pass:results.every(row=>row.pass)};fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(result.pass?0:2);
})().catch(e=>{console.error(e);process.exit(1)});
