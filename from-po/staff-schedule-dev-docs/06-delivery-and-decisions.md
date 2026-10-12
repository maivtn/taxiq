# 06 — Delivery plan, dependencies & decisions

## 1. Thứ tự triển khai đề xuất

| Giai đoạn | Công việc | Đầu ra / gate |
|---|---|---|
| 0. Discovery | Xác nhận nguồn dữ liệu salon hours, service catalog, booking, identity; chốt các [Q] P0 bên dưới; rà migration | Contract và policy được PO/tech lead duyệt |
| 1. Domain foundation | Schema/version/audit/outbox; staff-service eligibility; weekly shift; date override; policy | CRUD + migration có test |
| 2. Availability engine | Interval logic, timezone, service duration/buffer, booking/hold, cache/version | Unit/property + concurrency tests |
| 3. Manager web | Add Staff, schedule editor, impact preview, save/conflict handling | E2E staff → slot |
| 4. Staff app | Today toggle, request/approval status, My Calendar | E2E request → approval → sync |
| 5. Booking integration | Public availability, revalidation at booking commit, failure UX | Không double booking; AC P0 pass |
| 6. Rollout P0 | Backfill, feature flag, telemetry, support runbook, staged release | Metrics ổn và rollback được |
| 7. P1/P2 | Coverage matrix/minimums, suggestions, Promotion Hub contract | Spec/QA riêng sau khi dữ liệu chuẩn ổn |

Không ước lượng ngày công từ prototype: chưa có codebase, schema, booking engine hoặc môi trường triển khai để đối chiếu.

## 2. Work breakdown để tạo tickets

| Epic | Ticket gợi ý |
|---|---|
| Domain | Migrate staff/skill; weekly schedule versioning; date override; app policy; request state machine; audit/outbox |
| Engine | Interval/timezone library; source aggregation; cache/version; availability endpoint; booking atomic validation |
| Manager web | Staff form; schedule editor; impact preview; approval queue; conflict queue; status/error UX |
| Staff app | Today status/toggle; day off/hours/break requests; My Calendar 3 tabs; sync state |
| Booking | Staff filtering; slot display; stale-slot recovery; privacy response |
| Operations | Instrumentation; retry/dead-letter; migration/backfill; feature flag/rollback; support runbook |
| P1/P2 | Coverage minimums; team matrix; suggestions; Promotion Hub read-only signal |

Mỗi ticket nên ghi FR/AC liên quan, API/schema, trạng thái loading/error/empty, quyền, audit và test tối thiểu.

## 3. Quyết định cần chốt trước P0

| ID | Câu hỏi | Đề nghị mặc định [D] | Người chốt |
|---|---|---|---|
| Q-01 | Booking system/catalog/hours hiện lưu ở đâu? | Dùng nguồn hiện hữu, không nhân bản | Tech lead |
| Q-02 | Status booking nào chiếm chỗ? Hold sống bao lâu? | Confirmed + active hold; cancelled không chiếm | Booking owner |
| Q-03 | Slot increment, lead time, booking horizon, buffer là bao nhiêu? | Kế thừa booking policy hiện hữu | Product + booking owner |
| Q-04 | Staff có được làm ca nhiều đoạn/qua nửa đêm? | MVP hỗ trợ nhiều đoạn; qua nửa đêm cần xác nhận | Operations |
| Q-05 | Same-day `ALLOWED` khi có booking cũ xử lý ra sao? | Chuyển pending approval, không xóa booking | Product/Operations |
| Q-06 | Schedule change xung đột booking cũ được áp dụng ngay hay sau xử lý? | Cho phép lưu với conflict queue chỉ khi manager xác nhận tác động | Product |
| Q-07 | `ALLOW_AND_REASSIGN` có trong MVP? | Chưa triển khai | Product |
| Q-08 | Staff level và manager override quyết định eligibility như thế nào? | Explicit service approval, level là guard; override có audit | Product/Operations |
| Q-09 | Owner/Manager/Front desk có ma trận quyền chi tiết nào? | Quyền server theo salon; Owner quản policy | Security/Product |
| Q-10 | Mục tiêu sync, latency, tải và retention audit? | Mục tiêu sơ bộ trong file 01, đo trước cam kết | Engineering/Product |
| Q-11 | Staff app thông báo bằng gì? “Message manager” đi đâu? | Dùng kênh sẵn có; không xây chat mới trong P0 | Product |
| Q-12 | Có mở API cho Promotion Hub/ad platform không? | P2 read-only signal trước, không tự chạy ads | Product/Marketing |

## 4. Rủi ro và cách giảm

| Rủi ro | Cách giảm |
|---|---|
| Dữ liệu lịch/skill cũ thiếu hoặc sai | Backfill có báo cáo, default không public staff chưa đủ dữ liệu, manager review |
| Booking race condition | Revalidate trong transaction và idempotency; load test cùng slot |
| Sync chậm làm UI khác booking | Versioned response, status pending/failed, server là source of truth |
| Manager đổi lịch làm ảnh hưởng booking cũ | Impact preview, policy rõ, conflict queue, audit |
| Timezone/DST sai | Lưu IANA timezone, test transition, UTC cho timestamp |
| Coverage alert gây false positive | Cấu hình minimum/minMinutes, đo cùng capacity slot, rollout P1 riêng |
| Promotion automation gây chi phí sai | Chỉ phát tín hiệu P2, cần xác nhận trước hành động quảng cáo |

## 5. Handoff cho dev/QA/product

- **Dev:** dùng file 02–04 làm contract đề xuất; xác minh các dependency Q-01–Q-04 trước khi xây endpoint.
- **QA:** lấy AC ở file 05 làm test plan; gắn mỗi bug với FR/AC.
- **Product/Operations:** chốt bảng quyết định; review copy thông báo conflict, approval và booking slot mất.
- **Design:** prototype là tham chiếu bố cục; bổ sung trạng thái loading, empty, validation, pending, error, mobile accessibility.

## 6. Release checklist

Schema migration và rollback đã thử; backfill có số bản ghi thành công/lỗi; flag bật theo salon; metrics và alert sẵn; support biết cách tra conflict/audit; smoke test trên salon thử nghiệm; so sánh slot cũ/mới trước mở rộng; Owner/Manager đã kiểm tra quyền và dữ liệu calendar.
