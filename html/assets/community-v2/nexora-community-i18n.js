/* Interface copy for the standalone Community and Connect previews.
   Member-written text stays in its original language. */
(() => {
  const isConnect = location.pathname.includes('privacy-qr-layout');
  const communityPairs = `
Gọi	Call
Ảnh	Photos
Người theo dõi	Followers
người theo dõi ·	followers ·
bài viết	posts
Đổi ảnh đại diện	Change profile photo
Danh sách người theo dõi chỉ hiển thị khi có dữ liệu tài khoản thật.	The follower list appears when real account data is available.
Ảnh hoặc video (tùy chọn) · tối đa 4 ảnh hoặc 1 video	Photos or video (optional) · up to 4 photos or 1 video
Thời điểm đăng	Publish time
Đăng ngay	Publish now
Lên lịch	Schedule
Ngày và giờ đăng	Publish date and time
ĐÃ LÊN LỊCH	SCHEDULED
Bài có ảnh/video	Photo/video post
Lưu lịch	Save schedule
Chưa có bài nào được lên lịch.	No scheduled posts yet.
Viết nội dung hoặc chọn ảnh/video trước khi đăng.	Write something or select photos/video before posting.
Chọn ngày và giờ sau thời điểm hiện tại ít nhất 1 phút.	Choose a date and time at least 1 minute from now.
Đang lưu...	Saving...
Không thể lưu bài trên thiết bị này.	Could not save the post on this device.
Không thể lưu bài. Vui lòng thử lại.	Could not save the post. Please try again.
Không thể lưu thay đổi trên thiết bị này.	Could not save changes on this device.
Đã lên lịch bài đăng.	Post scheduled.
Đã đăng bài.	Post published.
Đã cập nhật lịch đăng.	Schedule updated.
Trình duyệt này chưa hỗ trợ lưu ảnh/video.	This browser does not support saving photos/video.
Không mở được bộ nhớ ảnh/video.	Could not open photo/video storage.
Không lưu được ảnh/video.	Could not save photos/video.
Không đọc được ảnh/video.	Could not read photos/video.
Chọn tối đa 4 ảnh hoặc 1 video.	Choose up to 4 photos or 1 video.
Một bài chỉ chọn 1 video hoặc tối đa 4 ảnh.	Choose 1 video or up to 4 photos per post.
Video tối đa 30 MB.	Videos must be 30 MB or smaller.
Ảnh cần là PNG, JPG, WebP hoặc GIF.	Photos must be PNG, JPG, WebP or GIF.
Mỗi ảnh tối đa 5 MB.	Each photo must be 5 MB or smaller.
Xem trước video	Video preview
Xem trước ảnh đã chọn	Selected photo preview
Video bài đăng	Post video
Video của Fanpage	Page video
Không mở được tệp.	Could not open the file.
Ảnh PNG/JPG/WebP/GIF, tối đa 900 KB mỗi ảnh.	PNG/JPG/WebP/GIF, up to 900 KB per image.
Chọn ảnh PNG, JPG, WebP hoặc GIF không quá 900 KB.	Choose a PNG, JPG, WebP or GIF image up to 900 KB.
Tên Fanpage của bạn	Your Page name
Chọn ảnh đại diện và ảnh bìa bên dưới; có thể thay đổi sau khi tạo.	Choose a profile and cover photo below. You can change them after creating your Page.
Xem trước ảnh đại diện	Profile photo preview
Xem trước ảnh bìa	Cover photo preview
Xóa ảnh	Remove photo
Chưa có bài Blog phù hợp	No matching blog posts
Thử chủ đề khác hoặc viết bài đầu tiên.	Try another topic or write the first post.
Đã cập nhật Blog.	Blog updated.
Viết điều bạn muốn chia sẻ với cộng đồng.	Write what you would like to share with the community.
Dịch vụ, kỹ thuật, mô tả và ảnh mẫu.	Service, technique, description and work photos.
Đặt câu hỏi và đánh dấu đã giải đáp.	Ask a question and mark it answered.
Lấy ý kiến nhanh từ cộng đồng.	Get quick feedback from the community.
Ngày, hình thức và cách tham gia.	Date, format and how to join.
Chủ đề, khu vực và nội quy nhóm.	Group topic, area and rules.
Loại nhóm	Group type
Thêm nội dung, ảnh đại diện và ảnh bìa ngay khi tạo Fanpage.	Add details, a profile photo and a cover photo when creating your Page.
Tên Fanpage @ (tùy chọn)	Page @handle (optional)
Nút liên hệ trên Fanpage	Page contact button
Số điện thoại công khai (nếu chọn Gọi)	Public phone number (for the Call button)
Giờ hoạt động (tùy chọn)	Business hours (optional)
Cách liên hệ khác (tùy chọn)	Other contact method (optional)
Ảnh đại diện (tùy chọn)	Profile photo (optional)
Ví dụ: 713-555-0144	Example: 713-555-0144
Ví dụ: @bitcoin.nail.bar	Example: @bitcoin.nail.bar
Ví dụ: BITCOIN NAIL BAR	Example: BITCOIN NAIL BAR
Ví dụ: website hoặc email công khai	Example: public website or email
Hỏi tình trạng, giá và cách xem hàng.	Ask about condition, price and viewing the item.
Thống nhất thời gian và khu vực gặp.	Arrange a meeting time and area.
Hỏi thêm về vị trí hoặc giới thiệu bản thân.	Ask about the role or introduce yourself.
Nêu chủ đề và thời gian bạn tiện nghe máy.	Add a topic and a convenient time for a call.
Chọn vị trí	Choose a role
Nội quy:	Rules:
Chỉ bán cả lô	Entire lot only
Đã bán	Sold
Tối đa	Up to
Ngân sách tối đa (USD)	Maximum budget (USD)
Khu vực bạn muốn xem	Area you want to explore
Bài gần khu vực này sẽ lên trước. Các bài khác vẫn hiển thị.	Posts near this area appear first. Other posts are still shown.
Tiểu bang	State
Thành phố	City
Chỉ truy cập vị trí khi bạn cho phép.	Location is accessed only with your permission.
Lưu khu vực	Save area
Bạn chưa cho phép vị trí. Vui lòng chọn khu vực.	Location permission was not granted. Choose an area.
Bạn chưa cho phép vị trí. Vui lòng nhập thủ công.	Location permission was not granted. Enter an area manually.
Đã điền từ khu vực hồ sơ mẫu. Bạn có thể sửa hoặc dùng vị trí hiện tại.	Filled from the sample profile area. You can edit it or use your current location.
Có bài đăng	With listings
Ưu tiên bài gần bạn	Showing nearby posts first
Mở trực tiếp nội dung để quyết định trả lời	Open the message to decide whether to reply
Không có yêu cầu tin nhắn.	No message requests.
Bài phù hợp với bạn	Matching posts for you
Đã chấp nhận. Bạn có thể soạn câu trả lời.	Request accepted. You can write a reply.
Đã bỏ qua yêu cầu.	Request ignored.
Đã chặn và đánh dấu báo cáo.	Blocked and marked for reporting.
Đã lưu nháp trả lời.	Reply draft saved.
Vui lòng viết nội dung trả lời.	Write a reply.
Đã có lỗi xảy ra. Vui lòng thử lại.	Something went wrong. Please try again.
Đã cập nhật trạng thái.	Status updated.
Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn.	The image is too large. Choose a smaller image.
Đã cập nhật bài.	Post updated.
Đã tạo bài.	Post created.
Đã tạo Fanpage.	Page created.
Đã lưu nháp.	Draft saved.
✓ Đã quan tâm	✓ Interested
Tên Fanpage @ cần ít nhất 3 ký tự.	A Page @handle must have at least 3 characters.
Tên Fanpage @ đã được dùng. Vui lòng chọn tên khác.	This Page @handle is already in use. Choose another.
Không thể đọc ảnh.	Could not read the image.
Người chưa kết nối đã nhắn cho bạn. Xem tin trước khi chấp nhận.	Someone you are not connected with sent a message. Review it before accepting.
Không có yêu cầu tin nhắn đang chờ.	No pending message requests.
Tin trả lời	Reply
Chưa có nháp tin nhắn	No message drafts yet
Chọn một mẫu ở trên để xem cách soạn nhanh.	Choose a template above to draft a message quickly.
NHÁP TIN NHẮN	MESSAGE DRAFT
NHÓM NGÀNH	INDUSTRY GROUP
người theo dõi	followers
· Đã giải đáp	· Answered
Đăng ưu đãi	Post an offer
Đăng tin và giao dịch miễn phí.	Posting and person-to-person transactions are free.
✎ Chỉnh sửa	✎ Edit
← Quay lại danh sách Fanpage	← Back to Pages
← Quay lại Fanpage	← Back to Page
Chỉnh sửa	Edit
Tìm ưu đãi: pedicure, facial, coffee…	Search deals: pedicure, facial, coffee…
Chưa có ưu đãi phù hợp	No matching deals
Thử từ khóa, ngành hoặc khu vực khác.	Try another keyword, industry or area.
Bộ lọc	Filters
Thêm	More
Thu gọn	Show less
Không gian làm việc	Workspace
Trang chủ	Home
Bảng Điều Khiển	Dashboard
Thanh toán & Chi trả	Payments & Payouts
Đánh Giá	Reviews
Cộng đồng	Community
Phân Tích	Analytics
Cài Đặt	Settings
Đặt lại	Reset
Chia sẻ, hỏi đáp và mua bán cùng những người trong nghề	Share, ask questions and trade with people in your industry
Tìm nhân viên, đánh giá hoặc tip...	Search staff, reviews, or tips...
Bảng tin	Feed
Tìm bài đăng	Search listings
Lọc	Filters
Doanh nghiệp	Business
Bảng tin chung	Main feed
Nhóm đã tham gia	Joined groups
Bản nháp của tôi	My drafts
Rời nhóm	Leave group
Tham gia	Join
Lọc ngành nghề	Filter industries
Lọc danh mục	Filter categories
Lọc tiểu bang	Filter states
Lọc thành phố	Filter cities
Loại bài mua bán	Listing type
Lọc ngành nghề việc làm	Filter job industries
Đăng bài nhanh	Quick post
Tạo bài	Create post
Chỉnh sửa Fanpage	Edit Page
Fanpage chưa có video.	This Page has no videos yet.
Fanpage chưa đăng ảnh. Chủ Fanpage có thể thêm ảnh bìa, ảnh đại diện hoặc ảnh bài viết.	This Page has no photos yet. Add a cover, profile photo, or post photo.
Tạo Fanpage	Create Page
Xem trước Fanpage	Preview Page
Fanpage của bạn có gì mới?	What's new on your Page?
Đăng bài từ Fanpage	Post from Page
Fanpage công khai	Public Page
Lọc bài:	Filter posts:
Đăng bán	Sell item
Đăng tuyển	Post a job
Lọc loại bài trên bảng tin	Filter feed posts
Nhóm & Chợ	Groups & Market
Trang	Pages
Fanpage	Pages
Trang / Fanpage	Pages
TRANG / FANPAGE	PAGE
FANPAGE	PAGE
Tạo Trang / Fanpage	Create a Page
Tạo trang	Create a Page
Tạo Fanpage	Create a Page
Khám phá trang	Discover Pages
Khám phá Fanpage	Discover Pages
Khám phá	Discover
Trang của tôi	My Pages
Fanpage của tôi	My Pages
Đang theo dõi	Following
Bạn chưa có trang	You have no Pages yet
Bạn chưa có Fanpage	You have no Pages yet
Bạn chưa theo dõi trang nào	You are not following any Pages yet
Bạn chưa theo dõi Fanpage nào	You are not following any Pages yet
Tạo trang để giới thiệu doanh nghiệp hoặc thương hiệu.	Create a Page to introduce your business or brand.
Tạo Fanpage để giới thiệu doanh nghiệp hoặc thương hiệu.	Create a Page to introduce your business or brand.
Mở Khám phá để tìm trang bạn quan tâm.	Open Discover to find Pages you like.
Mở Khám phá để tìm Fanpage bạn quan tâm.	Open Discover to find Pages you like.
Sửa trang	Edit Page
Sửa Fanpage	Edit Page
Tìm trang theo tên hoặc thành phố	Search Pages by name or city
Tìm Fanpage theo tên hoặc thành phố	Search Pages by name or city
Tìm trang	Search Pages
Tìm Fanpage	Search Pages
Lọc lĩnh vực trang	Filter Page industries
Lọc lĩnh vực Fanpage	Filter Page industries
Mọi lĩnh vực	All industries
Không tìm thấy trang phù hợp	No matching Pages
Không tìm thấy Fanpage phù hợp	No matching Pages
Thử tên, ngành hoặc khu vực khác.	Try another name, industry or area.
Quản lý trang	Manage Page
Quản lý Fanpage	Manage Page
Chia sẻ	Share
Đã sao chép	Copied
Chưa có liên kết công khai.	No public Page link is available yet.
Tên trang:	Page handle:
Tên Fanpage:	Page handle:
Chỉ chủ trang thấy	Only Page owners see this
Chỉ chủ Fanpage thấy	Only Page owners see this
· Chỉ chủ trang thấy	· Only Page owners see this
· Chỉ chủ Fanpage thấy	· Only Page owners see this
Sửa thông tin	Edit details
Sửa thông tin trang	Edit Page details
Sửa thông tin Fanpage	Edit Page details
Các thông tin này xuất hiện trên trang công khai.	This information appears on your public Page.
Các thông tin này xuất hiện trên Fanpage công khai.	This information appears on your public Page.
@Tên trang	@Page handle
@Tên Fanpage	@Page handle
Giờ hoạt động	Business hours
Ví dụ: Thứ Hai–Thứ Bảy · 9:00–18:00	Example: Mon–Sat · 9 AM–6 PM
Thứ Hai–Thứ Bảy · 9:00–18:00	Mon–Sat · 9 AM–6 PM
Hằng ngày · 11:00–21:00	Daily · 11 AM–9 PM
Nút chính trên trang	Primary Page button
Nút chính trên Fanpage	Primary Page button
Đặt lịch / Đặt bàn	Book appointment / table
Đặt lịch	Book appointment
Đặt bàn	Book a table
Số điện thoại công khai	Public phone number
Cách liên hệ khác	Other contact method
Ảnh đại diện	Profile photo
Ảnh bìa	Cover photo
Đổi ảnh bìa	Change cover photo
Thêm ảnh bìa	Add cover photo
Đã đổi ảnh bìa.	Cover photo changed.
Không thể lưu ảnh trên thiết bị này.	Could not save the photo on this device.
Không thể đổi ảnh bìa.	Could not change the cover photo.
Ảnh PNG/JPG/WebP/GIF, tối đa 350 KB mỗi ảnh.	PNG/JPG/WebP/GIF, up to 350 KB per image.
Lưu thay đổi	Save changes
Đã cập nhật trang.	Page updated.
Đã cập nhật Fanpage.	Page updated.
Tên @ này chưa hợp lệ hoặc đã được dùng.	This @handle is invalid or already in use.
Vui lòng nhập số điện thoại cho nút Gọi.	Enter a phone number for the Call button.
Chọn ảnh PNG, JPG, WebP hoặc GIF không quá 350 KB.	Choose a PNG, JPG, WebP or GIF image under 350 KB.
Không đọc được ảnh.	Could not read the image.
Không thể lưu ảnh.	Could not save the image.
Thêm ảnh (tùy chọn, tối đa 350 KB)	Add a photo (optional, up to 350 KB)
Ảnh bài đăng của trang	Page post photo
Ảnh bài đăng của Fanpage	Page post photo
Viết nội dung hoặc chọn ảnh trước khi đăng.	Write something or select a photo before posting.
Không thể đăng ảnh.	Could not post the photo.
Nội dung trang	Page content
Nội dung Fanpage	Page content
Bài viết	Posts
Ưu đãi	Offers
Giới thiệu	About
Lĩnh vực:	Industry:
Khu vực:	Area:
Giờ hoạt động:	Business hours:
Điện thoại:	Phone:
Liên hệ:	Contact:
Chưa có ưu đãi nào đang mở.	No active offers yet.
Quay lại danh sách	Back to Pages
Quay lại danh sách Fanpage	Back to Pages
Trang công khai cho tiệm, doanh nghiệp hoặc người làm nghề. Giới thiệu dịch vụ và đăng cập nhật cho người theo dõi.	Public Pages for salons, businesses and professionals. Introduce your services and share updates with followers.
Fanpage công khai cho tiệm, doanh nghiệp hoặc người làm nghề. Giới thiệu dịch vụ và đăng cập nhật cho người theo dõi.	Public Pages for salons, businesses and professionals. Introduce your services and share updates with followers.
Giới thiệu một tiệm, doanh nghiệp hoặc thương hiệu với cộng đồng.	Introduce a salon, business or brand to the community.
Tên trang	Page name
Tên Fanpage	Page name
Lĩnh vực	Industry
Dịch vụ khác	Other services
Giới thiệu ngắn	Short description
Trang của bạn cung cấp gì?	What does your Page offer?
Fanpage của bạn cung cấp gì?	What does your Page offer?
Cách liên hệ công khai (tùy chọn)	Public contact method (optional)
Ví dụ: Nhắn tin qua NEXORA	Example: Message on NEXORA
Nhắn tin qua NEXORA	Message on NEXORA
Trang của bạn	Your Page
Fanpage của bạn	Your Page
Trang được tài trợ	Sponsored Pages
Fanpage được tài trợ	Sponsored Pages
✦ Được tài trợ	✦ Sponsored
Quảng bá trang	Promote Page
Quảng bá Fanpage	Promote Page
Xem quảng bá	View promotion
Phát triển doanh thu từ trang	Grow revenue from your Page
Phát triển doanh thu từ Fanpage	Grow revenue from your Page
Đăng ưu đãi để khách liên hệ trực tiếp. Nếu muốn tiếp cận thêm người gần tiệm, anh/chị có thể quảng bá trang.	Post an offer so customers can contact you. You can also promote your Page to reach more people nearby.
＋ Đăng ưu đãi	＋ Post an offer
Khám phá ưu đãi gần bạn và lưu mã trước khi hết hạn.	Discover nearby offers and save a code before it expires.
Chưa có ưu đãi còn hạn	No active offers yet
Hãy quay lại sau để xem deal mới gần bạn.	Check back for new deals near you.
Ưu đãi của trang	Page offers
Ưu đãi của Fanpage	Page offers
Trang sẽ được đặt ở vị trí nổi bật gần khu vực của bạn và luôn có nhãn “Được tài trợ”.	Your Page will appear in a prominent local placement, always labeled “Sponsored.”
Fanpage sẽ được đặt ở vị trí nổi bật gần khu vực của bạn và luôn có nhãn “Được tài trợ”.	Your Page will appear in a prominent local placement, always labeled “Sponsored.”
Vị trí	Placement
Bảng tin và danh sách Trang	Feed and Pages list
Bảng tin và danh sách Fanpage	Feed and Pages list
Khu vực	Area
Thời hạn	Duration
7 ngày	7 days
Giá đề xuất	Proposed price
$19 / 7 ngày	$19 / 7 days
Quảng bá nổi bật	Boost post
Quay lại trang	Back to Page
Quay lại Fanpage	Back to Page
Đã cập nhật vị trí tài trợ.	Sponsored placement enabled. No payment was taken.
Xem trang	View Page
Xem Fanpage	View Page
＋ Theo dõi	＋ Follow
✓ Đang theo dõi	✓ Following
Nhắn tin	Message
Liên hệ:	Contact:
Đăng cập nhật từ trang	Post an update from your Page
Đăng cập nhật từ Fanpage	Post an update from your Page
Có gì mới tại trang của bạn?	What's new on your Page?
Bài cập nhật	Updates
Trang chưa có bài cập nhật.	This Page has no updates yet.
Fanpage chưa có bài cập nhật.	This Page has no updates yet.
Chưa có trang nào	No Pages yet
Tạo trang đầu tiên để giới thiệu doanh nghiệp của bạn.	Create the first Page to introduce your business.
Tạo Fanpage đầu tiên để giới thiệu doanh nghiệp của bạn.	Create the first Page to introduce your business.
Nhắn tin cho trang	Message a Page
Nhắn tin cho Fanpage	Message a Page
Hỏi về dịch vụ, sản phẩm hoặc thông tin của trang.	Ask about services, products or Page details.
Hỏi về dịch vụ, sản phẩm hoặc thông tin của Fanpage.	Ask about services, products or Page details.
Ví dụ: Hỏi về dịch vụ	Example: Ask about services
Hỏi về dịch vụ	Ask about services
Chào anh/chị, tôi muốn hỏi thêm về dịch vụ và thời gian mở cửa.	Hello, I'd like to ask about your services and opening hours.
Đã theo dõi trang.	Following this Page.
Đã theo dõi Fanpage.	Following this Page.
Đã bỏ theo dõi trang.	Unfollowed this Page.
Đã bỏ theo dõi Fanpage.	Unfollowed this Page.
Đã đăng cập nhật.	Update posted.
Tiệm nail tại Houston. Theo dõi mẫu mới và các cập nhật từ tiệm.	A nail salon in Houston. Follow for new designs and salon updates.
Món Việt và tin mới từ nhà hàng dành cho cộng đồng Houston.	Vietnamese food and restaurant updates for the Houston community.
Chào mừng đến với trang BITCOIN NAIL BAR! Theo dõi để xem mẫu nail mới và tin từ tiệm.	Welcome to the BITCOIN NAIL BAR Page! Follow for new nail designs and salon news.
Saigon Kitchen xin chào cộng đồng Houston. Trang sẽ cập nhật món mới và sự kiện tại nhà hàng.	Saigon Kitchen welcomes the Houston community. Follow for new dishes and restaurant events.
Việc làm	Jobs
Tin nhắn & Cuộc gọi	Messages & Calls
Tin nhắn	Messages
Cuộc gọi	Calls
Nhóm chat	Group chats
⌖ Ưu tiên bài gần bạn	⌖ Showing nearby posts first
Đổi khu vực	Change area
Nhóm	Groups
Mua bán	Buy & sell
Đăng bài	Create post
Tất cả bài đăng	All listings
Chợ hôm nay	Today's marketplace
Bài cần bán đang mở	Active items for sale
Bài cần mua đang mở	Active wanted posts
Phù hợp với bạn	Matches for you
Tìm món cần mua	Find an item to buy
Cần mua	Wanted
Phù hợp với tôi	Matches for me
Đăng cần mua	Post a wanted item
Phù hợp với bài cần mua của bạn	Matches your wanted post
Mẫu bài mua bán	Marketplace post examples
Cần bán · 12 ghế trắng · $100/cái →	For sale · 12 white chairs · $100 each →
Cần mua · đèn hơ gel · tối đa $60 →	Wanted · gel lamp · up to $60 →
Đây là mẫu minh họa. Hãy sửa thông tin trước khi đăng.	This is an example. Edit the details before posting.
Giao dịch trực tiếp giữa các thành viên. Xem ảnh thật và tình trạng món đồ trước khi trả tiền. Không chuyển tiền trước.	Trade directly with members. Check real photos and the item's condition before paying.
Bài viết, việc làm và mua bán trong cùng một nơi. Bài gần khu vực bạn xem sẽ lên trước.	Posts, jobs and listings in one place. Nearby posts appear first.
Bạn muốn chia sẻ điều gì?	What would you like to share?
Nhóm của tôi →	My groups →
Bài mới trong cộng đồng	Recent community posts
Bài mới	Recent posts
Xem thêm bài	Show more posts
Chưa có bài trong mục này	No posts in this category yet
Bạn có thể bắt đầu ngay tại đây.	You can start right here.
Đăng món cần bán	List an item for sale
Đăng bán	List for sale
Đăng cần mua	Post a wanted item
Đăng tin tuyển người	Post a hiring job
Viết bài blog	Write a blog post
Viết bài	Write a post
Viết bài đầu tiên	Write the first post
Đăng ảnh mẫu	Post work photos
Tạo bình chọn	Create a poll
Tạo sự kiện	Create an event
Đăng bài dễ hơn	Create posts faster
Mỗi mẫu chỉ hỏi thông tin cần thiết cho loại bài đó. Bài Hỏi đáp có trạng thái	Each template asks only for relevant details. Q&A posts can be marked
Đã giải đáp	Answered
; sự kiện có ngày và hình thức tham gia.	; events include a date and format.
Nhóm theo ngành nghề	Industry groups
Tạo nhóm với chủ đề, khu vực và nội quy rõ ràng.	Create a group with a clear topic, area and rules.
Tạo nhóm	Create group
Tên nhóm · ngành nghề · khu vực · mô tả · nội quy. Người tạo có thể xem trước trước khi lưu.	Group name, industry, area, description and rules. Preview before saving.
Tuyển người hoặc tìm việc trong ngành làm đẹp và nhà hàng.	Hire or find work in beauty and restaurants.
2 MẪU BÀI	2 POST TEMPLATES
Tất cả	All
Làm đẹp	Beauty
Nhà hàng	Restaurants
Tin việc làm	Job posts
Thông tin bắt buộc	Required details
Vị trí, kỹ năng, thành phố và	Role, skills, city and
đơn vị lương	pay period
được ghi bằng trường riêng. Người xem không phải đoán $2,000 là mỗi tuần hay mỗi tháng.	are separate fields so readers know whether $2,000 means per week or per month.
Bài viết dài về nghề, kinh doanh và công nghệ. Đăng một lần, xuất hiện trên NEXORA và NailHub.AI.	Long-form articles on the trade, business and technology. Publish once to NEXORA and NailHub.AI.
Viết Blog	Write a blog post
Bài Blog	Blog posts
Viết bài Blog	Write a blog post
Một bài xuất hiện trên cả NEXORA và NailHub.AI.	One post appears on both NEXORA and NailHub.AI.
Tiêu đề *	Title *
Chủ đề *	Topic *
Khu vực (không bắt buộc)	Area (optional)
Mô tả ngắn *	Short summary *
Nội dung bài *	Article body *
Ảnh bìa (tùy chọn)	Cover image (optional)
Đăng Blog	Publish blog
Ví dụ: Cách chọn đèn hơ cho tiệm	Example: choosing a salon nail lamp
Người đọc sẽ học được gì?	What will readers learn?
Viết nội dung đầy đủ của bài...	Write the full article...
Nội dung chung	Shared content
Bài Blog dùng cùng một dữ liệu cho hai giao diện. Tác giả sửa một lần, cả hai nơi cùng cập nhật.	Blog posts use the same content in both previews. Edit once to update both views.
Tìm bài Blog...	Search blog posts...
Lọc chủ đề Blog	Filter blog topics
Tìm thành viên để nhắn tin, gọi thoại hoặc video. Tin từ người lạ vào Yêu cầu tin nhắn để bạn xem trước.	Find members to message or call. Messages from new people go to Requests for your review.
ID & quyền riêng tư	ID & privacy
Tin nhắn riêng, xem yêu cầu mới	Direct messages and new requests
Gọi thoại, video và cuộc gọi nhỡ	Voice, video and missed calls
Trò chuyện với nhiều người	Talk with a group
Tìm người để bắt đầu trò chuyện	Find someone to start a conversation
Nhập tên hoặc NEXORA ID	Enter a name or NEXORA ID
Có thể tìm bằng @nickname, số điện thoại hoặc email nếu người đó cho phép.	Search by @nickname, phone or email when their privacy settings allow it.
Mẫu liên hệ	Message templates
Dùng mẫu để hỏi mua, hẹn xem hàng, liên hệ việc làm hoặc yêu cầu gọi lại.	Use a template to ask about an item, arrange a visit, discuss a job or request a call back.
4 MẪU	4 TEMPLATES
Nháp tin nhắn	Message drafts in preview
Kiểm tra trước khi gửi	Review before sending
Mẫu chỉ chuẩn bị nội dung. Người dùng xem lại người nhận, món hàng hoặc công việc rồi mới gửi trong sản phẩm thật.	Templates prepare a draft. Review the recipient and subject before sending in the live product.
Deal & Coupon	Deals & Coupons
Đăng Deal & Coupon	Post a deal or coupon
Ưu đãi rõ ràng, có hạn dùng và mã nếu cần.	A clear offer, expiry date and optional code.
Tên ưu đãi	Offer name
Mức ưu đãi	Offer amount
Mã coupon (nếu có)	Coupon code (optional)
Hết hạn ngày	Expiry date
Điều kiện áp dụng	Terms
Ví dụ: Giảm 10% dịch vụ Gel-X	Example: 10% off Gel-X services
Ví dụ: Giảm 10% hoặc tặng $10	Example: 10% off or $10 off
Ví dụ: GEL10	Example: GEL10
Dịch vụ hoặc sản phẩm áp dụng...	Applicable services or products...
Giảm 10% dịch vụ Gel-X	10% off Gel-X services
Giảm 10%	10% off
Áp dụng cho khách đặt lịch trong tuần này.	Valid for clients who book this week.
Sao chép mã	Copy code
Tuyển dụng và tìm việc thường xuyên theo ngành nghề, vị trí và khu vực.	Hire and find ongoing work by industry, role and location.
Tìm người hỗ trợ hoặc nhận ca ngắn hạn theo ngày và giờ cụ thể.	Find help or take a short shift on a specific date and time.
Tất cả ca	All shifts
Lọc loại ca	Filter shift type
Lọc ngày làm	Filter shift date
Các ngày sắp tới	Upcoming dates
Ca sắp tới	Upcoming shifts
Thông tin một ca	Shift details
Mỗi tin ghi rõ ngày, khung giờ, công việc, khu vực và mức trả nếu có. Ca đã qua ngày sẽ tự ẩn.	Each post shows the date, hours, role, area and pay when available. Past shifts are hidden automatically.
Chưa có ca phù hợp	No matching shifts
Đăng ca cần người hoặc ngày bạn rảnh nhận ca.	Post a shift that needs help or a date when you are available.
Đăng ca cần người	Post a shift
Xem ca làm thêm	View extra shift
CA LÀM THÊM · RẢNH NHẬN CA	EXTRA SHIFTS · AVAILABLE
CA LÀM THÊM · CẦN NGƯỜI THEO CA	EXTRA SHIFTS · HELP NEEDED
Đóng ca	Close shift
Ngành khác	Other industries
Lọc theo thời gian	Filter by timing
Ca làm thêm	Extra shifts
Xem Ca làm thêm →	View extra shifts →
Xem Việc làm →	View jobs →
Tin ca làm thêm	Extra shift posts
Deal mới	Recent deals
Mọi thời gian	Any time
Hôm nay	Today
Rảnh nhận ca	Available for a shift
Cần người theo ca	Need shift help
Đăng ngày và giờ bạn có thể nhận việc.	Post when you are available for work.
Tìm người làm ca ngắn theo nghề và khu vực.	Find someone for a short shift by role and area.
Công việc muốn nhận	Work you can take
Công việc khác	Other work
Vị trí cần người	Role needed
Vị trí khác	Other role
Khu vực muốn làm	Area where you can work
Nơi làm việc	Work location
Ngày rảnh	Available date
Ngày cần người	Shift date
Khung giờ rảnh	Available hours
Khung giờ làm	Shift hours
Kỹ năng nổi bật	Key skills
Yêu cầu chính	Key requirements
Mức tiền mong muốn (USD)	Desired pay (USD)
Mức trả (USD)	Pay (USD)
Đơn vị tiền	Pay period
Ghi chú	Notes
Ví dụ: Phụ sự kiện	Example: event assistant
Ví dụ: 10:00–18:00	Example: 10:00–18:00
Có thể để trống	Optional
Kinh nghiệm hoặc điều cần biết...	Experience or other details...
Cách liên hệ hoặc thông tin ca làm...	Contact details or shift notes...
Có thể hỗ trợ tiệm đông khách trong ngày.	Available to help a busy salon today.
Tiệm đông khách, cần người hỗ trợ một ngày.	Busy salon needs help for one day.
Rảnh hôm nay, có thể hỗ trợ tiệm đông khách.	Available today to help a busy salon.
Cần người hỗ trợ ca tối hôm nay.	Help needed for tonight's shift.
Mẫu tham khảo	Sample post
Đăng tin và giao dịch miễn phí. Người mua, người bán tự nhắn tin, thỏa thuận giá và giao nhận; NEXORA không thu phí giao dịch.	Posting and person-to-person transactions are free. Buyers and sellers message each other and arrange price and pickup; NEXORA charges no transaction fee.
Toàn thời gian	Full time
Nhân viên	Staff member
Tiệm đông khách, cần thợ có kinh nghiệm. Nhắn tin để trao đổi.	Busy salon seeks an experienced technician. Message to discuss the role.
Có 3 năm kinh nghiệm, tìm tiệm tại Houston. Có thể làm cuối tuần.	Three years of experience. Seeking a salon in Houston; available on weekends.
Nhà hàng cần nhân viên phục vụ ca tối. Nhắn tin để trao đổi.	Restaurant seeks an evening server. Message to discuss the role.
Có thể hỗ trợ nhà hàng vào ca tối.	Available to help a restaurant during the evening shift.
Cần người hỗ trợ công việc. Nhắn tin để trao đổi chi tiết.	Help wanted. Message to discuss the details.
Có kinh nghiệm và sẵn sàng trao đổi công việc phù hợp.	Experienced and open to suitable work.
RẢNH NHẬN CA	AVAILABLE FOR A SHIFT
CẦN NGƯỜI THEO CA	SHIFT HELP NEEDED
VIỆC LÀM · RẢNH NHẬN CA	JOBS · AVAILABLE FOR A SHIFT
VIỆC LÀM · CẦN NGƯỜI TRONG NGÀY	JOBS · SAME-DAY HELP NEEDED
Chưa có tin phù hợp	No matching jobs
Chọn mẫu tuyển người hoặc tìm việc để đăng tin.	Choose a hiring or job seeking template to post.
Tất cả ngành	All industries
Mọi danh mục	All categories
Loại hàng hóa	Product type
Mọi loại hàng	All product types
Khoảng giá (USD)	Price range (USD)
Từ $	From $
Đến $	To $
Giá từ (USD)	Minimum price (USD)
Giá đến (USD)	Maximum price (USD)
Giá đến phải lớn hơn hoặc bằng giá từ.	Maximum price must be at least the minimum.
Khoảng giá chưa hợp lệ	Invalid price range
Giá đến cần lớn hơn hoặc bằng giá từ.	Enter a maximum price greater than or equal to the minimum.
Mọi tiểu bang	All states
Mọi thành phố	All cities
Tất cả thành phố	All cities
Thành phố khác	Other city
Khác (tự nhập danh mục)	Other (enter a category)
Chọn ngành nghề	Choose industry
Chọn danh mục	Choose category
Chọn tiểu bang	Choose state
Chọn thành phố	Choose city
Nail & làm đẹp	Nail & beauty
Nhà hàng & ăn uống	Restaurants & food service
Máy móc & thiết bị	Equipment & machines
Nội thất tiệm	Salon furniture
Bột, gel, sơn	Acrylic, gel & polish
Dụng cụ & đồ nghề	Tools
Vật tư tiêu hao	Consumables
Thiết bị spa	Spa equipment
Mi & chân mày	Lashes & brows
Mỹ phẩm & chăm sóc da	Cosmetics & skin care
Khăn, đồng phục & bảo hộ	Towels, uniforms & safety
Trang trí & bảng hiệu	Decor & signage
Phần mềm & POS	Software & POS
Mặt bằng & sang nhượng	Space & business transfers
Thiết bị bếp	Kitchen equipment
Dụng cụ phục vụ	Service supplies
Máy pha chế	Drink equipment
Bao bì & vật tư	Packaging & supplies
Bàn ghế nhà hàng	Restaurant tables & chairs
Kệ trưng bày	Display shelves
Quầy thu ngân	Checkout counters
Nội thất	Furniture
Khác	Other
Đang bán	For sale
Đang tìm mua	Wanted
Bài đăng của tôi	My listings
Phù hợp với bài đã chọn	Matches for selected post
MUA BÁN · CẦN BÁN	MARKETPLACE · FOR SALE
MUA BÁN · CẦN MUA	MARKETPLACE · WANTED
VIỆC LÀM · TUYỂN NGƯỜI	JOBS · HIRING
VIỆC LÀM · TÌM VIỆC	JOBS · SEEKING WORK
TUYỂN NGƯỜI	HIRING
TÌM VIỆC	SEEKING WORK
CẦN BÁN	FOR SALE
CẦN MUA	WANTED
Liên hệ giá	Ask for price
Xem trong Mua bán	View in Marketplace
Xem trong Việc làm	View in Jobs
Xem nhóm	View group
Đọc Blog	Read blog
Liên hệ	Contact
Đóng tin	Close post
Đánh dấu đã giải đáp	Mark answered
Quan tâm	Interested
Tuyển người	Hiring
Tìm việc	Seeking work
Nội dung	Content
Tiêu đề	Title
Mô tả	Description
Chủ đề	Topic
Ngành nghề	Industry
Khu vực	Area
Tình trạng	Condition
Mới	New
Còn tốt	Good condition
Đã qua sử dụng	Used
Tiểu bang *	State *
Thành phố *	City *
Thành phố khác *	Other city *
Tên món đồ *	Item name *
Mỗi cái	Per item
Cả lô	Entire lot
Giá bán	Asking price
Ngân sách tối đa	Maximum budget
Tạo bài đăng mới	Create a listing
Sửa bài đăng	Edit listing
Thông tin rõ ràng giúp người phù hợp tìm thấy bài của bạn.	Clear details help the right people find your listing.
Đăng món bạn đang có	List an item you have
Đăng món bạn đang tìm	Post an item you want to buy
Lưu món bạn muốn tìm	Save an item you are looking for
Ngành nghề *	Industry *
Danh mục *	Category *
Tên danh mục khác *	Other category name *
Số lượng * (cái)	Quantity * (items)
Giá bán (USD) *	Asking price (USD) *
Đơn vị giá *	Price unit *
Tình trạng *	Condition *
Cho phép mua lẻ	Allow individual sales
Tắt nếu chỉ bán toàn bộ số lượng.	Turn off to sell only the entire lot.
Đăng	Post
Đã điền từ khu vực bạn chọn. Bạn có thể sửa hoặc dùng vị trí hiện tại.	Filled from your selected area. You can edit it or use your current location.
Ví dụ: Ghế ngồi chờ khách màu trắng	Example: white waiting chairs
Ví dụ: Máy giặt khăn	Example: towel washing machine
Nhập tên thành phố	Enter a city name
Tình trạng, yêu cầu hoặc thông tin thêm...	Condition, requirements or other details...
Cần bán	For sale
Mô tả công việc	Job description
Vị trí cần tuyển	Role to hire
Vị trí cần tuyển *	Role to hire *
Vị trí khác	Other role
Kỹ năng cần có *	Required skills *
Thành phố, tiểu bang *	City, state *
Mức lương (USD) *	Pay (USD) *
Đơn vị lương *	Pay period *
Lịch làm việc *	Work schedule *
Mô tả công việc *	Job description *
Ví dụ: Quản lý ca	Example: shift manager
Ví dụ: phục vụ khách, Gel-X hoặc nấu bếp	Example: customer service, Gel-X or cooking
Ví dụ: Houston, TX	Example: Houston, TX
Ví dụ: 20	Example: 20
Ví dụ: Toàn thời gian, 5 ngày/tuần	Example: full time, 5 days/week
Môi trường, yêu cầu và cách liên hệ...	Workplace, requirements and how to contact you...
Vị trí mong muốn	Desired role
Kỹ năng cần có	Required skills
Kỹ năng của bạn	Your skills
Thành phố, tiểu bang	City, state
Mức lương (USD)	Pay (USD)
Đơn vị lương	Pay period
Mỗi giờ	Per hour
Mỗi ngày	Per day
Mỗi tuần	Per week
Mỗi tháng	Per month
Lịch làm việc	Work schedule
Có thể bắt đầu từ	Available from
Tạo bài đăng	Create post
Sửa bài	Edit post
Hủy	Cancel
Đóng	Close
Chọn chủ đề	Select a topic
Mẫu Mẹo nghề	Trade tip
Chia sẻ kinh nghiệm theo từng bước.	Share practical experience step by step.
Tiêu đề mẹo	Tip title
Ví dụ: Giữ màu gel bền hơn	Example: Make gel color last longer
Chọn	Select
Chăm sóc khách	Customer care
Các bước hoặc mẹo cụ thể	Steps or practical tips
Viết 2–3 bước dễ làm theo...	Write 2–3 easy steps...
Khu vực bài đăng (không bắt buộc)	Post area (optional)
Chỉ lấy vị trí khi bạn cho phép. Có thể sửa gợi ý.	Location is used only with your permission. You can edit the suggestion.
PNG, JPG, WebP hoặc GIF · tối đa 700 KB	PNG, JPG, WebP or GIF · up to 700 KB
Chưa chọn ảnh. Bài vẫn đăng bình thường.	No image selected. You can still publish the post.
Lưu	Save
Đăng	Post
Điền ví dụ	Fill example
Dùng vị trí hiện tại	Use current location
Tất cả chủ đề	All topics
Kỹ thuật Nail	Nail techniques
Kỹ thuật nail	Nail techniques
Quản lý tiệm	Salon management
Kinh doanh	Business
Công nghệ	Technology
Khoe mẫu	Show your work
Ảnh mẫu	Work photos
Chia sẻ mẹo	Tips
Đặt câu hỏi	Ask
Bình chọn	Poll
Viết blog	Write blog
Mẹo nghề	Trade tip
Hỏi đáp	Q&A
Bài viết	Posts
Sự kiện	Events
Mua sắm đồ nghề	Shopping for supplies
Phụ bếp	Kitchen assistant
Phục vụ	Server
Thợ nail	Nail technician
Gel-X, tay chân nước	Gel-X and manicure/pedicure
Gel-X, dip, tay chân nước	Gel-X, dip and manicure/pedicure
POS & phần mềm	POS & software
Dụng cụ	Tools
Bán lẻ & dịch vụ	Retail & services
Bài của tôi	My posts
Nhắn tin	Message
Đánh dấu đã bán	Mark sold
Đã mua	Purchased
Đang mở	Open
Có bán lẻ	Available individually
Chọn ngành, vị trí, lương và địa điểm.	Choose an industry, role, pay and location.
Chọn ngành, vị trí và khu vực muốn làm.	Choose an industry, role and preferred area.
Đọc bài	Read article
Xem bài	View post
Viết từ	Written on
Tìm bài Blog	Search blog posts
Kỹ năng	Skills
Hình thức	Format
Ngày tổ chức	Event date
Khảo sát	Poll
Sự kiện / lớp học	Events & classes
Chia sẻ bài viết	Share a post
Chọn ảnh PNG, JPG, WebP hoặc GIF tối đa 700 KB.	Choose a PNG, JPG, WebP or GIF image up to 700 KB.
Chưa có bài phù hợp	No matching posts
Thử đổi bộ lọc hoặc tạo bài Cần mua để nhận kết quả mới.	Try another filter or create a wanted post to receive matches.
Chưa có bài trong danh mục này	No posts in this category
Chọn một cách đăng bài ở phía trên để bắt đầu.	Choose a post type above to get started.
Toàn quốc	Nationwide
Toàn nước Mỹ	Across the US
Chưa có yêu cầu tin nhắn đang chờ.	No pending message requests.
Đã ưu tiên bài gần bạn	Showing nearby posts first
Không có bài đăng nào	No listings yet
Thử đổi bộ lọc	Try another filter
Xem tin nhắn	View message
Xem hội thoại	Open conversation
Hội thoại đã chấp nhận	Accepted conversations
Soạn nháp tin nhắn	Draft a message
Không thấy người phù hợp. Hãy kiểm tra tên hoặc NEXORA ID.	No member found. Check the name or NEXORA ID.
Tìm thành viên	Find members
Viết lời nhắn...	Write a message...
Viết câu trả lời...	Write a reply...
Chấp nhận để trả lời	Accept to reply
Bỏ qua	Ignore
Chặn / Báo cáo	Block / Report
Quay lại hộp thư	Back to inbox
Lưu nháp trả lời	Save reply draft
YÊU CẦU TIN NHẮN	MESSAGE REQUEST
ĐÃ CHẤP NHẬN	ACCEPTED
CHƯA XEM	UNREAD
CHỜ QUYẾT ĐỊNH	AWAITING DECISION
Xem tin nhắn đầu tiên	View first message
1. Xem nội dung → 2. Chấp nhận nếu muốn trả lời → 3. Soạn tin	1. Read → 2. Accept to reply → 3. Compose
Bạn đã chấp nhận yêu cầu này và có thể soạn tin trả lời.	You accepted this request and can write a reply.
Chỉ xem tin sẽ không tự chấp nhận và không gửi thông báo đã xem cho người lạ trong luồng đề xuất.	Viewing does not accept the request or send a read receipt.
Yêu cầu tin nhắn	Message requests
Tin nhắn đầu tiên mới	New message request
Xem bài phù hợp	View matching post
Mở hộp thư	Open inbox
với tên món, số lượng, ngân sách và khu vực. Khi có bài bán phù hợp, mục	with the item name, quantity, budget and area. When a matching sale appears,
sẽ hiển thị lý do.	will explain the match.
12 ghế ngồi chờ khách màu trắng	12 white waiting chairs
Ghế trắng cho khu vực chờ của tiệm.	White chairs for the salon waiting area.
Đèn hơ gel UV/LED	UV/LED nail lamp
Đèn hơ gel dùng tại tiệm.	Nail lamp used in the salon.
Ghế chờ màu trắng	White waiting chair
Có thể mua lẻ.	Available individually.
Cần mua ghế ngồi chờ màu trắng	Looking for white waiting chairs
Ưu tiên ghế màu trắng, xem hàng trực tiếp.	Prefer white chairs and an in-person viewing.
Cần mua đèn hơ gel UV	Looking for a UV nail lamp
Tìm đèn hơ gel cho tiệm.	Looking for a nail lamp for the salon.
Tìm tủ trưng bày sơn	Looking for a polish display cabinet
Cần tủ đựng sơn gọn cho tiệm.	Need a compact polish cabinet for the salon.
4 bộ bàn ghế nhà hàng	4 restaurant table and chair sets
Bàn ghế dùng trong khu vực khách ngồi, có thể mua lẻ.	Dining area furniture, available individually.
Nên dùng đèn hơ gel nào cho tiệm đông khách?	Which nail lamp works for a busy salon?
Mong mọi người chia sẻ loại đèn bền và dễ vệ sinh.	Please share a durable lamp that is easy to clean.
Ba bước giữ cọ gel sạch	Three steps to keep gel brushes clean
Lau cọ sau mỗi lượt, đậy nắp và cất ở nơi khô mát.	Clean brushes after each use, cap them and store in a cool, dry place.
Tiệm nên mở cửa cuối tuần lúc nào?	What time should the salon open on weekends?
9 giờ sáng	9 AM
10 giờ sáng	10 AM
7 ngày	7 days
Workshop Gel-X cơ bản	Beginner Gel-X workshop
Buổi chia sẻ kỹ thuật dành cho thợ mới.	A technique workshop for new nail technicians.
Mẫu Gel-X hoa nổi tông hồng	Pink 3D floral Gel-X set
Mẫu mới vừa hoàn thành cho khách hôm nay.	A new set completed for a client today.
Chào cộng đồng NEXORA	Hello, NEXORA community
Rất vui được kết nối và chia sẻ kinh nghiệm cùng mọi người.	Happy to connect and share experience with everyone.
Chợ Đồ Nghề Nail Texas	Texas Nail Supply Market
Mua bán đồ nghề, máy móc và nội thất tiệm nail.	Trade nail supplies, equipment and salon furniture.
Đăng hình thật, giá và thành phố.	Post real photos, prices and city.
Chia sẻ kỹ thuật và ý tưởng mẫu nail.	Share techniques and nail design ideas.
Tôn trọng tác giả và ghi nguồn ảnh.	Respect creators and credit photos.
Tuyển thợ nail Gel-X	Hiring a Gel-X nail technician
Tiệm đông khách, cần thêm thợ có kinh nghiệm.	Busy salon seeks an experienced nail technician.
Tìm việc thợ nail	Seeking nail technician work
Có kinh nghiệm và có thể làm cuối tuần.	Experienced and available on weekends.
Tuyển nhân viên phục vụ	Hiring a server
Nhận order, chăm sóc khách	Take orders, help guests
Ca tối	Evening shift
Nhà hàng cần nhân viên phục vụ ca tối.	Restaurant seeks an evening server.
Tìm việc phụ bếp	Seeking kitchen assistant work
Chuẩn bị nguyên liệu, hỗ trợ bếp	Prep ingredients and support the kitchen
Có kinh nghiệm làm bếp, có thể làm cuối tuần.	Kitchen experience; available on weekends.
Chọn đèn hơ gel phù hợp cho tiệm đông khách	Choose a nail lamp for a busy salon
Những điều nên kiểm tra trước khi mua đèn hơ cho một tiệm có nhiều bàn làm việc.	What to check before buying lamps for a salon with many stations.
Sắp xếp khu chờ để khách thấy thoải mái hơn	Arrange a more comfortable waiting area
Một vài cách bố trí ghế, lối đi và thông tin dịch vụ cho khu vực tiếp khách.	Ideas for arranging chairs, walkways and service information.
Các mục Community	Community sections
Xem thông báo	View notifications
Thông báo	Notifications
Tìm tên sản phẩm...	Search items...
Chọn cách liên hệ	Choose how to contact
Thông báo phù hợp	Match alerts
Cần người	Hiring
Tóm tắt ngắn nội dung bài	Summarize your post
Chia sẻ kinh nghiệm, cập nhật hoặc câu chuyện của bạn...	Share an experience, update, or story...
Ảnh (nếu có)	Photo (optional)
Tên mẫu hoặc dịch vụ	Work photo or service name
Loại dịch vụ	Service type
Bột / Acrylic	Acrylic powder
Chân tay nước	Manicure & pedicure
Điểm nổi bật của mẫu	What makes this work stand out
Màu sắc, kỹ thuật, thời gian thực hiện...	Colors, technique, and time needed...
Ảnh thật của mẫu	Actual photo of your work
Câu hỏi ngắn	Short question
Bối cảnh và điều đã thử	Context and what you have tried
Mô tả để mọi người trả lời đúng hơn...	Add details to help others answer...
Câu hỏi khảo sát	Poll question
Lựa chọn A	Option A
Lựa chọn B	Option B
3 ngày	3 days
14 ngày	14 days
Tên sự kiện	Event name
Trực tiếp	In person
Trực tuyến	Online
Thành phố hoặc nền tảng	City or platform
Nội dung và cách tham gia	Event details and how to join
Ai nên tham gia, lịch trình, cách đăng ký...	Who should join, the schedule, and how to sign up...
Tên nhóm	Group name
Mi & Chân Mày	Lashes & brows
Chủ tiệm	Salon owners
Làm đẹp khác	Other beauty services
Nhóm dành cho ai?	Who is this group for?
Mục đích và người phù hợp...	Purpose and intended members...
Nội quy ngắn	Short group rules
Quy tắc đăng bài và ứng xử...	Posting and conduct rules...
Kinh nghiệm và thời gian làm việc mong muốn...	Experience and preferred work schedule...
Hỏi mua món hàng	Ask about an item
Người nhận	Recipient
Tên người bán	Seller name
Món hàng	Item
Tên món bạn quan tâm	Item you are interested in
Nội dung tin nhắn	Message
Người bán	Seller
Hẹn xem hàng	Arrange a viewing
Tên người bán hoặc mua	Buyer or seller name
Tên món hàng	Item name
Thời gian và khu vực muốn gặp...	Meeting time and area...
Liên hệ việc làm	Contact about a job
Tên tiệm hoặc ứng viên	Salon or applicant name
Tên vị trí	Position
Yêu cầu gọi lại	Request a callback
Người cần liên hệ	Contact person
Tên người hoặc tiệm	Person or salon name
Chủ đề cuộc gọi	Reason for the call
Thời gian thuận tiện	Convenient time
Điều bạn muốn trao đổi...	What would you like to discuss...
Lễ tân	Receptionist
Thợ mi / chân mày	Lash or brow technician
Chăm sóc da	Esthetician
Thợ tóc / barber	Hair stylist or barber
Đầu bếp	Chef
Thu ngân	Cashier
Pha chế	Barista or bartender
Quản lý nhà hàng	Restaurant manager
Rửa chén	Dishwasher
Quản lý	Manager
Sửa bài Blog	Edit blog post
Lưu bài	Save post
Chuẩn bị nguyên liệu	Prepare ingredients
Nhận order	Take orders
Kỹ năng phù hợp công việc	Relevant job skills
Lưu nháp	Save draft
Đã điền từ khu vực hồ sơ mẫu.	Filled from the sample profile area.
Đã điền từ khu vực bạn chọn.	Filled from your selected area.
Không hỗ trợ định vị. Vui lòng chọn khu vực.	Location is unavailable. Choose an area.
Đang xác định thành phố gần bạn…	Finding your nearby city…
Chưa xác định được thành phố. Vui lòng chọn thủ công.	Could not find your city. Choose it manually.
Không lấy được vị trí. Vui lòng chọn khu vực.	Could not get your location. Choose an area.
Trình duyệt này không hỗ trợ định vị. Vui lòng nhập khu vực.	This browser does not support location. Enter an area.
Chưa xác định được thành phố. Vui lòng nhập thủ công.	Could not find your city. Enter it manually.
Không lấy được vị trí. Vui lòng thử lại hoặc nhập thủ công.	Could not get your location. Try again or enter it manually.
Vui lòng chọn tiểu bang và thành phố.	Choose a state and city.
Không thể đọc ảnh này.	Could not read this image.
Một ngày ở tiệm của tôi	A day at my salon
Hôm nay tôi thử một cách sắp xếp dụng cụ mới để phục vụ khách nhanh hơn.	Today I tried a new way to organize tools so we can serve clients faster.
Mẫu Gel-X với hoa nổi, hoàn thành trong khoảng 90 phút.	Floral Gel-X set completed in about 90 minutes.
Cách giữ cọ gel sạch	How to keep gel brushes clean
Đèn hơ gel nào phù hợp tiệm đông khách?	Which gel lamp works for a busy salon?
Tiệm có 6 bàn nail, muốn tìm đèn bền và dễ vệ sinh. Anh chị đã dùng loại nào?	Our salon has six nail stations. Which durable, easy-to-clean lamp do you recommend?
Tiệm nên mở cửa cuối tuần lúc nào?	When should the salon open on weekends?
Hướng dẫn chuẩn bị móng và gắn tip. Nhắn tin để giữ chỗ.	Learn nail prep and tip application. Message to reserve a place.
Thợ Nail Houston chia sẻ kinh nghiệm	Houston nail technicians share tips
Nơi thợ nail trao đổi kỹ thuật và kinh nghiệm làm việc.	A place for nail technicians to exchange techniques and work experience.
Tôn trọng nhau. Đăng đúng chủ đề. Không spam.	Be respectful. Stay on topic. No spam.
Tiệm nail tại Houston. Chia sẻ mẫu mới, lịch hẹn và các cập nhật của tiệm.	A Houston nail salon sharing new work, appointments, and updates.
Ghế ngồi chờ màu trắng	White waiting chairs
Hỏi về ghế chờ màu trắng	Ask about white waiting chairs
Chiều thứ bảy sau 2 giờ	Saturday after 2 PM
Thợ nail Gel-X	Gel-X nail technician
Ví dụ: Gel-X hoa nổi	Example: Floral Gel-X
Ví dụ: Nên dùng đèn hơ nào?	Example: Which gel lamp should I use?
Ví dụ: Nên mở cửa lúc mấy giờ?	Example: What time should we open?
Ví dụ: 9 giờ	Example: 9 AM
Ví dụ: 10 giờ	Example: 10 AM
Ví dụ: Lớp Gel-X cơ bản	Example: Intro to Gel-X class
Ví dụ: Houston, TX hoặc Zoom	Example: Houston, TX or Zoom
Ví dụ: Thợ Nail Houston	Example: Houston nail technicians
Ví dụ: Gel-X, tay chân nước	Example: Gel-X, manicure, pedicure
Ví dụ: Hỏi về ghế chờ	Example: Ask about waiting chairs
Ví dụ: Chiều thứ bảy sau 2 giờ	Example: Saturday after 2 PM
Chào anh/chị, món này còn không? Tôi muốn xem ảnh thật và hẹn thời gian xem hàng.	Hello, is this item still available? I would like to see actual photos and arrange a viewing.
Chào anh/chị, tôi muốn xem ghế trực tiếp tại Houston. Anh/chị rảnh chiều thứ bảy không?	Hello, I would like to see the chairs in Houston. Are you free Saturday afternoon?
Chào anh/chị, tôi quan tâm vị trí này. Anh/chị cho tôi biết thêm về lịch làm và yêu cầu được không?	Hello, I am interested in this position. Could you tell me more about the schedule and requirements?
Tôi muốn hỏi thêm về tình trạng ghế và hẹn xem hàng.	I would like to ask about the condition of the chairs and arrange a viewing.
`.trim();

  const connectPairs = `
Connect quick guide	Hướng dẫn nhanh mục Kết nối
Connect	Kết nối
← Back to Community	← Quay lại Cộng đồng
Add people	Thêm người
Find & add people	Tìm và thêm người
Join NEXORA	Tham gia NEXORA
BITCOIN NAIL BAR on NEXORA	BITCOIN NAIL BAR trên NEXORA
Guide	Hướng dẫn
Messages	Tin nhắn
Calls	Cuộc gọi
Group chats	Nhóm chat
Groups	Nhóm
Settings	Cài đặt
Find and add people	Tìm và thêm người
Find people to add — name, @nickname, NX-ID, phone	Tìm người để thêm — tên, @nickname, NX-ID, số điện thoại
Find people to add	Tìm người để thêm
Message requests	Yêu cầu tin nhắn
Recent conversations	Hội thoại gần đây
Connections	Danh bạ
Create group	Tạo nhóm
No messages yet	Chưa có tin nhắn
Find more groups	Tìm thêm nhóm
All	Tất cả
City	Thành phố
Topic	Chủ đề
Recent	Gần đây
Missed calls	Cuộc gọi nhỡ
Outgoing voice	Thoại đã gọi
Your profile	Hồ sơ của bạn
Verified	Đã xác minh
Salon owner · Houston, Texas	Chủ tiệm · Houston, Texas
Edit nickname	Sửa tên hiển thị
Scan to open profile	Quét mã để mở hồ sơ
Share profile	Chia sẻ hồ sơ
Copy link	Sao chép liên kết
Privacy settings	Cài đặt quyền riêng tư
Who can find you	Ai có thể tìm thấy bạn
Name, ID & QR	Tên, ID & QR
On	Bật
Phone number	Số điện thoại
Anyone on NEXORA	Mọi người trên NEXORA
Connections or shared groups	Người quen hoặc chung nhóm
No one	Không ai
Email	Email
Who can contact you	Ai có thể liên hệ bạn
First messages	Tin nhắn từ người mới
Inbox	Hộp thư
Blocked	Đã chặn
Blocked accounts	Tài khoản đã chặn
Invite people	Mời người tham gia
Share	Chia sẻ
SMS	SMS
Undo	Hoàn tác
Close	Đóng
Cancel	Hủy
Create	Tạo
Group name	Tên nhóm
e.g. Houston nail friends	Ví dụ: Bạn thợ nail Houston
Pause	Tạm dừng
Next	Tiếp
Skip	Bỏ qua
Resume	Tiếp tục
Finish	Hoàn tất
View	Xem
Chat	Nhắn tin
Add	Thêm
Send	Gửi
Photo	Ảnh
Voice	Tin thoại
Stickers	Nhãn dán
Emoji	Biểu cảm
Choose a GIF	Chọn ảnh GIF
Choose a sticker	Chọn nhãn dán
Choose an emoji	Chọn biểu cảm
Message tools	Công cụ tin nhắn
Active now	Đang hoạt động
Close conversation	Đóng hội thoại
Shared photo	Ảnh được chia sẻ
GIF animation	Ảnh GIF động
Voice message	Tin thoại
Sticker	Nhãn dán
Photo ready to send	Ảnh sẵn sàng gửi
Voice message ready to send	Tin thoại sẵn sàng gửi
GIF ready to send	GIF sẵn sàng gửi
Sticker ready to send	Nhãn dán sẵn sàng gửi
Remove attachment	Xóa tệp đính kèm
Send a thumbs up	Gửi lượt thích
Write a message...	Viết tin nhắn...
Accept & reply	Chấp nhận và trả lời
Ignore	Bỏ qua
Block	Chặn
Preview nickname	Xem trước tên hiển thị
No messages yet. Say hello.	Chưa có tin nhắn. Hãy chào một câu.
← Back to Settings	← Quay lại Cài đặt
← Back to Calls	← Quay lại Cuộc gọi
← Back to Group chats	← Quay lại Nhóm chat
← Back to Messages	← Quay lại Tin nhắn
This request was ignored.	Đã bỏ qua yêu cầu.
Mai Nguyễn is blocked. You can review the blocked list under Settings.	Mai Nguyễn đã bị chặn. Bạn có thể xem danh sách chặn trong Cài đặt.
Mai Nguyễn is blocked.	Đã chặn Mai Nguyễn.
Enter a nickname first.	Hãy nhập tên hiển thị trước.
Delete	Xóa
Save	Lưu
Voice call	Gọi thoại
Video call	Gọi video
Call	Gọi
People you block appear here.	Người bạn chặn sẽ hiển thị ở đây.
Direct message	Tin nhắn riêng
Archived chats	Cuộc trò chuyện đã lưu trữ
No recent conversations.	Chưa có cuộc trò chuyện gần đây.
Group chat	Nhóm chat
Message request · White waiting chairs	Yêu cầu tin nhắn · Ghế chờ màu trắng
About your 12 white waiting chairs	Về 12 ghế chờ màu trắng
Hi, are the white chairs still available? Could I see their condition and the price for six?	Chào anh, ghế trắng còn không? Em muốn xem tình trạng và giá nếu lấy sáu cái.
Message request ignored	Đã bỏ qua yêu cầu tin nhắn
Account blocked	Đã chặn tài khoản
Find people above. Open View to review the new request.	Tìm người ở trên. Bấm Xem để đọc yêu cầu mới.
Find someone above, then add or message them.	Tìm người ở trên, rồi thêm hoặc nhắn tin.
Tap the phone or camera icon to call. Use Missed calls to filter.	Bấm biểu tượng điện thoại hoặc camera để gọi. Lọc cuộc gọi nhỡ ở trên.
Open a chat or create a group.	Mở cuộc trò chuyện hoặc tạo nhóm.
Share your profile and choose who can contact you.	Chia sẻ hồ sơ và chọn ai có thể liên hệ bạn.
People on NEXORA	Người dùng NEXORA
Phone search uses the complete number.	Hãy nhập đầy đủ số điện thoại để tìm.
Choose Add to save someone to your connections.	Bấm Thêm để lưu người này vào danh bạ.
Write a message first.	Hãy nhập tin nhắn trước.
Message sent.	Đã gửi.
Profile link copied.	Đã sao chép liên kết hồ sơ.
Invitation link copied.	Đã sao chép liên kết mời.
No blocked accounts.	Chưa chặn ai.
QR code for the BITCOIN NAIL BAR NEXORA profile	Mã QR hồ sơ NEXORA của BITCOIN NAIL BAR
View call details for	Xem chi tiết cuộc gọi với
View message request from	Xem yêu cầu tin nhắn từ
Chat with	Nhắn tin với
Show delete for call with	Hiện nút xóa cuộc gọi với
Delete call with	Xóa cuộc gọi với
Are the white chairs still available?	Ghế trắng còn không?
Voice call · Oct 11	Gọi thoại · 11 tháng 10
View ›	Xem ›
Replay Connect guide	Xem lại hướng dẫn Kết nối
Connect sections	Các mục Kết nối
Call filters	Bộ lọc cuộc gọi
Group filters	Bộ lọc nhóm
Your nickname is used to find and share your profile.	Tên hiển thị giúp người khác tìm và chia sẻ hồ sơ của bạn.
Search NEXORA members	Tìm thành viên NEXORA
Message request	Yêu cầu tin nhắn
New message	Tin nhắn mới
Reply	Trả lời
Write a message...	Viết tin nhắn...
Send message	Gửi tin nhắn
Message	Tin nhắn
Voice	Thoại
Video	Video
Missed	Nhỡ
Outgoing	Đã gọi
Incoming	Cuộc gọi đến
Video call ·	Gọi video ·
Voice call ·	Gọi thoại ·
Just now	Vừa xong
0 accounts	0 tài khoản
1 account	1 tài khoản
Copy is unavailable in this browser.	Không thể sao chép trong trình duyệt này.
Call restored.	Đã khôi phục cuộc gọi.
Call removed from Recent.	Đã xóa khỏi Gần đây.
Group created.	Đã tạo nhóm.
Joined.	Đã tham gia.
`.trim();

  const communityDictionary = new Map(communityPairs.split('\n').map(line => line.split('\t')));
  const dictionary = isConnect ? new Map(connectPairs.split('\n').map(line => line.split('\t'))) : communityDictionary;
  const originals = new WeakMap();
  const originalAttrs = new WeakMap();
  const attrNames = ['placeholder', 'aria-label', 'title', 'alt'];
  let language = localStorage.getItem('nexora-community-language') === 'vi' ? 'vi' : 'en';
  const targetLanguage = isConnect ? 'vi' : 'en';

  function translate(value) {
    const match = value.match(/^(\s*)(.*?)(\s*)$/s);
    const core = match[2];
    if (dictionary.has(core)) return match[1] + dictionary.get(core) + match[3];
    const decorated = core.match(/^([＋✦✧◈♧▣▤⌕✎☎]\s*)(.+)$/u);
    if (decorated && dictionary.has(decorated[2])) return match[1] + decorated[1] + dictionary.get(decorated[2]) + match[3];
    const required = core.match(/^(.*?)\s*\*$/);
    if (required && dictionary.has(required[1])) return match[1] + dictionary.get(required[1]) + ' *' + match[3];
    const prefix = core.match(/^([＋⌖✦♧▣▤◈✧✉🔔]\s*)(.*)$/u);
    if (prefix && dictionary.has(prefix[2])) return match[1] + prefix[1] + dictionary.get(prefix[2]) + match[3];
    if (!isConnect) {
      const ownerSummary = core.match(/^([\d,]+) bài đã đăng · ([\d,]+) bài đã lên lịch · ([\d,]+) người theo dõi\. Đăng bài và ưu đãi miễn phí; quảng bá nổi bật là lựa chọn riêng\.$/);
      if (ownerSummary) return match[1] + ownerSummary[1] + ' published posts · ' + ownerSummary[2] + ' scheduled posts · ' + ownerSummary[3] + ' followers. Posts and offers are free; promotion is optional.' + match[3];
      const count = core.match(/^([\d,]+)\s+(bài đăng|bài cập nhật|người theo dõi|trang|Fanpage|bài|tin|nháp|thành viên|ca|kết quả mới)$/);
      if (count) return match[1] + count[1] + ' ' + ({'bài đăng':'listings','bài cập nhật':'updates','người theo dõi':'followers','trang':'Pages','Fanpage':'Pages','bài':'posts','tin':'posts','nháp':'drafts','thành viên':'members','ca':'shifts','kết quả mới':'new results'}[count[2]]) + match[3];
      const scheduledCount = core.match(/^Đã lên lịch \(([\d,]+)\)$/);
      if (scheduledCount) return match[1] + 'Scheduled (' + scheduledCount[1] + ')' + match[3];
      const pagePhoto = core.match(/^Ảnh (\d+) của Fanpage (.+)$/);
      if (pagePhoto) return match[1] + 'Photo ' + pagePhoto[1] + ' from Page ' + pagePhoto[2] + match[3];
      const coverTitle = core.match(/^Ảnh bìa: (.+)$/);
      if (coverTitle) return match[1] + 'Cover photo: ' + coverTitle[1] + match[3];
      const copiedHandle = core.match(/^Đã sao chép (@[^\s]+)\.$/);
      if (copiedHandle) return match[1] + 'Copied ' + copiedHandle[1] + '.' + match[3];
      const pageHandle = core.match(/^Tên (?:Fanpage|trang): (@[^\s]+)$/);
      if (pageHandle) return match[1] + 'Page handle: ' + pageHandle[1] + match[3];
      const nearbyToast = core.match(/^Đã ưu tiên bài gần (.+)\.$/);
      if (nearbyToast) return match[1] + 'Showing posts near ' + nearbyToast[1] + ' first.' + match[3];
      const suggestedPlace = core.match(/^Đã gợi ý (.+)\. Bạn có thể sửa trước khi đăng\.$/);
      if (suggestedPlace) return match[1] + 'Suggested ' + suggestedPlace[1] + '. You can edit it before posting.' + match[3];
      const messageHeading = core.match(/^(Hội thoại với|Liên quan:) (.+)$/);
      if (messageHeading) return match[1] + (messageHeading[1] === 'Hội thoại với' ? 'Conversation with ' : 'Related to: ') + messageHeading[2] + match[3];
      const memberAction = core.match(/^(@[^\s]+ · NX-[\d]+ · )(Xem tin nhắn|Soạn nháp tin nhắn)$/);
      if (memberAction) return match[1] + memberAction[1] + dictionary.get(memberAction[2]) + match[3];
      const pageIndustry = core.match(/^(@[^\s]+ · )(Nail & làm đẹp|Nhà hàng & ăn uống|Dịch vụ khác)( · .+)$/);
      if (pageIndustry) return match[1] + pageIndustry[1] + dictionary.get(pageIndustry[2]) + pageIndustry[3] + match[3];
      const matchNote = core.match(/^(✦ )?(Phù hợp với bài cần mua của bạn|Có người đang tìm món bạn bán)( · .+)$/);
      if (matchNote) return match[1] + (matchNote[1] || '') + (matchNote[2] === 'Phù hợp với bài cần mua của bạn' ? 'Matches your wanted post' : 'Someone is looking for your item') + matchNote[3].replace(/\/(cái|cả lô)$/, (_, unit) => unit === 'cái' ? '/item' : '/lot') + match[3];
      const blogTopic = core.match(/^BLOG · (Kỹ thuật Nail|Kỹ thuật nail|Quản lý tiệm|Kinh doanh|Công nghệ|Khác)$/);
      if (blogTopic) return match[1] + 'BLOG · ' + dictionary.get(blogTopic[1]) + match[3];
      const request = core.match(/^(🔔\s*)?(\d+) yêu cầu tin nhắn đang chờ$/);
      if (request) return match[1] + (request[1] || '') + request[2] + ' pending message request' + (request[2] === '1' ? '' : 's') + match[3];
      const nearby = core.match(/^(⌖\s*.+?) · bài gần bạn lên trước$/);
      if (nearby) return match[1] + nearby[1] + ' · nearby posts first' + match[3];
      const unitPrice = core.match(/^(Tối đa )?(\$[\d,.]+)\/(cái|cả lô)$/);
      if (unitPrice) return match[1] + (unitPrice[1] ? 'Up to ' : '') + unitPrice[2] + (unitPrice[3] === 'cái' ? '/item' : '/lot') + match[3];
      const quantity = core.match(/^(Có|Cần) (\d+) cái$/);
      if (quantity) return match[1] + (quantity[1] === 'Có' ? quantity[2] + ' available' : 'Need ' + quantity[2]) + match[3];
      const matchingPosts = core.match(/^(\d+) bài phù hợp$/);
      if (matchingPosts) return match[1] + matchingPosts[1] + ' matching post' + (matchingPosts[1] === '1' ? '' : 's') + match[3];
      const expiry = core.match(/^Hết hạn (.+)$/);
      if (expiry) return match[1] + 'Expires ' + expiry[1] + match[3];
      const couponCode = core.match(/^Mã: (.+)$/);
      if (couponCode) return match[1] + 'Code: ' + couponCode[1] + match[3];
      const todayHours = core.match(/^Hôm nay · (.+)$/);
      if (todayHours) return match[1] + 'Today · ' + todayHours[1] + match[3];
      const jobSample = core.match(/^Mẫu tham khảo · (.+)$/);
      if (jobSample) return match[1] + 'Sample post · ' + (dictionary.get(jobSample[1]) || jobSample[1]) + match[3];
      const sampleStart = core.match(/^Bắt đầu (.+)$/);
      if (sampleStart) return match[1] + 'Starts ' + sampleStart[1] + match[3];
      const sampleTitle = core.match(/^(Tuyển|Tìm việc) (.+)$/);
      if (sampleTitle) return match[1] + (sampleTitle[1] === 'Tuyển' ? 'Hiring: ' : 'Seeking work: ') + (dictionary.get(sampleTitle[2][0].toUpperCase() + sampleTitle[2].slice(1)) || sampleTitle[2]) + match[3];
      const shiftTitle = core.match(/^(Rảnh nhận ca:|Cần người theo ca:) (.+)$/);
      if (shiftTitle) return match[1] + (shiftTitle[1] === 'Rảnh nhận ca:' ? 'Available for a shift:' : 'Hiring for a shift:') + ' ' + (dictionary.get(shiftTitle[2]) || dictionary.get(shiftTitle[2][0].toUpperCase() + shiftTitle[2].slice(1)) || shiftTitle[2]) + match[3];
      const copiedCode = core.match(/^Đã sao chép mã (.+)\.$/);
      if (copiedCode) return match[1] + 'Copied code ' + copiedCode[1] + '.' + match[3];
      const copyFallback = core.match(/^Không thể tự sao chép\. Mã: (.+)$/);
      if (copyFallback) return match[1] + 'Could not copy automatically. Code: ' + copyFallback[1] + match[3];
      const offerCode = core.match(/^Mã ưu đãi: (.+)$/);
      if (offerCode) return match[1] + 'Offer code: ' + offerCode[1] + match[3];
      const availableFrom = core.match(/^Có thể làm từ (.+)$/);
      if (availableFrom) return match[1] + 'Available from ' + availableFrom[1] + match[3];
      const openStatus = core.match(/^(.*) · (Đang mở|Đã bán|Đã mua|Đã giải đáp)$/);
      if (openStatus) return match[1] + openStatus[1] + ' · ' + dictionary.get(openStatus[2]) + match[3];
      const payPeriod = core.match(/^(.*) · (Mỗi giờ|Mỗi ngày|Mỗi tuần|Mỗi tháng)$/);
      if (payPeriod) return match[1] + payPeriod[1] + ' · ' + dictionary.get(payPeriod[2]) + match[3];
      const shiftPay = core.match(/^(\$[\d,.]+) (Mỗi giờ|Mỗi ngày|Mỗi tuần|Mỗi tháng)$/);
      if (shiftPay) return match[1] + shiftPay[1] + ' ' + dictionary.get(shiftPay[2]) + match[3];
      const writtenFrom = core.match(/^(.*) · viết từ (.*)$/);
      if (writtenFrom) return match[1] + writtenFrom[1] + ' · posted on ' + writtenFrom[2] + match[3];
      const sourceOrigin = core.match(/^(.*) · từ (NEXORA|NailHub\.AI)(.*)$/);
      if (sourceOrigin) return match[1] + sourceOrigin[1] + ' · from ' + sourceOrigin[2] + sourceOrigin[3] + match[3];
      const pollChoice = core.match(/^(9|10) giờ sáng · (\d+)$/);
      if (pollChoice) return match[1] + pollChoice[1] + ' AM · ' + pollChoice[2] + match[3];
    } else {
      const count = core.match(/^([\d,]+) (members?)$/);
      if (count) return match[1] + count[1] + ' thành viên' + match[3];
      if (core === '✓ Verified') return match[1] + '✓ Đã xác minh' + match[3];
      const call = core.match(/^(Outgoing|Missed|Incoming) · (Voice|Video) · ([A-Z][a-z]{2} \d{1,2}, \d{4}) · (.*)$/);
      if (call) return match[1] + ({Outgoing:'Đã gọi',Missed:'Nhỡ',Incoming:'Đã nhận'}[call[1]]) + ' · ' + ({Voice:'Thoại',Video:'Video'}[call[2]]) + ' · ' + call[3] + ' · ' + call[4] + match[3];
      const namedCall = core.match(/^(View call details for|Voice call|Video call|Show delete for call with|Delete call with) (.+)$/);
      if (namedCall) {
        const rest = namedCall[1] === 'Delete call with' ? namedCall[2].replace(/, ((?:Outgoing|Missed|Incoming) · (?:Voice|Video) · [A-Z][a-z]{2} .*)$/, (_, summary) => ', ' + translate(summary)) : namedCall[2];
        return match[1] + (dictionary.get(namedCall[1]) || namedCall[1]) + ' ' + rest + match[3];
      }
      const namedMessage = core.match(/^(View message request from|Chat with) (.+)$/);
      if (namedMessage) return match[1] + dictionary.get(namedMessage[1]) + ' ' + namedMessage[2] + match[3];
    }
    return value;
  }

  // Only known system values are translated in metadata that also contains
  // member-entered locations. Titles, descriptions and names stay untouched.
  const domainValues = new Set([
    'Nail & làm đẹp','Nhà hàng & ăn uống','Bán lẻ & dịch vụ','Dịch vụ khác','Khác',
    'Mi & Chân Mày','Mi & chân mày','Chủ tiệm','Làm đẹp khác','Kỹ thuật Nail','Kỹ thuật nail',
    'Quản lý tiệm','Kinh doanh','Công nghệ','Chăm sóc khách','Mua sắm đồ nghề',
    'Nội thất tiệm','Máy móc & thiết bị','Bột, gel, sơn','Dụng cụ & đồ nghề','Vật tư tiêu hao',
    'Thiết bị spa','Mỹ phẩm & chăm sóc da','Khăn, đồng phục & bảo hộ','Trang trí & bảng hiệu',
    'Phần mềm & POS','Mặt bằng & sang nhượng','Bàn ghế nhà hàng','Thiết bị bếp','Dụng cụ phục vụ',
    'Máy pha chế','Bao bì & vật tư','POS & phần mềm','Kệ trưng bày','Quầy thu ngân','Nội thất','Dụng cụ',
    'Thợ nail','Lễ tân','Thợ mi / chân mày','Chăm sóc da','Thợ tóc / barber','Quản lý',
    'Đầu bếp','Phụ bếp','Phục vụ','Thu ngân','Pha chế','Quản lý nhà hàng','Rửa chén','Nhân viên',
    'Mỗi giờ','Mỗi ngày','Mỗi tuần','Mỗi tháng','Mới','Còn tốt','Đã qua sử dụng',
    'Toàn quốc','Toàn nước Mỹ','Trực tiếp','Trực tuyến','Bột / Acrylic','Chân tay nước'
  ]);
  function translateDomain(value) {
    return String(value).split(/(\s*·\s*)/).map(part => {
      const match = part.match(/^(\s*)(.*?)(\s*)$/s);
      const price = match[2].match(/^(Tối đa )?(\$[\d,.]+)\/(cái|cả lô)$/);
      if (price) return match[1] + (price[1] ? 'Up to ' : '') + price[2] + (price[3] === 'cái' ? '/item' : '/lot') + match[3];
      return domainValues.has(match[2]) ? match[1] + communityDictionary.get(match[2]) + match[3] : part;
    }).join('');
  }
  window.NEXORA_COMMUNITY_I18N = { translate, translateDomain };

  const ownedUI='[data-feed-composer],[data-feed-drafts],[data-community-authored],[data-social-ui],[data-social-dialog]';
  const domainMetadata='[data-community-group-card] .meta[data-community-authored],.community-group-facts dd[data-community-authored],.discovery-row small,.composer-destination small,[data-social-post-detail] .chips > .chip,[data-community-domain]';
  function isProtected(element) {
    return Boolean(element?.closest(ownedUI)) && !element.matches(domainMetadata);
  }
  function updateNode(node) {
    if(isProtected(node.parentElement))return;
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    const original = originals.get(node);
    const next = language === 'en' && node.parentElement?.matches(domainMetadata) ? translateDomain(original) : language === targetLanguage ? translate(original) : original;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  function updateElement(element) {
    if (['SCRIPT', 'STYLE', 'SVG'].includes(element.tagName)) return;
    if (isProtected(element)) {
      element.querySelectorAll(domainMetadata).forEach(updateElement);
      return;
    }
    let attrs = originalAttrs.get(element);
    if (!attrs) { attrs = {}; originalAttrs.set(element, attrs); }
    for (const name of element.tagName === 'OPTGROUP' ? [...attrNames, 'label'] : attrNames) {
      if (!(name in attrs) && element.hasAttribute(name)) attrs[name] = element.getAttribute(name);
      if (name in attrs) {
        const next = language === targetLanguage ? translate(attrs[name]) : attrs[name];
        if (element.getAttribute(name) !== next) element.setAttribute(name, next);
      }
    }
    // Translating an option label must not change the stored domain value.
    if (element.tagName === 'OPTION' && !element.hasAttribute('value')) element.setAttribute('value', element.textContent);
    if (element.tagName === 'TEXTAREA') return;
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) updateNode(child);
      else if (child.nodeType === Node.ELEMENT_NODE) updateElement(child);
    }
  }

  function applyLanguage(next) {
    language = next === 'en' ? 'en' : 'vi';
    document.documentElement.lang = language;
    document.title = isConnect ? (language === 'vi' ? 'NEXORA · Tin nhắn, Gọi và Cài đặt' : 'NEXORA · Messages, Calls & Settings') : 'NEXORA Community';
    updateElement(document.body);
  }

  window.addEventListener('message', event => {
    if (event.source !== window.parent || (location.protocol !== 'file:' && event.origin !== location.origin) || event.data?.type !== 'nexora-language') return;
    applyLanguage(event.data.language);
  });
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) updateElement(node);
      else if (node.nodeType === Node.TEXT_NODE) updateNode(node);
    }
  }).observe(document.body, { childList: true, subtree: true });
  applyLanguage(language);
})();
