import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {boot} from './helpers/shell-fixture.mjs';

const assets = new URL('../../../html/assets/', import.meta.url);
const pages = new URL('../../../html/pages/', import.meta.url);
const storeSource = readFileSync(new URL('personal-oneqr-store.js', assets), 'utf8');
const uiSource = readFileSync(new URL('personal-oneqr.js', assets), 'utf8');
const menuLabels = ['One QR', 'Tip QR', 'Accept Payment', 'Referral Link', 'Advertising'];
function app(t, {path='oneqr-personal.html?account=personal', saved, publicPage=false}={}) {
  const source = readFileSync(new URL(publicPage ? '../customer/oneqr-personal.html' : path.split('?')[0], pages), 'utf8');
  const dom = new JSDOM(source, {url: 'https://nexora.test/html/' + (publicPage ? 'customer/' : 'pages/') + path, runScripts: 'outside-only'});
  t.after(()=>dom.window.close()); const w=dom.window;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  w.URL.createObjectURL=()=> 'blob:demo';w.URL.revokeObjectURL=()=>{};
  if(saved)w.localStorage.setItem('nexora.personal-oneqr.v1',JSON.stringify(saved));
  w.eval(readFileSync(new URL('oneqr-action-appearance.js',assets),'utf8'));
  w.eval(storeSource);
  if(!publicPage){
    w.NEXORA_SHELL={activePage:'staff',activeTab:'one-qr',salonLinked:w.NEXORA_PERSONAL_QR.linked,onNavigate(tab){w.NEXORA_PERSONAL_QR.navigate(tab);}};
    for(const file of ['nexora-icons.js','nexora-shell-nav.js','nexora-shell.js','oneqr-advertising-po.js','personal-oneqr-advertising-template.js','oneqr-advertising.js','receive-payment-methods.js'])w.eval(readFileSync(new URL(file,assets),'utf8'));
  }
  w.eval(uiSource);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}
const click=(w,action)=>w.document.querySelector(action==='activate'?'#oneqr-advertising #activate':'[data-pqr-action="'+action+'"]').click();
function input(w,selector,value){const node=w.document.querySelector(selector);node.value=value;node.dispatchEvent(new w.Event('input',{bubbles:true}));return node;}
function submit(w,selector){w.document.querySelector(selector).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
function selectAdIndustry(w){for(const [id,value] of [['group','beauty'],['industry','nail']]){const select=w.document.querySelector('#oneqr-advertising #'+id);select.value=value;select.dispatchEvent(new w.Event('change',{bubbles:true}));}}

test('both Personal states have the same five One QR destinations directly after Community',t=>{
 for(const linked of [false,true]){
  const w=boot(t,{activePage:'staff',activeTab:'one-qr',before(w){w.NEXORA_SHELL.salonLinked=linked;}}),d=w.document;
  const group=d.querySelector('[data-staff-group="one-qr"]'),sub=d.querySelector('#staff-subnav-one-qr');
  assert.ok(group);assert.equal(group.getAttribute('aria-expanded'),'true');
  assert.deepEqual(Array.from(sub.querySelectorAll('a'),a=>a.textContent),menuLabels);
  const community=linked?d.querySelector('#staff-subnav-community'):d.querySelector('[data-staff-nav="community"]');
  assert.equal(community.nextElementSibling,group);
  for(const link of sub.querySelectorAll('a')){
   const url=new URL(link.href);assert.equal(url.pathname.split('/').at(-1),linked?'oneqr-staff.html':'oneqr-personal.html');
   if(!linked)assert.equal(url.searchParams.get('account'),'personal');
   assert.ok(existsSync(new URL(url.pathname.split('/').at(-1),pages)));
  }
  assert.equal(d.querySelectorAll('[data-staff-nav="my-qr"], [data-staff-nav="payout-methods"]').length,0);
  assert.equal(Boolean(d.querySelector('[data-staff-group="workspace"]')),linked);
  assert.equal(Boolean(d.querySelector('[data-staff-nav="my-calendar"]')),linked);
 }
});
test('One QR sidebar and top tabs stay synchronized and the parent can collapse',t=>{
 const w=app(t),d=w.document;
 for(const id of ['tip-qr','accept-payment','referral-link','advertising','one-qr']){
  d.querySelector('[data-pqr-tab="'+id+'"]').click();
  assert.equal(d.querySelector('[data-personal-qr-nav][aria-current=page]').dataset.personalQrNav,id);
  assert.equal(d.querySelector('[role=tabpanel]').getAttribute('aria-labelledby'),'pqr-tab-'+id);
 }
 d.querySelector('[data-personal-qr-nav="advertising"]').click();assert.equal(d.querySelector('[data-pqr-tab][aria-selected=true]').dataset.pqrTab,'advertising');
 const group=d.querySelector('[data-staff-group="one-qr"]');group.click();assert.equal(group.getAttribute('aria-expanded'),'false');group.click();assert.equal(group.getAttribute('aria-expanded'),'true');
});
test('mobile Staff sidebar has the same One QR group and removes old duplicate entries',()=>{
 const dom=new JSDOM(readFileSync(new URL('staff-app.html',pages),'utf8'));
 const menu=dom.window.document.querySelector('[data-staff-sidebar-template]').content;
 assert.deepEqual(Array.from(menu.querySelectorAll('[data-staff-oneqr-group] a'),a=>a.textContent),menuLabels);
 assert.equal(menu.querySelectorAll('[data-menu-key="my-qr"], [data-menu-key="payout-methods"]').length,0);
 assert.match(readFileSync(new URL('staff-app.html',pages),'utf8'),/staff-qr-legacy\.js/);dom.window.close();
});
test('unlinked Personal cannot display a salon tip QR, while the linked demo can select authorized salons',t=>{
 const unlinked=app(t,{path:'frame-personal.html?tab=tip-qr'});
 assert.match(unlinked.document.querySelector('#pqr-panel').textContent,/No salon linked/);
 assert.equal(unlinked.document.querySelector('#pqr-panel [data-pqr-qr]'),null);
 const staff=app(t,{path:'frame-staff.html?tab=tip-qr'}),d=staff.document;
 assert.equal(d.querySelectorAll('[data-salon-qr-list] [data-pqr-qr]').length,3);
 assert.equal(d.querySelector('[data-pqr-salon]'),null);
 d.querySelector('[data-pqr-salon-view="lux-nail-lounge"]').click();
 assert.match(d.querySelector('.pqr-dialog [data-pqr-qr]').dataset.pqrQr,/salon\/lux-nail-lounge\/staff\/david-le918747/);
});
test('Personal and Staff builders share the required areas without duplicate profile, activity or module controls',t=>{
 for(const path of ['oneqr-personal.html?account=personal','oneqr-staff.html','frame-personal.html','frame-staff.html']){
  const w=app(t,{path}),main=w.document.querySelector('main');
  const headings=Array.from(main.querySelectorAll('h2,h3'),node=>node.textContent.trim());
  for(const label of ['Modules','Configuration','Live Preview','OneQR performance','Contacts sent back'])assert.equal(headings.filter(text=>text===label).length,1,path+': '+label);
  assert.equal(main.querySelectorAll('.pqr-builder > section').length,3,path);
  assert.equal(main.querySelectorAll('.pqr-activity').length,1,path);
  assert.equal(main.querySelectorAll('[data-pqr-action=profile]').length,1,path);
  assert.equal(main.querySelectorAll('[data-pqr-action=add],[data-pqr-action=reset]').length,0,path);
  assert.doesNotMatch(main.textContent,/Today’s activity|Shared profile|Change industry|Identity|Customer|Station|Staff Portal/);
  assert.ok(main.textContent.includes('Demo data'));
 }
});
test('editing, toggling, reordering, adding and deleting links updates the preview; QR remains stable',t=>{
 const w=app(t),d=w.document,qr=d.querySelector('[data-pqr-qr]').dataset.pqrQr;
 input(w,'[data-pqr-name]','QR của An');input(w,'[data-pqr-greeting]','Xin chào');
 input(w,'[data-link-index="0"] [data-link-field=name]','Hồ sơ của An');
 assert.match(d.querySelector('[data-pqr-phone]').textContent,/Hồ sơ của An/);
 const toggle=d.querySelector('[data-link-index="0"] [data-link-field=enabled]');toggle.checked=false;toggle.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.doesNotMatch(d.querySelector('[data-pqr-phone]').textContent,/Hồ sơ của An/);
 d.querySelector('[data-link-index="0"] [data-pqr-module-drag]').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));assert.equal(d.querySelector('[data-link-index="1"] [data-link-field=name]').value,'Hồ sơ của An');
 input(w,'[data-pqr-add-form] [name=url]','https://example.com/an');submit(w,'[data-pqr-add-form]');const added=d.querySelector('[data-link-index]:last-child');input(w,'[data-link-id="'+added.dataset.linkId+'"] [data-link-field=name]','Website');
 assert.match(d.querySelector('[data-pqr-phone]').textContent,/Website/);
 const last=d.querySelectorAll('[data-pqr-action=remove]');last[last.length-1].click();assert.doesNotMatch(d.querySelector('[data-pqr-phone]').textContent,/Website/);
 click(w,'save');assert.equal(w.NEXORA_PERSONAL_QR.read().name,'QR của An');assert.equal(d.querySelector('[data-pqr-qr]').dataset.pqrQr,qr);
});
test('invalid URLs and missing names are kept as drafts and cannot be saved',t=>{
 const w=app(t),before=w.localStorage.getItem(w.NEXORA_PERSONAL_QR.KEY);
 input(w,'[data-link-index="1"] [data-link-field=url]','javascript:alert(1)');click(w,'save');
 assert.ok(w.document.querySelector('[data-link-field=url][aria-invalid=true]'));
 assert.equal(w.localStorage.getItem(w.NEXORA_PERSONAL_QR.KEY),before);
 assert.equal(w.document.querySelector('[data-pqr-phone] [data-pqr-link=instagram]'),null);
 input(w,'[data-pqr-name]','');click(w,'save');assert.ok(w.document.querySelector('[data-pqr-name][aria-invalid=true]'));
});
test('profile editing defaults private and public page and vCard share only opted-in contact data',t=>{
 const w=app(t);click(w,'profile');
 assert.equal(w.document.querySelector('[name=showPhone]').checked,false);assert.equal(w.document.querySelector('[name=showEmail]').checked,false);
 input(w,'[data-pqr-profile-form] [name=phone]','555-111-1234');input(w,'[data-pqr-profile-form] [name=email]','private@example.com');
 input(w,'[data-pqr-profile-form] [name=bio]','Đôi nét về An');submit(w,'[data-pqr-profile-form]');
 const saved=w.NEXORA_PERSONAL_QR.read();saved.payments.Zelle='secret-payment@example.com';saved.leads=[{name:'Private lead'}];
 const publicW=app(t,{path:'oneqr-personal.html',saved,publicPage:true}),text=publicW.document.body.textContent;
 assert.doesNotMatch(text,/private@example.com|555-111-1234|secret-payment|Private lead|Thu nhập/);
 assert.match(text,/Đôi nét về An/);assert.doesNotMatch(publicW.NEXORA_PERSONAL_QR.vcard(saved),/TEL:|EMAIL:/);
 saved.profile.showEmail=true;assert.match(publicW.NEXORA_PERSONAL_QR.vcard(saved),/EMAIL:private@example.com/);
});
test('payment configuration controls the public payment link without depending on salon membership',t=>{
 const w=app(t);assert.equal(w.document.querySelector('[data-pqr-phone] [data-pqr-link=payment]'),null);
 w.NEXORA_PERSONAL_QR.navigate('accept-payment');w.document.querySelector('[data-rp-edit=zelle]').click();
 input(w,'[data-rp-form] [name=holder]','An Nguyen');input(w,'[data-rp-form] [name=identifier]','an@example.com');submit(w,'[data-rp-form]');
 assert.ok(w.document.querySelector('#pqr-panel [data-pqr-qr]'));
 w.NEXORA_PERSONAL_QR.navigate('one-qr');assert.ok(w.document.querySelector('[data-pqr-phone] [data-pqr-link=payment]'));
 w.NEXORA_PERSONAL_QR.navigate('accept-payment');w.document.querySelector('[data-rp-toggle=zelle]').click();
 assert.equal(w.NEXORA_PERSONAL_QR.hasPayment(w.NEXORA_PERSONAL_QR.read()),false);
 assert.equal(w.NEXORA_PERSONAL_QR.read().payments.Zelle.identifier,'an@example.com');
 assert.equal(w.document.querySelectorAll('[data-rp-row]').length,6);
});
test('referral placement reuses the old invite payload in its QR and matching module',t=>{
 const w=app(t),api=w.NEXORA_PERSONAL_QR;api.navigate('referral-link');
 const original=new URL(api.referralUrl(api.read())),right=w.document.querySelector('[name=referral-placement][value=right]');
 right.checked=true;right.dispatchEvent(new w.Event('change',{bubbles:true}));
 const saved=api.read(),target=new URL(api.referralUrl(saved));
 assert.equal(target.searchParams.get('leg'),'right');
 assert.equal(target.searchParams.get('staff'),original.searchParams.get('staff'));
 assert.equal(target.searchParams.get('ref'),original.searchParams.get('ref'));
 assert.equal(w.document.querySelector('.pqr-referral-code [data-pqr-qr]').dataset.pqrQr,target.href);
 assert.equal(api.visibleLinks(saved).find(link=>link.kind==='referral').url,target.href);
 api.navigate('one-qr');
 assert.equal(w.document.querySelector('[data-link-id=referral] .pqr-module-url').textContent,target.href);
});
test('ads require explicit consent and never credit earnings for a preview or click',t=>{
 const w=app(t);w.NEXORA_PERSONAL_QR.navigate('advertising');const d=w.document;
 assert.equal(d.querySelector('#oneqr-advertising #agree').checked,false);assert.equal(d.querySelector('#oneqr-advertising #activate').disabled,true);
 click(w,'activate');assert.equal(w.NEXORA_PERSONAL_QR.read().ads,false);
 selectAdIndustry(w);
 const checkbox=d.querySelector('#oneqr-advertising #agree');checkbox.checked=true;checkbox.dispatchEvent(new w.Event('change',{bubbles:true}));click(w,'activate');
 assert.equal(w.NEXORA_PERSONAL_QR.read().ads,true);assert.equal(d.querySelector('#oneqr-advertising .balance').textContent,'0');
 assert.deepEqual(Array.from(w.NEXORA_PERSONAL_QR.read().adIndustries),['nail']);
 d.querySelector('#oneqr-advertising #ads-toggle').click();
 assert.equal(w.NEXORA_PERSONAL_QR.read().ads,false);
 for(const id of ['chosen','adIndustry'])assert.equal(d.querySelector('#oneqr-advertising #'+id).textContent,d.querySelector('#oneqr-advertising #industry').selectedOptions[0].textContent);
 d.querySelector('#oneqr-advertising #ads-toggle').click();
 w.NEXORA_PERSONAL_QR.navigate('one-qr');assert.ok(d.querySelector('.pqr-sponsored'));d.querySelector('[data-pqr-link=instagram]').click();
 assert.equal(Object.hasOwn(w.NEXORA_PERSONAL_QR.read(),'balance'),false);
});
test('changing the demo salon state preserves QR identity, custom content, payment settings and referral',t=>{
 const first=app(t);input(first,'[data-pqr-name]','QR cá nhân');click(first,'save');const saved=first.NEXORA_PERSONAL_QR.read();saved.payments.Venmo='@an';
 const staff=app(t,{path:'frame-staff.html',saved}),next=staff.NEXORA_PERSONAL_QR.read();
 for(const key of ['id','name','referral'])assert.equal(next[key],saved[key]);
 assert.deepEqual(JSON.parse(JSON.stringify(next.links)),JSON.parse(JSON.stringify(saved.links)));assert.equal(next.payments.Venmo.identifier,'@an');
 const unlinked=app(t,{path:'frame-personal.html',saved:next});assert.equal(unlinked.NEXORA_PERSONAL_QR.read().salonId,null);assert.equal(unlinked.NEXORA_PERSONAL_QR.read().payments.Venmo.identifier,'@an');
});
test('contacts are added only by a voluntary submit and appear only in the private inbox',t=>{
 const w=app(t);assert.equal(w.NEXORA_PERSONAL_QR.read().leads.length,0);click(w,'exchange');
 input(w,'[data-pqr-exchange-form] [name=name]','Người gửi');input(w,'[data-pqr-exchange-form] [name=email]','sender@example.com');submit(w,'[data-pqr-exchange-form]');
 assert.equal(w.NEXORA_PERSONAL_QR.read().leads.length,1);assert.match(w.document.querySelector('[data-pqr-leads]').textContent,/Người gửi/);
 const publicW=app(t,{path:'oneqr-personal.html',saved:w.NEXORA_PERSONAL_QR.read(),publicPage:true});assert.doesNotMatch(publicW.document.body.textContent,/sender@example.com/);
});
test('legacy Staff QR bookmarks redirect to the shared personal tool without altering unrelated screens',()=>{
 const source=readFileSync(new URL('staff-qr-legacy.js',assets),'utf8');
 for(const [suffix,tab]of [['#staff-my-qr-screen','tip-qr'],['?tab=payout-methods','accept-payment'],['#staff-home-screen',null]]){
  let redirect=null;const url=new URL('https://nexora.test/html/pages/staff-app.html'+suffix);
  vm.runInNewContext(source,{URL,location:{href:url.href,hash:url.hash,replace(value){redirect=value;}},window:{addEventListener(){}}});
  assert.equal(redirect,tab?'oneqr-staff.html?tab='+tab:null);
 }
});

test('saving an older editor never restores another tab’s contact privacy or erases newer payment details',t=>{
 const w=app(t),api=w.NEXORA_PERSONAL_QR;
 const fresh=api.read();fresh.profile.showPhone=false;fresh.profile.phone='555-111-1234';fresh.payments.Venmo='@new-target';
 w.localStorage.setItem(api.KEY,JSON.stringify(fresh));
 input(w,'[data-pqr-greeting]','Lời chào mới');click(w,'save');
 const result=api.read();assert.equal(result.profile.phone,'555-111-1234');assert.equal(result.profile.showPhone,false);assert.equal(result.payments.Venmo.identifier,'@new-target');assert.equal(result.greeting,'Lời chào mới');
});
test('a stale profile dialog preserves a privacy update received while it was open',t=>{
 const seed=app(t).NEXORA_PERSONAL_QR.read();seed.profile.phone='555-111-1234';seed.profile.showPhone=true;
 const w=app(t,{saved:seed});click(w,'profile');
 const fresh=w.NEXORA_PERSONAL_QR.read();fresh.profile.showPhone=false;
 w.localStorage.setItem(w.NEXORA_PERSONAL_QR.KEY,JSON.stringify(fresh));w.dispatchEvent(new w.StorageEvent('storage',{key:w.NEXORA_PERSONAL_QR.KEY}));
 input(w,'[data-pqr-profile-form] [name=bio]','Giới thiệu mới');submit(w,'[data-pqr-profile-form]');
 assert.equal(w.NEXORA_PERSONAL_QR.read().profile.showPhone,false);assert.equal(w.NEXORA_PERSONAL_QR.read().profile.bio,'Giới thiệu mới');
});
test('profile, payment and ad saves never publish invalid builder drafts',t=>{
 const w=app(t),before=w.NEXORA_PERSONAL_QR.read();
 input(w,'[data-pqr-name]','');input(w,'[data-link-index="1"] [data-link-field=url]','javascript:alert(1)');
 click(w,'profile');input(w,'[data-pqr-profile-form] [name=bio]','Đôi nét về tôi');submit(w,'[data-pqr-profile-form]');
 assert.equal(w.NEXORA_PERSONAL_QR.read().name,before.name);assert.equal(w.NEXORA_PERSONAL_QR.read().links[1].url,before.links[1].url);
 w.NEXORA_PERSONAL_QR.navigate('accept-payment');w.document.querySelector('[data-rp-edit=zelle]').click();input(w,'[data-rp-form] [name=holder]','An Nguyen');input(w,'[data-rp-form] [name=identifier]','an@example.com');submit(w,'[data-rp-form]');
 assert.equal(w.NEXORA_PERSONAL_QR.read().name,before.name);
 w.NEXORA_PERSONAL_QR.navigate('advertising');selectAdIndustry(w);const consent=w.document.querySelector('#oneqr-advertising #agree');consent.checked=true;consent.dispatchEvent(new w.Event('change',{bubbles:true}));click(w,'activate');
 assert.equal(w.NEXORA_PERSONAL_QR.read().ads,true);assert.equal(w.NEXORA_PERSONAL_QR.read().name,before.name);assert.equal(w.NEXORA_PERSONAL_QR.read().links[1].url,before.links[1].url);
});
test('the linked Tip module and salon cards reuse the previous staff QR destinations',t=>{
 const w=app(t,{path:'frame-staff.html'}),api=w.NEXORA_PERSONAL_QR,tip=api.read().links.find(link=>link.kind==='tip');
 assert.equal(tip.url,api.salons[0].tipUrl);
 api.navigate('tip-qr');
 assert.deepEqual(Array.from(w.document.querySelectorAll('[data-salon-qr-list] [data-pqr-qr]'),node=>node.dataset.pqrQr),Array.from(api.salons,salon=>salon.tipUrl));
});

test('cross-tab link deletions synchronize editor rows before another edit and keep local drafts',t=>{
 const w=app(t),api=w.NEXORA_PERSONAL_QR;
 const fresh=api.read();fresh.links.splice(0,1);fresh.links.pop();
 w.localStorage.setItem(api.KEY,JSON.stringify(fresh));w.dispatchEvent(new w.StorageEvent('storage',{key:api.KEY}));
 assert.equal(w.document.querySelectorAll('[data-link-index]').length,fresh.links.length);
 assert.equal(w.document.querySelector('[data-link-index="0"] [data-link-field=name]').value,fresh.links[0].name);
 input(w,'[data-link-index="0"] [data-link-field=name]','Tên đang chỉnh');
 const newer=api.read();newer.profile.bio='Giới thiệu từ tab khác';
 w.localStorage.setItem(api.KEY,JSON.stringify(newer));w.dispatchEvent(new w.StorageEvent('storage',{key:api.KEY}));
 assert.equal(w.document.querySelector('[data-link-index="0"] [data-link-field=name]').value,'Tên đang chỉnh');
 click(w,'save');assert.equal(api.read().links[0].name,'Tên đang chỉnh');assert.equal(api.read().profile.bio,'Giới thiệu từ tab khác');
});

test('the standalone Staff One QR page always keeps the Staff sidebar and Staff destinations',t=>{
 for(const query of ['', '?account=personal', '?tab=tip-qr']){
  const w=app(t,{path:'oneqr-staff.html'+query}),d=w.document;
  assert.equal(w.NEXORA_PERSONAL_QR.linked,true);
  assert.ok(d.querySelector('[data-staff-group="workspace"]'));
  assert.ok(d.querySelector('[data-staff-nav="my-calendar"]'));
  assert.match(d.querySelector('.staff-profile-id').textContent,/Staff ID/);
  for(const link of d.querySelectorAll('[data-personal-qr-nav]'))assert.equal(new URL(link.href).pathname,'/html/pages/oneqr-staff.html');
  assert.equal(new URL(w.NEXORA_PERSONAL_QR.page('accept-payment')).pathname,'/html/pages/oneqr-staff.html');
 }
});

test('Personal and Staff add a custom URL directly and keep system destinations read-only',t=>{
 for(const path of ['oneqr-personal.html?account=personal','oneqr-staff.html']){
  const w=app(t,{path}),d=w.document,api=w.NEXORA_PERSONAL_QR,before=api.read();
  for(const link of before.links.filter(link=>link.kind)){
   const row=d.querySelector('[data-link-id="'+link.id+'"]');
   assert.equal(row.querySelector('[data-link-field=url]'),null,path+': '+link.id);
   assert.equal(row.querySelector('.pqr-module-url').textContent,api.moduleUrl(before,link));
  }
  const add=d.querySelector('[data-pqr-add-form] [type=submit]');assert.equal(add.disabled,true);
  input(w,'[data-pqr-add-form] [name=url]','https://example.com/promotion');assert.equal(add.disabled,false);
  submit(w,'[data-pqr-add-form]');
  assert.equal(d.querySelector('.pqr-dialog').open,false);
  const row=Array.from(d.querySelectorAll('[data-link-index]')).at(-1),id=row.dataset.linkId;
  assert.equal(row.querySelector('[data-link-field=name]').value,'Custom Link');
  assert.equal(row.querySelector('[data-link-field=url]').value,'https://example.com/promotion');
  assert.equal(api.read().links.length,before.links.length);
  input(w,'[data-link-id="'+id+'"] [data-link-field=name]','Promotion');
  input(w,'[data-link-id="'+id+'"] [data-link-field=url]','https://example.com/offer');click(w,'save');
  const saved=api.read().links.at(-1);assert.equal(saved.name,'Promotion');assert.equal(saved.url,'https://example.com/offer');
 }
});
test('dragging a module commits its order on drop and cancelling a drag preserves the order',t=>{
 const w=app(t),d=w.document,api=w.NEXORA_PERSONAL_QR,initial=Array.from(api.read().links,link=>link.id),main=d.querySelector('main');
 const pointer=(target,type,extra={})=>{const event=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(event,{button:0,pointerId:1,isPrimary:true,clientX:100,clientY:180,...extra});target.dispatchEvent(event);};
 const target=d.querySelector('[data-link-index="1"]');target.getBoundingClientRect=()=>({top:100,height:100});d.elementFromPoint=()=>target;
 pointer(d.querySelector('[data-pqr-module-drag]'),'pointerdown');pointer(main,'pointermove');pointer(main,'pointercancel');
 assert.deepEqual(Array.from(d.querySelectorAll('[data-link-index]'),row=>row.dataset.linkId),initial);
 pointer(d.querySelector('[data-pqr-module-drag]'),'pointerdown');pointer(main,'pointermove');pointer(main,'pointerup');
 const expected=[initial[1],initial[0],...initial.slice(2)];
 assert.deepEqual(Array.from(d.querySelectorAll('[data-link-index]'),row=>row.dataset.linkId),expected);
 assert.deepEqual(Array.from(api.read().links,link=>link.id),initial);click(w,'save');
 assert.deepEqual(Array.from(api.read().links,link=>link.id),expected);
});
test('the inline icon picker updates only its module and stays a draft until settings are saved',t=>{
 const w=app(t),d=w.document,api=w.NEXORA_PERSONAL_QR,before=api.read();
 d.querySelector('[data-link-index="0"] [data-pqr-action=icon]').click();
 assert.equal(d.querySelector('.pqr-dialog').open,false);
 const picker=d.querySelector('[data-pqr-icon-picker]');assert.ok(picker);assert.equal(picker.getAttribute('role'),'dialog');
 picker.querySelector('[data-pqr-icon=dollar-sign]').click();
 assert.equal(d.querySelector('[data-pqr-icon-picker]'),null);
 assert.match(d.querySelector('[data-link-index="0"] .oneqr-module-icon img').src,/dollar-sign-3d\.png$/);
 assert.equal(api.read().links[0].icon,before.links[0].icon);click(w,'save');
 assert.equal(api.read().links[0].icon,'dollar-sign');assert.equal(api.read().links[1].icon,before.links[1].icon);
});

test('icon uploads remain pending through compression and removing a pending item unblocks saving',t=>{
 const w=app(t),d=w.document,api=w.NEXORA_PERSONAL_QR,before=api.read(),images=[],sizes=[];
 w.FileReader=class{readAsDataURL(){this.result='data:image/png;base64,aWNvbg==';this.onload();}abort(){this.onabort?.();}};
 w.Image=class{constructor(){this.width=1024;this.height=512;images.push(this);}set src(value){this.source=value;}};
 w.HTMLCanvasElement.prototype.getContext=function(){return{drawImage:(image,x,y,width,height)=>sizes.push([width,height])};};
 w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/webp;base64,Y29tcHJlc3NlZA==';
 const upload=index=>{d.querySelector('[data-link-index="'+index+'"] [data-pqr-action=upload]').click();const field=d.querySelector('[data-pqr-icon-upload]');Object.defineProperty(field,'files',{configurable:true,value:[new w.File(['icon'],'icon.png',{type:'image/png'})]});field.dispatchEvent(new w.Event('change',{bubbles:true}));};
 upload(0);assert.equal(d.querySelector('[data-pqr-action=save]').disabled,true);
 images[0].onload();assert.deepEqual(sizes,[[256,128]]);assert.equal(d.querySelector('[data-pqr-action=save]').disabled,false);
 assert.equal(api.read().links[0].icon,before.links[0].icon);click(w,'save');assert.match(api.read().links[0].icon,/^data:image\/webp;/);
 upload(1);assert.equal(d.querySelector('[data-pqr-action=save]').disabled,true);
 d.querySelector('[data-link-index="1"] [data-pqr-action=remove]').click();assert.equal(d.querySelector('[data-pqr-action=save]').disabled,false);
 images[1].onload();click(w,'save');assert.equal(api.read().links.some(link=>link.id===before.links[1].id),false);
 upload(0);assert.equal(d.querySelector('[data-pqr-action=save]').disabled,true);
 d.querySelector('[data-link-index="0"] [data-pqr-action=icon]').click();d.querySelector('[data-pqr-icon-picker] [data-pqr-icon=dollar-sign]').click();
 assert.equal(d.querySelector('[data-pqr-action=save]').disabled,false);images[2].onload();click(w,'save');assert.equal(api.read().links[0].icon,'dollar-sign');
});
