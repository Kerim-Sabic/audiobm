'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import {
  FREKVENCIJE,
  KATEGORIJE_TESTA,
  UPITNIK,
  ZASTAVICE,
  type RezultatTesta,
  type UpitnikKljuc,
} from '@/lib/test-sluha'

const BOJE_KATEGORIJA: Record<string, { pozadina: string; tekst: string }> = {
  'bez-znakova': { pozadina: '#dcfce7', tekst: '#166534' },
  moguca: { pozadina: '#fef3c7', tekst: '#92400e' },
  preporuka: { pozadina: '#fde4e5', tekst: '#901318' },
  hitno: { pozadina: '#ED1C24', tekst: '#ffffff' },
}

const znacka: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 12px',
  borderRadius: '99px',
  fontSize: '12.5px',
  fontWeight: 700,
}

const red: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '7px 0',
  borderBottom: '1px solid var(--theme-elevation-100)',
  fontSize: '13.5px',
}

/** Prag po frekvencijama u jednom redu: „×" = nije čuo najglasniji ton. */
function PragoviUha({ naziv, pragovi }: { naziv: string; pragovi: Record<string, number | null> }) {
  return (
    <div style={red}>
      <span style={{ color: 'var(--theme-elevation-600)' }}>{naziv}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        {FREKVENCIJE.map((f) => {
          const p = pragovi[String(f)]
          return `${f >= 1000 ? `${f / 1000}k` : f}: ${p === null ? '×' : p}`
        }).join('  ·  ')}
      </span>
    </div>
  )
}

/**
 * Čitljiv pregled rezultata online testa sluha u administraciji —
 * osoblje ne mora čitati sirovi JSON. Prikazuje se samo za vrstu
 * „online-test-sluha" (uslov na polju u kolekciji Upiti).
 */
export function RezultatTestaPolje() {
  const rezultat = useFormFields(([fields]) => fields?.rezultatTesta?.value) as
    | RezultatTesta
    | null
    | undefined

  if (!rezultat || typeof rezultat !== 'object' || !rezultat.kategorija) return null

  const kategorija = KATEGORIJE_TESTA[rezultat.kategorija]
  const boje = BOJE_KATEGORIJA[rezultat.kategorija] ?? BOJE_KATEGORIJA['bez-znakova']
  const zastavice = (rezultat.zastavice ?? []).map(
    (z) => ZASTAVICE.find((x) => x.id === z)?.oznaka ?? z,
  )
  const pouzdanostBoja =
    rezultat.pouzdanostNivo === 'visoka' ? '#166534' : rezultat.pouzdanostNivo === 'srednja' ? '#92400e' : '#901318'

  return (
    <div
      style={{
        background: 'var(--theme-elevation-25)',
        border: '1px solid var(--theme-elevation-100)',
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '24px',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--theme-elevation-500)',
        }}
      >
        Rezultat online testa sluha (informativni screening — nije dijagnoza)
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        <span style={{ ...znacka, background: boje.pozadina, color: boje.tekst }}>
          {kategorija?.naslov ?? rezultat.kategorija}
        </span>
        <span
          style={{
            ...znacka,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-150)',
            color: pouzdanostBoja,
          }}
        >
          Pouzdanost: {rezultat.pouzdanost}/100 ({rezultat.pouzdanostNivo})
        </span>
        {zastavice.length > 0 && (
          <span style={{ ...znacka, background: '#ED1C24', color: '#fff' }}>
            ⚑ Crvene zastavice ({zastavice.length})
          </span>
        )}
      </div>

      {zastavice.length > 0 && (
        <p
          style={{
            margin: '0 0 14px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#fde4e5',
            color: '#901318',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          {zastavice.join(' · ')} — preporučena brza ljekarska/ORL procjena.
        </p>
      )}

      <div style={{ marginBottom: '14px' }}>
        <PragoviUha naziv="Desno uho (relativni prag 0–60, niže = bolje)" pragovi={rezultat.pragovi?.desno ?? {}} />
        <PragoviUha naziv="Lijevo uho" pragovi={rezultat.pragovi?.lijevo ?? {}} />
        <div style={{ ...red, borderBottom: 'none' }}>
          <span style={{ color: 'var(--theme-elevation-600)' }}>Kontrola kvaliteta</span>
          <span style={{ fontWeight: 600 }}>
            lažne potvrde: {rezultat.laznePotvrde ?? 0} · ponavljanja: {rezultat.ponavljanja ?? 0} · mikrofon:{' '}
            {rezultat.mikrofonProvjera ?? '—'} · trajanje: {rezultat.trajanjeSekundi ?? 0}s
          </span>
        </div>
      </div>

      <details>
        <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: 'var(--theme-elevation-600)' }}>
          Odgovori iz upitnika
        </summary>
        <div style={{ marginTop: '8px' }}>
          {(Object.keys(UPITNIK) as UpitnikKljuc[]).map((k) => {
            const v = rezultat.upitnik?.[k]
            const odgovor = UPITNIK[k].odgovori.find((o) => o.v === v)?.o ?? v ?? '—'
            return (
              <div key={k} style={red}>
                <span style={{ color: 'var(--theme-elevation-600)', maxWidth: '70%' }}>{UPITNIK[k].pitanje}</span>
                <span style={{ fontWeight: 600 }}>{odgovor}</span>
              </div>
            )
          })}
        </div>
      </details>
    </div>
  )
}
