# Nexora Touch — Loyalty Points & Reward Redemption

**Document:** Business Analysis & Functional Specification  
**Version:** 1.0  
**Date:** July 17, 2026  
**Audience:** Product Owner, UX/UI, Engineering, QA, Operations  
**Status:** Ready for Dev estimation and refinement

## 1. Objective

Provide one merchant Loyalty workspace where owners configure point earning and reward redemption. Customers or staff can issue an eligible reward; the system deducts points automatically at issuance, creates a unique redeemable instrument, applies it later at POS, and records the complete lifecycle for audit and support.

Phase 1 supports cross-location redemption across locations owned by the same merchant. Redemption between salons belonging to different owners is Phase 2 because it requires financial settlement and partner governance.

## 2. Scope

### In scope

- Earn Rules and earning exclusions
- Reward Catalog with five reward types
- Available, Pending, and Lifetime point balances
- Customer self-service and staff-assisted reward issuance
- POS application and redemption
- Cross-location redemption within the same merchant
- Refund, reversal, expiration, void, and manager adjustment
- Loyalty Activity search, timeline, and CSV export
- Role permissions, immutable audit, Overview, and Analytics

### Out of scope

- Cross-owner partner salon redemption and settlement
- Cash conversion or point transfer between customers
- Customer mobile application implementation
- Multi-brand point exchange
- Final accounting policy for gift-card liability

## 3. Roles and Permissions

| Role | Allowed actions |
|---|---|
| Customer | View wallet, issue eligible reward, present coupon or QR |
| Staff | View wallet, issue/apply eligible reward, view customer activity |
| Manager | Staff actions, manual point adjustment, unused reward void, catalog status change |
| Owner | Configure rules, catalog economics, budgets, locations, roles, and analytics |
| System | Validate, deduct, reverse, expire, log, and prevent duplicate processing |

Manual adjustments and voids require Manager permission, a reason, and an immutable audit event.

## 4. Information Architecture

- Reward → Overview
- Reward → Earn Rules
- Reward → Reward Catalog
- Reward → Customers
- Reward → Loyalty Activity
- Reward → Analytics

Customers and POS reuse the same Customer Wallet and redemption service. Promotional campaigns and point-purchased catalog rewards remain separate business objects.

## 5. Point Wallet

| Balance | Meaning | Redeemable |
|---|---|---|
| Available | Posted points not reserved or spent | Yes |
| Pending | Earned but awaiting completion of payment/hold | No |
| Lifetime | Qualifying earned points used for tier calculation; not reduced by redemption | No |

Business rules:

- Points post only after a completed eligible payment.
- A full refund reverses all related earned points; a partial refund reverses proportionally.
- Reward-paid amounts do not earn points.
- Tip and tax are excluded unless the owner explicitly enables them.
- Manual adjustments require an actor, reason, approver, and audit event.
- Balances are server-authoritative and updated atomically.
- Expiration and reminder timing follow the merchant's Earn Rules.

## 6. Earn Rules

The owner can configure:

- Base rate, such as `$1 eligible spend = 1 point`
- Verified review bonus
- Successful referral bonus
- First completed visit bonus
- Birthday bonus
- Optional VIP earning multiplier
- Eligible services, retail, gift-card purchases, tax, and tip
- When Pending points become Available
- Expiration period and expiration reminder

## 7. Reward Catalog

Supported reward types:

| Type | Example | Required configuration |
|---|---|---|
| Gift Card | 500 points → $5 | Stored value, expiration, applicable locations |
| Dollar Discount | 900 points → $10 off | Minimum spend, exclusions, stacking |
| Percent Discount | 1,200 points → 15% off | Minimum spend and mandatory maximum discount |
| Free Service | 1,500 points → Free Gel | Linked service ID, services/staff/location eligibility |
| Free Product | 1,100 points → Cuticle Oil | Linked SKU and inventory availability |

Each catalog item contains name, description, type, points cost, value/linked item, minimum spend, maximum discount, expiration, per-customer limit, quantity/budget limit, stacking rule, eligible locations/services, and Active/Paused status.

Pausing stops new issuance. Instruments already issued remain valid until their own expiration unless a Manager explicitly voids them.

## 8. Recommended Redemption Model

Points are deducted when the customer or staff confirms **reward issuance**, not when the reward is later applied at payment. This prevents one balance from producing multiple rewards or being spent concurrently at different locations.

### Customer self-service

1. Customer opens Wallet and selects an eligible reward.
2. Server revalidates Available Points, reward status, limits, and location scope.
3. Customer reviews balance before/after and confirms.
4. System atomically deducts points and creates a unique coupon/QR with status `Issued`.
5. Customer presents the instrument at checkout.
6. POS validates conditions and applies it.
7. System changes status to `Redeemed` and links the invoice/payment.

### Staff-assisted

1. Staff finds the customer by phone, QR, or customer ID.
2. POS displays eligible rewards; staff never types the point deduction.
3. Staff selects the reward and reviews the exact balance change with the customer.
4. System issues the instrument and deducts points.
5. If applied in the same checkout, POS marks it `Redeemed`; otherwise it remains `Issued`.

Example:

```text
Customer: Linh Tran
Available: 1,650
Reward: Free Gel Add-on
Cost: 1,500
New balance: 150
Instrument: NT-GEL-A82K
Status after issuance: Issued
Status after payment application: Redeemed
```

## 9. Reward Instrument State Model

```text
Issued → Redeemed
      ↘ Expired
      ↘ Voided
Redeemed → Reversed (only through correction/refund workflow)
```

| State | Meaning |
|---|---|
| Issued | Points deducted; reward created; not yet used |
| Redeemed | Applied to a completed invoice |
| Expired | Validity ended before use |
| Voided | Unused reward cancelled by Manager |
| Reversed | Redemption corrected through linked compensating transactions |

History is append-only. Corrections create new compensating events linked to the original record; previous events are never edited or deleted.

## 10. Cross-Location Redemption — Phase 1

- Issuing and redeeming locations must belong to the same merchant account.
- Each reward selects one of: issuing location only, selected merchant locations, or all merchant locations.
- Server validates merchant ownership and location eligibility at issuance and redemption.
- Reward Instrument stores `issuingLocationId` and Redemption stores `redeemingLocationId`.
- Issuance metrics belong to the issuing location; service revenue belongs to the redeeming location; liability belongs to the merchant.
- Atomic status transitions and idempotency prevent double redemption across locations.

Phase 2 partner salons require partner agreements, point exchange rate, funding party, settlement amount/cycle, reconciliation, dispute rules, and partner suspension.

## 11. Loyalty Activity and Audit History

Loyalty Activity is the system-wide search surface. Customer Wallet displays the same events filtered to one customer.

### Filters

- Customer name, phone, or ID
- Coupon/QR/Instrument ID
- Activity type and status
- Issuing and redeeming location
- Employee/actor
- Invoice/payment ID
- Date range

### Activity types

- Points Earned
- Points Adjusted
- Points Reversed
- Points Refunded
- Reward Issued
- Reward Redeemed
- Reward Expired
- Reward Voided
- Redemption Reversed

### Activity table

| Time | Customer | Activity | Points | Balance | Reward | Location | Actor | Status |
|---|---|---|---:|---|---|---|---|---|
| Jul 17, 2:30 PM | Linh Tran | Reward Issued | −1,500 | 1,650 → 150 | Free Gel · NT-GEL-A82K | Main | Customer | Issued |
| Jul 20, 4:15 PM | Linh Tran | Reward Redeemed | — | 150 | NT-GEL-A82K | Katy | Anna | Completed |

Activity Detail shows the original point source, before/after balance, reward snapshot, instrument ID, all status transitions, issuing/redeeming locations, invoice/payment, actual discount value, actor, approver, reason, channel/device, timestamps, and links to reversals or support cases.

CSV export must match the current filters and role/merchant scope.

## 12. Data Contracts

### CustomerPointWallet

`customerId, available, pending, lifetime, tier, version, updatedAt`

### PointTransaction

`id, customerId, type, sourceId, delta, balanceBefore, balanceAfter, actorId, locationId, reason, createdAt, reversalOf`

### EarnRule

`id, merchantId, trigger, rate, points, eligibility, status, startsAt, endsAt`

### RewardCatalogItem

`id, merchantId, name, type, pointsCost, value, linkedItemId, conditions, limits, eligibleLocationIds, status`

### RewardInstrument

`id, code, customerId, catalogItemId, catalogSnapshot, pointsSpent, issuingLocationId, status, issuedAt, expiresAt`

### Redemption

`id, instrumentId, invoiceId, paymentId, redeemingLocationId, employeeId, actualDiscount, status, createdAt, idempotencyKey`

### AuditEvent

`id, entityType, entityId, eventType, actorId, reason, oldValue, newValue, locationId, timestamp`

All timestamps are stored in UTC and displayed in the merchant's configured timezone.

## 13. Validation and Error Handling

- Insufficient points: stop issuance and show the current Available balance.
- Reward paused, out of stock, or limit reached: stop and present eligible alternatives.
- Stale balance: refresh the wallet and require reconfirmation.
- Wrong location: block use and show eligible locations.
- Duplicate request: return the original result using the idempotency key.
- Already Redeemed/Expired/Voided: block POS application and show the status timeline.
- Network timeout after confirmation: query by idempotency key before retrying.
- Refund/correction: create linked compensating events; never delete history.

## 14. Analytics

- Active members and wallets by tier
- Points issued, redeemed, expired, reversed, and adjusted
- Outstanding Available Points and estimated liability
- Reward issuance and redemption rate
- Reward cost and influenced revenue
- Return visits after issuance/redemption
- Points expiring in 30/60/90 days
- Performance by reward and location
- Cross-location issued-versus-redeemed matrix

All period metrics show their date range. Liability must be labeled as an estimate.

## 15. Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| AC-01 | Customer or staff can issue an eligible reward; the system calculates and deducts points. |
| AC-02 | Confirmation shows customer, reward, conditions, and exact balance before/after. |
| AC-03 | Deduction and instrument issuance are atomic; failure leaves no partial state. |
| AC-04 | Every instrument has a unique code/QR and one current lifecycle status. |
| AC-05 | POS cannot redeem an instrument twice, including simultaneous attempts at different locations. |
| AC-06 | Issued and Redeemed are separate events linked by Instrument ID. |
| AC-07 | Cross-location redemption works only inside the same merchant and eligible location scope. |
| AC-08 | Wallet displays Available, Pending, Lifetime, eligible rewards, and history. |
| AC-09 | Activity search supports customer, instrument, invoice, actor, location, type, status, and date. |
| AC-10 | Adjustment and void require Manager permission, reason, and audit event. |
| AC-11 | Refunds and corrections create compensating events linked to originals. |
| AC-12 | CSV export respects filters and role/merchant data scope. |
| AC-13 | Period metrics display a date range and liability is clearly estimated. |
| AC-14 | UI provides visible keyboard focus, accessible dialogs, and status labels that do not rely on color. |

## 16. QA Scenarios

| Scenario | Expected result |
|---|---|
| Linh has 1,650 points and issues Free Gel for 1,500 | Balance becomes 150; Instrument is Issued; transaction and audit events exist |
| Same coupon is scanned simultaneously at two locations | Exactly one redemption succeeds; the second returns Already Redeemed |
| Reward is paused after issuance | Existing coupon remains valid; new issuance is blocked |
| Customer has 1,400 points for a 1,500-point reward | Issuance blocked; UI displays 100 more points needed |
| POS is at an ineligible location | Application blocked; eligible locations displayed |
| Manager voids an unused reward with restoration enabled | Instrument Voided; compensating positive-point event linked |
| Partial refund of qualifying payment | Proportional points reversal; history preserved |
| Network times out after confirmation | Retry returns original issuance using idempotency key |

## 17. Open Configuration Decisions

These are merchant settings, not unresolved implementation requirements:

- Whether expired unused rewards restore points
- Whether Manager-voided unused rewards restore points
- Point expiration duration
- Gift-card expiration behavior subject to applicable law
- Tier thresholds and VIP multiplier

## 18. Definition of Done

- AC-01 through AC-14 pass.
- Authorization tests pass for role and merchant scope.
- Idempotency and concurrency tests pass.
- Every lifecycle event is visible in Loyalty Activity and customer history.
- Analytics reconcile against transaction and redemption records.
- UX copy and error states are reviewed by Product/BA.
- API and database contracts are versioned and documented.
