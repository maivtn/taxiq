import test from 'node:test';
import assert from 'node:assert/strict';
import {boot,group,leaf} from './helpers/shell-fixture.mjs';

test('PO menu opens only the selected nested branch and persists it through refresh',t=>{
 const w=boot(t);group(w,'products').click();group(w,'business-tools').click();group(w,'stations').click();
 assert.equal(group(w,'stations').getAttribute('aria-expanded'),'true');
 assert.equal(group(w,'payments').getAttribute('aria-expanded'),'false');
 w.NEXORA_SHELL.refreshSidebar();assert.equal(group(w,'stations').getAttribute('aria-expanded'),'true');
 const saved=JSON.parse(w.sessionStorage.getItem('nexora.sidebar.expanded.v1'));assert.equal(saved.stations,true);
});
test('deep POS URL highlights the correct destination and opens every ancestor',t=>{
 const w=boot(t,{page:'pos-front-desk.html?section=estimate',activePage:'pos',activeTab:'front-desk'});
 assert.equal(leaf(w,'Báo giá').getAttribute('aria-current'),'page');
 for(const key of ['pos','front-desk'])assert.equal(group(w,key).getAttribute('aria-expanded'),'true');
});
test('community native tabs still use the page callback',t=>{
 let selected;const w=boot(t,{page:'community.html?tab=feed',activePage:'community',activeTab:'feed',before(w){w.NEXORA_SHELL.onNavigate=tab=>selected=tab;}});
 leaf(w,'Nhóm & Chợ').click();assert.equal(selected,'groups');assert.ok(leaf(w,'Nhóm & Chợ').classList.contains('is-active'));
});
test('blocked storage does not prevent nested navigation',t=>{
 const w=boot(t,{before(w){for(const key of ['sessionStorage','localStorage'])Object.defineProperty(w,key,{get(){throw Error('blocked');}});}});
 group(w,'products').click();w.NEXORA_SHELL.refreshSidebar();assert.equal(group(w,'products').getAttribute('aria-expanded'),'true');
});
test('legacy saved group and visibility keys survive editing the current menu',t=>{
 const w=boot(t,{before(w){w.localStorage.setItem('nexora.sidebar.visibility.v1',JSON.stringify({hiddenKeys:['reward','dashboard']}));w.sessionStorage.setItem('nexora.sidebar.expanded.v1',JSON.stringify({reward:true}));}});
 assert.equal(leaf(w,'Dashboard'),undefined);w.NEXORA_SHELL.setHiddenSidebarKeys(['pos','settings']);
 assert.deepEqual(JSON.parse(w.localStorage.getItem('nexora.sidebar.visibility.v1')).hiddenKeys,['pos','reward']);
 assert.equal(JSON.parse(w.sessionStorage.getItem('nexora.sidebar.expanded.v1')).reward,true);
});
test('Staff keeps its own menu and does not rewrite Salon group state',t=>{
 const saved=JSON.stringify({products:true,stations:true});const w=boot(t,{activePage:'staff',activeTab:'my-tickets',before(w){w.sessionStorage.setItem('nexora.sidebar.expanded.v1',saved);}});
 assert.equal(group(w,'products'),null);assert.ok(w.document.querySelector('[data-staff-nav="my-tickets"].is-active'));
 assert.equal(w.document.querySelector('[data-staff-nav="my-calendar"]').getAttribute('href'),'pos-calendar.html');
 assert.equal(w.sessionStorage.getItem('nexora.sidebar.expanded.v1'),saved);assert.equal(w.NEXORA_SHELL.workspace,'staff');
});
test('settings, QR tools, clock and printer resolve to the actual local query contracts',t=>{
 const w=boot(t),resolve=w.NEXORA_SHELL_NAV.resolve;
 for(const [input,expected] of [
 ['#pos-salon-settings-services','pos-salon-settings.html?section=services'],['#pos-salon-settings-info','pos-salon-settings.html?section=information'],
 ['#pos-booking-calendar','pos-front-desk.html?section=appointments&bookingView=appointment&view=calendar'],
 ['#pos-booking-customers','pos-front-desk.html?section=appointments&bookingView=appointment&view=table'],
 ['https://nexoratouch.com/dashboard/pos?tab=timeclock','pos-phase-1.html?tab=clock'],['https://nexoratouch.com/dashboard/pos/printer','pos-phase-1.html?tab=printer'],
 ['https://nexoratouch.com/dashboard/touchpoints?section=tip','qr-stations.html?tab=qr-stations'],
 ['https://nexoratouch.com/dashboard/touchpoints?section=referral','qr-stations.html?tab=referral-link'],
 ['https://nexoratouch.com/dashboard/touchpoints?section=staff-invite','qr-stations.html?tab=staff-invite-qr']])assert.equal(resolve(input),expected);
});
test('explicit AI calendar and Today routes never select both leaf views',t=>{
 for(const view of ['today','calendar']){const w=boot(t,{page:'booking-book-phase-1.html?tab=booking&view='+view,activePage:'booking',activeTab:'booking'});
 const links=Array.from(w.document.querySelectorAll('#nexora-subnav-ai-receptionist a')).filter(a=>a.href.includes('tab=booking'));
 assert.equal(links.filter(a=>a.getAttribute('aria-current')==='page').length,1);assert.ok(links.find(a=>a.getAttribute('aria-current')==='page').href.includes('view='+view));}
});
test('native desktop tab activation preserves focused sidebar control after refresh',async t=>{
 const w=boot(t,{page:'community.html?tab=feed',activePage:'community',activeTab:'feed',before(w){w.NEXORA_SHELL.onNavigate=()=>{};}}),button=leaf(w,'Nhóm & Chợ');
 button.focus();button.click();await Promise.resolve();assert.equal(w.document.activeElement?.getAttribute('data-shell-key'),button.getAttribute('data-shell-key'));
});
test('PO technician commission report is not substituted with service or store income',t=>{
 const w=boot(t),url='https://nexoratouch.com/dashboard/pos/report/technician';assert.equal(w.NEXORA_SHELL_NAV.resolve(url),url);
});
