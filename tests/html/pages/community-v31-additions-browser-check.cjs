/* Manual visible-browser coverage for the PO additions, after baseline parity. */
const {chromium,webkit,devices}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path');
const output=process.env.COMMUNITY_TEST_EVIDENCE||'/tmp/community-v31-additions-evidence';fs.mkdirSync(output,{recursive:true});
const iphone=process.env.COMMUNITY_TEST_ENGINE==='webkit';
const viewports=iphone?[[375,667],[390,844],[430,932]]:[[1440,1000],[834,1112],[390,844]];
const contextOptions=iphone?{...devices['iPhone 8'],viewport:{width:375,height:667},reducedMotion:'reduce',locale:'en-US'}:{viewport:{width:1440,height:1000},reducedMotion:'reduce',locale:'en-US'};
const origin=process.env.COMMUNITY_TEST_ORIGIN||'http://127.0.0.1:5503';
const labels={food:'Food & Restaurants',realestate:'Real Estate',shop:'My storefront',reels:'Reels',live:'Livestream',news:'News & Blog',wallet:'NEXORA Points',wheel:'Lucky Wheel',meet:'NEXORA Meet',account:'Profile',assistant:'AI assistant',notifications:'Notifications'};
const results=[],errors=[];
let evidencePage;
function check(value,message){if(!value)throw Error(message);}
async function record(name,task){if(process.env.COMMUNITY_CHECK_FILTER&&!new RegExp(process.env.COMMUNITY_CHECK_FILTER).test(name))return;try{await task();results.push({name,pass:true});console.log('PASS '+name);}catch(error){const row={name,pass:false,error:error.message};if(iphone&&evidencePage){row.screenshot='failure-'+name.replace(/[^a-z0-9]+/gi,'-')+'.png';await evidencePage.screenshot({path:path.join(output,row.screenshot),animations:'disabled'}).catch(()=>{});}results.push(row);console.log('FAIL '+name+': '+error.message);}fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
async function ready(page){await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub,{timeout:20000});}
async function open(page,route,query=''){
  await page.goto(origin+'/html/v3.1/community.html?tab='+route+query,{waitUntil:'networkidle'});await ready(page);
  if(labels[route])await page.waitForFunction(label=>document.querySelector('#community-staging,#community-hub').shadowRoot.querySelector('.community-heading h1').textContent===label,labels[route]);
}
function hub(page){return page.locator('#community-staging,#community-hub');}
function extra(page){return hub(page).locator('.community-extra-pane');}
async function baseFeed(page){
  await hub(page).locator((iphone?'.mobile-nav':'.top')+' .tab[data-view="feed"]')[iphone?'tap':'click']();
  await page.waitForFunction(()=>{const root=document.querySelector('#community-staging,#community-hub').shadowRoot;return !root.getElementById('communityPane').hidden&&root.querySelector('.community-extra-pane').hidden;});
}
(async()=>{
  let browser,context;
  if(iphone&&process.env.COMMUNITY_TEST_PROFILE){context=await webkit.launchPersistentContext(process.env.COMMUNITY_TEST_PROFILE,{headless:false,...contextOptions});browser=context.browser();}
  else{browser=iphone?await webkit.launch({headless:false}):await chromium.connect(JSON.parse(fs.readFileSync('/tmp/community-v31-visible-browser-v2.json')).endpoint);context=await browser.newContext(contextOptions);}
  context.setDefaultTimeout(12000);
  await context.addInitScript(()=>{localStorage.setItem('nexora-community-tour-desktop-v1','1');localStorage.setItem('nexora-community-tour-mobile-v1','1');});
  const page=await context.newPage();evidencePage=page;page.on('pageerror',error=>errors.push(error.message));
  for(const [route,label] of Object.entries(labels))await record('responsive '+route,async()=>{
    await open(page,route);
    for(const [width,height] of viewports){
      await page.bringToFront();await page.setViewportSize({width,height});await page.waitForTimeout(100);
      const state=await page.evaluate(()=>{
        const root=document.getElementById('community-staging').shadowRoot,pane=root.querySelector('.community-extra-pane');
        const surfaces=[pane,...[...pane.querySelectorAll('section')].map(section=>section.shadowRoot).filter(Boolean)];
        const images=surfaces.flatMap(surface=>[...surface.querySelectorAll('img')]).filter(image=>image.getClientRects().length&&image.complete&&!image.naturalWidth);
        return {error:pane.querySelector('.community-extra-error')?.innerText||'',visible:!pane.hidden,overflow:document.documentElement.scrollWidth>innerWidth,broken:images.map(image=>image.src)};
      });
      check(state.visible&&!state.error&&!state.overflow&&!state.broken.length,JSON.stringify(state));
      await page.screenshot({path:path.join(output,route+'-'+width+'.png'),animations:'disabled'});
    }
    await page.setViewportSize(contextOptions.viewport);
  });
  await record('More menu and return to Feed',async()=>{
    await open(page,'feed');await page.locator('.community-version-more')[iphone?'tap':'click']();
    await hub(page).locator('#ecosystemMenu:not([hidden])').waitFor();
    await hub(page).locator('[data-community-extra="food"]')[iphone?'tap':'click']();
    await extra(page).locator('#review-open').waitFor();await baseFeed(page);
    await page.goBack();await extra(page).locator('#review-open').waitFor();
    await page.goBack();await page.waitForFunction(()=>!document.getElementById('community-staging').shadowRoot.getElementById('communityPane').hidden);
  });
  await record('cancel stale lazy navigation',async()=>{
    const slow=await context.newPage();await open(slow,'feed');
    await slow.route('**/modules/realestate/index.html*',async route=>{await new Promise(resolve=>setTimeout(resolve,700));await route.continue();});
    await slow.locator('.community-version-more')[iphone?'tap':'click']();await hub(slow).locator('[data-community-extra="realestate"]')[iphone?'tap':'click']();
    await baseFeed(slow);await slow.waitForTimeout(1400);
    check(new URL(slow.url()).searchParams.get('tab')==='feed','Stale module changed the Feed route');
    await slow.close();
  });
  await record('Food review uses the common point wallet',async()=>{
    await open(page,'food');await extra(page).locator('#review-open').evaluate(button=>button.scrollIntoView({block:'center'}));await extra(page).locator('#review-open')[iphone?'tap':'click']();
    await extra(page).locator('#r-place').fill('QA Cafe');await extra(page).locator('#r-text').fill('A local prototype review for the Community demo.');
    await extra(page).locator('#review-submit')[iphone?'tap':'click']();await extra(page).getByText('QA Cafe',{exact:true}).waitFor();
    await open(page,'wallet');check(await extra(page).locator('.platform-balance').innerText()==='50','Food points missing from the common wallet');
    await baseFeed(page);
  });
  await record('storefront setup and product persistence',async()=>{
    await open(page,'shop');await extra(page).locator('[data-action="edit-shop"]').first()[iphone?'tap':'click']();
    const form=extra(page).locator('#shop-form');await form.locator('[name="name"]').fill('QA Storefront');await form.locator('[name="about"]').fill('Products and services for a local prototype storefront.');
    await form.locator('[name="email"]').fill('qa-store@example.com');await form.locator('button[type="submit"]')[iphone?'tap':'click']();
    await extra(page).locator('[data-action="shop-add-product"]').first()[iphone?'tap':'click']();const item=extra(page).locator('#item-form');
    await item.locator('[name="title"]').fill('QA Nail Kit');await item.locator('[name="price"]').fill('25');await item.locator('[name="description"]').fill('A product used only to check the local storefront flow.');
    await item.locator('button[type="submit"]')[iphone?'tap':'click']();await extra(page).getByText('QA Nail Kit',{exact:true}).first().waitFor();
    await open(page,'shop');await extra(page).getByText('QA Nail Kit',{exact:true}).first().waitFor();
    const other=await context.newPage();await open(other,'shop','&member=QA%20Other');check(!(await extra(other).innerText()).includes('QA Nail Kit'),'Another account can see the private storefront');await other.close();
  });
  await record('staff trade-service form and Jobs permissions',async()=>{
    await page.goto(origin+'/html/v3.1/staff-community.html?role=tech&account=personal&member=QA%20Tech&tab=jobs',{waitUntil:'networkidle'});await ready(page);
    const frame=page.frames().find(frame=>frame.url().includes('nexora-community-prototype.html'));check(frame,'Jobs frame missing');
    await frame.locator('[data-jobs-tab="services"]')[iphone?'tap':'click']();await frame.locator('[data-jobs-extra="new-service-request"]')[iphone?'tap':'click']();
    const form=frame.locator('#jobsExtraForm');await form.locator('[name="title"]').fill('QA electrical service');await form.locator('[name="city"]').fill('Houston');
    await form.locator('[name="preferredTime"]').fill('2026-11-10T10:00');await form.locator('[name="description"]').fill('A prototype request for an electrical trade service.');
    await form.locator('button[type="submit"]')[iphone?'tap':'click']();await frame.getByText('QA electrical service',{exact:true}).first().waitFor();
    const data=await frame.evaluate(()=>JSON.parse(localStorage.getItem('nexora-community-templates-v1')).jobs.find(row=>row.title==='QA electrical service'));
    check(data.kind==='service-request'&&data.nxId&&data.owner==='QA Tech','Trade service record did not keep its subtype, owner and NEXORA ID');
    const hiring=frame.locator('#jobsView [data-template="hiring"]');
    check(await hiring.isVisible()&&await hiring.isDisabled(),'The original disabled staff hiring card was lost or enabled');
    check(await frame.evaluate(()=>{document.querySelector('#jobsView [data-template="hiring"]')?.click();return !document.querySelector('#templateForm[data-kind="hiring"]');}),'Staff hiring guard was bypassed');
  });
  await record('salon transfer uses the existing Jobs engine',async()=>{
    await open(page,'transfer');const frame=page.frames().find(frame=>frame.url().includes('nexora-community-prototype.html'));
    await frame.locator('[data-jobs-extra="new-transfer"]')[iphone?'tap':'click']();const form=frame.locator('#jobsExtraForm');
    await form.locator('[name="title"]').fill('QA salon transfer');await form.locator('[name="city"]').fill('Houston');await form.locator('[name="description"]').fill('A local salon transfer listing for prototype verification.');
    await form.locator('button[type="submit"]')[iphone?'tap':'click']();await frame.getByText('QA salon transfer',{exact:true}).first().waitFor();
  });
  await record('Meet schedule and shared notification detail',async()=>{
    await open(page,'meet');await extra(page).locator('[data-meet-action="screen"][data-meet-id="schedule"]')[iphone?'tap':'click']();
    const form=extra(page).locator('#meetScheduleForm');await form.locator('[name="title"]').fill('QA Community meeting');await form.locator('[name="date"]').fill('2026-11-10');
    await form.locator('[name="time"]').fill('19:00');await form.locator('[name="timezone"]').selectOption('America/Chicago');await form.locator('button[type="submit"]')[iphone?'tap':'click']();
    await extra(page).getByText('QA Community meeting',{exact:true}).first().waitFor();
    const meetingTime=await extra(page).locator('.meetcard').filter({hasText:'QA Community meeting'}).locator('.when').innerText();
    check(meetingTime.includes('Nov 10, 2026')&&meetingTime.includes('7:00'),'Meeting time does not use the selected time zone');
    await page.evaluate(()=>{const shared=window.NEXORA_COMMUNITY_SHARED,row=shared.read().meetings.find(row=>row.title==='QA Community meeting');shared.notify(row.title,'meet',{meetingId:row.id});});
    await open(page,'notifications');await extra(page).getByText('QA Community meeting',{exact:true}).first()[iphone?'tap':'click']();
    await page.waitForFunction(()=>new URL(location.href).searchParams.get('tab')==='meet');
  });
  await record('Privacy and Profile share one NEXORA ID',async()=>{
    await open(page,'account');const publicID=await extra(page).locator('strong').filter({hasText:'NEXORA ID'}).innerText();
    await page.goto(origin+'/html/v3.1/community.html?tab=privacy',{waitUntil:'networkidle'});await ready(page);
    const frame=page.frames().find(frame=>frame.url().includes('nexora-privacy-qr-layout.html'));await frame.locator('#privacyPanel .id-line strong').waitFor();
    check(publicID.includes(await frame.locator('#privacyPanel .id-line strong').innerText()),'Profile and Privacy show different NEXORA IDs');
    check(await frame.locator('#profileQr').getAttribute('data-connect-profile').then(url=>url.includes('/html/v3.1/community.html')),'Profile QR points to a different Community version');
  });
  await record('Real Estate listing wizard and saved photo',async()=>{
    await open(page,'realestate');await extra(page).locator('[data-act="openPost"]').first()[iphone?'tap':'click']();
    await extra(page).locator('#nextBtn')[iphone?'tap':'click']();
    await extra(page).locator('#pfTitle').fill('QA Houston rental room');await extra(page).locator('#pfPrice').fill('900');await extra(page).locator('#pfZip').fill('77042');
    await extra(page).locator('#nextBtn')[iphone?'tap':'click']();
    await extra(page).locator('#pfPhotos').setInputFiles(path.resolve(__dirname,'../../../html/v3.1/nexora-welcome/industry-nail.jpg'));
    await extra(page).locator('#pfDesc').fill('A spacious rental room in Houston with parking and nearby local shops.');
    await extra(page).locator('#nextBtn')[iphone?'tap':'click']();await extra(page).locator('#nextBtn')[iphone?'tap':'click']();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nexora-v31:realestate-records')||'[]').some(row=>row.title==='QA Houston rental room'&&row.photos?.length===1&&row.nxId));
    await open(page,'realestate');check(await extra(page).locator('img').count()>0,'Listing photo did not persist');
  });
  await record('Reels video creation and persisted preview',async()=>{
    await open(page,'reels');await extra(page).locator('[data-feed-kind="reel"]')[iphone?'tap':'click']();
    const form=extra(page).locator('#feed-form');await form.locator('[name="body"]').fill('QA reel for the local Community prototype.');
    await form.locator('input[type="file"][name="media"]').setInputFiles(path.resolve(__dirname,'../../../html/v3.1/community/page-videos/nail-weekend.mp4'));
    await form.locator('button[type="submit"]').last()[iphone?'tap':'click']();
    await extra(page).locator('video[data-reel-view]').waitFor();await open(page,'reels');await extra(page).locator('video[data-reel-view]').waitFor();
  });
  await record('default staff identity matches the existing Community frame',async()=>{
    await page.goto(origin+'/html/v3.1/staff-community.html?tab=jobs',{waitUntil:'networkidle'});await ready(page);
    const frame=page.frames().find(frame=>frame.url().includes('nexora-community-prototype.html'));
    const member=await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.member);
    check(member===await frame.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.member),'Shared member differs from the retained staff Community');
  });
  await record('leaving Meet does not stop another hosts recording',async()=>{
    await open(page,'wallet');await page.evaluate(()=>{const shared=window.NEXORA_COMMUNITY_SHARED;shared.change(data=>data.meetings.push({id:'qa-recording',title:'QA host meeting',host:'QA Host',participants:['QA Host',shared.member],startsAt:new Date(Date.now()+86400000).toISOString(),timezone:'America/Chicago',duration:60,cohosts:[],waiting:[],messages:[],muted:[],invitees:[],waitingRoom:false,recording:true}));});
    await open(page,'meet','&meetingId=qa-recording');await baseFeed(page);
    check(await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.read().meetings.find(row=>row.id==='qa-recording').recording),'A guest stopped the hosts recording');
  });
  await record('legacy contacts keep four-key search and their existing thread',async()=>{
    await open(page,'privacy');const frame=page.frames().find(frame=>frame.url().includes('nexora-privacy-qr-layout.html'));
    const result=await frame.evaluate(()=>{
      const core=window.NEXORA_CONNECT_CORE,shared=window.NEXORA_COMMUNITY_SHARED,name='QA Legacy Peer';
      const kim=core.members.find(row=>row.name==='Kim Tuyen'),sally=core.members.find(row=>row.name==='Sally Thanh Hoang');
      if(kim?.phone!=='7135550144'||kim.detail!=='chat-kim'||sally?.email!=='sally@example.com'||sally.detail!=='chat-sally')return [false];
      core.mutate(state=>{state.connections.push('NX-2042','NX-2043');});
      core.renderMessages();if(!document.querySelector('#connectionsCard')?.innerText.includes('Kim Tuyen')||document.querySelectorAll('#communitySourceChats [data-detail="chat-kim"]').length!==0)throw Error(JSON.stringify({card:document.querySelector('#connectionsCard')?.textContent,count:document.querySelectorAll('#directPanel [data-detail="chat-kim"]').length,identity:shared.identity('Kim Tuyen')}));
      const seed=JSON.parse(localStorage.getItem('nexora-connect-workflow-v1')||'{}');seed.profiles||={};seed.profiles[sally.name]={email:'shared'};localStorage.setItem('nexora-connect-workflow-v1',JSON.stringify(seed));
      const retained=['7135550144','sally@example.com'].map(query=>window.NEXORA_COMMUNITY_CONNECT.search(query)).map((rows,index)=>rows.some(row=>row.detail===(index?'chat-sally':'chat-kim')));
      core.members.push({name,id:'NX-OLD42',handle:'@qa.legacy.peer',phone:'7135550199',email:'qa-legacy@example.com',detail:'chat-qa-legacy'});
      const data=JSON.parse(localStorage.getItem('nexora-connect-workflow-v1')||'{}');data.profiles||={};data.profiles[name]={id:'NX-OLD42',phone:'shared',email:'shared',messages:'requests',calls:'shared'};localStorage.setItem('nexora-connect-workflow-v1',JSON.stringify(data));
      core.mutate(state=>{state.connections.push('NX-OLD42');});const identity=shared.identity(name);
      const queries=['7135550199','qa-legacy@example.com',identity.id,'@'+identity.nickname];
      return [...retained,...queries.map(query=>window.NEXORA_COMMUNITY_CONNECT.search(query).find(row=>row.name===name)).map(row=>row?.id===identity.id&&row?.detail==='chat-qa-legacy')];
    });
    if(!result.every(Boolean))console.log('CONTACT DEBUG '+JSON.stringify(await frame.evaluate(()=>({members:window.NEXORA_CONNECT_CORE.members.filter(row=>['Sally Thanh Hoang','QA Legacy Peer'].includes(row.name)),rows:window.NEXORA_COMMUNITY_CONNECT.search('Sally'),profiles:JSON.parse(localStorage.getItem('nexora-connect-workflow-v1')||'{}').profiles,connections:window.NEXORA_CONNECT_CORE.getState().connections}))));
    check(result.every(Boolean),'Legacy connection lost its phone, email, public ID, username or existing conversation: '+JSON.stringify(result));
  });
  await record('original Jobs and Connect samples are preserved',async()=>{
    const samples=[];
    for(const version of ['pages','v3.1']){
      const isolated=await browser.newContext(contextOptions),sample=await isolated.newPage();
      await isolated.addInitScript(()=>{localStorage.setItem('nexora-community-tour-desktop-v1','1');localStorage.setItem('nexora-community-tour-mobile-v1','1');});
      await sample.goto(origin+'/html/'+version+'/community.html?tab=jobs',{waitUntil:'networkidle'});await ready(sample);
      const jobs=sample.frames().find(frame=>frame.url().includes('nexora-community-prototype.html'));await jobs.locator('#jobsView').waitFor();
      await jobs.waitForFunction(()=>JSON.parse(localStorage.getItem('nexora-community-jobs-workflow-v1')||'{}').applications?.length>0);
      const data=await jobs.evaluate(()=>{const workflow=JSON.parse(localStorage.getItem('nexora-community-jobs-workflow-v1')),templates=JSON.parse(localStorage.getItem('nexora-community-templates-v1'));return {profiles:Object.keys(workflow.profiles).sort(),applications:workflow.applications.map(row=>row.id).sort(),jobs:templates.jobs.map(row=>row.id).sort()};});
      await sample.goto(origin+'/html/'+version+'/community.html?tab=connect',{waitUntil:'networkidle'});await ready(sample);
      const connect=sample.frames().find(frame=>frame.url().includes('nexora-privacy-qr-layout.html'));await connect.locator('#messagesPanel').waitFor();
      data.request=await connect.locator('#requestCount').innerText();data.kim=await connect.locator('#directPanel [data-detail="chat-kim"]').isVisible();data.sally=await connect.locator('#directPanel [data-detail="chat-sally"]').isVisible();
      data.calls=await connect.locator('#callRows [data-call-id]').evaluateAll(rows=>rows.map(row=>row.dataset.callId).sort());
      data.pos=await connect.evaluate(()=>window.NEXORA_COMMUNITY_CONNECT.store.read().rooms.some(room=>room.id==='group-shop-bitcoin'&&room.members.includes('Kim Tuyen')&&room.members.includes('Sally Thanh Hoang')));
      if(version==='v3.1'){
        const retained=await connect.evaluate(()=>{const app=window.NEXORA_COMMUNITY_CONNECT;app.store.read();const data=JSON.parse(localStorage.getItem('nexora-connect-workflow-v1'));data.messages['direct:'+['BITCOIN NAIL BAR','Kim Tuyen'].sort().map(encodeURIComponent).join(':')]=[{id:'qa-shared',author:'Kim Tuyen',text:'QA'}];localStorage.setItem('nexora-connect-workflow-v1',JSON.stringify(data));const rows=app.seedMessages('chat-kim',[]);return rows.some(row=>row.id==='po-bilingual-schedule')&&rows.some(row=>row.id==='qa-shared');});
        check(retained,'Shared messages removed the bilingual Kim sample');
      }
      samples.push(data);await isolated.close();
    }
    check(samples[0].calls.length>0&&samples[0].kim&&samples[0].sally&&samples[0].pos,'Original samples were not loaded');
    check(JSON.stringify(samples[0])===JSON.stringify(samples[1]),'v3.1 changed original sample records: '+JSON.stringify(samples));
  });
  const summary={results,errors,engine:iphone?'WebKit':'Chromium',version:browser.version(),viewports,isMobile:iphone,persistentProfile:Boolean(iphone&&process.env.COMMUNITY_TEST_PROFILE),pass:results.every(result=>result.pass)&&!errors.length};fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({checks:results.length,pass:summary.pass,errors}));if(iphone)await browser.close();process.exit(summary.pass?0:2);
})().catch(error=>{console.error(error);process.exit(1);});
