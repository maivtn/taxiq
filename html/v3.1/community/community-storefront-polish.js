/* Decorative icons and label associations; existing business handlers stay unchanged. */
(() => {
  const base=new URL('../icon-oneqr/',document.currentScript.src||document.baseURI);
  const assets={settings:'issue-2040-oneqr-settings-3d.png',product:'issue-2040-oneqr-package-3d.png',service:'issue-2040-oneqr-wrench-3d.png',post:'issue-2040-oneqr-paintbrush-3d.png',deals:'issue-2040-oneqr-ticket-3d.png',pages:'issue-2040-oneqr-megaphone-3d.png',live:'issue-2040-oneqr-video-3d.png',messages:'issue-2040-oneqr-message-circle-3d.png',groups:'issue-2040-oneqr-users-round-3d.png',jobs:'issue-2040-oneqr-briefcase-3d.png',food:'issue-2040-oneqr-utensils-3d.png',realestate:'issue-2040-oneqr-building-2-3d.png',store:'issue-2040-oneqr-store-3d.png'};
  const actions={'edit-shop':'settings','shop-add-product':'product','shop-add-service':'service','shop-post':'post','shop-deal':'deals','shop-page':'pages'};
  function art(key){
    const holder=document.createElement('span');holder.className='store-action-art';holder.setAttribute('aria-hidden','true');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('focusable','false');
    const picture=document.createElementNS('http://www.w3.org/2000/svg','image');picture.setAttribute('href',new URL(assets[key],base).href);picture.setAttribute('width','32');picture.setAttribute('height','32');
    if(key==='post'){
      svg.innerHTML='<rect x="5" y="3" width="22" height="26" rx="4" fill="#e8f2ff" stroke="#3879c9" stroke-width="1.5"/><rect x="9" y="7" width="14" height="7" rx="1.5" fill="#55a6df"/><path d="M10 18h12M10 22h12M10 26h8" stroke="#3879c9" stroke-width="2" stroke-linecap="round"/>';
    }else svg.append(picture);holder.append(svg);return holder;
  }
  function polish(){
    const view=document.getElementById('page-view'),editor=document.getElementById('editor');
    const storefront=Boolean(view?.querySelector('.store-head'));
    const storePost=Boolean(storefront&&editor?.classList.contains('social-dialog')&&editor.querySelector('#feed-form [name="storeOrigin"][value="1"]'));
    if(editor?.dataset.storefrontPhoto==='1'&&!storePost){editor.classList.remove('community-photo-composer');delete editor.dataset.storefrontPhoto;}
    if(!storefront){editor?.classList.remove('storefront-dialog');return;}
    for(const button of view.querySelectorAll('.store-tool-grid button,.store-connect')){
      if(button.querySelector('.store-action-art'))continue;
      const key=actions[button.dataset.action]||(button.classList.contains('store-connect')?button.dataset.section:null);if(!assets[key])continue;
      for(const node of [...button.children])if(node.matches('svg.community-action-icon,span[aria-hidden="true"]'))node.remove();
      for(const node of button.childNodes)if(node.nodeType===3)node.nodeValue=node.nodeValue.replace(/^\s*[\p{Extended_Pictographic}\uFE0F\u200D＋✦✧]+\s*/u,'');
      for(const name of ['display','align-items','justify-content','gap'])button.style.removeProperty(name);
      button.prepend(art(key));
    }
    const logo=view.querySelector('.store-logo');if(logo&&!logo.querySelector('img,.store-action-art')){logo.textContent='';logo.append(art('store'));}
    editor?.classList.toggle('storefront-dialog',Boolean(editor.querySelector('#shop-form,#item-form,#feed-form [name="storeOrigin"][value="1"]')));
    if(storePost&&!editor.classList.contains('community-photo-composer')){editor.classList.add('community-photo-composer');editor.dataset.storefrontPhoto='1';}
    for(const form of document.querySelectorAll('#shop-form,#item-form'))for(const field of form.querySelectorAll('.field')){
      const label=field.querySelector(':scope>label'),control=field.querySelector('input:not([type=checkbox]),select,textarea');
      if(label&&control){control.id||=form.id+'-'+control.name;label.htmlFor=control.id;}
    }
    editor?.querySelector('.dialog-head [data-action="close-dialog"]')?.setAttribute('aria-label','Close');
  }
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;observer.disconnect();polish();observer.observe(document.body,{childList:true,subtree:true});});});
  polish();observer.observe(document.body,{childList:true,subtree:true});
})();
