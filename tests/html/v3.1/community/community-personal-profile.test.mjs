import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const sharedSource=readFileSync(new URL('../../../../html/v3.1/community/community-shared.js',import.meta.url),'utf8');
const platformSource=readFileSync(new URL('../../../../html/v3.1/community/community-platform.js',import.meta.url),'utf8');

function boot(t,{storage,storageQuota}={}){
  const dom=new JSDOM('<main></main>',{
    url:'https://demo.test/html/v3.1/staff-community.html?account=personal&member=Brian%20Nguyen',
    runScripts:'outside-only',
    storageQuota,
  });
  t.after(()=>dom.window.close());
  const {window}=dom,root=window.document.querySelector('main');
  if(storage)window.localStorage.setItem('nexora-v31:community-shared-v31',storage);
  Object.defineProperty(window.document,'currentScript',{value:{src:'https://demo.test/html/v3.1/community/community-platform.js'}});
  window.eval(sharedSource);
  window.eval(platformSource);
  window.NEXORA_COMMUNITY_PLATFORM.mount(root,{route:'account',language:'en'});
  const form=root.querySelector('[data-platform-profile]');
  return {window,root,form,shared:window.NEXORA_COMMUNITY_SHARED};
}

function setFields(form,values){
  for(const [name,value] of Object.entries(values))form.elements[name].value=value;
}

async function submit({window,form}){
  form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  const status=form.querySelector('[role="status"]');
  for(let attempts=0;attempts<100;attempts++){
    if(status.textContent)return status.textContent;
    await new Promise(resolve=>setTimeout(resolve,5));
  }
  assert.fail('The profile submission did not report a result');
}

test('Personal profile edits survive reload without changing the account or its handle',async t=>{
  const editor=boot(t),before=editor.shared.me();
  const edits={name:'Brian Nguyen Jr.',displayNickname:'Brian Nguyễn AI',phone:'(832) 799-2748',bio:'Founder VLINKPAY',email:'brian@example.test',city:'Houston'};
  setFields(editor.form,edits);
  assert.match(await submit(editor),/saved/i);

  const reloaded=boot(t,{storage:editor.window.localStorage.getItem(editor.shared.KEY)});
  for(const [name,value] of Object.entries(edits))assert.equal(reloaded.form.elements[name].value,value);
  assert.equal(reloaded.shared.me().displayName,edits.displayNickname);
  assert.equal(reloaded.shared.me().nickname,before.nickname);
  assert.equal(reloaded.shared.me().id,before.id);
  assert.equal(reloaded.shared.member,'Brian Nguyen');

  reloaded.form.elements.displayNickname.value='';
  assert.match(await submit(reloaded),/saved/i);
  assert.equal(reloaded.shared.me().displayName,edits.name);
});

test('Avatar and cover controls open file inputs and keep both selected images after reload',async t=>{
  const editor=boot(t),{window,form}=editor;
  const image='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/QJcAAAAASUVORK5CYII=';
  for(const field of ['avatar','cover']){
    const input=form.elements[field];
    let clicks=0;
    input.addEventListener('click',event=>{clicks++;event.preventDefault();});
    form.querySelector(`[data-profile-pick="${field}"]`).click();
    assert.equal(clicks,1);
    const bytes=Uint8Array.from(window.atob(image),char=>char.charCodeAt(0));
    const file=new window.File([bytes],field+'.png',{type:'image/png'});
    Object.defineProperty(input,'files',{value:[file]});
    input.dispatchEvent(new window.Event('change',{bubbles:true}));
  }
  assert.match(await submit(editor),/saved/i);

  const reloaded=boot(t,{storage:window.localStorage.getItem(editor.shared.KEY)});
  for(const field of ['avatar','cover']){
    assert.match(reloaded.shared.me()[field],/^data:image\/png;base64,/);
    assert.equal(reloaded.form.querySelector(`[data-profile-preview="${field}"]`).getAttribute('src'),reloaded.shared.me()[field]);
  }
});

test('A whitespace-only full name and a failed storage write leave the last saved profile intact',async t=>{
  const editor=boot(t,{storageQuota:1000}),before=editor.shared.me();
  editor.form.elements.name.value='   ';
  assert.doesNotMatch(await submit(editor),/saved/i);
  assert.equal(editor.shared.me().name,before.name);

  editor.form.querySelector('[role="status"]').textContent='';
  setFields(editor.form,{name:'Brian Jr.',bio:'x'.repeat(1000)});
  assert.doesNotMatch(await submit(editor),/saved/i);
  assert.equal(editor.shared.me().name,before.name);
});
