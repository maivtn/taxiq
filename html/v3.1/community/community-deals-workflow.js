/* Complete PO Deal & Coupon flows, hosted inside the current Community tab. */
(() => {
  'use strict';
  const BASE = new URL('./', document.currentScript.src);
  const ROUTES = {
    nearby: {module:'nearby',view:'explore',label:'Nearby deals',icon:'map'},
    industry: {module:'nearby',view:'cats',label:'Industry coupons',icon:'ticket'},
    match: {module:'deal-match',view:'cust',label:'Deal Match',icon:'sparkles'},
    opening: {module:'nearby',view:'openings',label:'Grand opening',icon:'store'},
    wallet: {module:'nearby',view:'wallet',label:'Coupon wallet',icon:'wallet'},
    saved: {module:'nearby',view:'wish',label:'Wish list',icon:'heart'},
    create: {module:'nearby',view:'create',label:'Create in POS ↗',icon:'plus',business:true},
    manage: {module:'nearby',view:'manage',label:'Live coupons',icon:'ticket',business:true},
    redeem: {module:'nearby',view:'redeem',label:'Redeem counter',icon:'scan',business:true},
    campaign: {module:'campaigns',label:'Campaigns',icon:'chart',business:true},
    openingBusiness: {module:'grand-opening',label:'Grand opening',icon:'store',business:true},
    demand: {module:'deal-match',view:'biz',label:'Deal Match',icon:'sparkles',business:true}
  };
  const ALIASES = {deals:'nearby',dcats:'industry',dmatch:'match',dopen:'opening',dwallet:'wallet',dwish:'saved',dcreate:'create',dmanage:'manage',dredeem:'redeem',dcamp:'campaign'};
  const ART = {map:'issue-2040-oneqr-map-3d.png',percent:'issue-2040-oneqr-percent-3d.png',store:'issue-2040-oneqr-store-3d.png',clock:'issue-2040-oneqr-clock-3d.png',wallet:'vlinkpay-wallet-show-wallet.png',sparkles:'issue-2040-oneqr-sparkles-3d.png',heart:'issue-2040-oneqr-heart-3d.png',plus:'issue-2040-oneqr-ticket-3d.png',ticket:'issue-2040-oneqr-ticket-3d.png',scan:'issue-2040-oneqr-scan-line-3d.png',chart:'issue-2040-oneqr-layout-dashboard-3d.png',tools:'issue-2040-oneqr-settings-3d.png'};
  const icon = name => `<img src="${new URL('../icon-oneqr/'+(ART[name]||ART.ticket),BASE).href}" alt="">`;

  function mount(adapter) {
    const feed = document.getElementById('feedView');
    if (!feed) return null;
    const anchor = document.createComment('Community feed position');
    feed.before(anchor);
    const root = document.createElement('section');
    root.id='communityDealsView';root.hidden=true;root.setAttribute('translate','no');root.setAttribute('data-community-authored','');
    const tabs=['nearby','industry','match','opening','wallet'];
    const tabButton = (key,main=false) => `<button type="button" class="community-deals-tab" data-deal-route="${key}" ${main?'role="tab" aria-selected="false" aria-controls="communityDealsStage"':'aria-pressed="false"'}>${icon(ROUTES[key].icon)}<span>${ROUTES[key].label}</span></button>`;
    root.innerHTML=`<div class="community-deals-nav"><nav class="community-deals-nav-tabs" role="tablist" aria-label="Deals &amp; Coupons">${tabs.map(key=>tabButton(key,true)).join('')}</nav><div class="community-deals-actions">${adapter.role==='owner'?`<button type="button" class="btn primary community-deals-post" data-deal-route="create" aria-pressed="false">${icon('plus')}<span>${ROUTES.create.label}</span></button>`:'<button type="button" class="btn primary community-deals-post" data-template="deal">＋ Post an offer</button>'}</div></div><div class="community-deals-stage" id="communityDealsStage" role="tabpanel"><div class="community-deals-context-actions" hidden></div><div class="community-deals-frames"></div></div>`;
    anchor.before(root);
    const frames=new Map(), frameHost=root.querySelector('.community-deals-frames');
    const initial=new URLSearchParams(location.search).get('dealTab');
    let pageScope=new URLSearchParams(location.search).get('couponPageId')||'';let selected=ROUTES[initial]?initial:ALIASES[initial]||'nearby',active=false,lastOffers='';
    if(ROUTES[selected].business&&adapter.role!=='owner')selected='nearby';
    const messageOrigin=location.protocol==='file:'?'*':location.origin;
    const send=(record,data)=>{if(record.ready)record.frame.contentWindow.postMessage(data,messageOrigin);};
    const mainRoute=name=>({demand:'match',openingBusiness:'opening',manage:'campaign'}[name]||name);
    function updateNavigation(){
      root.querySelectorAll('[data-deal-route]').forEach(button=>{const main=button.getAttribute('role')==='tab',chosen=button.dataset.dealRoute===(main?mainRoute(selected):selected);button.setAttribute(main?'aria-selected':'aria-pressed',String(chosen));});
      const business=root.querySelector('.community-deals-business');
      if(business){business.dataset.active=String(['campaign','redeem'].includes(mainRoute(selected)));business.querySelector('[data-deal-route="campaign"]').setAttribute('aria-pressed',String(mainRoute(selected)==='campaign'));}
      const context=root.querySelector('.community-deals-context-actions');
      const destination=adapter.role==='owner'&&selected==='opening'?'openingBusiness':selected==='openingBusiness'?'opening':null;
      context.hidden=!destination;
      if(destination){const label=destination==='openingBusiness'?'Create opening campaign':destination==='opening'?'Opening soon near you':ROUTES[destination].label;context.innerHTML=`<button type="button" class="community-deals-tab" data-deal-route="${destination}">${icon(ROUTES[destination].icon)}<span>${label}</span></button>`;}
    }
    let controlsQueued=false;
    const controlsObserver=new MutationObserver(()=>{
      if(controlsQueued)return;controlsQueued=true;
      requestAnimationFrame(()=>{controlsQueued=false;controlsObserver.disconnect();
        const api=window.NEXORA_DEAL_SELECTS;
        for(const select of document.querySelectorAll('#dealIndustryFilter,#dealAreaFilter,#templateForm[data-kind="deal"] select'))api?.enhance(select,{industry:select.id==='dealIndustryFilter'||select.name==='industry',placeholder:select.name==='industry'?'Select an industry':'Select'});
        controlsObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
      });
    });
    controlsObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
    function viewport(){
      for(const record of frames.values())if(!record.frame.hidden){const rect=record.frame.getBoundingClientRect();const top=Math.max(16,-rect.top+20),height=Math.max(280,window.innerHeight-Math.max(0,rect.top)-40);send(record,{type:'nexora-deals-viewport',top,height});}
    }
    function sync(force=false){
      const offers=adapter.getOffers().filter(row=>row.kind==='deal').map(row=>({...row,photo:row.photo?new URL(row.photo,location.href).href:''}));
      const signature=JSON.stringify(offers);
      if(!force&&signature===lastOffers)return;
      lastOffers=signature;
      for(const record of frames.values())send(record,{type:'nexora-deals-offers',offers});
    }
    function configure(record){
      const route=ROUTES[selected];
      const role=route.business?'owner':adapter.role==='owner'?'owner':'tech';
      send(record,{type:'nexora-deals-context',member:adapter.member,role,language:localStorage.getItem('nexora-community-language')==='vi'?'vi':'en'});
      send(record,{cmd:'role',role});send(record,{cmd:'consentSync'});
      if(route.view)send(record,{cmd:'view',v:route.view});
      sync(true);send(record,{type:'nexora-deals-page-scope',pageId:pageScope});
      viewport();
    }
    function ensureFrame(name){
      if(frames.has(name))return frames.get(name);
      const frame=window.NEXORA_NATIVE.bind(document.createElement('section'),{owner:window});frame.className='community-deals-frame';frame.title=ROUTES[selected].label;frame.hidden=true;
      const record={frame,ready:false};frames.set(name,record);
      const url=new URL('deals/'+name+'.html?v=20261109-deals-navigation1',BASE);url.searchParams.set('member',adapter.member);url.searchParams.set('role',adapter.role);url.searchParams.set('communityNav','merged');
      frame.src=url.href;frameHost.append(frame);
      frame.addEventListener('load',()=>{record.ready=true;if(active&&ROUTES[selected].module===name)configure(record);});
      return record;
    }
    function render(){
      if(!active)return;
      updateNavigation();
      for(const record of frames.values()){record.frame.hidden=true;send(record,{cmd:'stopTour'});}
      feed.classList.add('hide');const record=ensureFrame(ROUTES[selected].module);record.frame.hidden=false;record.frame.title=ROUTES[selected].label;if(record.ready)configure(record);
      adapter.onModal?.(false);
    }
    function navigate(route,notify=true){
      const next=ALIASES[route]||route;if(!ROUTES[next]||ROUTES[next].business&&adapter.role!=='owner')return;
      selected=next;if(next!=='wallet')pageScope='';
      const business=root.querySelector('.community-deals-business');if(business)business.open=false;
      if(!active)adapter.navigate();
      render();
      if(notify)adapter.onState?.({dealTab:next,couponPageId:pageScope});
    }
    function activate(view){
      active=view==='deals';root.hidden=!active;
      if(active)render();
      else{anchor.after(feed);for(const record of frames.values())send(record,{cmd:'stopTour'});}
    }
    function closeDetail(){for(const record of frames.values())if(!record.frame.hidden)send(record,{type:'nexora-deals-close-modal'});}
    root.addEventListener('click',event=>{const button=event.target.closest('[data-deal-route]');if(button)navigate(button.dataset.dealRoute);});
    document.addEventListener('click',event=>{if(!event.target.closest('.community-deals-business')){const business=root.querySelector('.community-deals-business');if(business)business.open=false;}});
    root.addEventListener('keydown',event=>{
      if(event.key==='Escape'){const business=root.querySelector('.community-deals-business');if(business?.open){business.open=false;business.querySelector('summary').focus();event.preventDefault();return;}}
      const button=event.target.closest('[role="tab"]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const list=[...root.querySelectorAll('[role="tab"]')],index=list.indexOf(button);
      const next=event.key==='Home'?0:event.key==='End'?list.length-1:(index+(event.key==='ArrowRight'?1:-1)+list.length)%list.length;
      list[next].focus();navigate(list[next].dataset.dealRoute);
    });
    document.addEventListener('scroll',viewport,{capture:true,passive:true});
    window.addEventListener('resize',viewport);
    window.addEventListener('message',event=>{
      const entry=[...frames.entries()].find(([,record])=>record.frame.contentWindow===event.source);
      if(!entry||location.protocol!=='file:'&&event.origin!==location.origin)return;
      const [name,record]=entry,data=event.data||{};
      if(data.type==='nexora-deals-ready'){record.ready=true;if(active&&ROUTES[selected].module===name)configure(record);}
      if(data.type==='nexora-deals-height'&&Number.isFinite(data.height)&&record.frame.tagName==='IFRAME')record.frame.style.height=Math.max(650,Math.min(30000,data.height+12))+'px';
      if(data.type==='nexora-deals-page')adapter.openPage?.(data.pageId);
      if(data.type==='nexora-deals-modal'&&active&&!record.frame.hidden){viewport();adapter.onModal?.(Boolean(data.open));}
      if(data.type==='nexora-deals-route'&&active&&!record.frame.hidden){const found=Object.keys(ROUTES).find(key=>ROUTES[key].module===name&&ROUTES[key].view===data.view);if(found&&found!==selected){selected=found;updateNavigation();adapter.onState?.({dealTab:found,couponPageId:pageScope});}}
      if(data.cmd==='needTerms')send(record,{cmd:'consentSync'});
      if(data.cmd==='go')navigate(data.r);
      if(data.type==='nexora-deals-claim-match'){
        const nearby=ensureFrame('nearby');
        navigate('wallet');
        const claim=()=>send(nearby,{type:'nexora-deals-match-coupon',offer:data.offer});
        if(nearby.ready)claim();else nearby.frame.addEventListener('load',claim,{once:true});
      }
    });
    function scopePage(pageId){pageScope=pageId||'';for(const record of frames.values())send(record,{type:'nexora-deals-page-scope',pageId:pageScope});}
    function claim(sourceId,pageId){scopePage(pageId);navigate('wallet');const record=ensureFrame('nearby');const run=()=>{sync(true);send(record,{type:'nexora-deals-page-claim',sourceId,pageId});};if(record.ready)run();else record.frame.addEventListener('load',run,{once:true});}
    // Deep link (?tab=deals): the page may enter Deals before this module mounts, so catch up on mount and on later class changes.
    const catchUp=()=>{if(feed.classList.contains('deal-mode')&&!active)activate('deals');};
    catchUp();new MutationObserver(catchUp).observe(feed,{attributes:true,attributeFilter:['class']});
    return {activate,navigate,sync,closeDetail,claim,scopePage};
  }
  window.NEXORA_COMMUNITY_DEALS={mount};
})();
