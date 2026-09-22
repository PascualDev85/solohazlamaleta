import { z } from 'astro:content';

/**
 * The guide schema is the project's contract: the web, the engine and the
 * social generator all read the same shape. A guide that does not satisfy it
 * fails the build rather than rendering half-empty.
 *
 * Source of truth lives here for now; the engine's Pydantic model derives
 * from it later (decision D10).
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_MONTH = /^\d{4}-\d{2}$/;

/** Where a fact came from, so it can be re-checked without redoing the research. */
const source = z.object({
  label: z.string(),
  url: z.string().url().optional(),
  /** Absent means unverified. The page shows this date so readers can judge. */
  checkedAt: z.string().regex(ISO_DATE).optional(),
});

/**
 * An affiliate reference names the partner and what is being booked, never a
 * raw tracking id. Swapping partners then touches the registry, not every
 * guide (decision D9).
 */
const affiliateRef = z.object({
  partner: z.enum([
    'booking',
    'getyourguide',
    'civitatis',
    'iati',
    'camper-rental',
    'car-rental',
    'travelpayouts',
  ]),
  /** Stable key within the partner, resolved through src/data/affiliates.json */
  key: z.string(),
});

const money = z.object({
  amount: z.number().nonnegative(),
  currency: z.literal('EUR').default('EUR'),
});

const groupName = z.enum(['couple', 'friends', 'family_seniors']);

const stop = z.object({
  name: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  kind: z.enum(['sight', 'food', 'transport', 'stay', 'activity']),
  durationMin: z.number().int().positive(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  travelToNextMin: z.number().int().nonnegative().optional(),
  /** Per-stop cost, so the budget is derivable instead of asserted (D9). */
  cost: money.optional(),
  booking: affiliateRef.extend({ advanceNotice: z.string() }).optional(),
  notes: z.string().optional(),
  source: source.optional(),
});

const day = z.object({
  day: z.number().int().positive(),
  title: z.string(),
  summary: z.string(),
  physicalLevel: z.object({
    walkingKm: z.number().nonnegative(),
    hills: z.enum(['none', 'some', 'many']),
  }),
  stops: z.array(stop).min(1),
  food: z
    .array(
      z.object({
        name: z.string(),
        area: z.string(),
        priceLevel: z.enum(['low', 'mid', 'high']),
        notes: z.string().optional(),
        source: source.optional(),
      }),
    )
    .default([]),
  /** "Lo que haríamos distinto" — the author's own voice. */
  localTip: z.string().optional(),
  /** If it rains or the place is closed. */
  planB: z.string().optional(),
  groupAdjustments: z.record(groupName, z.string()).default({}),
});

export const guideSchema = z
  .object({
    meta: z.object({
      lang: z.enum(['es']).default('es'),
      destination: z.string(),
      title: z.string(),
      description: z.string().max(160),
      type: z.enum(['itinerary', 'satellite', 'hub']),
      /**
       * Day-count options offered on this single page. Never separate URLs
       * per variant — see `variants` below and the hard rule in CLAUDE.md.
       */
      days: z.array(z.number().int().positive()).min(1),
      /** When the author actually travelled. Null means not visited yet. */
      tripDone: z.string().regex(YEAR_MONTH).nullable(),
      updatedAt: z.string().regex(ISO_DATE),
      coverImage: z.string().optional(),
      /** Draft guides render with a banner and are excluded from the sitemap. */
      draft: z.boolean().default(false),
    }),

    /**
     * Which days belong to each day-count option, keyed by day count.
     * The brief left this open; without it a 3-day variant cannot know which
     * days to drop (decision D9).
     */
    variants: z.record(z.string(), z.array(z.number().int().positive())),

    summary: z.object({
      forWho: z.string(),
      budgetPerPerson: z.object({ min: z.number(), max: z.number() }),
      bestSeason: z.string(),
      gettingAround: z.string(),
      baseArea: z.string(),
      pace: z.enum(['relaxed', 'medium', 'intense']),
    }),

    groups: z.array(groupName).min(1),
    days: z.array(day).min(1),

    lodging: z
      .array(
        z.object({
          zone: z.string(),
          pros: z.array(z.string()),
          cons: z.array(z.string()),
          picks: z
            .array(
              z.object({
                name: z.string(),
                priceLevel: z.enum(['low', 'mid', 'high']),
                affiliate: affiliateRef.optional(),
              }),
            )
            .default([]),
        }),
      )
      .default([]),

    bookingChecklist: z
      .array(
        z.object({
          item: z.string(),
          when: z.string(),
          affiliate: affiliateRef.optional(),
        }),
      )
      .default([]),

    pitfalls: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    related: z.array(z.string()).default([]),
  })
  /**
   * Every declared day count must map to real days. Catching this at build
   * time is the whole point of having a schema.
   */
  .superRefine((guide, ctx) => {
    const dayNumbers = new Set(guide.days.map((d) => d.day));

    for (const count of guide.meta.days) {
      const variant = guide.variants[String(count)];

      if (!variant) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', String(count)],
          message: `meta.days lists ${count} days but variants["${count}"] is missing.`,
        });
        continue;
      }

      if (variant.length !== count) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', String(count)],
          message: `variants["${count}"] has ${variant.length} days, expected ${count}.`,
        });
      }

      for (const dayNumber of variant) {
        if (!dayNumbers.has(dayNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variants', String(count)],
            message: `variants["${count}"] references day ${dayNumber}, which is not defined in days[].`,
          });
        }
      }
    }

    /** A guide claiming a real trip must say when it happened. */
    if (guide.meta.tripDone === null && !guide.meta.draft) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['meta', 'tripDone'],
        message:
          'A published guide needs meta.tripDone. Set meta.draft to true while the author has not made the trip.',
      });
    }
  });

export type Guide = z.infer<typeof guideSchema>;
