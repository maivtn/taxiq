# Nexora POS — production handoff after V33 prototype

**Tài liệu triển khai đầy đủ:** [Nexora POS developer specification](./nexora-pos-developer-spec.md). Tài liệu này trình bày cấu trúc menu mới, lưu thứ tự riêng cho từng người dùng, mô hình dữ liệu, API, luồng ticket/Turn Board/checkout, phân quyền và tiêu chí nghiệm thu.

The standalone HTML prototype demonstrates the connected front desk workflow. It has no Nexora API connection. Browser `sessionStorage` keeps demo data across a refresh in the same tab only; it must never become the source of truth for salon records.

## Connected workflow

1. Check-in finds or creates a customer ticket. Direct checkout remains available without a check-in.
2. Turn Board lists only checked-in, unassigned guests and technicians clocked into a shift. It sorts by turns today, then shift check-in sequence. The owner can set a demo turn rule and category skill level. Manual assignment records skipped technicians. Undo records a reversal.
3. Tickets tracks each main service's completion and moves the ticket to Ready to pay when all are complete. Technicians can add a service to the same checked-in ticket; the assignment writes a turn entry.
4. Checkout opens the existing ticket with its customer, technician, and services already filled in. The service picker and Price Menu use the same 92-service catalog snapshot.
5. Cancellation requires a reason and warning. Cancelling In service or Ready to pay requests a demo Manager PIN. The operator can return uncompleted turn credits to the queue; the turn log records reversals. Cancelled tickets leave open work but remain in check-in history.
6. Checkout demonstrates Cash, Card, Gift Card, Crypto, wallets, and Split Pay. Split Pay supports Card, optional Cash, and one other method. Demo Gift Card balances are checked and reduced on payment. Demo wallet payment has pending, confirmed, and declined states.
7. Completed Services shows a saved demo receipt and can record a full or partial demo refund with reason and Manager PIN. A gift card's demo balance is restored up to its paid portion.

## Required backend contracts

- **Identity and permissions:** Authenticate the operator and approver individually. Authorize salon scope, roles, skill edits, price edits, cancellation, and refund on the server. Bind each PIN approval to an immutable action payload, expire it, rate-limit attempts, and audit attempts. The HTML PIN is only a visual simulation.
- **Customer and ticket:** Provide atomic customer lookup/create, check-in, ticket creation, service assignment, service completion, cancellation, and checkout status transitions. Reject duplicate open tickets and invalid transitions. Return a version or ETag for conflict detection across stations.
- **Shift and turn ledger:** Persist staff check-in/out sequence, skill level per service, salon turn rule, assignment, skipped candidates, and reversal entries. Calculate turn cost server-side and assign under a transaction/lock so two front desks cannot take the same turn. Follow `TurnBoardDacTaBackend.pdf` for the complete rule set, including tier rules and shared work.
- **Catalog and pricing:** Serve services, add-ons, durations, prices, discounts, fees, tax, and accepted tender configuration from one versioned catalog and salon settings API. Recalculate final totals server-side. Store the applied rule versions on each receipt.
- **Payment settlement:** Replace every demo confirmation with verified processor, wallet, QR, gift card, or crypto status. Split settlement needs an idempotent payment intent per tender, partial success/failure recovery, and a final server-confirmed paid state. Card fees and refunds must be tied to actual settled amounts.
- **Gift card:** Use the existing gift card ledger for issue, balance, redeem, reversal, and refund. Never trust a browser balance. Prevent a balance from being spent twice.
- **Refund and receipt:** Check refundable balance and original tender, execute provider refunds, store receipt and refund ledger entries, and report failure/partial settlement. Printing and SMS need the configured printer and messaging services, phone confirmation, consent, and delivery status.
- **Durability and sync:** Save drafts server-side, resume after sign-in, and broadcast ticket, shift, and payment changes to all workstations. Do not store real customer or payment data in `sessionStorage`.

## Prototype verification

The local VM checks exercise check-in → turn assignment → undo → service completion → existing-ticket checkout → gift card payment → refund and same-tab reload. They also cover cancellation reason/PIN, menu navigation, tip calculation, and Price Menu category search. These tests do not verify browser layout, hardware, live providers, or concurrent stations.
