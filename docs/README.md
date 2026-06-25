# TaxIQ Project Documentation

This folder stores product and business-analysis documents used to shape the
TaxIQ / Nexora Touch prototype.

## Documents

| File | Purpose | Notes |
| --- | --- | --- |
| `nexora-payout-tax-iq-screen-flow-ba-v2.docx` | Original BA document for Nexora Touch Payout Management + AI Tax IQ Sync. | Source of record from product/business team. |
| `nexora-payout-tax-iq-screen-flow-ba-v2.md` | Markdown extraction of the DOCX for search, review, and implementation planning. | Generated from the DOCX; if content differs, trust the DOCX. |
| `TaxIQ_No_Tax_On_Tips_Module_Dev_Business_UI_Flow.docx` | Source BA/dev/UI document for the TaxIQ No Tax on Tips module. | Covers business rules, user roles, tip flows, UI screens, data model, APIs, webhooks, rules engine, CPA report, and roadmap. |
| `TaxIQ_No_Tax_On_Tips_Module_Dev_Business_UI_Flow.md` | Markdown extraction of the No Tax on Tips DOCX for search, review, and implementation planning. | Generated from the DOCX; if content differs, trust the DOCX. |
| `advisory-ai-cfo-product-ideas.md` | Backlog for AI Advisor, OCR Vault, Share Links, GPS Mileage, CPA Review, and Deduction Checklist ideas. | These are separate modules, not one combined screen. |
| `tax-iq-feature-description.md` | Product feature description for the current Tax IQ demo. | Covers business goals, target users, screen map, key workflows, permissions, data objects, production requirements, and demo status. |
| `tax-iq-feature-description-vi.md` | Vietnamese feature description for the current Tax IQ demo. | Includes business explanation, module details, production notes, and a glossary explaining payroll/tax/CPA/technical keywords. |

## Business Scope Captured

- Default market: Vietnamese-owned nail salons and beauty businesses in the U.S.
- Product value: payout ledger plus Tax IQ sync, not a full payroll-provider replacement in MVP.
- Core flows: technician setup, worker classification, pay period creation, payout review, owner approval, finalization, Tax IQ sync, CPA export.
- Key ledgers: payout, tip, revenue, receipt OCR, mileage, Tax IQ ledger.
- Key compliance split: W-2 payroll records versus 1099 contractor payout records.
- No Tax on Tips module: track voluntary cash/electronic/QR/POS tips, proof archive, yearly cap progress, worker privacy, CPA-ready PDF/CSV exports, and audit trail.
- Advisory expansion: official-rule updates, evidence preservation, AI OCR, CPA review, share links, AI CFO, mileage, and deduction checklists.
- Current demo location: the multi-page static demo lives in `html/`, with shared layout in `html/assets/layout.js` and page/modal rendering in `html/assets/app.js`.
- Current layout behavior: sidebar uses Font Awesome icons, supports desktop collapse/expand with `localStorage`, and switches to a horizontal mobile nav.
- Tax IQ workspace grouping: OCR Vault, Share Links, GPS Mileage, CPA Review, Tip Ledger, Tax Estimate, and AI Advisor are separate Tax IQ modules with their own workflows and modals.
- System support screens: Webhooks, Audit Log, Notifications, Settings, API Keys, and connection health support integration monitoring and operational review.
- OCR Vault scope now includes local-browser receipt/bill capture, Tesseract OCR extraction, processing queue, low-confidence review, batch approval, soft delete, and CPA export.
- Vietnamese documentation: the feature description now includes a glossary for specialized payroll, tax, CPA, OCR, GPS, AI, privacy, and integration keywords.

## Implementation Notes

- Use the BA document to extend the current HTML prototype with Payout Management screens.
- Keep worker classification explicit before syncing records into Tax IQ.
- Finalized payout records should create immutable Tax IQ ledger entries and audit logs.
- CPA export should support month, quarter, year, and technician-level packages.
- No Tax on Tips implementation should keep direct tips private by default, classify tip entries through a rules engine, retain proof images, and avoid guaranteed deduction/refund language.
- OCR production implementation should define whether OCR runs client-side, server-side, or hybrid, and document file retention, original-image preservation, duplicate detection, confidence thresholds, and CPA export rules.
- Tax Estimate should stay advisory only: show estimates, deposit reminders, and CPA review prompts without presenting final tax liability as guaranteed.
- Audit Log should remain append-only/immutable in production, including soft-delete events for tax records, receipt records, trip records, and tip entries.
- Use `tax-iq-feature-description.md` as the product overview before drilling into screen-level implementation details.
- Use `tax-iq-feature-description-vi.md` for Vietnamese stakeholder review, business explanation, demo preparation, and terminology alignment.
