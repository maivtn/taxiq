(() => {
  const track = document.getElementById('ad-banner-track');
  const original = document.getElementById('ad-banner-set');
  if (!track || !original) return;

  // These are example placements. Live placements should use approved business profiles.
  const copy = {
    vi: { label:'QUẢNG BÁ · BẢN XEM TRƯỚC', cta:'Khám phá doanh nghiệp ↗', names:['Bitcoin Nail Bar','Tóc & barber','Spa & wellness','Nail & làm đẹp','Doanh nghiệp địa phương','Doanh nghiệp của bạn'] },
    en: { label:'BUSINESS AD · PREVIEW', cta:'Explore businesses ↗', names:['Bitcoin Nail Bar','Hair & barber','Spa & wellness','Nails & beauty','Local businesses','Your business here'] },
    zh: { label:'商家广告 · 示例', cta:'探索商家 ↗', names:['Bitcoin Nail Bar','美发与理容','水疗与健康','美甲与美容','本地商家','展示您的企业'] },
    ko: { label:'비즈니스 광고 · 예시', cta:'업체 둘러보기 ↗', names:['Bitcoin Nail Bar','헤어 및 바버','스파 및 웰니스','네일 및 뷰티','지역 업체','내 비즈니스 소개'] },
    es: { label:'PUBLICIDAD · MUESTRA', cta:'Explorar negocios ↗', names:['Bitcoin Nail Bar','Peluquería y barbería','Spa y bienestar','Uñas y belleza','Negocios locales','Tu negocio aquí'] },
    ja: { label:'事業者広告 · サンプル', cta:'事業者を見る ↗', names:['Bitcoin Nail Bar','ヘア・理容','スパ・ウェルネス','ネイル・美容','地域の事業者','あなたの事業をここに'] },
    th: { label:'โฆษณาธุรกิจ · ตัวอย่าง', cta:'สำรวจธุรกิจ ↗', names:['Bitcoin Nail Bar','ร้านผมและบาร์เบอร์','สปาและสุขภาพ','เล็บและความงาม','ธุรกิจท้องถิ่น','ธุรกิจของคุณที่นี่'] },
    ar: { label:'إعلان تجاري · نموذج', cta:'استكشف الأنشطة ↗', names:['Bitcoin Nail Bar','الشعر والحلاقة','السبا والعافية','الأظافر والجمال','الأنشطة المحلية','نشاطك هنا'] },
    fr: { label:'PUBLICITÉ · APERÇU', cta:'Explorer les entreprises ↗', names:['Bitcoin Nail Bar','Coiffure et barbier','Spa et bien-être','Ongles et beauté','Entreprises locales','Votre entreprise ici'] }
  };

  const duplicate = original.cloneNode(true);
  duplicate.removeAttribute('id');
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
  track.append(duplicate);

  function render(language) {
    const text = copy[language] || copy.en;
    track.closest('.ad-banner').setAttribute('aria-label', text.label);
    track.querySelectorAll('.ad-sticker').forEach(sticker => {
      const index = Number(sticker.dataset.sticker);
      sticker.querySelector('small').textContent = text.label;
      sticker.querySelector('strong').textContent = text.names[index];
      sticker.querySelector('.ad-sticker-copy > span').textContent = text.cta;
    });
  }

  document.addEventListener('nexora:language-change', event => render(event.detail.language));
  render(document.documentElement.lang);
})();
