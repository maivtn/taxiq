import test from 'node:test';import assert from 'node:assert/strict';import {boot,leaf} from './helpers/shell-fixture.mjs';
test('PO News & Library and Support remain reachable as separate flat links',t=>{
 const w=boot(t);assert.equal(leaf(w,'News & Library').getAttribute('href'),'news-library.html?tab=news');assert.equal(leaf(w,'Support').getAttribute('href'),'nexora-support.html');
 assert.equal(w.document.querySelector('.sidebar-nav').textContent.indexOf('News & Library')<w.document.querySelector('.sidebar-nav').textContent.indexOf('Support'),true);
});
