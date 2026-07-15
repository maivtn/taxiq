# Task 1 Report: Versioned Demo Database và Test Harness

## Status

- Hoàn thành Task 1 theo brief và commit trên `main`.
- Commit: `a90f5751a5f87fabbfe89fcd2c42bc84500e062b` (`feat: add customer prototype local storage state`).
- Commit chỉ chứa hai file sản phẩm được phép sửa.

## Đã triển khai

- Thay flat state bằng demo database có `schemaVersion: 1`, `updatedAt`, session/profile, ba business, staff, balance riêng từng business, ledger và các collection/domain state theo brief.
- Thêm `createDefaultState()`, recursive `mergeRecord()`, `migrateState()`, `loadState()`, `saveState()` và `commitState()`.
- Dùng storage key `nexora.customer.prototype.v1`.
- `migrateState()` merge dữ liệu cũ với defaults, ép schema version hiện tại và loại bỏ hai key flat legacy `pointBalance`/`savedOffers`.
- `loadState()` tạo/persist state mặc định khi chưa có dữ liệu; khi JSON hỏng, lưu raw value vào key backup có timestamp trước khi phục hồi defaults.
- Thêm testable entry point `initializeApp()` và expose API storage qua `window.NEXORA_TEST_API`; hỗ trợ `window.NEXORA_SKIP_INIT` cho Node VM harness.
- Thêm in-memory Storage và runtime extraction bằng `node:vm`, cùng hai test cho default schema/balance và persistence/corrupt recovery.

## Bằng chứng TDD

### RED

Lệnh:

```bash
node --test --test-name-pattern="versioned|persists state" html/customer/cutomer-reward.test.mjs
```

Kết quả trước implementation: exit code `1`, `0/2` pass, `2/2` fail. Cả hai test dừng với `ReferenceError: document is not defined` vì script cũ vẫn khởi tạo trực tiếp và chưa có testable entry point/API storage. Đây là failure đúng phần chức năng còn thiếu mà Task 1 bổ sung.

### Focused GREEN

Cùng lệnh focused sau implementation: exit code `0`, `2/2` pass, `0` fail.

### Full GREEN

Lệnh:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Kết quả: exit code `0`, `11/11` pass, `0` fail, `0` skipped/cancelled/todo.

Kiểm tra bổ sung:

```bash
git diff --check
git show --check --stat --oneline HEAD
git diff-tree --no-commit-id --name-status -r HEAD
```

Kết quả: không có whitespace error; commit chỉ sửa đúng hai file sản phẩm.

## File thay đổi trong commit

- `html/customer/cutomer-reward.html`
- `html/customer/cutomer-reward.test.mjs`

File report này được tạo sau commit và không nằm trong commit, đúng yêu cầu.

## Tự review

- API/schema/storage behavior khớp code block trong brief; `SCREEN_MODULE`, `ROOT_SCREENS`, `NAV_ITEMS` và reward constants vẫn nằm ngay sau foundation.
- Default language là `vi`; balances vẫn tách theo business; legacy `pointBalance` không còn trong default state.
- Corrupt raw JSON được backup trước khi ghi state phục hồi; test dùng timestamp cố định để xác minh chính xác key.
- `saveState()` cập nhật `updatedAt`; `commitState()` trả lại kết quả mutator và persist state.
- Không sửa plan/spec/brief/progress, `.claude`, `docs/superpowers`, hoặc file ngoài `html/customer`.
- Không phát hiện lỗi trong phạm vi API được test của Task 1.

## Vấn đề / lưu ý sequencing

- Entry point được brief yêu cầu gọi `handleChange`, `handleKeydown` và `renderApp`, trong khi các hàm này chưa tồn tại ở base commit; các interaction cũ cũng vẫn đọc flat state. Vì `NEXORA_SKIP_INIT` là `true` trong harness, suite Task 1 vẫn GREEN. Plan giao renderer/handlers và chuyển state access cho các task tiếp theo, nên commit Task 1 riêng lẻ chưa phải browser-runnable end state. Không tự thêm shim ngoài brief để tránh quyết định kiến trúc vượt phạm vi.
- Final worktree check cho thấy thay đổi ngoài task `D html/customer/SKILL.md` và untracked `docs/superpowers/specs/vi.md`; chúng không do Task 1 tạo, không nằm trong commit và được giữ nguyên. Report nằm trong untracked `html/customer/.sdd/` theo yêu cầu.

---

## Fixer sau review gate

### Status và commit

- Đã xử lý ba Important findings của review trong phạm vi Task 1.
- Fixer commit: `785ae6e` (`fix: harden customer state foundation`).
- Commit chỉ chứa `html/customer/cutomer-reward.html` và `html/customer/cutomer-reward.test.mjs`.

### Thay đổi đã triển khai

1. **Schema-safe migration**
   - `mergeRecord()` nay đi theo shape của defaults và chỉ duyệt các key đã biết, thay vì copy các key của input.
   - Record/array/primitive sai loại fallback về default; number phải hữu hạn; field mặc định `null` không nhận object tùy ý.
   - `profile.language` ngoài `vi`/`en` fallback về `vi`.
   - `profile:null`, `balances:[]`, `session:'invalid'`, `wishes:{}`, boolean sai loại, unknown root/nested keys và invalid overlay đều được sanitize.
   - Valid JSON malformed được migrate, không bị backup như corrupt JSON; corrupt syntax vẫn giữ behavior backup timestamp đã có.

2. **Nested language và shared dictionary**
   - Đã loại toàn bộ consumer `state.language`; tất cả dùng `state.profile.language`.
   - Thêm `COPY`, pure `translate(language, key, variables)` và wrapper `t()`; các chuỗi động trong phạm vi finding dùng chung dictionary/helper, gồm nội suy amount/method.
   - `setLanguage()` mutate/persist nested language qua `commitState()`.
   - Expose pure `translate` trong `window.NEXORA_TEST_API` để runtime regression test kiểm tra VI/EN và fallback VI.

3. **Browser-load-safe entry point**
   - Bỏ listener `handleChange` chưa tồn tại.
   - Thêm `handleKeydown()` có tên rõ ràng, giữ Escape-to-close behavior cũ.
   - Thêm `renderApp()` tối thiểu chỉ gom initialization hiện tại: navigation, active nav và Lucide.
   - VM browser-mode chạy với `NEXORA_SKIP_INIT=false` và document stub để chứng minh initializer không còn ReferenceError; listener đăng ký đúng `click`, `input`, `keydown`.

4. **Workspace hygiene**
   - Khôi phục `html/customer/SKILL.md` chính xác theo nội dung HEAD bằng `apply_patch`.
   - `git diff --exit-code -- html/customer/SKILL.md` trả exit code `0`; SKILL không nằm trong fixer commit.
   - Không chạm untracked `docs/superpowers/specs/vi.md`.

### Bằng chứng TDD fixer

#### Finding 1 — malformed state

```bash
node --test --test-name-pattern="malformed fields" html/customer/cutomer-reward.test.mjs
```

- RED đầu tiên: exit `1`, `0/1` pass; assertion cho thấy actual `profile` là `null` thay vì profile default.
- RED self-review edge: exit `1`, `0/1` pass; invalid overlay object được giữ thay vì `null`.
- GREEN cuối: exit `0`, `1/1` pass.

#### Finding 2 — nested language/dictionary

```bash
node --test --test-name-pattern="nested profile language" html/customer/cutomer-reward.test.mjs
```

- RED: exit `1`, `0/1` pass; static guard tìm thấy legacy `state.language`.
- Một vòng GREEN đầu phát hiện contract nội suy thiếu ký hiệu `$`; dictionary/caller được chỉnh thống nhất.
- GREEN cuối: exit `0`, `1/1` pass; runtime translator trả đúng VI/EN và fallback VI.

#### Finding 3 — browser initializer

```bash
node --test --test-name-pattern="entry-point dependencies" html/customer/cutomer-reward.test.mjs
```

- RED: exit `1`, `0/1` pass; `assert.doesNotThrow` nhận `ReferenceError: handleChange is not defined`.
- GREEN: exit `0`, `1/1` pass.

#### Full suite và static gates

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
rg -n '\bstate\.language\b' html/customer/cutomer-reward.html
git diff --exit-code -- html/customer/SKILL.md
```

- Pre-commit full suite: exit `0`, `14/14` pass, `0` fail/skipped/cancelled/todo.
- `git diff --check`: sạch.
- `state.language`: không có match.
- SKILL diff: sạch.

### Self-review fixer

- Ba regression test chạy code thật từ inline script qua `node:vm`; browser initializer test không chỉ kiểm tra regex mà thực thi nhánh init.
- Unknown root/nested keys không còn lọt qua migration; field sai container/primitive type fallback defaults; valid malformed JSON không bị đánh dấu corrupt.
- Toàn file không còn đường dẫn `state.language`; text động được chuyển trong finding đều gọi dictionary hoặc indexed localized data.
- Entry point chỉ khôi phục behavior init cũ và không kéo action registry/modal/domain renderer của Task 2 vào Task 1.
- `git show --check` sạch; fixer commit chỉ có đúng hai file sản phẩm.

### Concerns còn lại

- Các consumer flat state khác ngoài language vẫn thuộc các task tiếp theo trong plan; fixer chỉ bảo đảm browser load không ReferenceError như review yêu cầu, không triển khai trước Task 2.
- Dòng cũ phía trên report nói SKILL đang bị xóa là snapshot trước fixer; trạng thái sau fixer đã được khôi phục và diff SKILL sạch như mục Workspace hygiene.

---

## Fixer vòng 2 sau re-review

### Status và commit

- Đã xử lý đúng hai Important findings của re-review, không triển khai Task 2.
- Commit: `c05b1ee` (`fix: validate persisted customer state`).
- Commit chỉ chứa `html/customer/cutomer-reward.html` và `html/customer/cutomer-reward.test.mjs`.

### Finding 1 — collection elements và nullable unions

- `mergeRecord()` nay mang theo path để chọn sanitizer theo đúng field.
- Mọi string array hiện có trong foundation (payment/business/staff methods, welcome claims, saved offers, wishes, followed tech IDs và offline queue) chỉ giữ non-empty string; null/object/number/boolean bị loại.
- Mọi object collection hiện có dùng core-field schema permissive. Record chỉ được giữ khi identity/business/reference fields nền tảng đúng type; extra fields được giữ để record hợp lệ ở task sau không bị rơi.
- Ledger yêu cầu `id`, `businessId`, `type`, finite `pointsDelta`, `refType`, `refId`, `createdAt`; do đó record thiếu/sai `businessId` không thể lọt qua migration.
- Nullable unions được xử lý tường minh:
  - `balances.*.expiringPoints`: `null` hoặc `{ amount: finite number, date: string }`; unknown object keys bị bỏ.
  - `ui.currentRewardKey`: `null|string`.
  - `ui.overlay`: `null|plain object`.
  - Giá trị union invalid fallback theo default của đúng field/business.
- Regression giữ một ledger/visit có extra future field để chứng minh validation không ép exact shape.

### Finding 2 — persisted language bootstrap

- Tách `applyLanguage(language)` chỉ cập nhật DOM language, bilingual text, placeholders, language controls, navigation/reward display và icons; không gọi `commitState()`/`saveState()`.
- `setLanguage()` commit `state.profile.language` rồi gọi `applyLanguage()`.
- `renderApp()` gọi `applyLanguage(state.profile.language)` ngay sau load.
- Browser-mode regression seed raw localStorage với `{ profile: { language: 'en' } }`, chạy init thật qua VM/document stubs và xác minh:
  - `document.documentElement.lang === 'en'`;
  - text và placeholder chuyển sang EN;
  - VI/EN controls có `aria-pressed` đúng;
  - raw localStorage giữ nguyên byte-for-byte, chứng minh bootstrap không persist lại.

### Bằng chứng TDD vòng 2

#### Collection/nullable RED → GREEN

```bash
node --test --test-name-pattern="collection elements" html/customer/cutomer-reward.test.mjs
```

- RED: exit `1`, `0/1` pass; `migrated.ledger.length` là `3`, expected `1`.
- GREEN: exit `0`, `1/1` pass.

#### Persisted language RED → GREEN

```bash
node --test --test-name-pattern="persisted English" html/customer/cutomer-reward.test.mjs
```

- RED: exit `1`, `0/1` pass; actual DOM language `vi`, expected `en`.
- GREEN: exit `0`, `1/1` pass.

#### Full suite và scope gates

```bash
node --test html/customer/cutomer-reward.test.mjs
git diff --check
git show --check --stat --oneline HEAD
git diff-tree --no-commit-id --name-status -r HEAD
git diff --exit-code -- html/customer/SKILL.md
```

- Pre-commit full suite: exit `0`, `16/16` pass, `0` fail/skipped/cancelled/todo.
- Diff/show checks sạch; commit chỉ có đúng hai file sản phẩm.
- `html/customer/SKILL.md` không có diff và không nằm trong commit.
- Không chạm untracked `docs/superpowers/specs/vi.md`.

### Self-review cụ thể hai risk

- Rà toàn bộ array fields trong `createDefaultState()`: mỗi path hiện tại đều được phân loại thành string array hoặc object collection; không còn fallback clone mù cho array path chưa biết.
- Rà business isolation: mọi ledger record được giữ bắt buộc có non-empty string `businessId` và toàn bộ field ledger nền tảng đúng type; invalid records bị filter thay vì được bổ sung dữ liệu giả.
- Rà future compatibility: object validators chỉ yêu cầu stable core fields, không strip extra fields; shape record dự kiến ở các task sau đáp ứng các core fields này.
- Rà nullable persistence: valid object/null/string unions survive; invalid unions fallback đúng default, kể cả business có default expiring object khác business default null.
- Rà bootstrap: runtime test chạy với `NEXORA_SKIP_INIT=false`; `applyLanguage` được static guard không chứa storage mutation và storage seed được runtime guard không đổi.
- Không phát hiện issue mới trong phạm vi hai findings.

### Concern duy trì

- Khi foundation thêm một collection mới trong tương lai, cần khai báo core fields hoặc string-array path tương ứng; `mergeArray()` cố ý fallback default cho path chưa biết thay vì clone dữ liệu chưa validate.
