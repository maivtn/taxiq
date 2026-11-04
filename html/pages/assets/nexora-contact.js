(() => {
  const form = document.getElementById('home-contact-form');
  if (!form) return;

  const text = {
    vi: { kicker:"LIÊN HỆ & HỖ TRỢ", title:"Kết nối với đội ngũ NEXORA", intro:"Cần tư vấn sản phẩm, hỗ trợ sử dụng hoặc đề xuất hợp tác? Chọn kênh liên hệ thuận tiện cho bạn.", emailLabel:'Email hỗ trợ', officeLabel:'Điện thoại văn phòng', textLabel:'Gọi hoặc nhắn tin', addressLabel:'Địa chỉ công ty', formTitle:"Gửi lời nhắn cho chúng tôi", formIntro:"Cho chúng tôi biết chủ đề và điều bạn muốn trao đổi.", name:'Họ và tên *', business:'Doanh nghiệp', email:'Email *', phone:'Số điện thoại', topic:'Chủ đề *', choose:'Chọn chủ đề', support:'Hỗ trợ sử dụng', onboarding:'Giá và đăng ký', partner:'Hợp tác', billing:'Thanh toán', other:'Khác', message:'Nội dung yêu cầu *', consent:'Tôi đồng ý để Nexora liên hệ về yêu cầu này. Không nhận quảng cáo nếu chưa đồng ý riêng.', submit:'Gửi yêu cầu qua email →', copy:'Sao chép nội dung', help:'Bản xem trước sẽ mở ứng dụng email của bạn. Vui lòng bấm Gửi trong ứng dụng email để hoàn tất.', opened:'Ứng dụng email đang được mở. Vui lòng bấm Gửi trong đó; yêu cầu chưa được gửi tự động.', copied:'Đã sao chép nội dung. Dán vào email gửi tới support@nexoratouch.com.', copyError:'Không thể tự động sao chép. Vui lòng gửi email tới support@nexoratouch.com.', subject:'Yêu cầu liên hệ từ trang Nexora', details:'Thông tin yêu cầu' },
    en: { kicker:"CONTACT & SUPPORT", title:"Connect with the NEXORA team", intro:"Have a product question, need support or want to explore a partnership? Choose the way to reach us that works for you.", emailLabel:'Support email', officeLabel:'Office phone', textLabel:'Call or text', addressLabel:'Company address', formTitle:"Send us a message", formIntro:"Tell us what you would like to discuss.", name:'Full name *', business:'Business', email:'Email *', phone:'Phone', topic:'Topic *', choose:'Choose a topic', support:'Product support', onboarding:'Pricing and onboarding', partner:'Partnership', billing:'Billing', other:'Other', message:'Your request *', consent:'I agree that Nexora may contact me about this request. Marketing requires separate consent.', submit:'Submit request via email →', copy:'Copy request', help:'This preview opens your email app. Press Send there to finish.', opened:'Your email app is opening. Press Send there; this request was not sent automatically.', copied:'Request copied. Paste it into an email to support@nexoratouch.com.', copyError:'Could not copy automatically. Please email support@nexoratouch.com.', subject:'Contact request from Nexora site', details:'Request details' },
    zh: { kicker:"联系与支持", title:"联系 NEXORA 团队", intro:"想咨询产品、获取使用支持或洽谈合作？请选择方便您的联系方式。", emailLabel:'支持邮箱', officeLabel:'办公室电话', textLabel:'电话或短信', addressLabel:'公司地址', formTitle:"给我们留言", formIntro:"请告诉我们您想讨论的主题和需求。", name:'姓名 *', business:'企业名称', email:'邮箱 *', phone:'电话', topic:'主题 *', choose:'选择主题', support:'产品支持', onboarding:'价格与注册', partner:'合作', billing:'账单', other:'其他', message:'需求内容 *', consent:'我同意 Nexora 就此需求与我联系。营销信息需另行同意。', submit:'通过邮件提交需求 →', copy:'复制内容', help:'预览版将打开您的邮箱应用。请在邮箱中点击发送。', opened:'正在打开邮箱应用。请在其中点击发送；系统尚未自动提交。', copied:'内容已复制。请粘贴并发送至 support@nexoratouch.com。', copyError:'无法自动复制。请发邮件至 support@nexoratouch.com。', subject:'Nexora 网站联系需求', details:'需求详情' },
    ko: { kicker:"문의 및 지원", title:"NEXORA 팀에 문의하세요", intro:"제품 문의, 사용 지원 또는 제휴 제안이 있으신가요? 편리한 연락 방법을 선택하세요.", emailLabel:'지원 이메일', officeLabel:'사무실 전화', textLabel:'전화 또는 문자', addressLabel:'회사 주소', formTitle:"메시지 보내기", formIntro:"문의 주제와 필요한 내용을 알려주세요.", name:'이름 *', business:'사업체', email:'이메일 *', phone:'전화번호', topic:'주제 *', choose:'주제 선택', support:'제품 지원', onboarding:'요금 및 가입', partner:'제휴', billing:'결제', other:'기타', message:'문의 내용 *', consent:'이 문의와 관련해 Nexora가 연락하는 데 동의합니다. 마케팅은 별도 동의가 필요합니다.', submit:'이메일로 문의 제출 →', copy:'내용 복사', help:'미리보기에서는 이메일 앱이 열립니다. 앱에서 보내기를 눌러 완료하세요.', opened:'이메일 앱이 열립니다. 앱에서 보내기를 눌러주세요. 자동 전송되지 않았습니다.', copied:'내용을 복사했습니다. support@nexoratouch.com으로 보내세요.', copyError:'자동 복사에 실패했습니다. support@nexoratouch.com으로 이메일을 보내주세요.', subject:'Nexora 사이트 문의', details:'문의 정보' },
    es: { kicker:"CONTACTO Y ASISTENCIA", title:"Conecta con el equipo de NEXORA", intro:"¿Tienes preguntas sobre el producto, necesitas ayuda o quieres colaborar? Elige la forma de contacto más cómoda para ti.", emailLabel:'Correo de asistencia', officeLabel:'Teléfono de oficina', textLabel:'Llamadas o mensajes', addressLabel:'Dirección de la empresa', formTitle:"Envíanos un mensaje", formIntro:"Cuéntanos qué te gustaría tratar.", name:'Nombre completo *', business:'Empresa', email:'Correo electrónico *', phone:'Teléfono', topic:'Tema *', choose:'Elige un tema', support:'Soporte del producto', onboarding:'Precios y registro', partner:'Colaboración', billing:'Facturación', other:'Otro', message:'Tu consulta *', consent:'Acepto que Nexora me contacte sobre esta consulta. El marketing requiere un consentimiento aparte.', submit:'Enviar consulta por correo →', copy:'Copiar consulta', help:'Esta vista previa abre tu aplicación de correo. Pulsa Enviar allí para terminar.', opened:'Se está abriendo tu correo. Pulsa Enviar allí; no se ha enviado automáticamente.', copied:'Consulta copiada. Pégala en un correo a support@nexoratouch.com.', copyError:'No se pudo copiar. Escribe a support@nexoratouch.com.', subject:'Consulta desde el sitio Nexora', details:'Detalles de la consulta' },
    ja: { kicker:"お問い合わせ・サポート", title:"NEXORA チームにご相談ください", intro:"製品へのご質問、利用サポート、提携のご相談など、都合のよい方法でお問い合わせください。", emailLabel:'サポートメール', officeLabel:'オフィス電話', textLabel:'電話・SMS', addressLabel:'会社所在地', formTitle:"メッセージを送る", formIntro:"ご相談の内容をお知らせください。", name:'お名前 *', business:'事業者名', email:'メール *', phone:'電話番号', topic:'項目 *', choose:'項目を選択', support:'製品サポート', onboarding:'料金・登録', partner:'提携', billing:'請求', other:'その他', message:'お問い合わせ内容 *', consent:'この問い合わせについて Nexora から連絡を受けることに同意します。販促には別途同意が必要です。', submit:'メールで問い合わせを送信 →', copy:'内容をコピー', help:'プレビューではメールアプリが開きます。アプリで送信を押してください。', opened:'メールアプリを開いています。送信を押してください。自動送信はされていません。', copied:'内容をコピーしました。support@nexoratouch.com 宛てのメールに貼り付けてください。', copyError:'コピーできませんでした。support@nexoratouch.com にメールしてください。', subject:'Nexora サイトからのお問い合わせ', details:'お問い合わせ詳細' },
    th: { kicker:"ติดต่อและสนับสนุน", title:"ติดต่อทีม NEXORA", intro:"มีคำถามเกี่ยวกับผลิตภัณฑ์ ต้องการความช่วยเหลือ หรือสนใจร่วมงาน? เลือกช่องทางติดต่อที่สะดวกสำหรับคุณ", emailLabel:'อีเมลฝ่ายสนับสนุน', officeLabel:'โทรศัพท์สำนักงาน', textLabel:'โทรหรือส่งข้อความ', addressLabel:'ที่อยู่บริษัท', formTitle:"ส่งข้อความถึงเรา", formIntro:"บอกหัวข้อและเรื่องที่คุณต้องการพูดคุย", name:'ชื่อและนามสกุล *', business:'ธุรกิจ', email:'อีเมล *', phone:'โทรศัพท์', topic:'หัวข้อ *', choose:'เลือกหัวข้อ', support:'ความช่วยเหลือเกี่ยวกับสินค้า', onboarding:'ราคาและการสมัคร', partner:'ความร่วมมือ', billing:'การชำระเงิน', other:'อื่น ๆ', message:'รายละเอียดคำขอ *', consent:'ฉันยินยอมให้ Nexora ติดต่อเกี่ยวกับคำขอนี้ การตลาดต้องได้รับความยินยอมแยกต่างหาก', submit:'ส่งคำขอทางอีเมล →', copy:'คัดลอกคำขอ', help:'ตัวอย่างนี้จะเปิดแอปอีเมล โปรดกดส่งในแอปเพื่อให้เสร็จสิ้น', opened:'กำลังเปิดแอปอีเมล โปรดกดส่งในแอป คำขอยังไม่ถูกส่งอัตโนมัติ', copied:'คัดลอกแล้ว โปรดวางในอีเมลถึง support@nexoratouch.com', copyError:'คัดลอกอัตโนมัติไม่ได้ โปรดส่งอีเมลถึง support@nexoratouch.com', subject:'คำขอติดต่อจากเว็บไซต์ Nexora', details:'รายละเอียดคำขอ' },
    ar: { kicker:"التواصل والدعم", title:"تواصل مع فريق NEXORA", intro:"هل لديك سؤال عن المنتجات أو تحتاج إلى دعم أو ترغب في التعاون؟ اختر وسيلة التواصل الأنسب لك.", emailLabel:'بريد الدعم', officeLabel:'هاتف المكتب', textLabel:'اتصال أو رسالة', addressLabel:'عنوان الشركة', formTitle:"أرسل لنا رسالة", formIntro:"أخبرنا بالموضوع الذي ترغب في مناقشته.", name:'الاسم الكامل *', business:'النشاط التجاري', email:'البريد الإلكتروني *', phone:'الهاتف', topic:'الموضوع *', choose:'اختر موضوعًا', support:'دعم المنتج', onboarding:'الأسعار والتسجيل', partner:'الشراكة', billing:'الفوترة', other:'أخرى', message:'تفاصيل الطلب *', consent:'أوافق على تواصل Nexora معي بشأن هذا الطلب. تتطلب الرسائل التسويقية موافقة منفصلة.', submit:'أرسل الطلب عبر البريد الإلكتروني ←', copy:'نسخ الطلب', help:'ستفتح هذه المعاينة تطبيق البريد. اضغط إرسال هناك لإكمال الطلب.', opened:'جارٍ فتح تطبيق البريد. اضغط إرسال هناك؛ لم يُرسل الطلب تلقائيًا.', copied:'تم نسخ الطلب. الصقه في رسالة إلى support@nexoratouch.com.', copyError:'تعذر النسخ تلقائيًا. راسل support@nexoratouch.com.', subject:'طلب تواصل من موقع Nexora', details:'تفاصيل الطلب' },
    fr: { kicker:"CONTACT ET ASSISTANCE", title:"Échangez avec notre équipe NEXORA", intro:"Une question sur nos produits, un besoin de soutien ou un projet de partenariat ? Choisissez le moyen de contact qui vous convient.", emailLabel:'E-mail du support', officeLabel:'Téléphone du bureau', textLabel:'Appel ou SMS', addressLabel:'Adresse de la société', formTitle:"Envoyez-nous un message", formIntro:"Indiquez le sujet dont vous souhaitez discuter.", name:'Nom complet *', business:'Entreprise', email:'E-mail *', phone:'Téléphone', topic:'Sujet *', choose:'Choisissez un sujet', support:'Assistance produit', onboarding:'Tarifs et inscription', partner:'Partenariat', billing:'Facturation', other:'Autre', message:'Votre demande *', consent:'J’accepte que Nexora me contacte au sujet de cette demande. Le marketing nécessite un consentement distinct.', submit:'Envoyer la demande par e-mail →', copy:'Copier la demande', help:'Cet aperçu ouvre votre messagerie. Appuyez sur Envoyer dans l’application pour terminer.', opened:'Votre messagerie s’ouvre. Appuyez sur Envoyer ; la demande n’a pas été envoyée automatiquement.', copied:'Demande copiée. Collez-la dans un e-mail à support@nexoratouch.com.', copyError:'Copie impossible. Écrivez à support@nexoratouch.com.', subject:'Demande depuis le site Nexora', details:'Détails de la demande' }
  };

  let language = 'vi';
  const status = document.getElementById('contact-status');
  function strings() { return text[language] || text.vi; }
  function translate(code) {
    language = text[code] ? code : 'vi';
    form.closest('.contact-section').querySelectorAll('[data-contact-i18n]').forEach(el => {
      el.textContent = strings()[el.dataset.contactI18n];
    });
    status.hidden = true;
  }
  function requestText() {
    const data = new FormData(form);
    const t = strings();
    const selected = form.elements.topic.selectedOptions[0].textContent;
    return `${t.details}\n${t.name}: ${data.get('name').trim()}\n${t.business}: ${(data.get('business') || '').trim()}\n${t.email}: ${data.get('email').trim()}\n${t.phone}: ${(data.get('phone') || '').trim()}\n${t.topic}: ${selected}\n\n${t.message}:\n${data.get('message').trim()}`;
  }
  function showStatus(message) { status.textContent = message; status.hidden = false; }
  function valid() { return form.reportValidity(); }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    const subject = encodeURIComponent(`${strings().subject} — ${form.elements.topic.selectedOptions[0].textContent}`);
    const body = encodeURIComponent(requestText());
    showStatus(strings().opened);
    window.location.href = `mailto:support@nexoratouch.com?subject=${subject}&body=${body}`;
  });
  document.getElementById('contact-copy').addEventListener('click', async () => {
    if (!valid()) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(requestText());
      } else {
        const helper = document.createElement('textarea');
        helper.value = requestText();
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand('copy');
        helper.remove();
        if (!copied) throw new Error('copy failed');
      }
      showStatus(strings().copied);
    } catch (_) {
      showStatus(strings().copyError);
    }
  });
  document.addEventListener('nexora:language-change', event => translate(event.detail.language));
  translate(document.documentElement.lang);
})();
