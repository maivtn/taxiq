import test from 'node:test';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
function boot(saved,catalog,url='https://example.test/pages/pos-front-desk-tickets.html'){
 const dom=new JSDOM(readFileSync(new URL('./pos-front-desk-tickets.html',import.meta.url),'utf8'),{url,runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 if(catalog)w.localStorage.setItem('nexora:salon-data:v1:bitcoin-nail-bar-houston',JSON.stringify(catalog));
 if(saved)w.localStorage.setItem('nexora:front-desk-ticket-workspaces:v1',saved);
 for(const name of ['salon-data','appointment-tickets','appointments-store','ticket-workspace','pos-front-desk-tickets','pos-front-desk-overview'])w.eval(readFileSync(new URL('../assets/'+name+'.js',import.meta.url),'utf8'));
 return dom;
}
test('Front Desk Edit opens full workspace, persists edits after reload',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="edit"][data-id="7"]').click();
 assert.equal(d.querySelector('#ticket-workspace').hidden,false);assert.equal(d.querySelector('#tickets-view').hidden,true);assert.equal(d.querySelector('#ticket-dialog').open,false);
 d.querySelector('[data-tw-add="mani"]').click();d.querySelector('[data-tw-customer]').click();d.querySelector('[name="customer"]').value='Jade <test>';d.querySelector('[data-tw-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 d.querySelector('[data-tw-back]').click();assert.equal(d.querySelector('#tickets-view').hidden,false);assert.match(d.querySelector('#ticket-body').textContent,/Jade <test>/);assert.equal(d.querySelector('#ticket-body test'),null);assert.match(d.querySelector('#ticket-body').textContent,/Manicure/);
 const saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved);assert.match(restored.window.document.querySelector('#ticket-body').textContent,/Jade <test>/);restored.window.close();
});
test('Front Desk Checkout opens payment workspace with original services and returns without losing unpaid guest',()=>{
 const dom=boot(),d=dom.window.document;
 d.querySelector('[data-action="checkout"][data-id="1"]').click();
 assert.equal(d.querySelector('#ticket-workspace').hidden,false);assert.ok(d.querySelector('[data-tw-pay]'));assert.ok(d.querySelector('[data-tw-discount-all]'));assert.equal(d.querySelectorAll('.tw-line').length,2);
 d.querySelector('[data-tw-back]').click();assert.equal(d.querySelectorAll('#ticket-body tr').length,4);
 dom.window.close();
});

test('Front Desk restores a partially paid group after reload and keeps completed tickets out of the queue',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="checkout"][data-id="1"]').click();
 while(d.querySelector('[data-tw-action="price"]')) {
  d.querySelector('[data-tw-action="price"]').click();d.querySelector('[name="price"]').value='40';d.querySelector('[data-tw-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 }
 while(d.querySelector('[data-tw-action="complete"]'))d.querySelector('[data-tw-action="complete"]').click();
 d.querySelector('[data-tw-split-bill]').click();
 d.querySelector('[data-tw-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 d.querySelectorAll('[data-tw-bill]')[1].click();d.querySelectorAll('[data-tw-bill-line]')[1].click();d.querySelectorAll('[data-tw-bill]')[0].click();
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();d.querySelector('[data-tw-back]').click();
 assert.ok(d.querySelector('[data-action="checkout"][data-id="1"]'));
 assert.match(d.querySelector('#ticket-body').textContent,/1\/2 bills paid/);
 assert.equal(d.querySelector('[data-action="assign"][data-id="1"]'),null,'Split bills keep their original technicians');
 const saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved),r=restored.window.document;
 r.querySelector('[data-action="checkout"][data-id="1"]').click();
 assert.match(r.querySelector('[data-tw-bill-progress]').textContent,/1\/2/);
 assert.equal(r.querySelector('[data-tw-total]').textContent,'$75.00');
 r.querySelector('[data-tw-method="card"]').click();r.querySelector('[data-tw-pay]').click();
 const finish=r.querySelector('[data-tw-complete-checkout]');assert.ok(finish);assert.equal(r.querySelector('#ticket-workspace').hidden,false);
 const paymentBeforeFinish=restored.window.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');finish.click();
 assert.equal(r.querySelector('#ticket-workspace').hidden,true);assert.equal(r.querySelector('#tickets-view').hidden,false);
 assert.equal(new URL(restored.window.location.href).searchParams.has('ticketId'),false);assert.equal(new URL(restored.window.location.href).searchParams.has('mode'),false);
 assert.equal(restored.window.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1'),paymentBeforeFinish);
 assert.equal(r.querySelector('[data-action="checkout"][data-id="1"]'),null);
 const completed=restored.window.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');restored.window.close();
 const final=boot(completed);assert.equal(final.window.document.querySelector('[data-action="checkout"][data-id="1"]'),null);final.window.close();
});

for(const seeded of [false,true])test(`Front Desk services have catalog prices before splitting (menu seeded: ${seeded})`,()=>{
 let catalog;
 if(seeded){
  const salon=require('../assets/salon-data.js'),menu=require('../assets/appointment-service-catalog.js').normalize(require('../menu/menu.json'));
  catalog=salon.seedServicesFromMenuCatalog(salon.DEFAULT_CATALOG,menu).catalog;
  catalog.services.find(s=>s.id==='acrylic-full-set-acrylic-with-polish-0').price=58;
 }
 const dom=boot(undefined,catalog),d=dom.window.document;
 for(const [id,total] of [[7,'$55.00'],[8,'$142.00'],[1,seeded?'$133.00':'$125.00']]){
  d.querySelector(`[data-action="edit"][data-id="${id}"]`).click();
  assert.equal(d.querySelector('[data-tw-action="price"]'),null);
  assert.equal(d.querySelector('[data-tw-total]').textContent,total);
  d.querySelector('[data-tw-back]').click();
 }
 d.querySelector('[data-action="checkout"][data-id="1"]').click();d.querySelector('[data-tw-split-bill]').click();
 d.querySelector('[data-tw-form]').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(d.querySelectorAll('[data-tw-bill]').length,2);dom.window.close();
});
test('restores existing saved workspaces and fills missing catalog prices',()=>{
 const saved=JSON.stringify({'1':{lines:[
  {id:'old-acrylic',name:'Acrylic with Polish (Full Set)',price:null,tech:'Chloe',status:'in-service'},
  {id:'old-pearl',name:'Paris Pearl Pedicure',price:null,tech:'Chloe',status:'in-service'},
  {id:'special',name:'Paris Pearl Pedicure',price:65,tech:'Chloe',status:'completed'},
  {id:'free',name:'Paris Pearl Pedicure',price:0,tech:'Chloe',status:'completed'}
 ]}});
 const dom=boot(saved),w=dom.window,d=w.document;d.querySelector('[data-action="checkout"][data-id="1"]').click();
 assert.equal(d.querySelector('[data-tw-action="price"]'),null);
 assert.equal(d.querySelector('[data-tw-total]').textContent,'$190.00');
 assert.equal(d.querySelectorAll('.tw-line').length,4);w.close();
});

for(const mode of ['services','amount'])test(`unpaid ${mode} split survives reload until Cancel split is clicked`,()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="checkout"][data-id="1"]').click();d.querySelector('[data-tw-split-bill]').click();
 d.querySelector(`[name="splitMode"][value="${mode}"]`).click();
 d.querySelector('[name="guest1"]').value='Mai';
 if(mode==='services')d.querySelector('[data-tw-setup-line="line-1-1"][data-guest="1"]').click();
 d.querySelector('[data-tw-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 d.querySelectorAll('[data-tw-bill]')[1].click();
 const cash=d.querySelector('[data-tw-field="cash"]');cash.value='100';cash.dispatchEvent(new w.Event('input',{bubbles:true}));
 const saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved),r=restored.window.document;
 r.querySelector('[data-action="checkout"][data-id="1"]').click();assert.equal(r.querySelectorAll('[data-tw-bill]').length,2);
 assert.match(r.querySelectorAll('[data-tw-bill]')[1].textContent,/Mai/);r.querySelectorAll('[data-tw-bill]')[1].click();
 assert.equal(r.querySelector('[data-tw-field="cash"]').value,'100');assert.equal(r.querySelector('[data-tw-total]').textContent,mode==='services'?'$75.00':'$62.50');
 r.querySelector('[data-tw-cancel-split]').click();assert.equal(r.querySelector('[data-tw-bill-progress]'),null);
 const cancelled=restored.window.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');restored.window.close();
 const final=boot(cancelled),f=final.window.document;f.querySelector('[data-action="checkout"][data-id="1"]').click();
 assert.equal(f.querySelector('[data-tw-bill-progress]'),null);assert.equal(f.querySelector('[data-tw-total]').textContent,'$125.00');final.window.close();
});
test('explicitly cancelled tickets stay removed after reload',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="cancel"][data-id="7"]').click();d.querySelector('#ticket-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved);assert.equal(restored.window.document.querySelector('[data-action="edit"][data-id="7"]'),null);restored.window.close();
});

for(const mode of ['edit','checkout'])test(`${mode} has a ticket URL that reopens the saved workspace`,()=>{
 const dom=boot(undefined,undefined,'https://example.test/pages/pos-front-desk-tickets.html?source=demo#ticket'),w=dom.window,d=w.document;
 d.querySelector(`[data-action="${mode}"][data-id="1"]`).click();
 assert.equal(new URL(w.location.href).searchParams.get('ticketId'),'1');
 assert.equal(new URL(w.location.href).searchParams.get('mode'),mode);
 const note=d.querySelector('[data-tw-note]');note.value='Keep this ticket';note.dispatchEvent(new w.Event('input',{bubbles:true}));
 const url=w.location.href,saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved,undefined,url),r=restored.window.document;
 assert.equal(r.querySelector('#ticket-workspace').hidden,false);assert.equal(r.querySelector('#tickets-view').hidden,true);assert.equal(r.querySelector('#overview-view').hidden,true);
 assert.equal(r.querySelector('[data-tw-note]').value,'Keep this ticket');
 assert.equal(!!r.querySelector('[data-tw-pay]'),mode==='checkout');
 r.querySelector('[data-tw-back]').click();const back=new URL(restored.window.location.href);
 assert.equal(back.searchParams.has('ticketId'),false);assert.equal(back.searchParams.has('mode'),false);assert.equal(back.searchParams.get('source'),'demo');assert.equal(back.hash,'#ticket');
 restored.window.close();
});
test('Edit to Checkout updates the URL and history navigation restores the right screen',()=>{
 const dom=boot(),w=dom.window,d=w.document;d.querySelector('[data-action="edit"][data-id="1"]').click();
 const editUrl=w.location.href;d.querySelector('[data-tw-checkout]').click();
 assert.equal(new URL(w.location.href).searchParams.get('mode'),'checkout');
 w.history.replaceState(null,'',editUrl);w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.equal(d.querySelector('[data-tw-pay]'),null);assert.equal(d.querySelector('#tickets-view').hidden,true);
 w.history.replaceState(null,'','?view=overview');w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.equal(d.querySelector('#ticket-workspace').hidden,true);assert.equal(d.querySelector('#overview-view').hidden,false);
 w.history.replaceState(null,'','?ticketId=1&mode=checkout');w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.ok(d.querySelector('[data-tw-pay]'));assert.equal(d.querySelector('#overview-view').hidden,true);dom.window.close();
});
test('unknown ticket links return to the queue with a clear message',()=>{
 const dom=boot(undefined,undefined,'https://example.test/pages/pos-front-desk-tickets.html?ticketId=missing&mode=checkout'),d=dom.window.document;
 assert.equal(d.querySelector('#ticket-workspace').hidden,true);assert.equal(d.querySelector('#tickets-view').hidden,false);
 assert.match(d.querySelector('#feedback').textContent,/not available/i);dom.window.close();
});
