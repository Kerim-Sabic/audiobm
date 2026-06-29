/**
 * Broj statistike se renderuje kao konačna vrijednost već u HTML-u.
 * SEO alati i korisnici bez JavaScripta ne smiju vidjeti privremeni "0".
 */
export function Brojac({
  do: cilj,
  sufiks = '',
  className,
}: {
  do: number
  sufiks?: string
  className?: string
}) {
  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {cilj}
      {sufiks}
    </span>
  )
}
