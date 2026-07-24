# Package Management Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an empty Nexora “Quản lý gói” page that uses the shared booking-style shell and is reachable from an active sidebar menu item.

**Architecture:** Extend the existing route map and top-level sidebar item in `nexora-shell.js`. Create a standalone `nexora-packages.html` page that contains only the shared shell placeholders and an empty `.content` main; all sidebar/header/content layout remains owned by `nexora-shell.css`.

**Tech Stack:** Static HTML, shared CSS/JavaScript, Node built-in test runner, no new dependencies.

## Global Constraints

- Use the shared shell's sidebar, header, font, box-sizing reset, and content spacing without duplicating shell CSS.
- Keep the page visually empty below the header until package-management content is designed.
- Add no package data, tabs, cards, filters, forms, actions, API, persistence, or business logic.
- Preserve existing booking, review, TaxIQ, and other shell routes.
- The menu label must be exactly `Quản lý gói`, the route key must be `packages`, and the page must be `html/pages/nexora-packages.html`.

## File Map

- Create: `html/pages/nexora-packages.html` — standalone empty page shell.
- Modify: `html/assets/nexora-shell.js` — route map and shared sidebar item.
- Modify: `html/assets/nexora-shell.test.mjs` — shared sidebar route/active-state regression test.
- Create: `html/pages/nexora-packages.test.mjs` — page structure and empty-content regression test.

### Task 1: Add failing route and page-shell tests

**Files:**
- Modify: `html/assets/nexora-shell.test.mjs`
- Create: `html/pages/nexora-packages.test.mjs`

- [ ] **Step 1: Add the shared-sidebar regression test**

Append this test to `html/assets/nexora-shell.test.mjs`:

```js
test('links and activates Package Management on the native Packages page', () => {
  const html = renderSidebar('packages', '');
  assert.match(html, /<a class="nav-item is-active" href="nexora-packages\.html">[\s\S]*?<span>Quản lý gói<\/span>/);
});
```

- [ ] **Step 2: Create the page contract test**

Create `html/pages/nexora-packages.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./nexora-packages.html', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-packages.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the empty Package Management page from the shared shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Quản lý gói<\/title>/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<aside class="sidebar" aria-label="Dashboard sidebar"><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Package management content"><\/main>/);
  assert.match(html, /activePage:\s*'packages'/);
});

test('keeps package content intentionally empty', () => {
  const html = source();
  const main = html.match(/<main class="content" aria-label="Package management content">([\s\S]*?)<\/main>/);
  assert.ok(main, 'package content frame must exist');
  assert.equal(main[1].trim(), '', 'package content must stay empty for now');
  assert.doesNotMatch(html, /package-card|package-filter|data-package|Package data/i);
});
```

- [ ] **Step 3: Run the focused tests and verify the expected RED state**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs html/assets/nexora-shell.test.mjs
```

Expected: failure because `nexora-packages.html` does not exist and `nexora-shell.js` does not yet know the `packages` route/menu item.

### Task 2: Implement the route and empty shared-shell page

**Files:**
- Modify: `html/assets/nexora-shell.js:24-48` — add the `packages` route and top-level sidebar item.
- Create: `html/pages/nexora-packages.html` — add the empty shell page.

- [ ] **Step 1: Add the packages route and sidebar item**

In the route map, add:

```js
packages: 'nexora-packages.html',
```

In the top-level `NAV_ITEMS` list, add:

```js
{ type: 'item', label: 'Quản lý gói', icon: 'package', page: 'packages' },
```

Place the item alongside the other top-level items before grouped navigation so it uses the existing active-link rendering path.

- [ ] **Step 2: Create the standalone empty page**

Create `html/pages/nexora-packages.html` with:

```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexora Touch - Quản lý gói</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/nexora-shell.css">
</head>
<body>
  <div class="shell">
    <aside class="sidebar" aria-label="Dashboard sidebar"></aside>

    <div class="app-area">
      <header class="header"></header>
      <main class="content" aria-label="Package management content"></main>
    </div>
  </div>

  <script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js"></script>
  <script>
    window.NEXORA_SHELL = { activePage: 'packages' };
  </script>
  <script src="../assets/nexora-shell.js"></script>
</body>
</html>
```

- [ ] **Step 3: Run focused tests and verify GREEN**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs html/assets/nexora-shell.test.mjs
```

Expected: all focused tests pass, including the active `Quản lý gói` link and empty content assertion.

- [ ] **Step 4: Run syntax, full regression, and diff checks**

Run:

```bash
node --check html/assets/nexora-shell.js
node --test 2>&1 | tail -n 12
git diff --check
```

Expected: syntax succeeds, the full suite reports zero failures, and `git diff --check` produces no output.

- [ ] **Step 5: Commit the implementation**

```bash
git add html/assets/nexora-shell.js html/assets/nexora-shell.test.mjs html/pages/nexora-packages.html html/pages/nexora-packages.test.mjs
git commit -m "feat: add empty package management shell"
```
