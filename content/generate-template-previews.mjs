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

const W = 1080, H = 1080;
const outDir = join(dirname(__dirname), 'Contenido_IG', 'template-previews');
mkdirSync(outDir, { recursive: true });

// Brand thread elements (shared across ALL templates)
function brandBar() {
  return { type:'div', props:{ style:{ position:'absolute', bottom:0, left:0, right:0, height:8, background:'#dc2626' }}};
}
function logoPill(inverted = false) {
  return { type:'div', props:{ style:{
    position:'absolute', bottom:32, right:24,
    width:36, height:36, borderRadius:18,
    background: inverted ? '#fff' : '#dc2626',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:16, fontWeight:700, color: inverted ? '#dc2626' : '#fff',
  }, children:'fp' }};
}
function sourceLine(text, light = false) {
  return { type:'div', props:{ style:{
    position:'absolute', bottom:16, left:24,
    fontSize:12, fontWeight:500, color: light ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
  }, children: text }};
}

async function render(el, filename) {
  const svg = await satori(el, { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  writeFileSync(join(outDir, filename), png);
  console.log(`  ✓ ${filename}`);
}

async function main() {
  console.log('Generating 8 template previews...\n');

  // ═══ 1. DAILY BRIEFING ═══
  await render({
    type:'div', props:{ style:{ width:W, height:H, background:'#faf6f1', display:'flex', flexDirection:'column', position:'relative', fontFamily:'Inter', padding:'48px' }, children:[
      // Category tag
      { type:'div', props:{ style:{ background:'#dc2626', color:'#fff', padding:'8px 20px', borderRadius:50, fontSize:14, fontWeight:700, letterSpacing:1.5, display:'flex', alignSelf:'flex-start' }, children:'NOTICIAS' }},
      // Vertical red line
      { type:'div', props:{ style:{ position:'absolute', left:48, top:110, width:2, height:300, background:'#dc2626' }}},
      // Headline
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:'#1c1917', lineHeight:1.15, marginTop:40, marginLeft:24 }, children:'Banxico mantiene la tasa en 7% ante presión inflacionaria' }},
      // Key number
      { type:'div', props:{ style:{ fontSize:72, fontWeight:700, color:'#dc2626', marginTop:40, marginLeft:24 }, children:'7.00%' }},
      { type:'div', props:{ style:{ fontSize:20, fontWeight:400, color:'#1c1917', marginLeft:24, marginTop:8 }, children:'Tasa de referencia — sin cambios desde enero' }},
      sourceLine('Fuente: Banxico, abril 2026'),
      logoPill(),
      brandBar(),
    ]}
  }, '1-daily-briefing.png');

  // ═══ 2. BOLD DATA ═══
  await render({
    type:'div', props:{ style:{ width:W, height:H, background:'#1e293b', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', fontFamily:'Inter' }, children:[
      { type:'div', props:{ style:{ fontSize:160, fontWeight:700, color:'#fff', lineHeight:0.9 }, children:'8.8%' }},
      { type:'div', props:{ style:{ width:120, height:3, background:'#dc2626', marginTop:24, marginBottom:24 }}},
      { type:'div', props:{ style:{ fontSize:26, fontWeight:500, color:'#dc2626', textAlign:'center', padding:'0 80px', lineHeight:1.3 }, children:'de los mexicanos invierte en acciones o crypto' }},
      sourceLine('Fuente: ENIF 2024, INEGI', true),
      logoPill(true),
      brandBar(),
    ]}
  }, '2-bold-data.png');

  // ═══ 3. COMPARISON GRID ═══
  const rows = [
    { name: 'Nu México', rate: '14.5%', color: '#059669' },
    { name: 'Hey Banco', rate: '13.0%', color: '#059669' },
    { name: 'Mercado Pago', rate: '11.8%', color: '#f59e0b' },
    { name: 'CETES 28d', rate: '6.8%', color: '#3b82f6' },
    { name: 'Banco normal', rate: '~1%', color: '#dc2626' },
  ];
  await render({
    type:'div', props:{ style:{ width:W, height:H, background:'#fff', display:'flex', flexDirection:'column', position:'relative', fontFamily:'Inter', padding:'48px' }, children:[
      { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:'#1c1917', marginBottom:8 }, children:'¿Dónde conviene poner tu dinero?' }},
      { type:'div', props:{ style:{ fontSize:18, fontWeight:400, color:'#78716c', marginBottom:32 }, children:'Rendimiento anual — Abril 2026' }},
      ...rows.map(r => ({
        type:'div', props:{ style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid #e7e5e4' }, children:[
          { type:'div', props:{ style:{ fontSize:24, fontWeight:500, color:'#1c1917' }, children: r.name }},
          { type:'div', props:{ style:{ fontSize:32, fontWeight:700, color: r.color }, children: r.rate }},
        ]}
      })),
      // Inflation line
      { type:'div', props:{ style:{ display:'flex', alignItems:'center', marginTop:20, gap:12 }, children:[
        { type:'div', props:{ style:{ flex:1, height:2, background:'#dc2626' }}},
        { type:'div', props:{ style:{ fontSize:14, fontWeight:500, color:'#dc2626' }, children:'Inflación: 4.6%' }},
      ]}},
      { type:'div', props:{ style:{ fontSize:14, fontWeight:400, color:'#78716c', marginTop:8 }, children:'Si tu tasa es menor → pierdes dinero' }},
      sourceLine('Fuente: Sitios oficiales, abril 2026'),
      logoPill(),
      brandBar(),
    ]}
  }, '3-comparison-grid.png');

  // ═══ 4. EDITORIAL QUOTE ═══
  await render({
    type:'div', props:{ style:{ width:W, height:H, background:'#0a0a0a', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', fontFamily:'Inter', padding:'60px 56px' }, children:[
      { type:'div', props:{ style:{ fontSize:120, color:'#dc2626', lineHeight:0.6, opacity:0.3 }, children:'\u201C' }},
      { type:'div', props:{ style:{ fontSize:38, fontWeight:700, color:'#fff', lineHeight:1.35, marginTop:16 }, children:'Tu tanda genera exactamente $0 de rendimiento. Cada quincena que metes dinero ahí, la inflación te come un pedazo.' }},
      { type:'div', props:{ style:{ fontSize:20, fontWeight:500, color:'#dc2626', marginTop:30 }, children:'— @finanzas.pop' }},
      sourceLine('', true),
      logoPill(true),
      brandBar(),
    ]}
  }, '4-editorial-quote.png');

  // ═══ 5. STEP BY STEP ═══
  const steps = [
    { n:'1', text:'Abre CetesDirecto.com desde tu cel' },
    { n:'2', text:'Regístrate con tu CURP y RFC' },
    { n:'3', text:'Transfiere desde $100 pesos' },
    { n:'4', text:'Elige CETES a 28 días' },
    { n:'5', text:'Listo. Ya estás invirtiendo.' },
  ];
  await render({
    type:'div', props:{ style:{ width:W, height:H, background:'#faf6f1', display:'flex', flexDirection:'column', position:'relative', fontFamily:'Inter', padding:'48px' }, children:[
      { type:'div', props:{ style:{ background:'#059669', color:'#fff', padding:'8px 20px', borderRadius:50, fontSize:14, fontWeight:700, letterSpacing:1.5, display:'flex', alignSelf:'flex-start' }, children:'PASO A PASO' }},
      { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:'#1c1917', marginTop:24, lineHeight:1.2 }, children:'Cómo invertir en CETES en 5 minutos' }},
      ...steps.map(s => ({
        type:'div', props:{ style:{ display:'flex', alignItems:'center', gap:16, marginTop:20 }, children:[
          { type:'div', props:{ style:{ width:40, height:40, borderRadius:20, background:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', flexShrink:0 }, children: s.n }},
          { type:'div', props:{ style:{ fontSize:22, fontWeight:500, color:'#1c1917' }, children: s.text }},
        ]}
      })),
      sourceLine('Fuente: CetesDirecto.com'),
      logoPill(),
      brandBar(),
    ]}
  }, '5-step-by-step.png');

  // ═══ 6. THE REVEAL ═══
  await render({
    type:'div', props:{ style:{ width:W, height:H, display:'flex', flexDirection:'column', position:'relative', fontFamily:'Inter' }, children:[
      // Top half dark
      { type:'div', props:{ style:{ height:'50%', background:'#1e293b', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 56px' }, children:[
        { type:'div', props:{ style:{ fontSize:18, fontWeight:500, color:'#dc2626', letterSpacing:2 }, children:'LO QUE CREES' }},
        { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:'#fff', marginTop:12, lineHeight:1.2, textDecoration:'line-through', textDecorationColor:'#dc2626' }, children:'"Con $100 no se puede invertir"' }},
      ]}},
      // Bottom half cream
      { type:'div', props:{ style:{ height:'50%', background:'#faf6f1', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 56px' }, children:[
        { type:'div', props:{ style:{ fontSize:18, fontWeight:500, color:'#059669', letterSpacing:2 }, children:'LA REALIDAD' }},
        { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:'#1c1917', marginTop:12, lineHeight:1.2 }, children:'En CETES puedes empezar desde $100 pesos. Hoy. Desde tu celular.' }},
      ]}},
      sourceLine('Fuente: CetesDirecto.com'),
      logoPill(),
      brandBar(),
    ]}
  }, '6-the-reveal.png');

  // ═══ 7. RANKING LIST ═══
  const ranked = [
    { pos:'1', name:'FEMSA', dato:'+8.2% dividendo', color:'#059669' },
    { pos:'2', name:'América Móvil', dato:'+6.1% dividendo', color:'#059669' },
    { pos:'3', name:'Bimbo', dato:'+4.8% dividendo', color:'#f59e0b' },
    { pos:'4', name:'Banorte', dato:'+4.2% dividendo', color:'#f59e0b' },
    { pos:'5', name:'Cemex', dato:'+3.1% dividendo', color:'#78716c' },
  ];
  await render({
    type:'div', props:{ style:{ width:W, height:H, background:'#fff', display:'flex', flexDirection:'column', position:'relative', fontFamily:'Inter', padding:'48px' }, children:[
      { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:'#1c1917', lineHeight:1.15 }, children:'Empresas mexicanas que más te pagan por invertir' }},
      { type:'div', props:{ style:{ fontSize:16, fontWeight:400, color:'#78716c', marginTop:8, marginBottom:24 }, children:'Dividendos 2026 — BMV' }},
      ...ranked.map(r => ({
        type:'div', props:{ style:{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom:'1px solid #e7e5e4' }, children:[
          { type:'div', props:{ style:{ fontSize:28, fontWeight:700, color:'#dc2626', width:36 }, children: r.pos }},
          { type:'div', props:{ style:{ flex:1, fontSize:22, fontWeight:600, color:'#1c1917' }, children: r.name }},
          { type:'div', props:{ style:{ fontSize:22, fontWeight:700, color: r.color }, children: r.dato }},
        ]}
      })),
      sourceLine('Fuente: BMV, abril 2026'),
      logoPill(),
      brandBar(),
    ]}
  }, '7-ranking-list.png');

  // ═══ 8. POP CONTEXT ═══
  await render({
    type:'div', props:{ style:{ width:W, height:H, background:'#1c1917', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', fontFamily:'Inter', padding:'56px' }, children:[
      { type:'div', props:{ style:{ background:'#dc2626', color:'#fff', padding:'6px 16px', borderRadius:50, fontSize:13, fontWeight:700, letterSpacing:1, display:'flex', alignSelf:'flex-start' }, children:'TRENDING' }},
      { type:'div', props:{ style:{ fontSize:44, fontWeight:700, color:'#fff', lineHeight:1.15, marginTop:24 }, children:'Noruega invirtió su petróleo. México lo gastó.' }},
      { type:'div', props:{ style:{ fontSize:22, fontWeight:400, color:'rgba(255,255,255,0.6)', lineHeight:1.4, marginTop:20 }, children:'El fondo soberano de Noruega vale $1.7 trillones. México no tiene uno. ¿Qué podemos aprender?' }},
      sourceLine('', true),
      logoPill(true),
      brandBar(),
    ]}
  }, '8-pop-context.png');

  console.log(`\nDone! 8 templates in Contenido_IG/template-previews/`);
}

main().catch(console.error);
