(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const copy = {
    studioTitle:['Promotion Studio','Promotion Studio'], offersTab:['Promotions','Ưu đãi'], campaignsTab:['Paid Boost','Paid Boost'], reportsTab:['Performance','Hiệu quả'], performance:['Performance','Hiệu quả'],
    salonContext:['Salon configuration · Current location · America/Chicago','Cấu hình salon · Chi nhánh hiện tại · America/Chicago'],
    servicesScope:['Service scope','Phạm vi dịch vụ'], legacyScope:['Keep existing terms','Giữ điều kiện hiện tại'], allServices:['All services','Tất cả dịch vụ'], selectedServices:['Selected services / packages','Dịch vụ / gói được chọn'],
    selectServices:['Eligible services / packages','Dịch vụ / gói áp dụng'], serviceHelp:['Sample salon catalog. Hold Ctrl / ⌘ to select more than one.','Danh mục salon minh họa. Giữ Ctrl / ⌘ để chọn nhiều mục.'],
    customerGroup:['Customer eligibility','Nhóm khách áp dụng'], allCustomers:['All customers','Tất cả khách'], newCustomers:['New customers','Khách mới'], returningCustomers:['Returning customers','Khách quay lại'],
    stacking:['Combine with other offers','Cộng dồn ưu đãi'], exclusive:['Cannot be combined','Không cộng dồn'], combinable:['Can be combined','Cho phép cộng dồn'],
    exclusions:['Additional terms & exclusions','Điều kiện bổ sung & loại trừ'], conditionsHelp:['Eligibility is configured here. Booking and POS must verify it before confirming the discount.','Cấu hình điều kiện tại đây; booking và POS cần xác minh trước khi xác nhận mức giảm.'],
    effectiveStart:['Effective from · optional','Hiệu lực từ ngày · tùy chọn'], effectiveEnd:['Effective until · optional','Hiệu lực đến ngày · tùy chọn'],
    dateError:['End date must be on or after the start date.','Ngày kết thúc phải từ ngày bắt đầu trở đi.'], serviceError:['Select at least one eligible service or package.','Chọn ít nhất một dịch vụ hoặc gói áp dụng.'],
    cta:['Customer action','Hành động của khách'], detailsCta:['View promotion','Xem ưu đãi'], bookingCta:['Book an appointment','Đặt lịch'], destinationHint:['Destination: this promotion at the current salon. The customer link and QR will be available after publishing is connected.','Đích đến: ưu đãi này tại salon hiện tại. Link và QR cho khách sẽ có khi kết nối xuất bản.'],
    publication:['Publication status','Trạng thái xuất bản'], private:['Public · Not submitted','Public · Chưa gửi'], approved:['Public · Approved','Public · Đã duyệt'], rejected:['Public · Changes required','Public · Cần chỉnh sửa'], removed:['Public · Removed','Public · Đã gỡ'],
    version:['Version','Phiên bản'], history:['Publication history','Lịch sử xuất bản'], noHistory:['No submissions recorded.','Chưa ghi nhận lần gửi duyệt.'],
    localReview:['Prototype: requests are saved locally; no review request is sent to Nexora.','Bản mẫu: yêu cầu lưu trong trình duyệt; chưa gửi yêu cầu duyệt đến Nexora.'],
    internalHint:['Internal · Your own channels. No network advertising fee.','Internal · Kênh riêng của salon. Không có phí quảng cáo mạng.'],
    publicFree:['Public · Organic clicks are free. Review is separate from Paid Boost.','Public · Click tự nhiên miễn phí. Duyệt riêng với Paid Boost.'],
    whereDisplay:['Where should it appear?','Hiển thị ở đâu?'],
    ownPlacement:['Your website & OneQR','Website & OneQR của tiệm'], ownPlacementHint:['Branch homepage and Promotions page.','Homepage và trang Promotions của chi nhánh.'],
    publicPlacement:['Public on Nexora','Public trên Nexora'], publicPlacementHint:['Customers can find it in Explore, Nearby and Search Deals after review.','Khách tìm thấy trong Khám phá, Nearby và Search Deals sau khi duyệt.'],
    paidPlacement:['Paid advertising','Quảng cáo trả phí'], paidPlacementHint:['Sponsored placement in Explore. Public is required; this never inserts ads on another salon’s homepage.','Vị trí tài trợ trong Khám phá. Cần bật Public; không chèn vào homepage tiệm khác.'],
    viewOwnPlacement:['View Website & OneQR placement','Xem vị trí Website & OneQR'], viewPublicPlacement:['View Public placement on Nexora','Xem vị trí Public trên Nexora'], viewPaidPlacement:['View paid advertising placement','Xem vị trí Quảng cáo trả phí'],
    boostArea:['Advertising area','Khu vực quảng bá'], boostBudget:['Maximum total campaign budget (USD)','Ngân sách tối đa toàn chiến dịch (USD)'],
    boostHint:['Saving creates one linked Paid Boost draft. It follows the effective dates above and does not charge Ads Credit.','Khi lưu, hệ thống tạo một Paid Boost nháp được liên kết. Campaign dùng ngày hiệu lực phía trên và chưa trừ Ads Credit.'],
    boostBudgetError:['Enter a total campaign budget greater than zero.','Nhập ngân sách toàn chiến dịch lớn hơn 0.'],
    paidDailyBudgetError:['Daily ad budget must be greater than zero and cannot exceed the total ad budget.','Ngân sách quảng cáo ngày phải lớn hơn 0 và không vượt tổng ngân sách quảng cáo.'],
    paidPlacementError:['Choose at least one ad placement.','Chọn ít nhất một vị trí quảng cáo.'],
    paidDateError:['Campaign end date must be on or after its start date.','Ngày kết thúc quảng cáo phải từ ngày bắt đầu trở đi.'],
    placementPreview:['Placement preview','Xem trước vị trí'], previewAction:['Preview','Xem trước'],
    ownPreviewTitle:['Website & OneQR placement','Vị trí Website & OneQR'], publicPreviewTitle:['Public placement on Nexora','Vị trí Public trên Nexora'], paidPreviewTitle:['Paid advertising placement','Vị trí Quảng cáo trả phí'],
    ownPreviewPath:['Homepage / OneQR → promotion banner and branch Promotions page.','Homepage / OneQR → banner ưu đãi và trang Promotions của chi nhánh.'],
    publicPreviewPath:['Explore → Nearby / Search Deals → eligible results.','Khám phá → Nearby / Search Deals → kết quả phù hợp.'],
    paidPreviewPath:['Explore → Nearby / Search Deals → Sponsored placement.','Khám phá → Nearby / Search Deals → vị trí Được tài trợ.'],
    previewNotPublished:['Preview only · This draft has not been published.','Chỉ xem trước · Bản nháp chưa được xuất bản.'], sponsoredPreview:['Sponsored · Preview','Được tài trợ · Xem trước'],
    scheduled:['Scheduled','Chờ ngày hiệu lực'], expired:['Expired','Hết hiệu lực'], draft:['Draft','Nháp'], pendingCampaign:['Pending review · local','Chờ duyệt · lưu cục bộ'], paused:['Paused by owner','Owner tạm dừng'], pausedCredit:['Paused · insufficient credit','Tạm dừng · thiếu credit'], ended:['Ended','Đã kết thúc'],
    createCampaign:['Create campaign','Tạo campaign'], campaignTitle:['Paid Boost campaigns','Campaign Paid Boost'], campaignIntro:['Promote a Public offer with its own schedule and budget. Saving a draft does not spend Ads Credit.','Quảng bá ưu đãi Public với lịch và ngân sách riêng. Lưu nháp không tiêu Ads Credit.'],
    campaignLinked:['This promotion belongs to a campaign. Disable it to preserve campaign history.','Ưu đãi thuộc một campaign. Hãy tắt để giữ lịch sử campaign.'], campaignHistory:['Campaign history','Lịch sử campaign'], viewCampaign:['View configuration','Xem cấu hình'], rejectedCampaign:['Changes required','Cần chỉnh sửa'], approvedCampaign:['Approved · awaiting distribution','Đã duyệt · chờ phân phối'],
    campaignSchedule:['Schedule & budget','Lịch chạy & ngân sách'], adsCredit:['Ads Credit','Ads Credit'],
    campaignName:['Campaign name','Tên campaign'], promotion:['Promotion','Ưu đãi'], objective:['Objective','Mục tiêu'], traffic:['Visits to promotion','Lượt xem ưu đãi'], leadUnavailable:['Leads · verification unavailable','Lead · chưa kết nối xác minh'], bookingUnavailable:['Completed bookings · tracking unavailable','Booking hoàn tất · chưa kết nối ghi nhận'],
    audience:['Audience','Đối tượng'], localCustomers:['Customers in the selected area','Khách trong khu vực đã chọn'], area:['City / area','Thành phố / khu vực'], radius:['Radius (km)','Bán kính (km)'], category:['Industry','Ngành'], beauty:['Beauty & salon','Làm đẹp & salon'],
    placement:['Sponsored placements','Vị trí tài trợ'], searchDeals:['Search Deals','Search Deals'], explore:['Explore / Nearby','Explore / Nearby'], bannerPlacement:['Network banner','Banner trên mạng'], targetingHint:['Sponsored labels and industry / competitor filters apply. No customer lists are shared.','Có nhãn Sponsored và bộ lọc ngành / đối thủ. Không chia sẻ danh sách khách.'],
    creative:['Creative','Banner quảng cáo'], campaignStart:['Campaign starts','Bắt đầu campaign'], campaignEnd:['Campaign ends','Kết thúc campaign'], dailyBudget:['Daily budget (USD)','Ngân sách ngày (USD)'], totalBudget:['Total budget (USD)','Tổng ngân sách (USD)'],
    billingModel:['Billing model','Mô hình tính phí'], cpc:['CPC · Valid click','CPC · Click hợp lệ'], cpl:['CPL · Not configured','CPL · Chưa cấu hình'], cpa:['CPA · Not configured','CPA · Chưa cấu hình'], sponsored:['Sponsored placement · Not configured','Sponsored placement · Chưa cấu hình'],
    priceNote:['Illustrative policy: $0.50 per verified ad click. Organic views, impressions and invalid / repeated clicks are not charged. Production prices require configuration.','Chính sách minh họa: $0.50 / click quảng cáo được xác minh. Không thu click organic, lượt hiển thị, click không hợp lệ / trùng. Giá triển khai cần được cấu hình.'],
    source:['Payment source','Nguồn thanh toán'], creditLink:['Manage Ads Credit','Quản lý Ads Credit'], saveAddCredit:['Save draft & add credit','Lưu nháp & nạp credit'], kybLink:['Business verification (KYB)','Xác minh doanh nghiệp (KYB)'], creditHint:['Uses your existing Ads Credit. A budget is a spending cap, not an upfront charge. No automatic top-up.','Dùng Ads Credit hiện có. Ngân sách là hạn mức, không thu trước toàn bộ. Không tự động nạp.'],
    eligibility:['Before this campaign can run','Điều kiện trước khi chạy'], publicRequired:['Public approval is required.','Ưu đãi Public cần được duyệt.'], promotionRequired:['Enable the promotion before distribution.','Bật ưu đãi trước khi phân phối.'], creditRequired:['Available Ads Credit is below this campaign’s total budget. Save the draft and add credit.','Ads Credit khả dụng thấp hơn tổng ngân sách campaign. Lưu nháp và nạp thêm credit.'],
    backendRequired:['Advertiser permission, KYB and available credit await system verification.','Quyền advertiser, KYB và credit khả dụng chờ hệ thống xác minh.'], campaignApproval:['Campaign and creative require separate approval.','Campaign và banner cần được duyệt riêng.'],
    noLiveAds:['Prototype · No ads are delivered and no credit is charged.','Bản mẫu · Chưa phân phối quảng cáo hoặc trừ credit.'],
    consent:['I accept the illustrative CPC policy and spending limits shown here. A real campaign requires the effective price and policy to be confirmed again.','Tôi chấp thuận chính sách CPC minh họa và hạn mức đang hiển thị. Campaign thực tế cần xác nhận lại giá và chính sách có hiệu lực.'],
    saveDraft:['Save draft','Lưu nháp'], requestReview:['Save review request','Lưu yêu cầu duyệt'], campaignSaved:['Campaign saved locally. No Ads Credit was charged.','Đã lưu campaign trong trình duyệt. Chưa trừ Ads Credit.'],
    campaignNameError:['Enter a campaign name and select a promotion.','Nhập tên campaign và chọn ưu đãi.'], campaignDateError:['Choose campaign dates within the promotion’s effective schedule.','Chọn ngày chạy campaign trong khoảng hiệu lực ưu đãi.'],
    budgetError:['Budgets must be positive amounts with up to two decimals; daily budget cannot exceed total budget or fall below committed spend.','Ngân sách phải lớn hơn 0, tối đa hai số lẻ; ngân sách ngày không vượt tổng và không thấp hơn khoản đã tiêu / giữ.'],
    targetingError:['Enter an area, radius from 1–100 km and at least one placement.','Nhập khu vực, bán kính 1–100 km và ít nhất một vị trí.'], creativeError:['Choose a banner belonging to this promotion.','Chọn banner thuộc ưu đãi này.'], consentError:['Accept the displayed policy before saving a review request.','Chấp thuận chính sách hiển thị trước khi lưu yêu cầu duyệt.'],
    campaignStale:['This campaign or its promotion changed. Close and reopen the editor.','Campaign hoặc ưu đãi đã thay đổi. Đóng và mở lại form.'],
    noCampaigns:['No campaigns yet. Create a draft from a saved promotion.','Chưa có campaign. Tạo nháp từ một ưu đãi đã lưu.'], campaignSearch:['Search campaign name…','Tìm tên campaign…'], allCampaigns:['All campaign statuses','Tất cả trạng thái campaign'],
    editCampaign:['Configure','Cấu hình'], pauseCampaign:['Pause','Tạm dừng'], endCampaign:['End campaign','Kết thúc campaign'], endConfirm:['End this campaign? Existing recorded charges remain; unused credit stays in Ads Credit.','Kết thúc campaign? Chi phí đã ghi nhận được giữ lại; credit chưa dùng vẫn thuộc Ads Credit.'],
    resumeCampaign:['Request review again','Gửi duyệt lại'], revisionNotice:['Configuration changes return the campaign to draft and require new consent.','Đổi cấu hình đưa campaign về nháp và cần chấp thuận lại.'],
    resultsTitle:['Promotion results','Kết quả quảng bá'], resultsHint:['Tracking is not connected. No attributed revenue or ROAS is available.','Chưa kết nối tracking. Chưa có doanh thu được ghi nhận hoặc ROAS.'], channel:['Channel','Kênh'], impressions:['Impressions','Lượt hiển thị'], clicks:['Valid clicks','Click hợp lệ'], spend:['Recorded spend','Chi phí đã ghi nhận'], held:['Held','Đang giữ'], adjustments:['Adjustments','Điều chỉnh'], organic:['Public · Organic','Public · Tự nhiên'], internal:['Internal · Own channels','Internal · Kênh riêng'], paid:['Paid Boost · Sponsored','Paid Boost · Tài trợ'],
    reportsPeriod:['Reporting period','Kỳ báo cáo'], last7:['Last 7 days','7 ngày qua'], last30:['Last 30 days','30 ngày qua'], reportTime:['Shop timezone: America/Chicago · Last sync: not connected','Múi giờ salon: America/Chicago · Đồng bộ: chưa kết nối'], previewTerms:['Offer conditions','Điều kiện ưu đãi']
  };
  const services = {'classic-pedicure':'Classic Pedicure','gel-manicure':'Gel Manicure','nail-art':'Nail Art','foot-massage':'Foot Massage','mani-pedi':'Manicure + Pedicure Package'};
  const keys = ['serviceScope','customerGroup','stacking','startDate','endDate','exclusions','cta'];
  const defaults = {serviceScope:'legacy',customerGroup:'legacy',stacking:'legacy',startDate:'',endDate:'',exclusions:'',cta:'details'};
  const value = (offer, key) => offer[key] ?? defaults[key];
  function fill(form, offer) {
    keys.forEach(key => { form.elements.namedItem(key).value = value(offer,key); });
    [...form.elements.namedItem('serviceIds').options].forEach(option => { option.selected = (offer.serviceIds || []).includes(option.value); });
    conditional(form);
  }
  function read(form, offer) {
    keys.forEach(key => { const next = form.elements.namedItem(key).value.trim(); if (next !== value(offer,key)) offer[key] = next; });
    const ids = [...form.elements.namedItem('serviceIds').selectedOptions].map(option => option.value);
    if (ids.length || offer.serviceIds) offer.serviceIds = ids;
    return offer;
  }
  function conditional(form) { document.querySelector('#studio-services').hidden = form.elements.namedItem('serviceScope').value !== 'selected'; }
  function validate(offer) {
    if (offer.startDate && offer.endDate && offer.endDate < offer.startDate) return ['dateError','endDate'];
    if (offer.serviceScope === 'selected' && !(offer.serviceIds || []).some(id => services[id])) return ['serviceError','serviceIds'];
    return null;
  }
  function terms(offer,t) {
    const result = [];
    if (offer.serviceScope === 'selected') result.push(t('selectServices') + ': ' + (offer.serviceIds || []).map(id => services[id] || id).join(', '));
    else if (offer.serviceScope === 'all') result.push(t('allServices'));
    else if (offer.services) result.push(t('selectServices') + ': ' + offer.services);
    if (offer.customerGroup && offer.customerGroup !== 'legacy') result.push(t({all:'allCustomers',new:'newCustomers',returning:'returningCustomers'}[offer.customerGroup]));
    else if (offer.audience) result.push(offer.audience);
    if (offer.stacking && offer.stacking !== 'legacy') result.push(t(offer.stacking === 'exclusive' ? 'exclusive' : 'combinable'));
    if (offer.startDate || offer.endDate) result.push((offer.startDate || '…') + ' → ' + (offer.endDate || '…'));
    if (offer.exclusions) result.push(offer.exclusions);
    result.push(t(offer.cta === 'booking' ? 'bookingCta' : 'detailsCta'));
    return result;
  }
  function snapshot(offer) {
    const data = {};
    ['title','badge','description','type','value','days','startTime','endTime','banners','services','audience','redemption','code','serviceIds','paidBoost','boostArea','boostBudget','goal','shareDestinations','outreachSegment','outreachChannel','partnerMode',...keys].forEach(key => { data[key] = offer[key] ?? defaults[key] ?? null; });
    return data;
  }
  function publication(offer, previous) {
    const selected = offer.public !== 'private';
    const changed = JSON.stringify(snapshot(offer)) !== JSON.stringify(snapshot(previous || offer));
    const requested = selected && (!previous || previous.public === 'private' || previous.public === 'rejected' || changed);
    if (requested) {
      offer.public = 'pending'; offer.publicationVersion = (previous?.publicationVersion || 0) + 1;
      offer.publicationHistory = [...(previous?.publicationHistory || []), {version:offer.publicationVersion,status:'pending',at:Date.now(),snapshot:snapshot(offer)}];
      delete offer.rejectionReason;
    } else if (selected) offer.public = previous?.public || 'pending';
    else if (previous && previous.public !== 'private') offer.publicationHistory = [...(previous.publicationHistory || []),{version:previous.publicationVersion || 1,status:'private',at:Date.now()}];
    return offer;
  }
  function today() { return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
  function lifecycle(offer) { const now = today(); return offer.endDate && offer.endDate < now ? 'expired' : offer.paused ? 'disabled' : offer.startDate && offer.startDate > now ? 'scheduled' : 'enabled'; }
  function status(offer,t) { return t(['private','approved','pending','rejected','removed'].includes(offer.public) ? offer.public : 'private'); }
  function renderPublication(offer,t) {
    const el = document.querySelector('#publication-summary');
    el.innerHTML = '<strong>' + esc(status(offer,t)) + '</strong><p>' + esc(offer.rejectionReason || '') + '</p><small>' + esc(t('localReview')) + '</small>';
    document.querySelector('#publication-history').innerHTML = (offer.publicationHistory || []).slice().reverse().map(item => '<li>'+esc(t('version'))+' '+esc(item.version)+' · '+esc(t(item.status))+' · '+esc(new Date(item.at).toLocaleString())+'</li>').join('') || '<li>'+esc(t('noHistory'))+'</li>';
  }
  window.NEXORA_STUDIO = {copy,services,fill,read,conditional,validate,terms,publication,lifecycle,status,renderPublication,esc,today};
})();
