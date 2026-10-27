(function () {
  'use strict';
  const root=document.querySelector('[data-direct-root]');if(!root)return;
  const data=window.NEXORA_FRONT_DESK_DATA;
  const demo=window.NEXORA_POS_DEMO,esc=demo.esc,draftKey='nexora:direct-checkout-customer-draft:v1';
  const money=n=>'$'+(Number(n || 0)/100).toFixed(2),digits=v=>String(v || '').replace(/\D/g,'');
  const hasPhoneCountryCode=value=>/^\s*\+1/.test(value) || /^1\d{10}$/.test(digits(value));
  const phoneDigits=value=>{const number=digits(value);return (hasPhoneCountryCode(value)?number.slice(1):number).slice(0,10);};
  function formatPhoneInput(value){
    const number=phoneDigits(value);
    if(!number)return '';
    if(number.length<=3)return '('+number;
    return '('+number.slice(0,3)+') '+number.slice(3,6)+(number.length>6?'-'+number.slice(6):'');
  }
  function maskPhoneInput(input,inputType){
    const raw=input.value,cursor=input.selectionStart,formatted=formatPhoneInput(raw);
    if(raw!==formatted){
      const before=Math.max(0,digits(raw.slice(0,cursor)).length-(hasPhoneCountryCode(raw)?1:0));
      input.value=formatted;
      if(cursor!==null){
        let position=0,count=0;
        while(position<formatted.length&&count<before){if(/\d/.test(formatted[position]))count++;position++;}
        if(inputType==='deleteContentForward')while(position<formatted.length&&/\D/.test(formatted[position]))position++;
        input.setSelectionRange(position,position);
      }
    }
    guest.phone=phoneDigits(input.value);guest.status='';save();updatePrimary();
  }
  const customerName=value=>value==='Demo customer A'?'Customer A':String(value || '');
  const catalog=()=>window.NEXORA_SALON_DATA.loadCatalog().services.filter(s=>s.active!==false);
  const technicians=()=>window.NEXORA_SALON_DATA.loadCatalog().technicians.filter(t=>t.active).map(t=>t.name);
  const category=s=>s.categoryName || s.requiredSkill || 'Other';
  const canCheckout=()=>['owner','manager','cashier'].includes(demo.account().role);
  const icons={arrow:'arrow-left',check:'check',plus:'plus',ticket:'receipt-text',card:'credit-card',info:'info',user:'user-round',close:'x',search:'search',users:'users-round',link:'link',lock:'lock-keyhole',discount:'badge-percent',arrowRight:'arrow-right',up:'arrow-up',down:'arrow-down',chevron:'chevron-down',cash:'banknote',gift:'gift',crypto:'bitcoin',split:'split',wallet:'wallet',more:'ellipsis',edit:'pencil',cancel:'ban',print:'printer',sms:'message-square',addon:'corner-down-right'};
  const icon=(name,className='')=>`<i data-lucide="${icons[name] || icons.ticket}" class="dc-icon ${className}" aria-hidden="true"></i>`;
  function renderIcons(scope=root){
    scope.querySelectorAll('.other-tech-work>summary,.checkout-detail>summary').forEach(summary=>{
      if(!summary.querySelector('.dc-chevron'))summary.insertAdjacentHTML('beforeend',icon('chevron','dc-chevron'));
    });
    window.lucide?.createIcons();
  }
  const paymentImages={
    cash:'cash.png',card:'credit-debit-card-icon.png','gift-card':'gift_card.png',crypto:'crypto.png',split:'split_pay.png',zelle:'zelle.png',
    'cash-app':'cash-app.svg',venmo:'venmo.svg',paypal:'paypal.svg','apple-pay':'apple.svg','apple-cash':'apple.svg',
    vlinkpay:'vlinkpay-logo.png','vlinkpay-wallet':'vlinkpay-logo.png'
  };
  const paymentIcon=method=>paymentImages[method]?`<img class="dc-payment-art" src="../assets/pos-payment/${paymentImages[method]}" alt="" width="20" height="20" aria-hidden="true">`:icon('wallet');
  const addons=[
    {id:'gel-pedicure',name:'Add Shellac With Pedicure Service',price:20,durationMin:15},
    {id:'take-off',name:'Take Off With Service',price:10,durationMin:10},
    {id:'special-shape',name:'Special Shapes',price:7,durationMin:5},
    {id:'nail-repair',name:'Nail Repair',price:5,durationMin:5},
    {id:'french-tip',name:'French Tips / Color Tips',price:15,durationMin:10},
    {id:'paraffin',name:'Paraffin Wax',price:15,durationMin:10},
    {id:'hot-stone',name:'Hot Stone Massage',price:10,durationMin:10}
  ];
  let records=[],current=null,stage=1,view='list',warning='',search='',filter='all',contactUntil=0;
  let guest={phone:'',customer:'',status:''},tipMode='percent',picker='',addonPicker='',pickerCategory='all',pickerSearch='',discountOpen=new Set();
  const detailState=new Map();
  let servicesWorkspace,servicesRoot;
  try{records=data.all();}catch(error){warning=error.message;}
  // UI copy: PO V34 customerResultHtml, itemEditor, groupHtml, tipPickerHtml, summaryHtml and renderModal.
  const actionIcons={'custom-service':'plus','cancel-checkout':'cancel',print:'print',sms:'sms','saved-receipt':'ticket',lookup:'search','different-customer':'user','reveal-contact':'lock',list:'arrow'};
  const actionColors={'service-picker':'dc-green','addon-picker':'dc-blue','extra-service':'dc-blue','custom-service':'dc-purple','line-discount':'dc-amber','reveal-contact':'dc-purple','different-customer':'dc-blue','add-group':'dc-purple',print:'dc-blue',sms:'dc-green','saved-receipt':'dc-purple',open:'dc-purple'};
  const button=(label,action,attrs='',style='btn-secondary')=>`<button type="button" class="btn ${style} ${actionColors[action] || ''}" data-direct-action="${action}" ${attrs}>${actionIcons[action]&&!label.includes('data-lucide=')?icon(actionIcons[action]):''}${label}</button>`;
  const phone=()=>{const value=digits(current?.phone || guest.phone);return contactUntil>Date.now()?value.replace(/^(\d{3})(\d{3})(\d{4})$/,'($1) $2-$3'):'••• ••• '+value.slice(-4);};
  const isCancelled=t=>!!t&&(t.cancelled||t.status==='cancelled');
  const hasPayment=t=>!!(t?.payment||t?.splitBills?.bills?.some(b=>b.payment));
  const canCancel=t=>canCheckout()&&!!t?.directCheckout&&!isCancelled(t)&&!hasPayment(t);
  const cancelNeedsApproval=t=>['in-service','ready-to-pay','ready'].includes(t.status)||t.lines.some(l=>['in-service','completed'].includes(l.status));
  function persist(ticket=current){try{if(ticket)data.save(ticket);return true;}catch(error){warning=String(error.message || error);return false;}}
  function markApproval(action){current.pendingApproval=action;current.poPendingApprovals=[...new Set([...(current.poPendingApprovals || []),action])];}
  function save(){if(current){current.services=current.lines.map(l=>l.name);current.tech=[...new Set(current.lines.flatMap(l=>String(l.tech || '').split(',')).map(n=>n.trim()).filter(Boolean))].join(', ');persist();}else try{localStorage.setItem(draftKey,JSON.stringify(guest));}catch(_){}
  }
  function setUrl(){
    const url=new URL(location.href);url.searchParams.delete('mode');
    if(view==='editor'||view==='receipt'||view==='legacy'||view==='cancelled'){
      url.searchParams.delete('view');
      if(view==='editor')url.searchParams.set('step',stage);else url.searchParams.delete('step');
      if(current)url.searchParams.set('checkoutId',current.id);else url.searchParams.delete('checkoutId');
    }else{url.searchParams.delete('checkoutId');url.searchParams.delete('step');url.searchParams.set('view','list');}
    history.replaceState(null,'',url);
  }
  function normalize(t){
    t.checkout=t.checkout || {tip:0,tipType:'fixed',method:'cash',cash:'',receipt:'none'};t.checkout.tipSplitMode=t.checkout.tipSplitMode || demo.load().payment.tipSplit;
    if(!t.poGroups){const names=[...new Set(t.lines.map(l=>String(l.tech || '').split(',')[0].trim()))];t.poGroups=(names.length?names:['']).map(name=>({id:crypto.randomUUID(),tech:name}));t.lines.forEach(l=>{const name=String(l.tech || '').split(',')[0].trim();l.groupId=t.poGroups.find(g=>g.tech===name).id;});}
    if(!t.poGroups.length)t.poGroups.push({id:crypto.randomUUID(),tech:''});
    return t;
  }
  function newCheckout(){if(!canCheckout())return;current=null;guest={phone:'',customer:'',status:''};try{const saved=JSON.parse(localStorage.getItem(draftKey));if(saved)guest={...guest,...saved,status:''};}catch(_){}guest.phone=phoneDigits(guest.phone);tipMode='percent';stage=1;view='editor';warning='';contactUntil=0;picker='';addonPicker='';pickerCategory='all';pickerSearch='';discountOpen.clear();detailState.clear();render();root.querySelector('#customer-phone')?.focus();}
  function lookup(){
    const value=digits(guest.phone);if(value.length!==10){warning='Enter a 10-digit customer phone number.';render();return;}
    const appointments=(window.NEXORA_APPOINTMENTS_STORE?.loadAll() || []).map(t=>({customer:t.customerName,phone:t.phone}));
    const sample=[{customer:'Customer A',phone:'2025550101'},{customer:'Quan',phone:'5550122807'},{customer:'Brian',phone:'5550161092'},{customer:'DJ',phone:'5550195421'},{customer:'Leo',phone:'5550178804'}];
    const found=[...records,...appointments,...sample].find(t=>digits(t.phone)===value);
    guest={phone:value,customer:customerName(found?.customer),status:found?'existing':'new'};warning='';save();if(found&&ensureCustomer())stage=2;render();root.querySelector(found?'[data-tw-group-tech],[data-tw-new-tech]':'#customer-name')?.focus();
  }
  function ensureCustomer(){
    if(isCancelled(current)){warning='Cancelled';return false;}
    if(current)return true;
    if(digits(guest.phone).length!==10||!guest.status){warning='Find the customer by phone first.';return false;}
    if(!guest.customer.trim()){warning='Enter the new customer’s name.';return false;}
    const existing=data.openForPhone(guest.phone);
    if(existing){
      location.href=data.url(existing,'edit',new URLSearchParams(location.search).get('returnTo') || 'checkout');return false;
    }
    current=normalize({id:'DC-'+crypto.randomUUID().slice(0,8).toUpperCase(),directCheckout:true,customer:guest.customer.trim(),phone:digits(guest.phone),customerType:guest.status==='existing'?'returning':'new',createdAt:new Date().toISOString(),checkedIn:false,status:'draft',lines:[],services:[],tech:'',note:'',checkout:{tip:0,tipType:'percent',tipSplitMode:demo.load().payment.tipSplit,method:demo.methods().find(m=>m.id!=='split')?.id || 'cash',cash:'',receipt:'none'}});
    records.unshift(current);if(!persist()){records.shift();current=null;return false;}try{localStorage.removeItem(draftKey);}catch(_){}return true;
  }
  function approveCheckout(action,subject,config={}){return demo.approve(action,subject,{...config,copy:{title:action==='contact'?'Customer data PIN approval':'Manager PIN approval',accountLabel:'POS ACCOUNT',pinLabel:'PIN',confirm:'Approve action',cancel:'Cancel'}});}
  function total(method){if(!current)return {subtotalCents:0,discountCents:0,netCents:0,tipCents:0,totalCents:0};return window.NEXORA_TICKET_WORKSPACE.totals(method?{...current,payment:null,checkout:{...current.checkout,method}}:current);}
  function requiresApproval(){return (current?.poPendingApprovals || (current?.pendingApproval?[current.pendingApproval]:[])).some(action=>demo.load().rules[action]);}
  function groups(){return current?.poGroups || [];}
  function groupLines(g){return current.lines.filter(l=>l.groupId===g.id);}
  function mainLines(g){return groupLines(g).filter(l=>!l.parentLineId);}
  function summaryLines(g){
    const lines=groupLines(g),mains=mainLines(g),parentIds=new Set(mains.map(l=>l.id));
    return [...mains.flatMap(l=>[l,...lines.filter(a=>a.parentLineId===l.id)]),...lines.filter(l=>l.parentLineId&&!parentIds.has(l.parentLineId))];
  }
  function lineNet(l){const base=Math.round(Number(l.price || 0)*100);const reduction=Math.min(base,Math.round(l.discount?.type==='fixed'?Number(l.discount.value || 0)*100:base*Number(l.discount?.value || 0)/100));return base-reduction;}
  function discountBreakdown(t=total()){const serviceDiscountCents=current.lines.reduce((sum,l)=>sum+Math.round(Number(l.price || 0)*100)-lineNet(l),0);return {serviceDiscountCents,orderDiscountCents:Math.max(0,(t.discountCents || 0)-serviceDiscountCents)};}
  function orderLines(){current.lines=groups().flatMap(g=>groupLines(g));}
  function detailAttrs(key,initial=false){return `data-detail-key="${key}" ${(detailState.has(key)?detailState.get(key):initial)?'open':''}`;}
  function coTechText(name){return `<span class="co-tech-text">+ ${esc(name)} · shared service</span>`;}
  function summaryNameHtml(l){return (l.parentLineId?icon('addon','dc-addon-icon'):'')+esc(l.name || 'Custom service')+(l.coTech?'<span class="summary-co-tech">'+coTechText(l.coTech)+'</span>':'');}
  function lineDiscountLabel(l){return (discountOpen.has(l.id)?'▾':'▸')+' Discount'+(l.discount?.value?' ('+money(Math.round(Number(l.price || 0)*100)-lineNet(l))+' off)':'');}
  function customerHtml(){
    const name=customerName(current?.customer || guest.customer),found=current||guest.status==='existing',newGuest=current?.customerType==='new';
    const contactLabel=contactUntil>Date.now()?'Renew contact access':'View full contact · approval required';
    if(stage>=2&&current)return `<section class="customer-strip" aria-label="Customer"><span class="customer-avatar">${esc(name.trim().slice(0,1).toUpperCase())}</span><div class="customer-strip-copy"><strong>${esc(name)}</strong><span>${esc(phone())} <span class="customer-type">${newGuest?'New customer':'Existing customer found'}</span></span></div><div class="customer-strip-actions">${button(icon('lock'),'reveal-contact',`aria-label="${contactLabel}" title="${contactLabel}"`,'icon-button')}${button(icon('edit')+' Customer','go-step','data-step="1"','btn-quiet btn-small')}</div></section>`;
    return `<section class="panel form-panel customer-form"><div class="customer-intro"><span class="lookup-icon">${icon('search')}</span><div><h3>Find customer</h3></div></div><label class="inline-label" for="customer-phone">Customer phone · required</label><div class="lookup-row"><input class="input" id="customer-phone" type="tel" inputmode="tel" autocomplete="off" placeholder="(000) 000-0000" value="${esc(found?phone():formatPhoneInput(guest.phone))}" ${found?'readonly':''}>${button('Find customer','lookup',found?'disabled':'','btn-primary')}</div><div aria-live="polite">${found?`<div class="identity-card found"><b>${newGuest?'New customer':'Existing customer found'}</b><strong>${esc(name)}</strong><span>${esc(phone())} · ${contactUntil>Date.now()?'Contact approved for this record':'Phone hidden by permission'}</span><div class="customer-private-actions">${button(contactLabel,'reveal-contact','','btn-small')}${button('Different customer','different-customer','','btn-quiet btn-small')}</div></div>`:guest.status==='new'?`<div class="identity-card new"><b>New customer</b><p>No matching phone number. Enter the guest's name to continue.</p><label for="customer-name">Customer name · required</label><input class="input" id="customer-name" autocomplete="off" placeholder="Enter first and last name" value="${esc(guest.customer)}"></div>`:'<p class="lookup-examples">Demo: enter <b>202-555-0101</b> for an existing customer, or <b>202-555-0199</b> for a new customer.</p>'}</div></section>`;
  }

  function servicesHtml(){return '<section class="ticket-workspace" data-direct-services></section>';}
  function openServices(){
    const host=root.querySelector('[data-direct-services]');if(!host)return;
    if(!servicesWorkspace){
      servicesRoot=host;
      servicesWorkspace=window.NEXORA_TICKET_WORKSPACE.mount(servicesRoot,{
        stagingLayout:true,servicesOnly:true,catalog,
        technicians:()=>technicians().map(name=>({name,status:'available'})),
        onChange(ticket){
          current=ticket;
          const previous=new Map(groups().map(group=>[group.tech,group]));
          current.poGroups=[...new Set(current.lines.map(line=>line.tech || ''))].map(tech=>previous.get(tech) || {id:crypto.randomUUID(),tech});
          current.lines.forEach(line=>{line.groupId=current.poGroups.find(group=>group.tech===(line.tech || '')).id;});
          save();updateSummary();
        },
        onModeChange(){},onBack(){}
      });
    }else host.replaceWith(servicesRoot);
    servicesWorkspace.open(current,'edit');
  }
  // PO source: from-po/nexora-pos-12-10/nexora-pos-prototype-v34.html, checkoutPreviewHtml.

  function previewHtml(){return `<aside class="summary-panel checkout-preview" aria-label="Ticket preview"><div class="preview-heading"><span class="preview-icon">${icon('ticket')}</span><div><p class="summary-title">TICKET PREVIEW</p><h3>${esc(customerName(current.customer))}</h3><span>${esc(phone())}</span></div></div><div class="preview-progress"><span class="done">${icon('check')} Customer found</span><span class="current">2 &nbsp; Assign technician and service</span><span>3 &nbsp; Payment and checkout</span></div><p class="preview-message">Choose a technician and add a main service. The price, discount, tip, and payment choices will appear here.</p></aside>`;}
  function summaryRows(){return groups().map(g=>`<div class="summary-tech"><div class="summary-tech-head"><span>${esc(g.tech || 'Technician needed')}</span><strong data-po-summary-group="${g.id}">${money(groupLines(g).reduce((sum,l)=>sum+lineNet(l),0))}</strong></div>${summaryLines(g).map(l=>`<div class="summary-service"><div class="summary-line ${l.parentLineId?'addon-summary':''}"><span data-po-summary-name="${l.id}">${summaryNameHtml(l)}</span><strong data-po-summary-line="${l.id}">${money(lineNet(l))}</strong></div></div>`).join('')}</div>`).join('');}
  function tipHtml(){
    const p=current.checkout,values=tipMode==='percent'?[0,10,15,18,20,25]:[0,5,10,20];
    return `<div class="tip-picker"><div class="tip-picker-head"><strong>Guest tip</strong><span data-po-tip-total>${money(total().tipCents)}</span></div><div class="tip-entry-row"><div class="tip-mode" role="group" aria-label="Choose tip entry type">${[['percent','% of services'],['amount','Dollar amount'],['custom','Custom']].map(([id,label])=>button(label,'tip-mode',`data-value="${id}" aria-pressed="${tipMode===id}"`,tipMode===id?'selected':'')).join('')}</div><label class="tip-inline-input"><span>${tipMode==='percent'?'%':'$'}</span><input type="number" min="0" max="${tipMode==='percent'?100:99999}" step="0.01" inputmode="decimal" aria-label="${tipMode==='percent'?'Tip percent':'Tip dollar amount'}" data-direct-field="tip" value="${p.tip || 0}"></label></div>${tipMode!=='custom'?`<div class="tip-presets" role="group" aria-label="${tipMode==='percent'?'Tip percent':'Tip dollar amount'}">${values.map(value=>button(value===0?'No tip':tipMode==='percent'?value+'%':money(value*100),'tip-value',`data-value="${value}" aria-pressed="${Number(p.tip)===value}"`,Number(p.tip)===value?'selected':'')).join('')}</div>`:''}${tipMode==='percent'?'<p class="hint">Percent uses discounted services before wallet discounts, card fees, or tax.</p>':''}</div>`;
  }
  function allocations(){const t=total();return demo.allocateTip(current.lines,t.tipCents || 0,current.checkout.tipSplitMode,current.checkout.tipAllocations);}
  function tipAllocationHtml(){
    const values=allocations(),p=current.checkout,names=Object.keys(values),labels={proportional:'By work',fifty:'50 / 50',equal:'Equal',manual:'Manual'};
    if(!names.length)return '<p class="hint">Add work and choose technicians to allocate the tip.</p>';
    if(names.length===1)return `<div class="tip-auto"><span>${esc(names[0])}</span><strong>${money(values[names[0]])}</strong></div><p class="hint">One technician receives the full tip.</p>`;
    return `<div class="tip-allocation"><div class="tip-allocation-head"><strong>Split tip between technicians</strong><small>Salon default: ${esc(labels[demo.load().payment.tipSplit] || labels.proportional)}</small></div><div class="tip-split-modes" role="group" aria-label="Tip split method">${Object.entries(labels).map(([id,label])=>button(label,'tip-split',`data-value="${id}" ${id==='fifty'&&names.length!==2?'disabled':''} aria-pressed="${p.tipSplitMode===id}"`,p.tipSplitMode===id?'selected':'')).join('')}</div><div class="tip-split-list">${names.map(name=>`<div class="tip-split-row"><span>${esc(name)}</span>${p.tipSplitMode==='manual'?`<label class="tip-input-wrap">$ <input type="number" min="0" step="0.01" inputmode="decimal" data-direct-field="tip-allocation" data-tech="${esc(name)}" value="${p.tipAllocations?.[name] || 0}" aria-label="Tip for ${esc(name)}"></label>`:`<strong>${money(values[name])}</strong>`}</div>`).join('')}</div><p class="tip-status ${Object.values(values).reduce((s,n)=>s+n,0)===(total().tipCents || 0)?'balanced':'unbalanced'}">${tipStatusText()}</p></div>`;
  }
  function tipStatusText(){const tip=total().tipCents || 0,remaining=tip-Object.values(allocations()).reduce((sum,value)=>sum+value,0);return remaining===0?`Allocated ${money(tip)} of ${money(tip)}`:remaining>0?`${money(remaining)} still to allocate`:`${money(-remaining)} over the guest's tip`;}

  function paymentHtml(){
    const p=current.checkout,methods=demo.methods(),primary=methods.filter(m=>['cash','card','zelle','gift-card','split'].includes(m.id)),other=methods.filter(m=>!primary.includes(m));
    const selectedOther=other.find(m=>m.id===p.method);
    const chip=m=>button(`<span class="payment-chip-icon ${paymentImages[m.id]?'has-image':''}" aria-hidden="true">${paymentIcon(m.id)}</span><span class="payment-chip-copy"><b>${esc(m.id==='card'?'Card':m.label)}</b><small>${money(total(m.id).totalCents)}</small></span>`,'payment',`data-value="${esc(m.id)}" aria-pressed="${p.method===m.id}" aria-label="${esc(m.label)} · ${money(total(m.id).totalCents)}"`,'payment-chip payment-'+m.id+' '+(p.method===m.id?'selected':''));
    let entry='';
    if(p.method==='cash'){
      const presets=[20,50,100].map(value=>button('$'+value,'cash-value',`data-value="${value}" ${value*100<total().totalCents?'hidden':''}`,'btn-small')).join('');
      entry=`<div class="cash-entry"><label class="po-tip-entry">Cash<input class="input" type="number" step="0.01" inputmode="decimal" data-direct-field="cash" required min="${(total().totalCents/100).toFixed(2)}" value="${esc(p.cash)}" placeholder="${(total().totalCents/100).toFixed(2)}"></label><div class="cash-presets">${button(money(total().totalCents),'cash-value','data-exact="true"','btn-small')}${presets}</div></div>`;
    }else if(p.method==='split'){
      entry=`<label class="po-tip-entry">Cash portion<input class="input" type="number" min="0" step="0.01" inputmode="decimal" data-direct-field="splitCash" required max="${(total().netCents/100).toFixed(2)}" value="${esc(p.splitCash ?? '')}"></label><p class="hint">The card fee applies only to the card service portion. A payment discount applies to its configured portion. Tip is excluded from both bases.</p>`;
    }else if(p.method==='gift-card'){
      entry=`<label class="po-tip-entry">Gift Card code · demo<input class="input" data-direct-field="giftCode" required value="${esc(p.giftCode || '')}" placeholder="DEMO-GIFT-100"></label>`;
    }
    return `<div class="payment-choice-bar" role="group" aria-label="Payment methods">${primary.map(chip).join('')}${other.length?button(`<span class="payment-chip-icon" aria-hidden="true">${icon(p.moreOpen?'chevron':'more')}</span><span class="payment-chip-copy"><b>${p.moreOpen?'Less':selectedOther?esc(selectedOther.label):'More'}</b><small>${selectedOther?money(total().totalCents):other.length+' options'}</small></span>`,'payment-more',`aria-expanded="${!!p.moreOpen}"`,'payment-chip payment-more '+(selectedOther?'selected':'')):''}</div>${p.moreOpen?`<div class="payment-choice-bar payment-choice-extra" role="group" aria-label="More payment methods">${other.map(chip).join('')}</div>`:''}${entry}<p class="estimate-footnote">Discounts and card fees apply to the selected method. Tip is included; tax is not calculated in this prototype.</p>`;
  }
  function summaryHtml(){
    const t=total(),discounts=discountBreakdown(t),splitLabels={proportional:'By work',fifty:'50 / 50',equal:'Equal',manual:'Manual'};
    return `<aside class="summary-panel payment-panel" aria-label="Checkout summary"><div class="summary-heading"><span class="preview-icon">${icon('card')}</span><div><h3>Payment & checkout</h3></div></div><div class="summary-scroll"><details class="checkout-detail work-detail" ${detailAttrs('work')}><summary><span>${icon('ticket')} Work by technician</span><strong data-po-total="net">${money(t.netCents)}</strong></summary><div class="detail-content">${summaryRows()}</div></details><div class="summary-block">${tipHtml()}<details class="checkout-detail tip-detail" ${detailAttrs('tip-split',current.checkout.tipSplitMode==='manual')}><summary><span>${icon('users')} Tip allocation</span><small>${esc(splitLabels[current.checkout.tipSplitMode] || 'By work')}</small></summary><div class="detail-content" data-po-tip-allocation>${tipAllocationHtml()}</div></details></div><details class="checkout-detail order-discount-detail" ${detailAttrs('order-discount',!!current.discount?.value)}><summary><span>${icon('discount')} Order discount</span><small data-po-order-discount>${money(Math.round(Number(current.discount?.value || 0)*100))}</small></summary><div class="detail-content"><label class="po-tip-entry">Order discount<input class="input" type="number" min="0" step="0.01" inputmode="decimal" data-direct-field="order-discount" value="${current.discount?.value || 0}"></label></div></details><div class="summary-block payment-block"><h4>Payment method & estimate</h4><p class="hint">Choose an accepted Nexora payment method. The amount under each name is the estimate for this ticket.</p><div data-po-payment>${paymentHtml()}</div></div></div><div class="summary-footer"><div class="total-breakdown">${[['Services & add-ons','subtotalCents','subtotal'],['Service discounts','serviceDiscountCents','serviceDiscount'],['Order discount','orderDiscountCents','orderDiscount'],['Guest tip','tipCents','tip'],['Payment discount','methodDiscountCents','methodDiscount'],['Credit Card fee ('+(demo.load().payment.cardFeeEnabled?demo.load().payment.cardFeePercent:0)+'%)','feeCents','fee']].map(([label,key,id])=>`<div class="summary-line ${id==='fee'?'fee-line':''}"><span>${label}</span><strong data-po-total="${id}">${['serviceDiscount','orderDiscount','methodDiscount'].includes(id)?'−':''}${money((key in discounts?discounts:t)[key])}</strong></div>`).join('')}</div><div class="total-line"><span>Total due</span><strong data-po-total="total">${money(t.totalCents)}</strong></div><p class="approval-note" data-po-approval ${requiresApproval()?'':'hidden'}>${icon('lock')} Manager PIN required to approve discounts or changed prices.</p></div></aside>`;
  }
  function editorHtml(){
    const t=total(),ready=stage===1?!!(current||guest.status==='existing'||guest.status==='new'&&guest.customer.trim()):stage===2?!validateServices():true;
    return `<section class="checkout-frame panel checkout-stage-${stage}" aria-label="Checkout flow"><div class="builder-head"><div class="builder-title">${button(icon('arrow'),'list',new URLSearchParams(location.search).get('returnTo')==='staff'?'aria-label="Staff" title="Staff"':'aria-label="Back to checkout list" title="Back to checkout list"','icon-button')}<div><h2>New direct checkout</h2><p class="muted">Find the customer, assign the work, and finish payment.</p>${current?`<p class="muted">${esc(current.id)}</p>`:''}</div></div><span class="direct-note">${icon('check')} No check-in required</span></div><nav class="checkout-progress" aria-label="Three checkout steps">${['Find customer','Technician & services','Payment & checkout'].map((label,index)=>button(`<b>${stage>index+1?icon('check'):index+1}</b><span class="step-copy"><span class="step-full">${label}</span><span class="step-short">${['Find customer','Technician & services','Payment & checkout'][index]}</span></span>`,'go-step',`data-step="${index+1}" aria-label="${label}" ${stage===index+1?'aria-current="step"':''}`,`step-button ${stage===index+1?'active':stage>index+1?'done':''}`)).join('')}</nav><div class="builder-grid"><div class="stack">${customerHtml()}${stage>=2?servicesHtml():''}</div>${stage===3?summaryHtml():stage===2?previewHtml():''}</div><div class="checkout-action-wrap"><p class="review-warning" role="status" data-po-warning>${esc(warning)}</p><div class="checkout-step-actions">${button(icon('arrow')+(stage===1?'Checkout list':stage===2?'Customer':'Services'),'previous','','btn-secondary')}<div class="action-context">${stage===3?`<span>Total due</span><strong data-po-total="total">${money(t.totalCents)}</strong>`:''}</div>${button(stage===3?'Review checkout · <span data-po-total="button">'+money(t.totalCents)+'</span>':(stage===1?'Next · Services':'Next · Payment')+icon('arrowRight'),stage===3?'review':'next',`data-po-primary ${!ready?'disabled':''}`,'btn-primary')}</div></div></section>`;
  }
  async function cancelCheckout(id){
    let ticket=records.find(t=>t.id===id);if(!canCancel(ticket))return;
    const operator=demo.account();
    const reasons=['Guest left','Duplicate ticket','Service declined','Created in error','Other'];
    const result=await Swal.fire({
      title:'Cancel ticket #'+ticket.id+'?',
      html:`<div class="po-cancel-details"><strong>${esc(customerName(ticket.customer))} · ${esc(ticket.id)}</strong><span>${ticket.lines.map(l=>esc(l.name || 'Custom service')).join(', ') || 'No service assigned'}</span><span>Technician: ${esc(ticket.tech || 'Not assigned')}</span></div><p class="po-cancel-warning" id="po-cancel-warning">This removes the ticket from open work and checkout. It will no longer appear in the open ticket list. No payment or refund is processed.</p><label class="pos-approval-field">Reason · required<select id="po-cancel-reason"><option value="">Choose reason</option>${reasons.map(reason=>`<option value="${reason}">${reason}</option>`).join('')}</select></label>`,
      showCancelButton:true,focusCancel:true,cancelButtonText:'Keep ticket',confirmButtonText:'Yes, cancel ticket',confirmButtonColor:'#b6384c',
      customClass:{popup:'pos-swal po-cancel-dialog'},
      didOpen:()=>{Swal.getPopup().setAttribute('role','alertdialog');Swal.getPopup().setAttribute('aria-describedby','po-cancel-warning');},
      preConfirm:()=>{const reason=document.getElementById('po-cancel-reason').value;if(!reasons.includes(reason)){Swal.showValidationMessage('Choose a reason before cancelling.');return false;}return reason;}
    });
    if(!result.isConfirmed||demo.account().id!==operator.id)return;
    ticket=records.find(t=>t.id===id);if(!canCancel(ticket))return;
    const approval=await approveCheckout('cancel',id,{force:cancelNeedsApproval(ticket),label:'Cancel ticket'});
    if(!approval||demo.account().id!==operator.id)return;
    try{records=data.all();}
    catch(error){warning=String(error.message || error);render();return;}
    ticket=records.find(t=>t.id===id);if(!canCancel(ticket))return;
    if(cancelNeedsApproval(ticket)&&!approval.approver){warning=`Review the changes for ${customerName(ticket.customer)} before entering the approver PIN.`;render();return;}
    const previous={...ticket};
    Object.assign(ticket,{status:'cancelled',cancelled:true,cancelReason:result.value,cancelledBy:operator.name,cancelApprovedBy:approval.approver?.name || '',cancelledAt:new Date().toISOString()});
    if(!persist(ticket)){
      Object.keys(ticket).forEach(key=>{if(!(key in previous))delete ticket[key];});Object.assign(ticket,previous);
      render();return;
    }
    const logged=demo.audit('Cancelled ticket #'+id,id,approval.approver || operator,result.value);
    if(current?.id===id){current=null;view='list';contactUntil=0;}
    warning=logged?'':String(demo.lastSaveError() || '');
    render();
  }
  function accountHtml(){return `<button type="button" class="po-account" data-pos-switch>${icon('user')} ${esc(demo.account().name)} · ${esc(demo.account().role)}</button>`;}
  function checkoutCardHtml(t){
    const cancelled=isCancelled(t),status=cancelled?'Cancelled':t.payment?'Paid':'Checkout in progress';
    const openLabel=icon(cancelled?'ticket':'card')+(cancelled?' Cancelled':t.payment?' View saved receipt':' Checkout');
    const openAction=!cancelled&&canCheckout()?`<a class="btn btn-secondary btn-wide dc-purple dc-checkout-link" href="${esc(data.url(t,'checkout','checkout'))}">${openLabel}</a>`:button(openLabel,'open',`data-id="${esc(t.id)}" ${!canCheckout()?'disabled':''}`,'btn-secondary btn-wide');
    return `<article class="ticket-card panel"><div class="ticket-top"><div><span class="ticket-id">${esc(t.id)}</span><h4 class="ticket-name">${esc(customerName(t.customer))}</h4></div><span class="status ${cancelled?'po-cancelled':t.payment?'po-paid':''}">${status}</span></div><div class="ticket-details"><div class="field-label">Services</div><p>${t.lines.map(l=>esc(l.name)).join(', ') || 'No services added yet.'}</p><div class="field-label">Technician</div><p>${esc(t.tech || 'Not assigned')}</p>${cancelled?'<div class="field-label">Reason</div><p>'+esc(t.cancelReason || '—')+'</p>':''}</div><div class="po-ticket-meta">${demo.timeHtml(cancelled?t.cancelledAt:t.payment?.paidAt || t.createdAt)}<strong>${t.payment?money(t.payment.totalCents):''}</strong></div><div class="ticket-actions">${openAction}${canCancel(t)?button('Cancel ticket','cancel-checkout',`data-id="${t.id}" aria-label="Cancel ticket #${esc(t.id)} for ${esc(customerName(t.customer))}"`,'ticket-cancel'):''}</div></article>`;
  }
  function listHtml(){
    const rows=records.filter(t=>!t.payment&&(filter==='cancelled'?isCancelled(t):!isCancelled(t))&&(!search||(customerName(t.customer)+' '+t.id).toLowerCase().includes(search.toLowerCase())||(/^[\d\s()+.-]+$/.test(search)&&digits(t.phone).includes(digits(search)))));
    const drafts=records.filter(t=>!t.payment&&!isCancelled(t)).length;
    return `<section class="checkout-hero"><div class="checkout-list-title"><h2>Checkout Customer</h2>${drafts?'<span class="count-chip">'+drafts+' open tickets</span>':''}</div><div class="hero-actions">${accountHtml()}${button('<img class="dc-payment-art" src="../assets/icon-oneqr/issue-2040-oneqr-credit-card-3d.png" alt="" width="20" height="20" aria-hidden="true">Direct checkout','new',!canCheckout()?'disabled':'','btn-primary')}</div></section><p class="review-warning" role="status">${esc(warning)}</p><div class="po-list-tools"><input class="input" data-po-search placeholder="Search name, phone, or #" value="${esc(search)}" aria-label="Search by name or ticket"><select class="select" data-po-filter aria-label="Status">${[['all','All'],['cancelled','Cancelled']].map(([id,label])=>`<option value="${id}" ${filter===id?'selected':''}>${label}</option>`).join('')}</select></div><div class="ticket-grid">${rows.map(checkoutCardHtml).join('') || '<div class="panel ticket-empty"><span class="po-empty-icon">'+icon('ticket')+'</span><strong>'+(filter==='cancelled'?'Cancelled · 0':'No open tickets. Start a new checkout when the next guest is ready.')+'</strong></div>'}</div>`;
  }
  function cancelledHtml(){
    return `<section class="panel receipt-confirm cancelled-confirm" aria-label="Cancelled"><span class="success-icon">${icon('close')}</span><h2>Cancelled</h2><p class="muted">${esc(customerName(current.customer))} · ${esc(current.id)}</p><div class="cancellation-record"><div><span>Reason</span><strong>${esc(current.cancelReason || '—')}</strong></div><div><span>Operator</span><strong>${esc(current.cancelledBy || '—')}</strong></div>${current.cancelApprovedBy?'<div><span>Manager PIN approval</span><strong>'+esc(current.cancelApprovedBy)+'</strong></div>':''}<div><span>Time</span><strong>${demo.timeHtml(current.cancelledAt)}</strong></div></div><div class="receipt-quick">${current.lines.length?summaryRows():'<p class="hint">No service assigned</p>'}</div>${button('Checkout Customer','list','','btn-primary btn-wide')}</section>`;
  }
  function receiptHtml(){
    const p=current.payment,method=demo.load().payment.methods.find(m=>m.id===p.method)?.label || p.method,discounts=discountBreakdown(p);
    const breakdown=[['Services & add-ons',p.subtotalCents],['Service discounts',-discounts.serviceDiscountCents],['Order discount',-discounts.orderDiscountCents],['Payment discount',-p.methodDiscountCents],['Card fee',p.feeCents],['Tip',p.tipCents]].filter(([label,amount])=>label==='Services & add-ons'||Number(amount));
    return `<section class="panel receipt-confirm receipt-result" aria-label="Payment complete · demo"><span class="success-icon">${icon('check')}</span><h2>Payment complete · demo</h2><p class="receipt-customer">${esc(customerName(current.customer))}<span>Receipt ${esc(current.id)} is ready. Print it or preview the SMS before moving to the next customer.</span></p><div class="receipt-quick">${breakdown.map(([label,amount])=>`<div class="summary-line"><span>${label}</span><strong>${amount<0?'−'+money(-amount):money(amount)}</strong></div>`).join('')}<div class="total-line"><span>Paid · ${esc(method)}</span><strong>${money(p.totalCents)}</strong></div></div><div class="receipt-meta"><span class="receipt-method">${paymentIcon(p.method)}${esc(method)}</span>${demo.timeHtml(p.paidAt)}</div><div class="receipt-actions">${button('Print receipt','print')}${button('SMS receipt','sms')}${button('View saved receipt','saved-receipt')}${button('Done · Checkout Customer '+icon('arrowRight'),'list','','btn-primary receipt-done')}</div><p class="safe-note">Prototype only. No live payment or SMS occurs.</p></section>`;
  }

  function render(){
    if(servicesRoot)servicesRoot.hidden=true;
    const pageScroll=document.scrollingElement.scrollTop,panelScroll=root.querySelector('.summary-scroll')?.scrollTop || 0;
    const pickerScrolls=new Map([...root.querySelectorAll('.service-picker')].map(el=>[el.dataset.pickerGroup+':'+el.dataset.pickerParent,el.querySelector('.picker-grid')?.scrollTop || 0]));
    const active=root.contains(document.activeElement)?document.activeElement:null;
    const activePicker=active?.closest('.service-picker');
    const focusData=active?{id:active.id,tag:active.tagName,data:{...active.dataset},picker:activePicker?activePicker.dataset.pickerGroup+':'+activePicker.dataset.pickerParent:''}:null;
    const completed=view==='receipt'||view==='legacy'&&!!current?.payment;
    window.NEXORA_FRONT_DESK_TABS?.sync({active:completed?'completed':'checkout-customer'});
    setUrl();root.innerHTML=`${view==='list'?'':`<div class="po-workspace-meta"><span>Front Desk <span class="po-meta-divider">/</span> ${completed?'Completed Services':'Checkout Customer'}</span>${accountHtml()}</div>`}${view==='list'?listHtml():view==='receipt'?receiptHtml():view==='cancelled'?cancelledHtml():view==='legacy'?'<section class="ticket-workspace" data-po-legacy></section>':editorHtml()}`;
    renderIcons();
    if(view==='editor'&&stage>=2)openServices();
    if(view==='legacy')openLegacy();
    const panel=root.querySelector('.summary-scroll');if(panel)panel.scrollTop=panelScroll;
    root.querySelectorAll('.service-picker').forEach(el=>{el.querySelector('.picker-grid').scrollTop=pickerScrolls.get(el.dataset.pickerGroup+':'+el.dataset.pickerParent) || 0;});
    if(focusData){
      const keys=['directAction','directField','group','line','value','service','parent','direction','step','exact','id','poServiceSearch','poSearch'];
      const next=focusData.id?root.querySelector('#'+CSS.escape(focusData.id)):[...root.querySelectorAll('button,input,select')].find(el=>el.tagName===focusData.tag&&keys.some(key=>key in focusData.data)&&keys.every(key=>el.dataset[key]===focusData.data[key])&&(!focusData.picker||el.closest('.service-picker')?.dataset.pickerGroup+':'+el.closest('.service-picker')?.dataset.pickerParent===focusData.picker));
      next?.focus({preventScroll:true});
    }
    window.scrollTo(window.scrollX,pageScroll);
  }
  function openLegacy(){const legacy=root.querySelector('[data-po-legacy]');window.NEXORA_TICKET_WORKSPACE.mount(legacy,{catalog,technicians:()=>technicians().map(name=>({name,status:'available'})),onChange(){save();},onModeChange(){},onBack(){if(new URLSearchParams(location.search).get('returnTo')==='staff'){location.href='pos-front-desk-staff.html';return;}if(current?.payment){location.href='pos-completed-services.html';return;}current=null;view='list';render();}}).open(current,'checkout');}
  function updatePrimary(){
    const primary=root.querySelector('[data-po-primary]');if(!primary)return;
    primary.disabled=stage===1?!Boolean(current||guest.status==='existing'||guest.status==='new'&&guest.customer.trim()):stage===2?Boolean(validateServices()):false;
  }
  function updateSummary(){
    if(!current){updatePrimary();return;}const t=total(),discounts=discountBreakdown(t),fields={serviceDiscount:discounts.serviceDiscountCents,orderDiscount:discounts.orderDiscountCents,subtotal:t.subtotalCents,discount:t.discountCents,net:t.netCents,tip:t.tipCents,methodDiscount:t.methodDiscountCents,fee:t.feeCents,total:t.totalCents,button:t.totalCents};
    root.querySelectorAll('[data-po-total]').forEach(el=>el.textContent=(['discount','serviceDiscount','orderDiscount','methodDiscount'].includes(el.dataset.poTotal)?'−':'')+money(fields[el.dataset.poTotal]));
    root.querySelectorAll('[data-net-line]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.netLine);if(l)el.textContent='Net '+money(lineNet(l));});
    root.querySelectorAll('[data-po-summary-line]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.poSummaryLine);if(l)el.textContent=money(lineNet(l));});
    root.querySelectorAll('[data-po-summary-name]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.poSummaryName);if(l)el.innerHTML=summaryNameHtml(l);});
    root.querySelectorAll('[data-po-discount-line]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.poDiscountLine);if(l){el.textContent=lineDiscountLabel(l);el.classList.toggle('applied',Number(l.discount?.value)>0);}});
    root.querySelectorAll('[data-po-group-net],[data-po-summary-group]').forEach(el=>{const id=el.dataset.poGroupNet || el.dataset.poSummaryGroup;el.textContent=money(current.lines.filter(l=>l.groupId===id).reduce((sum,l)=>sum+lineNet(l),0));});
    root.querySelectorAll('[data-po-tip-total]').forEach(el=>el.textContent=money(t.tipCents));
    const orderDiscount=root.querySelector('[data-po-order-discount]');if(orderDiscount)orderDiscount.textContent=money(Math.round(Number(current.discount?.value || 0)*100));
    const approval=root.querySelector('[data-po-approval]');if(approval)approval.hidden=!requiresApproval();
    const tipStatus=root.querySelector('.tip-status');if(tipStatus){const balanced=Object.values(allocations()).reduce((s,n)=>s+n,0)===(t.tipCents || 0);tipStatus.textContent=tipStatusText();tipStatus.classList.toggle('balanced',balanced);tipStatus.classList.toggle('unbalanced',!balanced);}
    const allocationsNode=root.querySelector('[data-po-tip-allocation]');if(allocationsNode&&!allocationsNode.contains(document.activeElement))allocationsNode.innerHTML=tipAllocationHtml();
    root.querySelectorAll('[data-direct-action="payment"] small').forEach(el=>el.textContent=money(total(el.closest('button').dataset.value).totalCents));
    const selectedOther=root.querySelector('.payment-more.selected small');if(selectedOther)selectedOther.textContent=money(t.totalCents);
    const cashInput=root.querySelector('[data-direct-field="cash"]');if(cashInput){cashInput.placeholder=(t.totalCents/100).toFixed(2);cashInput.min=(t.totalCents/100).toFixed(2);}
    const splitCash=root.querySelector('[data-direct-field="splitCash"]');if(splitCash)splitCash.max=(t.netCents/100).toFixed(2);
    const exactCash=root.querySelector('[data-direct-action="cash-value"][data-exact]');if(exactCash)exactCash.textContent=money(t.totalCents);
    root.querySelectorAll('[data-direct-action="cash-value"][data-value]').forEach(el=>el.hidden=Number(el.dataset.value)*100<t.totalCents);
    root.querySelectorAll('[data-direct-action="tip-value"]').forEach(el=>{const selected=Number(current.checkout.tip)===Number(el.dataset.value);el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected);});
    renderIcons();updatePrimary();
  }
  function goStep(target){
    warning='';target=Math.max(1,Math.min(3,Number(target)||1));
    if(target>=2&&!ensureCustomer()){render();return;}
    if(target===3){
      warning=validateServices();if(warning){render();return;}
      if(persist())location.href=data.url(current,'checkout',new URLSearchParams(location.search).get('returnTo') || 'checkout');
      else render();
      return;
    }
    stage=target;render();
    if(stage===1&&!current)root.querySelector('#customer-phone')?.focus();
    if(stage===2)root.querySelector('[data-tw-group-tech],[data-tw-new-tech]')?.focus();
  }
  function validateServices(){
    if(!current.lines.some(l=>!l.parentLineId))return 'Add at least one main service.';
    if(groups().some(g=>!g.tech))return 'Select a technician for each group.';
    if(current.lines.some(l=>!l.name.trim()))return 'Name each custom service or add-on.';
    if(current.lines.some(l=>l.price==null||!Number.isFinite(Number(l.price))||Number(l.price)<0))return 'Enter valid prices.';
    if(current.lines.some(l=>l.discount?.type==='percent'&&Number(l.discount.value)>100))return 'Service discounts cannot exceed the item price or 100%.';
    return '';
  }

  async function review(){
    if(!current||isCancelled(current)||current.payment||!canCheckout())return;
    const checkoutId=current.id;
    warning=validateServices();const t=total(),p=current.checkout;
    if(!warning&&(!Number.isFinite(Number(p.tip))||Number(p.tip)<0||(p.tipType==='percent'&&Number(p.tip)>100)))warning='Enter a valid tip.';
    if(!warning&&(!Number.isFinite(t.totalCents)||t.error))warning='Enter valid prices.';
    if(!warning&&!demo.methods().some(m=>m.id===p.method))warning='Choose an accepted Nexora payment method.';
    if(!warning){const input=root.querySelector(p.method==='cash'?'[data-direct-field="cash"]':p.method==='split'?'[data-direct-field="splitCash"]':p.method==='gift-card'?'[data-direct-field="giftCode"]':'[data-direct-field="tip"]');if(input&&p.method==='gift-card'){input.value=input.value.trim();p.giftCode=input.value;}if(input&&!input.reportValidity())return;}
    if(!warning&&Object.values(allocations()).reduce((s,n)=>s+n,0)!==t.tipCents)warning='Allocate the full guest tip across the technicians.';
    if(warning){render();return;}
    const approvals=current.poPendingApprovals || (current.pendingApproval?[current.pendingApproval]:[]);
    for(const action of approvals){
      if(current?.id!==checkoutId||isCancelled(current)||current.payment)return;
      if(!await approveCheckout(action,checkoutId,{label:'Changes requiring approval'}))return;
    }
    if(current?.id!==checkoutId||isCancelled(current)||current.payment)return;
    const result=await Swal.fire({
      title:'Review checkout',
      html:`<div class="review-customer"><span class="review-avatar">${icon('user')}</span><div><span>Customer</span><strong>${esc(customerName(current.customer))}</strong><small>${esc(current.id)}</small></div></div><div class="review-payment"><span>Payment method</span><strong class="receipt-method">${paymentIcon(p.method)}${esc(demo.methods().find(m=>m.id===p.method)?.label || p.method)}</strong></div><div class="review-total"><span>Total</span><strong>${money(t.totalCents)}</strong></div><p class="safe-note">This completes the prototype demo only. It does not process payment.</p>`,
      showCancelButton:true,showCloseButton:true,closeButtonHtml:icon('close'),reverseButtons:true,buttonsStyling:false,
      confirmButtonText:'Complete demo',cancelButtonText:'Edit checkout',
      customClass:{popup:'pos-swal po-review-dialog po-confirm-dialog',title:'dc-modal-title',htmlContainer:'dc-modal-content',actions:'dc-modal-actions',confirmButton:'dc-modal-confirm',cancelButton:'dc-modal-back',closeButton:'dc-modal-close'},
      didOpen:()=>renderIcons(Swal.getPopup())
    });
    if(!result.isConfirmed||!canCheckout()||current?.id!==checkoutId||isCancelled(current)||current.payment)return;
    current.payment={...t,tipAllocations:allocations(),method:p.method,receipt:p.receipt || 'none',cashCents:p.method==='cash'?t.totalCents:p.method==='split'?t.cashPortionCents:0,cardCents:p.method==='card'?t.totalCents:p.method==='split'?t.cardPortionCents:0,changeCents:p.method==='cash'?Math.round(Number(p.cash)*100)-t.totalCents:0,paidAt:new Date().toISOString(),simulated:true};
    current.status='completed';delete current.pendingApproval;delete current.poPendingApprovals;save();view='receipt';render();
  }
  function addService(g,s,parentId=''){
    const line={id:crypto.randomUUID(),serviceId:s.id || null,groupId:g.id,name:s.name || '',price:s.price ?? null,originalPrice:s.price ?? null,tech:g.tech,status:'completed',custom:!!s.custom};
    if(parentId)line.parentLineId=parentId;
    current.lines.push(line);
    if(s.custom){picker='';addonPicker='';}
    else if(parentId){
      const parent=current.lines.find(l=>l.id===parentId);
      if(parent?.groupId===g.id){addonPicker=parentId;picker='';}
      else{detailState.set('extra:'+g.id,true);addonPicker='';picker='';}
    }else{picker=g.id;addonPicker='';}
    orderLines();save();render();
    if(s.custom)root.querySelector('[data-direct-field="name"][data-line="'+line.id+'"]')?.focus();
    else{
      const choice=[...root.querySelectorAll('[data-direct-action="add-service"]')].find(el=>el.dataset.service===String(s.id)&&el.dataset.group===g.id&&el.dataset.parent===parentId);
      if(choice){choice.focus({preventScroll:true});choice.scrollIntoView({block:'nearest'});}
    }
  }
  root.addEventListener('toggle',e=>{if(root.contains(e.target)&&e.target.matches('details[data-detail-key]'))detailState.set(e.target.dataset.detailKey,e.target.open);},true);
  root.addEventListener('beforeinput',e=>{
    const el=e.target;
    if(el.id!=='customer-phone'||el.readOnly||!e.cancelable||el.selectionStart!==el.selectionEnd)return;
    const direction=e.inputType==='deleteContentBackward'?-1:e.inputType==='deleteContentForward'?1:0;
    if(!direction)return;
    const cursor=el.selectionStart;
    let index=direction<0?cursor-1:cursor;
    if(index<0||index>=el.value.length||/\d/.test(el.value[index]))return;
    while(index>=0&&index<el.value.length&&/\D/.test(el.value[index]))index+=direction;
    if(index<0||index>=el.value.length)return;
    e.preventDefault();
    const start=direction<0?index:cursor,end=direction<0?cursor:index+1;
    el.value=el.value.slice(0,start)+el.value.slice(end);el.setSelectionRange(start,start);
    maskPhoneInput(el,e.inputType);
  });
  root.addEventListener('input',e=>{
    if(e.target.closest('[data-direct-services]'))return;
    const el=e.target;if(el.id==='customer-phone'){maskPhoneInput(el,e.inputType);updatePrimary();return;}if(el.id==='customer-name'){guest.customer=el.value;save();updatePrimary();return;}
    if(el.hasAttribute('data-po-service-search')){pickerSearch=el.value;const start=el.selectionStart;render();const input=document.activeElement;if(input?.hasAttribute('data-po-service-search'))input.setSelectionRange(start,start);return;}
    if(el.hasAttribute('data-po-search')){search=el.value;const start=el.selectionStart;render();const input=root.querySelector('[data-po-search]');input.focus();input.setSelectionRange(start,start);return;}
    if(!current||current.payment)return;
    const field=el.dataset.directField,l=current.lines.find(l=>l.id===el.dataset.line),p=current.checkout;
    if(field==='name'&&l)l.name=el.value;
    if(field==='price'&&l){l.price=el.value===''?null:Number(el.value);markApproval('price');}
    if(field==='discount-value'&&l){l.discount={type:l.discount?.type || 'fixed',value:Math.max(0,Number(el.value)||0)};markApproval('discount');}
    if(field==='order-discount'){current.discount={type:'fixed',value:Math.max(0,Number(el.value)||0)};markApproval('discount');}
    if(field==='tip'){p.tip=Math.max(0,Number(el.value)||0);p.tipType=tipMode==='percent'?'percent':'fixed';}
    if(['cash','splitCash','giftCode'].includes(field))p[field]=el.value;
    if(field==='tip-allocation'){p.tipAllocations=p.tipAllocations || {};p.tipAllocations[el.dataset.tech]=Math.max(0,Number(el.value)||0);}
    save();updateSummary();
  });
  root.addEventListener('change',e=>{
    if(e.target.closest('[data-direct-services]'))return;
    const el=e.target;if(el.hasAttribute('data-po-filter')){filter=el.value;render();return;}if(!current||current.payment)return;
    const field=el.dataset.directField,l=current.lines.find(l=>l.id===el.dataset.line),g=groups().find(g=>g.id===el.dataset.group);
    if(field==='category'){pickerCategory=el.value;render();return;}
    if(!['tech','co-tech','discount-type'].includes(field))return;
    if(field==='tech'&&g){g.tech=el.value;groupLines(g).forEach(l=>{if(l.coTech===g.tech)delete l.coTech;l.tech=[g.tech,l.coTech].filter(Boolean).join(', ');});}
    if(field==='co-tech'&&l){l.coTech=el.value;l.tech=[groups().find(g=>g.id===l.groupId).tech,l.coTech].filter(Boolean).join(', ');}
    if(field==='discount-type'&&l){l.discount={type:el.value,value:l.discount?.value || 0};markApproval('discount');}
    save();render();
  });
  root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='customer-phone'){e.preventDefault();lookup();}if(e.key==='Enter'&&e.target.id==='customer-name'){e.preventDefault();if(ensureCustomer()){stage=2;render();}}});
  root.addEventListener('click',async e=>{
    const b=e.target.closest('[data-direct-action]');if(!b||b.disabled)return;const action=b.dataset.directAction;
    if(action==='list'){save();if(new URLSearchParams(location.search).get('returnTo')==='staff'){location.href='pos-front-desk-staff.html';return;}view='list';warning='';current=null;contactUntil=0;render();return;}
    if(action==='completed'){location.href='pos-completed-services.html';return;}
    if(action==='new'){newCheckout();return;}
    if(action==='cancel-checkout'){await cancelCheckout(b.dataset.id);return;}
    if(action==='open'){const record=records.find(t=>String(t.id)===b.dataset.id);if(!record)return;if(!isCancelled(record)){location.href=data.url(record,'checkout','checkout');return;}current=normalize(record);view='cancelled';warning='';render();return;}
    if(action==='print'){window.print();return;}
    if(action==='sms'){Swal.fire({title:'Send receipt to '+phone(),html:`<p>Preview the message and confirm the customer's phone before sending in the live POS.</p><div class="receipt-sms-preview">${esc(customerName(current.customer))}, thank you for visiting Bitcoin Nail Bar. Your receipt ${esc(current.id)} is ${money(current.payment.totalCents)} paid by ${esc(demo.load().payment.methods.find(m=>m.id===current.payment.method)?.label || current.payment.method)}. A secure receipt link would be attached by Nexora.</div><p>Prototype only. No SMS has been sent. The live system should check customer consent and show delivery status.</p>`,showCancelButton:true,cancelButtonText:'← Back to receipt',confirmButtonText:'Done · Checkout Customer',customClass:{popup:'pos-swal'}}).then(result=>{if(result.isConfirmed){view='list';current=null;contactUntil=0;render();}});return;}
    if(action==='saved-receipt'){Swal.fire({title:'View saved receipt',html:`<p>${esc(current.id)} · ${esc(customerName(current.customer))}</p>${summaryRows()}<div class="total-line"><span>Paid · ${esc(demo.load().payment.methods.find(m=>m.id===current.payment.method)?.label || current.payment.method)}</span><strong>${money(current.payment.totalCents)}</strong></div>`,confirmButtonText:'← Back to receipt',customClass:{popup:'pos-swal po-review-dialog'},didOpen:()=>renderIcons(Swal.getPopup())});return;}
    if(!canCheckout())return;
    if(action==='lookup'){lookup();return;}
    if(action==='different-customer'){current=null;guest={phone:'',customer:'',status:''};contactUntil=0;stage=1;warning='';save();render();root.querySelector('#customer-phone')?.focus();return;}
    if(action==='reveal-contact'){if(await approveCheckout('contact',current?.id || guest.customer,{label:'View full contact · approval required'})){contactUntil=Date.now()+30000;render();setTimeout(()=>{contactUntil=0;if(view==='editor')render();},30000);}return;}
    if(action==='go-step'){goStep(b.dataset.step);return;}
    if(action==='previous'){if(stage===1){save();view='list';current=null;warning='';render();}else goStep(stage-1);return;}
    if(action==='next'){goStep(stage+1);return;}
    if(!current||current.payment||isCancelled(current))return;
    const g=groups().find(g=>g.id===b.dataset.group),l=current.lines.find(l=>l.id===b.dataset.line),p=current.checkout;
    if(action==='add-group'){const group={id:crypto.randomUUID(),tech:''};groups().push(group);picker=group.id;addonPicker='';pickerSearch='';}
    if(action==='remove-group'){const ids=groupLines(g).map(l=>l.id);current.poGroups=groups().filter(x=>x!==g);current.lines=current.lines.filter(l=>!ids.includes(l.id)&&!ids.includes(l.parentLineId));}
    if(action==='move-group'){const index=groups().indexOf(g),next=index+Number(b.dataset.direction);if(next>=0&&next<groups().length)[current.poGroups[index],current.poGroups[next]]=[current.poGroups[next],current.poGroups[index]];orderLines();}
    if(action==='service-picker'){picker=picker===g.id?'':g.id;addonPicker='';pickerSearch='';}
    if(action==='addon-picker'){addonPicker=addonPicker===l.id?'':l.id;picker='';pickerSearch='';}
    if(action==='add-service'){const s=(b.dataset.parent?addons:catalog()).find(s=>s.id===b.dataset.service);if(s)addService(g,s,b.dataset.parent);return;}
    if(action==='custom-service'){addService(g,{name:'',price:0,custom:true},b.dataset.parent);return;}
    if(action==='remove-line'){current.lines=current.lines.filter(x=>x!==l&&x.parentLineId!==l.id);}
    if(action==='line-discount'){if(discountOpen.has(l.id))discountOpen.delete(l.id);else discountOpen.add(l.id);}
    if(action==='extra-service'){
      const mains=current.lines.filter(l=>!l.parentLineId);if(!mains.length){warning='Add at least one main service.';render();return;}
      const result=await Swal.fire({title:'Add-on by this technician',html:`<label class="pos-approval-field">Related main service · required<select id="po-related-service">${mains.map(l=>`<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select></label><label class="pos-approval-field">Add-on<select id="po-extra-service">${addons.map(a=>`<option value="${a.id}">${esc(a.name)} · ${money(a.price*100)}</option>`).join('')}</select></label>`,showCancelButton:true,cancelButtonText:'Cancel',confirmButtonText:'Add their add-on',customClass:{popup:'pos-swal'},preConfirm:()=>({parent:document.getElementById('po-related-service').value,service:document.getElementById('po-extra-service').value})});
      if(result.isConfirmed)addService(g,addons.find(a=>a.id===result.value.service),result.value.parent);return;
    }
    if(action==='tip-mode'){tipMode=b.dataset.value;p.tipType=tipMode==='percent'?'percent':'fixed';p.tip=0;}
    if(action==='tip-value')p.tip=Number(b.dataset.value);
    if(action==='tip-split')p.tipSplitMode=b.dataset.value;
    if(action==='cash-value')p.cash=(b.dataset.exact?total().totalCents/100:Number(b.dataset.value)).toFixed(2);
    if(action==='payment'){p.method=b.dataset.value;warning='';}
    if(action==='payment-more')p.moreOpen=!p.moreOpen;
    if(action==='review'){await review();return;}
    save();render();
    if(action==='add-group')root.querySelector('[data-direct-field="tech"][data-group="'+picker+'"]')?.focus();
    if(action==='payment')root.querySelector('[data-direct-field="cash"],[data-direct-field="splitCash"],[data-direct-field="giftCode"]')?.focus();
    if(action==='tip-mode'&&tipMode==='custom')root.querySelector('[data-direct-field="tip"]')?.focus();
  });
  window.addEventListener('nexora:pos-account-changed',()=>{save();current=null;view='list';contactUntil=0;render();});
  window.addEventListener('nexora:pos-settings-changed',()=>{if(view==='editor')render();});
  function refreshRecords(){
    try{
      records=data.all();
      if(current){
        const record=records.find(t=>t.id===current.id);current=record?normalize(record):null;
        if(!current){view='list';warning='';}
        else if(isCancelled(current)||current.payment){view=isCancelled(current)?'cancelled':'receipt';contactUntil=0;if(Swal.isVisible())Swal.close();}
      }
      render();
    }catch(error){warning=error.message;render();}
  }
  window.addEventListener('storage',event=>{if(!event.key||Object.values(data.keys).includes(event.key))refreshRecords();});
  window.addEventListener('pageshow',event=>{if(event.persisted)refreshRecords();});
  const params=new URLSearchParams(location.search),id=params.get('checkoutId');current=records.find(t=>data.keyOf(t)===id||String(t.id)===id) || null;
  if(current&&!isCancelled(current)){location.replace(data.url(current,params.get('mode')==='edit'||params.get('step')==='2'?'edit':'checkout',params.get('returnTo') || 'checkout'));return;}
  if(current){normalize(current);view=isCancelled(current)?'cancelled':current.payment?'receipt':current.splitBills?'legacy':'editor';stage=params.get('step')?Math.max(1,Math.min(3,Number(params.get('step'))||2)):params.get('mode')==='edit'?2:3;tipMode=current.checkout.tipType==='percent'?'percent':'amount';render();}
  else if(params.get('view')==='list'||!canCheckout())render();else newCheckout();
})();
