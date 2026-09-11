const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
function boot(mode='edit'){
 const dom=new JSDOM('<section id="root"></section>',{url:'https://example.test',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 const file=__dirname+'/ticket-workspace.js';if(fs.existsSync(file))w.eval(fs.readFileSync(file,'utf8'));
 assert.ok(w.NEXORA_TICKET_WORKSPACE,'Ticket workspace is available');
 const ticket={id:7,customer:'Amy',phone:'5551112222',status:'waiting',tech:'Jade',services:['Manicure'],lines:[{id:'l1',name:'Manicure',price:45,tech:'Jade',status:'assigned'}]};
 const api=w.NEXORA_TICKET_WORKSPACE.mount(w.document.querySelector('#root'),{catalog:()=>[{id:'gel',name:'Gel Manicure',price:45,categoryName:'Manicure',active:true},{id:'pedi',name:'Pedicure',price:30,categoryName:'Pedicure',active:true}],technicians:()=>[{name:'Jade'},{name:'Tina'},{name:'Mia',status:'clocked-out'}],onChange(){},onBack(){}});
 api.open(ticket,mode);return {dom,w,d:w.document,ticket,api};
}
function submit(w,d){d.querySelector('[data-tw-form]').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));}
test('Edit ticket adds services, changes technician, applies discount and starts services',()=>{
 const {dom,w,d,ticket}=boot();
 d.querySelector('[data-tw-add="pedi"]').click();assert.equal(ticket.lines.length,2);
 d.querySelector('[data-tw-action="tech"][data-line="l1"]').click();d.querySelector('[name="tech"]').value='Tina';submit(w,d);assert.equal(ticket.lines[0].tech,'Tina');
 d.querySelector('[data-tw-action="discount"][data-line="l1"]').click();d.querySelector('[name="value"]').value='10';submit(w,d);
 assert.match(d.querySelector('[data-tw-total]').textContent,/70.50/);
 d.querySelector('[data-tw-start-all]').click();assert.equal(ticket.lines[0].status,'in-service');
 dom.window.close();
});
test('Checkout validates service completion, computes discounts and tip, rejects short cash and records payment once',()=>{
 const {dom,w,d,ticket}=boot('checkout');
 d.querySelector('[data-tw-pay]').click();assert.match(d.querySelector('[data-tw-message]').textContent,/Complete/);
 d.querySelector('[data-tw-action="start"]').click();d.querySelector('[data-tw-action="complete"]').click();
 d.querySelector('[data-tw-discount-all]').click();d.querySelector('[name="value"]').value='10';submit(w,d);
 d.querySelector('[data-tw-tip="10"]').click();assert.match(d.querySelector('[data-tw-total]').textContent,/50.50/);
 const cash=d.querySelector('[data-tw-field="cash"]');cash.value='50';cash.dispatchEvent(new w.Event('input',{bubbles:true}));
 d.querySelector('[data-tw-pay]').click();assert.equal(ticket.payment,undefined);assert.match(d.querySelector('[data-tw-message]').textContent,/Cash/);
 cash.value='60';cash.dispatchEvent(new w.Event('input',{bubbles:true}));d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment.totalCents,5050);assert.equal(ticket.payment.changeCents,950);assert.equal(ticket.status,'completed');assert.equal(d.querySelector('[data-tw-pay]'),null);
 dom.window.close();
});
test('Unknown prices block payment and custom service text is escaped',()=>{
 const {dom,w,d,ticket,api}=boot('checkout');ticket.lines[0].price=null;ticket.lines[0].status='completed';api.open(ticket,'checkout');
 d.querySelector('[data-tw-pay]').click();assert.equal(ticket.payment,undefined);assert.match(d.querySelector('[data-tw-message]').textContent,/price/);
 d.querySelector('[data-tw-custom]').click();d.querySelector('[name="name"]').value='<img src=x>';d.querySelector('[name="price"]').value='12.50';submit(w,d);
 assert.equal(ticket.lines[1].price,12.5);assert.equal(d.querySelector('img'),null);
 dom.window.close();
});
test('combined discounts and percentage tip use cents and never make total negative',()=>{
 const {dom,w,ticket}=boot('checkout');
 ticket.lines.push({id:'l2',name:'Pedicure',price:30,tech:'Jade',status:'completed'});
 ticket.lines[0].discount={type:'percent',value:10};ticket.discount={type:'percent',value:10};ticket.checkout.tipType='percent';ticket.checkout.tip=20;
 assert.equal(w.NEXORA_TICKET_WORKSPACE.totals(ticket).totalCents,7614);
 ticket.discount={type:'fixed',value:100};assert.equal(w.NEXORA_TICKET_WORKSPACE.totals(ticket).totalCents,0);
 dom.window.close();
});
test('split payment rejects excessive cash and records both tender portions',()=>{
 const {dom,w,d,ticket,api}=boot('checkout');ticket.lines[0].status='completed';api.open(ticket,'checkout');
 d.querySelector('[data-tw-method="split"]').click();
 const cash=d.querySelector('[data-tw-field="splitCash"]');cash.value='50';cash.dispatchEvent(new w.Event('input',{bubbles:true}));d.querySelector('[data-tw-pay]').click();assert.equal(ticket.payment,undefined);
 cash.value='10';cash.dispatchEvent(new w.Event('input',{bubbles:true}));d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment.cashCents,1000);assert.equal(ticket.payment.cardCents,3500);
 dom.window.close();
});

test('clocked-out technicians cannot receive or start a service',()=>{
 const {dom,w,d,ticket,api}=boot();
 d.querySelector('[data-tw-action="tech"]').click();
 assert.equal([...d.querySelector('[name="tech"]').options].find(o=>o.value==='Mia').disabled,true);
 d.querySelector('[name="tech"]').value='Mia';submit(w,d);assert.equal(ticket.lines[0].tech,'Jade');
 ticket.lines[0].tech='Mia';api.open(ticket,'edit');d.querySelector('[data-tw-start-all]').click();assert.equal(ticket.lines[0].status,'assigned');
 dom.window.close();
});

function groupCheckout(){
 const ctx=boot('checkout');
 ctx.ticket.lines=[{id:'l1',name:'Manicure',price:45,tech:'Jade',status:'completed'},{id:'l2',name:'Pedicure',price:30,tech:'Tina',status:'completed'},{id:'l3',name:'Gel',price:25,tech:'Jade',status:'completed'}];
 ctx.ticket.discount={type:'fixed',value:10};ctx.api.open(ctx.ticket,'checkout');
 return ctx;
}
function assignBill(ctx,line,index){
 const select=ctx.d.querySelector(`[data-tw-bill-line="${line}"]`);
 select.value=select.options[index].value;select.dispatchEvent(new ctx.w.Event('change',{bubbles:true}));
}
test('three guests pay their own services and tips, parent completes only after all bills are paid',()=>{
 const c=groupCheckout(),{d,ticket}=c;
 assert.ok(d.querySelector('[data-tw-split-bill]'),'Checkout offers service-based bill splitting');
 d.querySelector('[data-tw-split-bill]').click();d.querySelector('[data-tw-add-bill]').click();
 assignBill(c,'l2',1);assignBill(c,'l3',2);
 assert.equal(d.querySelectorAll('[data-tw-bill]').length,3);
 d.querySelector('[data-tw-tip="10"]').click();d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment,undefined);assert.match(d.querySelector('[data-tw-bill-progress]').textContent,/1\/3/);
 assert.equal(d.querySelector('[data-tw-pay]'),null);assert.equal(d.querySelector('[data-tw-bill-line="l1"]').disabled,true);
 d.querySelectorAll('[data-tw-bill]')[1].click();assert.equal(d.querySelector('[data-tw-total]').textContent,'$27.00');
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();assert.equal(ticket.payment,undefined);
 d.querySelectorAll('[data-tw-bill]')[2].click();d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment.totalCents,10000);assert.equal(ticket.payment.discountCents,1000);assert.equal(ticket.payment.tipCents,1000);
 assert.equal(ticket.status,'completed');assert.deepEqual(ticket.lines.map(l=>l.tech),['Jade','Tina','Jade']);
 assert.match(d.querySelector('[data-tw-bill-progress]').textContent,/3\/3/);c.w.close();
});
test('empty bills block payment and unpaid splits can be cancelled without losing the ticket',()=>{
 const c=groupCheckout(),{d,ticket}=c;
 assert.ok(d.querySelector('[data-tw-split-bill]'));
 d.querySelector('[data-tw-split-bill]').click();d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment,undefined);assert.match(d.querySelector('[data-tw-message]').textContent,/empty bill/i);
 d.querySelector('[data-tw-cancel-split]').click();assert.equal(d.querySelectorAll('.tw-line').length,3);assert.equal(d.querySelector('[data-tw-total]').textContent,'$90.00');c.w.close();
});
test('split bill progress survives serialization and paid bill cannot be charged again',()=>{
 const c=groupCheckout(),{d,api}=c;
 assert.ok(d.querySelector('[data-tw-split-bill]'));
 d.querySelector('[data-tw-split-bill]').click();assignBill(c,'l2',1);assignBill(c,'l3',1);
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 const restored=JSON.parse(JSON.stringify(c.ticket));api.open(restored,'edit');
 assert.match(d.querySelector('[data-tw-bill-progress]').textContent,/1\/2/);d.querySelectorAll('[data-tw-bill]')[0].click();
 assert.equal(d.querySelector('[data-tw-pay]'),null);assert.equal(d.querySelector('[data-tw-cancel-split]'),null);
 d.querySelectorAll('[data-tw-bill]')[1].click();assert.equal(d.querySelector('[data-tw-total]').textContent,'$49.50');c.w.close();
});

test('fixed discount cents are conserved across three bills and guest names are escaped',()=>{
 const c=groupCheckout(),{d,ticket,api,w}=c;
 ticket.lines.forEach(l=>l.price=0.01);ticket.discount={type:'fixed',value:0.01};api.open(ticket,'checkout');
 d.querySelector('[data-tw-split-bill]').click();d.querySelector('[data-tw-add-bill]').click();assignBill(c,'l2',1);assignBill(c,'l3',2);
 const name=d.querySelector('[data-tw-bill-name]');name.value='<img src=x>';name.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(d.querySelector('img'),null);
 for(let i=0;i<3;i++){d.querySelectorAll('[data-tw-bill]')[i].click();d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();}
 assert.equal(ticket.payment.totalCents,2);assert.equal(ticket.payment.discountCents,1);w.close();
});
test('an extra empty bill can be removed before payment',()=>{
 const c=groupCheckout(),{d}=c;d.querySelector('[data-tw-split-bill]').click();d.querySelector('[data-tw-add-bill]').click();
 d.querySelectorAll('[data-tw-bill]')[2].click();assert.ok(d.querySelector('[data-tw-remove-bill]'));
 d.querySelector('[data-tw-remove-bill]').click();assert.equal(d.querySelectorAll('[data-tw-bill]').length,2);c.w.close();
});
