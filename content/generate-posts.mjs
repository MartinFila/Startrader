import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load fonts
const fontBold = readFileSync(join(__dirname, 'fonts/Inter-Bold.ttf'));
const fontMedium = readFileSync(join(__dirname, 'fonts/Inter-Medium.ttf'));
const fontRegular = readFileSync(join(__dirname, 'fonts/Inter-Regular.ttf'));

const fonts = [
  { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  { name: 'Inter', data: fontMedium, weight: 500, style: 'normal' },
  { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
];

const W = 1080;
const H = 1080;

// Color palette
const C = {
  bg1: '#0a0f1a',       // deep navy
  bg2: '#111827',       // dark blue-gray
  accent: '#f59e0b',    // amber/gold
  accent2: '#10b981',   // emerald green
  accent3: '#ef4444',   // red
  text: '#f8fafc',      // almost white
  textMuted: '#94a3b8',  // slate
  textDim: '#64748b',   // dimmer slate
  card: '#1e293b',      // card bg
  cardBorder: '#334155', // card border
};

async function renderPost(element, filename) {
  const svg = await satori(element, {
    width: W,
    height: H,
    fonts,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  const png = resvg.render().asPng();
  const outPath = join(__dirname, 'posts', filename);
  writeFileSync(outPath, png);
  console.log(`Generated: ${outPath}`);
}

// ============================================================
// POST 1: Stat Quote — "Solo el 8.8% de los mexicanos invierte"
// ============================================================
const post1 = {
  type: 'div',
  props: {
    style: {
      width: W, height: H,
      background: `linear-gradient(145deg, ${C.bg1}, ${C.bg2})`,
      display: 'flex', flexDirection: 'column',
      padding: '80px 70px',
      fontFamily: 'Inter',
    },
    children: [
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 148, fontWeight: 700, color: C.accent, lineHeight: 1 },
                children: '8.8%',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 44, fontWeight: 500, color: C.text, marginTop: 30, lineHeight: 1.3 },
                children: 'de los mexicanos invierte en acciones o crypto.',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 36, fontWeight: 400, color: C.textMuted, marginTop: 25, lineHeight: 1.4 },
                children: '¿Eres parte del 91.2% que no lo hace?',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 22, color: C.textDim, fontWeight: 400 },
                children: 'Fuente: ENIF 2024 — INEGI',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 24, color: C.accent, fontWeight: 700 },
                children: '@____',
              },
            },
          ],
        },
      },
    ],
  },
};

// ============================================================
// POST 2: News Explainer — "La Fed mantuvo tasas"
// ============================================================
const post2 = {
  type: 'div',
  props: {
    style: {
      width: W, height: H,
      background: `linear-gradient(145deg, ${C.bg1}, #0f172a)`,
      display: 'flex', flexDirection: 'column',
      padding: '70px',
      fontFamily: 'Inter',
    },
    children: [
      {
        type: 'div',
        props: {
          style: {
            background: C.accent, color: C.bg1,
            padding: '12px 28px', borderRadius: 50,
            fontSize: 22, fontWeight: 700,
            display: 'flex', alignSelf: 'flex-start',
          },
          children: 'NOTICIAS',
        },
      },
      {
        type: 'div',
        props: {
          style: {
            fontSize: 52, fontWeight: 700, color: C.text,
            marginTop: 45, lineHeight: 1.2,
          },
          children: 'La inflación en alimentos en México subió a 6.2%',
        },
      },
      {
        type: 'div',
        props: {
          style: {
            fontSize: 34, fontWeight: 400, color: C.textMuted,
            marginTop: 35, lineHeight: 1.5,
          },
          children: 'Esto significa que lo que costaba $1,000 en el super hace un año, hoy cuesta $1,062. Tu sueldo sigue igual.',
        },
      },
      {
        type: 'div',
        props: {
          style: {
            background: C.card, borderRadius: 20,
            padding: '30px 35px', marginTop: 40,
            display: 'flex', flexDirection: 'column',
            border: `1px solid ${C.cardBorder}`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 26, fontWeight: 700, color: C.accent, marginBottom: 12 },
                children: '¿Qué puedes hacer?',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 26, fontWeight: 400, color: C.text, lineHeight: 1.5 },
                children: 'Si tu dinero está en una cuenta que paga menos del 6.2%, estás perdiendo poder adquisitivo cada mes.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 20, color: C.textDim },
                children: 'INEGI — Marzo 2026',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 24, color: C.accent, fontWeight: 700 },
                children: '@____',
              },
            },
          ],
        },
      },
    ],
  },
};

// ============================================================
// POST 3: Comparativa — "¿Dónde poner tu dinero hoy?"
// ============================================================
function makeRow(name, rate, color, isHeader) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '22px 0',
        borderBottom: isHeader ? `2px solid ${C.cardBorder}` : `1px solid ${C.cardBorder}`,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { fontSize: isHeader ? 24 : 32, fontWeight: isHeader ? 500 : 400, color: isHeader ? C.textDim : C.text },
            children: name,
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: isHeader ? 24 : 40, fontWeight: 700, color: color || C.text },
            children: rate,
          },
        },
      ],
    },
  };
}

const post3 = {
  type: 'div',
  props: {
    style: {
      width: W, height: H,
      background: `linear-gradient(145deg, ${C.bg1}, ${C.bg2})`,
      display: 'flex', flexDirection: 'column',
      padding: '70px',
      fontFamily: 'Inter',
    },
    children: [
      {
        type: 'div',
        props: {
          style: { fontSize: 46, fontWeight: 700, color: C.text, lineHeight: 1.2 },
          children: '¿Dónde conviene poner tu dinero hoy?',
        },
      },
      {
        type: 'div',
        props: {
          style: { fontSize: 26, fontWeight: 400, color: C.textMuted, marginTop: 15 },
          children: 'Rendimiento anual — Marzo 2026',
        },
      },
      {
        type: 'div',
        props: {
          style: {
            background: C.card, borderRadius: 20, padding: '20px 35px',
            marginTop: 40, display: 'flex', flexDirection: 'column',
            border: `1px solid ${C.cardBorder}`,
          },
          children: [
            makeRow('Plataforma', 'Tasa', null, true),
            makeRow('Nu México', '14.5%', C.accent2, false),
            makeRow('Hey Banco', '13.0%', C.accent2, false),
            makeRow('Mercado Pago', '11.8%', C.accent, false),
            makeRow('CETES 28 días', '6.8%', C.accent3, false),
            makeRow('Cuenta bancaria', '~1%', C.accent3, false),
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { fontSize: 24, color: C.textMuted, marginTop: 30, lineHeight: 1.4 },
          children: 'Si tu dinero está en una cuenta bancaria normal, la inflación (4.6%) te come el rendimiento. Estás perdiendo dinero.',
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 24, color: C.accent, fontWeight: 700 },
                children: '@____',
              },
            },
          ],
        },
      },
    ],
  },
};

// ============================================================
// POST 4: Quote + Context — Buffett
// ============================================================
const post4 = {
  type: 'div',
  props: {
    style: {
      width: W, height: H,
      background: `linear-gradient(145deg, #1a1207, ${C.bg1})`,
      display: 'flex', flexDirection: 'column',
      padding: '80px 70px',
      fontFamily: 'Inter',
    },
    children: [
      {
        type: 'div',
        props: {
          style: { fontSize: 100, color: C.accent, lineHeight: 0.8 },
          children: '"',
        },
      },
      {
        type: 'div',
        props: {
          style: { fontSize: 44, fontWeight: 700, color: C.text, lineHeight: 1.35, marginTop: 10 },
          children: 'No ahorres lo que queda después de gastar. Gasta lo que queda después de ahorrar.',
        },
      },
      {
        type: 'div',
        props: {
          style: { fontSize: 28, fontWeight: 500, color: C.accent, marginTop: 30 },
          children: '— Warren Buffett',
        },
      },
      {
        type: 'div',
        props: {
          style: {
            background: C.card, borderRadius: 20,
            padding: '30px 35px', marginTop: 50,
            display: 'flex', flexDirection: 'column',
            border: `1px solid ${C.cardBorder}`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 26, fontWeight: 700, color: C.accent, marginBottom: 12 },
                children: 'Cómo aplicarlo:',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 26, fontWeight: 400, color: C.text, lineHeight: 1.5 },
                children: 'El día que te cae el sueldo, transfiere el 20% a una cuenta separada ANTES de pagar cualquier cosa. Lo que queda es lo que tienes para gastar. No al revés.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 24, color: C.accent, fontWeight: 700 },
                children: '@____',
              },
            },
          ],
        },
      },
    ],
  },
};

// ============================================================
// POST 5: How it works — "¿Qué es la inflación?"
// ============================================================
const post5 = {
  type: 'div',
  props: {
    style: {
      width: W, height: H,
      background: `linear-gradient(145deg, ${C.bg1}, ${C.bg2})`,
      display: 'flex', flexDirection: 'column',
      padding: '70px',
      fontFamily: 'Inter',
    },
    children: [
      {
        type: 'div',
        props: {
          style: {
            background: C.accent2, color: C.bg1,
            padding: '12px 28px', borderRadius: 50,
            fontSize: 22, fontWeight: 700,
            display: 'flex', alignSelf: 'flex-start',
          },
          children: 'CÓMO FUNCIONA',
        },
      },
      {
        type: 'div',
        props: {
          style: { fontSize: 52, fontWeight: 700, color: C.text, marginTop: 40, lineHeight: 1.2 },
          children: '¿Qué es la inflación?',
        },
      },
      {
        type: 'div',
        props: {
          style: { fontSize: 30, fontWeight: 400, color: C.textMuted, marginTop: 30, lineHeight: 1.5 },
          children: 'Es cuando el dinero pierde valor. Los precios suben, pero tu sueldo no sube al mismo ritmo.',
        },
      },
      {
        type: 'div',
        props: {
          style: {
            background: C.card, borderRadius: 20,
            padding: '30px 35px', marginTop: 35,
            display: 'flex', flexDirection: 'column',
            border: `1px solid ${C.cardBorder}`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 24, fontWeight: 700, color: C.accent, marginBottom: 15 },
                children: 'Ejemplo real:',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 26, fontWeight: 400, color: C.text, lineHeight: 1.5 },
                children: 'Si en 2024 tu canasta del super costaba $1,000 y la inflación fue 4.6%, hoy esa misma canasta cuesta $1,046. Pero si tu sueldo no subió 4.6%, comprás menos con el mismo dinero.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: {
            background: C.card, borderRadius: 20,
            padding: '30px 35px', marginTop: 20,
            display: 'flex', flexDirection: 'column',
            border: `1px solid ${C.cardBorder}`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 24, fontWeight: 700, color: C.accent2, marginBottom: 12 },
                children: '¿Qué puedes hacer?',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 26, fontWeight: 400, color: C.text, lineHeight: 1.5 },
                children: 'Pon tu dinero donde rinda más que la inflación. Si la inflación es 4.6% y tu cuenta paga 1%, estás perdiendo 3.6% al año.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 24, color: C.accent, fontWeight: 700 },
                children: '@____',
              },
            },
          ],
        },
      },
    ],
  },
};

// Generate all posts
async function main() {
  mkdirSync(join(__dirname, 'posts'), { recursive: true });

  await renderPost(post1, '01-stat-8-percent.png');
  await renderPost(post2, '02-news-inflacion.png');
  await renderPost(post3, '03-comparativa-tasas.png');
  await renderPost(post4, '04-quote-buffett.png');
  await renderPost(post5, '05-como-funciona-inflacion.png');

  console.log('\nDone! 5 posts generated in content/posts/');
}

main().catch(console.error);
