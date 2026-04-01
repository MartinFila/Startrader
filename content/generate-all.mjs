import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const framesDir = join(__dirname, 'frames');
const postsDir = join(__dirname, 'posts');

const fontBold = readFileSync(join(__dirname, 'fonts/Inter-Bold.ttf'));
const fontMedium = readFileSync(join(__dirname, 'fonts/Inter-Medium.ttf'));
const fontRegular = readFileSync(join(__dirname, 'fonts/Inter-Regular.ttf'));
const fonts = [
  { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  { name: 'Inter', data: fontMedium, weight: 500, style: 'normal' },
  { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
];

const C = {
  bg: '#faf6f1', bgDark: '#1c1917', accent: '#dc2626', accent2: '#059669',
  bar: '#e7e5e4', text: '#1c1917', textLight: '#78716c', textOnDark: '#faf6f1',
  amber: '#d97706', blue: '#2563eb',
};

function easeOutQuart(t) { return 1 - Math.pow(1 - Math.min(Math.max(t,0),1), 4); }
function easeInOutCubic(t) { t = Math.min(Math.max(t,0),1); return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

const W_REEL = 1080, H_REEL = 1920;
const W_POST = 1080, H_POST = 1080;
const FPS = 10;
const HANDLE = '@finanzas.pop';

// ============ UTILITY ============
async function renderPNG(element, w, h, filename) {
  const svg = await satori(element, { width: w, height: h, fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: w } });
  writeFileSync(join(postsDir, filename), resvg.render().asPng());
  console.log(`  PNG: ${filename}`);
}

async function renderReel(buildFn, seconds, filename) {
  if (existsSync(framesDir)) execSync(`rm -rf ${framesDir}`);
  mkdirSync(framesDir, { recursive: true });
  const totalFrames = FPS * seconds;
  for (let f = 0; f < totalFrames; f++) {
    const el = buildFn(f, FPS, seconds);
    const svg = await satori(el, { width: W_REEL, height: H_REEL, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W_REEL } });
    writeFileSync(join(framesDir, `f_${String(f).padStart(5,'0')}.png`), resvg.render().asPng());
    if (f % 10 === 0) process.stdout.write(`\r  Reel ${filename}: frame ${f}/${totalFrames}`);
  }
  const out = join(postsDir, filename);
  execSync(`ffmpeg -y -framerate ${FPS} -i "${framesDir}/f_%05d.png" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 "${out}" 2>&1`);
  execSync(`rm -rf "${framesDir}"`);
  console.log(`\n  REEL: ${filename}`);
}

// ============ REEL 2: INFLACIÓN ALIMENTOS ============
function reelInflacion(frame, fps, totalSec) {
  const sec = frame / fps;
  let bg = C.bg, children = [];

  if (sec < 3) {
    const fade = easeOutQuart((sec/3)*2);
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
      { type:'div', props:{ style:{ fontSize:64, fontWeight:700, color:C.text, lineHeight:1.2, opacity:fade }, children:'Lo que costaba' }},
      { type:'div', props:{ style:{ fontSize:64, fontWeight:700, color:C.accent, lineHeight:1.2, marginTop:10, opacity:fade }, children:'$1,000 en el super' }},
      { type:'div', props:{ style:{ fontSize:64, fontWeight:700, color:C.text, lineHeight:1.2, marginTop:10, opacity:fade }, children:'hace un año...' }},
    ]}});
  } else if (sec < 7) {
    const t = (sec-3)/4;
    const fade = easeOutQuart(t*2);
    const countUp = Math.min(1062, Math.round(1000 + 62 * easeInOutCubic(t)));
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-start', flex:1, padding:'0 80px' }, children:[
      { type:'div', props:{ style:{ fontSize:48, fontWeight:500, color:C.textLight, opacity:fade }, children:'Hoy cuesta:' }},
      { type:'div', props:{ style:{ fontSize:200, fontWeight:700, color:C.accent, lineHeight:1, marginTop:20, opacity:fade }, children:`$${countUp}` }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:500, color:C.textLight, marginTop:30, opacity: easeOutQuart(Math.max(0,(t-0.5)*3)) }, children:'Inflación en alimentos: 6.2%' }},
      { type:'div', props:{ style:{ fontSize:28, color:C.textLight, marginTop:20, opacity: easeOutQuart(Math.max(0,(t-0.6)*3)) }, children:'Fuente: INEGI — Marzo 2026' }},
    ]}});
  } else if (sec < 12) {
    const t = (sec-7)/5;
    const f1 = easeOutQuart(t*2);
    const f2 = easeOutQuart(Math.max(0,(t-0.3)*2));
    const f3 = easeOutQuart(Math.max(0,(t-0.6)*2));
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.text, lineHeight:1.3, opacity:f1 }, children:'Tu sueldo sigue igual.' }},
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.accent, lineHeight:1.3, marginTop:40, opacity:f2 }, children:'Pero todo cuesta más.' }},
      { type:'div', props:{ style:{ fontSize:38, fontWeight:400, color:C.textLight, lineHeight:1.4, marginTop:40, opacity:f3 }, children:'En 5 años, esos $1,000 van a ser $1,350. Con el mismo sueldo.' }},
    ]}});
  } else {
    bg = C.bgDark;
    const t = (sec-12)/(totalSec-12);
    const fade = easeOutQuart(t*2.5);
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, padding:'0 80px', opacity:fade }, children:[
      { type:'div', props:{ style:{ fontSize:48, fontWeight:700, color:C.textOnDark, textAlign:'center', lineHeight:1.3 }, children:'¿Qué puedes hacer?' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:400, color:C.textOnDark, textAlign:'center', lineHeight:1.4, marginTop:30 }, children:'Pon tu dinero donde rinda más que 6.2%. Si no, estás perdiendo.' }},
      { type:'div', props:{ style:{ fontSize:32, fontWeight:500, color:C.accent, marginTop:50, textAlign:'center' }, children:`Sígueme para más datos ${HANDLE}` }},
    ]}});
  }
  return { type:'div', props:{ style:{ width:W_REEL, height:H_REEL, background:bg, display:'flex', flexDirection:'column', fontFamily:'Inter' }, children }};
}

// ============ REEL 3: COMPARATIVA TASAS ============
function reelTasas(frame, fps, totalSec) {
  const sec = frame / fps;
  let bg = C.bg, children = [];

  const tasas = [
    { name:'Nu México', rate:14.5, color:C.accent2 },
    { name:'Hey Banco', rate:13.0, color:C.accent2 },
    { name:'Mercado Pago', rate:11.8, color:C.amber },
    { name:'CETES 28d', rate:6.8, color:C.blue },
    { name:'Banco normal', rate:1.0, color:C.accent },
  ];

  if (sec < 3) {
    const fade = easeOutQuart((sec/3)*2);
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
      { type:'div', props:{ style:{ fontSize:64, fontWeight:700, color:C.text, lineHeight:1.2, opacity:fade }, children:'¿Dónde conviene' }},
      { type:'div', props:{ style:{ fontSize:64, fontWeight:700, color:C.accent2, lineHeight:1.2, marginTop:10, opacity:fade }, children:'poner tu dinero' }},
      { type:'div', props:{ style:{ fontSize:64, fontWeight:700, color:C.text, lineHeight:1.2, marginTop:10, opacity:fade }, children:'hoy?' }},
    ]}});
  } else if (sec < 13) {
    const t = (sec-3)/10;
    const bars = tasas.map((tasa, i) => {
      const delay = i * 0.12;
      const barT = easeInOutCubic(Math.max(0, Math.min((t - delay) * 2.5, 1)));
      const barWidth = barT * (tasa.rate / 15) * 100;
      const labelFade = easeOutQuart(Math.max(0, (t - delay - 0.1) * 4));
      return { type:'div', props:{ style:{ display:'flex', flexDirection:'column', marginBottom: 35 }, children:[
        { type:'div', props:{ style:{ display:'flex', justifyContent:'space-between', marginBottom:8 }, children:[
          { type:'div', props:{ style:{ fontSize:32, fontWeight:500, color:C.text, opacity:labelFade }, children:tasa.name }},
          { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:tasa.color, opacity:labelFade }, children:`${tasa.rate}%` }},
        ]}},
        { type:'div', props:{ style:{ width:'100%', height:45, background:C.bar, borderRadius:22, display:'flex' }, children:[
          { type:'div', props:{ style:{ width:`${barWidth}%`, height:'100%', background:tasa.color, borderRadius:22 }}},
        ]}},
      ]}};
    });

    const inflLine = easeOutQuart(Math.max(0, (t-0.7)*3));
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 70px' }, children:[
      { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:C.text, marginBottom:40 }, children:'Rendimiento anual — Marzo 2026' }},
      ...bars,
      { type:'div', props:{ style:{ display:'flex', alignItems:'center', marginTop:20, opacity:inflLine }, children:[
        { type:'div', props:{ style:{ width:'100%', height:3, background:C.accent, position:'relative' }}},
      ]}},
      { type:'div', props:{ style:{ fontSize:26, color:C.accent, fontWeight:500, marginTop:8, opacity:inflLine }, children:'← Inflación: 4.6% — si tu tasa es menor, pierdes dinero' }},
    ]}});
  } else {
    bg = C.bgDark;
    const t = (sec-13)/(totalSec-13);
    const fade = easeOutQuart(t*2.5);
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, padding:'0 80px', opacity:fade }, children:[
      { type:'div', props:{ style:{ fontSize:48, fontWeight:700, color:C.textOnDark, textAlign:'center', lineHeight:1.3 }, children:'Mover tu dinero toma 5 minutos.' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:400, color:C.textOnDark, textAlign:'center', lineHeight:1.4, marginTop:30 }, children:'No perderlo debería ser prioridad.' }},
      { type:'div', props:{ style:{ fontSize:32, fontWeight:500, color:C.accent2, marginTop:50 }, children:`Guarda este post ${HANDLE}` }},
    ]}});
  }
  return { type:'div', props:{ style:{ width:W_REEL, height:H_REEL, background:bg, display:'flex', flexDirection:'column', fontFamily:'Inter' }, children }};
}

// ============ REEL 4: BUFFETT QUOTE ============
function reelBuffett(frame, fps, totalSec) {
  const sec = frame / fps;
  let bg = C.bg, children = [];

  if (sec < 4) {
    const t = sec/4;
    const fade = easeOutQuart(t*2);
    bg = '#1a1207';
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
      { type:'div', props:{ style:{ fontSize:120, color:C.amber, lineHeight:0.8, opacity:fade }, children:'"' }},
      { type:'div', props:{ style:{ fontSize:50, fontWeight:700, color:C.textOnDark, lineHeight:1.35, marginTop:20, opacity:fade }, children:'No ahorres lo que queda después de gastar.' }},
      { type:'div', props:{ style:{ fontSize:50, fontWeight:700, color:C.amber, lineHeight:1.35, marginTop:20, opacity: easeOutQuart(Math.max(0,(t-0.3)*2)) }, children:'Gasta lo que queda después de ahorrar.' }},
      { type:'div', props:{ style:{ fontSize:32, fontWeight:500, color:C.amber, marginTop:40, opacity: easeOutQuart(Math.max(0,(t-0.5)*2)) }, children:'— Warren Buffett' }},
    ]}});
  } else if (sec < 9) {
    const t = (sec-4)/5;
    const f1 = easeOutQuart(t*2);
    const f2 = easeOutQuart(Math.max(0,(t-0.3)*2));
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.text, lineHeight:1.3, opacity:f1 }, children:'Traducido:' }},
      { type:'div', props:{ style:{ fontSize:40, fontWeight:400, color:C.text, lineHeight:1.4, marginTop:30, opacity:f2 }, children:'El día que te cae el sueldo, transfiere el 20% a otra cuenta ANTES de pagar cualquier cosa.' }},
      { type:'div', props:{ style:{ fontSize:40, fontWeight:400, color:C.accent, lineHeight:1.4, marginTop:30, opacity:f2 }, children:'Lo que queda es lo que tienes para gastar. No al revés.' }},
    ]}});
  } else if (sec < 14) {
    const t = (sec-9)/5;
    const f1 = easeOutQuart(t*2);
    const f2 = easeOutQuart(Math.max(0,(t-0.25)*2));
    const f3 = easeOutQuart(Math.max(0,(t-0.5)*2));
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
      { type:'div', props:{ style:{ fontSize:40, fontWeight:700, color:C.text, marginBottom:35, opacity:f1 }, children:'Si ganas $15,000 al mes:' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:500, color:C.accent2, opacity:f1 }, children:'→ $3,000 a ahorro (automático)' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:500, color:C.text, marginTop:20, opacity:f2 }, children:'→ $12,000 para vivir' }},
      { type:'div', props:{ style:{ fontSize:32, fontWeight:400, color:C.textLight, marginTop:40, opacity:f3 }, children:'En un año: $36,000 ahorrados sin esfuerzo.' }},
      { type:'div', props:{ style:{ fontSize:32, fontWeight:400, color:C.accent2, marginTop:15, opacity:f3 }, children:'En Nu (14.5%): $41,220 con intereses.' }},
    ]}});
  } else {
    bg = C.bgDark;
    const t = (sec-14)/(totalSec-14);
    const fade = easeOutQuart(t*2.5);
    children.push({ type:'div', props:{ style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, padding:'0 80px', opacity:fade }, children:[
      { type:'div', props:{ style:{ fontSize:48, fontWeight:700, color:C.textOnDark, textAlign:'center', lineHeight:1.3 }, children:'El truco no es ganar más.' }},
      { type:'div', props:{ style:{ fontSize:48, fontWeight:700, color:C.amber, textAlign:'center', lineHeight:1.3, marginTop:20 }, children:'Es ordenar lo que ya tienes.' }},
      { type:'div', props:{ style:{ fontSize:32, fontWeight:500, color:C.amber, marginTop:50 }, children:`Sígueme ${HANDLE}` }},
    ]}});
  }
  return { type:'div', props:{ style:{ width:W_REEL, height:H_REEL, background:bg, display:'flex', flexDirection:'column', fontFamily:'Inter' }, children }};
}

// ============ CARRUSEL: ¿QUÉ ES LA INFLACIÓN? (5 slides) ============
function carouselSlide(slideNum) {
  const slides = [
    // Slide 1: Cover
    { bg: C.accent, children: [
      { type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
        { type:'div', props:{ style:{ fontSize:28, fontWeight:500, color:'rgba(255,255,255,0.7)' }, children:'DESLIZA PARA APRENDER →' }},
        { type:'div', props:{ style:{ fontSize:72, fontWeight:700, color:'#fff', lineHeight:1.15, marginTop:30 }, children:'¿Qué es la inflación y por qué te afecta?' }},
        { type:'div', props:{ style:{ fontSize:28, fontWeight:500, color:'rgba(255,255,255,0.7)', marginTop:40 }, children:HANDLE }},
      ]}},
    ]},
    // Slide 2: Definition
    { bg: C.bg, children: [
      { type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
        { type:'div', props:{ style:{ fontSize:28, fontWeight:700, color:C.accent }, children:'01' }},
        { type:'div', props:{ style:{ fontSize:52, fontWeight:700, color:C.text, lineHeight:1.2, marginTop:15 }, children:'La inflación es cuando el dinero pierde valor.' }},
        { type:'div', props:{ style:{ fontSize:36, fontWeight:400, color:C.textLight, lineHeight:1.5, marginTop:30 }, children:'Los precios suben, pero tu sueldo no sube al mismo ritmo. Con la misma plata comprás menos.' }},
      ]}},
    ]},
    // Slide 3: Example
    { bg: C.bg, children: [
      { type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
        { type:'div', props:{ style:{ fontSize:28, fontWeight:700, color:C.accent }, children:'02' }},
        { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.text, lineHeight:1.2, marginTop:15 }, children:'Ejemplo real:' }},
        { type:'div', props:{ style:{ display:'flex', justifyContent:'space-between', marginTop:40, gap:30 }, children:[
          { type:'div', props:{ style:{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, background:C.bar, borderRadius:20, padding:'30px 20px' }, children:[
            { type:'div', props:{ style:{ fontSize:24, color:C.textLight, fontWeight:500 }, children:'2024' }},
            { type:'div', props:{ style:{ fontSize:56, fontWeight:700, color:C.text, marginTop:10 }, children:'$1,000' }},
          ]}},
          { type:'div', props:{ style:{ display:'flex', alignItems:'center', fontSize:48, color:C.accent }, children:'→' }},
          { type:'div', props:{ style:{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, background:C.bar, borderRadius:20, padding:'30px 20px' }, children:[
            { type:'div', props:{ style:{ fontSize:24, color:C.textLight, fontWeight:500 }, children:'2026' }},
            { type:'div', props:{ style:{ fontSize:56, fontWeight:700, color:C.accent, marginTop:10 }, children:'$1,062' }},
          ]}},
        ]}},
        { type:'div', props:{ style:{ fontSize:32, fontWeight:400, color:C.textLight, lineHeight:1.4, marginTop:30 }, children:'Misma canasta del super. 6.2% más cara. Tu sueldo: igual.' }},
      ]}},
    ]},
    // Slide 4: What to do
    { bg: C.bg, children: [
      { type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', flex:1, padding:'0 80px' }, children:[
        { type:'div', props:{ style:{ fontSize:28, fontWeight:700, color:C.accent2 }, children:'03' }},
        { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.text, lineHeight:1.2, marginTop:15 }, children:'¿Qué puedes hacer?' }},
        { type:'div', props:{ style:{ fontSize:36, fontWeight:400, color:C.text, lineHeight:1.5, marginTop:30 }, children:'Pon tu dinero donde rinda MÁS que la inflación:' }},
        { type:'div', props:{ style:{ fontSize:34, fontWeight:700, color:C.accent2, marginTop:30 }, children:'✓ Nu México: 14.5%' }},
        { type:'div', props:{ style:{ fontSize:34, fontWeight:700, color:C.accent2, marginTop:15 }, children:'✓ Hey Banco: 13.0%' }},
        { type:'div', props:{ style:{ fontSize:34, fontWeight:700, color:C.amber, marginTop:15 }, children:'✓ CETES: 6.8%' }},
        { type:'div', props:{ style:{ fontSize:34, fontWeight:700, color:C.accent, marginTop:15 }, children:'✗ Banco normal: ~1%' }},
        { type:'div', props:{ style:{ fontSize:30, fontWeight:400, color:C.textLight, marginTop:30 }, children:'Si tu tasa es menor que 4.6%, pierdes dinero cada día.' }},
      ]}},
    ]},
    // Slide 5: CTA
    { bg: C.bgDark, children: [
      { type:'div', props:{ style:{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', flex:1, padding:'0 80px' }, children:[
        { type:'div', props:{ style:{ fontSize:52, fontWeight:700, color:C.textOnDark, textAlign:'center', lineHeight:1.3 }, children:'La inflación no para.' }},
        { type:'div', props:{ style:{ fontSize:52, fontWeight:700, color:C.accent, textAlign:'center', lineHeight:1.3, marginTop:20 }, children:'Tu dinero tampoco debería.' }},
        { type:'div', props:{ style:{ fontSize:32, fontWeight:400, color:C.textOnDark, textAlign:'center', marginTop:50, lineHeight:1.4 }, children:'Guarda este post y compártelo con alguien que necesite verlo.' }},
        { type:'div', props:{ style:{ fontSize:32, fontWeight:500, color:C.accent, marginTop:40 }, children:HANDLE }},
      ]}},
    ]},
  ];

  const slide = slides[slideNum];
  return {
    type:'div', props:{ style:{ width:W_POST, height:W_POST, background:slide.bg, display:'flex', flexDirection:'column', fontFamily:'Inter' }, children: slide.children }
  };
}

// ============ MAIN ============
async function main() {
  mkdirSync(postsDir, { recursive: true });

  // CARRUSEL (5 slides)
  console.log('Generating carousel: inflación');
  for (let i = 0; i < 5; i++) {
    await renderPNG(carouselSlide(i), W_POST, W_POST, `carousel-inflacion-${i+1}.png`);
  }

  // REEL 2: Inflación alimentos (16s)
  console.log('\nGenerating Reel 2: inflación alimentos');
  await renderReel(reelInflacion, 16, 'reel-inflacion.mp4');

  // REEL 3: Comparativa tasas (17s)
  console.log('\nGenerating Reel 3: comparativa tasas');
  await renderReel(reelTasas, 17, 'reel-tasas.mp4');

  // REEL 4: Buffett quote (18s)
  console.log('\nGenerating Reel 4: Buffett');
  await renderReel(reelBuffett, 18, 'reel-buffett.mp4');

  console.log('\n\nDone! All content in content/posts/');
  console.log('Files:');
  console.log('  carousel-inflacion-1.png through 5.png');
  console.log('  reel-inflacion.mp4');
  console.log('  reel-tasas.mp4');
  console.log('  reel-buffett.mp4');
  console.log('  reel-8-percent.mp4 (already existed)');
}

main().catch(console.error);
