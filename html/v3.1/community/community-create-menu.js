/* Header-owned Create dropdown. Opening it never loads or messages the Feed iframe. */
(() => {
  'use strict';
  const base=new URL('./',document.currentScript.src);
  const artwork=name=>'feed-icons/'+name;
  const oneqr=name=>'../icon-oneqr/issue-2040-oneqr-'+name+'-3d.png';
  // Labels, order and artwork follow the existing Feed actions.
  const entries=[
    ['showcase','Work photos',artwork('picture-2659360.png'),'feed',{composeKind:'showcase'}],
    ['tip','Tips',artwork('mode-8484254.png'),'feed',{composeKind:'tip'}],
    ['question','Ask',artwork('speech-bubble-5726734.png'),'feed',{composeKind:'question'}],
    ['poll','Poll',artwork('vote-8121705.png'),'feed',{composeKind:'poll'}],
    ['event','Events',artwork('event-18669653.png'),'feed',{composeKind:'event'}],
    ['sale','List for sale',artwork('flash-sale-15106141.png'),'market',{composeKind:'market',marketType:'sale'}],
    ['want','Post a wanted item',oneqr('shopping-bag'),'market',{composeKind:'market',marketType:'want'}],
    ['deal','Post a deal or coupon',oneqr('ticket'),'deals',{composeKind:'deal'},'owner'],
    ['hiring','Post a job',artwork('posting-8522069.png'),'jobs',{composeKind:'hiring'},'owner'],
    ['seeking','Seeking work',oneqr('user-round'),'jobs',{composeKind:'seeking'},'staff'],
    ['blog','Write blog',artwork('blog-1352524.png'),'blog',{composeKind:'blog'}],
    ['photos','Photo video',oneqr('image'),'post',{modal:'1',composeKind:'photos'}],
    ['reels','Reel',oneqr('video'),'reels',{}],
    ['live','Live video',oneqr('video'),'live',{}]
  ];
  function mount(root,{role,navigate}){
    const trigger=root.getElementById('communityCreate');
    if(!trigger)return;
    const menu=document.createElement('div');
    menu.id='communityCreateMenu';menu.className='community-create-menu';
    menu.setAttribute('popover','auto');menu.setAttribute('role','menu');
    menu.setAttribute('aria-labelledby',trigger.id);
    trigger.setAttribute('aria-controls',menu.id);
    trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');
    const style=document.createElement('style');
    style.textContent=`
      .community-create-menu{position:fixed;inset:auto;margin:0;box-sizing:border-box;width:min(300px,calc(100vw - 24px));padding:6px;border:1px solid #e3e8f4;border-radius:13px;background:#fff;box-shadow:0 14px 36px #26376326;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;color:#26334c;font-family:Inter,Arial,sans-serif}
      .community-create-menu:popover-open{display:grid;gap:4px}
      .community-create-menu::backdrop{background:transparent}
      .community-create-menu button{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;box-sizing:border-box;padding:8px 10px;border:1px solid #dcd5ff;border-radius:9px;background:#f6f3ff;box-shadow:0 3px 0 #e2dcf8;color:inherit;text-align:left;font:750 12px/1.35 Inter,Arial,sans-serif;cursor:pointer}
      .community-create-menu button:is([data-create-kind="tip"],[data-create-kind="sale"]){border-color:#f2d79a;background:#fff9e9;box-shadow:0 3px 0 #f0dfb2}
      .community-create-menu button:is([data-create-kind="question"],[data-create-kind="hiring"],[data-create-kind="seeking"]){border-color:#f4cab2;background:#fff3eb;box-shadow:0 3px 0 #f1d4c4}
      .community-create-menu button[data-create-kind="poll"]{border-color:#eee19b;background:#fffde3;box-shadow:0 3px 0 #eee2a8}
      .community-create-menu button[data-create-kind="event"]{border-color:#f0cade;background:#fff4f8;box-shadow:0 3px 0 #eecddd}
      .community-create-menu button:hover{filter:brightness(.97)}
      .community-create-menu button:focus-visible{outline:2px solid #7961e9;outline-offset:-3px}
      .community-create-menu img{display:block;flex:none;width:24px;height:24px;object-fit:contain}
    `;
    root.append(style,menu);
    for(const [kind,label,icon,route,context,requiredRole] of entries){
      if(requiredRole&&requiredRole!==role)continue;
      const button=document.createElement('button');button.type='button';
      button.dataset.createKind=kind;button.setAttribute('role','menuitem');
      const image=document.createElement('img');image.src=new URL(icon,base).href;image.alt='';
      const text=document.createElement('span');text.textContent=label;button.append(image,text);
      button.addEventListener('click',()=>{close();navigate(route,{...context});});
      menu.append(button);
    }
    function isOpen(){return menu.matches(':popover-open');}
    function position(){
      const rect=trigger.getBoundingClientRect(),height=window.visualViewport?.height||innerHeight;
      menu.style.left=Math.max(12,Math.min(rect.right-menu.offsetWidth,innerWidth-menu.offsetWidth-12))+'px';
      menu.style.top=(rect.bottom+8)+'px';
      menu.style.maxHeight=Math.max(44,Math.min(540,height-rect.bottom-20))+'px';
    }
    function close(restoreFocus=false){if(isOpen())menu.hidePopover();trigger.setAttribute('aria-expanded','false');if(restoreFocus)trigger.focus();}
    function open(){menu.showPopover();position();trigger.setAttribute('aria-expanded','true');menu.querySelector('button')?.focus({preventScroll:true});}
    trigger.popoverTargetElement=menu;
    trigger.addEventListener('click',event=>{event.preventDefault();isOpen()?close():open();});
    trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();if(!isOpen())open();if(event.key==='ArrowUp')menu.lastElementChild.focus();}});
    menu.addEventListener('toggle',()=>trigger.setAttribute('aria-expanded',String(isOpen())));
    menu.addEventListener('keydown',event=>{
      const items=[...menu.querySelectorAll('button')],index=items.indexOf(root.activeElement);
      if(event.key==='Escape'){event.preventDefault();close(true);}
      if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
        event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next].focus();
      }
    });
    window.addEventListener('resize',()=>{if(isOpen())position();});
    window.visualViewport?.addEventListener('resize',()=>{if(isOpen())position();});
    return {close};
  }
  window.NEXORA_COMMUNITY_CREATE_MENU={mount};
})();
