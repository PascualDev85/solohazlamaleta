import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

export async function loadGuide(path: string): Promise<unknown> {
  const raw = await readFile(path, 'utf-8')
  return parse(raw)
}

export async function loadPlaces(path: string): Promise<unknown> {
  const raw = await readFile(path, 'utf-8')
  return parse(raw)
}
