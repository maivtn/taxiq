# Nexora Touch POS Checkout & Loyalty Design

Date: 2026-07-17  
Status: Product-owner review

## Objective

Extend the existing Dispatch flow from Ready to Pay through completed payment while safely coordinating customer identity, services, technicians, packages, loyalty rewards, promotions, tax, tip, payments, point earning, refunds, and audit history.

The existing check-in, queue, assignment, and in-service behavior remains unchanged.

## Primary Flow

`In Service → Ready to Pay → Review Ticket → Charge → Paid`

- Technician uses Done to move a ticket to Ready to Pay.
- Front desk uses Review & Charge to open Checkout.
- Paid is system-controlled and occurs only after confirmed payment success.

## Checkout Structure

The Checkout drawer contains:

1. Customer identity and Loyalty Wallet
2. Service/product lines with technician ownership
3. Package/prepaid credits
4. Reward instruments
5. Promotions and discounts
6. Subtotal, tax, and tip
7. Payment methods and split-payment progress
8. Estimated points earned
9. Final amount due
10. Ticket activity timeline

## Loyalty Behavior

- Staff never types the point deduction.
- Customer or staff may issue an eligible reward.
- Issuance atomically deducts points and creates a unique instrument.
- Adding an issued instrument to a draft ticket changes its UI state to Applied to Ticket, while the persisted reward status remains Issued.
- Payment success changes the persisted reward status to Redeemed.
- Removing a reward from an unpaid ticket returns it to Issued.
- Payment failure or abandonment leaves it Issued.
- Payment timeout triggers status lookup by idempotency key before retry.

Displayed lifecycle:

`Selected → Issued → Applied to Ticket → Redeemed`

Alternate transitions: Applied to Ticket → Removed; Issued → Expired or Voided.

## Pricing Order

1. Service and product subtotal
2. Free-service/free-product reward allocation
3. Fixed-dollar or percentage reward allocation
4. Stackable promotion allocation
5. Gift-card payment allocation
6. Tax calculation according to jurisdiction and item taxability
7. Tip
8. External payment

Points are earned on eligible net spend after discounts, excluding tax, tip, gift-card purchases, package/redemption-covered amounts, and reward-paid amounts unless an owner rule explicitly says otherwise.

## Allocation Rules

- Every package credit, reward, promotion, tax, tip allocation, and commission allocation links to a specific line item or explicit ticket-level allocation.
- One service line cannot simultaneously consume a package credit and a free-service reward.
- A reward may be non-stackable with promotions.
- Percentage rewards require a maximum discount.
- Minimum spend is evaluated after excluded items and before gift-card payment.
- Gift card is a payment instrument, not a discount.
- Free-service reward commission behavior is an owner-configured policy and must be shown before payment.

## Customer Identity

Points and rewards require a resolved Customer ID from account, phone, or membership QR. Guest checkout remains possible but does not earn/redeem loyalty until linked. Duplicate phone matches require selection or merge by an authorized user. Marketing consent remains separate from loyalty identification.

## Payment States

- Draft
- Processing
- Partially Paid
- Paid
- Failed
- Unknown/Timeout
- Voided
- Partially Refunded
- Refunded

Payment creation and confirmation use an idempotency key. Unknown/Timeout must query the provider and local transaction state before allowing another charge.

## Packages and Prepaid Services

- Package balance is displayed per eligible line.
- Applying a package credit reserves it on the draft ticket.
- Payment success consumes the reserved credit.
- Removing the line, voiding the draft, or payment failure releases the reservation.
- Package credit and free-service reward cannot fund the same line.

## Multi-Tech, Split Ticket, and Split Payment

- Each service line has one or more technician allocations.
- Tips can be allocated by customer choice or configured default.
- Commission uses the configured pre-discount or post-discount basis and records the calculation snapshot.
- Split payment records each tender independently and shows remaining amount.
- Multi-customer tickets maintain customer ownership per line before applying a customer-specific reward.

## Refund and Void

- Unpaid ticket void releases package and reward reservations.
- Paid-ticket void/refund requires Manager permission and reason.
- Full and partial refunds create compensating transactions.
- Earned points reverse proportionally to refunded eligible net spend.
- Reward restoration behavior follows owner policy and is shown before confirmation.
- History is append-only; original payment, reward, and point records are never deleted.

## Audit Timeline

Each ticket records customer identification, line changes, assignment, price override, package reservation/consumption, reward validation/application/redemption, promotion, payment attempts, payment success/failure, tip allocation, points earned, void, refund, and manager approval.

Every event includes actor, role, location, device/register, source entity, before/after values, reason where required, timestamp, and related IDs.

## UI States and Errors

- Insufficient points
- Reward paused, expired, voided, already redeemed, or out of stock
- Wrong merchant/location
- Reward not eligible for selected service
- Minimum spend not met
- Non-stackable reward conflict
- Package/reward line conflict
- Wallet changed on another device
- Payment failed
- Payment outcome unknown
- Duplicate submission

Errors preserve the draft and explain the next safe action.

## Data Contracts

- Ticket: ID, customer ownership, location, status, totals, version, timestamps
- TicketLine: service/product, technician allocations, customer owner, quantity, price, taxability, status
- BenefitAllocation: line/ticket target, type, package/reward/promotion source, amount, status
- RewardApplication: instrument ID, ticket ID, line IDs, validation snapshot, Applied/Removed/Redeemed timestamps
- PackageReservation: package ID, unit ID, line ID, status, expiration
- PaymentAttempt: provider, tender, amount, idempotency key, provider reference, status
- TipAllocation: payment/ticket, technician, amount, method
- PointTransaction: customer, source payment, delta, before/after balance, status
- TicketAuditEvent: actor, location, register, type, entity IDs, reason, before/after, timestamp

## Prototype Screens

1. Ready to Pay ticket with Review & Charge
2. Checkout drawer and customer wallet
3. Reward selection and validation
4. Package/reward conflict
5. Tip and split payment
6. Payment Processing, Failed, Unknown, and Success states
7. Receipt with points and instrument information
8. Ticket Activity timeline
9. Manager refund/void confirmation

## Acceptance Criteria

- Ready to Pay does not imply payment success.
- Paid can only be set by confirmed payment success.
- Checkout shows exact reward and package allocations by line.
- Staff cannot manually enter a loyalty deduction.
- Reward remains Issued until payment succeeds.
- Payment failure or removal leaves the reward available as Issued.
- Package and free-service reward cannot fund the same line.
- Points preview matches eligible net spend and posts only after payment.
- Split payments cannot exceed the remaining balance.
- Duplicate payment/redeem requests do not create duplicate results.
- Refunds generate linked compensating point, reward, payment, and package events.
- Cross-location validation respects merchant and location scope.
- Ticket Activity exposes the full lifecycle with actors and IDs.
- Keyboard focus, dialog labeling, and status text meet accessibility requirements.

## Out of Scope

- Changes to the existing Dispatch assignment algorithm
- Payment processor implementation
- Jurisdiction-specific tax/legal advice
- Cross-owner loyalty settlement
- Production accounting recognition policy
- Offline payment reconciliation beyond explicit Unknown/Timeout recovery
