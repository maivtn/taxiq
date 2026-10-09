(function () {
  'use strict';
  const data = window.NEXORA_PROMOTION_CREATE_DATA;
  const studio = window.NEXORA_STUDIO;
  const form = document.getElementById('promotion-form');
  if (!data || !studio || !form) return;
  const $ = id => document.getElementById(id);
  const field = name => form.elements.namedItem(name);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const vi = () => $('promotion-language')?.value === 'vi';
  const text = (en, vn) => vi() ? vn : en;
  const label = item => item?.[vi() ? 'vi' : 'en'] || item?.en || '';
  const storageKey = 'nexora:reward-promotions:v1';
  const today = () => { const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(part => [part.type,part.value])); return parts.year+'-'+parts.month+'-'+parts.day; };
  const dateLabel = date => date ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(date + 'T12:00:00Z')) : '—';
  function storedState() { try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) { return {}; } }
  const salon = window.NEXORA_SALON_DATA?.loadCatalog().salon || {id:'bitcoin-nail-bar-houston',name:'Bitcoin Nail Bar',industryId:'nail'};
  const defaultIndustry = data.industries.some(item => item.id === salon.industryId) ? salon.industryId : 'nail';
  const industry = id => data.industries.find(item => item.id === id);
  const goalMap = ['new-customers','slow-hours','slow-hours','slow-hours','returning','new-customers','slow-hours'];
  const goalCopy = {'slow-hours':['Fill slow hours','Lấp giờ vắng'],returning:['Bring customers back','Khách quay lại'],'new-customers':['Get new customers','Thu hút khách mới'],'gift-card':['Sell gift cards','Bán Gift Card']};
  const requirementCopy = {none:['No requirement','Không yêu cầu'],online:['Online booking required','Cần đặt lịch online'],appt:['Appointment required','Cần có lịch hẹn'],checkin:['Check-in required','Cần check-in']};
  Object.assign(studio.copy, {
    chooseIndustry:['Industry','Chọn ngành'], promotionGoal:['Goal','Mục tiêu'], goalSlow:goalCopy['slow-hours'], goalReturning:goalCopy.returning, goalNew:goalCopy['new-customers'], goalGift:goalCopy['gift-card'],
    allGoals:['All goals','Tất cả mục tiêu'], allGroups:['All groups','Tất cả nhóm'], templateServiceGroup:['Service group','Nhóm dịch vụ'], searchTemplates:['Search templates','Tìm mẫu'], templateSearchPlaceholder:['Name, offer or service…','Tên, ưu đãi hoặc dịch vụ…'],
    previousTemplates:['Previous','Trước'],nextTemplates:['Next','Tiếp'], choosePromotionTemplate:['Promotion template · optional','Mẫu khuyến mãi · tùy chọn'], selectedServiceGroups:['Selected service groups','Nhóm dịch vụ áp dụng'],
    serviceHelp:['From the POS service catalog. Hold Ctrl / ⌘ to select more than one.','Danh mục dịch vụ từ POS. Giữ Ctrl / ⌘ để chọn nhiều mục.'], couponEligibility:['Eligibility & conditions','Đối tượng & điều kiện áp dụng'],
    customerRequirement:['Customer requirement','Yêu cầu với khách'],requirementNone:requirementCopy.none,requirementOnline:requirementCopy.online,requirementAppointment:requirementCopy.appt,requirementCheckin:requirementCopy.checkin,
    minimumSpend:['Minimum eligible spend · USD · optional','Chi tiêu tối thiểu · USD · tùy chọn'],maximumDiscount:['Maximum discount per use · USD · optional','Giảm tối đa mỗi lần · USD · tùy chọn'],couponCode:['Coupon code · optional','Mã Coupon · tùy chọn'],
    dealLimits:['Deal usage limits','Giới hạn sử dụng Deal'],dealFrequency:['Per customer','Theo khách'],oncePerVisit:['Once per visit','Một lần mỗi lượt đến'],oncePerWeek:['Once per week','Một lần mỗi tuần'],oncePerMonth:['Once per month','Một lần mỗi tháng'],dealMonthlyCap:['Monthly discount cap · USD · optional','Hạn mức giảm trong tháng · USD · tùy chọn'],dealCapHint:['The cap applies to the total discount given by this Deal during a calendar month.','Hạn mức tính tổng tiền giảm của Deal trong một tháng lịch.'],
    internalChannels:['Internal · your own channels','Internal · Kênh riêng'],goalChannelHint:['The goal suggests channels; you can change them.','Mục tiêu gợi ý kênh; bạn có thể điều chỉnh.'],publicChannels:['Public · NEXORA discovery','Public · Khám phá NEXORA'],publicNote:['Organic listings are free. Paid promotion is optional.','Hiển thị tự nhiên miễn phí. Quảng cáo trả phí là tùy chọn.'],
    checkinOptions:['Check-in placements','Vị trí Check-in'],bookingOptions:['Booking & AI Voice placements','Vị trí Booking & AI Voice'],partnerContent:['Partner content · optional','Nội dung đối tác · tùy chọn'],partnerModeLabel:['OneQR Hero & check-in idle screen','OneQR Hero & màn hình chờ Check-in'],ownOffersOnly:['Your own offers only','Chỉ ưu đãi của tiệm'],partnerReviewRequired:['Request partner content · owner review','Yêu cầu nội dung đối tác · owner xét duyệt'],partnerConsentLabel:['Request review for partners in other industries. Exclude competing businesses.','Yêu cầu xét duyệt đối tác khác ngành. Loại trừ đối thủ cạnh tranh.'],
    externalAds:['External advertising · optional','Quảng cáo ngoài NEXORA · tùy chọn'],externalAdsHint:['Save selected platforms and prepare assets. Platform accounts and spending are configured separately.','Lưu nền tảng đã chọn và chuẩn bị nội dung. Tài khoản, ngân sách nền tảng cấu hình riêng.'],
    campaignAndPosting:['05 / Campaign & posting schedule','05 / Chiến dịch & lịch đăng'],programCampaign:['Promotion campaign · optional','Chiến dịch khuyến mãi · tùy chọn'],newProgramCampaign:['New campaign','Tạo chiến dịch'],campaignKind:['Campaign type','Loại chiến dịch'],grandOpening:['Grand opening','Khai trương'],seasonalCampaign:['Seasonal','Theo mùa'],customCampaign:['Other','Khác'],addProgramCampaign:['Add campaign','Thêm chiến dịch'],postMode:['Posting schedule','Lịch đăng'],postOff:['No automatic posting','Không tự động đăng'],postOnEnable:['When the promotion starts','Khi khuyến mãi bắt đầu'],postMilestones:['Program milestones','Theo mốc chương trình'],postWeekly:['Repeat weekly','Lặp mỗi tuần'],postTime:['Posting time · shop timezone','Giờ đăng · múi giờ tiệm'],postScheduleHint:['Review the draft queue. Manually edited dates stay fixed when promotion dates change.','Rà soát hàng đợi nháp. Ngày đã chỉnh tay được giữ khi đổi ngày khuyến mãi.'],
    checkinPreview:['Check-in','Check-in'],bookingPreview:['Booking','Booking'],preflightTitle:['Review before saving','Rà soát trước khi lưu'],shareLinkQr:['Customer link & QR','Link & QR cho khách'],
    industryError:['Choose an industry.','Chọn ngành.'],groupError:['Choose at least one active service group.','Chọn ít nhất một nhóm dịch vụ đang hoạt động.'],moneyConditionError:['Enter a positive USD amount with up to two decimal places.','Nhập số tiền USD lớn hơn 0, tối đa hai số lẻ.'],requirementError:['Choose a supported customer requirement.','Chọn yêu cầu áp dụng hợp lệ.'],dealFrequencyError:['Choose a Deal usage frequency.','Chọn tần suất sử dụng Deal.'],codeError:['Use up to 40 letters, numbers, underscores or hyphens for the coupon code.','Mã Coupon tối đa 40 ký tự chữ, số, gạch dưới hoặc gạch nối.'],partnerConsentError:['Confirm the partner review request.','Xác nhận yêu cầu xét duyệt đối tác.'],postChannelError:['Choose at least one enabled channel for the posting schedule.','Chọn ít nhất một kênh đang bật cho lịch đăng.'],postDateError:['Set effective dates before preparing milestone or weekly posts.','Chọn ngày hiệu lực trước khi lập lịch theo mốc hoặc hàng tuần.'],postTimeError:['Enter a valid posting time.','Nhập giờ đăng hợp lệ.'],postMilestoneError:['Select at least one posting milestone.','Chọn ít nhất một mốc đăng.'],paidPublicError:['Enable a Public discovery channel for Paid Boost.','Bật một kênh Public cho Paid Boost.'],catalogServiceError:['An eligible service is no longer in the POS catalog. Update the selection.','Có dịch vụ áp dụng không còn trong danh mục POS. Cập nhật lựa chọn.'],postLimitError:['A weekly posting schedule can cover up to one year.','Lịch đăng hàng tuần có thể lập tối đa một năm.'],postQueueDateError:['Enter valid dates and times for the posting queue.','Nhập ngày và giờ hợp lệ cho hàng đợi đăng.']
  });
  for (const group of data.groups) studio.copy['promotionIndustry_'+group.id] = [group.en,group.vi];
  const fallback = window.NEXORA_APPOINTMENT_SERVICE_CATALOG.normalize(data.serviceMenu).categories.map(group => ({...group,services:group.services.filter(service => service.type !== 'add-on')})).filter(group => group.services.length);
  const categories = window.NEXORA_SERVICE_APPROVAL_SETTINGS.loadCatalog(salon.id,fallback).filter(category => category.active !== false).map(category => ({...category,services:(category.services || []).filter(service => service.id !== '__custom__' && service.active !== false)})).filter(category => category.services.length);
  const serviceMap = new Map(categories.flatMap(group => group.services.map(service => [service.id,{...service,categoryId:group.id}])));
  for (const [id,service] of serviceMap) studio.services[id] = service.name;
  const groupMap = new Map(categories.map(group => [group.id,group]));
  const legacyLabels = {...studio.services};
  function populateServices(offer) {
    field('serviceGroupIds').innerHTML = categories.map(group => '<option value="'+esc(group.id)+'">'+esc(group.name)+'</option>').join('');
    field('serviceIds').innerHTML = categories.map(group => '<optgroup label="'+esc(group.name)+'">'+group.services.map(service => '<option value="'+esc(service.id)+'">'+esc(service.name)+'</option>').join('')+'</optgroup>').join('');
    for (const id of offer.serviceIds || []) if (!serviceMap.has(id)) field('serviceIds').add(new Option((legacyLabels[id] || id) + text(' · Existing selection',' · Lựa chọn cũ'),id));
    for (const id of offer.serviceGroupIds || []) if (!groupMap.has(id)) field('serviceGroupIds').add(new Option(id + text(' · Existing selection',' · Lựa chọn cũ'),id));
  }
  function industryOptions(all) {
    return (all ? '<option value="all" data-industry-icon="retail">'+text('All industries','Tất cả ngành')+'</option>' : '') + data.groups.map(group => '<optgroup label="'+esc(label(group))+'">'+data.industries.filter(item => item.group === group.id).map(item => '<option value="'+esc(item.id)+'" data-industry-icon="'+esc(item.icon)+'">'+esc(label(item))+'</option>').join('')+'</optgroup>').join('');
  }
  $('promotion-industry').innerHTML = industryOptions(false);
  $('template-industry').innerHTML = industryOptions(true);
  $('template-industry').value = defaultIndustry;
  window.NEXORA_PROMOTION_ICONS.mountPicker($('promotion-industry'));
  window.NEXORA_PROMOTION_ICONS.mountPicker($('template-industry'));
  $('template-service-group').innerHTML += data.serviceGroups.map((name,index) => '<option value="'+index+'">'+esc(name)+'</option>').join('');
  const days = value => String(value || '0123456').split('').map(index => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Number(index)]).filter(Boolean);
  const theme = value => ({ocean:'blue',sage:'green',sig:'purple',rose:'rose',gold:'gold'}[value] || 'purple');
  function discountType(type,value,custom) { return custom && (value === '' || value == null) ? 'custom' : type === 'amt' ? 'fixed' : type === 'pct' ? 'percent' : type === 'free' ? 'free' : 'custom'; }
  function goalFromTitle(value) { return /loyal|return|rebook|birthday/i.test(value) ? 'returning' : /first|new|welcome|friend/i.test(value) ? 'new-customers' : /gift card/i.test(value) ? 'gift-card' : 'slow-hours'; }
  function customerGroup(audience,goal) { return /first|new customer|first-time|khách mới|lần đầu/i.test(audience) ? 'new' : goal === 'returning' ? 'returning' : 'all'; }
  function normalizeProgram(row,seasonal) {
    const type = discountType(row[13],row[14],row[15]);
    const inds = seasonal ? ['nail'] : row[19] || [];
    const goal = goalMap[row[8]?.[0]] || goalFromTitle(row[2]);
    return {id:(seasonal ? 's:' : 'p:'+row[0]+':')+row[1],industryIds:inds,serviceGroups:row[9] || [],goal,theme:theme(row[17]),source:data.sources[row[0]] || 'Community',version:1,title:row[2],description:[row[4],row[6],row[5]].filter(Boolean).join(' · '),audience:row[6],offerType:'deal',badge:row[3],type,value:type === 'custom' ? row[15] || row[4] : row[14],days:days(row[10]),startTime:row[11] || '00:00',endTime:row[12] || '23:59',useRequirement:requirementCopy[row[16]] ? row[16] : 'none',exclusions:data.terms[row[7]] || '',customerGroup:customerGroup(row[6],goal)};
  }
  const library = [
    ...data.programs.map(row => normalizeProgram(row,false)),
    ...data.seasonal.map(row => normalizeProgram(row,true)),
    ...data.coupons.map(row => {
      const goal = goalFromTitle(row[2]+' '+row[4]);
      const type = discountType(row[12],row[13],row[14]);
      return {id:'c:'+row[0]+':'+row[1],industryIds:row[16] || [],serviceGroups:[],goal,theme:theme(row[15]),source:data.sources[row[0]],version:1,title:row[4],description:row[5],offerType:'coupon',badge:row[3],code:row[6],minimumSpend:row[7] || null,totalSlots:row[8] || null,perPersonLimit:row[9] || 1,expiryDays:row[10],holdDays:7,useRequirement:requirementCopy[row[11]] ? row[11] : 'none',type,value:type === 'custom' ? row[14] || row[5] : row[13],days:days(),startTime:'00:00',endTime:'23:59',customerGroup:customerGroup(row[4],goal)};
    }),
    ...data.frames.map(row => ({id:'f:'+row[0]+':'+row[1],industryIds:[row[0]],serviceGroups:[],goal:goalMap[row[3]] || 'slow-hours',theme:'purple',source:'Community · Industry frame',version:1,title:row[5],titleVi:row[4],description:row[7],descriptionVi:row[6],audience:row[7],offerType:row[2],type:'percent',value:'',badge:'',days:days(row[8]),startTime:'00:00',endTime:'23:59',useRequirement:requirementCopy[row[9]] ? row[9] : 'none',exclusions:data.notes[row[10]]?.[1] || '',exclusionsVi:data.notes[row[10]]?.[0],customerGroup:customerGroup(row[7],goalMap[row[3]])}))
  ];
  const templateFields = ['title','badge','description','offerType','type','value','days','startTime','endTime','industryId','goal','serviceScope','serviceIds','serviceGroupIds','customerGroup','stacking','useRequirement','minimumSpend','maximumDiscount','exclusions','code','totalSlots','perPersonLimit','holdDays','dealFrequency','dealMonthlyCap','startDate','endDate','cta'];
  let selectedTemplate = null, baseline = null, pendingCampaigns = [], queueEdits = {}, previewMode = 'banner';
  const templateMap = new Map(library.map(item => [item.id,item]));
  function preset(item) {
    const result = {...item,title:vi() && item.titleVi ? item.titleVi : item.title,description:vi() && item.descriptionVi ? item.descriptionVi : item.description,exclusions:vi() && item.exclusionsVi ? item.exclusionsVi : item.exclusions || '',industryId:item.industryIds.includes(field('industryId').value) ? field('industryId').value : item.industryIds[0] || defaultIndustry,serviceScope:'all',serviceIds:[],serviceGroupIds:[],stacking:'exclusive',cta:item.useRequirement === 'online' || item.useRequirement === 'appt' ? 'booking' : 'details',minimumSpend:item.minimumSpend ?? null,maximumDiscount:null,code:item.code || '',totalSlots:item.offerType === 'coupon' ? item.totalSlots ?? null : null,perPersonLimit:item.offerType === 'coupon' ? item.perPersonLimit || 1 : null,holdDays:item.offerType === 'coupon' ? item.holdDays ?? null : null,dealFrequency:'visit',dealMonthlyCap:null,startDate:'',endDate:''};
    if (result.offerType === 'coupon') { result.startDate = today(); if (item.expiryDays) result.endDate = shift(result.startDate,item.expiryDays); }
    // Resolve template group suggestions against actual POS categories; no sample service IDs are invented.
    const patterns = [/manicure|gel/i,/pedicure|foot/i,/acrylic|extension|dip/i,/add.?on|design|art/i,/.*/];
    const groups = categories.filter(group => item.serviceGroups.some(index => patterns[index]?.test(group.name)));
    if (groups.length && !item.serviceGroups.includes(4)) { result.serviceScope = 'groups'; result.serviceGroupIds = groups.map(group => group.id); }
    if (['percent','fixed'].includes(result.type) && result.value !== '') result.value = Number(result.value);
    result.templateId = item.id; result.templateVersion = item.version; result.templateSource = item.source;
    result.templateBaseline = Object.fromEntries(templateFields.map(key => [key,result[key] ?? null]));
    return result;
  }
  function updateTemplatePicker() {
    const matching = [...templateMap.values()].filter(item => (!item.industryIds.length || item.industryIds.includes(field('industryId').value)) && item.offerType === field('offerType').value && item.goal === field('goal').value);
    const selected = $('editor-template').value || selectedTemplate;
    $('editor-template').innerHTML = '<option value="">'+text('Choose a template…','Chọn mẫu…')+'</option>'+matching.map(item => '<option value="'+esc(item.id)+'">'+esc(vi() && item.titleVi ? item.titleVi : item.title)+'</option>').join('');
    if (selected && templateMap.has(selected) && !matching.some(item => item.id === selected)) $('editor-template').add(new Option(templateMap.get(selected).title,selected));
    $('editor-template').value = selected || '';
    $('editor-template-preview').disabled = !$('editor-template').value;
    $('editor-template-apply').disabled = !$('editor-template').value;
    $('editor-template-source').textContent = selectedTemplate ? text('Source: ','Nguồn: ')+(templateMap.get(selectedTemplate)?.source || 'Community')+' · '+selectedTemplate+' · v'+(field('industryId').dataset.templateVersion || 1) : text('Start from a template or enter your own offer.','Bắt đầu từ mẫu hoặc nhập ưu đãi của bạn.');
  }
  const internal = [
    ['receipt','Receipt coupon','Coupon trên hóa đơn'],['booking','Booking & AI Voice','Booking & AI Voice'],['sms','SMS · opted-in customers','SMS · khách đã đồng ý'],['email','Email · opted-in customers','Email · khách đã đồng ý'],['facebook','Facebook','Facebook'],['instagram','Instagram','Instagram'],['google','Google Business Profile','Google Business Profile'],['website','Website widget','Widget website'],['gift','Gift Card Center','Gift Card Center'],['customlink','Custom link / QR','Link / QR riêng'],['atm','Merchant ATM','Merchant ATM'],['cmap','CryptoMap360','CryptoMap360']
  ];
  const publicChannels = [['nearby','Discover Nearby','Discover Nearby'],['community','NEXORA Community','NEXORA Community'],['partners','Cross-industry partners · review','Đối tác khác ngành · xét duyệt']];
  const checkin = [['idle','Idle screen','Màn hình chờ'],['after','After phone verification','Sau xác minh số điện thoại'],['wait','Waiting screen','Màn hình đợi'],['done','Check-in complete','Hoàn tất check-in']];
  const booking = [['page','Booking page','Trang đặt lịch'],['slot','Available time slots','Khung giờ trống'],['addon','Service add-on','Thêm dịch vụ'],['ai','AI Voice suggestion','AI Voice gợi ý'],['confirm','Booking confirmation','Xác nhận đặt lịch'],['hold','Pending confirmation','Chờ xác nhận']];
  const external = [['meta','Meta Ads','Meta Ads'],['google','Google Ads','Google Ads'],['tiktok','TikTok Ads','TikTok Ads'],['yelp','Yelp Ads','Yelp Ads'],['agent','ChatGPT Sponsored Agent · early access','ChatGPT Sponsored Agent · early access'],['partner-network','Partner network boost','Quảng bá mạng lưới đối tác'],['agency','Agency-managed ads','Quảng cáo qua agency'],['other','Other vendor','Vendor khác']];
  const milestones = [['before','3 days before','Trước 3 ngày'],['start','Start day','Ngày bắt đầu'],['week','Every week','Mỗi tuần'],['soon','2 days before end','Trước kết thúc 2 ngày'],['end','End day','Ngày kết thúc']];
  const postable = internal.filter(item => ['sms','email','facebook','instagram','google','website'].includes(item[0]));
  const productGates = {atm:'atm',cmap:'cmap',agent:'agent'};
  const productAvailable = id => !productGates[id] || (salon.products || []).includes(productGates[id]);
  function checkboxes(host,name,items) { $(host).innerHTML = items.filter(item => productAvailable(item[0])).map(item => '<label class="pc-small-check"><input type="checkbox" name="'+name+'" value="'+esc(item[0])+'"><span>'+esc(text(item[1],item[2]))+'</span></label>').join(''); }
  checkboxes('creation-internal-channels','internalChannel',internal);
  checkboxes('creation-public-channels','publicChannel',publicChannels);
  checkboxes('creation-checkin-options','checkinPosition',checkin);
  checkboxes('creation-booking-options','bookingPosition',booking);
  checkboxes('creation-external-ads','externalAd',external);
  checkboxes('creation-post-channels','postChannel',postable);
  checkboxes('creation-post-milestones','postMilestone',milestones);
  const checked = name => Array.from(form.querySelectorAll('[name="'+name+'"]:checked'),input => input.value);
  function setChecked(name,values) { form.querySelectorAll('[name="'+name+'"]').forEach(input => { input.checked = (values || []).includes(input.value); }); }
  const recommendations = {
    'slow-hours':{internal:['booking','sms','google'],public:['nearby'],checkin:['idle','after'],booking:['page','slot','ai','hold']},
    returning:{internal:['receipt','sms','email','booking'],public:['community'],checkin:['after','done'],booking:['ai','confirm','hold']},
    'new-customers':{internal:['facebook','instagram','google'],public:['nearby','community'],checkin:['after'],booking:[]},
    'gift-card':{internal:['receipt','gift','email','sms'],public:[],checkin:['idle','done'],booking:[]}
  };
  function suggestChannels(goal) { const rec = recommendations[goal] || recommendations['slow-hours']; setChecked('internalChannel',rec.internal); setChecked('publicChannel',rec.public); setChecked('checkinPosition',rec.checkin); setChecked('bookingPosition',rec.booking); setChecked('postChannel',rec.internal.filter(id => postable.some(item => item[0] === id))); }
  const defaults = {industryId:defaultIndustry,useRequirement:'none',minimumSpend:null,maximumDiscount:null,code:'',dealFrequency:'visit',dealMonthlyCap:null,programCampaignId:'',postMode:'off',postTime:'09:00'};
  const original = {fill:studio.fill,read:studio.read,conditional:studio.conditional,validate:studio.validate,terms:studio.terms};
  studio.fill = function (target,offer) {
    populateServices(offer);
    original.fill(target,offer);
    Object.keys(defaults).forEach(name => { field(name).value = offer[name] ?? defaults[name]; });
    field('goal').value = offer.goal || 'slow-hours';
    for (const option of field('serviceGroupIds').options) option.selected = (offer.serviceGroupIds || []).includes(option.value);
    selectedTemplate = offer.templateId || null; baseline = offer.templateBaseline || null;
    $('new-program-campaign-fields').hidden = true; $('program-campaign-error').textContent = '';
    $('creation-share-feedback').textContent = '';
    field('industryId').dataset.templateVersion = offer.templateVersion || 1;
    pendingCampaigns = []; queueEdits = {...(offer.postQueueOverrides || Object.fromEntries((offer.postQueue || []).filter(item => item.source === 'manual' || item.status !== 'draft').map(item => [item.id,item])))};
    previewMode = 'banner';
    suggestChannels(offer.goal || 'slow-hours');
    if (offer.id) { setChecked('internalChannel',offer.internalChannels || []); setChecked('publicChannel',offer.publicChannels || []); }
    [['internalChannel','internalChannels'],['publicChannel','publicChannels'],['checkinPosition','checkinPositions'],['bookingPosition','bookingPositions'],['externalAd','externalAds'],['postChannel','postChannels'],['postMilestone','postMilestones']].forEach(([name,key]) => { if (Array.isArray(offer[key])) setChecked(name,offer[key]); });
    if (!offer.postMilestones) setChecked('postMilestone',['before','start','week','soon','end']);
    field('partnerConsent').checked = !!offer.partnerConsent;
    updateCampaigns(offer);
    field('industryId').dispatchEvent(new Event('change')); updateTemplatePicker(); conditional();
  };
  studio.conditional = function (target) { original.conditional(target); conditional(); updateTemplatePicker(); };
  function conditional() {
    const coupon = field('offerType').value === 'coupon';
    $('deal-settings').hidden = coupon; $('promotion-code-field').hidden = !coupon;
    $('studio-service-groups').hidden = field('serviceScope').value !== 'groups';
    $('partner-consent-field').hidden = field('partnerMode').value === 'off' && !checked('publicChannel').includes('partners');
    const ci = field('checkIn').checked;
    form.querySelectorAll('[name="checkinPosition"]').forEach(input => { input.disabled = !ci; });
    form.querySelectorAll('[name="bookingPosition"]').forEach(input => { input.disabled = !checked('internalChannel').includes('booking'); });
    const post = field('postMode').value !== 'off';
    $('posting-settings').hidden = !post; $('post-time-field').hidden = !post;
    $('creation-post-milestones').hidden = field('postMode').value !== 'milestones';
    form.querySelectorAll('[name="postChannel"]').forEach(input => { input.disabled = !checked('internalChannel').includes(input.value); });
    $('checkin-eligibility-warning').hidden = !ci || field('useRequirement').value !== 'online';
    $('checkin-eligibility-warning').textContent = text('Online booking is required. Walk-in customers can view the offer but do not qualify automatically.','Cần đặt lịch online. Khách walk-in có thể xem nhưng không tự động đủ điều kiện.');
    $('promotion-industry-context').textContent = text('Default from Salon Settings · ','Mặc định từ Salon Settings · ')+salon.name;
    const campaign = allCampaigns().find(item => item.id === field('programCampaignId').value);
    $('program-campaign-context').textContent = campaign ? campaign.name+' · '+dateLabel(campaign.startDate)+' → '+dateLabel(campaign.endDate) : text('Group promotions in a campaign. This is separate from Paid Boost.','Gộp các khuyến mãi vào một chiến dịch. Chiến dịch này tách riêng Paid Boost.');
  }
  studio.read = function (target,offer) {
    offer = original.read(target,offer);
    for (const name of Object.keys(defaults)) {
      const value = field(name).value.trim();
      offer[name] = ['minimumSpend','maximumDiscount','dealMonthlyCap'].includes(name) ? value === '' ? null : Number(value) : value;
    }
    offer.goal = field('goal').value;
    offer.serviceGroupIds = Array.from(field('serviceGroupIds').selectedOptions,option => option.value);
    offer.serviceGroupLabels = offer.serviceGroupIds.map(id => groupMap.get(id)?.name || id);
    offer.serviceLabels = Object.fromEntries((offer.serviceIds || []).map(id => [id,studio.services[id] || id]));
    offer.internalChannels = checked('internalChannel'); offer.publicChannels = checked('publicChannel');
    offer.searchListing = field('public').checked;
    // Keep channel selection when saving privately; Submit for approval requests network publication.
    const initialPublic = form.dataset.initialPublic || 'private';
    const selectedPublic = offer.searchListing || offer.publicChannels.length;
    offer.public = selectedPublic && (form.dataset.saveMode === 'approval' || initialPublic !== 'private') ? initialPublic !== 'private' ? initialPublic : 'pending' : 'private';
    offer.checkinPositions = field('checkIn').checked ? checked('checkinPosition') : [];
    offer.bookingPositions = offer.internalChannels.includes('booking') ? checked('bookingPosition') : [];
    offer.externalAds = checked('externalAd'); offer.partnerConsent = field('partnerConsent').checked;
    offer.partnerReviewStatus = field('partnerMode').value !== 'off' || offer.publicChannels.includes('partners') ? 'pending' : 'off';
    offer.postChannels = checked('postChannel').filter(id => offer.internalChannels.includes(id));
    offer.postMilestones = checked('postMilestone');
    const campaign = allCampaigns().find(item => item.id === offer.programCampaignId);
    offer.programCampaign = campaign ? {...campaign} : null;
    if (selectedTemplate) { offer.templateId = selectedTemplate; offer.templateVersion = Number(field('industryId').dataset.templateVersion) || 1; offer.templateBaseline = baseline; offer.editedFields = baseline ? templateFields.filter(key => JSON.stringify(offer[key] ?? null) !== JSON.stringify(baseline[key] ?? null)) : []; }
    offer.postQueueOverrides = {...queueEdits};
    offer.postQueue = buildQueue(offer);
    return offer;
  };
  studio.validate = function (offer) {
    const oldError = original.validate(offer); if (oldError) return oldError;
    if (!industry(offer.industryId)) return ['industryError','industryId'];
    if (!requirementCopy[offer.useRequirement]) return ['requirementError','useRequirement'];
    if (offer.serviceScope === 'groups' && (!(offer.serviceGroupIds || []).length || offer.serviceGroupIds.some(id => !groupMap.has(id)))) return ['groupError','serviceGroupIds'];
    if (offer.serviceScope === 'selected' && (offer.serviceIds || []).some(id => !serviceMap.has(id) && !legacyLabels[id])) return ['catalogServiceError','serviceIds'];
    for (const name of ['minimumSpend','maximumDiscount',...(offer.offerType === 'deal' ? ['dealMonthlyCap'] : [])]) if (offer[name] != null && (!Number.isFinite(offer[name]) || offer[name] <= 0 || Math.abs(offer[name]*100-Math.round(offer[name]*100)) > 0.000001)) return ['moneyConditionError',name];
    if (offer.offerType === 'deal' && !['visit','week','month'].includes(offer.dealFrequency)) return ['dealFrequencyError','dealFrequency'];
    if (offer.offerType === 'coupon' && offer.code && !/^[A-Za-z0-9_-]{1,40}$/.test(offer.code)) return ['codeError','code'];
    if ((offer.partnerMode !== 'off' || offer.publicChannels.includes('partners')) && !offer.partnerConsent) return ['partnerConsentError','partnerConsent'];
    if (offer.paidBoost && !offer.searchListing && !offer.publicChannels.length) return ['paidPublicError','public'];
    if (offer.postMode !== 'off') {
      if (!offer.postChannels.length || offer.postQueue.some(item => !offer.internalChannels.includes(item.channel))) return ['postChannelError','postChannel'];
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(offer.postTime)) return ['postTimeError','postTime'];
      if (['milestones','weekly'].includes(offer.postMode) && (!offer.startDate || !offer.endDate)) return ['postDateError','startDate'];
      if (offer.postMode === 'milestones' && !offer.postMilestones.length) return ['postMilestoneError','postMilestone'];
      if ((offer.postMode === 'weekly' || offer.postMilestones.includes('week')) && dayDistance(offer.startDate,offer.endDate) > 366) return ['postLimitError','endDate'];
      if (offer.postQueue.some(item => !/^\d{4}-\d{2}-\d{2}$/.test(item.date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || ''))) return ['postQueueDateError','postTime'];
    }
    return null;
  };
  studio.terms = function (offer,t) {
    const result = original.terms(offer,t);
    if (offer.serviceScope === 'groups') result.splice(1,0,text('Service groups: ','Nhóm dịch vụ: ')+(offer.serviceGroupLabels || offer.serviceGroupIds || []).join(', '));
    if (offer.useRequirement && offer.useRequirement !== 'none') result.push(text(...requirementCopy[offer.useRequirement]));
    if (offer.minimumSpend) result.push(text('Minimum eligible spend: ','Chi tiêu tối thiểu: ')+'$'+offer.minimumSpend.toFixed(2));
    if (offer.maximumDiscount) result.push(text('Maximum discount per use: ','Giảm tối đa mỗi lần: ')+'$'+offer.maximumDiscount.toFixed(2));
    if (offer.offerType !== 'coupon' && offer.dealFrequency) result.push(text(...{visit:studio.copy.oncePerVisit,week:studio.copy.oncePerWeek,month:studio.copy.oncePerMonth}[offer.dealFrequency]));
    if (offer.offerType !== 'coupon' && offer.dealMonthlyCap) result.push(text('Monthly discount cap: ','Hạn mức giảm trong tháng: ')+'$'+offer.dealMonthlyCap.toFixed(2));
    if (offer.offerType === 'coupon' && offer.code) result.push(text('Coupon code: ','Mã Coupon: ')+offer.code);
    return result;
  };
  function allCampaigns() {
    const stored = storedState().programCampaigns || [];
    return [...stored,...pendingCampaigns.filter(item => !stored.some(existing => existing.id === item.id))];
  }
  function updateCampaigns(offer = {}) {
    const selected = offer.programCampaignId || field('programCampaignId').value;
    if (offer.programCampaign?.id && !allCampaigns().some(item => item.id === offer.programCampaign.id)) pendingCampaigns.push(offer.programCampaign);
    field('programCampaignId').innerHTML = '<option value="">'+text('No campaign','Không chọn chiến dịch')+'</option>'+allCampaigns().map(item => '<option value="'+esc(item.id)+'">'+esc(item.name)+'</option>').join('');
    field('programCampaignId').value = selected || '';
    if (!offer.id && !selected) {
      const opening = allCampaigns().find(item => item.kind === 'opening' && item.startDate <= today() && item.endDate >= today());
      if (opening) field('programCampaignId').value = opening.id;
    }
  }
  $('new-program-campaign').addEventListener('click',() => { $('new-program-campaign-fields').hidden = !$('new-program-campaign-fields').hidden; if (!$('new-program-campaign-fields').hidden) $('program-campaign-name').focus(); });
  $('add-program-campaign').addEventListener('click',() => {
    const name = $('program-campaign-name').value.trim(), startDate = $('program-campaign-start').value, endDate = $('program-campaign-end').value;
    if (!name || !startDate || !endDate || endDate < startDate) { $('program-campaign-error').textContent = text('Enter a name and valid start / end dates.','Nhập tên và ngày bắt đầu / kết thúc hợp lệ.'); return; }
    const item = {id:'program-'+crypto.randomUUID(),name,kind:$('program-campaign-kind').value,startDate,endDate,createdAt:Date.now()};
    pendingCampaigns.push(item); updateCampaigns({programCampaignId:item.id}); $('new-program-campaign-fields').hidden = true; $('program-campaign-error').textContent = '';
    refresh();
  });
  function shift(date,amount) { if (!date) return ''; const value = new Date(date+'T12:00:00Z'); value.setUTCDate(value.getUTCDate()+amount); return value.toISOString().slice(0,10); }
  function dayDistance(start,end) { return start && end ? Math.round((new Date(end+'T12:00:00Z')-new Date(start+'T12:00:00Z'))/86400000) : 0; }
  function buildQueue(offer) {
    if (offer.postMode === 'off') return [];
    const start = offer.startDate || today(), end = offer.endDate;
    const dates = [];
    if (offer.postMode === 'enabled') dates.push(['start',start]);
    else if (offer.postMode === 'milestones') {
      if (offer.postMilestones.includes('before')) dates.push(['before',shift(start,-3)]);
      if (offer.postMilestones.includes('start')) dates.push(['start',start]);
      if (end && offer.postMilestones.includes('soon')) dates.push(['soon',shift(end,-2) < start ? start : shift(end,-2)]);
      if (end && offer.postMilestones.includes('end')) dates.push(['end',end]);
    }
    if (end && (offer.postMode === 'weekly' || offer.postMode === 'milestones' && offer.postMilestones.includes('week'))) for (let offset = offer.postMode === 'weekly' ? 0 : 7; offset <= Math.min(dayDistance(start,end),366); offset += 7) dates.push(['week-'+offset,shift(start,offset)]);
    return dates.flatMap(([milestone,date]) => offer.postChannels.map(channel => {
      const id = milestone+':'+channel;
      const override = queueEdits[id];
      const changes = override?.source === 'manual' ? override : override ? {status:override.status} : {};
      return {id,milestone,channel,date,time:offer.postTime,source:'program',status:'draft',caption:[offer.title,offer.description].filter(Boolean).join(' — '),...changes};
    })).filter(item => item.status !== 'removed').sort((a,b) => a.date.localeCompare(b.date) || a.channel.localeCompare(b.channel));
  }
  function renderQueue(offer) {
    const host = $('promotion-post-queue');
    const signature = JSON.stringify(offer.postQueue);
    if (host.dataset.signature === signature) return;
    host.dataset.signature = signature;
    host.innerHTML = '<p class="promo-note">'+esc(text('Draft queue · No post or message is sent from this prototype.','Hàng đợi nháp · Bản mẫu chưa gửi bài đăng hoặc tin nhắn.'))+'</p>'+offer.postQueue.map(item => '<div class="pc-queue-row'+(item.status === 'paused' ? ' pc-muted' : '')+'" data-post-row="'+esc(item.id)+'"><strong>'+esc(item.channel)+'</strong><span>'+esc(dateLabel(item.date))+' · '+esc(item.time)+'</span><small>'+esc(item.source === 'manual' ? text('Manual','Đã chỉnh tay') : item.milestone)+'</small><button type="button" class="promo-text-button" data-post-edit="'+esc(item.id)+'">'+text('Edit','Sửa')+'</button><button type="button" class="promo-text-button" data-post-pause="'+esc(item.id)+'">'+(item.status === 'paused' ? text('Resume','Tiếp tục') : text('Pause','Tạm dừng'))+'</button><button type="button" class="promo-text-button" data-post-remove="'+esc(item.id)+'">'+text('Remove','Bỏ')+'</button></div>').join('');
  }
  $('promotion-post-queue').addEventListener('click',event => {
    const button = event.target.closest('[data-post-edit],[data-post-pause],[data-post-save],[data-post-reset],[data-post-remove]'); if (!button) return;
    const offer = window.NEXORA_PROMOTION_EDITOR.read();
    const id = button.dataset.postEdit || button.dataset.postPause || button.dataset.postSave || button.dataset.postReset || button.dataset.postRemove;
    const item = offer.postQueue.find(entry => entry.id === id); if (!item) return;
    if (button.dataset.postEdit) { const row = button.closest('[data-post-row]'); row.innerHTML = '<strong>'+esc(item.channel)+'</strong><label>'+text('Date','Ngày')+'<input type="date" data-queue-date value="'+esc(item.date)+'"></label><label>'+text('Time','Giờ')+'<input type="time" data-queue-time value="'+esc(item.time)+'"></label><label>'+text('Channel','Kênh')+'<select data-queue-channel>'+offer.postChannels.map(channel => '<option value="'+esc(channel)+'"'+(channel === item.channel ? ' selected' : '')+'>'+esc(channel)+'</option>').join('')+'</select></label><label class="pc-queue-caption">'+text('Caption','Nội dung')+'<textarea data-queue-caption rows="2">'+esc(item.caption)+'</textarea></label><button type="button" class="promo-text-button" data-post-save="'+esc(id)+'">'+text('Save','Lưu')+'</button><button type="button" class="promo-text-button" data-post-reset="'+esc(id)+'">'+text('Follow program','Theo chương trình')+'</button>'; return; }
    if (button.dataset.postSave) { const row = button.closest('[data-post-row]'); const date = row.querySelector('[data-queue-date]').value, time = row.querySelector('[data-queue-time]').value; if (!date || !time) return; queueEdits[id] = {...item,date,time,channel:row.querySelector('[data-queue-channel]').value,caption:row.querySelector('[data-queue-caption]').value.trim(),source:'manual'}; }
    else if (button.dataset.postReset) delete queueEdits[id];
    else if (button.dataset.postRemove) queueEdits[id] = {...item,status:'removed'};
    else queueEdits[id] = {...item,status:item.status === 'paused' ? 'draft' : 'paused'};
    $('promotion-post-queue').dataset.signature = ''; refresh();
  });
  function refresh() { conditional(); window.NEXORA_PROMOTION_EDITOR?.refresh(); }
  form.addEventListener('change',event => {
    if (event.target.name === 'goal') suggestChannels(field('goal').value);
    if (['industryId','goal','offerType'].includes(event.target.name)) updateTemplatePicker();
    conditional();
  });
  $('editor-template').addEventListener('change',() => { $('editor-template-preview').disabled = !$('editor-template').value; $('editor-template-apply').disabled = !$('editor-template').value; });
  $('editor-template-apply').addEventListener('click',() => applyTemplate($('editor-template').value));
  $('editor-template-preview').addEventListener('click',() => previewTemplate($('editor-template').value));
  function applyTemplate(id) {
    const item = templateMap.get(id); if (!item) return;
    const value = preset(item);
    window.NEXORA_PROMOTION_EDITOR.applyTemplate(value);
    selectedTemplate = item.id; baseline = value.templateBaseline; field('industryId').dataset.templateVersion = item.version;
    suggestChannels(value.goal); updateTemplatePicker(); refresh();
  }
  const templateDialog = document.createElement('dialog');
  templateDialog.className = 'promo-dialog pc-template-dialog';
  templateDialog.setAttribute('aria-label','Promotion template preview');
  document.body.append(templateDialog);
  function previewTemplate(id) {
    const item = templateMap.get(id); if (!item) return;
    const offer = preset(item);
    const terms = studio.terms(offer,window.NEXORA_PROMOTION_EDITOR.translate);
    templateDialog.innerHTML = '<header class="editor-header"><h2>'+esc(offer.title)+'</h2><button type="button" class="promo-close" data-template-close aria-label="Close">×</button></header><div class="pc-template-preview"><span class="promo-chip">'+esc(offer.offerType)+' · '+esc(text(...goalCopy[offer.goal]))+'</span><p>'+esc(offer.description)+'</p><strong>'+esc(discountLabel(offer))+'</strong><p>'+esc(offer.days.join(' · ')+' · '+offer.startTime+'–'+offer.endTime)+'</p>'+terms.map(term => '<p>'+esc(term)+'</p>').join('')+'<p class="promo-note">'+esc(item.source+' · '+item.id+' · v'+item.version)+'</p><button type="button" class="promo-button primary" data-preview-use="'+esc(id)+'">'+text('Use template','Dùng mẫu')+'</button></div>';
    templateDialog.showModal();
  }
  templateDialog.addEventListener('click',event => { if (event.target.closest('[data-template-close]')) templateDialog.close(); const button = event.target.closest('[data-preview-use]'); if (button) { templateDialog.close(); if (!$('promotion-editor').open) $('create-promotion').click(); applyTemplate(button.dataset.previewUse); } });
  function discountLabel(offer) { return offer.type === 'free' ? text('Free','Miễn phí') : offer.type === 'custom' ? String(offer.value) : offer.value === '' ? text('Set discount value','Nhập mức giảm') : offer.type === 'fixed' ? '$'+offer.value+' OFF' : offer.value+'% OFF'; }
  function mountLibrary(legacy,categoriesCopy,legacyCategories) {
    for (const item of legacy) {
      const inds = {'lunch-combo':['food'],'coffee-hour':['drink'],'retail-bundle':['market'],'oil-return':['mechanic'],'fitness-trial':['fitness'],'wellness-first':['medspa'],'event-night':['bar']}[item.id] || ['nail'];
      const normalized = {...item,industryIds:inds.filter(id => industry(id)),offerType:['rebook-save','wellness-first'].includes(item.id) ? 'coupon' : 'deal',serviceGroups:[],goal:goalFromTitle(item.id+' '+item.title),source:'Promotion Studio',version:1,startTime:item.start || '00:00',endTime:item.end || '23:59',days:item.days || days(),useRequirement:'none',customerGroup:item.id === 'wellness-first' ? 'new' : item.id === 'rebook-save' ? 'returning' : 'all'};
      templateMap.set(item.id,normalized);
    }
    let category = 'all', page = 0;
    const host = $('promotion-templates'), filterHost = $('template-category-filters');
    const groupCategory = {beauty:'beauty',food:'restaurant',shop:'shopping',home:'home',travel:'destination',event:'entertainment',health:'wellness',auto:'lifestyle',edu:'lifestyle',biz:'lifestyle',family:'lifestyle',community:'lifestyle'};
    function render() {
      const industryId = $('template-industry').value, kind = $('template-kind').value, goal = $('template-goal').value, service = $('template-service-group').value, query = $('template-search').value.trim().toLowerCase();
      const matching = [...templateMap.values()].filter(item => (industryId === 'all' || !item.industryIds.length || item.industryIds.includes(industryId)) && (kind === 'all' || item.offerType === kind) && (goal === 'all' || item.goal === goal) && (service === 'all' || item.serviceGroups.includes(Number(service))) && (category === 'all' || legacyCategories[item.id]?.includes(category) || item.industryIds.some(id => (groupCategory[industry(id)?.group] || 'lifestyle') === category) || category === 'gift-card' && item.goal === 'gift-card') && (!query || [item.title,item.titleVi,item.description,item.descriptionVi,item.badge,item.source,...item.serviceGroups.map(index => data.serviceGroups[index])].join(' ').toLowerCase().includes(query)));
      const pages = Math.max(1,Math.ceil(matching.length/24)); page = Math.min(page,pages-1);
      const visible = matching.slice(page*24,page*24+24);
      const signature = [vi(),page,...visible.map(item => item.id)].join('|');
      if (host.dataset.librarySignature === signature && host.querySelectorAll('[data-create-template]').length === visible.length) return;
      host.dataset.librarySignature = signature;
      filterHost.innerHTML = categoriesCopy.map(item => '<button type="button" class="phase-template-filter'+(category === item.id ? ' active' : '')+'" data-template-category="'+esc(item.id)+'" aria-pressed="'+(category === item.id)+'">'+(item.icon ? window.NEXORA_PROMOTION_ICONS.image(item.icon) : '')+'<span>'+esc(item.label)+'</span></button>').join('');
      host.innerHTML = visible.length ? visible.map(item => '<article class="promo-template phase-template-card"><div class="phase-template-visual phase-template-'+esc(item.theme)+'"><div class="phase-template-visual-copy"><strong>'+esc(vi() && item.titleVi ? item.titleVi : item.visualTitle || item.title)+'</strong><span>'+esc(discountLabel(item))+'</span></div><span class="phase-template-symbol" aria-hidden="true">'+window.NEXORA_PROMOTION_ICONS.image(item.icon || industry(item.industryIds[0])?.icon)+'</span></div><div class="phase-template-body"><div class="phase-template-top"><strong>'+esc(item.bodyTitle || text(...goalCopy[item.goal]))+'</strong><span class="phase-template-category">'+esc(item.offerType === 'coupon' ? 'Coupon' : 'Deal')+'</span></div><p>'+esc(vi() && item.descriptionVi ? item.descriptionVi : item.detail || item.description)+'</p><div class="pc-template-actions"><button type="button" class="promo-button" data-preview-template="'+esc(item.id)+'">'+text('Preview','Xem trước')+'</button><button type="button" class="promo-button primary" data-create-template="'+esc(item.id)+'">'+text('Use template','Dùng mẫu')+'</button></div></div></article>').join('') : '<p class="promo-note">'+text('No matching templates. Change the filters or create your own promotion.','Chưa có mẫu phù hợp. Đổi bộ lọc hoặc tự tạo khuyến mãi.')+'</p>';
      $('template-results').textContent = text('Matching templates: ','Mẫu phù hợp: ')+matching.length+' / '+templateMap.size;
      $('template-page').textContent = (page+1)+' / '+pages; $('template-previous').disabled = page === 0; $('template-next').disabled = page >= pages-1;
    }
    ['template-industry','template-kind','template-goal','template-service-group','template-search'].forEach(id => $(id).addEventListener(id === 'template-search' ? 'input' : 'change',() => { page = 0; host.dataset.librarySignature = ''; render(); }));
    filterHost.addEventListener('click',event => { const button = event.target.closest('[data-template-category]'); if (!button) return; category = button.dataset.templateCategory; page = 0; if (category !== 'all') { $('template-industry').value = 'all'; $('template-industry').dispatchEvent(new Event('change')); } host.dataset.librarySignature = ''; render(); });
    $('template-previous').addEventListener('click',() => { page--; render(); }); $('template-next').addEventListener('click',() => { page++; render(); });
    host.addEventListener('click',event => { const use = event.target.closest('[data-create-template]'), preview = event.target.closest('[data-preview-template]'); if (preview) previewTemplate(preview.dataset.previewTemplate); if (use) { $('create-promotion').click(); applyTemplate(use.dataset.createTemplate); } });
    new MutationObserver(render).observe(host,{childList:true});
    function localizeControls() {
      for (const id of ['promotion-industry','template-industry']) {
        const select = $(id);
        for (const option of select.options) option.textContent = option.value === 'all' ? text('All industries','Tất cả ngành') : label(industry(option.value));
        for (const group of select.querySelectorAll('optgroup')) group.label = label(data.groups.find(item => item.id === industry(group.children[0]?.value)?.group));
        select.dispatchEvent(new Event('change'));
      }
      for (const [name,items] of [['internalChannel',internal],['publicChannel',publicChannels],['checkinPosition',checkin],['bookingPosition',booking],['externalAd',external],['postChannel',postable],['postMilestone',milestones]]) {
        form.querySelectorAll('[name="'+name+'"]').forEach(input => { const item = items.find(entry => entry[0] === input.value); input.nextElementSibling.textContent = text(item[1],item[2]); });
      }
    }
    $('promotion-language')?.addEventListener('change',() => { localizeControls(); shareId = ''; host.dataset.librarySignature = ''; render(); updateTemplatePicker(); refresh(); });
    localizeControls();
    render(); updateTemplatePicker();
  }
  $('promotion-editor').querySelector('.pc-preview-tabs').addEventListener('click',event => { const button = event.target.closest('[data-create-preview]'); if (!button) return; previewMode = button.dataset.createPreview; refresh(); });
  function preview(offer,art,t) {
    document.querySelectorAll('[data-create-preview]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.createPreview === previewMode)));
    const terms = studio.terms(offer,t).map(term => '<li>'+esc(term)+'</li>').join('');
    if (previewMode === 'banner') return art;
    const heading = {oneqr:'OneQR · '+salon.name,app:'NEXORA · Nearby',checkin:text('Check-in · Welcome','Check-in · Chào mừng'),pos:'POS · Checkout',booking:text('Book an appointment','Đặt lịch')}[previewMode];
    const action = offer.offerType === 'coupon' ? text('Claim Coupon','Nhận Coupon') : text('View Deal','Xem Deal');
    const enabled = previewMode === 'checkin' ? field('checkIn').checked : previewMode === 'pos' ? offer.checkout : previewMode === 'booking' ? offer.internalChannels.includes('booking') : previewMode === 'oneqr' ? offer.hero : offer.searchListing || offer.publicChannels.length > 0;
    return '<div class="pc-channel-preview"><header>'+esc(heading)+'</header>'+art+'<div><strong>'+esc(offer.title || text('Promotion name','Tên khuyến mãi'))+'</strong><ul>'+terms+'</ul><span class="pc-preview-cta">'+esc(previewMode === 'booking' ? text('Choose a time','Chọn giờ') : previewMode === 'pos' ? text('Apply eligible offer','Áp dụng nếu đủ điều kiện') : action)+'</span><small>'+esc(enabled ? text('Placement preview · not published','Xem trước vị trí · chưa xuất bản') : text('This placement is currently off','Vị trí này đang tắt'))+'</small></div></div>';
  }
  function preflight(offer,t) {
    const valid = studio.validate(offer);
    const validDiscount = offer.type === 'free' || offer.type === 'custom' && !!offer.value || ['percent','fixed'].includes(offer.type) && Number(offer.value) > 0 && (offer.type !== 'percent' || Number(offer.value) <= 100);
    const checks = [[!!offer.title.trim() && validDiscount,text('Name & discount','Tên & mức giảm')],[!!offer.days.length && offer.endTime > offer.startTime,text('Days & times','Ngày & giờ')],[offer.offerType !== 'coupon' || !!offer.startDate && !!offer.endDate && offer.totalSlots > 0 && offer.perPersonLimit > 0,text('Coupon quantity & dates','Số lượng & ngày Coupon')],[!valid,valid ? t(valid[0]) : text('Eligibility & conditions','Đối tượng & điều kiện')]];
    $('creation-preflight').innerHTML = '<ul>'+checks.map(([ok,message]) => '<li class="'+(ok ? 'pc-pass' : 'pc-attention')+'">'+(ok ? '✓ ' : '○ ')+esc(message)+'</li>').join('')+'</ul><p class="promo-note">'+esc(offer.searchListing || offer.publicChannels.length ? text('Public placements require review.','Kênh Public cần xét duyệt.') : text('Internal channels only.','Chỉ các kênh nội bộ.'))+'</p>';
    renderQueue(offer); renderShare(offer);
  }
  let shareId = '';
  function renderShare(offer) {
    if (shareId === (offer.id || 'new') && $('creation-share-body').childElementCount) return;
    shareId = offer.id || 'new';
    if (!offer.id) { $('creation-share-body').innerHTML = '<p class="promo-note">'+text('Save the promotion to create its customer link and QR.','Lưu khuyến mãi để tạo link và QR cho khách.')+'</p>'; return; }
    const url = new URL('promotion-details.html',location.href); url.searchParams.set('id',offer.id);
    $('creation-share-body').innerHTML = '<label class="promo-field"><span>'+text('Source channel','Kênh nguồn')+'</span><select id="pc-share-channel"><option value="oneqr">OneQR</option><option value="receipt">Receipt</option><option value="sms">SMS</option><option value="email">Email</option><option value="facebook">Facebook</option></select></label><label class="promo-field"><span>'+text('Customer link','Link khách hàng')+'</span><input id="pc-share-link" readonly></label><button type="button" class="promo-button" id="pc-copy-link">'+text('Copy link','Sao chép link')+'</button><a class="promo-button" id="pc-open-link" target="_blank" rel="noopener">'+text('Open preview','Mở xem trước')+'</a><div id="pc-share-qr"></div><p class="promo-note">'+text('Demo link reads saved data in this browser. Publishing and customer distribution are not connected.','Link demo đọc dữ liệu đã lưu trong trình duyệt này. Chưa kết nối xuất bản và phân phối cho khách.')+'</p>';
    function sync() { url.searchParams.set('channel',$('pc-share-channel').value); $('pc-share-link').value = url.href; $('pc-open-link').href = url.href; $('pc-share-qr').replaceChildren(); if (window.QRCode) new window.QRCode($('pc-share-qr'),{text:url.href,width:132,height:132}); else $('pc-share-qr').textContent = text('QR unavailable. Use the customer link.','Chưa tạo được QR. Dùng link khách hàng.'); }
    $('pc-share-channel').addEventListener('change',sync);
    $('pc-copy-link').addEventListener('click',async () => { try { await navigator.clipboard.writeText($('pc-share-link').value); $('creation-share-feedback').textContent = text('Link copied.','Đã sao chép link.'); } catch (_) { $('pc-share-link').select(); $('creation-share-feedback').textContent = text('Select and copy the link.','Chọn và sao chép link.'); } }); sync();
  }
  function aiContext() {
    const offer = window.NEXORA_PROMOTION_EDITOR.read();
    return [text('Industry: ','Ngành: ')+label(industry(offer.industryId)),text('Goal: ','Mục tiêu: ')+text(...goalCopy[offer.goal]),offer.offerType,offer.title,offer.description,...studio.terms(offer,window.NEXORA_PROMOTION_EDITOR.translate)].filter(Boolean).join('. ');
  }
  window.NEXORA_PROMOTION_CREATE = {mountLibrary,preset,preview,preflight,aiContext,applyTemplate,categories,campaignCategory:id => industry(id)?.group || 'beauty',patchState(next) { const existing = next.programCampaigns || []; next.programCampaigns = [...existing,...pendingCampaigns.filter(item => !existing.some(record => record.id === item.id))]; return next; }};
})();
