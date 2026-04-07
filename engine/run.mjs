#!/usr/bin/env node

/**
 * finanzas-pop-engine — Motor automático de contenido
 *
 * Ejecutar: node engine/run.mjs
 *
 * Pipeline completo:
 * 1. Scrapea noticias financieras de México
 * 2. Elige el mejor tema (filtro MRV)
 * 3. Genera hook + script
 * 4. Crea el Reel (video)
 * 5. Genera caption con hashtags
 * 6. Lo deja en Contenido_IG/ listo para publicar
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const FONTS_DIR = join(ROOT, 'content', 'fonts');
const OUTPUT_DIR = join(ROOT, 'Contenido_IG', 'reels');
const CAROUSEL_DIR = join(ROOT, 'Contenido_IG', 'carousels');
const QUOTE_DIR = join(ROOT, 'Contenido_IG', 'quotes');
const CONTENT_LOG = join(ROOT, 'content', 'content-log.md');

// Fonts
const fontBold = readFileSync(join(FONTS_DIR, 'Inter-Bold.ttf'));
const fontMedium = readFileSync(join(FONTS_DIR, 'Inter-Medium.ttf'));
const fontRegular = readFileSync(join(FONTS_DIR, 'Inter-Regular.ttf'));
const fonts = [
  { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  { name: 'Inter', data: fontMedium, weight: 500, style: 'normal' },
  { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
];

const C ={ bg: '#faf6f1', red: '#dc2626', dark: '#1c1917', muted: '#78716c', light: '#a89880', darkBg: '#1c1917',
  slate: '#1e293b', mint: '#d1fae5', amber: '#f59e0b', stone: '#e7e5e4', white: '#ffffff' };

// Sanitize text for Satori — ONLY keep basic Latin, accented chars, punctuation, and numbers
// Everything else gets stripped. This is aggressive but prevents ALL "NO GLYPH" issues.
function sanitize(text) {
  if (!text) return '';
  // Keep only: basic ASCII, Latin Extended (accents), common punctuation, numbers, spaces
  return text.replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '').trim();
}

// Truncate at word boundary — never cuts mid-word
function truncateWords(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '...';
}

// ═══════════════════════════════════════════
// TEMPLATE SYSTEM (8 visual templates)
// ═══════════════════════════════════════════
const TEMPLATE_MAP = {
  'news':        { primary: 'daily-briefing',   alternate: 'editorial-quote' },
  'stat':        { primary: 'bold-data',        alternate: 'the-reveal' },
  'comparison':  { primary: 'comparison-grid',  alternate: null },
  'quote':       { primary: 'editorial-quote',  alternate: 'pop-context' },
  'how-to':      { primary: 'step-by-step',     alternate: null },
  'myth':        { primary: 'the-reveal',       alternate: 'bold-data' },
  'ranking':     { primary: 'ranking-list',     alternate: 'comparison-grid' },
  'pop-culture': { primary: 'pop-context',      alternate: 'editorial-quote' },
};


/**
 * Choose a visual template based on content type and recent history.
 * Reads content-log.md to avoid repeating the same template 2x in a row.
 */
function chooseTemplate(topic) {
  // Detect content type from topic metadata
  const titulo = (topic.titulo || '').toLowerCase();
  const dato = (topic.dato || '').toLowerCase();
  const relevancia = (topic.relevancia || '').toLowerCase();
  const all = `${titulo} ${dato} ${relevancia}`;

  let contentType = 'news'; // default
  if (/vs\.?|versus|compar/i.test(all)) contentType = 'comparison';
  else if (/top\s?\d|ranking|las \d|los \d|mejor/i.test(all)) contentType = 'ranking';
  else if (/cómo|como|pasos?|guía|tutorial|abrir|empezar/i.test(all)) contentType = 'how-to';
  else if (/mito|mentira|verdad|nadie te dice|crees que|realidad/i.test(all)) contentType = 'myth';
  else if (/solo el|solo un|\d+%|8\.8%|millones de mexicanos/i.test(all) && dato) contentType = 'stat';
  else if (/trending|pop|cultura|onlyfans|bimbo|netflix|noruega|chisme/i.test(all)) contentType = 'pop-culture';
  else if (/tanda|rendimiento.*\$0|opinión|provocat/i.test(all)) contentType = 'quote';

  const mapping = TEMPLATE_MAP[contentType] || TEMPLATE_MAP['news'];
  let template = mapping.primary;

  // Read recent templates from content-log to avoid 2x in a row
  let recentTemplates = [];
  try {
    const log = readFileSync(CONTENT_LOG, 'utf-8');
    const lines = log.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.toLowerCase().includes('fecha'));
    recentTemplates = lines.slice(-3).map(l => {
      const cols = l.split('|').map(c => c.trim());
      return (cols[7] || '').toLowerCase(); // template column (we'll add it)
    }).filter(Boolean);
  } catch {}

  // If last 2 used the same template, force alternate
  if (recentTemplates.length >= 2) {
    const lastTwo = recentTemplates.slice(-2);
    if (lastTwo.every(t => t === template) && mapping.alternate) {
      console.log(`  🔄 Template "${template}" usado 2x seguidas → rotando a "${mapping.alternate}"`);
      template = mapping.alternate;
    }
  }

  console.log(`  🎨 Content type: "${contentType}" → Template: "${template}"`);
  return { template, contentType };
}
const TODAY = new Date().toISOString().split('T')[0];
const GEMINI_KEY = process.env.GEMINI_API_KEY || readEnvKey('GEMINI_API_KEY');

function readEnvKey(key) {
  try {
    const env = readFileSync(join(ROOT, '.env'), 'utf-8');
    const match = env.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : '';
  } catch { return ''; }
}

// ═══════════════════════════════════════════
// PASO 1: SCRAPEAR NOTICIAS
// ═══════════════════════════════════════════
async function scrapeCompetitorPosts() {
  const APIFY_TOKEN = readEnvKey('APIFY_TOKEN');
  if (!APIFY_TOKEN) {
    console.log('  ⚠ APIFY_TOKEN no encontrada en .env, saltando scraping de competidores');
    return [];
  }

  // Rotate: pick 3 random accounts each day
  const allAccounts = [
    // México finanzas
    'finanzas.conproposito', 'pequenocerdocapitalista', 'invierteconpepe_',
    'mispropiasfinanzasmex', 'soymacariva', 'el.inversor.eficiente',
    'ahorrobonito', 'finanzasquevalen', 'morisdieck',
    // Internacional (aspiracional)
    'thewealthdad', 'wealth.ceo', 'dtechincome_',
    // Economía/noticias México
    'bloomberglinea', 'elfinanciero_mx', 'expansion_mx',
  ];
  const today = new Date().getDate();
  const shuffled = allAccounts.sort(() => Math.sin(today * allAccounts.indexOf(allAccounts[0])) - 0.5);
  const selectedAccounts = shuffled.slice(0, 3);
  console.log(`  📋 Cuentas seleccionadas hoy: ${selectedAccounts.map(a => '@'+a).join(', ')}`);

  // Check cache to avoid burning Apify credits on multiple runs per day
  const cacheFile = join(dirname(new URL(import.meta.url).pathname), '..', 'content', 'apify-cache.json');
  try {
    if (existsSync(cacheFile)) {
      const cached = JSON.parse(readFileSync(cacheFile, 'utf-8'));
      const todayStr = new Date().toISOString().slice(0, 10);
      if (cached.date === todayStr && Array.isArray(cached.results) && cached.results.length > 0) {
        console.log(`  ✓ Usando cache de Apify (${cached.results.length} posts del ${cached.date})`);
        return cached.results;
      }
    }
  } catch (e) {
    console.log('  ⚠ Error leyendo cache, continuando con Apify:', e.message);
  }

  try {
    // 1. Start the Instagram scraper run
    const startRes = await fetch('https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: selectedAccounts,
        resultsLimit: 10,
      }),
    });

    if (!startRes.ok) {
      console.log(`  ⚠ Apify start failed: ${startRes.status} ${startRes.statusText}`);
      return [];
    }

    const runData = await startRes.json();
    const runId = runData.data?.id;
    const defaultDatasetId = runData.data?.defaultDatasetId;
    if (!runId) {
      console.log('  ⚠ Apify no devolvió run ID');
      return [];
    }

    console.log(`  ⏳ Apify run iniciado (${runId}), esperando resultados...`);

    // 2. Poll for completion (every 10s, max 120s)
    const runUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`;
    const maxWait = 120_000;
    const pollInterval = 10_000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));
      const statusRes = await fetch(runUrl);
      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();
      const status = statusData.data?.status;

      if (status === 'SUCCEEDED') {
        console.log('  ✓ Apify run completado');
        break;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        console.log(`  ⚠ Apify run terminó con status: ${status}`);
        return [];
      }
      // Still running — keep polling
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      process.stdout.write(`\r  ⏳ Esperando Apify... ${elapsed}s`);
    }

    // Check if we timed out
    if (Date.now() - startTime >= maxWait) {
      console.log('\n  ⚠ Apify timeout (120s), continuando sin datos de competidores');
      return [];
    }

    // 3. Fetch results from dataset
    const datasetId = defaultDatasetId || runData.data?.defaultDatasetId;
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
    if (!itemsRes.ok) {
      console.log(`  ⚠ Error obteniendo resultados del dataset: ${itemsRes.status}`);
      return [];
    }

    const posts = await itemsRes.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      console.log('  ⚠ Apify no devolvió posts');
      return [];
    }

    // 4. Sort by engagement, take top 5
    const sorted = posts
      .map(p => ({
        caption: p.caption || '',
        type: p.type || 'unknown',
        likesCount: p.likesCount || 0,
        commentsCount: p.commentsCount || 0,
        ownerUsername: p.ownerUsername || '',
        engagement: (p.likesCount || 0) + (p.commentsCount || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    // 5. Filter out vague/useless competitor posts
    const filtered = sorted.filter(p => {
      const cap = (p.caption || '').toLowerCase();
      // Remove hashtags, follow CTAs, @mentions
      const cleanCap = cap.replace(/#\w+/g, '').replace(/follow|sígueme|@\w+|🤔|👉/gi, '').trim();
      // Must have at least 80 chars of real financial content
      if (cleanCap.length < 80) return false;
      // Must contain at least one finance-related keyword
      const hasFinanceContent = /dinero|peso|dólar|inflación|tasa|banco|crédito|deuda|ahorro|inversión|cetes|afore|sueldo|salario|finanz|economía|presupuesto|negocio|empresa|factur/i.test(cleanCap);
      return hasFinanceContent;
    });

    // 6. Map to the format expected by the rest of the pipeline
    const results = filtered.map(p => ({
      titulo: p.caption.slice(0, 100) || 'Post sin caption',
      hook: p.caption.slice(0, 100) || 'Post sin caption',
      cuenta: `@${p.ownerUsername}`,
      interacciones: `${p.likesCount} likes, ${p.commentsCount} comments`,
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
      dato: '',
      fuente: 'Instagram',
      relevancia: 'Contenido viral de competidor para inspiración',
      viralidad: Math.min(10, Math.round(p.engagement / 500) + 5),
      source_type: 'competitor',
    }));

    // 6. Write cache so subsequent runs today skip the Apify call
    try {
      const cacheDir = dirname(cacheFile);
      if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
      writeFileSync(cacheFile, JSON.stringify({ date: new Date().toISOString().slice(0, 10), results }, null, 2));
      console.log(`  💾 Cache guardado en ${cacheFile}`);
    } catch (e) {
      console.log('  ⚠ Error guardando cache:', e.message);
    }

    return results;

  } catch (e) {
    console.log(`  ⚠ Error en scraping de competidores: ${e.message}`);
    return [];
  }
}

/**
 * Extract a financial data point from a headline using regex/string matching.
 * Returns the dato string if found, or empty string.
 */
function extractDato(title) {
  // Match percentages like "4.63%", "14.5%", "-2.3%"
  const pctMatch = title.match(/[\-+]?\d+[\.,]?\d*\s*%/);
  if (pctMatch) return pctMatch[0].trim();

  // Match currency amounts like "$1,200", "US$20.5", "$15,000 MDP", "$20 mil millones"
  const moneyMatch = title.match(/(?:US)?\$[\d,\.]+(?:\s*(?:mil\s*)?(?:millones|mdp|mdd|pesos|dólares|MDP|MDD))?/i);
  if (moneyMatch) return moneyMatch[0].trim();

  // Match exchange rate patterns like "20.15 pesos", "USD/MXN 20.3"
  const fxMatch = title.match(/(?:USD\/?MXN|tipo de cambio|dólar)[:\s]*[\d\.]+/i) ||
                  title.match(/\d+\.\d+\s*pesos(?:\s+por\s+dólar)?/i);
  if (fxMatch) return fxMatch[0].trim();

  // Match basis points, rates like "9.5 puntos"
  const rateMatch = title.match(/\d+[\.,]\d+\s*(?:puntos|pb|basis)/i);
  if (rateMatch) return rateMatch[0].trim();

  // Match plain large numbers like "1.2 millones", "350,000 empleos"
  const numMatch = title.match(/\d[\d,\.]*\s*(?:mil\s*)?(?:millones|empleos|hogares|personas|trabajadores|empresas)/i);
  if (numMatch) return numMatch[0].trim();

  return '';
}


/**
 * Like fetchRSSNews but returns objects with {title, source} instead of plain strings.
 */
async function fetchRSSNewsWithSource() {
  const feeds = [
    // Google News — temas variados de finanzas México
    { url: 'https://news.google.com/rss/search?q=finanzas+personales+Mexico&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=inflacion+Mexico+precios&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=CETES+Banxico+tasa+interes&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=economia+Mexico+empleo+salario&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=tarjeta+credito+debito+Mexico+bancos&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=hipoteca+vivienda+casa+Mexico+Infonavit&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=SAT+impuestos+declaracion+Mexico&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=empresas+mexicanas+BMV+bolsa&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=fintech+Mexico+Nu+Mercadopago+Rappi&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=gasolina+luz+servicios+precio+Mexico&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    // Medios directos — RSS feeds de finanzas México
    { url: 'https://www.elfinanciero.com.mx/rss/finanzas-personales/', source: 'El Financiero' },
    { url: 'https://www.eleconomista.com.mx/rss/finanzas-personales', source: 'El Economista' },
    { url: 'https://expansion.mx/rss/dinero', source: 'Expansión' },
    { url: 'https://www.forbes.com.mx/feed/', source: 'Forbes México' },
  ];

  const headlines = [];
  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(5000) });
      const xml = await res.text();
      const source = feed.source;
      const titles = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m => m[1]);
      const altTitles = [...xml.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]).filter(t => t.length > 20);
      const all = [...titles.slice(0, 5), ...altTitles.slice(0, 5)];
      headlines.push(...all.map(t => ({ title: t, source })));
    } catch {}
  }
  // Filter: keep only headlines that mention financial topics
  const financeKeywords = /dinero|peso|dólar|inflación|tasa|banco|crédito|deuda|ahorro|inversión|cetes|afore|pensión|sueldo|salario|empleo|imss|fintech|nu méxico|mercado pago|hey banco|gbm|retiro|hipoteca|tarjeta|presupuesto|gasolina|canasta|super|precio|costo|impuesto|sat|factura|finanzas|economía|recesión|pib/i;
  const filtered = headlines.filter(h => financeKeywords.test(h.title));
  return (filtered.length > 0 ? filtered : headlines).slice(0, 15);
}

async function scrapeNews() {
  console.log('\n📰 PASO 1: Buscando noticias financieras de México...');

  // First: try to get REAL headlines from RSS feeds
  console.log('  📡 Buscando noticias reales via RSS...');
  const realHeadlines = await fetchRSSNewsWithSource();
  if (realHeadlines.length > 0) {
    console.log(`  ✓ ${realHeadlines.length} titulares reales encontrados`);
    realHeadlines.slice(0, 5).forEach((h, i) => console.log(`    ${i+1}. ${h.title}`));
  } else {
    console.log('  ⚠ No se pudieron obtener titulares de RSS');
  }

  // Reddit — múltiples subreddits de finanzas México/LATAM
  const subreddits = [
    'MexicoFinanciero',
    'mexico',
    'personalfinance',
    'economia',
  ];
  console.log('  📡 Buscando en Reddit...');
  for (const sub of subreddits) {
    try {
      const redditRes = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`, {
        headers: { 'User-Agent': 'finanzas-pop-engine/1.0' },
        signal: AbortSignal.timeout(5000)
      });
      const redditData = await redditRes.json();
      const redditPosts = redditData.data.children
        .map(c => c.data)
        .filter(p => p.score > 5)
        .map(p => ({ title: p.title, source: `r/${sub}`, score: p.score }));
      realHeadlines.push(...redditPosts.slice(0, 3));
    } catch {}
  }
  const redditCount = realHeadlines.filter(h => h.source?.startsWith('r/')).length;
  console.log(`  ✓ ${redditCount} posts de Reddit encontrados`);

  // Twitter/X trending — búsqueda de temas financieros trending en México via Google News
  console.log('  📡 Buscando trending...');
  try {
    const trendingQueries = [
      'trending+finanzas+Mexico+hoy',
      'viral+dinero+Mexico',
      'polémica+económica+Mexico',
    ];
    const trendQ = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    const tRes = await fetch(`https://news.google.com/rss/search?q=${trendQ}&hl=es-419&gl=MX&ceid=MX:es-419&when=1d`, {
      signal: AbortSignal.timeout(5000)
    });
    const tXml = await tRes.text();
    const tTitles = [...tXml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m => m[1]).slice(1, 4);
    realHeadlines.push(...tTitles.map(t => ({ title: t, source: 'Trending' })));
    console.log(`  ✓ ${tTitles.length} temas trending`);
  } catch {
    console.log('  ⚠ Trending no disponible');
  }

  // If RSS failed entirely, use fallback
  if (realHeadlines.length === 0) {
    console.log('  ✗ RSS falló completamente, usando fallback');
    const fallback = getFallbackNews();
    fallback.forEach(n => n.source_type = 'news');
    console.log(`  ✓ ${fallback.length} noticias (fallback)`);
    fallback.forEach((n, i) => console.log(`    ${i+1}. [${n.viralidad}/10] ${n.titulo}`));
    return addCompetitorContent(fallback);
  }

  // Build news array directly from RSS titles — no Gemini needed for extraction
  let news = realHeadlines.map(h => ({
    titulo: h.title,
    dato: extractDato(h.title),
    fuente: h.source,
    relevancia: '',
    viralidad: 5, // default, Gemini will score later
  }));

  // Prefer headlines that have a concrete data point
  const withDato = news.filter(n => n.dato);
  const withoutDato = news.filter(n => !n.dato);
  news = [...withDato, ...withoutDato].slice(0, 10);

  console.log(`  ✓ ${news.length} noticias extraídas de RSS (${withDato.length} con dato duro)`);

  // Use Gemini ONLY to score viralidad and add relevancia — much simpler task
  try {
    console.log('  🧠 Pidiendo a Gemini scoring de viralidad...');
    const scoringPrompt = `Para cada noticia financiera de México, asigna un score de viralidad (1-10, qué tan probable que alguien lo mande por DM) y una frase corta de relevancia (por qué le importa a un mexicano promedio).

CRITERIO CLAVE para el scoring:
- Temas ASPIRACIONALES (invertir, CETES, fintechs, hacer crecer dinero, comprar casa, retiro, empresas mexicanas) → viralidad MÁS ALTA (7-10)
- Temas de DOLOR puro (inflación, precios subiendo, jitomate, limón, canasta básica) → viralidad MÁS BAJA (3-5), a menos que el tema conecte claramente con una solución de inversión
- Nuestro target quiere CRECER su dinero, no quejarse del precio del jitomate

Noticias:
${news.map((n, i) => `${i+1}. ${n.titulo}${n.dato ? ' — Dato: ' + n.dato : ''}`).join('\n')}

Responde SOLO con un JSON array, un objeto por noticia en el MISMO ORDEN:
[{"viralidad": 8, "relevancia": "frase corta"}, ...]`;

    const scoringResponse = await callGemini(scoringPrompt);
    let scores;
    try {
      scores = JSON.parse(scoringResponse);
    } catch {
      const match = scoringResponse.match(/\[[\s\S]*\]/);
      scores = match ? JSON.parse(match[0]) : null;
    }

    if (scores && Array.isArray(scores)) {
      scores.forEach((s, i) => {
        if (i < news.length) {
          news[i].viralidad = s.viralidad || 5;
          news[i].relevancia = s.relevancia || '';
        }
      });
      console.log('  ✓ Scoring de Gemini aplicado');
    } else {
      console.log('  ⚠ Scoring de Gemini falló, usando defaults');
    }
  } catch (e) {
    console.log(`  ⚠ Error en scoring de Gemini: ${e.message}, usando defaults`);
  }

  // Tag news items with source_type
  news.forEach(n => n.source_type = 'news');
  console.log(`  ✓ ${news.length} noticias listas`);
  news.forEach((n, i) => console.log(`    ${i+1}. [${n.viralidad}/10] ${n.titulo}`));

  return addCompetitorContent(news);
}

/**
 * Append competitor posts (via Apify) to the news array.
 */
async function addCompetitorContent(news) {
  // ── Second source: real Instagram competitor scraping via Apify ──
  console.log('\n📊 Scrapeando posts reales de competidores via Apify...');
  const competitors = await scrapeCompetitorPosts();
  if (competitors.length > 0) {
    console.log(`  ✓ Encontrados ${competitors.length} posts reales de competidores`);
    competitors.forEach((c, i) => console.log(`    ${i+1}. [${c.cuenta}] ${c.hook} (❤ ${c.likesCount} 💬 ${c.commentsCount})`));
  } else {
    console.log('  ⚠ No se pudieron obtener posts de competidores, continuando solo con noticias');
  }
  return [...news, ...competitors];
}

// ═══════════════════════════════════════════
// AUTO-UPDATE LEARNINGS FROM COMPETITOR DATA
// ═══════════════════════════════════════════
async function updateLearningsFromCompetitors(competitorPosts) {
  if (!competitorPosts || competitorPosts.length === 0) return;

  console.log('\n🧠 Actualizando learnings con datos de competidores...');

  try {
    // Read current learnings
    let currentLearnings = '';
    try {
      currentLearnings = readFileSync(LEARNINGS_PATH, 'utf-8');
    } catch {
      console.log('  ⚠ No se pudo leer learnings.md, saltando actualización');
      return;
    }

    const competitorSummary = competitorPosts
      .map(p => `- [${p.cuenta}] "${p.hook}" (${p.interacciones})`)
      .join('\n');

    const prompt = `Eres un analista de contenido de Instagram de finanzas en español (LATAM).

Estos son los posts recientes de competidores con mejor engagement:
${competitorSummary}

Y estos son los LEARNINGS actuales de nuestra cuenta:
${currentLearnings.slice(0, 3000)}

TAREA: Basándote en los posts de competidores y su engagement, identifica insights NUEVOS que NO estén ya en los learnings. Busca:
- ¿Qué temas generaron más interacción?
- ¿Qué tipo de hooks usan los top performers?
- ¿Hay temas trending que no hemos cubierto?

Responde SOLO con los insights nuevos, uno por línea con "- " al inicio. Si no hay nada genuinamente nuevo, responde exactamente "NADA_NUEVO". Máximo 5 insights. Sé conciso.`;

    const response = await callGemini(prompt);

    if (!response || response.trim() === 'NADA_NUEVO') {
      console.log('  ✓ No hay insights nuevos — learnings al día');
      return;
    }

    // Append new insights to learnings.md
    const section = `\n\n## Auto-detected patterns (${TODAY})\n${response.trim()}\n`;
    appendFileSync(LEARNINGS_PATH, section);
    console.log(`  ✓ Nuevos insights agregados a learnings.md`);
  } catch (e) {
    console.log(`  ⚠ Error actualizando learnings: ${e.message} — continuando sin actualizar`);
  }
}

function getFallbackNews() {
  // Evergreen topics — temas que siempre son relevantes para finanzas México
  const all = [
    { titulo: "La inflación en México sigue subiendo y golpea los alimentos", dato: "4.63% general, 8.34% frutas y verduras", fuente: "INEGI, marzo 2026", relevancia: "Tu canasta del super cuesta más cada mes y tu sueldo no sube", viralidad: 8 },
    { titulo: "Solo el 8.8% de los mexicanos invierte en algo", dato: "91.2% no invierte ni en CETES", fuente: "ENIF 2024, INEGI", relevancia: "La mayoría deja su dinero perder valor sin saberlo", viralidad: 9 },
    { titulo: "El mexicano promedio gasta el 35% de su sueldo en comida", dato: "35% del ingreso va a alimentos", fuente: "ENIGH, INEGI", relevancia: "Más de un tercio de tu quincena se va en comer", viralidad: 7 },
    { titulo: "7 de cada 10 mexicanos con tarjeta de crédito pagan solo el mínimo", dato: "70% paga mínimo, acumula intereses de 40-60% anual", fuente: "CONDUSEF 2025", relevancia: "Pagar el mínimo multiplica tu deuda sin que te des cuenta", viralidad: 8 },
    { titulo: "El aguinaldo promedio en México se gasta en menos de 2 semanas", dato: "62% lo gasta en deudas y regalos", fuente: "CONDUSEF", relevancia: "El dinero extra desaparece sin plan", viralidad: 7 },
    { titulo: "México tiene más de 70 millones de tarjetas de débito pero solo 35 millones de crédito", dato: "Débito 2:1 vs crédito", fuente: "CNBV", relevancia: "La mayoría no usa crédito, ¿es bueno o malo?", viralidad: 6 },
    { titulo: "El costo de vivir solo en CDMX supera los $15,000 al mes", dato: "$15,000+ renta, servicios, comida", fuente: "Inmuebles24, INEGI", relevancia: "Independizarte en la ciudad más cara de México", viralidad: 8 },
    { titulo: "Las tandas mueven $30,000 millones de pesos al año en México", dato: "$30,000 MDP en economía informal de ahorro", fuente: "El Financiero", relevancia: "México ahorra, pero fuera del sistema financiero", viralidad: 8 },
    { titulo: "El SAT devolvió más de $40,000 MDP en declaraciones anuales", dato: "$40,000 MDP devueltos", fuente: "SAT, 2025", relevancia: "Si no declaras, estás dejando dinero en la mesa", viralidad: 7 },
    { titulo: "El 68% de mexicanos no tiene fondo de emergencia", dato: "Solo 32% podría cubrir 3 meses sin ingreso", fuente: "ENIF, INEGI", relevancia: "Un imprevisto te puede endeudar de por vida", viralidad: 8 },
    { titulo: "Comprar casa en CDMX requiere ahorrar 10 años de sueldo promedio", dato: "Precio promedio: $3.2 MDP, sueldo promedio: $15K/mes", fuente: "Sociedad Hipotecaria Federal", relevancia: "El sueño de la casa propia cada vez más lejos", viralidad: 9 },
    { titulo: "Netflix, Spotify y apps: el mexicano gasta $1,200 al mes en suscripciones", dato: "$1,200/mes promedio en suscripciones digitales", fuente: "Deloitte México", relevancia: "Gastos hormiga que suman $14,400 al año", viralidad: 7 },
    { titulo: "El peso mexicano es la moneda más operada de Latinoamérica", dato: "MXN es la 16ª moneda más operada del mundo", fuente: "BIS, Banco de Pagos Internacionales", relevancia: "Tu moneda es más importante de lo que crees", viralidad: 6 },
    { titulo: "América Móvil de Carlos Slim vale más que el PIB de varios países", dato: "Capitalización: $60,000 MDD", fuente: "BMV", relevancia: "Una empresa mexicana que compite a nivel global", viralidad: 8 },
    { titulo: "El interés compuesto: $1,000 al mes durante 20 años a 10% = $760,000", dato: "Invertiste $240K, ganaste $520K extra", fuente: "Cálculo financiero estándar", relevancia: "El tiempo es tu mejor aliado financiero", viralidad: 9 },
  ];
  // Shuffle and return 3 random
  return all.sort(() => Math.random() - 0.5).slice(0, 5);
}

// ═══════════════════════════════════════════
// PASO 2: ELEGIR TEMA (filtro MRV)
// ═══════════════════════════════════════════
// Load learnings once, used by steps 2 and 3
const LEARNINGS_PATH = '/Users/martin/Projects/SanchoCMO/brand/finanzas-pop/content/learnings.md';
let learningsContent = '';
try {
  learningsContent = readFileSync(LEARNINGS_PATH, 'utf-8');
} catch {}

async function selectTopic(news) {
  console.log('\n🎯 PASO 2: Seleccionando tema (filtro MRV + learnings)...');

  // Read learnings to know what topics to prioritize
  if (learningsContent) {
    console.log('  📖 Leyendo learnings.md...');
    // Extract priority topics from learnings
    const topicSection = learningsContent.match(/### Temas con mayor potencial[\s\S]*?(?=###|$)/);
    if (topicSection) {
      console.log('  ✓ Learnings cargados — priorizando temas de alto potencial');
    }
  }

  // Filter out topics already used TODAY (exact title match)
  let todaysHooks = [];
  try {
    const log = readFileSync(CONTENT_LOG, 'utf-8');
    todaysHooks = log.split('\n')
      .filter(l => l.includes(TODAY))
      .map(l => l.toLowerCase());
  } catch {}

  if (todaysHooks.length > 0) {
    const before = news.length;
    news = news.filter(n => {
      const titulo = (n.titulo || '').toLowerCase().slice(0, 30);
      return !todaysHooks.some(h => h.includes(titulo));
    });
    const filtered = before - news.length;
    if (filtered > 0) console.log(`  🔄 ${filtered} temas descartados (ya usados hoy)`);
  }

  // Theme-level diversity: don't repeat the same CATEGORY in one day
  const THEME_TAGS = {
    cetes:      /cetes|cetesdirecto|tasa.*(inter[eé]s|referencia)|banxico.*(tasa|recort)/i,
    inflacion:  /inflaci[oó]n|precios?.*(sub|baj|dispar)|canasta|jitomate|lim[oó]n|super.*caro/i,
    afore:      /afore|pensi[oó]n|retiro|consar/i,
    tarjetas:   /tarjeta.*(cr[eé]dito|d[eé]bito)|cashback|anualidad/i,
    vivienda:   /hipoteca|vivienda|casa|infonavit|cr[eé]dito.*hipotecar/i,
    inversiones:/invertir|inversi[oó]n|gbm|nu m[eé]xico|hey banco|rendimiento|portafolio/i,
    impuestos:  /sat|impuesto|isr|factura|declaraci[oó]n/i,
    ahorro:     /ahorr[ao]|presupuest|gasto hormiga|semana santa.*dinero|vacacion.*finanz/i,
    empleo:     /sueldo|salario|empleo|desempleo|trabajo/i,
    onlyfans:   /onlyfans/i,
    noruega:    /noruega|petr[oó]leo.*fondo/i,
  };

  function getTheme(text) {
    const t = (text || '').toLowerCase();
    for (const [theme, rx] of Object.entries(THEME_TAGS)) {
      if (rx.test(t)) return theme;
    }
    return 'otro';
  }

  // Tag themes from last 3 days (not just today) to avoid "always CETES" syndrome
  let recentLines = [];
  try {
    const log = readFileSync(CONTENT_LOG, 'utf-8');
    const d0 = TODAY;
    const d1 = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const d2 = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    recentLines = log.split('\n').filter(l => l.includes(d0) || l.includes(d1) || l.includes(d2)).map(l => l.toLowerCase());
  } catch {}
  const recentThemes = new Set(recentLines.map(h => getTheme(h)));
  recentThemes.delete('otro'); // "otro" is always allowed
  // Today's themes block completely, recent (yesterday/before) themes only block if >1 occurrence
  const todaysThemes = new Set(todaysHooks.map(h => getTheme(h)));
  todaysThemes.delete('otro');
  const recentThemeCounts = {};
  for (const h of recentLines) {
    const t = getTheme(h);
    if (t !== 'otro') recentThemeCounts[t] = (recentThemeCounts[t] || 0) + 1;
  }
  // Block themes used today OR used 2+ times in last 3 days
  const blockedThemes = new Set([...todaysThemes]);
  for (const [theme, count] of Object.entries(recentThemeCounts)) {
    if (count >= 2) blockedThemes.add(theme);
  }

  if (blockedThemes.size > 0) {
    const beforeTheme = news.length;
    news = news.filter(n => {
      const theme = getTheme(n.titulo + ' ' + (n.dato || '') + ' ' + (n.relevancia || ''));
      return !blockedThemes.has(theme);
    });
    const themeFiltered = beforeTheme - news.length;
    if (themeFiltered > 0) {
      console.log(`  🏷️  ${themeFiltered} temas descartados por categoría repetida en últimos 3 días (${[...blockedThemes].join(', ')})`);
    }
  }

  if (news.length === 0) {
    console.log('  ⚠ Todos los temas ya fueron usados hoy');
    return { ...getFallbackNews()[Math.floor(Math.random() * 3)], format: chooseFormat() };
  }

  // Use Gemini to pick the best topic considering learnings
  const topicSelectionPrompt = `Eres un editor de contenido de Instagram de finanzas para México (@finanzas.pop).

Tengo estas noticias/temas de hoy:
${news.map((n, i) => `${i+1}. [viralidad: ${n.viralidad}/10] ${n.titulo} — Dato: ${n.dato} — ${n.relevancia}`).join('\n')}

Y estos son los LEARNINGS de lo que funciona mejor con nuestra audiencia:
${learningsContent ? learningsContent.slice(0, 2000) : 'No hay learnings aún.'}

REGLAS CLAVE PARA ELEGIR (basadas en análisis real de competidores con millones de seguidores):

1. MÉXICO-FIRST: El contenido debe hablar de México directamente. Empresas mexicanas (FEMSA, Bimbo, América Móvil), instrumentos mexicanos (CETES, Afore, SOFIPO), fintechs mexicanas (Nu, GBM+, Hey Banco), regulación mexicana (SAT, CNBV). NO copiar contenido gringo. Si se menciona USA es solo como contexto ("la Fed subió tasas → así te afecta en México").

2. ASPIRACIONAL > DOLOR: Ratio 3:1. El post #1 de @finanzas.conproposito (1.6M seguidores) es "Inviertan para su retiro" con 265K likes. El contenido de deudas genera 160x MENOS engagement. Nuestro target quiere INVERTIR y CRECER, no llorar por el jitomate.

3. ELIGE EL TEMA MÁS ACTUAL Y SORPRENDENTE — no el más "seguro":
   - Prioriza NOTICIAS FRESCAS sobre temas que están pasando AHORA (hoy, esta semana)
   - Prioriza datos que SORPRENDAN: records, cambios inesperados, comparaciones que nadie esperaba
   - NUNCA elijas Afore/CETES/tanda como tema principal — ya los hemos usado demasiado
   - Busca ángulos de: empresas mexicanas (BMV, FEMSA, Bimbo), SAT/impuestos, fintechs, precios que suben, vivienda, empleo
   - Las historias de otros países funcionan si conectan con México ("Noruega y su petróleo")
   - Los temas de actualidad tipo "gasolina se disparó" o "pagos digitales rompen récord" son mejores que temas evergreen

4. TEMAS QUE NO FUNCIONAN:
   - Inflación/precios del super sin solución (jitomate, limón = bajo engagement)
   - Contenido genérico global sin conexión México
   - Noticias macro abstractas (PIB, T-MEC) sin impacto personal
   - Solo si el dolor conecta con una SOLUCIÓN aspiracional: "la inflación te come → pero Nu paga 14.5%"

TAREA: Elige EL MEJOR tema para publicar hoy. Considera:
1. Viralidad (¿lo mandarían por DM?)
2. Que sea ASPIRACIONAL (inversión, crecimiento, oportunidades) — no puro dolor/miedo
3. Alineación con los temas de alto potencial del learnings
4. Que tenga un dato CONCRETO para el hook
5. Que conecte con la vida real del mexicano promedio

Responde SOLO con el número del tema elegido (1, 2, 3...) y en la siguiente línea UNA frase explicando por qué.`;

  let selectedTopic;

  try {
    const response = await callGemini(topicSelectionPrompt);
    const selectedNum = parseInt(response.match(/\d+/)?.[0]) - 1;
    if (selectedNum >= 0 && selectedNum < news.length) {
      selectedTopic = news[selectedNum];
      const reason = response.split('\n').find(l => l.length > 10) || '';
      console.log(`  ✓ Tema elegido: "${selectedTopic.titulo}" [viralidad: ${selectedTopic.viralidad}/10]`);
      console.log(`  💡 Razón: ${reason.slice(0, 100)}`);
    }
  } catch {}

  if (!selectedTopic) {
    // Fallback: sort by viralidad and avoid duplicates
    const sorted = [...news].sort((a, b) => b.viralidad - a.viralidad);

    let recentTopics = [];
    try {
      const log = readFileSync(CONTENT_LOG, 'utf-8');
      recentTopics = log.split('\n').slice(-10).map(l => l.toLowerCase());
    } catch {}

    for (const topic of sorted) {
      const isDuplicate = recentTopics.some(l =>
        l.includes(topic.dato.toLowerCase().slice(0, 10))
      );
      if (!isDuplicate) {
        selectedTopic = topic;
        console.log(`  ✓ Tema elegido (fallback): "${topic.titulo}" [viralidad: ${topic.viralidad}/10]`);
        break;
      }
    }

    if (!selectedTopic) selectedTopic = sorted[0];
  }

  // Choose format based on recent content history
  const format = process.env.FORCE_FORMAT || chooseFormat();
  console.log(`  🎨 Formato elegido: ${format}`);

  // Choose visual template based on content type
  const { template, contentType } = chooseTemplate(selectedTopic);
  return { ...selectedTopic, format, template, contentType };
}

/**
 * Choose content format based on recent publishing history.
 * Mix target (research-based, Social Insider 2026):
 *   40% Reel, 40% Carousel, 20% Quote
 * Carousels get 1.7x more views for <50K accounts.
 * Quotes minimum 15-20% for variety.
 * If last 2 posts were same format → force different.
 */
function chooseFormat() {
  let recentFormats = [];
  try {
    const log = readFileSync(CONTENT_LOG, 'utf-8');
    const lines = log.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.toLowerCase().includes('fecha'));
    recentFormats = lines.slice(-5).map(l => {
      const cols = l.split('|').map(c => c.trim());
      // Format is typically in column 3 (index 3 after leading empty from split)
      const fmt = (cols[3] || '').toLowerCase();
      if (fmt.includes('carousel') || fmt.includes('carrusel')) return 'carousel';
      if (fmt.includes('quote') || fmt.includes('cita')) return 'quote';
      return 'reel';
    });
  } catch {}

  console.log(`  📋 Últimos formatos: [${recentFormats.join(', ') || 'sin historial'}]`);

  // If last 2 were same format, force different
  const lastTwo = recentFormats.slice(-2);
  if (lastTwo.length >= 2 && lastTwo[0] === lastTwo[1]) {
    const formats = ['reel', 'carousel', 'quote'].filter(f => f !== lastTwo[0]);
    const pick = formats[Math.floor(Math.random() * formats.length)];
    console.log(`  🔄 Últimos 2 fueron ${lastTwo[0]} → forzando variedad: ${pick}`);
    return pick;
  }

  // Mix target (research-based): 40% reel, 40% carousel, 20% quote
  const r = Math.random();
  if (r < 0.40) return 'reel';
  if (r < 0.80) return 'carousel';
  return 'quote';
}

// ═══════════════════════════════════════════
// PASO 3: GENERAR HOOK + SCRIPT
// ═══════════════════════════════════════════
async function generateScript(topic) {
  console.log('\n✍️  PASO 3: Generando hook y script...');

  // Extract hook patterns and anti-patterns from learnings
  let hookPatterns = '';
  let antiPatterns = '';
  if (learningsContent) {
    const hooksSection = learningsContent.match(/### Hooks que funcionan[\s\S]*?(?=###|$)/);
    const noSection = learningsContent.match(/### Lo que NO hacer[\s\S]*?(?=##[^#]|$)/);
    hookPatterns = hooksSection ? hooksSection[0].slice(0, 800) : '';
    antiPatterns = noSection ? noSection[0].slice(0, 800) : '';
    console.log('  📖 Usando learnings para hooks y anti-patrones');
  }

  const styleBlock = `Eres un creador de contenido financiero para Instagram. Tu cuenta se llama @finanzas.pop.

Tu estilo (IMPORTANTÍSIMO):
- Directo, con datos, sin humo, accesible
- Como un amigo inteligente que te explica las cosas
- SIEMPRE conecta el dato con la VIDA REAL del mexicano promedio
- No solo informes — haz que la persona SIENTA cómo le afecta
- Ejemplo: NO "La inflación es 4.65%". SÍ "Lo que costaba $1,000 en el super ahora cuesta $1,046. Tu sueldo sigue igual."
- TONO ASPIRACIONAL: habla a alguien que quiere CRECER su dinero, no a alguien que solo sufre
- MÉXICO-FIRST: usa ejemplos mexicanos (CETES, Nu, GBM+, Afore, FEMSA, Bimbo), NO ejemplos gringos
- Si mencionas otro país, es como ejemplo inspirador ("Noruega hizo esto con su petróleo, México podría...")
- NUNCA suenes como guru. Suena como alguien que está aprendiendo CONTIGO.`;

  const templateName = topic.template || 'daily-briefing';
  const templateGuide = {
    'daily-briefing': 'Formato "Daily Briefing": noticia con dato clave resaltado. Incluye una categoría (ej. "NOTICIAS"), un headline claro, y UN número impactante.',
    'bold-data': 'Formato "Bold Data": TODO gira alrededor de UN solo número/estadística impactante. El número es el protagonista. Contexto mínimo debajo.',
    'comparison-grid': 'Formato "Comparison Grid": genera datos comparativos claros (ej. rendimiento, riesgo, mínimo, plazo) entre 2-3 opciones. Incluye valores numéricos concretos.',
    'editorial-quote': 'Formato "Editorial Quote": una frase provocativa, tipo opinión fuerte. Debe generar debate. Incluye un "so what" de una línea debajo.',
    'step-by-step': 'Formato "Step-by-Step": genera 3-5 pasos numerados, claros y accionables. Cada paso es corto (máx 15 palabras).',
    'the-reveal': 'Formato "The Reveal": estructura MITO vs REALIDAD. Primero "Lo que crees" (el mito), luego "La realidad" (la verdad). Contraste claro.',
    'ranking-list': 'Formato "Ranking List": genera una lista rankeada de 3-5 items con nombre, detalle y métrica clave. El #1 debe sorprender.',
    'pop-context': 'Formato "Pop Context": conecta un tema trending/pop con finanzas. Hook ultra-bold, luego el análisis financiero como contexto.',
  };

  const topicBlock = `TEMA DE HOY:
- Título: ${topic.titulo}
- Dato clave: ${topic.dato}
- Fuente: ${topic.fuente}
- Relevancia: ${topic.relevancia}

TEMPLATE VISUAL SELECCIONADO: ${templateName}
${templateGuide[templateName] || ''}
Adapta el contenido al formato visual. El diseño se genera automáticamente — tú solo genera el contenido correcto para ese template.`;

  const learningsBlock = `${hookPatterns ? `HOOKS QUE FUNCIONAN CON NUESTRA AUDIENCIA (basado en datos reales):
${hookPatterns}` : ''}

${antiPatterns ? `LO QUE NUNCA HACER:
${antiPatterns}` : ''}`;

  const rulesBlock = `REGLAS:
- NUNCA uses: "libertad financiera", "ingreso pasivo", "mentalidad millonaria", "hazte rico"
- SIEMPRE incluye la fuente del dato
- ÁNGULO SIEMPRE DE INVERSIÓN/FINANZAS PERSONALES — NUNCA emprendimiento.

REGLAS DEL HOOK (CRÍTICO — el hook determina si el contenido funciona o no):
- El hook SIEMPRE debe tener un NÚMERO o DATO CONCRETO. Ej: "$4,877", "el 80%", "8.4 millones", "$0 de rendimiento"
- NUNCA hooks vagos o genéricos: NO "Cuida tus finanzas", NO "Piensa diferente sobre el dinero", NO "Las cuentas de finanzas te mienten"
- El hook debe hacer que alguien lo ENVÍE POR DM a un amigo — si no provocaría esa reacción, descártalo
- Máximo 8 palabras — debe caber en una portada sin cortarse
- Debe ser SORPRENDENTE o CONTRAINTUITIVO — algo que el lector NO esperaba
- Test mental: ¿Lo lees y dices "no mames, en serio"? Si no, es muy débil.

REGLAS DEL CONTENIDO (CRÍTICO — el contenido debe aportar valor real):
- Cada escena/slide debe enseñar algo CONCRETO que el lector no sabía
- NUNCA contenido genérico tipo "ahorra más", "diversifica", "piensa a largo plazo" — eso no aporta nada
- Incluye DATOS ESPECÍFICOS de México: cantidades en pesos, porcentajes reales, nombres de instituciones
- El contenido debe hacer que alguien GUARDE el post para después — si no vale guardarlo, no vale publicarlo

REGLAS LEGALES (OBLIGATORIAS — somos educación financiera, NO asesores de inversión):
- NUNCA des instrucciones directas de inversión: NO "compra CETES", NO "invierte en X", NO "mete tu dinero en..."
- NUNCA prometas rendimientos: NO "vas a ganar 10%", NO "rendimiento asegurado", NO "garantizado"
- NUNCA digas que algo es "sin riesgo" o "inversión segura"
- NUNCA des recomendaciones personalizadas: NO "si tienes $50,000, ponlos en X"
- SÍ puedes INFORMAR sobre instrumentos: "Los CETES son instrumentos de deuda del gobierno mexicano. Históricamente han rendido alrededor del 10% anual."
- SÍ puedes COMPARAR opciones sin recomendar: "Tu cuenta de débito rinde 0.01%. CETES históricamente rinde ~10%. La diferencia es tuya."
- SÍ puedes EMPODERAR: "Antes de invertir, considera tu tolerancia al riesgo y horizonte de tiempo"
- SÍ puedes compartir DATOS HISTÓRICOS: "Históricamente, los mercados han tendido a subir en el largo plazo"
- USA frases como: "existen opciones como...", "una alternativa es...", "puedes explorar...", "infórmate sobre..."
- NUNCA uses frases imperativas sobre dinero: reemplaza "mete tu dinero en CETES" → "CETES es una opción que puedes explorar"
- NUNCA compares dos instrumentos sugiriendo que uno es mejor que otro: NO "en vez de tanda, usa CETES", NO "en lugar del banco, prueba Nu". Eso es consejo de inversión disfrazado.
- SÍ puedes explicar cómo funciona CADA UNO por separado, con datos. Que el lector saque su propia conclusión.
- El caption SIEMPRE debe incluir al final: "Contenido educativo, no asesoría financiera."
`;

  let formatInstructions;
  if (topic.format === 'carousel') {
    formatInstructions = `GENERA un script para un CAROUSEL de Instagram (7 slides, imágenes estáticas).

ESTRUCTURA:
- Slide 1 (HOOK): Detiene el scroll. Dato impactante + "DESLIZA →". Máximo 20 palabras total.
- Slides 2-6 (CONTENIDO): Cada uno explica un punto. Cada slide tiene título (bold) + body. Máximo 20 palabras por slide.
- Slide 7 (CTA): "Sígueme para entender tu dinero cada día. @finanzas.pop. Guarda este post."

Responde en JSON estricto:
{
  "hook": "FRASE COMPLETA, máximo 8 palabras, que funcione sola sin contexto adicional — NUNCA la dejes inconclusa",
  "format": "carousel",
  "slides": [
    {"id": 1, "title": "hook impactante", "body": "DESLIZA →"},
    {"id": 2, "title": "título del punto", "body": "explicación corta"},
    {"id": 3, "title": "título del punto", "body": "explicación corta"},
    {"id": 4, "title": "título del punto", "body": "explicación corta"},
    {"id": 5, "title": "título del punto", "body": "explicación corta"},
    {"id": 6, "title": "título del punto", "body": "explicación corta"},
    {"id": 7, "title": "Sígueme @finanzas.pop", "body": "Guarda este post para consultarlo después."}
  ],
  "caption": "caption para Instagram: hook → explicación corta → dato con fuente → CTA (guarda/comparte) → 8 hashtags → SIEMPRE termina con: 📌 Contenido educativo, no asesoría financiera.",
  "source": "${topic.fuente}"
}`;
  } else if (topic.format === 'quote') {
    formatInstructions = `GENERA un script para una QUOTE de Instagram (1 sola imagen).

ESTRUCTURA:
- Una frase poderosa relacionada con el tema (máximo 20 palabras). No es cita de famoso — es un insight propio de @finanzas.pop. DEBE ser una frase COMPLETA que golpee emocionalmente: algo que el lector quiera mandar al grupo de WhatsApp porque le describe exactamente. NO trivia corporativa — verdad personal sobre su dinero.
- Una línea de contexto/dato que sustenta la frase (máximo 15 palabras).
- Atribución: "— @finanzas.pop"

Responde en JSON estricto:
{
  "hook": "la frase principal de la quote",
  "format": "quote",
  "quote_text": "la frase poderosa (máximo 25 palabras)",
  "quote_context": "línea de contexto con dato (máximo 15 palabras)",
  "quote_attribution": "— @finanzas.pop",
  "caption": "caption para Instagram: la frase → explicación → dato con fuente → CTA (guarda/comparte) → 8 hashtags → SIEMPRE termina con: 📌 Contenido educativo, no asesoría financiera.",
  "source": "${topic.fuente}"
}`;
  } else {
    formatInstructions = `GENERA un script para un Reel de Instagram de 20 segundos. Son EXACTAMENTE 5 escenas con texto en pantalla (NO voz).

ESTRUCTURA:
- Escena 1 (HOOK, 3.5s): Detiene el scroll. Dato impactante o pregunta que duela. Máximo 12 palabras.
- Escena 2 (CONTEXTO, 4s): Por qué pasó. Simple. Máximo 15 palabras.
- Escena 3 (IMPACTO PERSONAL, 4.5s): Cómo te afecta A TI. Conecta con la vida real. "Si ganas $15K al mes, esto significa que..." Máximo 15 palabras.
- Escena 4 (ACCIÓN, 4.5s): Qué puedes hacer HOY. Concreto. Máximo 15 palabras.
- Escena 5 (CTA, 3.5s): "Sígueme para entender tu dinero cada día. @finanzas.pop"

REGLAS ADICIONALES:
- Cada text_line máximo 8 palabras (es texto en pantalla, no párrafo)
- Cada escena lleva "video_keywords": 2-3 palabras EN INGLÉS para buscar un clip de video de fondo en Pexels. Debe ser RELEVANTE al contenido de esa escena. Ej: si hablas de ahorro → "piggy bank savings", si hablas de inflación → "grocery store prices", si hablas de inversión → "stock market trading screen".

Responde en JSON estricto:
{
  "hook": "texto completo del hook (escena 1)",
  "format": "reel",
  "scenes": [
    {"id": 1, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 3.5, "video_keywords": "relevant english keywords"},
    {"id": 2, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 4, "video_keywords": "relevant english keywords"},
    {"id": 3, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 4.5, "video_keywords": "relevant english keywords"},
    {"id": 4, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 4.5, "video_keywords": "relevant english keywords"},
    {"id": 5, "text_line1": "Sígueme para entender", "text_line2": "tu dinero cada día.", "text_line3": "@finanzas.pop", "duration": 3.5, "video_keywords": "smartphone social media"}
  ],
  "caption": "caption para Instagram: hook → explicación corta → dato con fuente → CTA (guarda/comparte) → 8 hashtags → SIEMPRE termina con: 📌 Contenido educativo, no asesoría financiera.",
  "source": "${topic.fuente}"
}`;
  }

  const prompt = `${styleBlock}

${topicBlock}

${learningsBlock}

${formatInstructions}

${rulesBlock}

Responde SOLO con el JSON.`;

  // Try up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`  Intento ${attempt}/3...`);
      let response;
      try {
        console.log('  🧠 Usando Claude Opus 4.6...');
        response = await callClaude(prompt, 'claude-opus-4-6');
      } catch (opusErr) {
        if (opusErr.message.includes('Overloaded') || opusErr.message.includes('529')) {
          console.log('  ⚠ Opus sobrecargado, usando Sonnet 4.6...');
          response = await callClaude(prompt, 'claude-sonnet-4-6');
        } else {
          throw opusErr;
        }
      }

      let script;
      // Clean response: remove markdown code blocks, trim
      let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      try {
        script = JSON.parse(cleaned);
      } catch {
        // Try to extract JSON object
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            script = JSON.parse(match[0]);
          } catch (e2) {
            console.log(`  ⚠ Intento ${attempt} falló (JSON inválido), reintentando...`);
            continue;
          }
        } else {
          console.log(`  ⚠ Intento ${attempt} falló (no JSON), reintentando...`);
          continue;
        }
      }

      // Validate script has required fields based on format
      // topic.format is authoritative — Claude may return "reel" even for "reel-video"
      const fmt = topic.format || script.format || 'reel';
      script.format = fmt;
      let valid = false;
      if (fmt === 'carousel' && script.slides && script.slides.length >= 5) {
        console.log(`  ✓ Hook: "${script.hook}"`);
        console.log(`  ✓ ${script.slides.length} slides generados (carousel)`);
        valid = true;
      } else if (fmt === 'quote' && script.quote_text) {
        console.log(`  ✓ Quote: "${script.quote_text}"`);
        valid = true;
      } else if (script.scenes && script.scenes.length >= 3) {
        console.log(`  ✓ Hook: "${script.hook}"`);
        console.log(`  ✓ ${script.scenes.length} escenas generadas (reel)`);
        valid = true;
      }
      if (valid) {
        script.template = topic.template || 'daily-briefing';
        return script;
      }
      console.log(`  ⚠ Script incompleto, reintentando...`);
    } catch (e) {
      console.log(`  ⚠ Error en intento ${attempt}: ${e.message}`);
    }
  }
  throw new Error('No se pudo generar el script después de 3 intentos');
}

// ═══════════════════════════════════════════
// PASO 4: CREAR CONTENIDO VISUAL
// ═══════════════════════════════════════════
async function createContent(script) {
  if (script.format === 'carousel') return createCarousel(script);
  if (script.format === 'quote') return createQuote(script);
  return createReelVideo(script); // todos los reels usan Remotion (animado)
}

// ── Pexels video search ─────────────────────────────────────────────────────

const PEXELS_KEY = process.env.PEXELS_API_KEY || readEnvKey('PEXELS_API_KEY');

/**
 * Search Pexels for portrait HD videos matching a query.
 * Returns an array of video URLs (one per result).
 */
async function searchPexelsVideos(query, count = 5, page = 1) {
  if (!PEXELS_KEY) {
    console.log('  ⚠ PEXELS_API_KEY no encontrada, sin videos de fondo');
    return [];
  }
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait&page=${page}`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.videos || []).map(v => {
      // Prefer HD portrait (1080x1920), fallback to any HD
      const files = v.video_files || [];
      const portrait = files.find(f => f.quality === 'hd' && f.height >= 1080);
      const fallback = files.find(f => f.quality === 'hd') || files[0];
      return (portrait || fallback)?.link || null;
    }).filter(Boolean);
  } catch (e) {
    console.log(`  ⚠ Pexels error: ${e.message}`);
    return [];
  }
}

/**
 * For each scene, pick a Pexels video based on keywords from the scene text.
 * Last scene (CTA) keeps solid background — no video.
 */
async function addVideoBackgrounds(scenes) {
  if (!PEXELS_KEY) return scenes;
  console.log('  🎥 Buscando videos de fondo en Pexels...');

  // Search Pexels PER SCENE using video_keywords from the script
  const results = [];
  for (let i = 0; i < scenes.length; i++) {
    if (i >= scenes.length - 1) { results.push(null); continue; } // last scene: no video
    let kw = scenes[i].video_keywords || '';
    if (!kw) { results.push(null); continue; }
    // Choose currency based on scene context:
    // - Everyday/savings topics → Mexican pesos (more relatable)
    // - Investment/growth/business → USD dollars (aspirational)
    if (/money|cash|bills|dinero|pesos/i.test(kw) && !/dollar|usd|mexico|mexican/i.test(kw)) {
      const sceneText = `${scenes[i].text_line1} ${scenes[i].text_line2} ${scenes[i].text_line3}`.toLowerCase();
      const isEveryday = /ahorro|quincena|super|gasto|presupuesto|tanda|emergencia|sueldo|renta/i.test(sceneText);
      const replacement = isEveryday ? 'mexican pesos money' : 'dollar bills USD';
      kw = kw.replace(/money|cash|bills|dinero|pesos/i, replacement);
    }
    const page = Math.floor(Math.random() * 3) + 1;
    const urls = await searchPexelsVideos(kw, 3, page);
    // Pick a random clip from results
    const pick = urls.length > 0 ? urls[Math.floor(Math.random() * urls.length)] : null;
    results.push(pick);
    if (pick) console.log(`    Escena ${i + 1}: "${kw}" ✓`);
    else console.log(`    Escena ${i + 1}: "${kw}" — sin resultados`);
  }

  const found = results.filter(Boolean).length;
  if (found === 0) {
    console.log('  ⚠ No se encontraron videos en Pexels');
    return scenes;
  }
  console.log(`  ✓ ${found} escenas con video de fondo`);

  return scenes.map((scene, i) => {
    if (!results[i]) return scene;
    return { ...scene, videoUrl: results[i] };
  });
}

async function createReelVideo(script) {
  console.log('\n🎬 PASO 4: Creando Reel...');

  const slug = script.hook.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const filename = `reel-${TODAY}-${slug}.mp4`;
  const outPath = join(OUTPUT_DIR, filename);

  // Convert scene durations from seconds to frames (24fps) — Claude returns seconds
  const FPS = 24;
  let scenes = script.scenes.map(s => ({
    ...s,
    duration: s.duration <= 20 ? Math.round(s.duration * FPS) : s.duration, // if <=20 assume seconds
  }));

  // Add Pexels video backgrounds
  scenes = await addVideoBackgrounds(scenes);

  // Pick a random background music track
  const MUSIC_DIR = join(ROOT, 'content', 'music');
  let musicUrl = undefined;
  try {
    const tracks = readdirSync(MUSIC_DIR).filter(f => f.endsWith('.mp3'));
    if (tracks.length > 0) {
      const pick = tracks[Math.floor(Math.random() * tracks.length)];
      // Copy to public/ for Remotion staticFile access
      const publicDir = join(ROOT, 'public');
      mkdirSync(publicDir, { recursive: true });
      const src = join(MUSIC_DIR, pick);
      const dst = join(publicDir, pick);
      if (!existsSync(dst)) writeFileSync(dst, readFileSync(src));
      musicUrl = pick; // just the filename — Remotion uses staticFile()
      console.log(`  🎵 Música de fondo: ${pick}`);
    }
  } catch {}

  // Write temp JSON for Remotion
  const tmpJson = join(ROOT, 'content', `_tmp-reel-${Date.now()}.json`);
  writeFileSync(tmpJson, JSON.stringify({ hook: script.hook, slug, scenes, musicUrl }));

  console.log('  🎬 Renderizando con Remotion (puede tardar ~1 min)...');
  try {
    execSync(`node "${join(ROOT, 'remotion', 'render.mjs')}" "${tmpJson}" --output "${filename}"`, {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } finally {
    try { execSync(`rm -f "${tmpJson}"`); } catch {}
  }

  // Portada = frame 0 del video (generada por render.mjs con renderStill)
  // Esto garantiza que portada y primer frame del video son idénticos
  const coverFilename = filename.replace('.mp4', '-portada.png');
  const coverPath = join(OUTPUT_DIR, coverFilename);

  console.log(`  ✓ Video: ${filename}`);
  console.log(`  ✓ Portada: ${coverFilename}`);
  return { filename, outPath, coverFilename, coverPath, format: 'reel-video', outputDir: OUTPUT_DIR };
}

async function createCarousel(script) {
  console.log('\n🎨 PASO 4: Creando Carousel (7 slides)...');

  const CW = 1080, CH = 1350;
  const slug = script.hook.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  // Each carousel gets its own subfolder
  const carouselDir = join(CAROUSEL_DIR, `${TODAY}-${slug}`);
  mkdirSync(carouselDir, { recursive: true });
  const files = [];

  // Skip slide 1 (hook) — that content goes in the portada instead
  // Carousel slides start from slide 2
  const contentSlides = script.slides.slice(1);

  for (let i = 0; i < contentSlides.length; i++) {
    const slide = contentSlides[i];
    const isFirst = false; // no slide is "first" anymore — portada handles that
    const isLast = i === contentSlides.length - 1;
    const bg = isLast ? C.darkBg : C.bg;
    const textColor = isLast ? '#faf6f1' : C.dark;
    const mutedColor = isLast ? 'rgba(250,246,241,0.5)' : C.muted;

    const children = [];

    // Logo top-left
    children.push({ type:'div', props:{ style:{ position:'absolute', top:60, left:70, display:'flex', alignItems:'center', gap:12 }, children:[
      
      { type:'div', props:{ style:{ fontSize:22, fontWeight:500, color: isLast ? 'rgba(250,246,241,0.4)' : C.light }, children:'finanzas.pop' }},
    ]}});

    // Slide number (except last)
    if (!isLast) {
      children.push({ type:'div', props:{ style:{
        position:'absolute', top:60, right:70,
        fontSize:16, fontWeight:500, color: mutedColor,
      }, children:`${i + 1}/${contentSlides.length - 1}` }});
    }

    // Main content — CENTERED vertically, large text
    // Carousel slides are 1080x1350. Content must fill the space, not huddle at the top.
    children.push({ type:'div', props:{ style:{
      position:'absolute', left:70, right:70, top:'25%', bottom:'15%',
      display:'flex', flexDirection:'column',
      justifyContent:'center',
      alignItems: isLast ? 'center' : 'flex-start',
    }, children:[
      { type:'div', props:{ style:{
        fontSize: 64,
        fontWeight:700,
        color: textColor,
        lineHeight:1.15,
        textAlign: isLast ? 'center' : 'left',
      }, children: sanitize(slide.title) }},
      { type:'div', props:{ style:{
        fontSize: 40,
        fontWeight:400,
        color: mutedColor,
        lineHeight:1.35,
        marginTop:28,
        textAlign: isLast ? 'center' : 'left',
      }, children: sanitize(slide.body) }},
    ] }});

    // ── Brand Thread ──

    // Source attribution line (above red bar)
    children.push({ type:'div', props:{ style:{
      position:'absolute', bottom:36, left:48,
      fontSize:14, fontWeight:500, color: isLast ? 'rgba(250,246,241,0.5)' : 'rgba(28,25,23,0.6)',
    }, children: isFirst ? `Fuente: ${script.source || 'finanzas.pop'}` : '@finanzas.pop' }});

    // Red bottom bar (8px, full width)
    children.push({ type:'div', props:{ style:{
      position:'absolute', bottom:0, left:0, width:CW, height:8, background:C.red,
    }, children:'' }});

    // "fp" logo pill (bottom-right, 24px from edges)
    const pillBgC = isLast ? '#ffffff' : C.red;
    const pillTextC = isLast ? C.red : '#ffffff';
    children.push({ type:'div', props:{ style:{
      position:'absolute', bottom:24, right:24,
      width:36, height:36, borderRadius:8, background:pillBgC,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:16, fontWeight:700, color:pillTextC,
    }, children:'FP' }});

    const el = { type:'div', props:{ style:{ width:CW, height:CH, background:bg, display:'flex', position:'relative', fontFamily:'Inter' }, children }};

    const svg = await satori(el, { width: CW, height: CH, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: CW } }).render().asPng();
    const fname = `slide-${i + 2}.png`; // starts at 2 because portada is the "first"
    writeFileSync(join(carouselDir, fname), png);
    files.push(fname);
    console.log(`  ✓ Slide ${i + 2}/${contentSlides.length + 1}`);
  }

  // Generate portada as slide-1 (same 1080x1350 as other slides)
  // PORTADA RULES (hardcoded, never change):
  // - IG grid crops to 1:1 (1080x1080) from CENTER of 1080x1350
  // - Safe zone: center 800x800 of the image (140px margin each side)
  // - Min font: 52px (readable in grid thumbnail)
  // - Max 3 lines of text
  // - ALWAYS centered horizontally and vertically
  console.log('  Generating portada (slide-1)...');

  // Truncate hook at word boundary for portada readability
  const portadaHook = truncateWords(sanitize(script.hook), 60);

  const coverEl = {
    type: 'div', props: { style: {
      width: CW, height: CH, background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter', textAlign: 'center',
      padding: '175px 100px',
    }, children: [
      // fp circle logo — text as direct children (not nested span, Satori renders correctly)
      { type: 'div', props: { style: {
        width: 64, height: 64, borderRadius: '50%', background: C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 32, color: '#fff', fontSize: 26, fontWeight: 700,
      }, children: 'fp' } },
      { type: 'div', props: { style: {
        fontSize: 72, fontWeight: 700, color: C.red, lineHeight: 1.1,
      }, children: portadaHook } },
      { type: 'div', props: { style: {
        fontSize: 22, fontWeight: 500, color: C.muted, marginTop: 24,
      }, children: '@finanzas.pop' } },
    ] },
  };
  const coverSvg = await satori(coverEl, { width: CW, height: CH, fonts });
  const coverPng = new Resvg(coverSvg, { fitTo: { mode: 'width', value: CW } }).render().asPng();
  writeFileSync(join(carouselDir, 'slide-1.png'), coverPng);
  files.unshift('slide-1.png'); // portada is the first file
  console.log('  ✓ Portada (slide-1) generada');

  return { filename: 'slide-1.png', files, format: 'carousel', outputDir: carouselDir };
}

async function createQuote(script) {
  console.log('\n💬 PASO 4: Creando Quote...');
  mkdirSync(QUOTE_DIR, { recursive: true });

  const QW = 1080, QH = 1080;
  const slug = (script.quote_text || script.hook).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

  // Quote text — never truncate. Font size adjusts to fit.
  const quoteText = sanitize(script.quote_text || script.hook || '');
  const quoteFontSize = quoteText.length > 140 ? 28 : quoteText.length > 120 ? 32 : quoteText.length > 100 ? 36 : quoteText.length > 70 ? 40 : 48;
  const contextText = sanitize(script.quote_context || '');

  console.log(`  🎨 Quote — estilo crema portada`);

  // Same layout as carousel portada: crema bg, fp circle logo centered above text, red text, handle below
  const el = {
    type: 'div', props: { style: {
      width: QW, height: QH, background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter', textAlign: 'center',
      padding: '80px 120px',
      position: 'relative',
    }, children: [
      // fp circle logo centered at top
      { type: 'div', props: { style: {
        width: 64, height: 64, borderRadius: '50%', background: C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 40, color: '#fff', fontSize: 26, fontWeight: 700,
      }, children: 'fp' } },
      // Quote text — font size adapts to length, no truncation
      { type: 'div', props: { style: {
        fontSize: quoteFontSize, fontWeight: 700, color: C.red, lineHeight: 1.2, textAlign: 'center',
      }, children: quoteText } },
      // Context line (source / stat)
      ...(contextText ? [{ type: 'div', props: { style: {
        fontSize: 22, fontWeight: 400, color: C.muted, lineHeight: 1.4, marginTop: 28, textAlign: 'center',
      }, children: contextText } }] : []),
      // Handle
      { type: 'div', props: { style: {
        fontSize: 22, fontWeight: 500, color: C.muted, marginTop: 32,
      }, children: '@finanzas.pop' } },
      // Red bottom bar
      { type: 'div', props: { style: {
        position: 'absolute', bottom: 0, left: 0, width: QW, height: 8, background: C.red,
      }, children: '' } },
    ] },
  };

  const svg = await satori(el, { width: QW, height: QH, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: QW } }).render().asPng();
  const fname = `quote-${TODAY}-${slug}.png`;
  writeFileSync(join(QUOTE_DIR, fname), png);

  console.log(`  ✓ Quote: ${fname}`);
  return { filename: fname, format: 'quote', outputDir: QUOTE_DIR };
}

// ═══════════════════════════════════════════
// PASO 5: GUARDAR CAPTION + LOG
// ═══════════════════════════════════════════
function saveOutput(script, output, topic) {
  console.log('\n💾 PASO 5: Guardando caption y log...');

  const fmt = output.format || 'reel';
  const outDir = output.outputDir || OUTPUT_DIR;

  // Save caption
  const ext = (fmt === 'reel' || fmt === 'reel-video') ? '.mp4' : '.png';
  const captionFile = output.filename.replace(ext, '-caption.txt');
  writeFileSync(join(outDir, captionFile), script.caption);
  console.log(`  ✓ Caption: ${captionFile}`);

  // Format label for log
  const formatLabel = fmt === 'carousel' ? 'Carousel' : fmt === 'quote' ? 'Quote' : fmt === 'reel-video' ? 'Reel-Video' : 'Reel';
  const templateLabel = script.template || 'daily-briefing';

  // Update content log (added template column)
  const logLine = `| ${TODAY} | ${topic.titulo} | ${formatLabel} | ${script.hook} | ${topic.fuente} | - | - | ${templateLabel} |`;
  try {
    appendFileSync(CONTENT_LOG, '\n' + logLine);
    console.log('  ✓ Content log actualizado');
  } catch {
    console.log('  ⚠ No se pudo actualizar content log');
  }

  return captionFile;
}

// ═══════════════════════════════════════════
// PASO 6: PUBLICAR EN METRICOOL
// ═══════════════════════════════════════════

/**
 * Returns the next optimal publish datetime (Mexico City CST/CDT) for the given format.
 * Reels → 12:00, Carousels → 16:00. If that slot already passed today, schedules for tomorrow.
 */
function getOptimalPublishTime(fmt) {
  // PUBLISH_NOW=1 → schedule 3 minutes from now in Mexico City wall-clock time
  if (process.env.PUBLISH_NOW === '1') {
    // Date.now() is always UTC epoch — shift by Mexico City offset to get local wall-clock
    const mxNow = new Date(Date.now() + (-6 * 3600000));
    mxNow.setMinutes(mxNow.getMinutes() + 3);
    return mxNow; // toISOString() will output Mexico time as if it were UTC
  }
  const targetHour = (fmt === 'carousel' || fmt === 'quote') ? 16 : 12;
  const now = new Date();
  // Convert to Mexico City time (UTC-6)
  const mxOffset = -6 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const mxNow = new Date(utcMs + mxOffset * 60000);

  const target = new Date(mxNow);
  target.setHours(targetHour, 0, 0, 0);
  if (mxNow >= target) target.setDate(target.getDate() + 1); // already passed → tomorrow

  // Skip weekend (Sat=6, Sun=0) — move to Monday
  while (target.getDay() === 0 || target.getDay() === 6) {
    target.setDate(target.getDate() + 1);
  }

  // Convert back to UTC for the API
  return new Date(target.getTime() - mxOffset * 60000);
}

// Upload a single file to Metricool via S3 presigned URL (3-step flow)
async function uploadFileToMetricool(filePath, TOKEN, USER_ID, BLOG_ID) {
  const { createHash } = await import('crypto');
  const BASE = 'https://app.metricool.com/api';
  const auth = { 'X-Mc-Auth': TOKEN };
  const qp = `userId=${USER_ID}&blogId=${BLOG_ID}`;

  const fileBuffer = readFileSync(filePath);
  const fileSize = fileBuffer.length;
  const mimeType = filePath.endsWith('.mp4') ? 'video/mp4' : 'image/png';
  const ext = filePath.endsWith('.mp4') ? 'mp4' : 'png';
  const fileHash = createHash('sha256').update(fileBuffer).digest('base64');

  // Step 1: Create upload transaction → get presigned URL
  const txRes = await fetch(`${BASE}/v2/media/s3/upload-transactions?${qp}`, {
    method: 'PUT',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resourceType: 'planner',
      contentType: mimeType,
      fileExtension: ext,
      parts: [{ size: fileSize, startByte: 0, endByte: fileSize, hash: fileHash }],
    }),
  });
  if (!txRes.ok) throw new Error(`Upload tx failed (${txRes.status}): ${(await txRes.text()).slice(0, 200)}`);
  const txData = (await txRes.json()).data;
  const { presignedUrl, fileUrl } = txData;

  // Step 2: Upload raw bytes to S3 presigned URL
  const s3Res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType, 'Content-Length': String(fileSize), 'x-amz-checksum-sha256': fileHash },
    body: fileBuffer,
  });
  if (!s3Res.ok) throw new Error(`S3 upload failed (${s3Res.status})`);

  // Step 3: Complete transaction → get final CDN URL
  const completeRes = await fetch(`${BASE}/v2/media/s3/upload-transactions?${qp}`, {
    method: 'PATCH',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ simple: { fileUrl } }),
  });
  if (!completeRes.ok) throw new Error(`Complete tx failed (${completeRes.status}): ${(await completeRes.text()).slice(0, 200)}`);
  const completeData = (await completeRes.json()).data;
  return completeData.convertedFileUrl || completeData.fileUrl;
}

async function publishToMetricool(output, captionText) {
  const TOKEN   = readEnvKey('METRICOOL_API_KEY');
  const USER_ID = readEnvKey('METRICOOL_USER_ID');
  const BLOG_ID = readEnvKey('METRICOOL_BLOG_ID');

  if (!TOKEN) {
    console.log('  ⚠ METRICOOL_API_KEY no encontrada, saltando publicación automática');
    return null;
  }

  console.log('\n📲 PASO 6: Programando publicación en Metricool...');

  const fmt = output.format;
  const BASE = 'https://app.metricool.com/api';
  const auth = { 'X-Mc-Auth': TOKEN };
  const qp = `userId=${USER_ID}&blogId=${BLOG_ID}`;
  const scheduleDate = getOptimalPublishTime(fmt);
  console.log(`  📅 Horario objetivo: ${scheduleDate.toISOString()} (${fmt})`);

  try {
    // ── Upload media via S3 presigned URL flow ──
    const mediaFiles = fmt === 'carousel'
      ? output.files.map(f => join(output.outputDir, f))
      : fmt === 'quote'
        ? [join(output.outputDir, output.filename)]
        : [output.outPath];

    const mediaUrls = [];
    for (const filePath of mediaFiles) {
      const fileName = filePath.split('/').pop();
      const url = await uploadFileToMetricool(filePath, TOKEN, USER_ID, BLOG_ID);
      mediaUrls.push(url);
      console.log(`  ✓ Subido: ${fileName} → ${url}`);
    }

    // Upload cover/thumbnail for reels
    let thumbnailUrl = null;
    if ((fmt === 'reel' || fmt === 'reel-video') && output.coverPath) {
      thumbnailUrl = await uploadFileToMetricool(output.coverPath, TOKEN, USER_ID, BLOG_ID);
      console.log(`  ✓ Portada subida → ${thumbnailUrl}`);
    }

    // ── Schedule post ──
    const igType = fmt === 'carousel' ? 'POST' : 'REEL';
    const postBody = {
      text: captionText,
      publicationDate: {
        dateTime: scheduleDate.toISOString().slice(0, 19),
        timezone: 'America/Mexico_City',
      },
      providers: [{ network: 'instagram' }],
      instagramData: { type: igType, autoPublish: true },
      media: mediaUrls,
      autoPublish: true,
    };
    if (thumbnailUrl) postBody.videoThumbnailUrl = thumbnailUrl;

    const schedRes = await fetch(`${BASE}/v2/scheduler/posts?${qp}`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody),
    });

    if (!schedRes.ok) {
      const err = await schedRes.text();
      throw new Error(`Schedule failed (${schedRes.status}): ${err.slice(0, 300)}`);
    }

    const schedData = await schedRes.json();
    const postId = schedData?.data?.id;
    console.log(`  ✅ Programado en Metricool → ID ${postId} para ${scheduleDate.toISOString()}`);
    return schedData;

  } catch (e) {
    console.log(`  ⚠ Metricool error: ${e.message}`);
    console.log('  ℹ Archivos listos para publicación manual en Contenido_IG/');
    return null;
  }
}

// ═══════════════════════════════════════════
// CLAUDE API (Opus 4.6 — for creative scripts)
// ═══════════════════════════════════════════
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || readEnvKey('ANTHROPIC_API_KEY');

async function callClaude(prompt, model = 'claude-opus-4-6') {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
  });

  const data = await res.json();

  if (data.content && data.content[0]) {
    return data.content[0].text;
  }

  throw new Error(`Claude error: ${JSON.stringify(data).slice(0, 200)}`);
}

// ═══════════════════════════════════════════
// GEMINI API (Flash — for news scraping)
// ═══════════════════════════════════════════
async function callGemini(prompt, model = 'gemini-2.5-flash') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    })
  });

  const data = await res.json();

  if (data.candidates && data.candidates[0]) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error(`Gemini error: ${JSON.stringify(data).slice(0, 200)}`);
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
// ═══════════════════════════════════════
// QA GATE — validates content before publish
// Criteria update automatically from learnings.md
// ═══════════════════════════════════════
function runQA(script, _output) {
  console.log('\n🔍 QA — Verificando contenido...');
  const issues = [];
  const caption = (script.caption || '').toLowerCase();
  const allText = `${script.hook} ${script.caption} ${JSON.stringify(script.scenes || script.slides || script.quote_text || '')}`.toLowerCase();

  // ── HOOK ──
  const hookText = script.hook || '';
  if (hookText.length > 60) {
    issues.push(`Hook demasiado largo (${hookText.length} chars, máx 60) — se va a cortar en la portada`);
  }
  if (!/\d/.test(hookText) && !/\$|%|millones|mil|trillones/i.test(hookText)) {
    issues.push('Hook sin dato concreto (número, $, %) — no engancha');
  }
  const vagueHooks = /cuida tus|piensa (en|diferente)|te mienten|no te dicen|la verdad sobre|secreto de|solo te dicen/i;
  if (vagueHooks.test(hookText)) {
    issues.push('Hook demasiado vago/genérico — necesita dato concreto y sorpresa');
  }

  // Check if CETES is the main topic (over-used) — only allow if no other CETES post in last 3 days
  // Block over-used topics (CETES, tanda) if already appeared in last 3 days
  const overusedTopics = /cetes|tanda/i;
  if (overusedTopics.test(hookText) || overusedTopics.test(allText.slice(0, 200))) {
    try {
      const log = readFileSync(CONTENT_LOG, 'utf-8').toLowerCase();
      const d0 = TODAY, d1 = new Date(Date.now()-86400000).toISOString().slice(0,10), d2 = new Date(Date.now()-2*86400000).toISOString().slice(0,10);
      const recent = log.split('\n').filter(l => (l.includes(d0)||l.includes(d1)||l.includes(d2)));
      const matches = overusedTopics.source.split('|');
      for (const topic of matches) {
        if (new RegExp(topic, 'i').test(allText) && recent.some(l => new RegExp(topic, 'i').test(l))) {
          issues.push(`"${topic}" ya aparece en posts recientes — variar tema`);
        }
      }
    } catch {}
  }
  // Debe hablar de México o conectar con mexicanos
  const mexicoKeywords = /m[eé]xico|mexican[oa]s?|peso[s]?|cetes|afore|banxico|sat |infonavit|oxxo|bimbo|femsa|quincena|tanda/i;
  if (!mexicoKeywords.test(allText)) {
    issues.push('No menciona México ni conecta con la vida del mexicano');
  }

  // ── LEGAL ──
  const investmentAdvice = /\b(compra (cetes|acciones|etf|bonos|crypto)|invierte en \w|mete tu dinero en|pon tu dinero en|te recomiendo invertir|en (vez|lugar) de.*(tanda|banco|débito).*(cetes|invertir|gbm|nu )|tu dinero trabaj[ae] para ti)\b/i;
  if (investmentAdvice.test(allText)) {
    issues.push('LEGAL: Contiene consejo de inversión directo (prohibido)');
  }
  const promisedReturns = /\b(vas a ganar|rendimiento (asegurado|garantizado)|sin riesgo|inversi[oó]n segura)\b/i;
  if (promisedReturns.test(allText)) {
    issues.push('LEGAL: Promete rendimientos o dice "sin riesgo" (prohibido)');
  }
  // Disclaimer en caption
  if (!caption.includes('educativ') && !caption.includes('no asesor')) {
    issues.push('Falta disclaimer "Contenido educativo, no asesoría financiera" en caption');
  }

  // ── VISUAL (para reels) ──
  if (script.scenes) {
    // Verificar que las escenas no tengan texto muy largo (>8 palabras por línea)
    for (const [i, scene] of script.scenes.entries()) {
      for (const line of ['text_line1', 'text_line2', 'text_line3']) {
        const text = scene[line] || '';
        if (text.split(' ').length > 10) {
          issues.push(`Escena ${i+1} ${line}: "${text.slice(0,30)}..." tiene >10 palabras (se va a salir del recuadro)`);
        }
      }
    }
  }

  // ── NO SHOUTOUTS AUTOMÁTICOS ──
  // El motor no debe promocionar otras cuentas/marcas/creadores por su cuenta.
  // Los shoutouts solo se hacen si Martín los acuerda previamente.
  const brandMentions = /chisme corporativo|podcast de [A-Z]\w+|canal de [A-Z]\w+|la cuenta de @\w+/i;
  if (brandMentions.test(allText)) {
    issues.push('Menciona otra marca/creador — los shoutouts solo si están acordados previamente');
  }

  // ── LEARNINGS-BASED (dynamic from learnings.md) ──
  // Load anti-patterns from learnings
  try {
    const antiSection = learningsContent.match(/### (?:Lo que|Anti-?patrones|Hooks que NO)[\s\S]*?(?=###|$)/i);
    if (antiSection) {
      // Check for known bad patterns (e.g. "guru tone", certain phrases)
      if (/libertad financiera|ingreso pasivo|mentalidad millonaria|hazte rico/i.test(allText)) {
        issues.push('Usa frase prohibida de guru financiero (learnings)');
      }
    }
  } catch {}

  // Report
  if (issues.length === 0) {
    console.log('  ✓ Hook viral, México-first, educativo, legal OK');
  } else {
    issues.forEach(i => console.log(`  ✗ ${i}`));
  }
  return issues;
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log(`💰 finanzas.pop engine — ${TODAY}`);
  console.log('═══════════════════════════════════════');

  if (!GEMINI_KEY) {
    console.error('✗ GEMINI_API_KEY no encontrada en .env');
    process.exit(1);
  }
  if (!ANTHROPIC_KEY) {
    console.error('✗ ANTHROPIC_API_KEY no encontrada en .env (necesaria para Opus 4.6)');
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(CAROUSEL_DIR, { recursive: true });
  mkdirSync(QUOTE_DIR, { recursive: true });

  // Pipeline
  const news = await scrapeNews();
  // Auto-update learnings with competitor insights (non-blocking)
  const competitorPosts = news.filter(n => n.source_type === 'competitor');
  await updateLearningsFromCompetitors(competitorPosts);
  // RELOAD learnings after auto-update so steps 2 and 3 use fresh data
  try { learningsContent = readFileSync(LEARNINGS_PATH, 'utf-8'); } catch {}
  const topic = await selectTopic(news);
  const script = await generateScript(topic);
  const output = await createContent(script);
  saveOutput(script, output, topic);

  // ── QA GATE — validate content + visual before publishing ──
  const qaIssues = runQA(script, output);
  if (qaIssues.length > 0) {
    console.log('\n🚨 QA FALLÓ — NO SE PUBLICA:');
    qaIssues.forEach(issue => console.log(`  ✗ ${issue}`));
    console.log('  ℹ Contenido guardado localmente pero NO programado en Metricool.');
  } else {
    console.log('\n✅ QA PASÓ — publicando...');
    await publishToMetricool(output, script.caption);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✅ LISTO PARA PUBLICAR');
  const fmt = output.format || 'reel';
  if (fmt === 'carousel') {
    console.log(`  🎨 Carousel: ${output.files.length} slides en Contenido_IG/carousels/`);
  } else if (fmt === 'quote') {
    console.log(`  💬 Quote: Contenido_IG/quotes/${output.filename}`);
  } else {
    console.log(`  📹 Video: Contenido_IG/reels/${output.filename}`);
    console.log(`  🖼️  Portada: Contenido_IG/reels/${output.coverFilename}`);
  }
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
