/* Dashboard and Analytics content reused from html/assets/app.js.
 * The original Tax IQ shell, filing flows and other legacy routes are not imported. */
(function () {
  'use strict';
  var data = window.NEXORA_TAXIQ_BUSINESS;
  var dialog = document.getElementById('taxiq-business-dialog');
  var lastFocus;
  function node(tag, text, className) {
    var element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function badge(value) {
    var tone = /posted|active|confirmed/i.test(value) ? 'success' : /failed|high|missing/i.test(value) ? 'danger' : 'warning';
    return node('span',value,'taxiq-status ' + tone);
  }
  function empty(parent) {
    var content = node('div','','taxiq-empty');
    content.append(node('strong','No records yet.'),node('span','Add a record or adjust filters to continue.'));
    parent.appendChild(content);
  }
  function metrics(id, entries) {
    var tones = {green:'success',cyan:'info',yellow:'warning',red:'danger',blue:'primary'};
    entries.forEach(function (entry) {
      var card = entry[4] === 'ocr' ? document.createElement('a') : document.createElement('section');
      card.className = 'taxiq-metric ' + (tones[entry[3]] || entry[3]);
      if (card.tagName === 'A') card.href = 'tax-iq-receipts.html';
      card.append(node('span',entry[0]),node('strong',entry[1]),node('small',entry[2]));
      document.getElementById(id).appendChild(card);
    });
  }
  function runLink(id) {
    var button = node('button',id,'taxiq-run-link taxiq-mono');
    button.type = 'button';button.dataset.taxiqRun = id;
    return button;
  }
  function rows(id, records, columns) {
    var tbody = document.getElementById(id);tbody.replaceChildren();
    records.forEach(function (record) {
      var tr = document.createElement('tr');
      columns.forEach(function (column) {
        var td = document.createElement('td');
        if (column === 0) td.appendChild(runLink(record[0]));
        else if (column === 8) td.appendChild(badge(record[8]));
        else td.textContent = record[column];
        if ([5,6,7].includes(column)) td.className = 'taxiq-numeric';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    if (!records.length) {
      var tr = document.createElement('tr'), td = document.createElement('td');
      td.colSpan = columns.length;empty(td);tr.appendChild(td);tbody.appendChild(tr);
    }
  }
  function bars(id, records) {
    var parent = document.getElementById(id);parent.replaceChildren();
    if (!records.length) return empty(parent);
    var max = Math.max.apply(null,records.map(function (record) { return record.value; }).concat(1));
    records.forEach(function (record) {
      var row = node('div','','taxiq-bar-row'), label = node('div','','taxiq-bar-label');
      label.append(node('strong',record.label),node('small',record.sub));
      var track = node('div','','taxiq-bar-track'), fill = node('div','','taxiq-bar-fill ' + record.tone);
      fill.style.width = (record.value > 0 ? Math.max(8,record.value/max*100) : 0) + '%';
      track.setAttribute('aria-hidden','true');track.appendChild(fill);
      row.append(label,track,node('strong',record.display,'taxiq-bar-value'));parent.appendChild(row);
    });
  }
  function showRisk() {
    var period = document.getElementById('taxiq-risk-period').value;
    var selected = data.runs.filter(function (run) {
      if (period === 'all') return true;
      var date = new Date(run[2]), month = date.getMonth();
      return date.getFullYear() === 2026 && (period === 'ytd' || (period === 'q1' ? month < 3 : month >= 3 && month < 6));
    });
    bars('taxiq-risk-bars',selected.map(function (run) {
      var risk = Number(run[7]), value = Number.isFinite(risk) ? risk : 0;
      return {label:run[0],value:value,display:run[7],sub:run[1],tone:!Number.isFinite(risk)?'muted':value>50?'danger':value>25?'warning':'success'};
    }));
    rows('taxiq-risk-runs',selected,[0,1,7,8]);
  }
  metrics('taxiq-dashboard-metrics',data.metrics);
  metrics('taxiq-analytics-metrics',data.analyticsMetrics);
  rows('taxiq-runs',data.runs.slice(0,5),[0,1,2,5,6,7,8]);
  data.exceptions.forEach(function (issue) {
    var card = node('div','','taxiq-issue ' + (issue[2] === 'High' ? 'danger' : 'warning'));
    var button = node('button',issue[1],'taxiq-issue-link');button.type='button';button.dataset.taxiqIssue=issue[0];
    card.append(button,node('p',issue[6] + ' Owner: ' + issue[3] + '.'));
    document.getElementById('taxiq-issues').appendChild(card);
  });
  bars('taxiq-jurisdiction-bars',data.jurisdictionChart);
  data.jurisdictions.forEach(function (jurisdiction) {
    var tr = document.createElement('tr');
    [jurisdiction[1],jurisdiction[5],jurisdiction[6]].forEach(function (value) { tr.appendChild(node('td',value)); });
    document.getElementById('taxiq-deposit-calendar').appendChild(tr);
  });
  document.getElementById('taxiq-risk-period').addEventListener('change',showRisk);
  showRisk();
  function showDialog(title, fields, trigger) {
    lastFocus = trigger;
    document.getElementById('taxiq-business-dialog-title').textContent = title;
    var details = document.getElementById('taxiq-business-detail');details.replaceChildren();
    fields.forEach(function (field) { var row = document.createElement('div');row.append(node('dt',field[0]),node('dd',field[1]));details.appendChild(row); });
    dialog.showModal();
  }
  document.addEventListener('click',function (event) {
    var runButton = event.target.closest('[data-taxiq-run]');
    if (runButton) {
      var run = data.runs.find(function (item) { return item[0] === runButton.dataset.taxiqRun; });
      if (run) showDialog(run[0],[['Run ID',run[0]],['Period',run[1]],['Pay Date',run[2]],['Gross',run[5]],['Tax',run[6]],['Risk',run[7]],['Status',run[8]]],runButton);
    }
    var issueButton = event.target.closest('[data-taxiq-issue]');
    if (issueButton) {
      var issue = data.exceptions.find(function (item) { return item[0] === issueButton.dataset.taxiqIssue; });
      if (issue) showDialog(issue[1],[['ID',issue[0]],['Type',issue[1]],['Severity',issue[2]],['Owner',issue[3]],['Status',issue[4]],['Run',issue[5]],['Description',issue[6]]],issueButton);
    }
  });
  document.querySelectorAll('[data-taxiq-close]').forEach(function (button) { button.addEventListener('click',function () { dialog.close(); }); });
  dialog.addEventListener('close',function () { if(lastFocus && lastFocus.isConnected) lastFocus.focus(); });
  var tabs = Array.from(document.querySelectorAll('[data-taxiq-tab]'));
  function choose(value, updateURL) {
    var selected = value === 'analytics' ? 'analytics' : 'dashboard';
    tabs.forEach(function (tab) {
      var active = tab.dataset.taxiqTab === selected;
      tab.setAttribute('aria-selected',String(active));tab.tabIndex = active ? 0 : -1;
      document.getElementById('taxiq-' + tab.dataset.taxiqTab).hidden = !active;
    });
    if(updateURL){var url=new URL(location.href);url.searchParams.set('tab',selected);history.pushState({},'',url);}
  }
  tabs.forEach(function (tab,index) {
    tab.addEventListener('click',function () { choose(tab.dataset.taxiqTab,true); });
    tab.addEventListener('keydown',function (event) {
      var next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:-1;
      if(next<0)return;event.preventDefault();tabs[next].focus();choose(tabs[next].dataset.taxiqTab,true);
    });
  });
  window.addEventListener('popstate',function () { choose(new URLSearchParams(location.search).get('tab'),false); });
  choose(new URLSearchParams(location.search).get('tab'),false);
})();
