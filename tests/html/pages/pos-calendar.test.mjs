import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM,VirtualConsole} from 'jsdom';
const SOURCE_DIR=new URL('../../../html/pages/',import.meta.url);
function boot(query=''){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(readFileSync(new URL('./pos-calendar.html',SOURCE_DIR),'utf8'),{url:'https://staff.test/html/pages/pos-calendar.html'+query,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;
 for(const file of ['salon-data.js','appointments-store.js','staff-schedule-store.js','staff-calendar.js'])w.eval(readFileSync(new URL('../assets/'+file,SOURCE_DIR),'utf8'));
 return {dom,w,d:w.document,errors};
}
test('My Calendar keeps personal IA with salon, tabs and booking sync',()=>{
 const {dom,d,errors}=boot('?salon=bitcoin-nail-bar-houston&staff=t1');
 assert.equal(d.querySelector('h1').textContent,'My Calendar');
 assert.deepEqual(Array.from(d.querySelectorAll('[data-calendar-tab]'),n=>n.dataset.calendarTab),['appointments','work-schedule','requests']);
 assert.ok(d.querySelector('[data-calendar-salon]'));assert.match(d.querySelector('[data-calendar-sync]').textContent,/Booking/);
 assert.equal(d.querySelectorAll('[data-calendar-day]').length,7);assert.equal(d.querySelector('[data-calendar]').dataset.staffId,'t1');
 assert.deepEqual(errors,[]);dom.window.close();
});
test('timeline shows work boundaries, breaks and open slots',()=>{
 const {dom,d}=boot('?staff=t1&date=2026-09-28');const text=d.querySelector('[data-calendar-timeline]').textContent;
 assert.match(text,/Work starts/);assert.match(text,/Break/);assert.match(text,/Open slot/);assert.match(text,/Work ends/);dom.window.close();
});
test('invalid staff falls back to personal scope and preserves salon in back link',()=>{
 const {dom,w,d}=boot('?salon=missing&staff=missing&date=2030-02-14');
 assert.equal(d.querySelector('[data-calendar]').dataset.staffId,'t1');assert.equal(new URL(w.location.href).searchParams.get('staff'),'t1');
 assert.match(d.querySelector('[data-work-orders-link]').href,/salon=bitcoin-nail-bar-houston/);dom.window.close();
});
test('staff submits and cancels a pending day-off request without changing published schedule',()=>{
 const {dom,w,d}=boot('?staff=t1&date=2026-10-02');d.querySelector('[data-calendar-tab="requests"]').click();d.querySelector('[data-request-day-off]').click();
 d.querySelector('[data-request-date]').value='2026-10-02';d.querySelector('[data-request-reason]').value='Personal';d.querySelector('[data-request-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 let state=w.NEXORA_STAFF_SCHEDULE_STORE.loadState();assert.equal(state.requests.at(-1).status,'pending');assert.equal(state.salons['bitcoin-nail-bar-houston'].staff.t1.exceptions['2026-10-02'],undefined);assert.match(d.querySelector('[data-request-list]').textContent,/Pending/);
 d.querySelector('[data-request-cancel]').click();state=w.NEXORA_STAFF_SCHEDULE_STORE.loadState();assert.equal(state.requests.at(-1).status,'cancelled');dom.window.close();
});
