# Thiết kế hoàn thiện Loyalty phía khách hàng

**Ngày:** 2026-07-20

**Phạm vi:** `html/customer/cutomer-reward.html` và bộ kiểm thử liên quan
**Nguồn yêu cầu:** `html/customer/18072026/nexora-loyalty-ui-handoff.md` và `Nexora-Touch-Loyalty-BA-Functional-Specification.md`

## 1. Mục tiêu

Hoàn thiện trải nghiệm Loyalty phía khách hàng trong prototype single-file hiện tại. Khách hàng phải xem được ba loại số dư, hiểu điều kiện của năm loại reward, phát hành reward an toàn, theo dõi vòng đời instrument và xem các giao dịch bù trừ do refund hoặc void.

Prototype tiếp tục dùng `localStorage`. Lớp domain trong HTML đóng vai trò backend mô phỏng để kiểm tra revalidation, idempotency và tính nguyên tử. Quyền Staff, Manager, Owner và màn hình cấu hình quản trị không thuộc phạm vi.

## 2. Nguyên tắc tương thích

- Giữ nguyên một file HTML có thể mở trực tiếp.
- Không thêm dependency runtime mới.
- Tiếng Việt là ngôn ngữ mặc định; vẫn hỗ trợ chuyển đổi Anh/Việt.
- Dữ liệu cũ có trường `points` được migrate sang `available` mà không làm mất ledger, redemption hoặc dữ liệu hành trình khách hàng.
- Các luồng booking, check-in, tip, payment, looks và referral không thay đổi hành vi ngoài phần đồng bộ mô hình điểm.
- Khu vực mô phỏng được gắn nhãn `Demo/QA`, không được thể hiện như tính năng dành cho khách hàng ở production.

## 3. Mô hình dữ liệu

### 3.1 Point wallet

Mỗi business balance có:

```text
available, pending, lifetime, credits, expiringPoints, version, updatedAt
```

- `available`: điểm đã ghi nhận và được phép đổi reward.
- `pending`: điểm đang chờ hoàn tất thanh toán hoặc hết hold; không được dùng để đổi reward.
- `lifetime`: tổng điểm đủ điều kiện dùng tính tier; redemption không làm giảm trường này.
- `version`: tăng sau mỗi thay đổi balance và dùng phát hiện stale confirmation.
- `updatedAt`: UTC ISO timestamp của thay đổi gần nhất.
- API tương thích nội bộ tiếp tục chấp nhận dữ liệu cũ có `points`, nhưng mọi dữ liệu mới dùng `available`.

### 3.2 Point transaction

Ledger mở rộng với các trường:

```text
id, businessId, type, pointsDelta, balanceBefore, balanceAfter,
refType, refId, reason, reversalOf, createdAt
```

Lịch sử là append-only. Refund, void hoặc correction tạo transaction bù trừ có `reversalOf`; không sửa transaction gốc.

### 3.3 Reward catalog item

Mỗi reward có:

```text
key, sourceBusinessId, acceptingBusinessId, type, cost, title,
description, conditions, minimumSpendCents, maximumDiscountCents,
linkedItemId, eligibleLocationIds, stackingRule, status,
validityDays, perCustomerLimit, stock
```

Năm loại được hỗ trợ:

1. `gift_card`: stored value, có initial/remaining balance và ngày hết hạn.
2. `dollar_discount`: giảm tiền một lần.
3. `percent_discount`: có phần trăm và `maximumDiscountCents` bắt buộc.
4. `free_service`: liên kết service ID.
5. `free_product`: liên kết SKU và stock.

`status` nhận `active` hoặc `paused`. Paused chặn phát hành mới nhưng không vô hiệu instrument đã phát hành.

### 3.4 Reward instrument

Redemption hiện tại được mở rộng thành instrument với:

```text
id, idempotencyKey, rewardKey, catalogSnapshot, customerId,
sourceBusinessId, acceptingBusinessId, issuingLocationId,
eligibleLocationIds, pointsSpent, status, code, qrPayload,
initialValueCents, remainingValueCents, issuedAt, expiresAt
```

Trạng thái gồm `issued`, `redeemed`, `expired`, `voided`, `reversed`. Dữ liệu cũ có `ready` được migrate thành `issued`; trạng thái đã dùng tiếp tục được suy ra từ check-in hiện hữu và được hiển thị là `redeemed`.

## 4. Giao diện khách hàng

### 4.1 Wallet

- Hiển thị ba ô riêng cho Available, Pending và Lifetime.
- Chỉ Available xuất hiện trong lời gọi đổi reward.
- Hiển thị tier, tiến độ tier, điểm sắp hết hạn và thời gian cập nhật.
- Có skeleton trong trạng thái loading, empty state và error state có nút thử lại.

### 4.2 Reward catalog

- Card hiển thị loại reward, giá điểm, mô tả ngắn, location và trạng thái khả dụng.
- Reward detail/review hiển thị toàn bộ điều kiện, stacking rule, minimum spend, maximum discount và ngày hết hạn dự kiến.
- Reward paused, hết stock, đạt limit, sai location hoặc thiếu điểm bị khóa với lý do cụ thể và gợi ý reward hợp lệ khác.
- Tabs tiếp tục tách Khám phá, Đã phát hành và Đã dùng.

### 4.3 Confirmation và result

- Review hiển thị tên khách hàng, reward, điều kiện, Available trước/sau và location phát hành.
- Nút xác nhận chuyển qua `submitting`, khóa thao tác gửi lặp và có thông báo accessible.
- Thành công hiển thị instrument code/QR, trạng thái, thời gian phát hành và hết hạn.
- Gift Card hiển thị giá trị ban đầu và số dư còn lại.
- `stale` tải lại balance/catalog và bắt buộc khách xác nhận lại.
- `failed` giữ nguyên số dư, giải thích nguyên nhân và cho phép thử lại hoặc quay lại catalog.

### 4.4 History

- Hiển thị earned, pending, settled, redemption, refund reversal, void restoration và expiration.
- Giao dịch bù trừ có nhãn và liên kết mô tả giao dịch gốc.
- Trạng thái instrument có text/icon; không chỉ dựa vào màu.

### 4.5 Demo/QA

Một panel thu gọn cho phép mô phỏng:

- chuyển Pending thành Available;
- pause/unpause reward;
- làm balance version bị stale trước lúc xác nhận;
- refund toàn phần hoặc một phần để tạo reversal;
- void instrument chưa dùng có hoàn điểm;
- dùng một phần Gift Card;
- chuyển thời gian để instrument hết hạn.

Các action mô phỏng phải gọi cùng domain function với UI chính và không được sửa trực tiếp DOM như nguồn dữ liệu.

## 5. Luồng nghiệp vụ

### 5.1 Phát hành reward

1. Khách chọn reward và UI lưu snapshot gồm reward key, balance version và catalog status.
2. Màn review tính số dư sau từ `available`.
3. Khi xác nhận, domain kiểm tra lại reward active, stock/limit, location, available và version.
4. Nếu hợp lệ, một thao tác nguyên tử tạo instrument, ledger debit và balance version mới.
5. Nếu cùng idempotency key đã thành công, trả instrument cũ mà không trừ điểm lần hai.
6. Nếu stale, không thay đổi state; UI tải giá trị mới và yêu cầu xác nhận lại.

### 5.2 Vòng đời instrument

- `issued` có thể thành `redeemed`, `expired` hoặc `voided`.
- Reward catalog bị pause không ảnh hưởng instrument đang `issued`.
- Instrument hết hạn không tự hoàn điểm.
- Void chưa dùng trong demo có cấu hình hoàn điểm và tạo ledger bù trừ.
- Gift Card dùng một phần vẫn ở trạng thái `issued` cho tới khi remaining balance bằng 0; không được đổi phần còn lại thành điểm.

### 5.3 Refund và correction

- Refund điểm earned tạo delta âm tỷ lệ với khoản refund và liên kết transaction gốc.
- Correction cho reward đã redeemed tạo trạng thái `reversed` và event mới; không xóa lịch sử.
- Customer app chỉ hiển thị kết quả. Các nút tạo sự kiện này chỉ tồn tại trong panel Demo/QA.

## 6. Accessibility và responsive

- Mọi control có keyboard focus rõ ràng và vùng nhấn tối thiểu theo pattern hiện tại.
- Dialog/overlay trap focus, đóng bằng Escape và trả focus về trigger.
- Trạng thái loading/submitting/success dùng `aria-live="polite"`; lỗi chặn giao dịch dùng `role="alert"`.
- Nhãn trạng thái có text và icon, không phụ thuộc màu.
- Kiểm tra contrast cho text và interactive controls theo WCAG AA.
- Wallet và reward grid hoạt động từ viewport mobile hiện tại tới desktop mà không tràn ngang.

## 7. Kiểm thử

Áp dụng TDD theo từng nhóm:

1. Migration và invariant cho Available/Pending/Lifetime/version.
2. Năm reward type và validation bắt buộc.
3. Eligibility chỉ dùng Available và giải thích đúng từng lý do khóa.
4. Atomic issuance, stale version và idempotency.
5. Paused catalog không ảnh hưởng instrument đã issued.
6. Lifecycle, Gift Card partial use, expiration, void restoration và refund reversal.
7. Rendering Wallet, reward detail, history, skeleton, error và Demo/QA.
8. Keyboard, Escape, focus return, aria-live và nhãn trạng thái.
9. Regression cho các luồng customer hiện hữu.

Bộ test toàn phần phải chạy bằng:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

## 8. Tiêu chí hoàn thành

- Wallet hiển thị và lưu đúng Available, Pending, Lifetime.
- Chỉ Available được dùng khi phát hành reward.
- Cả năm reward type có dữ liệu và giao diện đúng semantics.
- Confirmation có khách hàng, điều kiện và số dư chính xác trước/sau.
- Stale, submitting, failed và success đều có UI kiểm thử được.
- Instrument có code/QR duy nhất, lifecycle và lịch sử append-only.
- Gift Card hiển thị và cập nhật remaining balance.
- Paused, wrong location, refund, void và expiration có hành vi đúng thiết kế.
- Panel Demo/QA mô phỏng được toàn bộ trường hợp ngoại lệ đã liệt kê.
- Tiếng Việt là mặc định và bản dịch Anh/Việt không bị trộn.
- Các test Loyalty mới đạt; mọi regression do thay đổi Loyalty gây ra được sửa trước khi bàn giao.

## 9. Ngoài phạm vi

- API, database hoặc đồng bộ server thật.
- Màn hình và quyền quản trị Staff/Manager/Owner.
- Thanh toán liên merchant và settlement Phase 2.
- Thay đổi chính sách thuế hoặc accounting Gift Card.
- Tự động hoàn điểm cho reward hết hạn.
