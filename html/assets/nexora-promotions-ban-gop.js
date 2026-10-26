/* Presentation and local demo behavior for the PO copy, issue #2367. */
(function () {
  'use strict';
  const appearance = window.ONEQR_ACTION_APPEARANCE;
  const $ = selector => document.querySelector(selector);
  const text = (vi, en) => document.documentElement.lang === 'vi' ? vi : en;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => value.replace(/\uFE0F/g, '');
  const symbols = {
    paintbrush:'💅 🦶 🖋️ ✒️ ✎ ✏️ 🎨 👩‍🎨', flower2:'💆 🧖 🌿 💐 🌳 🍂',
    wand2:'💇 💈 ✦', sparkles:'✨ 💄 💉 🪒 🧼 🧽 🧹', heart:'❤️ 💜 💚 🧘 🥗 🫀 🧠 🦴 🩺 💊 🔬',
    trophy:'🏋️ 🎳 🏊', utensils:'🍽️ 🍜 🍲 🦞 🥬 🍱 🥡', coffee:'☕ 🧋', cake:'🎂 🥖', music:'🎤 🎹 🍻',
    shoppingBag:'🛍️ 🛒 👗 👜 👕 🕶️ 👓', crown:'💍', phone:'📱', home:'🏠 🏡 🏚️ 🏘️ 🛋️ 🪑 🚪',
    globe2:'✈️ 🛫 🧳 🛂 🇻🇳 📡', building2:'🏢 🏛️ 🏦 🏨 ⛪ 🛕', store:'🏪 🏬',
    car:'🚗 🚘 🚙 🚕 🛞 🚌', truck:'🚚', wrench:'🔧 🛠️ 🔨 🔌 🧱', settings2:'🎛️ ⚙️ 🔄',
    briefcase:'💼 ⚖️', award:'🎓 🎖️ 📜', list:'📋 📚 📰 🔢', receipt:'🧾 📝 🖨️', package:'📦 🧩 💾 🗑',
    gift:'🎁 🧸 🎈', gamepad2:'🎪', usersRound:'👥 🤝 👶 🍼 🐶 🐾', userRound:'👤 👴 👰 🪪',
    calendarDays:'📅 🗓️', clock:'🕒', ticket:'🎟️', tag:'🏷️', zap:'⚡', check:'✅ ✓',
    messageCircle:'💬 🗣️', mail:'✉️', qrCode:'🔳', image:'🖼️ 👁️', camera:'📷', video:'📹',
    megaphone:'📣 📢', rocket:'🚀 🎉 🎊 📈', star:'⭐ ☀️ 💡', bell:'🔔 ⚠️ 🚦',
    circleCheck:'🙏 👍', mapPin:'📍 👉', map:'🗺️', wallet:'💸', settings:'🔒 🔑 🗝️',
    wifi:'❄️', userCog:'🦷', circle:'🚫'
  };
  const names = {flower2:'flower-2',wand2:'wand-2',shoppingBag:'shopping-bag',globe2:'globe-2',building2:'building-2',settings2:'settings-2',gamepad2:'gamepad-2',usersRound:'users-round',userRound:'user-round',calendarDays:'calendar-days',messageCircle:'message-circle',qrCode:'qr-code',circleCheck:'circle-check',mapPin:'map-pin',userCog:'user-cog',circle:'square'};
  const emojiIcons = new Map();
  Object.entries(symbols).forEach(([key, values]) => values.split(' ').forEach(value => emojiIcons.set(normalize(value), names[key] || key)));
  const pattern = [...emojiIcons.keys()].sort((a,b) => b.length-a.length).map(value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\uFE0F?').join('|');
  const emojiPattern = new RegExp(pattern, 'gu');
  const iconName = value => emojiIcons.get(normalize(value || '')) || 'sparkles';
  const icon = (name, size = 24) => appearance.image(name, size);
  let monthlyCap = '', menuGroups = null, serviceGroups = [];
  const openCategories = new Map();
  const pickerStates = new WeakMap();
  let pickerId = 0;

  function option(value, label, name, selected) {
    return `<option value="${escape(value)}" data-po-icon="${escape(name)}" ${selected?'selected':''}>${escape(label)}</option>`;
  }
  function industryOptions(taxonomy, value, L) {
    return option('all', L('Mọi ngành','All industries'), 'globe-2', value === 'all') + taxonomy.g.map(group =>
      `<optgroup label="${escape(L(group[2],group[3]))}">${taxonomy.i.filter(item => item[1] === group[0]).map(item => option(item[0],L(item[3],item[4]),iconName(item[2]),value === item[0])).join('')}</optgroup>`).join('');
  }
  function industrySelect(taxonomy, value, overview, L) {
    const id = overview ? 'overview-industry' : 'template-industry';
    return `<div class="po-template-filter po-industry-filter" ${overview?'id="ovInd"':'id="tpIndRow"'}><label id="${id}-label" for="${id}">${L('Chọn ngành','Industry')}</label><select id="${id}" data-po-select="industry" data-pisel="1" aria-labelledby="${id}-label">${industryOptions(taxonomy,value,L)}</select><small>${L('Mặc định lấy ngành của tiệm từ Salon Settings · gợi ý các ngành cùng nhóm','Defaults to your shop’s industry from Salon Settings · suggests the same group')}</small></div>`;
  }
  function goalSelect(goals, emojis, translations, selected, templates, L) {
    const goalIcons=['users-round','clock','megaphone','hand-coins','heart','users-round','calendar-days'];
    const options = option(-1,L('Tất cả','All')+' · '+templates.length,'layout-dashboard',selected < 0) + goals.map((goal,index) => {
      const count = templates.filter(item => item.goals.includes(index)).length;
      return option(index,L(translations[goal],goal)+' · '+count,goalIcons[index]||iconName(emojis[index]),selected === index);
    }).join('');
    return `<div class="po-template-filter"><label id="template-goal-label" for="template-goal">${L('Mục tiêu','Goal')}</label><select id="template-goal" data-po-select="goal" aria-labelledby="template-goal-label">${options}</select></div>`;
  }
  function serviceGroupSelect(groups, translations, selected, templates, L) {
    const icons = ['paintbrush','flower-2','sparkles','paintbrush','wand-2'];
    const options = option(-1,L('Tất cả','All'),'list',selected < 0) + groups.map((group,index) => option(index,L(translations[group],group)+' · '+templates.filter(item => item.sg.includes(index)).length,icons[index],selected === index)).join('');
    return `<div class="po-template-filter"><label id="template-service-group-label" for="template-service-group">${L('Nhóm dịch vụ','Service group')}</label><select id="template-service-group" data-po-select="service" aria-labelledby="template-service-group-label">${options}</select></div>`;
  }

  function mountSelect(select) {
    if (pickerStates.has(select)) return;
    const wrapper = document.createElement('div'); wrapper.className = 'po-select';
    const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'po-select-trigger';
    trigger.setAttribute('aria-haspopup','listbox'); trigger.setAttribute('aria-expanded','false');
    const list = document.createElement('div'); list.id = 'po-options-' + (++pickerId); list.className = 'po-select-options'; list.setAttribute('role','listbox'); list.hidden = true;
    trigger.setAttribute('aria-controls',list.id);
    const label = select.getAttribute('aria-labelledby');
    if (label) { trigger.setAttribute('aria-labelledby',label+' '+list.id+'-value'); list.setAttribute('aria-labelledby',label); }
    const buttons = [];
    function row(item, section) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'po-select-option'; button.tabIndex = -1;
      button.dataset.value = item.value; button.setAttribute('role','option'); button.disabled = item.disabled;
      button.innerHTML = icon(item.dataset.poIcon || iconName(item.textContent.match(emojiPattern)?.[0])) + '<span>'+escape(item.textContent)+'</span><span class="po-select-check" aria-hidden="true">✓</span>';
      button.addEventListener('click',() => { select.value = item.value; sync(); close(true); select.dispatchEvent(new Event('change',{bubbles:true})); queueMicrotask(()=>{const replacement=document.getElementById(select.id);if(replacement&&replacement!==select){mountSelect(replacement);pickerStates.get(replacement).wrapper.querySelector('button').focus();}}); });
      section.append(button); buttons.push(button);
    }
    for (const child of select.children) {
      if (child.tagName === 'OPTGROUP') {
        const section = document.createElement('div'); section.setAttribute('role','group'); section.setAttribute('aria-label',child.label);
        const heading = document.createElement('div'); heading.className = 'po-select-group'; heading.textContent = child.label; section.append(heading);
        Array.from(child.children).forEach(item => row(item,section)); list.append(section);
      } else if (child.tagName === 'OPTION') row(child,list);
    }
    function sync() {
      const selected = select.selectedOptions[0]; if (!selected) return;
      trigger.innerHTML = icon(selected.dataset.poIcon || 'sparkles')+'<span id="'+list.id+'-value">'+escape(selected.textContent)+'</span><span class="po-select-arrow" aria-hidden="true"></span>';
      buttons.forEach(button => button.setAttribute('aria-selected',String(button.dataset.value === select.value)));
    }
    function close(focus) { list.hidden = true; trigger.setAttribute('aria-expanded','false'); if (focus && trigger.isConnected) trigger.focus(); }
    function open() {
      document.querySelectorAll('.po-select-options').forEach(other => { if (other !== list) { other.hidden = true; other.parentElement.querySelector('.po-select-trigger').setAttribute('aria-expanded','false'); } });
      list.hidden = false; trigger.setAttribute('aria-expanded','true');
      const current = buttons.find(button => button.dataset.value === select.value) || buttons[0];
      current?.focus(); current?.scrollIntoView({block:'nearest'});
    }
    trigger.addEventListener('click',() => list.hidden ? open() : close(false));
    let typed = '', lastTyped = 0;
    wrapper.addEventListener('keydown',event => {
      if (event.key === 'Escape' && !list.hidden) { event.preventDefault(); event.stopPropagation(); close(true); }
      else if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault(); if (list.hidden) { open(); return; }
        const index = buttons.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
        buttons[next]?.focus();
      } else if (event.key === 'Tab') close(false);
      else if (!list.hidden && event.key.length===1 && event.key!==' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault(); typed = Date.now()-lastTyped>700 ? event.key : typed+event.key; lastTyped=Date.now();
        buttons.find(button => button.querySelector('span').textContent.toLowerCase().startsWith(typed.toLowerCase()))?.focus();
      }
    });
    select.addEventListener('change',sync);
    select.after(wrapper); wrapper.append(trigger,list); select.hidden = true;
    pickerStates.set(select,{wrapper,close}); sync();
  }
  document.addEventListener('pointerdown',event => document.querySelectorAll('select[data-po-select]').forEach(select => {
    const state = pickerStates.get(select); if (state && !state.wrapper.contains(event.target)) state.close(false);
  }));

  function services(fallback, selected) {
    document.querySelectorAll('#svcBox details[data-service-category]').forEach(details=>openCategories.set(details.dataset.serviceCategory,details.open));
    const defaults = [
      {name:'Manicure & Gel',services:['Manicure']},
      {name:'Pedicure & Foot Care',services:['Classic Pedicure','Pedicure + Gel Polish','Foot massage']},
      {name:'Extensions & Dip',services:['Gel-X','Dip powder']},
      {name:'Design & Add-ons',services:['Nail art']}
    ];
    const groups = (menuGroups || defaults).map(group => ({name:group.name,services:[...group.services]}));
    const counts = new Map(), labels = new Map();
    groups.forEach(group=>group.services.forEach(name=>counts.set(name,(counts.get(name)||0)+1)));
    // Identical menu labels in different categories remain separate choices.
    groups.forEach(group=>{group.services=group.services.map(name=>{
      const value=counts.get(name)>1?name+' ('+group.name+')':name;
      labels.set(value,name);return value;
    });});
    if(menuGroups){
      const aliases={'Dip powder':'Dipping Powder','Gel-X':'Full Set Gel X','Nail art':'Nail Design','Foot massage':'Extra Massage','Pedicure + Gel Polish':'Shellac with Pedicure or Manicure'};
      const available=groups.flatMap(group=>group.services);
      selected.forEach((name,index)=>{if(available.includes(name))return;const canonical=available.find(item=>(labels.get(item)||item).toLowerCase()===(aliases[name]||name).toLowerCase());if(canonical)selected[index]=canonical;});
    }
    serviceGroups = groups.filter(group => group.services.length);
    const allSelected = selected.includes('Mọi dịch vụ');
    const button = name => {
      const checked = selected.includes(name) || (name !== 'Mọi dịch vụ' && allSelected);
      return `<button type="button" aria-pressed="${checked}" class="${checked?'on':''}" data-svc="${escape(name)}">${escape(name==='Mọi dịch vụ'?text('Mọi dịch vụ','All services'):(labels.get(name)||name))}</button>`;
    };
    const categories = serviceGroups.map((group,index) => {
      const count = allSelected ? group.services.length : group.services.filter(name=>selected.includes(name)).length;
      const checked = count === group.services.length;
      return `<section class="po-service-category"><input class="po-category-check" type="checkbox" id="service-category-${index}" data-svc-category="${index}" data-partial="${count>0&&!checked}" ${checked?'checked':''} aria-label="${escape(text('Chọn tất cả','Select all')+': '+group.name)}" aria-describedby="service-category-count-${index}"><details data-service-category="${escape(group.name)}" ${openCategories.get(group.name)?'open':''}><summary><span>${escape(group.name)}</span><small id="service-category-count-${index}">${count} / ${group.services.length}</small><span class="po-category-arrow" aria-hidden="true"></span></summary><div class="svc">${group.services.map(button).join('')}</div></details></section>`;
    }).join('');
    return `<div class="label-row"><b>${text('Dịch vụ áp dụng','Eligible services')}</b><span class="tooltip" tabindex="0">?<span class="tip">${text('Lấy từ danh mục dịch vụ của POS (Salon Settings). POS chỉ trừ giảm giá trên đúng dịch vụ này trong bill; Booking gắn nhãn đúng dịch vụ; add-on chỉ gợi ý khi khách chọn dịch vụ chính.','From the POS service menu (Salon Settings). The POS discounts only these services on the bill; Booking tags only these; add-ons are suggested only with a main service.')}</span></span></div><div class="svc">${button('Mọi dịch vụ')}</div><div class="po-service-categories">${categories}</div>`;
  }
  function syncServiceCategoryChecks() {
    document.querySelectorAll('[data-svc-category]').forEach(input=>{input.indeterminate=input.dataset.partial==='true';});
  }
  function selectedServices() {
    return new Set(SEL_SVC.includes('Mọi dịch vụ')?serviceGroups.flatMap(group=>group.services):SEL_SVC);
  }
  function applyServiceSelection(selected) {
    const all = [...new Set(serviceGroups.flatMap(group=>group.services))];
    SEL_SVC = all.length && selected.size===all.length && all.every(name=>selected.has(name)) ? ['Mọi dịch vụ'] : [...selected];
    drawSvc(); preflight(); drawLP();
  }
  function toggleService(name) {
    if(name==='Mọi dịch vụ'){SEL_SVC=['Mọi dịch vụ'];drawSvc();preflight();drawLP();return;}
    const selected = selectedServices();
    if(selected.has(name)) selected.delete(name); else selected.add(name);
    applyServiceSelection(selected);
    Array.from(document.querySelectorAll('#svcBox [data-svc]')).find(button=>button.dataset.svc===name)?.focus({preventScroll:true});
  }
  function toggleServiceCategory(input) {
    const index = Number(input.dataset.svcCategory), group = serviceGroups[index];
    if(!group) return;
    const selected = selectedServices();
    group.services.forEach(name=>{if(input.checked)selected.add(name);else selected.delete(name);});
    applyServiceSelection(selected);
    document.getElementById('service-category-'+index)?.focus({preventScroll:true});
  }
  // Fill each row evenly, avoiding a short trailing row on wide screens.
  function channelCards(channels, renderCard) {
    function spans(maximum) {
      if(!channels.length) return [];
      const rows = Math.ceil(channels.length/maximum), base = Math.floor(channels.length/rows), extra = channels.length%rows;
      return Array.from({length:rows},(_,index)=>Array(base+(index<extra?1:0)).fill(12/(base+(index<extra?1:0)))).flat();
    }
    const desktop = spans(4), tablet = spans(2);
    return channels.map((channel,index)=>renderCard(channel).replace('<button ',`<button style="--channel-span:${desktop[index]};--channel-tablet-span:${tablet[index]}" `)).join('');
  }

  const date = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || '';
    const [year,month,day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(year,month-1,day));
  };
  function dateRange(value) {
    return String(value || '').replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g,(_,day,month,year) => date(`${year||2026}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`));
  }
  function summary(selected) {
    const cp = !!$('#aCap')?.value.trim();
    const value = $('#dVal')?.value.trim();
    const amount = value ? ($('#dType')?.selectedIndex===1 ? '$'+value : value+'%') : '';
    const label = cp ? 'Coupon' : 'Deal';
    const per = cp ? ($('#aPer')?.value==='0' ? text('Không giới hạn','Unlimited') : $('#aPer')?.value+' '+text('lần mỗi khách','per customer')) : ($('#pgPer')?.selectedOptions[0]?.textContent || text('1 lần mỗi lượt ghé','1 per visit')).replace('1 lần / lượt ghé','1 lần mỗi lượt ghé').replace('1 lần / tuần','1 lần mỗi tuần').replace('1 lần / tháng','1 lần mỗi tháng');
    const weekdays = text('CN,T2,T3,T4,T5,T6,T7','Sun,Mon,Tue,Wed,Thu,Fri,Sat').split(',');
    const days = Array.from(document.querySelectorAll('#quick-create .checks .check-pill')).flatMap((button,index) => button.classList.contains('active') ? [weekdays[index]] : []);
    const times = Array.from(document.querySelectorAll('#quick-create input[type=time]')).map(input => input.value);
    const schedule = [days.length===7?text('Mỗi ngày','Every day'):days.join(', '),times.every(Boolean)?times.join('–'):''].filter(Boolean).join(' · ');
    const start = $('#aD1')?.value, end = $('#aD2')?.value;
    const requirement = $('#aReq')?.selectedOptions[0]?.textContent || text('Không yêu cầu','No requirement');
    const rows = [
      ['tag',label+' · '+(cp?escape($('#aCap').value)+' '+text('suất','slots'):text('Không giới hạn số lượng','Unlimited'))+(amount?' · '+text('giảm','save')+' <b>'+escape(amount)+'</b>':'')],
      ['calendar-days',[schedule,start?date(start)+' – '+(end?date(end):text('Không kết thúc','No end')):''].filter(Boolean).map(escape).join('<br>')],
      ['user-round',escape(requirement)+' · '+escape(per)],
      ['paintbrush',text('Dịch vụ áp dụng','Eligible services')+': '+escape(selected.includes('Mọi dịch vụ')?text('Mọi dịch vụ','All services'):selected.join(', '))]
    ];
    if ($('#aMin')?.value) rows.push(['badge-dollar-sign',text('Chi tiêu tối thiểu','Minimum spend')+': $'+escape($('#aMin').value)]);
    if (!cp && monthlyCap) rows.push(['wallet',text('Trần giảm mỗi tháng','Monthly cap')+': $'+escape(monthlyCap)]);
    const html = '<ul>'+rows.filter(row => row[1]).map(row => '<li><span>'+icon(row[0],20)+'</span><span>'+row[1]+'</span></li>').join('')+'</ul>';
    if ($('#sumTxt')) $('#sumTxt').innerHTML = html;
    if ($('#d2sum')) $('#d2sum').innerHTML = '<h4>'+text('Tóm tắt chương trình','Program summary')+'</h4>'+html;
  }

  function publicationStatus(program) {
    const state = program.publication;
    return `<small class="po-publication"><span class="tag2 ok">${state.owned.length?text('Kênh của tiệm: đã bật','Own channels: on'):text('Kênh của tiệm: không chọn','Own channels: not selected')}</span>${state.public.length?`<span class="tag2 ${state.status==='reviewing'?'warn':'ok'}">${state.status==='reviewing'?text('Public: đang duyệt tự động','Public: automatic review'):text('Public: đã duyệt tự động','Public: automatically approved')}</span>`:''}</small>`;
  }
  function refreshPrograms() { window.__drawMG?.(); window.__evDraw?.(); }
  function publish(button) {
    const name = $('#promoName').value.trim(), value = Number($('#dVal').value);
    if (!name || !$('#dVal').value.trim() || !Number.isFinite(value) || value<=0 || ($('#dType').selectedIndex===0 && value>100)) {
      showToast(text('Nhập tên và mức giảm hợp lệ trước khi bật chương trình.','Enter a name and a valid discount before turning on.')); return;
    }
    for(const input of [$('#aMin'),$('#pgCap')]){if(input&&input.value.trim()&&(!Number.isFinite(Number(input.value))||Number(input.value)<0)){input.focus();showToast(text('Nhập số tiền không âm.','Enter a non-negative amount.'));return;}}
    if(!SEL_SVC.length){preflight();$('#svcBox').scrollIntoView({block:'center',behavior:'smooth'});$('#svcBox [data-svc]')?.focus({preventScroll:true});return;}
    const owned = CH.filter(channel => channel.t==='int' && ST.on[channel.id]).map(channel => channel.id);
    if (ST.ci.on) owned.push('check-in'); if (ST.bk.on) owned.push('booking');
    const publicChannels = CH.filter(channel => channel.t==='pub' && ST.on[channel.id]).map(channel => channel.id);
    if (!owned.length && !publicChannels.length) { showToast(text('Chọn ít nhất một kênh phát.','Select at least one channel.')); return; }
    if ($('#aD2').value && $('#aD2').value<$('#aD1').value) { showToast(text('Ngày kết thúc phải sau ngày bắt đầu','End must be after start')); return; }
    if (button.disabled) return;
    if(!$('#aD1').value){$('#aD1').focus();return;}
    const today = new Date(); const todayISO = [today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    const channels = CH.filter(channel => ST.on[channel.id]).map(channel => text(...channel.n));
    const cp = !!$('#aCap').value.trim();
    if(cp&&(!Number.isSafeInteger(Number($('#aCap').value))||Number($('#aCap').value)<=0)){showToast(text('Nhập số suất hợp lệ.','Enter a valid number of slots.'));return;}
    const initialState=$('#aD1').value>todayISO?'sched':'run';
    const program = {
      id:'g'+Date.now(), n:[name,name], ty:cp?'coupon':'deal',
      off:$('#dType').selectedIndex===1?'$'+value:value+'%',
      st:owned.length?initialState:(publicChannels.length?'review':initialState),
      sch:schedTxt(),
      d:date($('#aD1').value)+' – '+($('#aD2').value?date($('#aD2').value):text('Không kết thúc','No end')),
      ch:channels.concat(ST.ci.on?['Check-in']:[],ST.bk.on?['Booking']:[]).join(' · '),
      used:0, disc:0, rev:0, views:0, newc:0, ret:0,
      q:cp?Number($('#aCap').value):undefined, got:0, code:$('#aCode').value,
      sd:$('#aD1').value, ed:$('#aD2').value||null,
      days:F2.days().flatMap((day,index)=>day.classList.contains('active')?[index]:[]),
      h1:F2.times()[0].value, h2:F2.times()[1].value,
      allDay:F2.times()[0].value==='00:00'&&F2.times()[1].value==='23:59',
      skip:[], auto:{on:true,off:true,remind:true}, sms:[], yearly:false, bday:false,
      banners:BANNERS.map(banner=>({...banner})), eligibleServices:[...SEL_SVC],
      minimumSpend:$('#aMin').value, monthlyCap:cp?'':monthlyCap,
      publication:{owned,public:publicChannels,status:publicChannels.length?'reviewing':'approved'}
    };
    window.__PG.unshift(program); refreshPrograms();
    let notice = $('#po-publication-status');
    if (!notice) { notice = document.createElement('div'); notice.id='po-publication-status'; notice.setAttribute('role','status'); button.closest('.footer-actions').before(notice); }
    const draw = () => { notice.innerHTML = publicationStatus(program); };
    draw(); button.disabled=true;
    showToast(owned.length ? text('Kênh của tiệm đã bật, không cần duyệt nội dung.','Your own channels are on without content review.') : text('Hệ thống đang tự động duyệt vị trí public.','Public placements are being reviewed automatically.'));
    setTimeout(() => { program.publication.status='approved'; if(program.st==='review')program.st=initialState; draw(); refreshPrograms(); button.disabled=false; },publicChannels.length?900:0);
  }
  function reviewBoost(program) {
    setTimeout(() => { program.boost='active'; if (program.publication) program.publication.status='approved'; refreshPrograms(); },900);
  }

  const dialog = () => $('#ai-banner-dialog');
  let quality='medium', credits=50, generationTimer, generated=null, reference=null;
  const cost = () => ({low:1,medium:2,high:4})[quality];
  function updateCost() {
    $('#ai-quality-label').textContent=quality[0].toUpperCase()+quality.slice(1);
    $('#ai-generation-cost').textContent=cost()+' '+(cost()===1?'credit':'credits');
    $('#ai-loading-cost').textContent='Using '+cost()+' credits for this design.';
    document.querySelectorAll('[data-ai-quality]').forEach(button => button.classList.toggle('selected',button.dataset.aiQuality===quality));
  }
  function openBanner() {
    clearTimeout(generationTimer); generated=null;
    $('#ai-generation-result').hidden=true; $('#ai-generation-loading').hidden=true; $('#generate-ai-design').disabled=false; $('#ai-generator-error').textContent='';
    const prompt=$('#ai-banner-prompt');
    const context=[F2.name().value,offerTxt(),schedTxt(),F2.desc().value].filter(Boolean).join('. ');
    if (!prompt.value.trim() || prompt.value===prompt.dataset.context) prompt.value=context;
    prompt.dataset.context=context;
    if (!dialog().open) dialog().showModal();
  }
  function generateBanner() {
    const prompt=$('#ai-banner-prompt').value.trim(), error=$('#ai-generator-error');
    if (!prompt) { error.textContent='Describe your ad idea before generating a banner.'; $('#ai-banner-prompt').focus(); return; }
    if (credits<cost()) { error.textContent='There are not enough AI credits for this generation.'; return; }
    error.textContent=''; $('#generate-ai-design').disabled=true; $('#ai-generation-result').hidden=true; $('#ai-generation-loading').hidden=false;
    const generationCost=cost(), selectedQuality=quality;
    generationTimer=setTimeout(() => {
      credits-=generationCost;
      const theme={low:'rose',medium:'sig',high:'gold'}[selectedQuality];
      const selectedColors=Array.from(document.querySelectorAll('.phase-ai-brand-color input')).map(input=>input.value);
      generated={th:theme,img:reference,aiPrompt:prompt};
      if ($('#ai-use-brand-colors').checked) { generated.gradient='linear-gradient(135deg,'+selectedColors[0]+','+selectedColors[1]+')'; generated.ink='#ffffff'; }
      const art=$('#ai-result-art'); art.className='phase-ai-result-art '+({sig:'purple',rose:'rose',gold:'gold'})[theme];
      art.style.background=reference?'url("'+reference+'") center/cover':generated.gradient||''; art.style.color=generated.ink||'';
      $('#ai-result-badge').textContent=F2.badge().value.trim()||'SPECIAL OFFER'; $('#ai-result-title').textContent=F2.name().value; $('#ai-result-copy').textContent=offerTxt()+' · '+schedTxt();
      $('#ai-available-credits').textContent=credits+' credits'; $('#ai-generation-loading').hidden=true; $('#ai-generation-result').hidden=false; $('#generate-ai-design').disabled=false;
    },650);
  }
  function useBanner() {
    if (!generated) return;
    if (BANNERS.length>=8) { $('#ai-generator-error').textContent=text('Tối đa 8 banner','Max 8 banners'); return; }
    BANNERS.push({...generated}); generated=null; dialog().close(); PV9='banner'; drawLP();
  }

  function replaceText(node) {
    if (!node.parentElement || node.parentElement.closest('script,style,textarea,pre,code,select,[contenteditable],.po-oneqr-icon,.oneqr-flat-icon')) return;
    const matches=Array.from(node.data.matchAll(emojiPattern)); if (!matches.length) return;
    const fragment=document.createDocumentFragment(); let offset=0;
    matches.forEach(match => {
      fragment.append(document.createTextNode(node.data.slice(offset,match.index)));
      const wrapper=document.createElement('span'); wrapper.className='po-oneqr-icon';
      wrapper.innerHTML=icon(iconName(match[0]))+'<span class="po-icon-source">'+escape(match[0])+'</span>';
      fragment.append(wrapper); offset=match.index+match[0].length;
    });
    fragment.append(document.createTextNode(node.data.slice(offset))); node.replaceWith(fragment);
  }
  function hydrate(root) {
    if (!root.isConnected) return;
    if (root.nodeType===Node.TEXT_NODE) { replaceText(root); return; }
    if (root.nodeType!==Node.ELEMENT_NODE) return;
    root.querySelectorAll('select[data-po-select]').forEach(mountSelect);
    if (root.matches('select[data-po-select]')) mountSelect(root);
    root.querySelectorAll('[data-icon]').forEach(node => {
      const name=node.dataset.icon;
      if (name==='x') node.textContent='×';
      else node.innerHTML=icon(({gauge:'settings-2',history:'clock','loader-2':'clock',play:'video'})[name]||name);
      node.removeAttribute('data-icon');
    });
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceText);
  }
  function init() {
    const aiIndustry=$('#ai-brand-industry');
    aiIndustry.innerHTML=industryOptions(LIB.tax,'nail',(vi,en)=>en);
    const aiLabel=()=>{ const selected=aiIndustry.selectedOptions[0]; $('#ai-brand-industry-summary').innerHTML=icon(selected.dataset.poIcon)+'<span>'+escape(selected.textContent)+'</span>'; };
    aiIndustry.addEventListener('change',aiLabel); aiLabel(); updateCost();
    dialog().addEventListener('close',()=>{ clearTimeout(generationTimer); $('#generate-ai-design').disabled=false; });
    document.addEventListener('change',event => {
      if (event.target.matches('[data-svc-category]')) toggleServiceCategory(event.target);
      if (event.target.dataset.poSelect==='goal') { TPG=Number(event.target.value); TPN=20; drawTP(); }
      if (event.target.dataset.poSelect==='service') { TPS=Number(event.target.value); TPN=20; drawTP(); }
    });
    document.addEventListener('input',event => { if(event.target.id==='pgCap') monthlyCap=event.target.value; if(event.target.closest('#quick-create')) summary(SEL_SVC); });
    document.addEventListener('change',event => { if(event.target.closest('#quick-create')) summary(SEL_SVC); });
    document.addEventListener('click',event => {
      const button=event.target.closest('button'); if(!button) return;
      if(button.id==='generate-ai-banner'||button.dataset.en==='Generate banner') { stopTour(); openBanner(); }
      if(button.id==='close-ai-banner') dialog().close();
      if(button.id==='generate-ai-design') generateBanner();
      if(button.id==='use-ai-banner') useBanner();
      if(button.id==='ai-quality-trigger') { const menu=$('#ai-quality-menu'); menu.hidden=!menu.hidden; }
      if(button.dataset.aiQuality) { quality=button.dataset.aiQuality; updateCost(); $('#ai-quality-menu').hidden=true; }
      if(button.id==='ai-reference-history') $('#ai-reference-history-list').hidden=!$('#ai-reference-history-list').hidden;
      if(button.dataset.aiHistory) { const theme={purple:'sig',gold:'gold',rose:'rose',blue:'ocean'}[button.dataset.aiHistory]; reference=BANNERS.find(banner=>banner.th===theme&&banner.img)?.img||null; $('#ai-reference-text').textContent='Generated '+button.dataset.aiHistory+' banner selected'; $('#ai-reference-history-list').hidden=true; }
      if(button.id==='remove-ai-reference') { reference=null; $('#ai-reference-file').value=''; $('#ai-reference-preview').hidden=true; $('#ai-reference-upload').hidden=false; }
      for(const group of ['ai-content-types','ai-tone-options']) if(button.closest('#'+group)) document.querySelectorAll('#'+group+' button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    });
    $('#ai-reference-file').addEventListener('change',event => {
      const file=event.target.files[0]; if(!file) return;
      if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)) { $('#ai-generator-error').textContent='Reference image must be a JPG, PNG, or WebP file, 5 MB or smaller.'; event.target.value=''; return; }
      const reader=new FileReader(); reader.onload=()=>{reference=reader.result; $('#ai-reference-preview-image').src=reference; $('#ai-reference-name').textContent=file.name; $('#ai-reference-preview').hidden=false; $('#ai-reference-upload').hidden=true;}; reader.readAsDataURL(file);
    });
    const observer=new MutationObserver(records=>{
      observer.disconnect();
      records.forEach(record=>{
        if(record.type==='characterData') hydrate(record.target);
        else record.addedNodes.forEach(hydrate);
      });
      observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    });
    hydrate(document.body); observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    fetch('../menu/menu.json').then(response=>{if(!response.ok) throw new Error('Menu unavailable'); return response.json();}).then(menu=>{
      const groups=(menu.sections||[]).filter(section=>section.kind==='service'||section.kind==='add-on').map(section=>({name:section.title,services:(section.items||[]).filter(item=>item.active!==false).map(item=>item.name)}));
      if(groups.length){menuGroups=groups;drawSvc();summary(SEL_SVC);}
    }).catch(()=>{/* The original PO service groups remain available offline. */});
  }
  window.NEXORA_PROMOTION_FEEDBACK={industrySelect,goalSelect,serviceGroupSelect,services,syncServiceCategoryChecks,toggleService,channelCards,summary,date,dateRange,publish,publicationStatus,reviewBoost,monthlyCap:()=>monthlyCap,setMonthlyCap:value=>{monthlyCap=value;}};
  document.addEventListener('DOMContentLoaded',init,{once:true});
})();
