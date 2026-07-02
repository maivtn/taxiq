# Mobile Pages Hamburger Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile hamburger button to shared `html/pages` screens that opens the existing sidebar as an off-canvas drawer.

**Architecture:** Keep the shared page shell in `html/assets/layout.js` as the single source of truth. Add a small Node-based regression script that evaluates the layout in a fake DOM and checks mobile drawer structure and state transitions.

**Tech Stack:** Static HTML, vanilla JavaScript, Tailwind utility classes, Font Awesome, Node.js standard library for tests.

## Global Constraints

- Do not modify `html/pages/mobile-two-account-tailwind-lucide.html`.
- Do not modify `html/pages/mobile-two-account-tailwind-lucide copy.html`.
- Scope mobile drawer behavior to shared pages where `document.body.dataset.root === ".."`.
- Preserve desktop sidebar collapse/expand behavior.
- Mobile drawer open state must not persist in `localStorage`.
- Use defensive DOM checks so pages keep rendering if an optional element is missing.

---

### Task 1: Mobile Drawer Regression Script

**Files:**
- Create: `scripts/test-mobile-sidebar.js`

**Interfaces:**
- Consumes: `html/assets/layout.js`
- Produces: a command, `node scripts/test-mobile-sidebar.js`, that exits non-zero until mobile hamburger/drawer behavior exists.

- [ ] **Step 1: Write the failing test**

Create `scripts/test-mobile-sidebar.js` with a minimal fake DOM that loads `html/assets/layout.js`, renders an `analytics` page shell at mobile width, and asserts:

```javascript
assert(mobileButton, "mobile hamburger button should render on shared html/pages shells");
assert(mobileButton.getAttribute("aria-expanded") === "false", "hamburger starts closed");
mobileButton.dispatchEvent({ type: "click" });
assert(mobileButton.getAttribute("aria-expanded") === "true", "hamburger reports open after click");
assert(sidebar.classList.contains("mobile-drawer-open"), "sidebar opens after hamburger click");
backdrop.dispatchEvent({ type: "click" });
assert(mobileButton.getAttribute("aria-expanded") === "false", "backdrop closes drawer");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-mobile-sidebar.js`

Expected: FAIL with `mobile hamburger button should render on shared html/pages shells`.

- [ ] **Step 3: Commit only if useful**

Do not commit after this task alone unless the user asks for step commits; keep the failing test in the working tree for Task 2.

### Task 2: Shared Layout Mobile Drawer

**Files:**
- Modify: `html/assets/layout.js`
- Test: `scripts/test-mobile-sidebar.js`

**Interfaces:**
- Consumes: assertions from `scripts/test-mobile-sidebar.js`.
- Produces: mobile-only hamburger button with `data-mobile-sidebar-open`, backdrop with `data-mobile-sidebar-backdrop`, and sidebar open class `mobile-drawer-open`.

- [ ] **Step 1: Update `layout.js` minimally**

In `html/assets/layout.js`:

```javascript
const isPagesShell = rootPath === "..";
```

Add a mobile-only hamburger button in `renderHeader(meta)` for pages shells:

```html
<button class="mobile-menu-btn hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-200 max-md:inline-flex" type="button" aria-label="Open navigation menu" aria-controls="taxiq-sidebar" aria-expanded="false" data-mobile-sidebar-open>
  <i class="fa-solid fa-bars" aria-hidden="true"></i>
</button>
```

Change the existing mobile CSS so pages shells use an off-canvas drawer instead of a horizontal strip. Preserve the horizontal strip for non-pages shells.

Add helpers:

```javascript
function setMobileDrawerOpen(open) { /* toggle classes and aria state */ }
function wireMobileDrawer() { /* click, backdrop, link, Escape handlers */ }
```

Render a backdrop button with `data-mobile-sidebar-backdrop` only for pages shells.

- [ ] **Step 2: Run test to verify it passes**

Run: `node scripts/test-mobile-sidebar.js`

Expected: PASS.

- [ ] **Step 3: Desktop and excluded-file regression checks**

Run:

```bash
git diff --name-only
git diff -- html/pages/mobile-two-account-tailwind-lucide.html 'html/pages/mobile-two-account-tailwind-lucide copy.html'
```

Expected: no excluded mobile-two account page appears in the diff.

### Task 3: Browser Verification

**Files:**
- No required source changes unless verification finds a bug.

**Interfaces:**
- Consumes: `html/assets/layout.js` and `scripts/test-mobile-sidebar.js`.
- Produces: local browser confirmation that the static page opens and the drawer is usable.

- [ ] **Step 1: Start static server**

Run: `cd html && python3 -m http.server 8123`

- [ ] **Step 2: Verify mobile interaction**

Open `http://localhost:8123/pages/analytics.html` at a mobile viewport. Click the hamburger and confirm the sidebar slides in, then click backdrop and confirm it closes.

- [ ] **Step 3: Verify desktop layout**

Open the same page at desktop width and confirm the sidebar remains fixed with the existing collapse button.
