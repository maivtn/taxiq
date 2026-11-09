import test from 'node:test';
import assert from 'node:assert/strict';
import {boot} from './helpers/shell-fixture.mjs';
test('header language menu contains seven choices and supports selection, Escape and outside clicks',t=>{
  const w=boot(t),root=w.document.querySelector('.shell-language'),toggle=root.querySelector('.shell-header-language'),menu=root.querySelector('[role="listbox"]');
  assert.equal(menu.querySelectorAll('[role="option"]').length,7);
  toggle.click();assert.equal(menu.hidden,false);
  root.querySelector('[data-shell-language="vi"]').click();assert.equal(root.querySelector('[data-shell-language-code]').textContent,'VI');assert.equal(menu.hidden,true);
  assert.equal(root.querySelector('[data-shell-language="vi"]').getAttribute('aria-selected'),'true');
  toggle.click();w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(menu.hidden,true);assert.equal(w.document.activeElement,toggle);
  toggle.click();w.document.body.click();assert.equal(menu.hidden,true);
});
test('language and Ecosystem menus close each other, including keyboard opening',t=>{
  const w=boot(t),language=w.document.querySelector('.shell-header-language'),ecosystem=w.document.querySelector('.shell-ecosystem-toggle');
  language.click();ecosystem.click();assert.equal(w.document.querySelector('.shell-language-menu').hidden,true);
  language.focus();language.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
  assert.equal(w.document.querySelector('.shell-ecosystem-panel').hidden,true);assert.equal(w.document.querySelector('.shell-language-menu').hidden,false);
});
