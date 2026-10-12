# Nexora POS — đặc tả bàn giao cho dev

**Cập nhật:** 2026-10-09  
**Phạm vi:** Front Desk, menu POS, Check-in, Turn Board, Tickets, Checkout, Gift Card, Completed Services, quyền và đồng bộ.  
**Trạng thái:** HTML prototype để duyệt UX. Chưa kết nối Nexora API, thiết bị thanh toán, SMS hay dữ liệu tiệm thật.

## 1. Nguồn và cách chạy bản mẫu

- Giao diện: `nexora-pos-prototype.html` trong cùng thư mục. Mở file bằng trình duyệt; không có build step.
- Turn Board: `/Users/kaylabrian/Downloads/TurnBoardDacTaBackend.pdf`. Công thức turn, trường dữ liệu và điều kiện tranh chấp trong PDF là đặc tả backend. JavaScript trong HTML mô phỏng một phần, không dùng làm thuật toán production.
- Quyền và dữ liệu khách: `nexora-pos-security-handoff.md` trong cùng thư mục.
- Prototype lưu ticket, ca thợ, turn, checkout và receipt giả lập trong `sessionStorage` của tab; lưu menu trong `localStorage` của trình duyệt. Hai nơi này không phải nguồn dữ liệu production.

## 2. Bản đồ menu POS

| Nhóm | Thứ tự mặc định | Mục đích |
| --- | --- | --- |
| Daily service | Overview → Check-in → Tickets → Turn Board → Technicians → Checkout Customer | Nhận khách, giao việc, làm dịch vụ và thu tiền. |
| Payments & records | Products & Other Sales → Gift Card Center → Completed Services | Bán hàng khác, thẻ quà tặng, hóa đơn và hoàn tiền. |
| Planning & reference | Appointments → Estimate → Price Menu → Customer History → Staffs Clock | Lịch hẹn, báo giá, tra giá và tra cứu. |

Menu nằm ở đầu các workspace Front Desk. Cards và Compact chỉ đổi cách trình bày, không đổi quyền hay đường dẫn. Không chèn nút điều chỉnh giữa các thẻ.

### Tự sắp xếp menu

1. **Customize** mở bảng chỉnh; bảng ẩn khi dùng POS bình thường.
2. Kéo một dòng lên/xuống hoặc sang nhóm khác. Nút ↑/↓ và danh sách chọn nhóm hỗ trợ bàn phím và thiết bị không kéo thả thuận tiện.
3. Thay đổi lưu ngay. **Done** đóng bảng mà không xóa thay đổi. **Restore default** khôi phục đủ 14 mục, ba nhóm và thứ tự trong bảng.
4. Tùy biến chỉ ảnh hưởng thứ tự hiển thị của người dùng. Không ẩn mục, thay role, hoặc cấp quyền mới. Mọi workspace và API vẫn kiểm tra quyền trên server.

**Trong prototype:** `defaultNavOrder`, `defaultNavGroups`, `shortcutGroups`, `navHtml`, `shortcutEditorHtml`, `moveShortcut`, `relocateShortcut`, `saveNavPreferences` nằm trong HTML. Key `nexora-pos-nav-v1` gồm `order` (danh sách ID) và `navGroups` (map `ID → group`). ID lạ bị bỏ; mục mới được thêm theo mặc định; group lạ về group mặc định. Dữ liệu cũ hợp lệ giữ thứ tự đã chọn. `localStorage` chỉ là lưu trên một trình duyệt.

**Production:** lưu theo `(salon_id, user_id, surface='front_desk_pos')`, không lưu chung cho tiệm. Schema đề xuất:

```json
{
  "surface": "front_desk_pos",
  "revision": 4,
  "layout": "cards",
  "groups": {
    "service": ["overview", "checkin", "tickets", "turn", "technicians", "checkout"],
    "payments": ["quicksale", "giftcards", "completed"],
    "reference": ["appointments", "estimate", "pricemenu", "history", "clock"]
  }
}
```

API: `GET /v1/me/workspace-preferences/front-desk-pos` trả cấu hình và `revision`; `PUT` nhận cấu hình cùng `If-Match` revision; `DELETE` reset. Với `409` do hai thiết bị cùng sửa, đọc lại và cho người dùng chọn lưu lại, không ghi đè âm thầm. Backend chỉ nhận ID và nhóm đã đăng ký, không nhận URL/HTML từ client. Mục mới được thêm cuối nhóm mặc định. Mỗi user có menu riêng; quyền vào từng workspace độc lập.

## 3. Luồng khách và trạng thái ticket

| Trạng thái | Đến từ | Đi tiếp | Ghi chú |
| --- | --- | --- | --- |
| Waiting | Check-in hoặc ticket tạo ở lễ tân | In service, Cancelled | Check-in cấp số khách; direct checkout có thể chưa check-in. |
| In service | Gán dịch vụ/thợ | Ready to pay, Cancelled | Từng service line có thợ và trạng thái riêng. |
| Ready to pay | Mọi dịch vụ chính đã hoàn tất | Paid, Cancelled | Điều chỉnh cần quyền và audit phù hợp. |
| Paid | Server xác nhận đủ thanh toán | Refund/partial refund | Receipt giữ snapshot giá, phí, tip, rule version. |
| Cancelled | Hủy ticket chưa paid | Đóng | Giữ lịch sử check-in và turn log. |

- Check-in tìm hoặc tạo customer/ticket và là nguồn danh sách khách chờ của Turn Board. Turn Board **không tạo khách mới**. Không tạo ticket mở trùng cho cùng visit.
- Direct checkout có thể mở không qua Check-in; bắt buộc tìm khách bằng điện thoại hoặc tạo khách mới có tên trước thanh toán. Không tự tăng số Check-in và không vào hàng Turn Board.
- Gán thợ tại Turn Board, Tickets hoặc Technicians ghi vào **cùng ticket**. Checkout ticket có sẵn nạp customer, thợ, dịch vụ, add-on và trạng thái đã có; không chọn thợ lần hai nếu đã ghi.
- Add-on thuộc service chính và kế thừa thợ của service đó. Khi thợ khác làm add-on, lưu `effective_technician_id` riêng và `parent_service_line_id`; không tạo service chính giả.
- Ticket có nhiều thợ/dịch vụ. Hoàn thành từng service line, rồi mới chuyển Ready to pay khi tất cả service chính hoàn tất. Không thanh toán hai lần.
- Hủy ticket cần lý do và cảnh báo hậu quả. In service hoặc Ready to pay cần Manager/Owner approval. Hoàn turn của việc chưa hoàn thành là lựa chọn riêng và phải ghi reversal; việc hoàn thành không tự xóa turn. Không xóa ticket khỏi lịch sử.

## 4. Turn Board — backend phải theo PDF

`TurnBoardDacTaBackend.pdf` chứa schema, công thức, lịch ca, quyền, API và kiểm thử chi tiết. Các invariant cần giữ:

1. Một nguồn sự thật cho check-in và ticket. Khách bị hủy phải biến mất khỏi hàng chờ; giao thợ cập nhật đúng ticket.
2. Thợ phải check-in ca. `checkin_seq` tăng theo `(salon_id, business_date)`, cấp số mới khi check-out rồi check-in lại. Xếp theo **ít turn hôm nay**, sau đó **thứ tự check-in ca**. Skill 0 không được nhận service; thiếu skill record mặc định level 1 theo PDF.
3. Turn dùng `DECIMAL(6,2)`, không dùng integer/float để ghi sổ. PDF có `time`, `services`, `threshold`, `tiers`, `count` cùng request/appt rule, grace period, auto mode. Cấu hình owner phải version hóa.
4. Add-on cùng service chính cộng tiền nhưng không cộng turn riêng. Ticket chỉ có add-on dùng ngoại lệ trong PDF. Một khách chia nhiều thợ thì mỗi service line, doanh thu và turn thuộc thợ thực hiện.
5. Mọi assignment ghi log bất biến gồm ticket, thợ, service, turn, người thực hiện và danh sách thợ bị skip. Undo/hủy ghi **bút toán đảo**, không sửa hoặc xóa log cũ.
6. Gán thợ chạy trong database transaction/lock theo salon và ca, kiểm tra lại ticket, skill, hàng và version lúc commit. Hai quầy không thể lấy cùng turn hoặc giao cùng khách hai lần. Broadcast thay đổi sau commit.

HTML chỉ mô phỏng một phần PDF; không sao chép giá trị và công thức demo làm cấu hình tiệm.

## 5. Catalog, giá, tip và thanh toán

- Một catalog versioned phục vụ Price Menu, chọn dịch vụ, Estimate và Checkout. Dòng ticket lưu `catalog_service_id`, tên/giá snapshot, số lượng, duration, thợ chính, thợ cùng làm, parent line nếu là add-on, discount và trạng thái. Server tính lại total.
- Price Menu lọc category, tìm tên và có **Menu prices** cùng **Menu vs Credit Card**. Chênh lệch thẻ lấy từ POS → Salon Settings → Payment Methods & Fees, không hard-code.
- Checkout hỗ trợ giảm giá theo dòng và toàn ticket; từng phương thức có thể có ưu đãi riêng. Tính service discount, order discount, method discount trên phần đủ điều kiện, rồi card fee trên **phần Card sau discount**. Tip không trong fee base. Tax production phải theo cấu hình/quy định và thống nhất ở quote, review, receipt.
- Tip khách nhập bằng % hoặc số tiền. Chia proportional, equal, 50/50 hai thợ hoặc manual; tổng phần thợ bằng tip đến từng cent. Tip, commission, payout theo effective technician.
- Demo có Cash, Card, Gift Card, Crypto, Split Pay và ví Zelle/Cash App/Venmo/VLINKPAY nếu bật. Split Pay prototype gồm Card, Cash tùy chọn và một phương thức khác. Production kiểm tra provider từng tender; nút xác nhận của cashier không chứng minh đã trả.
- Mỗi tender có `payment_intent_id`, idempotency key, provider reference, amount, currency, status (`pending`, `authorized`, `captured`, `failed`, `refunded`), rate/fee snapshot. Ticket Paid sau khi **đủ tổng settled**. Một tender thành công, tender khác lỗi: giữ trạng thái thanh toán dở, hiển thị đã thu và cách xử lý tiếp/refund; không tạo receipt Paid giả.
- Gift Card dùng ledger server, khóa/giữ balance khi redeem, tránh chi hai lần. Refund trả đúng phần Gift Card đã dùng. Crypto/wallet/QR cần callback hoặc server status xác minh; không tin UI/balance browser.
- Receipt lưu dòng dịch vụ, tender, giảm giá, fee, tax, tip, rule version và transaction IDs. Sau thanh toán: Print, SMS, View saved receipt, Done. SMS cần xác nhận số nhận và consent; in qua máy in cấu hình, báo lỗi gửi/in.
- Refund toàn phần hoặc một phần cần lý do và Manager/Owner approval, không vượt phần còn được hoàn, theo tender gốc. Sau Paid, tip edit/void/refund là operation mới có audit; receipt gốc bất biến.

## 6. Dữ liệu và API tối thiểu

Mọi tài nguyên gắn `salon_id`; dùng ID ổn định, money integer cents hoặc decimal cố định; time UTC kèm business date/timezone tiệm.

| Tài nguyên | Trường tối thiểu |
| --- | --- |
| Customer | ID, tên, contact được phân quyền, consent, merge history. |
| Visit/Ticket | ID, customer ID, check-in ref nếu có, status, source, arrival time, version, service lines, assigned staff. |
| Shift/Turn | Business date, checkin sequence, skill, rule version, turn balance, immutable assignment/skip/reversal ledger. |
| Catalog/Settings | Version, service/add-on, price, duration, tax, discount, card fee, enabled tenders, roles. |
| Checkout/Payment | Draft version, quote hash, line snapshot, tenders, provider status, tip allocation, receipt/refund refs. |
| Audit/Approval | Actor, approver, role, action, subject, before/after hash, reason, time, workstation, result. |
| Menu preference | User, salon, surface, group/order IDs, layout, revision, updated_at. |

API đề xuất, có thể đổi route theo convention Nexora hiện có:

| Operation | Request/response cần có |
| --- | --- |
| `POST /v1/visits/check-in` | Customer identity, source, appointment ref; trả ticket ID/version/check-in sequence; idempotent theo arrival request. |
| `GET /v1/visits?status=...` | Danh sách open, pagination, server filtering, masked customer fields. |
| `PATCH /v1/tickets/{id}` | Expected version và transition/service line change; `409` nếu stale, `422` nếu transition sai. |
| `POST /v1/turn-assignments` | Ticket, service line, tech, expected queue/rule version, reason nếu skip; trả assignment và queue mới. |
| `POST /v1/turn-assignments/{id}/reverse` | Lý do, approval, idempotency key; ghi reversal. |
| `POST /v1/tickets/{id}/cancel` | Reason, release-turn choice, approval token, expected ticket version. |
| `POST /v1/checkouts/quote` | Ticket version, lines, discounts, tips, tenders; trả breakdown, quote ID/hash/expiry. |
| `POST /v1/checkouts/commit` | Quote ID, idempotency key, provider intents; trả status tổng và từng tender. |
| `POST /v1/receipts/{id}/refunds` | Amount, tender plan, reason, approval, idempotency key. |
| `GET/PUT/DELETE /v1/me/workspace-preferences/front-desk-pos` | Cấu hình menu và revision như mục 2. |

Mọi mutation cần salon-scoped authorization, idempotency key (ít nhất check-in, turn assignment/reversal, charge, refund), server validation và audit. `409` cho version conflict, `403` cho thiếu quyền, `422` cho dữ liệu/rule sai; trả mã lỗi ổn định cho UI.

Phát event sau commit: `ticket.updated`, `shift.updated`, `turn.assignment_recorded`, `checkout.updated`, `payment.updated`, `receipt.created`, `refund.updated`. Client nhận WebSocket/SSE hoặc polling có version; reconnect lấy snapshot mới. Event có thể lặp hoặc đến trễ, xử lý theo ID+version.

## 7. Quyền, riêng tư và an toàn

- Front Desk vận hành check-in/ticket/checkout theo cấu hình và sửa menu **của mình**. Manager/Owner duyệt thao tác nhạy cảm. Owner thay fee, rule Turn Board, role/PIN. Technician chỉ đọc/phục vụ ticket được giao.
- PIN production do server xác minh cho **tài khoản cá nhân người duyệt**, ràng buộc action, ticket, amount/change, reason, workstation, thời hạn. Chuỗi 4–6 ký tự được chấp nhận trong HTML chỉ là mock.
- Contact/note ẩn mặc định; API, search, export, receipt, print, SMS đều cùng permission. Không trả dữ liệu đầy đủ rồi chỉ che ở DOM. Không lưu PAN trong browser, logs hoặc receipt.
- Session cần timeout, xử lý đổi nhân viên tại quầy. Draft nên lưu server với salon/user scope; giảm tối đa dữ liệu nhạy cảm trong browser. Xem thêm `nexora-pos-security-handoff.md`.

## 8. Tiêu chí nghiệm thu

### Menu

- Mọi workspace có ba nhóm và thứ tự mục 2; Cards/Compact không đổi thứ tự.
- Customize: kéo trong/qua nhóm, ↑/↓, select nhóm và Done hoạt động bằng keyboard. Lựa chọn còn sau refresh/đăng nhập lại; user khác không bị đổi. Restore default phục hồi đủ 14 shortcut.
- ID lạ bị bỏ, ID mới được thêm, cấu hình cũ không mất thứ tự hợp lệ. Role bị chặn vẫn không vào được màn hình/API sau khi di chuyển shortcut. Hai thiết bị sửa đồng thời trả/giải quyết `409`.

### Vận hành và thanh toán

- Check-in một khách tạo một visit mở; cùng ticket ở Check-in, Tickets, Turn Board, Checkout. Direct checkout không làm tăng số Check-in.
- Giao thợ theo lượt/skill của PDF; hai quầy gán đồng thời chỉ một giao dịch thắng; skip/undo có log bất biến, decimal turn chính xác. Thợ check-out/check-in lại xuống sau khi turn bằng nhau.
- Ticket có thợ/dịch vụ mở Checkout không bắt chọn lại. Add-on cùng thợ kế thừa; thợ khác được ghi đúng người và doanh thu. Chỉ hoàn thành hết service chính mới Ready to pay.
- Hủy Waiting cần reason; hủy In service/Ready to pay cần approval; trả turn chỉ sinh reversal hợp lệ; ticket vẫn có lịch sử.
- Catalog, Price Menu, Checkout dùng cùng giá/version. Thay giá, discount, tip, tender cập nhật quote. Card fee chỉ trên card portion sau discount và không trên tip; tổng split khớp total đến cent.
- Pending/declined wallet hoặc split chưa đủ tiền không tạo Paid receipt. Retry idempotent không charge hai lần. Gift Card không redeem quá balance hoặc chi hai lần.
- Refund đúng tender gốc, không vượt số đã thu, với approval/reason/audit. Receipt gốc bất biến.
- Test desktop/mobile, keyboard, focus, contrast, slow network, reconnect, concurrent stations, printer/SMS failure và permission denied.

## 9. Ranh giới prototype và rollout

HTML chưa có backend thật, payment processor, POS terminal, wallet/crypto verification, card tokenization, SMS, printer driver, đồng bộ nhiều quầy, tax engine hay PIN thật. Không đưa dữ liệu thật vào demo array/browser storage để chạy production; xây API, transaction, ledger, quyền và provider adapter như trên.

Các test cục bộ trong `../work/` mô phỏng DOM/JS cho check-in → turn → checkout → gift card/refund, cancel, quick sale/split và menu. Chúng không chứng minh tích hợp thiết bị, concurrency thật, hoặc độ chính xác đầy đủ của PDF. Trước rollout: test contract, migration, concurrency, provider sandbox, UAT tiệm và đối chiếu từng công thức trong PDF.
