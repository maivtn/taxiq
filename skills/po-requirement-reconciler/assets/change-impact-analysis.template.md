## {{feature_name}} — Change Impact Analysis — {{update_id}}

**Last Updated:** {{updated_date_display}}
**Audience:** PO, BA, UI/UX, DEV, QA
**Status:** Draft
**Mốc đối chiếu chính — deployed:** {{deployment_snapshot_id_and_reference}}
**URL / phiên bản / thời điểm / ngữ cảnh:** {{deployed_identity_and_context}}
**Master Spec / baseline yêu cầu tham chiếu:** {{requirement_baseline_id_or_none}}
**Nguồn mới:** {{new_source_ids}}
**Yêu cầu đợt cập nhật và nguồn:** {{requested_change_and_reference}}
**Phạm vi được giao:** {{authorized_scope}}

### Kết luận để triển khai

- Phần đã rõ: {{resolved_scope}}.
- Phần giữ lại: {{preserved_scope}}.
- Phần chờ quyết định: {{pending_scope_and_decision_ids}}.
- Lỗi/thiếu sót đã tồn tại: {{pre_existing_gaps}}.
- Giới hạn nguồn và kiểm chứng: {{analysis_limitations}}.

### Bảng thay đổi

So sánh PO mới với DEP đã ghi nhận; không lấy PO V1 làm cột hiện trạng. Tách UI/nghiệp vụ khi có phạm vi hoặc quyết định khác nhau. Replace/Remove phải có căn cứ rõ; nếu thiếu dùng Unclear.

| CHG | REQ | Lớp thay đổi | Hiện trạng trên DEP + căn cứ | PO mới / hành vi được yêu cầu | Loại | EVD | Quyết định: Not needed / Pending / Resolved + DEC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{change_id}} | {{requirement_ids}} | {{change_layer}} | {{deployed_behavior_and_evidence}} | {{proposed_behavior}} | {{change_type}} | {{evidence_ids}} | {{decision_status_and_reference}} |

### Khác biệt với tài liệu / PO cũ

{{historical_context_and_master_spec_drift_not_used_as_primary_comparison}}

### Tác động và phạm vi sửa

API/database chỉ ghi khi có căn cứ; với prototype, dùng không áp dụng/chưa xác định thay vì tự thiết kế backend.

| CHG | Màn hình / component / file | Quy tắc / trạng thái / dữ liệu / API | Module phụ thuộc | Rủi ro cụ thể | Hướng sửa trong phạm vi |
| --- | --- | --- | --- | --- | --- |
| {{change_id}} | {{affected_ui_or_files}} | {{affected_logic_and_data}} | {{linked_feature_requirement_ids}} | {{regression_risk}} | {{implementation_boundary}} |

### Điểm cần quyết định

| DEC | CHG / REQ | Mâu thuẫn / thiếu thông tin | Lựa chọn và tác động | Đề xuất để review | Câu hỏi cụ thể |
| --- | --- | --- | --- | --- | --- |
| {{decision_id}} | {{linked_ids}} | {{conflict_or_gap}} | {{options_and_consequences}} | {{recommendation_not_a_decision}} | {{question}} |

### Khả năng cần giữ

| REQ | Hành vi còn hiệu lực | CHG có thể tác động | REG dự kiến |
| --- | --- | --- | --- |
| {{requirement_id}} | {{preserved_behavior}} | {{change_ids}} | {{regression_ids}} |

### Cập nhật Master Specification

{{sections_to_change_and_exact_proposed_rules}}

Phần chờ xác nhận dẫn bản đề xuất riêng. Nêu phần đã cập nhật master và căn cứ tương ứng.

### Kiểm thử và bàn giao

- Checklist: {{regression_checklist_reference}}.
- Mặc định: **Chưa chạy test — chờ yêu cầu của người dùng**.
- Sản phẩm đã sửa, nếu được giao: {{actual_product_changes_or_none}}.
- Commit triển khai / release thực tế, nếu có: {{revision_or_unknown}}.
