import localFont from 'next/font/local'

/**
 * Inter Variable — samostalno hostovan, puna podrška za bosanske dijakritike
 * (č ć đ š ž) i tabelarne cifre za telefonske brojeve.
 */
export const inter = localFont({
  src: './InterVariable.woff2',
  display: 'swap',
  variable: '--font-inter',
  weight: '100 900',
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
})
