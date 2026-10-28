(function () {
  'use strict';
  const root = document.querySelector('[data-technician-report]'); if (!root) return;
  const data = window.NEXORA_TECHNICIAN_REPORT_DATA;
  const panel = root.querySelector('[data-report-panel]'), dialog = document.querySelector('[data-report-dialog]');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const money = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format((Number(value) || 0) / 100);
  const today = data.iso(new Date()), params = new URLSearchParams(location.search);
  const state = { tab:['store','service','payroll','card'].includes(params.get('tab')) ? params.get('tab') : 'technician', mode:['Daily','Weekly','Monthly'].includes(params.get('mode')) ? params.get('mode') : 'Daily', selected:/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : today, tech:'all', sort:'default', from:today, to:today };
  const incomePanel=root.querySelector('[data-report-income]');
  let rows = [], printRows = [];
  const button = (label, action, attrs='', classes='') => `<button type="button" class="ptr-button ${classes}" data-report-action="${action}" ${attrs}>${label}</button>`;
  const dateControl = (label, value, field='date', type='date', display='') => `<label class="ptr-date"><img src="../assets/icon-oneqr/issue-2040-oneqr-calendar-days-3d.png" alt=""><span>${esc(display || (type==='month' ? data.period('Monthly', value + '-01').label : data.formatDate(value)))}</span><input type="${type}" data-report-field="${field}" aria-label="${label}" value="${esc(value)}" max="${type==='month' ? today.slice(0,7) : today}"></label>`;
  function roster() {
    return window.NEXORA_SALON_DATA.loadCatalog().technicians.filter(tech => tech.active !== false);
  }
  function payments() {
    const technicians = roster(), saved = data.readPayments(localStorage);
    return [...data.demoPayments(technicians), ...saved];
  }
  function selectedRange() { return data.period(state.tab==='payroll' ? 'Weekly' : state.mode, state.selected); }
  function updateUrl(push=false) {
    const query=new URLSearchParams();
    if(state.tab!=='technician')query.set('tab',state.tab);
    if(!['store','service'].includes(state.tab)){
      if(state.mode!=='Daily')query.set('mode',state.mode);
      if(state.selected!==today)query.set('date',state.selected);
    }
    history[push?'pushState':'replaceState'](null,'',location.pathname+(query.size?'?'+query.toString():'')+location.hash);
    window.NEXORA_SHELL?.refreshSidebar?.();
  }
  function kpis(items) { return `<div class="ptr-kpis">${items.map(([label,value,number])=>`<div class="ptr-kpi"><span>${label}</span><strong>${number ? value : money(value)}</strong></div>`).join('')}</div>`; }
  const total = key => rows.reduce((sum,row)=>sum+(row[key] || 0),0);
  const heading = (title, actions='') => `<header class="ptr-report-heading"><h2 id="ptr-panel-title">${title}</h2>${actions?`<div class="ptr-actions">${actions}</div>`:''}</header>`;
  function periodControls() {
    const range = selectedRange(), isMonth = state.mode==='Monthly';
    return `<div class="ptr-toolbar"><div class="ptr-period" role="toolbar" aria-label="Report period controls"><div class="ptr-segments" role="tablist" aria-label="Report period">${['Daily','Weekly','Monthly'].map(mode=>`<button type="button" role="tab" data-report-mode="${mode}" aria-selected="${state.mode===mode}" tabindex="${state.mode===mode?0:-1}">${mode}</button>`).join('')}</div>${button('‹','previous','aria-label="Previous"','ptr-arrow')}${dateControl(isMonth?'Select month':state.mode==='Weekly'?'Select any date in the week':'Select date',isMonth?state.selected.slice(0,7):state.mode==='Weekly'?range.start:state.selected,'date',isMonth?'month':'date',state.mode==='Weekly'?range.label:'')}${button('›','next','aria-label="Next" '+(range.end>=today?'disabled':''),'ptr-arrow')}</div></div><div class="ptr-period-note"><strong>${esc(range.label)}</strong><span>${state.mode==='Daily'?'Pick one date or use the arrows for the previous/next day.':state.mode==='Weekly'?'Pick any date; the report automatically uses its Monday-Sunday week.':'Pick one month or use the arrows for the previous/next month.'}</span></div>`;
  }
  function techCell(row) { return `<div class="ptr-tech"><span class="ptr-avatar">${esc(row.name.split(/\s+/).slice(0,2).map(name=>name[0]).join(''))}</span><div><strong>${esc(row.name)}</strong><small>COMMISSION</small></div></div>`; }
  function tableHead() {
    return `<tr><th>TECH</th><th>TURNS</th><th>HOURS</th><th>SERVICE $</th><th title="The technician's rate as configured today — a past period may have been paid at a different rate.">COMM %</th><th>COMMISSION</th><th>TIP</th><th title="Only the share of a service discount this technician agreed to absorb.">TECH DISCOUNT</th><th title="Supply is deducted from service sales before commission is calculated. It is already reflected in tech takes.">SUPPLY FEE</th><th title="Number of days the technician took a ticket, completed a service, or has an assigned appointment during this period.">${state.mode==='Daily'?'DAY':'DAYS'}</th><th title="Clean fee deducted per day with ticket/service work or an assigned appointment on or after the fee was set. Already reflected in tech takes.">CLEAN FEE</th><th>TECH RECEIVES</th><th title="Minimum weekly pay set for Commission technicians (weekly view only). Tech takes here exclude the top-up — see the Payroll tab for actual pay.">WEEKLY GUARANTEE</th>${state.mode==='Monthly'?'':'<th>ACTION</th>'}</tr>`;
  }
  function technicianRow(row) {
    return `<tr><td>${techCell(row)}</td><td>${row.turns}</td><td>${(row.minutes/60).toFixed(1)} h</td><td><strong>${money(row.service)}</strong></td><td>${Math.round(row.rate*100)}%</td><td>${money(row.commission)}</td><td>${money(row.tip)}</td><td>${money(row.discount)}</td><td>${money(row.supply)}</td><td>${row.days}</td><td>${money(row.clean)}</td><td><strong>${money(row.takes)}</strong></td><td>${state.mode==='Weekly'&&row.guarantee?money(row.guarantee):'—'}</td>${state.mode==='Monthly'?'':`<td>${button('View','view',`data-tech-id="${esc(row.id)}"`,'ptr-view')}</td>`}</tr>`;
  }
  function renderTechnician() {
    rows = data.aggregate(roster(),payments(),selectedRange(),state.mode).sort((a,b)=>b.service-a.service||a.name.localeCompare(b.name));
    panel.innerHTML = heading('Technician report',button('Print all','print-all')+button('Send mail all','mail-all',state.mode==='Monthly'?'disabled':'')+button('Export CSV','export','','primary'))+periodControls()+kpis([['TOTAL SERVICE',total('service')],['TOTAL TIPS',total('tip')],['TOTAL SUPPLY FEES',total('supply')],['TOTAL CLEAN FEES',total('clean')],['TOTAL TECH TAKES',total('takes')],['TOTAL TURNS',total('turns'),true]])+`<div class="ptr-table-wrap"><table class="ptr-table ${state.mode==='Monthly'?'ptr-monthly':''}" aria-label="Technician report"><thead>${tableHead()}</thead><tbody>${rows.map(technicianRow).join('')}</tbody></table></div>`;
  }
  function rating(row) {
    if (!row.guarantee) return '<span>No guarantee to compare</span><a class="ptr-link" href="pos-staff.html">Set up</a>';
    return `<span>${row.topup?'Needs top-up':'Exceeds guarantee'} · ${row.achieved.toFixed(1)}%</span><progress value="${Math.min(100,row.achieved)}" max="100"></progress><small>Break-even: ${row.rate?money(row.guarantee/row.rate):'—'}</small>`;
  }
  function payrollRow(row) {
    return `<tr><td>${techCell(row)}</td><td><button type="button" class="ptr-link" data-report-action="view" data-tech-id="${esc(row.id)}" title="View daily detail">${money(row.service)}</button></td><td>${money(row.commission)}<small style="display:block;margin-top:4px">${Math.round(row.rate*100)} %</small></td><td>${row.guarantee?money(row.guarantee):'—'}</td><td class="ptr-negative">${row.topup?'+ '+money(row.topup):'—'}</td><td>${row.clean?'− '+money(row.clean):'—'}</td><td><strong>${money(row.payable)}</strong></td><td class="${row.remainder<0?'ptr-negative':'ptr-positive'}">${money(row.remainder)}</td><td><div class="ptr-rating">${rating(row)}</div></td><td>${money(row.tip)}</td><td>${row.discount?'− '+money(row.discount):'—'}</td><td>${row.supply?money(row.supply):'—'}</td></tr>`;
  }
  function renderPayroll() {
    rows=data.aggregate(roster(),payments(),selectedRange(),'Weekly').filter(row=>state.tech==='all'||row.id===state.tech);
    if(state.sort==='topup')rows.sort((a,b)=>b.topup-a.topup); if(state.sort==='achieved')rows.sort((a,b)=>b.achieved-a.achieved);
    panel.innerHTML=heading('Payroll',button('Export CSV','export','','primary'))+`<div class="ptr-toolbar"><div class="ptr-period">${button('‹','previous','aria-label="Previous week"','ptr-arrow')}<span class="ptr-week">${esc(selectedRange().label)}</span>${button('›','next','aria-label="Next week" '+(selectedRange().end>=today?'disabled':''),'ptr-arrow')}</div><div class="ptr-payroll-tools"><select class="ptr-select" data-report-field="technician" aria-label="Filter by technician"><option value="all">All technicians</option>${roster().map(tech=>`<option value="${esc(tech.id)}" ${state.tech===tech.id?'selected':''}>${esc(tech.name)}</option>`).join('')}</select> <select class="ptr-select" data-report-field="sort" aria-label="Sort">${[['default','Default order'],['topup','Top-up (highest first)'],['achieved','% achieved (highest first)']].map(([id,label])=>`<option value="${id}" ${state.sort===id?'selected':''}>${label}</option>`).join('')}</select></div></div><p class="ptr-payroll-note">Weekly pay (Monday–Sunday). Payable matches Weekly Payroll; tips are paid separately and never count toward the guarantee. Salon remainder is before costs.</p>`+kpis([['TOTAL SERVICE',total('service')],['TOTAL PAYABLE',total('payable')],['TOTAL TOP-UP',total('topup')],['SALON REMAINDER (BEFORE COSTS)',total('remainder')]])+`<div class="ptr-table-wrap"><table class="ptr-table" aria-label="Payroll"><thead><tr><th>TECHNICIAN</th><th>SERVICE REVENUE</th><th>COMMISSION</th><th>GUARANTEE / WEEK</th><th title="Salon pays this so the technician reaches the weekly guarantee.">TOP-UP</th><th title="Deducted after the top-up.">CLEAN FEE</th><th title="What the technician is paid for the week, tips excluded.">PAYABLE</th><th title="Service revenue collected (after all discounts) minus payable — before rent, supplies and other costs.">SALON REMAINDER</th><th>RATING</th><th>TIPS</th><th title="All discounts on this technician’s services, whoever bore them.">DISCOUNTS</th><th>SUPPLY FEE</th></tr></thead><tbody>${rows.map(payrollRow).join('')}<tr><td><strong>Total</strong></td>${['service','commission','guarantee','topup','clean','payable','remainder'].map(key=>`<td><strong>${money(total(key))}</strong></td>`).join('')}<td></td><td>${money(total('tip'))}</td><td>${money(total('discount'))}</td><td>${money(total('supply'))}</td></tr></tbody></table></div>`;
  }
  function renderCard() {
    panel.innerHTML=heading('Card')+`<div class="ptr-card-range"><div class="ptr-field"><span>From</span>${dateControl('From',state.from,'from')}</div><div class="ptr-field"><span>To</span>${dateControl('To',state.to,'to')}</div></div><div class="ptr-empty">No card payments in this period.</div>`;
  }
  function render(push=false) {
    root.querySelectorAll('[data-report-tab]').forEach(link=>{link.classList.toggle('is-active',link.dataset.reportTab===state.tab);if(link.dataset.reportTab===state.tab)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    const income=['store','service'].includes(state.tab);panel.hidden=income;
    if(income){
      incomePanel.setAttribute('aria-label',state.tab==='store'?'Store income report':'Service income report');
      window.NEXORA_POS_INCOME_REPORTS.show(incomePanel,state.tab);
    }else{
      window.NEXORA_POS_INCOME_REPORTS.hide(incomePanel);
      panel.removeAttribute('aria-label');panel.setAttribute('aria-labelledby','ptr-panel-title');
      if(state.tab==='technician')renderTechnician();else if(state.tab==='payroll')renderPayroll();else renderCard();
    }
    updateUrl(push);
    if(document.activeElement?.closest('[hidden]'))root.querySelector('.pos-report-tabs [aria-current="page"]')?.focus({preventScroll:true});
    const nav=root.querySelector('.pos-report-tabs'),active=nav.querySelector('[aria-current="page"]');
    if(active){const box=nav.getBoundingClientRect(),tab=active.getBoundingClientRect();if(tab.left<box.left)nav.scrollLeft-=box.left-tab.left;else if(tab.right>box.right)nav.scrollLeft+=tab.right-box.right;}
  }
  function sheet(row) {
    const mode=state.tab==='payroll'?'Weekly':state.mode,range=selectedRange();
    let entries=row.tickets.map(ticket=>({label:ticket.id,amount:ticket.amount,tip:ticket.tip}));
    if(mode!=='Daily'){
      entries=[];const day=data.parseDate(range.start);
      while(data.iso(day)<=range.end){const date=data.iso(day),tickets=row.tickets.filter(ticket=>ticket.date===date);entries.push({label:data.formatDate(date),amount:tickets.reduce((sum,ticket)=>sum+ticket.amount,0),tip:tickets.reduce((sum,ticket)=>sum+ticket.tip,0)});day.setDate(day.getDate()+1);}
    }
    return `<article class="ptr-print-sheet"><h3>${esc(row.name.toUpperCase())}</h3><p>${mode==='Daily'?'Daily details<br>':mode==='Weekly'?'Weekly summary<br>':''}${esc(range.label)}</p><table class="ptr-detail-table"><thead><tr><th>${mode==='Daily'?'TICKET':'DAY'}</th><th>AMOUNT</th><th>TIPS</th></tr></thead><tbody>${entries.map(entry=>`<tr><td>${esc(entry.label)}</td><td>${money(entry.amount)}</td><td>${money(entry.tip)}</td></tr>`).join('')||'<tr><td colspan="3">No completed tickets for this date.</td></tr>'}</tbody></table><div class="ptr-print-totals">${[['Total amount',row.service],['Total tips',row.tip],['Total tech discount',row.discount],['Total clean fee',row.clean],['Total commission',row.commission],...(mode==='Weekly'?[['Card collected',row.card],['Cash collected',row.cash]]:[])].map(([label,value])=>`<div><span>${label}</span><strong>${money(value)}</strong></div>`).join('')}</div></article>`;
  }
  function preview(selected,mail=false) { printRows=selected; dialog.querySelector('[data-report-preview]').innerHTML=selected.map(sheet).join('');dialog.querySelector('#ptr-detail-title').textContent=mail?(selected.length>1?'Send mail all':'Send mail'):'Technician report';dialog.showModal(); }
  function download(content,name,type) { const url=URL.createObjectURL(new Blob([content],{type})),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function exportCsv() {
    const columns=state.tab==='payroll'?[['TECHNICIAN','name'],['SERVICE REVENUE','service'],['COMMISSION','commission'],['GUARANTEE / WEEK','guarantee'],['TOP-UP','topup'],['CLEAN FEE','clean'],['PAYABLE','payable'],['SALON REMAINDER','remainder'],['TIPS','tip'],['DISCOUNTS','discount'],['SUPPLY FEE','supply']]:[['TECH','name'],['TURNS','turns'],['HOURS','minutes'],['SERVICE $','service'],['COMM %','rate'],['COMMISSION','commission'],['TIP','tip'],['TECH DISCOUNT','discount'],['SUPPLY FEE','supply'],['DAYS','days'],['CLEAN FEE','clean'],['TECH RECEIVES','takes'],['WEEKLY GUARANTEE','guarantee']];
    const plain=new Set(['name','turns','days']),csv=value=>'"'+String(value).replaceAll('"','""')+'"';
    const content=[columns.map(([label])=>csv(label)).join(','),...rows.map(row=>columns.map(([,key])=>csv(plain.has(key)?(key==='name'&&/^[\s]*[=+\-@]/.test(row[key])?"'"+row[key]:row[key]):key==='rate'?(row[key]*100).toFixed(0)+'%':key==='minutes'?(row[key]/60).toFixed(1):(row[key]/100).toFixed(2))).join(','))].join('\r\n');
    download('\uFEFF'+content,'pos-'+state.tab+'-'+selectedRange().start+'.csv','text/csv;charset=utf-8');
  }
  root.addEventListener('click',event=>{
    const tab=event.target.closest('[data-report-tab]');if(tab){
      if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();if(state.tab!==tab.dataset.reportTab){state.tab=tab.dataset.reportTab;if(dialog.open)dialog.close();render(true);}return;
    }
    const mode=event.target.closest('[data-report-mode]');if(mode){state.mode=mode.dataset.reportMode;render();root.querySelector('[data-report-mode="'+state.mode+'"]')?.focus({preventScroll:true});return;}
    const target=event.target.closest('[data-report-action]');if(!target)return;const action=target.dataset.reportAction;
    if(action==='previous'||action==='next'){const day=data.parseDate(state.selected),direction=action==='previous'?-1:1,mode=state.tab==='payroll'?'Weekly':state.mode;if(mode==='Monthly'){day.setDate(1);day.setMonth(day.getMonth()+direction);}else day.setDate(day.getDate()+direction*(mode==='Weekly'?7:1));state.selected=data.iso(day);render();}
    if(action==='view'){const row=rows.find(row=>row.id===target.dataset.techId);if(row)preview([row]);}
    if(action==='print-all'||action==='mail-all')preview(rows,action==='mail-all');
    if(action==='export')exportCsv();
  });
  root.addEventListener('keydown',event=>{
    if(!event.target.matches('[data-report-mode]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const modes=Array.from(root.querySelectorAll('[data-report-mode]')),index=modes.indexOf(event.target);
    modes[event.key==='Home'?0:event.key==='End'?modes.length-1:(index+(event.key==='ArrowRight'?1:-1)+modes.length)%modes.length].click();
  });
  root.addEventListener('change',event=>{const field=event.target.dataset.reportField,value=event.target.value;if(!field)return;if(field==='date'){if(!value)return;state.selected=value.length===7?value+'-01':value;}if(field==='technician')state.tech=value;if(field==='sort')state.sort=value;if(field==='from'){if(!value)return;state.from=value;if(state.to<value)state.to=value;}if(field==='to'){if(!value)return;state.to=value;if(state.from>value)state.from=value;}render();});
  dialog.querySelector('[data-close-report]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.querySelector('[data-report-print]').addEventListener('click',()=>{document.body.classList.add('ptr-printing');try{window.print();}finally{document.body.classList.remove('ptr-printing');}});
  dialog.querySelector('[data-report-mail]').addEventListener('click',()=>{const body=printRows.map(row=>row.name+'\r\n'+selectedRange().label+'\r\nTotal amount '+money(row.service)+'\r\nTotal tips '+money(row.tip)+'\r\nTotal commission '+money(row.commission)).join('\r\n\r\n');download('X-Unsent: 1\r\nSubject: Technician report\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n'+body,'technician-report.eml','message/rfc822');});
  window.addEventListener('popstate',()=>{
    const query=new URLSearchParams(location.search);
    state.tab=['store','service','payroll','card'].includes(query.get('tab'))?query.get('tab'):'technician';
    state.mode=['Daily','Weekly','Monthly'].includes(query.get('mode'))?query.get('mode'):'Daily';
    state.selected=/^\d{4}-\d{2}-\d{2}$/.test(query.get('date')||'')?query.get('date'):today;
    if(dialog.open)dialog.close();render();
  });
  window.addEventListener('storage',event=>{if(!event.key||data.keys.includes(event.key)||event.key===window.NEXORA_SALON_DATA.STORAGE_KEY)render();});
  render();
})();
