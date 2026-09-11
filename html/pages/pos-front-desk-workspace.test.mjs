import test from 'node:test';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
function boot(saved,catalog){
 const dom=new JSDOM(readFileSync(new URL('./pos-front-desk-tickets.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk-tickets.html',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 if(catalog)w.localStorage.setItem('nexora:salon-data:v1:bitcoin-nail-bar-houston',JSON.stringify(catalog));
 if(saved)w.localStorage.setItem('nexora:front-desk-ticket-workspaces:v1',saved);
 for(const name of ['salon-data','appointment-tickets','appointments-store','ticket-workspace','pos-front-desk-tickets','pos-front-desk-overview'])w.eval(readFileSync(new URL('../assets/'+name+'.js',import.meta.url),'utf8'));
 return dom;
}
test('Front Desk Edit opens full workspace, keeps edits within the page and resets after reload',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="edit"][data-id="7"]').click();
 assert.equal(d.querySelector('#ticket-workspace').hidden,false);assert.equal(d.querySelector('#tickets-view').hidden,true);assert.equal(d.querySelector('#ticket-dialog').open,false);
 d.querySelector('[data-tw-add="mani"]').click();d.querySelector('[data-tw-customer]').click();d.querySelector('[name="customer"]').value='Jade <test>';d.querySelector('[data-tw-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 d.querySelector('[data-tw-back]').click();assert.equal(d.querySelector('#tickets-view').hidden,false);assert.match(d.querySelector('#ticket-body').textContent,/Jade <test>/);assert.equal(d.querySelector('#ticket-body test'),null);assert.match(d.querySelector('#ticket-body').textContent,/Manicure/);
 const saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved);assert.doesNotMatch(restored.window.document.querySelector('#ticket-body').textContent,/Jade <test>/);assert.match(restored.window.document.querySelector('#ticket-body').textContent,/Quan/);restored.window.close();
});
test('Front Desk Checkout opens payment workspace with original services and returns without losing unpaid guest',()=>{
 const dom=boot(),d=dom.window.document;
 d.querySelector('[data-action="checkout"][data-id="1"]').click();
 assert.equal(d.querySelector('#ticket-workspace').hidden,false);assert.ok(d.querySelector('[data-tw-pay]'));assert.ok(d.querySelector('[data-tw-discount-all]'));assert.equal(d.querySelectorAll('.tw-line').length,2);
 d.querySelector('[data-tw-back]').click();assert.equal(d.querySelectorAll('#ticket-body tr').length,4);
 dom.window.close();
});

test('Front Desk retains a partially paid group while navigating and resets it after reload',()=>{
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
 d.querySelector('[data-action="checkout"][data-id="1"]').click();assert.match(d.querySelector('[data-tw-bill-progress]').textContent,/1\/2/);
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();d.querySelector('[data-tw-back]').click();
 assert.equal(d.querySelector('[data-action="checkout"][data-id="1"]'),null);
 const saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved),r=restored.window.document;
 r.querySelector('[data-action="checkout"][data-id="1"]').click();
 assert.equal(r.querySelector('[data-tw-bill-progress]'),null);assert.equal(r.querySelector('[data-tw-total]').textContent,'$125.00');restored.window.close();
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
test('reload ignores obsolete saved workspaces and restores priced demo services',()=>{
 const saved=JSON.stringify({'1':{lines:[
  {id:'old-acrylic',name:'Acrylic with Polish (Full Set)',price:null,tech:'Chloe',status:'in-service'},
  {id:'old-pearl',name:'Paris Pearl Pedicure',price:null,tech:'Chloe',status:'in-service'},
  {id:'special',name:'Paris Pearl Pedicure',price:65,tech:'Chloe',status:'completed'},
  {id:'free',name:'Paris Pearl Pedicure',price:0,tech:'Chloe',status:'completed'}
 ]}});
 const dom=boot(saved),w=dom.window,d=w.document;d.querySelector('[data-action="checkout"][data-id="1"]').click();
 assert.equal(d.querySelector('[data-tw-action="price"]'),null);
 assert.equal(d.querySelector('[data-tw-total]').textContent,'$125.00');
 assert.equal(d.querySelectorAll('.tw-line').length,2);w.close();
});
