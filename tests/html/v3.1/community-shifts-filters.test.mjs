import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/v3.1/community/community-shifts-workflow.js',import.meta.url),'utf8');

function setup(t){
  const dom=new JSDOM('<html lang="en"><body><section id="dayworkView"><div id="shiftTemplates"></div></section></body></html>',{url:'https://demo.test/?account=personal',runScripts:'outside-only'});
  const {window}=dom,document=window.document;
  const assignments=['Confirmed','PendingApproval','InProgress','Completed','WorkerCancelled'].map(status=>({id:status,shiftId:'shift-'+status,worker:'Demo worker',owner:'Salon',status,payAmount:100}));
  assignments.push({id:'another-worker',shiftId:'shift-another-worker',worker:'Other worker',owner:'Salon',status:'Confirmed',payAmount:100});
  const shifts=assignments.map(row=>({id:row.shiftId,kind:'dayhire',owner:'Salon',title:row.id,city:'Houston, TX',startsAt:'2026-11-11T09:00:00Z',endsAt:'2026-11-11T17:00:00Z',pay:100}));
  window.localStorage.setItem('nexora-community-shifts-workflow-v1',JSON.stringify({assignments}));
  window.eval(source);
  const api=window.NEXORA_COMMUNITY_SHIFTS.mount({currentMember:'Demo worker',role:'staff',now:()=>Date.UTC(2026,10,9,12),getShifts:()=>shifts});
  t.after(()=>{api.destroy();window.close();});
  api.navigate('my-shifts');
  const select=()=>document.querySelector('[data-shifts-assignment-status]');
  const options=()=>[...select().options].map(option=>option.value);
  const visible=()=>[...document.querySelectorAll('#shift-panel-my-shifts [id^="shift-assignment-"]')].map(row=>row.id.replace('shift-assignment-',''));
  const choose=value=>{select().value=value;select().dispatchEvent(new window.Event('change',{bubbles:true}));};
  const tab=value=>document.querySelector('[data-shifts-action="filter"][data-shifts-id="'+value+'"]').click();
  return {document,select,options,visible,choose,tab};
}

test('Upcoming has one status dropdown and filters only the current worker active shifts',t=>{
  const s=setup(t);
  assert.equal(s.document.querySelectorAll('[data-shifts-assignment-status]').length,1);
  assert.equal(s.document.querySelectorAll('[data-shifts-action="assignmentStatus"]').length,0);
  assert.deepEqual(s.options(),['All','AwaitingDepositProof','AwaitingDepositConfirmation','PendingApproval','Confirmed','InProgress']);
  assert.deepEqual(s.visible(),['Confirmed','PendingApproval','InProgress']);
  s.choose('Confirmed');assert.deepEqual(s.visible(),['Confirmed']);
  s.choose('AwaitingDepositProof');assert.deepEqual(s.visible(),[]);
  s.choose('All');assert.deepEqual(s.visible(),['Confirmed','PendingApproval','InProgress']);
});

test('History exposes terminal states and changing the time tab resets the status filter',t=>{
  const s=setup(t);
  s.choose('Confirmed');s.tab('History');
  assert.equal(s.select().value,'All');
  assert.deepEqual(s.options(),['All','Completed','NoShow','Rejected','Expired','WorkerCancelled','BusinessCancelled']);
  assert.deepEqual(s.visible(),['Completed','WorkerCancelled']);
  s.choose('Completed');assert.deepEqual(s.visible(),['Completed']);
  s.choose('WorkerCancelled');assert.deepEqual(s.visible(),['WorkerCancelled']);
  s.tab('Active');assert.equal(s.select().value,'All');
  assert.deepEqual(s.visible(),['Confirmed','PendingApproval','InProgress']);
  assert.equal(s.options().includes('Completed'),false);
});
