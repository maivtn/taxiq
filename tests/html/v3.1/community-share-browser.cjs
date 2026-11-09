/* Headless interaction checks for the retained Community Share sheet. */
const {nativePane}=require('./native-pane.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const repo = path.resolve(__dirname, '../../..');
const output = process.env.COMMUNITY_SHARE_OUTPUT || '/tmp/taxiq-community-share';
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
const server = http.createServer(async (request, response) => {
  try {
    const file = path.resolve(repo, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (!file.startsWith(repo + path.sep)) throw Error('Invalid path');
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(await fs.readFile(file));
  } catch { response.statusCode = 404; response.end(); }
});

(async () => {
  await fs.mkdir(output, {recursive:true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  const results = [], errors = [];
  try {
    browser = await chromium.launch({headless:true});
    for (const width of [1280,390]) for (const account of ['business','personal']) {
      const context = await browser.newContext({viewport:{width,height:width===390?844:900},permissions:['clipboard-read','clipboard-write'],locale:'en-US'});
      try {
        await context.addInitScript(() => {
          for (const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1']) localStorage.setItem(key,'1');
        });
        const page = await context.newPage();
        page.setDefaultTimeout(12000);
        page.on('pageerror', error => errors.push({width,account,error:error.message}));
        const entry = account==='personal' ? 'staff-community.html?account=personal&role=tech' : 'community.html?account=business';
        let frame;
        async function loadPost(id) {
          for(let i=0;i<40&&!await frame.locator('#feedPosts [data-feed-post-id="'+id+'"]').count();i++) {
            if(!await frame.locator('#feedMore').isVisible())break;
            await frame.locator('#feedMore').click();
          }
          await frame.locator('#feedPosts [data-feed-post-id="'+id+'"]').waitFor();
        }
        async function open() {
          await page.goto(base+'/html/v3.1/'+entry+'&tab=feed', {waitUntil:'domcontentloaded'});
          await page.waitForFunction(() => !!window.NEXORA_COMMUNITY_PEOPLE);
          await page.locator('#communityPane').locator('#feedPosts [data-feed-post-id]').first().waitFor();
          frame = nativePane(page);
          await frame.waitForFunction(() => document.documentElement.lang==='en');
          await loadPost('f5');
        }
        const dialog = () => frame.locator('[data-community-share-dialog]');
        async function share(id='f5') {
          await frame.locator('#feedPosts [data-feed-post-id="'+id+'"] [data-social-action="share-post"]').click();
          await dialog().waitFor();
        }
        const records = () => page.evaluate(() => JSON.parse(localStorage.getItem('nexora-community-templates-v1')).feed);
        async function check(name, action) {
          if(process.env.COMMUNITY_SHARE_CASE_FILTER&&!new RegExp(process.env.COMMUNITY_SHARE_CASE_FILTER).test(width+' '+account+' '+name))return;
          try { await action(); results.push({width,account,name,pass:true}); console.log('PASS',width,account,name); }
          catch(error) {
            results.push({width,account,name,pass:false,error:error.stack});
            console.log('FAIL',width,account,name,error.message.slice(0,500));
            await page.screenshot({path:path.join(output,width+'-'+account+'-'+name.replace(/\W+/g,'-')+'-failed.png')}).catch(()=>{});
          }
          await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));
        }
        await check('composer audience draft and keyboard dismissal',async()=>{
          await open(); await share();
          assert.equal(await dialog().locator('.community-share-preview').count(),1);
          assert.equal(await dialog().locator('.community-share-destination').count(),4);
          const box=await dialog().boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);
          assert.ok(!await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
          await dialog().locator('#communityShareCaption').fill('Share draft kept between screens');
          await dialog().locator('[data-share-action="audience"]').click();
          await dialog().locator('[data-share-audience="friends"]').click();
          await dialog().locator('[data-share-action="back"]').first().click();
          assert.equal(await dialog().locator('#communityShareCaption').inputValue(),'Share draft kept between screens');
          assert.match(await dialog().locator('[data-share-action="audience"]').innerText(),/Friends/);
          await page.screenshot({path:path.join(output,width+'-'+account+'-share.png')});
          await page.keyboard.press('Shift+Tab');
          assert.equal(await dialog().locator('[data-share-action="more"]').evaluate(node=>node.getRootNode().activeElement===node),true);
          await page.keyboard.press('Escape');await dialog().waitFor({state:'hidden'});
        });
        await check('copy link fallback native share and detail return',async()=>{
          await open(); await share();
          await dialog().locator('[data-share-action="copy-link"]').click();
          await dialog().locator('.community-share-status').filter({hasText:'Post link copied.'}).waitFor();
          const copied=await page.evaluate(()=>navigator.clipboard.readText());
          assert.equal(new URL(copied).searchParams.get('postId'),'f5');
          await frame.evaluate(()=>{window.shareClipboard=navigator.clipboard;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('QA denied'))}});});
          await dialog().locator('[data-share-action="copy-link"]').click();
          await dialog().locator('[data-share-copy-field]').waitFor();
          assert.equal(new URL(await dialog().locator('[data-share-copy-field]').inputValue()).searchParams.get('postId'),'f5');
          await frame.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.shareClipboard}));
          await dialog().locator('[data-share-action="back"]').first().click();
          await dialog().locator('[data-share-action="more"]').click();
          await frame.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:payload=>{window.qaSharedPayload=payload;return Promise.resolve();}}));
          await dialog().locator('[data-share-action="native"]').click();
          assert.equal(new URL(await frame.evaluate(()=>window.qaSharedPayload.url)).searchParams.get('postId'),'f5');
          await dialog().locator('[data-share-action="copy-text"]').click();
          await dialog().locator('.community-share-status').filter({hasText:'Post text copied.'}).waitFor();
          assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).length>20);
          await dialog().locator('[data-share-action="close"]').click();
          await page.goto(copied,{waitUntil:'domcontentloaded'});
          await page.locator('#communityPane').locator('[data-social-post-detail="f5"]').waitFor();
          frame=nativePane(page);
          await frame.locator('[data-social-post-detail="f5"]').waitFor();
          await frame.locator('[data-social-post-detail="f5"] [data-social-action="share-post"]').click();
          await dialog().locator('[data-share-action="close"]').click();
          await frame.locator('[data-social-post-detail="f5"]').waitFor();
        });
        await check('publish to Feed reload and open original',async()=>{
          await open(); await share();
          const caption='Feed share '+account+' '+width;
          await dialog().locator('#communityShareCaption').fill(caption);
          await dialog().locator('[data-share-action="publish"]').click();
          await dialog().waitFor({state:'hidden'});
          const post=(await records()).find(row=>row.description===caption);
          assert.equal(post.sharedPostId,'f5');assert.equal(post.destinations.includeMainFeed,true);
          await loadPost(post.id);
          const card=frame.locator('#feedPosts [data-feed-post-id="'+post.id+'"]');
          await card.locator('.community-share-preview').waitFor();
          await page.reload({waitUntil:'domcontentloaded'});
          await page.locator('#communityPane').locator('#feedPosts [data-feed-post-id]').first().waitFor();
          frame=nativePane(page);
          await loadPost(post.id);
          await frame.locator('#feedPosts [data-feed-post-id="'+post.id+'"] .community-share-preview').waitFor();
          await frame.locator('#feedPosts [data-feed-post-id="'+post.id+'"] [data-social-action="open-original"]').click();
          await frame.locator('[data-social-post-detail="f5"]').waitFor();
        });
        await check('search choose group and persist destination',async()=>{
          await open(); await share();
          await dialog().locator('[data-share-action="groups"]').first().click();
          if(!await dialog().locator('[data-share-group]').count()) {
            assert.match(await dialog().innerText(),/No groups to share to/);
            await dialog().locator('[data-share-action="close"]').click();
            await page.goto(base+'/html/v3.1/'+entry+'&tab=groups',{waitUntil:'domcontentloaded'});
            await page.locator('#communityPane').locator('.community-group-section').first().waitFor();
            frame=nativePane(page);
            await frame.locator('.community-group-section').first().locator('[data-community-group-action="membership"][aria-pressed="false"]:enabled').first().click();
            await open();await share();await dialog().locator('[data-share-action="groups"]').first().click();
          }
          const choice=dialog().locator('[data-share-group]').first();await choice.waitFor();
          const id=await choice.getAttribute('data-share-group'),title=await choice.locator('strong').innerText();
          await dialog().locator('[data-share-search]').fill(title);
          assert.equal(await dialog().locator('[data-share-group]').count(),1);
          await page.screenshot({path:path.join(output,width+'-'+account+'-groups.png')});
          await dialog().locator('[data-share-group="'+id+'"]').click();
          const caption='Group share '+account+' '+width;
          await dialog().locator('#communityShareCaption').fill(caption);
          await dialog().locator('[data-share-action="publish"]').click();await dialog().waitFor({state:'hidden'});
          const post=(await records()).find(row=>row.description===caption);
          assert.deepEqual(post.destinations.groupIds,[id]);assert.equal(post.destinations.includeMainFeed,false);
        });
        await check('message search send and reopen stored post card',async()=>{
          await open(); await share();
          await dialog().locator('[data-share-action="messages"]').click();
          await dialog().locator('[data-share-recipient]').first().waitFor();
          const names=await dialog().locator('[data-share-recipient]').evaluateAll(nodes=>nodes.map(node=>node.dataset.shareRecipient));
          const friends=await page.evaluate(()=>window.NEXORA_COMMUNITY_SHARED.friendNames());
          const name=friends.find(name=>names.includes(name))||names.find(name=>name==='Kim Tuyen')||names[0];
          await dialog().locator('[data-share-search]').fill(name);
          await dialog().locator('[data-share-recipient]').filter({hasText:name}).click();
          const caption='Message share '+account+' '+width;
          await dialog().locator('#communityShareCaption').fill(caption);
          await page.screenshot({path:path.join(output,width+'-'+account+'-messages.png')});
          await dialog().locator('[data-share-action="send"]').click();await dialog().waitFor({state:'hidden'});
          const sent=await page.evaluate(caption=>Object.entries(localStorage).flatMap(([key,value])=>{try{return Object.values(JSON.parse(value)?.messages||{}).flat().filter(row=>row.text===caption);}catch{return [];}}),caption);
          assert.equal(sent.length,1);assert.equal(sent[0].contextCard.id,'f5');
          await page.goto(base+'/html/v3.1/'+entry+'&tab=connect',{waitUntil:'domcontentloaded'});
          await page.locator('#connectPane').locator('#messagesPanel').waitFor();
          const connect=nativePane(page,'#connectPane');
          await connect.locator('#messagesPanel [data-detail]').filter({has:connect.getByText(name,{exact:true})}).first().click();
          await connect.locator('.connect-context-card a').filter({hasText:'View post'}).waitFor();
          assert.equal(new URL(await connect.locator('.connect-context-card a').filter({hasText:'View post'}).getAttribute('href')).searchParams.get('postId'),'f5');
        });
        if(width===1280&&account==='business')await check('partial message failure keeps draft and retry avoids duplicates',async()=>{
          await open();await share();await dialog().locator('[data-share-action="messages"]').click();
          await dialog().locator('[data-share-recipient="Kim Tuyen"]').waitFor();
          await dialog().locator('[data-share-recipient="Kim Tuyen"]').click();
          await dialog().locator('[data-share-recipient="Sally Thanh Hoang"]').click();
          const caption='Retry share without duplicate messages';
          await dialog().locator('#communityShareCaption').fill(caption);
          await page.evaluate(()=>{const directory=window.NEXORA_COMMUNITY_PEOPLE;window.qaOriginalSend=directory.sendPost;directory.sendPost=(name,post)=>name==='Sally Thanh Hoang'?Promise.resolve(false):window.qaOriginalSend(name,post);});
          await dialog().locator('[data-share-action="send"]').click();
          await dialog().locator('.community-share-status').filter({hasText:'Something went wrong.'}).waitFor();
          assert.equal(await dialog().locator('#communityShareCaption').inputValue(),caption);
          assert.equal(await dialog().locator('[data-share-recipient="Kim Tuyen"]').isDisabled(),true);
          await page.evaluate(()=>{window.NEXORA_COMMUNITY_PEOPLE.sendPost=window.qaOriginalSend;delete window.qaOriginalSend;});
          await dialog().locator('[data-share-action="send"]').click();await dialog().waitFor({state:'hidden'});
          const sent=await page.evaluate(caption=>Object.entries(localStorage).flatMap(([,value])=>{try{return Object.values(JSON.parse(value)?.messages||{}).flat().filter(row=>row.text===caption);}catch{return [];}}),caption);
          assert.equal(sent.length,2);
        });
        await check('narrow audience cannot be widened',async()=>{
          await open();
          await page.evaluate(()=>{const key='nexora-community-templates-v1',data=JSON.parse(localStorage.getItem(key)),base=data.feed.find(row=>row.id==='f5');data.feed.unshift({...base,id:'qa-only-me',owner:window.NEXORA_COMMUNITY_SHARED.member,visibility:'me',destinations:{includeMainFeed:true,groupIds:[]}});localStorage.setItem(key,JSON.stringify(data));});
          await open();await share('qa-only-me');
          await dialog().locator('[data-share-action="audience"]').click();
          assert.equal(await dialog().locator('[data-share-audience="public"]').isDisabled(),true);
          assert.equal(await dialog().locator('[data-share-audience="friends"]').isDisabled(),true);
          await dialog().locator('[data-share-action="back"]').first().click();
          await dialog().locator('[data-share-action="groups"]').first().click();
          assert.equal(await dialog().locator('[data-share-group]').count(),0);
        });
      } finally { await context.close(); }
    }
  } finally {
    await browser?.close();await new Promise(resolve=>server.close(resolve));
    await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));
    console.log('TOTAL',results.filter(row=>row.pass).length+'/'+results.length,'errors='+errors.length);
  }
  process.exitCode=results.some(row=>!row.pass)||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
