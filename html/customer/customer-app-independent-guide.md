# NEXORA TOUCH Customer App — tài liệu độc lập

> Tài liệu bàn giao cho phạm vi `html/customer`. Nội dung mô tả hành vi sản phẩm, UI prototype hiện tại và ranh giới tích hợp để một người mới có thể tiếp tục phát triển mà không cần đọc toàn bộ mã nguồn trước.

## 1. Phạm vi và trạng thái

- **Sản phẩm:** NEXORA TOUCH — ứng dụng khách hàng cho doanh nghiệp dịch vụ.
- **Artifact chạy được:** [`cutomer-reward.html`](cutomer-reward.html).
- **Ngôn ngữ mặc định:** Tiếng Việt; có thể chuyển sang English ngay trong Profile.
- **Thiết kế:** mobile-first; mobile dùng bottom navigation, màn hình lớn dùng sidebar; Tailwind Browser CDN và Lucide CDN.
- **Trạng thái:** frontend prototype có persistence bằng `localStorage`, không phải backend production.
- **Ngày tài liệu:** 15/07/2026.

Prototype phải cho thấy đúng trạng thái nghiệp vụ (pending, confirmed, ready, expired), không được hiển thị thành công giả khi chưa có bước xác nhận tương ứng.

## 2. Các nguyên tắc nghiệp vụ bắt buộc

1. NEXORA **không giữ tiền**. Tip và thanh toán đi thẳng từ khách hàng tới doanh nghiệp/nhân viên qua phương thức được doanh nghiệp bật (Venmo, Zelle, Cash App, Apple Cash hoặc PayPal khi backend hỗ trợ).
2. NEXORA **không phát hành điểm**. Mỗi doanh nghiệp chịu trách nhiệm số dư và nghĩa vụ điểm của chính mình; ledger NEXORA chỉ ghi nhận giao dịch.
3. Điểm không rút thành tiền, không chuyển nhượng, không bán; chỉ dùng để đổi dịch vụ/ưu đãi trong phạm vi cho phép.
4. Mỗi doanh nghiệp tự cấu hình cách tích điểm, đổi điểm, hạn dùng và liên minh trao đổi.
5. Mỗi lượt đánh giá riêng tư hợp lệ được cộng **+15 điểm**. Chia sẻ sang Google là tùy chọn và không cộng điểm; không được khóa điểm vì khách không chia sẻ Google.
6. SMS/marketing tuân thủ TCPA: double opt-in, consent có timestamp, STOP/HELP, consent là tùy chọn và không phải điều kiện nhận điểm.
7. Booking chỉ là **yêu cầu đặt lịch**; không thu tiền tức thời. Chỉ khi doanh nghiệp xác nhận mới chuyển sang `confirmed`.
8. Marketplace tuyển dụng nhân viên là phạm vi khác. Trong app khách hàng chỉ có Explore, follow-tech đủ điều kiện và thông báo salon mới.

## 3. Điều hướng và màn hình

### 3.1 Năm tab gốc

| Tab | Screen ID | Vai trò |
|---|---|---|
| Home | `home` | Số dư, lịch hẹn, hoạt động, quick actions, ưu đãi |
| Wallet | `wallet` | Số dư theo từng doanh nghiệp |
| Scan | `scan` | Check-in bằng QR |
| Explore | `explore` | Tìm doanh nghiệp, ưu đãi và trust signals |
| Profile | `profile` | Hồ sơ, ngôn ngữ, quyền riêng tư, referral |

### 3.2 Inventory đầy đủ (31 screen ID)

| Nhóm | Screen ID |
|---|---|
| Đăng nhập/onboarding | `login1`, `login2`, `onb1`, `onb2`, `onb3`, `onb4` |
| Home và tiện ích | `home`, `allmenu`, `activity`, `offers`, `book1`, `book2`, `book3` |
| Ví và phần thưởng | `wallet`, `history`, `rewards`, `redeem`, `redeemdone` |
| Scan và thanh toán | `scan`, `tip`, `tipdone`, `pay`, `paydone` |
| Looks và feedback | `looks`, `addlook`, `review` |
| Khám phá | `explore`, `business` |
| Hồ sơ | `profile`, `referral`, `msgprefs` |

Các ID trên là contract giữa renderer, navigation và test harness; không đổi tên tùy tiện. Screen `business` lấy doanh nghiệp từ `state.ui.selectedBusinessId`.

## 4. Luồng người dùng chính

### 4.1 Đăng nhập và onboarding

- `login1`: chuẩn hóa số điện thoại Mỹ, gửi OTP và bắt đầu cooldown gửi lại 30 giây.
- `login2`: xác thực OTP; tối đa 5 lần trong 15 phút, sau đó khóa tạm thời.
- `onb1`: người dùng nhập số điện thoại để nhận quà chào mừng do doanh nghiệp tài trợ.
- `onb2`: chọn consent theo hai scope `business` và `network`; Agree cần ít nhất một scope, Skip vẫn giữ điểm nhưng không bật marketing.
- `onb3`: double opt-in; consent chưa xác nhận vẫn giữ điểm chào mừng.
- `onb4`: xin quyền push sau onboarding; người dùng có thể cấp hoặc để sau.

### 4.2 Home, Wallet, Rewards và redeem

- Wallet luôn hiển thị **tách theo doanh nghiệp**, không cộng thành một ví chung.
- `history` lọc theo business, lấy dữ liệu từ append-only `ledger`.
- `rewards` hiển thị reward của doanh nghiệp hiện tại và reward liên minh đủ điều kiện.
- `redeem` kiểm tra đủ điểm, cùng alliance, idempotency key và debit nguyên tử.
- `redeemdone` là receipt có QR payload và trạng thái `ready → used → expired`; chỉ doanh nghiệp mới xác nhận sử dụng.
- Hạn điểm phải hiển thị rõ số điểm và ngày hết hạn; không tự ý đổi rule của doanh nghiệp.

### 4.3 Scan/check-in

QR hợp lệ có dạng chính xác:

```text
https://nexoratouch.com/touch/[businessId]/[station]?staffProfileId=...
```

Parser phải từ chối origin khác, HTTP, host/path thừa, fragment, credential, tham số lạ, station/business/staff không hợp lệ. Check-in ghi timestamp; khi offline đưa vào `offlineQueue`, khi có mạng retry. Service check-in submit lại với exact business/station/name/phone/service/staff trong cửa sổ 120 phút reuse đúng một record canonical; nhiều record khớp hoặc record hỏng fail closed. Service khác trong cửa sổ và cùng service từ phút 120 trở đi tạo lượt mới.

**Bộ định tuyến ngữ cảnh QR (QR context router)** không đoán mục đích từ `station`. QR chỉ resolve business/station/staff tùy chọn, rồi `scan-context-view` đưa ra ba intent:

- Check-in: thành viên chỉ mở form đã prefill khi session/profile phone đã xác minh và khớp chính xác. Khi đăng xuất, CTA member bị khóa, toàn bộ tên/điểm/tóm tắt riêng dùng placeholder VI/EN và prefill hồ sơ cũ bị xóa; guest mở cùng form với tên/số điện thoại để trống. Cả hai tạo record canonical trong `guestCheckins` và mở Operations Live Ticket.
- Tip: chỉ bật khi QR có staff canonical và staff đã bật ít nhất một phương thức; helper re-parse QR khi prefill và khi tạo tip để không tin selector DOM. `tipEntryIntent`, `tipScanReplayId` và fingerprint context được persist: double-send, reload, lỗi điều hướng hoặc quét lại cùng QR trong lúc tip còn pending đều reuse đúng transaction. Trước same/different, app validate atomic prior context exact, fingerprint binding, unique canonical tip, `tipId` và target; bundle hỏng trả `invalid_tip_replay` trước mutation. Chỉ pending bundle hợp lệ mới được reuse cùng QR hoặc nhường authority cho QR canonical khác; terminal bundle hợp lệ cho phép lượt mới. Vì vậy hoán đổi đồng thời context/fingerprint hay chuỗi QR B → A không rửa được replay. URL không mang replay authority.
- Payment: chỉ hiện candidate có exact ticket `completed` đúng business. Join dùng `guestCheckinId`/`ticketId`, không dùng tên hoặc số điện thoại hiển thị; action đọc lại Operations snapshot ngay lúc click. Candidate chưa sở hữu phải **ẩn/opaque ticket, dịch vụ và số tiền cho tới khi xác minh 4 số cuối**; input được lọc còn 4 chữ số, CTA bị khóa khi chưa đủ và mismatch hiển thị inline. Last-4/error bị xóa khi canonical scan context/selected guest đổi hoặc cùng candidate trở thành owned sau OTP; rerender cùng identity chỉ giữ input khi vẫn chưa owned. Session/profile đã xác thực đúng phone thì được miễn.

Ticket `in_service` không thể mở checkout. Re-entry checkout draft mở `pay`; pending/confirmed/rejected mở đúng view trong `paydone`. `ui.payViewIntent` lưu explicit checkout/direct-pay intent trước reload: scan/handoff re-arm checkout, còn navigation Pay Salon Direct ghi direct nên một draft cũ không kéo khách ngược vào checkout. Context thiếu/stale/corrupt về direct pay an toàn. Không tạo checkout hoặc proof thứ hai.

### 4.4 Tip và thanh toán trực tiếp

- `tip`: chọn nhân viên, số tiền, phương thức được bật và ghi chú.
- `pay`: nhập số tiền, chọn phương thức ngoài NEXORA.
- **Legacy direct pay / Pay Salon Direct** là giao dịch tự do tách biệt; nó không đại diện cho ticket checkout và không bỏ qua completed gate.
- Gửi giao dịch tạo bản ghi `pending`; không cộng điểm ngay.
- `tipdone`/`paydone`: nút mô phỏng chỉ đại diện cho callback xác nhận của doanh nghiệp trong prototype. Sau `confirmed` mới cộng bonus và ghi ledger.

### 4.5 Looks và feedback

- Looks chỉ gắn với khách, lượt ghé và doanh nghiệp đã ghé; có thể lưu service, màu, note và ảnh đã nén.
- Có thể rebook hoặc tip lại nhân viên từ look.
- Follow-tech chỉ hiện khi khách có shared visit và nhân viên đã opt-in.
- `review`: rating riêng tư một lần cho mỗi visit, cộng +15; Google review mở liên kết ngoài và không ảnh hưởng điểm.

### 4.6 Booking

`book1 → book2 → book3` là chọn dịch vụ/nhân viên/thời gian, xem lại và gửi request. Request chuyển `pending → confirmed` qua hành động xác nhận demo; không tính là đã thanh toán và không phải instant booking.

### 4.7 Explore, offers và follow-tech

- Explore tìm kiếm theo tên/danh mục, hiển thị khoảng cách, rating, giá và trust signals có nguồn.
- Offer phải có business owner, điều kiện áp dụng, ngày hết hạn và nhãn sponsored nếu có.
- Wishes là mong muốn ẩn danh; thông báo nearby/wish trong prototype là thao tác mô phỏng có dedupe.
- Theo marketplace spec: ẩn salon hiện tại và grace period 30 ngày; dữ liệu kỹ thuật viên coarse/ẩn danh; hai bên chỉ reveal sau khi owner chấp nhận; chat chỉ sau accept; owner không thấy danh sách follower.

### 4.8 Profile, privacy và referral

- Profile cho sửa tên, avatar URL hợp lệ, ngôn ngữ và phương thức thanh toán. Số điện thoại là identity đã xác minh: profile editor không đổi trực tiếp; đổi số phải qua OTP rồi mới cập nhật đồng thời profile/session.
- Transactional messages luôn bật; marketing/business/network và AI suggestions là tùy chọn, lưu ngay trên thiết bị.
- Referral là điểm do doanh nghiệp tài trợ: bạn mới +100 sau check-in đầu tiên, người giới thiệu +50 sau lượt ghé có thanh toán; đây không phải affiliate cash.

## 5. State và persistence

### 5.1 Storage contract

- **Key:** `nexora.customer.prototype.v1`
- **Schema:** `schemaVersion: 1`
- **Load:** JSON lỗi được đưa sang backup/quarantine key trước khi tạo state mặc định.
- **Save:** `commitState` clone và validate draft, persist thành công rồi mới thay state trong memory.
- **Logout:** chỉ kết thúc session; dữ liệu demo vẫn còn trên thiết bị.
- **Reset demo:** xác nhận trước, tạo lại state mặc định và lưu lại.

### 5.2 Các collection chính

```text
session, profile, consents, preferences,
businesses, staffProfiles, balances, ledger,
visits, checkins, redemptions, tips, directPayments,
bookingRequests, appointments, looks, feedback,
savedOfferIds, wishes, followedTechIds,
notifications, offlineQueue, ui
```

Invariant quan trọng:

- Mọi balance và ledger entry đều có `businessId` hợp lệ.
- Ledger là append-only; debit reward không được làm âm số dư.
- `redemptions.idempotencyKey` chống redeem lặp; `rewardAttempt` và receipt context nằm trong `ui.pendingContext`.
- `ui.pendingContext.tipEntryIntent` phân biệt `generic | scan`; scan replay ID/fingerprint không lấy từ URL và chỉ trỏ tới một tip canonical `pending`.
- Tip/payment/booking có trạng thái và `confirmedAt` riêng; không cộng điểm từ bản ghi pending.
- `feedbackClaims` chống đánh giá trùng visit.
- Notification mô phỏng có `dedupeKey`; follow notification chỉ phát khi nhân viên opt-in và có salon mới.

### 5.3 Reward keys hiện có

`credit5`, `freepedi`, `voucher25`, `glow`, `moon`, `bistro`, `gel`.

Mỗi reward phải có business/alliance, cost, điều kiện và receipt context rõ ràng. Không dùng reward key tự do trong UI mà chưa thêm vào catalogue/domain rule.

## 6. Action contract

Mọi control tương tác dùng `data-action` và được đăng ký trong `ACTIONS`. Action phải làm một trong ba việc: điều hướng nội bộ, mutate state có persistence, hoặc mở external stub có thông báo rõ ràng.

| Nhóm | Action tiêu biểu | Kết quả |
|---|---|---|
| Navigation/modal | `navigate`, `back`, `open-notifications`, `open-notification`, `close-overlay`, `cancel-overlay`, `confirm-overlay` | Đổi screen, đánh dấu notification đã đọc, đóng/xác nhận modal |
| Auth/consent | `request-otp`, `verify-otp`, `resend-code`, `claim-welcome`, `accept-consent`, `skip-consent`, `confirm-double-opt-in`, `finish-onboarding` | Cập nhật session/consent/preference, có validation |
| Ví/reward | `open-business-history`, `open-reward`, `confirm-reward`, `show-reward-qr`, `use-offer` | Kiểm tra balance/alliance, tạo receipt hoặc hiển thị lỗi |
| Scan | `start-scan`, `enter-code`, `member-salon-checkin`, `open-guest-checkin`, `open-scan-tip`, `open-scan-payment` | Demo camera/QR; chọn service check-in, Tip staff canonical hoặc completed-ticket checkout |
| Tiền trực tiếp | `select-tip`, `send-tip`, `confirm-tip`, `send-payment`, `confirm-payment` | Pending trước, confirmed sau; không có wallet NEXORA |
| Looks/wishes | `save-look`, `upload-look`, `view-look`, `rebook-look`, `tip-look`, `delete-look`, `scan-receipt`, `add-wish`, `remove-wish` | Lưu/xem/rebook, thêm/xóa wish; scan receipt hiện rõ là capability ngoài prototype |
| Explore | `toggle-favorite`, `view-business`, `show-directions`, `save-offer`, `view-offer`, `toggle-follow-tech` | Cập nhật favorite/offer/follow hoặc mở Maps |
| Booking/feedback | `review-booking`, `confirm-booking`, `confirm-booking-demo`, `set-rating`, `submit-review`, `open-google-review`, `add-calendar` | Request booking, +15 feedback, deep-link Google/Calendar |
| Profile | `language`, `edit-profile`, `payment-methods`, `privacy-details`, `copy-referral`, `logout`, `reset-demo` | Cập nhật profile/preferences hoặc modal xác nhận |
| Demo notifications | `simulate-geo-push`, `simulate-wish-push` | Tạo notification dedupe, không giả lập push production |

Các control bị disable phải có `disabled`/`aria-disabled` và lý do hiển thị được. Không để nút nhìn như hoạt động nhưng không có handler.

## 7. Ranh giới prototype và production

### Đã chạy trong frontend prototype

- Rendering responsive, i18n EN/VI, Lucide icons.
- Persistence localStorage, migration/normalizer, validation, ledger, idempotency.
- Modal, toast, keyboard focus trap, pending/confirmed/receipt states.
- Demo data cho ba business: `bitcoin-nail-bar`, `golden-glow-spa`, `moon-coffee`.

### Cần backend hoặc tích hợp thật

- API auth/OTP, SMS provider và consent ledger TCPA.
- QR decoder/camera permission, server-side check-in dedupe và offline sync. Prototype đang mô phỏng camera và payment callback; dropdown role Operations không phải authorization thật.
- Business callbacks cho tip/payment/booking/reward receipt.
- Payment deep link/webhook, push notification, Google review attribution.
- Upload ảnh production, object storage, moderation và multi-device sync.
- Metrics Explore, sponsored offer billing, follow-tech reveal/chat và rate limiting.

Không đưa secret, API key hoặc dữ liệu cá nhân thật vào file HTML. Các URL ảnh, Maps, Google review, Tailwind và Lucide CDN là external dependency của prototype; production cần pin/version và self-host hoặc build pipeline.

## 8. Responsive, accessibility và i18n

- Mobile là layout mặc định; Scan là nút nổi ở giữa bottom nav.
- Từ breakpoint desktop, bottom nav chuyển thành sidebar; nội dung vẫn giới hạn chiều rộng đọc được.
- Icon Lucide chỉ trang trí khi đã có nhãn; button icon có `aria-label`.
- Modal đóng bằng nút, Escape và focus trap; toast không thay thế thông báo lỗi inline cho form.
- Text có cặp `data-en`/`data-vi`; tiền dùng USD, điểm dùng số nguyên có phân tách hàng nghìn.
- Không hard-code câu mới trong handler nếu câu đó cần dịch runtime.

## 9. Checklist nghiệm thu

- [ ] Mở trực tiếp [`cutomer-reward.html`](cutomer-reward.html) bằng trình duyệt có mạng; không xuất hiện lỗi Tailwind utility hoặc JavaScript uncaught.
- [ ] Điều hướng đủ 5 tab và 31 screen ID.
- [ ] Reload vẫn giữ profile, consent, preference, balance, ledger, reward receipt, looks, offers, wishes, follows và notifications.
- [ ] Redeem thiếu điểm, sai alliance, duplicate idempotency và receipt đã dùng đều bị chặn.
- [ ] Tip/payment pending không cộng điểm; confirm mới cộng đúng business.
- [ ] OTP cooldown/lockout, onboarding consent và push permission hoạt động.
- [ ] QR strict validation, duplicate check-in và offline queue/retry được kiểm tra.
- [ ] Feedback cộng đúng +15 một lần/visit; Google không cộng thêm.
- [ ] Follow-tech chỉ khả dụng sau shared visit và opt-in.
- [ ] Mobile/desktop, keyboard, Escape modal và EN/VI đã kiểm tra thủ công.

### Lệnh kiểm tra nhanh

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check -- html/customer
rg -n "đang chờ|chưa triển khai" html/customer/customer-app-independent-guide.md
```

Khi thêm domain rule mới, cập nhật cả action registry, state normalizer, renderer và test API `window.NEXORA_TEST_API`; không chỉ sửa markup.

## 10. Nguồn tham chiếu

- [Customer app developer spec](customer-app-developer-spec.md) — behavior, data model, business rules và test cases.
- [Three-sided marketplace spec](three-sided-marketplace-spec.md) — Explore, follow-tech và privacy marketplace.
- [Customer reward localStorage design](customer-reward-localstorage-design.md) — storage schema, persistence và frontend boundary.
- [Customer app prototype](customer-app-prototype.html) — flow/UI tham chiếu ban đầu.
- [Implementation plan](2026-07-14-customer-reward-localstorage-implementation-plan.md) — lịch sử triển khai theo task.

Tài liệu này là bản handoff độc lập cho `html/customer`; mã chạy thực tế và các spec nguồn vẫn là nơi cập nhật chi tiết khi contract thay đổi.

## Handoff Customer Salon Cross-surface

- Entry files: `cutomer-reward.html` và `customer-salon-operations.html`.
- Storage: Customer schema v2 tại `nexora.customer.prototype.v1`; Operations schema v1 tại `nexora.customer.crosssurface.v1`.
- Customer domain actions: `stageSalonScan`, `createGuestCheckin`, `createCheckoutDraft`, `submitPaymentProof`, `verifyPaymentProof`, `mergeGuestJourney`, `createReferralInvite`, `releaseReferralReward`, `importAcceptedAddOns`.
- Operations domain actions: `createServiceTicket`, `evaluateStaffEligibility`, `chooseRecommendedStaff`, `proposeAddOn`, `resolveAddOn`.
- Luồng bắt buộc: service check-in thành công mở Customer Live Ticket trước; Staff Not Eligible và Approve Add-on chỉ hiện theo điều kiện; Pay trên Live Ticket hoặc Scan Payment chỉ handoff sang Guest Checkout khi exact ticket đã `completed`.
- Frontend simulation: QR camera, file upload, Call/Message, Front Desk verification, payment handoff và paid-visit referral event.
- External production dependencies: API/auth, OTP/SMS, camera permission, object storage, malware scan, payment/deep links, webhook verification, server ledger và audit log.
- Verification: `node --test html/customer/cutomer-reward.test.mjs` và `node --test html/customer/customer-salon-operations.test.mjs`.
