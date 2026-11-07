/* Extend the cloned v2 shell through its existing app menu. */
(() => {
  'use strict';
  const LABELS={food:'Food & Restaurants',realestate:'Real Estate',shop:'My storefront',transfer:'Salon transfers',reels:'Reels',live:'Livestream',news:'News & Blog',wallet:'NEXORA Points',wheel:'Lucky Wheel',meet:'NEXORA Meet',account:'Profile',assistant:'AI assistant',notifications:'Notifications',stories:'Story',people:'Find people',post:'Create post','page-tools':'Pages','group-tools':'Groups & Market','food-market':'Food & Restaurants',explore:'Explore Community'};
  const ICONS={food:'Utensils',realestate:'House',shop:'Store',transfer:'Store',reels:'Clapperboard',live:'Video',news:'Newspaper',wallet:'WalletCards',wheel:'CircleDot',meet:'Video',account:'UserRound',assistant:'Sparkles',notifications:'Bell',stories:'Images',people:'UsersRound',post:'SquarePen','page-tools':'Store','group-tools':'UsersRound','food-market':'Utensils',explore:'LayoutGrid'};
  const supports=route=>Object.hasOwn(LABELS,route);
  const TOOLS=new Set(['shop','reels','live','news','stories','people','post','page-tools','group-tools','food-market','explore']);
  function mount(root,options,original){
    const workspace=root.querySelector('.workspace'),frames=[root.getElementById('communityPane'),root.getElementById('connectPane')];
    const baseURL=options.baseURL,params=options.params||new URLSearchParams(location.search),modules=new Map();
    window.NEXORA_COMMUNITY_PEOPLE=window.NEXORA_COMMUNITY_DIRECTORY.create(frames[1],baseURL,params);
    let current='',routeContext={},internal=false,generation=0;
    const notify=data=>options.notify?.(data);
    const styles=document.createElement('style');
    styles.textContent='.community-extra-pane{--hub-bg:#f7f9fc;--hub-surface:#fff;--hub-text:#0b1220;--hub-muted:#64748b;--hub-border:#dde5ef;--hub-brand:#4648d8;min-width:0;width:100%;height:100%;overflow:auto;color:var(--hub-text)}.community-extra-pane.community-tools-aligned{max-width:1200px;margin-inline:auto}.community-extra-platform{max-width:1140px;margin:auto;padding:24px}.community-extra-pane>section{min-height:100%}.community-extra-pane>[hidden]{display:none!important}.ecosystem-menu{max-height:min(640px,70vh);overflow-y:auto}.ecosystem-menu [data-community-extra]{display:flex;min-height:44px;align-items:center;gap:10px}.ecosystem-menu [data-community-extra] svg{flex:none;width:20px;height:20px}.community-extra-error{padding:24px;text-align:center}@container community (max-width:800px){.community-extra-platform{padding:16px}}';
    root.append(styles);
    const platformStyles=document.createElement('style');
    window.NEXORA_NATIVE.read(new URL('community-shell-v31.css',baseURL).href).then(css=>{
      const start=css.indexOf('.platform-heading'),end=css.indexOf('@container community');
      platformStyles.textContent=css.slice(start,end)+'@container community (max-width:800px){.platform-grid,.platform-form{grid-template-columns:1fr}.platform-heading h2{font-size:21px}.platform-card{padding:16px}}';
    }).catch(()=>{});
    root.append(platformStyles);
    const pane=document.createElement('section');pane.className='community-extra-pane';pane.hidden=true;workspace.append(pane);
    const menu=root.getElementById('ecosystemMenu');
    const heading=root.querySelector('.community-heading h1');
    const back=document.createElement('button');back.type='button';back.className='community-back-to-feed';back.hidden=true;
    back.textContent='← Back to Feed';back.addEventListener('click',()=>{
      // Update the shell route even if its initial module mount is still finishing.
      window.navigateCommunityHub?.('feed');
      if(current)navigate('feed',{},true);
    });
    root.querySelector('.community-heading').prepend(back);
    styles.textContent+=' .community-back-to-feed{display:inline-flex;align-items:center;justify-content:center;flex:none;min-height:44px;padding:9px 13px;border:1px solid #dedcf1;border-radius:9px;background:#fff;color:#5548c8;font:inherit;font-size:13px;font-weight:750;cursor:pointer}.community-back-to-feed[hidden]{display:none!important}.community-back-to-feed:hover{background:#efedff}.community-back-to-feed:focus-visible{outline:3px solid #a99fff;outline-offset:2px}@container community (max-width:650px){.community-back-to-feed{font-size:12px;padding:8px 10px}}';
    styles.textContent+=' .app.community-extra-open .top{position:relative;flex:0 0 auto;z-index:10}.app.community-extra-open .workspace{flex:1 1 0%;min-height:0;overflow:hidden}.app.community-extra-open .community-back{display:none!important}.community-extra-pane.community-document-pane{overflow:hidden}.community-document-pane>section{height:100%;min-height:0;overflow:hidden}.community-document-pane iframe{display:block;width:100%;height:100%;border:0}';
    new MutationObserver(()=>{if(current&&heading.textContent!==LABELS[current])heading.textContent=LABELS[current];}).observe(heading,{childList:true});
    const more=document.createElement('button');more.type='button';more.className='community-version-more';more.textContent='More';more.setAttribute('aria-expanded','false');
    more.addEventListener('click',()=>{root.getElementById('ecosystemButton').click();more.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('button')?.focus();});
    document.getElementById('communityVersionSwitch')?.append(more);
    new MutationObserver(()=>more.setAttribute('aria-expanded',String(!menu.hidden))).observe(menu,{attributes:true,attributeFilter:['hidden']});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){root.getElementById('ecosystemButton').click();more.focus();}});
    document.addEventListener('click',event=>{const path=event.composedPath();if(!menu.hidden&&!path.includes(menu)&&!path.includes(more)&&!path.includes(root.getElementById('ecosystemButton')))menu.hidden=true;});
    for(const [route,label] of Object.entries(LABELS)){if(['page-tools','group-tools','food-market'].includes(route))continue;
      const button=document.createElement('button');button.type='button';button.dataset.communityExtra=route;
      const definition=window.lucide?.icons[ICONS[route]];
      if(definition)button.append(window.lucide.createElement(definition,{width:20,height:20,'aria-hidden':'true'}));
      button.append(document.createTextNode(label));menu.insertBefore(button,root.getElementById('menuStartTour'));
    }
    function deactivate(){
      generation++;
      if(!current&&pane.hidden)return;
      for(const task of modules.values())task.then(api=>api.window.NEXORA_COMMUNITY_MODULE?.deactivate?.());
      current='';pane.hidden=true;back.hidden=true;root.querySelector('.app').classList.remove('community-extra-open');queueMicrotask(refreshFeed);document.body.classList.remove('community-extra-active');
      if(frames.every(frame=>frame.hidden))frames[0].hidden=false;
      root.querySelector('.community-heading h1').textContent='Community';
    }
    function receiveBase(data){
      if(internal)return false;
      if(current&&!['nexora-community-history-back','nexora-community-back'].includes(data.type))return false;
      return true;
    }
    async function ensure(key,file){
      if(modules.has(key))return modules.get(key);
      const host=document.createElement('section');host.hidden=true;pane.append(host);
      if(key==='food'||key==='realestate'){
        // Embed the exact PO documents requested, including their own UI and flows.
        host.style.cssText='height:100%;overflow:hidden';
        const frame=document.createElement('iframe');frame.title=LABELS[key];frame.style.cssText='display:block;width:100%;height:100%;border:0;background:#fff';
        const task=new Promise((resolve,reject)=>{
          frame.onload=()=>{
            const layout=frame.contentDocument.createElement('style');layout.textContent='html{overflow-x:clip;overflow-y:auto;min-height:100%}body{min-width:0;overflow:visible}'+(key==='food'?'@media(max-width:650px){header>div{flex-wrap:wrap;height:auto;min-width:0}header{height:auto}.wrap>*{min-width:0}}':'');frame.contentDocument.head.append(layout);
            resolve({root:{host,querySelector:selector=>frame.contentDocument?.querySelector(selector)},window:{NEXORA_COMMUNITY_MODULE:{setLanguage(value){const doc=frame.contentDocument;if(key==='realestate'){frame.contentWindow?.setLang?.(value);return;}if(value==='en'&&doc?.getElementById('lang-btn')?.textContent.trim()==='EN')doc.getElementById('lang-btn').click();},navigate(){frame.contentWindow?.scrollTo(0,0);},deactivate(){frame.contentWindow?.tourStop?.();}}}});
          };
          frame.onerror=()=>{modules.delete(key);host.remove();reject(new Error('Unable to load '+LABELS[key]));};
        });
        modules.set(key,task);frame.src=new URL('modules/'+key+'/po-'+key+'.html?v=20261107-po-embeds1',baseURL).href;host.append(frame);return task;
      }
      const url=new URL(file,baseURL);
      for(const [key,value] of params)url.searchParams.set(key,value);
      for(const [key,value] of Object.entries(routeContext))if(value!=null)url.searchParams.set(key,value);
      url.searchParams.set('embedded','1');url.searchParams.set('lang','en');url.searchParams.set('section',current);
      const task=window.NEXORA_NATIVE.mount(host,url,{stylesheet:new URL('community-po-theme.css?v=20261107-ui-sync1',baseURL).href,onMessage:receive,navigate:url=>location.assign(url)})
        .catch(error=>{modules.delete(key);host.remove();throw error;});
      modules.set(key,task);return task;
    }
    window.NEXORA_COMMUNITY_FEED={async preview(){
      if(current&&current!=='notifications')return null;
      await window.NEXORA_COMMUNITY_PEOPLE.ready();
      const api=await ensure('tools','modules/hub-tools/index.html');
      if(current&&current!=='notifications')return null;
      api.window.NEXORA_COMMUNITY_MODULE.setLanguage('en');return api.window.NEXORA_COMMUNITY_MODULE.feedPreview();
    },request:id=>window.NEXORA_COMMUNITY_PEOPLE.request(id)};
    function refreshFeed(){frames[0].contentWindow?.dispatchEvent(new Event('nexora-po-feed-refresh'));}
    window.addEventListener('nexora-community-shared-changed',refreshFeed);
    function contact(data){
      navigate(data.type==='nexora-open-community-group'?'chatgroups':'connect');
      const frame=frames[1],send=()=>frame.contentWindow.postMessage(data.type==='nexora-open-community-group'?data:{type:'nexora-open-contact',contact:data.contact},location.origin);
      if(frame.contentDocument?.readyState==='complete'&&frame.contentDocument.location.href!=='about:blank')send();
      else frame.addEventListener('load',send,{once:true});
    }
    function receive(data){
      if(data?.type==='nexora-community-route'){navigate(data.route,data.context);return;}
      if(['nexora-community-contact','nexora-open-community-group'].includes(data?.type)){contact(data);return;}
      if(['nexora-modal-state','nexora-connect-dialog','nexora-connect-detail'].includes(data?.type)){
        notify({type:'nexora-community-detail',open:Boolean(data.open)});return;
      }
      if(data&&typeof data==='object')notify(data);
    }
    async function navigate(route,context={},fromHost=false){
      const request=++generation;
      if(!supports(route)){
        deactivate();if(route==='feed')original.restoreFeed();else original.navigate(route,context);
        if(!fromHost)notify({type:'nexora-community-route',route});return;
      }
      if(route==='transfer'){
        deactivate();original.navigate('jobs',{...context,jobsTab:'transfer'});return;
      }
      if(current&&current!==route)for(const task of modules.values())task.then(api=>api.window.NEXORA_COMMUNITY_MODULE?.deactivate?.());
      internal=true;original.navigate('feed');internal=false;
      current=route;routeContext=context||{};pane.classList.toggle('community-tools-aligned',['post','reels','live'].includes(route));document.body.classList.add('community-extra-active');
      root.querySelector('.app').classList.add('community-extra-open');pane.classList.toggle('community-document-pane',['food','realestate'].includes(route));
      frames.forEach(frame=>{frame.hidden=true;});pane.hidden=false;back.hidden=false;
      root.getElementById('ecosystemMenu').hidden=true;root.getElementById('ecosystemButton').setAttribute('aria-expanded','false');
      root.querySelector('.community-heading h1').textContent=LABELS[route];
      root.querySelectorAll('.tab').forEach(tab=>{tab.classList.remove('active');tab.setAttribute('aria-current','false');});
      root.querySelectorAll('.mobile-tab').forEach(tab=>{tab.hidden=false;});
      root.querySelector('.mobile-nav').style.setProperty('--community-nav-count','6');
      pane.querySelector('.community-extra-platform')?.remove();pane.querySelector('.community-extra-error')?.remove();
      for(const element of pane.children)element.hidden=true;
      try{
        if(['wallet','account','assistant','notifications'].includes(route)){
          const panel=document.createElement('section');panel.className='community-extra-platform';pane.append(panel);
          window.NEXORA_COMMUNITY_PLATFORM.mount(panel,{route,language:'en',context:routeContext,navigate});
        }else{
          const key=TOOLS.has(route)?'tools':route;
          const api=await ensure(key,'modules/'+(key==='tools'?'hub-tools':key)+'/index.html');
          if(request!==generation)return;
          api.window.NEXORA_COMMUNITY_MODULE?.setLanguage('en');
          await api.window.NEXORA_COMMUNITY_MODULE?.navigate?.(route,routeContext);
          if(request!==generation)return;
          // The tools module is reused for Reels and Live video.
          // Reset its own scroll area as well as the outer pane on each route.
          api.root.querySelector('.native-body')?.scrollTo(0,0);
          api.root.host.hidden=false;
        }
        if(request!==generation)return;
        pane.scrollTop=0;
        if(!fromHost){notify({type:'nexora-community-route',route});if(Object.keys(routeContext).length)notify({type:'nexora-community-context',context:routeContext});}
      }catch(error){
        if(request!==generation)return;
        const panel=document.createElement('section');panel.className='community-extra-error';
        const text=document.createElement('p');text.setAttribute('role','alert');text.textContent='Something went wrong. Please try again.';
        const retry=document.createElement('button');retry.type='button';retry.className='small-action';retry.textContent='Try again';retry.addEventListener('click',()=>navigate(route,context,fromHost));
        panel.append(text,retry);pane.append(panel);console.error('Community addition',route,error);
      }
    }
    root.addEventListener('click',event=>{
      const button=event.target.closest('[data-community-extra]');if(button)navigate(button.dataset.communityExtra);
    });
    root.addEventListener('click',event=>{
      if(current&&event.target.closest('.tab[data-view],[data-top-sub-view],[data-quick-view],[data-side-view],#messagesButton,#accountButton,#viewNotification,#startTour,#menuStartTour'))deactivate();
    },true);
    root.addEventListener('keydown',event=>{
      if(current&&event.key==='Enter'&&event.target.id==='globalSearch'&&event.target.value.trim())deactivate();
    },true);
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||!frames.some(frame=>event.source===frame.contentWindow))return;
      if(event.data?.type==='nexora-community-route'&&supports(event.data.route))navigate(event.data.route,event.data.context);
    });
    const initial=params.get('tab')||'feed';
    const api={navigate:(route,context)=>navigate(route,context,true),setLanguage:()=>original.setLanguage('en'),receiveBase,isActive:()=>Boolean(current),
      closeDetail(){if(!current){original.closeDetail();return;}for(const task of modules.values())task.then(api=>api.root.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close()));notify({type:'nexora-community-detail',open:false});}};
    api.ready=supports(initial)?navigate(initial,Object.fromEntries(params),true):Promise.resolve();
    return api;
  }
  window.NEXORA_COMMUNITY_ADDITIONS={mount,supports};
})();
