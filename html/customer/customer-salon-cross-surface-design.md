# Customer App + Salon Cross-surface Prototype — Design Spec

**Ngày:** 15/07/2026
**Trạng thái:** Chờ review
**Phạm vi file:** Chỉ `html/customer`

## 1. Mục tiêu

Bổ sung các màn hình trong bộ screenshot nhưng vẫn giữ đúng boundary của NEXORA TOUCH Customer App. Customer App sẽ được mở rộng cho các luồng khách hàng; các luồng vận hành salon/staff sẽ nằm trong một companion prototype riêng để không phá contract 31 màn hiện có.

## 2. Phân chia artifact

### Customer App — `cutomer-reward.html`

Bổ sung hoặc mở rộng các luồng:

- Salon Scan dùng một màn Scan để nhận diện nhiều salon qua QR.
- Guest Check-in: tên, số điện thoại, service, technician và check-in.
- Guest Checkout: line items, promo, tip percentage, payment method và total.
- Payment Proof: upload ảnh proof, ghi chú và trạng thái chờ front desk verification.
- Payment Confirmed: receipt chi tiết, review CTA, tip CTA và lưu lịch sử.
- My Referrals: QR/code, share link và danh sách invited/joined/rewarded.

### Salon Operations Companion — `customer-salon-operations.html`

File standalone cùng thư mục, có role switcher để demo:

- Customer Live Ticket: ticket number, trạng thái in service, technician, total và các tab Pay/Review/Reward.
- Approve Add-on: staff đề xuất add-on, khách accept/decline và xác nhận 4 số cuối điện thoại.
- Staff Not Eligible: cảnh báo technician không đủ điều kiện, danh sách staff đề xuất và Ask Front Desk.

Các flow companion không được thêm vào danh sách 31 `app-screen` của customer app chính.

## 3. Luồng và trạng thái

### 3.1 Salon Scan và Guest Check-in

1. Khách mở Scan.
2. QR xác định salon, station và technician tùy chọn.
3. Khách có thể chọn salon khác ở lần scan tiếp theo; balance và ledger luôn gắn với salon đích.
4. Guest Check-in lưu thông tin tối thiểu và tạo visit.
5. Check-in trùng cùng salon trong duplicate window bị chặn; salon khác không bị coi là trùng.
6. Offline check-in vào queue và retry vẫn giữ timestamp lúc scan.

### 3.2 Checkout và Payment Proof

- Checkout draft gồm line items, promo, tip, phương thức thanh toán và tổng tiền.
- `paymentProof` có lifecycle `draft → pending_verification → verified | rejected`.
- Upload proof chỉ là bằng chứng để front desk xác minh; không tự chuyển sang paid.
- Khi verified, payment chuyển sang `confirmed`, receipt được lưu và điểm direct-pay chỉ tính sau xác nhận.

### 3.3 Live Ticket và Add-on

- Ticket có lifecycle `waiting → in_service → completed`.
- Add-on có lifecycle `proposed → accepted | declined`.
- Accept add-on cập nhật checkout total; decline giữ nguyên total.
- Staff Not Eligible chỉ là cảnh báo routing; không tự đổi technician nếu khách chưa chọn.

### 3.4 Referral

- Referral record có `invited → joined → rewarded`.
- QR/code và native share chỉ tạo attribution; reward chỉ release sau first paid visit theo rule business.
- Không hiển thị affiliate cash trong customer flow.

## Quyền sở hữu state đã chốt

| State | Owner duy nhất | Artifact còn lại |
|---|---|---|
| Guest check-in, checkout, proof, receipt, guest claim, referral | `nexora.customer.prototype.v1` | Companion chỉ đọc snapshot đã sanitize |
| Service ticket, staff eligibility, add-on request | `nexora.customer.crosssurface.v1` | Customer chỉ đọc accepted add-on đã sanitize |

Cross-surface join chỉ dùng `guestCheckinId` và `ticketId`; không join theo tên hoặc số điện thoại hiển thị. Guest check-in thành công mở Customer Live Ticket trước; chỉ nút Pay rõ ràng tại đây mới handoff sang Guest Checkout. Staff Not Eligible chỉ hiện khi kết quả eligibility không đạt; Approve Add-on chỉ hiện khi có add-on đang chờ quyết định. `cutomer-reward.html` vẫn đúng 31 `.app-screen`; các flow mới là nested views. `customer-salon-operations.html` chứa ba screen độc lập `ops-liveticket`, `ops-staffnoteligible`, `ops-addonapproval`. Trạng thái tài liệu vẫn là **Chờ review** cho tới khi Product Owner phê duyệt.

## 5. UI và accessibility

- Giữ palette, Tailwind Browser CDN, Lucide và responsive mobile-first hiện tại.
- Customer App vẫn có bottom navigation mobile và sidebar desktop.
- Companion dùng header role badge rõ ràng để phân biệt Customer, Front Desk và Staff.
- Tất cả action có handler; disabled action phải có lý do.
- Upload proof có preview, nút remove và trạng thái lỗi; không hiển thị upload thành công nếu file chưa được đọc.
- Các trạng thái pending/verified/rejected/in service/accepted phải có text, màu và icon; không chỉ dùng màu.
- EN/VI dùng cùng translation dictionary; tên business và amount được escape trước khi render.

## 6. Test plan

### Customer App

- Parse QR nhiều salon và chọn đúng business balance.
- Guest check-in tạo visit đúng service/staff và merge account sau OTP.
- Checkout tính đúng promo, tip và total.
- Payment proof chuyển đúng lifecycle, reject không cộng điểm.
- Payment confirmed lưu receipt line items và chỉ cộng điểm một lần.
- Referral QR/share không release reward trước paid visit; self-referral bị chặn.
- Existing 31 screen IDs, actions và localStorage tests tiếp tục pass.

### Companion

- Ticket đổi `waiting/in_service/completed` đúng quyền role.
- Add-on accept/decline cập nhật total nguyên tử.
- Staff ineligible không cho confirm staff không đủ điều kiện.
- Companion reload vẫn giữ state riêng; reset demo không đụng Customer App key.

## 7. Không thuộc phạm vi

- Backend/API/SMS/payment webhook thật.
- Camera QR decoder và front desk verification production.
- Hiring marketplace đầy đủ, chat reveal, payroll hoặc affiliate cash.
- Thay đổi business rules điểm, payment liability hoặc TCPA policy đã khóa trong developer spec.

## 8. Tiêu chí hoàn thành

- Các flow customer-facing trong screenshot có đường đi demo rõ ràng và persistence.
- Companion mở độc lập trong cùng thư mục và minh họa được ba flow salon/staff.
- Không thêm screen ID vào inventory 31 của `cutomer-reward.html`.
- Test hiện có không giảm; test mới bao phủ state transition và các lỗi pending/rejected.
- Tài liệu business được cập nhật để phản ánh các màn đã bổ sung.
