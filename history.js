export default async function handler(req, res) {
  try {
    const key = process.env.COMMODITY_API_KEY;
    if (!key) return res.status(500).json({success:false,error:'COMMODITY_API_KEY is not configured on the server.'});
    const end = new Date();
    const start = new Date(end.getTime() - 365*24*60*60*1000);
    const fmt = d => d.toISOString().slice(0,10);
    const url = new URL('https://api.commoditypriceapi.com/v2/rates/time-series');
    url.searchParams.set('symbols','XAU,XAG');
    url.searchParams.set('startDate',fmt(start));
    url.searchParams.set('endDate',fmt(end));
    const r = await fetch(url, {headers:{'x-api-key':key}, cache:'no-store'});
    const data = await r.json();
    if (!r.ok || !data.success) return res.status(502).json({success:false,error:data?.error||'Historical feed error'});
    res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({success:true, data});
  } catch(e) { return res.status(500).json({success:false,error:e.message}); }
}
