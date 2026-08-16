const SNAPSHOT = [
  {date:'2026-08-19T18:00:00Z',event:'FOMC Minutes',category:'Federal Reserve',reference:'July 28-29 meeting',importance:3,previous:'—',source:'Federal Reserve'},
  {date:'2026-08-26T12:30:00Z',event:'PCE Price Index',category:'PCE',reference:'July 2026',importance:3,previous:'July release',source:'BEA'},
  {date:'2026-09-04T12:30:00Z',event:'Employment Situation / NFP',category:'Jobs',reference:'August 2026',importance:3,previous:'July release',source:'BLS'},
  {date:'2026-09-10T12:30:00Z',event:'PPI',category:'Inflation',reference:'August 2026',importance:3,previous:'July release',source:'BLS'},
  {date:'2026-09-11T12:30:00Z',event:'Consumer Price Index',category:'CPI',reference:'August 2026',importance:3,previous:'July release',source:'BLS'},
  {date:'2026-09-15T18:00:00Z',event:'FOMC Meeting',category:'Federal Reserve',reference:'Sep 15-16',importance:3,previous:'Current target decision',source:'Federal Reserve'},
  {date:'2026-09-16T18:30:00Z',event:'FOMC Press Conference',category:'Federal Reserve',reference:'Sep 16',importance:3,previous:'—',source:'Federal Reserve'},
  {date:'2026-09-30T12:30:00Z',event:'PCE Price Index',category:'PCE',reference:'August 2026',importance:3,previous:'July release',source:'BEA'},
  {date:'2026-10-02T12:30:00Z',event:'Employment Situation / NFP',category:'Jobs',reference:'September 2026',importance:3,previous:'August release',source:'BLS'},
  {date:'2026-10-14T12:30:00Z',event:'Consumer Price Index',category:'CPI',reference:'September 2026',importance:3,previous:'August 2026',source:'BLS'},
  {date:'2026-10-27T18:00:00Z',event:'FOMC Meeting',category:'Federal Reserve',reference:'Oct 27-28',importance:3,previous:'Sep decision',source:'Federal Reserve'},
  {date:'2026-10-29T12:30:00Z',event:'PCE Price Index',category:'PCE',reference:'September 2026',importance:3,previous:'August 2026',source:'BEA'}
];

function daysUntil(date){
  return Math.ceil((new Date(date)-new Date())/86400000);
}

function readThrough(event){
  const c=(event.category+' '+event.event).toLowerCase();
  if(c.includes('cpi')||c.includes('pce')||c.includes('ppi')) return 'Hot inflation can pressure gold/silver via yields; softer data can support them.';
  if(c.includes('fomc')||c.includes('federal reserve')) return 'Hawkish Fed can pressure metals; dovish expectations can support gold/silver.';
  if(c.includes('jobs')||c.includes('nfp')) return 'Strong jobs can lift yields/dollar; weak jobs can increase rate-cut expectations.';
  return 'Watch the release for changes in yields, the dollar and rate expectations.';
}

export default async function handler(req,res){
  try{
    const now=Date.now();
    const events=SNAPSHOT
      .filter(x=>new Date(x.date).getTime()>=now-86400000)
      .map(x=>({...x,daysUntil:daysUntil(x.date),readThrough:readThrough(x)}))
      .sort((a,b)=>new Date(a.date)-new Date(b.date));

    res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({success:true,events,updatedAt:new Date().toISOString(),forecastEnabled:false});
  }catch(e){
    return res.status(500).json({success:false,error:e.message,events:[]});
  }
}
