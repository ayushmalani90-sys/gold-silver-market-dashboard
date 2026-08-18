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
    const ts = g.updatedAt || s.updatedAt || new Date().toISOString();

    res.setHeader('Cache-Control','no-store,max-age=0');
    return res.status(200).json({
      success:true,
      source:'Gold API',
      sourceUrl:'https://gold-api.com',
      market:{weekend:false,day:new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'short'}).format(new Date()),closed:false},
      gold:{price:gold,change24h:null,previousClose:null,previousDate:null},
      silver:{price:silver,change24h:null,previousClose:null,previousDate:null},
      timestamp:ts,
      updatedAtReadable:g.updatedAtReadable || s.updatedAtReadable || 'recently'
    });
  } catch(e) {
    return res.status(502).json({success:false,error:e.message,source:'Gold API'});
  }
}
