---
name: customer-docs
description: Use when creating, generating, updating, auditing, or reviewing product, developer, QA, UX, design, implementation-plan, or prototype documentation for the NEXORA TOUCH customer app under html/customer.
---

# Customer Documentation

## Overview

Generate customer-app documentation from verified project sources. Specifications define behavior; prototypes define UI and click flow. Keep every output inside `html/customer`.

## Sources and Priority

Read each relevant source completely before writing:

| Scope | Source |
|---|---|
| Customer behavior, data, rules, edge cases | `customer-app-developer-spec.md` |
| Explore or follow-tech | `three-sided-marketplace-spec.md` |
| Approved UI and flow | `customer-app-prototype.html` |
| Current implementation evidence | `cutomer-reward.html` |
| LocalStorage action/state design | `customer-reward-localstorage-design.md` |
| Updating an artifact | The target document |

Priority: customer developer spec → marketplace spec for its customer scope → approved design → UI prototype → current HTML evidence. Report material contradictions instead of silently choosing a weaker source.

## Workflow

1. Identify artifact type, audience, language, scope, and create/update/audit intent.
2. Run `rg --files html/customer`; reuse the target filename for updates.
3. Read all required sources. Do not rely on excerpts or memory.
4. Extract locked rules, screen/action coverage, ownership, pending/error states, and non-goals.
5. Write Vietnamese unless requested otherwise. Preserve screen IDs, API names, state fields, and i18n keys exactly.
6. Create or edit only files inside `html/customer`.
7. Run the quality gates before reporting completion.

## Locked Rules

- NEXORA never holds money; payments go directly to the business or staff.
- Keep balances separate per business; never describe a cross-business total.
- Points never cash out, transfer, or sell.
- Tip, direct-payment, and booking points release only after business confirmation.
- Private feedback awards 15 points for every rating; Google sharing is optional and unrewarded.
- Marketing consent is optional and timestamped; Skip keeps points; transactional messages remain available.
- Follow-tech requires a shared visit. Tech notification opt-in defaults off; owners never see follower lists or counts.
- Customer scope excludes the staff/owner hiring marketplace.
- Ledger entries are append-only and traceable to a source transaction.

## Output Contracts

| Artifact | Required content |
|---|---|
| Developer spec | Purpose, entry, UI/data, behavior, backend contract, edge cases, acceptance tests |
| Design spec | Goals/non-goals, source priority, architecture, state/data, flows, responsive UI, errors, accessibility, i18n, tests, files |
| Implementation plan | Small TDD tasks, exact paths/interfaces, failing test and command, implementation, passing command, commit |
| Audit/report | Evidence, working actions, missing/misleading actions, rule gaps, priority, recommended change |
| Test spec | Preconditions, action, expected UI/state/ledger, business ID, idempotency, errors |

Preserve useful existing content and change only the requested scope. For a versioned `vX.Y` filename, create the next version unless the user requests an in-place edit.

## File Rules

- Use lowercase kebab-case for new Markdown filenames.
- Keep `cutomer-reward.html` unchanged unless a rename is explicitly requested.
- Use relative links inside documents.
- Do not create a README, changelog, duplicate summary, or file outside `html/customer` unless requested.

## Quality Gates

1. Search for `TODO`, `TBD`, `FIXME`, fake success claims, and unresolved placeholders.
2. Verify every screen ID, action, reward key, state field, and path against a source or mark it proposed.
3. Confirm point mutations name one business and pending transactions award zero points.
4. Recheck feedback, consent, money, follow-tech, and no-cash-out rules.
5. Distinguish frontend simulation from backend, device, payment-app, camera, SMS, push, OCR, or webhook integration.
6. Run `git diff --check` and relevant tests.
7. Report the output path, validation, and external dependencies.

## Quick Reference

| Request | Also verify |
|---|---|
| Wallet/rewards | Per-business balance, ledger, alliance, expiry |
| Tip/direct pay | Enabled methods, direct money path, confirmation, idempotency |
| Booking | Request-not-instant copy, note, confirmation, appointment |
| Feedback | Any-rating +15, one per visit, Google no-points |
| Onboarding/messages | Optional consent, double opt-in, STOP/HELP, timestamp |
| Explore/follow-tech | Marketplace customer sections only |
| Prototype actions | Action registry, targets, disabled reason, persistence |
| Responsive UI | Mobile bottom navigation/Scan and desktop sidebar |

## Common Mistakes

- Treating hardcoded UI as business truth.
- Combining balances or awarding points while pending.
- Calling a toast/demo button a real integration.
- Copying hiring features into the customer app.
- Repeating whole specifications for a focused update.

## Example

For “Bổ sung tài liệu action cho Rewards và Follow this tech”: read Wallet/Rewards/History in the customer spec, read customer follow-tech rules in the marketplace spec, inspect the current HTML, update only the requested artifact, then run all quality gates.
