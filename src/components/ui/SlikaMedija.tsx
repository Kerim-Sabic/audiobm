import Image from 'next/image'
import type { Mediji } from '@/payload-types'

/**
 * Payload vraća apsolutne adrese medija (serverURL) — svodimo na relativnu
 * putanju da ih next/image optimizator prihvati bez remotePatterns liste.
 */
function relativnaPutanja(url: string): string {
  if (!url.startsWith('http')) return url
  try {
    const u = new URL(url)
    return u.pathname + u.search
  } catch {
    return url
  }
}

/**
 * Slika iz CMS-a preko next/image: LQIP mutna sličica → oštar prelaz,
 * eksplicitne dimenzije (bez pomjeranja rasporeda), AVIF/WebP automatski.
 */
export function SlikaMedija({
  medij,
  sizes = '100vw',
  className = '',
  fill = false,
  prioritet = false,
  quality = 75,
}: {
  medij: Mediji | number | null | undefined
  sizes?: string
  className?: string
  fill?: boolean
  prioritet?: boolean
  quality?: number
}) {
  if (!medij || typeof medij === 'number' || !medij.url) {
    // bez vidljivog placeholder teksta — tiha neutralna površina sa ikonom
    return (
      <div
        className={`grid place-items-center bg-neutral-100 ${className}`}
        role="img"
        aria-label="Slika nije dostupna"
      >
        <svg viewBox="0 0 24 24" className="size-10 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m5 17 4.5-4 3 2.5L17 11l2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  const zajednicko = {
    src: relativnaPutanja(medij.url),
    alt: medij.alt ?? '',
    sizes,
    quality,
    priority: prioritet,
    ...(medij.lqip ? { placeholder: 'blur' as const, blurDataURL: medij.lqip } : {}),
  }

  if (fill) {
    return <Image {...zajednicko} fill className={`object-cover ${className}`} />
  }

  return (
    <Image
      {...zajednicko}
      width={medij.width ?? 800}
      height={medij.height ?? 600}
      className={className}
    />
  )
}
