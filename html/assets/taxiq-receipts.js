/* Reuses the OCR Vault summary/filter/table layout from html/assets/app.js.
 * PO scope: business Receipt library only. No payroll, OCR, approval or filing flow. */
(function () {
  'use strict';
  var records = window.NEXORA_TAXIQ_RECEIPTS;
  var table = document.getElementById('taxiq-receipts');
  var dialog = document.getElementById('taxiq-dialog');
  var filters = ['status','category','source'].map(function (name) { return document.getElementById('taxiq-' + name); });
  var lastFocus;
  function element(tag, value, className) {
    var node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }
  function statusTone(value) { return value === 'Approved' ? 'success' : value === 'Processing' ? 'info' : 'warning'; }
  var approved = records.filter(function (row) { return /Approved|Extracted/.test(row[5]); });
  var review = records.filter(function (row) { return /Needs Review|Missing purpose/.test(row[5]); });
  var metrics = [
    ['Receipts',String(records.length),'Keep documents easy to find and share for review.','primary'],
    ['Approved',String(approved.length),'Approved & extracted','success'],
    ['Needs Review',String(review.length),'Low confidence or missing field','warning'],
    ['Sources',String(new Set(records.map(function (row) { return row[4]; })).size),'Camera · Upload · Email · Payout','info']
  ];
  metrics.forEach(function (data) {
    var card = element('section','','taxiq-metric ' + data[3]);
    card.append(element('span',data[0]),element('strong',data[1]),element('small',data[2]));
    document.getElementById('taxiq-metrics').appendChild(card);
  });
  function render() {
    table.replaceChildren();
    var values = filters.map(function (select) { return select.selectedIndex ? select.value : ''; });
    records.filter(function (row) {
      return (!values[0] || row[5] === values[0]) && (!values[1] || row[2] === values[1]) && (!values[2] || row[4] === values[2]);
    }).forEach(function (row) {
      var tr = document.createElement('tr');
      [row[0],row[1],row[2],row[3],row[4],row[7],row[8],row[5],row[6]].forEach(function (value,index) {
        var td = element('td',value,index === 0 ? 'taxiq-mono' : '');
        if (index === 7) td.replaceChildren(element('span',value,'taxiq-status ' + statusTone(value)));
        tr.appendChild(td);
      });
      var actions = document.createElement('td');
      var view = element('button','View','taxiq-button');
      view.type = 'button';
      view.dataset.receiptId = row[0];
      actions.appendChild(view);tr.appendChild(actions);table.appendChild(tr);
    });
    if (!table.children.length) {
      var tr = document.createElement('tr'), td = element('td','','taxiq-empty');
      td.colSpan = 10;
      td.append(element('strong','No records yet.'),element('span','Add a record or adjust filters to continue.'));
      tr.appendChild(td);table.appendChild(tr);
    }
  }
  filters.forEach(function (filter) { filter.addEventListener('change',render); });
  table.addEventListener('click',function (event) {
    var button = event.target.closest('[data-receipt-id]');
    if (!button) return;
    var row = records.find(function (item) { return item[0] === button.dataset.receiptId; });
    lastFocus = button;
    document.getElementById('taxiq-dialog-title').textContent = row[1];
    var details = document.getElementById('taxiq-detail');details.replaceChildren();
    [['ID',row[0]],['Vendor',row[1]],['Category',row[2]],['Amount',row[3]],['Source',row[4]],['Confidence',row[7]],['Tax',row[8]],['Status',row[5]],['Owner',row[6]]].forEach(function (field) {
      var item = document.createElement('div');item.append(element('dt',field[0]),element('dd',field[1]));details.appendChild(item);
    });
    dialog.showModal();
  });
  document.querySelectorAll('[data-taxiq-close]').forEach(function (button) { button.addEventListener('click',function () { dialog.close(); }); });
  dialog.addEventListener('close',function () { if(lastFocus && lastFocus.isConnected)lastFocus.focus(); });
  render();
})();
