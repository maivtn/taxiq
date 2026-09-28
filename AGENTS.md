# Quy tắc chung của dự án

## IMPORTANT — Làm trực tiếp cho HTML prototype demo

- Đây là dự án HTML prototype/demo. Ưu tiên triển khai trực tiếp giao diện và luồng demo theo yêu cầu; không áp dụng quy trình tài liệu nặng như dự án production.
- Khi yêu cầu đã rõ, cứ làm luôn: bỏ qua bước viết spec, design doc, implementation plan, tài liệu nghiệp vụ, mô tả tính năng và vòng chờ duyệt thiết kế. Không dừng để hỏi lại “chốt cách này nhé?” cho thay đổi đã được yêu cầu.
- Người dùng chủ động yêu cầu bỏ qua các bước tài liệu và phê duyệt thiết kế của skill/workflow cho dự án này. Không dùng các bước đó làm điều kiện chặn triển khai.
- Chỉ hỏi khi thiếu thông tin quan trọng không thể suy ra từ mã nguồn hoặc ngữ cảnh, hay thao tác có nguy cơ mất dữ liệu/vượt phạm vi yêu cầu. Giữ thay đổi gọn, bám UI hiện có và bảo toàn thay đổi không liên quan.
- Làm trên nhánh `main`, không tự tạo worktree hoặc nhánh mới, trừ khi người dùng yêu cầu khác.
- Không tự chạy test; tuân thủ mục “Thời điểm kiểm thử” bên dưới. Báo kết quả ngắn gọn, không viết thêm tài liệu mô tả sau mỗi thay đổi.

## Tài liệu chỉ khi được yêu cầu

- Không tự tạo hoặc cập nhật tài liệu/spec/mô tả như một bước bắt buộc khi chỉnh prototype. Nội dung UI và cập nhật trạng thái ngắn gọn không cần quy trình tài liệu.
- Chỉ khi người dùng yêu cầu viết hoặc sửa tài liệu, đọc và áp dụng [.claude/SKIL_Doc.md](.claude/SKIL_Doc.md) trong phạm vi tài liệu đó. Yêu cầu trực tiếp của người dùng được ưu tiên khi có mâu thuẫn.

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
