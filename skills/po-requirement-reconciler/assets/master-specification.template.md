## {{feature_name}} — Master Specification

**Last Updated:** {{updated_date_display}}
**Audience:** PO, BA, UI/UX, DEV, QA
**Status:** Draft
**Feature slug:** {{feature_slug}}
**Baseline:** {{baseline_id_or_none}}
**Hiện trạng web tham chiếu:** {{deployment_snapshot_id_and_reference}}
**Nguồn/căn cứ:** [Feature Master List](feature-master-list.md)
**Quyết định:** [Decision Log](decision-log.md)

### Overview

{{purpose_capabilities_actors_and_scope}}

Tách phạm vi đã xác nhận khỏi nội dung đề xuất. Đây là hành vi mong muốn; mức đáp ứng hiện tại và giới hạn kiểm chứng nằm trong Feature Master List/DEP. Khi có PO mới, so sánh với bản đang deploy; tài liệu này giúp giải thích chủ đích, không thay thế mốc web thực tế.

### Key Concepts

| Thuật ngữ | Ý nghĩa trong tính năng | REQ / EVD |
| --- | --- | --- |
| {{term}} | {{definition}} | {{references}} |

### User Roles

| Vai trò | Thao tác và giới hạn quyền | REQ / EVD / DEC |
| --- | --- | --- |
| {{role}} | {{permissions_and_responsibilities}} | {{references}} |

### End-to-End Workflows

#### Workflow: {{workflow_name}}

**Primary Actor:** {{actor}}
**Trigger:** {{trigger}}
**Outcome:** {{outcome}}
**REQ / EVD / DEC:** {{references}}

**User Stories:**

- As a {{role}}, I want to {{action}}, so that {{benefit}}.

| Bước | Ai thực hiện | Thao tác | Phản hồi / kết quả | REQ / điều kiện / ngoại lệ |
| --- | --- | --- | --- | --- |
| {{step}} | {{role}} | {{action}} | {{response}} | {{requirement_and_conditions}} |

{{mermaid_flowchart_for_this_workflow}}

Lặp khối Workflow cho từng luồng chính. Flowchart phản ánh bảng bước có căn cứ; không thêm hành vi để hoàn thiện sơ đồ.

### System Configuration & Administration

{{configuration_stories_and_references_or_not_applicable}}

### State Lifecycle

| Thực thể | Trạng thái trước | Sự kiện / điều kiện / quyền | Trạng thái sau | REQ / EVD / DEC |
| --- | --- | --- | --- | --- |
| {{entity}} | {{current_state}} | {{trigger_and_guard}} | {{next_state}} | {{references}} |

{{mermaid_state_diagram_if_applicable_otherwise_reason}}

### Business Rules

| REQ | Quy tắc đang có hiệu lực | Điều kiện / ngoại lệ | EVD / DEC |
| --- | --- | --- | --- |
| {{requirement_id}} | {{confirmed_rule}} | {{conditions_and_exceptions}} | {{references}} |

Đánh dấu quy tắc tác động tiền, điều kiện đủ tư cách hoặc trạng thái tài khoản. Ví dụ công thức lấy từ nguồn hoặc ghi rõ minh họa chưa phải chính sách chốt.

### UI References

| Màn hình / trạng thái | Nguồn bố cục, component và nội dung UI | Tương tác | REQ / EVD / DEC |
| --- | --- | --- | --- |
| {{screen_and_state}} | {{source_and_locator}} | {{interaction}} | {{references}} |

Dẫn đúng phần PO; phần PO chưa có dùng staging theo quy tắc dự án. Nội dung thiếu nguồn nằm ở mục mở.

### Edge Cases & Exception Handling

| Tình huống | Hành vi đã xác nhận | Người xử lý | REQ / EVD / DEC |
| --- | --- | --- | --- |
| {{scenario}} | {{expected_behavior}} | {{responsible_role}} | {{references}} |

### Frequently Asked Questions

{{source_backed_faq_or_not_applicable}}

### Related Features

{{linked_feature_requirement_ids_and_dependency_boundaries_or_none}}

### Open Items

{{unconfirmed_items_and_pending_decisions_excluded_from_effective_rules}}

### Version History

| Baseline / bản nháp | Ngày | UPD | Phạm vi thay đổi | DEC / nguồn xác nhận | Bản trước |
| --- | --- | --- | --- | --- | --- |
| {{version}} | {{date}} | {{update_id}} | {{scope}} | {{confirmation_or_draft}} | {{prior_revision}} |
