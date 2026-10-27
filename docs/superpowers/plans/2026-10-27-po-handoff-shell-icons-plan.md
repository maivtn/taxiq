# Kế hoạch cập nhật prototype theo handoff PO ngày Oct 27, 2026

> Dành cho người triển khai: thực hiện từng task bằng checklist trong tài liệu này. Khi bắt đầu triển khai, dùng workflow `superpowers:executing-plans` và ưu tiên hướng dẫn dự án trong `AGENTS.md`. Kế hoạch không yêu cầu tạo spec, worktree, nhánh mới hay vòng duyệt thiết kế bổ sung.

**Mục tiêu:** Đưa giao diện và điều hướng của prototype hiện tại về cấu trúc PO mới, tái sử dụng các module đã có và thay các biểu tượng chưa phù hợp bằng bộ Icons8 3D Fluency thống nhất.

**Kiến trúc:** Nâng cấp bộ shell đang dùng chung trong `nexora-shell.js` và `nexora-shell.css`, với ngữ cảnh Salon, SI POS và Staff. Các màn chức năng tiếp tục là trang HTML riêng; Trang chủ public và các landing page dùng layout website riêng. Giữ hai file `frame-salon.html`, `frame-staff.html` làm khung mẫu và đưa nội dung Dashboard vào trang thật.

**Công nghệ:** HTML, CSS, JavaScript thuần, các store/localStorage và thư viện đang có; không bổ sung framework hoặc build pipeline.

**Trạng thái:** Kế hoạch đề xuất, chưa triển khai các task bên dưới. Hiện trạng được xác định bằng đọc mã nguồn, chưa kiểm thử UI hoặc chạy test.

**Nguồn yêu cầu:**

- [AGENTS.md](../../../AGENTS.md).
- [spec.md của PO](../../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/spec.md).
- [Hướng dẫn triển khai](../../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/docs/DEV_IMPLEMENTATION.md).
- [Báo cáo QA của PO](../../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/docs/QA_REPORT.md); kết quả này chỉ thuộc package PO.
- [Dashboard mẫu](../../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/dashboard.html), [Salon Home mẫu](../../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/salon-home.html), [Trang chủ mẫu](../../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/index.html).
- [Các trang sản phẩm](../../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/products/README.md).
- [Icons8 3D Fluency](https://icons8.com/icons/all--style-3d-fluency--technique-3d) và [điều kiện dùng miễn phí](https://icons8.com/license).

## 1. Quy tắc triển khai

- Làm trên `main`; chỉ tạo nhánh/worktree khi người dùng yêu cầu.
- Trước mỗi đợt, đọc `git status` và diff để nhận diện thay đổi của người dùng. Chỉ commit file thuộc phạm vi đã hoàn tất; không tự push.
- Không tự chạy test tự động hoặc thao tác kiểm thử UI trên trình duyệt. Chỉ gom kiểm thử sau khi hoàn tất phạm vi và được người dùng yêu cầu.
- Khi chưa được yêu cầu test, ghi đúng: **Chưa chạy test — chờ yêu cầu của người dùng**.
- Đọc nguồn, kiểm kê asset, xem ảnh nguồn và rà soát diff được phép thực hiện; không xem đó là bằng chứng luồng UI đã hoạt động.
- Mọi câu chữ UI lấy từ đúng màn trong HTML/JS của PO; không tự viết thêm nhãn, placeholder, tooltip hoặc thông báo.
- Nguồn icon mới nhất do người dùng chỉ định là **Icons8 3D Fluency**. Dùng một style cho bộ icon thay thế; không trộn với IconScout, OneQR 3D hoặc emoji trong cùng nhóm được cập nhật.
- Ngày đầy đủ hiển thị theo `MMM D, YYYY`; dữ liệu lưu trữ/API và giá trị native date input giữ ISO. Ngày kèm giờ dùng kiểu hai dòng đang có trong dự án.
- Dropdown dùng mũi tên 16px, cách mép phải 16px và padding phải tối thiểu 44px.
- Ưu tiên flex row/col cho layout; chỉ dùng grid với lịch, ma trận hoặc sơ đồ thực sự hai chiều.
- Nút thao tác có tên hiển thị; các nút đóng, thu gọn và menu dùng biểu tượng phải có tên truy cập được.
- Thông báo/xác nhận đơn giản dùng SweetAlert2 đang có; modal form và màn chi tiết có thể dùng cấu trúc phức tạp hiện tại.
- Giữ dữ liệu và trạng thái demo hiện có. Không reset localStorage, thay khóa lưu trữ hoặc thay toàn bộ store chỉ để nhập mẫu PO.

## 2. Hiện trạng và quyết định về shell

| Thành phần | Hiện trạng qua đọc mã | Hướng xử lý |
| --- | --- | --- |
| `html/pages/frame-salon.html` | Khung rỗng, cấu hình `activePage: 'dashboard'`; menu Dashboard đang dẫn vào đây | Giữ làm mẫu shell; chuyển đích Dashboard sang trang nội dung mới |
| `html/pages/frame-staff.html` | Khung Staff dùng cùng renderer, có `staff-shell.css` | Giữ vai trò mẫu; bảo toàn điều hướng Staff |
| `html/assets/nexora-shell.js` | Render sidebar/header cho nhiều trang; menu merchant hiện chỉ có nhóm và mục con | Mở rộng renderer để hỗ trợ cây menu PO và ngữ cảnh Salon/POS |
| `html/assets/nexora-shell.css` | Có rule chung cho cả Salon và Staff | Scope thay đổi bằng lớp ngữ cảnh; tránh đổi selector toàn cục làm lệch Staff |
| `html/index.html` | Dashboard Tax IQ | Giữ URL hiện tại trong đợt này; tạo Trang chủ public ở đường dẫn riêng |
| POS, Booking, Rewards, SMS, OneQR, Community | Đã có các trang, store và hành vi demo | Map lại điều hướng, đối chiếu rồi bổ sung phần thiếu |
| Package PO | Dashboard và Salon Home là các HTML lớn, chứa nhiều CSS/JS inline; có bản compatibility | Trích phần cần dùng vào trang/module phù hợp; không đưa toàn bộ bản sao vào từng màn |

**Quyết định đề xuất:** Nâng cấp shell Salon hiện có, giữ biến thể Staff cùng nền tảng. Không tạo thêm một bộ shell merchant song song để duy trì lâu dài.

## 3. Phạm vi từng đợt và phụ thuộc

| Đợt | Task | Kết quả bàn giao | Độ lớn tương đối |
| --- | --- | --- | --- |
| A | 1–4 | Bộ icon có nguồn rõ ràng, shell Salon, điều hướng và Dashboard có nội dung | Lớn |
| B | 5–6 | Salon Home và onboarding có nội dung theo PO | Lớn |
| C | 7–9 | Front Desk và các màn vận hành thống nhất với mẫu mới | Lớn |
| D | 10–12 | AI/Marketing, Gift Card, Spin Wheel và các module liên quan được nối đầy đủ | Lớn |
| E | 13–14 | Trang chủ public, 12 landing page và các trang giới thiệu cần thiết | Lớn, có thể thực hiện sau các đợt vận hành |
| F | 15 | Rà soát phạm vi, kiểm thử tập trung khi được yêu cầu, xử lý lỗi và bàn giao | Phụ thuộc phạm vi kiểm thử |

Độ lớn dùng để sắp thứ tự, không phải cam kết số ngày. Chưa ước lượng ngày công khi chưa triển khai và chưa có kết quả kiểm thử hiện trạng.

```mermaid
flowchart LR
    A[Icon và mapping] --> B[Shell và điều hướng]
    B --> C[Dashboard]
    C --> D[Salon Home]
    D --> E[Onboarding]
    B --> F[Front Desk và POS]
    C --> G[AI và Marketing]
    G --> H[Gift Card và Spin Wheel]
    A --> I[Website public]
    I --> J[Landing page sản phẩm]
    E --> K[Rà soát toàn phạm vi]
    F --> K
    H --> K
    J --> K
    K --> L[Kiểm thử khi được yêu cầu]
```

**Đợt A nên được triển khai trước.** Đợt này tập trung shell và điều hướng; các module đang có được nối vào đúng vị trí, chưa cần thay nội dung toàn bộ module cùng lúc.

## 4. Cấu trúc file dự kiến

Các file mới dưới đây là phương án đề xuất. Nếu tại thời điểm triển khai đã có file cùng trách nhiệm, sử dụng file đó thay vì tạo bản trùng.

| Nhóm | File mới hoặc thư mục đích | File hiện tại cần thay đổi |
| --- | --- | --- |
| Icon | `html/assets/icons/3d-fluency/*.png`, `sources.json`, `LICENSE.txt`; `html/assets/nexora-icons.js`, `nexora-icons.css` | Các điểm render icon của shell, Dashboard, Salon Home và các phần POS được cập nhật |
| Shell | `html/assets/nexora-shell-nav.js` | `nexora-shell.js`, `nexora-shell.css`, hai file `frame-*` và script include trên các trang dùng shell |
| Nội dung mới | `html/pages/dashboard.html`, `salon-home.html`, `nexora-getting-started.html` | Mapping `PAGES` trong shell |
| Dashboard | `html/assets/nexora-product-catalog.js`, `nexora-dashboard.js`, `nexora-dashboard.css` | Đích điều hướng các module hiện có |
| Salon Home | `html/assets/salon-home.js`, `salon-home.css` | Dùng catalog và helper icon chung |
| Onboarding | `html/assets/nexora-getting-started.js`, `nexora-getting-started.css`, `nexora-getting-started-data.js` | Tái sử dụng nội dung hướng dẫn, ví dụ và trạng thái từ PO |
| Front Desk | `html/assets/front-desk-shortcut-settings.js` nếu cần tách logic | `front-desk-tabs.js`, `front-desk-tabs.css`, `pos-stations.js`, `pos-front-desk-overview.js` và các trang Front Desk |
| Marketing Studio | `html/pages/marketing-studio.html`, `html/assets/marketing-studio.js`, `marketing-studio.css` | Nối với Promotions, SMS và các đích AI Hub hiện có |
| Gift Card | `html/pages/gift-card-center.html`, `html/assets/gift-card-center.js`, `gift-card-center.css` | Shell, Front Desk; tận dụng phần Gift Card trong Products & Other Sales |
| Spin Wheel | `html/pages/spin-wheel.html`, `html/assets/spin-wheel.js`, `spin-wheel.css` | Các đích giới thiệu/demo trong Dashboard và Salon Home |
| Website public | `html/nexora-home.html`, `html/assets/nexora-public.css`, `nexora-public.js` | Tài nguyên public cần dùng từ PO |
| Trang sản phẩm | `html/products/index.html`, `html/products/<slug>/index.html` và asset dùng chung | Chuyển liên kết nội bộ từ đường dẫn PO sang đường dẫn prototype |

## 5. Đường dẫn và hợp đồng dùng chung

### 5.1 Đích điều hướng

Đường dẫn sau là đích trong prototype, không phải URL triển khai production.

| Mục | Đích dự kiến |
| --- | --- |
| Trang chủ public | `html/nexora-home.html` |
| Salon Home | `html/pages/salon-home.html` |
| Dashboard | `html/pages/dashboard.html` |
| Hướng dẫn bắt đầu | `html/pages/nexora-getting-started.html` |
| Front Desk | `html/pages/pos-front-desk.html` và các trang Front Desk đang có |
| Customers / Call Log | `html/pages/booking-book-phase-1.html?tab=customers` / `?tab=calllog` |
| Salon Settings / Menu dịch vụ | `html/pages/pos-salon-settings.html` và tab dịch vụ hiện có |
| Promotions / SMS / Loyalty | `reward-promotions.html` / `nexora-sms-dashboard.html` / `salon-setup-reward.html` trong `html/pages/` |
| One QR | `html/pages/qr-stations.html` và query của từng tab hiện có |
| Reviews | `html/pages/nexora-review.html` |
| POS Report | `html/pages/pos-shop-income-report.html` |
| Community | `html/pages/community.html` với các tab hiện có |
| Tax IQ | `html/index.html`, `html/taxiq/`; giới thiệu trong catalog vẫn mang trạng thái preview của PO |
| Staff | Giữ các đích trong menu Staff hiện tại, gồm `staff-dashboard.html`, `staff-work-orders.html`, `pos-calendar.html` |

Các tab/query phải đối chiếu handler thực tế trước khi thêm link. Analytics về tip/QR của PO và báo cáo doanh thu POS là các ngữ cảnh riêng; không tự map mọi mục Analytics về báo cáo doanh thu hoặc Analytics Tax IQ.

### 5.2 API shell và dữ liệu

- Giữ tương thích `window.NEXORA_SHELL.activePage`, `activeTab`, `onNavigate` và `setActiveTab(tabId)`.
- Bổ sung `workspace: 'salon' | 'pos' | 'staff'`. Với trang chưa truyền thuộc tính mới, suy ra từ cấu hình hiện tại; `activePage: 'staff'` luôn dùng shell Staff.
- Model menu mới dùng các trường `key`, `label`, `iconKey`, `href`, `page`, `tab`, `children`, `availability`. Renderer hỗ trợ `children` nhiều cấp; không phụ thuộc thứ tự mảng để xác định mục đang chọn.
- `window.NEXORA_ICONS.image(key, options)` trả về HTML ảnh từ asset local; `options` gồm `size` và `className`. Mapping chứa tên ngữ nghĩa, file, URL nguồn và trạng thái đã tải.
- `window.NEXORA_PRODUCT_CATALOG` dùng chung dữ liệu giới thiệu; mỗi mục có `key`, `title`, `iconKey`, `availability`, `dashboardVisible`, `showcaseOrder`, `groups`, `landingHref`. Nội dung lấy từ PO.
- Catalog mới chỉ quản lý giới thiệu/điều hướng. Dữ liệu vận hành tiếp tục qua `NEXORA_FRONT_DESK_DATA`, `NEXORA_APPOINTMENTS_STORE`, `NEXORA_STATIONS` và các store hiện có.
- Với chức năng chưa có màn local và PO chỉ cung cấp link ngoài, giữ đúng link đó cùng trạng thái trong mẫu; không tạo nghiệp vụ giả để làm đầy menu.
- Các đích local mới chỉ được bật trên menu cùng mốc bàn giao chứa trang tương ứng. Trước Task 5–6, Salon Home/onboarding có thể được khai báo trong model nhưng chưa hiển thị thành link đến file chưa tồn tại; không tạo trang rỗng làm đích tạm.

## 6. Checklist triển khai chi tiết

### Task 1 Chuẩn bị bộ icon Icons8 3D Fluency

**File:** Tạo thư mục icon và helper được liệt kê ở mục 4.

**Nguồn:** Link Icons8 người dùng cung cấp; đối chiếu các icon inline, ký tự và emoji trong HTML/JS PO. Đã khảo sát tùy chọn PNG 94×94 miễn phí và tải thử icon Home; việc này chưa đồng nghĩa toàn bộ bộ icon đã được tải vào repo.

- [ ] Kiểm kê vị trí thay: sidebar cấp chính, thẻ sản phẩm, shortcut, nhóm onboarding, feature explorer, Promotions/Loyalty và trang public.
- [ ] Chọn icon từ đúng style **3D Fluency**; cùng chất liệu, phối màu và cách dựng. Loại icon thương hiệu như Gemini/ChatGPT khi cần biểu tượng AI chung.
- [ ] Ưu tiên các nghĩa: Home, Dashboard, POS, QR, Community, AI Hub, AI Voice, Marketing, SMS, Gift Card, Reviews, Analytics, Tax IQ, Booking, Staff, Tickets, Checkout, Settings, Report, Rewards, Support.
- [ ] Tải bản miễn phí được website cung cấp; lưu file local theo tên ngữ nghĩa. Không nâng kích thước ảnh bằng nội suy và không gọi bản kích thước trả phí để vượt giới hạn miễn phí.
- [ ] Ghi `sources.json`: key, tên icon gốc, URL trang icon, URL/file tải, kích thước, style, ngày lấy, nơi dự kiến sử dụng. Ghi điều kiện nguồn trong `LICENSE.txt`.
- [ ] Kiểm kê file ảnh và xem ảnh nguồn để loại file lỗi, sai style hoặc sai nghĩa. Đây là rà soát tài nguyên, không phải test luồng UI.
- [ ] Tạo helper dùng chung, giải quyết đường dẫn asset theo vị trí script để chạy được cả `html/pages/` và landing page lồng thư mục.
- [ ] Dùng kích thước hiển thị thống nhất: sidebar 24–28px, thẻ sản phẩm 40–48px, shortcut 32–40px. Icon 94px phù hợp các vị trí này; không dùng làm hình hero lớn.
- [ ] Icon thiếu nghĩa phù hợp được ghi rõ trong manifest; không lấy icon từ style khác hoặc đổi sang nghĩa gần nhưng dễ gây hiểu nhầm.
- [ ] Chuẩn bị link ghi nguồn Icons8 tại các trang dùng bộ miễn phí theo yêu cầu của nhà cung cấp. Tên liên kết dùng thương hiệu `Icons8`; không thêm đoạn quảng bá tự viết.

**Tiêu chí hoàn tất:** Bộ asset thực tải, có mapping dùng lại được và nguồn/license rõ ràng; một chức năng dùng cùng biểu tượng tại các vị trí tương ứng. Chưa thay hàng loạt icon của các trang ngoài phạm vi.

### Task 2 Nâng cấp renderer và giao diện shell

**File:** `nexora-shell-nav.js`, `nexora-shell.js`, `nexora-shell.css`, `frame-salon.html`, `frame-staff.html`.

- [ ] Đưa cấu hình merchant navigation ra file riêng; giữ `NEXORA_SHELL` tương thích với các trang cũ.
- [ ] Render cây menu PO: Salon Home, Dashboard, Hướng dẫn bắt đầu; SI POS gồm Front Desk, Quản lý tiệm, Khách & tiếp thị; nhóm Tất cả sản phẩm và Hỗ trợ.
- [ ] Trong AI Hub hiển thị đúng AI Receptionist và Marketing Assistant; trong Công cụ doanh nghiệp nhóm One QR và Payment Gateway theo mẫu.
- [ ] Nhánh đang mở chỉ lộ các con thuộc nhánh đó. Mục đang chọn và nhánh tổ tiên được xác định theo page/tab/URL.
- [ ] Tách header theo workspace: Salon dùng ngữ cảnh doanh nghiệp, SI POS dùng toolbar vận hành theo PO, Staff giữ ngữ cảnh nhân viên.
- [ ] Giữ drawer mobile, trạng thái thu gọn và cấu hình ẩn/hiện menu hiện có; xử lý khóa menu cũ không còn trong model mà không xóa dữ liệu người dùng.
- [ ] Scope CSS bằng workspace; không đổi toàn bộ `.header`, `.sidebar`, `.content` theo giao diện Salon rồi áp vào Staff.
- [ ] Áp bộ icon đã chuẩn bị cho các vị trí shell nằm trong phạm vi; đảm bảo các trang cũ chưa nạp helper không bị lỗi khởi tạo.

**Tiêu chí hoàn tất:** Một bộ shell chung phục vụ được ba ngữ cảnh; Staff giữ các đích riêng; menu nhiều cấp không làm hỏng cách chuyển tab của các trang hiện có.

### Task 3 Nối đường dẫn và cập nhật các trang dùng shell

**File:** Các trang có include `nexora-shell.js`, mapping `PAGES`, hai file frame.

- [ ] Kiểm kê tất cả trang dùng shell và các handler `onNavigate` trước khi đổi model.
- [ ] Cập nhật include theo thứ tự: dữ liệu menu/helper icon trước shell; CSS shell sau CSS trang như quy ước hiện tại.
- [ ] Nối các mục đã có vào URL ở mục 5; giữ query/tab phục vụ Customers, Call Log, OneQR, Booking và các màn khác.
- [ ] Chuyển menu Dashboard khỏi `frame-salon.html` sang `dashboard.html` khi trang Dashboard ở Task 4 được thêm trong cùng phạm vi bàn giao.
- [ ] Đưa link Trang chủ và Salon Home về đúng ngữ cảnh; không đổi `html/index.html` thành Trang chủ public trong đợt này.
- [ ] Xử lý quay lại từ chi tiết module, mở URL trực tiếp và browser back bằng URL hiện có; không dựng một SPA/router mới.
- [ ] Rà soát diff và commit phần shell/điều hướng thuộc phạm vi đã hoàn tất, ghi trạng thái test thực tế.

**Tiêu chí hoàn tất:** Mỗi mục menu có đích đúng, hoặc giữ trạng thái preview/đích ngoài đúng PO. Không có mục mới dẫn vào khung nội dung rỗng chỉ để đủ menu.

### Task 4 Dashboard danh mục và chi tiết sản phẩm

**File:** `pages/dashboard.html`, `nexora-product-catalog.js`, `nexora-dashboard.js`, `nexora-dashboard.css`.

- [ ] Trích đúng nội dung từ `#module-browser`, `#module-detail`, `catalog` và bộ lọc của Dashboard PO.
- [ ] Hiển thị **9 thẻ**: SI POS, One QR, Payments & Payouts, AI Hub, Reviews, Gift Card Center, Analytics, Community, Spin Wheel.
- [ ] Đặt bộ lọc và danh mục ngay dưới tiêu đề gọn; giữ việc PO đã bỏ hàng thẻ lặp và hàng quick-access.
- [ ] Thực hiện tìm kiếm/lọc, cập nhật số kết quả, empty state và thao tác đặt lại bằng câu chữ PO.
- [ ] Tạo màn chi tiết module với nhóm chức năng, trạng thái khả dụng, link đến màn hiện có và quay lại danh sách.
- [ ] Dùng `dashboard.html?module=<key>` cho đích chi tiết. Hỗ trợ AI Marketing qua `module=aihub&section=marketing`; Tax IQ truy cập trực tiếp ở `module=taxiq` dù không thêm thẻ thứ 10.
- [ ] Giữ trạng thái preview/đề xuất của Tax IQ, Spin Wheel và các phần Payments chưa có, kể cả khi repo đang có demo riêng.

**Tiêu chí hoàn tất:** Dashboard có đúng vai trò danh mục; URL mở đúng module, quay lại giữ ngữ cảnh tìm kiếm/lọc khi có thể; không đồng nhất nhầm số lượng 9 thẻ với 12 landing page.

### Task 5 Salon Home

**File:** `pages/salon-home.html`, `salon-home.js`, `salon-home.css`; dùng catalog và icon chung.

- [ ] Dựng hero/slideshow theo mẫu với thứ tự 12 khu giới thiệu: POS, AI Hub, AI Marketing, SMS Campaign, Spin Wheel, Gift Card, Community, One QR, Tax IQ, Payments, Reviews, Analytics.
- [ ] Giữ nút trước/sau, chọn slide, dừng/phát; giảm chuyển động theo thiết lập hệ thống.
- [ ] Bổ sung AI Tour/nghe giới thiệu từ lời mẫu PO; nếu trình duyệt không hỗ trợ giọng đọc, giao diện vẫn đọc được nội dung và dùng được link.
- [ ] Dựng hai khu video tổng quan Nexora và SI POS; dùng placeholder đã có trong mẫu khi chưa có video thật.
- [ ] Bổ sung hệ sinh thái sản phẩm, doanh nghiệp kết nối theo ngành và feature explorer có chọn sản phẩm/tính năng.
- [ ] Nối các lối tắt Bắt đầu ngày làm việc và Dành cho chủ tiệm vào các màn hiện có.
- [ ] Áp icon 3D Fluency cho vị trí tương ứng; ảnh sản phẩm/ảnh salon lấy từ asset PO, không thay bằng icon phóng lớn.

**Tiêu chí hoàn tất:** Salon Home là trang bắt đầu của tiệm, tách khỏi Dashboard danh mục; không giả định 12 khu giới thiệu là 12 sản phẩm độc lập trong catalog.

### Task 6 Onboarding theo ngành và sản phẩm

**File:** `pages/nexora-getting-started.html`, ba file `nexora-getting-started-*` ở mục 4.

- [ ] Nhập dữ liệu cho 6 ngành: nail, hair, spa, retail, food/café, restaurant từ các thư viện PO.
- [ ] Dựng đủ 5 mục: Bắt đầu, Tài liệu mẫu, Lễ tân AI, Hướng dẫn & FAQ, Tất cả sản phẩm.
- [ ] Bổ sung form mẫu, preview, đánh dấu hoàn thành và tải tài liệu mẫu theo ngành; lưu tiến độ theo doanh nghiệp/ngành trên trình duyệt.
- [ ] Khi sửa dữ liệu của bước đã hoàn tất, cập nhật trạng thái bước theo logic PO; nếu storage bị chặn, không báo đã lưu lâu dài.
- [ ] Nhập câu hỏi/câu trả lời mẫu và tài liệu kiến thức Lễ tân AI; các tình huống thiếu thông tin dẫn về cách xử lý của PO.
- [ ] Dùng thư viện có sẵn cho trợ lý hướng dẫn; không tạo kết nối LLM/API mới để mô phỏng tính năng này.
- [ ] Nối hướng dẫn theo sản phẩm đến đúng module hoặc trang hiện có.

**Tiêu chí hoàn tất:** Chọn ngành làm đổi nội dung đúng; tiến độ có phạm vi rõ ràng; nội dung hướng dẫn không được thể hiện như cài đặt đã áp dụng vào tài khoản thật.

### Task 7 Front Desk toolbar và shortcut

**File:** `front-desk-tabs.js`, `front-desk-tabs.css`, helper shortcut mới nếu cần; các trang Front Desk.

- [ ] Giữ bộ tab vận hành đang có và các URL chi tiết/checkout; không làm mất Live Waitlist hoặc chức năng hiện có ngoài mẫu PO.
- [ ] Tự phân bố tab theo chiều rộng thực tế và đưa phần dư vào More; không chia bằng một danh sách cố định cho mọi thiết bị.
- [ ] Thêm tùy chỉnh shortcut theo PO: chọn công cụ bổ sung, thay thứ tự bằng kéo thả và bằng bàn phím.
- [ ] Lưu lựa chọn và thứ tự theo tiệm; các mục cố định và mục thêm đều có key ổn định.
- [ ] Bổ sung tìm chức năng trong ngữ cảnh POS; cập nhật active tab khi chuyển giữa danh sách, chi tiết và checkout.
- [ ] Thay icon shortcut bằng mapping 3D Fluency; rà soát kích thước thực và padding của ảnh, tránh nhìn lệch giữa các ô.

**Tiêu chí hoàn tất:** Một định nghĩa toolbar dùng chung trên các trang Front Desk; tùy chỉnh không làm mất đích điều hướng hay nội dung tab.

### Task 8 Sơ đồ chỗ và dữ liệu Overview

**File:** `pos-stations.js`, `pos-turn-board-stations.js`, `pos-front-desk-operations.js`, `pos-front-desk-overview.js` và CSS/trang liên quan.

- [ ] Đối chiếu API `NEXORA_STATIONS` với ba kiểu xem Thẻ, Lưới, Hàng ngang của PO; dùng một nguồn dữ liệu cho cả ba kiểu.
- [ ] Hiển thị tổng hợp theo ghế pedicure, bàn làm móng và phòng; mẫu 6/5/2 là dữ liệu minh họa, không hard-code thành quy tắc mọi tiệm.
- [ ] Bảo toàn ý nghĩa các trạng thái đang có; map hiển thị Trống, Đang làm, Đang dọn, Quá hạn, Tạm khóa và màu theo mẫu.
- [ ] Giữ các điều kiện giữ chỗ, dọn chỗ, override của prototype; không thay store hiện tại bằng ảnh chụp tĩnh của PO.
- [ ] Đối chiếu bộ khách mẫu riêng trong Overview với `NEXORA_FRONT_DESK_DATA`; cập nhật số liệu và danh sách từ nguồn demo phù hợp để tránh mâu thuẫn với Tickets/Checkout.
- [ ] Giữ bộ lọc lượt khách và thông tin khách/thợ/dịch vụ/nguồn/trạng thái theo PO; không lấy số fixture làm số liệu vận hành thật.

**Tiêu chí hoàn tất:** Thay kiểu xem không thay dữ liệu chỗ; Overview và các màn vận hành không kể hai tình trạng trái nhau cho cùng dữ liệu demo.

### Task 9 Đối chiếu Booking Settings và chuỗi phục vụ

**File:** Các trang `pos-front-desk*`, `pos-direct-checkout.html`, `pos-completed-services.html`, `pos-salon-settings.html`, `booking-book-phase-1.html`; runtime/store liên quan khi có chênh lệch được xác định.

- [ ] Đối chiếu trực tiếp UI PO với màn đã có trong quá trình làm; sửa phần thiếu thay vì thay lại module hoàn chỉnh, không tạo thêm tài liệu bắt buộc.
- [ ] Giữ cùng mã phiếu qua check-in, giao thợ, phục vụ, chờ thanh toán và hoàn tất; direct checkout vẫn dùng luồng hiện tại.
- [ ] Nối bốn góc nhìn Booking: yêu cầu, lịch đặt, lịch theo khách, lịch theo thợ; giữ quy tắc thời lượng, thợ và lịch đang có.
- [ ] Map chín phần Settings của PO vào các tab hiện tại; bảo toàn Operating Standards và cấu hình được bổ sung trước đó.
- [ ] Nối đúng các mục Chấm công, Customer History, Price Menu, AI Voice; mục nào PO chỉ có preview thì thể hiện đúng phạm vi đó.
- [ ] Chỉ thay data contract khi có nhu cầu thật từ phần đối chiếu; nếu cần chuyển đổi dữ liệu cũ, bổ sung tương thích đọc và không xóa dữ liệu.

**Tiêu chí hoàn tất:** Mẫu mới hòa vào chuỗi vận hành đang có; các chức năng đã triển khai không bị rút xuống mức mô phỏng đơn giản hơn của package PO.

### Task 10 AI Hub AI Voice và Marketing Studio

**File:** Catalog/shell; trang Booking, Call Log, AI Voice setup hiện có; `marketing-studio.html` và asset mới.

- [ ] Tổ chức AI Hub thành hai trợ lý đúng mẫu; Customers/Call Log/Plans/Settings dùng lại trang hoặc tab đã có.
- [ ] Đối chiếu màn cuộc gọi và hồ sơ khách liên quan; thể hiện yêu cầu, kết quả tiếp nhận và việc cần theo dõi theo mẫu.
- [ ] Nhập Marketing Studio từ `products/ai-marketing/studio.html` của PO thành ba góc nhìn Tạo, Quản lý, Hiệu quả.
- [ ] Hỗ trợ bản nháp gồm mục tiêu, nhóm khách, loại chiến dịch, nội dung, ngày chạy; xem trước, lưu/sửa/nhân bản và tải JSON theo hành vi mẫu.
- [ ] Giới hạn dữ liệu nháp theo doanh nghiệp; ghi rõ phạm vi lưu trên trình duyệt bằng câu chữ mẫu.
- [ ] Phân biệt Marketing Studio, Promotions và SMS Campaigns: nối các đích liên quan, không tạo ba danh sách chiến dịch trùng nhau cho cùng vai trò.
- [ ] Giữ link VLinkPay cho chiến dịch/AI Ads theo PO; không tích hợp dịch vụ gửi tin hoặc quảng cáo thật.

**Tiêu chí hoàn tất:** Người xem đi được từ AI Hub đến công cụ phù hợp; bản nháp Marketing không bị hiểu thành chiến dịch đã phát hành.

### Task 11 Promotions SMS Loyalty và các công cụ đang có

**File:** `reward-promotions.html`, `nexora-sms-dashboard.html`, `salon-setup-reward.html`, `qr-stations.html`, `nexora-review.html`, trang report và asset tương ứng.

- [ ] Promotions: đối chiếu template, Deal/Coupon, lịch chạy, kênh, trạng thái và lịch sử sử dụng; dùng store Promotions hiện tại.
- [ ] SMS: đối chiếu bốn bước Nhóm khách, Nội dung, Lịch gửi, Kiểm tra; preview, biến nội dung, ước tính và các chế độ gửi theo mẫu.
- [ ] Loyalty: đối chiếu bảy tab đã có với PO; cập nhật quy tắc, loại thưởng, ví, lịch sử và analytics khi có chênh lệch cụ thể.
- [ ] One QR: nối các khu QR tại tiệm, tip, payment, referral, staff invite; giữ đúng hành vi scan mở menu và bước check-in riêng.
- [ ] Reviews/Analytics/Payments: nối đúng ngữ cảnh, giữ các phần preview hoặc đích ngoài được PO chỉ định.
- [ ] Thay emoji/ký tự minh họa và icon khác style trong các vùng được chạm tới bằng bộ 3D Fluency; giữ nội dung và hành vi ngoài phạm vi.

**Tiêu chí hoàn tất:** Module hiện có đáp ứng các chênh lệch đã xác định, có đường dẫn thống nhất từ shell/Dashboard; không nhân bản store hoặc tự mở rộng nghiệp vụ từ phần giới thiệu.

### Task 12 Gift Card Center và Spin Wheel

**File:** Hai trang và asset mới ở mục 4; `front-desk-tabs.js`, catalog và shell.

- [ ] Gift Card: tạo màn trung tâm với nhóm phát hành/thiết kế, quản lý/sử dụng, thành viên/báo cáo từ PO.
- [ ] Tận dụng lookup/sell/redeem demo trong Products & Other Sales khi đúng ngữ cảnh; các thao tác VLinkPay giữ đúng link được PO cung cấp.
- [ ] Nối mục Gift Card Center trong sidebar và Front Desk; giữ ghi chú KYB đúng vị trí trong mẫu đối với E-Gift nâng cao.
- [ ] Spin Wheel: nhập demo quay và màn tạo nháp từ `products/spin-wheel/create.html`.
- [ ] Hỗ trợ tên chiến dịch, thời gian, giải thưởng, số lượng, tổng tỷ lệ 100%, điều kiện chơi, preview, lưu nháp và tải JSON theo mẫu.
- [ ] Giữ Spin Wheel là trải nghiệm demo; không suy ra cơ chế phát thưởng hoặc trừ ngân sách thật từ kết quả quay.
- [ ] Tìm icon vòng quay đúng style; nếu chưa có thì giữ phần thiếu rõ ràng, không thay bằng icon refresh hoặc pie chart gây nhầm chức năng.

**Tiêu chí hoàn tất:** Hai mục không còn là nút thiếu đích; đường đi đến chức năng demo và chức năng ngoài được phân biệt đúng theo PO.

### Task 13 Trang chủ public

**File:** `html/nexora-home.html`, `nexora-public.css`, `nexora-public.js`; ảnh nguồn cần dùng.

- [ ] Trích layout và copy từ `index.html` của package PO; dùng header/footer public riêng.
- [ ] Bổ sung hero, hành trình khách, hệ sinh thái, ngành/doanh nghiệp, video, About, bắt đầu, tải app, Founder và liên hệ đúng mẫu.
- [ ] Nối CTA vào Salon Home, Dashboard hoặc landing page phù hợp; giữ Dashboard Tax IQ ở URL hiện có.
- [ ] Form liên hệ và khu video giữ mức demo/placeholder có trong PO khi chưa có dịch vụ thật.
- [ ] Dùng bộ icon mới cho phần minh họa cần thay; giữ logo chính thức và ảnh nguồn đúng thương hiệu.

**Tiêu chí hoàn tất:** Có trang giới thiệu public độc lập, nối vào workspace đúng đường đi và không thay đổi điểm vào Tax IQ.

### Task 14 Landing page trang phụ và đa ngôn ngữ

**File:** `html/products/`, asset public chung và các thư mục trang phụ cần thiết.

- [ ] Tạo trang danh mục cùng 12 landing page theo slug PO: `si-pos`, `one-qr`, `payments-payouts`, `ai-hub`, `ai-marketing`, `ai-voice-sms`, `reviews`, `gift-card-center`, `analytics`, `community`, `spin-wheel`, `tax-iq`.
- [ ] Giữ cấu trúc nội dung, trạng thái sản phẩm, video/poster, FAQ và liên kết liên quan theo đúng từng trang.
- [ ] Chuyển đường dẫn asset khi đưa trang vào cấu trúc mới; dùng file local, không hotlink icon hoặc sao chép tài nguyên không được sử dụng.
- [ ] Chỉ đưa About Nexora, Founder, Stories và Event vào khi cần cho các link trong phạm vi public. Các website độc lập VMMTravel/VLinkPay và About của thương hiệu khác để đợt riêng.
- [ ] Giữ title/description theo PO; canonical và sitemap chỉ dùng cho môi trường phù hợp. Redirect HTTP, Search Console và publish domain là công việc triển khai riêng.
- [ ] Trên Dashboard/Salon Home/onboarding mới, dùng bộ ngôn ngữ PO cung cấp: vi, en, zh, ko, es, ja, th, ar, fr. Các trang public khác theo đúng tập ngôn ngữ riêng của trang đó.
- [ ] Giữ ngày hiển thị theo quy tắc dự án bất kể ngôn ngữ; xử lý hướng RTL ở phần tiếng Ả Rập có trong mẫu. Không tự dịch thêm câu chữ bằng Google hoặc AI.

**Tiêu chí hoàn tất:** Các trang được đưa vào có link/asset phù hợp, đúng nội dung PO và đúng style icon. Không xem toàn bộ thư mục hệ sinh thái là một yêu cầu xây lại mọi website.

### Task 15 Rà soát kiểm thử có điều kiện và bàn giao

**File:** Toàn bộ file đã thay đổi; chỉ cập nhật test thực sự bị tác động khi người dùng yêu cầu kiểm thử.

- [ ] Rà soát diff theo từng đợt, loại file không thuộc yêu cầu và đối chiếu copy với nguồn PO.
- [ ] Đối chiếu các nhóm rủi ro ở mục 7; ghi nhận phần chưa triển khai và phần chỉ là preview.
- [ ] Khi chưa có yêu cầu test: dừng ở rà soát nguồn/diff, không tự mở prototype để thử, không chạy `npm test` và không khẳng định luồng đã đạt.
- [ ] Khi người dùng yêu cầu test: gom phạm vi đã làm và chạy toàn bộ bằng `npm test`. Chỉ chạy một file bằng `node --test tests/<đường-dẫn-file-test>` nếu người dùng chỉ định phạm vi đó.
- [ ] Test JavaScript đặt trong `tests/` và phản ánh đường dẫn nguồn; fixture đọc từ `import.meta.url`/`__dirname`, không phụ thuộc cwd.
- [ ] Ưu tiên test sẵn có của shell/navigation, Front Desk, stations, Booking, Promotions, SMS và Rewards. Chỉ bổ sung test hành vi còn thiếu; không viết test soi class/icon path chỉ để khớp cách cài đặt.
- [ ] Nếu được yêu cầu kiểm thử UI: gom một lượt trên 360, 390, 768, 820, 1024, 1440px; kiểm tra navigation, menu nhiều cấp, More, dữ liệu demo, icon, ngày, dropdown, bàn phím và reduced motion.
- [ ] Sửa lỗi liên quan trong phạm vi, rà soát diff rồi commit. Phản hồi ngắn gồm mã commit, kết quả test thực tế và điểm còn thiếu; không tự push.

**Tiêu chí hoàn tất:** Có thể truy được mỗi thay đổi về task/nguồn PO; trạng thái kiểm thử phản ánh đúng việc đã làm, không dùng báo cáo QA của PO thay cho kết quả của repo.

## 7. Các điểm cần tập trung khi rà soát

| Điều kiện dễ gặp | Hành vi cần giữ | Task sở hữu | Kiểm tra khi người dùng yêu cầu |
| --- | --- | --- | --- |
| Trang cũ chỉ truyền `activePage/activeTab` | Shell vẫn khởi tạo đúng, handler tab vẫn nhận sự kiện | 2–3 | Các test shell/navigation hiện có và luồng trang cũ |
| Staff dùng chung CSS/header và Community | Không nhận menu/toolbar merchant; link Staff giữ đúng vai trò | 2–3 | Các test Staff shell, calendar và Community theo vai trò |
| localStorage bị chặn hoặc còn khóa menu cũ | Trang dùng được trong phiên, không mất dữ liệu hoặc báo lưu sai | 2, 6–7, 10, 12 | Tình huống storage lỗi, dữ liệu cũ và chuyển tiệm |
| URL mở thẳng vào module/tab hoặc browser back | Hiển thị đúng ngữ cảnh, active menu và nội dung | 3–4, 7, 10–12 | URL trực tiếp, back/forward và query tab |
| Thẻ Dashboard khác danh sách showcase/landing page | Giữ đúng 9 thẻ, 12 khu giới thiệu và 12 landing page | 4–5, 14 | Tìm kiếm, số kết quả và đích module |
| POS Overview và ticket dùng nguồn demo khác nhau | Cùng dữ liệu không có trạng thái trái nhau | 8–9 | Chuỗi check-in → phục vụ → thanh toán → hoàn tất |
| Đổi layout chỗ hoặc toolbar trên tablet | Không tràn document, không mất thao tác hoặc active tab | 7–8 | Các viewport được yêu cầu và thao tác bàn phím |
| Trang nằm sâu trong thư mục và ảnh 94px | Asset local đúng đường dẫn, không kéo giãn thành ảnh lớn | 1, 13–14 | Các trang đại diện và manifest asset |
| Tiếng Ả Rập và ngày hiển thị | Hướng nội dung theo mẫu, ngày vẫn `MMM D, YYYY` | 5–6, 14 | Bản dịch có sẵn, RTL, lịch và dropdown |
| Preview có nút thao tác/đích ngoài | Không báo thành công như giao dịch hay phát hành thật | 4, 10–14 | Phạm vi tác động của các nút và nhãn trạng thái PO |

## 8. Những việc không đưa vào đợt prototype

- Backend, đăng nhập thực, KYB thực, quyền truy cập production và audit trail mới.
- Gửi SMS/email, gọi điện AI, chạy quảng cáo, thanh toán, payout hoặc phát thưởng thật.
- Mua gói icon, tạo tài khoản mới hoặc nâng cấp thuê bao. Dùng tài nguyên miễn phí có điều kiện ghi nguồn được xác nhận.
- Chuyển framework, xây SPA/router mới hoặc thay cấu trúc toàn bộ store đang có.
- Đổi root `html/index.html`, publish, deploy, push hoặc thay cấu hình domain.
- Xây lại Staff app, VMMTravel, VLinkPay hoặc mọi trang nằm trong thư mục handoff chỉ vì chúng đi kèm package.

Các mục này có thể được bổ sung bằng yêu cầu riêng. Trạng thái preview trong handoff không tự trở thành yêu cầu tích hợp production.

## 9. Trình tự commit và mốc bàn giao

| Mốc | Nội dung commit gợi ý | Điều kiện bàn giao |
| --- | --- | --- |
| A1 | `chore: add Icons8 3D Fluency assets and source mapping` | Asset tải thật, đúng style, có nguồn và điều kiện sử dụng |
| A2 | `feat: update salon shell and merchant navigation` | Shell nhiều cấp, mapping màn cũ; Staff được bảo toàn ở mức rà soát nguồn |
| A3 | `feat: add Nexora product dashboard` | Dashboard có nội dung và thay đích menu đang trỏ vào frame rỗng |
| B | `feat: add salon home and getting started` | Hai trang có nội dung, dùng cùng catalog và shell với Dashboard |
| C | `feat: align front desk workspace with PO handoff` | Toolbar, sơ đồ chỗ, Overview và phần vận hành được cập nhật |
| D | `feat: connect marketing gift cards and spin wheel previews` | Module mới có đích, module cũ được đối chiếu bổ sung |
| E | `feat: add Nexora public and product pages` | Trang public/landing và link trong phạm vi đầy đủ |
| F | `fix: address requested handoff verification findings` | Chỉ tạo khi có lỗi cần sửa sau kiểm thử được yêu cầu |

Mỗi mốc có thể tách thành commit nhỏ khi thay đổi độc lập. Trước mọi commit rà soát diff; test không phải điều kiện tự động được phép chạy. Bàn giao luôn phân biệt **đã triển khai**, **đã kiểm thử**, **preview** và **chưa làm**.

## 10. Phạm vi bắt đầu được đề xuất

Thực hiện **Task 1–4** làm đợt triển khai đầu: tải bộ icon cần thiết, nâng cấp shell Salon, nối các màn hiện có và bổ sung Dashboard có nội dung để thay đích `frame-salon.html` đang rỗng. Đây là mốc đủ cụ thể để xem lại toàn bộ cấu trúc menu mới trước khi tiếp tục Salon Home, onboarding và các module còn lại.

File này là kế hoạch cho toàn bộ đợt thay đổi. Việc tạo kế hoạch chưa đồng nghĩa các task triển khai đã hoàn thành.
