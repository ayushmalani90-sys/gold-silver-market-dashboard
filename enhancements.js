(()=>{
const $=id=>document.getElementById(id);
const fmtINR=(v,d=0)=>v==null||!Number.isFinite(+v)?'—':'₹'+(+v).toLocaleString('en-IN',{maximumFractionDigits:d});
const oz=31.1034768;
let usdInr=88.0;
async function fx(){try{const r=await fetch('https://api.frankfurter.app/latest?from=USD&to=INR',{cache:'no-store'});const d=await r.json();if(d?.rates?.INR)usdInr=+d.rates.INR}catch(e){}}
function addINR(){
 const grid=document.querySelector('.grid'); if(!grid||document.getElementById('inrCard'))return;
 const s=document.createElement('section');s.id='inrCard';s.className='card wide';s.innerHTML='<div class="section">India Price View</div><div class="metrics"><div class="metric"><span>Gold 24K · ₹/10g</span><b id="inrGold">—</b></div><div class="metric"><span>Gold 22K · ₹/10g</span><b id="inrGold22">—</b></div><div class="metric"><span>Silver · ₹/kg</span><b id="inrSilver">—</b></div><div class="metric"><span>USD / INR</span><b id="usdInr">—</b></div></div><div class="muted" style="margin-top:10px">International spot converted to INR. Local bullion/jewellery premiums, taxes and dealer spreads are not included.</div>';
 const first=grid.children[2];grid.insertBefore(s,first||null);
}
function addTechnicalExplanation(){
 const card=[...document.querySelectorAll('.card')].find(x=>x.textContent.includes('Technical Framework'));if(!card||document.getElementById('technicalGuide'))return;
 const g=document.createElement('div');g.id='technicalGuide';g.style.cssText='margin-top:14px;padding:12px;background:#0d1728;border:1px solid #26344d;border-radius:12px;font-size:12px;line-height:1.6';g.innerHTML='<b>How to read the chart</b><br>• <b>20 EMA</b>: short-term trend. Price above it usually means stronger near-term momentum.<br>• <b>50 EMA</b>: medium-term trend. 20 EMA above 50 EMA is a bullish structure.<br>• <b>200 EMA</b>: long-term trend filter.<br>• <b>RSI</b>: momentum. Above 70 can be stretched; below 30 can be oversold. Neither is an automatic buy/sell signal.<br>• <b>MACD</b>: momentum/trend crossover tool.<br>• <b>ATR</b>: volatility; useful for realistic stop distances.<br>• <b>Support/Resistance</b>: recent price areas where buying/selling has repeatedly appeared.';card.appendChild(g)
}
function addMarketDrivers(){
 const anchor=[...document.querySelectorAll('.card')].find(x=>x.textContent.includes('Macro Inputs'));if(!anchor||document.getElementById('drivers'))return;
 const d=document.createElement('section');d.id='drivers';d.className='card wide';d.innerHTML='<div class="section">Market Drivers</div><div class="metrics"><div class="metric"><span>Dollar impact</span><b id="drvDxy">—</b></div><div class="metric"><span>Real yield impact</span><b id="drvReal">—</b></div><div class="metric"><span>Inflation backdrop</span><b id="drvInfl">—</b></div><div class="metric"><span>Silver relative value</span><b id="drvRatio">—</b></div></div><div class="muted" id="driverText" style="margin-top:10px">Waiting for macro data.</div>';
 anchor.parentNode.insertBefore(d,anchor.nextSibling)
}
function updateINR(){const g=window.live?.gold,s=window.live?.silver;if(g)$('inrGold').textContent=fmtINR(g*usdInr*10/oz);if(g)$('inrGold22').textContent=fmtINR(g*usdInr*10/oz*22/24);if(s)$('inrSilver').textContent=fmtINR(s*usdInr*1000/oz);$('usdInr').textContent='₹'+usdInr.toFixed(2)}
function updateDrivers(){const m=window.macro;if(!m)return;let d=m.dxy?.value,r=m.realTenYear?.value,c=m.corePce?.value;let ds=d==null?'—':d<100?'Supportive':'Headwind';let rs=r==null?'—':r<2?'Supportive':'Headwind';let inf=c==null?'—':c<3?'Softer':'Sticky';$('drvDxy').textContent=ds;$('drvReal').textContent=rs;$('drvInfl').textContent=inf;let ratio=window.live?.gold&&window.live?.silver?window.live.gold/window.live.silver:null;$('drvRatio').textContent=ratio?ratio.toFixed(1)+' — '+(ratio>80?'Silver relatively cheap':'More balanced'): '—';$('driverText').textContent='Gold is most sensitive here to the dollar and real yields; silver also responds to industrial-growth expectations and the gold/silver ratio.'}
function expose(){try{window.live=live;window.macro=macro}catch(e){}}
async function boot(){addINR();addTechnicalExplanation();addMarketDrivers();await fx();setInterval(fx,3600000);setInterval(()=>{try{updateINR();updateDrivers()}catch(e){}},5000);}
window.addEventListener('load',boot);setTimeout(boot,1500);
})();