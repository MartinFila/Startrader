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
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'fs';
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

const W = 1080, H = 1920, FPS = 24;
const C = { bg: '#faf6f1', red: '#dc2626', dark: '#1c1917', muted: '#78716c', light: '#a89880', darkBg: '#1c1917',
  slate: '#1e293b', mint: '#d1fae5', amber: '#f59e0b', stone: '#e7e5e4', white: '#ffffff' };

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

const TEMPLATE_BG = {
  'daily-briefing':  '#faf6f1',  // light
  'bold-data':       '#1e293b',  // dark
  'comparison-grid': '#ffffff',  // white
  'editorial-quote': '#1c1917',  // dark
  'step-by-step':    '#faf6f1',  // light
  'the-reveal':      '#1e293b',  // dark (split, top 60%)
  'ranking-list':    '#ffffff',  // white
  'pop-context':     '#1c1917',  // dark
};

const DARK_TEMPLATES = ['bold-data', 'editorial-quote', 'the-reveal', 'pop-context'];

/**
 * Choose a visual template based on content type and recent history.
 * Reads content-log.md to avoid repeating the same template 2x in a row.
 */
function chooseTemplate(topic, format) {
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
    'finanzas.conproposito', 'el.inversor.eficiente', 'invierteconpepe_',
    'pequenocerdocapitalista', 'mispropiasfinanzasmex', 'soymacariva',
    'thewealthdad', 'wealth.ceo'
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

    // 5. Map to the format expected by the rest of the pipeline
    const results = sorted.map(p => ({
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
 * Guess the source from the feed URL.
 */
function feedToSource(feedUrl) {
  if (feedUrl.includes('expansion')) return 'Expansión';
  if (feedUrl.includes('jornada')) return 'La Jornada';
  if (feedUrl.includes('eleconomista')) return 'El Economista';
  if (feedUrl.includes('elfinanciero')) return 'El Financiero';
  return 'RSS';
}

/**
 * Like fetchRSSNews but returns objects with {title, source} instead of plain strings.
 */
async function fetchRSSNewsWithSource() {
  const feeds = [
    { url: 'https://news.google.com/rss/search?q=finanzas+personales+Mexico&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=inflacion+Mexico+INEGI&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=CETES+Banxico+tasa+interes&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=Nu+Mexico+GBM+fintech&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=Afore+pension+retiro+Mexico&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
    { url: 'https://news.google.com/rss/search?q=deuda+tarjeta+credito+Mexico&hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News' },
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

  // Reddit
  console.log('  📡 Buscando en r/MexicoFinanciero...');
  try {
    const redditRes = await fetch('https://www.reddit.com/r/MexicoFinanciero/hot.json?limit=10', {
      headers: { 'User-Agent': 'finanzas-pop-engine/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    const redditData = await redditRes.json();
    const redditPosts = redditData.data.children
      .map(c => c.data)
      .filter(p => p.score > 5)
      .map(p => ({ title: p.title, source: 'r/MexicoFinanciero', score: p.score }));
    // Add to headlines
    realHeadlines.push(...redditPosts.slice(0, 5));
    console.log(`  ✓ ${redditPosts.length} posts de Reddit encontrados`);
  } catch (e) {
    console.log('  ⚠ Reddit no disponible');
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
  return [
    {
      titulo: "La inflación en México sigue subiendo y golpea los alimentos",
      dato: "4.63% general, 8.34% frutas y verduras",
      fuente: "INEGI, marzo 2026",
      relevancia: "Tu canasta del super cuesta más cada mes y tu sueldo no sube",
      viralidad: 8
    },
    {
      titulo: "Nu México sigue pagando más que CETES",
      dato: "Nu 14.5% vs CETES 6.81%",
      fuente: "Sitios oficiales, marzo 2026",
      relevancia: "Si tu dinero está en un banco que paga 1%, estás perdiendo",
      viralidad: 7
    },
    {
      titulo: "Solo el 8.8% de los mexicanos invierte",
      dato: "8.8% en acciones o crypto, 91.2% no",
      fuente: "ENIF 2024, INEGI",
      relevancia: "La mayoría deja su dinero perder valor sin saberlo",
      viralidad: 9
    }
  ];
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

  // Filter out topics already used TODAY
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

3. TEMAS QUE EXPLOTAN en México (probado con datos reales):
   - Retiro/pensión/Afore (265K likes — el tema nuclear)
   - Comprar casa (10,708 avg engagement)
   - Tarjetas de crédito (7,934 avg engagement)
   - Empresas mexicanas para invertir (6,960 avg engagement)
   - Comparativas: Nu vs CETES vs Hey Banco vs GBM+
   - Empezar a invertir con poco ($100 en CETES)
   - Historias de otros países como ejemplo ("Noruega y su petróleo" = 90K likes en @soymacariva)

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
  const format = chooseFormat();
  console.log(`  🎨 Formato elegido: ${format}`);

  // Choose visual template based on content type
  const { template, contentType } = chooseTemplate(selectedTopic, format);
  return { ...selectedTopic, format, template, contentType };
}

/**
 * Choose content format based on recent publishing history.
 * Mix target: 70% Reel, 20% Carousel, 10% Quote.
 * If last 2 posts were Reels → force Carousel or Quote.
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

  // If last 2 were Reels, force variety
  const lastTwo = recentFormats.slice(-2);
  if (lastTwo.length >= 2 && lastTwo.every(f => f === 'reel')) {
    const pick = Math.random() < 0.67 ? 'carousel' : 'quote';
    console.log(`  🔄 Últimos 2 fueron Reels → forzando variedad: ${pick}`);
    return pick;
  }

  // Otherwise follow mix target: 70/20/10
  const r = Math.random();
  if (r < 0.70) return 'reel';
  if (r < 0.90) return 'carousel';
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
- El hook debe ser algo que alguien ENVIARÍA por DM a un amigo`;

  let formatInstructions;
  if (topic.format === 'carousel') {
    formatInstructions = `GENERA un script para un CAROUSEL de Instagram (7 slides, imágenes estáticas).

ESTRUCTURA:
- Slide 1 (HOOK): Detiene el scroll. Dato impactante + "DESLIZA →". Máximo 20 palabras total.
- Slides 2-6 (CONTENIDO): Cada uno explica un punto. Cada slide tiene título (bold) + body. Máximo 20 palabras por slide.
- Slide 7 (CTA): "Sígueme para entender tu dinero cada día. @finanzas.pop. Guarda este post."

Responde en JSON estricto:
{
  "hook": "texto del hook (slide 1)",
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
  "caption": "caption para Instagram: hook → explicación corta → dato con fuente → CTA (guarda/comparte) → 8 hashtags",
  "source": "${topic.fuente}"
}`;
  } else if (topic.format === 'quote') {
    formatInstructions = `GENERA un script para una QUOTE de Instagram (1 sola imagen).

ESTRUCTURA:
- Una frase poderosa relacionada con el tema (máximo 25 palabras). No es cita de famoso — es un insight propio de @finanzas.pop.
- Una línea de contexto/dato que sustenta la frase (máximo 15 palabras).
- Atribución: "— @finanzas.pop"

Responde en JSON estricto:
{
  "hook": "la frase principal de la quote",
  "format": "quote",
  "quote_text": "la frase poderosa (máximo 25 palabras)",
  "quote_context": "línea de contexto con dato (máximo 15 palabras)",
  "quote_attribution": "— @finanzas.pop",
  "caption": "caption para Instagram: la frase → explicación → dato con fuente → CTA (guarda/comparte) → 8 hashtags",
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

Responde en JSON estricto:
{
  "hook": "texto completo del hook (escena 1)",
  "format": "reel",
  "scenes": [
    {"id": 1, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 3.5},
    {"id": 2, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 4},
    {"id": 3, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 4.5},
    {"id": 4, "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 4.5},
    {"id": 5, "text_line1": "Sígueme para entender", "text_line2": "tu dinero cada día.", "text_line3": "@finanzas.pop", "duration": 3.5}
  ],
  "caption": "caption para Instagram: hook → explicación corta → dato con fuente → CTA (guarda/comparte) → 8 hashtags",
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
      const fmt = script.format || topic.format || 'reel';
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
  return createReelVideo(script);
}

async function createReelVideo(script) {
  console.log('\n🎬 PASO 4: Creando Reel...');

  const framesDir = join(__dirname, '..', 'content', 'frames-engine');
  if (existsSync(framesDir)) execSync(`rm -rf ${framesDir}`);
  mkdirSync(framesDir, { recursive: true });

  const totalDuration = script.scenes.reduce((sum, s) => sum + s.duration, 0);
  const totalFrames = Math.ceil(FPS * totalDuration);

  function ease(t) { return 1 - Math.pow(1 - Math.min(Math.max(t,0),1), 4); }

  // Build scene timing
  let cumTime = 0;
  const sceneTiming = script.scenes.map(s => {
    const start = cumTime;
    cumTime += s.duration;
    return { ...s, start, end: cumTime };
  });

  function buildFrame(frame) {
    const sec = frame / FPS;
    const children = [];
    const isLastScene = sec >= sceneTiming[sceneTiming.length - 1].start;
    const bg = isLastScene ? C.darkBg : C.bg;
    const textColor = isLastScene ? '#faf6f1' : C.dark;
    const mutedColor = isLastScene ? 'rgba(250,246,241,0.5)' : C.muted;

    // Logo — text only, no box (Satori has glyph rendering issues with boxed text)
    children.push({ type:'div', props:{ style:{ position:'absolute', top:70, left:80, display:'flex', alignItems:'center', gap:8 }, children:[
      { type:'div', props:{ style:{ fontSize:22, fontWeight:700, color: isLastScene ? 'rgba(250,246,241,0.6)' : C.red }, children:'finanzas.pop' }},
    ]}});

    // Find current scene
    const currentScene = sceneTiming.find(s => sec >= s.start && sec < s.end) || sceneTiming[sceneTiming.length - 1];
    const localT = (sec - currentScene.start) / currentScene.duration;
    const fadeIn = ease(localT * 2.5);

    const isFirstScene = currentScene.id === 1;
    const contentAlign = isLastScene ? 'center' : 'flex-start';
    const textAlign = isLastScene ? 'center' : 'left';

    children.push({ type:'div', props:{ style:{
      position:'absolute', left:80, right:80, top:'32%',
      display:'flex', flexDirection:'column', alignItems: contentAlign,
    }, children:[
      { type:'div', props:{ style:{
        fontSize: isFirstScene ? 58 : 44,
        fontWeight:700,
        color: isFirstScene ? C.red : textColor,
        lineHeight:1.2,
        opacity:fadeIn,
        textAlign,
      }, children: currentScene.text_line1 || '' }},
      currentScene.text_line2 ? { type:'div', props:{ style:{
        fontSize: isFirstScene ? 58 : 40,
        fontWeight: isFirstScene ? 700 : 400,
        color: isFirstScene ? textColor : mutedColor,
        lineHeight:1.3,
        marginTop:15,
        opacity: ease(Math.max(0, (localT - 0.15) * 2.5)),
        textAlign,
      }, children: currentScene.text_line2 }} : null,
      currentScene.text_line3 ? { type:'div', props:{ style:{
        fontSize: isFirstScene ? 58 : 38,
        fontWeight: isFirstScene ? 700 : 400,
        color: isLastScene ? C.red : (isFirstScene ? textColor : mutedColor),
        lineHeight:1.3,
        marginTop:15,
        opacity: ease(Math.max(0, (localT - 0.3) * 2.5)),
        textAlign,
      }, children: currentScene.text_line3 }} : null,
    ].filter(Boolean) }});

    // Source footer (not on last scene)
    if (!isLastScene) {
      children.push({ type:'div', props:{ style:{
        position:'absolute', bottom:60, right:80,
        fontSize:18, color:C.light,
      }, children:'@finanzas.pop' }});
    }

    return { type:'div', props:{ style:{ width:W, height:H, background:bg, display:'flex', position:'relative', fontFamily:'Inter' }, children }};
  }

  // Generate frames
  for (let f = 0; f < totalFrames; f++) {
    const el = buildFrame(f);
    const svg = await satori(el, { width: W, height: H, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
    writeFileSync(join(framesDir, `f_${String(f).padStart(5,'0')}.png`), png);
    if (f % 20 === 0) process.stdout.write(`\r  Frames: ${f}/${totalFrames}`);
  }

  // Assemble video
  const slug = script.hook.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const filename = `reel-${TODAY}-${slug}.mp4`;
  const outPath = join(OUTPUT_DIR, filename);

  execSync(`ffmpeg -y -framerate ${FPS} -i "${framesDir}/f_%05d.png" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 12 -b:v 8M "${outPath}" 2>&1`);
  execSync(`rm -rf "${framesDir}"`);

  // Generate cover/thumbnail (portada)
  // IG crops Reel covers to center square (1:1) so ALL content must be in the middle third
  console.log('  Generating cover...');
  const coverFilename = filename.replace('.mp4', '-portada.png');

  const hookLine1 = script.scenes[0].text_line1 || '';
  const hookLine2 = script.scenes[0].text_line2 || '';
  const hookLine3 = script.scenes[0].text_line3 || '';

  const coverEl = {
    type: 'div', props: { style: {
      width: W, height: H, background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter', textAlign: 'center',
      // All content in center — safe zone for IG crop
      padding: '400px 100px',
    }, children: [
      // Logo centered above content
      { type: 'div', props: { style: {
        width: 56, height: 56, borderRadius: 28, background: C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 30,
      }, children: 'fp' } },
      // Hook text — centered
      { type: 'div', props: { style: {
        fontSize: 52, fontWeight: 700, color: C.red, lineHeight: 1.15,
      }, children: hookLine1 } },
      hookLine2 ? { type: 'div', props: { style: {
        fontSize: 44, fontWeight: 700, color: C.dark, lineHeight: 1.2, marginTop: 16,
      }, children: hookLine2 } } : null,
      hookLine3 ? { type: 'div', props: { style: {
        fontSize: 38, fontWeight: 400, color: C.muted, lineHeight: 1.25, marginTop: 12,
      }, children: hookLine3 } } : null,
      // Handle
      { type: 'div', props: { style: {
        fontSize: 22, fontWeight: 600, color: C.red, marginTop: 30,
      }, children: '@finanzas.pop' } },
    ].filter(Boolean) } };

  const coverSvg = await satori(coverEl, { width: W, height: H, fonts });
  const coverPng = new Resvg(coverSvg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  writeFileSync(join(OUTPUT_DIR, coverFilename), coverPng);

  console.log(`  ✓ Video: ${filename}`);
  console.log(`  ✓ Cover: ${coverFilename}`);
  return { filename, outPath, coverFilename, format: 'reel', outputDir: OUTPUT_DIR };
}

async function createCarousel(script) {
  console.log('\n🎨 PASO 4: Creando Carousel (7 slides)...');

  const CW = 1080, CH = 1350;
  const slug = script.hook.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  // Each carousel gets its own subfolder
  const carouselDir = join(CAROUSEL_DIR, `${TODAY}-${slug}`);
  mkdirSync(carouselDir, { recursive: true });
  const files = [];

  for (let i = 0; i < script.slides.length; i++) {
    const slide = script.slides[i];
    const isFirst = i === 0;
    const isLast = i === script.slides.length - 1;
    const bg = isLast ? C.darkBg : C.bg;
    const textColor = isLast ? '#faf6f1' : C.dark;
    const mutedColor = isLast ? 'rgba(250,246,241,0.5)' : C.muted;

    const children = [];

    // Logo top-left
    children.push({ type:'div', props:{ style:{ position:'absolute', top:60, left:70, display:'flex', alignItems:'center', gap:12 }, children:[
      
      { type:'div', props:{ style:{ fontSize:18, fontWeight:500, color: isLast ? 'rgba(250,246,241,0.4)' : C.light }, children:'finanzas.pop' }},
    ]}});

    // Slide number (except first and last)
    if (!isFirst && !isLast) {
      children.push({ type:'div', props:{ style:{
        position:'absolute', top:60, right:70,
        fontSize:16, fontWeight:500, color: mutedColor,
      }, children:`${i}/${script.slides.length - 2}` }});
    }

    // Main content
    children.push({ type:'div', props:{ style:{
      position:'absolute', left:70, right:70, top:'30%',
      display:'flex', flexDirection:'column',
      alignItems: isLast ? 'center' : 'flex-start',
    }, children:[
      { type:'div', props:{ style:{
        fontSize: isFirst ? 42 : 36,
        fontWeight:700,
        color: isFirst ? C.red : textColor,
        lineHeight:1.25,
        textAlign: isLast ? 'center' : 'left',
      }, children: slide.title }},
      { type:'div', props:{ style:{
        fontSize: isFirst ? 30 : 26,
        fontWeight:400,
        color: isFirst ? textColor : mutedColor,
        lineHeight:1.4,
        marginTop:20,
        textAlign: isLast ? 'center' : 'left',
      }, children: slide.body }},
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
    }, children:'fp' }});

    const el = { type:'div', props:{ style:{ width:CW, height:CH, background:bg, display:'flex', position:'relative', fontFamily:'Inter' }, children }};

    const svg = await satori(el, { width: CW, height: CH, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: CW } }).render().asPng();
    const fname = `slide-${i + 1}.png`;
    writeFileSync(join(carouselDir, fname), png);
    files.push(fname);
    console.log(`  ✓ Slide ${i + 1}/${script.slides.length}`);
  }

  // Generate cover (1080x1080 square for IG grid)
  // Cover is DIFFERENT from slide 1 — it's a teaser, not a copy
  console.log('  Generating carousel cover...');
  const coverEl = {
    type: 'div', props: { style: {
      width: 1080, height: 1080, background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter', textAlign: 'center',
      padding: '100px',
    }, children: [
      { type: 'div', props: { style: {
        width: 56, height: 56, borderRadius: 28, background: C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 40,
      }, children: 'fp' } },
      { type: 'div', props: { style: {
        fontSize: 42, fontWeight: 700, color: C.dark, lineHeight: 1.2,
      }, children: script.hook } },
      { type: 'div', props: { style: {
        fontSize: 24, fontWeight: 700, color: C.red, marginTop: 30, letterSpacing: 3,
      }, children: 'DESLIZA PARA APRENDER →' } },
      { type: 'div', props: { style: {
        fontSize: 18, fontWeight: 600, color: C.light, marginTop: 20,
      }, children: '@finanzas.pop' } },
    ] },
  };
  const coverSvg = await satori(coverEl, { width: 1080, height: 1080, fonts });
  const coverPng = new Resvg(coverSvg, { fitTo: { mode: 'width', value: 1080 } }).render().asPng();
  writeFileSync(join(carouselDir, 'portada.png'), coverPng);
  console.log('  ✓ Portada generada');

  return { filename: files[0], files, format: 'carousel', outputDir: carouselDir, coverFilename: 'portada.png' };
}

async function createQuote(script) {
  console.log('\n💬 PASO 4: Creando Quote...');
  mkdirSync(QUOTE_DIR, { recursive: true });

  const QW = 1080, QH = 1080;
  const slug = (script.quote_text || script.hook).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const template = script.template || 'editorial-quote';

  // Template-aware colors
  const bg = TEMPLATE_BG[template] || C.bg;
  const isDark = DARK_TEMPLATES.includes(template);
  const textColor = isDark ? '#ffffff' : C.dark;
  const mutedColor = isDark ? 'rgba(255,255,255,0.5)' : C.muted;
  const sourceColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(28,25,23,0.6)';
  // Logo pill: inverted on dark backgrounds
  const pillBg = isDark ? '#ffffff' : C.red;
  const pillText = isDark ? C.red : '#ffffff';

  console.log(`  🎨 Template: "${template}" (bg: ${bg}, ${isDark ? 'dark' : 'light'})`);

  const children = [];

  // Large open-quote mark (decorative)
  children.push({ type:'div', props:{ style:{
    position:'absolute', top:120, left:48,
    fontSize:200, fontWeight:700, color:C.red, lineHeight:1, opacity: isDark ? 0.4 : 0.15,
  }, children:'\u201C' }});

  // Quote text — centered
  children.push({ type:'div', props:{ style:{
    position:'absolute', left:48, right:48, top:'28%',
    display:'flex', flexDirection:'column', alignItems:'center',
  }, children:[
    { type:'div', props:{ style:{
      fontSize:44, fontWeight:700, color:textColor, lineHeight:1.3, textAlign:'center',
    }, children: script.quote_text }},
    { type:'div', props:{ style:{
      fontSize:22, fontWeight:400, color: C.red, lineHeight:1.4, marginTop:24, textAlign:'center',
    }, children: script.quote_context }},
    { type:'div', props:{ style:{
      fontSize:20, fontWeight:500, color:mutedColor, marginTop:24,
    }, children: script.quote_attribution || '\u2014 @finanzas.pop' }},
  ] }});

  // ── Brand Thread (on ALL posts) ──

  // Source attribution line (above red bar)
  children.push({ type:'div', props:{ style:{
    position:'absolute', bottom:36, left:48,
    fontSize:14, fontWeight:500, color:sourceColor,
  }, children: `Fuente: ${script.source || 'finanzas.pop'}` }});

  // Red bottom bar (8px, full width)
  children.push({ type:'div', props:{ style:{
    position:'absolute', bottom:0, left:0, width:QW, height:8, background:C.red,
  }, children:'' }});

  // "fp" logo pill (bottom-right, 24px from edges, above bar)
  children.push({ type:'div', props:{ style:{
    position:'absolute', bottom:24, right:24,
    width:36, height:36, borderRadius:8, background:pillBg,
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:16, fontWeight:700, color:pillText,
  }, children:'fp' }});

  const el = { type:'div', props:{ style:{ width:QW, height:QH, background:bg, display:'flex', position:'relative', fontFamily:'Inter' }, children }};

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
  const ext = fmt === 'reel' ? '.mp4' : '.png';
  const captionFile = output.filename.replace(ext, '-caption.txt');
  writeFileSync(join(outDir, captionFile), script.caption);
  console.log(`  ✓ Caption: ${captionFile}`);

  // Format label for log
  const formatLabel = fmt === 'carousel' ? 'Carousel' : fmt === 'quote' ? 'Quote' : 'Reel';
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
  const caption = saveOutput(script, output, topic);

  console.log('\n═══════════════════════════════════════');
  console.log('✅ LISTO PARA PUBLICAR');
  const fmt = output.format || 'reel';
  if (fmt === 'carousel') {
    const relDir = 'Contenido_IG/carousels';
    console.log(`  🎨 Carousel: ${output.files.length} slides en ${relDir}/`);
    output.files.forEach(f => console.log(`     ${f}`));
    console.log(`  📝 Caption: ${relDir}/${caption}`);
  } else if (fmt === 'quote') {
    console.log(`  💬 Quote: Contenido_IG/quotes/${output.filename}`);
    console.log(`  📝 Caption: Contenido_IG/quotes/${caption}`);
  } else {
    console.log(`  📹 Video: Contenido_IG/reels/${output.filename}`);
    console.log(`  🖼️  Portada: Contenido_IG/reels/${output.coverFilename}`);
    console.log(`  📝 Caption: Contenido_IG/reels/${caption}`);
  }
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
