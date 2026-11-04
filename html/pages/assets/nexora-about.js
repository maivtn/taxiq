(() => {
  const copy = {
    vi: ["Về NEXORA TOUCH", "VỀ NEXORA TOUCH", "Một hành trình từ vận hành đến tăng trưởng", "NEXORA TOUCH giúp doanh nghiệp tìm đúng công cụ ở từng giai đoạn: tổ chức công việc, tạo điểm chạm với khách và nhìn rõ cơ hội phát triển.", "Vận hành", "Tổ chức lịch hẹn, dịch vụ, đội ngũ và hoạt động tại quầy.", "Kết nối", "Mở thêm điểm chạm với khách qua QR, đánh giá và cộng đồng.", "Phát triển", "Khám phá dữ liệu, phản hồi và công cụ tiếp thị để phát triển."],
    en: ["About NEXORA TOUCH", "ABOUT NEXORA TOUCH", "One journey from operations to growth", "NEXORA TOUCH helps businesses find the right tools at each stage: organize work, create customer touchpoints and see new opportunities to grow.", "Operations", "Organize appointments, services, teams and front desk activity.", "Connect", "Create more customer touchpoints through QR, reviews and community.", "Grow", "Explore data, feedback and marketing tools to support growth."],
    zh: ["关于 NEXORA TOUCH", "关于 NEXORA TOUCH", "从日常运营走向业务增长", "NEXORA TOUCH 帮助企业在每个阶段找到合适的工具：安排工作、建立客户接触点，并发现发展机会。", "运营", "安排预约、服务、团队和前台工作。", "连接", "通过二维码、评价和社区增加客户接触点。", "发展", "探索数据、反馈和营销工具，支持业务发展。"],
    ko: ["NEXORA TOUCH 소개", "NEXORA TOUCH 소개", "일상 운영에서 성장까지 이어지는 여정", "NEXORA TOUCH는 업무 정리, 고객 접점 확대, 성장 기회 파악 등 각 단계에 맞는 도구를 찾도록 돕습니다.", "운영", "예약, 서비스, 팀과 프런트 업무를 정리합니다.", "연결", "QR, 리뷰와 커뮤니티로 고객 접점을 넓힙니다.", "성장", "데이터, 피드백과 마케팅 도구를 살펴봅니다."],
    es: ["Acerca de NEXORA TOUCH", "ACERCA DE NEXORA TOUCH", "Un recorrido de las operaciones al crecimiento", "NEXORA TOUCH ayuda a encontrar las herramientas adecuadas en cada etapa: organizar el trabajo, crear puntos de contacto con clientes y descubrir oportunidades de crecimiento.", "Operaciones", "Organiza citas, servicios, equipos y tareas de recepción.", "Conexión", "Crea más puntos de contacto mediante QR, reseñas y comunidad.", "Crecimiento", "Explora datos, opiniones y herramientas de marketing para crecer."],
    ja: ["NEXORA TOUCH について", "NEXORA TOUCH について", "日々の運営から成長へつながる道筋", "NEXORA TOUCH は、業務の整理、顧客との接点づくり、成長の機会を見つける各段階に合ったツール選びを支えます。", "運営", "予約、サービス、チーム、受付業務を整理します。", "つながり", "QR、レビュー、コミュニティで顧客接点を増やします。", "成長", "データ、声、マーケティングツールを確認します。"],
    th: ["เกี่ยวกับ NEXORA TOUCH", "เกี่ยวกับ NEXORA TOUCH", "เส้นทางจากการดำเนินงานสู่การเติบโต", "NEXORA TOUCH ช่วยธุรกิจเลือกเครื่องมือที่เหมาะในแต่ละช่วง ตั้งแต่จัดงานประจำวัน สร้างจุดสัมผัสกับลูกค้า ไปจนถึงมองเห็นโอกาสเติบโต", "การดำเนินงาน", "จัดการนัดหมาย บริการ ทีมงาน และงานหน้าร้าน", "การเชื่อมต่อ", "เพิ่มจุดสัมผัสลูกค้าผ่าน QR รีวิว และชุมชน", "การเติบโต", "สำรวจข้อมูล ความคิดเห็น และเครื่องมือการตลาด"],
    ar: ["عن NEXORA TOUCH", "عن NEXORA TOUCH", "رحلة من التشغيل إلى النمو", "يساعد NEXORA TOUCH الشركات في اختيار الأدوات المناسبة لكل مرحلة: تنظيم العمل، وبناء نقاط تواصل مع العملاء، واكتشاف فرص النمو.", "التشغيل", "تنظيم المواعيد والخدمات والفرق وأعمال الاستقبال.", "التواصل", "زيادة نقاط التواصل عبر QR والتقييمات والمجتمع.", "النمو", "استكشاف البيانات والآراء وأدوات التسويق لدعم النمو."],
    fr: ["À propos de NEXORA TOUCH", "À PROPOS DE NEXORA TOUCH", "Un parcours des opérations à la croissance", "NEXORA TOUCH aide les entreprises à trouver les bons outils à chaque étape : organiser le travail, créer des points de contact avec les clients et repérer les possibilités de croissance.", "Opérations", "Organiser les rendez-vous, les services, les équipes et l’accueil.", "Connexion", "Multiplier les points de contact avec les QR codes, les avis et la communauté.", "Croissance", "Explorer les données, les retours et les outils marketing pour grandir."]
  };
  const keys = ['nav','kicker','title','intro','pillar1Title','pillar1Body','pillar2Title','pillar2Body','pillar3Title','pillar3Body'];
  const storyLink = {
    vi:'Xem câu chuyện NEXORA TOUCH →',
    en:'Read the NEXORA TOUCH story →',
    zh:'了解 NEXORA TOUCH 的故事 →',
    ko:'NEXORA TOUCH 이야기 보기 →',
    es:'Conoce la historia de NEXORA TOUCH →',
    ja:'NEXORA TOUCH のストーリーを見る →',
    th:'อ่านเรื่องราวของ NEXORA TOUCH →',
    ar:'اقرأ قصة NEXORA TOUCH ←',
    fr:'Découvrir l’histoire de NEXORA TOUCH →'
  };
  const parentLink = {
    vi:'Tìm hiểu VLINKPAY, công ty mẹ →',
    en:'Meet VLINKPAY, the parent company →',
    zh:'了解母公司 VLINKPAY →',
    ko:'모회사 VLINKPAY 알아보기 →',
    es:'Conoce VLINKPAY, la empresa matriz →',
    ja:'親会社 VLINKPAY について →',
    th:'รู้จัก VLINKPAY บริษัทแม่ →',
    ar:'تعرّف على VLINKPAY، الشركة الأم ←',
    fr:'Découvrir VLINKPAY, la société mère →'
  };
  function render(language) {
    const values = copy[language] || copy.vi;
    document.querySelectorAll('[data-about-i18n]').forEach(element => {
      const index = keys.indexOf(element.dataset.aboutI18n);
      if (index !== -1) element.textContent = values[index];
      if (element.dataset.aboutI18n === 'nav') element.href = `about/previews/nexora-touch/${language === 'vi' ? 'index.vi.html' : 'index.html'}`;
    });
    document.querySelectorAll('[data-about-story-link]').forEach(element => {
      const label = (storyLink[language] || storyLink.en).replace(/\s*[→←]\s*$/, '');
      element.querySelector('[data-about-link-label]').textContent = label;
      element.setAttribute('aria-label', label);
      element.href = `about/previews/nexora-touch/${language === 'vi' ? 'index.vi.html' : 'index.html'}`;
    });
    document.querySelectorAll('[data-about-parent-link]').forEach(element => {
      const label = (parentLink[language] || parentLink.en).replace(/\s*[→←]\s*$/, '');
      element.querySelector('[data-about-link-label]').textContent = label;
      element.setAttribute('aria-label', label);
    });
  }
  render(document.documentElement.lang.slice(0,2));
  document.addEventListener('nexora:language-change', event => render(event.detail.language));

  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
  document.querySelectorAll('.about-pillar').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty('--about-rx', `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty('--about-ry', `${(x * 9).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--about-rx');
      card.style.removeProperty('--about-ry');
    });
  });
})();
