import { Mrvice, type Mrvica } from '@/components/ui/Mrvice'

/**
 * Ujednačeno zaglavlje unutrašnjih stranica: tiha klinička pozadina
 * (fina mreža audiograma + topli odsjaj), mrvice, nadnaslov, H1 i uvod.
 * Djeca (CTA dugmad, brze veze) idu ispod uvoda.
 */
export function ZaglavljeStranice({
  mrvice,
  nadnaslov,
  naslov,
  uvod,
  children,
  siroko = false,
}: {
  mrvice: Mrvica[]
  nadnaslov?: string
  naslov: string
  uvod?: React.ReactNode
  children?: React.ReactNode
  siroko?: boolean
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
        <div className={`mt-7 ${siroko ? 'max-w-4xl' : 'max-w-3xl'}`}>
          {nadnaslov && <p className="nadnaslov">{nadnaslov}</p>}
          <h1 className="text-h1 mt-3.5 text-neutral-900">{naslov}</h1>
          {uvod && <p className="uvodni mt-5">{uvod}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </header>
  )
}
