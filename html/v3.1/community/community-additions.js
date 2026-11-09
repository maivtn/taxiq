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
    let current='',routeContext={},internal=false,generation=0,composerSession=null,composerRequest=0,assistantSession=null,assistantRequest=0,assistantLauncher=null;
    const notify=data=>options.notify?.(data);
    const styles=document.createElement('style');
    styles.textContent='.community-extra-pane{--hub-bg:#f7f9fc;--hub-surface:#fff;--hub-text:#0b1220;--hub-muted:#64748b;--hub-border:#dde5ef;--hub-brand:#4648d8;position:relative;min-width:0;width:100%;height:100%;overflow:auto;color:var(--hub-text)}.community-extra-pane.community-tools-aligned{max-width:1200px;margin-inline:auto}.community-extra-platform{max-width:1140px;margin:auto;padding:24px}.community-extra-pane>section{min-height:100%}.community-extra-pane>[hidden]{display:none!important}.community-route-loading{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;gap:12px;background:#f7f9fc;color:#43516b;font-size:15px;font-weight:700}.community-route-loading::before{content:"";width:24px;height:24px;border:3px solid #ddd9fa;border-top-color:#6552e7;border-radius:50%;animation:community-loading-spin .8s linear infinite}@keyframes community-loading-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.community-route-loading::before{animation:none}}.ecosystem-menu{max-height:min(640px,70vh);overflow-y:auto}.ecosystem-menu [data-community-extra]{display:flex;min-height:44px;align-items:center;gap:10px}.ecosystem-menu [data-community-extra] svg{flex:none;width:20px;height:20px}.community-extra-error{padding:24px;text-align:center}@container community (max-width:800px){.community-extra-platform{padding:16px}}';
    root.append(styles);
    const platformStyles=document.createElement('style');
    window.NEXORA_NATIVE.read(new URL('community-shell-v31.css',baseURL).href).then(css=>{
      const start=css.indexOf('.platform-heading'),end=css.indexOf('@container community');
      platformStyles.textContent=css.slice(start,end)+'@container community (max-width:800px){.platform-grid,.platform-form{grid-template-columns:1fr}.platform-heading h2{font-size:21px}.platform-card{padding:16px}}';
    }).catch(()=>{});
    root.append(platformStyles);
    const assistantStyles=document.createElement('style');root.append(assistantStyles);
    const assistantStylesReady=window.NEXORA_NATIVE.read(new URL('community-ai-assistant.css?v=20261109-ai-assistant1',baseURL).href).then(css=>{assistantStyles.textContent=css;});
    const pane=document.createElement('section');pane.className='community-extra-pane';pane.hidden=true;workspace.append(pane);
    const loading=document.createElement('div');loading.className='community-route-loading';loading.setAttribute('role','status');loading.setAttribute('aria-live','polite');loading.textContent='Loading Real Estate…';loading.hidden=true;pane.append(loading);
    const menu=root.getElementById('ecosystemMenu');
    const heading=root.querySelector('.community-heading h1');
    const tour=root.getElementById('startTour'),headingTools=document.createElement('span');
    headingTools.className='community-heading-tools';tour.before(headingTools);
    const headerLocation=document.createElement('span');headerLocation.className='community-header-location';headerLocation.hidden=true;
    headerLocation.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span data-header-location-label></span><button type="button" data-header-location-change></button>';
    headingTools.append(headerLocation,tour);
    styles.textContent+=`
      .community-heading-tools{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex:0 1 auto;min-width:0}
      .community-header-location{display:inline-flex;align-items:center;gap:8px;min-width:0;padding:0 10px;border:1px solid #dfdbff;border-radius:10px;background:#f0efff;color:#3d4961;font-size:12px;font-weight:750}
      .community-header-location[hidden]{display:none!important}
      .community-header-location svg{flex:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      [data-header-location-label]{min-width:0;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-header-location-change]{flex:none;min-height:34px;padding:0;border:0;background:transparent;color:#6250c9;font:inherit;font-weight:750;white-space:nowrap;text-decoration:underline;text-decoration-color:#b7ace9;text-underline-offset:3px;cursor:pointer}
      [data-header-location-change]:focus-visible{outline:3px solid #a99fff;outline-offset:2px}
      @container community (max-width:800px){
        .community-heading:has(.community-header-location:not([hidden])){flex-wrap:wrap}
        .community-heading-tools:has(.community-header-location:not([hidden])){flex-basis:100%;margin-top:2px;gap:8px}
        .community-header-location{flex:1}
        [data-header-location-change]{min-height:44px;margin-left:auto}
        .community-heading-tools:has(.community-header-location:not([hidden])) .tour-launch{min-height:44px}
      }
    `;
    // Keep the existing area picker and its state in the Feed document.
    const locationFrame=frames[0];let locationObserver;
    function syncHeaderLocation(){
      const source=locationFrame.contentDocument,bar=source?.getElementById('localDiscovery');
      const label=source?.getElementById('viewerLocationLabel'),button=source?.getElementById('changeViewerLocation');
      headerLocation.hidden=locationFrame.hidden||!bar||bar.classList.contains('hide')||!label||!button;
      if(label)headerLocation.querySelector('[data-header-location-label]').textContent=label.textContent.trim();
      if(button)headerLocation.querySelector('[data-header-location-change]').textContent=button.textContent.trim();
    }
    function bindHeaderLocation(){
      locationObserver?.disconnect();
      const source=locationFrame.contentDocument,bar=source?.getElementById('localDiscovery');
      if(!bar){syncHeaderLocation();return;}
      bar.classList.add('community-location-in-header');
      if(!source.getElementById('communityHeaderLocationStyle')){
        const locationStyle=source.createElement('style');locationStyle.id='communityHeaderLocationStyle';
        locationStyle.textContent='body #localDiscovery.community-location-in-header{display:none!important}@media(max-width:800px){body.embedded #localDiscovery.community-location-in-header.has-context-action:not(.hide){display:flex!important;justify-content:flex-end;min-height:44px;margin:0 0 10px;padding:0;border:0;background:transparent}body #localDiscovery.community-location-in-header :is(.community-context-location,#viewerLocationLabel,#changeViewerLocation){display:none!important}}';
        source.head.append(locationStyle);
      }
      locationObserver=new MutationObserver(syncHeaderLocation);
      locationObserver.observe(bar,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
      syncHeaderLocation();
    }
    headerLocation.querySelector('[data-header-location-change]').addEventListener('click',()=>locationFrame.contentDocument?.getElementById('changeViewerLocation')?.click());
    locationFrame.addEventListener('load',bindHeaderLocation);
    new MutationObserver(syncHeaderLocation).observe(locationFrame,{attributes:true,attributeFilter:['hidden']});
    bindHeaderLocation();
    const back=document.createElement('button');back.type='button';back.className='community-back-to-feed';back.hidden=true;
    back.textContent='← Back to Feed';back.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      // Close the active module first, then synchronize the outer URL and sidebar.
      navigate('feed',{},true);
      window.navigateCommunityHub?.('feed');
    });
    root.querySelector('.community-heading').prepend(back);
    styles.textContent+=' .community-back-to-feed{display:inline-flex;align-items:center;justify-content:center;flex:none;min-height:44px;padding:9px 13px;border:1px solid #dedcf1;border-radius:9px;background:#fff;color:#5548c8;font:inherit;font-size:13px;font-weight:750;cursor:pointer}.community-back-to-feed[hidden]{display:none!important}.community-back-to-feed:hover{background:#efedff}.community-back-to-feed:focus-visible{outline:3px solid #a99fff;outline-offset:2px}@container community (max-width:650px){.community-back-to-feed{font-size:12px;padding:8px 10px}}';
    styles.textContent+=' .app.community-extra-open .top{position:relative;flex:0 0 auto;z-index:10}.app.community-extra-open .workspace{flex:1 1 0%;min-height:0;overflow:hidden}.app.community-extra-open .community-back{display:none!important}.community-extra-pane.community-document-pane{overflow:hidden}.community-document-pane>section{height:100%;min-height:0;overflow:hidden}.community-document-pane iframe{display:block;width:100%;height:100%;border:0}';
    // Keep Feed visible while the PO dialog renders in the browser's top layer.
    styles.textContent+=' .community-extra-pane.community-composer-overlay{position:absolute;inset:0 0 auto;height:0;min-height:0;overflow:hidden}.community-composer-overlay>section{height:0;min-height:0}';
    new MutationObserver(()=>{if(current&&heading.textContent!==LABELS[current])heading.textContent=LABELS[current];}).observe(heading,{childList:true});
    const app=root.querySelector('.app'),ecosystemButton=root.getElementById('ecosystemButton'),navMore=[];
    const backdrop=document.createElement('div');backdrop.className='community-menu-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');
    const drawerHeading=document.createElement('div');drawerHeading.className='community-menu-heading';drawerHeading.append(menu.querySelector('h2'));
    const closeDrawer=document.createElement('button');closeDrawer.type='button';closeDrawer.className='community-menu-close';closeDrawer.setAttribute('aria-label','Close');closeDrawer.textContent='×';drawerHeading.append(closeDrawer);menu.prepend(drawerHeading);
    menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');app.append(backdrop,menu);
    styles.textContent+=`
      .app{position:relative}
      .community-menu-backdrop{position:absolute;inset:0;z-index:80;background:#17213b66}
      .community-menu-backdrop[hidden]{display:none}
      .app>.header-menu.ecosystem-menu{inset:0 auto 0 0;z-index:81;width:min(360px,calc(100% - 24px));height:100%;max-height:none;margin:0;border-radius:0 16px 16px 0;align-content:start;overflow-y:auto;overscroll-behavior:contain;box-shadow:12px 0 35px #19274924}
      .community-menu-heading{position:sticky;top:-14px;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 0 10px;background:#fff;border-bottom:1px solid #e5e9f2}
      .community-menu-heading h2{margin:0}
      .ecosystem-menu .community-menu-close{display:grid;place-items:center;flex:none;width:40px;min-height:40px;padding:0;font-size:24px;line-height:1}
      .ecosystem-menu .ecosystem-item{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;text-align:left}
      .ecosystem-item-icon{display:grid;place-items:center;flex:0 0 20px;width:20px;height:20px}
      .ecosystem-item-icon svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .ecosystem-item-label{min-width:0;line-height:1.4;overflow-wrap:anywhere}
      .community-nav-more:focus-visible,.ecosystem-menu button:focus-visible{outline:3px solid #a99fff;outline-offset:2px}
    `;
    for(const nav of [root.querySelector('.top .tabs'),root.querySelector('.mobile-nav')]){
      const more=document.createElement('button');more.type='button';more.className='tab community-nav-more'+(nav.classList.contains('mobile-nav')?' mobile-tab':'');more.setAttribute('aria-haspopup','dialog');more.setAttribute('aria-controls',menu.id);more.setAttribute('aria-expanded','false');
      more.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg><span>More</span>';
      more.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();ecosystemButton.click();});nav.append(more);navMore.push(more);
    }
    function syncNavCount(){root.querySelector('.mobile-nav').style.setProperty('--community-nav-count',String(root.querySelectorAll('.mobile-nav .mobile-tab:not([hidden])').length));}
    syncNavCount();
    let drawerOpen=false,drawerTrigger=null,drawerAnimation=null;
    new MutationObserver(()=>{
      const open=!menu.hidden;if(open===drawerOpen)return;drawerOpen=open;backdrop.hidden=!open;ecosystemButton.setAttribute('aria-expanded',String(open));navMore.forEach(button=>button.setAttribute('aria-expanded',String(open)));drawerAnimation?.cancel();
      if(open){
        drawerTrigger=root.activeElement||ecosystemButton;
        if(!matchMedia('(prefers-reduced-motion:reduce)').matches)drawerAnimation=menu.animate([{transform:'translateX(-100%)',opacity:.4},{transform:'translateX(0)',opacity:1}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
        closeDrawer.focus({preventScroll:true});
      }else if(!root.activeElement||menu.contains(root.activeElement))drawerTrigger?.focus({preventScroll:true});
    }).observe(menu,{attributes:true,attributeFilter:['hidden']});
    closeDrawer.addEventListener('click',()=>{menu.hidden=true;});backdrop.addEventListener('click',()=>{menu.hidden=true;});
    root.addEventListener('keydown',event=>{
      if(menu.hidden)return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();menu.hidden=true;return;}
      if(event.key!=='Tab')return;
      const controls=[...menu.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')].filter(element=>!element.hidden),first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&root.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&root.activeElement===last){event.preventDefault();first?.focus();}
    },true);
    document.addEventListener('click',event=>{const path=event.composedPath();if(!menu.hidden&&!path.includes(menu)&&!navMore.some(button=>path.includes(button))&&!path.includes(ecosystemButton))menu.hidden=true;});
    for(const [route,label] of Object.entries(LABELS)){if(['page-tools','group-tools','food-market'].includes(route)||!window.NEXORA_COMMUNITY_SHARED.canAccessFeature(route))continue;
      const button=document.createElement('button');button.type='button';button.dataset.communityExtra=route;
      const definition=window.lucide?.icons[ICONS[route]];
      if(definition)button.append(window.lucide.createElement(definition,{width:20,height:20,'aria-hidden':'true'}));
      button.append(document.createTextNode(label));menu.insertBefore(button,root.getElementById('menuStartTour'));
    }
    const menuIcons={feed:'LayoutList',market:'UsersRound',pages:'Building2',blog:'Newspaper',jobs:'BriefcaseBusiness',daywork:'CalendarDays',deals:'Ticket',connect:'MessageCircle',...ICONS};
    for(const button of menu.querySelectorAll('[data-quick-view],[data-community-extra],#menuStartTour')){
      const label=document.createElement('span');label.className='ecosystem-item-label';label.textContent=button.textContent.trim().replace(/^✦\s*/,'');
      if(button.dataset.i18n){label.dataset.i18n=button.dataset.i18n;delete button.dataset.i18n;}
      const icon=document.createElement('span');icon.className='ecosystem-item-icon';icon.setAttribute('aria-hidden','true');
      const name=button.id==='menuStartTour'?'Sparkles':menuIcons[button.dataset.quickView||button.dataset.communityExtra],definition=window.lucide?.icons[name];
      const svg=button.querySelector('svg')||(definition&&window.lucide.createElement(definition,{width:20,height:20,'aria-hidden':'true',focusable:'false'}));
      if(svg)icon.append(svg);button.classList.add('ecosystem-item');button.replaceChildren(icon,label);
    }
    function deactivate(){
      closeAssistant();
      closeComposer();
      generation++;
      if(!current&&pane.hidden)return;
      for(const task of modules.values())task.then(api=>api.window.NEXORA_COMMUNITY_MODULE?.deactivate?.());
      current='';loading.hidden=true;pane.removeAttribute('aria-busy');pane.hidden=true;back.hidden=true;root.querySelector('.app').classList.remove('community-extra-open');queueMicrotask(refreshFeed);document.body.classList.remove('community-extra-active');
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
    async function setupAssistant(){
      const [api]=await Promise.all([ensure('tools','modules/hub-tools/index.html'),assistantStylesReady]);
      api.window.NEXORA_COMMUNITY_MODULE.setLanguage('en');
      assistantLauncher=api.window.NEXORA_COMMUNITY_MODULE.assistantLauncher();
      assistantLauncher.addEventListener('click',()=>openAssistant());root.querySelector('.app').append(assistantLauncher);
      if(matchMedia('(prefers-reduced-motion:reduce)').matches)assistantLauncher.querySelector('video').pause();
      else assistantLauncher.querySelector('video').play().catch(()=>{});
    }
    function closeAssistant(){
      assistantRequest++;
      const session=assistantSession;if(!session)return;assistantSession=null;
      session.body.removeEventListener('close',session.cleanup,true);
      session.api.root.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());session.restore();
      session.api.root.host.style.cssText=session.hostStyle;session.api.root.host.hidden=session.hostHidden;
      if(session.overlay){pane.classList.remove('community-ai-overlay');pane.hidden=session.paneHidden;}
      notify({type:'nexora-community-detail',open:false});assistantLauncher?.focus({preventScroll:true});
    }
    async function openAssistant(){
      if(assistantSession)return;menu.hidden=true;root.getElementById('ecosystemButton').setAttribute('aria-expanded','false');closeComposer();
      const request=++assistantRequest;
      try{
        const api=await ensure('tools','modules/hub-tools/index.html');if(request!==assistantRequest)return;
        const host=api.root.host,body=api.root.querySelector('.native-body'),overlay=pane.hidden;
        const session={api,body,overlay,paneHidden:pane.hidden,hostHidden:host.hidden,hostStyle:host.style.cssText,restore:()=>{},cleanup:()=>queueMicrotask(()=>{if(assistantSession===session&&!api.root.querySelector('dialog[open]'))closeAssistant();})};
        assistantSession=session;body.addEventListener('close',session.cleanup,true);
        if(overlay){pane.classList.add('community-ai-overlay');pane.hidden=false;}
        // Top-layer PO dialogs stay usable while the current Community screen stays in place.
        if(host.hidden)host.style.cssText+=';position:absolute;inset:0 0 auto;height:0;min-height:0;';host.hidden=false;
        const route=current||new URLSearchParams(location.search).get('tab')||'feed';
        const opened=api.window.NEXORA_COMMUNITY_MODULE.openAssistant(route);session.restore=opened.restore;
        notify({type:'nexora-community-detail',open:true});
      }catch(error){if(request!==assistantRequest)return;closeAssistant();console.error('Community AI assistant',error);}
    }
    setupAssistant().catch(error=>console.error('Community AI launcher',error));
    function refreshFeed(){frames[0].contentWindow?.dispatchEvent(new Event('nexora-po-feed-refresh'));}
    function closeComposer(){
      composerRequest++;
      const session=composerSession;
      if(!session)return;
      composerSession=null;
      session.dialog.removeEventListener('close',session.cleanup);
      if(session.dialog.open)session.dialog.close();
      session.api.root.host.hidden=true;
      pane.classList.remove('community-composer-overlay');pane.hidden=true;
      refreshFeed();notify({type:'nexora-community-detail',open:false});
    }
    async function openFeedComposer(context){
      closeAssistant();
      if(composerSession)return;
      const request=++composerRequest;
      try{
        const api=await ensure('tools','modules/hub-tools/index.html');
        if(request!==composerRequest||current)return;
        const dialog=api.root.querySelector('#editor');
        const session={api,dialog,cleanup:()=>{if(composerSession===session)closeComposer();}};
        composerSession=session;dialog.addEventListener('close',session.cleanup,{once:true});
        for(const element of pane.children)element.hidden=true;
        pane.classList.add('community-composer-overlay');pane.hidden=false;api.root.host.hidden=false;
        api.window.NEXORA_COMMUNITY_MODULE.setLanguage('en');
        await api.window.NEXORA_COMMUNITY_MODULE.navigate('post',context);
        if(request===composerRequest)notify({type:'nexora-community-detail',open:true});
      }catch(error){
        if(request!==composerRequest)return;
        closeComposer();console.error('Community photo composer',error);
        navigate('post',{...context,modal:'0'});
      }
    }
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
      if(route==='explore'||!window.NEXORA_COMMUNITY_SHARED.canAccessFeature(route))route='feed';
      if(route==='assistant')return openAssistant();
      closeAssistant();
      if(route==='post'&&context.modal==='1'&&!current)return openFeedComposer(context);
      closeComposer();
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
      syncNavCount();
      pane.querySelector('.community-extra-platform')?.remove();pane.querySelector('.community-extra-error')?.remove();
      for(const element of pane.children)element.hidden=true;
      pane.removeAttribute('aria-busy');
      if(route==='realestate'){loading.hidden=false;pane.setAttribute('aria-busy','true');}
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
        loading.hidden=true;pane.removeAttribute('aria-busy');pane.scrollTop=0;
        if(!fromHost){notify({type:'nexora-community-route',route});if(Object.keys(routeContext).length)notify({type:'nexora-community-context',context:routeContext});}
      }catch(error){
        if(request!==generation)return;
        loading.hidden=true;pane.removeAttribute('aria-busy');
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
    const api={navigate:(route,context)=>navigate(route,context,true),setLanguage:()=>original.setLanguage('en'),receiveBase,isActive:()=>Boolean(current||composerSession||assistantSession),
      closeDetail(){if(assistantSession){closeAssistant();return;}if(composerSession){closeComposer();return;}if(!current){original.closeDetail();return;}for(const task of modules.values())task.then(api=>api.root.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close()));notify({type:'nexora-community-detail',open:false});}};
    api.ready=supports(initial)?navigate(initial,Object.fromEntries(params),true):Promise.resolve();
    return api;
  }
  window.NEXORA_COMMUNITY_ADDITIONS={mount,supports};
})();
