# Quy tắc chung của dự án


## Quy ước phiên bản tài liệu Community

Khi người dùng nhắc Community (kể cả cách viết “comunity”) v1, v2 hoặc v3, hiểu là các gói tài liệu PO sau. Đường dẫn tính từ gốc workspace:

| Phiên bản | Thư mục tài liệu PO |
| --- | --- |
| Community v1 | `from-po/NEXORA-Community` |
| Community v2 | `from-po/NEXORA-Community-Dev-Package 16-10 v2` |
| Community v3 | `goi-community-giao-dev` |


## IMPORTANT — Làm trực tiếp cho HTML prototype demo

- Đây là dự án HTML prototype/demo. Ưu tiên triển khai trực tiếp giao diện và luồng demo theo yêu cầu; không áp dụng quy trình tài liệu nặng như dự án production.
- Khi yêu cầu đã rõ, cứ làm luôn: bỏ qua bước viết spec, design doc, implementation plan, tài liệu nghiệp vụ, mô tả tính năng và vòng chờ duyệt thiết kế. Không dừng để hỏi lại “chốt cách này nhé?” cho thay đổi đã được yêu cầu.
- Người dùng chủ động yêu cầu bỏ qua các bước tài liệu và phê duyệt thiết kế của skill/workflow cho dự án này. Không dùng các bước đó làm điều kiện chặn triển khai.
- Chỉ hỏi khi thiếu thông tin quan trọng không thể suy ra từ mã nguồn hoặc ngữ cảnh, hay thao tác có nguy cơ mất dữ liệu/vượt phạm vi yêu cầu. Giữ thay đổi gọn, bám UI hiện có và bảo toàn thay đổi không liên quan.
- Làm trên nhánh `main`, không tự tạo worktree hoặc nhánh mới, trừ khi người dùng yêu cầu khác.
- Làm xong thì rà soát diff, commit thay đổi.

## Tài liệu chỉ khi được yêu cầu

- Không tự tạo hoặc cập nhật tài liệu/spec/mô tả như một bước bắt buộc khi chỉnh prototype. Nội dung UI và cập nhật trạng thái ngắn gọn không cần quy trình tài liệu.
- Chỉ khi người dùng yêu cầu viết hoặc sửa tài liệu, đọc và áp dụng [.claude/SKIL_Doc.md](.claude/SKIL_Doc.md) trong phạm vi tài liệu đó. Yêu cầu trực tiếp của người dùng được ưu tiên khi có mâu thuẫn.

## Bộ chuẩn đối chiếu yêu cầu PO

- Khi người dùng yêu cầu hợp nhất nhiều phiên bản HTML/spec, xây baseline hoặc phân tích phạm vi thay đổi của một tính năng, đọc và dùng [PO Requirement Reconciler](skills/po-requirement-reconciler/SKILL.md).
- Hướng dẫn và hồ sơ tính năng nằm tại [Bộ chuẩn yêu cầu](docs/requirements/README.md). Dùng lại biểu mẫu chung, giữ riêng nguồn, yêu cầu và quyết định của từng tính năng.
- Khi nhận PO mới, mốc đối chiếu chính là bản thực tế đang deploy trên môi trường web được chỉ định, gồm cả thay đổi phát sinh sau PO cũ. V1, Master Spec và code main/master không thay thế mốc deployed nếu chưa xác minh tương ứng.
- Không tự áp dụng quy trình hồ sơ này làm điều kiện chặn các chỉnh sửa prototype thông thường; giữ nguyên quy tắc làm trực tiếp, commit rồi tự kiểm thử sau khi hoàn tất.

## IMPORTANT — Bám sát PO; thiếu trong PO thì lấy từ staging web

- Tài liệu và HTML mẫu do PO cung cấp trong `from-po/` là nguồn chuẩn để triển khai giao diện. Phải bám sát đúng màn hình và ngữ cảnh: bố cục, thành phần, nội dung, trạng thái và luồng tương tác; không tự rút gọn, thiết kế lại hoặc bổ sung chức năng làm sai lệch yêu cầu PO.
- Với màn hình hoặc phần nội dung PO chưa cung cấp, phải đối chiếu và lấy giao diện/HTML từ staging web tương ứng để làm HTML nội bộ. Không dùng staging để thay thế yêu cầu đã có trong tài liệu PO.
- Nếu cả PO và staging đều thiếu, staging lỗi/không truy cập được, hoặc có điểm chưa rõ cần đề xuất thay đổi, hỏi lại người dùng trước khi triển khai phần đó; không tự suy diễn nội dung hay hành vi.
- Yêu cầu điều chỉnh rõ ràng của người dùng được ưu tiên khi khác với mẫu PO hoặc staging.

## IMPORTANT — Vị trí Get started with Nexora theo trạng thái tiệm

- Tiệm mới, chưa setup thông tin: hiển thị **Get started with Nexora** trực tiếp trên sidebar.
- Tiệm đã hoạt động: chuyển **Get started with Nexora** vào **Business tools**, không giữ thành mục riêng ở cấp chính của sidebar.
- Phải giữ đúng quy tắc này khi tạo mới hoặc chỉnh sửa sidebar, Business tools và luồng setup tiệm.

## Quy tắc giao diện

- Ưu tiên dùng bộ icon có sẵn trong `html/assets/icon-oneqr/` khi tạo mới hoặc chỉnh sửa giao diện.
- Khi cần tìm và lấy icon mới, dùng [Flaticon](https://www.flaticon.com/search?color=color&shape=fill&order_by=4), chọn icon phù hợp với chức năng và đồng bộ phong cách với các icon đang dùng.
- Nguồn tham khảo để tìm và lấy icon khi cần: [IconScout — Giveaway 3D Icon Pack](https://iconscout.com/3d-icon-pack/giveaway-3d-icon-pack_309252). Chọn icon phù hợp với chức năng và đồng bộ phong cách với các icon đang dùng.
- Mọi câu chữ trên giao diện phải lấy từ tài liệu HTML mẫu PO; phần PO chưa có thì lấy từ staging web theo thứ tự ưu tiên ở trên, đối chiếu đúng màn hình và ngữ cảnh. Không tự chế, diễn giải lại hoặc bổ sung câu chữ mới, bao gồm tiêu đề, nhãn, nút, hướng dẫn, tooltip, placeholder, thông báo và trạng thái trống.
- Nếu cả HTML mẫu PO và staging không có câu chữ tương ứng, không tự suy diễn để thêm vào UI. Chỉ dùng câu chữ ngoài hai nguồn này khi người dùng yêu cầu hoặc cung cấp rõ ràng.
- Ngôn ngữ phải đồng nhất trên cùng một màn hình theo ngôn ngữ đã chọn hoặc yêu cầu của người dùng; không để lẫn tiếng Việt và tiếng Anh trong tiêu đề, mô tả, nhãn, nút, bộ lọc, modal, tooltip, placeholder, thông báo, trạng thái trống và dữ liệu mẫu.
- Khi đổi ngôn ngữ, rà soát cả nội dung động, các action/modal và dữ liệu mẫu đã lưu để tránh sót ngôn ngữ cũ. Giữ nguyên tên riêng, thương hiệu và nội dung người dùng tự nhập; chỉ dịch phần hiển thị, không đổi mã định danh hoặc giá trị nghiệp vụ dùng trong logic/API.
- Ngày hiển thị phải theo định dạng Mỹ `MMM D, YYYY`, ví dụ `Sep 20, 2026`: tháng viết tắt tiếng Anh, ngày không thêm số 0, năm đủ 4 chữ số. Áp dụng chung cho POS, Booking, app thợ và prototype; xem [Date Format](nexora-design-system-colors.md#date-format). Không đổi định dạng ISO của dữ liệu lưu trữ/API.
- Khi tạo hoặc chỉnh sửa ô chọn (select/dropdown), tuân thủ [Form Controls](nexora-design-system-colors.md#form-controls): mũi tên cách mép phải 16px, icon rộng 16px, vùng đệm bên phải tối thiểu 44px. Áp dụng cả trên tablet, điện thoại và các ô chọn kích thước nhỏ.

## Thời điểm kiểm thử

- Mặc định làm xong toàn bộ phạm vi thay đổi, rà soát diff, tạo Git commit rồi tự chạy test; không chờ người dùng yêu cầu hoặc xác nhận thêm.
- Sau khi commit code, phải kiểm thử hồi quy toàn bộ các yêu cầu đã triển khai ở phiên hiện tại và các phiên trước, không chỉ phần thay đổi của commit mới nhất. Đối chiếu lịch sử yêu cầu, commit và bộ kiểm thử sẵn có để bao phủ các màn hình, trạng thái và luồng liên quan.
- Gom kiểm thử một lượt sau commit; không tự chạy test lẻ tẻ trong lúc làm hoặc trước commit. Nếu người dùng chỉ định phạm vi kiểm thử riêng hoặc yêu cầu không chạy test, làm theo yêu cầu đó.
- Quy tắc này áp dụng cho cả test tự động và kiểm thử UI trên trình duyệt phù hợp với phần thay đổi. Khi thay đổi giao diện hoặc tương tác, kiểm tra các màn hình và luồng liên quan bằng trình duyệt theo quy tắc không gián đoạn công việc bên dưới.
- Nếu test phát hiện lỗi thuộc các yêu cầu đã triển khai, kể cả từ phiên trước, phải sửa trong phạm vi các yêu cầu đó, rà soát diff và tạo commit bổ sung. Sau mỗi commit sửa lỗi, chạy lại toàn bộ `npm test` và các luồng UI trong phạm vi hồi quy; lặp lại đến khi đạt hoặc có trở ngại thực tế cần báo rõ. Lỗi ngoài phạm vi yêu cầu hoặc trở ngại môi trường phải được báo rõ, không tự mở rộng phạm vi sửa.
- Báo mã commit đã kiểm thử và kết quả thực tế. Nếu chưa chạy được test, nêu rõ lý do; không khẳng định luồng hoạt động đúng hoặc test đạt khi chưa có bằng chứng.

## Kiểm thử trình duyệt không gián đoạn công việc

- Khi test bằng Chrome hoặc trình duyệt khác, ưu tiên chế độ headless; nếu cần giao diện thì chạy nền, không đưa cửa sổ lên trên cùng hoặc chiếm focus của ứng dụng người dùng đang làm việc.
- Không gọi `bringToFront`, kích hoạt ứng dụng hoặc dùng thao tác tương đương để đưa cửa sổ/tab test ra foreground. Quy tắc này áp dụng cả khi mở trình duyệt, điều hướng, chụp ảnh và chuyển tab trong suốt quá trình test.
- Nếu công cụ test tự đưa trình duyệt ra foreground và không thể chạy nền, chuyển sang công cụ/chế độ khác hỗ trợ chạy nền. Chỉ đưa trình duyệt lên foreground khi người dùng yêu cầu rõ ràng.
- Ngay khi kết thúc test (kể cả test lỗi hoặc bị dừng), đóng các tab/cửa sổ, browser context và tiến trình trình duyệt do phiên test tạo; không để Chrome test tiếp tục chạy nền. Chỉ dọn tài nguyên của phiên test, không đóng tab/cửa sổ hoặc dừng trình duyệt người dùng đang sử dụng.

## Tổ chức kiểm thử JavaScript

- Tất cả file kiểm thử JavaScript (`*.test.js`, `*.test.mjs`, `*.test.cjs`) phải đặt trong thư mục `tests/` ở gốc dự án; test mới cũng phải tuân thủ quy tắc này.
- Giữ cấu trúc thư mục tương ứng với mã nguồn: test cho `html/pages/` đặt trong `tests/html/pages/`, test cho `html/assets/` đặt trong `tests/html/assets/`; áp dụng tương tự cho các thư mục khác.
- Không đặt file test cạnh mã nguồn trong `html/` hoặc tài liệu trong `docs/`.
- Sau commit, mặc định chạy toàn bộ kiểm thử bằng `npm test`; chỉ chạy một file bằng `node --test tests/<đường-dẫn-file-test>` khi người dùng yêu cầu phạm vi đó.
- Khi đọc mã nguồn hoặc fixture từ test, xác định đường dẫn dựa trên vị trí file test (`import.meta.url` hoặc `__dirname`), không phụ thuộc thư mục hiện tại của terminal.

## Commit và kiểm thử sau khi hoàn tất

- Sau mỗi yêu cầu đã hoàn tất có thay đổi file, tự động tạo Git commit cho các thay đổi thuộc yêu cầu đó; không cần hỏi lại người dùng.
- Trước khi commit, rà soát diff và chỉ đưa vào commit các thay đổi thuộc yêu cầu. Sau khi commit thành công, tự chạy kiểm thử hồi quy toàn bộ yêu cầu của các phiên theo mục “Thời điểm kiểm thử”; nếu có lỗi trong phạm vi thì sửa, commit bổ sung và chạy lại, không dừng ở bước commit để chờ lệnh test hoặc lệnh sửa lỗi.
- Không đưa thay đổi không liên quan của người dùng vào commit. Không tự động push nếu người dùng chưa yêu cầu.
- Trong phản hồi hoàn tất, thông báo mã commit và kết quả kiểm thử ngắn gọn; nếu test lỗi hoặc không chạy được, nêu rõ lỗi hoặc trở ngại thực tế.

## Tài khoản demo

### Staging

- personal: `nexora_02@mailinator.com` / `123456`
- business: `nexora_b1@mailinator.com` / `123456`

### Test

- Tài khoản 1: `jade_01@mailinator.com` / `123456`
- Tài khoản 2: `quanpm` / `123456`
- Tài khoản merchant: `bitcoinnailbar@nexoratouch.com` / `bitcoinnailbar@123`
- Tài khoản staff: `david.le918747@nexoratouch.com` / `Nexora@2026!`

## Link online của HTML prototype

- Link online mẫu: [One QR](https://taxiq-nexora-touch.vercel.app/html/oneqr-dev/index.html).
- Khi gửi link xem HTML cho người dùng, dùng link online tương ứng trên `https://taxiq-nexora-touch.vercel.app/`, thay đường dẫn `html/oneqr-dev/index.html` bằng đường dẫn file HTML tương ứng tính từ gốc dự án.
- Ví dụ:
  - Trang chính: https://taxiq-nexora-touch.vercel.app/html/oneqr-dev/index.html
  - Deals Nearby: https://taxiq-nexora-touch.vercel.app/html/oneqr-dev/nearby.html
  - Search Deals: https://taxiq-nexora-touch.vercel.app/html/oneqr-dev/deals.html
