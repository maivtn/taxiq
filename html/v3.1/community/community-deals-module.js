/* Bridges the retained PO interactions to the current Community workspace. */
(() => {
  'use strict';
  const module=document.body.dataset.module;
  const filterIcon='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal" aria-hidden="true"><path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/></svg>';
  const origin=location.protocol==='file:'?'*':location.origin;
  const notify=data=>window.parent.postMessage(data,origin);
  const scope=new URLSearchParams(location.search).get('member')||'community';
  const key='nexora-community-deals-po-v1:'+module+':'+scope;
  let ready=false,renderQueued=false,lastHeight=0,lastModal=false,previousView='',lastSaved='',pendingClaim=null,lastFocus=null;
  const html=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function state(){return typeof S==='object'?S:null;}
  function save(){
    const value=state();if(!value||!ready)return;
    try{const json=JSON.stringify(value);if(json!==lastSaved){localStorage.setItem(key,json);lastSaved=json;}}catch{}
  }
  function restore(){
    const current=state();if(!current)return;
    try{const saved=JSON.parse(localStorage.getItem(key),(field,value)=>field==='t'&&typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)?new Date(value):value);if(saved&&typeof saved==='object'&&!Array.isArray(saved)){for(const field of Object.keys(current))if(Object.hasOwn(saved,field)&&typeof saved[field]===typeof current[field])current[field]=saved[field];}}catch{}
  }
  function refresh(){
    if(module==='deals'){if(typeof render==='function')render();}
    else if(module==='match'){if(typeof render==='function')render();}
    else if(typeof draw==='function')draw();
    schedule();
  }
  function measure(){
    const height=Math.ceil(document.body.getBoundingClientRect().height);
    if(Math.abs(height-lastHeight)>2){lastHeight=height;notify({type:'nexora-deals-height',height});}
    const modal=document.getElementById('modal');
    const open=!!modal&&!modal.classList.contains('hidden');
    if(open!==lastModal){lastModal=open;notify({type:'nexora-deals-modal',open});}
    if(typeof view==='string'&&view!==previousView){previousView=view;notify({type:'nexora-deals-route',view});}
  }
  function filters(){
    const api=window.NEXORA_DEAL_SELECTS;if(!api)return;
    if(module==='deals'){
      api.chips('egrp','data-eg','Industry',{industry:true,group:true});
      api.chips('aud','data-aud','For');
      api.chips('radius','data-r','Radius');
      api.chips('openF','data-of','Filter by timing');
      api.chips('tplF','data-tf','Templates');
      api.chips('indGrp','data-ig','Industry group',{industry:true,group:true});
      api.chips('indSub','data-ic','Industry',{industry:true});
      for(const id of ['indQ','indHit'])document.getElementById(id)?.classList.add('deal-filter-source');
      const grid=document.getElementById('catGrid');
      if(grid){
        const current=state();
        api.data('coupon-group','Industry group',grid,[{value:'',text:'All industries'},...GROUPS.map(group=>({value:group.id,text:group.n}))],current.filt.grp,value=>{current.filt.grp=value||null;current.filt.cat=null;render();},{industry:true,group:true});
        const categories=CATS.filter(category=>!current.filt.grp||category.g===current.filt.grp);
        api.data('coupon-industry','Industry',grid,[{value:'',text:'All industries'},...categories.map(category=>({value:category.id,text:category.n}))],current.filt.cat,value=>{current.filt.cat=value||null;render();},{industry:true});
        grid.classList.add('deal-filter-source');
      }
    }
    if(module==='match'){
      api.chips('fGrp','data-grp','Industry group',{industry:true,group:true});
      api.chips('fSvc','data-svc','Industry',{industry:true});
      api.chips('fLoc','data-loc','Area',{buttonsOnly:true});
    }
    if(module==='camp')api.chips('lf','data-lf','Status');
    for(const select of document.querySelectorAll('select:not([id^="deal-select-"])'))api.enhance(select,{industry:['cCat','sInd'].includes(select.id)});
    filterPanels();
  }
  function filterPanels(){
    if(module==='deals'){
      const explore=document.getElementById('mExplore'),search=explore?.querySelector('.searchbar');
      if(explore&&search){
        let button=document.getElementById('nearbyFilterToggle'),panel=document.getElementById('nearbyFilterFields');
        if(!button){
          button=document.createElement('button');button.type='button';button.id='nearbyFilterToggle';button.className='btn ghost deal-filter-toggle';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','nearbyFilterFields');button.innerHTML=filterIcon+'<span>Filters</span><span class="deal-filter-count" hidden></span>';
          panel=document.createElement('div');panel.id='nearbyFilterFields';panel.className='deal-collapsed-filters';panel.hidden=true;explore.append(panel);search.append(button);
          button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));schedule();});
        }
        for(const id of ['egrp','aud','radius']){const field=document.getElementById('deal-field-'+id);if(field&&field.parentElement!==panel)panel.append(field);}
        const sort=document.getElementById('sort');
        if(sort&&!document.getElementById('dealSortField')){const field=document.createElement('label');field.id='dealSortField';field.className='deal-select-field';field.innerHTML='<span class="deal-select-label">Sort by</span>';field.append(sort);if(sort.tomselect)field.append(sort.tomselect.wrapper);panel.append(field);}
        const count=Number(!!state().filt.egrp)+Number(state().filt.aud!=='all')+Number(state().filt.r!==10)+Number(state().filt.sort!=='near');const badge=button.querySelector('.deal-filter-count');badge.hidden=!count;badge.textContent=count;button.classList.toggle('has-filters',!!count);
      }
      const categorySource=document.getElementById('catGrid');
      if(categorySource){
        let tools=document.getElementById('couponCategoryTools');
        if(!tools){tools=document.createElement('div');tools.id='couponCategoryTools';tools.className='deal-category-tools';tools.innerHTML='<div class="deal-search-filter-row"><input type="search" class="in" id="couponIndustrySearch" placeholder="Search deals: pedicure, facial, coffee…" aria-label="Search deals: pedicure, facial, coffee…"><button type="button" class="btn ghost deal-filter-toggle" aria-expanded="false" aria-controls="couponCategoryFilters">'+filterIcon+'<span>Filters</span></button></div><div id="couponCategoryFilters" class="deal-collapsed-filters" hidden></div>';categorySource.before(tools);
          tools.querySelector('button').addEventListener('click',event=>{const panel=tools.querySelector('#couponCategoryFilters');panel.hidden=!panel.hidden;event.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));schedule();});
          tools.querySelector('input').addEventListener('input',event=>{state().filt.cq=event.target.value.trim();render();});
        }
        const panel=tools.querySelector('#couponCategoryFilters');
        for(const id of ['coupon-group','coupon-industry']){const field=document.getElementById('deal-field-'+id);if(field&&field.parentElement!==panel)panel.append(field);}
      }
      listFilter('opening','openF',document.getElementById('mOpen'),()=>[...document.querySelectorAll('#openList>.card')]);
    }
    if(module==='match'){
      const container=document.getElementById('cAsk'),search=container?.querySelector('.big');
      if(container&&search){
        let panel=document.getElementById('matchFilterFields');
        if(!panel){
          panel=document.createElement('div');panel.id='matchFilterFields';panel.className='deal-collapsed-filters';panel.hidden=true;
          const button=document.createElement('button');button.type='button';button.className='btn ghost deal-filter-toggle';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',panel.id);button.innerHTML=filterIcon+'<span>Filters</span>';search.append(button);container.append(panel);
          button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));schedule();});
          const filters=document.getElementById('filt');if(filters)panel.append(filters);
        }
        const radius=document.getElementById('fR');
        if(radius){
          let field=document.getElementById('matchRadiusField');
          if(!field){field=document.createElement('label');field.id='matchRadiusField';field.className='deal-select-field';field.innerHTML='<span class="deal-select-label">Radius</span>';field.append(radius);if(radius.tomselect)field.append(radius.tomselect.wrapper);document.getElementById('filt').append(field);}
          const hidden=radius.classList.contains('hidden')||radius.hidden;if(field.hidden!==hidden)field.hidden=hidden;
        }
      }
    }
    if(module==='camp')listFilter('campaign','lf',document.getElementById('lf')?.parentElement,()=>[...document.querySelectorAll('section[data-v="list"] tbody tr')]);
  }
  function listFilter(name,fieldId,container,items){
    if(!container)return;
    let tools=document.getElementById(name+'SearchTools');
    if(!tools){tools=document.createElement('div');tools.className='deal-category-tools';tools.id=name+'SearchTools';tools.innerHTML=`<div class="deal-search-filter-row"><input type="search" class="in" placeholder="Search deals" aria-label="Search deals"><button type="button" class="btn ghost deal-filter-toggle" aria-expanded="false" aria-controls="${name}FilterFields">${filterIcon}<span>Filters</span></button></div><div id="${name}FilterFields" class="deal-collapsed-filters" hidden></div>`;container.append(tools);tools.querySelector('button').addEventListener('click',event=>{const panel=tools.lastElementChild;panel.hidden=!panel.hidden;event.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));schedule();});tools.querySelector('input').addEventListener('input',schedule);}
    const field=document.getElementById('deal-field-'+fieldId);if(field&&field.parentElement!==tools.lastElementChild)tools.lastElementChild.append(field);
    const query=tools.querySelector('input').value.trim().toLowerCase();for(const item of items())item.classList.toggle('deal-search-hidden',!!query&&!item.textContent.toLowerCase().includes(query));
  }
  function importOffers(offers){
    if(module!=='deals')return;
    let changed=false;
    for(const offer of offers.filter(row=>String(row.id).startsWith('extra-'))){
      const existing=state().D.find(row=>row.sourceId===offer.id);
      if(existing){const fields={title:offer.title,cond:offer.description||'',photo:offer.photo,code:offer.code||''};if(Object.entries(fields).some(([key,value])=>existing[key]!==value)){Object.assign(existing,fields);changed=true;}continue;}
      const discount=String(offer.discount||'');
      const category=CATS.find(row=>row.n===offer.industry||row.en===offer.industry)||CATS.find(row=>row.id==='nail');
      state().D.unshift({id:'v2-'+offer.id,sourceId:offer.id,code:offer.code||'',userCreated:true,biz:offer.owner,cat:category.id,aud:'cust',t:discount.includes('%')?'pct':'amt',v:Number(discount.match(/[\d.]+/)?.[0])||0,title:offer.title,cond:offer.description||'',photo:offer.photo,mi:0,ang:80,exp:7,expAt:offer.expires?+new Date(offer.expires+'T23:59:59'):Date.now()+7*86400000,qty:100,got:0,used:0,per:1,kw:offer.title,th:'royal'});
      changed=true;
    }
    if(changed)refresh();
  }
  function modernCard(offer,preview){
    const category=CAT(offer.cat),saved=state().saved.includes(offer.id),claimed=state().wallet.some(row=>row.id===offer.id&&live(row)),remaining=left(offer),expired=isExp(offer);
    if(!preview)seen(offer);
    const [amount,kind]=stubTxt(offer),image=offer.photo,icon=window.NEXORA_DEAL_SELECTS.iconFor(category.id,category.n),until=new Date(expAt(offer)).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const title=offer.title,condition=offer.cond||'';
    return `<article class="cp deal-modern-card ${hl===offer.id?'hl':''} ${sponsored(offer)?'spon':''}" data-card="${html(offer.id)}"><div class="deal-card-author"><span class="deal-card-avatar"><img src="${html(icon)}" alt=""></span><div class="deal-card-identity"><strong data-user-text>${html(offer.biz)}</strong><span class="deal-card-label">DEAL &amp; COUPON</span><small>${offer.mi==null?'Online':html(offer.mi)+' mi'}</small></div><span class="deal-card-business">${offer.own==='tech'?'Individual':'Business'}</span></div><h4${offer.userCreated?' data-user-text':''}>${html(title)}</h4><p class="deal-card-description"${offer.userCreated?' data-user-text':''}>${html(condition)}</p><div class="deal-card-tags"><span>${html(category.n)}</span><span class="deal-card-discount">${html(amount)} ${html(kind)}</span><span>Expires ${html(until)}</span>${offer.code?`<span class="deal-card-code">Code: ${html(offer.code)}</span>`:''}${sponsored(offer)?'<span class="tag spons">Sponsored</span>':''}</div>${image?`<img class="deal-card-photo" src="${html(image)}" alt="${html(title)}" loading="lazy">`:`<div class="deal-card-illustration"><img src="${html(icon)}" alt=""><span>${html(amount)} <small>${html(kind)}</small></span></div>`}<div class="deal-card-inventory"><span>${remaining}/${offer.qty} spots left</span><span>${expired?'Expired':offer.paused?'Paused':remaining<=8?'Ending soon':'Available'}</span></div><div class="bar"><i style="width:${Math.min(100,Math.round((offer.qty-remaining)/Math.max(1,offer.qty)*100))}%"></i></div>${preview?'':`<div class="deal-card-actions">${mine(offer)?'<span class="tag blue">Your coupon</span>':`<button type="button" class="btn" data-claim="${html(offer.id)}" ${remaining&&!offer.paused&&!expired||claimed?'':'disabled'}><img src="../../icon-oneqr/issue-2040-oneqr-ticket-3d.png" alt="">${claimed?'In wallet — open':'Get coupon'}</button>`}${offer.code?`<button type="button" class="btn deal-card-copy" data-community-code="${html(offer.code)}">Copy code</button>`:''}<button type="button" class="deal-card-save ${saved?'on':''}" data-save="${html(offer.id)}" aria-label="${saved?'Remove from Wish list':'Save to Wish list'}" aria-pressed="${saved}"><img src="../../icon-oneqr/issue-2040-oneqr-heart-3d.png" alt=""></button></div>`}</article>`;
  }
  function artwork(){
    if(module!=='deals'||!window.NEXORA_DEAL_SELECTS)return;
    for(const card of document.querySelectorAll('[data-card]')){
      const item=state().D.find(row=>row.id===card.dataset.card),mark=card.querySelector('.stub .em');
      if(item&&mark&&!mark.querySelector('img')){const image=document.createElement('img');image.src=window.NEXORA_DEAL_SELECTS.iconFor(item.cat,item.title);image.alt='';image.width=image.height=26;mark.replaceChildren(image);}
    }
    const legend=document.getElementById('mapLeg');
    if(legend&&!legend.querySelector('img'))[...legend.querySelectorAll('span')].forEach((entry,index)=>{
      const group=GROUPS[index];if(!group)return;
      const dot=entry.querySelector('i');entry.replaceChildren();if(dot)entry.append(dot);
      const image=document.createElement('img');image.src=window.NEXORA_DEAL_SELECTS.iconFor(group.id,group.n,true);image.alt='';image.width=image.height=18;entry.append(image,document.createTextNode(group.n));
    });
  }
  function compactItems(){
    if(module!=='deals')return;
    for(const button of document.querySelectorAll('#openRow .hotc,#hotRow .hotc')){
      if(button.classList.contains('deal-compact-item'))continue;
      const opening=button.closest('#openRow');
      const row=opening?state().OPEN.filter(row=>row.day>=0&&(row.mi<=Math.min(state().filt.r,25)||state().filt.r===999)).sort((a,b)=>a.day-b.day)[[...button.parentElement.children].indexOf(button)]:state().D.find(row=>row.id===button.dataset.pin);
      if(!row)continue;
      const image=row.photo||window.NEXORA_DEALS_DEMO.photos[row.cat],category=CAT(row.cat);
      const badge=opening?(row.day===0?'Today':'In '+row.day+' days'):stubTxt(row)[0];
      button.classList.add('deal-compact-item');button.style.removeProperty('background');
      button.innerHTML=`<span class="deal-compact-photo ${image?'':'is-illustration'}"><img src="${html(image||window.NEXORA_DEAL_SELECTS.iconFor(row.cat,category.n))}" alt="" loading="lazy"></span><span class="deal-compact-copy"><b class="deal-compact-badge">${html(badge)}</b><strong>${html(opening?row.biz:row.title)}</strong><small>${html(opening?row.founder:row.biz)}</small><span>${opening?row.mi+' mi':left(row)+' spots left'}</span></span>`;
    }
    const result=document.getElementById('catList');
    if(result){let heading=document.getElementById('industryResultHeading');if(!heading){heading=document.createElement('div');heading.id='industryResultHeading';heading.className='deal-results-heading';result.before(heading);}const count=result.querySelectorAll('[data-card]').length;const text=count+' coupons'; if(heading.textContent!==text)heading.textContent=text;}
  }
  function schedule(){
    if(renderQueued)return;renderQueued=true;
    requestAnimationFrame(()=>{renderQueued=false;observer.disconnect();filters();artwork();compactItems();save();measure();observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden','style']});});
  }
  const observer=new MutationObserver(schedule);
  function claimMatch(offer){
    if(module!=='deals'||!offer?.id)return;
    const current=state(),id='match-'+offer.id;
    if(!current.D.some(row=>row.id===id))current.D.push({id,biz:offer.biz,own:'match',cat:offer.svc||'nail',aud:'cust',t:'price',v:offer.price,title:offer.title,mi:offer.mi??null,ang:80,exp:offer.exp||14,expAt:Date.now()+(offer.exp||14)*86400000,qty:offer.qty||50,got:0,used:0,views:0,per:1,hold:7,cond:offer.area||'',kw:offer.title,th:'royal',e:'🎟️'});
    claim(id);save();
  }
  window.addEventListener('message',event=>{
    if(event.source!==window.parent||location.protocol!=='file:'&&event.origin!==location.origin)return;
    const data=event.data||{};
    if(data.type==='nexora-deals-context'){document.documentElement.lang='en';document.body.classList.add('lang-en');schedule();}
    if(data.type==='nexora-deals-viewport'){if(Number.isFinite(data.top))document.documentElement.style.setProperty('--deal-modal-top',Math.max(16,data.top)+'px');if(Number.isFinite(data.height))document.documentElement.style.setProperty('--deal-modal-height',Math.max(240,data.height)+'px');}
    if(data.type==='nexora-deals-close-modal'){document.getElementById('modal')?.classList.add('hidden');lastFocus?.focus({preventScroll:true});schedule();}
    if(data.type==='nexora-deals-offers'&&Array.isArray(data.offers))importOffers(data.offers);
    if(data.type==='nexora-deals-match-coupon'){if(ready)claimMatch(data.offer);else pendingClaim=data.offer;}
    if(data.cmd==='view'||data.cmd==='lang'||data.cmd==='role')schedule();
  });
  document.addEventListener('input',schedule);
  document.addEventListener('change',schedule);
  document.addEventListener('click',event=>{
    if(!event.target.closest('#modal')&&event.target.closest('button,a,input'))lastFocus=event.target.closest('button,a,input');
    const copy=event.target.closest('[data-community-code]');
    if(copy){const code=copy.dataset.communityCode;if(navigator.clipboard)navigator.clipboard.writeText(code).then(()=>toast('Copied: '+code),()=>toast('Code: '+code));else toast('Code: '+code);}
    const page=event.target.closest('[data-community-page]');if(page)notify({type:'nexora-deals-page',pageId:page.dataset.communityPage});
    if(module==='match'){const button=event.target.closest('[data-claim]');if(button){const offer=state()?.deals.find(row=>row.id===button.dataset.claim);if(offer)notify({type:'nexora-deals-claim-match',offer});}}
    schedule();
  });
  document.addEventListener('keydown',event=>{
    const modal=document.getElementById('modal');
    if(event.key==='Escape'){if(modal)modal.classList.add('hidden');lastFocus?.focus({preventScroll:true});schedule();}
    if(event.key==='Tab'&&modal&&!modal.classList.contains('hidden')){const fields=[...modal.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);if(!fields.length)return;const first=fields[0],last=fields[fields.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  });
  window.addEventListener('pagehide',save);
  window.addEventListener('resize',schedule);
  document.addEventListener('load',schedule,true);
  const demoState=state()?JSON.parse(JSON.stringify(state())):null;
  restore();ready=true;
  window.NEXORA_DEAL_ITEMS.setup(module,state(),demoState);
  if(module==='deals')card=modernCard;
  document.documentElement.lang='en';document.body.classList.add('lang-en');
  // Keep all module subviews reachable while the shared Community header stays in place.
  const localNav=document.querySelector('.top > .tabs,.top > .phases,.top > .roles');
  if(localNav){localNav.classList.add('deal-module-subnav');document.querySelector('main')?.before(localNav);}
  if(typeof spot==='function'){const originalSpot=spot;spot=element=>originalSpot(element?.classList.contains('deal-filter-source')?document.getElementById('deal-field-'+element.id)||element:element);}
  const modal=document.getElementById('modal');if(modal){modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Coupon');}
  refresh();
  if(pendingClaim)claimMatch(pendingClaim);
  if(window.ResizeObserver)new ResizeObserver(schedule).observe(document.body);
  observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden','style']});
  notify({type:'nexora-deals-ready'});
})();
