# TaxIQ Demo Project

Static multi-page demo for TaxIQ / Nexora Touch.

## How To Open

Open `index.html` directly in a browser:

```text
html/index.html
```

No build step is required. The demo uses CDN assets for Tailwind, Font Awesome icons, and browser OCR, so open it while online for full styling, icons, and OCR behavior.

## Structure

```text
html/
  index.html
  assets/
    styles.css
    layout.js
    app.js
  pages/
    analytics.html
    employers.html
    employees.html
    employee-profile.html
    payroll-runs.html
    run-detail.html
    connections.html
    payouts.html
    tax-ledger.html
    exceptions.html
    jurisdictions.html
    forms-reports.html
    ai-advisor.html
    ocr-vault.html
    share-links.html
    gps-mileage.html
    cpa-review.html
    tip-ledger.html
    tax-estimate.html
    webhooks.html
    audit-log.html
    notifications.html
    settings.html
```

## Demo Coverage

- Each major screen is a separate HTML page.
- Shared sidebar/topbar/navigation comes from `assets/layout.js`.
- Sidebar uses Font Awesome icons, supports collapse/expand on desktop, persists state in `localStorage`, and becomes a horizontal scroll nav on mobile.
- Screen data, page content, modals, and demo actions come from `assets/app.js`.
- Sidebar groups OCR Vault, Share Links, GPS Mileage, CPA Review, and AI Advisor under `Tax IQ`.
- Sidebar also includes Tip Ledger and Tax Estimate under `Tax IQ`.
- System screens now include Webhooks, Audit Log, Notifications, and Settings.
- Tailwind utility classes drive the main layout and components through Tailwind Play CDN.
- `assets/styles.css` keeps only small demo helpers for responsive grids, modal state, and fallback button/card styling.
- Important workflows use demo modals:
  - Add/edit/delete employer, employee, connection, receipt, trip, payout, and tip records
  - Create payroll run
  - Finalize run
  - Create payout
  - Capture receipt / bill with local browser OCR
  - Review low-confidence OCR fields
  - Batch approve high-confidence receipts
  - Create share link
  - View QR / revoke share link
  - Start GPS trip
  - Invite CPA
  - Generate report package
  - Add and review tips for No Tax on Tips support
  - Review tax estimate and deposit schedule alerts
  - Inspect audit log and webhook payloads
  - Create API key for integrations
- Some action buttons mutate the in-memory demo data, including approve receipt, resolve exception, mark notifications read, copy share link, revoke connection, mark payout paid, rotate/revoke API key, and soft-delete receipt/trip/tip records.

## Product Scope

- US payroll tax and employer compliance
- Staff payout and 1099 support
- Tax IQ ledger and audit trail
- AI Advisor
- OCR Vault
- Local-browser OCR prototype with camera/file capture, extraction review, processing queue, batch approval, and CPA export
- Share Links
- GPS Mileage
- CPA Review
- Tip Ledger / No Tax on Tips support
- Tax Estimate dashboard
- Connections management
- Webhook monitor
- Audit log
- Notifications
