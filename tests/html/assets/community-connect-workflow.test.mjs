import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const read=name=>readFileSync(new URL('../../../html/assets/community-v2/'+name,import.meta.url),'utf8');
const html=read('nexora-privacy-qr-layout.html'),coreSource=read('nexora-privacy-interactive.js'),workflowSource=read('community-connect-workflow.js'),groupSource=read('community-group-workflow.js');
const KEY='nexora-connect-workflow-v1',BASE='nexora-community-templates-v1';
const plain=value=>JSON.parse(JSON.stringify(value));
function boot(t,{member='BITCOIN NAIL BAR',role='owner',account='business',stored={}}={}) {
  const dom=new JSDOM(html,{url:'https://nexora.test/html/assets/community-v2/nexora-privacy-qr-layout.html?embedded=1&tour=0&member='+encodeURIComponent(member)+'&role='+role+'&account='+account,runScripts:'outside-only',pretendToBeVisual:true});
  t.after(()=>dom.window.close());const w=dom.window,d=w.document;
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.localStorage.setItem(BASE,JSON.stringify({groups:[{id:'g2',title:'Học Gel-X & Nail Art',owner:'Cộng đồng',groupType:'Community',industry:'Nail',region:'Toàn nước Mỹ'}],feed:[],joinedGroups:{g2:true},unrelated:'keep'}));
  for(const [key,value] of Object.entries(stored))w.localStorage.setItem(key,value);
  w.eval(groupSource);w.eval(coreSource);w.eval(workflowSource);
  const core=w.NEXORA_CONNECT_CORE,app=w.NEXORA_COMMUNITY_CONNECT;
  const click=selector=>{const element=d.querySelector(selector);assert.ok(element,selector);element.click();};
  const snapshot=()=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const key=w.localStorage.key(i);return [key,w.localStorage.getItem(key)];}));
  const fail=key=>{const original=w.Storage.prototype.setItem;w.Storage.prototype.setItem=function(name,value){if(name===key)throw new w.DOMException('Full','QuotaExceededError');return original.call(this,name,value);};};
  return {w,d,core,app,click,snapshot,fail};
}

test('same-thread preference rendering preserves the unsent draft and Escape is safe outside a chat',t=>{
  const app=boot(t);app.core.showDetail('chat-kim');app.d.querySelector('#messageText').value='Still typing';
  app.click('[data-chat-menu-toggle]');app.click('[data-chat-menu-action="theme"]');app.click('[data-chat-theme="pink"]');
  assert.equal(app.d.querySelector('#messageText').value,'Still typing');
  app.core.showSection('privacy');assert.doesNotThrow(()=>app.d.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
});

test('deleted seed history stays cleared when a new message reopens the same direct conversation',t=>{
  const app=boot(t);app.core.showDetail('chat-kim');app.click('[data-chat-menu-toggle]');app.click('[data-chat-menu-action="delete"]');app.click('[data-chat-confirm-delete]');
  app.core.showDetail('chat-kim');app.d.querySelector('#messageText').value='Start again';app.click('[data-send-message]');
  const texts=[...app.d.querySelectorAll('.chat-message-text')].map(node=>node.textContent);
  assert.deepEqual(texts,['Start again']);assert.equal(app.core.getState().clearedChats['chat-kim'],true);
});

test('blocking an existing contact updates Settings, its unblock list and call restrictions',t=>{
  const app=boot(t);app.core.showDetail('chat-kim');app.click('[data-chat-menu-toggle]');app.click('[data-chat-menu-action="block"]');
  app.core.showSection('privacy');assert.match(app.d.querySelector('#blockedSummary').textContent,/1 account/);
  app.core.showDetail('blocked');assert.match(app.d.querySelector('#detailPanel').textContent,/Kim Tuyen/);assert.ok(app.d.querySelector('[data-connect-action="unblock"]'));
  app.core.showSection('calls');assert.ok([...app.d.querySelectorAll('[data-start-call][data-call-name="Kim Tuyen"]')].every(button=>button.disabled));
  assert.equal(app.app.startCall('Kim Tuyen','voice'),false);
  app.core.showSection('privacy');app.core.showDetail('blocked');app.click('[data-connect-action="unblock"]');
  assert.match(app.d.querySelector('#blockedSummary').textContent,/0 accounts/);
});

test('private group connections join immediately, strangers accept a shared invite under their own identity',t=>{
  const owner=boot(t);owner.core.mutate(state=>{state.connections=['NX-2042'];});
  const room=owner.app.store.createPrivate('Private team',['Kim Tuyen','Guest']);
  assert.deepEqual(plain(owner.app.store.members(room.id)),['BITCOIN NAIL BAR','Kim Tuyen']);
  const invite=owner.app.store.read().invitations.find(row=>row.member==='Guest');assert.equal(invite.status,'pending');
  const guest=boot(t,{member:'Guest',account:'personal',stored:owner.snapshot()});
  assert.equal(guest.app.identity.role,'staff');assert.equal(guest.app.store.respond(invite.id,true),true);
  assert.deepEqual(plain(guest.app.store.members(room.id)),['BITCOIN NAIL BAR','Kim Tuyen','Guest']);
  assert.equal(guest.app.store.removeMember(room.id,'BITCOIN NAIL BAR'),false);
  assert.equal(JSON.parse(guest.w.localStorage.getItem(BASE)).groups.some(group=>group.id===room.id),false);
  assert.equal(guest.app.openRoom(room.id),true);assert.ok(guest.d.querySelector('[data-send-message]'));
});

test('shop owners can exclude and reinstate staff, staff cannot remove people or leave POS sync',t=>{
  const owner=boot(t),id='group-shop-bitcoin';assert.equal(owner.app.store.removeMember(id,'Kim Tuyen'),true);
  assert.ok(owner.app.store.room(id).excluded.includes('Kim Tuyen'));
  assert.equal(owner.app.store.removeMember(id,'Kim Tuyen',true),true);assert.ok(owner.app.store.members(id).includes('Kim Tuyen'));
  const staff=boot(t,{member:'Kim Tuyen',role:'tech',account:'business',stored:owner.snapshot()});
  assert.equal(staff.app.identity.role,'staff');assert.equal(staff.app.store.removeMember(id,'Sally Thanh Hoang'),false);assert.equal(staff.app.store.leave(id),false);
});

test('shared public Feed groups use source membership and never expose group-call controls',t=>{
  const app=boot(t);assert.equal(app.app.openCommunityGroup({id:'g2'}),true);
  assert.equal(app.d.querySelector('[data-send-message]').dataset.sendMessage,'group-public-g2');
  assert.equal(app.d.querySelector('[data-start-call]'),null);
  app.click('[data-connect-action="members"]');assert.match(app.d.querySelector('#connectMemberDrawer').textContent,/Public community/);
  assert.equal(app.d.querySelector('[data-connect-action="group-voice"]'),null);
  assert.equal(app.app.startCall('Gel-X','voice','group-public-g2'),false);
  const guest=boot(t,{member:'Guest',account:'personal',stored:app.snapshot()});assert.equal(guest.app.openCommunityGroup({id:'g2'}),false);
  assert.equal(guest.app.store.public.join('g2'),true);assert.equal(guest.app.openCommunityGroup({id:'g2'}),true);
  assert.equal(JSON.parse(guest.w.localStorage.getItem(BASE)).joinedGroupsByMember.Guest.g2,true);
});

test('reply, reaction, pin and search act on stable message IDs while retaining media and draft text',t=>{
  const app=boot(t),room=app.app.store.createPrivate('Pinned team',[]);app.app.openRoom(room.id);
  app.d.querySelector('#messageText').value='First message';app.click('[data-send-message]');
  const first=app.app.store.read().messages[room.id][0];assert.ok(first.id);assert.equal(first.author,'BITCOIN NAIL BAR');
  app.click('[data-connect-action="pin"]');assert.match(app.d.querySelector('.connect-pinned').textContent,/First message/);
  app.click('[data-connect-action="react"][data-connect-reaction="Heart"]');assert.deepEqual(plain(app.app.store.read().meta[room.id][first.id].reactions.Heart),['BITCOIN NAIL BAR']);
  app.click('[data-connect-action="reply"]');app.d.querySelector('#messageText').value='Reply draft';
  app.fail(KEY);app.click('[data-send-message]');assert.equal(app.d.querySelector('#messageText').value,'Reply draft');assert.ok(app.d.querySelector('.connect-reply-target'));
  assert.equal(app.app.store.read().messages[room.id].length,1);
});

test('nickname changes enforce source format and cooldown and use the active member profile',t=>{
  const app=boot(t,{member:'Guest',account:'personal'});assert.equal(app.d.querySelector('.profile-card .name').textContent,'Guest');
  assert.equal(app.d.querySelector('#profileQr > img'),null);
  assert.equal(app.app.saveNickname('NO spaces allowed'),false);assert.equal(app.app.saveNickname('guest.new'),true);
  assert.equal(app.d.querySelector('.profile-card .handle').textContent,'@guest.new');
  assert.equal(app.app.saveNickname('another.name'),false);assert.match(app.app.store.read().profiles.Guest.nextNicknameChangeAt,/T/);
});

test('phone/email searches require the complete value and the target discoverability permission',t=>{
  const app=boot(t),data=app.app.store.read();data.profiles['Kim Tuyen']={phone:'everyone',email:'nobody',calls:'nobody'};data.profiles['Sally Thanh Hoang']={phone:'nobody',email:'everyone'};app.w.localStorage.setItem(KEY,JSON.stringify(data));
  assert.equal(app.app.search('5550144').length,0);assert.equal(app.app.search('713-555-0144')[0].name,'Kim Tuyen');
  assert.equal(app.app.search('sally@example').length,0);assert.equal(app.app.search('sally@example.com')[0].name,'Sally Thanh Hoang');
  assert.equal(app.app.startCall('Kim Tuyen'),false);
});

test('failed privacy/request/call saves restore source values and do not claim success',t=>{
  const app=boot(t);app.fail(app.core.key);const old=app.core.getState().phone;
  const select=app.d.querySelector('[data-quick-setting="phone"]');select.value='everyone';select.dispatchEvent(new app.w.Event('change',{bubbles:true}));
  assert.equal(app.core.getState().phone,old);assert.equal(select.value,old);
  app.core.showDetail('request');app.click('[data-request-action="accepted"]');assert.equal(app.core.getState().request,'pending');
  assert.equal(app.app.startCall('Kim Tuyen','voice'),true);app.click('[data-connect-action="join-call"]');assert.equal(app.app.endCall(),false);assert.equal(app.app.getCall().phase,'active');
});

test('an async photo reader cannot attach to a different or closed conversation',t=>{
  const app=boot(t);let reader;app.w.FileReader=class {constructor(){reader=this;}readAsDataURL(){}};
  app.core.showDetail('chat-kim');const input=app.d.querySelector('#chatPhotoInput');Object.defineProperty(input,'files',{value:[new app.w.File(['x'],'photo.png',{type:'image/png'})]});
  input.dispatchEvent(new app.w.Event('change',{bubbles:true}));app.core.showDetail('chat-sally');reader.result='data:image/png;base64,eA==';reader.onload();
  assert.equal(app.d.querySelector('#chatAttachmentPreview').classList.contains('hidden'),true);
});

test('membership revocation clears the loaded transcript and rejects stale message actions and sends',t=>{
  const owner=boot(t),room=owner.app.store.createPrivate('Revoked room',['Guest']);
  owner.app.openRoom(room.id);owner.d.querySelector('#messageText').value='Private transcript';owner.click('[data-send-message]');
  const invitation=owner.app.store.read().invitations.find(row=>row.member==='Guest'),guest=boot(t,{member:'Guest',account:'personal',stored:owner.snapshot()});
  guest.app.store.respond(invitation.id,true);guest.app.openRoom(room.id);
  assert.match(guest.d.querySelector('.chat-message-list').textContent,/Private transcript/);
  const id=guest.app.store.read().messages[room.id][0].id,data=guest.app.store.read();data.rooms.find(row=>row.id===room.id).members=['BITCOIN NAIL BAR'];guest.w.localStorage.setItem(KEY,JSON.stringify(data));
  guest.app.refresh();assert.equal(guest.d.querySelector('#detailPanel').classList.contains('hidden'),true);
  assert.equal(guest.d.querySelector('#detailPanel').textContent,'');assert.equal(guest.core.getContext().messages.length,0);
  const before=guest.w.localStorage.getItem(KEY),forged=guest.d.createElement('button');forged.dataset.connectAction='react';forged.dataset.connectReaction='Heart';forged.dataset.connectMessage=id;guest.d.body.append(forged);forged.click();
  assert.equal(guest.w.localStorage.getItem(KEY),before);assert.equal(guest.core.appendChatMessage(room.id,{text:'No longer allowed'}),false);
  assert.equal(guest.app.store.read().messages[room.id].length,1);assert.equal(guest.app.openRoom(room.id),false);
});

test('legacy direct-chat metadata is scoped to its participant pair rather than leaking to another persona',t=>{
  const owner=boot(t);owner.core.showDetail('chat-kim');owner.click('[data-connect-action="react"][data-connect-reaction="Heart"]');
  const ownKeys=Object.keys(owner.app.store.read().meta);assert.ok(ownKeys.some(key=>key.startsWith('direct:')));assert.equal(owner.app.store.read().meta['chat-kim'],undefined);
  const guest=boot(t,{member:'Guest',account:'personal',stored:owner.snapshot()});guest.core.showDetail('chat-kim');
  assert.equal(guest.d.querySelector('[data-connect-action="react"][aria-pressed="true"]'),null);
  guest.click('[data-connect-action="react"][data-connect-reaction="Heart"]');
  const keys=Object.keys(guest.app.store.read().meta);assert.ok(keys.some(key=>key.includes('Guest')));assert.ok(keys.some(key=>key.includes('BITCOIN')));
});

test('public group legacy aliases share canonical message reactions and seen metadata',t=>{
  const app=boot(t);app.app.openCommunityGroup({id:'g2'});app.click('[data-connect-action="react"][data-connect-reaction="Heart"]');
  const seed=app.core.getContext().messages[0].id;assert.deepEqual(plain(app.app.store.read().meta['group-public-g2'][seed].reactions.Heart),['BITCOIN NAIL BAR']);
  app.core.showDetail('group-art');assert.ok(app.d.querySelector('[data-connect-action="react"][data-connect-reaction="Heart"][aria-pressed="true"]'));
  assert.equal(app.app.store.read().meta['group-art'],undefined);
});

test('incoming calls apply the recipient shared-only rule regardless of the caller call setting',t=>{
  const app=boot(t),data=app.app.store.read();data.profiles.Guest={name:'Guest',calls:'everyone'};app.w.localStorage.setItem(KEY,JSON.stringify(data));
  assert.equal(app.core.getState().calls,'shared');assert.equal(app.app.receiveCall('Guest'),false);assert.equal(app.app.getCall(),null);
  assert.equal(app.core.getState().callHistory.at(-1).type,'missed-voice');
  app.core.mutate(state=>{state.calls='everyone';});app.app.enhance();assert.equal(app.app.receiveCall('Guest'),true);
});

test('accepted Mai blocking publishes the member identity and existing nicknames remain unavailable',t=>{
  const app=boot(t);assert.equal(app.app.saveNickname('kim.tuyen'),false);
  app.core.mutate(state=>{state.request='accepted';});app.core.showDetail('chat-mai');app.click('[data-chat-menu-toggle]');app.click('[data-chat-menu-action="block"]');
  assert.ok(app.app.store.read().profiles['BITCOIN NAIL BAR'].blockedNames.includes('Mai Nguyễn'));
  assert.equal(app.app.store.read().profiles['BITCOIN NAIL BAR'].blockedNames.includes('chat-mai'),false);
});

test('host Back closes the top workflow modal before its member drawer or conversation',t=>{
  const app=boot(t);const room=app.app.store.createPrivate('Private team',[]);app.app.openRoom(room.id);
  app.click('[data-connect-action="members"]');app.click('[data-connect-action="invite"]');
  assert.ok(app.d.querySelector('#connectWorkflowDialog'));assert.ok(app.d.querySelector('#connectMemberDrawer'));
  const back=()=>app.w.dispatchEvent(new app.w.MessageEvent('message',{source:app.w.parent,origin:app.w.location.origin,data:{type:'nexora-back'}}));
  back();assert.equal(app.d.querySelector('#connectWorkflowDialog'),null);assert.ok(app.d.querySelector('#connectMemberDrawer'));
  assert.equal(app.core.getContext().currentDetail,room.id);
  back();assert.equal(app.d.querySelector('#connectMemberDrawer'),null);assert.equal(app.core.getContext().currentDetail,room.id);
  back();assert.equal(app.core.getContext().currentDetail,'');
});
