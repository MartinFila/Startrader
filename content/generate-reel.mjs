import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const framesDir = join(__dirname, 'frames');
if (existsSync(framesDir)) execSync(`rm -rf ${framesDir}`);
mkdirSync(framesDir, { recursive: true });

const fontBold = readFileSync(join(__dirname, 'fonts/Inter-Bold.ttf'));
const fontMedium = readFileSync(join(__dirname, 'fonts/Inter-Medium.ttf'));
const fontRegular = readFileSync(join(__dirname, 'fonts/Inter-Regular.ttf'));
const fonts = [
  { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  { name: 'Inter', data: fontMedium, weight: 500, style: 'normal' },
  { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
];

const W = 1080;
const H = 1920;
const FPS = 10; // lower fps, faster render, still smooth enough
const TOTAL_SECONDS = 18;
const TOTAL_FRAMES = FPS * TOTAL_SECONDS;

const C = {
  bg: '#faf6f1',
  bgDark: '#1c1917',
  accent: '#dc2626',
  bar: '#e7e5e4',
  text: '#1c1917',
  textLight: '#78716c',
  textOnDark: '#faf6f1',
};

function easeOutQuart(t) { return 1 - Math.pow(1 - Math.min(Math.max(t,0),1), 4); }
function easeInOutCubic(t) { t = Math.min(Math.max(t,0),1); return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

function buildFrame(frame) {
  const sec = frame / FPS;
  const children = [];
  let bg = C.bg;

  if (sec < 3) {
    // HOOK
    const t = sec / 3;
    const fade = easeOutQuart(t * 2);
    children.push({
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 80px' },
        children: [
          { type: 'div', props: { style: { fontSize: 72, fontWeight: 700, color: C.text, lineHeight: 1.2, opacity: fade }, children: '¿Sabías que solo' } },
          { type: 'div', props: { style: { fontSize: 72, fontWeight: 700, color: C.accent, lineHeight: 1.2, marginTop: 10, opacity: fade }, children: '8 de cada 100' } },
          { type: 'div', props: { style: { fontSize: 72, fontWeight: 700, color: C.text, lineHeight: 1.2, marginTop: 10, opacity: fade }, children: 'mexicanos invierte?' } },
        ],
      },
    });
  } else if (sec < 7) {
    // BIG STAT
    const t = (sec - 3) / 4;
    const numFade = easeOutQuart(t * 3);
    const barW = easeInOutCubic(Math.max(0, (t - 0.2) * 1.5)) * 8.8;
    const labelFade = easeOutQuart(Math.max(0, (t - 0.5) * 3));
    children.push({
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 80px' },
        children: [
          { type: 'div', props: { style: { fontSize: 220, fontWeight: 700, color: C.accent, lineHeight: 1, opacity: numFade }, children: '8.8%' } },
          { type: 'div', props: { style: { fontSize: 42, fontWeight: 500, color: C.text, marginTop: 30, opacity: numFade }, children: 'de los mexicanos invierte' } },
          { type: 'div', props: { style: { fontSize: 42, fontWeight: 500, color: C.text, opacity: numFade }, children: 'en acciones o crypto.' } },
          { type: 'div', props: { style: { width: '100%', height: 60, background: C.bar, borderRadius: 30, marginTop: 60, display: 'flex' }, children: [
            { type: 'div', props: { style: { width: `${barW}%`, height: '100%', background: C.accent, borderRadius: 30 } } },
          ] } },
          { type: 'div', props: { style: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 15, opacity: labelFade }, children: [
            { type: 'div', props: { style: { fontSize: 28, color: C.accent, fontWeight: 700 }, children: '8.8% invierte' } },
            { type: 'div', props: { style: { fontSize: 28, color: C.textLight, fontWeight: 500 }, children: '91.2% no' } },
          ] } },
          { type: 'div', props: { style: { fontSize: 24, color: C.textLight, marginTop: 50, opacity: labelFade }, children: 'Fuente: ENIF 2024 — INEGI' } },
        ],
      },
    });
  } else if (sec < 11) {
    // 100 DOTS
    const t = (sec - 7) / 4;
    const dots = [];
    for (let i = 0; i < 100; i++) {
      const isRed = i < 9;
      const delay = i * 0.005;
      const op = Math.min(1, Math.max(0, (t - delay) * 5));
      dots.push({ type: 'div', props: { style: { width: 70, height: 70, borderRadius: 35, background: isRed ? C.accent : C.bar, margin: 6, opacity: op } } });
    }
    const legendFade = easeOutQuart(Math.max(0, (t - 0.4) * 2));
    children.push({
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 60px' },
        children: [
          { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.text, marginBottom: 40, opacity: easeOutQuart(t * 2) }, children: 'De cada 100 personas:' } },
          { type: 'div', props: { style: { display: 'flex', flexWrap: 'wrap', width: '100%' }, children: dots } },
          { type: 'div', props: { style: { display: 'flex', marginTop: 40, gap: 40, opacity: legendFade }, children: [
            { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [
              { type: 'div', props: { style: { width: 24, height: 24, borderRadius: 12, background: C.accent } } },
              { type: 'div', props: { style: { fontSize: 30, fontWeight: 500, color: C.text }, children: '9 invierten' } },
            ] } },
            { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [
              { type: 'div', props: { style: { width: 24, height: 24, borderRadius: 12, background: C.bar } } },
              { type: 'div', props: { style: { fontSize: 30, fontWeight: 500, color: C.textLight }, children: '91 no' } },
            ] } },
          ] } },
        ],
      },
    });
  } else if (sec < 15) {
    // WHAT IT MEANS
    const t = (sec - 11) / 4;
    const f1 = easeOutQuart(t * 2);
    const f2 = easeOutQuart(Math.max(0, (t - 0.3) * 2));
    children.push({
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 80px' },
        children: [
          { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.text, lineHeight: 1.3, opacity: f1 }, children: 'La mayoría deja su dinero en una cuenta que paga ~1%.' } },
          { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.accent, lineHeight: 1.3, marginTop: 40, opacity: f2 }, children: 'La inflación es 4.6%.' } },
          { type: 'div', props: { style: { fontSize: 42, fontWeight: 400, color: C.textLight, lineHeight: 1.4, marginTop: 40, opacity: f2 }, children: 'Cada año que no inviertes, tu dinero vale 3.6% menos.' } },
        ],
      },
    });
  } else {
    // CTA
    bg = C.bgDark;
    const t = (sec - 15) / 3;
    const fade = easeOutQuart(t * 2.5);
    children.push({
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '0 80px', opacity: fade },
        children: [
          { type: 'div', props: { style: { fontSize: 56, fontWeight: 700, color: C.textOnDark, textAlign: 'center', lineHeight: 1.3 }, children: 'No necesitas ser experto para empezar.' } },
          { type: 'div', props: { style: { fontSize: 36, fontWeight: 500, color: C.accent, marginTop: 50, textAlign: 'center' }, children: 'Sígueme para aprender a hacer que tu dinero trabaje.' } },
        ],
      },
    });
  }

  return { type: 'div', props: { style: { width: W, height: H, background: bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter' }, children } };
}

async function main() {
  console.log(`Generating ${TOTAL_FRAMES} frames (${TOTAL_SECONDS}s at ${FPS}fps)...`);

  // Generate ALL frames sequentially numbered
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const element = buildFrame(f);
    const svg = await satori(element, { width: W, height: H, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
    const png = resvg.render().asPng();
    writeFileSync(join(framesDir, `frame_${String(f).padStart(5, '0')}.png`), png);
    if (f % 10 === 0) process.stdout.write(`\r  Frame ${f}/${TOTAL_FRAMES}`);
  }

  console.log('\nAssembling video...');
  const outPath = join(__dirname, 'posts', 'reel-8-percent.mp4');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 "${outPath}" 2>&1`);

  console.log(`Done! ${outPath}`);
  execSync(`rm -rf "${framesDir}"`);
}

main().catch(console.error);
