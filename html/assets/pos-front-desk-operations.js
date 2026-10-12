(function () {
  'use strict';
  const host=document.querySelector('[data-pos-operations]'),tickets=window.NEXORA_FRONT_DESK_TICKETS;
  if(!host||!tickets)return;
  const demo=window.NEXORA_POS_DEMO,stations=window.NEXORA_STATIONS,esc=demo.esc;
  let filter='',selected='';
  function render(){
    const rows=tickets.active().filter(t=>!filter||(stations.assigned(t)?.code || t.stationCode)===filter);
    const guest=rows.find(t=>String(t.id)===String(selected)) || rows[0];selected=guest?.id;
    const lanes=[['waiting','Waiting'],['in-service','In service'],['ready-to-pay','Ready to pay']];
    host.innerHTML=`${demo.sessionHtml()}<div class="pos-operation-head"><div><h2>Today’s Operations</h2><p class="pos-muted">Waiting guests, service progress, and checkout.</p></div><a class="pos-button" href="pos-direct-checkout.html">Direct checkout</a></div>${stations.stripHtml(filter)}${filter?`<div class="pos-filter-line"><span>Showing ${esc(filter)}</span><button type="button" data-pos-clear-filter>Show all guests</button></div>`:''}<div class="pos-operations-layout"><div class="pos-lanes">${lanes.map(([id,label])=>`<section class="pos-lane"><h3>${label} · ${rows.filter(t=>t.status===id).length}</h3>${rows.filter(t=>t.status===id).map(t=>`<button type="button" class="pos-guest" data-pos-guest="${t.id}" aria-pressed="${t===guest}"><strong>#${t.id} · ${esc(t.customer)}</strong><small>${esc(t.tech || 'Not assigned')}</small>${stations.chip(t)}</button>`).join('') || '<p class="pos-muted">No guests</p>'}</section>`).join('')}</div><section class="pos-card pos-selected"><span class="pos-kicker">SELECTED GUEST</span>${guest?`<h3>#${guest.id} · ${esc(guest.customer)}</h3><p>${esc(guest.tech || 'Not assigned')}</p><p>${guest.services.map(esc).join(' · ')}</p>${stations.chip(guest)}${guest.status==='ready-to-pay'?'':stations.pickerHtml(guest)}${guest.status!=='ready-to-pay'&&stations.load().settings.mode!=='off'?`<button type="button" data-pos-hold="${guest.id}">Review & Send station</button>`:''}<div class="pos-actions" style="margin-top:10px"><button type="button" data-pos-open="${guest.id}">Open ticket</button><button type="button" data-pos-checkout="${guest.id}">Checkout</button>${guest.status!=='ready-to-pay'&&stations.load().settings.allowOverride&&stations.load().settings.mode!=='off'?`<button type="button" data-pos-override="${guest.id}">Manager override</button>`:''}</div>`:'<p>No active guest at this station.</p>'}</section></div>`;
  }
  host.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-pos-station-filter')){filter=filter===b.dataset.posStationFilter?'':b.dataset.posStationFilter;render();return;}
    if(b.hasAttribute('data-pos-clear-filter')){filter='';render();return;}
    if(b.hasAttribute('data-pos-guest')){selected=b.dataset.posGuest;render();return;}
    const id=b.dataset.posHold || b.dataset.posOpen || b.dataset.posCheckout || b.dataset.posOverride;
    const t=tickets.active().find(t=>String(t.id)===id);if(!t)return;
    if(b.dataset.posOpen||b.dataset.posCheckout){tickets.open(b.dataset.posCheckout?'checkout':'edit',t);return;}
    try{
      if(b.dataset.posHold){
        if(!t.tech)throw new Error('Assign a technician before Review & Send.');
        const gate=String(t.tech).split(',').map(n=>stations.gate(n.trim())).find(Boolean);
        if(gate)throw new Error('Confirm '+gate.code+' clean before the next Beep.');
        const code=host.querySelector('[data-pos-station]').value;
        stations.hold(t,code,t.tech);tickets.save(t);tickets.feedback('Station held · service Beep queued (demo).');
      }
      if(b.dataset.posOverride){
        const unavailable=stations.load().stations.filter(s=>s.enabled&&['cleaning','blocked'].includes(s.state));
        if(!unavailable.length)throw new Error('No cleaning or blocked station needs an override.');
        const choice=await Swal.fire({title:'Choose station to override',input:'select',inputOptions:Object.fromEntries(unavailable.map(s=>[s.code,s.code+' · '+stations.labels[s.state]])),text:'This station has not been confirmed clean. Approval and a reason are required.',showCancelButton:true,customClass:{popup:'pos-swal'}});
        if(choice.isConfirmed&&await stations.override(t,choice.value,t.tech)){tickets.save(t);tickets.feedback('Station held with manager override · ticket and Beep flagged.');}
      }
    }catch(error){tickets.feedback(error.message);}
  });
  window.addEventListener('nexora:tickets-changed',render);
  window.addEventListener('nexora:stations-changed',render);
  window.addEventListener('nexora:stations-tick',()=>{if(!host.contains(document.activeElement))render();});
  window.addEventListener('nexora:pos-account-changed',render);
  render();
})();
