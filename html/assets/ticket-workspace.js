(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = cents => '$' + (cents / 100).toFixed(2);
  const cents = value => Math.round(Number(value) * 100);
  const validMoney = value => value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) >= 0;
  const discount = (base, rule) => Math.min(base, Math.round(rule?.type === 'fixed' ? Number(rule.value) * 100 : base * Number(rule?.value || 0) / 100));
  function totals(ticket) {
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
    let ticket, mode='edit', category='All', search='', dialogAction='', dialogLine='';
    const $ = selector => root.querySelector(selector);
    const button = (label,attr,style='') => `<button type="button" class="tw-button ${style}" ${attr}>${label}</button>`;
    const input = (label,name,value='',type='text') => `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${type==='number'?'min="0" step="0.01"':''} required></label>`;
    const services = () => options.catalog().filter(s=>s.active!==false);
    const categoryOf = s => s.categoryName || s.requiredSkill || 'Other';
    const clockedIn = name => {const tech=options.technicians().find(t=>t.name===name);return !!tech && tech.status!=='clocked-out';};
    function save() {
      ticket.services=ticket.lines.map(l=>l.name);
      ticket.tech=[...new Set(ticket.lines.map(l=>l.tech).filter(Boolean))].join(', ');
      if (!ticket.payment) ticket.status=ticket.lines.some(l=>['in-service','completed'].includes(l.status))?'in-service':'waiting';
      options.onChange(ticket);
    }
    function message(text) {$('[data-tw-message]').textContent=text;}
    function renderCatalog() {
      const list=services().filter(s=>(category==='All'||categoryOf(s)===category)&&s.name.toLowerCase().includes(search.toLowerCase()));
      $('[data-tw-categories]').innerHTML=['All',...new Set(services().map(categoryOf))].map(c=>button(esc(c),`data-tw-category="${esc(c)}" aria-pressed="${c===category}"`,c===category?'selected':'')).join('');
      $('[data-tw-catalog]').innerHTML=[...new Set(list.map(categoryOf))].map(c=>`<section class="tw-category"><h4>${esc(c)}</h4><div class="tw-service-grid">${list.filter(s=>categoryOf(s)===c).map(s=>`<button type="button" class="tw-service" data-tw-add="${esc(s.id)}" ${ticket.payment?'disabled':''}><strong>${esc(s.name)}</strong><span>${s.price==null?'Enter price':money(cents(s.price))}<b aria-hidden="true">＋</b></span></button>`).join('')}</div></section>`).join('') || '<p class="tw-muted">No services found.</p>';
    }
    function renderTotals() {
      const t=totals(ticket);
      const display=mode==='checkout'?t.totalCents:t.netCents;
      root.querySelectorAll('[data-tw-total]').forEach(el=>el.textContent=t.error?'—':money(display));
      if ($('[data-tw-subtotal]')) $('[data-tw-subtotal]').textContent=t.error?'—':money(t.subtotalCents);
      if ($('[data-tw-discount-total]')) $('[data-tw-discount-total]').textContent=t.error?'—':'−'+money(t.discountCents);
      if ($('[data-tw-tip-total]')) $('[data-tw-tip-total]').textContent=t.error?'—':money(t.tipCents);
      if ($('[data-tw-change]')) $('[data-tw-change]').textContent=t.error?'—':money(Math.max(0,cents(ticket.checkout.cash || 0)-t.totalCents));
      if ($('[data-tw-pay]')) $('[data-tw-pay]').textContent='Pay · '+(t.error?'—':money(t.totalCents));
      return t;
    }
    function paymentHtml() {
      const p=ticket.checkout;
      if (ticket.payment) return `<section class="tw-card tw-receipt"><h3>PAYMENT RECORDED · DEMO</h3><p>Total <strong>${money(ticket.payment.totalCents)}</strong></p><p>Change due ${money(ticket.payment.changeCents)}</p><p>${esc(ticket.payment.method)} · ${esc(ticket.payment.receipt==='sms'?'SMS receipt simulated':ticket.payment.receipt==='print'?'Print receipt selected':'No receipt')}</p>${ticket.payment.method==='split'?`<p>Cash ${money(ticket.payment.cashCents)} · Card ${money(ticket.payment.cardCents)}</p>`:''}<p class="tw-muted">No money was charged. No SMS was sent.</p>${button('Print receipt','data-tw-print')}</section>`;
      return `<section class="tw-card"><div class="tw-card-title"><h3>TIP</h3>${button('Hand to customer','data-tw-hand','tw-small tw-purple')}</div><div class="tw-tip-row">${[[0,'No Tip','fixed'],[10,'$10','fixed'],[15,'$15','fixed'],[10,'10%','percent'],[20,'20%','percent']].map(([n,label,type])=>button(label,`data-tw-tip="${n}" data-tip-type="${type}"`,p.tipType===type&&Number(p.tip)===n?'selected':'')).join('')}<label class="tw-custom-tip"><span>$</span><input aria-label="Custom tip" placeholder="Custom" type="number" min="0" step="0.01" data-tw-field="tip" value="${p.tipType==='fixed'&&p.tip?esc(p.tip):''}"></label></div></section>
      <section class="tw-card"><h3>PAYMENT METHOD</h3><div class="tw-methods">${[['cash','💵 Cash'],['card','💳 Card'],['gift-card','🎁 Gift Card'],['split','♧ Split Pay'],['other','⋯ More']].map(([id,label])=>button(label,`data-tw-method="${id}"`,p.method===id?'selected':'')).join('')}</div>
      ${p.method==='cash'?`<div class="tw-cash"><label>Cash received <input aria-label="Cash received" type="number" min="0" step="0.01" data-tw-field="cash" value="${esc(p.cash)}"></label><span>Change due <strong data-tw-change>$0.00</strong></span></div>`:p.method==='split'?`<div class="tw-cash"><label>Cash portion ($)<input aria-label="Split cash amount" type="number" min="0" step="0.01" data-tw-field="splitCash" value="${esc(p.splitCash || '')}"></label><span>Remaining balance: card (demo)</span></div>`:p.method==='gift-card'?`<label class="tw-payment-info">Gift card reference<input aria-label="Gift card reference" data-tw-field="giftCode" value="${esc(p.giftCode || '')}" placeholder="Demo reference"></label>`:p.method==='other'?`<label class="tw-payment-info">Other method<select data-tw-field="otherMethod"><option ${p.otherMethod==='Zelle'?'selected':''}>Zelle</option><option ${p.otherMethod==='Venmo'?'selected':''}>Venmo</option><option ${p.otherMethod==='Other'?'selected':''}>Other</option></select></label>`:'<p class="tw-muted">Card payment is simulated. No card details are collected.</p>'}
      <h3 class="tw-receipt-label">RECEIPT</h3><div class="tw-receipt-options">${[['none','No Receipt'],['sms','Send SMS'],['print','Print']].map(([id,label])=>button(label,`data-tw-receipt="${id}"`,p.receipt===id?'selected':'')).join('')}</div><div class="tw-preview">${button('Print preview','data-tw-preview','tw-text')}</div></section>
      <section class="tw-card"><div class="tw-card-title"><h3>PAYMENT SUMMARY</h3>${button('Discount all','data-tw-discount-all','tw-small tw-orange')}</div><div class="tw-summary-label"><span>SERVICE</span><span>PRICE</span></div>${ticket.lines.map(l=>`<div class="tw-summary-row"><span>${esc(l.name)}</span><span>${validMoney(l.price)?money(cents(l.price)):'—'}</span></div>`).join('')}<div class="tw-summary-row tw-rule"><span>Subtotal</span><span data-tw-subtotal></span></div><div class="tw-summary-row"><span>Tip</span><span data-tw-tip-total></span></div><div class="tw-summary-row"><span>Discount</span><span class="tw-red" data-tw-discount-total></span></div><div class="tw-summary-row tw-rule"><strong>TOTAL</strong><strong data-tw-total></strong></div></section>${button('Pay','data-tw-pay','tw-primary tw-pay')}<p class="tw-demo">Prototype · Payment and SMS receipt are simulated.</p>`;
    }
    function render() {
      const paid=!!ticket.payment;
      root.innerHTML=`<div class="tw-heading">${button('← Back','data-tw-back')}<h2>Ticket #${esc(ticket.id)} · ${esc(ticket.customer)}</h2>${!paid?button('Edit customer','data-tw-customer','tw-text'):''}</div><div class="tw-workspace"><section class="tw-card tw-catalog-panel"><h3>SERVICES</h3><input class="tw-search" data-tw-search type="search" placeholder="Search services…" aria-label="Search ticket services" value="${esc(search)}"><div class="tw-categories" data-tw-categories></div><div class="tw-catalog" data-tw-catalog></div></section><div class="tw-ticket-side"><section class="tw-card"><div class="tw-card-title"><h3>TICKET DETAIL (${ticket.lines.length} services)</h3>${!paid?button('+ Custom','data-tw-custom','tw-small tw-purple'):''}</div><div class="tw-lines">${ticket.lines.map(l=>{
        const status={'assigned':'ASSIGNED','in-service':'IN PROGRESS',completed:'COMPLETED'}[l.status] || 'UNASSIGNED';
        return `<article class="tw-line"><div class="tw-line-top"><div><strong>${esc(l.name)}</strong> <span class="tw-status ${esc(l.status)}">${status}</span><p>Tech. <b>${esc(l.tech || 'Unassigned')}</b></p></div><strong>${validMoney(l.price)?money(cents(l.price)):'Price required'}</strong></div>${l.discount?.value?`<p class="tw-discount-note">Discount: ${esc(l.discount.value)}${l.discount.type==='fixed'?' USD':'%'}</p>`:''}${!paid?`<div class="tw-line-actions">${l.status==='completed'?'<span class="tw-completed">✓ Completed</span>':button(l.status==='in-service'?'Complete':'Start',`data-tw-action="${l.status==='in-service'?'complete':'start'}" data-line="${esc(l.id)}"`,'tw-green')}${button('Change tech',`data-tw-action="tech" data-line="${esc(l.id)}"`,'tw-blue')}${button('Change service',`data-tw-action="service" data-line="${esc(l.id)}"`,'tw-purple')}${button('Discount',`data-tw-action="discount" data-line="${esc(l.id)}"`,'tw-orange')}${button('Remove',`data-tw-action="remove" data-line="${esc(l.id)}"`,'tw-red')}${!validMoney(l.price)?button('Set price',`data-tw-action="price" data-line="${esc(l.id)}"`,'tw-orange'):''}</div>`:''}</article>`;
      }).join('') || '<p class="tw-muted">Choose a service to add it to this ticket.</p>'}</div>${mode==='edit'?'<div class="tw-summary-row tw-rule"><strong>ESTIMATED TOTAL</strong><strong data-tw-total></strong></div>':''}</section><section class="tw-card"><label class="tw-note">NOTE<textarea data-tw-note placeholder="Seat, customer preferences, color/powder used…" ${paid?'disabled':''}>${esc(ticket.note || '')}</textarea></label></section>${mode==='checkout'?paymentHtml():`<div class="tw-bottom">${button('♧ Print Ticket','data-tw-print')}${button('☑ Start Service','data-tw-start-all','tw-purple')}</div>${button('Checkout Ticket →','data-tw-checkout','tw-text')}` }<p data-tw-message role="status"></p></div></div><dialog class="tw-dialog" aria-labelledby="tw-dialog-title"><form data-tw-form><div class="tw-card-title"><h2 id="tw-dialog-title"></h2>${button('×','data-tw-close','tw-text')}</div><div data-tw-fields></div><p data-tw-error role="alert"></p><button type="submit" class="tw-button tw-primary" data-tw-save>Save</button></form></dialog>`;
      renderCatalog();renderTotals();
    }
    function openDialog(action,lineId) {
      dialogAction=action;dialogLine=lineId;
      const l=ticket.lines.find(l=>l.id===lineId),rule=l?l.discount:ticket.discount;
      let title='',fields='';
      if(action==='tech'){title='Change technician';fields='<label>Technician<select name="tech" required><option value="">Choose technician</option>'+options.technicians().map(t=>`<option ${t.name===l.tech?'selected':''} ${t.status==='clocked-out'||(t.status&&t.status!=='available'&&t.name!==l.tech)?'disabled':''}>${esc(t.name)}</option>`).join('')+'</select></label>';}
      if(action==='service'){title='Change service';fields='<label>Service<select name="service" required>'+services().map(s=>`<option value="${esc(s.id)}">${esc(s.name)} · ${s.price==null?'Enter price':money(cents(s.price))}</option>`).join('')+'</select></label>';}
      if(action==='discount'){title=l?'Service discount':'Discount all services';fields=`<label>Discount type<select name="type"><option value="percent">Percentage (%)</option><option value="fixed" ${rule?.type==='fixed'?'selected':''}>Amount ($)</option></select></label>${input('Discount value','value',rule?.value || 0,'number')}<div class="tw-discount-presets">${[0,5,10,15,20].map(n=>button(n,`data-tw-discount-preset="${n}"`)).join('')}</div><p class="tw-muted">Order discount applies after service discounts. Total cannot fall below zero.</p>`;}
      if(action==='custom'){title='Custom service';fields=input('Service name','name')+input('Price ($)','price','','number');}
      if(action==='price'){title='Set service price';fields=input('Price ($)','price',l.price ?? '','number');}
      if(action==='customer'){title='Edit customer';fields=input('Customer','customer',ticket.customer)+input('Phone','phone',ticket.phone,'tel');}
      if(action==='hand'){title='Choose your tip';fields=`<p>Thank you, ${esc(ticket.customer)}.</p><div class="tw-tip-row">${[0,10,15,20].map(n=>button(n?n+'%':'No Tip',`data-tw-customer-tip="${n}"`)).join('')}</div>${input('Custom tip ($)','tip',0,'number')}`;}
      if(action==='preview'){const t=totals(ticket);title='Receipt preview';fields=`<p>Ticket #${esc(ticket.id)} · ${esc(ticket.customer)}</p>${ticket.lines.map(l=>`<div class="tw-summary-row"><span>${esc(l.name)}</span><span>${validMoney(l.price)?money(cents(l.price)):'—'}</span></div>`).join('')}<p>Discount ${money(t.discountCents || 0)} · Tip ${money(t.tipCents || 0)}</p><h3>Total ${t.error?'—':money(t.totalCents)}</h3><p>Demo receipt · ${ticket.payment?'Payment recorded':'Not paid'}</p>`;}
      $('#tw-dialog-title').textContent=title;$('[data-tw-fields]').innerHTML=fields;$('[data-tw-error]').textContent='';$('[data-tw-save]').hidden=action==='preview';$('dialog').showModal();
    }
    function add(service) {
      ticket.lines.push({id:crypto.randomUUID(),serviceId:service.id || null,name:service.name,price:service.price,tech:'',status:'unassigned'});save();render();
    }
    root.addEventListener('input',e=>{
      if(e.target.matches('[data-tw-search]')){search=e.target.value;renderCatalog();}
      if(e.target.matches('[data-tw-note]')){ticket.note=e.target.value;save();}
      if(e.target.matches('[data-tw-field]')){ticket.checkout[e.target.dataset.twField]=e.target.value;if(e.target.dataset.twField==='tip')ticket.checkout.tipType='fixed';save();renderTotals();}
    });
    root.addEventListener('change',e=>{if(e.target.matches('[data-tw-field]')){ticket.checkout[e.target.dataset.twField]=e.target.value;save();}});
    root.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b||b.disabled)return;
      if(b.hasAttribute('data-tw-back')){root.hidden=true;options.onBack();return;}
      if(b.hasAttribute('data-tw-close')){$('dialog').close();return;}
      if(b.hasAttribute('data-tw-print')){window.print();return;}
      if(b.hasAttribute('data-tw-preview')){openDialog('preview');return;}
      if(ticket.payment)return;
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
      if(b.hasAttribute('data-tw-checkout')){mode='checkout';render();}
      for(const [hook,action] of [['custom','custom'],['customer','customer'],['discount-all','discount'],['hand','hand']])if(b.hasAttribute('data-tw-'+hook))openDialog(action);
      if(b.hasAttribute('data-tw-discount-preset'))$('[name="value"]').value=b.dataset.twDiscountPreset;
      if(b.hasAttribute('data-tw-tip')){ticket.checkout.tip=b.dataset.twTip;ticket.checkout.tipType=b.dataset.tipType;save();render();}
      if(b.hasAttribute('data-tw-method')){ticket.checkout.method=b.dataset.twMethod;save();render();}
      if(b.hasAttribute('data-tw-receipt')){ticket.checkout.receipt=b.dataset.twReceipt;save();render();}
      if(b.hasAttribute('data-tw-customer-tip')){ticket.checkout.tip=b.dataset.twCustomerTip;ticket.checkout.tipType='percent';$('dialog').close();save();render();}
      if(b.hasAttribute('data-tw-pay')){
        const t=totals(ticket),p=ticket.checkout;
        if(t.error){message(t.error);return;}
        if(ticket.lines.some(l=>l.status!=='completed')){message('Complete all services before payment.');return;}
        if(p.method==='cash'&&(!validMoney(p.cash)||cents(p.cash)<t.totalCents)){message('Cash received must cover the total.');return;}
        if(p.method==='split'&&(!validMoney(p.splitCash)||cents(p.splitCash)>t.totalCents)){message('Enter a split cash amount between zero and the total.');return;}
        if(p.method==='gift-card'&&!p.giftCode?.trim()){message('Enter a gift card reference.');return;}
        ticket.payment={...t,method:p.method,receipt:p.receipt,cashCents:p.method==='split'?cents(p.splitCash):p.method==='cash'?t.totalCents:0,cardCents:p.method==='split'?t.totalCents-cents(p.splitCash):p.method==='card'?t.totalCents:0,giftCode:p.method==='gift-card'?p.giftCode:'',otherMethod:p.method==='other'?(p.otherMethod || 'Zelle'):'',changeCents:p.method==='cash'?cents(p.cash)-t.totalCents:0,paidAt:new Date().toISOString(),simulated:true};ticket.status='completed';save();render();
      }
    });
    root.addEventListener('submit',e=>{
      if(!e.target.matches('[data-tw-form]'))return;e.preventDefault();
      const data=new FormData(e.target),l=ticket.lines.find(l=>l.id===dialogLine),error=text=>{$('[data-tw-error]').textContent=text;};
      if(dialogAction==='discount'){
        const value=data.get('value'),type=data.get('type');
        if(!validMoney(value)||(type==='percent'&&Number(value)>100)){error('Enter a discount from 0 to 100% or a valid dollar amount.');return;}
        (l || ticket).discount={type,value:Number(value)};
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
      ticket=value;mode=requestedMode;category='All';search='';
      if(!ticket.lines)ticket.lines=ticket.services.map((name,index)=>{
        const s=options.catalog().find(s=>s.name===name||s.aliases?.includes(name));
        return {id:'line-'+ticket.id+'-'+index,serviceId:s?.id,name,price:s?.price ?? null,tech:ticket.tech || '',status:ticket.status==='in-service'?'in-service':ticket.tech?'assigned':'unassigned'};
      });
      ticket.checkout=ticket.checkout || {tip:0,tipType:'fixed',method:'cash',cash:'',receipt:'none'};
      root.hidden=false;render();
    }};
  }
  window.NEXORA_TICKET_WORKSPACE={mount,totals};
})();
