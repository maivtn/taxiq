/* The PO storefront, Reels, Live and News share Community navigation and identity. */
(() => {
  const shared=window.NEXORA_COMMUNITY_SHARED;
  const layout=document.createElement('style');layout.textContent='.topbar,.community-heading,.mobile-nav-row,#feature-menu-root,.live-links,#ai-fab{display:none!important}.container{margin:0!important;padding:16px!important;max-width:1200px}.native-body{padding:0!important}';document.head.append(layout);
  const poStorySamples=samplePages.slice();
  const originalStoryItems=storyItems;storyItems=function(){return [...originalStoryItems(),...poStorySamples.slice(0,4).map((page,index)=>({id:'sample-story-'+index,name:page.name,body:page.aboutVi,bodyEn:page.aboutEn,image:page.cover,sample:true}))];};
  sampleReelClips.splice(0);sampleLiveRooms.splice(0);samplePages.splice(0);
  // PO friend suggestions keep their own labeled sample requests; retained Connect requests are preserved.
  state.newsPosts=state.newsPosts.filter(row=>!row.sample);
  state.feedPosts=state.feedPosts.filter(row=>!row.demo);
  state.wallet=shared.wallet().balance;
  const originalSave=save;
  save=function(){const result=originalSave();if(result)window.dispatchEvent(new CustomEvent('nexora-hub-tools-changed'));return result;};
  const originalOpenDialog=openDialog,originalOpenDish=openDishDialog;
  openDialog=function(kind,...args){if(kind==='shop'&&!shared.canAccessFeature('shop'))return false;return originalOpenDialog(kind,...args);};
  openDishDialog=function(...args){if(!shared.canAccessFeature('shop'))return false;return originalOpenDish(...args);};
  const originalRender=render;
  render=function(){
    state.role=shared.role==='owner'?'business':'personal';
    originalRender();
    for(const node of document.querySelectorAll('[data-section]'))if(!shared.canAccessFeature(node.dataset.section))node.remove();
    if(shared.role!=='owner')for(const node of document.querySelectorAll('[data-feed-kind="coupon"],[data-social-type="coupon"]'))node.remove();
    const empty=(vi,en)=>'<div class="card" style="padding:24px;text-align:center">'+tx(vi,en)+'</div>';
    if(current==='reels'&&!allReelClips().length)$('page-view').insertAdjacentHTML('beforeend',empty('Chưa có Reels. Hãy đăng video ngắn đầu tiên của bạn.','No Reels yet. Post your first short video.'));
    if(current==='live'&&!state.liveRooms.length)$('page-view').insertAdjacentHTML('beforeend',empty('Chưa có phòng live. Tạo phòng mới.','No live rooms yet. Create a room.'));
    for(const element of document.querySelectorAll('.live-links,#food-extra'))element.hidden=true;
    for(const element of document.querySelectorAll('[data-global-menu="profile"]'))element.onclick=()=>parent.postMessage({type:'nexora-community-route',route:'account'},location.origin);
    for(const node of document.querySelectorAll('[data-nx-profile-id]'))node.textContent=shared.me().id;
  };
  // Use the original Blog and Page stores rather than parallel module copies.
  document.addEventListener('click',event=>{const target=event.target.closest('[data-feed-kind],[data-section],button[data-action]');if(!target)return;const action=target.dataset.action;if(target.dataset.section&&!shared.canAccessFeature(target.dataset.section)||!shared.canAccessFeature('shop')&&action?.startsWith('shop-')){event.preventDefault();event.stopImmediatePropagation();return;}if(target.dataset.feedKind==='blog'||target.dataset.section==='blog'){event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'nexora-community-route',route:'blog'},location.origin);}if(['shop-page','shop-deal'].includes(action)){event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'nexora-community-route',route:action==='shop-page'?'pages':'deals'},location.origin);}},true);
  const originalShowcase=reelShowcase;
  reelShowcase=function(row){return originalShowcase(row)+'<div class="post-actions"><button type="button" class="btn soft" data-expansion-reel-like="'+esc(row.id)+'">'+tx('Thích','Like')+' · '+(state.postLikes[row.id]?1:0)+'</button><button type="button" class="btn soft" data-expansion-reel-comment="'+esc(row.id)+'">'+tx('Bình luận','Comment')+'</button><button type="button" class="btn soft" data-expansion-reel-share="'+esc(row.id)+'">'+tx('Chia sẻ','Share')+'</button></div>';};
  document.addEventListener('click',event=>{const target=event.target.closest('[data-expansion-reel-like],[data-expansion-reel-comment],[data-expansion-reel-share]');if(!target)return;const id=target.dataset.expansionReelLike||target.dataset.expansionReelComment||target.dataset.expansionReelShare;if(target.dataset.expansionReelLike){state.postLikes[id]=!state.postLikes[id];save();render();}else if(target.dataset.expansionReelShare){const link=new URL(parent.location.href);link.searchParams.set('tab','reels');link.searchParams.set('reelId',id);navigator.clipboard?.writeText(link.href).catch(()=>{});}else{$('dialog-content').innerHTML='<div class="dialog-head"><h2>'+tx('Bình luận','Comments')+'</h2><button type="button" class="btn" data-action="close-dialog">×</button></div><div class="dialog-body">'+(state.postComments[id]||[]).map(row=>'<p><strong>'+esc(row.author)+'</strong> '+esc(row.text)+'</p>').join('')+'<form data-expansion-reel-reply="'+esc(id)+'"><input name="body" required maxlength="1000" placeholder="'+tx('Viết bình luận…','Write a comment…')+'"><button type="submit" class="btn primary">'+tx('Gửi','Send')+'</button></form></div>';$('editor').showModal();}});
  document.addEventListener('submit',event=>{if(!event.target.matches('[data-expansion-reel-reply]'))return;event.preventDefault();const id=event.target.dataset.expansionReelReply,value=new FormData(event.target).get('body').trim();if(!value)return;state.postComments[id]||=[];state.postComments[id].push({author:shared.member,text:value});if(save()){$('editor').close();shared.activity('comment','reel:'+id+':'+state.postComments[id].length);render();}});
  window.NEXORA_COMMUNITY_MODULE={navigate(section,context={}){if(!shared.canAccessFeature(section))section='home';navigate(section);if(context.reelId)requestAnimationFrame(()=>document.querySelector('[data-reel-view="'+CSS.escape(String(context.reelId))+'"]')?.closest('article')?.scrollIntoView({block:'center'}));},setLanguage(value){state.lang=value==='vi'?'vi':'en';document.documentElement.lang=state.lang;render();},assistant(){openAiVoice();},deactivate(){stopCamera();}};
  save();render();
})();
