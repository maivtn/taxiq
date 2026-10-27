import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const report=require('../../../html/assets/pos-technician-report-data.js');
test('report periods preserve Monday weeks across month boundaries and leap days',()=>{
 assert.deepEqual(report.period('Weekly','2026-10-27'),{start:'2026-10-26',end:'2026-11-01',label:'Oct 26, 2026 – Nov 1, 2026'});
 const leap=report.period('Monthly','2028-02-19');assert.equal(leap.start,'2028-02-01');assert.equal(leap.end,'2028-02-29');assert.equal(report.formatDate('2028-02-01'),'Feb 1, 2028');
});
test('cent allocation preserves totals including zero-priced shares',()=>{
 for(const weights of [[1,1,1],[0,0,0],[2,3,9]]){const rows=report.allocate(100,weights);assert.equal(rows.reduce((a,b)=>a+b,0),100);assert.ok(rows.every(Number.isInteger));}
});
test('weekly guarantee excludes separately paid tips and leaves operational inputs untouched',()=>{
 const techs=[{name:'Technician A',posProfile:{comm:.6,guar:100}}],tickets=[{id:'DEMO-RPT',lines:[{name:'Manicure',tech:'Technician A',price:80,durationMin:60}],payment:{paidAt:'2026-10-27T12:00:00',netCents:8000,tipCents:5000,method:'cash'}}],before=JSON.stringify({techs,tickets});
 const [row]=report.aggregate(techs,tickets,report.period('Weekly','2026-10-27'),'Weekly');assert.equal(row.commission,4800);assert.equal(row.tip,5000);assert.equal(row.topup,5200);assert.equal(row.payable,10000);assert.equal(row.cash,13000);assert.equal(JSON.stringify({techs,tickets}),before);
});
