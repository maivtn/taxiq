import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {boot,group,leaf,assets} from './helpers/shell-fixture.mjs';

test('shared merchant shell renders the PO hierarchy and local operational destinations',t=>{
 const w=boot(t);for(const key of ['pos','products','community','booking','business-tools','stations','payments'])assert.ok(group(w,key),key);
 assert.equal(leaf(w,'Dashboard').getAttribute('href'),'dashboard.html');
 const front=w.document.querySelector('#nexora-subnav-front-desk');
 assert.deepEqual(Array.from(front.querySelectorAll('a'),x=>x.textContent),['Đón khách','Phiếu dịch vụ','Chia turn','Đặt lịch','Thu tiền','Đã hoàn tất','Báo giá','Chấm công']);
 assert.equal(leaf(w,'Phiếu dịch vụ').getAttribute('href'),'pos-front-desk-tickets.html');
 assert.equal(leaf(w,'Thu tiền').getAttribute('href'),'pos-direct-checkout.html?view=list');
 assert.equal(leaf(w,'Salon Home').getAttribute('href'),'../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/salon-home.html#salon-home');
 assert.ok(leaf(w,'Hướng dẫn bắt đầu').getAttribute('href').endsWith('#dashboard-onboarding'));
});
test('all leaf links are real local files or PO external destinations, with distinct QR Analytics',t=>{
 const w=boot(t);for(const a of w.document.querySelectorAll('.sidebar a')) {
   const href=a.getAttribute('href');assert.ok(href && href!=='#',a.textContent);
   if(!/^https?:/.test(href)&&!href.startsWith('../../from-po/'))assert.ok(existsSync(new URL('../pages/'+href.split(/[?#]/)[0],assets)),href);
 }
 const analytics=Array.from(w.document.querySelectorAll('.sidebar a')).find(x=>x.textContent.trim()==='Analytics');assert.equal(analytics.href,'https://nexoratouch.com/dashboard/analytics');
});
test('merchant and POS headers use their own search context; Staff keeps existing header',t=>{
 const salon=boot(t),pos=boot(t,{activePage:'pos',page:'pos-front-desk.html'}),staff=boot(t,{activePage:'staff'});
 assert.ok(salon.document.querySelector('form[action="dashboard.html"] input[name="q"]'));
 assert.equal(pos.document.querySelector('[data-shell-function-search]').placeholder,'Tìm chức năng SI POS...');
 assert.equal(staff.document.querySelector('.header input').placeholder,'Search tech, station, review...');
});
test('POS function search finds usable destinations without submitting a Dashboard query',t=>{
 const w=boot(t,{activePage:'pos',page:'pos-front-desk.html'}),input=w.document.querySelector('[data-shell-function-search]');input.value='Báo giá';input.dispatchEvent(new w.Event('input'));
 assert.equal(w.document.querySelector('.shell-function-results a').getAttribute('href'),'pos-front-desk.html?section=estimate');
});
test('every shared-shell page loads icons and the PO model before the renderer',()=>{
 for(const file of readdirSync(new URL('../pages/',assets)).filter(x=>x.endsWith('.html'))){let html=readFileSync(new URL('../pages/'+file,assets),'utf8');if(!html.includes('src="../assets/nexora-shell.js"'))continue;
 assert.ok(html.indexOf('src="../assets/nexora-icons.js"')<html.indexOf('src="../assets/nexora-shell.js"'),file);assert.ok(html.includes('src="../assets/nexora-shell-nav.js"'),file);
 }
});
test('3D icon files are local 94px PNGs with traceable attribution',()=>{
 const list=JSON.parse(readFileSync(new URL('icons/3d-fluency/sources.json',assets),'utf8'));assert.equal(list.length,26);
 for(const icon of list){const data=readFileSync(new URL('icons/3d-fluency/'+icon.file,assets));assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(data.readUInt32BE(16),94);assert.equal(data.readUInt32BE(20),94);assert.equal(icon.style,'3D Fluency');assert.match(icon.source,/^https:\/\/icons8.com\/icon\//);}
});
