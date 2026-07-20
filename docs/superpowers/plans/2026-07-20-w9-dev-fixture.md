# W-9 Developer Test Fixture Implementation Plan

> **For agentic implementation:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and follow the red-green-refactor cycle.

**Goal:** Add a one-click, complete W-9 fixture for manual testing without submitting or persisting it.

**Architecture:** A pure fixture factory supplies valid values and is exposed through the existing test API. A small DOM adapter maps those values to the current form controls and invokes the existing synchronization, error-clearing, and progress functions.

**Tech Stack:** Static HTML, browser JavaScript, Node.js built-in test runner.

---

### Task 1: Valid fixture and developer action

**Files:**
- Modify: `html/pages/w9-form.test.mjs`
- Modify: `html/pages/w9-form.html`

**Interfaces:**
- `createDevFixture(dateString: string): W9Values`
- `applyDevFixture(values: W9Values): void`

- [ ] **Step 1: Write failing tests**

  Assert that `#fill-test-data` exists, is wired to a click handler, and that `validateValues(createDevFixture("2026-07-20"))` returns no errors while the fixture contains EIN, certification, signature, and date values.

- [ ] **Step 2: Verify the red state**

  Run `node --test html/pages/w9-form.test.mjs` and confirm failure because the button and `createDevFixture` do not exist.

- [ ] **Step 3: Implement the minimum behavior**

  Add `Dev: Fill test data`, implement/export `createDevFixture`, map its values to text, radio, select, and checkbox controls, then call the existing UI synchronization and progress logic. Do not call submit, storage, download, or network APIs.

- [ ] **Step 4: Verify the green state**

  Run `node --test html/pages/w9-form.test.mjs` and confirm all tests pass. Run the existing JavaScript syntax check and inspect the resulting diff.

- [ ] **Step 5: Report the result**

  Summarize the new action, fixture coverage, and verification evidence without committing unrelated working-tree changes.

