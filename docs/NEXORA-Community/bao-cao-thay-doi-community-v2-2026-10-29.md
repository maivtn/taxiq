# Báo cáo thay đổi HTML demo Community v2

**Cập nhật: Oct 29, 2026**

Tổng hợp các thay đổi từ HTML mẫu PO ngày 16/10 đến bản demo hiện tại, gồm phần bổ sung từ staging, hoàn thiện UI và dữ liệu mẫu.

## 1. HTML PO thiếu so với staging và phần đã bổ sung

Các điểm thiếu dưới đây thuộc HTML mẫu của PO; cột bên phải ghi phần đã triển khai trong HTML demo.

| Phần | HTML PO còn thiếu so với staging | Đã bổ sung trong HTML demo |
| --- | --- | --- |
| **Feed** | Thẻ tổng hợp chủ yếu có nội dung và nút mở bài gốc; chưa đủ bố cục người đăng và tương tác. | Thêm người đăng, avatar, nhãn doanh nghiệp, ngày đăng, nơi đăng và ảnh. Bổ sung thích, bình luận, trả lời; sửa/xóa bài và bình luận theo quyền, báo cáo bài/bình luận; quảng bá bài theo gói trong demo. |
| **Đăng bài Feed** | Form PO chưa bao phủ đầy đủ ảnh, nơi đăng và bản nháp như các luồng staging. | Bổ sung chọn tối đa 6 ảnh, xem trước/xóa ảnh, xác nhận quyền sử dụng ảnh; chọn Feed hoặc nhóm đã tham gia; lưu, mở lại, đăng và xóa bản nháp. Các form mở trực tiếp trên một màn theo UI PO. |
| **Mua bán trên Feed** | Thiếu thao tác liên hệ và cập nhật trạng thái ngay tại bài trên Feed. | Thêm **Nhắn người bán** cho người xem; **Đánh dấu đã bán/đã mua** cho chủ bài. Dùng chung bản ghi với mục Mua bán để trạng thái cập nhật đồng thời. |
| **Nhóm** | Chưa đầy đủ bảng tin nhóm, quản lý nhóm và kết nối sang chat/thành viên. | Thêm lọc khu vực, chủ đề, loại nhóm; xem bài gần đây và Feed theo nhóm; tham gia/rời nhóm, sửa/xóa nhóm theo quyền. Nối chat nhóm sang Connect; đồng bộ thành viên, lời mời và quyền quản lý. |
| **Việc làm** | HTML mẫu tập trung vào đăng tin và liên hệ; thiếu hồ sơ nghề nghiệp, ứng tuyển, quản lý ứng viên và các trạng thái tin. | Thêm hồ sơ thợ, kỹ năng, portfolio, quyền riêng tư; ứng tuyển/hủy đơn, danh sách đã ứng tuyển; xem ứng viên và mời phỏng vấn. Bổ sung lưu việc, lưu nháp, sửa và đóng tin; các mục Đang tuyển/Nháp/Chờ duyệt/Đã đóng. Thêm kiểu lương, mức lương tuần, hình thức làm việc và tối đa 6 ảnh. |
| **Phân quyền Việc làm** | Hai lựa chọn Hiring/Seeking work trong HTML PO chưa thể hiện đầy đủ quyền tài khoản của staging. | Hiển thị rõ cả hai nút; tài khoản business đăng tuyển, tài khoản staff/personal đăng tìm việc. Lựa chọn không phù hợp được vô hiệu hóa và có nhãn tài khoản tương ứng. |
| **Ca làm thêm** | HTML mẫu mới có đăng cần người/rảnh nhận ca và liên hệ; thiếu quy trình xử lý ca. | Thêm lịch rảnh, tìm người phù hợp, mời/nhận/duyệt ca, check-in, xác nhận hoàn thành, hủy và lịch sử ca. Bổ sung các màn cọc, chứng từ Zelle, xác nhận nhận tiền, hoàn tiền, tranh chấp và lịch sử thanh toán dưới dạng mô phỏng trong trình duyệt. |
| **Connect** | Chưa đủ quản lý nhóm, lời mời, thao tác từng tin nhắn và quyền liên hệ như staging. | Bổ sung nhóm riêng/nhóm tiệm/nhóm cộng đồng, quản lý thành viên và lời mời, rời nhóm; trả lời, reaction, ghim, báo cáo và tìm trong hội thoại. Hoàn thiện chặn/bỏ chặn, nickname, quyền tìm/liên hệ và trạng thái cuộc gọi mô phỏng. |

## 2. Các thay đổi UI và thao tác từ HTML PO

| Khu vực | Đã thay đổi |
| --- | --- |
| **Khung Community** | Đưa điều hướng Community vào khung HTML trực tiếp; bỏ lớp iframe bao ngoài trong luồng chính. Đồng bộ khoảng cách hai bên nội dung, giảm tiêu đề/mô tả lặp trên mobile và bỏ cụm thông báo/chat/ngôn ngữ đã có ở header. |
| **Thanh điều hướng** | Sửa trạng thái active của Groups & Market và vị trí nhãn NEW. Mobile dùng các ô cùng chiều cao, icon và nhãn thẳng hàng; mỗi mục có màu active riêng và hiệu ứng nổi rõ hơn. |
| **Icon** | Đồng bộ icon Feed, Groups, Pages và các tab theo cách nhận diện quen thuộc. Đổi icon vị trí, Settings, Groups/Buy & sell; các nút thao tác dùng Lucide. Hiring/Seeking work chuyển từ thẻ lớn sang nút gọn có icon Lucide. |
| **Feed** | Bố trí lại phần tên người đăng, loại bài, nhãn doanh nghiệp, ngày và nơi đăng. Bộ lọc bài chuyển thành select có icon; bỏ nền, border và padding của khung ngoài bộ lọc; đưa My groups sang bên phải. |
| **Các nút trên bài** | Gom các thao tác liên quan vào cùng hàng và tự xuống dòng theo chiều rộng. Giảm kích thước nút, thêm icon và màu phân biệt; Details màu xanh, lưu việc màu tím, hồ sơ thợ màu xanh ngọc. |
| **Tạo bài nhanh** | Cho các nút Work photos/Tips/Ask/Poll/Events/List for sale/Post a job/Write blog tự xuống hàng để tránh bị cắt hoặc che khuất. |
| **Industry groups** | Sửa nguyên nhân lệch bố cục: khối filter bị chèn thành cột riêng, đẩy danh sách nhóm vào cột hẹp. Đưa filter về trong cột danh sách; danh sách nhóm nằm bên trái, phần phụ bên phải; desktop hai cột thẻ, điện thoại một cột. |
| **Mua bán** | Thu gọn bộ lọc, mở thêm khi bấm Filters. Dùng ảnh sản phẩm cho các tin có ảnh, bỏ hình minh họa thay thế khi không có ảnh. |
| **Việc làm** | Gom Browse Jobs/My Posts thành cụm tab gần nhau ở bên trái; thu gọn Hiring/Seeking work. Đưa chip trạng thái sang trái, ô search ngắn và nút **Filters** sang phải; lọc ngành/tiểu bang trong phần mở rộng cạnh search. |
| **Deal & Coupon** | Thêm tìm theo nội dung ưu đãi và bộ lọc ngành/khu vực. Hiển thị số điều kiện đang lọc và trạng thái không có kết quả phù hợp. Recent deals và danh sách ưu đãi dùng hai cột trên desktop, một cột trên điện thoại. |
| **Fanpage** | Sửa phần avatar/tên/thông tin trang bị đè lên ảnh bìa hoặc lệch hàng. Giảm khoảng trống phần mở đầu trên mobile; hoàn thiện hiển thị bài cập nhật, ảnh, ưu đãi và bài lên lịch trong trang. |
| **Vị trí và nhãn trạng thái** | Đưa Change area sát Houston, phân biệt nhãn vị trí với liên kết bằng kiểu chữ và bỏ icon lặp. Các badge Hiring/Seeking work và nhãn tương tự co theo nội dung thay vì kéo hết chiều rộng. |
| **Modal và Back** | Đồng bộ khoảng cách, bố cục form và vùng nút thao tác. Modal Connect có phần nội dung cuộn riêng, header/footer nằm trong khung màn hình. Sửa Back để đóng lần lượt popup, bảng thành viên rồi mới rời hội thoại. |
| **Dữ liệu dùng chung** | Đồng bộ bài gốc giữa Feed, Mua bán, Nhóm, Việc làm, Ca làm, Fanpage, Deal và Blog. Bổ sung cơ chế gộp thay đổi giữa các màn để tránh ghi đè dữ liệu khi mở nhiều nơi. |

## 3. Dữ liệu mẫu bổ sung trong lượt cập nhật mới

| Phần | Trước lượt bổ sung | Sau lượt bổ sung | Nội dung thêm |
| --- | ---: | ---: | --- |
| **Feed, gồm Deal & Coupon** | 24 bài | **62 bài** | Thêm 32 bài gắn đúng nhóm và 6 ưu đãi. Có bài viết, ảnh mẫu, mẹo nghề, hỏi đáp, bình chọn và sự kiện; bổ sung lượt thích và bình luận mẫu cho một số bài. |
| **Deal & Coupon** | 8 ưu đãi | **14 ưu đãi** | Thêm ưu đãi nail, tóc, cà phê và vật tư; liên kết đúng Fanpage, mã, điều kiện sử dụng và hạn dùng. Số lượng này nằm trong tổng Feed ở trên. |
| **Mua bán** | 16 tin | **24 tin** | Thêm ghế chờ, đèn, bàn cà phê và nhu cầu mua; có ảnh sản phẩm, giá/số lượng/khu vực rõ ràng. Bổ sung mẫu đã mua để mục tin của tôi có cả trạng thái mở và hoàn tất. |
| **Industry groups** | 12 nhóm | **16 nhóm** | Thêm nhóm cà phê, tóc, vật tư và chợ Austin; điền mô tả/nội quy còn trống. Mỗi nhóm có ít nhất hai bài mẫu để mở chi tiết và Feed nhóm. |
| **Fanpage** | 8 trang | **14 trang** | Thêm River Nails, Garden Cafe, Studio Supply Dallas, Bella Hair Room, Bếp Nhà Austin và North Studio Supply; có bìa, giờ mở cửa, mô tả, khu vực và nút liên hệ. |
| **Bài cập nhật Fanpage** | 16 bài | **42 bài** | Mỗi trang có ba bài cập nhật, dùng ảnh và nội dung theo đúng loại hình kinh doanh. |
| **Việc làm** | 12 tin | **30 tin** | Thêm 12 tin tuyển/tìm việc và 6 tin mẫu ở trạng thái nháp/chờ duyệt/đã đóng, mỗi trạng thái hai tin. Bổ sung ngành Khác, ảnh trong tin, hồ sơ và ứng viên mẫu theo vị trí tuyển. |
| **Ca làm thêm** | 12 tin | **28 tin** | Thêm 12 tin cần người/rảnh nhận ca, hai ca đã qua và hai ca đã hủy. Bổ sung hai hồ sơ ca hoàn thành cùng bốn bản ghi cọc/thanh toán đã xác nhận trong demo để lịch sử có dữ liệu. |
| **Blog** | 8 bài | **14 bài** | Thêm nội dung Công nghệ, Quản lý tiệm, Kinh doanh và Khác; bổ sung bài đọc đầy đủ, ảnh bìa và tác giả. |
| **Connect** | 2 hội thoại gần đây, 5 cuộc gọi mẫu | **8 hội thoại gần đây, 12 cuộc gọi mẫu** | Thêm sáu hội thoại có nội dung trao đổi, bảy người/tài khoản trong danh bạ và hai nhóm chat riêng có thành viên/tin nhắn mẫu. Các nhóm cộng đồng có nội dung mở đầu khi vào chat. |

Dữ liệu mới dùng ID cố định và được bổ sung vào dữ liệu đang lưu. Những bản ghi đã chỉnh sửa, trạng thái đã xử lý, tin đã xóa/ẩn và thành viên đã rời nhóm được xử lý theo kho dữ liệu hiện có; bổ sung phiên bản tải tài nguyên mới để trình duyệt nhận bản cập nhật.
