import test from 'node:test';import assert from 'node:assert/strict';import {boot,leaf} from './helpers/shell-fixture.mjs';
test('PO News & Library and Support remain reachable as separate flat links',t=>{
 const w=boot(t);assert.equal(leaf(w,'Tin tức & Tài liệu').getAttribute('href'),'news-library.html?tab=news');assert.equal(leaf(w,'Hỗ trợ').getAttribute('href'),'https://nexoratouch.com/dashboard/support');
 assert.equal(w.document.querySelector('.sidebar-nav').textContent.indexOf('Tin tức & Tài liệu')<w.document.querySelector('.sidebar-nav').textContent.indexOf('Hỗ trợ'),true);
});
