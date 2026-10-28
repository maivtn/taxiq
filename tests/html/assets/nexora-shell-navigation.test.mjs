import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {boot,group,leaf} from './helpers/shell-fixture.mjs';

test('PO menu opens only the selected nested branch and persists it through refresh',t=>{
 const w=boot(t);w.document.querySelector('[data-sidebar-products-toggle]').click();group(w,'business-tools').click();group(w,'stations').click();
 assert.equal(group(w,'stations').getAttribute('aria-expanded'),'true');
 assert.equal(group(w,'payments').getAttribute('aria-expanded'),'false');
 w.NEXORA_SHELL.refreshSidebar();assert.equal(group(w,'stations').getAttribute('aria-expanded'),'true');
 const saved=JSON.parse(w.sessionStorage.getItem('nexora.sidebar.expanded.v1'));assert.equal(saved.stations,true);
});
test('deep POS URL highlights the correct destination and opens every ancestor',t=>{
 const w=boot(t,{page:'pos-front-desk.html?section=estimate',activePage:'pos',activeTab:'front-desk'});
 assert.equal(leaf(w,'Estimate').getAttribute('aria-current'),'page');
 for(const key of ['pos','front-desk'])assert.equal(group(w,key).getAttribute('aria-expanded'),'true');
});
test('community native tabs still use the page callback',t=>{
 let selected;const w=boot(t,{page:'community.html?tab=feed',activePage:'community',activeTab:'feed',before(w){w.NEXORA_SHELL.onNavigate=tab=>selected=tab;}});
 leaf(w,'Groups & Market').click();assert.equal(selected,'groups');assert.ok(leaf(w,'Groups & Market').classList.contains('is-active'));
});
test('blocked storage does not prevent nested navigation',t=>{
 const w=boot(t,{before(w){for(const key of ['sessionStorage','localStorage'])Object.defineProperty(w,key,{get(){throw Error('blocked');}});}});
 w.document.querySelector('[data-sidebar-products-toggle]').click();w.NEXORA_SHELL.refreshSidebar();assert.equal(w.document.querySelector('[data-sidebar-products-toggle]').getAttribute('aria-expanded'),'true');assert.ok(Array.from(w.document.querySelectorAll('[data-product-menu]')).every(menu=>!menu.hidden));
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
 ['https://nexoratouch.com/dashboard/pos?tab=timeclock','pos-front-desk.html?section=clock'],['https://nexoratouch.com/dashboard/pos/printer','pos-printer-setup.html'],
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
 const w=boot(t,{page:'community.html?tab=feed',activePage:'community',activeTab:'feed',before(w){w.NEXORA_SHELL.onNavigate=()=>{};}}),button=leaf(w,'Groups & Market');
 button.focus();button.click();await Promise.resolve();assert.equal(w.document.activeElement?.getAttribute('data-shell-key'),button.getAttribute('data-shell-key'));
});
test('PO technician commission report is not substituted with service or store income',t=>{
 const w=boot(t),url='https://nexoratouch.com/dashboard/pos/report/technician';assert.equal(w.NEXORA_SHELL_NAV.resolve(url),'pos-technician-report.html');
});

test('opening a sidebar group closes its siblings while preserving ancestor groups',t=>{
 const w=boot(t);w.document.querySelector('[data-sidebar-products-toggle]').click();group(w,'pos').click();group(w,'front-desk').click();
 group(w,'business-tools').click();assert.equal(group(w,'pos').getAttribute('aria-expanded'),'false');
 group(w,'stations').click();group(w,'payments').click();
 assert.equal(group(w,'stations').getAttribute('aria-expanded'),'false');
 for(const key of ['business-tools','payments'])assert.equal(group(w,key).getAttribute('aria-expanded'),'true');
 w.NEXORA_SHELL.refreshSidebar();assert.equal(group(w,'payments').getAttribute('aria-expanded'),'true');
 assert.equal(group(w,'pos').getAttribute('aria-expanded'),'false');
});
test('old saved sidebar state is normalized to one expanded sibling at every level',t=>{
 const w=boot(t,{before(w){w.sessionStorage.setItem('nexora.sidebar.expanded.v1',JSON.stringify({pos:true,products:true,community:true,booking:true,stations:true,payments:true}));}});
 const byParent=new Map();for(const toggle of w.document.querySelectorAll('.sidebar [data-nav-group][aria-expanded="true"]')){
 const parent=toggle.closest('[data-nav-subnav], .sidebar-nav');byParent.set(parent,(byParent.get(parent)||0)+1);
 }
 for(const count of byParent.values())assert.equal(count,1);
});
test('Staff sidebar groups also close the previously expanded sibling',t=>{
 const w=boot(t,{activePage:'staff',activeTab:'dashboard'}),community=w.document.querySelector('[data-staff-group="community"]'),workspace=w.document.querySelector('[data-staff-group="workspace"]');
 community.click();workspace.click();assert.equal(community.getAttribute('aria-expanded'),'false');assert.equal(workspace.getAttribute('aria-expanded'),'true');
});
test('sidebar subitems have text labels without icons or dot markers',t=>{
 for(const activePage of ['dashboard','staff']){
 const w=boot(t,{activePage});const icons=Array.from(w.document.querySelectorAll('.sidebar .nav-subitem [data-lucide]:not(.nav-caret):not(.sidebar-external-icon)'));
 assert.ok(icons.every(icon=>['community','booking','business-tools'].includes(icon.closest('[data-sidebar-key]')?.getAttribute('data-sidebar-key'))));
 assert.equal(w.document.querySelectorAll('.sidebar .nav-subitem img, .sidebar .nav-subitem .nav-subitem-dot').length,0);
 assert.ok(w.document.querySelector('.sidebar .nav-item img, .sidebar .nav-item [data-lucide]'));
 }
});


test('All products controls three sibling menus and occupies its original position after SI POS',t=>{
 const w=boot(t),control=w.document.querySelector('[data-sidebar-products-toggle]'),nav=w.document.querySelector('.sidebar-nav');
 assert.equal(control.tagName,'BUTTON');assert.equal(control.type,'button');assert.equal(control.parentElement,nav);assert.equal(control.querySelector('.sidebar-icon-wrap,[data-lucide],img'),null);
 assert.equal(control.previousElementSibling.querySelector('[data-sidebar-key]').dataset.sidebarKey,'pos');
 assert.equal(control.nextElementSibling.querySelector('[data-sidebar-key]').dataset.sidebarKey,'community');
 assert.equal(control.hasAttribute('href'),false);assert.equal(control.hasAttribute('aria-current'),false);assert.equal(control.classList.contains('is-active'),false);
 assert.equal(w.document.querySelector('#nexora-subnav-products'),null);
 assert.deepEqual(Array.from(w.document.querySelectorAll('[data-product-menu]'),menu=>menu.querySelector('[data-sidebar-key]').dataset.sidebarKey),['community','booking','business-tools']);
 for(const key of ['pos','community','booking','business-tools'])assert.equal(group(w,key).closest('.shell-tree-branch').parentElement,nav);
 assert.equal(w.NEXORA_SHELL.sidebarMenuItems.some(item=>item.key==='products'),false);
});
test('All products hides and shows only the three product menus without expanding their submenus',t=>{
 const w=boot(t),control=w.document.querySelector('[data-sidebar-products-toggle]'),menus=()=>Array.from(w.document.querySelectorAll('[data-product-menu]'));
 assert.equal(control.getAttribute('aria-expanded'),'false');assert.ok(menus().every(menu=>menu.hidden));
 group(w,'pos').click();const pos=group(w,'pos').getAttribute('aria-expanded');
 control.click();assert.equal(control.getAttribute('aria-expanded'),'true');assert.ok(menus().every(menu=>!menu.hidden));
 for(const key of ['community','booking','business-tools'])assert.equal(group(w,key).getAttribute('aria-expanded'),'false');
 assert.equal(group(w,'pos').getAttribute('aria-expanded'),pos);
 control.click();assert.equal(control.getAttribute('aria-expanded'),'false');assert.ok(menus().every(menu=>menu.hidden));
 assert.equal(group(w,'pos').getAttribute('aria-expanded'),pos);assert.equal(group(w,'pos').closest('.shell-tree-branch').hidden,false);
 assert.equal(leaf(w,'Getting started').hidden,false);assert.equal(leaf(w,'Support').hidden,false);
});
test('product-list visibility survives page changes and never derives active state from a child route',async t=>{
 for(const open of [true,false]){
 const source=boot(t),control=source.document.querySelector('[data-sidebar-products-toggle]');if(open)control.click();
 const saved=source.sessionStorage.getItem('nexora.sidebar.expanded.v1');
 const w=boot(t,{page:'community.html?tab=feed',activePage:'community',activeTab:'feed',before(w){w.sessionStorage.setItem('nexora.sidebar.expanded.v1',saved);}});
 w.NEXORA_SHELL.setActiveTab('groups');await Promise.resolve();w.NEXORA_SHELL.refreshSidebar();
 const next=w.document.querySelector('[data-sidebar-products-toggle]');assert.equal(next.getAttribute('aria-expanded'),String(open));
 assert.ok(Array.from(w.document.querySelectorAll('[data-product-menu]')).every(menu=>menu.hidden===!open));
 assert.equal(next.classList.contains('is-active'),false);assert.equal(next.hasAttribute('aria-current'),false);
 }
});
test('hiding and restoring product menus preserves their selected branch and the normal accordion',t=>{
 const w=boot(t),control=w.document.querySelector('[data-sidebar-products-toggle]');control.click();group(w,'community').click();
 control.click();assert.equal(group(w,'community').closest('[data-product-menu]').hidden,true);
 control.click();assert.equal(group(w,'community').getAttribute('aria-expanded'),'true');
 group(w,'booking').click();assert.equal(group(w,'community').getAttribute('aria-expanded'),'false');
 assert.equal(group(w,'booking').getAttribute('aria-expanded'),'true');group(w,'pos').click();assert.equal(group(w,'booking').getAttribute('aria-expanded'),'false');
 assert.equal(control.getAttribute('aria-expanded'),'true');
});

test('Community has a separate destination link and disclosure button like Front Desk',t=>{
 const w=boot(t),control=w.document.querySelector('[data-sidebar-products-toggle]');control.click();
 const toggle=group(w,'community'),row=toggle.parentElement,link=row.querySelector('a');
 assert.equal(link.textContent.trim(),'Community');assert.equal(link.getAttribute('href'),'community.html?tab=feed');
 assert.equal(toggle.getAttribute('aria-label'),'Community');assert.equal(toggle.hasAttribute('href'),false);
 const location=w.location.href;toggle.click();assert.equal(w.location.href,location);assert.equal(toggle.getAttribute('aria-expanded'),'true');
 assert.equal(row.querySelectorAll('a').length,1);assert.equal(row.querySelectorAll('button').length,1);
});

test('One QR label opens its local workspace while the adjacent button only expands its menu',t=>{
 const w=boot(t);w.document.querySelector('[data-sidebar-products-toggle]').click();group(w,'business-tools').click();
 const toggle=group(w,'stations'),link=toggle.parentElement.querySelector('a'),location=w.location.href;
 assert.equal(link.textContent.trim(),'One QR');assert.equal(link.getAttribute('href'),'qr-stations.html?tab=one-qr');
 toggle.click();assert.equal(w.location.href,location);assert.equal(toggle.getAttribute('aria-expanded'),'true');
});

test('Payment Gateway sidebar keeps exactly the PO menu while approved extra screens remain in Payments',t=>{
 const w=boot(t),gateway=w.NEXORA_SHELL_NAV.nodes.find(node=>node.key==='business-tools').children.find(node=>node.key==='payments');
 assert.deepEqual(Array.from(gateway.children,group=>group.label),['Salon income','Staff payouts','Card terminal','Settings']);
 assert.deepEqual(Array.from(gateway.children,group=>group.children.length),[2,4,1,1]);
 assert.deepEqual(Array.from(gateway.children[0].children,item=>item.label),['Payment overview','Receive payments']);
 assert.ok(!gateway.children.some(group=>group.children.some(item=>['income-by-period','payout-history-by-staff'].includes(item.key))));
 w.eval(readFileSync(new URL('../../../html/assets/nexora-product-catalog.js',import.meta.url),'utf8'));
 const links=Array.from(w.NEXORA_PRODUCT_CATALOG.payments.groups).flatMap(group=>Array.from(group.items,item=>item.url));
 assert.ok(links.includes('payment-income-period.html'));assert.ok(links.includes('staff-payout-history.html'));
});
