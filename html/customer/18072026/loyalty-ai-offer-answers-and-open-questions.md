# NEXORA — Khách hàng thân thiết và đề xuất ưu đãi bằng AI

**Ngày:** 20/07/2026  
**Mục đích:** Tổng hợp các quyết định đã có, các phương án kỹ thuật đã thống nhất và các câu hỏi cần Chủ sản phẩm (PO) xác nhận trước khi ước tính và triển khai.

## 1. Các câu đã có câu trả lời

### 1.1 Chương trình khách hàng thân thiết

1. Điểm được trừ khi khách hàng hoặc nhân viên xác nhận **phát hành phần thưởng**.
2. Việc hoàn điểm cho phần thưởng chưa sử dụng nhưng đã hết hạn hoặc bị Quản lý hủy là **cấu hình của doanh nghiệp**.
3. Việc phục hồi phần thưởng sau khi hoàn tiền tuân theo **chính sách của Chủ doanh nghiệp** và phải được hiển thị trước khi xác nhận.
4. Khi hoàn tiền một phần, điểm đã tích được thu hồi dựa trên **phần chi tiêu ròng đủ điều kiện được hoàn**.
5. Chủ doanh nghiệp cấu hình theo từng phần thưởng việc phần thưởng đó có được kết hợp với chương trình khuyến mãi hay không.
6. Quyền lợi của gói trả trước và phần thưởng Dịch vụ/Sản phẩm miễn phí không được thanh toán cho cùng một dòng hàng hoặc dịch vụ.
7. Phạm vi sử dụng tại nhiều cơ sở được cấu hình theo từng phần thưởng:
   - Chỉ cơ sở phát hành
   - Một số cơ sở được chọn thuộc cùng doanh nghiệp
   - Tất cả cơ sở thuộc cùng doanh nghiệp
8. Thẻ quà tặng mua bằng điểm được xem là **giá trị tiền tệ lưu trữ** và có thể còn số dư sau khi sử dụng.
9. Phần thưởng giảm giá theo phần trăm bắt buộc phải có mức giảm tối đa.
10. Chủ doanh nghiệp cấu hình thời điểm Điểm chờ chuyển thành Điểm khả dụng, ví dụ ngay sau thanh toán hoặc sau một khoảng tạm giữ.
11. Thuế và tiền boa không được tích điểm nếu Chủ doanh nghiệp không bật. Phần thanh toán bằng phần thưởng không được tích điểm. Hàng bán lẻ và giao dịch mua thẻ quà tặng có thể được cấu hình điều kiện tích điểm.
12. Thanh toán với tư cách khách có thể được liên kết sau bằng cùng số điện thoại đã xác minh để nhận các điểm đang chờ.

### 1.2 Đề xuất ưu đãi bằng AI

1. Mong muốn của khách hàng được nhập tại **Ưu đãi và danh sách mong muốn → Bạn mong muốn điều gì?** trong ứng dụng khách hàng.
2. Mong muốn được hiển thị cho doanh nghiệp dưới dạng nhu cầu đã gom nhóm và ẩn danh.
3. Trong Giai đoạn 1, AI chỉ tạo bản nháp. Chủ doanh nghiệp phải xem xét và xác nhận trước khi đăng.
4. Chủ doanh nghiệp quyết định giá, mức giảm và lịch chạy cuối cùng.
5. Bản mẫu sử dụng nhu cầu khách hàng, giá dịch vụ hiện tại và giờ vắng để giải thích đề xuất.
6. Việc bỏ qua một đề xuất được ghi nhận làm tín hiệu để hệ thống học và cải thiện.
7. Khách hàng có thể tắt đề xuất AI trong phần tùy chọn thông báo và quyền riêng tư.
8. Cần có đặc tả chức năng, mô hình dữ liệu/API và tiêu chí nghiệm thu kiểm thử riêng trước khi có thể ước tính đáng tin cậy.

## 2. Các câu hỏi cần Chủ sản phẩm xác nhận

### 2.1 Chương trình khách hàng thân thiết

1. Chủ sản phẩm đã chính thức duyệt việc trừ điểm tại thời điểm phát hành phần thưởng là chính sách cuối cùng chưa?
2. Mặc định có hoàn điểm khi phần thưởng chưa sử dụng bị hết hạn không?
3. Mặc định có hoàn điểm khi Quản lý hủy phần thưởng chưa sử dụng không?
4. Khi hoàn tiền hóa đơn đã dùng phần thưởng, hệ thống phải phục hồi phần thưởng, hoàn điểm hay giữ nguyên?
5. Giá trị mặc định và giới hạn tối đa cho mức giảm của phần thưởng giảm giá theo phần trăm là bao nhiêu?

### 2.2 Đề xuất ưu đãi bằng AI

1. Khách hàng có phải đồng ý rõ ràng trước khi dữ liệu mong muốn được dùng để tạo thông tin nhu cầu cho doanh nghiệp không?
2. Cần tối thiểu bao nhiêu khách hàng trước khi hiển thị thông tin nhu cầu để tránh suy ra danh tính?
3. Bán kính nhu cầu 10 dặm là cố định hay Chủ doanh nghiệp có thể cấu hình?
4. Nhu cầu được tính từ dữ liệu trong 7, 30 hay 90 ngày?
5. AI được phép sử dụng những nguồn dữ liệu thực tế nào: giá dịch vụ, lịch sử đặt lịch, lịch còn trống và giờ vắng?
6. Quy tắc bảo vệ đối với giá tối thiểu, lợi nhuận tối thiểu và mức giảm tối đa là gì? Ai có quyền duyệt ngoại lệ?
7. Số lượt sử dụng dự kiến, giá trị hóa đơn trung bình và tỷ lệ quay lại được tính bằng công thức hoặc mô hình nào?
8. Chủ doanh nghiệp có thể hoàn tác việc bỏ qua đề xuất không? Quyết định bỏ qua được lưu làm tín hiệu học trong bao lâu?

## 3. Các quyết định kỹ thuật đề xuất đã thống nhất

### 3.1 Chương trình khách hàng thân thiết

1. **Hoàn tiền một phần:** Thu hồi điểm theo các dòng hàng hoặc dịch vụ thực sự được hoàn tiền. Nếu chỉ hoàn một phần của một dòng, thu hồi theo tỷ lệ chi tiêu ròng đủ điều kiện của dòng đó; không phân bổ theo tổng toàn hóa đơn.
2. **Thẻ quà tặng và thuế:** Áp dụng giảm giá trước, tính thuế trên số tiền chịu thuế, sau đó mới dùng thẻ quà tặng để thanh toán. Thẻ quà tặng là phương thức thanh toán, không phải khoản giảm giá.
3. **Mô hình dữ liệu thẻ quà tặng:** Việc phát hành phần thưởng tạo một thẻ quà tặng riêng có số dư, sổ giao dịch và trạng thái. `RewardInstrument` chỉ lưu liên kết tới thẻ quà tặng được tạo.
4. **Điểm chờ:** Giao dịch tại điểm bán đã xác nhận thì điểm chuyển thành khả dụng ngay. Thanh toán bên ngoài hoặc giao dịch có rủi ro cao tiếp tục ở trạng thái `Pending` trong khoảng tạm giữ được cấu hình.
5. **Mặc định tích điểm:** Dịch vụ và hàng bán lẻ được tích điểm. Thuế, tiền boa, giao dịch mua thẻ quà tặng, phần được thanh toán bằng phần thưởng và phần được thanh toán bằng gói trả trước không được tích điểm.

### 3.2 Đề xuất ưu đãi bằng AI

1. **Đối tượng nghiệp vụ:** AI tạo bản ghi đề xuất hoặc bản nháp (`OfferSuggestion`/`OfferDraft`). Sau khi Chủ doanh nghiệp duyệt, hệ thống mới chuyển bản nháp thành chương trình khuyến mãi (`Promotion`).
2. **Kết hợp ưu đãi:** Mặc định không cho phép kết hợp. Chỉ cho phép khi cả chương trình khuyến mãi và phần thưởng khách hàng thân thiết đều bật quyền kết hợp. Quyền lợi gói trả trước và phần thưởng Dịch vụ miễn phí không được áp dụng trên cùng một dòng dịch vụ.
3. **Điều kiện hiển thị số liệu dự kiến:** Chỉ hiển thị số liệu tài chính dự kiến khi có tối thiểu 30 giao dịch lịch sử phù hợp và độ tin cậy đạt ngưỡng cấu hình. Nếu không đủ dữ liệu, hiển thị “Chưa đủ dữ liệu” thay cho con số dự báo.
4. **Giới hạn thông báo:** Thông báo ưu đãi phù hợp do AI đề xuất dùng chung giới hạn tiếp thị: tối đa 1 thông báo mỗi tuần và 4 thông báo mỗi tháng cho một khách hàng. Khách hàng có thể tắt bất kỳ lúc nào.
5. **Nhật ký kiểm tra:** Lưu ảnh chụp dữ liệu đầu vào, nguồn dữ liệu, mô hình và phiên bản, đề xuất ban đầu, độ tin cậy, các chỉnh sửa của Chủ doanh nghiệp, bước phê duyệt, nội dung đã đăng, hành động bỏ qua, người thực hiện và thời gian.

## 4. Mức độ sẵn sàng để ước tính

- **Chương trình khách hàng thân thiết:** Thiết kế kỹ thuật chính đã rõ hơn; vẫn cần Chủ sản phẩm xác nhận chính sách hoàn điểm, xử lý phần thưởng khi hoàn tiền và giới hạn giảm giá theo phần trăm.
- **Đề xuất ưu đãi bằng AI:** Chưa sẵn sàng để ước tính đáng tin cậy. Vẫn cần xác nhận sự đồng ý/quyền riêng tư, phạm vi nhu cầu, nguồn dữ liệu, quy tắc bảo vệ giá, mô hình ước tính và hành vi Hoàn tác; sau đó phải hoàn thiện đặc tả chức năng, mô hình dữ liệu/API và tiêu chí nghiệm thu kiểm thử.
