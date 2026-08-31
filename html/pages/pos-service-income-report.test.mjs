import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const prototypePath = new URL('./pos-service-income-report.html', import.meta.url)

function loadPrototype() {
  const html = existsSync(prototypePath)
    ? readFileSync(prototypePath, 'utf8')
    : '<!doctype html><html><body></body></html>'

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

test('renders independently ranked revenue and count charts for the selected period', () => {
  const { window } = loadPrototype()
  const document = window.document

  assert.equal(document.querySelector('h1')?.textContent?.trim(), 'Service Income')
  assert.equal(document.querySelector('[data-total-revenue]')?.textContent?.trim(), '$4,286.00')
  assert.equal(document.querySelector('[data-total-count]')?.textContent?.trim(), '104')

  const revenueNames = [...document.querySelectorAll('[data-chart="revenue"] [data-service-name]')]
    .map((element) => element.textContent?.trim())
  const countNames = [...document.querySelectorAll('[data-chart="count"] [data-service-name]')]
    .map((element) => element.textContent?.trim())

  assert.deepEqual(revenueNames.slice(0, 3), ['Deluxe Pedicure', 'Gel Manicure', 'King Pedicure'])
  assert.deepEqual(countNames.slice(0, 3), ['Gel Manicure', 'Classic Manicure', 'Deluxe Pedicure'])
})

test('renders inside the shared salon shell and identifies the active Analytics report', () => {
  const { window } = loadPrototype()

  assert.ok(window.document.querySelector('.shell > aside.sidebar'))
  assert.ok(window.document.querySelector('.app-area > header.header'))
  assert.ok(window.document.querySelector('main.content > .page'))
  assert.equal(window.NEXORA_SHELL?.activePage, 'analytics')
  assert.equal(window.NEXORA_SHELL?.activeTab, 'service-income')
})

test('uses one always-visible range selector and validates it before updating the report', () => {
  const { window } = loadPrototype()
  const document = window.document

  assert.equal(document.querySelectorAll('[data-period]').length, 0)
  assert.equal(document.querySelector('[data-range-form]')?.hidden, false)

  const from = document.querySelector('[name="fromDate"]')
  const to = document.querySelector('[name="toDate"]')
  assert.ok(from instanceof window.HTMLInputElement)
  assert.ok(to instanceof window.HTMLInputElement)

  from.value = '2026-08-30'
  to.value = '2026-08-25'
  click(window, '[data-apply-range]')

  assert.equal(document.querySelector('[data-date-error]')?.hidden, false)

  from.value = '2026-08-25'
  to.value = '2026-08-30'
  click(window, '[data-apply-range]')

  assert.equal(document.querySelector('[data-date-error]')?.hidden, true)
})

test('renders both service rankings as vertical column charts', () => {
  const { window } = loadPrototype()
  const document = window.document

  assert.equal(document.querySelector('[data-chart="revenue"]')?.getAttribute('data-orientation'), 'vertical')
  assert.equal(document.querySelector('[data-chart="count"]')?.getAttribute('data-orientation'), 'vertical')
  assert.equal(document.querySelectorAll('[data-chart="revenue"] [data-column-bar]').length, 8)
  assert.equal(document.querySelectorAll('[data-chart="count"] [data-column-bar]').length, 8)
})

test('opens a reconciling service-line drill-down from either chart', () => {
  const { window } = loadPrototype()
  const document = window.document

  click(window, '[data-chart="revenue"] [data-service-id="deluxe-pedicure"]')

  const drawer = document.querySelector('[data-detail-overlay]')
  assert.equal(drawer?.getAttribute('aria-hidden'), 'false')
  assert.equal(document.querySelector('[data-detail-title]')?.textContent?.trim(), 'Deluxe Pedicure')
  assert.equal(document.querySelector('[data-detail-revenue]')?.textContent?.trim(), '$1,170.00')
  assert.equal(document.querySelector('[data-detail-count]')?.textContent?.trim(), '18 service lines')
  assert.equal(document.querySelectorAll('[data-detail-row]').length, 5)

  click(window, '[data-close-detail]')
  assert.equal(drawer?.getAttribute('aria-hidden'), 'true')

  click(window, '[data-chart="count"] [data-service-id="gel-manicure"]')
  assert.equal(document.querySelector('[data-detail-title]')?.textContent?.trim(), 'Gel Manicure')
})

test('keeps the primary surface compact without duplicate report chrome', () => {
  const { window } = loadPrototype()
  const document = window.document

  assert.equal(document.querySelector('.breadcrumb'), null)
  assert.equal(document.querySelector('.prototype-toolbar'), null)
  assert.equal(document.querySelector('.range-context'), null)
  assert.equal(document.querySelector('.report-heading'), null)
  assert.equal(document.querySelector('[data-integrity-warning]'), null)
  assert.equal(document.querySelector('.summary-grid'), null)
  assert.equal(document.querySelector('.page-footer'), null)
})

test('keeps service colors consistent and exposes every ranked service without another control', () => {
  const { window } = loadPrototype()
  const document = window.document

  const revenueGel = document.querySelector('[data-chart="revenue"] [data-service-id="gel-manicure"]')
  const countGel = document.querySelector('[data-chart="count"] [data-service-id="gel-manicure"]')
  assert.equal(revenueGel?.getAttribute('data-color'), countGel?.getAttribute('data-color'))

  assert.equal(document.querySelectorAll('[data-chart="revenue"] [data-rank-row]').length, 8)
  assert.equal(document.querySelectorAll('[data-chart="revenue"] [data-rank-row][hidden]').length, 0)
  assert.match(document.querySelector('[data-chart="revenue"]')?.textContent ?? '', /Deluxe Pedicure — Callus Treatment/)
  assert.match(document.querySelector('[data-chart="revenue"]')?.textContent ?? '', /Inactive/)
  assert.equal(document.querySelector('[data-view-all]'), null)
})

test('closes drill-down with Escape and returns focus to the selected chart row', () => {
  const { window } = loadPrototype()
  const document = window.document
  const selectedBar = document.querySelector('[data-chart="revenue"] [data-service-id="deluxe-pedicure"]')
  assert.ok(selectedBar instanceof window.HTMLButtonElement)

  selectedBar.focus()
  click(window, '[data-chart="revenue"] [data-service-id="deluxe-pedicure"]')
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

  assert.equal(document.querySelector('[data-detail-overlay]')?.getAttribute('aria-hidden'), 'true')
  assert.equal(document.activeElement, selectedBar)
})
