export const UKLONJENI_SLUGOVI_OBJAVA = ['tuzla1'] as const

const uklonjeniSlugovi = new Set<string>(UKLONJENI_SLUGOVI_OBJAVA)

export function objavaJeUklonjena(slug: string | null | undefined) {
  return typeof slug === 'string' && uklonjeniSlugovi.has(slug)
}
