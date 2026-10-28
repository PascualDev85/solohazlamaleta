/**
 * "Vedur (tiempo oficial)" → name "Vedur", detail "tiempo oficial", so a list
 * written as plain text can show the name in bold and the rest quiet. Only a
 * parenthesis that closes the text counts; anything else stays in the name.
 */
export function splitDetail(text: string): { name: string; detail?: string } {
  const match = /^(.*\S)\s+\(([^()]+)\)$/.exec(text.trim())
  if (!match) return { name: text.trim(), detail: undefined }
  return { name: match[1], detail: match[2] }
}
