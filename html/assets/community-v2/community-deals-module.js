/* Bridges the retained PO interactions to the current Community workspace. */
(() => {
  'use strict';
  const module=document.body.dataset.module;
  const origin=location.protocol==='file:'?'*':location.origin;
  const notify=data=>window.parent.postMessage(data,origin);
  const scope=new URLSearchParams(location.search).get('member')||'community';
  const key='nexora-community-deals-po-v1:'+module+':'+scope;
  const phrases=Object.entries(window.NEXORA_DEAL_PHRASES||{}).filter(([vi,en])=>vi!==en&&vi.trim().length>2).sort((a,b)=>b[0].length-a[0].length);
  const exact=new Map(phrases);
  const replacements=phrases.map(([vi,en])=>[new RegExp('(^|[^\\p{L}\\p{N}_])'+vi.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^\\p{L}\\p{N}_])','gu'),en]);
  let ready=false,renderQueued=false,lastHeight=0,lastModal=false,previousView='',lastSaved='',pendingClaim=null,lastFocus=null;
  const userText=new Set();
  const html=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const english=text=>{
    if(exact.has(text))return exact.get(text);
    let out=text;
    for(const [pattern,en] of replacements)out=out.replace(pattern,(_,prefix)=>prefix+en);
    return out;
  };
  function translate(root){
    const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;while(node=walk.nextNode())nodes.push(node);
    for(const text of nodes){
      const parent=text.parentElement;
      if(!parent||parent.closest('script,style,textarea,input,.vi,.biz,.nm,[contenteditable="true"]'))continue;
      if(parent.closest('[data-user-text]')||userText.has(text.nodeValue))continue;
      if(parent.tagName==='OPTION'&&!parent.hasAttribute('value'))parent.setAttribute('value',parent.textContent);
      const next=english(text.nodeValue);if(next!==text.nodeValue)text.nodeValue=next;
    }
    root.querySelectorAll?.('[placeholder],[title],[aria-label],[data-en]').forEach(element=>{
      if(element.hasAttribute('data-en')&&element.classList.contains('i18n-a'))element.setAttribute('data-en',english(element.getAttribute('data-en')));
      for(const attr of ['placeholder','title','aria-label']){const value=element.getAttribute(attr);if(value){const next=english(value);if(next!==value)element.setAttribute(attr,next);}}
    });
    root.querySelectorAll?.('input[type="text"],input:not([type])').forEach(input=>{if(!input.dataset.userEdited&&input.value){const next=english(input.value);if(next!==input.value)input.value=next;}});
  }
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
  function translateSeed(){
    const current=state();if(!current)return;
    if(module==='deals'){
      for(const list of [GROUPS,CATS])for(const row of list)if(row.en)row.n=row.en;
      for(const row of current.D||[])if(!row.userCreated){row.title=english(row.title);row.cond=english(row.cond||'');}
      for(const row of current.OPEN||[]){row.founder=english(row.founder);row.week=english(row.week);}
      for(const template of TPL){template.n=english(template.n);for(const field of ['title','cond'])if(template.p[field])template.p[field]=english(template.p[field]);}
    }
    if(module==='match'){
      for(const row of Object.values(SVC))if(row.en)row.n=row.en;
      for(const row of current.deals||[])if(!row.mine)row.title=english(row.title);
    }
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
      api.chips('quick','data-q','Search deals',{industry:true});
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
          button=document.createElement('button');button.type='button';button.id='nearbyFilterToggle';button.className='btn ghost deal-filter-toggle';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','nearbyFilterFields');button.innerHTML='<img src="../../icon-oneqr/issue-2040-oneqr-settings-2-3d.png" alt=""><span>Filters</span><span class="deal-filter-count" hidden></span>';
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
        if(!tools){tools=document.createElement('div');tools.id='couponCategoryTools';tools.className='deal-category-tools';tools.innerHTML='<div class="deal-search-filter-row"><input type="search" class="in" id="couponIndustrySearch" placeholder="Search industries" aria-label="Search industries"><button type="button" class="btn ghost deal-filter-toggle" aria-expanded="false" aria-controls="couponCategoryFilters"><img src="../../icon-oneqr/issue-2040-oneqr-settings-2-3d.png" alt=""><span>Filters</span></button></div><div id="couponCategoryFilters" class="deal-collapsed-filters" hidden></div>';categorySource.before(tools);
          tools.querySelector('button').addEventListener('click',event=>{const panel=tools.querySelector('#couponCategoryFilters');panel.hidden=!panel.hidden;event.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));schedule();});
          tools.querySelector('input').addEventListener('input',event=>{const value=event.target.value.trim();state().filt.cq=value;const matches=value?findCats(value):[];state().filt.cat=matches[0]?.id||null;state().filt.grp=null;render();});
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
          const button=document.createElement('button');button.type='button';button.className='btn ghost deal-filter-toggle';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',panel.id);button.innerHTML='<img src="../../icon-oneqr/issue-2040-oneqr-settings-2-3d.png" alt=""><span>Filters</span>';search.append(button);container.append(panel);
          button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));schedule();});
          const filters=document.getElementById('filt');if(filters)panel.append(filters);
        }
        const quick=document.getElementById('deal-field-quick');if(quick&&quick.parentElement!==panel)panel.prepend(quick);
      }
    }
    if(module==='camp')listFilter('campaign','lf',document.getElementById('lf')?.parentElement,()=>[...document.querySelectorAll('section[data-v="list"] tbody tr')]);
  }
  function listFilter(name,fieldId,container,items){
    if(!container)return;
    let tools=document.getElementById(name+'SearchTools');
    if(!tools){tools=document.createElement('div');tools.className='deal-category-tools';tools.id=name+'SearchTools';tools.innerHTML=`<div class="deal-search-filter-row"><input type="search" class="in" placeholder="Search deals" aria-label="Search deals"><button type="button" class="btn ghost deal-filter-toggle" aria-expanded="false" aria-controls="${name}FilterFields"><img src="../../icon-oneqr/issue-2040-oneqr-settings-2-3d.png" alt=""><span>Filters</span></button></div><div id="${name}FilterFields" class="deal-collapsed-filters" hidden></div>`;container.append(tools);tools.querySelector('button').addEventListener('click',event=>{const panel=tools.lastElementChild;panel.hidden=!panel.hidden;event.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));schedule();});tools.querySelector('input').addEventListener('input',schedule);}
    const field=document.getElementById('deal-field-'+fieldId);if(field&&field.parentElement!==tools.lastElementChild)tools.lastElementChild.append(field);
    const query=tools.querySelector('input').value.trim().toLowerCase();for(const item of items())item.classList.toggle('deal-search-hidden',!!query&&!item.textContent.toLowerCase().includes(query));
  }
  function updateDemo(offers){
    if(module!=='deals'||!Array.isArray(offers))return;
    const byId=new Map(offers.map(offer=>[offer.id,offer]));
    const updates={k1:'deal-bitcoin-weekday',g1:'f7',l1:'deal-spa-first-visit',s1:'deal-an-cut-style',x1:'deal-linh-lash',p1:'deal-bright-restock',f1:'deal-saigon-lunch',e2:'deal-bistro-coffee'};
    const photos={nail:byId.get('f7')?.photo,hair:byId.get('deal-an-cut-style')?.photo,spa:byId.get('deal-spa-first-visit')?.photo,skin:byId.get('deal-spa-first-visit')?.photo,lash:byId.get('deal-linh-lash')?.photo,food:byId.get('deal-saigon-lunch')?.photo,drink:byId.get('deal-bistro-coffee')?.photo,bakery:byId.get('deal-bistro-coffee')?.photo,supply:byId.get('deal-bright-restock')?.photo};
    for(const row of state().D){
      const offer=byId.get(updates[row.id]);
      if(offer&&!row.userCreated){row.title=offer.title;row.cond=offer.description;row.biz=offer.owner;row.photo=offer.photo;if(row.id==='l1')row.cat='skin';if(row.id==='e2')row.cat='food';row.t=String(offer.discount).includes('%')?'pct':'amt';row.v=Number(String(offer.discount).match(/[\d.]+/)?.[0])||row.v;if(offer.expires)row.expAt=+new Date(offer.expires+'T23:59:59');}
      if(!row.photo&&photos[row.cat])row.photo=photos[row.cat];
    }
    refresh();
  }
  function modernCard(offer,preview){
    const category=CAT(offer.cat),saved=state().saved.includes(offer.id),claimed=state().wallet.some(row=>row.id===offer.id&&live(row)),remaining=left(offer),expired=isExp(offer);
    if(!preview)seen(offer);
    const [amount,kind]=stubTxt(offer),image=offer.photo,icon=window.NEXORA_DEAL_SELECTS.iconFor(category.id,category.n),until=new Date(expAt(offer)).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const title=offer.userCreated?offer.title:english(offer.title),condition=offer.userCreated?offer.cond:english(offer.cond||'');
    return `<article class="cp deal-modern-card ${hl===offer.id?'hl':''} ${sponsored(offer)?'spon':''}" data-card="${html(offer.id)}"><div class="deal-card-author"><span class="deal-card-avatar"><img src="${html(icon)}" alt=""></span><div class="deal-card-identity"><strong data-user-text>${html(offer.biz)}</strong><span class="deal-card-label">DEAL &amp; COUPON</span><small>${offer.mi==null?'Online':html(offer.mi)+' mi'} · ${html(category.n)}</small></div><span class="deal-card-business">${offer.own==='tech'?'Individual':'Business'}</span></div><h4${offer.userCreated?' data-user-text':''}>${html(title)}</h4><p class="deal-card-description"${offer.userCreated?' data-user-text':''}>${html(condition)}</p><div class="deal-card-tags"><span>${html(category.n)}</span><span class="deal-card-discount">${html(amount)} ${html(english(kind))}</span><span>Expires ${html(until)}</span>${sponsored(offer)?'<span class="tag spons">Sponsored</span>':''}</div>${image?`<img class="deal-card-photo" src="${html(image)}" alt="${html(title)}" loading="lazy">`:`<div class="deal-card-illustration"><img src="${html(icon)}" alt=""><span>${html(amount)} <small>${html(english(kind))}</small></span></div>`}<div class="deal-card-inventory"><span>${remaining}/${offer.qty} spots left</span><span>${expired?'Expired':offer.paused?'Paused':remaining<=8?'Ending soon':'Available'}</span></div><div class="bar"><i style="width:${Math.min(100,Math.round((offer.qty-remaining)/Math.max(1,offer.qty)*100))}%"></i></div>${preview?'':`<div class="deal-card-actions">${mine(offer)?'<span class="tag blue">Your coupon</span>':`<button type="button" class="btn" data-claim="${html(offer.id)}" ${remaining&&!offer.paused&&!expired||claimed?'':'disabled'}><img src="../../icon-oneqr/issue-2040-oneqr-ticket-3d.png" alt="">${claimed?'In wallet — open':'Get coupon'}</button>`}<button type="button" class="deal-card-save ${saved?'on':''}" data-save="${html(offer.id)}" aria-label="${saved?'Remove from Wish list':'Save to Wish list'}" aria-pressed="${saved}"><img src="../../icon-oneqr/issue-2040-oneqr-heart-3d.png" alt=""></button></div>`}</article>`;
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
  function schedule(){
    if(renderQueued)return;renderQueued=true;
    requestAnimationFrame(()=>{renderQueued=false;observer.disconnect();translate(document.body);filters();artwork();save();measure();observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden','style']});});
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
    if(data.type==='nexora-deals-context'){document.documentElement.lang='en';document.body.classList.add('lang-en');if(typeof window.__setLang==='function')window.__setLang('en');schedule();}
    if(data.type==='nexora-deals-viewport'){if(Number.isFinite(data.top))document.documentElement.style.setProperty('--deal-modal-top',Math.max(16,data.top)+'px');if(Number.isFinite(data.height))document.documentElement.style.setProperty('--deal-modal-height',Math.max(240,data.height)+'px');}
    if(data.type==='nexora-deals-close-modal'){document.getElementById('modal')?.classList.add('hidden');lastFocus?.focus({preventScroll:true});schedule();}
    if(data.type==='nexora-deals-offers'&&Array.isArray(data.offers)){for(const offer of data.offers){userText.add(offer.title);userText.add(offer.description);}updateDemo(data.offers);}
    if(data.type==='nexora-deals-match-coupon'){if(ready)claimMatch(data.offer);else pendingClaim=data.offer;}
    if(data.cmd==='view'||data.cmd==='lang'||data.cmd==='role')schedule();
  });
  document.addEventListener('input',event=>{if(event.target.matches('input,textarea')){event.target.dataset.userEdited='true';userText.add(event.target.value);}schedule();});
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
  restore();ready=true;
  translateSeed();
  if(module==='deals')card=modernCard;
  document.documentElement.lang='en';document.body.classList.add('lang-en');
  if(typeof window.__setLang==='function')window.__setLang('en');
  if(typeof lang!=='undefined'&&lang!=='en')document.getElementById('langBtn')?.click();
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
