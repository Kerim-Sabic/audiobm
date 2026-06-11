import { Phone } from 'lucide-react'
import { DugmeLink } from '@/components/ui/Dugme'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { dajPodesavanja } from '@/lib/podaci'

/** 404 — izgubljeni korisnik mora moći nazvati ili se vratiti na početnu. */
export default async function StranicaNijePronadjena() {
  const podesavanja = await dajPodesavanja().catch(() => null)

  return (
    <div className="kontejner grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="max-w-lg">
        <p className="text-display text-brand-600">404</p>
        <h1 className="text-h1 mt-2">Ova stranica ne postoji</h1>
        <p className="mt-4 text-[18px] text-neutral-600">
          Možda je adresa pogrešno ukucana ili je stranica premještena. Ne brinite — sve važno je na
          dohvat ruke.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <DugmeLink href="/" velicina="veliko">
            Na početnu stranicu
          </DugmeLink>
          <DugmeLink href="/poslovnice" varijanta="sekundarno" velicina="veliko">
            Naše poslovnice
          </DugmeLink>
        </div>
        {podesavanja?.telefonGlavni && (
          <p className="mt-8 text-neutral-600">
            Najbrže do nas — pozovite:{' '}
            <TelefonLink
              broj={podesavanja.telefonGlavni}
              lokacija="404"
              className="text-[22px] text-neutral-900 hover:text-brand-700"
            />
          </p>
        )}
      </div>
    </div>
  )
}
