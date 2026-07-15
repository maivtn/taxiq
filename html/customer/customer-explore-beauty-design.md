# NEXORA TOUCH — Thiết kế Explore Beauty Near You

| Trường | Giá trị |
|---|---|
| Trạng thái | Chờ duyệt tài liệu |
| Ngày | 2026-07-15 |
| Phạm vi | Customer App, beauty-only, localStorage-first prototype |
| File triển khai chính | `cutomer-reward.html` |
| Tài liệu nguồn | `customer-app-developer-spec.md`, `three-sided-marketplace-spec.md`, `customer-reward-localstorage-design.md`, `customer-app-prototype.html` |

## 1. Kết luận audit

Prototype đã có `explore` và `business`, search text, filter card, empty state, favorite, booking/directions action và một số proof metrics. Tuy nhiên implementation hiện tại:

- render card bằng HTML tĩnh;
- trộn Nails, Spa và Coffee;
- lọc trực tiếp trên DOM thay vì selector từ catalog;
- chưa có đủ Hair, Lashes & Brows, Barber, Massage;
- khoảng cách là text fixture, chưa có location state/fallback;
- public directory và customer relationship chưa có boundary rõ.

Tính năng vì vậy là **partial**, cần chuyển sang data-driven beauty directory.

## 2. Quyết định đã duyệt

1. Explore Customer V1 chỉ gồm ngành làm đẹp: Nail, Spa, Hair, Lashes & Brows, Barber, Massage.
2. Dùng list-first data-driven; map là phase sau.
3. Catalog công khai không lưu vào localStorage. localStorage chỉ giữ customer relationship/preferences.
4. Không lưu tọa độ chính xác của khách lâu dài.
5. Sponsored luôn có nhãn rõ và không giả làm kết quả organic gần nhất.
6. Explore chỉ dẫn sang Rewards bằng `businessId`; không chứa logic apply reward.

Quyết định beauty-only chủ động thay danh mục đa ngành tại `customer-app-developer-spec.md` §J1 **chỉ cho Customer Explore V1**. Khi triển khai, developer spec phải được cập nhật cùng commit; Coffee/Food có thể tồn tại ở sản phẩm khác nhưng không xuất hiện trong màn Explore này.

## 3. Mục tiêu và ngoài phạm vi

### 3.1 Mục tiêu

- Tìm tiệm beauty theo tên, category và service.
- Sắp xếp organic theo khoảng cách khi có location; fallback theo tên khi bị từ chối.
- Render card/profile từ một catalog canonical.
- Giữ proof metrics hệ thống tính, Sponsored/Just Opened labeling và favorite persistence.
- Mobile-first, EN/VI, accessible và thay được fixture bằng API sau này.

### 3.2 Ngoài phạm vi

- Không có Coffee, Food, Fitness, Auto hoặc Other trong Customer Explore V1.
- Không có map/marker, geocoding hoặc route planning nội bộ.
- Không có marketplace tuyển dụng owner/staff.
- Không cho business tự sửa proof metrics.
- Không persist directory response, ảnh hoặc vị trí chính xác trong localStorage.

## 4. Kiến trúc tối ưu

```text
BEAUTY_DIRECTORY fixture / GET /explore
                  ↓ normalize
selectBeautyBusinesses(query, category, location)
                  ↓
Explore cards → Business Profile
                  ↓
Book / Directions / Favorite / View Rewards
```

Ba boundary:

1. **Public directory:** dữ liệu business công khai, read-only trong phiên.
2. **Customer relationship:** favorite, visit/reward linkage, lưu theo `businessId`.
3. **Session location:** tọa độ chỉ ở memory; localStorage chỉ lưu permission state.

Explore là task thứ hai, chạy sau Rewards và nâng Customer schema từ `3` lên `4`.

## 5. Catalog và state

### 5.1 Category enum

```js
const BEAUTY_CATEGORIES = Object.freeze([
  'nail', 'spa', 'hair', 'lashes-brows', 'barber', 'massage'
]);
```

### 5.2 Directory entry

```js
{
  id: 'bitcoin-nail-bar',
  name: 'Bitcoin Nail Bar',
  category: 'nail',
  serviceIds: ['classic-pedicure', 'gel-polish'],
  searchTerms: { vi: ['nail', 'móng'], en: ['nail', 'pedicure'] },
  location: { lat: 29.7604, lng: -95.3698 },
  address: '123 Main St, Houston, TX',
  hours: [{ day: 3, open: '09:30', close: '19:30' }],
  rating: 4.9,
  startingPriceCents: 4500,
  imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371',
  badges: ['verified'],
  sponsored: false,
  openedAt: 'ISO-8601',
  proof: {
    periodDays: 30,
    checkinCount: 128,
    receiptPriceCents: 4500,
    looksCount: 24,
    computedAt: 'ISO-8601'
  }
}
```

Catalog normalization loại entry có ID/category/location/money sai; không tự ép category lạ thành `other`.

### 5.3 Customer state

```js
{
  businessRelations: {
    [businessId]: { favorite: true, lastViewedAt: 'ISO-8601' }
  },
  preferences: {
    locationPermission: 'prompt' // last observed: prompt | granted | denied
  },
  ui: {
    explore: {
      query: '',
      category: 'all',
      selectedBusinessId: null
    }
  }
}
```

Migration v3→v4 copy favorite hợp lệ từ state cũ vào `businessRelations`, giữ balances/ledger và từ chối prototype-polluted IDs.

`locationPermission` chỉ là trạng thái UI quan sát gần nhất, không phải authority. Mỗi phiên phải hỏi lại Permissions/Geolocation API trước khi đọc vị trí; trạng thái lưu cũ không được dùng để tự động truy cập tọa độ.

## 6. Search, filter và ranking

`selectBeautyBusinesses(directory, filters, sessionLocation, now)` là pure selector:

1. Chỉ nhận category whitelist.
2. Normalize query Unicode/case/whitespace; match name, category, service và localized search terms.
3. Nếu có session location hợp lệ, tính Haversine một lần cho mỗi directory entry khi location thay đổi.
4. Organic sort: distance tăng dần, sau đó rating giảm dần, rồi name.
5. Location denied/unavailable: sort name theo locale và hiện notice.
6. Sponsored nằm trong slot riêng có nhãn; không thay đổi thứ hạng organic.
7. Search input debounce 150 ms; dataset nhỏ không cần virtualization.

Không gửi hoặc lưu precise location trong prototype. Production chỉ gửi lat/lng khi khách cho phép và áp privacy policy hiện hành.

## 7. UI và flow

### 7.1 Explore

- Search placeholder beauty-only.
- Filter: `Tất cả · Nail · Spa · Tóc · Mi & Mày · Barber · Massage`.
- Notice location `prompt`, `denied` hoặc demo location.
- Result count trong `aria-live="polite"`.
- Card: image lazy-load, name, category, distance hoặc location fallback, rating, open status, starting price, proof line, badge và CTAs.
- States: `loading`, `ready`, `empty`, `error`, `location-denied`.

### 7.2 Business Profile

- Cover, identity, category, distance/address, open status.
- Verified proof period và metrics.
- Service/price list, staff nổi bật nếu có dữ liệu hợp lệ.
- Book prefill `businessId`, Directions external, Favorite persist.
- Offers/rewards của đúng salon. Reward badge mở My Rewards với business filter; không reserve/apply tự động.

### 7.3 Navigation

- Giữ `explore` và `business` trong tab Explore; không tăng 31 screen.
- Notification follow-tech chỉ mở business profile khi `businessId` có trong directory canonical.
- Mobile một cột; `md` hai cột; desktop sidebar hiện tại.

## 8. Proof, Sponsored và privacy

- Proof metrics do hệ thống tính từ ledger/receipt/looks; business không có endpoint/UI sửa.
- Mọi proof có `computedAt`/period để không trình bày dữ liệu cũ như realtime.
- Sponsored luôn có text “Được tài trợ/Sponsored” và vẫn phải có proof line.
- Just Opened dựa trên `openedAt`, không phải boolean do UI tự gán.
- Favorite là dữ liệu riêng của customer; business không xem được ai favorite.
- Customer không thấy Find Work, job post, tech anonymous profile hoặc owner hiring data.

## 9. Action đề xuất

```text
set-explore-category
search-explore
request-explore-location
view-business
toggle-favorite
book-business
show-directions
view-business-rewards
```

Mọi external Directions action phải tạo URL từ catalog canonical; không dùng address/URL lấy trực tiếp từ DOM.

## 10. Error handling, accessibility và i18n

- Location denied không chặn Explore; notice giải thích fallback.
- Directory/API lỗi có retry, không hiển thị card cũ như dữ liệu mới.
- Filter dùng button với `aria-pressed`; keyboard/focus không phụ thuộc horizontal scroll.
- Result count và empty/error dùng live region phù hợp.
- Image có alt EN/VI theo business/category; badge không chỉ phân biệt bằng màu.
- Dynamic name/service giữ nguyên proper noun; copy hệ thống qua dictionary EN/VI.
- Reduced motion áp dụng cho skeleton/transition.

## 11. Test và acceptance

### 11.1 Domain P0/P1

1. Catalog từ chối category ngoài whitelist; không còn Coffee trong kết quả/customer copy.
2. Query match đúng name/service/category và không mutate catalog.
3. Location granted sort đúng distance; invalid coordinates không tạo `NaN` ordering.
4. Location denied không lưu coordinates và fallback theo locale name.
5. Sponsored không chen vào organic rank và luôn có label/proof.
6. Proof field không thể mutate qua favorite/filter action.
7. Favorite persist đúng `businessId`; ID lạ/prototype key bị từ chối.
8. Notification tech move chỉ mở directory business hợp lệ.
9. Migration v3→v4 giữ reward entitlements, balances, ledger và checkout.

### 11.2 UI/contracts

- Search, sáu category, empty/error/location notice và result live region đầy đủ.
- Card/profile action registry không có click im lặng.
- Giữ 31 screens, bottom nav mobile và sidebar desktop.
- Layout không overflow tại 360, 390, 768, 1024, 1440 px.
- EN/VI parity, disabled reason, focus return và reduced motion.

## 12. File dự kiến

- `cutomer-reward.html`
- `cutomer-reward.test.mjs`
- `customer-app-developer-spec.md`
- `customer-reward-localstorage-design.md`
- `customer-app-independent-guide.md`
- `customer-explore-beauty-design.md`

## 13. External dependencies

Production cần Explore API, geolocation permission, proof-metrics batch, business hours/timezone service, image CDN và Maps deep link. Prototype dùng fixture/in-memory location và phải ghi rõ đâu là simulation.
