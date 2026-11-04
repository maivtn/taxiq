---
name: po-requirement-reconciler
description: Use when a feature has multiple PO HTML prototypes or specifications with unclear change scope, or when the user requests a consolidated requirement baseline, change impact analysis, or PO decision log. Applies across features; ordinary UI edits do not require this workflow.
---

# PO Requirement Reconciler

Đối chiếu PO mới với **bản thực tế đã deploy trên web** của từng tính năng, giữ nguồn và lịch sử quyết định. Web có thể chứa nhiều chỉnh sửa sau PO cũ; không lấy V1 hoặc code nhánh chính thay cho bản deployed.

## Phạm vi sử dụng

- Đọc hướng dẫn dự án và yêu cầu hiện tại. Tìm nguồn/phạm vi còn thiếu trong repo trước khi hỏi.
- Dùng cho yêu cầu đối chiếu hoặc lập hồ sơ. Không biến bộ chuẩn thành điều kiện bắt buộc cho mọi chỉnh sửa prototype.
- Tách phân tích khỏi sửa sản phẩm. Chỉ sửa HTML/code, gửi thông tin ra ngoài hoặc chạy kiểm thử khi thuộc phạm vi đã được cho phép. Lập checklist không có nghĩa là được chạy checklist.
- Giữ cách tổ chức hồ sơ đã có. Hồ sơ mới trong dự án này dùng tiếng Việt và lưu tại `docs/requirements/<feature-slug>/`.

## Thực hiện

Đọc [chuẩn đối chiếu](references/reconciliation-standard.md), rồi chọn chế độ:

| Yêu cầu | Thực hiện |
| --- | --- |
| Khởi tạo hồ sơ | Xác định môi trường web, ghi snapshot deployed có phiên bản/ngữ cảnh; kiểm kê yêu cầu và soạn đặc tả hợp nhất. Phần chưa xác nhận vẫn là dự thảo. |
| Nhận đợt PO mới | Xác minh bản đang deploy, đối chiếu trực tiếp PO mới với snapshot đó; lập `UPD-xxx`. Dùng Master Spec, PO cũ và quyết định để giải thích delta, không thay mốc deployed. |
| Ghi quyết định / cập nhật baseline | Dùng câu trả lời thực tế, cập nhật đúng REQ, đặc tả và lịch sử. Không tự điền người duyệt hoặc suy ra xác nhận từ im lặng. |

Trong mọi chế độ:

1. Ghi URL/môi trường, thời điểm, phiên bản deploy nếu xác minh được, vai trò/cấu hình và phạm vi quan sát. Chỉ dùng code làm bằng chứng của deployed khi có liên kết phiên bản tương ứng; thiếu xác minh thì ghi giới hạn.
2. So sánh cùng màn hình, vai trò, trạng thái, cấu hình và luồng. Không dùng số dòng diff hoặc độ giống HTML để kết luận nghiệp vụ.
3. Dẫn căn cứ cho mỗi nhận định. Tách hiện trạng deployed, yêu cầu còn hiệu lực và khả năng chỉ tìm thấy trong code. Không tự coi hành vi/lỗi đang có trên web là yêu cầu đã được duyệt.
4. Phân loại `Keep / Add / Enhance / Replace / Remove / Unclear` dựa trên PO mới so với deployed. Bảo toàn phần hiện có ngoài phạm vi; vắng trong PO mới chưa đủ căn cứ xóa. PO cũ chỉ là lịch sử, không tự khôi phục mọi chức năng của V1.
5. Tách bố cục/style, nội dung UI, tương tác, nghiệp vụ, trạng thái, dữ liệu/quyền và tích hợp. Không suy ra đổi toàn bộ UI từ một yêu cầu thêm chức năng.
6. Xử lý phần rõ ràng trong phạm vi được giao; chỉ hỏi mâu thuẫn hoặc thông tin quan trọng còn thiếu. Chỉ dẫn hiện tại đã rõ là căn cứ, không xin duyệt lại. Nếu không tiếp cận/xác minh được web, ghi phần đối chiếu deployed còn thiếu thay vì lấy V1 làm mốc.

## Biểu mẫu và bàn giao

Chỉ sao chép mẫu cần dùng, điền biến `{{...}}`, bỏ mục không áp dụng kèm lý do:

- [Deployed Baseline](assets/deployed-baseline.template.md): snapshot bản web thực tế làm mốc đối chiếu.
- [Feature Master List](assets/feature-master-list.template.md): nguồn, căn cứ, sổ yêu cầu.
- [Master Specification](assets/master-specification.template.md): hành vi hợp nhất.
- [Change Impact Analysis](assets/change-impact-analysis.template.md): delta và tác động từng đợt.
- [Decision Log](assets/decision-log.template.md): câu hỏi và quyết định.
- [Regression Checklist](assets/regression-checklist.template.md): phạm vi kiểm tra, mặc định chưa chạy.

[Hướng dẫn dùng chung](../../docs/requirements/README.md) có cấu trúc lưu trữ và câu lệnh mẫu. Khi bàn giao, nêu phần đã rõ, phần chờ quyết định, giới hạn nguồn và trạng thái kiểm thử thực tế. Đọc code không chứng minh luồng đã chạy đúng.
