'use client'

import { useEffect, useState } from 'react'
import { Link2, Check } from 'lucide-react'

// Brend-ikone (Lucide ih ne sadrži) — minimalne inline zamjene.
const Facebook = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
  </svg>
)
const WhatsApp = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4.1.6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .2 0 .7-.2 1.3Z" />
  </svg>
)
const Viber = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2C7 2 3 5.5 3 10.4c0 2.3.9 4.3 2.5 5.8v3.6l3-1.7c1.1.3 2.3.5 3.5.5 5 0 9-3.5 9-8.4S17 2 12 2Zm4.9 12.2c-.3.7-1.2 1.3-1.7 1.4-.4.1-.9.2-2.7-.6-2.3-1-3.7-3.3-3.8-3.4-.1-.1-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4l.6 1.5c.1.1.1.3 0 .4l-.3.4-.3.3c-.1.1-.2.2-.1.5.1.2.6.9 1.2 1.5.8.7 1.4.9 1.7 1 .2.1.3.1.4-.1l.5-.6c.2-.2.3-.2.5-.1l1.4.7c.2.1.4.2.4.3.1.1.1.5-.1 1Z" />
  </svg>
)

/**
 * Dijeljenje trenutne stranice (Facebook, WhatsApp, Viber, kopiranje linka).
 * WhatsApp i Viber su u BiH najčešći kanali — dijeljenje širi doseg i AEO signal.
 */
export function DijeliStranicu() {
  // Prazno na serveru i pri prvom client renderu (bez hydration mismatch-a),
  // pa se popuni stvarnim URL-om nakon montiranja. Dugmad su u HTML-u i bez JS-a.
  const [url, setUrl] = useState('')
  const [kopirano, setKopirano] = useState(false)

  useEffect(() => setUrl(window.location.href), [])

  const e = encodeURIComponent(url)
  const stavke = [
    { naziv: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${e}`, Ikona: Facebook },
    { naziv: 'WhatsApp', href: `https://wa.me/?text=${e}`, Ikona: WhatsApp },
    { naziv: 'Viber', href: `viber://forward?text=${e}`, Ikona: Viber },
  ]

  const kopiraj = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setKopirano(true)
      setTimeout(() => setKopirano(false), 2000)
    } catch {
      /* clipboard nedostupan */
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[13px] font-semibold text-neutral-400">Podijelite:</span>
      {stavke.map(({ naziv, href, Ikona }) => (
        <a
          key={naziv}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Podijelite stranicu na ${naziv}`}
          className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition-colors duration-150 hover:bg-white/15 hover:text-white"
        >
          <Ikona className="size-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={kopiraj}
        aria-label="Kopirajte link stranice"
        className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition-colors duration-150 hover:bg-white/15 hover:text-white"
      >
        {kopirano ? <Check className="size-4 text-success-400" /> : <Link2 className="size-4" />}
      </button>
    </div>
  )
}
