import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/assets/community-v2/community-group-workflow.js',import.meta.url),'utf8');
const key='nexora-community-group-workflow-v1',baseKey='nexora-community-templates-v1';
const plain=value=>JSON.parse(JSON.stringify(value));
function boot(t,{groups=[],feed=[],member='Me',joined={}}={}) {
  const dom=new JSDOM('<!doctype html><html lang="en"><body><div id="groupContainer"><div id="groupCards"></div></div><div id="modalRoot"></div></body></html>',{url:'https://nexora.test/community',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window,d=w.document,notices=[],navigations=[],chats=[],posts=[];
  w.localStorage.setItem(baseKey,JSON.stringify({groups,feed,joinedGroups:joined,unrelated:{keep:true}}));
  const read=()=>JSON.parse(w.localStorage.getItem(baseKey));
  const write=patch=>{w.localStorage.setItem(baseKey,JSON.stringify({...read(),...patch}));return true;};
  let failMembership=false,failGroups=false,workflow;
  const adapter={
    currentMember:member,getGroups:()=>read().groups,getFeed:()=>read().feed,getJoinedGroups:()=>read().joinedGroups,
    setMembership:(id,value)=>failMembership?false:write({joinedGroups:{...read().joinedGroups,[id]:value}}),
    saveGroups:rows=>failGroups?false:write({groups:rows}),saveFeed:rows=>write({feed:rows}),
    deleteGroupPosts:id=>write({feed:read().feed.flatMap(post=>{const destinations=post.destinations;if(!destinations?.groupIds?.includes(id))return [post];const remaining=destinations.groupIds.filter(value=>value!==id);return !destinations.includeMainFeed&&!remaining.length?[]:[{...post,destinations:{...destinations,groupIds:remaining}}];})}),
    render:()=>workflow?.enhance(),openDialog:html=>{d.querySelector('#modalRoot').innerHTML=html;},closeDialog:()=>{d.querySelector('#modalRoot').innerHTML='';},toast:value=>notices.push(value),navigateFeed:scope=>navigations.push(scope),openChat:group=>chats.push(group.id),openPost:id=>posts.push(id)
  };
  w.eval(source);workflow=w.NEXORA_COMMUNITY_GROUPS.mount(adapter);workflow.enhance();
  const click=selector=>{const target=d.querySelector(selector);assert.ok(target,selector);target.click();};
  return {w,d,workflow,adapter,read,write,notices,navigations,chats,posts,click,failMembership:()=>{failMembership=true;},failGroups:()=>{failGroups=true;}};
}

test('directory retains PO details, city/topic/type filters and owner membership',t=>{
  const app=boot(t,{groups:[{id:'mine',title:'My group',owner:'Me',industry:'Nail',city:'Houston',rules:'No spam',groupType:'Community'},{id:'market',title:'Market',owner:'Other',industry:'Hair',city:'Dallas',groupType:'Marketplace'}]});
  assert.equal(app.d.querySelectorAll('[data-community-group-card]').length,2);
  const owner=app.d.querySelector('[data-community-group-card="mine"]');
  assert.equal(owner.querySelector('[data-community-group-action="membership"]').disabled,true);
  assert.match(owner.textContent,/No spam/);
  const city=app.d.querySelector('[data-community-group-filter="city"]');city.value='Dallas';city.dispatchEvent(new app.w.Event('change',{bubbles:true}));
  assert.deepEqual([...app.d.querySelectorAll('[data-community-group-card]')].map(row=>row.dataset.communityGroupCard),['market']);
  const topic=app.d.querySelector('[data-community-group-filter="topic"]');topic.value='Nail';topic.dispatchEvent(new app.w.Event('change',{bubbles:true}));
  assert.equal(app.d.querySelectorAll('[data-community-group-card]').length,0);
  assert.deepEqual(plain(app.workflow.store.members('mine')),['Me']);
  assert.equal(app.workflow.store.leave('mine'),false);
});

test('group detail shows five newest source posts and join gates its chat shortcut',t=>{
  const groups=[{id:'g',title:'Gel-X',owner:'Other',rules:'Respect authors',groupType:'Community'}];
  const feed=Array.from({length:7},(_,i)=>({id:'p'+i,owner:'Author '+i,title:'Post '+i,createdAt:`2026-10-${String(i+1).padStart(2,'0')}T10:00:00Z`,destinations:{includeMainFeed:false,groupIds:['g']}}));
  const app=boot(t,{groups,feed});
  app.click('[data-community-group-action="detail"]');
  assert.match(app.d.querySelector('[data-community-group-dialog]').textContent,/Respect authors/);
  assert.deepEqual([...app.d.querySelectorAll('[data-community-group-post]')].map(row=>row.dataset.communityGroupPost),['p6','p5','p4','p3','p2']);
  assert.equal(app.d.querySelector('[data-community-group-action="chat"]').disabled,true);
  app.click('[data-community-group-dialog] [data-community-group-action="membership"]');
  assert.equal(app.read().joinedGroups.g,true);
  assert.equal(app.d.querySelector('[data-community-group-action="chat"]').disabled,false);
  app.click('[data-community-group-action="chat"]');assert.deepEqual(app.chats,['g']);
  app.workflow.openGroup('g');app.click('[data-community-group-action="feed"]');assert.deepEqual(app.navigations,['group:g']);
  app.workflow.openGroup('g');app.click('[data-community-group-post="p6"]');assert.deepEqual(app.posts,['p6']);
});

test('All includes main and joined-group posts exactly once without exposing unjoined-only posts',t=>{
  const app=boot(t,{groups:[{id:'mine',owner:'Me',title:'Own'},{id:'joined',owner:'Other',title:'Joined'},{id:'away',owner:'Other',title:'Away'}],joined:{joined:true}});
  const posts=[{id:'main'},{id:'own',destinations:{includeMainFeed:false,groupIds:['mine']}},{id:'joined',destinations:[{groupId:'joined',isMainFeed:false}]},{id:'away',destinations:{includeMainFeed:false,groupIds:['away']}},{id:'both',destinations:{includeMainFeed:true,groupIds:['joined']}}];
  assert.deepEqual(plain(app.workflow.filter([...posts,posts[4]]).map(post=>post.id)),['main','own','joined','both']);
  assert.deepEqual(plain(app.workflow.filter(posts,'main').map(post=>post.id)),['main','both']);
  assert.deepEqual(plain(app.workflow.filter(posts,'group:away').map(post=>post.id)),['away']);
});

test('two store adapters share latest invitations and members without losing intervening writes',t=>{
  const app=boot(t,{groups:[{id:'g',title:'Owner group',owner:'Me'},{id:'other',title:'Other group',owner:'Me'}]});
  const owner=app.workflow.store;
  const guest=app.w.NEXORA_COMMUNITY_GROUPS.createStore({...app.adapter,currentMember:'Guest',getJoinedGroups:()=>({}),setMembership:()=>true});
  const invitation=owner.invite('g','Guest');assert.equal(invitation.status,'pending');
  owner.invite('other','Second guest');
  assert.equal(guest.invitations()[0].id,invitation.id);
  assert.equal(guest.respond(invitation.id,true),true);
  assert.deepEqual(plain(owner.members('g')),['Me','Guest']);
  assert.equal(owner.invitations('Second guest').length,1);
  assert.equal(guest.canManage('g'),false);
  assert.equal(guest.remove('g','Me'),false);
  assert.equal(owner.remove('g','Me'),false);
  assert.equal(owner.remove('g','Guest'),true);
  assert.deepEqual(plain(guest.members('g')),['Me']);
});

test('rejected source persistence rolls group membership back and reports the failure',t=>{
  const app=boot(t,{groups:[{id:'g',title:'Group',owner:'Other'}]});
  const before=app.w.localStorage.getItem(key);app.failMembership();
  assert.equal(app.workflow.store.join('g'),false);
  assert.equal(app.w.localStorage.getItem(key),before);
  assert.equal(app.read().joinedGroups.g,undefined);
  assert.equal(app.workflow.store.joined('g'),false);
  assert.match(app.notices.at(-1),/Something went wrong/);
});

test('creation sets the author owner and retains unrelated source data; deletion removes only group destinations',t=>{
  const app=boot(t,{groups:[],feed:[{id:'groupOnly',destinations:{includeMainFeed:false,groupIds:['new']}},{id:'shared',owner:'Other',destinations:{includeMainFeed:true,groupIds:['new','else']}},{id:'unrelated'}]});
  const created=app.workflow.store.create({id:'new',title:'My new group',owner:'Forged author',rules:'Rules'});
  assert.equal(created.owner,'Me');assert.deepEqual(plain(app.workflow.store.members('new')),['Me']);
  assert.deepEqual(app.read().unrelated,{keep:true});
  app.workflow.store.invite('new','Guest');
  assert.equal(app.workflow.store.deleteGroup('new'),true);
  assert.deepEqual(app.read().feed.map(post=>post.id),['shared','unrelated']);
  assert.equal(app.read().feed[0].owner,'Other');assert.deepEqual(app.read().feed[0].destinations.groupIds,['else']);
  assert.equal(app.workflow.store.invitations('Guest').length,0);
  app.write({groups:[created]});assert.equal(app.workflow.store.groups().length,0);
});

test('group deletion restores feed and workflow when group metadata cannot be saved',t=>{
  const originalFeed=[{id:'p',owner:'Me',destinations:{includeMainFeed:false,groupIds:['g']}}];
  const app=boot(t,{groups:[{id:'g',title:'Own',owner:'Me'}],feed:originalFeed});
  app.workflow.store.invite('g','Guest');const before=app.w.localStorage.getItem(key);app.failGroups();
  assert.equal(app.workflow.store.deleteGroup('g'),false);
  assert.deepEqual(app.read().feed,originalFeed);assert.equal(app.read().groups.length,1);
  assert.equal(app.w.localStorage.getItem(key),before);assert.equal(app.workflow.store.invitations('Guest').length,1);
});
