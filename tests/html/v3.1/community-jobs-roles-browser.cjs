const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
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
        page.on('pageerror',error=>errors.push({width,message:error.message}));
        async function open(file,query){
          await page.goto(base+'/html/v3.1/'+file+'?'+query,{waitUntil:'domcontentloaded'});
          await page.locator('#jobsWorkflow').waitFor();
        }
        async function check(name,fn){
          await fn();results.push({width,name,pass:true});console.log('PASS '+width+' '+name);
        }
        async function personalControls(){
          assert.equal(await page.locator('[data-template="hiring"]').isVisible(),false);
          assert.equal(await page.locator('[data-template="seeking"]').isVisible(),true);
          assert.equal(await page.locator('[data-jobs-action="open-pos"]').count(),0);
          assert.equal(await page.locator('[data-jobs-tab="workers"]').count(),0);
        }
        await check('Personal route and posting controls',async()=>{
          await open('community.html','account=personal&tab=jobs');
          await page.waitForURL('**/staff-community.html**');await personalControls();
          assert.ok((await page.locator('#communityDemoRoleButton').innerText()).includes('Personal'));
        });
        const title='Role QA seeking '+width;
        await check('Personal publishes seeking and reloads',async()=>{
          await page.locator('[data-template="seeking"]').click();
          const form=page.locator('#templateForm');await form.waitFor();
          await form.locator('[name="industry"]').selectOption('Nail & làm đẹp');
          await form.locator('[name="role"]').selectOption('Thợ nail');
          await form.locator('[name="skills"]').fill('Gel-X');
          await form.locator('[name="city"]').fill('Houston, TX');
          await form.locator('[name="availability"]').fill('2026-11-10');
          await form.locator('[name="description"]').fill('Seeking a technician position in Houston.');
          await form.locator('[name="jobTitle"]').fill(title);
          await form.locator('[name="phone"]').fill('7135550199');
          await form.locator('[type="submit"]').click();
          await page.locator('#jobPosts').getByText(title,{exact:true}).waitFor();
          await page.reload({waitUntil:'domcontentloaded'});await page.locator('#jobsWorkflow').waitFor();
          await page.locator('[data-jobs-tab="myPosts"]').click();
          await page.locator('#jobPosts').getByText(title,{exact:true}).waitFor();
        });
        await check('Personal transfers allow browsing and contact only',async()=>{
          await page.locator('[data-jobs-tab="transfer"]').click();
          assert.equal(await page.locator('[data-jobs-extra="new-transfer"]').count(),0);
          assert.equal(await page.locator('[data-jobs-extra="transfer-template"]').count(),0);
          assert.equal(await page.locator('[data-jobs-extra="edit"]').count(),0);
          await page.locator('#jobsExtraSearch').fill('');
          await page.screenshot({path:path.join(output,'personal-transfer-'+width+'.png')});
        });
        await check('Linked staff remains a worker and rejects owner deep link',async()=>{
          await open('staff-community.html','role=tech&account=business&tab=jobs&jobsTab=workers');
          await personalControls();assert.equal(await page.locator('#jobsView').getAttribute('data-jobs-tab'),'browse');
        });
        await check('Salon switch restores salon actions and removes worker actions',async()=>{
          await page.locator('#communityDemoRoleButton').click();await page.locator('[data-demo-account="salon"]').click();
          await page.waitForURL('**/community.html**');await page.locator('#jobsWorkflow').waitFor();
          assert.equal(await page.locator('[data-template="hiring"]').isVisible(),true);
          assert.equal(await page.locator('[data-template="seeking"]').isVisible(),false);
          assert.equal(await page.locator('[data-jobs-tab="profile"]').count(),0);
          await page.locator('[data-jobs-tab="transfer"]').click();
          await page.locator('[data-jobs-extra="new-transfer"]').waitFor();
        });
        const transferTitle='Role QA salon transfer '+width;
        await check('Salon publishes transfer and reloads',async()=>{
          await page.locator('[data-jobs-extra="new-transfer"]').click();
          const form=page.locator('#jobsExtraForm');await form.waitFor();
          assert.equal(await form.locator('[name="transferType"]').inputValue(),'sell');
          await form.locator('[name="title"]').fill(transferTitle);
          await form.locator('[name="city"]').fill('Houston, TX');
          await form.locator('[name="description"]').fill('Salon available for transfer in Houston.');
          await form.locator('[type="submit"]').click();
          await page.locator('#jobPosts').getByText(transferTitle,{exact:true}).waitFor();
          await page.reload({waitUntil:'domcontentloaded'});await page.locator('#jobsWorkflow').waitFor();
          await page.locator('[data-jobs-tab="transfer"]').click();
          await page.locator('#jobPosts').getByText(transferTitle,{exact:true}).waitFor();
          await page.screenshot({path:path.join(output,'salon-transfer-'+width+'.png')});
        });
        await check('Salon hiring creation opens salon recruitment',async()=>{
          await page.locator('[data-template="hiring"]').click();
          await page.waitForURL('**/html/pages/pos-recruitment.html');
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
