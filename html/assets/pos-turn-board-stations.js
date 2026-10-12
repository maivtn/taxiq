(function () {
  'use strict';
  const stations=window.NEXORA_STATIONS,demo=window.NEXORA_POS_DEMO;
  const originalRender=renderTurnBoard,originalAssign=assignGuestFromBoard;
  function chipFor(tech){
    if(stations.load().settings.mode==='off')return '';
    return stations.load().stations.filter(s=>s.enabled&&s.state!=='free'&&String(s.tech).split(',').map(n=>n.trim()).includes(tech.name)).map(s=>`<span class="pos-station-chip ${s.override?'flagged':''}">${s.override?'⚑ ':''}${s.state==='cleaning'?'🧽 ':''}${demo.esc(s.code)}${s.state==='cleaning'&&stations.load().settings.cleaner==='tech'?' · Next Beep held':''}</span>`).join('');
  }
  const compact=renderCompactBoard,cards=renderCardBoard,grid=renderTurnGrid;
  renderCompactBoard=function(){let html=compact();technicians.forEach(t=>{html=html.replace(' · '+boardEscape(t.name)+'<small>',' · '+boardEscape(t.name)+chipFor(t)+'<small>');});return html;};
  renderCardBoard=function(){let html=cards();technicians.forEach(t=>{html=html.replace(boardEscape(t.name)+' · Level ',boardEscape(t.name)+chipFor(t)+' · Level ');});return html;};
  renderTurnGrid=function(){let html=grid();technicians.forEach(t=>{html=html.replace(' · '+boardEscape(t.name)+'<br>',' · '+boardEscape(t.name)+chipFor(t)+'<br>');});return html;};
  renderTurnBoard=function(){
    const data=stations.load();
    tickets.forEach(t=>{const s=data.stations.find(s=>s.ticketId===String(t.bookingId || t.id)&&['held','occupied'].includes(s.state));if(s){t.stationCode=s.code;t.stationOverride=s.override;}});
    originalRender();
  };
  assignGuestFromBoard=async function(ticketId,index){
    const t=tickets.find(t=>t.id===ticketId),tech=technicians[index];if(!t||!tech)return;
    const gate=stations.gate(tech.name);if(gate){toast('Confirm '+gate.code+' clean before sending the next Beep.');return;}
    try{
      if(stations.load().settings.mode!=='off'){
        const result=await Swal.fire({title:'Review & Send',html:`<p>${demo.esc(t.customer)} · ${demo.esc(tech.name)}</p>${stations.pickerHtml(t)}<p class="pos-muted">Sending this Turn Board demo assignment starts service.</p>`,showCancelButton:true,confirmButtonText:'Review & Send · start demo',customClass:{popup:'pos-swal'},preConfirm:()=>{
          const code=document.querySelector('.swal2-popup [data-pos-station]').value;
          if(!code&&stations.load().settings.mode==='auto'){Swal.showValidationMessage('Select a free station.');return false;}return {code};
        }});
        if(!result.isConfirmed)return;
        if(!canAutoAssign(t)||tech.status!=='available'){toast('Guest or technician changed. Review again.');return;}
        stations.hold(t,result.value.code,tech.name);
      }
      originalAssign(ticketId,index);
      stations.start(t);
      const key='nexora:front-desk-ticket-workspaces:v1',saved=JSON.parse(localStorage.getItem(key)||'{}');
      saved[String(t.bookingId || t.id)]={...saved[String(t.bookingId || t.id)],...t};localStorage.setItem(key,JSON.stringify(saved));
      renderTurnBoard();
    }catch(error){toast(error.message);}
  };
  window.addEventListener('nexora:stations-changed',renderTurnBoard);
  window.addEventListener('storage',e=>{if(e.key==='nexora:front-desk-ticket-workspaces:v1'){
    try{const saved=JSON.parse(e.newValue || '{}');tickets=tickets.map(t=>({...t,...saved[String(t.bookingId || t.id)]})).filter(t=>!t.payment&&!t.cancelled);renderTurnBoard();}catch(_){}
  }});
  try{const saved=JSON.parse(localStorage.getItem('nexora:front-desk-ticket-workspaces:v1') || '{}');tickets=tickets.map(t=>({...t,...saved[String(t.bookingId || t.id)]})).filter(t=>!t.payment&&!t.cancelled);}catch(_){}
  renderTurnBoard();
})();
