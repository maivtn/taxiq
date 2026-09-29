/* Business Owner HTML preview. Fixtures are illustrative, never a payout API or wallet balance. */
(function () {
  'use strict';
  const root = document.getElementById('earnings-app');
  if (!root) return;
  const dialog = document.getElementById('earning-detail');
  const policy = 'ONEQR-ADS-REF-REV-2026-09-21-v1';
  const initialHash = location.hash.slice(1);
  const state = {
    lang: new URLSearchParams(location.search).get('lang') === 'vi' ? 'vi' : 'en',
    view: ['settings', 'ads'].includes(initialHash) ? initialHash : 'overview',
    enabled: false,
    consent: false,
    audit: null,
    period: 'all',
    status: 'all',
    adSaved: false,
    ads: { order: 'ad', cross: 'on', mode: 'split', discovery: 'rich', day: '2', time: 'lunch', competitor: 'group', radius: 'auto', scan: 1, placements: { hero: true, nearby: true, wait: true, complete: true } }
  };
  try {
    const savedAds = JSON.parse(localStorage.getItem('nexora_oneqr_earnings_ads_v1') || 'null');
    if (savedAds) state.ads = { ...state.ads, ...savedAds, placements: { ...state.ads.placements, ...savedAds.placements } };
  } catch (error) { /* Keep prototype defaults when storage is unavailable. */ }
  const t = (vi, en) => state.lang === 'vi' ? vi : en;
  const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const date = value => new Intl.DateTimeFormat(state.lang === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Chicago' }).format(new Date(value + 'T12:00:00-05:00'));
  const labels = () => ({ pending: t('Chờ đối soát', 'Pending settlement'), available: t('Khả dụng', 'Available'), reserve: t('Dự phòng', 'Reserve'), hold: t('Giữ do tranh chấp', 'Dispute hold'), sending: t('Đang chuyển', 'In transfer'), paid: t('Đã ghi có ví', 'Wallet credited'), reconciling: t('Cần đối chiếu', 'Needs reconciliation'), failed: t('Thất bại', 'Failed'), rejected: t('Bị loại', 'Excluded'), enabled: t('Đã bật kiếm tiền', 'Monetization on'), disabled: t('Đang tắt kiếm tiền', 'Monetization off') });
  const badge = key => `<span class="eq-badge ${key}">${labels()[key]}</span>`;
  const views = () => ({ overview: t('Tổng quan', 'Overview'), ads: t('Cài đặt quảng cáo', 'Ad settings'), activity: t('Thu nhập', 'Earnings activity'), reserves: t('Dự phòng & điều chỉnh', 'Reserves & adjustments'), payouts: t('Nhận tiền', 'Payouts'), settings: t('Điều kiện & chính sách', 'Eligibility & policy') });
  const activities = [
    { id: 'E-103', date: '2026-09-21', type: ['Click banner tài trợ', 'Sponsored banner clicks'], campaign: 'Coffee Morning · C-203', amount: 1600, status: 'pending', basis: ['100 click hợp lệ × $0.40 × 40%', '100 valid clicks × $0.40 × 40%'], due: '2026-10-05', note: ['Đã loại click lặp; chờ đủ 14 ngày đối soát.', 'Duplicate clicks excluded; awaiting the 14-day settlement period.'] },
    { id: 'E-102', date: '2026-09-20', type: ['Dịch vụ hoàn tất', 'Completed service'], campaign: 'Wellness Welcome · C-202', amount: 11240, status: 'pending', basis: ['$2,248 dịch vụ đủ điều kiện × 10% phí × 50%', '$2,248 eligible services × 10% fee × 50%'], due: '2026-10-04', note: ['Đã hoàn tất và xác nhận thanh toán. Nguồn khóa theo booking B-102 ngày 18 tháng 9 năm 2026.', 'Completion and payment verified. Source locked to booking B-102 on September 18, 2026.'] },
    { id: 'E-101', date: '2026-09-07', type: ['Dịch vụ hoàn tất', 'Completed service'], campaign: 'Wellness Welcome · C-202', amount: 10000, status: 'available', basis: ['$2,000 dịch vụ đủ điều kiện × 10% phí × 50%', '$2,000 eligible services × 10% fee × 50%'], due: '2026-09-21', note: ['Publisher Share $100: đã trích dự phòng $20 một lần, $80 vào khả dụng. Nguồn khóa ở booking B-101 ngày 5 tháng 9 năm 2026.', 'Publisher Share $100: $20 reserved once, $80 allocated to available. Source locked at booking B-101 on September 5, 2026.'] },
    { id: 'E-104', date: '2026-09-21', type: ['Tranh chấp đang kiểm tra', 'Dispute under review'], campaign: 'Wellness Welcome · C-202', amount: 500, status: 'hold', basis: ['$5 trong dự phòng của E-101', '$5 within the E-101 reserve'], due: '2026-10-21', note: ['Chỉ giữ $5 liên quan. Chưa kết luận mất quyền hưởng; chưa tạo khoản thu hồi. Ngày giải phóng còn phụ thuộc kết quả tranh chấp.', 'Only the related $5 is held. No confirmed loss of entitlement or recovery. Release also depends on the dispute outcome.'] },
    { id: 'E-105', date: '2026-09-21', type: ['Click bị loại', 'Excluded click'], campaign: 'Coffee Morning · C-203', amount: 0, status: 'rejected', basis: ['Click lặp cùng advertiser trong 24 giờ', 'Duplicate click for the same advertiser within 24 hours'], due: null, note: ['Không tạo Publisher Share.', 'No Publisher Share created.'] }
  ];
  const payouts = [
    { id: 'P-0922', date: '2026-09-22', amount: 3000, status: 'reconciling', ref: 'NX-0922-01', walletRef: '—', note: ['Chưa rõ kết quả ghi có. Đang đối chiếu với VlinkPay trước khi thử lại; $30 vẫn thuộc đang chuyển.', 'Credit outcome unknown. Reconcile with VlinkPay before retrying; $30 remains in transfer.'] },
    { id: 'P-0915', date: '2026-09-15', amount: 41000, status: 'paid', ref: 'NX-0915-01', walletRef: 'VLP-0915-8841', note: ['VlinkPay xác nhận ghi có ngày 15 tháng 9 năm 2026, 09:12 America/Chicago.', 'VlinkPay confirmed credit on September 15, 2026, 09:12 America/Chicago.'] },
    { id: 'P-0908', date: '2026-09-08', amount: 41000, status: 'failed', ref: 'NX-0908-01', walletRef: '—', note: ['Đã xác nhận chưa ghi có do gián đoạn kết nối. Đối chiếu xong, chuyển lại trong P-0915 và chỉ ghi nhận đã trả một lần.', 'No credit confirmed after a connection failure. Reconciled and retried in P-0915; counted as paid only once.'] }
  ];
  const pair = (label, value, cls = '') => `<div class="${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;
  const note = (content, warning = false) => `<div class="eq-note${warning ? ' warning' : ''}">${content}</div>`;
  const button = (view, text) => `<button type="button" data-view="${view}">${text}</button>`;
  const policyLink = () => `<a data-policy-link data-policy-version="${policy}" href="oneqr-policy.html?lang=${state.lang}" target="_blank" rel="noopener" aria-label="${t('Chính sách kiếm tiền OneQR (mở tab mới)', 'OneQR Monetization Policy (opens in a new tab)')}">${t('Chính sách kiếm tiền OneQR', 'OneQR Monetization Policy')}</a>`;
  const eligibility = { kyb: true, tax: true, qrOwnership: true, security: true, wallet: true };
  const eligible = () => Object.values(eligibility).every(Boolean);
  function select(id, title, values, current) {
    return `<label for="${id}">${title}<select id="${id}">${Object.entries(values).map(([key, val]) => `<option value="${key}"${current === key ? ' selected' : ''}>${val}</option>`).join('')}</select></label>`;
  }
  function wallet() {
    return `<h3>VlinkPay · Business SSO</h3><p>Bitcoin Nail Bar · <strong>•••• 8841</strong></p><p class="eq-small eq-muted">${t('Ví nhận tiền liên kết với tài khoản Business.', 'Receiving wallet linked to your Business account.')}</p><span class="eq-badge available">${t('Đủ điều kiện nhận tiền', 'Eligible to receive')}</span>`;
  }
  function overview() {
    const metrics = [
      ['pending', 12840, t('Chưa đủ thời gian đối soát', 'Settlement period not yet complete')],
      ['reserve', 1500, t('Phần dự phòng không bị hold', 'Reserve excluding dispute holds')],
      ['hold', 500, t('Nằm trong tổng dự phòng $20', 'Included in the $20 total reserve')],
      ['sending', 3000, t('Chưa được xác nhận ghi có', 'Wallet credit not yet confirmed')],
      ['paid', 41000, t('Đã có xác nhận từ VlinkPay', 'Confirmed by VlinkPay')],
      ['adjustment', -5000, t('Lịch sử thu hồi đã xác nhận', 'Confirmed recovery history')],
      ['debt', 0, t('Không còn nghĩa vụ chưa bù', 'No outstanding recovery')]
    ];
    return `<section class="eq-hero"><div><span class="eq-muted">${t('Khả dụng để xét kỳ chi tiếp theo', 'Available for the next payout review')}</span><strong class="eq-amount" data-balance="available">$70.00</strong><p>${t('Đã loại dự phòng, hold và khoản đang chuyển; đã khấu trừ nghĩa vụ xác nhận.', 'After reserves, holds, funds in transfer and confirmed recovery deductions.')}</p>${button('payouts', t('Xem đối soát & nhận tiền →', 'View reconciliation & payouts →'))}</div><div class="eq-hero-side"><h3>${t('Kỳ xét chi tiếp theo', 'Next payout review')}</h3><strong>${date('2026-09-29')} · 00:00</strong><p class="eq-muted">America/Chicago · ${t('Mỗi thứ Ba', 'Every Tuesday')}</p><span>${t('Tối thiểu $25 sau khấu trừ. Ngày xét chi không phải cam kết tiền về ví.', 'Minimum $25 after deductions. Review date is not a guaranteed wallet credit date.')}</span></div></section>
      <section class="eq-metrics" aria-label="${t('Các khoản thu nhập', 'Earnings balances')}">${metrics.map(([key, cents, hint]) => `<article class="eq-metric"><span class="eq-small eq-muted">${labels()[key] || (key === 'debt' ? t('Còn phải bù', 'Outstanding recovery') : t('Điều chỉnh', 'Adjustments'))}</span><strong data-balance="${key}">${money(cents)}</strong><span class="eq-small eq-muted">${hint}</span></article>`).join('')}</section>
      <div class="eq-columns"><section class="eq-card"><h2>${t('Từ hoạt động đến thu nhập', 'From activity to earnings')}</h2><ol class="eq-list">${[
        [t('Hoạt động hợp lệ', 'Qualified activity'), t('Click tài trợ hoặc dịch vụ hoàn tất, đã thanh toán và có nguồn QR của doanh nghiệp.', 'Sponsored click or completed, paid service attributed to your Business QR.')],
        [t('Đối soát 14 ngày', '14-day settlement'), t('Áp dụng cho cả click và dịch vụ; Admin vận hành cấu hình cho khoản mới.', 'Applies to clicks and services; Operations configures the period for new earnings.')],
        [t('Dự phòng & khả dụng', 'Reserve & available'), t('Trích dự phòng một lần, bù nghĩa vụ đã xác nhận rồi xét số đủ chi.', 'Reserve once, offset confirmed recoveries, then review the payable balance.')],
        [t('Ghi có ví Business', 'Credit the Business wallet'), t('Chỉ ghi đã trả khi VlinkPay xác nhận giao dịch.', 'Mark as paid only after VlinkPay confirms credit.')]
      ].map(([title, copy], i) => `<li><span class="eq-step">${i + 1}</span><div><h3>${title}</h3><span class="eq-muted">${copy}</span></div></li>`).join('')}</ol></section><section class="eq-card">${wallet()}${note(t('Scan, mở menu, impression, click organic và nội dung Internal không tự tạo thu nhập.', 'Scans, menu opens, impressions, organic clicks and Internal content do not generate earnings.'))}${button('settings', t('Xem điều kiện kiếm tiền', 'Review monetization eligibility'))}</section></div>`;
  }
  function filters(includeStatus) {
    return `<div class="eq-filters">${select('period-filter', t('Kỳ ghi nhận', 'Recorded period'), { all: t('Tất cả kỳ', 'All periods'), '2026-09': t('Tháng 9 năm 2026', 'September 2026'), '2026-08': t('Tháng 8 năm 2026', 'August 2026') }, state.period)}${includeStatus ? select('status-filter', t('Trạng thái', 'Status'), { all: t('Tất cả trạng thái', 'All statuses'), pending: labels().pending, available: labels().available, hold: labels().hold, rejected: labels().rejected }, state.status) : ''}</div>`;
  }
  function activity() {
    const rows = activities.filter(a => (state.period === 'all' || a.date.startsWith(state.period)) && (state.status === 'all' || a.status === state.status));
    return `<section class="eq-card"><h2>${views().activity}</h2><p class="eq-muted">${t('Các hoạt động của Bitcoin Nail Bar. Số tiền là Publisher Share gốc; mở chi tiết để xem phân bổ, không cộng các dòng thành số dư.', 'Bitcoin Nail Bar activity. Amounts show original Publisher Share; open details for allocation, not a sum of current balances.')}</p>${filters(true)}<div class="eq-table-wrap" tabindex="0" role="region" aria-label="${t('Bảng dữ liệu thu nhập', 'Earnings data table')}"><table><thead><tr>${[t('Hoạt động / chiến dịch', 'Activity / campaign'), t('Ghi nhận', 'Recorded'), t('Phần chia', 'Share'), t('Trạng thái', 'Status'), t('Chi tiết', 'Details')].map(x => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(a => `<tr data-activity-row><td>${t(...a.type)}<small>${a.campaign}</small></td><td>${date(a.date)}</td><td><strong>${money(a.amount)}</strong></td><td>${badge(a.status)}</td><td><button class="eq-text-btn" data-detail="${a.id}">${a.id} →</button></td></tr>`).join('') || `<tr><td colspan="5">${t('Không có hoạt động trong bộ lọc này.', 'No activity matches these filters.')}</td></tr>`}</tbody></table></div>${note(t('Nguồn dịch vụ được khóa khi xác nhận booking/order. Quét QR khác sau đó không đổi nguồn; booking chưa hoàn tất chưa tạo thưởng.', 'Service attribution locks when a booking/order is confirmed. A later QR scan does not change it; an incomplete booking earns no service reward.'))}</section>`;
  }
  function reserves() {
    return `<div class="eq-columns"><section class="eq-card"><h2>${t('Dự phòng hoàn tiền / tranh chấp', 'Refund / dispute reserve')}</h2>${note(t('Tỷ lệ và thời hạn giữ dự phòng áp dụng theo chính sách được lưu cho từng khoản thu. Owner có thể xem chính sách do Admin cấu hình.', 'Reserve rates and holding periods follow the policy saved with each earning. Owners can view the policy configured by Operations.'), true)}<dl class="eq-breakdown">${pair(t('Tổng đã trích', 'Total reserved'), '$60.00')}${pair(t('Còn giữ (gồm $5 hold)', 'Remaining (includes $5 hold)'), '$20.00')}${pair(t('Đã sử dụng / đảo', 'Used / reversed'), '$20.00')}${pair(t('Đã giải phóng', 'Released'), '$20.00')}</dl><p class="eq-small eq-muted" data-reserve-equation>$60.00 = $20.00 + $20.00 + $20.00</p><p>${t('Dự phòng đang ở Nexora, chưa được ghi có vào ví VlinkPay. Đây không phải phí bị mất.', 'Reserves remain on Nexora and have not been credited to VlinkPay. They are not a fee.')}</p></section>
      <section class="eq-card"><h2>${t('Thu hồi đã xác nhận · A-201', 'Confirmed recovery · A-201')}</h2><p>${t('Hoàn dịch vụ thuộc E-090, đã trả trong P-0915. Nghĩa vụ thu hồi $50 sau khi đã xử lý phần chưa trả.', 'Service refund for E-090, previously paid in P-0915. $50 recovery remains after the unpaid portion was handled.')}</p><dl class="eq-breakdown">${pair(t('Dùng dự phòng hợp lệ trước · R-098', 'Eligible reserve first · R-098'), '$20.00')}${pair(t('Khấu trừ khả dụng tiếp theo', 'Then deduct from available'), '$30.00')}${pair(t('Còn phải bù kỳ sau', 'Carry-forward recovery'), '$0.00')}</dl><p class="eq-small eq-muted">${date('2026-09-21')} · ${t('Đã xử lý · tuổi nợ 0 ngày', 'Resolved · recovery age 0 days')}</p>${note(t('Không trừ lại $50 lần nữa, không sửa lịch sử đã trả và không tự trừ ví VlinkPay. Nếu đính chính, ghi hoàn nguyên về đúng nguồn.', 'Do not deduct $50 again, change paid history or debit VlinkPay. A correction restores the original sources through linked entries.'))}</section></div>
      <section class="eq-card"><h2>${t('Lịch giữ & giải phóng', 'Reserve release schedule')}</h2><div class="eq-table-wrap" tabindex="0" role="region" aria-label="${t('Bảng dữ liệu thu nhập', 'Earnings data table')}"><table><thead><tr>${[t('Khoản gốc', 'Original earning'), t('Đã trích', 'Reserved'), t('Còn giữ', 'Remaining'), t('Đã dùng', 'Used'), t('Đã giải phóng', 'Released'), t('Dự kiến giải phóng', 'Expected release')].map(x => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody><tr><td>R-101 · E-101<small>${t('Trích ngày', 'Reserved on')} ${date('2026-09-21')}</small></td><td>$20.00</td><td>$20.00<small>${t('Trong đó $5 hold · E-104', 'Includes $5 hold · E-104')}</small></td><td>$0.00</td><td>$0.00</td><td>${date('2026-10-21')}<small>${t('$15 xét giải phóng; $5 chờ kết luận', '$15 reviewed for release; $5 pending resolution')}</small></td></tr><tr><td>R-098 · E-098<small>${t('Trích ngày', 'Reserved on')} ${date('2026-08-22')}</small></td><td>$40.00</td><td>$0.00</td><td>$20.00<small>A-201</small></td><td>$20.00</td><td>${date('2026-09-21')}<small>${t('Đã hoàn tất', 'Completed')}</small></td></tr></tbody></table></div>${note(t('Đến hạn, chỉ giữ phần tranh chấp liên quan; giải phóng phần đủ điều kiện vào khả dụng. Không trích dự phòng lại trên khoản giải phóng, chuyển kỳ hoặc payout thử lại. Tắt kiếm tiền không dừng lịch này.', 'At maturity, only the disputed portion stays held; eligible funds become available. Released funds, carry-forward balances and payout retries are never reserved again. Disabling monetization does not stop this schedule.'))}</section>
      <details class="eq-card"><summary>${t('Khi dự phòng không đủ thì sao?', 'What happens when reserves are insufficient?')}</summary><p>${t('Sau khi dùng dự phòng, bù từ khả dụng. Phần thiếu chuyển sang thu nhập kỳ sau, có ngày phát sinh và tuổi nợ để vận hành theo dõi. Không tự xóa khi tắt kiếm tiền.', 'After reserves, recover from available earnings. Any shortfall carries into future earnings, with an origin date and age for Operations. Disabling monetization does not erase it.')}</p></details>`;
  }
  function payoutView() {
    const rows = payouts.filter(p => state.period === 'all' || p.date.startsWith(state.period));
    return `<div class="eq-columns"><section class="eq-card"><h2>${t('Đối soát số khả dụng', 'Available balance reconciliation')}</h2><dl class="eq-breakdown">${pair(t('Khả dụng chuyển kỳ', 'Available carried forward'), '$30.00')}${pair(t('Publisher Share mới qua đối soát', 'Newly settled Publisher Share'), '+ $100.00')}${pair(t('Dự phòng mới trích', 'New reserve'), '− $20.00')}${pair(t('Dự phòng được giải phóng', 'Reserve released'), '+ $20.00')}${pair(t('Khấu trừ khả dụng · A-201', 'Available deduction · A-201'), '− $30.00')}${pair(t('Đã đưa vào P-0922', 'Allocated to P-0922'), '− $30.00')}${pair(t('Còn khả dụng để xét chi', 'Available for payout review'), '$70.00', 'eq-total')}</dl>${note(t('Đã dùng riêng $20 dự phòng cho A-201; không khấu trừ lại vào bảng khả dụng. $70 đạt ngưỡng $25, còn phụ thuộc hồ sơ/ví ở kỳ xét chi.', '$20 of reserve was separately used for A-201; it is not deducted again here. $70 meets the $25 threshold, subject to profile/wallet eligibility at review.'))}</section><section class="eq-card">${wallet()}<hr><p><strong>${t('Thứ Ba · 00:00 America/Chicago', 'Tuesday · 00:00 America/Chicago')}</strong></p><p>${t('Tự động xét chi khi đủ điều kiện. Dưới $25 được chuyển kỳ, không trích dự phòng lại. Owner không tự tạo hoặc thử lại giao dịch chuyển tiền.', 'Automatic review when eligible. Balances below $25 carry forward without another reserve. Owners do not create or retry transfers themselves.')}</p></section></div>
      <section class="eq-card"><h2>${t('Lịch sử nhận tiền', 'Payout history')}</h2>${filters(false)}<div class="eq-table-wrap" tabindex="0" role="region" aria-label="${t('Bảng dữ liệu thu nhập', 'Earnings data table')}"><table><thead><tr>${[t('Kỳ chi', 'Payout batch'), t('Thời điểm xét chi', 'Review date'), t('Số tiền', 'Amount'), t('Trạng thái', 'Status'), t('Tham chiếu ví', 'Wallet reference')].map(x => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(p => `<tr data-payout-status="${p.status}"><td><button class="eq-text-btn" data-detail="${p.id}">${p.id} →</button></td><td>${date(p.date)}<small>00:00 America/Chicago</small></td><td>${money(p.amount)}</td><td>${badge(p.status)}</td><td>${p.walletRef}</td></tr>`).join('') || `<tr><td colspan="5">${t('Chưa có kỳ chi phù hợp.', 'No payout batches in this period.')}</td></tr>`}</tbody></table></div>${note(t('Chỉ P-0915 đã được xác nhận ghi có ($410). P-0922 chưa rõ kết quả, không cộng vào đã trả. P-0908 đã được xử lý lại trong P-0915, không cộng hai lần.', 'Only P-0915 has confirmed wallet credit ($410). P-0922 has an unknown outcome and is not counted as paid. P-0908 was retried in P-0915 and is not counted twice.'))}</section>`;
  }
  function settings() {
    const checks = [
      ['KYB', t('Đã xác minh · kế thừa hồ sơ Business', 'Verified · inherited from the Business profile'), eligibility.kyb],
      [t('Thông tin thuế', 'Tax information'), t('Đã hoàn tất', 'Complete'), eligibility.tax],
      [t('Quyền nguồn QR & bảo mật', 'QR ownership & security'), t('Owner được xác nhận · xác thực hai bước đã bật', 'Owner verified · two-factor authentication enabled'), eligibility.qrOwnership && eligibility.security],
      ['VlinkPay SSO', t('Đã xác nhận ví Business •••• 8841', 'Business wallet •••• 8841 verified'), eligibility.wallet]
    ];
    return `<div class="eq-columns"><section class="eq-card"><h2>${t('Điều kiện tham gia', 'Participation requirements')}</h2><ul class="eq-list" data-eligibility>${checks.map(([label, description, ok]) => `<li><span class="eq-step">${ok ? '✓' : '!'}</span><div><h3>${label}</h3><span class="eq-muted">${description}</span></div></li>`).join('')}</ul><p class="eq-small eq-muted">${t('Dùng kết quả xác minh hiện có. Đăng nhập SSO thành công chưa đủ để xác nhận ví có thể nhận tiền.', 'Uses existing verification results. Successful SSO sign-in alone does not establish wallet credit eligibility.')}</p></section>
      <section class="eq-card"><h2>${t('Bật kiếm tiền cho Business', 'Enable Business monetization')}</h2><p>${t('Chấp thuận chính sách áp dụng cho Bitcoin Nail Bar.', 'Accept the policy for Bitcoin Nail Bar.')}</p><p>${policyLink()}</p>${note(t('Dự phòng được trích một lần trên Publisher Share sau đối soát. Tỷ lệ và thời hạn giữ theo chính sách áp dụng; phần còn lại được giải phóng khi đến hạn và không còn hold hoặc nghĩa vụ thu hồi.', 'Reserves are deducted once from Publisher Share after settlement. Rates and holding periods follow the applicable policy; remaining funds are released at maturity once holds and recovery obligations are cleared.'), true)}<label class="eq-consent"><input type="checkbox" id="consent"${state.consent ? ' checked' : ''}${state.enabled ? ' disabled' : ''}><span>${t('Tôi hiểu thu nhập chỉ từ hoạt động hợp lệ, có thể bị giữ, đảo hoặc thu hồi khi hoàn tiền, tranh chấp hoặc gian lận. Tôi chịu trách nhiệm về hồ sơ, thuế và cách đặt QR; đồng ý chính sách dự phòng và thứ tự thu hồi: dự phòng hợp lệ → khả dụng → thu nhập kỳ sau.', 'I understand that only qualified activity earns income, which may be held, reversed or recovered for refunds, disputes or fraud. I am responsible for my profile, taxes and QR placement; I accept the reserve policy and recovery order: eligible reserve → available → future earnings.')}</span></label><button class="eq-primary" data-action="toggle"${!state.enabled && !(state.consent && eligible()) ? ' disabled' : ''}>${state.enabled ? t('Tắt kiếm tiền', 'Turn off monetization') : t('Đồng ý & bật kiếm tiền', 'Accept & enable monetization')}</button>${state.enabled ? `<button type="button" data-view="ads">${t('Cấu hình vị trí quảng cáo →', 'Configure ad placements →')}</button>` : ''}<p class="eq-small eq-muted" data-consent-audit data-policy-version="${state.audit ? policy : ''}">${state.audit ? `${t('Chấp thuận bởi', 'Accepted by')} Business Owner · ${escape(new Intl.DateTimeFormat(state.lang === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Chicago' }).format(new Date(state.audit)))} America/Chicago · ${policyLink()}` : t('Chưa ghi nhận chấp thuận. Ô đồng ý không được chọn sẵn.', 'No consent recorded. Acceptance is never preselected.')}</p>${note(t('Tắt chỉ dừng ghi nhận hoạt động mới. Tiện ích OneQR, Nearby/Search và bảo vệ đối thủ vẫn hoạt động; khoản đã khóa hợp lệ, dự phòng và công nợ tiếp tục xử lý. Không cộng hồi tố click lúc tắt.', 'Turning off stops new earning activity. OneQR utilities, Nearby/Search and competitor protection remain; valid locked earnings, reserves and recoveries continue. Clicks while disabled are not rewarded retroactively.'))}</section></div>
      <section class="eq-card"><h2>${t('Cách tính Publisher Share', 'How Publisher Share is calculated')}</h2><p class="eq-small eq-muted">${policyLink()} · ${t('Chính sách hiển thị chỉ đọc; lưu theo từng khoản thu.', 'Read-only policy, saved with each earning.')}</p><div class="eq-table-wrap" tabindex="0" role="region" aria-label="${t('Bảng dữ liệu thu nhập', 'Earnings data table')}"><table><thead><tr><th scope="col">${t('Hoạt động', 'Activity')}</th><th scope="col">${t('Phí Advertiser', 'Advertiser fee')}</th><th scope="col">${t('Phần Business', 'Business share')}</th></tr></thead><tbody>${[
        [t('Click banner tài trợ', 'Sponsored banner click'), '$0.40', '40% ($0.16)'],
        [t('Click card Nearby / Explore', 'Nearby / Explore card click'), '$0.25', '35%'],
        [t('Click card Search Deals', 'Search Deals card click'), '$0.30', '35%'],
        [t('Dịch vụ — khách mới', 'Service — new customer'), '10%', t('50% phí dịch vụ hợp lệ', '50% of performance fee')],
        [t('Khách quay lại ≥ 90 ngày, campaign cho phép', 'Returning ≥ 90 days, campaign enabled'), '5%', t('50% phí dịch vụ hợp lệ', '50% of performance fee')]
      ].map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="eq-small eq-muted">${t('Cơ sở phí dịch vụ là giá sau giảm giá, không gồm thuế, tip, phụ phí, retail, gift card lúc bán hoặc phần hoàn. Phần chia lẻ dưới một cent hiển thị theo kết quả đối soát; chưa tự đặt quy tắc làm tròn. Không mặc định cộng cả phí click và dịch vụ trên cùng hành trình.', 'Service fees use discounted eligible service value, excluding tax, tips, surcharges, retail, gift card sales and refunds. Fractional-cent shares use confirmed settlement results; rounding is not assumed. Click and service fees are not automatically stacked on one journey.')}</p><p>${t('Không cần nạp Ads Credit hoặc mời thêm tài khoản để tham gia. Bảo vệ đối thủ vẫn áp dụng cho quảng cáo trả phí.', 'No Ads Credit purchase or account referrals are required. Competitor protection also applies to paid advertisements.')}</p></section>`;
  }
  function adChoice(key, value, vi, en) {
    return `<button type="button" data-ad-setting="${key}" data-value="${value}" class="${state.ads[key] === value ? 'on' : ''}" aria-pressed="${state.ads[key] === value}">${t(vi, en)}</button>`;
  }
  function ads() {
    const a = state.ads;
    const partner = a.scan % 2 ? ['Saigon Kitchen', '$5 lunch combo', '0.7 mi'] : ['Boba House', 'Buy 1 get 1 milk tea', '0.4 mi'];
    const discovery = `<div class="eq-ad-discovery ${a.discovery === 'plain' ? 'is-plain' : ''}"><button type="button"><span class="eq-ad-discovery-icon">⌖</span><span><strong>${a.discovery === 'rich' ? '12 ' : ''}${t('Ưu đãi gần đây', 'Deals Nearby')}</strong><small>${a.discovery === 'rich' ? t(a.time === 'morning' ? '☕ Cà phê, bánh quanh đây' : a.time === 'lunch' ? '🍜 Ăn trưa quanh đây' : a.time === 'aft' ? '🧋 Giải khát quanh đây' : '🌙 Tối nay quanh đây', a.time === 'morning' ? '☕ Coffee & breakfast nearby' : a.time === 'lunch' ? '🍜 Lunch deals around here' : a.time === 'aft' ? '🧋 Afternoon treats nearby' : '🌙 Deals for tonight') : t('Khám phá quanh bạn', 'Explore around you')}</small></span></button><button type="button"><span class="eq-ad-discovery-icon">⌕</span><span><strong>${t('Tìm ưu đãi', 'Search Deals')}</strong><small>${a.discovery === 'rich' ? t(a.time === 'eve' ? 'Thử “ăn tối nay”' : 'Thử “massage dưới $50”', a.time === 'eve' ? 'Try “dinner tonight”' : 'Try “massage under $50”') : t('Tìm theo nhu cầu', 'Search what you need')}</small></span></button></div>`;
    const hero = a.placements.hero ? `<div class="eq-ad-hero ${a.cross === 'off' ? 'own-only' : ''}"><article><span>${t('ƯU ĐÃI CỦA TIỆM', 'AT THIS SALON')}</span><h3>${t('Nâng cấp pedicure: đá nóng + mặt nạ', 'Hot stone pedicure upgrade')}</h3><p>${t('Đang áp dụng · T3–T5', 'Available · Tue–Thu')}</p><div><button type="button">${t('Xem ưu đãi', 'View deal')}</button><b>+$15</b></div></article>${a.cross === 'on' ? `<article><span>${a.mode === 'split' ? t('ĐỐI TÁC GẦN ĐÂY', 'NEARBY PARTNER') : t('ĐANG XOAY VÒNG 50/50', 'ROTATING 50/50')}</span><h3>${partner[0]} · ${partner[1]}</h3><p>${t('Đã qua bộ lọc đối thủ', 'Competitor filter applied')}</p><div><button type="button">${t('Xem ưu đãi', 'View deal')}</button><b>${partner[2]}</b></div></article>` : ''}</div>` : '';
    const menu = `<div><span class="eq-ad-section-label">${t('MENU TIỆM', 'SALON MENU')}</span><div class="eq-ad-menu"><button type="button"><i>✓</i>${t('Check-in', 'Check-in')}</button><button type="button"><i>▦</i>${t('Đặt lịch', 'Booking')}</button><button type="button"><i>≡</i>${t('Dịch vụ', 'Services')}</button><button type="button"><i>☆</i>${t('Đánh giá', 'Review')}</button></div></div>`;
    const sponsored = a.placements.nearby ? `<div><span class="eq-ad-section-label">⭐ ${t('ĐƯỢC TÀI TRỢ · GẦN ĐÂY', 'SPONSORED · NEARBY')}</span><button type="button" class="eq-ad-sponsored"><span>SK</span><span><strong>${t('$5 giảm combo ăn trưa', '$5 off lunch combo')}</strong><small>Saigon Kitchen · 0.7 mi</small><em>${t('Được tài trợ', 'Sponsored')}</em></span></button></div>` : '';
    const ordered = a.order === 'cur' ? discovery + hero + menu + sponsored : hero + menu + sponsored + discovery;
    return `<section class="eq-ad-page">
      <header class="eq-ad-heading"><div><span>ONEQR · ${t('TẠI TIỆM', 'IN-SALON')}</span><h2>${t('Cấu hình quảng cáo & kiếm tiền', 'Advertising & monetization settings')}</h2><p>${t('Điều chỉnh trải nghiệm khách quét OneQR tại Bitcoin Nail Bar.', 'Control the experience for guests scanning Bitcoin Nail Bar’s OneQR.')}</p></div><div>${badge(state.enabled ? 'enabled' : 'disabled')}${state.enabled ? `<button type="button" data-action="toggle">${t('Tắt kiếm tiền', 'Turn off monetization')}</button>` : `<button type="button" class="eq-primary" data-view="settings">${t('Bật kiếm tiền', 'Enable monetization')}</button>`}</div></header>
      <div class="eq-ad-layout">
        <div class="eq-ad-phone-wrap"><div class="eq-ad-phone"><div class="eq-ad-screen"><div class="eq-ad-phone-body"><div class="eq-ad-phone-head"><span>9:41</span><b>OneQR</b><span>●●●</span></div><div class="eq-ad-account"><button type="button">${t('Đăng nhập', 'Log in')}</button><button type="button">${t('Đăng ký', 'Sign up')}</button></div><div class="eq-ad-business"><span>BN</span><div><strong>Bitcoin Nail Bar</strong><small>Houston · Westheimer</small></div></div><div class="eq-ad-preview ${a.order === 'ad' ? 'is-recommended' : ''}">${ordered}</div>${!state.enabled ? `<div class="eq-ad-off"><strong>${t('Quảng cáo đang tắt', 'Sponsored ads are off')}</strong><small>${t('Bạn vẫn có thể xem trước cấu hình trước khi bật.', 'You can still preview the setup before enabling it.')}</small></div>` : ''}</div><nav><button type="button" class="on">⌂<small>${t('Menu chính', 'Main Menu')}</small></button><button type="button">⌖<small>${t('Gần đây', 'Nearby')}</small></button><button type="button">▦<small>${t('Đặt lịch', 'Booking')}</small></button></nav></div></div></div>
        <div class="eq-ad-controls">
          <section class="eq-ad-panel"><h3>🎛️ ${t('Điều khiển màn hình', 'Experience controls')}</h3><label>${t('Thứ tự trang chính', 'Main page order')}</label><div class="eq-ad-choices">${adChoice('order', 'cur', '① Bản hiện tại · khám phá lên trên', '① Current · discovery first')}${adChoice('order', 'rec', '② Khám phá xuống dưới', '② Discovery below')}${adChoice('order', 'ad', '③ Đề xuất · thanh gọn + tài trợ', '③ Recommended · compact + sponsored')}</div><label>${t('Banner hero — quảng cáo chéo', 'Hero banner — cross-promotion')}</label><div class="eq-ad-choices">${adChoice('cross', 'on', 'Tiệm bật quảng cáo chéo', 'Cross-promotion on')}${adChoice('cross', 'off', 'Chỉ quảng cáo của tiệm', 'Salon promotions only')}</div><div class="eq-ad-choices">${adChoice('mode', 'split', '50/50 chia đôi', '50/50 split')}${adChoice('mode', 'rotate', '50/50 xoay vòng', '50/50 rotation')}<button type="button" data-ad-action="scan">↻ ${t('Lượt quét mới', 'New scan')}</button></div><label>${t('Deals Nearby · Search Deals', 'Deals Nearby · Search Deals')}</label><div class="eq-ad-choices">${adChoice('discovery', 'plain', 'Cơ bản', 'Basic')}${adChoice('discovery', 'rich', 'Hấp dẫn · nội dung thật', 'Rich · live content')}</div><label>${t('Ngày khách quét (demo)', 'Guest scan day (demo)')}</label><div class="eq-ad-choices eq-ad-days">${[['1','T2','Mon'],['2','T3','Tue'],['3','T4','Wed'],['4','T5','Thu'],['5','T6','Fri'],['6','T7','Sat'],['0','CN','Sun']].map(([value,vi,en])=>adChoice('day',value,vi,en)).join('')}</div><label>${t('Giờ khách quét (demo)', 'Guest scan time (demo)')}</label><div class="eq-ad-choices">${adChoice('time', 'morning', '☕ Sáng 9:30', '☕ Morning 9:30')}${adChoice('time', 'lunch', '🍜 Trưa 12:30', '🍜 Lunch 12:30')}${adChoice('time', 'aft', '🧋 Chiều 3:30', '🧋 Afternoon 3:30')}${adChoice('time', 'eve', '🌙 Tối 6:30', '🌙 Evening 6:30')}</div><label>${t('Bộ lọc đối thủ trên QR của tiệm', 'Competitor filter on this salon QR')}</label><div class="eq-ad-choices">${adChoice('competitor', 'group', 'Chặn nhóm Làm đẹp', 'Block Beauty group')}${adChoice('competitor', 'industry', 'Chỉ chặn ngành Nail', 'Block Nail only')}${adChoice('competitor', 'off', 'Tắt', 'Off')}</div></section>
          <section class="eq-ad-panel"><h3>🤖 ${t('Quảng cáo chéo tự động', 'Automatic cross-promotion')}</h3><p>${t('Chủ tiệm chỉ bật một lần. Nexora ghép các doanh nghiệp gần đó cũng đã bật, tự loại đối thủ và ngành nhạy cảm.', 'Opt in once. Nexora matches nearby businesses that also opted in, filtering competitors and sensitive categories.')}</p><div class="eq-ad-choices">${adChoice('radius', 'auto', 'Tự động: 1 mi → 2 mi', 'Automatic: 1 mi → 2 mi')}${adChoice('radius', '1', 'Chỉ 1 mi', 'Only 1 mi')}${adChoice('radius', '2', 'Tối đa 2 mi', 'Up to 2 mi')}</div><div class="eq-ad-radius"><strong>${t('Bán kính đang dùng', 'Active radius')}</strong><span>${a.radius === 'auto' ? t('1 mi · tự nới khi chưa đủ đối tác', '1 mi · expands when more partners are needed') : a.radius + ' mi'}</span></div><ul><li>${t('Mỗi đối tác một deal đang áp dụng.', 'One active deal per partner.')}</li><li>${t('Paid Boost lấp chỗ khi chưa đủ đối tác.', 'Paid Boost fills empty partner slots.')}</li><li>${t('Tiệm luôn có thể ẩn một doanh nghiệp.', 'The salon can always hide a business.')}</li></ul></section>
          <section class="eq-ad-panel"><h3>💰 ${t('Vị trí tạo thu nhập', 'Earning placements')}</h3><div class="eq-ad-placement-list">${[['hero','Banner hero 50/50'],['nearby',t('Ô tài trợ dưới menu','Sponsored card below menu')],['wait',t('Màn chờ sau check-in','Waiting screen after check-in')],['complete',t('Sau booking · review · tip','After booking · review · tip')]].map(([key,label])=>`<label><input type="checkbox" data-ad-placement="${key}"${a.placements[key] ? ' checked' : ''}><span>${label}</span></label>`).join('')}</div><p class="eq-ad-rule">${t('Quảng cáo không bao giờ tự chuyển khách đi và không xuất hiện khi khách đang chọn dịch vụ của tiệm.', 'Ads never auto-redirect guests and never appear while they are choosing salon services.')}</p><button type="button" class="eq-primary" data-ad-action="save">${t('Lưu cài đặt quảng cáo', 'Save ad settings')}</button><span class="eq-ad-save-status" role="status">${state.adSaved ? t('Đã lưu cho Bitcoin Nail Bar.', 'Saved for Bitcoin Nail Bar.') : t('Thay đổi chỉ áp dụng sau khi lưu.', 'Changes apply after saving.')}</span></section>
        </div>
      </div>
    </section>`;
  }
  function render() {
    document.documentElement.lang = state.lang;
    root.setAttribute('aria-label', t('Thu nhập OneQR', 'OneQR Earnings'));
    const mode = state.enabled ? 'enabled' : 'disabled';
    const content = ({ overview, ads, activity, reserves, payouts: payoutView, settings }[state.view])();
    root.innerHTML = `<div class="eq-top"><div><a href="qr-stations.html?tab=one-qr">← ${t('Cấu hình OneQR', 'OneQR configuration')}</a><h1>${t('Thu nhập OneQR', 'OneQR Earnings')}</h1><span class="eq-muted">Bitcoin Nail Bar · Business Owner</span></div><div class="eq-tools">${select('language', t('Ngôn ngữ', 'Language'), { en: 'English', vi: 'Tiếng Việt' }, state.lang)}</div></div>
      ${state.enabled ? `<div class="eq-row"><span data-monetization-status="${mode}">${badge(mode)}</span><div class="eq-row">${button('ads', t('Cài đặt quảng cáo', 'Ad settings'))}${button('settings', t('Quản lý kiếm tiền', 'Manage monetization'))}</div></div>` : `<section class="eq-monetization-off" aria-labelledby="monetization-off-title">
        <span class="eq-monetization-off-icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 8v8m6-8v8"/></svg></span>
        <div><h2 id="monetization-off-title" data-monetization-status="disabled">${labels().disabled}</h2><p>${t('Bật kiếm tiền để nhận thu nhập từ các hoạt động OneQR đủ điều kiện.', 'Enable monetization to earn from eligible OneQR activity.')}</p><p class="eq-monetization-off-note">${t('Các khoản đã ghi nhận hợp lệ vẫn tiếp tục đối soát và chi trả theo chính sách.', 'Previously recorded valid earnings continue through settlement and payout under their saved policies.')}</p></div>
        <button class="eq-primary" type="button" data-view="settings">${t('Bật kiếm tiền', 'Enable monetization')} <span aria-hidden="true">→</span></button>
      </section>`}
      <div class="eq-mobile-nav">${select('earnings-view', t('Mục thu nhập', 'Earnings section'), views(), state.view)}</div>
      <nav class="eq-nav" aria-label="${t('Quản lý thu nhập', 'Earnings navigation')}">${Object.entries(views()).map(([key, text]) => `<button data-view="${key}"${key === state.view ? ' aria-current="page"' : ''}>${text}</button>`).join('')}</nav><div id="earnings-content">${content}</div>`;
    root.querySelectorAll('table').forEach(table => {
      table.setAttribute('role', 'table');
      const headers = Array.from(table.querySelectorAll('th'), th => th.textContent.trim());
      table.querySelectorAll('tr').forEach(row => row.setAttribute('role', 'row'));
      table.querySelectorAll('th').forEach(th => th.setAttribute('role', 'columnheader'));
      table.querySelectorAll('tbody tr').forEach(row => Array.from(row.cells).forEach((cell, i) => {
        cell.setAttribute('role', 'cell');
        if (cell.colSpan === 1) cell.dataset.label = headers[i];
      }));
    });
  }
  let opener = null;
  function detail(id) {
    const a = activities.find(item => item.id === id);
    const p = payouts.find(item => item.id === id);
    if (!a && !p) return;
    opener = document.activeElement;
    const item = a || p;
    dialog.innerHTML = `<div class="eq-row"><h2 id="detail-title">${t('Chi tiết', 'Details')} · ${id}</h2><button data-action="close" aria-label="${t('Đóng', 'Close')}">×</button></div><p>${badge(item.status)}</p><dl class="eq-breakdown">${pair(t('Business / nguồn', 'Business / source'), 'Bitcoin Nail Bar — Main · QR-001')}${pair(t('Ghi nhận', 'Recorded'), date(item.date))}${pair(t('Số tiền', 'Amount'), money(item.amount))}${a ? pair(t('Chiến dịch', 'Campaign'), a.campaign) + pair(t('Căn cứ tính', 'Calculation basis'), t(...a.basis)) + pair(t('Ngày đủ điều kiện dự kiến', 'Expected eligibility date'), a.due ? date(a.due) : '—') : pair(t('Giao dịch Nexora', 'Nexora transaction'), p.ref) + pair(t('Giao dịch VlinkPay', 'VlinkPay transaction'), p.walletRef) + pair(t('Ví Business SSO', 'Business SSO wallet'), '•••• 8841')}${pair(t('Chính sách đã lưu', 'Saved policy'), policyLink())}</dl>${note(t(...item.note))}<p class="eq-small eq-muted">${t('Chỉ hiển thị thông tin thuộc quyền Business, không hiển thị hồ sơ khách hoặc hóa đơn ngoài quyền.', 'Only Business-authorized information is shown; no outside customer profiles or invoices.')}</p>`;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    dialog.querySelector('button').focus();
  }
  root.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.view) {
      state.view = target.dataset.view; state.period = 'all'; state.status = 'all'; render();
      const mobileNav = root.querySelector('#earnings-view');
      (mobileNav.offsetParent ? mobileNav : root.querySelector('.eq-nav [aria-current]')).focus();
    }
    if (target.dataset.detail) detail(target.dataset.detail);
    if (target.dataset.adSetting) {
      state.ads[target.dataset.adSetting] = target.dataset.value;
      state.adSaved = false;
      const selector = `[data-ad-setting="${target.dataset.adSetting}"][data-value="${target.dataset.value}"]`;
      render(); root.querySelector(selector)?.focus();
    }
    if (target.dataset.adAction === 'scan') {
      state.ads.scan += 1; state.adSaved = false; render(); root.querySelector('[data-ad-action="scan"]')?.focus();
    }
    if (target.dataset.adAction === 'save') {
      try { localStorage.setItem('nexora_oneqr_earnings_ads_v1', JSON.stringify(state.ads)); } catch (error) { /* Demo still works without storage. */ }
      state.adSaved = true; render(); root.querySelector('[data-ad-action="save"]')?.focus();
    }
    if (target.dataset.action === 'toggle') {
      if (!state.enabled && !(state.consent && eligible())) return;
      state.enabled = !state.enabled;
      if (state.enabled) state.audit = new Date().toISOString();
      render(); root.querySelector('[data-action="toggle"]')?.focus();
    }
  });
  root.addEventListener('change', event => {
    const { id, value, checked } = event.target;
    if (id === 'earnings-view') {
      if (!Object.hasOwn(views(), value)) return;
      state.view = value; state.period = 'all'; state.status = 'all';
    }
    else if (id === 'language') state.lang = value;
    else if (id === 'consent') state.consent = checked;
    else if (id === 'period-filter') state.period = value;
    else if (id === 'status-filter') state.status = value;
    else if (event.target.dataset.adPlacement) { state.ads.placements[event.target.dataset.adPlacement] = checked; state.adSaved = false; }
    else return;
    render();
    if (id) root.querySelector('#' + id)?.focus();
    else if (event.target.dataset.adPlacement) root.querySelector(`[data-ad-placement="${event.target.dataset.adPlacement}"]`)?.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-action="close"]')) {
      if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
      opener?.focus();
    }
  });
  dialog.addEventListener('close', () => opener?.focus());
  render();
})();
