const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5504';
const output=process.env.COMMUNITY_ROLE_OUTPUT||'/tmp/taxiq-community-demo-roles';
fs.mkdirSync(output,{recursive:true});
const routes=['feed','groups','market','pages','deals','jobs','shift','blog','connect','contacts','calls','privacy','food','realestate','reels','live','news','wallet','wheel','meet','account','assistant','notifications','stories','people','post','food-market'];
const rows=[],errors=[];
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const width of [390,1280]){
      const context=await browser.newContext({viewport:{width,height:900}});
      try{
        await context.addInitScript(()=>{
          for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');
        });
        const page=await context.newPage();page.setDefaultTimeout(12000);
        page.on('pageerror',error=>errors.push({width,error:error.message}));
        const host=page.locator('#community-staging,#community-hub');
        const classic=()=>page.locator('#communityPane');
        async function open(role,route,extra=''){
          await page.goto(base+'/html/v3.1/'+(role==='personal'?'staff-community.html?account=personal':'community.html?account=business')+'&tab='+route+extra,{waitUntil:'domcontentloaded'});
          await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub);
          if(['connect','contacts','calls','privacy'].includes(route)){await page.locator('#connectPane').locator('.native-body').waitFor();return;}
          await classic().locator('#feedView').waitFor({state:'attached'});
          if(route==='assistant')await host.locator('#ai-dialog:visible').waitFor();
          else if(['food','realestate'].includes(route))await host.locator('.community-document-pane iframe').waitFor();
          else if(['reels','live','news','wallet','wheel','meet','account','assistant','notifications','stories','people','post','food-market'].includes(route))await host.locator('.community-extra-pane>section:visible').waitFor();
          else if(route==='jobs')await classic().locator('#jobsWorkflow').waitFor();
          else if(route==='deals')await classic().locator('#communityDealsView').waitFor();
          else if(['feed','groups','market','pages','shift','blog'].includes(route))await classic().locator('#'+({feed:'feed',groups:'groups',market:'market',pages:'pages',shift:'daywork',blog:'blog'}[route])+'View').waitFor();
        }
        async function check(role,name,fn){
          try{await fn();rows.push({width,role,name,pass:true});console.log('PASS '+width+' '+role+' '+name);}
          catch(error){rows.push({width,role,name,pass:false,error:error.message});await page.screenshot({path:path.join(output,width+'-'+role+'-'+name.replace(/[^a-z0-9]+/gi,'-')+'-failed.png')}).catch(()=>{});console.log('FAIL '+width+' '+role+' '+name+' '+error.message.slice(0,350));}
        }
        async function personalControls(){
          assert.equal(await host.locator('[data-community-extra="shop"],[data-community-extra="transfer"]').count(),0);
          assert.equal(await classic().locator('[data-community-shortcut="shop"],[data-community-shortcut="transfer"]').count(),0);
          assert.equal(await host.locator('[data-section="shop"]:visible,[data-section="transfer"]:visible,[data-food-action="edit-shop"]:visible,[data-food-action="post-dish"]:visible').count(),0);
        }
        for(const role of ['personal','salon']){
          for(const route of routes)await check(role,'screen '+route,async()=>{
            await open(role,route);
            assert.equal(await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.role),role==='personal'?'staff':'owner');
            if(role==='personal')await personalControls();
            if(route==='jobs'){
              for(const tab of ['transfer','workers','services'])assert.equal(await classic().locator('[data-jobs-tab="'+tab+'"]').count(),role==='personal'?0:1);
              assert.equal(await classic().locator('[data-jobs-action="open-pos"]').count(),role==='personal'?0:1);
              assert.equal(Boolean(await classic().locator('[data-template="hiring"]:visible').count()||await host.locator('#communityCreateMenu [data-create-kind="hiring"]').count()),role==='salon');
              assert.equal(Boolean(await classic().locator('[data-template="seeking"]:visible').count()||await host.locator('#communityCreateMenu [data-create-kind="seeking"]').count()),role==='personal');
              if(role==='personal'&&width===390)assert.ok(await classic().locator('#jobsView [data-view="daywork"]').count()||await host.locator('[data-quick-view="daywork"]').count());
            }
            if(route==='shift'){
              assert.equal(await classic().locator('[data-shifts-action="post"]').isVisible(),role==='salon');
              assert.equal(await classic().locator('#shiftTemplates [data-template="daywork"]').isVisible(),role==='personal');
            }
            if(route==='post')assert.equal(await host.locator('#editor [data-social-type="coupon"]').count(),role==='personal'?0:1);
            if(route==='deals')assert.equal(await classic().locator('.community-deals-business').count(),role==='personal'?0:1);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
            if(['feed','jobs','shift','deals','food-market'].includes(route))await page.screenshot({path:path.join(output,width+'-'+role+'-'+route+'.png')});
          });
          await check(role,'More drawer and Feed shortcuts',async()=>{
            await open(role,'feed');
            if(width>800)await classic().locator('#feedActionsToggle').click();
            assert.equal(await classic().locator('#feedActions [data-template="deal"]').count(),role==='personal'?0:1);
            for(const feature of ['shop','transfer'])assert.equal(await classic().locator('[data-community-shortcut="'+feature+'"]').count(),role==='personal'?0:1);
            await host.locator('.community-nav-more:visible').first().click();
            await host.locator('#ecosystemMenu').waitFor();
            for(const feature of ['shop','transfer'])assert.equal(await host.locator('[data-community-extra="'+feature+'"]:visible').count(),role==='personal'?0:1);
            await host.locator('[data-community-extra="people"]').click();
            await page.waitForURL(url=>url.searchParams.get('tab')==='people');
          });
        }
        for(const role of ['personal','salon']){
          await check(role,'Jobs tabs and service composer',async()=>{
            await open(role,'jobs');
            const tabs=role==='personal'?['browse','myPosts','applied','profile','matched','availability','offering','invites']:['browse','myPosts','workers','invites','services','transfer'];
            for(const tab of tabs){
              await classic().locator('button[data-jobs-tab="'+tab+'"]').click();
              assert.equal(await classic().locator('#jobsView').getAttribute('data-jobs-tab'),tab);
              for(const denied of (role==='personal'?['transfer','workers','services']:['profile','applied','matched','availability','offering']))assert.equal(await classic().locator('button[data-jobs-tab="'+denied+'"]').count(),0);
            }
            await classic().locator('button[data-jobs-tab="'+(role==='personal'?'offering':'services')+'"]').click();
            await classic().locator('[data-jobs-extra="'+(role==='personal'?'new-service-offer':'new-service-request')+'"]').click();
            await classic().locator('#jobsExtraForm').waitFor();
            assert.equal(await classic().locator('#jobsExtraForm').getAttribute('data-kind'),role==='personal'?'service-offer':'service-request');
          });
          await check(role,'Shift tabs and account setup',async()=>{
            await open(role,'shift');
            const tabs=role==='personal'?['browse','my-shifts','payments']:['my-shifts','payments'];
            for(const tab of tabs){await classic().locator('[data-shifts-tab="'+tab+'"]').click();assert.equal(await classic().locator('[data-shifts-tab="'+tab+'"]').getAttribute('aria-selected'),'true');}
            if(role==='personal')assert.equal(await classic().locator('[data-shifts-action="post"]').count(),0);
            await classic().locator('[data-shifts-action="setup"]').click();
            await classic().locator('#shiftsZelleForm').waitFor();
          });
        }
        for(const route of ['shop','transfer'])await check('personal','reject '+route+' and account switch',async()=>{
          await open('personal',route);await page.waitForURL(url=>url.searchParams.get('tab')==='feed');await personalControls();
          await open('salon',route);
          if(route==='transfer')await classic().locator('[data-jobs-extra="new-transfer"]').waitFor();
          else await host.locator('.community-extra-pane>section:visible').waitFor();
          await open('personal',route);
          await page.waitForURL(url=>url.pathname.endsWith('staff-community.html')&&url.searchParams.get('tab')==='feed');
          await classic().locator('#feedView').waitFor();await personalControls();
          await page.reload({waitUntil:'domcontentloaded'});await classic().locator('#feedView').waitFor();await personalControls();
        });
        for(const tab of ['transfer','workers','services'])await check('personal','reject Jobs '+tab,async()=>{
          await open('personal','jobs','&jobsTab='+tab);
          assert.equal(await classic().locator('#jobsView').getAttribute('data-jobs-tab'),'browse');
          assert.equal(await classic().locator('[data-jobs-extra="new-transfer"],[data-jobs-extra="new-service-request"]').count(),0);
        });
        await check('personal','Deals rejects business deep links',async()=>{
          for(const dealTab of ['campaign','redeem','create','manage','openingBusiness','demand']){
            await open('personal','deals','&dealTab='+dealTab);
            assert.equal(await classic().locator('.community-deals-business').count(),0);
            const src=await classic().locator('.community-deals-frame').getAttribute('src');
            assert.ok(!src||!/[?&](?:role=owner|view=(?:create|manage|redeem|biz))/.test(src),src);
          }
        });
      }finally{await context.close();}
    }
  }finally{await browser.close();fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({rows,errors},null,2));}
  console.log('TOTAL '+rows.filter(row=>row.pass).length+'/'+rows.length+' pageErrors='+errors.length);
  if(rows.some(row=>!row.pass)||errors.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
