'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Desktop navigacija sa aktivnim stanjem trenutne rute i animiranom podvlakom. */
export function NavLinkovi({ stavke }: { stavke: { oznaka: string; putanja: string }[] }) {
  const putanja = usePathname()

  return (
    <ul className="flex items-center gap-0.5">
      {stavke.map((s) => {
        const aktivna = s.putanja === '/' ? putanja === '/' : putanja.startsWith(s.putanja)
        return (
          <li key={s.putanja}>
            <Link
              href={s.putanja}
              aria-current={aktivna ? 'page' : undefined}
              className={`relative rounded-md px-3.5 py-2.5 text-[15.5px] font-semibold transition-colors duration-150 after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-brand-600 after:transition-transform after:duration-250 ${
                aktivna
                  ? 'text-brand-700 after:scale-x-100'
                  : 'text-neutral-700 after:scale-x-0 hover:text-neutral-950 hover:after:scale-x-100'
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
