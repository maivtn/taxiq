(() => {
  const showcase = document.getElementById('hero-showcase');
  if (!showcase) return;
  // Keep the preview screen separate from the photo so it can follow the copy on phones.
  const device = showcase.querySelector('.hero-device');
  if (device) showcase.append(device);

  // Each poster has its own scene, product page, business context and headline.
  const slides = [
    { name:'SI POS', href:'products/si-pos/index.html', photo:'assets/si-pos-operations-hub.jpg', accent:'#7465df', industry:'nails', position:'62% center' },
    { name:'One QR', href:'products/one-qr/index.html', photo:'assets/one-qr-salon-scan-v4.png', accent:'#2b8bc4', industry:'nails', position:'65% center' },
    { name:'Payments & Payouts', href:'products/payments-payouts/index.html', photo:'assets/salon-finance.jpg', accent:'#198d77', industry:'nails', position:'66% center' },
    { name:'AI Hub', href:'products/ai-hub/index.html', photo:'assets/salon-reception.jpg', accent:'#a64e9b', industry:'services', position:'64% center' },
    { name:'Reviews', href:'products/reviews/index.html', photo:'assets/salon-reviews-v2.jpg', accent:'#b24f87', industry:'nails', position:'64% center' },
    { name:'Gift Card Center', href:'products/gift-card-center/index.html', photo:'assets/salon-gift.jpg', accent:'#bb8544', industry:'wellness', position:'64% center' },
    { name:'Analytics', href:'products/analytics/index.html', photo:'assets/salon-analytics-v2.jpg', accent:'#4d81c8', industry:'services', position:'65% center' },
    { name:'Community', href:'products/community/index.html', photo:'assets/salon-community.jpg', accent:'#2b967f', industry:'services', position:'64% center' },
    { name:'TAX IQ', href:'products/tax-iq/index.html', photo:'assets/salon-tax-v2.jpg', accent:'#4b9d89', industry:'nails', position:'65% center' },
    { name:'AI Voice SMS', href:'products/ai-voice-sms/index.html', photo:'assets/ai-voice-call-reception.jpg', accent:'#7771db', industry:'services', position:'64% center' },
    { name:'AI Marketing Tool', href:'products/ai-marketing/index.html', photo:'assets/ai-marketing-audience-v2.png', accent:'#a34cc9', industry:'nails', position:'68% center' },
    { name:'Spin Wheel', href:'products/spin-wheel/index.html', photo:'assets/spin-wheel-digital-guest.jpg', accent:'#ae7428', industry:'wellness', position:'65% center' }
  ];
  const posterIcons = ['▣','▦','$','✧','★','◇','▥','♧','▤','◎','✦','◉'];
  const screenPreviews = {
    vi:[
      ['Bảng vận hành','Lịch hẹn','Xếp lượt thợ','Thanh toán'],
      ['Menu do tiệm cấu hình','Check-in','Đặt lịch','Dịch vụ & giá','Ưu đãi','Đánh giá','Tip & thanh toán'],
      ['Dòng tiền mỗi ngày','Khoản thu','Tip của thợ','Giao dịch thẻ'],
      ['AI Receptionist','Lịch hẹn','Nhật ký cuộc gọi','SMS Campaigns'],
      ['Phản hồi của khách','Mời đánh giá','Xem nhận xét','Chăm sóc tiếp'],
      ['Gift Card Center','Phát hành thẻ','Quản lý thẻ','Dùng khi thanh toán'],
      ['Góc nhìn hiệu suất','Xu hướng tip','Điểm QR','So sánh kết quả'],
      ['Kết nối cộng đồng','Bảng tin','Việc làm','Ưu đãi'],
      ['Hồ sơ thu chi','Thu nhập','Chi phí','Biên lai'],
      ['AI lễ tân & SMS','Tiếp nhận cuộc gọi','Kiểm tra lịch thợ','SMS xác nhận'],
      ['Chiến dịch tiếp thị','Chọn nhóm khách','Soạn nội dung','Lên lịch gửi'],
      ['Vòng quay số','Ảnh & tên giải','Tỷ lệ trúng','Quy tắc chơi']
    ],
    en:[
      ['Operations board','Appointments','Staff rotation','Checkout'],
      ['Business-configured menu','Check in','Book an appointment','Services & prices','Offers','Reviews','Tip & pay'],
      ['Daily money flow','Income','Staff tips','Card activity'],
      ['AI Receptionist','Appointments','Call log','SMS Campaigns'],
      ['Guest feedback','Invite reviews','Read comments','Follow up'],
      ['Gift Card Center','Issue cards','Manage cards','Redeem at checkout'],
      ['Performance view','Tip trends','QR touchpoints','Compare results'],
      ['Community connections','News','Jobs','Offers'],
      ['Income records','Income','Expenses','Receipts'],
      ['AI voice & SMS','Answer calls','Check staff calendar','Confirm by SMS'],
      ['Marketing campaigns','Choose audience','Write content','Schedule send'],
      ['Digital wheel','Prize images','Win chance','Game rules']
    ]
  };
  // Localized descriptions are sourced from the twelve product landing pages.
  const summaries = {
  "vi": [
    "Đón khách, xếp lượt thợ, quản lý dịch vụ và xem doanh số trong cùng một trung tâm vận hành dành cho nail salon.",
    "Khách quét One QR để mở menu với nhiều lựa chọn do tiệm cấu hình: check-in, đặt lịch, xem dịch vụ, ưu đãi, đánh giá hoặc tip và thanh toán khi được bật. Khách tự chọn bước tiếp theo.",
    "Tập hợp báo cáo nhận thanh toán, tip, chi trả nhân viên và hoạt động giao dịch máy cà thẻ từ những màn hình hiện có.",
    "AI Receptionist có lịch hẹn, khách hàng và nhật ký cuộc gọi. Marketing Assistant gom SMS Campaigns, khuyến mãi, đánh giá và liên kết VLinkPay; các công cụ AI mới đang được đề xuất.",
    "Mở màn hình Reviews để xem đánh giá và phản hồi của khách sau dịch vụ. Đây là một điểm chạm quan trọng trong hành trình khách quay lại.",
    "Thiết kế và phát hành thẻ tại tiệm hoặc bán online qua VLinkPay. Quản lý thẻ đã phát hành, nhận thanh toán bằng thẻ và theo dõi thành viên, giao dịch, hạn sử dụng.",
    "Màn hình Analytics hiện có tập trung vào xu hướng tip, bảng xếp hạng và hiệu suất điểm QR.",
    "Bản định hướng cho bảng tin, việc làm và Deal & Coupon. Những mục này chưa có màn hình hoạt động trong bản xem trước hiện tại.",
    "Tổng hợp thu nhập, chi phí và kho biên lai là cấu trúc được đề xuất. Quyền truy cập và các màn hình đích cần được xác nhận trước khi đưa vào sử dụng.",
    "Khi lễ tân bận phục vụ, AI có thể tiếp nhận cuộc gọi, hỗ trợ kiểm tra lịch thợ và nối tiếp bằng SMS xác nhận khi tiệm đã cấu hình.",
    "Giao diện AI Marketing Tool giới thiệu nhóm khách, nội dung, SMS Campaigns và kết quả. Những khả năng tự động hoặc kết nối VLinkPay phụ thuộc quyền của từng tài khoản.",
    "Spin Wheel là bản xem trước vòng quay số: tiệm chọn kiểu thiết kế, đặt ảnh và tên giải, tỷ lệ trúng và quy tắc trước khi tạo chiến dịch trên VLINKPAY."
  ],
  "en": [
    "Welcome customers, rotate staff, manage services and review sales from one operations hub for nail salons.",
    "Guests scan One QR to open a business-configured menu with choices such as check-in, booking, services, offers, reviews, or tipping and payment when enabled. Guests choose the next step.",
    "Bring together available payment reports, tips, staff payouts and card transaction activity.",
    "AI Receptionist includes appointments, customers and call logs. Marketing Assistant brings together SMS, promotions, reviews and VLinkPay links. New AI tools are proposed.",
    "Open Reviews to see ratings and customer feedback after a visit. Feedback is an important touchpoint in the return visit journey.",
    "Design and issue cards in store or sell online through VLinkPay. Manage issued cards, accept card payments and track memberships, transactions and expiration.",
    "The current Analytics screen focuses on tip trends, rankings and QR touchpoint performance.",
    "News, jobs and Deal & Coupon are planned concepts. These sections do not have working screens in the current preview.",
    "Income summaries, expenses and receipts are proposed sections. Access and destination screens must be verified before use.",
    "While reception serves guests, AI can handle calls, help check technician availability and follow up with a confirmation text once configured.",
    "The AI Marketing Tool preview shows customer groups, content, SMS Campaigns and results. Automation and VLinkPay connections depend on account access.",
    "Spin Wheel previews a digital wheel: choose a template, set prize images and names, winning chances and rules before creating a campaign on VLINKPAY."
  ],
  "zh": [
    "前台、预约、团队与营业额。",
    "店内二维码、小费、付款与分享。",
    "收入、小费、员工支出和刷卡交易。",
    "AI 前台与营销工具。",
    "顾客评价与反馈。",
    "在店内发行卡片或通过 VLinkPay 在线销售，并管理已发行卡、卡支付、会员和到期情况。",
    "小费趋势与二维码点位表现。",
    "公告、招聘与优惠正在规划中。",
    "收入、支出与收据功能等待权限确认。",
    "AI Hub 提供 AI Voice 设置指南和 SMS Campaigns 界面。自动通话或发送短信取决于门店权限与配置。",
    "AI Marketing Tool 示例展示客户分组、内容、短信活动与结果。自动化和 VLinkPay 连接取决于账户权限。",
    "Spin Wheel 是奖励转盘示例：设置奖品、预览并试转。正式活动需要配置、规则和发布权限。"
  ],
  "ko": [
    "프런트, 예약, 직원 및 매출.",
    "매장 QR, 팁, 결제 및 공유.",
    "매출, 팁, 직원 지급 및 카드 거래.",
    "AI 접수원과 마케팅 도구.",
    "고객 리뷰와 피드백.",
    "매장에서 카드를 발행하거나 VLinkPay에서 온라인 판매하고, 카드 결제와 멤버십을 관리하세요.",
    "팁 추세와 QR 성과.",
    "게시판, 채용, 혜택은 계획 중.",
    "수입, 지출, 영수증은 접근 권한 확인 중.",
    "AI Hub에는 AI Voice 설정 안내와 SMS 캠페인 화면이 있습니다. 자동 통화 및 발송은 매장 권한과 설정에 따라 달라집니다.",
    "AI Marketing Tool 예시는 고객 그룹, 콘텐츠, SMS 캠페인, 결과를 보여줍니다. 자동화와 VLinkPay 연결은 계정 권한에 따라 달라집니다.",
    "Spin Wheel은 보상을 설정하고 미리 보고 시험 회전할 수 있는 예시입니다. 실제 캠페인에는 설정, 약관 및 게시 권한이 필요합니다."
  ],
  "es": [
    "Recepción, citas, equipo y ventas.",
    "QR en el salón, propinas, pagos y compartir.",
    "Ingresos, propinas, pagos al personal y transacciones.",
    "Recepción IA y herramientas de marketing.",
    "Reseñas y opiniones de clientes.",
    "Emite tarjetas en el salón o véndelas en VLinkPay. Gestiona tarjetas, pagos, membresías y vencimientos.",
    "Tendencias de propinas y rendimiento QR.",
    "Noticias, empleos y ofertas están previstos.",
    "Ingresos, gastos y recibos esperan confirmar acceso.",
    "AI Hub incluye una guía de AI Voice y una pantalla de campañas SMS. Las llamadas y los envíos automáticos dependen del acceso y la configuración de cada salón.",
    "La muestra de AI Marketing Tool incluye grupos de clientes, contenido, campañas SMS y resultados. La automatización y VLinkPay dependen del acceso.",
    "Spin Wheel es una ruleta de muestra para definir premios, previsualizar y probar. Una campaña real requiere configuración, condiciones y acceso."
  ],
  "ja": [
    "受付、予約、スタッフ、売上。",
    "店内QR、チップ、決済、共有。",
    "入金、チップ、スタッフ支払い、カード取引。",
    "AI受付とマーケティングツール。",
    "お客様のレビューと声。",
    "店頭でカードを発行し、VLinkPay でオンライン販売。決済、会員、期限を管理できます。",
    "チップ傾向とQR拠点の実績。",
    "ニュース、求人、特典は計画中。",
    "収入、支出、領収書はアクセス確認待ち。",
    "AI Hub には AI Voice 設定ガイドと SMS キャンペーン画面があります。自動通話や送信は店舗の権限と設定によって異なります。",
    "AI Marketing Tool のサンプルには顧客グループ、内容、SMS キャンペーン、結果が含まれます。自動化と VLinkPay 接続は権限によります。",
    "Spin Wheel は賞品設定、プレビュー、試用ができるサンプルです。正式な企画には設定、条件、公開権限が必要です。"
  ],
  "th": [
    "หน้าร้าน นัดหมาย ทีมงาน และยอดขาย",
    "QR ในร้าน ทิป ชำระเงิน และแชร์",
    "รายรับ ทิป จ่ายช่าง และธุรกรรมบัตร",
    "AI ต้อนรับและเครื่องมือการตลาด",
    "รีวิวและความคิดเห็นลูกค้า",
    "ออกบัตรที่ร้านหรือขายออนไลน์ผ่าน VLinkPay พร้อมจัดการการชำระเงิน สมาชิก และวันหมดอายุ",
    "แนวโน้มทิปและประสิทธิภาพจุด QR",
    "ข่าว งาน และข้อเสนออยู่ระหว่างวางแผน",
    "รายรับ รายจ่าย และใบเสร็จรอยืนยันสิทธิ์",
    "AI Hub มีคู่มือตั้งค่า AI Voice และหน้าจอแคมเปญ SMS การโทรหรือส่งข้อความอัตโนมัติขึ้นอยู่กับสิทธิ์และการตั้งค่าของร้าน",
    "ตัวอย่าง AI Marketing Tool แสดงกลุ่มลูกค้า เนื้อหา แคมเปญ SMS และผลลัพธ์ ระบบอัตโนมัติและ VLinkPay ขึ้นอยู่กับสิทธิ์บัญชี",
    "Spin Wheel เป็นวงล้อตัวอย่างสำหรับตั้งรางวัล ดูตัวอย่าง และลองหมุน แคมเปญจริงต้องมีการตั้งค่า เงื่อนไข และสิทธิ์เผยแพร่"
  ],
  "ar": [
    "الاستقبال والمواعيد والفريق والمبيعات.",
    "رمز QR داخل الصالون والإكراميات والمدفوعات والمشاركة.",
    "الإيرادات والإكراميات ومستحقات الموظفين ومعاملات البطاقات.",
    "استقبال ذكي وأدوات تسويق.",
    "تقييمات العملاء وملاحظاتهم.",
    "أصدر البطاقات داخل الصالون أو بعها عبر VLinkPay، وتابع المدفوعات والعضويات وتواريخ الانتهاء.",
    "اتجاهات الإكراميات وأداء نقاط QR.",
    "الأخبار والوظائف والعروض مخطط لها.",
    "الإيرادات والمصروفات والإيصالات تنتظر تأكيد الصلاحيات.",
    "يضم AI Hub دليل إعداد AI Voice وشاشة حملات SMS. تعتمد المكالمات والرسائل الآلية على صلاحيات الصالون وإعداداته.",
    "يعرض نموذج AI Marketing Tool مجموعات العملاء والمحتوى وحملات SMS والنتائج. تعتمد الأتمتة وVLinkPay على صلاحيات الحساب.",
    "Spin Wheel عجلة جوائز نموذجية لإعداد المكافآت ومعاينتها وتجربتها. تتطلب الحملة الفعلية إعدادًا وشروطًا وصلاحية نشر."
  ],
  "fr": [
    "Accueil, rendez-vous, équipe et ventes.",
    "QR en salon, pourboires, paiements et partage.",
    "Revenus, pourboires, paiements du personnel et transactions.",
    "Réception IA et outils marketing.",
    "Avis et retours clients.",
    "Émettez des cartes en salon ou vendez-les sur VLinkPay. Gérez paiements, adhésions et expirations.",
    "Tendances des pourboires et performance des QR.",
    "Actualités, emplois et offres sont prévus.",
    "Revenus, dépenses et reçus attendent la validation des accès.",
    "AI Hub propose un guide de configuration d’AI Voice et un écran de campagnes SMS. Les appels et envois automatiques dépendent des accès et des réglages du salon.",
    "L’aperçu d’AI Marketing Tool présente les groupes de clients, le contenu, les campagnes SMS et les résultats. L’automatisation et VLinkPay dépendent des accès.",
    "Spin Wheel est une roue exemple pour définir les prix, prévisualiser et essayer. Une vraie campagne demande des réglages, des conditions et un accès."
  ]
};

  const ui = {
    vi:['SẢN PHẨM NEXORA TOUCH','Khám phá sản phẩm ↗','Sản phẩm trước','Sản phẩm tiếp theo','Tạm dừng slide','Tiếp tục slide','Chọn slide'],
    en:['NEXORA TOUCH PRODUCTS','Explore product ↗','Previous product','Next product','Pause slides','Play slides','Go to slide'],
    zh:['NEXORA TOUCH 产品','了解产品 ↗','上一款产品','下一款产品','暂停轮播','继续轮播','选择幻灯片'],
    ko:['NEXORA TOUCH 제품','제품 살펴보기 ↗','이전 제품','다음 제품','슬라이드 일시정지','슬라이드 재생','슬라이드 선택'],
    es:['PRODUCTOS NEXORA TOUCH','Explorar producto ↗','Producto anterior','Producto siguiente','Pausar diapositivas','Reanudar diapositivas','Ir a la diapositiva'],
    ja:['NEXORA TOUCH 製品','製品を見る ↗','前の製品','次の製品','スライドを一時停止','スライドを再開','スライドを選択'],
    th:['ผลิตภัณฑ์ NEXORA TOUCH','ดูผลิตภัณฑ์ ↗','ผลิตภัณฑ์ก่อนหน้า','ผลิตภัณฑ์ถัดไป','หยุดสไลด์ชั่วคราว','เล่นสไลด์ต่อ','เลือกสไลด์'],
    ar:['منتجات NEXORA TOUCH','استكشف المنتج ↗','المنتج السابق','المنتج التالي','إيقاف الشرائح','تشغيل الشرائح','انتقل إلى الشريحة'],
    fr:['PRODUITS NEXORA TOUCH','Découvrir le produit ↗','Produit précédent','Produit suivant','Suspendre les diapositives','Reprendre les diapositives','Choisir la diapositive']
  };
  const industries = {
    vi:{nails:'Nail & làm đẹp',hair:'Tóc & barber',wellness:'Spa & wellness',services:'Doanh nghiệp dịch vụ'},
    en:{nails:'Nails & beauty',hair:'Hair & barber',wellness:'Spa & wellness',services:'Service businesses'},
    zh:{nails:'美甲与美容',hair:'美发与理发',wellness:'水疗与健康护理',services:'服务行业'},
    ko:{nails:'네일·뷰티',hair:'헤어·바버',wellness:'스파·웰니스',services:'서비스 업종'},
    es:{nails:'Uñas y belleza',hair:'Peluquería y barbería',wellness:'Spa y bienestar',services:'Negocios de servicios'},
    ja:{nails:'ネイル・美容',hair:'ヘア・バーバー',wellness:'スパ・ウェルネス',services:'サービス業'},
    th:{nails:'ร้านทำเล็บและความงาม',hair:'ร้านทำผมและบาร์เบอร์',wellness:'สปาและสุขภาพ',services:'ธุรกิจบริการ'},
    ar:{nails:'الأظافر والتجميل',hair:'الشعر والحلاقة',wellness:'السبا والعافية',services:'الأعمال الخدمية'},
    fr:{nails:'Ongles et beauté',hair:'Coiffure et barberie',wellness:'Spa et bien-être',services:'Entreprises de services'}
  };
  const headlines = {
    vi:[
      'Mỗi ca làm, một nhịp vận hành.','Quét một mã. Mở menu của tiệm.','Dòng tiền rõ ràng, mỗi ngày.','Đón khách chu đáo từ lời chào đầu.','Biến lời khen thành động lực phát triển.','Một món quà, thêm một lần trở lại.','Hiểu tiệm mình qua từng con số.','Kết nối cộng đồng quanh tiệm.','Sắp xếp chứng từ thật gọn gàng.','AI nghe máy khi tiệm đang bận.','Ý tưởng hay thành chiến dịch rõ ràng.','Thêm niềm vui cho mỗi lần ghé tiệm.'
    ],
    en:[
      'Every salon day, in sync.','One scan. Your business menu.','See your payments more clearly.','Give every guest a thoughtful welcome.','Turn guest feedback into growth.','A gift worth coming back for.','Know your salon beyond the numbers.','Bring your community closer.','Keep income and receipts in order.','AI answers while your team is busy.','Turn ideas into campaigns.','Make every visit more fun.'
    ],
    zh:[
      '让沙龙的每一天有序运转。','一个二维码，连接更多体验。','每天的收支，一目了然。','从第一声问候开始，用心迎接顾客。','让顾客反馈推动成长。','一份礼物，带来下一次光临。','从数据中更了解你的店。','让店铺与社区联系更紧密。','让收入与收据井井有条。','在恰当的时刻联系顾客。','把创意变成清晰的营销活动。','让每次到店多一点乐趣。'
    ],
    ko:[
      '살롱의 하루를 하나의 흐름으로.','QR 하나로 더 많은 고객 접점을.','매일의 결제 흐름을 한눈에.','첫 인사부터 세심하게 고객을 맞이하세요.','고객의 후기를 성장의 기회로.','다시 찾고 싶은 선물 경험.','숫자 너머의 살롱을 이해하세요.','살롱과 지역 커뮤니티를 더 가깝게.','수입과 영수증을 깔끔하게 정리하세요.','알맞은 순간에 고객과 소통하세요.','아이디어를 캠페인으로 구체화하세요.','방문할 때마다 작은 즐거움을 더하세요.'
    ],
    es:[
      'Cada día del salón, en sintonía.','Un QR. Más formas de conectar.','Tus pagos, más claros cada día.','Recibe a cada cliente con atención desde el inicio.','Convierte las opiniones en crecimiento.','Un regalo que invita a volver.','Conoce tu salón más allá de los números.','Acerca tu negocio a la comunidad.','Mantén ingresos y recibos en orden.','Conecta con tus clientes en el momento adecuado.','Convierte ideas en campañas.','Haz cada visita más divertida.'
    ],
    ja:[
      'サロンの毎日を、ひとつの流れに。','ひとつのQRで、もっとつながる。','日々の決済を、もっと分かりやすく。','最初の挨拶から、心のこもったお迎えを。','お客様の声を、成長の力に。','また来たくなるギフト体験。','数字の先にあるサロンの姿を知る。','サロンと地域をもっと近くに。','収入と領収書をすっきり整理。','必要なときに、適切な方法でつながる。','アイデアをキャンペーンに。','来店のたびに、もう少し楽しく。'
    ],
    th:[
      'ทุกวันของร้าน ดำเนินไปอย่างลงตัว','QR เดียว เชื่อมต่อได้หลายทาง','เห็นภาพการรับจ่ายได้ชัดเจนทุกวัน','ต้อนรับลูกค้าอย่างใส่ใจตั้งแต่คำแรก','เปลี่ยนความคิดเห็นเป็นโอกาสเติบโต','ของขวัญที่ชวนให้กลับมาอีก','เข้าใจร้านมากกว่าตัวเลข','เชื่อมร้านกับชุมชนให้ใกล้กัน','จัดระเบียบรายรับและใบเสร็จได้ง่ายขึ้น','สื่อสารกับลูกค้าในเวลาที่เหมาะสม','เปลี่ยนไอเดียให้เป็นแคมเปญ','เพิ่มความสนุกให้ทุกครั้งที่มาเยือน'
    ],
    ar:[
      'كل يوم في الصالون، بتناغم أكبر.','رمز QR واحد، وفرص أكثر للتواصل.','رؤية أوضح للمدفوعات كل يوم.','استقبال مدروس لكل ضيف من أول تحية.','حوّل آراء العملاء إلى فرصة للنمو.','هدية تدعو إلى زيارة جديدة.','افهم صالونك بما يتجاوز الأرقام.','قرّب صالونك من مجتمعك.','نظّم الدخل والإيصالات بسهولة.','ابقَ على تواصل في الوقت المناسب.','حوّل الأفكار إلى حملات واضحة.','أضف المتعة إلى كل زيارة.'
    ],
    fr:[
      'Chaque journée du salon, en harmonie.','Un QR. Plus de façons de créer du lien.','Une vue plus claire sur vos paiements.','Accueillez chaque client avec attention.','Faites des avis un moteur de croissance.','Un cadeau qui donne envie de revenir.','Comprenez votre salon au-delà des chiffres.','Rapprochez votre salon de sa communauté.','Gardez revenus et reçus bien organisés.','Gardez le contact au bon moment.','Transformez vos idées en campagnes.','Rendez chaque visite plus amusante.'
    ]
  };

  const hero = document.getElementById('top');
  const label = document.getElementById('hero-slide-label');
  const title = document.getElementById('hero-slide-title');
  const description = document.getElementById('hero-slide-description');
  const status = document.getElementById('hero-slide-status');
  const industry = document.getElementById('hero-slide-industry');
  const posterIndustry = document.getElementById('hero-poster-industry');
  const link = document.getElementById('hero-slide-link');
  const image = document.getElementById('hero-slide-image');
  const imageLabel = document.getElementById('hero-slide-image-label');
  const imageTitle = document.getElementById('hero-slide-image-title');
  const posterIcon = document.getElementById('hero-poster-icon');
  const deviceHeading = document.getElementById('hero-device-heading');
  const deviceFeatures = document.getElementById('hero-device-features');
  const previous = document.getElementById('hero-slide-prev');
  const next = document.getElementById('hero-slide-next');
  const pause = document.getElementById('hero-slide-pause');
  const dots = document.getElementById('hero-slide-dots');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let language = headlines[document.documentElement.lang] ? document.documentElement.lang : 'vi';
  let paused = false;

  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.addEventListener('click', () => { index = i; render(true); });
    dots.append(dot);
  });
  function render(animate = false) {
    const slide = slides[index];
    const translations = ui[language];
    const card = document.querySelector(`.ecosystem-item[href="${slide.href}"]`);
    const sector = industries[language][slide.industry];
    hero.style.setProperty('--slide-accent', slide.accent);
    hero.classList.toggle('is-one-qr', index === 1);
    hero.style.setProperty('--hero-photo-position', slide.position);
    hero.style.setProperty('--hero-photo-position-mobile', slide.position);
    label.textContent = slide.name;
    title.textContent = headlines[language][index];
    description.textContent = summaries[language][index] || card?.querySelector('span[data-i18n]')?.textContent || '';
    status.textContent = card?.querySelector('.product-status')?.textContent || '';
    industry.textContent = sector;
    posterIndustry.textContent = sector;
    link.textContent = translations[1];
    link.href = slide.href;
    image.src = slide.photo;
    imageLabel.textContent = language === 'vi' ? 'MÀN HÌNH MINH HỌA' : 'SCREEN PREVIEW';
    imageTitle.textContent = slide.name;
    posterIcon.textContent = posterIcons[index];
    const preview = (screenPreviews[language] || screenPreviews.en)[index];
    deviceHeading.textContent = preview[0];
    deviceFeatures.replaceChildren(...preview.slice(1).map((feature, featureIndex) => {
      const row = document.createElement('div');
      const number = document.createElement('b');
      const name = document.createElement('span');
      const arrow = document.createElement('i');
      number.textContent = String(featureIndex + 1);
      name.textContent = feature;
      arrow.textContent = '↗';
      row.append(number, name, arrow);
      return row;
    }));
    previous.setAttribute('aria-label', translations[2]);
    next.setAttribute('aria-label', translations[3]);
    pause.setAttribute('aria-label', paused ? translations[5] : translations[4]);
    pause.textContent = paused ? '▶' : 'Ⅱ';
    [...dots.children].forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === index));
      dot.setAttribute('aria-label', `${translations[6]} ${i + 1}: ${slides[i].name}`);
    });
    if (animate && !reduceMotion.matches) {
      showcase.classList.remove('is-changing');
      void showcase.offsetWidth;
      showcase.classList.add('is-changing');
    }
    const upcoming = new Image();
    upcoming.src = slides[(index + 1) % slides.length].photo;
  }
  function move(step) { index = (index + step + slides.length) % slides.length; render(true); }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  pause.addEventListener('click', () => { paused = !paused; render(); });
  document.addEventListener('nexora:language-change', event => {
    language = headlines[event.detail.language] ? event.detail.language : 'vi';
    render();
  });
  window.setInterval(() => {
    const keyboardFocus = showcase.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    if (!paused && !keyboardFocus && !document.hidden && !reduceMotion.matches) move(1);
  }, 8500);
  render();
})();
