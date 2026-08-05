# Nexora OneQR — Full Business Specification V2

**Phạm vi:** Business specification bàn giao cho Product, BA, UX, Dev và QC. Không mô tả kiến trúc kỹ thuật chi tiết và không viết test cases.

## 1. Product Vision

Nexora là **Digital Trust Platform**. OneQR là cổng truy cập đầu tiên, kết nối danh tính, dịch vụ, quyền truy cập, phê duyệt và trải nghiệm người dùng qua một mã QR duy nhất.

> **One QR. Every Service. Your Rules.**

> **Print Once. Configure Forever.**

## 2. Hai phía sử dụng

### 2.1 Phía Chủ sở hữu / Quản trị

Dành cho cá nhân, doanh nghiệp, tổ chức, hiệp hội và cơ quan chính phủ để:

- Tạo Workspace và OneQR.
- Chọn template theo loại chủ thể và ngành.
- Bật/tắt, sắp xếp và cấu hình module.
- Quản lý Master QR và Child QR.
- Cấu hình người dùng, vai trò và quyền.
- Thiết lập quy trình phê duyệt.
- Nhận notification và xử lý yêu cầu.
- Xem lịch sử hoạt động và báo cáo.

### 2.2 Phía Người truy cập / Khách hàng

Dành cho khách hàng, nhân viên, thành viên, đối tác, vendor và công dân để:

- Scan QR mà không cần cài app.
- Xem nội dung công khai.
- Xác thực khi cần.
- Sử dụng đúng module được phép.
- Gửi yêu cầu phê duyệt khi vượt quyền.
- Tiếp tục công việc đang dang dở.
- Nhận notification về trạng thái.

## 3. Workspace Types và chức năng mặc định

### 3.1 Cá nhân

- Digital profile
- Business card
- Portfolio
- Booking
- Tip
- Payment
- Donation
- Document sharing
- Event
- AI Assistant

### 3.2 Doanh nghiệp

- Business profile
- Check-in
- Booking
- Waiting list
- Catalog / Services / Menu
- Payment
- Tip
- Review
- Rewards
- Membership
- Gift card
- Customer management
- Staff management
- Clock-in / Clock-out
- Approval
- AI Voice / SMS
- Reports
- Multi-location

### 3.3 Tổ chức / Hiệp hội

- Organization profile
- Membership
- Membership tiers
- Dues
- Donation
- Events
- Event check-in
- Volunteer
- Voting
- Announcements
- Internal documents
- Committees
- Chapters
- Sponsor management

### 3.4 Chính phủ

- Public information
- Citizen services
- Appointment
- Application submission
- Permit / License
- Fee payment
- Case tracking
- Document upload
- Public notices
- Department directory
- Public feedback
- Complaint submission
- Officer approval

## 4. AI Setup Wizard

### 4.1 Nguyên tắc

Người dùng không bắt đầu từ màn hình trống. AI Setup Wizard hỏi ngắn gọn và tạo 90% cấu hình ban đầu; người dùng review và chỉnh 10% còn lại.

### 4.2 Luồng

1. Chọn loại Workspace.
2. Chọn ngành hoặc loại hình.
3. Chọn mục tiêu sử dụng.
4. Khai báo quy mô cơ bản.
5. AI đề xuất template, module, vai trò và approval rules.
6. Người dùng review.
7. Lưu Draft.
8. Publish khi chủ sở hữu xác nhận.

AI không được tự publish, tự cấp quyền nhạy cảm hoặc tự phê duyệt hành động tài chính.

## 5. OneQR Structure

- Mỗi Workspace có một Master QR.
- Có thể tạo nhiều Child QR.
- Child QR kế thừa từ Master theo mặc định.
- Mỗi phần của Child QR có ba trạng thái: Inherited, Customized, Disabled.
- Khi Master thay đổi, chỉ phần còn Inherited được cập nhật.

## 6. Visitor Experience

### 6.1 Scan lần đầu

- Hiển thị nội dung công khai ngay.
- Chỉ yêu cầu OTP hoặc đăng nhập khi truy cập chức năng riêng tư.
- Có nút “Xem tất cả”.

### 6.2 Người quay lại

- Chào theo hồ sơ nếu được phép.
- Ưu tiên công việc dang dở.
- Hiển thị module phù hợp nhất.
- Cho phép mở toàn bộ module được cấp.

### 6.3 Progressive Identity

- Anonymous
- OTP verified
- Profile completed
- Identity verified
- Trusted role / authorized operator

## 7. Permission và Approval

Quyền được xác định dựa trên vai trò, permission profile, trust level, thiết bị, vị trí, thời gian và bối cảnh. AI chỉ đề xuất trong giới hạn cho phép.

Khi hành động vượt quyền:

1. Tạo approval request.
2. Gửi đến người duyệt chính.
3. Nếu quá hạn, chuyển người duyệt dự phòng theo cấu hình.
4. Người dùng theo dõi trạng thái.
5. Mọi quyết định được lưu lịch sử.

## 8. Screen Inventory

### Phía Owner/Admin

1. Sign in / Workspace selector
2. Create Workspace
3. AI Setup Wizard — Type
4. AI Setup Wizard — Industry
5. AI Setup Wizard — Goals
6. AI Setup Wizard — Recommendation Review
7. Owner Dashboard
8. OneQR Builder
9. Master & Child QR
10. Module Library / Marketplace
11. Roles & Permissions
12. Approval Rules
13. Approval Inbox
14. Notifications
15. Activity History
16. Preview by Role
17. Publish / Print / Share
18. Workspace Settings

### Phía Visitor/Customer

1. Scan landing
2. Public home
3. Identity / OTP
4. Personalized home
5. View all modules
6. Check-in
7. Booking
8. Payment / Tip
9. Rewards / Membership
10. Review
11. Staff portal
12. Approval request status
13. Notification center
14. Error / Limited access
15. Success / Confirmation

## 9. Business Rules Summary

- Không bắt buộc cài app để scan và dùng chức năng công khai.
- Không yêu cầu mua kiosk hoặc iPad chuyên dụng.
- Chủ sở hữu kiểm soát module, quyền, approval và dữ liệu.
- Dữ liệu thuộc về chủ thể sở hữu hợp pháp.
- AI hỗ trợ, người có thẩm quyền quyết định.
- OneQR hoạt động độc lập với Nexora POS.
- Nội dung có thể thay đổi mà không cần in lại QR.
- Hành động nhạy cảm phải có quyền rõ ràng hoặc approval.
- Người dùng luôn có thể biết trạng thái yêu cầu của mình.

## 10. V2 Deliverables

- Full BA Specification
- Screen-by-screen UI specification
- Owner/Admin user flows
- Visitor/Customer user flows
- Sitemap
- Interactive HTML prototype for both sides
