import { chromium } from 'playwright';

const BASE = 'http://localhost:4323';
const PAGES = ['/', '/alsacia/ruta-pueblos-y-vinos/', '/afiliacion/'];
const WIDTHS = [320, 390, 768, 1280];

const probe = () => {
  const out = {};
  const de = document.documentElement;
  out.innerWidth = window.innerWidth;
  out.scrollWidth = de.scrollWidth;
  out.bodyScrollWidth = document.body.scrollWidth;

  // overflow offenders
  const over = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.visibility === 'hidden') continue;
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) {
      over.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className && String(el.className).slice(0, 60),
        left: +r.left.toFixed(1), right: +r.right.toFixed(1), width: +r.width.toFixed(1),
        text: (el.textContent || '').trim().slice(0, 40),
      });
    }
  }
  out.overflow = over.slice(0, 15);

  // landmark alignment
  const box = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { left: +r.left.toFixed(2), width: +r.width.toFixed(2), right: +r.right.toFixed(2),
      padLeft: cs.paddingLeft, padRight: cs.paddingRight };
  };
  out.landmarks = { header: box('header'), main: box('main'), footer: box('footer') };

  // inner content gutter: first paragraph / heading inside main
  const inner = [];
  for (const sel of ['main h1', 'main p', 'main li', '.guide__summary dt', '.guide__summary dd', 'footer a', 'footer p']) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    inner.push({ sel, left: +r.left.toFixed(2), right: +r.right.toFixed(2), gapRight: +(window.innerWidth - r.right).toFixed(2) });
  }
  out.gutters = inner;

  // touch targets
  const tt = [];
  for (const el of document.querySelectorAll('a, button, [role="button"], input, select')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (el.classList.contains('skip-link')) continue;
    if (r.width < 24 || r.height < 24) {
      tt.push({ tag: el.tagName.toLowerCase(), text: (el.textContent||'').trim().slice(0,30),
        w: +r.width.toFixed(1), h: +r.height.toFixed(1),
        inText: !!el.closest('p, li, dd, span') });
    }
  }
  out.touch = tt;

  // spacing between adjacent inline targets (2.5.8 spacing exception needs 24px circle)
  const links = [...document.querySelectorAll('footer nav a')].map(a => {
    const r = a.getBoundingClientRect();
    return { t: a.textContent.trim(), x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  });
  out.footerLinks = links;

  // headings
  out.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .map(h => ({ level: +h.tagName[1], text: h.textContent.trim().slice(0, 45) }));

  // dl layout
  const dl = document.querySelector('.guide__summary dl');
  if (dl) {
    const cs = getComputedStyle(dl);
    out.dl = { cols: cs.gridTemplateColumns, rowGap: cs.rowGap, colGap: cs.columnGap };
    const dt = dl.querySelector('dt'), dd = dl.querySelector('dd');
    out.dlItems = { dt: dt.getBoundingClientRect().top, dd: dd.getBoundingClientRect().top,
      dtLeft: dt.getBoundingClientRect().left, ddLeft: dd.getBoundingClientRect().left,
      ddMarginBottom: getComputedStyle(dd).marginBottom,
      ddRight: +dd.getBoundingClientRect().right.toFixed(1),
      ddWidth: +dd.getBoundingClientRect().width.toFixed(1) };
  }

  // contrast
  const parse = (c) => {
    const m = c.match(/[\d.]+/g).map(Number);
    return { r: m[0], g: m[1], b: m[2], a: m[3] === undefined ? 1 : m[3] };
  };
  const lum = ({r,g,b}) => {
    const f = v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
  };
  const ratio = (a,b) => { const L1=lum(a), L2=lum(b); const hi=Math.max(L1,L2), lo=Math.min(L1,L2); return (hi+0.05)/(lo+0.05); };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.a > 0) return c;
      n = n.parentElement;
    }
    return { r:255,g:255,b:255,a:1 };
  };
  const seen = new Map();
  for (const el of document.querySelectorAll('body *')) {
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const fg = parse(cs.color);
    const bg = bgOf(el);
    const fs = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight) >= 700;
    const large = fs >= 24 || (fs >= 18.66 && bold);
    const cr = +ratio(fg, bg).toFixed(2);
    const need = large ? 3 : 4.5;
    const key = `${cs.color}|${cs.backgroundColor}|${el.className}|${fs}`;
    if (seen.has(key)) continue;
    seen.set(key, 1);
    if (cr < need) {
      // also check border/ui
      (out.contrast ||= []).push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0,40),
        text: el.textContent.trim().slice(0,35), fg: cs.color, bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
        fontPx: +fs.toFixed(1), bold, ratio: cr, required: need });
    }
  }
  out.contrast ||= [];
  return out;
};

const browser = await chromium.launch();
const results = {};
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      const r = await page.evaluate(probe);
      results[`${scheme} ${p} @${w}`] = r;
    }
  }
  await ctx.close();
}
console.log(JSON.stringify(results, null, 1));
await browser.close();
