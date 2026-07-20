# NEXORA TOUCH — AI Matching: Thợ ↔ Tiệm (Jobs Marketplace) — Spec

| Field | Value |
|---|---|
| Document | NEXORA_Spec_AI_Matching_Tho_Tiem.md |
| Version | Draft v0.1 — 2026-07-15 |
| Product Owner | Brian Nguyen (VlinkPay LLC) |
| Audience | Dev team, QC team, AI coding agent |
| Companion file | `NEXORA_AI_Matching_Tho_Tiem_Mockup.html` (mockup 2 phía — UI reference) |
| Phạm vi | Phase 1: ngành nail, trong bán kính địa phương. Ngành khác + liên vùng = phase sau, KHÔNG build bây giờ. |
| Nơi sống | Phía thợ: tab mới trong **staff app** hiện có. Phía tiệm: section mới trong **business dashboard** hiện có. KHÔNG phải app mới. |

> **Cách dùng:** Mockup HTML là nguồn sự thật về UI. Tài liệu này là nguồn sự thật về hành vi, rule, edge case. Lệch nhau → tài liệu này thắng, báo PO.

---

## 1. Tổng quan & định vị

**Bài toán:** Chủ tiệm tìm thợ qua Facebook groups / báo / truyền miệng — chậm, không lọc được tay nghề. Thợ muốn đổi tiệm không dám hỏi công khai vì sợ chủ hiện tại biết.

**Giải pháp:** AI match 2 chiều theo tay nghề + khoảng cách + mức ăn chia + lịch làm. Ẩn danh cả 2 phía cho đến khi cả 2 cùng đồng ý liên hệ.

**Lợi thế duy nhất của NEXORA:** cả 2 phía ĐÃ ở trên nền tảng — thợ dùng staff app, chủ dùng business app. Không phải kéo user mới từ zero.

### 1.1 Nguyên tắc KHÓA — không thương lượng

1. **NEXORA là bảng tin kết nối, KHÔNG phải môi giới lao động.** NEXORA không tuyển, không trả lương, không giữ tiền, không ký hợp đồng lao động, không đứng tên giới thiệu. Mọi thỏa thuận (ăn chia, 1099/W-2, lương, giờ) là giữa thợ và tiệm — NEXORA không tham gia, không tư vấn, không lưu điều khoản thỏa thuận.
2. **Không bao giờ đưa lời khuyên phân loại 1099 vs W-2.** Copy trong app chỉ được ghi: "Employment terms are between you and the salon. Consult a professional for tax/legal questions." Vi phạm điều này = rủi ro co-employment liability.
3. **Ẩn danh 2 chiều đến khi mutual accept.** Tiệm thấy hồ sơ thợ KHÔNG tên/ảnh/SĐT. Thợ thấy tin tiệm đầy đủ (tiệm là bên public), nhưng việc thợ "quan tâm" KHÔNG lộ danh tính cho đến khi thợ tự bấm đồng ý tiết lộ.
4. **Block tiệm hiện tại (chống trả đũa):** hồ sơ tìm việc của thợ KHÔNG BAO GIỜ xuất hiện cho tiệm mà thợ đang làm (xác định qua employment record trong staff app + thợ tự thêm block thủ công). Đây là điều kiện sống còn — thợ không dám dùng nếu chủ hiện tại có thể thấy.
5. **AI chỉ gợi ý — người quyết định.** Giống BR-C20 của customer app: AI xếp hạng và giải thích, không tự động kết nối ai với ai.

### 1.2 Xung đột lợi ích — PO phải đọc

Khách trả tiền của NEXORA là **chủ tiệm**; tính năng này giúp thợ của họ **rời đi**. Không né được — chỉ quản lý được:

- Marketing hướng "giúp tiệm TÌM thợ" (lợi cho chủ), không phải "giúp thợ NGHỈ việc".
- Block tiệm hiện tại (nguyên tắc 4) đồng thời bảo vệ thợ VÀ giảm cảm giác bị NEXORA "câu thợ" ngay trước mắt chủ.
- Không có chế độ cho tiệm "dò" xem thợ mình có đang tìm việc không — mọi truy vấn kiểu này trả về rỗng.

### 1.3 Non-goals phase 1

Không build: ngành ngoài nail; match liên bang/toàn quốc; chat nội bộ đầy đủ (chỉ trao đổi liên lạc sau mutual accept); xác minh license tự động qua state board API (chỉ upload + cờ "self-reported"); phí/thanh toán (miễn phí phase 1 — mô hình thu tiền là open question #1).

---

## 2. Luồng phía THỢ (staff app — tab "Jobs / Việc làm")

### T1. Tạo hồ sơ tìm việc

- **UI & data:** skills chips (Gel-X, Dip, Acrylic, Design, Pedicure, Eyelash, Waxing…); số năm kinh nghiệm; license: số + state + ảnh (cờ "self-reported — not verified by NEXORA"); khu vực + bán kính (mặc định 25 miles); mong muốn: ăn chia (6/4, 55/45…) hoặc lương tuần, có/không cần bao lương; lịch có thể làm (ngày/giờ); ghi chú tự do.
- **Chế độ ẩn danh: BẬT mặc định, không tắt được ở phase 1.** Tiệm chỉ thấy: skills, năm kinh nghiệm, khu vực (thành phố, không địa chỉ), mong muốn, cờ license, đoạn ghi chú. KHÔNG tên/ảnh/SĐT/tiệm hiện tại.
- **Trạng thái hồ sơ:** Active / Paused (tạm ẩn khỏi mọi match, giữ dữ liệu) / Deleted (xóa hết match + hồ sơ, không khôi phục).
- **Backend:** `POST/PATCH /job_profiles`; block list tự sinh từ employment record + `POST /job_profiles/blocks {business_id}` thủ công.

### T2. Match feed — tiệm đang tuyển

- **UI & data:** cards tin tuyển kèm badge "% match" + lý do AI ("Cần Gel-X + Design — trùng 2 skill mạnh nhất của bạn · 4.2 miles · ăn chia 6/4 đúng mong muốn"); nút **Quan tâm** / **Bỏ qua** (dismiss = training signal, không hiện lại).
- **Rule hiển thị:** chỉ hiện match ≥ ngưỡng confidence (đề xuất 0.70); tiệm trong block list KHÔNG BAO GIỜ xuất hiện; cap push đề xuất 3/tuần, gộp digest nếu vượt.
- **Backend:** `GET /job_matches?side=tech`; `POST /job_matches/{id}/interest`; `POST /job_matches/{id}/dismiss`.

### T3. Mutual accept → mở liên hệ

- **Luồng:** Thợ bấm Quan tâm → tiệm nhận hồ sơ ẨN DANH → tiệm bấm "Muốn liên hệ" → thợ nhận thông báo "Tiệm X muốn liên hệ với bạn — chia sẻ tên & số điện thoại?" → thợ **Đồng ý** → 2 bên thấy liên lạc của nhau. Thợ **Từ chối** → tiệm chỉ thấy "ứng viên không tiếp tục", không biết gì thêm.
- **Sau khi mở liên hệ:** NEXORA dừng ở đây. Không theo dõi kết quả tuyển, không thu phí kết nối phase 1. Optional: 1 câu hỏi sau 14 ngày "Bạn có nhận việc này không?" (analytics, được phép bỏ qua).

---

## 3. Luồng phía TIỆM (business dashboard — section "Find Staff / Tìm thợ")

### B1. Đăng tin tìm thợ

- **UI & data:** skills cần; số ghế/station trống; ăn chia hoặc lương đề nghị + có bao lương không; giờ cần; mô tả tiệm. Tin là **public trong feed thợ** (tiệm không ẩn danh). Trạng thái: Active / Filled / Expired (tự hết hạn 30 ngày, gia hạn 1 chạm).
- **Backend:** `POST/PATCH /job_posts`.

### B2. Match feed — thợ ẩn danh

- **UI & data:** cards "Thợ ẩn danh #A7" + % match + lý do ("Gel-X 5 năm · trong 10 miles · mong muốn 6/4 khớp tin của bạn") + cờ license self-reported; nút **Muốn liên hệ** / **Bỏ qua**.
- **Rule:** KHÔNG có search/lọc để dò thợ cụ thể; không hiện thợ đang làm tại tiệm này (nguyên tắc 4); nhóm demand insight chỉ hiện khi ≥ 3 thợ (chống suy danh tính, giống BR-C20).
- **Demand insight:** "Khu vực bạn có 8 thợ Gel-X đang tìm việc" — ẩn danh, gom nhóm.
- **Backend:** `GET /job_matches?side=salon`; `POST /job_matches/{id}/contact_request`.

---

## 4. Business rules

| ID | Rule | Phạm vi |
|---|---|---|
| BR-M01 | **Bảng tin kết nối, không môi giới (LOCKED):** NEXORA không tuyển/trả lương/giữ tiền/tư vấn 1099-W2; mọi copy pháp lý theo nguyên tắc 1.1.1–1.1.2 | toàn feature |
| BR-M02 | **Ẩn danh + block tiệm hiện tại (LOCKED):** danh tính thợ chỉ lộ sau khi thợ bấm đồng ý ở bước mutual accept; tiệm hiện tại (employment record + block thủ công) không bao giờ thấy hồ sơ; mọi truy vấn "thợ của tôi có tìm việc không" trả rỗng | T1–T3, B2 |
| BR-M03 | **Semantic matching:** skills + khoảng cách + ăn chia/lương + lịch, so theo ý nghĩa ("làm bột" khớp "acrylic"); confidence ≥ 0.70 mới hiện; dismiss = không hiện lại + training signal | T2, B2 |
| BR-M04 | **Caps & an toàn:** push ≤ 3/tuần/phía, vượt → digest; nút Report trên mọi card (tin giả, quấy rối) → ẩn ngay chờ review; 3 report xác nhận → khóa đăng tin 30 ngày | T2, B2 |
| BR-M05 | **License self-reported:** hiện cờ "self-reported — not verified"; NEXORA không xác nhận; xác minh qua state board = phase sau | T1, B2 |
| BR-M06 | **Miễn phí phase 1:** không thu phí đăng tin/kết nối; mô hình thu tiền quyết sau khi có số liệu match (open question #1) | toàn feature |

---

## 5. Data model (thêm vào schema hiện có)

- `job_profiles` — tech_id (FK staff), skills[], years_exp, license{number,state,photo_url,self_reported:true}, area{city,radius_mi}, comp_expectation{type: split|weekly, value, needs_guarantee}, schedule[], note, status[active|paused|deleted], anonymous:true
- `job_profile_blocks` — profile_id, business_id, source[employment|manual] (append-only trong thời gian active)
- `job_posts` — business_id, skills[], stations, comp_offer, schedule, description, status[active|filled|expired], expires_at
- `job_matches` — profile_id, post_id, confidence, reasons[], tech_action[none|interest|dismiss], salon_action[none|contact_request|dismiss], revealed_at (NULL đến khi thợ đồng ý)
- `job_reports` — reporter, target, reason, status

**Services:** semantic matching engine (dùng chung embedding infra với wish→offer matching BR-C18 của customer app — đừng build 2 engine); notification capper; report queue.

---

## 6. Test cases

| ID | P | Tên | Pass khi |
|---|---|---|---|
| TC-M01 | P0 | Block tiệm hiện tại | Thợ có employment record tại tiệm X → hồ sơ không xuất hiện trong bất kỳ response nào tới X, kể cả demand insight |
| TC-M02 | P0 | Danh tính chỉ lộ sau đồng ý | Mọi payload tới tiệm trước `revealed_at` KHÔNG chứa tên/ảnh/SĐT/tech_id thật (chỉ alias); thợ từ chối → tiệm không nhận thêm dữ liệu nào |
| TC-M03 | P0 | Không có copy tư vấn lao động | Quét toàn bộ string: không có nội dung khuyên 1099/W-2, không "NEXORA hires/pays/guarantees" |
| TC-M04 | P1 | Semantic skill match | "làm bột" khớp tin cần "acrylic"; "gel-x" khớp "gel extensions"; thợ eyelash KHÔNG match tin chỉ cần pedicure |
| TC-M05 | P1 | Dismiss & pause | Dismiss → match không hiện lại 2 phía; Paused → biến mất khỏi mọi feed trong ≤ 1 phút |
| TC-M06 | P1 | Cap thông báo | 10 match mới trong tuần → tối đa 3 push, còn lại vào digest |
| TC-M07 | P1 | Demand insight ≥ 3 | Khu vực chỉ có 2 thợ Gel-X tìm việc → insight không hiện con số |
| TC-M08 | P2 | Tin hết hạn | 30 ngày → status expired, biến khỏi feed, gia hạn 1 chạm hoạt động |

---

## 7. Analytics

| Event | Properties | Đo cái gì |
|---|---|---|
| `job_profile_created` / `job_profile_paused` | skills[], radius | Supply thợ |
| `job_post_created` | skills[], comp_type | Demand tiệm |
| `job_match_shown` / `job_match_interest` / `job_match_dismissed` | side, confidence | Chất lượng matching |
| `job_contact_requested` / `job_contact_revealed` / `job_contact_declined` | elapsed_hours | Funnel kết nối — metric số 1 của feature |
| `job_hired_survey` | answer[yes\|no\|skip] | Kết quả thật (tự khai, 14 ngày) |

**Metric thành công phase 1:** số `job_contact_revealed` / tháng / metro area. Nếu < 10 sau 90 ngày ở metro thí điểm → dừng mở rộng, sửa matching trước.

---

## 8. Open questions cho PO

1. **Mô hình thu tiền:** miễn phí phase 1, nhưng sau đó thu gì? Đề xuất cân nhắc: phí đăng tin cho tiệm CHƯA dùng NEXORA (tiệm đang trả subscription thì miễn phí — thành lợi ích giữ chân); tuyệt đối không thu phí thợ.
2. **Tiệm ngoài NEXORA có được đăng tin không?** Mở rộng supply nhanh nhưng loãng chất lượng + mất lợi thế "2 phía có sẵn". Đề xuất: chưa, phase 1 chỉ tiệm đang dùng NEXORA.
3. **Metro thí điểm nào?** Chọn 1 khu vực có mật độ tiệm NEXORA cao nhất, chạy 90 ngày trước khi mở vùng 2.
4. **Thợ chưa có staff app** (làm tiệm không dùng NEXORA) có được tạo hồ sơ không? Đề xuất: có — đây chính là cửa kéo tiệm mới ("thợ giỏi ở trên NEXORA").
5. **Bán kính mặc định 25 miles** có đúng với thực tế thợ nail chịu đi làm xa không?

---

*— End of spec. UI reference: `NEXORA_AI_Matching_Tho_Tiem_Mockup.html`. Nguyên tắc AI chung: xem BR-C18/C19/C20 trong `NEXORA_Spec_Customer_App_Dev.md` v1.2.*
