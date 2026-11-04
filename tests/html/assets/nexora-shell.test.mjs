import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {boot,group,leaf,assets} from './helpers/shell-fixture.mjs';

test('shared merchant shell renders the PO hierarchy and local operational destinations',t=>{
 const w=boot(t);for(const key of ['pos','community','booking','business-tools','stations','payments'])assert.ok(group(w,key),key);
 assert.equal(leaf(w,'Dashboard').getAttribute('href'),'dashboard.html');
 assert.ok(w.document.querySelector('[data-sidebar-products-toggle]'));assert.equal(group(w,'products'),null);
 const front=w.document.querySelector('#nexora-subnav-front-desk');
 assert.deepEqual(Array.from(front.querySelectorAll('a'),x=>x.textContent),['Check-in','Tickets','Turn Board','Booking','Checkout','Completed Services','Estimate','Time clock']);
 assert.equal(leaf(w,'Tickets').getAttribute('href'),'pos-front-desk-tickets.html');
 assert.equal(leaf(w,'Checkout').getAttribute('href'),'pos-direct-checkout.html?view=list');
 assert.equal(leaf(w,'Salon Home').getAttribute('href'),'salon-home.html');
 assert.equal(leaf(w,'Getting started').getAttribute('href'),'nexora-getting-started.html');
});
test('all sidebar links resolve to real local pages, with distinct QR Analytics',t=>{
 const w=boot(t);for(const a of w.document.querySelectorAll('.sidebar a')) {
   const href=a.getAttribute('href');assert.ok(href && href!=='#',a.textContent);
   assert.doesNotMatch(href,/^(https?:|\.\.\/\.\.\/from-po)/);assert.ok(existsSync(new URL('../pages/'+href.split(/[?#]/)[0],assets)),href);
 }
 const analytics=Array.from(w.document.querySelectorAll('.sidebar a')).find(x=>x.textContent.trim()==='Analytics');assert.equal(analytics.getAttribute('href'),'nexora-analytics.html');
});
test('merchant and POS headers use their own search context; Staff keeps existing header',t=>{
 const salon=boot(t),pos=boot(t,{activePage:'pos',page:'pos-front-desk.html'}),staff=boot(t,{activePage:'staff'});
 assert.ok(salon.document.querySelector('form[action="dashboard.html"] input[name="q"]'));
 assert.equal(pos.document.querySelector('[data-shell-function-search]').placeholder,'Search SI POS tools...');
 assert.equal(staff.document.querySelector('.header input').placeholder,'Search tech, station, review...');
});
test('POS function search finds usable destinations without submitting a Dashboard query',t=>{
 const w=boot(t,{activePage:'pos',page:'pos-front-desk.html'}),input=w.document.querySelector('[data-shell-function-search]');input.value='Estimate';input.dispatchEvent(new w.Event('input'));
 assert.equal(w.document.querySelector('.shell-function-results a').getAttribute('href'),'pos-front-desk.html?section=estimate');
});
test('every shared-shell page loads icons and the PO model before the renderer',()=>{
 for(const file of readdirSync(new URL('../pages/',assets)).filter(x=>x.endsWith('.html'))){
 const html=readFileSync(new URL('../pages/'+file,assets),'utf8');
 const scripts=Array.from(html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g),match=>match[1].split('?')[0]);
 const shell=scripts.indexOf('../assets/nexora-shell.js');if(shell<0)continue;
 const icons=scripts.indexOf('../assets/nexora-icons.js'),model=scripts.indexOf('../assets/nexora-shell-nav.js');
 assert.ok(icons>=0&&icons<shell,file+' icons');assert.ok(model>=0&&model<shell,file+' navigation model');
 }
});
test('3D icon files are local 94px PNGs with traceable attribution',()=>{
 const list=JSON.parse(readFileSync(new URL('icons/3d-fluency/sources.json',assets),'utf8'));assert.equal(list.length,26);
 for(const icon of list){const data=readFileSync(new URL('icons/3d-fluency/'+icon.file,assets));assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(data.readUInt32BE(16),94);assert.equal(data.readUInt32BE(20),94);assert.equal(icon.style,'3D Fluency');assert.match(icon.source,/^https:\/\/icons8.com\/icon\//);}
});
test('merchant sidebar places Nexora Home directly between the brand and salon account',t=>{
 const w=boot(t),sidebar=w.document.querySelector('.sidebar');
 assert.equal(sidebar.children[0].className,'sidebar-brand');assert.equal(sidebar.children[1].className,'sidebar-public-home');assert.equal(sidebar.children[2].className,'sidebar-account');
 assert.equal(sidebar.querySelector('.sidebar-public-home a').textContent.trim(),'Nexora Home');assert.equal(sidebar.querySelectorAll('a[href="nexora-home.html"]').length,1);
});
test('merchant sidebar uses English labels, plan icon and keeps the three product-group icons',t=>{
 const w=boot(t),sidebar=w.document.querySelector('.sidebar');assert.doesNotMatch(sidebar.textContent,/[\u00c0-\u024f\u1e00-\u1eff]/);
 assert.ok(sidebar.querySelector('.plan-icon [data-lucide="crown"]'));assert.match(sidebar.querySelector('.plan-info').textContent,/Professional Pro/);assert.equal(sidebar.querySelectorAll('.nexora-3d-icon,.nexora-icon-credit').length,0);assert.doesNotMatch(sidebar.textContent,/↗/);assert.ok(sidebar.querySelector('.sidebar-external-icon[data-lucide="arrow-up-right"]'));
 for(const key of ['community','booking','business-tools'])assert.ok(group(w,key).parentElement.querySelector('[data-lucide]'),key);
 assert.equal(w.localStorage.getItem('nexora-dashboard-language-v1'),'en');
});
test('current salon identity uses the existing catalog when no host override is supplied',t=>{
 const w=boot(t,{before(w){w.NEXORA_SALON_DATA={loadCatalog(){return {salon:{name:'Luna Nail Studio'}};}};}});
 assert.equal(w.document.querySelector('.sidebar-salon-copy .profile-name').textContent,'Luna Nail Studio');
});
