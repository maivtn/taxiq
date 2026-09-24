import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const SOURCE_DIR = new URL('../../../html/pages/', import.meta.url);

function boot(serviceCatalog = null){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(readFileSync(new URL('./pos-salon-settings.html', SOURCE_DIR),'utf8'),{url:'https://example.test/pages/pos-salon-settings.html',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 w.eval(readFileSync(new URL('../assets/salon-data.js', SOURCE_DIR),'utf8'));
 const data=w.NEXORA_SALON_DATA.loadCatalog();data.technicians=Array.from({length:12},(_,i)=>({id:'staff-'+i,name:'Staff '+i,phone:'5551234567',active:true}));w.NEXORA_SALON_DATA.saveCatalog(data);
 w.eval(readFileSync(new URL('../assets/service-approval-settings.js', SOURCE_DIR),'utf8'));
 w.NEXORA_APPOINTMENT_SERVICE_CATALOG={load:()=>serviceCatalog ? Promise.resolve(serviceCatalog) : new Promise(()=>{})};
 }});
 dom.window.eval(readFileSync(new URL('../assets/pos-salon-settings.js', SOURCE_DIR),'utf8'));
 dom.window.eval(readFileSync(new URL('../assets/vendor/tom-select/tom-select.complete.min.js', SOURCE_DIR),'utf8'));
 dom.window.eval(readFileSync(new URL('../assets/pos-salon-services.js', SOURCE_DIR),'utf8'));
 dom.window.eval(readFileSync(new URL('../assets/pos-salon-sms-settings.js', SOURCE_DIR),'utf8'));
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
 const source=new JSDOM(readFileSync(new URL('./pos-staff.html', SOURCE_DIR),'utf8'));
 const original=source.window.document.querySelector('[data-tech-modal]');
 const template=new JSDOM(readFileSync(new URL('./pos-salon-settings.html', SOURCE_DIR),'utf8'));
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
 const catalog=require('../../../html/assets/appointment-service-catalog.js').normalize(require('../../../html/menu/menu.json'));
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
 const first=d.querySelector('[data-service-step]');first.querySelector('[data-step-title]').value='Prepare';first.querySelector('[data-step-description]').value='Clean nails\nApply <base> & polish';
 assert.equal(first.querySelector('[data-step-description]').tagName,'TEXTAREA');assert.equal(first.querySelector('[data-rich-command]'),null);
 d.querySelector('[data-step-add]').click();const second=d.querySelectorAll('[data-service-step]')[1];second.querySelector('[data-step-title]').value='Polish';
 d.querySelector('[data-service-materials]').innerHTML='<ul><li>Base coat</li></ul>';
 d.querySelector('[data-service-edit-categories]').tomselect.addItem('custom-service-settings');saveService(page);
 assert.equal(storedService(page).steps[0].description,'Clean nails\nApply <base> & polish');assert.equal(storedService(page).steps.length,2);assert.equal(storedService(page).steps[0].title,'Prepare');assert.equal(storedService(page).materialsHtml,'<ul><li>Base coat</li></ul>');
 editService(page);assert.equal(d.querySelector('[data-step-description]').value,'Clean nails\nApply <base> & polish');d.querySelector('[data-step-remove]').click();assert.equal(d.querySelector('[data-step-title]').value,'Polish');assert.equal(d.querySelector('[data-step-drag]').getAttribute('aria-label'),'Reorder step 1');
 d.querySelector('[data-service-editor-close]').click();editService(page);assert.equal(d.querySelectorAll('[data-service-step]').length,2);
 d.querySelector('[data-step-remove]').click();d.querySelector('[data-step-remove]').click();assert.equal(d.querySelectorAll('[data-service-step]').length,1);assert.equal(d.querySelector('[data-step-title]').value,'');
 saveService(page);assert.equal(storedService(page).steps.length,1);dom.window.close();
});
test('legacy rich text and images migrate into Step 1 once, with no loss or resurrection after clearing',async()=>{
 const legacy='<p><b>Old instructions</b></p><img src="'+detailImage+'" width="160">';
 const page=boot({categories:[{id:'nails',name:'Nails',services:[{...serviceFixture.categories[0].services[0],detailsHtml:legacy}]}]});await settle(page);editService(page);
 assert.equal(page.d.querySelector('[data-step-description]').value,'Old instructions');
 assert.equal(page.d.querySelector('[data-service-materials]').innerHTML,'');saveService(page);
 assert.equal(storedService(page).detailsHtml,undefined);assert.match(storedService(page).steps[0].legacyDescriptionHtml,/img/);
 editService(page);page.d.querySelector('[data-step-description]').value='';saveService(page);editService(page);assert.equal(page.d.querySelector('[data-step-description]').value,'');page.dom.window.close();
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
 card.querySelector('[data-step-description]').value='<p onclick="x()">Clean<script>x()</script></p>';d.querySelector('[data-service-materials]').innerHTML='<b>Polish</b><img src="https://bad.test/a.png">';saveService(page);
 assert.equal(storedService(page).steps[0].description,'<p onclick="x()">Clean<script>x()</script></p>');assert.equal(storedService(page).materialsHtml,'<b>Polish</b>');
 editService(page);d.querySelector('[data-step-title]').value='Keep draft';w.Storage.prototype.setItem=()=>{throw new Error('full');};saveService(page);assert.equal(d.querySelector('[data-service-editor]').hidden,false);assert.equal(d.querySelector('[data-step-title]').value,'Keep draft');dom.window.close();
});

test('step camera button opens its camera input and saves the photo to the correct step',async()=>{
 const page=await servicesPage();const {d,w,dom}=page;editService(page);d.querySelector('[data-step-add]').click();
 const cards=d.querySelectorAll('[data-service-step]'),card=cards[1],camera=card.querySelector('[data-step-image-camera]');
 assert.ok(camera,'Camera input exists');assert.equal(camera.getAttribute('capture'),'environment');assert.equal(card.querySelector('[data-step-image-file]').hasAttribute('capture'),false);
 let opened=false;camera.addEventListener('click',()=>{opened=true;});card.querySelector('[data-step-image-take]').click();assert.equal(opened,true);
 Object.defineProperty(camera,'files',{value:[imageFile(w)]});camera.dispatchEvent(new w.Event('change',{bubbles:true}));await settle(page);
 assert.equal(cards[0].querySelector('img'),null);assert.equal(card.querySelector('img').src,detailImage);saveService(page);assert.equal(storedService(page).steps[1].image,detailImage);dom.window.close();
});


test('step handles reorder complete cards, persist the order and cancel draft moves',async()=>{
 const page=await servicesPage();const {d,w,dom}=page;editService(page);
 d.querySelector('[data-step-title]').value='First';d.querySelector('[data-step-description]').value='First description';
 uploadStep(page,d.querySelector('[data-service-step]'),imageFile(w));await settle(page);
 d.querySelector('[data-step-add]').click();d.querySelectorAll('[data-step-title]')[1].value='Second';
 d.querySelector('[data-step-add]').click();d.querySelectorAll('[data-step-title]')[2].value='Third';
 d.querySelector('[data-service-materials]').innerHTML='<b>Materials</b>';
 const cards=Array.from(d.querySelectorAll('[data-service-step]'));
 assert.equal(d.querySelector('[data-step-number]'),null);
 const handle=cards[0].querySelector('[data-step-drag]');assert.ok(handle);
 handle.dispatchEvent(new w.Event('dragstart',{bubbles:true,cancelable:true}));
 cards[2].dispatchEvent(new w.MouseEvent('dragover',{bubbles:true,cancelable:true,clientY:1}));
 cards[2].dispatchEvent(new w.MouseEvent('drop',{bubbles:true,cancelable:true,clientY:1}));
 assert.deepEqual(Array.from(d.querySelectorAll('[data-step-title]'),el=>el.value),['Second','Third','First']);
 assert.equal(cards[0].querySelector('[data-step-description]').value,'First description');assert.equal(cards[0].querySelector('img').src,detailImage);
 saveService(page);assert.deepEqual(Array.from(storedService(page).steps,s=>s.title),['Second','Third','First']);
 editService(page);const last=d.querySelectorAll('[data-step-drag]')[2];last.dispatchEvent(new w.KeyboardEvent('keydown',{bubbles:true,altKey:true,key:'ArrowUp'}));
 assert.deepEqual(Array.from(d.querySelectorAll('[data-step-title]'),el=>el.value),['Second','First','Third']);
 d.querySelector('[data-service-editor-close]').click();editService(page);
 assert.deepEqual(Array.from(d.querySelectorAll('[data-step-title]'),el=>el.value),['Second','Third','First']);
 const current=Array.from(d.querySelectorAll('[data-service-step]'));
 current[2].querySelector('[data-step-drag]').dispatchEvent(new w.Event('dragstart',{bubbles:true,cancelable:true}));
 current[0].dispatchEvent(new w.MouseEvent('drop',{bubbles:true,cancelable:true,clientY:-1}));
 assert.deepEqual(Array.from(d.querySelectorAll('[data-step-title]'),el=>el.value),['First','Second','Third']);
 d.querySelector('[data-step-drag]').dispatchEvent(new w.KeyboardEvent('keydown',{bubbles:true,altKey:true,key:'ArrowUp'}));
 assert.equal(d.querySelector('[data-step-title]').value,'First');
 assert.equal(d.querySelector('[data-service-materials]').innerHTML,'<b>Materials</b>');dom.window.close();
});

function smsPage(){
 const page=boot();
 page.d.querySelector('[data-settings-tab="sms"]').click();
 return page;
}

test('SMS Settings separates Welcome, After Checkout, Wait Care and Automation setup sections',()=>{
 const {dom,d,errors}=smsPage();
 assert.equal(d.querySelector('[data-settings-panel="sms"]').hidden,false);
 assert.deepEqual(Array.from(d.querySelectorAll('[data-sms-tab]'),b=>b.dataset.smsTab),['welcome','after','wait-care','automation','links']);
 assert.deepEqual(Array.from(d.querySelectorAll('[data-sms-tab]'),b=>b.textContent),['Welcome SMS','After Checkout','Wait Care','Automation Settings','Link Settings']);
 assert.equal(d.querySelector('[data-sms-tab].active')?.dataset.smsTab,'welcome');
 assert.equal(d.querySelector('[data-sms-panel="welcome"]').hidden,false);
 assert.equal(d.querySelector('[data-sms-panel="automation"]').hidden,true);
 d.querySelector('[data-sms-tab="wait-care"]').click();
 assert.equal(d.querySelector('[data-sms-panel="wait-care"]').hidden,false);
 assert.equal(d.querySelector('[data-sms-panel="automation"]').hidden,true);
 d.querySelector('[data-sms-tab="automation"]').click();
 assert.equal(d.querySelector('[data-sms-tab].active')?.dataset.smsTab,'automation');
 assert.equal(d.querySelector('[data-sms-panel="automation"]').hidden,false);
 assert.equal(d.querySelector('[data-sms-panel="welcome"]').hidden,true);
 d.querySelector('[data-sms-tab="after"]').click();
 assert.equal(d.querySelector('[data-sms-panel="after"]').hidden,false);
 const links=d.querySelector('[data-sms-panel="links"]');
 assert.equal(links.hidden,true);
 d.querySelector('[data-sms-tab="links"]').click();
 assert.equal(links.hidden,false);
 assert.equal(d.querySelector('[data-sms-panel="after"]').hidden,true);
 assert.ok(links.querySelector('[data-sms-field="visitLinkValidity"]'));
 d.querySelector('[data-sms-tab="welcome"]').click();
 assert.equal(links.hidden,true);
 assert.deepEqual(errors,[]);dom.window.close();
});

test('Welcome SMS Setup live-updates its preview on edit, template change and token insert',()=>{
 const {dom,w,d,errors}=smsPage();
 d.querySelector('[data-sms-tab="welcome"]').click();
 const textarea=d.querySelector('[data-sms-field="welcomeMessage"]');
 const preview=d.querySelector('[data-sms-preview="welcomeMessage"]');
 const templates=Array.from(d.querySelectorAll('[data-sms-template="welcome"]'));
 assert.deepEqual(templates.map(button=>button.dataset.templateKey),['welcome','check-in']);
 assert.deepEqual(templates.map(button=>button.querySelector('.sms-template-card-title').textContent),['Welcome message','Check-in confirmed']);
 assert.equal(templates.find(button=>button.dataset.templateKey==='welcome').getAttribute('aria-pressed'),'true');
 assert.ok(textarea.closest('[data-sms-composer]'));
 assert.ok(textarea.closest('[data-sms-composer]').querySelector('[data-sms-insert-token="[OneQR Link]"]'));
 assert.ok(textarea.closest('[data-sms-composer]').querySelector('[data-sms-insert-token="[Salon Phone]"]'));
 assert.match(preview.textContent,/welcome to Bitcoin Nail Bar/);
 templates.find(button=>button.dataset.templateKey==='check-in').click();
 assert.match(textarea.value,/you\'re checked in at \[Salon Name\]/);
 assert.match(preview.textContent,/you\'re checked in at Bitcoin Nail Bar/);
 textarea.value='Hi there';textarea.dispatchEvent(new w.Event('input'));
 assert.equal(preview.textContent,'Hi there');
 d.querySelector('[data-sms-target="welcomeMessage"][data-sms-insert-token="[Salon Name]"]').click();
 assert.equal(textarea.value,'Hi there [Salon Name]');
 assert.equal(preview.textContent,'Hi there Bitcoin Nail Bar');
 textarea.value='Call us: ';textarea.setSelectionRange(9,9);
 d.querySelector('[data-sms-target="welcomeMessage"][data-sms-insert-token="[Salon Phone]"]').click();
 assert.equal(textarea.value,'Call us: [Salon Phone]');
 assert.equal(preview.textContent,'Call us: (713) 555-0123');
 assert.deepEqual(errors,[]);dom.window.close();
});

test('After Checkout Setup preview mirrors edits to the Thank You message',()=>{
 const {dom,w,d,errors}=smsPage();
 d.querySelector('[data-sms-tab="after"]').click();
 const textarea=d.querySelector('[data-sms-field="afterMessage"]');
 const preview=d.querySelector('[data-sms-preview="afterMessage"]');
 const templates=Array.from(d.querySelectorAll('[data-sms-template="after"]'));
 assert.equal(d.querySelector('[data-sms-panel="after"] .sms-phone-menu'),null);
 assert.equal(preview.nextElementSibling.hidden,true);
 assert.deepEqual(templates.map(button=>button.dataset.templateKey),['ticket-receipt','review','tip','feedback','rewards','booking']);
 for(const token of ['[Receipt Link]','[Review Link]','[Tip Link]','[Feedback Link]','[Rewards Link]','[Booking Link]']){
  assert.ok(templates.some(button=>button.textContent.includes(token)),token+' is represented by a quick template');
 }
 assert.equal(templates[0].getAttribute('aria-pressed'),'true');
 assert.equal(preview.textContent,'Thanks for visiting Bitcoin Nail Bar! Ticket #12: $45.00. Receipt: nexora.app/r/demo');
 templates.find(button=>button.dataset.templateKey==='feedback').click();
 assert.equal(textarea.value,'Thanks for visiting [Salon Name]! Share private feedback: [Feedback Link]');
 assert.equal(preview.textContent,'Thanks for visiting Bitcoin Nail Bar! Share private feedback: nexora.app/feedback/demo');
 assert.equal(templates.find(button=>button.dataset.templateKey==='feedback').getAttribute('aria-pressed'),'true');
 const insertBar=textarea.closest('[data-sms-composer]');
 assert.equal(insertBar.querySelector('[data-sms-insert-token="[Customer Name]"]'),null);
 assert.deepEqual(Array.from(insertBar.querySelectorAll('[data-sms-insert-token]'),button=>button.dataset.smsInsertToken),[
  '[Salon Name]','[Ticket Number]','[Ticket Total]','[Review Link]','[Tip Link]','[Feedback Link]','[Rewards Link]','[Booking Link]','[Receipt Link]'
 ]);
 assert.equal(insertBar.querySelector('[data-sms-insert-token="[OneQR Link]"]'),null);
 textarea.value='See you soon, [Customer Name]!';textarea.dispatchEvent(new w.Event('input'));
 assert.equal(preview.textContent,'See you soon, Sarah!');
 textarea.setSelectionRange(4,7);
 insertBar.querySelector('[data-sms-insert-token="[Receipt Link]"]').click();
 assert.equal(textarea.value,'See [Receipt Link] soon, [Customer Name]!');
 assert.equal(preview.textContent,'See nexora.app/r/demo soon, Sarah!');
 assert.equal(d.querySelector('[data-sms-count="afterMessage"]').textContent,'34 chars — ~1 SMS (GSM-7)');
 assert.equal(d.activeElement,textarea);
 assert.equal(textarea.selectionStart,18);
 textarea.value='Review: ';textarea.setSelectionRange(8,8);
 insertBar.querySelector('[data-sms-insert-token="[Review Link]"]').click();
 assert.equal(textarea.value,'Review: [Review Link]');
 assert.equal(preview.textContent,'Review: nexora.app/review/demo');
 assert.deepEqual(errors,[]);dom.window.close();
});

test('Wait Care tab contains only its SMS setup and no benefit rules',()=>{
 const {dom,w,d,errors}=smsPage();
 d.querySelector('[data-sms-tab="wait-care"]').click();
 const waitCarePanel=d.querySelector('[data-sms-panel="wait-care"]');
 assert.deepEqual(Array.from(waitCarePanel.querySelectorAll(':scope > .sms-columns > .sms-card'),card=>card.querySelector('h3').textContent),['Wait Care Setup','Wait Care preview']);
 const waitCareSetup=waitCarePanel.querySelector('[data-sms-field="waitCareMessage"]').closest('.sms-card');
 const waitCareToggle=waitCareSetup.querySelector('[data-sms-wait-care-enabled]').closest('.settings-toggle-row');
 assert.equal(waitCareSetup.querySelector('h3').nextElementSibling,waitCareToggle);
 assert.ok(waitCareSetup.querySelector('[data-sms-action="save-wait-care"]'));
 assert.equal(waitCarePanel.querySelectorAll('[data-sms-action="save-wait-care"]').length,1);
 assert.equal(waitCarePanel.querySelector('.sms-automation-message-grid'),null);
 assert.equal(waitCarePanel.querySelector('[data-sms-field^="careRule"]'),null);
 assert.equal(waitCarePanel.textContent.includes('Wait Care rules'),false);
 d.querySelector('[data-sms-tab="automation"]').click();
 const automationPanel=d.querySelector('[data-sms-panel="automation"]');
 const waitlistTimingHeading=Array.from(automationPanel.querySelectorAll('h3,h4')).find(heading=>heading.textContent==='Waitlist timing');
 assert.ok(waitlistTimingHeading);
 assert.equal(Array.from(automationPanel.querySelectorAll('h3,h4'),heading=>heading.textContent).some(text=>text.includes('Wait Care')),false);
 assert.equal(Array.from(automationPanel.querySelectorAll('.settings-label'),label=>label.textContent).includes('Welcome SMS'),false);
 assert.equal(Array.from(automationPanel.querySelectorAll('.settings-label'),label=>label.textContent).includes('Welcome wait time'),false);
 assert.deepEqual(Array.from(waitlistTimingHeading.nextElementSibling.querySelectorAll('.settings-label'),label=>label.textContent),[
  'Return notice','No response grace','Internal ETA threshold'
 ]);
 d.querySelector('[data-sms-tab="wait-care"]').click();
 const textarea=d.querySelector('[data-sms-field="waitCareMessage"]');
 const preview=d.querySelector('[data-sms-preview="waitCareMessage"]');
 const templates=Array.from(d.querySelectorAll('[data-sms-template="wait-care"]'));
 const enabled=d.querySelector('[data-sms-wait-care-enabled][role="switch"]');
 assert.ok(enabled);assert.equal(enabled.getAttribute('aria-checked'),'true');
 enabled.click();assert.equal(enabled.getAttribute('aria-checked'),'false');
 enabled.click();assert.equal(enabled.getAttribute('aria-checked'),'true');
 assert.ok(d.querySelector('[data-sms-field="waitCareSendMode"]'));
 assert.deepEqual(templates.map(button=>button.dataset.templateKey),['visit-preparation','comfort-check-in']);
 assert.equal(templates.filter(button=>button.textContent.includes('sorry')).length,0);
 assert.equal(templates.find(button=>button.dataset.templateKey==='visit-preparation').getAttribute('aria-pressed'),'true');
 assert.deepEqual(Array.from(textarea.closest('[data-sms-composer]').querySelectorAll('[data-sms-insert-token]'),button=>button.dataset.smsInsertToken),[
  '[Customer Name]','[Salon Name]','[Wait Time]','[Wait Care Benefit]','[OneQR Link]'
 ]);
 assert.equal(preview.textContent,'Hi Sarah, thanks for waiting at Bitcoin Nail Bar. Follow your visit: nexora.app/q/demo');
 templates.find(button=>button.dataset.templateKey==='comfort-check-in').click();
 assert.equal(textarea.value,'Hi [Customer Name], we\'re checking in while you wait at [Salon Name]. Need anything to feel more comfortable? Please let our team know.');
 assert.equal(preview.textContent,'Hi Sarah, we\'re checking in while you wait at Bitcoin Nail Bar. Need anything to feel more comfortable? Please let our team know.');
 textarea.value='Benefit: ';textarea.setSelectionRange(9,9);
 textarea.closest('[data-sms-composer]').querySelector('[data-sms-insert-token="[Wait Care Benefit]"]').click();
 assert.equal(textarea.value,'Benefit: [Wait Care Benefit]');
 assert.equal(preview.textContent,'Benefit: a complimentary hot-stone upgrade');
 textarea.value='x'.repeat(161);textarea.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelector('[data-sms-count="waitCareMessage"]').textContent,'161 chars — ~2 SMS (GSM-7)');
 d.querySelector('[data-sms-action="save-wait-care"]').click();
 assert.equal(d.querySelector('[data-sms-status]').textContent,'Wait Care settings saved.');
 assert.deepEqual(errors,[]);dom.window.close();
});

test('one shared visit-link expiry updates every OneQR preview and excludes receipt links',()=>{
 const {dom,w,d,errors}=smsPage();
 const select=d.querySelector('[data-sms-field="visitLinkValidity"]');
 assert.ok(select);
 assert.deepEqual(Array.from(select.options,option=>option.value),['1 day after checkout','2 days after checkout','7 days after checkout','30 days after checkout']);
 assert.equal(d.querySelectorAll('[data-sms-panel]:not([data-sms-panel="links"]) select[data-sms-field$="LinkValidity"]').length,0);
 select.value='2 days after checkout';select.dispatchEvent(new w.Event('change'));
 for(const field of ['welcomeLinkValidity','waitCareLinkValidity','returnSoonLinkValidity','readyNowLinkValidity']){
  const preview=d.querySelector(`[data-sms-link-validity-preview="${field}"]`);
  assert.equal(preview.hidden,false);assert.match(preview.textContent,/2 days after checkout/);
 }
 const afterCaption=d.querySelector('[data-sms-link-validity-preview="afterLinkValidity"]');
 assert.equal(afterCaption.hidden,true);
 const after=d.querySelector('[data-sms-field="afterMessage"]');
 after.value='Your visit: [OneQR Link]';after.dispatchEvent(new w.Event('input'));
 assert.equal(afterCaption.hidden,false);assert.match(afterCaption.textContent,/2 days after checkout/);
 assert.deepEqual(errors,[]);dom.window.close();
});

test('Automation Settings configures Return Soon and Ready Now messages',()=>{
 const {dom,w,d,errors}=smsPage();
 d.querySelector('[data-sms-tab="automation"]').click();
 const panel=d.querySelector('[data-sms-panel="automation"]');
 const returnTextarea=panel.querySelector('[data-sms-field="returnSoonMessage"]');
 const readyTextarea=panel.querySelector('[data-sms-field="readyNowMessage"]');
 const returnPreview=panel.querySelector('[data-sms-preview="returnSoonMessage"]');
 const readyPreview=panel.querySelector('[data-sms-preview="readyNowMessage"]');
 assert.ok(returnTextarea);assert.ok(readyTextarea);assert.ok(returnPreview);assert.ok(readyPreview);
 assert.deepEqual(Array.from(panel.querySelectorAll('[data-sms-template="return-soon"]'),button=>button.dataset.templateKey),['return-reminder','head-back']);
 assert.deepEqual(Array.from(panel.querySelectorAll('[data-sms-template="ready-now"]'),button=>button.dataset.templateKey),['ready-now','your-turn']);
 assert.ok(panel.querySelector('[data-sms-field="returnSoonSendMode"]'));
 assert.ok(panel.querySelector('[data-sms-field="readyNowSendMode"]'));
 assert.equal(panel.querySelectorAll('[data-sms-action="save-automation"]').length,1);
 assert.match(returnPreview.textContent,/coming up in 15 minutes/);
 const returnNotice=panel.querySelector('[data-sms-field="returnNotice"]');
 returnNotice.value='10 minutes before';returnNotice.dispatchEvent(new w.Event('change'));
 assert.match(returnPreview.textContent,/coming up in 10 minutes/);
 panel.querySelector('[data-sms-template="ready-now"][data-template-key="your-turn"]').click();
 assert.match(readyTextarea.value,/it\'s your turn at \[Salon Name\]/);
 assert.match(readyPreview.textContent,/it\'s your turn at Bitcoin Nail Bar/);
 assert.deepEqual(errors,[]);dom.window.close();
});

test('tablet SMS previews stay compact while mobile previews use the available width',()=>{
 const css=readFileSync(new URL('../assets/pos-salon-sms-settings.css', SOURCE_DIR),'utf8');
 assert.match(css,/@media \(min-width: 641px\) and \(max-width: 1180px\)[\s\S]*?\.sms-col-side\s*\{[\s\S]*?flex:\s*0 1 320px;[\s\S]*?max-width:\s*320px;/);
 assert.match(css,/@media \(max-width: 640px\)[\s\S]*?\.sms-col-side\s*\{[\s\S]*?flex:\s*1 1 100%;[\s\S]*?max-width:\s*none;/);
});

test('Pause automation toggles the Automation pill, and Save/Send actions post a status message',()=>{
 const {dom,d,errors}=smsPage();
 const pill=d.querySelector('[data-sms-automation-pill]');
 const pauseButton=d.querySelector('[data-sms-action="pause-automation"]');
 assert.equal(pill.textContent,'Waitlist automation ON');
 pauseButton.click();
 assert.equal(pill.textContent,'Waitlist automation OFF');
 assert.equal(pauseButton.textContent,'Resume automation');
 pauseButton.click();
 assert.equal(pill.textContent,'Waitlist automation ON');
 d.querySelector('[data-sms-action="save-automation"]').click();
 assert.equal(d.querySelector('[data-sms-status]').textContent,'Automation settings saved.');
 d.querySelector('[data-sms-tab="welcome"]').click();
 d.querySelector('[data-sms-action="save-welcome"]').click();
 assert.equal(d.querySelector('[data-sms-status]').textContent,'Welcome SMS settings saved.');
 assert.deepEqual(errors,[]);dom.window.close();
});

test('each Send Test action requires a valid recipient phone number',()=>{
 const {dom,d,errors}=smsPage();
 for(const [tab,action] of [['welcome','send-test-welcome'],['after','send-test-after'],['wait-care','send-test-wait-care'],['automation','send-test-return-soon'],['automation','send-test-ready-now']]){
  d.querySelector('[data-sms-tab="'+tab+'"]').click();
  const phone=d.querySelector('[data-sms-test-phone="'+action+'"]');
  const country=d.querySelector('[data-sms-test-country="'+action+'"]');
  const send=d.querySelector('[data-sms-action="'+action+'"]');
  assert.ok(phone);assert.ok(country);assert.equal(country.value,'+1');
  assert.deepEqual(Array.from(country.options,option=>option.value),['+1','+84']);
  assert.equal(phone.type,'tel');assert.equal(phone.value,'');
  send.click();
  assert.equal(d.querySelector('[data-sms-status]').textContent,'Enter a valid test phone number.');
  assert.equal(d.activeElement,phone);
  phone.value='713-555-0123';send.click();
  assert.equal(d.querySelector('[data-sms-status]').textContent,'Preview only for +1 (713) 555-0123 — no SMS was sent.');
 }
 const afterCountry=d.querySelector('[data-sms-test-country="send-test-after"]');
 const afterPhone=d.querySelector('[data-sms-test-phone="send-test-after"]');
 afterCountry.value='+84';afterPhone.value='0912345678';
 d.querySelector('[data-sms-action="send-test-after"]').click();
 assert.equal(d.querySelector('[data-sms-status]').textContent,'Preview only for +84 912 345 678 — no SMS was sent.');
 assert.deepEqual(errors,[]);dom.window.close();
});

const smsStorageKey='nexora:salon-sms-settings:v1:bitcoin-nail-bar-houston';
function reloadSms(w){w.eval(readFileSync(new URL('../assets/pos-salon-sms-settings.js', SOURCE_DIR),'utf8'));}

test('SMS saves each section independently and restores fields and switches after reload',()=>{
 const {dom,w,d}=smsPage();
 const welcome=d.querySelector('[data-sms-field="welcomeMessage"]');
 welcome.value='Welcome [Customer Name]!';
 const after=d.querySelector('[data-sms-field="afterMessage"]');after.value='Unsaved checkout';
 const toggle=d.querySelector('[data-sms-panel="welcome"] [role="switch"]');toggle.click();
 assert.equal(toggle.getAttribute('aria-checked'),'false');
 d.querySelector('[data-sms-action="save-welcome"]').click();
 assert.ok(w.localStorage.getItem(smsStorageKey));
 reloadSms(w);
 assert.equal(d.querySelector('[data-sms-field="welcomeMessage"]').value,'Welcome [Customer Name]!');
 assert.equal(d.querySelector('[data-sms-panel="welcome"] [role="switch"]').getAttribute('aria-checked'),'false');
 assert.notEqual(d.querySelector('[data-sms-field="afterMessage"]').value,'Unsaved checkout');
 for(const tab of ['after','wait-care','automation']){
  const section=d.querySelector(`[data-sms-panel="${tab}"]`);
  for(const field of section.querySelectorAll('select[data-sms-field]'))field.selectedIndex=1;
  section.querySelector(`[data-sms-action="save-${tab}"]`).click();
 }
 reloadSms(w);
 for(const tab of ['after','wait-care','automation']){
  for(const field of d.querySelectorAll(`[data-sms-panel="${tab}"] select[data-sms-field]`))assert.equal(field.selectedIndex,1,field.dataset.smsField);
 }
 dom.window.close();
});

test('SMS save failures retain drafts and never claim success',()=>{
 const {dom,w,d}=smsPage();
 const message=d.querySelector('[data-sms-field="welcomeMessage"]');message.value='Draft';
 const original=w.Storage.prototype.setItem;
 w.Storage.prototype.setItem=()=>{throw new Error('full');};
 d.querySelector('[data-sms-action="save-welcome"]').click();
 assert.match(d.querySelector('[data-sms-status]').textContent,/Could not save/);
 assert.equal(message.value,'Draft');
 w.Storage.prototype.setItem=original;
 w.localStorage.setItem(smsStorageKey,'{broken');reloadSms(w);
 d.querySelector('[data-sms-action="save-welcome"]').click();
 assert.equal(w.localStorage.getItem(smsStorageKey),'{broken');
 assert.match(d.querySelector('[data-sms-status]').textContent,/Could not/);
 dom.window.close();
});

test('SMS edits clear selected templates, hide unused link expiry and estimate rendered segments',()=>{
 const {dom,w,d}=smsPage();const message=d.querySelector('[data-sms-field="welcomeMessage"]');
 const count=d.querySelector('[data-sms-count="welcomeMessage"]');
 const edit=text=>{message.value=text;message.dispatchEvent(new w.Event('input'));};
 edit('Hi [Customer Name]');
 assert.equal(d.querySelectorAll('[data-sms-template="welcome"][aria-pressed="true"]').length,0);
 assert.match(count.textContent,/8 chars.*1 SMS.*GSM-7/);
 assert.equal(d.querySelector('[data-sms-field="visitLinkValidity"]').closest('.settings-field').hidden,false);
 assert.equal(d.querySelector('[data-sms-link-validity-preview="welcomeLinkValidity"]').hidden,true);
 edit('x'.repeat(307));assert.match(count.textContent,/3 SMS/);
 edit('ế'.repeat(71));assert.match(count.textContent,/2 SMS.*Unicode/);
 edit('^'.repeat(81));assert.match(count.textContent,/2 SMS.*GSM-7/);
 edit('😊'.repeat(67));assert.match(count.textContent,/3 SMS.*Unicode/);
 edit('');assert.match(count.textContent,/0 chars.*0 SMS/);
 d.querySelector('[data-sms-template="welcome"]').click();
 assert.equal(d.querySelector('[data-sms-link-validity-preview="welcomeLinkValidity"]').hidden,false);
 dom.window.close();
});

test('SMS rejects empty or unsupported messages and test sends are explicitly simulated',()=>{
 const {dom,w,d}=smsPage();const message=d.querySelector('[data-sms-field="welcomeMessage"]');
 const status=d.querySelector('[data-sms-status]');
 for(const value of ['', 'Hi [Unknown Field]']){
  message.value=value;d.querySelector('[data-sms-action="save-welcome"]').click();
  assert.match(status.textContent,/Enter a message|Unsupported field/);
  assert.equal(w.localStorage.getItem(smsStorageKey),null);
 }
 message.value='Welcome!';const phone=d.querySelector('[data-sms-test-phone="send-test-welcome"]');
 const send=d.querySelector('[data-sms-action="send-test-welcome"]');
 phone.value='abc7135550123';send.click();assert.match(status.textContent,/valid test phone/);
 phone.value='7135550123';send.click();assert.match(status.textContent,/Preview only.*no SMS was sent/);
 dom.window.close();
});


test('SMS switches persist independently and pausing waitlist does not pause Welcome',()=>{
 const {dom,w,d}=smsPage();
 for(const tab of ['after','wait-care']){
  const toggle=d.querySelector(`[data-sms-panel="${tab}"] [role="switch"]`);
  toggle.click();assert.equal(toggle.getAttribute('aria-checked'),'false');
  assert.equal(toggle.classList.contains('is-on'),false);
  d.querySelector(`[data-sms-action="save-${tab}"]`).click();
 }
 d.querySelector('[data-sms-action="pause-automation"]').click();
 d.querySelector('[data-sms-action="save-automation"]').click();reloadSms(w);
 for(const tab of ['after','wait-care'])assert.equal(d.querySelector(`[data-sms-panel="${tab}"] [role="switch"]`).getAttribute('aria-checked'),'false');
 assert.equal(d.querySelector('[data-sms-panel="welcome"] [role="switch"]').getAttribute('aria-checked'),'true');
 assert.equal(d.querySelector('[data-sms-automation-pill]').textContent,'Waitlist automation OFF');
 dom.window.close();
});


test('shared link expiry saves independently and survives other SMS saves',()=>{
 const {dom,w,d}=smsPage();
 const welcome=d.querySelector('[data-sms-field="welcomeMessage"]');welcome.value='Unsaved welcome';
 const select=d.querySelector('[data-sms-field="visitLinkValidity"]');select.value='7 days after checkout';
 d.querySelector('[data-sms-action="save-link-settings"]').click();reloadSms(w);
 assert.equal(d.querySelector('[data-sms-field="visitLinkValidity"]').value,'7 days after checkout');
 assert.notEqual(d.querySelector('[data-sms-field="welcomeMessage"]').value,'Unsaved welcome');
 d.querySelector('[data-sms-action="save-welcome"]').click();reloadSms(w);
 assert.equal(d.querySelector('[data-sms-field="visitLinkValidity"]').value,'7 days after checkout');
 const original=w.Storage.prototype.setItem;
 w.Storage.prototype.setItem=()=>{throw new Error('full');};
 d.querySelector('[data-sms-field="visitLinkValidity"]').value='30 days after checkout';
 d.querySelector('[data-sms-action="save-link-settings"]').click();
 assert.match(d.querySelector('[data-sms-status]').textContent,/Could not save/);
 w.Storage.prototype.setItem=original;reloadSms(w);
 assert.equal(d.querySelector('[data-sms-field="visitLinkValidity"]').value,'7 days after checkout');
 dom.window.close();
});

test('Wait Care defines its waiting trigger and distinguishes automatic, approval and manual sending',()=>{
 const {dom,w,d}=smsPage();
 const field=name=>d.querySelector(`[data-sms-field="${name}"]`);
 const mode=field('waitCareSendMode'), threshold=field('waitCareDelay');
 const trigger=d.querySelector('[data-sms-care-trigger]');
 const summary=d.querySelector('[data-sms-care-summary]');
 assert.ok(threshold);assert.equal(threshold.value,'15 minutes');
 mode.value='Automatic';mode.dispatchEvent(new w.Event('change'));
 assert.equal(trigger.hidden,false);assert.match(summary.textContent,/Automatically send.*15 minutes after check-in/);
 threshold.value='30 minutes';threshold.dispatchEvent(new w.Event('change'));
 assert.match(summary.textContent,/30 minutes after check-in/);
 mode.value='Manager approval';mode.dispatchEvent(new w.Event('change'));
 assert.match(summary.textContent,/Request manager approval.*30 minutes after check-in/);
 mode.value='Manual';mode.dispatchEvent(new w.Event('change'));
 assert.equal(trigger.hidden,true);assert.match(summary.textContent,/Staff selects.*no timed trigger/i);
 d.querySelector('[data-sms-action="save-wait-care"]').click();reloadSms(w);
 assert.equal(field('waitCareSendMode').value,'Manual');assert.equal(field('waitCareDelay').value,'30 minutes');
 assert.equal(d.querySelector('[data-sms-care-trigger]').hidden,true);
 d.querySelector('[data-sms-wait-care-enabled]').click();
 assert.match(d.querySelector('[data-sms-care-summary]').textContent,/disabled/i);
 dom.window.close();
});

test('Wait Care defaults to a caring message and benefit previews require a granted benefit',()=>{
 const {dom,w,d}=smsPage();
 const message=d.querySelector('[data-sms-field="waitCareMessage"]');
 assert.doesNotMatch(message.value,/added|sorry|Wait Care Benefit/);
 const preview=d.querySelector('[data-sms-preview="waitCareMessage"]');
 message.value='Thanks for waiting! [Salon Name] added [Wait Care Benefit]. Details: [OneQR Link]';
 message.dispatchEvent(new w.Event('input'));
 const scenario=d.querySelector('[data-sms-care-benefit-preview]');
 assert.equal(preview.hidden,true);
 assert.equal(d.querySelector('[data-sms-care-benefit-required]').hidden,false);
 assert.match(d.querySelector('[data-sms-care-benefit-status]').textContent,/no benefit has been granted/i);
 d.querySelector('[data-sms-test-phone="send-test-wait-care"]').value='7135550123';
 d.querySelector('[data-sms-action="send-test-wait-care"]').click();
 assert.match(d.querySelector('[data-sms-status]').textContent,/No benefit granted in this preview/);
 scenario.value='granted';scenario.dispatchEvent(new w.Event('change'));
 assert.equal(preview.hidden,false);assert.match(preview.textContent,/added a complimentary/);
 d.querySelector('[data-sms-action="send-test-wait-care"]').click();
 assert.match(d.querySelector('[data-sms-status]').textContent,/Preview only.*no SMS was sent/);
 message.value='Thanks for waiting!';message.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelector('[data-sms-care-benefit-required]').hidden,true);
 assert.equal(scenario.closest('.settings-field').hidden,true);
 assert.equal(preview.hidden,false);assert.equal(preview.textContent,'Thanks for waiting!');
 dom.window.close();
});
