# TaxIQ No Tax On Tips Module - Dev / Business / UI Flow

Source DOCX: `TaxIQ_No_Tax_On_Tips_Module_Dev_Business_UI_Flow.docx`

TAX IQ NO TAX ON TIPS MODULE™

Business Requirement + UI Flow + Dev Specification

Prepared for Nexora Touch / Tax IQ Center Dev Team

Version: Phase 1 MVP | Language: Vietnamese + developer-ready English labels | Date: 2026-06-24

| Product Positioning: Tax IQ giúp thợ nail, beauty, barber, spa và tipped workers ghi nhận Cash Tip, Zelle, Venmo, Cash App, QR Tip và Card Tip để cuối năm có hồ sơ CPA-ready cho luật No Tax on Tips. Mục tiêu không phải thay CPA, mà là tạo hệ thống record keeping, audit trail và export report rõ ràng. |
| --- |

## 1. Executive Summary

Tax IQ No Tax on Tips Module là module trong Nexora Touch dùng để ghi nhận, phân loại, xác minh và xuất báo cáo tiền tip theo năm thuế. Module này phục vụ thợ 1099/contractor, W-2 employee, chủ tiệm, CPA và admin Tax IQ.

Luật No Tax on Tips cho phép người lao động đủ điều kiện được deduction tối đa $25,000 qualified tips/năm cho tax years 2025-2028. Qualified tips phải là voluntary tips, có thể là cash hoặc charged tips, và phải được báo cáo đúng. Với self-employed, deduction không vượt quá net income từ ngành nghề tạo ra tips, trước deduction này.

Official IRS references: IRS “What the No Tax on Tips deduction means for you” and IRS Notice 2025-69 / guidance for tax year 2025.

| Stakeholder | Pain Point | Tax IQ Value |
| --- | --- | --- |
| 1099 Technician | Nhận tip nhiều nguồn nhưng không có sổ sách rõ ràng | Tip Ledger + CPA-ready report + proof archive |
| Salon Owner | Không biết tip nào trả qua POS, tip nào khách trả trực tiếp | Dashboard tách owner-paid tips vs direct tips |
| CPA/Tax Preparer | Cuối năm thiếu số liệu, phải hỏi thủ công | Export PDF/CSV theo thợ, theo năm, theo payment method |
| Nexora/Tax IQ | Cần tạo sản phẩm compliance có recurring revenue | SaaS module + premium CPA package + audit support |

## 2. Business Goals

- Tạo module tip tracking chuyên sâu cho nail/beauty/small business.

- Giúp user ghi nhận tip quanh năm thay vì đợi cuối năm mới tổng hợp.

- Cho CPA có report rõ ràng để khai thuế theo dữ liệu thực tế.

- Tạo lợi thế cạnh tranh cho Nexora Touch: QR Tip + Payroll + Tax IQ Ledger trong một ecosystem.

- Mở rộng sau Phase 1 sang restaurant, barber, spa, delivery, hospitality.

## 3. Business Rules & Compliance Notes

| Rule | Description | System Handling |
| --- | --- | --- |
| Qualified Tip | Tip phải là voluntary, không phải mandatory service charge. | Field is_voluntary=true, is_service_charge=false. |
| $25,000 Cap | Federal deduction tối đa $25,000/năm, subject to income limits. | Dashboard hiển thị progress toward cap, không hứa tax refund. |
| Income Phase-out | MAGI phase-out bắt đầu trên $150k single / $300k joint. | App có disclaimer: final eligibility by CPA/tax software. |
| Self-employed Limit | Deduction không vượt net income từ business tạo tips. | CPA report include service income, expenses optional. |
| 1099 reporting | 2025 guidance cho phép non-employee dùng total amounts reported on 1099 nếu tips chưa được tách riêng. | Export separates direct tips vs POS/1099-related tips. |
| Form 4137 | IRS states Form 4137 is for Social Security/Medicare tax on tips not reported to employer. | Do not auto-decide form. Provide “Suggested CPA mapping.” |

Required disclaimer in app: Tax IQ is a record keeping and reporting tool, not legal or tax advice. Eligibility, final deduction amount, and tax forms must be confirmed by a licensed tax professional.

## 4. User Roles

| Role | Permissions |
| --- | --- |
| Technician / Worker | Add/edit own tips, upload proof, view own YTD dashboard, export own CPA package. |
| Salon Owner / Business Admin | View salon-level POS tips, QR tips, technician summary, export 1099 support report. Cannot edit worker direct tips unless permission granted. |
| CPA / Tax Preparer | Read-only access to reports and exported files authorized by worker/business. |
| Tax IQ Admin | Support, audit log review, configuration, data correction with full audit trail. |

## 5. End-to-End Business Flow

### Flow A - Card/POS Tip Through Salon

Customer pays service + tip through salon POS -> Nexora imports/records payment -> tip assigned to technician -> owner pays technician by payroll/Zelle/check -> Tax IQ marks source as POS_OWNER_PAID -> appears in Salon 1099 Support Report and Technician Tip Ledger.

### Flow B - Direct Zelle/Venmo/Cash App Tip

Customer tips technician directly -> technician opens Add Tip -> selects method Zelle/Venmo/Cash App -> enters amount and service -> optional screenshot proof -> Tax IQ stores timestamp and proof -> appears in worker CPA package as Direct Tip.

### Flow C - Cash Tip

Customer gives cash -> technician enters cash tip manually -> optional note/customer/service -> system timestamps entry -> included in Cash Tip Summary. Late entry requires note.

### Flow D - QR Tip via Nexora Touch

Customer scans technician/salon QR -> selects technician -> chooses tip/payment method -> payment confirmation creates tip_entries automatically -> optional reward/review flow -> Tax IQ ledger updates in real-time.

## 6. UI Screen Flow

| Screen | Purpose | Main Components | CTA |
| --- | --- | --- | --- |
| S1 Onboarding: No Tax on Tips | Explain value and disclaimer | Short intro, eligible industries, Connect/Start Tracking | Start Tracking |
| S2 Worker Profile | Collect worker/business basics | Worker type: 1099/W-2/Unknown, occupation, SSN last 4 optional, salon link | Save Profile |
| S3 Add Tip | Manual tip capture | Amount, method, service, received date/time, proof image, note | Save Tip |
| S4 Today Tips | Daily operational view | Today total, method breakdown, missing proof, recent entries | Add Tip / Edit |
| S5 Yearly Dashboard | Tax-year summary | YTD tips, qualified tips estimate, $25k cap progress, income warning | View Report |
| S6 Tip Detail | Audit detail | All fields, proof, edit history, status | Edit / Mark Review |
| S7 CPA Package | Export center | PDF, CSV, monthly summary, method summary, proof index | Generate Package |
| S8 Owner Dashboard | Salon view | Technician totals, POS tips, QR tips, 1099 support | Export Salon Report |

## 7. UI Wireframe Notes

- Add Tip: top field = $ amount with large keypad; method chips = Cash, Zelle, Venmo, Cash App, Card/POS, QR, Other; “This was voluntary tip” checkbox default checked; “This was a mandatory service charge” default unchecked.

- Yearly Dashboard: show “Qualified Tips Estimate” and “Potential Deduction Cap Used” but avoid saying guaranteed deduction/refund.

- CPA Package: include date range selector, tax year selector, worker profile, method summary, monthly summary, and disclaimer page.

- Owner Dashboard: owner should not see private direct tips unless worker opted in. Salon can see QR/POS tips processed through Nexora.

## 8. Data Model

CREATE TABLE tip_entries ( id UUID PRIMARY KEY, salon_id UUID NULL, technician_id UUID NOT NULL, customer_id UUID NULL, source_type VARCHAR(40) NOT NULL, -- MANUAL, POS, QR, PAYROLL_IMPORT tip_method VARCHAR(40) NOT NULL, -- CASH, ZELLE, VENMO, CASH_APP, CARD_POS, PAYPAL, QR, OTHER service_type VARCHAR(100), service_amount DECIMAL(10,2), tip_amount DECIMAL(10,2) NOT NULL, is_voluntary BOOLEAN DEFAULT TRUE, is_service_charge BOOLEAN DEFAULT FALSE, qualified_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, LIKELY_QUALIFIED, NEEDS_REVIEW, NOT_QUALIFIED received_at TIMESTAMP NOT NULL, entered_by UUID NOT NULL, proof_url TEXT, proof_type VARCHAR(40), -- SCREENSHOT, RECEIPT, POS_RECORD, CASH_NOTE gps_lat DECIMAL(10,6), gps_lng DECIMAL(10,6), note TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW() );

CREATE TABLE tip_audit_logs ( id UUID PRIMARY KEY, tip_entry_id UUID NOT NULL, action VARCHAR(40) NOT NULL, -- CREATED, UPDATED, DELETED, STATUS_CHANGED, EXPORTED changed_by UUID NOT NULL, before_json JSONB, after_json JSONB, created_at TIMESTAMP DEFAULT NOW() );

CREATE TABLE annual_tip_reports ( id UUID PRIMARY KEY, tax_year INT NOT NULL, technician_id UUID NOT NULL, salon_id UUID NULL, total_tips DECIMAL(10,2), likely_qualified_tips DECIMAL(10,2), deduction_cap DECIMAL(10,2) DEFAULT 25000, estimated_cap_used DECIMAL(10,2), report_pdf_url TEXT, report_csv_url TEXT, generated_by UUID NOT NULL, created_at TIMESTAMP DEFAULT NOW() );

## 9. API Specification - Phase 1

| Endpoint | Method | Purpose |
| --- | --- | --- |
| /api/v1/tips | POST | Create a tip entry |
| /api/v1/tips | GET | List tips by worker/date/method/status |
| /api/v1/tips/{id} | GET | Get tip detail |
| /api/v1/tips/{id} | PATCH | Update tip entry with audit log |
| /api/v1/tips/{id}/proof | POST | Upload proof image/receipt |
| /api/v1/tips/summary | GET | YTD, monthly, method summary |
| /api/v1/reports/tips/annual | POST | Generate CPA package PDF/CSV |
| /api/v1/salon/{salon_id}/tips/summary | GET | Owner dashboard summary |

POST /api/v1/tips { "technician_id": "uuid", "salon_id": "uuid", "source_type": "MANUAL", "tip_method": "ZELLE", "service_type": "Pedicure", "service_amount": 55.00, "tip_amount": 15.00, "received_at": "2026-06-24T16:30:00-05:00", "is_voluntary": true, "is_service_charge": false, "note": "Customer direct tip" } Response 201 { "id": "uuid", "qualified_status": "LIKELY_QUALIFIED", "audit_id": "uuid" }

## 10. Webhook Events

| Event | Trigger | Payload Notes |
| --- | --- | --- |
| tip.created | New manual/QR/POS tip created | tip_id, technician_id, salon_id, amount, method, received_at |
| tip.updated | Tip edited | before/after fields, changed_by |
| tip.proof_uploaded | Proof attached | tip_id, proof_url, proof_type |
| tip.status_changed | Rules engine updates status | old_status, new_status, reason |
| tip.report_generated | CPA package generated | report_id, tax_year, pdf_url, csv_url |
| payroll.tip_finalized | Payroll/POS tip finalized | payroll_run_id, worker_id, amount, payment_method |

## 11. Rules Engine Logic

function classifyTip(tip, workerProfile) { if (tip.tip_amount <= 0) return 'NOT_QUALIFIED'; if (tip.is_service_charge === true) return 'NOT_QUALIFIED'; if (tip.is_voluntary !== true) return 'NEEDS_REVIEW'; if (!workerProfile.occupation) return 'NEEDS_REVIEW'; if (!isTippedOccupation(workerProfile.occupation)) return 'NEEDS_REVIEW'; return 'LIKELY_QUALIFIED'; } function estimatedCapUsed(likelyQualifiedTips) { return Math.min(likelyQualifiedTips, 25000); }

## 12. CPA Report Output

| Report Section | Content |
| --- | --- |
| Cover Page | Worker name, tax year, salon/business, generated date, disclaimer |
| Annual Summary | Total tips, likely qualified tips, cash vs electronic, cap estimate |
| Monthly Summary | Jan-Dec totals by method |
| Transaction Ledger | Every tip entry with date, method, amount, status, proof reference |
| Proof Index | List of screenshots/receipts/POS records |
| Suggested CPA Mapping | W-2/1099/POS/Direct tip categories, not final tax advice |
| Audit Log Summary | Created/edited/exported history |

## 13. MVP Acceptance Criteria

- Worker can create manual cash/Zelle/Venmo/Cash App tip in under 30 seconds.

- System stores immutable audit log for every create/update/delete.

- Dashboard displays Today, Month-to-date, Year-to-date and $25,000 cap progress.

- Owner can see salon-processed POS/QR tips by technician.

- Worker can generate PDF and CSV CPA package for selected tax year.

- All screens show tax disclaimer and avoid guaranteed deduction language.

- Data export must match ledger totals exactly.

## 14. Phase 1 Development Roadmap

| Week | Scope | Deliverable |
| --- | --- | --- |
| 1 | Data model + worker profile + authentication permission | DB migrations, role permissions |
| 2 | Manual Add Tip + Tip List + Tip Detail | Mobile/web screens + APIs |
| 3 | Rules engine + audit logs + dashboard summaries | Qualified status + YTD dashboard |
| 4 | CPA PDF/CSV export | Annual report generator |
| 5 | Nexora QR Tip integration | Auto-create tip from QR transaction |
| 6 | Salon owner dashboard + payroll/POS import support | Owner report + webhook integration |

## 15. Dev Team Notes

- Use Postgres for relational ledger/audit data. Use S3-compatible storage for proof images and PDF/CSV exports.

- Use queue workers for report generation and proof image processing.

- Every mutation must create audit log. Do not hard-delete tip entries; use soft delete with reason.

- Keep direct tips private by default. Worker must opt in before salon owner/CPA can view direct tips.

- Use timezone-aware timestamps. Store UTC plus display in salon/user local timezone.

- Prepare multi-industry support: nail, beauty, barber, spa, restaurant, delivery, hospitality.

## 16. Recommended Product Packaging

| Plan | Target | Features |
| --- | --- | --- |
| Free | Technician trial | Manual tip tracking, 30-day history, basic dashboard |
| Pro $9.99-$19.99/mo | 1099/W-2 worker | Unlimited tips, proof upload, annual CPA report, mileage/expense add-on |
| Salon $49-$199/mo | Business owner | QR tip integration, technician dashboard, owner 1099 support report |
| CPA Partner | Tax office | Multi-client dashboard, export center, document request workflow |

## 17. Source References

- IRS - What the No Tax on Tips deduction means for you: https://www.irs.gov/newsroom/what-the-no-tax-on-tips-deduction-means-for-you

- IRS - Treasury/IRS guidance for individuals who received tips or overtime during tax year 2025: https://www.irs.gov/newsroom/treasury-irs-provide-guidance-for-individuals-who-received-tips-or-overtime-during-tax-year-2025

- IRS Notice 2025-69 PDF: https://www.irs.gov/pub/irs-drop/n-25-69.pdf

- IRS - About Form 4137: https://www.irs.gov/forms-pubs/about-form-4137
