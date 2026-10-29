/* PO single-screen forms, with staging Community photos, destinations and drafts.
   UI copy: staging src/locales/{en,vi}.json, communityFeed and job-posting drafts. */
(() => {
  'use strict';
  const DRAFT_KEY='nexora-community-feed-drafts-v1';
  const KINDS=new Set(['general','showcase','tip','question','poll','event']);
  const MAX_PHOTOS=6,MAX_DESTINATIONS=3,MAX_STORED_IMAGE=300000;
  const ACCEPT='image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif';
  const COPY={
    en:{photos:'Photos (up to 6)',add:'Add photos',removePhoto:'Remove photo',photoAlt:'Selected photo',uploading:'Uploading photo',rights:'I own these photos or have permission to share them.',rightsRequired:'Confirm you have the right to share these photos.',tooMany:'You can add up to 6 photos.',invalidType:'Choose a JPG, PNG, WebP, HEIC, or HEIF image.',unreadable:"We couldn't read this photo. Choose another photo or export it as JPG and try again.",tooLarge:"We couldn't process this photo within the 10 MB limit. Please choose a smaller photo.",destinations:'Where should it appear?',destinationHint:'Choose up to 3 places.',main:'Main feed',mainDesc:'Everyone on NEXORA',joined:'Joined groups',none:'No groups available for this kind of post yet.',count:'{count}/3 places selected · Each person sees the post only once, even across groups',destinationRequired:'Choose at least one place for your post.',saveDraft:'Save draft',draftSaved:'Draft saved.',draftError:'We could not save your draft. Your information is still here, please try again.',drafts:'My drafts',empty:'You have no drafts.',draft:'Draft',edit:'Edit',publish:'Post',remove:'Delete',close:'Close',deleteConfirm:"Delete this post? This can't be undone."},
    vi:{photos:'Ảnh (tối đa 6)',add:'Thêm ảnh',removePhoto:'Xoá ảnh',photoAlt:'Ảnh đã chọn',uploading:'Đang tải ảnh lên',rights:'Tôi là chủ của những ảnh này hoặc đã được phép chia sẻ.',rightsRequired:'Hãy xác nhận bạn có quyền chia sẻ những ảnh này.',tooMany:'Bạn chỉ thêm được tối đa 6 ảnh.',invalidType:'Chỉ hỗ trợ ảnh JPG, PNG, WebP, HEIC hoặc HEIF.',unreadable:'Không đọc được ảnh này. Vui lòng chọn ảnh khác hoặc xuất ảnh sang JPG rồi thử lại.',tooLarge:'Không thể xử lý ảnh trong giới hạn 10 MB. Vui lòng chọn ảnh nhỏ hơn.',destinations:'Bài sẽ hiện ở đâu?',destinationHint:'Chọn tối đa 3 nơi.',main:'Bảng tin chung',mainDesc:'Mọi thành viên NEXORA',joined:'Nhóm đã tham gia',none:'Chưa có nhóm phù hợp với loại bài này.',count:'Đã chọn {count}/3 nơi · Mỗi người chỉ thấy bài 1 lần dù ở nhiều nhóm',destinationRequired:'Chọn ít nhất một nơi để đăng bài.',saveDraft:'Lưu nháp',draftSaved:'Đã lưu bản nháp.',draftError:'Chưa thể lưu bản nháp. Thông tin vẫn được giữ nguyên, vui lòng thử lại.',drafts:'Bản nháp của tôi',empty:'Bạn chưa có bản nháp nào.',draft:'Nháp',edit:'Sửa',publish:'Đăng',remove:'Xoá',close:'Đóng',deleteConfirm:'Xoá bài này? Không thể hoàn tác.'}
  };
  const ICONS={
    globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 21a8 8 0 0 0-16 0M22 20a8 8 0 0 0-4-6.93M16 3.13a5 5 0 0 1 0 9.74"/><circle cx="10" cy="8" r="5"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
    plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };
  const clone=value=>JSON.parse(JSON.stringify(value));
  const makeId=()=> 'feed-'+(window.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));
  function safePhoto(value){
    if(typeof value!=='string')return '';
    if(/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z\d+/=]+$/i.test(value))return value;
    if(window.NEXORA_COMMUNITY_DEMO?.mediaURL)return window.NEXORA_COMMUNITY_DEMO.mediaURL(value);
    try{const url=new URL(value,location.href);return url.origin===location.origin&&/\.(?:jpe?g|png|webp|gif)$/i.test(url.pathname)?url.href:'';}catch{return '';}
  }
  function photosOf(item){return [...new Set((Array.isArray(item?.photos)?item.photos:Array.isArray(item?.imageUrls)?item.imageUrls:item?.photo?[item.photo]:[]).map(safePhoto).filter(Boolean))].slice(0,MAX_PHOTOS);}
  function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('unreadable'));reader.readAsDataURL(file);});}
  async function optimizePhoto(file){
    if(!/^(?:image\/(?:jpeg|png|webp|heic|heif))$/i.test(file.type)&&!(file.type===''&&/\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name)))throw new Error('invalidType');
    if(file.size>20*1024*1024)throw new Error('tooLarge');
    const url=await readFile(file);
    const image=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('unreadable'));image.src=url;});
    if(!image.naturalWidth||!image.naturalHeight)throw new Error('unreadable');
    let scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight)),quality=.82;
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('unreadable');
    for(let attempt=0;attempt<9;attempt++){
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      const result=canvas.toDataURL('image/jpeg',quality);
      if(result.startsWith('data:image/jpeg;base64,')&&result.length<=MAX_STORED_IMAGE)return result;
      scale*=.8;quality=Math.max(.5,quality-.07);
    }
    throw new Error('tooLarge');
  }
  function mount(adapter){
    const states=new WeakMap(),activeStates=new Set(),draftTargets=new Set();
    const member=String(adapter.currentMember||'');
    const esc=adapter.escape|| (value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])));
    let pendingItem=null;
    const copy=()=>COPY[document.documentElement.lang==='vi'?'vi':'en'];
    const joinedGroups=()=>{
      const groups=adapter.getJoinedGroups?adapter.getJoinedGroups():(adapter.getGroups?.()||[]).filter(group=>group.isMember===true||group.joined===true||group.owner===member);
      return groups.filter(group=>group&&typeof group.id==='string');
    };
    function destinationsOf(item){const value=item?.destinations;return {includeMainFeed:value?.includeMainFeed!==false,groupIds:[...new Set(Array.isArray(value?.groupIds)?value.groupIds:[])].filter(id=>joinedGroups().some(group=>group.id===id)).slice(0,value?.includeMainFeed===false?MAX_DESTINATIONS:MAX_DESTINATIONS-1)};}
    function readDrafts(){try{const rows=JSON.parse(localStorage.getItem(DRAFT_KEY)||'[]');return Array.isArray(rows)?rows.filter(row=>row&&typeof row.id==='string'&&typeof row.owner==='string'&&KINDS.has(row.kind)):[];}catch{return [];}}
    const listDrafts=()=>clone(readDrafts().filter(row=>row.owner===member).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))));
    function writeDrafts(rows){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(rows));return true;}catch{return false;}}
    function error(state,key){state.error=key;const target=state.form.querySelector('[data-composer-error]');if(target){target.textContent=copy()[key]||copy().unreadable;target.hidden=false;}if(key==='rightsRequired')state.form.querySelector('[data-composer-rights]')?.focus();if(key==='destinationRequired')state.form.querySelector('[data-composer-main]')?.focus();return null;}
    function clearError(state){state.error='';const target=state.form.querySelector('[data-composer-error]');if(target){target.textContent='';target.hidden=true;}}
    function renderPhotos(state){
      const c=copy(),target=state.form.querySelector('[data-composer-photos]');
      target.innerHTML=state.photos.map((photo,index)=>`<li data-composer-photo><img src="${esc(photo)}" alt="${esc(c.photoAlt)}" width="88" height="88"><button type="button" data-composer-remove-photo="${index}" aria-label="${esc(c.removePhoto)}" ${state.busy?'disabled':''}>×</button></li>`).join('')+(state.photos.length<MAX_PHOTOS?`<li><button type="button" class="composer-photo-add" data-composer-add-photo aria-label="${esc(c.add)}" ${state.busy?'disabled':''}>${ICONS.plus}<span>${esc(c.add)}</span></button></li>`:'');
      const rights=state.form.querySelector('[data-composer-rights-row]');rights.hidden=!state.photos.length;
      const checkbox=state.form.querySelector('[data-composer-rights]');checkbox.checked=state.rights;checkbox.disabled=state.busy;
      state.form.querySelector('[data-composer-uploading]').hidden=!state.busy;
      state.form.querySelector('[data-composer-file]').disabled=state.busy||state.photos.length>=MAX_PHOTOS;
    }
    function renderDestinations(state){
      if(state.photoOnly)return;
      const c=copy(),selected=state.destinations,count=Number(selected.includeMainFeed)+selected.groupIds.length,atLimit=count>=MAX_DESTINATIONS;
      const option=(id,title,detail,chosen,isMain=false)=>`<button type="button" class="composer-destination${chosen?' is-selected':''}" ${isMain?'data-composer-main':`data-composer-group="${esc(id)}"`} aria-pressed="${chosen}" ${!chosen&&atLimit?'disabled':''}><span aria-hidden="true" class="composer-destination-icon">${isMain?ICONS.globe:ICONS.users}</span><span><strong data-community-authored>${esc(title)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</span><span class="composer-check" aria-hidden="true">${chosen?ICONS.check:''}</span></button>`;
      const groups=joinedGroups();
      state.form.querySelector('[data-composer-destinations]').innerHTML=option('',c.main,c.mainDesc,selected.includeMainFeed,true)+`<h4>${esc(c.joined)}</h4>`+(groups.length?groups.map(group=>option(group.id,group.title||group.name||group.id,group.region||'',selected.groupIds.includes(group.id))).join(''):`<p class="helper">${esc(c.none)}</p>`)+`<p class="helper composer-destination-count" aria-live="polite">${esc(c.count.replace('{count}',String(count)))}</p>`;
    }
    function renderChrome(state){
      const c=copy();
      state.section.innerHTML=`<section class="composer-photos-section" aria-label="${esc(c.photos)}"><h3>${esc(c.photos)}</h3><ul class="composer-photos" data-composer-photos></ul><input type="file" data-composer-file class="composer-file-input" accept="${ACCEPT}" multiple tabindex="-1" aria-label="${esc(c.add)}"><p class="helper" data-composer-uploading role="status" hidden>${esc(c.uploading)}</p><label class="composer-rights" data-composer-rights-row hidden><input type="checkbox" data-composer-rights><span>${esc(c.rights)}</span></label></section>${state.photoOnly?'':`<section class="composer-destinations-section" aria-label="${esc(c.destinations)}"><h3>${esc(c.destinations)}</h3><p class="helper">${esc(c.destinationHint)}</p><div class="composer-destinations" data-composer-destinations></div></section>`}<p class="composer-error" data-composer-error role="alert" hidden></p>`;
      state.draftButton.textContent=c.saveDraft;renderPhotos(state);renderDestinations(state);if(state.error)error(state,state.error);
    }
    function setBusy(state,busy){
      if(state.busy===busy)return;
      const submit=state.form.querySelector('[type="submit"]');
      if(busy){state.submitWasDisabled=submit?.disabled;}state.busy=busy;
      if(submit)submit.disabled=busy||Boolean(state.submitWasDisabled);
      state.draftButton.disabled=busy;renderPhotos(state);
    }
    function enhanceForm(form,item,options={}){
      const photoOnly=options.photoOnly===true;
      if(!form||(!photoOnly&&!KINDS.has(form.dataset.kind)))return false;
      if(states.has(form))return true;
      item=item&&Object.keys(item).length?item:(pendingItem||{});pendingItem=null;
      const section=document.createElement('div');section.className='feed-composer-extras';section.setAttribute('data-feed-composer','');
      const originalPhoto=form.querySelector('input[type="file"][name="photo"]');
      if(originalPhoto){originalPhoto.disabled=true;const group=originalPhoto.closest('.form-group')||originalPhoto.parentElement;group.hidden=true;group.classList.add('composer-legacy-photo');}
      const body=form.querySelector('.dialog-body')||form;body.append(section);
      const draftButton=document.createElement('button');draftButton.type='button';draftButton.className='btn composer-save-draft';draftButton.setAttribute('data-composer-save-draft','');draftButton.setAttribute('data-feed-composer','');
      const footer=form.querySelector('.dialog-footer')||form;if(!photoOnly)footer.insertBefore(draftButton,footer.querySelector('[type="submit"]'));
      // Published edits are saved by the existing post editor. Draft saving never changes the live post.
      const published=Boolean(item.id&&(photoOnly||(adapter.getFeed?.()||[]).some(row=>row.id===item.id)));
      draftButton.hidden=published||photoOnly;
      const state={form,section,draftButton,photoOnly,item:clone(item),id:item.id||makeId(),draftId:!photoOnly&&item.draft===true?item.id:null,editingId:published?item.id:null,photos:photosOf(item),destinations:photoOnly?null:destinationsOf(item),rights:Boolean(item.imageRightsConfirmed||published),busy:false,cancelled:false,pending:Promise.resolve(),error:''};
      states.set(form,state);activeStates.add(state);renderChrome(state);
      section.addEventListener('click',event=>{
        const add=event.target.closest('[data-composer-add-photo]');if(add){section.querySelector('[data-composer-file]').click();return;}
        const remove=event.target.closest('[data-composer-remove-photo]');if(remove&&!state.busy){const index=Number(remove.dataset.composerRemovePhoto);state.photos.splice(index,1);clearError(state);renderPhotos(state);(section.querySelector('[data-composer-remove-photo="'+Math.min(index,state.photos.length-1)+'"]')||section.querySelector('[data-composer-add-photo]'))?.focus({preventScroll:true});return;}
        const main=event.target.closest('[data-composer-main]'),group=event.target.closest('[data-composer-group]');if(!main&&!group)return;
        const count=Number(state.destinations.includeMainFeed)+state.destinations.groupIds.length;
        if(main){if(state.destinations.includeMainFeed||count<MAX_DESTINATIONS)state.destinations.includeMainFeed=!state.destinations.includeMainFeed;}
        else{const id=group.dataset.composerGroup;if(state.destinations.groupIds.includes(id))state.destinations.groupIds=state.destinations.groupIds.filter(value=>value!==id);else if(count<MAX_DESTINATIONS)state.destinations.groupIds.push(id);}
        clearError(state);renderDestinations(state);(main?section.querySelector('[data-composer-main]'):[...section.querySelectorAll('[data-composer-group]')].find(button=>button.dataset.composerGroup===group.dataset.composerGroup))?.focus({preventScroll:true});
      });
      section.addEventListener('change',event=>{
        if(event.target.matches('[data-composer-rights]')){state.rights=event.target.checked;clearError(state);return;}
        if(!event.target.matches('[data-composer-file]')||state.busy)return;
        const files=[...event.target.files],available=MAX_PHOTOS-state.photos.length;event.target.value='';if(!files.length)return;
        clearError(state);if(files.length>available)error(state,'tooMany');setBusy(state,true);
        state.pending=(async()=>{for(const file of files.slice(0,available)){if(state.cancelled||!form.isConnected)break;try{const photo=await optimizePhoto(file);if(state.cancelled||!form.isConnected)break;state.photos.push(photo);}catch(ex){if(form.isConnected&&!state.cancelled)error(state,COPY.en[ex.message]?ex.message:'unreadable');}}})().finally(()=>{setBusy(state,false);});
      });
      form.addEventListener('click',event=>{if(event.target.closest('#cancelModal,[data-composer-dismiss]'))state.cancelled=true;});
      draftButton.addEventListener('click',()=>{void saveDraft(form);});
      return true;
    }
    async function collect(form,options={}){
      const state=states.get(form);if(!state)return null;
      await state.pending;if(state.cancelled||!form.isConnected)return null;
      clearError(state);
      // Membership may have changed in another tab while this form was open.
      if(!state.photoOnly){const joined=new Set(joinedGroups().map(group=>group.id));state.destinations.groupIds=state.destinations.groupIds.filter(id=>joined.has(id));}
      if(!options.draft){
        if(!state.photoOnly&&!state.destinations.includeMainFeed&&!state.destinations.groupIds.length)return error(state,'destinationRequired');
        if(state.photos.length&&!state.rights)return error(state,'rightsRequired');
      }
      return {id:state.id,photos:[...state.photos],...(!state.photoOnly?{destinations:clone(state.destinations)}:{}),imageRightsConfirmed:state.rights,draftId:state.draftId,editingId:state.editingId};
    }
    async function saveDraft(form){
      const state=states.get(form);if(!state||state.editingId||state.photoOnly)return false;
      const collected=await collect(form,{draft:true});if(!collected)return false;
      const values={};for(const [key,value]of new FormData(form).entries())if(typeof value==='string')values[key]=value;
      const now=new Date().toISOString(),draft={...state.item,...values,id:state.id,kind:form.dataset.kind,owner:member,draft:true,photos:collected.photos,photo:collected.photos[0]||'',destinations:collected.destinations,imageRightsConfirmed:collected.imageRightsConfirmed,createdAt:state.item.createdAt||now,updatedAt:now};
      const rows=readDrafts(),index=rows.findIndex(row=>row.id===draft.id&&row.owner===member);if(index>=0)rows[index]=draft;else rows.unshift(draft);
      if(!writeDrafts(rows)){error(state,'draftError');return false;}
      state.draftId=draft.id;refreshDraftTargets();adapter.closeDialog?.();adapter.render?.();adapter.toast?.(copy().draftSaved);return true;
    }
    function removeDraft(id){
      const rows=readDrafts();if(!rows.some(row=>row.id===id&&row.owner===member))return false;
      if(!writeDrafts(rows.filter(row=>row.id!==id||row.owner!==member))){adapter.toast?.(copy().draftError);return false;}
      refreshDraftTargets();return true;
    }
    function complete(form){const state=states.get(form);if(!state)return false;state.cancelled=true;return state.draftId?removeDraft(state.draftId):true;}
    function openDraft(id,publish=false){
      const draft=listDrafts().find(row=>row.id===id);if(!draft)return false;
      pendingItem=draft;const opened=adapter.openTemplate(draft.kind,draft);const form=opened?.matches?.('form')?opened:document.getElementById('templateForm');
      if(!form){pendingItem=null;return false;}enhanceForm(form,draft);pendingItem=null;
      if(publish){if(form.reportValidity())form.requestSubmit();}return true;
    }
    function renderDrafts(target){
      if(typeof target==='string')target=document.querySelector(target);if(!target)return;
      draftTargets.add(target);target.setAttribute('data-feed-drafts','');const c=copy(),drafts=listDrafts();
      target.innerHTML=drafts.length?drafts.map(draft=>`<article class="panel composer-draft-card"><span class="kind want">${esc(c.draft)}</span><h3 data-community-authored>${esc(draft.title||draft.description||draft.details||draft.steps||c.draft)}</h3><p data-community-authored>${esc(draft.description||draft.details||draft.steps||'')}</p>${photosOf(draft).length?`<div class="composer-draft-photos">${photosOf(draft).map(photo=>`<img src="${esc(photo)}" alt="${esc(c.photoAlt)}" width="64" height="64">`).join('')}</div>`:''}<div class="composer-draft-actions"><button type="button" class="btn small" data-composer-edit-draft="${esc(draft.id)}">${esc(c.edit)}</button><button type="button" class="btn primary small" data-composer-publish-draft="${esc(draft.id)}">${esc(c.publish)}</button><button type="button" class="btn danger small" data-composer-remove-draft="${esc(draft.id)}">${esc(c.remove)}</button></div></article>`).join(''):`<p class="quiet">${esc(c.empty)}</p>`;
      if(target.dataset.composerBound)return;target.dataset.composerBound='true';
      target.addEventListener('click',event=>{const edit=event.target.closest('[data-composer-edit-draft]'),publish=event.target.closest('[data-composer-publish-draft]'),remove=event.target.closest('[data-composer-remove-draft]');if(edit)openDraft(edit.dataset.composerEditDraft);else if(publish)openDraft(publish.dataset.composerPublishDraft,true);else if(remove&&window.confirm(copy().deleteConfirm)){if(removeDraft(remove.dataset.composerRemoveDraft))adapter.render?.();}});
    }
    function releaseDrafts(target){if(typeof target==='string')target=document.querySelector(target);if(!target)return;draftTargets.delete(target);target.removeAttribute('data-feed-drafts');}
    function refreshDraftTargets(){for(const target of draftTargets){if(!target.isConnected){draftTargets.delete(target);continue;}renderDrafts(target);}}
    function openDrafts(){const c=copy();adapter.openDialog?.(`<div class="overlay" id="overlay"><section class="dialog composer-drafts-dialog" data-feed-composer role="dialog" aria-modal="true" aria-labelledby="composerDraftsTitle"><div class="dialog-head"><h2 id="composerDraftsTitle">${esc(c.drafts)}</h2><button type="button" class="icon-btn" id="closeModal" data-composer-close-icon aria-label="${esc(c.close)}">×</button></div><div class="dialog-body" data-composer-draft-list></div><div class="dialog-footer"><button type="button" class="btn" id="cancelModal" data-composer-close>${esc(c.close)}</button></div></section></div>`);renderDrafts(document.querySelector('[data-composer-draft-list]'));}
    function refreshLanguage(){for(const state of activeStates){if(!state.form.isConnected){activeStates.delete(state);continue;}renderChrome(state);}refreshDraftTargets();const title=document.getElementById('composerDraftsTitle');if(title)title.textContent=copy().drafts;document.querySelectorAll('[data-composer-close]').forEach(button=>{button.textContent=copy().close;});document.querySelectorAll('[data-composer-close-icon]').forEach(button=>button.setAttribute('aria-label',copy().close));}
    function scopeMatches(item,scope){if(item?.draft)return false;const destinations=item?.destinations;if(scope==='joined'){const ids=new Set(joinedGroups().map(group=>group.id));return Array.isArray(destinations?.groupIds)&&destinations.groupIds.some(id=>ids.has(id));}return destinations?.includeMainFeed!==false;}
    window.addEventListener('message',event=>{if(event.source===window.parent&&(location.protocol==='file:'||event.origin===location.origin)&&event.data?.type==='nexora-language'){document.documentElement.lang=event.data.language==='vi'?'vi':'en';refreshLanguage();}});
    window.addEventListener('storage',event=>{if(event.key===DRAFT_KEY)refreshDraftTargets();if(event.key==='nexora-community-language'){document.documentElement.lang=event.newValue==='vi'?'vi':'en';refreshLanguage();}});
    return {enhanceForm,enhancePhotos:(form,item)=>enhanceForm(form,item,{photoOnly:true}),collect,complete,saveDraft,listDrafts,removeDraft,openDraft,renderDrafts,releaseDrafts,openDrafts,refreshLanguage,scopeMatches,photosOf};
  }
  window.NEXORA_COMMUNITY_FEED_COMPOSER={mount};
})();
