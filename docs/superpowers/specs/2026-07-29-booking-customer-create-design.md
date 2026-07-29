# Thiết kế tạo customer trong Booking Book

## Mục tiêu

Trong `html/pages/booking-book-phase-1.html?tab=customers`, thêm nút `Create customer` để người dùng tạo customer mới ngay trong tab Customers.

## Quyết định

- Tái sử dụng `cust-modal` hiện có thay vì tạo modal riêng.
- Modal hỗ trợ hai chế độ: chỉnh sửa customer hiện tại và tạo customer mới.
- Nút `Create customer` đặt ở khu vực tiêu đề `Customer list`, cạnh các action hiện có.
- Khi tạo mới, các trường `Name` và `Phone` là bắt buộc. Các trường Email, Birthday, Address, Type và Status giữ nguyên theo modal hiện tại.

## Luồng tương tác

1. Người dùng bấm `Create customer`.
2. Modal mở với tiêu đề `Create customer`, form được reset và status mặc định là Active.
3. Người dùng nhập Name và Phone; hệ thống hiển thị lỗi nếu thiếu một trong hai trường.
4. Khi lưu hợp lệ, customer mới được thêm vào cuối `CUSTOMERS` với:
   - `visits: 0`;
   - `last: '—'`;
   - `seg: 'new'`;
   - `src: 'manual'`;
   - các field tùy chọn lấy từ form.
5. Modal đóng, bảng customer và các chip filter render lại, count được cập nhật, đồng thời hiển thị thông báo thành công.
6. Chế độ chỉnh sửa hiện tại tiếp tục hoạt động như trước và không bắt buộc Phone hồi cứu cho các record cũ.

## Dữ liệu và validation

- Trạng thái modal được phân biệt bằng index chỉnh sửa: `-1` là create, index không âm là edit.
- Thêm source label `manual` để dòng mới hiển thị đúng nguồn.
- Name và Phone được trim trước khi lưu.
- Không tạo customer nếu Name hoặc Phone rỗng; giữ modal mở và hiển thị thông báo lỗi tại form.
- Không thêm backend/API hoặc persistence mới; hành vi hiện tại của prototype tiếp tục dùng dữ liệu trong runtime.

## Kiểm thử và tiêu chí nghiệm thu

Thêm source-contract tests xác nhận:

- panel Customers có nút `Create customer`;
- modal có field phone và hook cho create mode;
- runtime có đường tạo customer mới, validation Name/Phone, `CUSTOMERS.push`, source `manual`, visits `0` và segment `new`;
- luồng edit hiện tại vẫn giữ nguyên.

Chạy tối thiểu:

```bash
node --test html/pages/booking-book-phase-1.customer-create.test.mjs
node -e 'const fs=require("fs"); const html=fs.readFileSync("html/pages/booking-book-phase-1.html", "utf8"); const scripts=[...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]).filter(s=>s.trim()); scripts.forEach(source=>new Function(source)); console.log("inline scripts parsed: " + scripts.length);'
git diff --check
```

## Ngoài phạm vi

- Không đổi schema customer dùng ở backend.
- Không thêm import/export, duplicate detection hoặc customer detail page.
- Không thay đổi các tab Booking, Call Log, SMS Campaigns hoặc QR Codes.
