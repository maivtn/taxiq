# NEXORA TOUCH — Thiết kế hoàn thiện Customer Reward Prototype

| Trường | Giá trị |
|---|---|
| Trạng thái | Đã duyệt ngày 2026-07-14 |
| File triển khai | `cutomer-reward.html` |
| Phạm vi lưu trữ | Frontend prototype bằng `localStorage` |
| UI stack | Tailwind CSS Browser CDN + Lucide Icons |
| Tài liệu nguồn | `customer-app-developer-spec.md`, `three-sided-marketplace-spec.md`, `customer-app-prototype.html` |

## 1. Mục tiêu

Hoàn thiện prototype 31 màn hình để toàn bộ control có vẻ tương tác được đều tạo phản hồi rõ ràng, dữ liệu nhất quán giữa các màn hình và vẫn còn sau khi tải lại trang. Prototype mô phỏng nghiệp vụ frontend đủ sâu để review sản phẩm, nhưng không giả vờ rằng các tích hợp cần backend hoặc thiết bị thật đã được triển khai.

Thứ tự ưu tiên khi có khác biệt:

1. Hai developer spec quyết định hành vi, dữ liệu và business rule.
2. `customer-app-prototype.html` quyết định UI và luồng bấm tham chiếu.
3. `cutomer-reward.html` giữ bảng màu, mobile-first layout và responsive sidebar hiện tại.

## 2. Phạm vi

### Trong phạm vi

- Hoàn thiện action của 31 màn hình customer.
- Lưu state prototype bằng `localStorage` có version.
- Validation và trạng thái lỗi cho auth, onboarding, tip, payment, booking, redeem, feedback và form cài đặt.
- Số dư điểm riêng theo từng business và ledger append-only ở mức mô phỏng.
- Luồng `pending → confirmed` cho tip, direct payment và booking.
- Persistence cho hồ sơ, preferences, consent, offers, wishes, looks, appointments và follow-tech.
- Nút Scan nổi bật ở bottom navigation trên mobile; desktop tiếp tục dùng sidebar.
- Tiếng Việt là ngôn ngữ mặc định, vẫn giữ khả năng đổi EN/VI runtime.
- Mở rộng kiểm thử tự động cho action, target, state và rule P0 quan trọng.

### Ngoài phạm vi

- Backend/API thật, SMS gateway, push OS, camera/QR decoder, OCR, upload server và payment confirmation webhook.
- Sàn tuyển dụng của thợ và chủ tiệm. Phía customer chỉ nhận Explore và follow-tech theo `three-sided-marketplace-spec.md`.
- Ví tiền hoặc bất kỳ mô hình nào để NEXORA giữ tiền.
- Dữ liệu dùng chung giữa nhiều trình duyệt hay thiết bị.

## 3. Nguyên tắc nghiệp vụ bắt buộc

1. NEXORA không giữ tiền. Prototype chỉ tạo bản ghi pending và mô phỏng deep-link/QR tới phương thức của business hoặc staff.
2. Điểm thuộc trách nhiệm của từng business. Không có tổng điểm cộng dồn giữa các business.
3. Điểm không đổi tiền mặt, không chuyển nhượng và không bán.
4. Tip, direct payment và booking chỉ cộng điểm sau bước business xác nhận.
5. Feedback riêng cộng 15 điểm cho mọi rating; Google Review là tùy chọn, không cộng điểm và không review-gating.
6. Consent marketing là tùy chọn, có timestamp; Skip vẫn giữ điểm; transactional message vẫn được phép.
7. Follow-tech chỉ xuất hiện khi customer và tech có visit chung. Việc tech báo chuyển tiệm mặc định tắt; owner không thấy follower count hoặc danh sách follower.
8. Ledger chỉ thêm entry, không sửa hoặc xóa entry cũ trong các thao tác bình thường của prototype.

## 4. Kiến trúc frontend

Prototype tiếp tục là một file HTML tự chạy. JavaScript được tổ chức thành bốn lớp logic trong cùng file:

1. **Demo database**: default state, schema version, load, migrate, validate và save.
2. **Domain actions**: các hàm nghiệp vụ như request OTP, confirm tip, redeem, submit feedback và toggle follow.
3. **Renderer**: đồng bộ text, balance, list, badge, disabled state và form từ state hiện tại.
4. **Interaction controller**: event delegation từ `data-action`, mở modal/toast, điều hướng screen và gọi domain action.

UI không cập nhật business state trực tiếp. Mọi thay đổi đi qua domain action, lưu state, sau đó render lại những vùng liên quan. Cách này cho phép thay lớp localStorage bằng API adapter sau này mà không phải viết lại giao diện.

## 5. LocalStorage

### 5.1 Khóa và vòng đời

- Khóa chính: `nexora.customer.prototype.v1`.
- State chứa `schemaVersion`, `updatedAt` và dữ liệu ứng dụng.
- Lần đầu mở: clone default state rồi lưu.
- JSON lỗi hoặc state không hợp lệ: giữ bản lỗi trong một khóa backup có timestamp, khởi tạo lại demo state và báo toast.
- Migration chạy tuần tự theo version; không xóa toàn bộ dữ liệu chỉ vì thêm field mới.
- Logout chỉ xóa session, không xóa ledger, balances hay preferences của customer demo.
- Có action “Reset demo data” trong khu vực profile dành cho prototype, kèm confirm dialog.

### 5.2 Cấu trúc state dự kiến

```js
{
  schemaVersion: 1,
  session: { authenticated, phone, otpRequestedAt, otpAttempts, lockedUntil },
  profile: { id, name, phone, avatar, language, referralCode },
  consents: [{ scope, businessId, action, method, createdAt, confirmedAt }],
  preferences: {
    businessMarketing: {}, networkOffers, bookingReminders,
    nearbyDeals, aiSuggestions, pushPermission
  },
  businesses: {},
  balances: { [businessId]: { points, credits, expiringPoints } },
  ledger: [{ id, businessId, type, pointsDelta, refType, refId, createdAt }],
  visits: [],
  redemptions: [],
  tips: [],
  directPayments: [],
  bookingRequests: [],
  appointments: [],
  looks: [],
  feedback: [],
  savedOfferIds: [],
  wishes: [],
  followedTechIds: [],
  notifications: [],
  ui: { selectedBusinessId, activeScreen, pendingContext }
}
```

Ảnh look được resize và nén client-side trước khi lưu data URL. Nếu vượt quota localStorage, prototype vẫn lưu metadata không ảnh và thông báo rõ ràng.

## 6. Thiết kế luồng nghiệp vụ

### 6.1 Auth và onboarding

- Phone được chuẩn hóa và kiểm tra đủ 10 số US trước khi gửi OTP.
- OTP demo gồm 6 số; UI hiển thị mã demo để tester không bị chặn. Sai 5 lần khóa 15 phút.
- Resend có cooldown 30 giây, đồng hồ hiển thị trạng thái và không gửi lặp.
- Onboarding lưu hai consent riêng. Agree với cả hai toggle tắt bị chặn; Skip đi thẳng tới nhận điểm.
- Double opt-in demo tạo consent record có timestamp. Không confirm trong demo vẫn không làm mất điểm.
- Sau welcome gift, hiện pre-permission modal; “Maybe later” chỉ được hỏi lại một lần sau lần redeem đầu tiên.

### 6.2 Điểm, rewards và ledger

- Mỗi balance được truy xuất bằng `businessId`.
- Redeem thực hiện theo thứ tự: kiểm tra offer → kiểm tra alliance → kiểm tra balance → khóa action → trừ điểm → tạo ledger và redemption → mở receipt.
- `idempotencyKey` theo lần bấm ngăn double-tap trừ điểm hai lần.
- Offer thiếu điểm hiển thị chính xác số điểm còn thiếu và disable nút.
- History nhận business context từ Wallet và chỉ hiển thị ledger của business đó.
- Mọi màn hiện balance gọi chung một formatter và tự cập nhật sau mutation.

### 6.3 Tip và direct payment

- Tip lưu đúng staff, amount, custom amount, method và note. Method staff chưa bật luôn disabled.
- Direct payment lưu business, amount và method; phần tóm tắt cập nhật ngay khi amount thay đổi.
- Bấm gửi chỉ tạo record `pending`; chưa cộng điểm.
- Nút xác nhận demo chuyển record sang `confirmed` đúng một lần, tính điểm theo rule của business rồi thêm ledger.
- Receipt/result đọc từ transaction vừa tạo, không dùng text hardcode.
- External payment action thử mở deep-link phù hợp; nếu không thể xác nhận app đã mở, UI vẫn giải thích đây là bước mô phỏng.

### 6.4 Booking

- `book1` yêu cầu đủ service, technician, day và time.
- Rebook từ Look prefill service, staff, color và note.
- `book2` render summary từ selection thật và lưu note.
- Send tạo booking request `requested`; xác nhận demo chuyển `confirmed`, cộng booking bonus một lần và tạo appointment trên Home.
- “Add to Calendar” tạo file/URL calendar nếu trình duyệt hỗ trợ, nếu không hiển thị modal mô phỏng.

### 6.5 Looks và feedback

- Save Look cho phép lưu khi không có ảnh nhưng phải có ít nhất service hoặc color/note.
- Card mới hỗ trợ View, Rebook, Tip và Delete có confirm.
- Feedback yêu cầu chọn 1–5 sao; text là tùy chọn.
- Mỗi visit chỉ nhận feedback một lần. Mọi rating đều cộng 15 điểm của business tương ứng.
- Google Review mở liên kết riêng và không thay đổi ledger.

### 6.6 Explore, offers và follow-tech

- Search/filter Explore chạy theo tên, service và category; empty state phản ánh filter thật.
- Business card hỗ trợ View, Book với prefill, Directions qua maps URL và Favorite persist.
- Offer hỗ trợ View details, Save/Unsave và Use/Redeem tùy loại; Saved filter lấy từ state.
- Wish có thể thêm và xóa; input rỗng hoặc trùng bị chặn.
- Follow-tech xuất hiện ở visit/Look có `staffProfileId` hợp lệ. Toggle được persist và không hiển thị bất kỳ follower count nào.
- Notification mô phỏng tech chuyển tiệm chỉ được tạo khi fixture cho biết tech đã opt-in; tap notification mở business mới trong Explore.

### 6.7 Profile, privacy và thông báo

- Hai nút notification mobile/desktop mở cùng màn Activity & Messages và đánh dấu đã đọc khi phù hợp.
- Edit Profile mở form tên, phone và avatar; validation trước khi lưu.
- Payment Methods quản lý các method demo của customer, không nhầm với method staff/business.
- Privacy mở modal mô tả dữ liệu prototype và thao tác reset.
- Preferences lưu ngay từng toggle và thêm consent/revoke record có timestamp.
- Tắt AI Suggestions làm khối “For You” biến mất ngay.
- Logout có confirm rồi trở về login; dữ liệu tài khoản demo vẫn còn.

## 7. Navigation và responsive UI

- Mobile giữ bottom navigation 5 tab.
- Nút Scan ở giữa có vòng tròn gradient nhô lên khỏi thanh nav, border tương phản, shadow và vùng bấm tối thiểu 48px; label vẫn đọc được và có active state.
- Desktop từ breakpoint hiện tại trở lên ẩn bottom nav và dùng sidebar; Scan là một mục sidebar bình thường để không phá nhịp bố cục.
- Modal/sheet full-width có giới hạn chiều cao trên mobile, centered dialog trên desktop.
- Bottom padding của nội dung tính cả safe area và nút Scan nhô lên.
- Giữ màu hiện tại, Tailwind và Lucide; không thêm framework thứ hai.

## 8. Action cần hoàn thiện

Các control enabled phải thuộc một trong ba nhóm và luôn có phản hồi:

1. **Điều hướng thật trong prototype**: mở screen, modal hoặc sheet có dữ liệu đúng context.
2. **Mutation localStorage**: cập nhật state, render và toast/receipt.
3. **Tích hợp ngoài prototype**: thử deep-link hoặc giải thích rõ bằng modal; không để click im lặng.

Các nút đang thiếu action được xử lý bắt buộc: notification mobile, notification desktop, Edit Profile và Logout. Các stub trong developer spec như Camera, Enter Code, Directions, OCR, Payment Methods, Privacy, geo/wish push đều phải có modal hoặc demo flow cụ thể, không chỉ toast thành công chung chung.

Button disabled do thiếu điểm hoặc method không khả dụng không cần action, nhưng phải có `disabled`, `aria-disabled` và lý do nhìn thấy được.

## 9. Error handling, accessibility và i18n

- Lỗi validation nằm cạnh field, focus vào field lỗi đầu tiên; toast chỉ dùng cho kết quả toàn cục.
- Mutation quan trọng có guard chống double click.
- Clipboard dùng fallback và chỉ báo thành công khi copy thật sự thành công.
- Modal có focus management cơ bản, đóng bằng Escape, overlay click và nút Close.
- Icon button có accessible label; active/disabled không chỉ phân biệt bằng màu.
- Text phát sinh động đi qua dictionary EN/VI. Tiếng Việt là mặc định cho lần mở mới.
- Tiền dùng USD formatter; điểm có phân tách hàng nghìn.

## 10. Kiểm thử và tiêu chí chấp nhận

Mở rộng `cutomer-reward.test.mjs` để kiểm tra tối thiểu:

- Mọi button enabled có `data-action`, submit handler hoặc navigation hợp lệ.
- Mọi `data-target`, `data-back-target`, reward key và business context đều tồn tại.
- Không còn utility Tailwind tự định nghĩa được dùng sai với `@apply`.
- Load default state, save/load round-trip, state lỗi và migration.
- Balance riêng theo business; không tạo tổng balance.
- Tip/pay/booking pending không cộng điểm; confirm mới cộng và confirm lặp không cộng lần hai.
- Redeem thiếu điểm bị chặn; double confirm chỉ trừ một lần.
- Feedback 1 sao vẫn cộng 15 điểm; feedback lặp cùng visit bị chặn.
- Toggle consent/preferences và follow-tech persist sau reload.
- Saved offer, wish, look, appointment và logout/session persist đúng phạm vi.
- Tiếng Việt mặc định và đổi ngôn ngữ runtime không làm mất state.
- Render smoke test ở viewport mobile và desktop nếu môi trường browser automation sẵn có.

Definition of Done:

1. Không có control enabled nào click im lặng.
2. Các rule P0 liên quan prototype vượt kiểm thử.
3. Reload giữ đúng dữ liệu đã thay đổi.
4. Mobile bottom nav và desktop sidebar hoạt động đúng breakpoint.
5. Console không có lỗi Tailwind, Lucide hoặc JavaScript khi đi qua các luồng chính.

## 11. File dự kiến thay đổi

- `html/customer/cutomer-reward.html`: UI, state engine, domain actions và renderer.
- `html/customer/cutomer-reward.test.mjs`: kiểm thử action/state/rule.
- Không tạo hoặc sửa file ngoài `html/customer`.
