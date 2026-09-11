import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
function boot(serviceCatalog = null){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(readFileSync(new URL('./pos-salon-settings.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-salon-settings.html',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 w.eval(readFileSync(new URL('../assets/salon-data.js',import.meta.url),'utf8'));
 const data=w.NEXORA_SALON_DATA.loadCatalog();data.technicians=Array.from({length:12},(_,i)=>({id:'staff-'+i,name:'Staff '+i,phone:'5551234567',active:true}));w.NEXORA_SALON_DATA.saveCatalog(data);
 w.eval(readFileSync(new URL('../assets/service-approval-settings.js',import.meta.url),'utf8'));
 w.NEXORA_APPOINTMENT_SERVICE_CATALOG={load:()=>serviceCatalog ? Promise.resolve(serviceCatalog) : new Promise(()=>{})};
 }});
 dom.window.eval(readFileSync(new URL('../assets/pos-salon-settings.js',import.meta.url),'utf8'));
 dom.window.eval(readFileSync(new URL('../assets/vendor/tom-select/tom-select.complete.min.js',import.meta.url),'utf8'));
 dom.window.eval(readFileSync(new URL('../assets/pos-salon-services.js',import.meta.url),'utf8'));
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
 for(const tab of ['roles','information']){
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

const serviceFixture = {categories:[{id:'nails',name:'Nails',services:[{id:'polish-change',name:'Polish Change',type:'service',price:15,durationMin:20}]}]};
async function servicesPage() {
 const page=boot(serviceFixture);
 await new Promise(resolve=>page.w.setTimeout(resolve,0));
 page.d.querySelector('[data-settings-tab="services"]').click();
 return page;
}
function editService(page) {page.d.querySelector('[data-salon-service-edit="polish-change"]').click();}
function saveService(page) {page.d.querySelector('[data-service-editor-form]').dispatchEvent(new page.w.Event('submit',{bubbles:true,cancelable:true}));}

test('Services uses category accordions and pricing rows, with approval only inside View / Edit',async()=>{
 const page=await servicesPage();const {d,dom}=page;
 assert.equal(d.querySelector('[data-approval-salon]'),null);
 const category=d.querySelector('[data-approval-services] details');assert.equal(category.open,true);
 assert.match(category.querySelector('summary').textContent,/Nails.*1/);
 const row=d.querySelector('[data-salon-service-row="polish-change"]');
 assert.equal(row.querySelector('[data-inline-field="name"]').value,'Polish Change');
 assert.equal(row.querySelector('[data-inline-field="price"]').value,'15');
 assert.equal(row.querySelector('[data-inline-field="durationMin"]').value,'20');
 assert.ok(row.querySelector('[aria-label="View / Edit Polish Change"]'));
 assert.equal(row.querySelector('input[type="checkbox"]'),null);
 editService(page);
 assert.equal(d.querySelector('[data-service-editor]').hidden,false);
 assert.equal(d.querySelector('[data-service-approval]').checked,false);
 dom.window.close();
});

test('View / Edit saves approval and pricing per salon, and Cancel discards changes',async()=>{
 const page=await servicesPage();const {w,d,dom,errors}=page;
 editService(page);
 d.querySelector('[data-service-approval]').click();
 d.querySelector('[data-service-editor-close]').click();
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.requiresApproval('bitcoin-nail-bar-houston','polish-change'),false);
 editService(page);assert.equal(d.querySelector('[data-service-approval]').checked,false);
 d.querySelector('[data-service-approval]').click();
 d.querySelector('[data-service-edit-price]').value='18';saveService(page);
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.requiresApproval('bitcoin-nail-bar-houston','polish-change'),true);
 assert.equal(d.querySelector('[data-salon-service-row="polish-change"] [data-inline-field="price"]').value,'18');
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.requiresApproval('elite','polish-change'),false);
 editService(page);
 assert.equal(d.querySelector('[data-service-approval]').checked,true);
 d.querySelector('[data-service-approval]').click();saveService(page);
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.requiresApproval('bitcoin-nail-bar-houston','polish-change'),false);
 assert.deepEqual(errors,[]);dom.window.close();
});

test('inline add, update and remove services persist only after Save',async()=>{
 const page=await servicesPage();const {w,d,dom}=page;
 const before=w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',serviceFixture.categories);
 d.querySelector('[data-service-add="nails"]').click();
 const row=d.querySelector('.settings-service-row.is-draft');
 for(const [field,value] of [['name','Nail repair'],['price','12'],['durationMin','15']]){const input=row.querySelector('[data-inline-field="'+field+'"]');input.value=value;input.dispatchEvent(new w.Event('input',{bubbles:true}));}
 assert.deepEqual(w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',serviceFixture.categories),before);
 d.querySelector('[data-services-save]').click();
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',[])[0].services.length,2);
 w.confirm=()=>false;d.querySelector('[data-service-remove="polish-change"]').click();assert.ok(d.querySelector('[data-salon-service-row="polish-change"]'));
 w.confirm=()=>true;d.querySelector('[data-service-remove="polish-change"]').click();d.querySelector('[data-services-save]').click();
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',[])[0].services.length,1);
 dom.window.close();
});

test('category manager supports draft cancel, add, rename, reorder and save',async()=>{
 const page=await servicesPage();const {w,d,dom}=page;
 d.querySelector('[data-categories-open]').click();d.querySelector('[data-category-add]').click();
 d.querySelector('[data-category-close]').click();
 assert.equal(d.querySelectorAll('[data-service-category]').length,2);
 d.querySelector('[data-categories-open]').click();d.querySelector('[data-category-add]').click();
 const input=d.querySelector('[data-category-list] .is-draft input');input.value='Waxing';input.dispatchEvent(new w.Event('input',{bubbles:true}));
 const drag=d.querySelector('[data-category-list] .is-draft [data-category-drag]');
 drag.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowUp',altKey:true,bubbles:true}));
 d.querySelector('[data-category-save]').click();
 assert.deepEqual(Array.from(d.querySelectorAll('.settings-service-category-name')).map(c=>c.textContent),['Nails','Waxing','Other services']);
 d.querySelector('[data-categories-open]').click();const rename=d.querySelector('[data-category-name="nails"]');rename.value='Manicure';rename.dispatchEvent(new w.Event('input',{bubbles:true}));d.querySelector('[data-category-save]').click();
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',[])[0].name,'Manicure');dom.window.close();
});

test('Edit Service saves categories, status, details and tags without losing approval',async()=>{
 const page=await servicesPage();const {w,d,dom}=page;
 editService(page);
 d.querySelector('[data-service-edit-categories]').tomselect.addItem('custom-service-settings');
 d.querySelector('[data-service-edit-active]').checked=false;
 d.querySelector('[data-service-edit-description]').value='Gentle polish removal.';
 d.querySelector('[data-service-edit-fee]').value='0.2';
 const tags=d.querySelector('[data-service-edit-tags]');tags.value='Nails';tags.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 d.querySelector('[data-service-approval]').checked=true;saveService(page);
 const categories=w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',[]);
 const services=categories.flatMap(c=>c.services).filter(s=>s.id==='polish-change');
 assert.equal(services.length,2);assert.equal(services[0].active,false);assert.equal(services[0].supplyFee,0.2);assert.equal(services[0].description,'Gentle polish removal.');assert.equal(services[0].tags[0],'Nails');
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.requiresApproval('bitcoin-nail-bar-houston','polish-change'),true);dom.window.close();
});

test('invalid edits and storage errors keep the editor open without saving approval',async()=>{
 const page=await servicesPage();const {w,d,dom}=page;
 editService(page);d.querySelector('[data-service-edit-price]').value='-5';d.querySelector('[data-service-approval]').checked=true;saveService(page);
 assert.equal(d.querySelector('[data-service-edit-error]').hidden,false);
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.requiresApproval('bitcoin-nail-bar-houston','polish-change'),false);
 d.querySelector('[data-service-edit-price]').value='15';
 w.Storage.prototype.setItem=()=>{throw new Error('Storage full');};saveService(page);
 assert.equal(d.querySelector('[data-service-editor]').hidden,false);assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.requiresApproval('bitcoin-nail-bar-houston','polish-change'),false);
 dom.window.close();
});

test('saving the real menu works when source services have no duration',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);
 const catalog=require('../assets/appointment-service-catalog.js').normalize(require('../menu/menu.json'));
 const page=boot(catalog);await new Promise(resolve=>page.w.setTimeout(resolve,0));
 page.d.querySelector('[data-services-save]').click();assert.equal(page.d.querySelector('[data-approval-status]').textContent,'Saved.');page.dom.window.close();
});

test('saving the service catalog preserves previously saved approval selections',async()=>{
 const page=await servicesPage();const {w,d,dom}=page;
 w.localStorage.setItem('nexora:service-approval:v1:bitcoin-nail-bar-houston','["polish-change"]');
 d.querySelector('[data-services-save]').click();editService(page);
 assert.equal(d.querySelector('[data-service-approval]').checked,true);
 d.querySelector('[data-service-editor-close]').click();
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',[])[0].services[0].id,'polish-change');
 dom.window.close();
});

test('category dropdown selects multiple categories, restores saved values and rejects empty selection',async()=>{
 const page=await servicesPage();const {d,w,dom}=page;
 editService(page);
 const select=d.querySelector('[data-service-edit-categories]');
 assert.ok(select.tomselect,'Categories uses Tom Select');
 const picker=select.tomselect;
 picker.refreshOptions(false);picker.open();
 const option=picker.dropdown.querySelector('[data-value="custom-service-settings"]');
 assert.ok(option.querySelector('input[type="checkbox"]'));
 option.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 saveService(page);
 assert.equal(w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',[]).filter(c=>c.services.some(s=>s.id==='polish-change')).length,2);
 editService(page);
 assert.deepEqual(Array.from(select.selectedOptions,o=>o.value),['nails','custom-service-settings']);
 select.tomselect.clear();saveService(page);
 assert.equal(d.querySelector('[data-service-editor]').hidden,false);
 assert.equal(d.querySelector('[data-service-edit-error]').textContent,'Select at least one category.');
 d.querySelector('[data-service-editor-close]').click();editService(page);
 assert.deepEqual(Array.from(select.selectedOptions,o=>o.value),['nails','custom-service-settings']);
 assert.equal(d.querySelectorAll('.salon-category-select .ts-wrapper').length,1);
 dom.window.close();
});

const detailImage='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1kAAAAASUVORK5CYII=';
function imageFile(w) {return new w.File([Uint8Array.from(Buffer.from(detailImage.split(',')[1],'base64'))],'step.png',{type:'image/png'});}

function uploadStep(page,card,file) {
 const input=card.querySelector('[data-step-image-file]');
 Object.defineProperty(input,'files',{configurable:true,value:[file]});input.dispatchEvent(new page.w.Event('change',{bubbles:true}));
}
async function settle(page) {await new Promise(resolve=>page.w.setTimeout(resolve,40));}
function storedService(page) {return page.w.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog('bitcoin-nail-bar-houston',[])[0].services[0];}
test('steps default to one, add and remove without losing edits, and save separately from materials',async()=>{
 const page=await servicesPage();const {d,dom}=page;editService(page);
 assert.equal(d.querySelectorAll('[data-service-step]').length,1);
 const first=d.querySelector('[data-service-step]');first.querySelector('[data-step-title]').value='Prepare';first.querySelector('[data-step-description]').innerHTML='<b>Clean nails</b>';
 d.querySelector('[data-step-add]').click();const second=d.querySelectorAll('[data-service-step]')[1];second.querySelector('[data-step-title]').value='Polish';
 d.querySelector('[data-service-materials]').innerHTML='<ul><li>Base coat</li></ul>';
 d.querySelector('[data-service-edit-categories]').tomselect.addItem('custom-service-settings');saveService(page);
 assert.equal(storedService(page).steps.length,2);assert.equal(storedService(page).steps[0].title,'Prepare');assert.equal(storedService(page).materialsHtml,'<ul><li>Base coat</li></ul>');
 editService(page);d.querySelector('[data-step-remove]').click();assert.equal(d.querySelector('[data-step-title]').value,'Polish');assert.equal(d.querySelector('[data-step-number]').textContent,'Step 1');
 d.querySelector('[data-service-editor-close]').click();editService(page);assert.equal(d.querySelectorAll('[data-service-step]').length,2);
 d.querySelector('[data-step-remove]').click();d.querySelector('[data-step-remove]').click();assert.equal(d.querySelectorAll('[data-service-step]').length,1);assert.equal(d.querySelector('[data-step-title]').value,'');
 saveService(page);assert.equal(storedService(page).steps.length,1);dom.window.close();
});
test('legacy rich text and images migrate into Step 1 once, with no loss or resurrection after clearing',async()=>{
 const legacy='<p><b>Old instructions</b></p><img src="'+detailImage+'" width="160">';
 const page=boot({categories:[{id:'nails',name:'Nails',services:[{...serviceFixture.categories[0].services[0],detailsHtml:legacy}]}]});await settle(page);editService(page);
 assert.match(page.d.querySelector('[data-step-description]').innerHTML,/Old instructions/);assert.ok(page.d.querySelector('[data-step-description] img'));
 assert.equal(page.d.querySelector('[data-service-materials]').innerHTML,'');saveService(page);
 assert.equal(storedService(page).detailsHtml,undefined);
 editService(page);page.d.querySelector('[data-step-description]').innerHTML='';saveService(page);editService(page);assert.equal(page.d.querySelector('[data-step-description]').innerHTML,'');page.dom.window.close();
});
test('step image uploads persist on the correct step and discard late reads for deleted steps or closed forms',async()=>{
 const page=await servicesPage();const {d,w,dom}=page;editService(page);d.querySelector('[data-step-add]').click();
 const cards=d.querySelectorAll('[data-service-step]');uploadStep(page,cards[1],imageFile(w));await settle(page);
 assert.equal(cards[0].querySelector('[data-step-image-preview] img'),null);assert.equal(cards[1].querySelector('img').src,detailImage);
 saveService(page);assert.equal(storedService(page).steps[1].image,detailImage);editService(page);
 d.querySelectorAll('[data-step-image-remove]')[1].click();saveService(page);assert.equal(storedService(page).steps[1].image,'');
 editService(page);const removed=d.querySelector('[data-service-step]');uploadStep(page,removed,imageFile(w));removed.querySelector('[data-step-remove]').click();await settle(page);assert.equal(d.querySelector('[data-step-image-preview] img'),null);
 uploadStep(page,d.querySelector('[data-service-step]'),imageFile(w));d.querySelector('[data-service-editor-close]').click();editService(page);await settle(page);assert.equal(d.querySelector('[data-step-image-preview] img'),null);dom.window.close();
});
test('invalid images and storage failures keep drafts, and rich content is sanitized',async()=>{
 const page=await servicesPage();const {d,w,dom}=page;editService(page);const card=d.querySelector('[data-service-step]');
 uploadStep(page,card,new w.File(['invalid'],'bad.svg',{type:'image/svg+xml'}));assert.match(d.querySelector('[data-service-edit-error]').textContent,/10MB/);
 uploadStep(page,card,new w.File(['broken'],'bad.png',{type:'image/png'}));await settle(page);assert.match(d.querySelector('[data-service-edit-error]').textContent,/read/);
 card.querySelector('[data-step-description]').innerHTML='<p onclick="x()">Clean<script>x()</script></p>';d.querySelector('[data-service-materials]').innerHTML='<b>Polish</b><img src="https://bad.test/a.png">';saveService(page);
 assert.equal(storedService(page).steps[0].descriptionHtml,'<p>Clean</p>');assert.equal(storedService(page).materialsHtml,'<b>Polish</b>');
 editService(page);d.querySelector('[data-step-title]').value='Keep draft';w.Storage.prototype.setItem=()=>{throw new Error('full');};saveService(page);assert.equal(d.querySelector('[data-service-editor]').hidden,false);assert.equal(d.querySelector('[data-step-title]').value,'Keep draft');dom.window.close();
});
