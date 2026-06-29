# Tài Liệu Mô Tả Tính Năng Tax IQ

Phiên bản: Phase 1 Demo  
Sản phẩm: Nexora Touch / Tax IQ  
Phạm vi áp dụng: U.S. payroll, payout, lưu trữ chứng từ thuế, Tip Ledger, Tax Estimate, CPA review, AI Advisor  
Ngày cập nhật: 2026-06-29

## 1. Mục Đích Của Tài Liệu

Tài liệu này giải thích bằng tiếng Việt các tính năng trong nhóm Tax IQ của dự án demo. Mục tiêu là giúp owner, BA, developer, designer, CPA partner và stakeholder hiểu rõ:

- Tax IQ dùng để làm gì.
- Vì sao doanh nghiệp cần các tính năng này.
- Mỗi màn hình trong Tax IQ có nhiệm vụ gì.
- Các keyword chuyên ngành như payroll, payout, CPA, OCR, ledger, webhook, deduction có nghĩa là gì.
- Khi đưa vào production thì cần bổ sung backend, security, data, billing và compliance như thế nào.

Lưu ý: Tax IQ là công cụ lưu trữ hồ sơ, theo dõi dữ liệu và hỗ trợ chuẩn bị thông tin cho CPA. Tax IQ không thay thế CPA, tax preparer, payroll provider hoặc tư vấn pháp lý/thuế chính thức.

## 2. Tax IQ Là Gì?

Tax IQ là khu vực trong Nexora Touch dùng để gom tất cả thông tin liên quan đến payroll, payout, chứng từ, tip ledger, tax estimate, mileage, CPA review và AI financial guidance vào một nơi.

Nói cách dễ hiểu:

- Nếu merchant bị mất bill, receipt hoặc invoice, Tax IQ giúp lưu lại.
- Nếu CPA cần xem số liệu cuối năm, Tax IQ tạo package có cấu trúc để CPA review.
- Nếu payroll hoặc payout có lỗi, Tax IQ hiển thị exception để xử lý sớm.
- Nếu merchant cần gửi link cho CPA hoặc technician upload hồ sơ, Tax IQ có Share Links.
- Nếu merchant đi xe cho công việc, Tax IQ có GPS Mileage để lưu trip evidence.
- Nếu technician cần theo dõi tip quanh năm, Tax IQ có Tip Ledger để lưu tip, proof và report cho CPA.
- Nếu owner muốn xem áp lực thuế sắp tới, Tax IQ có Tax Estimate để xem estimated tax, deposit alerts và khoản cần CPA review.
- Nếu merchant muốn hỏi AI về cash flow, tax readiness hoặc thiếu chứng từ nào, Tax IQ có AI Advisor / AI CFO.

## 3. Vấn Đề Nghiệp Vụ Cần Giải Quyết

Nhiều doanh nghiệp nhỏ, đặc biệt là nail salon, beauty business, spa, barber hoặc business có nhiều technician, gặp các vấn đề sau:

- Chứng từ bị thất lạc: bill, invoice, receipt, payout proof để lâu ngày không còn tìm thấy.
- Payout cho worker đến từ nhiều nguồn: cash, Zelle, Venmo, check, payroll, POS, QR tip.
- Thông tin W-2 employee và 1099 contractor dễ bị trộn lẫn.
- CPA cuối năm phải hỏi lại từng receipt, từng payment, từng worker.
- Owner không biết trước chi phí CPA/bookkeeper khi mới kết nối.
- Mileage đi làm việc có thể liên quan business nhưng không có log rõ ràng.
- Tip từ cash, Zelle, Venmo, Cash App, Card/POS hoặc QR dễ bị thiếu chứng từ nếu không ghi nhận hằng ngày.
- Owner cần xem estimated tax và deposit reminders để chuẩn bị cash flow trước hạn nộp.
- Có nhiều tính năng nên user cần hướng dẫn dùng đúng màn hình.
- Khi có thay đổi quy định, merchant cần được nhắc để liên hệ CPA hoặc cập nhật hồ sơ.

Tax IQ giải quyết bằng cách biến dữ liệu rời rạc thành một bộ hồ sơ có cấu trúc, có audit trail và có thể chia sẻ an toàn.

## 4. Người Dùng Chính

| Nhóm người dùng | Nhu cầu chính |
| --- | --- |
| Merchant owner | Quản lý tình trạng thuế/payroll, lưu chứng từ, kết nối CPA, approve share/export. |
| Payroll admin | Tạo payroll run, kiểm tra worker profile, xử lý exception, đóng sổ ledger. |
| Technician / worker | Upload payout proof, receipt, profile info, tip hoặc mileage evidence khi được mời. |
| CPA / accountant / bookkeeper | Xem hồ sơ read-only, comment, yêu cầu bổ sung file, chuẩn bị tax filing package. |
| Tax IQ admin | Hỗ trợ user, kiểm tra audit log, webhook, data issue và system setting. |

## 5. Các Module Trong Tax IQ

| Module | Giải thích dễ hiểu | Giá trị nghiệp vụ |
| --- | --- | --- |
| Tax Ledger | Sổ cái thuế/payout/payroll ghi lại các giao dịch quan trọng. | Có lịch sử rõ ràng để đối chiếu với CPA. |
| Exceptions | Danh sách lỗi, thiếu dữ liệu hoặc điểm cần review. | Giảm rủi ro trước khi payroll/tax package được chốt. |
| Data Quality | Trung tâm gom các lỗi dữ liệu: thiếu TIN/W-4, receipt thiếu purpose, OCR confidence thấp, connection/webhook lỗi, CPA thiếu chứng từ. | Biết chính xác dữ liệu nào cần sửa trước khi finalize hoặc export. |
| Jurisdictions | Nơi quản lý phạm vi thuế federal, state, local. | Biết doanh nghiệp đang liên quan đến bang/khu vực thuế nào. |
| Forms & Reports | Nơi tạo report/export cho CPA, payroll, 1099, year-end. | Giúp CPA có file PDF/CSV và summary rõ ràng. |
| Quick Pay | Màn hình tạo thanh toán nhanh cho tip, wage, bonus, advance, reimbursement hoặc adjustment. | Owner xử lý payment nhỏ nhanh nhưng vẫn có audit trail và tax routing. |
| Pay Engine | Màn hình cấu hình rule tính lương/payout theo giờ, hoa hồng, hybrid, tiered, bonus và pay schedule. | Giảm lỗi tính lương trước khi qua Weekly Payroll hoặc Payout Hub. |
| Weekly Payroll | Màn hình tổng hợp payroll tuần theo worker, hours, sales, commission, tips, bonus, net/gross và action pay. | Owner review và trả từng người hoặc trả tất cả với dữ liệu rõ ràng. |
| Tax Center 1099/W-2 | Màn hình kiểm tra W-9/TIN, 1099-NEC, W-2 split, recipient delivery và filing readiness. | Chuẩn bị hồ sơ cuối năm cho CPA/merchant mà không trộn W-2 và 1099. |
| OCR Vault | Kho lưu receipt, bill, invoice, payout proof; AI đọc ảnh và trích xuất dữ liệu. | Giảm mất chứng từ, tăng tốc độ nhập liệu. |
| Share Links | Tạo link/QR để bên ngoài upload hoặc review thông tin. | Gửi cho CPA, technician, reviewer mà không cần mở toàn bộ system. |
| GPS Mileage | Ghi nhận chuyến đi business, miles, route, purpose. | Tạo evidence để CPA xem có thể đưa vào deduction hay không. |
| CPA Review | Kết nối CPA/bookkeeper/tax preparer bên thứ ba. | CPA review dữ liệu, request missing files, chuẩn bị filing package. |
| Tip Ledger | Ghi nhận tip theo ngày, method, source, proof và qualified status. | Hỗ trợ No Tax on Tips record keeping và CPA package. |
| Tax Estimate | Dashboard ước tính thuế, deposit due, quarterly estimate và balance. | Giúp owner chuẩn bị cash flow và hỏi CPA đúng thời điểm. |
| AI Advisor / AI CFO | AI gợi ý cash flow, thiếu chứng từ, câu hỏi nên hỏi CPA, checklist deduction. | User có trợ lý hướng dẫn trong quá trình sử dụng. |
| Connections | Quản lý kết nối payroll, HRIS, accounting, payout hoặc webhook-only. | Đồng bộ dữ liệu với hệ thống bên ngoài có auth, signing và scopes. |
| Webhooks | Theo dõi event gửi sang hệ thống bên ngoài. | Kết nối integration với accounting, payroll, CRM hoặc partner system. |
| Audit Log | Lưu lịch sử hành động bất biến: view, update, export, delete, webhook. | Dùng cho review, dispute, compliance và CPA evidence. |
| Notifications | Trung tâm cảnh báo deposit due, exception, CPA request, webhook lỗi, tip cap. | Giúp user biết việc nào cần xử lý trước. |
| Onboarding | Hướng dẫn merchant mới setup business, chọn plan, connect data, invite CPA và hiểu empty state. | Giảm overwhelm khi user mới vào hệ thống. |
| Compliance Review | Checklist legal, privacy, disclaimer, CPA handoff, API/backend trước go-live. | Giúp stakeholder biết điều kiện nào còn block production. |
| Billing & Plans | Quản lý plan, invoice, CPA estimate approval và hướng partner API sau này. | Làm rõ ai trả tiền cho ai và chi phí nào cần merchant approve. |
| Settings | Quản lý role, permission matrix, retention, PII, security. | Đảm bảo dữ liệu nhạy cảm được bảo vệ. |

## 6. Luồng Nghiệp Vụ Tổng Thể

1. Merchant hoặc payroll admin tạo payroll/payout record.
2. Tax IQ ghi nhận vào ledger và kiểm tra exception.
3. Merchant lưu receipt, invoice, bill, payout proof vào OCR Vault.
4. Nếu cần bổ sung thông tin, merchant tạo Share Link cho CPA, technician hoặc reviewer.
5. Nếu có chuyến đi liên quan công việc, user ghi lại GPS Mileage.
6. Technician hoặc owner ghi nhận tip vào Tip Ledger nếu business có tip.
7. Tax Estimate hiển thị estimated tax, deposit due và các khoản cần chuẩn bị.
8. AI Advisor nhắc các thông tin còn thiếu, gợi ý checklist và câu hỏi nên hỏi CPA.
9. Merchant chọn CPA/bookkeeper/tax preparer bên thứ ba.
10. Hệ thống hiển thị cost preview: giá mỗi giờ, số giờ dự kiến, retainer, tổng estimate.
11. CPA vào portal read-only để review, comment, request missing files.
12. Merchant approve package/export trước khi chia sẻ đầy đủ hoặc dùng cho filing.

## 6.1 Bổ Sung Từ Nexora Touch Payout / Pay Engine / 1099 Docs

Bộ tài liệu bổ sung mới làm rõ phần trước Tax IQ: cách merchant tạo payment, cấu hình lương, trả lương tuần và gom số liệu 1099/W-2.

Các điểm cần đưa vào nghiệp vụ:

- Quick Pay: dùng để tạo thanh toán nhanh cho tip, wage/lương, bonus, advance, reimbursement hoặc adjustment. Flow chuẩn là chọn loại thanh toán, chọn worker, nhập amount, chọn method, thêm note và confirm.
- Pay Engine: cấu hình lương theo hourly, commission, hybrid hoặc tiered; có overtime, commission split, bonus vượt bao, KPI bonus và pay schedule.
- Weekly Payroll: bảng tổng hợp giờ làm, doanh số, lương giờ, hoa hồng, bonus, tips và tổng nhận; owner có thể trả từng người hoặc trả tất cả.
- Payout Hub 1099: dùng cho contractor/technician 1099, có bước calculate payout, owner approve/send, sau đó sync vào hồ sơ 1099.
- Tax Center 1099/W-2: tổng hợp YTD, W-9/TIN, contractor classification, 1099-NEC Box 1, W-2 split và CPA/merchant approval.

Dữ liệu từ các flow này chảy vào Tax IQ như sau:

| Source flow | Dữ liệu tạo ra | Tax IQ module nhận |
| --- | --- | --- |
| Quick Pay | Payment type, worker, amount, method, memo, proof | Quick Pay, Payouts, OCR Vault, Tax Ledger, Audit Log |
| Pay Engine | Pay type, commission split, overtime, bonus, pay schedule | Pay Engine, Employees, Payroll Runs, Payouts |
| Weekly Payroll | Gross/net, hours, sales, commission, tips, bonus | Weekly Payroll, Payroll Runs, Payouts, Tax Estimate |
| Payout Hub 1099 | Confirmed contractor payout, deduction, proof, approval | Payouts, Tax Center 1099/W-2, CPA Review, Tax Ledger |
| Tax Center 1099/W-2 | YTD rollup, W-9/TIN, 1099-NEC/W-2 readiness | Tax Center 1099/W-2, Forms & Reports, CPA Review, Compliance Review |

Ghi chú quan trọng: Form 1099-NEC và các deadline phải kiểm tra theo IRS official source mỗi tax year. Không nên hard-code một ngày hạn chung cho mọi form trong production.

## 7. Mô Tả Chi Tiết Từng Tính Năng

### 7.1 Tax Ledger

Tax Ledger là nơi ghi lại các dòng dữ liệu quan trọng như payroll tax, payout, tip, receipt link, mileage và export package.

Yêu cầu quan trọng:

- Ledger nên có tính append-only, nghĩa là đã ghi thì không sửa trực tiếp.
- Nếu có sửa, hệ thống tạo adjustment entry để giữ lịch sử.
- Mỗi dòng ledger nên có source, timestamp, user action và audit log.
- Tax Ledger giúp CPA xem dữ liệu được tạo từ đâu và có thay đổi gì không.

### 7.2 Exceptions

Exceptions là danh sách các vấn đề cần xử lý. Ví dụ:

- Receipt thiếu business purpose.
- Worker đang là 1099 nhưng payout bị đánh dấu giống wage.
- TIN/SSN verification đang pending.
- Jurisdiction mismatch: payroll liên quan đến state/local tax chưa setup.
- Payout proof bị thiếu hoặc ảnh quá mờ.

Giá trị: owner thấy lỗi sớm, không đợi đến cuối năm mới phát hiện.

### 7.3 OCR Vault

OCR Vault là kho lưu chứng từ. User có thể chụp ảnh hoặc upload receipt/bill/invoice. Trong demo hiện tại, màn hình này đã chi tiết hơn: user có thể capture receipt/bill bằng camera hoặc file upload, OCR chạy trong browser bằng Tesseract.js, sau đó hệ thống tự điền field để user review trước khi lưu vào vault.

Thông tin cần collect:

- Ảnh gốc hoặc file PDF.
- Vendor/payee.
- Ngày giao dịch.
- Số tiền.
- Payment method.
- Expense category.
- Business purpose.
- Link với payroll, payout, mileage, worker hoặc CPA package nếu có.
- OCR confidence, tức độ tin cậy của kết quả AI đọc dữ liệu.
- Raw OCR text, tức đoạn chữ thô đọc được từ hình ảnh.
- Receipt number hoặc invoice number nếu OCR nhận ra.
- Tax amount nếu có dòng thuế riêng.
- Trạng thái xử lý: processing, needs review, approved, missing purpose.

Giá trị: khi CPA hỏi bill/receipt, merchant có thể mở lại ngay thay vì tìm trong tin nhắn, email hoặc album ảnh.

Các phần hiện có trong demo:

- Vault metrics: số record đã approved/extracted, số record cần review, số record đang processing, số nguồn capture.
- Filter bar: lọc theo status, category, source và confidence.
- OCR Processing Queue: theo dõi receipt đang được xử lý.
- Receipt Vault table: hiển thị vendor, category, amount, source, confidence, tax, status, owner và actions.
- OCR Extraction Fields: định nghĩa field nào cần đọc từ receipt và confidence target.
- Capture Sources: camera in-app, file upload, email import, payout upload.

Các action trong demo:

- Capture Receipt / Bill.
- View Receipt Detail.
- Edit Receipt.
- Review OCR nếu confidence dưới ngưỡng.
- Approve từng receipt.
- Approve High Confidence để batch approve receipt có confidence cao.
- Delete Receipt theo cơ chế soft delete.
- Export to CPA.

Nguyên tắc OCR:

- Nếu confidence thấp, user phải review thủ công trước khi approve.
- Original image nên được lưu để CPA/audit có bằng chứng.
- Hệ thống cần duplicate detection theo vendor, amount, date và image hash.
- Demo hiện chạy OCR local trong browser. Production cần quyết định dùng client-side OCR, server-side OCR hoặc hybrid tùy bảo mật, hiệu năng và chi phí.

### 7.4 Share Links

Share Links là tính năng tạo link hoặc QR để gửi cho người bên ngoài.

Mục đích cuối của Share Links là tạo một cổng truy cập tạm thời, có giới hạn và có audit log để người ngoài hệ thống có thể upload hoặc review đúng phần thông tin được cho phép, mà không cần tạo tài khoản đầy đủ trong Tax IQ.

Nói cách dễ hiểu: Share Links không phải nơi lưu dữ liệu chính. Nó là cách thu thập hoặc chia sẻ dữ liệu an toàn. Sau khi người nhận upload hoặc review, dữ liệu sẽ được đưa về các module chính như OCR Vault, Payouts, CPA Review, Tax Ledger hoặc Forms & Reports.

Share Links giải quyết 3 nhu cầu nghiệp vụ:

- Lấy thêm hồ sơ còn thiếu từ technician, worker, CPA hoặc external reviewer.
- Chia sẻ một phần hồ sơ cho CPA/reviewer xem nhanh mà không mở toàn bộ hệ thống.
- Theo dõi ai đã mở link, upload gì, download gì và link còn hiệu lực hay không.

Có 3 kiểu access chính:

- Upload-only: người nhận chỉ được upload file/thông tin.
- Review-only: người nhận chỉ được xem những record được share.
- Review + upload: người nhận được xem và bổ sung file.

Ví dụ sử dụng:

- Owner gửi CPA link xem ledger và receipt.
- Owner gửi technician link upload W-9, payout proof hoặc profile information.
- A gửi B link để upload thông tin review.
- Tạo profile information link có expire sau 15 ngày hoặc never expire tùy cấu hình.

Thông tin sau khi upload sẽ đi về đâu:

| Loại thông tin upload/review | Module nhận dữ liệu |
| --- | --- |
| Receipt, bill, invoice | OCR Vault |
| Payout proof, screenshot Zelle/Venmo/Cash App | Payouts hoặc OCR Vault |
| W-9, profile information, worker document | Employees / worker profile hoặc CPA Review |
| CPA comment, missing-file request | CPA Review |
| Ledger/report package được share | Forms & Reports hoặc Tax Ledger |

Yêu cầu bảo mật:

- Mỗi link có scope rõ ràng.
- Có expire date.
- Có thể thêm passcode.
- Có audit log mỗi lần mở link, upload, download.
- Không cho xem toàn bộ system, chỉ xem dữ liệu được share.
- Full PII như SSN/TIN không được export qua link nếu merchant chưa approve.
- Link có thể revoke bất cứ lúc nào, kể cả khi chưa hết hạn.

### 7.5 GPS Mileage

GPS Mileage dùng để ghi lại các chuyến đi liên quan đến business.

Mục đích cuối của GPS Mileage là lưu lại bằng chứng tuyến đường từ điểm A đến điểm B. User bấm Start khi bắt đầu đi ở điểm A, đến nơi ở điểm B thì bấm Stop. Khi bấm Stop, hệ thống lưu lại route A → B, số miles, thời gian bắt đầu/kết thúc, xe sử dụng, business purpose và trạng thái để CPA review.

Flow hiện tại trong demo:

1. User mở GPS Mileage và bấm Start Trip.
2. Nhập Point A, Point B, vehicle, trip type, expected miles fallback và business purpose.
3. Bấm Start Tracking at Point A.
4. Browser bắt đầu ghi GPS points nếu user cho quyền location.
5. Khi đến điểm B, user bấm Stop Trip at Point B & Save.
6. Hệ thống tạo trip mới trong bảng GPS Mileage Tracker.
7. Nếu browser không cho GPS permission, hệ thống vẫn cho lưu bằng nhãn Point A/Point B và expected miles fallback để CPA review.
8. Route Preview hiển thị tuyến đường bằng Leaflet và OpenStreetMap tiles, không cần Google Maps API key cho demo, và có nút mở trực tiếp trên OpenStreetMap.

Ghi chú production: public OpenStreetMap tiles phù hợp cho demo/prototype, nhưng khi chạy production nên dùng tile provider có quota/SLA hoặc self-host tiles, kèm attribution, caching, privacy review và monitoring.

Thông tin cần collect:

- Xe nào được dùng.
- Địa điểm bắt đầu và kết thúc.
- Giờ bắt đầu và kết thúc.
- Số miles.
- Mục đích chuyến đi.
- Người tạo trip.
- GPS points, route A → B và evidence GPS/route nếu có.
- Expected miles fallback nếu GPS không khả dụng.
- CPA review flag nếu route có thể gây nhầm lẫn giữa business trip và commute.

Ví dụ:

- Owner đi từ salon này sang salon khác để kiểm tra hoạt động.
- Technician đi mua supplies cho công việc.
- Owner đi gặp CPA hoặc vendor liên quan business.

Lưu ý: Hệ thống chỉ lưu evidence và gợi ý review. CPA/tax preparer mới là người xác nhận cuối cùng trip có đủ điều kiện deduction hay không.

### 7.6 CPA Review

CPA Review cho phép merchant kết nối CPA, accountant, bookkeeper hoặc tax preparer bên thứ ba.

Quy trình:

1. Merchant chọn provider hoặc nhập thông tin CPA.
2. Hệ thống hiển thị cost preview trước khi gửi invite.
3. Merchant chọn scope dữ liệu muốn share.
4. CPA nhận invite vào portal.
5. CPA xem read-only records, comment, request missing files.
6. Merchant bổ sung file hoặc approve export/package.
7. CPA chuẩn bị tax filing support package.

Cost preview nên có:

| Trường | Ví dụ |
| --- | --- |
| Billing model | Hourly estimate |
| Hourly rate | $185/hr |
| Estimated hours | 3.5 hours |
| Estimated professional fee | $647.50 |
| Retainer due now | $250.00 |
| Platform fee | $0.00 trong demo |
| Approval | Merchant phải approve trước khi CPA bắt đầu work |

Quyền CPA:

- Mặc định read-only.
- Được comment và request missing files.
- Không được sửa source record của merchant.
- Không được export full PII nếu merchant chưa approve.

### 7.7 AI Advisor / AI CFO

AI Advisor là khu vực trợ lý thông minh. Trong đó AI CFO tập trung vào góc nhìn tài chính và tax readiness.

AI CFO có thể hỗ trợ:

- Nhắc các receipt thiếu business purpose.
- Gợi ý cash reserve cho payroll/tax deposit sắp tới.
- Gợi ý câu hỏi nên hỏi CPA.
- Tạo checklist deduction theo ngành nghề.
- Giải thích màn hình hoặc bước tiếp theo khi user bị rối.
- Cảnh báo các payout, worker classification hoặc mileage cần CPA review.

AI CFO không nên:

- Khuyên chắc chắn được refund.
- Khuyên chắc chắn được deduction.
- Tự động quyết định tax filing.
- Thay CPA đưa ra kết luận pháp lý/thuế.

### 7.8 Government Rule Watch

Government Rule Watch là ý tưởng theo dõi thay đổi quy định liên quan payroll, tax, 1099, tip, state/local notices.

Trong production, tính năng này cần:

- Kết nối nguồn dữ liệu chính thức hoặc được kiểm chứng.
- Hiển thị thông báo khi có rule update liên quan.
- Cho CPA/bookkeeper acknowledge hoặc comment.
- Không tự động diễn giải thành lời khuyên thuế nếu chưa có CPA review.

### 7.9 Forms & Reports

Forms & Reports tạo package cho CPA hoặc owner.

Package có thể gồm:

- Payroll summary.
- Payout ledger.
- Tip ledger.
- Receipt proof index.
- Mileage summary.
- Worker profile summary.
- Exception report.
- Audit log.
- PDF/CSV export.

Mục tiêu là làm cho CPA có đủ thông tin để review nhanh hơn.

### 7.10 Webhooks

Webhooks là màn hình monitor các event gửi ra ngoài. Nó dùng cho integration, ví dụ:

- Khi payroll run finalized, gửi event sang accounting system.
- Khi CPA package generated, gửi event sang partner portal.
- Khi share link được upload file, gửi event notification.

Webhook Monitor dùng để theo dõi event đã gửi thành công hay lỗi, retry hay vào dead letter queue.

### 7.11 Tip Ledger

Tip Ledger là màn hình theo dõi tip theo ngày, method, source, service, proof và qualified status. Đây là phần hỗ trợ record keeping cho No Tax on Tips, nhưng không tự quyết định cuối cùng tip nào được deduction.

Thông tin cần collect:

- Tip amount.
- Payment method: Cash, Zelle, Venmo, Cash App, Card/POS, QR, PayPal hoặc Other.
- Service type.
- Source: cash, direct customer payment, POS owner paid.
- Proof: screenshot, receipt photo, POS record, cash note hoặc none.
- Voluntary tip confirmation.
- Service charge confirmation.
- Qualified status: likely qualified, needs review hoặc not qualified.
- Audit history cho create, edit, delete.

Các action trong demo:

- Add Tip.
- View Tip Detail.
- Edit Tip.
- Soft Delete Tip.
- Export CPA Package.

Lưu ý: Nếu xóa tip, hệ thống nên soft delete, nghĩa là record vẫn nằm trong audit log để CPA thấy lịch sử trước/sau.

### 7.12 Tax Estimate

Tax Estimate là dashboard ước tính thuế dựa trên payroll, withholding, jurisdiction và quarterly estimates. Mục tiêu là giúp owner biết cash flow có đủ cho tax deposit không.

Màn hình này hiển thị:

- Estimated annual tax.
- YTD withheld.
- Estimated balance.
- Next deposit due.
- Quarterly estimate.
- Estimate by jurisdiction.
- Deposit schedule alerts.
- Gợi ý connect CPA để review estimate cuối cùng.

Nguyên tắc quan trọng:

- Đây chỉ là estimate, không phải final tax liability.
- CPA/tax preparer phải xác nhận cuối cùng.
- Hệ thống nên luôn hiển thị disclaimer rõ ràng.

### 7.13 Connections

Connections là nơi quản lý kết nối với payroll provider, HRIS, accounting, payout wallet hoặc webhook-only integration.

Thông tin cần quản lý:

- Connection name.
- System type.
- Auth method: OAuth 2.0, API key, SFTP import hoặc webhook signing only.
- Environment: production, staging, sandbox.
- Scopes: payroll, employees, reports, accounting, webhooks.
- Signing method, ví dụ HMAC SHA-256.
- Retry policy và last sync.

Các action trong demo:

- Add Connection.
- Edit Connection.
- Test Connection.
- Revoke Connection.

### 7.14 Audit Log

Audit Log là lịch sử bất biến của hệ thống. Mỗi hành động quan trọng cần ghi lại ai làm, làm lúc nào, làm trên record nào và chi tiết thay đổi.

Audit Log nên ghi:

- Payroll run finalized.
- Tax ledger posted.
- Share link created/revoked.
- Receipt OCR processed.
- Payout created/updated.
- Tip classified/edited/deleted.
- Report exported.
- Webhook delivered/failed.
- API key created/rotated/revoked.

Trong production, Audit Log nên append-only. Nếu record bị delete trong UI, hệ thống chỉ soft delete và vẫn giữ trước/sau trong audit.

### 7.15 Notifications

Notifications là trung tâm cảnh báo cho user.

Các loại notification trong demo:

- Deposit due reminder.
- Open exception alert.
- CPA request.
- TIN pending.
- Webhook dead letter.
- Tip cap warning.

Giá trị: user biết việc nào cần xử lý trước thay vì phải mở từng màn hình để kiểm tra.

## 8. Quyền Truy Cập Và Bảo Mật

| Vai trò | Quyền nên có |
| --- | --- |
| Merchant owner | Full access, connect CPA, tạo share link, approve export, approve billing. |
| Payroll admin | Quản lý payroll, payout, worker profile, exception, report. |
| Technician / worker | Chỉ xem/upload record được share hoặc của chính mình. |
| CPA / accountant | Read-only, comment, request missing files, export nếu được approve. |
| External reviewer | Chỉ truy cập qua link có scope/expiration. |
| Tax IQ admin | Support và audit theo permission nội bộ. |

Nguyên tắc bảo mật:

- Dữ liệu SSN/TIN phải mask mặc định.
- Full PII export cần merchant approve.
- Share link phải có expiration và audit log.
- CPA không được sửa source record.
- Mọi action quan trọng cần ghi audit log.
- User phải biết ai đã xem, upload, download hoặc export dữ liệu.

## 9. Dữ Liệu Cần Lưu

| Data object | Giải thích |
| --- | --- |
| tax_ledger_entries | Dòng sổ cái tax/payroll/payout đã được ghi lại. |
| exceptions | Lỗi hoặc cảnh báo cần user xử lý. |
| receipt_records | Receipt, bill, invoice, payout proof, raw OCR text, confidence, tax amount, receipt number và kết quả review. |
| ocr_jobs | Trạng thái OCR processing, queued time, source file và estimated processing time. |
| share_links | Link/QR, scope, expiration, passcode, status. |
| mileage_trips | Trip GPS, point A, point B, GPS points, miles, route, purpose, start/stop time và review status. |
| cpa_connections | Thông tin CPA/bookkeeper được kết nối. |
| cpa_requests | Yêu cầu bổ sung file/comment từ CPA. |
| tip_entries | Dòng tip theo ngày, method, source, proof và qualified status. |
| tax_estimates | Ước tính tax theo quarter, jurisdiction, balance và deposit due. |
| connections | Kết nối payroll, HRIS, accounting, payout hoặc webhook-only. |
| report_packages | Package PDF/CSV cho CPA hoặc owner. |
| audit_logs | Lịch sử hành động: view, upload, export, approve, retry. |
| webhook_events | Event gửi sang hệ thống ngoài và trạng thái delivery. |
| notifications | Cảnh báo deposit due, exception, CPA request, webhook lỗi, tip cap. |
| api_keys | API key cho integration, automation hoặc developer access. |

## 10. Yêu Cầu Để Đưa Vào Production

Backend cần có:

- Login/authentication thật.
- Role-based access control.
- Database riêng theo tenant/merchant.
- File storage cho receipt, image, PDF, CSV.
- OCR processing queue, confidence scoring, low-confidence review, batch approval và duplicate detection.
- Chính sách OCR client-side/server-side/hybrid, bao gồm việc có dùng Tesseract.js trong browser hay OCR service ở backend.
- AI backend cho AI CFO và deduction checklist.
- Tip ledger service cho add/edit/soft delete/export tip entries.
- Tax estimate service cho quarterly estimate, jurisdiction estimate và deposit alerts.
- CPA portal invite.
- Share link service.
- Connection management cho OAuth/API key/SFTP/webhook-only integrations.
- Notification engine cho deposit alerts, CPA requests, webhook dead letters và tip cap warnings.
- API key management với scopes, expiration, rotation và usage audit.
- Billing approval workflow cho CPA cost.
- Append-only audit log.
- Webhook delivery và retry system.

Frontend cần có:

- Mỗi module là một page riêng.
- Modal chi tiết cho từng action.
- Form validation rõ ràng.
- Empty state để user biết cần làm gì.
- Hướng dẫn dùng màn hình nếu workflow phức tạp.
- Mobile support cho upload receipt, QR link và GPS trip.

Compliance guardrails cần có:

- Không nói chắc chắn được deduction/refund.
- Luôn hiển thị disclaimer: Tax IQ hỗ trợ record keeping và reporting, không phải legal/tax advice.
- CPA/tax preparer xác nhận cuối cùng về filing và deduction.
- Mask SSN/TIN.
- Audit log đầy đủ cho view, upload, export, approve.

## 11. Trạng Thái Demo Hiện Tại

Đã có trong static demo:

- Multi-page Tax IQ project.
- Tailwind layout.
- Font Awesome icons.
- Collapsible sidebar trên desktop, lưu trạng thái bằng `localStorage`.
- Mobile horizontal sidebar/navigation.
- Sidebar/header/menu load bằng JavaScript.
- Tax IQ group gồm Ledger, Exceptions, Jurisdictions, Forms, OCR, Share Links, GPS, CPA Review, Tip Ledger, Tax Estimate, AI Advisor.
- Modal chi tiết cho các action chính.
- CPA cost preview trước khi connect.
- AI CFO prompt workflow.
- OCR receipt/bill capture workflow với camera/upload, local-browser OCR, raw text, extracted fields, confidence review, processing queue và batch approval.
- Share link workflow.
- GPS mileage workflow.
- CPA review và filing package workflow.
- Tip Ledger / No Tax on Tips workflow.
- Tax Estimate dashboard với deposit schedule alerts.
- Connections page với add/edit/test connection modals.
- Audit Log page với immutable action history.
- Notifications page cho deposit, exception, CPA request, webhook và tip cap alerts.
- Settings page có API Keys và Notification Preferences.
- Một số action đã cập nhật dữ liệu demo trong bộ nhớ: approve receipt, resolve exception, mark notification read, copy share link, revoke connection, mark payout paid, rotate/revoke API key, soft-delete receipt/trip/tip.

Chưa có trong demo:

- Real backend database.
- Real OCR engine.
- Real OCR storage/queue/backfill service.
- Real AI model call.
- Real CPA portal login.
- Real payment/billing.
- Real GPS capture.
- Real tax filing hoặc e-file integration.
- Real webhook delivery.
- Real notification delivery.
- Real API key issuance and secret storage.

## 12. Bảng Giải Thích Keyword Chuyên Ngành

| Keyword | Giải thích tiếng Việt | Trong Tax IQ dùng để làm gì |
| --- | --- | --- |
| Tax IQ | Trung tâm dữ liệu thuế/thanh toán/chứng từ. | Gom ledger, receipt, mileage, CPA review, AI Advisor. |
| Merchant | Chủ doanh nghiệp hoặc business sử dụng hệ thống. | Owner/manager của salon hoặc business. |
| Payroll | Quy trình trả lương và tính thuế liên quan đến employee. | Tạo payroll run, tính payroll tax, tạo report. |
| U.S. payroll | Payroll theo phạm vi Hoa Kỳ. | Cần tách federal, state, local và các form liên quan. |
| Payout | Khoản chi trả cho worker/technician/vendor. | Theo dõi tiền đã trả, method, proof, worker type. |
| Worker | Người làm việc cho business. | Có thể là employee hoặc contractor. |
| Technician | Thợ/nhân viên dịch vụ, ví dụ nail technician. | Có payout, tip, profile, receipt, mileage riêng. |
| Employee | Nhân viên W-2. | Liên quan payroll withholding và employee tax forms. |
| Contractor | Người làm theo dạng 1099/independent contractor. | Theo dõi payout và 1099 support record. |
| Worker classification | Phân loại worker là employee hay contractor. | Nếu sai có thể tạo payroll/tax risk. |
| W-2 | Form báo cáo lương cho employee tại Mỹ. | Dùng cho employee payroll/year-end package. |
| 1099 | Form thông tin thanh toán cho contractor/vendor. | Dùng cho contractor payout support package. |
| W-9 | Form thu thập thông tin tax của contractor/vendor. | Technician/contractor upload qua Share Link. |
| W-4 | Form employee khai thông tin withholding. | Payroll admin cần để tính payroll tax. |
| Ledger | Sổ cái ghi nhận giao dịch. | Lưu payroll, payout, tax, receipt, mileage records. |
| Tax Ledger | Sổ cái riêng cho dữ liệu tax/payroll. | Là source of truth cho CPA review. |
| Immutable | Không sửa trực tiếp sau khi đã ghi. | Bảo vệ tính toàn vẹn của ledger. |
| Append-only | Chỉ thêm dòng mới, không ghi đè dòng cũ. | Nếu có sửa thì tạo adjustment entry. |
| Adjustment entry | Dòng điều chỉnh khi cần sửa số liệu. | Giữ lịch sử thay đổi minh bạch. |
| Audit trail | Vết lịch sử ai làm gì, lúc nào. | Dùng khi review, dispute hoặc compliance. |
| Audit log | Bảng/log lưu các action quan trọng. | View, upload, approve, export, retry webhook. |
| Exception | Lỗi/cảnh báo cần xử lý. | Hiện việc thiếu receipt, TIN pending, mismatch. |
| Blocking exception | Lỗi chặn quy trình tiếp theo. | Không cho finalize/export nếu chưa xử lý. |
| Warning | Cảnh báo không nhất thiết chặn ngay. | Nhắc user hoặc CPA review. |
| Jurisdiction | Phạm vi thuế theo federal/state/local. | Xác định business liên quan đến cơ quan thuế nào. |
| Federal tax | Thuế cấp liên bang Hoa Kỳ. | Một phần trong payroll/tax report. |
| State tax | Thuế cấp bang. | Phụ thuộc state business/worker liên quan. |
| Local tax | Thuế cấp địa phương nếu có. | Theo dõi city/county/local rules nếu áp dụng. |
| Payroll tax | Thuế liên quan đến payroll. | Theo dõi withholding/employer tax support records. |
| Withholding | Khoản giữ lại từ lương để nộp thuế. | Payroll records cần tính và report. |
| Deposit due | Hạn nộp khoản tax deposit. | AI Advisor có thể nhắc cash reserve. |
| Forms & Reports | Màn hình tạo form/report/export. | Tạo CPA-ready package. |
| CPA | Certified Public Accountant. | Kế toán/chuyên gia được cấp chứng chỉ để review/filing. |
| Accountant | Kế toán. | Có thể review sổ sách, nhưng không nhất thiết là CPA. |
| Bookkeeper | Người ghi sổ/giữ sổ sách. | Giúp sắp xếp receipt, payout, ledger. |
| Tax preparer | Người chuẩn bị hồ sơ khai thuế. | Có thể giúp merchant filing theo scope. |
| Enrolled Agent | Chuyên gia thuế được IRS cấp quyền đại diện. | Có thể là provider trong CPA Review. |
| PTIN | Mã số người khai thuế chuyên nghiệp tại Mỹ. | Thu thập khi kết nối tax preparer nếu cần. |
| CPA Review | Quy trình CPA xem hồ sơ Tax IQ. | Comment, request missing files, prepare package. |
| Read-only | Chỉ được xem, không được sửa. | Quyền mặc định cho CPA. |
| Filing package | Bộ hồ sơ chuẩn bị cho khai thuế. | Gồm ledger, receipt, mileage, payroll, audit. |
| E-file | Gửi/khai thuế điện tử. | Chưa làm trong demo; production mới cần tích hợp. |
| Cost preview | Màn hình xem trước chi phí. | Merchant thấy hourly rate, hours, retainer, total. |
| Hourly rate | Giá tính theo giờ. | Ví dụ CPA $185/hr. |
| Estimated hours | Số giờ dự kiến. | Hệ thống dùng để tính estimated total. |
| Retainer | Khoản tạm ứng/giữ chỗ trước khi bắt đầu. | Merchant thấy trước khi approve CPA work. |
| Billing approval | Phê duyệt chi phí trước khi billing. | Không cho CPA work bắt đầu nếu chưa approve. |
| OCR | Optical Character Recognition, đọc chữ từ ảnh. | Đọc receipt/bill/invoice từ hình chụp. |
| AI OCR | AI đọc và trích xuất dữ liệu từ ảnh. | Lấy vendor, amount, date, category, confidence. |
| OCR Vault | Kho lưu ảnh/chứng từ và kết quả OCR. | Giữ receipt không bị mất. |
| Tesseract.js | Thư viện OCR chạy bằng JavaScript trong browser. | Demo dùng để đọc receipt local trong trình duyệt. |
| Local-browser OCR | OCR chạy trên máy/trình duyệt của user. | Giảm việc gửi ảnh lên server trong demo. |
| Processing queue | Hàng đợi xử lý. | Theo dõi receipt đang OCR hoặc chờ OCR. |
| Confidence threshold | Ngưỡng độ tin cậy. | Dưới ngưỡng thì bắt user review thủ công. |
| Batch approval | Phê duyệt nhiều record cùng lúc. | Approve receipt có confidence cao. |
| Raw OCR text | Text thô đọc được từ ảnh. | Dùng để kiểm tra lại kết quả extract. |
| Duplicate detection | Phát hiện trùng lặp. | So vendor, amount, date và image hash để tránh lưu trùng. |
| Image hash | Dấu vân tay kỹ thuật của ảnh. | Dùng để phát hiện receipt bị upload nhiều lần. |
| Receipt | Hóa đơn/biên nhận. | Evidence cho expense hoặc payment. |
| Bill | Hóa đơn cần thanh toán hoặc đã thanh toán. | Lưu vào OCR Vault để CPA xem. |
| Invoice | Hóa đơn yêu cầu thanh toán. | Lưu và link với vendor/payee. |
| Payout proof | Bằng chứng đã chi trả. | Ví dụ screenshot Zelle, check, receipt, bank proof. |
| Vendor | Nhà cung cấp. | Cần để phân loại expense. |
| Payee | Người/bên nhận tiền. | Dùng trong payout hoặc expense record. |
| Business purpose | Lý do liên quan đến công việc/business. | Cần cho receipt/mileage/deduction review. |
| Category | Nhóm chi phí. | Ví dụ supplies, rent, software, mileage. |
| Confidence | Độ tin cậy của kết quả OCR/AI. | Nếu thấp thì cần manual review. |
| Share Link | Link chia sẻ có permission riêng. | Gửi CPA/technician upload hoặc review dữ liệu. |
| QR | Mã quét nhanh bằng camera. | Mở Share Link hoặc profile link. |
| Access scope | Phạm vi dữ liệu được xem/upload. | Giới hạn link chỉ vào record cần thiết. |
| Expiration | Ngày hết hạn của link. | Ví dụ 15 ngày hoặc never expire. |
| Passcode | Mã bảo vệ link. | Tăng bảo mật cho link chia sẻ. |
| Upload-only | Chỉ được upload. | Technician gửi W-9/receipt mà không xem dữ liệu khác. |
| Review-only | Chỉ được xem. | CPA xem package read-only. |
| Review + upload | Vừa xem vừa upload. | CPA review và bổ sung/comment file. |
| GPS Mileage | Theo dõi số miles đi xe liên quan business. | Tạo trip evidence cho CPA review. |
| Trip | Một chuyến đi. | Có route, miles, time, purpose. |
| Route | Tuyến đường di chuyển. | Bắt đầu/kết thúc và đường đi. |
| Mileage | Số dặm/miles đã đi. | Dùng trong mileage summary. |
| Deduction | Khoản có thể được trừ khi tính thuế. | Tax IQ chỉ gợi ý, CPA xác nhận cuối cùng. |
| Deduction candidate | Khoản có khả năng cần review cho deduction. | Đánh dấu để CPA xem. |
| Commute | Di chuyển từ nhà đến nơi làm việc thường ngày. | Cần CPA review kỹ nếu user muốn claim. |
| Commute-like | Giống như commute, có thể không rõ business purpose. | Đặt flag để CPA xem. |
| AI Advisor | Trợ lý AI trong Tax IQ. | Hướng dẫn user, checklist, risk, missing data. |
| AI CFO | Trợ lý AI theo góc nhìn tài chính. | Cash flow, tax readiness, câu hỏi nên hỏi CPA. |
| Cash flow | Dòng tiền vào/ra của business. | AI CFO cảnh báo áp lực tiền mặt. |
| Tax planning | Lập kế hoạch chuẩn bị thuế. | Nhắc deposit, receipt, CPA question. |
| Rule Watch | Theo dõi thay đổi quy định. | Nhắc user nếu có rule update liên quan. |
| Government rule | Quy định từ cơ quan nhà nước. | Cần source chính thức trong production. |
| Deduction checklist | Danh sách nhắc các mục có thể cần review. | Theo từng ngành như nail salon, beauty, contractor. |
| No Tax on Tips | Module theo dõi tip để CPA xem eligibility theo quy định. | Lưu tip ledger, proof, report; không tự kết luận eligibility. |
| Tip ledger | Sổ cái ghi nhận tiền tip. | Tách cash, card, QR, direct tip nếu có. |
| Qualified tips | Tip có thể cần review theo điều kiện quy định. | CPA/tax software xác nhận cuối cùng. |
| Tax Estimate | Ước tính thuế dựa trên dữ liệu hiện có. | Hiển thị estimated tax, balance và deposit alerts. |
| Quarterly Estimate | Ước tính theo quý. | Giúp owner chuẩn bị tiền trước hạn. |
| Estimated Tax | Số thuế ước tính. | Chỉ là estimate, không phải final liability. |
| Tax Liability | Nghĩa vụ thuế cuối cùng. | CPA/tax preparer xác nhận cuối cùng. |
| Deposit Alert | Cảnh báo hạn nộp tax deposit. | Nhắc owner chuẩn bị cash flow. |
| PII | Personally Identifiable Information, dữ liệu cá nhân nhạy cảm. | Tên, địa chỉ, SSN, TIN, email, phone. |
| SSN | Social Security Number. | Cần mask và chỉ export khi được approve. |
| TIN | Taxpayer Identification Number. | Dùng cho tax profile/1099/W-9. |
| Masking | Che bớt dữ liệu nhạy cảm. | Ví dụ ***-**-6789. |
| Tokenization | Thay dữ liệu nhạy cảm bằng token. | Giảm rủi ro lưu SSN/TIN trực tiếp. |
| RBAC | Role-Based Access Control. | Phân quyền theo vai trò owner, CPA, admin. |
| Tenant | Một merchant/business riêng trong hệ thống. | Dữ liệu mỗi tenant cần tách biệt. |
| Tenant isolation | Cách ly dữ liệu giữa các merchant. | Merchant A không thấy dữ liệu merchant B. |
| Backend | Phần server/database/API. | Cần để demo thành sản phẩm thật. |
| Frontend | Giao diện người dùng. | Các page, modal, form, table. |
| Font Awesome | Thư viện icon. | Demo dùng icon cho sidebar. |
| Collapsible sidebar | Sidebar có thể thu gọn/mở rộng. | Giúp màn hình rộng có thêm không gian làm việc. |
| localStorage | Bộ nhớ nhỏ trong browser. | Lưu trạng thái sidebar đang mở hay thu gọn. |
| In-memory demo data | Dữ liệu demo nằm trong JavaScript, chưa lưu database. | Action thay đổi dữ liệu tạm trong phiên demo. |
| API | Cách hệ thống nói chuyện với nhau bằng request/response. | Frontend gọi backend hoặc partner system. |
| API Key | Khóa truy cập API. | Cho integration hoặc automation gọi hệ thống. |
| API Scope | Phạm vi quyền của API key. | Giới hạn key chỉ đọc report, payroll, webhook hoặc full access. |
| Integration | Kết nối với hệ thống khác. | Payroll, accounting, CPA portal, payment. |
| OAuth 2.0 | Cơ chế đăng nhập/kết nối bảo mật giữa hệ thống. | Kết nối payroll, HRIS hoặc accounting provider. |
| HMAC SHA-256 | Cách ký dữ liệu để xác minh webhook/API. | Giúp bên nhận biết event thật từ Tax IQ. |
| Webhook | Event hệ thống gửi sang bên ngoài. | Báo payroll finalized, package generated, upload done. |
| Webhook Monitor | Màn hình theo dõi webhook. | Xem delivered, pending, retry, dead letter. |
| Retry | Thử gửi lại khi webhook lỗi. | Giảm mất event integration. |
| Dead letter | Hàng đợi event gửi lỗi nhiều lần. | Cần manual review. |
| Export | Xuất dữ liệu ra PDF/CSV/file. | Tạo package cho CPA hoặc owner. |
| PDF | Định dạng file để đọc/in. | CPA package có thể là PDF. |
| CSV | File bảng dữ liệu để mở bằng Excel/Sheets. | CPA có thể import vào accounting/tax tool. |
| Report package | Bộ file report gồm nhiều phần. | Payroll, payout, receipt, mileage, audit. |
| Source of truth | Nguồn dữ liệu chính được tin cậy. | Tax Ledger nên là source of truth cho review. |
| Finalize | Chốt dữ liệu. | Sau finalize nên ghi ledger và audit log. |
| Approval | Phê duyệt của merchant. | Cần trước export PII, billing, filing package. |
| Notification | Cảnh báo trong hệ thống. | Nhắc user xử lý deposit, exception, CPA request. |
| Onboarding | Quy trình hướng dẫn user mới setup hệ thống. | Thêm business, chọn plan, connect data, invite CPA, xử lý empty state. |
| Empty state | Giao diện khi chưa có dữ liệu. | Hướng dẫn user biết bước tiếp theo thay vì chỉ thấy bảng trống. |
| Data Quality | Chất lượng và độ đầy đủ của dữ liệu. | Gom missing TIN/W-4, receipt thiếu purpose, OCR thấp, webhook lỗi, CPA request. |
| Compliance Review | Màn hình review điều kiện pháp lý/vận hành trước go-live. | Legal, privacy, disclaimer, CPA handoff, API/backend controls. |
| Go-live gate | Điều kiện phải đạt trước khi chạy production. | Nếu còn blocker thì chưa nên mở cho khách hàng thật. |
| Mock data | Dữ liệu giả dùng cho demo. | Hiện đã tách vào `mock-data.json`; `mock-data.js` chỉ load JSON để sau này đổi sang API dễ hơn. |
| Soft delete | Xóa khỏi giao diện nhưng vẫn giữ lịch sử. | Tax records, receipt, trip, tip vẫn được giữ trong audit log. |
| Hard delete | Xóa hẳn dữ liệu. | Không nên dùng cho tax/audit records. |
| Usage audit | Lịch sử sử dụng API/key/action. | Theo dõi ai gọi API, lúc nào, kết quả gì. |

## 13. Tóm Tắt Để Demo Cho Khách Hàng

Tax IQ giúp merchant gom tất cả hồ sơ liên quan đến tax và payout trong năm vào một nơi. Hệ thống lưu receipt, bill, invoice, payout proof, mileage, tip ledger, payroll/payout ledger và cho phép kết nối CPA bên thứ ba. Merchant có thể gửi link/QR cho CPA hoặc technician upload thông tin, xem trước chi phí CPA trước khi kết nối, xem Tax Estimate để chuẩn bị cash flow, và dùng AI CFO để được nhắc thiếu chứng từ, tax readiness và checklist theo ngành.

Thông điệp cần nói rõ khi demo:

- Đây là công cụ record keeping và reporting support.
- CPA/tax preparer vẫn là người xác nhận cuối cùng về khai thuế.
- Mọi chia sẻ dữ liệu cần có permission, expiration và audit log.
- Mục tiêu là giảm thất lạc chứng từ, giảm hỏi đáp thủ công cuối năm và giúp CPA review nhanh hơn.
