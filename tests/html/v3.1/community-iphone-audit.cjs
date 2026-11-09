const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {webkit,devices}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'../../..');
const ui=require(path.resolve(repo,'../vlinkpay/test/scripts/_shared/nexora-ui.cjs'));
const output='/tmp/community-iphone-audit-20261106',origin='http://127.0.0.1:5503';
fs.mkdirSync(output,{recursive:true});
const scope=['html/v3.1','html/assets/community-v2','html/assets/community-version-switch.js','html/assets/community-version-switch.css'];
const fingerprint=ui.codeFingerprint(repo,scope),results=[],errors=[],warnings=[],responses=[];
const routes=['feed','groups','market','pages','deals','jobs','shift','blog','connect','chatgroups','calls','privacy','food','realestate','shop','transfer','reels','live','news','wallet','wheel','meet','account','assistant','notifications'];
const extras=new Set(routes.slice(12));const sizes=[[375,667],[390,844],[430,932]];
function check(value,message){if(!value)throw Error(message);}
function save(){fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({fingerprint,results,errors,warnings,responses},null,2));}
async function record(name,role,task,page){try{const details=await task();results.push({name,role,pass:true,...details});console.log('PASS '+role+' '+name);}catch(error){const screenshot=name.replace(/[^a-z0-9]+/gi,'-')+'-'+role+'-failure.png';await page?.screenshot({path:path.join(output,screenshot),animations:'disabled'}).catch(()=>{});results.push({name,role,pass:false,error:error.message,screenshot});console.log('FAIL '+role+' '+name+': '+error.message);}save();}
async function ready(page){await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub,{timeout:20000});}
function hub(page){return page.locator('#community-staging,#community-hub');}
function pane(page){return hub(page).locator('.community-extra-pane');}
function url(role,route){return origin+'/html/v3.1/'+(role==='staff'?'staff-community.html?role=tech&account=personal&':'community.html?')+'tab='+route;}
async function open(page,role,route){await page.goto(url(role,route),{waitUntil:'networkidle'});await ready(page);if(extras.has(route)&&route!=='transfer')await pane(page).waitFor();else{const file=['connect','chatgroups','calls','privacy'].includes(route)?'nexora-privacy-qr-layout.html':'nexora-community-prototype.html';await page.waitForFunction(file=>{const root=document.querySelector('#community-staging,#community-hub').shadowRoot;return [...root.querySelectorAll('iframe')].some(frame=>!frame.hidden&&frame.src.includes(file)&&frame.contentDocument?.readyState==='complete');},file);}await page.waitForTimeout(150);}
async function metrics(page){return page.evaluate(()=>{
 const images=[],smallPrimary=[],smallInputs=[],scrollAreas=[];
 function visit(root){
  for(const element of root.querySelectorAll('*')){
   const rect=element.getBoundingClientRect();if(!rect.width||!rect.height||getComputedStyle(element).visibility==='hidden')continue;
   if(element.shadowRoot)visit(element.shadowRoot);
   if(element.tagName==='IFRAME'){try{if(element.contentDocument)visit(element.contentDocument);}catch{}}
   if(element.tagName==='IMG'&&element.complete&&!element.naturalWidth)images.push(element.src);
   if(element.matches('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea')&&parseFloat(getComputedStyle(element).fontSize)<16)smallInputs.push({tag:element.tagName,id:element.id,font:getComputedStyle(element).fontSize});
   if(element.matches('.community-version-button,.community-version-more,.mobile-tab,button[type=submit],button.primary,.btn.primary')&&(rect.width<44||rect.height<44))smallPrimary.push({text:element.innerText.trim().slice(0,50),width:Math.round(rect.width),height:Math.round(rect.height)});
   const style=getComputedStyle(element);if(/auto|scroll/.test(style.overflowY)&&element.scrollHeight>element.clientHeight+4)scrollAreas.push({tag:element.tagName,class:element.className,max:element.scrollHeight-element.clientHeight});
  }
 }
 visit(document);
 return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,images,smallPrimary,smallInputs,scrollAreas,scale:visualViewport?.scale,ua:navigator.userAgent,touch:navigator.maxTouchPoints,touchEvents:('ontouchstart' in window)};
 });}
(async()=>{
 const browser=await webkit.launch({headless:false});
 const contexts=[];
 for(const role of ['owner','staff']){
  const context=await ui.newContext(browser,ui.VIEWPORTS[role==='owner'?'tiem':'tho'].find(v=>v.name==='iphone'));contexts.push(context);context.setDefaultTimeout(9000);
  await context.addInitScript(()=>{localStorage.setItem('nexora-community-tour-desktop-v1','1');localStorage.setItem('nexora-community-tour-mobile-v1','1');});
  const page=await context.newPage();page.on('pageerror',error=>errors.push({role,url:page.url(),message:error.message}));page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(locationOrigin))responses.push({role,url:response.url(),status:response.status()});});
  const locationOrigin=origin;
  for(const route of routes)await record('screen '+route,role,async()=>{
   await open(page,role,route);const rows=[];
   for(const [width,height]of sizes){await page.setViewportSize({width,height});await page.waitForTimeout(120);const m=await metrics(page);check(!m.overflow&&!m.images.length,JSON.stringify({overflow:m.overflow,broken:m.images}));check(m.ua.includes('iPhone')&&m.touchEvents,'Missing iPhone touch configuration');
    if(m.smallPrimary.length||m.smallInputs.length)warnings.push({role,route,width,smallPrimary:m.smallPrimary,smallInputs:m.smallInputs});
    const screenshot=route+'-'+role+'-'+width+'x'+height+'-initial.png';await page.screenshot({path:path.join(output,screenshot),animations:'disabled'});rows.push({width,height,screenshot,scrollAreas:m.scrollAreas});
   }await page.setViewportSize({width:375,height:667});return {viewports:rows};
  },page);
  for(const route of routes.slice(12))await record('More tap '+route,role,async()=>{
   await open(page,role,'feed');await page.locator('.community-version-more').tap();const item=hub(page).locator('[data-community-extra="'+route+'"]');await item.tap();await page.waitForFunction(route=>new URL(location.href).searchParams.get('tab')===(route==='transfer'?'jobs':route),route);return {viewport:'375x667'};
  },page);
  await record('version switch two ways',role,async()=>{await open(page,role,'feed');await page.locator('#communityVersionSwitch a').tap();await page.waitForURL(url=>url.pathname.startsWith('/html/pages/'));await ready(page);check(await page.locator('.community-version-badge').innerText()==='v2','Missing v2 badge');await page.locator('#communityVersionSwitch a').tap();await page.waitForURL(url=>url.pathname.startsWith('/html/v3.1/'));await ready(page);return {viewport:'375x667'};},page);
  await record('mobile tabs and Messages in More',role,async()=>{await open(page,role,'feed');for(const route of ['market','pages','deals','jobs','feed']){await hub(page).locator('.mobile-nav .tab[data-view="'+route+'"]').tap();await page.waitForFunction(route=>new URL(location.href).searchParams.get('tab')===route,route);}check(await hub(page).locator('.mobile-nav [data-view=connect]').count()===0,'Messages still appears in mobile tabs');await hub(page).locator('.mobile-nav .community-nav-more').tap();await hub(page).locator('#ecosystemMenu [data-quick-view=connect]').tap();await page.waitForURL(url=>url.searchParams.get('tab')==='connect');return {viewport:'375x667'};},page);
  await record('profile validation submit and reload',role,async()=>{await open(page,role,'account');const form=pane(page).locator('[data-platform-profile]');await form.locator('[name=name]').fill('IPHONE QA '+role.toUpperCase());await form.locator('[name=email]').fill('invalid');await form.locator('[type=submit]').tap();check(await form.locator('[name=email]').evaluate(el=>!el.validity.valid),'Invalid email was accepted');await form.locator('[name=email]').fill('iphone-'+role+'@example.com');await form.locator('[type=submit]').tap();await form.locator('[role=status]').filter({hasText:'Profile saved.'}).waitFor();await open(page,role,'account');check(await pane(page).locator('[name=email]').inputValue()==='iphone-'+role+'@example.com','Profile did not persist');return {viewport:'375x667'};},page);
  await record('rotation preserves a profile draft',role,async()=>{await open(page,role,'account');const field=pane(page).locator('[name=city]');await field.fill('IPHONE unsaved draft');await page.setViewportSize({width:667,height:375});await page.waitForTimeout(200);check(await field.inputValue()==='IPHONE unsaved draft','Rotation lost the draft');check(!(await metrics(page)).overflow,'Landscape creates horizontal overflow');const screenshot='account-'+role+'-667x375-draft.png';await page.screenshot({path:path.join(output,screenshot),animations:'disabled'});await page.setViewportSize({width:375,height:667});check(await field.inputValue()==='IPHONE unsaved draft','Portrait lost the draft');return {screenshot};},page);
  await context.close();
 }
 const endFingerprint=ui.codeFingerprint(repo,scope);check(JSON.stringify(endFingerprint)===JSON.stringify(fingerprint),'Production source changed during audit');
 const result={browser:'WebKit',version:browser.version(),emulated:true,physicalIPhone:false,fingerprint,endFingerprint,results,errors,warnings,responses,pass:results.every(r=>r.pass)&&!errors.length,limits:['No physical iPhone','No native iOS keyboard or inertial-scroll verification','Local HTML prototype; no production API/payment/media verification']};fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({checks:results.length,pass:result.pass,pageErrors:errors.length,httpErrors:responses.length}));await browser.close();process.exit(result.pass?0:2);
})().catch(error=>{console.error(error);save();process.exit(1)});
