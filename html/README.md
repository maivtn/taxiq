# TaxIQ Demo Project

Static multi-page demo for TaxIQ / Nexora Touch.

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

No build step is required. The demo uses CDN assets for Tailwind, Font Awesome icons, and browser OCR, so open it while online for full styling, icons, and OCR behavior. A local server is recommended because the app now loads `assets/mock-data.json`; opening through `file://` may be blocked by browser security.

## Structure

```text
html/
  index.html
  assets/
    styles.css
    layout.js
    mock-data.json
    mock-data.js
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
    payouts.html
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

## Demo Coverage

- Each major screen is a separate HTML page.
- Shared sidebar/topbar/navigation comes from `assets/layout.js`.
- Sidebar uses Font Awesome icons, supports collapse/expand on desktop, persists state in `localStorage`, and becomes a horizontal scroll nav on mobile.
- Screen data comes from `assets/mock-data.json`; `assets/mock-data.js` is only a small loader that fetches the JSON for the browser.
- Page rendering, modals, and demo actions come from `assets/app.js`.
- Sidebar groups OCR Vault, Share Links, GPS Mileage, CPA Review, and AI Advisor under `Tax IQ`.
- Sidebar also includes Tip Ledger and Tax Estimate under `Tax IQ`.
- Overview screens now include Dashboard, Analytics, and Onboarding.
- Tax IQ screens now include Data Quality Center for missing data, evidence gaps, integration errors, and CPA readiness.
- System screens now include Webhooks, Audit Log, Notifications, Compliance Review, Billing & Plans, and Settings.
- Tailwind utility classes drive the main layout and components through Tailwind Play CDN.
- `assets/styles.css` keeps only small demo helpers for responsive grids, modal state, and fallback button/card styling.
- GPS Route Preview uses Google Maps JavaScript API with the configured `mapId`; production should restrict the browser API key by HTTP referrer/domain in Google Cloud.
- For local demo, the page defaults to a Google Maps iframe preview to avoid API-key referrer errors. To test the JavaScript API and `mapId` locally, first allow `http://127.0.0.1:8123/*` and `http://localhost:8123/*` in the Google Maps API key referrer restrictions, then open `gps-mileage.html?mapsJs=1`.
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
  - Start GPS trip at point A, stop at point B, save route/miles to the tracker, and preview saved routes with Google Maps
  - Invite CPA
  - Generate report package
  - Add and review tips for No Tax on Tips support
  - Review tax estimate and deposit schedule alerts
  - Inspect audit log and webhook payloads
  - Review merchant plan, invoices, CPA billing approval, and upgrade path
  - Review merchant onboarding, empty-state acceptance criteria, and ICP fit
  - Track data quality gaps and create cleanup tasks
  - Review legal/compliance go-live checklist and risk wording rules
  - Review detailed role permission matrix
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
- Merchant onboarding
- Data Quality Center
- Compliance Review
- Billing & Plans
