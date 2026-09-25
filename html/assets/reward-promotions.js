(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const form = $('#promotion-form');
  if (!form) return;
  const editor = $('#promotion-editor'), posterDialog = $('#promotion-poster-dialog'), placementDialog = $('#placement-preview-dialog');
  const key = 'nexora:reward-promotions:v1', languageKey = 'nexora:reward-promotions:language';
  const demoSeedVersion = 1;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const bannerThemes = {purple:'themePurple',gold:'themeGold',rose:'themeRose',ocean:'themeOcean',teal:'themeTeal',sage:'themeSage',peach:'themePeach',slate:'themeSlate'};
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const uid = () => 'promotion-' + (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const field = name => form.elements.namedItem(name);
  const icons = {
    plus:'M12 5v14M5 12h14', x:'m6 6 12 12M6 18 18 6', search:'M21 21l-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    layers:'m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5', 'check-circle':'m8 12 3 3 5-6M22 12a10 10 0 1 1-4-8',
    image:'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm-1 14 5-5 4 4 3-3 6 6M8 8h.01',
    sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    sparkles:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM3 2v4M1 4h4',
    calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM8 15l3 3 5-5',
    gift:'M3 8h18v4H3V8Zm2 4v9h14v-9M12 8v13m0-13H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z',
    utensils:'M4 3v7a3 3 0 0 0 6 0V3M7 3v18M20 3c-4 2-5 7-5 10h5m0-10v18',
    'user-plus':'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm7 1v6m-3-3h6',
    'shopping-bag':'M3 7h18l-1 14H4L3 7Zm5 0V6a4 4 0 0 1 8 0v1M8 11h.01M16 11h.01',
    scan:'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M7 12h10',
    globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a18 18 0 0 0 0 18 18 18 0 0 0 0-18Z',
    upload:'M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5',
    'external-link':'M15 3h6v6m0-6L10 14M9 3H3v18h18v-6',
    'arrow-left':'M19 12H5m6-6-6 6 6 6', 'arrow-right':'M5 12h14m-6-6 6 6-6 6', 'arrow-up':'M12 19V5m-6 6 6-6 6 6', 'arrow-down':'M12 5v14m-6-6 6 6 6-6',
    printer:'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6v-7Zm11-2h.01',
    edit:'m16 3 5 5-12 12-6 1 1-6L16 3Zm-3 3 5 5', copy:'M9 9h12v12H9V9ZM5 15H3V3h12v2',
    eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    pause:'M8 5v14M16 5v14', play:'m7 4 14 8-14 8V4Z', more:'M5 12h.01M12 12h.01M19 12h.01',
    'settings-2':'M20 7h-9M14 17H5M17 4v6M8 14v6M4 7h3M18 17h2',
    gauge:'M12 14l4-4M3.34 19a10 10 0 1 1 17.32 0',
    history:'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
    lightbulb:'M9 18h6M10 22h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.6-1.5 2.5h-4c0-.9-.6-1.8-1.5-2.5Z',
    check:'m5 12 4 4L19 6',
    'loader-2':'M21 12a9 9 0 1 1-6.2-8.6',
    'alert-circle':'M12 8v5m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'
  };
  const icon = name => '<svg class="promo-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (icons[name] || icons.image) + '"/></svg>';
  const copy = {
    subtitle:['Create and manage promotions.','Tạo và quản lý chương trình.'], language:['Language','Ngôn ngữ'], addPromotion:['Add promotion','Tạo chương trình'],
    templateTitle:['Promotion templates','Mẫu chương trình'],
    templateDescription:['Choose a template to prefill the promotion.','Chọn mẫu để điền sẵn thông tin chương trình.'],
    managePromotions:['Manage promotions','Quản lý chương trình'], promotions:['Promotions','Chương trình'], enabled:['Enabled','Đang bật'], disabled:['Disabled','Đang tắt'], bannersCreated:['Banners created','Banner đã tạo'],
    search:['Search promotion name or badge…','Tìm tên chương trình hoặc badge...'], allStatuses:['All statuses','Tất cả trạng thái'], clearFilters:['Clear filters','Xóa bộ lọc'],
    loadError:['Could not load promotions','Không tải được chương trình'], loadErrorHint:['Your saved data has been kept. Try loading it again.','Dữ liệu đã lưu vẫn được giữ nguyên. Vui lòng thử tải lại.'], retry:['Try again','Thử lại'],
    demoNote:['Interactive prototype · Sample data · Changes are saved in this browser.','Bản mẫu tương tác · Dữ liệu minh họa · Thay đổi được lưu trong trình duyệt này.'],
    closeEditor:['Close promotion editor','Đóng form chương trình'], helpTitle:['Review these 7 parts before using your offer','Kiểm tra 7 phần trước khi dùng'],
    helpSteps:['⓪ Goal → ① Details → ② Discount → ③ Placements → ④ Banners → ⑤ Share & ads → ⑥ Tracking','⓪ Mục tiêu → ① Thông tin → ② Ưu đãi → ③ Nơi hiển thị → ④ Banner → ⑤ Chia sẻ & quảng cáo → ⑥ Theo dõi'],
    helpNote:['Preview as you edit. Save, then enable the promotion from your list when you are ready.','Xem preview bên cạnh khi sửa. Lưu, sau đó chủ động bật chương trình tại danh sách.'],
    detailsSection:['01 / Promotion details','01 / Thông tin chương trình'], name:['Promotion name','Tên chương trình'], badge:['Badge · optional','Badge · tùy chọn'],
    detailsHint:['Example: 15% off Classic Pedicure, Tue–Thu 10 AM–2 PM; cannot be combined. Clearly state who qualifies, eligible services and exclusions.','Ví dụ: Giảm 15% Classic Pedicure, thứ Ba–thứ Năm 10–14h; không cộng dồn. Luôn ghi rõ ai được dùng, dịch vụ nào và điều kiện loại trừ.'],
    description:['Description · optional','Mô tả · tùy chọn'], scheduleSection:['02 / Discount & schedule','02 / Ưu đãi & lịch chạy'], discountType:['Discount type','Loại giảm giá'],
    percent:['Percent · %','Percent · %'], amount:['Amount · $','Amount · $'], discountValue:['Discount value','Mức giảm'], legacyFree:['Free service or add-on','Dịch vụ hoặc add-on miễn phí'], legacyCustom:['Custom offer','Ưu đãi tùy chỉnh'],
    days:['Days it runs','Thứ áp dụng'], startsAt:['Starts at','Giờ bắt đầu'], endsAt:['Ends at','Giờ kết thúc'],
    timeHint:['Shop local time · America/Chicago. Start and end times must be on the same day.','Giờ địa phương của tiệm · America/Chicago. Khung giờ bắt đầu và kết thúc trong cùng ngày.'],
    placementsSection:['03 / Placements','03 / Nơi hiển thị'], checkout:['Offer this at checkout','Áp dụng tại quầy POS'], checkoutHint:['Available in the POS checkout.','Giữ chức năng POS hiện có.'],
    heroHint:['Show this promotion’s banners.','Hiển thị các banner của chương trình.'], public:['Submit to Search Deals','Gửi public lên Search Deals'], publicHint:['Public listing requires a separate review.','Chờ duyệt trước khi hiển thị công khai.'],
    publicNote:['A public request does not turn on paid advertising or referral rewards.','Public không tự bật quảng cáo trả phí hoặc thưởng giới thiệu.'], bannersSection:['04 / Banners & posters','04 / Banner & poster'],
    bannerHint:['Reorder banners to choose the cover image. Every banner opens the same promotion.','Mỗi chương trình có nhiều banner. Đổi thứ tự để chọn hình đầu; tất cả cùng mở đúng chương trình.'],
    chooseTheme:['Choose template','Chọn template'], themePurple:['Signature · Purple','Signature · Tím'], themeGold:['Luxury · Gold','Luxury · Vàng'], themeRose:['Soft · Rose','Soft · Hồng'],
    themeOcean:['Ocean · Blue','Ocean · Xanh dương'], themeTeal:['Fresh · Teal','Fresh · Xanh ngọc'], themeSage:['Nature · Sage','Nature · Xanh lá'], themePeach:['Sunset · Peach','Sunset · Cam đào'], themeSlate:['Minimal · Slate','Minimal · Xám'],
    addBanner:['Add banner','Thêm banner'], upload:['Upload your design','Upload mẫu riêng'], chooseFile:['Choose an image','Chọn ảnh'], uploadHint:['PNG / JPG / WebP · up to 8 MB · up to 8 banners','PNG / JPG / WebP · tối đa 8 MB · tối đa 8 banner'],
    previewPrint:['Preview & print poster','Xem trước & in poster'], saveNote:['New promotions are saved disabled.','Chương trình mới được lưu ở trạng thái tắt.'], editNote:['Changes take effect after saving.','Thay đổi có hiệu lực sau khi lưu.'],
    cancel:['Cancel','Hủy'], save:['Save promotion','Lưu chương trình'], preview:['Preview','Xem trước'], promotionPoster:['Promotion poster','Poster chương trình'], closePreview:['Close preview','Đóng xem trước'],
    previousBanner:['Previous banner','Banner trước'], nextBanner:['Next banner','Banner tiếp theo'], printHint:['Print or save as PDF.','In hoặc lưu PDF.'], print:['Print poster','In poster'],
    useTemplate:['Use this template','Dùng mẫu này'], edit:['Edit','Chỉnh sửa'], share:['Share','Chia sẻ'], enable:['Enable promotion','Bật chương trình'], disable:['Disable','Tạm tắt'], duplicate:['Duplicate','Nhân bản'], delete:['Delete promotion','Xóa chương trình'],
    createTitle:['Create promotion','Tạo chương trình'], editTitle:['Edit promotion','Chỉnh sửa chương trình'], pending:['Public · Pending review','Public · Chờ duyệt'], banner:['banner','banner'],
    emptyTitle:['No promotions yet','Chưa có chương trình'], emptyHint:['Choose a template or add your first promotion.','Chọn mẫu hoặc tạo chương trình đầu tiên.'], noMatches:['No promotions found','Không tìm thấy chương trình'], noMatchesHint:['Try another search or choose a different status.','Thử tên khác hoặc chọn trạng thái khác.'],
    moveUp:['Move banner up','Chuyển banner lên'], moveDown:['Move banner down','Chuyển banner xuống'], removeBanner:['Remove banner','Xóa banner'], cover:['Cover','Ảnh đầu'], uploaded:['Uploaded image','Ảnh upload'], missingImage:['Image unavailable. Upload it again.','Ảnh không còn khả dụng. Vui lòng upload lại.'],
    saved:['Promotion saved disabled. Enable it from your list when ready.','Đã lưu chương trình ở trạng thái tắt. Bật tại danh sách khi sẵn sàng.'], updated:['Promotion updated.','Đã cập nhật chương trình.'], duplicated:['Copy created disabled and private.','Đã tạo bản sao ở trạng thái tắt và chưa public.'],
    enabledMessage:['Promotion enabled.','Đã bật chương trình.'], disabledMessage:['Promotion disabled.','Đã tắt chương trình.'], deleted:['Promotion deleted.','Đã xóa chương trình.'], copySuffix:['Copy','Bản sao'],
    saveError:['Could not save. Browser storage is unavailable or full. Your changes are still here.','Không lưu được. Bộ nhớ trình duyệt không khả dụng hoặc đã đầy. Nội dung đang sửa vẫn được giữ nguyên.'],
    nameError:['Enter a promotion name.','Nhập tên chương trình.'], lengthError:['Keep the name within 100, badge within 50 and description within 1,000 characters.','Tên tối đa 100, badge 50 và mô tả 1.000 ký tự.'],
    valueError:['Enter a discount greater than zero. Percentage discounts cannot exceed 100%.','Mức giảm phải lớn hơn 0; phần trăm không vượt 100.'], customError:['Enter an offer headline.','Nhập nội dung ưu đãi.'],
    daysError:['Choose at least one day.','Chọn ít nhất một ngày chạy.'], timeError:['End time must be later than start time on the same day.','Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.'],
    bannerError:['Keep between 1 and 8 banners.','Giữ từ 1 đến 8 banner.'], staleError:['This promotion changed in another tab. Close and reopen it to see the latest version.','Chương trình đã thay đổi ở tab khác. Đóng và mở lại để xem bản mới nhất.'],
    busy:['Processing image…','Đang xử lý ảnh…'], busyError:['Wait for the image to finish processing before saving.','Chờ ảnh xử lý xong trước khi lưu.'], imageAdded:['Image added to your draft.','Đã thêm ảnh vào bản đang sửa.'],
    imageType:['Choose a PNG, JPG or WebP image.','Chọn ảnh PNG, JPG hoặc WebP.'], imageSize:['Choose an image no larger than 8 MB.','Chọn ảnh không quá 8 MB.'], imageDecode:['Could not read this image. Choose another file.','Không đọc được ảnh. Vui lòng chọn file khác.'],
    imageStorage:['Could not store this image. Free browser storage and try again.','Không lưu được ảnh. Giải phóng bộ nhớ trình duyệt rồi thử lại.'], confirmDelete:['Delete this promotion?','Xóa chương trình này?'], cannotDelete:['This promotion has been used. Disable it to keep its history.','Chương trình đã được sử dụng. Hãy tắt để giữ lịch sử.'],
    invalidPreview:['Enter a valid discount','Nhập mức giảm hợp lệ'], more:['More actions','Thao tác khác'], legacyDates:['Saved date range','Khoảng ngày đã lưu'], useCode:['Use code','Dùng mã'], eligibleServices:['Eligible services','Dịch vụ áp dụng'], eligibleCustomers:['Eligible customers','Khách được áp dụng']
  };
  const studio = window.NEXORA_STUDIO;
  Object.assign(copy, studio.copy);
  let language = 'en';
  try { language = localStorage.getItem(languageKey) === 'vi' ? 'vi' : 'en'; } catch (_) {}
  const t = name => (copy[name] || [name, name])[language === 'vi' ? 1 : 0];
  const themeLabel = theme => Object.hasOwn(bannerThemes,theme) ? t(bannerThemes[theme]) : theme;
  const templates = [
    {id:'upgrade', symbol:'✨', value:20, type:'percent', purpose:['Sell more services','Bán thêm dịch vụ'], offer:['20% off add-ons','Giảm 20% phần add-on'], hint:['Choose the add-ons and discount.','Sửa dịch vụ bổ sung và mức giảm.'], title:['Add-On Upgrade · Sample','Add-On Upgrade · Mẫu hướng dẫn'], badge:['UPGRADE','UPGRADE'], description:['20% off nail art or a foot massage with a main service. Applies to the add-on only, not the whole ticket. Confirm eligible services before use.','Giảm 20% giá phần nail art hoặc massage chân khi mua cùng dịch vụ chính. Không giảm giá toàn bộ hóa đơn; xác định dịch vụ áp dụng trước khi dùng.']},
    {id:'weekday', symbol:'☀︎', value:15, type:'percent', days:['Tue','Wed','Thu'], startTime:'10:00', endTime:'14:00', purpose:['Fill quiet hours','Lấp giờ vắng'], offer:['15% off · Tue–Thu','Giảm 15% · Thứ 3–5'], hint:['Adjust days, hours and services.','Sửa ngày, khung giờ và dịch vụ.'], title:['Weekday Glow · Sample','Weekday Glow · Mẫu hướng dẫn'], badge:['HAPPY HOURS','GIỜ VÀNG'], description:['15% off Classic Pedicure, Tuesday–Thursday, 10 AM–2 PM. Excludes tips and tax; cannot be combined with other offers. Review these sample terms before use.','Giảm 15% cho Classic Pedicure từ thứ Ba đến thứ Năm, 10:00–14:00. Không áp dụng tip, thuế hoặc cộng dồn ưu đãi. Điều kiện mẫu cần kiểm tra lại trước khi dùng.']},
    {id:'rebook', symbol:'📅', value:5, type:'fixed', purpose:['Bring customers back','Khách quay lại'], offer:['$5 off the next visit','Giảm $5 lần ghé sau'], hint:['Set the rebooking conditions.','Sửa điều kiện đặt lại lịch.'], title:['Rebook & Save · Sample','Rebook & Save · Mẫu hướng dẫn'], badge:['REBOOK','ĐẶT LẠI LỊCH'], description:['Save $5 on the next visit when the customer books before leaving. Confirm a qualifying appointment before applying this offer.','Giảm $5 cho lần ghé kế tiếp nếu đặt lịch trước khi rời tiệm. Xác minh lịch hẹn đủ điều kiện trước khi áp dụng.']},
    {id:'welcome', symbol:'🎉', value:10, type:'percent', purpose:['Welcome new guests','Đón khách mới'], offer:['10% off the first visit','Giảm 10% lần đầu'], hint:['Choose services and first-visit terms.','Sửa dịch vụ và điều kiện khách mới.'], title:['New Guest Offer · Sample','Chào khách mới · Mẫu'], badge:['FIRST VISIT','LẦN ĐẦU'], description:['10% off Classic Pedicure on the first visit. Cannot be combined; excludes tax and tips. Verify first-visit eligibility and adjust services and terms before use.','Giảm 10% cho Classic Pedicure ở lần sử dụng đầu tiên. Không cộng dồn; không gồm thuế và tip. Xác minh khách mới. Sửa dịch vụ và điều kiện trước khi dùng.']},
    {id:'food', symbol:'🍝', value:3, type:'fixed', days:['Mon','Tue','Wed','Thu','Fri'], startTime:'11:00', endTime:'14:00', purpose:['Lunch offers','Ưu đãi bữa trưa'], offer:['$3 off a lunch combo','Giảm $3 combo trưa'], hint:['Adjust the combo and available hours.','Sửa combo và thời gian áp dụng.'], title:['Lunch Combo · Sample','Combo bữa trưa · Mẫu'], badge:['LUNCH','LUNCH'], description:['Save $3 on a main dish and drink combo, Monday–Friday, 11 AM–2 PM. Cannot be combined; excludes delivery fees. Choose the eligible combo before use.','Giảm $3 khi mua combo món chính và đồ uống, thứ Hai–thứ Sáu 11:00–14:00. Không cộng dồn, không gồm phí giao hàng. Sửa combo áp dụng trước khi dùng.']},
    {id:'retail', symbol:'🛍️', value:15, type:'percent', purpose:['Promote products','Khuyến mãi sản phẩm'], offer:['15% off a gift set','Giảm 15% bộ quà tặng'], hint:['Choose products and purchase terms.','Sửa sản phẩm và điều kiện mua.'], title:['Gift Set Offer · Sample','Bộ quà tặng · Mẫu'], badge:['GIFT SET','GIFT SET'], description:['15% off selected gift sets. Does not apply storewide; cannot be combined and excludes tax. Confirm eligible products and availability before use.','Giảm 15% bộ quà tặng được chọn. Không áp dụng toàn bộ cửa hàng; không cộng dồn, không gồm thuế. Xác định sản phẩm áp dụng và tồn kho trước khi dùng.']}
  ];
  const localized = value => value[language === 'vi' ? 1 : 0];
  const newBanner = (theme = 'purple') => ({id:uid(), theme});
  function blankOffer() { return {id:null,title:'',badge:'',description:'',type:'percent',value:10,days:[...days],startTime:'00:00',endTime:'23:59',checkout:true,hero:true,public:'private',paidBoost:false,boostArea:'Houston',boostBudget:100,goal:'slow-hours',shareDestinations:['oneqr','nearby','search'],outreachSegment:'pedicure',outreachChannel:'sms-email',partnerMode:'off',paused:true,banners:[newBanner()],uses:0,revenue:0}; }
  function templateOffer(sample) {
    const templateConditions = {
      upgrade:{serviceScope:'selected',serviceIds:['nail-art','foot-massage'],customerGroup:'all',stacking:'exclusive'},
      weekday:{serviceScope:'selected',serviceIds:['classic-pedicure'],customerGroup:'all',stacking:'exclusive'},
      welcome:{serviceScope:'selected',serviceIds:['classic-pedicure'],customerGroup:'new',stacking:'exclusive'}
    };
    return {...blankOffer(), ...(templateConditions[sample.id] || {serviceScope:'legacy',customerGroup:'legacy',stacking:'legacy'}), templateId:sample.id, title:localized(sample.title), badge:localized(sample.badge), description:localized(sample.description),type:sample.type,value:sample.value,days:[...(sample.days || days)],startTime:sample.startTime || '00:00',endTime:sample.endTime || '23:59',hero:true};
  }
  function normalize(offer) {
    if (!offer || typeof offer.id !== 'string' || typeof offer.title !== 'string' || !Array.isArray(offer.days)) throw new Error('Invalid promotion');
    const migrated = {...blankOffer(), ...offer};
    for (const key of ['paidBoost','boostArea','boostBudget','goal','shareDestinations','outreachSegment','outreachChannel','partnerMode']) if (!Object.hasOwn(offer,key)) delete migrated[key];
    migrated.banners = Array.isArray(offer.banners) && offer.banners.length ? clone(offer.banners) : [{id:'legacy-banner-' + offer.id,theme:offer.theme || 'purple'}];
    if (migrated.banners.some(banner => !banner || typeof banner.id !== 'string') || offer.days.some(day => !days.includes(day))) throw new Error('Invalid promotion data');
    if (offer.allDay === true) { migrated.startTime = '00:00'; migrated.endTime = '23:59'; }
    migrated.paused = !!offer.paused;
    return migrated;
  }
  function seed() {
    const offers = [templates[0],templates[2],templates[1]].map((sample,index) => ({...templateOffer(sample),id:['add-on-upgrade','rebook-save','weekday-glow'][index],title:['Add-On Upgrade — Nâng Cấp Móng','Rebook & Save — Đặt Lịch Kế Tiếp','Weekday Glow — Giờ Vàng Trong Tuần'][index],paused:false,banners:[newBanner(['purple','rose','gold'][index])],hero:index !== 2,createdAt:index+1}));
    return {version:2,demoSeedVersion,offers};
  }
  let state = {version:2,offers:[]}, loadFailed = false, query = '', filter = 'all', current = null, selectedBanner = 0, uploadPending = false, editorSession = 0, feedbackTimer, posterOffer = null, posterIndex = 0, placementMode = null, initialRevision = '', draftAssets = [], editorOpener = null;
  const imageUrls = new Map();
  function load() {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) { state = seed(); localStorage.setItem(key,JSON.stringify(state)); }
      else {
        const saved = JSON.parse(raw);
        if (![1,2].includes(saved?.version) || !Array.isArray(saved.offers)) throw new Error('Invalid saved data');
        if (saved.campaigns !== undefined && !window.NEXORA_CAMPAIGNS.validSaved(saved.campaigns)) throw new Error('Invalid campaigns');
        const offers = saved.offers.map(normalize);
        if (new Set(offers.map(offer => offer.id)).size !== offers.length) throw new Error('Duplicate IDs');
        const needsDemoSeed = offers.length === 0 && saved.demoSeedVersion !== demoSeedVersion;
        state = {...saved, version:2, demoSeedVersion, offers:needsDemoSeed ? seed().offers : offers};
        if (needsDemoSeed || saved.demoSeedVersion !== demoSeedVersion) localStorage.setItem(key,JSON.stringify(state));
      }
      loadFailed = false;
    } catch (_) { loadFailed = true; }
  }
  function feedback(message) { clearTimeout(feedbackTimer); $('#promotion-feedback').textContent = message; feedbackTimer = setTimeout(() => { $('#promotion-feedback').textContent = ''; },5000); }
  function persist(next, inEditor = false) {
    try { localStorage.setItem(key,JSON.stringify(next)); }
    catch (_) { if (inEditor) showError(t('saveError')); else feedback(t('saveError')); return false; }
    state = next; render(); return true;
  }
  function validValue(offer) { return Number.isFinite(Number(offer.value)) && Number(offer.value) > 0 && (offer.type !== 'percent' || Number(offer.value) <= 100); }
  function discount(offer) {
    if (offer.type === 'free') return language === 'vi' ? 'Miễn phí' : 'FREE';
    if (offer.type === 'custom') return String(offer.value || t('invalidPreview'));
    if (!validValue(offer)) return t('invalidPreview');
    return offer.type === 'percent' ? Number(offer.value) + '% off' : '$' + Number(offer.value).toFixed(2) + ' off';
  }
  function schedule(offer) {
    const time = value => { if (language === 'vi') return value; const [h,m] = value.split(':').map(Number); return (h%12 || 12) + ':' + String(m).padStart(2,'0') + (h<12 ? ' AM' : ' PM'); };
    const times = /^\d{2}:\d{2}$/.test(offer.startTime) && /^\d{2}:\d{2}$/.test(offer.endTime) ? time(offer.startTime) + '–' + time(offer.endTime) : '—';
    return offer.days.join(' · ') + ' / ' + times;
  }
  function artwork(offer, banner) {
    if (banner?.assetId) return '<div class="promo-art image-art" data-image-container="' + esc(banner.assetId) + '"><img data-asset-id="' + esc(banner.assetId) + '" alt="' + esc(banner.name || offer.title) + '"><p class="image-error" hidden>' + t('missingImage') + '</p></div>';
    const theme = Object.hasOwn(bannerThemes,banner?.theme) || ['glow','spring'].includes(banner?.theme) ? banner.theme : 'purple';
    return '<div class="promo-art theme-' + theme + '"><span class="art-badge">' + esc(offer.badge || 'SPECIAL OFFER') + '</span><h3>' + esc(offer.title) + '</h3><strong class="art-saving">' + esc(discount(offer)) + '</strong></div>';
  }
  function hydrateImages(scope = document) {
    scope.querySelectorAll('[data-asset-id]').forEach(img => {
      const id = img.dataset.assetId;
      if (!imageUrls.has(id)) imageUrls.set(id,Promise.resolve().then(() => window.NEXORA_PROMOTION_ASSETS.getUrl(id)).catch(() => null));
      imageUrls.get(id).then(url => {
        if (!img.isConnected) return;
        if (url) img.src = url;
        else { img.hidden = true; img.nextElementSibling.hidden = false; }
      });
    });
  }
  function renderTemplates() {
    $('#promotion-templates').innerHTML = templates.map(sample => '<article class="promo-template"><div class="template-art theme-purple"><span class="template-symbol" aria-hidden="true">' + esc(sample.symbol) + '</span><strong>' + esc(localized(sample.offer)) + '</strong></div><h3>' + esc(localized(sample.purpose)) + '</h3><p>' + esc(localized(sample.hint)) + '</p><button class="promo-button primary" data-template="' + sample.id + '">' + t('useTemplate') + icon('arrow-right') + '</button></article>').join('');
  }
  function render() {
    $('#promotion-load-error').hidden = !loadFailed;
    $('#create-promotion').disabled = loadFailed;
    document.querySelectorAll('[data-template]').forEach(button => { button.disabled = loadFailed; });
    const offers = loadFailed ? [] : state.offers;
    $('#stat-total').textContent = loadFailed ? '—' : offers.length;
    $('#stat-active').textContent = loadFailed ? '—' : offers.filter(o => !o.paused).length;
    $('#stat-banners').textContent = loadFailed ? '—' : offers.reduce((sum,o) => sum + o.banners.length,0);
    const visible = offers.filter(o => (filter === 'all' || (filter === 'disabled') === o.paused) && (o.title + ' ' + o.badge).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    $('#promotion-list').innerHTML = visible.map(offer => {
      const action = (name,label,symbol) => '<button class="promo-button" data-action="' + name + '" data-id="' + esc(offer.id) + '">' + icon(symbol) + '<span>' + esc(label) + '</span></button>';
      const performance = '<a class="promo-button" data-action="performance" data-id="' + esc(offer.id) + '" href="promotion-performance.html?promotionId=' + encodeURIComponent(offer.id) + '">' + icon('chart') + '<span>' + esc(t('performance')) + '</span></a>';
      return '<article class="promotion-card" data-promotion-id="' + esc(offer.id) + '">' + artwork(offer,offer.banners[0]) + '<div class="promotion-card-body"><h3>' + esc(offer.title) + '</h3><p class="promotion-schedule">' + esc(schedule(offer)) + '</p><div class="promo-badges"><span class="promo-status ' + (offer.paused ? 'disabled' : 'enabled') + '">' + t(studio.lifecycle(offer)) + '</span>' + (offer.checkout ? '<span class="promo-chip">POS checkout</span>' : '') + (offer.hero ? '<span class="promo-chip">Website & OneQR</span>' : '') + '<span class="promo-chip">' + esc(studio.status(offer,t)) + '</span>' + (offer.paidBoost ? '<span class="promo-chip">Paid Boost · ' + esc(offer.boostArea) + '</span>' : '') + '<span class="promo-chip">' + offer.banners.length + ' ' + t('banner') + '</span></div><div class="promotion-actions">' + action('edit',t('edit'),'edit') + action('share',t('share'),'external-link') + action('toggle',t(offer.paused ? 'enable' : 'disable'),offer.paused ? 'play' : 'pause') + performance + action('duplicate',t('duplicate'),'copy') + action('preview',t('preview'),'eye') + '<details class="promo-more"><summary class="promo-button icon-button" aria-label="' + t('more') + '">' + icon('more') + '</summary><div class="promo-more-menu"><button class="danger" data-action="delete" data-id="' + esc(offer.id) + '">' + t('delete') + '</button></div></details></div></div></article>';
    }).join('');
    $('#promotion-empty').hidden = loadFailed || visible.length > 0;
    $('#empty-title').textContent = t(offers.length ? 'noMatches' : 'emptyTitle');
    $('#empty-description').textContent = t(offers.length ? 'noMatchesHint' : 'emptyHint');
    $('#clear-filters').hidden = !offers.length;
    hydrateImages($('#promotion-list'));
    window.NEXORA_CAMPAIGNS?.refresh();
  }
  function applyLanguage() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-label]').forEach(el => { el.setAttribute('aria-label',t(el.dataset.label)); });
    document.querySelectorAll('[data-placeholder]').forEach(el => { el.placeholder = t(el.dataset.placeholder); el.setAttribute('aria-label',t(el.dataset.placeholder)); });
    $('#promotion-filter').setAttribute('aria-label',language === 'vi' ? 'Lọc chương trình' : 'Filter promotions');
    $('#promotion-language').value = $('#editor-language').value = language;
    $('#promotion-language').setAttribute('aria-label',t('language')); $('#editor-language').setAttribute('aria-label',t('language'));
    renderTemplates(); render();
    if (current) { $('#editor-title').textContent = t(current.id ? 'editTitle' : 'createTitle'); $('#save-note').textContent = t(current.id ? 'editNote' : 'saveNote'); renderBanners(); if (uploadPending) $('#upload-info').textContent = t('busy'); }
    if (posterOffer) renderPoster();
    if (placementMode) renderPlacementPreview(placementMode);
    window.NEXORA_CAMPAIGNS?.translate();
  }
  function readOffer() {
    const result = {...current};
    ['title','badge','description','type','value','startTime','endTime'].forEach(name => { result[name] = field(name).value.trim(); });
    result.days = Array.from(form.querySelectorAll('[name="days"]:checked'),input => input.value);
    result.checkout = field('checkout').checked; result.hero = field('hero').checked; result.public = field('public').checked ? (current.public !== 'private' ? current.public : 'pending') : 'private';
    const paidBoost = field('paidBoost').checked;
    if (!result.id || paidBoost || Object.hasOwn(current,'paidBoost')) result.paidBoost = paidBoost;
    if (!result.id || paidBoost || Object.hasOwn(current,'boostArea')) result.boostArea = field('boostArea').value;
    if (!result.id || paidBoost || Object.hasOwn(current,'boostBudget')) result.boostBudget = Number(field('boostBudget').value);
    const goal = form.querySelector('[name="goal"]:checked')?.value || 'slow-hours';
    const shareDestinations = Array.from(form.querySelectorAll('[name="shareDestination"]:checked'),input => input.value);
    const outreachSegment = field('outreachSegment').value, outreachChannel = field('outreachChannel').value, partnerMode = field('partnerMode').value;
    if (!result.id || Object.hasOwn(current,'goal') || goal !== 'slow-hours') result.goal = goal;
    if (!result.id || Object.hasOwn(current,'shareDestinations') || shareDestinations.join() !== 'oneqr,nearby,search') result.shareDestinations = shareDestinations;
    if (!result.id || Object.hasOwn(current,'outreachSegment') || outreachSegment !== 'pedicure') result.outreachSegment = outreachSegment;
    if (!result.id || Object.hasOwn(current,'outreachChannel') || outreachChannel !== 'sms-email') result.outreachChannel = outreachChannel;
    if (!result.id || Object.hasOwn(current,'partnerMode') || partnerMode !== 'off') result.partnerMode = partnerMode;
    if (['percent','fixed'].includes(result.type)) result.value = Number(result.value);
    result.allDay = result.startTime === '00:00' && result.endTime === '23:59';
    return studio.read(form,result);
  }
  function updateConditional() {
    studio.conditional(form);
    const type = field('type').value;
    field('value').type = ['percent','fixed'].includes(type) ? 'number' : 'text';
    field('value').max = type === 'percent' ? '100' : '';
    $('#discount-field').hidden = type === 'free';
    field('value').required = type !== 'free';
    $('.paid-placement-config').hidden = !field('paidBoost').checked;
  }
  function showError(message, name) {
    $('#promotion-error').textContent = message;
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    if (name) { const target = name === 'days' ? form.querySelector('[name="days"]') : field(name); target.setAttribute('aria-invalid','true'); target.focus(); }
  }
  function validation(offer) {
    if (!offer.title) return ['nameError','title'];
    for (const [name,max] of [['title',100],['badge',50],['description',1000]]) if ((offer[name] || '').length > max) return ['lengthError',name];
    if (['percent','fixed'].includes(offer.type) && !validValue(offer)) return ['valueError','value'];
    if (offer.type === 'custom' && !offer.value) return ['customError','value'];
    if (!offer.days.length) return ['daysError','days'];
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(offer.startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(offer.endTime) || offer.endTime <= offer.startTime) return ['timeError','endTime'];
    if (!offer.banners.length || offer.banners.length > 8) return ['bannerError'];
    if (offer.paidBoost && (offer.public === 'private' || !offer.boostArea || !Number.isFinite(offer.boostBudget) || offer.boostBudget <= 0)) return ['boostBudgetError','boostBudget'];
    return studio.validate(offer);
  }
  function openEditor(offer = blankOffer(), section = '') {
    const active = document.activeElement;
    editorOpener = {node:active,id:active?.id,template:active?.dataset.template,offerId:active?.dataset.id,action:active?.dataset.action};
    current = clone(offer);
    if (!current.id) { current.serviceScope ??= 'all'; current.customerGroup ??= 'all'; current.stacking ??= 'exclusive'; }
    selectedBanner = 0; uploadPending = false; draftAssets = []; editorSession++;
    initialRevision = offer.id ? JSON.stringify(offer) : '';
    form.reset(); studio.fill(form,current); $('#editor-language').value = language; field('type').value = current.type; updateConditional();
    ['title','badge','description','value','startTime','endTime'].forEach(name => { field(name).value = current[name] ?? ''; });
    ['free','custom'].forEach(type => { form.querySelector('option[value="' + type + '"]').hidden = current.type !== type; });
    form.querySelectorAll('[name="days"]').forEach(input => { input.checked = current.days.includes(input.value); });
    field('checkout').checked = !!current.checkout; field('hero').checked = !!current.hero; field('public').checked = current.public !== 'private';
    field('paidBoost').checked = !!current.paidBoost; field('boostArea').value = current.boostArea || 'Houston'; field('boostBudget').value = Number(current.boostBudget) > 0 ? current.boostBudget : 100;
    const goal = form.querySelector('[name="goal"][value="' + (current.goal || 'slow-hours') + '"]'); if (goal) goal.checked = true;
    form.querySelectorAll('[name="shareDestination"]').forEach(input => { input.checked = (current.shareDestinations || ['oneqr','nearby','search']).includes(input.value); });
    field('outreachSegment').value = current.outreachSegment || 'pedicure'; field('outreachChannel').value = current.outreachChannel || 'sms-email'; field('partnerMode').value = current.partnerMode || 'off';
    updateConditional();
    $('#editor-title').textContent = t(current.id ? 'editTitle' : 'createTitle'); $('#save-note').textContent = t(current.id ? 'editNote' : 'saveNote');
    studio.renderPublication(current,t);
    showError(''); $('#upload-info').textContent = t('uploadHint'); $('#upload-file-name').textContent = t('chooseFile');
    renderBanners(); editor.showModal(); $('.editor-body').scrollTop = 0;
    if (section === 'share') { const target = $('#promotion-share-channels'); if (typeof target.scrollIntoView === 'function') target.scrollIntoView({block:'start'}); target.querySelector('summary')?.focus(); }
    else field('title').focus();
  }
  function renderBanners() {
    if (!current) return;
    const offer = readOffer();
    const banner = current.banners[selectedBanner];
    const editableTheme = !banner.assetId && Object.hasOwn(bannerThemes,banner.theme);
    $('#banner-current-design').hidden = editableTheme;
    $('#banner-current-design').textContent = banner.assetId ? t('uploaded') : banner.theme;
    $('#banner-theme').value = editableTheme ? banner.theme : '';
    $('#banner-theme').disabled = uploadPending;
    $('#promotion-preview').innerHTML = artwork(offer,banner);
    $('#studio-preview-terms').innerHTML = '<strong>'+t('previewTerms')+'</strong>' + studio.terms(offer,t).map(term => '<p>'+esc(term)+'</p>').join('');
    studio.renderPublication(current,t);
    $('#promotion-banners').innerHTML = current.banners.map((banner,index) => {
      const button = (action,symbol,label,disabled = false) => '<button type="button" class="promo-button icon-button" data-banner-action="' + action + '" data-index="' + index + '" aria-label="' + t(label) + ' ' + (index+1) + '"' + (disabled || uploadPending ? ' disabled' : '') + '>' + icon(symbol) + '</button>';
      return '<div class="banner-row" aria-current="' + (index === selectedBanner) + '"><span class="banner-name">' + (index+1) + '. ' + esc(banner.assetId ? banner.name || t('uploaded') : themeLabel(banner.theme)) + (index === 0 ? '<small>' + t('cover') + '</small>' : '') + '</span><div class="banner-actions">' + button('select','eye','preview') + button('up','arrow-up','moveUp',index === 0) + button('down','arrow-down','moveDown',index === current.banners.length-1) + button('remove','x','removeBanner',current.banners.length === 1) + '</div></div>';
    }).join('');
    $('#add-banner').disabled = uploadPending || current.banners.length >= 8;
    $('#banner-upload').disabled = uploadPending || current.banners.length >= 8;
    $('#save-promotion').disabled = uploadPending;
    hydrateImages($('#promotion-preview'));
  }
  function quickCampaigns(record) {
    const campaigns = state.campaigns || [];
    const existing = campaigns.find(campaign => campaign.quickSetup === true && campaign.promotionId === record.id);
    if (!record.paidBoost) return existing && existing.status === 'draft' && !Number(existing.spent) && !Number(existing.held) ? campaigns.filter(campaign => campaign.id !== existing.id) : campaigns;
    if (existing && existing.status !== 'draft') return campaigns;
    const totalBudget = Number(record.boostBudget);
    const dailyBudget = existing ? Math.min(Number(existing.dailyBudget) || totalBudget,totalBudget) : Math.min(totalBudget,Math.max(0.01,Math.round(totalBudget / 7 * 100) / 100));
    const campaign = {...(existing || {}),id:existing?.id || 'campaign-' + uid().replace('promotion-',''),name:record.title + ' · Paid Boost',promotionId:record.id,creativeId:record.banners[0].id,objective:'traffic',area:record.boostArea,radius:existing?.radius || 10,category:'beauty',audience:'local',placements:existing?.placements?.length ? existing.placements : ['search','explore'],startDate:record.startDate || '',endDate:record.endDate || '',dailyBudget,totalBudget,billing:'cpc',source:'ads-credit',status:'draft',quickSetup:true,updatedAt:Date.now(),history:existing?.history || [{at:Date.now(),status:'draft',source:'promotion'}]};
    return existing ? campaigns.map(item => item.id === existing.id ? campaign : item) : [...campaigns,campaign];
  }
  function saveOffer() {
    if (!current || !editor.open) return;
    if (uploadPending) { showError(t('busyError')); return; }
    const offer = readOffer(), error = validation(offer);
    if (error) { showError(t(error[0]),error[1]); return; }
    if (loadFailed || offer.id && JSON.stringify(state.offers.find(item => item.id === offer.id)) !== initialRevision) { showError(t('staleError')); return; }
    studio.publication(offer, current.id ? JSON.parse(initialRevision) : null);
    const record = {...offer,id:offer.id || uid(),paused:offer.id ? offer.paused : true,createdAt:offer.createdAt || Date.now(),updatedAt:Date.now()};
    const next = {...state,offers:offer.id ? state.offers.map(item => item.id === offer.id ? record : item) : [...state.offers,record]};
    next.campaigns = quickCampaigns(record);
    if (persist(next,true)) {
      draftAssets.filter(id => !record.banners.some(banner => banner.assetId === id)).forEach(id => { window.NEXORA_PROMOTION_ASSETS?.discard?.(id).catch(() => {}); imageUrls.delete(id); });
      draftAssets = []; editor.close(); clearFilters(); feedback(t(offer.id ? 'updated' : 'saved'));
    }
  }
  function clearFilters() { filter = 'all'; query = ''; $('#promotion-search').value = ''; $('#promotion-filter').value = 'all'; render(); }
  function renderPoster() {
    $('#poster-output').innerHTML = artwork(posterOffer,posterOffer.banners[posterIndex]);
    const terms = studio.terms(posterOffer,t);
    if (posterOffer.redemption === 'code' && posterOffer.code) terms.push(t('useCode') + ': ' + posterOffer.code);
    $('#poster-details').innerHTML = '<h3>' + esc(posterOffer.title) + '</h3><p class="poster-description">' + esc(posterOffer.description) + '</p><p class="poster-schedule">' + esc(schedule(posterOffer)) + '</p>' + terms.map(term => '<p class="poster-schedule">' + esc(term) + '</p>').join('');
    $('#poster-page').textContent = (posterIndex+1) + ' / ' + posterOffer.banners.length;
    $('#previous-banner').disabled = posterIndex === 0; $('#next-banner').disabled = posterIndex === posterOffer.banners.length-1;
    hydrateImages($('#poster-output'));
  }
  function openPoster(offer,index = 0) { posterOffer = clone(offer); posterIndex = index; renderPoster(); posterDialog.showModal(); }
  function renderPlacementPreview(mode) {
    if (!current) return;
    const offer = readOffer();
    const definitions = {
      own:['ownPreviewTitle','ownPreviewPath'],
      public:['publicPreviewTitle','publicPreviewPath'],
      paid:['paidPreviewTitle','paidPreviewPath']
    };
    const definition = definitions[mode] || definitions.own;
    $('#placement-preview-title').textContent = t(definition[0]);
    $('#placement-preview-body').innerHTML = '<p class="placement-path">' + esc(t(definition[1])) + '</p>' +
      (mode === 'paid' ? '<span class="promo-chip sponsored-chip">' + esc(t('sponsoredPreview')) + '</span>' : '') +
      '<div class="placement-preview-art">' + artwork(offer,offer.banners[selectedBanner]) + '</div>' +
      '<div class="studio-preview-terms">' + studio.terms(offer,t).map(term => '<p>' + esc(term) + '</p>').join('') + '</div>' +
      '<p class="promo-note">' + esc(t('previewNotPublished')) + '</p>';
    hydrateImages($('#placement-preview-body'));
  }
  function openPlacementPreview(mode) { placementMode = mode; renderPlacementPreview(mode); placementDialog.showModal(); }
  async function uploadFile(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || !current || current.banners.length >= 8 || uploadPending) return;
    const session = editorSession; uploadPending = true; showError(''); $('#upload-info').textContent = t('busy'); renderBanners();
    try {
      const asset = await window.NEXORA_PROMOTION_ASSETS.importFile(file);
      if (session !== editorSession || !editor.open || !current) { await window.NEXORA_PROMOTION_ASSETS.discard?.(asset.id); return; }
      draftAssets.push(asset.id); imageUrls.set(asset.id,Promise.resolve(asset.url));
      current.banners.push({id:uid(),theme:'purple',assetId:asset.id,name:asset.name}); selectedBanner = current.banners.length-1;
      $('#upload-info').textContent = t('imageAdded'); $('#upload-file-name').textContent = asset.name;
    } catch (error) {
      if (session !== editorSession || !editor.open) return;
      const code = {type:'imageType',size:'imageSize',empty:'imageDecode',decode:'imageDecode',storage:'imageStorage'}[error.code] || 'imageDecode';
      $('#upload-info').textContent = t(code); showError(t(code));
    } finally { if (session === editorSession && current && editor.open) { uploadPending = false; renderBanners(); } }
  }
  $('#promotion-days').innerHTML = days.map(day => '<label class="promo-day"><input type="checkbox" name="days" value="' + day + '" checked><span>' + day + '</span></label>').join('');
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); el.setAttribute('aria-hidden','true'); });
  $('#create-promotion').addEventListener('click',() => openEditor());
  $('#promotion-templates').addEventListener('click',event => { const button = event.target.closest('[data-template]'); if (button) openEditor(templateOffer(templates.find(sample => sample.id === button.dataset.template))); });
  $('#promotion-search').addEventListener('input',event => { query = event.target.value; render(); });
  $('#promotion-filter').addEventListener('change',event => { filter = event.target.value; render(); });
  $('#clear-filters').addEventListener('click',clearFilters);
  $('#retry-load').addEventListener('click',() => { load(); render(); });
  ['#promotion-language','#editor-language'].forEach(selector => $(selector).addEventListener('change',event => { language = event.target.value === 'vi' ? 'vi' : 'en'; try { localStorage.setItem(languageKey,language); } catch (_) {} applyLanguage(); }));
  $('#promotion-list').addEventListener('click',event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const offer = state.offers.find(item => item.id === button.dataset.id); if (!offer) return;
    const action = button.dataset.action;
    if (action === 'edit') openEditor(offer);
    if (action === 'share') openEditor(offer,'share');
    if (action === 'preview') openPoster(offer);
    if (action === 'toggle') {
      const error = offer.paused && validation(offer);
      if (error) { openEditor(offer); showError(t(error[0]),error[1]); return; }
      if (persist({...state,offers:state.offers.map(item => item.id === offer.id ? {...item,paused:!item.paused,updatedAt:Date.now()} : item)})) feedback(t(offer.paused ? 'enabledMessage' : 'disabledMessage'));
    }
    if (action === 'duplicate') {
      const duplicate = {...clone(offer),id:uid(),title:offer.title.slice(0,90) + ' · ' + t('copySuffix'),paused:true,public:'private',paidBoost:false,uses:0,revenue:0,canDelete:true,createdAt:Date.now(),updatedAt:Date.now()};
      delete duplicate.publicationVersion; delete duplicate.publicationHistory; delete duplicate.rejectionReason;
      duplicate.banners.forEach(banner => { banner.id = uid(); });
      if (persist({...state,offers:[...state.offers,duplicate]})) { clearFilters(); feedback(t('duplicated')); }
    }
    if (action === 'delete') {
      if ((state.campaigns || []).some(campaign => campaign.promotionId === offer.id)) { feedback(t('campaignLinked')); return; }
      if (offer.canDelete === false || Number(offer.uses) > 0) { feedback(t('cannotDelete')); return; }
      if (window.confirm(t('confirmDelete') + '\n“' + offer.title + '”') && persist({...state,offers:state.offers.filter(item => item.id !== offer.id)})) feedback(t('deleted'));
    }
  });
  form.addEventListener('input',event => { if (!current || event.target.type === 'file' || event.target.id === 'banner-theme') return; showError(''); renderBanners(); });
  form.addEventListener('change',event => {
    if (!current || !event.target.name) return;
    if (event.target.name === 'paidBoost' && event.target.checked) field('public').checked = true;
    if (event.target.name === 'public' && !event.target.checked) field('paidBoost').checked = false;
    updateConditional(); renderBanners();
  });
  form.addEventListener('submit',event => { event.preventDefault(); saveOffer(); });
  document.querySelectorAll('[data-close-editor]').forEach(button => button.addEventListener('click',() => editor.close()));
  editor.addEventListener('close',() => {
    editorSession++; current = null; uploadPending = false;
    draftAssets.forEach(id => { window.NEXORA_PROMOTION_ASSETS?.discard?.(id).catch(() => {}); imageUrls.delete(id); }); draftAssets = [];
    const opener = editorOpener;
    const target = opener?.node.isConnected ? opener.node : opener?.id ? document.getElementById(opener.id) : Array.from(document.querySelectorAll('[data-template],[data-action]')).find(node => opener?.template ? node.dataset.template === opener.template : opener?.offerId && node.dataset.id === opener.offerId && node.dataset.action === opener.action);
    (target || $('#create-promotion')).focus();
    editorOpener = null;
  });
  $('#banner-theme').addEventListener('change',event => {
    if (!current || uploadPending || !Object.hasOwn(bannerThemes,event.target.value)) return;
    const banner = current.banners[selectedBanner];
    current.banners[selectedBanner] = {...banner,theme:event.target.value};
    delete current.banners[selectedBanner].assetId;
    delete current.banners[selectedBanner].name;
    showError(''); renderBanners();
  });
  $('#add-banner').addEventListener('click',() => { if (!current || uploadPending || current.banners.length >= 8) return; current.banners.push(newBanner($('#banner-theme').value || 'purple')); selectedBanner = current.banners.length-1; renderBanners(); });
  $('#promotion-banners').addEventListener('click',event => {
    const button = event.target.closest('[data-banner-action]'); if (!button || button.disabled || !current || uploadPending) return;
    const index = Number(button.dataset.index), action = button.dataset.bannerAction;
    if (action === 'select') selectedBanner = index;
    if (action === 'remove' && current.banners.length > 1) {
      const selectedId = current.banners[selectedBanner].id;
      current.banners.splice(index,1);
      const retainedIndex = current.banners.findIndex(banner => banner.id === selectedId);
      selectedBanner = retainedIndex >= 0 ? retainedIndex : Math.min(index,current.banners.length-1);
    }
    if (action === 'up' || action === 'down') { const next = index + (action === 'up' ? -1 : 1); if (next < 0 || next >= current.banners.length) return; [current.banners[index],current.banners[next]] = [current.banners[next],current.banners[index]]; selectedBanner = next; }
    renderBanners();
    $('#promotion-banners [data-banner-action="select"][data-index="' + selectedBanner + '"]').focus();
  });
  $('#banner-upload').addEventListener('change',uploadFile);
  $('#preview-draft').addEventListener('click',() => { if (current) openPoster(readOffer(),selectedBanner); });
  $('#preview-promotion').addEventListener('click',() => {
    if (!current) return;
    const offer = readOffer(), error = validation(offer);
    if (error) { showError(t(error[0]),error[1]); return; }
    openPoster(offer,selectedBanner);
  });
  document.querySelectorAll('[data-placement-preview]').forEach(button => button.addEventListener('click',() => { if (current) openPlacementPreview(button.dataset.placementPreview); }));
  $('#close-placement-preview').addEventListener('click',() => placementDialog.close());
  placementDialog.addEventListener('close',() => { placementMode = null; });
  $('#close-poster').addEventListener('click',() => posterDialog.close());
  posterDialog.addEventListener('close',() => { posterOffer = null; });
  $('#previous-banner').addEventListener('click',() => { if (posterIndex > 0) { posterIndex--; renderPoster(); } });
  $('#next-banner').addEventListener('click',() => { if (posterIndex < posterOffer.banners.length-1) { posterIndex++; renderPoster(); } });
  $('#print-poster').addEventListener('click',() => window.print());
  document.querySelectorAll('[data-share-action],[data-prototype-action]').forEach(button => button.addEventListener('click',() => feedback('Prototype · ' + button.textContent.trim())));
  document.addEventListener('click',event => { document.querySelectorAll('.promo-more[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; }); });
  document.addEventListener('keydown',event => { if (event.key === 'Escape') document.querySelectorAll('.promo-more[open]').forEach(menu => { menu.open = false; }); });
  window.addEventListener('storage',event => { if (event.key === key || event.key === null) { load(); render(); } });
  load();
  window.NEXORA_CAMPAIGNS.init({getState:() => state,available:() => !loadFailed,persist,t,feedback,openEditor,artwork,hydrateImages});
  applyLanguage();
})();
