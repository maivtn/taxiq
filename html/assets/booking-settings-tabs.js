(function () {
  'use strict';

  var root = document.getElementById('panel-settings');
  var tablist = root && root.querySelector('[data-settings-tabs]');
  if (!tablist || tablist.dataset.initialized === 'true') return;

  var shell = root.querySelector('.settings-shell');
  var tabs = Array.from(tablist.querySelectorAll('[data-settings-tab]'));
  var panels = Array.from(root.querySelectorAll('[data-settings-tab-panel]'));
  var saveBar = root.querySelector('.settings-save-bar');
  var voicePanel = root.querySelector('[data-settings-tab-panel="voice"]');

  var sections = {
    information: ['.settings-salon-name-field', '.settings-hours', '[data-settings-holiday-card]', '[data-settings-booking-policies-card]'],
    services: ['.settings-service-pricing-card'],
    voice: ['[data-settings-ai-voice]', '[data-settings-knowledge]', '[data-settings-booking-sms-card]'],
    team: ['.settings-team-card']
  };

  Object.keys(sections).forEach(function (name) {
    var panel = panels.find(function (item) {
      return item.dataset.settingsTabPanel === name;
    });
    sections[name].forEach(function (selector) {
      var node = root.querySelector(selector);
      var card = node && node.closest('.settings-card');
      if (panel && card) panel.appendChild(card);
    });
  });

  Array.from(shell.children).forEach(function (container) {
    if (!container.matches('.settings-grid, .settings-two-grid')) return;
    while (container.firstChild) shell.insertBefore(container.firstChild, saveBar);
    container.remove();
  });

  var saveBarAnchor = document.createComment('settings-save-bar');
  if (saveBar) saveBar.parentNode.insertBefore(saveBarAnchor, saveBar);

  function syncSectionUrl(name) {
    var url = new URL(window.location.href);
    url.searchParams.set('tab', 'settings');
    url.hash = 'settings-' + name;
    if (url.href === window.location.href) return;
    var state = Object.assign({}, window.history.state, { tab: 'settings' });
    window.history.pushState(state, '', url.search + url.hash);
  }

  function select(name, focus, updateUrl) {
    var selected = tabs.find(function (button) { return button.dataset.settingsTab === name; });
    if (!selected) return;
    tabs.forEach(function (button) {
      var active = button === selected;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      button.classList.toggle('is-active', active);
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.settingsTabPanel !== name;
    });
    if (saveBar) {
      if (name === 'voice' && voicePanel) voicePanel.appendChild(saveBar);
      else saveBarAnchor.parentNode.insertBefore(saveBar, saveBarAnchor.nextSibling);
    }
    shell.dataset.settingsActiveSection = name;
    if (updateUrl) syncSectionUrl(name);
    if (focus) {
      selected.focus();
      if (selected.scrollIntoView) selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  function selectFromUrl() {
    var name = window.location.hash ? window.location.hash.replace(/^#settings-/, '') : 'information';
    if (name === 'hours') name = 'information';
    if (name === 'knowledge') name = 'voice';
    if (!tabs.some(function (button) { return button.dataset.settingsTab === name; })) return;
    select(name, false);
  }

  tablist.addEventListener('click', function (event) {
    var button = event.target.closest('[data-settings-tab]');
    if (button && tablist.contains(button)) select(button.dataset.settingsTab, false, true);
  });

  tablist.addEventListener('keydown', function (event) {
    var button = event.target.closest('[data-settings-tab]');
    var index = tabs.indexOf(button);
    if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    select(tabs[index].dataset.settingsTab, true, true);
  });

  tablist.dataset.initialized = 'true';
  tablist.hidden = false;
  select('information', false);
  selectFromUrl();
  window.addEventListener('hashchange', selectFromUrl);
  window.addEventListener('popstate', selectFromUrl);
})();
