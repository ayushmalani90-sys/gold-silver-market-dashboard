const fmt=d=>d.toISOString().slice(0,10);

async function fetchStooq(symbol){
  const end=new Date();
  const start=new Date(end);
  start.setUTCDate(start.getUTCDate()-3650);
  const url=`https://stooq.com/q/d/l/?s=${symbol}&d1=${fmt(start)}&d2=${fmt(end)}&i=d`;
  const r=await fetch(url,{cache:'no-store'});
  if(!r.ok) throw new Error(`${symbol} history HTTP ${r.status}`);
  const text=(await r.text()).trim();
  const lines=text.split(/\r?\n/);
  if(lines.length<31) throw new Error(`${symbol} history unavailable`);
  const rows=lines.slice(1).map(line=>{
    const [date,open,high,low,close,volume]=line.split(',');
    return {date,open:+open,high:+high,low:+low,close:+close,volume:+volume};
  }).filter(x=>x.date&&[x.open,x.high,x.low,x.close].every(Number.isFinite));
  if(rows.length<30) throw new Error(`${symbol} history too short`);
  return rows;
}

function toRates(gold,silver){
  const rates={};
  for(const x of gold) rates[x.date]={...(rates[x.date]||{}),XAU:{open:x.open,high:x.high,low:x.low,close:x.close,volume:x.volume}};
  for(const x of silver) rates[x.date]={...(rates[x.date]||{}),XAG:{open:x.open,high:x.high,low:x.low,close:x.close,volume:x.volume}};
  return rates;
}

export default async function handler(req,res){
  try{
    const [gold,silver]=await Promise.all([fetchStooq('xauusd'),fetchStooq('xagusd')]);
    res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
    res.setHeader('CDN-Cache-Control','no-store');
    return res.status(200).json({success:true,source:'Stooq daily history',rates:toRates(gold,silver),updatedAt:new Date().toISOString()});
  }catch(e){
    return res.status(502).json({success:false,error:e.message,updatedAt:new Date().toISOString()});
  }
}
