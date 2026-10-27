/* Time Clock, contained in the current Front Desk. Copy and demo actions are
   carried over from pos-phase-1.html; shift booleans stay in the shared stores. */
(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;
  const root = document.querySelector('#front-desk-clock');
  const data = window.NEXORA_FRONT_DESK_DATA, assignments = window.NEXORA_SERVICE_ASSIGNMENTS;
  if (!root || !data || !assignments) return;
  const key = 'nexora:front-desk-clock:v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => '<img src="../assets/icon-oneqr/issue-2040-oneqr-' + name + '-3d.png" alt="" aria-hidden="true">';
  const time = value => new Date(value).toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
  const dayKey = () => {const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');};
  const emptyDay = () => ({sessions:[], beepers:[], notifications:[]});
  const $ = selector => root.querySelector(selector);
  let initialized = false, saving = false, restoringFocus = false, view = window.innerWidth <= 1366 ? 'card' : 'table';
  const qr = {token:'', expires:0, sequence:0, drawn:''};

  function loadHistory() {
    const raw = localStorage.getItem(key);
    if (!raw) return {version:1, days:{}, stations:{}};
    const state = JSON.parse(raw);
    if (state?.version !== 1 || !state.days || typeof state.days !== 'object' || Array.isArray(state.days)) throw new Error('Saved assignments cannot be read.');
    if (state.stations && (typeof state.stations !== 'object' || Array.isArray(state.stations) || Object.values(state.stations).some(value => !Number.isSafeInteger(value) || value<1))) throw new Error('Saved assignments cannot be read.');
    Object.entries(state.days).forEach(([date, day]) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(day.sessions) || !Array.isArray(day.beepers) || !Array.isArray(day.notifications) ||
        day.sessions.some(item => typeof item.name !== 'string' || (item.in !== null && !Number.isFinite(item.in)) || (item.out !== null && !Number.isFinite(item.out))) ||
        day.beepers.some(item => typeof item.name !== 'string' || !Number.isSafeInteger(item.number) || item.number < 1) ||
        day.notifications.some(item => typeof item.msg !== 'string' || !Number.isFinite(item.at))) throw new Error('Saved assignments cannot be read.');
    });
    return state;
  }
  function saveHistory(state) {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch (_) { throw new Error('Unable to save. Check browser storage and try again.'); }
  }
  function dayOf(state) { return state.days[dayKey()] || emptyDay(); }
  function roster() {
    const state = assignments.load(), front = data.technicians(), tickets = data.all(), stations=loadHistory().stations || {};
    const rows = new Map(front.map(tech => [tech.name, {name:tech.name, front:tech}]));
    state.technicians.forEach(tech => rows.set(tech.name, {...rows.get(tech.name), name:tech.name, assignment:tech}));
    return [...rows.values()].map(row => {
      const tech = row.front, assigned = row.assignment;
      // Existing assignment clockedIn is authoritative where that profile exists.
      const onShift = assigned ? assigned.clockedIn === true : tech.active !== false && tech.status !== 'clocked-out';
      const work = data.workFor(row.name, tickets).filter(({line}) => line.status === 'in-service');
      const sharedWork = state.tickets.filter(ticket => !ticket.payment && ticket.services.some(line => line.techId === assigned?.id && line.status === 'in-service'));
      return {...row, onShift, station:tech?.station ?? tech?.posProfile?.bnum ?? assigned?.station ?? (Object.hasOwn(stations,row.name)?stations[row.name]:'') ,
        turns:tech?.turns ?? tech?.posProfile?.turns ?? state.turnEntries.filter(entry => entry.techId === assigned?.id).reduce((sum, entry) => sum+entry.credit, 0),
        busy:[...new Set(work.length ? work.map(({ticket}) => ticket.customer) : sharedWork.map(ticket => ticket.customer))].join(', ')};
    });
  }
  function initialize() {
    if (initialized) return;
    initialized = true;
    root.innerHTML = `<div class="clock-qr-card clock-surface"><header class="clock-heading"><span class="clock-heading-icon">${icon('qr-code')}</span><h2>Clock-in QR — techs scan with the Nexora Staff App</h2><span class="clock-date" data-clk-date></span></header>
      <div class="clock-qr-body"><div class="clock-qr" data-clk-qr role="img" aria-label="Clock-in QR"></div><div class="clock-qr-copy"><p>Token <span class="clock-token" data-clk-token>—</span> · rotation <b data-clk-seq>0</b> · single use</p><div class="clock-meter"><span data-clk-bar></span></div><p>Rotates in <b data-clk-left>15</b>s — scanning clocks the tech in, assigns their turn, and pushes a notification.</p><p class="clock-hint">The app login proves <b>identity</b>; the rotating QR proves <b>presence in the salon</b>. Two layers is what stops buddy-punching.</p></div></div></div>
      <div class="clock-main-grid"><section class="clock-surface clock-roster"><header class="clock-heading"><span class="clock-heading-icon">${icon('users-round')}</span><h2>Today's shift — turn order follows clock-in time</h2><div class="clock-roster-tools"><span class="clock-on-count" data-clk-oncount></span><div class="clock-views" role="group" aria-label="Tech roster view mode"><button type="button" data-tech-roster-view-target="table" aria-pressed="false">Table</button><button type="button" data-tech-roster-view-target="card" aria-pressed="false">Card</button></div></div></header><div data-tech-roster-table></div><p class="clock-hint clock-roster-hint">One roster table combines clock status, station, current ticket, turns, beeper, and actions. Station # is editable inline.</p></section>
      <aside class="clock-feeds"><section class="clock-surface"><header class="clock-heading"><span class="clock-heading-icon">${icon('bell')}</span><h2>Pushed to Staff App</h2></header><div class="clock-feed" data-clk-notif></div></section><section class="clock-surface"><header class="clock-heading"><span class="clock-heading-icon">${icon('list')}</span><h2>Today's log</h2></header><div class="clock-feed" data-clk-log></div></section></aside></div><p class="clock-feedback" data-clock-feedback role="status"></p>`;
  }
  function rotateQr() {
    qr.token = 'NXCA-' + Math.random().toString(36).slice(2,8).toUpperCase();
    qr.expires = Date.now()+15000;
    qr.sequence++;
  }
  function renderQr() {
    if (!qr.token || Date.now() >= qr.expires) rotateQr();
    if (qr.drawn !== qr.token) {
      qr.drawn = qr.token;
      const box = $('[data-clk-qr]'), url = 'https://nexora.us/ca/' + qr.token;
      box.replaceChildren();
      if (typeof window.QRCode === 'function') new window.QRCode(box, {text:url, width:150, height:150, colorDark:'#101827', colorLight:'#ffffff', correctLevel:window.QRCode.CorrectLevel?.M});
      else box.innerHTML = '<img alt="Clock-in QR" width="150" height="150" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&amp;data=' + encodeURIComponent(url) + '">';
    }
    $('[data-clk-token]').textContent = qr.token;
    $('[data-clk-seq]').textContent = qr.sequence;
    const left = Math.max(0, Math.ceil((qr.expires-Date.now())/1000));
    $('[data-clk-left]').textContent = left;
    $('[data-clk-bar]').style.width = Math.round(left/15*100) + '%';
  }
  function render() {
    if (root.hidden || !initialized) return;
    const rows = roster(), day = dayOf(loadHistory());
    const focused=document.activeElement;
    const focusAttribute=focused?.closest('[data-tech-roster-table]') && ['data-clk-bnum','data-clk','data-clock-beep'].find(attribute=>focused.hasAttribute(attribute));
    const focusValue=focusAttribute && focused.getAttribute(focusAttribute), draftValue=focusAttribute==='data-clk-bnum'?focused.value:null;
    $('[data-clk-date]').textContent = new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
    $('[data-clk-oncount]').textContent = rows.filter(row => row.onShift).length + ' on shift';
    const order = rows.map(row => ({name:row.name, at:day.sessions.find(session => session.name === row.name && session.in !== null)?.in})).filter(row => row.at != null).sort((a,b) => a.at-b.at || a.name.localeCompare(b.name));
    const available = rows.filter(row => row.onShift && !row.busy && !row.assignment?.paused && row.front?.status !== 'paused').sort((a,b) => a.turns-b.turns);
    const cells = row => {
      const sessions = day.sessions.filter(session => session.name === row.name), open = sessions.findLast(session => session.in !== null && session.out === null);
      const shift = row.onShift ? open ? 'In since ' + time(open.in) : 'on shift' : sessions.length ? 'Clocked out' : 'Not in';
      const hours = sessions.filter(session => session.in !== null).reduce((sum, session) => sum+Math.max(0,(session.out || Date.now())-session.in),0)/3600000;
      const position = order.findIndex(item => item.name === row.name)+1;
      const beeper = day.beepers.find(item => item.name === row.name)?.number;
      return {
        person:`<div class="clock-person"><span class="clock-avatar">${esc(row.name.split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase())}</span><div><strong>${esc(row.name)}</strong><small>Technician</small></div></div>`,
        shift:`<span class="clock-shift${row.onShift?' on-shift':''}">${esc(shift)}</span><small>${sessions.some(session => session.in !== null)?hours.toFixed(1)+'h today':'—'}</small>`,
        station:`<input class="clock-station" data-clk-bnum="${esc(row.name)}" aria-label="Station" type="number" min="1" step="1" value="${esc(row.station)}"${saving || !data.canOperate()?' disabled':''}>`,
        ticket:`<span class="clock-ticket${row.busy?' busy':''}">${esc(row.busy || 'Free')}</span>`,
        turns:`<strong>${esc(row.turns)} turns${position?' · #'+position:''}</strong>${available[0]?.name===row.name?'<small class="clock-next">Next up</small>':''}`,
        beeper:beeper?`<span class="clock-beeper">#${beeper}</span>`:'—',
        actions:`<button type="button" data-clk="${esc(row.name)}" data-clock-on-shift="${row.onShift}"${row.onShift?'':' class="primary"'}${saving || !data.canOperate() || row.front?.active===false?' disabled':''}>${row.onShift?'Clock out':'Clock in'}</button><button type="button" data-clock-beep="${esc(row.name)}" title="Beep this tech"${saving || !data.canOperate()?' disabled':''}>Beep</button>`
      };
    };
    const columns = [['person','Technician'],['shift','Shift'],['station','Station'],['ticket','Current ticket'],['turns','Turns today'],['beeper','Beeper'],['actions','Actions']];
    $('[data-tech-roster-table]').innerHTML = view === 'table'
      ? '<div class="clock-table-wrap"><table data-clock-roster><thead><tr>' + columns.map(([,label]) => '<th scope="col">'+label+'</th>').join('') + '</tr></thead><tbody>' + rows.map(row => {const content=cells(row);return '<tr data-clock-person="'+esc(row.name)+'">'+columns.map(([name]) => '<td>'+content[name]+'</td>').join('')+'</tr>';}).join('') + '</tbody></table></div>'
      : '<div class="clock-roster-cards">' + rows.map(row => {const content=cells(row);return `<article class="clock-person-card" data-clock-person="${esc(row.name)}">${content.person}<div class="clock-card-shift">${content.shift}</div><dl>${columns.slice(2,6).map(([name,label])=>'<div><dt>'+label+'</dt><dd>'+content[name]+'</dd></div>').join('')}</dl><div class="clock-card-actions">${content.actions}</div></article>`;}).join('') + '</div>';
    root.querySelectorAll('[data-tech-roster-view-target]').forEach(button => {const active=button.dataset.techRosterViewTarget===view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    $('[data-clk-notif]').innerHTML = day.notifications.length ? day.notifications.slice(-6).reverse().map(item => '<div class="clock-feed-line">'+esc(item.msg)+'</div>').join('') : '<p class="clock-muted">No notifications yet — a tech scanning the QR gets one automatically.</p>';
    $('[data-clk-log]').innerHTML = day.sessions.length ? [...day.sessions].sort((a,b) => (a.in || a.out)-(b.in || b.out)).map(session => {
      const tail = session.out ? '→ out '+time(session.out)+(session.in !== null?' ('+Math.max(0,(session.out-session.in)/3600000).toFixed(1)+'h)':'') : rows.find(row => row.name===session.name)?.onShift ? '· on shift' : '· Clocked out';
      return '<div class="clock-feed-line"><b>'+esc(session.name)+'</b> · '+(session.in !== null?'in '+time(session.in)+' ':'')+tail+'</div>';
    }).join('') : '<p class="clock-muted">No one has clocked in yet today.</p>';
    renderQr();
    if(focusAttribute){
      const next=[...root.querySelectorAll('['+focusAttribute+']')].find(node=>node.getAttribute(focusAttribute)===focusValue);
      if(next&&!next.disabled){
        if(draftValue!==null)next.value=draftValue;
        restoringFocus=true;
        try{next.focus({preventScroll:true});}finally{restoringFocus=false;}
      }
    }
  }
  function report(error) { if (initialized) $('[data-clock-feedback]').textContent = error.message; }
  function refresh() { if(saving)return;try { render(); } catch (error) { report(error); } }
  async function confirmOut(name) {
    const title = 'Clock '+name+' out?';
    if (!window.Swal) return window.confirm(title);
    const result = await window.Swal.fire({icon:'warning', title, text:'Out at '+time(Date.now())+' — production asks for their personal PIN.', showCancelButton:true, confirmButtonText:'Confirm', cancelButtonText:'Cancel'});
    return result.isConfirmed === true;
  }
  async function clock(name,expectedOnShift) {
    let row = roster().find(person => person.name===name);
    if (!row || row.onShift!==expectedOnShift || !data.canOperate() || row.front?.active===false) return;
    const wasOnShift = expectedOnShift;
    if (wasOnShift && !await confirmOut(name)) return;
    row = roster().find(person => person.name===name);
    if (!row || row.onShift !== wasOnShift) return;
    const hadHistory=localStorage.getItem(key)!==null,state = loadHistory(), date = dayKey(), hadDay=Object.hasOwn(state.days,date),day = state.days[date] || (state.days[date]=emptyDay()), at = Date.now();
    const transaction=crypto.randomUUID();
    let closedSession;
    if (wasOnShift) {
      const open = day.sessions.findLast(session => session.name===name && session.out===null);
      if(open){closedSession={out:open.out,closedBy:open.closedBy};open.out=at;open.closedBy=transaction;}
      else day.sessions.push({name, in:null, out:at, createdBy:transaction});
    } else {
      if (!qr.token || Date.now() >= qr.expires) rotateQr();
      const usedToken = qr.token;
      day.sessions.push({name, in:at, out:null, createdBy:transaction});
      if (!day.beepers.some(item => item.name===name)) day.beepers.push({name, number:Math.max(0,...day.beepers.map(item=>item.number))+1, createdBy:transaction});
      const number = day.beepers.find(item=>item.name===name).number;
      day.notifications.push({name, at, createdBy:transaction, msg:'✅ '+name+' clocked in at '+time(at)+' (QR '+usedToken+') — 📟 Beeper #'+number+' today · Station #'+(row.station || '—')});
    }
    // Write ancillary data before the authoritative shift flag. On failure,
    // compensate only this transaction, reading latest records to keep others.
    saveHistory(state);
    let undoFront;
    try {
      if(row.front)undoFront=data.patchTechnician(name,{status:wasOnShift?'clocked-out':row.front.status==='paused'?'paused':'available'});
      if(row.assignment)await assignments.setClockedIn(row.assignment.id,!wasOnShift,wasOnShift);
    } catch(error) {
      try{undoFront?.();}finally{
        const latest=loadHistory(),current=latest.days[date];
        if(current){
          current.sessions=current.sessions.filter(item=>item.createdBy!==transaction);
          current.beepers=current.beepers.filter(item=>item.createdBy!==transaction);
          current.notifications=current.notifications.filter(item=>item.createdBy!==transaction);
          current.sessions.forEach(item=>{
            if(item.closedBy!==transaction||item.out!==at)return;
            item.out=closedSession.out;
            if(closedSession.closedBy===undefined)delete item.closedBy;else item.closedBy=closedSession.closedBy;
          });
          if(!hadDay&&!current.sessions.length&&!current.beepers.length&&!current.notifications.length&&Object.keys(current).every(field=>['sessions','beepers','notifications'].includes(field)))delete latest.days[date];
        }
        if(!hadHistory&&!Object.keys(latest.days).length&&!Object.keys(latest.stations || {}).length&&Object.keys(latest).every(field=>['version','days','stations'].includes(field)))localStorage.removeItem(key);else saveHistory(latest);
      }
      throw error;
    }
    if(!wasOnShift)rotateQr();
    window.dispatchEvent(new CustomEvent('nexora:front-desk-data-changed'));
    $('[data-clock-feedback]').textContent = name+(wasOnShift?' clocked out':' clocked in');
  }
  async function run(action) {
    if (saving) return;
    saving=true; root.setAttribute('aria-busy','true');
    try { await (navigator.locks?navigator.locks.request(key,action):action()); } catch (error) { report(error); }
    finally { saving=false; root.removeAttribute('aria-busy'); refresh(); }
  }
  root.addEventListener('click', event => {
    const button=event.target.closest('button'); if (!button || button.disabled || saving) return;
    if (button.hasAttribute('data-tech-roster-view-target')) {view=button.dataset.techRosterViewTarget;refresh();return;}
    if (button.hasAttribute('data-clk')) {
      // Keep the displayed action's intent while waiting for another tab's lock.
      const name=button.dataset.clk,expectedOnShift=button.dataset.clockOnShift==='true';
      run(()=>clock(name,expectedOnShift));
    }
    if (button.hasAttribute('data-clock-beep')) run(()=>{
      const name=button.dataset.clockBeep, state=loadHistory(), date=dayKey(), day=state.days[date] || (state.days[date]=emptyDay());
      const number=day.beepers.find(item=>item.name===name)?.number || '—';
      day.notifications.push({name, at:Date.now(), msg:'📟 Beeper #'+number+' — The front desk is paging you — a guest is waiting'});
      saveHistory(state); $('[data-clock-feedback]').textContent='Beeped '+name;
    });
  });
  root.addEventListener('focusout', event => {
    const input=event.target.closest('[data-clk-bnum]'); if (!input || input.disabled || saving || restoringFocus || !data.canOperate()) return;
    const value=Number(input.value);
    const person=roster().find(row=>row.name===input.dataset.clkBnum);
    if(!person)return;
    if (!Number.isSafeInteger(value) || value<1) {input.value=person.station;return;}
    if(String(value)===String(person.station))return;
    run(async()=>{
      if(person.front)data.patchTechnician(person.name,{station:value});
      else if(person.assignment)await assignments.setStation(person.assignment.id,value);
    });
  });
  function section() {
    const params=new URLSearchParams(location.search);
    root.hidden=(params.get('section') || params.get('tab')) !== 'clock';
    if (root.hidden) return;
    ['appointments','service-assignments','front-desk-checkin','front-desk-estimate','front-desk-waitlist'].forEach(id=>{const other=document.getElementById(id);if(other)other.hidden=true;});
    initialize(); refresh();
  }
  window.addEventListener('popstate', section);
  ['focus','pageshow','nexora:front-desk-data-changed','nexora:salon-data-changed'].forEach(event=>window.addEventListener(event,refresh));
  window.addEventListener('storage', refresh);
  assignments.subscribe(refresh);
  window.setInterval(()=>{if (!root.hidden && initialized) renderQr();},1000);
  section();
})();
