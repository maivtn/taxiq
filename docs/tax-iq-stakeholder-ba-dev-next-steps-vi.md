# Tax IQ - Gop Y Stakeholder, BA va Dev

Ngay cap nhat: 2026-06-26  
Pham vi: Tax IQ demo, US payroll/tax, payout, OCR, Share Links, GPS Mileage, CPA Review, Tip Ledger, Tax Estimate, Onboarding, Data Quality, Compliance Review, Billing

## 1. Muc Dich Tai Lieu

Tai lieu nay gom cac quyet dinh va backlog can chot truoc khi tiep tuc build Tax IQ tu demo sang san pham that.

Muc tieu cuoi:

- Stakeholder chot business model va ICP.
- BA viet ro user stories, permission matrix, state machine va billing spec.
- Dev co danh sach fix UI/UX, loading state va huong tach mock data sang API.
- Demo hien tai da co man hinh de minh hoa cac quyet dinh nay: Onboarding, Data Quality, Compliance Review, Billing, Permission Matrix.

## 2. Gop Y Cho Stakeholder

### 2.1 Can chot business model

Hien tai Tax IQ co 3 huong kiem tien khac nhau:

| Mo hinh | Ai tra tien | Y nghia | Anh huong architecture |
| --- | --- | --- | --- |
| Merchant subscription | Merchant / business owner tra phi hang thang | Phu hop MVP va vertical nail/beauty | Can plan, billing, invoice, feature gate |
| CPA marketplace / referral | Merchant approve chi phi CPA/bookkeeper | Tax IQ co the nhan referral fee hoac support workflow | Can CPA estimate approval, billing approval, engagement tracking |
| Partner API licensing | Payroll/accounting partner tra phi API | Ban Tax IQ nhu embedded API | Can API metering, partner contract, webhook SLA, dev portal |

De xuat MVP:

1. Chon merchant subscription lam mo hinh chinh.
2. Giu CPA cost preview nhu add-on rieng, merchant approve truoc khi CPA bat dau lam.
3. De Partner API o phase sau vi can architecture rieng.

### 2.2 Can chot ICP

ICP de xuat: Vietnamese-owned nail salons va beauty businesses tai U.S.

Ly do:

- Co nhieu receipt/bill nho de mat.
- Co tip ledger, staff payout, 1099/W-2 classification, Zelle/Venmo/cash.
- GPS Mileage va Tip Ledger la differentiator manh.
- Thuong can CPA/bookkeeper ho tro filing.

Nen tranh pitch Tax IQ nhu payroll platform chung chung trong MVP. Nen pitch nhu tax/evidence assistant cho nail/beauty merchant truoc.

### 2.3 Compliance/legal review

Tax IQ co cac tinh nang anh huong den quyet dinh tai chinh:

- Tax Estimate
- withholding discrepancy
- jurisdiction mismatch
- deduction checklist
- tip qualification
- GPS mileage deduction estimate

Truoc go-live can legal review:

- Terms of Service
- disclaimer trong UI
- CPA handoff language
- limitation of liability
- data retention/privacy policy

## 3. Gop Y Cho BA

### 3.1 User stories can bo sung

| Flow | User story can viet |
| --- | --- |
| Merchant onboarding | Merchant tao account, chon industry, them business, them EIN, chon plan, connect payroll/accounting, moi CPA neu can. |
| Payroll Admin approve run | Payroll Admin xem run, xem validation, fix exception, approve/finalize, tao ledger va audit log. |
| CPA portal review | CPA nhan share/portal link, xem package, comment, request missing evidence, mark ready for filing. |
| Billing approval | Merchant xem plan/invoice/CPA estimate, approve hoac reject, audit log ghi lai. |
| Empty state onboarding | Tenant moi chua co data thi moi trang phai co CTA tiep theo. |

### 3.2 Payroll Run state machine

| Status | Nut action nen hien | Ghi chu |
| --- | --- | --- |
| Pending | View, Finalize, Line Items | Neu thieu line item thi block finalize. |
| Review Required | View, Review, Line Items | Can owner/CPA/payroll review. |
| Validation Failed | View, Fix, Retry, Line Items | Can hien exception/blocking reason. |
| Ledger Posted | View, Report | View-only, correction tao entry moi. |
| Reported | View, Export, Archive | Khong cho sua truc tiep. |

### 3.3 Permission matrix can chot

| Role | Nen duoc lam | Nen bi chan |
| --- | --- | --- |
| Merchant Owner | billing, approve export, connect CPA, share links, view all evidence | Khong nen sua tax rule system-level |
| Payroll Admin | create/finalize run, resolve payroll exception, export payroll reports | Billing owner approval neu khong co quyen |
| CPA / Bookkeeper | review package, comment, request files, prepare filing support | Finalize payroll run, manage settings, view hidden PII neu chua duoc cap quyen |
| Auditor | read-only reports, audit log, evidence view | Edit/delete/export PII neu chua approve |
| Employee / Worker | update own profile, W-4/W-9/TIN/tip evidence | View business-wide reports |

### 3.4 Billing spec can viet

BA can spec:

- Plan nao co tinh nang nao.
- Ai duoc xem billing.
- Upgrade/downgrade flow.
- Proration co tinh khong.
- Invoice gui email hay chi xem trong app.
- CPA estimate/retainer co tinh chung voi subscription hay rieng.
- Audit log cho billing event.

## 4. Gop Y Cho Dev

### 4.1 Da xu ly trong demo hien tai

- Da tach mock data sang `html/assets/mock-data.json`; `html/assets/mock-data.js` chi con la loader, `app.js` chi render UI va xu ly demo actions.
- Da co man hinh Onboarding cho first merchant setup, ICP fit, happy path, va empty-state acceptance criteria.
- Da co man hinh Data Quality Center cho missing TIN/W-4, receipt gap, OCR confidence, connection error, webhook dead letter, GPS review, CPA missing evidence, state setup.
- Da co man hinh Compliance Review cho legal/privacy/disclaimer/CPA handoff/API/backend go-live gate.
- Settings da co Permission Matrix Detail theo role.
- Dashboard da co widget mo nhanh cho Onboarding, Data Quality va Compliance Review.
- Payroll Runs da co contextual action buttons.
- Dashboard KPI cards da clickable.
- Analytics da co chart.
- OCR queue da co estimated time.
- Webhooks/Connections da co endpoint URL va last error.
- Audit Log da co date range filter.
- Notifications da co Read/Unread state.
- GPS Mileage da co route preview, IRS rate estimate va deduction estimate.
- Share Links draft da co Publish action.
- Table overflow/wrap/sticky action column da duoc bo sung.

### 4.2 Con can lam khi chuyen sang API

| Hang muc | Can lam |
| --- | --- |
| Loading state | Dung skeleton UI cho KPI, table, OCR queue, billing invoice. |
| API migration | Mock data da tach ra JSON rieng; buoc tiep theo la thay `mock-data.json` bang API/mock service co loading/error/retry. |
| API error state | Moi table/page can co loading, empty, error, retry. |
| Permission enforcement | UI hide button la chua du; backend phai enforce permission. |
| Audit log | Moi mutation phai tao audit event. |
| Billing | Tich hop provider nhu Stripe/QuickBooks invoice hoac internal billing service. |

## 5. Sprint De Xuat

### Sprint tiep theo

1. Stakeholder chot business model va ICP tren man hinh Billing + Onboarding.
2. BA review Onboarding, Data Quality, Permission Matrix, Payroll Run state machine, Billing spec.
3. Legal/CPA review man hinh Compliance Review, disclaimer, privacy/data retention, CPA handoff language.

Trang thai demo: cac muc Dev polish chinh va cac man hinh feedback moi da duoc bo sung vao HTML demo.

### Sprint sau

1. Build Billing/Plans production flow voi provider that.
2. Build merchant onboarding flow co backend va user account.
3. Build CPA portal happy path co role/permission that.
4. Thay `mock-data.json` bang API/mock service.
5. Them loading/error/empty state production va backend permission enforcement.

## 6. Keyword Giai Thich

| Keyword | Giai thich ngan |
| --- | --- |
| ICP | Ideal Customer Profile, nhom khach hang muc tieu nen ban dau tien. |
| Merchant | Chu doanh nghiep/cua hang dung Tax IQ. |
| CPA | Certified Public Accountant, ke toan/chuyen gia thue duoc cap phep tai My. |
| Bookkeeper | Nguoi ghi so/doi so giao dich, chua chac la CPA. |
| Business model | Cach san pham kiem tien: subscription, referral, API licensing. |
| Subscription | Phi hang thang/nam merchant tra de dung san pham. |
| Referral fee | Phi gioi thieu neu merchant thue CPA qua marketplace. |
| API licensing | Ban quyen su dung API cho partner de tich hop vao san pham cua ho. |
| State machine | Bang trang thai va hanh dong hop le cua mot workflow. |
| Permission matrix | Bang role nao duoc xem/lam gi trong he thong. |
| Empty state | Giao dien khi chua co du lieu, thuong co huong dan va CTA tiep theo. |
| Skeleton UI | Man hinh loading dang khung xam/shimmer de tranh layout shift. |
| Data Quality | Chat luong du lieu dau vao; vi du thieu TIN/W-4, receipt thieu purpose, webhook loi, OCR confidence thap. |
| Go-live gate | Danh sach dieu kien phai dat truoc khi cho khach hang that su dung. |
| Disclaimer | Cau thong bao gioi han trach nhiem, vi du Tax IQ chi ho tro ghi nhan/du doan, khong thay the CPA/luat su. |
| Feature gate | Chan/mo tinh nang dua tren plan hoac permission. |
| Proration | Tinh phi nang/ha goi theo phan con lai cua chu ky billing. |
| Audit log | Nhat ky bat bien ghi lai ai lam gi, luc nao, tren record nao. |
| SLA | Service Level Agreement, cam ket ve uptime/toc do/ho tro voi partner. |
