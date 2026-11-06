/* PO Real Estate uses the Community account and persists only user-created listings. */
(() => {
  const shared=window.NEXORA_COMMUNITY_SHARED, key='nexora-v3:realestate-records';
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(LISTINGS));return true;}catch{toast(lang==='en'?'Something went wrong. Please try again.':'Đã có lỗi xảy ra. Vui lòng thử lại.');return false;}};
  const originalSubmit=submitPost;
  submitPost=async function(){
    const files=[...document.getElementById('pfPhotos').files],before=LISTINGS.length;
    originalSubmit();if(LISTINGS.length===before)return;
    const row=LISTINGS[0];row.title=document.getElementById('pfTitle').value.trim();row.owner=shared.member;row.nxId=shared.me().id;row.createdAt=new Date().toISOString();row.contactMode=document.getElementById('pfContact').value;
    row.photos=[];
    try{for(const file of files.slice(0,20)){const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});row.photos.push(data);}if(row.photos.length)row.img=row.photos[0];if(persist())shared.notify(lang==='en'?'Your listing is live':'Tin đã đăng','realestate',{listingId:row.id});}
    catch{toast(lang==='en'?'Could not read photo.':'Không đọc được hình.');}
    render();renderAI();
  };
  const originalReport=reportListing;
  reportListing=function(id){originalReport(id);persist();};
  contactAction=function(type,id){const row=LISTINGS.find(item=>item.id===id);if(!row)return;parent.postMessage({type:'nexora-community-contact',contact:{recipient:row.owner||row.poster,reference:row.title||typeName(row.type)+' — '+row.area,sourceId:'realestate:'+row.id}},location.origin);};
  const originalFavorite=toggleFav;
  toggleFav=function(id){originalFavorite(id);try{localStorage.setItem('nexora-v3:realestate-favorites:'+shared.me().id,JSON.stringify(favs));}catch{}};
  try{favs=JSON.parse(localStorage.getItem('nexora-v3:realestate-favorites:'+shared.me().id)||'{}');}catch{}
  document.addEventListener('click',event=>{const target=event.target.closest('[data-act]');if(!target)return;if(['openSalon','openSalonForm'].includes(target.dataset.act)){event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'nexora-community-route',route:'transfer'},location.origin);}if(['openJob','openJobForm','openTechForm'].includes(target.dataset.act)){event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'nexora-community-route',route:'jobs'},location.origin);}},true);
  const postButton=document.querySelector('header [data-act="openPost"]');if(postButton)document.querySelector('.hero-notes').after(postButton);
  const originalOpenAssistant=openAssist;openAssist=function(){const panel=document.getElementById('assistant');if(panel)panel.hidden=false;originalOpenAssistant();};
  document.querySelector('.site-header')?.setAttribute('hidden','');
  for(const element of document.querySelectorAll('.assistant,.assist-fab,.assist-bubble,#assistant,#assistBubble,#assistPanel,#assistLauncher,#assistPicker'))element.hidden=true;
  window.NEXORA_COMMUNITY_MODULE={setLanguage(value){setLang(value==='vi'?'vi':'en');const state=document.querySelector('#qState option[value=""]');if(state)state.textContent=value==='vi'?'Tất cả tiểu bang':'All states';},navigate(route,context={}){render();if(context.listingId&&LISTINGS.some(row=>String(row.id)===String(context.listingId)))openDetail(Number(context.listingId));},open(id){if(LISTINGS.some(row=>String(row.id)===String(id)))openDetail(Number(id));}};
  window.NEXORA_COMMUNITY_MODULE.setLanguage(localStorage.getItem('nexora-v3:nexora-community-language')||'en');
})();
