# Staff Settings Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the merchant sidebar's standalone Staff item and expose Staff as an empty Settings tab.

**Architecture:** Extend the existing shared navigation data and Owner Settings tab markup. Reuse the current Settings tab controller so no new runtime behavior is introduced.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test runner.

## Global Constraints

- Keep the Staff tab empty.
- Preserve standalone Staff pages and the Staff-only shell.
- Keep Sub Account as the default Settings tab.

---

### Task 1: Protect the new navigation contract

**Files:**
- Modify: `html/assets/nexora-shell.test.mjs`
- Modify: `html/pages/owner-setting.test.mjs`
- Modify: `html/assets/nexora-shell.js`
- Modify: `html/pages/owner-setting.html`

**Interfaces:**
- Consumes: shared `NAV` Settings group and existing `data-settings-tab`/`data-settings-panel` controller.
- Produces: Settings tab id `staff` and panel id `panel-staff`.

- [ ] **Step 1: Write failing tests**

Add assertions that merchant navigation omits a standalone Staff item, Settings renders Staff, and Owner Settings contains an empty accessible Staff panel.

- [ ] **Step 2: Verify the tests fail**

Run:

```bash
node --test html/assets/nexora-shell.test.mjs html/pages/owner-setting.test.mjs
```

Expected: failures because Staff is still standalone and no Settings Staff tab/panel exists.

- [ ] **Step 3: Implement the minimal markup and navigation changes**

Move `{ label: 'Staff', tab: 'staff' }` into the Settings group, add the `STAFF` page-tab button, and add an empty `panel-staff` section.

- [ ] **Step 4: Verify focused and complete tests**

Run:

```bash
node --test html/assets/nexora-shell.test.mjs html/pages/owner-setting.test.mjs html/pages/staff.test.mjs
```

Expected: all tests pass.

