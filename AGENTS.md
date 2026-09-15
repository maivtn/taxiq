# Quy tắc chung của dự án

## Viết tài liệu và mô tả

- Trước mỗi lần viết mới hoặc chỉnh sửa tài liệu hay nội dung mô tả, bắt buộc đọc và tuân thủ [.claude/SKIL_Doc.md](.claude/SKIL_Doc.md).
- Quy tắc áp dụng trên toàn dự án, không chỉ trong `docs/business/`; bao gồm tài liệu nghiệp vụ, mô tả tính năng, quy trình và mô tả PR.
- Áp dụng cấu trúc, thuật ngữ nghiệp vụ, sơ đồ và quy định quản lý phiên bản theo hướng dẫn trong file đó. Kiểm tra nội dung với mã nguồn và tài liệu hiện có trước khi viết.
- Nếu hướng dẫn mâu thuẫn với yêu cầu trực tiếp của người dùng, ưu tiên yêu cầu của người dùng.

## Quy tắc giao diện

- Khi tạo hoặc chỉnh sửa ô chọn (select/dropdown), tuân thủ [Form Controls](nexora-design-system-colors.md#form-controls): mũi tên cách mép phải 16px, icon rộng 16px, vùng đệm bên phải tối thiểu 44px. Áp dụng cả trên tablet, điện thoại và các ô chọn kích thước nhỏ.

## Tổ chức kiểm thử JavaScript

- Tất cả file kiểm thử JavaScript (`*.test.js`, `*.test.mjs`, `*.test.cjs`) phải đặt trong thư mục `tests/` ở gốc dự án; test mới cũng phải tuân thủ quy tắc này.
- Giữ cấu trúc thư mục tương ứng với mã nguồn: test cho `html/pages/` đặt trong `tests/html/pages/`, test cho `html/assets/` đặt trong `tests/html/assets/`; áp dụng tương tự cho các thư mục khác.
- Không đặt file test cạnh mã nguồn trong `html/` hoặc tài liệu trong `docs/`.
- Chạy toàn bộ kiểm thử bằng `npm test`; chạy một file bằng `node --test tests/<đường-dẫn-file-test>`.
- Khi đọc mã nguồn hoặc fixture từ test, xác định đường dẫn dựa trên vị trí file test (`import.meta.url` hoặc `__dirname`), không phụ thuộc thư mục hiện tại của terminal.

## Commit sau khi hoàn tất

- Sau mỗi yêu cầu đã hoàn tất có thay đổi file, tự động tạo Git commit cho các thay đổi thuộc yêu cầu đó; không cần hỏi lại người dùng.
- Trước khi commit, kiểm tra diff và chạy các kiểm thử phù hợp. Chỉ commit khi các kiểm tra liên quan đã đạt; nếu còn lỗi, xử lý hoặc báo rõ trở ngại.
- Không đưa thay đổi không liên quan của người dùng vào commit. Không tự động push nếu người dùng chưa yêu cầu.
- Trong phản hồi hoàn tất, thông báo mã commit và kết quả kiểm tra ngắn gọn.
