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
const serviceLabels={PED:'Pedicure',MANI:'Manicure',GEL:'Gel Polish',DIP:'Dipping Powder','ACR-FS':'Acrylic Full Set',REF:'Refill',WAX:'Waxing'};
const normalTickets=structuredClone(tickets),normalTechnicians=structuredClone(technicians);
let nextTurnIndex=0,boardMode="compact",editingTechIndex=null,activeFilter="all",addTurnTechIndex=null,addTurnSaving=false,boostTechIndex=null;
const manualTurnAudit=[];
function render() {}
function toast(message){document.getElementById("toast").textContent=message;}
function buildPeakHourData(){const firstNames=['Kayla','Lana','Chloe','Mia','HUU','Michael','Julie','Amy','Jessica','Cindy','Kim','Anna','Tina','Nancy','Rose','Linda','Jenny','Kelly','Tracy','Helen','Mai','Vy','Tammy','Diana','Sophia'],services=['Deluxe Pedicure','Dipping Powder','Gel Manicure','Acrylic Full Set','Express Pedicure','Eyebrow Waxing'],codes=['PED','DIP','GEL','ACR-FS','MANI','WAX'];const names=Array.from({length:50},(_,index)=>`${firstNames[index%firstNames.length]} ${index<25?'A':'B'}`);const technicians=names.map((name,index)=>{const status=index%11===0?'clocked-out':index%7===0?'paused':index%3===0?'busy':'available';return{name,level:index%3+1,status,turns:index%6,serviceCount:index%8+1,sales:80+index*18,minutes:45+index*11,codes:Array.from({length:index%5+1},(_,slot)=>codes[(index+slot)%codes.length]),commission:.6,dailyIncomeGoal:250+(index%4)*50,detail:status==='available'?'Available now · Mixed services':status==='busy'?'Busy · About 20 min remaining':status==='paused'?'Paused':'Clocked out'};});const guestNames=['Sophia','Emma','Olivia','Ava','Isabella','Mia','Luna','Camila','Harper','Ella','Grace','Lily'];const tickets=Array.from({length:36},(_,index)=>({id:200+index,customer:`${guestNames[index%guestNames.length]} ${index+1}`,phone:`(555) 020-${String(3000+index).slice(-4)}`,time:`${10+Math.floor(index/12)}:${String((index%12)*5).padStart(2,'0')} AM`,status:'waiting',tech:'',services:[services[index%services.length]],wait:8+index*2,isNew:index%3===0,requiredLevel:index%5===0?2:1}));return{technicians,tickets};}
function setDemoMode(mode){const data=mode==='peak'?buildPeakHourData():{technicians:normalTechnicians,tickets:normalTickets};tickets=data.tickets.map(item=>({...item}));technicians.splice(0,technicians.length,...data.technicians.map(item=>({...item,codes:[...item.codes]})));nextTurnIndex=0;activeFilter='all';render();renderTurnBoard();toast(mode==='peak'?'Large Salon Demo loaded: 50 technicians and 36 waiting guests':'Normal Data restored');}
function canAutoAssign(ticket){return ticket.status==='waiting'&&!ticket.tech&&Array.isArray(ticket.services)&&ticket.services.length>0;}
function rotationPositionMap(techs,startIndex){const positions=new Map(),count=techs.length;let position=1;for(let offset=0;offset<count;offset++){const index=(startIndex+offset)%count;if(techs[index].status==='available'||techs[index].status==='busy')positions.set(index,position++);}return positions;}
function orderedTechs(){const positions=rotationPositionMap(technicians,nextTurnIndex);return technicians.map((tech,index)=>({tech,index,rotation:positions.get(index)||null})).sort((a,b)=>a.rotation&&b.rotation?a.rotation-b.rotation:a.rotation?-1:b.rotation?1:a.index-b.index);}
function advanceTurn(){const available=technicians.map((t,i)=>({t,i})).filter(x=>x.t.status==='available'&&x.i!==nextTurnIndex);nextTurnIndex=available.length?available[0].i:(nextTurnIndex+1)%technicians.length;}
function activeCustomerFor(name){return tickets.find(t=>t.status==='in-service'&&t.tech.includes(name));}
function workloadScore(tech){return tech.minutes*.45+tech.sales*.35+tech.serviceCount*8;}
function balanceRecommendation(tech){const active=technicians.filter(t=>t.status!=='clocked-out'),average=active.reduce((sum,t)=>sum+workloadScore(t),0)/active.length,gap=Math.round(average-workloadScore(tech));return gap>55?{show:true,text:`Recommended for balance · workload is ${gap} points below team average`}:{show:false,text:''};}
function goalProgress(tech){const serviceTotal=tech.sales,percent=Math.min(100,Math.round(serviceTotal/tech.dailyIncomeGoal*100)),remaining=Math.max(0,tech.dailyIncomeGoal-serviceTotal),requiredSales=tech.dailyIncomeGoal,status=percent>=100?'Goal Reached':percent>=80?'On Track':'Needs Opportunity';return{serviceTotal,percent,remaining,requiredSales,status};}
function setBoardMode(mode){boardMode=mode;['compact','cards','grid'].forEach(m=>document.getElementById('mode-'+m).classList.toggle('active',m===mode));renderTurnBoard();}
function visibleTechs(){const q=(document.getElementById('tech-search').value||'').toLowerCase(),status=document.getElementById('tech-status-filter').value;return orderedTechs().filter(x=>(status==='all'||x.tech.status===status)&&(x.tech.name.toLowerCase().includes(q)||x.tech.codes.some(code=>(serviceLabels[code]||code).toLowerCase().includes(q))));}
function renderCompactBoard(){return `<div class="compact-board"><div class="compact-row header"><div>Turn order / Technician</div><div>Status</div><div>Turns</div><div>Services</div><div>Service Total</div><div>Goal</div><div>Today / Action</div></div>${visibleTechs().map(({tech,index,rotation})=>{const g=goalProgress(tech);return `<div class="compact-row"><div class="compact-tech">${rotation?`#${rotation}${rotation===1?' NEXT':''}`:'—'} · ${tech.name}<small>Level ${tech.level}</small></div><div>${tech.status}</div><div>${tech.turns}T</div><div>${tech.serviceCount}</div><div><strong>$${tech.sales}</strong></div><div>${g.percent}%<div class="mini-progress"><span style="width:${g.percent}%"></span></div></div><div>${tech.codes.join(' · ')} <button class="action" onclick="openEditTurn(${index})">Edit Turn</button></div></div>`}).join('')}</div>`;}
function turnGridColumnCount(){return Math.max(12,...technicians.map(tech=>(tech.codes?.length||0)+1));}
function renderTurnGrid(){const columnCount=turnGridColumnCount(),columns=Array.from({length:columnCount},(_,index)=>index);return `<div class="turn-grid-wrap"><table class="turn-grid"><tr><th>Turn / Technician</th>${columns.map(n=>`<th>${n+1}</th>`).join('')}</tr>${visibleTechs().map(({tech,index,rotation})=>`<tr><th>${rotation?`#${rotation}${rotation===1?' NEXT':''}`:'—'} · ${tech.name}<br>${tech.turns}T · $${tech.sales}</th>${columns.map((n)=>{const detail=tech.turnDetails?.[n];return n<tech.codes.length?`<td class="turn-cell done"><button onclick="openEditTurn(${index})">${tech.codes[n]}<br>${detail?`$${detail.amount} · +${detail.credit}T`:`+${demoRecordedTurnCredit(30+n*18)}T`}</button></td>`:n===tech.codes.length?`<td class="turn-cell add-turn-cell"><button onclick="openAddTurn(${index})">＋ Add Turn</button></td>`:`<td class="turn-cell"></td>`}).join('')}</tr>`).join('')}</table></div>`;}
function renderCardBoard(){return visibleTechs().map(({tech,index,rotation})=>{const customer=activeCustomerFor(tech.name),isNext=rotation===1,label=rotation?`<span class="${isNext?'next-turn':'up-next'}">#${rotation}${isNext?' NEXT':''}</span>`:'',balance=balanceRecommendation(tech),goal=goalProgress(tech),codes=tech.codes.map(code=>`<abbr title="${serviceLabels[code]}">${code}</abbr>`).join(''),goalClass=goal.percent>=100?'reached':goal.percent>=80?'on-track':'';return `<article class="board-card ${isNext?'current':''}"><div class="tech-avatar">${tech.name.slice(0,2)}</div><div><div class="board-name">${tech.name} · Level ${tech.level}${label}</div><div class="board-status">${tech.status}</div>${customer?`<div class="board-customer">Serving <strong>${customer.customer}</strong>${customer.location?`<br>📍 <strong>${customer.location}</strong>`:''}${customer.techNote?`<br>📝 ${customer.techNote}`:''}</div>`:''}</div><div class="availability">${tech.status.toUpperCase()}</div><div class="workload-metrics"><div class="metric"><span>Turns</span><strong>${tech.turns}</strong></div><div class="metric"><span>Services</span><strong>${tech.serviceCount}</strong></div><div class="metric"><span>Service Total</span><strong>$${tech.sales}</strong></div><div class="metric"><span>Working Time</span><strong>${tech.minutes}m</strong></div></div><div class="goal-card"><div class="goal-line"><strong>Goal Progress · ${goal.percent}%</strong><span>${goal.status}</span></div><div class="goal-track"><div class="goal-fill ${goalClass}" style="width:${goal.percent}%"></div></div><div class="goal-meta"><span>Service Total $${goal.serviceTotal} / Daily Goal $${tech.dailyIncomeGoal}</span><span>$${goal.remaining} remaining</span></div></div><div class="service-codes">Today: ${codes}</div>${balance.show?`<div class="makeup"><strong>MAKE-UP RECOMMENDED</strong>${balance.text}</div>`:''}<div class="board-actions"><button class="action main" onclick="openNextGuest(${index})">Assign Guest</button><button class="action" onclick="skipTurn(${index})">Skip Turn</button><button class="action" onclick="togglePause(${index})">Pause</button><button class="action" onclick="openEditTurn(${index})">Edit Turn</button>${goal.percent<100?`<button class="action" onclick="openBoost(${index})">Boost This Technician</button>`:''}</div></article>`}).join('');}
function renderTurnBoard(){const waiting=tickets.filter(t=>t.status==='waiting'&&!t.tech),available=technicians.filter(t=>t.status==='available').length,busy=technicians.filter(t=>t.status==='busy'||t.status==='paused').length;document.getElementById('stat-total-techs').textContent=technicians.length;document.getElementById('stat-available-techs').textContent=available;document.getElementById('stat-busy-techs').textContent=busy;document.getElementById('stat-waiting-guests').textContent=waiting.length;document.getElementById('next-turn-name').textContent=technicians[nextTurnIndex].name;document.getElementById('turn-waiting-copy').textContent=`${waiting.length} guests are waiting for a technician`;const board=document.getElementById('turn-board-grid');board.className=boardMode==='cards'?'board-grid':'';board.innerHTML=boardMode==='compact'?renderCompactBoard():boardMode==='grid'?renderTurnGrid():renderCardBoard();}
// Seeded historical cells retain the weights in effect when the demo records were created.
function demoRecordedTurnCredit(amount){return amount<30?.5:amount<70?1:amount<110?1.5:2;}
function saveTurnRules(){document.getElementById('turn-rules-modal').classList.remove('show');toast('Weighted turn rules saved');}
function openEditTurn(index){editingTechIndex=index;document.getElementById('edit-turn-copy').textContent=`Edit ${technicians[index].name}'s turn credit`;document.getElementById('edit-turn-reason').value='';document.getElementById('edit-turn-modal').classList.add('show');}
function saveTurnEdit(){const reason=document.getElementById('edit-turn-reason').value.trim();if(!reason){toast('Audit reason is required');return}technicians[editingTechIndex].turns=parseFloat(document.getElementById('edit-turn-credit').value);document.getElementById('edit-turn-modal').classList.remove('show');renderTurnBoard();toast('Turn updated and audit log saved');}
function createManualTurnEntry(code,amount,reason,creditCalculator){return{code,amount:+amount,credit:creditCalculator(+amount),reason,createdAt:new Date().toISOString(),createdBy:'Manager'};}
function openAddTurn(index){addTurnTechIndex=index;addTurnSaving=false;document.getElementById('add-turn-copy').textContent=`Add a missing turn for ${technicians[index].name}`;document.getElementById('add-turn-service').value='PED';document.getElementById('add-turn-amount').value='45';document.getElementById('add-turn-reason').value='';document.getElementById('add-turn-save').disabled=false;updateAddTurnPreview();document.getElementById('add-turn-modal').classList.add('show');}
function closeAddTurn(){document.getElementById('add-turn-modal').classList.remove('show');addTurnTechIndex=null;addTurnSaving=false;}
function updateAddTurnPreview(){const amount=+document.getElementById('add-turn-amount').value||0,credit=calculateTurnCredit(amount);document.getElementById('add-turn-credit').value=String(credit);document.getElementById('add-turn-preview').textContent=`$${amount.toFixed(2)} service · ${credit} turn${credit===1?'':'s'}`;}
function saveAddedTurn(){if(addTurnSaving||addTurnTechIndex===null)return;const amount=+document.getElementById('add-turn-amount').value,reason=document.getElementById('add-turn-reason').value.trim();if(!Number.isFinite(amount)||amount<=0||!reason){toast('Service amount and audit reason are required');return}const credit=window.NEXORA_TURN_SETTINGS.numberFrom(document.getElementById('add-turn-credit'));if(!Number.isFinite(credit)||credit<0){toast('Enter a non-negative turn credit.');return}addTurnSaving=true;document.getElementById('add-turn-save').disabled=true;const tech=technicians[addTurnTechIndex],entry=createManualTurnEntry(document.getElementById('add-turn-service').value,amount,reason,()=>+document.getElementById('add-turn-credit').value);tech.codes.push(entry.code);tech.turnDetails=tech.turnDetails||[];while(tech.turnDetails.length<tech.codes.length-1)tech.turnDetails.push(null);tech.turnDetails.push(entry);tech.turns=+(tech.turns+entry.credit).toFixed(4);tech.serviceCount+=1;tech.sales=+(tech.sales+entry.amount).toFixed(2);manualTurnAudit.push({...entry,technician:tech.name});const name=tech.name;closeAddTurn();renderTurnBoard();toast(`Turn added for ${name} · +${entry.credit}T · $${entry.amount}`);}
function openBoost(index){boostTechIndex=index;const tech=technicians[index],goal=goalProgress(tech);document.getElementById('boost-copy').textContent=`${tech.name} is at ${goal.percent}% of today's manager-set goal.`;document.getElementById('boost-suggestion').textContent=`$10 off Gel Pedicure with ${tech.name} until 5 PM`;document.getElementById('boost-reason').textContent=`$${goal.remaining} estimated income remaining · suggested from eligible services`;document.getElementById('boost-modal').classList.add('show');}
function closeBoost(){boostTechIndex=null;document.getElementById('boost-modal').classList.remove('show');}
function launchBoost(){const tech=technicians[boostTechIndex],service=document.getElementById('boost-service').value,discount=document.getElementById('boost-discount').value;closeBoost();toast(`${discount} ${service} promotion launched for ${tech.name}`);}
function skipTurn(index){if(index===nextTurnIndex)advanceTurn();toast(`${technicians[index].name} skipped. Next turn: ${technicians[nextTurnIndex].name}`);renderTurnBoard();}
function togglePause(index){const tech=technicians[index];tech.status=tech.status==='paused'?'available':'paused';if(index===nextTurnIndex&&tech.status==='paused')advanceTurn();renderTurnBoard();toast(`${tech.name} ${tech.status==='paused'?'paused':'returned to rotation'}`);}
function openNextGuest(index=nextTurnIndex){const waiting=tickets.filter(canAutoAssign);const tech=technicians[index];document.getElementById('guest-picker-tech').textContent=tech.name;document.getElementById('guest-options').innerHTML=waiting.length?waiting.map(t=>`<button class="guest-choice" onclick="assignGuestFromBoard(${t.id},${index})"><strong>#${t.id} ${t.customer}</strong><span>${t.services[0]} · waiting ${t.wait} min</span></button>`).join(''):'<div class="empty">No service-ready guests are waiting for assignment.</div>';document.getElementById('guest-picker').classList.add('show');}
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
const renderSourceBoard=renderTurnBoard;
renderTurnBoard=function(){
 if(nextTurnIndex<0||technicians[nextTurnIndex]?.status!=='available')advanceTurn();
 // The source renderer requires an index even when everyone is unavailable.
 const none=nextTurnIndex<0;if(none)nextTurnIndex=0;
 renderSourceBoard();
 if(none){nextTurnIndex=-1;document.getElementById('next-turn-name').textContent='No available technician';}
 document.querySelector('.turn-hero button').disabled=none||!tickets.some(canAutoAssign);
};
const sourceOpenNextGuest=openNextGuest;
openNextGuest=function(index=nextTurnIndex){
 if(!technicians[index]||technicians[index].status!=='available'){toast('Choose an available technician.');return;}
 sourceOpenNextGuest(index);
};
assignGuestFromBoard=function(ticketId,index){
 const ticket=tickets.find(t=>t.id===ticketId),tech=technicians[index];
 if(!ticket||!canAutoAssign(ticket)||!tech||tech.status!=='available'){toast('This guest or technician is no longer available.');return;}
 ticket.tech=tech.name;ticket.status='in-service';tech.turns+=1;tech.status='busy';
 if(index===nextTurnIndex)advanceTurn();closeGuestPicker();renderTurnBoard();toast(tech.name+' assigned to '+ticket.customer);
};
togglePause=function(index){
 const tech=technicians[index];
 if(!['available','paused'].includes(tech.status)){toast('Only available or paused technicians can change pause status.');return;}
 tech.status=tech.status==='paused'?'available':'paused';if(index===nextTurnIndex&&tech.status==='paused')advanceTurn();renderTurnBoard();
};
function fillTurnRules(settings) {
 document.getElementById('booking-turn-credit').value=settings.bookingTurnCredit;
 document.querySelectorAll('[data-service-weight]').forEach((input,index)=>{input.value=settings.serviceWeights[index];});
 document.getElementById('turn-rules-error').textContent='';
}
function openTurnRules(){
 fillTurnRules(window.NEXORA_TURN_SETTINGS.load());
 document.getElementById('turn-rules-modal').classList.add('show');
}
function calculateTurnCredit(amount){return window.NEXORA_TURN_SETTINGS.serviceCredit(amount);}
saveTurnRules=function(){
 const settings={bookingTurnCredit:window.NEXORA_TURN_SETTINGS.numberFrom(document.getElementById('booking-turn-credit')),serviceWeights:[...document.querySelectorAll('[data-service-weight]')].map(window.NEXORA_TURN_SETTINGS.numberFrom)};
 const result=window.NEXORA_TURN_SETTINGS.save(settings);
 if(!result.ok){document.getElementById('turn-rules-error').textContent=result.error;toast(result.error);return;}
 document.getElementById('turn-rules-modal').classList.remove('show');
 toast('Turn settings saved and shared with Booking Incentive Policy.');
};
window.NEXORA_TURN_SETTINGS.subscribe(settings=>{
 fillTurnRules(settings);
 if(document.getElementById('add-turn-modal').classList.contains('show'))updateAddTurnPreview();
});
fillTurnRules(window.NEXORA_TURN_SETTINGS.load());
if(new URLSearchParams(location.search).get('settings')==='weighted-turns')openTurnRules();
const turnEditAudit=[];
saveTurnEdit=function(){
 const reason=document.getElementById('edit-turn-reason').value.trim(),value=Number(document.getElementById('edit-turn-credit').value);
 if(!reason||!Number.isFinite(value)||value<0){toast('Valid turn credit and an audit reason are required.');return;}
 const tech=technicians[editingTechIndex];turnEditAudit.push({technician:tech.name,previous:tech.turns,value,reason,by:'Manager',at:new Date().toISOString()});tech.turns=value;
 document.getElementById('edit-turn-modal').classList.remove('show');renderTurnBoard();toast('Turn updated; audit recorded for this demo session.');
};
// The imported prototype only supports adjusting credit in the Edit Turn dialog.
const editAction=document.querySelector('#edit-turn-modal select:not([id])');if(editAction)editAction.closest('label').remove();
document.querySelectorAll('.modal-wrap').forEach(modal=>{
 modal.addEventListener('click',event=>{if(event.target===modal)modal.classList.remove('show');});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.modal-wrap.show').forEach(modal=>modal.classList.remove('show'));});
renderTurnBoard();
