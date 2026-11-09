/* The PO storefront, Reels, Live and News share Community navigation and identity. */
(() => {
  const shared=window.NEXORA_COMMUNITY_SHARED;
  // Keep the PO controller's nodes, but let the host supply the single header/navigation.
  for(const node of document.querySelectorAll('.sidebar,.topbar,.community-heading,.mobile-nav-row,#feature-menu-root'))node.style.setProperty('display','none','important');
  document.querySelector('.container').style.cssText='margin:0!important;padding:16px!important;max-width:none!important;width:100%!important';
  const layout=document.createElement('style');layout.textContent='.topbar,.community-heading,.mobile-nav-row,#feature-menu-root,.live-links,#ai-fab{display:none!important}.container{margin:0!important;padding:16px!important;max-width:1200px}.native-body{padding:0!important}';document.head.append(layout);
  const poStorySamples=samplePages.slice();
  const originalStoryItems=storyItems;storyItems=function(){return [...originalStoryItems(),...poStorySamples.slice(0,4).map((page,index)=>({id:'sample-story-'+index,name:page.name,body:page.aboutVi,bodyEn:page.aboutEn,image:page.cover,sample:true}))];};
  sampleLiveRooms.splice(0);samplePages.splice(0);
  // PO friend suggestions keep their own labeled sample requests; retained Connect requests are preserved.
  const newsSamples=[{"id":"sample-news-1","category":"community","title":"Explore NEXORA Community sections","summary":"A sample guide to groups, pages, jobs, storefronts, real estate and food.","body":"Open Groups & Market for community discussions, Jobs to find or hire workers, and My storefront to show items.\nThis is a sample article for preview.","date":"Nov 9, 2026","sample":true},{"id":"sample-news-2","category":"jobs","title":"Details to include in a hiring post","summary":"State the role, skills, location, schedule and pay period so applicants understand the job.","body":"A clear hiring post includes the role, required skills, location, schedule, pay amount and pay period. Add contact details and an application deadline.\nThis is a sample article for preview.","date":"Nov 9, 2026","sample":true},{"id":"sample-news-3","category":"realestate","title":"Preparing a Real Estate listing","summary":"Basic details to help readers understand a sale or rental listing.","body":"Describe the area, size, price, terms and relevant images. Readers should verify information before making a decision.\nThis is a sample article for preview.","date":"Nov 9, 2026","sample":true},{"id":"sample-news-4","category":"food","title":"Share a favorite neighborhood meal","summary":"Help the community discover a local restaurant and its menu.","body":"Include the restaurant name, neighborhood, dish name and your own experience. Add a photo of the meal and check the restaurant’s current opening hours before visiting.\nThis is a sample article for preview.","date":"Nov 9, 2026","sample":true},{"id":"sample-news-5","category":"guide","title":"Make your Community post easy to find","summary":"Choose a relevant topic and add useful details before posting.","body":"Use a clear title, select the right topic and include your area. Review the text and photos before publishing, and reply to questions from other members.\nThis is a sample article for preview.","date":"Nov 9, 2026","sample":true}];
  for(const article of newsSamples)if(!state.newsPosts.some(row=>row.id===article.id))state.newsPosts.push(article);
  state.newsPosts.forEach(row=>{if(row.sample&&/^\d{2}\/\d{2}\/\d{4}$/.test(row.date))row.date="Nov 3, 2026";});
  state.feedPosts=state.feedPosts.filter(row=>!row.demo);
  state.wallet=shared.wallet().balance;
  const originalSave=save;
  save=function(){const result=originalSave();if(result)window.dispatchEvent(new CustomEvent('nexora-hub-tools-changed'));return result;};
  const originalOpenDialog=openDialog,originalOpenDish=openDishDialog;
  openDialog=function(kind,...args){if(kind==='shop'&&!shared.canAccessFeature('shop'))return false;return originalOpenDialog(kind,...args);};
  openDishDialog=function(...args){if(!shared.canAccessFeature('foodMerchant'))return false;return originalOpenDish(...args);};
  const originalSocialComposer=openSocialComposer;
  openSocialComposer=function(...args){const result=originalSocialComposer(...args);if(shared.role!=='owner')for(const node of document.querySelectorAll('[data-social-type="coupon"]'))node.remove();return result;};
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
  document.addEventListener('click',event=>{
    if(current!=='deals')return;
    if(event.target.closest('.deal-hero [data-feed-kind="coupon"]')&&shared.role==='owner'){event.preventDefault();event.stopImmediatePropagation();openFeedDialog('coupon');return;}
    const target=event.target.closest('[data-page-open],[data-section]');
    if(!target)return;
    const route=target.dataset.pageOpen?'pages':target.dataset.section;
    if(!['pages','food','shop'].includes(route))return;
    event.preventDefault();event.stopImmediatePropagation();
    parent.postMessage({type:'nexora-community-route',route},location.origin);
  },true);
  // Use the original Blog and Page stores rather than parallel module copies.
  document.addEventListener('click',event=>{const target=event.target.closest('[data-feed-kind],[data-social-type],[data-section],button[data-action]');if(!target)return;const action=target.dataset.action;if(shared.role!=='owner'&&(target.dataset.feedKind==='coupon'||target.dataset.socialType==='coupon')){event.preventDefault();event.stopImmediatePropagation();return;}if(target.dataset.section&&!shared.canAccessFeature(target.dataset.section)||!shared.canAccessFeature('shop')&&action?.startsWith('shop-')){event.preventDefault();event.stopImmediatePropagation();return;}if(target.dataset.feedKind==='blog'||target.dataset.section==='blog'){event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'nexora-community-route',route:'blog'},location.origin);}if(['shop-page','shop-deal'].includes(action)){event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'nexora-community-route',route:action==='shop-page'?'pages':'deals'},location.origin);}},true);
  const originalShowcase=reelShowcase;
  reelShowcase=function(row){return originalShowcase(row)+'<div class="post-actions"><button type="button" class="btn soft" data-expansion-reel-like="'+esc(row.id)+'">'+tx('Thích','Like')+' · '+(state.postLikes[row.id]?1:0)+'</button><button type="button" class="btn soft" data-expansion-reel-comment="'+esc(row.id)+'">'+tx('Bình luận','Comment')+'</button><button type="button" class="btn soft" data-expansion-reel-share="'+esc(row.id)+'">'+tx('Chia sẻ','Share')+'</button></div>';};
  document.addEventListener('click',event=>{const target=event.target.closest('[data-expansion-reel-like],[data-expansion-reel-comment],[data-expansion-reel-share]');if(!target)return;const id=target.dataset.expansionReelLike||target.dataset.expansionReelComment||target.dataset.expansionReelShare;if(target.dataset.expansionReelLike){state.postLikes[id]=!state.postLikes[id];save();render();}else if(target.dataset.expansionReelShare){const link=new URL(parent.location.href);link.searchParams.set('tab','reels');link.searchParams.set('reelId',id);navigator.clipboard?.writeText(link.href).catch(()=>{});}else{$('dialog-content').innerHTML='<div class="dialog-head"><h2>'+tx('Bình luận','Comments')+'</h2><button type="button" class="btn" data-action="close-dialog">×</button></div><div class="dialog-body">'+(state.postComments[id]||[]).map(row=>'<p><strong>'+esc(row.author)+'</strong> '+esc(row.text)+'</p>').join('')+'<form data-expansion-reel-reply="'+esc(id)+'"><input name="body" required maxlength="1000" placeholder="'+tx('Viết bình luận…','Write a comment…')+'"><button type="submit" class="btn primary">'+tx('Gửi','Send')+'</button></form></div>';$('editor').showModal();}});
  document.addEventListener('submit',event=>{if(!event.target.matches('[data-expansion-reel-reply]'))return;event.preventDefault();const id=event.target.dataset.expansionReelReply,value=new FormData(event.target).get('body').trim();if(!value)return;state.postComments[id]||=[];state.postComments[id].push({author:shared.member,text:value});if(save()){$('editor').close();shared.activity('comment','reel:'+id+':'+state.postComments[id].length);render();}});
  window.NEXORA_COMMUNITY_MODULE={navigate(section,context={}){if(!shared.canAccessFeature(section))section='home';navigate(section);if(context.composeReel==='1')openFeedDialog('reel');if(context.reelId)requestAnimationFrame(()=>document.querySelector('[data-reel-view="'+CSS.escape(String(context.reelId))+'"]')?.closest('article')?.scrollIntoView({block:'center'}));},setLanguage(value){state.lang=value==='vi'?'vi':'en';document.documentElement.lang=state.lang;render();},assistant(){openAiVoice();},deactivate(){stopCamera();}};
  save();render();
})();
