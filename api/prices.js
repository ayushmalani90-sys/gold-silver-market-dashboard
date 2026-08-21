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
    const ts = g.updatedAt || s.updatedAt || now.toISOString();
    const weekday = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'short'}).format(now);

    res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
    res.setHeader('CDN-Cache-Control','no-store');
    return res.status(200).json({
      success:true,
      source:'Gold API',
      sourceUrl:'https://gold-api.com',
      market:{weekday,timezone:'Asia/Kolkata',closed:false,requestedAt:now.toISOString()},
      gold:{price:gold,change24h:Number.isFinite(Number(g.changePercent))?Number(g.changePercent):null,previousClose:Number.isFinite(Number(g.previousClose))?Number(g.previousClose):null,previousDate:g.previousDate||null},
      silver:{price:silver,change24h:Number.isFinite(Number(s.changePercent))?Number(s.changePercent):null,previousClose:Number.isFinite(Number(s.previousClose))?Number(s.previousClose):null,previousDate:s.previousDate||null},
      timestamp:ts,
      updatedAtReadable:g.updatedAtReadable || s.updatedAtReadable || 'recently'
    });
  } catch(e) {
    res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
    return res.status(502).json({success:false,error:e.message,source:'Gold API',updatedAt:new Date().toISOString()});
  }
}
