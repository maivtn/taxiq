# 06 · Bộ ngành nghề chuẩn NEXORA (TAX) — 13 nhóm · 119 ngành

**Cập nhật:** 2026-09-26 · **Trạng thái:** Draft — Brian duyệt một lần, sau đó id không đổi

Dùng chung cho: Deal Match · Coupon theo ngành · Deal gần bạn · Tạo coupon (mẫu theo ngành) · POS Promotion · Nhóm ngành Bảng tin · Việc làm. Mỗi ngành có `id` ổn định, tên VI/EN, icon, từ khoá nhận dạng (có dấu + không dấu + tiếng Anh). Mỗi nhóm có mục `…_other` cho ngành chưa liệt kê; ngành mới thêm vào cuối nhóm, không đổi id cũ.

File máy đọc: `taxonomy.js` (sinh từ `taxonomy.py`).


## 💅 Làm đẹp & chăm sóc cá nhân (`beauty`) — Beauty & personal care

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `nail` | 💅 Nail | Nail salon | gel-?x · bột · bot nail · acrylic · dip · sơn gel |
| `pedi` | 🦶 Pedicure / chân | Pedicure | pedi · chân · chan nuoc · foot |
| `spa` | 💆 Spa & Massage | Spa & massage | massage · spa · xoa bóp · xoa bop · gội đầu dưỡng sinh · goi dau |
| `lash` | 👁️ Mi & chân mày | Lashes & brows | lash · chân mày · chan may · brow |
| `hair` | 💇 Tóc & salon | Hair salon | tóc · toc · hair · cắt · nhuộm · nhuom |
| `barber` | 💈 Barber / tóc nam | Barbershop | barber · tóc nam · toc nam · cạo râu · fade |
| `skin` | 🧖 Da & facial | Skin & facial | facial · da mặt · da mat · skincare · trị mụn · tri mun |
| `pmu` | 🖋️ Phun xăm / PMU / xăm | PMU & tattoo | phun xăm · phun xam · phun xăm chân mày · phun xam chan may · phun môi · phun moi |
| `medspa` | 💉 Thẩm mỹ y khoa | Medspa & aesthetics | botox · filler · laser · triệt lông · triet long · thẩm mỹ |
| `wax` | 🪒 Wax / tẩy lông | Waxing | wax · tẩy lông · tay long · sugaring |
| `fitness` | 🏋️ Gym & thể hình | Gym & fitness | gym · thể hình · the hinh · fitness · tập · crossfit |
| `yoga` | 🧘 Yoga & pilates | Yoga & pilates | yoga · pilates · thiền · thien · meditation |
| `diet` | 🥗 Giảm cân & dinh dưỡng | Weight loss & nutrition | giảm cân · giam can · dinh dưỡng · dinh duong · detox · keto |

## 🍜 Ăn uống (`food`) — Food & drink

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `food` | 🍜 Nhà hàng / quán ăn | Restaurant | nhà hàng · nha hang · quán ăn · quan an · phở · bún |
| `fastfood` | 🥖 Bánh mì / ăn nhanh | Fast food & sandwiches | bánh mì · banh mi · ăn nhanh · fast food · xôi · xoi |
| `drink` | 🧋 Cà phê / trà sữa | Coffee & bubble tea | trà sữa · tra sua · cà phê · ca phe · cafe · coffee |
| `bakery` | 🎂 Bánh / tiệc ngọt | Bakery & desserts | bánh kem · banh kem · bánh sinh nhật · bakery · dessert |
| `hotpot` | 🍲 Lẩu · nướng · buffet | Hotpot · BBQ · buffet | lẩu · nướng · nuong · buffet · bbq · kbbq |
| `seafood` | 🦞 Hải sản | Seafood | hải sản · hai san · cua · tôm · tom hùm · crawfish |
| `vegan` | 🥬 Chay | Vegetarian & vegan | chay · vegan · vegetarian · thuần chay |
| `foodtruck` | 🚚 Food truck | Food truck | food truck · xe đồ ăn · xe do an |
| `bar` | 🍻 Bar · pub · karaoke | Bar · pub · karaoke | karaoke · nhậu · beer · lounge |
| `banquet` | 🏛️ Nhà hàng tiệc cưới | Wedding banquet hall | tiệc cưới · tiec cuoi · banquet · nhà hàng tiệc · hội trường |
| `catering` | 🍽️ Catering / đặt tiệc | Catering | catering · đặt tiệc · dat tiec · nấu tiệc · party tray |
| `homefood` | 🥡 Đồ ăn nhà làm / online | Home-cooked & online food | nhà làm · nha lam · đặt online · ship đồ ăn · homemade · đặc sản |

## 🛍️ Mua sắm (`shop`) — Shopping

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `market` | 🛒 Chợ / siêu thị | Grocery & market | chợ · siêu thị · sieu thi · grocery · market · rau |
| `convenience` | 🏪 Tiện lợi / tạp hoá | Convenience store | tiện lợi · tien loi · tạp hoá · tap hoa · convenience · smoke shop |
| `supply` | 📦 Supply nail & spa / đồ nghề | Nail & spa supply | supply · đồ nghề · do nghe · vật tư · vat tu · bột nail |
| `cosmetic` | 💄 Mỹ phẩm / nước hoa | Cosmetics & perfume | mỹ phẩm · my pham · nước hoa · nuoc hoa · son môi · skincare shop |
| `import` | 🧳 Hàng xách tay | Imported goods | xách tay · xach tay · hàng mỹ · hang my · hàng nhật · order hàng |
| `fashion` | 👗 Thời trang / áo dài | Fashion & áo dài | quần áo · quan ao · áo dài · ao dai · thời trang · thoi trang |
| `shoes` | 👜 Giày / túi xách | Shoes & bags | giày · túi xách · tui xach · dép · sneaker |
| `jewelry` | 💍 Vàng bạc / trang sức | Jewelry & gold | vàng · vang bac · nữ trang · nu trang · trang sức · jewelry |
| `electronics` | 📱 Điện thoại / điện tử | Phones & electronics | điện thoại · dien thoai · iphone · laptop · điện tử · dien tu |
| `furniture` | 🛋️ Nội thất / gia dụng | Furniture & appliances | nội thất · noi that · furniture · sofa · giường · nệm |
| `flower` | 💐 Hoa tươi / quà tặng | Flowers & gifts | hoa tươi · hoa tuoi · florist · quà · qua tang · gift shop |
| `eyewear` | 🕶️ Kính thời trang | Eyewear store | kính mát · kinh mat · sunglass · gọng kính · gong kinh |

## 🩺 Sức khoẻ (`health`) — Health

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `dental` | 🦷 Nha sĩ | Dentist | nha sĩ · nha si · nha khoa · răng · dental · dentist |
| `eye` | 👓 Mắt kính / nhãn khoa | Optometry | mắt kính · mat kinh · đo mắt · do mat · optometr · eye exam |
| `clinic` | 🩺 Bác sĩ gia đình / phòng khám | Family doctor & clinic | bác sĩ · bac si · phòng khám · phong kham · clinic · khám |
| `specialist` | 🫀 Bác sĩ chuyên khoa | Medical specialist | chuyên khoa · chuyen khoa · tim mạch · da liễu · da lieu · sản phụ |
| `chiro` | 🦴 Chiropractor / vật lý trị liệu | Chiropractic & physical therapy | chiro · nắn xương · nan xuong · vật lý trị liệu · vat ly tri lieu · physical therapy |
| `acupuncture` | 🌿 Châm cứu / đông y | Acupuncture & herbal | châm cứu · cham cuu · đông y · dong y · thuốc bắc · thuoc bac |
| `pharm` | 💊 Nhà thuốc / thuốc bổ | Pharmacy & supplements | nhà thuốc · nha thuoc · pharmacy · thuốc bổ · thuoc bo · vitamin |
| `lab` | 🔬 Xét nghiệm / chẩn đoán | Lab & imaging | xét nghiệm · xet nghiem · lab test · siêu âm · sieu am · x-?quang |
| `mental` | 🧠 Tâm lý / tư vấn | Mental health & counseling | tâm lý · tam ly · counsel · therapy · therapist · trầm cảm |
| `homehealth` | 👴 Chăm sóc người già / tại nhà | Home health & senior care | người già · nguoi gia · home health · chăm sóc tại nhà · cham soc tai nha · dưỡng lão |

## 🚗 Xe & di chuyển (`auto`) — Auto & transport

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `carwash` | 🧽 Rửa xe / detailing | Car wash & detailing | rửa xe · rua xe · car ?wash · detailing · đánh bóng xe · danh bong |
| `mechanic` | 🔧 Sửa xe / thay nhớt | Auto repair & oil change | sửa xe · sua xe · thay nhớt · thay nhot · oil change · mechanic |
| `tire` | 🛞 Lốp / thắng | Tires & brakes | lốp · lop xe · tire · thắng · thang xe · brake |
| `bodyshop` | 🚘 Body shop / sơn xe | Body shop & paint | body shop · sơn xe · son xe · đụng xe · dung xe · collision |
| `tint` | 🎛️ Tint / phụ kiện / audio | Tint · accessories · audio | tint · dán kính · dan kinh · phụ kiện xe · phu kien xe · audio |
| `dealer` | 🚙 Mua bán xe | Car sales & dealer | mua xe · ban xe · bán xe · dealer · xe cũ · xe cu |
| `carrental` | 🔑 Cho thuê xe | Car rental | thuê xe · thue xe · rent a car · car rental · turo |
| `ride` | 🚕 Đưa đón / taxi / sân bay | Rides · taxi · airport | đưa đón · dua don · đưa rước · ride · taxi · sân bay |
| `bus` | 🚌 Xe đò / xe khách | Intercity bus | xe đò · xe do · xe khách · xe khach · charter · đi dallas |
| `moving` | 🚚 Vận chuyển / dọn nhà | Moving & hauling | vận chuyển · van chuyen · dọn nhà · don nha · moving · chở hàng |
| `cargo` | 📦 Gửi hàng về VN / cargo | Cargo to Vietnam | gửi hàng · gui hang · gửi về việt nam · gui ve viet nam · cargo · ship về |
| `inspection` | 📋 Đăng kiểm / giấy tờ xe | Inspection & registration | đăng kiểm · dang kiem · inspection · registration · title xe · giấy tờ xe |

## 🏠 Nhà cửa & sửa chữa (`home`) — Home & repair

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `clean` | 🧹 Dọn dẹp nhà cửa | House cleaning | dọn dẹp · don dep · cleaning · dọn nhà · lau nhà · maid |
| `remodel` | 🔨 Sửa nhà / remodel | Remodeling & contractor | sửa nhà · sua nha · remodel · handyman · contractor · xây |
| `plumbing` | 🔌 Điện / nước | Electrical & plumbing | điện · dien nuoc · thợ điện · tho dien · nước · plumb |
| `hvac` | ❄️ Điện lạnh / HVAC | HVAC | máy lạnh · may lanh · hvac · ac repair · điện lạnh · dien lanh |
| `roof` | 🏚️ Mái nhà / roofing | Roofing | mái · mai nha · roof · dột · gutter |
| `floor` | 🧱 Sàn / gạch / đá | Flooring & tile | sàn · san go · gạch · tile · đá granite · countertop |
| `paint` | 🎨 Sơn nhà | Painting | sơn nhà · son nha · painting · sơn tường |
| `landscape` | 🌳 Sân vườn / cây cảnh | Landscaping | sân vườn · san vuon · landscap · cắt cỏ · cat co · cây cảnh |
| `pool` | 🏊 Hồ bơi | Pool service | hồ bơi · ho boi · pool · bể bơi |
| `pest` | 🐜 Diệt côn trùng | Pest control | côn trùng · con trung · pest · mối · gián · chuột |
| `garage` | 🚪 Cửa / garage / cửa sổ | Doors · garage · windows | garage · cửa · cua so · window · cửa sổ · khoá cửa |
| `security` | 📹 Camera / an ninh / smart home | Security & smart home | camera · an ninh · báo động · bao dong · alarm · smart home |
| `laundry` | 👕 Giặt ủi / dry clean | Laundry & dry cleaning | giặt · giat ui · ủi · dry clean · laundry · sửa quần áo |
| `locksmith` | 🗝️ Thợ khoá | Locksmith | thợ khoá · tho khoa · locksmith · làm chìa · mất chìa |

## 💼 Tài chính · pháp lý · địa ốc (`finance`) — Finance · legal · real estate

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `tax` | 🧾 Thuế / kế toán | Tax & accounting | thuế · 1099 · khai thuế · tax · kế toán · ke toan |
| `insurance` | 🛡️ Bảo hiểm | Insurance | bảo hiểm · bao hiem · insurance · nhân thọ · nhan tho · obamacare |
| `remit` | 💸 Gửi tiền / đổi tiền | Money transfer & exchange | gửi tiền · gui tien · chuyển tiền · chuyen tien · đổi tiền · doi tien |
| `loan` | 🏦 Vay / mortgage | Loans & mortgage | vay · mortgage · loan · tín dụng · tin dung · refinance |
| `immigration` | 🛂 Luật sư di trú | Immigration lawyer | luật sư di trú · luat su di tru · di trú · di tru · immigration · bảo lãnh |
| `injury` | ⚖️ Luật sư tai nạn / thương tích | Injury lawyer | tai nạn · tai nan · thương tích · thuong tich · injury · kiện |
| `lawyer` | 📜 Luật sư gia đình / kinh doanh | Family & business lawyer | luật sư · luat su · lawyer · attorney · ly hôn · ly hon |
| `notary` | ✒️ Công chứng / dịch thuật | Notary & translation | công chứng · cong chung · notary · dịch thuật · dich thuat · translation |
| `realtor` | 🏡 Địa ốc mua bán | Real estate agent | địa ốc · dia oc · realtor · mua nhà · mua nha · bán nhà |
| `rental` | 🏘️ Cho thuê / quản lý nhà | Rental & property management | cho thuê · cho thue · thuê nhà · thue nha · apartment · phòng trọ |
| `invest` | 📈 Đầu tư / crypto | Investing & crypto | đầu tư · dau tu · crypto · bitcoin · chứng khoán · chung khoan |

## ✈️ Du lịch & lưu trú (`travel`) — Travel & stay

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `flight` | 🛫 Vé máy bay | Flights | vé máy bay · ve may bay · flight · vé về việt nam · air ticket |
| `tour` | 🗺️ Tour / du lịch | Tours | tour · du lịch · du lich · hành hương · hanh huong · cruise |
| `hotel` | 🏨 Khách sạn / homestay | Hotels & stays | khách sạn · khach san · hotel · homestay · resort · airbnb |
| `visa` | 🪪 Visa / hộ chiếu / giấy tờ | Visa & passport services | hộ chiếu · ho chieu · passport · visa việt nam · miễn thị thực · giấy tờ du lịch |

## 🎓 Giáo dục & đào tạo (`edu`) — Education & training

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `vietschool` | 🇻🇳 Trường Việt ngữ | Vietnamese language school | việt ngữ · viet ngu · tiếng việt · tieng viet · học tiếng |
| `tutor` | 📚 Dạy kèm / luyện thi | Tutoring & test prep | dạy kèm · day kem · luyện thi · luyen thi · tutor · toán |
| `beautyschool` | 🎓 Trường nail / thẩm mỹ (license) | Beauty school & license | trường nail · truong nail · license · lớp nail · lop nail · khoá học |
| `driving` | 🚦 Dạy lái xe | Driving school | lái xe · lai xe · driving · bằng lái · bang lai · thi bằng |
| `esl` | 🗣️ Tiếng Anh / ESL / quốc tịch | English & citizenship classes | esl · tiếng anh · tieng anh · english · thi quốc tịch · thi quoc tich |
| `arts` | 🎹 Nhạc · hoạ · võ · năng khiếu | Music · art · martial arts | piano · guitar · nhạc · vẽ · ve tranh · võ |
| `vocational` | 🛠️ Đào tạo nghề / kỹ năng | Vocational & skills | học nghề · hoc nghe · dạy nghề · kỹ năng · ky nang · coding |

## 🎉 Sự kiện & giải trí (`event`) — Events & entertainment

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `photo` | 📷 Chụp ảnh / quay phim | Photo & video | chụp ảnh · chup anh · quay phim · photograph · videograph · studio |
| `bridal` | 👰 Áo cưới / makeup cô dâu | Bridal & makeup | áo cưới · ao cuoi · makeup · trang điểm · trang diem · cô dâu |
| `planner` | 🎪 Tổ chức tiệc / sự kiện | Event planning | tổ chức · to chuc · event · planner · sinh nhật · sinh nhat |
| `music` | 🎤 Nhạc sống / MC / DJ | Live music · MC · DJ | ban nhạc · ban nhac · dj · ca sĩ · ca si · nhạc sống |
| `rentalevent` | 🎈 Thuê rạp / bàn ghế / trang trí | Party rentals & decor | thuê rạp · thue rap · bàn ghế · ban ghe · trang trí · trang tri |
| `entertain` | 🎳 Giải trí / vui chơi | Entertainment & recreation | bida · billiard · bowling · game · khu vui chơi · trampoline |

## 👶 Gia đình & thú cưng (`family`) — Family & pets

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `daycare` | 🧸 Giữ trẻ / daycare | Daycare | giữ trẻ · giu tre · daycare · nhà trẻ · nha tre · mầm non |
| `kids` | 🍼 Đồ trẻ em / mẹ & bé | Kids & baby | trẻ em · tre em · em bé · em be · mẹ và bé · me va be |
| `pet` | 🐶 Thú cưng / grooming | Pets & grooming | thú cưng · thu cung · chó · mèo · pet · grooming |
| `vet` | 🐾 Thú y | Veterinary | thú y · thu y · bác sĩ thú · chích ngừa chó |
| `senior` | 🏡 Nhà dưỡng lão / sinh hoạt người già | Senior living & adult daycare | dưỡng lão · duong lao · adult daycare · sinh hoạt người già · nursing home |

## 🏢 Dịch vụ doanh nghiệp & công nghệ (`biz`) — Business services & tech

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `print` | 🖨️ In ấn / bảng hiệu | Printing & signage | in ấn · in an · bảng hiệu · bang hieu · sign · banner |
| `marketing` | 💻 Marketing / web / thiết kế | Marketing · web · design | marketing · website · web · thiết kế · thiet ke · logo |
| `software` | 🧾 POS / phần mềm | POS & software | pos · phần mềm · phan mem · software · app · nexora |
| `staffing` | 👥 Tuyển dụng / nhân sự | Staffing & HR | tuyển · tuyen dung · nhân sự · nhan su · staffing · thợ |
| `lease` | 🏬 Sang tiệm / mặt bằng / thuê ghế | Business for sale · lease · booth | sang tiệm · sang tiem · mặt bằng · mat bang · thuê ghế · thue ghe |
| `commercialclean` | 🧼 Vệ sinh công nghiệp | Commercial cleaning | vệ sinh công nghiệp · ve sinh cong nghiep · janitor · commercial clean · lau kính |
| `telecom` | 📡 Viễn thông / internet | Telecom & internet | internet · wifi · viễn thông · vien thong · sim · điện thoại gói |
| `techrepair` | 🛠️ Sửa điện thoại / máy tính | Phone & computer repair | sửa điện thoại · sua dien thoai · sửa máy tính · sua may tinh · repair · thay màn hình |
| `equipment` | ⚙️ Thiết bị ngành (nhà hàng, tiệm) | Commercial equipment | thiết bị · thiet bi · equipment · máy pha · bếp công nghiệp · bep cong nghiep |

## ⛪ Cộng đồng & phi lợi nhuận (`community`) — Community & non-profit

| id | Ngành (VI) | Industry (EN) | Từ khoá nhận dạng (rút gọn) |
|---|---|---|---|
| `temple` | 🛕 Chùa / nhà thờ | Temple & church | chùa · nhà thờ · nha tho · church · temple · lễ |
| `association` | 🤝 Hội đoàn / cộng đồng | Associations | hội · hoi doan · cộng đồng · cong dong · association · hội chợ |
| `charity` | ❤️ Từ thiện / gây quỹ | Charity & fundraising | từ thiện · tu thien · gây quỹ · gay quy · charity · donate |
| `media` | 📰 Báo chí / radio / truyền hình | Media & press | báo · bao chi · radio · truyền hình · truyen hinh · tv |
