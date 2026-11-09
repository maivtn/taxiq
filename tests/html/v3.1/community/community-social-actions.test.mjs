import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../../html/v3.1/community/community-feed-social.js',import.meta.url),'utf8');

test('Community post actions show like, comments, and share without a duplicate reactions item',t=>{
  const dom=new JSDOM('<!doctype html><html lang="vi"><body><main id="feedPosts"><article data-feed-post-id="post-1"><h3>Post</h3><p>Post content</p></article></main></body></html>',{
    url:'https://nexora.test/html/v3.1/community/nexora-community-prototype.html',
    runScripts:'outside-only'
  });
  t.after(()=>dom.window.close());

  const {window}=dom,posts=[{id:'post-1',kind:'general',owner:'Other',title:'Post',description:'Post content',likeCount:0}];
  window.eval(source);
  const social=window.NEXORA_COMMUNITY_FEED_SOCIAL.mount({getFeed:()=>posts,currentMember:'Me'});
  social.enhance();

  const actions=[...window.document.querySelector('.community-social-actions').children];
  assert.deepEqual(actions.map(action=>action.dataset.socialAction),['like','comments','share-post']);
  assert.equal(actions[0].querySelector('.community-social-count').textContent,'0');
});
