(function () {
  'use strict';
  const demo=window.NEXORA_POS_DEMO,esc=demo.esc,$=s=>document.querySelector(s);
  const key='nexora:direct-checkouts:v1',lookupKey='nexora:direct-checkout-customer-draft:v1';
  const digits=value=>String(value || '').replace(/\D/g,'');
  let records=[],lookup=null,current=null;
  try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved))records=saved;}catch(_){}
  const knownCustomers=[{customer:'Quan',phone:'5550122807'},{customer:'Brian',phone:'5550161092'},{customer:'DJ',phone:'5550195421'},{customer:'Leo',phone:'5550178804'}];
  const catalog=()=>window.NEXORA_SALON_DATA.loadCatalog();
  const technicians=()=>catalog().technicians.filter(t=>t.active).map(t=>({name:t.name,status:'available'}));
  const canCheckout=()=>['owner','manager','cashier'].includes(demo.account().role);
  function persist(){try{localStorage.setItem(key,JSON.stringify(records));return true;}catch(_){$('[data-direct-feedback]').textContent='Unable to save checkout locally. Keep this page open.';return false;}}
  const workspace=window.NEXORA_TICKET_WORKSPACE.mount($('#ticket-workspace'),{
    catalog:()=>catalog().services,technicians,
    onChange(){persist();},
    onModeChange(mode){if(current)url(current.id,mode);},
    onBack(){current=null;url();showList();}
  });
  function url(id,mode='checkout',replace=false){const next=new URL(location.href);if(id){next.searchParams.set('checkoutId',id);next.searchParams.set('mode',mode);}else{next.searchParams.delete('checkoutId');next.searchParams.delete('mode');}if(next.href!==location.href)history[replace?'replaceState':'pushState'](null,'',next);}
  function renderList(){
    $('[data-direct-session]').innerHTML=demo.sessionHtml();
    const query=$('[data-direct-search]').value.trim().toLowerCase(),status=$('[data-direct-filter]').value;
    $('[data-direct-new]').disabled=!canCheckout();
    const rows=records.filter(t=>(status==='all'||(t.payment?'paid':'draft')===status)&&(!query||(t.customer+' '+t.id).toLowerCase().includes(query)||(/^[\d\s()+.-]+$/.test(query)&&digits(t.phone).includes(digits(query)))));
    $('[data-direct-results]').innerHTML=rows.map(t=>`<article class="direct-checkout-row"><div><strong>${esc(t.id)} · ${esc(t.customer)}</strong><p>${t.payment?'Paid':'Draft'} · ${t.lines.length} services · Contact •••• ${esc(digits(t.phone).slice(-4))}</p></div>${demo.timeHtml(t.payment?.paidAt || t.createdAt)}<strong>${t.payment?'$'+(t.payment.totalCents/100).toFixed(2):'Not paid'}</strong><button type="button" data-direct-open="${esc(t.id)}" ${!canCheckout()?'disabled':''}>${t.payment?'View saved receipt':'Resume checkout'}</button></article>`).join('') || '<div class="pos-card"><h3>No checkouts found</h3><p>Create a new checkout or adjust the search.</p></div>';
  }
  function showList(){
    $('#ticket-workspace').hidden=true;$('[data-direct-customer]').hidden=true;$('[data-direct-list]').hidden=false;renderList();
  }
  function open(t,mode='checkout',replace=false){
    if(!canCheckout())return;
    current=t;lookup=null;$('[data-direct-list]').hidden=true;$('[data-direct-customer]').hidden=true;
    url(t.id,mode,replace);workspace.open(t,t.payment?'checkout':mode);
  }
  function newCheckout(){
    if(!canCheckout())return;
    current=null;lookup=null;$('#ticket-workspace').hidden=true;$('[data-direct-list]').hidden=true;$('[data-direct-customer]').hidden=false;
    const f=$('[data-direct-customer-form]');f.reset();f.elements.customer.disabled=true;$('[data-direct-customer-result]').hidden=true;$('[data-direct-error]').textContent='';
    try{const draft=JSON.parse(localStorage.getItem(lookupKey));if(draft){f.elements.phone.value=draft.phone || '';f.elements.customer.value=draft.customer || '';}}catch(_){}
    f.elements.phone.focus();
  }
  function lookupCustomer(){
    const f=$('[data-direct-customer-form]'),phone=digits(f.elements.phone.value);
    if(phone.length!==10){$('[data-direct-error]').textContent='Enter a valid 10-digit phone number.';return;}
    const booked=(window.NEXORA_APPOINTMENTS_STORE?.loadAll() || []).map(r=>({customer:r.customerName,phone:r.phone}));
    const found=[...records,...booked,...knownCustomers].find(c=>digits(c.phone)===phone);
    lookup={phone,existing:!!found};f.elements.customer.disabled=false;f.elements.customer.value=found?.customer || '';
    $('[data-direct-customer-status]').textContent=found?'Customer found · '+found.customer:'New customer · enter their name';
    $('[data-direct-customer-result]').hidden=false;$('[data-direct-error]').textContent='';f.elements.customer.focus();
  }
  $('[data-direct-customer-form]').addEventListener('input',e=>{
    const f=e.currentTarget;
    if(e.target.name==='phone'){lookup=null;f.elements.customer.disabled=true;$('[data-direct-customer-result]').hidden=true;}
    try{localStorage.setItem(lookupKey,JSON.stringify({phone:f.elements.phone.value,customer:f.elements.customer.value}));}catch(_){}
  });
  $('[data-direct-customer-form]').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.name==='phone'){e.preventDefault();lookupCustomer();}});
  $('[data-direct-customer-form]').addEventListener('submit',e=>{
    e.preventDefault();if(!canCheckout())return;const f=e.currentTarget;
    if(!lookup||lookup.phone!==digits(f.elements.phone.value)){lookupCustomer();return;}
    const name=f.elements.customer.value.trim();if(!name){$('[data-direct-error]').textContent='Enter the customer’s name.';return;}
    const t={id:'DC-'+crypto.randomUUID().slice(0,8).toUpperCase(),directCheckout:true,customer:name,phone:lookup.phone,customerType:lookup.existing?'returning':'new',createdAt:new Date().toISOString(),checkedIn:false,status:'draft',lines:[],services:[],tech:'',note:'',checkout:{tip:0,tipType:'fixed',tipSplitMode:demo.load().payment.tipSplit,method:demo.methods().find(m=>m.id!=='split')?.id || 'cash',cash:'',receipt:'none'}};
    records.unshift(t);if(!persist()){records.shift();return;}
    try{localStorage.removeItem(lookupKey);}catch(_){}open(t,'edit');
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-direct-new]'))newCheckout();
    if(e.target.closest('[data-direct-lookup]'))lookupCustomer();
    if(e.target.closest('[data-direct-cancel]')){url();showList();}
    const b=e.target.closest('[data-direct-open]');if(b){const t=records.find(t=>t.id===b.dataset.directOpen);if(t)open(t,t.lines.length?'checkout':'edit');}
  });
  $('[data-direct-search]').addEventListener('input',renderList);$('[data-direct-filter]').addEventListener('change',renderList);
  function restore(){const params=new URLSearchParams(location.search),t=records.find(t=>t.id===params.get('checkoutId'));if(t&&canCheckout())open(t,params.get('mode')==='edit'?'edit':'checkout',true);else showList();}
  window.addEventListener('popstate',restore);
  window.addEventListener('nexora:pos-account-changed',()=>{current=null;url();showList();});
  restore();
})();
