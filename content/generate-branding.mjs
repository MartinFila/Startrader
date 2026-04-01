import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontBold = readFileSync(join(__dirname, 'fonts/Inter-Bold.ttf'));
const fontMedium = readFileSync(join(__dirname, 'fonts/Inter-Medium.ttf'));
const fontRegular = readFileSync(join(__dirname, 'fonts/Inter-Regular.ttf'));
const fonts = [
  { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  { name: 'Inter', data: fontMedium, weight: 500, style: 'normal' },
  { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
];

const W = 1080, H = 1920;

async function render(el, w, h, file) {
  const svg = await satori(el, { width: w, height: h, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
  writeFileSync(join(__dirname, 'posts', file), png);
  console.log(`  ${file}`);
}

// ============================================================
// OPTION 1: "Navy Bold" — Navy backgrounds, white text, amber accent
// Based on: Luke's advice (bold colors, recognizable),
// data (blue = trust +18%), competition uses black (we use navy = different)
// ============================================================
const opt1_reel = {
  type: 'div', props: { style: {
    width: W, height: H, background: '#1e293b', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
  }, children: [
    // Logo mark top left
    { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [
      { type: 'div', props: { style: { width: 48, height: 48, borderRadius: 12, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#1e293b' }, children: 'FP' } },
      { type: 'div', props: { style: { fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }, children: 'finanzas.pop' } },
    ] } },
    // Content
    { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }, children: [
      { type: 'div', props: { style: { fontSize: 180, fontWeight: 700, color: '#f59e0b', lineHeight: 0.9 }, children: '8.8%' } },
      { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: '#fff', marginTop: 30, lineHeight: 1.25 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
      { type: 'div', props: { style: { fontSize: 36, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginTop: 25, lineHeight: 1.3 }, children: '¿Eres parte del 91.2% que no lo hace?' } },
      // Bar
      { type: 'div', props: { style: { width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginTop: 50, display: 'flex' }, children: [
        { type: 'div', props: { style: { width: '8.8%', height: '100%', background: '#f59e0b', borderRadius: 4 } } },
      ] } },
    ] } },
    // Footer
    { type: 'div', props: { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.25)' }, children: 'Fuente: ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 20, color: '#f59e0b', fontWeight: 700 }, children: '@finanzas.pop' } },
    ] } },
  ] },
};

const opt1_logo = {
  type: 'div', props: { style: {
    width: 400, height: 400, background: '#1e293b', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter',
  }, children: [
    { type: 'div', props: { style: { width: 120, height: 120, borderRadius: 28, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 700, color: '#1e293b' }, children: 'FP' } },
    { type: 'div', props: { style: { fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 20 }, children: 'finanzas.pop' } },
    { type: 'div', props: { style: { fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 6 }, children: 'Navy + Amber · Bold · Confianza' } },
  ] },
};

// ============================================================
// OPTION 2: "Warm Cream" — Cream background, dark text, red accent
// Based on: 2026 trend (Cloud Dancer), editorial feel,
// DIFFERENT from all finance accounts (they all use dark)
// ============================================================
const opt2_reel = {
  type: 'div', props: { style: {
    width: W, height: H, background: '#faf6f1', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
  }, children: [
    { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [
      { type: 'div', props: { style: { width: 48, height: 48, borderRadius: 24, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }, children: 'fp' } },
      { type: 'div', props: { style: { fontSize: 22, fontWeight: 500, color: '#a89880' }, children: 'finanzas.pop' } },
    ] } },
    { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }, children: [
      { type: 'div', props: { style: { fontSize: 180, fontWeight: 700, color: '#dc2626', lineHeight: 0.9 }, children: '8.8%' } },
      { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: '#1c1917', marginTop: 30, lineHeight: 1.25 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
      { type: 'div', props: { style: { fontSize: 36, fontWeight: 400, color: '#78716c', marginTop: 25, lineHeight: 1.3 }, children: '¿Eres parte del 91.2% que no lo hace?' } },
      { type: 'div', props: { style: { width: '100%', height: 8, background: '#e7e5e4', borderRadius: 4, marginTop: 50, display: 'flex' }, children: [
        { type: 'div', props: { style: { width: '8.8%', height: '100%', background: '#dc2626', borderRadius: 4 } } },
      ] } },
    ] } },
    { type: 'div', props: { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [
      { type: 'div', props: { style: { fontSize: 20, color: '#a89880' }, children: 'Fuente: ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 20, color: '#dc2626', fontWeight: 700 }, children: '@finanzas.pop' } },
    ] } },
  ] },
};

const opt2_logo = {
  type: 'div', props: { style: {
    width: 400, height: 400, background: '#faf6f1', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter',
  }, children: [
    { type: 'div', props: { style: { width: 120, height: 120, borderRadius: 60, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 700, color: '#fff' }, children: 'fp' } },
    { type: 'div', props: { style: { fontSize: 24, fontWeight: 700, color: '#1c1917', marginTop: 20 }, children: 'finanzas.pop' } },
    { type: 'div', props: { style: { fontSize: 14, fontWeight: 400, color: '#a89880', marginTop: 6 }, children: 'Crema + Rojo · Editorial · Diferente' } },
  ] },
};

// ============================================================
// OPTION 3: "Solid Colors" — Rotating solid backgrounds, white text
// Based on: Luke's Opus Reality, Bold Magazine style,
// each post is a different color = fresh feed but recognizable format
// ============================================================
const opt3_reel = {
  type: 'div', props: { style: {
    width: W, height: H, background: '#059669', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
  }, children: [
    { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [
      { type: 'div', props: { style: { width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }, children: 'FP' } },
      { type: 'div', props: { style: { fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }, children: 'finanzas.pop' } },
    ] } },
    { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }, children: [
      { type: 'div', props: { style: { fontSize: 180, fontWeight: 700, color: '#fff', lineHeight: 0.9 }, children: '8.8%' } },
      { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: '#fff', marginTop: 30, lineHeight: 1.25 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
      { type: 'div', props: { style: { fontSize: 36, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 25, lineHeight: 1.3 }, children: '¿Eres parte del 91.2% que no lo hace?' } },
      { type: 'div', props: { style: { width: '100%', height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, marginTop: 50, display: 'flex' }, children: [
        { type: 'div', props: { style: { width: '8.8%', height: '100%', background: '#fff', borderRadius: 4 } } },
      ] } },
    ] } },
    { type: 'div', props: { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.3)' }, children: 'Fuente: ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }, children: '@finanzas.pop' } },
    ] } },
  ] },
};

// Second reel with different color
const opt3_reel2 = JSON.parse(JSON.stringify(opt3_reel));
opt3_reel2.props.style.background = '#1e3a5f';

// Third reel with different color
const opt3_reel3 = JSON.parse(JSON.stringify(opt3_reel));
opt3_reel3.props.style.background = '#c2410c';
// Change content for variety
opt3_reel3.props.children[1].props.children[0].props.children = '6.2%';
opt3_reel3.props.children[1].props.children[1].props.children = 'subió la inflación en alimentos en México.';
opt3_reel3.props.children[1].props.children[2].props.children = 'Tu sueldo es el mismo. Pero todo cuesta más.';

const opt3_logo = {
  type: 'div', props: { style: {
    width: 400, height: 400, background: '#1e293b', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter',
  }, children: [
    { type: 'div', props: { style: { display: 'flex', gap: 8 }, children: [
      { type: 'div', props: { style: { width: 36, height: 36, borderRadius: 8, background: '#059669' } } },
      { type: 'div', props: { style: { width: 36, height: 36, borderRadius: 8, background: '#1e3a5f' } } },
      { type: 'div', props: { style: { width: 36, height: 36, borderRadius: 8, background: '#c2410c' } } },
    ] } },
    { type: 'div', props: { style: { fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 20 }, children: 'finanzas.pop' } },
    { type: 'div', props: { style: { fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 6 }, children: 'Colores sólidos rotativos · Feed colorido' } },
  ] },
};

async function main() {
  mkdirSync(join(__dirname, 'posts'), { recursive: true });
  console.log('Option 1: Navy Bold');
  await render(opt1_logo, 400, 400, 'brand-1-logo.png');
  await render(opt1_reel, W, H, 'brand-1-reel.png');

  console.log('Option 2: Warm Cream');
  await render(opt2_logo, 400, 400, 'brand-2-logo.png');
  await render(opt2_reel, W, H, 'brand-2-reel.png');

  console.log('Option 3: Solid Colors');
  await render(opt3_logo, 400, 400, 'brand-3-logo.png');
  await render(opt3_reel, W, H, 'brand-3-reel-green.png');
  await render(opt3_reel2, W, H, 'brand-3-reel-navy.png');
  await render(opt3_reel3, W, H, 'brand-3-reel-orange.png');

  console.log('\nDone! 8 files in content/posts/');
}

main().catch(console.error);
