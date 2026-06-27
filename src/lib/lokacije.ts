type LokacijaBrojiva = {
  grad?: string | null
  slug?: string | null
}

const BROJEVI_RIJECIMA: Record<number, string> = {
  1: 'jednom',
  2: 'dva',
  3: 'tri',
  4: 'četiri',
  5: 'pet',
  6: 'šest',
  7: 'sedam',
  8: 'osam',
  9: 'devet',
  10: 'deset',
}

export function brojGradova(poslovnice: LokacijaBrojiva[]) {
  const gradovi = new Set(poslovnice.map((p) => p.grad?.trim()).filter(Boolean))
  return gradovi.size || poslovnice.length
}

export function brojPoslovnica(poslovnice: LokacijaBrojiva[]) {
  return poslovnice.length
}

export function brojRijecju(broj: number) {
  return BROJEVI_RIJECIMA[broj] ?? String(broj)
}

export function opisGradova(poslovnice: LokacijaBrojiva[]) {
  const broj = brojGradova(poslovnice)
  return `${brojRijecju(broj)} ${broj === 1 ? 'gradu' : 'gradova'}`
}

export function standardizujBrojLokacija(tekst: string | null | undefined, poslovnice: LokacijaBrojiva[]) {
  if (!tekst) return tekst

  const gradovi = brojGradova(poslovnice)
  const poslovnicaBroj = brojPoslovnica(poslovnice)
  const rijec = brojRijecju(gradovi)
  const opis = opisGradova(poslovnice)

  return tekst
    .replace(/u (?:šest|sedam|6|7) gradova širom Bosne i Hercegovine/giu, `u ${opis} širom Bosne i Hercegovine`)
    .replace(/u (?:šest|sedam|6|7) gradova BiH/giu, `u ${opis} BiH`)
    .replace(/u (?:šest|sedam|6|7) gradova/giu, `u ${opis}`)
    .replace(/svih (?:šest|sedam|6|7) poslovnica/giu, `svih ${poslovnicaBroj} poslovnica`)
    .replace(/(?:šest|sedam|6|7) poslovnica/giu, `${poslovnicaBroj} poslovnica`)
    .replace(/(?:šest|sedam|6|7) gradova/giu, `${rijec} gradova`)
}

export function naslovPoslovnica(poslovnice: LokacijaBrojiva[]) {
  const gradovi = poslovnice.map((p) => p.grad?.trim()).filter(Boolean)
  return gradovi.length ? `Poslovnice — ${gradovi.join(', ')}` : 'Poslovnice'
}
