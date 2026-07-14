# Thiết Kế Lại Customer Reward Responsive

## Bối cảnh

`html/customer/customer-app-prototype.html` là prototype độc lập của ứng dụng tích điểm khách hàng, gồm 31 màn hình, 5 nhóm điều hướng, nội dung song ngữ EN/VI và các luồng demo phía client cho onboarding, phần thưởng, quét mã, tip, thanh toán trực tiếp, đặt lịch, ưu đãi, giới thiệu bạn bè và cài đặt. Khung điện thoại cố định, notch/status bar giả, icon emoji và bố cục một kích thước khiến sản phẩm hiện giống prototype hơn là một ứng dụng web responsive thực tế.

Hành vi của màn hình và quy tắc nghiệp vụ tiếp tục tuân theo `html/customer/customer-app-developer-spec.md`. Prototype hiện tại được giữ nguyên để làm bản tham chiếu.

## Mục tiêu

Tạo `html/customer/cutomer-reward.html` thành ứng dụng web mobile-first có cảm giác như sản phẩm thật, với các yêu cầu:

- giữ đầy đủ 31 màn hình và các luồng demo tương tác hiện có;
- giữ chức năng chuyển đổi EN/VI ngay khi ứng dụng đang chạy;
- giữ nhận diện màu tối với tím, hồng, cyan, xanh lá và vàng;
- hiển thị toàn màn hình trên mobile, không có khung thiết bị giả;
- dùng bottom navigation trên mobile và tablet;
- chuyển sang sidebar cố định trên desktop;
- bảo đảm dễ sử dụng và cân đối từ điện thoại nhỏ tới màn hình desktop rộng.

## Phạm vi

### Bao gồm

- Toàn bộ screen ID trong tài liệu đặc tả Customer App.
- Năm nhóm: Home, Wallet, Scan, Explore và Profile.
- Mapping điều hướng hiện có giữa màn gốc và màn chi tiết.
- Các tương tác demo và thay đổi state cục bộ hiện có.
- Trạng thái dùng chung: loading, empty, pending, success và error.
- Responsive, accessibility và chế độ giảm chuyển động.

### Không bao gồm

- Backend API, dịch vụ xác thực, lưu trữ lâu dài hoặc tích hợp thanh toán production.
- Thay đổi quy tắc nghiệp vụ trong `customer-app-developer-spec.md`.
- Thay đổi file `customer-app-prototype.html`.
- Tính năng riêng cho desktop không có trong phạm vi 31 màn của Customer App.

## Hướng kỹ thuật

Sản phẩm đầu ra là một file HTML độc lập, sử dụng:

- Tailwind CSS v4 Browser CDN cho layout, responsive utility và style component;
- Lucide Browser CDN làm hệ icon SVG duy nhất;
- JavaScript thuần cho điều hướng, state demo cục bộ, chuyển ngôn ngữ và tương tác;
- theme token CSS và các component class Tailwind tái sử dụng ngay trong tài liệu.

Không tải Bootstrap hoặc Bootstrap Icons. Tailwind Browser CDN phù hợp với prototype tĩnh này. Khi đưa lên production, cần compile Tailwind thành CSS tĩnh thay vì tiếp tục dùng Browser CDN.

## Kiến trúc responsive

### Mobile: dưới 768px

- Ứng dụng chiếm toàn bộ viewport và hỗ trợ `env(safe-area-inset-*)`.
- Nội dung dùng một cột với khoảng cách phù hợp thao tác cảm ứng.
- Bottom navigation gồm 5 tab được cố định để dễ thao tác bằng một tay.
- Nội dung màn hình có khoảng đệm cuối trang đủ để không bị navigation che.
- Các thao tác dạng dialog ưu tiên bottom sheet khi phù hợp.

### Tablet: từ 768px đến 1023px

- Tiếp tục dùng bottom navigation.
- Khung nội dung rộng hơn nhưng vẫn giữ độ dài dòng dễ đọc.
- Nhóm card và khối tóm tắt phù hợp có thể chuyển sang 2 cột.
- Luồng chi tiết và form giữ độ rộng tập trung, không kéo sát hai mép màn hình.

### Desktop: từ 1024px trở lên

- Thay bottom navigation bằng sidebar cố định rộng khoảng 248px.
- Sidebar chứa đúng 5 nhóm và dùng cùng mapping trạng thái active như mobile.
- Màn chi tiết vẫn có nút Back, đồng thời sidebar tiếp tục highlight nhóm cha.
- Nội dung chính căn giữa, rộng tối đa khoảng 1200px.
- Dashboard và màn danh sách dùng 2 hoặc 3 cột khi cấu trúc thông tin phù hợp.
- Form, màn xác nhận và luồng tác vụ giữ chiều rộng hẹp hơn để dễ đọc.

## Hệ thống giao diện

- Giữ nền gần đen và màu nhấn chính dạng gradient tím sang hồng.
- Giữ cyan cho thông tin, xanh lá cho thành công, vàng cho điểm/phần thưởng và đỏ cho lỗi hoặc thao tác nguy hiểm.
- Giảm glow lớn và gradient dày; tạo phân cấp chủ yếu bằng khoảng cách, typography và border tiết chế.
- Dùng ảnh thực tế cho doanh nghiệp và nhân viên tại các màn khám phá, hồ sơ tiệm, đặt lịch và lịch sử kiểu mẫu.
- Thay emoji chức năng bằng Lucide icon. Chỉ giữ emoji trang trí khi nó thực sự là nội dung sản phẩm.
- Dùng card gọn, tiêu đề section rõ ràng và token nhất quán cho radius, border, shadow, spacing.
- Cỡ chữ nội dung dễ đọc; tránh heading kiểu landing page quá lớn bên trong app shell.

## Component dùng chung

File mới định nghĩa component class và pattern markup nhất quán cho:

- top bar mobile và sidebar desktop;
- bottom navigation;
- page header và nút Back;
- balance card, business card, offer card, reward card, appointment card, activity row và look card;
- search field, form control, segmented filter, chip, toggle và bộ chọn số tiền;
- nút primary, secondary, icon-only và destructive;
- toast, modal, confirmation dialog và bottom sheet;
- loading skeleton, empty state, inline error, pending state và success state;
- giao diện QR và scan;
- bộ chuyển ngôn ngữ.

Màu thương hiệu được khai báo tập trung bằng Tailwind theme. Các pattern lặp lại dùng component class có ý nghĩa với `@apply`, tránh lặp chuỗi utility dài trên 31 màn hình.

## Mô hình màn hình và điều hướng

- Giữ nguyên 31 screen ID để khớp screen inventory và các luồng demo đã được mô tả.
- Chỉ một màn hình ở trạng thái active tại mỗi thời điểm.
- Một map duy nhất từ screen sang module điều khiển active state cho cả bottom navigation và sidebar.
- Điều hướng module gốc đưa người dùng về Home, Wallet, Scan, Explore hoặc Profile.
- Màn chi tiết dùng Back target rõ ràng, không phụ thuộc hoàn toàn vào browser history.
- Khi chuyển màn, ứng dụng reset vị trí scroll của màn mới và cập nhật trạng thái accessibility.

## State phía client và luồng dữ liệu

Một application state cục bộ lưu:

- màn hình và module đang active;
- ngôn ngữ hiện tại;
- số dư điểm tách theo từng doanh nghiệp;
- lựa chọn tip, thanh toán, phần thưởng, đặt lịch và bộ lọc;
- trạng thái onboarding, consent, notification và confirmation;
- look, wish, offer đã lưu và history item được tạo trong demo.

JavaScript trong cùng file được tổ chức theo trách nhiệm:

- navigation và responsive shell;
- translation và cập nhật placeholder;
- onboarding và login;
- rewards, wallet và redemption;
- scan và check-in;
- tip và thanh toán trực tiếp;
- booking;
- explore, offers và wish alert;
- looks, review, referral, notification và preferences;
- overlay và feedback message dùng chung.

Event handler cập nhật state trước rồi render phần UI bị ảnh hưởng. Helper dùng chung xử lý chuyển màn, active navigation, bản dịch, overlay và format số dư.

## Tương tác và accessibility

- Control tương tác có vùng chạm tối thiểu 44px khi thực tế cho phép.
- Nút chỉ có icon phải có accessible label; thêm tooltip nếu ý nghĩa chưa rõ.
- Keyboard focus hiển thị rõ.
- Modal và sheet hỗ trợ phím Escape, đồng thời trả focus về control đã mở chúng.
- Navigation công bố trạng thái hiện tại bằng thuộc tính ARIA phù hợp.
- Không dùng màu sắc làm tín hiệu trạng thái duy nhất.
- Chuyển động chỉ dùng cho chuyển màn, sheet, phản hồi scan và xác nhận.
- `prefers-reduced-motion` tắt animation không thiết yếu.

## Xử lý empty, loading, pending và error

- Danh sách rỗng hiển thị empty state có hành động tiếp theo phù hợp.
- Search và filter có no-results state mà không làm sụp bố cục trang.
- Thao tác mô phỏng bất đồng bộ phải khóa gửi lặp khi đang pending.
- Tip, thanh toán, đặt lịch và redemption giữ đúng luồng pending sang confirmed trong đặc tả.
- Form thiếu hoặc sai dữ liệu hiển thị lỗi inline và focus vào trường liên quan.
- Khi CDN tải lỗi, nội dung cốt lõi vẫn hiển thị; text có nghĩa và control native vẫn sử dụng được dù style hoặc icon nâng cao không có.
- Screen target không tồn tại phải fallback an toàn về Home.

## Kiểm thử

Chạy site tĩnh bằng luồng local server hiện có của thư mục `html/`, sau đó kiểm tra trang mới tại các viewport:

- điện thoại 375 x 812;
- tablet 768 x 1024;
- desktop nhỏ 1024 x 768;
- desktop 1440 x 900.

Tại từng viewport liên quan, kiểm tra text bị cắt, horizontal overflow, nội dung bị che, fixed navigation không thao tác được và chuyển cột sai breakpoint.

Chạy end-to-end các luồng demo sau:

- login và OTP;
- onboarding và consent;
- scan và check-in;
- tip từ pending đến confirmed;
- thanh toán trực tiếp từ pending đến confirmed;
- wallet, rewards, cross-redeem và claimed reward;
- booking request và confirmation;
- tìm kiếm Explore và xem chi tiết doanh nghiệp;
- lọc offer, lưu offer và wish alert;
- tạo Look, private feedback, referral, message preferences và profile;
- chuyển EN/VI ngay khi chạy trên các màn gốc, màn chi tiết, modal, toast và form đại diện.

## Tiêu chí nghiệm thu

- `cutomer-reward.html` mở được qua local static server hiện có mà không cần build.
- Có đủ và truy cập được toàn bộ 31 màn hình đã mô tả.
- Các luồng demo chính hiện có tiếp tục hoạt động.
- Mobile và tablet hiển thị bottom navigation; desktop hiển thị sidebar từ 1024px trở lên.
- Không còn khung điện thoại, notch hoặc status bar giả.
- Nhận diện màu đã duyệt vẫn rõ nhưng không bị lạm dụng hiệu ứng glow.
- Icon chức năng dùng Lucide nhất quán.
- Chuyển đổi EN/VI hoạt động mà không reload trang.
- Không viewport nào đã kiểm thử bị horizontal overflow, control bị cắt hoặc nội dung bị fixed navigation che.
- Shared control có keyboard focus, accessible label và reduced-motion behavior.
