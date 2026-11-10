# NEXORA Community Food — bản standalone (tách riêng từ Community)

Ngày làm: 2026-11-10 · Nguồn: bản Food trong gói Community giao Dev 05/11.

## 1. Nguồn lấy từ đâu

File gốc (chỉ đọc, **không sửa**):

`goi-2026-11-05/goi-community-giao-dev/04-MAN-HINH-PROTOTYPE/food.html`
— 1,9 MB, 400 dòng, 1 khối `<style>` (~9,1 KB CSS), 1 khối `<script>`,
0 SVG inline, 16 ảnh nhúng dạng base64, 0 link ngoài.
Tiêu đề: “Food Community — NEXORA Community · Prototype tương tác”.

File gốc vẫn nguyên vẹn (sha256 `5aefa50dfabd8a4cabe8537a9ad5e099d608c28bf90c74da8e7e48ce3aa71ed5`).
Bản này là bản sao đã nâng cấp, đặt trong thư mục riêng:

```
NEXORA_Community_Food_standalone_2026-11-10/
├── food.html                  (bản sao đã nâng cấp — mở file này)
├── assets/
│   ├── lucide.js              (61 icon Lucide, offline, không CDN)
│   └── food-ui-polish.css     (ghi đè hierarchy / button / mobile)
└── README_FOOD_VI.md          (file này)
```

## 2. Đã thay đổi gì

### a. Icon → Lucide (vendored, offline, cùng API như bản home)

- `assets/lucide.js`: 61 icon — 50 icon gốc lấy từ bản home
  (`home-C-enhanced/assets/lucide.js`) + 11 icon mới cho Food:
  `search, flame, tv, pen-line, heart, chef-hat, ticket, link, lock, plus, x`.
  11 icon mới đều lấy path SVG chính thức từ `lucide-static@latest`,
  đã kiểm tra XML parse được từng file. Không bịa path SVG nào.
- Trong `food.html` có **33 chỗ `<i data-lucide="…">`** (22 icon khác nhau):
  19 chỗ trong HTML tĩnh + 14 chỗ trong chuỗi JS (feed/bài đăng/deal/vùng,
  toast, chuỗi tiếng Anh I18N, nút tour).
- Trước: 34 ký tự emoji/glyph làm icon (không tính base64).
  Sau: **27 ký tự được thay bằng icon Lucide** (25 chỗ gắn icon + 2 emoji
  trong `<option>` của ô chọn Loại đã bỏ hẳn — trình duyệt không vẽ được
  HTML/icon bên trong `<option>` native, chỉ còn chữ), **2 dấu “+” đầu nút**
  (“+ Tạo Fanpage / Nhóm”, “+ Tạo trang / nhóm…”) đổi thành icon `plus`.
  **7 ký tự sao ★ (6) / ☆ (1) được GIỮ NGUYÊN** vì đó là thang chấm sao
  dạng text (`starpick` và `starRow()`), đúng như yêu cầu.
- Bảng đổi icon: 🍜→`utensils`, 🔎→`search`, ⭐/★ (ngoài thang sao)→`star`
  (tô màu bằng CSS `fill:currentColor`), 🌍→`globe`, 🏠→`home`, 🔥→`flame`,
  📺→`tv`, ✍️→`pen-line`, 💬→`message-circle`, ❤️→`heart`, ↗️→`share-2`,
  👥→`users` (đã bỏ trong `<option>`, xem trên), 🍳→`chef-hat`, 📍→`map-pin`,
  🎟️→`ticket`, 🔗→`link`, 🔐→`lock`, ✦→`sparkles`, +→`plus`,
  Đóng→`x`, Tạm dừng→`pause` (khi bấm chuyển thành “Tiếp tục” thì icon
  đổi thành `play`), Tiếp→`arrow-right`.
- Feed/bài đăng/deal/vùng được JS render lại — sau mỗi lần render đều gọi
  lại `lucide.createIcons()` (hàm `refreshIcons()`): `renderRegions`,
  `renderPages`, `renderFeed`, `renderDeals`, `toast`, khi đổi ngôn ngữ
  VI/EN, khi bấm Tạm dừng/Tiếp tục ở tour, và lúc khởi động trang.
  Nhờ vậy icon không mất khi đổi ngôn ngữ hay khi feed render lại.
  (Lưu ý kỹ thuật: nút Tạm dừng trước đây dùng `textContent=` nên sẽ xóa
  mất icon; đã đổi sang `innerHTML` + gọi lại `createIcons()`.)

### b. Hierarchy — thống nhất trong `assets/food-ui-polish.css`

Chỉ ghi đè bằng CSS ngoài, **không viết lại khối `<style>` gốc**:

- H1 hero: `clamp(28px, 6vw, 36px)`, line-height 1,15.
- H2 modal: `clamp(20px, 4.5vw, 24px)`, line-height 1,25.
- Tiêu đề section (`.card h3`): 17px / 600.
- Body: 14px; chữ nhỏ/meta: 12,5px.
- Màu sắc giữ nguyên 100% (`--bg:#f6f4ef`, `--blue:#2f6bff`,
  `--brand:#e8590c`, `--brand2:#f76707`, `--ink:#1d2433`, `--mut:#6b7686`,
  `--line:#e6e9f0`, `--card:#fff`, `--green:#1e9e50`).

### c. Button — thống nhất

- Mọi `.btn`: radius 12px, weight 600, padding 10px 16px, cao tối thiểu
  44px, icon + chữ căn giữa theo hàng.
- Nút chính: nền cam brand; nút xanh: `var(--blue)`; nút ghost: nền trắng,
  viền `var(--line)`; nút mini: 34px, 12,5px.
- Card: radius 16px, padding 16px (desktop); chip: radius 999px.

### d. Mobile ≤640px — gọn để hạn chế cuộn, không xóa gì

- Hero: padding trên 64px → 32px, h1 nhỏ lại (`clamp(24px, 7.5vw, 28px)`),
  nút CTA xếp co (wrap).
- Section: padding 22px 18px → 16px; khoảng cách giữa các card 18px →
  12px; ảnh bài đăng cao 320px → 220px.
- Topbar xếp 2 hàng: hàng 1 là logo + điểm + EN + Đăng nhập, hàng 2 là
  ô tìm kiếm full-width.
- Chip vùng: lưới 2 cột thay vì 1 hàng dài.
- Feed/deal/side-item gọn lại (tiêu đề deal 15px, meta 12,5px).
- Modal tour: cao tối đa 85vh, cuộn bên trong; modal tạo trang/review
  cũng 85vh; footer gọn lại.
- **Giữ nguyên mọi section và mọi card** — chỉ thu hẹp khoảng cách và cỡ
  chữ, không xóa nội dung nào.

## 3. Cố tình KHÔNG đổi

Đây chỉ là nâng cấp giao diện, **không phải sửa theo SPEC**:

- Không đổi nội dung, chữ, giá, số điểm: vẫn **1,280 điểm NEXORA** (số
  mẫu), các mức +20 / +5 / +50 / +15 điểm giữ nguyên.
- **Không gỡ AI Smart Tour tự mở** (vẫn tự chạy sau 1,4 giây),
  không gỡ hộp điểm riêng, không gỡ nút chuyển EN.
- Không đổi ngôn ngữ, link, chức năng: đăng nhập NEXORA ID, tạo trang/
  nhóm, viết review, Thích / Bình luận / Chia sẻ, lọc theo vùng đều giữ
  nguyên hành vi.
- 16 ảnh base64 trong file **giữ byte-identical** (đã kiểm tra, không nén
  lại); 0 link ngoài được thêm vào (không CDN).

## 4. Cách mở

Giải nén zip rồi mở trực tiếp file `food.html` bằng trình duyệt
(double-click). Trang tự chạy, chỉ cần 2 file local đi kèm trong thư mục
`assets/` (`lucide.js`, `food-ui-polish.css`) — không cần server, không
cần mạng. Đừng tách riêng `food.html` ra khỏi thư mục `assets/`.

## 5. Kiểm chứng đã chạy (2026-11-10, trên máy này)

- `node --check assets/lucide.js`: OK.
- Script inline trong `food.html` sau khi sửa: `node --check` OK.
  (Trong lúc làm, bản sửa đầu bị thừa 1 dấu `}` ở 2 hàm render — đã phát
  hiện nhờ `node --check` và sửa, bản gốc không lỗi này.)
- jsdom (cài tạm trong `/tmp`, chạy `food.html` thật): load được
  `window.lucide` với 61 icon; **43 thẻ `svg.lucide`** được tạo ra,
  còn **0 thẻ `<i data-lucide>`** chưa đổi; feed render 5 bài, 6 chip vùng,
  6 vùng, 3 trang/nhóm, 3 deal; điểm hiển thị **1,280**; banner tour tự
  hiện (`display:block`); bấm EN rồi bấm lại VI vẫn đủ 43 icon;
  bấm Thích tăng 248 → 249; không có cảnh báo console nào.
- Lỗi duy nhất trong jsdom: `el.scrollIntoView is not a function` —
  **lỗi có sẵn của jsdom** (jsdom không có hàm này), chạy lại file gốc
  cũng ra đúng lỗi đó. Trên trình duyệt thật `scrollIntoView` có sẵn
  nên tour chạy bình thường; không phải lỗi do bản sửa.
- Grep emoji ngoài base64: chỉ còn ★ (6) và ☆ (1) trong thang chấm sao —
  đúng phần được giữ lại.
- Mọi đường dẫn nội bộ đều trỏ đúng file có trong zip
  (`food.html`, `assets/lucide.js`, `assets/food-ui-polish.css`).

## 6. Chưa kiểm chứng bằng mắt

Chưa chụp màn hình kiểm tra bằng mắt trên trình duyệt thật (headless
Chromium không có sẵn trong máy này) — trước khi giao cho Dev/CEO, nên
mở `food.html` trên trình duyệt thật (desktop + điện thoại 390px) để
nhìn 1 lượt: icon có đều không, topbar mobile có xếp 2 hàng đúng không,
tour có tự mở và bấm Tạm dừng/Tiếp/Đóng được không.
