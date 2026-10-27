import test from 'node:test';import assert from 'node:assert/strict';import {boot} from './helpers/shell-fixture.mjs';
test('locked account settings and business verification remain accessible outside the product tree',t=>{
 const w=boot(t,{activePage:'owner-settings',page:'owner-setting.html?tab=sub-account'});const api=w.NEXORA_SHELL;
 assert.ok(api.sidebarMenuItems.find(x=>x.key==='settings').locked);api.setHiddenSidebarKeys(['settings']);api.refreshSidebar();
 const menu=w.document.getElementById('nexora-account-menu');assert.equal(menu.hidden,true);w.document.querySelector('[data-shell-account-toggle]').click();assert.equal(menu.hidden,false);
 assert.equal(menu.querySelector('a').getAttribute('href'),'owner-setting.html');assert.ok(menu.querySelector('a[href="owner-setting.html?tab=business-verification"]'));
 assert.equal(w.document.getElementById('nexora-subnav-settings'),null);
});
