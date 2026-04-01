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

const W = 1080;
const H = 1350;

async function render(element, filename) {
  const svg = await satori(element, { width: W, height: H, fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  writeFileSync(join(__dirname, 'posts', filename), resvg.render().asPng());
  console.log(`  ${filename}`);
}

// ===== STYLE A: Editorial Cálido =====
const styleA = {
  type: 'div', props: { style: {
    width: W, height: H, background: '#faf6f1', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
  }, children: [
    { type: 'div', props: { style: { fontSize: 28, fontWeight: 500, color: '#a89880', letterSpacing: 3 }, children: 'OPCIÓN A · EDITORIAL CÁLIDO' } },
    { type: 'div', props: { style: { width: '100%', height: 2, background: '#e0d6c8', marginTop: 24, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 160, fontWeight: 700, color: '#c0392b', lineHeight: 0.9 }, children: '8.8%' } },
    { type: 'div', props: { style: { fontSize: 44, fontWeight: 500, color: '#3d3225', marginTop: 30, lineHeight: 1.3 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
    { type: 'div', props: { style: { width: '100%', height: 1, background: '#e0d6c8', marginTop: 60, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 52, fontWeight: 700, color: '#3d3225', lineHeight: 1.2 }, children: 'Tu sueldo es el mismo.' } },
    { type: 'div', props: { style: { fontSize: 52, fontWeight: 700, color: '#c0392b', lineHeight: 1.2, marginTop: 12 }, children: 'Pero todo cuesta más.' } },
    { type: 'div', props: { style: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [
      { type: 'div', props: { style: { fontSize: 22, color: '#a89880' }, children: 'Fuente: ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 22, color: '#a89880' }, children: 'Serif · Crema · Rojo · Periódico premium' } },
    ] } },
  ] },
};

// ===== STYLE B: Neon Data =====
const styleB = {
  type: 'div', props: { style: {
    width: W, height: H, background: '#0a0a0a', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
  }, children: [
    { type: 'div', props: { style: { fontSize: 28, fontWeight: 500, color: 'rgba(132,204,22,0.5)', letterSpacing: 3 }, children: 'OPCIÓN B · NEON DATA' } },
    { type: 'div', props: { style: { width: '100%', height: 2, background: 'rgba(132,204,22,0.2)', marginTop: 24, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 180, fontWeight: 700, color: '#84cc16', lineHeight: 0.85, letterSpacing: -5 }, children: '8.8%' } },
    { type: 'div', props: { style: { fontSize: 40, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginTop: 30, lineHeight: 1.3 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
    { type: 'div', props: { style: { width: '100%', height: 1, background: 'rgba(255,255,255,0.1)', marginTop: 60, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2 }, children: 'Tu sueldo es el mismo.' } },
    { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: '#84cc16', lineHeight: 1.2, marginTop: 12 }, children: 'Pero todo cuesta más.' } },
    { type: 'div', props: { style: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }, children: [
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }, children: 'ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(132,204,22,0.4)' }, children: 'Negro · Verde neón · Bloomberg style' } },
    ] } },
  ] },
};

// ===== STYLE C: Warm Gradient =====
const styleC = {
  type: 'div', props: { style: {
    width: W, height: H, background: 'linear-gradient(145deg, #f97066, #ea580c)', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
  }, children: [
    { type: 'div', props: { style: { fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: 3 }, children: 'OPCIÓN C · WARM GRADIENT' } },
    { type: 'div', props: { style: { width: '100%', height: 2, background: 'rgba(255,255,255,0.2)', marginTop: 24, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 160, fontWeight: 700, color: '#fff', lineHeight: 0.9 }, children: '8.8%' } },
    { type: 'div', props: { style: { fontSize: 42, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: 30, lineHeight: 1.3 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
    { type: 'div', props: { style: { width: '100%', height: 1, background: 'rgba(255,255,255,0.2)', marginTop: 60, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1.2 }, children: 'Tu sueldo es el mismo.' } },
    { type: 'div', props: { style: { fontSize: 52, fontWeight: 700, color: '#fef3c7', lineHeight: 1.2, marginTop: 12 }, children: 'Pero todo cuesta más.' } },
    { type: 'div', props: { style: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }, children: [
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.4)' }, children: 'ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.4)' }, children: 'Gradientes cálidos · Amigable · Fintech' } },
    ] } },
  ] },
};

// ===== STYLE D: Bold Magazine =====
const styleD = {
  type: 'div', props: { style: {
    width: W, height: H, background: '#1e3a5f', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
  }, children: [
    { type: 'div', props: { style: { fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.3)', letterSpacing: 3 }, children: 'OPCIÓN D · BOLD MAGAZINE' } },
    { type: 'div', props: { style: { width: '100%', height: 2, background: 'rgba(255,255,255,0.1)', marginTop: 24, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 170, fontWeight: 700, color: '#fff', lineHeight: 0.85, letterSpacing: -4 }, children: '8.8%' } },
    { type: 'div', props: { style: { fontSize: 44, fontWeight: 400, color: 'rgba(255,255,255,0.7)', marginTop: 30, lineHeight: 1.3 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
    { type: 'div', props: { style: { width: '100%', height: 1, background: 'rgba(255,255,255,0.1)', marginTop: 60, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 56, fontWeight: 700, color: '#fff', lineHeight: 1.1 }, children: 'Tu sueldo es el mismo.' } },
    { type: 'div', props: { style: { fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.5)', lineHeight: 1.1, marginTop: 12 }, children: 'Pero todo cuesta más.' } },
    { type: 'div', props: { style: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }, children: [
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.25)' }, children: 'ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 20, color: 'rgba(255,255,255,0.25)' }, children: 'Navy · Tipografía gigante · Portada de revista' } },
    ] } },
  ] },
};

// ===== STYLE E: Minimal Swiss =====
const styleE = {
  type: 'div', props: { style: {
    width: W, height: H, background: '#fcfcfb', display: 'flex', flexDirection: 'column',
    fontFamily: 'Inter', padding: '80px',
    borderTop: '8px solid #dc2626',
  }, children: [
    { type: 'div', props: { style: { fontSize: 28, fontWeight: 500, color: '#aaa', letterSpacing: 3 }, children: 'OPCIÓN E · MINIMAL SWISS' } },
    { type: 'div', props: { style: { width: '100%', height: 2, background: '#1a1a1a', marginTop: 24, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 160, fontWeight: 700, color: '#1a1a1a', lineHeight: 0.9, letterSpacing: -5 }, children: '8.8%' } },
    { type: 'div', props: { style: { fontSize: 42, fontWeight: 400, color: '#555', marginTop: 30, lineHeight: 1.3 }, children: 'de los mexicanos invierte en acciones o crypto.' } },
    { type: 'div', props: { style: { width: '100%', height: 2, background: '#1a1a1a', marginTop: 60, marginBottom: 60 } } },
    { type: 'div', props: { style: { fontSize: 50, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15 }, children: 'Tu sueldo es el mismo.' } },
    { type: 'div', props: { style: { fontSize: 50, fontWeight: 700, color: '#dc2626', lineHeight: 1.15, marginTop: 12 }, children: 'Pero todo cuesta más.' } },
    { type: 'div', props: { style: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [
      { type: 'div', props: { style: { fontSize: 20, color: '#aaa', letterSpacing: 2 }, children: 'ENIF 2024 — INEGI' } },
      { type: 'div', props: { style: { fontSize: 20, color: '#aaa' }, children: 'Blanco · Negro · Rojo · Suizo / Bauhaus' } },
    ] } },
  ] },
};

async function main() {
  mkdirSync(join(__dirname, 'posts'), { recursive: true });
  console.log('Generating style cards...');
  await render(styleA, 'style-A-editorial.png');
  await render(styleB, 'style-B-neon.png');
  await render(styleC, 'style-C-gradient.png');
  await render(styleD, 'style-D-magazine.png');
  await render(styleE, 'style-E-swiss.png');
  console.log('\nDone! 5 style cards ready to share via WhatsApp.');
}

main().catch(console.error);
