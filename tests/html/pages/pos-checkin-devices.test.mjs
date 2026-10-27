import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const html=readFileSync(new URL('../../../html/pages/pos-checkin-devices.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../../../html/assets/pos-checkin-devices.js',import.meta.url),'utf8');
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup(t){const values=new Map(),windows=[],queues=new Map();return function tab(query=''){
 const dom=new JSDOM(html,{url:'https://nexora.test/html/pages/pos-checkin-devices.html'+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());
 Object.defineProperty(w,'localStorage',{value:{getItem:k=>values.get(k)??null,setItem(k,v){values.set(k,String(v));for(const other of windows)if(other!==w)queueMicrotask(()=>other.dispatchEvent(new other.StorageEvent('storage',{key:k})));}}});
 Object.defineProperty(w.navigator,'locks',{value:{request(key,action){const result=(queues.get(key)||Promise.resolve()).then(action);queues.set(key,result.catch(()=>{}));return result;}}});
 w.QRCode=function(el,options){el.dataset.value=options.text;};w.QRCode.CorrectLevel={M:0};windows.push(w);w.eval(script);return w;
};}
test('pairing synchronizes an existing admin tab and rotating preserves the paired device',async t=>{
 const tab=setup(t),a=tab();await settle();const url=new URL(a.document.getElementById('device-qr').dataset.value),b=tab(url.search);await settle();await settle();
 assert.match(a.document.querySelector('.nxa-section-head h2').textContent,/1 active/);assert.match(b.document.querySelector('.nxa-pair-state').textContent,/Active/);
 a.document.getElementById('device-new-code').click();await settle();assert.match(a.document.querySelector('.nxa-section-head h2').textContent,/1 active/);assert.match(b.document.querySelector('.nxa-section-head h2').textContent,/1 active/);
 const replay=tab(url.search);await settle();assert.equal(replay.document.querySelector('.nxa-pair-state').textContent,'Expired');assert.match(replay.document.querySelector('.nxa-section-head h2').textContent,/1 active/);
});
test('two tabs consuming the same pairing code create only one active device',async t=>{
 const tab=setup(t),a=tab();await settle();const query=new URL(a.document.getElementById('device-qr').dataset.value).search,b=tab(query),c=tab(query);await settle();await settle();
 assert.match(a.document.querySelector('.nxa-section-head h2').textContent,/1 active/);assert.deepEqual([b,c].map(w=>w.document.querySelector('.nxa-pair-state').textContent).sort(),['Active','Expired']);
});
