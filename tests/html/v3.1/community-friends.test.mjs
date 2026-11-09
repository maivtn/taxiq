import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {JSDOM} from 'jsdom';

const source=name=>readFileSync(new URL('../../../html/v3.1/community/'+name,import.meta.url),'utf8');
const sharedSource=source('community-shared.js'),directorySource=source('community-directory.js');
function setup(t,member='Alice',store=new Map(),names=['Alice','Bob','Carol','Salon']){
  const dom=new JSDOM('',{url:'https://demo.test/html/v3.1/community.html?account=personal&member='+encodeURIComponent(member),runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const {window}=dom;
  Object.defineProperty(window.crypto,'randomUUID',{value:randomUUID});
  Object.defineProperty(window,'localStorage',{value:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value))}});
  window.eval(sharedSource);window.eval(directorySource);
  const shared=window.NEXORA_COMMUNITY_SHARED;
  for(const name of names)shared.identity(name,'legacy-'+name);
  const connect={directory:()=>names.filter(name=>name!==member).map(name=>({...shared.identity(name),handle:'@'+name.toLowerCase()}))};
  const frame={contentWindow:{NEXORA_COMMUNITY_CONNECT:connect,NEXORA_CONNECT_CORE:{refresh(){}}}};
  const directory=window.NEXORA_COMMUNITY_DIRECTORY.create(frame,window.location.href,new URLSearchParams(window.location.search));
  return {window,shared,directory,store,id:name=>shared.identity(name).id};
}
const names=value=>Array.from(value).sort();

test('Requests are pending until the recipient accepts; duplicate sends do not cancel them',t=>{
  const a=setup(t),b=setup(t,'Bob',a.store);
  assert.equal(a.directory.addFriend(a.id('Bob')),true);
  assert.equal(a.directory.addFriend(a.id('Bob')),false);
  assert.deepEqual(names(a.directory.state().sent),[a.id('Bob')]);
  assert.deepEqual(names(a.shared.friendNames()),[]);
  assert.equal(a.directory.respond(a.id('Bob'),true),false);
  assert.equal(b.directory.cancelRequest(b.id('Alice')),false);
  assert.equal(b.directory.respond(b.id('Alice'),true),true);
  assert.deepEqual(names(a.shared.friendNames()),['Bob']);
  assert.deepEqual(names(b.shared.friendNames()),['Alice']);
  assert.equal(a.directory.state().sent.length,0);
});

test('Cancellation and deletion persist without accepting or recreating a relationship',t=>{
  const a=setup(t),b=setup(t,'Bob',a.store);
  a.directory.addFriend(a.id('Bob'));
  assert.equal(a.directory.cancelRequest(a.id('Bob')),true);
  assert.equal(b.directory.respond(b.id('Alice'),true),false);
  a.directory.addFriend(a.id('Bob'));
  assert.equal(b.directory.respond(b.id('Alice'),false),true);
  assert.equal(a.directory.state().sent.length,0);
  assert.equal(b.directory.state().received.length,0);
  assert.deepEqual(names(a.shared.friendNames()),[]);
  assert.equal(a.shared.read().friendRequests.at(-1).status,'declined');
});

test('Unfriending removes both sides, survives legacy connections and preserves customer contacts and chats',t=>{
  const a=setup(t),b=setup(t,'Bob',a.store);
  const key='nexora-connect-preview-v2:'+encodeURIComponent('Alice');
  const history={connections:['legacy-Bob'],sentMessages:{chat:[{text:'Keep this message'}]}};
  a.store.set(key,JSON.stringify(history));
  a.shared.saveBusinessContact('Alice','Salon');
  a.shared.change(data=>{data.friendRequests=[{id:'accepted',from:'Alice',to:'Bob',status:'accepted'}];});
  assert.equal(a.directory.unfriend(a.id('Bob')),true);
  assert.deepEqual(names(a.shared.friendNames()),[]);
  assert.deepEqual(names(b.shared.friendNames()),[]);
  assert.equal(a.shared.connectedPeople().includes('Salon'),true);
  assert.equal(a.shared.connectedPeople().includes('Bob'),false);
  assert.deepEqual(JSON.parse(a.store.get(key)),history);
  const reloaded=setup(t,'Alice',a.store);
  assert.equal(reloaded.directory.state().friends.length,0);
  assert.equal(reloaded.shared.friendRemoved('Bob','Alice'),true);
  assert.equal(a.directory.unfriend(a.id('Bob')),false);
});

test('Sending a new request does not restore a removed friend until the recipient accepts',t=>{
  const a=setup(t),b=setup(t,'Bob',a.store);
  a.directory.addFriend(a.id('Bob'));b.directory.respond(b.id('Alice'),true);
  a.directory.unfriend(a.id('Bob'));
  assert.equal(a.directory.addFriend(a.id('Bob')),true);
  assert.deepEqual(names(a.shared.friendNames()),[]);
  assert.equal(b.directory.addFriend(b.id('Alice')),true);
  assert.deepEqual(names(a.shared.friendNames()),['Bob']);
  assert.equal(a.shared.friendRemoved('Alice','Bob'),false);
  assert.equal(a.shared.read().friendRequests.filter(row=>row.status==='pending').length,0);
});

test('Friends demo requests seed once and do not restore cancelled or deleted examples',async t=>{
  const members=['David Le','Thảo Lê','Hà Nguyễn','Jessica Nguyen'];
  const a=setup(t,'David Le',new Map(),members);
  await a.directory.ready();
  assert.equal(a.directory.state().received.length,2);
  assert.equal(a.directory.state().sent.length,1);
  a.directory.respond(a.id('Thảo Lê'),false);a.directory.cancelRequest(a.id('Jessica Nguyen'));
  const reloaded=setup(t,'David Le',a.store,members);
  await reloaded.directory.ready();
  assert.equal(reloaded.directory.state().received.length,1);
  assert.equal(reloaded.directory.state().sent.length,0);
  assert.equal(a.shared.read().friendRequests.length,3);
});

test('Unavailable and self identities cannot be targets of friendship actions',t=>{
  const a=setup(t);
  for(const id of [a.id('Alice'),'NX-UNKNOWN']){
    assert.equal(a.directory.addFriend(id),false);
    assert.equal(a.directory.respond(id,true),false);
    assert.equal(a.directory.cancelRequest(id),false);
    assert.equal(a.directory.unfriend(id),false);
  }
});
