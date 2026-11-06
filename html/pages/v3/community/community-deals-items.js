/* v2 presentation for the existing PO coupon, matching and opening actions. */
(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=key=>`/html/assets/icon-oneqr/issue-2040-oneqr-${key}-3d.png`;
  const date=value=>new Date(value+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const photo=offer=>offer.photo||window.NEXORA_DEALS_DEMO.photos[offer.cat||offer.svc]||'';
  const industry=(id,text)=>window.NEXORA_DEAL_SELECTS.iconFor(id,text);
  function media(offer,title){
    const src=photo(offer);
    return src?`<img class="deal-card-photo" src="${esc(src)}" alt="${esc(title)}" loading="lazy">`:`<div class="deal-card-illustration"><img src="${esc(industry(offer.cat||offer.svc,title))}" alt=""></div>`;
  }
  function author(offer,category,label='DEAL &amp; COUPON'){
    return `<div class="deal-card-author"><span class="deal-card-avatar"><img src="${esc(industry(offer.cat||offer.svc,category))}" alt=""></span><div class="deal-card-identity"><strong>${esc(offer.biz)}</strong><span class="deal-card-label">${label}</span><small>${esc(offer.mi==null?'Online':offer.mi+' mi · '+(offer.area||category))}</small></div><span class="deal-card-business">Business</span></div>`;
  }
  function opening(offer){
    const category=CAT(offer.cat),remaining=Math.max(0,offer.slots-offer.signups),reserved=S.early[offer.id],opened=offer.day<0;
    const status=opened?'Opened '+(-offer.day)+' days ago':offer.day===0?'Today':'Opens in '+offer.day+' days';
    const action=opened?`<button class="btn" data-claim-open="${esc(offer.id)}"><img src="${icon('ticket')}" alt="">Get opening-week coupon</button>`:reserved?`<div class="deal-opening-reserved">✓ Reserved · enter phone ${esc(reserved)} at the counter on opening day</div>`:`<button class="btn" data-early="${esc(offer.id)}" ${remaining?'':'disabled'}><img src="${icon('calendar-check')}" alt="">${remaining?'Early sign-up · reserve a spot':'Sold out'}</button>`;
    return `<article class="card opn cp deal-modern-card deal-opening-card" data-opening-id="${esc(offer.id)}">${author(offer,category.n,'GRAND OPENING')}<div class="deal-opening-cover">${media(offer,offer.biz)}</div><div class="deal-opening-offers"><div class="deal-opening-schedule"><div class="deal-opening-date"><img src="${icon('calendar-days')}" alt=""><strong>${date(offer.date)}</strong></div><span class="deal-opening-status ${opened?'is-open':''}">${esc(status)}</span></div><div class="deal-opening-offer-columns"><div><span>Founder offer</span><strong>${esc(offer.founder)}</strong></div><div><span>Opening week</span><p>${esc(offer.week)}</p></div></div></div><div class="deal-card-inventory"><span>${offer.signups} signed up · ${offer.amb} ambassadors</span><span>${opened?'Opened':remaining+' spots left'}</span></div><div class="bar"><i style="width:${Math.min(100,offer.signups/offer.slots*100)}%"></i></div><div class="deal-opening-actions">${action}<div class="deal-opening-secondary"><button class="btn ghost" data-openshare="${esc(offer.id)}"><img src="${icon('share-2')}" alt="">Invite friends</button><button class="btn ghost" data-openmap="${esc(offer.id)}"><img src="${icon('map')}" alt="">Directions</button></div></div></article>`;
  }
  function match(offer){
    const category=SVC[offer.svc],remaining=Math.max(0,offer.qty-offer.got),expires=new Date(Date.now()+offer.exp*86400000).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    return `<article class="cp deal-modern-card deal-match-card">${author(offer,category.n)}<h4>${esc(offer.title)}</h4><div class="deal-card-tags"><span>${esc(category.n)}</span><span class="deal-card-discount">${esc(money(offer.price,offer.cur))}</span><span>Expires ${expires}</span>${offer.wk?'<span>Weekend</span>':''}</div>${media(offer,offer.title)}<div class="deal-card-inventory"><span>${remaining}/${offer.qty} spots left</span><span>${remaining<=8?'Ending soon':'Available'}</span></div><div class="bar"><i style="width:${Math.min(100,offer.got/offer.qty*100)}%"></i></div><div class="deal-card-actions"><button class="btn" data-claim="${esc(offer.id)}" ${remaining?'':'disabled'}><img src="${icon('ticket')}" alt="">Get coupon</button></div></article>`;
  }
  function wishes(){
    document.getElementById('myWishes').innerHTML=S.my.map(w=>{
      const matches=matchDeals(w),category=SVC[w.svc];
      return `<article class="deal-wish-card"><div class="deal-wish-heading"><img src="${esc(industry(w.svc,category.n))}" alt=""><h4>${esc(category.n)}${w.max?' ≤ $'+w.max:''}</h4></div><div class="deal-card-tags"><span>${matches.length?'✓ '+matches.length+' matches':'Waiting for salons'}</span><span>${w.seen||0} salons viewed</span><span>${w.exp} days left</span>${w.wk?'<span>Weekend</span>':''}<span>${esc(w.online?'Online':w.geo?geoTxt(w.geo):(w.r||5)+' mi')}</span></div>${matches.map(d=>`<div class="deal-wish-result"><div><strong>${esc(d.title)}</strong><small>${esc(d.biz)} · ${d.mi==null?'Online':d.mi+' mi'}</small></div><button class="btn ghost sm" data-claim="${esc(d.id)}" ${d.got>=d.qty?'disabled':''}>Get coupon</button></div>`).join('')}<button class="deal-wish-remove" data-wdel="${esc(w.id)}">Remove</button></article>`;
    }).join('')||`<div class="deal-wish-empty"><img src="${icon('sparkles')}" alt=""><p>None yet. Type a line above and tap “Post this wish”.</p></div>`;
  }
  function wallet(){
    sweep();
    document.getElementById('walList').innerHTML=S.wallet.map((w,i)=>{
      const offer=S.D.find(d=>d.id===w.id);if(!offer)return '';
      const released=!w.used&&w.rel,expired=isExp(offer),category=CAT(offer.cat);
      const status=w.used?'Used':released?expired?'Expired':'Hold expired':'Available';
      return `<article class="deal-wallet-card" ${i===0?'id="firstW"':''}>${author(offer,category.n)}<div class="deal-wallet-body"><div class="deal-wallet-info"><h4>${esc(offer.title)}</h4><div class="deal-card-tags"><span>${status}</span><span>Expires ${fmtT(expAt(offer))}</span></div><span class="code">${esc(w.code)}</span>${w.used?`<p class="muted">Used ${new Date(w.usedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}${w.saved?' · saved '+money(w.saved):''}</p>`:released?`<p class="muted">${expired?'This coupon has expired.':'The unused spot has returned to the pool.'}</p>${!expired&&left(offer)&&!offer.paused?`<button class="btn" data-claim="${esc(offer.id)}">Claim again</button>`:''}`:`<p class="deal-wallet-pin-label">Live PIN · changes every 30 seconds</p><div class="pinv" data-pin-of="${esc(w.code)}">${pinOf(w.code)}</div><div class="cd"><i data-cd></i></div>${w.holdUntil<expAt(offer)?`<p class="muted">Use before ${fmtT(w.holdUntil)}</p>`:''}`}</div><div class="deal-wallet-qr"><div class="qr" aria-label="QR code ${esc(w.code)}">${qr(w.code+(w.used?'':':'+win()))}</div></div></div>${!w.used&&!released?`<div class="deal-wallet-actions"><button class="btn ghost" data-resave="${i}">Save / send</button><button class="btn ghost" data-demoscan="${i}">Demo: show the cashier</button></div>`:''}</article>`;
    }).join('')||`<div class="deal-wallet-empty"><img src="/html/assets/icon-oneqr/vlinkpay-wallet-show-wallet.png" alt=""><p>No coupons yet. Tap “Get coupon” in Nearby deals.</p></div>`;
    tickPins();
  }
  function setup(module,state,baseline){
    const demo=window.NEXORA_DEALS_DEMO;
    if(module==='deals'){
      const original=new Map(baseline.D.map(row=>[row.id,row]));
      for(const row of state.D)if(!row.userCreated){const source=original.get(row.id);if(source)for(const key of ['title','cond','biz','cat','t','v'])row[key]=source[key];Object.assign(row,demo.coupons[row.id]||{});if(!row.photo)row.photo=photo(row);}
      const stored=new Map(state.OPEN.map(row=>[row.id,row]));
      state.OPEN=demo.openings.map(row=>({...row,signups:state.early[row.id]?Math.max(row.signups,stored.get(row.id)?.signups||0):row.signups}));
      window.nexoraOpeningCard=opening;
      drawWallet=wallet;
    }
    if(module==='match'){const original=new Map(baseline.deals.map(row=>[row.id,row]));for(const row of state.deals){const source=original.get(row.id);if(source)row.title=source.title;if(!row.photo)row.photo=photo(row);}dealRow=match;drawMy=wishes;}
  }
  window.NEXORA_DEAL_ITEMS={setup};
})();
