(function () {
  'use strict';
  const demo=window.NEXORA_POS_DEMO,stations=window.NEXORA_STATIONS,esc=demo.esc;
  const access=document.querySelector('[data-settings-panel="access-pin"]');
  const payment=document.querySelector('[data-settings-panel="payment-fees"]');
  const stationPanel=document.querySelector('[data-settings-panel="stations"]');
  if(!access||!payment||!stationPanel)return;
  let paymentDraft=demo.load().payment,stationDraft=stations.load().settings;
  let logFlag=false,logFrom='',logTo='';
  const actions={contact:'View full customer contact',notes:'View private customer notes',discount:'Apply a discount',price:'Change a service price',cancel:'Cancel an unpaid ticket',refund:'Refund a payment'};
  const owner=()=>demo.account().role==='owner';
  const manager=()=>['owner','manager'].includes(demo.account().role);
  const heading=(title,copy)=>`${demo.sessionHtml()}<div class="pos-heading"><div><h2>${title}</h2><p class="pos-muted">${copy}</p></div><a class="pos-button" href="pos-front-desk-tickets.html">Back to Front Desk</a></div>`;
  function accessHtml() {
    const data=demo.load();
    access.classList.add('pos-settings');
    access.innerHTML=heading('Access & PIN','Assign POS roles, enroll personal demo PINs, and choose which actions require approval.')+
      `<div class="pos-warning">Local prototype · Use demo PINs only. Owner: 1234 · Manager: 5678. PIN approvals apply to one action.</div>
      <form data-pos-access><section class="pos-card"><span class="pos-kicker">1 · POS ACCOUNTS</span><h3>Individual roles & personal PINs</h3><p>Each manager and owner has a separate PIN. A technician works on assigned tickets; a cleaner confirms sanitation.</p><div class="pos-table"><table><thead><tr><th>Account</th><th>POS role</th><th>PIN enrollment</th><th>Action</th></tr></thead><tbody>${data.accounts.map(a=>`<tr><td>${esc(a.name)}</td><td>${a.id==='owner'?'Owner':`<select data-pos-role="${esc(a.id)}" aria-label="Role for ${esc(a.name)}" ${!owner()?'disabled':''}>${['manager','cashier','technician','cleaner'].map(role=>`<option ${role===a.role?'selected':''}>${role}</option>`).join('')}</select>`}</td><td>${a.pin?'Personal demo PIN enrolled':'No PIN · enroll after assigning Manager role'}</td><td>${['owner','manager'].includes(a.role)?`<button type="button" data-pos-enroll="${esc(a.id)}" ${!owner()?'disabled':''}>${a.pin?'Change demo PIN':'Enroll demo PIN'}</button>`:'—'}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="pos-card"><span class="pos-kicker">2 · APPROVAL RULES</span><h3>Require Manager / Owner PIN</h3><div class="pos-rule-list">${Object.entries(actions).map(([id,label])=>`<label class="pos-check"><input type="checkbox" name="${id}" ${data.rules[id]?'checked':''} ${!owner()?'disabled':''}>${label}</label>`).join('')}</div><p>Payment settings, permission changes and station overrides always require approval. Contact access expires after 30 seconds or when the account changes.</p></section>
      <section class="pos-card"><h3>Role permissions</h3><div class="pos-table"><table><thead><tr><th>Action</th><th>Owner</th><th>Manager</th><th>Cashier</th><th>Technician</th><th>Cleaner</th></tr></thead><tbody>${[
        ['Assigned tickets','All','All','All','Assigned only','Blocked'],['Private contact / notes','Personal PIN','Personal PIN','Ask approval','Ask approval','Blocked'],
        ['Discount / change price','Personal PIN','Personal PIN','Ask approval','Ask approval','Blocked'],['Cancel / refund','Personal PIN','Personal PIN','Ask approval','Blocked','Blocked'],
        ['Access / payment settings','Owner PIN','Blocked','Blocked','Blocked','Blocked'],['Station settings / override','Personal PIN','Personal PIN','Ask approval','Blocked','Blocked'],['Confirm clean','On behalf','On behalf','Blocked','Own station','Assigned cleaner']
      ].map(row=>'<tr>'+row.map((value,i)=>`<${i?'td':'th'}>${value}</${i?'td':'th'}>`).join('')+'</tr>').join('')}</tbody></table></div></section>
      <div class="pos-actions"><button type="submit" class="pos-primary" ${!owner()?'disabled':''}>Save access rules with Owner PIN</button><span class="pos-muted">${owner()?'Changes are stored in this browser.':'Switch to the Owner account to edit access rules.'}</span></div><p class="pos-status" data-pos-access-status role="status"></p></form>
      <section class="pos-card"><h3>Approval activity</h3>${auditHtml(data.audit)}</section>`;
  }
  function auditHtml(rows){return rows.length?`<div class="pos-table"><table><thead><tr><th>Action / subject</th><th>Requested by</th><th>Approved by</th><th>Reason</th><th>Time</th></tr></thead><tbody>${rows.slice(0,20).map(r=>`<tr><td>${esc(r.action)}<small>${esc(r.subject)}</small></td><td>${esc(r.operator)}</td><td>${esc(r.approver)}</td><td>${esc(r.reason || '—')}</td><td>${demo.timeHtml(r.at)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="pos-muted">No approvals recorded yet.</p>';}
  function paymentHtml() {
    const p=paymentDraft;
    payment.classList.add('pos-settings');
    payment.innerHTML=heading('Payment Methods & Fees','Choose accepted methods, pricing rules, and the starting tip split for checkout.')+
      `<form data-pos-payment><fieldset ${!owner()?'disabled':''} style="border:0;padding:0;margin:0"><section class="pos-card"><span class="pos-kicker">ACCEPTED PAYMENTS</span><h3>Payment methods</h3><p>Discounts apply after item and order discounts, before tip. Split Pay applies the rule to each portion and requires both Cash and Card enabled.</p>${p.methods.map(m=>`<div class="pos-method-row" data-method-row="${esc(m.id)}"><label class="pos-check"><input type="checkbox" name="enabled" ${m.enabled?'checked':''}><strong>${esc(m.label)}</strong></label><label>Discount<select name="discountType" ${m.id==='split'?'disabled':''}>${[['inherit','Wallet default'],['none','None'],['percent','Percent (%)'],['fixed','Amount ($)']].filter(([id])=>id!=='inherit'||!['cash','card','gift-card','crypto','split'].includes(m.id)).map(([id,label])=>`<option value="${id}" ${m.discountType===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="pos-method-value">Value<input name="discountValue" type="number" min="0" max="${m.discountType==='percent'?100:9999}" step="0.01" value="${m.discountValue}" ${['percent','fixed'].includes(m.discountType)?'':'disabled'}></label>${m.custom?`<button type="button" data-pos-remove-method="${esc(m.id)}">Remove</button>`:''}</div>`).join('')}<div class="pos-actions" style="margin-top:14px"><label style="flex:1">New payment method<input data-pos-method-name maxlength="32" placeholder="e.g. ACH transfer"></label><button type="button" data-pos-add-method>Add method</button></div></section>
      <section class="pos-card"><div class="pos-toggle"><div><h3>Credit Card fee</h3><p>Only the Card service portion after discounts. Tip is excluded.</p></div><label class="pos-check"><input name="cardFeeEnabled" type="checkbox" ${p.cardFeeEnabled?'checked':''}>Enabled</label></div><label>Card fee (%)<input name="cardFeePercent" type="number" min="0" max="100" step="0.01" value="${p.cardFeePercent}"></label></section>
      <section class="pos-card"><div class="pos-toggle"><div><h3>Wallet discount</h3><p>Default for wallets using “Wallet default”. A method’s own discount overrides this rule.</p></div><label class="pos-check"><input name="walletEnabled" type="checkbox" ${p.walletEnabled?'checked':''}>Enabled</label></div><label>Wallet discount (%)<input name="walletPercent" type="number" min="0" max="100" step="0.01" value="${p.walletPercent}"></label></section>
      <section class="pos-card"><h3>Default tip split</h3><div class="pos-rule-list">${[['proportional','By service amount'],['equal','Equal per technician'],['fifty','50 / 50 · two technicians'],['manual','Manual amounts']].map(([id,label])=>`<label class="pos-check"><input type="radio" name="tipSplit" value="${id}" ${p.tipSplit===id?'checked':''}>${label}</label>`).join('')}</div><p>The cashier reviews the split at checkout. Every cent is allocated.</p></section>
      <section class="pos-card"><h3>$100 service example · before tip</h3><div class="pos-preview" data-pos-payment-preview></div></section>
      <div class="pos-actions"><button type="submit" class="pos-primary">Save payment & tip rules with Owner PIN</button></div></fieldset><p class="pos-status" data-pos-payment-status role="status">${owner()?'Local prototype · no live payment changes.':'Switch to the Owner account to edit payment rules.'}</p></form>`;
    preview();
  }
  function readPayment() {
    const f=payment.querySelector('form'),data=new FormData(f);
    const p=JSON.parse(JSON.stringify(paymentDraft));
    payment.querySelectorAll('[data-method-row]').forEach(row=>{const m=p.methods.find(m=>m.id===row.dataset.methodRow);m.enabled=row.querySelector('[name=enabled]').checked;m.discountType=row.querySelector('[name=discountType]').value;m.discountValue=Number(row.querySelector('[name=discountValue]').value);});
    ['cardFeeEnabled','walletEnabled'].forEach(k=>p[k]=f.elements[k].checked);
    ['cardFeePercent','walletPercent'].forEach(k=>p[k]=Number(f.elements[k].value));
    p.tipSplit=data.get('tipSplit') || p.tipSplit;
    return p;
  }
  function preview() {
    if(owner())paymentDraft=readPayment();
    payment.querySelector('[data-pos-payment-preview]').innerHTML=paymentDraft.methods.filter(m=>m.enabled&&m.id!=='split').slice(0,5).map(m=>{
      const percent=m.discountType==='inherit'&&paymentDraft.walletEnabled?paymentDraft.walletPercent:m.discountType==='percent'?m.discountValue:0;
      const reduction=Math.min(10000,Math.max(0,Math.round(m.discountType==='fixed'?m.discountValue*100:10000*percent/100)));
      const fee=m.id==='card'&&paymentDraft.cardFeeEnabled?Math.round((10000-reduction)*paymentDraft.cardFeePercent/100):0;
      return `<article><span>${esc(m.label)}</span><strong>$${((10000-reduction+fee)/100).toFixed(2)}</strong><small>Discount $${(reduction/100).toFixed(2)} · Fee $${(fee/100).toFixed(2)}</small></article>`;
    }).join('');
  }
  function filteredLog(){return stations.load().log.filter(r=>(!logFlag||r.flagged)&&(!logFrom||r.at.slice(0,10)>=logFrom)&&(!logTo||r.at.slice(0,10)<=logTo));}
  function logHtml() {const rows=filteredLog();return `<div class="pos-table"><table><thead><tr><th>Station / ticket</th><th>Confirmed by</th><th>Time</th><th>Checklist</th><th>Overdue</th><th>Flag / reason</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.station)}<small>${esc(r.ticketId || '—')}</small></td><td>${esc(r.by)}${r.onBehalf?'<small>On behalf</small>':''}</td><td>${demo.timeHtml(r.at)}</td><td>${r.checklist.map(i=>esc((i.checked?'✓ ':'— ')+i.item)).join('<br>') || 'Manager override'}</td><td>${r.overdueMin}m</td><td>${r.flagged?'⚑ '+esc(r.reason):'Clean confirmed'}</td></tr>`).join('') || '<tr><td colspan="6">No sanitation records in this range.</td></tr>'}</tbody></table></div>`;}
  function stationsHtml() {
    const data=stations.load(),s=stationDraft;
    stationPanel.classList.add('pos-settings');
    stationPanel.innerHTML=heading('Stations','Chairs, tables & rooms with a cleaning gate between guests.')+
      `<form data-pos-stations><fieldset ${!manager()?'disabled':''} style="border:0;padding:0;margin:0"><section class="pos-card"><h3>How many stations?</h3><p>Pedicure → P. spa chair · Nails → A. table · Wax / lash → R. room. Sample stations are preloaded for this demo.</p><div class="pos-counts">${Object.entries(stations.kinds).map(([kind,value])=>`<label>${value.label}<input type="number" name="count-${kind}" min="0" max="40" step="1" value="${s.counts[kind]}"></label>`).join('')}</div><div class="pos-preview">${Object.entries(s.counts).flatMap(([kind,count])=>Array.from({length:Math.min(count,8)},(_,i)=>`<span>${stations.kinds[kind].prefix}.${i+1}</span>`)).join('')}</div></section>
      <section class="pos-card"><div class="pos-toggle"><div><strong>Station on tickets</strong><p>Auto suggests a free station at Review & Send. Manual lets the desk skip a station. Off hides station fields.</p></div><select name="mode" aria-label="Station mode">${['off','manual','auto'].map(m=>`<option value="${m}" ${m===s.mode?'selected':''}>${m.charAt(0).toUpperCase()+m.slice(1)}</option>`).join('')}</select></div><div class="pos-toggle"><div><strong>Who confirms “Clean”?</strong><p>When the last technician is responsible, their next Beep stays held until clean is confirmed.</p></div><select name="cleaner" aria-label="Who confirms clean">${[['tech','Last technician'],['cleaner','Dedicated cleaner'],['both','Technician or cleaner']].map(([id,label])=>`<option value="${id}" ${id===s.cleaner?'selected':''}>${label}</option>`).join('')}</select></div><div class="pos-toggle"><div><strong>Checklist required for spa chairs</strong><p>Drain, disinfect, wipe, replace liner, and prepare sealed tools.</p></div><label class="pos-check"><input name="checklist" type="checkbox" ${s.checklist?'checked':''}>Required</label></div></section>
      <details class="pos-card"><summary>More options</summary><div class="pos-counts" style="margin:14px 0">${Object.entries(stations.kinds).map(([kind,value])=>`<label>${value.label} cleaning (min)<input name="clean-${kind}" type="number" min="1" max="60" value="${s.cleanMin[kind]}"></label>`).join('')}<label>Hold expires (min)<input name="holdMin" type="number" min="1" max="120" value="${s.holdMin}"></label></div>${[['allowOverride','Allow manager override with a reason'],['beep','Beep cleaner when overdue'],['neighbors','Suggest neighboring stations for groups']].map(([id,label])=>`<label class="pos-check"><input name="${id}" type="checkbox" ${s[id]?'checked':''}>${label}</label>`).join('')}<p>Codes are generated from counts. Zones, capacity and neighbors are edited in the register below. QR checklist links are planned for v1.1.</p></details>
      <div class="pos-actions"><button type="submit" class="pos-primary">Save station setup with PIN</button></div></fieldset><p class="pos-status" data-pos-stations-status role="status">${manager()?'Changes apply to this browser’s demo.':'Switch to Manager / Owner to edit station settings.'}</p></form>
      <section class="pos-card"><div class="pos-heading"><h3>Station register</h3><a class="pos-button" href="staff-work-orders.html">Staff cleaning tasks</a></div><div class="pos-table"><table class="pos-station-register"><thead><tr><th>Code</th><th>Zone / capacity / neighbor</th><th>State</th><th>Responsible</th><th>Actions</th></tr></thead><tbody>${data.stations.filter(st=>st.enabled).map(st=>`<tr><td>${esc(st.code)}</td><td>${esc(st.zone)} · ${st.capacity} guest${st.capacity===1?'':'s'}<small>Neighbor ${esc(st.neighbor || '—')}</small>${manager()?`<button type="button" data-pos-station-edit="${esc(st.code)}">Edit station</button>`:''}</td><td>${stations.labels[st.state]}</td><td>${esc(st.tech || st.blockedNote || '—')}</td><td><div class="pos-station-actions">${st.state==='cleaning'?`<button type="button" data-pos-clean="${esc(st.code)}">Confirm clean</button><button type="button" data-pos-beep="${esc(st.code)}">Beep cleaner</button>`:''}${manager()&&['free','blocked'].includes(st.state)?`<button type="button" data-pos-block="${esc(st.code)}">${st.state==='blocked'?'Unblock':'Block station'}</button>`:''}</div></td></tr>`).join('')}</tbody></table></div></section>
      <section class="pos-card"><div class="pos-heading"><div><h3>Sanitation log</h3><p>Confirmation signatures, checklist, minutes overdue, and manager overrides.</p></div><div class="pos-actions"><button type="button" data-pos-export-csv>Export CSV</button><button type="button" data-pos-export-pdf>Print / save PDF</button></div></div><div class="pos-counts"><label>From<input data-pos-log-from type="date" value="${logFrom}"></label><label>To<input data-pos-log-to type="date" value="${logTo}"></label><label class="pos-check"><input type="checkbox" data-pos-log-flag ${logFlag?'checked':''}>Flagged only</label></div><div data-pos-log>${logHtml()}</div></section>
      <section class="pos-card"><h3>Cleaning reminders & station activity</h3>${data.events.length?`<div class="pos-table"><table><thead><tr><th>Station</th><th>Event</th><th>Recipient</th><th>Time</th></tr></thead><tbody>${data.events.slice(0,15).map(r=>`<tr><td>${esc(r.station)}</td><td>${esc(r.type.replace('station.','').replaceAll('-',' '))}</td><td>${esc(r.to || r.by)}</td><td>${demo.timeHtml(r.at)}</td></tr>`).join('')}</tbody></table></div>`:'<p>No activity yet.</p>'}</section>`;
  }
  function status(panel,selector,text,error=false){const node=panel.querySelector(selector);node.textContent=text;node.classList.toggle('error',error);}
  access.addEventListener('submit',async e=>{
    e.preventDefault();if(!owner())return;
    const rules=Object.fromEntries(Object.keys(actions).map(id=>[id,e.target.elements[id].checked]));
    const roles=[...access.querySelectorAll('[data-pos-role]')].map(input=>({id:input.dataset.posRole,role:input.value}));
    if(!await demo.approve('access','POS roles & approval rules',{ownerOnly:true,label:'Save access rules'}))return;
    const data=demo.load();data.rules=rules;roles.forEach(({id,role})=>{const a=data.accounts.find(a=>a.id===id);a.role=role;if(!['owner','manager'].includes(role))delete a.pin;else if(!a.pin)delete a.pin;});
    const ok=demo.save(data);accessHtml();status(access,'[data-pos-access-status]',ok?'Access rules saved.':'Unable to save access rules.',!ok);
  });
  access.addEventListener('click',async e=>{
    const b=e.target.closest('[data-pos-enroll]');if(!b||!owner())return;
    if(!await demo.approve('access',b.dataset.posEnroll,{ownerOnly:true,label:'Change personal demo PIN'}))return;
    const result=await Swal.fire({title:'New personal demo PIN',input:'password',inputAttributes:{inputmode:'numeric',maxlength:'6',autocomplete:'off'},text:'Use 4–6 digits for this prototype.',showCancelButton:true,customClass:{popup:'pos-swal'},preConfirm:value=>{if(!/^\d{4,6}$/.test(value)){Swal.showValidationMessage('Enter 4–6 digits.');return false;}return value;}});
    if(result.isConfirmed){const data=demo.load();data.accounts.find(a=>a.id===b.dataset.posEnroll).pin=result.value;const ok=demo.save(data);accessHtml();status(access,'[data-pos-access-status]',ok?'Personal demo PIN updated.':'Unable to save PIN.',!ok);}
  });
  payment.addEventListener('input',preview);
  payment.addEventListener('change',e=>{if(e.target.name==='discountType'){const row=e.target.closest('[data-method-row]');row.querySelector('[name=discountValue]').disabled=!['percent','fixed'].includes(e.target.value);}preview();});
  payment.addEventListener('click',e=>{
    if(!owner())return;
    const remove=e.target.closest('[data-pos-remove-method]');if(remove){paymentDraft=readPayment();paymentDraft.methods=paymentDraft.methods.filter(m=>m.id!==remove.dataset.posRemoveMethod);paymentHtml();return;}
    if(e.target.closest('[data-pos-add-method]')){
      const name=payment.querySelector('[data-pos-method-name]').value.trim();
      if(!name||paymentDraft.methods.some(m=>m.label.toLowerCase()===name.toLowerCase())){status(payment,'[data-pos-payment-status]','Enter a unique payment method name.',true);return;}
      paymentDraft=readPayment();paymentDraft.methods.push({id:'custom-'+crypto.randomUUID(),label:name,enabled:true,discountType:'none',discountValue:0,custom:true});paymentHtml();
    }
  });
  payment.addEventListener('submit',async e=>{e.preventDefault();if(!owner())return;const value=readPayment();
    if(!value.methods.some(m=>m.enabled&&m.id!=='split')||value.methods.some(m=>!Number.isFinite(m.discountValue)||m.discountValue<0||(m.discountType==='percent'&&m.discountValue>100))){status(payment,'[data-pos-payment-status]','Enable at least one payment method and enter valid discounts.',true);return;}
    if([value.cardFeePercent,value.walletPercent].some(n=>!Number.isFinite(n)||n<0||n>100)){status(payment,'[data-pos-payment-status]','Fee and wallet discount must be between 0 and 100%.',true);return;}
    if(!await demo.approve('settings','Payment methods, fees & tips',{ownerOnly:true,label:'Save payment settings'}))return;
    const data=demo.load();data.payment=value;const ok=demo.save(data);status(payment,'[data-pos-payment-status]',ok?'Payment & tip rules saved. Checkout uses these rules.':'Unable to save payment rules.',!ok);
  });
  stationPanel.addEventListener('submit',async e=>{e.preventDefault();if(!manager())return;const f=e.target;
    const settings={counts:Object.fromEntries(Object.keys(stations.kinds).map(kind=>[kind,Number(f.elements['count-'+kind].value)])),mode:f.elements.mode.value,cleaner:f.elements.cleaner.value,
      cleanMin:Object.fromEntries(Object.keys(stations.kinds).map(kind=>[kind,Number(f.elements['clean-'+kind].value)])),holdMin:Number(f.elements.holdMin.value),checklist:f.elements.checklist.checked,
      allowOverride:f.elements.allowOverride.checked,beep:f.elements.beep.checked,neighbors:f.elements.neighbors.checked};
    if(Object.values(settings.counts).some(n=>!Number.isInteger(n)||n<0||n>40)||Object.values(settings.cleanMin).some(n=>!Number.isInteger(n)||n<1||n>60)||!Number.isInteger(settings.holdMin)||settings.holdMin<1||settings.holdMin>120){status(stationPanel,'[data-pos-stations-status]','Enter valid station counts, cleaning times and hold duration.',true);return;}
    if(settings.mode!=='off'&&!Object.values(settings.counts).some(n=>n>0)){status(stationPanel,'[data-pos-stations-status]','Add stations or choose Off.',true);return;}
    if(!await demo.approve('station-settings','Station setup',{force:true,label:'Save station setup'}))return;
    try{stations.configure(settings);stationDraft=settings;stationsHtml();status(stationPanel,'[data-pos-stations-status]','Station setup saved.');}catch(error){status(stationPanel,'[data-pos-stations-status]',error.message,true);}
  });
  stationPanel.addEventListener('change',e=>{
    if(e.target.matches('[data-pos-log-flag]'))logFlag=e.target.checked;
    if(e.target.matches('[data-pos-log-from]'))logFrom=e.target.value;
    if(e.target.matches('[data-pos-log-to]'))logTo=e.target.value;
    stationPanel.querySelector('[data-pos-log]').innerHTML=logHtml();
  });
  stationPanel.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-pos-export-csv')){
      const field=v=>'"'+String(v??'').replace(/^[=+@-]/,"'").replaceAll('"','""')+'"';
      const rows=[['Station','Ticket','Confirmed by','Time','Checklist','Overdue minutes','Flagged','Reason'],...filteredLog().map(r=>[r.station,r.ticketId,r.by,r.at,r.checklist.map(i=>(i.checked?'Yes: ':'No: ')+i.item).join('; '),r.overdueMin,r.flagged,r.reason])];
      const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(field).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='nexora-sanitation-log.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
    }
    if(b.hasAttribute('data-pos-export-pdf')){const popup=window.open('','_blank');if(popup){popup.document.write('<!doctype html><title>Sanitation log</title><style>body{font:12px Arial}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}small{display:block}</style><h1>Nexora · Sanitation log</h1>'+logHtml());popup.document.close();popup.print();}return;}
    const code=b.dataset.posBlock || b.dataset.posStationEdit;if(!code||!manager())return;
    const station=stations.load().stations.find(s=>s.code===code);
    const result=await Swal.fire({title:b.dataset.posBlock?(station.state==='blocked'?'Unblock ':'Block ')+code:'Edit '+code,
      html:b.dataset.posBlock?'<label class="pos-approval-field">Reason<input id="pos-station-reason" maxlength="120"></label>':`<label class="pos-approval-field">Zone<input id="pos-station-zone" value="${esc(station.zone)}" maxlength="40"></label><label class="pos-approval-field">Capacity<input id="pos-station-capacity" type="number" min="1" max="10" value="${station.capacity}"></label><label class="pos-approval-field">Neighbor<select id="pos-station-neighbor"><option value="">None</option>${stations.load().stations.filter(s=>s.enabled&&s.code!==code&&s.kind===station.kind).map(s=>`<option ${station.neighbor===s.code?'selected':''}>${s.code}</option>`).join('')}</select></label>`,
      showCancelButton:true,customClass:{popup:'pos-swal'},preConfirm:()=>{
        if(b.dataset.posBlock){const reason=document.getElementById('pos-station-reason').value.trim();if(reason.length<5){Swal.showValidationMessage('Enter a reason of at least 5 characters.');return false;}return {reason};}
        const zone=document.getElementById('pos-station-zone').value.trim(),capacity=Number(document.getElementById('pos-station-capacity').value);
        if(!zone||!Number.isInteger(capacity)||capacity<1||capacity>10){Swal.showValidationMessage('Enter a zone and capacity from 1 to 10.');return false;}
        return {zone,capacity,neighbor:document.getElementById('pos-station-neighbor').value};
      }});
    if(!result.isConfirmed||!await demo.approve('station-settings',code,{force:true,label:b.dataset.posBlock?'Block / unblock station':'Edit station'}))return;
    const data=stations.load(),row=data.stations.find(s=>s.code===code);
    if(b.dataset.posBlock){if(!['free','blocked'].includes(row.state))return;row.state=row.state==='blocked'?'free':'blocked';row.blockedNote=row.state==='blocked'?result.value.reason:'';}
    else Object.assign(row,result.value);
    row.since=new Date().toISOString();demo.audit('Station updated',code,demo.account(),result.value.reason || '');stations.save(data);stationsHtml();
  });
  window.addEventListener('nexora:pos-account-changed',()=>{paymentDraft=demo.load().payment;stationDraft=stations.load().settings;accessHtml();paymentHtml();stationsHtml();});
  window.addEventListener('nexora:stations-changed',()=>{if(!stationPanel.hidden&&!stationPanel.querySelector('form :focus'))stationsHtml();});
  const information=document.querySelector('[data-settings-panel="information"]');
  if(information){information.classList.add('pos-settings');information.insertAdjacentHTML('beforeend','<section class="pos-card"><span class="pos-kicker">STATIONS</span><h3>Chairs & cleaning</h3><p>Configure station counts, cleaning responsibility and the sanitation checklist.</p><a class="pos-button" href="pos-salon-settings.html?section=stations">Set up stations</a></section>');}
  accessHtml();paymentHtml();stationsHtml();
})();
