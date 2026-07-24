# Nexora Review Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new responsive Nexora Touch review dashboard at `html/pages/nexora-review.html` with store-level Nexora/Google/Yelp reviews and technician-level Nexora reviews.

**Architecture:** Keep the existing TaxIQ `html/pages/reviews.html` untouched. Add a standalone Nexora page that owns review-specific markup, styles, local demo data, filtering, tabs, and rendering; reuse `html/assets/nexora-shell.css` and `html/assets/nexora-shell.js` for the shared merchant shell. Add one small shared-shell navigation change so the existing Reviews item links to the new page and becomes active when `activePage: 'review'` is configured.

**Tech Stack:** Static HTML, CSS, vanilla browser JavaScript, Lucide CDN icons, Node's built-in `node:test` for static contract tests, and the existing local `python3 -m http.server` workflow.

## Global Constraints

- The new page is `html/pages/nexora-review.html`; do not replace or refactor `html/pages/reviews.html`.
- Store-level sources are Nexora, Google, and Yelp; technician-level reviews are Nexora-only.
- Avatars use initials only; do not add image assets.
- Use the shared Nexora shell sources of truth: `html/assets/nexora-shell.css` and `html/assets/nexora-shell.js`.
- No Google/Yelp API calls, reply workflow, moderation workflow, export, or review-request campaign.
- Search matches customer names and review text; rating supports All/5/4/3/2/1; period supports Last 30 days/Last 90 days/This year.
- Interactive tabs, source cards, filters, search, technician selection, and empty state must update immediately on the client.
- Use visible focus states and ARIA-compatible tab/selection semantics.
- Validate at desktop and mobile widths and run the relevant available checks before completion.

## File Map

- Create `html/pages/nexora-review.html`: page scaffold, semantic review dashboard regions, shell asset links, and page configuration.
- Create `html/assets/nexora-review.css`: review-only visual system, cards, feed, technician rail, focus states, empty state, and responsive rules.
- Create `html/assets/nexora-review.js`: local demo data, state, filtering, aggregation, rendering, tab/source/technician interactions, and icon refresh.
- Create `html/pages/nexora-review.test.mjs`: static contract tests for page structure, review data/controls, shell wiring, accessibility markers, and responsive CSS.
- Modify `html/assets/nexora-shell.js:8-10,23-47`: register the review page and turn the Reviews sidebar item into a linkable active page.
- Modify `html/assets/nexora-shell.test.mjs`: verify the review page link and active state without changing existing booking/community/reward coverage.

---

### Task 1: Add failing contract tests for the new page and navigation

**Files:**
- Create: `html/pages/nexora-review.test.mjs`
- Modify: `html/assets/nexora-shell.test.mjs`

**Interfaces:**
- Consumes: the future page scaffold at `html/pages/nexora-review.html`, the future page CSS at `html/assets/nexora-review.css`, and the shared shell source at `html/assets/nexora-shell.js`.
- Produces: executable Node tests that define the page's required markup/data/interaction contracts before implementation.

- [ ] **Step 1: Write the page contract tests**

Create `html/pages/nexora-review.test.mjs` with the following tests and exact selectors:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./nexora-review.html', import.meta.url);
const CSS_URL = new URL('../assets/nexora-review.css', import.meta.url);
const JS_URL = new URL('../assets/nexora-review.js', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-review.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the Nexora Review page from the shared merchant shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Reviews<\/title>/);
  assert.match(html, /<aside class="sidebar"/);
  assert.match(html, /<header class="header">/);
  assert.match(html, /<main class="content" aria-label="Reviews content">/);
  assert.match(html, /<h1 class="page-title">Reviews<\/h1>/);
  assert.match(html, /activePage:\s*'review'/);
});

test('renders store source cards and review workspace controls', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const page = html + runtime;
  assert.match(page, /data-review-source/);
  for (const sourceName of ['nexora', 'google', 'yelp']) {
    assert.match(page, new RegExp(`source:\s*'${sourceName}'`));
  }
  for (const tab of ['store', 'technician']) {
    assert.match(page, new RegExp(`data-review-tab="${tab}"`));
  }
  assert.match(page, /data-review-search/);
  assert.match(page, /data-rating-filter/);
  assert.match(page, /data-period-filter/);
  assert.match(page, /data-review-list/);
  assert.match(page, /data-technician-list/);
});

test('keeps source scope and initials-only avatar contracts explicit', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const page = html + runtime;
  assert.match(page, /Store reviews/);
  assert.match(page, /Technician reviews/);
  assert.match(page, /data-avatar-initials/);
  assert.match(page, /Google/);
  assert.match(page, /Yelp/);
  assert.match(runtime, /source === 'nexora'/);
});

test('loads page-scoped review assets after shared shell assets', () => {
  const html = source();
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-review\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-review\.js"><\/script>/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
  assert.match(readFileSync(JS_URL, 'utf8'), /const REVIEW_DATA/);
});

test('provides accessible active states and a live empty state', () => {
  const html = source();
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tab"[^>]*aria-selected="true"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /data-review-empty[^>]*role="status"[^>]*aria-live="polite"/);
});

test('contains responsive review styles with visible focus treatment', () => {
  const css = readFileSync(CSS_URL, 'utf8');
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*2px\s+solid/);
  assert.match(css, /\.review-source-grid/);
  assert.match(css, /\.review-technician-layout/);
});
```

- [ ] **Step 2: Extend shared-shell tests for Review navigation**

In `html/assets/nexora-shell.test.mjs`, add this test after the existing Reward tests:

```js
test('links and activates Reviews on the native Review page', () => {
  const html = renderSidebar('review', '');
  assert.match(html, /<a class="nav-item is-active" href="nexora-review\.html">[\s\S]*?<span>Reviews<\/span>/);
});
```

- [ ] **Step 3: Run the focused tests and verify they fail for missing implementation**

Run:

```bash
node --test html/pages/nexora-review.test.mjs html/assets/nexora-shell.test.mjs
```

Expected: `nexora-review.test.mjs` fails because the new page/assets do not exist, and the new shell assertion fails because Reviews is still rendered as a button. Existing shell tests should continue to run.

- [ ] **Step 4: Commit the failing contract tests**

```bash
git add html/pages/nexora-review.test.mjs html/assets/nexora-shell.test.mjs
git commit -m "test: define Nexora review dashboard contracts"
```

### Task 2: Wire Reviews into the shared Nexora shell

**Files:**
- Modify: `html/assets/nexora-shell.js:8-10,23-47`
- Test: `html/assets/nexora-shell.test.mjs`

**Interfaces:**
- Consumes: `window.NEXORA_SHELL.activePage` from `nexora-review.html`.
- Produces: a shared sidebar Reviews anchor with `href="nexora-review.html"` and `is-active` when `activePage === 'review'`.

- [ ] **Step 1: Register the Review page and active-page type**

Update the shell config comment to include `review`, add the page map entry, and change the Reviews nav node exactly as follows:

```js
// Per-page config accepts: booking | community | reward | pos | review
var PAGES = {
  booking: 'booking-book-phase-1.html',
  community: 'community.html',
  reward: 'salon-setup-reward.html',
  pos: 'pos-phase-1.html',
  review: 'nexora-review.html'
};
```

Replace the current Reviews nav node:

```js
{ type: 'item', label: 'Reviews', icon: 'star', page: 'review' },
```

The existing `renderFlat` implementation already renders a page-backed item as an anchor and applies `is-active` when the configured page matches, so no additional render logic is needed.

- [ ] **Step 2: Run the shell tests**

Run:

```bash
node --test html/assets/nexora-shell.test.mjs
```

Expected: all shell tests pass, including the new native Review link test.

- [ ] **Step 3: Commit the shared navigation change**

```bash
git add html/assets/nexora-shell.js html/assets/nexora-shell.test.mjs
git commit -m "feat: link Nexora Reviews page from shared shell"
```

### Task 3: Build the page scaffold and review-specific visual system

**Files:**
- Create: `html/pages/nexora-review.html`
- Create: `html/assets/nexora-review.css`

**Interfaces:**
- Consumes: shared shell CSS/classes and the runtime selectors defined in `nexora-review.js`.
- Produces: semantic page regions with stable `data-*` hooks for rendering and controls.

- [ ] **Step 1: Add the page shell and semantic review regions**

Create `html/pages/nexora-review.html` with this structure. The empty content regions are intentional because `nexora-review.js` fills them from `REVIEW_DATA`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexora Touch - Reviews</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="../assets/nexora-shell.css">
  <link rel="stylesheet" href="../assets/nexora-review.css">
</head>
<body>
  <div class="shell">
    <aside class="sidebar" aria-label="Dashboard sidebar"></aside>
    <div class="app-area">
      <header class="header"></header>
      <main class="content" aria-label="Reviews content">
        <section class="review-page" aria-labelledby="reviews-title">
          <div class="page-heading review-heading">
            <div>
              <p class="review-eyebrow">Customer experience</p>
              <h1 class="page-title" id="reviews-title">Reviews</h1>
              <p class="page-description">See what customers are saying about your salon and nail artists.</p>
            </div>
            <div class="review-business-chip" data-business-summary></div>
          </div>

          <section class="review-toolbar" aria-label="Review filters">
            <label class="review-search-field">
              <span class="sr-only">Search reviews</span>
              <i data-lucide="search" aria-hidden="true"></i>
              <input type="search" data-review-search placeholder="Search customer or review...">
            </label>
            <label class="review-filter-field">
              <span>Period</span>
              <select data-period-filter aria-label="Review period">
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">This year</option>
              </select>
            </label>
            <label class="review-filter-field">
              <span>Rating</span>
              <select data-rating-filter aria-label="Review rating">
                <option value="all">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </label>
          </section>

          <section class="review-summary-grid" aria-label="Store review summary">
            <article class="review-summary-card review-summary-score" data-summary-card></article>
            <article class="review-summary-card review-summary-distribution" data-summary-distribution></article>
            <article class="review-summary-card review-summary-trend" data-summary-trend></article>
          </section>

          <section class="review-source-grid" aria-label="Review sources" data-source-grid></section>

          <section class="review-workspace" aria-labelledby="review-workspace-title">
            <div class="review-workspace-head">
              <div>
                <p class="review-eyebrow">Feedback inbox</p>
                <h2 id="review-workspace-title">Customer reviews</h2>
              </div>
              <p class="review-result-count" data-review-count aria-live="polite"></p>
            </div>
            <div class="review-tabs" role="tablist" aria-label="Review views">
              <button id="store-review-tab" class="review-tab is-active" type="button" role="tab" aria-selected="true" aria-controls="store-review-panel" data-review-tab="store">Store reviews</button>
              <button id="technician-review-tab" class="review-tab" type="button" role="tab" aria-selected="false" aria-controls="technician-review-panel" data-review-tab="technician">Technician reviews</button>
            </div>

            <div id="store-review-panel" class="review-tab-panel is-active" role="tabpanel" aria-labelledby="store-review-tab" data-review-panel="store">
              <div class="review-list" data-review-list></div>
            </div>

            <div id="technician-review-panel" class="review-tab-panel" role="tabpanel" aria-labelledby="technician-review-tab" data-review-panel="technician" hidden>
              <div class="review-technician-layout">
                <aside class="review-technician-list" aria-label="Technicians" data-technician-list></aside>
                <div class="review-list" data-technician-review-list></div>
              </div>
            </div>

            <div class="review-empty" data-review-empty role="status" aria-live="polite" hidden>
              <i data-lucide="message-circle-off" aria-hidden="true"></i>
              <strong>No reviews match these filters</strong>
              <span>Try a different source, period, rating, or search term.</span>
            </div>
          </section>
        </section>
      </main>
    </div>
  </div>
  <script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js"></script>
  <script src="../assets/nexora-review.js"></script>
  <script>
    window.NEXORA_SHELL = { activePage: 'review' };
  </script>
  <script src="../assets/nexora-shell.js"></script>
</body>
</html>
```

- [ ] **Step 2: Implement the review-specific CSS**

Create `html/assets/nexora-review.css` with the following layout and rendered-content rules. Use the listed selectors for source-card headers, rating copy, review metadata, technician summaries, and badges so the runtime has stable styling hooks:

```css
.review-page { max-width: 1440px; margin: 0 auto; }
.review-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.review-eyebrow { margin: 0 0 6px; color: var(--nexora-brand); font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
.review-toolbar { display: grid; grid-template-columns: minmax(240px, 1fr) 180px 180px; gap: 12px; margin: 22px 0; }
.review-search-field, .review-filter-field { display: grid; gap: 6px; }
.review-search-field { position: relative; }
.review-search-field svg { position: absolute; left: 13px; top: 50%; width: 16px; height: 16px; color: var(--nexora-subtle); transform: translateY(-50%); }
.review-search-field input, .review-filter-field select { width: 100%; min-height: 42px; border: 1px solid var(--nexora-border); border-radius: 10px; background: #fff; color: var(--nexora-text); padding: 0 12px; }
.review-search-field input { padding-left: 40px; }
.review-filter-field span { color: var(--nexora-subtle); font-size: 11px; font-weight: 800; }
.review-summary-grid, .review-source-grid { display: grid; gap: 12px; }
.review-summary-grid { grid-template-columns: 1.1fr 1.4fr 1fr; }
.review-source-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 12px; }
.review-summary-card, .review-source-card, .review-workspace { border: 1px solid var(--nexora-border); border-radius: 14px; background: #fff; box-shadow: var(--nexora-card-shadow); }
.review-summary-card { min-height: 150px; padding: 18px; }
.review-source-card { padding: 16px; text-align: left; transition: border-color .2s, box-shadow .2s, transform .2s; }
button.review-source-card { width: 100%; cursor: pointer; }
.review-source-card.is-selected, .review-source-card:hover { border-color: rgba(70,72,216,.45); box-shadow: 0 12px 28px rgba(43,89,255,.12); transform: translateY(-1px); }
.review-source-card-head, .review-card-head, .review-technician-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.review-source-name, .review-card-customer, .review-technician-name { color: var(--nexora-text); font-size: 13px; font-weight: 900; }
.review-source-rating, .review-card-rating { margin-top: 8px; color: var(--nexora-text); font-size: 20px; font-weight: 900; }
.review-source-count, .review-card-meta, .review-technician-role, .review-result-count { color: var(--nexora-subtle); font-size: 11px; font-weight: 700; }
.review-source-note, .review-card-text { margin: 8px 0 0; color: var(--nexora-muted); font-size: 13px; line-height: 1.55; }
.review-source-badge { border-radius: 999px; background: var(--nexora-surface-muted); padding: 4px 8px; color: var(--nexora-brand); font-size: 10px; font-weight: 900; }
.review-workspace { margin-top: 18px; padding: 20px; }
.review-workspace-head { display: flex; align-items: end; justify-content: space-between; gap: 12px; }
.review-workspace-head h2 { margin: 0; font-size: 20px; }
.review-tabs { display: flex; gap: 6px; margin-top: 18px; border-bottom: 1px solid var(--nexora-border); }
.review-tab { border: 0; border-bottom: 2px solid transparent; background: transparent; padding: 10px 12px; color: var(--nexora-muted); font-size: 13px; font-weight: 800; }
.review-tab.is-active { border-bottom-color: var(--nexora-brand); color: var(--nexora-brand); }
.review-tab-panel { padding-top: 18px; }
.review-list { display: grid; gap: 10px; }
.review-card { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; border: 1px solid var(--nexora-border); border-radius: 12px; padding: 15px; }
.review-avatar { display: inline-flex; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 999px; background: linear-gradient(135deg, var(--nexora-electric), var(--nexora-violet)); color: #fff; font-size: 12px; font-weight: 900; }
.review-stars { color: #e6a400; letter-spacing: .05em; }
.review-card-service { margin-top: 5px; color: var(--nexora-subtle); font-size: 11px; font-weight: 700; }
.review-technician-layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 18px; }
.review-technician-list { display: grid; align-content: start; gap: 8px; }
.review-technician-button { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; border: 1px solid var(--nexora-border); border-radius: 10px; background: #fff; padding: 10px; text-align: left; }
.review-technician-button.is-selected { border-color: var(--nexora-brand); background: #f4f5ff; }
.review-technician-rating { color: var(--nexora-text); font-size: 12px; font-weight: 900; }
.review-empty { display: grid; min-height: 220px; place-items: center; align-content: center; gap: 8px; color: var(--nexora-muted); text-align: center; }
.review-empty svg { width: 32px; height: 32px; color: var(--nexora-subtle); }
:focus-visible { outline: 2px solid var(--nexora-brand); outline-offset: 2px; }

@media (max-width: 900px) {
  .review-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .review-summary-trend { grid-column: 1 / -1; }
  .review-technician-layout { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .review-heading, .review-workspace-head { align-items: stretch; flex-direction: column; }
  .review-toolbar, .review-summary-grid, .review-source-grid { grid-template-columns: 1fr; }
  .review-summary-trend { grid-column: auto; }
  .review-workspace { padding: 14px; }
  .review-card { grid-template-columns: auto 1fr; }
  .review-card > :last-child { grid-column: 2; }
}
```

Keep body copy at or above 11px, use the existing shell variables instead of introducing a second palette, and include a reduced-motion override for transitions if the implementation adds animated transforms.

- [ ] **Step 3: Run page contract tests**

Run:

```bash
node --test html/pages/nexora-review.test.mjs
```

Expected: tests pass for the page scaffold and CSS, with runtime-data assertions still failing until Task 4 is complete.

- [ ] **Step 4: Commit the page scaffold and CSS**

```bash
git add html/pages/nexora-review.html html/assets/nexora-review.css
git commit -m "feat: add Nexora review dashboard shell"
```

### Task 4: Implement local review data, rendering, and interactions

**Files:**
- Create: `html/assets/nexora-review.js`
- Test: `html/pages/nexora-review.test.mjs`

**Interfaces:**
- Consumes: `data-*` hooks from `nexora-review.html` and style classes from `nexora-review.css`.
- Produces: rendered summary/source/review/technician content and `window.NEXORA_REVIEW` with `setState(partial)` for manual smoke testing.

- [ ] **Step 1: Define the single local data model and page state**

Start `html/assets/nexora-review.js` with this data shape and representative records. Keep every avatar as an `initials` string; do not use image URLs:

```js
const REFERENCE_DATE = new Date('2026-07-24T12:00:00');

const REVIEW_DATA = {
  business: { name: 'Bitcoin Nail Bar', initials: 'BN', phone: '832-786-5576' },
  technicians: [
    { id: 'anna', name: 'Anna Le', initials: 'AL', role: 'Senior Nail Artist' },
    { id: 'kim', name: 'Kim Nguyen', initials: 'KN', role: 'Gel-X Specialist' },
    { id: 'mai', name: 'Mai Pham', initials: 'MP', role: 'Nail Artist' },
    { id: 'linda', name: 'Linda Tran', initials: 'LT', role: 'Pedicure Specialist' }
  ],
  reviews: [
    { id: 'nexora-1', source: 'nexora', rating: 5, customer: 'Jessica Smith', initials: 'JS', date: '2026-07-22', service: 'Gel manicure', technicianId: 'anna', text: 'Anna was so careful with the shape and the chrome finish is perfect.' },
    { id: 'nexora-2', source: 'nexora', rating: 5, customer: 'Sophie Tran', initials: 'ST', date: '2026-07-18', service: 'Gel-X full set', technicianId: 'kim', text: 'Kim understood the reference photo immediately. The set looks natural and polished.' },
    { id: 'nexora-3', source: 'nexora', rating: 4, customer: 'Mai Nguyen', initials: 'MN', date: '2026-07-11', service: 'Pedicure', technicianId: 'linda', text: 'Lovely service and a relaxing appointment. I would book again.' },
    { id: 'nexora-4', source: 'nexora', rating: 3, customer: 'Rachel Vo', initials: 'RV', date: '2026-06-20', service: 'Acrylic removal', technicianId: 'mai', text: 'The result was good, although the appointment started a little late.' },
    { id: 'google-1', source: 'google', rating: 5, customer: 'Emily Carter', initials: 'EC', date: '2026-07-20', service: 'Salon visit', text: 'Bright salon, friendly team, and the booking process was easy.' },
    { id: 'google-2', source: 'google', rating: 4, customer: 'Diana Nguyen', initials: 'DN', date: '2026-07-02', service: 'Salon visit', text: 'Great color selection and clean stations. Parking was the only challenge.' },
    { id: 'yelp-1', source: 'yelp', rating: 5, customer: 'Olivia Reed', initials: 'OR', date: '2026-06-28', service: 'Salon visit', text: 'One of the best nail appointments I have had this year.' },
    { id: 'yelp-2', source: 'yelp', rating: 3, customer: 'Grace Lee', initials: 'GL', date: '2026-05-14', service: 'Salon visit', text: 'Nice work overall, but I had to wait past my appointment time.' }
  ]
};

const state = {
  tab: 'store', source: 'all', rating: 'all', period: '30', search: '', technicianId: 'anna'
};
```

- [ ] **Step 2: Implement pure filtering and aggregation helpers**

Implement these exact functions before rendering:

```js
function sourceLabel(source) {
  return ({ all: 'All sources', nexora: 'Nexora', google: 'Google', yelp: 'Yelp' })[source] || source;
}
function formatDate(isoDate) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${isoDate}T12:00:00`));
}
function withinPeriod(review, period) {
  const days = Number(period);
  if (!Number.isFinite(days)) return true;
  const age = Math.floor((REFERENCE_DATE - new Date(`${review.date}T12:00:00`)) / 86400000);
  return age >= 0 && age <= days;
}
function getFilteredReviews({ includeSources = ['nexora', 'google', 'yelp'], technicianId = null } = {}) {
  const query = state.search.toLowerCase();
  return REVIEW_DATA.reviews.filter((review) => {
    const sourceMatches = includeSources.includes(review.source);
    const technicianMatches = technicianId === null || review.technicianId === technicianId;
    const ratingMatches = state.rating === 'all' || review.rating === Number(state.rating);
    const searchMatches = !query || `${review.customer} ${review.text}`.toLowerCase().includes(query);
    return sourceMatches && technicianMatches && withinPeriod(review, state.period) && ratingMatches && searchMatches;
  });
}
function getAverageRating(reviews) {
  return reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0';
}
function getStarCounts(reviews) {
  return reviews.reduce((counts, review) => { counts[review.rating] += 1; return counts; }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
}
```

Rules:

- Store view uses all sources unless `state.source` is a single source.
- Technician view always filters to `source === 'nexora'` and `technicianId === state.technicianId`.
- Search is case-insensitive and matches `customer` or `text`.
- Rating `all` skips the rating predicate; period `30`, `90`, and `365` are inclusive day windows.
- Summary/source-card totals use all store reviews in the selected period, independent of search/rating, so dashboard metrics remain stable while the feed is narrowed.

- [ ] **Step 3: Implement rendering with initials-only avatars**

Implement these exact functions:

```js
function renderAvatar(initials, className = 'review-avatar') { /* escaped initials markup with data-avatar-initials */ }
function renderStars(rating) { /* five accessible star characters/labels */ }
function renderSummary() { /* update data-summary-card/distribution/trend */ }
function renderSourceCards() { /* render button[data-review-source] for Nexora/Google/Yelp plus All sources */ }
function renderReviewCard(review) { /* source badge, initials, customer/date/rating/body, service/technician metadata */ }
function renderReviewList() { /* render Store reviews and show/hide data-review-empty */ }
function renderTechnicianList() { /* aggregate Nexora reviews by technician and render selected buttons */ }
function renderTechnicianReviews() { /* render selected technician's filtered Nexora reviews */ }
function renderAll() { /* render all regions, update count, refresh lucide icons */ }
```

Every rendered avatar must contain `data-avatar-initials` and no `<img>` tag. Source cards must be real buttons with `aria-pressed` and `data-review-source`; technician selectors must be real buttons with `aria-pressed`.

- [ ] **Step 4: Wire tabs, source cards, filters, search, and technician selection**

Use event delegation for dynamic source/technician controls and direct listeners for the static inputs:

```js
document.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-review-tab]');
  const source = event.target.closest('[data-review-source]');
  const technician = event.target.closest('[data-technician-id]');
  if (tab) state.tab = tab.dataset.reviewTab;
  if (source) state.source = source.dataset.reviewSource;
  if (technician) state.technicianId = technician.dataset.technicianId;
  if (tab || source || technician) renderAll();
});

document.querySelector('[data-review-search]').addEventListener('input', (event) => {
  state.search = event.target.value.trim();
  renderAll();
});
document.querySelector('[data-rating-filter]').addEventListener('change', (event) => {
  state.rating = event.target.value;
  renderAll();
});
document.querySelector('[data-period-filter]').addEventListener('change', (event) => {
  state.period = event.target.value;
  renderAll();
});
```

When the active tab changes, update `aria-selected`, `hidden`, and `.is-active` for both tab buttons/panels. Provide an `All sources` control so source filtering can be cleared without reloading.

- [ ] **Step 5: Expose a smoke-test API and initialize**

Finish the script with:

```js
window.NEXORA_REVIEW = {
  data: REVIEW_DATA,
  state,
  setState(nextState) {
    Object.assign(state, nextState);
    renderAll();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAll);
} else {
  renderAll();
}
```

- [ ] **Step 6: Complete the runtime contract assertions**

Add these tests to `html/pages/nexora-review.test.mjs`:

```js
test('defines the three review sources and technician-only scope', () => {
  const runtime = readFileSync(JS_URL, 'utf8');
  for (const source of ['nexora', 'google', 'yelp']) assert.match(runtime, new RegExp(`source: '${source}'`));
  assert.match(runtime, /source === 'nexora'/);
  assert.match(runtime, /technicianId/);
  assert.match(runtime, /REFERENCE_DATE/);
  assert.match(runtime, /function getFilteredReviews/);
  assert.match(runtime, /function renderTechnicianList/);
  assert.match(runtime, /data-avatar-initials/);
  assert.doesNotMatch(runtime, /<img[^>]+avatar/i);
});

test('supports required filters and client-side interaction hooks', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  for (const value of ['30', '90', '365', 'all', '5', '4', '3', '2', '1']) assert.match(html + runtime, new RegExp(`['"]${value}['"]`));
  assert.match(runtime, /addEventListener\('input'/);
  assert.match(runtime, /addEventListener\('change'/);
  assert.match(runtime, /renderAll\(\)/);
});
```

- [ ] **Step 7: Run focused tests and commit the runtime**

Run:

```bash
node --test html/pages/nexora-review.test.mjs html/assets/nexora-shell.test.mjs
```

Expected: all focused tests pass.

Commit:

```bash
git add html/assets/nexora-review.js html/pages/nexora-review.test.mjs
git commit -m "feat: add Nexora review data and interactions"
```

### Task 5: Verify the integrated page and responsive behavior

**Files:**
- Modify only if verification finds a concrete defect: `html/pages/nexora-review.html`, `html/assets/nexora-review.css`, `html/assets/nexora-review.js`, or `html/assets/nexora-shell.js`.

**Interfaces:**
- Consumes: the completed page, runtime, CSS, shared shell, and tests from Tasks 1–4.
- Produces: a verified local prototype with no unrelated worktree changes.

- [ ] **Step 1: Run the complete relevant Node test set**

Run:

```bash
node --test html/pages/nexora-review.test.mjs html/assets/nexora-shell.test.mjs html/pages/community.test.mjs
```

Expected: all tests pass.

- [ ] **Step 2: Start the documented static server**

Run from the `html/` directory:

```bash
python3 -m http.server 8123
```

Open `http://localhost:8123/pages/nexora-review.html` and verify the page loads without console errors. Stop the server after the smoke check.

- [ ] **Step 3: Manually verify the core interactions**

Check each state in the browser:

1. Sidebar Reviews is active and links to `nexora-review.html`.
2. Store Reviews shows Nexora, Google, and Yelp cards and review rows.
3. Clicking Google/Yelp/Nexora source cards narrows the feed; selecting All restores all sources.
4. Search by `Anna`, `chrome`, and a non-existent word updates the feed and empty state.
5. Rating values 5, 4, 3, 2, and 1 each filter the visible feed.
6. Last 30 days, Last 90 days, and This year produce different visible date windows.
7. Technician Reviews shows only Nexora-attributed reviews, switches technician selection, and shows initials avatars.
8. Tabs update visible panel state and `aria-selected`.
9. At a mobile viewport, controls/cards stack without horizontal overflow.

- [ ] **Step 4: Inspect the final diff and commit any verification fixes**

Run:

```bash
git status --short
git diff --check
git diff --stat HEAD~4..HEAD
```

If a concrete issue was fixed, run the focused test command again and commit only the related files:

```bash
git add html/pages/nexora-review.html html/assets/nexora-review.css html/assets/nexora-review.js html/pages/nexora-review.test.mjs html/assets/nexora-shell.js html/assets/nexora-shell.test.mjs
git commit -m "fix: polish Nexora review dashboard verification issues"
```

If no fix is needed, leave the clean verification result documented in the handoff.

## Self-review checklist

- Spec coverage: the new page, shared navigation link, three sources, store summary, tabs, filters, technician view, initials-only avatars, responsive CSS, empty state, accessibility markers, no API integration, and verification steps are all covered by Tasks 1–5.
- Placeholder scan: the plan contains no `TODO`, `TBD`, `FIXME`, or unspecified implementation steps; every code-changing step names a file, selector/function contract, command, and expected result.
- Type/name consistency: `data-review-source`, `data-review-tab`, `data-review-panel`, `data-review-search`, `data-rating-filter`, `data-period-filter`, `data-review-list`, `data-technician-list`, `data-technician-review-list`, `data-review-empty`, `data-avatar-initials`, `REVIEW_DATA`, `state`, `getFilteredReviews`, `renderAll`, and `window.NEXORA_REVIEW.setState` are used consistently across the tasks.
