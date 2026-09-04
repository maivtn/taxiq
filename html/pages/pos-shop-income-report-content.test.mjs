import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const contentPath = new URL('./pos-shop-income-report-content.html', import.meta.url)

function loadContent() {
  const html = existsSync(contentPath) ? readFileSync(contentPath, 'utf8') : '<!doctype html><html><body></body></html>'
  return new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://prototype.nexoratouch.test/',
  })
}

test('renders the income report as standalone content without the application shell', () => {
  const { window } = loadContent()
  const { document } = window

  assert.ok(document.body.querySelector(':scope > .page'))
  assert.equal(document.querySelector('.shell'), null)
  assert.equal(document.querySelector('.sidebar'), null)
  assert.equal(document.querySelector('.app-area'), null)
  assert.equal(document.querySelector('header.header'), null)
  assert.equal(document.querySelector('main.content'), null)
  assert.equal(document.querySelector('link[href$="nexora-shell.css"]'), null)
  assert.equal(document.querySelector('script[src$="nexora-shell.js"]'), null)
  assert.equal(window.NEXORA_SHELL, undefined)
  assert.equal(document.querySelector('[data-payment-total]')?.textContent?.trim(), '$3,842.65')
})
