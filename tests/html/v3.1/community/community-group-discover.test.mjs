import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../../html/v3.1/community/community-group-workflow.js',import.meta.url),'utf8');
function fixture(t,lang='en') {
  const dom=new JSDOM(`<html lang="${lang}"><body><section id="groupsView"><div class="subrow"><div class="subtabs"><button data-view="groups"></button><button data-view="market"></button></div></div><div><div id="groupCards"></div></div></section></body></html>`,{url:'https://demo.test',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const {window}=dom;
  const groups=[{id:'public',title:'Houston',region:'Houston',groupType:'Community'},{id:'private',title:'Private',privacy:'private'},{id:'market',title:'Marketplace',groupType:'Marketplace'}];
  const post=(id,groupId,createdAt='2026-11-09T10:00:00Z',other={})=>({id,destinations:{includeMainFeed:false,groupIds:[groupId]},createdAt,...other});
  const posts=[post('old','public','2026-11-08T10:00:00Z'),post('new','public'),post('new','public'),post('private','private'),post('market','market'),post('draft','public',undefined,{status:'draft'}),post('pending','public',undefined,{groupStatus:'pending'}),post('paused','public',undefined,{paused:true}),post('future','public',undefined,{publishAt:'2099-11-09T10:00:00Z'})];
  window.eval(source);
  let enhancements=0;
  const workflow=window.NEXORA_COMMUNITY_GROUPS.mount({currentMember:'Demo',getGroups:()=>groups,getFeed:()=>posts,getJoinedGroups:()=>[],renderPost:post=>`<article data-feed-post-id="${post.id}"></article>`,enhancePosts:()=>enhancements++});
  workflow.enhance();
  return {window,document:window.document,workflow,enhancements:()=>enhancements};
}

for(const [lang,heading,latest] of [['vi','Nhóm dành cho bạn','Bài mới trong nhóm'],['en','Groups for you','New group posts']])test('Discover shows recommendations followed by group posts in '+lang,t=>{
  const {document,enhancements}=fixture(t,lang);
  const sections=[...document.querySelectorAll('.community-group-section')];
  assert.equal(sections[0].querySelector('h3').textContent,heading);
  assert.equal(sections[1].querySelector('h3').textContent,latest);
  assert.ok(enhancements()>0,'Use the existing social controls for group post cards');
});

test('Discover sorts and deduplicates published posts without exposing private or marketplace content',t=>{
  const {document}=fixture(t);
  assert.deepEqual([...document.querySelectorAll('.community-group-posts article')].map(card=>card.dataset.feedPostId),['new','old']);
  const filter=document.querySelector('[data-community-group-filter="city"]');
  filter.value='Houston';filter.dispatchEvent(new document.defaultView.Event('change',{bubbles:true}));
  assert.equal(document.querySelectorAll('.community-group-posts article').length,2);
  document.querySelector('[data-po-my-groups]').click();
  assert.equal(document.querySelector('.community-group-latest'),null);
  document.querySelector('[data-po-group-discover]').click();
  const input=document.querySelector('[data-po-group-search]');
  input.value='No matching group';input.dispatchEvent(new document.defaultView.Event('input',{bubbles:true}));
  assert.equal(document.querySelectorAll('.community-group-posts article').length,0);
});
