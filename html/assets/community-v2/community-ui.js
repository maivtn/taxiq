/* Shared interaction and icon finishing for the existing Community screens. */
(() => {
  'use strict';
  const assetBase = new URL('../icon-oneqr/', document.currentScript.src);
  const feedAssetBase = new URL('feed-icons/', document.currentScript.src);
  const feedArtwork = {
    'feed-photo':'picture-2659360.png',
    'feed-sale':'flash-sale-15106141.png', 'feed-job':'we-are-hiring-14752911.png',
    'feed-poll':'vote-8121705.png', 'feed-tip':'mode-8484254.png',
    'feed-ask':'speech-bubble-5726734.png',
    'feed-event':'event-18669653.png', 'feed-blog':'blog-1352524.png'
  };
  const artwork = {
    feed:'layout-list', market:'users-round', groups:'users-round', pages:'building-2',
    deals:'ticket', jobs:'briefcase', daywork:'calendar-days', blog:'feed-blog', connect:'message-circle',
    general:'paintbrush', showcase:'feed-photo', tip:'feed-tip', question:'feed-ask', poll:'feed-poll',
    event:'feed-event', sale:'feed-sale', want:'shopping-bag', hiring:'feed-job', seeking:'user-round',
    dayhire:'calendar-clock', page:'building-2', group:'users-round', messages:'message-circle', calls:'phone', privacy:'settings-2'
  };
  function makeArtwork(name,nav=false) {
    const image=document.createElement('img');
    image.className='community-nav-art';
    image.src=nav?new URL(name+(name==='feed'?'.webp':'.svg'),navBase).href:feedArtwork[name]?new URL(feedArtwork[name],feedAssetBase).href:new URL('issue-2040-oneqr-'+name+'-3d.png',assetBase).href;
    image.alt='';image.setAttribute('aria-hidden','true');image.draggable=false;
    image.width=image.height=28;
    return image;
  }
  const navArtwork={feed:'feed',market:'groups',groups:'groups',pages:'pages',deals:'deals',jobs:'jobs',daywork:'calendar',blog:'blog',connect:'messages',messages:'messages',calls:'calls',privacy:'settings'};
  const navBase=new URL('nav-icons/',document.currentScript.src);
  function decorateArtwork() {
    document.querySelectorAll('.tab[data-view],.page-tabs .tab[data-section]').forEach(button=>{
      const name=navArtwork[button.dataset.view||button.dataset.section];
      if(!name||button.querySelector('.community-nav-art'))return;
      const previous=button.querySelector('svg');
      if(previous)previous.replaceWith(makeArtwork(name,true));
    });
    document.querySelectorAll('.feed-action,.template-card').forEach(button=>{
      const key=button.dataset.template||button.dataset.marketKind||(button.hasAttribute('data-blog-create')?'blog':'');
      const holder=button.querySelector('.feed-icon');
      if(button.closest('#jobTemplates')&&holder){
        const name=key==='hiring'?'Briefcase':'UserRoundSearch',definition=window.lucide?.icons[name]||window.lucide?.icons.UserRound;
        if(definition&&holder.dataset.jobLucide!==key){holder.replaceChildren(window.lucide.createElement(definition,{width:18,height:18,class:'community-action-icon','aria-hidden':'true',focusable:'false'}));holder.dataset.jobLucide=key;}
        return;
      }
      if(holder&&artwork[key]&&!holder.querySelector('.community-nav-art')){
        holder.replaceChildren(makeArtwork(artwork[key]));
        if(feedArtwork[artwork[key]])holder.dataset.customArtwork=key;
      }
    });
  }
  const buttonIcons=[
    ['#marketFilterToggle,#dealFilterToggle,.community-toolbar-filter-toggle,.community-group-filter-toggle','SlidersHorizontal'],
    ['.community-context-action[data-view="daywork"]','CalendarClock'],
    ['.community-context-action[data-view="jobs"]','Briefcase'],
    ['.market-info-toggle','Info'],
    ['.community-context-action[data-template="deal"],.community-context-action[data-template="page"],.community-market-create>summary','Plus'],
    ['.subtab[data-view="groups"],.feed-group-shortcut','UsersRound'],
    ['.subtab[data-view="market"]','Store'],
    ['#createBtn,#createSale,#createWant,#emptyCreate,#emptyCreatePage,#createPage,[data-template="page"],[data-template="group"]','Plus'],
    ['#create,#createBlog,[data-blog-create]','SquarePen'],
    ['#compactProfileToggle','QrCode'],
    ['#viewerUseDeviceLocation,[data-use-location],#viewerLocationLabel','MapPin'],
    ['#viewerLocationSave','Check'],
    ['[data-job-contact],[data-shift-contact],[data-page-message],[data-action="contact"]','MessageCircle'],
    ['[data-open-blog]','BookOpen'],
    ['[data-open-page],[data-group-detail],[data-open-market],[data-open-job],[data-open-shift]','ArrowRight'],
    ['[data-edit-blog],[data-edit-page],[data-action="edit"]','SquarePen'],
    ['[data-share-page],[data-share-invite],#shareProfileBtn','Share2'],
    ['[data-deal-code],[data-copy-invite],#copyProfileBtn','Copy'],
    ['[data-page-deal]','Ticket'],
    ['[data-promote-page],[data-confirm-promotion]','Megaphone'],
    ['[data-page-compose]','SquarePen'],
    ['[data-page-dashboard]','LayoutDashboard'],
    ['[data-extra-action="resolve"]','CircleCheck'],
    ['[data-extra-action="interest"]','CalendarCheck'],
    ['a.btn[href^="tel:"]','Phone'],
    ['[data-change-page-cover],.page-avatar-edit','Camera'],
    ['[data-publish-page-now]','Send'],
    ['[data-save-post-schedule]','CalendarClock'],
    ['[data-back-page],[data-back],[data-community-back],#backToCommunityBtn','ArrowLeft'],
    ['#closeModal,#cancelModal:not([data-community-back]),#closeCallPreview,#cancelCreateGroup,.close','X'],
    ['[data-remove-blog-cover],[data-remove-cover],.call-delete','Trash2'],
    ['[data-action="close"],[data-extra-action="closeJob"],[data-extra-action="closeShift"]','Check'],
    ['[data-social-action="contact-seller"],[data-jobs-action="job-chat"],[data-jobs-action="application-chat"],[data-jobs-action="applicant-chat"]','MessageCircle'],
    ['#jobsToggleFilters','SlidersHorizontal'],
    ['[data-jobs-action="detail"],[data-jobs-action="view-application"]','FileText'],
    ['[data-jobs-action="save"]','Bookmark'],
    ['[data-jobs-action="candidate"],[data-jobs-action="applicant-profile"]','UserRound'],
    ['[data-jobs-action="apply"]','Send'],
    ['[data-jobs-action="applicants"]','UsersRound'],
    ['[data-jobs-action="edit"]','SquarePen'],
    ['[data-jobs-action="close-post"]','CircleCheck'],
    ['[data-jobs-action="invite-applicant"],[data-jobs-action="invite-seeking"]','CalendarPlus'],
    ['[data-community-group-action="detail"]','Eye'],
    ['[data-social-action="mark-sold"]','CircleCheck'],
    ['#newMessageBtn','SquarePen'],
    ['#createGroupBtn,#confirmCreateGroup','UsersRound'],
    ['[data-connect-action="history-call"][data-connect-call-type="voice"]','Phone'],
    ['[data-connect-action="history-call"][data-connect-call-type="video"]','Video'],
    ['#templateForm[data-kind="page"] button[type="submit"]','Plus'],
    ['#listingForm[data-community-editing="true"] button[type="submit"],#blogForm[data-community-editing="true"] button[type="submit"]','Save'],
    ['#templateForm button[type="submit"],#listingForm button[type="submit"],#blogForm button[type="submit"]','Send'],
    ['[data-accept-request],[data-request-action="accepted"]','MessageCircle'],
    ['[data-ignore-request],[data-request-action="ignored"],[data-chat-cancel]','X'],
    ['[data-block-request],[data-request-action="blocked"]','Ban'],
    ['[data-save-reply],[data-chat-save-nickname]','Save'],
    ['[data-chat-confirm-delete]','Trash2'],
    ['[data-chat-confirm-report]','Flag'],
    ['#pageEditForm button[type="submit"]','Save'],
    ['#feedMore','ChevronDown']
  ];
  function addButtonIcon(button,name) {
    if(button.classList.contains('template-card'))return;
    for(const node of button.childNodes){
      if(node.nodeType===Node.TEXT_NODE){const text=node.nodeValue.replace(/^\s*[＋⌖✦✎▣←☎×✓★☆]\s*/u,'');if(text!==node.nodeValue)node.nodeValue=text;}
    }
    if(button.querySelector('svg,img')||!window.lucide?.icons[name])return;
    const icon=window.lucide.createElement(window.lucide.icons[name],{width:18,height:18,class:'community-action-icon','aria-hidden':'true',focusable:'false'});
    button.prepend(icon);
    if(!button.classList.contains('community-has-icon'))button.classList.add('community-has-icon');
  }
  function decorateButtons() {
    if(!window.lucide)return;
    for(const [selector,name] of buttonIcons)document.querySelectorAll(selector).forEach(button=>addButtonIcon(button,name));
    document.querySelectorAll('[data-community-group-action="membership"]').forEach(button=>addButtonIcon(button,button.getAttribute('aria-pressed')==='true'?'UserMinus':'UserPlus'));
    document.querySelectorAll('[data-follow-page]').forEach(button=>addButtonIcon(button,button.getAttribute('aria-pressed')==='true'?'UserCheck':'UserPlus'));
    document.querySelectorAll('[data-page-primary]').forEach(button=>addButtonIcon(button,button.dataset.communityPrimary==='booking'?'CalendarDays':'MessageCircle'));
    const publish=document.getElementById('pagePostSubmit');
    if(publish)addButtonIcon(publish,document.getElementById('pagePostMode')?.value==='schedule'?'CalendarClock':'Send');
  }

  // Match the existing POS / receive-payment pattern: camera input + file picker.
  const uploadControls=new WeakMap();
  function enhanceImageUploads(){
    const vi=localStorage.getItem('nexora-community-language')==='vi';
    for(const input of document.querySelectorAll('input[type="file"][accept]')){
      if(input.hasAttribute('data-community-camera-input')||!input.accept.includes('image'))continue;
      if(!input.closest('form')&&!input.hasAttribute('data-page-cover-file'))continue;
      if(input.parentElement.closest('[hidden],.hide,.hidden'))continue;
      let state=uploadControls.get(input);
      if(!state){
        const controls=document.createElement('div');controls.className='community-photo-actions';controls.setAttribute('role','group');
        const camera=document.createElement('input');camera.type='file';camera.hidden=true;camera.accept=input.accept.split(',').filter(value=>value.trim().startsWith('image/')||/^\s*\.(?:jpe?g|png|webp|heic|heif|gif)$/i.test(value)).join(',')||'image/*';camera.setAttribute('capture','environment');camera.dataset.communityCameraInput='true';
        const makeButton=(iconName,action)=>{const button=document.createElement('button');button.type='button';button.className='btn '+(action==='camera'?'soft ':'')+'community-photo-button';button.dataset.communityPhotoAction=action;const definition=window.lucide?.icons[iconName];if(definition)button.append(window.lucide.createElement(definition,{width:18,height:18,class:'community-action-icon','aria-hidden':'true'}));const label=document.createElement('span');button.append(label);return {button,label};};
        const take=makeButton('Camera','camera'),upload=makeButton('Upload','upload');controls.append(take.button,upload.button,camera);
        const legacy=input.closest('label.jobs-upload');
        if(legacy){legacy.after(controls);legacy.classList.add('community-upload-legacy');}else input.after(controls);
        if(input.hasAttribute('data-page-cover-file')){controls.classList.add('is-cover');input.parentElement.querySelector('[data-change-page-cover]')?.classList.add('community-upload-legacy');}
        input.classList.add('community-upload-source');input.dataset.communityUploadSource='true';
        take.button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(!input.disabled)camera.click();});
        upload.button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(!input.disabled)input.click();});
        camera.addEventListener('change',event=>{event.stopPropagation();if(!camera.files?.length)return;let copied=false;try{const transfer=new DataTransfer();for(const file of camera.files)transfer.items.add(file);input.files=transfer.files;copied=true;}catch{input.files=camera.files;}input.dispatchEvent(new Event('change',{bubbles:true}));if(copied)camera.value='';});
        state={controls,camera,take,upload};uploadControls.set(input,state);
      }
      const groupLabel=input.getAttribute('aria-label')||input.labels?.[0]?.textContent.trim()||(vi?'Ảnh':'Photos');
      if(state.controls.getAttribute('aria-label')!==groupLabel)state.controls.setAttribute('aria-label',groupLabel);
      const takeLabel=vi?'Chụp ảnh':'Take photo';if(state.take.label.textContent!==takeLabel)state.take.label.textContent=takeLabel;
      if(state.upload.label.textContent!=='Upload')state.upload.label.textContent='Upload';
      for(const control of [state.take.button,state.upload.button,state.camera])if(control.disabled!==input.disabled)control.disabled=input.disabled;
    }
  }

  let activeDialog=null;
  let returnFocus=null;
  let lastDialogFocus=null;
  let queued=false;
  const focusable='button:not(:disabled),a[href],input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';
  const visible=element=>element.isConnected&&!element.closest('[hidden],.hide,.hidden')&&element.getClientRects().length>0;
  function setBodyClass(name,enabled){if(document.body.classList.contains(name)!==enabled)document.body.classList.toggle(name,enabled);}
  function updateDialog() {
    const dialogs=[...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(visible);
    const next=dialogs[dialogs.length-1]||null;
    setBodyClass('community-dialog-open',Boolean(next));
    if(document.documentElement.classList.contains('community-dialog-open')!==Boolean(next))document.documentElement.classList.toggle('community-dialog-open',Boolean(next));
    if(next===activeDialog)return;
    const previous=activeDialog;activeDialog=next;
    if(window.NEXORA_CONNECT_CORE&&window.parent!==window)window.parent.postMessage({type:'nexora-connect-dialog',open:Boolean(next)},location.protocol==='file:'?'*':location.origin);
    if(next&&!next.contains(document.activeElement)){
      let retained=null;
      if(previous&&lastDialogFocus){
        if(lastDialogFocus.id)retained=next.querySelector('#'+CSS.escape(lastDialogFocus.id));
        else if(lastDialogFocus.dataset.pageTab)retained=next.querySelector('[data-page-tab="'+CSS.escape(lastDialogFocus.dataset.pageTab)+'"]');
      }
      const first=retained&&visible(retained)?retained:[...next.querySelectorAll(focusable)].find(visible);
      if(first)first.focus({preventScroll:true});
      else{next.tabIndex=-1;next.focus({preventScroll:true});}
    }else if(!next&&previous&&returnFocus?.isConnected){returnFocus.focus({preventScroll:true});}
  }
  document.addEventListener('pointerdown',event=>{
    if(!event.target.closest('[role="dialog"][aria-modal="true"]'))returnFocus=event.target.closest('button,a,input,select,textarea')||document.activeElement;
  },true);
  document.addEventListener('focusin',event=>{
    if(event.target.closest('[role="dialog"][aria-modal="true"]'))lastDialogFocus=event.target;
    if(!event.target.closest('[role="dialog"][aria-modal="true"]')&&!activeDialog)returnFocus=event.target;
  });
  document.addEventListener('keydown',event=>{
    if(!activeDialog||!visible(activeDialog))return;
    if(event.key==='Escape'){
      const close=activeDialog.querySelector('#closeModal,#cancelModal,[data-close],#closeCallPreview,#cancelCreateGroup');
      if(close){event.preventDefault();event.stopImmediatePropagation();close.click();}
      return;
    }
    if(event.key!=='Tab')return;
    const items=[...activeDialog.querySelectorAll(focusable)].filter(visible);
    if(!items.length){event.preventDefault();return;}
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&(document.activeElement===first||!activeDialog.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!activeDialog.contains(document.activeElement))){event.preventDefault();first.focus();}
  },true);
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[role="tab"],[data-page-tab]');
    if(!tab)return;
    const strip=tab.parentElement;
    requestAnimationFrame(()=>{
      if(!strip.isConnected||strip.scrollWidth<=strip.clientWidth)return;
      const selected=strip.querySelector('[aria-selected="true"],.active')||tab;
      if(!selected.isConnected)return;
      const container=strip.getBoundingClientRect(),item=selected.getBoundingClientRect();
      const left=item.left<container.left?item.left-container.left-8:item.right>container.right?item.right-container.right+8:0;
      if(left)strip.scrollBy({left,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
    });
  });
  function refresh() {
    queued=false;
    decorateArtwork();decorateButtons();enhanceImageUploads();updateDialog();
    document.querySelectorAll('.filter-chip,.subtab,.switcher [data-type]').forEach(button=>{
      const name=button.getAttribute('role')==='tab'?'aria-selected':'aria-pressed';
      const value=String(button.classList.contains('active'));
      if(button.getAttribute(name)!==value)button.setAttribute(name,value);
    });
    const detail=document.querySelector('#detailPanel.chat-detail:not(.hidden)');
    setBodyClass('community-chat-open',Boolean(detail&&['messages','groups'].includes(document.body.dataset.section)&&visible(detail)));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(refresh);}}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden','aria-selected','disabled','accept']});
  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.NEXORA_COMMUNITY_UI={refresh:schedule};
  refresh();
})();
