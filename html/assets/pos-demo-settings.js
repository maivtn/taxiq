(function () {
  'use strict';
  const key = 'nexora:pos-demo-settings:v1';
  const sessionKey = 'nexora:pos-demo-account:v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaultMethods = [
    ['cash','Cash'],['card','Card'],['gift-card','Gift Card'],['crypto','Crypto'],['split','Split Pay'],
    ['zelle','Zelle'],['venmo','Venmo'],['cash-app','Cash App'],['paypal','PayPal'],['apple-pay','Apple Pay']
  ];
  const defaultRules = {contact:true,notes:true,discount:true,price:true,cancel:true,refund:true};
  const defaults = {
    accounts:[{id:'owner',name:'Brian Nguyen',role:'owner',pin:'1234'},{id:'manager',name:'Mai Nguyen',role:'manager',pin:'5678'},
      {id:'cashier',name:'Front Desk',role:'cashier'},{id:'technician',name:'Kayla Bui',role:'technician'},{id:'cleaner',name:'Salon Cleaner',role:'cleaner'}],
    rules:defaultRules,
    payment:{methods:defaultMethods.map(([id,label])=>({id,label,enabled:true,discountType:['zelle','venmo','cash-app','paypal','apple-pay'].includes(id)?'inherit':'none',discountValue:0})),
      cardFeeEnabled:true,cardFeePercent:3,walletEnabled:true,walletPercent:5,tipSplit:'proportional'},
    audit:[]
  };
  let fallback = clone(defaults), accountId = 'owner', saveError = null;
  try { accountId = sessionStorage.getItem(sessionKey) || accountId; } catch (_) {}
  function load() {
    try { const saved = JSON.parse(localStorage.getItem(key)); if(saved?.accounts && saved?.payment?.methods) return saved; } catch (_) {}
    return clone(fallback);
  }
  function save(value,publish=true) {
    saveError = null;
    try { localStorage.setItem(key,JSON.stringify(value)); } catch (error) { saveError = error; return false; }
    fallback = clone(value);
    if(publish)window.dispatchEvent(new CustomEvent('nexora:pos-settings-changed'));
    return true;
  }
  const account = () => load().accounts.find(a=>a.id===accountId) || load().accounts.find(a=>a.role==='cashier');
  function audit(action,subject,approver,reason='') {
    const data=load();
    data.audit.unshift({id:crypto.randomUUID(),action,subject:String(subject||'Salon'),operator:account().name,approver:approver.name,reason,at:new Date().toISOString()});
    data.audit=data.audit.slice(0,100);
    return save(data,false);
  }
  async function approve(action,subject,config={}) {
    const user=account(),ownerOnly=config.ownerOnly || ['settings','access'].includes(action),copy=config.copy;
    if(user.role==='cleaner' && action!=='clean') return false;
    if(user.role==='technician'&&['cancel','refund','override','station-settings','settings','access'].includes(action))return false;
    if(!config.force && !ownerOnly && action!=='override' && !load().rules[action]) return true;
    if(!window.Swal) return false;
    const eligible=load().accounts.filter(a=>a.pin && (ownerOnly?a.role==='owner':['owner','manager'].includes(a.role)));
    const result=await Swal.fire({title:copy?.title || (ownerOnly?'Owner PIN approval':'Manager / Owner approval'),
      html:`<p class="pos-muted">${esc(config.label || action)} · ${esc(subject || 'Salon')}</p><label class="pos-approval-field">${esc(copy?.accountLabel || 'Approver')}<select id="pos-approval-account">${eligible.map(a=>`<option value="${esc(a.id)}">${esc(a.name)} · ${esc(a.role)}</option>`).join('')}</select></label><label class="pos-approval-field">${esc(copy?.pinLabel || 'Personal demo PIN')}<input id="pos-approval-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="6"></label>${config.reason?'<label class="pos-approval-field">Reason<textarea id="pos-approval-reason" maxlength="160" placeholder="At least 5 characters"></textarea></label>':''}<p class="pos-muted">${copy?eligible.map(a=>esc(a.name)+' · '+esc(a.pin)).join(' · '):'Demo PINs: Brian 1234 · Mai 5678'}</p>`,
      customClass:{popup:'pos-swal'},showCancelButton:true,confirmButtonText:copy?.confirm || 'Approve this action',cancelButtonText:copy?.cancel || 'Cancel',confirmButtonColor:'#4648d4',
      preConfirm:()=>{
        const approver=eligible.find(a=>a.id===document.getElementById('pos-approval-account').value);
        const pin=document.getElementById('pos-approval-pin').value;
        const reason=document.getElementById('pos-approval-reason')?.value.trim() || '';
        if(!approver || pin!==approver.pin){
          if(copy&&approver){const input=document.getElementById('pos-approval-pin');input.required=true;input.pattern=String(approver.pin).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');input.reportValidity();}
          else Swal.showValidationMessage('The PIN does not match this approver.');
          return false;
        }
        if(config.reason&&reason.length<5){Swal.showValidationMessage('Enter a reason of at least 5 characters.');return false;}
        return {approver,reason};
      }});
    if(!result.isConfirmed) return false;
    if(!audit(config.label || action,subject,result.value.approver,result.value.reason)) return false;
    return result.value;
  }
  async function switchAccount(poCopy=false) {
    if(!window.Swal)return;
    const accounts=load().accounts;
    const result=await Swal.fire({title:poCopy?'POS ACCOUNT':'Switch POS account',input:'select',inputOptions:Object.fromEntries(accounts.map(a=>[a.id,a.name+' · '+a.role])),inputValue:accountId,
      showCancelButton:true,cancelButtonText:'Cancel',confirmButtonText:'Continue',customClass:{popup:'pos-swal'},confirmButtonColor:'#4648d4'});
    if(!result.isConfirmed)return;
    const target=accounts.find(a=>a.id===result.value);if(!target)return;
    if(target.pin){
      const pin=await Swal.fire({title:poCopy?'Sign in with PIN':'Sign in · '+target.name,input:'password',inputAttributes:{inputmode:'numeric',maxlength:'6',autocomplete:'off'},
        text:poCopy?target.name+' · '+target.role:'Use this account’s personal demo PIN.',showCancelButton:true,...(poCopy?{confirmButtonText:'Sign in with PIN',cancelButtonText:'Cancel'}:{}),customClass:{popup:'pos-swal'},
        preConfirm:value=>{if(value!==target.pin){if(poCopy){const input=Swal.getInput();input.required=true;input.pattern=String(target.pin).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');input.reportValidity();}else Swal.showValidationMessage('Incorrect demo PIN.');return false;}return true;}});
      if(!pin.isConfirmed)return;
    }
    accountId=target.id;
    try{sessionStorage.setItem(sessionKey,accountId);}catch(_){}
    window.dispatchEvent(new CustomEvent('nexora:pos-account-changed'));
  }
  function methods() {const enabled=load().payment.methods.filter(m=>m.enabled);return enabled.filter(m=>m.id!=='split'||enabled.some(x=>x.id==='cash')&&enabled.some(x=>x.id==='card'));}
  function pricing(netCents,tipCents,checkout) {
    const p=load().payment,method=checkout.method;
    const portions=method==='split'?[['cash',Math.min(netCents,Math.max(0,Math.round(Number(checkout.splitCash || 0)*100)))],['card',Math.max(0,netCents-Math.max(0,Math.round(Number(checkout.splitCash || 0)*100)))]]:[[method,netCents]];
    let methodDiscountCents=0,feeCents=0,cashPortionCents=0,cardPortionCents=0;
    portions.forEach(([id,base])=>{
      const rule=p.methods.find(m=>m.id===id);
      const percent=rule?.discountType==='inherit'&&p.walletEnabled?p.walletPercent:rule?.discountType==='percent'?rule.discountValue:0;
      const reduction=Math.min(base,Math.max(0,Math.round(rule?.discountType==='fixed'?Number(rule.discountValue)*100:base*Number(percent)/100)));
      methodDiscountCents+=reduction;
      const fee=id==='card'&&p.cardFeeEnabled?Math.round((base-reduction)*Number(p.cardFeePercent)/100):0;
      feeCents+=fee;
      if(id==='cash')cashPortionCents=base-reduction;
      if(id==='card')cardPortionCents=base-reduction+fee+tipCents;
    });
    return {methodDiscountCents,feeCents,cashPortionCents,cardPortionCents,totalCents:netCents-methodDiscountCents+feeCents+tipCents};
  }
  function allocateTip(lines,tipCents,mode='proportional',manual={}) {
    const names=[...new Set(lines.flatMap(l=>String(l.tech || '').split(',')).map(n=>n.trim()).filter(Boolean))];
    if(!names.length)return {};
    if(mode==='manual'&&names.length===1)return {[names[0]]:tipCents};
    if(mode==='manual')return Object.fromEntries(names.map(n=>[n,Math.round(Number(manual[n] || 0)*100)]));
    const weights=names.map(name=>mode==='proportional'?lines.reduce((sum,l)=>{const techs=String(l.tech || '').split(',').map(n=>n.trim());return sum+(techs.includes(name)?Math.round(Number(l.price || 0)*100)/techs.length:0);},0):1);
    const total=weights.reduce((s,w)=>s+w,0);let running=0,previous=0;
    return Object.fromEntries(names.map((name,i)=>{running+=total?weights[i]:1;const next=Math.round(tipCents*running/(total || names.length));const amount=next-previous;previous=next;return [name,amount];}));
  }
  function timeHtml(value) {
    const d=new Date(value);
    return `<span class="credits-history-date">${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}<small>${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</small></span>`;
  }
  function sessionHtml() {const a=account();return `<div class="pos-session"><span>Demo account · <strong>${esc(a.name)}</strong> · ${esc(a.role)}</span><button type="button" data-pos-switch>Switch POS account</button></div>`;}
  document.addEventListener('click',e=>{const button=e.target.closest('[data-pos-switch]');if(button)switchAccount(!!button.closest('[data-direct-root]'));});
  window.addEventListener('storage',e=>{if(e.key===key)window.dispatchEvent(new CustomEvent('nexora:pos-settings-changed'));});
  window.NEXORA_POS_DEMO={load,save,account,approve,audit,methods,pricing,allocateTip,timeHtml,sessionHtml,esc,lastSaveError:()=>saveError};
})();
