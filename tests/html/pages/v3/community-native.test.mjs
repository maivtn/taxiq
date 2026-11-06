import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const root=new URL('../../../../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
function boot(t,responses={},member='QA'){
  const dom=new JSDOM('<body><div id="outside">Outside</div></body>',{url:'https://community.test/html/pages/v3/community.html?member='+encodeURIComponent(member),runScripts:'outside-only',pretendToBeVisual:true});
  t.after(()=>dom.window.close());
  const w=dom.window;
  w.scrollTo=()=>{};
  w.fetch=async value=>{const url=new URL(value);const text=responses[url.pathname]??read(url.pathname.slice(1));return {ok:true,text:async()=>text};};
  w.eval(read('html/pages/v3/community/community-shared.js'));
  w.eval(read('html/pages/v3/community/community-native.js'));
  return w;
}
async function mount(w,path){const host=w.document.createElement('section');w.document.body.append(host);return w.NEXORA_NATIVE.mount(host,path);}

test('v3 native regions isolate document queries, inline actions, globals and custom events',async t=>{
  const w=boot(t,{'/fixture.html':`<html><head></head><body><button id="counter" onclick="count++;this.textContent=count">Count</button><script>let count=0;window.scoped=this===window&&document.getElementsByTagName('head')[0]===document.head&&!document.getElementById('outside');window.signal=0;window.addEventListener('nexora-fixture',()=>window.signal++);window.dispatchEvent(new Event('nexora-fixture'));</script></body></html>`});
  const first=await mount(w,'/fixture.html'),second=await mount(w,'/fixture.html');
  assert.equal(first.window.scoped,true);assert.equal(first.window.signal,1);
  first.document.getElementById('counter').click();
  assert.equal(first.document.getElementById('counter').textContent,'1');
  assert.equal(second.document.getElementById('counter').textContent,'Count');
  assert.equal(w.signal,undefined);
});

test('v3 native storage notifies sibling regions without echoing the writer',async t=>{
  const html='<body><script>window.seen=0;window.addEventListener("storage",()=>window.seen++);</script></body>';
  const w=boot(t,{'/storage.html':html}),a=await mount(w,'/storage.html'),b=await mount(w,'/storage.html');
  a.window.localStorage.setItem('v3-sync','saved');
  assert.equal(a.window.seen,0);assert.equal(b.window.seen,1);
  assert.equal(b.window.localStorage.getItem('v3-sync'),'saved');
});

test('v3 shared identity and wallet prevent duplicate grants and reverse removed content',t=>{
  const w=boot(t),shared=w.NEXORA_COMMUNITY_SHARED,identity=shared.me();
  assert.match(identity.id,/^NX-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.equal(shared.identity().id,identity.id);
  assert.equal(shared.activity('post','qa-post'),true);
  assert.equal(shared.activity('post','qa-post'),false);
  assert.equal(shared.wallet().balance,20);
  assert.equal(shared.points(-100,'wheel:exchange','qa-insufficient'),false);
  shared.revoke('qa-post');shared.revoke('qa-post');
  assert.equal(shared.wallet().balance,0);
  assert.equal(shared.wallet().ledger.length,2);
});

test('v3 Lucky Wheel starts without an entry overlay and retains one interface language',async t=>{
  const w=boot(t),api=await mount(w,'/html/pages/v3/community/modules/wheel/index.html');
  assert.equal(api.document.getElementById('entryModal').classList.contains('hidden'),true);
  await new Promise(resolve=>w.setTimeout(resolve,900));
  assert.equal(api.document.getElementById('entryModal').classList.contains('hidden'),true);
  assert.equal(api.document.getElementById('hubSub').hidden,true);
  assert.equal(api.document.getElementById('tourStartBtn').hidden,true);
  assert.equal(api.document.documentElement.lang,'en');
  api.destroy();
});

test('v3 Meet edits keep the scheduled timezone and searches Ho Chi Minh without losing the draft',async t=>{
  const w=boot(t),shared=w.NEXORA_COMMUNITY_SHARED;
  shared.change(store=>store.meetings.push({id:'qa-meeting',title:'Chicago meeting',host:shared.member,startsAt:'2026-11-08T01:00:00.000Z',timezone:'America/Chicago',duration:60,participants:[shared.member],invitees:[],cohosts:[],waiting:[],messages:[],muted:[]}));
  const api=await mount(w,'/html/pages/v3/community/modules/meet/index.html');
  api.document.querySelector('[data-meet-action="edit"]').click();
  const form=api.document.getElementById('meetScheduleForm');
  assert.equal(form.elements.date.value,'2026-11-07');assert.equal(form.elements.time.value,'19:00');
  form.elements.title.value='Unsaved draft';
  api.document.querySelector('[data-meet-action="screen"][data-meet-id="tz"]').click();
  const search=api.document.getElementById('meetZoneSearch');search.value='Ho Chi Minh';search.dispatchEvent(new w.Event('input',{bubbles:true}));
  const zone=api.document.querySelector('[data-meet-action="zone"]');
  assert.equal(zone.dataset.meetId,'Asia/Ho_Chi_Minh');zone.click();
  assert.equal(api.document.getElementById('meetScheduleForm').elements.title.value,'Unsaved draft');
  api.destroy();
});

test('v3 Meet rejects administrator controls for a co-host who is no longer a participant',async t=>{
  const w=boot(t),shared=w.NEXORA_COMMUNITY_SHARED;
  shared.change(store=>store.meetings.push({id:'removed-meeting',title:'Private meeting',host:'Owner',startsAt:'2026-11-08T01:00:00.000Z',timezone:'America/Chicago',duration:60,participants:['Owner'],invitees:[],cohosts:[shared.member],waiting:[],messages:[],muted:[]}));
  const api=await mount(w,'/html/pages/v3/community/modules/meet/index.html');
  api.window.NEXORA_COMMUNITY_MODULE.navigate('meet',{meetingId:'removed-meeting',meetView:'admin'});
  assert.equal(api.document.querySelector('#pg-admin [data-meet-action="lock"]'),null);
  assert.equal(api.document.querySelector('#pg-admin [data-meet-id="wait"]'),null);
  assert.ok(api.document.querySelector('#pg-admin #meetJoinForm'));
  api.destroy();
});

function connect(t,member,stored={}){
  const w=boot(t,{},member);
  for(const [key,value] of Object.entries(stored))w.localStorage.setItem(key,value);
  const html=new w.DOMParser().parseFromString(read('html/pages/v3/community/nexora-privacy-qr-layout.html'),'text/html');
  w.document.body.innerHTML=html.body.innerHTML;
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.eval(read('html/pages/v3/community/community-group-workflow.js'));
  w.eval(read('html/pages/v3/community/nexora-privacy-interactive.js'));
  w.eval(read('html/pages/v3/community/community-connect-workflow.js'));
  return w;
}
const storage=w=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const key=w.localStorage.key(i);return [key,w.localStorage.getItem(key)];}));

test('v3 direct messages reach the recipient, require acceptance and keep an initiated conversation accepted',t=>{
  const sender=connect(t,'QA Sender');sender.NEXORA_COMMUNITY_SHARED.identity('QA Receiver');
  sender.NEXORA_COMMUNITY_CONNECT.openDirect('QA Receiver');
  assert.equal(sender.NEXORA_CONNECT_CORE.appendChatMessage('source-QA%20Receiver',{text:'Message request'}),true);
  const receiver=connect(t,'QA Receiver',storage(sender));
  receiver.NEXORA_COMMUNITY_CONNECT.openDirect('QA Sender');
  assert.ok(receiver.document.getElementById('detailPanel').textContent.includes('Message request'));
  assert.equal(receiver.document.getElementById('messageText').disabled,true);
  receiver.document.querySelector('[data-source-request-action="accepted"]').click();
  assert.equal(receiver.document.getElementById('messageText').disabled,false);
  assert.equal(receiver.NEXORA_CONNECT_CORE.appendChatMessage('source-QA%20Sender',{text:'Accepted reply'}),true);
  const final=connect(t,'QA Sender',storage(receiver));
  final.NEXORA_COMMUNITY_CONNECT.openDirect('QA Receiver');
  assert.ok(final.document.getElementById('detailPanel').textContent.includes('Accepted reply'));
  assert.equal(final.document.getElementById('messageText').disabled,false);
  assert.equal(final.NEXORA_COMMUNITY_CONNECT.store.read().rooms.length,0,'fresh accounts must not join the sample salon');
});
