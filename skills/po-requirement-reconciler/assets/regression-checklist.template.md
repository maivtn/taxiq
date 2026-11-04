## {{feature_name}} — Regression Checklist — {{update_id}}

**Last Updated:** {{updated_date_display}}
**Audience:** QA, DEV, PO
**Status:** Draft
**DEP trước thay đổi / phạm vi:** {{deployed_baseline_and_scope}}
**Yêu cầu mong muốn:** {{master_spec_and_confirmed_changes}}
**Nguồn yêu cầu kiểm thử:** {{test_authorization_reference_or_none}}

### Tình huống cần kiểm tra

Bao gồm thay đổi mới, REQ Keep liên quan và ngoại lệ có căn cứ. Remove cần kiểm tra đúng phần bỏ và phần cần giữ. Unclear ghi Blocked nếu chưa xác định được kết quả mong muốn.

| REG | REQ / CHG | Loại: thay đổi / giữ lại / ngoại lệ | Vai trò, dữ liệu và cấu hình | Thao tác | Kết quả mong muốn + căn cứ | Not run / Passed / Failed / Blocked | Bằng chứng thực tế |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{regression_id}} | {{linked_ids}} | {{case_type}} | {{preconditions}} | {{steps}} | {{expected_result_and_reference}} | Not run | Chưa có |

### Kết quả thực tế

- Mặc định: **Chưa chạy test — chờ yêu cầu của người dùng**.
- Chỉ khi được yêu cầu và thực hiện: ghi người kiểm tra, ngày, môi trường, phiên bản, cấu hình và bằng chứng từng kết quả.
- Đọc code hoặc lập checklist không phải Passed. Ghi lỗi đã thấy và phần chưa kiểm tra.
- Kiểm thử tuân thủ hướng dẫn dự án; file test JavaScript nằm trong `tests/`.
