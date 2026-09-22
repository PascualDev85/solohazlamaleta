import { chromium } from 'playwright';
const b=await chromium.launch();
for (const scheme of ['light','dark']){
const ctx=await b.newContext({colorScheme:scheme}); const p=await ctx.newPage();
await p.setViewportSize({width:320,height:800});
await p.goto('http://localhost:4327/alsacia/ruta-pueblos-y-vinos/',{waitUntil:'networkidle'});
const r=await p.evaluate(()=>{
 const parse=c=>{const m=c.match(/[\d.]+/g).map(Number);return{r:m[0],g:m[1],b:m[2],a:m[3]??1}};
 const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const cr=(a,bb)=>{const A=lum(a),B=lum(bb);const hi=Math.max(A,B),lo=Math.min(A,B);return +((hi+.05)/(lo+.05)).toFixed(2)};
 const bgOf=el=>{let n=el;while(n){const c=parse(getComputedStyle(n).backgroundColor);if(c.a>0)return c;n=n.parentElement}return{r:255,g:255,b:255}};
 const out=[];
 for(const sel of ['.badge','.badge--adapted','.guide__route','.guide__verified','.guide__stop-meta','.guide__effort','.guide__dateline','.notice--muted a','.notice--loud','.guide__tip','.guide__adjust strong','.lead']){
   const el=document.querySelector(sel); if(!el){out.push({sel,found:false});continue}
   const cs=getComputedStyle(el); const r2=el.getBoundingClientRect();
   out.push({sel,found:true,ratio:cr(parse(cs.color),bgOf(el)),fontPx:+parseFloat(cs.fontSize).toFixed(1),weight:cs.fontWeight,
     color:cs.color,bg:cs.backgroundColor,w:+r2.width.toFixed(1),h:+r2.height.toFixed(1),display:cs.display,right:+r2.right.toFixed(1)});
 }
 // classes in HTML with zero matching CSS rule
 const used=new Set(); document.querySelectorAll('[class]').forEach(e=>e.classList.forEach(c=>used.add(c)));
 const defined=new Set();
 for(const s of document.styleSheets){ try{ for(const rl of s.cssRules){ const t=rl.selectorText||''; (t.match(/\.[A-Za-z0-9_-]+/g)||[]).forEach(c=>defined.add(c.slice(1)));
   if(rl.cssRules) for(const r3 of rl.cssRules){(((r3.selectorText)||'').match(/\.[A-Za-z0-9_-]+/g)||[]).forEach(c=>defined.add(c.slice(1)))} } }catch(e){} }
 out.push({unstyledClasses:[...used].filter(c=>!defined.has(c))});
 return out;
});
console.log('### '+scheme); console.log(JSON.stringify(r,null,1));
await ctx.close();
}
await b.close();
