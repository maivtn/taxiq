/* PO handoff dashboard.html floor map, connected to the existing local Station store. */
(function () {
  'use strict';
  const host = document.querySelector('[data-pos-station-map]');
  const stations = window.NEXORA_STATIONS;
  if (!host || !stations) return;
  const esc = window.NEXORA_POS_DEMO.esc;
  const storageKey = 'nexora-pos-station-view-v1';
  const views = ['cards', 'grid', 'row'];
  const groups = [['pedi', 'Pedicure chairs'], ['mani', 'Manicure tables'], ['room', 'Rooms']];
  const states = ['free', 'held', 'occupied', 'cleaning', 'overdue', 'blocked'];
  const labels = {free: 'Free', held: stations.labels.held, occupied: 'Occupied', cleaning: 'Cleaning', overdue: 'Overdue', blocked: 'Blocked'};
  let view = 'cards';
  try { const saved = localStorage.getItem(storageKey); if (views.includes(saved)) view = saved; } catch (_) {}

  host.innerHTML = '<div class="pos-station-map-head"><div><h2 id="pos-station-map-title">Salon floor map</h2><p>See chairs, tables, rooms, and who is serving each guest.</p></div><div class="pos-station-map-tools"><div class="pos-station-view-switch" role="group" aria-label="Map view">' + views.map(key => '<button type="button" data-station-view="' + key + '" aria-pressed="false" aria-controls="pos-station-zones">' + {cards:'Cards',grid:'Grid',row:'Row'}[key] + '</button>').join('') + '</div><a class="pos-station-settings" href="pos-salon-settings.html?section=stations">Station settings</a><span class="pos-station-map-preview">Illustrative data</span></div></div><div class="pos-station-map-legend" aria-label="Station status"></div><div class="pos-station-zones" id="pos-station-zones"></div><div class="pos-station-map-foot" hidden></div>';

  function show(next) {
    if (!views.includes(next)) return;
    view = next;
    host.dataset.view = view;
    host.querySelectorAll('[data-station-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stationView === view)));
    try { localStorage.setItem(storageKey, view); } catch (_) {}
  }
  function status(station) {
    return station.state === 'cleaning' && Date.now() > new Date(station.dueAt).getTime() ? 'overdue' : station.state;
  }
  function timing(station) {
    if (station.state !== 'cleaning') return '';
    const remaining = (new Date(station.dueAt).getTime() - Date.now()) / 60000;
    return remaining < 0 ? Math.floor(-remaining) + ' min overdue' : Math.ceil(remaining) + ' min left';
  }
  function render() {
    const data = stations.load();
    host.hidden = data.settings.mode === 'off';
    const rows = data.stations.filter(station => station.enabled);
    let tickets = [];
    try { tickets = window.NEXORA_FRONT_DESK_DATA.all().filter(window.NEXORA_FRONT_DESK_DATA.visible); } catch (_) {}
    const countSummary = list => states.map(key => {
      const count = list.filter(station => status(station) === key).length;
      return count ? count + ' <span>' + esc(labels[key]) + '</span>' : '';
    }).filter(Boolean).join(' · ');
    host.querySelector('.pos-station-map-legend').innerHTML = states.filter(key => key !== 'held' || rows.some(station => status(station) === key)).map(key => '<span data-status="' + key + '"><i aria-hidden="true"></i>' + esc(labels[key]) + ' <b>' + rows.filter(station => status(station) === key).length + '</b></span>').join('');
    host.querySelector('.pos-station-zones').innerHTML = groups.map(([kind, title]) => {
      const list = rows.filter(station => station.kind === kind);
      if (!list.length) return '';
      const active = list.filter(station => status(station) !== 'free').sort((a, b) => Number(status(b) === 'overdue') - Number(status(a) === 'overdue'));
      const summary = (active.length ? active : list).slice(0, 2).map(station => '<small class="' + (status(station) === 'overdue' ? 'is-alert' : '') + '">' + esc(station.code) + ' · ' + esc(timing(station) || station.tech || labels[status(station)]) + '</small>').join('');
      return '<div class="pos-station-zone' + (kind === 'room' ? ' is-rooms' : '') + '"><h3>' + title + ' · ' + list.length + '</h3><div class="pos-station-zone-summary"><strong>' + countSummary(list) + '</strong>' + summary + '</div><div class="pos-station-cells">' + list.map(station => {
        const ticket = tickets.find(ticket => window.NEXORA_FRONT_DESK_DATA.keyOf(ticket) === String(station.ticketId));
        return '<div class="pos-station-cell" data-status="' + esc(status(station)) + '"><div class="pos-station-cell-top"><strong>' + esc(station.code) + '</strong><span>' + esc(labels[status(station)]) + '</span></div><small>' + esc(station.state === 'free' ? 'Available' : station.tech || station.blockedNote || labels[status(station)]) + '</small>' + (timing(station) || ticket?.customer ? '<small>' + esc(timing(station) || ticket.customer) + '</small>' : '') + '</div>';
      }).join('') + '</div></div>';
    }).join('');
    const cleaning = rows.filter(station => status(station) === 'overdue');
    const footer = host.querySelector('.pos-station-map-foot');
    const focusedCode = footer.contains(document.activeElement) ? document.activeElement.dataset.posClean : '';
    footer.hidden = !cleaning.length;
    footer.innerHTML = cleaning.map(station => '<div class="pos-station-cleaning-row"><span>' + esc(station.code) + ' · ' + esc(timing(station)) + (station.tech ? ' · ' + esc(station.tech) : '') + '</span><button type="button" data-pos-clean="' + esc(station.code) + '">Mark clean</button></div>').join('');
    if (focusedCode) Array.from(footer.querySelectorAll('[data-pos-clean]')).find(button => button.dataset.posClean === focusedCode)?.focus({preventScroll:true});
  }
  host.addEventListener('click', event => {
    const button = event.target.closest('[data-station-view]');
    if (button) show(button.dataset.stationView);
  });
  ['nexora:stations-changed', 'nexora:tickets-changed', 'nexora:pos-account-changed', 'focus'].forEach(name => window.addEventListener(name, render));
  window.addEventListener('nexora:stations-tick', () => { if (!host.contains(document.activeElement)) render(); });
  window.addEventListener('storage', event => { if (event.key === storageKey && views.includes(event.newValue)) show(event.newValue); });
  show(view);
  render();
})();
