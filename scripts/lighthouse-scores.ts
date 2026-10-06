// Pure helpers for the Lighthouse quality gate (scripts/lighthouse-check.ts).
// No I/O here, so the pass/fail rule is unit-tested on its own.

export interface PageResult {
  page: string
  device: 'mobile' | 'desktop'
  /** Score (0-100) of every run, per Lighthouse category. */
  runs: Record<string, number[]>
}

/** Middle value of the runs (mean of the two middle ones for an even count). */
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Every page, device and category whose median score is below `threshold`,
 * as readable lines: "/guia/ (mobile) performance: 99". Empty means pass.
 * The median, not a single run, so one noisy run never decides.
 */
export function findFailures(results: PageResult[], threshold: number): string[] {
  const failures: string[] = []
  for (const { page, device, runs } of results) {
    for (const [category, scores] of Object.entries(runs)) {
      const score = median(scores)
      if (score < threshold) failures.push(`${page} (${device}) ${category}: ${score}`)
    }
  }
  return failures
}
