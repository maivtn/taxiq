(function () {
  'use strict';
  const root=document.querySelector('[data-direct-root]');if(!root)return;
  const demo=window.NEXORA_POS_DEMO,esc=demo.esc,key='nexora:direct-checkouts:v1',draftKey='nexora:direct-checkout-customer-draft:v1';
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
  const catalog=()=>window.NEXORA_SALON_DATA.loadCatalog().services.filter(s=>s.active!==false);
  const technicians=()=>window.NEXORA_SALON_DATA.loadCatalog().technicians.filter(t=>t.active).map(t=>t.name);
  const category=s=>s.categoryName || s.requiredSkill || 'Other';
  const canCheckout=()=>['owner','manager','cashier'].includes(demo.account().role);
  const icons={arrow:'arrow-left',check:'check',plus:'plus',ticket:'receipt-text',card:'credit-card',info:'info',user:'user-round',close:'x',search:'search',users:'users-round',link:'link',lock:'lock-keyhole',discount:'badge-percent',arrowRight:'arrow-right',up:'arrow-up',down:'arrow-down',chevron:'chevron-down',cash:'banknote',gift:'gift',crypto:'bitcoin',split:'split',wallet:'wallet',more:'ellipsis',edit:'pencil',cancel:'ban',print:'printer',sms:'message-square',addon:'corner-down-right'};
  const icon=(name,className='')=>`<i data-lucide="${icons[name] || icons.ticket}" class="dc-icon ${className}" aria-hidden="true"></i>`;
  function renderIcons(scope=root){
    scope.querySelectorAll('.co-tech-options>summary,.other-tech-work>summary,.checkout-detail>summary').forEach(summary=>{
      if(!summary.querySelector('.dc-chevron'))summary.insertAdjacentHTML('beforeend',icon('chevron','dc-chevron'));
    });
    window.lucide?.createIcons();
  }
  const addons=[{id:'po-gel-polish',name:'Gel Polish',price:15,durationMin:10},{id:'po-nail-art',name:'Nail Art',price:10,durationMin:10},{id:'po-chrome',name:'Chrome',price:15,durationMin:10},{id:'po-french',name:'French',price:10,durationMin:10}];
  let records=[],current=null,stage=1,view='list',warning='',search='',filter='all',contactUntil=0;
  let guest={phone:'',customer:'',status:''},tipMode='percent',picker='',addonPicker='',pickerCategory='all',pickerSearch='',discountOpen=new Set();
  const detailState=new Map();
  try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved))records=saved;}catch(_){}
  const actionIcons={'custom-service':'edit','line-discount':'discount','cancel-checkout':'cancel',print:'print',sms:'sms','saved-receipt':'ticket',lookup:'search','different-customer':'user','reveal-contact':'lock',list:'arrow'};
  const actionColors={'service-picker':'dc-green','addon-picker':'dc-blue','extra-service':'dc-blue','custom-service':'dc-purple','line-discount':'dc-amber','reveal-contact':'dc-purple','different-customer':'dc-blue','add-group':'dc-purple',print:'dc-blue',sms:'dc-green','saved-receipt':'dc-purple',open:'dc-purple'};
  const button=(label,action,attrs='',style='btn-secondary')=>`<button type="button" class="btn ${style} ${actionColors[action] || ''}" data-direct-action="${action}" ${attrs}>${actionIcons[action]&&!label.includes('data-lucide=')?icon(actionIcons[action]):''}${label}</button>`;
  const phone=()=>{const value=digits(current?.phone || guest.phone);return contactUntil>Date.now()?value.replace(/^(\d{3})(\d{3})(\d{4})$/,'($1) $2-$3'):'••• ••• '+value.slice(-4);};
  const isCancelled=t=>!!t&&(t.cancelled||t.status==='cancelled');
  const hasPayment=t=>!!(t?.payment||t?.splitBills?.bills?.some(b=>b.payment));
  const canCancel=t=>canCheckout()&&!!t&&!isCancelled(t)&&!hasPayment(t);
  const cancelNeedsApproval=t=>['in-service','ready-to-pay','ready'].includes(t.status)||t.lines.some(l=>['in-service','completed'].includes(l.status));
  function persist(){try{localStorage.setItem(key,JSON.stringify(records));return true;}catch(_){warning='Unable to save checkout locally. Keep this page open.';return false;}}
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
    const value=digits(guest.phone);if(value.length!==10){warning='Enter a valid 10-digit customer phone number.';render();return;}
    const appointments=(window.NEXORA_APPOINTMENTS_STORE?.loadAll() || []).map(t=>({customer:t.customerName,phone:t.phone}));
    const sample=[{customer:'Demo customer A',phone:'2025550101'},{customer:'Quan',phone:'5550122807'},{customer:'Brian',phone:'5550161092'},{customer:'DJ',phone:'5550195421'},{customer:'Leo',phone:'5550178804'}];
    const found=[...records,...appointments,...sample].find(t=>digits(t.phone)===value);
    guest={phone:value,customer:found?.customer || '',status:found?'existing':'new'};warning='';save();if(found&&ensureCustomer())stage=2;render();root.querySelector(found?'[data-direct-field="tech"]':'#customer-name')?.focus();
  }
  function ensureCustomer(){
    if(isCancelled(current)){warning='This checkout has been cancelled.';return false;}
    if(current)return true;
    if(digits(guest.phone).length!==10||!guest.status){warning='Find the customer by phone first.';return false;}
    if(!guest.customer.trim()){warning='Enter the new customer’s name.';return false;}
    current=normalize({id:'DC-'+crypto.randomUUID().slice(0,8).toUpperCase(),directCheckout:true,customer:guest.customer.trim(),phone:digits(guest.phone),customerType:guest.status==='existing'?'returning':'new',createdAt:new Date().toISOString(),checkedIn:false,status:'draft',lines:[],services:[],tech:'',note:'',checkout:{tip:0,tipType:'percent',tipSplitMode:demo.load().payment.tipSplit,method:demo.methods().find(m=>m.id!=='split')?.id || 'cash',cash:'',receipt:'none'}});
    records.unshift(current);if(!persist()){records.shift();current=null;return false;}try{localStorage.removeItem(draftKey);}catch(_){}return true;
  }
  function total(method){if(!current)return {subtotalCents:0,discountCents:0,netCents:0,tipCents:0,totalCents:0};return window.NEXORA_TICKET_WORKSPACE.totals(method?{...current,payment:null,checkout:{...current.checkout,method}}:current);}
  function requiresApproval(){return (current?.poPendingApprovals || (current?.pendingApproval?[current.pendingApproval]:[])).some(action=>demo.load().rules[action]);}
  function groups(){return current?.poGroups || [];}
  function groupLines(g){return current.lines.filter(l=>l.groupId===g.id);}
  function mainLines(g){return groupLines(g).filter(l=>!l.parentLineId);}
  function lineNet(l){const base=Math.round(Number(l.price || 0)*100);const reduction=Math.min(base,Math.round(l.discount?.type==='fixed'?Number(l.discount.value || 0)*100:base*Number(l.discount?.value || 0)/100));return base-reduction;}
  function orderLines(){current.lines=groups().flatMap(g=>groupLines(g));}
  function detailAttrs(key,initial=false){return `data-detail-key="${key}" ${(detailState.has(key)?detailState.get(key):initial)?'open':''}`;}
  function itemHtml(l,group,addon=false){
    return `<div class="item-editor"><div class="item-line ${addon?'addon-line':''}"><div class="item-name">${l.custom?`<input class="input" aria-label="Custom service name" placeholder="Custom ${addon?'add-on':'service'} name" data-direct-field="name" data-line="${l.id}" value="${esc(l.name)}">`:`<strong>${esc(l.name)}</strong>`}</div><label class="item-price"><span>$</span><input type="number" min="0" step="0.01" inputmode="decimal" aria-label="Price for ${esc(l.name || 'custom service')}" data-direct-field="price" data-line="${l.id}" value="${l.price ?? ''}"></label>${button(icon('close'),'remove-line',`data-line="${l.id}" aria-label="Remove ${esc(l.name || 'custom service')}" title="Remove service"`,'remove-item')}</div><div class="discount-under">${button('Discount'+(l.discount?.value?' · '+money(Math.round(Number(l.price || 0)*100)-lineNet(l))+' off':''),'line-discount',`data-line="${l.id}" data-po-discount-line="${l.id}" aria-expanded="${discountOpen.has(l.id)}"`,'discount-toggle '+(l.discount?.value?'applied':''))}<span class="item-net" data-net-line="${l.id}">Net ${money(lineNet(l))}</span></div>${discountOpen.has(l.id)?`<div class="discount-panel"><label>Discount type<select class="select" data-direct-field="discount-type" data-line="${l.id}"><option value="fixed" ${l.discount?.type!=='percent'?'selected':''}>Amount ($)</option><option value="percent" ${l.discount?.type==='percent'?'selected':''}>Percent (%)</option></select></label><label>Value<input class="input" type="number" min="0" step="0.01" data-direct-field="discount-value" data-line="${l.id}" value="${l.discount?.value || 0}"></label></div>`:''}</div>`;
  }
  function pickerHtml(group,parentId=''){
    const addOn=!!parentId,all=addOn?addons:catalog(),categories=[...new Set(all.map(category))];
    const list=all.filter(s=>(addOn||pickerCategory==='all'||category(s)===pickerCategory)&&(!pickerSearch||(s.name+' '+category(s)).toLowerCase().includes(pickerSearch.toLowerCase())));
    return `<div class="service-picker" data-picker-group="${group.id}" data-picker-parent="${parentId}"><div class="picker-toolbar"><label class="picker-search">${icon('search')}<input class="input" data-po-service-search placeholder="Search ${addOn?'add-ons':'services'}" value="${esc(pickerSearch)}" aria-label="Search available ${addOn?'add-ons':'services'}"></label>${!addOn?`<select class="select" data-direct-field="category" aria-label="Service category"><option value="all" ${pickerCategory==='all'?'selected':''}>All categories</option>${categories.map(c=>`<option value="${esc(c)}" ${c===pickerCategory?'selected':''}>${esc(c)}</option>`).join('')}</select>`:''}</div><div class="picker-grid" aria-label="${addOn?'Available add-ons':'Available main services'}">${list.map(s=>{const count=groupLines(group).filter(l=>l.serviceId===s.id&&(l.parentLineId || '')===parentId).length;return `<button type="button" class="service-choice ${count?'has-selection':''}" data-direct-action="add-service" data-group="${group.id}" data-service="${esc(s.id)}" data-parent="${parentId}"><span><b>${esc(s.name)}</b><small>${s.durationMin || 15} min${count?' · '+count+' added':''}</small></span><strong>${s.price==null?'Set price':money(Math.round(s.price*100))}<span class="choice-plus">${icon('plus')}</span></strong></button>`;}).join('') || '<p class="picker-empty">No matching services. Try another search or category.</p>'}</div></div>`;
  }
  function serviceHtml(l,g){
    const child=current.lines.filter(a=>a.parentLineId===l.id&&a.groupId===g.id);
    return `<div class="service-block"><div class="service-block-top"><span class="service-tag">Main service</span><span class="inherit-tag">${l.coTech?'Shared with '+esc(l.coTech):'Add-ons inherit technician'}</span></div>${itemHtml(l,g)}<details class="co-tech-options" ${detailAttrs('co-tech:'+l.id,!!l.coTech)}><summary>${icon('users')} ${l.coTech?'Working with '+esc(l.coTech):'Add co-technician'}</summary><label class="co-tech-field">Working together on this service<select class="select" data-direct-field="co-tech" data-line="${l.id}"><option value="">Only ${esc(g.tech || 'selected technician')}</option>${technicians().filter(t=>t!==g.tech).map(t=>`<option value="${esc(t)}" ${t===l.coTech?'selected':''}>${esc(t)} · shared service</option>`).join('')}</select></label></details><div class="addons-area">${child.length?`<div class="addons-head"><strong>Add-ons</strong><span>${child.length} item${child.length===1?'':'s'}</span></div>${child.map(a=>itemHtml(a,g,true)).join('')}`:''}<div class="button-row">${button(icon('plus')+' Add-on','addon-picker',`data-line="${l.id}" data-group="${g.id}" aria-expanded="${addonPicker===l.id}"`,'btn-small')}${button('Custom add-on','custom-service',`data-group="${g.id}" data-parent="${l.id}"`,'btn-quiet btn-small')}</div>${addonPicker===l.id?pickerHtml(g,l.id):''}</div></div>`;
  }
  function groupHtml(g,index){
    const lines=groupLines(g),extra=lines.filter(l=>l.parentLineId&&!mainLines(g).some(s=>s.id===l.parentLineId)),menuOpen=picker===g.id||!lines.length&&!picker&&groups().length===1;
    return `<section class="tech-group" aria-label="Technician group ${index+1}"><div class="group-head"><span class="group-avatar">${index+1}</span><label class="group-technician">Technician · required<select class="select" data-direct-field="tech" data-group="${g.id}"><option value="">Select technician</option>${technicians().map(t=>`<option value="${esc(t)}" ${g.tech===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label><div class="group-amount"><small>${lines.length} item${lines.length===1?'':'s'}</small><strong data-po-group-net="${g.id}">${money(lines.reduce((sum,l)=>sum+lineNet(l),0))}</strong></div>${groups().length>1?`<div class="po-group-actions">${button(icon('up'),'move-group',`data-group="${g.id}" data-direction="-1" ${!index?'disabled':''} aria-label="Move technician up" title="Move up"`,'po-reorder')}${button(icon('down'),'move-group',`data-group="${g.id}" data-direction="1" ${index===groups().length-1?'disabled':''} aria-label="Move technician down" title="Move down"`,'po-reorder')}${button(icon('close'),'remove-group',`data-group="${g.id}" aria-label="Remove ${esc(g.tech || 'technician group')}" title="Remove technician"`,'remove-item')}</div>`:''}</div><div class="group-services">${mainLines(g).map(l=>serviceHtml(l,g)).join('')}</div><div class="button-row group-buttons">${lines.length||!menuOpen?button(icon(menuOpen?'close':'plus')+(menuOpen?' Close service menu':' Add service'),'service-picker',`data-group="${g.id}" aria-expanded="${menuOpen}"`,'btn-small'):''}${button('Custom service','custom-service',`data-group="${g.id}"`,'btn-quiet btn-small')}</div>${menuOpen?pickerHtml(g):''}${index>0||extra.length?`<details class="other-tech-work" ${detailAttrs('extra:'+g.id,!!extra.length)}><summary>${icon('link')} Add-on for another technician’s service ${extra.length?'<span class="detail-count">'+extra.length+'</span>':''}</summary><div class="detail-content">${extra.map(l=>itemHtml(l,g,true)).join('')}${button(icon('plus')+' Link add-on','extra-service',`data-group="${g.id}"`,'btn-small')}</div></details>`:''}</section>`;
  }
  function customerHtml(){
    const name=current?.customer || guest.customer,found=current||guest.status==='existing',newGuest=current?.customerType==='new';
    if(stage>=2&&current)return `<section class="customer-strip" aria-label="Selected customer"><span class="customer-avatar">${esc(name.trim().slice(0,1).toUpperCase())}</span><div class="customer-strip-copy"><strong>${esc(name)}</strong><span>${esc(phone())} <span class="customer-type">${newGuest?'New customer':'Returning customer'}</span></span></div><div class="customer-strip-actions">${button(icon('lock'),'reveal-contact','aria-label="View full contact with PIN approval" title="View contact · PIN approval"','icon-button')}${button(icon('edit')+' Edit','go-step','data-step="1"','btn-quiet btn-small')}</div></section>`;
    return `<section class="panel form-panel customer-form"><div class="customer-intro"><span class="lookup-icon">${icon('search')}</span><div><h3>Find your customer</h3><p>Enter a phone number to find or create a customer.</p></div></div><label class="inline-label" for="customer-phone">Customer phone · required</label><div class="lookup-row"><input class="input" id="customer-phone" type="tel" inputmode="tel" autocomplete="off" placeholder="(000) 000-0000" value="${esc(found?phone():formatPhoneInput(guest.phone))}" ${found?'readonly':''}>${button('Find customer','lookup',found?'disabled':'','btn-primary')}</div><div aria-live="polite">${found?`<div class="identity-card found"><b>${newGuest?'New customer':'Existing customer found'}</b><strong>${esc(name)}</strong><span>${esc(phone())} · ${contactUntil>Date.now()?'Contact approved':'Contact protected'}</span><div class="customer-private-actions">${button('View contact · PIN','reveal-contact','','btn-small')}${button('Different customer','different-customer','','btn-quiet btn-small')}</div></div>`:guest.status==='new'?`<div class="identity-card new"><b>New customer</b><p>No matching customer. Add their name to continue.</p><label for="customer-name">Customer name · required</label><input class="input" id="customer-name" autocomplete="off" placeholder="First and last name" value="${esc(guest.customer)}"></div>`:'<p class="lookup-demo">Demo: <b>(202) 555-0101</b> existing · <b>(202) 555-0199</b> new</p>'}</div></section>`;
  }
  function servicesHtml(){return `<section class="form-panel services-panel"><div class="section-heading"><div><h3>Technician & services</h3><p>Assign a technician once. Their services and add-ons stay together.</p></div><span class="section-count">${groups().length} tech${groups().length===1?'':'s'}</span></div><div class="tech-groups">${groups().map(groupHtml).join('')}</div>${button(icon('plus')+' Add technician','add-group','','add-tech')}</section>`;}
  function previewHtml(){const t=total();return `<aside class="summary-panel checkout-preview" aria-label="Live ticket preview"><div class="summary-heading"><span class="preview-icon">${icon('ticket')}</span><div><h3>Ticket preview</h3><p>${current.lines.length} item${current.lines.length===1?'':'s'} · ${groups().filter(g=>g.tech).length} technician${groups().filter(g=>g.tech).length===1?'':'s'}</p></div><span class="live-badge"><i></i> Live</span></div><div class="summary-scroll"><div class="preview-items">${current.lines.length?summaryRows():'<div class="preview-empty">'+icon('ticket')+'<strong>Your ticket starts here</strong><p>Select a technician and add a service.<br>Prices update as you work.</p></div>'}</div></div><div class="summary-footer"><div class="summary-line"><span>Menu subtotal</span><strong data-po-total="subtotal">${money(t.subtotalCents)}</strong></div><div class="summary-line"><span>Service discounts</span><strong data-po-total="discount">−${money(t.discountCents)}</strong></div><div class="preview-total"><span>Services total</span><strong data-po-total="net">${money(t.netCents || 0)}</strong></div><p class="hint">Tip and payment are next.</p></div></aside>`;}
  function summaryRows(){return groups().map(g=>`<div class="summary-tech"><div class="summary-tech-head"><span>${esc(g.tech || 'Technician needed')}</span><strong data-po-summary-group="${g.id}">${money(groupLines(g).reduce((sum,l)=>sum+lineNet(l),0))}</strong></div>${groupLines(g).map(l=>`<div class="summary-service"><div class="summary-line ${l.parentLineId?'addon-summary':''}"><span data-po-summary-name="${l.id}">${l.parentLineId?icon('addon','dc-addon-icon'):''}${esc(l.name || 'Custom service')}${l.coTech?'<small>Shared with '+esc(l.coTech)+'</small>':''}</span><strong data-po-summary-line="${l.id}">${money(lineNet(l))}</strong></div></div>`).join('')}</div>`).join('');}
  function tipHtml(){
    const p=current.checkout,values=tipMode==='percent'?[0,10,15,18,20,25]:[0,5,10,20];
    return `<div class="tip-picker"><div class="tip-picker-head"><strong>Guest tip</strong><span data-po-tip-total>${money(total().tipCents)}</span></div><div class="tip-entry-row"><div class="tip-mode" role="group" aria-label="Tip entry type">${[['percent','Percent'],['amount','Amount'],['custom','Custom']].map(([id,label])=>button(label,'tip-mode',`data-value="${id}" aria-pressed="${tipMode===id}"`,tipMode===id?'selected':'')).join('')}</div><label class="tip-inline-input"><span>${tipMode==='percent'?'%':'$'}</span><input type="number" min="0" max="${tipMode==='percent'?100:99999}" step="0.01" inputmode="decimal" aria-label="${tipMode==='percent'?'Tip percent':'Tip amount'}" data-direct-field="tip" value="${p.tip || 0}"></label></div>${tipMode!=='custom'?`<div class="tip-presets" role="group" aria-label="Tip presets">${values.map(value=>button(value===0?'No tip':tipMode==='percent'?value+'%':money(value*100),'tip-value',`data-value="${value}" aria-pressed="${Number(p.tip)===value}"`,Number(p.tip)===value?'selected':'')).join('')}</div>`:''}${tipMode==='percent'?'<p class="hint">Calculated on discounted services, before payment fees.</p>':''}</div>`;
  }
  function allocations(){const t=total();return demo.allocateTip(current.lines,t.tipCents || 0,current.checkout.tipSplitMode,current.checkout.tipAllocations);}
  function tipAllocationHtml(){
    const values=allocations(),p=current.checkout,names=Object.keys(values);
    return names.length===1?`<div class="tip-auto"><span>${esc(names[0])} receives the tip</span><strong>${money(values[names[0]])}</strong></div>`:`<div class="tip-allocation"><div class="tip-split-modes" role="group" aria-label="Tip split method">${[['proportional','By work'],['fifty','50 / 50'],['equal','Equal'],['manual','Manual']].map(([id,label])=>button(label,'tip-split',`data-value="${id}" ${id==='fifty'&&names.length!==2?'disabled':''} aria-pressed="${p.tipSplitMode===id}"`,p.tipSplitMode===id?'selected':'')).join('')}</div><div class="tip-split-list">${names.map(name=>`<div class="tip-split-row"><span>${esc(name)}</span>${p.tipSplitMode==='manual'?`<label class="tip-input-wrap">$ <input type="number" min="0" step="0.01" inputmode="decimal" data-direct-field="tip-allocation" data-tech="${esc(name)}" value="${p.tipAllocations?.[name] || 0}" aria-label="Tip for ${esc(name)}"></label>`:`<strong>${money(values[name])}</strong>`}</div>`).join('')}</div><p class="tip-status ${Object.values(values).reduce((s,n)=>s+n,0)===(total().tipCents || 0)?'balanced':'unbalanced'}">${Object.values(values).reduce((s,n)=>s+n,0)===(total().tipCents || 0)?'Tip fully allocated':'Manual amounts must match the guest tip'}</p><p class="hint">Salon default: ${esc(demo.load().payment.tipSplit)}</p></div>`;
  }
  function cashFeedbackHtml(){const p=current.checkout,t=total(),received=Math.round(Number(p.cash)*100),change=received-t.totalCents;return p.cash===''?'':`<span class="${change>=0?'cash-change':'cash-short'}">${change>=0?'Change '+money(change):'Remaining '+money(-change)}</span>`;}
  function paymentHtml(){
    const p=current.checkout,methods=demo.methods(),primary=methods.filter(m=>['cash','card','zelle','gift-card','split'].includes(m.id)),other=methods.filter(m=>!primary.includes(m));
    const paymentIcons={cash:'cash',card:'card','gift-card':'gift',crypto:'crypto',split:'split'},selectedOther=other.find(m=>m.id===p.method);
    const chip=m=>button(`<span class="payment-chip-icon" aria-hidden="true">${icon(paymentIcons[m.id] || 'wallet')}</span><span class="payment-chip-copy"><b>${esc(m.id==='card'?'Card':m.label)}</b><small>${money(total(m.id).totalCents)}</small></span>`,'payment',`data-value="${esc(m.id)}" aria-pressed="${p.method===m.id}" aria-label="${esc(m.label)} · ${money(total(m.id).totalCents)}"`,'payment-chip payment-'+m.id+' '+(p.method===m.id?'selected':''));
    let entry='';
    if(p.method==='cash'){
      const presets=[20,50,100].map(value=>button('$'+value,'cash-value',`data-value="${value}" ${value*100<total().totalCents?'hidden':''}`,'btn-small')).join('');
      entry=`<div class="cash-entry"><label class="po-tip-entry">Cash received ($)<input class="input" type="number" min="0" step="0.01" inputmode="decimal" data-direct-field="cash" value="${esc(p.cash)}" placeholder="${(total().totalCents/100).toFixed(2)}"></label><div class="cash-feedback" data-po-cash-feedback aria-live="polite">${cashFeedbackHtml()}</div><div class="cash-presets">${button('Exact','cash-value','data-exact="true"','btn-small')}${presets}</div></div>`;
    }else if(p.method==='split'){
      entry=`<label class="po-tip-entry">Cash service portion ($)<input class="input" type="number" min="0" step="0.01" inputmode="decimal" data-direct-field="splitCash" value="${esc(p.splitCash ?? '')}"></label><p class="hint">Card pays the remaining services, tip and card fee.</p>`;
    }else if(p.method==='gift-card'){
      entry=`<label class="po-tip-entry">Gift Card reference<input class="input" data-direct-field="giftCode" value="${esc(p.giftCode || '')}" placeholder="Demo gift card reference"></label>`;
    }
    return `<div class="payment-choice-bar" role="group" aria-label="Payment methods">${primary.map(chip).join('')}${other.length?button(`<span class="payment-chip-icon" aria-hidden="true">${icon(p.moreOpen?'chevron':'more')}</span><span class="payment-chip-copy"><b>${p.moreOpen?'Less':selectedOther?esc(selectedOther.label):'More'}</b><small>${selectedOther?money(total().totalCents):other.length+' options'}</small></span>`,'payment-more',`aria-expanded="${!!p.moreOpen}"`,'payment-chip payment-more '+(selectedOther?'selected':'')):''}</div>${p.moreOpen?`<div class="payment-choice-bar payment-choice-extra" role="group" aria-label="More payment methods">${other.map(chip).join('')}</div>`:''}${entry}<p class="estimate-footnote">Each amount includes tip and the method’s discount or fee. Card fee excludes tip. Tax is not calculated.</p>`;
  }
  function summaryHtml(){
    const t=total(),splitLabels={proportional:'By work',fifty:'50 / 50',equal:'Equal',manual:'Manual'};
    return `<aside class="summary-panel payment-panel" aria-label="Checkout summary"><div class="summary-heading"><span class="preview-icon">${icon('card')}</span><div><h3>Payment & checkout</h3><p>Tip, payment method and final total</p></div></div><div class="summary-scroll"><details class="checkout-detail work-detail" ${detailAttrs('work')}><summary><span>${icon('ticket')} Ticket details · ${current.lines.length} items</span><strong data-po-total="net">${money(t.netCents)}</strong></summary><div class="detail-content">${summaryRows()}</div></details><div class="summary-block">${tipHtml()}<details class="checkout-detail tip-detail" ${detailAttrs('tip-split',current.checkout.tipSplitMode==='manual')}><summary><span>${icon('users')} Tip allocation</span><small>${esc(splitLabels[current.checkout.tipSplitMode] || 'By work')}</small></summary><div class="detail-content" data-po-tip-allocation>${tipAllocationHtml()}</div></details></div><details class="checkout-detail order-discount-detail" ${detailAttrs('order-discount',!!current.discount?.value)}><summary><span>${icon('discount')} Order discount</span><small data-po-order-discount>${money(Math.round(Number(current.discount?.value || 0)*100))}</small></summary><div class="detail-content"><label class="po-tip-entry">Discount amount ($)<input class="input" type="number" min="0" step="0.01" inputmode="decimal" data-direct-field="order-discount" value="${current.discount?.value || 0}"></label><p class="hint">Applies after individual service discounts.</p></div></details><div class="summary-block payment-block"><h4>Payment method</h4><div data-po-payment>${paymentHtml()}</div></div></div><div class="summary-footer"><div class="total-breakdown">${[['Services & add-ons','subtotalCents','subtotal'],['Service & order discounts','discountCents','discount'],['Guest tip','tipCents','tip'],['Payment discount','methodDiscountCents','methodDiscount'],['Card fee · tip excluded','feeCents','fee']].map(([label,key,id])=>`<div class="summary-line ${id==='fee'?'fee-line':''}"><span>${label}</span><strong data-po-total="${id}">${['discount','methodDiscount'].includes(id)?'−':''}${money(t[key])}</strong></div>`).join('')}</div><div class="total-line"><span>Total due</span><strong data-po-total="total">${money(t.totalCents)}</strong></div><p class="approval-note" data-po-approval ${requiresApproval()?'':'hidden'}>${icon('lock')} Manager PIN required for discounts or changed prices.</p></div></aside>`;
  }
  function editorHtml(){
    const t=total(),itemCount=current?.lines.length || 0,ready=stage===1?!!(current||guest.status==='existing'||guest.status==='new'&&guest.customer.trim()):stage===2?!validateServices():true;
    return `<section class="checkout-frame panel checkout-stage-${stage}" aria-label="Checkout flow"><div class="builder-head"><div class="builder-title">${button(icon('arrow'),'list','aria-label="Back to checkout list" title="Checkout list"','icon-button')}<div><h2>Direct checkout</h2><p class="muted">${current?esc(current.id):'New customer checkout'}</p></div></div><span class="direct-note">${icon('check')} No check-in required</span></div><nav class="checkout-progress" aria-label="Checkout steps">${['Customer','Technician & services','Payment & checkout'].map((label,index)=>button(`<b>${stage>index+1?icon('check'):index+1}</b><span class="step-copy"><span class="step-full">${label}</span><span class="step-short">${['Customer','Services','Payment'][index]}</span></span>`,'go-step',`data-step="${index+1}" aria-label="${label}" ${stage===index+1?'aria-current="step"':''}`,`step-button ${stage===index+1?'active':stage>index+1?'done':''}`)).join('')}</nav><div class="builder-grid"><div class="stack">${customerHtml()}${stage>=2?servicesHtml():''}</div>${stage===3?summaryHtml():stage===2?previewHtml():''}</div><div class="checkout-action-wrap"><p class="review-warning" role="status" data-po-warning>${esc(warning)}</p><div class="checkout-step-actions">${button(icon('arrow')+(stage===1?'List':stage===2?'Customer':'Services'),'previous','','btn-secondary')}<div class="action-context">${stage===1?'<span>Customer first, then services and payment</span>':`<span>${itemCount} item${itemCount===1?'':'s'} <span class="action-dot">·</span> ${stage===2?'Services total':'Total due'}</span><strong data-po-total="${stage===2?'net':'total'}">${money(stage===2?t.netCents:t.totalCents)}</strong>`}</div>${button(stage===3?'Review checkout '+icon('arrowRight'):(stage===1?'Continue to services':'Continue to payment')+icon('arrowRight'),stage===3?'review':'next',`data-po-primary ${!ready?'disabled':''}`,'btn-primary')}<span class="action-demo">Demo checkout</span></div></div></section>`;
  }
  async function cancelCheckout(id){
    let ticket=records.find(t=>t.id===id);if(!canCancel(ticket))return;
    const operator=demo.account(),started=cancelNeedsApproval(ticket);
    const reasons=['Guest left','Duplicate ticket','Service declined','Created in error','Other'];
    const needsPin=started||demo.load().rules.cancel;
    const result=await Swal.fire({
      title:'Cancel checkout?',
      html:`<div class="po-cancel-details"><strong>${esc(ticket.customer)} · ${esc(ticket.id)}</strong><span>${ticket.lines.map(l=>esc(l.name || 'Custom service')).join(', ') || 'No services'}</span><span>Technician: ${esc(ticket.tech || 'Unassigned')}</span></div><p class="po-cancel-warning" id="po-cancel-warning">This removes the checkout from active work. Its history is retained. No payment or refund is processed.</p><label class="pos-approval-field">Reason · required<select id="po-cancel-reason"><option value="">Choose reason</option>${reasons.map(reason=>`<option value="${reason}">${reason}</option>`).join('')}</select></label>${needsPin?'<p class="pos-muted">Manager / Owner PIN required.</p>':''}`,
      showCancelButton:true,focusCancel:true,cancelButtonText:'Keep checkout',confirmButtonText:needsPin?'Continue with PIN':'Yes, cancel checkout',confirmButtonColor:'#b6384c',
      customClass:{popup:'pos-swal po-cancel-dialog'},
      didOpen:()=>{Swal.getPopup().setAttribute('role','alertdialog');Swal.getPopup().setAttribute('aria-describedby','po-cancel-warning');},
      preConfirm:()=>{const reason=document.getElementById('po-cancel-reason').value;if(!reasons.includes(reason)){Swal.showValidationMessage('Choose a reason before cancelling.');return false;}return reason;}
    });
    if(!result.isConfirmed||demo.account().id!==operator.id)return;
    ticket=records.find(t=>t.id===id);if(!canCancel(ticket))return;
    const approval=await demo.approve('cancel',id,{force:cancelNeedsApproval(ticket),label:'Cancel checkout'});
    if(!approval||demo.account().id!==operator.id)return;
    try{const saved=JSON.parse(localStorage.getItem(key) || '[]');if(!Array.isArray(saved))throw new Error();records=saved;}
    catch(_){warning='Unable to read this checkout. Try again.';render();return;}
    ticket=records.find(t=>t.id===id);if(!canCancel(ticket))return;
    if(cancelNeedsApproval(ticket)&&!approval.approver){warning='Checkout changed. Cancel again with Manager / Owner approval.';render();return;}
    const previous={...ticket};
    Object.assign(ticket,{status:'cancelled',cancelled:true,cancelReason:result.value,cancelledBy:operator.name,cancelApprovedBy:approval.approver?.name || '',cancelledAt:new Date().toISOString()});
    if(!persist()){
      Object.keys(ticket).forEach(key=>{if(!(key in previous))delete ticket[key];});Object.assign(ticket,previous);
      render();return;
    }
    const logged=demo.audit('Cancelled checkout',id,approval.approver || operator,result.value);
    if(current?.id===id){current=null;view='list';contactUntil=0;}
    warning=logged?'':'Cancellation saved, but its activity log could not be saved.';
    render();
  }
  function accountHtml(){return `<button type="button" class="po-account" data-pos-switch>${icon('user')} ${esc(demo.account().name)} · ${esc(demo.account().role)}</button>`;}
  function checkoutCardHtml(t){
    const cancelled=isCancelled(t),status=cancelled?'Cancelled':t.payment?'Paid':'Draft';
    return `<article class="ticket-card panel"><div class="ticket-top"><div><span class="ticket-id">${esc(t.id)}</span><h4 class="ticket-name">${esc(t.customer)}</h4></div><span class="status ${cancelled?'po-cancelled':t.payment?'po-paid':''}">${status}</span></div><div class="ticket-details"><div class="field-label">Services</div><p>${t.lines.map(l=>esc(l.name)).join(', ') || 'No services added yet'}</p><div class="field-label">Technician</div><p>${esc(t.tech || 'Not assigned')}</p>${cancelled?'<div class="field-label">Cancellation reason</div><p>'+esc(t.cancelReason || '—')+'</p>':''}</div><div class="po-ticket-meta">${demo.timeHtml(cancelled?t.cancelledAt:t.payment?.paidAt || t.createdAt)}<strong>${t.payment?money(t.payment.totalCents):cancelled?'':'Not paid'}</strong></div><div class="ticket-actions">${button(icon(cancelled?'ticket':'card')+(cancelled?' View cancellation':t.payment?' View saved receipt':' Resume checkout'),'open',`data-id="${t.id}" ${!canCheckout()?'disabled':''}`,'btn-secondary btn-wide')}${canCancel(t)?button('Cancel checkout','cancel-checkout',`data-id="${t.id}" aria-label="Cancel checkout ${esc(t.id)} for ${esc(t.customer)}"`,'ticket-cancel'):''}</div></article>`;
  }
  function listHtml(){
    const rows=records.filter(t=>(filter==='cancelled'?isCancelled(t):!isCancelled(t)&&(filter==='all'||(t.payment?'paid':'draft')===filter))&&(!search||(t.customer+' '+t.id).toLowerCase().includes(search.toLowerCase())||(/^[\d\s()+.-]+$/.test(search)&&digits(t.phone).includes(digits(search)))));
    const drafts=records.filter(t=>!t.payment&&!isCancelled(t)).length;
    return `<section class="checkout-hero"><div class="checkout-list-title"><h2>Checkout Customer</h2>${drafts?'<span class="count-chip">Drafts: '+drafts+'</span>':''}</div><div class="hero-actions">${accountHtml()}${button(icon('plus')+' New checkout','new',!canCheckout()?'disabled':'','btn-primary')}</div></section><p class="review-warning" role="status">${esc(warning)}</p><div class="po-list-tools"><input class="input" data-po-search placeholder="Search name, phone or ID" value="${esc(search)}" aria-label="Search checkouts"><select class="select" data-po-filter aria-label="Checkout status">${[['all','Active & paid'],['draft','Drafts'],['paid','Paid'],['cancelled','Cancelled']].map(([id,label])=>`<option value="${id}" ${filter===id?'selected':''}>${label}</option>`).join('')}</select></div><div class="ticket-grid">${rows.map(checkoutCardHtml).join('') || '<div class="panel ticket-empty"><span class="po-empty-icon">'+icon('ticket')+'</span><strong>'+((search||filter!=='all')?'No matching checkouts':'No checkouts yet')+'</strong></div>'}</div>`;
  }
  function cancelledHtml(){
    return `<section class="panel receipt-confirm cancelled-confirm" aria-label="Cancelled checkout"><span class="success-icon">${icon('close')}</span><h2>Checkout cancelled</h2><p class="muted">${esc(current.customer)} · ${esc(current.id)}</p><div class="cancellation-record"><div><span>Reason</span><strong>${esc(current.cancelReason || '—')}</strong></div><div><span>Cancelled by</span><strong>${esc(current.cancelledBy || '—')}</strong></div>${current.cancelApprovedBy?'<div><span>Approved by</span><strong>'+esc(current.cancelApprovedBy)+'</strong></div>':''}<div><span>Cancelled at</span><strong>${demo.timeHtml(current.cancelledAt)}</strong></div></div><div class="receipt-quick">${current.lines.length?summaryRows():'<p class="hint">No services</p>'}</div>${button('Checkout Customer','list','','btn-primary btn-wide')}</section>`;
  }
  function receiptHtml(){const p=current.payment;return `<section class="panel receipt-confirm"><span class="success-icon">${icon('check')}</span><p class="po-eyebrow">Checkout complete</p><h2>Payment complete · demo</h2><p class="muted">${esc(current.customer)} · ${esc(current.id)}</p><div class="receipt-quick">${[['Services',p.subtotalCents],['Discount',-p.discountCents],['Payment discount',-p.methodDiscountCents],['Card fee',p.feeCents],['Guest tip',p.tipCents]].map(([label,amount])=>`<div class="summary-line"><span>${label}</span><strong>${money(amount)}</strong></div>`).join('')}<div class="total-line"><span>Total collected</span><span>${money(p.totalCents)}</span></div></div><p class="hint">${esc(demo.load().payment.methods.find(m=>m.id===p.method)?.label || p.method)} · ${demo.timeHtml(p.paidAt)}</p><div class="receipt-actions">${button('Print receipt','print')}${button('SMS receipt · demo','sms')}${button('View saved receipt','saved-receipt')}${button('Done · Checkout Customer','list','','btn-primary')}</div><p class="safe-note">${icon('info')} Demo only. No money was charged and no SMS was sent.</p></section>`;}
  function render(){
    const pageScroll=document.scrollingElement.scrollTop,panelScroll=root.querySelector('.summary-scroll')?.scrollTop || 0;
    const pickerScrolls=new Map([...root.querySelectorAll('.service-picker')].map(el=>[el.dataset.pickerGroup+':'+el.dataset.pickerParent,el.querySelector('.picker-grid')?.scrollTop || 0]));
    const active=root.contains(document.activeElement)?document.activeElement:null;
    const activePicker=active?.closest('.service-picker');
    const focusData=active?{id:active.id,tag:active.tagName,data:{...active.dataset},picker:activePicker?activePicker.dataset.pickerGroup+':'+activePicker.dataset.pickerParent:''}:null;
    setUrl();root.innerHTML=`${view==='list'?'':`<div class="po-workspace-meta"><span>FRONT DESK <span class="po-meta-divider">/</span> DIRECT CHECKOUT</span>${accountHtml()}</div>`}${view==='list'?listHtml():view==='receipt'?receiptHtml():view==='cancelled'?cancelledHtml():view==='legacy'?'<section class="ticket-workspace" data-po-legacy></section>':editorHtml()}`;
    renderIcons();
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
  function openLegacy(){const legacy=root.querySelector('[data-po-legacy]');window.NEXORA_TICKET_WORKSPACE.mount(legacy,{catalog,technicians:()=>technicians().map(name=>({name,status:'available'})),onChange(){save();},onModeChange(){},onBack(){current=null;view='list';render();}}).open(current,'checkout');}
  function updatePrimary(){
    const primary=root.querySelector('[data-po-primary]');if(!primary)return;
    primary.disabled=stage===1?!Boolean(current||guest.status==='existing'||guest.status==='new'&&guest.customer.trim()):stage===2?Boolean(validateServices()):false;
  }
  function updateSummary(){
    if(!current){updatePrimary();return;}const t=total(),fields={subtotal:t.subtotalCents,discount:t.discountCents,net:t.netCents,tip:t.tipCents,methodDiscount:t.methodDiscountCents,fee:t.feeCents,total:t.totalCents,button:t.totalCents};
    root.querySelectorAll('[data-po-total]').forEach(el=>el.textContent=(['discount','methodDiscount'].includes(el.dataset.poTotal)?'−':'')+money(fields[el.dataset.poTotal]));
    root.querySelectorAll('[data-net-line]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.netLine);if(l)el.textContent='Net '+money(lineNet(l));});
    root.querySelectorAll('[data-po-summary-line]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.poSummaryLine);if(l)el.textContent=money(lineNet(l));});
    root.querySelectorAll('[data-po-summary-name]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.poSummaryName);if(l)el.innerHTML=(l.parentLineId?icon('addon','dc-addon-icon'):'')+esc(l.name || 'Custom service')+(l.coTech?'<small>Shared with '+esc(l.coTech)+'</small>':'');});
    root.querySelectorAll('[data-po-discount-line]').forEach(el=>{const l=current.lines.find(l=>l.id===el.dataset.poDiscountLine);if(l){el.innerHTML=icon('discount')+'Discount'+(l.discount?.value?' · '+money(Math.round(Number(l.price || 0)*100)-lineNet(l))+' off':'');el.classList.toggle('applied',Number(l.discount?.value)>0);}});
    root.querySelectorAll('[data-po-group-net],[data-po-summary-group]').forEach(el=>{const id=el.dataset.poGroupNet || el.dataset.poSummaryGroup;el.textContent=money(current.lines.filter(l=>l.groupId===id).reduce((sum,l)=>sum+lineNet(l),0));});
    root.querySelectorAll('[data-po-tip-total]').forEach(el=>el.textContent=money(t.tipCents));
    const orderDiscount=root.querySelector('[data-po-order-discount]');if(orderDiscount)orderDiscount.textContent=money(Math.round(Number(current.discount?.value || 0)*100));
    const approval=root.querySelector('[data-po-approval]');if(approval)approval.hidden=!requiresApproval();
    const tipStatus=root.querySelector('.tip-status');if(tipStatus){const balanced=Object.values(allocations()).reduce((s,n)=>s+n,0)===(t.tipCents || 0);tipStatus.textContent=balanced?'Tip fully allocated':'Manual amounts must match the guest tip';tipStatus.classList.toggle('balanced',balanced);tipStatus.classList.toggle('unbalanced',!balanced);}
    const allocationsNode=root.querySelector('[data-po-tip-allocation]');if(allocationsNode&&!allocationsNode.contains(document.activeElement))allocationsNode.innerHTML=tipAllocationHtml();
    root.querySelectorAll('[data-direct-action="payment"] small').forEach(el=>el.textContent=money(total(el.closest('button').dataset.value).totalCents));
    const selectedOther=root.querySelector('.payment-more.selected small');if(selectedOther)selectedOther.textContent=money(t.totalCents);
    const cashFeedback=root.querySelector('[data-po-cash-feedback]');if(cashFeedback)cashFeedback.innerHTML=cashFeedbackHtml();
    const cashInput=root.querySelector('[data-direct-field="cash"]');if(cashInput)cashInput.placeholder=(t.totalCents/100).toFixed(2);
    root.querySelectorAll('[data-direct-action="cash-value"][data-value]').forEach(el=>el.hidden=Number(el.dataset.value)*100<t.totalCents);
    root.querySelectorAll('[data-direct-action="tip-value"]').forEach(el=>{const selected=Number(current.checkout.tip)===Number(el.dataset.value);el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected);});
    renderIcons();updatePrimary();
  }
  function goStep(target){
    warning='';target=Math.max(1,Math.min(3,Number(target)||1));
    if(target>=2&&!ensureCustomer()){render();return;}
    if(target===3){warning=validateServices();if(warning){render();return;}}
    stage=target;render();
    if(stage===1&&!current)root.querySelector('#customer-phone')?.focus();
    if(stage===2){const group=groups().find(g=>!g.tech);if(group)root.querySelector('[data-direct-field="tech"][data-group="'+group.id+'"]')?.focus();}
  }
  function validateServices(){if(!current.lines.some(l=>!l.parentLineId))return 'Add at least one main service.';if(groups().some(g=>!g.tech))return 'Select a technician for each group.';if(current.lines.some(l=>!l.name.trim()||l.price==null||!Number.isFinite(Number(l.price))||Number(l.price)<0))return 'Enter a name and valid price for each service.';if(current.lines.some(l=>l.discount?.type==='percent'&&Number(l.discount.value)>100))return 'Service discount cannot exceed 100%.';return '';}
  async function review(){
    if(!current||isCancelled(current)||current.payment||!canCheckout())return;
    const checkoutId=current.id;
    warning=validateServices();const t=total(),p=current.checkout;
    if(!warning&&(!Number.isFinite(t.totalCents)||t.error))warning=t.error || 'Enter valid payment amounts.';
    if(!warning&&(!Number.isFinite(Number(p.tip))||Number(p.tip)<0||(p.tipType==='percent'&&Number(p.tip)>100)))warning='Enter a valid tip from 0 to 100% or a dollar amount.';
    if(!warning&&!demo.methods().some(m=>m.id===p.method))warning='Choose an enabled payment method.';
    if(!warning&&p.method==='cash'&&(!Number.isFinite(Number(p.cash))||p.cash===''||Math.round(Number(p.cash)*100)<t.totalCents))warning='Cash received must cover '+money(t.totalCents)+'.';
    if(!warning&&p.method==='split'&&(p.splitCash==null||p.splitCash===''||Number(p.splitCash)<0||Math.round(Number(p.splitCash)*100)>t.netCents))warning='Enter a cash service portion between zero and '+money(t.netCents)+'.';
    if(!warning&&p.method==='gift-card'&&!p.giftCode?.trim())warning='Enter the Gift Card reference.';
    if(!warning&&Object.values(allocations()).reduce((s,n)=>s+n,0)!==t.tipCents)warning='Manual tip allocations must match the guest tip.';
    if(warning){render();return;}
    const approvals=current.poPendingApprovals || (current.pendingApproval?[current.pendingApproval]:[]);
    for(const action of approvals){
      if(current?.id!==checkoutId||isCancelled(current)||current.payment)return;
      if(!await demo.approve(action,checkoutId,{label:action==='price'?'Approve changed service prices':'Approve checkout discounts'}))return;
    }
    if(current?.id!==checkoutId||isCancelled(current)||current.payment)return;
    const result=await Swal.fire({title:'Review checkout',html:`<div class="receipt-quick"><div class="summary-line"><span>Customer</span><strong>${esc(current.customer)}</strong></div><div class="summary-line"><span>Payment method</span><strong>${esc(demo.methods().find(m=>m.id===p.method)?.label)}</strong></div><div class="total-line"><span>Total due</span><strong>${money(t.totalCents)}</strong></div></div><p class="pos-muted">Demo only. No payment is collected.</p>`,showCancelButton:true,confirmButtonText:'Complete demo',cancelButtonText:'Back to checkout',confirmButtonColor:'#4c43df',customClass:{popup:'pos-swal po-review-dialog'}});
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
    if(action==='list'){save();view='list';warning='';current=null;contactUntil=0;render();return;}
    if(action==='new'){newCheckout();return;}
    if(action==='cancel-checkout'){await cancelCheckout(b.dataset.id);return;}
    if(action==='open'){const record=records.find(t=>t.id===b.dataset.id);if(!record)return;current=normalize(record);view=isCancelled(current)?'cancelled':current.payment?'receipt':current.splitBills?'legacy':'editor';stage=current.lines.length?3:2;tipMode=current.checkout.tipType==='percent'?'percent':'amount';warning='';render();return;}
    if(action==='print'){window.print();return;}
    if(action==='sms'){Swal.fire({title:'SMS receipt · demo',text:'The receipt is prepared for '+phone()+'. No SMS was sent.',confirmButtonText:'Done',customClass:{popup:'pos-swal'}});return;}
    if(action==='saved-receipt'){Swal.fire({title:'Saved receipt',html:`<p>${esc(current.id)} · ${esc(current.customer)}</p>${summaryRows()}<div class="total-line"><span>Total paid</span><strong>${money(current.payment.totalCents)}</strong></div>`,customClass:{popup:'pos-swal po-review-dialog'},didOpen:()=>renderIcons(Swal.getPopup())});return;}
    if(!canCheckout())return;
    if(action==='lookup'){lookup();return;}
    if(action==='different-customer'){current=null;guest={phone:'',customer:'',status:''};contactUntil=0;stage=1;warning='';save();render();root.querySelector('#customer-phone')?.focus();return;}
    if(action==='reveal-contact'){if(await demo.approve('contact',current?.id || guest.customer,{label:'View full customer contact'})){contactUntil=Date.now()+30000;render();setTimeout(()=>{contactUntil=0;if(view==='editor')render();},30000);}return;}
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
      const mains=current.lines.filter(l=>!l.parentLineId);if(!mains.length){warning='Add a main service before linking another technician’s add-on.';render();return;}
      const result=await Swal.fire({title:'Add-on by '+(g.tech || 'this technician'),html:`<label class="pos-approval-field">Related main service<select id="po-related-service">${mains.map(l=>`<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select></label><label class="pos-approval-field">Add-on<select id="po-extra-service">${addons.map(a=>`<option value="${a.id}">${esc(a.name)} · ${money(a.price*100)}</option>`).join('')}</select></label>`,showCancelButton:true,confirmButtonText:'Add their add-on',customClass:{popup:'pos-swal'},preConfirm:()=>({parent:document.getElementById('po-related-service').value,service:document.getElementById('po-extra-service').value})});
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
  window.addEventListener('storage',e=>{
    if(e.key!==key)return;
    try{
      const saved=JSON.parse(e.newValue || '[]');if(!Array.isArray(saved))return;records=saved;
      if(current){
        const record=records.find(t=>t.id===current.id);current=record?normalize(record):null;
        if(!current){view='list';warning='Checkout is no longer available.';}
        else if(isCancelled(current)||current.payment){view=isCancelled(current)?'cancelled':'receipt';contactUntil=0;if(Swal.isVisible())Swal.close();}
      }
      render();
    }catch(_){}
  });
  const params=new URLSearchParams(location.search),id=params.get('checkoutId');current=records.find(t=>t.id===id) || null;
  if(current){normalize(current);view=isCancelled(current)?'cancelled':current.payment?'receipt':current.splitBills?'legacy':'editor';stage=params.get('step')?Math.max(1,Math.min(3,Number(params.get('step'))||2)):params.get('mode')==='edit'?2:3;tipMode=current.checkout.tipType==='percent'?'percent':'amount';render();}
  else if(params.get('view')==='list'||!canCheckout())render();else newCheckout();
})();
