const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function textFromHtml(html){
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const v=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return v<=0x10ffff?String.fromCodePoint(v):' ';})
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
}
function parseOffer(id,html){
  const t=textFromHtml(html);let m;
  if(id==='moneta')m=t.match(/Platné podmínky pro (\d+,\d{2}) % pro každého Sazba \1 % ročně platí pro všechny žadatele o hypotéku s (jednoletou|tříletou) fixací úrokové sazby, s LTV do 80 % a s výší úvěru nad 1 milion korun\./);
  if(id==='csas')m=t.match(/Hypotéka, která se vám přizpůsobí\.? S úrokem od (\d+,\d{2}) % ročně/);
  if(id==='kb')m=t.match(/Jak získat úrokovou sazbu (\d+,\d{2}) % p\. a\. Výhodná úroková sazba při splnění těchto podmínek\s*:\s*Směřování vašich příjmů na u nás vedený účet Uzavření smlouvy o rizikovém životním pojištění u Komerční pojišťovny, a\. s\. Uzavření smlouvy o pojištění zastavené nemovitosti u Komerční pojišťovny, a\.s\. Předložení PENB v energetické třídě A nebo B k zastavené nemovitosti/);
  if(!m)throw Error('Sazba nebo očekávané podmínky nebyly jednoznačně nalezeny');
  const rate=Number(m[1].replace(',','.'));
  if(rate<0.1||rate>20)throw Error('Sazba mimo povolený rozsah');
  if(id!=='moneta')return {rate};
  const fixation=m[2]==='jednoletou'?'1 rok':'3 roky';
  return {rate,maxLtv:80,minLoanExclusive:1000000,conditions:'Fixace '+fixation+', LTV do 80 %, úvěr nad 1 milion Kč. Schválení závisí na posouzení bankou.'};
}
const parseRate=(id,html)=>parseOffer(id,html).rate;
const monetaIndexUrl='https://financetomastik.cz/index-hypotek/';
function readCzechDate(match){
  if(!match)throw Error('Chybí datum v Indexu hypoték');
  const [,day,month,year]=match;
  const iso=year+'-'+month.padStart(2,'0')+'-'+day.padStart(2,'0');
  const date=new Date(iso+'T00:00:00Z');
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==iso)throw Error('Neplatné datum v Indexu hypoték');
  return iso;
}
function parseMonetaIndex(html,today){
  const text=textFromHtml(html);
  const checkedOn=readCzechDate(text.match(/Index hypoték Finance Tomaštík · stav k (\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/i));
  const confirmedOn=readCzechDate(text.match(/Úrokové lístky a kalkulačky bank uvedené v tabulce, ověřeno (\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/i));
  // The index updates weekly. Allow one day for its Monday publication and the next scheduled check.
  const expiry=new Date(checkedOn+'T00:00:00Z');
  expiry.setUTCDate(expiry.getUTCDate()+8);
  const expiresOn=expiry.toISOString().slice(0,10);
  if(checkedOn!==confirmedOn||checkedOn>today||today>=expiresOn)throw Error('Index hypoték neuvádí aktuální datum kontroly');
  if(!text.includes('Tabulka bank: 3 a 5 let, úvěr do 80 % ceny nemovitosti'))throw Error('Změnila se metodika LTV v Indexu hypoték');

  const rows=[...html.matchAll(/<tr\b[^>]*\bdata-b=(["'])moneta\1[^>]*>([\s\S]*?)<\/tr>/gi)];
  if(rows.length!==1)throw Error('MONETA v Indexu hypoték nebyla jednoznačně nalezena');
  const row=rows[0][2];
  const rates=[...row.matchAll(/<td\b[^>]*\bdata-l=(["'])3 roky\1[^>]*>([\s\S]*?)<\/td>/gi)];
  const listedRate=rates.length===1&&textFromHtml(rates[0][2]).match(/^(\d{1,2},\d{2}) %$/);
  const terms=textFromHtml(row);
  const bankSource=/\bhref=(["'])https:\/\/www\.moneta\.cz\/(?:dokumenty-ke-stazeni\/sazebniky|documents\/[^"'\s]+)\1/i.test(row);
  if(!listedRate||!bankSource||!/slevy za účet \d+,\d+ a pojištění \d+,\d+/i.test(terms))throw Error('Chybí sazba nebo doložené podmínky MONETY');
  const effectiveOn=readCzechDate(terms.match(/úrokový lístek[^·]* · od (\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/i));
  const rate=Number(listedRate[1].replace(',','.'));
  if(effectiveOn>checkedOn||rate<0.1||rate>20)throw Error('Neplatná ceníková sazba MONETY');
  return {
    rate,checkedOn,expiresOn,maxLtv:80,minLoanExclusive:null,rateSource:'tomastik-index',
    conditions:'Ceníková sazba od, fixace 3 roky, LTV do 80 %. Zahrnuje slevu za aktivní účet a pojištění schopnosti splácet. Modelová splátka je bez pojistného.'
  };
}
const pragueDate=now=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Prague'}).format(now);
function scheduleMatches(cron,now){
  const offset=new Intl.DateTimeFormat('en',{timeZone:'Europe/Prague',timeZoneName:'shortOffset'}).formatToParts(now).find(p=>p.type==='timeZoneName').value;
  return cron===(offset==='GMT+2'?'0 23 * * *':'0 0 * * *');
}
async function update(data,fetcher=fetch,now=new Date()){
  const checkedOn=pragueDate(now),expiry=new Date(checkedOn+'T00:00:00Z');expiry.setUTCDate(expiry.getUTCDate()+3);
  const results=await Promise.allSettled(data.banks.map(async bank=>{
    const response=await fetcher(bank.source,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'FinanceOndrejKrapka-rate-check/1.0'}});
    const {verifiedManually,rateSource,...previous}=bank;
    let offer;
    if(response.ok){
      offer={...parseOffer(bank.id,await response.text()),checkedOn,expiresOn:expiry.toISOString().slice(0,10)};
    }else if(bank.id==='moneta'&&response.status===403){
      try{
        const index=await fetcher(monetaIndexUrl,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'DanielNemecweb-rate-check/1.0'}});
        if(!index.ok)throw Error('HTTP '+index.status);
        offer=parseMonetaIndex(await index.text(),checkedOn);
        console.log('moneta: verified using Index hypoték Finance Tomaštík ('+offer.checkedOn+')');
      }catch(error){
        throw Object.assign(Error('HTTP 403; Index hypoték: '+error.message),{httpStatus:403});
      }
    }else{
      throw Error('HTTP '+response.status);
    }
    return {...previous,...offer,checkedAt:now.toISOString(),status:'verified',lastAttemptAt:now.toISOString()};
  }));
  let failed=0;
  const banks=results.map((result,index)=>{
    if(result.status==='fulfilled')return result.value;
    failed++;
    const bank=data.banks[index];
    console.error(bank.id+': '+result.reason.message);
    // A recent manual check of the official offer still expires on its original date.
    const manualStillCurrent=bank.id==='moneta'&&bank.status==='verified'&&bank.verifiedManually===true&&
      result.reason.httpStatus===403&&bank.checkedOn<=checkedOn&&checkedOn<bank.expiresOn;
    return {...bank,status:manualStillCurrent?'verified':'unavailable',lastAttemptAt:now.toISOString()};
  });
  return {data:{...data,automatic:true,banks},failed};
}
async function main(){
  if(process.argv.includes('--schedule-check')){
    const run=process.env.GITHUB_EVENT_NAME!=='schedule'||scheduleMatches(process.env.RATE_SCHEDULE,new Date());
    fs.appendFileSync(process.env.GITHUB_OUTPUT,'run='+run+'\n');return;
  }
  const file=path.join(root,'bank-rates-data.js');
  const data=JSON.parse(fs.readFileSync(file,'utf8').split('window.mortgageBankData = ')[1].trim().replace(/;$/,''));
  const result=await update(data);
  const temp=file+'.tmp';fs.writeFileSync(temp,'// Automatically checked public starting rates. See scripts/update-bank-rates.cjs.\nwindow.mortgageBankData = '+JSON.stringify(result.data,null,2)+';\n');fs.renameSync(temp,file);
  const verified=data.banks.length-result.failed;
  console.log('Verified '+verified+'/'+data.banks.length+' banks.');
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'failed='+result.failed+'\nverified='+verified+'\n');
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'Verified '+(data.banks.length-result.failed)+'/'+data.banks.length+' bank sources. Unverified rates are hidden until verification succeeds.\n');
}
module.exports={parseRate,textFromHtml,scheduleMatches,update};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
