import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/assets/community-v2/community-shifts-workflow.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../../../html/assets/community-v2/community-shifts-workflow.css',import.meta.url),'utf8');
const KEY='nexora-community-shifts-workflow-v1',HOUR=3600000,MINUTE=60000;
const image='data:image/jpeg;base64,YWJj';
const plain=value=>JSON.parse(JSON.stringify(value));

function setup(options={}) {
  const dom=new JSDOM('<html lang="en"><head></head><body><section id="dayworkView"><div class="feature-intro"><h2>Extra shifts</h2></div><div id="shiftTemplates"><button data-template="dayhire">Need a worker</button><button data-template="daywork">Available</button></div><div class="chip-row"></div><div><div id="shiftPosts"></div></div></section><div id="modalRoot"></div></body></html>',{url:'https://demo.test/community',runScripts:'outside-only'});
  const {window}=dom;window.document.head.innerHTML='<style>.btn{display:inline-flex}'+styles+'</style>';
  let clock=Date.UTC(2026,9,29,12),member=options.member||'Worker A',role=options.role||'staff',saveFails=false;
  const start=clock+2*24*HOUR,end=start+8*HOUR;
  let rows=options.rows||[{id:'s1',kind:'dayhire',owner:'Salon A',title:'Need a worker',industry:'Nail & làm đẹp',role:'Thợ nail',city:'Houston, TX',date:'2026-10-31',hours:'12:00–20:00',startsAt:new Date(start).toISOString(),endsAt:new Date(end).toISOString(),skills:'Gel-X',pay:'200',period:'Mỗi ngày',status:'open',acceptMode:'Approval',workersNeeded:1,latitude:29.76,longitude:-95.36}];
  const seed={version:1,availability:{'Worker A':{isAvailable:true,availableDays:[],maxDistanceMiles:10,city:'Houston, TX',skills:'Gel-X'}},zelle:{'staff:Worker A':{accountInfo:'worker@example.test',accountName:'Worker A'},'owner:Salon A':{accountInfo:'salon@example.test',accountName:'Salon A'}},assignments:[],settlements:[],invitations:[],...options.state};
  window.localStorage.setItem(KEY,JSON.stringify(seed));
  const notices=[],contexts=[],chats=[];
  const adapter={
    currentMember:()=>member,role:()=>role,now:()=>clock,getShifts:()=>rows,
    saveShifts:next=>{if(saveFails)return false;rows=plain(next);return true;},
    getProfile:()=>options.noProfile?{exists:false,basicSavedAt:null}:{exists:true,basicSavedAt:'2026-10-20T12:00:00Z',city:'Houston, TX',skills:'Gel-X'},
    toast:notice=>notices.push(notice),onState:context=>contexts.push(context),openChat:context=>chats.push(context),
    openDialog:markup=>{window.document.getElementById('modalRoot').innerHTML=markup;},
    closeDialog:()=>window.document.getElementById('modalRoot').replaceChildren(),
    openTemplate:(kind,prefill={})=>{
      window.document.getElementById('modalRoot').innerHTML='<form id="templateForm" data-kind="'+kind+'"><div class="dialog-body"><input name="hours"></div></form>';
      const form=window.document.getElementById('templateForm');form.elements.hours.value=prefill.hours||'';return form;
    }
  };
  window.eval(source);const api=window.NEXORA_COMMUNITY_SHIFTS.mount(adapter);
  return {dom,window,api,adapter,notices,contexts,chats,start,end,state:()=>JSON.parse(window.localStorage.getItem(KEY)),rows:()=>rows,as:(nextRole,nextMember)=>{role=nextRole;member=nextMember;api.render();},at:value=>{clock=value;},failSave:value=>{saveFails=value;}};
}

function claim(s,id='s1') {const assignment=s.api.act('claim',id,{agreed:true});assert.ok(assignment);return assignment;}
function apply(s,id='s1') {const assignment=claim(s,id);assert.equal(s.api.act('proof',assignment.settlementId,{images:[image]}),true);return assignment;}
function book(s,id='s1') {const assignment=apply(s,id);s.as('owner','Salon A');assert.equal(s.api.act('approve',assignment.id),true);return assignment;}

test('PO forms and intro stay present; each role only sees its authorized posting form',t=>{
  const s=setup();t.after(()=>s.dom.window.close());
  assert.ok(s.window.document.querySelector('#dayworkView>.feature-intro'));
  assert.equal(s.window.getComputedStyle(s.window.document.querySelector('#shiftTemplates [data-template="dayhire"]')).display,'none');
  assert.equal(s.window.document.querySelector('#shiftTemplates [data-template="daywork"]').hidden,false);
  assert.ok(s.window.document.querySelector('[data-shifts-tab="browse"]'));
  s.as('owner','Salon A');
  assert.equal(s.window.document.querySelector('[data-shifts-tab="browse"]'),null);
  assert.equal(s.window.document.querySelector('#shiftTemplates [data-template="dayhire"]').hidden,false);
  assert.equal(s.window.document.querySelector('#shiftTemplates [data-template="daywork"]').hidden,true);
});

test('approval lifecycle uses one shared post and returns wage plus the received deposit',t=>{
  const s=setup();t.after(()=>s.dom.window.close());
  const assignment=book(s);
  assert.equal(s.state().assignments[0].status,'Confirmed');
  assert.equal(s.api.act('approve',assignment.id),false,'repeating an approval does not duplicate a booking');
  s.as('staff','Worker A');s.at(s.start-30*MINUTE);
  assert.equal(s.api.act('checkIn',assignment.id,{latitude:29.76,longitude:-95.36}),true);
  s.as('owner','Salon A');assert.equal(s.api.act('complete',assignment.id),true);
  const payout=s.state().settlements.find(row=>row.type==='CompletionPayment');
  assert.equal(payout.amount,240);assert.equal(payout.shiftId,'s1');assert.equal(payout.assignmentId,assignment.id);
  assert.equal(s.api.act('proof',payout.id,{images:[image]}),true);
  s.as('staff','Worker A');assert.equal(s.api.act('receive',payout.id),true);
  assert.equal(s.state().assignments[0].status,'Completed');
  assert.equal(s.state().settlements.find(row=>row.id===payout.id).status,'Received');
  assert.equal(s.rows().length,1);assert.equal(s.rows()[0].id,'s1');
});

test('claims require the worker profile, both Zelle accounts and policy consent',t=>{
  const s=setup();t.after(()=>s.dom.window.close());
  assert.equal(s.api.act('claim','s1',{}),false);
  let state=s.state();delete state.zelle['staff:Worker A'];s.window.localStorage.setItem(KEY,JSON.stringify(state));
  assert.equal(s.api.act('claim','s1',{agreed:true}),false);
  assert.equal(s.api.act('zelle','',{accountInfo:'worker@example.test',accountName:'Worker A'}),true);
  state=s.state();delete state.zelle['owner:Salon A'];s.window.localStorage.setItem(KEY,JSON.stringify(state));
  assert.equal(s.api.act('claim','s1',{agreed:true}),false);
  assert.equal(s.state().assignments.length,0);
  const missing=setup({noProfile:true});t.after(()=>missing.dom.window.close());
  assert.equal(missing.api.act('claim','s1',{agreed:true}),false);
});

test('instant booking confirms only after deposit receipt and respects the held capacity',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.rows()[0].acceptMode='Instant';
  const assignment=apply(s);assert.equal(s.state().assignments[0].status,'AwaitingDepositConfirmation');
  s.as('staff','Worker B');s.api.act('zelle','',{accountInfo:'b@example.test'});
  assert.equal(s.api.act('claim','s1',{agreed:true}),false);
  s.as('owner','Salon A');assert.equal(s.api.act('receive',assignment.settlementId),true);
  assert.equal(s.state().assignments[0].status,'Confirmed');
});

test('automatic lifecycle releases unpaid holds and confirms an unanswered Instant receipt',t=>{
  const unpaid=setup();t.after(()=>unpaid.dom.window.close());claim(unpaid);unpaid.at(Date.UTC(2026,9,29,12)+31*MINUTE);unpaid.api.render();
  assert.equal(unpaid.state().assignments[0].status,'Expired');assert.equal(unpaid.state().settlements[0].status,'Cancelled');
  const instant=setup();t.after(()=>instant.dom.window.close());instant.rows()[0].acceptMode='Instant';apply(instant);instant.at(Date.UTC(2026,9,29,12)+3*HOUR);instant.api.render();
  assert.equal(instant.state().assignments[0].status,'Confirmed');assert.equal(instant.state().settlements[0].status,'Received');
});

test('duplicate claims and overlapping bookings cannot reserve a second record',t=>{
  const s=setup();t.after(()=>s.dom.window.close());claim(s);
  assert.equal(s.api.act('claim','s1',{agreed:true}),false);
  s.rows().push({...s.rows()[0],id:'s2'});
  assert.equal(s.api.act('claim','s2',{agreed:true}),false);
  assert.equal(s.state().assignments.length,1);
});

test('owner approval fills the slot, rejects other applicants and creates their full refund',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const a=apply(s);
  s.as('staff','Worker B');s.api.act('zelle','',{accountInfo:'b@example.test'});const b=apply(s);
  s.as('owner','Salon A');assert.equal(s.api.act('approve',a.id),true);
  assert.equal(s.state().assignments.find(row=>row.id===b.id).status,'Rejected');
  const refund=s.state().settlements.find(row=>row.assignmentId===b.id&&row.type==='DepositRefund');assert.equal(refund.amount,40);
});

test('invitations share shift identity, only their recipient responds, and acceptance follows deposit steps',t=>{
  const s=setup({role:'owner',member:'Salon A'});t.after(()=>s.dom.window.close());
  assert.equal(s.api.act('invite','s1',{worker:'Worker A'}),true);
  const invitation=s.state().invitations[0];assert.equal(invitation.shiftId,'s1');
  assert.equal(s.api.act('invite','s1',{worker:'Worker A'}),false);
  s.as('staff','Worker B');assert.equal(s.api.act('declineInvitation',invitation.id),false);
  s.as('staff','Worker A');const assignment=s.api.act('claim','s1',{agreed:true,invitationId:invitation.id});assert.ok(assignment);
  assert.equal(s.state().invitations[0].status,'Accepted');
  assert.equal(s.state().invitations[0].assignmentId,assignment.id);
  assert.equal(s.state().assignments[0].status,'AwaitingDepositProof');
});

test('declining, withdrawal, expiry and reinvitation cooldown stay scoped and persist',t=>{
  const s=setup({role:'owner',member:'Salon A'});t.after(()=>s.dom.window.close());s.api.act('invite','s1',{worker:'Worker A'});let invitation=s.state().invitations[0];
  s.as('staff','Worker A');assert.equal(s.api.act('declineInvitation',invitation.id),true);
  assert.equal(s.state().invitations[0].status,'Declined');
  s.as('owner','Salon A');assert.equal(s.api.act('invite','s1',{worker:'Worker A'}),true);invitation=s.state().invitations.at(-1);
  assert.equal(s.api.act('withdrawInvitation',invitation.id),true);
  assert.equal(s.api.act('invite','s1',{worker:'Worker A'}),false);
  s.at(Date.UTC(2026,9,29,12)+6*MINUTE);assert.equal(s.api.act('invite','s1',{worker:'Worker A'}),true);
  s.at(Date.UTC(2026,9,30,2));s.api.render();assert.equal(s.state().invitations.at(-1).status,'Expired');
});

test('cross-account and wrong-role assignment or payment actions expose no controls or mutations',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=apply(s),before=s.window.localStorage.getItem(KEY);
  s.as('owner','Other salon');assert.equal(s.api.act('approve',assignment.id),false);assert.equal(s.api.act('cancelShift','s1'),false);
  assert.equal(s.api.openAssignment(assignment.id),false);assert.equal(s.api.openSettlement(assignment.settlementId),false);
  s.as('staff','Worker B');assert.equal(s.api.act('cancelAssignment',assignment.id),false);assert.equal(s.api.act('proof',assignment.settlementId,{images:[image]}),false);
  assert.equal(s.window.localStorage.getItem(KEY),before);
  s.as('owner','Worker A');assert.equal(s.api.act('claim','s1',{agreed:true}),false);
});

test('worker cancellation before confirmation returns full deposit even within the late window',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.rows()[0].startsAt=new Date(Date.UTC(2026,9,29,12)+5*HOUR).toISOString();s.rows()[0].endsAt=new Date(Date.UTC(2026,9,29,12)+10*HOUR).toISOString();
  const assignment=apply(s);assert.equal(s.api.act('cancelAssignment',assignment.id),true);
  const state=s.state();assert.equal(state.assignments[0].isLateCancellation,false);assert.equal(state.settlements.find(row=>row.type==='DepositRefund').amount,40);
});

test('confirmed worker cancellation refunds full deposit outside 24h and half inside 24h',t=>{
  const early=setup();t.after(()=>early.dom.window.close());const a=book(early);early.as('staff','Worker A');assert.equal(early.api.act('cancelAssignment',a.id),true);
  assert.equal(early.state().settlements.find(row=>row.type==='DepositRefund').amount,40);
  const late=setup();t.after(()=>late.dom.window.close());const b=book(late);late.as('staff','Worker A');late.at(late.start-2*HOUR);assert.equal(late.api.act('cancelAssignment',b.id),true);
  assert.equal(late.state().assignments[0].isLateCancellation,true);assert.equal(late.state().settlements.find(row=>row.type==='DepositRefund').amount,20);
});

test('owner cancellation updates the same Feed post and owes late compensation plus deposit',t=>{
  const s=setup();t.after(()=>s.dom.window.close());book(s);s.at(s.start-2*HOUR);
  assert.equal(s.api.act('cancelShift','s1'),true);
  assert.equal(s.rows()[0].id,'s1');assert.equal(s.rows()[0].status,'closed');
  assert.equal(s.state().assignments[0].status,'BusinessCancelled');
  const payout=s.state().settlements.find(row=>row.type==='CancellationCompensation');assert.equal(payout.amount,140);
  assert.equal(payout.breakdown.compensation,100);assert.equal(payout.breakdown.depositRefund,40);
});

test('check-in enforces window and GPS radius, with presence fallback and owner confirmation',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=book(s);s.as('staff','Worker A');
  assert.equal(s.api.act('checkIn',assignment.id,{latitude:29.76,longitude:-95.36}),false);
  s.at(s.start-30*MINUTE);assert.equal(s.api.act('checkIn',assignment.id,{latitude:0,longitude:0}),false);
  assert.equal(s.api.act('requestPresence',assignment.id),true);assert.ok(s.state().assignments[0].presenceRequestedAt);
  s.as('owner','Salon A');assert.equal(s.api.act('absent',assignment.id),false);
  assert.equal(s.api.act('present',assignment.id),true);assert.equal(s.state().assignments[0].checkInMethod,'BusinessConfirmed');
  assert.equal(s.api.act('cancelShift','s1'),false);
});

test('automatic no-show can be disputed but cannot be completed by the worker',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=book(s);s.as('staff','Worker A');s.at(s.start+16*MINUTE);s.api.render();
  assert.equal(s.state().assignments[0].status,'NoShow');
  assert.equal(s.state().settlements.filter(row=>row.type==='DepositRefund').length,0);
  assert.equal(s.api.act('disputeOutcome',assignment.id,{reason:'I arrived on time'}),true);
  assert.equal(s.api.act('complete',assignment.id),false);assert.equal(s.state().assignments[0].dispute.status,'Open');
});

test('an open owner issue prevents manual and automatic completion',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=book(s);s.as('staff','Worker A');s.at(s.start-10*MINUTE);s.api.act('checkIn',assignment.id,{latitude:29.76,longitude:-95.36});
  s.as('owner','Salon A');assert.equal(s.api.act('reportIssue',assignment.id,{reason:'Please review attendance'}),true);
  assert.equal(s.api.act('complete',assignment.id),false);s.at(s.end+13*HOUR);s.api.render();assert.equal(s.state().assignments[0].status,'InProgress');
});

test('payments enforce payer/payee, proof shape, receipt confirmation and missing-transfer disputes',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=claim(s);
  assert.equal(s.api.act('receive',assignment.settlementId),false);
  assert.equal(s.api.act('proof',assignment.settlementId,{images:[]}),false);
  assert.equal(s.api.act('proof',assignment.settlementId,{images:['javascript:alert(1)']}),false);
  assert.equal(s.api.act('proof',assignment.settlementId,{images:[image]}),true);
  s.as('owner','Salon A');assert.equal(s.api.act('proof',assignment.settlementId,{images:[image]}),false);
  assert.equal(s.api.act('disputeSettlement',assignment.settlementId,{reason:'Transfer has not arrived'}),true);
  assert.equal(s.state().settlements[0].status,'Disputed');assert.equal(s.api.act('approve',assignment.id),false);
});

test('disputing a previously received deposit cancels its unpaid refund',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=apply(s);s.api.act('cancelAssignment',assignment.id);
  assert.equal(s.state().settlements.find(row=>row.type==='DepositRefund').status,'AwaitingProof');
  s.as('owner','Salon A');assert.equal(s.api.act('disputeSettlement',assignment.settlementId,{reason:'Deposit never arrived'}),true);
  assert.equal(s.state().settlements.find(row=>row.type==='DepositRefund').status,'Cancelled');
});

test('overdue outgoing payouts block posting, inviting and approving, with a scoped Pay now action',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=book(s);s.at(s.start-2*HOUR);s.api.act('cancelShift','s1');
  s.at(s.start+23*HOUR);s.api.render();
  assert.ok(s.window.document.querySelector('.shifts-overdue'));assert.equal(s.api.act('invite','s1',{worker:'Worker A'}),false);
  const form=s.adapter.openTemplate('dayhire');s.api.enhance(form);
  assert.equal(s.api.beforeSave({date:'2026-11-02',hours:'12:00–20:00',pay:200,period:'Mỗi ngày'},form),null);
  s.as('staff','Worker B');assert.equal(s.window.document.querySelector('.shifts-overdue'),null);
  assert.equal(s.api.openSettlement(s.state().settlements.find(row=>row.type!=='Deposit').id),false);
});

test('failed shared-post persistence rolls back the whole cancellation and sends no success notification',t=>{
  const s=setup();t.after(()=>s.dom.window.close());book(s);s.failSave(true);const before=s.window.localStorage.getItem(KEY);
  assert.equal(s.api.act('cancelShift','s1'),false);
  assert.equal(s.window.localStorage.getItem(KEY),before);assert.equal(s.rows()[0].status,'open');
  assert.equal(s.state().assignments[0].status,'Confirmed');assert.equal(s.notices.some(notice=>notice==='Shift cancelled.'),false);
});

test('failed workflow persistence leaves assignments and posts untouched',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const before=s.window.localStorage.getItem(KEY);
  const storagePrototype=Object.getPrototypeOf(s.window.localStorage),original=storagePrototype.setItem;
  storagePrototype.setItem=function(){throw new Error('quota exceeded');};
  assert.equal(s.api.act('claim','s1',{agreed:true}),false);
  storagePrototype.setItem=original;
  assert.equal(s.window.localStorage.getItem(KEY),before);assert.equal(s.rows().length,1);
});

test('each mutation reloads persisted records so a newer invitation or other member setting is retained',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const fresh=s.state();fresh.availability['Other worker']={isAvailable:true,city:'Dallas, TX'};fresh.invitations.push({id:'newer',shiftId:'s1',owner:'Salon A',worker:'Worker A',status:'Pending',expiresAt:new Date(s.start).toISOString()});s.window.localStorage.setItem(KEY,JSON.stringify(fresh));
  assert.equal(s.api.act('availability','',{maxDistanceMiles:25}),true);
  assert.equal(s.state().availability['Other worker'].city,'Dallas, TX');assert.equal(s.state().invitations[0].id,'newer');
});

test('the shared PO availability post enables staff without a second workflow write',t=>{
  const s=setup();t.after(()=>s.dom.window.close());assert.equal(s.api.act('availability','',{isAvailable:false}),true);
  const before=s.window.localStorage.getItem(KEY);
  const row={id:'availability',kind:'daywork',owner:'Worker A',title:'Available',city:'Houston, TX',date:'2026-10-31',hours:'12:00–20:00',skills:'Gel-X',createdAt:new Date(Date.UTC(2026,9,29,12)+MINUTE).toISOString()};
  s.rows().push(row);s.api.afterSave(row);
  assert.equal(s.window.document.querySelector('[data-shifts-availability]').checked,true);
  assert.equal(s.window.localStorage.getItem(KEY),before);
});

test('PO form enhancement preserves short fields, optional detail controls and edit identity',t=>{
  const s=setup({role:'owner',member:'Salon A'});t.after(()=>s.dom.window.close());
  const form=s.adapter.openTemplate('dayhire',s.rows()[0]);assert.equal(s.api.enhance(form,s.rows()[0]),true);assert.equal(s.api.enhance(form,s.rows()[0]),true);
  assert.equal(form.querySelectorAll('[data-shifts-options]').length,1);assert.ok(form.elements.hours);
  const values=s.api.beforeSave({kind:'dayhire',date:'2026-10-31',hours:'12:00–20:00',pay:'200',period:'Mỗi ngày'},form);
  assert.equal(values.id,'s1');assert.equal(values.workersNeeded,1);assert.equal(values.acceptMode,'Approval');assert.equal(values.hours,'12:00–20:00');
  assert.equal(form.querySelector('[data-shifts-options]').open,false);
});

test('deep links retain the source shift, assignment and settlement context without leaking other accounts',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=apply(s);
  assert.equal(s.api.navigate({shiftTab:'payments',settlementId:assignment.settlementId}),true);
  const context=s.contexts.at(-1);assert.equal(context.shiftId,'s1');assert.equal(context.assignmentId,assignment.id);assert.equal(context.settlementId,assignment.settlementId);
  assert.match(s.window.document.getElementById('modalRoot').textContent,/Zelle payment/);
  s.as('staff','Worker B');assert.equal(s.api.navigate({assignmentId:assignment.id}),false);
  assert.doesNotMatch(s.window.document.getElementById('modalRoot').textContent,/worker@example/);
});

test('closing a shift dialog clears every deep-link target while an unrelated close publishes nothing',t=>{
  const s=setup();t.after(()=>s.dom.window.close());const assignment=apply(s);
  s.api.navigate({settlementId:assignment.settlementId});
  s.window.document.querySelector('[data-shifts-action="close"]').click();
  const context=s.contexts.at(-1);assert.equal(context.shiftId,null);assert.equal(context.assignmentId,null);assert.equal(context.settlementId,null);
  const count=s.contexts.length;s.api.onDialogClosed();assert.equal(s.contexts.length,count);
});

test('dates use US month/day/year and all module dropdowns reserve the required arrow inset',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.openShift('s1');
  assert.match(s.window.document.querySelector('.shifts-dialog').textContent,/Oct 31, 2026/);
  assert.match(styles,/background-size:16px/);assert.match(styles,/background-position:right 16px center/);assert.match(styles,/padding-right:44px/);
  assert.match(styles,/@media\(max-width:600px\)/);
});
