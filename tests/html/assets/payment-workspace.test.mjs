import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';

const require=createRequire(import.meta.url);
const model=require(new URL('../../../html/assets/payment-workspace-core.js',import.meta.url).pathname);
const coreSource=readFileSync(new URL('../../../html/assets/payment-workspace-core.js',import.meta.url),'utf8');
const uiSource=readFileSync(new URL('../../../html/assets/payment-workspace.js',import.meta.url),'utf8');
const KEY='nexora-merchant-payments-demo-v1';
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=';

function boot(t,{view='activity',seed,before}={}) {
  const dom=new JSDOM('<!doctype html><body data-payment-view="'+view+'"><main id="payment-main"></main><dialog id="payment-dialog"></dialog></body>',{url:'https://demo.test/html/pages/'+(view==='payouts'?'staff-payouts.html':view==='categories'?'payment-categories.html':'payment-activity.html'),runScripts:'outside-only'});
  const w=dom.window;t.after(()=>w.close());
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  if(seed)w.localStorage.setItem(KEY,JSON.stringify(seed));
  before?.(w);w.eval(coreSource);w.eval(uiSource);return w;
}
function click(w,selector) {const el=w.document.querySelector(selector);assert.ok(el,selector);el.click();return el;}
function stored(w) {return JSON.parse(w.localStorage.getItem(KEY)||'null');}
function payoutFields(w) {
  click(w,'[data-action="create-payout"]');
  w.document.querySelector('[name="payout-staff"]').value='nexora_02';
  w.document.querySelector('[name="amount"]').value='15';
}
function mockImages(w) {
  w.FileReader=class {readAsDataURL(){this.result=PNG;w.queueMicrotask(()=>this.onload());}};
  w.Image=class {set src(value){this.naturalWidth=2400;this.naturalHeight=1800;w.queueMicrotask(()=>this.onload());}};
  w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});
  w.HTMLCanvasElement.prototype.toDataURL=()=>PNG;
}
function imageFile(w,name='receipt.png',size=20,type='image/png') {return new w.File([new Uint8Array(size)],name,{type});}
function choose(w,input,files) {
  Object.defineProperty(input,'files',{value:files,configurable:true});
  input.dispatchEvent(new w.Event('change',{bubbles:true}));
}
async function flush() {await new Promise(resolve=>setImmediate(resolve));}

test('payment dates reject invalid calendars and unrecognized text without inventing a fallback',()=>{
  for(const value of ['',null,undefined,'tomorrow','Oct 27, 2026 extra','2/3/2026','Feb 29, 2026','Apr 31, 2026','2026-02-30','2026-00-12','2026-13-12'])assert.equal(model.parseDate(value),null,String(value));
  assert.equal(model.parseDate('Feb 29, 2028'),'2028-02-29');
  assert.equal(model.parseDate('2026-10-03'),'2026-10-03');
  assert.equal(model.formatDate('2026-10-03'),'Oct 3, 2026');
  assert.equal(model.period('Oct 31, 2026','Oct 1, 2026'),null);
  assert.deepEqual(model.period('Dec 4, 2026','Jan 1, 2027'),{start:'2026-12-04',end:'2027-01-01'});
});

test('Add Activity leaves invalid date input unsaved and stores a valid date as ISO',t=>{
  const w=boot(t);click(w,'[data-action="add-activity"]');w.document.querySelector('[name="amount"]').value='5';
  const date=w.document.querySelector('#payment-dialog #pw-activity-date');
  assert.ok(date);assert.equal(date.tagName,'INPUT');assert.equal(date.closest('dialog').open,true);
  assert.notEqual(date,w.document.querySelector('#payment-main [name="date"]'));
  for(const value of ['','invalid','Feb 30, 2026']){
    date.value=value;click(w,'[data-action="save-activity"]');
    assert.equal(stored(w),null);assert.equal(w.document.querySelector('dialog').open,true);assert.equal(date.validity.valid,false);
  }
  date.value='Oct 3, 2026';click(w,'[data-action="save-activity"]');
  assert.equal(stored(w).activities[0].date,'2026-10-03');assert.match(w.document.querySelector('#payment-list').textContent,/Oct 3, 2026/);
});

test('payout periods reject blank, malformed and reversed dates and render normalized ISO periods',t=>{
  const w=boot(t,{view:'payouts'});payoutFields(w);
  const from=w.document.querySelector('[name="period-start"]'),to=w.document.querySelector('[name="period-end"]');
  for(const [start,end] of [['','Oct 31, 2026'],['arbitrary','Oct 31, 2026'],['Feb 30, 2026','Mar 1, 2026'],['Oct 31, 2026','Oct 1, 2026']]){
    from.value=start;to.value=end;click(w,'[data-action="save-payout"]');assert.equal(stored(w),null);assert.equal(w.document.querySelector('dialog').open,true);
  }
  from.value='Dec 4, 2026';to.value='Jan 1, 2027';click(w,'[data-action="save-payout"]');
  const record=stored(w).payouts[0];assert.equal(record.periodStart,'2026-12-04');assert.equal(record.periodEnd,'2027-01-01');assert.equal(record.period,undefined);
  assert.match(w.document.querySelector('#payment-list').textContent,/Dec 4, 2026 – Jan 1, 2027/);
});

test('renaming and deleting a category preserves tagged payment accounting',()=>{
  const state={categories:['Rent','Salary'],categoryTags:{a:'Rent',b:'Salary'}};
  const records=[{id:'a',amount:105,date:'2026-10-02'},{id:'b',amount:10,date:'2026-10-01'},{id:'c',amount:20,date:'2026-10-27'}];
  model.renameCategory(state,0,'Lease');assert.equal(state.categoryTags.a,'Lease');
  assert.deepEqual(model.categoryTotals(state,records,'All time'),[{name:'Uncategorized',amount:20},{name:'Lease',amount:105},{name:'Salary',amount:10}]);
  model.deleteCategory(state,0);assert.equal(state.categoryTags.a,'Uncategorized');
  assert.deepEqual(model.categoryTotals(state,records,'All time'),[{name:'Uncategorized',amount:125},{name:'Salary',amount:10}]);
  records.push({id:'new',amount:7.25,date:'2026-10-27'});
  assert.equal(model.categoryTotals(state,records,'All time').find(r=>r.name==='Uncategorized').amount,132.25);
});

test('category merge and unknown legacy tags never create orphan category totals',()=>{
  const state={categories:['Rent','Salary'],categoryTags:{a:'Rent',b:'Salary',c:'Deleted'}};
  model.renameCategory(state,0,'Salary');assert.deepEqual(state.categories,['Salary']);assert.equal(state.categoryTags.a,'Salary');assert.equal(model.categoryFor(state,'c'),'Uncategorized');
});

test('failed persistence never publishes partially changed nested state',()=>{
  const before={methods:[{enabled:true}],categoryTags:{a:'Rent'}};
  assert.throws(()=>model.persist(before,next=>{next.methods[0].enabled=false;next.categoryTags.a='Salary';},{setItem(){throw new Error('quota');}},KEY),/quota/);
  assert.deepEqual(before,{methods:[{enabled:true}],categoryTags:{a:'Rent'}});
});

test('QR storage failure retains dialog edits and the previous persisted account',async t=>{
  const seed={methods:[{name:'Zelle',holder:'Original',account:'nexora_b1',enabled:true,icon:'zelle.png'}],categories:['Rent'],activities:[],payouts:[],categoryTags:{}};
  const w=boot(t,{view:'receive',seed,before:mockImages});click(w,'[data-action="edit-method"]');w.document.querySelector('[name="holder"]').value='Edited';
  choose(w,w.document.querySelector('#pw-method-qr'),[imageFile(w)]);await flush();
  Object.defineProperty(w.Storage.prototype,'setItem',{value(){throw new w.DOMException('The quota has been exceeded.','QuotaExceededError');},configurable:true});
  click(w,'[data-action="save-method"]');assert.equal(w.document.querySelector('dialog').open,true);assert.equal(w.document.querySelector('[name="holder"]').value,'Edited');assert.equal(stored(w).methods[0].holder,'Original');
  assert.match(w.document.querySelector('[role="alert"]').textContent,/quota/);
  click(w,'[data-action="close"]');click(w,'[data-action="view-method"]');assert.match(w.document.querySelector('dialog').textContent,/Original/);assert.doesNotMatch(w.document.querySelector('dialog').textContent,/Edited/);
});

test('upload limits reject the entire invalid batch before decoding',async()=>{
  let processed=0;const process=async()=>{processed++;return PNG;};
  await assert.rejects(model.prepareUploads([{name:'a',type:'image/png',size:10}],3,3,process),{code:'count'});
  await assert.rejects(model.prepareUploads([{name:'a',type:'text/plain',size:10}],0,3,process),{code:'type'});
  await assert.rejects(model.prepareUploads([{name:'a',type:'image/png',size:model.MAX_IMAGE_BYTES}],0,3,process),{code:'size'});
  assert.equal(processed,0);
  const result=await model.prepareUploads([{name:'a.png',type:'image/png',size:10}],0,3,process);assert.equal(result[0].dataUrl,PNG);
});

test('payout evidence validates picker and drop batches and persists viewable image content across reload',async t=>{
  const w=boot(t,{view:'payouts',before:mockImages});payoutFields(w);const input=w.document.querySelector('#pw-evidence');
  choose(w,input,[imageFile(w,'bad.txt',20,'text/plain')]);await flush();assert.equal(input.validity.customError,true);click(w,'[data-action="save-payout"]');assert.equal(stored(w),null);
  choose(w,input,[imageFile(w,'receipt.png')]);await flush();assert.equal(input.validity.valid,true);assert.equal(w.document.querySelectorAll('#pw-evidence-preview img').length,1);
  const drop=new w.Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(drop,'dataTransfer',{value:{files:[imageFile(w,'transfer.png')]}});w.document.querySelector('[data-upload-kind="evidence"]').dispatchEvent(drop);await flush();
  assert.equal(drop.defaultPrevented,true);assert.equal(w.document.querySelectorAll('#pw-evidence-preview img').length,2);
  choose(w,input,[imageFile(w,'third.png'),imageFile(w,'fourth.png')]);await flush();assert.equal(input.validity.customError,true);assert.equal(w.document.querySelectorAll('#pw-evidence-preview img').length,2);
  click(w,'[data-action="delete-evidence"]');assert.equal(input.validity.valid,true);click(w,'[data-action="save-payout"]');const seed=stored(w);assert.equal(seed.payouts[0].evidence.length,1);assert.equal(seed.payouts[0].evidence[0].dataUrl,PNG);
  const reloaded=boot(t,{view:'payouts',seed});click(reloaded,'#payment-list [data-action="details"]');assert.equal(reloaded.document.querySelector('.pw-evidence-preview img').getAttribute('src'),PNG);assert.match(reloaded.document.querySelector('dialog').textContent,/transfer.png/);
});

test('failed payment category persistence reverts the select without changing its saved tag',t=>{
  const w=boot(t);click(w,'#payment-list [data-action="details"]');const select=w.document.querySelector('[name="detail-category"]');
  Object.defineProperty(w.Storage.prototype,'setItem',{value(){throw new w.DOMException('The quota has been exceeded.','QuotaExceededError');},configurable:true});
  select.value='Rent';select.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(select.value,'Uncategorized');assert.equal(stored(w),null);assert.equal(w.document.querySelector('dialog').open,true);
});
