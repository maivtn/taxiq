import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const source=()=>readFileSync(new URL('./staff-work-orders.html',import.meta.url),'utf8');
const asset=n=>readFileSync(new URL('../assets/'+n+'.js',import.meta.url),'utf8');
const key='nexora-service-assignments-v1';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function boot({query='',session,fixture,now}={}){
 const errors=[];
 const dom=new JSDOM(source(),{url:'https://demo.test/pages/staff-work-orders.html'+(query ? '?' + query.replace(/^&/, '') : ''),runScripts:'dangerously',beforeParse(w){
   w.scrollTo=()=>{};w.confirm=()=>true;w.addEventListener('error',e=>errors.push(e.message));
   if(now){const DateBase=w.Date;w.Date=class extends DateBase{constructor(...a){super(...(a.length?a:[now]));}static now(){return new DateBase(now).getTime();}};}
   if(session!==undefined)w.NEXORA_STAFF_SESSION=session;
   w.eval(asset('service-assignments'));
   if(fixture){const state=w.NEXORA_SERVICE_ASSIGNMENTS.load();fixture(state);w.localStorage.setItem(key,JSON.stringify(state));}
   w.NEXORA_APPOINTMENT_SERVICE_CATALOG={load:()=>new Promise(()=>{})};
 }});return {dom,w:dom.window,errors};
}
function click(w,s){const el=w.document.querySelector(s);assert.ok(el,`Expected ${s}`);el.click();return el;}

test('My Tickets reuses work orders and opens clocked-in salon with salon-local Today',()=>{
 const {w}=boot({now:'2026-09-16T02:30:00Z'});
 try{assert.equal(w.NEXORA_SHELL.activeTab,'my-tickets');assert.equal(w.document.querySelector('[data-workspace]').hidden,false);assert.equal(w.document.querySelector('.workspace-salon h1').textContent,'My Tickets');assert.equal(w.document.querySelector('[data-date-filter]').value,'2026-09-15');assert.ok(w.document.querySelector('[data-ticket-id="jojo-1"]'));assert.equal(w.document.querySelector('[data-ticket-id="WO-1048"]'),null);}
 finally{w.close();}
});

test('forged actor query and wider filters cannot reveal another technician’s work',()=>{
 const {w}=boot({query:'&technician=huu&ticket=jj-1'});
 try{assert.doesNotMatch(w.document.querySelector('[data-detail-panel]').textContent,/HUU|Paris Pearl/);assert.match(w.document.querySelector('[data-toast-message]').textContent,/unavailable|assigned/i);click(w,'[data-status-filter="all"]');assert.equal(w.document.querySelector('[data-ticket-id="jj-1"]'),null);click(w,'[data-change-salon-inline]');click(w,'[data-select-salon="elite"]');assert.match(w.document.querySelector('[data-orders-list]').textContent,/No work orders/);}
 finally{w.close();}
});

test('own ticket opens existing detail, saves note/location and deletes only its work order',async()=>{
 const {w,errors}=boot();
 try{click(w,'[data-ticket-id="jojo-1"]');await tick();assert.equal(w.document.querySelector('[data-detail-panel] .detail-code').textContent,'jojo-1');click(w,'[data-edit-work-order]');w.document.querySelector('[data-work-order-note]').value='Warm water please';w.document.querySelector('[data-work-order-location]').value='Chair 4';click(w,'[data-save-work-order]');await tick();const line=()=>w.NEXORA_SERVICE_ASSIGNMENTS.load().tickets.find(t=>t.id==='jojo').services[0];assert.equal(line().note,'Warm water please');assert.equal(line().location,'Chair 4');click(w,'[data-delete-work-order]');await tick();assert.equal(w.NEXORA_SERVICE_ASSIGNMENTS.load().tickets.find(t=>t.id==='jojo').services.length,0);assert.match(w.document.querySelector('[data-orders-list]').textContent,/No work orders/);assert.deepEqual(errors,[]);}
 finally{w.close();}
});

test('reassignment closes open edit and clears ticket details before a stale save',async()=>{
 const {w}=boot();
 try{click(w,'[data-ticket-id="jojo-1"]');await tick();click(w,'[data-edit-work-order]');const save=w.document.querySelector('[data-save-work-order]');w.document.querySelector('[data-work-order-note]').value='Stale change';await w.NEXORA_SERVICE_ASSIGNMENTS.assign('jojo-1','lana','','New owner');assert.equal(w.document.querySelector('[data-work-order-edit-modal]').hidden,true);assert.doesNotMatch(w.document.querySelector('[data-detail-panel]').textContent,/Jojo/);save.click();await tick();assert.equal(w.NEXORA_SERVICE_ASSIGNMENTS.load().tickets.find(t=>t.id==='jojo').services[0].note,'New owner');}
 finally{w.close();}
});

test('completed work orders remain view-only and use the existing detail',async()=>{
 const {w}=boot({fixture:s=>{s.tickets.find(t=>t.id==='jojo').services[0].status='completed';}});
 try{click(w,'[data-status-filter="completed"]');click(w,'[data-ticket-id="jojo-1"]');await tick();assert.ok(w.document.querySelector('.completed-note'));assert.equal(w.document.querySelector('[data-edit-work-order]'),null);assert.equal(w.document.querySelector('[data-delete-work-order]'),null);}
 finally{w.close();}
});

test('no active clock-in keeps salon selection open and explains the missing default',()=>{
 const {w}=boot({session:{staff:{id:'kayla'},clockIn:null}});
 try{assert.equal(w.document.querySelector('[data-salon-gate]').hidden,false);assert.match(w.document.querySelector('.wo-description').textContent,/not clocked in/i);click(w,'[data-select-salon="golden"]');assert.ok(w.document.querySelector('[data-ticket-id="jojo-1"]'));}
 finally{w.close();}
});

test('sent ticket follows the reused view, accept, start and complete flow',async()=>{
 const {w,errors}=boot({fixture:s=>{s.tickets.find(t=>t.id==='jojo').services[0].status='sent';}});
 try{click(w,'[data-ticket-id="jojo-1"]');await tick();click(w,'[data-accept-assignment="jojo-1"]');await tick();click(w,'[data-start-ticket="jojo-1"]');await tick();click(w,'[data-complete-ticket="jojo-1"]');w.document.querySelector('[data-complete-notes]').value='Finished as requested';click(w,'[data-confirm-complete]');await tick();assert.equal(w.NEXORA_SERVICE_ASSIGNMENTS.load().tickets.find(t=>t.id==='jojo').services[0].status,'completed');assert.ok(w.document.querySelector('.completed-note'));assert.deepEqual(errors,[]);}
 finally{w.close();}
});

test('an owned deep link in another salon reuses that salon on reload',async()=>{
 const {w}=boot({query:'&assignment=jojo-1',fixture:s=>{s.tickets.find(t=>t.id==='jojo').salonId='elite';}});
 try{await tick();assert.equal(w.document.querySelector('[data-workspace-name]').textContent,'Elite Beauty Lounge');assert.equal(new URL(w.location).searchParams.get('salon'),'elite');assert.equal(w.document.querySelector('.detail-code').textContent,'jojo-1');}
 finally{w.close();}
});
