/* CN-05 / FP-09: a single personal and Page composer, retaining the shared records. */
(() => {
  'use strict';
  const original=openSocialComposer;
  let versions={},language='en';
  async function legacyFile(id){const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('nexora-community-page-media-v1',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});try{return await new Promise((resolve,reject)=>{const request=db.transaction('files').objectStore('files').get(id);request.onsuccess=()=>request.result?resolve(request.result):reject(Error('Unable to load the existing media.'));request.onerror=()=>reject(request.error);});}finally{db.close();}}

  openSocialComposer=function(kind,pageId='',origin='',editId='',editFocus='text',groupId=''){
    original(kind,pageId,origin,editId,editFocus,groupId);
    const form=$('feed-form'),post=state.feedPosts.find(row=>row.id===editId),page=pageById(pageId||post?.pageId);
    if(!form)return;
    const drafts=state.feedPosts.filter(row=>!row.demo&&row.status==='draft'&&row.pageId===(pageId||''));if(drafts.length)form.querySelector('.social-compose-main').insertAdjacentHTML('beforeend','<details class="po-composer-drafts"><summary>Drafts ('+drafts.length+')</summary>'+drafts.map(row=>'<button type="button" class="btn soft" data-composer-draft="'+esc(row.id)+'">'+esc(row.title||row.body)+'</button>').join('')+'</details>');
    versions=structuredClone(post?.languageVersions||{});language=post?.language||'en';
    form.dataset.unifiedComposer='1';
    form.querySelector('[name=title]')?.remove();
    form.querySelector('[name=body]').insertAdjacentHTML('beforebegin','<input type="hidden" name="title" value="'+esc(post?.title||'')+'">');
    if(page){form.elements.pageId.value=page.id;form.querySelector('.social-identity strong').textContent=page.name;}
    form.querySelector('.social-compose-main').insertAdjacentHTML('beforeend','<section class="po-language-versions"><label>'+tx('Phiên bản ngôn ngữ','Language version')+'<select name="language"><option value="en">English</option><option value="vi">Tiếng Việt</option></select></label><button type="button" class="btn soft" data-composer-language>'+tx('Thêm phiên bản ngôn ngữ khác','Add another language version')+'</button><small>'+tx('Mỗi phiên bản là một bản đơn ngôn ngữ riêng.','Each language version is a separate monolingual post.')+'</small></section><input type="hidden" name="status" value="published">');
    form.elements.language.value=language;
    const footer=form.querySelector('.social-compose-footer');
    footer.insertAdjacentHTML('beforeend','<p role="alert" data-composer-error></p>');
    const offers=JSON.parse(localStorage.getItem('nexora-community-templates-v1')||'{}').feed||[];
    if(page)form.querySelector('.social-compose-main').insertAdjacentHTML('beforeend','<label class="social-attach-deal">Attach deal<select name="attachedDealId"><option value="">None</option>'+offers.filter(row=>row.kind==='deal'&&row.pageId===page.id).map(row=>'<option value="'+esc(row.id)+'" '+(post?.attachedDealId===row.id?'selected':'')+'>'+esc(row.title)+'</option>').join('')+'</select></label>');
    form._retainedLegacyMedia=(post?.legacyMedia||[]).filter(item=>item.src&&item.type==='video');
    const legacyPreview=document.createElement('div');legacyPreview.className='po-legacy-media';
    const renderLegacy=()=>{legacyPreview.innerHTML=form._retainedLegacyMedia.map((item,index)=>'<div><video controls playsinline src="'+esc(item.src)+'"></video><button type="button" class="btn" data-remove-legacy="'+index+'">Remove video</button></div>').join('');};
    form.querySelector('.social-compose-main').append(legacyPreview);renderLegacy();
    legacyPreview.addEventListener('click',event=>{const remove=event.target.closest('[data-remove-legacy]');if(remove){form._retainedLegacyMedia.splice(Number(remove.dataset.removeLegacy),1);renderLegacy();}});
    form._legacyReady=post?.legacyMedia?.length?(async()=>{const images=[...socialExistingImages];let videoId=socialExistingVideoId;for(const item of post.legacyMedia){if(item.src){if(item.type==='image')images.push(item.src);continue;}const file=await legacyFile(item.id);if(item.type==='video')videoId=await storeVideo(file);else images.push(await imageFromSocial(file));}if(!form.isConnected||$('feed-form')!==form||!$('editor').open)throw Error('Composer closed.');socialExistingImages=images;socialExistingVideoId=videoId;renderSocialPreview();return true;})():Promise.resolve(false);
    form._legacyReady.catch(error=>{if(form.isConnected)form.querySelector('[data-composer-error]').textContent=error.message;});

    form.addEventListener('change',event=>{if(event.target.name==='language'){versions[language]={title:form.elements.title.value,body:form.elements.body.value};language=form.elements.language.value;form.elements.title.value=versions[language]?.title||'';form.elements.body.value=versions[language]?.body||'';}});
    form.addEventListener('click',event=>{const mode=event.target.closest('[data-composer-mode]')?.dataset.composerMode;if(mode){$('editor').close();parent.postMessage({type:'nexora-community-route',route:mode,context:{[mode==='stories'?'composeStory':'composeReel']:'1',pageId:pageId||''}},location.origin);return;}const draft=event.target.closest('[data-composer-draft]');if(draft){openSocialComposer('post',pageId,'',draft.dataset.composerDraft);return;}if(event.target.closest('[data-composer-language]')){form.elements.language.value=language==='en'?'vi':'en';form.elements.language.dispatchEvent(new Event('change',{bubbles:true}));}});
  };
  document.addEventListener('submit',async event=>{
    const form=event.target;if(!form.matches('[data-unified-composer]'))return;
    event.preventDefault();event.stopImmediatePropagation();if(form.dataset.saving)return;form.dataset.saving='1';
    const feedback=form.querySelector('[data-composer-error]'),buttons=[...form.querySelectorAll('[type=submit]')];buttons.forEach(button=>button.disabled=true);feedback.textContent='';
    try{
      const legacyMediaMigrated=await form._legacyReady;const d=new FormData(form),status=event.submitter?.value==='draft'?'draft':d.get('status'),publishAt=d.get('publishAt');
      if(status==='scheduled'&&(!publishAt||new Date(publishAt)<=new Date()))throw Error(tx('Chọn thời gian đăng trong tương lai.','Choose a future publish time.'));
      const pageId=String(d.get('pageId')||''),page=pageById(pageId);if(pageId&&(!page||page.sample))throw Error(tx('Bạn không có quyền đăng lên Page này.','You cannot post to this Page.'));
      if(form._retainedLegacyMedia.length&&(socialSelectedFiles.length||socialExistingImages.length||socialExistingVideoId))throw Error('Post multiple photos or one video per post.');const images=[...socialExistingImages];let videoId=socialExistingVideoId;
      for(const file of socialSelectedFiles){if(file.type.startsWith('image/'))images.push(await imageFromSocial(file));else videoId=await storeVideo(file);}
      const title=String(d.get('title')||'').trim(),body=String(d.get('body')||'').trim();
      if(!title&&!body&&!images.length&&!videoId)throw Error(tx('Hãy viết vài dòng hoặc thêm ảnh/video.','Write something or add a photo/video.'));
      versions[language]={title,body};
      const post=state.feedPosts.find(row=>row.id===socialEditingPostId&&!row.demo),before=post?structuredClone(post):null;
      const group=state.customGroups.find(row=>row.id===String(d.get('groupId')||''));const row={...(post||{}),legacyMediaMigrated,legacyMediaRetained:form._retainedLegacyMedia,attachedDealId:String(d.get('attachedDealId')||''),id:post?.id||'feed-'+crypto.randomUUID(),kind:videoId?'video':images.length?'photos':'post',title,body,images,image:images[0]||'',videoId,language,languageVersions:structuredClone(versions),status,publishAt:status==='scheduled'?new Date(publishAt).toISOString():'',pageId,shopOrigin:post?.shopOrigin||d.get('storeOrigin')==='1',groupId:String(d.get('groupId')||''),groupStatus:post?.groupStatus||(group&&!group.owned&&group.approval?'pending':'approved'),visibility:String(d.get('visibility')||'public'),author:page?.name||window.NEXORA_COMMUNITY_SHARED.member,area:String(d.get('area')||state.feedArea),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),createdAt:post?.createdAt||new Date().toISOString(),demo:false,bridgeSource:post?.bridgeSource||(pageId?'pagePosts':'feed'),bridgeOwner:window.NEXORA_COMMUNITY_SHARED.member};
      if(post)Object.assign(post,row);else state.feedPosts.unshift(row);
      if(!save()){if(post)Object.assign(post,before);else state.feedPosts=state.feedPosts.filter(item=>item.id!==row.id);throw Error(tx('Không thể lưu. Vui lòng thử lại.','Unable to save. Please try again.'));}
      $('editor').close();render();
      if(pageId)parent.postMessage({type:'nexora-community-route',route:'pages',context:{pageId,pageMode:'view',pageTab:status==='draft'?'drafts':status==='scheduled'?'scheduled':'posts'}},location.origin);
    }catch(error){feedback.textContent=error.message;}finally{delete form.dataset.saving;buttons.forEach(button=>button.disabled=false);}
  },true);
})();
