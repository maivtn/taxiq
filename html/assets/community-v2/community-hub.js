/* Native Community navigation; PO content documents remain isolated peers. */
(() => {
  'use strict';
  const BASE_URL=new URL('./',document.currentScript.src);
  async function read(url){const response=await fetch(url);if(!response.ok)throw new Error('Unable to load Community: '+response.status+' '+url);return response.text();}
  function scopedCSS(css,url){
    return css.replace(/(?<![\w.-])body\.embedded/g,':host').replace(/:root\b|(?<![\w.-])(?:body|html)(?![\w-])/g,':host')
      .replace(/@media\s*\(\s*(max|min)-width\s*:\s*(\d+)px\s*\)/g,'@container community ($1-width: $2px)')
      .replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,quote,value)=>/^(?:data:|https?:|#)/.test(value)?all:'url("'+new URL(value,url).href+'")');
  }
  async function mount(host,options={}){
    if(host.communityHub)return host.communityHub;
    const url=new URL('nexora-community-complete.html?v=20261030-profile-share-single-action-v49',BASE_URL);
    const parsed=new DOMParser().parseFromString(await read(url),'text/html');
    const styles=await Promise.all([...parsed.head.querySelectorAll('style,link[rel="stylesheet"]')].map(async node=>{const source=node.tagName==='STYLE'?url:new URL(node.getAttribute('href'),url);return scopedCSS(node.tagName==='STYLE'?node.textContent:await read(source),source);}));
    parsed.body.querySelectorAll('script').forEach(node=>node.remove());
    parsed.body.querySelectorAll('[src],[href],[data-src]').forEach(node=>{for(const attribute of ['src','href','data-src']){const value=node.getAttribute(attribute);if(value&&!value.startsWith('#'))node.setAttribute(attribute,new URL(value,url).href);}});
    const root=host.attachShadow({mode:'open'});
    const style=document.createElement('style');
    style.textContent=styles.join('\n')+`\n:host{position:relative;display:block;height:100%;min-height:0;overflow:hidden;isolation:isolate;container:community / inline-size;} :host .app,:host .main{height:100%;min-height:0;} :host .tour-card{position:absolute;top:clamp(160px,23%,220px);} :host .tour-card.menu-step{top:auto;} @container community (max-width:800px){:host .app{--community-gutter:16px;} :host .tour-card,:host .tour-card.menu-step{top:auto;}}`;
    root.append(style,...parsed.body.childNodes);
    host.communityHub=start(root,{...options,native:true});
    return host.communityHub;
  }
  function start(root,context={}){

      const isCompact=()=>context.native?root.host.clientWidth<=800:matchMedia('(max-width:800px)').matches;
      const nativeApp=root.querySelector('.app');
      const artwork={feed:'feed.webp',market:'groups.svg',groups:'groups.svg',pages:'pages.svg',deals:'deals.svg',jobs:'jobs.svg',daywork:'calendar.svg',blog:'blog.svg',connect:'messages.svg'};
      root.querySelectorAll('.tab[data-view]').forEach(button=>{const file=artwork[button.dataset.view],previous=button.querySelector('svg');if(!file||!previous)return;const image=document.createElement('img');image.className='community-nav-art';image.src=new URL('nav-icons/'+file,BASE_URL).href;image.alt='';image.setAttribute('aria-hidden','true');image.width=image.height=28;image.draggable=false;previous.replaceWith(image);});

      const community=root.getElementById('communityPane'),connect=root.getElementById('connectPane');
      const messageOrigin=location.protocol==='file:'?'*':location.origin;
      const sendToFrame=(frame,data)=>frame.contentWindow.postMessage(data,messageOrigin);
      const tabs=[...root.querySelectorAll('.tab')];
      const notificationsButton=root.getElementById('notificationsButton'),notificationsMenu=root.getElementById('notificationsMenu');
      const languageButton=root.getElementById('languageButton'),languageMenu=root.getElementById('languageMenu');
      const translations={
        vi:{subtitle:'Chia sẻ, hỏi đáp và giao thương cùng cộng đồng',notifications:'Thông báo',newMessage:'Tin nhắn đầu tiên mới',messagePreview:'Mai Nguyễn hỏi về ghế màu trắng',view:'Xem',noNotifications:'Chưa có thông báo mới.',language:'Ngôn ngữ',back:'← Quay lại',feed:'Bảng tin',market:'Nhóm & Chợ',groups:'Nhóm',buySell:'Mua bán',pages:'Fanpage',jobs:'Việc làm',jobsGroup:'VIỆC LÀM',daywork:'Ca làm thêm',deals:'Deal & Coupon',mobileDeals:'Deal',dealsGroup:'DEAL & COUPON',nearbyDeals:'Deal gần bạn',connectGroup:'KẾT NỐI',connect:'Tin nhắn & Cuộc gọi',mobileConnect:'Tin nhắn & Gọi',workspace:'Không gian làm việc',community:'Cộng đồng',businessSetting:'Cài đặt doanh nghiệp',businessVerification:'Xác minh doanh nghiệp',certifications:'Chứng nhận của tôi',sidebarLanguage:'Ngôn ngữ: Tiếng Việt',home:'Trang chủ',dashboard:'Tổng quan',payments:'Thanh toán & Chi trả',reviews:'Đánh giá',giftCards:'Trung tâm thẻ quà tặng',analytics:'Phân tích',settings:'Cài đặt',news:'Tin tức & Thư viện',support:'Hỗ trợ',noPlan:'Chưa có gói',manage:'Quản lý',signout:'Đăng xuất',collapse:'Thu gọn menu',search:'Tìm nhân viên, đánh giá hoặc mẹo...',account:'Tài khoản',ecosystem:'Ứng dụng NEXORA'},
        en:{subtitle:'Share, ask and trade with people in your trade',notifications:'Notifications',newMessage:'New message request',messagePreview:'Mai Nguyễn asked about the white chairs',view:'View',noNotifications:'No new notifications.',language:'Language',back:'← Back',feed:'Feed',market:'Groups & Market',groups:'Groups',buySell:'Buy & sell',pages:'Pages',jobs:'Jobs',jobsGroup:'JOBS',daywork:'Extra shifts',deals:'Deal & Coupon',mobileDeals:'Deal',dealsGroup:'DEAL & COUPON',nearbyDeals:'Nearby deals',connectGroup:'CONNECT',connect:'Messages & Calls',mobileConnect:'Messages',workspace:'Workspace',community:'Community',businessSetting:'Setting',businessVerification:'Business Verification',certifications:'My Certifications',sidebarLanguage:'Language: English',home:'Home',dashboard:'Dashboard',payments:'Payments & Payouts',reviews:'Reviews',giftCards:'Gift Card Center',analytics:'Analytics',settings:'Settings',news:'News & Library',support:'Support',noPlan:'No Plan yet',manage:'Manage',signout:'Sign out',collapse:'Collapse menu',search:'Search staff, reviews, or tips...',account:'Account menu',ecosystem:'NEXORA apps'}
      };
      let language='en';localStorage.setItem('nexora-community-language','en');
      const ecosystemButton=root.getElementById('ecosystemButton'),ecosystemMenu=root.getElementById('ecosystemMenu'),app=root.querySelector('.app');
      function closeMenus(){notificationsMenu.hidden=true;languageMenu.hidden=true;ecosystemMenu.hidden=true;root.querySelectorAll('.tab-sub-toggle').forEach(toggle=>{toggle.setAttribute('aria-expanded','false');root.getElementById(toggle.getAttribute('aria-controls')).hidden=true;});notificationsButton.setAttribute('aria-expanded','false');languageButton.setAttribute('aria-expanded','false');ecosystemButton.setAttribute('aria-expanded','false');}
      function applyLanguage(){const labels=translations[language];(root.host||document.documentElement).lang=language;if(!context.native)document.title='NEXORA Community';community.title=language==='vi'?'Bảng tin, Nhóm, Chợ, Fanpage, Ưu đãi, Việc làm và Blog':'Feed, Groups, Market, Pages, Deals, Jobs and Blog';connect.title=language==='vi'?'Tin nhắn, cuộc gọi, nhóm chat và cài đặt':'Messages, calls, group chats and settings';root.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=labels[el.dataset.i18n]||el.textContent;});root.getElementById('languageCode').textContent=language.toUpperCase();for(const [id,label] of [['notificationsButton',labels.notifications],['messagesButton',labels.connect],['languageButton',labels.language],['accountButton',labels.account],['ecosystemButton',labels.ecosystem],['sidebarToggle',labels.collapse]]){const el=root.getElementById(id);el.setAttribute('aria-label',label);el.title=label;}const search=root.getElementById('globalSearch');search.placeholder=labels.search;search.setAttribute('aria-label',labels.search);notificationsMenu.setAttribute('aria-label',labels.notifications);languageMenu.setAttribute('aria-label',labels.language);ecosystemMenu.setAttribute('aria-label',labels.ecosystem);root.querySelector('[aria-controls="marketSubmenu"]').setAttribute('aria-label',language==='vi'?'Mở các mục Nhóm & Chợ':'Open Groups & Market sections');root.querySelector('[aria-controls="jobsSubmenu"]').setAttribute('aria-label',language==='vi'?'Mở các mục Việc làm':'Open Jobs sections');root.querySelector('[role="radiogroup"]').setAttribute('aria-label',language==='vi'?'Ngôn ngữ giao diện':'Interface language');root.querySelector('.workspace').setAttribute('aria-label',language==='vi'?'Nội dung Community':'Community content');root.querySelector('.sidebar').setAttribute('aria-label',language==='vi'?'Không gian làm việc':'Workspace');root.querySelector('.tabs').setAttribute('aria-label',language==='vi'?'Các mục Community':'Community sections');root.querySelector('.mobile-nav').setAttribute('aria-label',language==='vi'?'Điều hướng Community':'Community navigation');root.querySelector('[data-language="vi"]')?.remove();root.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-checked',String(el.dataset.language===language)));if(communityLoaded)sendToFrame(community,{type:'nexora-language',language});if(connectLoaded)sendToFrame(connect,{type:'nexora-language',language});updateMobileHeading();updateTourCopy();}
      const params=context.params||new URLSearchParams(location.search);
      const initialRoute=params.get('tab')||params.get('view')||'feed';const initialContext={profile:['jobsTab','profile'],'jobs-my-posts':['jobsTab','myPosts'],'jobs-applied':['jobsTab','applied'],'shift-payments':['shiftTab','payments']}[initialRoute];if(initialContext&&!params.has(initialContext[0]))params.set(initialContext[0],initialContext[1]);
      const viewForRoute=route=>({profile:'jobs','jobs-my-posts':'jobs','jobs-applied':'jobs','shift-payments':'daywork',mkt:'market',shift:'daywork',shifts:'daywork',chatgroups:'connect',calls:'connect',privacy:'connect'}[route]||route);
      const sectionForRoute=route=>({chatgroups:'groups',calls:'calls',privacy:'privacy'}[route]||'messages');
      const hosted=Boolean(context.native)||window.parent!==window;
      const notifyHost=data=>{
        if(context.notify){context.notify(data);return;}
        if(hosted){window.parent.postMessage(data,messageOrigin);return;}
        if(!['nexora-community-page-navigate','nexora-community-page-state'].includes(data.type))return;
        const url=new URL(location.href);url.searchParams.set('view','pages');url.searchParams.set('tab','pages');
        if(data.type!=='nexora-community-page-state')for(const key of ['post','postId','comment','commentId','thread','threadId','groupId','jobsTab','jobId','profileRequired','shiftTab','shiftId','assignmentId','settlementId','invitationId'])url.searchParams.delete(key);
        for(const key of ['pageId','pageMode','pageTab','pageScope']){if(data[key])url.searchParams.set(key,data[key]);else url.searchParams.delete(key);}
        if(data.type==='nexora-community-page-state')history.replaceState(history.state,'',url);
        else if(data.replace)location.replace(url);else location.assign(url);
      };
      const currentRoute=()=>view==='connect'?({groups:'chatgroups',calls:'calls',privacy:'privacy'}[connectSection]||'connect'):view==='daywork'?'shift':view;
      const notifyHostRoute=replace=>notifyHost({type:'nexora-community-route',route:currentRoute(),replace});
      let lastHostDetail=false,pendingContact=null,pendingGroup=null,pendingRequest=false,pendingContext=null;
      function notifyHostDetail(force=false){const open=view==='connect'?(connectDetailOpen||connectDialogOpen):communityModalOpen;if(force||open!==lastHostDetail){lastHostDetail=open;notifyHost({type:'nexora-community-detail',open});}}
      let view=viewForRoute(initialRoute);
      if(!['feed','groups','market','pages','jobs','daywork','deals','blog','connect'].includes(view))view='feed';
      let communityLoaded=false,connectLoaded=false,connectSection=sectionForRoute(initialRoute),pendingCommunityView=view==='connect'?null:view;
      let connectDetailOpen=false,connectDialogOpen=false,communityModalOpen=false;
      function updateDetailState(){const detailOpen=view==='connect'?(connectDetailOpen||connectDialogOpen):communityModalOpen;app.classList.toggle('detail-open',detailOpen);root.querySelector('.mobile-nav').hidden=detailOpen;}
      function notifyRequest(){let pending=true;try{const saved=JSON.parse(localStorage.getItem('nexora-connect-preview-v2'));if(saved&&saved.request)pending=saved.request==='pending';}catch{}root.getElementById('requestBadge').hidden=!pending;root.getElementById('notificationItem').hidden=!pending;root.getElementById('notificationEmpty').hidden=pending;}
      function updateMobileHeading(){const heading=root.querySelector('.community-heading h1');const name=({feed:translations[language].community,groups:translations[language].groups,market:translations[language].groups,pages:translations[language].pages,jobs:translations[language].jobs,daywork:translations[language].daywork,deals:translations[language].deals,blog:'Blog',connect:translations[language].mobileConnect})[view]||translations[language].community;heading.textContent=isCompact()?name:translations[language].community;}
      function setView(next,push=true,fromChild=false){if(push&&params.get('pageId')&&next==='pages'&&view==='pages'&&!fromChild){notifyHost({type:'nexora-community-page-navigate',pageScope:params.get('pageScope')||'discover'});return;}if(next!=='pages'){if(params.get('pageId')&&communityLoaded)sendToFrame(community,{type:'nexora-page-screen-deactivate'});for(const key of ['pageId','pageMode','pageTab'])params.delete(key);}closeMenus();app.classList.remove('nav-open');if(communityModalOpen&&view!==next){communityModalOpen=false;root.querySelector('.mobile-nav').hidden=false;}view=next;const isConnect=next==='connect';ensurePane(isConnect?connect:community);if(!isConnect)connectDetailOpen=false;community.hidden=isConnect;connect.hidden=!isConnect;tabs.forEach(tab=>{const active=tab.dataset.view===(tab.classList.contains('mobile-tab')?({groups:'market',daywork:'jobs'}[next]||next):({groups:'market',daywork:'jobs'}[next]||next));tab.classList.toggle('active',active);tab.setAttribute('aria-current',active?'page':'false');tab.hidden=tab.classList.contains('mobile-tab')&&active;});root.querySelector('.mobile-nav').style.setProperty('--community-nav-count',String(tabs.filter(tab=>tab.classList.contains('mobile-tab')&&!tab.hidden).length||1));root.querySelectorAll('[data-side-view]').forEach(el=>el.classList.toggle('active',el.dataset.sideView===(['groups'].includes(next)?'market':next)));root.querySelectorAll('[data-top-sub-view]').forEach(el=>{const active=el.dataset.topSubView===next;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'page':'false');});if(!isConnect&&!fromChild){pendingCommunityView=next;if(communityLoaded)sendToFrame(community,{type:'nexora-open-view',view:next});}if(isConnect&&connectLoaded)sendToFrame(connect,{type:'nexora-open-section',section:connectSection});if(push&&!context.native&&location.protocol!=='file:')(()=>{const url=new URL(location.href);url.searchParams.set('view',next);url.searchParams.set('tab',currentRoute());history.replaceState(null,'',url);})();updateDetailState();updateMobileHeading();notifyHostRoute(!push);notifyHostDetail();}
      const tourSteps=[
        {view:'feed',label:{vi:'Bảng tin',en:'Feed'},copy:{vi:'Xem tin mới và đăng chia sẻ, ảnh, câu hỏi hoặc mẹo nghề.',en:'See new posts and share updates, photos, questions, or tips.'}},
        {view:'market',label:{vi:'Nhóm & Chợ',en:'Groups & Market'},copy:{vi:'Vào nhóm để trao đổi; ở Mua bán, đăng Cần bán hoặc Cần mua miễn phí và nhắn tin trực tiếp.',en:'Join groups to talk. In Buy & sell, post items for sale or wanted for free, then message directly.'}},
        {view:'deals',label:{vi:'Deal & Coupon',en:'Deals & Coupons'},copy:{vi:'Xem ưu đãi gần bạn, lấy mã và kiểm tra hạn dùng ngay trong mục này.',en:'Find nearby offers, get a code, and check its expiry here.'}},
        {view:'jobs',label:{vi:'Việc làm',en:'Jobs'},copy:{vi:'Đăng tuyển hoặc tìm việc dài hạn. Muốn làm trong ngày, mở Ca làm thêm từ mục Việc làm.',en:'Hire or find ongoing work. Open Extra shifts in Jobs for same-day work.'}},
        {view:'connect',label:{vi:'Tin nhắn & Gọi',en:'Messages & Calls'},copy:{vi:'Tìm người, nhắn tin, xem yêu cầu tin nhắn đầu tiên và gọi thoại hoặc video.',en:'Find people, message them, review first-message requests, or place voice and video calls.'}},
        {view:'feed',menu:true,label:{vi:'Các mục khác',en:'More sections'},copy:{vi:'Menu ứng dụng còn có Fanpage, Blog và Ca làm thêm. Bạn luôn có thể mở lại AI Tour ở đây hoặc cạnh tên Community.',en:'The app menu also has Pages, Blog, and Extra shifts. Reopen AI Tour here or beside the Community heading.'}}
      ];
      const tourCard=root.getElementById('tourCard');
      const tourState={active:false,index:0,playing:false,timer:0,startedAt:0,remaining:5200,origin:'feed'};
      const tourSeenKey=()=>isCompact()?'nexora-community-tour-mobile-v1':'nexora-community-tour-desktop-v1';
      const tourTarget=()=>{const target=root.querySelector(tourSteps[tourState.index].menu?'#startTour':isCompact()?`.mobile-nav [data-view="${tourSteps[tourState.index].view}"]`:`.top .tabs [data-view="${tourSteps[tourState.index].view}"]`);return target?.closest('[hidden]')?root.querySelector('.community-heading'):target;};
      function clearTourTimer(){if(tourState.timer)clearTimeout(tourState.timer);tourState.timer=0;}
      function tourLabels(){return language==='vi'?{back:'Trước',pause:'Tạm dừng',resume:'Tiếp tục',skip:'Bỏ qua',next:'Tiếp',finish:'Xong',launch:'Mở AI Tour'}:{back:'Back',pause:'Pause',resume:'Resume',skip:'Skip',next:'Next',finish:'Done',launch:'Open AI Tour'};}
      const tourIcons={back:'m12 19-7-7 7-7M5 12h14',pause:'M10 4H6v16h4ZM18 4h-4v16h4Z',play:'m8 5 11 7-11 7Z',skip:'M19 5v14M5 4l10 8-10 8Z',next:'m12 5 7 7-7 7M5 12h14',check:'m20 6-11 11-5-5'};
      function setTourButton(id,label,icon){const button=root.getElementById(id);button.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${tourIcons[icon]}"/></svg><span></span>`;button.lastElementChild.textContent=label;button.dataset.tourIcon=icon;}
      function updateTourCopy(){const labels=tourLabels(),step=tourSteps[tourState.index];root.getElementById('startTour').setAttribute('aria-label',labels.launch);root.getElementById('menuStartTour').textContent='✦ AI Tour';if(!tourState.active)return;root.getElementById('tourTitle').textContent=step.label[language];root.getElementById('tourDescription').textContent=step.copy[language];setTourButton('tourBack',labels.back,'back');root.getElementById('tourBack').disabled=tourState.index===0;setTourButton('tourPause',tourState.playing?labels.pause:labels.resume,tourState.playing?'pause':'play');setTourButton('tourSkip',labels.skip,'skip');const last=tourState.index===tourSteps.length-1;setTourButton('tourNext',last?labels.finish:labels.next,last?'check':'next');}
      function scheduleTour(){clearTourTimer();if(!tourState.active||!tourState.playing)return;tourState.startedAt=Date.now();tourState.timer=setTimeout(()=>{if(tourState.index===tourSteps.length-1)stopTour(true);else showTourStep(tourState.index+1);},tourState.remaining);}
      function showTourStep(index){if(!tourState.active)return;clearTourTimer();tourState.index=index;tourState.remaining=5200;root.querySelectorAll('.tour-target').forEach(el=>el.classList.remove('tour-target'));const step=tourSteps[index];tourCard.classList.toggle('menu-step',Boolean(step.menu));if(step.menu){setView('feed',false);}else setView(step.view,false);tourTarget()?.classList.add('tour-target');tourCard.hidden=false;tourCard.classList.remove('is-playing','is-paused');void tourCard.offsetWidth;if(tourState.playing)tourCard.classList.add('is-playing');updateTourCopy();scheduleTour();}
      function startTour(){if(tourState.active)stopTour(false);tourState.origin=view;tourState.active=true;tourState.playing=!matchMedia('(prefers-reduced-motion:reduce)').matches;localStorage.setItem(tourSeenKey(),'1');showTourStep(0);}
      function stopTour(restore){if(!tourState.active)return;clearTourTimer();tourState.active=false;tourCard.hidden=true;tourCard.classList.remove('is-playing','is-paused');root.querySelectorAll('.tour-target').forEach(el=>el.classList.remove('tour-target'));closeMenus();if(restore){setView(tourState.origin,false);root.getElementById('startTour').focus({preventScroll:true});}}
      root.getElementById('startTour').addEventListener('click',startTour);
      root.getElementById('menuStartTour').addEventListener('click',startTour);
      root.getElementById('tourBack').addEventListener('click',()=>{if(tourState.index>0)showTourStep(tourState.index-1);});
      root.getElementById('tourNext').addEventListener('click',()=>{if(tourState.index===tourSteps.length-1)stopTour(true);else showTourStep(tourState.index+1);});
      root.getElementById('tourSkip').addEventListener('click',()=>stopTour(true));
      root.getElementById('tourPause').addEventListener('click',()=>{if(tourState.playing){tourState.remaining=Math.max(100, tourState.remaining-(Date.now()-tourState.startedAt));tourState.playing=false;clearTourTimer();tourCard.classList.add('is-paused');}else{tourState.playing=true;tourCard.classList.remove('is-paused');if(!tourCard.classList.contains('is-playing'))tourCard.classList.add('is-playing');scheduleTour();}updateTourCopy();});
      root.addEventListener('click',event=>{if(tourState.active&&!event.target.closest('#tourCard,#startTour,#menuStartTour'))stopTour(false);},true);
      tabs.forEach(tab=>tab.addEventListener('click',()=>{if(tab.dataset.view==='connect')connectSection='messages';setView(tab.dataset.view);}));
      root.querySelectorAll('[data-top-sub-view]').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.topSubView)));
      root.querySelectorAll('.tab-sub-toggle').forEach(toggle=>toggle.addEventListener('click',()=>{const menu=root.getElementById(toggle.getAttribute('aria-controls')),open=menu.hidden;closeMenus();menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));}));
      root.getElementById('communityBack').addEventListener('click',()=>{stopTour(false);closeMenus();if(hosted)notifyHost({type:'nexora-community-history-back'});else if(history.length>1&&document.referrer)history.back();else setView('feed',false);});
      root.getElementById('languageBack').addEventListener('click',()=>{closeMenus();languageButton.focus();});
      root.querySelectorAll('[data-side-view],[data-quick-view]').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.sideView||el.dataset.quickView)));
      root.getElementById('sidebarToggle').addEventListener('click',()=>{if(isCompact()){app.classList.toggle('nav-open');}else{app.classList.toggle('sidebar-collapsed');}root.getElementById('sidebarToggle').setAttribute('aria-expanded',String(app.classList.contains('nav-open')||!app.classList.contains('sidebar-collapsed')));});
      root.getElementById('messagesButton').addEventListener('click',()=>{connectSection='messages';setView('connect');});
      root.getElementById('accountButton').addEventListener('click',()=>{connectSection='privacy';setView('connect');});
      root.getElementById('globalSearch').addEventListener('keydown',event=>{if(event.key==='Enter'&&event.currentTarget.value.trim()){connectSection='messages';setView('connect');const query=event.currentTarget.value.trim();const fill=()=>{const input=connect.contentDocument?.getElementById('memberQuery');if(input){input.value=query;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}};if(connectLoaded)fill();else connect.addEventListener('load',fill,{once:true});}});
      community.addEventListener('load',()=>{sendToFrame(community,{type:'nexora-language',language});});
      connect.addEventListener('load',()=>{if(!connect.hasAttribute('src')||connect.contentDocument?.location.href==='about:blank')return;connectLoaded=true;sendToFrame(connect,{type:'nexora-language',language});notifyRequest();if(view==='connect'){sendToFrame(connect,{type:'nexora-open-section',section:connectSection});if(pendingContact){sendToFrame(connect,{type:'nexora-open-contact',contact:pendingContact});pendingContact=null;}if(pendingGroup){sendToFrame(connect,{type:'nexora-open-community-group',group:pendingGroup});pendingGroup=null;}if(pendingRequest){sendToFrame(connect,{type:'nexora-open-request'});pendingRequest=false;}}});
      window.addEventListener('message',event=>{
        if(event.source!==community.contentWindow||(location.protocol!=='file:'&&event.origin!==location.origin)||event.data?.type!=='nexora-prototype-ready')return;
        communityLoaded=true;sendToFrame(community,{type:'nexora-language',language});
        if(view!=='connect'){pendingCommunityView=view;sendToFrame(community,{type:'nexora-open-view',view});if(pendingContext){sendToFrame(community,{type:'nexora-community-context',context:pendingContext});pendingContext=null;}}
      });
      window.addEventListener('message',event=>{if(event.source!==community.contentWindow&&event.source!==connect.contentWindow)return;if(location.protocol!=='file:'&&event.origin!==location.origin)return;if(event.source===community.contentWindow&&event.data?.type==='nexora-modal-state'){communityModalOpen=Boolean(event.data.open);root.querySelector('.mobile-nav').hidden=communityModalOpen&&view!=='connect';updateDetailState();notifyHostDetail();}if(communityLoaded&&!community.hidden&&event.source===community.contentWindow&&event.data?.type==='nexora-prototype-view'){const next=event.data.view;if(!['feed','groups','market','pages','jobs','daywork','deals','blog'].includes(next))return;if(pendingCommunityView){if(next!==pendingCommunityView)return;pendingCommunityView=null;}if(view!==next)setView(next,true,true);}if(event.source===connect.contentWindow&&event.data?.type==='nexora-connect-back-community'){setView('feed');return;}if(event.source===connect.contentWindow&&event.data?.type==='nexora-connect-section'){connectSection=event.data.section;if(view==='connect')notifyHostRoute(false);}if(event.source===connect.contentWindow&&event.data?.type==='nexora-connect-dialog'){connectDialogOpen=Boolean(event.data.open);notifyHostDetail(!connectDialogOpen);updateDetailState();}if(event.source===connect.contentWindow&&event.data?.type==='nexora-connect-detail'){connectDetailOpen=Boolean(event.data.open);notifyHostDetail(Boolean(event.data.force));updateDetailState();}notifyRequest();});
      window.addEventListener('message',event=>{
        if(location.protocol!=='file:'&&event.origin!==location.origin)return;
        if(event.source===community.contentWindow&&event.data?.type==='nexora-feed-post-close'){notifyHost({type:'nexora-feed-post-close'});return;}
        if(event.source===community.contentWindow&&['nexora-community-page-navigate','nexora-community-page-state'].includes(event.data?.type)){if(event.data.type==='nexora-community-page-state')for(const key of ['pageId','pageMode','pageTab','pageScope']){if(event.data[key])params.set(key,event.data[key]);else params.delete(key);}notifyHost(event.data);return;}
        if(event.source===community.contentWindow&&event.data?.type==='nexora-community-context'){notifyHost(event.data);return;}
        if(event.source===community.contentWindow&&event.data?.type==='nexora-community-pos'){notifyHost(event.data);return;}
        if(event.source===community.contentWindow&&event.data?.type==='nexora-open-community-group'){pendingGroup=event.data.group;connectSection='groups';setView('connect');if(connectLoaded){sendToFrame(connect,{type:'nexora-open-community-group',group:pendingGroup});pendingGroup=null;}return;}
        if(event.source===community.contentWindow&&event.data?.type==='nexora-community-contact'){
          pendingContact=event.data.contact;connectSection='messages';setView('connect');
          if(connectLoaded){sendToFrame(connect,{type:'nexora-open-contact',contact:pendingContact});pendingContact=null;}
          return;
        }
        if(context.native||event.source!==window.parent)return;
        receiveHost(event.data);
      });
      window.addEventListener('storage',notifyRequest);
      notificationsButton.addEventListener('click',()=>{const open=notificationsMenu.hidden;closeMenus();notificationsMenu.hidden=!open;notificationsButton.setAttribute('aria-expanded',String(open));});
      languageButton.addEventListener('click',()=>{const open=languageMenu.hidden;closeMenus();languageMenu.hidden=!open;languageButton.setAttribute('aria-expanded',String(open));});
      ecosystemButton.addEventListener('click',()=>{const open=ecosystemMenu.hidden;closeMenus();ecosystemMenu.hidden=!open;ecosystemButton.setAttribute('aria-expanded',String(open));});
      root.querySelector('[data-language="vi"]')?.remove();root.querySelectorAll('[data-language]').forEach(el=>el.addEventListener('click',()=>{language='en';localStorage.setItem('nexora-community-language',language);applyLanguage();updateDetailState();closeMenus();}));
      root.addEventListener('click',event=>{if(!event.target.closest('#notificationsButton,#notificationsMenu,#languageButton,#languageMenu,#ecosystemButton,#ecosystemMenu,.tab-group,#tourCard'))closeMenus();if(app.classList.contains('nav-open')&&!event.target.closest('.sidebar,#sidebarToggle'))app.classList.remove('nav-open');});
      root.addEventListener('keydown',event=>{if(event.key==='Escape'){if(tourState.active){stopTour(true);return;}closeMenus();app.classList.remove('nav-open');}});
      root.getElementById('viewNotification').addEventListener('click',()=>{pendingRequest=true;connectSection='messages';setView('connect');if(connectLoaded){sendToFrame(connect,{type:'nexora-open-request'});pendingRequest=false;}});
      window.addEventListener('resize',()=>{updateMobileHeading();if(tourState.active){root.querySelectorAll('.tour-target').forEach(el=>el.classList.remove('tour-target'));tourTarget()?.classList.add('tour-target');}});

      function syncPaneGutter(){const frame=view==='connect'?connect:community;const element=frame.contentDocument?.documentElement;if(element)nativeApp.style.setProperty('--community-scrollbar-width',Math.max(0,frame.clientWidth-element.clientWidth)+'px');}
      function ensurePane(frame){if(!frame.hasAttribute('src'))frame.src=(frame===community?communitySource:connectSource).href;requestAnimationFrame(syncPaneGutter);}
      function receiveHost(data){
        if(data?.type==='nexora-community-language'){
          language='en';localStorage.setItem('nexora-community-language',language);applyLanguage();updateDetailState();
        }
        if(data?.type==='nexora-community-navigate'){
          stopTour(false);const next=viewForRoute(data.route),section=sectionForRoute(data.route);
          if(data.context)pendingContext=data.context;if(next===view&&(next!=='connect'||section===connectSection)){if(communityLoaded&&pendingContext){sendToFrame(community,{type:'nexora-community-context',context:pendingContext});pendingContext=null;}return;}
          connectSection=section;setView(next,false);if(communityLoaded&&pendingContext&&next!=='connect'){sendToFrame(community,{type:'nexora-community-context',context:pendingContext});pendingContext=null;}
        }
        if(data?.type==='nexora-community-close-detail'){
          if(view==='connect')sendToFrame(connect,{type:'nexora-back'});
          else sendToFrame(community,{type:'nexora-close-modal'});
        }
      }
      for(const frame of [community,connect])frame.addEventListener('load',()=>{const element=frame.contentDocument?.documentElement;if(element&&window.ResizeObserver)new ResizeObserver(syncPaneGutter).observe(element);syncPaneGutter();});
      if(context.native&&window.ResizeObserver)new ResizeObserver(()=>{updateMobileHeading();syncPaneGutter();if(tourState.active){root.querySelectorAll('.tour-target').forEach(el=>el.classList.remove('tour-target'));tourTarget()?.classList.add('tour-target');}}).observe(root.host);
      const communitySource=new URL(community.dataset.src,BASE_URL);
      for(const key of ['member','role','account','post','postId','comment','commentId','thread','threadId','groupId','jobsTab','jobId','profileRequired','shiftTab','shiftId','assignmentId','settlementId','invitationId','pageId','pageMode','pageTab','pageScope'])if(params.get(key))communitySource.searchParams.set(key,params.get(key));
      const connectSource=new URL(connect.dataset.src,BASE_URL);
      connectSource.searchParams.set('section',connectSection);for(const key of ['member','role','account'])if(params.get(key))connectSource.searchParams.set(key,params.get(key));
      ensurePane(view==='connect'?connect:community);
      applyLanguage();notifyRequest();setView(view,false);notifyHost({type:'nexora-community-ready'});if(!localStorage.getItem(tourSeenKey()))setTimeout(()=>{if(!tourState.active&&!communityModalOpen)startTour();},800);
      return {navigate:(route,routeContext)=>receiveHost({type:'nexora-community-navigate',route,context:routeContext}),setLanguage:language=>receiveHost({type:'nexora-community-language',language}),closeDetail:()=>receiveHost({type:'nexora-community-close-detail'})};
  }
  window.NEXORA_COMMUNITY_HUB={mount,start};
  if(document.getElementById('communityPane')&&document.getElementById('connectPane'))start(document);
})();
