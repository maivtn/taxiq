## {{feature_name}} — Deployed Baseline — {{deployment_snapshot_id}}

**Last Updated:** {{updated_date_display}}
**Audience:** PO, BA, UI/UX, DEV, QA
**Status:** Snapshot hiện trạng — không phải xác nhận nghiệp vụ
**Thời điểm ghi nhận:** {{observed_date_time_and_timezone}}
**Dùng cho đợt:** {{update_ids}}

### Định danh bản web

| Thông tin | Giá trị | Căn cứ / giới hạn |
| --- | --- | --- |
| URL / môi trường | {{web_url_and_environment}} | {{reference}} |
| Release / build frontend | {{frontend_revision_or_unknown}} | {{version_evidence}} |
| Release / build backend | {{backend_revision_or_unknown}} | {{version_evidence}} |
| Code / artifact ánh xạ với deployed | {{mapped_source_revision_or_unverified}} | {{mapping_evidence_or_limitation}} |
| Vai trò, tiệm/cấu hình, feature flag, ngôn ngữ | {{context_without_secrets_or_personal_data}} | {{context_evidence}} |
| Phạm vi có thể truy cập | {{accessible_scope}} | {{access_limitations}} |

Không suy ra revision deployed từ nhánh main/master hoặc V1. Không lưu thông tin đăng nhập, token hoặc dữ liệu cá nhân thật.

### Hiện trạng dùng để so với PO mới

| REQ / khả năng | Màn hình / trạng thái / điều kiện | Hiện trạng deployed | EVD | Mức kiểm chứng | Phần chưa xác minh |
| --- | --- | --- | --- | --- | --- |
| {{requirement_id_or_capability}} | {{screen_state_context}} | {{deployed_behavior}} | {{evidence_ids}} | {{verification_level}} | {{unknown_scope}} |

### Giới hạn và thay đổi trong lúc phân tích

- Nội dung chưa quan sát hoặc chỉ tìm thấy trong code: {{unverified_items}}.
- Khác biệt với Master Spec, nếu có: {{requirement_drift_without_assuming_either_is_correct}}.
- Thời điểm xác minh lại / dấu hiệu deploy đã đổi: {{recheck_evidence_or_not_rechecked}}.
- DEP kế tiếp, nếu web đã thay đổi: {{next_snapshot_or_none}}.

Giữ nguyên snapshot làm đầu vào cho UPD. Nếu web thay đổi, tạo DEP mới và ghi phần cần đối chiếu lại. Chưa chạy test — chờ yêu cầu của người dùng, trừ các kết quả thực tế được cho phép và dẫn bằng chứng riêng.
