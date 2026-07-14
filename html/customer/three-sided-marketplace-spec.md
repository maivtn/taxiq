# NEXORA TOUCH — 3-Sided Marketplace Specification
## Sàn kết nối Khách · Thợ · Chủ tiệm

| | |
|---|---|
| **Document status** | Draft v1.0 — chốt qua phiên Q&A với Product Owner ngày 09/07/2026 |
| **Product Owner** | Brian Nguyen (VlinkPay LLC) |
| **Audience** | Dev team, QC team, AI agent thực thi |
| **Convention** | Khung tài liệu, user story, acceptance criteria, tên trường: **English**. Giải thích nghiệp vụ: **tiếng Việt**. |
| **Related docs** | `NEXORA_Bo_Spec_Chot_App_Khach.docx` (chương 12), `NEXORA_Marketplace_3_Phia_Demo.html` (demo ý tưởng), `NEXORA_Phan_Dinh_Trach_Nhiem.docx` (nguyên tắc nền tảng) |

---

## 1. Overview / Tổng quan

**Problem.** Hiện tại thợ nail tìm chỗ làm và chủ tiệm tìm thợ qua Facebook groups, báo rao, truyền miệng — toàn thông tin **tự khai**, không kiểm chứng được. Khách tìm dịch vụ qua Google/Yelp — dựa trên review, cũng tự khai.

**Solution.** NEXORA là bên duy nhất nắm **dữ liệu giao dịch thật** (check-in, tip, thanh toán, khách quay lại) của cả tiệm lẫn thợ. Marketplace này biến dữ liệu đó thành sàn kết nối 3 phía mà mọi con số đều có bằng chứng:

- **Khách** tìm dịch vụ → kết quả kèm bằng chứng giao dịch (đã có trong tab Explore của customer app).
- **Thợ** tìm chỗ làm → thấy số liệu thật của tiệm; ứng tuyển **ẩn danh**.
- **Chủ** tìm thợ → thấy năng suất thật của thợ (dạng làm thô); mời phỏng vấn qua hệ thống.

**Core differentiator / Điểm khác biệt duy nhất:** *mọi metric hiển thị trên sàn do hệ thống tự tính từ sổ cái giao dịch — không bên nào tự khai hay tự sửa được.*

### 1.1 Goals (V1)
1. Thợ đang có chỗ làm **dám** đăng hồ sơ tìm việc (nhờ ẩn danh + auto-hide).
2. Chủ tiệm tuyển được thợ có bằng chứng năng suất thay vì CV tự khai.
3. Khách giữ được kết nối với thợ quen khi thợ chuyển tiệm (follow-tech, opt-in).

### 1.2 Non-goals (out of scope V1)
- Booking/đặt lịch phỏng vấn có cấu trúc (chỉ chat tự do).
- Booking dịch vụ đúng thợ ở tiệm mới (V2).
- Hợp đồng lao động, xử lý lương, ăn chia — sàn chỉ kết nối, không tham gia thỏa thuận.
- Thợ/tiệm ngoài hệ thống NEXORA (kể cả chế độ "chỉ xem").
- Multi-language UI của sàn (theo cơ chế song ngữ EN/VI sẵn có của từng app).

---

## 2. Decisions locked / Các quyết định đã chốt (nguồn: Q&A 09/07/2026)

| # | Decision | Chi tiết |
|---|----------|----------|
| D1 | Scope V1 = **cả 3 phía** | Khách (Explore + follow-tech), Thợ (staff app), Chủ (business dashboard) |
| D2 | Eligibility = **chỉ user đang hoạt động trên NEXORA** | Không có hồ sơ tự khai; 100% profile có dữ liệu giao dịch |
| D3 | Identity reveal = **2 chiều, chủ lộ trước** | Thợ ẩn danh đến khi chính thợ bấm đồng ý với lời mời cụ thể |
| D4 | Tech metrics = **làm thô + dải số** | ZIP 3 số đầu, kinh nghiệm theo khoảng, metric theo dải |
| D5 | Salon metrics = **hệ thống tự tính, không sửa được** | Chủ chỉ viết mô tả việc (lương, giờ, yêu cầu) |
| D6 | Post-match = **chat 1-1 trong app** | Không lộ phone/email tự động |
| D7 | Pricing = **free toàn bộ khi launch** | Không thu phía nào |
| D8 | Charging trigger = **free quota per salon** | 3 job posts + 10 invites miễn phí trọn đời tiệm; vượt → trả phí (giá TBD) |
| D9 | Auto-hide = **bắt buộc, không tắt được** | Hồ sơ thợ không bao giờ hiện với tiệm thợ đang làm |
| D10 | Customer side = **Explore (reference) + follow-tech opt-in** | Thợ toàn quyền bật/tắt thông báo chuyển tiệm |

---

## 3. Actors & Eligibility / Vai trò & điều kiện tham gia

| Actor | Eligibility rule | Nghiệp vụ |
|-------|-----------------|-----------|
| **Tech (Thợ)** | Có `staff_profile` active + ≥ 1 salon link active + ≥ 1 check-in được ghi nhận trong 90 ngày gần nhất | Thợ không đủ điều kiện thấy màn hình giải thích "cần hoạt động trên NEXORA để tham gia" |
| **Salon Owner (Chủ)** | Business account active + ≥ 50 check-in trong 90 ngày gần nhất | Ngưỡng chặn tiệm "vỏ" lập ra chỉ để dò thợ |
| **Customer (Khách)** | Customer account bất kỳ | Chỉ dùng Explore + follow-tech, không thấy sàn việc làm |

> **VI:** Điều kiện ≥ check-in tối thiểu là để giữ lời hứa "mọi con số là thật" — tài khoản không có giao dịch thì không có gì để hiển thị, và cũng là vector giả mạo.

---

## 4. Business Rules / Quy tắc nghiệp vụ

**BR-01 — System-computed metrics only.** Mọi metric hiển thị trên sàn do hệ thống tính từ transaction ledger theo chu kỳ (daily batch). Không có UI nào cho phép user sửa metric. Metric kèm nhãn kỳ tính (VD "90 ngày gần nhất").

**BR-02 — Tech anonymity by default.** Hồ sơ thợ trên sàn không chứa: tên, ảnh, số điện thoại, email, staff ID, tên tiệm đang làm, ZIP đầy đủ. Hồ sơ hiển thị mã ẩn danh (VD `Tech #A317`) — mã này **tái sinh mỗi 30 ngày** để chặn theo dõi dài hạn.

**BR-03 — Data coarsening cho hồ sơ thợ (D4).**
| Field | Raw | Hiển thị |
|-------|-----|----------|
| Location | ZIP 77084 | `770xx` |
| Experience | 8 năm | `5–10 năm` |
| Visits (90d) | 210 | `200+` (bins: <50 / 50–100 / 100–200 / 200+) |
| Repeat-client rate | 96% | `90–100%` (bins: <70 / 70–80 / 80–90 / 90–100) |
| Avg tip | 25% | `20–25%` (bins: <15 / 15–20 / 20–25 / 25%+) |
| Specialties | do thợ chọn từ danh mục chuẩn | hiển thị nguyên văn |

**BR-04 — Auto-hide khỏi tiệm hiện tại (D9).** Hồ sơ thợ bị loại khỏi **mọi** kết quả search/browse/suggestion của mọi business account thuộc các salon mà thợ có link active. Áp dụng cả khi chủ search trúng 100% tiêu chí. Không có setting để tắt. Khi link staff↔salon bị gỡ (thợ nghỉ), auto-hide với tiệm đó hết hiệu lực sau **30 ngày** (grace period — tránh chủ cũ nhận ra ngay "thợ vừa nghỉ hôm qua = hồ sơ vừa xuất hiện hôm nay").

**BR-05 — Reveal flow 2 chiều, chủ lộ trước (D3).**
1. Chủ gửi **Interview Invite** → thợ thấy: tên tiệm, số liệu tiệm, nội dung lời mời, job post liên quan.
2. Thợ bấm **Accept** → chủ thấy: tên thật, ảnh, số liệu chính xác (không làm thô), lịch sử salon (chỉ số lượng tiệm đã làm, không tên tiệm).
3. Thợ bấm **Decline** hoặc không trả lời trong **14 ngày** → invite hết hạn, chủ không thấy gì thêm.
4. Chiều thợ chủ động: thợ **Apply** vào job post (vẫn ẩn danh) → chủ muốn đi tiếp phải gửi Interview Invite → quay lại bước 1. Không có đường tắt nào lộ danh tính thợ mà không có Accept của thợ.

**BR-06 — Salon job post (D5).** Metric của tiệm (check-ins/tháng, avg tip %, repeat rate, tip payout speed) do hệ thống gắn tự động, hiển thị **số chính xác** (tiệm công khai danh tính nên không cần làm thô). Chủ chỉ nhập: job title, mô tả, loại hình (full/part-time), lương/ăn chia (free text), yêu cầu kỹ năng (chọn từ danh mục chuẩn).

**BR-07 — In-app chat sau match (D6).** Chat 1-1 chỉ mở khi invite được Accept. Không auto-share contact; hai bên tự trao đổi trong chat nếu muốn. Chat log lưu để xử lý tranh chấp/report.

**BR-08 — Free quota (D8).** Mỗi business: 3 job posts + 10 interview invites miễn phí (lũy kế trọn đời, không reset). Vượt quota → paywall (bảng giá TBD — xem Open Questions). Phía thợ và khách: miễn phí vĩnh viễn, không có quota.

**BR-09 — Follow-tech (D10).** Khách bấm "theo thợ" từ lịch sử visit (chỉ theo được thợ đã từng làm cho mình — có visit chung trong ledger). Khi thợ có salon link mới VÀ thợ bật opt-in "báo khách quen": hệ thống push cho followers "Thợ X giờ làm tại [tiệm mới]". Mặc định opt-in = **OFF**. Thợ tắt bất kỳ lúc nào. Chủ tiệm (cũ lẫn mới) không thấy danh sách follower.

**BR-10 — Report & moderation.** Mọi profile/job post/chat có nút Report. Job post vi phạm (phân biệt đối xử, nội dung sai lệch) bị gỡ; 3 lần vi phạm → khóa quyền đăng. Tranh chấp "tuyển ngoài sàn để né phí": không xử lý ở V1 (chấp nhận rủi ro — sàn đang free).

**BR-11 — Platform placement.** Khách → customer app (tab Explore + notification). Thợ → staff app (mục mới "Find Work" — đề xuất đặt trong drawer/More, không chiếm bottom tab). Chủ → business dashboard (menu mới "Hiring").

---

## 5. User Flows / Luồng chính

### Flow A — Thợ tìm chỗ làm (Tech)
1. Staff app → "Find Work" → màn hình opt-in lần đầu: giải thích ẩn danh + auto-hide + consent chia sẻ metric dạng làm thô. Bấm **Agree & create profile**.
2. Hệ thống sinh anonymous profile (BR-02, BR-03). Thợ chọn: specialties (danh mục chuẩn), loại hình mong muốn, khu vực mong muốn (ZIP 3 số), trạng thái `Open to offers` ON/OFF.
3. Thợ browse/search job posts → thấy tin kèm metric thật của tiệm (BR-06).
4. Thợ bấm **Apply anonymously** → chủ nhận application ẩn danh.
5. Chủ gửi Interview Invite → thợ nhận notification, thấy đầy đủ thông tin tiệm.
6. Thợ Accept → identity reveal (BR-05) → chat mở (BR-07).

### Flow B — Chủ tìm thợ (Owner)
1. Dashboard → "Hiring" → tạo job post (BR-06) — trừ quota (BR-08).
2. Browse/search anonymous tech profiles (đã lọc auto-hide BR-04) theo: specialty, khu vực, dải metric.
3. Gửi Interview Invite (trừ quota) — kèm tên tiệm + metric tiệm + lời nhắn.
4. Nhận Accept → thấy hồ sơ đầy đủ → chat.
5. Xem applications ẩn danh từ Flow A bước 4 → muốn đi tiếp phải gửi Invite (không có nút "xem danh tính").

### Flow C — Khách theo thợ (Customer)
1. Customer app → visit history / My Looks → mỗi visit có tên thợ (từ QR check-in) → nút **Follow this tech**.
2. Thợ chuyển tiệm (salon link mới active) + thợ đã bật "báo khách quen" → followers nhận push: "Kayla giờ làm tại Rose Nails & Spa – 3.2 mi".
3. Tap notification → mở trang tiệm mới trong Explore.

---

## 6. Feature Specs — User Stories & Acceptance Criteria

> Format: `US-xx` user story · `AC-xx.y` acceptance criteria (Given/When/Then). QC viết test suite từ AC; các test case mẫu ở mục 8.

### Epic 1 — Tech Anonymous Profile

**US-01.** As a tech, I want to create an anonymous marketplace profile from my real NEXORA work data, so that I can look for a new salon without my current owner finding out.

- **AC-01.1** Given a tech with an active salon link and ≥1 check-in in 90 days, when they open "Find Work" for the first time, then the consent screen must be shown and no profile exists until they tap Agree.
- **AC-01.2** Given a tech without any check-in in 90 days, when they open "Find Work", then they see the ineligibility screen and cannot create a profile.
- **AC-01.3** Given a created profile, when any owner views it, then it displays only: anonymous code, ZIP3 area, experience range, metric bins per BR-03, specialties — and never name/photo/phone/salon names/staff ID.
- **AC-01.4** Given a profile older than 30 days, when the regeneration job runs, then the anonymous code changes and old code returns 404 to viewers.
- **AC-01.5** Given a tech toggles `Open to offers` OFF, when owners browse/search, then the profile appears in no result set within 5 minutes.

### Epic 2 — Job Posts

**US-02.** As a salon owner, I want to post a job with my salon's real performance data attached automatically, so that good techs trust my listing.

- **AC-02.1** Given an eligible owner (≥50 check-ins/90d), when they create a job post, then salon metrics (monthly check-ins, avg tip %, repeat-client %) are attached by the system and there is no UI to edit them.
- **AC-02.2** Given an owner below the eligibility threshold, when they open Hiring, then post creation is blocked with the explanation screen.
- **AC-02.3** Given a job post is published, when a tech views it, then metrics shown must equal the latest daily-batch values (assert against ledger fixture).
- **AC-02.4** Given the owner has used 3 free posts, when they attempt a 4th, then the paywall screen is shown and no post is created.

### Epic 3 — Search & Auto-hide

**US-03.** As an owner, I want to search anonymous tech profiles by specialty, area, and performance range, so that I can shortlist candidates.

- **AC-03.1** Given tech T has an active link to salon S, when any user of salon S's business account searches with any filter combination (including exact match on T's attributes), then T's profile never appears (BR-04).
- **AC-03.2** Given tech T removed their link to salon S fewer than 30 days ago, when salon S searches, then T still does not appear (grace period).
- **AC-03.3** Given tech T removed the link ≥30 days ago, when salon S searches, then T may appear.
- **AC-03.4** Given filters (specialty=dip, area=770xx, repeat-rate bin=90–100%), when search runs, then all results satisfy every filter (AND logic).

### Epic 4 — Apply / Invite / Reveal

**US-04.** As a tech, I want to apply anonymously and reveal my identity only after I accept a specific interview invite, so that I control who knows I'm looking.

- **AC-04.1** Given a tech applies to a post, when the owner views the application, then only the anonymous profile is visible and there is no control to request/see identity other than sending an Interview Invite.
- **AC-04.2** Given an owner sends an Interview Invite, when the tech opens it, then the invite shows salon name, salon metrics, message, and related job post.
- **AC-04.3** Given the tech taps Accept, when the owner views the application thereafter, then the full profile is visible: real name, photo, exact metrics.
- **AC-04.4** Given the tech taps Decline or 14 days pass, when the owner views the invite, then status is Declined/Expired and no identity data was ever exposed.
- **AC-04.5** Given any API response before Accept, when inspected (QC: proxy/log check), then no PII fields of the tech are present in the payload — not merely hidden by UI.

### Epic 5 — In-app Chat

**US-05.** As a matched pair, we want a private chat thread, so that we can arrange an interview without sharing contacts up front.

- **AC-05.1** Given an invite is Accepted, when either party opens the match, then a 1-1 chat thread exists and both can send/receive.
- **AC-05.2** Given no Accept has occurred, when either party attempts to message, then no chat capability is available (API returns 403).
- **AC-05.3** Given a chat exists, when either party taps Report, then the thread is flagged with full log attached for moderation.

### Epic 6 — Follow-tech (Customer)

**US-06.** As a customer, I want to follow a tech who has done my nails, so that I know where they work if they move.

- **AC-06.1** Given customer C has ≥1 visit with tech T in the ledger, when C views that visit, then the Follow button is available. Given no shared visit, then it is not.
- **AC-06.2** Given T has follow-notify opt-in OFF (default), when T gains a new salon link, then no follower receives any notification.
- **AC-06.3** Given T has opt-in ON and gains a new salon link, when the event processes, then all followers receive exactly one push naming T's display name and the new salon.
- **AC-06.4** Given any owner account (old or new salon), when they view any screen, then follower lists/counts of T are nowhere visible.

### Epic 7 — Quota & Billing readiness

**US-07.** As the platform, I want per-salon lifetime free quotas enforced, so that charging can be switched on without rework.

- **AC-07.1** Given a salon has used 10 invites, when they attempt the 11th, then the paywall screen shows and the invite is not sent.
- **AC-07.2** Given quota counters, when posts/invites are deleted or expire, then counters do NOT decrement (lifetime cumulative).
- **AC-07.3** Given the pricing config is empty (launch state), when paywall would trigger, then screen shows "contact us" state instead of a price (giá TBD).

---

## 7. Technical Notes / Ghi chú kỹ thuật

> Mức phác thảo để dev ước lượng — không ràng buộc implementation. Tên bảng/trường là đề xuất.

### 7.1 Data model (new tables)

```
mkt_tech_profiles   (id, staff_profile_id UNIQUE, anon_code, anon_code_rotated_at,
                     open_to_offers BOOL, specialties[], desired_type, desired_zip3,
                     consent_at, created_at)
mkt_tech_metrics    (staff_profile_id, period='90d', visits_bin, repeat_bin, tip_bin,
                     computed_at)               -- daily batch, làm thô tại thời điểm tính
mkt_job_posts       (id, business_id, title, description, employment_type,
                     pay_text, required_skills[], status, created_at)
mkt_salon_metrics   (business_id, monthly_checkins, avg_tip_pct, repeat_pct,
                     computed_at)               -- số chính xác
mkt_applications    (id, job_post_id, tech_profile_id, status, created_at)
mkt_invites         (id, business_id, tech_profile_id, job_post_id NULL, message,
                     status[sent|accepted|declined|expired], sent_at, resolved_at)
mkt_chat_threads    (id, invite_id UNIQUE, created_at)
mkt_chat_messages   (id, thread_id, sender_type, body, created_at)
cust_tech_follows   (customer_id, staff_profile_id, created_at)
mkt_quotas          (business_id, posts_used, invites_used)   -- lifetime, không reset
```

### 7.2 Key services / jobs
- **Metrics batch (daily):** tính `mkt_tech_metrics` (đã làm thô) + `mkt_salon_metrics` từ transaction ledger. Raw số chính xác của thợ chỉ được đọc trực tiếp tại thời điểm reveal (sau Accept), không lưu bản chính xác trong bảng marketplace.
- **Auto-hide filter:** áp ở tầng query — `WHERE tech NOT IN (staff link active với business_id người xem, hoặc link removed < 30 ngày)`. Bắt buộc ở API layer, không phải UI (xem AC-04.5 pattern).
- **Anon-code rotation (monthly):** đổi `anon_code`, giữ id nội bộ.
- **Invite expiry (daily):** invite `sent` quá 14 ngày → `expired`.
- **Follow notify:** trigger khi salon link mới active + opt-in ON → push 1 lần/follower.

### 7.3 Security requirements
- PII của thợ tuyệt đối không có trong bất kỳ response nào trước Accept (server-side enforcement — đây là yêu cầu bảo mật số 1 của tính năng).
- Rate limit search phía owner (chặn scraping dò hồ sơ: VD 100 queries/giờ).
- Chat log immutable, giữ ≥ 12 tháng phục vụ tranh chấp.

---

## 8. Test Cases (mẫu ưu tiên cao cho QC)

| TC | Steps | Expected | Priority |
|----|-------|----------|----------|
| TC-01 | Owner của tiệm S search đúng 100% thuộc tính của thợ T (đang làm ở S) | T không xuất hiện; API payload không chứa T | P0 |
| TC-02 | Thợ T nghỉ tiệm S ngày 0; ngày 15 S search; ngày 31 S search | Ngày 15: không thấy. Ngày 31: có thể thấy | P0 |
| TC-03 | Sniff API response của application ẩn danh (proxy) | Không có trường name/phone/email/staffId/zip đầy đủ | P0 |
| TC-04 | Thợ Decline invite → owner mở lại application | Vẫn chỉ thấy hồ sơ ẩn danh, status Declined | P0 |
| TC-05 | Invite gửi ngày 0, không phản hồi, ngày 14+1 kiểm tra | Status = expired; chat không mở được (403) | P1 |
| TC-06 | Owner sửa metric tiệm qua mọi UI + gọi API update trực tiếp | Không có endpoint/UI nào cho phép; API trả 403/404 | P0 |
| TC-07 | Visits=210, repeat=96%, tip=25%, ZIP=77084 trong ledger fixture | Hồ sơ hiện: 200+, 90–100%, 25%+, 770xx | P1 |
| TC-08 | Tiệm dùng post thứ 4 / invite thứ 11 | Paywall "contact us"; không tạo post/invite | P1 |
| TC-09 | Khách chưa từng làm với thợ T tìm nút Follow | Không có nút Follow với T | P1 |
| TC-10 | T opt-in OFF (mặc định), T có salon link mới | Không follower nào nhận push | P0 |
| TC-11 | T opt-in ON, có link mới, 3 followers | Mỗi follower nhận đúng 1 push, nội dung đúng tiệm mới | P1 |
| TC-12 | Owner (tiệm cũ và tiệm mới) tìm follower list của T | Không tồn tại ở bất kỳ màn hình/API nào | P1 |
| TC-13 | Anon code của T ngày 0 = A317; ngày 31 mở lại bằng code cũ | Code mới khác; link/code cũ trả 404 | P2 |
| TC-14 | Business 40 check-in/90d mở Hiring | Bị chặn tạo post, hiện màn giải thích | P1 |
| TC-15 | Thợ tắt Open to offers; owner refresh search trong 5 phút | Hồ sơ biến mất khỏi mọi kết quả | P1 |

---

## 9. Risks & Open Questions / Rủi ro & câu hỏi mở

**Rủi ro đã chấp nhận (PO quyết):**
1. **Scope 3 phía cùng lúc (D1):** 3 nền tảng triển khai song song → V1 lâu ra mắt. Khuyến nghị của BA: nếu trễ tiến độ, cắt phía Khách (follow-tech) ra release 1.1 — nó độc lập về dữ liệu.
2. **Free quota lũy kế (D8):** phạt đúng tiệm dùng nhiều nhất (người truyền bá tốt nhất). Theo dõi phản ứng nhóm tiệm đầu tiên chạm paywall.
3. **Tuyển ngoài sàn để né phí:** không xử lý V1.

**Câu hỏi mở (cần PO chốt trước khi dev xong):**
1. Bảng giá sau free quota (per-invite? gói tháng? add-on gói Pro?).
2. Ngưỡng eligibility chính xác (50 check-in/90d cho tiệm — số này cần data thật để tinh chỉnh).
3. Xung đột lợi ích truyền thông: thông điệp cho chủ tiệm khi ra mắt ("sàn giúp anh tuyển" — không nhắc vế "thợ của anh cũng tìm được chỗ mới"). Cần duyệt copy marketing.
4. Grace period 30 ngày (BR-04) đủ chưa, hay theo cả "tiệm cùng chủ sở hữu" (một chủ nhiều tiệm)? **Đề xuất: chắn theo owner-level, không chỉ salon-level** — cần PO xác nhận.

---

## 10. Success Metrics / KPI V1

| Metric | Target 90 ngày sau launch |
|--------|--------------------------|
| Tech profiles created / eligible techs | ≥ 20% |
| Job posts created | ≥ 30 |
| Invite → Accept rate | ≥ 25% |
| Accepted match → chat có ≥ 3 tin nhắn | ≥ 60% |
| Báo cáo lộ danh tính ngoài luồng Accept | **0** (hard requirement) |
