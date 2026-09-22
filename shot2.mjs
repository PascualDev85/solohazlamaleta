import { chromium } from 'playwright';
const out = '/private/tmp/claude-501/-Users-meta-Desktop-solo-haz-la-maleta/7294ab06-0403-4c2e-8085-32b0d1497cff/scratchpad/comp';
import fs from 'fs'; fs.mkdirSync(out,{recursive:true});
const sites = [
 ['viajeroscallejeros','https://www.viajeroscallejeros.com/ruta-alsacia-francia/'],
 ['touristear','https://touristear.com/ruta-de-4-dias-por-la-alsacia/'],
 ['comiviajeros','https://comiviajeros.com/ruta-en-coche-por-alsacia/'],
 ['guiasviajarplus','https://www.guiasviajarplus.com/ruta-por-alsacia/'],
 ['saltinourhair','https://www.saltinourhair.com/portugal/portugal-road-trip/'],
 ['wanderlush','https://wander-lush.org/georgia-itinerary-2-weeks/'],
 ['alongdustyroads','https://www.alongdustyroads.com/posts/patagonia-itinerary'],
 ['thatch','https://www.thatch.co/'],
 ['rexby','https://rexby.com/'],
 ['kimkim','https://www.kimkim.com/c/iceland-itineraries'],
];
const b = await chromium.launch();
for (const [name,url] of sites){
  for (const [vn,w,h] of [['d',1440,1000],['m',390,844]]){
    const ctx = await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36'});
    const p = await ctx.newPage();
    try{
      await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
      await p.waitForTimeout(4000);
      await p.screenshot({path:`${out}/${name}-${vn}-1.png`});
      await p.evaluate(()=>window.scrollBy(0,2600)); await p.waitForTimeout(2500);
      await p.screenshot({path:`${out}/${name}-${vn}-2.png`});
      await p.evaluate(()=>window.scrollBy(0,3500)); await p.waitForTimeout(2500);
      await p.screenshot({path:`${out}/${name}-${vn}-3.png`});
      console.log('ok',name,vn);
    }catch(e){ console.log('FAIL',name,vn,e.message.slice(0,80)); }
    await ctx.close();
  }
}
await b.close();
