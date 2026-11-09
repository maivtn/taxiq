/* Community Lucky Wheel preview shares one account ledger and one spin bank. */
(() => {
  const shared=window.NEXORA_COMMUNITY_SHARED,id=shared.me().id;
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const identityFile=file=>file&&(file.type.startsWith('image/')||file.type==='application/pdf')?{name:file.name,type:file.type,size:file.size}:null;
  const storageError=()=>toast(LANG==='vi'?'Đã có lỗi xảy ra. Vui lòng thử lại.':'Something went wrong. Please try again.');
  function restore(saved){Object.assign(S,saved,{loggedIn:true,name:shared.member,nxId:id,phone:shared.me().phone||'',spinning:false});S.prizes=S.prizes.map(row=>({...row,expires:new Date(row.expires)}));}
  const previous=shared.read().spins[id];
  if(previous)Object.assign(S,previous);
  S.loggedIn=true;S.name=shared.member;S.nxId=id;S.phone=shared.me().phone||'';S.points=shared.wallet().balance;S.spinning=false;
  S.prizes=S.prizes.map(row=>({...row,expires:new Date(row.expires)}));
  function persist(walletChange=null,outcome=null){
    return shared.change(data=>{
      const wallet=data.wallets[id]||={balance:0,ledger:[]};
      if(walletChange){
        if(wallet.ledger.some(row=>row.reference===walletChange.reference)||wallet.balance+walletChange.amount<0)return false;
        wallet.balance+=walletChange.amount;
        wallet.ledger.unshift({id:crypto.randomUUID(),time:new Date().toISOString(),...walletChange,balance:wallet.balance});
      }
      S.points=wallet.balance;
      data.spins[id]=JSON.parse(JSON.stringify({...S,spinning:false}));
      if(outcome){data.wheelResults=(data.wheelResults||[]).filter(row=>Date.now()-row.time<30*86400000);data.wheelResults.push(outcome);}
    });
  }
  function saveOrRestore(before,walletChange=null,outcome=null){
    if(persist(walletChange,outcome))return true;
    restore(before);$('winModal').classList.add('hidden');renderAll();syncTourBtn();storageError();return false;
  }
  let spinPending=false;
  const originalSpinInfo=renderSpinInfo;
  renderSpinInfo=function(){originalSpinInfo();for(const key of ['spinBtn','hubBtn','buySpinBtn']){$(key).disabled=S.spinning||spinPending;$(key).setAttribute('aria-busy',String(S.spinning||spinPending));}};
  const originalBalances=renderBalances;
  renderBalances=function(){const wallet=shared.wallet();S.points=wallet.balance;S.communityPts=wallet.ledger.filter(row=>row.reason.startsWith('activity:')&&row.time.startsWith(new Date().toISOString().slice(0,10))).reduce((sum,row)=>sum+row.amount,0);originalBalances();};
  const quotas={g1000:[1,30],g500:[1,1],g250:[2,1],g100:[3,1],g50:[6,1],g25:[15,1]};
  function pool(){const now=Date.now(),history=shared.read().wheelResults||[];return SEGMENTS.filter(segment=>!quotas[segment.key]||history.filter(row=>row.key===segment.key&&(quotas[segment.key][1]===1?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago'}).format(row.time)===new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago'}).format(now):now-row.time<quotas[segment.key][1]*86400000)).length<quotas[segment.key][0]);}
  pickWeighted=function(){const available=pool(),total=available.reduce((sum,row)=>sum+row.p,0),random=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;let cursor=random*total;for(const row of available){cursor-=row.p;if(cursor<0)return SEGMENTS.indexOf(row);}return SEGMENTS.length-1;};
  renderOdds=function(){const available=pool(),total=available.reduce((sum,row)=>sum+row.p,0);$('odds-table').innerHTML='<tr><th>'+t('oddsPrize')+'</th><th>'+t('oddsPct')+'</th><th>'+t('oddsRatio')+'</th></tr>'+SEGMENTS.map(segment=>{const probability=available.includes(segment)?segment.p/total*100:0;return '<tr><td>'+(LANG==='vi'?segment.vi:segment.en)+'</td><td class="pct">'+probability.toFixed(2)+'%</td><td>'+(probability?'≈ 1 / '+Math.round(100/probability).toLocaleString('en-US'):'—')+'</td></tr>';}).join('');};
  spin=async function(){
    if(S.spinning||spinPending)return;
    spinPending=true;renderSpinInfo();
    const run=()=>{
      if(S.spinning)return;
      restore(shared.read().spins[id]||S);
      const before=shared.copy(S);
      if(Math.abs(SEGMENTS.reduce((sum,row)=>sum+row.p,0)-100)>0.000001)return;
      rollDayIfNeeded();if(S.spinsToday>=DAILY_SPIN_CAP){toast(t('toastCap'));return;}if(spinsAvailable()<=0){toast(t('toastNeedSpin'));return;}
      if(freeSpinAvailable())S.freeWindowKey=windowInfo().key;else if(S.welcomeSpin>0)S.welcomeSpin--;else S.bankedSpins--;
      S.spinsToday++;const index=pickWeighted(),segment=SEGMENTS[index],token=crypto.randomUUID();
      handleWin(segment);$('winModal').classList.add('hidden');S.spinning=true;
      const mid=index*SEG+SEG/2,target=((360-mid)%360+360)%360,current=((S.rotation%360)+360)%360;S.rotation+=360*6+((target-current+360)%360);
      // The spin, prize and shared ledger commit together before the animation starts.
      const credit=segment.type==='points'?{amount:segment.amount,reason:'wheel:points',reference:'wheel:'+token}:null;
      if(!saveOrRestore(before,credit,{token,account:id,key:segment.key,time:Date.now()}))return;
      $('wheel').style.transform='rotate('+S.rotation+'deg)';renderBalances();renderSpinInfo();
      setTimeout(()=>{S.spinning=false;$('winModal').classList.remove('hidden');renderAll();syncTourBtn();},5500);
    };
    try{if(navigator.locks)await navigator.locks.request('nexora-v31:community-wheel',run);else run();}
    catch{storageError();}
    finally{spinPending=false;renderSpinInfo();}
  };
  buySpin=async function(){
    if(S.spinning||spinPending)return;
    const run=()=>{
      restore(shared.read().spins[id]||S);const before=shared.copy(S);
      if(shared.wallet().balance<SPIN_COST){toast(t('toastBuyNo'));return;}
      S.bankedSpins++;
      if(!saveOrRestore(before,{amount:-SPIN_COST,reason:'wheel:exchange',reference:'wheel-exchange:'+crypto.randomUUID()}))return;
      renderBalances();renderSpinInfo();showTab('wheel');toast(t('toastBuyOk'));
    };
    spinPending=true;renderSpinInfo();
    try{if(navigator.locks)await navigator.locks.request('nexora-v31:community-wheel',run);else run();}
    catch{storageError();}
    finally{spinPending=false;renderSpinInfo();}
  };
  doTask=function(taskId){
    const task=TASKS.find(row=>row.id===taskId);if(!task)return;
    if(task.cat==='community'){parent.postMessage({type:'nexora-community-route',route:'feed'},location.origin);return;}
    if(taskId==='profile'){parent.postMessage({type:'nexora-community-route',route:'account'},location.origin);return;}
    if(taskId==='review'){parent.postMessage({type:'nexora-community-route',route:'food'},location.origin);return;}
    if(taskId==='oneqr'){location.assign('/html/pages/frame-personal.html');return;}
    if(taskId==='invite'){parent.postMessage({type:'nexora-community-route',route:'privacy'},location.origin);return;}
    if(task.link){window.open(task.link,'_blank','noopener,noreferrer');return;}
    if(S.spinning||spinPending)return;
    restore(shared.read().spins[id]||S);rollDayIfNeeded();const count=S.taskCounts[taskId]||0;if(count>=task.max)return;
    const before=shared.copy(S);S.taskCounts[taskId]=count+1;
    if(saveOrRestore(before,{amount:task.pts,reason:taskId,reference:'wheel-task:'+taskId+':'+(ONCE_TASKS.includes(taskId)?'once':windowInfo().dayKey)}))renderAll();
  };
  function updateClaimSubmit(){
    const complete=claimPrize?.status==='pending'&&!prizeExpired(claimPrize)&&SOCIALS.every(row=>claimPrize.checks[row.key])&&(claimPrize.amount<250||claimPrize.legalName?.trim()&&claimPrize.identityFile);
    $('claimSubmit').disabled=!complete;
  }
  let renderedClaimId=null;
  const originalChecks=renderClaimList;
  renderClaimList=function(){
    const name=$('claimLegalName'),file=$('claimIdentityFile')?.files[0];
    if(renderedClaimId===claimPrize.id){
      if(name)claimPrize.legalName=name.value.trim();
      if(file)claimPrize.identityFile=identityFile(file);
    }
    renderedClaimId=claimPrize.id;
    originalChecks();
    if(claimPrize.amount>=250){
      const holder=document.createElement('div');holder.className='checkitem';
      holder.innerHTML='<label>'+ (LANG==='vi'?'Họ tên pháp lý':'Legal name')+'<input id="claimLegalName" required value="'+escape(claimPrize.legalName)+'"></label><label>'+(LANG==='vi'?'Giấy tờ tùy thân':'Identification')+'<input id="claimIdentityFile" type="file" accept="image/*,application/pdf">'+(claimPrize.identityFile?'<small>'+escape(claimPrize.identityFile.name)+'</small>':'')+'</label>';
      $('claimList').append(holder);
      $('claimLegalName').oninput=event=>{claimPrize.legalName=event.target.value.trim();updateClaimSubmit();};
      $('claimIdentityFile').onchange=event=>{claimPrize.identityFile=identityFile(event.target.files[0]);updateClaimSubmit();};
    }
    updateClaimSubmit();
  };
  let approvalTimer;
  function scheduleApprovals(){
    clearTimeout(approvalTimer);
    const pending=S.prizes.filter(row=>row.status==='review'&&Number.isFinite(Date.parse(row.submittedAt)));
    if(!pending.length)return;
    const due=Math.min(...pending.map(row=>Date.parse(row.submittedAt)+4500));
    approvalTimer=setTimeout(()=>{
      if(S.spinning||spinPending||!$('claimModal').classList.contains('hidden')){scheduleApprovals();return;}
      restore(shared.read().spins[id]||S);const before=shared.copy(S);
      const ready=S.prizes.filter(row=>row.status==='review'&&Date.parse(row.submittedAt)+4500<=Date.now());
      for(const prize of ready){
        prize.status='done';prize.approvedAt=new Date().toISOString();
        if(S.giftCards.some(card=>card.prizeId===prize.id))continue;
        const code=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
        S.giftCards.unshift({prizeId:prize.id,amount:prize.amount,code:'NX-GIFT-'+code.slice(0,4)+'-'+code.slice(4),note:prizeName(prize)});
      }
      // The source PO prototype simulates approval; no real gift card is issued.
      if(ready.length&&saveOrRestore(before)){renderAll();toast(t('toastApproved'));confettiBurst();}
      scheduleApprovals();
    },Math.max(500,due-Date.now()));
  }
  submitClaim=function(){
    if(S.spinning||spinPending||!claimPrize||claimPrize.status!=='pending'||prizeExpired(claimPrize)||!SOCIALS.every(row=>claimPrize.checks[row.key]))return;
    if(claimPrize.amount>=250&&(!claimPrize.legalName?.trim()||!claimPrize.identityFile))return;
    const draft=shared.copy(claimPrize);restore(shared.read().spins[id]||S);
    claimPrize=S.prizes.find(row=>row.id===draft.id);if(!claimPrize||claimPrize.status!=='pending'||prizeExpired(claimPrize))return;
    const before=shared.copy(S);
    Object.assign(claimPrize,{checks:draft.checks,legalName:draft.legalName,identityFile:draft.identityFile,status:'review',submittedAt:new Date().toISOString()});
    if(!saveOrRestore(before)){claimPrize=S.prizes.find(row=>row.id===draft.id);updateClaimSubmit();return;}
    closeClaim();renderWallet();showTab('wallet');toast(t('toastSubmitted'));scheduleApprovals();
  };
  const oldToggle=toggleCheck;
  toggleCheck=function(key){
    if(S.spinning||spinPending||!claimPrize||claimPrize.status!=='pending')return;
    const draft=shared.copy(claimPrize);restore(shared.read().spins[id]||S);
    claimPrize=S.prizes.find(row=>row.id===draft.id);if(!claimPrize||claimPrize.status!=='pending')return;
    const before=shared.copy(S);claimPrize.legalName=draft.legalName;claimPrize.identityFile=draft.identityFile;oldToggle(key);
    if(!saveOrRestore(before)){claimPrize=S.prizes.find(row=>row.id===draft.id);renderClaimList();}
  };
  const oldRedeem=redeemCredit;redeemCredit=function(){if(S.spinning||spinPending)return;restore(shared.read().spins[id]||S);const before=shared.copy(S);if(S.credit<25){toast(t('toastCreditNo'));return;}oldRedeem();saveOrRestore(before);};
  markEntryShown();closeEntryPopup();showEntryPopup=function(){};
  const originalLanguage=setLang;setLang=function(value){originalLanguage(value);$('hubSub').hidden=true;document.documentElement.lang=value;};
  const layout=document.createElement('style');layout.textContent='#tabbar{position:sticky;left:0;right:auto;transform:none;bottom:0;width:100%;max-width:none;z-index:20}#app{padding-bottom:24px}';document.head.append(layout);
  for(const selector of ['header','.lang-toggle','#tourBtn','#tourStartBtn','#welcomeBanner'])document.querySelector(selector)?.setAttribute('hidden','');
  I18N.en.oddsNote=I18N.en.oddsNote.replace('Outcomes are decided randomly server-side. ','');
  I18N.vi.oddsNote=I18N.vi.oddsNote.replace('Kết quả do máy chủ quyết định ngẫu nhiên. ','');
  window.NEXORA_COMMUNITY_MODULE={setLanguage(value){setLang(value==='vi'?'vi':'en');renderAll();},navigate(route,context){if(!S.spinning&&!spinPending)restore(shared.read().spins[id]||S);renderAll();scheduleApprovals();if(context?.wheelTab)showTab(context.wheelTab);},deactivate(){tourStop();clearTimeout(approvalTimer);}};
  const beforeWelcome=shared.copy(S),welcome=!S.welcomed;
  if(welcome){S.welcomed=true;S.welcomeSpin++;}
  setLang(localStorage.getItem('nexora-v31:nexora-community-language')||'en');renderAuthState();renderAll();
  if(saveOrRestore(beforeWelcome)&&welcome){$('welcomebar').innerHTML=t('welcomeBanner');$('welcomebar').classList.remove('hidden');setTimeout(()=>$('welcomebar').classList.add('hidden'),9000);}
  scheduleApprovals();
})();
