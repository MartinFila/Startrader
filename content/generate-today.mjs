import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const framesDir = join(__dirname, 'frames-today');
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

const W = 1080, H = 1920, FPS = 10, SECS = 20;
const C = { bg: '#faf6f1', red: '#dc2626', dark: '#1c1917', muted: '#78716c', light: '#a89880', darkBg: '#1c1917' };

function ease(t) { return 1 - Math.pow(1 - Math.min(Math.max(t,0),1), 4); }

function buildFrame(f) {
  const sec = f / FPS;
  const children = [];
  let bg = C.bg;

  // Logo always visible
  const logo = { type:'div', props:{ style:{ position:'absolute', top:70, left:80, display:'flex', alignItems:'center', gap:14 }, children:[
    { type:'div', props:{ style:{ width:44, height:44, borderRadius:22, background:C.red, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff' }, children:'fp' }},
    { type:'div', props:{ style:{ fontSize:20, fontWeight:500, color:C.light }, children:'finanzas.pop' }},
  ]}};
  children.push(logo);

  const content = { position:'absolute', left:80, right:80, display:'flex', flexDirection:'column' };

  if (sec < 3.5) {
    // HOOK: El petróleo subió 60% en un mes
    const fade = ease((sec/3.5)*2);
    children.push({ type:'div', props:{ style:{ ...content, top:'35%' }, children:[
      { type:'div', props:{ style:{ fontSize:60, fontWeight:700, color:C.dark, lineHeight:1.2, opacity:fade }, children:'El petróleo subió' }},
      { type:'div', props:{ style:{ fontSize:140, fontWeight:700, color:C.red, lineHeight:0.9, marginTop:15, opacity:fade }, children:'+60%' }},
      { type:'div', props:{ style:{ fontSize:60, fontWeight:700, color:C.dark, lineHeight:1.2, marginTop:15, opacity:fade }, children:'en un solo mes.' }},
    ]}});
  } else if (sec < 8) {
    // CONTEXT: Por qué pasó
    const t = (sec-3.5)/4.5;
    const f1 = ease(t*2);
    const f2 = ease(Math.max(0,(t-0.3)*2));
    children.push({ type:'div', props:{ style:{ ...content, top:'30%' }, children:[
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.dark, lineHeight:1.3, opacity:f1 }, children:'¿Por qué?' }},
      { type:'div', props:{ style:{ fontSize:38, fontWeight:400, color:C.muted, lineHeight:1.4, marginTop:25, opacity:f1 }, children:'Los ataques en Medio Oriente dispararon el precio del Brent a niveles récord desde 1990.' }},
      { type:'div', props:{ style:{ fontSize:38, fontWeight:400, color:C.muted, lineHeight:1.4, marginTop:25, opacity:f2 }, children:'Es la mayor subida mensual en 35 años.' }},
    ]}});
  } else if (sec < 13) {
    // IMPACT: Cómo te afecta
    const t = (sec-8)/5;
    const f1 = ease(t*2);
    const f2 = ease(Math.max(0,(t-0.25)*2));
    const f3 = ease(Math.max(0,(t-0.5)*2));
    children.push({ type:'div', props:{ style:{ ...content, top:'28%' }, children:[
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.red, lineHeight:1.2, opacity:f1 }, children:'¿Cómo te afecta?' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:500, color:C.dark, lineHeight:1.4, marginTop:30, opacity:f1 }, children:'La gasolina va a subir.' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:500, color:C.dark, lineHeight:1.4, marginTop:20, opacity:f2 }, children:'El transporte va a subir.' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:500, color:C.dark, lineHeight:1.4, marginTop:20, opacity:f2 }, children:'Los alimentos van a subir (otra vez).' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:400, color:C.muted, lineHeight:1.4, marginTop:30, opacity:f3 }, children:'Todo lo que se transporta con petróleo se encarece. Y en México, eso es casi todo.' }},
    ]}});
  } else if (sec < 17) {
    // WHAT TO DO
    const t = (sec-13)/4;
    const f1 = ease(t*2);
    const f2 = ease(Math.max(0,(t-0.3)*2));
    children.push({ type:'div', props:{ style:{ ...content, top:'30%' }, children:[
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:C.dark, lineHeight:1.2, opacity:f1 }, children:'¿Qué puedes hacer?' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:400, color:C.muted, lineHeight:1.5, marginTop:25, opacity:f1 }, children:'Si tienes ahorros, la inflación va a seguir subiendo. Tu dinero en el banco pierde valor más rápido.' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:500, color:C.red, lineHeight:1.5, marginTop:25, opacity:f2 }, children:'Mover tu dinero a donde rinda más que la inflación ya no es opcional. Es urgente.' }},
    ]}});
  } else {
    // CTA
    bg = C.darkBg;
    const t = (sec-17)/(SECS-17);
    const fade = ease(t*2.5);
    children.push({ type:'div', props:{ style:{ ...content, top:'35%', alignItems:'center', textAlign:'center' }, children:[
      { type:'div', props:{ style:{ fontSize:48, fontWeight:700, color:'#faf6f1', lineHeight:1.25, opacity:fade }, children:'Sígueme para entender qué pasa con tu dinero cada día.' }},
      { type:'div', props:{ style:{ fontSize:32, fontWeight:500, color:C.red, marginTop:40, opacity:fade }, children:'@finanzas.pop' }},
    ]}});
  }

  // Footer
  if (sec < 17) {
    children.push({ type:'div', props:{ style:{ position:'absolute', bottom:60, right:80, fontSize:18, color:C.light }, children:'@finanzas.pop' }});
  }

  return { type:'div', props:{ style:{ width:W, height:H, background:bg, display:'flex', position:'relative', fontFamily:'Inter' }, children }};
}

async function main() {
  const total = FPS * SECS;
  console.log(`Generating ${total} frames...`);
  for (let f = 0; f < total; f++) {
    const el = buildFrame(f);
    const svg = await satori(el, { width: W, height: H, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
    writeFileSync(join(framesDir, `f_${String(f).padStart(5,'0')}.png`), png);
    if (f % 20 === 0) process.stdout.write(`\r  ${f}/${total}`);
  }

  const outDir = '/Users/martin/Projects/Startrader/Contenido_IG/reels';
  const out = join(outDir, 'reel-petroleo-60.mp4');
  console.log('\nAssembling...');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${framesDir}/f_%05d.png" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 "${out}" 2>&1`);
  execSync(`rm -rf "${framesDir}"`);

  // Caption
  writeFileSync(join(outDir, 'copy-6-petroleo.txt'), `El petróleo subió +60% en un solo mes. Es la mayor subida mensual en 35 años.

¿Por qué? Los ataques en Medio Oriente dispararon el precio del Brent a niveles récord desde 1990.

¿Cómo te afecta?
→ La gasolina va a subir
→ El transporte va a subir
→ Los alimentos van a subir (otra vez)

Todo lo que se transporta con petróleo se encarece. Y en México, eso es casi todo.

Si tienes ahorros en una cuenta que paga menos que la inflación, tu dinero pierde valor cada día más rápido.

Fuente: Reuters / Excélsior, Marzo 2026

#petroleo #inflacion #finanzaspersonales #mexico #dinero #educacionfinanciera #economia #gasolina`);

  console.log(`Done! ${out}`);
}

main().catch(console.error);
