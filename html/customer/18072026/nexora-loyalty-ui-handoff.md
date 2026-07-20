# Nexora Touch Loyalty UI — Dev Handoff

## Screen Inventory

- Overview: program health, period metrics, recent redemptions, reward return.
- Earn Rules: base rate, eligible amounts, bonuses, availability and expiration.
- Reward Catalog: five reward types, points cost, terms, usage and status.
- Customers: Available Points, progress to next reward and wallet action.
- Customer Wallet: Available, Pending and Lifetime balances, eligible rewards and history.
- Redemption: exact before/after balance, confirmation, unique instrument and success.
- Analytics: cost, influenced revenue, returning members and expiring points.

## States

- Catalog item: Active or Paused. Paused items cannot be newly redeemed.
- Wallet: loading is not represented in the static prototype; production should use skeleton rows and preserve table context.
- Reward eligibility: eligible, insufficient points, or unavailable.
- Redemption: review, submitting, success, or stale/failed.
- Submission must be idempotent. A stale balance or catalog change stops redemption and reloads the current values.
- Closing a drawer or dialog returns focus to its triggering control.

## Permissions

- Staff: view balances and redeem eligible rewards.
- Manager: Staff permissions plus manual point adjustments, unused reward voids and catalog status changes.
- Owner: Manager permissions plus Earn Rules, reward economics, limits, budgets and role permissions.
- Manual adjustments and voids require a reason and immutable audit entry.

## Data Contracts

- `CustomerPointWallet`: `customerId`, `available`, `pending`, `lifetime`, `tier`, `updatedAt`.
- `PointTransaction`: `id`, `customerId`, `type`, `sourceId`, `earned`, `redeemed`, `balance`, `actorId`, `reason`, `createdAt`.
- `EarnRule`: `id`, `trigger`, `rate`, `points`, `eligibility`, `status`, `startsAt`, `endsAt`.
- `RewardCatalogItem`: `id`, `name`, `type`, `pointsCost`, `value`, `conditions`, `limits`, `status`.
- `Redemption`: `id`, `customerId`, `rewardId`, `pointsSpent`, `instrumentId`, `employeeId`, `locationId`, `status`, `createdAt`, `expiresAt`.

Backend eligibility and balance are authoritative. The client must revalidate at confirmation and never trust displayed values as a transaction decision.

## Reward Semantics

- Gift Card: stored monetary value; remaining balance is possible.
- Dollar Discount: one-time fixed adjustment.
- Percent Discount: one-time percentage adjustment with a required maximum discount.
- Free Service: linked to a service ID.
- Free Product: linked to a SKU and inventory availability.

## Error and Edge Cases

- Full refunds reverse all earned points; partial refunds reverse proportionally.
- Pending points cannot be redeemed.
- Reward-paid amounts, tax and tip do not earn points unless explicitly enabled.
- Already-issued instruments remain valid when a catalog item is paused.
- An unused instrument may be voided by a Manager; the confirmation states whether points return.
- A partially used gift card cannot be converted back to points.
- Duplicate confirmation requests return the original redemption rather than issuing twice.

## Acceptance Checklist

- [ ] All five Loyalty sections are available from one workspace.
- [ ] All five reward types can be configured.
- [ ] Available, Pending and Lifetime balances are visually distinct.
- [ ] Only Available Points are included in eligibility.
- [ ] Confirmation identifies customer, reward, conditions and exact before/after balance.
- [ ] Successful redemption creates a unique instrument and audit record.
- [ ] Role restrictions are enforced on the server.
- [ ] Period metrics display a date range.
- [ ] Estimated liability is clearly labeled as an estimate.
- [ ] Keyboard focus, Escape closing and focus return are implemented.
- [ ] Text and interactive controls meet WCAG AA contrast targets.
