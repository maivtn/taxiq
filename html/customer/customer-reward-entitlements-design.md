# NEXORA TOUCH — Thiết kế Customer Reward Entitlements

| Trường | Giá trị |
|---|---|
| Trạng thái | Chờ duyệt tài liệu |
| Ngày | 2026-07-15 |
| Phạm vi | Customer App, localStorage-first prototype |
| File triển khai chính | `cutomer-reward.html` |
| Tài liệu nguồn | `customer-app-developer-spec.md`, `customer-reward-localstorage-design.md`, `customer-app-prototype.html`, `customer-salon-cross-surface-design.md` |

## 1. Kết luận audit

Prototype hiện có ba màn `rewards`, `redeem`, `redeemdone` cho luồng **dùng điểm để đổi quà**. Domain hiện tại đã có reward catalog, kiểm tra balance/alliance, redemption idempotent, ledger debit và trạng thái redemption `ready → used | expired`.

Ba màn tham chiếu mới mô tả một khái niệm khác: **reward entitlement do salon phát cho khách**, quản lý theo `Available / Used / Expired`, có điều kiện sử dụng và được áp vào checkout. Prototype hiện chưa có:

- danh sách entitlement theo trạng thái;
- Reward Detail với minimum purchase, dịch vụ hợp lệ, expiry và combinability;
- reserve/Save for Later;
- Reward Credit trong checkout, Remove Reward và lifecycle theo payment confirmation;
- test chống dùng hai reward, dùng sai salon, hết hạn hoặc consume hai lần.

Vì vậy, tính năng mới chạy song song và không thay thế point redemption hiện tại.

## 2. Quyết định đã duyệt

1. Giữ nguyên luồng đổi điểm `REWARDS → redemption → redeemdone`.
2. Feedback hợp lệ vẫn cộng `+15` điểm cho mọi rating. Campaign của salon có thể phát thêm `$5 OFF`; Google Review không phát điểm hoặc reward.
3. `Use Reward` chỉ reserve. Reward chỉ được áp khi ticket đã hoàn tất và checkout hợp lệ được mở từ luồng quét QR thanh toán.
4. Mỗi ticket dùng tối đa một reward. Promo của salon vẫn có thể tồn tại.
5. Chỉ payment confirmed chuyển reward sang `used`.
6. Mỗi reward thuộc đúng một `businessId`; không chuyển, bán, cash-out hoặc cộng gộp giữa salon.

## 3. Mục tiêu và ngoài phạm vi

### 3.1 Mục tiêu

- Quản lý reward do salon tài trợ theo `available`, `reserved`, `applied`, `used`, `expired`.
- Hiển thị ba nested view khớp tham chiếu: Rewards, Reward Detail và Use Reward.
- Áp service credit vào đúng ticket/checkout bằng integer cents.
- Giữ nguyên điểm, ledger, point redemption và payment proof authority hiện có.
- Hỗ trợ migration localStorage, reload, EN/VI, accessibility và responsive hiện tại.

### 3.2 Ngoài phạm vi

- Không thiết kế dashboard tạo campaign của salon.
- Không định nghĩa payload hoặc chữ ký QR thanh toán; Rewards chỉ nhận checkout context đã xác thực.
- Không tạo ví tiền hoặc số dư tiền mặt.
- Không cho dùng reward khác salon, chuyển reward hoặc đổi reward thành tiền.
- Không thay đổi quy tắc feedback `+15` và Google Review.

## 4. Kiến trúc

Prototype giữ bốn lớp hiện tại:

1. **Catalog:** `REWARD_CAMPAIGNS` là fixture chỉ đọc, gồm campaign đang cho phép earn; production thay bằng API.
2. **State:** `rewardEntitlements` chỉ chứa benefit đã được phát và snapshot điều khoản tại thời điểm phát.
3. **Domain actions:** issue, reserve, evaluate, apply, remove, expire và consume.
4. **Renderer/controller:** nested views, tabs, disabled reason, toast và event delegation.

Không dùng `redemptions` cho entitlement. `redemptions` tiếp tục nghĩa là khách đã dùng điểm để đổi một offer.

## 5. Dữ liệu đề xuất

Rewards là task đầu tiên và nâng Customer schema từ `2` lên `3`.

```js
{
  rewardEntitlements: [{
    id: 'reward-entitlement-uuid',
    campaignId: 'review-credit-5',
    customerId: 'customer-demo',
    businessId: 'bitcoin-nail-bar',
    sourceType: 'feedback',          // feedback | tip
    sourceId: 'feedback-or-tip-id',
    benefitType: 'service_credit',  // service_credit | points_bonus
    title: { vi: 'Thưởng đánh giá', en: 'Review Reward' },
    description: { vi: 'Dùng cho dịch vụ đủ điều kiện.', en: 'Use toward an eligible service.' },
    valueCents: 500,
    points: 0,
    minimumPurchaseCents: 2500,
    eligibleServiceIds: ['*'],
    combinableWithRewards: false,
    status: 'available',
    issuedAt: 'ISO-8601',
    expiresAt: 'ISO-8601',
    reservedAt: null,
    reservedTicketId: null,
    appliedAt: null,
    appliedCheckoutId: null,
    usedAt: null,
    idempotencyKey: 'campaign:source'
  }],
  ui: {
    rewardManager: {
      statusFilter: 'available',
      selectedEntitlementId: null
    }
  }
}
```

Điều khoản được snapshot khi phát. Salon sửa campaign sau đó không hồi tố reward đã phát. ID, amount, timestamp và trạng thái phải canonical; record lỗi bị migration loại bỏ atomic, không được tự sửa thành reward có giá trị khác.

## 6. State machine

```text
available ──Use Reward──> reserved ──eligible checkout──> applied
    │                         │                                │
    └──expiry──> expired      └──expiry──> expired             ├──payment confirmed──> used
                                                               └──Remove/cancel──> reserved
```

- `Save for Later`: không mutation, quay về danh sách.
- `Remove Reward`: gỡ khỏi checkout và trả về `reserved`.
- Payment proof `pending_verification` hoặc `rejected`: reward vẫn `applied` cho checkout đang hoạt động, không thành `used`.
- Checkout bị hủy: trả reward về `reserved`.
- Reward được apply trước `expiresAt` giữ hiệu lực trong checkout hiện tại; checkout hết hiệu lực hoặc bị hủy mới đánh giá expiry lại.
- Mọi transition quan trọng có idempotency key và từ chối transition ngược không hợp lệ.

## 7. Phát reward

### 7.1 Review Reward

1. Feedback hợp lệ và chưa tồn tại cho visit.
2. Ghi ledger `feedback +15` vào đúng business như hiện tại.
3. Nếu campaign `review-credit-5` active và visit đủ điều kiện, tạo một entitlement `$5 OFF` bằng idempotency key `campaignId:feedbackId`.
4. Submit lại cùng feedback không cộng điểm hoặc phát reward lần hai.

### 7.2 Tip & Earn

- Trước khi tip, `Tip & Earn` là campaign opportunity đọc từ `REWARD_CAMPAIGNS`, không phải entitlement có thể áp vào checkout.
- `points_bonus` chỉ được tạo sau khi tip được business xác nhận và được lưu ngay ở trạng thái `used` để làm lịch sử nguồn thưởng.
- Confirmation tạo đúng một ledger entry `tip_bonus` theo rule business và một benefit record `used` cùng `sourceId`.
- Tip pending/rejected/expired không cộng điểm.
- Card ở tab Available mô tả cơ hội “Tip & Earn”; sau confirmation record nằm trong Used để khách thấy nguồn điểm.

## 8. Eligibility và tính tiền

`evaluateRewardForCheckout(entitlement, ticket, checkout, now)` chỉ trả eligible khi:

1. Entitlement là `available` hoặc `reserved` và thuộc đúng customer.
2. `businessId` khớp ticket và checkout.
3. Ticket đã hoàn tất theo snapshot vận hành đã xác thực.
4. Checkout chưa confirmed và chưa có reward khác.
5. Reward chưa hết hạn tại thời điểm apply.
6. Tổng service/add-on hợp lệ trước reward đạt `minimumPurchaseCents`.
7. Có ít nhất một line item khớp `eligibleServiceIds` hoặc wildcard `*`.

Thứ tự tính:

```text
service + accepted add-ons
− salon promo
− reward credit (capped để total không âm)
= before tip
+ tip theo basis hiện tại trước reward
= total payable
```

Reward không làm giảm tip basis của technician. Mọi số tiền dùng integer cents; không dùng float.

## 9. UI và action

Không tăng số lượng 31 `.app-screen`. Bổ sung nested views:

- `rewards`: `entitlements-list`, `entitlement-detail`, `redeem-catalog`.
- `pay`: `reward-application` trước `guest-checkout-view`.

### 9.1 Rewards

- Header Rewards và CTA “Đổi điểm” mở catalog hiện tại.
- Tabs `Available / Used / Expired`, keyboard và `aria-selected` đầy đủ.
- Service credit có View Reward. Tab Available có thể hiển thị campaign opportunity `Tip & Earn`; record points bonus đã xác nhận nằm trong Used.
- Empty state riêng cho từng tab.

### 9.2 Reward Detail

- Salon, value, title, description, minimum purchase, eligible services, expiry, combinability.
- `Use Reward` reserve record; nếu có reward reserved khác cùng business thì thay selection atomic.
- `Save for Later` không thay đổi state.

### 9.3 Use Reward

- Ticket number, line items, promo, Reward Credit và subtotal.
- Reward Applied, Saved amount, Remove Reward.
- `Continue to Tip & Payment` mở checkout hiện tại.
- Không eligible: reward không được gắn; UI nêu lý do cụ thể và cho chọn reward khác.

Action đề xuất:

```text
set-reward-status-filter
view-reward-entitlement
reserve-reward-entitlement
save-reward-for-later
open-redeem-catalog
remove-checkout-reward
continue-reward-checkout
```

## 10. Error handling, accessibility và i18n

- Mọi disabled control có `disabled`, `aria-disabled` và lý do EN/VI nhìn thấy hoặc liên kết bằng `aria-describedby`.
- Tab hỗ trợ ArrowLeft, ArrowRight, Home, End; focus chuyển tới heading nested view.
- Kết quả apply/remove dùng `role="status"`; lỗi eligibility dùng `role="alert"`.
- Không phân biệt status chỉ bằng màu; luôn có text và Lucide icon.
- Missing/invalid entitlement không fallback thành discount demo.
- localStorage save lỗi phải rollback UI/domain cùng nhau.

## 11. Test và acceptance

### 11.1 Domain P0

1. Feedback 1 sao vẫn `+15` và có thể phát đúng một `$5 OFF`.
2. Google share không phát reward.
3. Sai business, hết hạn, thiếu minimum purchase hoặc service không hợp lệ bị chặn atomic.
4. Hai reward trên một ticket bị chặn; promo salon vẫn được giữ.
5. Remove trả reward về `reserved`; payment pending/rejected không consume.
6. Payment confirmed consume đúng một lần; reload/retry không consume lần hai.
7. Reward credit không làm total âm và không đổi tip basis.
8. Tip bonus chỉ ghi ledger sau confirmation.
9. Migration v2→v3 giữ nguyên balances, ledger, redemptions, checkout và proof.

### 11.2 UI/contracts

- Giữ đúng 31 app screens; nested view/action/input có label và registry đầy đủ.
- Available/Used/Expired render từ state, không hardcode status.
- EN/VI parity và expiry date dùng locale phù hợp.
- Mobile bottom nav/desktop sidebar không đổi.
- Không có custom `app-*` trong Tailwind `@apply`.

## 12. File dự kiến

- `cutomer-reward.html`
- `cutomer-reward.test.mjs`
- `customer-app-developer-spec.md`
- `customer-reward-localstorage-design.md`
- `customer-app-independent-guide.md`
- `customer-reward-entitlements-design.md`

## 13. External dependencies

Production cần campaign API, server-side eligibility/idempotency, ticket/payment authority, audit log và expiry job. Prototype chỉ mô phỏng bằng localStorage và không tự nhận là nguồn xác nhận tiền hoặc trạng thái vận hành.
