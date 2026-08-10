import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const HTML_URL = new URL('./news-library.component.html', import.meta.url);
const SCSS_URL = new URL('./news-library.component.scss', import.meta.url);
const TS_URL = new URL('./news-library.component.ts', import.meta.url);

function read(url) {
  return readFileSync(url, 'utf8');
}

test('News Library tabs render only News, Event & Zoom, and Compensation Plan', () => {
  const html = read(HTML_URL);
  const ts = read(TS_URL);

  assert.match(ts, /readonly tabs:[\s\S]*\{ id: 'news', labelKey: 'news' \}[\s\S]*\{ id: 'events', labelKey: 'event-zoom' \}[\s\S]*\{ id: 'plan', labelKey: 'compensation-plan' \}/);
  assert.doesNotMatch(ts, /labelKey: 'presentation-video'/);
  assert.doesNotMatch(ts, /id: 'content'/);
  assert.doesNotMatch(html, /activeTab\(\) === 'content'/);
  assert.doesNotMatch(html, /solution-presentations|training-videos|featured-content/);
  assert.doesNotMatch(html, /openPresentationPopup/);
});

test('News Library plan and events omit removed secondary sections', () => {
  const html = read(HTML_URL);
  const ts = read(TS_URL);
  const scss = read(SCSS_URL);

  assert.doesNotMatch(html, /morePlanVideos|more-plan-videos/);
  assert.doesNotMatch(html, /videoZoomHistory|recent-sessions|recent-video-item|zoom-history/);
  assert.doesNotMatch(ts, /openPresentationPopup|getZoomHistoryIcon/);
  assert.doesNotMatch(scss, /recent-session-item|recent-video-item|zoom-history/);
});

test('News Library styling uses Nexora Touch color system for cards and tab menu', () => {
  const scss = read(SCSS_URL);
  const retiredWarmPalette = /#(?:d97706|b45309|f59e0b|ea580c|c2410c|fff7ed|ffedd5|fed7aa|cf8a54|fffaf3|e6b98a|f7f2ec|efe6dc|eadfce|f3e9dc|fffbeb|fef3c7|92400e|5f5b57|221f1f)\b/i;

  assert.match(scss, /--news-brand:\s*var\(--nexora-brand,\s*#4648d8\)/);
  assert.match(scss, /--news-electric:\s*var\(--nexora-electric,\s*#2b59ff\)/);
  assert.match(scss, /--news-violet:\s*var\(--nexora-violet,\s*#8e4df8\)/);
  assert.match(scss, /\.news-library-tab-group[\s\S]*--mdc-tab-indicator-active-indicator-color:\s*transparent/);
  assert.match(scss, /\.mat-mdc-tab\.mdc-tab--active[\s\S]*linear-gradient\(90deg,\s*var\(--news-electric\),\s*var\(--news-violet\)\)/);
  assert.match(scss, /\.mat-mdc-tab\.mdc-tab--active \.mdc-tab__text-label[\s\S]*color:\s*#fff/);
  assert.match(scss, /\.news-view-more-toggle[\s\S]*linear-gradient\(135deg,\s*var\(--news-electric\),\s*var\(--news-violet\)\)/);
  assert.doesNotMatch(scss, retiredWarmPalette);
});
