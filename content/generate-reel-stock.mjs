import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const framesDir = join(__dirname, 'frames-stock');
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

const W = 1080, H = 1920, FPS = 10;
const TOTAL_SEC = 18;

function easeOutQuart(t) { return 1 - Math.pow(1 - Math.min(Math.max(t,0),1), 4); }

function buildFrame(frame) {
  const sec = frame / FPS;
  const children = [];

  // Semi-transparent dark overlay at bottom for readability
  const overlay = {
    type: 'div', props: { style: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: '70%',
      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
    } },
  };

  // Logo top left
  const logo = {
    type: 'div', props: { style: {
      position: 'absolute', top: 60, left: 60,
      display: 'flex', alignItems: 'center', gap: 14,
    }, children: [
      { type: 'div', props: { style: {
        width: 44, height: 44, borderRadius: 22, background: '#dc2626',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 700, color: '#fff',
      }, children: 'fp' } },
      { type: 'div', props: { style: { fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }, children: 'finanzas.pop' } },
    ] },
  };

  // Source footer
  const footer = {
    type: 'div', props: { style: {
      position: 'absolute', bottom: 40, left: 60, right: 60,
      display: 'flex', justifyContent: 'space-between',
    }, children: [
      { type: 'div', props: { style: { fontSize: 18, color: 'rgba(255,255,255,0.3)' }, children: 'Fuente: ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 18, color: '#dc2626', fontWeight: 700 }, children: '@finanzas.pop' } },
    ] },
  };

  children.push(overlay);
  children.push(logo);

  // Content area - positioned at bottom over the gradient
  const contentStyle = {
    position: 'absolute', bottom: 120, left: 60, right: 60,
    display: 'flex', flexDirection: 'column',
  };

  if (sec < 3) {
    // HOOK
    const fade = easeOutQuart((sec/3)*2);
    children.push({
      type: 'div', props: { style: contentStyle, children: [
        { type: 'div', props: { style: { fontSize: 62, fontWeight: 700, color: '#fff', lineHeight: 1.2, opacity: fade }, children: '¿Sabías que solo' } },
        { type: 'div', props: { style: { fontSize: 62, fontWeight: 700, color: '#dc2626', lineHeight: 1.2, marginTop: 8, opacity: fade }, children: '8 de cada 100' } },
        { type: 'div', props: { style: { fontSize: 62, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginTop: 8, opacity: fade }, children: 'mexicanos invierte?' } },
      ] },
    });
  } else if (sec < 7) {
    // BIG NUMBER
    const t = (sec-3)/4;
    const numFade = easeOutQuart(t*3);
    const barW = easeOutQuart(Math.max(0,(t-0.2)*1.5)) * 8.8;
    children.push({
      type: 'div', props: { style: contentStyle, children: [
        { type: 'div', props: { style: { fontSize: 180, fontWeight: 700, color: '#dc2626', lineHeight: 0.9, opacity: numFade }, children: '8.8%' } },
        { type: 'div', props: { style: { fontSize: 40, fontWeight: 500, color: '#fff', marginTop: 24, opacity: numFade }, children: 'de los mexicanos invierte en acciones o crypto.' } },
        { type: 'div', props: { style: { width: '100%', height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, marginTop: 40, display: 'flex' }, children: [
          { type: 'div', props: { style: { width: `${barW}%`, height: '100%', background: '#dc2626', borderRadius: 4 } } },
        ] } },
        { type: 'div', props: { style: { display: 'flex', justifyContent: 'space-between', marginTop: 12, opacity: easeOutQuart(Math.max(0,(t-0.5)*3)) }, children: [
          { type: 'div', props: { style: { fontSize: 24, color: '#dc2626', fontWeight: 700 }, children: '8.8% invierte' } },
          { type: 'div', props: { style: { fontSize: 24, color: 'rgba(255,255,255,0.4)' }, children: '91.2% no' } },
        ] } },
      ] },
    });
  } else if (sec < 12) {
    // WHAT IT MEANS
    const t = (sec-7)/5;
    const f1 = easeOutQuart(t*2);
    const f2 = easeOutQuart(Math.max(0,(t-0.3)*2));
    children.push({
      type: 'div', props: { style: contentStyle, children: [
        { type: 'div', props: { style: { fontSize: 46, fontWeight: 700, color: '#fff', lineHeight: 1.3, opacity: f1 }, children: 'La mayoría deja su dinero en una cuenta que paga ~1%.' } },
        { type: 'div', props: { style: { fontSize: 46, fontWeight: 700, color: '#dc2626', lineHeight: 1.3, marginTop: 30, opacity: f2 }, children: 'La inflación es 4.6%.' } },
        { type: 'div', props: { style: { fontSize: 38, fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3, marginTop: 30, opacity: f2 }, children: 'Cada año que no inviertes, tu dinero vale 3.6% menos.' } },
      ] },
    });
  } else {
    // CTA
    const t = (sec-12)/(TOTAL_SEC-12);
    const fade = easeOutQuart(t*2.5);
    children.push({
      type: 'div', props: { style: { ...contentStyle, alignItems: 'center' }, children: [
        { type: 'div', props: { style: { fontSize: 52, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.25, opacity: fade }, children: 'No necesitas ser experto para empezar.' } },
        { type: 'div', props: { style: { fontSize: 34, fontWeight: 500, color: '#dc2626', marginTop: 30, textAlign: 'center', opacity: fade }, children: 'Sígueme → @finanzas.pop' } },
      ] },
    });
  }

  children.push(footer);

  return {
    type: 'div', props: { style: {
      width: W, height: H, display: 'flex', position: 'relative',
      fontFamily: 'Inter',
      // Transparent background - will be composited over video
      background: 'transparent',
    }, children },
  };
}

async function main() {
  const totalFrames = FPS * TOTAL_SEC;
  console.log(`Generating ${totalFrames} text overlay frames...`);

  for (let f = 0; f < totalFrames; f++) {
    const el = buildFrame(f);
    const svg = await satori(el, { width: W, height: H, fonts });
    // Render with transparency
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: W },
      background: 'rgba(0,0,0,0)',
    });
    writeFileSync(join(framesDir, `f_${String(f).padStart(5,'0')}.png`), resvg.render().asPng());
    if (f % 10 === 0) process.stdout.write(`\r  Frame ${f}/${totalFrames}`);
  }

  console.log('\nCompositing text over stock footage...');

  const outPath = join(__dirname, 'posts', 'reel-stock-8percent.mp4');

  // Composite: stock footage background + text overlay frames
  execSync(`ffmpeg -y \
    -i /tmp/stock-bg.mp4 \
    -framerate ${FPS} -i "${framesDir}/f_%05d.png" \
    -filter_complex "[0:v]scale=1080:1920[bg];[bg][1:v]overlay=0:0:format=auto" \
    -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 \
    -t ${TOTAL_SEC} "${outPath}" 2>&1`);

  console.log(`Done! ${outPath}`);
  execSync(`rm -rf "${framesDir}"`);
}

main().catch(console.error);
