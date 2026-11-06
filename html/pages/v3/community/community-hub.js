/* Community v3.1: one shell, native isolated regions and shared identity/points. */
(() => {
  'use strict';
  const BASE=new URL('./',document.currentScript.src), VERSION='20261106-v31';
  const LABELS={en:{feed:'Feed',groups:'Groups & Market',market:'Buy & sell',pages:'Pages',deals:'Deals & Coupons',jobs:'Jobs',shift:'Extra shifts',blog:'Blog',connect:'Messages & Calls',reels:'Reels',live:'Livestream',news:'News & Blog',shop:'My storefront',transfer:'Salon transfers',realestate:'Real Estate',food:'Food & Restaurants',wallet:'NEXORA Points',wheel:'Lucky Wheel',meet:'NEXORA Meet',account:'Profile',assistant:'AI assistant',more:'More',back:'Back',notifications:'Notifications',empty:'No new notifications.',retry:'Try again',error:'Something went wrong. Please try again.',loading:'Loading…',search:'Search Nexora members — nickname, NX-ID, phone, email'},vi:{feed:'Bảng tin',groups:'Nhóm & Chợ',market:'Mua bán',pages:'Trang / Fanpage',deals:'Ưu đãi & Mã giảm giá',jobs:'Việc làm',shift:'Ca làm thêm',blog:'Blog',connect:'Tin nhắn & Cuộc gọi',reels:'Reels',live:'Livestream',news:'Tin tức & Blog',shop:'Gian hàng của tôi',transfer:'Sang nhượng tiệm',realestate:'Địa ốc',food:'Nhà hàng món ngon',wallet:'Ví điểm NEXORA',wheel:'Vòng quay may mắn',meet:'NEXORA Meet',account:'Hồ sơ',assistant:'Trợ lý AI',more:'Thêm',back:'Quay lại',notifications:'Thông báo',empty:'Chưa có thông báo mới.',retry:'Thử lại',error:'Đã có lỗi xảy ra. Vui lòng thử lại.',loading:'Đang tải…',search:'Tìm người — nickname, NX-ID, số điện thoại, email'}};
  const ICONS={feed:'LayoutList',groups:'UsersRound',market:'ShoppingBag',pages:'Building2',deals:'Ticket',jobs:'Briefcase',shift:'CalendarDays',blog:'BookOpen',connect:'MessageCircle',reels:'Clapperboard',live:'Video',news:'Newspaper',shop:'Store',transfer:'Store',realestate:'House',food:'Utensils',wallet:'WalletCards',wheel:'CircleDot',meet:'Video',account:'UserRound',assistant:'Sparkles',more:'Grid2X2',back:'ArrowLeft',notifications:'Bell'};
  const CORE=new Set(['feed','groups','market','pages','deals','jobs','shift','blog','transfer']);
  const TOOLS=new Set(['shop','reels','live','news']);
  const ALIASES={daywork:'shift',shifts:'shift',messages:'connect',home:'feed',fanpage:'pages',profile:'jobs',chatgroups:'connect',calls:'connect',privacy:'connect'};
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon=name=>{const definition=window.lucide?.icons[name];return definition?window.lucide.createElement(definition,{width:20,height:20,'aria-hidden':'true',focusable:'false'}).outerHTML:'';};
  async function mount(host,options={}){
    if(host.communityHub)return host.communityHub;
    const params=options.params||new URLSearchParams(location.search), root=host.attachShadow({mode:'open'});
    const style=document.createElement('style');style.textContent=await window.NEXORA_NATIVE.read(new URL('community-shell-v31.css?v='+VERSION,BASE).href);root.append(style);
    let language=localStorage.getItem('nexora-v3:nexora-community-language')||'en';if(!LABELS[language])language='en';
    let route='',rawRoute='',context={},detail=false,more=false,notifications=false,accountOpen=false,generation=0,coreCommand=false;
    const modules=new Map(),panes=new Map();
    const shell=document.createElement('div');shell.className='community-native-shell';root.append(shell);
    shell.innerHTML='<header class="hub-header"><div class="hub-heading"><button class="hub-icon" data-hub-back></button><h1>Community</h1></div><div class="hub-actions"><button class="hub-icon" data-hub-notifications></button><button class="hub-points" data-hub-route="wallet"></button><button class="hub-icon" data-hub-route="assistant"></button><select class="hub-language" aria-label="Language"><option value="en">English</option><option value="vi">Tiếng Việt</option></select><button class="hub-icon" data-hub-route="account"></button><button class="hub-icon" data-hub-more></button></div></header><nav class="hub-top-tabs"></nav><section class="hub-menu" hidden></section><section class="hub-notifications" hidden></section><aside class="hub-account-drawer" hidden></aside><main class="hub-stage"></main><nav class="hub-bottom-tabs"></nav>';
    const stage=root.querySelector('.hub-stage'),labels=()=>LABELS[language];
    function notify(data){options.notify?.(data);}
    function button(key,compact=false){return '<button type="button" class="hub-nav-item'+(route===key?' active':'')+'" '+(key==='more'?'data-hub-more':'data-hub-route="'+key+'"')+' aria-label="'+esc(labels()[key])+'"'+(route===key?' aria-current="page"':'')+'>'+icon(ICONS[key])+'<span>'+esc(labels()[key])+'</span></button>';}
    function navigation(){
      shell.lang=language;root.querySelector('h1').textContent=route==='feed'?'Community':labels()[route]||'Community';
      root.querySelector('[data-hub-back]').innerHTML=icon('ArrowLeft');root.querySelector('[data-hub-back]').setAttribute('aria-label',labels().back);
      root.querySelector('[data-hub-notifications]').innerHTML=icon('Bell');root.querySelector('[data-hub-notifications]').setAttribute('aria-label',labels().notifications);
      for(const key of ['assistant','account']){const node=root.querySelector('[data-hub-route="'+key+'"]');node.innerHTML=icon(ICONS[key]);node.setAttribute('aria-label',labels()[key]);}
      const wallet=window.NEXORA_COMMUNITY_SHARED.wallet();root.querySelector('.hub-points').innerHTML=icon('WalletCards')+'<span>'+wallet.balance.toLocaleString('en-US')+'</span>';
      root.querySelector('.hub-points').setAttribute('aria-label',labels().wallet);
      const moreButton=root.querySelector('.hub-actions [data-hub-more]');moreButton.innerHTML=icon('Grid2X2');moreButton.setAttribute('aria-label',labels().more);moreButton.setAttribute('aria-expanded',String(more));
      const identity=window.NEXORA_COMMUNITY_SHARED.me(),drawer=root.querySelector('.hub-account-drawer');drawer.hidden=!accountOpen;drawer.innerHTML='<div class="hub-account-heading"><strong>'+esc(identity.name)+'</strong><button type="button" class="hub-icon" data-hub-close-account aria-label="'+esc(language==='vi'?'Đóng':'Close')+'">'+icon('X')+'</button></div><p>@'+esc(identity.nickname)+'</p><p>'+esc(identity.id)+'</p><nav><a class="hub-nav-item" href="/html/pages/dashboard.html">'+icon('LayoutDashboard')+'Dashboard</a><a class="hub-nav-item" href="/html/pages/frame-personal.html">'+icon('Briefcase')+'My Workspace</a>'+button('account')+button('wallet')+button('wheel')+'<button type="button" class="hub-nav-item" data-hub-route="privacy">'+icon('Shield')+'Privacy &amp; NEXORA ID</button></nav>';
      root.querySelector('.hub-language').value=language;
      root.querySelector('.hub-top-tabs').innerHTML=['feed','groups','jobs','shift','connect'].map(key=>button(key)).join('');
      root.querySelector('.hub-bottom-tabs').innerHTML=['feed','groups','jobs','connect','more'].map(key=>button(key,true)).join('');
      root.querySelector('.hub-menu').innerHTML=['feed','groups','pages','deals','jobs','reels','live','news','connect','shop','transfer','realestate','food','shift','blog','wallet','wheel','meet','account'].map(key=>button(key)).join('');
      root.querySelector('.hub-menu').hidden=!more;renderNotifications();
    }
    function renderNotifications(){
      const shared=window.NEXORA_COMMUNITY_SHARED,rows=shared.read().notifications.filter(row=>row.recipient===shared.member),unread=rows.filter(row=>!row.read).length;
      const bell=root.querySelector('[data-hub-notifications]');bell.querySelector('b')?.remove();if(unread)bell.insertAdjacentHTML('beforeend','<b class="hub-badge">'+unread+'</b>');
      const panel=root.querySelector('.hub-notifications');panel.hidden=!notifications;
      panel.innerHTML='<h2>'+esc(labels().notifications)+'</h2>'+(rows.length?rows.map(row=>'<button type="button" data-hub-notification="'+esc(row.id)+'" class="'+(row.read?'':'unread')+'"><strong>'+esc(row.title)+'</strong><time>'+esc(new Date(row.time).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}))+'</time></button>').join(''):'<p>'+esc(labels().empty)+'</p>');
    }
    function setDetail(open){detail=!!open;shell.classList.toggle('hub-detail-open',detail);notify({type:'nexora-community-detail',open:detail});}
    function moduleURL(file,key){const url=new URL(file,BASE);for(const [name,value] of params)url.searchParams.set(name,value);for(const [name,value] of Object.entries(context))if(value!=null)url.searchParams.set(name,value);url.searchParams.set('embedded','1');url.searchParams.set('lang',language);url.searchParams.set('rev',VERSION);if(key==='core'){url.searchParams.set('view',route==='shift'?'daywork':route==='transfer'?'jobs':route);url.searchParams.set('tab',route);}if(key==='tools')url.searchParams.set('section',route);return url;}
    async function ensure(key,file){
      if(modules.has(key))return modules.get(key);
      const pane=document.createElement('section');pane.className='hub-pane';pane.hidden=true;stage.append(pane);panes.set(key,pane);
      const task=window.NEXORA_NATIVE.mount(pane,moduleURL(file,key),{onMessage:(data,source)=>receive(data,source),navigate:url=>location.assign(url)}).catch(error=>{modules.delete(key);pane.remove();panes.delete(key);throw error;});modules.set(key,task);return task;
    }
    async function receive(data,source){
      if(!data||typeof data!=='object')return;
      if(data.type==='nexora-modal-state'||data.type==='nexora-connect-dialog'||data.type==='nexora-connect-detail'){setDetail(data.open);return;}
      if(data.type==='nexora-community-contact'){await show('connect');const api=await modules.get('connect');api.send({type:'nexora-open-contact',contact:data.contact});return;}
      if(data.type==='nexora-open-community-group'){await show('chatgroups');const api=await modules.get('connect');api.send(data);return;}
      if(data.type==='nexora-connect-community-context'){const value=data.context||{};await show(value.view==='daywork'?'shift':value.view||'feed',value);return;}
      if(data.type==='nexora-community-route'){await show(data.route,data.context||{});return;}
      if(data.type==='nexora-prototype-view'){if(coreCommand)return;const next=data.view==='daywork'?'shift':data.view;if(CORE.has(next)&&next!==route){route=next;rawRoute=next;navigation();notify({type:'nexora-community-route',route:next});}return;}
      if(data.type==='nexora-connect-section'){if(route==='connect'){rawRoute=({groups:'chatgroups',calls:'calls',privacy:'privacy'}[data.section]||'connect');notify({type:'nexora-community-route',route:rawRoute});}return;}
      if(data.type==='nexora-connect-back-community'){show('feed');return;}
      if(data.type==='nexora-community-page-state'||data.type==='nexora-community-page-navigate'||data.type==='nexora-community-context'||data.type==='nexora-community-pos'||data.type==='nexora-feed-post-close'||data.type==='nexora-community-history-back'){notify(data);return;}
    }
    async function show(next,nextContext={},fromHost=false){
      const requested=next;next=ALIASES[next]||next;if(!LABELS[language][next])next='feed';
      if(next!==route)for(const [key,pane] of panes)if(!pane.hidden)modules.get(key)?.then(api=>api.window.NEXORA_COMMUNITY_MODULE?.deactivate?.());
      rawRoute=requested;route=next;context=nextContext||{};const ownGeneration=++generation;
      more=false;notifications=false;accountOpen=false;setDetail(false);navigation();
      for(const pane of panes.values())pane.hidden=true;
      root.querySelector('.hub-platform')?.remove();root.querySelector('.hub-load-error')?.remove();
      try{
        let key,api;
        if(CORE.has(route)){key='core';coreCommand=true;try{api=await ensure(key,'nexora-community-prototype.html');api.send({type:'nexora-language',language});api.send({type:'nexora-open-view',view:route==='shift'?'daywork':route==='transfer'?'jobs':route});api.send({type:'nexora-community-context',context:route==='transfer'?{...context,jobsTab:'transfer'}:context});}finally{coreCommand=false;}}
        else if(route==='connect'){key='connect';api=await ensure(key,'nexora-privacy-qr-layout.html');api.send({type:'nexora-language',language});api.send({type:'nexora-open-section',section:({chatgroups:'groups',calls:'calls',privacy:'privacy'}[requested]||'messages')});}
        else if(TOOLS.has(route)){key='tools';api=await ensure(key,'modules/hub-tools/index.html');api.window.NEXORA_COMMUNITY_MODULE?.setLanguage(language);api.window.NEXORA_COMMUNITY_MODULE?.navigate(route);}
        else if(['food','realestate','meet','wheel'].includes(route)){key=route;api=await ensure(key,'modules/'+route+'/index.html');api.window.NEXORA_COMMUNITY_MODULE?.setLanguage(language);api.window.NEXORA_COMMUNITY_MODULE?.navigate?.(route,context);}
        else {const panel=document.createElement('section');panel.className='hub-platform';stage.append(panel);window.NEXORA_COMMUNITY_PLATFORM.mount(panel,{route,language,context,navigate:show,setDetail});}
        if(ownGeneration!==generation)return;
        if(key)panes.get(key).hidden=false;
        stage.scrollTop=0;
        if(!fromHost){notify({type:'nexora-community-route',route:requested==='transfer'?'transfer':route==='connect'?requested:route});if(Object.keys(context).length)notify({type:'nexora-community-context',context});}
      }catch(error){if(ownGeneration!==generation)return;const node=document.createElement('div');node.className='hub-load-error';node.innerHTML='<p role="alert">'+esc(labels().error)+'</p><button type="button" data-hub-retry>'+esc(labels().retry)+'</button>';stage.append(node);console.error('Community region',route,error);}
    }
    async function setLanguage(next){language=LABELS[next]?next:'en';localStorage.setItem('nexora-v3:nexora-community-language',language);navigation();for(const task of modules.values()){const api=await task;api.send({type:'nexora-language',language});api.window.NEXORA_COMMUNITY_MODULE?.setLanguage(language);}if(!CORE.has(route)&&route!=='connect'&&!TOOLS.has(route)&&!['food','realestate','meet','wheel'].includes(route))show(route,context,true);}
    root.addEventListener('click',event=>{
      const target=event.target.closest('button');if(!target)return;
      if(target.hasAttribute('data-hub-close-account')){accountOpen=false;setDetail(false);navigation();return;}
      if(target.closest('.hub-actions')&&target.dataset.hubRoute==='account'){accountOpen=!accountOpen;more=false;notifications=false;setDetail(accountOpen);navigation();return;}
      if(target.hasAttribute('data-hub-more')){more=!more;notifications=false;navigation();return;}
      if(target.hasAttribute('data-hub-notifications')){notifications=!notifications;more=false;navigation();return;}
      if(target.hasAttribute('data-hub-back')){notify({type:'nexora-community-history-back'});return;}
      if(target.hasAttribute('data-hub-retry')){show(rawRoute,context,true);return;}
      if(target.dataset.hubRoute){show(target.dataset.hubRoute);return;}
      if(target.dataset.hubNotification){const shared=window.NEXORA_COMMUNITY_SHARED,row=shared.read().notifications.find(item=>item.id===target.dataset.hubNotification&&item.recipient===shared.member);if(row){shared.change(data=>{data.notifications.find(item=>item.id===row.id).read=true;});show(row.route,row.context);}}
    });
    root.querySelector('.hub-language').addEventListener('change',event=>setLanguage(event.target.value));
    root.addEventListener('keydown',event=>{if(event.key==='Escape'){more=false;notifications=false;accountOpen=false;setDetail(false);navigation();}});
    window.addEventListener('nexora-community-shared-changed',navigation);
    const api={navigate:(next,ctx)=>show(next,ctx,true),setLanguage,closeDetail:async()=>{if(accountOpen){accountOpen=false;navigation();setDetail(false);return;}if(route==='connect')(await modules.get('connect'))?.send({type:'nexora-back'});else if(CORE.has(route))(await modules.get('core'))?.send({type:'nexora-close-modal'});else root.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());setDetail(false);}};
    host.communityHub=api;await show(params.get('tab')||'feed',Object.fromEntries(params),true);return api;
  }
  window.NEXORA_COMMUNITY_HUB={mount};
})();
