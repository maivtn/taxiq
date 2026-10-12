(function () {
  'use strict';
  const root=document.querySelector('[data-completed-root]');if(!root)return;
  const demo=window.NEXORA_POS_DEMO,esc=demo.esc;
  const keys={direct:'nexora:direct-checkouts:v1',tickets:'nexora:front-desk-ticket-workspaces:v1'};
  const $=selector=>root.querySelector(selector),money=value=>'$'+(Number(value || 0)/100).toFixed(2);
  const customerName=value=>value==='Demo customer A'?'Customer A':String(value || '');
  const isPaid=t=>!!t.payment&&!t.cancelled&&t.status!=='cancelled'&&(!t.splitBills?.bills?.length||t.splitBills.bills.every(b=>b.payment));
  let readError=false;
  function load(source){
    try{
      const saved=JSON.parse(localStorage.getItem(keys[source]) || (source==='direct'?'[]':'{}'));
      if(source==='direct')return Array.isArray(saved)?saved.map(t=>({source,key:t.id,ticket:t})):[];
      return saved&&typeof saved==='object'&&!Array.isArray(saved)?Object.entries(saved).map(([key,ticket])=>({source,key,ticket})):[];
    }catch(_){readError=true;return [];}
  }
  function visible(t){
    const account=demo.account();
    if(['owner','manager','cashier'].includes(account.role))return true;
    return account.role==='technician'&&[t.tech,...(t.lines || []).map(l=>l.tech)].flatMap(value=>String(value || '').split(',')).some(name=>name.trim()===account.name);
  }
  function receiptUrl(record){
    const url=new URL(record.source==='direct'?'pos-direct-checkout.html':'pos-front-desk-tickets.html',location.href);
    url.searchParams.set(record.source==='direct'?'checkoutId':'ticketId',record.key);
    if(record.source==='tickets')url.searchParams.set('mode','checkout');
    return url.href;
  }
  function card(record){
    const t=record.ticket,p=t.payment,lines=t.lines || [],source=record.source==='direct'?'Checkout Customer':'Tickets';
    const label=record.source==='direct'?t.id:'Ticket #'+t.id;
    const method=p.method==='split-bills'?'Split bills':demo.load().payment.methods.find(m=>m.id===p.method)?.label || p.otherMethod || p.method;
    const at=p.paidAt || t.createdAt,date=at&&!Number.isNaN(new Date(at).getTime())?demo.timeHtml(at):'—';
    return `<article class="ticket-card panel"><div class="ticket-top"><div><span class="ticket-id">${esc(label)}</span><h3 class="ticket-name">${esc(customerName(t.customer))}</h3></div><span class="status po-paid">Paid</span></div><div class="ticket-details"><div class="field-label">Services</div><p>${lines.map(l=>esc(l.name)).join(', ') || (t.services || []).map(esc).join(', ') || '—'}</p><div class="field-label">Technician</div><p>${esc(t.tech || '—')}</p><div class="field-label">Payment</div><p>${esc(method)} · ${source}</p></div><div class="po-ticket-meta">${date}<strong>${money(p.totalCents)}</strong></div><div class="ticket-actions"><a class="btn dc-purple btn-wide" href="${esc(receiptUrl(record))}"><i data-lucide="receipt-text" aria-hidden="true"></i>View saved receipt</a></div></article>`;
  }
  function render(){
    readError=false;
    const query=$('[data-completed-search]').value.trim().toLowerCase(),phone=query.replace(/\D/g,''),source=$('[data-completed-source]').value;
    const records=[...load('direct'),...load('tickets')].filter(record=>record.ticket&&isPaid(record.ticket)&&visible(record.ticket));
    const rows=records.filter(record=>{
      const t=record.ticket;
      return (source==='all'||record.source===source)&&(!query||(customerName(t.customer)+' '+t.id+' '+record.key).toLowerCase().includes(query)||(phone&&/^[\d\s()+.-]+$/.test(query)&&String(t.phone || '').replace(/\D/g,'').includes(phone)));
    }).sort((a,b)=>(Date.parse(b.ticket.payment.paidAt) || 0)-(Date.parse(a.ticket.payment.paidAt) || 0));
    const account=demo.account();$('[data-completed-account]').textContent=account.name+' · '+account.role;
    $('[data-completed-count]').textContent='Paid: '+rows.length;
    $('[data-completed-error]').hidden=!readError;$('[data-completed-error]').textContent=readError?'Unable to read some saved checkouts. Reload this page to try again.':'';
    $('[data-completed-list]').innerHTML=rows.map(card).join('') || `<div class="panel ticket-empty"><span class="po-empty-icon"><i data-lucide="receipt-text" aria-hidden="true"></i></span><strong>${query||source!=='all'?'No matching completed services':'No completed services yet'}</strong><p>Paid checkouts appear here.</p></div>`;
    window.lucide?.createIcons();
  }
  $('[data-completed-search]').addEventListener('input',render);
  $('[data-completed-source]').addEventListener('change',render);
  window.addEventListener('storage',e=>{if(!e.key||Object.values(keys).includes(e.key))render();});
  window.addEventListener('nexora:pos-account-changed',render);
  window.addEventListener('nexora:pos-settings-changed',render);
  render();
})();
