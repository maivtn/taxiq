# Package Management Billing Cycle Sub Tabs Design

## Context

Package Management currently has top-level tabs for `Overview`, `Subscriptions`, `AI Voice Plans`, and `Package History`. The `Subscriptions` and `AI Voice Plans` panels both show monthly plan pricing and open the shared package payment modal.

## Goal

Add a shared `Monthly | Yearly` billing-cycle sub-tab under the Package Management top tabs. The selected cycle applies to paid plan pricing in both `Subscriptions` and `AI Voice Plans`.

## User-Approved Design

- Render one compact segmented control below the top Package Management tabs.
- The options are exactly `Monthly` and `Yearly`.
- `Monthly` is selected by default.
- Show a visible discount chip on the `Yearly` option, using copy `Save 20%`.
- Selecting `Yearly` updates paid plan price labels and payment totals.
- Selecting `Monthly` restores the existing monthly price labels and payment totals.
- Enterprise/custom plans keep their existing custom quote display.

## Pricing Rules

Yearly prices use a 20% discount and are rounded to the nearest whole dollar:

```text
yearly price = round(monthly price * 12 * 0.8)
```

Expected yearly displays:

- NEXORA Starter: `$29/mo` -> `$278/yr`
- NEXORA Pro: `$79/mo` -> `$758/yr`
- AI Voice Starter: `$99/mo` -> `$950/yr`
- AI Voice Pro: `$199/mo` -> `$1,910/yr`
- AI Voice Elite: `$349/mo` -> `$3,350/yr`

## Interaction

- The sub-tab state is shared across package panels.
- Changing the billing cycle does not navigate away from the active top-level tab.
- The payment modal reads the current billing cycle when a paid plan is selected.
- The modal invoice total uses `$X/mo` for monthly and `$X/yr` for yearly.
- Trial behavior remains unchanged.

## Non-Goals

- No backend billing integration.
- No persistence requirement for the selected billing cycle.
- No changes to package history transaction fixtures.
- No yearly discount for custom quote plans.

## Testing

- Assert the shared `Monthly | Yearly` sub-tab exists under the top Package Management tabs.
- Assert the `Yearly` option includes a `Save 20%` chip.
- Assert the runtime exposes billing-cycle state and yearly price calculation.
- Assert NEXORA and AI Voice paid plan labels can show rounded yearly totals.
- Assert the payment modal invoice total uses the selected billing cycle.
