/* Local interactions for the Community HTML demo. Mutations stay in browser storage. */
(() => {
  'use strict';
  const STORAGE_KEY='nexora-community-feed-social-v1';
  const PAGE_SIZE=3;
  const copy=value=>JSON.parse(JSON.stringify(value));
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const words={
    vi:{like:'Thích',unlike:'Bỏ thích',comments:'{count} bình luận',more:'Thêm thao tác',edit:'Sửa',remove:'Xóa',cancel:'Hủy',close:'Đóng',save:'Lưu',report:'Báo cáo',reply:'Trả lời',replying:'Đang trả lời {name}',send:'Gửi',placeholder:'Viết bình luận…',viewReplies:'Xem {count} trả lời',hideReplies:'Ẩn trả lời',moreReplies:'Xem thêm trả lời',moreComments:'Xem thêm bình luận',empty:'Chưa có bình luận nào.',deletePost:'Xoá bài',deletePostConfirm:'Xoá bài này? Không thể hoàn tác.',deleteComment:'Xoá bình luận',deleteCommentConfirm:'Xoá bình luận này?',reason:'Lý do',reasonPlaceholder:'VD: Có dấu hiệu lừa đảo',sendReport:'Gửi báo cáo',editPost:'Sửa bài',title:'Tiêu đề',body:'Nội dung',updated:'Đã cập nhật bài.',deleted:'Đã xoá bài.',error:'Đã có lỗi xảy ra. Vui lòng thử lại.',required:'Hãy viết nội dung để chia sẻ.',back:'Quay lại Bảng tin',notFound:'Bài viết không còn tồn tại',notFoundBody:'Bài viết có thể đã bị xoá hoặc bị gỡ.',photo:'Ảnh của {name}',gallery:'Ảnh của {name}',previous:'Ảnh trước',next:'Ảnh tiếp',edited:'đã sửa',boost:'Đẩy Nổi bật',extend:'Gia hạn Nổi bật',plan:'Chọn gói',days:'{count} ngày',preview:'Xem thử vị trí tài trợ',sponsored:'Được tài trợ · bản thử',demo:'Bản thử: nội dung lưu trong trình duyệt này, không được gửi hoặc đăng lên NEXORA thật.',paymentDemo:'Giá chỉ để xem luồng thiết kế. Bản thử không thu tiền; sản phẩm thật chỉ kích hoạt sau khi thanh toán thành công.'},
    en:{like:'Like',unlike:'Remove like',comments:'{count} comments',more:'More actions',edit:'Edit',remove:'Delete',cancel:'Cancel',close:'Close',save:'Save',report:'Report',reply:'Reply',replying:'Replying to {name}',send:'Post',placeholder:'Write a comment…',viewReplies:'View {count} replies',hideReplies:'Hide replies',moreReplies:'Show more replies',moreComments:'Show more comments',empty:'No comments yet.',deletePost:'Delete post',deletePostConfirm:"Delete this post? This can't be undone.",deleteComment:'Delete comment',deleteCommentConfirm:'Delete this comment?',reason:'Reason',reasonPlaceholder:'e.g. This looks like a scam',sendReport:'Send report',editPost:'Edit post',title:'Title',body:'Content',updated:'Post updated.',deleted:'Post deleted.',error:'Something went wrong. Please try again.',required:'Write something to share.',back:'Back to feed',notFound:'This post is no longer available',notFoundBody:'It may have been deleted or removed.',photo:'Photo from {name}',gallery:'Photos from {name}',previous:'Previous photo',next:'Next photo',edited:'edited',boost:'Feature this post',extend:'Extend Featured',plan:'Choose a plan',days:'{count} days',preview:'Preview sponsored placement',sponsored:'Sponsored · demo',demo:'Demo: content is saved in this browser and is not sent or published to NEXORA.',paymentDemo:'Prices illustrate the design flow. This demo does not charge you; the live product activates only after successful payment.'}
  };
  // Existing staging post types plus the Feed types supplied in the PO prototype.
  const postTypes={
    vi:{general:'Bài viết',showcase:'Khoe mẫu',tip:'Mẹo nghề',question:'Hỏi đáp',poll:'Khảo sát',event:'Sự kiện / lớp học',market:'Mua bán'},
    en:{general:'Posts',showcase:'Show your work',tip:'Trade tip',question:'Q&A',poll:'Poll',event:'Events & classes',market:'Buy & sell'}
  };
  const headerWords={vi:{business:'Doanh nghiệp',destinations:'Đăng ở',mainFeed:'Bảng tin chung',resolved:'Đã giải đáp'},en:{business:'Business',destinations:'Posted in',mainFeed:'Main feed',resolved:'Answered'}};
  // Prices captured in community-staging/templates.js → compose-featured.
  const demoPlans=[{planDays:3,priceUsd:5},{planDays:7,priceUsd:10},{planDays:14,priceUsd:18}];
  const demoComments={
    f5:[['Mai Nguyễn','Nền hồng này nhìn rất nhẹ tay. Lần tới mình muốn thử móng ngắn hơn một chút.'],['Linh Nguyễn','Phần nhũ ở hai ngón vừa đủ nổi bật, cảm ơn Hà đã chia sẻ mẫu.']],
    f1:[['Linh Nguyễn','Tiệm mình thử một máy trước, kiểm tra dây nguồn và lòng đèn có tháo ra vệ sinh được không.'],['Mai Nguyễn','Anh chị hỏi cửa hàng cho cắm thử cùng loại gel tiệm đang dùng sẽ dễ chọn hơn.']],
    f2:[['Hà Nguyễn','Mình cũng để khay dụng cụ riêng từng ca, người nhận bàn đỡ phải đi tìm hơn.'],['Thảo Lê','Ghi thêm món sắp hết vào cuối ca rất hữu ích, mình sẽ thử cách này.']]
  };
  let mounted=null;

  function mount(adapter) {
    mounted?.destroy();
    const member=String(adapter.currentMember||'');
    const esc=adapter.escape||escapeHTML;
    const getFeed=()=>Array.isArray(adapter.getFeed?.())?adapter.getFeed():[];
    const findPost=id=>getFeed().find(post=>String(post.id)===String(id)&&post.kind!=='deal')||null;
    const own=post=>!!member&&post?.owner===member;
    const t=(key,values={})=>Object.entries(values).reduce((text,[name,value])=>text.replaceAll('{'+name+'}',String(value)),words[document.documentElement.lang==='en'?'en':'vi'][key]||key);
    const tell=message=>adapter.toast?.(message);
    let state;
    try{state=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{}
    if(!state||typeof state!=='object'||Array.isArray(state))state={};
    state={version:1,posts:Object.assign(Object.create(null),state.posts&&typeof state.posts==='object'&&!Array.isArray(state.posts)?state.posts:{}),reports:Array.isArray(state.reports)?state.reports:[],deletedPostIds:Array.isArray(state.deletedPostIds)?state.deletedPostIds:[]};
    const opened=new Set(),threads=new Set(),limits=new Map(),replyLimits=new Map(),replyTargets=new Map(),drafts=new Map();
    let modal=null,returnFocus=null,sequence=0,destroyed=false,swipeStart=null;
    const id=prefix=>prefix+'-'+Date.now()+'-'+(++sequence)+'-'+Math.random().toString(36).slice(2,8);
    const postBody=post=>post.steps||post.details||post.description||'';
    const bodyKey=post=>'steps' in post?'steps':'details' in post?'details':'description';
    const date=value=>{const parsed=new Date(value);return Number.isNaN(parsed.getTime())?'':parsed.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});};
    function ensurePost(post) {
      const key=String(post.id);
      if(!Object.hasOwn(state.posts,key)||!state.posts[key]||typeof state.posts[key]!=='object') {
        const seeds=demoComments[key]||[];
        state.posts[key]={baseLikes:Number(post.likeCount)||({f5:24,f1:12,f2:18}[key]||0),likedBy:[],comments:seeds.map(([owner,body],index)=>({id:'social-demo-'+key+'-'+index,owner,body,parentId:null,createdAt:post.createdAt||new Date(Date.now()-3600000*(index+1)).toISOString()}))};
      }
      const entry=state.posts[key];
      entry.baseLikes=Math.max(0,Number(entry.baseLikes)||0);
      entry.likedBy=Array.isArray(entry.likedBy)?entry.likedBy.filter(value=>typeof value==='string'):[];
      entry.comments=Array.isArray(entry.comments)?entry.comments.filter(row=>row&&typeof row.id==='string'&&typeof row.owner==='string'&&typeof row.body==='string'):[];
      return entry;
    }
    function persist(next) {
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));state=next;return true;}
      catch{tell(t('error'));return false;}
    }
    function change(operation) {
      const next=copy(state);next.posts=Object.assign(Object.create(null),next.posts);
      operation(next);return persist(next);
    }
    function removeStoredPost(post) {
      if(adapter.removePost)return adapter.removePost(post)!==false;
      const records=getFeed(),index=records.indexOf(post);if(index<0)return false;
      records.splice(index,1);
      if(adapter.save?.()===false){records.splice(index,0,post);return false;}
      return true;
    }
    function applyDeleted() {
      for(const post of [...getFeed()].reverse())if(own(post)&&state.deletedPostIds.includes(String(post.id)))removeStoredPost(post);
    }
    function safeImages(post) {
      const raw=Array.isArray(post.photos)&&post.photos.length?post.photos:post.photo?[post.photo]:[];
      return raw.filter(value=>{
        if(typeof value!=='string'||!value.trim()||/[\u0000-\u001f\u007f]/.test(value))return false;
        if(/^data:/i.test(value))return /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value);
        try{const url=new URL(value,location.href);return ['https:','http:','blob:'].includes(url.protocol)||(url.protocol==='file:'&&location.protocol==='file:');}catch{return false;}
      }).slice(0,6);
    }
    const attr=(postId,extra='')=>' data-social-post="'+esc(postId)+'"'+extra;
    const button=(action,label,postId,extra='',className='community-social-link')=>`<button type="button" class="${className}" data-social-action="${action}"${attr(postId,extra)}>${label}</button>`;
    const icon=kind=>`<svg class="community-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind==='heart'?'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>':'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>'}</svg>`;
    const threadKey=(postId,rootId)=>postId+':'+rootId;
    const isVisible=post=>!(own(post)&&state.deletedPostIds.includes(String(post.id)));
    const commentCount=post=>ensurePost(post).comments.length;
    function actionsMarkup(post) {
      const entry=ensurePost(post),liked=entry.likedBy.includes(member),count=entry.baseLikes+entry.likedBy.length;
      return `<div class="community-social-actions" data-social-ui="actions">${button('like',icon('heart')+`<span>${esc(t('like'))} · ${count}</span>`,post.id,` aria-pressed="${liked}" title="${esc(t(liked?'unlike':'like'))}"`)}${button('comments',icon('message-circle')+`<span>${esc(t('comments',{count:commentCount(post)}))}</span>`,post.id,` aria-expanded="${opened.has(String(post.id))}"`)}</div>`;
    }
    function menuMarkup(post) {
      const owner=own(post);
      return `<div class="community-social-menu-wrap" data-social-ui="menu">${button('menu','<span aria-hidden="true">···</span>',post.id,` aria-label="${esc(t('more'))}" aria-haspopup="menu" aria-expanded="false"`,'community-social-menu-toggle')}<div class="community-social-menu" role="menu" hidden>${owner?button('edit-post',esc(t('edit')),post.id,' role="menuitem"')+button('boost-post',esc(t(ensurePost(post).featuredPreview?'extend':'boost')),post.id,' role="menuitem"')+button('delete-post',esc(t('remove')),post.id,' role="menuitem"','community-social-link is-danger'):button('report-post',esc(t('report')),post.id,' role="menuitem"')}</div></div>`;
    }
    function authorHeaderMarkup(post) {
      const language=document.documentElement.lang==='en'?'en':'vi',labels=headerWords[language],owner=String(post.owner||''),groups=adapter.getGroups?.()||[],kind=post.kind||(post.type?'market':'general');
      const initials=owner.trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toLocaleUpperCase();
      const avatar=safeImages({photo:adapter.avatarFor?.(owner)||post.authorAvatarUrl||post.avatar})[0];
      const business=Boolean(adapter.isBusiness?adapter.isBusiness(owner):post.isAuthorBusiness);
      const destinations=post.destinations,names=[];
      if(Array.isArray(destinations)){
        for(const destination of destinations){
          if(destination.isMainFeed||destination.groupId===null)names.push({name:labels.mainFeed,authored:false});
          else {const group=groups.find(item=>String(item.id)===String(destination.groupId));const name=group?.title||group?.name||destination.groupName;if(name)names.push({name,authored:true});}
        }
      }else{
        if(!destinations||destinations.includeMainFeed!==false)names.push({name:labels.mainFeed,authored:false});
        for(const groupId of Array.isArray(destinations?.groupIds)?destinations.groupIds:[]){const group=groups.find(item=>String(item.id)===String(groupId));const name=group?.title||group?.name;if(name)names.push({name,authored:true});}
      }
      const distinctNames=names.filter((destination,index)=>names.findIndex(item=>item.name===destination.name)===index);
      const created=post.createdAt||post.publishedAt;
      return `<header class="community-feed-post-header" data-social-ui="header"><span class="community-feed-post-avatar" aria-hidden="true">${avatar?`<img src="${esc(avatar)}" alt="">`:esc(initials)}</span><div class="community-feed-post-author-info"><div class="community-feed-post-name-row"><strong class="community-feed-post-author" title="${esc(owner)}" data-community-authored>${esc(owner)}</strong></div><div class="community-feed-post-tags"><span class="community-feed-post-type" data-post-kind="${esc(kind)}">${esc(postTypes[language][kind]||postTypes[language].general)}</span>${business?`<span class="community-feed-post-business">${esc(labels.business)}</span>`:''}${post.resolved?`<span class="community-feed-post-resolved">${esc(labels.resolved)}</span>`:''}</div>${created||post.lastEditedAt?`<div class="community-feed-post-byline">${created?`<time datetime="${esc(created)}">${esc(date(created))}</time>`:''}${post.lastEditedAt?`<span>${created?' · ':''}${esc(t('edited'))}</span>`:''}</div>`:''}${distinctNames.length?`<div class="community-feed-post-destinations" aria-label="${esc(labels.destinations)}">${distinctNames.map(destination=>`<span class="community-feed-post-destination"${destination.authored?' data-community-authored':''}>${esc(destination.name)}</span>`).join('')}</div>`:''}</div>${menuMarkup(post)}</header>`;
    }
    function galleryMarkup(post) {
      const images=safeImages(post);if(!images.length)return '';
      const visible=images.slice(0,4);
      return `<div class="community-social-gallery" data-social-ui="gallery" data-count="${visible.length}">${visible.map((src,index)=>button('gallery',`<img src="${esc(src)}" alt="${esc(t('photo',{name:post.owner}))}" loading="lazy">${index===3&&images.length>4?`<span class="community-social-gallery-more">+${images.length-4}</span>`:''}`,post.id,` data-social-index="${index}" aria-label="${esc(t('gallery',{name:post.owner}))} · ${index+1}/${images.length}"`,'community-social-gallery-item')).join('')}</div>`;
    }
    function commentMarkup(post,row,isReply=false) {
      const rootId=row.parentId||row.id,key=threadKey(post.id,rootId),entry=ensurePost(post),replies=entry.comments.filter(comment=>comment.parentId===row.id);
      return `<article class="community-social-comment ${isReply?'is-reply':''} ${modal?.commentId===row.id?'is-focused':''}" data-social-comment-id="${esc(row.id)}" tabindex="-1"><div class="community-social-comment-avatar" aria-hidden="true">${esc(row.owner.split(/\s+/).slice(0,2).map(part=>part[0]).join(''))}</div><div class="community-social-comment-content"><div class="community-social-comment-bubble"><strong>${esc(row.owner)}</strong><p>${isReply&&row.replyTo?`<b>@${esc(row.replyTo)}</b> `:''}${esc(row.body)}</p></div><div class="community-social-comment-tools"><time datetime="${esc(row.createdAt||'')}">${esc(date(row.createdAt))}</time>${button('reply',esc(t('reply')),post.id,` data-social-comment="${esc(row.id)}"`)}${button(row.owner===member?'delete-comment':'report-comment',esc(t(row.owner===member?'remove':'report')),post.id,` data-social-comment="${esc(row.id)}"`,'community-social-link '+(row.owner===member?'is-danger':''))}</div>${!isReply&&replies.length?button('thread',esc(t(threads.has(key)?'hideReplies':'viewReplies',{count:replies.length})),post.id,` data-social-thread="${esc(row.id)}" aria-expanded="${threads.has(key)}"`):''}${!isReply&&threads.has(key)?`<div class="community-social-replies">${replies.slice(0,replyLimits.get(key)||PAGE_SIZE).map(reply=>commentMarkup(post,reply,true)).join('')}${replies.length>(replyLimits.get(key)||PAGE_SIZE)?button('more-replies',esc(t('moreReplies')),post.id,` data-social-thread="${esc(row.id)}"`):''}</div>`:''}</div></article>`;
    }
    function commentsMarkup(post,context='card') {
      const postId=String(post.id),entry=ensurePost(post),roots=entry.comments.filter(row=>!row.parentId),limit=limits.get(postId)||PAGE_SIZE,targetId=replyTargets.get(postId),target=entry.comments.find(row=>row.id===targetId);
      const inputId='social-comment-'+context+'-'+postId;
      return `<section class="community-social-comments" data-social-ui="comments" aria-label="${esc(t('comments',{count:entry.comments.length}))}"><form data-social-comment-form="${esc(post.id)}">${target?`<div class="community-social-reply-target"><span>${esc(t('replying',{name:target.owner}))}</span>${button('cancel-reply',esc(t('cancel')),post.id)}</div>`:''}<label class="community-social-sr-only" for="${esc(inputId)}">${esc(t('placeholder'))}</label><div class="community-social-composer"><textarea class="field" id="${esc(inputId)}" name="comment" rows="2" required maxlength="1000" placeholder="${esc(t('placeholder'))}">${esc(drafts.get(postId)||'')}</textarea><button class="btn primary" type="submit">${esc(t('send'))}</button></div></form><div class="community-social-comment-list">${roots.length?roots.slice(0,limit).map(row=>commentMarkup(post,row)).join(''):`<p class="community-social-empty">${esc(t('empty'))}</p>`}</div>${roots.length>limit?button('more-comments',esc(t('moreComments')),post.id):''}</section>`;
    }
    function previewMarkup(post) {
      const preview=ensurePost(post).featuredPreview;
      return preview&&new Date(preview.expiresAt).getTime()>Date.now()?`<span class="sponsor-label community-social-sponsored" data-social-ui="sponsored">${esc(t('sponsored'))}</span>`:'';
    }
    function enhance(root=document) {
      if(destroyed)return;applyDeleted();
      const cards=[...root.querySelectorAll('[data-feed-post-id], #feedPosts [data-post-id]')];
      for(const card of cards) {
        const postId=card.dataset.feedPostId||card.dataset.postId,post=findPost(postId);if(!post)continue;
        ensurePost(post);card.classList.add('community-social-card');
        for(const element of card.querySelectorAll('[data-social-ui]'))element.remove();
        for(const element of card.querySelectorAll(':scope > .kind, :scope > .meta'))element.remove();
        // The base prototype's single image is replaced by the same post's gallery.
        if(safeImages(post).length)for(const image of card.querySelectorAll(':scope > .blog-cover, :scope > .blog-card-cover, :scope > img, :scope > .community-feed-photo'))image.remove();
        card.insertAdjacentHTML('afterbegin',authorHeaderMarkup(post)+previewMarkup(post));
        if(safeImages(post).length){const existingActions=card.querySelector(':scope > .listing-actions');if(existingActions)existingActions.insertAdjacentHTML('beforebegin',galleryMarkup(post));else card.insertAdjacentHTML('beforeend',galleryMarkup(post));}
        card.insertAdjacentHTML('beforeend',actionsMarkup(post)+(opened.has(String(post.id))?commentsMarkup(post):''));
      }
    }
    function refresh() {
      adapter.render?.();enhance();
      if(modal?.kind==='post'&&document.querySelector('[data-social-post-detail]'))openPost(modal.id,{...modal,preserveOpen:true});
    }
    function closeMenus() {
      for(const menu of document.querySelectorAll('.community-social-menu'))menu.hidden=true;
      for(const toggle of document.querySelectorAll('[data-social-action="menu"]'))toggle.setAttribute('aria-expanded','false');
    }
    function showDialog(title,body,footer,options={}) {
      if(!document.querySelector('[data-social-dialog]'))returnFocus=document.activeElement;
      closeMenus();
      const form=options.form?`<form ${options.form}>`:'';
      adapter.openDialog(`<div class="overlay community-social-overlay" data-social-overlay><section class="dialog community-social-dialog ${options.className||''}" data-social-dialog role="dialog" aria-modal="true" aria-labelledby="community-social-dialog-title" tabindex="-1"><div class="dialog-head"><h2 id="community-social-dialog-title">${esc(title)}</h2>${button('close','<span aria-hidden="true">×</span>','',` aria-label="${esc(t('close'))}"`,'icon-btn')}</div>${form}<div class="dialog-body">${body}</div><div class="dialog-footer">${footer}</div>${form?'</form>':''}</section></div>`);
      const dialog=document.querySelector('[data-social-dialog]');
      (dialog?.querySelector('[autofocus]')||dialog?.querySelector('textarea,input,button')||dialog)?.focus({preventScroll:true});
    }
    function closeDialog(back=true) {
      const backId=modal?.backId;modal=null;swipeStart=null;
      if(back&&backId&&findPost(backId)){openPost(backId);return;}
      adapter.closeDialog?.();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;
    }
    function openPost(postId,options={}) {
      const post=findPost(postId);
      modal={kind:'post',id:String(postId),commentId:options.commentId||null,threadId:options.threadId||null};
      if(!post){showDialog(t('notFound'),`<p>${esc(t('notFoundBody'))}</p>`,button('close',esc(t('back')),''));return false;}
      ensurePost(post);if(!options.preserveOpen)opened.add(String(post.id));
      const target=ensurePost(post).comments.find(row=>row.id===options.commentId),thread=options.threadId||target?.parentId;
      if(thread)threads.add(threadKey(post.id,thread));
      const rootId=thread||target?.id,roots=ensurePost(post).comments.filter(row=>!row.parentId),rootIndex=roots.findIndex(row=>row.id===rootId);
      if(rootIndex>=PAGE_SIZE)limits.set(String(post.id),rootIndex+1);
      if(target?.parentId){const replies=ensurePost(post).comments.filter(row=>row.parentId===target.parentId);replyLimits.set(threadKey(post.id,target.parentId),Math.max(PAGE_SIZE,replies.findIndex(row=>row.id===target.id)+1));}
      showDialog(post.title||t('back'),`<article class="community-social-detail" data-social-post-detail="${esc(post.id)}"><div class="meta">${esc(post.owner)}${post.createdAt?' · '+esc(date(post.createdAt)):''}${post.lastEditedAt?' · '+esc(t('edited')):''}</div><p class="community-social-post-body">${esc(postBody(post))}</p>${galleryMarkup(post)}${actionsMarkup(post)}${opened.has(String(post.id))?commentsMarkup(post,'detail'):''}</article>`,button('close',esc(t('back')),''));
      if(options.commentId)for(const row of document.querySelectorAll('[data-social-comment-id]'))if(row.dataset.socialCommentId===options.commentId&&row.closest('[data-social-post-detail]')){row.focus({preventScroll:true});row.scrollIntoView?.({block:'center'});}
      return true;
    }
    function subDialog(kind,post,commentId='') {
      const backId=modal?.kind==='post'?modal.id:modal?.backId;
      modal={kind,id:String(post.id),commentId,backId};
      const cancel=button('cancel',esc(t('cancel')),post.id,'','btn');
      if(kind==='delete-post'||kind==='delete-comment') {
        showDialog(t(kind==='delete-post'?'deletePost':'deleteComment'),`<p>${esc(t(kind==='delete-post'?'deletePostConfirm':'deleteCommentConfirm'))}</p><p data-social-form-error class="community-social-error" role="alert"></p>`,cancel+button('confirm-'+kind,esc(t('remove')),post.id,` data-social-comment="${esc(commentId)}"`,'btn danger'));
      } else if(kind==='edit') {
        showDialog(t('editPost'),`<div class="form-group"><label for="community-social-edit-title">${esc(t('title'))}</label><input class="field" id="community-social-edit-title" name="title" required maxlength="120" value="${esc(post.title||'')}" autofocus></div><div class="form-group"><label for="community-social-edit-body">${esc(t('body'))}</label><textarea class="field" id="community-social-edit-body" name="body" maxlength="1500" ${postBody(post)?'required':''}>${esc(postBody(post))}</textarea></div><p data-social-form-error class="community-social-error" role="alert"></p>`,cancel+`<button type="submit" class="btn primary">${esc(t('save'))}</button>`,{form:`data-social-edit-form="${esc(post.id)}" data-community-editing="true"`});
      } else if(kind==='report') {
        showDialog(t('report'),`<div class="form-group"><label for="community-social-report-reason">${esc(t('reason'))}</label><textarea class="field" id="community-social-report-reason" name="reason" required maxlength="500" placeholder="${esc(t('reasonPlaceholder'))}" autofocus></textarea></div><p class="quiet">${esc(t('demo'))}</p><p data-social-form-error class="community-social-error" role="alert"></p>`,cancel+`<button type="submit" class="btn primary">${esc(t('sendReport'))}</button>`,{form:`data-social-report-form="${esc(post.id)}" data-social-comment="${esc(commentId)}"`});
      }
    }
    function pricing() {
      const value=adapter.getPricing?.();
      if(value?.canPurchase===false)return [];
      const plans=Array.isArray(value?.plans)?value.plans:demoPlans;
      return plans.filter(plan=>Number(plan.planDays)>0&&Number(plan.priceUsd)>=0);
    }
    function boost(post,selected) {
      if(!own(post))return;
      const plans=pricing(),plan=plans.find(item=>Number(item.planDays)===Number(selected))||plans[0];
      const backId=modal?.kind==='post'?modal.id:modal?.backId;
      modal={kind:'boost',id:String(post.id),planDays:plan?.planDays,backId};
      showDialog(t(ensurePost(post).featuredPreview?'extend':'boost'),`<h3>${esc(post.title)}</h3><div class="community-social-plans" role="radiogroup" aria-label="${esc(t('plan'))}">${plans.map(item=>button('boost-plan',`<strong>${esc(t('days',{count:item.planDays}))}</strong><span>$${esc(Number(item.priceUsd).toLocaleString('en-US'))}</span>`,post.id,` role="radio" aria-checked="${item===plan}" data-social-plan="${esc(item.planDays)}"`,'community-social-plan')).join('')}</div><p class="quiet">${esc(t('paymentDemo'))}</p><p data-social-form-error class="community-social-error" role="alert"></p>`,button('cancel',esc(t('cancel')),post.id,'','btn')+(plan?button('boost-preview',esc(t('preview')),post.id,'','btn primary'):''));
    }
    function openGallery(post,index) {
      const images=safeImages(post);if(!images.length)return;
      const backId=modal?.kind==='post'?modal.id:modal?.backId;
      modal={kind:'gallery',id:String(post.id),index:Math.max(0,Math.min(images.length-1,index)),backId};
      const position=modal.index;
      showDialog(t('gallery',{name:post.owner}),`<img src="${esc(images[position])}" alt="${esc(t('photo',{name:post.owner}))}">`,button('gallery-prev',esc(t('previous')),post.id,position===0?' disabled':'','btn')+`<span class="community-social-photo-count" aria-live="polite">${position+1} / ${images.length}</span>`+button('gallery-next',esc(t('next')),post.id,position===images.length-1?' disabled':'','btn'),{className:'community-social-lightbox'});
    }
    function formError(message) {const error=document.querySelector('[data-social-form-error]');if(error)error.textContent=message;else tell(message);}
    function focusControl(action,postId,inDetail=false) {
      const control=[...document.querySelectorAll('[data-social-action]')].find(element=>element.dataset.socialAction===action&&element.dataset.socialPost===String(postId)&&Boolean(element.closest('[data-social-post-detail]'))===inDetail);
      control?.focus({preventScroll:true});
    }
    function focusComposer(postId,inDetail=false) {
      const form=[...document.querySelectorAll('[data-social-comment-form]')].find(element=>element.dataset.socialCommentForm===String(postId)&&Boolean(element.closest('[data-social-post-detail]'))===inDetail);
      form?.querySelector('textarea')?.focus({preventScroll:true});
    }
    function onClick(event) {
      const target=event.target.closest?.('[data-social-action]');
      if(!target){if(event.target.matches?.('[data-social-overlay]'))closeDialog();if(!event.target.closest?.('.community-social-menu-wrap'))closeMenus();return;}
      event.preventDefault();
      const action=target.dataset.socialAction,post=findPost(target.dataset.socialPost||modal?.id),postId=String(post?.id||''),commentId=target.dataset.socialComment,inDetail=Boolean(target.closest('[data-social-post-detail]'));
      if(action==='close'||action==='cancel'){closeDialog();return;}
      if(!post)return;
      const entry=ensurePost(post),comment=entry.comments.find(row=>row.id===commentId);
      if(action==='menu') {const menu=target.nextElementSibling,wasOpen=!menu.hidden;closeMenus();menu.hidden=wasOpen;target.setAttribute('aria-expanded',String(!wasOpen));if(!wasOpen)menu.querySelector('button')?.focus({preventScroll:true});return;}
      closeMenus();
      if(action==='like'){if(member&&change(next=>{const row=next.posts[postId],has=row.likedBy.includes(member);row.likedBy=has?row.likedBy.filter(name=>name!==member):[...row.likedBy,member];})){refresh();focusControl('like',postId,inDetail);}}
      else if(action==='comments'){opened.has(postId)?opened.delete(postId):opened.add(postId);refresh();if(opened.has(postId))focusComposer(postId,inDetail);else focusControl('comments',postId,inDetail);}
      else if(action==='edit-post'&&own(post)){if(adapter.editPost){modal=null;adapter.editPost(post);}else subDialog('edit',post);}
      else if(action==='delete-post'&&own(post))subDialog('delete-post',post);
      else if(action==='report-post'&&!own(post))subDialog('report',post);
      else if(action==='reply'&&comment){replyTargets.set(postId,comment.id);opened.add(postId);if(comment.parentId)threads.add(threadKey(postId,comment.parentId));refresh();focusComposer(postId,inDetail);}
      else if(action==='cancel-reply'){replyTargets.delete(postId);refresh();}
      else if(action==='thread'){const key=threadKey(postId,target.dataset.socialThread);threads.has(key)?threads.delete(key):threads.add(key);refresh();}
      else if(action==='more-comments'){limits.set(postId,(limits.get(postId)||PAGE_SIZE)+PAGE_SIZE);refresh();}
      else if(action==='more-replies'){const key=threadKey(postId,target.dataset.socialThread);replyLimits.set(key,(replyLimits.get(key)||PAGE_SIZE)+PAGE_SIZE);refresh();}
      else if(action==='delete-comment'&&comment?.owner===member)subDialog('delete-comment',post,comment.id);
      else if(action==='report-comment'&&comment&&comment.owner!==member)subDialog('report',post,comment.id);
      else if(action==='confirm-delete-comment'&&modal?.kind==='delete-comment'&&modal.id===postId&&modal.commentId===commentId&&comment?.owner===member) {
        if(change(next=>{next.posts[postId].comments=next.posts[postId].comments.filter(row=>row.id!==commentId&&row.parentId!==commentId);})){closeDialog();refresh();}
      } else if(action==='confirm-delete-post'&&modal?.kind==='delete-post'&&modal.id===postId&&own(post)) {
        const before=copy(state);before.posts=Object.assign(Object.create(null),before.posts);
        if(!change(next=>{if(!next.deletedPostIds.includes(postId))next.deletedPostIds.push(postId);})){formError(t('error'));return;}
        if(!removeStoredPost(post)){persist(before);adapter.render?.();enhance();formError(t('error'));return;}
        closeDialog(false);refresh();tell(t('deleted'));
      } else if(action==='gallery')openGallery(post,Number(target.dataset.socialIndex)||0);
      else if(action==='gallery-prev'&&modal?.kind==='gallery')openGallery(post,modal.index-1);
      else if(action==='gallery-next'&&modal?.kind==='gallery')openGallery(post,modal.index+1);
      else if(action==='boost-post'&&own(post))boost(post);
      else if(action==='boost-plan'&&own(post)&&modal?.kind==='boost')boost(post,Number(target.dataset.socialPlan));
      else if(action==='boost-preview'&&own(post)&&modal?.kind==='boost'){
        const plan=pricing().find(row=>Number(row.planDays)===Number(modal.planDays));if(!plan)return;
        if(change(next=>{next.posts[postId].featuredPreview={planDays:plan.planDays,priceUsd:plan.priceUsd,expiresAt:new Date(Date.now()+Number(plan.planDays)*86400000).toISOString()};})){closeDialog();refresh();tell(t('paymentDemo'));}
      }
    }
    function onSubmit(event) {
      const form=event.target;if(!form.matches('[data-social-comment-form],[data-social-edit-form],[data-social-report-form]'))return;
      event.preventDefault();
      const postId=form.dataset.socialCommentForm||form.dataset.socialEditForm||form.dataset.socialReportForm,post=findPost(postId);if(!post)return;
      if(form.hasAttribute('data-social-comment-form')) {
        const body=form.elements.comment.value.trim();if(!member||!body||body.length>1000)return;
        const target=ensurePost(post).comments.find(row=>row.id===replyTargets.get(postId)),rootId=target?.parentId||target?.id||null;
        if(change(next=>{next.posts[postId].comments.push({id:id('comment'),owner:member,body,parentId:rootId,replyTo:target?.owner||'',createdAt:new Date().toISOString()});})){
          if(rootId)threads.add(threadKey(postId,rootId));else limits.set(postId,ensurePost(post).comments.filter(row=>!row.parentId).length);
          drafts.delete(postId);replyTargets.delete(postId);refresh();
        }
      } else if(form.hasAttribute('data-social-edit-form')&&own(post)&&modal?.kind==='edit'&&modal.id===postId) {
        const title=form.elements.title.value.trim(),body=form.elements.body.value.trim();
        if(!title||title.length>120||body.length>1500||(!body&&postBody(post))){formError(t('required'));return;}
        const key=bodyKey(post),before={title:post.title,[key]:post[key],lastEditedAt:post.lastEditedAt};
        Object.assign(post,{title,[key]:body,lastEditedAt:new Date().toISOString()});
        if(adapter.save?.()===false){Object.assign(post,before);if(before.lastEditedAt===undefined)delete post.lastEditedAt;formError(t('error'));return;}
        closeDialog();refresh();tell(t('updated'));
      } else if(form.hasAttribute('data-social-report-form')&&modal?.kind==='report'&&modal.id===postId) {
        const reason=form.elements.reason.value.trim(),commentId=form.dataset.socialComment;
        const row=commentId?ensurePost(post).comments.find(comment=>comment.id===commentId):null;
        if(!reason||reason.length>500||(commentId?(!row||row.owner===member):own(post)))return;
        if(change(next=>next.reports.push({id:id('report'),targetType:commentId?'comment':'post',targetId:commentId||postId,postId,reporter:member,reason,createdAt:new Date().toISOString()}))){closeDialog();tell(t('demo'));}
      }
    }
    function onInput(event) {const form=event.target.closest?.('[data-social-comment-form]');if(form&&event.target.name==='comment')drafts.set(form.dataset.socialCommentForm,event.target.value);}
    function onPointerDown(event) {if(modal?.kind==='gallery'&&event.target.closest?.('.community-social-lightbox .dialog-body'))swipeStart={x:event.clientX,y:event.clientY};}
    function onPointerUp(event) {if(!swipeStart)return;const start=swipeStart;swipeStart=null;if(modal?.kind!=='gallery')return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){const post=findPost(modal.id);if(post)openGallery(post,modal.index+(dx<0?1:-1));}}
    function onPointerCancel() {swipeStart=null;}
    function onKeyDown(event) {
      const dialog=document.querySelector('[data-social-dialog]');
      if(event.key==='Escape') {const menu=document.querySelector('.community-social-menu:not([hidden])');if(menu){const toggle=menu.previousElementSibling;closeMenus();event.preventDefault();event.stopImmediatePropagation();toggle?.focus({preventScroll:true});}else if(dialog){event.preventDefault();event.stopImmediatePropagation();closeDialog();}return;}
      if(!dialog)return;
      if(modal?.kind==='gallery'&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const post=findPost(modal.id);if(post)openGallery(post,modal.index+(event.key==='ArrowRight'?1:-1));return;}
      if(event.key!=='Tab')return;
      const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(element=>!element.closest('[hidden]'));
      const first=focusable[0],last=focusable.at(-1);if(!first)return;
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
    function reset() {try{localStorage.removeItem(STORAGE_KEY);}catch{}state={version:1,posts:Object.create(null),reports:[],deletedPostIds:[]};opened.clear();threads.clear();limits.clear();replyLimits.clear();replyTargets.clear();drafts.clear();for(const post of getFeed())if(post.kind!=='deal')ensurePost(post);persist(state);enhance();}
    function onDialogClosed() {modal=null;swipeStart=null;closeMenus();}
    function languageChanged() {
      const form=document.querySelector('[data-social-edit-form],[data-social-report-form]');
      const values=form?[...form.elements].filter(element=>element.name).map(element=>[element.name,element.value]):[];
      enhance();
      if(modal){const post=findPost(modal.id);if(modal.kind==='post')openPost(modal.id,{...modal,preserveOpen:true});else if(post&&modal.kind==='gallery')openGallery(post,modal.index);else if(post&&modal.kind==='boost')boost(post,modal.planDays);else if(post)subDialog(modal.kind,post,modal.commentId);}
      const nextForm=document.querySelector('[data-social-edit-form],[data-social-report-form]');
      if(nextForm)for(const [name,value] of values)if(nextForm.elements[name])nextForm.elements[name].value=value;
    }
    const languageObserver=new MutationObserver(languageChanged);
    function destroy() {destroyed=true;document.removeEventListener('click',onClick);document.removeEventListener('submit',onSubmit);document.removeEventListener('input',onInput);document.removeEventListener('pointerdown',onPointerDown);document.removeEventListener('pointerup',onPointerUp);document.removeEventListener('pointercancel',onPointerCancel);document.removeEventListener('keydown',onKeyDown,true);languageObserver.disconnect();}
    applyDeleted();for(const post of getFeed())if(post.kind!=='deal')ensurePost(post);persist(state);
    document.addEventListener('click',onClick);document.addEventListener('submit',onSubmit);document.addEventListener('input',onInput);document.addEventListener('pointerdown',onPointerDown);document.addEventListener('pointerup',onPointerUp);document.addEventListener('pointercancel',onPointerCancel);document.addEventListener('keydown',onKeyDown,true);languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    mounted={enhance,openPost,isVisible,onDialogClosed,reset,destroy};return mounted;
  }
  window.NEXORA_COMMUNITY_FEED_SOCIAL={mount,enhance:root=>mounted?.enhance(root),openPost:(id,options)=>mounted?.openPost(id,options),isVisible:item=>mounted?.isVisible(item)??true,onDialogClosed:()=>mounted?.onDialogClosed(),reset:()=>mounted?.reset()};
})();
