import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
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
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: '12px',
  padding: '20px 24px',
}

/** Kontrolna tabla: novi upiti ove sedmice, upiti po poslovnici, aktivne akcije. */
export async function KontrolnaTabla({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult
  const payload = req.payload

  const sedmicaUnazad = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const danas = new Date().toISOString()

  const [noviUpiti, sviOtvoreni, poslovnice, akcije] = await Promise.all([
    payload.find({
      collection: 'upiti',
      where: { createdAt: { greater_than: sedmicaUnazad } },
      limit: 200,
      depth: 1,
      sort: '-createdAt',
    }),
    payload.find({ collection: 'upiti', where: { status: { equals: 'novo' } }, limit: 0 }),
    payload.find({ collection: 'poslovnice', where: { aktivna: { equals: true } }, limit: 20, draft: false }),
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
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={{}}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={{}}
      user={initPageResult.req.user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1 style={{ marginBottom: '4px' }}>Dobro došli, {(initPageResult.req.user?.ime as string) ?? ''}</h1>
        <p style={{ color: 'var(--theme-elevation-500)', marginBottom: '28px' }}>
          Pregled rada web stranice Audio BM
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={kartica}>
            <div style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>{noviUpiti.totalDocs}</div>
            <div style={{ marginTop: '8px', color: 'var(--theme-elevation-600)' }}>upita u posljednjih 7 dana</div>
          </div>
          <div style={kartica}>
            <div style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1, color: sviOtvoreni.totalDocs > 0 ? '#ED1C24' : 'inherit' }}>
              {sviOtvoreni.totalDocs}
            </div>
            <div style={{ marginTop: '8px', color: 'var(--theme-elevation-600)' }}>
              neodgovorenih upita (status „Novo")
            </div>
          </div>
          <div style={kartica}>
            <div style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>{akcije.totalDocs}</div>
            <div style={{ marginTop: '8px', color: 'var(--theme-elevation-600)' }}>aktivnih akcija</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={kartica}>
            <h2 style={{ fontSize: '17px', marginBottom: '16px' }}>Upiti po poslovnici (7 dana)</h2>
            {poLokaciji.size === 0 && <p style={{ color: 'var(--theme-elevation-500)' }}>Još nema upita ove sedmice.</p>}
            {[...poLokaciji.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([naziv, broj]) => (
                <div key={naziv} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>{naziv}</span>
                    <strong>{broj}</strong>
                  </div>
                  <div style={{ background: 'var(--theme-elevation-100)', borderRadius: '4px', height: '8px' }}>
                    <div
                      style={{
                        width: `${(broj / maxLok) * 100}%`,
                        background: '#ED1C24',
                        borderRadius: '4px',
                        height: '8px',
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
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  background: 'var(--theme-elevation-0)',
                  border: '1px solid var(--theme-elevation-100)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <strong style={{ fontSize: '14px' }}>{u.ime as string}</strong>{' '}
                <span style={{ fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
                  — {VRSTE[u.vrsta as string] ?? u.vrsta}
                  {u.status === 'novo' ? ' · NOVO' : ''}
                </span>
              </a>
            ))}
            {noviUpiti.docs.length === 0 && <p style={{ color: 'var(--theme-elevation-500)' }}>Nema upita.</p>}
          </div>
        </div>

        <div style={{ ...kartica, marginBottom: '28px' }}>
          <h2 style={{ fontSize: '17px', marginBottom: '12px' }}>Posjećenost stranica</h2>
          <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
            [PLACEHOLDER: Statistika posjećenosti se prikazuje nakon povezivanja Plausible analitike —
            Podešavanja → Društvene mreže i analitika.]
          </p>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
