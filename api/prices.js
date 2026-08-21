export default async function handler(req,res) {
  try {
    const fetchPrice = async (symbol) => {
      const r = await fetch(`https://api.gold-api.com/price/${symbol}`, {cache:'no-store'});
      const data = await r.json();
      if (!r.ok || !Number.isFinite(Number(data?.price))) throw new Error(`${symbol} live price unavailable`);
      return data;
    };

    const [g,s] = await Promise.all([fetchPrice('XAU'), fetchPrice('XAG')]);
    const gold = Number(g.price), silver = Number(s.price);
    const now = new Date();

    // Gold API fields vary by response/version; keep the live price authoritative and
    // calculate no 24h change when the upstream value is absent rather than inventing one.
    const goldChange = Number.isFinite(Number(g.changePercent)) ? Number(g.changePercent) : null;
    const silverChange = Number.isFinite(Number(s.changePercent)) ? Number(s.changePercent) : null;

    res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
    res.setHeader('CDN-Cache-Control','no-store');
    return res.status(200).json({
      success:true,
      source:'Gold API',
      sourceUrl:'https://gold-api.com',
      market:{weekday:new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'short'}).format(now),timezone:'Asia/Kolkata',closed:false},
      gold:{price:gold,change24h:goldChange,previousClose:Number.isFinite(Number(g.previousClose))?Number(g.previousClose):null,previousDate:g.previousDate||null},
      silver:{price:silver,change24h:silverChange,previousClose:Number.isFinite(Number(s.previousClose))?Number(s.previousClose):null,previousDate:s.previousDate||null},
      timestamp:g.updatedAt || s.updatedAt || now.toISOString(),
      updatedAtReadable:g.updatedAtReadable || s.updatedAtReadable || 'recently'
    });
  } catch(e) {
    res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
    return res.status(502).json({success:false,error:e.message,source:'Gold API',updatedAt:new Date().toISOString()});
  }
}
