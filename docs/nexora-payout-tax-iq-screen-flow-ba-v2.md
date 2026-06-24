<!-- Generated from nexora-payout-tax-iq-screen-flow-ba-v2.docx. Keep the DOCX as source of record when there is a discrepancy. -->

Nexora Touch

Payout Management + AI Tax IQ Sync

Business Analysis v2.0 — Screen Flow Document

Default market: Vietnamese-owned nail salons and beauty businesses in the U.S. Languages: Vietnamese-first, English, Spanish Powered by VLINKPAY

# 1. Executive Summary

This document defines the screen-by-screen flow for Nexora Touch Payout Management integrated with AI Tax IQ. The goal is to help salon owners pay technicians clearly, track tips, commission, bonuses, deductions, cash/check/Zelle/Venmo/Cash App payouts, and automatically sync finalized payout data into Tax IQ ledger for year-end CPA reporting.

This is not intended to replace a payroll provider in MVP. The first product value is Payout Ledger + Tax IQ Sync: owner pays technician, Nexora records the payout, AI Tax IQ organizes income/expense records, and the business can export CPA-ready reports.

| Product Layer | Purpose | MVP Priority |
| --- | --- | --- |
| Payout Management | Track pay periods, payout entries, tips, commission, bonuses, deductions, and payment methods. | Phase 1 |
| Tax IQ Ledger | Turn payout records into technician income and business labor expense ledgers. | Phase 1 |
| Tip Ledger | Import QR tips, cash tips, card tips, and manual tips by technician. | Phase 1.1 |
| Revenue Ledger | Track service, retail, membership, gift card, and other revenue categories. | Phase 1.1 |
| Receipt OCR | Capture receipts and suggest deduction categories. | Phase 1.2 |
| Mileage GPS | Track business miles for owners and technicians. | Phase 1.2 |
| AI Insights | Detect payout anomalies, top performers, unusual expenses, and tax estimate changes. | Phase 1.3 |

# 2. End-to-End Product Flow

| Stage | Flow | Result |
| --- | --- | --- |
| 1 | Owner creates technicians and worker classifications. | System knows 1099/W2/contractor/owner profile and default payout formula. |
| 2 | Owner creates pay period by location. | Draft pay period is created for weekly, bi-weekly, semi-monthly, monthly, or custom dates. |
| 3 | System imports or owner enters service sales, tips, commission, bonus, deductions, penalties, and payout method. | Draft payout entries exist for each technician. |
| 4 | Owner reviews totals and warnings. | Errors are resolved before finalization. |
| 5 | Owner finalizes pay period. | Pay period locks, payout receipts generate, audit log created. |
| 6 | System syncs finalized records to AI Tax IQ. | Technician income ledger and owner labor expense ledger are created. |
| 7 | Owner/technician/CPA exports reports. | CSV/PDF/CPA package can be generated for month, quarter, year, or technician. |

| Core Object | Description | Important Statuses |
| --- | --- | --- |
| Business / Location | One owner may manage one or many salons. | active, inactive |
| Technician | Worker profile with classification, default rate, payout method, and location membership. | active, inactive |
| Pay Period | Payroll/payout window for one location or business. | draft, review, owner_approved, finalized, paid, voided |
| Payout Entry | Line item per technician per pay period. | draft, review, finalized, paid, adjusted, voided |
| Tip Transaction | Tip from QR, cash, card, manual, or imported source. | pending, confirmed, synced, disputed |
| Tax IQ Ledger Entry | Tax tracking record generated from payout/revenue/receipt/mileage data. | active, adjusted, voided |
| Adjustment | Correction after finalization. | pending, approved, applied, rejected |

# 3. User Journey Overview

| User | Journey | Main Screens |
| --- | --- | --- |
| Owner | Set up salon, add technicians, create pay period, review payouts, finalize, export reports. | Dashboard, Technician List, Pay Period Detail, Review, Finalize, CPA Export |
| Manager | Prepare payout draft, review details, submit for owner approval. | Dashboard, Payout Entry, Review |
| Technician | View payout, tip, commission, receipt, year summary, Tax IQ income. | My Payouts, Payout Detail, My Tax IQ |
| CPA / Tax Partner | View owner-approved reports and export ledger data. | CPA Portal, Business Ledger, Technician Summary, Export Center |
| Admin | Configure categories, audit logs, role permissions, and system settings. | Admin Settings, Audit Logs, Category Mapping |

# 4. Screen Inventory

| # | Screen Name | Role | Purpose |
| --- | --- | --- | --- |
| 01 | Onboarding / Business Setup | Owner | Create business, location, language, tax preferences. |
| 02 | Owner Dashboard | Owner / Manager | See payroll, payout, tip, Tax IQ, and alert overview. |
| 03 | Location Switcher | Owner / Manager | Switch location or view all locations. |
| 04 | Technician List | Owner / Manager | Manage technicians and worker classification. |
| 05 | Technician Profile | Owner / Manager | Set worker type, rates, default payout method, and permissions. |
| 06 | Create Pay Period | Owner / Manager | Open a new pay period by date and location. |
| 07 | Pay Period Detail | Owner / Manager | View all payout entries and period totals. |
| 08 | Add/Edit Payout Entry | Owner / Manager | Enter payout details for one technician. |
| 09 | Formula Builder | Owner | Configure compensation formulas. |
| 10 | Tip Ledger | Owner / Manager | View/import QR, cash, card, and manual tips. |
| 11 | Revenue Ledger | Owner / Manager | Track service, retail, membership, gift card revenue. |
| 12 | Payroll Review | Owner / Manager | Review totals and warnings before finalization. |
| 13 | Owner Approval | Owner | Approve or reject payroll prepared by manager. |
| 14 | Finalize Payroll | Owner | Lock period, generate receipts, sync Tax IQ. |
| 15 | Payout Receipt Preview | Owner / Technician | View technician payout summary. |
| 16 | Adjustment Entry | Owner | Correct finalized payout with audit log. |
| 17 | Tax IQ Sync Status | Owner / Admin | Verify ledger sync and retry errors. |
| 18 | Tax IQ Ledger | Owner / CPA | View tax records from payout, receipt, mileage, revenue. |
| 19 | Receipt OCR Capture | Owner / Technician | Upload receipt and AI categorizes expense. |
| 20 | Mileage Tracker | Owner / Technician | Record business miles and purpose. |
| 21 | Tax Estimate Dashboard | Owner / Technician | Estimate tax picture and quarterly planning. |
| 22 | CPA Export Center | Owner / CPA | Export CSV/PDF packages. |
| 23 | Technician Portal — My Payouts | Technician | View own payouts and year-to-date income. |
| 24 | Technician Portal — Payout Detail | Technician | View detailed payout receipt. |
| 25 | Technician Portal — My Tax IQ | Technician | View 1099/tip/mileage/expense summary. |
| 26 | Admin Config | Admin | Configure categories, payment methods, formulas. |
| 27 | Audit Log | Owner / Admin | Track every change to finalized records. |

## 01. Onboarding / Business Setup

| Item | Detail |
| --- | --- |
| Primary role | Owner |
| Screen goal | Create the salon business profile and tax settings before payout can be used. |
| Entry point | Signup or first access to Nexora Payroll. |
| Data output | business, business_location, owner settings |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Owner enters business name and industry. | System creates business record. |
| 2 | Owner adds first location. | System creates business location and timezone. |
| 3 | Owner chooses language preference. | System sets default UI language: Vietnamese, English, or Spanish. |
| 4 | Owner selects tax tracking preference. | System enables Tax IQ ledger for payout sync. |
| 5 | Owner completes setup. | System routes to Owner Dashboard. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Business name | Legal/display name of salon. | Yes |
| Location address | Used for payroll, reports, and mileage reference. | Yes |
| Timezone | Used for pay periods and reports. | Yes |
| Default language | VI/EN/ES. | Yes |
| Enable Tax IQ sync | Turns on ledger mapping. | Yes |

| Action | Result |
| --- | --- |
| Save setup | Create business and go to dashboard |
| Add another location | Create additional location |
| Skip Tax IQ | Allowed but shows warning |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Business name missing | Show: Business name is required. |
| No location | Show: Add at least one location to start payroll. |
| Tax IQ disabled | Show: Payout will not sync to tax ledger until enabled. |

| Acceptance Criteria |
| --- |
| Owner can complete onboarding in less than 5 minutes. |
| Business and location records are created. |
| Tax IQ sync flag is stored. |

## 02. Owner Dashboard

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Show the current operational picture for payroll, payout, tips, and Tax IQ readiness. |
| Entry point | After login or after onboarding. |
| Data output | dashboard metrics and routing |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens dashboard. | System loads current location or all-location summary. |
| 2 | User reviews open pay period. | System displays status, totals, and warnings. |
| 3 | User clicks Create Pay Period or Continue Review. | System routes to pay period flow. |
| 4 | User checks Tax IQ alerts. | System displays missing receipt, sync errors, or CPA export reminders. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Current pay period card | Shows date range and status. | Yes |
| Payroll total | Total projected net payout. | No |
| Tips tracked | Total tips imported/entered. | No |
| Tax IQ readiness | Percent of clean records. | No |
| Alerts | Missing data, sync failures, pending approval. | No |

| Action | Result |
| --- | --- |
| Create Pay Period | Open screen 06 |
| Review Payroll | Open screen 12 |
| View Tax IQ | Open screen 18 |
| Export CPA Report | Open screen 22 |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| No pay period exists | Show empty state with Create Pay Period CTA. |
| Manager role | Hide finalize button unless permission exists. |
| Sync errors | Show warning banner. |

| Acceptance Criteria |
| --- |
| Dashboard shows pay period status and key totals. |
| Owner can navigate to payroll, Tax IQ, and export center. |
| Manager sees only allowed actions. |

## 03. Location Switcher

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Allow multi-location owners to view one location or all locations. |
| Entry point | Header dropdown, dashboard filter, report filters. |
| Data output | selected location scope |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User clicks location switcher. | System lists accessible locations. |
| 2 | User selects one location or All Locations. | System refreshes data scope. |
| 3 | User creates pay period from selected location. | System pre-fills location field. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Location list | Locations user can access. | Yes |
| All locations option | Aggregated dashboard and reports. | No |
| Location status | Active/inactive location visibility. | No |

| Action | Result |
| --- | --- |
| Select location | Refresh current screen |
| Manage locations | Open settings |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| No access to location | Hide location from list. |
| Inactive location | Read-only unless owner reactivates. |

| Acceptance Criteria |
| --- |
| Selection persists during session. |
| Reports and pay periods use selected location context. |

## 04. Technician List

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Manage all technicians and their payout readiness. |
| Entry point | Dashboard or side navigation. |
| Data output | technician records |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens Technician List. | System loads active technicians by location. |
| 2 | User searches/filter by role/status. | System updates list. |
| 3 | User clicks Add Technician. | System opens Technician Profile create mode. |
| 4 | User clicks a technician. | System opens profile detail. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Name | Technician display name. | Yes |
| Worker type | 1099, W2, contractor, owner, other. | Yes |
| Default rate | Commission/hourly/guarantee default. | No |
| Default payment method | Cash/check/Zelle/etc. | No |
| Tax IQ status | Ready/missing info. | No |

| Action | Result |
| --- | --- |
| Add Technician | Open screen 05 create mode |
| Import CSV | Bulk create technicians |
| Deactivate | Set inactive status |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Missing worker type | Show warning: worker classification required before payout finalization. |
| Duplicate phone/email | Warn but allow if owner confirms. |

| Acceptance Criteria |
| --- |
| Owner can add and find technicians. |
| Each technician shows payout readiness. |
| Inactive technicians are not included by default. |

## 05. Technician Profile

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Store worker classification, rates, payout method, and portal access. |
| Entry point | Create or edit technician. |
| Data output | technician profile and default formula settings |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User enters personal/contact info. | System validates fields. |
| 2 | User selects worker type. | System sets Tax IQ mapping. |
| 3 | User sets compensation defaults. | System stores default payout formula inputs. |
| 4 | User sets portal access. | System sends invite if enabled. |
| 5 | User saves profile. | System updates technician readiness status. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Full name | Displayed on payout receipts. | Yes |
| Phone/email | Portal invite and contact. | One required |
| Worker type | Tax and payout mapping. | Yes |
| Default commission rate | Pre-fills payout entry. | Conditional |
| Hourly rate | Pre-fills hourly payout. | Conditional |
| Guaranteed pay | Pre-fills bao/guarantee. | Conditional |
| Default payment method | Pre-fills payout entry. | No |
| Locations | Where technician works. | Yes |

| Action | Result |
| --- | --- |
| Save | Create/update technician |
| Send invite | Create technician portal invite |
| Deactivate | Stop future payouts |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Worker type missing | Block payout finalization later. |
| Rate missing | Allow, but show warning on payout entry. |
| Technician assigned to no location | Require at least one location. |

| Acceptance Criteria |
| --- |
| Profile can be saved with required fields. |
| Tax IQ mapping is determined by worker type. |
| Defaults populate payout entries. |

## 06. Create Pay Period

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Create a payout period for one location and date range. |
| Entry point | Dashboard CTA or Payroll menu. |
| Data output | pay_period and optional draft payout entries |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User selects location. | System loads last period and recommended next dates. |
| 2 | User selects period type and dates. | System validates no duplicate period. |
| 3 | User chooses workers to include. | System creates draft payout entries if requested. |
| 4 | User creates period. | System routes to Pay Period Detail. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Location | Payroll scope. | Yes |
| Period type | Weekly/biweekly/monthly/custom. | Yes |
| Start date | Pay period start. | Yes |
| End date | Pay period end. | Yes |
| Include technicians | Create entries for selected active workers. | Yes |

| Action | Result |
| --- | --- |
| Create | Create draft pay period |
| Auto-fill from last period | Copy prior period structure |
| Cancel | Return dashboard |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Overlapping pay period | Block unless owner confirms as custom exception. |
| End before start | Block. |
| No technicians selected | Warn and allow empty draft. |

| Acceptance Criteria |
| --- |
| Owner can create weekly/biweekly/custom periods. |
| System prevents accidental duplicate periods. |
| Draft status is set. |

## 07. Pay Period Detail

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | View and manage payout entries inside one pay period. |
| Entry point | After creating/opening pay period. |
| Data output | updated pay period totals and entry list |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens pay period. | System shows summary totals and entry table. |
| 2 | User adds/edits payout entry. | System recalculates period totals. |
| 3 | User imports tips/revenue if available. | System maps to technicians. |
| 4 | User moves period to review. | System runs validation checklist. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Period status | Draft/review/approved/finalized. | Yes |
| Entry table | One row per technician. | Yes |
| Totals panel | Gross, tips, commission, bonus, deductions, net. | Yes |
| Warnings panel | Missing fields or errors. | No |

| Action | Result |
| --- | --- |
| Add entry | Open screen 08 |
| Import tips | Open Tip Ledger |
| Move to review | Run validation and status review |
| Export draft | CSV preview |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Finalized period | Read-only; show adjustment button. |
| Missing worker type | Warning. |
| Net payout negative | Warning and require confirmation. |

| Acceptance Criteria |
| --- |
| Totals update after changes. |
| Draft can move to review only when required fields pass validation. |
| Finalized period cannot be edited. |

## 08. Add/Edit Payout Entry

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Enter or edit payout details for one technician. |
| Entry point | Pay Period Detail row action. |
| Data output | payout_entry |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User selects technician. | System pre-fills worker type and default formula. |
| 2 | User enters sales, tips, hours, rate, bonus, deductions. | System calculates net payout live. |
| 3 | User selects payment method and paid date. | System validates payout readiness. |
| 4 | User saves entry. | System updates pay period totals. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Technician | Worker receiving payout. | Yes |
| Worker type | Tax mapping. | Yes |
| Compensation type | Commission/hourly/guarantee/hybrid/manual. | Yes |
| Gross service sales | Sales base for commission. | Conditional |
| Tips | Tips included in payout. | No |
| Commission rate/amount | Commission calculation. | Conditional |
| Hours/hourly rate | Hourly calculation. | Conditional |
| Guaranteed pay | Bao/guarantee calculation. | Conditional |
| Bonus | Added to payout. | No |
| Deductions/penalties | Subtracted from payout. | No |
| Payment method | Cash/check/Zelle/etc. | Yes |
| Paid date | Date payment is/will be made. | Yes |

| Action | Result |
| --- | --- |
| Calculate | Refresh net payout |
| Save draft | Save entry |
| Attach proof | Upload receipt/proof |
| Delete draft | Remove if not finalized |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Missing required formula input | Show formula-specific error. |
| Payment method missing | Block finalization. |
| Finalized period | Disable editing. |
| Manual override | Require note. |

| Acceptance Criteria |
| --- |
| Net payout calculates correctly for each formula. |
| Manual override requires note. |
| Required fields block finalization if missing. |

## 09. Formula Builder

| Item | Detail |
| --- | --- |
| Primary role | Owner |
| Screen goal | Configure compensation formulas for different technicians or roles. |
| Entry point | Settings or technician profile. |
| Data output | compensation formula settings |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Owner chooses formula type. | System displays formula fields. |
| 2 | Owner configures rates and rules. | System previews calculation. |
| 3 | Owner saves formula as default. | System applies to future payout entries. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Formula name | Reusable formula label. | Yes |
| Compensation type | Commission/hourly/guarantee/hybrid. | Yes |
| Commission rate | Percent of service sales. | Conditional |
| Guarantee amount | Minimum pay. | Conditional |
| Penalty rules | Absence/late/custom deductions. | No |
| Bonus rules | Performance or manual bonuses. | No |

| Action | Result |
| --- | --- |
| Save formula | Create reusable formula |
| Preview | Show sample calculation |
| Assign technicians | Apply formula to selected workers |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Invalid percent | Must be 0-100%. |
| Hybrid without guarantee or commission | Block. |
| Assigned finalized entries | Do not retroactively change finalized payouts. |

| Acceptance Criteria |
| --- |
| Owner can create and assign formulas. |
| Formula preview matches payout entry calculation. |
| Finalized history remains unchanged. |

## 10. Tip Ledger

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Track tips by source and technician before payout sync. |
| Entry point | Payroll menu or imported from QR Tip. |
| Data output | tip_transactions and payout tip amounts |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens Tip Ledger. | System shows tips by date, source, technician, method. |
| 2 | User filters by pay period. | System shows tips eligible for payout. |
| 3 | User maps unmapped tips. | System assigns technician or location. |
| 4 | User imports tips into pay period. | System updates payout entries. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Tip date | Transaction date. | Yes |
| Technician | Tip recipient. | Yes |
| Amount | Tip amount. | Yes |
| Source | QR/cash/card/manual/import. | Yes |
| Payment method | Payment rail. | No |
| Status | pending/confirmed/synced/disputed. | Yes |

| Action | Result |
| --- | --- |
| Import to payroll | Add confirmed tips to payout entries |
| Map technician | Assign missing technician |
| Dispute tip | Mark as disputed |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Unmapped tip | Cannot sync into payout until mapped. |
| Duplicate tip | Warn by same amount/time/source. |
| Disputed tip | Exclude from payout by default. |

| Acceptance Criteria |
| --- |
| QR tips can feed payout entries. |
| Unmapped tips are flagged. |
| Disputed tips do not affect net payout unless owner includes. |

## 11. Revenue Ledger

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Track business revenue sources for Tax IQ owner view. |
| Entry point | Tax IQ or Payroll menu. |
| Data output | revenue ledger and Tax IQ revenue entries |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens Revenue Ledger. | System shows service, retail, membership, gift card, other revenue. |
| 2 | User imports POS or manual revenue. | System creates revenue records. |
| 3 | User maps revenue to location/category. | System updates Tax IQ business view. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Revenue date | Date earned. | Yes |
| Revenue category | Service/retail/membership/gift card/other. | Yes |
| Amount | Gross amount. | Yes |
| Location | Business location. | Yes |
| Source | POS/manual/import/VLINKPAY. | Yes |

| Action | Result |
| --- | --- |
| Add revenue | Create manual entry |
| Import CSV | Bulk revenue upload |
| Sync Tax IQ | Create revenue ledger entries |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Missing category | Block Tax IQ sync. |
| Negative revenue | Require note. |
| Duplicate import | Warn. |

| Acceptance Criteria |
| --- |
| Owner can categorize revenue. |
| Revenue supports profit/loss and tax estimate. |
| Multi-location reports separate revenue correctly. |

## 12. Payroll Review

| Item | Detail |
| --- | --- |
| Primary role | Owner / Manager |
| Screen goal | Review pay period before owner approval/finalization. |
| Entry point | Pay Period Detail > Review. |
| Data output | review status and validation checklist |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens review. | System runs validation rules. |
| 2 | User reviews totals by technician. | System highlights missing data and unusual amounts. |
| 3 | Manager submits to owner or owner approves. | System moves to next status. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Totals by category | Sales/tip/commission/bonus/deductions/net. | Yes |
| Warnings | Missing fields, anomalies, duplicates. | No |
| Approval note | Reason/context for approval. | No |
| Ready indicator | Can finalize or not. | Yes |

| Action | Result |
| --- | --- |
| Submit for approval | Status owner_approval_pending |
| Approve | Status owner_approved |
| Return to draft | Status draft with note |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Required warnings exist | Block finalization. |
| Manager tries approve as owner | Block unless permission. |
| Large manual override | Require note. |

| Acceptance Criteria |
| --- |
| System blocks finalization if required data missing. |
| Owner/manager can see clear totals. |
| Approval notes are stored. |

## 13. Owner Approval

| Item | Detail |
| --- | --- |
| Primary role | Owner |
| Screen goal | Approve payroll prepared by manager before finalization. |
| Entry point | Review screen or approval notification. |
| Data output | owner approval status |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Owner opens approval queue. | System shows pending periods. |
| 2 | Owner reviews details and manager notes. | System displays differences from previous period. |
| 3 | Owner approves or rejects. | System updates status and audit log. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Pending pay period | Period awaiting owner action. | Yes |
| Manager note | Context for submitted payroll. | No |
| Variance summary | Change vs last period. | No |
| Owner approval note | Reason/approval note. | No |

| Action | Result |
| --- | --- |
| Approve | Allow finalization |
| Reject | Return to draft/review |
| Request change | Create task/comment |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Owner role required | Only owner/admin can approve. |
| Rejected period | Must include reason. |

| Acceptance Criteria |
| --- |
| Owner can approve/reject with audit trail. |
| Approved periods can proceed to finalize. |
| Rejected periods return to draft/review. |

## 14. Finalize Payroll

| Item | Detail |
| --- | --- |
| Primary role | Owner |
| Screen goal | Lock payroll, generate receipts, and sync to Tax IQ. |
| Entry point | Owner Approval or Payroll Review. |
| Data output | locked pay_period, payout_receipts, tax_iq_ledger entries, audit logs |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Owner clicks Finalize. | System shows final confirmation and summary. |
| 2 | Owner confirms. | System validates idempotency and locks period. |
| 3 | System generates payout receipts. | Receipt records/files are created. |
| 4 | System syncs to Tax IQ. | Technician income and business expense ledger entries created. |
| 5 | System shows success page. | Owner can export or notify technicians. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Final totals | Gross, tip, commission, net payout. | Yes |
| Confirmation checkbox | Owner acknowledges lock. | Yes |
| Notify technicians | Optional send portal/SMS/email. | No |
| Sync Tax IQ now | Default yes. | Yes |

| Action | Result |
| --- | --- |
| Finalize | Lock period and run jobs |
| Finalize without notification | Lock but do not notify |
| Cancel | Return review |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Validation failed | Block and show checklist. |
| Already finalized | Do not duplicate Tax IQ ledger. |
| Tax IQ sync failure | Period remains finalized; sync status shows failed/retry. |

| Acceptance Criteria |
| --- |
| Finalization is idempotent. |
| Payout entries become read-only. |
| Receipts generate for each technician. |
| Tax IQ ledger entries are created or retryable. |

## 15. Payout Receipt Preview

| Item | Detail |
| --- | --- |
| Primary role | Owner / Technician |
| Screen goal | Show a clean payout summary for technician transparency. |
| Entry point | After finalization, technician portal, receipt link. |
| Data output | payout receipt PDF/JSON |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens receipt. | System loads finalized payout entry. |
| 2 | User reviews line items. | System displays service sales, tips, commission, bonus, deductions, net payout. |
| 3 | User downloads or shares receipt. | System generates PDF/CSV. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Receipt number | Unique reference. | Yes |
| Technician info | Name and worker type. | Yes |
| Pay period dates | Date range. | Yes |
| Line items | Sales, tips, commission, bonus, deductions, net. | Yes |
| Payment method/paid date | How payment was made. | Yes |
| Disclaimer | Not tax filing document unless CPA confirms. | Yes |

| Action | Result |
| --- | --- |
| Download PDF | Generate receipt PDF |
| Send to technician | Notify technician |
| Open Tax IQ | View ledger mapping |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Draft payout | Receipt preview watermark: Draft. |
| Finalized receipt | Read-only. |
| Adjusted payout | Show adjustment history. |

| Acceptance Criteria |
| --- |
| Receipt is readable and clear. |
| Technician sees only own receipts. |
| Adjusted receipts show adjustment trail. |

## 16. Adjustment Entry

| Item | Detail |
| --- | --- |
| Primary role | Owner |
| Screen goal | Correct finalized payout without editing original record. |
| Entry point | Finalized pay period or payout detail. |
| Data output | payout_adjustment and tax_iq adjustment ledger |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Owner opens adjustment. | System loads original payout. |
| 2 | Owner selects adjustment type and amount. | System calculates adjusted net impact. |
| 3 | Owner enters reason. | System requires note. |
| 4 | Owner submits adjustment. | System creates adjustment and Tax IQ adjustment ledger. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Original payout | Reference entry. | Yes |
| Adjustment type | Correction/bonus/deduction/penalty/tip/manual. | Yes |
| Amount | Positive or negative adjustment. | Yes |
| Reason | Audit note. | Yes |
| Apply to Tax IQ | Sync adjustment ledger. | Yes |

| Action | Result |
| --- | --- |
| Submit adjustment | Create adjustment record |
| Preview impact | Show updated net payout |
| Void adjustment | Only if not applied or with audit. |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Missing reason | Block. |
| Adjustment creates negative total | Require confirmation. |
| No owner permission | Block. |

| Acceptance Criteria |
| --- |
| Original record remains unchanged. |
| Adjustment has audit log. |
| Tax IQ reflects adjustment. |

## 17. Tax IQ Sync Status

| Item | Detail |
| --- | --- |
| Primary role | Owner / Admin |
| Screen goal | Monitor sync between Payout Management and Tax IQ Ledger. |
| Entry point | Finalize success page, Tax IQ menu. |
| Data output | sync job status and tax_iq_ledger records |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens sync status. | System lists sync jobs and statuses. |
| 2 | User reviews failed records. | System shows error reason. |
| 3 | User clicks retry. | System re-runs idempotent sync. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Sync job ID | Batch reference. | Yes |
| Source type | Payout/tip/revenue/receipt/mileage. | Yes |
| Status | pending/success/failed/retry. | Yes |
| Error message | Failure reason. | Conditional |
| Retry count | Number of attempts. | No |

| Action | Result |
| --- | --- |
| Retry failed | Re-run sync |
| Open source | Navigate to payout/revenue record |
| Export errors | Download list |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Duplicate source | Do not create duplicate ledger entry. |
| Permission | Only owner/admin can retry. |

| Acceptance Criteria |
| --- |
| Failed syncs are visible. |
| Retry is idempotent. |
| Owner can trace ledger to source. |

## 18. Tax IQ Ledger

| Item | Detail |
| --- | --- |
| Primary role | Owner / CPA |
| Screen goal | Central tax ledger from payout, revenue, receipt, mileage, and adjustments. |
| Entry point | Tax IQ menu. |
| Data output | tax_iq_ledger export and detail view |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens ledger. | System loads records by business/location/date. |
| 2 | User filters by category/source/worker. | System updates ledger table. |
| 3 | User opens a ledger entry. | System shows source detail and attachments. |
| 4 | User exports ledger. | System generates CSV/PDF. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Date | Ledger transaction date. | Yes |
| Source | nexora_payout/receipt/mileage/revenue/etc. | Yes |
| Ledger type | Income/expense/tip/payout/etc. | Yes |
| Tax category | CPA review category. | Yes |
| Amount | Ledger amount. | Yes |
| Source link | Traceability to original record. | Yes |

| Action | Result |
| --- | --- |
| Filter | Update table |
| Open source | Trace original record |
| Export | Generate report |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Missing category | Flag as needs review. |
| Voided source | Show voided status. |
| CPA role | Read-only access. |

| Acceptance Criteria |
| --- |
| Ledger is traceable to source records. |
| CPA can export read-only data. |
| Owner sees category readiness. |

## 19. Receipt OCR Capture

| Item | Detail |
| --- | --- |
| Primary role | Owner / Technician |
| Screen goal | Capture receipts and suggest tax categories. |
| Entry point | Tax IQ menu or mobile capture. |
| Data output | receipt record and Tax IQ expense ledger |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User uploads or takes receipt photo. | System stores file and starts OCR. |
| 2 | AI extracts vendor, date, amount, tax, category. | System shows review screen. |
| 3 | User confirms or edits category. | System creates receipt and Tax IQ expense ledger. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Receipt image | Proof file. | Yes |
| Vendor | Merchant name. | AI suggested |
| Date | Transaction date. | AI suggested |
| Amount | Receipt total. | AI suggested |
| Category | Deduction category. | User confirmed |
| Business purpose | Reason for expense. | Recommended |

| Action | Result |
| --- | --- |
| Upload | Start OCR |
| Confirm | Create ledger |
| Edit category | Override AI suggestion |
| Attach to payout | Link receipt to payout if relevant |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| OCR confidence low | Require user review. |
| Amount missing | Require manual entry. |
| Duplicate receipt | Warn. |

| Acceptance Criteria |
| --- |
| AI can prefill receipt data. |
| User confirms before ledger sync. |
| Receipt is attached to ledger entry. |

## 20. Mileage Tracker

| Item | Detail |
| --- | --- |
| Primary role | Owner / Technician |
| Screen goal | Track business miles and purpose for Tax IQ. |
| Entry point | Tax IQ mobile or dashboard. |
| Data output | mileage_trip and Tax IQ mileage ledger |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User starts trip or enters trip manually. | System records start location/time. |
| 2 | User stops trip. | System calculates distance. |
| 3 | User selects business purpose. | System maps mileage category. |
| 4 | User saves trip. | System creates mileage ledger. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Start location/time | Trip beginning. | Yes |
| End location/time | Trip end. | Yes |
| Miles | Calculated or manual. | Yes |
| Purpose | Supply purchase/bank/client/vendor/meeting/other. | Yes |
| Vehicle | Optional vehicle profile. | No |
| Notes | Context. | No |

| Action | Result |
| --- | --- |
| Start GPS | Begin tracking |
| Stop GPS | End tracking |
| Manual trip | Enter miles manually |
| Save | Create ledger |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| No purpose | Require purpose before Tax IQ sync. |
| Unrealistic miles | Warn. |
| GPS unavailable | Allow manual entry. |

| Acceptance Criteria |
| --- |
| Mileage has purpose and date. |
| Manual and GPS trips supported. |
| Trips can export for CPA. |

## 21. Tax Estimate Dashboard

| Item | Detail |
| --- | --- |
| Primary role | Owner / Technician |
| Screen goal | Give an estimated tax picture for planning, not official filing. |
| Entry point | Tax IQ menu. |
| Data output | tax estimate summary |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens estimate. | System aggregates income, expenses, mileage, payout data. |
| 2 | User selects filing profile assumptions. | System calculates rough estimate. |
| 3 | User reviews quarterly suggestion. | System shows disclaimer and CPA call-to-action. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| YTD income | Income from ledger. | Yes |
| YTD expenses | Expenses from ledger. | Yes |
| Mileage deduction estimate | Mileage ledger estimate. | No |
| Tax profile assumptions | Single/married/1099/W2/etc. | User input |
| Estimated tax | Planning estimate. | Calculated |

| Action | Result |
| --- | --- |
| Refresh estimate | Recalculate |
| Export summary | Export planning report |
| Share with CPA | Generate CPA link/report |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Insufficient data | Show low-confidence warning. |
| No CPA review | Show tax advice disclaimer. |

| Acceptance Criteria |
| --- |
| Estimate is clearly labeled not tax advice. |
| User can export data to CPA. |
| Confidence level is shown. |

## 22. CPA Export Center

| Item | Detail |
| --- | --- |
| Primary role | Owner / CPA |
| Screen goal | Export CPA-ready reports by business, technician, category, and period. |
| Entry point | Tax IQ menu. |
| Data output | CPA export files and audit log |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User selects report type. | System displays available filters. |
| 2 | User chooses year/quarter/month and scope. | System builds export preview. |
| 3 | User exports CSV/PDF package. | System logs export and creates file. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Report type | Business summary, technician summary, payout ledger, receipt package, mileage report. | Yes |
| Date range | Year/quarter/month/custom. | Yes |
| Location scope | One/all locations. | Yes |
| File format | CSV/PDF/XLSX later. | Yes |
| CPA access | Optional share permission. | No |

| Action | Result |
| --- | --- |
| Export CSV | Generate CSV |
| Export PDF | Generate PDF summary |
| Share CPA link | Create read-only access |
| Download package | Zip reports and receipts |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| No records | Show empty report warning. |
| CPA role | Only export allowed records. |
| Export contains sensitive data | Log export event. |

| Acceptance Criteria |
| --- |
| Exports can be generated by year and technician. |
| All exports are logged. |
| CPA access is read-only. |

## 23. Technician Portal — My Payouts

| Item | Detail |
| --- | --- |
| Primary role | Technician |
| Screen goal | Let technician view own payout history and year-to-date income. |
| Entry point | Technician login or payout notification link. |
| Data output | technician payout list |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Technician logs in. | System loads only their own payouts. |
| 2 | Technician filters by period/year. | System updates list. |
| 3 | Technician opens payout detail. | System routes to receipt detail. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Pay period | Date range. | Yes |
| Net payout | Final amount. | Yes |
| Tips | Tips included. | No |
| Status | Finalized/paid/adjusted. | Yes |
| Download receipt | PDF link. | No |

| Action | Result |
| --- | --- |
| Open detail | View screen 24 |
| Download receipt | Generate PDF |
| View Tax IQ | Open screen 25 |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Unauthorized technician | Cannot view other workers. |
| Draft payout | Hidden unless owner shares preview. |

| Acceptance Criteria |
| --- |
| Technician sees only own records. |
| Receipts downloadable after finalization. |
| YTD totals shown. |

## 24. Technician Portal — Payout Detail

| Item | Detail |
| --- | --- |
| Primary role | Technician |
| Screen goal | Show detailed payout receipt for one period. |
| Entry point | My Payouts row click. |
| Data output | technician payout detail |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Technician opens payout. | System loads finalized payout entry and receipt. |
| 2 | Technician reviews line items. | System shows sales, tips, commission, bonus, deduction, net. |
| 3 | Technician downloads receipt or asks question. | System logs download or creates support request. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Pay period | Period date range. | Yes |
| Service sales | Base sales if shared. | Configurable |
| Tips | Tips for period. | Yes |
| Commission/Hourly/Guarantee | Pay calculation. | Yes |
| Bonus/deductions | Adjustments. | No |
| Net payout | Final payout. | Yes |

| Action | Result |
| --- | --- |
| Download | PDF receipt |
| Ask question | Create owner message/support ticket |
| View year summary | Open Tax IQ summary |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Owner hides sales details | Show only payout components allowed by settings. |
| Adjusted payout | Show adjustment line. |

| Acceptance Criteria |
| --- |
| Line items are clear. |
| Access is permission scoped. |
| Technician can download receipt. |

## 25. Technician Portal — My Tax IQ

| Item | Detail |
| --- | --- |
| Primary role | Technician |
| Screen goal | Show technician income/tip/mileage/expense summary for personal tax preparation. |
| Entry point | Technician portal. |
| Data output | technician tax summary and export |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Technician opens My Tax IQ. | System aggregates technician ledger. |
| 2 | Technician reviews income, tips, mileage, receipts. | System shows YTD summary. |
| 3 | Technician exports report. | System creates personal report. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| YTD income | Payout income ledger. | Yes |
| YTD tips | Tip ledger. | No |
| Mileage | Business miles. | No |
| Expenses/receipts | Technician-uploaded deductions. | No |
| CPA export | Download/share report. | No |

| Action | Result |
| --- | --- |
| Upload receipt | Open OCR capture |
| Add mileage | Open mileage tracker |
| Export | Download report |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| No Tax IQ records | Show empty state and education. |
| Tax disclaimer | Always visible. |

| Acceptance Criteria |
| --- |
| Technician can view year summary. |
| Technician can add receipts/mileage. |
| System includes tax disclaimer. |

## 26. Admin Config

| Item | Detail |
| --- | --- |
| Primary role | Admin |
| Screen goal | Configure categories, payment methods, permissions, and default rules. |
| Entry point | Admin settings. |
| Data output | system configuration |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | Admin opens settings. | System loads configurable options. |
| 2 | Admin edits category mappings or payment methods. | System validates and saves settings. |
| 3 | Admin configures role permissions. | System updates access control. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Payment methods | Allowed payout methods. | Yes |
| Tax categories | Ledger mapping categories. | Yes |
| Compensation templates | Default formulas. | No |
| Role permissions | Owner/manager/tech/CPA/admin. | Yes |
| Languages | VI/EN/ES labels. | No |

| Action | Result |
| --- | --- |
| Save settings | Update configuration |
| Add category | Create mapping |
| Disable method | Hide method from future entries |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Used category deleted | Block; allow deactivate only. |
| Permission conflict | Warn. |

| Acceptance Criteria |
| --- |
| Admin can configure mapping without code changes. |
| Historical data remains stable. |
| Role permissions are enforced. |

## 27. Audit Log

| Item | Detail |
| --- | --- |
| Primary role | Owner / Admin |
| Screen goal | Track changes to sensitive payout and tax records. |
| Entry point | Admin or detail pages. |
| Data output | audit log entries |

| Step | User action | System behavior |
| --- | --- | --- |
| 1 | User opens audit log. | System lists events by date/action/entity. |
| 2 | User filters by pay period/technician/user. | System updates list. |
| 3 | User opens event detail. | System shows before/after data. |

| Field / Component | Purpose | Required? |
| --- | --- | --- |
| Actor | Who performed action. | Yes |
| Action | Created/updated/finalized/adjusted/exported. | Yes |
| Entity | Pay period/payout/ledger/etc. | Yes |
| Before/after | Change snapshot. | Conditional |
| Timestamp | When action occurred. | Yes |

| Action | Result |
| --- | --- |
| Filter | Update log |
| Export audit | Download audit CSV |
| Open entity | Navigate to source record |

| Validation / Business Rule | Message / Expected behavior |
| --- | --- |
| Sensitive export | Always log. |
| Finalized changes | Must use adjustment; audit required. |

| Acceptance Criteria |
| --- |
| All finalization, adjustment, export actions are logged. |
| Owner/admin can trace changes. |
| Technicians cannot access audit logs. |

# 6. Required Business Rules

| Rule ID | Rule | Expected System Behavior |
| --- | --- | --- |
| BR-001 | Finalized pay periods are locked. | Disable direct edit and require adjustment entries. |
| BR-002 | Tax IQ sync is idempotent. | Use unique key source + source_id + ledger_type to prevent duplicates. |
| BR-003 | Worker type is required. | Block finalization if worker type is missing. |
| BR-004 | Payment method and paid date are required. | Block finalization if missing. |
| BR-005 | Manual override requires note. | Do not allow unexplained manual net payout overrides. |
| BR-006 | Manager cannot finalize unless granted permission. | Role-based action visibility and backend enforcement. |
| BR-007 | Technicians can see only their own payouts. | Strict row-level access control. |
| BR-008 | CPA access is read-only. | CPA can view/export only records shared by owner. |
| BR-009 | Adjustments create new records, not edits. | Preserve original finalized payout and create adjustment ledger. |
| BR-010 | Tax disclaimer must appear in Tax IQ areas. | System does not provide official tax/legal advice. |

# 7. Data Mapping: Payout to Tax IQ

| Payout Source Field | Tax IQ Ledger Field | Notes |
| --- | --- | --- |
| payout_entry.id | source_id | Used for idempotency. |
| worker_type = 1099 | ledger_type = payout_income; tax_category = 1099_income | Technician income view. |
| worker_type = w2 | ledger_type = payroll_wage; tax_category = w2_wages | W2 wage view. |
| commission_amount | metadata.commission_amount | Detailed breakdown. |
| tips | metadata.tips | Separate tip reporting. |
| net_payout | amount | Main ledger amount. |
| business_id/location_id | business/location scope | Multi-location reporting. |
| paid_date | transaction_date | Tax IQ date. |
| payment_method | metadata.payment_method | Cash/check/Zelle/etc. |

# 8. Dev Implementation Roadmap

| Sprint | Build Scope | Deliverable |
| --- | --- | --- |
| Sprint 1 | Business/location, technician profile, pay period, payout entry, calculation service. | Owner can create draft payout period and entries. |
| Sprint 2 | Review, owner approval, finalize, locking, payout receipt. | Owner can finalize and generate receipts. |
| Sprint 3 | Tax IQ ledger sync, idempotency, Tax IQ ledger screen, sync status. | Finalized payout creates ledger entries. |
| Sprint 4 | Technician portal, CPA export, audit logs, adjustment entries. | Technician/CPA reporting available. |
| Sprint 5 | Tip ledger and revenue ledger integration. | QR tips and business revenue feed into payout/Tax IQ. |
| Sprint 6 | Receipt OCR, mileage tracker, tax estimate dashboard, AI insights v1. | Tax IQ becomes daily operating tool. |

# 9. MVP Acceptance Checklist

| Acceptance Item |
| --- |
| Owner can create business, location, and technician profile. |
| Owner can create a pay period and add payout entries. |
| System calculates commission, hourly, guarantee, hybrid, and manual payouts. |
| System blocks finalization when required fields are missing. |
| Owner can review and finalize a pay period. |
| Finalized records are locked and require adjustment entries for corrections. |
| Payout receipts are generated per technician. |
| Finalized payouts sync to AI Tax IQ ledger without duplicates. |
| Owner can export CPA-ready reports. |
| Technician can view own payout history and receipt. |
| CPA can access shared read-only reports. |
| All finalization, adjustment, and export actions are logged. |

# 10. Notes for Design / UX Team

The UI should stay Vietnamese-first for the nail community. Use clear wording and avoid accounting jargon where possible. Each screen should have one primary CTA. For example: Create Pay Period, Add Payout, Review Payroll, Finalize, Sync Tax IQ, Export CPA Report.

Recommended visual hierarchy: Dashboard cards first, warnings second, detailed tables third. Use clear status chips: Draft, Review, Owner Approved, Finalized, Paid, Sync Failed, Synced, Adjusted.

Prepared for Brian Nguyen / Nexora Touch / VLINKPAY ecosystem. This document is a BA screen-flow specification for development planning and should be reviewed by product, dev, CPA/tax advisor, and compliance/legal before public launch.
