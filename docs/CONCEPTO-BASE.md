# Concepto Base: Cuenta Faceless IG — Educación Financiera

> **Fecha**: 2026-03-31
> **Estado**: Documento vivo — se actualiza a medida que avanzamos
> **Fuentes**: Research de Notion (2 docs), reunión Diana Córdoba, investigación de mercado México, análisis competitivo de 8+ cuentas

---

## 1. El Concepto (en una frase)

**"Te explico cómo funciona el dinero, con lo que está pasando hoy."**

No es teoría financiera. No es motivación. No es un curso. Es una cuenta que toma lo que está pasando en el mundo — una noticia, una decisión de un banco central, un dato nuevo — y te explica qué significa para tu bolsillo y qué podés hacer.

---

## 2. Audiencia

### Primaria
- LATAM general (español neutro con contenido universal)
- 22-35 años, digitales, quieren aprender pero no saben por dónde empezar
- Mezcla de gente que está endeudada, gente que recién empieza a ahorrar, y gente que quiere invertir
- Usan Instagram como fuente de información

### Por qué LATAM y no un solo país
- El contenido universal (inflación, ahorro, inversión, cómo funciona el dinero) aplica a todos
- Contenido local específico se puede meter como bonus, no como base
- Permite escalar sin crear cuentas separadas por país
- 500M+ hispanohablantes es el mercado total

### Datos clave de la audiencia (México como referencia)
- 62% quiere salir de deudas como meta #1 de 2026
- 77% vive al límite o más allá de su ingreso
- Solo 21.6% tiene alguna inversión
- Solo 8.8% invierte en acciones o crypto
- 68% no ahorra de forma regular
- Solo 36% hace presupuesto mensual
- Desconfianza masiva hacia finfluencers (asociados con cursos caros y Lamborghinis)

---

## 3. Qué es la cuenta

### Contenido (mix)

| Tipo | % | Qué es | Ejemplo |
|------|---|--------|---------|
| Noticias + explicación | 30% | Algo pasó hoy → qué significa → qué hacer | "La Fed subió tasas — por qué te afecta vivas donde vivas" |
| Cómo funciona el dinero | 25% | Conceptos explicados simple, con ejemplos reales | "Qué es la inflación y por qué tu sueldo compra menos cada año" / "Interés compuesto explicado simple" |
| Tips prácticos | 20% | Cosas que podés hacer HOY | "Cómo ahorrar el 20% de tu sueldo sin sufrirla" / "La regla 50/30/20 en la vida real" |
| Frases de inversores + contexto | 15% | No la frase sola — la frase + cómo aplicarla | "Buffett: 'Nunca inviertas en algo que no entiendas' — qué significa si querés empezar a invertir" |
| Datos/comparativas | 10% | Números actualizados que la gente necesita | "Cuánto necesitás ahorrado a los 30, 35, 40" |

### Formatos de contenido

| Formato | Para qué | Automatización |
|---------|----------|---------------|
| Carruseles educativos (5-10 slides) | Explicar conceptos, comparativas, tips paso a paso. Generan SAVES. | 8/10 — Satori/Playwright genera las imágenes |
| Quotes con contexto | Frases de inversores + bajada práctica. Generan SHARES. | 10/10 — template + texto |
| Reels cortos (15-30s) | Noticias del día explicadas. Generan REACH. | 7/10 — Remotion + ElevenLabs |
| Stories interactivas | Polls, quizzes, preguntas. Generan ENGAGEMENT. | 6/10 — templates + publicación manual |

### Formatos rankeados por automatización (del research original)
- Quotes/Gráficos: 10/10 — texto sobre fondo, template + Claude = 100% automático
- Carruseles educativos: 8/10 — 10 slides 1080x1080, generan saves
- Reels stock+texto: 6/10 — Fliki/Zebracat desde texto
- Media brand/Noticias: 7/10 — Claude cura noticias
- Screen recordings: 4/10 — requiere grabación manual (NO para el POC)

### Lo que NO es la cuenta
- No es un guru que te dice cómo hacerte rico
- No vende cursos ni mentoría (al menos no al principio)
- No promociona ningún broker o plataforma en el contenido (la monetización vive en el link de bio)
- No es solo México — es LATAM
- No es solo noticias — también explica conceptos y da tips prácticos
- No es contenido atemporal genérico — siempre tiene conexión con algo que pasa HOY

---

## 4. Tono y personalidad

### Cómo habla la cuenta
- **Directo**: sin rodeos, sin jerga innecesaria
- **Con datos**: siempre que se pueda, un número y una fuente
- **Sin bullshit**: si algo no conviene, lo dice. Si no sabe, lo dice.
- **Accesible**: como un amigo que sabe de finanzas te explica algo en un café
- **Español neutro**: no mexicanismos fuertes, no argento, no colombiano. Español que entiende todo LATAM.
- **Aspiracional pero realista**: "podés mejorar tu situación" pero no "hazte millonario en 90 días"

### Cómo NO habla
- No usa "libertad financiera" ni "ingreso pasivo" ni "mentalidad millonaria"
- No promete retornos ni resultados específicos
- No se burla de la gente que no sabe
- No es condescendiente
- No flexea estilo de vida

---

## 5. Los 6 principios de construcción

### Principio 1: Confianza primero, monetización después
- El contenido nunca promociona un producto
- Monetización vive en el link de bio (affiliate intercambiable)
- Los primeros 3 meses son solo contenido. Cero push a vender.

### Principio 2: Diseñar para que la gente lo envíe, no para que le dé like
- DM shares = señal #1 para crecer (Mosseri, CEO de IG, 2026)
- Cada post se evalúa con: "¿alguien mandaría esto por DM?"
- Contenido con datos específicos y revelaciones > quotes genéricos

### Principio 3: Decir algo diferente, no decir lo mismo mejor
- @el.inversor.eficiente ya hace educación financiera genérica en español (777K)
- Nuestro ángulo: siempre conectado con lo que pasa HOY + explicación simple
- No competimos siendo mejor — competimos siendo diferente

### Principio 4: La red es el moat, no el contenido
- Jason Stone: 15 cuentas con shoutouts → $7M
- Construir la red de shoutouts desde la semana 1
- A mediano plazo: red multi-cuenta propia por país

### Principio 5: Un país, un formato, una cuenta — probar antes de escalar
- LATAM general primero en Instagram
- Si funciona, expandir a TikTok, YouTube
- Si funciona, crear cuentas por país para contenido local
- "Sequential not simultaneous" (Zac, $67K/mes con 14 páginas)

### Principio 6: La automatización es para sostener, no para diferenciar
- SanchoCMO permite consistencia (mata el riesgo de abandono del 75%)
- Cada pieza necesita dirección humana y spin original
- El agente genera, publica, mide, aprende — pero Martín aprueba

---

## 6. Señales del algoritmo 2026 (Mosseri)

Las señales que definen CÓMO creamos cada pieza:

1. **DM Shares** — Cuando alguien envía tu post por DM, Instagram lo muestra a más gente que NO te sigue. Señal #1 para crecer con no-seguidores.
2. **Watch Time** — Reels con >60% retención explotan. Los de <40% mueren.
3. **Saves** — Señal de autoridad. Carruseles educativos generan saves.
4. **Originality Score** — Penaliza contenido reciclado. Siempre añadir spin único.
5. **Trial Reels** — Feature para testear con no-seguidores sin arriesgar el feed.
6. **Mezclar formatos** — Cuentas que mezclan crecen 2.5x más rápido.

### CTAs optimizados para el algoritmo
- **Para DM shares**: "Envíale esto a alguien que necesita verlo"
- **Para saves**: "Guarda este post para cuando lo necesites"
- **Para comentarios**: Binary Choice Close → "¿Ahorro o inversión? Comenta 💰 o 📈"
- **Para DM automation**: "Comenta GUÍA y te la mando por DM"

---

## 7. Monetización (después del POC)

### Funnel
```
Contenido gratuito (IG)
    ↓
DM keyword ("GUÍA", "INICIO")
    ↓
Lead magnet gratis (PDF de presupuesto, guía de ahorro)
    ↓
Email capture
    ↓
Telegram gratuito (comunidad)
    ↓
Telegram premium (contenido exclusivo) — futuro
    ↓
Affiliate en bio (Star Trader u otro) — para los que quieran operar
    ↓
Copy Trading (Star Trader) — futuro
```

### Star Trader (affiliate principal)
- Modelo Rebate: $8/lote operado, pago inmediato
- No requiere calificación ni cumplir mínimos
- Socio NBA, 6 regulaciones, seguro Lloyd's hasta $1M
- Copy Trading: traders master cobran 20-50% performance fee
- Países: toda LATAM, Italia, Portugal, Alemania. NO USA/Irán. España con cuidado.
- Referencia: Duván Nava (IG) como caso exitoso
- Canal de conversión: IG captar → Telegram convertir
- Contacto: Diana Córdoba

### Timeline de monetización
- Meses 1-3: Solo contenido. Affiliate en bio pero no empujamos.
- Meses 3-5: DM automation + lead magnet + email capture.
- Meses 5-7: Telegram gratuito (comunidad).
- Meses 7+: Telegram premium + copy trading para los que quieran operar.

---

## 8. Competencia

### Faceless en español
| Cuenta | Seguidores | Qué hace | Nuestra diferencia |
|--------|-----------|----------|-------------------|
| @el.inversor.eficiente | 777K | Educación genérica (bolsa, cripto, inmuebles). Equipo profesional. LATAM genérico. | Nosotros: siempre conectado con noticias de HOY + explicación simple |
| @trading.latam_ | ~11K | Trading LATAM, muy chica | Nosotros: más amplio que solo trading |

### Con cara en México
| Cuenta | Seguidores | Qué hace |
|--------|-----------|----------|
| @finanzas.conproposito (Paola) | 1.6M | Finanzas personales, accesible, para principiantes |
| @soymacariva | 622K | Finanzas para mujeres |
| @invierteconpepe_ | 398K | Inversiones, tono casual |
| @pequenocerdocapitalista | 178K | Finanzas para "hippies, yuppies y bohemios" |

### Faceless en inglés (modelo a estudiar)
| Cuenta | Seguidores | Qué hizo bien |
|--------|-----------|--------------|
| @millionaire_mentor | 10M+ | Red de 15 cuentas con shoutouts → $7M |
| @wealth.ceo | 143K | 134 posts = 143K. Calidad > volumen. |
| @thewealthdad | 55K | Carruseles educativos genuinos. Portfolio real de $360K. |
| @fullystaked | 692K | Red multi-cuenta con shoutouts cruzados propios |

### Insight clave de la competencia
- Las cuentas que crecen más rápido no tienen el mejor contenido — tienen la mejor red de distribución (shoutouts)
- @wealth.ceo demuestra que 134 posts de calidad extrema > 1,536 posts mediocres
- Ninguna cuenta faceless en español conecta noticias con educación financiera en tiempo real
- Ninguna tiene un formato visual propio inmediatamente reconocible

---

## 9. Crecimiento

### Motor 1: Reels (reach — traer gente nueva)
- 30.8% reach rate (vs 14.4% carruseles)
- 55% de views viene de NO seguidores
- Hook en primeros 2 segundos
- Subtítulos obligatorios (+38% retención)
- Audio original recibe preferencia algorítmica

### Motor 2: Carruseles (confianza — convertir)
- Generan saves = señal de autoridad
- Construyen la confianza que lleva al clic en el affiliate
- 1.05% engagement en carruseles vs <0.1% en Reels (@thewealthdad)

### Motor 3: Red de shoutouts (multiplicador)
- Jason Stone: 15 cuentas → 2M en <2 años
- Intercambios gratuitos entre cuentas de tamaño similar
- Empezar desde semana 1, no semana 3
- A mediano plazo: red multi-cuenta propia (por país)

### Frecuencia y horarios
- 5 posts/semana (2x crecimiento, +12% reach)
- Mejores horarios LATAM: Lun-Jue 7-9 AM, 12-2 PM, 5-9 PM
- Mejores días: Miércoles y Jueves

### Hashtags (6-9 por post)
- Tier 1 — Reach: #finanzaspersonales #dinero #ahorro #inversiones #libertadfinanciera
- Tier 2 — Engagement: #educacionfinanciera #ingresospasivos #trading #criptomonedas
- Tier 3 — Nicho: #tradinglatam #inversionesenlatam #finanzaslatam

---

## 10. Ejecución técnica

### El agente (tulanamx-content-engine)
Corre diario:
```
06:00  DATA FEED
       └→ daily-pulse: noticias financieras globales + LATAM
       └→ ig-winner-detector: qué publicó la competencia ayer

07:00  DECISIÓN
       └→ Lee learnings.md (qué funcionó, qué no)
       └→ Lee calendario (qué toca hoy según mix)
       └→ Elige: tema + formato + hook

08:00  CREACIÓN
       └→ instagram-content: genera copy, caption, hashtags
       └→ Satori/Playwright: genera imágenes (1080x1080)
       └→ Si es Reel: Remotion + ElevenLabs genera video

09:00  REVISIÓN (semana 1-2: Martín aprueba. Después: auto)

12:00  PUBLICACIÓN
       └→ instagram skill: publica via Graph API
       └→ ManyChat: DM automation activa

LUNES  ANÁLISIS SEMANAL
       └→ Pull métricas de cada post
       └→ Clasifica: hook failure vs CTA failure
       └→ Actualiza learnings.md
       └→ Ajusta estrategia de la semana siguiente
```

### Stack técnico
| Capa | Herramienta | Costo |
|------|-------------|-------|
| Imágenes estáticas | Satori + resvg-js (HTML→PNG) | Gratis |
| Imágenes backup | Playwright (CSS completo) | Gratis |
| Imágenes AI | Gemini/NanoBanana | ~$0.04/imagen |
| Reels | Remotion (React→MP4) | Gratis (<3 personas) |
| Voz AI | ElevenLabs | $5-22/mes |
| Video rápido | Fliki | $66/mes (con API) |
| Publicación IG | Instagram Graph API | Gratis |
| DM automation | ManyChat | $15/mes |
| Analytics | Instagram Insights API | Gratis |
| Espionaje | Apify | Free tier |
| Contenido | SanchoCMO (80+ skills) | Ya existe |

### Skills ya listas (SanchoCMO)
- `daily-pulse` — noticias del día
- `instagram-content` — captions, hooks, CTAs, hashtags
- `content-calendar-planner` — calendario editorial
- `brand-voice` — tono de la cuenta
- `visual-identity` — sistema visual
- `ig-winner-detector` — contenido viral de competencia
- `thief-marketers` — análisis de competencia
- `content-atomizer` — romper contenido en piezas
- `growth4u-visual-generator` — pipeline probado HTML→PNG
- `direct-response-copy` — copy de conversión (post-POC)
- `marketing-psychology` — modelos de persuasión (post-POC)
- `ad-creative` — creativos para ads (post-POC)
- `paid-ads` — estrategia de ads (post-POC)
- `meta-ads` — ejecución Meta Ads API (post-POC)
- `email-sequences` — nurture email (post-POC)

### Skills a instalar (Antigravity)
- `instagram` — publicar via Graph API + analytics + DMs
- `canva-automation` — diseños complejos
- `image-studio` — router de generación de imágenes
- `apify-influencer-discovery` — encontrar cuentas para shoutouts
- `apify-trend-analysis` — contenido viral del nicho
- `apify-content-analytics` — métricas de engagement

### Skills a construir (nuevas)
- `[nombre]-content-engine` — El agente central: genera → diseña → publica → mide → aprende
- `[nombre]-data-feed` — Scraper de datos financieros (tasas, inflación, tipo de cambio)

---

## 11. Criterios de éxito del POC (6 semanas)

| Métrica | Éxito | Aceptable | Fracaso |
|---------|-------|-----------|---------|
| Seguidores | >800 | 400-800 | <400 |
| Engagement rate | >4% | 2-4% | <2% |
| Posts publicados | 30+ | 20-30 | <20 |
| Saves por carrusel | >20 | 10-20 | <10 |
| Watch time Reels | >50% | 30-50% | <30% |
| Cuentas contactadas shoutouts | 15+ | 10-15 | <10 |
| Shoutouts recíprocos | 3+ | 1-3 | 0 |

### Qué hacemos según el resultado
- **Éxito** → Escalar: más frecuencia, activar YouTube/TikTok, monetización, segunda cuenta por país
- **Aceptable** → Iterar: analizar qué formatos funcionaron, ajustar hooks, 4 semanas más
- **Fracaso** → Diagnosticar: ¿contenido malo, nicho mal elegido, o ejecución falló? Pivotar o matar

---

## 12. Inversión del POC

| Concepto | Costo | Notas |
|----------|-------|-------|
| ElevenLabs | $5-22/mes | Voz AI para Reels |
| ManyChat | $15/mes | DM automation |
| Apify | $0 | Free tier |
| SanchoCMO | $0 | Ya existe |
| Ads | $0 | No en el POC |
| **Total** | **~$20-37/mes** | |

Tiempo humano: ~5 horas/semana (setup semana 0 más intensivo: ~15 horas).

---

## PENDIENTE DE DEFINIR

- [ ] **Nombre de la cuenta** — depende de ver el contenido
- [ ] **Identidad visual** — paleta, tipografía, estilo de templates
- [ ] **5 posts de ejemplo** — para validar el concepto antes de crear la cuenta
- [ ] **Bio de Instagram** — después del nombre
