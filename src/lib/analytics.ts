'use client'

/**
 * Analitički događaji (Plausible). Bez podešene domene pozivi su bezopasni no-op.
 * Događaji: lead_submit, call_click, whatsapp_click, viber_click,
 * booking_start, booking_complete, promo_click,
 * hearing_test_start, hearing_test_complete.
 */
type Dogadjaj =
  | 'lead_submit'
  | 'call_click'
  | 'whatsapp_click'
  | 'viber_click'
  | 'booking_start'
  | 'booking_complete'
  | 'promo_click'
  | 'hearing_test_start'
  | 'hearing_test_complete'

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void
  }
}

export function zabiljezi(dogadjaj: Dogadjaj, svojstva?: Record<string, string>) {
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(dogadjaj, svojstva ? { props: svojstva } : undefined)
  }
}
