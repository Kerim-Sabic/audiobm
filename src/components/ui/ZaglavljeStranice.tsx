import Image from 'next/image'
import { Mrvice, type Mrvica } from '@/components/ui/Mrvice'

/**
 * Ujednačeno zaglavlje unutrašnjih stranica: tiha klinička pozadina
 * (fina mreža audiograma + topli odsjaj), mrvice, nadnaslov, H1 i uvod.
 * Djeca (CTA dugmad, brze veze) idu ispod uvoda; opcionalna klinička
 * fotografija prikazuje se desno na većim ekranima.
 */
export function ZaglavljeStranice({
  mrvice,
  nadnaslov,
  naslov,
  uvod,
  children,
  siroko = false,
  slika,
}: {
  mrvice: Mrvica[]
  nadnaslov?: string
  naslov: string
  uvod?: React.ReactNode
  children?: React.ReactNode
  siroko?: boolean
  slika?: { src: string; alt: string }
}) {
  return (
    <header className="relative overflow-hidden border-b border-neutral-200/70 bg-neutral-50">
      <div className="mreza-audiogram absolute inset-0" aria-hidden />
      <div
        className="absolute -top-48 right-[-8%] size-[480px] rounded-full bg-brand-100/40 blur-[130px]"
        aria-hidden
      />
      <div className="kontejner relative py-10 md:py-16">
        <Mrvice stavke={mrvice} />
        <div className={slika ? 'mt-7 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]' : 'mt-7'}>
          <div className={siroko ? 'max-w-4xl' : 'max-w-3xl'}>
            {nadnaslov && <p className="nadnaslov">{nadnaslov}</p>}
            <h1 className="text-h1 mt-3.5 text-neutral-900">{naslov}</h1>
            {uvod && <p className="uvodni mt-5">{uvod}</p>}
            {children && <div className="mt-8">{children}</div>}
          </div>
          {slika && (
            <div className="relative hidden aspect-[8/5] overflow-hidden rounded-[28px] shadow-[var(--shadow-lift-lg)] ring-1 ring-neutral-900/5 lg:block">
              <Image
                src={slika.src}
                alt={slika.alt}
                fill
                sizes="(min-width: 1024px) 540px, 0px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
