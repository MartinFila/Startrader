import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pubDir = join(dirname(__dirname), 'Contenido_IG');

const fontBold = readFileSync(join(__dirname, 'fonts/Inter-Bold.ttf'));
const fontMedium = readFileSync(join(__dirname, 'fonts/Inter-Medium.ttf'));
const fontRegular = readFileSync(join(__dirname, 'fonts/Inter-Regular.ttf'));
const fonts = [
  { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  { name: 'Inter', data: fontMedium, weight: 500, style: 'normal' },
  { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
];

async function render(el, w, h, filepath) {
  const svg = await satori(el, { width: w, height: h, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
  writeFileSync(filepath, png);
  console.log(`  ✓ ${filepath.split('/').pop()}`);
}

// Brand colors
const C = {
  cream: '#faf6f1',
  red: '#dc2626',
  dark: '#1c1917',
  muted: '#78716c',
  light: '#a89880',
  bar: '#e7e5e4',
};

async function main() {
  // ═══ LOGO (profile picture 1080x1080) ═══
  console.log('\n📌 Logo:');

  // Main logo - circular red with fp
  await render({
    type: 'div', props: { style: {
      width: 1080, height: 1080, background: C.cream,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter',
    }, children: [
      { type: 'div', props: { style: {
        width: 800, height: 800, borderRadius: 400, background: C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }, children: [
        { type: 'div', props: { style: { fontSize: 380, fontWeight: 700, color: '#fff', letterSpacing: -15 }, children: 'fp' } },
      ] } },
    ] },
  }, 1080, 1080, join(pubDir, 'logo', 'logo-finanzas-pop.png'));

  // Dark version
  await render({
    type: 'div', props: { style: {
      width: 1080, height: 1080, background: C.dark,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter',
    }, children: [
      { type: 'div', props: { style: {
        width: 800, height: 800, borderRadius: 400, background: C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }, children: [
        { type: 'div', props: { style: { fontSize: 380, fontWeight: 700, color: '#fff', letterSpacing: -15 }, children: 'fp' } },
      ] } },
    ] },
  }, 1080, 1080, join(pubDir, 'logo', 'logo-finanzas-pop-dark.png'));

  // ═══ PORTADAS DE REELS (1080x1920, lo que se ve como thumbnail) ═══
  console.log('\n🖼️  Portadas:');

  const portadas = [
    { file: 'portada-1-8percent.png', num: '8.8%', text: 'de los mexicanos invierte', sub: '¿Eres del 91.2%?' },
    { file: 'portada-2-inflacion.png', num: '6.2%', text: 'subió la inflación en alimentos', sub: 'Tu sueldo sigue igual' },
    { file: 'portada-3-tasas.png', num: '14.5%', text: 'paga Nu México', sub: '¿Dónde pones tu dinero?' },
    { file: 'portada-4-buffett.png', num: '"', text: 'No ahorres lo que queda después de gastar', sub: '— Warren Buffett' },
    { file: 'portada-5-8cada100.png', num: '8/100', text: 'mexicanos invierte', sub: 'Los otros 92 pierden dinero' },
  ];

  for (const p of portadas) {
    await render({
      type: 'div', props: { style: {
        width: 1080, height: 1920, background: C.cream,
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter',
        padding: '120px 100px',
      }, children: [
        // Logo top
        { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 14 }, children: [
          { type: 'div', props: { style: {
            width: 48, height: 48, borderRadius: 24, background: C.red,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff',
          }, children: 'fp' } },
          { type: 'div', props: { style: { fontSize: 22, fontWeight: 500, color: C.light }, children: 'finanzas.pop' } },
        ] } },
        // Content centered — must be in the middle for IG thumbnail crop
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, textAlign: 'center' }, children: [
          { type: 'div', props: { style: { fontSize: p.num.length > 4 ? 100 : 150, fontWeight: 700, color: C.red, lineHeight: 0.9 }, children: p.num } },
          { type: 'div', props: { style: { fontSize: 44, fontWeight: 700, color: C.dark, marginTop: 30, lineHeight: 1.25 }, children: p.text } },
          { type: 'div', props: { style: { fontSize: 34, fontWeight: 400, color: C.muted, marginTop: 16, lineHeight: 1.3 }, children: p.sub } },
        ] } },
        // Footer
        { type: 'div', props: { style: { display: 'flex', justifyContent: 'flex-end' }, children: [
          { type: 'div', props: { style: { fontSize: 22, color: C.red, fontWeight: 700 }, children: '@finanzas.pop' } },
        ] } },
      ] },
    }, 1080, 1920, join(pubDir, 'portadas', p.file));
  }

  // ═══ COPIAR REELS ═══
  console.log('\n🎬 Reels:');
  const reels = [
    'reel-stock-8percent.mp4',
    'reel-8-percent.mp4',
    'reel-inflacion.mp4',
    'reel-tasas.mp4',
    'reel-buffett.mp4',
  ];
  for (const r of reels) {
    const src = join(__dirname, 'posts', r);
    const dst = join(pubDir, 'reels', r);
    copyFileSync(src, dst);
    console.log(`  ✓ ${r}`);
  }

  // ═══ COPIES (txt files with captions) ═══
  console.log('\n📝 Copies:');

  const copies = [
    { file: 'copy-1-stock-8percent.txt', text: `Solo el 8.8% de los mexicanos invierte en acciones o crypto.

¿Eres parte del 91.2%?

La mayoría deja su dinero en una cuenta que paga ~1%. La inflación es 4.6%. Cada año que no inviertes, tu dinero vale menos.

No necesitas ser experto. Necesitas empezar.

Guarda este post y envíaselo a alguien que necesite verlo 👇

Fuente: ENIF 2024, INEGI

#finanzaspersonales #dinero #inversiones #educacionfinanciera #ahorro #inflacion #mexico` },
    { file: 'copy-2-inflacion.txt', text: `Lo que costaba $1,000 en el super hace un año, hoy cuesta $1,062.

Inflación en alimentos: 6.2%. Tu sueldo sigue igual.

Si tu dinero está en una cuenta que paga menos que eso, estás perdiendo poder adquisitivo cada mes.

Fuente: INEGI, Marzo 2026

#inflacion #finanzaspersonales #dinero #mexico #ahorro #educacionfinanciera` },
    { file: 'copy-3-tasas.txt', text: `¿Dónde conviene poner tu dinero hoy?

Nu México: 14.5%
Hey Banco: 13.0%
Mercado Pago: 11.8%
CETES 28 días: 6.8%
Banco normal: ~1%

Si tu tasa es menor que la inflación (4.6%), estás perdiendo dinero cada día. Mover tu dinero toma 5 minutos.

Guarda este post 💾

#finanzaspersonales #inversiones #cetes #dinero #ahorro #mexico` },
    { file: 'copy-4-buffett.txt', text: `"No ahorres lo que queda después de gastar. Gasta lo que queda después de ahorrar." — Warren Buffett

Traducido: el día que te cae el sueldo, transfiere el 20% a otra cuenta ANTES de gastar.

$15,000/mes → $3,000 a ahorro → en un año $36,000 sin esfuerzo.

El truco no es ganar más. Es ordenar lo que ya tienes.

#warrenbuffett #finanzaspersonales #ahorro #dinero #educacionfinanciera` },
    { file: 'copy-5-8cada100.txt', text: `8 de cada 100 mexicanos invierte. Los otros 92 dejan su dinero perder valor.

La inflación es 4.6%. Si tu cuenta paga 1%, pierdes 3.6% al año.

No necesitas ser experto para empezar.

Fuente: ENIF 2024, INEGI

#finanzaspersonales #inversiones #dinero #mexico #educacionfinanciera #ahorro` },
  ];

  for (const c of copies) {
    writeFileSync(join(pubDir, 'reels', c.file), c.text);
    console.log(`  ✓ ${c.file}`);
  }

  console.log('\n✅ Todo listo en /publicar/');
  console.log('   /logo/ — 2 versiones del logo');
  console.log('   /portadas/ — 5 portadas para los Reels');
  console.log('   /reels/ — 5 videos + 5 copies con hashtags');
}

main().catch(console.error);
