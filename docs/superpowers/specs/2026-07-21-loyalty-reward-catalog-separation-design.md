# Loyalty Reward Catalog Separation

## Goal

Keep the existing Loyalty management UI and `Earn Rules` flow unchanged while making the boundary between earning points and redeeming points explicit in the Reward Catalog flow.

## Current issue

The Reward Catalog create wizard includes a `Bonus Points` reward type. That type belongs to the points-earning program, while the Reward Catalog contains rewards customers redeem with their existing points. Keeping it in the same wizard makes the two programs look interchangeable.

## Design

- Keep the `Earn Rules` tab, labels, layout, fields, and behavior unchanged.
- Keep the Reward Catalog tab, navigation, catalog cards, filters, edit/pause actions, and preview behavior unchanged.
- Remove only the `Bonus Points` option from the Reward Catalog create wizard.
- Leave the existing redemption types available: Dollar Credit, Percent Off, and Free Add-on. Existing catalog content continues to represent points redemption.
- Do not add a new data model, rename tabs, or change the current reward creation state machine.

## Behavior

The Reward Catalog wizard continues to default to Dollar Credit and uses the same existing form fields and preview. No code path should create a points-earning program from the Reward Catalog. Points-earning configuration remains owned by `Earn Rules`.

## Validation

- The Reward Catalog wizard no longer renders a `Bonus Points` option.
- The existing Reward Catalog and `Earn Rules` structure remains present.
- Existing salon reward tests continue to pass.
- `git diff --check` reports no whitespace errors.
