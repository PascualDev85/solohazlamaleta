import { chromium } from 'playwright';
const BASE='http://localhost:4323';
const b=await chromium.launch();
const ctx=await b.newContext(); const p=await ctx.newPage();

for (const url of ['/','/alsacia/ruta-pueblos-y-vinos/']) {
  await p.setViewportSize({width:390,height:800});
  await p.goto(BASE+url,{waitUntil:'networkidle'});
  console.log('=== FOCUS ORDER '+url+' ===');
  const seq=[];
  for (let i=0;i<12;i++){
    await p.keyboard.press('Tab');
    const info=await p.evaluate(()=>{
      const el=document.activeElement;
      if(!el||el===document.body) return null;
      const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
      return {tag:el.tagName.toLowerCase(),text:(el.textContent||'').trim().slice(0,28),
        y:+r.top.toFixed(0),x:+r.left.toFixed(0),w:+r.width.toFixed(0),h:+r.height.toFixed(0),
        outlineW:cs.outlineWidth,outlineStyle:cs.outlineStyle,outlineColor:cs.outlineColor,
        offset:cs.outlineOffset, inView: r.top>=0 && r.left>=0};
    });
    if(!info) break;
    seq.push(info);
  }
  console.log(JSON.stringify(seq,null,1));
}

// long-word overflow stress at 320
await p.setViewportSize({width:320,height:800});
await p.goto(BASE+'/alsacia/ruta-pueblos-y-vinos/',{waitUntil:'networkidle'});
const stress=await p.evaluate(()=>{
  const el=document.querySelector('main p');
  el.textContent='https://www.booking.com/hotel/fr/un-nombre-de-hotel-muy-largo-en-alsacia.es.html';
  const r=el.getBoundingClientRect();
  return {docScroll:document.documentElement.scrollWidth, inner:window.innerWidth,
    pRight:+r.right.toFixed(1), wrap:getComputedStyle(el).overflowWrap, wordBreak:getComputedStyle(el).wordBreak};
});
console.log('=== LONG TOKEN STRESS @320 ==='); console.log(JSON.stringify(stress));

// intermediate widths dl + scroll
console.log('=== INTERMEDIATE WIDTHS (guide) ===');
for (const w of [360,414,480,481,540,600,700,834,1024]){
  await p.setViewportSize({width:w,height:800});
  await p.goto(BASE+'/alsacia/ruta-pueblos-y-vinos/',{waitUntil:'networkidle'});
  const r=await p.evaluate(()=>{
    const dl=document.querySelector('.guide__summary dl');
    const dds=[...dl.querySelectorAll('dd')].map(d=>+d.getBoundingClientRect().width.toFixed(0));
    const dts=[...dl.querySelectorAll('dt')].map(d=>+d.getBoundingClientRect().width.toFixed(0));
    return {scroll:document.documentElement.scrollWidth,inner:innerWidth,
      cols:getComputedStyle(dl).gridTemplateColumns, minDdW:Math.min(...dds), dtW:Math.max(...dts)};
  });
  console.log(w, JSON.stringify(r));
}
await b.close();
