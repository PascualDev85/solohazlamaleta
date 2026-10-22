import type { Guide } from '../content/schema'
import type { CompiledGuide } from '../../engine/index.ts'

/** A section of a guide page: the id of its heading, its title and its icon (SectionIcon). */
export interface GuideSection {
  id: string
  label: string
  icon: string
}

/**
 * Which sections an engine guide page renders. One source for "does this
 * section render": the page's index, its sections and the search read the
 * same flags, so none can link to a section that is absent.
 */
export function engineSectionFlags(guide: CompiledGuide) {
  const variant = guide.variants?.[0]
  const skipped = (variant?.days ?? []).some((day) => day.skipped_stops.some((stop) => stop.skip_reason))
  const flags = {
    route: Boolean(variant),
    sleep: (guide.accommodation?.zones.length ?? 0) > 0,
    transport: Boolean(guide.transport),
    budget: Boolean(guide.budget),
    booking: (guide.booking_checklist?.length ?? 0) > 0,
    howWeChoose: (guide.how_we_choose?.length ?? 0) > 0,
    leftOut: (guide.route_decisions?.length ?? 0) > 0 || skipped,
    pitfalls: (guide.pitfalls?.length ?? 0) > 0 || (guide.terrain_tips?.length ?? 0) > 0,
    practical: Boolean(guide.practical),
    faq: (guide.faq?.length ?? 0) > 0,
  }
  // "Nuestro criterio" holds three parts (1.12 §13); it shows when any of them has content.
  return { ...flags, criteria: flags.howWeChoose || flags.leftOut || flags.pitfalls }
}

/** The sections of an engine guide page, in page order: the guide index and the search list these. */
export function engineGuideSections(guide: CompiledGuide): GuideSection[] {
  const show = engineSectionFlags(guide)
  const sections: (GuideSection & { visible: boolean })[] = [
    { id: 'itinerario', label: 'La ruta', icon: 'route', visible: show.route },
    { id: 'dormir', label: 'Dónde dormir', icon: 'sleep', visible: show.sleep },
    { id: 'llegar', label: 'Cómo llegamos y nos movimos', icon: 'transport', visible: show.transport },
    { id: 'presupuesto', label: 'Presupuesto real', icon: 'budget', visible: show.budget },
    { id: 'reservar', label: 'Qué reservamos y cuándo', icon: 'booking', visible: show.booking },
    { id: 'criterio', label: 'Nuestro criterio', icon: 'criteria', visible: show.criteria },
    { id: 'practico', label: 'Lo práctico', icon: 'practical', visible: show.practical },
    { id: 'faq', label: 'Preguntas frecuentes', icon: 'faq', visible: show.faq },
  ]
  return sections.filter((section) => section.visible).map(({ visible: _visible, ...section }) => section)
}

/** The sections of a legacy guide page (pages/[destino]/[slug].astro), with the headings it prints. */
export function legacyGuideSections(guide: Guide): GuideSection[] {
  const sections: (GuideSection & { visible: boolean })[] = [
    { id: 'resumen', label: 'En resumen', icon: 'info', visible: true },
    { id: 'duraciones', label: 'Cuántos días tienes', icon: 'clock', visible: true },
    { id: 'itinerario', label: 'Día a día', icon: 'route', visible: true },
    { id: 'dormir', label: 'Dónde dormir', icon: 'sleep', visible: guide.lodging.length > 0 },
    { id: 'reservar', label: 'Qué reservar y cuándo', icon: 'booking', visible: guide.bookingChecklist.length > 0 },
    { id: 'errores', label: 'Errores y trampas', icon: 'pitfalls', visible: guide.pitfalls.length > 0 },
    { id: 'faq', label: 'Preguntas frecuentes', icon: 'faq', visible: guide.faq.length > 0 },
  ]
  return sections.filter((section) => section.visible).map(({ visible: _visible, ...section }) => section)
}
