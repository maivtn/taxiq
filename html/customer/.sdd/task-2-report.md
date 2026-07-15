# Task 2 Report: Global Renderer, Modal Controller và Responsive Scan Navigation

## Status

- Hoàn thành Task 2 theo brief và commit trực tiếp trên `main`.
- Commit: `0e927c2` (`feat: complete customer app shell interactions`).
- Commit chỉ chứa hai file sản phẩm được phép sửa; report này được tạo sau commit và không nằm trong commit.

## Đã triển khai

- Mở rộng `COPY`/`translate()`/`t()` hiện có với copy VI/EN cho modal, notification, reset và logout; không tạo dictionary/helper trùng.
- Nâng `renderApp()` thành global renderer: áp dụng ngôn ngữ persisted, render desktop/mobile navigation, render global state, cập nhật active navigation và gọi đúng một `renderDomainViews()` stub.
- Chuyển navigation sang `state.ui.activeScreen`/`state.ui.activeModule`, persist qua `saveState()` và giữ desktop sidebar dùng `nav-item` như cũ.
- Render riêng nút Scan nổi trên mobile bằng `mobile-scan-button`/`mobile-scan-icon`; desktop Scan không đổi treatment.
- Thay overlay cũ bằng dialog controller có content, cancel/confirm actions, callback confirm/cancel, Escape close, body scroll lock và focus confirm.
- Thêm `ACTIONS`, `registerAction()` và delegated lookup trong `handleAction()`; disabled controls bị bỏ qua.
- Giữ các domain handler đã có bằng cách đăng ký lại vào registry, không mở rộng domain behavior và để `renderDomainViews()` rỗng cho task sau.
- Hai notification buttons đánh dấu toàn bộ notification đã đọc rồi mở Activity.
- Edit profile, Payment methods và Privacy details đều mở modal phản hồi thực; Reset demo và Logout dùng modal xác nhận rồi mutate/persist state, điều hướng và toast.
- Thêm các prototype management rows theo brief và bảo đảm mọi enabled button có action contract.

## Bằng chứng TDD

### Focused RED

```bash
node --test --test-name-pattern="every enabled button|raised mobile Scan" html/customer/cutomer-reward.test.mjs
```

- Trước implementation: exit code `1`, `0/2` pass, `2/2` fail.
- Failure thứ nhất chỉ ra notification button đầu tiên chưa có action.
- Failure thứ hai chỉ ra chưa có `mobile-scan-button`, đúng hai behavior Task 2 còn thiếu.

### Focused GREEN

- Cùng lệnh focused sau implementation: exit code `0`, `2/2` pass, `0` fail.

### Full GREEN và post-commit verification

```bash
node --test html/customer/cutomer-reward.test.mjs
git show --check --stat --oneline HEAD
git diff-tree --no-commit-id --name-status -r HEAD
```

- Post-commit full suite: exit code `0`, `18/18` pass, `0` fail/skipped/cancelled/todo.
- `git show --check` sạch.
- Commit chỉ sửa:
  - `html/customer/cutomer-reward.html`
  - `html/customer/cutomer-reward.test.mjs`

## Self-review

- Static action audit đối chiếu button actions với registry: `32` action names trên button, `32` registrations, danh sách thiếu rỗng; sáu global actions bắt buộc đều được đăng ký.
- Chỉ có một `COPY`, một `translate()`, một `t()`, một `applyLanguage()`, một `setLanguage()`, một `renderApp()` và một `renderDomainViews()` stub.
- Không thêm ternary `state.profile.language === 'vi'`; global copy đi qua dictionary nên regression contract Task 1 vẫn giữ.
- Default language vẫn là VI, persisted EN bootstrap không ghi ngược localStorage, và exact screen inventory vẫn là `31`.
- CSS mới nằm trong `@layer components`, không `@apply app-*`; Tailwind v4 compile guard pass.
- Modal action buttons, notification buttons và toàn bộ enabled buttons đều có delegated action; các management action không chỉ gắn attribute mà có handler/modal/callback thực.
- `git diff --check` sạch trước commit; không sửa `SKILL`, plan/spec/brief/progress, `.claude` hoặc file ngoài phạm vi sản phẩm/report.

## Concerns / sequencing

- `renderDomainViews()` cố ý là stub theo boundary Task 2. Các domain functions cũ vẫn được giữ/đăng ký để không làm mất interaction shell, nhưng việc chuyển toàn bộ domain reads/writes từ flat legacy fields sang schema Task 1 thuộc các task domain tiếp theo.
- Worktree còn untracked `docs/superpowers/specs/vi.md` và thư mục `.sdd/` đã có từ trước; chúng không nằm trong commit. Report Task 2 nằm trong `.sdd/` theo yêu cầu và được giữ uncommitted.

---

## Fixer sau accessibility review gate

### Status và commit

- Đã xử lý ba Important findings và test weakness trong phạm vi Task 2.
- Commit: `7cd4a49` (`fix: improve customer shell accessibility`).
- Commit chỉ chứa `html/customer/cutomer-reward.html` và `html/customer/cutomer-reward.test.mjs`; report vẫn uncommitted.

### Thay đổi

1. **Notification state đồng bộ ngay**
   - `open-notifications` gọi `renderGlobalState()` ngay sau khi commit toàn bộ `read=true`, trước khi điều hướng Activity.
   - Runtime VM test xác minh label chuyển từ `Thông báo, 1 chưa đọc` sang `Thông báo, 0 chưa đọc` trong cùng action.

2. **Modal focus controller đầy đủ**
   - Tách callbacks và return target sang `overlayRuntime`/`overlayReturnFocus` ephemeral; `state.ui.overlay` chỉ giữ marker serializable `{ kind: 'dialog' }`, không giữ function/DOM element.
   - `openOverlay()` nhận trigger thực từ action control, fallback về `document.activeElement`, focus confirm và lock body scroll.
   - Tab/Shift+Tab trap giữa các controls đang visible/enabled; dialog có `tabindex="-1"` làm fallback nếu không có focusable control.
   - Escape, cancel, confirm và close đều đi qua `closeOverlay()`; dialog được ẩn/`aria-hidden=true` trước callback.
   - Sau callback, focus chỉ trở về trigger còn connected/visible; nếu callback đã điều hướng hoặc trigger invalid thì focus `screen-region`. Nếu callback mở overlay khác, controller mới giữ focus của nó.
   - Runtime tests cover wrap hai chiều với hidden cancel, Escape restore, disconnected-trigger fallback, cancel/confirm close và matching callbacks.

3. **Close label VI/EN**
   - Thêm `closeDialog` vào `COPY` VI/EN và render label qua `t()` trong `renderGlobalState()`.
   - Bootstrap, `setLanguage()`/`renderApp()` và `openOverlay()` đều chạy path cập nhật label.
   - Runtime persisted-English test xác minh close control có `aria-label="Close dialog"`.

4. **Static-contract tests mạnh hơn**
   - Enabled-button audit chỉ nhận native `disabled`, không còn skip nhầm class Tailwind `disabled:*`.
   - Mỗi `data-action` trên enabled button được đối chiếu với `registerAction(...)`; audit cuối có `32/32`, thiếu `0`.
   - Desktop navigation template được tách và xác minh luôn dùng `nav-item`, không chứa `mobile-scan-button`/`mobile-scan-icon`.

### Bằng chứng TDD fixer

Focused command:

```bash
node --test --test-name-pattern="modal close control|unread notification|traps modal focus|cancel and confirm modal|every enabled button|raised mobile Scan" html/customer/cutomer-reward.test.mjs
```

- RED trước fixer: exit `1`, `3/6` pass, `3/6` fail:
  - close label EN là `undefined` thay vì `Close dialog`;
  - unread label vẫn là `1` thay vì `0` sau action;
  - Tab không bị prevent/wrap trong dialog.
- Global render/label focused GREEN: `2/2` pass.
- Modal focus/callback focused GREEN: `2/2` pass.
- Combined focused GREEN cuối: exit `0`, `6/6` pass.

Full/post-commit verification:

```bash
node --test html/customer/cutomer-reward.test.mjs
git show --check --stat --oneline HEAD
git diff-tree --no-commit-id --name-status -r HEAD
```

- Post-commit full suite: exit `0`, `22/22` pass, `0` fail/skipped/cancelled/todo.
- `git show --check` sạch; commit chỉ chứa đúng hai file code.
- Exact screen inventory vẫn `31`; `renderDomainViews()` vẫn là một stub, không kéo domain work vào fixer.

### Concerns còn lại

- Không phát hiện concern mới trong accessibility shell sau fixer. Việc migrate domain handler khỏi legacy flat fields vẫn thuộc các task domain kế tiếp như sequencing đã ghi ở trên.
- Untracked `docs/superpowers/specs/vi.md` và `.sdd/` không nằm trong fixer commit; report này được append theo yêu cầu và giữ uncommitted.
