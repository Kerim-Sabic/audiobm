/**
 * Audio BM BiH — preuzimanje stvarnih resursa sa audiobm.ba (Shopify).
 * Skida: logo, favicon, marketinške slike, kompletan katalog proizvoda sa slikama,
 * sadržaj stranica za preradu. Piše products-manifest.json i assets-report.md.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, 'assets-src');
const BASE = 'https://audiobm.ba';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AssetMigration/1.0 (ovlasteno preuzimanje vlastitih resursa)';

const report = { ok: [], failed: [] };

async function fetchWithRetry(url, asBuffer = false, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
}

function originalUrl(u) {
  // Shopify CDN: bez query parametara služi original u punoj rezoluciji
  let url = u.startsWith('//') ? 'https:' + u : u;
  return url.split('?')[0];
}

async function download(url, destPath, label) {
  try {
    if (existsSync(destPath)) { report.ok.push(`${label}: ${url} -> ${destPath} (već postoji)`); return true; }
    const buf = await fetchWithRetry(url, true);
    await mkdir(path.dirname(destPath), { recursive: true });
    await writeFile(destPath, buf);
    report.ok.push(`${label}: ${url} -> ${path.relative(ROOT, destPath)} (${(buf.length / 1024).toFixed(0)} KB)`);
    return true;
  } catch (e) {
    report.failed.push(`[MISSING_ASSET] ${label}: ${url} — ${e.message}`);
    return false;
  }
}

async function pool(items, worker, size = 5) {
  const queue = [...items];
  const runners = Array.from({ length: size }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

// ---------- 1. Brand ----------
async function grabBrand() {
  console.log('1/5 Brend (logo, favicon)…');
  await download(`${BASE}/cdn/shop/files/logo_2.png`, path.join(SRC, 'brand', 'logo_2-original.png'), 'logo (header, puna rezolucija)');
  await download(`${BASE}/cdn/shop/files/audio-bm-logo-min.jpg`, path.join(SRC, 'brand', 'audio-bm-logo-min.jpg'), 'logo (footer jpg)');
  await download(`${BASE}/cdn/shop/files/32_bela_pozadina.png`, path.join(SRC, 'brand', 'favicon-original.png'), 'favicon original');
}

// ---------- 2. Marketing ----------
async function grabMarketing() {
  console.log('2/5 Marketinške slike…');
  const html = await readFile(path.join(SRC, 'content', 'homepage.html'), 'utf8');
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href|srcset)="([^"]*cdn\/shop\/files\/[^"\s]*\.(?:jpg|jpeg|png|webp)[^"\s]*)"/gi)) {
    const u = originalUrl(m[1]);
    if (!/logo|bela_pozadina/i.test(u)) urls.add(u);
  }
  for (const u of urls) {
    await download(u, path.join(SRC, 'marketing', path.basename(u)), 'marketing');
  }
}

// ---------- 3. Products ----------
async function grabProducts() {
  console.log('3/5 Katalog proizvoda…');
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const txt = await fetchWithRetry(`${BASE}/products.json?limit=250&page=${page}`);
    const { products } = JSON.parse(txt);
    if (!products?.length) break;
    all.push(...products);
    if (products.length < 250) break;
  }
  console.log(`   ${all.length} proizvoda pronađeno`);

  // članstvo u kolekcijama
  const collections = ['slusni-aparati', 'slusni-aparati-cijena', 'slusni-aparati-nivo-1', 'slusni-aparati-nivo-2',
    'slusni-aparati-nivo-3', 'slusni-aparati-nivo-4', 'cepovi-za-usi', 'kucni-medicinski-aparati',
    'baterije-za-slusne-aparate', 'pribor-za-slusne-aparate', 'antidekubit-duseci', 'inhalatori',
    'meraci-krvnog-pritiska', 'pulsni-oksimetri', 'digitalni-termometri', 'budilnici-za-gluve-i-nagluve',
    'cepovi-pribor-baterije-budilnici', 'kohlearni-implanti', 'frontpage', 'fzo'];
  const membership = {};
  await pool(collections, async (c) => {
    try {
      const txt = await fetchWithRetry(`${BASE}/collections/${c}/products.json?limit=250`);
      const { products } = JSON.parse(txt);
      for (const p of products ?? []) (membership[p.handle] ??= []).push(c);
      report.ok.push(`kolekcija ${c}: ${products?.length ?? 0} proizvoda`);
    } catch (e) {
      report.failed.push(`kolekcija ${c}: ${e.message}`);
    }
  }, 4);

  const manifest = [];
  await pool(all, async (p) => {
    const dir = path.join(SRC, 'products', p.handle);
    const images = [];
    for (const [i, img] of (p.images ?? []).entries()) {
      const u = originalUrl(img.src);
      const ext = path.extname(new URL(u).pathname) || '.jpg';
      const file = path.join(dir, `${String(i + 1).padStart(2, '0')}${ext}`);
      const ok = await download(u, file, `proizvod ${p.handle} slika ${i + 1}`);
      images.push({ remote: u, local: ok ? path.relative(ROOT, file).replaceAll('\\', '/') : '[MISSING_ASSET]', alt: img.alt ?? null, width: img.width, height: img.height });
    }
    const v = p.variants?.[0];
    manifest.push({
      handle: p.handle,
      title: p.title,
      vendor: p.vendor,
      productType: p.product_type || null,
      tags: p.tags ?? [],
      bodyHtml: p.body_html ?? '',
      price: v ? Number(v.price) : null,
      compareAtPrice: v?.compare_at_price ? Number(v.compare_at_price) : null,
      available: v?.available ?? null,
      collections: membership[p.handle] ?? [],
      createdAt: p.created_at,
      images,
    });
  }, 5);

  manifest.sort((a, b) => a.handle.localeCompare(b.handle));
  await writeFile(path.join(ROOT, 'products-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`   manifest: ${manifest.length} proizvoda`);
}

// ---------- 4. Content pages ----------
async function grabContent() {
  console.log('4/5 Sadržaj stranica…');
  const pages = ['pages/kontakt', 'pages/rezervacije', 'pages/kohlearni-implanti', 'pages/o-nama', 'pages/gradiska',
    'pages/doboj', 'pages/brcko', 'pages/bijeljina', 'pages/sve-lokacije', 'pages/nevidljivi-slusni-aparati',
    'collections/slusni-aparati', 'collections/cepovi-za-usi', 'collections/kucni-medicinski-aparati',
    'collections/slusni-aparati-cijena', 'collections/baterije-za-slusne-aparate'];
  await pool(pages, async (pg) => {
    try {
      const html = await fetchWithRetry(`${BASE}/${pg}`);
      const file = path.join(SRC, 'content', pg.replaceAll('/', '__') + '.html');
      await writeFile(file, html);
      report.ok.push(`stranica ${pg} sačuvana`);
    } catch (e) {
      report.failed.push(`stranica ${pg}: ${e.message}`);
    }
  }, 4);
}

// ---------- 5. Report ----------
async function writeReport() {
  const md = `# Izvještaj o preuzimanju resursa — audiobm.ba\n\nDatum: ${new Date().toISOString()}\n\n## Uspješno (${report.ok.length})\n\n${report.ok.map((l) => `- ${l}`).join('\n')}\n\n## Neuspješno (${report.failed.length})\n\n${report.failed.length ? report.failed.map((l) => `- ${l}`).join('\n') : '- (ništa)'}\n`;
  await writeFile(path.join(ROOT, 'assets-report.md'), md);
  console.log(`5/5 Izvještaj: ${report.ok.length} OK, ${report.failed.length} neuspješno`);
}

await grabBrand();
await grabMarketing();
await grabProducts();
await grabContent();
await writeReport();
