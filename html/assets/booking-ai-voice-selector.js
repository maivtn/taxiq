(function(global) {
  'use strict';

  var VOICES = {
    carina: { id: 'carina', name: 'Carina', gender: 'female', description: 'Soft, empathetic, and soothing.', rate: 0.94, pitch: 1.06 },
    ara: { id: 'ara', name: 'Ara', gender: 'female', description: 'Warm and friendly.', rate: 1.02, pitch: 1.09 },
    aurora: { id: 'aurora', name: 'Aurora', gender: 'female', description: 'Serene, steady, and radiant.', rate: 0.9, pitch: 1.02 },
    atlas: { id: 'atlas', name: 'Atlas', gender: 'male', description: 'Confident, commanding, and reassuring.', rate: 0.96, pitch: 0.86 },
    altair: { id: 'altair', name: 'Altair', gender: 'male', description: 'Elegant, refined, and effortlessly premium.', rate: 0.91, pitch: 0.9 },
    cedar: { id: 'cedar', name: 'Cedar', gender: 'male', description: 'Calm, grounded, and trustworthy.', rate: 0.88, pitch: 0.82 }
  };

  var PREVIEW_TEXT = "Hi, thanks for calling Bitcoin Nail Bar. I'm your AI assistant. How can I help you today?";
  var LANGUAGE_SETTINGS = {
    auto: {
      greeting: "Hi! Thanks for calling Bitcoin Nail Bar. I'm your bilingual AI assistant — I can help you book an appointment, check pricing, or answer questions in English or Vietnamese. How can I help today?",
      speechLanguage: 'en-US',
      status: 'Auto is on: the AI automatically detects Vietnamese or English when a customer calls.',
      label: 'VI + EN Auto'
    },
    vi: {
      greeting: 'Xin chào! Cảm ơn bạn đã gọi đến Bitcoin Nail Bar. Tôi là trợ lý AI của tiệm. Tôi có thể giúp bạn đặt lịch hẹn, kiểm tra giá hoặc giải đáp thắc mắc. Hôm nay tôi có thể giúp gì cho bạn?',
      speechLanguage: 'vi-VN',
      status: 'Vietnamese is active: the AI greets and answers customers in Vietnamese first.',
      label: 'VI'
    },
    en: {
      greeting: 'Hello! Thank you for calling Bitcoin Nail Bar. This is the AI assistant. I can help you book an appointment, check prices, or answer questions. How can I help today?',
      speechLanguage: 'en-US',
      status: 'English is active: AI greets and answers customers in English.',
      label: 'EN'
    }
  };
  var FEMALE_HINTS = ['samantha', 'ava', 'victoria', 'karen', 'moira', 'tessa', 'zira', 'female'];
  var MALE_HINTS = ['daniel', 'alex', 'fred', 'aaron', 'arthur', 'guy', 'david', 'male'];

  function initialize(doc, host) {
    doc = doc || global.document;
    host = host || global;

    var root = doc && doc.querySelector('[data-settings-ai-voice]');
    var dialog = doc && doc.querySelector('[data-settings-voice-dialog]');
    if (!root || !dialog) return null;
    if (root.getAttribute('data-settings-voice-ready') === 'true') return root.__voiceSelector || null;

    var searchInput = dialog.querySelector('[data-settings-voice-search]');
    var genderToggle = dialog.querySelector('[data-settings-voice-gender-toggle]');
    var genderMenu = dialog.querySelector('[data-settings-voice-gender-menu]');
    var genderLabel = dialog.querySelector('[data-settings-voice-gender-label]');
    var rows = Array.prototype.slice.call(dialog.querySelectorAll('[data-settings-voice-row]'));
    var useVoiceButton = dialog.querySelector('[data-settings-use-voice]');
    var pendingName = dialog.querySelector('[data-settings-pending-voice-name]');
    var currentName = root.querySelector('[data-settings-current-voice-name]');
    var currentDescription = root.querySelector('[data-settings-current-voice-description]');
    var emptyResults = dialog.querySelector('[data-settings-voice-empty-results]');
    var libraryTrigger = root.querySelector('[data-settings-open-voice-library]');
    var status = doc.querySelector('[data-settings-status]');
    var toast = doc.querySelector('[data-settings-voice-toast]');
    var toastMessage = doc.querySelector('[data-settings-voice-toast-message]');
    var greeting = root.querySelector('[data-settings-greeting]');
    var greetingCount = root.querySelector('[data-settings-greeting-count]');
    var languageButtons = Array.prototype.slice.call(root.querySelectorAll('[data-settings-language]'));
    var languageStatus = root.querySelector('[data-settings-language-status]');
    var currentVoiceId = VOICES[root.getAttribute('data-settings-voice-id')] ? root.getAttribute('data-settings-voice-id') : 'carina';
    var savedVoiceId = currentVoiceId;
    var pendingVoiceId = currentVoiceId;
    var genderFilter = 'all';
    var playingVoiceId = null;
    var toastTimer = null;

    function setLanguage(language, replaceGreeting) {
      var nextLanguage = LANGUAGE_SETTINGS[language] ? language : 'auto';
      var languageSettings = LANGUAGE_SETTINGS[nextLanguage];

      languageButtons.forEach(function(button) {
        var active = button.getAttribute('data-settings-language') === nextLanguage;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      root.setAttribute('data-settings-active-language', nextLanguage);

      if (replaceGreeting !== false && greeting) {
        greeting.value = languageSettings.greeting;
        greeting.dispatchEvent(new host.Event('input', { bubbles: true }));
      }
      if (replaceGreeting !== false && languageStatus) languageStatus.textContent = languageSettings.status;
      if (replaceGreeting !== false && status) status.textContent = 'AI language set to: ' + languageSettings.label + '.';
    }

    function showToast(message) {
      if (!toast || !toastMessage) return;
      toastMessage.textContent = message;
      toast.setAttribute('aria-hidden', 'false');
      if (toastTimer) host.clearTimeout(toastTimer);
      toastTimer = host.setTimeout(function() {
        toast.setAttribute('aria-hidden', 'true');
      }, 3600);
    }

    function currentLanguageSettings() {
      var language = root.getAttribute('data-settings-active-language') || 'auto';
      return LANGUAGE_SETTINGS[language] || LANGUAGE_SETTINGS.auto;
    }

    function systemVoiceFor(profile, speechLanguage) {
      if (!host.speechSynthesis || typeof host.speechSynthesis.getVoices !== 'function') return null;
      var languagePrefix = speechLanguage.split('-')[0];
      var available = host.speechSynthesis.getVoices().filter(function(voice) {
        return new RegExp('^' + languagePrefix + '(-|_)', 'i').test(voice.lang || '');
      });
      var hints = profile.gender === 'male' ? MALE_HINTS : FEMALE_HINTS;
      return available.find(function(voice) {
        return hints.some(function(hint) { return voice.name.toLowerCase().indexOf(hint) !== -1; });
      }) || available[0] || null;
    }

    function renderRows() {
      var query = searchInput.value.trim().toLowerCase();
      var visibleCount = 0;

      rows.forEach(function(row) {
        var voice = VOICES[row.getAttribute('data-voice-id')];
        var searchable = (voice.name + ' ' + voice.description + ' ' + voice.gender).toLowerCase();
        var visible = (genderFilter === 'all' || voice.gender === genderFilter) && (!query || searchable.indexOf(query) !== -1);
        var selected = voice.id === pendingVoiceId;
        var playing = voice.id === playingVoiceId;
        var preview = row.querySelector('[data-settings-preview-voice]');

        row.hidden = !visible;
        if (visible) visibleCount += 1;
        row.setAttribute('aria-selected', String(selected));
        row.setAttribute('data-playing', String(playing));
        preview.setAttribute('aria-label', (playing ? 'Stop' : 'Play') + ' ' + voice.name + ' preview');
      });

      emptyResults.hidden = visibleCount !== 0;
      pendingName.textContent = VOICES[pendingVoiceId].name;
      useVoiceButton.disabled = pendingVoiceId === currentVoiceId;
    }

    function stopSpeech() {
      if (host.speechSynthesis && typeof host.speechSynthesis.cancel === 'function') host.speechSynthesis.cancel();
      playingVoiceId = null;
      renderRows();
    }

    function speakVoice(voiceId, text) {
      var profile = VOICES[voiceId];
      if (!profile || !host.speechSynthesis || typeof host.SpeechSynthesisUtterance !== 'function') {
        showToast('Voice preview is not supported in this browser.');
        return;
      }

      if (playingVoiceId === voiceId) {
        stopSpeech();
        return;
      }

      host.speechSynthesis.cancel();
      playingVoiceId = null;
      renderRows();

      var languageSettings = currentLanguageSettings();
      var previewText = text || (greeting && greeting.value.trim()) || PREVIEW_TEXT;
      var utterance = new host.SpeechSynthesisUtterance(previewText);
      utterance.lang = languageSettings.speechLanguage;
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;
      var browserVoice = systemVoiceFor(profile, languageSettings.speechLanguage);
      if (browserVoice) utterance.voice = browserVoice;
      utterance.onstart = function() {
        playingVoiceId = voiceId;
        renderRows();
      };
      utterance.onend = function() {
        if (playingVoiceId === voiceId) {
          playingVoiceId = null;
          renderRows();
        }
      };
      utterance.onerror = function() {
        playingVoiceId = null;
        renderRows();
        showToast('Could not play this preview. Check your browser audio settings.');
      };
      host.speechSynthesis.speak(utterance);
    }

    function closeGenderMenu() {
      genderMenu.hidden = true;
      genderToggle.setAttribute('aria-expanded', 'false');
    }

    function setGenderFilter(nextFilter) {
      genderFilter = nextFilter;
      genderLabel.textContent = nextFilter === 'all' ? 'All voices' : nextFilter.charAt(0).toUpperCase() + nextFilter.slice(1);
      Array.prototype.forEach.call(dialog.querySelectorAll('[data-settings-voice-gender-option]'), function(option) {
        var selected = option.getAttribute('data-settings-voice-gender-option') === nextFilter;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-selected', String(selected));
      });
      closeGenderMenu();
      renderRows();
    }

    function openLibrary() {
      pendingVoiceId = currentVoiceId;
      searchInput.value = '';
      setGenderFilter('all');
      stopSpeech();
      dialog.setAttribute('aria-hidden', 'false');
      doc.body.classList.add('has-settings-voice-overlay');
      renderRows();
      searchInput.focus();
    }

    function closeLibrary(restoreFocus) {
      stopSpeech();
      closeGenderMenu();
      dialog.setAttribute('aria-hidden', 'true');
      doc.body.classList.remove('has-settings-voice-overlay');
      if (restoreFocus !== false) libraryTrigger.focus();
    }

    function applyVoice() {
      if (pendingVoiceId === currentVoiceId) return;
      currentVoiceId = pendingVoiceId;
      var voice = VOICES[currentVoiceId];
      root.setAttribute('data-settings-voice-id', currentVoiceId);
      currentName.textContent = voice.name;
      currentDescription.textContent = (voice.gender === 'female' ? 'Female' : 'Male') + ' · ' + voice.description;
      if (status) status.textContent = voice.name + ' selected · unsaved change. Click Save Settings to apply.';
      closeLibrary();
    }

    function saveVoice() {
      savedVoiceId = currentVoiceId;
      var voice = VOICES[savedVoiceId];
      showToast(voice.name + ' is now your AI voice.');
      if (status) status.textContent = 'Settings saved. ' + voice.name + ' is now your AI voice.';
    }

    libraryTrigger.addEventListener('click', openLibrary);
    dialog.querySelector('[data-settings-close-voice-library]').addEventListener('click', function() { closeLibrary(); });
    dialog.querySelector('[data-settings-cancel-voice-library]').addEventListener('click', function() { closeLibrary(); });
    useVoiceButton.addEventListener('click', applyVoice);
    searchInput.addEventListener('input', renderRows);

    languageButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        setLanguage(button.getAttribute('data-settings-language'));
      });
    });

    genderToggle.addEventListener('click', function() {
      genderMenu.hidden = !genderMenu.hidden;
      genderToggle.setAttribute('aria-expanded', String(!genderMenu.hidden));
    });

    Array.prototype.forEach.call(dialog.querySelectorAll('[data-settings-voice-gender-option]'), function(option) {
      option.addEventListener('click', function() {
        setGenderFilter(option.getAttribute('data-settings-voice-gender-option'));
      });
    });

    Array.prototype.forEach.call(dialog.querySelectorAll('[data-settings-select-voice]'), function(button) {
      button.addEventListener('click', function() {
        pendingVoiceId = button.getAttribute('data-settings-select-voice');
        renderRows();
      });
    });

    Array.prototype.forEach.call(dialog.querySelectorAll('[data-settings-preview-voice]'), function(button) {
      button.addEventListener('click', function() {
        speakVoice(button.getAttribute('data-settings-preview-voice'));
      });
    });

    var greetingPreview = root.querySelector('[data-settings-preview-greeting]');
    if (greetingPreview && greeting) {
      greetingPreview.addEventListener('click', function() {
        speakVoice(currentVoiceId, greeting.value.trim() || PREVIEW_TEXT);
      });
    }

    if (greeting && greetingCount) {
      greetingCount.textContent = String(greeting.value.length);
      greeting.addEventListener('input', function() {
        greetingCount.textContent = String(greeting.value.length);
      });
    }

    dialog.addEventListener('click', function(event) {
      if (event.target === dialog) closeLibrary();
    });

    doc.addEventListener('click', function(event) {
      if (!genderMenu.hidden && !event.target.closest('.settings-voice-filter-wrap')) closeGenderMenu();
      if (event.target.closest('[data-settings-action="save"]')) saveVoice();
    });

    doc.addEventListener('keydown', function(event) {
      if (dialog.getAttribute('aria-hidden') === 'true') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!genderMenu.hidden) closeGenderMenu();
        else closeLibrary();
        return;
      }

      if (event.key === 'Tab') {
        var focusable = Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function(element) {
          return !element.closest('[hidden]');
        });
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && doc.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && doc.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    var activeLanguageButton = root.querySelector('[data-settings-language][aria-pressed="true"]');
    setLanguage(activeLanguageButton ? activeLanguageButton.getAttribute('data-settings-language') : 'auto', false);
    root.setAttribute('data-settings-voice-ready', 'true');
    renderRows();

    var controller = {
      open: openLibrary,
      close: closeLibrary,
      preview: speakVoice,
      setLanguage: setLanguage,
      getCurrentVoiceId: function() { return currentVoiceId; },
      getSavedVoiceId: function() { return savedVoiceId; }
    };
    root.__voiceSelector = controller;
    return controller;
  }

  global.NEXORA_AI_VOICE_SELECTOR = {
    VOICES: VOICES,
    initialize: initialize
  };

  if (global.document) initialize(global.document, global);
})(window);
