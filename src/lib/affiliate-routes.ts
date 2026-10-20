/** The shape of src/data/affiliates.json: partners, each with its links by key. */
export interface AffiliateRegistryFile {
  partners: Record<string, {
    name: string
    active: boolean
    links: Record<string, string>
  }>
}

export interface AffiliateRoute {
  params: { id: string }
  props: { url: string; partnerName: string }
}

/**
 * The /ir/{id} pages to build: one per link of every active partner, with the
 * id `<partner>-<key>`. An inactive partner builds nothing, so its links 404
 * instead of sending readers to a deal that is off.
 */
export function affiliateRoutes(registry: AffiliateRegistryFile): AffiliateRoute[] {
  const paths: AffiliateRoute[] = []

  for (const [partnerId, partner] of Object.entries(registry.partners)) {
    if (!partner.active) continue

    for (const [key, url] of Object.entries(partner.links)) {
      paths.push({
        params: { id: `${partnerId}-${key}` },
        props: { url: String(url), partnerName: partner.name },
      })
    }
  }

  return paths
}
