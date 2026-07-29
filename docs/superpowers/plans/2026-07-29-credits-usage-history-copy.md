# Credits Usage History Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove phone numbers from Voice activity rows and rename the Credits Management history column from `Amount` to `Usage`.

**Architecture:** Keep the existing history data flow and filters. Remove the `phone` property from Voice fixtures, render each activity from its `activity` value, and update the static fallback table header/rows so the initial HTML matches runtime output.

**Tech Stack:** Static HTML, vanilla JavaScript, Node `node:test`.

## Global Constraints

- Do not change usage values, filters, layout, dates, or balance data.
- Voice rows must display activity text such as `Incoming call` without a phone number.
- The history table header must be `Usage`.
- Preserve all unrelated user changes already present in the worktree.

---

### Task 1: Update the regression contract for the new history copy

**Files:**
- Modify: `html/pages/nexora-credits.test.mjs:483-496`

**Interfaces:**
- The existing Credits Management test must assert the user-visible Voice activity and `Usage` header.

- [ ] **Step 1: Replace the phone-number expectation with the new behavior**

Update the existing test to assert the new table header, activity text, and absence of phone fixtures:

```js
test('shows Voice usage history activity without phone numbers', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const css = readFileSync(CSS_URL, 'utf8');

  assert.match(html, /<th scope="col">Activity<\/th>/);
  assert.match(html, /<th scope="col">Usage<\/th>/);
  assert.match(html, /<span class="credits-history-activity"><strong>Incoming call<\/strong><\/span>/);
  assert.doesNotMatch(html, /\+1 \(713\) 555-0182|\+1 \(832\) 555-0104|\+1 \(281\) 555-0199/);
  assert.doesNotMatch(runtime, /phone:\s*'\+1 \(713\) 555-0182'/);
  assert.doesNotMatch(runtime, /phone:\s*'\+1 \(832\) 555-0104'/);
  assert.doesNotMatch(runtime, /phone:\s*'\+1 \(281\) 555-0199'/);
  assert.match(runtime, /activity:\s*'Incoming call'/);
  assert.match(runtime, /credits-history-activity/);
  assert.match(css, /\.credits-history-activity\s*\{/);
});
```

- [ ] **Step 2: Run the focused test and verify the expected RED state**

Run:

```bash
node --test html/pages/nexora-credits.test.mjs
```

Expected: the updated Voice history test fails because the current page still uses `Amount`, includes phone numbers, and the runtime still contains `phone` fixtures.

### Task 2: Apply the Credits Management copy and rendering changes

**Files:**
- Modify: `html/pages/nexora-credits.html:130-140`
- Modify: `html/assets/nexora-credits.js:11-17,230-236`

**Interfaces:**
- `CREDITS_HISTORY` remains the source for dynamic history rows, with Voice entries shaped as `{ product, activity, amount, date, balance }`.
- `renderHistory()` continues to filter rows and render the existing table structure, but uses `item.activity` directly for the Activity cell.

- [ ] **Step 1: Remove phone fields from Voice history fixtures**

Change the three Voice objects in `CREDITS_HISTORY` from entries with `phone` to entries containing only the activity text:

```js
{ product: 'Voice', activity: 'Incoming call', amount: '−18 min', date: 'Jul 28, 2026 · 10:42 AM', balance: '571 min' }
{ product: 'Voice', activity: 'Incoming call', amount: '−27 min', date: 'Jul 28, 2026 · 9:18 AM', balance: '544 min' }
{ product: 'Voice', activity: 'Incoming call', amount: '−31 min', date: 'Jul 27, 2026 · 5:50 PM', balance: '513 min' }
```

- [ ] **Step 2: Render activity without the phone-number branch**

Replace the conditional activity markup in `renderHistory()` with:

```js
const activity = '<span class="credits-history-activity"><strong>' + escapeHTML(item.activity) + '</strong></span>';
```

Keep the existing `amount`, `amountClass`, date rendering, product badge, and filter logic unchanged.

- [ ] **Step 3: Update the static fallback table**

In `nexora-credits.html`:

```html
<th scope="col">Usage</th>
```

For each Voice fallback row, replace the phone/activity pair with:

```html
<td><span class="credits-history-activity"><strong>Incoming call</strong></span></td>
```

Keep each row's existing usage value and date.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
node --test html/pages/nexora-credits.test.mjs
```

Expected: all Credits Management tests pass, including the updated Voice history test.

### Task 3: Verify and hand off

**Files:**
- No additional source files.

- [ ] **Step 1: Check the final diff for whitespace errors**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 2: Confirm only the requested copy/data paths changed**

Run:

```bash
git diff -- html/pages/nexora-credits.html html/assets/nexora-credits.js html/pages/nexora-credits.test.mjs
```

Confirm the diff only changes the history header, Voice activity fixtures/rendering, and their regression assertions; do not stage or modify the unrelated existing worktree changes.

- [ ] **Step 3: Record the verification result**

Run:

```bash
node --test html/pages/nexora-credits.test.mjs
git status --short
```

Report the passing test count and note that unrelated pre-existing worktree changes remain untouched.
