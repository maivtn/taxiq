# Advisory, AI CFO, and Evidence Vault Product Ideas

This note captures new product ideas to extend Nexora Touch TaxIQ beyond payroll
tax monitoring into merchant advisory, evidence capture, CPA collaboration, and
deduction guidance.

## Module Split

These ideas should be implemented as separate product areas, not as one crowded
screen:

| Module | Owns |
| --- | --- |
| AI Advisor | AI CFO, official-rule watch, contextual help, deduction checklist suggestions. |
| OCR Vault | Bill, invoice, receipt, and payment-evidence capture with AI extraction. |
| Share Links | Secure upload/review links, QR share profile, expiration, access control. |
| GPS Mileage | Trip tracking, route purpose, mileage records, deduction review workflow. |

## Product Ideas

| Idea | Business Value | Suggested Priority |
| --- | --- | --- |
| Government Rule Watch | Notify merchants when IRS, state, local, labor, or workforce rules change and explain what action may be needed. | Phase 1.2 |
| Receipt Vault | Store bills, invoices, receipts, and payment evidence so merchants do not lose records before tax season. | Phase 1 |
| AI OCR Capture | Let users take a photo of a bill/receipt and extract vendor, date, amount, category, payment method, and tax relevance. | Phase 1 |
| Payment Review | Keep payout/payment records and flag duplicates, missing evidence, unclear purpose, or suspicious status. | Phase 1 |
| Data Collection Assistant | Ask for the exact missing fields needed for tax review, CPA export, 1099, W-2, or deduction support. | Phase 1 |
| Social/Referral Profile Sharing | Let merchants share selected profile information with friends or reviewers using QR/link access. | Phase 1.2 |
| CPA Review Portal | Allow CPA/bookkeeper to review merchant records, comment, request missing files, and prepare tax filing packages. | Phase 1.2 |
| AI CFO | Provide cash-flow advice, tax planning reminders, financial health guidance, and suggested questions for CPA. | Phase 2 |
| Guided Help / Advise | Add in-app guidance, walkthroughs, and context-aware support because the system contains many modules. | Phase 1 |
| Payout Share Link | Let A send B a secure link to upload/review payout, receipt, or profile information. | Phase 1.1 |
| Expiring Profile Link | Create shareable profile links or QR codes that expire after 15 days by default, with an option for no expiration. | Phase 1.1 |
| GPS Mileage Tracking | Track business trips and mileage for possible vehicle expense deduction support. | Phase 1.2 |
| Industry Deduction Checklist | Generate industry-specific deduction reminders so merchants do not forget common deductible expenses. | Phase 1.3 |

## Data To Collect

| Data Field | Why It Matters |
| --- | --- |
| Worker classification | Determines W-2 payroll versus 1099 contractor treatment. |
| W-4, W-9, SSN/TIN status | Supports identity verification and tax reporting. |
| Payout/payment amount | Required for payout ledger, 1099 package, and payment review. |
| Payment method | Supports audit trail for Zelle, Venmo, PayPal, Cash App, Apple Cash, cash, check, and ACH. |
| Receipt/bill image | Preserves evidence and lets AI OCR extract useful fields. |
| Vendor/payee | Needed for expense category, deduction review, and CPA package. |
| Date and tax year | Needed for period reports, quarterly review, and year-end export. |
| Business purpose | Explains why an expense, mileage trip, or payout is business-related. |
| Category | Maps records into payroll, contractor payout, supplies, rent, utilities, marketing, mileage, or other ledgers. |
| GPS start/end and miles | Supports mileage deduction records and route audit. |
| Share link recipient/access/expiration | Controls who can upload or review information and for how long. |
| CPA comments and status | Tracks review progress and missing information before filing. |

## Government Rule Watch Requirements

- Use official sources only for production alerts.
- Track source, effective date, affected jurisdiction, summary, owner action, and status.
- Show impact level: watch, review, high, or blocking.
- Allow CPA/bookkeeper to acknowledge or comment on rule changes.
- Do not present AI summaries as legal or tax advice without source references.

## Receipt Vault And OCR Requirements

- Users can upload from camera, file, email import, payout evidence, or share link.
- OCR extracts vendor, amount, date, payment method, category, and confidence.
- Low-confidence records require manual review.
- Records can link to payout, mileage, payroll, contractor, revenue, or CPA export.
- Deleted/lost physical receipts should still have a stored digital evidence copy.

## Share Link Requirements

- Link can be upload-only, review-only, or upload-and-review.
- Default expiration: 15 days.
- Optional no-expiration mode for public/referral profile links.
- QR code should map to the same share permission model.
- Every upload/review through the link creates an audit log.

## AI CFO Requirements

- Provide advisory prompts around cash flow, estimated taxes, missing records, revenue trends, payout anomalies, and deduction reminders.
- Explain what data was used to produce the suggestion.
- Suggest CPA questions for high-risk or ambiguous tax situations.
- Clearly separate guidance from official tax filing decisions.

## Guided Help Requirements

- Provide a guided tour for first-time users.
- Add contextual help by screen: payroll, payout, receipt, TaxIQ ledger, CPA export, mileage, and settings.
- Include "What should I do next?" recommendations for blocked workflows.
- Support Vietnamese-first copy, then English and Spanish.
