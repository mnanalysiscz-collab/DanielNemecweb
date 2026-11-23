const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const {parseRate,scheduleMatches,update}=require('../scripts/update-bank-rates.cjs');
const samples=Object.fromEntries(['moneta','csas','kb'].map(id=>[id,fs.readFileSync(path.join(__dirname,'fixtures',id+'.txt'),'utf8')]));
(async()=>{
for(const [id,rate] of Object.entries({moneta:4.99,csas:5.39,kb:5.49})){assert.equal(parseRate(id,samples[id]),rate);assert.throws(()=>parseRate(id,'Access denied 5,99 %'));}
assert.equal(parseRate('csas',samples.csas.replace('5,39','5,69')),5.69);
// The bank removed the heading's final full stop in October 2026.
assert.equal(parseRate('csas',samples.csas.replace('přizpůsobí.', 'přizpůsobí')),5.39);
assert.equal(parseRate('csas','<h1>Hypotéka, která se vám přizpůsobí</h1><p>S úrokem od <strong>5,39&nbsp;%</strong> ročně</p><p>Reprezentativní příklad: 6,09 %</p>'),5.39);
assert.throws(()=>parseRate('csas','Hypotéka, která se vám přizpůsobí Reprezentativní příklad: úrok 6,09 % ročně'));
assert.throws(()=>parseRate('moneta',samples.moneta.replace('80 %','70 %')));
assert.equal(parseRate('moneta',samples.moneta.replace('tříletou','jednoletou')),4.99);
assert.throws(()=>parseRate('kb',samples.kb.replace('A nebo B','pouze A')));
assert.equal(parseRate('csas','<script>Hypotéka, která se vám přizpůsobí. S úrokem od 1,00 % ročně</script>'+samples.csas),5.39);
for(const [date,cron] of [['2026-07-01T23:00:00Z','0 23 * * *'],['2026-12-01T00:00:00Z','0 0 * * *'],['2026-10-24T23:00:00Z','0 23 * * *'],['2026-10-26T00:00:00Z','0 0 * * *']]){assert.ok(scheduleMatches(cron,new Date(date)));assert.ok(!scheduleMatches(cron==='0 0 * * *'?'0 23 * * *':'0 0 * * *',new Date(date)));}
const data={banks:Object.keys(samples).map(id=>({id,source:id,rate:4,checkedOn:'2026-01-01',expiresOn:'2026-01-04'}))};
const result=await update(data,async id=>({ok:true,text:async()=>id==='kb'?'changed page':samples[id]}),new Date('2026-10-02T23:00:00Z'));
assert.equal(result.failed,1);assert.equal(result.data.banks[0].checkedOn,'2026-10-03');assert.equal(result.data.banks[0].expiresOn,'2026-10-06');assert.equal(result.data.banks[2].checkedOn,'2026-01-01');assert.equal(result.data.banks[2].status,'unavailable');assert.equal(data.banks[0].rate,4);
assert.match(result.data.banks[0].conditions,/Fixace 3 roky/);
const updatedMoneta={...data.banks[0],conditions:'Fixace 3 roky'};
const newFixation=await update({banks:[updatedMoneta]},async()=>({
  ok:true,text:async()=>samples.moneta.replace('tříletou','jednoletou')
}));
assert.equal(newFixation.failed,0);
assert.match(newFixation.data.banks[0].conditions,/Fixace 1 rok/);
const blocked=await update({banks:[updatedMoneta,data.banks[1]]},async id=>id==='moneta'
  ?{ok:false,status:403}
  :{ok:true,text:async()=>samples.csas});
assert.equal(blocked.failed,1);
assert.equal(blocked.data.banks[0].status,'unavailable');
assert.equal(blocked.data.banks[0].checkedOn,updatedMoneta.checkedOn);
assert.equal(blocked.data.banks[1].status,'verified');
const manualMoneta={...updatedMoneta,rate:4.99,status:'verified',verifiedManually:true,checkedOn:'2026-11-23',
  checkedAt:'2026-11-23T11:00:00Z',expiresOn:'2026-11-26'};
const rejectAccess=async()=>({ok:false,status:403});
const stillCurrent=await update({banks:[manualMoneta]},rejectAccess,new Date('2026-11-24T01:00:00Z'));
assert.equal(stillCurrent.failed,1);
assert.equal(stillCurrent.data.banks[0].status,'verified');
assert.equal(stillCurrent.data.banks[0].checkedAt,manualMoneta.checkedAt);
assert.equal(stillCurrent.data.banks[0].expiresOn,manualMoneta.expiresOn);
const expiredManual=await update({banks:[manualMoneta]},rejectAccess,new Date('2026-11-25T23:00:00Z'));
assert.equal(expiredManual.data.banks[0].status,'unavailable');
const changedTerms=await update({banks:[manualMoneta]},async()=>({ok:true,text:async()=>samples.moneta.replace('80 %','70 %')}),
  new Date('2026-11-24T01:00:00Z'));
assert.equal(changedTerms.data.banks[0].status,'unavailable');
const automaticAgain=await update({banks:[manualMoneta]},async()=>({ok:true,text:async()=>samples.moneta}),
  new Date('2026-11-24T01:00:00Z'));
assert.equal(automaticAgain.failed,0);
assert.equal(automaticAgain.data.banks[0].verifiedManually,undefined);
assert.match(automaticAgain.data.banks[0].conditions,/Fixace 3 roky/);
const indexUrl='https://financetomastik.cz/index-hypotek/';
const indexFixture='<p>Index hypoték Finance Tomaštík · stav k 23. 11. 2026</p>'+
  '<h2>Tabulka bank: 3 a 5 let, úvěr do 80 % ceny nemovitosti</h2>'+
  '<table><tr data-b="moneta"><td>MONETA Money Bank</td><td data-l="3 roky"><b>4,99&nbsp;%</b></td>'+
  '<td data-l="5 let">5,39 %</td><td>včetně slevy za účet 0,5 a pojištění 0,2</td>'+
  '<td><a href="https://www.moneta.cz/dokumenty-ke-stazeni/sazebniky">úrokový lístek – hypotéky</a> · od 6. 11. 2026</td></tr></table>'+
  '<p>Úrokové lístky a kalkulačky bank uvedené v tabulce, ověřeno 23. 11. 2026.</p>';
const indexed=(html,date)=>update({banks:[manualMoneta]},async url=>url===indexUrl
  ?{ok:true,text:async()=>html}
  :{ok:false,status:403},new Date(date));
const fallback=await indexed(indexFixture,'2026-11-24T06:00:00Z');
assert.equal(fallback.failed,0);
assert.equal(fallback.data.banks[0].rate,4.99);
assert.equal(fallback.data.banks[0].rateSource,'tomastik-index');
assert.equal(fallback.data.banks[0].verifiedManually,undefined);
assert.equal(fallback.data.banks[0].checkedOn,'2026-11-23');
assert.equal(fallback.data.banks[0].expiresOn,'2026-12-01');
assert.equal(fallback.data.banks[0].minLoanExclusive,null);
assert.match(fallback.data.banks[0].conditions,/fixace 3 roky/);
const sameReport=await indexed(indexFixture,'2026-11-29T06:00:00Z');
assert.equal(sameReport.data.banks[0].expiresOn,'2026-12-01');
const oldReport=await indexed(indexFixture,'2026-12-01T00:00:00Z');
assert.equal(oldReport.failed,1);
assert.equal(oldReport.data.banks[0].status,'unavailable');
for(const invalid of [
  indexFixture.replace('stav k 23.','stav k 31.'),
  indexFixture.replace('ověřeno 23.','ověřeno 22.'),
  indexFixture.replace('pojištění 0,2','další produkt'),
  indexFixture.replace('data-l="3 roky"','data-l="1 rok"'),
  indexFixture.replace('od 6. 11. 2026','od 26. 11. 2026'),
  indexFixture.replace('https://www.moneta.cz/','https://example.invalid/'),
]){
  const rejected=await indexed(invalid,'2026-11-27T06:00:00Z');
  assert.equal(rejected.failed,1);
  assert.equal(rejected.data.banks[0].status,'unavailable');
}
assert.equal((await indexed(indexFixture,'2026-11-22T06:00:00Z')).failed,1);
const restoredOfficial=await update({banks:fallback.data.banks},async()=>({ok:true,text:async()=>samples.moneta}),
  new Date('2026-11-25T06:00:00Z'));
assert.equal(restoredOfficial.data.banks[0].rateSource,undefined);
assert.equal(restoredOfficial.data.banks[0].minLoanExclusive,1000000);

console.log('PASS parsers, changed terms, DST scheduling, partial failure, and fresh index fallback');
})().catch(e=>{console.error(e);process.exitCode=1});
