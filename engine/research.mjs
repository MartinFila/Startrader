#!/usr/bin/env node

/**
 * research.mjs — Research estratégico en dos niveles temporales
 *
 * Uso:
 *   node engine/research.mjs --weekly    → Compara nuestro contenido vs competencia (últimos 7 días)
 *   node engine/research.mjs --monthly   → Retrospectiva estratégica (últimos 30 días)
 *
 * Output: docs/research-proposals/YYYY-MM-DD-{weekly|monthly}.md
 * Requiere aprobación manual de Martín antes de aplicar cambios al engine.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const TODAY = new Date().toISOString().split('T')[0];
const PROPOSALS_DIR = join(ROOT, 'docs', 'research-proposals');

// ── Auth helpers ──────────────────────────────────────────────────────────────

function readEnvKey(key) {
  try {
    const env = readFileSync(join(ROOT, '.env'), 'utf-8');
    const match = env.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : '';
  } catch { return ''; }
}

const GEMINI_KEY      = process.env.GEMINI_API_KEY      || readEnvKey('GEMINI_API_KEY');
const METRICOOL_TOKEN = process.env.METRICOOL_API_KEY || readEnvKey('METRICOOL_API_KEY');
const APIFY_TOKEN     = process.env.APIFY_TOKEN       || readEnvKey('APIFY_TOKEN');

// ── Metricool API ─────────────────────────────────────────────────────────────

async function getOurPosts(daysBack) {
  if (!METRICOOL_TOKEN) {
    console.log('  ⚠ METRICOOL_API_KEY no encontrada, saltando datos propios');
    return [];
  }

  const end   = new Date();
  const start = new Date(end - daysBack * 86400000);
  const toYMD = d => d.toISOString().slice(0, 10).replace(/-/g, '');
  const BASE = 'https://app.metricool.com/api';
  const h = `hash=${METRICOOL_TOKEN}`;

  const [postsRes, reelsRes] = await Promise.all([
    fetch(`${BASE}/stats/instagram/posts?start=${toYMD(start)}&end=${toYMD(end)}&sortcolumn=engagement&${h}`),
    fetch(`${BASE}/stats/instagram/reels?start=${toYMD(start)}&end=${toYMD(end)}&sortcolumn=engagement&${h}`),
  ]);

  const posts = postsRes.ok ? (await postsRes.json())?.data || [] : [];
  const reels = reelsRes.ok ? (await reelsRes.json())?.data || [] : [];

  return [...posts, ...reels].map(p => ({
    id:         p.id,
    type:       p.type || (reels.includes(p) ? 'REEL' : 'POST'),
    caption:    (p.text || p.caption || '').slice(0, 120),
    publishedAt: p.published || p.publishedAt || '',
    impressions: p.impressions || 0,
    reach:       p.reach       || 0,
    likes:       p.likes       || 0,
    comments:    p.comments    || 0,
    saves:       p.saved       || p.saves || 0,
    engagement:  p.engagement  || (p.likes + p.comments + (p.saved || 0)),
  }));
}

// ── Apify — competitor posts ─────────────────────────────────────────────────

async function getCompetitorPosts() {
  if (!APIFY_TOKEN) {
    console.log('  ⚠ APIFY_TOKEN no encontrada, saltando datos de competidores');
    return [];
  }

  const accounts = [
    'finanzas.conproposito', 'el.inversor.eficiente', 'invierteconpepe_',
    'pequenocerdocapitalista', 'mispropiasfinanzasmex', 'soymacariva',
  ];

  console.log('  ⏳ Scrapeando competidores con Apify...');
  const startRes = await fetch('https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${APIFY_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: accounts, resultsLimit: 15 }),
  });

  if (!startRes.ok) { console.log('  ⚠ Apify start falló'); return []; }

  const runData = await startRes.json();
  const runId   = runData.data?.id;
  const dsId    = runData.data?.defaultDatasetId;
  if (!runId) { console.log('  ⚠ Apify sin runId'); return []; }

  // Poll until done (max 2 min)
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 10_000));
    const s = await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)).json();
    const status = s.data?.status;
    process.stdout.write(`\r  ⏳ Apify: ${status}...`);
    if (status === 'SUCCEEDED') break;
    if (['FAILED','ABORTED','TIMED-OUT'].includes(status)) { console.log(`\n  ⚠ Apify: ${status}`); return []; }
  }
  console.log('');

  const items = await (await fetch(`https://api.apify.com/v2/datasets/${dsId}/items?token=${APIFY_TOKEN}`)).json();
  if (!Array.isArray(items)) return [];

  return items.map(p => ({
    account:    p.ownerUsername || '',
    type:       p.type || 'POST',
    caption:    (p.caption || '').slice(0, 120),
    likes:      p.likesCount    || 0,
    comments:   p.commentsCount || 0,
    engagement: (p.likesCount || 0) + (p.commentsCount || 0),
  })).sort((a, b) => b.engagement - a.engagement).slice(0, 20);
}

// ── Gemini ────────────────────────────────────────────────────────────────────

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 3000 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Weekly Research ───────────────────────────────────────────────────────────

async function runWeekly() {
  console.log('\n📊 RESEARCH SEMANAL — últimos 7 días');
  console.log('════════════════════════════════════');

  console.log('\n1️⃣  Obteniendo nuestro performance (Metricool)...');
  const ourPosts = await getOurPosts(7);
  console.log(`  ✓ ${ourPosts.length} posts propios encontrados`);

  console.log('\n2️⃣  Obteniendo top posts de competidores (Apify)...');
  const competitorPosts = await getCompetitorPosts();
  console.log(`  ✓ ${competitorPosts.length} posts de competidores encontrados`);

  console.log('\n3️⃣  Analizando con Gemini...');

  const ourSummary = ourPosts.length > 0
    ? ourPosts.map((p, i) =>
        `${i+1}. [${p.type}] "${p.caption.slice(0,80)}" — eng:${p.engagement} saves:${p.saves} reach:${p.reach}`
      ).join('\n')
    : '(sin datos de Metricool esta semana)';

  const competitorSummary = competitorPosts.length > 0
    ? competitorPosts.map((p, i) =>
        `${i+1}. @${p.account} [${p.type}] "${p.caption.slice(0,80)}" — eng:${p.engagement}`
      ).join('\n')
    : '(sin datos de Apify esta semana)';

  const prompt = `Eres analista de contenido para @finanzas.pop, cuenta de finanzas personales para México en Instagram.

NUESTROS POSTS ESTA SEMANA (ordenados por engagement):
${ourSummary}

TOP POSTS DE COMPETIDORES ESTA SEMANA:
${competitorSummary}

Analiza ambos datasets y genera una propuesta de mejora táctica para la próxima semana.
Considera TANTO el formato (reel/carousel/quote) COMO el tipo de contenido (estadísticas, comparativas, noticias, consejos, cultura pop).

Estructura tu respuesta en Markdown con estas secciones:
1. **Qué funcionó bien en nuestro contenido** (con datos concretos)
2. **Qué no funcionó** (con hipótesis de por qué)
3. **Qué está funcionando en la competencia que nosotros no estamos haciendo**
4. **Propuestas concretas para la próxima semana** (máx 5, accionables)
5. **Ajustes sugeridos al mix de formatos** (actualmente: 55% reel estático, 15% reel-video, 20% carousel, 10% quote)

Sé específico, usa los datos. Si los datos son escasos, indícalo y da recomendaciones basadas en los patrones disponibles.`;

  const analysis = await callGemini(prompt);

  const report = `# Research Semanal — ${TODAY}

> Generado automáticamente. **Requiere revisión y aprobación de Martín antes de aplicar cambios.**
> Para aplicar: edita engine/run.mjs manualmente según las propuestas que apruebes.

---

## Datos analizados

**Nuestros posts (últimos 7 días):** ${ourPosts.length} posts
**Posts de competidores:** ${competitorPosts.length} posts

---

${analysis}

---

*Generado por engine/research.mjs — ${new Date().toISOString()}*
`;

  mkdirSync(PROPOSALS_DIR, { recursive: true });
  const filename = join(PROPOSALS_DIR, `${TODAY}-weekly.md`);
  writeFileSync(filename, report);
  console.log(`\n✅ Propuesta guardada: docs/research-proposals/${TODAY}-weekly.md`);
  console.log('   Revísala y aplica manualmente los cambios que apruebes.\n');
}

// ── Monthly Research ──────────────────────────────────────────────────────────

async function runMonthly() {
  console.log('\n🔭 RESEARCH MENSUAL — últimos 30 días');
  console.log('═══════════════════════════════════════');

  console.log('\n1️⃣  Obteniendo nuestro performance del mes (Metricool)...');
  const ourPosts = await getOurPosts(30);
  console.log(`  ✓ ${ourPosts.length} posts propios encontrados`);

  console.log('\n2️⃣  Obteniendo top posts de competidores...');
  const competitorPosts = await getCompetitorPosts();
  console.log(`  ✓ ${competitorPosts.length} posts de competidores encontrados`);

  // Load previous monthly proposals for trend comparison
  let previousProposals = '';
  try {
    const files = existsSync(PROPOSALS_DIR)
      ? (await import('fs')).readdirSync(PROPOSALS_DIR).filter(f => f.includes('monthly')).sort().slice(-3)
      : [];
    previousProposals = files.map(f => {
      const content = readFileSync(join(PROPOSALS_DIR, f), 'utf-8');
      return `### ${f}\n${content.slice(0, 800)}`;
    }).join('\n\n');
  } catch {}

  console.log('\n3️⃣  Análisis estratégico con Gemini...');

  // Aggregate our metrics by format type
  const byType = {};
  for (const p of ourPosts) {
    if (!byType[p.type]) byType[p.type] = { count: 0, totalEng: 0, totalSaves: 0, totalReach: 0 };
    byType[p.type].count++;
    byType[p.type].totalEng   += p.engagement;
    byType[p.type].totalSaves += p.saves;
    byType[p.type].totalReach += p.reach;
  }
  const ourMetricsSummary = Object.entries(byType).map(([type, m]) =>
    `- ${type}: ${m.count} posts, eng promedio ${Math.round(m.totalEng/m.count)}, saves promedio ${Math.round(m.totalSaves/m.count)}, reach promedio ${Math.round(m.totalReach/m.count)}`
  ).join('\n') || '(sin datos de Metricool)';

  // Top competitor accounts by engagement
  const byAccount = {};
  for (const p of competitorPosts) {
    if (!byAccount[p.account]) byAccount[p.account] = { count: 0, totalEng: 0 };
    byAccount[p.account].count++;
    byAccount[p.account].totalEng += p.engagement;
  }
  const competitorSummary = Object.entries(byAccount)
    .map(([acc, m]) => `- @${acc}: ${m.count} posts analizados, eng promedio ${Math.round(m.totalEng/m.count)}`)
    .join('\n') || '(sin datos de Apify)';

  const prompt = `Eres consultor estratégico de contenido para @finanzas.pop, cuenta faceless de finanzas personales para México en Instagram.

La cuenta tiene estas características:
- Paleta: crema (#faf6f1), rojo (#dc2626), dark (#1c1917)
- Estilo: "Escuela accesible/educativa" — datos concretos, tono de amigo inteligente, ASPIRACIONAL
- Target: mexicanos 20-35 que quieren hacer crecer su dinero (CETES, Nu, GBM, inversión)
- Cuenta nueva — objetivo: crecer rápido con contenido de alta calidad

NUESTRO PERFORMANCE ESTE MES (por tipo de formato):
${ourMetricsSummary}

PERFORMANCE DE COMPETIDORES:
${competitorSummary}

${previousProposals ? `PROPUESTAS DE MESES ANTERIORES (para ver evolución):\n${previousProposals}` : ''}

Genera una retrospectiva estratégica mensual. NO hagas tweaks técnicos — piensa en dirección y posicionamiento.

Estructura en Markdown:
1. **Estado de la cuenta este mes** (qué está funcionando, qué no)
2. **Análisis del nicho** (movimientos importantes en competidores, tendencias emergentes)
3. **¿Sigue siendo correcta nuestra estrategia?** (posicionamiento, diferenciación)
4. **Oportunidades que nadie está aprovechando** en el nicho México/LATAM
5. **Recomendaciones estratégicas** (máx 3, de alto impacto, con justificación)
6. **Una pregunta crítica** que Martín debería responder para el próximo mes

Sé honesto. Si los datos son limitados, dilo y razona desde primeros principios.`;

  const analysis = await callGemini(prompt);

  const report = `# Research Mensual — ${TODAY}

> Generado automáticamente. **Requiere revisión y aprobación de Martín antes de aplicar cambios.**
> Este es un análisis estratégico, no un ajuste técnico. Los cambios van a la dirección de la cuenta.

---

## Métricas del mes

**Nuestros posts:** ${ourPosts.length} publicaciones
**Mejor formato propio:**
${ourMetricsSummary}

**Competidores analizados:**
${competitorSummary}

---

${analysis}

---

*Generado por engine/research.mjs — ${new Date().toISOString()}*
`;

  mkdirSync(PROPOSALS_DIR, { recursive: true });
  const filename = join(PROPOSALS_DIR, `${TODAY}-monthly.md`);
  writeFileSync(filename, report);
  console.log(`\n✅ Retrospectiva guardada: docs/research-proposals/${TODAY}-monthly.md`);
  console.log('   Revísala y decide qué ajustes estratégicos aplicar.\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const mode = process.argv.find(a => a === '--weekly' || a === '--monthly');

if (!mode) {
  console.error('Uso: node engine/research.mjs --weekly | --monthly');
  process.exit(1);
}

if (!GEMINI_KEY) {
  console.error('✗ GEMINI_API_KEY no encontrada en .env');
  process.exit(1);
}

if (mode === '--weekly') {
  runWeekly().catch(err => { console.error('Error:', err.message); process.exit(1); });
} else {
  runMonthly().catch(err => { console.error('Error:', err.message); process.exit(1); });
}
