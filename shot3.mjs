import { chromium } from 'playwright';
const out='/private/tmp/claude-501/-Users-meta-Desktop-solo-haz-la-maleta/7294ab06-0403-4c2e-8085-32b0d1497cff/scratchpad/comp';
const sites=[
 ['sioh2','https://www.saltinourhair.com/portugal/portugal-road-trip/',[6000,9000,13000]],
 ['kimkim2','https://www.kimkim.com/c/iceland-in-10-days-5-unique-itineraries',[2500,6000,9000]],
 ['rexby2','https://rexby.com/explore',[1500,3000,5000]],
 ['gvplus','https://www.guiasviajarplus.com/ruta-por-alsacia/',[2500,6000,9000]],
];
const b=await chromium.launch();
for(const [n,url,offs] of sites){
  const ctx=await b.newContext({viewport:{width:1440,height:1000},userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36'});
  const p=await ctx.newPage();
  try{
    await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000}); await p.waitForTimeout(4000);
    let i=0; for(const o of offs){ i++; await p.evaluate(y=>window.scrollTo(0,y),o); await p.waitForTimeout(2500); await p.screenshot({path:`${out}/${n}-${i}.png`});}
    console.log('ok',n);
  }catch(e){console.log('FAIL',n,e.message.slice(0,70));}
  await ctx.close();
}
await b.close();
