const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
function boot(){
 const dom=new JSDOM('<section id="estimate"></section>',{url:'https://example.test',runScripts:'outside-only'});
 const w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
 w.HTMLDialogElement.prototype.close=function(){this.open=false};
 const file=__dirname+'/pos-estimate.js';
 if(fs.existsSync(file))w.eval(fs.readFileSync(file,'utf8'));
 return dom;
}
test('estimate calculates cents, caps fixed reductions, rejects missing prices and invalid discounts',()=>{
 const dom=boot(),api=dom.window.NEXORA_POS_ESTIMATE;
 assert.ok(api,'estimate module is available');
 for(const [prices,type,value,total] of [[[30,22],'percent',5,4940],[[30,22],'percent',20,4160],[[30,22],'fixed',15,3700],[[5],'fixed',20,0],[[19.99],'percent',15,1699]]){
  assert.equal(api.calculate(prices.map(price=>({price})),type,value).totalCents,total);
 }
 for(const [prices,type,value] of [[[null],'fixed',0],[[10],'percent',101],[[10],'fixed',-1],[[10],'fixed',''],[[],'percent',0]])assert.ok(api.calculate(prices.map(price=>({price})),type,value).error);
 dom.window.close();
});
test('estimate selection and discount survive cancelled check-in; confirmation carries services once',()=>{
 const dom=boot(),w=dom.window,d=w.document,api=w.NEXORA_POS_ESTIMATE;
 assert.ok(api,'estimate module is available');
 let received=[];
 api.mount(d.querySelector('#estimate'),{getServices:()=>[{id:'a',name:'Manicure',price:22,active:true},{id:'b',name:'Pedicure',price:30,active:true}],checkIn:payload=>{received.push(payload);return {ok:true}}});
 d.querySelector('[data-est-add="a"]').click();d.querySelector('[data-est-add="b"]').click();
 d.querySelector('[data-est-preset="10"]').click();
 assert.match(d.querySelector('[data-est-total]').textContent,/46.80/);
 d.querySelector('[data-est-checkin]').click();d.querySelector('[data-est-cancel]').click();
 assert.equal(received.length,0);
 d.querySelector('[data-est-checkin]').click();
 d.querySelector('[name="customerName"]').value='Jade';d.querySelector('[name="phone"]').value='5551234567';
 const submit=()=>d.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));submit();submit();
 assert.equal(received.length,1);assert.equal(received[0].tickets.length,2);assert.equal(received[0].estimate.totalCents,4680);
 assert.equal(received[0].tickets[0].price,22);
 dom.window.close();
});
test('estimate groups services by category and combines category and name filters',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 try {
  w.NEXORA_POS_ESTIMATE.mount(d.querySelector('#estimate'),{getServices:()=>[
   {id:'a',name:'Classic manicure',price:22,categoryName:'Manicure'},
   {id:'b',name:'Classic pedicure',price:30,categoryName:'Pedicure'},
   {id:'c',name:'Gel pedicure',price:40,categoryName:'Pedicure'},
   {id:'d',name:'Retired',price:10,categoryName:'Hidden',active:false}
  ],checkIn:()=>({ok:true})});
  assert.equal(d.querySelectorAll('.estimate-category').length,2);
  assert.equal(d.querySelector('[data-est-category="Hidden"]'),null);
  d.querySelector('[data-est-add="a"]').click();
  d.querySelector('[data-est-category="Pedicure"]').click();
  assert.equal(d.querySelector('[data-est-add="a"]'),null);
  assert.equal(d.querySelectorAll('[data-est-add]').length,2);
  const search=d.querySelector('[data-est-search]');
  search.value='GEL';search.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(d.querySelectorAll('[data-est-add]').length,1);
  d.querySelector('[data-est-add="c"]').click();
  assert.equal(d.querySelector('[data-est-subtotal]').textContent,'$62.00');
  search.value='missing';search.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.match(d.querySelector('[data-est-catalog]').textContent,/No services found/);
  search.value='';search.dispatchEvent(new w.Event('input',{bubbles:true}));
  d.querySelector('[data-est-category="All"]').click();
  assert.equal(d.querySelectorAll('.estimate-category').length,2);
  assert.equal(d.querySelectorAll('.estimate-line').length,2);
 } finally {dom.window.close();}
});
