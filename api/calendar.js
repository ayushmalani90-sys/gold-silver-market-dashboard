const SNAPSHOT = [
  {date:'2026-08-26T12:30:00Z',event:'PCE Price Index',category:'PCE',reference:'July 2026',importance:3,previous:'July release',source:'BEA'},
  {date:'2026-09-04T12:30:00Z',event:'Employment Situation / NFP',category:'Jobs',reference:'August 2026',importance:3,previous:'July release',source:'BLS'},
  {date:'2026-09-10T12:30:00Z',event:'PPI',category:'Inflation',reference:'August 2026',importance:3,previous:'July release',source:'BLS'},
  {date:'2026-09-11T12:30:00Z',event:'Consumer Price Index',category:'CPI',reference:'August 2026',importance:3,previous:'July release',source:'BLS'},
  {date:'2026-09-15T18:00:00Z',event:'FOMC Meeting',category:'Federal Reserve',reference:'Sep 15-16',importance:3,previous:'Current target decision',source:'Federal Reserve'},
  {date:'2026-09-16T18:30:00Z',event:'FOMC Press Conference',category:'Federal Reserve',reference:'Sep 16',importance:3,previous:'—',source:'Federal Reserve'},
  {date:'2026-09-30T12:30:00Z',event:'PCE Price Index',category:'PCE',reference:'August 2026',importance:3,previous:'July 2026',source:'BEA'},
  {date:'2026-10-02T12:30:00Z',event:'Employment Situation / NFP',category:'Jobs',reference:'September 2026',importance:3,previous:'August release',source:'BLS'},
  {date:'2026-10-14T12:30:00Z',event:'Consumer Price Index',category:'CPI',reference:'September 2026',importance:3,previous:'August release',source:'BLS'},
  {date:'2026-10-27T18:00:00Z',event:'FOMC Meeting',category:'Federal Reserve',reference:'Oct 27-28',importance:3,previous:'Sep decision',source:'Federal Reserve'},
  {date:'2026-10-29T12:30:00Z',event:'PCE Price Index',category:'PCE',reference:'September 2026',importance:3,previous:'August release',source:'BEA'}
];
const IST='Asia/Kolkata';
const DAY=86400000;
function dayKey(d){return new Intl.DateTimeFormat('en-CA',{timeZone:IST,year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
function dayDiff(from,to){const a=Date.parse(`${dayKey(from)}T00:00:00Z`),b=Date.parse(`${dayKey(to)}T00:00:00Z`);return Math.round((b-a)/DAY)}
function readThrough(event){const c=(event.category+' '+event.event).toLowerCase();if(c.includes('cpi')||c.includes('pce')||c.includes('ppi'))return'Hot inflation can pressure gold/silver via yields; softer data can support them.';if(c.includes('fomc')||c.includes('federal reserve'))return'Hawkish Fed can pressure metals; dovish expectations can support gold/silver.';if(c.includes('jobs')||c.includes('nfp'))return'Strong jobs can lift yields/dollar; weak jobs can increase rate-cut expectations.';return'Watch the release for changes in yields, the dollar and rate expectations.'}
export default async function handler(req,res){try{const now=new Date();const events=SNAPSHOT.filter(x=>Date.parse(x.date)>=now.getTime()-DAY).map(x=>{const d=new Date(x.date);return{...x,releaseDateIST:new Intl.DateTimeFormat('en-IN',{timeZone:IST,day:'2-digit',month:'short',year:'numeric'}).format(d),releaseTimeIST:new Intl.DateTimeFormat('en-IN',{timeZone:IST,hour:'2-digit',minute:'2-digit',hour12:false}).format(d),daysUntil:dayDiff(now,d),readThrough:readThrough(x)}}).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');res.setHeader('CDN-Cache-Control','no-store');return res.status(200).json({success:true,timezone:IST,events,updatedAt:new Date().toISOString(),forecastEnabled:false})}catch(e){res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');return res.status(500).json({success:false,error:e.message,events:[],updatedAt:new Date().toISOString()})}}
