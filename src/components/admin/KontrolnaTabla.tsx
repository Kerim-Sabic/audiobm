import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

const VRSTE: Record<string, string> = {
  zakazivanje: 'Zakazivanje provjere sluha',
  doktor: 'Pitanje za doktora',
  poslovnica: 'Poruka za poslovnicu',
  podrska: 'Opšta podrška',
  kupovina: 'Kupovina proizvoda',
  'povratni-poziv': 'Povratni poziv',
}

const kartica: React.CSSProperties = {
  background: 'var(--theme-elevation-25)',
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: '14px',
  padding: '22px 26px',
}

const akcijaDugme: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '10px',
  background: 'var(--theme-elevation-0)',
  border: '1px solid var(--theme-elevation-150)',
  textDecoration: 'none',
  color: 'var(--theme-elevation-800)',
  fontSize: '14px',
  fontWeight: 600,
}

/**
 * Kontrolna tabla — prikazuje se UNUTAR Payload šablona (bez vlastite
 * navigacije; raniji duple-navigacije bug je nastao dvostrukim omotavanjem
 * u DefaultTemplate).
 */
export async function KontrolnaTabla({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult
  const payload = req.payload

  const sedmicaUnazad = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const danas = new Date().toISOString()

  const [noviUpiti, sviOtvoreni, akcije] = await Promise.all([
    payload.find({
      collection: 'upiti',
      where: { createdAt: { greater_than: sedmicaUnazad } },
      limit: 200,
      depth: 1,
      sort: '-createdAt',
    }),
    payload.find({ collection: 'upiti', where: { status: { equals: 'novo' } }, limit: 0 }),
    payload.find({
      collection: 'akcije',
      where: { and: [{ vrijediOd: { less_than_equal: danas } }, { vrijediDo: { greater_than_equal: danas } }] },
      limit: 10,
      draft: false,
    }),
  ])

  const poLokaciji = new Map<string, number>()
  for (const u of noviUpiti.docs) {
    const naziv =
      typeof u.poslovnica === 'object' && u.poslovnica ? (u.poslovnica.naziv as string) : 'Bez poslovnice'
    poLokaciji.set(naziv, (poLokaciji.get(naziv) ?? 0) + 1)
  }
  const maxLok = Math.max(1, ...poLokaciji.values())

  return (
    <Gutter>
      <div style={{ padding: '28px 0 60px' }}>
        <h1 style={{ marginBottom: '4px', fontSize: '28px' }}>
          Dobro došli, {(initPageResult.req.user?.ime as string) ?? ''}
        </h1>
        <p style={{ color: 'var(--theme-elevation-500)', marginBottom: '20px' }}>
          Pregled rada web stranice Audio BM
        </p>

        {/* brze radnje — najčešći zadaci na jedan klik */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
          <a href="/admin/collections/upiti" style={{ ...akcijaDugme, background: '#ED1C24', borderColor: '#ED1C24', color: '#fff' }}>
            Upiti{sviOtvoreni.totalDocs > 0 ? ` (${sviOtvoreni.totalDocs} novih)` : ''}
          </a>
          <a href="/admin/collections/akcije/create" style={akcijaDugme}>+ Nova akcija</a>
          <a href="/admin/collections/objave/create" style={akcijaDugme}>+ Nova objava</a>
          <a href="/admin/collections/poslovnice" style={akcijaDugme}>Poslovnice</a>
          <a href="/admin/collections/proizvodi" style={akcijaDugme}>Proizvodi</a>
          <a href="/api/upiti/izvoz" style={akcijaDugme}>CSV izvoz upita</a>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div style={kartica}>
            <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{noviUpiti.totalDocs}</div>
            <div style={{ marginTop: '8px', color: 'var(--theme-elevation-600)' }}>upita u posljednjih 7 dana</div>
          </div>
          <div style={kartica}>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 800,
                lineHeight: 1,
                color: sviOtvoreni.totalDocs > 0 ? '#ED1C24' : 'inherit',
              }}
            >
              {sviOtvoreni.totalDocs}
            </div>
            <div style={{ marginTop: '8px', color: 'var(--theme-elevation-600)' }}>
              neodgovorenih upita (status „Novo")
            </div>
          </div>
          <div style={kartica}>
            <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{akcije.totalDocs}</div>
            <div style={{ marginTop: '8px', color: 'var(--theme-elevation-600)' }}>aktivnih akcija</div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div style={kartica}>
            <h2 style={{ fontSize: '17px', marginBottom: '16px' }}>Upiti po poslovnici (7 dana)</h2>
            {poLokaciji.size === 0 && (
              <p style={{ color: 'var(--theme-elevation-500)' }}>Još nema upita ove sedmice.</p>
            )}
            {[...poLokaciji.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([naziv, broj]) => (
                <div key={naziv} style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      marginBottom: '5px',
                    }}
                  >
                    <span>{naziv}</span>
                    <strong>{broj}</strong>
                  </div>
                  <div style={{ background: 'var(--theme-elevation-100)', borderRadius: '5px', height: '9px' }}>
                    <div
                      style={{
                        width: `${(broj / maxLok) * 100}%`,
                        background: 'linear-gradient(90deg, #F03C43, #ED1C24)',
                        borderRadius: '5px',
                        height: '9px',
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div style={kartica}>
            <h2 style={{ fontSize: '17px', marginBottom: '16px' }}>Najnoviji upiti</h2>
            {noviUpiti.docs.slice(0, 6).map((u) => (
              <a
                key={u.id}
                href={`/admin/collections/upiti/${u.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  marginBottom: '7px',
                  background: 'var(--theme-elevation-0)',
                  border: '1px solid var(--theme-elevation-100)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span>
                  <strong style={{ fontSize: '14px' }}>{u.ime as string}</strong>{' '}
                  <span style={{ fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
                    — {VRSTE[u.vrsta as string] ?? u.vrsta}
                  </span>
                </span>
                {u.status === 'novo' && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      color: '#fff',
                      background: '#ED1C24',
                      borderRadius: '99px',
                      padding: '3px 9px',
                    }}
                  >
                    NOVO
                  </span>
                )}
              </a>
            ))}
            {noviUpiti.docs.length === 0 && (
              <p style={{ color: 'var(--theme-elevation-500)' }}>Nema upita.</p>
            )}
          </div>
        </div>

        <div style={kartica}>
          <h2 style={{ fontSize: '17px', marginBottom: '12px' }}>Posjećenost stranica</h2>
          <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
            [PLACEHOLDER: Statistika posjećenosti se prikazuje nakon povezivanja Plausible analitike —
            Podešavanja → Društvene mreže i analitika.]
          </p>
        </div>
      </div>
    </Gutter>
  )
}
