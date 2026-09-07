import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
function boot(){
 const dom=new JSDOM(readFileSync(new URL('./pos-front-desk-tickets.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk-tickets.html',runScripts:'outside-only'});
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 dom.window.eval(readFileSync(new URL('../assets/pos-front-desk-tickets.js',import.meta.url),'utf8'));return dom;
}
test('Tickets renders source content and filters the queue',()=>{
 const dom=boot(),d=dom.window.document;
 assert.equal(d.querySelectorAll('#ticket-body tr').length,4);
 assert.match(d.querySelector('#assignment-alert').textContent,/2 guests/);
 d.querySelector('[data-filter="in-service"]').click();assert.equal(d.querySelectorAll('#ticket-body tr').length,1);assert.match(d.querySelector('#ticket-body').textContent,/DJ/);
 d.querySelector('[data-filter="not-arrived"]').click();assert.equal(d.querySelector('#ticket-empty').hidden,false);
 d.querySelector('#checkin-summary').click();assert.match(d.querySelector('#ticket-dialog-content').textContent,/48/);
 dom.window.close();
});
test('assignment, start, edit and cancellation update the ticket queue',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="assign"][data-id="7"]').click();
 d.querySelector('[name="technician"][value="Lana VMM"]').checked=true;
 d.querySelector('[name="locationNumber"]').value='3';
 const submit=()=>d.querySelector('#ticket-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
 submit();assert.match(d.querySelector('#ticket-error').textContent,/reason/);
 d.querySelector('[name="reason"]').value='Skill match';submit();assert.equal(d.querySelector('#ticket-dialog').open,false);
 assert.match(d.querySelector('#assignment-alert').textContent,/1 guest/);
 d.querySelector('[data-action="start"][data-id="7"]').click();
 assert.match(d.querySelector('[data-action="checkout"][data-id="7"]').closest('tr').textContent,/In Service/);
 d.querySelector('[data-action="edit"][data-id="9"]').click();d.querySelector('[name="customer"]').value='<img src=x onerror=alert(1)>';submit();assert.equal(d.querySelector('#ticket-body img'),null);
 d.querySelector('[data-action="cancel"][data-id="9"]').click();submit();assert.equal(d.querySelectorAll('#ticket-body tr').length,3);
 dom.window.close();
});
test('checkout saves required service details without removing an unpaid ticket',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('[data-action="checkout"][data-id="1"]').click();
 const submit=()=>d.querySelector('#ticket-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
 submit();assert.match(d.querySelector('#ticket-error').textContent,/required/);
 d.querySelector('[name="brand"]').value='DND';d.querySelector('[name="colorCode"]').value='441';submit();
 assert.match(d.querySelector('#feedback').textContent,/Service details saved for DJ/);
 assert.equal(d.querySelectorAll('#ticket-body tr').length,4);
 dom.window.close();
});
