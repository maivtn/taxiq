import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const sources=['community-jobs-expansion.js','community-jobs-workflow.js'].map(name=>readFileSync(new URL('../../../html/v3.1/community/'+name,import.meta.url),'utf8'));
const clone=value=>JSON.parse(JSON.stringify(value));
const posting=(id,kind,owner)=>({id,kind,owner,title:id,city:'Houston, TX',role:'Technician',description:'Available in Houston.',status:'open',createdAt:new Date().toISOString()});

function setup(t,{role='staff',member='Demo',jobs=[]}={}){
  const dom=new JSDOM('<html lang="en"><body><section id="jobsView"><div id="jobTemplates"><button class="template-card" data-template="hiring">Hiring</button><button class="template-card" data-template="seeking">Seeking</button></div><div class="feature-layout"><h2 id="jobListTitle"></h2><span id="jobCount"></span><div id="jobPosts"></div></div></section><div id="modal"></div></body></html>',{url:'https://demo.test/',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const {window}=dom,document=window.document,navigation=[];
  let currentRole=role,rows=clone(jobs),saves=0;
  const adapter={role:()=>currentRole,currentMember:member,language:()=> 'en',getJobs:()=>rows,saveJobs:next=>{rows=clone(next);saves++;return true;},navigate:(...args)=>navigation.push(args),openDialog:html=>{document.getElementById('modal').innerHTML=html;},closeDialog:()=>document.getElementById('modal').replaceChildren()};
  for(const source of sources)window.eval(source);
  const api=window.NEXORA_COMMUNITY_JOBS.mount(adapter);
  const click=(action,id='')=>{
    const control=document.createElement('button');
    control.dataset.jobsExtra=action;control.dataset.id=id;document.body.append(control);control.click();control.remove();
  };
  return {window,document,api,navigation,click,get jobs(){return clone(rows);},get saves(){return saves;},switchRole:value=>{currentRole=value;api.render();}};
}

test('personal and staff see only seeking creation and cannot open employer routes',t=>{
  const s=setup(t);
  assert.equal(s.document.querySelector('[data-template="hiring"]').hidden,true);
  assert.equal(s.document.querySelector('[data-template="seeking"]').hidden,false);
  assert.equal(s.document.querySelector('[data-jobs-action="open-pos"]'),null);
  assert.equal(s.api.openEditor('hiring'),false);
  assert.equal(s.api.saveJob(posting(undefined,'hiring','Demo')),false);
  s.api.navigate('workers');
  assert.equal(s.document.getElementById('jobsView').dataset.jobsTab,'browse');
  assert.ok(s.api.saveJob(posting(undefined,'seeking','Demo')));
  assert.equal(s.jobs[0].kind,'seeking');
});

test('salon creation opens recruitment in the salon and excludes seeking tools',t=>{
  const s=setup(t,{role:'owner'});
  assert.equal(s.document.querySelector('[data-template="hiring"]').hidden,false);
  assert.equal(s.document.querySelector('[data-template="seeking"]').hidden,true);
  s.document.querySelector('[data-template="hiring"]').click();
  assert.equal(s.navigation[0][0],'posRecruitment');
  assert.equal(s.api.openEditor('seeking'),false);
  assert.equal(s.api.saveJob(posting(undefined,'seeking','Demo')),false);
  assert.ok(s.api.saveJob(posting(undefined,'hiring','Demo')));
  s.api.navigate('availability');
  assert.equal(s.document.getElementById('jobsView').dataset.jobsTab,'browse');
});

test('same member cannot edit or close records from a different active role',t=>{
  const s=setup(t,{jobs:[posting('old-hiring','hiring','Demo'),posting('seeking','seeking','Demo')]});
  assert.equal(s.api.openEditor('hiring',{id:'old-hiring'}),false);
  assert.equal(s.api.saveJob({...s.jobs[0],description:'Changed'}),false);
  assert.equal(s.api.closeJob('old-hiring'),false);
  s.api.navigate('myPosts');
  assert.equal(s.document.querySelector('[data-job-id="old-hiring"]'),null);
  s.switchRole('owner');
  assert.equal(s.document.querySelector('[data-job-id="seeking"]'),null);
  assert.equal(s.api.saveJob({...s.jobs[1],description:'Changed'}),false);
  assert.equal(s.api.closeJob('seeking'),false);
  assert.equal(s.saves,0);
});

test('personal hides salon transfer and employer tabs and rejects their direct routes',t=>{
  const s=setup(t,{jobs:[{...posting('old-transfer','transfer','Demo'),transferType:'sell'}]});
  s.api.navigate('transfer');
  assert.equal(s.document.querySelector('[data-jobs-extra="new-transfer"]'),null);
  assert.equal(s.document.querySelector('[data-jobs-extra="edit"]'),null);
  assert.equal(s.document.querySelector('[data-jobs-extra="delete"]'),null);
  assert.equal(s.document.getElementById('jobsView').dataset.jobsTab,'browse');
  for(const tab of ['transfer','workers','services']){
    assert.equal(s.document.querySelector('[data-jobs-tab="'+tab+'"]'),null);
    s.api.navigate(tab);
    assert.equal(s.document.getElementById('jobsView').dataset.jobsTab,'browse');
  }
  assert.equal(s.document.getElementById('jobPosts').textContent.includes('old-transfer'),false);
  s.api.navigate('jobs',{jobId:'old-transfer'});
  assert.equal(s.document.querySelector('[data-jobs-dialog]'),null);
  for(const [action,id]of [['new-transfer',''],['new-service-request',''],['detail','old-transfer'],['message','old-transfer'],['edit','old-transfer'],['close','old-transfer'],['delete','old-transfer'],['confirm-delete','old-transfer']])s.click(action,id);
  assert.equal(s.document.getElementById('jobsExtraForm'),null);
  assert.equal(s.document.querySelector('[data-jobs-dialog]'),null);
  assert.equal(s.saves,0);
  assert.equal(s.jobs[0].status,'open');
});

test('transfer submit checks active role again, including after reading image files',async t=>{
  const s=setup(t,{role:'owner'});
  s.api.navigate('transfer');s.document.querySelector('[data-jobs-extra="new-transfer"]').click();
  const form=s.document.getElementById('jobsExtraForm');
  assert.ok(form);assert.equal(form.elements.transferType.value,'sell');
  form.elements.title.value='Salon transfer';form.elements.city.value='Houston, TX';form.elements.description.value='Salon available.';
  let completeRead;
  s.window.FileReader=class {readAsDataURL(){completeRead=()=>{this.result='data:image/png;base64,AA==';this.onload();};}};
  Object.defineProperty(form.elements.photos,'files',{value:[new s.window.File(['x'],'photo.png',{type:'image/png'})]});
  form.dispatchEvent(new s.window.Event('submit',{bubbles:true,cancelable:true}));
  s.switchRole('staff');completeRead();await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(s.saves,0);
  form.dispatchEvent(new s.window.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(s.saves,0);
});

test('salon can publish and manage transfers while seeking remains unavailable',async t=>{
  const s=setup(t,{role:'owner'});
  s.api.navigate('transfer');s.document.querySelector('[data-jobs-extra="new-transfer"]').click();
  const form=s.document.getElementById('jobsExtraForm');
  form.elements.title.value='Salon transfer';form.elements.city.value='Houston, TX';form.elements.description.value='Salon available.';
  form.dispatchEvent(new s.window.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(s.jobs[0].kind,'transfer');assert.equal(s.jobs[0].transferType,'sell');
  s.document.querySelector('[data-jobs-extra="close"]').click();
  assert.equal(s.jobs[0].status,'closed');
  s.document.querySelector('[data-jobs-extra="delete"]').click();s.document.querySelector('[data-jobs-extra="confirm-delete"]').click();
  assert.equal(s.jobs.length,0);
});
