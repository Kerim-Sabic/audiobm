import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { dajPayload } from '@/lib/podaci'
import { clanakJsonLd, metaStranice, pitanjaJsonLd, OSNOVNI_URL } from '@/lib/seo'
import { objavaJeUklonjena } from '@/lib/objave'
import { Mrvice } from '@/components/ui/Mrvice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { DugmeLink } from '@/components/ui/Dugme'
import type { Mediji } from '@/payload-types'

async function dajObjavu(slug: string) {
  if (objavaJeUklonjena(slug)) return null
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'objave',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    draft: false,
  })
  return docs[0] ?? null
}

function urlMedija(medij: Mediji | number | null | undefined) {
  if (!medij || typeof medij !== 'object' || !medij.url) return undefined
  return medij.url.startsWith('http') ? medij.url : `${OSNOVNI_URL}${medij.url}`
}

const FAQ_PO_OBJAVI: Record<string, { pitanje: string; odgovor: string }[]> = {
  'prvi-znakovi-slabljenja-sluha': [
    {
      pitanje: 'Koji su prvi znakovi slabljenja sluha?',
      odgovor:
        'Najčešći prvi znakovi su pojačavanje televizora, često traženje da se ponovi, teže razumijevanje govora u buci, naporni telefonski razgovori i osjećaj da drugi govore nerazgovijetno.',
    },
    {
      pitanje: 'Kada treba zakazati provjeru sluha?',
      odgovor:
        'Provjeru sluha vrijedi zakazati čim promjene počnu smetati u razgovoru, porodici, poslu, saobraćaju ili gledanju televizora. Ranija provjera olakšava planiranje sljedećeg koraka.',
    },
    {
      pitanje: 'Da li je online test sluha dovoljan?',
      odgovor:
        'Online test može biti dobar orijentacioni prvi korak, ali ne zamjenjuje stručnu provjeru sluha u poslovnici niti pregled kod ORL specijaliste kada postoje medicinski simptomi.',
    },
    {
      pitanje: 'Kada je potrebna hitna medicinska pomoć?',
      odgovor:
        'Ako je sluh naglo oslabio, posebno na jednom uhu, ili imate bol, iscjedak, vrtoglavicu, šum koji se iznenada pojavio ili osjećaj pritiska, obratite se ljekaru ili ORL specijalisti.',
    },
  ],
  'pet-savjeta-odrzavanje-slusnog-aparata': [
    {
      pitanje: 'Kako svakodnevno čistiti slušni aparat?',
      odgovor:
        'Slušni aparat svaku večer obrišite suhom mekom krpicom, uklonite vidljivu nečistoću odgovarajućom četkicom i ne koristite alkohol, vodu ili vlažne maramice.',
    },
    {
      pitanje: 'Zašto je vlaga opasna za slušni aparat?',
      odgovor:
        'Vlaga može uticati na mikrofon, zvučnik, kontakte baterije i elektroniku. Aparat treba skinuti prije tuširanja, plivanja, saune i nanošenja laka za kosu.',
    },
    {
      pitanje: 'Kada mijenjati filtere i nastavke?',
      odgovor:
        'Filtere, kapice, cjevčice i nastavke treba mijenjati kada zvuk oslabi, aparat počne prekidati, zviždi ili se vidi nakupljen ušni vosak. Tačan ritam zavisi od modela i korisnika.',
    },
    {
      pitanje: 'Koliko često treba doći na servisnu kontrolu?',
      odgovor:
        'Za većinu korisnika korisna je kontrola svakih šest mjeseci, a ranije ako aparat slabi, zviždi, ne puni se uredno ili se promijenio osjećaj slušanja.',
    },
  ],
  'svijet-sluha-sarajevo-slusni-aparati-provjera-sluha': [
    {
      pitanje: 'Gdje mogu uraditi provjeru sluha u Sarajevu?',
      odgovor:
        'Besplatnu provjeru sluha možete obaviti u centru Svijet Sluha na adresi Fra Anđela Zvizdovića 1, u UNITIC neboderima u Sarajevu.',
    },
    {
      pitanje: 'Šta je Experience Room?',
      odgovor:
        'Experience Room je prostor u kojem se simuliraju svakodnevne zvučne situacije, poput razgovora kod kuće, na poslu, u prodavnici ili u javnom prijevozu.',
    },
    {
      pitanje: 'Mogu li isprobati slušni aparat prije konačne odluke?',
      odgovor:
        'U Svijetu Sluha možete dobiti savjetovanje i upoznati se s odabranim opcijama slušnih aparata. Dostupnost demonstracije i pojedinih modela treba potvrditi direktno sa poslovnicom.',
    },
    {
      pitanje: 'Da li je provjera sluha besplatna?',
      odgovor:
        'Prema trenutnoj ponudi centra, besplatna provjera sluha dostupna je građanima Sarajeva. Preporučuje se prethodno zakazivanje termina.',
    },
    {
      pitanje: 'Koje je radno vrijeme Svijeta Sluha u Sarajevu?',
      odgovor:
        'Centar radi ponedjeljkom, utorkom, četvrtkom i petkom od 08:00 do 16:00, a srijedom od 08:00 do 18:00.',
    },
    {
      pitanje: 'Koje brendove slušnih aparata mogu pronaći u Svijetu Sluha?',
      odgovor:
        'U ponudi su modeli slušnih aparata proizvođača Bernafon i Unitron, prema dostupnosti i individualnim potrebama korisnika.',
    },
  ],
}

const articleConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const medij = typeof node.value === 'object' ? (node.value as Mediji) : null
    if (!medij) return null

    return (
      <figure className="my-9 overflow-hidden rounded-[24px] shadow-[var(--shadow-lift)]">
        <SlikaMedija medij={medij} sizes="(min-width: 1024px) 896px, 100vw" className="h-auto w-full" />
      </figure>
    )
  },
})

export async function generateStaticParams() {
  const payload = await dajPayload()
  const { docs } = await payload.find({ collection: 'objave', limit: 100, depth: 0, draft: false })
  return docs.filter((d) => !objavaJeUklonjena(d.slug)).map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const o = await dajObjavu(slug)
  if (!o) return {}
  return metaStranice({
    naslov: o.seo?.naslov ?? o.naslov,
    opis: o.seo?.opis ?? o.izvod,
    putanja: `/savjeti/${slug}`,
    ogSlika: urlMedija((o.seo?.slika as Mediji | number | null | undefined) ?? (o.naslovnaSlika as Mediji | number | null | undefined)),
  })
}

export default async function ObjavaStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const objava = await dajObjavu(slug)
  if (!objava) notFound()

  const payload = await dajPayload()
  const { docs: povezane } = await payload.find({
    collection: 'objave',
    where: { and: [{ kategorija: { equals: objava.kategorija } }, { slug: { not_equals: slug } }] },
    sort: '-datumObjave',
    limit: 3,
    depth: 0,
    draft: false,
  })
  const vidljivePovezane = povezane.filter((p) => !objavaJeUklonjena(p.slug))
  const slikaUrl = urlMedija(
    (objava.seo?.slika as Mediji | number | null | undefined) ?? (objava.naslovnaSlika as Mediji | number | null | undefined),
  )
  const faq = FAQ_PO_OBJAVI[slug] ?? []

  return (
    <article className="kontejner py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            clanakJsonLd({
              naslov: objava.naslov,
              slug: objava.slug,
              izvod: objava.izvod,
              datumObjave: objava.datumObjave,
              slika: slikaUrl,
            }),
          ),
        }}
      />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pitanjaJsonLd(faq)),
          }}
        />
      )}
      <Mrvice stavke={[{ naziv: 'Savjeti', putanja: '/savjeti' }, { naziv: objava.naslov }]} />

      <div className="mx-auto mt-8 max-w-4xl">
        {objava.datumObjave && (
          <p className="text-small font-semibold text-neutral-500">
            {new Date(objava.datumObjave).toLocaleDateString('bs-BA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        <p className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[13px] font-bold tracking-[0.12em] text-brand-700 uppercase">
          {objava.kategorija === 'sarajevo' ? 'Sarajevo' : objava.kategorija}
        </p>
        <h1 className="text-h1 mt-2">{objava.naslov}</h1>
        <p className="mt-4 max-w-3xl text-[19px] text-neutral-600">{objava.izvod}</p>

        {objava.naslovnaSlika && typeof objava.naslovnaSlika === 'object' && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[28px] shadow-[var(--shadow-lift-lg)]">
            <SlikaMedija medij={objava.naslovnaSlika as Mediji} fill sizes="(min-width: 1024px) 896px, 100vw" prioritet />
          </div>
        )}

        <RichText
          data={objava.sadrzaj}
          converters={articleConverters}
          className="prose-bm article-prose mt-10 text-[18px] text-neutral-800"
        />

        <div className="mt-14 rounded-[28px] border border-brand-200/60 bg-gradient-to-br from-white to-brand-50/50 p-8 text-center md:p-10">
          <h2 className="text-h3">Brinete za svoj sluh?</h2>
          <p className="mt-2 text-neutral-700">Provjera sluha kod nas je besplatna i traje pola sata.</p>
          <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-6">
            Zakažite besplatan termin
          </DugmeLink>
        </div>

        {vidljivePovezane.length > 0 && (
          <aside className="mt-14" aria-label="Povezane objave">
            <h2 className="text-h3 mb-4">Pročitajte i ovo</h2>
            <ul className="space-y-3">
              {vidljivePovezane.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/savjeti/${p.slug}`}
                    className="povrsina block p-4.5 font-semibold text-neutral-900 transition-colors duration-150 hover:border-brand-300 hover:text-brand-700"
                  >
                    {p.naslov}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  )
}
