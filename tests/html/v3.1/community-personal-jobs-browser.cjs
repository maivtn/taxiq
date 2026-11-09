const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.COMMUNITY_BASE_URL || 'http://127.0.0.1:5530';
const output = process.env.COMMUNITY_PERSONAL_JOBS_OUTPUT || '/tmp/community-personal-jobs';
const results = [], errors = [];
(async () => {
  await fs.mkdir(output, {recursive:true});
  const browser = await chromium.launch({headless:true});
  try {
    for (const width of [390, 834, 1440]) {
      const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      try {
        await context.addInitScript(() => {
          for (const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1']) localStorage.setItem(key,'1');
        });
        const page = await context.newPage(); page.setDefaultTimeout(20000);
        page.on('pageerror', error => errors.push({width,error:error.message}));
        const hub = page.locator('#community-staging,#community-hub');
        const jobs = hub.locator('#jobsView');
        const landing = jobs.locator('.jobs-personal-entry-content');
        async function open(query='account=personal&tab=jobs',entry='community.html') {
          await page.goto(`${base}/html/v3.1/${entry}?${query}`, {waitUntil:'domcontentloaded'});
          await jobs.locator('#jobsWorkflow').waitFor({state:'attached'});
        }
        async function check(name,run) {
          try {await run();results.push({width,name,pass:true});console.log('PASS',width,name);}
          catch (error) {results.push({width,name,pass:false,error:error.stack});console.log('FAIL',width,name,error.message);await page.screenshot({path:path.join(output,`${width}-${name.replace(/\W+/g,'-')}-failed.png`)}).catch(()=>{});}
        }
        await check('account URLs preserve context and reload',async()=>{
          await open('tab=jobs&rev=url-check&member=URL%20Business#kept');
          let url = new URL(page.url());
          assert.equal(url.searchParams.get('account'),'business');assert.equal(url.searchParams.get('rev'),'url-check');assert.equal(url.hash,'#kept');
          assert.equal(await landing.count(),0);
          assert.equal(await page.evaluate(()=>NEXORA_COMMUNITY_SHARED.role),'owner');
          await page.reload();await jobs.locator('#jobsWorkflow').waitFor({state:'attached'});assert.equal(new URL(page.url()).searchParams.get('account'),'business');
          await open('account=personal&tab=jobs&rev=url-check#kept');
          assert.ok(new URL(page.url()).pathname.endsWith('/staff-community.html'));
          assert.equal(new URL(page.url()).searchParams.get('account'),'personal');assert.equal(new URL(page.url()).searchParams.get('rev'),'url-check');
          await page.reload();await landing.waitFor();assert.equal(new URL(page.url()).searchParams.get('account'),'personal');
        });
        await check('business keeps its workflow under the two section tabs',async()=>{
          await open('account=business&tab=jobs');
          assert.equal(await landing.count(),0);
          assert.equal(await jobs.locator('#jobsWorkflow').isVisible(),true);
          assert.equal(await jobs.locator('.jobs-nav [data-jobs-tab="transfer"]').isVisible(),true);
          assert.equal(await jobs.locator('.jobs-nav [data-jobs-action="open-pos"]').isVisible(),true);
          const navBox=await jobs.locator('.jobs-workflow-head').boundingBox();
          const heroBox=await jobs.locator('.community-po-jobs-hero').boundingBox();
          const toolbarBox=await jobs.locator('#jobsToolbar').boundingBox();
          assert.ok(heroBox.y>=navBox.y+navBox.height,'Business tabs precede the hiring hero');
          assert.ok(toolbarBox.y>=heroBox.y+heroBox.height,'Search and filters follow the hiring hero');
          assert.deepEqual(await jobs.locator('.jobs-personal-sections button').allTextContents(),['All jobs','Extra shifts']);
          await jobs.locator('.jobs-personal-sections [data-view="daywork"]').click();
          await page.waitForURL(url=>url.searchParams.get('tab')==='shift');
          const shifts=hub.locator('#dayworkView');
          await shifts.locator('#communityShiftsWorkflow').waitFor();
          assert.equal(await shifts.locator('.jobs-personal-sections .active').innerText(),'Extra shifts');
          assert.equal(await shifts.locator('[data-shifts-action="post"]').isVisible(),true);
          await shifts.locator('.jobs-personal-sections [data-view="jobs"]').click();
          await jobs.locator('#jobsWorkflow').waitFor();
          assert.equal(new URL(page.url()).searchParams.get('account'),'business');
          await page.screenshot({path:path.join(output,`business-jobs-${width}.png`)});
        });
        await check('personal PO hero and three starting paths',async()=>{
          await open();await landing.waitFor();
          assert.deepEqual(await landing.locator('.jobs-personal-path h3').allTextContents(),['I am looking for work','I am free for a shift','I offer services']);
          assert.equal(await landing.locator('.community-po-jobs-hero h2').innerText(),'I want to work');
          const hero = await landing.locator('.community-po-jobs-hero').boundingBox();
          const paths = await landing.locator('.jobs-personal-paths').boundingBox();
          assert.ok(paths.y>=hero.y+hero.height);
          assert.equal(await jobs.locator(':scope > .feature-intro').isVisible(),false);
          for (const selector of ['#jobsWorkflow',':scope > .feature-layout']) assert.equal(await jobs.locator(selector).isVisible(),true,'Shared job list is visible below the personal entry');
          const landingBox=await landing.boundingBox(),navBox=await jobs.locator('.jobs-workflow-head').boundingBox(),toolbarBox=await jobs.locator('#jobsToolbar').boundingBox();
          assert.ok(landingBox.y>=navBox.y+navBox.height,'Personal tabs precede the introductory panel');
          assert.ok(toolbarBox.y>=landingBox.y+landingBox.height,'Search and filters follow the introductory panel');
          assert.equal(await jobs.locator('.jobs-personal-sections button').count(),2);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
          assert.equal(await jobs.locator('[data-jobs-action="open-pos"]').count(),0);
          const icons=landing.locator('.jobs-personal-symbol img');
          assert.equal(await icons.count(),3);
          await page.waitForFunction(()=>[...document.querySelectorAll('.jobs-personal-symbol img')].every(img=>img.complete&&img.naturalWidth>0));
          assert.deepEqual(await icons.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src').split('/').pop())),['issue-2040-oneqr-briefcase-3d.png','issue-2040-oneqr-calendar-clock-3d.png','issue-2040-oneqr-wrench-3d.png']);
          assert.equal(page.frames().length,1);
          await page.screenshot({path:path.join(output,`personal-jobs-${width}.png`)});
        });
        await check('personal reuses hiring list search details saved jobs and reload',async()=>{
          await open('tab=jobs&account=personal&jobsTab=browse&shiftTab=browse','staff-community.html');
          const list=jobs.locator('#jobPosts');
          await jobs.locator('[data-jobs-filter="hiring"]').click();
          const first=list.locator('.jobs-card').first();await first.waitFor();
          assert.ok(await list.locator('[data-jobs-action="apply"]').count()>0);
          assert.equal(await list.locator('[data-jobs-action="apply"]').count(),await list.locator('.jobs-title-link').count());
          const id=await first.getAttribute('data-job-id'),title=await first.locator('.jobs-title-link').innerText();
          await jobs.locator('#jobsSearch').fill(title);
          await page.waitForFunction(title=>[...document.querySelectorAll('#jobPosts .jobs-title-link')].every(node=>node.textContent.includes(title)),title);
          const card=list.locator(`[data-job-id="${id}"]`);await card.waitFor();
          await card.locator('[data-jobs-action="detail"]').first().click();await hub.locator('[data-jobs-dialog]').waitFor();
          await hub.locator('[data-jobs-action="dismiss"]').click();
          await card.locator('[data-jobs-action="save"]').click();
          await jobs.locator('[data-jobs-filter="saved"]').click();
          assert.equal(await card.locator('[data-jobs-action="save"]').getAttribute('aria-pressed'),'true');
          await page.reload();await jobs.locator('#jobsSearch').waitFor();
          await jobs.locator('[data-jobs-filter="saved"]').click();await card.waitFor();
          assert.equal(await card.locator('[data-jobs-action="save"]').getAttribute('aria-pressed'),'true');
          assert.equal(new URL(page.url()).searchParams.get('account'),'personal');
          await card.locator('[data-jobs-action="save"]').click();
          await jobs.locator('[data-jobs-filter="all"]').click();
          await jobs.locator('#jobsSearch').fill('no matching hiring listing 8f91');
          await list.locator('.jobs-empty').waitFor();
          await jobs.locator('#jobsSearch').fill('');await list.locator('.jobs-card').first().waitFor();
        });
        await check('personal shift samples filters payments and changes survive reload',async()=>{
          await open('tab=shift&account=personal&jobsTab=browse&shiftTab=my-shifts','staff-community.html');
          const shifts=hub.locator('#dayworkView'),panel=shifts.locator('#shift-panel-my-shifts');
          await panel.locator('#shift-assignment-shift-demo-personal-nexora2-booked').waitFor();
          for(const id of ['booked','review','deposit'])await panel.locator('#shift-assignment-shift-demo-personal-nexora2-'+id).waitFor();
          await panel.locator('[data-shifts-action="assignmentStatus"][data-shifts-id="Confirmed"]').click();
          assert.equal(await panel.locator('[id^="shift-assignment-"]').count(),1);
          await panel.locator('[data-shifts-action="assignmentStatus"][data-shifts-id="All"]').click();
          const deposit=panel.locator('#shift-assignment-shift-demo-personal-nexora2-deposit');
          await deposit.locator('[data-shifts-action="settlement"]').first().click();await hub.locator('.shifts-dialog').waitFor();
          await hub.locator('.shifts-dialog [data-shifts-action="close"]').click();
          await deposit.locator('[data-shifts-action="cancelAssignment"]').click();
          await hub.locator('.shifts-dialog [data-shifts-action="confirmCancel"]').click();
          await page.reload();await shifts.locator('#communityShiftsWorkflow').waitFor();
          assert.equal(await panel.locator('#shift-assignment-shift-demo-personal-nexora2-deposit').count(),0);
          await panel.locator('[data-shifts-action="filter"][data-shifts-id="History"]').click();
          await panel.locator('#shift-assignment-shift-demo-completed-2').waitFor();
          await panel.locator('#shift-assignment-shift-demo-personal-nexora2-deposit').waitFor();
          const count=await page.evaluate(()=>JSON.parse(localStorage.getItem('nexora-community-shifts-workflow-v1')).assignments.filter(row=>row.id==='shift-demo-personal-nexora2-deposit').length);
          assert.equal(count,1);
          assert.equal(new URL(page.url()).searchParams.get('account'),'personal');
          await page.screenshot({path:path.join(output,`personal-my-shifts-${width}.png`)});
        });
        await check('seeking and service entry open retained forms',async()=>{
          await open();
          for (const selector of ['.community-po-hero-actions [data-template="seeking"]','[data-jobs-path="career"] button']) {
            await landing.locator(selector).click();await hub.locator('#templateForm[data-kind="seeking"]').waitFor();
            await hub.locator('#closeModal').click();await hub.locator('#templateForm').waitFor({state:'hidden'});
          }
          await landing.locator('[data-jobs-path="service"] button').click();
          await hub.locator('#jobsExtraForm[data-kind="service-offer"]').waitFor();
          await hub.locator('[data-jobs-action="dismiss"]').click();
          assert.equal(new URL(page.url()).searchParams.get('account'),'personal');
        });
        await check('availability save and reload',async()=>{
          await open();await landing.locator('[data-jobs-path="shift"] button').click();
          const form = hub.locator('#jobsAvailabilityForm');await form.waitFor();
          await form.locator('[name="kind"]').selectOption('weekly');await form.locator('[name="day"]').selectOption('1');
          await form.locator('[name="start"]').fill('09:00');await form.locator('[name="end"]').fill('12:00');
          await form.locator('[type="submit"]').click();await form.waitFor({state:'hidden'});
          await jobs.locator('.jobs-nav [data-jobs-tab="availability"]').click();
          await page.waitForURL(url=>url.searchParams.get('jobsTab')==='availability');
          await page.reload();await jobs.locator('.po-availability-week').waitFor();
          assert.ok((await jobs.locator('.po-availability-week').innerText()).includes('09:00–12:00'));
          assert.equal(new URL(page.url()).searchParams.get('account'),'personal');
        });
        await check('matches and shifts return preserve account',async()=>{
          await open();await landing.locator('[data-jobs-tab="matched"]').click();await page.waitForURL(url=>url.searchParams.get('jobsTab')==='matched');
          assert.equal(await landing.locator('.jobs-personal-panel').isVisible(),false);
          await jobs.locator('.jobs-personal-sections [data-jobs-tab="browse"]').click();await landing.locator('.jobs-personal-panel').waitFor();
          await jobs.locator('.jobs-personal-sections [data-view="daywork"]').click();await page.waitForURL(url=>url.searchParams.get('tab')==='shift');
          assert.equal(new URL(page.url()).searchParams.get('account'),'personal');
          await hub.locator('#dayworkView .jobs-personal-shifts-nav [data-view="jobs"]').click();await page.waitForURL(url=>url.searchParams.get('tab')==='jobs');
          await landing.locator('.jobs-personal-panel').waitFor();
          await page.goBack();await hub.locator('#dayworkView').waitFor();
          assert.equal(new URL(page.url()).searchParams.get('account'),'personal');
          await page.goForward();await landing.locator('.jobs-personal-panel').waitFor();
        });
        await check('PO copy editing saves cancels and is identity scoped',async()=>{
          await open();await landing.locator('[data-jobs-copy-action="edit"]').click();
          await landing.locator('[data-jobs-copy="heroTitle"]').fill('My work availability');
          await landing.locator('[data-jobs-copy-action="save"]').click();await page.reload();await landing.waitFor();
          assert.equal(await landing.locator('[data-jobs-copy="heroTitle"]').innerText(),'My work availability');
          await landing.locator('[data-jobs-copy-action="edit"]').click();await landing.locator('[data-jobs-copy="heroTitle"]').fill('Unsaved heading');
          await landing.locator('[data-jobs-copy-action="cancel"]').click();assert.equal(await landing.locator('[data-jobs-copy="heroTitle"]').innerText(),'My work availability');
          await open('account=personal&tab=jobs&member=Other%20Member');
          assert.equal(await landing.locator('[data-jobs-copy="heroTitle"]').innerText(),'I want to work');
        });
        await check('linked staff keeps business context and worker permissions',async()=>{
          await open('role=tech&tab=jobs','staff-community.html');
          assert.equal(new URL(page.url()).searchParams.get('account'),'business');
          assert.equal(new URL(page.url()).searchParams.get('role'),'tech');
          assert.equal(await page.evaluate(()=>NEXORA_COMMUNITY_SHARED.role),'staff');
          assert.equal(await landing.count(),0);
          assert.equal(await jobs.locator('#jobsWorkflow').isVisible(),true);
          assert.equal(await jobs.locator('.jobs-personal-sections button').count(),2);
          assert.equal(await jobs.locator('[data-jobs-action="open-pos"]').count(),0);
        });
      } finally {await context.close();}
    }
  } finally {await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
  console.log('TOTAL',results.filter(row=>row.pass).length+'/'+results.length,'errors='+errors.length);
  process.exitCode=results.some(row=>!row.pass)||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
