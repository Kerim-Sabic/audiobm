export const UKLONJENI_SLUGOVI_OBJAVA = ['tuzla1'] as const

const uklonjeniSlugovi = new Set<string>(UKLONJENI_SLUGOVI_OBJAVA)

export function objavaJeUklonjena(slug: string | null | undefined) {
  return typeof slug === 'string' && uklonjeniSlugovi.has(slug)
}

export const KATEGORIJE_OBJAVA = [
  { value: 'savjeti', label: 'Savjeti' },
  { value: 'novosti', label: 'Novosti' },
  { value: 'sarajevo', label: 'Sarajevo' },
] as const

export type KategorijaObjave = (typeof KATEGORIJE_OBJAVA)[number]['value']

export function dajKategorijuObjave(value: string | null | undefined): KategorijaObjave | undefined {
  return KATEGORIJE_OBJAVA.find((kategorija) => kategorija.value === value)?.value
}

export function oznakaKategorijeObjave(value: string | null | undefined) {
  return KATEGORIJE_OBJAVA.find((kategorija) => kategorija.value === value)?.label ?? 'Savjeti'
}
