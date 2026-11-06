/* Community Lucky Wheel preview shares one account ledger and one spin bank. */
(() => {
  const shared=window.NEXORA_COMMUNITY_SHARED,id=shared.me().id;
  const previous=shared.read().spins[id];
  if(previous)Object.assign(S,previous);
  S.loggedIn=true;S.name=shared.member;S.nxId=id;S.phone=shared.me().phone||'';S.points=shared.wallet().balance;S.spinning=false;
  S.prizes=S.prizes.map(row=>({...row,expires:new Date(row.expires)}));
  function persist(){return shared.change(data=>{data.spins[id]=JSON.parse(JSON.stringify({...S,spinning:false}));});}
  const originalBalances=renderBalances;
  renderBalances=function(){const wallet=shared.wallet();S.points=wallet.balance;S.communityPts=wallet.ledger.filter(row=>row.reason.startsWith('activity:')&&row.time.startsWith(new Date().toISOString().slice(0,10))).reduce((sum,row)=>sum+row.amount,0);originalBalances();};
  const originalWin=handleWin;
  handleWin=function(segment){originalWin(segment);if(segment.type==='points')shared.points(segment.amount,'wheel:points','wheel:'+crypto.randomUUID());S.points=shared.wallet().balance;persist();renderBalances();};
  const quotas={g1000:[1,30],g500:[1,1],g250:[2,1],g100:[3,1],g50:[6,1],g25:[15,1]};
  function pool(){const now=Date.now(),history=shared.read().wheelResults||[];return SEGMENTS.filter(segment=>!quotas[segment.key]||history.filter(row=>row.key===segment.key&&(quotas[segment.key][1]===1?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago'}).format(row.time)===new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago'}).format(now):now-row.time<quotas[segment.key][1]*86400000)).length<quotas[segment.key][0]);}
  pickWeighted=function(){const available=pool(),total=available.reduce((sum,row)=>sum+row.p,0),random=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;let cursor=random*total;for(const row of available){cursor-=row.p;if(cursor<0)return SEGMENTS.indexOf(row);}return SEGMENTS.length-1;};
  renderOdds=function(){const available=pool(),total=available.reduce((sum,row)=>sum+row.p,0);$('odds-table').innerHTML='<tr><th>'+t('oddsPrize')+'</th><th>'+t('oddsPct')+'</th><th>'+t('oddsRatio')+'</th></tr>'+SEGMENTS.map(segment=>'<tr><td>'+(LANG==='vi'?segment.vi:segment.en)+'</td><td class="pct">'+(available.includes(segment)?segment.p/total*100:0).toFixed(2)+'%</td><td>'+segment.ratio+'</td></tr>').join('');};
  spin=async function(){
    const run=()=>{
      if(S.spinning)return;
      const saved=shared.read().spins[id];if(saved){Object.assign(S,saved,{spinning:false,points:shared.wallet().balance});S.prizes=S.prizes.map(row=>({...row,expires:new Date(row.expires)}));}
      if(Math.abs(SEGMENTS.reduce((sum,row)=>sum+row.p,0)-100)>0.000001)return;
      rollDayIfNeeded();if(S.spinsToday>=DAILY_SPIN_CAP){toast(t('toastCap'));return;}if(spinsAvailable()<=0){toast(t('toastNeedSpin'));return;}
      if(freeSpinAvailable())S.freeWindowKey=windowInfo().key;else if(S.welcomeSpin>0)S.welcomeSpin--;else S.bankedSpins--;
      S.spinsToday++;const index=pickWeighted(),segment=SEGMENTS[index],token=crypto.randomUUID();
      // Commit the local preview outcome before animation; reload cannot grant it twice.
      shared.change(data=>{data.wheelResults=(data.wheelResults||[]).filter(row=>Date.now()-row.time<30*86400000);data.wheelResults.push({token,account:id,key:segment.key,time:Date.now()});});
      handleWin(segment);$('winModal').classList.add('hidden');S.spinning=true;
      const mid=index*SEG+SEG/2,target=((360-mid)%360+360)%360,current=((S.rotation%360)+360)%360;S.rotation+=360*6+((target-current+360)%360);$('wheel').style.transform='rotate('+S.rotation+'deg)';persist();renderSpinInfo();
      setTimeout(()=>{S.spinning=false;$('winModal').classList.remove('hidden');renderAll();syncTourBtn();},5500);
    };
    if(navigator.locks)await navigator.locks.request('nexora-v3:community-wheel',run);else run();
  };
  buySpin=function(){
    const reference='wheel-exchange:'+crypto.randomUUID();
    if(!shared.points(-SPIN_COST,'wheel:exchange',reference)){toast(t('toastBuyNo'));return;}
    S.bankedSpins++;S.points=shared.wallet().balance;persist();renderBalances();renderSpinInfo();showTab('wheel');toast(t('toastBuyOk'));
  };
  doTask=function(taskId){
    const task=TASKS.find(row=>row.id===taskId);if(!task)return;
    if(task.cat==='community'){parent.postMessage({type:'nexora-community-route',route:'feed'},location.origin);return;}
    if(taskId==='profile'){parent.postMessage({type:'nexora-community-route',route:'account'},location.origin);return;}
    if(taskId==='review'){parent.postMessage({type:'nexora-community-route',route:'food'},location.origin);return;}
    if(taskId==='oneqr'){location.assign('/html/pages/frame-personal.html');return;}
    if(taskId==='invite'){parent.postMessage({type:'nexora-community-route',route:'privacy'},location.origin);return;}
    if(task.link){window.open(task.link,'_blank','noopener,noreferrer');return;}
    rollDayIfNeeded();const count=S.taskCounts[taskId]||0;if(count>=task.max)return;
    if(shared.points(task.pts,taskId,'wheel-task:'+taskId+':'+(ONCE_TASKS.includes(taskId)?'once':windowInfo().dayKey))){S.taskCounts[taskId]=count+1;persist();renderAll();}
  };
  const originalChecks=renderClaimList;
  renderClaimList=function(){originalChecks();if(claimPrize.amount>=250){const holder=document.createElement('div');holder.className='checkitem';holder.innerHTML='<label>'+ (LANG==='vi'?'Họ tên pháp lý':'Legal name')+'<input id="claimLegalName" required value="'+String(claimPrize.legalName||'').replace(/[&<>"']/g,'')+'"></label><label>'+(LANG==='vi'?'Giấy tờ tùy thân':'Identification')+'<input id="claimIdentityFile" type="file" accept="image/*,application/pdf"></label>';$('claimList').append(holder);}};
  submitClaim=function(){
    if(!claimPrize||prizeExpired(claimPrize)||!SOCIALS.every(row=>claimPrize.checks[row.key]))return;
    if(claimPrize.amount>=250){const name=$('claimLegalName')?.value.trim(),file=$('claimIdentityFile')?.files[0];if(!name||!file)return;claimPrize.legalName=name;claimPrize.identityFile={name:file.name,type:file.type,size:file.size};}
    claimPrize.status='review';claimPrize.submittedAt=new Date().toISOString();persist();closeClaim();renderWallet();showTab('wallet');toast(t('toastSubmitted'));
  };
  const oldToggle=toggleCheck;toggleCheck=function(key){oldToggle(key);persist();};
  const oldRedeem=redeemCredit;redeemCredit=function(){oldRedeem();persist();};
  markEntryShown();closeEntryPopup();showEntryPopup=function(){};
  const originalLanguage=setLang;setLang=function(value){originalLanguage(value);$('hubSub').hidden=true;document.documentElement.lang=value;};
  const layout=document.createElement('style');layout.textContent='#tabbar{position:sticky;left:0;right:auto;transform:none;bottom:0;width:100%;max-width:none;z-index:20}#app{padding-bottom:24px}';document.head.append(layout);
  for(const selector of ['header','.lang-toggle','#tourBtn','#tourStartBtn','#welcomeBanner'])document.querySelector(selector)?.setAttribute('hidden','');
  window.NEXORA_COMMUNITY_MODULE={setLanguage(value){setLang(value==='vi'?'vi':'en');renderAll();},navigate(route,context){if(context?.wheelTab)showTab(context.wheelTab);},deactivate(){tourStop();}};
  setLang(localStorage.getItem('nexora-v3:nexora-community-language')||'en');renderAuthState();renderAll();persist();
})();
