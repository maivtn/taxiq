/* Verify the actual v3.1 Feed, including its retained iframe and native tools. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.COMMUNITY_BASE_URL||'http://127.0.0.1:5503';
const output=process.env.COMMUNITY_TEST_EVIDENCE||'/tmp/taxiq-community-feed-order';

(async()=>{
  await fs.mkdir(output,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const results=[],errors=[];
  try{
    for(const width of [390,834,1280])for(const account of ['business','personal']){
      const context=await browser.newContext({viewport:{width,height:width===390?844:1000},locale:'en-US'});
      try{
        await context.addInitScript(()=>{for(const key of ['nexora-community-tour-desktop-v1','nexora-community-tour-mobile-v1'])localStorage.setItem(key,'1');});
        const page=await context.newPage();page.setDefaultTimeout(12000);
        page.on('pageerror',error=>errors.push({width,account,error:error.message}));
        const entry=account==='business'?'community.html?tab=feed':'staff-community.html?tab=feed&account=personal&role=tech';
        let frame;
        const tools=()=>page.locator('.community-extra-pane');
        async function ready(){
          await page.frameLocator('#communityPane').locator('#communityPOPeople .people-card').first().waitFor();
          frame=page.frames().find(item=>item.url().includes('nexora-community-prototype.html'));
          await frame.waitForFunction(()=>document.documentElement.lang==='en');
        }
        async function open(){await page.goto(origin+'/html/v3.1/'+entry,{waitUntil:'domcontentloaded'});await ready();}
        async function state(){return frame.evaluate(()=>{
          const people=document.getElementById('communityPOPeople'),reels=document.getElementById('communityPOReels');
          const posts=[...document.querySelectorAll('#feedPosts > article.content-card')];
          return {count:posts.length,ids:posts.map(node=>node.dataset.feedPostId||node.dataset.postId||node.querySelector('h3')?.textContent),beforePeople:posts.filter(node=>node.compareDocumentPosition(people)&Node.DOCUMENT_POSITION_FOLLOWING).length,beforeReels:posts.filter(node=>node.compareDocumentPosition(reels)&Node.DOCUMENT_POSITION_FOLLOWING).length,adjacent:people.nextElementSibling===reels,people:document.querySelectorAll('#communityPOPeople').length,reels:document.querySelectorAll('#communityPOReels').length,storyBeforePosts:posts.every(node=>document.getElementById('communityPOStories').compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING),overflow:document.documentElement.scrollWidth>innerWidth};
        });}
        async function ordered(){
          await frame.waitForFunction(()=>{const root=document.getElementById('feedPosts'),posts=[...root.children].filter(node=>node.matches('article.content-card')),people=document.getElementById('communityPOPeople'),reels=document.getElementById('communityPOReels');return people&&reels&&people.parentElement===root&&(posts.length?people.previousElementSibling===posts[Math.min(1,posts.length-1)]:true)&&people.nextElementSibling===reels;});
          const value=await state();assert.equal(value.beforePeople,Math.min(2,value.count));assert.equal(value.beforeReels,Math.min(2,value.count));assert.equal(value.adjacent,true);assert.equal(value.people,1);assert.equal(value.reels,1);assert.equal(value.storyBeforePosts,true);assert.equal(value.overflow,false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);return value;
        }
        async function check(name,fn){
          try{const evidence=await fn();results.push({width,account,name,pass:true,evidence});console.log('PASS',width,account,name);}
          catch(error){results.push({width,account,name,pass:false,error:error.stack});console.log('FAIL',width,account,name,error.message);await page.screenshot({path:path.join(output,`${width}-${account}-${name.replace(/\W+/g,'-')}-failed.png`)}).catch(()=>{});}
        }
        await check('Story, two posts, People, Reels, remaining posts and reload',async()=>{
          await open();const value=await ordered();assert.ok(value.count>2);
          await frame.locator('#communityPOPeople').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`${width}-${account}-people-reels.png`)});
          await frame.locator('#feedView').screenshot({path:path.join(output,`${width}-${account}-feed.png`)});
          await page.reload({waitUntil:'domcontentloaded'});await ready();const reloaded=await ordered();assert.deepEqual(reloaded.ids,value.ids);return value;
        });
        await check('load more and filter preserve insertion and original post order',async()=>{
          const initial=await ordered();
          if(await frame.locator('#feedMore').isVisible()){
            await frame.locator('#feedMore').click();await frame.waitForFunction(count=>document.querySelectorAll('#feedPosts > article.content-card').length>count,initial.count);const more=await ordered();assert.deepEqual(more.ids.slice(0,initial.count),initial.ids);
          }
          const values=await frame.locator('#feedFilterSelect option').evaluateAll(nodes=>nodes.map(node=>node.value));
          const counts={};
          for(const value of values){await frame.locator('#feedFilterSelect').selectOption(value);counts[value]=(await ordered()).count;}
          await frame.locator('#feedFilterSelect').selectOption('all');await ordered();return counts;
        });
        await check('Connect, Find people, profile and Feed return',async()=>{
          await open();await ordered();const button=frame.locator('#communityPOPeople [data-person-connect]:enabled').first();
          const id=await button.getAttribute('data-person-connect');await button.click();
          await frame.locator(`#communityPOPeople [data-person-connect="${id}"]`).filter({hasText:'Sent'}).waitFor();
          await frame.locator(`#communityPOPeople [data-person-view="${id}"]`).click();await tools().locator('.person-profile').waitFor();
          await page.goBack({waitUntil:'domcontentloaded'});await ready();await ordered();
          await frame.locator('#communityPOPeople [data-action="people-all"]').click();await tools().locator('#people-search').waitFor();
          await page.goBack({waitUntil:'domcontentloaded'});await ready();await ordered();
        });
        await check('Story and Reel create shortcuts, playback and return',async()=>{
          await open();await ordered();
          await frame.locator('#communityPOStories [data-action="story-compose"]').click();await tools().locator('#story-form').waitFor();
          await page.goBack({waitUntil:'domcontentloaded'});await ready();await ordered();
          const play=frame.locator('#communityPOReels [data-reel-play]').first();
          await play.click();await frame.waitForFunction(()=>[...document.querySelectorAll('#communityPOReels video')].some(video=>!video.paused&&video.currentTime>0));
          await frame.locator('#communityPOReels [data-feed-kind="reel"]').click();await tools().locator('#reel-form').waitFor();
          assert.ok(await tools().locator('#reel-form input[type="file"]').count());
          await page.goBack({waitUntil:'domcontentloaded'});await ready();await ordered();
          await frame.locator('#communityPOReels [data-section="reels"]').click();await tools().locator('.reels-page').waitFor();
          await page.goBack({waitUntil:'domcontentloaded'});await ready();await ordered();
        });
      }finally{await context.close();}
    }
  }finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));}
  console.log(`TOTAL ${results.filter(row=>row.pass).length}/${results.length}; pageErrors=${errors.length}`);
  process.exitCode=results.some(row=>!row.pass)||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
