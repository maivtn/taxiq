## So sánh màn hình Turnboard

**Cập nhật:** 3 tháng 11 năm 2026  
**Đối tượng:** PO, BA, thiết kế và phát triển  
**Trạng thái:** Bản đối chiếu để rà soát

### Tóm tắt nhanh

Bảng chỉ gồm 6 HTML có màn hình Turnboard. Các trang menu và giới thiệu đã được bỏ khỏi phạm vi so sánh. Bảng HTML kèm theo có ảnh nhúng, bộ lọc và chức năng phóng to ảnh. Các ghi nhận mô tả bản mẫu PO, không xác nhận hành vi production.

[Mở bảng so sánh có ảnh và liên kết đến các HTML gốc](so-sanh-turnboard.html)

### Tổng quan

Bảng đối chiếu giúp chọn bố cục và xác định khác biệt về luật xếp lượt, giao khách, tay nghề và vị trí thực hiện. Lễ tân dùng Turnboard để giao khách; quản lý và chủ tiệm thiết lập luật, tay nghề và điều chỉnh lượt. Nội dung dựa trực tiếp vào 6 HTML có màn hình Turnboard.

### Khái niệm chính

| Khái niệm | Ý nghĩa trong bảng |
| --- | --- |
| Lượt phục vụ (turn) | Đơn vị so sánh mức phục vụ giữa các thợ; mỗi nhóm prototype có cách quy đổi riêng. |
| Prototype | Giao diện có dữ liệu mẫu, có thể có thao tác trong trình duyệt; chưa chứng minh tích hợp sản phẩm thật. |
| Đặc tả | Yêu cầu được viết trong tài liệu. |

### Vai trò người dùng

| Vai trò | Trách nhiệm trong phạm vi đối chiếu |
| --- | --- |
| Lễ tân | Xem khách chờ, chọn dịch vụ và giao thợ. |
| Quản lý / chủ tiệm | Thiết lập luật, tay nghề và điều chỉnh lượt. |
| Thợ | Vào ca và nhận khách theo trạng thái, tay nghề và luật của tiệm. |
| PO / BA / thiết kế | Chọn bố cục và chốt các khác biệt giữa tài liệu. |

### Luồng nghiệp vụ

#### Luồng: Giao khách từ hàng chờ

**Vai trò chính:** Lễ tân  
**Bắt đầu:** Có khách chờ và thợ đã vào ca.  
**Kết quả:** Dịch vụ được giao cho thợ, lượt được ghi theo công thức của bản mẫu.

**Câu chuyện người dùng:**

- Là lễ tân, tôi muốn xem thợ đủ điều kiện để giao khách phù hợp.
- Là lễ tân, tôi muốn chọn thợ khác khi thợ tiếp theo không phù hợp để khách tiếp tục được phục vụ.

| Bước | Ai thực hiện | Thao tác | Kết quả thể hiện trong tài liệu |
| --- | --- | --- | --- |
| 1 | Lễ tân | Nhận khách | Khách xuất hiện trong danh sách chờ. |
| 2 | Lễ tân / bản mẫu | Xem trạng thái, kỹ năng và thứ tự thợ | Hiển thị thợ hoặc gợi ý đủ điều kiện; phạm vi khác nhau theo từng bản. |
| 3 | Lễ tân | Chọn dịch vụ, thợ và vị trí nếu có | Bản mẫu lưu phần giao việc. |
| 4 | Bản mẫu | Ghi lượt và lịch sử nếu có | Cách tính và khả năng hoàn tác khác nhau; xem bảng so sánh. |

```mermaid
flowchart TD
    A([Có khách đang chờ]) --> B[Lễ tân xem hàng thợ]
    B --> C{Thợ phù hợp dịch vụ?}
    C -- Có --> D[Chọn thợ và dịch vụ]
    C -- Không --> E[Chọn thợ phù hợp khác]
    E --> D
    D --> F[Ghi nhận lượt phục vụ]
    F --> G([Khách được phục vụ])
```

### Cấu hình và quản lý

- Là quản lý, tôi muốn so sánh luật tính lượt và điều kiện tay nghề để chọn cấu hình phù hợp cho tiệm.
- Là quản lý, tôi muốn biết đâu là thao tác có trong mẫu và đâu là nội dung mới chỉ mô tả để chốt phạm vi triển khai.

### Vòng đời trạng thái

Các trạng thái sau được viết trong tài liệu Developer Handoff; đây chưa phải trạng thái đầy đủ đã có ở mọi prototype.

| Trạng thái hiện tại | Sự kiện | Trạng thái tiếp theo |
| --- | --- | --- |
| Chưa đến | Khách check-in | Đang chờ |
| Đang chờ | Giao thợ hợp lệ | Đã giao thợ |
| Đã giao thợ | Bắt đầu dịch vụ | Đang phục vụ |
| Đang phục vụ | Hoàn tất dịch vụ | Chờ thanh toán |
| Chờ thanh toán | Thanh toán thành công | Hoàn tất |
| Chưa đến | Khách không tới | Không đến |
| Đang chờ | Hủy phiếu | Đã hủy |

```mermaid
stateDiagram-v2
    [*] --> ChuaDen
    ChuaDen --> DangCho : Khách check-in
    ChuaDen --> KhongDen : Khách không tới
    DangCho --> DaGiaoTho : Giao thợ
    DangCho --> DaHuy : Hủy phiếu
    DaGiaoTho --> DangPhucVu : Bắt đầu dịch vụ
    DangPhucVu --> ChoThanhToan : Hoàn tất dịch vụ
    ChoThanhToan --> HoanTat : Thanh toán thành công
    HoanTat --> [*]
    DaHuy --> [*]
    KhongDen --> [*]
    state "Chưa đến" as ChuaDen
    state "Đang chờ" as DangCho
    state "Đã giao thợ" as DaGiaoTho
    state "Đang phục vụ" as DangPhucVu
    state "Chờ thanh toán" as ChoThanhToan
    state "Hoàn tất" as HoanTat
    state "Đã hủy" as DaHuy
    state "Không đến" as KhongDen
```

### Quy tắc đọc bảng

1. Ảnh UI là ảnh chụp HTML đã mở, không phải ảnh được vẽ lại.
2. Nhận định về tính năng chỉ thuộc bản mẫu hoặc đặc tả; không tự suy thành tính năng production.
3. Cột cuối ghi khác biệt và giới hạn ở đúng file liên quan.















Thứ tự hiển thị: từ mới đến cũ theo ngày tài liệu đã xác nhận. Số # tăng từ cũ đến mới: #1 là bản cũ nhất, #6 là bản mới nhất.
Ngày đính kèm lấy từ nội dung HTML hoặc thông tin đã xác nhận. Ngày dữ liệu demo được ghi riêng và không dùng để xác định phiên bản mới hay cũ.

### Bảng so sánh UI và tính năng

| Mã / file | Ảnh Turnboard | Tính năng | Khác biệt và giới hạn |
| --- | --- | --- | --- |
| **#6 · POS V34 · Stations**<br>Ngày tài liệu: 12 tháng 10 năm 2026 (đã xác nhận) | [![Turnboard](images/06-focus.png)](images/06-focus.png) | Giữ 4 luật tính lượt, Clock in/out, tay nghề, giao dịch vụ, lịch sử và hoàn tác.<br>Bổ sung chọn ghế, bàn hoặc phòng khi giao dịch vụ từ Turnboard.<br>Có chế độ tự chọn vị trí trống đúng loại; vị trí gắn với phiếu dịch vụ. | So với #1, phần dựng UI Turnboard chỉ thêm lựa chọn Station. Luồng giao dịch vụ còn bổ sung giữ vị trí cho phiếu.<br><br>Trường Station phụ thuộc cấu hình vị trí. Đây vẫn là dữ liệu mẫu; khóa vị trí và chống xung đột giữa nhiều máy chưa được xác minh trên server. |
| **#5 · POS feedback · Products & Other Sales**<br>Ngày tài liệu: 9 tháng 10 năm 2026 (đã xác nhận) | [![Turnboard](images/05-focus.png)](images/05-focus.png) | Cùng thẻ thợ, Clock in/out và biểu mẫu giao khách như #1.<br>Cùng 4 cách tính lượt, kiểm tra tay nghề, lịch sử lượt và Undo. | Phần dựng giao diện Turnboard giống hệt #1. Hai file vẫn khác nhau ở các phần khác của ứng dụng.<br><br>Cùng giới hạn lưu dữ liệu demo và xác thực vai trò của #1. Không dùng tên file để suy ra Turnboard đã được nâng cấp. |
| **#4 · Front Desk · bản (1)**<br>Ngày tài liệu: 7 tháng 9 năm 2026 (đã xác nhận) | [![Turnboard](images/03-focus.png)](images/03-focus.png) | Giữ 3 cách xem, lọc thợ, thêm/chỉnh lượt và mục tiêu như bản gốc.<br>Thẻ Next Turn có số liệu chi tiết và nút View Technician.<br>Cửa sổ giao khách tách System recommendation và Final assignment; giữ thông tin thợ khách đã đặt.<br>Với nhiều dịch vụ, gợi ý một thợ làm toàn bộ hoặc chia dịch vụ cho nhiều thợ; giải thích thợ bị bỏ qua vì tay nghề vẫn giữ lượt. | Bản rõ nhất trong nhóm Front Desk về thợ tiếp theo và gợi ý giao nhiều dịch vụ. Các số liệu của thợ xuất hiện ngay trên thẻ chính.<br><br>Luật tính lượt có cùng giới hạn như bản gốc: Save Rules chưa cập nhật công thức. Chia dịch vụ và bảo vệ lượt là mô phỏng; chưa chứng minh luồng thanh toán và lượt khớp hoàn toàn. |
| **#3 · Front Desk · bản gốc**<br>Ngày tài liệu: 4 tháng 9 năm 2026 (đã xác nhận) | [![Turnboard](images/02-focus.png)](images/02-focus.png) | Hiển thị lượt, số dịch vụ, tổng tiền dịch vụ và tiến độ mục tiêu của từng thợ.<br>Tìm thợ, lọc trạng thái và đổi giữa 3 cách xem; có dữ liệu mẫu cho tiệm lớn.<br>Có giao khách tiếp theo, chỉnh lượt, thêm lượt có lý do và màn hình tính lượt theo giá trị dịch vụ.<br>Cửa sổ giao khách có thợ, lý do bỏ lượt, ghế/bàn/phòng, ghi chú và lựa chọn in phiếu. | Cho thấy Turnboard nằm trong toàn bộ luồng Front Desk. Khối Next Turn gọn hơn bản (1).<br><br>Nút Save Rules chỉ đóng cửa sổ và báo đã lưu; công thức vẫn cố định trong bản mẫu. Luồng Assign Next Guest cộng 1 lượt, chưa áp dụng đồng nhất công thức theo giá trị. |
| **#2 · TurnBoardBanMau**<br>Ngày tài liệu: 25 tháng 8 năm 2026 (đã xác nhận) | [![Turnboard](images/01-focus.png)](images/01-focus.png) | Xếp thợ theo số lượt tăng dần, sau đó theo thứ tự check-in.<br>Giao từng dịch vụ cho thợ; tự đề xuất theo tay nghề, trạng thái rảnh và lựa chọn ưu tiên của tiệm.<br>Có 5 cách tính lượt: thời gian, bảng dịch vụ, ngưỡng giá, bậc giá và đầu khách.<br>Có luật riêng cho khách chỉ định và khách hẹn; hồ sơ tay nghề, gọi thợ và hoàn tác lần giao gần nhất. | Tập trung sâu vào luật xếp lượt. Linh hoạt hơn các bản POS về cách tính lượt và ưu tiên tự chọn thợ.<br><br>Dữ liệu lưu trong trình duyệt. Gọi qua app chỉ ghi nhận mô phỏng; thông báo thật và Viber chưa được xác minh. Ảnh dùng dữ liệu mẫu: 6 thợ, 3 người đã check-in. |
| **#1 · POS feedback · prototype (1)**<br>Ngày tài liệu: 16 tháng 7 năm 2026 (đã xác nhận) | [![Turnboard](images/04-focus.png)](images/04-focus.png) | Chỉ đưa thợ đã Clock in vào hàng; xếp theo ít lượt nhất rồi theo thứ tự vào ca.<br>Chọn khách đã check-in, nhóm dịch vụ, dịch vụ và thợ đủ tay nghề.<br>Có 4 cách tính lượt: đầu khách, dịch vụ, thời gian và bậc giá; Owner đổi luật và cấp tay nghề.<br>Giao dịch vụ ghi lịch sử lượt; Undo tạo một dòng hoàn tác và trả lại lượt. | Dùng làm bản đối chiếu nền của nhóm POS. #5 có cùng Turnboard; #6 bổ sung vị trí thực hiện.<br><br>Không có bộ Compact / Cards / Turn Grid như #3–4. Dữ liệu demo ở trong phiên trình duyệt; PIN vai trò là mô phỏng, chưa phải xác thực server. |

### Ma trận tính năng Turnboard

| Tiêu chí | #6 · POS V34 · Stations<br>12 tháng 10 năm 2026 | #5 · POS feedback · Products & Other Sales<br>9 tháng 10 năm 2026 | #4 · Front Desk · bản (1)<br>7 tháng 9 năm 2026 | #3 · Front Desk · bản gốc<br>4 tháng 9 năm 2026 | #2 · TurnBoardBanMau<br>25 tháng 8 năm 2026 | #1 · POS feedback · prototype (1)<br>16 tháng 7 năm 2026 |
| --- | --- | --- | --- | --- | --- | --- |
| Cách hiển thị | Thẻ thợ + biểu mẫu | Thẻ thợ + biểu mẫu | Compact / Cards / Grid | Compact / Cards / Grid | Danh sách / Thẻ | Thẻ thợ + biểu mẫu |
| Thợ tới lượt kế tiếp | Giống #1 | Giống #1 | Thẻ chi tiết + Upcoming | Thanh Next Turn | Khối nổi bật + hàng chờ | Thẻ #1 nổi bật |
| Cách tính lượt | Giống #1 | Giống #1 | Như #3 | Theo giá trị; cấu hình mô phỏng | 5 cách + luật khách chỉ định / hẹn | 4 cách; Owner chọn |
| Tay nghề | Giống #1 | Giống #1 | Như #3 + gợi ý nhiều dịch vụ | Cấp thợ + dịch vụ được phép | Theo từng dịch vụ; 3 mức | Theo nhóm dịch vụ; 3 mức |
| Giao khách nhiều dịch vụ | Giống #1 | Giống #1 | Gợi ý một thợ / chia dịch vụ | Chọn thợ trong cửa sổ giao khách | Chọn thợ cho từng dịch vụ | Một dịch vụ mỗi thao tác |
| Ghế / bàn / phòng | Có Station; tự chọn / chọn tay | Không có ở biểu mẫu Turnboard | Có trường vị trí + ghi chú khách | Có trường vị trí | Không có trường riêng trong giao khách | Không có ở biểu mẫu Turnboard |
| Sửa lượt / hoàn tác | Giống #1 | Giống #1 | Như #3 | Add Turn / Edit Turn có lý do | Hoàn tác lần giao gần nhất | Undo ghi dòng hoàn tác |
| Doanh thu / mục tiêu | Giống #1 | Giống #1 | Đưa số liệu lên thẻ Next Turn | Tổng dịch vụ + mục tiêu thợ | Doanh thu + trung bình mỗi lượt | Hiển thị số lượt trên hàng thợ |
| Thử tiệm lớn | Không có bộ tương ứng | Không có bộ tương ứng | Có bộ 50 thợ / 36 khách chờ | Có bộ 50 thợ / 36 khách chờ | Không có bộ 50 thợ riêng | Không có bộ tương ứng |

### Vì sao POS feedback và V34 gần giống nhau?

| Phần Turnboard | POS feedback #1 | V34 #6 |
| --- | --- | --- |
| Thẻ thợ, hàng chờ, luật tính lượt | Bố cục nền | Cùng bố cục và logic |
| Biểu mẫu giao khách | Khách, nhóm dịch vụ, dịch vụ, thợ | Thêm Station |
| Vị trí thực hiện | Không có trong biểu mẫu này | Chọn hoặc tự chọn ghế, bàn, phòng; gắn vào phiếu |

Khi tắt quản lý vị trí, trường Station bị ẩn nên V34 gần như giống bản feedback. Phần dựng Turnboard của #1 và #5 giống hệt nhau.

### Ví dụ — chỉ minh họa, không phải cấu hình đã chốt

| Tình huống | #3–4 theo công thức có sẵn | #1, #5 và #6 khi chọn luật theo giá |
| --- | --- | --- |
| Dịch vụ trị giá $50 | 1 lượt | 0,5 lượt |

### Tiêu chí hoàn thành bản đối chiếu

- Bảng chính chỉ có 6 file có màn hình Turnboard.
- Ảnh chính tập trung vào đúng vùng Turnboard.
- Khác biệt được xét trên màn hình và luồng Turnboard.
- File có cùng phần dựng Turnboard được ghi rõ.

### Ngoại lệ

| Trường hợp | Cách đọc | Phụ trách |
| --- | --- | --- |
| #1 và #5 có cùng Turnboard | Giữ hai nguồn, không tính là hai thiết kế khác nhau | PO / thiết kế |
| V34 tắt quản lý vị trí | Station bị ẩn; UI gần giống #1 | PO / thiết kế |
| Nút có trên UI nhưng chưa đổi công thức | Đọc giới hạn ở đúng dòng | PO / phát triển |

### Câu hỏi thường gặp

**6 file có phải 6 thiết kế hoàn toàn khác nhau không?**  
Không. Chúng thuộc 3 nhóm giao diện; #1 và #5 có cùng phần dựng Turnboard. V34 chỉ bổ sung vị trí trên nền nhóm POS.

### Tính năng liên quan

- Check-in cung cấp khách chờ; hồ sơ thợ cung cấp tay nghề.
- Phiếu dịch vụ lưu thợ, dịch vụ và vị trí được giao.

### Phụ lục

#### Nội dung cần PO chốt

| Nội dung | Quyết định cần đưa ra | Phụ trách |
| --- | --- | --- |
| Bố cục | Turnboard riêng, Front Desk hoặc nhóm POS | PO / thiết kế |
| Công thức lượt | Cách quy đổi và luật cho khách chỉ định / hẹn | PO |
| Nhiều dịch vụ | Một thợ làm toàn bộ hoặc chia nhiều thợ | PO |
| Vị trí | Có quản lý ghế, bàn và phòng khi giao khách hay không | PO |

#### Tham chiếu nguồn

[Developer Handoff](html/pos-prototype/developer-handoff.html) là tài liệu tham khảo quy tắc, không nằm trong bảng UI. Thuật ngữ tham khảo glossary của workspace đã dùng khi biên soạn.

- #6: [nexora-pos-12-10/nexora-pos-prototype-v34.html](html/nexora-pos-12-10/nexora-pos-prototype-v34.html) — nội dung `610810d0c821b0a0`.
- #5: [nexora-pos-feedback-9-10/nexora-pos-products-other-sales.html](html/nexora-pos-feedback-9-10/nexora-pos-products-other-sales.html) — nội dung `01d9d272d367df45`.
- #4: [pos-prototype/front-desk-prototype (1).html](html/pos-prototype/front-desk-prototype%20(1).html) — nội dung `047a8514f254c41d`.
- #3: [pos-prototype/front-desk-prototype.html](html/pos-prototype/front-desk-prototype.html) — nội dung `b12b1bd80e721a5b`.
- #2: [TurnBoardBanMau.html](html/TurnBoardBanMau.html) — nội dung `1b60a11d1b666829`.
- #1: [nexora-pos-feedback-9-10/nexora-pos-prototype (1).html](html/nexora-pos-feedback-9-10/nexora-pos-prototype%20(1).html) — nội dung `5a8a0ff7fe131575`.
