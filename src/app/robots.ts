import type { MetadataRoute } from 'next'
import { OSNOVNI_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${OSNOVNI_URL}/sitemap.xml`,
  }
}
