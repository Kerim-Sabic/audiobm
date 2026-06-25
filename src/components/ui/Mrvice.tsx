import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BREND } from '@/lib/brend'

export type Mrvica = { naziv: string; putanja?: string }

/** Mrvice (breadcrumbs) sa BreadcrumbList JSON-LD shemom. */
export function Mrvice({ stavke }: { stavke: Mrvica[] }) {
  const osnova = process.env.NEXT_PUBLIC_SERVER_URL ?? BREND.domena
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Početna', item: osnova },
      ...stavke.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: s.naziv,
        ...(s.putanja ? { item: `${osnova}${s.putanja}` } : {}),
      })),
    ],
  }

  return (
    <nav aria-label="Putanja do stranice" className="text-small text-neutral-500">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="transition-colors duration-150 hover:text-brand-700">
            Početna
          </Link>
        </li>
        {stavke.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-neutral-400" aria-hidden />
            {s.putanja && i < stavke.length - 1 ? (
              <Link href={s.putanja} className="transition-colors duration-150 hover:text-brand-700">
                {s.naziv}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-neutral-700">
                {s.naziv}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
