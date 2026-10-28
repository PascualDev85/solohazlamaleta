import type { CompiledPlace } from '../../engine/index.ts'

/**
 * The name for tight spots (the night line, the sheets, the glance, "Lo que
 * dejamos fuera"): the author's short name, or the full name when there is
 * none. The engine applies the same rule to route_line; a stop's own row
 * shows the full name.
 */
export function shortName(place: Pick<CompiledPlace, 'name' | 'short_name'>): string {
  return place.short_name ?? place.name
}
