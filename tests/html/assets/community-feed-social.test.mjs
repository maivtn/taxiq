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

test('English demo comment migration preserves edited seeds and member-authored comments',t=>{
  const groupId='feed-group-rich-g2-2';
  const records=[{id:'f5',kind:'showcase',owner:'Other',title:'Pink nails'}, {id:groupId,kind:'showcase',owner:'Other',title:'Short nails',sampleComments:[['Kim Tuyen','This length is great for clients who type all day.'],['Hà Nguyễn','Thanks! The client picked a practical everyday length.']]}];
  const stored=JSON.stringify({version:1,posts:{
    f5:{comments:[{id:'social-demo-f5-0',owner:'Mai Nguyễn',body:'Nền hồng này nhìn rất nhẹ tay. Lần tới mình muốn thử móng ngắn hơn một chút.'},{id:'comment-member',owner:'Me',body:'Bình luận do tôi tự viết.'}]},
    [groupId]:{comments:[{id:'social-demo-'+groupId+'-0',owner:'Kim Tuyen',body:'Mẫu này hợp khách muốn móng gọn khi gõ máy quá chị.'},{id:'social-demo-'+groupId+'-1',owner:'Hà Nguyễn',body:'Nội dung mẫu đã được người dùng sửa.'}]}
  }});
  const app=boot(t,records,stored),saved=JSON.parse(app.w.localStorage.getItem(storageKey));
  assert.match(saved.posts.f5.comments[0].body,/pink base/);
  assert.equal(saved.posts.f5.comments[1].body,'Bình luận do tôi tự viết.');
  assert.equal(saved.posts[groupId].comments[0].body,records[1].sampleComments[0][1]);
  assert.equal(saved.posts[groupId].comments[1].body,'Nội dung mẫu đã được người dùng sửa.');
});

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

test('featured controls retain captured feed plans and keep local sponsorship separate from publication',t=>{
  const records=[{id:'mine',kind:'tip',owner:'Me',title:'A',steps:'Body'}],app=boot(t,records);
  app.click('[data-social-action="menu"]');app.click('[data-social-action="boost-post"]');
  const plans=[...app.d.querySelectorAll('[data-social-action="boost-plan"]')];
  assert.deepEqual(plans.map(plan=>plan.dataset.socialPlan),['3','7','14']);
  assert.deepEqual(plans.map(plan=>plan.querySelector('span').textContent),['$5','$10','$18']);
  app.click('[data-social-action="boost-plan"][data-social-plan="7"]');app.click('[data-social-action="boost-preview"]');
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).posts.mine.featuredPreview.priceUsd,10);
  assert.equal(records[0].isFeatured,undefined);
  assert.equal(app.d.querySelector('[data-social-ui="sponsored"]').textContent,'Được tài trợ');
  assert.equal(app.notices.at(-1),'Đã cập nhật bài.');
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

test('market Feed keeps seller contact and owner sold confirmation tied to the original record',t=>{
  const records=[{id:'sale',type:'sale',owner:'Other',title:'Chair',description:'White chair',status:'open'},{id:'own',type:'sale',owner:'Me',title:'Lamp',status:'open'}],contacts=[],sold=[];
  const app=boot(t,records,'',{contactPost:post=>contacts.push(post),markSold:post=>{sold.push(post);post.status='sold';return true;}});
  app.click('[data-social-action="contact-seller"][data-social-post="sale"]');assert.strictEqual(contacts[0],records[0]);
  app.click('[data-social-action="mark-sold"][data-social-post="own"]');
  assert.equal(records[1].status,'open');assert.match(app.d.querySelector('[data-social-dialog]').textContent,/Đánh dấu món này đã bán/);
  app.click('[data-social-action="confirm-mark-sold"]');
  assert.strictEqual(sold[0],records[1]);assert.equal(records[1].id,'own');assert.equal(records[1].status,'sold');
  assert.equal(app.d.querySelector('[data-social-action="mark-sold"][data-social-post="own"]'),null);
  assert.equal(app.d.querySelector('[data-feed-post-id="own"] .community-feed-post-market-status').textContent,'Đã bán');
});

test('market sold failure restores the record and keeps the confirmation available',t=>{
  const records=[{id:'own',type:'want',owner:'Me',title:'Lamp wanted',status:'open'}];
  const app=boot(t,records,'',{markSold:post=>{post.status='bought';return false;}});
  app.click('[data-social-action="mark-sold"]');app.click('[data-social-action="confirm-mark-sold"]');
  assert.equal(records[0].status,'open');assert.ok(app.d.querySelector('[data-social-form-error]').textContent);
  assert.ok(app.d.querySelector('[data-social-action="confirm-mark-sold"]'));
});

test('closed marketplace posts keep status and social controls without seller contact',t=>{
  const app=boot(t,[{id:'done',type:'sale',owner:'Other',title:'Chair',status:'sold'}],'',{contactPost:()=>assert.fail('sold contact')});
  assert.equal(app.d.querySelector('.community-feed-post-market-status').textContent,'Đã bán');
  assert.equal(app.d.querySelector('[data-social-action="contact-seller"]'),null);
  assert.ok(app.d.querySelector('[data-social-action="like"]'));
});

test('destination chips navigate to the exact main or group feed scope',t=>{
  const scopes=[];
  const app=boot(t,[{id:'a',owner:'Other',kind:'tip',title:'Tip',destinations:{includeMainFeed:true,groupIds:['g']}}],'',{getGroups:()=>[{id:'g',title:'Nail Houston'}],navigateFeed:scope=>scopes.push(scope)});
  app.click('[data-social-scope="group:g"]');app.click('[data-social-scope="main"]');
  assert.deepEqual(scopes,['group:g','main']);
});

test('deep post reuses each complete kind renderer and enhances its original actions',t=>{
  const posts=[{id:'poll',kind:'poll',owner:'Other',title:'Which?',optionA:'A',optionB:'B',votesA:2},{id:'event',kind:'event',owner:'Other',title:'Class',date:'Oct 30, 2026',location:'Houston'},{id:'question',kind:'question',owner:'Me',title:'Q',resolved:true},{id:'market',type:'sale',owner:'Other',title:'Lamp',price:25,condition:'Used',status:'open'}];
  const rendered=[],enhanced=[];
  const app=boot(t,posts,'',{renderPost:post=>{rendered.push(post);return `<article data-feed-post-id="${post.id}"><h3>${post.title}</h3>${post.kind==='poll'?`<button data-extra-action="voteA">${post.optionA} ${post.votesA}</button><button data-extra-action="voteB">${post.optionB}</button>`:post.kind==='event'?`<time>${post.date}</time><span data-event-location>${post.location}</span><button data-extra-action="interest">Interested</button>`:post.kind==='question'?'<button data-extra-action="resolve">Answered</button>':`<b data-market-price>$${post.price}</b><span>${post.condition}</span>`}</article>`;},enhancePosts:root=>enhanced.push(root),contactPost:()=>true});
  for(const post of posts){
    app.social.openPost(post.id);const detail=app.d.querySelector('[data-social-post-detail]');
    assert.strictEqual(rendered.at(-1),post);assert.strictEqual(enhanced.at(-1),detail);
    assert.equal(detail.querySelectorAll('[data-social-action="like"]').length,1);
    assert.ok(detail.querySelector('[data-social-comment-form]'));
    if(post.kind==='poll')assert.match(detail.querySelector('[data-extra-action="voteA"]').textContent,/A 2/);
    if(post.kind==='event'){assert.equal(detail.querySelector('[data-event-location]').textContent,'Houston');assert.ok(detail.querySelector('[data-extra-action="interest"]'));}
    if(post.kind==='question')assert.ok(detail.querySelector('[data-extra-action="resolve"]'));
    if(post.type==='sale'){assert.equal(detail.querySelector('[data-market-price]').textContent,'$25');assert.ok(detail.querySelector('[data-social-action="contact-seller"]'));}
  }
  posts[0].votesA=3;app.social.openPost('poll');posts[0].votesA=4;app.social.refreshOpenPost();
  assert.match(app.d.querySelector('[data-social-post-detail] [data-extra-action="voteA"]').textContent,/A 4/);
});

test('a social mutation merges the latest stored comments from another open surface',t=>{
  const app=boot(t,[{id:'a',kind:'general',owner:'Other',title:'A'}]);
  const latest=JSON.parse(app.w.localStorage.getItem(storageKey));latest.posts.a.comments.push({id:'external',owner:'Guest',body:'From another surface',parentId:null});
  latest.reports.push({id:'other-report',reason:'Keep this'});app.w.localStorage.setItem(storageKey,JSON.stringify(latest));
  app.click('[data-social-action="like"]');
  const saved=JSON.parse(app.w.localStorage.getItem(storageKey));
  assert.equal(saved.posts.a.comments[0].id,'external');assert.equal(saved.reports[0].id,'other-report');assert.deepEqual(saved.posts.a.likedBy,['Me']);
});

test('marketplace actions share the original CTA row and survive repeated enhancement without duplicates',t=>{
  const app=boot(t,[{id:'market-row',type:'sale',owner:'Other',title:'Chair',status:'open'}],'',{contactPost:()=>true});
  const card=app.d.querySelector('[data-feed-post-id="market-row"]');
  const view=app.d.createElement('button');view.dataset.openMarket='market-row';view.textContent='View in Marketplace';
  card.querySelector('.listing-actions').prepend(view);
  app.social.enhance();app.social.enhance();
  const row=card.querySelector(':scope > .listing-actions');
  assert.equal(card.querySelectorAll(':scope > .listing-actions').length,1);
  assert.equal(card.querySelectorAll('[data-social-action="contact-seller"]').length,1);
  assert.ok(row.contains(view));assert.ok(row.querySelector('[data-social-action="contact-seller"]'));
  assert.equal(card.querySelector('.community-social-market .community-social-market-actions'),null);
  assert.ok(card.querySelector('.community-social-trade-notice'));
});
