import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const SOURCE_DIR = new URL('../../../html/pages/', import.meta.url);

const pageUrl='https://example.test/pages/pos-front-desk-tickets.html';
const file=name=>readFileSync(new URL(name, SOURCE_DIR),'utf8');
function boot(records=[],saved={},url=pageUrl){
 const dom=new JSDOM(file('./pos-front-desk-tickets.html'),{url,runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 for(const [key,value] of Object.entries(saved))w.localStorage.setItem(key,value);
 for(const name of ['salon-data','appointment-tickets','appointments-store'])w.eval(file('../assets/'+name+'.js'));
 if(records.length)w.NEXORA_APPOINTMENTS_STORE.ensureSource('checkin-ticket-tests',records);
 for(const name of ['ticket-workspace','pos-front-desk-tickets'])w.eval(file('../assets/'+name+'.js'));
 return dom;
}
function snapshot(w){return Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const k=w.localStorage.key(i);return [k,w.localStorage.getItem(k)];}));}
function member(id,number,options={}){
 const {group='family-example',mode='family',customerName=id,contact={name:'Mai Nguyen',phone:'5551234567'},relationship='Child',lines=[],...rest}=options;
 return {id,customerName,phone:contact.phone,startAt:'2026-09-15T10:00:00',status:'checked-in',tickets:lines,
  metadata:{checkedInAt:'2026-09-15T10:00:00Z',checkIn:{id:group,mode,contact,memberId:id,relationship,ticketNumber:number,smsConsent:true}},...rest};
}
const mani=(id,technicianId='t1')=>({id,serviceId:'mani',serviceName:'Manicure',price:22,technicianId,technicianName:technicianId==='t2'?'Kim':technicianId?'Tina':'Anyone'});
const row=(d,id)=>d.querySelector('[data-action="edit"][data-id="'+id+'"]').closest('tr');
const submit=w=>w.document.querySelector('#ticket-form').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));

test('single check-in keeps its number, repeated service lines and separate technicians across deep-link reload',()=>{
 const dom=boot([member('single-guest',43,{mode:'single',customerName:'Single Guest',lines:[mani('first'),mani('second','t2')]})]),w=dom.window,d=w.document;
 try{
  assert.match(d.querySelector('#ticket-body').textContent,/Single Guest/);
  assert.match(row(d,43).textContent,/#43.*Waiting.*Tina, Kim/);
  assert.equal(row(d,43).querySelectorAll('td:nth-child(6) .chip').length,2);
  assert.equal(d.querySelector('#family-checkin-groups').hidden,true);
  row(d,43).querySelector('[data-action="edit"]').click();
  assert.equal(new URL(w.location.href).searchParams.get('ticketId'),'single-guest');
  assert.equal(d.querySelectorAll('.tw-line').length,2);
  assert.match(d.querySelector('[data-tw-service-line="first"]').textContent,/Tina.*22.00/);
  assert.match(d.querySelector('[data-tw-service-line="second"]').textContent,/Kim.*22.00/);
  const note=d.querySelector('[data-tw-note]');note.value='Retain this guest';note.dispatchEvent(new w.Event('input',{bubbles:true}));
  const restored=boot([],snapshot(w),w.location.href),r=restored.window.document;
  try{
   assert.equal(r.querySelector('[data-tw-note]').value,'Retain this guest');
   assert.equal(r.querySelectorAll('.tw-line').length,2);
   r.querySelector('[data-tw-back]').click();assert.match(row(r,43).textContent,/#43.*Single Guest/);
  }finally{restored.window.close();}
 }finally{w.close();}
});

test('legacy estimate numbers skip check-in numbers regardless of import order',()=>{
 const estimate={id:'legacy-estimate',customerName:'Estimate Guest',phone:'5551112222',status:'checked-in',startAt:'2026-09-15T10:00:00',tickets:[mani('estimate-line')],metadata:{estimate:{totalCents:2200}}};
 for(const records of [[estimate,member('reserved-guest',10)], [member('reserved-guest',10),estimate]]){
  const dom=boot(records),d=dom.window.document;
  try{
   assert.match(row(d,10).textContent,/reserved-guest/);
   const estimateRow=Array.from(d.querySelectorAll('#ticket-body tr')).find(r=>r.textContent.includes('Estimate Guest'));
   assert.equal(estimateRow.querySelector('.ticket-number').textContent,'#11');
   const numbers=Array.from(d.querySelectorAll('.ticket-number'),n=>n.textContent);assert.equal(new Set(numbers).size,numbers.length);
  }finally{dom.window.close();}
 }
});

test('family summary keeps each member independent and tracks paid and cancelled members after reload',()=>{
 const dom=boot([member('parent-ticket',51,{customerName:'Mai Nguyen',relationship:'Self',lines:[mani('parent-service')]}),member('child-ticket',52,{customerName:'Amy Nguyen'})]),w=dom.window,d=w.document;
 try{
  const summary=d.querySelector('#family-checkin-groups');
  assert.ok(summary,'Family check-ins have a summary');
  assert.match(summary.textContent,/Mai Nguyen.*5551234567/);
  assert.match(summary.textContent,/FG-0051/);assert.match(summary.textContent,/2 member tickets/);
  assert.match(row(d,51).textContent,/Family.*Mai Nguyen/);assert.match(row(d,52).textContent,/NEEDS SERVICE/);
  row(d,51).querySelector('[data-action="start"]').click();
  assert.match(row(d,52).textContent,/Waiting/);
  row(d,51).querySelector('[data-action="checkout"]').click();
  d.querySelector('[data-tw-action="complete"]').click();
  d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();d.querySelector('[data-tw-complete-checkout]').click();
  assert.match(summary.textContent,/1\/2 paid/);assert.match(summary.textContent,/Mai Nguyen.*Paid/);
  assert.equal(d.querySelector('[data-action="edit"][data-id="51"]'),null);
  row(d,52).querySelector('[data-action="cancel"]').click();submit(w);
  assert.match(summary.textContent,/1 cancelled/);assert.match(summary.textContent,/Amy Nguyen.*Cancelled/);
  assert.equal(summary.querySelector('[data-family-ticket="child-ticket"]'),null);
  const restored=boot([],snapshot(w)),r=restored.window.document;
  try{
   assert.match(r.querySelector('#family-checkin-groups').textContent,/1\/2 paid.*1 cancelled/);
   r.querySelector('[data-family-ticket="parent-ticket"]').click();
   assert.equal(new URL(restored.window.location.href).searchParams.get('ticketId'),'parent-ticket');
   assert.equal(new URL(restored.window.location.href).searchParams.get('mode'),'checkout');
   assert.match(r.querySelector('#ticket-workspace').textContent,/Mai Nguyen/);
   assert.ok(r.querySelector('[data-tw-complete-checkout]'));
  }finally{restored.window.close();}
 }finally{w.close();}
});

test('partial technician choices leave unassigned lines waiting and allow catalog technicians to finish their lines',()=>{
 const dom=boot([member('partial-guest',60,{mode:'single',lines:[mani('assigned'),mani('waiting',null)]})]),d=dom.window.document;
 try{
  assert.match(d.querySelector('#ticket-body').textContent,/partial-guest/);
  assert.match(row(d,60).textContent,/NEEDS TECHNICIAN/);
  row(d,60).querySelector('[data-action="start"]').click();row(d,60).querySelector('[data-action="edit"]').click();
  assert.match(d.querySelector('[data-tw-service-line="assigned"]').textContent,/IN PROGRESS/);
  assert.match(d.querySelector('[data-tw-service-line="waiting"]').textContent,/UNASSIGNED/);
  d.querySelector('[data-tw-service-line="waiting"] [data-tw-action="tech"]').click();
  assert.ok(d.querySelector('[name="tech"] option[value="Kim"]')||Array.from(d.querySelectorAll('[name="tech"] option')).some(o=>o.value==='Kim'));
 }finally{dom.window.close();}
});

test('check-in names, contact, relationship and group IDs are escaped in queue and summary',()=>{
 const attack='<img src=x onerror=alert(1)>',dom=boot([member('safe-record',71,{group:attack,customerName:attack,contact:{name:attack,phone:'5551234567'},relationship:attack})]),d=dom.window.document;
 try{
  assert.match(d.querySelector('#ticket-body').textContent,/<img/);
  assert.ok(d.querySelector('#family-checkin-groups').textContent.includes(attack));
  assert.equal(d.querySelector('#ticket-body img'),null);assert.equal(d.querySelector('#family-checkin-groups img'),null);
  d.querySelector('[data-family-ticket="safe-record"]').click();
  assert.equal(new URL(dom.window.location.href).searchParams.get('ticketId'),'safe-record');
  assert.equal(d.querySelector('#ticket-workspace img'),null);
 }finally{dom.window.close();}
});

test('unknown-price check-in services require a price in the existing workspace',()=>{
 const dom=boot([member('consultation-guest',72,{mode:'single',lines:[{id:'custom-line',serviceName:'Custom consultation',price:null}]})]),d=dom.window.document;
 try{
  assert.match(d.querySelector('#ticket-body').textContent,/consultation-guest/);
  row(d,72).querySelector('[data-action="edit"]').click();
  assert.match(d.querySelector('[data-tw-service-line="custom-line"]').textContent,/Price required/);
  assert.ok(d.querySelector('[data-tw-action="price"]'));
 }finally{dom.window.close();}
});
