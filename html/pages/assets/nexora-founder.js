(() => {
  document.querySelectorAll('.founder-language a[data-language]').forEach(link => {
    link.addEventListener('click', () => {
      const hash = window.location.hash;
      if (hash) link.href = `${link.getAttribute('href').split('#')[0]}${hash}`;
      try { localStorage.setItem('nexora-dashboard-language-v1', link.dataset.language); } catch (_) {}
    });
  });
  // TODO: Replace this URL when the official NEXORA TOUCH LinkedIn Company Page is available.
  const NEXORA_LINKEDIN_COMPANY_URL_TODO = '';
  const founderLinkedIn = 'https://www.linkedin.com/in/briannguyenai';
  document.querySelectorAll('[data-founder-company-linkedin]').forEach(link => {
    link.href = NEXORA_LINKEDIN_COMPANY_URL_TODO || founderLinkedIn;
    link.setAttribute('aria-label', NEXORA_LINKEDIN_COMPANY_URL_TODO ? 'NEXORA TOUCH on LinkedIn' : 'LinkedIn — Brian Nguyen');
  });
  const labels = {
    en: {nav:'Founder',eyebrow:'FROM THE FOUNDER',headline:'25+ years of nail industry expertise.',body:'Brian Nguyen brings more than 25 years in the nail industry and more than 27 years in network marketing. He has advised major companies in technology, finance and fintech, and has extensive experience in blockchain and AI. He still operates BITCOIN NAIL BAR in Houston.',quote:'“You take care of your clients. We take care of everything else.”',meet:'Meet the founder'},
    vi: {nav:'Người sáng lập',eyebrow:'TỪ NGƯỜI SÁNG LẬP',headline:'Hơn 25 năm trong ngành nail.',body:'Brian Nguyen có hơn 25 năm kinh nghiệm trong ngành nail và hơn 27 năm trong lĩnh vực network marketing. Ông từng cố vấn cho nhiều tập đoàn lớn trong lĩnh vực công nghệ, tài chính và fintech, đồng thời có kinh nghiệm lâu năm về blockchain và AI. Ông vẫn đang vận hành BITCOIN NAIL BAR tại Houston.',quote:'“Chủ tiệm lo làm đẹp cho khách. Mình lo tất cả phần còn lại.”',meet:'Gặp người sáng lập'}
  };
  function render(language) {
    const copy = labels[language] || labels.en;
    document.querySelectorAll('[data-founder-i18n]').forEach(element => {
      const value = copy[element.dataset.founderI18n];
      if (value) element.textContent = value;
      if (element.tagName === 'A' && ['nav','meet'].includes(element.dataset.founderI18n)) {
        element.href = `founder/${language === 'vi' ? 'index.vi.html' : 'index.html'}`;
      }
    });
  }
  render(document.documentElement.lang);
  document.addEventListener('nexora:language-change', event => render(event.detail.language));
})();
