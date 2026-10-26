/* Turn Board content adapted from the supplied prototype; demo data is local to this page. */
let tickets=[
 {id:7,customer:'Quan',phone:'(555) 012-2807',time:'8:49 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:28},
 {id:9,customer:'Brian',phone:'(555) 016-1092',time:'9:16 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:17},
 {id:1,customer:'DJ',phone:'(555) 019-5421',time:'10:56 AM',status:'in-service',tech:'Chloe',services:['Acrylic with Polish (Full Set)','Paris Pearl Pedicure'],wait:0},
 {id:8,customer:'Leo',phone:'(555) 017-8804',time:'9:07 AM',status:'waiting',tech:'Kayla Bui, Lana VMM',services:['Paris Pearl Pedicure','Eyebrow Waxing','Dipping Powder'],wait:25}
];
const technicians=[
 {name:'Kayla Bui',level:2,status:'available',turns:4,serviceCount:6,sales:180,minutes:205,codes:['PED','GEL','WAX'],commission:.6,dailyIncomeGoal:150,detail:'Available now · Nails & pedicure'},
 {name:'Lana VMM',level:3,status:'available',turns:4,serviceCount:4,sales:430,minutes:278,codes:['ACR-FS','REF','DIP'],commission:.6,dailyIncomeGoal:220,detail:'Available now · All services'},
 {name:'Chloe',level:3,status:'busy',turns:3,serviceCount:5,sales:365,minutes:250,codes:['MANI','GEL','PED'],commission:.6,dailyIncomeGoal:240,detail:'Busy · About 18 min remaining'},
 {name:'Mia',level:1,status:'clocked-out',turns:2,serviceCount:3,sales:155,minutes:120,codes:['MANI','WAX'],commission:.55,dailyIncomeGoal:120,detail:'Clocked out'}
];
function boardEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function boardServiceCode(id){return boardEscape(window.NEXORA_BOARD_SERVICES?.code(id)||id);}
const serviceLabels={PED:'Pedicure',MANI:'Manicure',GEL:'Gel Polish',DIP:'Dipping Powder','ACR-FS':'Acrylic Full Set',REF:'Refill',WAX:'Waxing'};
technicians.forEach(tech=>{tech.approvedServiceCodes=[...new Set(tech.codes)];tech.turnDetails=recordedTurnEntries(tech);});
const normalTickets=structuredClone(tickets),normalTechnicians=structuredClone(technicians);
const staffProfileAudit=[];
let profileReturnIndex=null;
let nextTurnIndex=0,boardMode="compact",editingTechIndex=null,activeFilter="all",addTurnTechIndex=null,addTurnSaving=false,boostTechIndex=null;
const manualTurnAudit=[],turnEditAudit=[];
let editingTurnIndex=null,editingTurnSource=null,editingTurnOriginal=null,editTurnCreditBeforeSkip=null;
function render() {}
function toast(message){document.getElementById("toast").textContent=message;}
function buildPeakHourData(){const firstNames=['Kayla','Lana','Chloe','Mia','HUU','Michael','Julie','Amy','Jessica','Cindy','Kim','Anna','Tina','Nancy','Rose','Linda','Jenny','Kelly','Tracy','Helen','Mai','Vy','Tammy','Diana','Sophia'],services=['Deluxe Pedicure','Dipping Powder','Gel Manicure','Acrylic Full Set','Express Pedicure','Eyebrow Waxing'],codes=['PED','DIP','GEL','ACR-FS','MANI','WAX'];const names=Array.from({length:50},(_,index)=>`${firstNames[index%firstNames.length]} ${index<25?'A':'B'}`);const technicians=names.map((name,index)=>{const status=index%11===0?'clocked-out':index%7===0?'paused':index%3===0?'busy':'available';return{name,level:index%3+1,status,turns:index%6,serviceCount:index%8+1,sales:80+index*18,minutes:45+index*11,codes:Array.from({length:index%5+1},(_,slot)=>codes[(index+slot)%codes.length]),commission:.6,dailyIncomeGoal:250+(index%4)*50,detail:status==='available'?'Available now · Mixed services':status==='busy'?'Busy · About 20 min remaining':status==='paused'?'Paused':'Clocked out'};});const guestNames=['Sophia','Emma','Olivia','Ava','Isabella','Mia','Luna','Camila','Harper','Ella','Grace','Lily'];const tickets=Array.from({length:36},(_,index)=>({id:200+index,customer:`${guestNames[index%guestNames.length]} ${index+1}`,phone:`(555) 020-${String(3000+index).slice(-4)}`,time:`${10+Math.floor(index/12)}:${String((index%12)*5).padStart(2,'0')} AM`,status:'waiting',tech:'',services:[services[index%services.length]],wait:8+index*2,isNew:index%3===0,requiredLevel:index%5===0?2:1}));return{technicians,tickets};}
function setDemoMode(mode){const data=mode==='peak'?buildPeakHourData():{technicians:normalTechnicians,tickets:normalTickets};tickets=data.tickets.map(item=>({...item}));technicians.splice(0,technicians.length,...data.technicians.map(item=>({...item,codes:[...item.codes],approvedServiceCodes:[...(item.approvedServiceCodes||item.codes)],turnDetails:recordedTurnEntries(item)})));nextTurnIndex=0;activeFilter='all';render();renderTurnBoard();toast(mode==='peak'?'Large Salon Demo loaded: 50 technicians and 36 waiting guests':'Normal Data restored');}
function canAutoAssign(ticket){return ticket.status==='waiting'&&!ticket.tech&&Array.isArray(ticket.services)&&ticket.services.length>0;}
function rotationPositionMap(techs,startIndex){const positions=new Map(),count=techs.length;let position=1;for(let offset=0;offset<count;offset++){const index=(Math.max(0,startIndex)+offset)%count;if(techs[index].status==='available'||techs[index].status==='busy')positions.set(index,position++);}return positions;}
function orderedTechs(){const positions=rotationPositionMap(technicians,nextTurnIndex);return technicians.map((tech,index)=>({tech,index,rotation:positions.get(index)||null})).sort((a,b)=>a.rotation&&b.rotation?a.rotation-b.rotation:a.rotation?-1:b.rotation?1:a.index-b.index);}
function advanceTurn(){const available=technicians.map((t,i)=>({t,i})).filter(x=>x.t.status==='available'&&x.i!==nextTurnIndex);nextTurnIndex=available.length?available[0].i:(nextTurnIndex+1)%technicians.length;}
function activeCustomerFor(name){return tickets.find(t=>t.status==='in-service'&&t.tech.includes(name));}
function workloadScore(tech){return tech.minutes*.45+tech.sales*.35+tech.serviceCount*8;}
function balanceRecommendation(tech){const active=technicians.filter(t=>t.status!=='clocked-out'),average=active.reduce((sum,t)=>sum+workloadScore(t),0)/active.length,gap=Math.round(average-workloadScore(tech));return gap>55?{show:true,text:`Recommended for balance · workload is ${gap} points below team average`}:{show:false,text:''};}
function goalProgress(tech){const serviceTotal=tech.sales,percent=Math.min(100,Math.round(serviceTotal/tech.dailyIncomeGoal*100)),remaining=Math.max(0,tech.dailyIncomeGoal-serviceTotal),requiredSales=tech.dailyIncomeGoal,status=percent>=100?'Goal Reached':percent>=80?'On Track':'Needs Opportunity';return{serviceTotal,percent,remaining,requiredSales,status};}
function setBoardMode(mode){boardMode=mode;['compact','cards','grid'].forEach(m=>document.getElementById('mode-'+m).classList.toggle('active',m===mode));renderTurnBoard();}
function approvedServiceCodes(tech){return tech.approvedServiceCodes||[...new Set(tech.codes)];}
function visibleTechs(){const q=(document.getElementById('tech-search').value||'').toLowerCase(),status=document.getElementById('tech-status-filter').value;return orderedTechs().filter(x=>(status==='all'||x.tech.status===status)&&(x.tech.name.toLowerCase().includes(q)||approvedServiceCodes(x.tech).some(code=>(serviceLabels[code]||code).toLowerCase().includes(q))));}
function renderCompactBoard(){return `<div class="compact-board"><div class="compact-row header"><div>Turn order / Technician</div><div>Status</div><div>Turns</div><div>Services</div><div>Service Total</div><div>Goal</div><div>Today / Action</div></div>${visibleTechs().map(({tech,index,rotation})=>{const g=goalProgress(tech);return `<div class="compact-row"><div class="compact-tech">${rotation?`#${rotation}${rotation===1&&index===nextTurnIndex?' NEXT':''}`:'—'} · ${boardEscape(tech.name)}<small>Level ${tech.level}</small></div><div>${tech.status}</div><div>${tech.turns}T</div><div>${tech.serviceCount}</div><div><strong>$${tech.sales}</strong></div><div>${g.percent}%<div class="mini-progress"><span style="width:${g.percent}%"></span></div></div><div>${tech.codes.map(boardServiceCode).join(' · ')} ${tech.status==='clocked-out'?`<button class="action" onclick="checkInBoardTech(${index})">Check in</button>`:''} <button class="action" onclick="openEditTurn(${index})">Edit Turn</button></div></div>`}).join('')}</div>`;}
function turnGridColumnCount(){return Math.max(12,...technicians.map(tech=>(tech.codes?.length||0)+1));}
function renderTurnGrid(){const columnCount=turnGridColumnCount(),columns=Array.from({length:columnCount},(_,index)=>index);return `<div class="turn-grid-wrap"><table class="turn-grid"><tr><th>Turn / Technician</th>${columns.map(n=>`<th>${n+1}</th>`).join('')}</tr>${visibleTechs().map(({tech,index,rotation})=>`<tr><th>${rotation?`#${rotation}${rotation===1&&index===nextTurnIndex?' NEXT':''}`:'—'} · ${boardEscape(tech.name)}<br>${tech.turns}T · $${tech.sales}${tech.status==='clocked-out'?`<button class="grid-check-in" onclick="checkInBoardTech(${index})">Check in</button>`:''}</th>${columns.map((n)=>{const detail=tech.turnDetails?.[n];return n<tech.codes.length?`<td class="turn-cell ${detail?.action==='skip'?'skip':'done'}"><button onclick="openEditTurn(${index},${n})">${boardServiceCode(tech.codes[n])}<br>${detail&&!detail.seeded?`$${detail.amount} · +${detail.credit}T`:`+${recordedTurnEntry(tech,n).credit}T`}</button></td>`:n===tech.codes.length?`<td class="turn-cell add-turn-cell"><button onclick="openAddTurn(${index})">＋ Add Turn</button></td>`:`<td class="turn-cell"></td>`}).join('')}</tr>`).join('')}</table></div>`;}
function renderCardBoard(){return visibleTechs().map(({tech,index,rotation})=>{const customer=activeCustomerFor(tech.name),isNext=rotation===1&&index===nextTurnIndex,label=rotation?`<span class="${isNext?'next-turn':'up-next'}">#${rotation}${isNext?' NEXT':''}</span>`:'',balance=balanceRecommendation(tech),goal=goalProgress(tech),codes=tech.codes.map(code=>`<abbr title="${boardEscape(serviceLabels[code])}">${boardServiceCode(code)}</abbr>`).join(''),goalClass=goal.percent>=100?'reached':goal.percent>=80?'on-track':'';return `<article class="board-card ${isNext?'current':''}"><div class="tech-avatar">${boardEscape(tech.name.slice(0,2))}</div><div><div class="board-name">${boardEscape(tech.name)} · Level ${tech.level}${label}</div><div class="board-status">${tech.status}</div>${customer?`<div class="board-customer">Serving <strong>${boardEscape(customer.customer)}</strong>${customer.location?`<br>📍 <strong>${boardEscape(customer.location)}</strong>`:''}${customer.techNote?`<br>📝 ${boardEscape(customer.techNote)}`:''}</div>`:''}</div><div class="availability">${tech.status.toUpperCase()}</div><div class="workload-metrics"><div class="metric"><span>Turns</span><strong>${tech.turns}</strong></div><div class="metric"><span>Services</span><strong>${tech.serviceCount}</strong></div><div class="metric"><span>Service Total</span><strong>$${tech.sales}</strong></div><div class="metric"><span>Working Time</span><strong>${tech.minutes}m</strong></div></div><div class="goal-card"><div class="goal-line"><strong>Goal Progress · ${goal.percent}%</strong><span>${goal.status}</span></div><div class="goal-track"><div class="goal-fill ${goalClass}" style="width:${goal.percent}%"></div></div><div class="goal-meta"><span>Service Total $${goal.serviceTotal} / Daily Goal $${tech.dailyIncomeGoal}</span><span>$${goal.remaining} remaining</span></div></div><div class="service-codes">Today: ${codes}</div>${balance.show?`<div class="makeup"><strong>MAKE-UP RECOMMENDED</strong>${balance.text}</div>`:''}<div class="board-actions">${tech.status==='clocked-out'?`<button class="action main" onclick="checkInBoardTech(${index})">Check in</button>`:`<button class="action main" onclick="openNextGuest(${index})">Assign Guest</button>`}<button class="action" onclick="skipTurn(${index})">Skip Turn</button><button class="action" onclick="togglePause(${index})">Pause</button><button class="action" onclick="openEditTurn(${index})">Edit Turn</button>${goal.percent<100?`<button class="action" onclick="openBoost(${index})">Boost This Technician</button>`:''}</div></article>`}).join('');}
// The spotlight follows the same rotation as the board; it never advances that rotation.
function turnSpotlightQueue(techs,rotationOrder,limit=10){
 return rotationOrder.map(index=>({tech:techs[index],index}))
  .filter(row=>row.tech&&['available','busy'].includes(row.tech.status))
  .slice(0,limit).map((row,index)=>({...row,position:index+1}));
}
function renderTurnSpotlight(waitingCount){
 const rotationOrder=orderedTechs().filter(row=>row.rotation).map(row=>row.index);
 const queue=turnSpotlightQueue(technicians,rotationOrder),tech=technicians[nextTurnIndex];
 const current=tech?.status==='available'?tech:null;
 document.getElementById('next-tech-card').classList.toggle('is-empty',!current);
 document.getElementById('next-tech-avatar').textContent=current?current.name.trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2):'—';
 document.getElementById('next-turn-name').textContent=current?current.name:technicians.length?'No available technician':'No technicians';
 document.getElementById('next-tech-status').textContent=current?`${current.status} · Level ${current.level}`:'Waiting for availability';
 const metrics=document.getElementById('next-tech-metrics'),services=document.getElementById('next-tech-services'),goalCopy=document.getElementById('next-tech-goal');
 if(current){
  const goal=goalProgress(current);
  metrics.innerHTML=`<div class="next-tech-metric"><span>Turns</span><strong>${current.turns}T</strong></div><div class="next-tech-metric"><span>Services</span><strong>${current.serviceCount}</strong></div><div class="next-tech-metric"><span>Service Total</span><strong>$${current.sales}</strong></div><div class="next-tech-metric"><span>Goal</span><strong>${goal.percent}%</strong></div>`;
  services.innerHTML=`Can perform: <strong>${approvedServiceCodes(current).map(boardServiceCode).join(' · ')||'—'}</strong>`;
  goalCopy.textContent=`$${goal.serviceTotal} / $${current.dailyIncomeGoal} goal`;
 }else{metrics.replaceChildren();services.replaceChildren();goalCopy.textContent='';}
 document.getElementById('assign-next-guest').disabled=!current||!tickets.some(canAutoAssign);
 document.getElementById('view-next-technician').disabled=!current;
 document.getElementById('turn-waiting-copy').textContent=`${waitingCount} guests waiting · showing ${queue.length} upcoming technicians`;
 document.getElementById('next-turn-queue').innerHTML=queue.filter(row=>row.index!==nextTurnIndex).map(row=>`<button type="button" class="next-queue-card status-${row.tech.status}" data-tech-index="${row.index}" onclick="openTechnicianProfile(${row.index})"><span class="next-queue-rank">#${row.position}</span><span><strong>${boardEscape(row.tech.name)}</strong><small>Level ${row.tech.level} · ${row.tech.turns}T · $${row.tech.sales}</small></span><span class="next-queue-state">${row.tech.status.toUpperCase()}</span></button>`).join('')||'<div class="next-queue-card queue-empty"><div><strong>No additional technicians</strong><small>Waiting for availability</small></div></div>';
}
function openTechnicianProfile(index){
 if(!technicians[index])return;
 profileReturnIndex=index;
 const select=document.getElementById('staff-select');
 select.replaceChildren(...technicians.map((tech,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=tech.name;return option;}));
 select.value=String(index);loadStaffProfile();
 document.getElementById('turnboard-view').hidden=true;
 document.getElementById('staff-view').hidden=false;
 document.getElementById('staff-view-title').focus();
}
function viewNextTechnician(){openTechnicianProfile(nextTurnIndex);}
function closeTechnicianProfile(){
 document.getElementById('staff-view').hidden=true;
 document.getElementById('turnboard-view').hidden=false;
 renderTurnBoard();
 const target=profileReturnIndex===nextTurnIndex?document.getElementById('view-next-technician'):document.querySelector(`#next-turn-queue [data-tech-index="${profileReturnIndex}"]`);
 (target||document.getElementById('view-next-technician')).focus();
}
function loadStaffProfile(){
 const tech=technicians[Number(document.getElementById('staff-select').value)];
 if(!tech){closeTechnicianProfile();return;}
 document.getElementById('staff-profile-name').textContent=tech.name;
 document.getElementById('staff-profile-status').textContent=`${tech.status} · ${tech.turns} turns today`;
 document.getElementById('staff-level').value=String(tech.level);
 document.getElementById('staff-change-reason').value='';
 document.getElementById('staff-skill-grid').innerHTML=Object.entries(serviceLabels).map(([code,label])=>`<label class="rule-box staff-skill"><input type="checkbox" name="staff-skill" value="${boardEscape(code)}" ${approvedServiceCodes(tech).includes(code)?'checked':''}><span><strong>${boardServiceCode(code)}</strong><br><small>${boardEscape(label)}</small></span></label>`).join('');
 renderStaffAudit();
}
function renderStaffAudit(){
 document.getElementById('staff-audit-log').innerHTML=staffProfileAudit.length?staffProfileAudit.slice().reverse().map(item=>`<div class="ledger-row"><span>${new Date(item.at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span><strong>${boardEscape(item.technician)}</strong><span>Level ${item.previousLevel} → ${item.newLevel}</span><span>${boardEscape(item.reason)} · ${boardEscape(item.by)}</span></div>`).join(''):'<p class="hint">No changes in this prototype session.</p>';
}
function saveStaffProfile(){
 const reason=document.getElementById('staff-change-reason').value.trim();
 if(!reason){toast('A reason is required to change technician access');return;}
 const tech=technicians[Number(document.getElementById('staff-select').value)];
 if(!tech)return;
 const level=Number(document.getElementById('staff-level').value),codes=[...document.querySelectorAll('input[name="staff-skill"]:checked')].map(input=>input.value);
 if(![1,2,3].includes(level))return;
 staffProfileAudit.push({technician:tech.name,previousLevel:tech.level,newLevel:level,previousCodes:[...approvedServiceCodes(tech)],newCodes:[...codes],reason,by:'Manager · BI',at:new Date().toISOString()});
 // Approved skills are independent of today's recorded service cells and turn credits.
 tech.level=level;tech.approvedServiceCodes=codes;
 loadStaffProfile();renderTurnBoard();toast(`${tech.name} skills and level updated · turn unchanged`);
}
function renderTurnBoard(){
 if(nextTurnIndex<0||technicians[nextTurnIndex]?.status!=='available')advanceTurn();
 const waiting=tickets.filter(t=>t.status==='waiting'&&!t.tech),available=technicians.filter(t=>t.status==='available').length,busy=technicians.filter(t=>t.status==='busy'||t.status==='paused').length;
 document.getElementById('stat-total-techs').textContent=technicians.length;
 document.getElementById('stat-available-techs').textContent=available;
 document.getElementById('stat-busy-techs').textContent=busy;
 document.getElementById('stat-waiting-guests').textContent=waiting.length;
 renderTurnSpotlight(waiting.length);
 const board=document.getElementById('turn-board-grid');
 board.className=boardMode==='cards'?'board-grid':'';
 board.innerHTML=!technicians.length?'<div class="board-empty"><strong>No technicians</strong><p>Load sample data from Board menu to try the salon workflow.</p><button class="btn" onclick="requestBoardChange(\'sample\')">Load sample data</button></div>':boardMode==='compact'?renderCompactBoard():boardMode==='grid'?renderTurnGrid():renderCardBoard();
}
// Seeded historical cells retain the weights in effect when the demo records were created.
function demoRecordedTurnCredit(amount){return amount<30?.5:amount<70?1:amount<110?1.5:2;}
function saveTurnRules(){document.getElementById('turn-rules-modal').classList.remove('show');toast('Weighted turn rules saved');}
// Keep sample cells within the row totals, then freeze their values before edits.
function recordedTurnEntries(tech){
 const known=(tech.turnDetails||[]).slice(0,tech.codes.length).filter(Boolean);
 let creditLeft=Math.max(0,tech.turns-known.reduce((sum,entry)=>sum+entry.credit,0));
 let amountLeft=Math.max(0,tech.sales-known.reduce((sum,entry)=>sum+entry.amount,0));
 let countLeft=Math.max(0,tech.serviceCount-known.reduce((sum,entry)=>sum+(entry.serviceCount??1),0));
 return tech.codes.map((code,index)=>{
  const detail=tech.turnDetails?.[index];
  if(detail)return {...detail,code,serviceCount:detail.serviceCount??1};
  const amount=Math.min(30+index*18,amountLeft),credit=Math.min(demoRecordedTurnCredit(30+index*18),creditLeft),serviceCount=Math.min(1,countLeft);
  creditLeft=+(creditLeft-credit).toFixed(4);amountLeft=+(amountLeft-amount).toFixed(2);countLeft-=serviceCount;
  return {code,amount,credit,serviceCount,seeded:true};
 });
}
function recordedTurnEntry(tech,index){return recordedTurnEntries(tech)[index];}
function openEditTurn(index,turnIndex){
 const tech=technicians[index],slot=turnIndex??((tech?.codes.length||0)-1);
 if(!tech||!Number.isInteger(slot)||slot<0||slot>=tech.codes.length)return;
 editingTechIndex=index;editingTurnIndex=slot;editingTurnSource=tech;editingTurnOriginal=recordedTurnEntry(tech,slot);
 editTurnCreditBeforeSkip=null;
 document.getElementById('edit-turn-copy').textContent=`Edit ${tech.name}'s turn credit`;
 document.getElementById('edit-turn-preview').textContent=`${window.NEXORA_BOARD_SERVICES?.code(editingTurnOriginal.code)||editingTurnOriginal.code} · #${slot+1} · $${editingTurnOriginal.amount.toFixed(2)} · +${editingTurnOriginal.credit}T`;
 const credit=document.getElementById('edit-turn-credit');
 const credits=[...new Set([0,0.5,1,1.5,2,...window.NEXORA_TURN_SETTINGS.load().serviceWeights,editingTurnOriginal.credit])].sort((a,b)=>a-b);
 credit.replaceChildren(...credits.map(value=>{const option=document.createElement('option');option.value=String(value);option.textContent=String(value);return option;}));
 credit.value=String(editingTurnOriginal.credit);credit.disabled=false;
 const target=document.getElementById('edit-turn-tech');
 target.replaceChildren(...technicians.flatMap((item,i)=>{
  if(i===index)return [];
  const option=document.createElement('option');option.value=String(i);option.textContent=item.name;return [option];
 }));
 target.selectedIndex=-1;
 document.getElementById('edit-turn-action').value='adjust';
 document.getElementById('edit-turn-action').querySelector('[value="move"]').disabled=technicians.length<2;
 document.getElementById('edit-turn-reason').value='';
 document.getElementById('edit-turn-error').textContent='';
 document.getElementById('edit-turn-save').disabled=false;
 updateEditTurnAction();
 document.getElementById('edit-turn-modal').classList.add('show');credit.focus();
}
function updateEditTurnAction(){
 const action=document.getElementById('edit-turn-action').value,credit=document.getElementById('edit-turn-credit');
 document.getElementById('edit-turn-tech-field').hidden=action!=='move';
 document.getElementById('edit-turn-tech').disabled=action!=='move';
 if(action==='skip'){
  if(!credit.disabled)editTurnCreditBeforeSkip=credit.value;
  credit.value='0';credit.disabled=true;
 }else{
  if(credit.disabled&&editTurnCreditBeforeSkip!==null)credit.value=editTurnCreditBeforeSkip;
  credit.disabled=false;
 }
 document.getElementById('edit-turn-error').textContent='';
}
function closeEditTurn(){
 document.getElementById('edit-turn-modal').classList.remove('show');
 const techIndex=editingTechIndex,turnIndex=editingTurnIndex;
 editingTechIndex=null;editingTurnIndex=null;editingTurnSource=null;editingTurnOriginal=null;
 document.querySelector(`#turn-board-grid button[onclick="openEditTurn(${techIndex},${turnIndex})"]`)?.focus();
}
function saveTurnEdit(){
 const modal=document.getElementById('edit-turn-modal');
 if(!modal.classList.contains('show')||editingTechIndex===null||editingTurnIndex===null)return;
 const tech=technicians[editingTechIndex],slot=editingTurnIndex,original=editingTurnOriginal;
 if(!tech||tech!==editingTurnSource||tech.codes[slot]!==original.code){closeEditTurn();return;}
 const current=recordedTurnEntry(tech,slot);
 if(current.credit!==original.credit||current.amount!==original.amount){closeEditTurn();return;}
 const reason=document.getElementById('edit-turn-reason').value.trim(),error=document.getElementById('edit-turn-error');
 if(!reason){error.textContent='Audit reason is required';document.getElementById('edit-turn-reason').focus();return;}
 const action=document.getElementById('edit-turn-action').value,creditInput=document.getElementById('edit-turn-credit');
 const value=action==='skip'?0:Number(creditInput.value);
 if(!['adjust','move','skip'].includes(action)||creditInput.value===''||!Number.isFinite(value)||value<0){error.textContent='Valid turn credit and an audit reason are required.';return;}
 const targetInput=document.getElementById('edit-turn-tech'),targetIndex=Number(targetInput.value),target=technicians[targetIndex];
 if(action==='move'&&(!targetInput.value||!target||target===tech)){
  error.textContent='Move to another tech';targetInput.focus();return;
 }
 if(action==='adjust'&&value===current.credit){closeEditTurn();return;}
 document.getElementById('edit-turn-save').disabled=true;
 const at=new Date().toISOString(),previousTotal=tech.turns;
 const nextTotal=+(tech.turns-current.credit+(action==='move'?0:value)).toFixed(4);
 if(nextTotal<0||(action==='move'&&(tech.sales<current.amount||tech.serviceCount<current.serviceCount))){
  document.getElementById('edit-turn-save').disabled=false;error.textContent='Valid turn credit and an audit reason are required.';return;
 }
 const entry={...current,credit:value,action,reason,seeded:false,updatedAt:at,updatedBy:'Manager'};
 // Freeze the existing cells before a move changes their column positions.
 tech.turnDetails=recordedTurnEntries(tech);
 if(action==='move'){
  const targetPreviousTotal=target.turns;
  target.turnDetails=recordedTurnEntries(target);
  tech.codes.splice(slot,1);tech.turnDetails.splice(slot,1);
  target.codes.push(entry.code);target.turnDetails.push(entry);
  tech.turns=nextTotal;
  target.turns=+(target.turns+value).toFixed(4);
  const serviceCount=current.serviceCount,amount=current.amount;
  tech.serviceCount-=serviceCount;target.serviceCount+=serviceCount;
  tech.sales=+(tech.sales-amount).toFixed(2);target.sales=+(target.sales+amount).toFixed(2);
  turnEditAudit.push({technician:tech.name,to:target.name,turnIndex:slot,serviceCode:entry.code,amount:current.amount,action,previous:current.credit,value,previousTotal,total:tech.turns,targetPreviousTotal,targetTotal:target.turns,reason,by:'Manager',at});
 }else{
  tech.turnDetails[slot]=entry;
  tech.turns=nextTotal;
  turnEditAudit.push({technician:tech.name,turnIndex:slot,serviceCode:entry.code,amount:current.amount,action,previous:current.credit,value,previousTotal,total:tech.turns,reason,by:'Manager',at});
 }
 renderTurnBoard();closeEditTurn();toast('Turn updated and audit log saved');
}
function createManualTurnEntry(code,amount,reason,creditCalculator){return{code,amount:+amount,credit:creditCalculator(+amount),reason,createdAt:new Date().toISOString(),createdBy:'Manager'};}
function openAddTurn(index){addTurnTechIndex=index;addTurnSaving=false;document.getElementById('add-turn-copy').textContent=`Add a missing turn for ${technicians[index].name}`;document.getElementById('add-turn-service').value='PED';document.getElementById('add-turn-amount').value='45';document.getElementById('add-turn-reason').value='';document.getElementById('add-turn-save').disabled=false;updateAddTurnPreview();document.getElementById('add-turn-modal').classList.add('show');}
function closeAddTurn(){document.getElementById('add-turn-modal').classList.remove('show');addTurnTechIndex=null;addTurnSaving=false;}
function updateAddTurnPreview(){const amount=+document.getElementById('add-turn-amount').value||0,credit=calculateTurnCredit(amount);document.getElementById('add-turn-credit').value=String(credit);document.getElementById('add-turn-preview').textContent=`$${amount.toFixed(2)} service · ${credit} turn${credit===1?'':'s'}`;}
function saveAddedTurn(){if(addTurnSaving||addTurnTechIndex===null)return;const amount=window.NEXORA_TURN_SETTINGS.numberFrom(document.getElementById('add-turn-amount')),reason=document.getElementById('add-turn-reason').value.trim();if(!Number.isFinite(amount)||amount<0||!reason){toast('Service amount and audit reason are required');return}const credit=window.NEXORA_TURN_SETTINGS.numberFrom(document.getElementById('add-turn-credit'));if(!Number.isFinite(credit)||credit<0){toast('Enter a non-negative turn credit.');return}addTurnSaving=true;document.getElementById('add-turn-save').disabled=true;const tech=technicians[addTurnTechIndex],entry=createManualTurnEntry(document.getElementById('add-turn-service').value,amount,reason,()=>+document.getElementById('add-turn-credit').value);tech.codes.push(entry.code);tech.turnDetails=tech.turnDetails||[];while(tech.turnDetails.length<tech.codes.length-1)tech.turnDetails.push(null);tech.turnDetails.push(entry);tech.turns=+(tech.turns+entry.credit).toFixed(4);tech.serviceCount+=1;tech.sales=+(tech.sales+entry.amount).toFixed(2);manualTurnAudit.push({...entry,technician:tech.name});const name=tech.name;closeAddTurn();renderTurnBoard();toast(`Turn added for ${name} · +${entry.credit}T · $${entry.amount}`);}
function openBoost(index){boostTechIndex=index;const tech=technicians[index],goal=goalProgress(tech);document.getElementById('boost-copy').textContent=`${tech.name} is at ${goal.percent}% of today's manager-set goal.`;document.getElementById('boost-suggestion').textContent=`$10 off Gel Pedicure with ${tech.name} until 5 PM`;document.getElementById('boost-reason').textContent=`$${goal.remaining} estimated income remaining · suggested from eligible services`;document.getElementById('boost-modal').classList.add('show');}
function closeBoost(){boostTechIndex=null;document.getElementById('boost-modal').classList.remove('show');}
function launchBoost(){const tech=technicians[boostTechIndex],service=document.getElementById('boost-service').value,discount=document.getElementById('boost-discount').value;closeBoost();toast(`${discount} ${service} promotion launched for ${tech.name}`);}
function skipTurn(index){const tech=technicians[index];if(!tech||tech.status!=='available'){toast('Choose an available technician to skip.');return}if(index===nextTurnIndex)advanceTurn();renderTurnBoard();toast(`${tech.name} skipped. Next turn: ${technicians[nextTurnIndex]?.name||'No available technician'}`);}
function togglePause(index){const tech=technicians[index];tech.status=tech.status==='paused'?'available':'paused';if(index===nextTurnIndex&&tech.status==='paused')advanceTurn();renderTurnBoard();toast(`${tech.name} ${tech.status==='paused'?'paused':'returned to rotation'}`);}
function openNextGuest(index=nextTurnIndex){const waiting=tickets.filter(canAutoAssign);const tech=technicians[index];document.getElementById('guest-picker-tech').textContent=tech.name;document.getElementById('guest-options').innerHTML=waiting.length?waiting.map(t=>`<button class="guest-choice" onclick="assignGuestFromBoard(${t.id},${index})"><strong>#${t.id} ${boardEscape(t.customer)}</strong><span>${boardEscape(t.services[0])} · waiting ${t.wait} min</span></button>`).join(''):'<div class="empty">No service-ready guests are waiting for assignment.</div>';document.getElementById('guest-picker').classList.add('show');}
function closeGuestPicker(){document.getElementById('guest-picker').classList.remove('show');}
function assignGuestFromBoard(ticketId,index){const ticket=tickets.find(t=>t.id===ticketId),tech=technicians[index];ticket.tech=tech.name;ticket.status='in-service';tech.turns+=1;if(index===nextTurnIndex)advanceTurn();closeGuestPicker();renderTurnBoard();render();toast(`${tech.name} assigned to ${ticket.customer}`);}
// Keep availability and rotation consistent when assigning or pausing technicians.
function advanceTurn(){
 for(let step=1;step<=technicians.length;step++){
  const i=(nextTurnIndex+step+technicians.length)%technicians.length;
  if(technicians[i].status==='available'){nextTurnIndex=i;return;}
 }
 nextTurnIndex=-1;
}
const sourceOpenNextGuest=openNextGuest;
openNextGuest=function(index=nextTurnIndex){
 if(!technicians[index]||technicians[index].status!=='available'){toast('Choose an available technician.');return;}
 sourceOpenNextGuest(index);
};
assignGuestFromBoard=function(ticketId,index){
 const ticket=tickets.find(t=>t.id===ticketId),tech=technicians[index];
 if(!ticket||!canAutoAssign(ticket)||!tech||tech.status!=='available'){toast('This guest or technician is no longer available.');return;}
 ticket.tech=tech.name;ticket.status='in-service';tech.status='busy';
 if(ticket.boardServices?.length){
  const entries=ticket.boardServices.map(service=>({...createManualTurnEntry(service.id,service.amount,'Demo guest assignment',calculateTurnCredit),createdBy:'Front Desk',ticketId:ticket.id}));
  tech.turnDetails=tech.turnDetails||[];
  while(tech.turnDetails.length<tech.codes.length)tech.turnDetails.push(null);
  tech.codes.push(...entries.map(entry=>entry.code));tech.turnDetails.push(...entries);
  tech.turns=+(tech.turns+entries.reduce((sum,entry)=>sum+entry.credit,0)).toFixed(4);
  tech.sales=+(tech.sales+entries.reduce((sum,entry)=>sum+entry.amount,0)).toFixed(2);
  tech.serviceCount+=entries.length;
 }else tech.turns+=1;
 if(index===nextTurnIndex)advanceTurn();closeGuestPicker();renderTurnBoard();toast(tech.name+' assigned to '+ticket.customer);
};
togglePause=function(index){
 const tech=technicians[index];
 if(!['available','paused'].includes(tech.status)){toast('Only available or paused technicians can change pause status.');return;}
 tech.status=tech.status==='paused'?'available':'paused';if(index===nextTurnIndex&&tech.status==='paused')advanceTurn();renderTurnBoard();
};
function renderTurnRuleRows(weights,upperBounds){
 const rows=document.getElementById('turn-rules-rows');
 let focusedColumn=null,focusedIndex=0;
 if(rows.children.length!==weights.length){
  const active=document.activeElement;
  if(rows.contains(active)){
   focusedColumn=['data-service-upper-bound','data-service-weight','data-remove-service-range'].find(attribute=>active.hasAttribute(attribute));
   if(focusedColumn)focusedIndex=Number(active.getAttribute(focusedColumn));
  }
  rows.innerHTML=weights.map((_,index)=>{
   const number=index+1,last=index===weights.length-1;
   const start=index?`<output data-service-range-start="${index-1}"></output>`:'<span class="turn-range-fixed">$0.00</span>';
   const limit=last?'<span class="turn-range-unlimited"><i data-lucide="infinity" aria-hidden="true"></i>No limit</span>':`<div class="turn-amount-input"><span aria-hidden="true">$</span><input aria-label="Range ${number} Up to amount" aria-describedby="turn-range-help turn-rules-error" data-service-upper-bound="${index}" type="number" min="0" step="0.01" required placeholder="0.00" inputmode="decimal"></div>`;
   return `<tr><th scope="row"><span class="turn-range-number">${number}</span></th><td>${start}</td><td>${limit}</td><td><div class="turn-credit-input"><input aria-label="Range ${number} turn credit" data-service-weight="${index}" type="number" min="0" step="any" required inputmode="decimal"><span aria-hidden="true">turns</span></div></td><td><button type="button" class="turn-range-remove" data-remove-service-range="${index}" aria-label="Remove range ${number}" title="Remove range ${number}" ${weights.length===1?'disabled':''}><i data-lucide="x" aria-hidden="true"></i></button></td></tr>`;
  }).join('');
  if(window.lucide)window.lucide.createIcons();
 }
 rows.querySelectorAll('[data-service-weight]').forEach((input,index)=>{input.value=weights[index];});
 rows.querySelectorAll('[data-service-upper-bound]').forEach((input,index)=>{input.value=upperBounds[index];});
 document.getElementById('turn-rules-count').textContent=weights.length+' range'+(weights.length===1?'':'s');
 if(focusedColumn){
  const controls=rows.querySelectorAll('['+focusedColumn+']');
  const target=controls[Math.min(focusedIndex,controls.length-1)];
  (target&&!target.disabled?target:rows.querySelectorAll('[data-service-weight]')[Math.min(focusedIndex,weights.length-1)]).focus();
 }
}
function fillTurnRules(settings) {
 document.getElementById('booking-turn-credit').value=settings.bookingTurnCredit;
 renderTurnRuleRows(settings.serviceWeights,settings.serviceThresholds.map(amount=>((Math.round(amount*100)-1)/100).toFixed(2)));
 updateTurnRuleRanges();
}
function readTurnRuleRows(){
 return {
  weights:[...document.querySelectorAll('[data-service-weight]')].map(input=>input.value),
  upperBounds:[...document.querySelectorAll('[data-service-upper-bound]')].map(input=>input.value)
 };
}
function addTurnRuleRange(){
 const draft=readTurnRuleRows();
 const lastCredit=window.NEXORA_TURN_SETTINGS.numberFrom(document.querySelectorAll('[data-service-weight]').item(draft.weights.length-1));
 draft.upperBounds.push('');
 draft.weights.push(Number.isFinite(lastCredit)&&lastCredit>=0?Number((lastCredit+0.5).toPrecision(15)):'');
 renderTurnRuleRows(draft.weights,draft.upperBounds);
 updateTurnRuleRanges();
 document.querySelectorAll('[data-service-upper-bound]').item(draft.upperBounds.length-1).focus();
}
function removeTurnRuleRange(index){
 const draft=readTurnRuleRows();
 if(draft.weights.length<=1||!Number.isInteger(index)||index<0||index>=draft.weights.length)return;
 draft.weights.splice(index,1);
 draft.upperBounds.splice(Math.min(index,draft.upperBounds.length-1),1);
 renderTurnRuleRows(draft.weights,draft.upperBounds);
 updateTurnRuleRanges();
 document.querySelectorAll('[data-service-weight]').item(Math.min(index,draft.weights.length-1)).focus();
}
let turnRulesTrigger=null;
function openTurnRules(){
 turnRulesTrigger=document.activeElement;
 fillTurnRules(window.NEXORA_TURN_SETTINGS.load());
 document.getElementById('turn-rules-modal').classList.add('show');
 (document.querySelector('[data-service-upper-bound]')||document.querySelector('[data-service-weight]')).focus();
}
function closeTurnRules(){
 document.getElementById('turn-rules-modal').classList.remove('show');
 turnRulesTrigger?.focus();
}
function readTurnRules(){
 const numberFrom=window.NEXORA_TURN_SETTINGS.numberFrom;
 return {
  bookingTurnCredit:numberFrom(document.getElementById('booking-turn-credit')),
  serviceWeights:[...document.querySelectorAll('[data-service-weight]')].map(numberFrom),
  serviceThresholds:[...document.querySelectorAll('[data-service-upper-bound]')].map(input=>{
   const amount=numberFrom(input),cents=Math.round(amount*100);
   if(!Number.isFinite(amount)||amount<0||!Number.isSafeInteger(cents+1)||cents/100!==amount)return NaN;
   return (cents+1)/100;
  })
 };
}
function turnRulesValidationError(settings){
 const error=window.NEXORA_TURN_SETTINGS.validate(settings);
 const invalidBounds=settings.serviceThresholds.some((amount,index)=>!Number.isFinite(amount)||(index>0&&amount<=settings.serviceThresholds[index-1]));
 return error&&invalidBounds?'Enter increasing Up to amounts of $0 or more, with no more than two decimal places.':error;
}
function updateTurnRuleRanges(){
 const settings=readTurnRules(),error=turnRulesValidationError(settings);
 document.getElementById('turn-rules-error').textContent=error;
 document.querySelectorAll('[data-service-range-start]').forEach((output,index)=>{
  const start=settings.serviceThresholds[index],previous=index?settings.serviceThresholds[index-1]:0;
  output.textContent=Number.isFinite(start)&&start>previous?'$'+start.toFixed(2):'—';
 });
}
function calculateTurnCredit(amount){return window.NEXORA_TURN_SETTINGS.serviceCredit(amount);}
saveTurnRules=function(){
 const settings=readTurnRules(),error=turnRulesValidationError(settings);
 const result=error?{ok:false,error}:window.NEXORA_TURN_SETTINGS.save(settings);
 if(!result.ok){document.getElementById('turn-rules-error').textContent=result.error;toast(result.error);return;}
 closeTurnRules();
 toast('Turn settings saved and shared with Booking Incentive Policy.');
};
document.getElementById('turn-rules-form').addEventListener('input',updateTurnRuleRanges);
document.getElementById('turn-rules-form').addEventListener('submit',event=>{event.preventDefault();saveTurnRules();});
document.getElementById('turn-rules-add-range').addEventListener('click',addTurnRuleRange);
document.getElementById('turn-rules-rows').addEventListener('click',event=>{
 const button=event.target.closest('[data-remove-service-range]');
 if(button)removeTurnRuleRange(Number(button.dataset.removeServiceRange));
});
document.getElementById('turn-rules-modal').addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const controls=[...event.currentTarget.querySelectorAll('button, input, a[href]')].filter(control=>!control.disabled);
 const first=controls[0],last=controls.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
window.NEXORA_TURN_SETTINGS.subscribe(settings=>{
 fillTurnRules(settings);
 if(document.getElementById('add-turn-modal').classList.contains('show'))updateAddTurnPreview();
});
fillTurnRules(window.NEXORA_TURN_SETTINGS.load());
if(new URLSearchParams(location.search).get('settings')==='weighted-turns')openTurnRules();
document.getElementById('edit-turn-form').addEventListener('submit',event=>{event.preventDefault();saveTurnEdit();});
function closeBoardOverlay(id){
 if(id==='turn-rules-modal')closeTurnRules();
 else if(id==='guest-picker')closeGuestPicker();
 else if(id==='boost-modal')closeBoost();
 else if(id==='add-turn-modal')closeAddTurn();
 else if(id==='edit-turn-modal')closeEditTurn();
 else if(typeof window.closeBoardDialog==='function'&&['demo-guest-modal','board-confirm-modal'].includes(id))window.closeBoardDialog(id);
 else document.getElementById(id)?.classList.remove('show');
}
document.querySelectorAll('.modal-wrap .modal').forEach(modal=>{
 if(modal.querySelector('.turn-rules-close,.dialog-close'))return;
 const overlay=modal.closest('.modal-wrap');
 modal.insertAdjacentHTML('afterbegin',`<button type="button" class="dialog-close" aria-label="Close" title="Close" onclick="closeBoardOverlay('${overlay.id}')">×</button>`);
});
document.querySelectorAll('.modal-wrap').forEach(modal=>{
 modal.addEventListener('click',event=>{if(event.target===modal){if(modal.id==='turn-rules-modal')closeTurnRules();else if(modal.id==='edit-turn-modal')closeEditTurn();else modal.classList.remove('show');}});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.modal-wrap.show').forEach(modal=>{if(modal.id==='turn-rules-modal')closeTurnRules();else if(modal.id==='edit-turn-modal')closeEditTurn();else modal.classList.remove('show');});});
renderTurnBoard();
