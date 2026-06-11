import type { Field } from 'payload'

/** Pretvara tekst u URL-slug (š→s, č/ć→c, đ→dj, ž→z). */
export const uSlug = (val: string): string =>
  val
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .replace(/š/g, 's')
    .replace(/[čć]/g, 'c')
    .replace(/ž/g, 'z')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Slug polje — automatski se popunjava iz navedenog polja ako je prazno. */
export const slugPolje = (izvor = 'naziv'): Field => ({
  name: 'slug',
  label: 'Adresa stranice (slug)',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Dio web-adrese, npr. „banja-luka". Ostavite prazno za automatsko popunjavanje.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length) return uSlug(value)
        const izvorna = (data?.[izvor] as string) ?? ''
        return izvorna ? uSlug(izvorna) : value
      },
    ],
  },
})
