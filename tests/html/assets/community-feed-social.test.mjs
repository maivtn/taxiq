import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/assets/community-v2/community-feed-social.js',import.meta.url),'utf8');
const storageKey='nexora-community-feed-social-v1';

function boot(t, records, stored='', options={}) {
  const dom=new JSDOM('<!doctype html><html lang="vi"><body><main id="feedPosts"></main><div id="modalRoot"></div></body></html>',{url:'https://nexora.test/html/assets/community-v2/nexora-community-prototype.html',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window, d=w.document, notices=[];
  if(stored)w.localStorage.setItem(storageKey,stored);
  let failSave=false;
  const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let social;
  const render=()=>{
    d.querySelector('#feedPosts').innerHTML=records.map(item=>`<article class="content-card" data-feed-post-id="${escape(item.id)}"><h3>${escape(item.title)}</h3><p>${escape(item.description||item.details||item.steps||'')}</p><div class="listing-actions"><button data-extra-action="resolve">Đã giải đáp</button></div></article>`).join('');
    social?.enhance();
  };
  w.eval(source);
  social=w.NEXORA_COMMUNITY_FEED_SOCIAL.mount({getFeed:()=>records,currentMember:'Me',escape,save:()=>!failSave,render,openDialog:html=>{d.querySelector('#modalRoot').innerHTML=html;},closeDialog:()=>{d.querySelector('#modalRoot').innerHTML='';},toast:text=>notices.push(text),...options});
  render();
  const click=selector=>{const button=d.querySelector(selector);assert.ok(button,selector);button.click();};
  const submit=selector=>{const form=d.querySelector(selector);assert.ok(form,selector);form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
  return {w,d,social,records,click,submit,notices,render,failSave:()=>{failSave=true;}};
}

test('likes toggle, survive a remount and never duplicate the original post actions',t=>{
  const app=boot(t,[{id:'a',kind:'question',owner:'Other',title:'Question',details:'Body',likeCount:4}]);
  app.social.enhance();app.social.enhance();
  assert.equal(app.d.querySelectorAll('[data-social-action="like"]').length,1);
  assert.equal(app.d.querySelectorAll('[data-extra-action="resolve"]').length,1);
  app.click('[data-social-action="like"]');
  assert.equal(app.d.querySelector('[data-social-action="like"]').getAttribute('aria-pressed'),'true');
  assert.match(app.d.querySelector('[data-social-action="like"]').textContent,/5/);
  const stored=app.w.localStorage.getItem(storageKey);
  const remount=boot(t,[{id:'a',kind:'question',owner:'Other',title:'Question',details:'Body',likeCount:4}],stored);
  assert.equal(remount.d.querySelector('[data-social-action="like"]').getAttribute('aria-pressed'),'true');
  remount.click('[data-social-action="like"]');
  assert.match(remount.d.querySelector('[data-social-action="like"]').textContent,/4/);
});

test('comments and replies preserve literal text, persist, and can be deleted only by their owner',t=>{
  const app=boot(t,[{id:'a',kind:'general',owner:'Other',title:'A',description:'Body'}]);
  app.click('[data-social-action="comments"]');
  app.d.querySelector('[data-social-comment-form] textarea').value='<img src=x onerror=alert(1)> Chia sẻ';
  app.submit('[data-social-comment-form]');
  assert.equal(app.d.querySelector('[data-social-comment-id] img'),null);
  assert.match(app.d.querySelector('[data-social-comment-id]').textContent,/<img src=x/);
  const root=app.d.querySelector('[data-social-comment-id]').dataset.socialCommentId;
  app.click('[data-social-action="reply"]');
  app.d.querySelector('[data-social-comment-form] textarea').value='Trả lời của mình';
  app.submit('[data-social-comment-form]');
  const saved=JSON.parse(app.w.localStorage.getItem(storageKey));
  assert.equal(saved.posts.a.comments.length,2);
  assert.equal(saved.posts.a.comments[1].parentId,root);
  app.click('[data-social-action="delete-comment"]');
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).posts.a.comments.length,2);
  app.click('[data-social-action="cancel"]');
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).posts.a.comments.length,2);
  app.click('[data-social-action="delete-comment"]');
  app.click('[data-social-action="confirm-delete-comment"]');
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).posts.a.comments.length,0);
});

test('post edit and delete enforce ownership, keep array identity, and deleted seeds stay deleted after reload',t=>{
  const records=[{id:'mine',kind:'tip',owner:'Me',title:'Old',steps:'Old steps'},{id:'other',kind:'general',owner:'Other',title:'Other',description:'Text'}];
  const app=boot(t,records);
  app.click('[data-social-post="mine"][data-social-action="menu"]');
  app.click('[data-social-action="edit-post"]');
  app.d.querySelector('[data-social-edit-form] [name="title"]').value='Edited';
  app.d.querySelector('[data-social-edit-form] [name="body"]').value='New steps';
  app.submit('[data-social-edit-form]');
  assert.equal(records[0].steps,'New steps');assert.equal(records[0].title,'Edited');assert.equal(records[0].kind,'tip');
  app.click('[data-social-post="mine"][data-social-action="menu"]');
  app.click('[data-social-action="delete-post"]');app.click('[data-social-action="confirm-delete-post"]');
  assert.strictEqual(app.records,records);assert.deepEqual(records.map(item=>item.id),['other']);
  assert.equal(app.social.isVisible({id:'mine',owner:'Me'}),false);
  assert.equal(app.social.isVisible({id:'mine',owner:'Other'}),true);
  const stored=app.w.localStorage.getItem(storageKey);
  const restored=boot(t,[{id:'mine',kind:'tip',owner:'Me',title:'Seed',steps:'Seed'},{id:'other',kind:'general',owner:'Other',title:'Other'}],stored);
  assert.deepEqual(restored.records.map(item=>item.id),['other']);
  restored.click('[data-social-action="menu"]');
  assert.equal(restored.d.querySelector('[data-social-action="delete-post"]'),null);
  assert.ok(restored.d.querySelector('[data-social-action="report-post"]'));
});

test('reports require an explicit reason and submit, persist locally, and never mutate the reported post',t=>{
  const records=[{id:'a',kind:'question',owner:'Other',title:'A',details:'Body'}];
  const app=boot(t,records);
  app.click('[data-social-action="menu"]');app.click('[data-social-action="report-post"]');
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).reports.length,0);
  app.d.querySelector('[data-social-report-form] textarea').value='Thông tin không phù hợp';
  app.submit('[data-social-report-form]');
  const report=JSON.parse(app.w.localStorage.getItem(storageKey)).reports[0];
  assert.equal(report.targetType,'post');assert.equal(report.targetId,'a');
  assert.equal(records.length,1);assert.equal(records[0].details,'Body');
  assert.doesNotMatch(app.notices.at(-1),/sẽ xem xét|review/i);
});

test('gallery opens the selected safe image, supports keyboard navigation and closes without an iframe',t=>{
  const app=boot(t,[{id:'a',kind:'showcase',owner:'Other',title:'A',description:'Body',photos:['../one.jpg','../two.jpg','javascript:alert(1)']}]);
  assert.equal(app.d.querySelectorAll('[data-social-action="gallery"]').length,2);
  app.click('[data-social-action="gallery"][data-social-index="1"]');
  assert.match(app.d.querySelector('.community-social-lightbox img').src,/two\.jpg$/);
  app.d.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
  assert.match(app.d.querySelector('.community-social-lightbox img').src,/one\.jpg$/);
  assert.equal(app.d.querySelector('iframe'),null);
  app.d.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(app.d.querySelector('.community-social-lightbox'),null);
});

test('deep links open a post with its requested comment thread and unknown IDs have a clear empty state',t=>{
  const saved={version:1,posts:{a:{baseLikes:0,likedBy:[],comments:[{id:'r',owner:'Other',body:'Root',createdAt:'2026-10-29T10:00:00Z',parentId:null},{id:'reply',owner:'Other',body:'Nested',createdAt:'2026-10-29T11:00:00Z',parentId:'r',replyTo:'Other'}]}},reports:[],deletedPostIds:[]};
  const app=boot(t,[{id:'a',kind:'question',owner:'Other',title:'A',details:'Body'}],JSON.stringify(saved));
  app.social.openPost('a',{commentId:'reply',threadId:'r'});
  assert.ok(app.d.querySelector('[data-social-comment-id="reply"].is-focused'));
  assert.match(app.d.querySelector('[data-social-post-detail]').textContent,/Nested/);
  app.social.openPost('missing');
  assert.match(app.d.querySelector('#modalRoot').textContent,/Bài viết không còn tồn tại/);
});

test('failed post persistence keeps the current text and original record instead of claiming success',t=>{
  const records=[{id:'mine',kind:'tip',owner:'Me',title:'Old',steps:'Old steps'}];
  const app=boot(t,records);app.failSave();
  app.click('[data-social-action="menu"]');app.click('[data-social-action="edit-post"]');
  app.d.querySelector('[data-social-edit-form] [name="title"]').value='Edited';
  app.d.querySelector('[data-social-edit-form] [name="body"]').value='New';
  app.submit('[data-social-edit-form]');
  assert.equal(records[0].title,'Old');assert.equal(records[0].steps,'Old steps');
  assert.equal(app.d.querySelector('[name="title"]').value,'Edited');
  assert.ok(app.d.querySelector('[data-social-form-error]').textContent);
});

test('comment roots and replies load in separate pages without discarding existing threads',t=>{
  const comments=Array.from({length:5},(_,index)=>({id:'root'+index,owner:'Other',body:'Root '+index,parentId:null,createdAt:'2026-10-29T10:00:00Z'}));
  comments.push(...Array.from({length:4},(_,index)=>({id:'reply'+index,owner:'Other',body:'Reply '+index,parentId:'root0',createdAt:'2026-10-29T11:00:00Z'})));
  const stored=JSON.stringify({version:1,posts:{a:{baseLikes:0,likedBy:[],comments}},reports:[],deletedPostIds:[]});
  const app=boot(t,[{id:'a',kind:'question',owner:'Other',title:'A',details:'Body'}],stored);
  app.click('[data-social-action="comments"]');
  assert.equal(app.d.querySelectorAll('.community-social-comment-list > .community-social-comment').length,3);
  app.click('[data-social-action="more-comments"]');
  assert.equal(app.d.querySelectorAll('.community-social-comment-list > .community-social-comment').length,5);
  app.click('[data-social-action="thread"]');
  assert.equal(app.d.querySelectorAll('.community-social-replies > .community-social-comment').length,3);
  app.click('[data-social-action="more-replies"]');
  assert.equal(app.d.querySelectorAll('.community-social-replies > .community-social-comment').length,4);
  app.d.querySelector('#feedPosts').insertAdjacentHTML('beforeend','<button data-social-action="delete-comment" data-social-post="a" data-social-comment="root0">Forged delete</button>');
  app.click('#feedPosts > [data-social-action="delete-comment"]');
  assert.equal(app.d.querySelector('[data-social-action="confirm-delete-comment"]'),null);
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).posts.a.comments.length,9);
});

test('the integrated editor receives the original record for full type fields and photo editing',t=>{
  const edited=[],records=[{id:'mine',kind:'poll',owner:'Me',title:'A',optionA:'One',optionB:'Two',photos:['../one.jpg']}];
  const app=boot(t,records,'',{editPost:post=>edited.push(post)});
  app.click('[data-social-action="menu"]');app.click('[data-social-action="edit-post"]');
  assert.strictEqual(edited[0],records[0]);
  assert.deepEqual(records[0].photos,['../one.jpg']);
  assert.equal(app.d.querySelector('[data-social-edit-form]'),null);
});

test('the featured preview uses captured feed plans and never claims a real payment or publication',t=>{
  const records=[{id:'mine',kind:'tip',owner:'Me',title:'A',steps:'Body'}],app=boot(t,records);
  app.click('[data-social-action="menu"]');app.click('[data-social-action="boost-post"]');
  const plans=[...app.d.querySelectorAll('[data-social-action="boost-plan"]')];
  assert.deepEqual(plans.map(plan=>plan.dataset.socialPlan),['3','7','14']);
  assert.deepEqual(plans.map(plan=>plan.querySelector('span').textContent),['$5','$10','$18']);
  app.click('[data-social-action="boost-plan"][data-social-plan="7"]');app.click('[data-social-action="boost-preview"]');
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).posts.mine.featuredPreview.priceUsd,10);
  assert.equal(records[0].isFeatured,undefined);
  assert.match(app.d.querySelector('[data-social-ui="sponsored"]').textContent,/bản thử/);
  assert.match(app.notices.at(-1),/không thu tiền/);
});

test('closing the shared host dialog clears deep-link state before the next feed action',t=>{
  const app=boot(t,[{id:'a',kind:'general',owner:'Other',title:'A',description:'Body'}]);
  app.social.openPost('a');
  app.social.onDialogClosed();app.d.querySelector('#modalRoot').innerHTML='';
  app.click('[data-social-action="like"]');
  assert.equal(app.d.querySelector('[data-social-dialog]'),null);
});

test('language changes update social controls and preserve a report reason being typed',async t=>{
  const app=boot(t,[{id:'a',kind:'general',owner:'Other',title:'A',description:'Body'}]);
  app.click('[data-social-action="menu"]');app.click('[data-social-action="report-post"]');
  app.d.querySelector('[name="reason"]').value='Lý do đang viết';
  app.d.documentElement.lang='en';
  await new Promise(resolve=>app.w.setTimeout(resolve,0));
  assert.equal(app.d.querySelector('[name="reason"]').value,'Lý do đang viết');
  assert.equal(app.d.querySelector('[data-social-report-form] [type="submit"]').textContent,'Send report');
  assert.match(app.d.querySelector('[data-social-action="like"]').textContent,/Like/);
});

test('ordinary feed cards lead with the real author and keep the gallery after content and before actions',t=>{
  const owner='Nguyễn Thanh Hà — chia sẻ kinh nghiệm làm nghề tại Houston';
  const post={id:'person',kind:'showcase',owner,title:'Mẫu mới',description:'Nội dung của thành viên',photos:['../one.jpg','../two.jpg'],createdAt:'2026-10-29T10:00:00Z',destinations:{includeMainFeed:true,groupIds:['g9']}};
  const app=boot(t,[post],'',{getGroups:()=>[{id:'g9',title:'Thợ Nail Dallas'}],avatarFor:()=> '../avatar.jpg',isBusiness:()=>false});
  const card=app.d.querySelector('[data-feed-post-id="person"]');
  card.querySelector('h3').insertAdjacentHTML('beforebegin','<span class="kind">Khoe mẫu cũ</span><div class="meta">Tên cũ</div>');
  card.querySelector('p').insertAdjacentHTML('afterend','<div class="chips"><span class="chip">Houston, TX</span></div>');
  app.social.enhance();app.social.enhance();
  const header=card.querySelector('.community-feed-post-header'),gallery=card.querySelector('.community-social-gallery');
  assert.strictEqual(card.firstElementChild,header);
  assert.equal(card.querySelectorAll('.community-feed-post-header').length,1);
  assert.equal(card.querySelectorAll('.community-social-gallery').length,1);
  assert.equal(header.querySelector('.community-feed-post-author').textContent,owner);
  assert.equal(header.querySelector('.community-feed-post-author').title,owner);
  assert.ok(header.querySelector('.community-feed-post-author').hasAttribute('data-community-authored'));
  assert.match(header.querySelector('.community-feed-post-avatar img').src,/avatar\.jpg$/);
  assert.equal(header.querySelector('.community-feed-post-business'),null);
  assert.equal(header.querySelector('.community-feed-post-type').textContent,'Khoe mẫu');
  assert.equal(header.querySelector('time').textContent,'Oct 29, 2026');
  assert.match(header.querySelector('.community-feed-post-destinations').textContent,/Bảng tin chung/);
  assert.match(header.querySelector('.community-feed-post-destinations').textContent,/Thợ Nail Dallas/);
  assert.equal(card.querySelector(':scope > .kind, :scope > .meta'),null);
  assert.ok(card.querySelector('h3').compareDocumentPosition(card.querySelector('p'))&app.w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(card.querySelector('.chips').compareDocumentPosition(gallery)&app.w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(gallery.compareDocumentPosition(card.querySelector('.listing-actions'))&app.w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(card.querySelector('.listing-actions').compareDocumentPosition(card.querySelector('.community-social-actions'))&app.w.Node.DOCUMENT_POSITION_FOLLOWING);
});

test('business status comes from the adapter and author initials stay separate from type badges',t=>{
  const app=boot(t,[{id:'business',kind:'question',owner:'BITCOIN NAIL BAR',title:'Hỏi cộng đồng',details:'Nội dung',resolved:true}],'',{isBusiness:owner=>owner==='BITCOIN NAIL BAR'});
  const header=app.d.querySelector('.community-feed-post-header');
  assert.equal(header.querySelector('.community-feed-post-avatar').textContent,'BN');
  assert.equal(header.querySelector('.community-feed-post-business').textContent,'Doanh nghiệp');
  assert.equal(header.querySelector('.community-feed-post-type').textContent,'Hỏi đáp');
  assert.equal(header.querySelector('.community-feed-post-resolved').textContent,'Đã giải đáp');
  assert.equal(header.querySelectorAll('[data-social-action="menu"]').length,1);
});

test('market feed cards use the business source delete hook and roll back a rejected removal',t=>{
  const records=[{id:'market',type:'sale',owner:'Me',title:'Ghế chờ',description:'Đồ của tiệm',status:'open'}];
  let rejected=true,removed=0;
  const app=boot(t,records,'',{getFeed:()=>[...records],removePost:post=>{if(rejected)return false;removed++;records.splice(records.indexOf(post),1);return true;}});
  assert.equal(app.d.querySelector('.community-feed-post-type').textContent,'Mua bán');
  app.click('[data-social-action="like"]');
  assert.equal(app.d.querySelector('[data-social-action="like"]').getAttribute('aria-pressed'),'true');
  app.click('[data-social-action="menu"]');app.click('[data-social-action="delete-post"]');app.click('[data-social-action="confirm-delete-post"]');
  assert.equal(records.length,1);assert.equal(removed,0);
  assert.deepEqual(JSON.parse(app.w.localStorage.getItem(storageKey)).deletedPostIds,[]);
  assert.equal(app.social.isVisible(records[0]),true);
  assert.ok(app.d.querySelector('[data-social-form-error]').textContent);
  rejected=false;
  app.click('[data-social-action="confirm-delete-post"]');
  assert.equal(records.length,0);assert.equal(removed,1);
  assert.deepEqual(JSON.parse(app.w.localStorage.getItem(storageKey)).deletedPostIds,['market']);
});
