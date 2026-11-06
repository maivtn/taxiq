# Handoff — bổ sung Community v2.2

**Ngày:** Nov 6, 2026  
**Trạng thái:** Tạm ngưng theo yêu cầu người dùng. Chưa hoàn tất triển khai.  
**Workspace:** `/Users/loinguyen/Documents/VLINKGROUP/taxiq` · nhánh `main`

## Giới hạn ngữ cảnh

Người dùng yêu cầu chỉ chuyển ngữ cảnh từ thông báo sau trở đi:

> Đã push commit **`a25efa2f`** lên `origin/main`, Git đã đồng bộ.  
> [Xem Gift Card](https://taxiq-nexora-touch.vercel.app/html/pages/products/gift-card-center/index.html) · [Xem sơ đồ icon](https://taxiq-nexora-touch.vercel.app/html/pages/products/community/index.html#connections)  
> Deploy mới chưa được kiểm chứng.

Không cần tiếp tục công việc homepage/video/icon trước mốc này. Tài liệu này chỉ bàn giao cuộc đối chiếu Community và yêu cầu bổ sung phát sinh sau mốc trên.

## Yêu cầu của người dùng sau mốc đó

1. So sánh Community v2.2 đang deploy tại `https://taxiq-nexora-touch.vercel.app/html/pages/community.html?tab=feed` với v1 và v2. Phạm vi gồm chức năng/luồng; button/icon/badge/chip/control; input/select/checkbox/radio/switch/date; menu/tab/link/modal/tooltip/thông báo; item/card/list/detail; bảng/cột/đơn vị/tổng/filter/sort/paging/row actions; điều kiện/trạng thái/kết quả; responsive theo tài khoản.
2. Agent tìm được hai nguồn và người dùng xác nhận **“Dùng hai nguồn này”**:
   - V1: `from-po/NEXORA-Community/nexora-community-tong-hop.html` — entry bản gộp cũ. Module riêng cùng gói được dùng bổ sung khi cần, ví dụ `nexora-campaigns.html`.
   - V2: `from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/products/community/demo/nexora-community-complete.html` và các asset/demo liên quan.
3. Sau khi nhận báo cáo, người dùng yêu cầu: **“vậy bổ sung toàn bộ cái còn thiếu vào v2.2 đi bản v2.2 local để đây html/pages”**.
4. Yêu cầu mới nhất: **tạm ngưng, làm handoff để sang phiên khác**, chỉ dùng ngữ cảnh từ mốc `a25efa2f` trở đi.

## Đối chiếu đã hoàn tất

Commit báo cáo: **`60842805`** — `Audit Community v2.2 against PO v1 and v2 with UI evidence`.

- [Báo cáo HTML có ảnh](so-sanh-v1-v2-v22-2026-11-06/bao-cao.html)
- [Danh sách kết quả có mã, mô tả V1/V2/V2.2 và đề xuất](so-sanh-v1-v2-v22-2026-11-06/ket-qua.json)
- [CSV đối chiếu](so-sanh-v1-v2-v22-2026-11-06/doi-chieu.csv)
- [Kiểm kê source và các trạng thái/control đã ghi nhận](so-sanh-v1-v2-v22-2026-11-06/kiem-ke-ui.json)

Kết quả: **28 mã thiếu UI/thao tác/đường vào**, **6 mã thay đổi hành vi/vị trí**, 11 mã bổ sung/giữ/cải thiện, 1 vấn đề ngôn ngữ và 10 nhóm giới hạn/chưa đủ căn cứ. Không được diễn giải 28 mã là 28 chức năng backend đã mất.

Khảo sát dùng browser context riêng, viewport phone 390×844, iPad 820×1180, desktop 1440×900. Owner ưu tiên iPad; staff/personal dùng query demo `role=staff&account=personal&member=David%20Le`. Có 179 bản ghi màn/trạng thái; gói báo cáo có 63 ảnh được lưu. Một số nhánh mới chỉ đọc code, không phải tất cả thao tác đều đã chạy. Bản chạy HTML lưu dữ liệu local.

Đã tải và đối chiếu SHA-256 của 32 file web với local, đều khớp; kiểm lại cuối lượt audit vẫn không thay đổi. **Chưa xác minh deploy commit/backend.** Không dùng kết quả này để khẳng định source sau khi bổ sung đã được deploy hoặc đã kiểm thử.

Chưa chuyển tiền, kiểm GPS thật, cấp quyền mic/camera, tích hợp Wallet/SMS/email/Ads/OneQR/POS thật hoặc khảo sát hết trạng thái lỗi, hết hạn, tranh chấp, quyền nhóm. Chi tiết ở các mục UC trong báo cáo.

## Phạm vi khôi phục được yêu cầu

Đọc `ket-qua.json` để lấy đầy đủ từng mã. Các nhóm `missing` gồm:

| Mã | Cần bổ sung |
| --- | --- |
| SS01–03 | Feed: chặn nội dung đòi chuyển tiền trước; ngăn bài thường vào Marketplace; gợi ý đích đăng/Use suggestion. |
| SS04–06 | Jobs: 8 mẫu tìm việc nhanh, nói/gõ một câu + AI điền, chip câu nhanh. |
| SS07–10 | Jobs: lương Từ–Đến + đơn vị, ngày/buổi làm, phạm vi đi xa/chỗ ở, AI viết/English/rút gọn. |
| SS11–12 | Jobs: ẩn họ, thời hạn tin 14/30/60 ngày. |
| SS13–16 | My Posts: Pause/Show again, Got hired, Delete, thống kê views/invites/saves/ngày còn lại. |
| SS17–18, SS20–21 | Lối vào công cụ doanh nghiệp: Campaigns, Redeem, Create in POS, Grand opening 30 days. Các màn còn trong code và mở được bằng deep link. |
| SS22 | Chia sẻ thợ dư có sự đồng ý của thợ; không đánh đồng với Invite workers. |
| SS23–28 | Connect: Translate, AI captions, Speaker, nhãn Encrypted (chỉ là UI demo), chia sẻ thẻ ca/vị trí tiệm, AI scam alerts. |
| SS29 | Khôi phục Use this example trong form demo của V2. |

**SS19 không thuộc nhóm thiếu:** Live coupons còn qua Campaigns, không khôi phục trùng một module mới.

Các nhóm `changed` không tự động có nghĩa phải đưa về V1. Agent đã thông báo sẽ **giữ cơ chế Zelle hiện tại**, vì CH01 là đổi nghiệp vụ, không phải thiếu hụt. Chưa có quyết định mới của người dùng thay Zelle bằng giữ hộ ví/thẻ. Không tự đổi thanh toán, ngôn ngữ hoặc mọi yêu cầu PO chưa xác nhận. CH02 (nhóm chưa tham gia) có thể khôi phục như bước hỗ trợ đăng nếu bảo toàn quyền; CH03 quyền theo tin/hồ sơ phải giữ phần hiện có; CH04 Boost đang preview local; CH05 hiện ép English.

## Code hiện tại và thay đổi đang dở

HEAD trước handoff: `60842805`; `origin/main` vẫn là `a25efa2f`. Báo cáo **chưa push**. Không có commit triển khai chức năng mới.

**Có 3 file ứng dụng đang sửa, chưa commit, chưa test:**

1. `html/assets/community-v2/community-deals-workflow.js`
   - Thêm Wish list vào tab công khai.
   - Thêm nav `Business tools` chỉ khi owner: create/manage/redeem/campaign/openingBusiness/demand.
   - Chưa thêm CSS cho nav mới, chưa kiểm responsive/active state/routing.
2. `html/assets/community-v2/community-feed-composer.js`
   - Thêm danh sách tất cả nhóm, lọc đích hợp lệ theo loại nhóm.
   - Thêm AI suggests/Use suggestion từ từ khóa, ghi chú tự tham gia nhóm, chặn Marketplace cho bài thường.
   - Thêm chặn các từ khóa chuyển tiền/đặt cọc và cảnh báo số điện thoại với lần tiếp tục thứ hai.
   - Thêm gọi `adapter.joinGroup` trong collect khi publish.
   - **Cần rà kỹ:** xử lý join trước lúc post save có thể để lại membership nếu post save thất bại; không được coi là transaction hoàn chỉnh. `allowedGroup` hiện chỉ dành cho form Feed thường; form Marketplace dùng luồng riêng. Copy bổ sung cần đối chiếu câu chữ nguồn, CSS chưa thêm.
3. `html/assets/community-v2/nexora-community-prototype.html`
   - Thêm `jobSampleMarkup`, `generalSampleMarkup`, `refreshJobSample`, `fillExample` lấy từ PO V2, chèn Sample post vào form và hook nút `fillExample`.
   - Thêm `joinGroup` và `groupType` vào `feedAdapter` để gọi Group store hiện tại.
   - **Lỗi phụ thuộc đã nhận diện bằng đọc mã nhưng chưa xử lý:** mới sao chép các hàm markup/fill; **chưa có khai báo `JOB_SAMPLE_KINDS` và hàm `jobSample`** trong file hiện tại. `openTemplate` mới tham chiếu chúng, có thể gây `ReferenceError` khi mở form. Cần khôi phục các helper tương ứng từ PO hoặc chỉnh cách dùng trước khi tiếp tục. Không được bàn giao local đang dở như bản chạy hoàn chỉnh.

Chưa sửa Jobs workflow, Connect workflow, Shifts workflow, cache versions hoặc CSS cho đợt bổ sung này. Diff ứng dụng tại lúc dừng: khoảng **55 insertions, 9 deletions** trên 3 file trên.

[Bản sao patch WIP để khôi phục khi cần](HANDOFF-community-v22-wip-2026-11-06.patch). Patch này **đã được áp dụng trong working tree hiện tại**; không apply lần nữa nếu 3 file vẫn đang modified. Nó được lưu cùng handoff để không phụ thuộc riêng vào `/tmp`.

**Không chạy lại mù script `/tmp/restore-community.py`**: đó là script thay chuỗi đã chạy một lần, không idempotent. Có thể đọc để hiểu patch. Các helper gốc cho Sample post ở PO V2 nằm gần `const JOB_SAMPLE_KINDS`, `function jobSample`, `function jobSampleMarkup`, `fillExample`.

## Cấu trúc runtime để tiếp tục

- Entry cần sửa vẫn là **`html/pages/community.html`**, không tạo bản thay thế rồi bỏ liên kết bản chính.
- `html/pages/community.html` → `html/assets/community-v2-integration.js` → `html/assets/community-v2/community-hub.js`.
- Hub mount native/shadow shell từ `nexora-community-complete.html`; nội dung nằm trong peer iframe `nexora-community-prototype.html`, Connect ở `nexora-privacy-qr-layout.html`.
- Feed: `community-feed-composer.js`, `community-feed-social.js` và adapter trong prototype.
- Jobs: `community-jobs-workflow.js/.css`; mount adapter đã có read/save jobs, profile, application/invite APIs. Nên bổ sung tại workflow này để dùng chung state, không dựng module độc lập với store mới không đồng bộ.
- Shifts: `community-shifts-workflow.js/.css`, đã có Zelle, availability, assignments/settlements, policy, role checks. Thêm chia sẻ thợ cần giữ consent, không cho owner tự đồng ý thay thợ.
- Connect: `nexora-privacy-interactive.js` là core chat/media; `community-connect-workflow.js/.css` bổ sung rooms, members, message tools, calls, privacy. `renderCall()` đang có Mute/Camera/Join/End; `enhanceMessages()` thêm Reply/Report/reaction. Có sẵn copy `Encrypted` nhưng không được suy ra mã hóa thật.
- Deals: `community-deals-workflow.js` route/frame navigation; `deals/nearby.html`, `deal-match.html`, `campaigns.html`, `grand-opening.html`; `community-deals-module.js` nối UI PO với bản hiện tại.
- Cache hiện tại: `20261105-community-deals-controls-v58` ở shell/integration/hub và `20261105-deals-controls-v5` ở Deal modules. Khi hoàn tất phải cập nhật chuỗi tài nguyên liên quan, không chỉ một JS entry.

Các API/field cần chú ý trong Jobs: `getJobs/saveJobs`, `getProfile/saveProfile/savePrivacy`, `saveJob/closeJob`, `normalStatus/active`, `card`, `collectEditor`, `enhanceForm`, `openEditor`, `onClick`, `onSubmit`. `kind==='seeking'` là tin tìm việc, `role()==='staff'` là quyền tạo tin. Nhiều state profile/pay types đã có và cần giữ nguyên; chỉ bổ sung phần thiếu theo tin.

## Tài nguyên khảo sát còn trên máy

- `/tmp/community-v22-audit/`: source V1 đã giải mã tại `v1/*.html`, JSON/screenshot gốc, script tạo báo cáo `build_report.py`, SHA parity.
- `/tmp/restore-community.py`: script patch dở đã chạy, chỉ dùng tham khảo.
- HTTP server từng chạy port **8776** với directory root repo; kiểm tra còn sống trước khi dùng. Không tự chạy UI/test khi chưa được yêu cầu cho thay đổi mới.
- Playwright connector đã hoạt động trong lượt audit; `browser_run_code_unsafe` có thể chạy Playwright nhưng **`require`/dynamic import không dùng được**. Biến `globalThis` không tồn tại qua các tool call; các browser contexts/pages còn, có thể tìm theo URL. Dùng context riêng và tắt auto tour bằng hai key `nexora-community-tour-mobile-v1`/`nexora-community-tour-desktop-v1` khi được phép khảo sát.

## Quy tắc thực hiện cho phiên sau

Đọc lại `AGENTS.md` trong workspace khi tiếp tục. Các quy tắc đang áp dụng sau mốc bàn giao:

- Prototype: làm trực tiếp trên `main`, không tự tạo branch/worktree/spec/design approval.
- Bảo toàn PO nguồn và các phần V2.2 hiện có; dùng câu chữ/behavior từ nguồn đúng màn; không tự thêm nghiệp vụ.
- Không spawn sub-agent nếu không có chỉ dẫn phù hợp yêu cầu delegation.
- **Chỉ test khi người dùng yêu cầu rõ.** Yêu cầu bổ sung hiện tại chưa yêu cầu test mới; không tự chạy npm test hoặc UI test để đáp ứng commit. Không dùng audit cũ làm bằng chứng thay đổi mới đã đạt.
- Khi hoàn tất một yêu cầu có thay đổi, rà diff và commit đúng phạm vi. Không commit triển khai đang dở như đã hoàn tất. Không tự push khi chưa được yêu cầu cho phần này.
- Link prototype online theo `https://taxiq-nexora-touch.vercel.app/<đường dẫn repo>`; local thay đổi chưa push/deploy thì nói rõ.

## Khi được người dùng yêu cầu tiếp tục

1. Đọc handoff + `ket-qua.json`; kiểm tra Git status để giữ WIP và không gom thay đổi người khác.
2. Xử lý các dependency Sample post đang thiếu; rà lại patch Feed/Deals trước khi xây tiếp.
3. Hoàn thiện nhóm Jobs SS04–16 bằng form/store hiện tại, lấy template/copy/logic gốc từ V1; giữ profile/application workflow mới. Bổ sung đầy đủ action/result/permission/persistence, không chỉ thêm nút.
4. Hoàn thiện Connect SS23–28 và chia sẻ thợ SS22; xong form examples SS29, CSS responsive, cache chain.
5. Rà diff theo từng mã thiếu, phân biệt mục đã bổ sung với mục chưa đủ căn cứ/ngoài phạm vi backend thật. Chỉ kiểm thử khi có yêu cầu mới.

**Dừng ở handoff này. Chỉ tiếp tục sửa ứng dụng khi người dùng yêu cầu ở phiên tiếp theo.**
