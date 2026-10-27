(function () {
  'use strict';
  const stations=window.NEXORA_STATIONS,demo=window.NEXORA_POS_DEMO,data=window.NEXORA_FRONT_DESK_DATA;
  let refreshing=false;
  function refreshShared(){
    try{
      refreshing=true;
      tickets=data.all().filter(data.active);
      const rows=data.technicians();
      rows.forEach(row=>{const tech=technicians.find(tech=>tech.name===row.name);if(tech)Object.assign(tech,row);else technicians.push({...row,codes:row.codes || [],approvedServiceCodes:row.approvedServiceCodes || row.codes || [],turnDetails:row.turnDetails || [],turns:row.turns || row.posProfile?.turns || 0,sales:row.sales || 0,minutes:row.minutes || 0,serviceCount:row.serviceCount || 0,level:row.level || 1,commission:row.commission || .6,dailyIncomeGoal:row.dailyIncomeGoal || 150});});
      technicians.forEach(tech=>{if(!['clocked-out','paused'].includes(tech.status))tech.status=data.statusFor(tech,tickets)==='busy'?'busy':'available';});
      if(!technicians[nextTurnIndex]||technicians[nextTurnIndex].status!=='available')nextTurnIndex=technicians.findIndex(tech=>tech.status==='available');
      renderTurnBoard();
    }catch(error){toast(error.message);}
    finally{refreshing=false;}
  }
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
    const stationData=stations.load();
    tickets.forEach(t=>{const s=stationData.stations.find(s=>s.ticketId===String(t.bookingId || t.id)&&['held','occupied'].includes(s.state));if(s){t.stationCode=s.code;t.stationOverride=s.override;}});
    originalRender();
    if(!refreshing){try{data.saveTechnicians(technicians);}catch(error){toast(error.message);}}
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
      if(t.lines)t.lines.forEach(line=>{if(line.status!=='completed'){line.tech=tech.name;line.status='in-service';}});
      data.save(t);
      renderTurnBoard();
    }catch(error){toast(error.message);}
  };
  window.addEventListener('nexora:stations-changed',renderTurnBoard);
  window.addEventListener('storage',event=>{if(!event.key||Object.values(data.keys).includes(event.key))refreshShared();});
  window.addEventListener('focus',refreshShared);
  refreshShared();
})();
