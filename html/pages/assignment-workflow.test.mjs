import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const asset=name=>new URL('../assets/'+name+'.js',import.meta.url);
function boot(){
 const dom=new JSDOM('',{url:'https://demo.test',runScripts:'outside-only'});
 assert.ok(existsSync(asset('service-assignments')), 'Shared service assignment workflow must exist');
 dom.window.eval(readFileSync(asset('service-assignments'),'utf8'));
 return dom;
}
test('service delivery requires view, accept, start and complete; completion releases only the finished technician',async()=>{
 const dom=boot(),s=dom.window.NEXORA_SERVICE_ASSIGNMENTS;
 await s.assign('brian-1','kayla','Chair #4','Private note');
 await s.assign('brian-2','lana','','');
 await s.send('brian');
 const line=()=>s.load().tickets.find(t=>t.id==='brian').services[0];
 assert.equal(line().status,'sent');
 assert.equal(s.inbox('kayla').length,1);
 assert.equal(s.queue().some(t=>t.id==='kayla'),false);
 await assert.rejects(s.transition('brian-1','kayla','start'),/Accept/);
 await assert.rejects(s.transition('brian-1','lana','view'),/assigned technician/);
 await s.transition('brian-1','kayla','view');
 const viewedAt=line().viewedAt;
 await s.resend('brian-1');
 assert.equal(s.inbox('kayla').length,1);
 assert.equal(line().viewedAt,viewedAt);
 await s.transition('brian-1','kayla','accept');
 await s.transition('brian-1','kayla','start');
 await s.transition('brian-1','kayla','complete','Done');
 await s.transition('brian-1','kayla','complete','Done');
 assert.equal(s.load().turnEntries.filter(e=>e.serviceId==='brian-1').length,1);
 assert.ok(s.queue().some(t=>t.id==='kayla'));
 assert.equal(s.queue().some(t=>t.id==='lana'),false);
 assert.equal(s.ticketStatus(s.load().tickets.find(t=>t.id==='brian')),'Partially completed');
 dom.window.close();
});
test('multiple services keep the same technician reserved until all complete; reload keeps state',async()=>{
 const dom=boot(),s=dom.window.NEXORA_SERVICE_ASSIGNMENTS;
 await s.assign('brian-1','kayla','','');await s.assign('brian-2','kayla','','');await s.send('brian');
 for(const action of ['view','accept','start','complete']) await s.transition('brian-1','kayla',action,'Done');
 assert.equal(s.queue().some(t=>t.id==='kayla'),false);
 for(const action of ['view','accept','start','complete']) await s.transition('brian-2','kayla',action,'Done');
 assert.ok(s.queue().some(t=>t.id==='kayla'));
 dom.window.eval(readFileSync(asset('service-assignments'),'utf8'));
 assert.equal(dom.window.NEXORA_SERVICE_ASSIGNMENTS.load().turnEntries.length,2);
 dom.window.close();
});
test('reassignment invalidates old notification and failed storage writes do not claim success',async()=>{
 const dom=boot(),s=dom.window.NEXORA_SERVICE_ASSIGNMENTS;
 await s.send('jojo');
 await s.assign('jojo-1','lana','','');
 assert.equal(s.inbox('kayla').length,0);
 await assert.rejects(s.transition('jojo-1','kayla','view'),/assigned technician/);
 dom.window.Storage.prototype.setItem=()=>{throw new Error('Storage full');};
 await assert.rejects(s.send('jojo'),/save/);
 assert.equal(s.load().tickets.find(t=>t.id==='jojo').services[0].status,'not-sent');
 dom.window.close();
});
const storeSource=()=>readFileSync(asset('service-assignments'),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function sync(from,to){
 const key='nexora-service-assignments-v1';
 to.localStorage.setItem(key,from.localStorage.getItem(key));
 to.dispatchEvent(new to.StorageEvent('storage',{key}));
}
test('Front Desk sends a service and Work Orders opens, accepts, starts, completes and synchronizes progress',async()=>{
 const fd=new JSDOM(readFileSync(new URL('./pos-front-desk.html',import.meta.url),'utf8'),{url:'https://demo.test/pages/pos-front-desk.html?section=assign&ticket=jojo&view=table',runScripts:'outside-only'});
 const fw=fd.window;fw.eval(storeSource());fw.eval(readFileSync(asset('front-desk-assignments'),'utf8'));
 assert.equal(fw.document.querySelector('#service-assignments').hidden,false,'Assignment section takes precedence over appointment view parameter');
 fw.document.querySelector('[data-send-assignments]').click();await tick();
 assert.match(fw.document.querySelector('[data-assignment-detail]').textContent,/Sent/);
 const errors=[];
 const staff=new JSDOM(readFileSync(new URL('./staff-work-orders.html',import.meta.url),'utf8'),{url:'https://demo.test/pages/staff-work-orders.html?technician=kayla',runScripts:'dangerously',beforeParse(w){
  w.scrollTo=()=>{};
  w.addEventListener('error',e=>errors.push(e.message));
  w.localStorage.setItem('nexora-service-assignments-v1',fw.localStorage.getItem('nexora-service-assignments-v1'));
  w.eval(storeSource());
  w.NEXORA_APPOINTMENT_SERVICE_CATALOG={load:()=>new Promise(()=>{})};
 }});
 try{
 const sw=staff.window,d=sw.document;
 assert.equal(d.querySelector('[data-assignment-inbox]'),null);
 assert.equal(sw.NEXORA_SERVICE_ASSIGNMENTS.inbox('kayla')[0].line.status,'sent','automatic detail rendering must not mark viewed');
 d.querySelector('[data-ticket-id="jojo-1"]').click();await tick();
 assert.equal(sw.NEXORA_SERVICE_ASSIGNMENTS.inbox('kayla')[0].line.status,'viewed');
 assert.ok(d.querySelector('[data-accept-assignment="jojo-1"]'));
 assert.equal(d.querySelector('[data-start-ticket="jojo-1"]'),null);
 d.querySelector('[data-accept-assignment="jojo-1"]').click();await tick();
 d.querySelector('[data-start-ticket="jojo-1"]').click();await tick();
 d.querySelector('button[data-complete-ticket="jojo-1"]').click();
 d.querySelector('[data-complete-notes]').value='Finished as requested';
 d.querySelector('[data-confirm-complete]').click();await tick();
 sync(sw,fw);
 assert.match(fw.document.querySelector('[data-assignment-detail]').textContent,/Completed/);
 assert.ok(sw.NEXORA_SERVICE_ASSIGNMENTS.queue().some(tech=>tech.id==='kayla'));
 assert.equal(sw.NEXORA_SERVICE_ASSIGNMENTS.load().turnEntries.length,1);
 assert.deepEqual(errors,[]);
 }finally{staff.window.close();fd.window.close();}
});
test('assignment and checkout have independent reloadable ticket URLs and link back to the original Tickets page',()=>{
 const html=readFileSync(new URL('./pos-front-desk.html',import.meta.url),'utf8');
 const dom=new JSDOM(html,{url:'https://demo.test/pages/pos-front-desk.html?section=assign&ticket=brian&source=test',runScripts:'outside-only'});
 const w=dom.window;w.eval(storeSource());w.eval(readFileSync(asset('front-desk-assignments'),'utf8'));
 assert.equal(new URL(w.location).searchParams.get('ticket'),'brian');
 assert.equal(new URL(w.location).searchParams.get('section'),'assign');
 assert.ok(w.document.querySelector('[data-service-catalog]'));
 w.document.querySelector('[data-open-checkout]').click();
 assert.equal(new URL(w.location).searchParams.get('section'),'checkout');
 assert.ok(w.document.querySelector('[data-demo-pay]'));
 assert.equal(w.document.querySelector('[data-demo-pay]').disabled,true);
 w.history.replaceState(null,'','?section=assign&ticket=jojo&source=test');w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.match(w.document.querySelector('[data-assignment-detail]').textContent,/Jojo/);
 assert.equal(new URL(w.document.querySelector('[data-assignment-back]').href).pathname,'/pages/pos-front-desk-tickets.html');
 dom.window.close();
});
test('demo checkout waits for completed services and records one payment without another turn',async()=>{
 const dom=boot(),s=dom.window.NEXORA_SERVICE_ASSIGNMENTS;
 assert.equal(typeof s.pay,'function');
 await assert.rejects(s.pay('jojo',{tip:0,method:'cash',cash:100}),/Complete/);
 await s.send('jojo');for(const action of ['view','accept','start','complete'])await s.transition('jojo-1','kayla',action,'Done');
 await s.pay('jojo',{tip:10,method:'cash',cash:100,receipt:'none'});
 await s.pay('jojo',{tip:10,method:'cash',cash:100,receipt:'none'});
 const t=s.load().tickets.find(t=>t.id==='jojo');assert.equal(t.payment.total,62);assert.equal(t.payment.change,38);assert.equal(s.load().turnEntries.length,1);
 dom.window.close();
});

test('Work Orders keeps usable demo tickets when assignment storage loads and refreshes',()=>{
 const errors=[];
 const dom=new JSDOM(readFileSync(new URL('./staff-work-orders.html',import.meta.url),'utf8'),{
  url:'https://demo.test/pages/staff-work-orders.html',runScripts:'dangerously',beforeParse(w){
   w.scrollTo=()=>{};
   w.addEventListener('error',e=>errors.push(e.message));
   w.eval(storeSource());
   w.NEXORA_APPOINTMENT_SERVICE_CATALOG={load:()=>new Promise(()=>{})};
  }
 });
 try{
  const w=dom.window,d=w.document;
  assert.equal(d.querySelector('[data-workspace]').hidden,false);
  assert.equal(d.querySelector('[data-status-count="assigned"]').textContent,'2');
  assert.equal(d.querySelector('[data-status-count="in-service"]').textContent,'1');
  assert.equal(d.querySelector('[data-status-count="completed"]').textContent,'1');
  d.querySelector('[data-ticket-id="WO-1051"]').click();
  assert.equal(d.querySelector('[data-start-ticket="WO-1051"]'),null);
  const accept=d.querySelector('[data-accept-assignment="WO-1051"]');
  assert.ok(accept,'Demo ticket must be accepted before starting');
  accept.click();
  assert.match(d.querySelector('[data-detail-panel] .status-pill').textContent,/Accepted/);
  d.querySelector('[data-start-ticket="WO-1051"]').click();
  const state=w.NEXORA_SERVICE_ASSIGNMENTS.load();
  state.revision=(state.revision||0)+1;
  w.localStorage.setItem('nexora-service-assignments-v1',JSON.stringify(state));
  w.dispatchEvent(new w.Event('focus'));
  assert.equal(d.querySelector('[data-status-count="assigned"]').textContent,'1');
  assert.equal(d.querySelector('[data-status-count="in-service"]').textContent,'2');
  assert.equal(d.querySelector('[data-assignment-inbox]'),null);
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
