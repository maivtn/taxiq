const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {nativePane}=require('./native-pane.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5504';
const output=process.env.COMMUNITY_ROLE_OUTPUT||'/tmp/taxiq-v31-role-fix/browser';
fs.mkdirSync(output,{recursive:true});

(async()=>{
  const browser=await chromium.launch({headless:true});
  const results=[],errors=[];
  try{
    for(const width of [390,1280]){
      const context=await browser.newContext({viewport:{width,height:900}});
      try{
        await context.addInitScript(()=>{
          localStorage.setItem('nexora-community-tour-desktop-v1','1');
          localStorage.setItem('nexora-community-tour-mobile-v1','1');
        });
        const page=await context.newPage();page.setDefaultTimeout(15000);
        const jobs=page.locator('#communityPane');
        page.on('pageerror',error=>errors.push({width,message:error.message}));
        async function open(file,query){
          await page.goto(base+'/html/v3.1/'+file+'?'+query,{waitUntil:'domcontentloaded'});
          await jobs.locator('#jobsWorkflow').waitFor();
        }
        async function check(name,fn){
          await fn();results.push({width,name,pass:true});console.log('PASS '+width+' '+name);
        }
        async function personalControls(){
          assert.equal(await jobs.locator('#jobTemplates [data-template="hiring"]').isVisible(),false);
          assert.equal(await jobs.locator('[data-template="seeking"]:visible').count(),1);
          assert.equal(await jobs.locator('[data-jobs-action="open-pos"]').count(),0);
          assert.equal(await jobs.locator('button[data-jobs-tab="workers"]').count(),0);
        }
        async function blockedComposer(account,kind){
          const direct=await context.newPage();
          try{
            await direct.goto(base+'/html/v3.1/community/nexora-community-prototype.html?view=jobs&account='+account+'&composeKind='+kind,{waitUntil:'domcontentloaded'});
            await direct.locator('#jobsWorkflow').waitFor();
            assert.equal(await direct.locator('#templateForm').count(),0);
          }finally{await direct.close();}
        }
        await check('Personal route and posting controls',async()=>{
          await open('community.html','account=personal&tab=jobs');
          await page.waitForURL('**/staff-community.html**');await personalControls();
          assert.equal(await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.role),'staff');
        });
        await check('Personal cannot open hiring through a composer deep link',async()=>{
          for(const kind of ['hiring','deal','dayhire'])await blockedComposer('personal',kind);
          await personalControls();
          const original=page.url();
          await nativePane(page).evaluate(()=>window.parent.postMessage({type:'nexora-community-pos'},location.origin));
          await page.waitForTimeout(150);assert.equal(page.url(),original);
        });
        const title='Role QA seeking '+width;
        await check('Personal publishes seeking and reloads',async()=>{
          await jobs.locator('[data-template="seeking"]:visible').click();
          const form=jobs.locator('#templateForm');await form.waitFor();
          await form.locator('[name="industry"]').selectOption('Nail & làm đẹp');
          await form.locator('[name="role"]').selectOption('Thợ nail');
          await form.locator('[name="skills"]').fill('Gel-X');
          await form.locator('[name="city"]').fill('Houston, TX');
          await form.locator('[name="availability"]').fill('2026-11-10');
          await form.locator('[name="description"]').fill('Seeking a technician position in Houston.');
          await form.locator('[name="jobTitle"]').fill(title);
          await form.locator('[name="phone"]').fill('7135550199');
          await form.locator('[type="submit"]').click();
          await jobs.locator('#jobPosts').getByText(title,{exact:true}).waitFor();
          await page.reload({waitUntil:'domcontentloaded'});await jobs.locator('#jobsWorkflow').waitFor();
          await jobs.locator('button[data-jobs-tab="myPosts"]').click();
          await jobs.locator('#jobPosts').getByText(title,{exact:true}).waitFor();
        });
        await check('Personal hides all employer tabs and rejects transfer links',async()=>{
          for(const tab of ['transfer','services','workers'])assert.equal(await jobs.locator('button[data-jobs-tab="'+tab+'"]').count(),0);
          await open('staff-community.html','account=personal&tab=jobs&jobsTab=transfer');
          assert.equal(await jobs.locator('#jobsView').getAttribute('data-jobs-tab'),'browse');
          assert.equal(await jobs.locator('[data-jobs-extra="new-transfer"]').count(),0);
          await page.screenshot({path:path.join(output,'personal-jobs-'+width+'.png')});
        });
        await check('Linked staff remains a worker and rejects owner deep link',async()=>{
          await open('staff-community.html','role=tech&account=business&tab=jobs&jobsTab=workers');
          await personalControls();assert.equal(await jobs.locator('#jobsView').getAttribute('data-jobs-tab'),'browse');
        });
        await check('Salon switch restores salon actions and removes worker actions',async()=>{
          await open('community.html','account=business&tab=jobs');
          await page.waitForURL('**/community.html**');await jobs.locator('#jobsWorkflow').waitFor();
          assert.equal(await jobs.locator('#jobTemplates [data-template="hiring"]:visible,#localDiscovery [data-template="hiring"]:visible').count(),1);
          assert.equal(await jobs.locator('#jobTemplates [data-template="seeking"]').isVisible(),false);
          assert.equal(await jobs.locator('button[data-jobs-tab="profile"]').count(),0);
          await jobs.locator('button[data-jobs-tab="transfer"]').click();
          await jobs.locator('[data-jobs-extra="new-transfer"]').waitFor();
        });
        const transferTitle='Role QA salon transfer '+width;
        await check('Salon publishes transfer and reloads',async()=>{
          await jobs.locator('[data-jobs-extra="new-transfer"]').click();
          const form=jobs.locator('#jobsExtraForm');await form.waitFor();
          assert.equal(await form.locator('[name="transferType"]').inputValue(),'sell');
          await form.locator('[name="title"]').fill(transferTitle);
          await form.locator('[name="city"]').fill('Houston, TX');
          await form.locator('[name="description"]').fill('Salon available for transfer in Houston.');
          await form.locator('[type="submit"]').click();
          await jobs.locator('#jobPosts').getByText(transferTitle,{exact:true}).waitFor();
          await page.reload({waitUntil:'domcontentloaded'});await jobs.locator('#jobsWorkflow').waitFor();
          await jobs.locator('button[data-jobs-tab="transfer"]').click();
          await jobs.locator('#jobPosts').getByText(transferTitle,{exact:true}).waitFor();
          await page.screenshot({path:path.join(output,'salon-transfer-'+width+'.png')});
        });
        await check('Personal cannot open a salon transfer by its record link',async()=>{
          const transferId=await jobs.locator('#jobPosts article').filter({hasText:transferTitle}).locator('[data-jobs-extra="detail"]').getAttribute('data-id');
          await open('staff-community.html','account=personal&tab=jobs&jobsTab=transfer&jobId='+transferId);
          assert.equal(await jobs.locator('#jobsView').getAttribute('data-jobs-tab'),'browse');
          assert.equal(await jobs.locator('[data-jobs-dialog]').count(),0);
          await open('community.html','tab=jobs');
        });
        await check('Salon cannot open seeking through a composer deep link',async()=>{
          for(const kind of ['seeking','daywork'])await blockedComposer('business',kind);
        });
        await check('Salon hiring composer URL opens salon recruitment',async()=>{
          await page.goto(base+'/html/v3.1/community.html?tab=jobs&composeKind=hiring',{waitUntil:'domcontentloaded'});
          await page.waitForURL(url=>url.pathname.endsWith('/html/pages/pos-recruitment.html'));
          await open('community.html','tab=jobs');
        });
        await check('Salon hiring creation opens salon recruitment',async()=>{
          await jobs.locator('#jobTemplates [data-template="hiring"]:visible,#localDiscovery [data-template="hiring"]:visible').click();
          await page.waitForURL(url=>url.pathname.endsWith('/html/pages/pos-recruitment.html'));
        });
        await check('Staff role alias uses personal shell',async()=>{
          await open('community.html','role=staff&tab=jobs');
          await page.waitForURL('**/staff-community.html**');await personalControls();
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        });
      }finally{await context.close();}
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));
    console.log('TOTAL '+results.length+' passed; pageErrors='+errors.length);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
