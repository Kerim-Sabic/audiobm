import { Otkrij } from '@/components/motion/Otkrij'

/** Ujednačeno zaglavlje sekcije: nadnaslov + naslov + uvodni tekst. */
export function SekcijaZaglavlje({
  nadnaslov,
  naslov,
  uvod,
  centrirano = true,
  id,
}: {
  nadnaslov: string
  naslov: string
  uvod?: string
  centrirano?: boolean
  id?: string
}) {
  return (
    <Otkrij className={centrirano ? 'text-center' : ''}>
      <p className={`nadnaslov ${centrirano ? 'nadnaslov-centar justify-center' : ''}`}>{nadnaslov}</p>
      <h2 id={id} className="text-h2 mt-3 text-neutral-900">
        {naslov}
      </h2>
      {uvod && (
        <p className={`uvodni mt-4 max-w-2xl ${centrirano ? 'mx-auto' : ''}`}>{uvod}</p>
      )}
    </Otkrij>
  )
}
