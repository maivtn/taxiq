# Nexora Touch Payout, Pay Engine Và 1099 Supplement

Ngày cập nhật: 2026-06-29  
Nguồn bổ sung: `/Users/loinguyen/Downloads/payout.html` và `/Users/loinguyen/Downloads/nexora-touch-docs/`  
Liên quan dự án: Tax IQ demo, Payouts, Payroll Runs, Forms & Reports, Tax Ledger, OCR Vault, CPA Review

## 1. Mục Đích

Tài liệu này gom các thông tin bổ sung từ bộ Nexora Touch docs vào dự án Tax IQ. Phần này không thay thế tài liệu Tax IQ chính, mà giải thích rõ hơn nghiệp vụ payout/payroll/1099 cho vertical nail salon, beauty business hoặc merchant có nhiều technician.

Mục tiêu chính:

- Làm rõ Quick Pay dùng để trả tip, lương, bonus hoặc adjustment nhanh.
- Làm rõ Pay Engine tính lương tuần theo giờ, hoa hồng, kết hợp hoặc theo bậc.
- Làm rõ Payout Hub dành cho 1099 contractor, cần owner approve, lưu bằng chứng và sync sang Tax IQ.
- Làm rõ Tax Center 1099/W-2 cần thống kê YTD, W-9/TIN, PDF/CSV, IRS filing readiness và CPA review.
- Đảm bảo dữ liệu payout không chỉ là giao dịch thanh toán, mà còn là evidence cho thuế, audit log và CPA package.

Lưu ý: Đây là tài liệu nghiệp vụ/demo. Các ngày hạn, threshold và biểu mẫu thuế Mỹ phải được kiểm tra lại hằng năm từ IRS hoặc CPA trước khi production.

## 2. Source Files Được Bổ Sung

| File | Nội dung chính | Cách đưa vào Tax IQ |
| --- | --- | --- |
| `payout.html` | Hướng dẫn tổng hợp Quick Pay, cấu hình lương, Pay Engine, Payout Hub 1099, Tax Center và mẹo tối ưu. | Dùng làm source tổng hợp cho Payouts + Forms & Reports. |
| `quick-pay.html` | Quick Pay 5 bước, 7 mẹo tối ưu, loại thanh toán. | Bổ sung vào Payouts page như workflow thao tác nhanh. |
| `pay-engine.html` | 4 kiểu lương, ăn chia, bonus vượt bao, KPI bonus, kỳ thanh toán, preview real-time. | Bổ sung logic cấu hình Pay Engine và worker setup. |
| `weekly-payroll.html` | Bảng lương tuần, giờ làm, doanh số, lương giờ, hoa hồng, bonus, tips, trả từng người/tất cả. | Liên kết với Payroll Runs và Payouts. |
| `payout-hub.html` | Quy trình thanh toán nhân viên 1099, chờ duyệt, gửi Zelle, cấu hình payout, thao tác nhanh. | Bổ sung Payout Hub approval rules và 1099 evidence. |
| `tax-1099.html` | Tax Center 1099/W-2, 1099-NEC từng thợ, Form 1096, checklist IRS. | Bổ sung Forms & Reports / 1099 readiness. |
| `changelog.html` | Danh sách nội dung đã bổ sung và lỗi UX đã phát hiện. | Dùng làm backlog/trace cho BA. |

## 3. Quick Pay

Quick Pay là luồng thanh toán nhanh để owner hoặc manager tạo một payment nhỏ mà không phải mở full payroll run.

### 3.1 Flow Chuẩn

| Bước | User làm gì | Dữ liệu cần lưu |
| --- | --- | --- |
| 1. Chọn loại thanh toán | Tip, Wage/Lương, Bonus, Advance, Reimbursement hoặc Adjustment. | `payment_type`, tax category, ledger source. |
| 2. Chọn worker | Chọn technician/employee/contractor. | Worker ID, classification W-2/1099, primary payout method. |
| 3. Nhập số tiền | Gõ amount hoặc dùng quick chips như $20, $50, $100, $200. | Amount, currency, gross/net flag. |
| 4. Chọn method | Zelle, Cash, Venmo, Cash App, Check, ACH, Bank/DD hoặc PayPal. | Payment method, destination alias/masked account. |
| 5. Ghi chú và confirm | Nhập memo/purpose rồi tạo thanh toán. | Business purpose, approval actor, timestamp, audit log. |

### 3.2 Điểm UX Quan Trọng

- Amount input phải dễ thấy, tránh để user phải cuộn xuống mới thấy.
- Preview bên phải cần hiển thị worker, method, amount, type, memo và evidence status trước khi bấm tạo payment.
- Worker nên có primary payout method để không phải chọn lại mỗi lần.
- Recent history cần hiển thị giao dịch vừa tạo để user kiểm tra nhanh.
- Auto-approval dưới một ngưỡng như `$500` chỉ nên bật nếu merchant cấu hình rõ và data/evidence rules pass.

### 3.3 Mapping Vào Tax IQ

| Quick Pay output | Module nhận dữ liệu |
| --- | --- |
| Payment record | Payouts |
| Payment proof/screenshot | OCR Vault hoặc Payout detail |
| Tip payment | Tip Ledger nếu đủ điều kiện ghi tip |
| Contractor service payment | Forms & Reports / 1099 support |
| Wage/bonus cho W-2 employee | Payroll Runs / Tax Ledger |
| Memo/purpose | Audit Log và CPA package |

## 4. Pay Engine

Pay Engine là nơi cấu hình cách tính lương hoặc payout cho từng worker.

### 4.1 Kiểu Lương

| Kiểu | Giải thích | Ví dụ |
| --- | --- | --- |
| Hourly / Theo giờ | Giờ làm x rate, có thể có overtime sau 40h/tuần. | Kevin làm 48.5h, rate theo giờ, OT tính riêng. |
| Commission / Hoa hồng | Doanh số x tỷ lệ ăn chia. | Linda 40% x doanh số tuần. |
| Hybrid / Kết hợp | Lương giờ + hoa hồng + tip + bonus. | Amy có hourly base, commission và tips. |
| Tiered / Theo bậc | Tỷ lệ hoa hồng tăng theo ngưỡng doanh số. | Sarah đạt bậc cao thì percent cao hơn. |

### 4.2 Cấu Hình Cần Có

- Hourly rate.
- Overtime threshold và multiplier.
- Commission split, ví dụ 20% đến 65%.
- Bonus vượt bao: bật/tắt, ngưỡng doanh số, phần trăm hoặc amount bonus.
- KPI bonus: mục tiêu KPI và bonus khi đạt.
- Pay schedule: weekly, biweekly, semi-monthly, monthly.
- Real-time preview: hệ thống tính trước gross, deduction, tip, bonus và net.

### 4.3 Rủi Ro Thuế / Compliance

- W-2 employee: wage/bonus thường đi vào payroll tax flow, W-2, withholding, FICA.
- 1099 contractor: service payment/commission thường đi vào 1099 support package, nhưng classification phải được review.
- Không nên tự động coi mọi payment cho 1099 là không chịu payroll tax nếu worker classification chưa rõ.
- Những khoản như reimbursement, advance, adjustment cần category riêng để CPA review.

## 5. Weekly Payroll

Weekly Payroll là bảng tổng hợp tuần cho owner xem trước khi trả từng người hoặc trả tất cả.

### 5.1 Các Cột Cần Có

| Cột | Ý nghĩa |
| --- | --- |
| Worker | Tên nhân viên/technician. |
| Worker type | W-2 hoặc 1099. |
| Pay type | Hourly, commission, hybrid, tiered. |
| Hours | Tổng giờ trong tuần. |
| Sales | Doanh số dịch vụ/sản phẩm liên quan worker. |
| Hourly pay | Lương giờ trước tax/deduction. |
| Commission | Hoa hồng theo split. |
| Bonus | Bonus vượt bao hoặc KPI. |
| Tips | Tip được ghi nhận theo ngày/method. |
| Gross / Net | Tổng trước/sau deduction tùy cấu hình. |
| Action | Pay, Review, Hold, Export PDF/CSV. |

### 5.2 Dòng Chảy Vào Tax IQ

1. Pay Engine tính weekly payroll.
2. Owner review bảng lương tuần.
3. Owner chọn trả từng người hoặc trả tất cả.
4. Hệ thống tạo payout/payroll record.
5. Tax IQ tạo ledger/audit log.
6. 1099 contractor payments được cộng vào 1099 YTD.
7. W-2 employee wage/bonus được đưa vào payroll tax estimate/reporting.

## 6. Payout Hub Cho 1099 Contractor

Payout Hub dùng cho thanh toán contractor/technician dạng 1099.

### 6.1 Quy Trình 3 Bước

| Bước | Mục đích | Output |
| --- | --- | --- |
| 1. Calculate payout | Hệ thống tính gross, tip, deduction và net. | Payout candidate. |
| 2. Owner approve/send | Owner review rồi gửi Zelle hoặc method khác. | Confirmed payout + proof. |
| 3. Sync to 1099 | Mỗi payout confirmed được cộng vào hồ sơ 1099 YTD. | 1099 support record. |

### 6.2 Cấu Hình Payout

- Payment methods: Zelle, Cash, Venmo, Cash App, Check, ACH, Bank/DD, PayPal.
- Deduction rules: card fee, cleaning fee, supplies, advance, adjustment.
- Approval threshold: ví dụ auto-approve dưới `$500` nếu merchant bật.
- Evidence requirement: screenshot, memo, uploaded proof hoặc bank/reference ID.
- Audit requirement: ai approve, lúc nào, amount cũ/mới, method, note.

### 6.3 Dữ Liệu Cần Lưu Cho 1099

| Field | Vì sao cần |
| --- | --- |
| Worker legal name | Đưa vào 1099 nếu đủ điều kiện. |
| W-9/TIN status | Cần trước khi phát hành 1099. |
| Classification | Phân biệt W-2 employee và 1099 contractor. |
| Gross paid | Tổng service payment/commission/bonus liên quan contractor. |
| Tip amount | Theo dõi riêng nếu cần CPA review. |
| Deductions | Cần biết deduction là giảm payout hay expense riêng. |
| Payment method | Evidence cho giao dịch. |
| Proof file | Hỗ trợ CPA/audit. |
| Approval status | Không gửi hoặc export nếu chưa approve. |

## 7. Tax Center 1099/W-2

Tax Center là nơi tổng hợp year-to-date và chuẩn bị hồ sơ cuối năm.

### 7.1 1099-NEC Readiness

Checklist nên có:

- Worker là contractor/1099 đã được review classification.
- W-9 on file.
- TIN/legal name/address đã verify hoặc được đánh dấu needs review.
- YTD payout tổng hợp đúng từ Payout Hub.
- Box 1 nonemployee compensation được reconcile với ledger.
- Payment proof và audit log đủ.
- CPA/merchant approve trước khi generate/send.

### 7.2 Deadline Và Official Source

Theo IRS Instructions for Forms 1099-MISC and 1099-NEC (04/2025):

- Form 1099-NEC phải file với IRS trước hoặc đúng ngày `January 31`, dùng paper hoặc electronic filing.
- Nếu ngày hạn rơi vào Saturday, Sunday hoặc legal holiday thì deadline chuyển sang business day kế tiếp.
- E-file threshold đã giảm xuống `10` information returns, tính tổng hợp các information returns, áp dụng cho returns phải file từ `January 1, 2024`.
- Form 1099-NEC Box 1 dùng cho nonemployee compensation từ `$600` trở lên cho dịch vụ trong course of trade/business.

Nguồn IRS:

- https://www.irs.gov/instructions/i1099mec
- https://www.irs.gov/forms-pubs/about-form-1099-nec

Ghi chú: Source cũ có nhắc Form 1096 ngày Feb 28. Với TaxIQ production, không nên hard-code một deadline duy nhất cho mọi form. Hệ thống nên có rule table theo `form_type`, `tax_year`, `filing_method`, `paper/e-file`, `state`, và `official_source_url`.

### 7.3 W-2 Split

W-2 employee không đi qua 1099 package. Với W-2, hệ thống cần payroll tax workflow:

- Wages, tips, bonus, overtime.
- Federal income tax withholding.
- Social Security and Medicare.
- FUTA/SUTA nếu applicable.
- W-2/W-3 workflow cuối năm.

## 8. Cập Nhật Vào Demo Hiện Tại

Đã phản ánh vào HTML demo:

- Sidebar và Dashboard có entry point cho Quick Pay, Pay Engine, Weekly Payroll và Tax Center 1099/W-2.
- Quick Pay có màn hình riêng cho payment types, workflow 5 bước, worker methods, recent activity và guardrails.
- Pay Engine có màn hình riêng cho pay rules, worker configuration, real-time preview, bonus/deduction rules và production requirements.
- Weekly Payroll có màn hình riêng cho weekly rollup, daily detail, pay one/pay all action và Tax IQ sync checklist.
- Tax Center 1099/W-2 có màn hình riêng cho 1099 worker rollup, W-9/TIN status, IRS rule watch, checklist và W-2 split.
- Payouts page có Quick Pay Workflow.
- Payouts page có Pay Engine Configuration Rules.
- Payouts page có 1099 Contractor Readiness.
- Payouts page có Payout Hub Approval Rules.
- Forms & Reports page có 1099/W-2 Tax Center Checklist.
- Mock data cho các flow này đã được tách vào `html/assets/mock-data.json`.
- Documentation README có thêm supplement này.

## 9. Keyword Chuyên Ngành

| Keyword | Giải thích |
| --- | --- |
| Quick Pay | Luồng tạo thanh toán nhanh cho tip, wage, bonus, advance hoặc reimbursement. |
| Pay Engine | Bộ rule tính lương/payout dựa trên giờ, doanh số, hoa hồng, bonus và kỳ trả. |
| Payout Hub | Khu vực xử lý payout, đặc biệt cho contractor/1099. |
| 1099 Contractor | Người nhận thanh toán dạng independent contractor, không phải W-2 employee. |
| W-2 Employee | Nhân viên nhận Form W-2, thường có payroll withholding/FICA. |
| W-9 | Form lấy tên pháp lý, business name và TIN của contractor/vendor. |
| TIN | Taxpayer Identification Number, ví dụ SSN, EIN hoặc ITIN. |
| 1099-NEC | Form báo cáo nonemployee compensation cho contractor/vendor. |
| Box 1 | Ô trên 1099-NEC ghi nonemployee compensation. |
| Form 1096 | Form transmittal khi nộp paper information returns cho IRS; rule phụ thuộc loại form. |
| IRIS | IRS Information Reporting Intake System, portal e-file information returns. |
| FIRE | Hệ thống e-file information returns cũ/khác của IRS. |
| Gross | Tổng trước deduction. |
| Net | Số tiền cuối cùng sau deduction/adjustment. |
| Deduction | Khoản trừ, ví dụ card fee, cleaning fee, advance hoặc supplies. |
| Commission split | Tỷ lệ ăn chia doanh số giữa salon và worker. |
| Overtime | Giờ làm thêm, thường có multiplier trong W-2 payroll. |
| Evidence | Bằng chứng: screenshot, receipt, bank ref, memo, approval log. |
| Audit log | Nhật ký ai làm gì, lúc nào, trên record nào. |
| CPA package | Gói dữ liệu để CPA/bookkeeper review trước tax filing. |
