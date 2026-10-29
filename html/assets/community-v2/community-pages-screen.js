/* Page view and editing share the existing forms and data, on their own URLs. */
(() => {
  'use strict';
  const api=window.NEXORA_COMMUNITY_PAGES;
  if(!api)return;
  const query=new URLSearchParams(location.search);
  const origin=location.protocol==='file:'?'*':location.origin;
  let activeId=query.get('pageId')||'';
  const scope=()=>api.getScope();
  function send(data){
    if(window.parent!==window)window.parent.postMessage(data,origin);
    else{
      const url=new URL(location.href);url.searchParams.set('view','pages');
      if(data.type!=='nexora-community-page-state')for(const key of ['post','postId','comment','commentId','thread','threadId','groupId','jobsTab','jobId','profileRequired','shiftTab','shiftId','assignmentId','settlementId','invitationId'])url.searchParams.delete(key);
      for(const key of ['pageId','pageMode','pageTab','pageScope']){if(data[key])url.searchParams.set(key,data[key]);else url.searchParams.delete(key);}
      if(data.type==='nexora-community-page-state')history.replaceState(history.state,'',url);
      else if(data.replace)location.replace(url);else location.assign(url);
    }
  }
  function navigate(id='',mode='view',replace=false,tab='posts'){send({type:'nexora-community-page-navigate',pageId:id,pageMode:id?mode:'',pageTab:id&&mode==='view'?tab:'',pageScope:scope(),replace});}
  function mount(page,mode='view',tab='posts'){
    if(!activeId||String(page.id)!==activeId)return null;
    const modal=document.getElementById('modalRoot'),panel=modal.querySelector('.dialog');
    if(!panel)return null;
    let screen=document.getElementById('communityPageScreen');
    if(!screen){screen=document.createElement('section');screen.id='communityPageScreen';document.getElementById('pagesView').append(screen);}
    document.body.classList.add('community-page-screen');
    panel.classList.remove('dialog');panel.classList.add('page-screen-panel');
    panel.setAttribute('role','region');panel.removeAttribute('aria-modal');
    const close=panel.querySelector('#closeModal');
    if(close){close.removeAttribute('id');close.removeAttribute('aria-label');close.className='btn small';close.textContent=mode==='edit'?'← Quay lại Fanpage':'← Quay lại danh sách Fanpage';close.dataset.pageScreenBack=mode==='edit'?'view':'list';}
    const footer=panel.querySelector('#cancelModal');
    if(footer){if(mode==='view')footer.closest('.dialog-footer').remove();else{footer.removeAttribute('id');footer.dataset.pageScreenBack='list';}}
    screen.replaceChildren(panel);modal.replaceChildren();
    send({type:'nexora-community-page-state',pageId:activeId,pageMode:mode,pageTab:mode==='view'?tab:'',pageScope:scope()});
    return screen;
  }
  window.NEXORA_COMMUNITY_PAGE_SCREEN={mount,navigate,isActive:id=>String(id)===activeId};
  document.addEventListener('click',event=>{
    const view=event.target.closest('[data-open-page]'),edit=event.target.closest('[data-edit-page]'),back=event.target.closest('[data-page-screen-back]'),returnToPage=activeId&&event.target.closest('[data-back-page]');
    if(!view&&!edit&&!back&&!returnToPage)return;
    if(back||returnToPage){event.preventDefault();event.stopImmediatePropagation();navigate(back?.dataset.pageScreenBack==='list'?'':activeId);return;}
    const id=view?.dataset.openPage||edit?.dataset.editPage,page=api.getPage(id);
    if(!page||(edit&&page.owner!==api.member))return;
    event.preventDefault();event.stopImmediatePropagation();navigate(String(id),edit?'edit':'view');
  },true);
  window.addEventListener('message',event=>{
    if(event.source!==window.parent||(location.protocol!=='file:'&&event.origin!==location.origin))return;
    if(event.data?.type==='nexora-page-screen-deactivate'||event.data?.type==='nexora-open-view'&&event.data.view!=='pages'){
      activeId='';document.body.classList.remove('community-page-screen');document.getElementById('communityPageScreen')?.remove();
    }
  });
  if(activeId){
    const page=api.getPage(activeId);
    if(!page){navigate('','view',true);return;}
    if(query.get('pageMode')==='edit'&&page.owner===api.member)api.edit(page);
    else api.open(page,query.get('pageTab')||'posts');
  }
})();
