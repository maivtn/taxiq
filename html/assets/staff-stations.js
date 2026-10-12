(function () {
  'use strict';
  const host=document.querySelector('[data-staff-stations]');if(!host)return;
  const demo=window.NEXORA_POS_DEMO,stations=window.NEXORA_STATIONS,esc=demo.esc,key='nexora:front-desk-ticket-workspaces:v1';
  function workspaces(){try{return JSON.parse(localStorage.getItem(key)||'{}');}catch(_){return {};}}
  function render(){
    const a=demo.account(),cleaner=a.role==='cleaner',tech=a.role==='technician',manager=['owner','manager'].includes(a.role);
    document.body.classList.toggle('pos-cleaner-home',cleaner);
    const data=stations.load(),rows=data.settings.mode==='off'?[]:data.stations.filter(s=>s.enabled&&s.state==='cleaning'&&(!tech||String(s.tech).split(',').map(n=>n.trim()).includes(a.name)));
    const owned=tech?Object.values(workspaces()).filter(t=>!t.payment&&!t.cancelled&&t.lines?.some(l=>String(l.tech || '').split(',').map(n=>n.trim()).includes(a.name))):[];
    host.innerHTML=`${demo.sessionHtml()}<section class="pos-card"><div class="pos-heading"><div><span class="pos-kicker">${manager?'MANAGER':cleaner?'CLEANER':'TECHNICIAN'} HOME</span><h2>${manager?'Needs action':cleaner?'To clean':'Stations to clean'}</h2></div>${manager?'<a class="pos-button" href="pos-salon-settings.html?section=stations">Station settings & log</a>':''}</div>${rows.map(s=>{const overdue=Date.now()>new Date(s.dueAt).getTime();return `<div class="direct-checkout-row"><div><strong>${esc(s.code)} · ${overdue?'Overdue':'Cleaning'}</strong><p>${esc(s.tech || 'Salon Cleaner')}${s.override?' · ⚑ Manager override':''}</p></div><button type="button" data-pos-clean="${esc(s.code)}">${manager?'Confirm on behalf':'Station clean · checklist'}</button>${manager?`<button type="button" data-pos-beep="${esc(s.code)}">Beep cleaner</button>`:''}</div>`;}).join('') || '<p class="pos-muted">No stations awaiting cleaning confirmation.</p>'}${tech&&stations.gate(a.name)?`<p class="pos-warning overdue">Your next Beep is held until ${esc(stations.gate(a.name).code)} is confirmed clean.</p>`:''}</section>${owned.length?`<section class="pos-card"><h3>My POS tickets</h3>${owned.map(t=>`<article class="pos-card"><strong>Ticket #${esc(t.id)} · ${esc(t.customer)}</strong>${stations.chip(t)}${t.lines.filter(l=>String(l.tech || '').split(',').map(n=>n.trim()).includes(a.name)).map(l=>`<div class="direct-checkout-row"><div><strong>${esc(l.name)}</strong><p>${esc(l.status)}</p></div>${l.status!=='completed'?`<button type="button" data-staff-pos-ticket="${esc(t.bookingId || t.id)}" data-staff-pos-line="${esc(l.id)}" data-staff-pos-action="${l.status==='in-service'?'complete':'start'}">${l.status==='in-service'?'Complete':'Start'}</button>`:'<span class="pos-status">Completed</span>'}</div>`).join('')}${t.lines.every(l=>l.status==='completed')?'<p class="pos-muted">Ready for checkout · confirm your station clean to take the next guest.</p>':''}</article>`).join('')}</section>`:''}`;
  }
  host.addEventListener('click',e=>{
    const b=e.target.closest('[data-staff-pos-action]');if(!b)return;
    const a=demo.account(),data=workspaces(),t=data[b.dataset.staffPosTicket],line=t?.lines.find(l=>l.id===b.dataset.staffPosLine);
    if(a.role!=='technician'||!line||!String(line.tech).split(',').map(n=>n.trim()).includes(a.name)||t.payment)return;
    try{
      if(b.dataset.staffPosAction==='start'){
        const gate=stations.gate(a.name);if(gate)throw new Error('Confirm '+gate.code+' clean before the next Beep.');
        stations.start(t);line.status='in-service';t.status='in-service';
      }else if(line.status==='in-service'){
        line.status='completed';line.completedAt=new Date().toISOString();
        if(t.lines.every(l=>l.status==='completed')){t.status='ready-to-pay';stations.release(t,true);}
      }else return;
      localStorage.setItem(key,JSON.stringify(data));render();
    }catch(error){Swal.fire({icon:'info',title:'Service not updated',text:error.message,customClass:{popup:'pos-swal'}});}
  });
  window.addEventListener('nexora:pos-account-changed',()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());render();});
  window.addEventListener('nexora:stations-changed',render);
  window.addEventListener('storage',e=>{if(e.key===key)render();});
  render();
})();
