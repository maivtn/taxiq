const tabs = [...document.querySelectorAll('.moment-tab')];
const panel = document.getElementById('moment-panel');
let activeMoment = 0;

function showMoment(index, focus = false) {
  if (!panel || !tabs.length) return;
  activeMoment = (index + tabs.length) % tabs.length;
  const template = document.getElementById(`moment-data-${activeMoment}`);
  if (!template) return;
  panel.replaceChildren(template.content.cloneNode(true));
  tabs.forEach((tab, i) => {
    const selected = i === activeMoment;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tabs[activeMoment].id);
  if (focus) tabs[activeMoment].focus();
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => showMoment(i));
  tab.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      showMoment(i + 1, true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      showMoment(i - 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      showMoment(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      showMoment(tabs.length - 1, true);
    }
  });
});
document.getElementById('moment-prev')?.addEventListener('click', () => showMoment(activeMoment - 1));
document.getElementById('moment-next')?.addEventListener('click', () => showMoment(activeMoment + 1));
showMoment(0);

const hero = document.querySelector('.hero');
const heroSlides = [...document.querySelectorAll('[data-hero-slide]')];
const heroButtons = [...document.querySelectorAll('[data-hero-target]')];
const worldButtons = [...document.querySelectorAll('[data-map-target]')];
const heroCredits = [...document.querySelectorAll('[data-hero-credit]')];
const heroPlace = document.getElementById('hero-place');
const heroRegion = document.getElementById('hero-region');
const heroPause = document.getElementById('hero-pause');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroIndex = 0;
let heroPaused = reducedMotion;
let heroTimer;

function scheduleHero() {
  window.clearInterval(heroTimer);
  if (heroPaused || document.hidden || heroSlides.length < 2) return;
  heroTimer = window.setInterval(() => showHero(heroIndex + 1, false), 7000);
}

function showHero(index, resetTimer = true) {
  if (!heroSlides.length) return;
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroIndex));
  heroButtons.forEach((button, i) => {
    const active = i === heroIndex;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  worldButtons.forEach((button) => {
    const active = Number(button.dataset.mapTarget) === heroIndex;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const activeButton = heroButtons[heroIndex];
  const controlRail = activeButton?.parentElement;
  if (activeButton && controlRail) {
    const railRect = controlRail.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    if (buttonRect.left < railRect.left || buttonRect.right > railRect.right) {
      controlRail.scrollBy({ left: buttonRect.left - railRect.left - (railRect.width - buttonRect.width) / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }
  heroCredits.forEach((credit, i) => { credit.hidden = i !== heroIndex; });
  if (heroPlace) heroPlace.textContent = heroButtons[heroIndex]?.dataset.heroPlace || '';
  if (heroRegion) heroRegion.textContent = heroButtons[heroIndex]?.dataset.heroRegion || '';
  if (resetTimer) scheduleHero();
}

function updateHeroPause() {
  if (!hero || !heroPause) return;
  hero.classList.toggle('is-paused', heroPaused);
  heroPause.setAttribute('aria-pressed', String(heroPaused));
  heroPause.setAttribute('aria-label', heroPaused ? heroPause.dataset.playLabel : heroPause.dataset.pauseLabel);
  heroPause.querySelector('span').textContent = heroPaused ? '▶' : 'Ⅱ';
}

heroButtons.forEach((button, i) => button.addEventListener('click', () => showHero(i)));
worldButtons.forEach((button) => button.addEventListener('click', () => {
  showHero(Number(button.dataset.mapTarget));
  hero?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}));
heroPause?.addEventListener('click', () => {
  heroPaused = !heroPaused;
  updateHeroPause();
  scheduleHero();
});
document.addEventListener('visibilitychange', scheduleHero);
updateHeroPause();
scheduleHero();

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.getElementById('mobile-nav');
const navDropdown = document.querySelector('.nav-dropdown');
const languageMenus = [...document.querySelectorAll('.language-menu')];
function syncLanguageLinks() {
  document.querySelectorAll('[data-language-target]').forEach((link) => {
    const page = link.getAttribute('href').split('#')[0];
    link.setAttribute('href', `${page}${window.location.hash}`);
  });
}
syncLanguageLinks();
window.addEventListener('hashchange', syncLanguageLinks);
navDropdown?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { navDropdown.open = false; }));
document.addEventListener('click', (event) => {
  if (navDropdown?.open && !navDropdown.contains(event.target)) navDropdown.open = false;
  languageMenus.forEach((menu) => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navDropdown?.open) {
    navDropdown.open = false;
    navDropdown.querySelector('summary')?.focus();
  }
  if (event.key === 'Escape') languageMenus.forEach((menu) => {
    if (menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
  });
});
languageMenus.forEach((menu) => menu.addEventListener('toggle', () => {
  if (menu.open) languageMenus.forEach((other) => { if (other !== menu) other.open = false; });
}));
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  mobileNav.hidden = !open;
});
mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const bookingForm = document.getElementById('booking-form');
const bookingProgram = document.getElementById('booking-program');
document.querySelectorAll('[data-program-select]').forEach((link) => link.addEventListener('click', () => {
  if (bookingProgram) bookingProgram.value = link.dataset.programSelect;
}));
bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity() || !bookingProgram) return;
  const fields = [...bookingForm.querySelectorAll('input, select, textarea')];
  const lines = fields.map((field) => {
    const value = field === bookingProgram ? bookingProgram.selectedOptions[0]?.textContent : field.value.trim();
    if (!value) return null;
    const label = field.closest('label')?.firstChild?.textContent?.trim() || field.name;
    return `${label}: ${value.slice(0, 700)}`;
  }).filter(Boolean);
  const body = `${bookingForm.dataset.mailIntro || ''}${lines.join('\n')}${bookingForm.dataset.mailFooter || ''}`;
  const address = bookingForm.dataset.email;
  if (!address) return;
  window.location.href = `mailto:${address}?subject=${encodeURIComponent(bookingForm.dataset.subject || 'VMMTRAVEL')}&body=${encodeURIComponent(body)}`;
});

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        self.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('in-view'));
}

const videoChoices = [...document.querySelectorAll('.video-choice')];
const videoStage = document.getElementById('video-stage');
const videoPoster = document.getElementById('video-poster');
const videoPlay = document.getElementById('video-play');
const videoTitle = document.getElementById('video-title');
const videoSource = document.getElementById('video-source');
const videoWatch = document.getElementById('video-watch');
const videoNote = document.getElementById('video-note');
let selectedVideo = videoChoices[0]?.dataset.videoId;
let selectedVideoWatchUrl = videoChoices[0]?.dataset.videoWatchUrl;

function selectVideo(choice) {
  if (!choice || !videoStage || !videoPoster || !videoPlay || !videoTitle || !videoWatch) return;
  selectedVideo = choice.dataset.videoId;
  selectedVideoWatchUrl = choice.dataset.videoWatchUrl;
  const title = choice.dataset.videoTitle || 'VMMTRAVEL';
  videoStage.querySelector('iframe')?.remove();
  videoPoster.src = `https://i.ytimg.com/vi/${selectedVideo}/hqdefault.jpg`;
  videoPoster.hidden = false;
  videoPlay.hidden = false;
  videoPlay.setAttribute('aria-label', `${videoPlay.dataset.playLabel || 'Play video'}: ${title}`);
  videoTitle.textContent = title;
  if (videoSource) videoSource.textContent = `YOUTUBE · ${choice.dataset.videoSource || 'VMMTRAVEL'}`;
  videoWatch.href = selectedVideoWatchUrl || `https://www.youtube.com/watch?v=${selectedVideo}`;
  if (videoNote) {
    videoNote.textContent = choice.dataset.videoNote || '';
    videoNote.hidden = !choice.dataset.videoNote;
  }
  videoChoices.forEach((item) => {
    const active = item === choice;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
}

videoChoices.forEach((choice) => choice.addEventListener('click', () => selectVideo(choice)));
videoPlay?.addEventListener('click', () => {
  if (!selectedVideo || !videoStage) return;
  const watchUrl = selectedVideoWatchUrl || `https://www.youtube.com/watch?v=${selectedVideo}`;
  if (window.location.protocol === 'file:') {
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1&rel=0`;
  iframe.title = videoTitle?.textContent || 'VMMTRAVEL video';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  videoPoster.hidden = true;
  videoPlay.hidden = true;
  videoStage.append(iframe);
});
