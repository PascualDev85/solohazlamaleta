import type { CompiledPlace } from '../../engine/index.ts'
import { shortName } from './placeName.ts'

/**
 * Where the day ends, as the day card and the glance say it. The engine's
 * overnight has three states: a campsite, null for a night outside any
 * campsite, and absent when the day has no night (nothing to show).
 */
export function nightLabel(overnight: Pick<CompiledPlace, 'name' | 'short_name'> | null | undefined): string | undefined {
  if (overnight === null) return 'Fuera de camping'
  return overnight ? shortName(overnight) : undefined
}
