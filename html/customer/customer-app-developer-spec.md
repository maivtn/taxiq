# NEXORA TOUCH — Customer App: Developer Specification (Screen-Level)

| Field | Value |
|---|---|
| Document | customer-app-developer-spec.md |
| Version | Draft v1.1 — 2026-07-09 (v1.1: thêm expiry điểm, push pre-permission, SLA confirm, offline queue, analytics events) |
| Product Owner | Brian Nguyen (VlinkPay LLC) |
| Audience | Dev team, QC team, AI coding agent |
| Companion files | `customer-app-prototype.html` (clickable prototype — UI source of truth), `NEXORA_Bo_Spec_Chot_App_Khach.docx` (business rationale), `three-sided-marketplace-spec.md` (marketplace — referenced, not duplicated here) |
| Scope | All 31 screens of the customer app |

> **Cách dùng bộ tài liệu / How to use:** Prototype HTML là nguồn sự thật về **UI & luồng bấm** — dev mở file, bấm thử từng màn. Tài liệu này là nguồn sự thật về **hành vi, dữ liệu, rule, edge case**. File docx giải thích **vì sao** (business). Nếu prototype và tài liệu này lệch nhau → tài liệu này thắng, báo PO.

---

## 1. Overview

**EN:** NEXORA TOUCH customer app lets salon/spa/coffee/restaurant customers earn points at check-in, redeem rewards (at their own business and across a co-op alliance), tip staff, pay the business directly (0% fee), save "looks", book again, send private feedback, and discover nearby NEXORA businesses.

**VI:** App khách hàng cho phép: tích điểm khi check-in, đổi thưởng (tại tiệm mình và qua liên minh co-op), tip thợ, trả tiền thẳng cho tiệm (0% phí), lưu "looks" (ảnh + mã màu mỗi lần làm), đặt lại lịch, gửi feedback riêng cho tiệm, và khám phá tiệm NEXORA gần đó.

### 1.1 Non-negotiable principles (LOCKED — không được vi phạm ở bất kỳ màn nào)

1. **NEXORA never holds money.** Tiền đi thẳng khách → tiệm/thợ (Zelle/Venmo/CashApp/Apple Cash/PayPal). NEXORA chỉ ghi sổ và xác nhận.
2. **NEXORA never issues points.** Điểm do từng business phát hành và chịu trách nhiệm (point liability thuộc business). NEXORA là **neutral ledger**.
3. **Điểm không bao giờ đổi ra tiền mặt** (điều khoản 8): chỉ đổi được sản phẩm/dịch vụ. Không chuyển nhượng, không bán. Mọi copy trên UI phải nhất quán ("services only — never cash out").
4. **Mỗi business tự đặt luật điểm của mình** (tỷ lệ earn, giá redeem, giá co-op). NEXORA không đặt giá — chỉ lưu rule, enforce tự động.
5. **Review compliance:** feedback riêng được thưởng 15 điểm với **mọi rating**; share Google là tùy chọn và **không bao giờ được thưởng** (Google/FTC rules).
6. **TCPA/SMS compliance:** double opt-in, consent không phải điều kiện nhận điểm, STOP/HELP, consent lưu kèm timestamp.

### 1.2 Non-goals (out of scope V1 của app khách)

- Instant booking (chỉ có **booking request** — tiệm xác nhận).
- Marketplace tuyển dụng 3 phía → spec riêng `three-sided-marketplace-spec.md`.
- Ví tiền / nạp tiền / số dư tiền mặt trong app (vi phạm nguyên tắc 1).
- Đổi điểm chéo giữa 2 business KHÔNG cùng liên minh co-op.

---

## 2. Global conventions

### 2.1 Navigation model

**EN:** 5 bottom tabs, no hamburger menu. Every screen belongs to exactly one tab (for tab-highlight purposes).

| Tab | Root screen | Screens mapped to this tab |
|---|---|---|
| Home | `home` | home, allmenu, tip, tipdone, pay, paydone, looks, addlook, review, activity, offers, book1–3, login1–2 |
| Wallet | `wallet` | wallet, rewards, redeem, redeemdone, history |
| Scan | `scan` | scan, onb1–onb4 |
| Explore | `explore` | explore, business |
| Profile | `profile` | profile, referral, msgprefs |

**VI:** App khách dùng bottom tabs, **không hamburger** (nguyên tắc điều hướng đã chốt cho consumer app). Prototype có object `tabMap` đúng như bảng trên — dev giữ nguyên mapping khi build native.

### 2.2 Bilingual EN/VI

- Mọi text hiển thị phải có cặp EN/VI (prototype dùng `data-en`/`data-vi`; app thật dùng i18n keys).
- Ngôn ngữ đổi runtime tại Profile → Language, áp dụng ngay không cần restart.
- Số tiền: USD format `$55.00`. Điểm: `2,450 pts`.

### 2.3 Shared components

| Component | Behavior |
|---|---|
| Toast | Non-blocking, tự ẩn ~2s, song ngữ. Dùng cho demo-stub và confirm nhẹ (copied, saved…). |
| Redeem sheet (`redeem` screen) | Nhận `offer_key` → hiển thị balance / cost / remaining. Dùng chung cho MỌI nút "Redeem" toàn app (7 offer keys trong prototype). |
| QR modal | Hiện mã QR redemption để đưa quầy scan ("Show at counter"). |
| Pending→Confirmed pattern | tipdone, paydone, book3 đều có 2 trạng thái: ⏳ awaiting salon confirmation → ✅ confirmed. Điểm CHỈ cộng sau khi tiệm confirm. |

### 2.4 Point model (đọc kỹ — hay bị hiểu sai)

**EN:** One NEXORA account per customer; inside it, **separate point balances per business**. Points live in the customer's NEXORA account, independent of any salon POS. Co-op alliance lets a customer spend Business-A points on a Business-B offer **only when both are in the same alliance**, at a price set by the accepting business.

**VI:** Khách có **1 tài khoản NEXORA**, trong đó điểm tách theo từng business (Bitcoin Nail Bar 2,450 pts; Golden Glow 600 pts; Moon Coffee 120 pts…). KHÔNG có "số dư tổng" cộng dồn. Cross-redeem chỉ hoạt động trong cùng liên minh, giá do business nhận điểm tự đặt.

---

## 3. Screen inventory (31 screens)

| # | Screen ID | Title | Module | Tab |
|---|---|---|---|---|
| 1 | `login1` | Login — phone | Auth | Home |
| 2 | `login2` | Login — OTP | Auth | Home |
| 3 | `onb1` | Welcome Gift (claim) | Onboarding | Scan |
| 4 | `onb2` | Message Consent | Onboarding | Scan |
| 5 | `onb3` | Confirm Number (double opt-in) | Onboarding | Scan |
| 6 | `onb4` | Points Waiting (success) | Onboarding | Scan |
| 7 | `home` | Home dashboard | Home | Home |
| 8 | `allmenu` | All features | Home | Home |
| 9 | `activity` | Activity & Messages | Home | Home |
| 10 | `wallet` | My Wallet | Wallet | Wallet |
| 11 | `history` | Points History | Wallet | Wallet |
| 12 | `rewards` | Redeem menu | Rewards | Wallet |
| 13 | `redeem` | Cross Redeem (confirm sheet) | Rewards | Wallet |
| 14 | `redeemdone` | Reward Claimed | Rewards | Wallet |
| 15 | `scan` | Scan QR | Check-in | Scan |
| 16 | `tip` | Tip staff | Payments | Home |
| 17 | `tipdone` | Tip sent/confirmed | Payments | Home |
| 18 | `pay` | Pay Salon Direct | Payments | Home |
| 19 | `paydone` | Payment sent/confirmed | Payments | Home |
| 20 | `looks` | My Looks | Looks | Home |
| 21 | `addlook` | Save a Look | Looks | Home |
| 22 | `review` | Feedback | Feedback | Home |
| 23 | `book1` | Book Again — pick | Booking | Home |
| 24 | `book2` | Review Request | Booking | Home |
| 25 | `book3` | Request Sent/Confirmed | Booking | Home |
| 26 | `explore` | Explore businesses | Discovery | Explore |
| 27 | `business` | Business profile | Discovery | Explore |
| 28 | `offers` | Offers feed + wish alerts | Discovery | Home |
| 29 | `referral` | Invite Friends | Growth | Profile |
| 30 | `profile` | Profile & settings | Settings | Profile |
| 31 | `msgprefs` | Messages & Privacy | Settings | Profile |

---

## 4. Screen-by-screen specification

Format mỗi màn: **Purpose (VI)** → **Entry points** → **UI & data** → **Behaviors** → **Backend requirements** → **Edge cases**.

---

### Module A — Auth

#### A1. `login1` — Login (phone)

- **Purpose:** Đăng nhập bằng số điện thoại, không mật khẩu. "Your rewards, everywhere you go."
- **Entry:** app launch (chưa có session); Profile → Log Out; tipdone → "Keep my points — enter phone" (guest flow).
- **UI & data:** logo NEXORA, tagline, input `phone` (US format), button Continue, note "No password. We text you a one-time code."
- **Behaviors:**
  1. Continue → gửi OTP SMS → `login2`.
- **Backend:** `POST /auth/otp/request {phone}` — rate limit (max 5 request/số/giờ); nếu số chưa tồn tại → vẫn gửi OTP, tạo account sau khi verify (số điện thoại = account key, khớp luồng onb1).
- **Edge cases:** số sai format → inline error; quá rate limit → thông báo chờ; khách đã có điểm từ check-in tại quầy (guest) → verify xong merge về đúng account theo số.

#### A2. `login2` — Enter Code (OTP)

- **Purpose:** Xác thực OTP 6 số.
- **Entry:** login1.
- **UI & data:** "Sent to (832) 555-0148" (masked), ô nhập code, Verify, "Resend code".
- **Behaviors:**
  1. Verify đúng → tạo session → `home`.
  2. Resend → gửi lại, cooldown 30s (prototype: toast `resend`).
- **Backend:** `POST /auth/otp/verify {phone, code}` → JWT/session. Code hết hạn 10 phút, tối đa 5 lần thử.
- **Edge cases:** sai code 5 lần → khóa 15 phút; đổi số điện thoại → out of scope V1 (support xử lý).

---

### Module B — Onboarding (khách mới nhận welcome gift tại quầy)

> **Luồng nghiệp vụ:** khách mới scan QR tại quầy → được tặng 25 welcome points → nhập số ĐT → chọn consent tin nhắn → double opt-in qua SMS → vào app. **Không cần cài app** để claim (web flow), nhưng prototype mô phỏng trong app.

#### B1. `onb1` — Welcome Gift

- **Purpose:** Claim 25 điểm chào mừng bằng số điện thoại.
- **Entry:** scan → "🆕 New customer? Claim welcome gift".
- **UI & data:** "You've been gifted 25 welcome points!", input Mobile Number, button "Claim 25 Points →", privacy note (số chỉ dùng cho rewards + tin nhắn được duyệt ở màn sau).
- **Behaviors:** Claim → `onb2`.
- **Backend:** tạo pending account `{phone, business_id nguồn QR, welcome_points: theo cấu hình business}`. **25 là số của business demo — mỗi business tự đặt** (nguyên tắc 2: NEXORA không phát điểm).
- **Edge cases:** số đã tồn tại → chuyển sang login OTP, KHÔNG tặng lại welcome points (chống farm); business tắt welcome gift → không hiện entry point ở `scan`.

#### B2. `onb2` — Message Consent

- **Purpose:** Chọn loại tin nhắn nhận — tách 2 consent riêng.
- **UI & data:** 2 toggle độc lập: (1) "Rewards & offers texts from [business] (via Nexora), up to 4 msgs/month"; (2) "Optional: offers from nearby Nexora partners". Buttons: "Agree & Continue" / "Skip — points only, no texts". Legal text đầy đủ: consent NOT a condition of purchase or of receiving points; STOP/HELP; consent stored with timestamp.
- **Behaviors:**
  1. Agree (≥1 toggle bật) → `onb3` (double opt-in).
  2. Agree với 0 toggle → chặn, yêu cầu bật ít nhất 1 hoặc dùng Skip (prototype: toast `needc`).
  3. Skip → **vẫn nhận điểm**, không SMS marketing → thẳng `onb4` (prototype: toast `skipc`).
- **Backend:** lưu `consent_records {phone, sender_scope: business|network, granted_at, method}`. **Đây là chứng cứ pháp lý TCPA — immutable, không xóa khi user tắt sau này (chỉ thêm record revoke).**
- **Edge cases:** Skip xong vẫn phải nhận **transactional SMS** (booking confirmation) — chỉ chặn marketing.

#### B3. `onb3` — Confirm Number (double opt-in)

- **Purpose:** Chứng minh số thuộc về khách + tạo legal record.
- **UI & data:** mô phỏng SMS: "Nexora: [business] added 25 pts... Reply Y to confirm... STOP=cancel HELP=help". Button "Reply Y (demo)".
- **Behaviors:** khách reply Y qua SMS thật → hệ thống kích hoạt consent → app nhận push/poll → `onb4`. Không reply Y → account vẫn có điểm nhưng **zero marketing texts**.
- **Backend:** SMS webhook nhận inbound "Y" → set `consent.confirmed_at`. Số không reply Y trong 72h → consent record đóng ở trạng thái `unconfirmed`.
- **Edge cases:** reply STOP tại bước này → revoke toàn bộ, vẫn giữ điểm.

#### B4. `onb4` — Points Waiting (success)

- **Purpose:** Xác nhận account active, điểm nằm trong tài khoản NEXORA — độc lập với POS của tiệm.
- **UI & data:** "25 points are waiting!", số điểm to, "Enter App →".
- **Behaviors:** Enter App → mở **push pre-permission modal** (BR-C15): giải thích lợi ích + "Turn on notifications" (→ OS dialog thật) / "Maybe later" → `home`.
- **Backend:** account chuyển `active`; ledger entry đầu tiên `welcome_bonus` (thấy được ở `history`); lưu `push_prompt_shown_at` để không hỏi lại quá 1 lần.

---

### Module C — Home & Navigation

#### C1. `home` — Home dashboard

- **Purpose:** Màn trung tâm: điểm tại tiệm quen, gợi ý redeem, lịch hẹn, quick actions, For You, favorite salon, direct-pay CTA, referral CTA.
- **Entry:** default sau login; tab Home.
- **UI & data (thứ tự dọc):**
  1. Greeting "Hi Jessica 👋" + avatar → `activity` (badge tin mới).
  2. **Points card** (tiệm chính — tiệm khách check-in nhiều nhất): "Bitcoin Nail Bar · Your Points", balance + credits, "Redeem →" → `rewards`, progress "50 points away from Free Gel Upgrade".
  3. **Redeem strip** ngang: chip "All" → `rewards`; 4 offer chips → mở redeem sheet (`openRedeem`): bistro 450 / facial 500 / moon 600 / glow 800; chip mục tiêu gần nhất "Free Gel Upgrade · 2,500 pts · 50 to go".
  4. **Upcoming appointment** card (nếu có): ngày giờ + "Confirmed ✓".
  5. **Quick Actions** (5): Rewards, My Looks, Tips, Offers, Messages + "See All" → `allmenu`.
  6. **✨ For You** (AI suggestions, tối đa 2): lý do rõ ràng ("You get gel every 3 weeks — pair it with a facial"), footer "Suggested from your visit & redeem history — manage in Profile → Messages & Privacy". Tap → redeem sheet.
  7. **Favorite Salon** card: last visit, tech, số visits; buttons Book Again → `book1`, Tip Staff → `tip`; "View" → `explore`.
  8. **Pay Salon Direct** CTA: "0% fees · +20% bonus points" → `pay` (qua `goPay()` — set context tiệm).
  9. **Referral CTA**: "you +50, they +100 · Share your code REF-JESS" → `referral`.
- **Backend:** `GET /home` trả composite: primary_business (theo check-in count), balances, next_reward_progress, upcoming_appointment, foryou_suggestions (≤2, kèm reason string), favorite_salon, referral_code, **expiring_points {amount, date}** (BR-C14 — chip vàng dưới progress bar khi có điểm hết hạn ≤ 60 ngày).
- **Edge cases:** khách mới 0 điểm → points card hiện 0 + CTA khám phá; không appointment → ẩn card; AI suggestions tắt trong msgprefs → ẩn khối For You; nhiều tiệm → points card của tiệm primary, các tiệm khác xem ở `wallet`.

#### C2. `allmenu` — All features

- **Purpose:** Danh mục đầy đủ 16 tính năng dạng grid — thay thế hamburger. Cũng chứa demo push notifications + onboarding carousel replay.
- **Entry:** home → Quick Actions "See All".
- **UI & data:** grid 16 items: Rewards, Wallet, Scan/Check-in, My Looks, Book Again, Tip Staff, Pay Salon Direct, Offers & Alerts, Explore, Feedback +15, Invite Friends, Activity & Messages, Notifications & Privacy, How the app works (replay onboarding carousel), Profile.
- **Behaviors:** mỗi item → go() đến màn tương ứng (xem tabMap §2.1).
- **Ghi chú prototype:** màn này còn chứa 2 mock push (geo push Golden Glow 400ft; wish-alert push) và carousel 3 slide "How the app works" — trong app thật: push là notification hệ điều hành, carousel là component overlay gọi được từ `profile` và `allmenu`.

#### C3. `activity` — Activity & Messages

- **Purpose:** Lịch sử visit gần nhất + hộp tin nhắn từ hệ thống/business.
- **Entry:** home avatar/greeting; allmenu.
- **UI & data:** Recent Visit card (ngày, dịch vụ, điểm, "Reviewed ⭐ 5.0"); Messages list: milestone ("You are 50 points away…"), co-op ("$10 credit available via co-op alliance"), new partner ("New partner near you") → tap mở `business`.
- **Backend:** `GET /activity` = visits + in-app messages. Message types: milestone, coop_offer, new_partner, booking, system.
- **Edge cases:** message phải tôn trọng msgprefs (tắt Network → không nhận new_partner/co-op message).

---

### Module D — Wallet & Points

#### D1. `wallet` — My Wallet

- **Purpose:** Xem điểm tách theo từng business — giáo dục khách về mô hình "1 tài khoản, nhiều số dư".
- **Entry:** tab Wallet.
- **UI & data:** banner "Nexora Account — Your points live in your Nexora account — not in any salon's POS"; subtitle "Each business runs its own rewards program. Nexora keeps the ledger for all of them."; "3 businesses linked"; **mỗi business 1 card**: tên, rule riêng ("$100 = 100 pts ($5) · redeem from 500 pts"), Points + Credits, "History ›" → `history`; các tiệm co-op: "Runs its own program · co-op partner · 600 pts earned here"; CTA "Browse Alliance Offers →" → `rewards`.
- **Backend:** `GET /wallet` → mảng `{business_id, name, points, credits, earn_rule_text, coop_alliance_id, expiry_policy_text, expiring_points {amount, date}}` — dòng expiry hiển thị dưới rule của tiệm (BR-C14).
- **Edge cases:** business rời NEXORA → điểm xử lý theo chính sách business đó (liability của business, không phải NEXORA) — hiển thị trạng thái "program paused" + hướng dẫn liên hệ tiệm. **KHÔNG bao giờ hiển thị tổng cộng dồn các business.**

#### D2. `history` — Points History

- **Purpose:** Sổ cái minh bạch — mọi biến động điểm trace được về nguồn.
- **Entry:** wallet → History.
- **UI & data:** Current balance + Lifetime earned; list entries: Visit + Pedicure (+), Feedback sent (+15), Tip to Anna ($10 × 10 = +100), Redeemed: Free Pedicure (−1,000), Visit + Gel Manicure (+), Welcome bonus (+25). Footer: "Every entry links to a ledger record — points can always be traced to the visit, tip or review that earned them."
- **Backend:** `GET /businesses/{id}/ledger` — mỗi entry có `type (visit|feedback|tip_bonus|redeem|welcome|booking_bonus|directpay_bonus|referral)`, `ref_id` trỏ về transaction gốc, immutable append-only.
- **Edge cases:** filter theo business (history mở từ card business nào thì hiện business đó); pagination.

#### D3. `rewards` — Redeem menu

- **Purpose:** Menu đổi thưởng: nhóm "tại tiệm của bạn" + nhóm "alliance partners". Dạy khách: 1 số dư, 3 kiểu đổi.
- **Entry:** tab Wallet → wallet CTA; home Redeem →; redeem strip chip "All".
- **UI & data:**
  - Header: "You can spend **2,450** Bitcoin Nail Bar points — accepted by co-op partners below".
  - Milestone banner: "🎯 Your first reward is close! 50 points to Free Gel Upgrade".
  - **Nhóm 1 — At your salon** (3 kiểu đổi, minh họa đủ 3 loại):
    1. `credit5` — $5 Service Credit · 500 pts · "applied to your bill — **services only, not cash**".
    2. `freepedi` — Free Classic Pedicure · 1,000 pts · "reward set by the salon".
    3. `voucher25` — 25% OFF any service · 800 pts · "one-time code, valid 30 days (set by salon)".
    - Note: "One point balance, three ways to redeem — service credit, free service, or a % code. The salon builds this menu and sets every price in its dashboard. Credit applies to services only — never cash out."
  - **Nhóm 2 — Alliance partners**: glow $10 Credit 800 · moon Free Drink 600 · bistro 10% OFF 450 — mỗi cái ghi "price set by [accepting business]".
  - Note cuối: "Nexora doesn't set any rates — it only stores the rules, enforces them automatically and keeps the ledger."
- **Behaviors:** mọi nút Redeem → `redeem` sheet với offer key tương ứng.
- **Backend:** `GET /redeem-menu?business_id=` → own_rewards[] + alliance_offers[]. Reward types enum: `service_credit | free_service | percent_code`.
- **Edge cases:** balance < cost → nút Redeem disabled + hiện thiếu bao nhiêu (prototype: toast `nopts`); voucher hết hạn 30 ngày → job expire; business sửa giá → áp dụng cho redemption mới, không hồi tố.

#### D4. `redeem` — Cross Redeem (confirm sheet)

- **Purpose:** Màn xác nhận trước khi trừ điểm — dùng chung cho own-salon lẫn co-op.
- **Entry:** mọi nút Redeem toàn app (home strip, rewards, business, offers, activity).
- **UI & data:** "Use **800** Bitcoin Nail Bar points via the co-op alliance"; 3 dòng số: Your balance / Offer Cost / **Remaining Balance**; Confirm Redeem / Cancel.
- **Behaviors:**
  1. Confirm → trừ điểm (ledger) → `redeemdone`.
  2. Cancel → quay lại `rewards`.
- **Backend:** `POST /redemptions {offer_id}` — transaction atomic: check balance → debit → tạo redemption record `{id: red_9xxxx, status: ready, qr_payload}`. Co-op: hệ thống ghi đồng thời settlement record giữa 2 business theo giá liên minh đã cấu hình.
- **Edge cases:** double-tap Confirm → idempotency key; balance thay đổi giữa 2 màn → re-check server-side, báo lỗi thân thiện.

#### D5. `redeemdone` — Reward Claimed

- **Purpose:** Biên nhận đổi thưởng + QR xuất trình tại quầy.
- **UI & data:** milestone banner nếu là reward đầu tiên ("🏅 First reward unlocked"); "Reward Claimed! ready at [business]"; bảng: Redemption ID (`red_90018`…), Business, Paid with (Bitcoin Nail Bar points), Status: Ready; "Show QR Code" → QR modal "Show at counter"; Done → `home`.
- **Backend:** redemption states: `ready → used → expired`. Quầy scan QR → business app đánh dấu `used`.
- **Edge cases:** khách không dùng → expire theo policy của offer; xem lại redemption cũ → qua `history` (V1: chỉ ledger entry, không cần màn list riêng).

---

### Module E — Check-in & QR

#### E1. `scan` — Scan QR

- **Purpose:** Cổng vào của mọi tương tác tại tiệm: check-in tích điểm, tip, review, redeem.
- **Entry:** tab Scan (giữa, nút to).
- **UI & data:** khung camera, "Business / Staff / Reward — Scan to tip, review, earn or redeem"; buttons: Open Camera (`startScan()` — **demo stub**), Enter Code (nhập tay khi camera hỏng — **demo stub**), "🆕 New customer? Claim welcome gift" → `onb1`.
- **QR format (LOCKED):** `nexoratouch.com/touch/[salon]/[station]?staffProfileId=…` — business, station, staff đều lấy từ URL này. App phải parse đúng format production đang dùng.
- **Behaviors (app thật):** scan QR → resolve context → route: QR business/station → check-in flow; QR có staffProfileId → màn tip/review đúng thợ; QR redemption → xác nhận sử dụng reward.
- **Backend:** `POST /checkins {qr_payload, lat/lng optional}` → cộng điểm theo earn rule của business, ledger entry `visit`.
- **Edge cases:** QR không hợp lệ → error rõ ràng; submit lại đúng cùng business/station/name/phone/service/staff trong **120 phút** trả lại đúng service check-in canonical (`idempotent: true`), còn nhiều bản ghi khớp hoặc bản ghi hỏng thì fail closed; service khác trong cửa sổ và cùng service từ phút 120 trở đi là lượt mới. Camera permission denied → hướng dẫn mở Settings + fallback Enter Code; **mạng yếu → queue + retry backoff, UI "đang gửi lại…", timestamp tính lúc scan (BR-C17)**.

---

### Module F — Payments & Tips (NEXORA never holds money)

#### F1. `tip` — Tip staff

- **Purpose:** Tip thợ trực tiếp qua payout method thợ đã bật — tiền đi thẳng khách → thợ.
- **Entry:** home Favorite Salon "Tip Staff"; looks "Tip Anna"; paydone "Tip Anna 💜"; QR có staffProfileId; allmenu.
- **UI & data:** header thợ: "Tip Anna — Gel, pedicure · 4.9 ⭐ · 15 visits with you"; Select Tip Amount: $5/$10/$20 + custom; Payment Method list: **chỉ chọn được method thợ đã enable** — method chưa enable hiển thị disabled kèm lý do "(staff hasn't enabled)" (Zelle/CashApp/Venmo/AppleCash/PayPal); Send Tip; note "Tip reward: 10× points — a $10 tip earns +100 points at Bitcoin Nail Bar."
- **Behaviors:**
  1. pickTip chọn amount → highlight.
  2. Send Tip → deep-link/QR sang app thanh toán tương ứng của thợ → `tipdone` (trạng thái pending).
- **Backend:** `POST /tips {staff_profile_id, amount, method}` → record `pending`. Tip bonus (10×) là **rule do business đặt**, cấu hình được.
- **Edge cases:** thợ chưa bật method nào → ẩn nút tip, hiện thông báo; tip xong không được confirm → xem F2.

#### F2. `tipdone` — Tip sent → confirmed

- **Purpose:** 2 trạng thái: chờ xác nhận → đã xác nhận + cộng điểm.
- **UI & data:**
  - State 1 (pending): "Your $10 tip to Anna is awaiting the salon's confirmation. ⏳" + dòng SLA "Bitcoin Nail Bar usually confirms within 10 minutes — we'll notify you" (BR-C16, số phút = median thực của tiệm); buttons: "▶ Salon confirms (demo)" (prototype only), Back to Home.
  - State 2 (confirmed): "Thank You! Tip confirmed by Bitcoin Nail Bar. **+100** points (10× your tip)"; CTAs: "Send Feedback For +15" → `review`; guest: "Keep my points — enter phone" → `login1`.
- **Backend:** salon/staff xác nhận nhận tiền trong business/staff app → webhook đổi status `confirmed` → cộng điểm tip bonus. **Điểm KHÔNG cộng trước khi confirm** (vì NEXORA không thấy dòng tiền — chỉ tin business xác nhận).
- **Edge cases:** salon không confirm trong 48h → nhắc business; khách khiếu nại → hiển thị trạng thái pending vĩnh viễn thay vì mất tích.

#### F3. `pay` — Pay Salon Direct

- **Purpose:** Khách trả bill trực tiếp cho tiệm (0% phí thẻ), nhận bonus điểm — kênh thay thế quẹt thẻ.
- **Entry:** home CTA "💳 Pay Salon Direct"; allmenu (`goPay()` set context tiệm).
- **UI & data:** "Bitcoin Nail Bar · no card fees"; Service + Amount ($55); Payment Method: "Zelle (0% — salon keeps 100%)" — các method tiệm chưa bật hiển thị disabled "(salon hasn't enabled)"; banner "🎁 Direct-pay reward: +20% bonus points — **set by Bitcoin Nail Bar**"; **QR Zelle của tiệm** — khách scan bằng app ngân hàng; button "I've paid $55 — notify salon"; note "Money goes straight from your bank to the salon's — Nexora never holds it. Points are released once the salon confirms the payment arrived."
- **Behaviors:** "I've paid" → tạo payment record pending → `paydone`.
- **Backend:** `POST /direct-payments {business_id, amount, method}` → `pending`. Bonus % là cấu hình của business.
- **Edge cases:** khách bấm "I've paid" nhưng chưa trả → tiệm không confirm → không có điểm, record tự expire 72h; số tiền lệch → tiệm sửa amount khi confirm, điểm tính theo số tiệm confirm.

#### F4. `paydone` — Payment sent → confirmed

- **UI & data:** State 1 pending (như F2). State 2: "Payment Confirmed! Bitcoin Nail Bar received your $55.00 — receipt saved to History. **+55 points ($55 spend) · +11 bonus for paying direct (set by salon)**"; CTAs: "Send Feedback For +15" → `review`, "Tip Anna 💜" → `tip`.
- **Backend:** confirm từ business app → ledger 2 entries (`visit_spend` +55, `directpay_bonus` +11) + receipt vào history.
- **Edge cases:** giống F2; receipt phải xem lại được từ `history`.

---

### Module G — My Looks

#### G1. `looks` — My Looks

- **Purpose:** Sổ tay làm đẹp: mỗi visit lưu ảnh + mã màu + thợ — để rebook đúng kiểu cũ hoặc sửa lỗi.
- **Entry:** home Quick Action; allmenu.
- **UI & data:** CTA "＋ Save a look (photo + color)" → `addlook`; "📷 Scan receipt" (**demo stub** — OCR hóa đơn); list look cards: ảnh, "Color: OPI Bubble Bath #S86" / "DND #710 Sea Glass", note ("sensitive skin — gentle peel"), buttons "Rebook this look" → `book1` (prefill), "Tip Anna" → `tip`. Footer privacy: "A photo is saved at check-out when you or your tech snaps one. **Only you and the business you visited can see this book.**"
- **Backend:** `GET /looks` → `{photo_url, color_code, service, tech, note, visit_id, business_id}`. Quyền xem: customer + business của visit đó. KHÔNG public, KHÔNG cross-business.
- **Edge cases:** 0 looks → empty state + CTA save; ảnh do thợ chụp từ staff app tự attach vào visit.

#### G2. `addlook` — Save a Look

- **Purpose:** Tự lưu look thủ công (ngoài luồng auto tại check-out).
- **UI & data:** "Tap to take a photo" (camera/gallery), Service select (Gel/Pedicure/…/Other), Color code (text), Note optional, "Save to My Looks". Note: trong app thật photo attach vào check-in hôm nay tự động.
- **Behaviors:** saveLook → lưu → toast `savelook` → về `looks`.
- **Backend:** `POST /looks` — attach vào visit gần nhất nếu có (≤24h), không thì standalone.
- **Edge cases:** không có photo → cho lưu color+note không ảnh; giới hạn dung lượng ảnh, resize client-side.

---

### Module H — Feedback (review compliance)

#### H1. `review` — Feedback

- **Purpose:** Feedback riêng cho tiệm, thưởng 15 điểm **với mọi rating** — tách hoàn toàn khỏi Google review.
- **Entry:** tipdone/paydone CTA; allmenu "Feedback +15"; QR sau visit.
- **UI & data:** 5 sao (`setStars`), text box, button "Send Feedback + Earn 15 Points", link "Share on Google (optional · **no points**)". Note: "+15 points for your feedback — any rating, sent privately to the salon. Sharing on Google is optional and never rewarded, keeping the salon compliant with Google & FTC review rules."
- **Behaviors:**
  1. Submit → +15 ledger entry `feedback` → toast/next screen. Rating thấp (1–3⭐) đi thẳng vào inbox tiệm (private) — cơ hội xử lý trước khi khách lên Google.
  2. Share on Google → mở Google review page — **không điểm, không điều kiện rating** (prototype: toast `google`).
- **Backend:** `POST /feedback {visit_id, stars, text}` — 1 feedback/visit (chống farm 15 điểm); route đến business inbox.
- **Edge cases:** đã feedback visit này → nút disabled "Already sent"; **cấm mọi logic dạng "chỉ 4-5⭐ mới mời lên Google" (review-gating — vi phạm chính sách Google).**

---

### Module I — Booking (request, không phải instant)

#### I1. `book1` — Book Again

- **Purpose:** Đặt lại nhanh — prefill từ visit trước, đổi gì cũng được.
- **Entry:** home Favorite Salon "Book Again"; looks "Rebook this look"; explore card "Book".
- **UI & data:** Service chips (Full Set · $55 …), Technician chips (Anna / Anyone / …), Preferred Day (3 ngày gần nhất), Preferred Time (slots; slot đông có badge "hot"), Continue →.
- **Behaviors:** pickSel chọn chip mỗi nhóm → toBook2() yêu cầu đủ selection → `book2`.
- **Backend:** `GET /booking/prefill?business_id=` từ visit history; slots từ lịch tiệm (V1: khung giờ tĩnh do tiệm khai, không sync calendar phức tạp).
- **Edge cases:** thợ nghỉ → ẩn khỏi chips; rebook-from-look → prefill service+tech+color note.

#### I2. `book2` — Review Request

- **Purpose:** Xác nhận trước khi gửi — nói rõ đây là request.
- **UI & data:** bảng tóm tắt: Salon / Service / Technician / Requested time / **Booking reward** (điểm thưởng đặt qua app — do tiệm đặt); Note for salon (optional); "Send Booking Request". Note: "This is a request, not an instant booking. The salon will confirm within minutes by app/SMS, or suggest another time. **No charge until you arrive.**"
- **Behaviors:** Send → `book3` state pending.
- **Backend:** `POST /booking-requests` → notify business app + SMS fallback.

#### I3. `book3` — Request Sent → Confirmed

- **UI & data:** State 1: "Request Sent! [salon] usually confirms within 10 minutes. We'll text and notify you." + "▶ Salon confirms (demo)". State 2: "Booking Confirmed! **+points** added for booking in-app"; "Add to Calendar" (prototype: toast `cal`), Done → `home` (appointment card xuất hiện ở home).
- **Backend:** states `requested → confirmed | suggested_alt | declined | expired(24h)`; confirm → ledger `booking_bonus` + upcoming_appointment.
- **Edge cases:** tiệm đề xuất giờ khác → notification + màn chọn chấp nhận (V1: xử lý qua SMS/app message, không cần UI riêng); khách hủy → out of scope V1 (gọi tiệm).

---

### Module J — Discovery

#### J1. `explore` — Explore businesses

- **Purpose:** Tìm business NEXORA theo dịch vụ — kết quả dựa trên **bằng chứng thật**: real check-ins, real prices (từ receipts), real photos.
- **Entry:** tab Explore.
- **UI & data:**
  - Search: "Find businesses on Nexora Touch — Search by the service you need" (VD: "dip powder", "facial").
  - Filter chips: All, 🎉 Just opened, Nail, Hair, Barber, Spa, Lash & Brow, Massage, Coffee, Food, Fitness, Auto, Other.
  - **Card "Just opened"** (Gói Khai Trương): badge, "Opened this week", deal khai trương "30% OFF everything + free nail art add-on + double points", CTA "See opening deal" → `offers`.
  - **Card Sponsored** (ads native — trả phí theo check-in, xem BR-AD §5): label "Sponsored" bắt buộc, vẫn phải có proof line "✓ 89 real check-ins this month · dip powder $42 (real receipts)".
  - **Card tiệm quen**: "2,450 pts · Your favorite", proof "✓ 128 real check-ins this month · dip powder $45 (real receipts) · 24 real looks", View / Book.
  - **Cards co-op partner**: khoảng cách, offer qua co-op, proof line.
  - **Cards thường**: "On Nexora Touch · Earn points on your first visit" + proof nếu có.
  - Empty state: "😕 No businesses found — Try another name or category."
  - CTA "📨 Invite a business you visit — they'll give you welcome points when they join" (viral loop, prototype: toast `invited`).
  - Geo push note + "▶ Simulate: walking near Golden Glow (demo)".
- **Behaviors:** pickFilter lọc client-side theo category; search lọc theo tên + dịch vụ; card → `business`.
- **Backend:** `GET /explore?q=&category=&lat=&lng=` — proof metrics (check-in count, giá từ receipt OCR, looks count) do **hệ thống tự tính, business không sửa được** (cùng nguyên tắc với marketplace BR-01). Sponsored slot: max vị trí cố định, đánh dấu `sponsored: true`.
- **Edge cases:** category chưa có tiệm → empty state (đừng giấu category); location denied → sort theo alphabet + hiện notice.

#### J2. `business` — Business profile

- **Purpose:** Hồ sơ business: offers, book, directions, proof.
- **Entry:** explore card; activity message.
- **UI & data:** cover, tên + "Co-op alliance partner", buttons Book (toast `book` — stub) / Directions (toast `map` — stub) / ♥ favorite (toast `fav`); Available Offers: "$10 Credit — Cost: 800 pts via co-op" → redeem sheet; "New Customer Facial 15% OFF · 500 pts" → redeem sheet; footer "⭐ 4.8 (214 reviews) · Open 9:30 AM – 7:30 PM · Points you earn here are managed by [business] and stored in your Nexora account."
- **Backend:** `GET /businesses/{id}` + offers khả dụng theo alliance của khách.
- **Edge cases:** business không cùng alliance → offers hiện nhưng nút redeem disabled kèm giải thích; giờ mở cửa realtime.

#### J3. `offers` — Offers feed + wish alerts

- **Purpose:** Feed ưu đãi cá nhân hóa CÓ KIỂM SOÁT chống spam + hệ thống "đặt gạch chờ deal" (wish alerts).
- **Entry:** home Quick Action; explore "See opening deal"; allmenu.
- **UI & data:**
  - Filter row 1: All / Near me / Ending soon / Saved. Row 2 categories: All types / Nail / Spa / Hair / Coffee / Food.
  - Offer cards: Grand Opening 30% OFF ("🎉 New business near you — shown because you enabled Nearby deals · **max 1 opening promo/week**" — rule chống spam); 20% OFF Gel Set Tue&Wed "Ends in 2 days"; $10 Credit Network members → redeem sheet; Happy Hour double points; 10% OFF lunch "Ends today" → redeem sheet; 2 public offers "new to you". Buttons: Save (`saveOffer`) / Use.
  - Empty state → dẫn xuống wish alert.
  - **🔔 Wish alerts:** "Tell us what you're hoping for — the moment a business posts a matching offer, you get a notification." Input + "＋ Add"; wishes hiện dạng chips xóa được ("Pedicure deal", "Facial under $50"); "▶ Simulate: a matching offer arrives (demo)". Privacy: "**Businesses never see who you are — only anonymous demand**, e.g. '12 customers nearby are waiting for a pedicure deal.'"
  - Footer giải thích nguồn feed: offers từ business đã visit/opt-in + public offers gần đó khi search — "that's how new places reach you **without spamming you**. Manage in Profile → Notifications."
- **Backend:** `GET /offers?filter=&category=`; `POST /wishes {text}` → matching engine so khớp offer mới → push notification; demand aggregation ẩn danh cho business dashboard ("12 customers nearby waiting for X").
- **Edge cases:** feed rules chống spam (LOCKED): chỉ business đã visit/opt-in vào feed mặc định; public offers chỉ xuất hiện khi khách chủ động search/lọc; opening promo tối đa 1/tuần/khách; Saved trống → empty state.

---

### Module K — Growth

#### K1. `referral` — Invite Friends

- **Purpose:** Referral 2 chiều **bằng điểm do business tài trợ** — bạn +50, bạn mới +100.
- **Entry:** home CTA; profile; allmenu.
- **UI & data:** "Referral Reward: You +50 · Friend +100 — Your friend gets +100 from the first business they check in at. You get +50 when they earn their first points."; invite code `REF-JESS` + Copy Code (toast `copied`) / Share Link (native share sheet, prototype toast `share`); Your Invites list: "Joined · earned first points ✓" / "Invited · not joined yet — Pending". Footer (QUAN TRỌNG): "Referral rewards are **issued and funded by each business** — amounts are set by the business your friend checks in at (here: Bitcoin Nail Bar's 50/100). Points release **after your friend's first paid visit**."
- **Backend:** referral code per customer; attribution: friend nhập code/link → first check-in tại business X → business X phát 100 cho friend, 50 cho referrer (theo config của X). Release sau **first paid visit** (chống farm).
- **Edge cases:** business tắt referral → không phát, hiện "this business doesn't offer referral rewards"; self-referral (cùng device/số) → chặn. **Phân biệt với affiliate program (đại lý bán NEXORA cho business — trả CASH 1099-NEC, KHÔNG BAO GIỜ trả điểm): referral trong app khách là điểm, affiliate là hệ thống khác hoàn toàn, không xuất hiện trong app này.**

---

### Module L — Settings

#### L1. `profile` — Profile

- **Purpose:** Hub cài đặt.
- **UI & data:** avatar + tên + Edit Profile (**demo stub**); Settings list: Language (toggle EN/VI runtime), Payment Methods (**demo stub**), Messages & Privacy → `msgprefs`, Privacy policy (**demo stub**), Invite Friends → `referral`, "How the app works — Replay" (mở lại onboarding carousel), Log Out → `login1`.
- **Backend:** `GET/PUT /profile`; log out xóa session local.

#### L2. `msgprefs` — Messages & Privacy

- **Purpose:** Trung tâm quyền riêng tư — khách kiểm soát từng nguồn tin nhắn và 2 quyền dữ liệu.
- **Entry:** profile; home For You footer link.
- **UI & data:**
  - **Businesses you visited**: toggle per business (tắt = STOP marketing texts của business đó ngay lập tức).
  - **Network**: "Offers from nearby Nexora partners" toggle; "Booking reminders (recommended)" toggle.
  - **Notifications**: "📍 Nearby deals (uses location)" toggle; "✨ AI suggestions from your history" toggle (tắt → home ẩn khối For You).
  - Notes: "Nearby deals are **push notifications — not SMS**. Your location is used only to trigger the alert and is **never shared with businesses**."; "Turning a business off stops its marketing texts immediately — same effect as replying STOP. **Booking confirmations for appointments you request are always sent.**"
- **Behaviors:** togglePref → lưu ngay (toast `pref`), không cần Save button.
- **Backend:** `PUT /preferences` — mỗi lần đổi tạo consent/revoke record kèm timestamp (đồng bộ 2 chiều với SMS STOP: khách nhắn STOP → toggle tự tắt).
- **Edge cases:** tắt hết vẫn nhận transactional (booking confirm, OTP); revoke phải propagate ≤ vài phút tới SMS gateway.

---

## 5. Cross-cutting business rules

| ID | Rule | Áp dụng ở |
|---|---|---|
| BR-C01 | Points = per-business balances trong 1 tài khoản NEXORA; không có số dư tổng; không cash-out, không chuyển nhượng, không bán (điều khoản 8). | wallet, rewards, redeem, history, mọi copy |
| BR-C02 | NEXORA không phát điểm, không đặt giá; mọi rate (earn, redeem, co-op price, tip 10×, direct-pay +20%, booking bonus, welcome 25, referral 50/100) là **cấu hình per-business**. Con số trong prototype là demo. | toàn app |
| BR-C03 | Điểm chỉ được cộng sau khi business **confirm** (tip, direct pay, booking). Pattern chung: pending ⏳ → confirmed ✅. | tipdone, paydone, book3 |
| BR-C04 | NEXORA không bao giờ chạm dòng tiền — thanh toán qua Zelle/Venmo/CashApp/AppleCash/PayPal của business/staff; app chỉ hiện method đã được chủ sở hữu bật. | tip, pay |
| BR-C05 | Feedback +15 mọi rating, private; Google share optional, không thưởng, không gating theo rating. 1 feedback/visit. | review |
| BR-C06 | SMS: double opt-in (Y), consent ≠ điều kiện nhận điểm, STOP/HELP, consent records immutable kèm timestamp; transactional luôn được gửi. | onb2, onb3, msgprefs |
| BR-C07 | Chống spam feed: mặc định chỉ business đã visit/opt-in; public offers chỉ khi khách search; opening promo ≤ 1/tuần/khách; wish demand ẩn danh tuyệt đối với business. | offers, explore |
| BR-C08 | Proof metrics ở Explore (check-ins, giá thật, looks count) do hệ thống tự tính từ dữ liệu giao dịch — business không sửa được. Sponsored card bắt buộc label "Sponsored" và vẫn hiện proof. | explore |
| BR-C09 | Ads model: business trả phí **theo check-in thực tế** (pay-per-check-in), 4 vị trí đặt (đã chốt trong docx §ads) — không CPM/CPC. | explore, offers, home For You |
| BR-C10 | Looks private: chỉ khách + business của visit đó xem được. | looks |
| BR-C11 | Referral trong app = điểm do business tài trợ, release sau first **paid** visit. Affiliate (đại lý) = CASH only, 1 tầng, 1099-NEC — KHÔNG tồn tại trong app khách. | referral |
| BR-C12 | Ledger append-only; mọi biến động điểm trace về ref giao dịch gốc. | history, mọi flow cộng/trừ điểm |
| BR-C13 | Marketplace 3 phía (Explore reference + follow-tech): toàn bộ rule, flow, AC, test case xem `three-sided-marketplace-spec.md`. Không duplicate ở đây. | explore (V-next) |
| BR-C14 | **Point expiry:** mỗi business tự đặt chính sách hết hạn điểm (đề xuất default 12 tháng kể từ khi earn, rolling). App PHẢI cảnh báo trước khi hết hạn: chip trên home points card + dòng trong wallet + push notification trước 30/7/1 ngày. Điểm hết hạn = ledger entry `expire` (âm), trace được. Vừa kiểm soát point liability cho business, vừa là công cụ kéo khách quay lại. | home, wallet, history, push |
| BR-C15 | **Push pre-permission:** KHÔNG gọi OS permission dialog khi mở app. Chỉ hỏi sau khoảnh khắc có giá trị đầu tiên (sau onb4 — vừa nhận welcome points), qua modal pre-permission giải thích lợi ích (confirm booking/payment, điểm sắp hết hạn, wish alerts) với 2 nút Turn on / Maybe later. "Maybe later" → hỏi lại tối đa 1 lần, tại moment giá trị khác (sau redeem đầu tiên). | onb4, pushmodal |
| BR-C16 | **Confirm SLA:** mọi màn pending (tip/pay/booking) hiển thị kỳ vọng thời gian ("usually confirms within 10 minutes" — tính từ median thực tế của từng business). Business app nhận push nhắc sau 15 phút chưa confirm, nhắc lại sau 2h. Metric `time_to_confirm` đo từ ngày đầu. | tipdone, paydone, book3 |
| BR-C17 | **Offline resilience:** QR scan + check-in hoạt động với mạng yếu: request queue client-side, retry backoff, UI "đang gửi lại…" thay vì lỗi chết; timestamp tính lúc scan. Màn đọc dữ liệu có cache local — không mạng vẫn xem được điểm/looks/history bản gần nhất. | scan, toàn app |

---

## 6. Data model sketch (đề xuất — dev điều chỉnh theo hệ hiện có)

```
customers            (id, phone UNIQUE, name, avatar_url, lang, referral_code, created_at)
consent_records      (id, customer_id, scope[business:{id}|network|nearby_push|ai_suggest],
                      action[grant|revoke], confirmed_at, method[onboarding|prefs|sms_stop|sms_y], created_at)  -- append-only
point_balances       (customer_id, business_id, points, credits)                -- materialized từ ledger
ledger_entries       (id, customer_id, business_id, type[visit|welcome|feedback|tip_bonus|directpay_bonus|
                      booking_bonus|referral|redeem|adjust], points_delta, ref_type, ref_id, created_at)  -- append-only
business_rules       (business_id, earn_rule, welcome_points, tip_multiplier, directpay_bonus_pct,
                      booking_bonus, referral_referrer_pts, referral_friend_pts, redeem_min)
reward_menu_items    (id, business_id, type[service_credit|free_service|percent_code], title, cost_pts,
                      expires_days, active)
alliance_offers      (id, alliance_id, accepting_business_id, title, cost_pts, active)
redemptions          (id, customer_id, offer_ref, business_id, cost_pts, status[ready|used|expired],
                      qr_payload, created_at)
checkins             (id, customer_id, business_id, station, staff_profile_id?, source_qr, created_at)
tips                 (id, customer_id, staff_profile_id, business_id, amount, method,
                      status[pending|confirmed|expired], confirmed_at)
direct_payments      (id, customer_id, business_id, amount, method, status[pending|confirmed|expired],
                      confirmed_amount?, receipt_ref)
booking_requests     (id, customer_id, business_id, service, tech_pref, slot_pref, note,
                      status[requested|confirmed|suggested_alt|declined|expired])
looks                (id, customer_id, business_id, visit_id?, photo_url, service, color_code, note)
feedback             (id, customer_id, visit_id UNIQUE, business_id, stars, text, created_at)
offers_feed / saved_offers / wishes (id, customer_id, text, active)
referral_invites     (id, referrer_id, friend_phone_hash, status[invited|joined|rewarded], business_id?)
```

**Services/jobs:** SMS gateway 2 chiều (OTP, double opt-in Y, STOP sync); confirm-timeout jobs (tips/payments 72h, bookings 24h); voucher/redemption expiry; wish-matching engine + anonymous demand aggregation; proof-metrics daily batch (check-ins, receipt price OCR, looks count).

---

## 7. Test cases (P0 = chặn release)

| ID | P | Scenario | Expected |
|---|---|---|---|
| TC-C01 | P0 | Tip/direct-pay/booking khi business CHƯA confirm | Không có ledger entry; UI ở trạng thái pending; không điểm |
| TC-C02 | P0 | Business confirm tip $10 | +100 pts (10×) đúng business, ledger ref về tip record |
| TC-C03 | P0 | Redeem khi balance < cost | Server từ chối; UI disabled + thông báo thiếu điểm |
| TC-C04 | P0 | Double-tap Confirm Redeem | Chỉ 1 redemption (idempotency), trừ điểm 1 lần |
| TC-C05 | P0 | Feedback 1⭐ | Vẫn +15 pts; đi vào inbox private của tiệm; Google share không hiện điều kiện |
| TC-C06 | P0 | Farm feedback: gửi 2 lần cùng visit | Lần 2 bị chặn, không cộng điểm |
| TC-C07 | P0 | Onboarding Skip consent | Account active, có 25 pts, zero marketing SMS; booking confirm vẫn gửi |
| TC-C08 | P0 | Khách nhắn STOP | Toggle msgprefs tự tắt ≤ 5 phút; consent revoke record có timestamp |
| TC-C09 | P0 | Không reply Y trong 72h | Consent đóng `unconfirmed`; zero marketing texts; điểm giữ nguyên |
| TC-C10 | P0 | Kiểm tra copy toàn app | Không chỗ nào gợi ý đổi điểm ra tiền mặt/chuyển nhượng (điều khoản 8) |
| TC-C11 | P0 | Welcome gift với số đã tồn tại | Chuyển login, KHÔNG cộng welcome points lần 2 |
| TC-C12 | P0 | Check-in 2 lần liên tiếp cùng tiệm < X phút | Lần 2 bị chặn |
| TC-C13 | P1 | Cross-redeem co-op | Trừ đúng điểm business nguồn; settlement record giữa 2 business theo giá alliance |
| TC-C14 | P1 | Business sửa giá redeem | Redemption cũ giữ giá cũ; redemption mới giá mới |
| TC-C15 | P1 | Tắt AI suggestions trong msgprefs | Home ẩn khối For You ngay |
| TC-C16 | P1 | Tắt toggle 1 business trong msgprefs | Business đó ngừng SMS marketing; business khác không ảnh hưởng |
| TC-C17 | P1 | Referral: friend check-in nhưng chưa paid visit | Points chưa release (Pending); release sau first paid visit |
| TC-C18 | P1 | Self-referral cùng số/device | Chặn |
| TC-C19 | P1 | Wish alert matching | Business post offer khớp wish → push đến khách; business chỉ thấy demand ẩn danh dạng đếm |
| TC-C20 | P1 | Opening promo spam | Khách nhận tối đa 1 opening promo/tuần dù có 5 tiệm mới |
| TC-C21 | P1 | QR parse | `nexoratouch.com/touch/[salon]/[station]?staffProfileId=` resolve đúng business/station/staff; URL lạ → error |
| TC-C22 | P1 | Payment methods disabled | Method thợ/tiệm chưa bật không chọn được, có lý do hiển thị |
| TC-C23 | P1 | Đổi ngôn ngữ EN↔VI runtime | Mọi màn đổi ngay, không sót text |
| TC-C24 | P2 | Looks privacy | Business B không query được looks của visit tại business A |
| TC-C25 | P2 | OTP brute force | 5 lần sai → khóa 15 phút; resend cooldown 30s |
| TC-C26 | P2 | Ledger trace | Mọi entry trong history mở được giao dịch gốc |
| TC-C27 | P2 | Empty states | Explore không kết quả, Offers trống, Looks trống, Wallet 1 business — đều có empty state đúng thiết kế |
| TC-C28 | P0 | Expiry job chạy đúng ngày | Điểm quá hạn → ledger entry `expire` âm, balance giảm đúng, trace được; KHÔNG expire sớm |
| TC-C29 | P1 | Cảnh báo expiry | Điểm hết hạn ≤60 ngày → chip trên home + dòng wallet; push trước 30/7/1 ngày (nếu đã bật push) |
| TC-C30 | P1 | Push pre-permission | OS dialog KHÔNG hiện khi mở app lần đầu; modal hiện sau onb4; "Maybe later" → hỏi lại đúng 1 lần sau redeem đầu |
| TC-C31 | P1 | Offline check-in | Tắt mạng → scan QR → UI "đang gửi lại…"; bật mạng → check-in tự gửi, timestamp = lúc scan |
| TC-C32 | P1 | Nhắc business confirm | Tip pending 15 phút → business app nhận push nhắc; 2h → nhắc lần 2 |
| TC-C33 | P2 | Analytics funnel onboarding | Đủ events scan→claim→consent→Y→active với đúng properties (xem §11) |

---

## 8. Demo stubs trong prototype (KHÔNG phải bug — cần build thật)

| Stub | Màn | Ghi chú build thật |
|---|---|---|
| Open Camera / startScan | scan | Camera + QR parser theo format §E1 |
| Enter Code (manual) | scan | Nhập mã tay khi camera hỏng |
| Book / Directions / ♥ | business | Book → `book1` prefill business; Directions → maps deep-link; favorite → persist |
| Scan receipt (OCR) | looks | OCR giá dịch vụ từ hóa đơn — nguồn "real prices" cho Explore |
| Edit Profile / Payment Methods / Privacy | profile | CRUD thật |
| "▶ Salon confirms (demo)" buttons | tipdone, paydone, book3 | Thay bằng webhook/push từ business app |
| Simulate geo push / wish push | explore, offers | Push notification thật (OS-level) |

## 9. Open questions cho PO

1. **Cửa sổ service check-in retry:** đã chốt 120 phút; exact semantic retry reuse một record, khác service hoặc từ phút 120 là lượt mới.
2. **Timeout confirm**: 72h cho tip/pay, 24h cho booking — đúng ý anh chưa?
3. **Khách hủy booking đã confirm** — V1 gọi tiệm hay cần nút hủy trong app?
4. **Business rời NEXORA** — điểm khách tại business đó: freeze hiển thị bao lâu trước khi ẩn?
5. **Custom tip amount** — prototype chỉ có $5/$10/$20; app thật có cho nhập tay không? (đề xuất: có, min $1.)
6. **Default expiry điểm** — đề xuất 12 tháng rolling, business đổi được trong dashboard; có cho phép "không bao giờ hết hạn" không? (rủi ro: liability phình vô hạn.)

## 10. Definition of Done (per screen)

- Khớp prototype về layout/luồng bấm (prototype = UI source of truth).
- Song ngữ đầy đủ EN/VI, đổi runtime.
- Mọi rule BR-C01…C13 liên quan được enforce **server-side** (client chỉ là hiển thị).
- Test cases P0 của module pass 100%, P1 pass trước release.
- Empty/error/pending states có đủ — không màn nào chết khi thiếu data.

## 11. Analytics events (bắt buộc instrument từ V1)

**VI:** Không đo thì không biết funnel rơi ở đâu. Mọi event kèm `customer_id (hashed), business_id, timestamp, platform, app_version`. Naming: `snake_case`, nhóm theo prefix.

| Event | Properties | Đo cái gì |
|---|---|---|
| `onb_qr_scanned` | source_business | Đầu funnel onboarding |
| `onb_phone_submitted` | — | Bước claim |
| `onb_consent_choice` | choice[agree\|skip], toggles[] | Tỷ lệ opt-in SMS |
| `onb_double_optin_confirmed` | elapsed_sec | Tỷ lệ reply Y + thời gian |
| `onb_completed` | — | Account active — cuối funnel |
| `push_prompt_shown` / `push_prompt_result` | result[allow\|later\|os_deny], moment[onb\|post_redeem] | Hiệu quả pre-permission (BR-C15) |
| `checkin_completed` | offline_queued[bool] | Nhịp sống của app + tỷ lệ offline (BR-C17) |
| `redeem_confirmed` | offer_type, cost_pts, is_coop | Engagement đổi thưởng |
| `tip_sent` / `tip_confirmed` | amount, method, time_to_confirm_sec | Funnel tip + SLA (BR-C16) |
| `directpay_sent` / `directpay_confirmed` | amount, time_to_confirm_sec | Funnel pay + SLA |
| `booking_requested` / `booking_confirmed` | time_to_confirm_sec | Funnel booking + SLA |
| `feedback_submitted` | stars | Volume + phân bố rating |
| `explore_search` | query, results_count | Nhu cầu tìm kiếm, query 0 kết quả |
| `offer_saved` / `offer_used` | offer_id | Hiệu quả offers feed |
| `wish_added` / `wish_matched_push_tap` | text | Demand signal + hiệu quả wish alert |
| `referral_shared` / `referral_joined` | channel | Viral loop |
| `points_expiry_warning_shown` / `points_expired` | amount | Hiệu quả cảnh báo expiry (BR-C14) |
| `lang_changed` | to[en\|vi] | Tỷ lệ dùng tiếng Việt |

**Dashboards tối thiểu tuần đầu:** funnel onboarding (5 bước), median `time_to_confirm` per business, DAU/WAU, % check-in offline-queued, push opt-in rate.

---

*— End of spec. Marketplace 3 phía: see `three-sided-marketplace-spec.md`. Business rationale: see `NEXORA_Bo_Spec_Chot_App_Khach.docx`.*

## Customer Salon Scan, Guest Checkout và Payment Proof

### Mục đích và điểm vào

Customer mở screen `scan`, quét QR `https://nexoratouch.com/touch/{businessId}/{station}` và xác nhận đúng salon. **Bộ định tuyến ngữ cảnh QR (QR context router)** chỉ resolve `{businessId, station, staffProfileId?}` và không đoán mục đích từ `station`; sau đó khách chọn check-in, tip hoặc thanh toán. Thành viên và guest đều dùng `guest-checkin-view` để chọn dịch vụ; chỉ session có profile/số điện thoại đã xác minh mới được prefill. Khi đăng xuất, CTA member bị vô hiệu hóa và khách vẫn có thể dùng guest entry. Submit của cả hai tạo service check-in canonical trong `guestCheckins` và mở Live Ticket. Guest Checkout luôn bắt đầu từ một `guestCheckinId`, không bắt đầu từ tên hoặc số điện thoại tự do.

### UI và dữ liệu

- `scan`: `scan-camera-view` → `scan-context-view` → `guest-checkin-view`.
- Service check-in thành công luôn mở Customer Live Ticket trong `customer-salon-operations.html`; không tự mở thanh toán.
- Tip từ QR chỉ bật khi `staffProfileId` canonical có ít nhất một payment method; `prepareTipFromScan` và `createTipFromScan` re-parse payload để khóa đúng business/staff. `ui.pendingContext.tipEntryIntent = scan | generic`, `tipScanReplayId` và fingerprint business/station/staff giữ authority qua save/reload hoặc lỗi điều hướng: retry exact amount/method/note trả lại cùng tip `pending`, input/context/record sai thì fail closed. Quét lại cùng QR khi tip còn pending re-enter record đó; quyết định same/different QR dùng **scan context cũ được parse canonical**, không tin replay fingerprint. Quét một QR canonical khác là explicit new scan intent, xóa replay authority cũ nhưng giữ tip pending cũ trong lịch sử rồi khóa transaction mới đúng recipient mới. Nếu context cũ không resolve canonical thì `stageSalonScan` phải trả `invalid_tip_replay` **trước mọi mutation**; không được ghi QR mới để rửa authority hỏng. Cùng QR chỉ tạo tip khác sau khi tip trước terminal. URL không sở hữu replay ID hoặc transaction.
- Tóm tắt thành viên trên scan (tên, điểm, staff/service riêng) chỉ render khi `session.authenticated` và phone session/profile khớp chính xác. Khi đăng xuất phải dùng placeholder VI/EN và xóa name/phone đã prefill từ hồ sơ khỏi form dùng chung.
- Payment từ QR chỉ liệt kê ticket `completed` đúng business bằng join ID canonical giữa `guestCheckins` và Operations. Trên thiết bị dùng chung, candidate chưa sở hữu phải **ẩn/opaque toàn bộ chi tiết phiếu, dịch vụ và số tiền trước khi xác minh 4 số cuối**; session/profile đã xác minh đúng phone mới được thấy nhãn đầy đủ và miễn last-4. Input chỉ nhận đúng 4 chữ số, CTA bị khóa cho tới khi hợp lệ, mismatch hiện inline. Last-4/error phải xóa khi canonical scan context hoặc selected `guestCheckinId` thay đổi, kể cả scan/candidate replacement từ code; nếu cùng candidate trở thành owned sau OTP thì cũng xóa input, error và `aria-invalid`. Rerender cùng identity như đổi ngôn ngữ phải giữ input khi vẫn chưa owned. Action đọc lại Operations snapshot tại click rồi dùng chung completed-gated checkout handoff.
- Ticket checkout mở `guest-checkout-view` → `payment-proof-view` cho Zelle/Venmo. `ui.payViewIntent` lưu explicit checkout/direct-pay intent: scan/handoff re-arm `checkout`, còn generic Pay Salon Direct ghi `direct`; vì vậy reload chỉ khôi phục exact draft khi intent là checkout và vẫn giữ direct pay nếu khách vừa chủ động mở direct. Context thiếu/stale/corrupt phải về direct pay an toàn. Nếu checkout đã pending/confirmed/rejected, scan re-entry mở đúng nested view trong `paydone` và không tạo artifact trùng.
- **Legacy direct pay / Pay Salon Direct** vẫn là giao dịch tự do nhập số tiền ở `pay`; nó không phải ticket checkout và không được dùng để bỏ qua lifecycle dịch vụ.
- `paydone`: `payment-pending-view` → `payment-confirmed-view` hoặc `payment-rejected-view`.
- Số tiền lưu bằng integer cents; tip lưu bằng basis points `0 | 1500 | 1800 | 2000`.
- Customer key sở hữu `guestCheckins`, `checkoutDrafts`, `paymentProofs`, `receipts`, `guestRewardClaims`, `referrals`.

### Hành vi và trạng thái

Operations là authority cho lifecycle `in_service → completed`. Ticket phải ở trạng thái **ticket completed** trước khi Pay trên Live Ticket hoặc Scan Payment có thể mở checkout; UI disabled chỉ là trợ giúp, domain helper vẫn re-check exact ticket. `checkoutDraft.status` đi `draft → pending_verification → confirmed | rejected`. `paymentProof.status` đi `draft → pending_verification → verified | rejected`. Pending hoặc rejected không tạo receipt, không cộng balance và không ghi ledger. Verified tạo receipt bất biến và các `guestRewardClaims.status = pending`; claim chỉ merge sau OTP với đúng số điện thoại, vào đúng `businessId`, đúng một lần.

Số điện thoại là verified identity: profile editor không được thay đổi `profile.phone` hoặc `session.phone`. Đổi số bắt buộc đi qua OTP rồi mới đồng bộ profile/session; sửa tên/avatar không được tự cấp quyền sở hữu guest check-in.

### Ranh giới backend

Prototype chỉ **mô phỏng camera và payment callback**, upload, Front Desk verification và thanh toán bằng localStorage. Dropdown role Operations cũng chỉ là actor simulator, không phải authorization production. Card, Zelle, Venmo và Pay at Counter chuyển tiền bên ngoài NEXORA; Payment Proof không chuyển tiền và không chứng minh giao dịch đã hoàn tất cho tới khi Front Desk xác minh. Production cần camera decoder/permission, backend session + business membership, API idempotency, object storage có scan malware, payment/deep-link/webhook integration, OTP/SMS và audit log phía server.

### Edge cases

- QR sai origin/path/business/station bị từ chối mà không đổi state.
- Ticket `in_service`, ticket khác business, duplicate/corrupt Operations snapshot hoặc selector giả đều không tạo checkout.
- Hai lần mở checkout cho cùng guest trả draft hiện có; re-entry terminal mở đúng `paydone`.
- Proof verify/reject lặp lại không tạo receipt, claim hoặc ledger trùng.
- localStorage quota đầy: thử lưu metadata proof không ảnh và báo rõ cho khách.
- Add-on khác business, sai ticket, sai 4 số cuối hoặc đã resolve bị từ chối atomic.
- Candidate chưa xác minh không lộ ticket number/service/amount; đổi profile phone không qua OTP không thể bỏ qua last-4.
- Session đăng xuất không lộ tên, phone prefill, điểm hoặc tóm tắt thành viên còn lưu trên thiết bị; OTP đúng owner xóa last-4 mismatch cũ.
- Double-submit service check-in trong 120 phút và retry tip scan qua reload/navigation/same-QR re-scan đều reuse exact record; replay mơ hồ/hỏng không tạo record thay thế.
- Referral tự giới thiệu, chưa joined hoặc chưa có paid visit không được cộng điểm.

### Acceptance tests

1. Quét hai QR salon khác nhau hiển thị đúng business và balance riêng.
2. Guest check-in không thay đổi balance của member đang đăng nhập và mở Live Ticket trước.
3. Pay trên Live Ticket và Scan Payment đều chỉ mở checkout từ exact ticket `completed`; ticket `in_service` bị chặn ở domain.
4. `$55.00 - $5.50 + $15.00 + 18%` cho total `$76.11` bằng integer cents.
5. Proof pending/rejected tạo `0` điểm; verified tạo đúng một receipt và pending claims.
6. OTP khác số guest không merge; OTP cùng số merge đúng business một lần.
7. Referral chỉ release `50` điểm business-funded sau sự kiện paid visit.
8. Scan staff QR mở Tip đúng business/staff/method; business-only QR hiển thị lý do Tip bị vô hiệu hóa.
9. Member scan mở form dịch vụ đã prefill và tạo `guestCheckins` canonical trước Live Ticket; guest entry để trống tên/số điện thoại.
10. Reload exact draft checkout trở lại nested checkout; pending context stale hoặc thiếu owner trở về direct pay.
11. Hai guest completed trên thiết bị chung chỉ hiện nhãn opaque; sai last-4 báo inline, đúng last-4 mới mở chi tiết checkout.
12. Đăng xuất rồi render scan ở VI/EN không lộ tên/phone/điểm cũ; OTP đúng owner xóa lỗi last-4 trên cùng candidate.
13. Tip scan double-send, reload và quét lại cùng QR khi pending chỉ có một transaction; sau confirm mới cho tạo tip scan mới.
