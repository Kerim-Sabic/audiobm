const base = process.env.SEO_VALIDATE_BASE_URL ?? 'http://localhost:3000'
const origin = new URL(base).origin

async function fetchText(path) {
  const url = path.startsWith('http') ? path : `${origin}${path}`
  const response = await fetch(url, { redirect: 'follow' })
  const text = await response.text()
  return { url, status: response.status, text, response }
}

function findAll(pattern, text) {
  return [...text.matchAll(pattern)].map((match) => match[1])
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function parseJsonLd(html, label, failures) {
  const scripts = findAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, html)
  const nodes = []

  for (const raw of scripts) {
    try {
      const parsed = JSON.parse(raw)
      nodes.push(...(Array.isArray(parsed) ? parsed : [parsed]))
    } catch (error) {
      failures.push(`${label}: invalid JSON-LD (${error.message})`)
    }
  }

  return nodes
}

function schemaTypes(nodes) {
  return unique(
    nodes.flatMap((node) => {
      const type = node?.['@type']
      return Array.isArray(type) ? type : type ? [type] : []
    }),
  )
}

function branchLinks(html) {
  return unique(findAll(/href="(\/poslovnice\/[^"#?]+)"/g, html)).sort()
}

const CITY_BY_BRANCH_PATH = {
  '/poslovnice/banja-luka': 'Banja Luka',
  '/poslovnice/bijeljina': 'Bijeljina',
  '/poslovnice/brcko': 'Brčko',
  '/poslovnice/doboj': 'Doboj',
  '/poslovnice/gradiska': 'Gradiška',
  '/poslovnice/sarajevo': 'Sarajevo',
  '/poslovnice/tuzla': 'Tuzla',
}

function robotsContent(html) {
  return html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i)?.[1] ?? ''
}

function hasNoindex(page) {
  return (
    robotsContent(page.text).toLowerCase().includes('noindex') ||
    (page.response.headers.get('x-robots-tag') ?? '').toLowerCase().includes('noindex')
  )
}

const failures = []
const warnings = []
const report = {
  base: origin,
  checkedAt: new Date().toISOString(),
  pages: [],
  sitemap: {},
  branchConsistency: {},
}

const sitemap = await fetchText('/sitemap.xml')
if (sitemap.status !== 200) failures.push(`/sitemap.xml returned ${sitemap.status}`)
const sitemapUrls = unique(findAll(/<loc>(.*?)<\/loc>/g, sitemap.text))
report.sitemap.urlCount = sitemapUrls.length
report.sitemap.includesBlackFriday = sitemap.text.includes('/akcije/blackfriday')
report.sitemap.includesProductCategory = sitemap.text.includes('/proizvodi/kategorija/baterije')
report.sitemap.includesTuzla = sitemap.text.includes('/poslovnice/tuzla')
report.sitemap.includesSarajevoHearingAids = sitemap.text.includes('/slusni-aparati-sarajevo')

if (report.sitemap.includesBlackFriday) failures.push('sitemap includes expired /akcije/blackfriday URL')
if (!report.sitemap.includesProductCategory) failures.push('sitemap is missing product category URLs')
if (!report.sitemap.includesTuzla) failures.push('sitemap is missing Tuzla branch URL')
if (!report.sitemap.includesSarajevoHearingAids) failures.push('sitemap is missing Sarajevo hearing aids URL')

const robots = await fetchText('/robots.txt')
if (robots.status !== 200) failures.push(`/robots.txt returned ${robots.status}`)
if (!robots.text.includes('Disallow: /admin')) failures.push('robots.txt does not disallow /admin')
if (!robots.text.includes('Sitemap:')) failures.push('robots.txt does not expose sitemap URL')

for (const path of ['/savjeti?kategorija=savjeti', '/zakazivanje?poslovnica=tuzla']) {
  const page = await fetchText(path)
  if (!hasNoindex(page)) failures.push(`${path} is missing noindex robots directive`)
}

const importantPaths = [
  '/',
  '/poslovnice',
  '/poslovnice/tuzla',
  '/slusni-aparati-sarajevo',
  '/usluge/provjera-sluha',
  '/proizvodi/kategorija/baterije',
  '/savjeti/prvi-znakovi-slabljenja-sluha',
  '/zakazivanje',
  '/online-test-sluha',
]

for (const path of importantPaths) {
  const page = await fetchText(path)
  const h1Count = (page.text.match(/<h1[\s>]/gi) ?? []).length
  const title = page.text.match(/<title>(.*?)<\/title>/i)?.[1] ?? ''
  const canonical = page.text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? ''
  const nodes = parseJsonLd(page.text, path, failures)
  const types = schemaTypes(nodes)

  if (page.status !== 200) failures.push(`${path} returned ${page.status}`)
  if (h1Count !== 1) failures.push(`${path} has ${h1Count} H1 elements`)
  if (!title) failures.push(`${path} is missing <title>`)
  if (!canonical) failures.push(`${path} is missing canonical link`)

  report.pages.push({ path, status: page.status, title, canonical, h1Count, schemaTypes: types })
}

const branchPages = sitemapUrls
  .map((url) => new URL(url).pathname)
  .filter((path) => /^\/poslovnice\/[^/]+$/.test(path))
  .sort()

const [home, locations, contact, booking] = await Promise.all([
  fetchText('/'),
  fetchText('/poslovnice'),
  fetchText('/kontakt'),
  fetchText('/zakazivanje'),
])

const homeBranches = branchLinks(home.text)
const locationsBranches = branchLinks(locations.text)
const contactBranches = branchLinks(contact.text)
const bookingBranchValues = branchPages.filter((path) => {
  const city = CITY_BY_BRANCH_PATH[path]
  return city ? booking.text.includes(city) : booking.text.includes(path.split('/').pop() ?? '')
})

report.branchConsistency = {
  sitemap: branchPages,
  home: homeBranches,
  locationsPage: locationsBranches,
  contactPage: contactBranches,
  bookingForm: bookingBranchValues,
}

for (const [label, links] of Object.entries(report.branchConsistency)) {
  if (label === 'sitemap') continue
  const missing = branchPages.filter((path) => !links.includes(path))
  if (missing.length) warnings.push(`${label} missing branch links: ${missing.join(', ')}`)
}

for (const path of branchPages) {
  const page = await fetchText(path)
  const nodes = parseJsonLd(page.text, path, failures)
  const localBusiness = nodes.find((node) => {
    const type = node?.['@type']
    return Array.isArray(type) ? type.includes('LocalBusiness') : type === 'LocalBusiness'
  })

  if (!localBusiness) {
    failures.push(`${path} missing LocalBusiness JSON-LD`)
    continue
  }

  if (!localBusiness.name) failures.push(`${path} LocalBusiness missing name`)
  if (!localBusiness.address?.addressLocality) failures.push(`${path} LocalBusiness missing addressLocality`)
  if (path !== '/poslovnice/sarajevo' && !localBusiness.telephone) {
    failures.push(`${path} LocalBusiness missing telephone`)
  }
  if (path !== '/poslovnice/sarajevo' && !localBusiness.address?.streetAddress) {
    failures.push(`${path} LocalBusiness missing streetAddress`)
  }
}

console.log(JSON.stringify({ ...report, warnings, failures }, null, 2))

if (failures.length) {
  process.exitCode = 1
}
