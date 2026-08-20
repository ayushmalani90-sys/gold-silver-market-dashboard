const BLS = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
const FRED = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=';

async function blsSeries(ids) {
  const now = new Date();
  const endYear = now.getUTCFullYear();
  const startYear = endYear - 2;
  const r = await fetch(BLS, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({seriesid:ids,startyear:String(startYear),endyear:String(endYear)})
  });
  if(!r.ok) throw new Error('BLS HTTP '+r.status);
  const d = await r.json();
  if(d.status !== 'REQUEST_SUCCEEDED') throw new Error('BLS request failed');
  const out = {};
  for(const s of (d.Results?.series||[])) out[s.seriesID] = (s.data||[]).filter(x=>x.period && x.period.startsWith('M')).map(x=>({date:`${x.year}-${x.period.slice(1)}-01`,value:Number(x.value)})).sort((a,b)=>a.date.localeCompare(b.date));
  return out;
}

async function fred(id) {
  const r = await fetch(FRED+encodeURIComponent(id), {cache:'no-store'});
  if(!r.ok) throw new Error('FRED '+id+' HTTP '+r.status);
  const text = await r.text();
  const lines = text.trim().split(/\r?\n/).slice(1);
  return lines.map(line=>{const [date,value]=line.split(','); return {date,value:Number(value)}}).filter(x=>x.date && Number.isFinite(x.value));
}

function latest(a){return a?.length?a[a.length-1]:null}
function prev(a){return a?.length>1?a[a.length-2]:null}
function yoy(a){
  if(!a?.length)return null;
  const x=latest(a);
  const target=a.find(v=>v.date===`${String(Number(x.date.slice(0,4))-1).padStart(4,'0')}-${x.date.slice(5)}`);
  return target?((x.value/target.value)-1)*100:null;
}
function yoyAt(a, point){
  if(!point)return null;
  const target=a.find(v=>v.date===`${String(Number(point.date.slice(0,4))-1).padStart(4,'0')}-${point.date.slice(5)}`);
  return target?((point.value/target.value)-1)*100:null;
}
function seriesPayload(a, transform=null){
  const x=latest(a), p=prev(a);
  return {
    value: x ? (transform?transform(x,a):x.value) : null,
    date:x?.date ?? null,
    previous:p ? (transform?transform(p,a):p.value) : null,
    previousDate:p?.date ?? null,
    period:x?.date ?? null
  };
}

export default async function handler(req,res){
  try{
    const bls = await blsSeries(['CUUR0000SA0','CUUR0000SA0L1E','LNS14000000','CES0000000001']);
    const [pce,corePce,dgs10,real10,dxy,dff] = await Promise.all([
      fred('PCEPI'), fred('PCEPILFE'), fred('DGS10'), fred('DFII10'), fred('DTWEXBGS'), fred('DFF')
    ]);
    const cpi=bls['CUUR0000SA0']||[], coreCpi=bls['CUUR0000SA0L1E']||[], unemp=bls['LNS14000000']||[], nfp=bls['CES0000000001']||[];
    const result={
      cpi:seriesPayload(cpi,(x,a)=>yoyAt(a,x)),
      coreCpi:seriesPayload(coreCpi,(x,a)=>yoyAt(a,x)),
      pce:seriesPayload(pce,(x,a)=>yoyAt(a,x)),
      corePce:seriesPayload(corePce,(x,a)=>yoyAt(a,x)),
      unemployment:seriesPayload(unemp),
      nfp:{...seriesPayload(nfp),change:latest(nfp)&&prev(nfp)?latest(nfp).value-prev(nfp).value:null},
      tenYear:seriesPayload(dgs10),
      realTenYear:seriesPayload(real10),
      dxy:seriesPayload(dxy),
      fedEffective:seriesPayload(dff)
    };
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma','no-cache');
    res.setHeader('Expires','0');
    return res.status(200).json({success:true,data:result,updatedAt:new Date().toISOString()});
  }catch(e){return res.status(502).json({success:false,error:e.message});}
}
