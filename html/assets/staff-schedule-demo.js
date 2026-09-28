(function () {
  'use strict';
  var schedules = window.NEXORA_STAFF_SCHEDULE_STORE;
  var bookings = window.NEXORA_APPOINTMENTS_STORE;
  var catalog = window.NEXORA_SALON_DATA?.loadCatalog();
  if (!schedules || !bookings || !catalog) return;
  function dateKey(date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0'); }
  var monday = new Date();
  monday.setHours(12,0,0,0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  var batch = 'schedule-demo-' + dateKey(monday);
  var marker = 'nexora:' + batch;
  function dateAt(offset) { var date = new Date(monday); date.setDate(date.getDate() + offset); return dateKey(date); }
  try {
    if (localStorage.getItem(marker)) return;
    var people = catalog.technicians.filter(function (person) { return person.active !== false; }).slice(0,4);
    var state = schedules.loadState();
    var firstVisit = !localStorage.getItem(schedules.STORAGE_KEY);
    var salon = state.salons[schedules.SALON_ID];
    if (firstVisit) people.forEach(function (person, index) {
      var schedule = schedules.getStaffSchedule(schedules.SALON_ID,person.id,{});
      if (index === 1) { schedule.weekly.tue.working = false; schedule.weekly.sat.end = '17:00'; }
      if (index === 2) schedule.weekly.wed.breaks.push({start:'15:00',end:'15:15'});
      if (index === 3) { schedule.weekly.mon.start = '10:00'; schedule.permission = 'none'; }
      salon.staff[person.id] = schedule;
    });
    if (firstVisit) localStorage.setItem(schedules.STORAGE_KEY,JSON.stringify(state));
    var customers = ['Emma Wilson','Sophia Lee','Olivia Chen','Ava Davis','Mia Brown','Isabella Tran','Grace Kim','Lily Parker'];
    var services = catalog.services.filter(function (service) { return ['pedi','mani','gel'].includes(service.id) && service.active !== false; });
    if (!services.length) services = catalog.services.filter(function (service) { return service.active !== false; }).slice(0,3);
    for (var day = 0; day < 14; day++) {
      if (day % 7 === 6 || !services.length) continue;
      people.forEach(function (person, index) {
        var schedule = schedules.scheduleForDate(schedules.getStaffSchedule(schedules.SALON_ID,person.id,{}),dateAt(day));
        if (!schedule.working) return;
        ['10:00','11:30','14:00','16:00'].slice(0,index === 0 ? 4 : 2 + index % 2).forEach(function (time, slot) {
          var service = services[(day + index + slot) % services.length];
          var duration = Number(service.durationMin) || 60;
          var end = new Date(dateAt(day) + 'T' + time + ':00'); end.setMinutes(end.getMinutes() + duration);
          var endTime = String(end.getHours()).padStart(2,'0') + ':' + String(end.getMinutes()).padStart(2,'0');
          if (time < schedule.start || endTime > schedule.end || schedule.breaks.some(function (pause) { return time < pause.end && endTime > pause.start; })) return;
          var id = batch + '-' + day + '-' + person.id + '-' + slot;
          // Existing records and overlapping user bookings are left untouched by create().
          bookings.create({id:id,customerName:'Demo · ' + customers[(day + index + slot) % customers.length],phone:'832555010' + slot,date:dateAt(day),time:time,technicianId:person.id,serviceIds:[service.id],serviceNames:[service.name],status:slot === 1 ? 'pending' : 'confirmed',source:'schedule-demo',metadata:{scheduleDemo:true},tickets:[{id:id + '-ticket',serviceId:service.id,serviceName:service.name,durationMin:duration,price:service.price,technicianId:person.id,technicianName:person.name}]});
        });
      });
    }
    var samples = [
      {offset:2,type:'day-off',status:'pending',reason:'Family appointment'},
      {offset:3,type:'change-hours',start:'10:00',end:'17:00',status:'adjusted',reason:'Manager suggested an earlier finish'},
      {offset:4,type:'break',start:'15:00',end:'15:30',status:'pending',reason:'Personal appointment'},
      {offset:5,type:'day-off',status:'rejected',reason:'Busy Saturday — please choose another date'},
      {offset:8,type:'change-hours',start:'10:00',end:'18:00',status:'cancelled',reason:'Staff withdrew the request'}
    ];
    people.slice(0,3).forEach(function (person) {
      if (schedules.getStaffSchedule(schedules.SALON_ID,person.id,{}).permission === 'none') return;
      samples.forEach(function (sample,index) {
        var id = batch + '-request-' + person.id + '-' + index;
        if (state.requests.some(function (request) { return request.id === id; })) return;
        state.requests.push(Object.assign({id:id,salonId:schedules.SALON_ID,staffId:person.id,start:'',end:'',bookingImpactIds:[],demo:true},sample,{date:dateAt(sample.offset),reason:'Demo · ' + sample.reason,createdAt:dateAt(0) + 'T' + String(9 + index).padStart(2,'0') + ':00:00'}));
      });
    });
    localStorage.setItem(schedules.STORAGE_KEY,JSON.stringify(state));
    localStorage.setItem(marker,'1');
  } catch (error) { console.warn('Demo samples were not loaded:',error.message); }
})();
