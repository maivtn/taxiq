/* UI and copy: staging-web.nexoratouch.com/dashboard/pos/sms-campaigns,
 * observed Oct 27, 2026. Campaign and credit actions are browser-only demos. */
(function () {
  'use strict';
  const root = document.getElementById('sms-workspace');
  if (!root) return;
  const $ = selector => document.querySelector(selector);
  const key = 'nexora.sms-campaigns.preview.v1';
  const number = value => Number(value || 0).toLocaleString('en-US');
  const money = value => '$' + Number(value || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:3});
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  const dateLabel = value => new Date(value.length === 10 ? value + 'T12:00:00' : value).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'});
  const timeLabel = value => { const [h,m] = value.split(':').map(Number); return (h % 12 || 12) + ':' + String(m).padStart(2,'0') + (h < 12 ? ' am' : ' pm'); };
  const groups = [
    {id:'all',name:'All',short:'All',count:6344},
    {id:'new',name:'New Customers',short:'New',count:131,icon:'user-round-plus',color:'#078aa2',status:'Ready',description:"First-time callers who haven't returned. Welcome + offer to lock in visit #2."},
    {id:'day15',name:'15 Days No Visit',short:'15 Days',count:4,icon:'calendar-days',color:'#08ad79',status:'Ready',description:'Gentle reminder — nails need a touch-up?'},
    {id:'day30',name:'30 Days No Visit',short:'30 Days',count:52,icon:'clock',color:'#8b4df3',status:'Scheduled',description:'Been a while — send a strong offer to bring them back.'},
    {id:'day60',name:'60 Days Inactive',short:'60 Days',count:3439,icon:'refresh-cw',color:'#f49b12',status:'Ready',description:'About to lose them — strongest win-back offer.'},
    {id:'vip',name:'VIP Customers',short:'VIP',count:1,icon:'star',color:'#e94092',status:'Sent',description:'Top spenders — priority booking, exclusive offers.'},
    {id:'birthday',name:'Birthdays This Month',short:'Birthday',count:1,icon:'gift',color:'#f49b12',status:'Auto',description:'Auto-send — free nail art or discount gift.'}
  ];
  const templates = {
    all:[['📣 All customers','Hi {name}! {shop} has a new offer for you. Book today: {link}'],['✨ Salon update','Hi {name}! Visit {shop} to discover our latest services and offers: {link}']],
    new:[['🌟 Welcome Back','Hi {name}! Thanks for visiting {shop}. Book again today and get 15% OFF your next visit! {link}'],['🎁 First Return Offer','Hi {name}! {shop} has a special offer for you — Free nail art with a full set. Book: {link}']],
    day15:[['💅 Touch Up Reminder','Hi {name}! Time for a touch-up. {shop} has openings this week — Book now: {link}'],['⭐ Quick Check-in',"Hi {name}! It's been a while. {shop} has a special deal this week. See it: {link}"]],
    day30:[['🔥 30-Day Comeback',"Hey {name}! It's been a month. {shop} misses you — 20% OFF when you return this week. Book: {link}"],['💖 Miss You Offer','Hi {name}! {shop} has a promo for returning guests. Check it before it ends: {link}']],
    day60:[['🔥 Win-Back Offer','Hi {name}! {shop} has a special for you — 30% OFF + free gel hands. This week only: {link}'],['💎 VIP Win-Back','Hi {name}! We miss you. Come back to {shop} this week for a special combo: {link}']],
    vip:[['💎 VIP Priority','Hi {name}! As a VIP guest, you get priority booking for the season. Book now: {link}'],['⭐ Exclusive VIP Offer','Hi {name}! {shop} launched a new service — VIP guests try free. Book: {link}']],
    birthday:[['🎂 Happy Birthday','Happy birthday {name}! {shop} gives you FREE nail art today. Book your birthday visit: {link}'],['🎁 Birthday Gift','Happy Birthday {name}! Gift from {shop}: 25% OFF + free hand care. Book: {link}']]
  };
  const packages = [
    {name:'SMS Starter',credits:500,price:25},
    {name:'SMS Plus',credits:1500,price:59},
    {name:'SMS Pro',credits:3000,price:99},
    {name:'SMS Business',credits:6000,price:179,best:true}
  ];
  // Reuse a demo customer from the previous local SMS prototype, not staging contacts.
  const sampleRecipient = {name:'Maria Gonzalez',phone:'(832) 340-2276'};
  const initialCampaign = {id:'sms-example',name:'SMS Campaign',group:'birthday',count:1,mode:'now',status:'Sent',sent:1,failed:0,segments:1,created:'2026-10-13T16:18:00',recipients:[{...sampleRecipient,status:'Sent',segments:1,sentAt:'2026-10-13T16:18:00'}]};
  let store;
  try { store = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) {}
  if (!store || !Array.isArray(store.campaigns) || !Number.isFinite(store.credits)) store = {credits:24883,campaigns:[initialCampaign],purchases:[]};
  let currentGroup = 'all', mode = 'now', templateIndex = -1, page = 1, recipientPage = 1, activeCampaign = null, chosenPackage = 3, cardSelected = false;
  const composer = $('#sms-composer'), recipients = $('#sms-recipients'), buy = $('#sms-buy');
  const save = () => { try { localStorage.setItem(key, JSON.stringify(store)); } catch (_) {} };
  const refreshIcons = () => window.lucide?.createIcons?.();
  const group = id => groups.find(item => item.id === id) || groups[0];
  const badge = status => '<span class="sms-badge ' + esc(status.toLowerCase()) + '">' + esc(status) + '</span>';
  function pagination(count, selected, target) {
    const pages = Math.max(1,Math.ceil(count/10));
    const buttons = [];
    for (let i = Math.max(1,selected-2); i <= Math.min(pages,selected+2); i++) buttons.push('<button class="sms-page" type="button" data-sms-page="'+i+'" data-sms-list="'+target+'" '+(i===selected?'aria-current="page"':'')+'>'+i+'</button>');
    return '<div class="sms-pagination"><span>Showing <strong>'+(count?(selected-1)*10+1:0)+'</strong> to <strong>'+Math.min(selected*10,count)+'</strong> of <strong>'+number(count)+'</strong> results</span><nav aria-label="Pagination"><button type="button" class="sms-page" aria-label="Previous" data-sms-page="'+(selected-1)+'" data-sms-list="'+target+'" '+(selected===1?'disabled':'')+'>'+icon('chevron-left')+'</button>'+buttons.join('')+'<button type="button" class="sms-page" aria-label="Next" data-sms-page="'+(selected+1)+'" data-sms-list="'+target+'" '+(selected===pages?'disabled':'')+'>'+icon('chevron-right')+'</button></nav></div>';
  }
  function render() {
    $('#sms-credit-count').textContent = number(store.credits);
    $('#sms-credit-value').textContent = '≈ ' + money(store.credits * .025) + ' remaining';
    const month = today().slice(0,7);
    const monthCampaigns = store.campaigns.filter(c => String(c.created).startsWith(month));
    const stats = [
      ['Total customers',6359,'#078aa2'],
      ['SMS sent this month',monthCampaigns.reduce((sum,c)=>sum+Number(c.sent||0),0),'#8b4df3'],
      ['Campaigns sent this month',monthCampaigns.filter(c=>c.status==='Sent').length,'#08ad79'],
      ['Active auto campaigns',store.campaigns.filter(c=>c.mode==='auto'&&c.status!=='Cancelled').length,'#f49b12']
    ];
    $('#sms-stats').innerHTML = stats.map(([label,value,color])=>'<article class="sms-stat" style="--accent:'+color+'"><span>'+label+'</span><strong>'+number(value)+'</strong></article>').join('');
    $('#sms-groups').innerHTML = groups.slice(1).map(g=>'<button type="button" class="sms-group" data-sms-group="'+g.id+'" style="--accent:'+g.color+'"><span class="sms-group-icon">'+icon(g.icon)+'</span><span class="sms-group-copy"><strong>'+esc(g.name)+'</strong><small>'+esc(g.description)+'</small></span><span class="sms-group-footer"><span><strong>'+number(g.count)+'</strong> customers'+(g.id==='birthday'?' this month':'')+'</span>'+badge(g.status)+'</span></button>').join('');
    page = Math.min(page, Math.max(1,Math.ceil(store.campaigns.length/10)));
    $('#sms-campaign-rows').innerHTML = store.campaigns.slice((page-1)*10,page*10).map(c=>'<tr><td>'+esc(c.name)+'</td><td>'+esc(group(c.group).name)+'</td><td>'+({now:'Now',schedule:'Schedule',auto:'Automated'}[c.mode]||'Now')+'</td><td>'+badge(c.status)+'</td><td>'+number(c.sent)+'</td><td>'+number(c.failed)+'</td><td><button type="button" class="sms-button" data-sms-recipients="'+esc(c.id)+'" aria-label="View recipients for '+esc(c.name)+'">View</button></td></tr>').join('');
    $('#sms-campaign-pagination').innerHTML = pagination(store.campaigns.length,page,'campaigns');
    refreshIcons();
  }
  function show(dialog) {
    for (const other of [composer,recipients,buy]) if (other.open) other.close();
    dialog.showModal();
    dialog.scrollTop = 0;
    refreshIcons();
  }
  function renderAudiences() {
    $('#sms-audiences').innerHTML = groups.map(g=>'<button type="button" class="sms-audience" data-sms-audience="'+g.id+'" aria-pressed="'+(g.id===currentGroup)+'"><strong>'+esc(g.short)+'</strong><span>'+number(g.count)+' customers</span></button>').join('');
    $('#sms-templates').innerHTML = templates[currentGroup].map(([title,text],index)=>'<button type="button" class="sms-template" data-sms-template="'+index+'" aria-pressed="'+(templateIndex===index)+'"><strong>'+icon('sparkles')+esc(title)+'</strong><span>'+esc(text)+'</span></button>').join('');
    refreshIcons();
  }
  function openComposer(id = 'all') {
    $('#sms-campaign-form').reset();
    currentGroup = group(id).id; mode = 'now'; templateIndex = -1;
    $('#sms-schedule-date').value = today();
    $('#sms-schedule-date').min = today();
    $('#sms-schedule-time').value = '10:00';
    renderAudiences();
    updateComposer();
    show(composer);
    $('#sms-campaign-name').focus();
  }
  const gsmBasic = new Set('@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà');
  const gsmExtended = new Set('^{}\\[~]|€\f');
  function encoding(message) {
    const text = message.trim() + (message.trim() ? '\nReply STOP to opt out.' : '');
    let units = 0, unicode = false;
    for (const c of text) { if (gsmExtended.has(c)) units += 2; else if (gsmBasic.has(c)) units++; else { unicode = true; break; } }
    if (unicode) units = text.length;
    const single = unicode ? 70 : 160, multiple = unicode ? 67 : 153;
    return {name:unicode?'Ucs2':'Gsm7',limit:single,segments:units?Math.ceil(units/(units<=single?single:multiple)):0};
  }
  function composeEstimate() {
    const message = $('#sms-message').value, data = encoding(message), audience = group(currentGroup);
    const perCustomer = Math.max(1,data.segments), total = audience.count * perCustomer;
    return {message,data,audience,perCustomer,total,cost:total*25/1000};
  }
  function updateComposer() {
    const {message,data,audience,perCustomer,total,cost} = composeEstimate();
    $('#sms-message-count').textContent = message.length+' chars — '+data.segments+' SMS ('+data.name+', '+data.limit+'/msg)';
    const previewValues = {name:'Maria',shop:'Bitcoin Nail Bar',link:'https://nexora.ai/btcnailbar/comeback-offer-july',phone:sampleRecipient.phone};
    $('#sms-phone-message').textContent = message ? message.replace(/\{(name|shop|link|phone)\}/g,(_,token)=>previewValues[token]) + '\nReply STOP to opt out.' : 'Your message will appear here...';
    $('#sms-phone-message').classList.toggle('empty',!message);
    composer.querySelectorAll('[data-sms-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.smsMode===mode)));
    $('#sms-schedule-fields').hidden = mode !== 'schedule';
    $('#sms-schedule-date').required = mode === 'schedule';
    $('#sms-schedule-time').required = mode === 'schedule';
    $('#sms-date-display').textContent = $('#sms-schedule-date').value ? dateLabel($('#sms-schedule-date').value) : 'Select date';
    const when = mode==='now'?'Send immediately':mode==='auto'?'Automated by segment rules':($('#sms-schedule-date').value?dateLabel($('#sms-schedule-date').value):'Select date')+' at '+timeLabel($('#sms-schedule-time').value||'10:00');
    $('#sms-confirm-details').innerHTML = 'Group: <strong>'+esc(audience.name)+'</strong> ('+number(audience.count)+' customers)<br>Messages: <strong>'+total+' SMS</strong> ('+perCustomer+' per customer, '+data.name+')<br>Cost: <strong>'+money(cost)+'</strong> — deduct '+total+' credits<br>Schedule: <strong>'+esc(when)+'</strong>';
    $('#sms-estimate').textContent = number(audience.count)+' customers × '+perCustomer+' SMS = '+total+' SMS ('+money(cost)+')';
    $('#sms-send').disabled = total > store.credits || audience.count===0;
  }
  function renderRecipients() {
    if (!activeCampaign) return;
    const status = $('#sms-recipient-status').value;
    const list = (activeCampaign.recipients || []).filter(r=>status==='All statuses'||r.status===status);
    recipientPage = Math.min(recipientPage,Math.max(1,Math.ceil(list.length/10)));
    $('#sms-recipient-campaign').textContent = activeCampaign.name;
    $('#sms-recipient-count').textContent = number(list.length)+' recipients';
    $('#sms-recipient-rows').innerHTML = list.slice((recipientPage-1)*10,recipientPage*10).map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+esc(r.phone)+'</td><td>'+badge(r.status)+'</td><td>'+number(r.segments)+'</td><td>'+(r.sentAt?dateLabel(r.sentAt)+' '+timeLabel(new Date(r.sentAt).toTimeString().slice(0,5)):'—')+'</td></tr>').join('') || '<tr><td colspan="5">No recipients sent for this campaign yet.</td></tr>';
    $('#sms-recipient-pagination').innerHTML = list.length ? pagination(list.length,recipientPage,'recipients') : '';
    refreshIcons();
  }
  function renderPurchase() {
    $('#sms-packages').innerHTML = packages.map((p,index)=>'<button class="sms-package" type="button" data-sms-package="'+index+'" aria-pressed="'+(chosenPackage===index)+'">'+(p.best?'<em>Best value</em>':'')+'<strong>'+p.name+'</strong><span>'+number(p.credits)+' SMS</span><b>'+money(p.price)+'</b><small>'+number(p.credits)+' SMS segments</small></button>').join('');
    const selected = packages[chosenPackage];
    $('#sms-invoice-package').textContent = number(selected.credits)+' SMS';
    $('#sms-invoice-total').textContent = money(selected.price);
    $('#sms-invoice-method').textContent = cardSelected?'Credit or Debit Card':'_';
    $('#sms-card-method').setAttribute('aria-pressed',String(cardSelected));
    $('#sms-confirm-payment').disabled = !cardSelected;
  }
  document.addEventListener('click',event=>{
    const target = event.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-sms-close')) { target.closest('dialog')?.close(); return; }
    if (target.dataset.smsAction === 'create') { openComposer(); return; }
    if (target.dataset.smsGroup) { openComposer(target.dataset.smsGroup); return; }
    if (target.dataset.smsAudience) { currentGroup=target.dataset.smsAudience;templateIndex=-1;renderAudiences();updateComposer();return; }
    if (target.dataset.smsTemplate !== undefined) { templateIndex=Number(target.dataset.smsTemplate);$('#sms-message').value=templates[currentGroup][templateIndex][1];renderAudiences();updateComposer();return; }
    if (target.dataset.smsToken) {
      const field=$('#sms-message'),start=field.selectionStart,end=field.selectionEnd,token='{'+target.dataset.smsToken+'}';
      field.setRangeText(token,start,end,'end');field.focus();templateIndex=-1;renderAudiences();updateComposer();return;
    }
    if (target.dataset.smsMode) { mode=target.dataset.smsMode;updateComposer();return; }
    if (target.dataset.smsRecipients) { activeCampaign=store.campaigns.find(c=>c.id===target.dataset.smsRecipients);recipientPage=1;$('#sms-recipient-status').value='All statuses';renderRecipients();show(recipients);return; }
    if (target.dataset.smsPage) { if(target.dataset.smsList==='campaigns'){page=Number(target.dataset.smsPage);render();}else{recipientPage=Number(target.dataset.smsPage);renderRecipients();}return; }
    if (target.dataset.smsAction === 'buy') { chosenPackage=3;cardSelected=false;renderPurchase();show(buy);return; }
    if (target.dataset.smsPackage !== undefined) { chosenPackage=Number(target.dataset.smsPackage);renderPurchase();return; }
    if (target.id === 'sms-card-method') { cardSelected=true;renderPurchase();return; }
    if (target.dataset.smsAction === 'retry-wallet') {
      // Wallet access is deliberately unavailable in this local prototype.
      cardSelected=false;renderPurchase();return;
    }
    if (target.id === 'sms-confirm-payment' && cardSelected) {
      const selected=packages[chosenPackage];
      store.credits+=selected.credits;
      if(!Array.isArray(store.purchases))store.purchases=[];
      store.purchases.push({package:selected.name,credits:selected.credits,amount:selected.price,created:new Date().toISOString(),localOnly:true});
      save();buy.close();render();return;
    }
  });
  $('#sms-message').addEventListener('input',()=>{templateIndex=-1;composer.querySelectorAll('[data-sms-template]').forEach(button=>button.setAttribute('aria-pressed','false'));updateComposer();});
  $('#sms-schedule-date').addEventListener('input',updateComposer);
  $('#sms-schedule-time').addEventListener('input',updateComposer);
  $('#sms-recipient-status').addEventListener('change',()=>{recipientPage=1;renderRecipients();});
  $('#sms-campaign-form').addEventListener('submit',event=>{
    event.preventDefault();
    if(!event.currentTarget.reportValidity())return;
    const name=$('#sms-campaign-name').value.trim();
    if(!name){$('#sms-campaign-name').focus();return;}
    const details=composeEstimate();
    if(!details.message.trim()||details.total>store.credits)return;
    if(mode==='schedule'&&new Date($('#sms-schedule-date').value+'T'+$('#sms-schedule-time').value)<=new Date()){
      $('#sms-schedule-date').focus();return;
    }
    const created=new Date().toISOString();
    // Save a pending local preview. No delivery service or payment API is called.
    store.campaigns.unshift({id:'sms-local-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name,group:currentGroup,count:details.audience.count,message:details.message,mode,status:mode==='schedule'?'Scheduled':'Pending',sent:0,failed:0,segments:details.perCustomer,created,scheduleDate:mode==='schedule'?$('#sms-schedule-date').value:'',scheduleTime:mode==='schedule'?$('#sms-schedule-time').value:'',recipients:[],localOnly:true});
    save();page=1;composer.close();render();
  });
  for(const dialog of [composer,recipients,buy])dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  });
  render();
})();
