import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { SYSTEM_FALLBACK, cssContent, decode, paintedText, uncovered, woff2Cmap } from '../../scripts/font-coverage-tools.ts'

const nunito = woff2Cmap(readFileSync('public/fonts/nunito-latin-var.woff2'), 'nunito')

test('woff2Cmap reads the latin subset of a real font: Latin-1 and Icelandic, no Latin Extended-A', () => {
  for (const char of 'Aaz09ñáÞþðæö€–—') assert.ok(nunito.has(char.codePointAt(0)!), char)
  for (const char of 'řğŁ') assert.ok(!nunito.has(char.codePointAt(0)!), char)
  assert.ok(!nunito.has(0x7f), 'controls are not mapped')
})

test('woff2Cmap rejects a file that is not woff2', () => {
  assert.throws(() => woff2Cmap(Buffer.from('wOFF0000'), 'old.woff'), /old\.woff: not a woff2 file/)
})

test('decode turns numeric and Astro entities into characters and stops on others', () => {
  assert.strictEqual(decode('&#x159; &#287; &amp; &nbsp;', 'a.html'), 'ř ğ &  ')
  assert.throws(() => decode('&hellip;', 'a.html'), /a\.html: unknown entity &hellip;/)
})

test('paintedText keeps text, CSS content and scripts, and drops tags, the title and JSON-LD', () => {
  const html = `<html><head><title>Dvořák</title>
    <style>.x::after { content: "ł" } .y { color: red }</style>
    <script type="application/ld+json">{"name":"Dvořák"}</script>
    <script type="module">el.textContent = "ğ"</script>
    <script>el.title = "ş"</script></head>
    <body><!-- ő --><p class="ű">Þingvellir &#x159;</p></body></html>`
  const text = paintedText(html, 'a.html')
  for (const char of 'łğşÞř') assert.ok(text.includes(char), char)
  for (const char of 'ŕőű') assert.ok(!text.includes(char), char)
  assert.ok(!text.includes('Dvo'), 'title and JSON-LD are not painted')
})

test('cssContent reads both quote styles', () => {
  assert.strictEqual(cssContent(`a::before{content:"→"} b::after{content: 'ğ'}`), '→ ğ')
})

test('uncovered lists each missing character once, skipping whitespace and invisible marks', () => {
  assert.deepStrictEqual(uncovered('Brno ř ř​\n ğ é', nunito), ['ř', 'ğ'])
})

test('the allowed system fallbacks are exactly the two the subsets miss today', () => {
  assert.deepStrictEqual([...SYSTEM_FALLBACK.keys()], ['→', '≈'])
  for (const char of SYSTEM_FALLBACK.keys()) assert.ok(!nunito.has(char.codePointAt(0)!), char)
})
