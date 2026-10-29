import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/assets/community-v2/community-jobs-workflow.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../../../html/assets/community-v2/community-jobs-workflow.css',import.meta.url),'utf8');
const key='nexora-community-jobs-workflow-v1';
const plain=value=>JSON.parse(JSON.stringify(value));
const emptyState=()=>({version:1,profiles:{},applications:[],invites:[],savedJobs:{}});
const fixtureJobs=()=>[
  {id:'hiring-1',kind:'hiring',owner:'Salon A',title:'Hiring Gel-X technician',role:'Thợ nail',industry:'Nail & làm đẹp',city:'Houston, TX',skills:'Gel-X',pay:'24',period:'Mỗi giờ',description:'Four days a week; paid hourly.',status:'open',createdAt:'2026-10-20T12:00:00Z'},
  {id:'hiring-2',kind:'hiring',owner:'Salon B',title:'Restaurant team member',role:'Phục vụ',industry:'Nhà hàng & ăn uống',city:'Dallas, TX',skills:'Service',description:'Evening shift.',status:'open',createdAt:'2026-10-21T12:00:00Z'},
  {id:'seeking-1',kind:'seeking',owner:'Worker B',title:'Seeking work',role:'Thợ nail',industry:'Nail & làm đẹp',city:'Houston, TX',description:'Gel-X and nail art.',status:'open',createdAt:'2026-10-21T12:00:00Z'}
];

function setup({member='Worker A',role='staff',state=emptyState(),jobs=fixtureJobs(),seed=false}={}){
  const dom=new JSDOM('<html lang="en"><head></head><body><section id="jobsView"><div id="jobIndustryFilters"><button class="active" data-job-industry="all">All</button></div><div id="jobTemplates"><button class="template-card" data-template="hiring">Hiring</button><button class="template-card" data-template="seeking">Seeking</button></div><div class="feature-layout"><div><h2 id="jobListTitle"></h2><span id="jobCount"></span><div id="jobPosts"></div></div><aside></aside></div></section><div id="modal"></div></body></html>',{url:'https://demo.test/community.html',runScripts:'outside-only'});
  const {window}=dom;const notices=[],chats=[],navigation=[];let currentMember=member,currentRole=role,canSave=true,saves=0;
  let rows=plain(jobs);
  if(!seed)window.localStorage.setItem(key,JSON.stringify(state));
  window.NEXORA_US_GEO={states:{TX:'Texas',CA:'California'},cities:{TX:['Houston','Dallas'],CA:['Los Angeles']}};
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const adapter={currentMember:()=>currentMember,role:()=>currentRole,getJobs:()=>rows,saveJobs:next=>{saves++;if(!canSave)return false;rows=plain(next);return true;},escape,toast:message=>notices.push(message),onState:()=>{},navigate:(...value)=>navigation.push(value),openChat:value=>chats.push(value),closeDialog:()=>window.document.getElementById('modal').replaceChildren(),openDialog:html=>{window.document.getElementById('modal').innerHTML=html;},openTemplate:(kind,item={})=>{
    window.document.getElementById('modal').innerHTML='<form id="templateForm" data-kind="'+escape(kind)+'"><div class="dialog-body"><div class="form-grid"><label>Industry<select name="industry"><option>Nail & làm đẹp</option><option>Nhà hàng & ăn uống</option><option>Khác</option></select></label><label>Role<select name="role" required><option>Thợ nail</option><option>Phục vụ</option><option>Khác</option></select></label><input name="otherRole"><label>City<input name="city" required></label><label>Skills<input name="skills"></label><label>Pay<input name="pay"></label><label>Period<input name="period"></label><label>Schedule<input name="schedule"></label><label>Available<input name="availability"></label><label>Description<textarea name="description" required></textarea></label></div></div><div class="dialog-footer"><button type="submit">Post</button></div></form>';
    const form=window.document.getElementById('templateForm');for(const [name,value]of Object.entries(item))if(form.elements.namedItem(name)&&typeof value==='string')form.elements.namedItem(name).value=value;return form;
  }};
  window.eval(source);const api=window.NEXORA_COMMUNITY_JOBS.mount(adapter);
  return {dom,window,api,adapter,notices,chats,navigation,get jobs(){return rows;},get saves(){return saves;},setSaveResult:value=>{canSave=value;},switchMember:(name,nextRole)=>{currentMember=name;currentRole=nextRole;api.render();},read:()=>JSON.parse(window.localStorage.getItem(key)),write:value=>window.localStorage.setItem(key,JSON.stringify(value))};
}
const basic={displayName:'Worker A',experience:'ThreeToFive',stateCode:'TX',cityName:'Houston',languages:['Vi','En'],bio:'Gel-X technician',phone:'7135550199'};

 test('a staff applicant must save Basic, while license and complete profile remain optional',t=>{
  const s=setup();t.after(()=>s.dom.window.close());assert.equal(s.api.eligibility('hiring-1'),'ProfileRequired');assert.equal(s.api.apply('hiring-1',{note:'Hello'}),false);
  assert.equal(s.api.saveProfile('Basic',{...basic,displayName:''}),false);assert.equal(s.api.getProfile().basicSavedAt,null);
  assert.equal(s.api.saveProfile('Basic',basic),true);assert.ok(s.api.getProfile().basicSavedAt);assert.equal(s.api.getProfile().licenseType,'');assert.equal(s.api.eligibility('hiring-1'),'Eligible');
  const application=s.api.apply('hiring-1',{note:'Available next week',sharePhone:false});assert.equal(application.postingId,'hiring-1');assert.equal(application.status,'Submitted');assert.equal(s.api.eligibility('hiring-1'),'AlreadyApplied');assert.equal(s.api.apply('hiring-1'),false);
 });

 test('application cancellation revokes employer profile/phone access and reapply preserves its ID',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.saveProfile('Basic',basic);const app=s.api.apply('hiring-1',{note:'A note',sharePhone:true});
  s.switchMember('Salon A','owner');assert.equal(s.api.applicants('hiring-1').length,1);assert.equal(s.api.applicantProfile(app.id).phone,basic.phone);
  s.switchMember('Worker A','staff');assert.equal(s.api.cancelApplication(app.id,app.version+1),false);assert.equal(s.api.cancelApplication(app.id,app.version),true);const cancelled=s.api.listApplications()[0];assert.equal(cancelled.status,'Cancelled');assert.equal(cancelled.sharePhone,false);assert.equal('profileSnapshot' in cancelled,false);
  s.switchMember('Salon A','owner');assert.deepEqual(plain(s.api.applicants('hiring-1')),[]);assert.equal(s.api.applicantProfile(app.id),null);
  s.switchMember('Worker A','staff');const reapplied=s.api.apply('hiring-1',{note:'New note'});assert.equal(reapplied.id,app.id);assert.equal(reapplied.version,3);assert.equal(s.api.listApplications().length,1);
 });

 test('owners cannot apply and members cannot manage another owner post, applicant or invitation',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.saveProfile('Basic',basic);const app=s.api.apply('hiring-1');
  s.switchMember('Salon B','owner');assert.deepEqual(plain(s.api.applicants('hiring-1')),[]);assert.equal(s.api.applicantProfile(app.id),null);assert.equal(s.api.closeJob('hiring-1'),false);assert.equal(s.api.saveJob({...s.jobs[0],title:'Changed'}),false);assert.equal(s.api.eligibility('hiring-1'),'NotAllowed');assert.equal(s.api.cancelApplication(app.id),false);
  assert.equal(s.jobs[0].title,'Hiring Gel-X technician');assert.equal(s.api.saveJob({kind:'seeking',role:'Thợ nail',city:'Houston',description:'Description'}),false);
 });

 test('unshared phone and license number remain private in candidate profiles',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.saveProfile('Basic',basic);s.api.saveProfile('Skills',{skills:['Gel-X'],licenseType:'TexasTdlr',licenseNumber:'TX-112233'});const app=s.api.apply('hiring-1',{sharePhone:false});
  assert.equal(JSON.stringify(s.read()).includes('TX-112233'),false);s.switchMember('Salon A','owner');const profile=s.api.applicantProfile(app.id);assert.equal(profile.phone,'');assert.equal(profile.licenseNumberMasked,undefined);assert.equal(profile.licenseVerificationStatus,'Unverified');
 });

 test('closed, expired and external postings do not create internal applications',t=>{
  const jobs=fixtureJobs();jobs[0].status='closed';jobs[1].externalContact=true;jobs.push({...jobs[0],id:'expired',status:'open',applyBy:'2000-01-01'});
  const s=setup({jobs});t.after(()=>s.dom.window.close());assert.equal(s.api.eligibility('hiring-1'),'Unavailable');assert.equal(s.api.eligibility('expired'),'Unavailable');assert.equal(s.api.eligibility('hiring-2'),'ExternalContact');
  assert.equal(s.api.apply('hiring-1'),false);assert.equal(s.api.apply('hiring-2'),false);assert.equal(s.api.listApplications().length,0);
  s.api.openJob('hiring-2');s.window.document.querySelector('[data-jobs-action="apply"]').click();assert.match(s.window.document.getElementById('jobsDialogTitle').textContent,/Contact/);assert.equal(s.window.document.getElementById('jobsApplicationForm'),null);
 });

 test('draft, publication, edit and close use one job ID and preserve createdAt',t=>{
  const s=setup({member:'Salon A',role:'owner'});t.after(()=>s.dom.window.close());const input={kind:'hiring',role:'Phục vụ',industry:'Nhà hàng & ăn uống',city:'Houston, TX',description:'Dinner service',pay:'18',period:'Mỗi giờ'};
  const draft=s.api.saveJob(input,'draft');assert.equal(draft.status,'draft');assert.equal(s.window.document.querySelector('[data-job-id="'+draft.id+'"]').textContent.includes('Dinner service'),true);
  const published=s.api.saveJob({...draft,title:'Evening server'},'publish');assert.equal(published.id,draft.id);assert.equal(published.createdAt,draft.createdAt);assert.equal(published.status,'open');assert.equal(s.jobs.filter(row=>row.id===draft.id).length,1);
  const updated=s.api.saveJob({...published,description:'Updated dinner service'});assert.equal(updated.id,draft.id);assert.equal(s.api.closeJob(draft.id),true);assert.equal(s.api.saveJob({...updated,title:'Reopened'}),false);assert.equal(s.jobs.find(row=>row.id===draft.id).status,'closed');
 });

 test('core persistence failure leaves the original shared job unchanged',t=>{
  const s=setup({member:'Salon A',role:'owner'});t.after(()=>s.dom.window.close());const before=plain(s.jobs);s.setSaveResult(false);
  assert.equal(s.api.saveJob({...s.jobs[0],title:'Do not keep this'}),false);assert.equal(s.api.closeJob('hiring-1'),false);assert.deepEqual(s.jobs,before);assert.equal(s.api.saveJob({kind:'hiring',role:'Thợ nail',city:'Houston',description:'New role'},'draft'),false);assert.deepEqual(s.jobs,before);
 });

 test('workflow persistence failure rolls back profile, privacy and application changes',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.saveProfile('Basic',basic);const before=s.window.localStorage.getItem(key);
  const original=s.window.Storage.prototype.setItem;Object.defineProperty(s.window.Storage.prototype,'setItem',{configurable:true,value(){throw new Error('quota');}});
  assert.equal(s.api.saveProfile('Preferences',{jobTypes:['FullTime'],payTypes:['Salary'],expectedPay:'$900 / week'}),false);assert.equal(s.api.savePrivacy('hidePhone',false),false);assert.equal(s.api.apply('hiring-1'),false);assert.equal(s.window.localStorage.getItem(key),before);assert.equal(s.api.getProfile().hidePhone,true);
  Object.defineProperty(s.window.Storage.prototype,'setItem',{configurable:true,value:original});assert.equal(s.api.apply('hiring-1').status,'Submitted');
 });

 test('each write reads current storage and preserves another tab profile and application',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.saveProfile('Basic',basic);const external=s.read();external.profiles.Other={displayName:'Other',bio:'Keep this'};external.applications.push({id:'other-app',postingId:'hiring-2',applicantUserId:'Other',ownerUserId:'Salon B',status:'Submitted',submittedAt:'2026-10-20T00:00:00Z'});s.write(external);
  s.api.savePrivacy('hidePhone',false);assert.equal(s.read().profiles.Other.bio,'Keep this');assert.equal(s.read().applications[0].id,'other-app');const own=s.api.apply('hiring-1');assert.ok(own);assert.equal(s.read().applications.length,2);assert.equal(s.api.listApplications().length,1);
 });

 test('interview invitation is owner-scoped; only its recipient can accept and reveal phone',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.saveProfile('Basic',basic);const app=s.api.apply('hiring-1');s.switchMember('Salon A','owner');const invitation=s.api.invite('Worker A','hiring-1',{note:'Please meet the team',date:'2026-11-02',time:'10:00'});assert.ok(invitation);assert.equal(s.api.invite('Worker A','hiring-1',{note:'Duplicate'}),false);assert.equal(s.api.applicantProfile(app.id).phone,'');
  s.switchMember('Worker B','staff');assert.equal(s.api.respondInvite(invitation.id,'accepted'),false);assert.equal(s.api.listInvites().length,0);
  s.switchMember('Worker A','staff');assert.equal(s.api.respondInvite(invitation.id,'accepted'),true);assert.equal(s.api.respondInvite(invitation.id,'declined'),false);s.switchMember('Salon A','owner');assert.equal(s.api.applicantProfile(app.id).phone,basic.phone);
 });

 test('deep-link navigation opens a stable record and profile gate returns to that job',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.navigate('jobs',{jobsTab:'browse',jobId:'hiring-1'});assert.equal(s.window.document.querySelector('[data-jobs-dialog] h3').textContent,'Hiring Gel-X technician');s.window.document.querySelector('[data-jobs-action="apply"]').click();assert.equal(s.window.document.getElementById('jobsView').dataset.jobsTab,'profile');
  assert.ok(s.window.document.getElementById('jobsProfileForm'));s.api.saveProfile('Basic',basic);s.window.document.querySelector('[data-jobs-action="return-job"]').click();assert.equal(s.window.document.getElementById('jobsView').dataset.jobsTab,'browse');assert.equal(s.window.document.querySelector('[data-jobs-dialog] h3').textContent,'Hiring Gel-X technician');
 });

 test('PO form stays one screen and adds staging media, profile fields, services and save draft',t=>{
  const s=setup({member:'Salon A',role:'owner'});t.after(()=>s.dom.window.close());const form=s.api.openEditor('hiring');assert.ok(form.querySelector('select[name="industry"]'));assert.ok(form.querySelector('select[name="role"]'));assert.ok(form.querySelector('[data-jobs-editor-file]'));assert.ok(form.querySelector('textarea[name="videoLinks"]'));assert.ok(form.querySelector('[data-jobs-action="services"]'));assert.ok(form.querySelector('[data-jobs-action="save-draft"]'));
  form.elements.city.value='Houston, TX';form.elements.description.value='Full-time role';form.querySelector('[data-jobs-action="save-draft"]').click();assert.equal(s.jobs[0].status,'draft');assert.equal(s.window.document.getElementById('templateForm'),null);
  assert.match(styles,/#jobPosts\.jobs-post-grid\{grid-template-columns:minmax\(0,1fr\)/);assert.match(styles,/background-position:right 16px center/);assert.match(styles,/padding-right:44px/);
 });

 test('current-shop privacy hides a seeking post and denies its public profile',t=>{
  const state=emptyState();state.profiles['Worker B']={displayName:'Worker B',exists:true,basicSavedAt:'2026-10-20T00:00:00Z',hideFromCurrentShops:true,currentShopNames:['Salon A'],hidePhone:true};
  const s=setup({member:'Salon A',role:'owner',state});t.after(()=>s.dom.window.close());assert.equal(s.api.isVisible(s.jobs.find(row=>row.id==='seeking-1')),false);assert.equal(s.api.publicCandidate('seeking-1'),null);assert.equal(s.window.document.querySelector('[data-job-id="seeking-1"]'),null);assert.equal(s.api.openJob('seeking-1'),false);
 });

 test('corrupt workflow storage is preserved and cannot be silently overwritten',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.window.localStorage.setItem(key,'{malformed');assert.equal(s.api.saveProfile('Basic',basic),false);assert.equal(s.window.localStorage.getItem(key),'{malformed');
 });

 test('a stale editor preserves the form and refuses to overwrite another tab edit',t=>{
  const s=setup({member:'Salon A',role:'owner'});t.after(()=>s.dom.window.close());
  const form=s.api.openEditor('hiring',s.jobs[0]);form.elements.jobTitle.value='My unfinished title';
  s.jobs[0].description='Fresh description saved by another tab';
  form.querySelector('[data-jobs-action="save-draft"]').click();
  assert.equal(s.saves,0);assert.equal(s.jobs[0].description,'Fresh description saved by another tab');assert.equal(s.jobs[0].title,'Hiring Gel-X technician');
  assert.equal(s.window.document.getElementById('templateForm'),form);assert.equal(form.elements.jobTitle.value,'My unfinished title');assert.match(form.querySelector('[data-jobs-form-error]').textContent,/changed|change|status/i);
 });

 test('a preview retains the original revision and refuses publication after a concurrent edit',t=>{
  const s=setup({member:'Salon A',role:'owner'});t.after(()=>s.dom.window.close());
  const form=s.api.openEditor('hiring',s.jobs[0]);form.elements.jobTitle.value='My changed title';form.dispatchEvent(new s.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.ok(s.window.document.getElementById('jobsPublishAcknowledgement'));s.jobs[0].description='Other tab saved this while preview was open';
  s.window.document.getElementById('jobsPublishAcknowledgement').checked=true;s.window.document.querySelector('[data-jobs-action="publish"]').click();
  assert.equal(s.saves,0);assert.equal(s.jobs[0].title,'Hiring Gel-X technician');assert.equal(s.jobs[0].description,'Other tab saved this while preview was open');assert.ok(s.window.document.getElementById('jobsPublishError').textContent);
  s.window.document.querySelector('[data-jobs-action="back-edit"]').click();assert.equal(s.window.document.getElementById('templateForm').elements.jobTitle.value,'My changed title');
 });

 test('clicking the Basic Next button submits the form inside the jobs tab container',t=>{
  const s=setup();t.after(()=>s.dom.window.close());s.api.openJob('hiring-1');s.window.document.querySelector('[data-jobs-dialog] [data-jobs-action="apply"]').click();
  const form=s.window.document.getElementById('jobsProfileForm');assert.equal(s.window.document.getElementById('jobsView').dataset.jobsTab,'profile');
  form.elements.displayName.value='Worker A';form.elements.stateCode.value='TX';form.elements.stateCode.dispatchEvent(new s.window.Event('change',{bubbles:true}));form.elements.cityName.value='Houston';
  form.querySelector('[type="submit"]').click();
  const profile=s.api.getProfile();assert.ok(profile.basicSavedAt);assert.equal(profile.stateCode,'TX');assert.equal(profile.cityName,'Houston');assert.equal(s.window.document.getElementById('jobsProfileForm').dataset.jobsProfileStep,'Skills');assert.ok(s.window.document.querySelector('[data-jobs-action="return-job"]'));
 });
