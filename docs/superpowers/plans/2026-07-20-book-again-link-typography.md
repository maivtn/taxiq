# Book Again Link Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thu nhỏ nút “Book again” trong thẻ lịch hẹn Home xuống 12px, thêm gạch chân và giữ vùng bấm tối thiểu 44px.

**Architecture:** Chỉ thay đổi utility classes trên nút điều hướng hiện có; không đổi JavaScript, dữ liệu hay bản dịch. Một kiểm thử cấu trúc đọc HTML thật và xác nhận các class yêu cầu trên đúng nút.

**Tech Stack:** HTML, Tailwind CSS Browser v4 utility classes, Node.js `node:test`.

## Global Constraints

- Chỉ chỉnh nút `Book again` / `Đặt lại lịch` trong thẻ lịch hẹn sắp tới ở màn hình Home.
- Dùng `text-xs`, `underline`, `underline-offset-4` và `min-h-11`.
- Không thay đổi nhãn “Upcoming booking”, nội dung song ngữ hay hành động `navigate` tới `book1`.

---

### Task 1: Compact underlined Book Again link

**Files:**
- Modify: `html/customer/cutomer-reward.html:139`
- Test: `html/customer/cutomer-reward.test.mjs`

**Interfaces:**
- Consumes: nút có `data-action="navigate"`, `data-target="book1"`, `data-en="Book again"`.
- Produces: cùng nút với các class `text-xs`, `underline`, `underline-offset-4`, `min-h-11`; hành vi giữ nguyên.

- [ ] **Step 1: Write the failing test**

```js
test('styles the upcoming appointment Book again action as a compact underlined link', () => {
  const source = html();
  const match = source.match(/<button type="button" class="([^"]*)" data-action="navigate" data-target="book1" data-en="Book again"/);
  assert.ok(match, 'upcoming appointment Book again action must exist');
  const classes = new Set(match[1].split(/\s+/));
  for (const className of ['text-xs', 'underline', 'underline-offset-4', 'min-h-11']) {
    assert.ok(classes.has(className), `Book again action must include ${className}`);
  }
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run: `node --test --test-name-pattern="styles the upcoming appointment Book again" html/customer/cutomer-reward.test.mjs`

Expected: FAIL vì nút chưa có `text-xs`.

- [ ] **Step 3: Add the minimal utility classes**

Đổi class của đúng nút thành:

```html
class="app-link mt-3 inline-flex min-h-11 items-center justify-center text-xs underline underline-offset-4"
```

- [ ] **Step 4: Verify GREEN and regression suite**

Run: `node --test --test-name-pattern="styles the upcoming appointment Book again" html/customer/cutomer-reward.test.mjs`

Expected: PASS.

Run: `node --test html/customer/cutomer-reward.test.mjs`

Expected: toàn bộ test PASS, không có lỗi hoặc cảnh báo.

- [ ] **Step 5: Commit implementation**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs docs/superpowers/plans/2026-07-20-book-again-link-typography.md
git commit -m "style: compact book again link"
```
