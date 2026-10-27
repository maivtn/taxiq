import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';

const require=createRequire(import.meta.url);
const data=require('../../../html/assets/vlinkpay-campaigns-data.js');
const page=new URL('../../../html/pages/vlinkpay-campaigns.html',import.meta.url);
const asset=name=>new URL('../../../html/assets/'+name,import.meta.url);
function lockManager(){const pending=new Map();return {requests:[],request(name,options,callback){this.requests.push({name,mode:options.mode});const work=(pending.get(name)||Promise.resolve()).then(callback);pending.set(name,work.catch(()=>{}));return work;}};}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function boot(query='',saved={},environment={}){
  const dom=new JSDOM(readFileSync(page,'utf8'),{url:'https://example.test/pages/vlinkpay-campaigns.html'+query,runScripts:'outside-only'}),w=dom.window;
  Object.defineProperty(w.navigator,'locks',{value:environment.locks||lockManager()});
  if(environment.storage)Object.defineProperty(w,'localStorage',{value:environment.storage});
  if(environment.timers){w.setTimeout=callback=>environment.timers.push(callback);w.clearTimeout=id=>{environment.timers[id-1]=null;};}
  w.matchMedia=()=>({matches:true});w.lucide={createIcons(){}};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.QRCode=function(node,options){node.dataset.value=options.text;const img=w.document.createElement('img');img.alt='QR Code';node.append(img);};w.QRCode.CorrectLevel={M:0};
  Object.entries(saved).forEach(([key,value])=>w.localStorage.setItem(key,value));
  for(const name of ['vlinkpay-campaigns-data.js','vlinkpay-campaigns.js'])w.eval(readFileSync(asset(name),'utf8'));
  return dom;
}
function input(w,selector,value,type='input'){const el=w.document.querySelector(selector);el.value=value;el.dispatchEvent(new w.Event(type,{bubbles:true}));return el;}
const click=(w,selector)=>w.document.querySelector(selector).click();
const snapshot=w=>Object.fromEntries(Object.keys(w.localStorage).map(key=>[key,w.localStorage.getItem(key)]));

test('campaign list filters and paginates local campaigns without changing operational storage',()=>{
  const rows=Array.from({length:23},(_,index)=>({...data.seed()[0],id:'DEMO-'+index,name:'Campaign '+index,status:index%2?'Inactive':'Active'}));
  const unrelated={'nexora:direct-checkouts:v1':'[{"id":"keep"}]','nexora:salon-data:v1:bitcoin-nail-bar-houston':'{"keep":true}'};
  const dom=boot('',{...unrelated,[data.STORAGE_KEY]:JSON.stringify(rows)}),w=dom.window,d=w.document;
  try{
    assert.equal(d.querySelectorAll('[data-vlc-list-rows] tr').length,10);
    click(w,'[data-vlc-action="page"][data-page="2"]');assert.match(d.querySelector('[data-vlc-list-rows]').textContent,/Campaign 10/);
    input(w,'[data-vlc-field="status"]','Inactive','change');assert.equal(d.querySelectorAll('[data-vlc-list-rows] tr').length,10);
    input(w,'[data-vlc-field="search"]','Campaign 21');assert.equal(d.querySelectorAll('[data-vlc-list-rows] tr').length,1);assert.match(d.querySelector('[data-vlc-list-rows]').textContent,/Campaign 21/);
    for(const [key,value] of Object.entries(unrelated))assert.equal(w.localStorage.getItem(key),value);
  }finally{w.close();}
});

test('create query opens an unsaved source form; resizing preserves prize names and prevents invalid percentages',()=>{
  const dom=boot('?view=create'),w=dom.window,d=w.document;
  try{
    assert.ok(d.querySelector('#vlc-campaign-form'));assert.equal(w.localStorage.length,0);
    assert.equal(d.querySelectorAll('[data-vlc-prize="name"]').length,8);
    input(w,'[data-vlc-prize="name"][data-index="0"]','Manicure');
    input(w,'[data-vlc-draft="count"]','3','change');
    assert.equal(d.querySelector('[data-vlc-prize="name"][data-index="0"]').value,'Manicure');
    assert.equal(d.querySelectorAll('[data-vlc-prize="name"]').length,3);
    assert.equal(d.querySelector('[data-vlc-save]').disabled,false);
    input(w,'[data-vlc-prize="percent"][data-index="0"]','10');assert.equal(d.querySelector('[data-vlc-save]').disabled,true);
    d.querySelector('[data-vlc-draft="random"]').click();assert.equal(d.querySelector('[data-vlc-save]').disabled,false);assert.equal(d.querySelector('[data-vlc-prize="percent"]').disabled,true);
    assert.equal(w.localStorage.length,0);
  }finally{w.close();}
});

test('saving a campaign persists only its local store; edit cancel preserves the saved record',async()=>{
  const dom=boot('?view=create',{'unrelated-record':'preserve'}),w=dom.window,d=w.document;
  try{
    input(w,'[data-vlc-draft="name"]','Local campaign');
    [...d.querySelectorAll('[data-vlc-prize="name"]')].forEach((field,index)=>input(w,`[data-vlc-prize="name"][data-index="${index}"]`,'Prize '+(index+1)));
    d.querySelector('#vlc-campaign-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await settle();
    const saved=JSON.parse(w.localStorage.getItem(data.STORAGE_KEY));assert.equal(saved.length,3);assert.equal(saved[0].name,'Local campaign');assert.equal(w.localStorage.getItem('unrelated-record'),'preserve');
    const before=JSON.stringify(saved[0]);click(w,'[data-vlc-action="edit"]');input(w,'[data-vlc-draft="name"]','Uncommitted');click(w,'[data-vlc-action="cancel"]');assert.equal(JSON.stringify(JSON.parse(w.localStorage.getItem(data.STORAGE_KEY))[0]),before);
    const restored=boot('',snapshot(w));try{assert.match(restored.window.document.querySelector('[data-vlc-list-rows]').textContent,/Local campaign/);}finally{restored.window.close();}
  }finally{w.close();}
});

test('share QR and link stay on the local prototype and do not reuse a merchant referral URL',()=>{
  const dom=boot(),w=dom.window,d=w.document;
  try{
    click(w,'[data-vlc-action="share"]');const link=d.querySelector('[data-vlc-share-link]');
    assert.equal(new URL(link.href).origin,'https://example.test');assert.match(link.href,/view=play/);assert.match(link.href,/campaignId=DEMO-CAMPAIGN-001/);assert.doesNotMatch(link.href,/referralCode|staging-/);
    assert.equal(d.querySelector('[data-vlc-qr]').dataset.value,link.href);assert.equal(d.querySelector('[data-vlc-share]').open,true);
    assert.equal(w.localStorage.length,0);
  }finally{w.close();}
});

test('spin selection respects weights, exhausted quantities, inactive campaigns, and the configured date range',()=>{
  const campaign=data.seed()[0];campaign.prizes=data.resize([],2).map((prize,index)=>({...prize,name:'Prize '+(index+1),percent:index?75:25,quantity:1}));
  const now=new Date(2026,9,27,12);
  const first=data.spin(campaign,()=>0,now);assert.equal(first.index,0);assert.equal(first.campaign.prizes[0].quantity,0);assert.equal(first.campaign.spins,1);assert.equal(first.campaign.winners[0].status,'Pending');assert.equal(campaign.prizes[0].quantity,1);
  assert.equal(data.choosePrize(first.campaign,()=>0),1);assert.equal(data.choosePrize(campaign,()=>0.26),1);
  const noPrize=data.clone(campaign);noPrize.prizes.forEach(prize=>prize.quantity=0);noPrize.prizes[1].noPrize=true;
  const miss=data.spin(noPrize,()=>0,now);assert.equal(miss.campaign.spins,1);assert.equal(miss.campaign.winners.length,0);
  assert.equal(data.spin({...campaign,status:'Inactive'},()=>0,now),null);
  assert.equal(data.spin({...campaign,timeRange:true,start:'2026-10-28',end:'2026-11-01'},()=>0,now),null);
  assert.equal(data.spin({...campaign,timeRange:true,start:'2026-10-01',end:'2026-10-27'},()=>0,now).index,0);
});

test('campaign shorthand opens observed detail and winner filters without leaving the local page',()=>{
  const campaign=data.seed()[0],result=data.spin(campaign,()=>0,new Date(2026,9,27,12),'guest@example.test');
  const dom=boot('?campaign='+campaign.id,{[data.STORAGE_KEY]:JSON.stringify([result.campaign])}),w=dom.window,d=w.document;
  try{
    assert.match(d.querySelector('[data-vlc-content]').textContent,/Total Spins/);assert.equal(d.querySelectorAll('[data-vlc-winner-rows] tr').length,1);
    assert.match(d.querySelector('[data-vlc-winner-rows]').textContent,/Oct 27, 2026/);assert.match(d.querySelector('[data-vlc-winner-rows]').textContent,/guest@example.test/);
    input(w,'[data-vlc-field="winner-status"]','Claimed','change');assert.match(d.querySelector('[data-vlc-winner-rows]').textContent,/No winners found for this campaign yet/);
    assert.equal(new URL(w.location.href).origin,'https://example.test');
  }finally{w.close();}
});

function sharedState(campaign){
  const values=new Map([[data.STORAGE_KEY,JSON.stringify([campaign])]]),locks=lockManager();
  return {values,locks,timers:[],storage:{getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)},read(){return JSON.parse(values.get(data.STORAGE_KEY))[0];}};
}
function submit(w){w.document.querySelector('#vlc-campaign-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
function flushAnimation(environment){environment.timers.splice(0).forEach(callback=>callback?.());}
function lastPrize(){const campaign=data.seed()[0];campaign.prizes=data.resize([],2).map((prize,index)=>({...prize,name:'Prize '+(index+1),quantity:index?0:1,percent:index?0:100,noPrize:false}));return campaign;}

test('two tabs serialize last-prize spins before animation and preserve one winner without later writes',async()=>{
  const environment=sharedState(lastPrize()),first=boot('',{},environment),second=boot('',{},environment),a=first.window,b=second.window;
  try{
    click(a,'[data-vlc-action="play"]');click(b,'[data-vlc-action="play"]');
    click(a,'[data-vlc-action="spin"]');click(b,'[data-vlc-action="spin"]');await settle();
    const committed=environment.read();assert.equal(committed.spins,1);assert.equal(committed.winners.length,1);assert.equal(committed.prizes[0].quantity,0);
    assert.equal(a.document.querySelector('[data-vlc-result]').textContent,'');assert.equal(b.document.querySelector('[data-vlc-result]').textContent,'');
    const beforeAnimation=environment.values.get(data.STORAGE_KEY);flushAnimation(environment);
    assert.equal(a.document.querySelector('[data-vlc-result]').textContent,'Prize 1');assert.equal(b.document.querySelector('[data-vlc-result]').textContent,'');assert.equal(environment.values.get(data.STORAGE_KEY),beforeAnimation);
    assert.equal(environment.locks.requests.length,2);assert.ok(environment.locks.requests.every(request=>request.name===data.STORAGE_KEY&&request.mode==='exclusive'));
  }finally{a.close();b.close();}
});

test('saving an old edit retains concurrent spin history and consumed inventory, including edits during animation',async()=>{
  const campaign=lastPrize();campaign.prizes[0].quantity=10;const environment=sharedState(campaign),editor=boot('?view=edit&campaignId='+campaign.id,{},environment),player=boot('',{},environment),e=editor.window,p=player.window;
  try{
    input(e,'[data-vlc-draft="name"]','Renamed campaign');click(p,'[data-vlc-action="play"]');click(p,'[data-vlc-action="spin"]');await settle();
    assert.equal(environment.read().spins,1);submit(e);await settle();
    const merged=environment.read();assert.equal(merged.name,'Renamed campaign');assert.equal(merged.spins,1);assert.equal(merged.winners.length,1);assert.equal(merged.prizes[0].quantity,9);
    const committed=environment.values.get(data.STORAGE_KEY);flushAnimation(environment);assert.equal(environment.values.get(data.STORAGE_KEY),committed);
  }finally{e.close();p.close();}
});

test('an intentional Quantity edit adjusts latest stock without restoring a unit consumed by another tab',async()=>{
  const campaign=lastPrize();campaign.prizes[0].quantity=10;const environment=sharedState(campaign),editor=boot('?view=edit&campaignId='+campaign.id,{},environment),player=boot('',{},environment),e=editor.window,p=player.window;
  try{
    input(e,'[data-vlc-prize="quantity"][data-index="0"]','20');click(p,'[data-vlc-action="play"]');click(p,'[data-vlc-action="spin"]');await settle();submit(e);await settle();
    assert.equal(environment.read().prizes[0].quantity,19);assert.equal(environment.read().spins,1);assert.equal(environment.read().winners.length,1);
  }finally{e.close();p.close();}
});

test('independent stale config fields merge, conflicting edits retain the draft and offer source Edit Campaign action',async()=>{
  const campaign=lastPrize(),environment=sharedState(campaign),first=boot('?view=edit&campaignId='+campaign.id,{},environment),second=boot('?view=edit&campaignId='+campaign.id,{},environment),a=first.window,b=second.window;
  try{
    input(a,'[data-vlc-draft="name"]','First name');input(b,'[data-vlc-draft="status"]','Inactive','change');submit(a);await settle();submit(b);await settle();
    assert.equal(environment.read().name,'First name');assert.equal(environment.read().status,'Inactive');
  }finally{a.close();b.close();}
  const left=boot('?view=edit&campaignId='+campaign.id,{},environment),right=boot('?view=edit&campaignId='+campaign.id,{},environment),l=left.window,r=right.window;
  try{
    input(l,'[data-vlc-draft="name"]','Saved name');input(r,'[data-vlc-draft="name"]','Kept draft');submit(l);await settle();submit(r);await settle();
    assert.equal(environment.read().name,'Saved name');assert.equal(r.document.querySelector('[data-vlc-draft="name"]').value,'Kept draft');
    assert.equal(r.document.querySelector('[data-vlc-draft="name"]').validationMessage,'Edit Campaign');assert.equal(r.document.querySelector('[data-vlc-action="reopen"]').hidden,false);
    click(r,'[data-vlc-action="reopen"]');assert.equal(r.document.querySelector('[data-vlc-draft="name"]').value,'Saved name');
  }finally{l.close();r.close();}
});

test('storage failure never announces a prize or changes inventory, and keeps an unsaved edit visible',async()=>{
  const campaign=lastPrize(),environment=sharedState(campaign);environment.storage.setItem=()=>{throw new Error('Quota exceeded');};const player=boot('',{},environment),editor=boot('?view=edit&campaignId='+campaign.id,{},environment),p=player.window,e=editor.window;
  try{
    const before=environment.values.get(data.STORAGE_KEY);click(p,'[data-vlc-action="play"]');click(p,'[data-vlc-action="spin"]');await settle();flushAnimation(environment);
    assert.equal(environment.values.get(data.STORAGE_KEY),before);assert.equal(environment.read().prizes[0].quantity,1);assert.equal(environment.read().winners.length,0);assert.equal(p.document.querySelector('[data-vlc-result]').textContent,'Quota exceeded');
    input(e,'[data-vlc-draft="name"]','Unsaved name');submit(e);await settle();assert.equal(e.document.querySelector('[data-vlc-draft="name"]').value,'Unsaved name');assert.equal(e.document.querySelector('[data-vlc-upload-error]').textContent,'Quota exceeded');assert.equal(environment.values.get(data.STORAGE_KEY),before);
  }finally{p.close();e.close();}
});


test('an already open game revalidates status changed by another tab before committing a spin',async()=>{
  const campaign=lastPrize(),environment=sharedState(campaign),editor=boot('?view=edit&campaignId='+campaign.id,{},environment),player=boot('',{},environment),e=editor.window,p=player.window;
  try{
    click(p,'[data-vlc-action="play"]');input(e,'[data-vlc-draft="status"]','Inactive','change');submit(e);await settle();
    const before=environment.values.get(data.STORAGE_KEY);click(p,'[data-vlc-action="spin"]');await settle();flushAnimation(environment);
    assert.equal(environment.values.get(data.STORAGE_KEY),before);assert.equal(environment.read().status,'Inactive');assert.equal(environment.read().spins,0);assert.equal(environment.read().winners.length,0);assert.equal(p.document.querySelector('[data-vlc-result]').textContent,'');assert.equal(p.document.querySelector('[data-vlc-action="spin"]').disabled,true);
  }finally{e.close();p.close();}
});
