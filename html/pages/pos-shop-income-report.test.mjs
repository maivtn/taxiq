import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const prototypePath = new URL('./pos-shop-income-report.html', import.meta.url)

function loadPrototype() {
  const html = existsSync(prototypePath) ? readFileSync(prototypePath, 'utf8') : '<!doctype html><html><body></body></html>'
  return new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://prototype.nexoratouch.test/',
  })
}

function click(window, selector) {
  const element = window.document.querySelector(selector)
  assert.ok(element, `Expected ${selector} to exist`)
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
}

function styleRule(window, selector) {
  const rules = [...window.document.styleSheets[0].cssRules]
  const rule = rules.find((candidate) => candidate.selectorText === selector)
  assert.ok(rule, `Expected a CSS rule for ${selector}`)
  return rule
}

function styleProperty(window, selector, property) {
  const rule = styleRule(window, selector)
  const parsed = rule.style.getPropertyValue(property)
  if (parsed) return parsed
  return rule.cssText.match(new RegExp(`${property}\\s*:\\s*([^;]+)`))?.[1]?.trim() ?? ''
}

function mediaStyleRule(window, condition, selector) {
  const mediaRule = [...window.document.styleSheets[0].cssRules]
    .find((candidate) => candidate.conditionText === condition)
  assert.ok(mediaRule, `Expected a CSS media rule for ${condition}`)
  const rule = [...mediaRule.cssRules].find((candidate) => candidate.selectorText
    ?.split(',')
    .map((part) => part.trim())
    .includes(selector))
  assert.ok(rule, `Expected ${condition} to include a CSS rule for ${selector}`)
  return rule
}

function maxPixelValue(value) {
  const matches = [...String(value).matchAll(/([\d.]+)px/g)].map((match) => Number(match[1]))
  if (matches.length === 0) return Number.POSITIVE_INFINITY
  return Math.max(...matches)
}

test('defaults to the Day report for Today with payment and detail totals', () => {
  const { window } = loadPrototype()
  const periodLabels = [...window.document.querySelectorAll('[data-period]')]
    .map((element) => element.textContent?.trim())

  assert.deepEqual(periodLabels, ['Day', 'Week', 'Year', 'Range'])
  assert.equal(window.document.querySelector('[data-period="day"]')?.getAttribute('aria-selected'), 'true')
  assert.equal(window.document.querySelector('[name="dayDate"]')?.value, '2026-08-31')
  assert.equal(window.document.querySelector('[data-payment-total]')?.textContent?.trim(), '$3,842.65')
  assert.equal(window.document.querySelector('[data-detail="total"]')?.textContent?.trim(), '$3,842.65')

  const paymentTotal = [...window.document.querySelectorAll('[data-payment-amount]')]
    .reduce((sum, element) => sum + Number(element.getAttribute('data-payment-amount')), 0)
  assert.equal(Math.round(paymentTotal * 100), 384265)
  assert.equal(window.document.body.textContent?.includes('Split Pay'), false)
  assert.equal(window.document.body.textContent?.includes('Check'), false)
  assert.equal(window.document.body.textContent?.includes('Gift Sold'), false)
})

test('prepares one table row for printing Day without replacing the screen cards', () => {
  const { window } = loadPrototype()

  assert.equal(window.document.querySelector('[data-day-view]')?.hidden, false)
  assert.equal(window.document.querySelector('[data-table-view]')?.hidden, true)
  assert.equal(window.document.querySelectorAll('[data-report-row]').length, 1)
  assert.match(window.document.querySelector('[data-report-row]')?.textContent ?? '', /Mon, Aug 31/i)
  assert.equal(window.document.querySelector('[data-table-grand-total]')?.textContent?.trim(), '$3,842.65')
})

test('prints only the report table with paper-safe table styles', () => {
  const { window } = loadPrototype()
  const printCanvas = mediaStyleRule(window, 'print', 'html')
  const content = mediaStyleRule(window, 'print', '.content')
  const hiddenPageContent = mediaStyleRule(window, 'print', '.page > :not(.table-card)')
  const shellBackdrop = mediaStyleRule(window, 'print', '.nexora-shell-backdrop')
  const tableCard = mediaStyleRule(window, 'print', '.table-card')
  const tableHeading = mediaStyleRule(window, 'print', '.table-card > .section-heading')
  const tableScroll = mediaStyleRule(window, 'print', '.table-scroll')
  const table = mediaStyleRule(window, 'print', '.report-table')
  const tableCells = mediaStyleRule(window, 'print', '.report-table th')
  const tableHeaders = mediaStyleRule(window, 'print', '.report-table thead th')
  const edgeColumns = mediaStyleRule(window, 'print', '.report-table th:first-child')

  assert.equal(printCanvas.style.getPropertyValue('background-color'), '#fff')
  assert.equal(printCanvas.style.getPropertyPriority('background-color'), 'important')
  assert.equal(content.style.getPropertyValue('padding'), '0')
  assert.equal(content.style.getPropertyPriority('padding'), 'important')
  assert.equal(hiddenPageContent.style.getPropertyValue('display'), 'none')
  assert.equal(shellBackdrop.style.getPropertyValue('display'), 'none')
  assert.equal(shellBackdrop.style.getPropertyPriority('display'), 'important')
  assert.equal(tableCard.style.getPropertyValue('display'), 'block')
  assert.equal(tableCard.style.getPropertyPriority('display'), 'important')
  assert.equal(tableHeading.style.getPropertyValue('display'), 'none')
  assert.equal(tableScroll.style.getPropertyValue('overflow'), 'visible')
  assert.equal(table.style.getPropertyValue('min-width'), '0')
  assert.equal(tableCells.style.getPropertyValue('position'), 'static')
  assert.equal(tableCells.style.getPropertyPriority('position'), 'important')
  assert.equal(tableCells.style.getPropertyValue('padding'), '4px 3px')
  assert.equal(tableCells.style.getPropertyValue('font-size'), '9px')
  assert.equal(tableCells.style.getPropertyPriority('font-size'), 'important')
  assert.equal(tableHeaders.style.getPropertyValue('white-space'), 'normal')
  assert.equal(tableHeaders.style.getPropertyValue('font-size'), '8px')
  assert.equal(edgeColumns.style.getPropertyValue('width'), 'auto')
})

test('renders inside the shared salon shell and identifies the active Analytics report', () => {
  const { window } = loadPrototype()

  assert.ok(window.document.querySelector('.shell > aside.sidebar'))
  assert.ok(window.document.querySelector('.app-area > header.header'))
  assert.ok(window.document.querySelector('main.content > .page'))
  assert.equal(window.NEXORA_SHELL?.activePage, 'analytics')
  assert.equal(window.NEXORA_SHELL?.activeTab, 'store-income')
})

test('shows every supported payment method when its amount is zero', () => {
  const { window } = loadPrototype()
  const paymentRows = [...window.document.querySelectorAll('[data-payment-method]')]

  assert.deepEqual(
    paymentRows.map((row) => row.getAttribute('data-payment-method')),
    ['card', 'cash', 'gift', 'zelle', 'wallet'],
  )
  assert.equal(paymentRows.every((row) => row.hidden === false), true)

  const walletRow = window.document.querySelector('[data-payment-method="wallet"]')
  assert.equal(walletRow?.querySelector('[data-payment-amount]')?.textContent?.trim(), '$0.00')
  assert.equal(walletRow?.querySelector('[data-payment-count]')?.textContent?.trim(), '0 allocations')
})

test('uses Store terminology throughout the report UI', () => {
  const { window } = loadPrototype()

  assert.equal(window.document.title, 'Store Income Report — NEXORA TOUCH')
  assert.equal(window.document.querySelector('h1')?.textContent?.trim(), 'Store Income')

  click(window, '[data-email-report]')
  assert.match(window.document.querySelector('[data-email-modal] strong')?.textContent ?? '', /Store Income/)
})

test('omits nonessential chrome from the compact report layout', () => {
  const { window } = loadPrototype()
  const removedSelectors = [
    '.eyebrow',
    '.subtitle',
    '[data-refresh-report]',
    '.prototype-note',
    '.picker-hint',
    '[data-today]',
    '[data-this-week]',
    '[data-this-year]',
    '[data-generated-at]',
    '.section-copy',
    '.method-mark',
    '.method-track',
    '.row-arrow',
    '.transaction-groups',
    '.report-footer',
    '.table-legend',
  ]

  removedSelectors.forEach((selector) => {
    assert.equal(window.document.querySelector(selector), null, `Expected ${selector} to be removed`)
  })
  assert.equal(window.document.querySelector('th:nth-child(7)')?.textContent?.trim(), 'Tips (included)')
})

test('places deferred fees and returns inside Day Details', () => {
  const { window } = loadPrototype()
  const details = window.document.querySelector('.detail-list')
  assert.ok(details)

  assert.equal(window.document.querySelector('[data-total-collected]'), null)
  assert.equal(window.document.querySelector('[data-largest-tender]'), null)
  assert.equal(window.document.querySelector('[data-deferred-metrics]'), null)
  assert.equal(details.contains(window.document.querySelector('[data-supply-fee]')), true)
  assert.equal(details.contains(window.document.querySelector('[data-merchant-fee]')), true)
  assert.equal(details.contains(window.document.querySelector('[data-return-total]')), true)
  assert.equal(window.document.querySelector('[data-supply-fee]')?.textContent?.trim(), '$0.00')
  assert.equal(window.document.querySelector('[data-merchant-fee]')?.textContent?.trim(), '$0.00')
  assert.equal(window.document.querySelector('[data-return-count]')?.textContent?.trim(), '0')
  assert.equal(window.document.querySelector('[data-return-total]')?.textContent?.trim(), '$0.00')
  assert.equal(window.document.querySelector('[data-payment-total]')?.textContent?.trim(), '$3,842.65')

  const detailLabels = [...details.querySelectorAll('.detail-row > span:first-child')]
    .map((element) => element.textContent?.trim())
  assert.deepEqual(detailLabels.slice(-5), ['Tips', 'Supply Fee', 'Merchant Fee', 'Return Transactions', 'Total collected'])
})

test('shows This Week as seven daily rows with a reconciled weekly total', () => {
  const { window } = loadPrototype()

  click(window, '[data-period="week"]')

  assert.equal(window.document.querySelector('[name="weekValue"]')?.value, '2026-W36')
  assert.match(window.document.querySelector('[data-period-title]')?.textContent ?? '', /This Week/i)
  assert.equal(window.document.querySelector('[data-table-view]')?.hidden, false)
  assert.equal(window.document.querySelectorAll('[data-report-row]').length, 7)
  assert.match(window.document.querySelector('[data-report-row]')?.textContent ?? '', /Mon, Aug 31/i)
  assert.equal(window.document.querySelector('[data-table-grand-total]')?.textContent?.trim(), '$18,745.90')
})

test('shows the calendar date range for the selected report week', () => {
  const { window } = loadPrototype()

  click(window, '[data-period="week"]')
  const weekInput = window.document.querySelector('[name="weekValue"]')
  assert.ok(weekInput instanceof window.HTMLInputElement)
  assert.equal(window.document.querySelector('[data-week-range]')?.textContent?.trim(), 'Aug 31 – Sep 6, 2026')

  weekInput.value = '2026-W35'
  weekInput.dispatchEvent(new window.Event('change', { bubbles: true }))

  assert.equal(window.document.querySelector('[data-week-range]')?.textContent?.trim(), 'Aug 24 – Aug 30, 2026')
})

test('shows This Year as twelve reconciled monthly rows without historical warnings', () => {
  const { window } = loadPrototype()

  click(window, '[data-period="year"]')

  assert.equal(window.document.querySelector('[name="yearValue"]')?.value, '2026')
  assert.match(window.document.querySelector('[data-period-title]')?.textContent ?? '', /This Year/i)
  assert.equal(window.document.querySelectorAll('[data-report-row]').length, 12)
  assert.equal(window.document.querySelectorAll('[data-report-row][data-future="true"]').length, 4)
  assert.equal(window.document.querySelector('[data-table-grand-total]')?.textContent?.trim(), '$462,015.60')
  assert.equal(window.document.querySelector('[data-table-total-cell="card"]')?.textContent?.trim(), '$303,366.00')
  assert.equal(window.document.querySelector('[data-integrity-warning]'), null)
  assert.equal(window.document.querySelector('[data-table-legacy]'), null)
  assert.equal(window.document.body.textContent?.toLowerCase().includes('historical'), false)
})

test('defaults Range to month-to-date and validates reversed dates before applying', () => {
  const { window } = loadPrototype()

  click(window, '[data-period="range"]')
  const from = window.document.querySelector('[name="fromDate"]')
  const to = window.document.querySelector('[name="toDate"]')
  assert.ok(from instanceof window.HTMLInputElement)
  assert.ok(to instanceof window.HTMLInputElement)
  assert.equal(from.value, '2026-08-01')
  assert.equal(to.value, '2026-08-31')

  const originalTotal = window.document.querySelector('[data-table-grand-total]')?.textContent
  from.value = '2026-08-20'
  to.value = '2026-08-10'
  click(window, '[data-apply-range]')

  assert.equal(window.document.querySelector('[data-date-error]')?.hidden, false)
  assert.match(window.document.querySelector('[data-date-error]')?.textContent ?? '', /on or before/i)
  assert.equal(window.document.querySelector('[data-table-grand-total]')?.textContent, originalTotal)
})

test('applies a valid Range and renders one auditable row per day', () => {
  const { window } = loadPrototype()

  click(window, '[data-period="range"]')
  const from = window.document.querySelector('[name="fromDate"]')
  const to = window.document.querySelector('[name="toDate"]')
  from.value = '2026-08-25'
  to.value = '2026-08-31'
  click(window, '[data-apply-range]')

  assert.equal(window.document.querySelectorAll('[data-report-row]').length, 7)
  assert.match(window.document.querySelector('[data-period-title]')?.textContent ?? '', /Aug 25–31, 2026/i)
  assert.equal(window.document.querySelector('[data-date-error]')?.hidden, true)
})

test('opens a Week row as its Day report', () => {
  const { window } = loadPrototype()

  click(window, '[data-period="week"]')
  click(window, '[data-report-row]')

  assert.equal(window.document.querySelector('[data-period="day"]')?.getAttribute('aria-selected'), 'true')
  assert.equal(window.document.querySelector('[name="dayDate"]')?.value, '2026-08-31')
  assert.equal(window.document.querySelector('[data-day-view]')?.hidden, false)
})

test('opens an auditable order drawer from a Day payment method and closes it with Escape', () => {
  const { window } = loadPrototype()

  click(window, '[data-payment-method="card"]')

  const drawer = window.document.querySelector('[data-order-drawer]')
  assert.equal(drawer?.getAttribute('aria-hidden'), 'false')
  assert.match(window.document.querySelector('[data-drawer-title]')?.textContent ?? '', /Card payments/i)
  assert.ok(window.document.querySelectorAll('[data-order-row]').length >= 3)

  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  assert.equal(drawer?.getAttribute('aria-hidden'), 'true')
})

test('prefills the business email and confirms a snapshot of the active report', () => {
  const { window } = loadPrototype()

  click(window, '[data-period="week"]')
  click(window, '[data-email-report]')
  const modal = window.document.querySelector('[data-email-modal]')
  const recipient = window.document.querySelector('[name="reportRecipient"]')
  assert.equal(modal?.getAttribute('aria-hidden'), 'false')
  assert.ok(recipient instanceof window.HTMLInputElement)
  assert.equal(recipient.value, 'owner@lunasalon.com')
  assert.match(window.document.querySelector('[data-email-snapshot]')?.textContent ?? '', /This Week/i)

  click(window, '[data-send-report]')
  assert.equal(modal?.getAttribute('aria-hidden'), 'true')
  assert.match(window.document.querySelector('[data-toast]')?.textContent ?? '', /sent to owner@lunasalon\.com/i)
})

test('keeps report typography and rows within the compact iPad scale', () => {
  const { window } = loadPrototype()

  assert.ok(maxPixelValue(styleProperty(window, 'h1', 'font-size')) <= 28)
  const paymentRowHeight = maxPixelValue(styleProperty(window, '.payment-row', 'min-height'))
  assert.ok(paymentRowHeight >= 44 && paymentRowHeight <= 48)
  assert.ok(maxPixelValue(styleProperty(window, '.detail-row', 'min-height')) <= 40)
  assert.ok(maxPixelValue(styleProperty(window, '.section-heading', 'min-height')) <= 48)
  const tableRowHeight = maxPixelValue(styleProperty(window, '.report-data-row', 'height'))
  assert.ok(tableRowHeight >= 44 && tableRowHeight <= 54)
})
