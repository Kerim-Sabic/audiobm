import Image from 'next/image'
import type { Mediji } from '@/payload-types'

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
    return (
      <div
        className={`grid place-items-center bg-neutral-100 text-small text-neutral-400 ${className}`}
        role="img"
        aria-label="Slika nije dostupna"
      >
        [MISSING_ASSET]
      </div>
    )
  }

  const zajednicko = {
    src: medij.url,
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
