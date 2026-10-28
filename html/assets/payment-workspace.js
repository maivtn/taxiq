/* English UI observed on staging-web.nexoratouch.com, Oct 27, 2026.
 * All edits below remain in this browser's local demo store. No remote requests. */
(function () {
  'use strict';
  var root = document.getElementById('payment-main');
  if (!root) return;
  var model=window.NEXORA_PAYMENT_MODEL;
  var requestedView=document.body.dataset.paymentView||'overview';
  var isStaffHistory=requestedView==='payout-history';
  var view=isStaffHistory?'payouts':requestedView;
  if (view === 'receive' && new URLSearchParams(location.search).get('tab') === 'overview') view = 'overview';
  var STORAGE = 'nexora-merchant-payments-demo-v1';
  var defaults = {
    categories: ['Rent', 'Salary', 'Tip', 'Bonus', 'Commission', 'Other', 'test', 'tets', 'test1'],
    methods: [
      {name:'Zelle', holder:'Nexora B1', account:'nexora_b1', enabled:true, icon:'zelle.png'},
      {name:'Cash App', holder:'Nexora_b1', account:'1231231231', enabled:false, icon:'cash-app.svg'},
      {name:'Venmo', holder:'Nexora_b1', account:'@nexora_b1', enabled:true, icon:'venmo.svg'},
      {name:'VLINKPAY Wallet', holder:'USDV 123123', account:'USDT 123123.', enabled:true, icon:'vlinkpay-logo.png'},
      {name:'Apple Cash', holder:'Nexora_b1', account:'Nexora_b1_apple cash', enabled:false, icon:'apple.svg'},
      {name:'PayPal', holder:'Nexora_b1', account:'nexora_b1', enabled:false, icon:'paypal.svg'}
    ],
    activities: [], payouts: [], categoryTags: {}
  };
  var store;
  try { store = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE) || '{}')); } catch (_) { store = defaults; }
  function save(mutate,target) {
    try { store=model.persist(store,mutate,localStorage,STORAGE);clearPersistenceError();return true; }
    catch(error) { showPersistenceError(error,target);return false; }
  }
  var tips = [
    {id:'45737cf0-7960-4a1c-a544-99688686420',short:'45737cf0…6420',date:'2026-10-23',time:'09:24 am',amount:15,staff:'nexora_02',station:'One QR',method:'Zelle',source:'QR / Auto',status:'Confirmed'},
    {id:'da9112e0-5f20',short:'da9112e0…5f20',date:'2026-10-13',time:'09:43 am',amount:70,staff:'1., nexora., nexora_02, nexora_004., Ike',station:'Master Store',method:'Venmo',source:'QR / Auto',status:'Completed'},
    {id:'eeeeab02-9f80',short:'eeeeab02…9f80',date:'2026-10-13',time:'09:41 am',amount:5000,staff:'nexora_02',station:'Master Store',method:'Zelle',source:'QR / Auto',status:'Completed'},
    {id:'d300f32d-5a03',short:'d300f32d…5a03',date:'2026-10-13',time:'09:40 am',amount:15,staff:'nexora_02',station:'Master Store',method:'Zelle',source:'QR / Auto',status:'Completed'},
    {id:'c848955d-1515',short:'c848955d…1515',date:'2026-10-02',time:'08:28 am',amount:8898,staff:'Ike',station:'Master Store',method:'Zelle',source:'Manual',status:'Completed'},
    {id:'9ce3bde0-b2a6',short:'9ce3bde0…b2a6',date:'2026-10-01',time:'02:12 pm',amount:102,staff:'nexora_005',station:'Master Store',method:'Zelle',source:'Manual',status:'Completed'},
    {id:'d33b6db1-20bc',short:'d33b6db1…20bc',date:'2026-10-01',time:'10:18 am',amount:2,staff:'nexora_005',station:'Master Store',method:'Zelle',source:'Manual',status:'Completed'},
    {id:'15cfd9d2-07d7',short:'15cfd9d2…07d7',date:'2026-10-01',time:'08:25 am',amount:11,staff:'nexora_005',station:'Master Store',method:'Zelle',source:'Manual',status:'Completed'},
    {id:'028b18f9-edfd',short:'028b18f9…edfd',date:'2026-10-01',time:'08:25 am',amount:100,staff:'Ike',station:'Master Store',method:'Zelle',source:'Manual',status:'Completed'},
    {id:'8cc0d6e2-2a2c',short:'8cc0d6e2…2a2c',date:'2026-09-30',time:'05:20 pm',amount:100,staff:'nexora_005',station:'Master Store',method:'Zelle',source:'Manual',status:'Completed'}
  ];
  var activities = [
    ['2026-10-02','08:28 am',105,'Zelle'],['2026-10-01','02:12 pm',101,'Zelle'],['2026-10-01','10:22 am',300,'PayPal'],
    ['2026-10-01','10:21 am',200,'VlinkPay'],['2026-10-01','10:19 am',101,'CashApp'],['2026-10-01','10:16 am',10,'Zelle'],
    ['2026-09-30','05:20 pm',100,'Zelle'],['2026-09-30','05:19 pm',100,'Zelle'],['2026-09-30','04:29 pm',123,'Zelle']
  ].map(function(r,i){return {id:i===0?'5f6286c8-2156-4b03-87a5-e53ad2067da8':'payment-'+i,date:r[0],time:r[1],amount:r[2],method:r[3],source:'Manual',status:'Completed'};});
  var payouts = [
    ['PAY-2026047-ZGW3X','2026-09-16','10:35 am',5,'Cash','Bonus','Completed'],
    ['PAY-2026046-GXRJ8','2026-09-16','10:27 am',10,'Zelle','Salary','Completed'],
    ['PAY-2026045-VLP66','2026-09-04','04:25 pm',47.42,'Zelle','Unpaid tip','Awaiting confirmation'],
    ['PAY-2026044-T4K9B','2026-09-04','04:23 pm',32.42,'Zelle','Unpaid tip','Cancelled'],
    ['PAY-2026043-7MU56','2026-09-03','03:16 pm',4123,'Zelle','Unpaid tip','Awaiting confirmation'],
    ['PAY-2026042-4KA6Y','2026-09-03','02:53 pm',10,'Zelle','Tip','Awaiting confirmation'],
    ['PAY-2026041-98WMQ','2026-09-03','02:46 pm',15,'Zelle','Unpaid tip','Cancelled'],
    ['PAY-2026040-FGBTV','2026-09-03','08:39 am',15,'Zelle','Unpaid tip','Cancelled'],
    ['PAY-2026039-UFNCZ','2026-09-03','08:36 am',30.77,'Zelle','Salary','Completed'],
    ['PAY-2026038-EK9PN','2026-09-03','08:34 am',30.77,'Zelle','Unpaid tip','Completed']
  ].map(function(r){return {id:r[0],date:r[1],time:r[2],amount:r[3],method:r[4],type:r[5],status:r[6],staff:'nexora_02',periodStart:'2026-09-01',periodEnd:'2026-09-30',note:''};});
  var icons = {
    plus:'M12 5v14M5 12h14', eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    edit:'m16 3 5 5-13 13H3v-5L16 3ZM13 6l5 5', close:'m6 6 12 12M18 6 6 18',check:'m8 12 3 3 5-6 M21 12a9 9 0 1 1-5-8',
    copy:'M8 8h13v13H8zM16 4V2H2v14h2',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',qr:'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 15h2v6h-6v-2',
    wallet:'M3 5h16v4M3 5v15h18V9H3V5ZM16 13h5v4h-5z',filter:'M3 6h18M3 12h18M3 18h18M7 3v6M16 9v6M9 15v6',down:'m6 9 6 6 6-6',dollar:'M12 2v20M18 5H9a3.5 3.5 0 0 0 0 7h6a3.5 3.5 0 0 1 0 7H6',
    arrow:'M6 18 18 6M7 6h11v11',calendar:'M3 5h18v16H3zM7 2v6M17 2v6M3 10h18',clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',chart:'M3 3v18h18M7 16V9M12 16V5M17 16v-4',award:'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM9 12v9l3-2 3 2v-9',users:'M16 21v-2a6 6 0 0 0-12 0v2M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM18 4a4 4 0 0 1 0 8M20 21v-2a6 6 0 0 0-3-5',calc:'M5 2h14v20H5zM8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2'
  };
  function icon(name) { return '<svg class="pw-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(icons[name]||icons.wallet)+'"/></svg>'; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function money(v) { return Number(v || 0).toLocaleString('en-US',{style:'currency',currency:'USD'}); }
  function date(v) { return model.formatDate(v); }
  function isoDate(v) { return model.parseDate(v); }
  function button(text, action, cls, glyph, attrs) { return '<button type="button" class="'+(cls||'')+'" data-action="'+action+'" '+(attrs||'')+'>'+(glyph?icon(glyph):'')+esc(text)+'</button>'; }
  function options(list, selected) { return list.map(function(x){return '<option'+(x===selected?' selected':'')+'>'+esc(x)+'</option>';}).join(''); }
  function select(name,list,selected,label) { return '<select name="'+name+'" aria-label="'+esc(label||name)+'">'+options(list,selected)+'</select>'; }
  function method(name) {
    var key = {'CashApp':'Cash App','VlinkPay':'VLINKPAY Wallet','AppleCash':'Apple Cash'}[name] || name;
    var m=store.methods.find(function(x){return x.name===key;});
    return '<span class="pw-method">'+(m?'<img src="../assets/pos-payment/'+m.icon+'" alt="">':icon('wallet'))+esc(name)+'</span>';
  }
  function status(name) { return '<span class="pw-status '+(name==='Awaiting confirmation'?'pending':name==='Cancelled'?'cancelled':name==='Confirmed'?'confirmed':'')+'">'+icon(name==='Cancelled'?'close':name==='Awaiting confirmation'?'clock':'check')+esc(name)+'</span>'; }
  function stats(items) { return '<div class="pw-stats '+(items.length===4?'four':'')+'">'+items.map(function(s){return '<article class="pw-stat"><span class="pw-stat-label">'+s[0]+'</span><strong class="'+(s[4]||'')+'">'+s[1]+'</strong>'+(s[2]?'<small>'+s[2]+'</small>':'')+(s[3]?'<span class="pw-stat-icon">'+icon(s[3])+'</span>':'')+'</article>';}).join('')+'</div>'; }
  function chart(title,max) {
    var labels=['Wed','Thu','Fri','Sat','Sun','Mon','Tue'];
    return '<section class="pw-card"><h2>'+title+'</h2><svg class="pw-chart" viewBox="0 0 800 230" role="img" aria-label="'+title+'">'+[0,1,2,3,4].map(function(n){var y=35+n*37;return '<line x1="46" y1="'+y+'" x2="785" y2="'+y+'"/><text x="5" y="'+(y+4)+'">$'+(max*(4-n)/4)+'</text>';}).join('')+labels.map(function(l,i){var x=50+i*121;return '<circle cx="'+x+'" cy="180" r="3" tabindex="0"><title>'+l+': $0.00</title></circle><text x="'+x+'" y="215" text-anchor="middle">'+l+'</text>';}).join('')+'</svg></section>';
  }
  var categoryRange='All time',categorySelection='';
  function localDate(value){return value.getFullYear()+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0');}
  function categoryPeriods(){
    var now=new Date(),result=[];
    if(categoryRange==='Week'){
      var monday=new Date(now.getFullYear(),now.getMonth(),now.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
      for(var index=0;index<12;index++){
        var start=new Date(monday);start.setDate(start.getDate()-index*7);var end=new Date(start);end.setDate(end.getDate()+6);
        var thursday=new Date(Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()+3)),year=thursday.getUTCFullYear();
        var week=Math.ceil((((thursday-new Date(Date.UTC(year,0,1)))/86400000)+1)/7);
        result.push({label:'Week '+week+', '+year,start:localDate(start),end:localDate(end)});
      }
    }else if(categoryRange==='Month'){
      for(var month=0;month<12;month++){var first=new Date(now.getFullYear(),now.getMonth()-month,1),last=new Date(first.getFullYear(),first.getMonth()+1,0);result.push({label:first.toLocaleDateString('en-US',{month:'short',year:'numeric'}),start:localDate(first),end:localDate(last)});}
    }else if(categoryRange==='Year'){
      for(var offset=0;offset<5;offset++){var value=now.getFullYear()-offset;result.push({label:String(value),start:value+'-01-01',end:value+'-12-31'});}
    }
    return result.map(function(period){period.value=period.start+':'+period.end;return period;});
  }
  function categoryPeriodOptions(){
    var periods=categoryPeriods();if(!periods.length){categorySelection='';return '<option>All periods</option>';}
    if(!periods.some(function(period){return period.value===categorySelection;}))categorySelection=periods[0].value;
    return periods.map(function(period){return '<option value="'+period.value+'"'+(period.value===categorySelection?' selected':'')+'>'+esc(period.label)+'</option>';}).join('');
  }
  function categoryRecords(){
    var periods=categoryPeriods(),selected=periods.find(function(period){return period.value===categorySelection;});
    return allPayments().filter(function(record){if(!selected)return true;var at=model.parseDate(record.date);return at&&at>=selected.start&&at<=selected.end;});
  }
  function childHeading(){
    if(view==='income-period')return '<div class="pw-child-heading"><a href="dashboard.html?module=payments&amp;group=0">Salon income</a><h2>Income by period</h2></div>';
    if(isStaffHistory)return '<div class="pw-child-heading"><a href="dashboard.html?module=payments&amp;group=1">Staff payouts</a><h2>Payout history by staff member</h2></div>';
    return '';
  }

  function categorySummary(manage,nested) {
    return '<section class="pw-card"><div class="pw-card-head"><div>'+(nested?'<h3>INCOME BY CATEGORY</h3>':'<h2>INCOME BY CATEGORY</h2>')+'<p>All received money</p></div><div class="pw-controls">'+select('category-period',['All time','Week','Month','Year'],categoryRange,'Income by category period')+'<select name="category-subperiod" aria-label="Income by category date"'+(categoryRange==='All time'?' disabled':'')+'>'+categoryPeriodOptions()+'</select>'+(manage?'<a class="pw-btn pw-primary" href="payment-categories.html">MANAGE CATEGORIES</a>':'')+'</div></div><div class="pw-bars" id="category-bars">'+categoryBars()+'</div></section>';
  }
  function categoryBars() {
    var colors={Uncategorized:'#98a6ba',Commission:'#8d52f2',Bonus:'#f14f73',Salary:'#4486ed'};
    var values=model.categoryTotals(store,categoryRecords(),'All time').map(function(row){return [row.name,row.amount,colors[row.name]||'#7d6de3'];});
    var max=Math.max(1,...values.map(function(c){return c[1];}));
    return values.map(function(c){return '<div><div class="pw-bar-label"><span><i class="pw-dot" style="background:'+c[2]+'"></i>'+esc(c[0])+'</span><span>'+money(c[1])+'</span></div><div class="pw-track"><span style="background:'+c[2]+';width:'+(c[1]?Math.max(.4,c[1]/max*100):0)+'%"></span></div></div>';}).join('');
  }
  function overview() {
    return stats([['TOTAL TIP REVENUE','$27,764.08','','dollar'],['DIRECT TIPS','$27,764.08','','arrow'],['CARD TIPS','$0.00','','dollar']])+chart('WEEKLY TIPS TREND',400)+'<div class="pw-grid">'+categorySummary(true)+'<section class="pw-card"><h2>HOW CUSTOMERS PAID</h2><div class="pw-donut"><span>TOTAL TIPS<strong>$17,091.23</strong></span></div><div class="pw-legend">'+[['Zelle','70% ($12,011.00)','#ceab2d'],['VLINKPAY Wallet','17% ($2,862.00)','#5140db'],['Venmo','1% ($216.23)','#2bd1ed'],['Cash App','6% ($975.00)','#13c995'],['PayPal','6% ($1,014.00)','#0049a5'],['Apple Cash','0% ($12.00)','#101010'],['other','0% ($1.00)','#cad4df']].map(function(c){return '<span><i class="pw-dot" style="background:'+c[2]+'"></i>'+c[0]+': '+c[1]+'</span>';}).join('')+'</div></section></div>';
  }
  var paymentLink = new URL('../customer/oneqr-landing.html?action=payment',location.href).href;
  function receive() {
    return '<section class="pw-card"><h2 class="pw-card-title">'+icon('qr')+'PAYMENT QR</h2><div class="pw-qr-row"><div class="pw-qr" data-qr="'+esc(paymentLink)+'"></div><div class="pw-qr-copy"><h3>Bitcoin Nail Bar</h3><a href="'+esc(paymentLink)+'">'+esc(paymentLink.replace(/^https?:\/\//,''))+'</a><p>Scan to pay Bitcoin Nail Bar</p><div class="pw-controls">'+button('View QR to Download','qr','pw-cyan','qr')+button('Copy Payment Link','copy-link','','copy')+'<a class="pw-btn" href="payment-activity.html">'+icon('wallet')+'Payment Activity</a></div></div></div></section><section class="pw-card"><h2 class="pw-card-title">'+icon('wallet')+'RECEIVE PAYMENT METHODS</h2><div class="pw-method-list">'+store.methods.map(function(m,i){return '<div class="pw-method-row"><button type="button" class="pw-switch" role="switch" aria-label="Toggle '+m.name+'" aria-checked="'+m.enabled+'" data-action="toggle-method" data-index="'+i+'"><span></span></button><img src="../assets/pos-payment/'+m.icon+'" alt="'+m.name+' logo"><div class="pw-method-info"><strong>'+m.name+'</strong><small>'+esc(m.holder)+' · '+esc(m.account)+'</small></div><div class="pw-method-actions">'+button('View','view-method','pw-cyan','eye','data-index="'+i+'" aria-label="View '+m.name+' Payout Details"')+button('Edit','edit-method','pw-gold','edit','data-index="'+i+'" aria-label="Edit '+m.name+' Payout Account"')+'</div></div>';}).join('')+'</div></section>';
  }
  function filterField(label,inner) { return '<div><label class="pw-label">'+label+'</label>'+inner+'</div>'; }
  function commonFilters() {
    return '<section class="pw-card"><div class="pw-toolbar" style="margin:0">'+button('FILTERS','filters','pw-filter-toggle','filter','aria-expanded="false" aria-controls="payment-filters"')+button('Reset','reset','','')+'</div><div class="pw-filter-body" id="payment-filters" hidden>'+filterField('SEARCH','<input name="search" type="search" aria-label="Search">')+filterField('DATE',select('date',['All Time','Last 30 Days'],'All Time','Date'))+filterField('AMOUNT','<div class="pw-filter-amount">$ <input type="number" name="min" min="0" aria-label="Minimum amount"> - $ <input type="number" name="max" min="0" aria-label="Maximum amount"></div>')+filterField('STAFF',select('staff',['All Staff','nexora_02','nexora_005','Ike'],'All Staff','Staff'))+filterField('STATION',select('station',['All Touch Points','One QR','Master Store'],'All Touch Points','Station'))+filterField('PAYMENT METHOD',select('method',['All Payment Methods','Zelle','Venmo','Cash App','PayPal','VLINKPAY Wallet','Apple Cash'],'All Payment Methods','Payment method'))+filterField('STATUS',select('status',['All Statuses','Confirmed','Completed','Awaiting confirmation','Cancelled'],'All Statuses','Status'))+'</div></section>';
  }
  var currentPage=1, perPage=5, rows=[], filters={};
  var staffNames=['nexora_02','nexora_005','Ike','Jade','glxc301.','1.','nexora_004.','nexora.','Staff.'];
  function allTips() {return store.activities.filter(function(a){return a.type==='Tip';}).concat(tips);}
  function allPayments() {return store.activities.filter(function(a){return a.type!=='Tip';}).concat(activities);}
  function allPayouts() {return store.payouts.concat(payouts);}
  function listView(type) {
    if(type==='tips')return commonFilters()+'<div id="payment-list"></div>';
    if(type==='payouts')return stats([['TOTAL PAID (ALL TIME)','$2,762.54','','dollar'],['PAID THIS MONTH','$0.00','October 2026','calendar'],['AWAITING CONFIRMATION','$4,780.42','5 pending payout(s)','clock'],['UNPAID TIP BALANCE','$349.53','17 staff with unpaid tip balance','wallet']])+'<div class="pw-toolbar"><input class="pw-search" name="search" type="search" placeholder="Search staff name..." aria-label="Search staff name">'+button('Show filters','filters','','filter','aria-expanded="false" aria-controls="payment-filters"')+'<div class="pw-controls">'+button('Unpaid tip balance (8)','unpaid','pw-gold','wallet')+button('Export report','export','pw-cyan','download')+button('Create payout','create-payout','pw-primary','plus')+'</div></div><section class="pw-card" id="payment-filters" hidden><div class="pw-filter-body" style="padding:0">'+filterField('STATUS',select('status',['All Statuses','Completed','Awaiting confirmation','Cancelled'],'All Statuses'))+filterField('PAYMENT METHOD',select('method',['All Payment Methods','Zelle','Cash','Cash App','Venmo','Bank transfer','Other'],'All Payment Methods'))+filterField('TYPE',select('type',['All','Tip','Salary','Bonus','Unpaid tip','Other'],'All'))+filterField('DATE',select('date',['All Time','Last 30 Days'],'All Time'))+'</div></section><div id="payment-list"></div>';
    return stats([['TOTAL VOLUME','$17,091.23','179 transactions'],['AWAITING CONFIRMATION','$13,598.00','131 transactions'],['COMPLETED PAYMENTS','$3,493.23','48 transactions']])+'<section class="pw-card"><div class="pw-form-grid" style="max-width:530px;margin:0">'+filterField('STATUS',select('status',['All Statuses','Awaiting confirmation','Completed'],'All Statuses','Status'))+filterField('DATE',select('date',['Last 30 Days','All Time'],'Last 30 Days','Date'))+'</div></section><div id="payment-list"></div>';
  }
  function filterRows(data) {
    return data.filter(function(r){
      if(filters.search && !(isStaffHistory?String(r.staff||''):Object.values(r).join(' ')).toLowerCase().includes(filters.search.toLowerCase().trim()))return false;
      if(filters.status && filters.status!=='All Statuses' && r.status!==filters.status)return false;
      if(filters.method && filters.method!=='All Payment Methods' && r.method!==filters.method)return false;
      if(filters.staff && filters.staff!=='All Staff' && !r.staff.includes(filters.staff))return false;
      if(filters.station && filters.station!=='All Touch Points' && r.station!==filters.station)return false;
      if(filters.type && filters.type!=='All' && r.type!==filters.type)return false;
      if(filters.min && r.amount<Number(filters.min))return false;
      if(filters.max && r.amount>Number(filters.max))return false;
      if(filters.date==='Last 30 Days' && r.date<'2026-09-27')return false;
      return true;
    });
  }
  function table(headers,body,cls) {return '<table class="pw-table '+(cls||'')+'"><thead><tr>'+headers.map(function(x){return '<th scope="col">'+x+'</th>';}).join('')+'</tr></thead><tbody>'+body+'</tbody></table>';}
  function pagination(total,savings) {
    var pages=Math.max(1,Math.ceil(total/perPage));currentPage=Math.min(currentPage,pages);
    var start=total?(currentPage-1)*perPage+1:0,end=Math.min(currentPage*perPage,total);
    return '<div class="pw-pagination"><span>'+(savings?currentPage+' / '+pages:'Showing '+start+' to '+end+' of '+total+' results')+'</span><div class="pw-controls">'+button('Previous','prev','','','aria-label="Previous" '+(currentPage===1?'disabled':''))+Array.from({length:pages},function(_,i){return savings?'':button(i+1,'page','','','data-page="'+(i+1)+'"'+(i+1===currentPage?' aria-current="page"':''));}).join('')+button('Next','next','','','aria-label="Next" '+(currentPage===pages?'disabled':''))+'</div></div>';
  }
  function drawList() {
    var el=document.getElementById('payment-list');if(!el)return;
    var data=view==='tips'?allTips():view==='payouts'?allPayouts():view==='savings'?allTips().filter(function(t){return t.status==='Completed';}):allPayments();
    rows=filterRows(data);var pages=Math.max(1,Math.ceil(rows.length/perPage));currentPage=Math.min(currentPage,pages);
    var shown=rows.slice((currentPage-1)*perPage,currentPage*perPage), body='', headers=[];
    shown.forEach(function(r){
      var detail=button(view==='payouts'?'View':'Details','details','','eye','data-id="'+esc(r.id)+'"');
      if(view==='tips')body+='<tr><td class="mono">'+esc(r.short||r.id)+button('','copy-id','pw-copy','copy','data-id="'+esc(r.id)+'" aria-label="Copy"')+'</td><td>'+date(r.date)+'<br>'+r.time+'</td><td><strong>'+money(r.amount)+'</strong></td><td>'+esc(r.staff)+'</td><td>'+esc(r.station)+'</td><td>'+method(r.method)+'</td><td>'+(r.source==='Manual'?'<span class="pw-source">Manual</span>':r.source)+'</td><td>'+status(r.status)+'</td><td>'+detail+'</td></tr>';
      else if(view==='payouts')body+='<tr><td class="mono"><a href="#" data-action="details" data-id="'+esc(r.id)+'">'+esc(r.id)+'</a></td><td>'+date(r.date)+'<br>'+r.time+'</td><td><strong>'+esc(r.staff)+'</strong><small>NAIE5LMVX</small></td><td><strong>'+money(r.amount)+'</strong></td><td>'+method(r.method)+'</td><td>'+esc(r.type)+'</td><td>'+esc(model.payoutPeriod(r))+'</td><td>—</td><td>'+status(r.status)+'</td><td>'+detail+'</td></tr>';
      else if(view==='savings')body+='<tr><td>'+date(r.date)+'<br>'+r.time+'</td><td><strong>'+esc(r.staff.includes(',')?'Multi-tips':r.staff)+'</strong></td><td><strong>'+money(r.amount)+'</strong></td><td>'+method(r.method)+'</td><td>'+status(r.status)+'</td></tr>';
      else body+='<tr><td><strong>'+date(r.date)+' '+r.time+'</strong></td><td><strong>'+money(r.amount)+'</strong></td><td>'+method(r.method)+'</td><td><span class="pw-source">'+r.source+'</span></td><td>'+status(r.status)+'</td><td>'+detail+'</td></tr>';
    });
    headers=view==='tips'?['ID','DATE','AMOUNT','STAFF','STATION','PAYMENT METHOD','SOURCE','STATUS','ACTION']:view==='payouts'?['PAYOUT CODE','PAID ON','STAFF','AMOUNT','METHOD','TYPE','PAY PERIOD','EVIDENCE','STATUS','DETAILS']:view==='savings'?['DATE','TECHNICIAN','AMOUNT','WALLET','STATUS']:['DATE','AMOUNT','METHOD','SOURCE','STATUS','ACTION'];
    if(!shown.length)body='<tr><td class="pw-empty" colspan="'+headers.length+'">—</td></tr>';
    el.innerHTML='<div class="pw-table-wrap">'+table(headers,body,view)+pagination(rows.length,view==='savings')+'</div>';
  }
  function savings() {
    return stats([['DIRECT TIPS RECEIVED','$27,764.08','No credit card fees','',''],['FEES SAVED','$832.92','Estimated at 3% card fee','','pw-gold-text'],['DIRECT TIP RECIPIENTS','4','Instant payout, no delays'],['PAYOUT SPEED','Instant','No hold times or hidden fees','','pw-cyan-text']])+'<div class="pw-grid savings"><section class="pw-card"><h2 class="pw-card-title">'+icon('calc')+'ESTIMATED DIRECT SAVINGS CALCULATOR</h2><div class="pw-savings-form" style="padding-top:32px"><label for="pw-volume">Monthly Tip Volume ($)</label><input id="pw-volume" type="number" min="0" value="5000"><label for="pw-fee" style="display:flex;justify-content:space-between">Average Credit Card Processing Fee (%) <span id="pw-fee-label">3%</span></label><input id="pw-fee" type="range" min="0" max="6" step="0.1" value="3"><div class="pw-savings-result"><span>ESTIMATED SAVINGS AMOUNT:</span><strong id="pw-monthly">$150.00/month</strong><p>Saves approximately <b id="pw-yearly" class="pw-cyan-text">$1,800.00</b> each year.</p></div></div></section><section class="pw-card"><h2 style="margin-bottom:20px">RECENT DIRECT PAYOUTS</h2><div id="payment-list"></div></section></div>';
  }
  function categories() {
    return categorySummary(false)+'<section class="pw-card"><div class="pw-card-head"><div><h2>CATEGORY MANAGEMENT</h2><p>Manage the categories used to tag your business\'s customer payments.</p></div>'+button('ADD CATEGORY','add-category','pw-primary','plus')+'</div>'+store.categories.map(function(c,i){return '<div class="pw-category-row"><span>'+esc(c)+'</span><div>'+button('','edit-category','','edit','data-index="'+i+'" aria-label="Edit '+esc(c)+'"')+button('','delete-category','','trash','data-index="'+i+'" aria-label="Delete '+esc(c)+'"')+'</div></div>';}).join('')+'</section>';
  }
  function ranking(title,items,glyph,green) {
    return '<section class="pw-card"><h2 class="pw-card-title">'+icon(glyph)+title+'</h2><div style="margin-top:15px">'+items.map(function(r,i){return '<div class="pw-ranking"><span class="rank">'+(i+1)+'</span><div class="pw-rank-name"><strong>'+r[0]+'</strong>'+(r[2]?'<small>'+r[2]+'</small>':'')+'</div><div class="pw-rank-value '+(green?'pw-green-text':'')+'">'+money(r[1])+'<div class="pw-track"><span style="background:'+(green?'#00b981':'#33caec')+';width:'+Math.max(.4,r[1]/items[0][1]*100)+'%"></span></div></div></div>';}).join('')+'</div></section>';
  }
  function analytics() {
    var mix=[['Zelle',26829.6,97,'#c8a62d'],['VlinkPay',285,1,'#cbd5e1'],['CashApp',214.48,1,'#cbd5e1'],['PayPal',185,1,'#cbd5e1'],['Venmo',145,1,'#20cced'],['AppleCash',105,0,'#cbd5e1']];
    return stats([['TOTAL VOLUME','$27,764.08','','dollar'],['TRANSACTIONS','121 Transactions','','arrow'],['AVERAGE TIP','$229.46','','dollar'],['FEES SAVED','$832.92','Reported fee savings from direct payouts','wallet','pw-green-text']])+'<div class="pw-grid analytics">'+chart('DAILY REVENUE TREND',100)+'<section class="pw-card"><h2>HOW TIPS WERE PAID</h2><div class="pw-vertical-bars">'+mix.map(function(c){return '<div><div class="pw-bar-label" style="font-size:11px"><span><i class="pw-dot" style="background:'+c[3]+'"></i>'+c[0]+'</span><span>'+money(c[1])+' ('+c[2]+'%)</span></div><div class="pw-track"><span style="background:'+c[3]+';width:'+Math.max(.5,c[2])+'%"></span></div></div>';}).join('')+'</div></section></div><div class="pw-grid equal">'+ranking('LEADERBOARD',[['Nexora 02',16420.55,'86 tips received'],['Ike',9063.77,'8 tips received'],['nexora_005',1449,'8 tips received'],['glxc301.',185.77,'12 tips received'],['glxc301.',185.77,'12 tips received']],'award',false)+ranking('STATION PERFORMANCE',[['Master Store',27689.08],['332332',15],['Front Desk',0],['Master Store',0]],'users',true)+'</div>';
  }
  function render() {
    var tabs=[['Overview','tip-overview.html','overview'],['Receive Payments','payment-income.html','receive'],['Payment Activity','payment-activity.html','activity'],['Tips','tip-list.html','tips'],['Payroll','staff-payouts.html','payouts'],['Direct Savings','direct-savings.html','savings'],['Category Management','payment-categories.html','categories']];
    root.innerHTML='<div class="pw-heading"><h1>'+(view==='analytics'?icon('chart')+' Analytics':'Payments &amp; Payouts')+'</h1>'+(view==='analytics'?'<p>View in-depth analytics on tipping volume, staff rankings, and station performance.</p>':'<div class="pw-topbar"><nav class="pw-tabs" aria-label="Payments & Payouts">'+tabs.map(function(t){return '<a href="'+t[1]+'"'+((view==='income-period'?'overview':view)===t[2]?' aria-current="page"':'')+'>'+t[0]+'</a>';}).join('')+'</nav>'+button('Add Activity','add-activity','pw-primary','plus')+'</div>')+'</div>'+childHeading()+(view==='income-period'?categorySummary(true,true):view==='receive'?receive():view==='tips'||view==='payouts'||view==='activity'?listView(view):view==='savings'?savings():view==='categories'?categories():view==='analytics'?analytics():overview())+'<footer class="pw-footer">© 2026 NEXORA Touch.</footer>';
    if(view==='activity'&&!Object.keys(filters).length)filters.date='Last 30 Days';
    if(view==='payouts'&&filters.search){var search=root.querySelector('[name="search"]');if(search)search.value=filters.search;}
    drawList();drawQR();
  }
  var dialog=document.getElementById('payment-dialog');
  var uploadSession=0,pendingUploads=0,uploadQueue=Promise.resolve(),evidenceDraft=[];
  function clearPersistenceError() { document.querySelectorAll('[data-payment-save-error]').forEach(function(el){el.remove();}); }
  function showPersistenceError(error,target) {
    clearPersistenceError();
    var message=document.createElement('p');message.dataset.paymentSaveError='';message.className='pw-save-error';message.setAttribute('role','alert');
    // The browser's own storage exception explains why no draft was saved.
    message.textContent=error.message||String(error);
    if(target&&dialog.contains(target))dialog.querySelector('.pw-dialog-body').appendChild(message);
    else root.querySelector('.pw-heading').appendChild(message);
  }
  function validateDateInput(input,min) {
    input.setCustomValidity('');
    var iso=isoDate(input.value),probe=document.createElement('input');
    if(!iso){probe.required=true;probe.pattern='(?!)';probe.value=input.value;input.setCustomValidity(probe.validationMessage);input.reportValidity();return null;}
    probe.type='date';probe.value=iso;if(min)probe.min=min;
    if(!probe.checkValidity()){input.setCustomValidity(probe.validationMessage);input.reportValidity();return null;}
    input.value=date(iso);return iso;
  }
  function validatePayPeriod() {
    var start=validateDateInput(dialog.querySelector('[name="period-start"]'));if(!start)return null;
    var end=validateDateInput(dialog.querySelector('[name="period-end"]'),start);
    return end?{start:start,end:end}:null;
  }
  function setUploadBusy() {
    dialog.querySelectorAll('[data-action="save-payout"],[data-action="save-method"]').forEach(function(button){button.disabled=pendingUploads>0;});
  }
  function rasterImage(file,kind) {
    return new Promise(function(resolve,reject){
      var reader=new FileReader();reader.onerror=function(){reject(reader.error||{code:'type'});};
      reader.onload=function(){
        var image=new Image();image.onerror=function(){reject({code:'type'});};
        image.onload=function(){
          try{
            if(!image.naturalWidth||!image.naturalHeight)throw {code:'type'};
            var limit=kind==='method'?768:1280,scale=Math.min(1,limit/Math.max(image.naturalWidth,image.naturalHeight));
            var canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)throw {code:'type'};
            canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));context.drawImage(image,0,0,canvas.width,canvas.height);
            var output=canvas.toDataURL(kind==='method'?'image/png':'image/jpeg',.8),quality=.8;
            while(output.length>350000&&quality>.35){quality-=.1;output=canvas.toDataURL('image/jpeg',quality);}
            while(output.length>350000&&canvas.width>160&&canvas.height>160){
              var smaller=document.createElement('canvas');smaller.width=Math.round(canvas.width*.75);smaller.height=Math.round(canvas.height*.75);smaller.getContext('2d').drawImage(canvas,0,0,smaller.width,smaller.height);canvas=smaller;output=canvas.toDataURL('image/jpeg',.65);
            }
            if(output.length>350000)throw {code:'size'};
            resolve(output);
          }catch(error){reject(error);}
        };
        image.src=String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
  function imageMarkup(item,remove,index) {
    if(typeof item==='string')return '<figcaption>'+esc(item)+'</figcaption>';
    var image=typeof item.dataUrl==='string'&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(item.dataUrl)?'<a href="'+esc(item.dataUrl)+'" target="_blank" rel="noopener"><img src="'+esc(item.dataUrl)+'" alt="'+esc(item.name)+'"></a>':'';
    return '<figure class="pw-upload-image">'+image+'<figcaption>'+esc(item.name)+'</figcaption>'+(remove?button('Delete','delete-evidence','','trash','data-index="'+index+'"'):'')+'</figure>';
  }
  function drawEvidence() {
    var preview=dialog.querySelector('#pw-evidence-preview');if(preview)preview.innerHTML=evidenceDraft.map(function(item,i){return imageMarkup(item,true,i);}).join('');
  }
  function acceptImages(files,kind) {
    var selected=Array.from(files),session=uploadSession;if(!selected.length)return;
    pendingUploads++;setUploadBusy();
    uploadQueue=uploadQueue.then(async function(){
      if(session!==uploadSession)return;
      var input=dialog.querySelector(kind==='method'?'#pw-method-qr':'#pw-evidence');input.setCustomValidity('');
      try{
        var prepared=await model.prepareUploads(selected,kind==='method'?0:evidenceDraft.length,kind==='method'?1:3,function(file){return rasterImage(file,kind);});
        if(session!==uploadSession)return;
        if(kind==='method'){methodQrDraft=prepared[0].dataUrl;dialog.querySelector('#pw-method-preview').innerHTML='<img src="'+esc(methodQrDraft)+'" alt="Payout QR Code" style="max-width:160px;margin-top:15px">'+button('Delete','delete-method-qr','','trash');}
        else {evidenceDraft=evidenceDraft.concat(prepared);drawEvidence();}
        input.value='';
      }catch(error){
        if(session!==uploadSession)return;
        input.setCustomValidity(error.code==='count'?'You can upload up to 3 more file(s).':error.code==='size'?'Each file must be under 5MB.':'Upload clear photos of your payment confirmation.');input.reportValidity();
      }
    }).finally(function(){if(session===uploadSession){pendingUploads--;setUploadBusy();}});
  }
  function openDialog(title,body,footer,subtitle,wide) {
    uploadSession++;pendingUploads=0;uploadQueue=Promise.resolve();
    dialog.classList.toggle('wide',!!wide);
    dialog.innerHTML='<div class="pw-dialog-head"><div><h2 id="payment-dialog-title">'+esc(title)+'</h2>'+(subtitle?'<p>'+esc(subtitle)+'</p>':'')+'</div>'+button('','close','','close','aria-label="Close"')+'</div><div class="pw-dialog-body">'+body+'</div>'+(footer?'<div class="pw-dialog-foot">'+footer+'</div>':'');
    dialog.showModal();drawQR();
  }
  function closeDialog(){uploadSession++;pendingUploads=0;dialog.close();}
  function drawQR() {
    document.querySelectorAll('[data-qr]').forEach(function(el){if(el.children.length)return;if(typeof QRCode==='function')new QRCode(el,{text:el.dataset.qr,width:Number(el.dataset.size)||106,height:Number(el.dataset.size)||106,colorDark:'#111827',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});else el.innerHTML=icon('qr');});
  }
  function detailRow(label,value) {return '<div class="pw-detail-row"><span>'+label+'</span><span>'+value+'</span></div>';}
  function details(id) {
    var r=(view==='payouts'?allPayouts():view==='tips'?allTips():allPayments()).find(function(x){return x.id===id;});if(!r)return;
    var body='<div class="pw-detail-amount"><small>'+(view==='payouts'?'AMOUNT PAID':'AMOUNT')+'</small><strong>'+money(r.amount)+'</strong>'+status(r.status)+'</div>'+detailRow(view==='payouts'?'Payout code':'ID',esc(r.short||r.id))+detailRow(view==='payouts'?'Paid on':'Date',date(r.date)+' '+r.time)+detailRow(view==='payouts'?'Payment method':view==='activity'?'Method':'Payment Method',method(r.method));
    if(view==='tips')body+=detailRow('Station',esc(r.station))+detailRow('Staff',esc(r.staff))+'<div class="pw-center" style="margin-top:22px"><div class="pw-qr" data-qr="'+esc(new URL('../customer/oneqr-landing.html',location.href).href)+'" style="margin:auto"></div><h3 style="font-size:12px;margin:15px 0 5px">STATION QR</h3><p>Scan to tip and review at this station</p>'+button('SHARE LINK','copy-link','','copy')+'</div>';
    else if(view==='payouts')body+=(r.status==='Completed'?'<p>The staff member confirmed they received this payout.</p>':'')+detailRow('Staff',esc(r.staff))+detailRow('Staff code','NAIE5LMVX')+detailRow('Type',esc(r.type))+detailRow('Pay period',esc(model.payoutPeriod(r)))+(r.note?detailRow('NOTES',esc(r.note)):'')+'<h3 style="font-size:12px;margin-top:24px">PAYMENT EVIDENCE</h3>'+(r.evidence&&r.evidence.length?'<div class="pw-evidence-preview">'+r.evidence.map(function(item){return imageMarkup(item,false);}).join('')+'</div>':'<p>No evidence images yet.</p>');
    else body+=detailRow('Account','—')+detailRow('Customer confirmed',date(r.date)+' '+r.time)+detailRow('You confirmed receipt',date(r.date)+' '+r.time)+'<label class="pw-label" style="margin-top:22px">CATEGORY</label>'+select('detail-category',['Uncategorized'].concat(store.categories),model.categoryFor(store,id),'Category');
    openDialog(view==='tips'?'TRANSACTION DETAILS':view==='payouts'?'Payout details':'PAYMENT DETAILS',body,button('Close','close'),view==='tips'?'Single-staff tip transaction':view==='payouts'?'Staff payout transaction':'Direct payment from a customer via your payment QR.');
    dialog.dataset.detailId=id;
  }
  var methodQrDraft='';
  function methodDialog(index,edit) {
    var m=store.methods[index];dialog.dataset.methodIndex=index;methodQrDraft=m.qr||'';
    var body=edit?'<p>Specify receiving target identifier</p><label for="pw-holder">ACCOUNT HOLDER NAME *</label><input id="pw-holder" name="holder" required value="'+esc(m.holder)+'"><label for="pw-account">ACCOUNT IDENTIFIER *</label><input id="pw-account" name="account" required value="'+esc(m.account)+'"><label for="pw-method-qr">QR CODE (OPTIONAL)</label><div class="pw-file" data-upload-kind="method"><input id="pw-method-qr" type="file" accept="image/*" aria-label="QR CODE (OPTIONAL)"><div id="pw-method-preview">'+(m.qr?'<img src="'+esc(m.qr)+'" alt="Payout QR Code" style="max-width:160px;margin-top:15px">'+button('Delete','delete-method-qr','','trash'):'')+'</div></div><p>Please enter the correct receiving account information. This will be used to receive payments.</p>':'<div class="pw-center">'+method(m.name)+'<p>SCAN TO PAY</p>'+(m.qr?'<img src="'+esc(m.qr)+'" alt="'+m.name+' QR code" style="max-width:200px;margin:18px auto">':'<div class="pw-qr" data-qr="'+esc(paymentLink)+'" style="margin:18px auto"></div>')+'</div>'+detailRow(m.name.toUpperCase()+' REGISTERED NAME',esc(m.holder))+detailRow('EMAIL OR PHONE',esc(m.account));
    openDialog(edit?m.name.toUpperCase()+' ACCOUNT':m.name,body,edit?button('CANCEL','close')+button('SAVE','save-method','pw-primary'):button('CLOSE','close'));
  }
  function categoryDialog(index) {
    dialog.dataset.categoryIndex=index;
    openDialog(index<0?'ADD CATEGORY':'EDIT CATEGORY','<label for="category-name-input">Category name</label><input id="category-name-input" name="category-name" required maxlength="200" value="'+(index<0?'':esc(store.categories[index]))+'">',button('Cancel','close')+button('SAVE CATEGORY','save-category','pw-primary'));
    document.getElementById('category-name-input').focus();
  }
  function addActivity() {
    openDialog('Add Payment Activity','<label>TYPE *</label><div class="pw-choice-row" data-choice="activity-type">'+button('Payment','choice','is-selected','','data-value="Payment"')+button('Tip','choice','','','data-value="Tip"')+'</div><label for="pw-activity-amount">AMOUNT (USD) *</label><input id="pw-activity-amount" name="amount" type="number" min="0.01" step="0.01" required><label>PAYMENT METHOD *</label>'+select('activity-method',['Zelle','Cash App','Venmo','VLINKPAY Wallet','Apple Cash','PayPal'],'Zelle','Payment method')+'<div id="pw-activity-staff" hidden><label class="pw-label">STAFF *</label>'+select('activity-staff',['nexora_02','nexora_005','Ike'],'nexora_02','Staff')+'</div><label for="pw-activity-date">TRANSACTION DATE *</label><input id="pw-activity-date" name="transaction-date" value="Oct 27, 2026" required><label for="pw-activity-note">NOTE / DESCRIPTION (OPTIONAL)</label><textarea id="pw-activity-note" name="note" rows="3"></textarea><div class="pw-form-note">Logs external transactions only. Nexora does not process or hold funds. Entries are tagged Manual to distinguish from auto QR sync.</div>',button('Cancel','close')+button('Save Activity','save-activity','pw-primary','plus'),'PAYMENT REPORTS');
  }
  function payoutForm() {
    evidenceDraft=[];
    openDialog('Create payout','<label>STAFF *</label>'+select('payout-staff',['Select staff member','nexora_02','nexora_005','Ike'],'Select staff member','Staff')+'<label>PAYMENT METHOD *</label><div class="pw-choice-row" data-choice="payout-method">'+['Zelle','Bank transfer','Cash App','Venmo','Cash','Other'].map(function(m,i){return button(m,'choice',i===0?'is-selected':'','','data-value="'+m+'"');}).join('')+'</div><label for="pw-payout-amount">AMOUNT PAID *</label><input id="pw-payout-amount" name="amount" type="number" min="0.01" step="0.01" required><label>PAYOUT TYPE *</label><div class="pw-choice-row" data-choice="payout-type">'+['Tip','Salary','Bonus','Unpaid tip','Other'].map(function(t,i){return button(t,'choice',i===0?'is-selected':'','','data-value="'+t+'"');}).join('')+'</div><label>PAY PERIOD *</label><div class="pw-form-grid"><input name="period-start" value="Oct 1, 2026" aria-label="Pay period start" required><input name="period-end" value="Oct 31, 2026" aria-label="Pay period end" required></div><label for="pw-payout-note">NOTES</label><textarea id="pw-payout-note" name="note" rows="2"></textarea><label for="pw-evidence">PAYMENT EVIDENCE</label><div class="pw-file" data-upload-kind="evidence"><input id="pw-evidence" type="file" accept="image/*" multiple><div id="pw-evidence-preview" class="pw-evidence-preview"></div><p>You can also drag and drop images here.<br>Upload clear photos of your payment confirmation.<br>You can upload up to 3 more file(s).<br>Each file must be under 5MB.<br>Evidence images are visible only to the salon owner for tax and audit review.</p></div><label>CONFIRMATION STATUS *</label><div class="pw-choice-row" data-choice="payout-status">'+button('Transferred — awaiting staff confirmation','choice','is-selected','','data-value="Awaiting confirmation"')+button('Payment receipt confirmed','choice','','','data-value="Completed"')+'</div>',button('Cancel','close')+button('Save payout','save-payout','pw-primary'),'Record a salary or tip payment to staff',true);
  }
  function chosen(group) {var el=dialog.querySelector('[data-choice="'+group+'"] .is-selected');return el?el.dataset.value:'';}
  function field(name) {var el=dialog.querySelector('[name="'+name+'"]');return el?el.value:'';}
  function requiredNumber(){var el=dialog.querySelector('[name="amount"]');return el.reportValidity()&&Number(el.value)>0;}
  function copy(text,el) {
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){el.classList.add('pw-success-signal');setTimeout(function(){el.classList.remove('pw-success-signal');},1500);}).catch(function(){});
  }
  function exportReport() {
    var data=filterRows(allPayouts()),csv=['PAYOUT CODE,PAID ON,STAFF,AMOUNT,METHOD,TYPE,PAY PERIOD,STATUS'].concat(data.map(function(r){return [r.id,date(r.date),r.staff,r.amount,r.method,r.type,model.payoutPeriod(r),r.status].map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',');})).join('\n');
    var url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));var a=document.createElement('a');a.href=url;a.download='payroll-report.csv';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  document.addEventListener('click',function(event){
    var el=event.target.closest('[data-action]');if(!el||(!root.contains(el)&&!dialog.contains(el)))return;
    event.preventDefault();var action=el.dataset.action,index=Number(el.dataset.index);
    if(action==='close')closeDialog();
    else if(action==='filters'){var panel=document.getElementById('payment-filters');panel.hidden=!panel.hidden;el.setAttribute('aria-expanded',String(!panel.hidden));}
    else if(action==='reset'){filters={};currentPage=1;root.querySelectorAll('#payment-filters input').forEach(function(i){i.value='';});root.querySelectorAll('#payment-filters select').forEach(function(i){i.selectedIndex=0;});drawList();}
    else if(action==='prev'||action==='next'||action==='page'){currentPage=action==='page'?Number(el.dataset.page):currentPage+(action==='next'?1:-1);drawList();}
    else if(action==='details')details(el.dataset.id);
    else if(action==='copy-id')copy(el.dataset.id,el);
    else if(action==='copy-link')copy(paymentLink,el);
    else if(action==='toggle-method'){if(save(function(next){next.methods[index].enabled=!next.methods[index].enabled;},el))render();}
    else if(action==='view-method'||action==='edit-method')methodDialog(index,action==='edit-method');
    else if(action==='save-method'){
      var holder=dialog.querySelector('[name="holder"]'),account=dialog.querySelector('[name="account"]'),qrInput=dialog.querySelector('#pw-method-qr');if(pendingUploads||!holder.reportValidity()||!account.reportValidity()||!qrInput.reportValidity())return;
      var methodIndex=Number(dialog.dataset.methodIndex);
      if(!save(function(next){var m=next.methods[methodIndex];m.holder=holder.value.trim();m.account=account.value.trim();m.qr=methodQrDraft;},el))return;
      closeDialog();render();
    }
    else if(action==='delete-method-qr'){methodQrDraft='';dialog.querySelector('#pw-method-preview').innerHTML='';dialog.querySelector('#pw-method-qr').value='';dialog.querySelector('#pw-method-qr').setCustomValidity('');}
    else if(action==='delete-evidence'){evidenceDraft.splice(index,1);dialog.querySelector('#pw-evidence').setCustomValidity('');drawEvidence();}
    else if(action==='qr')openDialog('PAYMENT QR','<div class="pw-center"><h3>Bitcoin Nail Bar</h3><p>Scan to pay Bitcoin Nail Bar</p><div class="pw-qr" data-qr="'+esc(paymentLink)+'" data-size="230" style="width:250px;height:250px;margin:20px auto"></div></div>',button('Close','close')+button('View QR to Download','download-qr','pw-primary','download'));
    else if(action==='download-qr'){var canvas=dialog.querySelector('canvas');if(canvas){var a=document.createElement('a');a.download='payment-qr.png';a.href=canvas.toDataURL('image/png');a.click();}}
    else if(action==='add-category')categoryDialog(-1);
    else if(action==='edit-category')categoryDialog(index);
    else if(action==='delete-category'){if(save(function(next){model.deleteCategory(next,index);},el))render();}
    else if(action==='save-category'){
      var inp=dialog.querySelector('[name="category-name"]');if(!inp.reportValidity()||!inp.value.trim())return;var ci=Number(dialog.dataset.categoryIndex),categoryName=inp.value.trim();
      if(!save(function(next){if(ci<0){if(categoryName!=='Uncategorized'&&!next.categories.includes(categoryName))next.categories.push(categoryName);}else model.renameCategory(next,ci,categoryName);},el))return;
      closeDialog();render();
    }
    else if(action==='add-activity')addActivity();
    else if(action==='choice'){el.parentElement.querySelectorAll('button').forEach(function(b){b.classList.remove('is-selected');});el.classList.add('is-selected');if(el.parentElement.dataset.choice==='activity-type')document.getElementById('pw-activity-staff').hidden=el.dataset.value!=='Tip';}
    else if(action==='save-activity'){
      if(!requiredNumber())return;var activityDate=validateDateInput(dialog.querySelector('#pw-activity-date'));if(!activityDate)return;
      var type=chosen('activity-type'),id='MAN-'+Date.now(),activity={id:id,short:id,date:activityDate,time:'12:00 pm',amount:Number(field('amount')),method:field('activity-method'),type:type,staff:type==='Tip'?field('activity-staff'):'',station:'Master Store',status:'Completed',source:'Manual',note:field('note')};
      if(!save(function(next){next.activities.unshift(activity);},el))return;
      closeDialog();if(type==='Tip'&&view!=='tips')location.href='tip-list.html';else if(type!=='Tip'&&view!=='activity')location.href='payment-activity.html';else{currentPage=1;render();}
    }
    else if(action==='create-payout')payoutForm();
    else if(action==='save-payout'){
      if(pendingUploads||!requiredNumber())return;var staff=field('payout-staff');if(staff==='Select staff member'){dialog.querySelector('[name="payout-staff"]').focus();return;}
      var period=validatePayPeriod();if(!period||!dialog.querySelector('#pw-evidence').reportValidity())return;
      var payout={id:'PAY-'+Date.now(),date:'2026-10-27',time:'12:00 pm',amount:Number(field('amount')),method:chosen('payout-method'),type:chosen('payout-type'),status:chosen('payout-status'),staff:staff,periodStart:period.start,periodEnd:period.end,note:field('note'),evidence:evidenceDraft.slice()};
      if(!save(function(next){next.payouts.unshift(payout);},el))return;
      filters=isStaffHistory?{search:filters.search||''}:{};currentPage=1;closeDialog();render();
    }
    else if(action==='unpaid'){
      var unpaid=[['Jade',66.06,'2026-09-04','04:22 pm'],['Ike',60.77,'2026-10-13','09:43 am'],['glxc301.',30.77,'2026-09-03','02:51 pm'],['1.',25.77,'2026-10-13','09:43 am'],['nexora_004.',15,'2026-10-13','09:43 am'],['nexora.',15,'2026-10-13','09:43 am'],['nexora_02',15,'2026-10-13','09:43 am'],['Staff.',0.77,'2026-08-19','05:27 pm']];
      openDialog('Unpaid tip balance by staff','<div class="pw-table-wrap">'+table(['STAFF','UNPAID TIP BALANCE','LAST UPDATED','DETAILS'],unpaid.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td><strong>'+money(r[1])+'</strong></td><td>'+date(r[2])+'<br>'+r[3]+'</td><td><div class="pw-controls">'+button('Transaction history','unpaid-history','','clock','data-staff="'+esc(r[0])+'"')+button('Create payout','unpaid-create','','plus','data-staff="'+esc(r[0])+'" data-amount="'+r[1]+'"')+'</div></td></tr>';}).join(''))+'</div>',button('Close','close'),'8 staff with unpaid tip balance',true);
    }
    else if(action==='unpaid-create'){closeDialog();payoutForm();if(el.dataset.staff){var staffSelect=dialog.querySelector('[name="payout-staff"]');staffSelect.innerHTML=options(['Select staff member'].concat(staffNames),el.dataset.staff);dialog.querySelector('[name="amount"]').value=el.dataset.amount;var unpaidChoice=dialog.querySelector('[data-choice="payout-type"] [data-value="Unpaid tip"]');unpaidChoice.parentElement.querySelectorAll('button').forEach(function(b){b.classList.toggle('is-selected',b===unpaidChoice);});}}
    else if(action==='unpaid-history'){location.href='tip-list.html?staff='+encodeURIComponent(el.dataset.staff);}
    else if(action==='export')exportReport();
  });
  root.addEventListener('input',function(event){
    var el=event.target;
    if(el.id==='pw-volume'||el.id==='pw-fee'){
      var volume=Math.max(0,Number(document.getElementById('pw-volume').value)),fee=Number(document.getElementById('pw-fee').value),amount=volume*fee/100;
      document.getElementById('pw-fee-label').textContent=fee+'%';document.getElementById('pw-monthly').textContent=money(amount)+'/month';document.getElementById('pw-yearly').textContent=money(amount*12);return;
    }
    if(el.name&&['search','min','max'].includes(el.name)){filters[el.name]=el.value;currentPage=1;drawList();if(isStaffHistory&&el.name==='search'){var url=new URL(location.href);if(el.value.trim())url.searchParams.set('staff',el.value.trim());else url.searchParams.delete('staff');history.replaceState(history.state,'',url.href);}}
  });
  root.addEventListener('change',function(event){
    var el=event.target;
    if(el.name==='category-period'){
      categoryRange=el.value;categorySelection='';var sub=root.querySelector('[name="category-subperiod"]');sub.disabled=el.value==='All time';sub.innerHTML=categoryPeriodOptions();root.querySelector('#category-bars').innerHTML=categoryBars();return;
    }
    if(el.name==='category-subperiod'){categorySelection=el.value;root.querySelector('#category-bars').innerHTML=categoryBars();return;}
    if(el.tagName==='SELECT'&&el.name&&!el.name.startsWith('category-')){filters[el.name]=el.value;currentPage=1;drawList();}
  });
  dialog.addEventListener('change',function(event){
    var target=event.target;
    if(target.name==='detail-category'){
      var id=dialog.dataset.detailId,previous=model.categoryFor(store,id),value=target.value;
      if(!save(function(next){next.categoryTags[id]=value;},target))target.value=previous;
    }
    if(target.id==='pw-method-qr')acceptImages(target.files,'method');
    if(target.id==='pw-evidence')acceptImages(target.files,'evidence');
  });
  dialog.addEventListener('input',function(event){if(event.target.matches('input:not([type="file"]),textarea'))event.target.setCustomValidity('');});
  dialog.addEventListener('dragover',function(event){var zone=event.target.closest('[data-upload-kind]');if(zone){event.preventDefault();zone.classList.add('is-dragging');}});
  dialog.addEventListener('dragleave',function(event){var zone=event.target.closest('[data-upload-kind]');if(zone&&!zone.contains(event.relatedTarget))zone.classList.remove('is-dragging');});
  dialog.addEventListener('drop',function(event){var zone=event.target.closest('[data-upload-kind]');if(zone){event.preventDefault();zone.classList.remove('is-dragging');if(event.dataTransfer)acceptImages(event.dataTransfer.files,zone.dataset.uploadKind);}});
  dialog.addEventListener('cancel',function(){uploadSession++;pendingUploads=0;});
  dialog.addEventListener('click',function(event){if(event.target===dialog)closeDialog();});
  var requestedStaff=new URLSearchParams(location.search).get('staff');
  if(view==='tips'&&requestedStaff)filters.staff=requestedStaff;
  if(view==='payouts'&&requestedStaff)filters.search=requestedStaff;
  render();
})();
