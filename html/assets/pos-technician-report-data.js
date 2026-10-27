/* Read-only report calculations. Demo report rows never write to POS tickets. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_TECHNICIAN_REPORT_DATA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const keys = ['nexora:direct-checkouts:v1', 'nexora:front-desk-ticket-workspaces:v1'];
  const cents = value => Math.round((Number(value) || 0) * 100);
  const iso = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const parseDate = value => { const parts = String(value).slice(0, 10).split('-').map(Number); return new Date(parts[0], parts[1] - 1, parts[2] || 1); };
  const formatDate = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(value instanceof Date ? value : parseDate(value));
  function period(mode, selected) {
    const start = parseDate(selected), end = parseDate(selected);
    if (mode === 'Weekly') { start.setDate(start.getDate() - (start.getDay() + 6) % 7); end.setTime(start.getTime()); end.setDate(end.getDate() + 6); }
    if (mode === 'Monthly') { start.setDate(1); end.setMonth(end.getMonth() + 1, 0); }
    return { start: iso(start), end: iso(end), label: mode === 'Monthly' ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(start) : mode === 'Weekly' ? formatDate(start) + ' – ' + formatDate(end) : formatDate(start) };
  }
  function allocate(total, weights) {
    const denominator = weights.reduce((sum, weight) => sum + weight, 0);
    if (!weights.length) return [];
    let used = 0;
    return weights.map((weight, index) => { const amount = index === weights.length - 1 ? total - used : Math.floor(total * (denominator ? weight / denominator : 1 / weights.length)); used += amount; return amount; });
  }
  function readPayments(storage) {
    const records = [];
    keys.forEach((key, index) => {
      let value;
      try { value = JSON.parse(storage.getItem(key) || (index ? '{}' : '[]')); } catch (_) { return; }
      const rows = index ? value && !Array.isArray(value) && typeof value === 'object' ? Object.values(value) : [] : Array.isArray(value) ? value : [];
      rows.forEach(ticket => {
        if (!ticket || ticket.cancelled || ticket.status === 'cancelled' || !ticket.payment) return;
        if (ticket.splitBills?.bills?.length) {
          if (!ticket.splitBills.bills.every(bill => bill.payment)) return;
          ticket.splitBills.bills.forEach((bill, billIndex) => records.push({ ...ticket, ...bill, id: String(ticket.id) + '-' + (billIndex + 1), payment: bill.payment }));
        } else records.push(ticket);
      });
    });
    return records;
  }
  function demoPayments(technicians, selected = new Date()) {
    const records = [];
    for (let day = 0; day < 35; day++) {
      const date = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - day, 14, 0);
      technicians.slice(0, 8).forEach((tech, index) => {
        if ((day + index) % 5 === 4) return;
        const amount = 4500 + (index % 4) * 1500 + (day % 3) * 500;
        records.push({ id: 'RPT-' + iso(date).replaceAll('-', '') + '-' + (index + 1), lines: [{ name: index % 2 ? 'Manicure' : 'Pedicure', tech: tech.name, price: amount / 100, durationMin: index % 2 ? 45 : 60 }], payment: { paidAt: date.toISOString(), netCents: amount, subtotalCents: amount, tipCents: Math.round(amount * 0.18), totalCents: Math.round(amount * 1.18), method: index % 2 ? 'card' : 'cash', tipAllocations: { [tech.name]: Math.round(amount * 0.18) } }, reportDemo: true });
      });
    }
    return records;
  }
  function aggregate(technicians, payments, range, mode) {
    const rows = new Map(technicians.map(tech => {
      const profile = tech.posProfile || {};
      return [tech.name, { id: tech.id || tech.name, name: tech.name, rate: Number(profile.comm ?? tech.commission ?? 0.6), guarantee: cents(profile.guar), payModel: profile.payModel || 'max', service: 0, tip: 0, discount: 0, supply: 0, clean: 0, commission: 0, takes: 0, turns: 0, minutes: 0, card: 0, cash: 0, days: new Set(), tickets: [] }];
    }));
    payments.forEach(ticket => {
      const at = new Date(ticket.payment?.paidAt || ticket.createdAt);
      if (Number.isNaN(at.getTime())) return;
      const date = iso(at);
      if (date < range.start || date > range.end) return;
      const lines = Array.isArray(ticket.lines) ? ticket.lines : [];
      const weights = lines.map(line => Math.max(0, cents(line.price)));
      const service = allocate(Number(ticket.payment.netCents ?? weights.reduce((sum, value) => sum + value, 0)), weights);
      const tip = allocate(Number(ticket.payment.tipCents) || 0, weights);
      const byTech = new Map();
      lines.forEach((line, index) => {
        if (line.kind === 'product' || line.type === 'product') return;
        const names = String(line.tech || ticket.tech || '').split(',').map(name => name.trim()).filter(Boolean);
        const shares = allocate(service[index], names.map(() => 1)), tips = allocate(tip[index], names.map(() => 1));
        names.forEach((name, nameIndex) => {
          if (!rows.has(name)) rows.set(name, { id: name, name, rate: 0.6, guarantee: 0, payModel: 'max', service: 0, tip: 0, discount: 0, supply: 0, clean: 0, commission: 0, takes: 0, turns: 0, minutes: 0, card: 0, cash: 0, days: new Set(), tickets: [] });
          if (!byTech.has(name)) byTech.set(name, { amount: 0, tip: 0, minutes: 0, supply: 0, discount: 0 });
          const entry = byTech.get(name);
          entry.amount += shares[nameIndex]; entry.tip += tips[nameIndex]; entry.minutes += (Number(line.durationMin) || 45) / names.length;
          entry.supply += Math.round(cents(line.supplyFee) / names.length); entry.discount += Math.round(cents(line.techDiscount) / names.length);
        });
      });
      byTech.forEach((entry, name) => {
        const row = rows.get(name), allocated = ticket.payment.tipAllocations?.[name];
        if (Number.isFinite(Number(allocated))) entry.tip = Number(allocated);
        row.service += entry.amount; row.tip += entry.tip; row.minutes += entry.minutes; row.supply += entry.supply; row.discount += entry.discount; row.turns++; row.days.add(date);
        const collected=entry.amount+entry.tip,method=ticket.payment.method;
        if(method==='card')row.card+=collected;else if(method==='cash')row.cash+=collected;else if(method==='split'){const card=Math.round(collected*(Number(ticket.payment.cardCents)||0)/Math.max(1,Number(ticket.payment.totalCents)||collected));row.card+=card;row.cash+=collected-card;}
        row.tickets.push({ id: ticket.id, date, amount: entry.amount, tip: entry.tip });
      });
    });
    return [...rows.values()].map(row => {
      row.days = row.days.size;
      row.commission = Math.max(0, Math.round((row.service - row.supply) * row.rate) - row.discount);
      row.takes = Math.max(0, row.commission + row.tip - row.clean);
      row.topup = mode === 'Weekly' ? Math.max(0, row.guarantee - row.commission) : 0;
      row.payable = row.commission + row.topup - row.clean;
      row.remainder = row.service - row.payable;
      row.achieved = row.guarantee ? row.commission / row.guarantee * 100 : 0;
      return row;
    });
  }
  return { keys, iso, parseDate, formatDate, period, allocate, readPayments, demoPayments, aggregate };
});
