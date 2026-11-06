/* Public product videos use the same click-to-play SweetAlert frame as News & Library. */
(() => {
  'use strict';

  const videos = {
    'si-pos': { en: '-mbyeRAsD2M' },
    'one-qr': { vi: 'SvhDWLvEUqQ', en: '9jTyBjZGoB4' },
    'payments-payouts': { vi: '0boYrmY5uXc', en: 'a6r3_v3fQ98' },
    'ai-hub': { vi: 'sxva6IN3Wck' },
    reviews: { en: 'ghegM-w3NAM' },
    'gift-card-center': { vi: '58ir33CHnF0', en: 'sflECSu8wl4' },
    community: { vi: 'aCIZKruzGAU', en: 'ogKFRXjHhxU' },
    'tax-iq': { vi: 'AK44yYxyMrg', en: 'k3ic0_8rNsc' },
    'ai-voice-sms': { vi: 'dId0Oo70Bsc', en: 'pbI2Dcf9EUw' },
    'ai-marketing': { vi: 'my5L0C4MG0E' }
  };
  const dataNode = document.getElementById('page-data');
  const placeholder = document.querySelector('.video-placeholder');
  if (!dataNode || !placeholder) return;
  const product = JSON.parse(dataNode.textContent);
  const sources = videos[product.slug];
  if (!sources) return;

  const select = document.getElementById('language');
  const heading = document.querySelector('[data-video-title]');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-player product-video-trigger';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-label', heading.textContent);
  const image = document.createElement('img');
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  const poster = placeholder.style.getPropertyValue('--video-poster').match(/url\(['"]?([^'")]+)['"]?\)/);
  if (poster) image.src = new URL(poster[1], document.baseURI).href;
  const mark = placeholder.querySelector('.video-placeholder-mark').cloneNode(true);
  mark.setAttribute('aria-hidden', 'true');
  const name = placeholder.querySelector('strong').cloneNode(true);
  button.append(image, mark, name);
  placeholder.replaceWith(button);

  let language;
  try { language = localStorage.getItem('nexora-dashboard-language-v1'); } catch (_) { /* Storage is optional. */ }
  function chooseVideo(code) {
    const id = code === 'vi' ? (sources.vi || sources.en) : (sources.en || sources.vi);
    button.dataset.productVideoId = id;
    return id;
  }
  chooseVideo(language || document.documentElement.lang);
  select.addEventListener('change', () => chooseVideo(select.value));

  const closeLabels = { vi: 'Đóng', en: 'Close', zh: '关闭', ko: '닫기', es: 'Cerrar', ja: '閉じる', th: 'ปิด', ar: 'إغلاق', fr: 'Fermer' };
  button.addEventListener('click', () => {
    const id = chooseVideo(select.value);
    if (!window.Swal || typeof window.Swal.fire !== 'function') {
      window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener,noreferrer');
      return;
    }
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
    frame.title = heading.textContent;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const container = document.createElement('div');
    container.className = 'product-video-modal-frame';
    container.append(frame);
    const stop = () => {
      frame.src = 'about:blank';
      frame.remove();
    };
    window.Swal.fire({
      titleText: heading.textContent,
      html: container,
      width: 960,
      showConfirmButton: false,
      showCloseButton: true,
      closeButtonAriaLabel: closeLabels[select.value] || closeLabels.en,
      padding: '1rem',
      returnFocus: true,
      customClass: {
        popup: 'product-video-swal-popup',
        closeButton: 'product-video-swal-close',
        title: 'product-video-swal-title',
        htmlContainer: 'product-video-swal-html'
      },
      willClose: stop,
      didDestroy: stop
    });
  });
})();
