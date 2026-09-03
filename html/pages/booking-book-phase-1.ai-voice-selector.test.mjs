import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const PAGE_URL = new URL('./booking-book-phase-1.html', import.meta.url);
const RUNTIME_URL = new URL('../assets/booking-ai-voice-selector.js', import.meta.url);
const PAGE_SOURCE = readFileSync(PAGE_URL, 'utf8');

function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert.ok(element, `Expected ${selector} to exist`);
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  return element;
}

function visibleVoiceIds(document) {
  return [...document.querySelectorAll('[data-settings-voice-row]')]
    .filter((row) => row.hidden === false)
    .map((row) => row.getAttribute('data-voice-id'));
}

function loadFeature() {
  assert.ok(existsSync(RUNTIME_URL), 'booking-ai-voice-selector.js must exist');

  const spoken = [];
  const dom = new JSDOM(PAGE_SOURCE, {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    url: 'https://merchant.nexora.test/html/pages/booking-book-phase-1.html',
  });
  const { window } = dom;

  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.voice = null;
      this.lang = '';
      this.rate = 1;
      this.pitch = 1;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    }
  };
  window.speechSynthesis = {
    cancel() {},
    getVoices() {
      return [
        { name: 'Samantha', lang: 'en-US', localService: true },
        { name: 'Daniel', lang: 'en-US', localService: true },
        { name: 'Vietnamese Female', lang: 'vi-VN', localService: true },
      ];
    },
    speak(utterance) {
      spoken.push(utterance);
      utterance.onstart?.();
    },
  };

  window.eval(readFileSync(RUNTIME_URL, 'utf8'));
  assert.ok(window.NEXORA_AI_VOICE_SELECTOR, 'voice selector API must be exposed');
  window.NEXORA_AI_VOICE_SELECTOR.initialize(window.document, window);

  return { dom, spoken, window };
}

test('groups Greeting and Promotion details in two First-call SMS-style frames', () => {
  const dom = new JSDOM(PAGE_SOURCE, { pretendToBeVisual: true });
  const { document } = dom.window;
  const card = document.querySelector('[data-settings-ai-voice]');

  assert.ok(card, 'AI Voice settings card must expose a feature root');
  const groups = [...card.querySelectorAll('[data-settings-ai-content-group]')];
  assert.deepEqual(
    groups.map((group) => group.getAttribute('data-settings-ai-content-group')),
    ['greeting', 'promotion'],
  );
  assert.equal(groups[0].querySelector('.settings-label')?.textContent?.trim(), 'Greeting');
  assert.match(groups[1].querySelector('.settings-label')?.textContent ?? '', /Promotion details/);

  const reference = card.querySelector('[data-settings-first-call-sms]');
  assert.ok(reference, 'First-call SMS reference frame must remain in the card');
  const referenceStyle = dom.window.getComputedStyle(reference);
  groups.forEach((group) => {
    const groupStyle = dom.window.getComputedStyle(group);
    assert.equal(groupStyle.borderTopStyle, referenceStyle.borderTopStyle);
    assert.equal(groupStyle.borderTopWidth, referenceStyle.borderTopWidth);
    assert.equal(groupStyle.borderRadius, referenceStyle.borderRadius);
    assert.equal(groupStyle.padding, referenceStyle.padding);
  });

  const languagePosition = card.innerHTML.indexOf('data-settings-language-grid');
  const voicePosition = card.innerHTML.indexOf('data-settings-voice-field');
  const greetingPosition = card.innerHTML.indexOf('data-settings-ai-content-group="greeting"');
  const promotionPosition = card.innerHTML.indexOf('data-settings-ai-content-group="promotion"');
  const smsPosition = card.innerHTML.indexOf('data-settings-first-call-sms');
  assert.ok(languagePosition < voicePosition, 'Voice must follow AI language');
  assert.ok(voicePosition < greetingPosition, 'Greeting must follow Voice');
  assert.ok(greetingPosition < promotionPosition, 'Promotion details must follow Greeting');
  assert.ok(promotionPosition < smsPosition, 'First-call SMS must remain last');
});

test('opens an accessible library with six curated voices', () => {
  const { window } = loadFeature();
  const { document } = window;

  assert.equal(document.querySelector('[data-settings-current-voice-name]')?.textContent?.trim(), 'Carina');
  assert.match(document.querySelector('[data-settings-current-voice-description]')?.textContent ?? '', /soft, empathetic/i);
  click(window, '[data-settings-open-voice-library]');

  const dialog = document.querySelector('[data-settings-voice-dialog]');
  assert.equal(dialog?.getAttribute('aria-hidden'), 'false');
  assert.equal(document.body.classList.contains('has-settings-voice-overlay'), true);
  assert.equal(document.querySelectorAll('[data-settings-voice-row]').length, 6);
  assert.deepEqual(visibleVoiceIds(document), ['carina', 'ara', 'aurora', 'atlas', 'altair', 'cedar']);
  assert.equal(window.getComputedStyle(document.querySelector('[data-settings-voice-empty-results]')).display, 'none');
  assert.equal(document.activeElement, document.querySelector('[data-settings-voice-search]'));
});

test('loads the Voice selector runtime on the Booking page', () => {
  assert.match(PAGE_SOURCE, /<script src="\.\.\/assets\/booking-ai-voice-selector\.js"><\/script>/);
});

test('switching AI Language to Vietnamese replaces Greeting with Vietnamese content', () => {
  const { window } = loadFeature();
  const { document } = window;

  click(window, '[data-settings-language="vi"]');

  assert.equal(
    document.querySelector('[data-settings-greeting]')?.value,
    'Xin chào! Cảm ơn bạn đã gọi đến Bitcoin Nail Bar. Tôi là trợ lý AI của tiệm. Tôi có thể giúp bạn đặt lịch hẹn, kiểm tra giá hoặc giải đáp thắc mắc. Hôm nay tôi có thể giúp gì cho bạn?',
  );
  assert.equal(document.querySelector('[data-settings-language="vi"]')?.getAttribute('aria-pressed'), 'true');
});

test('previews the current Vietnamese Greeting with a Vietnamese speech voice', () => {
  const { spoken, window } = loadFeature();
  const { document } = window;
  const customGreeting = 'Xin chào chị Linh! Bitcoin Nail Bar có thể giúp chị đặt lịch hôm nay.';

  click(window, '[data-settings-language="vi"]');
  const greeting = document.querySelector('[data-settings-greeting]');
  greeting.value = customGreeting;
  greeting.dispatchEvent(new window.Event('input', { bubbles: true }));
  click(window, '[data-settings-open-voice-library]');
  click(window, '[data-settings-preview-voice="carina"]');

  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].text, customGreeting);
  assert.equal(spoken[0].lang, 'vi-VN');
  assert.equal(spoken[0].voice?.lang, 'vi-VN');
});

test('filters the real voice library by search text and gender', () => {
  const { window } = loadFeature();
  const { document } = window;
  click(window, '[data-settings-open-voice-library]');

  const search = document.querySelector('[data-settings-voice-search]');
  assert.ok(search instanceof window.HTMLInputElement);
  search.value = 'warm';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.deepEqual(visibleVoiceIds(document), ['ara']);
  assert.equal(window.getComputedStyle(document.querySelector('[data-voice-id="carina"]')).display, 'none');
  assert.notEqual(window.getComputedStyle(document.querySelector('[data-voice-id="ara"]')).display, 'none');

  search.value = '';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  click(window, '[data-settings-voice-gender-toggle]');
  click(window, '[data-settings-voice-gender-option="male"]');
  assert.deepEqual(visibleVoiceIds(document), ['atlas', 'altair', 'cedar']);
  assert.equal(document.querySelector('[data-settings-voice-gender-label]')?.textContent?.trim(), 'Male');
});

test('previews only one voice at a time and exposes its playing state', () => {
  const { spoken, window } = loadFeature();
  const { document } = window;
  click(window, '[data-settings-open-voice-library]');

  click(window, '[data-settings-preview-voice="ara"]');
  assert.equal(spoken.length, 1);
  assert.match(spoken[0].text, /Bitcoin Nail Bar/);
  assert.equal(document.querySelector('[data-voice-id="ara"]')?.getAttribute('data-playing'), 'true');
  assert.equal(document.querySelector('[data-settings-preview-voice="ara"]')?.getAttribute('aria-label'), 'Stop Ara preview');

  click(window, '[data-settings-preview-voice="atlas"]');
  assert.equal(spoken.length, 2);
  assert.equal(document.querySelector('[data-voice-id="ara"]')?.getAttribute('data-playing'), 'false');
  assert.equal(document.querySelector('[data-voice-id="atlas"]')?.getAttribute('data-playing'), 'true');
});

test('applies a pending voice only after confirmation and saves it with Settings', () => {
  const { window } = loadFeature();
  const { document } = window;
  click(window, '[data-settings-open-voice-library]');

  click(window, '[data-settings-select-voice="aurora"]');
  assert.equal(document.querySelector('[data-settings-current-voice-name]')?.textContent?.trim(), 'Carina');
  assert.equal(document.querySelector('[data-voice-id="aurora"]')?.getAttribute('aria-selected'), 'true');
  assert.equal(document.querySelector('[data-settings-use-voice]')?.disabled, false);

  click(window, '[data-settings-use-voice]');
  assert.equal(document.querySelector('[data-settings-current-voice-name]')?.textContent?.trim(), 'Aurora');
  assert.equal(document.querySelector('[data-settings-voice-dialog]')?.getAttribute('aria-hidden'), 'true');
  assert.match(document.querySelector('[data-settings-status]')?.textContent ?? '', /unsaved/i);

  click(window, '[data-settings-action="save"]');
  assert.match(document.querySelector('[data-settings-voice-toast-message]')?.textContent ?? '', /Aurora is now your AI voice/i);
  assert.equal(document.querySelector('[data-settings-voice-toast]')?.getAttribute('aria-hidden'), 'false');
});

test('selects a pending voice when its circular check control is clicked', () => {
  const { window } = loadFeature();
  const { document } = window;
  click(window, '[data-settings-open-voice-library]');

  const check = click(window, '[data-settings-voice-check="atlas"]');

  assert.ok(check instanceof window.HTMLButtonElement);
  assert.equal(document.querySelector('[data-voice-id="atlas"]')?.getAttribute('aria-selected'), 'true');
  assert.equal(document.querySelector('[data-settings-pending-voice-name]')?.textContent?.trim(), 'Atlas');
  assert.equal(document.querySelector('[data-settings-current-voice-name]')?.textContent?.trim(), 'Carina');
});

test('closes the library with Escape and restores focus to its trigger', () => {
  const { window } = loadFeature();
  const { document } = window;
  const trigger = document.querySelector('[data-settings-open-voice-library]');
  assert.ok(trigger instanceof window.HTMLButtonElement);

  click(window, '[data-settings-open-voice-library]');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  assert.equal(document.querySelector('[data-settings-voice-dialog]')?.getAttribute('aria-hidden'), 'true');
  assert.equal(document.activeElement, trigger);
});
