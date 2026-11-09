import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const shared=readFileSync(new URL('../../../html/v3.1/community/community-shared.js',import.meta.url),'utf8');
const feed=readFileSync(new URL('../../../html/v3.1/community/community-po-feed.js',import.meta.url),'utf8');
for(const [query,expected] of [
  ['account=personal',['shop','realestate','food']],
  ['account=personal&role=tech',['shop','realestate','food']],
  ['role=tech&account=business',['shop','realestate','food']],
  ['account=business',['shop','transfer','realestate','food']]
])test('Feed shortcuts follow demo account: '+query,async t=>{
  const dom=new JSDOM('<section id="feedView"><div id="feedComposerCard"></div></section>',{url:'https://demo.test/html/v3.1/community/nexora-community-prototype.html?'+query,runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const {window}=dom;
  Object.defineProperty(window.document,'currentScript',{value:{src:'https://demo.test/html/v3.1/community/community-po-feed.js'}});
  window.eval(shared);window.eval(feed);
  const owner=query==='account=business';
  assert.equal(window.NEXORA_COMMUNITY_SHARED.canAccessFeature('shop'),true);
  assert.equal(window.NEXORA_COMMUNITY_SHARED.canAccessFeature('storeServices'),true);
  for(const feature of ['foodMerchant','transfer','workers','services','hiring','posRecruitment'])assert.equal(window.NEXORA_COMMUNITY_SHARED.canAccessFeature(feature),owner);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  await new Promise(resolve=>setTimeout(resolve,110));
  assert.deepEqual([...window.document.querySelectorAll('[data-community-shortcut]')].map(node=>node.dataset.communityShortcut),expected);
});
