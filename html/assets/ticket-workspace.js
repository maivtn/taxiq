(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = cents => '$' + (cents / 100).toFixed(2);
  const cents = value => Math.round(Number(value) * 100);
  const validMoney = value => value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) >= 0;
  const discount = (base, rule) => Math.min(base, Math.round(rule?.type === 'fixed' ? Number(rule.value) * 100 : base * Number(rule?.value || 0) / 100));
  const iconPaths = {
    printer:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6zM18 12h.01"/>',
    play:'<path d="m8 5 11 7-11 7V5Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    back:'<path d="m12 19-7-7 7-7M5 12h14"/>',
    forward:'<path d="m12 5 7 7-7 7M5 12h14"/>',
    cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
    card:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20M6 15h3"/>',
    gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H7a3 3 0 1 1 3-3l2 3Zm0 0h5a3 3 0 1 0-3-3l-2 3Z"/>',
    split:'<path d="M12 21v-7M12 14 5 7V3M12 14l7-7V3M2 6l3-3 3 3M16 6l3-3 3 3"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    message:'<path d="M21 15a3 3 0 0 1-3 3H7l-5 4V5a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z"/><path d="M7 7h10M7 12h7"/>',
    receipt:'<path d="M4 3 6 5l2-2 2 2 2-2 2 2 2-2 2 2 2-2v18l-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2Z"/><path d="m9 9 6 6m0-6-6 6"/>',
    eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    user:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 11-5M16 16l5-5M17 11h4v4"/>',
    tablet:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01M8 10h8m-3-3 3 3-3 3"/>',
    percent:'<path d="m19 5-14 14"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>'
  };
  const iconForLabel = {'Print Ticket':'printer','Print receipt':'printer',Print:'printer','Print preview':'eye',
    'Start Service':'play',Start:'play',Complete:'check',Back:'back','Checkout Ticket':'forward',
    Cash:'cash',Card:'card','Gift Card':'gift','Split Pay':'split','Split bill':'split',More:'more','Send SMS':'message',
    'No Receipt':'receipt','Edit customer':'user','Hand to customer':'tablet','Discount all':'percent','Add service':'plus',
    Discount:'percent','Custom':'plus',Close:'close','Change tech':'user','Change service':'refresh',Remove:'trash',Pay:'card'};
  const icon = name => `<svg class="tw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[name]}</svg>`;
  function totals(ticket) {
    if(ticket.amountTotals)return {...ticket.amountTotals};
    if (!ticket.lines.length) return {error:'Add at least one service.'};
    if (ticket.lines.some(l => !validMoney(l.price))) return {error:'Enter a valid price for every service.'};
    const subtotal = ticket.lines.reduce((sum,l) => sum + cents(l.price),0);
    const lineDiscount = ticket.lines.reduce((sum,l) => sum + discount(cents(l.price),l.discount),0);
    const orderDiscount = discount(subtotal - lineDiscount,ticket.discount);
    const net = subtotal - lineDiscount - orderDiscount;
    const p = ticket.checkout;
    if (!validMoney(p.tip)) return {error:'Enter a valid tip.'};
    const tip = p.tipType === 'percent' ? Math.round(net * Number(p.tip) / 100) : cents(p.tip);
    return {subtotalCents:subtotal,discountCents:lineDiscount+orderDiscount,netCents:net,tipCents:tip,totalCents:net+tip};
  }
  function mount(root, options) {
    let ticket, parent, activeBillId, mode='edit', category='All', search='', dialogAction='', dialogLine='', setupAssignments={}, serviceFilter='all', lastAssignment=null;
    const $ = selector => root.querySelector(selector);
    const button = (label,attr,style='') => `<button type="button" class="tw-button ${style}" ${attr}>${iconForLabel[label]?icon(iconForLabel[label]):''}<span>${label}</span></button>`;
    const input = (label,name,value='',type='text') => `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${type==='number'?'min="0" step="0.01"':''} required></label>`;
    const services = () => options.catalog().filter(s=>s.active!==false);
    const categoryOf = s => s.categoryName || s.requiredSkill || 'Other';
    const clockedIn = name => {const tech=options.technicians().find(t=>t.name===name);return !!tech && tech.status!=='clocked-out';};
    const group = () => parent.splitBills;
    const amountSplit = () => group()?.mode==='amount';
    const activeBill = () => group()?.bills.find(b => b.id === activeBillId);
    function billTicket(bill) {
      if(amountSplit())return {...parent,customer:bill.name,checkout:bill.checkout,payment:bill.payment,amountTotals:bill.amountTotals};
      const lines = parent.lines.filter(l => group().assignments[l.id] === bill.id);
      return {...parent, customer:bill.name, lines, checkout:bill.checkout, payment:bill.payment,
        discount:{type:'fixed',value:lines.reduce((sum,l)=>sum + group().discounts[l.id],0)/100}};
    }
    function selectBill(id) {
      activeBillId=id;
      ticket=group()?billTicket(activeBill()):parent;
    }
    function newBill(name) {
      return {id:crypto.randomUUID(),name,checkout:{tip:0,tipType:'fixed',method:'cash',cash:'',receipt:'none'}};
    }
    function save() {
      if(group()) {
        activeBill().checkout=ticket.checkout;
        if(ticket.payment) activeBill().payment=ticket.payment;
        if(group().bills.every(b=>b.payment)) {
          const payments=group().bills.map(b=>b.payment);
          parent.payment={method:'split-bills',receipt:'none',paidAt:new Date().toISOString(),simulated:true};
          for(const key of ['subtotalCents','discountCents','netCents','tipCents','totalCents','cashCents','cardCents','changeCents']) parent.payment[key]=payments.reduce((sum,p)=>sum+p[key],0);
          parent.status='completed';
        }
      }
      parent.services=parent.lines.map(l=>l.name);
      parent.tech=[...new Set(parent.lines.map(l=>l.tech).filter(Boolean))].join(', ');
      if (!parent.payment) parent.status=parent.lines.some(l=>['in-service','completed'].includes(l.status))?'in-service':'waiting';
      options.onChange(parent);
    }
    function startSplit(data) {
      const error=text=>{$('[data-tw-error]').textContent=text;};
      if(group()&&(!amountSplit()||group().bills.some(b=>b.payment))){error('Service assignments are locked after payment.');return;}
      const splitMode=data.get('splitMode')||'services',byAmount=splitMode==='amount';
      const count=Number(data.get(data.get('billCount')==='custom'?'customBillCount':'billCount'));
      if(!['amount','services'].includes(splitMode)){error('Choose a split method.');return;}
      if(!Number.isInteger(count)||count<2||count>(byAmount?20:parent.lines.length)){error('Enter a whole number of bills between 2 and '+(byAmount?20:parent.lines.length)+'.');return;}
      if(parent.lines.some(l=>!validMoney(l.price))){error('Set missing service prices in Ticket Detail before creating bills.');return;}
      const t=totals(parent);
      if(t.error){error(t.error);return;}
      const bills=Array.from({length:count},(_,i)=>{
        const bill=newBill(String(data.get('guest'+i)||'').trim().slice(0,80)||'Guest '+(i+1)),existing=group()?.bills[i];
        if(existing){bill.id=existing.id;bill.checkout={...existing.checkout};}
        return bill;
      });
      const first=bills[0];
      if(byAmount){
        const policy=data.get('amountAllocation');
        if(!['equal','custom'].includes(policy)){error('Choose equal or custom amounts.');return;}
        const amounts=bills.map((b,i)=>policy==='equal'?Math.floor(t.totalCents/count)+(i<t.totalCents%count?1:0):validMoney(data.get('amount'+i))?cents(data.get('amount'+i)):NaN);
        if(amounts.some(n=>!Number.isSafeInteger(n)||n<0)||amounts.reduce((sum,n)=>sum+n,0)!==t.totalCents){error('Enter valid amounts totaling '+money(t.totalCents)+'.');return;}
        setAmountTotals(bills,amounts,t);
        parent.splitBills={mode:'amount',allocation:policy,bills};
        selectBill(first.id);save();render();return;
      }
      first.checkout=group()?{...first.checkout,tip:parent.checkout.tip,tipType:parent.checkout.tipType}:{...parent.checkout};
      parent.splitBills={mode:'services',bills,assignments:{},discounts:serviceDiscounts()};
      parent.lines.forEach(l=>{group().assignments[l.id]=bills[setupAssignments[l.id]]?.id || null;});
      selectBill(first.id);save();render();
    }
    function setAmountTotals(bills,amounts,t) {
      let cumulative=0,previousTip=0,previousDiscount=0;
      bills.forEach((b,i)=>{
        cumulative+=amounts[i];
        const weight=t.totalCents?cumulative/t.totalCents:(i+1)/bills.length;
        const tip=Math.round(t.tipCents*weight),reduction=Math.round(t.discountCents*weight);
        const tipCents=tip-previousTip,discountCents=reduction-previousDiscount,netCents=amounts[i]-tipCents;
        b.amountTotals={subtotalCents:netCents+discountCents,discountCents,netCents,tipCents,totalCents:amounts[i]};
        previousTip=tip;previousDiscount=reduction;
      });
    }
    function refreshSplitDiscount() {
      if(amountSplit()){
        const t=totals(parent),bills=group().bills,oldTotal=bills.reduce((sum,b)=>sum+b.amountTotals.totalCents,0);
        let running=0,allocated=0;
        const amounts=bills.map((b,i)=>{
          if(group().allocation==='equal'||!oldTotal)return Math.floor(t.totalCents/bills.length)+(i<t.totalCents%bills.length?1:0);
          running+=b.amountTotals.totalCents;const next=Math.round(t.totalCents*running/oldTotal),amount=next-allocated;allocated=next;return amount;
        });
        setAmountTotals(bills,amounts,t);
      }else group().discounts=serviceDiscounts();
      selectBill(activeBillId);
    }
    function serviceDiscounts() {
      const bases=parent.lines.map(l=>cents(l.price)-discount(cents(l.price),l.discount));
      const base=bases.reduce((sum,n)=>sum+n,0),amount=discount(base,parent.discount),result={};
      let running=0,allocated=0;
      parent.lines.forEach((l,i)=>{
        running+=bases[i];const next=base?Math.round(amount*running/base):0;
        result[l.id]=next-allocated;allocated=next;
      });
      return result;
    }
    function maxSplitCount() {return $('[name="splitMode"]:checked').value==='amount'?20:parent.lines.length;}
    function splitCount() {
      const selected=$('[name="billCount"]:checked')?.value;
      const count=Number(selected==='custom'?$('[name="customBillCount"]').value:selected);
      return Number.isInteger(count)&&count>=2&&count<=maxSplitCount()?count:0;
    }
    function updateSplitCount() {
      const custom=$('[name="billCount"]:checked')?.value==='custom',field=$('[name="customBillCount"]');
      $('[data-tw-custom-count]').hidden=!custom;field.disabled=!custom;field.required=custom;field.max=maxSplitCount();
      const count=splitCount();
      $('[data-tw-save]').disabled=!count;
      $('[data-tw-split-guests]').hidden=!count;
      $('[data-tw-error]').textContent='';
      if(count)splitGuestFields(count);else renderSetupServices();
    }
    function renderSplitSummary() {
      const host=$('[data-tw-split-summary]');if(!host)return;
      const footer=$('[data-tw-setup-status]'),setStatus=(text,ready=false)=>{footer.textContent=text;footer.dataset.ready=String(ready);};
      const t=totals(parent);
      if(t.error){setStatus(t.error);host.innerHTML='<h3>SUMMARY</h3><p>'+esc(t.error)+'</p>';return;}
      const count=splitCount(),byAmount=$('[name="splitMode"]:checked').value==='amount',reductions=serviceDiscounts();
      if(!count){setStatus('Choose a valid number of bills.');host.innerHTML='<h3>SUMMARY</h3><p>'+(maxSplitCount()<2?'Add at least two services, or choose By amount.':'Enter a whole number of bills between 2 and '+maxSplitCount()+'.')+'</p>';return;}
      let assigned=0,tipCents=byAmount?t.tipCents:0;
      const rows=Array.from({length:count},(_,i)=>{
        const guest=$('[name="guest'+i+'"]').value.trim()||'Guest '+(i+1);
        const lines=parent.lines.filter(l=>setupAssignments[l.id]===i);
        const amountValue=byAmount?$('[name="amount'+i+'"]').value:null;
        const net=lines.reduce((sum,l)=>sum+cents(l.price)-discount(cents(l.price),l.discount)-reductions[l.id],0);
        if(!byAmount&&i===0)tipCents=parent.checkout.tipType==='percent'?Math.round(net*Number(parent.checkout.tip)/100):t.tipCents;
        const total=byAmount?(validMoney(amountValue)?cents(amountValue):null):net+(i===0?tipCents:0);
        assigned+=total || 0;
        return `<div class="tw-summary-row"><span>Bill ${i+1} · ${esc(guest)}${byAmount?'':`<small>${lines.length} ${lines.length===1?'service':'services'}</small>`}</span><strong data-tw-setup-bill-total="${i}">${total==null?'—':money(total)}</strong></div>`;
      }).join('');
      const totalCents=t.netCents+tipCents,assignedCount=parent.lines.filter(l=>Number.isInteger(setupAssignments[l.id])&&setupAssignments[l.id]<count).length;
      const validAmounts=!byAmount||[...root.querySelectorAll('[data-tw-share]')].every(el=>validMoney(el.value));
      setStatus(!validAmounts?'Enter an amount for each bill.':byAmount?(assigned===totalCents?'Ready · '+money(totalCents)+' assigned':money(totalCents-assigned)+' remaining to assign'):assignedCount+'/'+parent.lines.length+' services assigned',validAmounts&&(byAmount?assigned===totalCents:assignedCount===parent.lines.length));
      host.innerHTML=`<h3>SUMMARY</h3>${rows}<div class="tw-summary-row tw-rule"><span>Subtotal</span><span>${money(t.subtotalCents)}</span></div><div class="tw-summary-row"><span>Discount</span><span>−${money(t.discountCents)}</span></div><div class="tw-summary-row"><span>Tip</span><span>${money(tipCents)}</span></div><div class="tw-summary-row tw-rule"><strong>Ticket total</strong><strong data-tw-setup-total>${money(totalCents)}</strong></div><div class="tw-summary-row"><span>Assigned</span><strong>${money(assigned)}</strong></div><div class="tw-summary-row ${assigned!==totalCents?'tw-red':''}"><span>Remaining to assign</span><strong data-tw-setup-remaining>${money(totalCents-assigned)}</strong></div>${!byAmount&&tipCents?'<p class="tw-muted">The current tip is on Bill 1. You can adjust each guest’s tip after creating bills.</p>':''}`;
    }
    function updateAmountPreview() {
      const t=totals(parent),count=splitCount(),equal=$('[name="amountAllocation"]:checked').value==='equal';
      root.querySelectorAll('[data-tw-share]').forEach((el,i)=>{
        el.readOnly=equal;
        if(equal)el.value=t.error?'':((Math.floor(t.totalCents/count)+(i<t.totalCents%count?1:0))/100).toFixed(2);
      });
      renderSplitSummary();
    }
    function renderSetupServices() {
      const host=$('[data-tw-service-setup]');
      const byAmount=$('[name="splitMode"]:checked').value==='amount';
      host.hidden=byAmount||!splitCount();if(host.hidden){renderSplitSummary();return;}
      const previousTable=host.querySelector('.tw-service-table'),scroll={top:previousTable?.scrollTop||0,left:previousTable?.scrollLeft||0};
      const count=splitCount();
      const guests=Array.from({length:count},(_,i)=>$('[name="guest'+i+'"]').value.trim()||'Guest '+(i+1));
      parent.lines.forEach(l=>{if(setupAssignments[l.id]>=count)setupAssignments[l.id]=0;});
      host.innerHTML=`<h3>TICKET DETAIL</h3><p class="tw-muted">Check each service under the guest who will pay for it. Each service belongs to one guest.</p><div class="tw-service-table"><table><thead><tr><th scope="col">Service</th>${guests.map((name,i)=>`<th scope="col">Bill ${i+1}<br>${esc(name)}</th>`).join('')}</tr></thead><tbody>${parent.lines.map(l=>`<tr><th scope="row">${esc(l.name)}<small>${esc(l.tech || 'Unassigned')} · ${validMoney(l.price)?money(cents(l.price)):'Price required'}</small></th>${guests.map((name,i)=>`<td><label class="tw-service-toggle"><input type="checkbox" data-tw-setup-line="${esc(l.id)}" data-guest="${i}" aria-label="Assign ${esc(l.name)} to ${esc(name)}" ${setupAssignments[l.id]===i?'checked':''}></label></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      const table=host.querySelector('.tw-service-table');table.scrollTop=scroll.top;table.scrollLeft=scroll.left;
      renderSplitSummary();
    }
    function splitGuestFields(count) {
      const host=$('[data-tw-split-guests]');
      const previous=new Map([...host.querySelectorAll('input')].map(el=>[el.name,el.value]));
      const byAmount=$('[name="splitMode"]:checked').value==='amount';
      host.innerHTML=Array.from({length:count},(_,i)=>`<div class="tw-split-person"><label>Bill ${i+1} · Guest name (optional)<input name="guest${i}" maxlength="80" value="${esc(previous.get('guest'+i)??group()?.bills[i]?.name??(i===0?parent.customer:'Guest '+(i+1)))}"></label>${byAmount?`<label>Amount ($)<input name="amount${i}" data-tw-share type="number" min="0" step="0.01" required value="${esc(previous.get('amount'+i)??(group()?.bills[i]?.amountTotals?(group().bills[i].amountTotals.totalCents/100).toFixed(2):''))}"></label>`:''}</div>`).join('');
      updateAmountPreview();renderSetupServices();
    }
    function configureSplitSetup(initialCount) {
      const byAmount=$('[name="splitMode"]:checked').value==='amount',choices=$('[data-tw-bill-count]');
      const maximum=maxSplitCount();
      const selected=initialCount?(initialCount>5||initialCount>maximum?'custom':String(initialCount)):($('[name="billCount"]:checked')?.value || '2');
      const current=selected==='custom'?'custom':String(Math.max(2,Math.min(Number(selected),maximum)));
      if(initialCount&&selected==='custom')$('[name="customBillCount"]').value=initialCount;
      choices.innerHTML=[2,3,4,5,'custom'].map(n=>`<label class="tw-radio-choice"><input type="radio" name="billCount" value="${n}" ${String(n)===current?'checked':''} ${(n==='custom'?maximum<2:n>maximum)?'disabled':''}><span>${n==='custom'?'Custom':n+' bills'}</span></label>`).join('');
      $('[data-tw-allocation]').hidden=!byAmount;
      $('[data-tw-save]').hidden=maximum<2;
      $('[data-tw-split-guidance]').textContent=byAmount?'Split the ticket total equally or enter each person’s amount. Services stay on the shared ticket.':maximum<2?'Add at least two services to split by service, or choose By amount.':'Check services for each guest in Ticket Detail below, then create bills.';
      updateSplitCount();
    }
    const guestColor = bill => Math.max(0,group()?.bills.indexOf(bill) || 0)%5;
    const guestNumber = bill => group().bills.indexOf(bill)+1;
    function canUndoAssignment() {
      if(!lastAssignment||!group()||amountSplit())return false;
      const {lineId,from,to}=lastAssignment;
      return parent.lines.some(l=>l.id===lineId)&&group().assignments[lineId]===to&&[from,to].every(id=>!id||group().bills.some(b=>b.id===id&&!b.payment));
    }
    function focusService(lineId) {
      const field=[...root.querySelectorAll('[data-tw-bill-line]')].find(el=>el.dataset.twBillLine===lineId&&!el.closest('[hidden]'));
      (field || $('[data-tw-service-filter][aria-pressed="true"]'))?.focus({preventScroll:true});
    }
    function serviceToolbarHtml() {
      const unassigned=parent.lines.filter(l=>!group().bills.some(b=>b.id===group().assignments[l.id])).length;
      const current=parent.lines.filter(l=>group().assignments[l.id]===activeBillId).length;
      return `<div class="tw-service-context" data-tw-guest-color="${guestColor(activeBill())}"><span class="tw-guest-avatar" aria-hidden="true">${guestNumber(activeBill())}</span><div><strong>Choose services for ${esc(ticket.customer)}</strong><p>Check to move a service to this bill. Paid services are locked.</p></div></div><div class="tw-service-filters" role="group" aria-label="Filter services">${[['all','All services',parent.lines.length],['current','This bill',current],['unassigned','Unassigned',unassigned]].map(([id,label,count])=>button(`${label} <b>${count}</b>`,`data-tw-service-filter="${id}" aria-pressed="${serviceFilter===id}"`,serviceFilter===id?'selected':'')).join('')}</div>${canUndoAssignment()?`<div class="tw-assignment-feedback"><span data-tw-assignment-feedback role="status">${esc(lastAssignment.name)} ${lastAssignment.to?'moved to '+esc(group().bills.find(b=>b.id===lastAssignment.to).name):'is now unassigned'}.</span>${button('Undo','data-tw-undo-assignment','tw-text')}</div>`:''}`;
    }
    function paymentHint(t) {
      if(group()&&!amountSplit()){
        const unassigned=parent.lines.filter(l=>!group().bills.some(b=>b.id===group().assignments[l.id])).length;
        if(unassigned)return `Assign ${unassigned} service${unassigned===1?'':'s'} to a guest before payment.`;
        if(group().bills.some(b=>!parent.lines.some(l=>group().assignments[l.id]===b.id)))return 'Assign services to every empty bill before payment.';
      }
      if(t.error)return t.error;
      const incomplete=ticket.lines.filter(l=>l.status!=='completed').length,p=ticket.checkout;
      if(incomplete)return `Complete ${incomplete} service${incomplete===1?'':'s'} before payment.`;
      if(p.method==='cash'&&(!validMoney(p.cash)||cents(p.cash)<t.totalCents))return `Enter at least ${money(t.totalCents)} in cash received.`;
      if(p.method==='split'&&(!validMoney(p.splitCash)||cents(p.splitCash)>t.totalCents))return 'Enter the cash portion; the balance goes to card.';
      if(p.method==='gift-card'&&!p.giftCode?.trim())return 'Enter the gift card reference.';
      return 'Ready to collect payment';
    }
    function paybarHtml() {
      if(mode!=='checkout'||ticket.payment)return '';
      return `<section class="tw-paybar" data-tw-paybar aria-label="Collect payment"><div class="tw-paybar-guest"><small>${group()?'Bill '+guestNumber(activeBill())+' · ':''}${esc(ticket.customer)}</small><strong data-tw-total></strong></div><p id="tw-payment-hint" data-tw-payment-hint role="status"></p>${button('Pay','data-tw-pay aria-describedby="tw-payment-hint"','tw-primary tw-pay')}</section>`;
    }
    function billsHtml() {
      if(mode!=='checkout')return '';
      if(!group())return '';
      const paid=group().bills.filter(b=>b.payment).length;
      const sumPaid=group().bills.reduce((sum,b)=>sum+(b.payment?.totalCents || 0),0);
      return `<section class="tw-card tw-bills"><div class="tw-card-title"><div><h3>SPLIT BILL <span class="tw-mode-badge">${amountSplit()?'By amount':'By services'}</span></h3><p class="tw-muted">Choose a guest to review services and collect payment.</p></div><div class="tw-progress"><strong data-tw-bill-progress role="status">${paid}/${group().bills.length} bills paid</strong><progress value="${paid}" max="${group().bills.length}" aria-label="Bills paid"></progress><small>${money(sumPaid)} collected</small></div></div><div class="tw-bill-tabs" role="group" aria-label="Guest bills">${group().bills.map((b,i)=>{
        const t=b.payment || totals(billTicket(b)),lines=amountSplit()?parent.lines:parent.lines.filter(l=>group().assignments[l.id]===b.id),selected=b.id===activeBillId;
        const status=b.payment?'Paid':!lines.length?'Needs services':'Unpaid';
        return button(`<span class="tw-bill-card-top"><span class="tw-guest-avatar" aria-hidden="true">${i+1}</span><strong>Bill ${i+1} · ${esc(b.name)}</strong><span class="tw-bill-state ${b.payment?'is-paid':!lines.length?'needs-services':''}">${b.payment?'✓ ':''}${status}</span></span><span class="tw-bill-card-value"><strong data-tw-bill-total="${esc(b.id)}">${t.error?'—':money(t.totalCents)}</strong><small>${amountSplit()?'Shared ticket':lines.length+' service'+(lines.length===1?'':'s')}</small></span><small class="tw-bill-services">${!amountSplit()?(lines.map(l=>esc(l.name)).join(' · ')||'Choose services below'):'A share of the full ticket total'}</small><span class="tw-bill-selected">${selected?'● Selected bill':'Select bill'}</span>`,`data-tw-bill="${b.id}" data-tw-guest-color="${guestColor(b)}" aria-pressed="${selected}"`,'tw-bill-card '+(selected?'selected':''));
      }).join('')}</div>${!parent.payment?`<div class="tw-bill-tools">${!amountSplit()&&group().bills.length<parent.lines.length?button('+ Add bill','data-tw-add-bill','tw-small'):''}${!amountSplit()&&group().bills.length>2&&!ticket.lines.length&&!ticket.payment?button('Remove empty bill','data-tw-remove-bill','tw-small'):''}${!paid?button('Cancel split','data-tw-cancel-split','tw-text tw-cancel-split'):''}</div>`:''}</section>`;
    }

    function message(text) {$('[data-tw-message]').textContent=text;}
    function renderCatalog() {
      if (!$('[data-tw-catalog]')) return;
      const list=services().filter(s=>(category==='All'||categoryOf(s)===category)&&s.name.toLowerCase().includes(search.toLowerCase()));
      $('[data-tw-categories]').innerHTML=['All',...new Set(services().map(categoryOf))].map(c=>button(esc(c),`data-tw-category="${esc(c)}" aria-pressed="${c===category}"`,c===category?'selected':'')).join('');
      $('[data-tw-catalog]').innerHTML=[...new Set(list.map(categoryOf))].map(c=>`<section class="tw-category"><h4>${esc(c)}</h4><div class="tw-service-grid">${list.filter(s=>categoryOf(s)===c).map(s=>`<button type="button" class="tw-service" data-tw-add="${esc(s.id)}" ${ticket.payment?'disabled':''}><strong>${esc(s.name)}</strong><span>${s.price==null?'Enter price':money(cents(s.price))}<b aria-hidden="true">${icon('plus')}</b></span></button>`).join('')}</div></section>`).join('') || '<p class="tw-muted">No services found.</p>';
    }
    function renderTotals() {
      const t=totals(ticket);
      const display=mode==='checkout'?t.totalCents:t.netCents;
      root.querySelectorAll('[data-tw-total]').forEach(el=>el.textContent=t.error?'—':money(display));
      if ($('[data-tw-subtotal]')) $('[data-tw-subtotal]').textContent=t.error?'—':money(t.subtotalCents);
      if ($('[data-tw-discount-total]')) $('[data-tw-discount-total]').textContent=t.error?'—':'−'+money(t.discountCents);
      if ($('[data-tw-tip-total]')) $('[data-tw-tip-total]').textContent=t.error?'—':money(t.tipCents);
      if ($('[data-tw-change]')) $('[data-tw-change]').textContent=t.error?'—':money(Math.max(0,cents(ticket.checkout.cash || 0)-t.totalCents));
      root.querySelectorAll('[data-tw-bill-total]').forEach(el=>{const bill=group()?.bills.find(b=>b.id===el.dataset.twBillTotal);if(bill){const billTotals=bill.payment||totals(billTicket(bill));el.textContent=billTotals.error?'—':money(billTotals.totalCents);}});
      if ($('[data-tw-pay]')) $('[data-tw-pay] span').textContent='Pay · '+(t.error?'—':money(t.totalCents));
      if($('[data-tw-payment-hint]')){const hint=paymentHint(t);$('[data-tw-payment-hint]').textContent=hint;$('[data-tw-paybar]').dataset.ready=String(hint==='Ready to collect payment');}
      return t;
    }
    function paymentHtml() {
      const p=ticket.checkout;
      if (ticket.payment) return `<section class="tw-card tw-receipt"><h3>PAYMENT RECORDED · DEMO</h3><p>Total <strong>${money(ticket.payment.totalCents)}</strong></p><p>Change due ${money(ticket.payment.changeCents)}</p><p>${esc(ticket.payment.method)} · ${esc(ticket.payment.receipt==='sms'?'SMS receipt simulated':ticket.payment.receipt==='print'?'Print receipt selected':'No receipt')}</p>${ticket.payment.method==='split'?`<p>Cash ${money(ticket.payment.cashCents)} · Card ${money(ticket.payment.cardCents)}</p>`:''}<p class="tw-muted">No money was charged. No SMS was sent.</p>${button('Print receipt','data-tw-print')}</section>`;
      return `${amountSplit()?`<section class="tw-card"><h3>TIP INCLUDED</h3><p>${money(ticket.amountTotals.tipCents)} allocated to this payment. Cancel the unpaid split to change the ticket tip.</p></section>`:`<section class="tw-card"><div class="tw-card-title"><h3>TIP</h3>${button('Hand to customer','data-tw-hand','tw-small tw-purple')}</div><div class="tw-tip-row">${[[0,'No Tip','fixed'],[10,'$10','fixed'],[15,'$15','fixed'],[10,'10%','percent'],[20,'20%','percent']].map(([n,label,type])=>button(label,`data-tw-tip="${n}" data-tip-type="${type}"`,p.tipType===type&&Number(p.tip)===n?'selected':'')).join('')}<label class="tw-custom-tip"><span>$</span><input aria-label="Custom tip" placeholder="Custom" type="number" min="0" step="0.01" data-tw-field="tip" value="${p.tipType==='fixed'&&p.tip?esc(p.tip):''}"></label></div></section>`}
      <section class="tw-card"><h3>PAYMENT METHOD</h3><div class="tw-methods">${[['cash','Cash'],['card','Card'],['gift-card','Gift Card'],['split','Split Pay'],['other','More']].map(([id,label])=>button(label,`data-tw-method="${id}"`,p.method===id?'selected':'')).join('')}</div>
      ${p.method==='cash'?`<div class="tw-cash"><label>Cash received <input aria-label="Cash received" type="number" min="0" step="0.01" data-tw-field="cash" value="${esc(p.cash)}"></label><span>Change due <strong data-tw-change>$0.00</strong></span></div>`:p.method==='split'?`<div class="tw-cash"><label>Cash portion ($)<input aria-label="Split cash amount" type="number" min="0" step="0.01" data-tw-field="splitCash" value="${esc(p.splitCash || '')}"></label><span>Remaining balance: card (demo)</span></div>`:p.method==='gift-card'?`<label class="tw-payment-info">Gift card reference<input aria-label="Gift card reference" data-tw-field="giftCode" value="${esc(p.giftCode || '')}" placeholder="Demo reference"></label>`:p.method==='other'?`<label class="tw-payment-info">Other method<select data-tw-field="otherMethod"><option ${p.otherMethod==='Zelle'?'selected':''}>Zelle</option><option ${p.otherMethod==='Venmo'?'selected':''}>Venmo</option><option ${p.otherMethod==='Other'?'selected':''}>Other</option></select></label>`:'<p class="tw-muted">Card payment is simulated. No card details are collected.</p>'}
      <h3 class="tw-receipt-label">RECEIPT</h3><div class="tw-receipt-options">${[['none','No Receipt'],['sms','Send SMS'],['print','Print']].map(([id,label])=>button(label,`data-tw-receipt="${id}"`,p.receipt===id?'selected':'')).join('')}</div><div class="tw-preview">${button('Print preview','data-tw-preview','tw-text')}</div></section>
      <section class="tw-card tw-payment-summary"><div class="tw-card-title"><h3>PAYMENT SUMMARY</h3><div class="tw-ticket-tools">${button('Discount all','data-tw-discount-all'+(group()?.bills.some(b=>b.payment)?' disabled title="Discount is locked after the first bill is paid"':''),'tw-small tw-orange')}${!group()?button('Split bill','data-tw-split-bill aria-haspopup="dialog"','tw-small tw-purple'):''}</div></div><div class="tw-summary-row tw-rule"><span>Subtotal</span><span data-tw-subtotal></span></div><div class="tw-summary-row"><span>Tip</span><span data-tw-tip-total></span></div><div class="tw-summary-row"><span>Discount</span><span class="tw-red" data-tw-discount-total></span></div><div class="tw-summary-row tw-rule"><strong>TOTAL</strong><strong data-tw-total></strong></div></section><p class="tw-demo">Prototype · Payment and SMS receipt are simulated.</p>`;
    }
    function render() {
      const paid=!!ticket.payment;
      const serviceSplit=!!group()&&!amountSplit(),detailLines=serviceSplit?parent.lines:ticket.lines;
      const catalogHtml=`<section class="tw-card tw-catalog-panel"><h3>SERVICES</h3><input class="tw-search" data-tw-search type="search" placeholder="Search services…" aria-label="Search ticket services" value="${esc(search)}"><div class="tw-categories" data-tw-categories></div><div class="tw-catalog" data-tw-catalog></div></section>`;
      const billHeading=group()?`<div class="tw-card tw-bill-heading" data-tw-guest-color="${guestColor(activeBill())}"><div class="tw-paying-for"><span class="tw-guest-avatar" aria-hidden="true">${guestNumber(activeBill())}</span><div><h3>${paid?'PAYMENT RECORDED':'PAYING FOR'}</h3><strong>${esc(ticket.customer)}</strong></div></div>${!paid?`<details class="tw-edit-guest"><summary>Edit guest name</summary><label>Guest name (optional)<input data-tw-bill-name value="${esc(ticket.customer)}" maxlength="80"></label></details>`:''}</div>`:'';
      const leftColumn=mode==='checkout'
        ? `<div class="tw-checkout-side" aria-label="Checkout actions">${billHeading}${paymentHtml()}<p data-tw-message role="status"></p>${paybarHtml()}</div>`
        : catalogHtml;
      root.innerHTML=`<div class="tw-heading">${button('Back','data-tw-back')}<h2>Ticket #${esc(parent.id)} · ${esc(parent.customer)}</h2>${!paid&&!group()?button('Edit customer','data-tw-customer','tw-text'):''}</div>${billsHtml()}<div class="tw-workspace ${mode==='checkout'?'tw-checkout-layout':''}">${leftColumn}<div class="tw-ticket-side"><section class="tw-card"><div class="tw-card-title"><h3>${amountSplit()?'SHARED TICKET':'TICKET DETAIL'} (${detailLines.length} services)</h3>${amountSplit()&&!group().bills.some(b=>b.payment)?button('Assign services','data-tw-assign-services aria-haspopup="dialog"','tw-small tw-purple'):''}${!paid&&!group()?`<div class="tw-ticket-tools">${mode==='checkout'?button('Add service','data-tw-add-service','tw-small tw-purple'):''}${button('Custom','data-tw-custom','tw-small tw-purple')}</div>`:''}</div>${amountSplit()?`<p class="tw-service-pick-note">This ticket is split by amount. ${group().bills.some(b=>b.payment)?'Each bill pays a share of the ticket total.':'Choose Assign services to select who pays for each service. Bill totals will follow the selected services.'}</p>`:''}<div class="tw-lines">${serviceSplit?serviceToolbarHtml():''}${detailLines.map(l=>{
        const owner=serviceSplit?group().bills.find(b=>b.id===group().assignments[l.id]):null;
        const canManage=!paid&&(!serviceSplit||owner?.id===activeBillId);
        const selection=serviceSplit?`<label class="tw-service-pick"><input type="checkbox" data-tw-bill-line="${esc(l.id)}" aria-label="Assign ${esc(l.name)} to ${esc(ticket.customer)}" ${owner?.id===activeBillId?'checked':''} ${paid||owner?.payment?'disabled':''}><span class="tw-payer-badge" data-tw-guest-color="${owner?guestColor(owner):'none'}">${owner?'Payer: Bill '+guestNumber(owner)+' · '+esc(owner.name)+(owner.payment?' · Paid':''):'Not assigned'}</span><small>${paid||owner?.payment?'Locked':owner?.id===activeBillId?'On this bill':'Check to assign here'}</small></label>`:'';
        const status={'assigned':'ASSIGNED','in-service':'IN PROGRESS',completed:'COMPLETED'}[l.status] || 'UNASSIGNED';
        const hidden=serviceSplit&&((serviceFilter==='current'&&owner?.id!==activeBillId)||(serviceFilter==='unassigned'&&owner));
        return `<article class="tw-line ${serviceSplit?(owner?.id===activeBillId?'tw-line-selected':!owner?'tw-line-unassigned':''):''}" data-tw-service-line="${esc(l.id)}" ${serviceSplit?`data-tw-guest-color="${owner?guestColor(owner):'none'}"`:''} ${hidden?'hidden':''} ${serviceSplit&&owner?.id!==activeBillId?'data-tw-other-bill':''}>${selection}<div class="tw-line-top"><div><strong>${esc(l.name)}</strong> <span class="tw-status ${esc(l.status)}">${status}</span><p>Tech. <b>${esc(l.tech || 'Unassigned')}</b></p></div><strong>${validMoney(l.price)?money(cents(l.price)):'Price required'}</strong></div>${l.discount?.value?`<p class="tw-discount-note">Discount: ${esc(l.discount.value)}${l.discount.type==='fixed'?' USD':'%'}</p>`:''}${!paid&&!group()?`<div class="tw-line-actions">${l.status==='completed'?'<span class="tw-completed">✓ Completed</span>':button(l.status==='in-service'?'Complete':'Start',`data-tw-action="${l.status==='in-service'?'complete':'start'}" data-line="${esc(l.id)}"`,'tw-green')}${button('Change tech',`data-tw-action="tech" data-line="${esc(l.id)}"`,'tw-blue')}${button('Change service',`data-tw-action="service" data-line="${esc(l.id)}"`,'tw-purple')}${button('Discount',`data-tw-action="discount" data-line="${esc(l.id)}"`,'tw-orange')}${button('Remove',`data-tw-action="remove" data-line="${esc(l.id)}"`,'tw-red')}${!validMoney(l.price)?button('Set price',`data-tw-action="price" data-line="${esc(l.id)}"`,'tw-orange'):''}</div>`:canManage&&group()&&l.status!=='completed'?`<div class="tw-line-actions">${button(l.status==='in-service'?'Complete':'Start',`data-tw-action="${l.status==='in-service'?'complete':'start'}" data-line="${esc(l.id)}"`,'tw-green')}${button('Change tech',`data-tw-action="tech" data-line="${esc(l.id)}"`,'tw-blue')}</div>`:''}</article>`;
      }).join('') || '<p class="tw-muted">Choose a service to add it to this ticket.</p>'}</div>${mode==='edit'?'<div class="tw-summary-row tw-rule"><strong>ESTIMATED TOTAL</strong><strong data-tw-total></strong></div>':''}</section><section class="tw-card"><label class="tw-note">NOTE<textarea data-tw-note placeholder="Seat, customer preferences, color/powder used…" ${paid||group()?'disabled':''}>${esc(ticket.note || '')}</textarea></label></section>${mode==='checkout'?'':`<div class="tw-bottom">${button('Print Ticket','data-tw-print')}${button('Start Service','data-tw-start-all','tw-purple')}</div>${button('Checkout Ticket','data-tw-checkout','tw-text')}` }${mode==='checkout'?'':'<p data-tw-message role="status"></p>'}</div></div><dialog class="tw-dialog" aria-labelledby="tw-dialog-title"><form data-tw-form><div class="tw-card-title"><h2 id="tw-dialog-title"></h2>${button('Close','data-tw-close aria-label="Close dialog"','tw-text tw-icon-only')}</div><div data-tw-fields></div><footer class="tw-dialog-actions"><p data-tw-error role="alert"></p><span data-tw-setup-status role="status" hidden></span><div>${button('Cancel','data-tw-close','tw-dialog-cancel')}<button type="submit" class="tw-button tw-primary" data-tw-save>Save</button></div></footer></form></dialog>`;
      if(serviceSplit&&serviceFilter!=='all'&&!root.querySelector('.tw-line:not([hidden])'))$('.tw-lines').insertAdjacentHTML('beforeend',`<p class="tw-filter-empty" data-tw-filter-empty>${serviceFilter==='unassigned'?'No unassigned services.':'No services on this bill yet.'} Choose All services to review the full ticket.</p>`);
      renderCatalog();renderTotals();
    }
    function openDialog(action,lineId) {
      dialogAction=action;dialogLine=lineId;
      const l=ticket.lines.find(l=>l.id===lineId),rule=l?l.discount:parent.discount;
      let title='',fields='';
      if(action==='split-bill'){
        title='Split bill by guest';
        setupAssignments=Object.fromEntries(parent.lines.map(l=>[l.id,amountSplit()?null:0]));
        fields=`<fieldset class="tw-radio-field"><legend>Split method</legend><div class="tw-radio-options tw-method-options"><label class="tw-radio-choice"><input type="radio" name="splitMode" value="services" aria-label="By services" checked><span><strong>By services</strong><small>Choose who pays for each service</small></span></label><label class="tw-radio-choice"><input type="radio" name="splitMode" value="amount" aria-label="By amount"><span><strong>By amount</strong><small>Share the total equally or by amount</small></span></label></div></fieldset><p data-tw-split-guidance></p><fieldset class="tw-radio-field"><legend>Number of bills</legend><div class="tw-bill-count-row"><div class="tw-radio-options" data-tw-bill-count></div><label class="tw-custom-count" data-tw-custom-count hidden><input name="customBillCount" aria-label="Custom number of bills" type="number" min="2" step="1" placeholder="Enter number" disabled></label></div></fieldset><fieldset class="tw-radio-field" data-tw-allocation hidden><legend>Divide amount</legend><div class="tw-radio-options tw-method-options"><label class="tw-radio-choice"><input type="radio" name="amountAllocation" value="equal" checked><span>Split equally</span></label><label class="tw-radio-choice"><input type="radio" name="amountAllocation" value="custom"><span>Enter individual amounts</span></label></div></fieldset><div data-tw-split-guests></div><section data-tw-service-setup></section><section class="tw-split-summary" data-tw-split-summary role="status" aria-live="polite"></section><p class="tw-muted">Choose a payment method for each bill after creating it. Complete services before collecting payment.</p>`;
      }
      if(action==='catalog'){title='Add service';fields=`<input class="tw-search" data-tw-search type="search" placeholder="Search services…" aria-label="Search ticket services" value="${esc(search)}"><div class="tw-categories" data-tw-categories></div><div class="tw-catalog" data-tw-catalog></div>`;}
      if(action==='tech'){title='Change technician';fields='<label>Technician<select name="tech" required><option value="">Choose technician</option>'+options.technicians().map(t=>`<option ${t.name===l.tech?'selected':''} ${t.status==='clocked-out'||(t.status&&t.status!=='available'&&t.name!==l.tech)?'disabled':''}>${esc(t.name)}</option>`).join('')+'</select></label>';}
      if(action==='service'){title='Change service';fields='<label>Service<select name="service" required>'+services().map(s=>`<option value="${esc(s.id)}">${esc(s.name)} · ${s.price==null?'Enter price':money(cents(s.price))}</option>`).join('')+'</select></label>';}
      if(action==='discount'){title=l?'Service discount':'Discount all services';fields=`<label>Discount type<select name="type"><option value="percent">Percentage (%)</option><option value="fixed" ${rule?.type==='fixed'?'selected':''}>Amount ($)</option></select></label>${input('Discount value','value',rule?.value || 0,'number')}<div class="tw-discount-presets">${[0,5,10,15,20].map(n=>button(n,`data-tw-discount-preset="${n}"`)).join('')}</div><p class="tw-muted">Order discount applies after service discounts. Total cannot fall below zero.</p>${group()?'<p class="tw-muted">Discount all applies to the whole ticket. Bill totals update automatically; custom amount splits keep their current proportions.</p>':''}`;}
      if(action==='custom'){title='Custom service';fields=input('Service name','name')+input('Price ($)','price','','number');}
      if(action==='price'){title='Set service price';fields=input('Price ($)','price',l.price ?? '','number');}
      if(action==='customer'){title='Edit customer';fields=input('Customer','customer',ticket.customer)+input('Phone','phone',ticket.phone,'tel');}
      if(action==='hand'){title='Choose your tip';fields=`<p>Thank you, ${esc(ticket.customer)}.</p><div class="tw-tip-row">${[0,10,15,20].map(n=>button(n?n+'%':'No Tip',`data-tw-customer-tip="${n}"`)).join('')}</div>${input('Custom tip ($)','tip',0,'number')}`;}
      if(action==='preview'){const t=totals(ticket);title='Receipt preview';fields=`${amountSplit()?'<p>Shared ticket services shown below. The total is this guest’s allocated payment, including their share of discount and tip.</p>':''}<p>Ticket #${esc(ticket.id)} · ${esc(ticket.customer)}</p>${ticket.lines.map(l=>`<div class="tw-summary-row"><span>${esc(l.name)}</span><span>${validMoney(l.price)?money(cents(l.price)):'—'}</span></div>`).join('')}<p>Discount ${money(t.discountCents || 0)} · Tip ${money(t.tipCents || 0)}</p><h3>Total ${t.error?'—':money(t.totalCents)}</h3><p>Demo receipt · ${ticket.payment?'Payment recorded':'Not paid'}</p>`;}
      $('#tw-dialog-title').textContent=title;$('[data-tw-fields]').innerHTML=fields;$('[data-tw-error]').textContent='';$('[data-tw-save]').disabled=false;$('[data-tw-save]').hidden=['preview','catalog'].includes(action);$('[data-tw-save]').textContent=action==='split-bill'?'Create bills':'Save';
      $('dialog').classList.toggle('tw-split-dialog',action==='split-bill');$('[data-tw-setup-status]').hidden=action!=='split-bill';
      if(action==='split-bill'){
        if(amountSplit()&&group().allocation==='custom')$('[name="amountAllocation"][value="custom"]').checked=true;
        configureSplitSetup(group()?.bills.length);
      }
      $('dialog').classList.toggle('tw-catalog-dialog',action==='catalog'||action==='split-bill');renderCatalog();$('dialog').showModal();
    }
    function add(service) {
      ticket.lines.push({id:crypto.randomUUID(),serviceId:service.id || null,name:service.name,price:service.price,tech:'',status:'unassigned'});save();render();
    }
    root.addEventListener('input',e=>{
      if(ticket.payment)return;
      if(dialogAction==='split-bill'&&$('dialog').open&&e.target.matches('[name="customBillCount"]'))updateSplitCount();
      if(dialogAction==='split-bill'&&$('dialog').open&&e.target.matches('[data-tw-share]'))updateAmountPreview();
      if(dialogAction==='split-bill'&&$('dialog').open&&e.target.name?.startsWith('guest'))renderSetupServices();
      if(e.target.matches('[data-tw-search]')){search=e.target.value;renderCatalog();}
      if(e.target.matches('[data-tw-note]')){ticket.note=e.target.value;save();}
      if(e.target.matches('[data-tw-field]')){ticket.checkout[e.target.dataset.twField]=e.target.value;if(e.target.dataset.twField==='tip')ticket.checkout.tipType='fixed';save();renderTotals();}
    });
    root.addEventListener('change',e=>{
      if(dialogAction==='split-bill'&&$('dialog').open&&e.target.matches('[data-tw-setup-line]')){
        const lineId=e.target.dataset.twSetupLine,guest=e.target.dataset.guest;
        setupAssignments[lineId]=e.target.checked?Number(guest):null;
        renderSetupServices();[...root.querySelectorAll('[data-tw-setup-line]')].find(el=>el.dataset.twSetupLine===lineId&&el.dataset.guest===guest)?.focus({preventScroll:true});return;
      }
      if(dialogAction==='split-bill'&&e.target.matches('[name="splitMode"]')){configureSplitSetup();return;}
      if(dialogAction==='split-bill'&&e.target.matches('[name="amountAllocation"]')){updateAmountPreview();return;}
      if(e.target.matches('[name="billCount"]')&&dialogAction==='split-bill'){
        updateSplitCount();
        if(e.target.value==='custom')$('[name="customBillCount"]').focus();
        return;
      }
      if(e.target.matches('[data-tw-bill-line]')&&group()&&!amountSplit()) {
        const lineId=e.target.dataset.twBillLine,owner=group().bills.find(b=>b.id===group().assignments[lineId]),target=activeBill();
        if(!parent.lines.some(l=>l.id===lineId)||owner?.payment||target.payment)return;
        const to=e.target.checked?target.id:null;
        lastAssignment={lineId,from:owner?.id||null,to,name:parent.lines.find(l=>l.id===lineId).name};
        group().assignments[lineId]=to;selectBill(activeBillId);save();render();
        focusService(lineId);return;
      }
      if(ticket.payment)return;
      if(e.target.matches('[data-tw-bill-name]')&&group()) {
        activeBill().name=e.target.value.trim().slice(0,80)||'Guest';selectBill(activeBillId);save();render();return;
      }
      if(e.target.matches('[data-tw-field]')){ticket.checkout[e.target.dataset.twField]=e.target.value;save();}});
    root.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b||b.disabled)return;
      if(b.hasAttribute('data-tw-back')){root.hidden=true;options.onBack();return;}
      if(b.hasAttribute('data-tw-close')){$('dialog').close();return;}
      if(b.hasAttribute('data-tw-print')){window.print();return;}
      if(b.hasAttribute('data-tw-preview')){openDialog('preview');return;}
      if(b.hasAttribute('data-tw-bill')&&group()){selectBill(b.dataset.twBill);render();[...root.querySelectorAll('[data-tw-bill]')].find(el=>el.dataset.twBill===activeBillId)?.focus({preventScroll:true});return;}
      if(b.hasAttribute('data-tw-service-filter')&&group()&&!amountSplit()){serviceFilter=b.dataset.twServiceFilter;render();$('[data-tw-service-filter="'+serviceFilter+'"]').focus({preventScroll:true});return;}
      if(b.hasAttribute('data-tw-undo-assignment')&&canUndoAssignment()){const lineId=lastAssignment.lineId;group().assignments[lineId]=lastAssignment.from;lastAssignment=null;selectBill(activeBillId);save();render();focusService(lineId);return;}
      if(b.hasAttribute('data-tw-add-bill')&&group()&&!amountSplit()&&!parent.payment&&group().bills.length<parent.lines.length){group().bills.push(newBill('Guest '+(group().bills.length+1)));save();render();return;}
      if(b.hasAttribute('data-tw-remove-bill')&&group()&&!amountSplit()&&group().bills.length>2&&!ticket.lines.length&&!ticket.payment){group().bills=group().bills.filter(b=>b.id!==activeBillId);selectBill(group().bills[0].id);save();render();return;}
      if(b.hasAttribute('data-tw-cancel-split')&&group()&&!group().bills.some(b=>b.payment)){delete parent.splitBills;ticket=parent;lastAssignment=null;serviceFilter='all';save();render();return;}
      if(ticket.payment)return;
      if(b.hasAttribute('data-tw-discount-all')&&group()?.bills.some(bill=>bill.payment))return;
      if(b.hasAttribute('data-tw-assign-services')&&amountSplit()&&!group().bills.some(bill=>bill.payment)){openDialog('split-bill');return;}
      if(b.hasAttribute('data-tw-split-bill')&&!group()){openDialog('split-bill');return;}
      if(b.hasAttribute('data-tw-add-service')){openDialog('catalog');return;}
      if(b.hasAttribute('data-tw-category')){category=b.dataset.twCategory;renderCatalog();}
      if(b.hasAttribute('data-tw-add')){const s=services().find(s=>s.id===b.dataset.twAdd);if(s)add(s);}
      if(b.hasAttribute('data-tw-action')){
        const l=ticket.lines.find(l=>l.id===b.dataset.line);if(!l)return;
        const action=b.dataset.twAction;
        if(action==='remove'){ticket.lines=ticket.lines.filter(x=>x!==l);save();render();}
        else if(action==='start'){if(!clockedIn(l.tech)){openDialog('tech',l.id);return;}l.status='in-service';save();render();}
        else if(action==='complete'){l.status='completed';save();render();}
        else openDialog(action,l.id);
      }
      if(b.hasAttribute('data-tw-start-all')){ticket.lines.forEach(l=>{if(clockedIn(l.tech)&&l.status!=='completed')l.status='in-service';});save();render();if(ticket.lines.some(l=>!clockedIn(l.tech)))message('Assign a technician to each remaining service before starting.');}
      if(b.hasAttribute('data-tw-checkout')){mode='checkout';options.onModeChange?.(mode);render();}
      for(const [hook,action] of [['custom','custom'],['customer','customer'],['discount-all','discount'],['hand','hand']])if(b.hasAttribute('data-tw-'+hook))openDialog(action);
      if(b.hasAttribute('data-tw-discount-preset'))$('[name="value"]').value=b.dataset.twDiscountPreset;
      if(b.hasAttribute('data-tw-tip')){ticket.checkout.tip=b.dataset.twTip;ticket.checkout.tipType=b.dataset.tipType;save();render();}
      if(b.hasAttribute('data-tw-method')){ticket.checkout.method=b.dataset.twMethod;save();render();}
      if(b.hasAttribute('data-tw-receipt')){ticket.checkout.receipt=b.dataset.twReceipt;save();render();}
      if(b.hasAttribute('data-tw-customer-tip')){ticket.checkout.tip=b.dataset.twCustomerTip;ticket.checkout.tipType='percent';$('dialog').close();save();render();}
      if(b.hasAttribute('data-tw-pay')){
        if(group()&&!amountSplit()&&parent.lines.some(l=>!group().bills.some(b=>b.id===group().assignments[l.id]))){message('Assign every service to a guest before payment.');return;}
        if(group()&&!amountSplit()&&group().bills.some(b=>!parent.lines.some(l=>group().assignments[l.id]===b.id))){message('Assign services to every empty bill before payment.');return;}
        const t=totals(ticket),p=ticket.checkout;
        if(t.error){message(t.error);return;}
        if(ticket.lines.some(l=>l.status!=='completed')){message('Complete all services before payment.');return;}
        if(p.method==='cash'&&(!validMoney(p.cash)||cents(p.cash)<t.totalCents)){message('Cash received must cover the total.');return;}
        if(p.method==='split'&&(!validMoney(p.splitCash)||cents(p.splitCash)>t.totalCents)){message('Enter a split cash amount between zero and the total.');return;}
        if(p.method==='gift-card'&&!p.giftCode?.trim()){message('Enter a gift card reference.');return;}
        lastAssignment=null;
        ticket.payment={...t,method:p.method,receipt:p.receipt,cashCents:p.method==='split'?cents(p.splitCash):p.method==='cash'?t.totalCents:0,cardCents:p.method==='split'?t.totalCents-cents(p.splitCash):p.method==='card'?t.totalCents:0,giftCode:p.method==='gift-card'?p.giftCode:'',otherMethod:p.method==='other'?(p.otherMethod || 'Zelle'):'',changeCents:p.method==='cash'?cents(p.cash)-t.totalCents:0,paidAt:new Date().toISOString(),simulated:true};ticket.status='completed';save();render();
      }
    });
    root.addEventListener('submit',e=>{
      if(!e.target.matches('[data-tw-form]'))return;e.preventDefault();
      if(ticket.payment||!$('dialog').open)return;
      if(dialogAction==='split-bill'){startSplit(new FormData(e.target));return;}
      const data=new FormData(e.target),l=ticket.lines.find(l=>l.id===dialogLine),error=text=>{$('[data-tw-error]').textContent=text;};
      if(dialogAction==='discount'){
        const value=data.get('value'),type=data.get('type');
        if(!validMoney(value)||(type==='percent'&&Number(value)>100)){error('Enter a discount from 0 to 100% or a valid dollar amount.');return;}
        if(group()?.bills.some(b=>b.payment)){error('Discount is locked after the first bill is paid.');return;}
        (l || parent).discount={type,value:Number(value)};
        if(group())refreshSplitDiscount();
      }
      if(dialogAction==='tech'){const tech=data.get('tech');const choice=options.technicians().find(t=>t.name===tech);if(!choice||choice.status==='clocked-out'||(choice.status&&choice.status!=='available'&&tech!==l.tech)){error('Choose an available technician.');return;}l.tech=tech;if(l.status==='unassigned')l.status='assigned';}
      if(dialogAction==='service'){const s=services().find(s=>s.id===data.get('service'));if(!s)return;l.name=s.name;l.serviceId=s.id;l.price=s.price;l.discount=null;l.status=l.tech?'assigned':'unassigned';}
      if(dialogAction==='custom'||dialogAction==='price'){
        if(!validMoney(data.get('price')) || (dialogAction==='custom'&&!data.get('name').trim())){error('Enter a service name and valid price.');return;}
        if(dialogAction==='custom'){add({name:data.get('name').trim(),price:Number(data.get('price'))});return;}
        l.price=Number(data.get('price'));
      }
      if(dialogAction==='customer'){if(!data.get('customer').trim()||!data.get('phone').trim()){error('Customer and phone are required.');return;}ticket.customer=data.get('customer').trim();ticket.phone=data.get('phone').trim();}
      if(dialogAction==='hand'){if(!validMoney(data.get('tip'))){error('Enter a valid tip.');return;}ticket.checkout.tip=Number(data.get('tip'));ticket.checkout.tipType='fixed';}
      $('dialog').close();save();render();
    });
    return {open(value,requestedMode='edit') {
      parent=value;ticket=value;mode=parent.splitBills?'checkout':requestedMode;category='All';search='';serviceFilter='all';lastAssignment=null;
      const catalog=options.catalog(),key=value=>String(value || '').trim().toLowerCase();
      const resolveService=line=>{
        if(line.serviceId)return catalog.find(s=>s.id===line.serviceId);
        const matches=catalog.filter(s=>key(s.name)===key(line.name)||s.aliases?.some(a=>key(a)===key(line.name)));
        return matches.length===1?matches[0]:undefined;
      };
      let changed=!ticket.lines;
      if(!ticket.lines)ticket.lines=ticket.services.map((name,index)=>{
        const s=resolveService({name});
        return {id:'line-'+ticket.id+'-'+index,serviceId:s?.id,name,price:s?.price ?? null,tech:ticket.tech || '',status:ticket.status==='in-service'?'in-service':ticket.tech?'assigned':'unassigned'};
      });
      if(!ticket.payment&&!group())ticket.lines.forEach(l=>{
        if(validMoney(l.price))return;
        const service=resolveService(l);
        if(service&&validMoney(service.price)){l.serviceId=service.id;l.price=Number(service.price);changed=true;}
      });
      ticket.checkout=ticket.checkout || {tip:0,tipType:'fixed',method:'cash',cash:'',receipt:'none'};
      if(group())selectBill((group().bills.find(b=>!b.payment)||group().bills[0]).id);
      if(changed)options.onChange(parent);
      root.hidden=false;render();
    }};
  }
  window.NEXORA_TICKET_WORKSPACE={mount,totals};
})();
