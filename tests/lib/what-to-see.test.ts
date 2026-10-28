import { test } from 'node:test'
import assert from 'node:assert'
import { whatToSeeByDay, type DayToSee } from '../../src/lib/whatToSee.ts'

const GUIDE = '/islandia/islandia-en-camper-13-dias/'

type Stop = DayToSee['stops'][number]

function stop(place_id: string, overrides: Partial<Stop['place']> = {}, visit_status: Stop['visit_status'] = 'visited'): Stop {
  return { visit_status, place: { place_id, name: `Nombre largo de ${place_id}`, type: 'monument', ...overrides } }
}

test('whatToSeeByDay groups the visited places by day, each linking to its day in the guide', () => {
  const days: DayToSee[] = [
    { day: 1, title: 'Llegada', stops: [stop('reykjavik', { short_name: 'Reikiavik', type: 'area' }), stop('thorufoss')] },
    { day: 2, title: 'Círculo Dorado', stops: [stop('geysir', { short_name: 'Geysir' })] },
  ]

  assert.deepStrictEqual(whatToSeeByDay(days, GUIDE), [
    {
      day: 1,
      title: 'Llegada',
      href: '/islandia/islandia-en-camper-13-dias/#dia-1',
      photo: undefined,
      places: [
        { place_id: 'reykjavik', name: 'Reikiavik' },
        { place_id: 'thorufoss', name: 'Nombre largo de thorufoss' },
      ],
    },
    {
      day: 2,
      title: 'Círculo Dorado',
      href: '/islandia/islandia-en-camper-13-dias/#dia-2',
      photo: undefined,
      places: [{ place_id: 'geysir', name: 'Geysir' }],
    },
  ])
})

test('whatToSeeByDay leaves out what was not visited and what is not a sight (food, campsites, transport)', () => {
  const days: DayToSee[] = [
    {
      day: 4,
      title: 'Sur',
      stops: [
        stop('skogafoss'),
        stop('playa_vik', {}, 'not_visited'),
        stop('maybe', {}, 'unknown'),
        stop('skool_beans', { type: 'food' }),
        stop('camp_x', { type: 'accommodation' }),
        stop('airport', { type: 'transport' }),
      ],
    },
  ]

  assert.deepStrictEqual(whatToSeeByDay(days, GUIDE)[0].places, [
    { place_id: 'skogafoss', name: 'Nombre largo de skogafoss' },
  ])
})

test('whatToSeeByDay lists a place once, on the first day it was visited, and drops a day left empty', () => {
  const days: DayToSee[] = [
    { day: 1, title: 'Llegada', stops: [stop('reykjavik')] },
    { day: 13, title: 'Regreso', stops: [stop('glymur', {}, 'not_visited'), stop('reykjavik')] },
  ]

  const groups = whatToSeeByDay(days, GUIDE)
  assert.deepStrictEqual(groups.map((group) => group.day), [1])
})

test('whatToSeeByDay keeps the day photo, so a group can show its own thumbnail', () => {
  const photo = { src: 'islandia/islandia-gullfoss.jpg', alt: 'Gullfoss', caption: 'Gullfoss, 2025' }
  const days: DayToSee[] = [{ day: 2, title: 'Círculo Dorado', photo, stops: [stop('gullfoss')] }]

  assert.deepStrictEqual(whatToSeeByDay(days, GUIDE)[0].photo, photo)
})
