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
const menuLabels = ['One QR', 'Tip QR', 'Accept Payment', 'Referral Link', 'Quảng cáo'];
function app(t, {path='oneqr-personal.html?account=personal', saved, publicPage=false}={}) {
  const source = readFileSync(new URL(publicPage ? '../customer/oneqr-personal.html' : path.split('?')[0], pages), 'utf8');
  const dom = new JSDOM(source, {url: 'https://nexora.test/html/' + (publicPage ? 'customer/' : 'pages/') + path, runScripts: 'outside-only'});
  t.after(()=>dom.window.close()); const w=dom.window;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  w.URL.createObjectURL=()=> 'blob:demo';w.URL.revokeObjectURL=()=>{};
  if(saved)w.localStorage.setItem('nexora.personal-oneqr.v1',JSON.stringify(saved));
  w.eval(storeSource);
  if(!publicPage){
    w.NEXORA_SHELL={activePage:'staff',activeTab:'one-qr',salonLinked:w.NEXORA_PERSONAL_QR.linked,onNavigate(tab){w.NEXORA_PERSONAL_QR.navigate(tab);}};
    for(const file of ['nexora-icons.js','nexora-shell-nav.js','nexora-shell.js'])w.eval(readFileSync(new URL(file,assets),'utf8'));
  }
  w.eval(uiSource);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}
const click=(w,action)=>w.document.querySelector('[data-pqr-action="'+action+'"]').click();
function input(w,selector,value){const node=w.document.querySelector(selector);node.value=value;node.dispatchEvent(new w.Event('input',{bubbles:true}));return node;}
function submit(w,selector){w.document.querySelector(selector).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}

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
 assert.match(unlinked.document.querySelector('#pqr-panel').textContent,/Chưa liên kết tiệm/);
 assert.equal(unlinked.document.querySelector('#pqr-panel [data-pqr-qr]'),null);
 const staff=app(t,{path:'frame-staff.html?tab=tip-qr'}),select=staff.document.querySelector('[data-pqr-salon]');
 assert.equal(select.options.length,2);select.value=select.options[1].value;select.dispatchEvent(new staff.Event('change',{bubbles:true}));
 assert.match(staff.document.querySelector('#pqr-panel [data-pqr-qr]').dataset.pqrQr,/salon=lux-nail-lounge/);
});
test('the personal builder keeps all required areas and excludes Business role, industry and identity controls',t=>{
 const w=app(t),main=w.document.querySelector('main');
 for(const label of ['Hoạt động hôm nay','Nội dung hiển thị','Cấu hình','Xem trước','Thông tin dùng chung','Hiệu quả One QR','Liên hệ nhận được'])assert.ok(main.textContent.includes(label),label);
 assert.equal(main.querySelectorAll('.pqr-builder > section').length,3);
 assert.doesNotMatch(main.textContent,/Change industry|Identity|Customer|Station|Staff Portal/);
 assert.ok(main.textContent.includes('Dữ liệu minh hoạ'));
});
test('editing, toggling, reordering, adding and deleting links updates the preview; QR remains stable',t=>{
 const w=app(t),d=w.document,qr=d.querySelector('[data-pqr-qr]').dataset.pqrQr;
 input(w,'[data-pqr-name]','QR của An');input(w,'[data-pqr-greeting]','Xin chào');
 input(w,'[data-link-index="0"] [data-link-field=name]','Hồ sơ của An');
 assert.match(d.querySelector('[data-pqr-phone]').textContent,/Hồ sơ của An/);
 const toggle=d.querySelector('[data-link-index="0"] [data-link-field=enabled]');toggle.checked=false;toggle.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.doesNotMatch(d.querySelector('[data-pqr-phone]').textContent,/Hồ sơ của An/);
 d.querySelector('[data-pqr-action=down][data-index="0"]').click();assert.equal(d.querySelector('[data-link-index="1"] [data-link-field=name]').value,'Hồ sơ của An');
 click(w,'add');input(w,'[data-pqr-new-link] [name=name]','Website');input(w,'[data-pqr-new-link] [name=url]','https://example.com/an');submit(w,'[data-pqr-new-link]');
 assert.match(d.querySelector('[data-pqr-phone]').textContent,/Website/);
 const last=d.querySelectorAll('[data-pqr-action=remove]');last[last.length-1].click();assert.doesNotMatch(d.querySelector('[data-pqr-phone]').textContent,/Website/);
 click(w,'save');assert.equal(w.NEXORA_PERSONAL_QR.read().name,'QR của An');assert.equal(d.querySelector('[data-pqr-qr]').dataset.pqrQr,qr);
});
test('invalid URLs and missing names are kept as drafts and cannot be saved',t=>{
 const w=app(t),before=w.localStorage.getItem(w.NEXORA_PERSONAL_QR.KEY);
 input(w,'[data-link-index="0"] [data-link-field=url]','javascript:alert(1)');click(w,'save');
 assert.ok(w.document.querySelector('[data-link-field=url][aria-invalid=true]'));
 assert.equal(w.localStorage.getItem(w.NEXORA_PERSONAL_QR.KEY),before);
 assert.equal(w.document.querySelector('[data-pqr-phone] [data-pqr-link=profile]'),null);
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
 w.NEXORA_PERSONAL_QR.navigate('accept-payment');w.document.querySelector('[data-pqr-method=Zelle]').click();
 input(w,'[data-pqr-payment-form] [name=identifier]','an@example.com');submit(w,'[data-pqr-payment-form]');
 assert.ok(w.document.querySelector('#pqr-panel [data-pqr-qr]'));
 w.NEXORA_PERSONAL_QR.navigate('one-qr');assert.ok(w.document.querySelector('[data-pqr-phone] [data-pqr-link=payment]'));
});
test('ads require explicit consent and never credit earnings for a preview or click',t=>{
 const w=app(t);w.NEXORA_PERSONAL_QR.navigate('advertising');const d=w.document;
 assert.equal(d.querySelector('[data-pqr-consent]').checked,false);assert.equal(d.querySelector('[data-pqr-action=activate]').disabled,true);
 click(w,'activate');assert.equal(w.NEXORA_PERSONAL_QR.read().ads,false);
 const checkbox=d.querySelector('[data-pqr-consent]');checkbox.checked=true;checkbox.dispatchEvent(new w.Event('change',{bubbles:true}));click(w,'activate');
 assert.equal(w.NEXORA_PERSONAL_QR.read().ads,true);assert.match(d.querySelector('#pqr-panel').textContent,/Chưa có dữ liệu/);
 w.NEXORA_PERSONAL_QR.navigate('one-qr');assert.ok(d.querySelector('.pqr-sponsored'));d.querySelector('[data-pqr-link=instagram]').click();
 assert.equal(Object.hasOwn(w.NEXORA_PERSONAL_QR.read(),'balance'),false);
});
test('changing the demo salon state preserves QR identity, custom content, payment settings and referral',t=>{
 const first=app(t);input(first,'[data-pqr-name]','QR cá nhân');click(first,'save');const saved=first.NEXORA_PERSONAL_QR.read();saved.payments.Venmo='@an';
 const staff=app(t,{path:'frame-staff.html',saved}),next=staff.NEXORA_PERSONAL_QR.read();
 for(const key of ['id','name','referral'])assert.equal(next[key],saved[key]);
 assert.deepEqual(JSON.parse(JSON.stringify(next.links)),JSON.parse(JSON.stringify(saved.links)));assert.equal(next.payments.Venmo,'@an');
 const unlinked=app(t,{path:'frame-personal.html',saved:next});assert.equal(unlinked.NEXORA_PERSONAL_QR.read().salonId,null);assert.equal(unlinked.NEXORA_PERSONAL_QR.read().payments.Venmo,'@an');
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
 const result=api.read();assert.equal(result.profile.phone,'555-111-1234');assert.equal(result.profile.showPhone,false);assert.equal(result.payments.Venmo,'@new-target');assert.equal(result.greeting,'Lời chào mới');
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
 input(w,'[data-pqr-name]','');input(w,'[data-link-index="0"] [data-link-field=url]','javascript:alert(1)');
 click(w,'profile');input(w,'[data-pqr-profile-form] [name=bio]','Đôi nét về tôi');submit(w,'[data-pqr-profile-form]');
 assert.equal(w.NEXORA_PERSONAL_QR.read().name,before.name);assert.equal(w.NEXORA_PERSONAL_QR.read().links[0].url,before.links[0].url);
 w.NEXORA_PERSONAL_QR.navigate('accept-payment');w.document.querySelector('[data-pqr-method=Zelle]').click();input(w,'[data-pqr-payment-form] [name=identifier]','an@example.com');submit(w,'[data-pqr-payment-form]');
 assert.equal(w.NEXORA_PERSONAL_QR.read().name,before.name);
 w.NEXORA_PERSONAL_QR.navigate('advertising');const consent=w.document.querySelector('[data-pqr-consent]');consent.checked=true;consent.dispatchEvent(new w.Event('change',{bubbles:true}));click(w,'activate');
 assert.equal(w.NEXORA_PERSONAL_QR.read().ads,true);assert.equal(w.NEXORA_PERSONAL_QR.read().name,before.name);assert.equal(w.NEXORA_PERSONAL_QR.read().links[0].url,before.links[0].url);
});
test('the default linked Tip link targets an authorized salon and opens its public QR',t=>{
 const w=app(t,{path:'frame-staff.html'}),saved=w.NEXORA_PERSONAL_QR.read(),tip=saved.links.find(link=>link.kind==='tip');
 const target=new URL(tip.url);assert.ok(w.NEXORA_PERSONAL_QR.salons.some(salon=>salon.id===target.searchParams.get('salon')));
 const publicW=app(t,{path:target.pathname.split('/').at(-1)+target.search,saved,publicPage:true});
 assert.doesNotMatch(publicW.document.body.textContent,/Chưa có QR hợp lệ/);assert.match(publicW.document.body.textContent,/Bitcoin Nail Bar/);
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
