## {{feature_name}} — Feature Master List

**Last Updated:** {{updated_date_display}}
**Audience:** PO, BA, UI/UX, DEV, QA
**Status:** Draft
**Feature slug:** {{feature_slug}}
**Người phụ trách:** {{owner_or_unknown}}
**Mốc deployed dùng đối chiếu:** {{deployment_snapshot_id_and_reference}}
**Baseline yêu cầu, nếu có:** {{requirement_baseline_id_or_none}}

### Phạm vi

- Màn hình/luồng: {{scope}}.
- Vai trò, ngôn ngữ, trạng thái, cấu hình: {{context}}.
- Ngoài phạm vi: {{excluded_scope}}.
- Môi trường/phiên bản web thực tế và snapshot: {{deployed_environment_and_snapshot}}.
- Code được đọc và mức xác minh ánh xạ với deployed: {{source_revision_and_deployment_mapping}}.

### Danh mục nguồn

Giữ nguồn gốc; tách ngày tài liệu, ngày nhận và ngày demo. Không lấy ngày demo làm thứ tự phiên bản.

| SRC | Nguồn / đường dẫn / URL | Loại, phiên bản / commit / checksum | Ngày tài liệu | Ngày nhận | Phạm vi, ngữ cảnh và giới hạn |
| --- | --- | --- | --- | --- | --- |
| {{source_id}} | {{source_reference}} | {{source_type_and_revision}} | {{source_date_or_unknown}} | {{received_date}} | {{source_scope_and_limitations}} |

### Sổ căn cứ

Mỗi nhận định dẫn về EVD. Với kết luận không tìm thấy, ghi phạm vi đã tìm và giới hạn.

| EVD | SRC | Vị trí: mục / trang / dòng / hàm / ảnh | Nội dung chứng minh | Thời điểm, môi trường và giới hạn |
| --- | --- | --- | --- | --- |
| {{evidence_id}} | {{source_id}} | {{locator}} | {{supported_observation}} | {{evidence_context}} |

### Danh sách yêu cầu

Hiệu lực, mức đáp ứng và mức kiểm chứng độc lập theo chuẩn. Một nút trong HTML chưa chứng minh luồng nghiệp vụ đã được triển khai.

| REQ | Khả năng / điều kiện / kết quả | Hiệu lực | Mức đáp ứng trên DEP đang dùng | Mức kiểm chứng | EVD | DEC / nguồn xác nhận | Mục Master Spec |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{requirement_id}} | {{requirement_statement}} | Unconfirmed | Unknown | Not checked | {{evidence_ids}} | {{confirmation_reference}} | {{master_spec_anchor}} |

### Lịch sử baseline

Chỉ ghi BL có căn cứ xác nhận. Nếu chưa có, ghi “Chưa có baseline được xác nhận” thay cho dòng mẫu.

| BL | Ngày | Phạm vi / UPD | DEC / nguồn xác nhận | Bản trước có thể truy lại |
| --- | --- | --- | --- | --- |
| {{baseline_id}} | {{baseline_date}} | {{baseline_scope}} | {{confirmation_reference}} | {{prior_commit_or_snapshot}} |

### Snapshot deployed

| DEP | Môi trường / bản deploy | Thời điểm ghi nhận | Hồ sơ snapshot | UPD sử dụng |
| --- | --- | --- | --- | --- |
| {{deployment_snapshot_id}} | {{deployed_environment_and_revision}} | {{observed_date}} | {{snapshot_reference}} | {{update_ids}} |

### Thông tin còn thiếu

{{missing_sources_and_unconfirmed_requirements}}
