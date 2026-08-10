import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const PAGE_URL = new URL('./news-library.html', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'news-library.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function panelContent(html, panelId) {
  const escaped = panelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<section class="news-panel" id="panel-${escaped}"[^>]*>([\\s\\S]*?)<\\/section>`));
  assert.ok(match, `panel-${panelId} must exist`);
  return match[1];
}

function styleContent(html) {
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  assert.ok(match, 'page style block must exist');
  return match[1];
}

function createFakeElement(attributes = {}) {
  const classes = new Set();
  return {
    attributes,
    children: [],
    hidden: false,
    innerHTML: '',
    textContent: '',
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      },
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      }
    },
    addEventListener() {},
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    click() {
      this.wasClicked = true;
    },
    focus() {
      this.wasFocused = true;
    },
    getAttribute(name) {
      return this.attributes[name] ?? null;
    },
    remove() {
      this.wasRemoved = true;
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    }
  };
}

function createNewsLibraryRuntime() {
  const html = source();
  const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const tabIds = ['news', 'compensation-plan', 'event-zoom-schedule'];
  const tabs = tabIds.map((tabId) => createFakeElement({ 'data-news-tab': tabId }));
  const panels = tabIds.map((tabId) => createFakeElement({ 'data-news-panel': tabId }));
  const contentTargets = new Map(tabIds.map((tabId) => [tabId, createFakeElement()]));
  const listeners = {};
  const openCalls = [];
  const swalCalls = [];

  const document = {
    body: createFakeElement(),
    documentElement: { lang: 'en' },
    addEventListener(type, handler) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(handler);
    },
    createElement(tagName) {
      return createFakeElement({ tagName });
    },
    querySelector(selector) {
      const contentMatch = selector.match(/^\[data-news-content="([^"]+)"\]$/);
      if (contentMatch) return contentTargets.get(contentMatch[1]) || null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-news-tab]') return tabs;
      if (selector === '[data-news-panel]') return panels;
      return [];
    }
  };

  const window = {
    document,
    history: { replaceState() {} },
    location: { href: 'https://merchant.test/news-library.html', search: '' },
    lucide: { createIcons() {} },
    Swal: {
      fire(options) {
        swalCalls.push(options);
        return Promise.resolve({ isConfirmed: true });
      }
    },
    open(url, target, features) {
      openCalls.push({ url, target, features });
    }
  };
  window.window = window;

  const context = {
    DOMException,
    URL,
    URLSearchParams,
    clearTimeout,
    console,
    document,
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    setTimeout,
    window
  };

  for (const script of inlineScripts) {
    runInNewContext(script, context, { filename: 'news-library.html' });
  }

  function dispatchClick(target) {
    const event = {
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      stopPropagation() {
        this.propagationStopped = true;
      },
      target
    };
    for (const handler of listeners.click || []) handler(event);
    return event;
  }

  return {
    api: window.NEXORA_NEWS_LIBRARY,
    contentTargets,
    dispatchClick,
    openCalls,
    swalCalls
  };
}

test('creates the News & Library page from the shared merchant shell', () => {
  const html = source();

  assert.match(html, /<title>Nexora Touch - News &amp; Library<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar"[^>]*><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="News &amp; Library content">/);
  assert.doesNotMatch(html, /class="library-status"/);
  assert.doesNotMatch(html, /data-news-status/);
  assert.match(html, /<p class="page-description">Keep Nexora Touch news and Zoom schedules in one owner workspace\.<\/p>/);
  assert.doesNotMatch(html, /Keep VLINKPAY news/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/sweetalert2@11"><\/script>/);
  assert.doesNotMatch(html, /data-news-media-modal/);
  assert.doesNotMatch(html, /news-media-modal/);
  assert.match(html, /window\.NEXORA_SHELL = \{ activePage: 'news-library', activeTab: 'news' \};/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
});

test('renders only the requested News & Library tabs with dynamic content mount points', () => {
  const html = source();
  const visibleMarkup = html.replace(/<script[\s\S]*?<\/script>/g, '');

  assert.match(html, /<h1 class="page-title" id="news-library-title">News &amp; Library<\/h1>/);
  assert.doesNotMatch(html, /library-section-head/);
  assert.doesNotMatch(html, /library-title-row/);
  assert.doesNotMatch(html, /library-section-icon/);
  assert.doesNotMatch(html, /library-section-title/);
  assert.doesNotMatch(html, /library-section-copy/);
  assert.doesNotMatch(visibleMarkup, /\bJSON\b/);
  assert.doesNotMatch(visibleMarkup, /docs\/news/);
  assert.doesNotMatch(visibleMarkup, /Recent sessions/);
  assert.doesNotMatch(visibleMarkup, /recent recorded sessions/);
  assert.match(html, /<div class="page-tabs" role="tablist" aria-label="News and library sections">/);
  assert.match(html, /data-news-tab="news"[\s\S]*?<span>News<\/span>[\s\S]*?data-news-tab="event-zoom-schedule"[\s\S]*?<span>Event &amp; Zoom Schedule<\/span>[\s\S]*?data-news-tab="compensation-plan"[\s\S]*?<span>Compensation Plan<\/span>/);

  for (const [tab, label] of [
    ['news', 'News'],
    ['event-zoom-schedule', 'Event &amp; Zoom Schedule'],
    ['compensation-plan', 'Compensation Plan']
  ]) {
    assert.match(html, new RegExp(`<button class="page-tab[^\"]*"[^>]*role="tab"[^>]*data-news-tab="${tab}"[\\s\\S]*?<span>${label}<\\/span>[\\s\\S]*?<\\/button>`));
    assert.match(html, new RegExp(`<section class="news-panel" id="panel-${tab}" role="tabpanel" aria-labelledby="tab-${tab}" data-news-panel="${tab}"`));
    assert.match(panelContent(html, tab), new RegExp(`data-news-content="${tab}"`));
  }

  for (const tab of ['presentation-video']) {
    assert.doesNotMatch(html, new RegExp(`data-news-tab="${tab}"`));
    assert.doesNotMatch(html, new RegExp(`data-news-panel="${tab}"`));
    assert.doesNotMatch(html, new RegExp(`data-news-content="${tab}"`));
  }
  assert.doesNotMatch(html, /<span>Presentation &amp; Video<\/span>/);
  assert.doesNotMatch(html, /Content will be added later\./);
  assert.match(html, /function activateNewsTab\(tabId, shouldUpdateUrl\)/);
  assert.match(html, /window\.activateMainTab = function \(tabId\)/);
});

test('matches AI Hub page tab styling and mobile responsive layout', () => {
  const css = styleContent(source());

  assert.match(css, /\.page-tabs\s*\{[\s\S]*?display: flex;[\s\S]*?flex-wrap: wrap;[\s\S]*?gap: 4px;[\s\S]*?margin: 0 0 18px;/);
  assert.match(css, /\.page-tab\s*\{[\s\S]*?min-height: 44px;[\s\S]*?gap: 4px;[\s\S]*?padding: 8px 8px;[\s\S]*?font-size: 13px;[\s\S]*?font-weight: 600;/);
  assert.match(css, /\.page-tab svg path,\s*\.page-tab svg rect\s*\{[\s\S]*?stroke: currentColor;[\s\S]*?stroke-width: 2;/);
  assert.match(css, /@media \(max-width: 767px\) \{[\s\S]*?\.page-tabs\s*\{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[\s\S]*?gap: 4px;[\s\S]*?\}[\s\S]*?\.page-tab\s*\{[\s\S]*?width: 100%;[\s\S]*?min-width: 0;[\s\S]*?min-height: 48px;[\s\S]*?flex-direction: column;[\s\S]*?justify-content: center;[\s\S]*?font-size: 10px;/);
  assert.match(css, /@media \(max-width: 380px\) \{[\s\S]*?\.page-tab\s*\{[\s\S]*?min-height: 46px;[\s\S]*?font-size: 9px;/);
});

test('loads News & Library content from the requested Nexora JSON sources', () => {
  const html = source();

  assert.match(html, /NEWS_LIBRARY_FILE/);
  assert.match(html, /NEWS_LIBRARY_EN:\s*'https:\/\/raw\.githubusercontent\.com\/vlink-group\/VlinkPay\/main\/news-library\/nexora-news-library-data\.json'/);
  assert.match(html, /NEWS_LIBRARY_VI:\s*'https:\/\/raw\.githubusercontent\.com\/vlink-group\/VlinkPay\/main\/news-library\/nexora-news-library-data-vi\.json'/);
  assert.match(html, /function fetchNewsLibraryContent\(sourceUrl\)/);
  assert.match(html, /fetch\(sourceUrl/);
  assert.match(html, /function normalizeNewsLibraryContent\(content\)/);
  assert.match(html, /function renderNewsLibraryContent\(content\)/);
  assert.match(html, /loadNewsLibraryContent\(\)/);
});

test('maps JSON collections to the visible requested tabs', () => {
  const html = source();

  assert.match(html, /renderNewsTab\(content\.featuredVideos,\s*content\.channelVideos\)/);
  assert.match(html, /renderInto\('compensation-plan',\s*renderCompensationPlanTab\(content\.planTopics\)\)/);
  assert.doesNotMatch(html, /renderCompensationPlanTab\(content\.planTopics,\s*content\.morePlanVideos\)/);
  assert.match(html, /renderEventZoomScheduleTab\(content\.upcomingSessions,\s*content\.upcomingEvents\)/);
  assert.doesNotMatch(html, /renderEventZoomScheduleTab\(content\.upcomingSessions,\s*content\.upcomingEvents,\s*content\.videoZoomHistory\)/);
  assert.doesNotMatch(html, /renderInto\('presentation-video'/);
});

test('does not hard-code docs/news item content into the static page', () => {
  const html = source();

  for (const hardcodedContent of [
    /VLINKPAY Gala Night \| Recognition Ceremony Recap/,
    /CryptoMap360 Launch Event 2026/,
    /VLINKPAY IOU Program/,
    /MERCHANT &amp; MOBILE ATM PROGRAM/,
    /VLINKPAY Mobile Merchant ATM \| Franchise License Benefits/,
    /ONLINE TRAINING - MAKE MONEY WITH VLINKPAY/,
    /CEO Brian Nguyen Introduces Growth Opportunities with VLINKPAY/,
    /https:\/\/www\.youtube\.com\/watch\?v=jbBM_lPAWoU/
  ]) {
    assert.doesNotMatch(html, hardcodedContent);
  }
});

test('opens media cards with Swal.fire like docs/news component', () => {
  const runtime = createNewsLibraryRuntime();

  assert.equal(typeof runtime.api.openMedia, 'function');
  assert.equal(typeof runtime.api.toYoutubeEmbedUrl, 'function');
  assert.equal(
    runtime.api.toYoutubeEmbedUrl('https://www.youtube.com/watch?v=abc123'),
    'https://www.youtube.com/embed/abc123?autoplay=1&rel=0'
  );

  runtime.api.renderNewsLibraryContent({
    featuredVideos: [{
      title: 'Launch video',
      description: 'A loaded JSON item',
      url: 'https://youtu.be/abc123',
      image: 'https://example.test/thumb.jpg',
      duration: '2:00'
    }]
  });

  const renderedNews = runtime.contentTargets.get('news').innerHTML;
  assert.match(renderedNews, /class="video-card"[^>]*data-media-url="https:\/\/youtu\.be\/abc123"/);
  assert.doesNotMatch(renderedNews, /class="video-card"[^>]*target="_blank"/);

  const clickEvent = runtime.dispatchClick({
    closest(selector) {
      if (selector !== '[data-media-url]') return null;
      return {
        getAttribute(name) {
          return {
            'data-media-title': 'Launch video',
            'data-media-url': 'https://youtu.be/abc123'
          }[name] ?? '';
        },
        textContent: 'Launch video'
      };
    }
  });

  assert.equal(clickEvent.defaultPrevented, true);
  assert.equal(clickEvent.propagationStopped, true);
  assert.equal(runtime.swalCalls.length, 1);
  assert.equal(runtime.swalCalls[0].title, 'Launch video');
  assert.match(runtime.swalCalls[0].html, /news-library-swal-frame/);
  assert.match(runtime.swalCalls[0].html, /youtube\.com\/embed\/abc123/);
  assert.equal(runtime.swalCalls[0].width, 960);
  assert.equal(runtime.swalCalls[0].showConfirmButton, false);
  assert.equal(runtime.swalCalls[0].showCloseButton, true);
  assert.match(runtime.swalCalls[0].customClass.popup, /news-library-swal-popup-video/);
  assert.equal(runtime.openCalls.length, 0);
});

test('opens PDF media previews with Swal.fire instead of custom modal DOM', () => {
  const runtime = createNewsLibraryRuntime();

  const event = {
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    }
  };

  runtime.api.openMedia(event, 'https://example.test/commission-basics.pdf', 'Commission basics');

  assert.equal(event.defaultPrevented, true);
  assert.equal(event.propagationStopped, true);
  assert.equal(runtime.swalCalls.length, 1);
  assert.equal(runtime.swalCalls[0].title, 'Commission basics');
  assert.match(runtime.swalCalls[0].html, /commission-basics\.pdf/);
  assert.match(runtime.swalCalls[0].html, /news-library-swal-frame is-document/);
  assert.match(runtime.swalCalls[0].customClass.popup, /news-library-swal-popup-document/);
  assert.equal(runtime.openCalls.length, 0);
});

test('renders Compensation Plan core topics without More Plan Videos', () => {
  const runtime = createNewsLibraryRuntime();

  runtime.api.renderNewsLibraryContent({
    planTopics: [{
      title: 'Commission basics',
      description: 'Owner compensation essentials',
      url: 'https://example.test/commission-basics.pdf'
    }],
    morePlanVideos: [{
      title: 'Legacy plan video',
      description: 'Should not render',
      url: 'https://youtu.be/legacy123'
    }]
  });

  const renderedPlan = runtime.contentTargets.get('compensation-plan').innerHTML;
  assert.match(renderedPlan, /Core topics/);
  assert.match(renderedPlan, /Commission basics/);
  assert.match(renderedPlan, /Owner compensation essentials/);
  assert.doesNotMatch(renderedPlan, /More plan videos/i);
  assert.doesNotMatch(renderedPlan, /Legacy plan video/);
});

test('omits Recent sessions from Event & Zoom Schedule even when history data exists', () => {
  const runtime = createNewsLibraryRuntime();

  runtime.api.renderNewsLibraryContent({
    upcomingSessions: [{
      day: 'Mon',
      date: 'Aug 10',
      time: '9:00 AM',
      type: 'Zoom',
      title: 'Upcoming training',
      description: 'Live session'
    }],
    videoZoomHistory: [{
      title: 'Past recording',
      description: 'Should not render',
      url: 'https://youtu.be/past123',
      date: 'Aug 1',
      time: '8:00 AM'
    }]
  });

  const renderedEvents = runtime.contentTargets.get('event-zoom-schedule').innerHTML;
  assert.match(renderedEvents, /Upcoming Zoom sessions/);
  assert.match(renderedEvents, /Upcoming training/);
  assert.doesNotMatch(renderedEvents, /Recent sessions/);
  assert.doesNotMatch(renderedEvents, /Past recording/);
  assert.doesNotMatch(renderedEvents, /history-card/);
});

test('opens event htmlContent in a modal while keeping Zoom joins external', () => {
  const runtime = createNewsLibraryRuntime();

  assert.equal(typeof runtime.api.openHtmlContent, 'function');
  runtime.api.renderNewsLibraryContent({
    upcomingEvents: [{
      day: 'Mon',
      date: 'Aug 10',
      time: '9:00 AM',
      type: 'Zoom',
      title: 'Merchant training',
      description: 'Live enablement session',
      link: 'https://zoom.us/j/123',
      primaryAction: 'Join Zoom',
      secondaryAction: 'View Details',
      htmlContent: '<p>Session agenda</p>'
    }]
  });

  const renderedEvents = runtime.contentTargets.get('event-zoom-schedule').innerHTML;
  assert.match(renderedEvents, /href="https:\/\/zoom\.us\/j\/123" target="_blank" rel="noopener noreferrer"/);
  assert.match(renderedEvents, /data-html-title="Merchant training"/);
  assert.match(renderedEvents, /data-html-content="&lt;p&gt;Session agenda&lt;\/p&gt;"/);

  const clickEvent = runtime.dispatchClick({
    closest(selector) {
      if (selector !== '[data-html-content]') return null;
      return {
        getAttribute(name) {
          return {
            'data-html-title': 'Merchant training',
            'data-html-content': '<p>Session agenda</p>'
          }[name] ?? '';
        }
      };
    }
  });

  assert.equal(clickEvent.defaultPrevented, true);
  assert.equal(clickEvent.propagationStopped, true);
  assert.equal(runtime.swalCalls.length, 1);
  assert.equal(runtime.swalCalls[0].title, 'Merchant training');
  assert.match(runtime.swalCalls[0].html, /news-library-swal-content/);
  assert.match(runtime.swalCalls[0].html, /Session agenda/);
  assert.equal(runtime.swalCalls[0].width, 860);
  assert.equal(runtime.swalCalls[0].showConfirmButton, false);
  assert.equal(runtime.swalCalls[0].showCloseButton, true);
});
