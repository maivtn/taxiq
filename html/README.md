# TaxIQ App

Static multi-page TaxIQ / Nexora Touch application shell.

## How To Open

Run a lightweight local server from the `html/` folder, then open the local URL:

```bash
cd html
python3 -m http.server 8123
```

Then open:

```text
http://localhost:8123/
```

No build step is required. The app uses CDN assets for Tailwind, Font Awesome icons, and browser OCR, so open it while online for full styling, icons, and OCR behavior. A local server is recommended because the app loads `assets/app-data.json`; opening through `file://` may be blocked by browser security.

## Structure

```text
html/
  index.html
  assets/
    styles.css
    layout.js
    app-data.json
    app-data.js
    app.js
  pages/
    analytics.html
    onboarding.html
    employers.html
    employees.html
    employee-profile.html
    payroll-runs.html
    run-detail.html
    connections.html
    quick-pay.html
    pay-engine.html
    weekly-payroll.html
    checkout.html
    payouts.html
    tax-1099.html
    tax-ledger.html
    exceptions.html
    data-quality.html
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
    compliance-review.html
    billing.html
    settings.html
```

## App Coverage

- Each major screen is a separate HTML page.
- Shared sidebar/topbar/navigation comes from `assets/layout.js`.
- Sidebar uses Font Awesome icons, supports collapse/expand on desktop, persists state in `localStorage`, and becomes a horizontal scroll nav on mobile.
- Screen data comes from `assets/app-data.json`; `assets/app-data.js` is only a small loader that fetches the JSON for the browser.
- Page rendering, modals, and interactive actions come from `assets/app.js`.
- Sidebar groups OCR Vault, Share Links, GPS Mileage, CPA Review, and AI Advisor under `Tax IQ`.
- Sidebar also includes Tip Ledger and Tax Estimate under `Tax IQ`.
- Overview screens now include Dashboard, Analytics, and Onboarding.
- Merchant POS screens now include a dedicated Checkout flow for ticket review, tip allocation, payment, receipt delivery, and TaxIQ sync.
- Tax IQ screens now include Data Quality Center for missing data, evidence gaps, integration errors, and CPA readiness.
- System screens now include Webhooks, Audit Log, Notifications, Compliance Review, Billing & Plans, and Settings.
- Nexora Touch payout/payroll docs are now represented as dedicated pages: Quick Pay, Pay Engine, Weekly Payroll, and Tax Center 1099/W-2.
- Tailwind utility classes drive the main layout and components through Tailwind Play CDN.
- `assets/styles.css` keeps shared helpers for responsive grids, modal state, and fallback button/card styling.
- GPS Route Preview uses Leaflet with OpenStreetMap tiles, so the app does not need a Google Maps key.
- For production traffic, use an approved tile provider with quota/SLA, cache policy, attribution, and privacy review; high-volume apps should not depend on the public OpenStreetMap tile service directly.
- Each page includes a compact workflow guide with purpose, target role, next action, and quick links.
- Dashboard and Tax Estimate include a US Tax Readiness checklist for EIN/business setup, worker tax forms, federal payroll taxes, state/SUTA setup, evidence vault, and CPA filing package readiness.
- Payouts now includes Nexora Touch supplemental workflows for Quick Pay, Pay Engine configuration, 1099 contractor readiness, and Payout Hub approval rules.
- Forms & Reports now includes a 1099/W-2 Tax Center checklist for W-9/TIN readiness, 1099-NEC package review, recipient delivery, and IRS e-file readiness.
- Dedicated Quick Pay, Pay Engine, Weekly Payroll, and Tax Center 1099/W-2 pages provide the detailed operational views behind those summary panels.
- Important workflows use interactive modals:
  - Add/edit/delete employer, employee, connection, receipt, trip, payout, and tip records
  - Create payroll run
  - Create Quick Pay payment
  - Configure worker pay rule
  - Review weekly payroll and pay one worker or all workers
  - Review 1099/W-2 readiness and request W-9/TIN updates
  - Finalize run
  - Create payout
  - Capture receipt / bill with local browser OCR
  - Review low-confidence OCR fields
  - Batch approve high-confidence receipts
  - Create share link
  - View QR / revoke share link
  - Start GPS trip at point A, stop at point B, save route/miles to the tracker, and preview saved routes with Leaflet/OpenStreetMap
  - Invite CPA
  - Generate report package
  - Add and review tips for No Tax on Tips support
  - Review tax estimate and deposit schedule alerts
  - Inspect audit log and webhook payloads
  - Review merchant plan, invoices, CPA billing approval, and upgrade path
  - Review merchant onboarding, empty-state acceptance criteria, and operating profile
  - Track data quality gaps and create cleanup tasks
  - Review legal/compliance controls and risk wording rules
  - Review detailed role permission matrix
- Some action buttons mutate the in-memory app data, including approve receipt, resolve exception, mark notifications read, copy share link, revoke connection, mark payout paid, and soft-delete receipt/trip/tip records.

## Product Scope

- US payroll tax and employer compliance
- Staff payout and 1099 support
- Quick Pay, Pay Engine, weekly payroll, Payout Hub 1099, and Tax Center 1099/W-2 support
- Tax IQ ledger and audit trail
- AI Advisor
- OCR Vault
- Local-browser OCR workflow with camera/file capture, extraction review, processing queue, batch approval, and CPA export
- Share Links
- GPS Mileage
- CPA Review
- Tip Ledger / No Tax on Tips support
- Tax Estimate dashboard
- US Tax Readiness checklist
- Connections management
- Webhook monitor
- Audit log
- Notifications
- Merchant onboarding
- Data Quality Center
- Compliance Review
- Billing & Plans
