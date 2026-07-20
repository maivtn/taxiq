# W-9 Developer Test Fixture Design

## Goal

Add a developer-facing action that fills the W-9 form with a complete, valid test record so the existing form, validation, completion, print, and download flows can be exercised quickly.

## User experience

- Add a `Dev: Fill test data` button beside the existing `Reset` action.
- On click, populate every meaningful W-9 input, including EIN, certification, signature, and signature date.
- Dispatch the form's normal change/input behavior, clear stale errors, recalculate conditional panels, and show a short success message.
- Do not submit the form, download a file, write to storage, or make a network request.
- Keep the button hidden in print output with the existing non-printable action controls.

## Fixture and behavior

The fixture represents a fictional LLC taxed as an S corporation and uses a validly formatted test EIN. A pure `createDevFixture(date)` helper owns the values so tests can confirm that `validateValues(createDevFixture(date))` has no errors. The click handler applies those values to the real controls and then lets the existing UI synchronization and completion logic run.

## Safety and scope

The values are clearly fictional and exist only in browser memory until the user explicitly chooses another action. The change is limited to `html/pages/w9-form.html` and its existing Node test file. No production API or persistence behavior changes.

