import type { Facilities } from '../../schemas/index.ts'

const SHOWERS: Record<Facilities['showers'], string> = {
  included: 'Duchas incluidas',
  paid: 'Duchas de pago',
  none: 'Sin duchas',
}

/**
 * The campsite's facilities as short labels for its card. A boolean the author
 * did not fill in is unknown, so it gets no label at all, never "sin".
 */
export function facilityLabels(facilities: Facilities): string[] {
  const labels = [SHOWERS[facilities.showers]]
  const known: [boolean | undefined, string, string][] = [
    [facilities.toilets, 'Baños', 'Sin baños'],
    [facilities.common_room, 'Sala común', 'Sin sala común'],
    [facilities.electricity, 'Electricidad', 'Sin electricidad'],
  ]
  for (const [value, yes, no] of known) {
    if (value != null) labels.push(value ? yes : no)
  }
  return labels
}
