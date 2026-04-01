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
const H = 1350; // 4:5 vertical
const HANDLE = '@finanzas.pop';

const C = {
  bg: '#faf6f1',
  bgDark: '#1c1917',
  accent: '#dc2626',
  accent2: '#059669',
  amber: '#d97706',
  text: '#1c1917',
  textLight: '#78716c',
  textOnDark: '#faf6f1',
  bar: '#e7e5e4',
};

async function renderSlide(element, filename) {
  const svg = await satori(element, { width: W, height: H, fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  writeFileSync(join(__dirname, 'posts', filename), resvg.render().asPng());
  console.log(`  ${filename}`);
}

function slide(bg, children) {
  return { type: 'div', props: { style: { width: W, height: H, background: bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter' }, children } };
}

function centered(content) {
  return { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 80px' }, children: Array.isArray(content) ? content : [content] } };
}

function footer(color) {
  return { type: 'div', props: { style: { padding: '30px 80px', display: 'flex', justifyContent: 'flex-end' }, children: [
    { type: 'div', props: { style: { fontSize: 26, fontWeight: 700, color }, children: HANDLE } },
  ] } };
}

async function main() {
  mkdirSync(join(__dirname, 'posts'), { recursive: true });

  // SLIDE 1: Hook — big visual question
  await renderSlide(
    slide(C.accent, [
      centered([
        { type: 'div', props: { style: { fontSize: 32, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }, children: 'DESLIZA →' } },
        { type: 'div', props: { style: { fontSize: 80, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginTop: 30 }, children: '¿Sabes qué es la inflación?' } },
        { type: 'div', props: { style: { fontSize: 40, fontWeight: 400, color: 'rgba(255,255,255,0.8)', marginTop: 30 }, children: 'Te lo explico en 7 slides.' } },
      ]),
      { type: 'div', props: { style: { padding: '30px 80px', display: 'flex', justifyContent: 'flex-end' }, children: [
        { type: 'div', props: { style: { fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }, children: HANDLE } },
      ] } },
    ]),
    'carousel-v2-1.png'
  );

  // SLIDE 2: Second hook — the pain
  await renderSlide(
    slide(C.bg, [
      centered([
        { type: 'div', props: { style: { fontSize: 64, fontWeight: 700, color: C.text, lineHeight: 1.15 }, children: 'Tu sueldo es el mismo.' } },
        { type: 'div', props: { style: { fontSize: 64, fontWeight: 700, color: C.accent, lineHeight: 1.15, marginTop: 20 }, children: 'Pero todo cuesta más.' } },
      ]),
      footer(C.accent),
    ]),
    'carousel-v2-2.png'
  );

  // SLIDE 3: Definition — minimal
  await renderSlide(
    slide(C.bg, [
      centered([
        { type: 'div', props: { style: { fontSize: 32, fontWeight: 700, color: C.accent }, children: 'INFLACIÓN' } },
        { type: 'div', props: { style: { fontSize: 56, fontWeight: 700, color: C.text, lineHeight: 1.2, marginTop: 25 }, children: 'Es cuando el dinero pierde valor.' } },
        { type: 'div', props: { style: { fontSize: 40, fontWeight: 400, color: C.textLight, lineHeight: 1.4, marginTop: 25 }, children: 'Los precios suben. Tu sueldo no.' } },
      ]),
      footer(C.accent),
    ]),
    'carousel-v2-3.png'
  );

  // SLIDE 4: Visual comparison — before/after
  await renderSlide(
    slide(C.bg, [
      centered([
        { type: 'div', props: { style: { fontSize: 36, fontWeight: 500, color: C.textLight, textAlign: 'center' }, children: 'Misma canasta del super' } },
        { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 60, gap: 40 }, children: [
          { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [
            { type: 'div', props: { style: { fontSize: 30, color: C.textLight }, children: '2024' } },
            { type: 'div', props: { style: { fontSize: 100, fontWeight: 700, color: C.text, marginTop: 10 }, children: '$1,000' } },
          ] } },
          { type: 'div', props: { style: { fontSize: 60, color: C.accent }, children: '→' } },
          { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [
            { type: 'div', props: { style: { fontSize: 30, color: C.textLight }, children: '2026' } },
            { type: 'div', props: { style: { fontSize: 100, fontWeight: 700, color: C.accent, marginTop: 10 }, children: '$1,062' } },
          ] } },
        ] } },
        { type: 'div', props: { style: { fontSize: 32, fontWeight: 500, color: C.accent, textAlign: 'center', marginTop: 50 }, children: '+6.2% en alimentos' } },
      ]),
      footer(C.accent),
    ]),
    'carousel-v2-4.png'
  );

  // SLIDE 5: The problem — your money losing value
  await renderSlide(
    slide(C.bgDark, [
      centered([
        { type: 'div', props: { style: { fontSize: 48, fontWeight: 400, color: C.textOnDark, lineHeight: 1.3 }, children: 'Si tu cuenta paga' } },
        { type: 'div', props: { style: { fontSize: 140, fontWeight: 700, color: C.accent, lineHeight: 1 }, children: '~1%' } },
        { type: 'div', props: { style: { fontSize: 48, fontWeight: 400, color: C.textOnDark, lineHeight: 1.3, marginTop: 20 }, children: 'y la inflación es' } },
        { type: 'div', props: { style: { fontSize: 140, fontWeight: 700, color: C.amber, lineHeight: 1 }, children: '4.6%' } },
        { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.accent, marginTop: 30 }, children: 'Pierdes 3.6% al año.' } },
      ]),
      footer(C.accent),
    ]),
    'carousel-v2-5.png'
  );

  // SLIDE 6: The solution — where to put your money
  await renderSlide(
    slide(C.bg, [
      centered([
        { type: 'div', props: { style: { fontSize: 44, fontWeight: 700, color: C.text, marginBottom: 40 }, children: 'Opciones que le ganan a la inflación:' } },
        { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.accent2 }, children: 'Nu — 14.5%' } },
        { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.accent2, marginTop: 20 }, children: 'Hey Banco — 13%' } },
        { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.amber, marginTop: 20 }, children: 'CETES — 6.8%' } },
        { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: C.accent, marginTop: 20 }, children: 'Banco normal — ~1% ✗' } },
      ]),
      footer(C.accent2),
    ]),
    'carousel-v2-6.png'
  );

  // SLIDE 7: CTA
  await renderSlide(
    slide(C.bgDark, [
      centered([
        { type: 'div', props: { style: { fontSize: 60, fontWeight: 700, color: C.textOnDark, textAlign: 'center', lineHeight: 1.2 }, children: 'La inflación no para.' } },
        { type: 'div', props: { style: { fontSize: 60, fontWeight: 700, color: C.accent, textAlign: 'center', lineHeight: 1.2, marginTop: 20 }, children: 'Tu dinero tampoco debería.' } },
        { type: 'div', props: { style: { fontSize: 34, fontWeight: 400, color: C.textOnDark, textAlign: 'center', marginTop: 50, lineHeight: 1.4 }, children: 'Guarda 💾 y comparte con alguien que necesite verlo.' } },
        { type: 'div', props: { style: { fontSize: 36, fontWeight: 700, color: C.accent, textAlign: 'center', marginTop: 40 }, children: HANDLE } },
      ]),
    ]),
    'carousel-v2-7.png'
  );

  console.log('\nDone! 7 slides in content/posts/');
}

main().catch(console.error);
