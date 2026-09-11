import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
function boot(saved){
 const dom=new JSDOM(readFileSync(new URL('./pos-front-desk-tickets.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk-tickets.html',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 if(saved)w.localStorage.setItem('nexora:front-desk-ticket-workspaces:v1',saved);
 for(const name of ['salon-data','appointment-tickets','appointments-store','ticket-workspace','pos-front-desk-tickets','pos-front-desk-overview'])w.eval(readFileSync(new URL('../assets/'+name+'.js',import.meta.url),'utf8'));
 return dom;
}
test('Front Desk Edit opens full workspace, updates queue and persists edits after reload',()=>{
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

test('Front Desk retains a partially paid group after reload and removes it only after the final bill',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="checkout"][data-id="1"]').click();
 while(d.querySelector('[data-tw-action="price"]')) {
  d.querySelector('[data-tw-action="price"]').click();d.querySelector('[name="price"]').value='40';d.querySelector('[data-tw-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 }
 while(d.querySelector('[data-tw-action="complete"]'))d.querySelector('[data-tw-action="complete"]').click();
 d.querySelector('[data-tw-split-bill]').click();
 const select=d.querySelectorAll('[data-tw-bill-line]')[1];select.value=select.options[1].value;select.dispatchEvent(new w.Event('change',{bubbles:true}));
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();d.querySelector('[data-tw-back]').click();
 assert.ok(d.querySelector('[data-action="checkout"][data-id="1"]'));
 assert.match(d.querySelector('#ticket-body').textContent,/1\/2 bills paid/);
 assert.equal(d.querySelector('[data-action="assign"][data-id="1"]'),null,'Split bills keep their original technicians');
 const saved=w.localStorage.getItem('nexora:front-desk-ticket-workspaces:v1');w.close();
 const restored=boot(saved),r=restored.window.document;
 r.querySelector('[data-action="checkout"][data-id="1"]').click();assert.match(r.querySelector('[data-tw-bill-progress]').textContent,/1\/2/);
 r.querySelector('[data-tw-method="card"]').click();r.querySelector('[data-tw-pay]').click();r.querySelector('[data-tw-back]').click();
 assert.equal(r.querySelector('[data-action="checkout"][data-id="1"]'),null);restored.window.close();
});
