/* Salon Home body and interactions from the PO handoff dated Oct 27, 2026.
 * English preference and local routing follow the prototype's shared shell. */
(function () {
'use strict';
const currentLanguage='en';
const languageToggle=new EventTarget();
const speechLanguages={en:'en-US'},localeTranslations={},supplementalTranslations={};
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const activeSalonName=window.NEXORA_ACTIVE_SALON?.name || 'Bitcoin Nail Bar';
const translations={"Thanh công cụ SI POS":"SI POS toolbar","Thu gọn menu":"Collapse menu","Tìm chức năng SI POS":"Search SI POS tools","Tìm chức năng SI POS...":"Search SI POS tools...","Cài đặt doanh nghiệp":"Business settings","Tin mới từ Nexora":"Nexora news","Tin nhắn Community":"Community messages","Không tìm thấy chức năng phù hợp.":"No matching tools found.","Quầy tiếp đón":"Front Desk","Tổng quan quầy":"Front Desk overview","Đón khách, theo dõi phiếu dịch vụ và điều phối lượt thợ trong một nơi.":"Check in guests, manage service tickets, and coordinate the turn board in one place.","Mở SI POS ↗":"Open SI POS ↗","Chức năng quầy tiếp đón":"Front Desk tools","Tổng quan":"Overview","Tại quầy hôm nay":"Today at the front desk","Tại quầy hôm nay · mẫu":"Today at the front desk · sample","SI POS · BẢN XEM THỬ":"SI POS · PREVIEW","Quy trình vận hành tại quầy":"Front desk workflow","Thử các bước đang có trong POS bằng dữ liệu mẫu. Những thay đổi dưới đây chỉ nằm trong bản xem trước.":"Try the current POS steps with sample data. Changes here stay in this preview.","Đặt lại mẫu":"Reset sample","Mở POS thật ↗":"Open live POS ↗","Các màn hình vận hành mẫu":"Sample operations screens","Mở SI POS để xem số liệu cập nhật của doanh nghiệp.":"Open SI POS to view live business figures.","Tổng lượt đến":"Total check-ins","Khách mới":"New guests","Khách quay lại":"Returning guests","Chờ trung bình":"Average wait","Sơ đồ chỗ trong tiệm":"Salon floor map","Kiểu xem sơ đồ":"Map view","Thẻ":"Cards","Lưới":"Grid","Hàng ngang":"Row","Nhìn nhanh ghế, bàn, phòng và người đang phục vụ.":"See chairs, tables, rooms, and who is serving each guest.","Dữ liệu minh họa":"Illustrative data","Trạng thái chỗ trong tiệm":"Station status","Trống":"Free","Đang làm":"Occupied","Đang dọn":"Cleaning","Quá hạn":"Overdue","Tạm khóa":"Blocked","Ghế pedicure · 6":"Pedicure chairs · 6","Bàn làm móng · 5":"Manicure tables · 5","Phòng · 2":"Rooms · 2","Sẵn sàng":"Available","Thợ B":"Technician B","Thợ C":"Technician C","Quá 2 phút":"2 min overdue","Còn 2 phút":"2 min left","Sửa điều hòa":"AC repair","P.3 cần dọn: quá hạn 2 phút · Thợ C phụ trách.":"P.3 cleaning is 2 min overdue · Technician C assigned.","Nguồn khách":"Guest sources","Tiến trình phục vụ":"Service progress","Theo dõi khách đến từ lịch hẹn, hồ sơ khách và các kênh khác trong SI POS.":"See visits from appointments, customer profiles, and other sources in SI POS.","Mỗi lượt giữ nguyên số thứ tự khi chuyển qua chờ, phục vụ, thu tiền hoặc hủy.":"Each visit keeps its number through waiting, service, checkout, or cancellation.","Lượt khách hôm nay":"Today’s check-ins","Xem trong SI POS ↗":"View in SI POS ↗","Lượt khách mẫu hôm nay":"Sample check-ins today","Lọc trạng thái lượt khách":"Filter check-in status","Đã check-in":"Checked in","Đang chờ":"Waiting","Chờ thanh toán":"Ready to pay","Hoàn tất":"Completed","Đã hủy":"Cancelled","Số lượt":"Number","Thời gian":"Time","Nguồn":"Source","Trạng thái":"Status","Số liệu lượt khách sẽ hiển thị trong SI POS khi đăng nhập.":"Sign in to SI POS to view live check-in data.","Ngôn ngữ":"Language","Bảng điều khiển SI POS":"SI POS Dashboard","SALON HOME · BITCOIN NAIL BAR":"SALON HOME · BITCOIN NAIL BAR","Trang bắt đầu công việc của tiệm: xem việc cần làm theo ca và mở nhanh màn hình tại quầy.":"Start the salon workday with tasks by shift and quick access to the front desk.","Thao tác tại quầy":"Front desk actions","Mở trực tiếp màn hình đang dùng":"Open the screen you need","Theo nhịp làm việc của tiệm":"Follow the salon workday","Chọn việc cần làm, không cần tìm trong menu dài":"Choose a task without searching a long menu","Chuẩn bị ca":"Prepare the shift","Kiểm tra lịch và đội ngũ trước khi đón khách.":"Check appointments and staff before customers arrive.","Phục vụ khách":"Serve customers","Theo dõi lượt thợ và dịch vụ đang thực hiện.":"Track the Turn Board and services in progress.","Kết ca & đối soát":"Close the shift & reconcile","Hoàn tất thanh toán và xem kết quả trong ngày.":"Complete payments and review the day.","Bản xem trước Salon Home":"Salon Home preview","Các đường dẫn mở màn hình hiện có; dữ liệu theo ca sẽ xuất hiện khi kết nối hệ thống.":"Links open available screens; shift data will appear when systems are connected.","Xem toàn bộ chức năng →":"View all tools →","TRANG CHỦ TIỆM":"SALON HOME","Chào Bitcoin Nail Bar":"Welcome, Bitcoin Nail Bar","Bắt đầu ngày làm việc từ lịch hẹn, đội ngũ và các việc cần xử lý tại quầy.":"Start the day with appointments, your team and front desk tasks.","Đón khách ↗":"Check in a customer ↗","Mở Dashboard →":"Open Dashboard →","Tổng quan hôm nay":"Today at a glance","Bản xem trước · Chưa kết nối dữ liệu trực tiếp":"Preview · Live data is not connected","Lịch hẹn hôm nay":"Today’s appointments","Xem lịch hẹn ↗":"View appointments ↗","Đang phục vụ":"In service","Xem lượt thợ ↗":"View Turn Board ↗","Doanh số hôm nay":"Today’s sales","Xem báo cáo ↗":"View reports ↗","Việc cần làm":"Next actions","Đi thẳng đến màn hình vận hành phù hợp.":"Go straight to the right operations screen.","Kiểm tra lịch hẹn":"Review appointments","Xem khách sắp đến và lịch trong ngày":"See arriving customers and today’s schedule","Theo dõi thứ tự phục vụ tại tiệm":"Track the salon’s service rotation","Xem các dịch vụ đang thực hiện":"View services in progress","Hoàn tất thanh toán cho khách":"Complete customer checkout","Trung tâm SI POS":"SI POS hub","Đi từ vận hành hằng ngày đến tăng trưởng khách hàng.":"From daily operations to customer growth.","Quầy & dịch vụ →":"Front desk & services →","Lễ tân & marketing →":"Reception & marketing →","Thẻ quà tặng →":"Gift cards →","QR & thanh toán →":"QR & payments →","Bỏ qua menu":"Skip navigation","Mở menu":"Open menu","Đóng menu":"Close menu","Điều hướng Nexora":"Nexora navigation","Menu chức năng nhiều cấp":"Nested tool menu","Menu nhanh cho chủ tiệm":"Salon owner quick links","Các chức năng Nexora":"Nexora tools","Truy cập nhanh cho vận hành tiệm":"Salon operations quick access","Truy cập nhanh":"Quick access","Tùy chỉnh":"Customize","Thêm / sửa":"Add / edit","Thêm / sửa · 6 gợi ý":"Add / edit · 6 ideas","Thêm hoặc sửa menu nhanh":"Add or edit quick access","Tùy chỉnh truy cập nhanh":"Customize quick access","Đóng tùy chỉnh":"Close customization","Chọn từ 1 đến 9 lối tắt. Nhấn Lưu để cập nhật thanh Truy cập nhanh.":"Choose 1 to 9 shortcuts. Select Save to update Quick access.","Dán liên kết HTTPS hoặc đường dẫn Nexora bắt đầu bằng /dashboard/.":"Paste an HTTPS link or a Nexora path beginning with /dashboard/.","Bỏ chọn một lối tắt trước khi thêm liên kết.":"Deselect a shortcut before adding a link.","Đã chọn liên kết. Nhấn Lưu để hiển thị trên thanh Truy cập nhanh.":"Link selected. Select Save to show it in Quick access.","Chọn tối đa 9 mục thường dùng để hiện trên dashboard.":"Choose up to 9 frequently used tools for your dashboard.","Vận hành tiệm":"Salon operations","Mặc định":"Defaults","Hủy":"Cancel","Lưu":"Save","Thêm menu riêng":"Add custom shortcut","Thêm lối tắt tới một màn hình Nexora hoặc trang web thường dùng.":"Add a shortcut to a Nexora screen or a frequently used website.","Tên menu":"Shortcut name","Đường dẫn":"Link","Ví dụ: Lịch nhân viên":"For example: Staff schedule","https://... hoặc /dashboard/...":"https://... or /dashboard/...","+ Thêm menu":"+ Add shortcut","Xóa":"Remove","Nhập tên và đường dẫn.":"Enter a name and link.","Đường dẫn phải là HTTPS hoặc bắt đầu bằng /dashboard/.":"Use an HTTPS link or a path beginning with /dashboard/.","Đã thêm vào danh sách. Bỏ chọn một mục để đưa lên thanh nhanh.":"Added to the list. Deselect another tool to show it in quick access.","Chỉ thêm tối đa 12 menu riêng.":"You can add up to 12 custom shortcuts.","Menu riêng":"Custom shortcuts","Tăng trưởng & kết nối":"Growth & connections","Đề xuất":"Proposed","Tìm khách hàng":"Find customers","Lịch làm việc thợ":"Staff schedule","Supply / Vật tư":"Supplies / inventory","Đăng tuyển":"Hiring","Chạy quảng cáo":"Run ads","Liên kết nền tảng & kênh":"Platforms & channels","Bản đề xuất giao diện":"Proposed interface","Đóng bản đề xuất":"Close proposed interface","Chức năng đang được đề xuất · chưa kết nối dữ liệu":"Proposed feature · data not connected","Chọn mục khác trong Truy cập nhanh để xem tiếp.":"Choose another quick access item to continue.","Xác định kênh mang khách mới đến tiệm, theo dõi lượt hỏi và chuyển thành lịch hẹn. Đây là tính năng đề xuất cho tăng trưởng khách hàng.":"Identify channels bringing new customers, track inquiries and turn them into appointments. This is a proposed customer growth feature.","Xem ca làm, ngày nghỉ và lịch hẹn của từng thợ trên một lịch chung. Khi triển khai, cần liên kết dữ liệu lịch hẹn và chấm công.":"View each staff member’s shifts, days off and appointments in one calendar. Implementation will require booking and time clock data.","Theo dõi vật tư, số lượng tồn và nhắc đặt thêm cho tiệm. Đây là mục đề xuất, chưa có dữ liệu kho.":"Track supplies, stock levels and reorder reminders. This is a proposed feature without inventory data.","Đăng tuyển thợ và theo dõi người ứng tuyển trong mục Việc làm của Community.":"Post staff openings and track applicants in Community Jobs.","Quản lý các kênh liên lạc và nền tảng đã kết nối với tiệm tại một nơi. Trạng thái kết nối cần được xác minh khi triển khai.":"Manage salon communication channels and connected platforms in one place. Connection status must be verified during implementation.","Mở lịch hẹn":"Open appointments","Xem Community":"View Community","Mở AI Hub":"Open AI Hub","Đóng":"Close","Đóng vòng quay":"Close prize wheel demo","Từ Nexora: xem tin mới, ưu đãi và cập nhật dành cho tiệm trong News & Library":"From Nexora: view salon news, offers and updates in News & Library","ĐANG XEM TIỆM":"CURRENT SALON","Chức năng hiện có":"AVAILABLE TOOLS","Đang chuẩn bị":"COMING SOON","Dùng hằng ngày":"Daily tools","Theo dõi & phát triển":"Insights & growth","Hệ thống":"System","Nền tảng":"Platform","Công cụ khác":"Other tools","Tài khoản & tiệm":"Account & salon","Liên kết & pháp lý":"Links & legal","Bản thiết kế tham khảo":"Design preview","Super Intelligence · Bitcoin Nail Bar":"Super Intelligence · Bitcoin Nail Bar","Lịch hẹn":"Appointments","Khách hàng":"Customers","Thu tiền":"Checkout Customer","Chủ tiệm":"Salon owner","Xếp lượt thợ":"Turn Board","Xếp lượt thợ ↗":"Turn Board ↗","Chấm công ↗":"Time clock ↗","Doanh số ↗":"Sales ↗","Phiếu dịch vụ ↗":"Tickets ↗","Thống kê lượt thợ":"Turn Board stats","Thống kê lượt thợ ↗":"Turn Board stats ↗","Nhật ký cuộc gọi":"Call log","Nhật ký cuộc gọi ↗":"Call log ↗","Theo dõi lượt gọi và nhận khách theo từng thợ, từng ca.":"Track staff calls and customer assignments by shift.","Đóng thống kê lượt thợ":"Close Turn Board stats","Chưa kết nối dữ liệu Turn Board":"Turn Board data is not connected","Lượt gọi thợ":"Staff calls","Đã nhận khách":"Customers assigned","Bỏ lượt":"Skipped turns","Thợ":"Staff member","Lượt gọi":"Calls","Nhận khách":"Customers assigned","Chưa có dữ liệu thống kê theo thợ.":"No staff statistics available yet.","Mở Turn Board để xem lượt hiện tại của tiệm.":"Open Turn Board to view the salon’s current rotation.","Mở Turn Board ↗":"Open Turn Board ↗","Giao dịch ↗":"Transactions ↗","Chi trả thợ ↗":"Staff payouts ↗","SI POS và các công cụ":"SI POS and tools","chức năng":"tools","KHÁM PHÁ NEXORA":"EXPLORE NEXORA","Sản phẩm và công cụ Nexora":"Nexora products and tools","Chọn một sản phẩm để xem chức năng và màn hình vận hành.":"Choose a product to explore its tools and operating screens.","Tin mới, ưu đãi và cập nhật":"News, offers and updates","Từ Nexora: xem tin mới, ưu đãi và cập nhật cho doanh nghiệp trong News & Library":"From Nexora: news, offers and business updates in News & Library","Tìm sản phẩm":"Search products","Tìm sản phẩm hoặc tính năng…":"Search products or features…","Lọc nhóm sản phẩm":"Filter product groups","Tất cả nhóm":"All groups","Không tìm thấy sản phẩm":"No products found","Tất cả sản phẩm":"All products","← Tất cả sản phẩm":"← All products","VẬN HÀNH":"OPERATIONS","TRẢI NGHIỆM QR":"QR EXPERIENCE","DÒNG TIỀN":"PAYMENTS","TRỢ LÝ AI":"AI ASSISTANTS","PHẢN HỒI":"FEEDBACK","THẺ & THÀNH VIÊN":"CARDS & MEMBERSHIP","BÁO CÁO":"ANALYTICS","KẾT NỐI":"COMMUNITY","THUẾ & TÀI CHÍNH":"TAX & FINANCE","Đón khách, xếp lượt, lịch hẹn và doanh số trong một luồng.":"Check-in, turn board, appointments and sales in one flow.","Một mã QR mở menu dịch vụ, tip, đánh giá và thanh toán trên điện thoại.":"One QR opens services, tips, reviews and payments on a phone.","Theo dõi khoản thu, tiền boa, giao dịch và chi trả cho đội ngũ.":"Track income, tips, transactions and team payouts.","AI Receptionist hỗ trợ lịch hẹn và cuộc gọi; Marketing Assistant hỗ trợ tiếp cận khách.":"AI Receptionist supports appointments and calls; Marketing Assistant helps reach customers.","Theo dõi đánh giá và phản hồi của khách sau dịch vụ.":"Track guest reviews and responses after a service.","Phát hành thẻ quà tặng, thẻ số và quản lý quyền lợi thành viên.":"Issue gift and digital cards and manage membership benefits.","Xem xu hướng tiền boa và hiệu suất tại từng điểm QR.":"See tip trends and performance at each QR touchpoint.","Bảng tin, Nhóm & Chợ, Việc làm, nhắn tin và gọi thoại hoặc video.":"Feed, Groups & Market, Jobs, messages and voice or video calls.","Thu nhập, chi phí và biên lai đang chờ xác nhận quyền truy cập.":"Income, expenses and receipts await access confirmation.","Xem trước thu nhập, chi phí và biên lai cho doanh nghiệp và cá nhân.":"Preview income, expenses, and receipts for businesses and individuals.","Cho doanh nghiệp":"For businesses","Cho cá nhân":"For individuals","Lịch & đội ngũ":"Schedule & staff","Menu tùy chỉnh":"Custom menu","Tip & thanh toán":"Tips & payments","Chi trả nhân viên":"Staff payouts","Phản hồi khách":"Customer responses","Thu nhập":"Income","Tin nhắn & cuộc gọi":"Messages & calls","Chi phí & biên lai":"Expenses & receipts","Từ Nexora":"From Nexora","Tin mới, ưu đãi và cập nhật dành cho tiệm":"News, offers and updates for your salon","Tìm chức năng…":"Search tools…","Tìm chức năng":"Search tools","Lọc nhóm chức năng":"Filter tools","Tất cả":"All","POS & vận hành":"POS & operations","Thanh toán & tip":"Payments & tips","Khách hàng & đánh giá":"Customers & reviews","AI & marketing":"AI & marketing","Gift Card & thành viên":"Gift Cards & membership","Báo cáo & thống kê":"Reports & analytics","Cộng đồng":"Community","Thuế & tài chính":"Tax & finance","Xóa lọc":"Clear","Trung tâm":"Hub","Mở SI POS":"Open SI POS","Mở chức năng":"Open tool","Xem chức năng":"View tool","Đang sử dụng":"Available","Sắp ra mắt":"Coming soon","Cần xác nhận quyền":"Access pending","Bán & quản lý":"Sell & manage","2 trợ lý AI":"2 AI assistants","5 màn hình":"5 screens","5 khu vận hành":"5 operating areas","7 màn hình":"7 screens","Quầy & dịch vụ · Lịch & đội ngũ · Khách & tăng trưởng · Doanh thu.":"Front desk & services · Schedule & staff · Customers & growth · Revenue.","QR tại tiệm, nhận tip và thanh toán.":"In-salon QR, tips and payments.","Một mã QR, menu tùy chỉnh và nhiều thao tác cho khách.":"One QR, a configurable menu and multiple guest actions.","Thu nhập tiệm, chi trả nhân viên, giao dịch máy cà thẻ.":"Salon income, staff payouts and card transactions.","AI Receptionist và Marketing Assistant.":"AI Receptionist and Marketing Assistant.","Đánh giá và phản hồi của khách.":"Customer reviews and feedback.","Quản lý Gift Card và Membership Card.":"Manage gift cards and membership cards.","Xu hướng tip và hiệu suất điểm QR.":"Tip trends and QR point performance.","Bảng tin, Việc làm và ưu đãi.":"News, jobs and offers.","Bảng tin, Nhóm & Chợ, Việc làm, tin nhắn và cuộc gọi.":"Feed, jobs, offers, chat, voice and video calls.","Bản xem trước kết nối cộng đồng với nội dung, việc làm, ưu đãi, tin nhắn, gọi thoại và gọi video.":"A community preview with content, jobs, offers, messages, voice calls and video calls.","Nội dung & cộng đồng":"Content & community","Việc làm & ưu đãi":"Jobs & offers","Nhóm & Chợ":"Groups & Market","Fanpage":"Pages","Blog":"Blog","Ca làm thêm":"Extra shifts","Tin nhắn, gọi thoại & video":"Messages, voice & video calls","Thu nhập, chi phí và biên lai.":"Income, expenses and receipts.","Không tìm thấy chức năng":"No tools found","Thử từ khóa khác hoặc hiển thị lại tất cả.":"Try another search or show all tools.","Hiển thị tất cả":"Show all","← Tất cả chức năng":"← All tools","Nhóm việc":"Task groups","Quầy & dịch vụ":"Front desk & services","Khách & tăng trưởng":"Customers & growth","Doanh thu & thanh toán":"Revenue & payments","Đón khách":"Check-in","Xếp lượt":"Turn Board","Chia turn":"Turn Board","Phiếu dịch vụ":"Tickets","Mở bộ thẻ quà tặng và thành viên":"Open gift cards and membership tools","Menu dịch vụ của tiệm":"Salon Service Menu","Hiện có & đề xuất":"Available & proposed","Mở menu dịch vụ đang dùng của tiệm":"Open this salon’s live service menu","Cần thiết lập menu cho tiệm":"Set up this salon’s service menu","Quản lý dịch vụ":"Manage services","Sửa dịch vụ, giá và thời lượng":"Edit services, prices and durations","Menu dịch vụ tự cập nhật":"Auto-updating service menu","Bản thiết kế: mỗi tiệm có menu riêng. Tiệm quản lý dịch vụ, giá và thời lượng trong Salon Settings → Services; menu khách mở trực tiếp từ dữ liệu Nexora.":"Design preview: each salon has its own menu. Edit services, prices and durations in Salon Settings → Services; the customer menu opens the salon’s Nexora data.","Bitcoin Nail Bar là tiệm minh họa trong bản thiết kế":"Bitcoin Nail Bar is the sample salon in this design","Xem menu khách ↗":"View customer menu ↗","Quản lý dịch vụ ↗":"Manage services ↗","Đã hoàn tất":"Completed Services","Báo giá":"Estimate","Chấm công":"Time clock","Đội ngũ thợ":"Technicians","Sản phẩm & bán thêm":"Products & Other Sales","Lịch sử khách":"Customer History","Bảng giá dịch vụ":"Price Menu","Hồ sơ khách":"Customer profiles","Khuyến mãi":"Promotions","Đánh giá":"Reviews","Lễ tân AI":"AI Receptionist","Doanh số":"Sales","Giao dịch":"Transactions","Chi trả thợ":"Staff payouts","Phân tích":"Analytics","Marketing & chiến dịch":"Marketing & campaigns","Tạo chiến dịch":"Create campaign","Quản lý chiến dịch":"Manage campaigns","Hiệu quả marketing":"Marketing performance","Chọn mục tiêu, nhóm khách và thông điệp":"Choose a goal, audience and message","Xem và sửa các bản nháp đã lưu":"View and edit saved drafts","So sánh lượt tiếp cận và khách đặt lịch":"Compare reach and booked appointments","Mở chiến dịch SMS trong NEXORA":"Open SMS campaigns in NEXORA","Xác nhận khách đã đến":"Confirm customer arrival","Theo dõi lượt phục vụ":"Track service rotation","Xem dịch vụ đang làm":"View active services","Hoàn tất thanh toán":"Complete checkout","Xem dịch vụ đã xong":"View completed services","Xem và sắp lịch khách":"View and manage appointments","Ước tính trước dịch vụ":"Estimate service cost","Theo dõi giờ làm của thợ":"Track staff hours","Lịch sử khách và dịch vụ":"Customer and service history","Tạo ưu đãi cho khách":"Create customer offers","Xem phản hồi của khách":"View customer feedback","Hỗ trợ lịch hẹn và liên lạc":"Help with appointments and calls","Xem khoản đã nhận":"View payments received","Xem báo cáo thanh toán hiện có":"View the available payments report","Theo dõi hoạt động thanh toán":"Track payment activity","Xem khoản chi trả nhân viên":"View staff payouts","Xem xu hướng tip và QR":"View tip and QR trends","Điều hành tiệm từ quầy, lịch và đội ngũ đến khách hàng và doanh thu.":"Run your salon across the front desk, schedule, team, customers and revenue.","QR tại tiệm":"In-salon QR","Nhận tip":"Receive tips","Nhận thanh toán":"Receive payments","Chia sẻ & mời":"Share & invite","Quản lý mã QR cho khách, thanh toán và chia sẻ.":"Manage QR codes for customers, payments and sharing.","Thu nhập tiệm":"Salon income","Máy cà thẻ":"Card terminal","Cài đặt":"Settings","Cấu hình":"Settings","Tổng quan tiền tip":"Tip overview","Danh sách tip":"Tip list","Payroll / chi trả":"Payroll / payouts","Hoạt động thanh toán":"Payment activity","Quản lý danh mục":"Category management","Thẻ khách hàng":"Customer cards","Quản lý Gift Card":"Manage gift cards","Báo cáo":"Reports","Đặt lịch":"Booking","Lịch đặt":"Booking calendar","Đặt lịch và lịch hẹn trong SI POS":"Booking and appointments in SI POS","Khách & cuộc gọi":"Customers & calls","Thiết lập":"Setup","Khuyến mãi POS":"POS promotions","Chiến dịch":"Campaigns","Tạo vòng quay":"Prize wheel demo","Chiến dịch · VLinkPay":"Campaigns · VLinkPay","Nội dung":"Content","Lễ tân AI và công cụ marketing trong một nơi.":"AI receptionist and marketing tools in one place.","Đánh giá và phản hồi của khách hàng.":"Customer reviews and feedback.","Xem Reviews":"View reviews","Quản lý thẻ quà tặng và thẻ thành viên.":"Manage gift and membership cards.","Xu hướng tip, bảng xếp hạng và hiệu suất điểm QR.":"Tip trends, rankings and QR point performance.","Xem Analytics":"View analytics","Các mục dự kiến cho cộng đồng Nexora.":"Planned Nexora community tools.","Dự kiến":"Planned","Bảng tin":"News feed","Việc làm":"Jobs","Các mục chờ xác nhận quyền truy cập.":"Tools awaiting access approval.","Xem trước cấu trúc thu nhập, chi phí và biên lai cho doanh nghiệp và cá nhân; quyền truy cập đang chờ xác nhận.":"Preview income, expense, and receipt tools for businesses and individuals; access is pending verification.","Bản định hướng":"Concept preview","BẢN ĐỊNH HƯỚNG":"CONCEPT PREVIEW","Bản giới thiệu cách sắp xếp thu nhập, chi phí và biên lai; chưa kết nối dữ liệu thật.":"A concept for organizing income, expenses, and receipts; no live data is connected.","Cho doanh nghiệp · dự kiến":"For businesses · preview","Cho cá nhân · dự kiến":"For individuals · preview","Tổng quan doanh nghiệp":"Business overview","Thu nhập doanh nghiệp":"Business income","Chi phí vận hành":"Operating expenses","Tổng quan cá nhân":"Personal overview","Thu nhập cá nhân":"Personal income","Chi phí cá nhân":"Personal expenses","Biên lai cá nhân":"Personal receipts","Tổng hợp thu nhập":"Income summary","Chi phí":"Expenses","Kho biên lai":"Receipts","Thu nhập tiệm, chi trả nhân viên và giao dịch máy cà thẻ. Các màn hình chuyên biệt chưa có được đánh dấu đề xuất.":"Salon income, staff payouts and card transactions. Proposed screens are marked.","Tổng thu nhập theo kỳ (đề xuất)":"Income by period (proposed)","Lịch sử chi trả theo nhân viên (đề xuất)":"Payout history by staff member (proposed)","Lịch sử giao dịch máy cà thẻ (đề xuất)":"Card transaction history (proposed)","Đối soát máy cà thẻ (đề xuất)":"Card terminal reconciliation (proposed)","Đang chuẩn bị: tạo nội dung AI, gợi ý trả lời đánh giá, phân nhóm khách và đo hiệu quả chiến dịch.":"In development: AI content, review reply suggestions, customer segments and campaign results.","Kiểu vòng quay cho tiệm":"Prize wheel demo for your salon","Spin Wheel · bản xem thử":"Spin Wheel · preview","Thử vòng quay, rồi mở mục tạo bản nháp chiến dịch ngay trong NEXORA.":"Try the wheel, then open the campaign draft builder in NEXORA.","Tám ô giải minh họa":"Eight sample segments","Đổi tên giải để xem ngay trên vòng quay":"Rename a prize to see it on the wheel","Tạo bản nháp trong NEXORA":"Build a draft in NEXORA","Chọn số ô; đặt tên, số lượng và tỷ lệ cho từng giải. Sau đó chọn thời gian, lượt quay và điều kiện tham gia trong mục tạo chiến dịch. Các biểu tượng ở đây chỉ minh họa cho ảnh giải do tiệm tự chọn. Lượt thử trong bản xem trước có cơ hội bằng nhau ở tám ô.":"Choose the number of segments and set each prize name, quantity and chance. Then set timing, spin limits and entry rules in the campaign builder. These icons only illustrate prize images selected by the salon. All eight segments have equal chances in this demo.","TRẢI NGHIỆM TRÊN MÀN HÌNH · BẢN XEM TRƯỚC":"ON-SCREEN EXPERIENCE · PREVIEW","Tên chiến dịch":"Campaign name","Ưu đãi nổi bật":"Featured offer","Mục tiêu":"Goal","Khuyến khích khách đặt lịch cho lần ghé tiếp theo.":"Encourage customers to book their next visit.","Cách sử dụng":"How to use it","Sau khi hoàn tất dịch vụ, tiệm mời khách thử quay và nhận một ưu đãi cho lần sau.":"After a service, invite customers to spin for an offer on their next visit.","Giá trị cho tiệm":"Value for the salon","Tạo trải nghiệm vui và cho khách thêm lý do quay lại.":"Make the visit fun and give customers a reason to return.","Quay vui, hẹn lần tới":"Spin now, visit again","Bấm Thử quay để xem kết quả":"Press Spin to try the demo","Thử quay":"Spin","Đang quay…":"Spinning…","Tạo chiến dịch trong NEXORA →":"Create a campaign in NEXORA →","Lượt quay ở đây chỉ để xem thử. Mục tạo trong NEXORA lưu bản nháp trên máy, chưa phát hành phần thưởng thật.":"Spins here are only a demo. The NEXORA builder saves a local draft and does not issue real rewards.","Vòng quay tương tác gồm tám ô giải":"Prize wheel demo with eight segments","Giảm 10%":"10% off","Tặng $5":"$5 gift","Dưỡng tay":"Hand care","Giảm 5%":"5% off","Quà nhỏ":"Small gift","Chúc may mắn":"Good luck","Sơn móng":"Nail polish","Ưu đãi lần sau":"Next-visit offer","Ảnh giải":"Prize image","Tỷ lệ trúng":"Winning chance","Quy tắc":"Rules","Bản xem thử":"Preview","Chọn kiểu vòng quay số, đặt từng giải và thử trải nghiệm trước khi tạo chiến dịch.":"Choose a digital wheel template, set each prize and try the experience before creating a campaign.","Ảnh và tên giải":"Prize image and name","Quy tắc chơi":"Game rules","Ưu đãi":"Offer","Lịch sử chi trả theo nhân viên · đề xuất":"Payout history by staff · proposed","Lịch sử giao dịch máy cà thẻ · đề xuất":"Card transaction history · proposed","Đối soát máy cà thẻ · đề xuất":"Card terminal reconciliation · proposed","Tổng thu nhập theo kỳ · đề xuất":"Income by period · proposed","Membership Card · chưa xác minh đích":"Membership Card · link unverified","Đang xem tiệm":"Current salon","Doanh nghiệp":"Businesses","Doanh nghiệp kết nối theo ngành":"Connected businesses by industry","Khám phá danh mục doanh nghiệp; hồ sơ chỉ được công bố sau khi xác nhận thông tin.":"Explore business categories; profiles are published only after details are confirmed.","Bản xem trước danh bạ":"Directory preview","Nail & làm đẹp":"Nail & beauty","Tóc & barber":"Hair & barber","Spa & wellness":"Spa & wellness","Dịch vụ khác":"Other services","Bitcoin Nail Bar · hồ sơ minh họa":"Bitcoin Nail Bar · sample profile","Chưa có hồ sơ công bố":"No public profile yet","Khám phá ngành →":"Explore industry →","Video và quảng bá":"Videos & promotions","Giới thiệu sản phẩm Nexora, các tính năng nổi bật và vị trí dành cho đối tác.":"Nexora product videos, featured tools, and a place for partner promotions.","2 vị trí video · Sản phẩm · Đối tác":"2 video slots · Products · Partners","Chọn video xem thử":"Choose video to preview","Thay video xem thử":"Replace preview video","NEXORA · SẢN PHẨM NỔI BẬT":"NEXORA · FEATURED PRODUCT","VỊ TRÍ QUẢNG BÁ ĐỐI TÁC · BẢN XEM TRƯỚC":"PARTNER PROMOTION SLOT · PREVIEW","Hồ sơ minh họa. Tên, logo và nội dung đối tác sẽ hiển thị sau khi được xác nhận.":"Sample profile. Partner name, logo, and content appear after approval.","Xem danh mục doanh nghiệp →":"Explore business directory →","Video và quảng bá Nexora":"Videos & Nexora promotions","Chọn video giới thiệu Nexora":"Choose Nexora introduction video","Chọn video demo SI POS":"Choose SI POS demo video","Điều hướng Salon Home":"Salon Home navigation","AI Auto · Giới thiệu tính năng":"AI Auto · Feature guide","Tự động cập nhật khi chọn từng mục":"Updates when you select a feature","Cách khám phá":"How it works","Xem nhóm chức năng →":"View tools →","DỰ KIẾN":"PLANNED","CHỜ XÁC NHẬN":"ACCESS PENDING","CHỜ XÁC MINH":"VERIFY DESTINATION","▶ Nghe":"▶ Listen","▶ Nghe giới thiệu":"▶ Listen to intro","Nghe giới thiệu tính năng":"Listen to feature introduction","Nghe giới thiệu slide":"Listen to slide introduction","Khám phá sản phẩm →":"Explore product →","Xem thử tính năng →":"Preview features →","Kết quả":"Result","＋ Phát hành":"＋ Issue card","◷   Theo dõi thẻ sắp hết hạn":"◷   Expiring cards","Tại tiệm":"In salon","Đã phát hành":"Issued","Hướng dẫn cho doanh nghiệp mới":"Getting started for new businesses","Hướng dẫn doanh nghiệp mới":"New business guide","NEXORA · BẮT ĐẦU":"NEXORA · START HERE","Sản phẩm đang xem":"Selected product","Chọn sản phẩm, xem các bước quan trọng và mở đúng màn hình để bắt đầu.":"Choose a product, review the key steps and open the right screen to begin.","Xem tất cả tính năng":"View all features","Chọn sản phẩm để xem lộ trình bắt đầu, rồi mở trực tiếp màn hình cần dùng.":"Choose a product to see the first steps and open the right screen.","12 hướng dẫn sản phẩm":"12 product guides","Việc thường dùng":"Daily tasks","Hướng dẫn bắt đầu":"Getting started","Trang chủ Nexora ↗":"Nexora Home ↗","Công cụ doanh nghiệp":"Business tools","Tổng quan One QR":"One QR overview","Tổng quan thanh toán":"Payment overview","Gói dịch vụ":"Service plan","Quản lý":"Manage","Đăng xuất":"Sign out","Đăng xuất Nexora":"Sign out of Nexora","Để đăng xuất tài khoản, mở Nexora và chọn Đăng xuất trong menu tài khoản. Trang đang xem chỉ là bản giới thiệu.":"To sign out of your account, open Nexora and choose Sign out from your account menu. This page is a preview.","Ở lại":"Stay here","Mở Nexora ↗":"Open Nexora ↗","Chọn sản phẩm cần hướng dẫn":"Choose a product to learn","Xem tất cả tính năng →":"View all features →","Xem bản giới thiệu":"View the preview","Xem nhóm chức năng":"View tools","Thử ngay →":"Try demo →","Xem trước →":"View preview →","Mở màn hình ↗":"Open screen ↗","AI Voice & cuộc gọi":"AI Voice & calls","Tổng quan AI Voice":"AI Voice overview","Khách từ cuộc gọi":"Call customers","Thiết lập AI Voice ↗":"Set up AI Voice ↗","AI Voice · SI POS":"AI Voice · SI POS","Cuộc gọi và khách hàng trong cùng một nơi":"Calls and customers in one place","Xem lịch sử cuộc gọi, nắm nhu cầu của khách và chuyển tiếp việc đặt lịch hoặc chăm sóc ngay trong SI POS.":"Review call history, understand customer needs, and coordinate bookings or follow-up in SI POS.","Mở dữ liệu cuộc gọi ↗":"Open call data ↗","Bản minh họa giao diện.":"Interface preview.","Các cuộc gọi và khách bên dưới là dữ liệu mẫu để xem bố cục; trang HTML này chưa kết nối tổng đài hoặc hồ sơ khách thật.":"The calls and customers below are sample data for this layout; this HTML page is not connected to live calls or customer records.","Các phần AI Voice trong SI POS":"AI Voice sections in SI POS","Cuộc gọi mẫu":"Sample calls","Cần nhân viên theo dõi":"Need staff follow-up","Yêu cầu đặt lịch":"Booking requests","Chỉ số minh họa":"Sample metrics","Chọn một cuộc gọi để xem khách và nội dung trao đổi.":"Select a call to see its customer and conversation details.","Xem nhật ký thật ↗":"View live call log ↗","Tìm tên, số điện thoại hoặc nhu cầu…":"Search name, phone, or request…","Tìm trong cuộc gọi mẫu":"Search sample calls","Lọc cuộc gọi mẫu":"Filter sample calls","Tất cả cuộc gọi":"All calls","Đã tiếp nhận":"Answered","Cần theo dõi":"Follow-up needed","Nhỡ cuộc gọi":"Missed calls","Khách mẫu A":"Sample customer A","Khách mẫu B":"Sample customer B","Số chưa lưu":"Unknown caller","10:45 · Hỏi lịch làm móng · AI đã tiếp nhận":"10:45 · Nail booking request · AI answered","09:20 · Hỏi giá dịch vụ · Cần gọi lại":"09:20 · Service price request · Call back","Ví dụ ngày trước · Cuộc gọi nhỡ":"Previous day example · Missed call","2 phút 18 giây":"2 min 18 sec","1 phút 04 giây":"1 min 04 sec","Chưa kết nối":"Not connected","Không có cuộc gọi mẫu phù hợp.":"No matching sample calls.","Hồ sơ khách liên quan":"Related customer profile","Thông tin gắn với cuộc gọi đang chọn.":"Details linked to the selected call.","Số liên hệ":"Contact number","Nhu cầu":"Request","Việc tiếp theo":"Next action","Mở khách hàng ↗":"Open customers ↗","Mở lịch hẹn ↗":"Open appointments ↗","Cuộc gọi và khách trong SI POS":"Calls and customers in SI POS","Xem cuộc gọi và kết quả tiếp nhận":"Review calls and outcomes","Mở hồ sơ gắn với cuộc gọi":"Open profiles linked to calls","Hướng dẫn cấu hình trên Nexora":"Setup guide on Nexora","Tổng quan thẻ quà tặng":"Gift Card overview","Trong SI POS":"Inside SI POS","SI POS · THẺ & THÀNH VIÊN":"SI POS · CARDS & MEMBERSHIP","Cài đặt Lễ tân AI":"AI Receptionist Settings"},salonTranslations={"QUẦY TIẾP ĐÓN":"FRONT DESK","Xếp lượt":"Turn board","Chia turn":"Turn Board","Dịch vụ":"Services","Thu tiền":"Checkout","TẠI TIỆM":"IN SALON","Thanh toán":"Payments","HOẠT ĐỘNG":"ACTIVITY","2 TRỢ LÝ":"2 ASSISTANTS","Lễ tân":"Receptionist","Đặt lịch · Cuộc gọi":"Booking · Calls","Tiếp thị":"Marketing","SMS · Chiến dịch":"SMS · Campaigns","CHIẾN DỊCH":"CAMPAIGNS","PHẢN HỒI":"FEEDBACK","Phản hồi khách":"Customer feedback","TIỀN BOA & QR":"TIP & QR","Xu hướng tiền boa":"Tip trends","Điểm QR":"QR points","KẾT NỐI":"CONNECT","BIÊN LAI":"RECEIPT","CHỜ XÁC NHẬN":"ACCESS PENDING","VIDEO VÀ HÌNH ẢNH":"MEDIA SHOWCASE","Lịch hẹn":"Appointments","Lịch":"Calendar","Khách hàng":"Customers","Nhật ký cuộc gọi":"Call log","Gói sử dụng":"Plans","Hướng dẫn thiết lập AI Voice":"AI Voice setup guide","Liên kết giới thiệu":"Referral Link","QR mời nhân viên":"Staff Invite QR","Tin tức & Tài liệu":"News & Library","Tiền boa & Thanh toán ↗":"Tip & Pay ↗","Thu nhập tiệm":"Salon income","Chi trả thợ":"Staff payouts","Giao dịch":"Transactions","Bảng tin":"Feed","Trò chuyện":"Chat","Gọi thoại":"Voice","Ưu đãi & Mã giảm giá":"Deal & Coupon","Cài đặt tiệm ↗":"Salon settings ↗","KHÁM PHÁ SẢN PHẨM NEXORA":"NEXORA PRODUCT STUDIO","Trực tuyến":"Online","AI & tiếp thị":"AI & marketing","AI TOUR · GIỚI THIỆU TỰ ĐỘNG":"AI TOUR · AUTOMATIC INTRO","Chuẩn bị chiến dịch SMS":"Prepare an SMS campaign","Chọn nhóm khách":"Choose an audience","Dịch vụ ↗":"Services ↗","Đặt lịch ↗":"Book an appointment ↗","GÓC NHÌN SẢN PHẨM":"PRODUCT INSIGHT","MÀN HÌNH ĐANG XEM":"CURRENT SCREEN","Hướng dẫn thiết lập AI Gọi thoại":"AI Voice setup guide","LUỒNG SỬ DỤNG":"HOW IT WORKS","TÍNH NĂNG CHÍNH":"KEY FEATURES","Màn hình minh họa":"Illustrated screen","Phục vụ":"In service","Từ nhóm khách đến kết quả chiến dịch":"From audience to campaign results","Xem màn hình tiếp theo":"View next screen","Xem phản hồi và kết quả":"Review responses and results","Xem trang sản phẩm →":"View product page →","TIỆM ĐANG XEM":"CURRENT SALON","Xác minh doanh nghiệp":"Business verification","Hỗ trợ":"Support","BẢN XEM TRƯỚC":"PREVIEW","KHÔNG GIAN LÀM VIỆC CỦA TIỆM":"YOUR SALON WORKSPACE","Một nơi để bắt đầu ngày làm việc, mở nhanh các màn hình vận hành và đi đến mọi sản phẩm Nexora dành cho tiệm.":"Start the workday, open daily operations and reach every Nexora product for your salon in one place.","Mở SI POS →":"Open SI POS →","Xem Dashboard →":"View dashboard →","Giới thiệu sản phẩm Nexora":"Nexora product showcase","Sản phẩm trước":"Previous product","Sản phẩm tiếp theo":"Next product","Chọn sản phẩm trong slide":"Choose a product slide","Tạm dừng trình chiếu":"Pause slideshow","Phát trình chiếu":"Play slideshow","VIDEO GIỚI THIỆU NEXORA":"NEXORA INTRO VIDEO","Xem toàn bộ trải nghiệm trong một câu chuyện":"See the full experience in one story","Giới thiệu cách SI POS kết nối AI Hub, AI Marketing, One QR, Gift Card và những công cụ dành cho tiệm.":"See how SI POS connects AI Hub, AI Marketing, One QR, Gift Card and the tools your salon needs.","Vận hành tiệm":"Salon operations","Tăng trưởng":"Growth","Khám phá từng sản phẩm →":"Explore every product →","Một hệ thống cho tiệm của bạn":"One system for your salon","Video giới thiệu sẽ được cập nhật tại đây":"The introduction video will appear here","Vị trí dành cho video giới thiệu Nexora":"Placeholder for the Nexora introduction video","Video giới thiệu Nexora":"Nexora introduction video","VIDEO 1 · TỔNG QUAN":"VIDEO 1 · OVERVIEW","VIDEO 2 · VẬN HÀNH":"VIDEO 2 · OPERATIONS","Toàn cảnh Nexora Touch":"The Nexora Touch ecosystem","SI POS kết nối AI Hub, One QR, Gift Card và các công cụ tăng trưởng cho tiệm.":"SI POS connects AI Hub, One QR, Gift Card and growth tools for your salon.","SI POS trong thực tế":"SI POS in action","Từ đón khách và xếp lượt thợ đến hoàn tất dịch vụ, thanh toán.":"From check-in and Turn Board to completed services and checkout.","Một ngày làm việc cùng SI POS":"A workday with SI POS","Video sẽ được cập nhật":"Video coming soon","Vị trí dành cho video demo SI POS":"Placeholder for the SI POS demo video","Video demo SI POS":"SI POS demo video","Video giới thiệu Nexora và SI POS":"Nexora and SI POS introduction videos","Khám phá SI POS →":"Explore SI POS →","MỘT HỆ THỐNG KẾT NỐI":"ONE CONNECTED SYSTEM","Vận hành":"Operations","Trải nghiệm khách":"Customer experience","Tiếp đón & tăng trưởng":"Reception & growth","Việc hằng ngày":"Daily work","Sản phẩm":"Products","Chủ tiệm":"Salon owner","Xem thử UI":"Explore UI","Giới thiệu":"Introduction","Khám phá giao diện từng tính năng":"Explore every feature interface","Chọn một sản phẩm và khám phá cách từng công cụ hoạt động trong tiệm.":"Choose a product and see how its tools work in the salon.","Danh sách chức năng":"Feature list","Màn hình tính năng":"Feature screen","Chọn sản phẩm":"Choose a product","Chọn tính năng":"Choose a feature","Bắt đầu ngày làm việc":"Start your workday","Những màn hình dùng thường xuyên tại quầy":"Frequently used front desk screens","Check-in khi khách đến":"Check in arriving customers","Xem khách sắp đến":"See upcoming appointments","Theo dõi thứ tự phục vụ":"Track the service rotation","Hoàn tất dịch vụ":"Complete the visit","Kiểm tra công việc đang mở":"Review open service tickets","One QR tại quầy":"One QR at the front desk","Xem mã QR tại điểm phục vụ":"View the QR at the service point","Theo dõi giờ làm của thợ":"Track staff hours","Tiền boa":"Tips","Xem các khoản tip trong ngày":"Review today’s tips","Dành cho chủ tiệm":"For salon owners","Kiểm tra vận hành và dòng tiền":"Review operations and cash flow","Chi trả nhân viên":"Staff payouts","Nhân viên":"Staff","Cài đặt tiệm":"Salon settings","Khám phá tính năng Nexora":"Explore Nexora features","Hệ sinh thái Nexora cho doanh nghiệp":"The Nexora ecosystem for businesses","Hình ảnh và tính năng của các sản phẩm, gồm cả bộ AI Marketing":"Product screens and features across Nexora, including AI Marketing","Hai trợ lý AI hỗ trợ tiếp đón và phát triển tiệm.":"Two AI assistants for reception and salon growth.","Hiệu quả":"Results","10 khu giới thiệu":"10 product showcases","12 khu giới thiệu":"12 product showcases","Chiến dịch SMS":"SMS Campaign","Trong AI Marketing":"Part of AI Marketing","Khám phá quy trình chọn khách, soạn SMS, lên lịch gửi và xem phản hồi.":"Preview audience selection, SMS drafting, scheduling and responses.","Nhóm khách":"Audience","Nội dung":"Content","Nội dung SMS":"SMS content","Lịch gửi":"Schedule","Theo dõi":"Track results","Xem chiến dịch":"Explore campaign preview","01 Khách":"01 Audience","02 Nội dung":"02 Content","03 Lịch gửi":"03 Schedule","Chiến dịch cho tiệm":"Salon campaign","minh họa":"Preview","Spin Wheel":"Spin Wheel","minh họa tương tác":"Interactive preview","Kết nối qua nội dung cộng đồng, việc làm, tin nhắn và cuộc gọi.":"Connect through community content, jobs, messages and calls.","Doanh nghiệp, người làm nghề và khách hàng kết nối qua nội dung, cơ hội và hội thoại.":"Businesses, professionals and customers connect through content, opportunities and conversations.","Kết nối doanh nghiệp, người làm nghề và khách hàng qua nội dung, cơ hội và hội thoại.":"Connect businesses, professionals and customers through content, opportunities and conversations.","Nơi doanh nghiệp, người làm nghề và khách hàng kết nối qua nội dung, cơ hội và hội thoại.":"A place for businesses, professionals and customers to connect through content, opportunities and conversations.","Bảng tin & Nhóm":"Feed & Groups","Việc làm":"Jobs","Tin nhắn & Nhóm chat":"Messages & group chats","Gọi thoại & video":"Voice & video calls","Nội dung & nhóm":"Content & groups","Việc làm & ca thêm":"Jobs & extra shifts","Deal & Coupon":"Deals & coupons","Việc làm & ưu đãi":"Jobs & offers","Chat, thoại & video":"Chat, voice & video","Bảng tin, Nhóm & Chợ, Việc làm, tin nhắn và cuộc gọi.":"Feed, Groups & Market, Jobs, messages and calls.","Kiểu vòng quay giúp tiệm hình dung một chiến dịch tương tác với khách.":"A prize wheel preview shows how an interactive customer campaign could work.","VÒNG QUAY TƯƠNG TÁC":"INTERACTIVE PRIZE WHEEL","Đặt phần thưởng":"Set rewards","Xem trước":"Preview","Thử quay":"Try a spin","Thử vòng quay":"Try the prize wheel","Quà tặng":"Rewards","Lượt quay":"Spins","Kết quả":"Results","Có & đề xuất":"Available & proposed","Chiến dịch, nội dung và công cụ tiếp thị cho tiệm.":"Campaigns, content and marketing tools for your salon.","AI Ads":"AI Ads","Vòng quay tương tác":"Prize wheel demo","Giao diện minh họa và chức năng tiêu biểu của từng sản phẩm":"Example screens and key features of every product","Chức năng tiêu biểu":"Key features","Xem chi tiết":"View details","Điều hành khách, thợ và dịch vụ trong một luồng.":"Run customers, staff and services in one flow.","Một điểm QR cho các tương tác của khách tại tiệm.":"One QR touchpoint for customers in the salon.","Một mã QR mở menu do doanh nghiệp cấu hình cho khách.":"One QR opens a business-configured menu for guests.","Check-in & đặt lịch":"Check-in & booking","Dịch vụ & ưu đãi":"Services & offers","Đánh giá & tiền boa":"Reviews & tips","Theo dõi khoản thu và khoản chi trả rõ ràng hơn.":"See salon income and payouts more clearly.","Tiếp đón khách và quản lý hoạt động marketing.":"Welcome customers and manage marketing activity.","Lắng nghe khách sau mỗi lần sử dụng dịch vụ.":"Listen to customers after each visit.","Quản lý quà tặng và nuôi dưỡng lần ghé tiếp theo.":"Manage gifts and encourage the next visit.","Phát hành, thiết kế và quản lý thẻ; nhận thanh toán, theo dõi thành viên.":"Issue, design and manage cards; accept card payments and track memberships.","Phát hành thẻ số":"Issue digital card","Thẻ thành viên":"Membership card","Quản lý thẻ":"Manage cards","Thanh toán bằng thẻ":"Card payment","Quản lý thẻ đã phát hành":"Manage issued cards","Thiết lập bán online nhanh":"Quick online setup","Thiết lập E-Gift nâng cao":"Advanced E-Gift setup","Nhận thanh toán bằng thẻ":"Accept card payment","Chương trình thành viên":"Membership program","Báo cáo thành viên":"Membership report","Lịch sử thanh toán thẻ":"Card payment history","Thẻ sắp hết hạn":"Expiring cards","Phát hành, thiết kế, quản lý thẻ và chương trình thành viên.":"Issue, design and manage cards and membership programs.","Phát hành, thiết kế, quản lý và nhận thanh toán bằng thẻ quà tặng; theo dõi thành viên và hạn thẻ.":"Issue, design, manage and accept gift cards; track memberships and expiration.","Phát hành & thiết kế":"Issue & design","Quản lý & sử dụng":"Manage & accept","Thành viên & báo cáo":"Membership & reports","Nhìn xu hướng để điều chỉnh hoạt động của tiệm.":"Use trends to adjust salon operations.","Không gian kết nối cộng đồng salon đang dự kiến.":"A proposed space for the salon community.","Việc làm & Ưu đãi":"Jobs & Offers","Cấu trúc thu chi và biên lai chờ xác nhận quyền.":"Income, expenses and receipts await access verification.","Xem trước cách doanh nghiệp và cá nhân sắp xếp thu nhập, chi phí và biên lai.":"Preview how businesses and individuals organize income, expenses, and receipts.","Cho doanh nghiệp":"For businesses","Cho cá nhân":"For individuals","Thu chi":"Income & expenses","Biên lai":"Receipts","QR tại tiệm":"In-salon QR","Nhận tip":"Accept tips","Mời nhân viên":"Invite staff","Nhận thanh toán":"Receive payments","Danh sách tip":"Tip list","Hoạt động thanh toán":"Payment activity","Lịch hẹn AI":"AI appointments","Chiến dịch":"Campaigns","Xem đánh giá":"View reviews","Quản lý Gift Card":"Manage Gift Cards","Xu hướng tip":"Tip trends","Hiệu suất QR":"QR performance","Bảng xếp hạng":"Rankings","Bảng tin · dự kiến":"News feed · planned","Việc làm · dự kiến":"Jobs · planned","Ưu đãi · dự kiến":"Offers · planned","Thu nhập · dự kiến":"Income · planned","Chi phí · dự kiến":"Expenses · planned","Biên lai · dự kiến":"Receipts · planned","Sản phẩm trong không gian tiệm":"Products in your salon workspace","Chọn một mục để xem các nhóm chức năng và màn hình con":"Choose a product to see its tools and screens","9 sản phẩm":"9 products","Trung tâm":"Hub","Đang dùng":"Available","2 trợ lý":"2 assistants","Bán & quản lý":"Sell & manage","Sắp ra mắt":"Coming soon","Chờ xác nhận":"Access pending","Quầy, lịch hẹn, đội ngũ và doanh số.":"Front desk, appointments, team and sales.","QR tại tiệm, tip và thanh toán.":"In-salon QR, tips and payments.","Khoản thu, tip, chi trả và giao dịch.":"Income, tips, payouts and transactions.","Lễ tân AI và công cụ marketing.":"AI reception and marketing tools.","Đánh giá và phản hồi của khách.":"Customer reviews and feedback.","Xu hướng tip và hiệu suất QR.":"Tip trends and QR performance.","Bảng tin, việc làm và ưu đãi.":"News, jobs and offers.","Thu nhập, chi phí và biên lai.":"Income, expenses and receipts.","Xem chức năng →":"View tools →","Thông tin từ Nexora":"Updates from Nexora","Xem thông báo, tài liệu và lịch sự kiện trong News & Library.":"Find updates, resources and event schedules in News & Library.","Mở News & Library ↗":"Open News & Library ↗","SẢN PHẨM":"PRODUCT","Minh họa":"Preview","Khám phá cách SI POS kết nối công việc tại quầy từ đón khách đến hoàn tất dịch vụ.":"Explore how SI POS connects front desk work from check-in to service completion."};
Object.assign(salonTranslations,{"5 sao":"5 stars","QR khách tự check-in":"Customer self check-in QR","Thiết bị tự check-in":"Self check-in devices","Lịch hẹn của thợ":"Technician appointments","Khách đặt lịch":"Booking requests","Lịch hẹn của khách":"Customer appointments","Thiết lập AI Voice":"AI Voice setup","Báo cáo POS":"POS reports","Máy in biên lai":"Receipt printer","Tin nhắn, nhóm chat & cuộc gọi":"Messages, group chats & calls"});
const toEnglish=value => {
    if (salonTranslations[value]) return salonTranslations[value];
    if (translations[value]) return translations[value];
    const count = value.match(/^(\d+) chức năng$/);
    if (count) return `${count[1]} tools`;
    const productCount = value.match(/^(\d+) sản phẩm$/);
    if (productCount) return `${productCount[1]} products`;
    const itemCount = value.match(/^(\d+) mục$/);
    if (itemCount) return `${itemCount[1]} items`;
    const onboardingStep = value.match(/^BƯỚC (\d+)$/);
    if (onboardingStep) return `STEP ${onboardingStep[1]}`;
    const selectedCount = value.match(/^(\d+) đã chọn$/);
    if (selectedCount) return `${selectedCount[1]} selected`;
    if (value.endsWith(' · chưa khả dụng')) return `${toEnglish(value.slice(0, -16))} · unavailable`;
    if (value.startsWith('Kết quả lượt thử: ')) return `Demo result: ${toEnglish(value.slice('Kết quả lượt thử: '.length))}`;
    if (value.startsWith('Vòng quay tương tác: ')) return `Prize wheel demo: ${value.slice('Vòng quay tương tác: '.length).split(', ').map(toEnglish).join(', ')}`;
    return value;
  };
const toLocalized=value=>toEnglish(value);
function localDestination(href,opsView){
 if(href[0]==='#'&&document.getElementById(href.slice(1)))return href;
 if(href.startsWith('nexora_home_de_xuat.html'))return 'nexora-home.html'+href.slice('nexora_home_de_xuat.html'.length);
 if(href==='https://nexoratouch.com/dashboard/settings/staff')return 'pos-front-desk-staff.html';
 if(href==='https://nexoratouch.com/dashboard/reports?tab=receive_payments')return 'pos-technician-report.html?tab=store';
 return window.NEXORA_SHELL_NAV.resolve(href,opsView);
}
const localizedPair=(vi,en)=>en;
function setLocalizedText(element,vi,en){element.dataset.localizedDynamic='';element.textContent=en;}
function applyLanguage(){
 const root=document.getElementById('salon-home-view');
 root.querySelectorAll('a[href]').forEach(link=>{const target=localDestination(link.getAttribute('href'),link.dataset.opsView);if(target)link.setAttribute('href',target);});
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement.closest('[data-localized-dynamic]'))continue;const text=node.nodeValue.trim();if(text)node.nodeValue=node.nodeValue.replace(text,toEnglish(text));}
 root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(element=>{for(const name of ['aria-label','placeholder','title'])if(element.hasAttribute(name))element.setAttribute(name,toEnglish(element.getAttribute(name)));});
 root.querySelectorAll('[data-marketing-en],[data-tax-en],[data-booking-en]').forEach(element=>{element.textContent=element.dataset.marketingEn||element.dataset.taxEn||element.dataset.bookingEn;});
}
function openWheelDemo(){window.location.href='vlinkpay-campaigns.html?view=create';}
const nexora='https://nexoratouch.com';
const activeMenuUrl='../menu/menu.html';
const servicesSettingsUrl='pos-salon-settings.html?section=services';
const catalog={
    oneqr: { title: 'One QR', description: 'Một mã QR cố định với menu theo vai trò. Khách chọn check-in, lịch hẹn, dịch vụ, ưu đãi, đánh giá, tiền boa hoặc thanh toán tùy cấu hình.', status: '7 công cụ QR', groups: [
      { name: 'QR tại tiệm', items: [
        { label: 'OneQR', url: nexora + '/dashboard/touchpoints?tab=stations&section=one-qr' },
        { label: 'Nhận tip', url: nexora + '/dashboard/touchpoints?tab=stations&section=tip' },
        { label: 'Nhận thanh toán', url: nexora + '/dashboard/touchpoints?tab=stations&section=payment' },
        { label: 'QR khách tự check-in', url: nexora + '/dashboard/pos/public-checkin' },
        { label: 'Thiết bị tự check-in', url: nexora + '/dashboard/pos/devices' }
      ]},
      { name: 'Chia sẻ & mời', items: [
        { label: 'Referral Link', url: nexora + '/dashboard/touchpoints?tab=stations&section=referral' },
        { label: 'Staff Invite QR', url: nexora + '/dashboard/touchpoints?tab=stations&section=staff-invite' }
      ]}
    ]},
    payments: { title: 'Payments & Payouts', description: 'Thu nhập tiệm, chi trả nhân viên và giao dịch máy cà thẻ. Các màn hình chuyên biệt chưa có được đánh dấu đề xuất.', status: '7 màn hình', groups: [
      { name: 'Thu nhập tiệm', items: [
        { label: 'Nhận thanh toán', url: nexora + '/dashboard/reports?tab=receive_payments' },
        { label: 'Tổng thu nhập theo kỳ (đề xuất)', unavailable: true }
      ]},
      { name: 'Chi trả nhân viên', items: [
        { label: 'Tổng quan tiền tip', url: nexora + '/dashboard/tips?tab=overview' },
        { label: 'Danh sách tip', url: nexora + '/dashboard/reports?tab=tips' },
        { label: 'Payroll / chi trả', url: nexora + '/dashboard/tips?tab=payouts' },
        { label: 'Direct Savings', url: nexora + '/dashboard/tips?tab=savings' },
        { label: 'Lịch sử chi trả theo nhân viên (đề xuất)', unavailable: true }
      ]},
      { name: 'Máy cà thẻ', items: [
        { label: 'Hoạt động thanh toán', url: nexora + '/dashboard/reports?tab=direct_payments' },
        { label: 'Lịch sử giao dịch máy cà thẻ (đề xuất)', unavailable: true },
        { label: 'Đối soát máy cà thẻ (đề xuất)', unavailable: true }
      ]},
      { name: 'Cấu hình', items: [
        { label: 'Quản lý danh mục', url: nexora + '/dashboard/category-management' }
      ]}
    ]},
    pos: { title: 'SI POS', description: 'Điều hành tiệm từ quầy, lịch và đội ngũ đến khách hàng và doanh thu.', status: 'Trung tâm', groups: [
      { name: 'Quầy & dịch vụ', items: [
        { label: 'Đón khách', description: 'Xác nhận khách đã đến', icon: 'arrival', url: nexora + '/dashboard/pos?tab=checkin' },
        { label: 'Phiếu dịch vụ', description: 'Xem dịch vụ đang làm', icon: 'ticket', url: nexora + '/dashboard/pos?tab=orderlist' },
        { label: 'Chia turn', description: 'Theo dõi lượt phục vụ', icon: 'queue', url: nexora + '/dashboard/pos?tab=turnboard' },
        { label: 'Thu tiền', description: 'Hoàn tất thanh toán', icon: 'card', url: nexora + '/dashboard/pos?tab=checkoutcustomer' },
        { label: 'Gift Card Center', description: 'Mở bộ thẻ quà tặng và thành viên', icon: 'gift', url: '#module-gift' },
        { label: 'Đã hoàn tất', description: 'Xem dịch vụ đã xong', icon: 'done', url: nexora + '/dashboard/pos?tab=completed' },
        { label: 'Menu dịch vụ của tiệm', description: activeMenuUrl ? 'Mở menu dịch vụ đang dùng của tiệm' : 'Cần thiết lập menu cho tiệm', icon: 'list', url: activeMenuUrl || servicesSettingsUrl },
        { label: 'Quản lý dịch vụ', description: 'Sửa dịch vụ, giá và thời lượng', icon: 'settings', url: servicesSettingsUrl }
      ]},
      { name: 'Lịch & đội ngũ', items: [
        { label: 'Lịch hẹn', description: 'Xem và sắp lịch khách', icon: 'calendar', url: nexora + '/dashboard/pos?tab=booking' },
        { label: 'Lịch đặt', description: 'Xem lịch đặt theo ngày', icon: 'calendar', url: '#pos-booking-calendar' },
        { label: 'Lịch hẹn của thợ', description: 'Xem giờ hẹn theo từng thợ', icon: 'team', url: '#pos-booking-staff' },
        { label: 'Báo giá', description: 'Ước tính trước dịch vụ', icon: 'estimate', url: nexora + '/dashboard/pos?tab=estimate' },
        { label: 'Chấm công', description: 'Theo dõi giờ làm của thợ', icon: 'clock', url: nexora + '/dashboard/pos?tab=timeclock' }
      ]},
      { name: 'Khách & tăng trưởng', items: [
        { label: 'Khách đặt lịch', description: 'Xem yêu cầu đặt lịch của khách', icon: 'calendar', url: '#pos-booking-requests' },
        { label: 'Lịch đặt', description: 'Xem giờ khách đã đặt', icon: 'calendar', url: '#pos-booking-calendar' },
        { label: 'Lịch hẹn của khách', description: 'Xem lịch hẹn của khách', icon: 'customer', url: '#pos-booking-customers' },
        { label: 'Lịch hẹn của thợ', description: 'Xem appointment theo thợ', icon: 'team', url: '#pos-booking-staff' },
        { label: 'Hồ sơ khách', description: 'Lịch sử khách và dịch vụ', icon: 'customer', url: nexora + '/dashboard/pos?tab=customer' },
        { label: 'Loyalty', description: 'Điểm thưởng và quyền lợi khách hàng', icon: 'star', url: nexora + '/dashboard/pos/loyalty' },
        { label: 'Khuyến mãi', description: 'Tạo ưu đãi cho khách', icon: 'gift', url: nexora + '/dashboard/pos/promotions' },
        { label: 'Đánh giá', description: 'Xem phản hồi của khách', icon: 'star', url: nexora + '/dashboard/reviews' },
        { label: 'Lễ tân AI', description: 'Hỗ trợ lịch hẹn và liên lạc', icon: 'spark', url: '#pos-ai-voice' }
      ]},
      { name: 'Marketing & chiến dịch', items: [
        { label: 'Tạo chiến dịch', description: 'Chọn mục tiêu, nhóm khách và thông điệp', icon: 'spark', url: 'products/ai-marketing/studio.html#create' },
        { label: 'Quản lý chiến dịch', description: 'Xem và sửa các bản nháp đã lưu', icon: 'list', url: 'products/ai-marketing/studio.html#manage' },
        { label: 'Hiệu quả marketing', description: 'So sánh lượt tiếp cận và khách đặt lịch', icon: 'chart', url: 'products/ai-marketing/studio.html#performance' },
        { label: 'SMS Campaigns', description: 'Mở chiến dịch SMS trong NEXORA', icon: 'phone', url: nexora + '/dashboard/ai-hub?tab=sms-campaigns' }
      ]},
      { name: 'AI Voice & cuộc gọi', items: [
        { label: 'Tổng quan AI Voice', description: 'Cuộc gọi và khách trong SI POS', icon: 'phone', url: '#pos-ai-voice' },
        { label: 'Nhật ký cuộc gọi', description: 'Xem cuộc gọi và kết quả tiếp nhận', icon: 'list', url: '#pos-call-log' },
        { label: 'Khách từ cuộc gọi', description: 'Mở hồ sơ gắn với cuộc gọi', icon: 'customer', url: '#pos-voice-customers' },
        { label: 'Thiết lập AI Voice', description: 'Hướng dẫn cấu hình trên Nexora', icon: 'settings', url: nexora + '/dashboard/ai-hub/setup-guide' }
      ]},
      { name: 'Doanh thu & thanh toán', items: [
        { label: 'Doanh số', description: 'Xem báo cáo thanh toán hiện có', icon: 'chart', url: nexora + '/dashboard/reports?tab=receive_payments' },
        { label: 'Giao dịch', description: 'Theo dõi hoạt động thanh toán', icon: 'list', url: nexora + '/dashboard/reports?tab=direct_payments' },
        { label: 'Chi trả thợ', description: 'Xem khoản chi trả nhân viên', icon: 'team', url: nexora + '/dashboard/tips?tab=payouts' },
        { label: 'Phân tích', description: 'Xem xu hướng tip và QR', icon: 'chart', url: nexora + '/dashboard/analytics' }
      ]},
      { name: 'Quản lý POS', items: [
        { label: 'Cài đặt tiệm', description: 'Thông tin và cấu hình vận hành', icon: 'settings', url: nexora + '/dashboard/pos/settings/salon-information' },
        { label: 'Báo cáo POS', description: 'Theo dõi thợ và doanh thu', icon: 'chart', url: nexora + '/dashboard/pos/report/technician' },
        { label: 'Máy in biên lai', description: 'Cài đặt máy in hóa đơn', icon: 'settings', url: nexora + '/dashboard/pos/printer' }
      ]}
    ]},
    aihub: { title: 'AI Hub', description: 'Lễ tân AI và công cụ marketing trong một nơi.', status: '2 trợ lý AI', groups: [
      { name: 'AI Receptionist', sections: [
        { name: 'Đặt lịch', items: [
          { label: 'Appointments', url: nexora + '/dashboard/ai-hub?tab=booking&view=today' },
          { label: 'Calendar', url: nexora + '/dashboard/ai-hub?tab=booking&view=calendar' }
        ]},
        { name: 'Khách & cuộc gọi', items: [
          { label: 'Customers', url: '#pos-voice-customers' },
          { label: 'Call Log', url: '#pos-call-log' }
        ]},
        { name: 'Thiết lập', items: [
          { label: 'Plans', url: nexora + '/dashboard/ai-hub?tab=plans' },
          { label: 'AI Receptionist Settings', url: nexora + '/dashboard/ai-hub?tab=settings' },
          { label: 'AI Voice setup guide', url: nexora + '/dashboard/ai-hub/setup-guide' }
        ]}
      ]},
      { name: 'Marketing Assistant', upcoming: 'Đang chuẩn bị: tạo nội dung AI, gợi ý trả lời đánh giá, phân nhóm khách và đo hiệu quả chiến dịch.', sections: [
        { name: 'Nexora', items: [
          { label: 'SMS Campaigns', url: nexora + '/dashboard/ai-hub?tab=sms-campaigns' },
          { label: 'Khuyến mãi POS', url: nexora + '/dashboard/pos/promotions' },
          { label: 'Reviews', url: nexora + '/dashboard/reviews' },
          { label: 'Khách hàng', url: nexora + '/dashboard/ai-hub?tab=customers' },
          { label: 'Analytics', url: nexora + '/dashboard/analytics' }
        ]},
        { name: 'VLinkPay', items: [
          { label: 'Chiến dịch', url: 'https://merchant.vlinkpay.com/campaign-management?pageIndex=0&pageSize=10', newTab: true },
          { label: 'Tạo vòng quay', demo: 'wheel' },
          { label: 'AI Ads', url: 'https://merchant.vlinkpay.com/marketing-tools', newTab: true }
        ]}
      ]}
    ]},
    reviews: { title: 'Reviews', description: 'Đánh giá và phản hồi của khách hàng.', status: 'Đang sử dụng', groups: [
      { name: 'Đánh giá', items: [{ label: 'Xem Reviews', url: nexora + '/dashboard/reviews' }] }
    ]},
    gift: { title: 'Gift Card Center', description: 'Phát hành, thiết kế, quản lý và nhận thanh toán bằng thẻ quà tặng; theo dõi thành viên và hạn thẻ.', status: 'Đang sử dụng', groups: [
      { name: 'Phát hành & thiết kế', items: [
        { label: 'Phát hành thẻ số', url: 'https://merchant.vlinkpay.com/gift-voucher/product-management/issue-digital', newTab: true },
        { label: 'Thẻ thành viên', url: 'https://merchant.vlinkpay.com/gift-voucher/product-management/issue-digital?type=membership', newTab: true },
        { label: 'Thiết lập bán online nhanh', url: 'https://merchant.vlinkpay.com/gift-voucher/product-management/quick-create-card?type=0', newTab: true },
        { label: 'Thiết lập E-Gift nâng cao', description: 'Luồng này yêu cầu xác minh doanh nghiệp (KYB).', url: 'https://merchant.vlinkpay.com/gift-voucher/product-management/sell-egift-form?type=0', newTab: true }
      ]},
      { name: 'Quản lý & sử dụng', items: [
        { label: 'Quản lý thẻ đã phát hành', url: 'https://merchant.vlinkpay.com/gift-voucher/product-management?tab=all&pageSize=10', newTab: true },
        { label: 'Nhận thanh toán bằng thẻ', url: 'https://merchant.vlinkpay.com/payment-process/payment-gift-card', newTab: true }
      ]},
      { name: 'Thành viên & báo cáo', items: [
        { label: 'Chương trình thành viên', url: 'https://merchant.vlinkpay.com/settings/benefits-setup', newTab: true },
        { label: 'Báo cáo thành viên', url: 'https://merchant.vlinkpay.com/settings/membership-report', newTab: true },
        { label: 'Lịch sử thanh toán thẻ', url: 'https://merchant.vlinkpay.com/reports/card-transaction-history', newTab: true },
        { label: 'Thẻ sắp hết hạn', url: 'https://merchant.vlinkpay.com/reports/expiring-cards', newTab: true }
      ]}
    ]},
    analytics: { title: 'Analytics', description: 'Xu hướng tip, bảng xếp hạng và hiệu suất điểm QR.', status: 'Đang sử dụng', groups: [
      { name: 'Báo cáo', items: [{ label: 'Xem Analytics', url: nexora + '/dashboard/analytics' }] }
    ]},
    community: { title: 'Community', description: 'Kết nối doanh nghiệp, người làm nghề và khách hàng qua nội dung, cơ hội và hội thoại.', status: 'Đang sử dụng', groups: [
      { name: 'Cộng đồng & việc làm', items: [{ label: 'Bảng tin', url: nexora + '/dashboard/community' }, { label: 'Nhóm & Chợ', url: nexora + '/dashboard/community?tab=groups' }, { label: 'Việc làm', url: nexora + '/dashboard/community?tab=jobs' }] },
      { name: 'Liên lạc', items: [{ label: 'Tin nhắn, nhóm chat & cuộc gọi', url: nexora + '/dashboard/community?tab=connect' }] }
    ]},
    taxiq: { title: 'Tax IQ', description: 'Bản giới thiệu cách sắp xếp thu nhập, chi phí và biên lai; chưa kết nối dữ liệu thật.', status: 'Bản định hướng', pending: true, groups: [
      { name: 'Cho doanh nghiệp · dự kiến', items: [{ label: 'Tổng quan doanh nghiệp', unavailable: true }, { label: 'Thu nhập doanh nghiệp', unavailable: true }, { label: 'Chi phí vận hành', unavailable: true }, { label: 'Kho biên lai', unavailable: true }] },
      { name: 'Cho cá nhân · dự kiến', items: [{ label: 'Tổng quan cá nhân', unavailable: true }, { label: 'Thu nhập cá nhân', unavailable: true }, { label: 'Chi phí cá nhân', unavailable: true }, { label: 'Biên lai cá nhân', unavailable: true }] }
    ]}
  };
  const salonExplorer = {
    pos: { name:'SI POS', features:[['SI POS · Super Intelligence','SI POS · Super Intelligence','posOverview','Xem cách SI POS kết nối tín hiệu từ quầy, lịch, thợ, khách và doanh thu để đề xuất bước xử lý tiếp theo.','Preview how SI POS can connect front desk, bookings, staff, guests and revenue signals to suggest a next step.','concept'],['Đón khách','Check-in','checkin','Tiếp nhận khách và nhận biết bước cần điều phối ngay sau khi khách đến.','Welcome guests and identify the next coordination step after arrival.'],['Xếp lượt','Turn Board','queue','Đối chiếu hàng chờ, thợ sẵn sàng và lịch hẹn trước khi điều phối.','Review the queue, staff availability and bookings before assigning a turn.'],['Lịch hẹn','Appointments','calendar','Nhìn lịch hẹn cùng khả năng phục vụ để chuẩn bị cho lượt khách sắp đến.','View upcoming appointments alongside service capacity.'],['Doanh số','Sales','chart','Đọc doanh số cùng hoạt động phục vụ để nhận ra điểm cần xem sâu hơn.','Read sales alongside service activity to spot what needs review.']] },
    oneqr: { name:'One QR', features:[
      ['Một mã QR cố định','One lasting QR','qrScan','In một mã cho doanh nghiệp; các mục phía sau có thể thay đổi mà không cần in lại.','Print one business QR; update the menu behind it without reprinting.'],
      ['Menu sau khi quét','Menu after scanning','qrMenu','Khách quét One QR và thấy menu do chính doanh nghiệp chọn và sắp xếp.','Guests scan One QR to see the menu selected and arranged by the business.'],
      ['Cấu hình ô menu','Configure menu tiles','qrConfig','Kéo thả thứ tự, bật hoặc ẩn từng ô, đổi tên, biểu tượng và liên kết đích.','Reorder, show or hide tiles, and edit their names, icons and destinations.'],
      ['Menu theo vai trò','Menus by role','qrRoles','Cấu hình trải nghiệm riêng cho khách, nhân viên, chủ doanh nghiệp và AI Voice.','Configure distinct views for customers, staff, owners and AI Voice.'],
      ['Tải bảng One QR','Download One QR artwork','qrArtwork','Xem, tải và đặt bảng One QR ở quầy hoặc khu vực phục vụ.','View, download and place One QR artwork at the desk or service area.'],
      ['Xác nhận đến tiệm','Smart check-in','qrCheckin','Khách chọn mục check-in trên menu và hoàn tất yêu cầu; quét mã riêng lẻ không tự check-in.','Guests choose check-in and complete the request; scanning alone does not check them in.'],
      ['Đặt lịch hẹn','Book appointment','qrBooking','Đưa khách từ menu đến trang đặt lịch của doanh nghiệp khi đã bật liên kết.','Send guests from the menu to the business booking page when linked.'],
      ['Dịch vụ & giá','Services & prices','qrServices','Khách mở danh sách dịch vụ và giá do doanh nghiệp cập nhật.','Guests open the business service menu and prices.'],
      ['Ưu đãi & hình tham khảo','Offers & gallery','qrOffers','Gắn chương trình ưu đãi, bộ sưu tập hình hoặc website vào menu theo nhu cầu.','Add offer pages, galleries or a website to the menu as needed.'],
      ['Đánh giá khách hàng','Guest reviews','qrReviews','Mở luồng đánh giá sau dịch vụ từ một ô trên menu.','Open the post-service review flow from a menu tile.'],
      ['Gửi tiền boa','Leave a tip','qrTips','Khách chọn gửi tiền boa qua mục mà doanh nghiệp đã bật.','Guests choose the tipping option enabled by the business.'],
      ['Thanh toán','Pay now','qrPayment','Đưa khách đến trang thanh toán khi doanh nghiệp cấu hình liên kết phù hợp.','Take guests to the payment page when the business configures the destination.'],
      ['Thẻ & thành viên','Cards & membership','qrLoyalty','Có thể gắn trang thẻ quà tặng, quyền lợi thành viên hoặc chương trình tích điểm.','Link gift cards, memberships or loyalty rewards when configured.'],
      ['Liên kết tùy chỉnh','Custom links','qrLinks','Thêm website hoặc trang riêng, kể cả lựa chọn crypto khi có luồng thanh toán thật.','Add a website or custom page, including crypto only when a working payment flow is configured.'],
      ['Referral Link','Referral Link','qrReferral','Dùng khu Referral Link để chia sẻ đường dẫn giới thiệu riêng.','Use the Referral Link area to share a dedicated referral destination.'],
      ['Staff Invite QR','Staff Invite QR','qrStaff','Dùng mã mời riêng cho nhân viên, tách khỏi menu dành cho khách.','Use a separate staff invitation code rather than the customer menu.']
    ] },
    payments: { name:'Payments & Payouts', features:[['Nhận thanh toán','Receive payments','money','Xem khoản thanh toán đã nhận.','Review received payments.'],['Danh sách tip','Tip list','list','Theo dõi danh sách tip hiện có.','Review the current tip list.'],['Chi trả thợ','Staff payouts','money','Mở màn hình chi trả cho nhân viên.','Open the staff payout screen.'],['Hoạt động thanh toán','Payment activity','list','Theo dõi hoạt động giao dịch đang có.','Review available payment activity.']] },
    aihub: { name:'AI Hub', features:[
      ['Tổng quan AI Hub','AI Hub overview','aihubOverview','Xem AI Receptionist và Marketing Assistant hỗ trợ các bước nào trong hành trình khách.','See where AI Receptionist and Marketing Assistant fit in the customer journey.'],
      ['Lịch hẹn AI','AI appointments','aihubAppointments','Xem lịch hẹn trong AI Receptionist và các bước nhân viên cần xác nhận.','Review AI Receptionist appointments and staff confirmation steps.'],
      ['Lịch AI','AI calendar','aihubCalendar','Xem lịch theo ngày và các khoảng cần điều phối.','Review the calendar and time slots needing coordination.'],
      ['Hồ sơ khách','Customer profiles','aihubCustomers','Xem thông tin khách liên quan đến lịch hẹn và liên hệ.','Review customer information connected to appointments and contacts.'],
      ['Nhật ký cuộc gọi','Call log','aihubCalls','Xem cuộc gọi và việc cần theo dõi sau khi khách liên hệ.','Review calls and follow-up after a customer reaches out.'],
      ['Gói dịch vụ AI','AI plans','aihubPlans','Xem các gói và phạm vi sử dụng trợ lý AI.','Review AI assistant plans and usage scope.'],
      ['Cài đặt AI Hub','AI Hub settings','aihubSettings','Kiểm tra thông tin doanh nghiệp, lịch và quy tắc tiếp nhận.','Review business details, schedules and reception rules.'],
      ['Thiết lập AI Voice','AI Voice setup','aihubVoice','Xem các bước chuẩn bị kịch bản và thử luồng AI Voice.','Review script preparation and the AI Voice setup flow.'],
      ['SMS Campaigns','SMS Campaigns','aihubSms','Mở công cụ SMS và xem minh họa chăm sóc sau liên hệ.','Open SMS tools and preview post-contact follow-up.'],
      ['Chiến dịch','Campaigns','aihubCampaigns','Kết nối yêu cầu của khách với một chiến dịch tiếp thị phù hợp.','Connect customer needs to a relevant campaign.'],
      ['Khuyến mãi POS','POS promotions','aihubOffers','Xem ưu đãi có thể được giới thiệu vào đúng thời điểm.','See how an offer can be presented at the right moment.'],
      ['Đánh giá','Reviews','aihubReviews','Xem phản hồi của khách và bước nhân viên cần xử lý.','Review customer feedback and staff next steps.'],
      ['Phân tích','Analytics','aihubAnalytics','Xem tín hiệu từ lịch hẹn, cuộc gọi và hoạt động tiếp thị.','Review signals from appointments, calls and marketing activity.'],
      ['Vòng quay tương tác','Prize wheel demo','aihubWheel','Xem trước tương tác tặng quà để tăng kết nối với khách.','Preview an interactive reward experience for customer engagement.'],
      ['AI Ads','AI Ads','aihubAds','Xem khu AI Ads và mục tiêu quảng cáo cần chuẩn bị.','Explore AI Ads and the objective to define before advertising.']
    ] },
    aimarketing: { name:'AI Marketing', features:[
      ['Tổng quan AI Marketing','AI Marketing overview','marketingOverview','Xem hành trình từ hiểu khách, chuẩn bị nội dung đến đọc xu hướng phản hồi.','Explore the journey from audience insight and content to response trends.'],
      ['Phân nhóm khách · minh họa','Audience segments · concept','marketingAudience','Xem cách phân nhóm khách theo lịch sử ghé và mức quan tâm.','Preview audience groups by visit history and interest.','concept'],
      ['Soạn nội dung AI · minh họa','AI content draft · concept','marketingContent','Xem cách soạn thông điệp và hình ảnh phù hợp với nhóm khách.','Preview messages and images tailored to an audience.','concept'],
      ['SMS Campaigns','SMS Campaigns','marketingSms','Chuẩn bị đối tượng, thông điệp và lịch gửi SMS trong một luồng.','Prepare the audience, message and schedule in one SMS flow.'],
      ['Chiến dịch','Campaigns','marketingCampaign','Quản lý các bước triển khai chiến dịch qua VLinkPay.','Manage campaign steps through VLinkPay.'],
      ['Khuyến mãi POS','POS promotions','marketingPos','Đưa ưu đãi vào điểm chạm khi khách đang dùng dịch vụ.','Bring offers into the customer service journey.'],
      ['Tạo vòng quay','Prize wheel demo','marketingWheel','Thử vòng quay tương tác để hình dung cơ chế giải thưởng.','Preview an interactive prize and reward experience.'],
      ['AI Ads','AI Ads','marketingAds','Xem khu công cụ quảng cáo AI trên VLinkPay.','Explore AI advertising tools on VLinkPay.'],
      ['Reviews','Reviews','marketingReviews','Đọc phản hồi để điều chỉnh nội dung và cách chăm sóc khách.','Use feedback to refine content and customer care.'],
      ['Khách hàng','Customers','marketingCustomers','Xem hồ sơ khách và các lần ghé để hiểu nhóm mục tiêu.','Review customers and visits to understand the audience.'],
      ['Analytics','Analytics','marketingAnalytics','Theo dõi xu hướng tương tác để điều chỉnh chiến dịch.','Follow engagement trends to refine campaigns.']
    ] },
    reviews: { name:'Reviews', features:[['Xem đánh giá','View reviews','review','Xem đánh giá của khách trong màn hình Reviews.','View customer reviews.'],['Phản hồi khách','Customer feedback','review','Đọc phản hồi để cải thiện trải nghiệm.','Read feedback to improve the experience.']] },
    gift: { name:'Gift Card Center', features:[
      ['Quản lý thẻ đã phát hành','Issued card management','giftManage','Lọc thẻ theo loại, nguồn phát hành, ngày, trạng thái và xem chi tiết.','Filter cards by type, issue source, date and status, then open details.'],
      ['Phát hành thẻ số','Issue digital card','giftIssue','Chọn loại thẻ, thiết kế, khách nhận, mệnh giá và phương thức thanh toán.','Choose card type, design, recipient, amount and payment method.'],
      ['Thẻ thành viên','Membership card','giftMember','Thiết lập hạng thẻ, quyền lợi, thời hạn và giá bán.','Set membership tier, benefits, expiration and price.'],
      ['Thiết lập bán online nhanh','Quick online setup','giftOnline','Tạo thẻ để bán trực tuyến qua VLinkPay.','Set up cards to sell online through VLinkPay.'],
      ['Thiết lập E-Gift nâng cao','Advanced E-Gift setup','giftAdvanced','Luồng bán E-Gift nâng cao có bước xác minh doanh nghiệp (KYB).','Advanced E-Gift selling includes business verification (KYB).'],
      ['Nhận thanh toán bằng thẻ','Accept card payment','giftRedeem','Nhập số tiền hoặc quét QR thẻ do VLinkPay và tiệm phát hành.','Enter an amount or scan a VLinkPay or store-issued card QR.'],
      ['Chương trình thành viên','Membership program','giftMember','Mở thiết lập quyền lợi thành viên.','Open membership benefits settings.'],
      ['Báo cáo thành viên','Membership report','giftReport','Xem khu báo cáo thành viên.','Open the membership report.'],
      ['Lịch sử thanh toán thẻ','Card payment history','giftReport','Theo dõi lịch sử giao dịch thanh toán bằng thẻ.','Review card payment history.'],
      ['Thẻ sắp hết hạn','Expiring cards','giftExpiry','Xem danh sách thẻ sắp hết hạn để chăm sóc khách.','Review cards nearing expiration to follow up with customers.']
    ] },
    analytics: { name:'Analytics', features:[
      ['Tổng quan','Overview','analyticsOverview','Đọc nhanh tổng tiền boa minh họa và hoạt động tại các điểm QR.','See sample tipping totals and activity across QR touchpoints.'],
      ['Xu hướng tip','Tip trends','analyticsTrend','Theo dõi tiền boa thay đổi theo từng ngày hoặc từng tuần.','Follow how tips change by day or week.'],
      ['Tip theo kỳ','Tips by period','analyticsDaily','So sánh tiền boa giữa các ngày hoặc các tuần trong kỳ đã chọn.','Compare tips across days or weeks in the selected period.'],
      ['Hiệu suất QR','QR performance','analyticsQr','Đối chiếu lượt mở menu và lượt chọn thao tác tại các điểm QR.','Compare menu opens and selected actions at QR touchpoints.'],
      ['So sánh điểm QR','Compare QR points','analyticsPoints','Nhìn rõ điểm QR nào có nhiều lượt tương tác hơn.','See which QR touchpoints receive more interactions.'],
      ['Bảng xếp hạng','Rankings','analyticsRank','Xếp hạng các điểm QR theo lượt mở menu trong dữ liệu minh họa.','Rank QR touchpoints by sample menu opens.']
    ] },
    community: { name:'Community', features:[
      ['Bảng tin','Feed','communityFeed','Đăng bài, đặt câu hỏi và theo dõi nội dung từ cộng đồng.','Publish posts, ask questions, and follow community updates.'],
      ['Nhóm & Chợ','Groups & Market','communityGroups','Tham gia nhóm theo mối quan tâm và khám phá khu trao đổi mua bán.','Join interest groups and explore the marketplace.'],
      ['Fanpage & Blog','Fanpage & Blog','communityContent','Giới thiệu câu chuyện, dịch vụ và kiến thức qua fanpage hoặc bài blog.','Share stories, services, and knowledge through a fanpage or blog.'],
      ['Việc làm','Jobs','communityJobs','Đăng tuyển hoặc tìm cơ hội làm việc trong ngành.','Post openings or find work opportunities.'],
      ['Ca làm thêm','Extra shifts','communityShifts','Tìm hoặc chia sẻ các ca làm thêm phù hợp.','Find or share suitable extra shifts.'],
      ['Deal & Coupon','Deals & Coupons','communityDeals','Khám phá ưu đãi và coupon được chia sẻ trong cộng đồng.','Discover deals and coupons shared in the community.'],
      ['Tin nhắn & Nhóm chat','Messages & group chats','communityMessages','Trò chuyện riêng hoặc theo nhóm để duy trì kết nối.','Use direct or group chat to stay connected.'],
      ['Gọi thoại & video','Voice & video calls','communityCalls','Trao đổi trực tiếp qua cuộc gọi thoại hoặc video.','Connect directly through voice or video calls.']
    ] },
    taxiq: { name:'Tax IQ', state:'planned', features:[
      ['Tổng quan doanh nghiệp','Business overview','taxBusinessOverview','Xem cấu trúc tổng hợp thu nhập, chi phí và biên lai của doanh nghiệp theo kỳ.','Preview a period summary of business income, expenses, and receipts.'],
      ['Thu nhập doanh nghiệp','Business income','taxBusinessIncome','Tập hợp các khoản thu vào một danh sách để đối chiếu với chứng từ.','Bring income records together for review against supporting documents.'],
      ['Chi phí vận hành','Operating expenses','taxBusinessExpense','Phân loại khoản chi vận hành và liên kết biên lai tương ứng.','Organize operating expenses and their related receipts.'],
      ['Kho biên lai','Receipt library','taxBusinessReceipts','Lưu dấu vết chứng từ để doanh nghiệp dễ tìm và trao đổi khi cần.','Keep documents easy to find and share for review.'],
      ['Tổng quan cá nhân','Personal overview','taxPersonalOverview','Nhìn tổng thể các khoản thu, chi và giấy tờ cá nhân trong một kỳ.','Preview personal income, expenses, and documents for a period.'],
      ['Thu nhập cá nhân','Personal income','taxPersonalIncome','Ghi nhận các nguồn thu cá nhân trong cùng một nơi để tiện kiểm tra.','Keep personal income sources in one place for review.'],
      ['Chi phí cá nhân','Personal expenses','taxPersonalExpense','Sắp xếp các khoản chi cá nhân và chứng từ liên quan.','Organize personal expenses and supporting documents.'],
      ['Biên lai cá nhân','Personal receipts','taxPersonalReceipts','Lưu và tìm lại biên lai cá nhân khi cần đối chiếu hồ sơ.','Store and find personal receipts for record review.']
    ] }
  };
  const explorerAliases = {
    pos: {'Đón khách':'Đón khách','Xếp lượt':'Xếp lượt','Lịch hẹn':'Lịch hẹn','Doanh số':'Doanh số'},
    oneqr: {'OneQR':'Một mã QR cố định','Nhận tip':'Gửi tiền boa','Nhận thanh toán':'Thanh toán','Referral Link':'Referral Link','Staff Invite QR':'Staff Invite QR'},
    payments: {'Nhận thanh toán':'Nhận thanh toán','Danh sách tip':'Danh sách tip','Payroll / chi trả':'Chi trả thợ','Hoạt động thanh toán':'Hoạt động thanh toán'},
    aihub: {'Appointments':'Lịch hẹn AI','Calendar':'Lịch AI','Customers':'Hồ sơ khách','Call Log':'Nhật ký cuộc gọi','Plans':'Gói dịch vụ AI','AI Receptionist Settings':'Cài đặt Lễ tân AI','AI Voice setup guide':'Thiết lập AI Voice','SMS Campaigns':'SMS Campaigns','Khuyến mãi POS':'Khuyến mãi POS','Reviews':'Đánh giá','Khách hàng':'Hồ sơ khách','Analytics':'Phân tích','Chiến dịch':'Chiến dịch','Tạo vòng quay':'Vòng quay tương tác','AI Ads':'AI Ads'},
    reviews: {'Xem Reviews':'Xem đánh giá'},
    gift: {'Phát hành thẻ số':'Phát hành thẻ số','Thẻ thành viên':'Thẻ thành viên','Thiết lập bán online nhanh':'Thiết lập bán online nhanh','Thiết lập E-Gift nâng cao':'Thiết lập E-Gift nâng cao','Quản lý thẻ đã phát hành':'Quản lý thẻ đã phát hành','Nhận thanh toán bằng thẻ':'Nhận thanh toán bằng thẻ','Chương trình thành viên':'Chương trình thành viên','Báo cáo thành viên':'Báo cáo thành viên','Lịch sử thanh toán thẻ':'Lịch sử thanh toán thẻ','Thẻ sắp hết hạn':'Thẻ sắp hết hạn'},
    analytics: {'Xem Analytics':'Xu hướng tip'},
    community: {'Fanpage':'Fanpage & Blog','Blog':'Fanpage & Blog','Tin nhắn, nhóm chat & cuộc gọi':'Tin nhắn & Nhóm chat','Tin nhắn, gọi thoại & video':'Tin nhắn & Nhóm chat'},
    taxiq: {'Tổng hợp thu nhập':'Thu nhập doanh nghiệp','Chi phí':'Chi phí vận hành','Kho biên lai':'Kho biên lai'}
  };
  function explorerVisualFor(label) {
    if (/QR|mã/i.test(label)) return 'qr';
    if (/lịch|appointment|calendar|booking/i.test(label)) return 'calendar';
    if (/xếp lượt|turn|rotation/i.test(label)) return 'queue';
    if (/doanh|thu nhập|hiệu suất|analytics|phân tích|đối soát|tổng quan/i.test(label)) return 'chart';
    if (/thu tiền|thanh toán|tip|pay|savings|chi trả|chi phí|giao dịch/i.test(label)) return 'money';
    if (/SMS|campaign|chiến dịch|ads|vòng quay|voice/i.test(label)) return 'message';
    if (/đánh giá|reviews|phản hồi/i.test(label)) return 'review';
    if (/gift|membership|khuyến mãi|coupon|ưu đãi/i.test(label)) return 'gift';
    if (/biên lai/i.test(label)) return 'receipt';
    return 'list';
  }
  Object.entries(salonExplorer).forEach(([key, product]) => {
    if (key === 'oneqr') return;
    const groups = catalog[key]?.groups || [];
    const catalogItems = groups.flatMap(group => group.items || (group.sections || []).flatMap(section => section.items || []));
    catalogItems.forEach(item => {
      const representedBy = explorerAliases[key]?.[item.label] || item.label;
      if (product.features.some(feature => feature[0] === representedBy)) return;
      const vietnamese = item.label + (item.unavailable ? ' · đề xuất' : '');
      const english = toLocalized(item.label, 'en') + (item.unavailable ? ' · proposed' : '');
      product.features.push([vietnamese, english, explorerVisualFor(item.label), item.description || `Màn hình giới thiệu ${item.label}.`, `Example screen for ${toLocalized(item.label, 'en')}.`, item.unavailable ? 'partial' : undefined]);
    });
  });
  const posFeatureOrder = ['SI POS · Super Intelligence','Đón khách','Phiếu dịch vụ','Xếp lượt','Thu tiền','Gift Card Center','Đã hoàn tất','Menu dịch vụ của tiệm','Quản lý dịch vụ','Lịch hẹn','Khách đặt lịch','Lịch đặt','Lịch hẹn của khách','Lịch hẹn của thợ','Báo giá','Chấm công','Hồ sơ khách','Khuyến mãi','Đánh giá','Lễ tân AI','Tạo chiến dịch','Quản lý chiến dịch','Hiệu quả marketing','SMS Campaigns','Doanh số','Giao dịch','Chi trả thợ','Phân tích'];
  salonExplorer.pos.features.sort((a,b) => {
    const order = feature => {
      const index = posFeatureOrder.indexOf(feature[0]);
      return index < 0 ? posFeatureOrder.length : index;
    };
    return order(a) - order(b);
  });
  const explorerTotalCount = Object.values(salonExplorer).reduce((count, product) => count + product.features.length, 0);
  const explorerProductKeys = ['pos','aihub','aimarketing','gift','community','oneqr','taxiq','payments','reviews','analytics'];
  const explorerProducts = document.getElementById('explorer-products');
  const explorerFeatures = document.getElementById('explorer-feature-list');
  const explorerScreen = document.getElementById('explorer-screen');
  let explorerProduct = 'pos';
  let explorerFeature = 0;
  let analyticsPreviewPeriod = '7d';
  let explorerCommunityAudience = 0;
  let explorerGiftSample = 0;
  let explorerAiHubIdea = 0;
  const explorerQr = Array.from({length:81},(_,index) => ((index%9)*5+Math.floor(index/9)*3+index)%7<3 ? '<i class="on"></i>':'<i></i>').join('');
  const explorerVisuals = {
    checkin: '<div class="explorer-checkin"><div class="explorer-checkin-bar"><span>Hôm nay <b>⌄</b></span><strong>+ Đón khách</strong></div><div class="explorer-checkin-stats"><span><b>1</b>Đang chờ</span><span><b>2</b>Đang phục vụ</span><span><b>3</b>Hoàn tất</span></div><div class="explorer-checkin-table"><span><i>●</i><b>Khách hẹn · minh họa</b><em>Đã đến</em></span><span><i>●</i><b>Khách walk-in · minh họa</b><em>Chờ xếp lượt</em></span></div></div>',
    checkinEn: '<div class="explorer-checkin"><div class="explorer-checkin-bar"><span>Today <b>⌄</b></span><strong>+ Check in</strong></div><div class="explorer-checkin-stats"><span><b>1</b>Waiting</span><span><b>2</b>In service</span><span><b>3</b>Completed</span></div><div class="explorer-checkin-table"><span><i>●</i><b>Appointment · Preview</b><em>Arrived</em></span><span><i>●</i><b>Walk in · Preview</b><em>Waiting</em></span></div></div>',
    list: '<div class="explorer-skeleton"><span><i>▤</i><b>Hồ sơ · minh họa</b><em></em></span><span><i>▤</i><b>Hoạt động · minh họa</b><em></em></span><span><i>▤</i><b>Trạng thái · minh họa</b><em></em></span></div>',
    listEn: '<div class="explorer-skeleton"><span><i>▤</i><b>Record · Preview</b><em></em></span><span><i>▤</i><b>Activity · Preview</b><em></em></span><span><i>▤</i><b>Status · Preview</b><em></em></span></div>',
    queue: '<div class="explorer-queue"><div><b>1</b><i></i><i></i></div><div><b>2</b><i></i><i></i></div><div><b>3</b><i></i><i></i></div></div>',
    calendar: '<div class="explorer-calendar">'+Array.from({length:35},(_,i)=>`<span>${i<7?['M','T','W','T','F','S','S'][i]:i-6}</span>`).join('')+'</div>',
    money: '<div class="explorer-money"><div>↗ &nbsp; Payment activity <span>▰▰▰</span></div><div>♧ &nbsp; Staff & tips <span>▰▰</span></div><div>▤ &nbsp; Records <span>▰▰▰▰</span></div></div>',
    qr: '<div class="explorer-large-qr">'+explorerQr+'</div>',
    message: '<div class="explorer-messages"><span>Campaign draft / message</span><span>Customer response preview</span><span>Follow-up action</span></div>',
    review: '<div class="explorer-feedback"><strong>★★★★★</strong><i></i><i></i><i></i></div>',
    chart: '<div class="explorer-chart"><i style="--h:40%"></i><i style="--h:58%"></i><i style="--h:47%"></i><i style="--h:74%"></i><i style="--h:62%"></i><i style="--h:86%"></i></div>',
    gift: '<div class="explorer-gift"><div><small>NEXORA TOUCH</small><b>GIFT CARD</b><span>✦</span></div></div>',
    giftManage: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>Quản lý thẻ đã phát hành</strong><em>＋ Phát hành</em></div><div class="explorer-gift-board-tabs"><span class="active">Tất cả</span><span>VLinkPay</span><span>Tại tiệm</span></div><div class="explorer-gift-board-tabs"><span>Gift Card</span><span>Membership</span><span>E-Gift</span><span>Voucher</span></div><div class="explorer-gift-board-row"><b>Gift Card</b><span>Thẻ tại tiệm · minh họa</span><em>Đang dùng</em></div><div class="explorer-gift-board-row"><b>Membership</b><span>Thẻ thành viên · minh họa</span><em>Đang dùng</em></div></div>',
    giftIssue: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>Phát hành thẻ số</strong><em>Thiết kế thẻ</em></div><div class="explorer-gift-board-tabs"><span class="active">Gift Card</span><span>Membership</span><span>Promotion</span><span>Prepaid</span></div><div class="explorer-gift-board-row"><b>Thiết kế</b><span>Nền thiết kế · Logo · Màu sắc</span><em>1</em></div><div class="explorer-gift-board-row"><b>Khách nhận</b><span>Thông tin &amp; mệnh giá</span><em>2</em></div><div class="explorer-gift-board-row"><b>Thanh toán</b><span>Phương thức &amp; điều khoản</span><em>3</em></div></div>',
    giftMember: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>Thẻ thành viên</strong><em>Quyền lợi</em></div><div class="explorer-gift-board-tabs"><span>Silver</span><span class="active">Gold</span><span>Platinum</span><span>Diamond</span></div><div class="explorer-gift-board-row"><b>Hạng thẻ</b><span>Chọn cấp thành viên</span><em>Gold</em></div><div class="explorer-gift-board-row"><b>Quyền lợi</b><span>Thiết lập lợi ích</span><em>＋</em></div><div class="explorer-gift-board-row"><b>Thời hạn</b><span>Ngày hết hạn &amp; giá</span><em>⌄</em></div></div>',
    giftOnline: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>Thiết lập bán online nhanh</strong><em>E-Gift</em></div><div class="explorer-gift-board-row"><b>1</b><span>Chọn loại thẻ</span><em>✓</em></div><div class="explorer-gift-board-row"><b>2</b><span>Chuẩn bị nội dung bán</span><em>→</em></div><div class="explorer-gift-board-row"><b>3</b><span>Bán qua VLinkPay</span><em>→</em></div></div>',
    giftAdvanced: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>E-Gift nâng cao</strong><em>KYB</em></div><div class="explorer-gift-board-row"><b>Bước 1</b><span>Xác minh doanh nghiệp</span><em>KYB</em></div><div class="explorer-gift-board-row"><b>Bước 2</b><span>Logo, sản phẩm &amp; dịch vụ</span><em>→</em></div><div class="explorer-gift-board-row"><b>Bước 3</b><span>Cashback, điều khoản</span><em>→</em></div></div>',
    giftRedeem: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>Nhận thanh toán bằng thẻ</strong><em>Quét QR</em></div><div class="explorer-gift-board-row"><b>Nhập số tiền</b><span>Tạo QR đúng giá trị</span><em>1</em></div><div class="explorer-gift-board-row"><b>Thẻ online</b><span>Quét E-Gift / E-Voucher</span><em>2</em></div><div class="explorer-gift-board-row"><b>Thẻ tại tiệm</b><span>Quét thẻ số do tiệm phát hành</span><em>3</em></div></div>',
    giftReport: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>Báo cáo thẻ &amp; thành viên</strong><em>Xem báo cáo</em></div><div class="explorer-gift-board-tabs"><span class="active">Thành viên</span><span>Thanh toán thẻ</span></div><div class="explorer-gift-board-row"><b>Hoạt động</b><span>Bản ghi minh họa</span><em>↗</em></div><div class="explorer-gift-board-row"><b>Giao dịch</b><span>Bản ghi minh họa</span><em>↗</em></div></div>',
    giftExpiry: '<div class="explorer-gift-board"><div class="explorer-gift-board-head"><strong>Thẻ sắp hết hạn</strong><em>Xem chi tiết</em></div><div class="explorer-gift-board-row"><b>7 ngày tới</b><span>Theo dõi thẻ đến hạn</span><em>⏱</em></div><div class="explorer-gift-board-row"><b>Khách nhận</b><span>Thông tin để chăm sóc</span><em>↗</em></div></div>',
    receipt: '<div class="explorer-receipt"><b>RECEIPT</b><i></i><i></i><i></i><i></i></div>'
  };
  function renderReviewsExplorerVisual(english, replyMode) {
    const words = english ? {
      overview:'Review journey', title:'From guest opinion to follow up', description:'An illustrative view of how a business can read a review and prepare a response.',
      steps:['Guest leaves a review','Business reads it','Prepare a reply'], sample:'Sample feedback', status:replyMode?'Needs a reply':'New review',
      quote:'The team explained the service clearly and the appointment started on time.', replyTitle:replyMode?'Suggested reply · sample':'Next action',
      reply:replyMode?'Thank you for sharing your experience. We are glad the visit went smoothly and look forward to seeing you again.':'Open the feedback, check its context, then choose whether a reply is needed.'
    } : {
      overview:'Hành trình đánh giá', title:'Từ ý kiến khách đến bước chăm sóc', description:'Màn hình minh họa cách doanh nghiệp đọc đánh giá và chuẩn bị phản hồi.',
      steps:['Khách gửi đánh giá','Doanh nghiệp đọc','Chuẩn bị phản hồi'], sample:'Phản hồi minh họa', status:replyMode?'Cần phản hồi':'Đánh giá mới',
      quote:'Nhân viên giải thích dịch vụ rõ ràng và lịch hẹn bắt đầu đúng giờ.', replyTitle:replyMode?'Phản hồi gợi ý · minh họa':'Bước tiếp theo',
      reply:replyMode?'Cảm ơn bạn đã chia sẻ trải nghiệm. Rất vui vì buổi hẹn diễn ra thuận lợi; mong sớm được đón tiếp bạn lần nữa.':'Mở đánh giá, xem bối cảnh lượt phục vụ rồi chọn phản hồi cần theo dõi.'
    };
    return `<div class="explorer-review-board"><div class="explorer-review-overview"><small>${words.overview}</small><div class="explorer-review-stars" aria-label="5 sao">★★★★★</div><strong>${words.title}</strong><p>${words.description}</p><div class="explorer-review-steps">${words.steps.map((step,index)=>`<span><b>${index+1}</b>${step}</span>`).join('')}</div></div><div class="explorer-review-card"><div class="explorer-review-top"><small>${words.sample}</small><em class="${replyMode?'awaiting':''}">${words.status}</em></div><blockquote>“${words.quote}”</blockquote><div class="explorer-review-reply"><strong>${words.replyTitle}</strong><p>${words.reply}</p></div></div></div>`;
  }
  const analyticsSampleData = {
    '7d': { tips:[92,118,104,132,126,151,145], labelsVi:['T2','T3','T4','T5','T6','T7','CN'], labelsEn:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], qrOpen:[214,165,98,64], qrAction:[126,83,43,26] },
    '30d': { tips:[430,475,462,520,548], labelsVi:['Tuần 1','Tuần 2','Tuần 3','Tuần 4','Tuần 5'], labelsEn:['W1','W2','W3','W4','W5'], qrOpen:[845,693,420,250], qrAction:[505,370,200,90] }
  };
  function analyticsLineSvg(data, labels, english) {
    const max=Math.ceil(Math.max(...data)/50)*50;
    const points=data.map((value,index)=>({ x:42+index*510/(data.length-1), y:132-value/max*110, value }));
    const grid=[0,.5,1].map(fraction=>{ const y=132-fraction*110; return `<line class="grid" x1="42" y1="${y}" x2="558" y2="${y}"/><text class="axis-label" x="34" y="${y+4}" text-anchor="end">${Math.round(max*fraction)}</text>`; }).join('');
    const ticks=points.map((point,index)=>`<text class="axis-label" x="${point.x}" y="157" text-anchor="middle">${labels[index]}</text>`).join('');
    const dots=points.map((point,index)=>`<circle class="data-point" cx="${point.x}" cy="${point.y}" r="${index===points.length-1?5:3.5}"/>`).join('');
    const final=points[points.length-1];
    const label=english?'Sample tip trend':'Xu hướng tip minh họa';
    return `<div class="analytics-plot-scroll"><svg class="analytics-line-chart" viewBox="0 0 600 175" role="img" aria-label="${label}: ${data.join(', ')}"><title>${label}</title>${grid}<polyline class="data-line" points="${points.map(point=>`${point.x},${point.y}`).join(' ')}"/>${dots}<text class="data-label" x="${final.x-7}" y="${final.y-11}" text-anchor="end">$${final.value}</text>${ticks}</svg></div>`;
  }
  function renderAnalyticsExplorerVisual(feature, english) {
    const d=analyticsSampleData[analyticsPreviewPeriod];
    const labels=english?d.labelsEn:d.labelsVi;
    const names=english?['Front desk','Service area','Entrance','Checkout']:['Quầy lễ tân','Khu dịch vụ','Cửa vào','Quầy thu ngân'];
    const copy=english?{sample:'ILLUSTRATIVE DATA',note:'Sample values for layout preview; they do not represent live business results.',days:'7 days',month:'30 days',tips:'Sample tips',opens:'Menu opens',actions:'Selected actions',points:'QR touchpoints',trend:'Tip trend',daily:'Tips by period',qr:'QR activity by point',compare:'Menu opens by point',rank:'QR point ranking'}:{sample:'DỮ LIỆU MINH HỌA',note:'Số liệu minh họa để xem bố cục; không phải kết quả vận hành thực tế.',days:'7 ngày',month:'30 ngày',tips:'Tiền boa minh họa',opens:'Lượt mở menu',actions:'Lượt chọn mục',points:'Điểm QR',trend:'Xu hướng tiền boa',daily:'Tiền boa theo kỳ',qr:'Hoạt động QR theo điểm',compare:'Lượt mở menu theo điểm',rank:'Xếp hạng điểm QR'};
    const totalTips=d.tips.reduce((sum,value)=>sum+value,0);
    const totalOpens=d.qrOpen.reduce((sum,value)=>sum+value,0);
    const totalActions=d.qrAction.reduce((sum,value)=>sum+value,0);
    const title=english?feature[1]:feature[0];
    const description=english?feature[4]:feature[3];
    const periodButtons=`<div class="analytics-preview-period" aria-label="${english?'Sample period':'Kỳ dữ liệu minh họa'}"><button type="button" data-analytics-period="7d" aria-pressed="${analyticsPreviewPeriod==='7d'}">${copy.days}</button><button type="button" data-analytics-period="30d" aria-pressed="${analyticsPreviewPeriod==='30d'}">${copy.month}</button></div>`;
    const card=(heading,body,sub='')=>`<div class="analytics-chart-card"><div class="analytics-chart-title"><span>${heading}</span><small>${sub}</small></div>${body}</div>`;
    const horizontal=(values,ranked=false)=>`<div class="analytics-bars">${values.map((value,index)=>`<div class="analytics-bar-row"><strong>${ranked?`${index+1}. `:''}${names[index]}</strong><div class="analytics-bar-track"><span class="analytics-bar-fill ${ranked?'teal':''}" style="--bar-width:${Math.round(value/Math.max(...values)*100)}%"></span></div><em>${value}</em></div>`).join('')}</div>`;
    const mini=(values,qr=false)=>`<div class="analytics-mini-bars ${qr?'qr':''}" aria-label="${values.join(', ')}">${values.map(value=>`<span style="--bar-height:${Math.max(12,Math.round(value/Math.max(...values)*90))}%"></span>`).join('')}</div>`;
    let content='';
    switch(feature[2]) {
      case 'analyticsOverview':
        content=`<div class="analytics-summary-grid"><div><small>${copy.tips}</small><strong>$${totalTips.toLocaleString('en-US')}</strong><span>${english?'Selected period':'Trong kỳ đã chọn'}</span></div><div><small>${copy.opens}</small><strong>${totalOpens.toLocaleString('en-US')}</strong><span>${names.length} ${copy.points.toLowerCase()}</span></div><div><small>${copy.actions}</small><strong>${totalActions.toLocaleString('en-US')}</strong><span>${english?'From sample QR menus':'Từ menu QR minh họa'}</span></div></div><div class="analytics-chart-grid">${card(copy.trend,mini(d.tips),`$${d.tips[d.tips.length-1]}`)}${card(copy.compare,mini(d.qrOpen,true),names[0])}</div>`;
        break;
      case 'analyticsTrend': content=card(copy.trend,analyticsLineSvg(d.tips,labels,english),english?'USD · sample':'USD · minh họa'); break;
      case 'analyticsDaily': content=card(copy.daily,`<div class="analytics-daily-bars" role="img" aria-label="${labels.map((label,index)=>`${label}: $${d.tips[index]}`).join(', ')}">${d.tips.map((value,index)=>`<div><b>$${value}</b><i style="--bar-height:${Math.round(value/Math.max(...d.tips)*70)}%"></i><small>${labels[index]}</small></div>`).join('')}</div>`,english?'USD · sample':'USD · minh họa'); break;
      case 'analyticsQr': content=card(copy.qr,`<div class="analytics-paired">${names.map((name,index)=>`<div class="analytics-paired-row"><strong>${name}</strong><div class="analytics-paired-bars"><span style="--bar-width:${Math.round(d.qrOpen[index]/Math.max(...d.qrOpen)*100)}%">${d.qrOpen[index]}</span><span class="action" style="--bar-width:${Math.round(d.qrAction[index]/Math.max(...d.qrOpen)*100)}%">${d.qrAction[index]}</span></div></div>`).join('')}</div><div class="analytics-inline-key"><span>${copy.opens}</span><span>${copy.actions}</span></div>`); break;
      case 'analyticsPoints': content=card(copy.compare,horizontal(d.qrOpen),copy.opens); break;
      case 'analyticsRank': content=card(copy.rank,horizontal(d.qrOpen,true),copy.opens); break;
    }
    return `<div class="analytics-preview"><div class="analytics-preview-head"><div><small>${copy.sample}</small><strong>${title}</strong><p>${description}</p></div>${periodButtons}</div>${content}<small class="analytics-sample-note">${copy.note}</small></div>`;
  }
  function renderTaxExplorerVisual(feature, english, index) {
    const personal=index>=4;
    const kind=index%4;
    const copy=english?{
      preview:'CONCEPT PREVIEW · SAMPLE DATA', business:'Business', personal:'Individual', sample:'Illustrative records',
      records:'Example records', benefitBusiness:'Keep income, expenses, and receipts organized for an easier business review.',
      benefitPersonal:'See personal income, spending, and documents together when checking your records.',
      note:'Concept screen with sample data only. No live records or tax filing are available.',
      flows:['Income','Expenses','Receipts'],
      headings:['A clearer financial picture','Income in one place','Organized spending','Documents within reach'],
      descriptions:['Review income, expenses, and available receipts in a single period.','Bring income entries together with their supporting records.','Group spending and see which items have a related receipt.','Find supporting documents without searching through separate folders.'],
      businessRows:[[['Income records','12 items'],['Expense records','8 items'],['Receipts','6 files']],[['Service payments','$1,260'],['Card payments','$840'],['Other income','$110']],[['Supplies','$320'],['Space','$900'],['Operating costs','$145']],[['Supply receipt','Attached'],['Service invoice','Attached'],['Payment record','Review']]],
      personalRows:[[['Income records','4 items'],['Expense records','6 items'],['Receipts','3 files']],[['Wages','$2,450'],['Tips','$320'],['Other income','$80']],[['Travel','$76'],['Tools','$125'],['Other spending','$44']],[['Travel receipt','Saved'],['Purchase receipt','Saved'],['Payment record','Review']]]
    }:{
      preview:'BẢN ĐỊNH HƯỚNG · DỮ LIỆU MINH HỌA', business:'Doanh nghiệp', personal:'Cá nhân', sample:'Hồ sơ minh họa',
      records:'Bản ghi minh họa', benefitBusiness:'Gom thu nhập, chi phí và biên lai để doanh nghiệp dễ rà soát, trao đổi với người phụ trách.',
      benefitPersonal:'Nhìn các nguồn thu, khoản chi và giấy tờ cá nhân trong cùng một nơi để tự kiểm tra hồ sơ.',
      note:'Màn hình ý tưởng với dữ liệu minh họa; chưa có hồ sơ thật hoặc chức năng khai thuế.',
      flows:['Thu nhập','Chi phí','Biên lai'],
      headings:['Bức tranh thu chi rõ ràng','Nguồn thu trong một nơi','Khoản chi có cấu trúc','Dễ tìm lại chứng từ'],
      descriptions:['Xem thu nhập, chi phí và biên lai sẵn có trong cùng một kỳ.','Tập hợp từng khoản thu cùng bản ghi liên quan.','Nhóm các khoản chi và xem mục nào có biên lai kèm theo.','Tìm chứng từ cần xem mà không phải lục nhiều thư mục.'],
      businessRows:[[['Khoản thu','12 mục'],['Khoản chi','8 mục'],['Biên lai','6 tệp']],[['Dịch vụ tại quầy','$1,260'],['Thanh toán thẻ','$840'],['Khoản thu khác','$110']],[['Vật tư','$320'],['Mặt bằng','$900'],['Chi phí vận hành','$145']],[['Biên lai vật tư','Đã gắn'],['Hóa đơn dịch vụ','Đã gắn'],['Chứng từ thanh toán','Cần xem']]],
      personalRows:[[['Khoản thu','4 mục'],['Khoản chi','6 mục'],['Biên lai','3 tệp']],[['Tiền công','$2,450'],['Tiền boa','$320'],['Khoản thu khác','$80']],[['Đi lại','$76'],['Dụng cụ','$125'],['Chi khác','$44']],[['Biên lai đi lại','Đã lưu'],['Biên lai mua sắm','Đã lưu'],['Chứng từ thanh toán','Cần xem']]]
    };
    const rows=(personal?copy.personalRows:copy.businessRows)[kind];
    const icons=['▤','↗','↘','▧'];
    const roleButtons=`<div class="tax-preview-roles" aria-label="${english?'Choose a view':'Chọn góc nhìn'}"><button type="button" data-tax-target="${kind}" aria-pressed="${!personal}">${copy.business}</button><button type="button" data-tax-target="${kind+4}" aria-pressed="${personal}">${copy.personal}</button></div>`;
    const values=`<div class="tax-preview-values"><div class="tax-preview-value ${personal?'':'active'}"><strong>${english?'For businesses':'Giá trị cho doanh nghiệp'}</strong><p>${copy.benefitBusiness}</p></div><div class="tax-preview-value ${personal?'active':''}"><strong>${english?'For individuals':'Giá trị cho cá nhân'}</strong><p>${copy.benefitPersonal}</p></div></div>`;
    return `<div class="tax-preview"><div class="tax-preview-top"><div><small>${copy.preview}</small><strong>${oneQrSafeText(english?feature[1]:feature[0])}</strong><p>${oneQrSafeText(english?feature[4]:feature[3])}</p></div>${roleButtons}</div><div class="tax-preview-main"><div class="tax-preview-summary"><small>${personal?copy.personal:copy.business}</small><strong>${copy.headings[kind]}</strong><p>${copy.descriptions[kind]}</p><div class="tax-preview-summary-flow">${copy.flows.map(flow=>`<span>${flow}</span>`).join('')}</div></div><div class="tax-preview-records"><div class="tax-preview-records-head"><strong>${copy.records}</strong><em>${copy.sample}</em></div>${rows.map(([label,detail])=>`<div class="tax-preview-record"><i aria-hidden="true">${icons[kind]}</i><span>${label}</span><em>${detail}</em></div>`).join('')}</div></div>${values}<small class="tax-preview-note">${copy.note}</small></div>`;
  }
  const communityAudiences = [
    { name:['Doanh nghiệp','Businesses'], headline:['Xây kết nối quanh thương hiệu','Build connections around your brand'], value:['Giới thiệu dịch vụ, tiếp cận cộng đồng địa phương, tìm người và duy trì hội thoại với khách.','Share services, reach the local community, find talent, and keep talking with guests.'], highlights:[['Fanpage & Blog','Fanpage & Blog'],['Đăng tuyển & ca làm','Jobs & shifts'],['Deal & Coupon','Deals & coupons'],['Tin nhắn & Cuộc gọi','Messages & calls']] },
    { name:['Người làm nghề','Professionals'], headline:['Tìm cơ hội và cộng đồng nghề','Find work and a professional circle'], value:['Theo dõi bài viết, tìm việc hoặc ca làm thêm và trao đổi trực tiếp với người cùng nghề.','Follow posts, find jobs or extra shifts, and connect directly with peers.'], highlights:[['Bảng tin & Nhóm','Feed & groups'],['Nhóm & Chợ','Groups & Market'],['Việc làm & ca thêm','Jobs & extra shifts'],['Chat, thoại & video','Chat, voice & video']] },
    { name:['Khách hàng','Customers'], headline:['Khám phá và liên hệ dễ hơn','Discover and connect more easily'], value:['Xem nội dung và ưu đãi gần mình, đặt câu hỏi và kết nối với doanh nghiệp khi cần.','See nearby content and offers, ask questions, and contact businesses when needed.'], highlights:[['Bảng tin địa phương','Local feed'],['Nhóm & Chợ','Groups & Market'],['Deal gần bạn','Nearby deals'],['Tin nhắn & Cuộc gọi','Messages & calls']] }
  ];
  const communityScenes = {
    communityFeed:{ title:['Bảng tin cộng đồng','Community feed'], summary:['Một nơi cho bài viết, hình ảnh, câu hỏi và mẹo nghề.','One place for posts, photos, questions, and professional tips.'], entries:[['▤','Bài viết và ảnh minh họa','Sample posts and photos'],['?','Hỏi đáp trong cộng đồng','Community questions'],['✦','Mẹo nghề mới','New professional tips']] },
    communityGroups:{ title:['Nhóm & Chợ','Groups & Market'], summary:['Tìm nhóm phù hợp hoặc khám phá nội dung mua bán.','Find relevant groups or browse marketplace posts.'], entries:[['♧','Nhóm theo khu vực','Local interest groups'],['◇','Bài đăng mua bán','Marketplace listings'],['▤','Trao đổi mới','Recent discussions']] },
    communityContent:{ title:['Fanpage & Blog','Fanpage & Blog'], summary:['Chia sẻ câu chuyện thương hiệu và kiến thức hữu ích.','Share brand stories and useful knowledge.'], entries:[['▣','Fanpage doanh nghiệp','Business fanpage'],['▤','Bài viết blog','Blog articles'],['✦','Mẹo & cảm hứng','Tips and inspiration']] },
    communityJobs:{ title:['Việc làm','Jobs'], summary:['Đăng tuyển và tìm vị trí phù hợp trong cộng đồng.','Post openings and explore relevant roles in the community.'], entries:[['▣','Tin tuyển mới','New openings'],['↗','Hồ sơ ứng tuyển','Applications'],['✉','Trao đổi trực tiếp','Direct conversations']] },
    communityShifts:{ title:['Ca làm thêm','Extra shifts'], summary:['Chia sẻ nhu cầu làm thêm và tìm ca phù hợp.','Share extra-shift needs and find a suitable time.'], entries:[['◷','Ca theo thời gian','Shifts by time'],['▣','Địa điểm làm việc','Work location'],['✉','Liên hệ nhận ca','Contact about a shift']] },
    communityDeals:{ title:['Deal & Coupon','Deals & Coupons'], summary:['Đưa ưu đãi đến người xem gần khu vực kinh doanh.','Show offers to people near the business.'], entries:[['◇','Deal gần bạn','Nearby deals'],['▣','Coupon minh họa','Sample coupons'],['↗','Xem điều kiện ưu đãi','Review offer details']] },
    communityMessages:{ title:['Tin nhắn & Nhóm chat','Messages & group chats'], summary:['Giữ cuộc trò chuyện riêng hoặc theo nhóm ở cùng một nơi.','Keep direct and group conversations in one place.'], entries:[['✉','Tin nhắn riêng','Direct messages'],['♧','Nhóm chat','Group chats'],['▤','Hình ảnh & tệp','Photos and files']] },
    communityCalls:{ title:['Gọi thoại & video','Voice & video calls'], summary:['Trao đổi trực tiếp khi tin nhắn cần được tiếp nối bằng cuộc gọi.','Move from messages to a direct voice or video conversation.'], entries:[['☎','Gọi thoại','Voice call'],['▣','Gọi video','Video call'],['◷','Lịch sử cuộc gọi','Call history']] }
  };
  function renderCommunityExplorerVisual(feature, english) {
    const pick=pair=>pair[english?1:0];
    const active=communityAudiences[explorerCommunityAudience];
    const scene=communityScenes[feature[2]];
    const cards=communityAudiences.map((audience,index)=>`<button type="button" class="community-value-card" data-community-audience="${index}" aria-pressed="${explorerCommunityAudience===index}"><small><b>${index+1}</b>${pick(audience.name)}</small><strong>${pick(audience.headline)}</strong><span>${pick(audience.value)}</span></button>`).join('');
    const entries=scene.entries.map(([icon,vi,en])=>`<div class="community-demo-entry"><i aria-hidden="true">${icon}</i><span>${english?en:vi}</span></div>`).join('');
    const highlights=active.highlights.map(pair=>`<span>${pick(pair)}</span>`).join('');
    return `<div class="community-preview"><div class="community-preview-head"><div><small>${english?'CORE VALUE FOR THREE GROUPS':'GIÁ TRỊ CỐT LÕI CHO 3 NHÓM'}</small><strong>${english?'Community connects people, opportunities, and conversations':'Community kết nối nội dung, cơ hội và hội thoại'}</strong></div><em>${english?'Illustrative view':'Màn hình minh họa'}</em></div><div class="community-value-grid">${cards}</div><div class="community-preview-main"><div class="community-demo-window"><small>${english?'FEATURE PREVIEW':'XEM THỬ TÍNH NĂNG'}</small><strong>${pick(scene.title)}</strong><p>${pick(scene.summary)}</p>${entries}</div><div class="community-audience-panel"><small>${english?'FEATURE HIGHLIGHTS':'TÍNH NĂNG NỔI BẬT'}</small><strong>${pick(active.name)}</strong><p>${pick(active.headline)}</p><div class="community-highlight-list">${highlights}</div></div></div><small class="community-preview-note">${english?'Sample content shows the intended experience for each group.':'Nội dung minh họa minh họa trải nghiệm dành cho từng nhóm.'}</small></div>`;
  }
  const giftSamples = [
    { type:'gift', name:['Gift Card','Gift Card'], title:['Quà tặng chăm sóc','A gift for a visit'], recipient:['Người nhận: Lan Anh','Recipient: Lan Anh'], amount:'$100', code:'GC-2026-018', kind:['Thẻ quà tặng','Gift card'] },
    { type:'member', name:['Membership','Membership'], title:['Thành viên Gold','Gold membership'], recipient:['Thành viên: Minh Trần','Member: Minh Tran'], amount:'GOLD', code:'MEM-2026-007', kind:['Thẻ thành viên','Membership card'] },
    { type:'egift', name:['E-Gift','E-Gift'], title:['Quà tặng trực tuyến','Digital gift'], recipient:['Người nhận: Alex','Recipient: Alex'], amount:'$50', code:'EG-2026-042', kind:['Thẻ quà tặng số','Digital gift card'] }
  ];
  const giftStories = {
    'Quản lý thẻ đã phát hành': { title:['Tìm đúng thẻ và trạng thái','Find the right card and status'], detail:['Tìm theo mã thẻ, người nhận và loại thẻ để xem lần phát hành hoặc sử dụng gần nhất.','Search by card code, recipient and type to review issue or redemption history.'], fields:[["Bộ lọc minh họa","Sample filter","Loại thẻ · Trạng thái","Card type · Status"],["Bước tiếp theo","Next step","Mở chi tiết thẻ","Open card details"]] },
    'Phát hành thẻ số': { title:['Tạo thẻ cho một người nhận','Create a card for a recipient'], detail:['Chọn thiết kế, mệnh giá hoặc quyền lợi, rồi kiểm tra thông tin trước khi gửi.','Choose a design, value or benefit, then review the details before sending.'], fields:[["Thiết kế","Design","Logo · Màu · Lời chúc","Logo · Color · Message"],["Khách nhận","Recipient","Tên · Kênh gửi","Name · Delivery channel"]] },
    'Thẻ thành viên': { title:['Gắn quyền lợi với hồ sơ khách','Connect benefits to a customer profile'], detail:['minh họa Gold cho thấy cách lưu hạng thẻ, quyền lợi và thời hạn ở cùng một nơi.','The Gold example shows tier, benefits and expiration together.'], fields:[["Hạng minh họa","Sample tier","Gold","Gold"],["Quyền lợi minh họa","Sample benefit","Ưu đãi cho lần ghé tiếp","Offer for a return visit"]] },
    'Thiết lập bán online nhanh': { title:['Đưa thẻ lên kênh bán trực tuyến','Prepare a card for online sales'], detail:['Một minh họa thẻ có hình, mô tả và giá rõ ràng trước khi khách mở trang mua.','A sample card has an image, description and price before a guest opens the purchase page.'], fields:[["Trang bán","Sales page","Mô tả · Mệnh giá","Description · Value"],["Kênh minh họa","Sample channel","VLinkPay","VLinkPay"]] },
    'Thiết lập E-Gift nâng cao': { title:['Hoàn thiện thông tin E-Gift','Complete the E-Gift setup'], detail:['Xem trước luồng kiểm tra thông tin doanh nghiệp, thiết kế và điều khoản của thẻ.','Preview the business verification, design and card terms flow.'], fields:[["Hồ sơ","Profile","Xác minh doanh nghiệp","Business verification"],["Nội dung","Content","Thiết kế · Điều khoản","Design · Terms"]] },
    'Nhận thanh toán bằng thẻ': { title:['Áp dụng thẻ cho một giao dịch','Apply a card to a transaction'], detail:['Đối chiếu mã thẻ, giá trị hoặc quyền lợi và kết quả áp dụng vào hóa đơn minh họa.','Check the card code, value or benefit, and how it applies to a sample ticket.'], fields:[["Hóa đơn minh họa","Sample ticket","$30","$30"],["Kết quả minh họa","Example result","$70 còn lại","$70 remaining"]] },
    'Chương trình thành viên': { title:['Thiết kế lý do để khách quay lại','Give guests a reason to return'], detail:['Liên kết quyền lợi, lịch sử sử dụng và thời hạn thẻ trong hành trình thành viên.','Connect benefits, usage history and expiration in the membership journey.'], fields:[["Quyền lợi minh họa","Sample benefit","Ưu đãi lần tiếp theo","Next-visit offer"],["Theo dõi","Follow-up","Ngày hết hạn","Expiration date"]] },
    'Báo cáo thành viên': { title:['Xem thẻ nào đang tạo tương tác','See which cards drive engagement'], detail:['minh họa báo cáo đặt lượt dùng thẻ và nhóm thành viên cạnh nhau để dễ so sánh.','A sample report places card redemptions and member tiers side by side.'], fields:[["Chỉ số minh họa","Sample metric","Lượt dùng thẻ","Card redemptions"],["So sánh","Comparison","Theo hạng thành viên","By membership tier"]] },
    'Lịch sử thanh toán thẻ': { title:['Theo dõi lần dùng thẻ','Review card payment history'], detail:['Mỗi lần dùng thẻ được đặt cạnh hóa đơn và số dư còn lại trong bản minh họa.','Each sample card use is shown with its ticket and remaining balance.'], fields:[["Giao dịch minh họa","Sample transaction","Hóa đơn $30","$30 ticket"],["Đối chiếu","Reconcile","Thẻ · Hóa đơn · Số dư","Card · Ticket · Balance"]] },
    'Thẻ sắp hết hạn': { title:['Chăm sóc khách trước khi thẻ hết hạn','Follow up before a card expires'], detail:['Lọc thẻ sắp hết hạn và chuẩn bị lời nhắc phù hợp cho người sở hữu.','Find cards nearing expiration and prepare a relevant reminder for the owner.'], fields:[["Mốc theo dõi","Watch window","30 ngày tới","Next 30 days"],["Hành động minh họa","Sample action","Nhắc khách kiểm tra thẻ","Remind guest to review card"]] }
  };
  function renderGiftExplorerVisual(feature, english) {
    const pick=pair=>pair[english?1:0];
    const fixedSample=feature[0]==='Thẻ thành viên'||feature[0]==='Chương trình thành viên'||feature[0]==='Báo cáo thành viên'?1:feature[0]==='Thiết lập bán online nhanh'||feature[0]==='Thiết lập E-Gift nâng cao'?2:feature[0]==='Lịch sử thanh toán thẻ'?0:null;
    const sampleIndex=fixedSample??explorerGiftSample;
    const sample=giftSamples[sampleIndex];
    const story=giftStories[feature[0]];
    const tabs=fixedSample===null?giftSamples.map((item,index)=>`<button type="button" data-gift-sample="${index}" aria-pressed="${index===sampleIndex}">${pick(item.name)}</button>`).join(''):`<span class="gift-journey-label">${english?'EXAMPLE:':'minh họa:'} ${pick(sample.name)}</span>`;
    const fields=story.fields.map(field=>`<div class="gift-case-row"><span>${english?field[1]:field[0]}</span><b>${english?field[3]:field[2]}</b></div>`).join('');
    const result=sampleIndex===0?['$70 còn lại','$70 remaining']:sampleIndex===1?['Đã áp dụng quyền lợi Gold','Gold benefit applied']:['$20 còn lại','$20 remaining'];
    const caseFields=feature[0]==='Nhận thanh toán bằng thẻ'?fields.replace(english?'$70 remaining':'$70 còn lại',pick(result)):fields;
    const flow=english?[["01","Issue","Card and recipient"],["02","Deliver","One QR or online"],["03","Redeem","SI POS checkout"],["04","Review","Payments and return visit"]]:[["01","Phát hành","Thẻ và người nhận"],["02","Gửi thẻ","One QR hoặc online"],["03","Sử dụng","Quầy SI POS"],["04","Theo dõi","Thanh toán và quay lại"]];
    const links=english?[["One QR","Guest opens the card from a QR menu","#module-oneqr"],["SI POS","Staff applies the card at checkout","#module-pos"],["Payments & Payouts","Business reviews the related transaction","#module-payments"]]:[["One QR","Khách mở thẻ từ menu QR","#module-oneqr"],["SI POS","Nhân viên áp dụng thẻ khi thu tiền","#module-pos"],["Payments & Payouts","Doanh nghiệp xem giao dịch liên quan","#module-payments"]];
    return `<div class="gift-journey"><div class="gift-journey-head"><div><small>${english?'CARD JOURNEY · EXAMPLE':'HÀNH TRÌNH THẺ · minh họa'}</small><strong>${english?'From a gift to the next visit':'Từ món quà đến lần ghé tiếp theo'}</strong></div><em>${english?'Illustrative data':'Dữ liệu minh họa'}</em></div><div class="gift-sample-tabs" aria-label="${english?'Sample card':'Thẻ minh họa'}">${tabs}</div><div class="gift-journey-main"><div class="gift-sample-card ${sample.type}"><small>NEXORA TOUCH · ${pick(sample.kind)}</small><strong>${pick(sample.title)}</strong><span>${pick(sample.recipient)}<br>${sample.code}</span><b>${sample.amount}</b></div><div class="gift-case"><small class="gift-journey-label">${english?'CURRENT FEATURE':'TÍNH NĂNG ĐANG XEM'}</small><strong>${pick(story.title)}</strong><p>${pick(story.detail)}</p><div class="gift-case-rows">${caseFields}</div></div></div><small class="gift-journey-label">${english?'HOW THE PARTS CONNECT':'CÁC BƯỚC LIÊN KẾT'}</small><div class="gift-flow">${flow.map(([number,title,detail])=>`<div class="gift-flow-step"><b>${number}</b><strong>${title}</strong><span>${detail}</span></div>`).join('')}</div><small class="gift-journey-label">${english?'CONNECTED AREAS':'LIÊN KẾT VỚI'}</small><div class="gift-connections">${links.map(([title,detail,href])=>`<a href="${href}"><strong>${title} ↗</strong><span>${detail}</span></a>`).join('')}</div><div class="gift-journey-actions"><button type="button" data-gift-jump="1">${english?'View card issue →':'Xem phát hành thẻ →'}</button><button type="button" data-gift-jump="5">${english?'View redemption →':'Xem dùng thẻ thanh toán →'}</button></div><small class="gift-journey-note">${english?'This is a connected journey preview. Card details and transactions are examples.':'Đây là bản minh họa hành trình liên kết; thông tin thẻ và giao dịch đều là ví dụ.'}</small></div>`;
  }
  const marketingStudioScenes = {
    marketingOverview:{ stage:0, image:'../assets/po-salon-home/salon-marketing-v2.png', caption:['Từ hiểu khách đến đo phản hồi','From audience insight to response'], headline:['Một hành trình tiếp thị có thể theo dõi','A marketing journey you can follow'], summary:['Bắt đầu từ nhóm khách, chuẩn bị thông điệp, chọn kênh rồi xem tín hiệu phản hồi để điều chỉnh.','Start with an audience, prepare the message, choose a channel and read response signals before adjusting.'], tools:[['Nhóm khách','Audience'],['Nội dung & kênh','Content & channel'],['Xu hướng phản hồi','Response trend']], value:['Cho doanh nghiệp thấy mỗi công cụ đóng góp vào bước nào của hành trình tiếp thị.','Shows where each tool fits in the marketing journey.'], trend:[18,24,31,40] },
    marketingAudience:{ stage:0, image:'../assets/nexora-welcome/ai-marketing-audience-v2.png', caption:['Hiểu nhóm khách trước khi gửi','Understand customers before sending'], headline:['Chọn nhóm khách có lý do để quan tâm','Choose an audience with a reason to care'], summary:['minh họa phân nhóm giúp hình dung khách mới, khách quay lại và khách lâu chưa ghé.','Sample segments illustrate new, returning and lapsed guests.'], tools:[['Khách mới','New guests'],['Khách quay lại','Returning guests'],['Lâu chưa ghé','Lapsed guests']], value:['Thông điệp phù hợp hơn khi bắt đầu từ lịch sử và nhu cầu của từng nhóm.','Relevant messages begin with each group’s history and needs.'], trend:[18,24,31,38] },
    marketingContent:{ stage:1, image:'../assets/nexora-welcome/salon-sms-campaign-workflow-v5.png', caption:['Thông điệp và hình ảnh cùng một ý tưởng','Message and image tell one story'], headline:['Soạn nội dung rõ lời mời và hành động','Draft content with a clear invitation and action'], summary:['Một minh họa thông điệp có tiêu đề, hình ảnh dịch vụ và lời mời đặt lịch để đội ngũ xem lại.','A sample draft combines a title, service image and booking invitation for review.'], tools:[['Tiêu đề','Headline'],['Ảnh dịch vụ','Service image'],['Lời mời đặt lịch','Booking call to action']], value:['Giúp đội ngũ xem lại thông điệp trước khi đưa vào một kênh gửi.','Lets the team review the message before using a delivery channel.'], trend:[12,19,25,34] },
    marketingSms:{ stage:2, image:'../assets/nexora-welcome/salon-sms-campaign-workflow-v5.png', caption:['Chiến dịch SMS theo từng bước','An SMS campaign in clear steps'], headline:['Từ nhóm khách đến lịch gửi SMS','From audience to SMS schedule'], summary:['minh họa chiến dịch nhắc khách về dịch vụ phù hợp và dẫn đến bước đặt lịch.','A sample campaign reminds guests of a relevant service and points to booking.'], tools:[['Chọn người nhận','Choose recipients'],['Xem trước SMS','Preview SMS'],['Chọn lịch gửi','Set schedule']], value:['Giữ đối tượng, nội dung và thời điểm gửi trong cùng một quy trình kiểm tra.','Keep audience, message and timing in one review flow.'], trend:[20,27,33,41] },
    marketingCampaign:{ stage:2, image:'../assets/nexora-welcome/salon-sms-campaign-workflow-v5.png', caption:['Một chiến dịch, nhiều điểm chạm','One campaign across touchpoints'], headline:['Theo dõi chiến dịch từ bản nháp đến phản hồi','Follow a campaign from draft to response'], summary:['Bản xem trước gom mục tiêu, kênh gửi và bước theo dõi vào một hành trình dễ đọc.','The sample brings goals, channels and follow-up into one readable journey.'], tools:[['Mục tiêu','Goal'],['Kênh triển khai','Channel'],['Theo dõi','Follow-up']], value:['Giúp doanh nghiệp nhìn rõ chiến dịch đang ở bước nào và cần xem tiếp gì.','Helps a business see the campaign stage and next review task.'], trend:[22,30,36,45] },
    marketingPos:{ stage:2, image:'../assets/po-salon-home/salon-marketing-v2.png', caption:['Ưu đãi gắn với lần ghé tại tiệm','Offers connected to the salon visit'], headline:['Đưa ưu đãi vào đúng điểm chạm','Place offers at the right touchpoint'], summary:['Ví dụ ưu đãi cho lần ghé tiếp theo có thể được nhân viên giới thiệu sau dịch vụ.','A sample next-visit offer can be introduced after a service.'], tools:[['Điều kiện ưu đãi','Offer terms'],['Hiển thị tại quầy','Front-desk view'],['Lần ghé tiếp','Next visit']], value:['Kết nối hoạt động tiếp thị với trải nghiệm phục vụ và cơ hội khách quay lại.','Connect marketing to the service experience and a return visit.'], trend:[15,19,27,35] },
    marketingWheel:{ stage:2, image:'../assets/nexora-welcome/spin-wheel.jpg', caption:['Trải nghiệm tương tác có phần thưởng','An interactive reward experience'], headline:['Thử một chiến dịch vòng quay tương tác','Preview a prize-wheel campaign'], summary:['Thiết kế quà tặng, quy tắc tham gia và hành động sau khi khách nhận kết quả.','Show rewards, participation rules and the next action after a guest gets a result.'], tools:[['Ảnh phần thưởng','Reward image'],['Quy tắc chơi','Rules'],['Bước sau kết quả','Next action']], value:['Tạo một điểm tương tác dễ nhớ và có bước tiếp theo rõ ràng cho khách.','Create a memorable interaction with a clear next step for guests.'], trend:[11,20,29,39] },
    marketingAds:{ stage:2, image:'../assets/nexora-welcome/ai-marketing-results-v2.png', caption:['Quảng cáo gắn với mục tiêu cụ thể','Ads tied to a clear goal'], headline:['Chuẩn bị quảng cáo theo mục tiêu','Prepare ads around an objective'], summary:['Màn minh họa đặt nhóm người xem, nội dung và kết quả cần theo dõi cạnh nhau.','The preview places audience, creative and the result to watch side by side.'], tools:[['Nhóm người xem','Audience'],['Hình ảnh quảng cáo','Ad creative'],['Chỉ số theo dõi','Metric to watch']], value:['Giúp đội ngũ thống nhất mục tiêu trước khi xem các tùy chọn AI Ads.','Align the team on a goal before opening AI Ads options.'], trend:[14,21,30,37] },
    marketingReviews:{ stage:3, image:'../assets/nexora-welcome/reviews.jpg', caption:['Phản hồi khách là tín hiệu cải thiện','Feedback is a signal to improve'], headline:['Dùng đánh giá để hiểu điều khách quan tâm','Learn what guests care about from reviews'], summary:['Đọc điểm khách khen và điều cần cải thiện trước khi sửa thông điệp hoặc ưu đãi.','Read praise and improvement points before changing a message or offer.'], tools:[['Điểm được khen','Positive themes'],['Vấn đề lặp lại','Repeated issues'],['Ý tưởng nội dung','Content ideas']], value:['Nội dung tiếp thị có căn cứ hơn khi được đối chiếu với trải nghiệm thực tế.','Marketing content is better grounded when checked against real experiences.'], trend:[10,15,21,28] },
    marketingCustomers:{ stage:0, image:'../assets/nexora-welcome/ai-marketing-audience-v2.png', caption:['Hồ sơ khách tạo ngữ cảnh','Customer profiles provide context'], headline:['Hiểu lịch sử ghé và nhu cầu khách','Understand visits and customer needs'], summary:['minh họa xem khách mới, khách thường xuyên và khách cần được chăm sóc lại.','Preview new, frequent and follow-up customer groups.'], tools:[['Lịch sử ghé','Visit history'],['Dịch vụ quan tâm','Service interest'],['Chăm sóc tiếp','Next follow-up']], value:['Chọn thông điệp dựa trên ngữ cảnh của khách thay vì gửi cùng một nội dung cho tất cả.','Choose messages from customer context instead of sending one message to everyone.'], trend:[16,22,28,36] },
    marketingAnalytics:{ stage:3, image:'../assets/nexora-welcome/ai-marketing-results-v2.png', caption:['Nhìn xu hướng trước khi điều chỉnh','Read the trend before adjusting'], headline:['So sánh tương tác theo thời gian','Compare engagement over time'], summary:['Biểu đồ minh họa theo tuần giúp nhìn cách đọc xu hướng, phản hồi và bước tối ưu tiếp theo.','A weekly sample chart shows how to read trends, responses and the next improvement step.'], tools:[['Xu hướng tuần','Weekly trend'],['Phản hồi','Responses'],['Bước tối ưu','Next improvement']], value:['Giữ quyết định tiếp thị gắn với điều người xem làm sau khi nhận thông điệp.','Tie marketing decisions to what people do after receiving a message.'], trend:[18,25,24,40] }
  };
  function renderMarketingExplorerVisual(feature, english) {
    const pick=pair=>pair[english?1:0];
    const scene=marketingStudioScenes[feature[2]];
    const stages=english?['Audience','Content','Activate','Learn']:['Nhóm khách','Nội dung','Triển khai','Học từ kết quả'];
    const stageHtml=stages.map((label,index)=>`<span class="${index===scene.stage?'active':''}"><b>0${index+1}</b>${label}</span>`).join('');
    const points=scene.tools.map(([vi,en],index)=>`<span><i aria-hidden="true">${['◎','▤','↗'][index]}</i>${english?en:vi}</span>`).join('');
    const max=Math.max(...scene.trend);
    const bars=scene.trend.map(value=>`<span><b>${value}</b><i style="height:${Math.round(value/max*45)}px"></i></span>`).join('');
    const nextIndex=(salonExplorer.aimarketing.features.findIndex(item=>item[2]===feature[2])+1)%salonExplorer.aimarketing.features.length;
    return `<div class="marketing-studio"><div class="marketing-studio-head"><div><small>${english?'AI MARKETING · FEATURE STORY':'AI MARKETING · CÂU CHUYỆN TÍNH NĂNG'}</small><strong>${pick(scene.headline)}</strong></div><em>${english?'Illustrative preview':'Bản minh họa'}</em></div><div class="marketing-studio-flow">${stageHtml}</div><div class="marketing-studio-main"><div class="marketing-studio-photo"><img src="${scene.image}" alt="" loading="lazy" decoding="async"><span>${pick(scene.caption)}</span></div><div class="marketing-studio-case"><small class="marketing-studio-label">${english?'HOW IT WORKS':'CÔNG CỤ & NỘI DUNG'}</small><strong>${english?feature[1]:feature[0]}</strong><p>${pick(scene.summary)}</p><div class="marketing-studio-points">${points}</div></div></div><div class="marketing-studio-bottom"><div class="marketing-trend" role="img" aria-label="${english?'Illustrative weekly engagement:':'Lượt tương tác minh họa theo tuần:'} ${scene.trend.join(', ')}"><strong>${english?'Sample engagement trend':'Xu hướng tương tác minh họa'}</strong><small>${english?'Illustrative counts by week; not campaign results':'Số lượt minh họa theo tuần; không phải kết quả chiến dịch'}</small><div class="marketing-trend-bars" aria-hidden="true">${bars}</div><div class="marketing-trend-weeks" aria-hidden="true">${[1,2,3,4].map(week=>`<span>${english?'W':'T'}${week}</span>`).join('')}</div></div><div class="marketing-value"><small class="marketing-studio-label">${english?'VALUE FOR THE BUSINESS':'GIÁ TRỊ CHO DOANH NGHIỆP'}</small><strong>${english?'What this step clarifies':'Điều bước này giúp làm rõ'}</strong><p>${pick(scene.value)}</p><button type="button" data-marketing-jump="${nextIndex}">${english?'See next tool →':'Xem công cụ tiếp →'}</button></div></div><small class="marketing-studio-note">${english?'Images and numbers illustrate a possible workflow. They are not live customer or campaign data.':'Hình ảnh và số liệu dùng để minh họa cách vận hành, không phải dữ liệu khách hoặc chiến dịch thực tế.'}</small></div>`;
  }
  const aihubOptimizationIdeas = {
    overview:[
      ['Tiếp nhận & tóm tắt','Receive & summarize','Gom yêu cầu của khách thành một ghi chú ngắn để nhân viên xem trước.','Turn a customer request into a short note for staff review.','Giảm bước hỏi lại và giúp đội ngũ tiếp nối cuộc trò chuyện rõ hơn.','Reduce repeated questions and give the team a clearer handoff.'],
      ['Điều phối lịch','Coordinate bookings','Gợi ý khoảng phù hợp từ lịch và nhu cầu dịch vụ; nhân viên vẫn kiểm tra trước khi xác nhận.','Suggest suitable times from the calendar and service need; staff still confirm.','Giúp quầy xử lý yêu cầu lịch hẹn nhất quán hơn.','Help the front desk handle booking requests more consistently.'],
      ['Chăm sóc tiếp','Follow up','Gợi ý bước nhắc hẹn hoặc liên hệ lại sau lần tương tác.','Suggest a reminder or follow-up after the interaction.','Giữ yêu cầu của khách không bị bỏ quên giữa các kênh.','Keep customer requests from getting lost between channels.']
    ],
    reception:[
      ['Tóm tắt yêu cầu','Summarize the request','Lọc ý chính từ cuộc gọi hoặc lịch hẹn thành một ghi chú cần xác nhận.','Turn a call or booking request into a note for review.','Nhân viên nắm ngữ cảnh nhanh trước khi trả lời khách.','Staff can understand the context before responding.'],
      ['Gợi ý lịch trống','Suggest open times','Đối chiếu loại dịch vụ với các khoảng lịch còn trống trong bản xem trước.','Compare the service requested with available time slots in the preview.','Hạn chế việc tìm lịch thủ công khi tiếp nhận yêu cầu.','Reduce manual calendar searching during intake.'],
      ['Nhắc việc tiếp nối','Prompt follow-up','Đánh dấu yêu cầu chưa được xác nhận hoặc cuộc gọi cần liên hệ lại.','Flag requests awaiting confirmation or calls needing a return contact.','Đội ngũ có danh sách việc tiếp theo rõ ràng.','Give the team a clear list of next actions.']
    ],
    setup:[
      ['Rà soát cấu hình','Review setup','Kiểm tra thông tin doanh nghiệp, giờ mở cửa và phạm vi trợ lý được phép trả lời.','Check business details, hours and what the assistant may answer.','Giúp câu trả lời và lịch đề xuất bám sát cách doanh nghiệp vận hành.','Keep answers and suggested times aligned with business operations.'],
      ['Gợi ý kịch bản','Suggest a script','Chuẩn bị các câu hỏi minh họa cho đặt lịch, đổi lịch và chuyển tiếp nhân viên.','Prepare sample prompts for booking, rescheduling and staff handoff.','Đội ngũ có thể xem lại trải nghiệm trước khi đưa vào sử dụng.','Let the team review the experience before use.'],
      ['Kiểm tra bàn giao','Check handoff','Xác định lúc nào AI nên dừng và chuyển yêu cầu cho nhân viên.','Define when AI should stop and pass the request to a person.','Giữ các trường hợp cần người xử lý ở đúng nơi.','Route cases needing a person to the right team.']
    ],
    marketing:[
      ['Gợi ý nhóm khách','Suggest an audience','Dựa vào ngữ cảnh tương tác để đề xuất nhóm khách cần chăm sóc.','Use interaction context to suggest a group for follow-up.','Nội dung tiếp thị có mục tiêu rõ hơn.','Give marketing content a clearer audience.'],
      ['Chuẩn bị nội dung','Prepare content','Tạo bản nháp thông điệp hoặc ưu đãi để nhân viên chỉnh sửa và duyệt.','Draft a message or offer for staff to edit and approve.','Rút ngắn thời gian chuẩn bị nhưng vẫn giữ quyền kiểm soát cho đội ngũ.','Shorten preparation time while keeping the team in control.'],
      ['Đọc tín hiệu','Read signals','Gom phản hồi và mức tương tác thành điểm cần xem lại trong bản xem trước.','Collect responses and engagement into items for review in the preview.','Giúp doanh nghiệp biết điều gì nên điều chỉnh ở lần tiếp theo.','Show the business what to refine next time.']
    ]
  };
  const aihubStoryScenes = {
    aihubOverview:{ family:'overview', image:'../assets/nexora-welcome/ai-voice-call-reception.jpg', headline:['AI hỗ trợ từ lần liên hệ đầu đến bước chăm sóc tiếp','AI supports the journey from first contact to follow-up'], summary:['Một luồng rõ ràng giữa khách, trợ lý và nhân viên để doanh nghiệp không mất ngữ cảnh.','A clear flow between guest, assistant and staff helps preserve context.'] },
    aihubAppointments:{ family:'reception', image:'../assets/po-salon-home/ai-voice-staff-calendar.png', headline:['Từ yêu cầu đặt lịch đến bước xác nhận','From booking request to confirmation'], summary:['Lịch hẹn có thông tin khách, dịch vụ và bước nhân viên cần kiểm tra.','Bookings include guest, service and staff review context.'] },
    aihubCalendar:{ family:'reception', image:'../assets/po-salon-home/ai-voice-staff-calendar.png', headline:['Lịch làm việc dễ theo dõi hơn','A calendar that is easier to coordinate'], summary:['Nhìn các khoảng hẹn trong ngày và những yêu cầu đang chờ xử lý.','See the day’s slots and requests still awaiting attention.'] },
    aihubCustomers:{ family:'reception', image:'../assets/po-salon-home/salon-reception.png', headline:['Hồ sơ khách tạo ngữ cảnh cho lần liên hệ','Customer profiles bring context to each contact'], summary:['Thông tin khách và lịch sử ghé giúp đội ngũ biết nên tiếp nối từ đâu.','Customer details and visit history help the team pick up the conversation.'] },
    aihubCalls:{ family:'reception', image:'../assets/nexora-welcome/ai-voice-call-reception.jpg', headline:['Cuộc gọi có bước tiếp theo rõ ràng','Calls with a clear next step'], summary:['Nhật ký cuộc gọi cho biết ai cần gọi lại và yêu cầu nào cần xác nhận.','The call log shows who needs a return call and which requests need confirmation.'] },
    aihubPlans:{ family:'setup', image:'../assets/po-salon-home/salon-reception.png', headline:['Chọn phạm vi AI phù hợp doanh nghiệp','Choose the right AI scope for the business'], summary:['Xem các gói và quyết định phần nào cần trợ lý hỗ trợ trong quy trình.','Review plans and decide which parts of the workflow need assistant support.'] },
    aihubSettings:{ family:'setup', image:'../assets/po-salon-home/ai-voice-staff-calendar.png', headline:['Thông tin đúng giúp AI hỗ trợ đúng','Good business details lead to better AI assistance'], summary:['Giờ mở cửa, dịch vụ và quy tắc bàn giao là nền tảng cho luồng tiếp nhận.','Hours, services and handoff rules ground the reception flow.'] },
    aihubVoice:{ family:'setup', image:'../assets/nexora-welcome/ai-voice-call-reception.jpg', headline:['Thử kịch bản thoại trước khi sử dụng','Preview the voice flow before use'], summary:['minh họa hội thoại cho đặt lịch và chuyển cho nhân viên ở những tình huống cần thiết.','A sample conversation covers bookings and handoff to staff when needed.'] },
    aihubSms:{ family:'marketing', image:'../assets/po-salon-home/ai-voice-sms-confirmation.png', headline:['Tiếp nối cuộc gọi bằng thông điệp phù hợp','Follow a call with a relevant message'], summary:['Từ yêu cầu của khách đến bản nháp SMS có ngữ cảnh để đội ngũ xem lại.','Move from a customer request to a contextual SMS draft for staff review.'] },
    aihubCampaigns:{ family:'marketing', image:'../assets/nexora-welcome/salon-sms-campaign-workflow-v5.png', headline:['Chiến dịch bắt đầu từ nhu cầu thực','Campaigns start with a real customer need'], summary:['Chọn nhóm khách và nội dung dựa trên tín hiệu từ lịch hẹn hoặc tương tác trước đó.','Choose an audience and message based on booking or earlier interaction signals.'] },
    aihubOffers:{ family:'marketing', image:'../assets/po-salon-home/salon-marketing-v2.png', headline:['Đưa ưu đãi đến đúng thời điểm','Present an offer at the right moment'], summary:['Ưu đãi POS được xem như một bước chăm sóc phù hợp với lần ghé của khách.','A POS offer becomes a relevant follow-up to a guest visit.'] },
    aihubReviews:{ family:'marketing', image:'../assets/nexora-welcome/reviews.jpg', headline:['Phản hồi giúp cải thiện lần phục vụ tới','Feedback can improve the next visit'], summary:['Đánh giá nêu vấn đề hoặc điểm được khen để nhân viên xem và xử lý.','Reviews surface issues and praise for staff to review and act on.'] },
    aihubAnalytics:{ family:'marketing', image:'../assets/nexora-welcome/ai-marketing-results-v2.png', headline:['Từ tương tác đến quyết định cải thiện','From interactions to improvement decisions'], summary:['Đặt lịch hẹn, cuộc gọi và phản hồi cạnh nhau để tìm điểm cần điều chỉnh.','Compare bookings, calls and responses to find what needs adjustment.'] },
    aihubWheel:{ family:'marketing', image:'../assets/nexora-welcome/spin-wheel.jpg', headline:['Thử ngay quà tặng tương tác','Preview an interactive reward'], summary:['Một vòng quay tương tác cho thấy cách tạo điểm chạm vui và lời mời quay lại.','A sample wheel shows a playful touchpoint and an invitation to return.'] },
    aihubAds:{ family:'marketing', image:'../assets/nexora-welcome/ai-marketing-results-v2.png', headline:['Quảng cáo có mục tiêu và bước theo dõi','Ads with a goal and a follow-up plan'], summary:['Xác định nhóm khách, thông điệp và tín hiệu cần xem trước khi mở AI Ads.','Define audience, message and signals to review before opening AI Ads.'] }
  };
  const posIntelligenceScenes = {
    'SI POS · Super Intelligence': [['Lịch hẹn, hàng chờ, trạng thái thợ và kết quả dịch vụ có thể được nhìn trong cùng ngữ cảnh.','Bookings, queue, staff status and service outcomes can be viewed in one context.'],['Ưu tiên việc cần xử lý, giải thích lý do và để nhân viên xác nhận trước khi thay đổi luồng phục vụ.','Prioritize the next task, explain why, and let staff confirm before changing the service flow.']],
    'Đón khách': [['Khách đã có lịch đến quầy trong lúc thợ phù hợp còn đang phục vụ.','A booked guest arrives while the matching technician is still serving.'],['Ghi nhận khách đến, đối chiếu thời gian chờ và đề xuất người có thể tiếp nhận.','Record arrival, review the wait and suggest who could take the guest.']],
    'Phiếu dịch vụ': [['Một dịch vụ đang làm sắp hết thời lượng dự kiến nhưng phiếu chưa cập nhật.','An active service nears its planned duration while its ticket has no update.'],['Nhắc nhân viên kiểm tra tiến độ và xác nhận các dịch vụ phát sinh trước khi thu tiền.','Prompt staff to review progress and confirm added services before checkout.']],
    'Xếp lượt': [['Hàng chờ tăng trong khi năng lực phục vụ giữa các thợ chưa cân bằng.','The queue grows while available capacity is uneven across technicians.'],['Đề xuất lượt tiếp theo theo kỹ năng, lịch hẹn và trạng thái thực tế để quản lý duyệt.','Suggest the next assignment using skill, bookings and current status for a manager to review.']],
    'Thu tiền': [['Dịch vụ đã hoàn tất nhưng tiền boa hoặc quyền lợi thẻ chưa được kiểm tra.','Service is complete, but tip or card benefits have not been reviewed.'],['Tập hợp phiếu dịch vụ, ưu đãi và phương thức thanh toán để thu ngân xác nhận.','Bring together the service ticket, offers and payment choices for cashier confirmation.']],
    'Gift Card Center': [['Khách có thẻ quà tặng hoặc quyền lợi thành viên khi chuẩn bị thanh toán.','A guest has a gift card or membership benefit at checkout.'],['Hiển thị quyền lợi đủ điều kiện và yêu cầu nhân viên kiểm tra trước khi áp dụng.','Show eligible benefits and ask staff to review before applying them.']],
    'Đã hoàn tất': [['Lượt phục vụ đã xong nhưng còn thiếu bước chốt phiếu hoặc chăm sóc sau dịch vụ.','A visit is complete but its ticket or follow-up is still open.'],['Đưa các việc còn lại vào danh sách cần xác nhận để không bỏ sót khi khách rời tiệm.','Put remaining tasks into a review list before the guest leaves.']],
    'Menu dịch vụ của tiệm': [['Nhu cầu đặt lịch tăng cho một dịch vụ có thời lượng hoặc giá chưa rõ.','Interest rises for a service whose duration or price is unclear.'],['Gợi ý kiểm tra mô tả, giá và thời lượng trên menu trước khi giới thiệu cho khách.','Suggest reviewing the menu description, price and duration before recommending it.']],
    'Quản lý dịch vụ': [['Thời lượng thực tế của một dịch vụ thường khác thời lượng đã cài đặt.','Actual service duration often differs from the configured time.'],['Đề xuất quản lý xem lại thời lượng và giá để lịch hẹn phản ánh đúng năng lực.','Suggest that a manager review duration and pricing so bookings reflect capacity.']],
    'Lịch hẹn': [['Hai lịch hẹn gần nhau có thể cạnh tranh cùng một thợ hoặc khu vực phục vụ.','Two nearby bookings may need the same technician or service station.'],['Chỉ ra điểm trùng và gợi ý khung giờ thay thế để nhân viên xác nhận với khách.','Flag the overlap and suggest an alternate slot for staff to confirm with the guest.']],
    'Báo giá': [['Khách hỏi giá cho nhiều dịch vụ và có lựa chọn bổ sung.','A guest asks for pricing across several services and add-ons.'],['Tập hợp giá từ menu thành bản xem trước và để nhân viên kiểm tra trước khi gửi.','Combine menu prices into a preview for staff to review before sharing.']],
    'Chấm công': [['Ca làm đã bắt đầu nhưng trạng thái có mặt của đội ngũ chưa đủ rõ.','A shift has started, but team attendance is unclear.'],['Nhắc quản lý xác nhận chấm công trước khi dùng dữ liệu đó để xếp lượt.','Prompt the manager to confirm attendance before using it for assignments.']],
    'Hồ sơ khách': [['Khách quay lại có sở thích hoặc ghi chú từ những lần ghé trước.','A returning guest has preferences or notes from earlier visits.'],['Đưa đúng ngữ cảnh cho người phục vụ, giới hạn ở thông tin cần thiết cho lần ghé này.','Surface relevant context for the technician, limited to this visit.']],
    'Khuyến mãi': [['Một ưu đãi sắp hết hạn có thể phù hợp với dịch vụ khách đang chọn.','An expiring offer may match the service a guest is considering.'],['Cho nhân viên xem điều kiện, giá trị và thời hạn trước khi giới thiệu.','Show staff the terms, value and expiration before recommending it.']],
    'Đánh giá': [['Phản hồi sau dịch vụ nêu một điểm cần xử lý trước lần ghé tiếp theo.','Post-visit feedback identifies an issue to address before the next visit.'],['Tóm tắt vấn đề và gợi ý bước theo dõi để quản lý duyệt nội dung phản hồi.','Summarize the issue and suggest a follow-up for a manager to review.']],
    'Lễ tân AI': [['Một yêu cầu đặt lịch hoặc cuộc gọi cần thông tin mà AI chưa thể xác nhận.','A booking request or call needs information AI cannot confirm.'],['Chuyển ngữ cảnh cho nhân viên, kèm câu hỏi còn thiếu và thời điểm cần trả lời.','Hand the context to staff with the missing question and response timing.']],
    'Doanh số': [['Doanh thu trong kỳ thay đổi cùng số lượt phục vụ hoặc cơ cấu dịch vụ.','Sales in a period change alongside visits or service mix.'],['Đặt các tín hiệu cạnh nhau để chủ tiệm chọn nguyên nhân cần kiểm tra sâu.','Put the signals side by side so the owner can choose what to inspect.']],
    'Giao dịch': [['Một khoản thanh toán cần đối chiếu với phiếu dịch vụ tương ứng.','A payment needs to be matched with its service ticket.'],['Đưa trạng thái và chứng từ liên quan vào cùng nơi để nhân viên kiểm tra.','Bring status and related records together for staff review.']],
    'Chi trả thợ': [['Khoản tip và phần chi trả cần khớp với dịch vụ đã hoàn tất.','Tips and staff payouts need to align with completed services.'],['Gợi ý khoản cần đối chiếu và yêu cầu quản lý xác nhận trước khi chi trả.','Flag amounts to reconcile and require manager confirmation before payout.']],
    'Phân tích': [['Một xu hướng lặp lại xuất hiện trong lịch hẹn, tiền boa hoặc mức dùng QR.','A recurring pattern appears in bookings, tips or QR engagement.'],['Nêu tín hiệu, nguồn dữ liệu và câu hỏi kiểm tra tiếp theo thay vì kết luận tự động.','Show the signal, data source and next question rather than an automatic conclusion.']]
  };
  function renderPosExplorerVisual(feature, english) {
    const pick=pair=>pair[english?1:0];
    const name=feature[0];
    const scene=posIntelligenceScenes[name] || [
      [feature[3], feature[4]],
      ['Nhân viên xem ngữ cảnh và chọn bước xử lý phù hợp.', 'Staff review the context and choose an appropriate next step.']
    ];
    const index=posFeatureOrder.indexOf(name);
    const family=index===0?'overview':index<9?'desk':index<12?'team':index<16?'guest':'revenue';
    const photo=name==='Gift Card Center'?'../assets/nexora-welcome/gift.jpg':name==='Đánh giá'?'../assets/nexora-welcome/reviews.jpg':name==='Lễ tân AI'?'../assets/nexora-welcome/ai-voice-call-reception.jpg':family==='team'?'../assets/po-salon-home/si-pos-turn-board.png':family==='guest'?'../assets/po-salon-home/salon-reception.png':family==='revenue'?'../assets/nexora-welcome/analytics.jpg':'../assets/po-salon-home/si-pos-operations-hub-optimized.jpg';
    const domainNames=[['Quầy & dịch vụ','Front desk'],['Lịch & đội ngũ','Team & schedule'],['Khách & tăng trưởng','Guests & growth'],['Doanh thu','Revenue']];
    const targets=['Đón khách','Xếp lượt','Hồ sơ khách','Doanh số'];
    const icons=['nav-pos','nav-queue','nav-community','nav-chart'];
    const activeDomain=family==='overview'?-1:family==='desk'?0:family==='team'?1:family==='guest'?2:3;
    const domainButtons=domainNames.map((domain,i)=>`<button type="button" data-pos-jump="${posFeatureOrder.indexOf(targets[i])}" aria-pressed="${activeDomain===i}"><svg aria-hidden="true"><use href="#${icons[i]}"></use></svg><span>${pick(domain)}</span></button>`).join('');
    const contextByFamily={
      overview:[[['Dữ liệu được kết nối','Connected context'],['Quầy, lịch hẹn, trạng thái thợ, hồ sơ khách và kết quả thanh toán.','Desk, bookings, staff status, customer profiles and payment outcomes.']],[['Vì sao có gợi ý','Why a suggestion appears'],['Tín hiệu được đặt cạnh mục tiêu phục vụ và năng lực đang có của tiệm.','Signals are compared with service goals and current salon capacity.']],[['Giá trị cần kiểm chứng','Value to validate'],['Ít bỏ sót hơn, bàn giao rõ hơn và quyết định có ngữ cảnh.','Fewer missed steps, clearer handoffs and decisions with context.']]],
      desk:[[['Dữ liệu liên quan','Relevant inputs'],['Lượt đến, phiếu dịch vụ, hàng chờ và tình trạng thanh toán.','Arrivals, service tickets, queue and payment status.']],[['Lý do ưu tiên','Why this matters'],['Nhận ra việc đang chờ để quầy xử lý trước khi gây chậm trễ.','Spot pending work before it delays the desk.']],[['Giá trị cho quầy','Front-desk value'],['Một bước tiếp theo rõ ràng ở từng chặng phục vụ.','A clear next step at each service stage.']]],
      team:[[['Dữ liệu liên quan','Relevant inputs'],['Lịch hẹn, xếp lượt, chấm công và thời lượng dịch vụ.','Bookings, queue, attendance and service duration.']],[['Lý do ưu tiên','Why this matters'],['So khớp nhu cầu sắp đến với năng lực thật của đội ngũ.','Match upcoming demand with actual team capacity.']],[['Giá trị cho đội ngũ','Team value'],['Phân công dễ giải thích và giảm xung đột lịch.','Assignments that are easier to explain and fewer schedule conflicts.']]],
      guest:[[['Dữ liệu liên quan','Relevant inputs'],['Lịch sử ghé, ưu đãi, đánh giá và yêu cầu liên hệ.','Visit history, offers, reviews and contact requests.']],[['Lý do ưu tiên','Why this matters'],['Nhận đúng ngữ cảnh trước khi chăm sóc hoặc giới thiệu dịch vụ.','Understand the context before follow-up or a recommendation.']],[['Giá trị cho khách','Guest value'],['Trải nghiệm nhất quán hơn giữa các lần ghé.','A more consistent experience across visits.']]],
      revenue:[[['Dữ liệu liên quan','Relevant inputs'],['Phiếu đã hoàn tất, giao dịch, tiền boa và khoản chi trả.','Completed tickets, payments, tips and payouts.']],[['Lý do ưu tiên','Why this matters'],['Đặt kết quả tài chính cạnh hoạt động tạo ra chúng.','Compare financial outcomes with the activity behind them.']],[['Giá trị cho chủ tiệm','Owner value'],['Biết khoản nào cần đối chiếu và xu hướng nào cần xem sâu.','Know which amounts need reconciliation and which trends merit a closer look.']]]
    };
    const contextLabels=contextByFamily[family];
    const contextHtml=contextLabels.map(([label,body])=>`<div><small>${pick(label)}</small><p>${pick(body)}</p></div>`).join('');
    return `<div class="pos-intelligence">
      <div class="pos-intelligence-hero"><img src="${photo}" alt="" loading="lazy" decoding="async"><div class="pos-intelligence-hero-copy"><small>SI POS · SUPER INTELLIGENCE</small><strong>${english?'Understand the operation. Recommend the next move.':'Hiểu vận hành. Gợi ý bước tiếp theo.'}</strong><p>${oneQrSafeText(english?feature[4]:feature[3])}</p><em>${english?'Illustrative workflow':'Quy trình minh họa'}</em></div></div>
      <div class="pos-intelligence-domains" aria-label="${english?'Explore operating areas':'Khám phá các nhóm vận hành'}">${domainButtons}</div>
      <div class="pos-intelligence-reading"><div class="pos-intelligence-card is-signal"><small>${english?'1 · ILLUSTRATIVE SIGNAL':'1 · TÍN HIỆU MINH HỌA'}</small><strong>${english?'What SI POS could notice':'Điều SI POS có thể nhận biết'}</strong><p>${oneQrSafeText(pick(scene[0]))}</p></div><div class="pos-intelligence-card is-action"><small>${english?'2 · SUGGESTED ACTION':'2 · HÀNH ĐỘNG GỢI Ý'}</small><strong>${english?'A next step for staff to review':'Bước tiếp theo để nhân viên duyệt'}</strong><p>${oneQrSafeText(pick(scene[1]))}</p></div></div>
      <div class="pos-intelligence-context">${contextHtml}</div>
      <div class="pos-intelligence-process"><span>1 · ${english?'Observe':'Nhận biết'}</span><span>2 · ${english?'Explain':'Giải thích'}</span><span>3 · ${english?'Staff confirms':'Nhân viên duyệt'}</span><span>4 · ${english?'Track outcome':'Theo dõi kết quả'}</span></div>
      <div class="pos-intelligence-footer"><p>${english?'Concept preview; scenarios do not represent live salon data or an active automated decision.':'Bản minh họa ý tưởng; tình huống không phải dữ liệu thực tế hay quyết định tự động đang chạy.'}</p>${index===0?'':`<button type="button" data-pos-jump="0">${english?'View the SI POS overview →':'Xem toàn cảnh SI POS →'}</button>`}</div>
    </div>`;
  }
  function renderAiHubExplorerVisual(feature, english) {
    const pick=pair=>pair[english?1:0];
    const scene=aihubStoryScenes[feature[2]];
    const ideas=aihubOptimizationIdeas[scene.family];
    const active=ideas[explorerAiHubIdea];
    const label=scene.family==='marketing'?['MARKETING ASSISTANT · ĐỊNH HƯỚNG','MARKETING ASSISTANT · CONCEPT']:['AI RECEPTIONIST · BẢN MINH HỌA','AI RECEPTIONIST · PREVIEW'];
    const flow=scene.family==='marketing'?[['Hiểu khách','Understand guests'],['Chuẩn bị','Prepare'],['Theo dõi','Review']]:scene.family==='setup'?[['Cấu hình','Configure'],['Kiểm tra','Review'],['Bàn giao','Handoff']]:[['Khách liên hệ','Guest contacts'],['AI chuẩn bị','AI prepares'],['Nhân viên xác nhận','Staff confirms']];
    const ideaButtons=ideas.map((idea,index)=>`<button type="button" data-aihub-idea="${index}" aria-pressed="${index===explorerAiHubIdea}"><i aria-hidden="true">${['✦','◷','↗'][index]}</i>${english?idea[1]:idea[0]}</button>`).join('');
    return `<div class="aihub-story"><div class="aihub-hero"><img src="${scene.image}" alt="" loading="lazy" decoding="async"><div class="aihub-hero-copy"><small>${pick(label)}</small><strong>${pick(scene.headline)}</strong><p>${pick(scene.summary)}</p><em>${english?'Illustrative image':'Hình minh họa'}</em></div></div><div class="aihub-value-head"><strong>${english?'Where AI could help this business':'AI có thể tối ưu điều gì cho doanh nghiệp'}</strong><small>${english?'Select an idea':'Chọn một gợi ý'}</small></div><div class="aihub-ideas">${ideaButtons}</div><div class="aihub-idea-detail"><div><small>${english?'PROPOSED AI SUPPORT':'HỖ TRỢ AI ĐỀ XUẤT'}</small><strong>${english?active[1]:active[0]}</strong><p>${english?active[3]:active[2]}</p></div><div><small>${english?'BUSINESS VALUE':'GIÁ TRỊ MANG LẠI'}</small><strong>${english?'A clearer next action':'Bước tiếp theo rõ hơn'}</strong><p>${english?active[5]:active[4]}</p></div></div><div class="aihub-flow">${flow.map((step,index)=>`<span>0${index+1} · ${pick(step)}</span>`).join('')}</div><small class="aihub-note">${english?'AI optimization ideas and image illustrate a possible workflow. A staff member reviews decisions; this is not live customer data.':'Gợi ý AI và hình ảnh minh họa quy trình có thể triển khai. Nhân viên kiểm tra trước khi quyết định; đây không phải dữ liệu khách thực tế.'}</small></div>`;
  }
  const oneQrExplorerGuides = {
    qrScan: [['Đặt một bảng QR tại điểm khách dễ thấy; sửa menu trong dashboard khi cần.','Place one QR where guests can see it, then update its menu in the dashboard.'],['Giảm việc in lại mã khi dịch vụ hoặc chương trình thay đổi.','Avoid reprinting the code when services or campaigns change.']],
    qrMenu: [['Quét mã, mở menu trên điện thoại và chạm vào mục doanh nghiệp đã bật.','Scan the code, open the phone menu and choose an option enabled by the business.'],['Một điểm vào rõ ràng cho nhiều việc khách cần làm.','Give guests one clear entry point for many actions.']],
    qrConfig: [['Kéo thả để sắp xếp; đổi nhãn, icon, liên kết và bật hoặc ẩn từng mục.','Drag to reorder; edit labels, icons and links, then show or hide each tile.'],['Doanh nghiệp điều khiển đúng nội dung khách nhìn thấy.','Let the business control exactly what guests see.']],
    qrRoles: [['Chọn Khách, Nhân viên, Chủ doanh nghiệp hoặc AI Voice trước khi cấu hình menu.','Choose Customer, Staff, Owner or AI Voice before configuring the menu.'],['Mỗi vai trò mở đúng công cụ dành cho mình.','Give each role the tools intended for them.']],
    qrArtwork: [['Mở bản in One QR, tải xuống và đặt ở quầy hoặc điểm phục vụ.','Open the One QR artwork, download it and place it at the desk or service area.'],['Khách dễ nhận ra nơi cần quét ngay khi đến.','Help guests see where to scan when they arrive.']],
    qrCheckin: [['Khách chọn Check-in trên menu và hoàn tất bước xác nhận.','Guests select Check-in from the menu and complete the request.'],['Quầy nhận được đúng thao tác khách chọn; chỉ quét mã chưa ghi nhận check-in.','The desk receives the action the guest chose; scanning alone does not check them in.']],
    qrBooking: [['Gắn trang đặt lịch vào ô menu để khách chọn dịch vụ và thời gian.','Link the booking page so guests can choose a service and time.'],['Tạo lối vào lịch hẹn ngay tại điểm quét.','Offer a path to booking directly from the scan point.']],
    qrServices: [['Gắn menu dịch vụ của doanh nghiệp, rồi cập nhật giá ở nguồn quản lý.','Link the business service menu and update prices at the source.'],['Khách tự xem lựa chọn và mức giá trước khi hỏi nhân viên.','Let guests review options and prices before asking staff.']],
    qrOffers: [['Thêm liên kết đến ưu đãi, website hoặc thư viện hình tham khảo khi cần.','Add links to offers, a website or a gallery when needed.'],['Đưa đúng nội dung giới thiệu vào menu khách đang xem.','Put relevant discovery content in the menu guests already use.']],
    qrReviews: [['Bật ô đánh giá để khách mở luồng phản hồi sau dịch vụ.','Enable the review tile to open the post-service feedback flow.'],['Khách có lối đi ngắn từ điểm chạm đến phản hồi.','Give guests a short path from their visit to feedback.']],
    qrTips: [['Bật mục tiền boa và gắn đúng luồng nhận tip cho doanh nghiệp.','Enable the tipping tile and connect the business tipping flow.'],['Khách dễ chọn cách gửi tiền boa sau khi được phục vụ.','Make tipping easier after the service.']],
    qrPayment: [['Bật mục thanh toán và gắn trang thanh toán đang dùng.','Enable the payment tile and link the active payment page.'],['Khách mở đúng bước thanh toán từ menu One QR.','Let guests reach the right payment step from One QR.']],
    qrLoyalty: [['Thêm liên kết Gift Card, thành viên hoặc điểm thưởng vào menu.','Add links to Gift Cards, membership or rewards in the menu.'],['Khách thấy các quyền lợi có thể dùng hoặc mua.','Show guests benefits they can use or buy.']],
    qrLinks: [['Dán một liên kết đích, đặt nhãn dễ hiểu và chỉ bật khi trang đích đã sẵn sàng.','Paste a destination, name it clearly and enable it only when the page works.'],['Menu có thể mở rộng cho website, hình tham khảo hoặc phương thức thanh toán được cấu hình riêng.','Extend the menu to websites, galleries or separately configured payment options.']],
    qrReferral: [['Mở khu Referral Link để lấy và chia sẻ đường dẫn giới thiệu.','Open Referral Link to get and share its dedicated link.'],['Tách chia sẻ giới thiệu khỏi menu dành cho khách tại quầy.','Keep referral sharing separate from the guest menu at the desk.']],
    qrStaff: [['Mở khu Staff Invite QR để tạo hoặc chia sẻ mã dành cho nhân viên.','Open Staff Invite QR to create or share the staff code.'],['Nhân viên vào đúng luồng mời, không lẫn với menu của khách.','Send staff to their invitation flow, separate from the guest menu.']]
  };
  const oneQrPhoneOptions = [
    ['Xác nhận đến tiệm','Smart check-in','nav-home',5],['Đặt lịch hẹn','Book appointment','nav-news',6],
    ['Dịch vụ & giá','Services & prices','nav-pos',7],['Ưu đãi','Offers','nav-gift',8],
    ['Hình minh họa','Gallery','nav-chart',8],['Đánh giá','Leave a review','nav-review',9],
    ['Gửi tiền boa','Leave a tip','nav-pay',10],['Thanh toán','Pay now','nav-pay',11],
    ['Thẻ & thành viên','Cards & membership','nav-gift',12],['Liên kết khác','More links','nav-qr',13]
  ];
  function oneQrSafeText(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function renderOneQrExplorerVisual(feature) {
    const english = currentLanguage !== 'vi';
    const selected = explorerFeature;
    const menu = oneQrPhoneOptions.map(([vi,en,icon,index]) => `<button type="button" data-oneqr-jump="${index}" aria-pressed="${selected === index}"><svg aria-hidden="true"><use href="#${icon}"></use></svg><span>${oneQrSafeText(english ? en : vi)}</span><i aria-hidden="true">›</i></button>`).join('');
    const actionSets = {
      qrConfig: [['Kéo thả thứ tự','Drag to reorder'],['Bật hoặc ẩn mục','Show or hide tiles'],['Đổi tên, biểu tượng, liên kết','Edit label, icon and link']],
      qrRoles: [['Khách · Nhân viên','Customer · Staff'],['Chủ doanh nghiệp · AI Voice','Owner · AI Voice'],['Menu riêng theo vai trò','A menu for each role']],
      qrArtwork: [['Xem bảng One QR','Preview One QR artwork'],['Tải và in bảng','Download and print'],['Đặt tại điểm phục vụ','Place at the service point']]
    };
    const actions = (actionSets[feature[2]] || [['Một mã One QR','One QR code'],['Menu do doanh nghiệp cấu hình','Business-configured menu'],['Khách chọn thao tác','Guest chooses an action']]).map(([vi,en],index) => `<span><b>${index+1}</b>${oneQrSafeText(english ? en : vi)}</span>`).join('');
    return `<div class="oneqr-explorer-stage"><div class="oneqr-explorer-ops"><span class="oneqr-explorer-kicker">ONE QR · ${english ? 'HOW IT WORKS' : 'CÁCH VẬN HÀNH'}</span><h4>${oneQrSafeText(english ? feature[1] : feature[0])}</h4><p>${oneQrSafeText(english ? feature[4] : feature[3])}</p><div class="oneqr-explorer-qr"><div class="explorer-large-qr" aria-hidden="true">${explorerQr}</div><div><strong>One QR</strong><small>${english ? 'ILLUSTRATIVE CODE' : 'MÃ MINH HỌA'}</small></div></div><div class="oneqr-explorer-actions">${actions}</div></div><div class="oneqr-explorer-phone"><small>ONE QR · ${english ? 'SAMPLE MENU' : 'MENU minh họa'}</small><strong>${oneQrSafeText(activeSalonName)}</strong><p>${english ? 'Choose what you need today' : 'Chọn điều bạn cần hôm nay'}</p><div class="oneqr-explorer-phone-menu">${menu}</div><footer>Powered by Nexora Touch</footer></div></div>`;
  }
  const explorerGuideSteps = {
    checkin:['Chọn khách đã hẹn hoặc khách đến trực tiếp, rồi bắt đầu lượt phục vụ.','Choose an appointment or walk-in customer, then start the service visit.'],
    queue:['Xem thứ tự chờ và trạng thái phục vụ trước khi gọi thợ tiếp theo.','Review the waiting order and service status before calling the next technician.'],
    calendar:['Xem lịch theo ngày và chọn một lịch hẹn để đọc chi tiết.','Review the day and select an appointment to see its details.'],
    chart:['Chọn khoảng thời gian và xem sự thay đổi trên biểu đồ.','Choose a time range and review the trend on the chart.'],
    analyticsOverview:['Chọn 7 hoặc 30 ngày để đọc tổng tiền boa minh họa, lượt mở menu và lượt chọn mục.','Select 7 or 30 days to review sample tips, menu opens, and selected actions.'],
    analyticsTrend:['Đổi kỳ xem rồi đọc các điểm dữ liệu trên đường xu hướng tiền boa.','Change the period and read the points along the tip trend.'],
    analyticsDaily:['So sánh chiều cao cột và số tiền ghi trực tiếp trên từng kỳ.','Compare column heights and the amount labeled for each period.'],
    analyticsQr:['So sánh lượt mở menu với lượt chọn thao tác tại từng điểm QR.','Compare menu opens with selected actions at each QR touchpoint.'],
    analyticsPoints:['Đọc độ dài thanh và giá trị của từng điểm QR.','Read each QR point’s bar length and value.'],
    analyticsRank:['Xem thứ tự điểm QR theo lượt mở menu trong kỳ đang chọn.','Read QR point order by menu opens in the selected period.'],
    taxBusinessOverview:['Xem trước tổng quan rồi mở từng nhóm thu nhập, chi phí và biên lai của doanh nghiệp.','Review the concept summary, then open business income, expenses, and receipts.'],
    taxBusinessIncome:['Xem từng khoản thu minh họa và bản ghi liên quan để đối chiếu.','Review illustrative income entries and their supporting records.'],
    taxBusinessExpense:['Xem nhóm chi phí vận hành và biên lai đi kèm trong bản xem trước.','Review operating expense groups and linked receipts in the concept view.'],
    taxBusinessReceipts:['Mở danh sách chứng từ minh họa để tìm mục cần xem lại.','Open the sample document list to find a record for review.'],
    taxPersonalOverview:['Xem tổng quan cá nhân trước khi đi vào từng nhóm thu, chi và biên lai.','Review the personal overview before exploring income, expenses, and receipts.'],
    taxPersonalIncome:['Kiểm tra các nguồn thu cá nhân được gom trong bản xem trước.','Review personal income sources gathered in the concept view.'],
    taxPersonalExpense:['Xem từng khoản chi cá nhân và chứng từ liên quan.','Review personal spending entries and related documents.'],
    taxPersonalReceipts:['Tìm lại biên lai cá nhân trong danh sách minh họa.','Find a personal receipt in the illustrative list.'],
    communityFeed:['Mở Bảng tin để xem bài viết, hình ảnh và câu hỏi mới.','Open the feed to see new posts, photos, and questions.'],
    communityGroups:['Chọn nhóm theo mối quan tâm hoặc duyệt bài đăng trong Chợ.','Choose an interest group or browse marketplace posts.'],
    communityContent:['Xem Fanpage và Blog để hiểu nội dung doanh nghiệp chia sẻ.','Explore fanpage and blog content shared by businesses.'],
    communityJobs:['Duyệt tin tuyển hoặc mở bài đăng để trao đổi về công việc.','Browse openings or open a post to discuss a job.'],
    communityShifts:['Xem ngày, giờ và địa điểm trước khi liên hệ về một ca làm thêm.','Check the time and place before contacting someone about an extra shift.'],
    communityDeals:['Đọc nội dung ưu đãi và điều kiện trên bài đăng.','Read the offer and its terms on the post.'],
    communityMessages:['Chọn cuộc trò chuyện riêng hoặc nhóm chat để tiếp tục trao đổi.','Select a direct conversation or group chat to continue talking.'],
    communityCalls:['Chọn gọi thoại hoặc video khi cần trao đổi trực tiếp.','Choose a voice or video call for a direct conversation.'],
    marketingAudience:['Xem ba nhóm khách minh họa và chọn nhóm phù hợp với mục tiêu chiến dịch.','Review three sample audience groups and choose one for the campaign goal.'],
    marketingOverview:['Xem bốn bước của hành trình và chọn công cụ muốn khám phá tiếp.','Review the four journey stages and choose a tool to explore next.'],
    marketingContent:['Xem trước tiêu đề, hình ảnh và lời mời trước khi đưa vào kênh gửi.','Review a sample headline, image and call to action before choosing a channel.'],
    marketingSms:['Kiểm tra người nhận, nội dung và lịch gửi của chiến dịch SMS.','Review recipients, message and timing for an SMS campaign.'],
    marketingCampaign:['Đi qua mục tiêu, kênh triển khai và bước theo dõi chiến dịch.','Review the goal, delivery channel and campaign follow-up.'],
    marketingPos:['Xem cách ưu đãi có thể xuất hiện trong hành trình phục vụ tại quầy.','See how an offer can appear during the front-desk service journey.'],
    marketingWheel:['Xem quà tặng, quy tắc và hành động sau kết quả vòng quay tương tác.','Review rewards, rules and the next step after the sample wheel result.'],
    marketingAds:['So sánh nhóm người xem, hình ảnh và chỉ số cần theo dõi.','Compare the audience, creative and metric to watch.'],
    marketingReviews:['Đọc tín hiệu từ đánh giá trước khi điều chỉnh nội dung tiếp thị.','Read review signals before changing marketing content.'],
    marketingCustomers:['Xem lịch sử ghé và nhu cầu để chọn thông điệp phù hợp.','Review visits and needs to choose a relevant message.'],
    marketingAnalytics:['Đọc biểu đồ xu hướng theo tuần và xác định bước cần cải thiện.','Read the weekly trend chart and identify a next improvement.'],
    money:['Xem danh sách giao dịch, số tiền và trạng thái liên quan.','Review transactions, amounts, and their related statuses.'],
    qr:['Mở mã QR để xem luồng mà khách hoặc nhân viên sẽ truy cập.','Open the QR code to preview the customer or staff flow.'],
    message:['Xem nội dung minh họa, chọn đối tượng và kiểm tra bước tiếp theo.','Review sample content, choose an audience, and check the next step.'],
    review:['Đọc đánh giá và chọn phản hồi cần theo dõi.','Read reviews and select feedback to follow up.'],
    gift:['Chọn loại thẻ, xem thiết kế và kiểm tra thông tin trước khi phát hành.','Choose a card type, review the design, and check details before issue.'],
    receipt:['Mở bản ghi biên lai và xem các thông tin liên quan.','Open a receipt record and review its details.'],
    list:['Mở một mục trong danh sách để xem thông tin và trạng thái.','Open an item in the list to review its details and status.']
  };
  const explorerGuideBenefits = {
    pos:['Kết nối tín hiệu từ quầy, lịch, thợ, khách và doanh thu để gợi ý việc cần ưu tiên; nhân viên xác nhận trước khi thực hiện.','Connect signals from desk, bookings, staff, guests and revenue to suggest priorities, with staff confirmation before action.'],
    aihub:['Giúp doanh nghiệp giữ ngữ cảnh từ cuộc gọi, lịch hẹn và hồ sơ khách đến bước nhân viên cần tiếp nối.','Helps businesses carry context from calls, bookings and customer profiles into the next staff action.'],
    aimarketing:['Kết nối nhóm khách, nội dung, kênh triển khai và tín hiệu phản hồi để điều chỉnh chiến dịch.','Connect audience, content, delivery channels and response signals to refine campaigns.'],
    gift:['Kết nối phát hành, gửi thẻ, sử dụng tại quầy và theo dõi giao dịch để chăm sóc khách quay lại.','Connect card issue, delivery, in-store redemption and transaction review to support return visits.'],
    community:['Doanh nghiệp mở rộng kết nối; người làm nghề tìm cơ hội; khách hàng khám phá nội dung, ưu đãi và liên hệ trực tiếp.','Businesses build connections; professionals find opportunities; customers discover content and offers and reach out directly.'],
    oneqr:['Giúp khách truy cập trải nghiệm tại tiệm từ một điểm quét.','Helps customers reach in-salon experiences from one scan.'],
    taxiq:['Giúp doanh nghiệp và cá nhân hình dung cách sắp xếp thu nhập, chi phí và biên lai để dễ rà soát hồ sơ.','Shows businesses and individuals a way to organize income, expenses, and receipts for easier review.'],
    payments:['Giúp chủ tiệm theo dõi các khoản thu, tip và chi trả rõ ràng hơn.','Helps owners follow payments, tips, and payouts more clearly.'],
    reviews:['Giúp tiệm nhận ra phản hồi cần xử lý sau mỗi lượt khách.','Helps the salon spot feedback to address after a visit.'],
    analytics:['Giúp doanh nghiệp so sánh xu hướng tiền boa và mức tương tác tại các điểm QR.','Helps businesses compare tipping trends and engagement across QR touchpoints.']
  };
  const explorerGiftSteps = {
    giftManage:['Chọn bộ lọc loại thẻ, nguồn phát hành hoặc trạng thái để tìm thẻ cần xem.','Filter by card type, issue source, or status to find a card.'],
    giftIssue:['Chọn loại thẻ, thiết kế, khách nhận và mệnh giá trước khi xác nhận.','Choose card type, design, recipient, and amount before confirming.'],
    giftMember:['Chọn hạng thành viên, thiết lập quyền lợi và thời hạn.','Choose a membership tier, then set benefits and expiration.'],
    giftOnline:['Chuẩn bị nội dung thẻ và xem luồng bán trực tuyến qua VLinkPay.','Prepare the card content and review the VLinkPay online sales flow.'],
    giftAdvanced:['Xem các bước xác minh doanh nghiệp và thiết lập E-Gift nâng cao.','Review business verification and advanced E-Gift setup steps.'],
    giftRedeem:['Nhập số tiền hoặc xem luồng quét mã thẻ để nhận thanh toán.','Enter an amount or review the card scanning flow for payment.'],
    giftReport:['Chọn báo cáo thành viên hoặc giao dịch thẻ để xem hoạt động.','Choose a membership or card transaction report to review activity.'],
    giftExpiry:['Xem thẻ sắp đến hạn và thông tin khách cần chăm sóc.','Review cards near expiration and customer follow-up details.']
  };
  const explorerSpeak = document.getElementById('explorer-speak');
  const explorerSpeechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  explorerSpeak.hidden = !explorerSpeechAvailable;
  let explorerSpeaking = false;
  let explorerUtterance = null;
  function stopExplorerSpeech() {
    explorerUtterance = null;
    if (explorerSpeechAvailable) window.speechSynthesis.cancel();
    explorerSpeaking = false;
    setLocalizedText(explorerSpeak, '▶ Nghe giới thiệu', '▶ Listen to intro');
    explorerSpeak.setAttribute('aria-label',localizedPair('Nghe giới thiệu tính năng', 'Listen to feature introduction'));
  }
  explorerSpeak.addEventListener('click', () => {
    if (explorerSpeaking) { stopExplorerSpeech(); return; }
    const ids=['explorer-feature-name','explorer-ai-summary','explorer-ai-how','explorer-ai-value','explorer-ai-state'];
    const spokenText=ids.map(id=>document.getElementById(id).textContent.trim()).filter(Boolean).join('. ');
    const utterance=new SpeechSynthesisUtterance(spokenText);
    utterance.lang=speechLanguages[currentLanguage];
    utterance.rate=.94;
    utterance.onend=utterance.onerror=()=>{ if (explorerUtterance === utterance) stopExplorerSpeech(); };
    window.speechSynthesis.cancel();
    explorerUtterance=utterance;
    window.speechSynthesis.speak(utterance);
    explorerSpeaking=true;
    setLocalizedText(explorerSpeak, '■ Dừng nghe', '■ Stop audio');
    explorerSpeak.setAttribute('aria-label',localizedPair('Dừng nghe giới thiệu', 'Stop feature introduction'));
  });
  document.addEventListener('visibilitychange',()=>{ if (document.hidden && explorerSpeaking) stopExplorerSpeech(); });
  function renderExplorerFallback(feature, english) {
    return `<div class="explorer-preview-fallback"><small>${english?'FEATURE PREVIEW':'XEM THỬ TÍNH NĂNG'}</small><strong>${oneQrSafeText(english?feature[1]:feature[0])}</strong><p>${oneQrSafeText(english?feature[4]:feature[3])}</p><span>${english?'Select another feature to continue exploring →':'Chọn một mục khác để tiếp tục khám phá →'}</span></div>`;
  }
  function renderSalonExplorer(resetFeatureScroll = false) {
    if (!explorerProducts) return;
    stopExplorerSpeech();
    const english = currentLanguage !== 'vi';
    setLocalizedText(document.getElementById('explorer-count'), `${explorerTotalCount} ${localizedPair('màn hình tính năng','feature screens')}`, `${explorerTotalCount} ${localizedPair('màn hình tính năng','feature screens')}`);
    explorerProducts.replaceChildren(...explorerProductKeys.map(key => {
      const button = document.createElement('button'); button.type='button'; button.textContent=salonExplorer[key].name;
      button.setAttribute('aria-pressed',String(explorerProduct===key));
      button.addEventListener('click',()=>{ explorerProduct=key; explorerFeature=0; renderSalonExplorer(true); });
      return button;
    }));
    const product = salonExplorer[explorerProduct];
    const featureScrollTop = resetFeatureScroll ? 0 : explorerFeatures.scrollTop;
    const featureScrollLeft = resetFeatureScroll ? 0 : explorerFeatures.scrollLeft;
    setLocalizedText(document.getElementById('explorer-product-count'), `${product.features.length} ${localizedPair('mục','tools')}`, `${product.features.length} ${localizedPair('mục','tools')}`);
    explorerFeatures.replaceChildren(...product.features.flatMap((feature,index) => {
      const nodes=[];
      if (explorerProduct === 'pos' && [0,1,9,12,16].includes(index)) {
        const group=document.createElement('div'); group.className='explorer-feature-group';
        const groupNames={0:['Toàn cảnh thông minh','Intelligence overview'],1:['Quầy & dịch vụ','Front desk & services'],9:['Lịch & đội ngũ','Schedule & team'],12:['Khách & tăng trưởng','Guests & growth'],16:['Doanh thu & thanh toán','Revenue & payments']};
        setLocalizedText(group,...groupNames[index]);
        nodes.push(group);
      }
      if (explorerProduct === 'oneqr' && [0,5,14].includes(index)) {
        const group=document.createElement('div'); group.className='explorer-feature-group';
        const groupNames={0:['Thiết lập One QR','Set up One QR'],5:['Khách sau khi quét','Guest after scanning'],14:['Chia sẻ & mời','Share & invite']};
        setLocalizedText(group,...groupNames[index]);
        nodes.push(group);
      }
      if (explorerProduct === 'taxiq' && [0,4].includes(index)) {
        const group=document.createElement('div'); group.className='explorer-feature-group';
        setLocalizedText(group,...(index===0?['Cho doanh nghiệp · dự kiến','For businesses · preview']:['Cho cá nhân · dự kiến','For individuals · preview']));
        nodes.push(group);
      }
      if (explorerProduct === 'community' && [0,3,6].includes(index)) {
        const group=document.createElement('div'); group.className='explorer-feature-group';
        const groupNames={0:['Cộng đồng & nội dung','Community & content'],3:['Cơ hội & ưu đãi','Opportunities & offers'],6:['Kết nối trực tiếp','Direct connections']};
        setLocalizedText(group,...groupNames[index]);
        nodes.push(group);
      }
      if (explorerProduct === 'aimarketing' && [0,1,3,8].includes(index)) {
        const group=document.createElement('div'); group.className='explorer-feature-group';
        const groupNames={0:['Toàn cảnh','Overview'],1:['Chuẩn bị · minh họa','Preparation · concept'],3:['Triển khai','Activation'],8:['Hiểu & tối ưu','Learn & improve']};
        setLocalizedText(group,...groupNames[index]);
        nodes.push(group);
      }
      if (explorerProduct === 'aihub' && [0,1,5,8].includes(index)) {
        const group=document.createElement('div'); group.className='explorer-feature-group';
        const groupNames={0:['Toàn cảnh','Overview'],1:['AI Receptionist','AI Receptionist'],5:['Thiết lập trợ lý','Assistant setup'],8:['Marketing Assistant','Marketing Assistant']};
        setLocalizedText(group,...groupNames[index]);
        nodes.push(group);
      }
      const button=document.createElement('button'); button.type='button';
      const number=document.createElement('span'); number.className='explorer-feature-index'; number.textContent=String(index+1);
      const label=document.createElement('span'); setLocalizedText(label, feature[0], feature[1]);
      button.append(number,label);
      button.setAttribute('aria-pressed',String(explorerFeature===index));
      button.addEventListener('click',()=>{ explorerFeature=index; renderSalonExplorer(); });
      nodes.push(button);
      return nodes;
    }));
    explorerFeatures.scrollTop = featureScrollTop;
    explorerFeatures.scrollLeft = featureScrollLeft;
    const feature=product.features[explorerFeature];
    document.getElementById('explorer-product-name').textContent=product.name;
    setLocalizedText(document.getElementById('explorer-feature-name'), feature[0], feature[1]);
    document.getElementById('explorer-module-link').href=explorerProduct==='aimarketing'?'#module-aihub-marketing':`#module-${explorerProduct}`;
    setLocalizedText(document.getElementById('explorer-module-link'), 'Xem nhóm chức năng →', 'View tools →');
    const badge=document.getElementById('explorer-badge');
    const pending=product.state==='planned'||product.state==='preview'||product.state==='restricted'||feature[5]==='partial'||feature[5]==='concept';
    badge.classList.toggle('pending',pending);
    badge.hidden = !pending;
    if (pending) {
      const badgeText=product.state==='planned'?['DỰ KIẾN','PLANNED']:product.state==='preview'?['BẢN XEM TRƯỚC','PREVIEW']:product.state==='restricted'?['CHỜ XÁC NHẬN','ACCESS PENDING']:feature[5]==='concept'?['Ý TƯỞNG minh họa','CONCEPT PREVIEW']:['CHỜ XÁC MINH','VERIFY DESTINATION'];
      setLocalizedText(badge, badgeText[0], badgeText[1]);
    }
    explorerScreen.setAttribute('aria-label',`${localizedPair('Màn hình tính năng','Feature screen')}: ${localizedPair(feature[0],feature[1])}`);
    explorerScreen.dataset.localizedAria = '';
    const visualKey = english && ['checkin','list'].includes(feature[2]) ? feature[2] + 'En' : feature[2];
    const oneQrVisual = explorerProduct === 'oneqr';
    explorerScreen.classList.toggle('is-oneqr',oneQrVisual);
    const previewHtml=oneQrVisual ? renderOneQrExplorerVisual(feature) : explorerProduct === 'pos' ? renderPosExplorerVisual(feature,english) : explorerProduct === 'reviews' ? renderReviewsExplorerVisual(english, explorerFeature === 1) : explorerProduct === 'analytics' ? renderAnalyticsExplorerVisual(feature,english) : explorerProduct === 'taxiq' ? renderTaxExplorerVisual(feature,english,explorerFeature) : explorerProduct === 'community' ? renderCommunityExplorerVisual(feature,english) : explorerProduct === 'gift' ? renderGiftExplorerVisual(feature,english) : explorerProduct === 'aimarketing' ? renderMarketingExplorerVisual(feature,english) : explorerProduct === 'aihub' ? renderAiHubExplorerVisual(feature,english) : explorerVisuals[visualKey];
    explorerScreen.innerHTML=`<div class="explorer-screen-head"><span></span><span>${product.name}</span></div><div class="explorer-screen-body">${previewHtml || renderExplorerFallback(feature,english)}</div>`;
    if (explorerProduct === 'pos') explorerScreen.querySelectorAll('[data-pos-jump]').forEach(button => button.addEventListener('click',()=>{ explorerFeature=Number(button.dataset.posJump); renderSalonExplorer(); }));
    if (oneQrVisual) explorerScreen.querySelectorAll('[data-oneqr-jump]').forEach(button => button.addEventListener('click',()=>{ explorerFeature=Number(button.dataset.oneqrJump); renderSalonExplorer(); }));
    if (explorerProduct === 'analytics') explorerScreen.querySelectorAll('[data-analytics-period]').forEach(button => button.addEventListener('click',()=>{ analyticsPreviewPeriod=button.dataset.analyticsPeriod; renderSalonExplorer(); }));
    if (explorerProduct === 'taxiq') explorerScreen.querySelectorAll('[data-tax-target]').forEach(button => button.addEventListener('click',()=>{ explorerFeature=Number(button.dataset.taxTarget); renderSalonExplorer(); }));
    if (explorerProduct === 'community') explorerScreen.querySelectorAll('[data-community-audience]').forEach(button => button.addEventListener('click',()=>{ explorerCommunityAudience=Number(button.dataset.communityAudience); renderSalonExplorer(); }));
    if (explorerProduct === 'gift') {
      explorerScreen.querySelectorAll('[data-gift-sample]').forEach(button => button.addEventListener('click',()=>{ explorerGiftSample=Number(button.dataset.giftSample); renderSalonExplorer(); }));
      explorerScreen.querySelectorAll('[data-gift-jump]').forEach(button => button.addEventListener('click',()=>{ explorerFeature=Number(button.dataset.giftJump); renderSalonExplorer(); }));
    }
    if (explorerProduct === 'aimarketing') explorerScreen.querySelectorAll('[data-marketing-jump]').forEach(button => button.addEventListener('click',()=>{ explorerFeature=Number(button.dataset.marketingJump); renderSalonExplorer(); }));
    if (explorerProduct === 'aihub') explorerScreen.querySelectorAll('[data-aihub-idea]').forEach(button => button.addEventListener('click',()=>{ explorerAiHubIdea=Number(button.dataset.aihubIdea); renderSalonExplorer(); }));
    setLocalizedText(explorerScreen.querySelector('.explorer-screen-head span'), feature[0], feature[1]);
    const guideStep=oneQrVisual ? oneQrExplorerGuides[feature[2]][0] : explorerProduct==='pos'?['Chọn một nhóm vận hành hoặc tính năng để xem tín hiệu minh họa, gợi ý và bước nhân viên duyệt.','Choose an operating area or tool to see an illustrative signal, recommendation and staff review step.']:explorerProduct==='aihub'?['Xem ảnh tình huống, rồi chọn một gợi ý AI để đọc cách tối ưu và giá trị cho doanh nghiệp.','View the scenario image, then select an AI idea to read its workflow and business value.']:explorerGiftSteps[feature[2]]||explorerGuideSteps[feature[2]]||explorerGuideSteps.list;
    const guideBenefit=oneQrVisual ? oneQrExplorerGuides[feature[2]][1] : explorerGuideBenefits[explorerProduct];
    setLocalizedText(document.getElementById('explorer-rail-kicker'), 'GÓC NHÌN SẢN PHẨM', 'PRODUCT AT A GLANCE');
    document.getElementById('explorer-rail-product').textContent=product.name;
    setLocalizedText(document.getElementById('explorer-rail-benefit'), guideBenefit[0], guideBenefit[1]);
    setLocalizedText(document.getElementById('explorer-rail-current-label'), 'MÀN HÌNH ĐANG XEM', 'CURRENT SCREEN');
    setLocalizedText(document.getElementById('explorer-rail-current'), feature[3], feature[4]);
    const nextFeature=product.features[(explorerFeature+1)%product.features.length];
    setLocalizedText(document.getElementById('explorer-rail-next-label'), `Tiếp: ${nextFeature[0]}`, `Next: ${nextFeature[1]}`);
    document.getElementById('explorer-rail-next').onclick=()=>{ explorerFeature=(explorerFeature+1)%product.features.length; renderSalonExplorer(); };
    const guideState=product.state==='planned'?['Tính năng dự kiến. Màn hình này là bản giới thiệu ý tưởng.','Planned feature. This screen is a concept preview.']:
      product.state==='preview'?['Bản xem trước tương tác tại máy; tin nhắn và cuộc gọi chưa kết nối dịch vụ thật.','Local interactive preview; messages and calls are not connected to a live service.']:
      product.state==='restricted'?['Đang chờ xác nhận quyền truy cập. Màn hình này là bản giới thiệu ý tưởng.','Access pending verification. This screen is a concept preview.']:
      feature[5]==='concept'?['Công cụ đề xuất; hình ảnh và số liệu trên màn hình là minh họa.','Proposed tool; screen images and numbers are illustrative.']:
      feature[5]==='partial'?['Đích đến đang chờ xác minh; màn hình dùng để giới thiệu tính năng.','Destination pending verification; this screen introduces the feature.']:
      ['Lời giới thiệu minh họa; nội dung trên màn hình là minh họa.','Sample introduction; screen content is illustrative.'];
    setLocalizedText(document.getElementById('explorer-ai-title'), explorerProduct==='pos'?'SI POS · Góc nhìn thông minh':'AI Auto · Giới thiệu tính năng', explorerProduct==='pos'?'SI POS · Intelligence guide':'AI Auto · Feature guide');
    setLocalizedText(document.getElementById('explorer-ai-subtitle'), 'Tự động cập nhật khi chọn từng mục', 'Updates when you select a feature');
    setLocalizedText(document.getElementById('explorer-ai-how-label'), 'Cách khám phá', 'How it works');
    setLocalizedText(document.getElementById('explorer-ai-value-label'), explorerProduct === 'taxiq' ? 'Giá trị cho doanh nghiệp & cá nhân' : explorerProduct === 'community' ? 'Giá trị cho 3 nhóm' : 'Giá trị cho tiệm', explorerProduct === 'taxiq' ? 'For businesses & individuals' : explorerProduct === 'community' ? 'Value for three groups' : 'For your salon');
    const localizedSummary = localeTranslations[currentLanguage]?.[feature[4]] || supplementalTranslations[feature[4]]?.[currentLanguage];
    const featureName = localizedPair(feature[0], feature[1]);
    const summaryFallback = {
      zh: `查看“${featureName}”的示例界面。`,
      ko: `${featureName}의 예시 화면을 살펴보세요.`,
      es: `Explora una pantalla de ejemplo de ${featureName}.`,
      ja: `${featureName}の画面例をご覧ください。`,
      th: `ดูตัวอย่างหน้าจอของ ${featureName}`,
      ar: `استكشف شاشة توضيحية لـ ${featureName}.`,
      fr: `Découvrez un écran d’exemple pour ${featureName}.`
    };
    setLocalizedText(document.getElementById('explorer-ai-summary'), feature[3], currentLanguage === 'vi' ? feature[3] : currentLanguage === 'en' ? feature[4] : localizedSummary || summaryFallback[currentLanguage]);
    setLocalizedText(document.getElementById('explorer-ai-how'), guideStep[0], guideStep[1]);
    setLocalizedText(document.getElementById('explorer-ai-value'), guideBenefit[0], guideBenefit[1]);
    setLocalizedText(document.getElementById('explorer-ai-state'), guideState[0], guideState[1]);
    applyLanguage();
    const guide=document.getElementById('explorer-ai-guide');
    guide.classList.remove('is-updating');
    void guide.offsetWidth;
    guide.classList.add('is-updating');
  }
  languageToggle.addEventListener('change',renderSalonExplorer);

  const salonShowcaseGrid = document.querySelector('#salon-products .salon-product-grid');
  const salonShowcaseOrder = ['pos','aihub','aihub-marketing','aihub-marketing-campaign','spin-wheel','gift','community','oneqr','taxiq','payments','reviews','analytics'];
  salonShowcaseGrid.append(...salonShowcaseOrder.map(key => salonShowcaseGrid.querySelector(`[data-showcase-key="${key}"], [href="#module-${key}"]`)).filter(Boolean));
  salonShowcaseGrid.querySelector('[data-open-wheel-demo]').addEventListener('click', openWheelDemo);
  document.querySelector('#salon-products .salon-section-head > small').textContent = salonShowcaseGrid.children.length + ' khu giới thiệu';
  salonShowcaseGrid.querySelectorAll('.salon-feature-list').forEach(list => { list.dataset.count = String(list.children.length); });
  applyLanguage();
  const salonCarousel = document.getElementById('salon-product-carousel');
  const salonSlides = [...salonShowcaseGrid.querySelectorAll('.salon-product')];
  function selectMarketingCampaignPreview() {
    explorerProduct = 'aimarketing';
    explorerFeature = salonExplorer.aimarketing.features.findIndex(feature => feature[2] === 'marketingSms');
    if (explorerFeature < 0) explorerFeature = 0;
    renderSalonExplorer(true);
  }
  document.getElementById('salon-ai-marketing').addEventListener('click', selectMarketingCampaignPreview);
  const salonSlideVisual = document.getElementById('salon-hero-visual');
  const salonSlidePhoto = document.getElementById('salon-hero-photo');
  const salonSlidePhotoBackdrop = document.getElementById('salon-hero-photo-backdrop');
  const salonSlideUi = document.getElementById('salon-hero-ui');
  const salonPhotoSources = { operations: '../assets/nexora-welcome/pos.jpg', reception: '../assets/nexora-welcome/aihub.jpg', marketing: '../assets/nexora-welcome/ai-marketing-audience-v2.png', campaign: '../assets/nexora-welcome/salon-sms-campaign-workflow-v5.png', spin: '../assets/nexora-welcome/spin-wheel.jpg', gift: '../assets/nexora-welcome/gift.jpg', community: '../assets/nexora-welcome/community.jpg', oneqr: '../assets/nexora-welcome/oneqr.jpg', tax: '../assets/nexora-welcome/salon-tax-v2.png', finance: '../assets/nexora-welcome/payments.jpg', reviews: '../assets/nexora-welcome/reviews.jpg', analytics: '../assets/nexora-welcome/analytics.jpg' };
  const salonProductPhotos = { pos: 'operations', aihub: 'reception', 'aihub-marketing': 'marketing', 'aihub-marketing-campaign': 'campaign', 'spin-wheel': 'spin', gift: 'gift', community: 'community', oneqr: 'oneqr', taxiq: 'tax', payments: 'finance', reviews: 'reviews', analytics: 'analytics' };
  const preloadedSalonPhotos = new Map();
  function preloadSalonPhoto(key) {
    if (preloadedSalonPhotos.has(key)) return;
    const preload = new Image();
    preload.src = salonPhotoSources[key];
    preloadedSalonPhotos.set(key, preload);
  }
  const salonSlideDots = document.getElementById('salon-slide-dots');
  const salonSlidePlay = document.getElementById('salon-slide-play');
  let salonSlideIndex = 0;
  let salonSlideTimer = null;
  let salonSlidePlaying = !reduceMotion.matches;
  const salonTourMessages = {
    pos:['SI POS kết nối quầy, lịch, thợ, khách và doanh thu để nhận biết tín hiệu, giải thích gợi ý và hỗ trợ nhân viên quyết định.','SI POS connects desk, bookings, staff, guests and revenue to identify signals, explain suggestions and support staff decisions.'],
    aihub:['Xem AI hỗ trợ tiếp nhận khách, điều phối lịch và bàn giao việc cho nhân viên như thế nào.','See how AI can support reception, booking coordination and staff handoff.'],
    'aihub-marketing':['Xem hành trình chọn nhóm khách, chuẩn bị nội dung, triển khai và đọc xu hướng phản hồi.','Explore audience selection, content, activation and response trends in one journey.'],
    'aihub-marketing-campaign':['Từ nhóm khách đến nội dung và lịch gửi: xem cách chuẩn bị một chiến dịch cho tiệm.','From audience to content and send schedule: see how to prepare a salon campaign.'],
    'spin-wheel':['Thử vòng quay để hình dung cách một chương trình tương tác giới thiệu quà tặng cho khách.','Try the sample wheel to see how an interactive campaign can present gifts to guests.'],
    gift:['Xem khách chọn thẻ quà tặng, mua, gửi cho người thân và người nhận mở thẻ trên điện thoại.','See a guest choose a gift card, buy it, send it to a loved one and the recipient open it on a phone.'],
    community:['Xem cách mọi người đọc Bảng tin, viết bài mới và gọi thoại hoặc video trong Community.','See people read the feed, create a post and make a voice or video call in Community.'],
    oneqr:['Khách quét bảng One QR tại quầy, thấy menu trên điện thoại rồi chọn dịch vụ, đặt lịch hoặc tác vụ khác.','Guests scan the One QR sign at the counter, open the phone menu and choose services, booking or another action.'],
    taxiq:['Xem trước cách trình bày thu nhập, chi phí và biên lai trên dữ liệu minh họa.','Preview income, expenses and receipts using illustrative data.'],
    payments:['Giới thiệu màn hình theo dõi khoản thu, danh sách tip và chi trả thợ.','Tour the screens for received payments, tips, and staff payouts.'],
    reviews:['Xem cách tiệm đọc đánh giá và theo dõi phản hồi sau mỗi lượt khách.','See how a salon reads reviews and follows up after each visit.'],
    analytics:['Dùng xu hướng tip và hiệu suất QR để nhìn rõ hoạt động của tiệm.','Use tip trends and QR performance to understand salon activity.']
  };
  const salonHeroPreviewDetails = {
    pos: { icon:'nav-pos', icons:['nav-pos','nav-queue','nav-calendar','nav-chart'], descriptions:[['Ghi nhận khách hẹn và khách đến trực tiếp.','Record booked and walk-in guests.'],['Theo dõi thứ tự và trạng thái phục vụ.','Track service order and status.'],['Kiểm tra lịch hẹn trong ngày.','Review the day’s appointments.'],['Nhìn tổng quan hoạt động và khoản thu.','See activity and received payments.']], flow:['Đón khách → Xếp lượt → Phục vụ → Thu tiền','Check in → Queue → Serve → Checkout'] },
    oneqr: { icon:'nav-qr', icons:['nav-qr','nav-pos','nav-review','nav-pay'], descriptions:[['Quét bảng One QR tại tiệm bằng điện thoại.','Scan the in-salon One QR sign with a phone.'],['Menu dịch vụ xuất hiện trên điện thoại của khách.','The service menu opens on the guest’s phone.'],['Khách chạm để chọn dịch vụ, đặt lịch hoặc đánh giá.','The guest taps to choose a service, booking or review.'],['Tiếp tục đến tác vụ hoặc phương thức thanh toán khả dụng.','Continue to the available action or payment option.']], flow:['Quét One QR → Menu trên điện thoại → Chọn dịch vụ','Scan One QR → Phone menu → Choose a service'] },
    payments: { icon:'nav-pay', icons:['nav-pay','nav-tip','nav-community','nav-tax'], descriptions:[['Theo dõi khoản thanh toán đã nhận.','Track received payments.'],['Xem tip theo giao dịch và nhân viên.','Review tips by transaction and staff.'],['Theo dõi khoản chi trả cho nhân viên.','Track staff payouts.'],['Đối chiếu lịch sử hoạt động thanh toán.','Review payment activity history.']], flow:['Khoản thu → Tip → Chi trả → Đối chiếu','Payments → Tips → Payouts → Review'] },
    aihub: { icon:'nav-ai', icons:['nav-ai','nav-chart','nav-calendar','nav-news'], descriptions:[['Hỗ trợ tiếp nhận cuộc gọi và yêu cầu đặt lịch.','Support calls and booking requests.'],['Chuẩn bị nội dung chăm sóc và tiếp thị.','Prepare follow-up and marketing content.'],['Đưa lịch hẹn vào luồng làm việc.','Bring appointments into the workflow.'],['Xem lại các cuộc gọi cần xử lý.','Review calls that need follow-up.']], flow:['Khách liên hệ → AI hỗ trợ → Nhân viên tiếp nối','Guest contacts → AI assists → Staff follows up'] },
    'aihub-marketing': { icon:'nav-ai', icons:['nav-community','nav-news','nav-ai','nav-gift'], descriptions:[['Chọn nhóm khách cho tin nhắn.','Choose the audience for messages.'],['Chuẩn bị nội dung và lịch chiến dịch.','Prepare campaign content and timing.'],['Xem ý tưởng quảng cáo hỗ trợ bởi AI.','Preview AI-assisted advertising ideas.'],['Thử vòng quay tương tác cho khách.','Try an interactive guest campaign preview.']], flow:['Chọn khách → Soạn nội dung → Gửi → Theo dõi','Select guests → Draft → Send → Follow up'] },
    reviews: { icon:'nav-review', icons:['nav-review','nav-community'], descriptions:[['Đọc ý kiến của khách sau dịch vụ.','Read guest feedback after a visit.'],['Theo dõi và chuẩn bị phản hồi.','Track feedback and prepare a response.']], flow:['Hoàn tất dịch vụ → Khách đánh giá → Tiệm phản hồi','Complete visit → Guest reviews → Business responds'] },
    gift: { icon:'nav-gift', icons:['nav-gift','nav-pay','nav-community','nav-gift'], descriptions:[['Xem các mẫu thẻ và chọn mệnh giá để tặng.','Browse card designs and choose a gift amount.'],['Minh họa bước mua thẻ quà tặng.','Preview the gift card purchase step.'],['Minh họa thao tác gửi thẻ cho người thân hoặc khách hàng.','Preview sending a card to a loved one or customer.'],['Người nhận mở thẻ số trên điện thoại.','The recipient opens the digital card on a phone.']], flow:['Chọn thẻ → Mua → Gửi tặng → Nhận thẻ','Choose card → Buy → Send gift → Receive card'] },
    analytics: { icon:'nav-chart', icons:['nav-chart','nav-qr','nav-chart'], descriptions:[['So sánh xu hướng tiền boa theo thời gian.','Compare tip trends over time.'],['Theo dõi điểm chạm và hiệu suất QR.','Track QR touchpoints and performance.'],['Nhìn hoạt động nổi bật trong bảng xếp hạng.','View activity highlights in rankings.']], flow:['Thu thập hoạt động → Xem xu hướng → Điều chỉnh','Collect activity → Read trends → Adjust'] },
    community: { icon:'nav-community', icons:['nav-news','nav-community','nav-community','nav-ai'], descriptions:[['Đọc tin và bài viết của cộng đồng.','Read community news and posts.'],['Soạn bài mới với hình ảnh để chia sẻ.','Draft a new post with a photo.'],['Đăng bài và theo dõi bình luận.','Publish the post and follow comments.'],['Tiếp tục trao đổi bằng cuộc gọi thoại hoặc video.','Continue the conversation with a voice or video call.']], flow:['Đọc tin → Viết bài → Đăng bài → Gọi nhau','Read feed → Write post → Publish → Call'] },
    taxiq: { icon:'nav-tax', icons:['nav-pay','nav-chart','nav-tax'], descriptions:[['minh họa trình bày các khoản thu nhập.','Concept layout for income records.'],['minh họa phân loại chi phí vận hành.','Concept layout for operating expenses.'],['minh họa lưu trữ và xem lại biên lai.','Concept layout for receipt records.']], flow:['Thu nhập → Chi phí → Biên lai · Bản định hướng','Income → Expenses → Receipts · Concept preview'] },
    'aihub-marketing-campaign': { icon:'nav-ai', icons:['nav-community','nav-news','nav-chart'], descriptions:[['Xác định nhóm khách của chiến dịch.','Define the campaign audience.'],['Chuẩn bị thông điệp và hình ảnh.','Prepare the message and visuals.'],['Chọn lịch gửi rồi xem lại chiến dịch.','Schedule and review the campaign.']], flow:['Nhóm khách → Nội dung → Lịch gửi','Audience → Content → Send schedule'] },
    'spin-wheel': { icon:'nav-gift', icons:['nav-gift','nav-chart','nav-settings'], descriptions:[['Đặt ảnh, tên và số lượng từng giải.','Set each prize image, name and quantity.'],['Cấu hình xác suất cho từng ô.','Configure the chance for each segment.'],['Chọn thời gian và điều kiện tham gia.','Set campaign timing and entry rules.']], flow:['Thiết kế giải → Đặt quy tắc → Thử vòng quay','Design prizes → Set rules → Preview wheel'] }
  };
  function createSalonHeroIcon(symbol, className) {
    const frame = document.createElement('span');
    frame.className = className;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + symbol);
    svg.append(use);
    frame.append(svg);
    return frame;
  }
  function buildSalonHeroPreview(card, productKey) {
    const preview = card.querySelector('.salon-product-preview').cloneNode(true);
    preview.removeAttribute('aria-hidden');
    const window = preview.querySelector('.ui-window');
    const details = salonHeroPreviewDetails[productKey];
    if (!window || !details) return preview;
    const panel = document.createElement('div');
    panel.className = 'hero-preview-detail';
    const heading = document.createElement('div');
    heading.className = 'hero-preview-top';
    heading.append(createSalonHeroIcon(details.icon, 'hero-preview-mark'));
    const headingText = document.createElement('span');
    const eyebrow = document.createElement('small');
    setLocalizedText(eyebrow, 'Giao diện tính năng', 'Feature interface');
    const title = document.createElement('strong');
    setLocalizedText(title, 'Những việc có thể thực hiện', 'What you can do');
    headingText.append(eyebrow, title);
    heading.append(headingText);
    const lead = document.createElement('p');
    lead.className = 'hero-preview-lead';
    const summary = card.querySelector('.salon-product-content p').textContent.trim();
    setLocalizedText(lead, summary, summary);
    const featureGrid = document.createElement('div');
    featureGrid.className = 'hero-preview-features';
    const featureTitles = [...card.querySelectorAll('.salon-feature-list li')];
    featureGrid.dataset.count = String(featureTitles.length);
    featureTitles.forEach((feature, index) => {
      const item = document.createElement('div');
      item.className = 'hero-preview-feature';
      item.append(createSalonHeroIcon(details.icons[index] || details.icon, 'hero-preview-feature-icon'));
      const name = document.createElement('strong');
      name.dataset.localizedDynamic = '';
      name.textContent = feature.textContent.trim();
      const description = document.createElement('small');
      setLocalizedText(description, ...(details.descriptions[index] || ['', '']));
      const copy = document.createElement('span');
      copy.className = 'hero-preview-feature-copy';
      copy.append(name, description);
      item.append(copy);
      featureGrid.append(item);
    });
    const flow = document.createElement('div');
    flow.className = 'hero-preview-flow';
    const flowIcon = createSalonHeroIcon('nav-chart', 'hero-preview-flow-icon');
    const flowText = document.createElement('span');
    const flowLabel = document.createElement('b');
    setLocalizedText(flowLabel, 'Luồng minh họa', 'Illustrated flow');
    const flowValue = document.createElement('small');
    setLocalizedText(flowValue, ...details.flow);
    flowText.append(flowLabel, flowValue);
    flow.append(flowIcon, flowText);
    panel.append(heading, lead, featureGrid, flow);
    window.append(panel);
    return preview;
  }
  const salonTourVoice = document.getElementById('salon-ai-tour-voice');
  const salonTourSpeechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  salonTourVoice.hidden = !salonTourSpeechAvailable;
  let salonTourUtterance = null;
  let salonTourLastIndex = -1;
  function stopSalonTourVoice() {
    salonTourUtterance = null;
    if (salonTourSpeechAvailable) window.speechSynthesis.cancel();
    setLocalizedText(salonTourVoice, '▶ Nghe', '▶ Listen');
    salonTourVoice.setAttribute('aria-label',localizedPair('Nghe giới thiệu slide', 'Listen to slide introduction'));
  }
  salonTourVoice.addEventListener('click', () => {
    if (salonTourUtterance) { stopSalonTourVoice(); return; }
    const utterance = new SpeechSynthesisUtterance(document.getElementById('salon-home-title').textContent + '. ' + document.getElementById('salon-ai-tour-copy').textContent);
    utterance.lang = speechLanguages[currentLanguage];
    utterance.rate = .94;
    utterance.onend = utterance.onerror = () => { if (salonTourUtterance === utterance) stopSalonTourVoice(); };
    window.speechSynthesis.cancel();
    salonTourUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    setLocalizedText(salonTourVoice, '■ Dừng', '■ Stop');
    salonTourVoice.setAttribute('aria-label',localizedPair('Dừng nghe giới thiệu', 'Stop slide introduction'));
  });
  const salonSlideKey = card => card.dataset.showcaseKey || card.getAttribute('href')?.slice('#module-'.length) || 'pos';
  const salonDotButtons = salonSlides.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.addEventListener('click', () => changeSalonSlide(index));
    return dot;
  });
  salonSlideDots.replaceChildren(...salonDotButtons);
  function renderSalonSlide(animate = false) {
    if (!salonSlides.length) return;
    if (salonTourLastIndex !== salonSlideIndex) stopSalonTourVoice();
    salonTourLastIndex = salonSlideIndex;
    const card = salonSlides[salonSlideIndex];
    const productName = card.querySelector('.salon-product-top strong').textContent.trim();
    const status = card.querySelector('.salon-product-top small');
    setLocalizedText(document.getElementById('salon-home-title'), productName, productName);
    const productDescription = card.querySelector('.salon-product-content p').textContent.trim();
    setLocalizedText(document.getElementById('salon-slide-description'), productDescription, productDescription);
    const campaignSlide = card.dataset.showcaseKey === 'aihub-marketing-campaign';
    const slideLabel = localizedPair(campaignSlide ? 'TÍNH NĂNG' : 'SẢN PHẨM', campaignSlide ? 'FEATURE' : 'PRODUCT');
    setLocalizedText(document.getElementById('salon-slide-label'), slideLabel, slideLabel);
    const statusNode = document.getElementById('salon-slide-status');
    setLocalizedText(statusNode, status.textContent.trim(), status.textContent.trim());
    statusNode.classList.toggle('pending', card.classList.contains('pending') || status.classList.contains('pending'));
    const features = [...card.querySelectorAll('.salon-feature-list li')].map(feature => {
      const item = document.createElement('li'); setLocalizedText(item, feature.textContent.trim(), feature.textContent.trim()); return item;
    });
    const featureList = document.getElementById('salon-slide-features');
    featureList.dataset.count = String(features.length);
    featureList.replaceChildren(...features);
    const link = document.getElementById('salon-slide-link');
    const wheelSlide = card.matches('[data-open-wheel-demo]');
    link.href = wheelSlide ? '#salon-product-carousel' : card.getAttribute('href');
    setLocalizedText(link, wheelSlide ? 'Thử Spin Wheel →' : campaignSlide ? 'Xem chiến dịch →' : 'Khám phá sản phẩm →', wheelSlide ? 'Try Spin Wheel →' : campaignSlide ? 'Explore campaign preview →' : 'Explore product →');
    salonSlideVisual.style.setProperty('--product-color', card.style.getPropertyValue('--product-color'));
    salonSlideVisual.style.setProperty('--product-tint', card.style.getPropertyValue('--product-tint'));
    salonCarousel.style.setProperty('--slide-glow', card.style.getPropertyValue('--product-color'));
    const productKey = salonSlideKey(card);
    setLocalizedText(document.getElementById('salon-slide-feature-label'), 'TÍNH NĂNG CHÍNH', 'KEY FEATURES');
    setLocalizedText(document.getElementById('salon-slide-journey-label'), 'LUỒNG SỬ DỤNG', 'HOW IT WORKS');
    const journey = salonHeroPreviewDetails[productKey]?.flow;
    const journeyVi = journey?.[0].split(' → ') || [];
    const journeyEn = journey?.[1].split(' → ') || [];
    const journeySteps = document.getElementById('salon-slide-journey-steps');
    journeySteps.style.setProperty('--journey-count', journeyVi.length);
    journeySteps.replaceChildren(...journeyVi.map((step, index) => {
      const item = document.createElement('li');
      const number = document.createElement('b');
      number.textContent = String(index + 1);
      const label = document.createElement('span');
      setLocalizedText(label, step, journeyEn[index] || step);
      item.append(number, label);
      return item;
    }));
    setLocalizedText(document.getElementById('salon-ai-tour-label'), 'AI TOUR · GIỚI THIỆU TỰ ĐỘNG', 'AI TOUR · AUTOMATIC INTRO');
    const tourMessage = salonTourMessages[productKey];
    setLocalizedText(document.getElementById('salon-ai-tour-copy'), tourMessage?.[0] || productDescription, tourMessage?.[1] || productDescription);
    setLocalizedText(document.getElementById('salon-ai-tour-link'), 'Xem thử tính năng →', 'Preview features →');
    const photoKey = salonProductPhotos[productKey] || 'operations';
    const promoImage=document.getElementById('salon-promo-product-image');
    if (!promoImage.getAttribute('src')?.endsWith(salonPhotoSources[photoKey])) promoImage.src=salonPhotoSources[photoKey];
    setLocalizedText(document.getElementById('salon-promo-product-name'), productName, productName);
    setLocalizedText(document.getElementById('salon-promo-product-description'), productDescription, productDescription);
    document.getElementById('salon-promo-product-link').href=wheelSlide?'#salon-product-carousel':card.getAttribute('href');
    setLocalizedText(document.getElementById('salon-promo-product-link'), campaignSlide ? 'Xem chiến dịch →' : 'Khám phá sản phẩm →', campaignSlide ? 'Explore campaign preview →' : 'Explore product →');
    salonSlideVisual.dataset.photo = photoKey;
    if (!salonSlidePhoto.getAttribute('src')?.endsWith(salonPhotoSources[photoKey])) salonSlidePhoto.src = salonPhotoSources[photoKey];
    if (!salonSlidePhotoBackdrop.getAttribute('src')?.endsWith(salonPhotoSources[photoKey])) salonSlidePhotoBackdrop.src = salonPhotoSources[photoKey];
    const nextProductKey = salonSlideKey(salonSlides[(salonSlideIndex + 1) % salonSlides.length]);
    preloadSalonPhoto(salonProductPhotos[nextProductKey] || 'operations');
    salonSlideUi.replaceChildren(buildSalonHeroPreview(card, productKey));
    salonDotButtons.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === salonSlideIndex));
      dot.dataset.localizedDynamic = '';
      dot.setAttribute('aria-label', localizedPair('Chọn sản phẩm trong slide', 'Choose a product slide') + ': ' + salonSlides[index].querySelector('.salon-product-top strong').textContent.trim());
    });
    salonSlidePlay.textContent = salonSlidePlaying ? 'Ⅱ' : '▶';
    salonSlidePlay.dataset.localizedDynamic = '';
    salonSlidePlay.setAttribute('aria-label', salonSlidePlaying ? localizedPair('Tạm dừng trình chiếu','Pause slideshow') : localizedPair('Phát trình chiếu','Play slideshow'));
    if (animate && !reduceMotion.matches) {
      salonCarousel.classList.remove('slide-enter');
      void salonCarousel.offsetWidth;
      salonCarousel.classList.add('slide-enter');
    }
  }
  function scheduleSalonSlides() {
    if (salonSlideTimer) clearInterval(salonSlideTimer);
    salonSlideTimer = null;
    if (!salonSlidePlaying || salonSlides.length < 2) return;
    salonSlideTimer = setInterval(() => {
      const keyboardFocusInCarousel = salonCarousel.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      if (document.hidden || document.getElementById('salon-home-view').hidden || keyboardFocusInCarousel || salonTourUtterance) return;
      salonSlideIndex = (salonSlideIndex + 1) % salonSlides.length;
      renderSalonSlide(true);
    }, 6500);
  }
  function changeSalonSlide(index) {
    salonSlideIndex = (index + salonSlides.length) % salonSlides.length;
    renderSalonSlide(true);
    scheduleSalonSlides();
  }
  document.getElementById('salon-slide-prev').addEventListener('click', () => changeSalonSlide(salonSlideIndex - 1));
  document.getElementById('salon-slide-next').addEventListener('click', () => changeSalonSlide(salonSlideIndex + 1));
  document.getElementById('salon-slide-link').addEventListener('click', event => {
    if (salonSlides[salonSlideIndex].id === 'salon-ai-marketing') selectMarketingCampaignPreview();
    if (!salonSlides[salonSlideIndex].matches('[data-open-wheel-demo]')) return;
    event.preventDefault();
    openWheelDemo();
  });
  document.getElementById('salon-promo-product-link').addEventListener('click', event => {
    if (salonSlides[salonSlideIndex].id === 'salon-ai-marketing') selectMarketingCampaignPreview();
    if (!salonSlides[salonSlideIndex].matches('[data-open-wheel-demo]')) return;
    event.preventDefault();
    openWheelDemo();
  });
  document.getElementById('salon-ai-tour-link').addEventListener('click', () => {
    const key=salonSlideKey(salonSlides[salonSlideIndex]);
    explorerProduct=key==='aihub-marketing'||key==='aihub-marketing-campaign'||key==='spin-wheel'?'aimarketing':key;
    explorerFeature=key==='spin-wheel'?salonExplorer.aimarketing.features.findIndex(feature=>feature[0].includes('vòng quay')):key==='aihub-marketing-campaign'?salonExplorer.aimarketing.features.findIndex(feature=>feature[2]==='marketingSms'):0;
    if (explorerFeature<0) explorerFeature=0;
    renderSalonExplorer(true);
  });
  salonSlidePlay.addEventListener('click', () => { salonSlidePlaying = !salonSlidePlaying; renderSalonSlide(); scheduleSalonSlides(); });
  languageToggle.addEventListener('change', () => renderSalonSlide());
  document.addEventListener('visibilitychange', () => { if (document.hidden && salonTourUtterance) stopSalonTourVoice(); scheduleSalonSlides(); });
  renderSalonSlide();
  salonCarousel.dataset.carouselReady = 'true';
  scheduleSalonSlides();
  document.querySelectorAll('#salon-intro-video .salon-video-stage').forEach(stage => {
    const player=stage.querySelector('video');
    const poster=stage.querySelector('.salon-video-poster');
    const fileInput=stage.querySelector('.salon-video-file');
    let previewUrl=null;
    const showVideo=source=>{ player.src=source; player.hidden=false; poster.hidden=true; player.load(); };
    if (stage.dataset.videoSrc.trim()) showVideo(stage.dataset.videoSrc.trim());
    poster.querySelector('.salon-video-upload').addEventListener('click',()=>fileInput.click());
    stage.closest('.salon-video-card').querySelector('.salon-video-replace').addEventListener('click',()=>fileInput.click());
    fileInput.addEventListener('change',()=>{
      const file=fileInput.files?.[0];
      if (!file) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl=URL.createObjectURL(file);
      showVideo(previewUrl);
      fileInput.value='';
    });
    window.addEventListener('pagehide',()=>{ if (previewUrl) URL.revokeObjectURL(previewUrl); });
  });
  renderSalonExplorer();
  const salonHubLinks = [...document.querySelectorAll('.salon-hub-nav a')];
  function updateSalonHubCurrent() {
    const current = salonHubLinks.find(link => link.getAttribute('href') === location.hash) || salonHubLinks[0];
    salonHubLinks.forEach(link => {
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', updateSalonHubCurrent);
  updateSalonHubCurrent();

// Resolve operational destinations at click time; PO hashes also identify carousel cards.
document.getElementById('salon-home-view').addEventListener('click',event=>{
 const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const href=link.getAttribute('href');if(href[0]==='#'&&document.getElementById(href.slice(1)))return;
 let target;
 if(/^nexora_home_de_xuat\.html/.test(href)){target='nexora-home.html'+href.slice('nexora_home_de_xuat.html'.length);}
 else target=localDestination(href,link.dataset.opsView);
 if(target&&target!==href){event.preventDefault();window.location.href=target;}
});
})();
