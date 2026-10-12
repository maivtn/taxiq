(function () {
  'use strict';
  const demo=window.NEXORA_POS_DEMO,esc=demo.esc;
  const node=(tag,className,html='')=>{const element=document.createElement(tag);element.className=className;element.innerHTML=html;return element;};
  function header(panel,kind){
    panel.classList.add('po-settings');
    const session=panel.querySelector('.pos-session');if(session)session.remove();
    const heading=panel.querySelector('.pos-heading');if(!heading)return;
    heading.classList.add('settings-head');
    const actions=node('div','settings-head-actions');
    const other=kind==='payment'?'Access & PIN':'Payment Methods & Fees',section=kind==='payment'?'access-pin':'payment-fees';
    actions.innerHTML=`<a class="po-settings-button" href="pos-salon-settings.html?section=${section}">${other}</a>`;
    const back=heading.querySelector('a');if(back)actions.append(back);heading.append(actions);
  }
  function decorateAccess(panel){
    header(panel,'access');
    const form=panel.querySelector('form'),cards=[...form.querySelectorAll(':scope >.pos-card')],accounts=cards[0],rules=cards[1],matrix=cards[2];
    const setup=node('section','panel access-build-note',`<h3>Owner setup · 3 steps</h3><p><b>1.</b> Assign each person’s POS Role. <b>2.</b> Enroll a personal PIN for each owner or manager. <b>3.</b> Choose which actions require approval, then save with Owner PIN.</p>`);
    form.before(setup);
    const owner=node('section','panel owner-mode-card',`<div><span class="settings-eyebrow">OWNER MODE</span><h3>${demo.account().role==='owner'?'Owner Mode active':'Owner Mode required'}</h3><p>Owner configures role rules, payment fees, PIN policy, and access to business data. Each person uses their own account and PIN. Approval is limited to the record or transaction shown.</p></div><div class="po-owner-actions"><span class="access-current">Current session · ${esc(demo.account().role)}</span><button type="button" class="po-settings-button po-settings-primary" data-pos-switch>Switch POS account</button></div>`);
    form.before(owner);
    const descriptions=[['technician','01 · Assigned work','Technician','See assigned visits and services. Customer contact and private notes stay hidden.'],['cashier','02 · Daily operations','Front Desk','Check in, assign work, and take standard payment. Sensitive actions request approval.'],['manager','03 · Operations approval','Manager','Approve contact access, discounts, refunds and adjustments with a personal PIN.'],['owner','04 · Salon control','Owner','Manage permissions and financial settings with Owner PIN.']];
    form.before(node('div','access-role-grid',descriptions.map(([role,kicker,title,copy])=>`<div class="access-role-card ${demo.account().role===role?'active':''}"><span>${kicker}</span><strong>${title}</strong><p>${copy}</p></div>`).join('')));
    const enrollment=node('details','panel settings-card po-enrollment','<summary>Personal POS accounts & PIN enrollment</summary>');
    while(accounts.firstChild)enrollment.append(accounts.firstChild);accounts.replaceWith(enrollment);
    const warning=panel.querySelector(':scope >.pos-warning');if(warning){warning.classList.add('pin-demo-note');enrollment.append(warning);}
    matrix.classList.add('panel','permission-matrix');
    const table=matrix.querySelector('table'),order=[0,4,3,2,1,5];
    [...table.rows].forEach(row=>{const cells=[...row.cells];order.forEach(index=>row.append(cells[index]));});
    table.tHead.rows[0].cells[2].textContent='Front Desk';
    [...table.tBodies[0].rows].forEach((row,index)=>{
      if([0,2,4].includes(index)){const section=node('tr','permission-group',`<th colspan="6" scope="rowgroup">${index===0?'Customer data':index===2?'Ticket & payment':'Business & stations'}</th>`);row.before(section);}
      [...row.cells].slice(1).forEach(cell=>{const text=cell.textContent;cell.innerHTML=`<span class="permission-status ${text==='Blocked'?'blocked':/PIN|approval/.test(text)?'approval':'allowed'}">${esc(text)}</span>`;});
    });
    const title=matrix.querySelector('h3');title.textContent='Permission matrix';title.after(node('p','pos-muted','“Ask approval” calls a Manager or Owner. Personal PIN approval applies to the listed action.'));
    form.prepend(matrix);
    rules.classList.add('panel','access-rule-panel');
    const list=rules.querySelector('.pos-rule-list');list.classList.add('access-rule-list');
    [...list.children].forEach(label=>{
      const input=label.querySelector('input'),title=label.textContent.trim(),checked=input.checked;
      const row=node('div','access-rule-row',`<strong>${esc(title)}</strong><small>${['contact','notes'].includes(input.name)?'Contact and private information stay hidden until approved.':'Approval is requested for this action at checkout.'}</small>`);
      const level=node('label','access-rule-level '+(checked?'manager':'routine'));level.append(input,document.createTextNode(checked?'Manager PIN':'Routine'));row.insertBefore(level,row.lastChild);label.replaceWith(row);
    });
    matrix.after(rules);rules.after(enrollment);
    const audit=panel.querySelector(':scope >section:last-child');if(audit)audit.classList.add('panel','access-audit');
  }
  function cardTitle(card,kicker=''){
    const title=card.querySelector(':scope >h3');if(!title)return;
    const description=title.nextElementSibling?.tagName==='P'?title.nextElementSibling:null;
    const existing=card.querySelector(':scope >.pos-kicker');
    const wrapper=node('div','settings-card-title'),copy=node('div','');
    if(existing)copy.append(existing);else if(kicker)copy.append(node('span','settings-eyebrow',kicker));
    copy.append(title);if(description)copy.append(description);wrapper.append(copy);card.prepend(wrapper);
  }
  function decoratePreview(panel){
    const preview=panel.querySelector('[data-pos-payment-preview]');if(!preview)return;preview.classList.add('settings-preview','three');
    [...preview.children].forEach(card=>{const method=card.querySelector('span')?.textContent || '',amount=card.querySelector('strong')?.textContent || '',detail=card.querySelector('small')?.textContent || '';card.innerHTML=`<span>${esc(detail)}</span><strong>${esc(method)}</strong><b>${esc(amount)}</b>`;});
  }
  function decoratePayment(panel){
    header(panel,'payment');
    const cards=[...panel.querySelectorAll('fieldset >.pos-card')];cards.forEach(card=>{card.classList.add('panel','settings-card');});
    cardTitle(cards[0]);const count=node('span','settings-count',panel.querySelectorAll('[data-method-row] [name=enabled]:checked').length+' enabled');cards[0].querySelector('.settings-card-title').append(count);
    panel.querySelectorAll('[data-method-row]').forEach(row=>{row.classList.add('payment-method-row');row.querySelector('.pos-check').classList.add('settings-switch');row.querySelector('[name=discountType]').parentElement.classList.add('payment-rule-label');row.querySelector('[name=discountValue]').classList.add('payment-rule-value');});
    const add=panel.querySelector('[data-pos-add-method]').parentElement;add.classList.add('payment-add-method');
    cards.slice(1,3).forEach((card,index)=>{
      const head=card.querySelector('.pos-toggle');head.classList.add('settings-card-title');head.querySelector('div').prepend(node('span','settings-eyebrow',index?'SALON WALLET INCENTIVE · OWNER PIN REQUIRED':'PAYMENT PRICING · OWNER PIN REQUIRED'));
      head.querySelector('.pos-check').classList.add('settings-switch');const input=card.querySelector('input[type=number]'),label=input.parentElement;label.classList.add('settings-field');
      const field=node('span','settings-percent');input.replaceWith(field);field.append(input,node('span','','%'));
    });
    const wallet=node('div','settings-wallet-methods');wallet.setAttribute('role','group');wallet.setAttribute('aria-label','Wallet methods using the default discount');
    panel.querySelectorAll('[data-method-row]').forEach(row=>{const id=row.dataset.methodRow;if(!['zelle','venmo','cash-app','paypal','apple-pay'].includes(id))return;const name=row.querySelector('.settings-switch strong').textContent;wallet.insertAdjacentHTML('beforeend',`<label><input type="checkbox" data-po-wallet-default="${esc(id)}" ${row.querySelector('[name=discountType]').value==='inherit'?'checked':''}><span>${esc(name)}</span></label>`);});
    cards[2].append(wallet);
    cardTitle(cards[3],'TIP POLICY · OWNER PIN REQUIRED');const options=cards[3].querySelector('.pos-rule-list');options.classList.add('settings-tip-options');
    const copy={proportional:['By service amount','More service value receives more of the tip.'],fifty:['50 / 50','Two technicians only; equal split for three or more.'],equal:['Equal per technician','Divide evenly across all technicians.'],manual:['Manual amounts','Enter each technician’s tip at checkout.']};
    [...options.children].forEach(label=>{const input=label.querySelector('input'),description=copy[input.value];label.className='settings-tip-option'+(input.checked?' selected':'');label.innerHTML=`<span><strong>${description[0]}</strong><small>${description[1]}</small></span>`;label.prepend(input);});
    cards[4].classList.add('settings-check');
    panel.append(node('section','panel settings-card settings-explain',`<h3>Checkout calculation</h3><div class="settings-rule-grid"><div><b>1</b><span>Calculate services after discounts</span></div><div><b>2</b><span>Apply the payment discount and Card fee to each portion</span></div><div><b>3</b><span>Add guest tip and show the final total</span></div></div><p>On Split Pay, the Card fee applies to the Card service portion. Tip percentages use discounted services before payment incentives or fees.</p><a class="po-inline-link" href="pos-direct-checkout.html">Preview direct checkout →</a>`));
    updatePaymentControls(panel);
  }
  function segment(input,choices){
    input.hidden=true;
    const control=node('div','st-seg');
    choices.forEach(([value,label])=>{const selected=input.type==='checkbox'?(input.checked?value==='on':value==='off'):input.value===value;control.insertAdjacentHTML('beforeend',`<button type="button" data-po-station-setting="${esc(input.name)}" data-value="${value}" aria-pressed="${selected}">${label}</button>`);});
    input.after(control);
  }
  function decorateStations(panel){
    header(panel,'stations');
    const form=panel.querySelector('form');form.querySelectorAll('.pos-card').forEach(card=>card.classList.add('panel','settings-card','st-set'));
    form.querySelector('.pos-counts').classList.add('st-counts');form.querySelector('.pos-preview').classList.add('st-preview');
    form.querySelectorAll('.pos-toggle').forEach(row=>row.classList.add('st-toggle'));
    segment(form.elements.mode,[['off','Off'],['manual','Manual'],['auto','Auto']]);
    segment(form.elements.cleaner,[['tech','Last technician'],['cleaner','Cleaner'],['both','Either']]);
    const checkbox=form.elements.checklist,label=checkbox.parentElement;label.replaceWith(checkbox);segment(checkbox,[['on','On'],['off','Off']]);
    const advanced=form.querySelector('details');advanced.classList.add('po-station-more');
    const management=node('details','panel settings-card po-station-management','<summary>Station register & sanitation log</summary>');
    [...panel.querySelectorAll(':scope >.pos-card')].forEach(card=>{card.classList.add('panel','settings-card');management.append(card);});
    panel.append(node('section','panel access-build-note',`<h3>Where it shows up</h3><p><b>Front Desk · Today’s Operations:</b> a station strip above guest lanes, station chips on guests and a Station field in Selected guest. <b>Tickets & Turn Board:</b> show the selected station and cleaning state. <b>Staff app:</b> confirm Station clean after the last service before taking the next guest.</p>`),management);
  }
  function updatePaymentControls(panel){
    const form=panel.querySelector('form');if(!form)return;
    form.elements.cardFeePercent.disabled=!form.elements.cardFeeEnabled.checked;
    form.elements.walletPercent.disabled=!form.elements.walletEnabled.checked;
    panel.querySelectorAll('[data-po-wallet-default]').forEach(input=>input.disabled=!form.elements.walletEnabled.checked);
    const count=panel.querySelector('.settings-count');if(count)count.textContent=panel.querySelectorAll('[data-method-row] [name=enabled]:checked').length+' enabled';
    panel.querySelectorAll('.settings-tip-option').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked));
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-po-station-setting]');if(!b||b.disabled)return;
    const input=b.closest('form').elements[b.dataset.poStationSetting];if(input.type==='checkbox')input.checked=b.dataset.value==='on';else input.value=b.dataset.value;
    b.parentElement.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));input.dispatchEvent(new Event('change',{bubbles:true}));
  });
  document.addEventListener('change',e=>{
    const panel=e.target.closest('.po-settings');if(!panel)return;
    if(e.target.hasAttribute('data-po-wallet-default')){const row=panel.querySelector(`[data-method-row="${e.target.dataset.poWalletDefault}"]`),select=row.querySelector('[name=discountType]');select.value=e.target.checked?'inherit':'none';select.dispatchEvent(new Event('change',{bubbles:true}));}
    if(panel.dataset.settingsPanel==='payment-fees')updatePaymentControls(panel);
    const level=e.target.closest('.access-rule-level');if(level){const checked=e.target.checked;level.classList.toggle('manager',checked);level.classList.toggle('routine',!checked);level.lastChild.textContent=checked?'Manager PIN':'Routine';}
  });
  document.addEventListener('input',e=>{
    const form=e.target.closest('[data-pos-stations]');if(!form||!e.target.name.startsWith('count-'))return;
    const preview=form.querySelector('.st-preview'),prefixes={pedi:'P',mani:'A',room:'R'};
    preview.innerHTML=Object.entries(prefixes).flatMap(([kind,prefix])=>Array.from({length:Math.max(0,Math.min(8,Number(form.elements['count-'+kind].value)||0))},(_,index)=>`<span>${prefix}.${index+1}</span>`)).join('');
  });
  window.NEXORA_POS_SETTINGS_UI={decorate(panel,kind){if(kind==='access')decorateAccess(panel);else if(kind==='payment')decoratePayment(panel);else decorateStations(panel);},decoratePreview};
})();
