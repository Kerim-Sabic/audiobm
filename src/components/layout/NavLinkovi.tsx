'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Desktop navigacija: mirna pilula za aktivnu rutu, tihi hover.
 * Razmaci se stežu na lg i šire na xl — stavke se nikad ne lome u dva reda.
 */
export function NavLinkovi({ stavke }: { stavke: { oznaka: string; putanja: string }[] }) {
  const putanja = usePathname()

  return (
    <ul className="flex items-center gap-0.5 xl:gap-1">
      {stavke.map((s) => {
        const aktivna = s.putanja === '/' ? putanja === '/' : putanja.startsWith(s.putanja)
        return (
          <li key={s.putanja}>
            <Link
              href={s.putanja}
              aria-current={aktivna ? 'page' : undefined}
              className={`block rounded-full px-3 py-2 text-[14.5px] font-semibold whitespace-nowrap transition-colors duration-150 xl:px-4 xl:text-[15.5px] ${
                aktivna
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              {s.oznaka}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
