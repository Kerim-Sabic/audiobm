'use client'

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { Check, CircleAlert } from 'lucide-react'

/**
 * Polja obrazaca: trajno vidljive oznake, velike dodirne površine (48px+),
 * poruke o greškama na bosanskom ispod polja (bez tresenja — fade-in).
 * Smiren, klinički izgled: mekani rub, jasna stanja, bez vizuelne buke.
 */

const poljeKlase = (greska?: string) =>
  `w-full rounded-[14px] border bg-white px-4 py-3.5 text-[17px] min-h-12 ` +
  `transition-[border-color,box-shadow] duration-250 placeholder:text-neutral-400 ` +
  (greska
    ? 'border-error-600 shadow-[0_0_0_3px_rgb(185_28_28/0.08)] focus-visible:outline-error-600'
    : 'border-neutral-300 shadow-[inset_0_1px_2px_rgb(28_25_23/0.03)] hover:border-neutral-400')

function Omotac({
  id,
  oznaka,
  greska,
  uspjeh,
  pomoc,
  children,
}: {
  id: string
  oznaka: string
  greska?: string
  uspjeh?: boolean
  pomoc?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-[15.5px] font-semibold text-neutral-800">
        {oznaka}
        {uspjeh && !greska && (
          <Check className="size-4 text-success-600 opacity-0 transition-opacity duration-250 [.uspjeh_&]:opacity-100" aria-hidden />
        )}
      </label>
      {children}
      {pomoc && !greska && <p className="text-small text-neutral-500">{pomoc}</p>}
      {greska && (
        <p
          id={`${id}-greska`}
          role="alert"
          className="text-small flex items-center gap-1.5 animate-[uplov_250ms_ease-out] font-medium text-error-600"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {greska}
        </p>
      )}
    </div>
  )
}

export function PoljeUnos({
  oznaka,
  greska,
  uspjeh,
  pomoc,
  ...rest
}: { oznaka: string; greska?: string; uspjeh?: boolean; pomoc?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Omotac id={id} oznaka={oznaka} greska={greska} uspjeh={uspjeh} pomoc={pomoc}>
      <input
        id={id}
        aria-invalid={Boolean(greska)}
        aria-describedby={greska ? `${id}-greska` : undefined}
        className={poljeKlase(greska)}
        {...rest}
      />
    </Omotac>
  )
}

export function PoljeTekst({
  oznaka,
  greska,
  pomoc,
  ...rest
}: { oznaka: string; greska?: string; pomoc?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Omotac id={id} oznaka={oznaka} greska={greska} pomoc={pomoc}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={Boolean(greska)}
        aria-describedby={greska ? `${id}-greska` : undefined}
        className={poljeKlase(greska)}
        {...rest}
      />
    </Omotac>
  )
}

export function PoljeIzbor({
  oznaka,
  greska,
  pomoc,
  children,
  ...rest
}: { oznaka: string; greska?: string; pomoc?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Omotac id={id} oznaka={oznaka} greska={greska} pomoc={pomoc}>
      <select
        id={id}
        aria-invalid={Boolean(greska)}
        aria-describedby={greska ? `${id}-greska` : undefined}
        className={poljeKlase(greska)}
        {...rest}
      >
        {children}
      </select>
    </Omotac>
  )
}

/** Saglasnost — obavezna kvačica uz link na politiku privatnosti. */
export function PoljeSaglasnost({
  greska,
  ...rest
}: { greska?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(greska)}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-brand-600"
          {...rest}
        />
        <span className="text-small text-neutral-700">
          Saglasan/saglasna sam da Audio BM koristi moje podatke isključivo radi odgovora na upit, u
          skladu sa{' '}
          <a href="/politika-privatnosti" target="_blank" className="text-brand-700 underline underline-offset-2">
            politikom privatnosti
          </a>
          .
        </span>
      </label>
      {greska && (
        <p role="alert" className="text-small flex items-center gap-1.5 font-medium text-error-600">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {greska}
        </p>
      )}
    </div>
  )
}
