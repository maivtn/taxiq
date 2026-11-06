/* Run with PLAYWRIGHT_MODULE set to the installed Playwright module. */
const {webkit,devices}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
// Live Server watches the workspace; write outside it while pages are under test.
const evidence=process.env.COMMUNITY_TEST_EVIDENCE||'/tmp/community-clone-visible-evidence';
fs.mkdirSync(evidence,{recursive:true});
const base=process.env.COMMUNITY_TEST_ORIGIN||'http://127.0.0.1:5503';
const screens=(process.env.COMMUNITY_TEST_SCREENS||'feed,groups,market,pages,deals,jobs,shift,blog,connect').split(',');
const viewports=[[375,667]];const role=process.env.COMMUNITY_TEST_ROLE||'owner';const entry=role==='staff'?'staff-community.html?role=tech&account=personal&':'community.html?';
async function navigate(page,tab){
  await page.bringToFront();
  await page.setViewportSize({width:375,height:667});
  const destination=new URL(page.url());destination.searchParams.set('tab',tab);await page.goto(destination.href,{waitUntil:'networkidle'});
  await page.waitForFunction(tab=>{
    const shell=document.querySelector('#community-staging,#community-hub').shadowRoot;
    const frame=shell.getElementById(tab==='connect'?'connectPane':'communityPane');
    const doc=frame.contentDocument;
    if(!doc||doc.documentElement.lang!=='en')return false;
    const id={feed:'feedView',groups:'groupsView',market:'marketView',pages:'pagesView',deals:'communityDealsView',jobs:'jobsView',shift:'dayworkView',blog:'blogView',connect:'messagesPanel'}[tab];
    const element=doc.getElementById(id);
    return !!element&&doc.defaultView.getComputedStyle(element).display!=='none'&&element.getBoundingClientRect().height>0;
  },tab,{timeout:20000});
}
async function snapshot(page,label,tab,width,height){
  await page.bringToFront();
  await page.setViewportSize({width,height});
  await page.waitForTimeout(300);
  for(const frame of page.frames())await frame.evaluate(async()=>{
    for(const image of document.images)image.loading='eager';
    await Promise.race([Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,1500))]);
    await document.fonts.ready;
    window.scrollTo(0,0);
  }).catch(()=>{});
  const data=await page.evaluate(()=>{
    const shell=document.querySelector('#community-staging,#community-hub').shadowRoot;
    const core=shell.getElementById('communityPane');
    const doc=(core.hidden?shell.getElementById('connectPane'):core).contentDocument;
    const normalize=value=>value.replace(/\s+/g,' ').trim();
    return {
      heading:normalize(shell.querySelector('.community-heading').innerText),
      text:normalize(doc.body.innerText),
      images:[...doc.images].filter(image=>image.getClientRects().length).map(image=>({
        // Compare the same asset in its original and copied directories.
        src:image.src.replace('/html/v3.1/community/','/html/assets/community-v2/').replace('/html/v3.1/','/html/assets/'),
        loaded:image.complete&&image.naturalWidth>0,width:image.naturalWidth,height:image.naturalHeight
      })),
      layout:[...doc.querySelectorAll('h1,h2,h3,article,.panel,.card,button,input,select,textarea,img')].filter(element=>element.getClientRects().length).slice(0,400).map(element=>{
        const rect=element.getBoundingClientRect();
        return {tag:element.tagName,id:element.id,box:[rect.x,rect.y,rect.width,rect.height].map(value=>Math.round(value*10)/10)};
      }),
      overflow:document.documentElement.scrollWidth>innerWidth
      ,shellChrome:[...document.querySelector('.shell').querySelectorAll('aside,header,a,button,input,select,img')].filter(element=>element.getClientRects().length).map(element=>{
        const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
        return {tag:element.tagName,text:normalize(element.innerText||''),box:[rect.x,rect.y,rect.width,rect.height].map(value=>Math.round(value*10)/10),color:style.color,background:style.backgroundColor};
      })
    };
  });
  await page.screenshot({path:path.join(evidence,'visible-'+label+'-'+tab+'-'+width+'.png'),animations:'disabled'});
  return data;
}
(async()=>{
  const browser=await webkit.launch({headless:false});
  const context=await browser.newContext({...devices['iPhone 8'],viewport:{width:375,height:667},reducedMotion:'reduce',locale:'en-US'});
  await context.addInitScript(()=>{
    const OriginalDate=Date;
    window.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:['2026-11-06T16:00:00Z']));}static now(){return 1793980800000;}};
    for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');
  });
  const pages=[await context.newPage(),await context.newPage()],errors=[],rows=[];
  for(const [index,page] of pages.entries()){
    page.on('pageerror',error=>errors.push({version:index===0?'v2':'v3.1',message:error.message}));
    await page.goto(base+'/html/'+(index===0?'pages':'v3.1')+'/'+entry+'tab=feed',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('#community-staging,#community-hub')?.communityHub);
  }
  for(const tab of screens){
    await navigate(pages[0],tab);await navigate(pages[1],tab);
    for(const [width,height] of viewports){
      const a=await snapshot(pages[0],'v2',tab,width,height),b=await snapshot(pages[1],'v31',tab,width,height);
      const row={tab,width,height,contentEqual:a.text===b.text&&a.heading===b.heading,imagesEqual:JSON.stringify(a.images)===JSON.stringify(b.images),layoutEqual:JSON.stringify(a.layout)===JSON.stringify(b.layout),shellChromeEqual:JSON.stringify(a.shellChrome)===JSON.stringify(b.shellChrome),v2BrokenImages:a.images.filter(image=>!image.loaded),v31BrokenImages:b.images.filter(image=>!image.loaded),overflow:a.overflow||b.overflow};
      rows.push(row);fs.writeFileSync(path.join(evidence,'visible-parity-result.json'),JSON.stringify({rows,errors},null,2));
      console.log(JSON.stringify(row));
    }
  }
  const result={browser:'visible WebKit iPhone',role,rows,errors,versionSwitchCheckedInThisRun:false,pass:rows.every(row=>row.contentEqual&&row.imagesEqual&&row.layoutEqual&&row.shellChromeEqual&&!row.v2BrokenImages.length&&!row.v31BrokenImages.length&&!row.overflow)&&!errors.length};
  fs.writeFileSync(path.join(evidence,'visible-parity-result.json'),JSON.stringify(result,null,2));
  console.log('Visible browser comparison: '+(result.pass?'PASS':'FAIL'));
  await browser.close();process.exit(result.pass?0:2);
})().catch(error=>{console.error(error);process.exit(1);});
