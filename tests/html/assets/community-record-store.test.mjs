import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../../../html/assets/community-v2/community-record-store.js',import.meta.url),'utf8');
const context=vm.createContext({window:{}});vm.runInContext(source,context);
const {merge,copy}=context.window.NEXORA_COMMUNITY_RECORDS;
const plain=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));

 test('independent edits to the same record preserve both fields and unrelated sections',()=>{
  const base={jobs:[{id:'j1',title:'Original',description:'Original body',owner:'Salon'}],groups:[{id:'g1',title:'Original group'}],settings:{hidePhone:true}};
  const desired=plain(base);desired.jobs[0].title='Local title';
  const latest=plain(base);latest.jobs[0].description='Other tab body';latest.groups[0].title='Other tab group';latest.settings.hidePhone=false;
  const result=plain(merge(base,desired,latest));
  assert.deepEqual(result,{jobs:[{id:'j1',title:'Local title',description:'Other tab body',owner:'Salon'}],groups:[{id:'g1',title:'Other tab group'}],settings:{hidePhone:false}});
 });

 test('concurrent additions survive alongside an edit and keep unique IDs',()=>{
  const base=[{id:'j1',title:'Original'}];
  const desired=[{id:'local-new',title:'Local addition'},{id:'j1',title:'Local edit'}];
  const latest=[{id:'remote-new',title:'Other tab addition'},{id:'j1',title:'Original'}];
  const result=plain(merge(base,desired,latest));
  assert.deepEqual(result.map(row=>row.id),['local-new','remote-new','j1']);
  assert.equal(result.find(row=>row.id==='j1').title,'Local edit');
 });

 test('an unchanged tab preserves records added or deleted in another tab',()=>{
  const base=[{id:'j1',title:'One'},{id:'j2',title:'Two'}];
  const latest=[{id:'j2',title:'Updated two'},{id:'j3',title:'New three'}];
  assert.deepEqual(plain(merge(base,plain(base),latest)),latest);
 });

 test('editing an already deleted record does not resurrect it',()=>{
  const base=[{id:'j1',title:'One',description:'Original'},{id:'j2',title:'Two'}];
  const desired=plain(base);desired[0].description='Stale editor body';
  const latest=[{id:'j2',title:'Two'},{id:'j3',title:'New'}];
  assert.deepEqual(plain(merge(base,desired,latest)),latest);
 });

 test('an explicit local deletion wins while preserving another tab additions and edits',()=>{
  const base=[{id:'j1',title:'One'},{id:'j2',title:'Two'}];
  const desired=[{id:'j2',title:'Two'}];
  const latest=[{id:'j1',title:'Other tab edit to deleted record'},{id:'j2',title:'Updated two'},{id:'j3',title:'New'}];
  assert.deepEqual(plain(merge(base,desired,latest)),[{id:'j2',title:'Updated two'},{id:'j3',title:'New'}]);
 });

 test('nested object deletion and field edits do not replace unrelated latest properties',()=>{
  const base={privacy:{hidden:{SalonA:true,SalonB:true},mute:false},profile:{name:'Worker'}};
  const desired=plain(base);delete desired.privacy.hidden.SalonA;desired.privacy.mute=true;
  const latest=plain(base);latest.privacy.hidden.SalonC=true;latest.profile.name='Renamed in another tab';
  assert.deepEqual(plain(merge(base,desired,latest)),{privacy:{hidden:{SalonB:true,SalonC:true},mute:true},profile:{name:'Renamed in another tab'}});
 });

 test('string collections merge additions and removals rather than losing another tab membership',()=>{
  const base={groups:['g1','g2']},desired={groups:['g2','g3']},latest={groups:['g1','g2','g4']};
  assert.deepEqual(plain(merge(base,desired,latest)),{groups:['g2','g4','g3']});
 });

 test('a same-field conflict uses the explicit local value and retains untouched latest fields',()=>{
  const base=[{id:'j1',title:'Original',phone:'111'}],desired=[{id:'j1',title:'Local',phone:'111'}],latest=[{id:'j1',title:'Remote',phone:'222'}];
  assert.deepEqual(plain(merge(base,desired,latest)),[{id:'j1',title:'Local',phone:'222'}]);
 });

 test('merge and copy never mutate caller baselines, desired edits or latest records',()=>{
  const base={jobs:[{id:'j1',images:['one'],title:'Original'}]};
  const desired=plain(base);desired.jobs[0].title='Local';const latest=plain(base);latest.jobs[0].images.push('two');
  const snapshots=[base,desired,latest].map(value=>JSON.stringify(value));
  const result=merge(base,desired,latest);result.jobs[0].images.push('result-only');result.jobs[0].title='Result-only';
  assert.deepEqual([base,desired,latest].map(value=>JSON.stringify(value)),snapshots);
  const copied=copy(base);copied.jobs[0].images.push('copy-only');assert.equal(base.jobs[0].images.length,1);assert.equal(copy(undefined),undefined);
 });

 test('new and removed object properties merge without prototype mutation',()=>{
  const base={name:'Worker',obsolete:true};
  const desired=JSON.parse('{"name":"Worker","newSetting":true,"__proto__":{"polluted":true},"constructor":{"polluted":true}}');
  const latest={name:'Worker',obsolete:true,otherTab:true};
  const result=plain(merge(base,desired,latest));assert.deepEqual(result,{name:'Worker',otherTab:true,newSetting:true});assert.equal({}.polluted,undefined);
 });
