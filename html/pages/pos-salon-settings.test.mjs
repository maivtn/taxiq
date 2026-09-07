import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
function boot(){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(readFileSync(new URL('./pos-salon-settings.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-salon-settings.html',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 w.eval(readFileSync(new URL('../assets/salon-data.js',import.meta.url),'utf8'));
 const data=w.NEXORA_SALON_DATA.loadCatalog();data.technicians=Array.from({length:12},(_,i)=>({id:'staff-'+i,name:'Staff '+i,phone:'5551234567',active:true}));w.NEXORA_SALON_DATA.saveCatalog(data);
 w.NEXORA_APPOINTMENT_SERVICE_CATALOG={load:()=>new Promise(()=>{})};
 }});
 dom.window.eval(readFileSync(new URL('../assets/pos-salon-settings.js',import.meta.url),'utf8'));
 return {dom,w:dom.window,d:dom.window.document,errors};
}
test('Salon Settings opens Staff, searches and paginates with working profile actions',()=>{
 const {dom,w,d,errors}=boot();
 assert.equal(d.querySelector('[data-settings-tab].active')?.dataset.settingsTab,'staff');
 assert.equal(d.querySelectorAll('[data-staff-grid] tbody tr').length,10);
 d.querySelector('[aria-label="Next page"]').click();assert.equal(d.querySelectorAll('[data-staff-grid] tbody tr').length,2);
 const search=d.querySelector('#salon-staff-search');search.value='Staff 11';search.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelectorAll('[data-staff-grid] tbody tr').length,1);
 d.querySelector('[data-staff-grid] [data-tech-detail-open]').click();assert.equal(d.querySelector('[data-tech-modal]').hidden,false);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('unfinished Salon Settings tabs stay empty',()=>{
 const {dom,d,errors}=boot();
 for(const tab of ['services','roles','information']){
  d.querySelector('[data-settings-tab="'+tab+'"]').click();
  const panel=d.querySelector('[data-settings-panel="'+tab+'"]');
  assert.equal(panel.hidden,false);assert.equal(panel.innerHTML.trim(),'');
 }
 d.querySelector('[data-settings-tab="staff"]').click();
 assert.equal(d.querySelector('[data-settings-panel="staff"]').hidden,false);
 assert.equal(d.querySelectorAll('[data-staff-grid] tbody tr').length,10);
 assert.deepEqual(errors,[]);dom.window.close();
});

test('Add and View use the original POS Staff modal in create and edit modes',()=>{
 const {dom,d,errors}=boot();
 const source=new JSDOM(readFileSync(new URL('./pos-staff.html',import.meta.url),'utf8'));
 const original=source.window.document.querySelector('[data-tech-modal]');
 const template=new JSDOM(readFileSync(new URL('./pos-salon-settings.html',import.meta.url),'utf8'));
 assert.equal(template.window.document.querySelector('[data-tech-modal]').outerHTML,original.outerHTML);
 const modal=d.querySelector('[data-tech-modal]');
 assert.equal(modal.hidden,true);
 d.querySelector('[data-tech-modal-open]').click();
 assert.equal(modal.hidden,false);assert.equal(modal.dataset.techMode,'create');
 assert.equal(d.querySelector('[data-tech-field="name"]').value,'');
 d.querySelector('[data-tech-modal-close]').click();assert.equal(modal.hidden,true);
 d.querySelector('[data-staff-grid] [data-tech-detail-open="staff-0"]').click();
 assert.equal(modal.dataset.techMode,'edit');
 assert.equal(d.querySelector('[data-tech-field="name"]').value,'Staff 0');
 assert.deepEqual(errors,[]);source.window.close();template.window.close();dom.window.close();
});

test('technician level saves and reloads in the staff profile',()=>{
 const {dom,w,d,errors}=boot();
 d.querySelector('[data-staff-grid] [data-tech-detail-open="staff-0"]').click();
 const level=d.querySelector('[data-tech-field="level"]');
 assert.equal(level.options.length,3);assert.equal(level.value,'1');
 level.value='2';d.querySelector('[data-tech-modal-save]').click();
 assert.equal(w.NEXORA_SALON_DATA.loadCatalog().technicians.find(t=>t.id==='staff-0').posProfile.level,2);
 const search=d.querySelector('#salon-staff-search');search.value='Staff 0';search.dispatchEvent(new w.Event('input'));
 assert.match(d.querySelector('[data-staff-grid]').textContent,/Level 2/);
 d.querySelector('[data-tech-detail-open="staff-0"]').click();assert.equal(level.value,'2');
 d.querySelector('[data-tech-modal-close]').click();d.querySelector('[data-tech-modal-open]').click();assert.equal(level.value,'1');
 assert.deepEqual(errors,[]);dom.window.close();
});
