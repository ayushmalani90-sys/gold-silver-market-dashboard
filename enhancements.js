(()=>{
'use strict';
const $=id=>document.getElementById(id);
let history={gold:[],silver:[]}, selected='gold', days=90, overlayChart=null, overlayWrap=null;
function normalize(d){
  const out={gold:[],silver:[]}, rates=d?.rates||d?.data?.rates||{};
  for(const [date,x] of Object.entries(rates)){
    for(const [sym,key] of [['XAU','gold'],['XAG','silver']]) if(x?.[sym]) out[key].push({time:date,open:+x[sym].open,high:+x[sym].high,low:+x[sym].low,close:+x[sym].close});
  }
  out.gold.sort((a,b)=>a.time.localeCompare(b.time));
  out.silver.sort((a,b)=>a.time.localeCompare(b.time));
  return out;
}
function visible(){const a=history[selected]||[];return a.slice(-days)}
function levels(rows){if(!rows.length)return null;const r=rows.slice(-Math.min(60,rows.length));return{support:Math.min(...r.map(x=>x.low)),resistance:Math.max(...r.map(x=>x.high))}}
function cleanup(){if(overlayChart){try{overlayChart.remove()}catch(e){}}overlayChart=null;if(overlayWrap){overlayWrap.remove();overlayWrap=null}}
function drawOverlay(){
  const host=$('chart'),rows=visible();if(!host||!rows.length||!window.LightweightCharts)return;
  const lv=levels(rows);if(!lv)return;cleanup();
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  overlayWrap=document.createElement('div');overlayWrap.id='srOverlay';Object.assign(overlayWrap.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:'3'});host.appendChild(overlayWrap);
  overlayChart=LightweightCharts.createChart(overlayWrap,{layout:{background:{color:'transparent'},textColor:'transparent'},grid:{vertLines:{visible:false},horzLines:{visible:false}},rightPriceScale:{visible:false,borderVisible:false},leftPriceScale:{visible:false,borderVisible:false},timeScale:{visible:false,borderVisible:false,timeVisible:false,secondsVisible:false},handleScroll:false,handleScale:false,crosshair:{mode:0}});
  const hi=overlayChart.addLineSeries({lineVisible:false,lastValueVisible:false,priceLineVisible:false,crosshairMarkerVisible:false});
  const lo=overlayChart.addLineSeries({lineVisible:false,lastValueVisible:false,priceLineVisible:false,crosshairMarkerVisible:false});
  hi.setData(rows.map(x=>({time:x.time,value:x.high})));lo.setData(rows.map(x=>({time:x.time,value:x.low})));
  const s=overlayChart.addLineSeries({color:'#32c48d',lineWidth:2,lastValueVisible:false,priceLineVisible:false,crosshairMarkerVisible:false});
  const r=overlayChart.addLineSeries({color:'#ef6262',lineWidth:2,lastValueVisible:false,priceLineVisible:false,crosshairMarkerVisible:false});
  s.setData(rows.map(x=>({time:x.time,value:lv.support})));r.setData(rows.map(x=>({time:x.time,value:lv.resistance})));
  overlayChart.timeScale().fitContent();
}
async function load(){try{const r=await fetch('/api/history',{cache:'no-store'}),d=await r.json();if(!r.ok||!d.success)return;history=normalize(d);setTimeout(drawOverlay,250)}catch(e){}}
function hook(){
  document.querySelectorAll('[data-metal]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.metal;setTimeout(drawOverlay,300)}));
  document.querySelectorAll('[data-days]').forEach(b=>b.addEventListener('click',()=>{days=+b.dataset.days;setTimeout(drawOverlay,300)}));
  window.addEventListener('resize',()=>{if(overlayChart&&overlayWrap)overlayChart.applyOptions({width:overlayWrap.clientWidth,height:overlayWrap.clientHeight})});
}
function addLegend(){if($('srLegend'))return;const host=$('chart');if(!host)return;if(getComputedStyle(host).position==='static')host.style.position='relative';const el=document.createElement('div');el.id='srLegend';el.innerHTML='<span style="color:#32c48d">● Support</span>&nbsp;&nbsp;<span style="color:#ef6262">● Resistance</span>';Object.assign(el.style,{position:'absolute',left:'10px',top:'8px',zIndex:'5',fontSize:'11px',background:'rgba(7,16,28,.75)',padding:'5px 8px',borderRadius:'7px',border:'1px solid #26344d'});host.appendChild(el)}
function start(){hook();addLegend();load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();