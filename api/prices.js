function istDay() {
  const s = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'short'}).format(new Date());
  return s;
}

async function previousClose(key, symbol) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate()-1);
  const date = d.toISOString().slice(0,10);
  const url = new URL('https://api.commoditypriceapi.com/v2/rates/historical');
  url.searchParams.set('symbols',symbol);
  url.searchParams.set('date',date);
  const r = await fetch(url,{headers:{'x-api-key':key},cache:'no-store'});
  const data = await r.json();
  if(!r.ok || !data.success) throw new Error(data?.error||'Historical close error');
  const x = data.rates?.[symbol];
  return {close:Number(x?.close),date:x?.date||data.date};
}

export default async function handler(req,res) {
  try {
    const key = process.env.COMMODITY_API_KEY;
    if (!key) return res.status(500).json({success:false,error:'COMMODITY_API_KEY is not configured on the server.'});
    const url = new URL('https://api.commoditypriceapi.com/v2/rates/latest');
    url.searchParams.set('symbols','XAU,XAG');
    url.searchParams.set('quote','USD');
    const r = await fetch(url,{headers:{'x-api-key':key},cache:'no-store'});
    const data = await r.json();
    if(!r.ok || !data.success) return res.status(502).json({success:false,error:data?.error||'Upstream price feed error'});
    const gold=Number(data.rates?.XAU), silver=Number(data.rates?.XAG);
    if(!Number.isFinite(gold)||!Number.isFinite(silver)) return res.status(502).json({success:false,error:'XAU/XAG missing from provider response'});

    const day=istDay();
    const weekend=day==='Sat'||day==='Sun';
    let gClose=null,sClose=null;
    // Only calculate previous-session change on weekdays. Weekend intentionally shows no daily change.
    if(!weekend){
      try{ [gClose,sClose]=await Promise.all([previousClose(key,'XAU'),previousClose(key,'XAG')]); }catch(e){ /* keep live prices even if historical lookup fails */ }
    }
    const gChange=(!weekend&&gClose&&Number.isFinite(gClose.close))?(gold/gClose.close-1):null;
    const sChange=(!weekend&&sClose&&Number.isFinite(sClose.close))?(silver/sClose.close-1):null;
    const ts=data.timestamp?new Date(Number(data.timestamp)*1000).toISOString():new Date().toISOString();
    res.setHeader('Cache-Control','no-store,max-age=0');
    return res.status(200).json({success:true,market:{weekend,day,closed:weekend},gold:{price:gold,change24h:gChange,previousClose:gClose?.close??null,previousDate:gClose?.date??null},silver:{price:silver,change24h:sChange,previousClose:sClose?.close??null,previousDate:sClose?.date??null},timestamp:ts});
  }catch(e){return res.status(500).json({success:false,error:e.message});}
}
