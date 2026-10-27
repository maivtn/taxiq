/* Missing Settings content from Nexora staging, observed Oct 27, 2026.
 * Sources: /dashboard/settings/{profile,staff,kyb,affiliate,privacy} and staff detail.
 * All edits, invitations and account changes below stay in the local HTML demo. */
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const profileHost = $('[data-owner-staff-profile]');
  const panels = Object.fromEntries(['account','business-verification','staff','affiliate-link','terms-privacy'].map(id=>[id,$('[data-settings-panel="'+id+'"]')]));
  if (!profileHost && !panels.account) return;
  const key = 'nexora.owner-settings-content.v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isWebURL = value => {try{return ['http:','https:'].includes(new URL(value).protocol);}catch(_){return false;}};
  const icon = name => '<i data-lucide="'+name+'" aria-hidden="true"></i>';
  const date = value => value ? new Date(value.length===10?value+'T12:00:00':value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
  const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0);
  const today = () => { const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  const methods = [
    {id:'zelle',label:'Zelle',image:'zelle.png',placeholder:'Enter Zelle email or phone...'},
    {id:'cashapp',label:'Cash App',image:'cash_app.png',placeholder:'Enter Cash App $cashtag, email, or phone...'},
    {id:'venmo',label:'Venmo',image:'venmo.png',placeholder:'Enter Venmo @username...'},
    {id:'vlinkpay',label:'VLINKPAY Wallet',image:'vlinkpay.png'},
    {id:'applecash',label:'Apple Cash',image:'apple_cash.png',placeholder:'Enter Apple Cash email or phone...'},
    {id:'paypal',label:'PayPal',image:'paypal.png',placeholder:'email@paypal.com'}
  ];
  const emptyPayments = () => Object.fromEntries(methods.map(m=>[m.id,{enabled:false,holder:'',identifier:'',qr:'',usdv:'',usdt:''}]));
  function initialState() {
    const catalog=window.NEXORA_SALON_DATA?.loadCatalog();
    return {
      owner:{name:'Mai Tran',email:'mai@nexoratouch.com',dob:'1990-01-01',phone:'+1 832 555 0182',address:'Houston, Texas, USA',avatar:'',pendingEmail:''},
      business:{name:catalog?.salon?.name||'Bitcoin Nail Bar',phone:'+1 832 555 0182',bookingPhone:'+1 832 555 0182',address:'9793 Westheimer Rd Suite A, Houston, TX 77042',email:'mai@nexoratouch.com',website:'',tax:'—',logo:'assets/btc.png'},
      reviews:{google:'',yelp:'',facebook:'',instagram:''},
      payments:emptyPayments(),
      staff:(catalog?.technicians||[]).map(t=>({id:t.id,name:t.name,nickname:'',role:'Nail Technician',active:t.active!==false,tips:true,phone:t.phone||'',email:t.email||'',avatar:'',joined:'2026-10-01',payments:emptyPayments()})),
      invites:[],leg:'left'
    };
  }
  let state;
  try {state=JSON.parse(localStorage.getItem(key)||'null');}catch(_){}
  if (!state?.owner || !Array.isArray(state.staff) || !state.payments) state=initialState();
  for(const member of state.staff)member.payments=member.payments||emptyPayments();
  let dialog=$('#owner-content-dialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='owner-content-dialog';dialog.className='osc-dialog';document.body.append(dialog);}
  let staffPage=1,sort='name',trend='7 Days',reviewFilter='All',staffDraft=null,addMode='existing',trendFrom='',trendTo='';
  const save = () => {try{localStorage.setItem(key,JSON.stringify(state));}catch(_){} };
  const refreshIcons = () => window.lucide?.createIcons?.();
  const button = (label,action,extra='',kind='') => '<button class="osc-button '+kind+'" type="button" data-osc-action="'+action+'" '+extra+'>'+label+'</button>';
  const actions = (label='Save') => '<footer class="osc-dialog-footer">'+button('Cancel','close')+'<button class="osc-button primary" type="submit">'+label+'</button></footer>';
  const row = (label,value) => '<div class="osc-row"><span>'+label+'</span><strong>'+esc(value||'—')+'</strong></div>';
  const dateField = (label,name,value) => '<label class="osc-field"><span>'+label+'</span><span class="osc-date"><span data-osc-date-display>'+esc(value?date(value):label)+'</span><input type="date" name="'+name+'" value="'+esc(value)+'" aria-label="'+label+'"></span></label>';
  const field = (label,name,value='',options={}) => options.type==='date'?dateField(label,name,value): '<label class="osc-field"><span>'+label+(options.required?' *':'')+'</span><input type="'+(options.type||'text')+'" name="'+name+'" value="'+esc(value)+'" '+(options.placeholder?'placeholder="'+esc(options.placeholder)+'" ':'')+(options.required?'required ':'')+(options.maxlength?'maxlength="'+options.maxlength+'" ':'')+' autocomplete="off"></label>';
  const avatar = (member,size='') => '<span class="osc-avatar '+size+'">'+(member.avatar?'<img src="'+esc(member.avatar)+'" alt="">':esc((member.nickname||member.name||'N').split(' ').map(x=>x[0]).slice(0,2).join('')))+'</span>';
  const paymentImage = m => '<img src="assets/icons/'+m.image+'" alt="'+m.label+' logo">';
  const visibleName = member => member.nickname||member.name;
  const staffById = id => state.staff.find(member=>member.id===id);
  // Same public payment destination used by QR Stations; never open a merchant report from a customer QR.
  const paymentURL = () => 'https://staging-web.nexoratouch.com/pay/3d1d5426-4a7d-476b-9a0d-b651b3020327';
  const inviteURL = () => 'https://staging-web.nexoratouch.com/invite/public/blnexora?ref=71C25492&source=public_link';
  const referralURL = leg => 'https://staging-web.nexoratouch.com/?ref=71C25492'+(leg?'&leg='+leg:'');
  function openDialog(title,body,onSubmit,wide=false) {
    if(dialog.open)dialog.close();
    dialog.classList.toggle('wide',wide);
    dialog.setAttribute('aria-labelledby','osc-dialog-title');
    dialog.innerHTML='<header class="osc-dialog-head"><h2 id="osc-dialog-title">'+esc(title)+'</h2>'+button(icon('x'),'close','aria-label="Close"')+'</header>'+body;
    if(onSubmit)dialog.querySelector('form')?.addEventListener('submit',event=>{event.preventDefault();if(event.currentTarget.reportValidity())onSubmit(new FormData(event.currentTarget),event.currentTarget);});
    dialog.showModal();refreshIcons();
  }
  function drawQR(host,text,size=180) {
    if(!host)return;host.replaceChildren();
    if(window.QRCode)new window.QRCode(host,{text,width:size,height:size,correctLevel:window.QRCode.CorrectLevel.M});
  }
  function qrDialog(title,text,description='') {
    openDialog(title,'<div class="osc-dialog-body"><div class="osc-qr-card">'+(description?'<p>'+esc(description)+'</p>':'')+'<div class="osc-qr" data-osc-dialog-qr></div><a href="'+esc(text)+'" target="_blank" rel="noopener noreferrer">'+esc(text)+'</a><div class="osc-actions">'+button('Download QR','download-qr')+button('Copy Link','copy','data-value="'+esc(text)+'"')+'</div></div></div>');
    drawQR(dialog.querySelector('[data-osc-dialog-qr]'),text,230);
  }
  function paymentRows(payments,context,readOnly=false) {
    return methods.map(m=>{const p=payments[m.id]||{},configured=!!(p.identifier||p.usdv||p.usdt);return '<div class="osc-payment-row"><div class="osc-payment-info"><input type="checkbox" class="osc-toggle" role="switch" aria-label="Toggle '+m.label+'" data-osc-payment-toggle="'+m.id+'" data-context="'+context+'" '+(readOnly?'disabled ':'')+(p.enabled?'checked':'')+'>'+paymentImage(m)+'<div><strong>'+m.label+'</strong><small>'+esc(configured?(m.id==='vlinkpay'?['USDV '+(p.usdv||''),'USDT '+(p.usdt||'')].join(' · '):[p.holder,p.identifier].filter(Boolean).join(' · ')):'Not Configured')+'</small></div></div><div class="osc-actions">'+(configured?button('View','payout-view','data-method="'+m.id+'" data-context="'+context+'" aria-label="View '+m.label+' Payout Details"'):'')+(readOnly?'':button(configured?'Edit':'Add Account','payout-edit','data-method="'+m.id+'" data-context="'+context+'" aria-label="Edit '+m.label+' Payout Account"'))+'</div></div>';}).join('');
  }
  function renderAccount() {
    const p=state.owner,b=state.business;
    panels.account.classList.add('osc-content');
    panels.account.innerHTML='<div class="osc-stack"><section class="osc-card osc-identity"><div class="osc-avatar-wrap"><label class="osc-file" aria-label="Edit">'+avatar(p)+'<input type="file" accept="image/*" data-osc-upload="avatar"></label><span class="osc-owner-badge">Business Owner</span></div><div class="osc-identity-info"><div>Email: <strong>'+esc(p.email)+'</strong> '+button('Change '+icon('pencil'),'email','','quiet')+'</div><div>Referral Link: <strong>'+esc(referralURL())+'</strong> '+button('Copy '+icon('copy'),'copy','data-value="'+esc(referralURL())+'"','quiet')+button('Show QR '+icon('qr-code'),'referral-qr','','quiet')+'</div></div></section><div class="osc-grid"><section class="osc-card"><h4>'+icon('user-round')+'Personal Information</h4>'+row('Full Name',p.name)+row('Date of Birth',date(p.dob))+row('Personal Phone',p.phone)+row('Home Address',p.address)+'</section><section class="osc-card"><div class="osc-card-head"><h4>'+icon('building-2')+'Business Information</h4><span class="osc-tag">'+icon('shield-check')+'KYB Verified</span></div><p>Business information is locked because this account is KYB verified.</p><label class="osc-file osc-logo-row"><img src="'+esc(b.logo)+'" alt="Business Logo"><span><strong>Business Logo</strong><small>Shown to customers on tip and booking pages. Click to upload a new image.</small></span><input type="file" accept="image/*" data-osc-upload="logo"></label>'+row('Business Name',b.name)+row('Business Phone',b.phone)+row('Booking Notification Phone',b.bookingPhone)+row('Business Address',b.address)+row('Business Email',b.email)+row('Website',b.website)+row('Sales Tax Rate (%)',b.tax)+'</section></div><div class="osc-grid"><section class="osc-card" id="osc-review-links"></section><section class="osc-card"><h4>'+icon('map-pin')+'Business Location</h4><p><strong>Business Address:</strong> '+esc(b.address)+'</p><iframe class="osc-map" title="Business Location" loading="lazy" referrerpolicy="no-referrer" src="https://maps.google.com/maps?q='+encodeURIComponent(b.address)+'&amp;output=embed"></iframe></section></div><div class="osc-qr-grid"><section class="osc-card osc-qr-card"><h3>'+icon('qr-code')+'Payment QR</h3><div class="osc-qr" data-owner-payment-qr></div><strong>'+esc(b.name)+'</strong><p>Scan to pay '+esc(b.name)+'</p><div class="osc-actions">'+button('View QR to Download','payment-qr')+button('Copy Payment Link','copy','data-value="'+esc(paymentURL())+'"')+'<a class="osc-button" href="payment-activity.html">Payment Activity</a></div></section><section class="osc-card"><h3>'+icon('wallet-cards')+'Receive Payment Methods</h3><div class="osc-payment-list">'+paymentRows(state.payments,'owner')+'</div></section></div></div>';
    renderReviewLinks(false);
    drawQR(panels.account.querySelector('[data-owner-payment-qr]'),paymentURL());
  }
  const reviewFields = [['google','Google Review Link','https://g.page/r/.../review'],['yelp','Yelp Review Link','https://www.yelp.com/biz/...'],['facebook','Facebook','https://facebook.com/your-salon'],['instagram','Instagram','https://instagram.com/your-salon']];
  function renderReviewLinks(editing) {
    const host=$('#osc-review-links');if(!host)return;
    host.innerHTML='<div class="osc-card-head"><h4>'+icon('globe')+'Business Review Links</h4>'+(!editing?button(icon('pencil'),'review-edit','aria-label="Edit Review Links"','quiet'):'')+'</div>'+(editing?'<form id="osc-review-form" class="osc-stack">'+reviewFields.map(([id,label,placeholder])=>field(label,id,state.reviews[id],{type:'url',placeholder})).join('')+'<div class="osc-actions">'+button('CANCEL','review-cancel')+'<button class="osc-button primary" type="submit">SAVE</button></div></form>':reviewFields.map(([id,label])=>'<div class="osc-review-item"><strong>'+label+'</strong>'+(isWebURL(state.reviews[id])?'<a href="'+esc(state.reviews[id])+'" target="_blank" rel="noopener noreferrer">'+esc(state.reviews[id])+'</a>':'<span>Not Configured</span>')+'</div>').join(''));
    if(editing)$('#osc-review-form').addEventListener('submit',event=>{event.preventDefault();if(!event.currentTarget.reportValidity())return;const data=new FormData(event.currentTarget);for(const [id] of reviewFields)state.reviews[id]=String(data.get(id)||'').trim();save();renderReviewLinks(false);});
    refreshIcons();
  }
  function emailDialog() {
    openDialog('Change login email','<form><div class="osc-dialog-body"><p>Current email: '+esc(state.owner.email)+'</p><p>For your security, we will send a confirmation link to your current email. Your email changes only after you open that link.</p>'+field('New email','email','',{type:'email',placeholder:'e.g. you@example.com',required:true})+field('Confirm new email','confirm','',{type:'email',placeholder:'Re-enter your new email',required:true})+field('Current password','password','',{type:'password',placeholder:'Enter your current password',required:true})+button('Show password','password')+'</div>'+actions('Confirm')+'</form>',(data,form)=>{if(data.get('email')!==data.get('confirm')){form.elements.confirm.setCustomValidity('Confirm new email');form.elements.confirm.reportValidity();return;}state.owner.pendingEmail=String(data.get('email'));save();dialog.close();});
    dialog.querySelectorAll('[name=email],[name=confirm]').forEach(input=>input.addEventListener('input',()=>dialog.querySelector('[name=confirm]').setCustomValidity('')));
  }
  function paymentsFor(context) {return context==='owner'?state.payments:context==='draft'?staffDraft?.payments:staffById(context)?.payments;}
  function payoutView(methodId,context) {
    const m=methods.find(x=>x.id===methodId),p=paymentsFor(context)?.[methodId];if(!m||!p)return;
    openDialog(m.label,'<div class="osc-dialog-body"><div class="osc-qr-card">'+paymentImage(m)+'<strong>Scan to pay</strong><div class="osc-qr" data-payout-qr></div></div>'+(methodId==='vlinkpay'?row('USDV',p.usdv)+row('USDT',p.usdt):row(methodId==='zelle'?'ZELLE REGISTERED NAME':'Account Holder Name',p.holder)+row(methodId==='zelle'?'EMAIL OR PHONE':'Account Identifier',p.identifier))+'</div><footer class="osc-dialog-footer">'+button('Close','close')+'</footer>');
    const host=dialog.querySelector('[data-payout-qr]');
    if(methodId==='vlinkpay'){
      host.classList.add('osc-wallet-qrs');
      for(const token of ['usdv','usdt']){if(!p[token]&&!p['qr'+token])continue;const card=document.createElement('div');card.innerHTML='<strong>'+token.toUpperCase()+'</strong><div class="osc-qr"></div>';host.append(card);const qr=card.querySelector('.osc-qr');if(p['qr'+token])qr.innerHTML='<img src="'+esc(p['qr'+token])+'" alt="'+token.toUpperCase()+' QR code">';else drawQR(qr,p[token],180);}
    }else if(p.qr)host.innerHTML='<img src="'+esc(p.qr)+'" alt="'+m.label+' QR code">';else drawQR(host,p.identifier,200);
  }
  function payoutEdit(methodId,context) {
    const m=methods.find(x=>x.id===methodId),payments=paymentsFor(context);if(!m||!payments)return;
    const p=payments[methodId]||{};const uploads={default:p.qr||'',usdv:p.qrusdv||'',usdt:p.qrusdt||''};
    const qrUpload=(token='')=>'<label class="osc-field"><span>QR Code (optional)</span><input type="file" name="qr'+token+'" accept="image/*"></label><div data-qr-upload-preview="'+token+'">'+(uploads[token||'default']?'<img src="'+esc(uploads[token||'default'])+'" alt="Payout QR Code" width="150">'+button('Delete','payout-delete-qr'):'')+'</div>';
    const body=methodId==='vlinkpay'?'<p>Only provide VRC20 network addresses. Nexora cannot reverse transactions sent to the wrong network or address.</p><h3>VLINKPAY CRYPTO ADDRESSES</h3><p>Enter at least 1 wallet address</p><div class="osc-card"><strong>USD VLINK · USDV</strong><p>Network:VRC20</p>'+field('WALLET ADDRESS','usdv',p.usdv,{placeholder:'Paste VRC20 address…'})+qrUpload('usdv')+'</div><div class="osc-card"><strong>USD Tether · USDT</strong><p>Network:VRC20</p>'+field('WALLET ADDRESS','usdt',p.usdt,{placeholder:'Paste VRC20 address…'})+qrUpload('usdt')+'</div><details><summary>HOW TO GET YOUR WALLET ADDRESS</summary><p><strong>1. Open app VLINKPAY</strong><br>Sign in to your merchant VLINKPAY account on your phone.</p><p><strong>2. Choose Top-up for Purchase &gt; Receive Token</strong><br>On the app home screen, choose Top-up for Purchase &gt; Receive Token.</p><p><strong>3. Choose token</strong><br>Choose USDV or USDT. Both use the VRC20 network for this flow, but each token has its own address.</p><p><strong>4. Copy &amp; paste into Nexora</strong><br>Copy each address from the app, then paste the matching address here.</p></details><p>Make sure the recipient information is correct before saving.</p>':field('Account Holder Name','holder',p.holder,{placeholder:'e.g. Anna Smith',required:true})+field('Account Identifier','identifier',p.identifier,{placeholder:m.placeholder,required:true})+qrUpload()+'<p>Please enter the correct receiving account information. This will be used to receive payments.</p>';
    openDialog(methodId==='vlinkpay'?'VLINKPAY ACCOUNT':m.label.toUpperCase()+' ACCOUNT','<form><div class="osc-dialog-body"><p>Specify receiving target identifier</p>'+body+'</div>'+actions('SAVE')+'</form>',(data,form)=>{if(methodId==='vlinkpay'&&!String(data.get('usdv')||'').trim()&&!String(data.get('usdt')||'').trim()){form.elements.usdv.setCustomValidity('Enter at least 1 wallet address');form.elements.usdv.reportValidity();return;}payments[methodId]={...p,enabled:true,holder:String(data.get('holder')||''),identifier:String(data.get('identifier')||''),usdv:String(data.get('usdv')||''),usdt:String(data.get('usdt')||''),qr:uploads.default,qrusdv:uploads.usdv,qrusdt:uploads.usdt};if(context==='draft'){openStaffEditor(staffDraft);return;}save();dialog.close();renderAll();});
    dialog.querySelectorAll('input[type=file]').forEach(input=>input.addEventListener('change',()=>{const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const token=input.name.slice(2)||'default';uploads[token]=reader.result;const host=input.closest('.osc-field').nextElementSibling;host.innerHTML='<img src="'+esc(uploads[token])+'" alt="Payout QR Code" width="150">'+button('Delete','payout-delete-qr');host.querySelector('button').onclick=()=>{uploads[token]='';host.replaceChildren();};};reader.readAsDataURL(file);}));
    dialog.querySelectorAll('[name=usdv],[name=usdt]').forEach(input=>input.addEventListener('input',()=>dialog.querySelector('[name=usdv]').setCustomValidity('')));
    dialog.querySelectorAll('[data-osc-action=payout-delete-qr]').forEach(b=>b.addEventListener('click',()=>{uploads[b.parentElement.dataset.qrUploadPreview||'default']='';b.parentElement.replaceChildren();}));
  }
  function staffSortOptions(){return [['name','Name (A-Z)'],['name-desc','Name (Z-A)'],['newest','Date: Newest'],['oldest','Date: Oldest'],['active','Status: Active']];}
  function renderStaff() {
    panels.staff.classList.add('osc-content');
    const list=state.staff.filter(member=>!member.removed).slice().sort((a,b)=>sort==='name'?visibleName(a).localeCompare(visibleName(b)):sort==='name-desc'?visibleName(b).localeCompare(visibleName(a)):sort==='oldest'?String(a.joined).localeCompare(String(b.joined)):sort==='active'?Number(b.active)-Number(a.active):String(b.joined).localeCompare(String(a.joined)));
    staffPage=Math.min(staffPage,Math.max(1,Math.ceil(list.length/10)));
    panels.staff.innerHTML='<div class="osc-stack"><div class="osc-stats two"><section class="osc-card osc-stat"><span>Total Staff</span><strong>'+list.length+'</strong></section><section class="osc-card osc-stat"><span>Pending Invites</span><strong>'+state.invites.length+'</strong></section></div><section class="osc-card osc-invite"><button class="osc-qr" type="button" data-osc-action="invite-qr" aria-label="Click to enlarge" data-staff-invite-qr></button><div><h4>STAFF INVITE LINK</h4><p>Share this link or QR code so technicians can create their account and join your salon.</p><div class="osc-copy-field"><input value="'+esc(inviteURL())+'" aria-label="STAFF INVITE LINK" readonly>'+button('Copy','copy','data-value="'+esc(inviteURL())+'"')+button('Share','share','data-value="'+esc(inviteURL())+'"')+'</div></div></section><section class="osc-card"><div class="osc-team-toolbar"><h3>Your Team</h3><div class="osc-actions"><label class="osc-field">Sort by:<select class="osc-sort" data-osc-staff-sort>'+staffSortOptions().map(([value,label])=>'<option value="'+value+'" '+(sort===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+button(icon('plus')+'Add Staff','add-staff','','primary')+'</div></div><div class="osc-table-scroll" tabindex="0" aria-label="Your Team"><table class="osc-table"><thead><tr><th>Staff</th><th>Linked Date</th><th>Payment Methods</th><th>Status</th><th>Tips Enabled</th><th>Manage</th></tr></thead><tbody>'+list.slice((staffPage-1)*10,staffPage*10).map(member=>'<tr><td><div class="osc-person">'+avatar(member,'small')+'<div><strong>'+esc(visibleName(member))+'</strong><small>'+esc(member.role)+'</small></div></div></td><td>'+date(member.joined)+'</td><td>'+esc(methods.filter(m=>member.payments[m.id]?.enabled).map(m=>m.label).join(', ')||'No wallets')+'</td><td><input class="osc-toggle" type="checkbox" role="switch" aria-label="Active" data-osc-member-toggle="active" data-staff="'+esc(member.id)+'" '+(member.active?'checked':'')+'></td><td><input class="osc-toggle" type="checkbox" role="switch" aria-label="Show" data-osc-member-toggle="tips" data-staff="'+esc(member.id)+'" '+(member.tips?'checked':'')+'></td><td><div class="osc-actions"><a class="osc-button" href="owner-staff-profile.html?staffId='+encodeURIComponent(member.id)+'" aria-label="Edit Profile">'+icon('pencil')+'</a>'+button(icon('qr-code'),'staff-qr','data-staff="'+esc(member.id)+'" aria-label="View QR Code"')+button(icon('eye'),'staff-preview','data-staff="'+esc(member.id)+'" aria-label="Preview Customer View"')+button(icon('trash-2'),'staff-remove','data-staff="'+esc(member.id)+'" aria-label="Remove Staff"')+'</div></td></tr>').join('')+'</tbody></table></div>'+pagination(list.length)+'</section></div>';
    drawQR(panels.staff.querySelector('[data-staff-invite-qr]'),inviteURL(),120);
  }
  function pagination(count) {
    const max=Math.max(1,Math.ceil(count/10));
    return '<div class="osc-pagination"><span>Showing <strong>'+(count?(staffPage-1)*10+1:0)+'</strong> to <strong>'+Math.min(staffPage*10,count)+'</strong> of <strong>'+count+'</strong> results</span><nav aria-label="Pagination">'+button(icon('chevron-left'),'staff-page','data-page="'+(staffPage-1)+'" aria-label="Previous" '+(staffPage===1?'disabled':''))+'<span>'+staffPage+'</span>'+button(icon('chevron-right'),'staff-page','data-page="'+(staffPage+1)+'" aria-label="Next" '+(staffPage===max?'disabled':''))+'</nav></div>';
  }
  function addStaffDialog(nextMode='existing') {
    addMode=nextMode;
    const tabs='<div class="osc-tabs">'+[['existing','Link Existing Staff'],['invite','Invite New Staff'],['manual','Add Manual Staff']].map(([id,label])=>button(label,'add-mode','data-mode="'+id+'" aria-pressed="'+(id===addMode)+'"')).join('')+'</div>';
    let body='';
    if(addMode==='existing')body='<p>Use when the technician already has a NEXORA Staff Profile. Enter Staff ID, Phone, or Email.</p>'+field('Staff ID, Phone, or Email','lookup','',{placeholder:'NEX-STF-839201',required:true})+button(icon('scan-line'),'scan-existing','aria-label="Scan QR Code"')+field('Role at Business','role','Nail Technician',{placeholder:'Example: Nail Technician'})+'<p>After you send a link request, the staff member must accept before they appear as active in your business.</p><div data-existing-staff-result></div>';
    if(addMode==='invite')body='<p>Use when the technician does not have an account yet. They will complete setup via the link.</p>'+field('Staff Name','name','',{placeholder:'Example: Lisa Tran',required:true})+field('Phone or Email','contact','',{placeholder:'e.g. lisa@example.com or +1 407-555-0123',required:true})+field('Role','role','Nail Technician',{placeholder:'Example: Nail Technician'})+'<label class="osc-field"><span>Invite Method</span><select name="inviteMethod"><option>Email</option><option disabled>SMS (Coming soon)</option></select></label><p>Staff receives a link to complete their NEXORA Tip Profile. After setup, they will be added to your salon.</p>';
    if(addMode==='manual')body='<label class="osc-file osc-button">Upload photo<input type="file" name="avatar" accept="image/*"></label>'+field('Full Name (Internal)','name','',{placeholder:'Mia Tran',required:true})+field('Display Nickname','nickname','',{placeholder:'Mia T.',required:true})+field('Position or Role','role','',{placeholder:'Nail Technician'})+field('Phone Number','phone','',{type:'tel',placeholder:'e.g., 407-555-0123'})+field('Email Address','email','',{type:'email',placeholder:'e.g., mia.tran@gmail.com'})+'<strong>Receive Payment Methods</strong>';
    const submitLabel=addMode==='existing'?'Search Staff':addMode==='invite'?'Send Setup Link':'Save';
    let avatarImage='';
    openDialog('Add Staff','<form><div class="osc-dialog-body">'+tabs+body+'</div>'+actions(submitLabel)+'</form>',data=>{
      if(addMode==='existing'){
        const query=String(data.get('lookup')).trim().toLowerCase(),member=state.staff.find(s=>[s.id,s.email,s.phone].some(v=>v&&v.toLowerCase()===query));
        const result=dialog.querySelector('[data-existing-staff-result]');if(!member){result.innerHTML='<p>No staff profile found matching that criteria.</p>';return;}
        result.innerHTML='<div class="osc-card"><strong>'+esc(visibleName(member))+'</strong><p>'+esc(member.role)+'</p><a class="osc-button" href="owner-staff-profile.html?staffId='+encodeURIComponent(member.id)+'">View details</a></div>';return;
      }
      if(addMode==='invite')state.invites.push({id:'invite-'+Date.now(),name:String(data.get('name')),contact:String(data.get('contact')),role:String(data.get('role')),created:today(),localOnly:true});
      else state.staff.push({id:'local-staff-'+Date.now(),name:String(data.get('name')).trim(),nickname:String(data.get('nickname')).trim(),role:String(data.get('role'))||'Nail Technician',phone:String(data.get('phone')),email:String(data.get('email')),avatar:avatarImage,joined:today(),active:true,tips:true,payments:emptyPayments(),localOnly:true});
      save();dialog.close();renderStaff();refreshIcons();
    });
    dialog.querySelector('[name=avatar]')?.addEventListener('change',event=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>avatarImage=reader.result;reader.readAsDataURL(file);});
  }
  function openStaffEditor(member,readOnly=false) {
    staffDraft=JSON.parse(JSON.stringify(member));
    openDialog(readOnly?'View details':'Edit','<form><div class="osc-dialog-body">'+field('NEXORA ID or VLINKPAY ID','externalId',member.externalId||member.id,{placeholder:'e.g. ASH0155'})+(readOnly?'':'<label class="osc-file osc-button">Upload photo<input type="file" name="avatar" accept="image/*"></label>')+field('Full Name (Internal)','name',member.name,{placeholder:'Mia Tran',required:true})+field('Display name','nickname',member.nickname||member.name,{placeholder:'Mia T.',required:true})+field('Position or Role','role',member.role,{placeholder:'Nail Tech'})+field('Phone Number','phone',member.phone,{type:'tel',placeholder:'e.g., 407-555-0123'})+field('Email Address','email',member.email,{type:'email',placeholder:'e.g., mia.tran@gmail.com'})+'<h3>Receive Payment Methods</h3><div>'+paymentRows(staffDraft.payments,readOnly?member.id:'draft',readOnly)+'</div><label class="osc-actions"><input type="checkbox" class="osc-toggle" name="tips" '+(member.tips?'checked':'')+'>Tips Enabled</label><p>Click pill to show or hide tech on general QR</p></div>'+(readOnly?'<footer class="osc-dialog-footer">'+button('Close','close')+'</footer>':actions())+'</form>',data=>{if(readOnly)return;const original=staffById(staffDraft.id);if(!original)return;Object.assign(original,{externalId:String(data.get('externalId')||''),name:String(data.get('name')).trim(),nickname:String(data.get('nickname')).trim(),role:String(data.get('role')),phone:String(data.get('phone')),email:String(data.get('email')),tips:data.has('tips'),avatar:staffDraft.avatar,payments:staffDraft.payments});save();dialog.close();renderAll();},true);
    if(readOnly)dialog.querySelectorAll('input,select').forEach(input=>input.disabled=true);
    dialog.querySelector('[name=avatar]')?.addEventListener('change',event=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>staffDraft.avatar=reader.result;reader.readAsDataURL(file);});
  }
  function syncStaffDraft() {
    const form=dialog.querySelector('form');if(!staffDraft||!form?.elements.name)return;
    const data=new FormData(form);for(const name of ['externalId','name','nickname','role','phone','email'])staffDraft[name]=String(data.get(name)||'');staffDraft.tips=data.has('tips');
  }
  function staffQrDialog(member) {
    if(!member)return;
    const url=new URL('../tip-flow/tip.html',location.href);
    url.searchParams.set('isMulti','0');
    url.searchParams.set('staffList',JSON.stringify([{name:visibleName(member),role:member.role,initial:visibleName(member).slice(0,1),from:'#7c3aed',to:'#6d28d9'}]));
    openDialog('NEXORA','<div class="osc-dialog-body"><div class="osc-qr-card"><img src="assets/icon-nexora.png" width="48" height="48" alt="Nexora Logo"><div class="osc-qr" data-personal-qr></div><p>Scan to Tip &amp; Review</p><small>Secure redirect by VLINKPAY</small><a href="'+esc(url.href)+'" target="_blank" rel="noopener noreferrer">'+esc(url.href)+'</a><div class="osc-actions">'+button('Copy','copy','data-value="'+esc(url.href)+'"')+button('Download','staff-qr-download')+button('Print QR','staff-qr-print')+'</div></div></div>');
    drawQR(dialog.querySelector('[data-personal-qr]'),url.href,230);
  }
  function renderAffiliate() {
    panels['affiliate-link'].classList.add('osc-content');
    panels['affiliate-link'].innerHTML='<section class="osc-card osc-qr-card"><strong>Select Placement Leg</strong><div class="osc-actions"><label><input type="radio" name="osc-leg" value="left" '+(state.leg==='left'?'checked':'')+'> Left Leg</label><label><input type="radio" name="osc-leg" value="right" '+(state.leg==='right'?'checked':'')+'> Right Leg</label></div><div class="osc-qr" data-affiliate-qr></div><a href="'+esc(referralURL(state.leg))+'" target="_blank" rel="noopener noreferrer">'+esc(referralURL(state.leg))+'</a><div class="osc-actions">'+button('Download QR','affiliate-download')+button('Copy Link','copy','data-value="'+esc(referralURL(state.leg))+'"')+'</div></section>';
    drawQR(panels['affiliate-link'].querySelector('[data-affiliate-qr]'),referralURL(state.leg),240);
  }
  async function openStaffScanner() {
    const scanner=document.createElement('dialog');scanner.className='osc-dialog';
    scanner.innerHTML='<header class="osc-dialog-head"><h2>Scan QR Code</h2><button class="osc-button" type="button" aria-label="Close Scanner">'+icon('x')+'</button></header><div class="osc-dialog-body"><p>Scan NEXORA Personal ID to link your account</p><video autoplay playsinline muted class="osc-scanner-video"></video><p data-scanner-start>Starting camera...</p></div><footer class="osc-dialog-footer"><button class="osc-button" type="button">CANCEL</button></footer>';
    let stream=null,frame=null;
    const stop=()=>{if(frame)cancelAnimationFrame(frame);stream?.getTracks().forEach(track=>track.stop());};
    scanner.querySelectorAll('button').forEach(button=>button.onclick=()=>scanner.close());
    scanner.addEventListener('close',()=>{stop();scanner.remove();dialog.querySelector('[name=lookup]')?.focus();},{once:true});
    dialog.addEventListener('close',()=>{if(scanner.open)scanner.close();},{once:true});
    document.body.append(scanner);scanner.showModal();refreshIcons();
    try {
      if(!navigator.mediaDevices?.getUserMedia||!window.BarcodeDetector){scanner.close();return;}
      const detector=new window.BarcodeDetector({formats:['qr_code']});
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      if(!scanner.open){stop();return;}
      const video=scanner.querySelector('video');video.srcObject=stream;await video.play();scanner.querySelector('[data-scanner-start]').hidden=true;
      const scan=async()=>{if(!scanner.open)return;try{const codes=await detector.detect(video);if(codes[0]?.rawValue){const input=dialog.querySelector('[name=lookup]');if(input)input.value=codes[0].rawValue;scanner.close();return;}}catch(_){}if(scanner.open)frame=requestAnimationFrame(scan);};
      frame=requestAnimationFrame(scan);
    } catch(_) {if(scanner.open)scanner.close();stop();}
  }
  function chart() {
    const end=trend==='Custom'&&trendTo?new Date(trendTo+'T12:00:00'):new Date();
    const start=trend==='Custom'&&trendFrom?new Date(trendFrom+'T12:00:00'):new Date(end);
    if(!(trend==='Custom'&&trendFrom))start.setDate(end.getDate()-(parseInt(trend,10)||7)+1);
    const span=Math.max(0,end-start),days=Array.from({length:8},(_,i)=>{const d=new Date(start.getTime()+span*i/7);return trend==='7 Days'?d.toLocaleDateString('en-US',{weekday:'short'}):date(d.toISOString());});
    return '<svg class="osc-chart" viewBox="0 0 760 210" role="img" aria-label="Weekly Tips Trend">'+[100,75,50,25,0].map((v,i)=>'<text x="2" y="'+(20+i*38)+'">$'+v+'</text><line x1="48" y1="'+(16+i*38)+'" x2="742" y2="'+(16+i*38)+'"></line>').join('')+'<path d="M48 168 H742" stroke="#8e4df8" stroke-width="2" fill="none"></path>'+days.map((day,i)=>'<text x="'+(48+i*694/7)+'" y="202" text-anchor="'+(i===0?'start':i===7?'end':'middle')+'">'+day+'</text>').join('')+'</svg>';
  }
  function renderProfile() {
    const requestedId=new URLSearchParams(location.search).get('staffId');
    const member=requestedId?staffById(requestedId):state.staff.find(s=>!s.removed);if(!member||member.removed){profileHost.innerHTML='<a class="osc-button" href="owner-setting.html?tab=staff">Back</a>';return;}
    document.title=visibleName(member)+' — Staff Profile';
    profileHost.innerHTML='<div class="osc-stack"><div><a class="osc-button" href="owner-setting.html?tab=staff">'+icon('arrow-left')+'Back</a></div><section class="osc-card osc-profile-head"><div class="osc-profile-title">'+avatar(member,'large')+'<div><h1>'+esc(visibleName(member))+'</h1><div class="osc-actions"><span class="osc-tag '+(member.active?'':'muted')+'">'+(member.active?'Active':'Disabled')+'</span>'+(member.tips?'<span class="osc-tag">Show in Tips</span>':'')+'</div><p>'+esc(member.role)+'</p><p>Joined Nexora Touch: '+date(member.joined)+'</p></div></div><div class="osc-actions">'+button('Set nickname','nickname','data-staff="'+esc(member.id)+'"')+button('Set job title','job-title','data-staff="'+esc(member.id)+'"')+button('Personal QR','staff-qr','data-staff="'+esc(member.id)+'"')+button('View details','staff-edit','data-staff="'+esc(member.id)+'"')+button('Remove Staff','staff-remove','data-staff="'+esc(member.id)+'"','danger')+'</div></section><div class="osc-stats">'+[['Tips Collected','$0.00'],['Average Star Rating','0.00 / 5.0'],['Total Reviews','0']].map(([label,value])=>'<section class="osc-card osc-stat"><span>'+label+'</span><strong>'+value+'</strong></section>').join('')+'</div><section class="osc-card"><div class="osc-team-toolbar"><h3>Weekly Tips Trend</h3><div class="osc-tabs">'+['7 Days','30 Days','90 Days','180 Days','365 Days','Custom'].map(label=>button(label,'trend','data-range="'+label+'" aria-pressed="'+(trend===label)+'"')).join('')+'</div></div>'+(trend==='Custom'?'<div class="osc-actions">'+field('From','trendFrom',trendFrom,{type:'date'})+field('To','trendTo',trendTo,{type:'date'})+'</div>':'')+chart()+'</section><section class="osc-card"><h3>Direct Wallets Link</h3><p>Customers scan and tip directly to these payment addresses.</p>'+methods.map(m=>{const p=member.payments[m.id]||{};return row(m.label,p.identifier||[p.usdv,p.usdt].filter(Boolean).join(' · ')||'Not Configured');}).join('')+'</section><section class="osc-card"><h3>Recent Tip Transactions</h3><div class="osc-empty">No recent tips logged for this technician yet.<p>Direct tips via their QR code will compile here in real-time.</p></div></section><section class="osc-card"><h3>Filtered Customer Reviews</h3><p>Reviews left by customers scanning this technician\'s unique station.</p><div class="osc-tabs">'+['All','Google and Yelp (4-5★)','Internal Recovery (1-3★)'].map(label=>button(label,'review-filter','data-filter="'+label+'" aria-pressed="'+(reviewFilter===label)+'"')).join('')+'</div><div class="osc-empty">No reviews matching the filter for this technician.<p>Customer reviews matching this filter will show here.</p></div></section></div>';
  }
  function renderAll() {
    if(profileHost)renderProfile();
    else {
      renderAccount();renderStaff();renderAffiliate();
      panels['business-verification'].classList.add('osc-content');panels['business-verification'].innerHTML='<section class="osc-card osc-verified">'+icon('badge-check')+'<h3>Verified</h3><p>Your account is verified and ready to use Nexora Touch services.</p></section>';
      panels['terms-privacy'].classList.add('osc-content');panels['terms-privacy'].innerHTML='<div class="osc-policy-buttons"><a href="owner-terms.html"><span><strong>Terms of Service</strong><small>Rules for using Nexora Touch</small></span>'+icon('chevron-right')+'</a><a href="owner-privacy.html"><span><strong>Privacy Policy</strong><small>How your information is handled</small></span>'+icon('chevron-right')+'</a></div>';
    }
    refreshIcons();
  }
  async function copy(value){try{await navigator.clipboard.writeText(value);}catch(_){const field=document.createElement('textarea');field.value=value;document.body.append(field);field.select();document.execCommand('copy');field.remove();}}
  function downloadQR(host) {
    const canvas=host?.querySelector('canvas'),image=host?.querySelector('img');const href=canvas?.toDataURL('image/png')||image?.src;if(!href)return;
    const link=document.createElement('a');link.href=href;link.download='nexora-qr.png';link.click();
  }
  document.addEventListener('click',event=>{
    const control=event.target.closest('[data-osc-action]');if(!control)return;
    const action=control.dataset.oscAction,id=control.dataset.staff;
    if(action==='close'){dialog.close();return;}
    if(action==='email'){emailDialog();return;}
    if(action==='password'){const input=dialog.querySelector('[name=password]');input.type=input.type==='password'?'text':'password';return;}
    if(action==='copy'){copy(control.dataset.value);return;}
    if(action==='share'){if(navigator.share)navigator.share({url:control.dataset.value}).catch(()=>{});else copy(control.dataset.value);return;}
    if(action==='review-edit'){renderReviewLinks(true);return;}
    if(action==='review-cancel'){renderReviewLinks(false);return;}
    if(action==='referral-qr'){qrDialog('Referral Link',referralURL());return;}
    if(action==='payment-qr'){qrDialog('Payment QR',paymentURL(),'Scan to pay '+state.business.name);return;}
    if(action==='invite-qr'){qrDialog('STAFF INVITE LINK',inviteURL());return;}
    if(action==='download-qr'){downloadQR(dialog.querySelector('.osc-qr'));return;}
    if(action==='affiliate-download'){downloadQR(panels['affiliate-link'].querySelector('.osc-qr'));return;}
    if(action==='payout-view'){payoutView(control.dataset.method,control.dataset.context);return;}
    if(action==='payout-edit'){if(control.dataset.context==='draft')syncStaffDraft();payoutEdit(control.dataset.method,control.dataset.context);return;}
    if(action==='add-staff'){addStaffDialog();return;}
    if(action==='add-mode'){addStaffDialog(control.dataset.mode);return;}
    if(action==='scan-existing'){openStaffScanner();return;}
    if(action==='staff-edit'||action==='staff-preview'){const member=staffById(id);if(member)openStaffEditor(member,action==='staff-preview');return;}
    if(action==='staff-qr'){staffQrDialog(staffById(id));return;}
    if(action==='staff-qr-download'){downloadQR(dialog.querySelector('.osc-qr'));return;}
    if(action==='staff-qr-print'){document.body.classList.add('osc-printing');try{window.print();}finally{document.body.classList.remove('osc-printing');}return;}
    if(action==='staff-page'){staffPage=Number(control.dataset.page);renderStaff();refreshIcons();return;}
    if(action==='staff-remove'){
      openDialog('Remove Staff','<form><div class="osc-dialog-body"><p>Delete this staff member from Nexora Touch?</p></div>'+actions('Confirm')+'</form>',()=>{const member=staffById(id);if(!member)return;member.removed=true;save();dialog.close();if(profileHost)location.href='owner-setting.html?tab=staff';else renderAll();});return;
    }
    if(action==='nickname'||action==='job-title'){
      const member=staffById(id);if(!member)return;const nickname=action==='nickname';
      openDialog(nickname?'Nickname at your business':'Job title at your business','<form><div class="osc-dialog-body">'+field(nickname?'Nickname':'Job title','value',nickname?member.nickname:member.role,{maxlength:100,placeholder:nickname?'':'e.g., Senior Nail Technician'})+'<p>'+(nickname?'Used only at this business. You and this staff member can both change it. Leave empty to use the original name.':'Job title shown to customers at this business. Max 100 characters.')+'</p></div>'+actions()+'</form>',data=>{member[nickname?'nickname':'role']=String(data.get('value')).trim();save();dialog.close();renderAll();});return;
    }
    if(action==='trend'){trend=control.dataset.range;renderProfile();refreshIcons();return;}
    if(action==='review-filter'){reviewFilter=control.dataset.filter;renderProfile();refreshIcons();return;}
  });
  document.addEventListener('change',event=>{
    const input=event.target;
    if(input.type==='date'&&input.closest('.osc-date')){input.closest('.osc-date').querySelector('[data-osc-date-display]').textContent=input.value?date(input.value):input.getAttribute('aria-label');}
    if(input.name==='trendFrom'||input.name==='trendTo'){if(input.name==='trendFrom')trendFrom=input.value;else trendTo=input.value;const from=profileHost?.querySelector('[name=trendFrom]'),to=profileHost?.querySelector('[name=trendTo]');if(from&&to){from.max=trendTo;to.min=trendFrom;}const plot=profileHost?.querySelector('.osc-chart');if(plot)plot.outerHTML=chart();return;}
    if(input.dataset.oscPaymentToggle){const payments=paymentsFor(input.dataset.context);if(payments){payments[input.dataset.oscPaymentToggle].enabled=input.checked;if(input.dataset.context!=='draft')save();}return;}
    if(input.dataset.oscMemberToggle){const member=staffById(input.dataset.staff);if(member){member[input.dataset.oscMemberToggle]=input.checked;save();}return;}
    if(input.name==='osc-leg'){state.leg=input.value;save();renderAffiliate();refreshIcons();return;}
    if(input.hasAttribute('data-osc-staff-sort')){sort=input.value;staffPage=1;renderStaff();refreshIcons();return;}
    if(input.dataset.oscUpload){const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{if(input.dataset.oscUpload==='avatar')state.owner.avatar=reader.result;else state.business.logo=reader.result;save();renderAccount();refreshIcons();};reader.readAsDataURL(file);}
  });
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  window.NEXORA_OWNER_SETTINGS_LOCAL={state:()=>state};
  renderAll();
})();
