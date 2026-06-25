import React from 'react'

/** Logo na stranici prijave u administraciju — brend „Svijet Sluha". */
export const AdminLogo = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>
    <span style={{ background: '#ED1C24', color: '#fff', borderRadius: '7px', padding: '2px 9px' }}>SVIJET</span>
    <span style={{ marginLeft: '7px' }}>SLUHA</span>
  </span>
)

/** Mali znak u uglu administracije — kružni znak (zvučni talasi). */
export const AdminIkona = () => (
  <svg viewBox="0 0 100 100" width="26" height="26" fill="none" style={{ color: '#ED1C24' }} aria-hidden>
    <circle cx="50" cy="50" r="11" stroke="currentColor" strokeWidth="9" />
    <g stroke="currentColor" strokeWidth="9.5" strokeLinecap="round">
      <path d="M81.3 63.3 A34 34 0 0 1 63.3 81.3" />
      <path d="M36.7 81.3 A34 34 0 0 1 18.7 63.3" />
      <path d="M18.7 36.7 A34 34 0 0 1 36.7 18.7" />
      <path d="M63.3 18.7 A34 34 0 0 1 81.3 36.7" />
    </g>
  </svg>
)
