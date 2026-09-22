import { chromium } from 'playwright';
const out = '/private/tmp/claude-501/-Users-meta-Desktop-solo-haz-la-maleta/7294ab06-0403-4c2e-8085-32b0d1497cff/scratchpad';
const base = 'http://localhost:4323';
const pages = [['home','/'],['guide','/alsacia/ruta-pueblos-y-vinos/']];
const vps = [['desktop',1280,900],['mobile',390,844],['xs',320,700]];
const b = await chromium.launch();
for (const [scheme] of [['light'],['dark']]) {
  for (const [vn,w,h] of vps) {
    const ctx = await b.newContext({viewport:{width:w,height:h}, deviceScaleFactor:2, colorScheme:scheme});
    const p = await ctx.newPage();
    for (const [name,path] of pages) {
      await p.goto(base+path,{waitUntil:'networkidle'});
      await p.screenshot({path:`${out}/${name}-${vn}-${scheme}.png`, fullPage: vn!=='xs'});
    }
    await ctx.close();
  }
}
await b.close();
console.log('ok');
