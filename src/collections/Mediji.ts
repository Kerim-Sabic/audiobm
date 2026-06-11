import type { CollectionConfig } from 'payload'
import sharp from 'sharp'
import { jeUrednik, javno } from '../access/uloge'

export const Mediji: CollectionConfig = {
  slug: 'mediji',
  labels: { singular: 'Medij', plural: 'Mediji' },
  admin: {
    group: 'Sadržaj',
    description: 'Slike i dokumenti. Pri otpremanju se automatski prave optimizovane verzije.',
  },
  access: {
    read: javno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
    adminThumbnail: 'mala',
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 85 } },
    resizeOptions: { width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'mala', width: 480, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'srednja', width: 768, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'velika', width: 1080, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'xl', width: 1440, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'puna', width: 1920, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 75 } } },
    ],
  },
  hooks: {
    beforeChange: [
      // LQIP (mutna sličica za učitavanje bez skakanja sadržaja)
      async ({ data, req }) => {
        const file = req.file
        if (file?.data && /^image\/(jpeg|png|webp|avif)/.test(file.mimetype ?? '')) {
          try {
            const buf = await sharp(file.data).resize(24).blur(1.5).webp({ quality: 30 }).toBuffer()
            data.lqip = `data:image/webp;base64,${buf.toString('base64')}`
          } catch {
            /* LQIP nije kritičan */
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Opis slike (alt tekst)',
      type: 'text',
      required: true,
      admin: {
        description: 'Kratak opis za čitače ekrana i pretraživače, npr. „Zaušni slušni aparat Bernafon".',
      },
    },
    {
      name: 'lqip',
      label: 'LQIP (automatski)',
      type: 'text',
      admin: { readOnly: true, hidden: true },
    },
  ],
}
