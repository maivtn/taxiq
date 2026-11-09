import test from 'node:test';
import assert from 'node:assert/strict';
import {boot} from './helpers/shell-fixture.mjs';

function menu(w) {
  return {toggle:w.document.querySelector('.shell-ecosystem-toggle'), panel:w.document.querySelector('.shell-ecosystem-panel')};
}

test('Ecosystem toggles in place and closes on an outside click', t => {
  const w=boot(t), {toggle,panel}=menu(w), url=w.location.href;
  assert.equal(panel.hidden,true);
  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'),'true');
  assert.equal(panel.hidden,false);
  assert.equal(w.location.href,url);
  toggle.click();
  assert.equal(panel.hidden,true);
  toggle.click();
  w.document.body.click();
  assert.equal(panel.hidden,true);
  assert.equal(toggle.getAttribute('aria-expanded'),'false');
});

test('personal and business headers share the same controls and keep personal message routing', t => {
  const business=boot(t,{before:w=>{w.NEXORA_SHELL.isCommunity=true;}});
  const personal=boot(t,{activePage:'staff',before:w=>{w.NEXORA_SHELL.salonLinked=false;w.NEXORA_SHELL.isCommunity=true;}});
  const controls=w=>Array.from(w.document.querySelectorAll('.header .shell-workspace-actions > a,.header .shell-workspace-actions > button,.header .shell-ecosystem-toggle')).map(el=>[el.getAttribute('aria-label'),el.innerHTML]);
  assert.deepEqual(controls(personal),controls(business));
  assert.match(personal.document.querySelector('.shell-header-messages').href,/account=personal/);
  assert.match(personal.document.querySelector('.mobile-brand a').href,/frame-personal\.html\?view=dashboard/);
  assert.equal(personal.document.querySelectorAll('.shell-search-toggle').length,1);
  const profile=boot(t,{activePage:'staff',before:w=>{w.NEXORA_SHELL.salonLinked=false;}});
  assert.equal(profile.document.querySelectorAll('.shell-ecosystem-toggle').length,1);
  assert.equal(profile.document.querySelectorAll('.shell-search-toggle').length,0);
});

test('Ecosystem supports keyboard selection, Escape and focus leaving the menu', t => {
  const w=boot(t), {toggle,panel}=menu(w);
  const key=value=>w.document.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:value,bubbles:true}));
  toggle.focus(); key('ArrowUp');
  assert.equal(panel.hidden,false);
  assert.equal(w.document.activeElement.textContent,'');
  assert.equal(w.document.activeElement.querySelector('img').alt,'VLINKPAY');
  key('Home');
  assert.equal(w.document.activeElement.querySelector('img').alt,'VMMToken');
  key('ArrowDown');
  assert.equal(w.document.activeElement.querySelector('img').alt,'CRYPTOMAP360');
  key('Escape');
  assert.equal(panel.hidden,true);
  assert.equal(w.document.activeElement,toggle);
  toggle.click();
  w.document.querySelector('input').focus();
  assert.equal(panel.hidden,true);
});

test('Ecosystem restores mobile scrolling on backdrop, resize and Community search', t => {
  const w=boot(t), {toggle,panel}=menu(w);
  w.innerWidth=390;
  w.document.body.style.overflow='auto';
  toggle.click();
  assert.equal(w.document.body.style.overflow,'hidden');
  w.document.querySelector('.shell-ecosystem-backdrop').click();
  assert.equal(w.document.body.style.overflow,'auto');
  toggle.click();
  w.innerWidth=1280; w.dispatchEvent(new w.Event('resize'));
  assert.equal(w.document.body.style.overflow,'auto');
  w.innerWidth=390; w.dispatchEvent(new w.Event('resize'));
  assert.equal(w.document.body.style.overflow,'hidden');
  w.dispatchEvent(new w.CustomEvent('nexora-community-search'));
  assert.equal(panel.hidden,true);
  assert.equal(w.document.body.style.overflow,'auto');
});

test('Ecosystem uses the six staging destinations without inventing a VMMTRAVEL URL', t => {
  const w=boot(t), {toggle,panel}=menu(w);
  const items=Array.from(panel.querySelectorAll('[role="menuitem"]'));
  assert.deepEqual(items.map(item=>[item.querySelector('img').alt,item.getAttribute('href')]),[
    ['VMMToken','https://vmmtoken.com'],
    ['CRYPTOMAP360','https://staging.cryptopmap360.com'],
    ['VMMTRAVEL',null],
    ['Moongle Mall','https://moonglemall.com'],
    ['nailhub','https://staging.nailhub.ai'],
    ['VLINKPAY','https://staging-web-app.vlinkpay.com']
  ]);
  for(const item of items.filter(item=>item.tagName==='A')) {
    assert.equal(item.target,'_blank');
    assert.equal(item.rel,'noopener noreferrer');
  }
  toggle.click(); items[2].click();
  assert.equal(panel.hidden,false);
  items[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
  assert.equal(panel.hidden,true);
});
