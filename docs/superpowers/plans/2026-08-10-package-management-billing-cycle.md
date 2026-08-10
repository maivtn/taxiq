# Package Management Billing Cycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared `Monthly | Yearly` billing-cycle sub-tab to Package Management, with a `Save 20%` chip on Yearly and rounded yearly pricing for Subscriptions and AI Voice plans.

**Architecture:** Keep the billing-cycle control in `nexora-packages.html` directly below the existing top-level Package Management tabs. Add pricing data attributes to paid plan price elements, then let `nexora-packages.js` own the selected billing cycle, price rendering, and payment-modal total. Keep styling in `nexora-packages.css` and follow the existing segmented-tab visual language.

**Tech Stack:** Static HTML, CSS, plain JavaScript, SweetAlert2 already loaded on the page, Node built-in test runner, VM-based runtime tests.

## Global Constraints

- The sub-tab options are exactly `Monthly` and `Yearly`.
- `Monthly` is selected by default.
- The `Yearly` option must show a visible `Save 20%` chip.
- Yearly price formula is `round(monthly price * 12 * 0.8)`.
- Expected yearly displays are `$278/yr`, `$758/yr`, `$950/yr`, `$1,910/yr`, and `$3,350/yr`.
- Enterprise/custom plans keep the existing custom quote display.
- The selected billing cycle applies to both `Subscriptions` and `AI Voice Plans`.
- Payment modal totals must use the selected billing cycle.
- Trial behavior remains unchanged.
- No backend billing integration or package-history fixture changes.

---

## File Map

- Modify: `html/pages/nexora-packages.html` - add the shared billing-cycle sub-tab and pricing data attributes.
- Modify: `html/assets/nexora-packages.css` - style the sub-tab and discount chip responsively.
- Modify: `html/assets/nexora-packages.js` - manage billing-cycle state, rounded yearly price calculations, price-label rendering, and payment-modal totals.
- Modify: `html/pages/nexora-packages.test.mjs` - add markup and runtime regression coverage.

### Task 1: Add Failing Billing-Cycle Tests

**Files:**
- Modify: `html/pages/nexora-packages.test.mjs`

**Interfaces:**
- Consumes: Existing helpers `source()`, `createPackageActionRuntime()`, `readFileSync(PACKAGE_JS_URL, 'utf8')`, and `readFileSync(PACKAGE_CSS_URL, 'utf8')`.
- Produces: Failing expectations for `[data-package-billing-cycle]`, `formatYearlyBillingAmount`, `renderBillingPrices`, and yearly payment-modal totals.

- [ ] **Step 1: Extend the VM helper to support billing-cycle buttons**

Change `createPackageActionRuntime()` to accept an options object and expose billing buttons:

```js
function createPackageActionRuntime(options = {}) {
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');
  const monthlyBillingButton = fakeInteractiveElement({ packageBillingCycle: 'monthly' });
  const yearlyBillingButton = fakeInteractiveElement({ packageBillingCycle: 'yearly' });
  const trialButton = fakeInteractiveElement({ planTrial: 'Pro' }, { attributes: ['data-plan-trial'] });
  const buyButton = fakeInteractiveElement({ planSelect: options.plan || 'Pro' }, { attributes: ['data-plan-select'] });
  const overview = fakeInteractiveElement();
  const purchaseHistory = fakeInteractiveElement();
  const tabs = ['overview', 'nexora', 'voice', 'history'].map((packageTab) => fakeInteractiveElement({ packageTab }));
  const panels = ['overview', 'nexora', 'voice', 'history'].map((packagePanel) => fakeInteractiveElement({ packagePanel }));
  const priceElements = [
    fakeInteractiveElement({ monthlyAmount: '29', billingPeriodFormat: 'spaced' }),
    fakeInteractiveElement({ monthlyAmount: '79', billingPeriodFormat: 'spaced' }),
    fakeInteractiveElement({ monthlyAmount: '99', billingPeriodFormat: 'compact' }),
    fakeInteractiveElement({ monthlyAmount: '199', billingPeriodFormat: 'compact' }),
    fakeInteractiveElement({ monthlyAmount: '349', billingPeriodFormat: 'compact' })
  ];
  const comparePriceCells = [
    fakeInteractiveElement({ monthlyAmount: '29' }),
    fakeInteractiveElement({ monthlyAmount: '79' })
  ];
```

Keep the existing `paymentChildren`, `paymentModal`, `trialModal`, and VM context. In `document.querySelectorAll`, add:

```js
if (selector === '[data-package-billing-cycle]') return [monthlyBillingButton, yearlyBillingButton];
if (selector === '[data-billing-price]') return priceElements;
if (selector === '[data-billing-compare-price]') return comparePriceCells;
```

After `vm.runInNewContext(runtime, context);`, if `options.billingCycle === 'yearly'`, run:

```js
yearlyBillingButton.dispatch('click');
```

Return:

```js
return {
  trialButton,
  buyButton,
  paymentModal,
  trialModal,
  monthlyBillingButton,
  yearlyBillingButton,
  priceElements,
  comparePriceCells,
  invoiceTotal: paymentChildren.get('[data-package-invoice-total]')
};
```

- [ ] **Step 2: Add a markup/CSS regression test**

Append this test near the existing package heading and tab tests:

```js
test('renders shared Monthly and Yearly billing-cycle sub-tabs with discount chip', () => {
  const html = source();
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  const billingSwitch = html.match(/<div class="package-billing-switch" role="group" aria-label="Billing cycle">([\s\S]*?)<\/div>/)?.[1] || '';

  assert.ok(billingSwitch, 'Package billing cycle switch should render under top-level tabs');
  assert.match(html, /<div class="package-tabs" role="tablist" aria-label="Package management tabs">[\s\S]*?<\/div>\s*<div class="package-billing-switch" role="group" aria-label="Billing cycle">/);
  assert.match(billingSwitch, /data-package-billing-cycle="monthly"[^>]*aria-pressed="true"[\s\S]*?<span>Monthly<\/span>/);
  assert.match(billingSwitch, /data-package-billing-cycle="yearly"[^>]*aria-pressed="false"[\s\S]*?<span>Yearly<\/span>[\s\S]*?<span class="package-billing-discount-chip">Save 20%<\/span>/);

  assert.match(css, /\.package-billing-switch\s*\{/);
  assert.match(css, /\.package-billing-button\s*\{/);
  assert.match(css, /\.package-billing-button\.is-active\s*\{/);
  assert.match(css, /\.package-billing-discount-chip\s*\{/);
});
```

- [ ] **Step 3: Add a yearly pricing runtime test**

Append this test near other package action runtime tests:

```js
test('switches paid package prices and payment totals to rounded yearly values', () => {
  const html = source();
  const runtime = readFileSync(PACKAGE_JS_URL, 'utf8');

  assert.match(html, /data-billing-price data-monthly-amount="29" data-billing-period-format="spaced"/);
  assert.match(html, /data-billing-price data-monthly-amount="199" data-billing-period-format="compact"/);
  assert.match(runtime, /function formatYearlyBillingAmount\(monthlyAmount\)/);
  assert.match(runtime, /Math\.round\(monthlyAmount \* 12 \* 0\.8\)/);
  assert.match(runtime, /function renderBillingPrices\(\)/);
  assert.match(runtime, /data-billing-compare-price/);

  const yearlyRuntime = createPackageActionRuntime({ billingCycle: 'yearly', plan: 'Pro' });
  yearlyRuntime.buyButton.dispatch('click');

  assert.equal(yearlyRuntime.priceElements[0].innerHTML, '$278 <span>/ yr</span>');
  assert.equal(yearlyRuntime.priceElements[1].innerHTML, '$758 <span>/ yr</span>');
  assert.equal(yearlyRuntime.priceElements[2].innerHTML, '$950<span>/yr</span>');
  assert.equal(yearlyRuntime.priceElements[3].innerHTML, '$1,910<span>/yr</span>');
  assert.equal(yearlyRuntime.priceElements[4].innerHTML, '$3,350<span>/yr</span>');
  assert.equal(yearlyRuntime.invoiceTotal.textContent, '$1,910/yr');

  const monthlyRuntime = createPackageActionRuntime({ billingCycle: 'monthly', plan: 'Pro' });
  monthlyRuntime.buyButton.dispatch('click');
  assert.equal(monthlyRuntime.invoiceTotal.textContent, '$199/mo');
});
```

- [ ] **Step 4: Run the focused test and confirm RED**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs
```

Expected: FAIL because the billing-cycle sub-tab, data attributes, and pricing runtime do not exist yet.

### Task 2: Add Billing-Cycle Markup And Styles

**Files:**
- Modify: `html/pages/nexora-packages.html`
- Modify: `html/assets/nexora-packages.css`
- Test: `html/pages/nexora-packages.test.mjs`

**Interfaces:**
- Consumes: Tests from Task 1.
- Produces: `data-package-billing-cycle`, `data-billing-price`, `data-billing-compare-price`, and CSS classes used by Task 3.

- [ ] **Step 1: Add the shared sub-tab below top tabs**

In `html/pages/nexora-packages.html`, directly after the closing `</div>` for `.package-tabs`, add:

```html
            <div class="package-billing-switch" role="group" aria-label="Billing cycle">
              <button class="package-billing-button is-active" type="button" aria-pressed="true" data-package-billing-cycle="monthly"><span>Monthly</span></button>
              <button class="package-billing-button" type="button" aria-pressed="false" data-package-billing-cycle="yearly"><span>Yearly</span><span class="package-billing-discount-chip">Save 20%</span></button>
            </div>
```

- [ ] **Step 2: Add pricing data attributes to NEXORA plan cards**

Update the two paid static NEXORA price elements:

```html
<div class="nexora-plan-price" data-billing-price data-monthly-amount="29" data-billing-period-format="spaced">$29 <span>/ mo</span></div>
<div class="nexora-plan-price" data-billing-price data-monthly-amount="79" data-billing-period-format="spaced">$79 <span>/ mo</span></div>
```

Leave Enterprise custom display unchanged:

```html
<div class="nexora-plan-price is-custom">Custom <span>Scale</span></div>
```

- [ ] **Step 3: Add pricing data attributes to NEXORA comparison cells**

Change the comparison price row to:

```html
<tr><th scope="row" data-billing-compare-label>Monthly price</th><td data-billing-compare-price data-monthly-amount="29">$29</td><td class="is-highlighted" data-billing-compare-price data-monthly-amount="79">$79</td><td>Custom</td></tr>
```

- [ ] **Step 4: Add pricing data attributes to AI Voice plan cards**

Update the three AI Voice main price elements:

```html
<div class="service-plan-price" data-billing-price data-monthly-amount="99" data-billing-period-format="compact">$99<span>/mo</span></div>
<div class="service-plan-price" data-billing-price data-monthly-amount="199" data-billing-period-format="compact">$199<span>/mo</span></div>
<div class="service-plan-price" data-billing-price data-monthly-amount="349" data-billing-period-format="compact">$349<span>/mo</span></div>
```

Do not change free-trial button markup.

- [ ] **Step 5: Add billing switch styles**

In `html/assets/nexora-packages.css`, after `.package-tab-icon-dual`, add:

```css
.package-billing-switch {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  border: 1px solid var(--nexora-border);
  border-radius: 10px;
  background: var(--nexora-surface-muted);
  padding: 3px;
  overflow-x: auto;
  scrollbar-width: none;
}

.package-billing-switch::-webkit-scrollbar {
  display: none;
}

.package-billing-button {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  padding: 0 11px;
  color: var(--nexora-muted);
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
  transition: background .18s, color .18s, box-shadow .18s;
}

.package-billing-button.is-active {
  background: #fff;
  color: var(--nexora-brand);
  box-shadow: var(--nexora-card-shadow);
}

.package-billing-discount-chip {
  display: inline-flex;
  min-height: 20px;
  align-items: center;
  border-radius: 999px;
  background: rgba(0, 184, 115, 0.12);
  padding: 0 7px;
  color: var(--nexora-success);
  font-size: 10px;
  font-weight: 900;
}
```

- [ ] **Step 6: Run focused test and confirm markup/CSS checks still fail only on runtime**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs
```

Expected: The markup/CSS expectations pass; runtime expectations still fail because JS has not been implemented.

### Task 3: Implement Shared Billing-Cycle Runtime

**Files:**
- Modify: `html/assets/nexora-packages.js`
- Test: `html/pages/nexora-packages.test.mjs`

**Interfaces:**
- Consumes: HTML attributes from Task 2.
- Produces: `formatYearlyBillingAmount(monthlyAmount)`, `formatBillingTotalLabel(monthlyAmount, cycle)`, `renderBillingPrices()`, and dynamic `totalLabel` values for `getPackagePlanDetails(button)`.

- [ ] **Step 1: Add billing-cycle DOM references and state**

Near existing top-level DOM constants:

```js
  const billingCycleButtons = [...document.querySelectorAll('[data-package-billing-cycle]')];
  const billingPriceElements = [...document.querySelectorAll('[data-billing-price]')];
  const billingComparePriceElements = [...document.querySelectorAll('[data-billing-compare-price]')];
  const billingCompareLabel = document.querySelector('[data-billing-compare-label]');
  const defaultBillingCycle = 'monthly';
  const validBillingCycles = new Set(['monthly', 'yearly']);
  let packageBillingCycle = defaultBillingCycle;
```

- [ ] **Step 2: Add pricing helpers**

Place these helpers after `formatAmount(value, currency)`:

```js
  function formatWholeDollar(value) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatYearlyBillingAmount(monthlyAmount) {
    return Math.round(monthlyAmount * 12 * 0.8);
  }

  function billingAmountForCycle(monthlyAmount, cycle = packageBillingCycle) {
    return cycle === 'yearly' ? formatYearlyBillingAmount(monthlyAmount) : monthlyAmount;
  }

  function formatBillingTotalLabel(monthlyAmount, cycle = packageBillingCycle) {
    if (monthlyAmount === null) return 'Custom quote';
    const suffix = cycle === 'yearly' ? 'yr' : 'mo';
    return `$${formatWholeDollar(billingAmountForCycle(monthlyAmount, cycle))}/${suffix}`;
  }

  function formatBillingPriceHTML(monthlyAmount, periodFormat, cycle = packageBillingCycle) {
    const suffix = cycle === 'yearly' ? 'yr' : 'mo';
    const amount = formatWholeDollar(billingAmountForCycle(monthlyAmount, cycle));
    return periodFormat === 'spaced'
      ? `$${amount} <span>/ ${suffix}</span>`
      : `$${amount}<span>/${suffix}</span>`;
  }
```

- [ ] **Step 3: Add render and activation functions**

Place these helpers before `renderPackagePaymentOptions()`:

```js
  function renderBillingPrices() {
    billingPriceElements.forEach((element) => {
      const monthlyAmount = Number(element.dataset.monthlyAmount);
      if (!Number.isFinite(monthlyAmount)) return;
      element.innerHTML = formatBillingPriceHTML(monthlyAmount, element.dataset.billingPeriodFormat || 'compact');
    });

    billingComparePriceElements.forEach((element) => {
      const monthlyAmount = Number(element.dataset.monthlyAmount);
      if (!Number.isFinite(monthlyAmount)) return;
      element.textContent = `$${formatWholeDollar(billingAmountForCycle(monthlyAmount))}`;
    });

    if (billingCompareLabel) {
      billingCompareLabel.textContent = packageBillingCycle === 'yearly' ? 'Yearly price' : 'Monthly price';
    }
  }

  function activateBillingCycle(cycle) {
    const nextCycle = validBillingCycles.has(cycle) ? cycle : defaultBillingCycle;
    packageBillingCycle = nextCycle;
    billingCycleButtons.forEach((button) => {
      const active = button.dataset.packageBillingCycle === nextCycle;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderBillingPrices();
  }
```

- [ ] **Step 4: Make payment details use current billing cycle**

In `getPackagePlanDetails(button)`, replace:

```js
return detail ? { ...detail, plan, tabId, trial: trialAction && Boolean(detail.trial) } : null;
```

with:

```js
    return detail
      ? {
          ...detail,
          plan,
          tabId,
          billingCycle: packageBillingCycle,
          totalLabel: formatBillingTotalLabel(detail.monthlyAmount),
          trial: trialAction && Boolean(detail.trial)
        }
      : null;
```

Keep the `PACKAGE_PLAN_DETAILS` object shape and `monthlyAmount` values intact so existing tests still pass.

- [ ] **Step 5: Wire billing-cycle buttons**

Before the package action button listeners, add:

```js
  billingCycleButtons.forEach((button) => {
    button.addEventListener('click', () => activateBillingCycle(button.dataset.packageBillingCycle));
  });
```

Near the bottom, before `renderOverview();`, add:

```js
  activateBillingCycle(defaultBillingCycle);
```

- [ ] **Step 6: Run focused test and confirm GREEN**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs
```

Expected: PASS with no failing subtests.

### Task 4: Verify Related Behavior And Commit

**Files:**
- Verify: `html/pages/nexora-packages.html`
- Verify: `html/assets/nexora-packages.css`
- Verify: `html/assets/nexora-packages.js`
- Verify: `html/pages/nexora-packages.test.mjs`

**Interfaces:**
- Consumes: Tasks 1-3 complete.
- Produces: A committed implementation with focused tests passing and no whitespace errors.

- [ ] **Step 1: Run focused Package Management tests**

Run:

```bash
node --test html/pages/nexora-packages.test.mjs
```

Expected: all Package Management tests pass.

- [ ] **Step 2: Run JavaScript syntax check**

Run:

```bash
node --check html/assets/nexora-packages.js
```

Expected: exits 0.

- [ ] **Step 3: Run shell-adjacent Package Management tests**

Run:

```bash
node --test html/assets/nexora-shell-owner-setting.test.mjs html/assets/nexora-shell.test.mjs
```

Expected: all tests pass.

- [ ] **Step 4: Run diff whitespace check**

Run:

```bash
git diff --check -- html/pages/nexora-packages.html html/assets/nexora-packages.css html/assets/nexora-packages.js html/pages/nexora-packages.test.mjs docs/superpowers/plans/2026-08-10-package-management-billing-cycle.md
```

Expected: no output and exit 0.

- [ ] **Step 5: Inspect changed files without staging unrelated work**

Run:

```bash
git status --short
git diff --stat -- html/pages/nexora-packages.html html/assets/nexora-packages.css html/assets/nexora-packages.js html/pages/nexora-packages.test.mjs docs/superpowers/plans/2026-08-10-package-management-billing-cycle.md
```

Expected: Package Management files and this plan are the only files staged for this task. Existing unrelated `owner-setting` changes remain unstaged unless the user explicitly requests staging them.

- [ ] **Step 6: Commit implementation**

Run:

```bash
git add html/pages/nexora-packages.html html/assets/nexora-packages.css html/assets/nexora-packages.js html/pages/nexora-packages.test.mjs docs/superpowers/plans/2026-08-10-package-management-billing-cycle.md
git commit -m "feat: add package billing cycle tabs"
```

Expected: a commit containing only the Package Management billing-cycle implementation and this plan.
