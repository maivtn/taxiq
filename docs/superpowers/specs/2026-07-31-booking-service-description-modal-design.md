# Booking Add Service Description Field

## Goal

Add an optional multiline Description field to the manual “Add service” modal in `booking-book-phase-1.html?tab=settings`.

## Scope

- Add a labeled `<textarea>` with the existing settings form styling.
- Place it below the Service name field and span the modal form width.
- Keep the field optional and do not add validation.
- Do not change the existing add-service behavior or service-row layout.
- Do not persist, render, or otherwise consume the textarea value when the form is submitted; this request is UI-only.

## Implementation

Use the existing `data-service-modal-field` convention with `data-service-modal-field="description"`. The modal reset logic should include the new field so reopening the modal starts blank. The save handler remains unchanged because the selected scope intentionally does not use the value.

## Verification

- Add a source-contract test asserting the modal contains the description textarea and that it is multiline.
- Run the focused settings-services test.
- Run `node --check` against the inline-script-bearing HTML through the project’s existing test/contract checks where applicable.
- Run `git diff --check`.
