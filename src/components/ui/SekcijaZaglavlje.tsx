import { Otkrij } from '@/components/motion/Otkrij'

/** Ujednačeno zaglavlje sekcije: nadnaslov + naslov + uvodni tekst (+ akcija desno). */
export function SekcijaZaglavlje({
  nadnaslov,
  naslov,
  uvod,
  centrirano = true,
  id,
  akcija,
}: {
  nadnaslov: string
  naslov: string
  uvod?: string
  centrirano?: boolean
  id?: string
  akcija?: React.ReactNode
}) {
  if (akcija) {
    return (
      <Otkrij className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className="max-w-2xl">
          <p className="nadnaslov">{nadnaslov}</p>
          <h2 id={id} className="text-h2 mt-3.5 text-neutral-900">
            {naslov}
          </h2>
          {uvod && <p className="uvodni mt-4">{uvod}</p>}
        </div>
        <div className="shrink-0">{akcija}</div>
      </Otkrij>
    )
  }

  return (
    <Otkrij className={centrirano ? 'text-center' : ''}>
      <p className={`nadnaslov ${centrirano ? 'nadnaslov-centar justify-center' : ''}`}>{nadnaslov}</p>
      <h2 id={id} className="text-h2 mt-3.5 text-neutral-900">
        {naslov}
      </h2>
      {uvod && <p className={`uvodni mt-4 max-w-2xl ${centrirano ? 'mx-auto' : ''}`}>{uvod}</p>}
    </Otkrij>
  )
}
