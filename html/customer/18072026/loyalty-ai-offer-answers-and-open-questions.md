# NEXORA — Loyalty & AI Offer: Câu trả lời và câu hỏi cần xác nhận

**Ngày:** 20/07/2026  
**Mục đích:** Tổng hợp các quyết định đã có trong tài liệu và các câu hỏi cần Product Owner xác nhận trước khi estimate và triển khai.

## 1. Các câu đã có câu trả lời

### 1.1 Loyalty

1. Điểm được trừ khi khách hàng hoặc nhân viên xác nhận **phát hành reward**.
2. Việc hoàn điểm cho reward chưa sử dụng nhưng đã hết hạn hoặc bị Manager void là **cấu hình của merchant**.
3. Việc phục hồi reward sau refund tuân theo **chính sách của Owner** và phải được hiển thị trước khi xác nhận.
4. Khi partial refund, điểm đã tích được reverse dựa trên **phần eligible net spend được hoàn**.
5. Quy tắc stack với promotion được **Owner cấu hình theo từng reward**.
6. Package credit và reward Free Service/Free Product không được thanh toán cho cùng một line item.
7. Phạm vi cross-location được cấu hình theo từng reward:
   - Chỉ location phát hành
   - Một số location được chọn thuộc cùng merchant
   - Tất cả location thuộc cùng merchant
8. Gift Card mua bằng điểm được mô tả là **stored monetary value** và có thể còn số dư sau khi sử dụng.
9. Reward Percent Discount bắt buộc phải có maximum discount.
10. Owner cấu hình thời điểm Pending Points chuyển thành Available, ví dụ ngay sau payment hoặc sau một khoảng hold.
11. Tax và tip không được tích điểm nếu Owner không bật. Phần thanh toán bằng reward không được tích điểm. Retail product và gift-card purchase có thể cấu hình eligibility.
12. Guest checkout có thể được liên kết sau bằng cùng số điện thoại đã xác minh để nhận các điểm đang pending.

### 1.2 AI Offer Suggestions

1. Customer wish được nhập tại **Offers & Wishlist → What would you love?** trong ứng dụng khách hàng.
2. Wish được hiển thị cho doanh nghiệp dưới dạng nhu cầu đã gom nhóm và ẩn danh.
3. Trong Phase 1, AI chỉ tạo draft. Owner phải review và xác nhận trước khi publish.
4. Owner quyết định giá, mức discount và lịch chạy cuối cùng.
5. Mockup sử dụng customer demand, giá dịch vụ hiện tại và quiet hours để giải thích suggestion.
6. Việc dismiss suggestion được mô tả là một learning signal.
7. Khách hàng có thể tắt AI suggestions trong phần tùy chọn thông báo và quyền riêng tư.
8. Cần có functional specification, API/data model và QA acceptance criteria riêng trước khi estimate đáng tin cậy.

## 2. Các câu hỏi cần Product Owner xác nhận

### 2.1 Loyalty

1. Product Owner đã chính thức duyệt việc trừ điểm tại thời điểm phát hành reward là chính sách cuối cùng chưa?
2. Mặc định có hoàn điểm khi reward chưa sử dụng bị hết hạn không?
3. Mặc định có hoàn điểm khi Manager void reward chưa sử dụng không?
4. Khi refund hóa đơn đã dùng reward, hệ thống phải phục hồi reward, hoàn điểm hay giữ nguyên?
5. Giá trị mặc định và giới hạn tối đa cho maximum discount của Percent Discount là bao nhiêu?

### 2.2 AI Offer Suggestions

1. Khách hàng có phải consent rõ ràng trước khi wish data được dùng để tạo merchant insight không?
2. Cần tối thiểu bao nhiêu khách hàng trước khi hiển thị insight để tránh suy ra danh tính?
3. Bán kính demand 10 miles là cố định hay Owner có thể cấu hình?
4. Demand sử dụng khoảng dữ liệu 7, 30 hay 90 ngày?
5. AI được phép sử dụng những nguồn dữ liệu production nào: giá dịch vụ, booking history, availability và quiet hours thực tế?
6. Guardrail cho minimum price, minimum margin và maximum discount là gì? Ai có quyền duyệt ngoại lệ?
7. Estimated redemptions, average ticket và return rate được tính bằng công thức hoặc mô hình nào?
8. Owner có thể hoàn tác việc dismiss suggestion không? Dismissal được lưu làm learning signal trong bao lâu?

## 3. Quyết định kỹ thuật đề xuất đã thống nhất

### 3.1 Loyalty

1. **Partial refund:** Reverse điểm theo các line item thực sự được refund. Nếu chỉ refund một phần line item, reverse theo tỷ lệ eligible net spend của line đó; không phân bổ theo tổng toàn hóa đơn.
2. **Gift Card và tax:** Áp dụng discount trước, tính tax trên taxable amount, sau đó mới dùng Gift Card để thanh toán. Gift Card là tender, không phải discount.
3. **Data model Gift Card:** Việc phát hành reward tạo một Gift Card riêng có `balance`, transaction ledger và trạng thái. `RewardInstrument` chỉ lưu liên kết tới Gift Card được tạo.
4. **Pending Points:** Payment POS đã confirmed thì điểm chuyển Available ngay. External payment hoặc giao dịch rủi ro cao tiếp tục ở trạng thái Pending theo hold period được cấu hình.
5. **Mặc định tích điểm:** Services và retail product được tích điểm. Tax, tip, gift-card purchase, reward-covered amount và package-covered amount không được tích điểm.

### 3.2 AI Offer Suggestions

1. **Business object:** AI tạo `OfferSuggestion` hoặc `OfferDraft`. Sau khi Owner duyệt, hệ thống mới chuyển draft thành `Promotion`.
2. **Stacking:** Mặc định không stack. Chỉ cho phép khi cả Promotion và Loyalty Reward đều bật stacking. Package credit và Free Service reward không được áp dụng trên cùng line item.
3. **Điều kiện hiển thị estimate:** Chỉ hiển thị estimate tài chính khi có tối thiểu 30 giao dịch lịch sử phù hợp và confidence đạt ngưỡng cấu hình. Nếu không đủ dữ liệu, hiển thị “Chưa đủ dữ liệu” thay cho con số dự báo.
4. **Notification cap:** AI-match notification dùng chung giới hạn marketing: tối đa 1 thông báo mỗi tuần và 4 thông báo mỗi tháng cho một khách hàng. Khách hàng có thể mute bất kỳ lúc nào.
5. **Audit:** Lưu input snapshot, nguồn dữ liệu, model và version, suggestion ban đầu, confidence, các chỉnh sửa của Owner, approval, nội dung publish, dismiss action, actor và timestamp.

## 4. Mức độ sẵn sàng để estimate

- **Loyalty:** Thiết kế kỹ thuật chính đã đủ rõ hơn; vẫn cần Product Owner xác nhận chính sách hoàn điểm, refund reward và giới hạn Percent Discount.
- **AI Offer Suggestions:** Chưa sẵn sàng để estimate đáng tin cậy. Vẫn cần xác nhận consent/privacy, demand scope, data source, pricing guardrail, mô hình estimate và hành vi Undo; sau đó phải hoàn thiện functional specification, API/data model và QA acceptance criteria.
