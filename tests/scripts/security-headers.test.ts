import { test } from 'node:test'
import assert from 'node:assert'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import {
  GENERATED_MARKER, MAX_RULES, buildPolicy, hashSource, headersFor, inspectPage, pagePath, parseHeaders, withPolicies,
} from '../../scripts/security-headers.ts'

const sha = (body: string) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`

test('inspectPage collects inline scripts and styles, but not JSON-LD', () => {
  const html = `<html><head><style>a{color:red}</style>
    <script type="application/ld+json">{"@type":"Article"}</script></head>
    <body><script>console.log(1)</script><script type="module">import('x')</script></body></html>`
  const { assets, problems } = inspectPage(html)
  assert.deepStrictEqual(assets.inlineScripts, ['console.log(1)', "import('x')"])
  assert.deepStrictEqual(assets.inlineStyles, ['a{color:red}'])
  assert.deepStrictEqual(problems, [])
})

test('inspectPage tells own files from third-party ones', () => {
  const own = inspectPage('<script type="module" src="/_astro/a.js"></script><link rel="stylesheet" href="/_astro/a.css">')
  assert.strictEqual(own.assets.selfScripts, true)
  assert.strictEqual(own.assets.selfStyles, true)
  assert.deepStrictEqual(own.problems, [])

  const { problems } = inspectPage(
    '<script src="https://cdn.example.com/x.js"></script><link rel="stylesheet" href="//fonts.example.com/f.css">'
      + '<img src="https://maps.example.com/m.png"><img srcset="/a.webp 1x, https://cdn.example.com/b.webp 2x">'
      + '<style>@font-face{src:url(https://fonts.example.com/f.woff2)}</style>',
  )
  assert.deepStrictEqual(problems, [
    'third-party script: https://cdn.example.com/x.js',
    'third-party stylesheet: //fonts.example.com/f.css',
    'third-party img: https://maps.example.com/m.png',
    'third-party img: https://cdn.example.com/b.webp',
    'third-party CSS resource: https://fonts.example.com/f.woff2',
  ])
})

test('inspectPage reports what a strict policy would block', () => {
  const { problems } = inspectPage('<button onclick="go()">Ir</button><a href="javascript:void 0">x</a>')
  assert.strictEqual(problems.length, 2)
  assert.match(problems[0], /inline event handler \(onclick\)/)
  assert.match(problems[1], /javascript: URL/)
})

test('inspectPage notices style attributes and data: images, not lookalikes in text or scripts', () => {
  const html = `<p>Hay que pagar on="sitio" style=x</p><script>el.setAttribute('style','x')</script>
    <li style="--share: 0.5"></li><style>.i{background:url("data:image/svg+xml,%3Csvg%3E")}</style>`
  const { assets, problems } = inspectPage(html)
  assert.strictEqual(assets.styleAttributes, true)
  assert.strictEqual(assets.dataImages, true)
  assert.deepStrictEqual(problems, [])

  const plain = inspectPage('<p>Sin estilos on="x"</p><a href="https://maps.google.com/?q=x">Mapa</a>')
  assert.strictEqual(plain.assets.styleAttributes, false)
  assert.strictEqual(plain.assets.dataImages, false)
  assert.deepStrictEqual(plain.problems, [])
})

test('hashSource is the base64 SHA-256 of the exact body, whitespace included', () => {
  assert.strictEqual(hashSource('\n  a()\n'), sha('\n  a()\n'))
  assert.notStrictEqual(hashSource('a()'), hashSource(' a()'))
})

test('buildPolicy allows exactly what the page uses', () => {
  const policy = buildPolicy({
    inlineScripts: ['a()', 'b()'], inlineStyles: ['p{}'], selfScripts: false, selfStyles: false, styleAttributes: true, dataImages: true,
  })
  const directives = Object.fromEntries(policy.split('; ').map((d) => [d.split(' ')[0], d.slice(d.indexOf(' ') + 1)]))
  assert.strictEqual(directives['default-src'], "'none'")
  assert.strictEqual(directives['script-src'], `${sha('a()')} ${sha('b()')}`)
  assert.strictEqual(directives['style-src-elem'], sha('p{}'))
  assert.strictEqual(directives['style-src-attr'], "'unsafe-inline'")
  assert.strictEqual(directives['img-src'], "'self' data:")
  assert.strictEqual(directives['font-src'], "'self'")
  assert.strictEqual(directives['frame-ancestors'], "'none'")
  assert.strictEqual(directives['base-uri'], "'none'")
  assert.ok(!/unsafe-inline/.test(directives['script-src']))
})

test('buildPolicy closes what the page does not use, and dedupes identical bodies', () => {
  const policy = buildPolicy({
    inlineScripts: [], inlineStyles: ['p{}', 'p{}'], selfScripts: false, selfStyles: true, styleAttributes: false, dataImages: false,
  })
  assert.match(policy, /script-src 'none';/)
  assert.match(policy, new RegExp(`style-src-elem 'self' ${sha('p{}').replace(/[+/]/g, '\\$&')};`))
  assert.match(policy, /style-src-attr 'none';/)
  assert.match(policy, /img-src 'self';/)
})

test('pagePath maps built files to the URLs they answer at', () => {
  assert.strictEqual(pagePath('index.html'), '/')
  assert.strictEqual(pagePath('islandia/islandia-en-camper-13-dias/index.html'), '/islandia/islandia-en-camper-13-dias/')
  assert.strictEqual(pagePath('ir\\booking-islandia\\index.html'), '/ir/booking-islandia/')
  assert.strictEqual(pagePath('404.html'), '/404.html')
})

test('withPolicies appends one rule per page and replaces its own earlier output', () => {
  const base = '/*\n  X-Frame-Options: DENY\n'
  const once = withPolicies(base, [{ path: '/b/', policy: "default-src 'none'" }, { path: '/', policy: "script-src 'none'" }])
  assert.strictEqual(once, `/*\n  X-Frame-Options: DENY\n\n${GENERATED_MARKER}\n\n/\n  Content-Security-Policy: script-src 'none'\n\n/b/\n  Content-Security-Policy: default-src 'none'\n`)
  assert.strictEqual(withPolicies(once, [{ path: '/b/', policy: "default-src 'none'" }, { path: '/', policy: "script-src 'none'" }]), once)
})

test('withPolicies refuses what Cloudflare Pages would silently drop', () => {
  const many = Array.from({ length: MAX_RULES }, (_, i) => ({ path: `/p${i}/`, policy: "default-src 'none'" }))
  assert.throws(() => withPolicies('/*\n  X-Frame-Options: DENY\n', many), /101 rules/)
  assert.throws(() => withPolicies('', [{ path: '/', policy: 'x'.repeat(2000) }]), /over 2000 characters/)
})

test('headersFor merges every matching rule and joins a repeated header with a comma', () => {
  const rules = parseHeaders(`# comment
/*
  X-Frame-Options: DENY
  X-Robots-Tag: noindex

/ir/*
  X-Robots-Tag: nofollow

/ir/a/
  Content-Security-Policy: default-src 'none'; img-src 'self'
`)
  assert.deepStrictEqual(headersFor(rules, '/ir/a/'), {
    'x-frame-options': 'DENY',
    'x-robots-tag': 'noindex, nofollow',
    'content-security-policy': "default-src 'none'; img-src 'self'",
  })
  assert.deepStrictEqual(headersFor(rules, '/'), { 'x-frame-options': 'DENY', 'x-robots-tag': 'noindex' })
})

test('public/_headers sets each header once per path, so none is comma-joined on Cloudflare', () => {
  const rules = parseHeaders(readFileSync('public/_headers', 'utf8'))
  for (const path of ['/', '/islandia/islandia-en-camper-13-dias/', '/_astro/a.Bc12.js', '/fonts/nunito-latin-var.woff2', '/ir/booking-x/']) {
    const names = rules
      .filter((rule) => (rule.path.endsWith('*') ? path.startsWith(rule.path.slice(0, -1)) : path === rule.path))
      .flatMap((rule) => rule.headers.map(([name]) => name.toLowerCase()))
    assert.deepStrictEqual(names.filter((name, i) => names.indexOf(name) !== i), [], path)
  }
  // The policy is per page (scripts/write-headers.ts), never in the hand-written file.
  assert.ok(!rules.some((rule) => rule.headers.some(([name]) => /^content-security-policy/i.test(name))))
})
