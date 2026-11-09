import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../../html/v3.1/community/community-po-feed.js',import.meta.url),'utf8');
const cards=count=>Array.from({length:count},(_,index)=>`<article class="content-card" data-feed-post-id="post-${index}"></article>`).join('');
async function waitFor(predicate){
  for(let attempt=0;attempt<100;attempt++){
    if(predicate())return;
    await new Promise(resolve=>setTimeout(resolve,10));
  }
  assert.ok(predicate(),'Feed did not settle into the requested order');
}
function fixture(t,count=6){
  const dom=new JSDOM(`<section id="feedView"><div id="feedComposerCard"></div><div id="feedPosts">${cards(count)}</div></section>`,{url:'https://demo.test/html/v3.1/community/nexora-community-prototype.html',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const {window}=dom;
  Object.defineProperty(window.document,'currentScript',{value:{src:'https://demo.test/html/v3.1/community/community-po-feed.js'}});
  window.NEXORA_COMMUNITY_SHARED={canAccessFeature:()=>true};
  let previews=0;
  window.NEXORA_COMMUNITY_FEED={preview:async()=>{previews++;return {stories:'<section>Story</section>',people:'<section><button data-person-connect="person-1">Connect</button></section>',reels:'<section><button data-feed-kind="reel">Create Reel</button></section>'};}};
  window.eval(source);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  return {window,document:window.document,previews:()=>previews};
}
const order=document=>[...document.getElementById('feedPosts').children].map(node=>node.dataset.feedPostId||node.id);
const expected=count=>['post-0'].slice(0,count).concat('communityPOPeople','communityPOReels',Array.from({length:Math.max(0,count-1)},(_,index)=>'post-'+(index+1)));

test('The retained Feed places People and Reels after one post without replacing post nodes',async t=>{
  const {document,previews}=fixture(t);
  const original=[...document.querySelectorAll('article')];
  await waitFor(()=>document.querySelector('#communityPOReels button'));
  assert.deepEqual(order(document),expected(6));
  assert.equal(document.getElementById('communityPOStories').previousElementSibling.id,'feedComposerCard');
  assert.deepEqual([...document.querySelectorAll('article')],original);
  await new Promise(resolve=>setTimeout(resolve,200));
  assert.ok(previews()<=3,'Moving the components must not keep refreshing the Feed');
});

test('Filtering, loading more and rebuilding the Feed restore exactly one pair of components',async t=>{
  const {document}=fixture(t);
  await waitFor(()=>document.querySelector('#communityPOReels button'));
  const posts=document.getElementById('feedPosts');
  for(const count of [1,0,2,12,6]){
    posts.innerHTML=cards(count);
    await waitFor(()=>document.querySelector('#communityPOReels button'));
    assert.deepEqual(order(document),expected(count));
    assert.equal(document.querySelectorAll('#communityPOPeople').length,1);
    assert.equal(document.querySelectorAll('#communityPOReels').length,1);
  }
});

test('Leaving Feed pauses Reels and returning restores the same ordering',async t=>{
  const {window,document}=fixture(t);
  await waitFor(()=>document.querySelector('#communityPOReels button'));
  const reel=document.createElement('video');let paused=false;reel.pause=()=>{paused=true;};
  document.getElementById('communityPOReels').append(reel);
  const feed=document.getElementById('feedView');
  feed.classList.add('hide');
  await waitFor(()=>document.getElementById('communityPOReels').hidden);
  assert.equal(paused,true);
  feed.classList.remove('hide');
  await waitFor(()=>!document.getElementById('communityPOReels').hidden);
  assert.deepEqual(order(document),expected(6));
  const messages=[];window.postMessage=message=>messages.push(message);
  document.querySelector('#communityPOReels button').click();
  assert.deepEqual(JSON.parse(JSON.stringify(messages)),[{type:'nexora-community-route',route:'reels',context:{composeReel:'1'}}]);
});
