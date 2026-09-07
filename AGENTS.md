# Quy tắc chung của dự án

## Viết tài liệu và mô tả

- Trước mỗi lần viết mới hoặc chỉnh sửa tài liệu hay nội dung mô tả, bắt buộc đọc và tuân thủ [.claude/SKIL_Doc.md](.claude/SKIL_Doc.md).
- Quy tắc áp dụng trên toàn dự án, không chỉ trong `docs/business/`; bao gồm tài liệu nghiệp vụ, mô tả tính năng, quy trình và mô tả PR.
- Áp dụng cấu trúc, thuật ngữ nghiệp vụ, sơ đồ và quy định quản lý phiên bản theo hướng dẫn trong file đó. Kiểm tra nội dung với mã nguồn và tài liệu hiện có trước khi viết.
- Nếu hướng dẫn mâu thuẫn với yêu cầu trực tiếp của người dùng, ưu tiên yêu cầu của người dùng.

## Commit sau khi hoàn tất

- Sau mỗi yêu cầu đã hoàn tất có thay đổi file, tự động tạo Git commit cho các thay đổi thuộc yêu cầu đó; không cần hỏi lại người dùng.
- Trước khi commit, kiểm tra diff và chạy các kiểm thử phù hợp. Chỉ commit khi các kiểm tra liên quan đã đạt; nếu còn lỗi, xử lý hoặc báo rõ trở ngại.
- Không đưa thay đổi không liên quan của người dùng vào commit. Không tự động push nếu người dùng chưa yêu cầu.
- Trong phản hồi hoàn tất, thông báo mã commit và kết quả kiểm tra ngắn gọn.
