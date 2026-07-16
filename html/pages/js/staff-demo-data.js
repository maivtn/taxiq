/* Dữ liệu demo cho Staff Workspace (mockup) — tách khỏi app logic.
   Chỉ dùng làm fallback khi mở lẻ staff.html mà chưa có shared store từ POS.
   Khi lên production: bỏ <script src="js/staff-demo-data.js"> trong staff.html là app sạch data demo.
   station = ghế/chỗ ngồi của khách; beeper = máy nhắn của thợ. */
window.NEXORA_STAFF_DEMO = {
  profile:{
    beeper:'B-12',
    receiveMethod:'VLinkPay',
    payroll:'Commission 60% · weekly review',
    services:['Pedicure','Gel Manicure','Deluxe Pedicure','Full Set'],
    customersToday:4,
    salonAverage:3,
    tips:88,
    income:{customers:4,service:420,commission:252,tips:88,total:340}
  },
  tickets:[
    {id:'#101',customer:'Amy Nguyen',phone:'832-555-0138',staff:'Jenny',status:'waiting',time:'Now',duration:'75 min',station:'5',services:['Deluxe Pedicure','Gel Manicure'],amount:96,note:'Customer likes warm water. Confirm gel color before polish.'},
    {id:'#107',customer:'Kelly Tran',phone:'832-555-0122',staff:'Jenny',status:'scheduled',time:'2:30 PM',duration:'60 min',station:'',services:['Gel Manicure'],amount:48,note:'Booked appointment. Front desk will confirm arrival.'},
    {id:'#098',customer:'Nancy Vo',phone:'832-555-0199',staff:'Jenny',status:'closed',time:'10:25 AM',duration:'90 min',station:'3',services:['Full Set'],amount:110,note:'Paid and closed.'},
    {id:'#094',customer:'Linh Pham',phone:'832-555-0172',staff:'Jenny',status:'closed',time:'9:20 AM',duration:'55 min',station:'7',services:['Classic Pedicure'],amount:65,note:'Requested Jenny for next visit.'}
  ],
  schedule:[
    {time:'9:00 AM',title:'Clock in',detail:'Jenny checked in and is available for turn rotation.',type:'ready'},
    {time:'Now',title:'#101 · Amy Nguyen',detail:'Deluxe Pedicure + Gel Manicure is waiting to start.',type:'active'},
    {time:'1:15 PM',title:'Short break',detail:'Front desk can adjust if queue is heavy.',type:'break'},
    {time:'2:30 PM',title:'#107 · Kelly Tran',detail:'Gel Manicure appointment assigned to Jenny.',type:'booked'}
  ]
};
