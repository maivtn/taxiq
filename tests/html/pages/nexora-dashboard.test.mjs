import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {boot,assets} from '../assets/helpers/shell-fixture.mjs';
const page=readFileSync(new URL('../pages/dashboard.html',assets),'utf8');
function dashboard(t,query=''){const w=boot(t,{html:page,page:'dashboard.html'+query});for(const f of ['nexora-product-catalog.js','nexora-dashboard.js'])w.eval(readFileSync(new URL(f,assets),'utf8'));return w;}
function shown(w){return Array.from(w.document.querySelectorAll('#cards [data-module]')).filter(x=>!x.hidden);}

test('Dashboard contains exactly the nine PO cards, with Tax IQ accessible only by detail URL',t=>{
 const w=dashboard(t);assert.deepEqual(shown(w).map(x=>x.dataset.module),['pos','oneqr','payments','aihub','reviews','gift','analytics','community','spinwheel']);
 assert.equal(w.document.querySelector('#result-count').textContent,'9 products');assert.ok(w.document.querySelector('main a[href="https://icons8.com"]'));
 const tax=dashboard(t,'?module=taxiq');assert.equal(tax.document.getElementById('detail-title').textContent,'Tax IQ');assert.equal(tax.document.getElementById('detail-tax-preview').hidden,false);assert.equal(tax.document.querySelectorAll('#detail-links a').length,0);
});
test('accent-insensitive search, group filter, empty state and reset keep URL in sync',t=>{
 const w=dashboard(t),search=w.document.getElementById('search'),category=w.document.getElementById('category');search.value='vong quay';search.dispatchEvent(new w.Event('input'));
 assert.deepEqual(shown(w).map(x=>x.dataset.module),['spinwheel']);assert.equal(new URL(w.location.href).searchParams.get('q'),'vong quay');
 category.value='community';category.dispatchEvent(new w.Event('change'));assert.equal(shown(w).length,0);assert.equal(w.document.getElementById('empty').hidden,false);
 w.document.getElementById('empty-reset').click();assert.equal(shown(w).length,9);assert.equal(w.location.search,'');assert.equal(w.document.activeElement,search);
});
test('opening detail and returning preserves filter context and selected-card focus',t=>{
 const w=dashboard(t,'?category=marketing&q=AI'),card=w.document.querySelector('[data-module="aihub"]');card.click();assert.equal(new URL(w.location.href).searchParams.get('module'),'aihub');
 assert.equal(w.document.getElementById('module-browser').hidden,true);assert.ok(w.document.getElementById('detail-links').textContent.includes('Appointments'));
 w.document.getElementById('detail-back').click();assert.equal(w.location.search,'?category=marketing&q=AI');assert.equal(w.document.activeElement,card);assert.equal(w.document.getElementById('module-browser').hidden,false);
});
test('direct marketing URL and keyboard tabs open the correct assistant and retain preview status',t=>{
 const w=dashboard(t,'?module=aihub&section=marketing');let tab=w.document.querySelector('#detail-tabs [aria-selected="true"]');assert.equal(tab.textContent,'Marketing Assistant');assert.equal(w.document.getElementById('detail-marketing-preview').hidden,false);
 tab.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.equal(w.document.querySelector('#detail-tabs [aria-selected="true"]').textContent,'AI Receptionist');assert.equal(w.document.getElementById('detail-marketing-preview').hidden,true);
 const payments=dashboard(t,'?module=payments');assert.ok(payments.document.querySelector('#detail-links .unavailable'));assert.equal(payments.document.querySelector('#detail-links .unavailable a'),null);
 const wheel=dashboard(t,'?module=spinwheel');assert.equal(wheel.document.getElementById('detail-status').textContent,'Preview');assert.ok(wheel.document.querySelector('#detail-links a').href.includes('/vlinkpay-campaigns.html?view=create'));
});
test('browser history routes render list/detail without a separate router',t=>{
 const w=dashboard(t);w.history.pushState({},'','?module=gift');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.equal(w.document.getElementById('detail-title').textContent,'Gift Card Center');
 w.history.pushState({},'','?q=qr');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.equal(w.document.getElementById('module-browser').hidden,false);assert.equal(w.document.getElementById('search').value,'qr');assert.ok(shown(w).length>0);
});
test('unknown and inherited object keys safely show the catalog',t=>{
 for(const key of ['unknown','constructor','__proto__']){const w=dashboard(t,'?module='+key);assert.equal(w.document.getElementById('module-browser').hidden,false);assert.equal(shown(w).length,9);}
});
test('AI Marketing menu highlight tracks assistant tab changes',t=>{
 const w=dashboard(t,'?module=aihub');const selected=()=>w.document.querySelector('.sidebar a[href="dashboard.html?module=aihub&section=marketing"]')?.getAttribute('aria-current');
 assert.equal(selected(),null);w.document.getElementById('module-group-1').click();assert.equal(selected(),'page');w.document.getElementById('module-group-0').click();assert.equal(selected(),null);
});
test('Dashboard and every module detail display English UI copy',t=>{
 const w=dashboard(t);assert.equal(w.document.documentElement.lang,'en');assert.equal(w.document.getElementById('result-count').textContent,'9 products');
 for(const key of Object.keys(w.NEXORA_PRODUCT_CATALOG)){
 w.history.replaceState({},'','?module='+key);w.dispatchEvent(new w.PopStateEvent('popstate'));
 const text=Array.from(w.document.querySelectorAll('#module-detail h2,#module-detail p,#detail-tabs button,#detail-links')).filter(e=>!e.closest('[hidden]')).map(e=>e.textContent).join(' ');
 assert.doesNotMatch(text,/[\u00c0-\u024f\u1e00-\u1eff]/,key);
 }
});
