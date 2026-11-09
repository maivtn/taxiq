import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../../',import.meta.url);
const base=readFileSync(new URL('html/v3.1/community/community-demo-data.js',root),'utf8');
const coverage=readFileSync(new URL('html/v3.1/community/community-demo-coverage.js',root),'utf8');
function load(){const storage=new Map();const scope=vm.createContext({window:{},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});vm.runInContext(base,scope);vm.runInContext(coverage,scope);return {scope,data:scope.window.NEXORA_COMMUNITY_DEMO};}

test('Community demo additions keep unique IDs and valid local images and destinations',()=>{
  const {data}=load(),pages=new Set(data.extra.pages.map(row=>row.id)),groups=new Set(data.extra.groups.map(row=>row.id));
  for(const records of [data.extra.feed,data.extra.jobs,data.extra.pagePosts,data.feedDrafts,data.connect.rooms])assert.equal(new Set(records.map(row=>row.id)).size,records.length);
  for(const post of data.extra.pagePosts)assert.ok(pages.has(post.pageId),post.id);
  for(const post of [...data.extra.feed,...data.feedDrafts])for(const id of post.destinations?.groupIds||[])assert.ok(groups.has(id),post.id+' → '+id);
  for(const row of [...data.extra.jobs,...data.extra.feed,...data.extra.pagePosts,...data.feedDrafts].filter(row=>row.isSample))for(const photo of [row.photo,row.image,...row.photos||[]].filter(Boolean)){assert.ok(photo.startsWith('/html/'),photo);assert.ok(existsSync(new URL(photo.slice(1),root)),photo);}
});

test('Jobs demo records cover transfer filters and both service workflows',()=>{
  const {data}=load(),jobs=data.extra.jobs.filter(row=>row.isSample),transfers=jobs.filter(row=>row.kind==='transfer');
  assert.ok(transfers.some(row=>row.transferType==='sell'&&row.status==='open'));
  assert.ok(transfers.some(row=>row.transferType==='buy'&&row.status==='open'));
  assert.ok(new Set(transfers.map(row=>row.city)).size>=3);
  for(const kind of ['service-request','service-offer'])assert.ok(jobs.filter(row=>row.kind===kind&&row.description&&row.city&&row.price>0).length>=3);
  for(const status of ['draft','paused','closed'])assert.ok(jobs.some(row=>row.owner==='David Le'&&row.kind==='seeking'&&row.status===status));
});

test('Jobs example applications, invitations and schedules point to valid records',()=>{
  const {data}=load(),jobs=new Map(data.extra.jobs.map(row=>[row.id,row])),workflow=data.jobWorkflow;
  for(const row of workflow.applications){assert.ok(jobs.has(row.postingId),row.id);assert.ok(workflow.profiles[row.applicantUserId],row.id);}
  for(const row of workflow.invites){assert.ok(jobs.has(row.postingId),row.id);assert.equal(jobs.get(row.postingId).owner,row.from);}
  for(const rows of Object.values(workflow.availability))for(const row of rows){assert.ok(row.start<row.end);if(row.kind==='weekly')assert.ok(row.day>=0&&row.day<=6);else assert.ok(Number.isFinite(Date.parse(row.date)));}
  for(const ids of Object.values(workflow.savedJobs))for(const id of ids)assert.ok(jobs.has(id),id);
  for(const post of data.extra.pagePosts.filter(row=>row.isSample&&row.status==='scheduled'))assert.ok(Date.parse(post.publishAt)>Date.now());
});

test('Reloading demo coverage is idempotent and merging preserves edited and authored records',()=>{
  const {scope,data}=load(),count=data.extra.jobs.length;
  vm.runInContext(coverage,scope);assert.equal(data.extra.jobs.length,count);
  const seeds=data.extra.jobs.filter(row=>row.isSample),rows=data.merge([],seeds,[],'coverage-jobs');
  rows[0].title='My edited listing';rows.push({id:'user-authored-listing',title:'My own listing'});
  const merged=data.merge(rows,seeds,[],'coverage-jobs');
  assert.equal(merged.find(row=>row.id===rows[0].id).title,'My edited listing');
  assert.equal(merged.find(row=>row.id==='user-authored-listing').title,'My own listing');
  assert.equal(new Set(merged.map(row=>row.id)).size,merged.length);
});
