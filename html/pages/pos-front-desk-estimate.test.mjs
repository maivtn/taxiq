import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
function boot(query='?tab=estimate'){
 const dom=new JSDOM(readFileSync(new URL('./pos-front-desk.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk.html'+query,runScripts:'outside-only'}),w=dom.window;
 w.structuredClone=structuredClone;w.matchMedia=()=>({matches:false});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 for(const name of ['salon-data','appointment-tickets','appointments-store','pos-turn-settings','team-calendar-content','pos-front-desk','service-assignments','front-desk-assignments','pos-estimate','front-desk-estimate']){
  const file=new URL('../assets/'+name+'.js',import.meta.url);if(existsSync(file))w.eval(readFileSync(file,'utf8'));
 }
 return dom;
}
test('Front Desk opens Estimate directly and keeps selections across tabs',()=>{
 const dom=boot(),d=dom.window.document;
 assert.ok(d.querySelector('[data-front-section="estimate"]'),'Estimate tab exists on Front Desk');
 assert.equal(d.querySelector('#front-desk-estimate').hidden,false);assert.equal(d.querySelector('#appointments').hidden,true);
 d.querySelector('[data-est-add="mani"]').click();
 d.querySelector('[data-front-section="appointments"]').click();assert.equal(d.querySelector('#front-desk-estimate').hidden,true);
 d.querySelector('[data-front-section="estimate"]').click();assert.match(d.querySelector('[data-est-total]').textContent,/22.00/);
 dom.window.close();
});
test('Front Desk estimate checks in selected services with quote stored',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 assert.ok(d.querySelector('[data-est-add="mani"]'),'Estimate services are available');
 d.querySelector('[data-est-add="mani"]').click();d.querySelector('[data-est-add="pedi"]').click();d.querySelector('[data-est-preset="20"]').click();d.querySelector('[data-est-checkin]').click();
 d.querySelector('.estimate-dialog [name="customerName"]').value='Quote Guest';d.querySelector('.estimate-dialog [name="phone"]').value='5551234567';d.querySelector('.estimate-dialog form').dispatchEvent(new w.Event('submit',{cancelable:true}));
 const record=w.NEXORA_APPOINTMENTS_STORE.loadAll().find(r=>r.customerName==='Quote Guest');
 assert.equal(record.status,'checked-in');assert.equal(record.tickets.length,2);assert.equal(record.metadata.estimate.totalCents,4160);
 assert.match(d.querySelector('#feedback').textContent,/checked in/);
 dom.window.close();
});
test('Front Desk Tickets shows guests checked in from Estimate',()=>{
 const dom=boot(),w=dom.window;
 w.NEXORA_APPOINTMENTS_STORE.create({id:'estimate-queue',customerName:'Quote Queue Guest',phone:'5551112222',serviceIds:['mani','pedi'],status:'checked-in',metadata:{estimate:{totalCents:4160}},note:'Estimated service total: $41.60'});
 const queue=new JSDOM(readFileSync(new URL('./pos-front-desk-tickets.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk-tickets.html',runScripts:'outside-only'});
 for(let i=0;i<w.localStorage.length;i++){const key=w.localStorage.key(i);queue.window.localStorage.setItem(key,w.localStorage.getItem(key));}
 for(const name of ['salon-data','appointment-tickets','appointments-store','pos-front-desk-tickets'])queue.window.eval(readFileSync(new URL('../assets/'+name+'.js',import.meta.url),'utf8'));
 assert.match(queue.window.document.querySelector('#ticket-body').textContent,/Quote Queue Guest/);
 assert.match(queue.window.document.querySelector('#ticket-body').textContent,/41.60/);
 queue.window.close();dom.window.close();
});
