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
 const {dom,w,d,ticket,api}=boot('checkout');ticket.lines[0].price=null;ticket.lines[0].name='Unlisted service';ticket.lines[0].status='completed';api.open(ticket,'checkout');
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
 const original=ctx.d.querySelector('[data-tw-bill][aria-pressed="true"]').getAttribute('data-tw-bill');
 ctx.d.querySelectorAll('[data-tw-bill]')[index].click();
 const check=ctx.d.querySelector(`[data-tw-bill-line="${line}"]`);if(!check.checked)check.click();
 ctx.d.querySelector(`[data-tw-bill="${original}"]`).click();
}
test('three guests pay their own services and tips, parent completes only after all bills are paid',()=>{
 const c=groupCheckout(),{d,ticket}=c;
 assert.ok(d.querySelector('[data-tw-split-bill]'),'Checkout offers service-based bill splitting');
 d.querySelector('[data-tw-split-bill]').click();submit(c.w,d);d.querySelector('[data-tw-add-bill]').click();
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
 d.querySelector('[data-tw-split-bill]').click();submit(c.w,d);d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment,undefined);assert.match(d.querySelector('[data-tw-message]').textContent,/empty bill/i);
 d.querySelector('[data-tw-cancel-split]').click();assert.equal(d.querySelectorAll('.tw-line').length,3);assert.equal(d.querySelector('[data-tw-total]').textContent,'$90.00');c.w.close();
});
test('split bill progress survives serialization and paid bill cannot be charged again',()=>{
 const c=groupCheckout(),{d,api}=c;
 assert.ok(d.querySelector('[data-tw-split-bill]'));
 d.querySelector('[data-tw-split-bill]').click();submit(c.w,d);assignBill(c,'l2',1);assignBill(c,'l3',1);
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 const restored=JSON.parse(JSON.stringify(c.ticket));api.open(restored,'edit');
 assert.match(d.querySelector('[data-tw-bill-progress]').textContent,/1\/2/);d.querySelectorAll('[data-tw-bill]')[0].click();
 assert.equal(d.querySelector('[data-tw-pay]'),null);assert.equal(d.querySelector('[data-tw-cancel-split]'),null);
 d.querySelectorAll('[data-tw-bill]')[1].click();assert.equal(d.querySelector('[data-tw-total]').textContent,'$49.50');c.w.close();
});

test('fixed discount cents are conserved across three bills and guest names are escaped',()=>{
 const c=groupCheckout(),{d,ticket,api,w}=c;
 ticket.lines.forEach(l=>l.price=0.01);ticket.discount={type:'fixed',value:0.01};api.open(ticket,'checkout');
 d.querySelector('[data-tw-split-bill]').click();submit(c.w,d);d.querySelector('[data-tw-add-bill]').click();assignBill(c,'l2',1);assignBill(c,'l3',2);
 const name=d.querySelector('[data-tw-bill-name]');name.value='<img src=x>';name.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(d.querySelector('img'),null);
 for(let i=0;i<3;i++){d.querySelectorAll('[data-tw-bill]')[i].click();d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();}
 assert.equal(ticket.payment.totalCents,2);assert.equal(ticket.payment.discountCents,1);w.close();
});
test('an extra empty bill can be removed before payment',()=>{
 const c=groupCheckout(),{d}=c;d.querySelector('[data-tw-split-bill]').click();submit(c.w,d);d.querySelector('[data-tw-add-bill]').click();
 d.querySelectorAll('[data-tw-bill]')[2].click();assert.ok(d.querySelector('[data-tw-remove-bill]'));
 d.querySelector('[data-tw-remove-bill]').click();assert.equal(d.querySelectorAll('[data-tw-bill]').length,2);c.w.close();
});

test('Split bill opens setup for incomplete services and missing prices without changing the ticket',()=>{
 const {w,d,ticket,api}=groupCheckout();ticket.lines[0].price=null;ticket.lines[0].status='in-service';api.open(ticket,'checkout');
 d.querySelector('[data-tw-split-bill]').click();
 assert.equal(d.querySelector('dialog').open,true);
 assert.ok(d.querySelector('[name="billCount"]'));
 assert.equal(ticket.splitBills,undefined);
 submit(w,d);assert.equal(ticket.splitBills,undefined);assert.match(d.querySelector('[data-tw-error]').textContent,/price/i);
 assert.equal(d.querySelector('[name="splitPrice0"]'),null);d.querySelector('[data-tw-close]').click();
 assert.equal(ticket.lines[0].price,null);assert.equal(ticket.splitBills,undefined);w.close();
});
test('setup creates three named bills before service completion and retains completion guard on payment',()=>{
 const c=groupCheckout(),{w,d,ticket,api}=c;ticket.lines[0].status='in-service';api.open(ticket,'checkout');
 d.querySelector('[data-tw-split-bill]').click();
 assert.equal(d.querySelector('dialog').open,true);
 d.querySelector('[name="billCount"][value="3"]').click();
 d.querySelector('[name="guest1"]').value='Hoa';d.querySelector('[name="guest2"]').value='Mai';submit(w,d);
 assert.equal(d.querySelectorAll('[data-tw-bill]').length,3);assert.match(d.querySelectorAll('[data-tw-bill]')[1].textContent,/Hoa/);
 assignBill(c,'l2',1);assignBill(c,'l3',2);d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment,undefined);assert.match(d.querySelector('[data-tw-message]').textContent,/Complete/);
 d.querySelector('[data-tw-action="complete"]').click();d.querySelector('[data-tw-pay]').click();
 assert.match(d.querySelector('[data-tw-bill-progress]').textContent,/1\/3/);w.close();
});

function amountSetup(c,count=3,allocation='equal'){
 const {d,w}=c;d.querySelector('[data-tw-split-bill]').click();
 const change=(name,value)=>{const el=d.querySelector(`[name="${name}"]`);assert.ok(el,name+' available');el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));};
 d.querySelector('[name="splitMode"][value="amount"]').click();d.querySelector(`[name="billCount"][value="${count}"]`).click();change('amountAllocation',allocation);
}
test('amount split divides one service among three people with exact cents, tip and discount conserved',()=>{
 const c=boot('checkout'),{d,w,ticket,api}=c;ticket.lines[0].price=100;ticket.lines[0].status='completed';ticket.discount={type:'fixed',value:10};ticket.checkout.tip=10;api.open(ticket,'checkout');
 amountSetup(c);submit(w,d);assert.equal(d.querySelectorAll('[data-tw-bill]').length,3);assert.equal(d.querySelector('[data-tw-bill-line]'),null);assert.equal(d.querySelector('[data-tw-total]').textContent,'$33.34');assert.equal(d.querySelector('[data-tw-field="tip"]'),null);
 for(let i=0;i<3;i++){d.querySelectorAll('[data-tw-bill]')[i].click();d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();if(i<2)assert.equal(ticket.payment,undefined);}
 assert.equal(ticket.payment.totalCents,10000);assert.equal(ticket.payment.subtotalCents,10000);assert.equal(ticket.payment.discountCents,1000);assert.equal(ticket.payment.tipCents,1000);assert.equal(ticket.lines.length,1);w.close();
});
test('custom amounts reject mismatch and persist a partly paid ticket with separate tenders',()=>{
 const c=groupCheckout(),{d,w,ticket,api}=c;amountSetup(c,3,'custom');
 const set=(i,value)=>{const el=d.querySelector(`[name="amount${i}"]`);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 set(0,'40');set(1,'30');set(2,'10');submit(w,d);assert.equal(ticket.splitBills,undefined);assert.match(d.querySelector('[data-tw-error]').textContent,/90.00/);
 set(2,'20');submit(w,d);d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 const restored=JSON.parse(JSON.stringify(ticket));api.open(restored,'checkout');assert.equal(d.querySelector('[data-tw-total]').textContent,'$30.00');
 const cash=d.querySelector('[data-tw-field="cash"]');cash.value='35';cash.dispatchEvent(new w.Event('input',{bubbles:true}));d.querySelector('[data-tw-pay]').click();
 d.querySelectorAll('[data-tw-bill]')[2].click();d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 assert.equal(restored.payment.totalCents,9000);assert.equal(restored.payment.cashCents,3000);assert.equal(restored.payment.cardCents,6000);assert.equal(restored.payment.changeCents,500);w.close();
});

test('service split shows all services in Ticket Detail and checkboxes assign exclusively to selected guest',()=>{
 const c=groupCheckout(),{d,w,ticket}=c;d.querySelector('[data-tw-split-bill]').click();submit(w,d);
 d.querySelectorAll('[data-tw-bill]')[1].click();
 const checks=d.querySelectorAll('.tw-ticket-side .tw-lines input[type="checkbox"]');assert.equal(checks.length,3);
 const check=d.querySelector('[data-tw-bill-line="l2"]');assert.equal(check.checked,false);check.click();
 assert.equal(d.querySelector('[data-tw-total]').textContent,'$27.00');
 d.querySelectorAll('[data-tw-bill]')[0].click();assert.equal(d.querySelector('[data-tw-bill-line="l2"]').checked,false);assert.equal(d.querySelector('[data-tw-total]').textContent,'$63.00');
 d.querySelector('[data-tw-bill-line="l1"]').click();
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 assert.equal(ticket.payment,undefined);assert.match(d.querySelector('[data-tw-message]').textContent,/every service/i);w.close();
});

test('By services exposes guest checkboxes in setup and creates bills with those selections',()=>{
 const {d,w,ticket}=groupCheckout();d.querySelector('[data-tw-split-bill]').click();
 assert.equal(d.querySelectorAll('dialog [data-tw-setup-line]').length,6);
 d.querySelector('[data-tw-setup-line="l2"][data-guest="1"]').click();
 assert.equal(d.querySelector('[data-tw-setup-line="l2"][data-guest="0"]').checked,false);
 const name=d.querySelector('[name="guest1"]');name.value='Hoa';name.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.match(d.querySelector('[data-tw-service-setup]').textContent,/Hoa/);
 submit(w,d);
 assert.equal(ticket.splitBills.assignments.l2,ticket.splitBills.bills[1].id);
 d.querySelectorAll('[data-tw-bill]')[1].click();assert.equal(d.querySelector('[data-tw-total]').textContent,'$27.00');w.close();
});
test('service setup selections survive mode changes and cancel does not modify the ticket',()=>{
 const {d,w,ticket}=groupCheckout();d.querySelector('[data-tw-split-bill]').click();
 assert.ok(d.querySelector('[data-tw-setup-line="l2"][data-guest="1"]'));
 d.querySelector('[data-tw-setup-line="l2"][data-guest="1"]').click();
 d.querySelector('[name="splitMode"][value="amount"]').click();
 assert.equal(d.querySelector('[data-tw-service-setup]').hidden,true);
 d.querySelector('[name="splitMode"][value="services"]').click();
 assert.equal(d.querySelector('[data-tw-setup-line="l2"][data-guest="1"]').checked,true);
 d.querySelector('[data-tw-close]').click();assert.equal(ticket.splitBills,undefined);w.close();
});

test('setup summary updates per-guest totals and unassigned balance when checking services',()=>{
 const {d,w,ticket,api}=groupCheckout();ticket.checkout.tip=5;api.open(ticket,'checkout');
 d.querySelector('[data-tw-split-bill]').click();
 assert.ok(d.querySelector('[data-tw-split-summary]'));
 d.querySelector('[data-tw-setup-line="l2"][data-guest="1"]').click();
 assert.equal(d.querySelector('[data-tw-setup-bill-total="0"]').textContent,'$68.00');
 assert.equal(d.querySelector('[data-tw-setup-bill-total="1"]').textContent,'$27.00');
 assert.equal(d.querySelector('[data-tw-setup-total]').textContent,'$95.00');
 assert.equal(d.querySelector('[data-tw-setup-remaining]').textContent,'$0.00');
 d.querySelector('[data-tw-setup-line="l2"][data-guest="1"]').click();
 assert.equal(d.querySelector('[data-tw-setup-remaining]').textContent,'$27.00');w.close();
});
test('amount setup summary shows discount, tip and remaining balance for custom amounts',()=>{
 const c=boot('checkout'),{d,w,ticket,api}=c;ticket.lines[0].price=100;ticket.discount={type:'fixed',value:10};ticket.checkout.tip=10;api.open(ticket,'checkout');amountSetup(c);
 assert.ok(d.querySelector('[data-tw-split-summary]'));
 assert.equal(d.querySelector('[data-tw-setup-total]').textContent,'$100.00');
 const policy=d.querySelector('[name="amountAllocation"]');policy.value='custom';policy.dispatchEvent(new w.Event('change',{bubbles:true}));
 const amount=d.querySelector('[name="amount0"]');amount.value='10';amount.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(d.querySelector('[data-tw-setup-bill-total="0"]').textContent,'$10.00');
 assert.equal(d.querySelector('[data-tw-setup-remaining]').textContent,'$23.34');w.close();
});

test('service setup summary matches created bills with a percentage tip',()=>{
 const {d,w,ticket,api}=groupCheckout();ticket.checkout.tip=10;ticket.checkout.tipType='percent';api.open(ticket,'checkout');
 d.querySelector('[data-tw-split-bill]').click();d.querySelector('[data-tw-setup-line="l2"][data-guest="1"]').click();
 assert.equal(d.querySelector('[data-tw-setup-bill-total="0"]').textContent,'$69.30');
 assert.equal(d.querySelector('[data-tw-setup-total]').textContent,'$96.30');
 submit(w,d);assert.equal(d.querySelector('[data-tw-total]').textContent,'$69.30');w.close();
});
test('Discount all remains available for an unpaid service split and locks after payment',()=>{
 const c=groupCheckout(),{d,w,ticket}=c;d.querySelector('[data-tw-split-bill]').click();submit(w,d);assignBill(c,'l2',1);
 assert.ok(d.querySelector('[data-tw-discount-all]'));
 d.querySelector('[data-tw-discount-all]').click();d.querySelector('[name="value"]').value='20';submit(w,d);
 assert.equal(d.querySelector('[data-tw-total]').textContent,'$56.00');
 d.querySelectorAll('[data-tw-bill]')[1].click();assert.equal(d.querySelector('[data-tw-total]').textContent,'$24.00');
 d.querySelector('[data-tw-method="card"]').click();d.querySelector('[data-tw-pay]').click();
 d.querySelectorAll('[data-tw-bill]')[0].click();assert.equal(d.querySelector('[data-tw-discount-all]').disabled,true);
 assert.equal(ticket.splitBills.bills[1].payment.totalCents,2400);w.close();
});
test('Discount all recalculates equal amount bills with exact cents',()=>{
 const c=groupCheckout(),{d,w,ticket}=c;amountSetup(c);submit(w,d);
 assert.ok(d.querySelector('[data-tw-discount-all]'));
 d.querySelector('[data-tw-discount-all]').click();d.querySelector('[name="value"]').value='20';submit(w,d);
 assert.deepEqual(Array.from(ticket.splitBills.bills,b=>b.amountTotals.totalCents),[2667,2667,2666]);w.close();
});

test('known service IDs restore missing prices without replacing valid price snapshots',()=>{
 const {d,w,ticket,api}=boot('checkout');ticket.lines=[
  {id:'missing',serviceId:'pedi',name:'Old name',price:null,tech:'Jade',status:'completed'},
  {id:'agreed',serviceId:'pedi',name:'Pedicure',price:25,tech:'Jade',status:'completed'},
  {id:'free',serviceId:'pedi',name:'Pedicure',price:0,tech:'Jade',status:'completed'}
 ];api.open(ticket,'checkout');
 assert.deepEqual(ticket.lines.map(l=>l.price),[30,25,0]);assert.equal(d.querySelector('[data-tw-total]').textContent,'$55.00');w.close();
});
test('Discount all supports fully discounted amount bills and restoring a price',()=>{
 const c=groupCheckout(),{d,w,ticket}=c;amountSetup(c);submit(w,d);
 d.querySelector('[data-tw-discount-all]').click();d.querySelector('[name="value"]').value='100';submit(w,d);
 assert.deepEqual(Array.from(ticket.splitBills.bills,b=>b.amountTotals.totalCents),[0,0,0]);
 d.querySelector('[data-tw-discount-all]').click();d.querySelector('[name="value"]').value='10';submit(w,d);
 assert.deepEqual(Array.from(ticket.splitBills.bills,b=>b.amountTotals.totalCents),[3000,3000,3000]);w.close();
});
test('amount setup creates a zero-total split without losing the discount',()=>{
 const c=groupCheckout(),{d,w,ticket,api}=c;ticket.discount={type:'percent',value:100};api.open(ticket,'checkout');amountSetup(c);submit(w,d);
 assert.equal(ticket.splitBills.bills.length,3);
 assert.deepEqual(Array.from(ticket.splitBills.bills,b=>b.amountTotals.totalCents),[0,0,0]);
 assert.equal(ticket.splitBills.bills.reduce((sum,b)=>sum+b.amountTotals.discountCents,0),10000);w.close();
});
test('Discount all preserves custom amount proportions and discount and tip totals',()=>{
 const c=groupCheckout(),{d,w,ticket,api}=c;ticket.checkout.tip=10;api.open(ticket,'checkout');amountSetup(c,3,'custom');
 for(const [i,value] of ['50','30','20'].entries())d.querySelector(`[name="amount${i}"]`).value=value;
 submit(w,d);d.querySelector('[data-tw-discount-all]').click();d.querySelector('[name="value"]').value='20';submit(w,d);
 assert.deepEqual(Array.from(ticket.splitBills.bills,b=>b.amountTotals.totalCents),[4500,2700,1800]);
 assert.equal(ticket.splitBills.bills.reduce((sum,b)=>sum+b.amountTotals.discountCents,0),2000);
 assert.equal(ticket.splitBills.bills.reduce((sum,b)=>sum+b.amountTotals.tipCents,0),1000);w.close();
});

test('custom bill count creates six amount bills and preserves exact totals',()=>{
 const c=groupCheckout(),{d,w,ticket}=c;amountSetup(c,2);
 assert.ok(d.querySelector('[name="billCount"][value="custom"]'));
 d.querySelector('[name="billCount"][value="custom"]').click();
 const custom=d.querySelector('[name="customBillCount"]');custom.value='6';custom.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(d.querySelectorAll('[data-tw-share]').length,6);
 assert.equal(d.querySelector('[data-tw-setup-bill-total="5"]').textContent,'$15.00');
 submit(w,d);assert.equal(ticket.splitBills.bills.length,6);
 assert.equal(ticket.splitBills.bills.reduce((sum,b)=>sum+b.amountTotals.totalCents,0),9000);w.close();
});
test('invalid custom counts block creation and presets recover without stale guest rows',()=>{
 const c=groupCheckout(),{d,w,ticket}=c;amountSetup(c,2);
 assert.ok(d.querySelector('[name="billCount"][value="custom"]'));
 d.querySelector('[name="billCount"][value="custom"]').click();
 const custom=d.querySelector('[name="customBillCount"]');
 for(const value of ['','1','2.5','21']){
  custom.value=value;custom.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(d.querySelector('[data-tw-save]').disabled,true);submit(w,d);assert.equal(ticket.splitBills,undefined);
 }
 custom.value='6';custom.dispatchEvent(new w.Event('input',{bubbles:true}));
 d.querySelector('[name="splitMode"][value="services"]').click();assert.equal(d.querySelector('[data-tw-save]').disabled,true);
 d.querySelector('[name="billCount"][value="3"]').click();
 assert.equal(d.querySelector('[data-tw-save]').disabled,false);assert.equal(d.querySelectorAll('[data-tw-split-guests] input').length,3);
 assert.equal(d.querySelector('[name="customBillCount"]').disabled,true);submit(w,d);assert.equal(ticket.splitBills.bills.length,3);w.close();
});
