import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/v3.1/community/community-storefront-demo.js',import.meta.url),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const empty=()=>({lang:'en',shop:{name:'',type:'personal',category:'',city:'Houston, TX',phone:'',email:'',hours:'',website:'',about:'',logo:'',cover:'',fanpageId:'',fulfillment:[],items:[]},fanpages:[],feedPosts:[]});
const owner={role:'owner',member:'BITCOIN NAIL BAR'};
function setup(t){const dom=new JSDOM('',{runScripts:'outside-only'});t.after(()=>dom.window.close());dom.window.eval(source);return dom.window.NEXORA_STOREFRONT_DEMO;}

test('empty salon demo gains complete profile, product/service/post examples and shared Feed updates',t=>{
  const demo=setup(t),state=empty();
  assert.equal(demo.seed(state,owner),true);
  assert.equal(state.shop.name,owner.member);
  for(const field of ['about','phone','email','hours','logo','cover'])assert.ok(state.shop[field],field);
  assert.equal(state.shop.items.filter(row=>row.kind==='product').length,3);
  assert.equal(state.shop.items.filter(row=>row.kind==='service').length,3);
  assert.equal(state.shop.items.filter(row=>row.kind==='post').length,1);
  assert.equal(state.feedPosts.length,2);
  assert.ok(state.feedPosts.every(row=>row.shopOrigin&&row.author===owner.member&&/sample/i.test(row.title)));
  assert.ok(state.feedPosts.every(row=>/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(row.date)));
});

test('existing and partially entered storefronts keep their fields, items and posts',t=>{
  const demo=setup(t);
  for(const patch of [{name:'My custom salon'},{phone:'7131234567'},{items:[{id:'mine',title:'My service'}]},{city:'Dallas, TX'}]){
    const state=empty();Object.assign(state.shop,patch);state.feedPosts.push({id:'my-post',body:'My draft'});
    const before=clone(state);demo.seed(state,owner);
    assert.deepEqual(state.shop,before.shop);assert.deepEqual(state.feedPosts,before.feedPosts);
  }
});

test('demo data remains editable and deleted examples stay deleted on subsequent visits',t=>{
  const demo=setup(t),state=empty();demo.seed(state,owner);
  state.shop.name='Updated name';state.shop.items[0].title='Edited lamp';state.shop.items.splice(1,1);state.feedPosts.splice(0,1);
  const before=clone(state);assert.equal(demo.seed(state,owner),false);assert.deepEqual(state,before);
});

test('personal users and other business identities receive no demo storefront',t=>{
  const demo=setup(t);
  for(const shared of [{...owner,role:'staff'},{role:'owner',member:'Another salon'}]){
    const state=empty(),before=clone(state);assert.equal(demo.seed(state,shared),false);assert.deepEqual(state,before);
  }
});

test('sample copy follows selected language while preserving user edits and business values',t=>{
  const demo=setup(t),state=empty();state.lang='vi';demo.seed(state,owner);
  assert.match(state.shop.about,/Gian hàng mẫu/);assert.match(state.shop.items[0].title,/Đèn/);
  state.shop.items[0].description='User description';state.feedPosts[0].body='User update';
  demo.localize(state,'en');
  assert.match(state.shop.about,/Sample BITCOIN/);assert.equal(state.shop.items[0].title,'UV/LED nail lamp (sample)');
  assert.equal(state.shop.items[0].description,'User description');assert.equal(state.feedPosts[0].body,'User update');
  assert.equal(state.shop.items[0].price,'45');assert.equal(state.shop.items[0].kind,'product');
  demo.localize(state,'vi');assert.match(state.shop.items[0].title,/Đèn/);assert.equal(state.shop.items[0].description,'User description');
});
