const SNAPSHOT = [
  {date:'2026-08-19T18:00:00Z', event:'FOMC Minutes', category:'Federal Reserve', reference:'July 28-29 meeting', importance:3, previous:'—', source:'Federal Reserve'},
  {date:'2026-08-26T12:30:00Z', event:'PCE Price Index', category:'PCE', reference:'July 2026', importance:3, previous:'July release', source:'BEA'},
  {date:'2026-09-04T12:30:00Z', event:'Employment Situation / NFP', category:'Jobs', reference:'August 2026', importance:3, previous:'July release', source:'BLS'},
  {date:'2026-09-10T12:30:00Z', event:'PPI', category:'Inflation', reference:'August 2026', importance:3, previous:'July release', source:'BLS'},
  {date:'2026-09-11T12:30:00Z', event:'Consumer Price Index', category:'CPI', reference:'August 2026', importance:3, previous:'July release', source:'BLS'},
  {date:'2026-09-15T18:00:00Z', event:'FOMC Meeting', category:'Federal Reserve', reference:'Sep 15-16', importance:3, previous:'Current target decision', source:'Federal Reserve'},
  {date:'2026-09-16T18:30:00Z', event:'FOMC Press Conference', category:'Federal Reserve', reference:'Sep 16', importance:3, previous:'—', source:'Federal Reserve'},
  {date:'2026-09-30T12:30:00Z', event:'PCE Price Index', category:'PCE', reference:'August 2026', importance:3, previous:'July release', source:'BEA'},
  {date:'2026-10-02T12:30:00Z', event:'Employment Situation / NFP', category:'Jobs', reference:'September 2026', importance:3, previous:'August release', source:'BLS'},
  {date:'2026-10-14T12:30:00Z', event:'Consumer Price Index', category:'CPI', reference:'September 2026', importance:3, previous:'August release', source:'BLS'},
  {date:'2026-10-27T18:00:00Z', event:'FOMC Meeting', category:'Federal Reserve', reference:'Oct 27-28', importance:3, previous:'Sep decision', source:'Federal Reserve'},
  {date:'2026-10-29T12:30:00Z', event:'PCE Price Index', category:'PCE', reference:'September 2026', importance:3, previous:'August release', source:'BEA'}
];
const IST='Asia/Kolkata';
function istParts(d){const p=new Intl.DateTimeFormat('en-CA',{timeZone:IST,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);return Object.fromEntries(p.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));}
function istYmd(d){const p=istParts(d);return `${p.year}-${p.month}-${p.day}`}
function todayIST(){return istYmd(new Date())}
function daysUntil(s){
  const eventDay=istYmd(new Date(s));
  const today=todayIST();
  const [ey,em,ed]=eventDay.split('-').map(Number);
  const [ty,tm,td]=today.split('-').map(Number);
  return Math.round((Date.UTC(ey,em-1,ed)-Date.UTC(ty,tm-1,td))/86400000);
}
export default async function handler(req,res){
  try{
    const today=todayIST();
    const events=SNAPSHOT.map(x=>({...x,localDate:istYmd(new Date(x.date)),daysUntil:daysUntil(x.date)})).sort((a,b)=>a.localDate.localeCompare(b.localDate));
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma','no-cache');
    res.setHeader('Expires','0');
    return res.status(200).json({success:true,events,todayIST:today,timezone:IST,updatedAt:new Date().toISOString(),forecastEnabled:false});
  }catch(e){return res.status(500).json({success:false,error:e.message,events:[]});}
}
