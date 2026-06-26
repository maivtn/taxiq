# Tax IQ Feature Description

Version: Phase 1 Demo  
Product: Nexora Touch / Tax IQ  
Market scope: U.S. payroll, payout, tax record keeping, CPA review, and merchant advisory  
Last updated: 2026-06-26

## 1. Feature Summary

Tax IQ là trung tâm quản lý dữ liệu thuế, chứng từ, payout, mileage, CPA review và AI guidance cho merchant. Mục tiêu của Tax IQ không phải thay thế CPA hay payroll provider, mà là gom dữ liệu quan trọng quanh năm để merchant và CPA có hồ sơ rõ ràng trước khi khai thuế.

Trong demo hiện tại, các module sau được đặt trong nhóm Tax IQ:

| Module | Purpose |
| --- | --- |
| Tax Ledger | Lưu ledger thuế, payout, payroll tax và hash/audit trail. |
| Exceptions | Theo dõi lỗi hoặc thiếu dữ liệu làm ảnh hưởng payroll/tax review. |
| Data Quality | Track missing profile data, evidence gaps, OCR issues, integration errors, and CPA readiness. |
| Jurisdictions | Quản lý phạm vi federal, state, local tax footprint. |
| Forms & Reports | Tạo report package cho payroll, 1099, CPA, year-end. |
| OCR Vault | Lưu bills, invoices, receipts, payout proof và AI extraction. |
| Share Links | Tạo link/QR cho CPA, technician, reviewer hoặc bên ngoài upload/review thông tin. |
| GPS Mileage | Theo dõi chuyến đi business và mileage deduction evidence. |
| CPA Review | Kết nối CPA/bookkeeper/tax preparer bên thứ ba để review và chuẩn bị tax filing package. |
| Tip Ledger | Track tips by method, source, proof, qualified status, and CPA export readiness. |
| Tax Estimate | Show estimated tax, quarterly estimate, deposit alerts, and CPA review prompts. |
| AI Advisor | AI CFO, rule watch, deduction checklist, financial/tax planning prompts. |

Supporting demo screens outside the Tax IQ group:

| Screen | Purpose |
| --- | --- |
| Onboarding | Guide first merchant setup, ICP fit, happy path, and empty-state acceptance criteria. |
| Connections | Manage payroll, HRIS, accounting, payout, and webhook-only integrations. |
| Audit Log | Review immutable action history for view, update, export, delete, and webhook events. |
| Notifications | Surface deposit alerts, exceptions, CPA requests, webhook failures, and tip cap warnings. |
| Compliance Review | Track legal, privacy, disclaimer, CPA handoff, API, and go-live readiness. |
| Billing & Plans | Show merchant subscription plans, CPA estimate approval, invoices, and partner API future path. |
| Settings | Manage role access, permission matrix, data protection, API keys, and notification preferences. |

## 2. Business Goals

- Giúp merchant không bị mất receipt, bill, payout proof, mileage log và dữ liệu cần cho CPA.
- Giúp CPA hoặc bookkeeper bên thứ ba review dữ liệu có cấu trúc thay vì hỏi thủ công cuối năm.
- Giúp merchant thấy rủi ro tax/payroll sớm: missing receipt, TIN pending, jurisdiction mismatch, payout evidence missing.
- Tạo CPA-ready package gồm ledger, receipts, payouts, mileage, payroll forms và audit log.
- Cho merchant xem trước chi phí CPA/bookkeeper trước khi kết nối, ví dụ giá mỗi giờ, số giờ dự kiến, retainer và tổng estimate.
- Cho người dùng có AI CFO để hỏi về cash flow, tax planning, missing records và câu hỏi nên hỏi CPA.
- Track daily tips and No Tax on Tips supporting records without making final tax eligibility claims.
- Show tax estimate and deposit reminders so owners can plan cash flow before deadlines.

## 3. Target Users

| User | Need |
| --- | --- |
| Merchant owner | Xem health của payroll/tax, lưu chứng từ, chia sẻ package cho CPA, duyệt trước khi export hoặc filing. |
| Payroll admin | Tạo payroll run, validate tax profile, theo dõi exceptions, finalize ledger. |
| Technician / worker | Upload payout proof, receipt, profile information, tip/mileage evidence qua secure link nếu được mời. |
| CPA / accountant / bookkeeper | Review read-only records, request missing files, comment, prepare filing support package. |
| Tax IQ admin | Theo dõi audit trail, connection health, webhook delivery, support issue. |

## 4. Core User Flow

1. Merchant hoặc admin tạo payroll/payout/tax records.
2. Tax IQ tạo ledger và phát hiện exceptions.
3. Merchant lưu receipt, invoice, payout proof qua OCR Vault.
4. Merchant tạo Share Link cho CPA, technician hoặc reviewer upload/review dữ liệu.
5. Merchant bật GPS Mileage để lưu business trip evidence.
6. Technician hoặc owner ghi nhận tips vào Tip Ledger nếu business có tip.
7. Tax Estimate hiển thị estimated tax, deposit due và quarterly review prompts.
8. AI Advisor nhắc thiếu dữ liệu, gợi ý deduction checklist và cash-flow/tax planning.
9. Merchant kết nối CPA/bookkeeper bên thứ ba.
10. Hệ thống hiển thị cost preview trước khi gửi invite: rate/hour, estimated hours, retainer, estimated total.
11. CPA review read-only data, comment, request missing evidence, prepare filing package.
12. Merchant approve export/share/final package before final filing action.

## 5. Screen Map

| Screen | Main Job |
| --- | --- |
| Dashboard | Tổng quan payroll, Tax IQ issues, feature widgets, onboarding, data quality, and compliance shortcuts. |
| Onboarding | First merchant setup, ICP fit, happy path, and empty-state acceptance criteria. |
| Tax Ledger | Xem immutable tax ledger records theo run, employee, jurisdiction, type, hash. |
| Exceptions | Queue các vấn đề cần xử lý trước payroll/tax review. |
| Data Quality | Aggregate missing TIN/W-4, receipt purpose, OCR confidence, connection/webhook errors, GPS review, and CPA missing evidence. |
| Jurisdictions | Quản lý federal, state, local tax setup và due dates. |
| Forms & Reports | Tạo CPA-ready report package theo period hoặc scope. |
| OCR Vault | Lưu và review receipt/bill/invoice/payment evidence. |
| Share Links | Tạo secure link/QR để upload hoặc review thông tin. |
| GPS Mileage | Lưu trip, route, mileage, business purpose, deduction candidate. |
| CPA Review | Kết nối CPA/accountant, xem giá estimate, share records, manage filing workflow. |
| Tip Ledger | Track tips, proof, method, source, qualified status, and No Tax on Tips reporting support. |
| Tax Estimate | Estimate annual/quarterly tax, jurisdiction balances, deposit alerts, and CPA review prompts. |
| AI Advisor | AI CFO, government rule watch, deduction checklist, guided help. |
| Connections | Manage external payroll, HRIS, accounting, payout, and webhook-only integrations. |
| Webhooks | Theo dõi outbound event delivery cho integration bên ngoài. |
| Audit Log | Review immutable actions across payroll, Tax IQ, tips, receipts, reports, and webhooks. |
| Notifications | Show deposit alerts, open exceptions, CPA requests, webhook dead letters, and tip cap warnings. |
| Compliance Review | Legal/privacy/disclaimer/CPA handoff/API go-live gate. |
| Billing & Plans | Merchant subscription, CPA cost approval, invoices, upgrade path, and partner API notes. |
| Settings | Role, permission matrix, security, data retention, PII/tokenization controls. |

## 6. Key Workflows And Modals

### Create Payroll Run

Purpose: tạo pay period, import line items, validate tax profile trước approval.

Data needed:

- Employer
- Pay schedule
- Period start/end
- Pay date
- Deposit due
- Payroll source
- Employee tax profile readiness

### Capture Receipt / Bill

Purpose: lưu bill, invoice, receipt hoặc payout proof trước khi bị mất. Current demo supports camera/file capture, local-browser OCR with Tesseract.js, extracted fields, raw OCR text, confidence review, batch approval and CPA export.

Data needed:

- Source: camera, file upload, email import, payout evidence
- Vendor/payee
- Amount
- Tax amount
- Date
- Receipt or invoice number
- Category
- Business purpose
- Original image/proof file
- OCR confidence
- Raw OCR text
- Processing status
- CPA package inclusion

Current OCR actions:

- Capture Receipt / Bill
- View Receipt Detail
- Edit Receipt
- Review low-confidence OCR fields
- Approve single receipt
- Batch approve high-confidence receipts
- Soft delete receipt
- Export vault to CPA package

### Create Share Link

Purpose: cho CPA, technician hoặc reviewer upload/review thông tin qua link hoặc QR.

Final business purpose: Share Links creates a temporary, scoped, auditable access path for people outside the main Tax IQ account. It lets external users upload missing documents or review selected records without receiving full system access.

Share Links is not the system of record. It is an intake/share channel. Uploaded or reviewed data should flow back into the correct Tax IQ module:

| Uploaded or reviewed information | Destination module |
| --- | --- |
| Receipt, bill, invoice | OCR Vault |
| Payout proof or payment screenshot | Payouts / OCR Vault |
| W-9, profile information, worker document | Employees / worker profile / CPA Review |
| CPA comment or missing-file request | CPA Review |
| Ledger or report package | Tax Ledger / Forms & Reports |

Access modes:

- Upload-only
- Review-only
- Review + upload

Controls:

- Expiration: 7 days, 15 days, 30 days, never
- Passcode
- Download permission
- Audit every open/upload
- Revoke link anytime
- Block full PII export unless merchant approves

### Start GPS Trip

Purpose: ghi lại mileage evidence cho business deduction review.

Final business purpose: save proof of a business route from point A to point B. User starts tracking at point A, stops at point B, and the system saves route, miles, start/end time, vehicle, business purpose and CPA review status.

Current demo flow:

1. User opens GPS Mileage and clicks Start Trip.
2. User enters Point A, Point B, vehicle, trip type, expected miles fallback and business purpose.
3. User clicks Start Tracking at Point A.
4. Browser records GPS points if location permission is granted.
5. User clicks Stop Trip at Point B & Save on arrival.
6. System adds a new trip to GPS Mileage Tracker.
7. If GPS permission is unavailable, system can still save Point A/Point B labels and expected miles fallback for CPA review.

Data needed:

- Vehicle
- Trip type
- Start/end location
- Start/end time
- Miles
- Business purpose
- GPS points / route A to B
- Expected miles fallback
- CPA policy review flag for ambiguous routes

### Connect CPA / Accountant

Purpose: kết nối CPA/bookkeeper/tax preparer bên thứ ba để review dữ liệu và chuẩn bị tax filing package cho merchant.

Data needed:

- Firm name
- Contact email
- Firm type: CPA firm, bookkeeper, tax preparer, enrolled agent
- License/PTIN info
- Engagement type
- Access duration
- Access scope
- Cost preview

Cost preview fields:

| Field | Example |
| --- | --- |
| Billing model | Hourly estimate |
| Hourly rate | $185/hr |
| Estimated hours | 3.5 |
| Estimated professional fee | $647.50 |
| Retainer due now | $250.00 |
| TaxIQ platform fee | $0.00 for demo |
| Merchant approval | Required before work starts |

### Ask AI CFO

Purpose: cho merchant hỏi AI về financial planning và tax readiness.

AI CFO can use:

- Payroll and tax ledger
- Receipt OCR vault
- GPS mileage
- CPA requests
- Open exceptions
- Upcoming tax deposit due dates

Example output:

- Reserve cash for upcoming federal/state tax deposits.
- Resolve missing receipt business purpose before CPA package export.
- Ask CPA whether a route is deductible or commute-like.
- Identify high-risk payout or worker classification questions.

### Add Tip

Purpose: ghi nhận tip theo ngày, method, source, proof, service và qualified review status.

Data needed:

- Tip amount
- Payment method
- Service type
- Source: cash, direct, POS owner paid
- Proof type
- Voluntary tip confirmation
- Service charge confirmation
- Qualified status
- Audit history

### Review Tax Estimate

Purpose: giúp owner xem estimated tax, quarterly estimate, deposit due và khoản cần CPA review.

Data needed:

- YTD income
- YTD withheld
- Estimated annual tax
- Estimated balance
- Quarterly estimate
- Jurisdiction breakdown
- Deposit schedule alerts
- CPA review status

### Manage Connections

Purpose: kết nối payroll, HRIS, accounting, payout hoặc webhook-only systems.

Data needed:

- System type
- Auth method
- Environment
- Scopes
- Webhook signing
- Retry policy
- Last sync

## 7. Permissions And Privacy

| Actor | Permission |
| --- | --- |
| Merchant owner | Full access, can connect CPA, approve export, approve share links. |
| Payroll admin | Manage payroll runs, employees, exceptions, reports. |
| CPA/accountant | Read-only by default; can comment and request missing files. |
| Technician/worker | Can upload or review only records shared with them. |
| External reviewer | Limited link-based access; expiration and audit required. |

Important rules:

- CPA cannot edit merchant source records directly.
- Full PII export requires merchant approval.
- Direct tips/private worker data should stay private unless worker/merchant grants access.
- Every view, upload, comment, request, export and package generation should be audit logged.
- Tax IQ provides record keeping and support data. Final tax filing judgment belongs to CPA/tax preparer.

## 8. Data Objects

| Object | Description |
| --- | --- |
| tax_ledger_entries | Immutable tax/payroll/payout ledger records. |
| exceptions | Blocking or warning items requiring review. |
| receipt_records | OCR receipts, bills, invoices, proof files, raw OCR text, confidence, tax amount, receipt number, and review status. |
| ocr_jobs | OCR processing queue records with source, queued time, status, and estimated time. |
| share_links | Link/QR access records with scope and expiration. |
| mileage_trips | GPS trip records with point A, point B, GPS points, miles, route, purpose, start/stop time and review status. |
| cpa_connections | CPA/bookkeeper firm access, scope and status. |
| cpa_requests | Missing document/comment/request workflow. |
| tip_entries | Tip amount, method, source, proof, qualified status, and audit history. |
| tax_estimates | Quarterly estimates, jurisdiction balances, deposit due alerts, and CPA review status. |
| connections | External payroll, HRIS, accounting, payout, or webhook-only integrations. |
| report_packages | CPA-ready export packages. |
| audit_logs | Every important action across modules. |
| notifications | Deposit alerts, exceptions, CPA requests, webhook failures, and tip cap warnings. |
| api_keys | Scoped integration keys for report automation, webhooks, or developer access. |

## 9. Production Requirements

### Backend

- Real authentication and role-based access control.
- Tenant isolation for merchant data.
- File storage for receipts, images, PDFs and CSV exports.
- OCR processing queue, confidence scoring, low-confidence review, batch approval and duplicate detection.
- OCR architecture decision: client-side, server-side or hybrid. The current demo uses browser-side Tesseract.js OCR.
- Ledger/audit table with append-only behavior.
- CPA portal invite and secure link system.
- Cost estimate and billing approval workflow.
- AI backend for AI CFO, deduction checklist and rule watch.
- Tip ledger service with add, edit, soft delete, proof, and CPA export.
- Tax estimate service with quarterly estimates, jurisdiction breakdowns, and deposit alerts.
- Connection management for OAuth, API key, SFTP, and webhook-only integrations.
- Notification engine and API key management.

### Integrations

- Payroll provider or Nexora payroll import.
- Payout/technician ledger sync.
- Accounting export.
- CPA/bookkeeper portal.
- Webhook event delivery.
- Notification delivery.
- Optional GPS/mobile app capture.

### Compliance Guardrails

- Do not claim guaranteed tax refund or guaranteed deduction.
- Show disclaimer that Tax IQ is record keeping and reporting support, not legal/tax advice.
- CPA/tax preparer must confirm final eligibility and filing decisions.
- Mask SSN/TIN and require approval for full PII export.
- Keep audit records for review and dispute support.

## 10. Demo Status

Implemented in static demo:

- Multi-page Tax IQ navigation.
- Tailwind-based layout.
- Current static project lives in `html/`.
- Font Awesome sidebar icons.
- Collapsible desktop sidebar with `localStorage` persistence.
- Mobile horizontal navigation.
- Tax IQ group contains ledger, exceptions, jurisdictions, forms, OCR, share links, GPS, CPA review, tip ledger, tax estimate and AI advisor.
- System group contains webhooks, audit log, notifications and settings.
- Detailed modals for all key actions.
- CPA cost preview before invite.
- AI CFO prompt workflow.
- OCR receipt/bill capture workflow with camera/file input, local-browser OCR, raw OCR text, field extraction, confidence review, processing queue and batch approval.
- Share link workflow.
- GPS mileage workflow.
- CPA review and filing package workflow.
- Tip Ledger / No Tax on Tips workflow.
- Tax Estimate and deposit schedule workflow.
- Connections, API keys, audit log and notification workflows.
- In-memory demo action handlers for approve receipt, resolve exception, mark notifications read, copy share link, revoke connection, mark payout paid, rotate/revoke API key, and soft-delete receipt/trip/tip records.

Not implemented yet:

- Real backend database.
- Real OCR.
- Real OCR storage, queue, backfill and duplicate-detection services.
- Real AI model call.
- Real CPA portal login.
- Real payment/billing.
- Real GPS capture.
- Real tax filing or e-file integration.
- Real webhook delivery.
- Real notification delivery.
- Real API key issuance and secret storage.
