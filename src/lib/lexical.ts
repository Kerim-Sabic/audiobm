/**
 * Pomoćnici za gradnju Lexical rich-text sadržaja (seed) i
 * jednostavna konverzija starog Shopify HTML-a u Lexical strukturu.
 */

type Tekst = { type: 'text'; text: string; format: number; detail: 0; mode: 'normal'; style: ''; version: 1 }
type Cvor = Record<string, unknown>

export const tekst = (text: string, podebljano = false): Tekst => ({
  type: 'text',
  text,
  format: podebljano ? 1 : 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const blok = (type: string, children: Cvor[], extra: Record<string, unknown> = {}): Cvor => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})

export const paragraf = (...djeca: (Tekst | string)[]): Cvor =>
  blok('paragraph', djeca.map((d) => (typeof d === 'string' ? tekst(d) : d)))

export const naslov = (text: string, tag: 'h2' | 'h3' = 'h2'): Cvor => blok('heading', [tekst(text)], { tag })

export const lista = (stavke: (Tekst | string)[][]): Cvor =>
  blok(
    'list',
    stavke.map((djeca, i) =>
      blok(
        'listitem',
        djeca.map((d) => (typeof d === 'string' ? tekst(d) : d)),
        { value: i + 1 },
      ),
    ),
    { listType: 'bullet', tag: 'ul', start: 1 },
  )

export const dokument = (...cvorovi: Cvor[]) => ({
  root: {
    type: 'root',
    children: cvorovi,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

// ———— konverzija starog HTML opisa proizvoda ————

const dekodiraj = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/** Parsira sadržaj jednog HTML elementa u niz tekst-čvorova (podržava strong/b). */
function inline(html: string): Tekst[] {
  const cvorovi: Tekst[] = []
  const dijelovi = html.split(/(<\/?(?:strong|b)>)/i)
  let podebljano = false
  for (const dio of dijelovi) {
    if (/^<(strong|b)>$/i.test(dio)) {
      podebljano = true
    } else if (/^<\/(strong|b)>$/i.test(dio)) {
      podebljano = false
    } else {
      const cist = dekodiraj(dio.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''))
      if (cist) cvorovi.push(tekst(cist + ' ', podebljano))
    }
  }
  // skini suvišni razmak sa kraja
  if (cvorovi.length) {
    const zadnji = cvorovi[cvorovi.length - 1]
    zadnji.text = zadnji.text.replace(/\s+$/, '')
  }
  return cvorovi
}

/** Stari Shopify body_html → Lexical (liste i paragrafi, bold sačuvan). */
export function izHtml(html: string) {
  const cvorovi: Cvor[] = []
  if (!html?.trim()) return dokument(paragraf(''))

  // izdvoji <li> stavke
  const liStavke = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => inline(m[1]))
    .filter((s) => s.length)
  // paragrafi izvan listi
  const bezListi = html.replace(/<ul[\s\S]*?<\/ul>/gi, '').replace(/<ol[\s\S]*?<\/ol>/gi, '')
  const pStavke = [...bezListi.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => inline(m[1]))
    .filter((s) => s.length)
  // ostatak bez ikakvih tagova
  const ostatak = dekodiraj(bezListi.replace(/<p[\s\S]*?<\/p>/gi, '').replace(/<[^>]+>/g, ' '))

  for (const p of pStavke) cvorovi.push(blok('paragraph', p))
  if (liStavke.length) cvorovi.push(lista(liStavke))
  if (!cvorovi.length && ostatak) cvorovi.push(paragraf(ostatak))
  if (!cvorovi.length) cvorovi.push(paragraf(''))

  return dokument(...cvorovi)
}
