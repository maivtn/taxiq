# Quy tắc chung của dự án

## Viết tài liệu và mô tả

- Trước mỗi lần viết mới hoặc chỉnh sửa tài liệu hay nội dung mô tả, bắt buộc đọc và tuân thủ [.claude/SKIL_Doc.md](.claude/SKIL_Doc.md).
- Quy tắc áp dụng trên toàn dự án, không chỉ trong `docs/business/`; bao gồm tài liệu nghiệp vụ, mô tả tính năng, quy trình và mô tả PR.
- Áp dụng cấu trúc, thuật ngữ nghiệp vụ, sơ đồ và quy định quản lý phiên bản theo hướng dẫn trong file đó. Kiểm tra nội dung với mã nguồn và tài liệu hiện có trước khi viết.
- Nếu hướng dẫn mâu thuẫn với yêu cầu trực tiếp của người dùng, ưu tiên yêu cầu của người dùng.

## Quy tắc giao diện

- Ngày hiển thị phải theo định dạng Mỹ `MMM D, YYYY`, ví dụ `Sep 20, 2026`: tháng viết tắt tiếng Anh, ngày không thêm số 0, năm đủ 4 chữ số. Áp dụng chung cho POS, Booking, app thợ và prototype; xem [Date Format](nexora-design-system-colors.md#date-format). Không đổi định dạng ISO của dữ liệu lưu trữ/API.
- Khi tạo hoặc chỉnh sửa ô chọn (select/dropdown), tuân thủ [Form Controls](nexora-design-system-colors.md#form-controls): mũi tên cách mép phải 16px, icon rộng 16px, vùng đệm bên phải tối thiểu 44px. Áp dụng cả trên tablet, điện thoại và các ô chọn kích thước nhỏ.

## Thời điểm kiểm thử

- Chỉ chạy test khi người dùng yêu cầu rõ ràng; không tự chạy trong lúc làm, khi hoàn tất hoặc trước khi commit.
- Làm xong toàn bộ phạm vi thay đổi rồi mới gom kiểm thử một lượt khi được yêu cầu; không chạy test lẻ tẻ sau từng chỉnh sửa. Nếu người dùng chỉ định phạm vi kiểm thử riêng, làm theo phạm vi đó.
- Quy tắc này áp dụng cho cả test tự động và thao tác test UI trên trình duyệt. Vẫn được đọc mã nguồn và rà soát diff để thực hiện thay đổi.
- Khi chưa được yêu cầu test, ghi rõ “Chưa chạy test — chờ yêu cầu của người dùng”; không khẳng định các luồng đã chạy đúng hoặc test đã đạt.

## Tổ chức kiểm thử JavaScript

- Tất cả file kiểm thử JavaScript (`*.test.js`, `*.test.mjs`, `*.test.cjs`) phải đặt trong thư mục `tests/` ở gốc dự án; test mới cũng phải tuân thủ quy tắc này.
- Giữ cấu trúc thư mục tương ứng với mã nguồn: test cho `html/pages/` đặt trong `tests/html/pages/`, test cho `html/assets/` đặt trong `tests/html/assets/`; áp dụng tương tự cho các thư mục khác.
- Không đặt file test cạnh mã nguồn trong `html/` hoặc tài liệu trong `docs/`.
- Khi được yêu cầu test: chạy toàn bộ kiểm thử bằng `npm test`; chỉ chạy một file bằng `node --test tests/<đường-dẫn-file-test>` khi người dùng yêu cầu phạm vi đó.
- Khi đọc mã nguồn hoặc fixture từ test, xác định đường dẫn dựa trên vị trí file test (`import.meta.url` hoặc `__dirname`), không phụ thuộc thư mục hiện tại của terminal.

## Commit sau khi hoàn tất

- Sau mỗi yêu cầu đã hoàn tất có thay đổi file, tự động tạo Git commit cho các thay đổi thuộc yêu cầu đó; không cần hỏi lại người dùng.
- Trước khi commit, rà soát diff. Không tự chạy test để đáp ứng điều kiện commit; nếu chưa được yêu cầu test, vẫn commit thay đổi thuộc yêu cầu và ghi rõ chưa chạy test. Nếu đã chạy test theo yêu cầu và còn lỗi liên quan, xử lý hoặc báo rõ trở ngại trước khi commit.
- Không đưa thay đổi không liên quan của người dùng vào commit. Không tự động push nếu người dùng chưa yêu cầu.
- Trong phản hồi hoàn tất, thông báo mã commit và trạng thái kiểm thử ngắn gọn (kết quả thực tế hoặc chưa chạy theo quy tắc trên).
