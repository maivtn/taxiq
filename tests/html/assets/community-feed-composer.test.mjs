import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const source = readFileSync(new URL('../../../html/assets/community-v2/community-feed-composer.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../../../html/assets/community-v2/community-feed-composer.css', import.meta.url), 'utf8');
const image = 'data:image/jpeg;base64,YWJj';

function setup({owner = 'Demo member', storage} = {}) {
  const dom = new JSDOM('<html lang="en"><body><div id="modal"></div><div id="drafts"></div></body></html>', {url:'https://demo.test/community.html', runScripts:'outside-only'});
  const {window} = dom;
  const style=window.document.createElement('style');style.textContent='.btn{display:inline-flex}'+styles;window.document.head.append(style);
  if (storage) window.localStorage.setItem('nexora-community-feed-drafts-v1', storage);
  const feed = [], groups = [{id:'g1', title:'Houston', joined:true}, {id:'g2', title:'Dallas', joined:true}, {id:'g3', title:'Austin', joined:true}, {id:'other', title:'Other'}], notices = [];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const adapter = {
    getFeed:()=>feed, getGroups:()=>groups, getJoinedGroups:()=>groups.filter(g=>g.joined), currentMember:owner,
    save:()=>true, render:()=>{}, escape, toast:value=>notices.push(value),
    closeDialog:()=>window.document.getElementById('modal').replaceChildren(),
    openDialog:html=>{window.document.getElementById('modal').innerHTML=html;},
    openTemplate:(kind,item={})=>{
      window.document.getElementById('modal').innerHTML='<form id="templateForm" data-kind="'+escape(kind)+'"><div class="dialog-body"><div class="form-grid"><label>Title<input name="title" required></label><label>Details<textarea name="details"></textarea></label><label class="form-group"><input name="photo" type="file"></label></div></div><div class="dialog-footer"><button type="button" id="cancelModal">Cancel</button><button type="submit">Post</button></div></form>';
      const form=window.document.getElementById('templateForm');
      form.elements.title.value=item.title||'';form.elements.details.value=item.details||'';
      api.enhanceForm(form,item);
      return form;
    }
  };
  window.eval(source);
  const api=window.NEXORA_COMMUNITY_FEED_COMPOSER.mount(adapter);
  return {dom,window,api,adapter,feed,groups,notices,form:(kind='question',item={})=>adapter.openTemplate(kind,item)};
}

test('destinations enforce a combined limit of three, and never expose unjoined groups', async t => {
  const s=setup();t.after(()=>s.dom.window.close());const form=s.form();
  assert.equal(form.querySelector('[data-composer-group="other"]'),null);
  for(const id of ['g1','g2'])form.querySelector('[data-composer-group="'+id+'"]').click();
  assert.equal(form.querySelector('[data-composer-group="g3"]').disabled,true);
  assert.deepEqual(JSON.parse(JSON.stringify((await s.api.collect(form)).destinations)),{includeMainFeed:true,groupIds:['g1','g2']});
  form.querySelector('[data-composer-main]').click();
  form.querySelector('[data-composer-group="g3"]').click();
  assert.equal((await s.api.collect(form)).destinations.groupIds.length,3);
});

test('an empty destination selection cannot publish', async t => {
  const s=setup();t.after(()=>s.dom.window.close());const form=s.form();form.querySelector('[data-composer-main]').click();
  assert.equal(await s.api.collect(form),null);
  assert.match(form.querySelector('[data-composer-error]').textContent,/at least one/i);
});

test('saving, editing and publishing a draft keeps its ID and never publishes on save', async t => {
  const s=setup();t.after(()=>s.dom.window.close());let form=s.form();form.elements.title.value='A saved question';
  assert.equal(await s.api.saveDraft(form),true);
  const first=s.api.listDrafts()[0];assert.equal(s.feed.length,0);assert.ok(first.id);
  s.api.openDraft(first.id);form=s.window.document.getElementById('templateForm');
  form.elements.title.value='Edited draft';assert.equal(await s.api.saveDraft(form),true);
  assert.equal(s.api.listDrafts().length,1);assert.equal(s.api.listDrafts()[0].id,first.id);
  s.api.openDraft(first.id);form=s.window.document.getElementById('templateForm');const collected=await s.api.collect(form);
  assert.equal(collected.id,first.id);assert.equal(collected.draftId,first.id);
  assert.equal(s.api.listDrafts().length,1,'collect does not delete the draft before feed persistence succeeds');
  s.api.complete(form);assert.equal(s.api.listDrafts().length,0);
});

test('photo removal and cancelling an edit never mutate the published post', async t => {
  const s=setup();t.after(()=>s.dom.window.close());const post={id:'p1',kind:'question',owner:'Demo member',photos:[image],destinations:{includeMainFeed:true,groupIds:['g1']}};s.feed.push(post);
  const form=s.form('question',post);assert.equal(form.querySelectorAll('[data-composer-photo]').length,1);
  form.querySelector('[data-composer-remove-photo]').click();
  assert.deepEqual(JSON.parse(JSON.stringify((await s.api.collect(form)).photos)),[]);
  s.adapter.closeDialog();assert.deepEqual(post.photos,[image]);assert.equal(post.id,'p1');
});

test('the draft action stays hidden when editing a published feed post despite authored button display styles', t => {
  const s=setup();t.after(()=>s.dom.window.close());const post={id:'published',kind:'general',owner:'Demo member'};s.feed.push(post);
  const form=s.form('general',post),button=form.querySelector('[data-composer-save-draft]');
  assert.equal(button.hidden,true);assert.equal(s.window.getComputedStyle(button).display,'none');
});

test('a Marketplace photo-only form has no destinations or draft flow and can submit without photos', async t => {
  const s=setup();t.after(()=>s.dom.window.close());s.window.document.getElementById('modal').innerHTML='<form id="listingForm"><div class="dialog-body"></div><div class="dialog-footer"><button type="submit">Post listing</button></div></form>';
  const form=s.window.document.getElementById('listingForm');
  assert.equal(s.api.enhancePhotos(form,{destinations:{includeMainFeed:false,groupIds:[]}}),true);
  assert.equal(form.querySelector('[data-composer-destinations]'),null);assert.equal(form.querySelector('[data-composer-save-draft]'),null);
  const collected=await s.api.collect(form);assert.deepEqual(JSON.parse(JSON.stringify(collected.photos)),[]);assert.equal('destinations' in collected,false);
  assert.equal(await s.api.saveDraft(form),false);assert.equal(s.api.listDrafts().length,0);assert.equal(form.isConnected,true);
});

test('Marketplace photo-only uploads use the same optimization and image-rights validation', async t => {
  const s=setup();t.after(()=>s.dom.window.close());installImageCodec(s.window);s.window.document.getElementById('modal').innerHTML='<form id="listingForm"><div class="dialog-body"></div><div class="dialog-footer"><button type="submit">Post listing</button></div></form>';
  const form=s.window.document.getElementById('listingForm');s.api.enhancePhotos(form,{});const input=form.querySelector('[data-composer-file]');
  Object.defineProperty(input,'files',{value:[new s.window.File(['listing photo'],'listing.jpg',{type:'image/jpeg'})]});input.dispatchEvent(new s.window.Event('change',{bubbles:true}));
  assert.equal(await s.api.collect(form),null);assert.match(form.querySelector('[data-composer-error]').textContent,/right to share/);
  const checkbox=form.querySelector('[data-composer-rights]');checkbox.checked=true;checkbox.dispatchEvent(new s.window.Event('change',{bubbles:true}));
  const collected=await s.api.collect(form);assert.equal(collected.photos.length,1);assert.equal(collected.imageRightsConfirmed,true);assert.equal('destinations' in collected,false);
});

test('drafts are isolated by author and removing one does not remove another member draft', async t => {
  const storage=JSON.stringify([{id:'mine',kind:'general',owner:'Demo member',title:'Mine',draft:true},{id:'theirs',kind:'general',owner:'Another member',title:'Theirs',draft:true}]);
  const s=setup({storage});t.after(()=>s.dom.window.close());assert.equal(s.api.listDrafts().length,1);
  assert.equal(s.api.removeDraft('theirs'),false);assert.equal(s.api.removeDraft('mine'),true);
  assert.equal(JSON.parse(s.window.localStorage.getItem('nexora-community-feed-drafts-v1')).length,1);
});

test('draft persistence failure keeps the editor and the previous saved draft', async t => {
  const s=setup();t.after(()=>s.dom.window.close());const form=s.form();form.elements.title.value='Keep me';
  Object.defineProperty(s.window.Storage.prototype,'setItem',{value(){throw new Error('quota');},configurable:true});
  assert.equal(await s.api.saveDraft(form),false);assert.equal(form.isConnected,true);assert.equal(s.api.listDrafts().length,0);
  assert.match(form.querySelector('[data-composer-error]').textContent,/draft|memory/i);
});

test('draft actions keep authored text and switch only the interface language', async t => {
  const s=setup();t.after(()=>s.dom.window.close());const form=s.form();form.elements.title.value='A title in my language';await s.api.saveDraft(form);
  const target=s.window.document.getElementById('drafts');s.api.renderDrafts(target);assert.match(target.textContent,/Edit/);
  s.window.document.documentElement.lang='vi';s.api.refreshLanguage();assert.match(target.textContent,/Sửa/);assert.match(target.textContent,/A title in my language/);
});

test('releasing a reused draft container preserves the normal feed on language and storage refreshes', async t => {
  const s=setup();t.after(()=>s.dom.window.close());const form=s.form();form.elements.title.value='A private draft';await s.api.saveDraft(form);
  const target=s.window.document.getElementById('drafts');s.api.renderDrafts(target);
  assert.equal(target.hasAttribute('data-feed-drafts'),true);
  s.api.releaseDrafts(target);target.innerHTML='<article data-live-post>Normal feed post</article>';
  assert.equal(target.hasAttribute('data-feed-drafts'),false);
  s.window.document.documentElement.lang='vi';s.api.refreshLanguage();
  s.window.dispatchEvent(new s.window.StorageEvent('storage',{key:'nexora-community-feed-drafts-v1'}));
  assert.equal(target.textContent,'Normal feed post');assert.ok(target.querySelector('[data-live-post]'));
  s.api.renderDrafts(target);assert.match(target.textContent,/A private draft/,'the same target can enter draft scope again');
});

test('scope matching respects destinations and hides drafts from public feed scopes', t => {
  const s=setup();t.after(()=>s.dom.window.close());
  assert.equal(s.api.scopeMatches({destinations:{includeMainFeed:false,groupIds:['g1']}},'main'),false);
  assert.equal(s.api.scopeMatches({destinations:{includeMainFeed:false,groupIds:['g1']}},'joined'),true);
  assert.equal(s.api.scopeMatches({draft:true},'main'),false);
  assert.equal(s.api.scopeMatches({},'main'),true);
});

function installImageCodec(window) {
  const dimensions=[];let counter=0;
  window.Image=class {constructor(){this.naturalWidth=3200;this.naturalHeight=1600;}set src(value){window.queueMicrotask(()=>this.onload());}};
  window.HTMLCanvasElement.prototype.getContext=function(){return {fillRect(){},drawImage(){}};};
  window.HTMLCanvasElement.prototype.toDataURL=function(){dimensions.push([this.width,this.height]);return 'data:image/jpeg;base64,'+window.btoa('optimized-'+counter++);};
  return dimensions;
}

test('the image picker optimizes six images, rejects extra slots and requires image rights before publishing', async t => {
  const s=setup();t.after(()=>s.dom.window.close());const dimensions=installImageCodec(s.window),form=s.form(),input=form.querySelector('[data-composer-file]');
  Object.defineProperty(input,'files',{value:Array.from({length:7},(_,i)=>new s.window.File(['photo '+i],i+'.jpg',{type:'image/jpeg'}))});
  input.dispatchEvent(new s.window.Event('change',{bubbles:true}));
  assert.equal(form.querySelector('[type="submit"]').disabled,true);
  const draft=await s.api.collect(form,{draft:true});
  assert.equal(draft.photos.length,6);assert.equal(dimensions.length,6);assert.ok(dimensions.every(([width,height])=>width<=1600&&height<=1600));
  assert.equal(form.querySelector('[data-composer-file]').disabled,true);
  assert.equal(await s.api.collect(form),null);assert.match(form.querySelector('[data-composer-error]').textContent,/right to share/);
  const rights=form.querySelector('[data-composer-rights]');rights.checked=true;rights.dispatchEvent(new s.window.Event('change',{bubbles:true}));
  assert.equal((await s.api.collect(form)).photos.length,6);
});

test('cancelling during image processing cannot attach photos to a later form', async t => {
  const s=setup();t.after(()=>s.dom.window.close());installImageCodec(s.window);const form=s.form(),input=form.querySelector('[data-composer-file]');
  Object.defineProperty(input,'files',{value:[new s.window.File(['photo'],'one.jpg',{type:'image/jpeg'})]});input.dispatchEvent(new s.window.Event('change',{bubbles:true}));
  const later=s.form();assert.equal(await s.api.collect(form),null);assert.equal((await s.api.collect(later)).photos.length,0);
});

test('publishing from the draft list submits the existing form rather than inserting a second post', async t => {
  const s=setup();t.after(()=>s.dom.window.close());let form=s.form();form.elements.title.value='Ready to publish';await s.api.saveDraft(form);
  const draft=s.api.listDrafts()[0];let submitted=null;
  s.window.document.addEventListener('submit',event=>{event.preventDefault();submitted=event.target;});
  s.api.openDraft(draft.id,true);assert.equal(submitted,s.window.document.getElementById('templateForm'));
  assert.equal((await s.api.collect(submitted)).id,draft.id);assert.equal(s.feed.length,0);assert.equal(s.api.listDrafts().length,1);
});
