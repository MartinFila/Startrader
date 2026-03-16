# Plan Estratégico: Cuentas Instagram Faceless — Educación Financiera LATAM

> **Fecha**: 2026-03-15
> **Motor de ejecución**: SanchoCMO
> **Monetización**: Affiliate links en bio (actualmente Star Trader, intercambiable)

---

## Qué vamos a hacer y por qué

Vamos a construir un sistema automatizado que opere cuentas de Instagram faceless (sin cara) enfocadas en educación financiera para Latinoamérica. El contenido es 100% educativo — trading, ahorro, inversiones, mercados — y nunca promociona ninguna plataforma específica. La monetización vive exclusivamente en el link de bio, donde actualmente tenemos un affiliate de Star Trader que paga $8 por lote operado.

**¿Por qué este proyecto?**

El nicho de educación financiera faceless en español está prácticamente vacío. En inglés, @wealth tiene 14M de seguidores y @millionaire_mentor generó $7M en 18 meses con quotes simples. En español, la cuenta más grande de trading faceless tiene ~11K seguidores. Nadie está ejecutando con la sofisticación de herramientas que nosotros tenemos (Claude + SanchoCMO + APIs de publicación). La combinación de automatización + nicho vacío + red de shoutouts es lo que puede hacer que lleguemos a 30-60K en 12 meses donde otros tardarían 3+ años.

**¿Por qué automatizar con SanchoCMO?**

Porque el cuello de botella de las cuentas faceless no es la calidad del contenido — es el volumen sostenido y la consistencia. Jason Stone publicaba 2-3 posts diarios manualmente durante años. Nosotros podemos lograr eso con 1-2 horas semanales de supervisión humana, dejando que SanchoCMO genere el contenido, lo formatee, lo publique y mida qué funciona.

---

## PARTE 1: Estrategia Macro

### La tesis central

El crecimiento en Instagram depende de 3 cosas, en este orden de importancia:

1. **La red** (shoutouts cruzados entre cuentas del nicho) — es lo que separa crecimiento lineal de exponencial
2. **El contenido correcto** (formatos que el algoritmo favorece + temas que la audiencia comparte) — no el "mejor" contenido, sino el que genera saves y DM shares
3. **La consistencia** (3-5 posts/semana mínimo, sin fallar) — esto es lo que SanchoCMO resuelve

### Los dos multiplicadores del algoritmo 2026

Adam Mosseri (CEO de Instagram) confirmó en 2026 que las dos señales más fuertes del algoritmo son:

- **DM Shares**: Cuando alguien envía tu post por DM a otra persona, Instagram lo interpreta como contenido de altísimo valor y lo muestra a más gente que NO te sigue. Esta es la señal #1 para crecer con audiencia nueva.
- **Watch Time**: Para Reels, el completion rate y los rewatches son la métrica principal. Reels con >60% de retención superan 5-10x a los que tienen <40%.

Esto cambia la estrategia: no optimizamos para likes (vanidad) sino para que la gente **envíe** nuestro contenido a sus amigos y **termine** de ver nuestros videos.

### Cómo se baja al proceso

Cada pieza de contenido que creamos debe pasar el test: **"¿Alguien enviaría esto a un amigo?"**. Si la respuesta es no, reescribimos el hook. Esto se traduce en:

- **Datos sorprendentes** > tips genéricos ("El 90% de los traders pierden dinero" > "5 tips para invertir")
- **Comparativas polémicas** > listas ("¿Forex o Crypto?" > "Las mejores inversiones")
- **CTAs de envío** > CTAs de like ("Envíale esto a alguien que necesita saberlo" > "Dale like")
- **Screen recordings reales** > stock footage (82% watch time vs 60% promedio)

---

## PARTE 2: Estrategia de cada fase del proceso

### Fase 1: Inteligencia — ¿De qué hablamos hoy?

**Objetivo estratégico**: No publicar contenido al azar. Cada post debe estar alineado con lo que está pasando en los mercados y lo que está viral en el nicho. Las cuentas que publican contenido relevante al momento generan 3x más engagement que las que publican contenido atemporal.

**Cómo funciona**: Todos los días a las 6 AM, el sistema escanea dos fuentes:
- **Noticias de mercados LATAM**: ¿El oro subió? ¿Hubo una regulación nueva en México? ¿Bitcoin rompió un récord? Estas son oportunidades de contenido inmediato.
- **Contenido viral del nicho**: ¿Qué publicaron los competidores que tuvo 3x más views de lo normal? Ese tema o formato claramente funciona — lo adaptamos con nuestro ángulo.

**Por qué importa**: Las cuentas que estudié para el doc de Notion (@wealth, @millionaire_mentor) no inventan temas — curan lo que ya está funcionando y le dan su ángulo. Esto es replicable al 100% con IA.

**Workflow**:

```
🟢 daily-pulse (ya existe en SanchoCMO)
│  Escanea noticias de mercados financieros
│  Filtra las relevantes para LATAM
│  Output: 3-5 temas del día con contexto
│
🔵 apify-trend-analysis (instalar de antigravity)
│  Scrape de hashtags trending en IG: #trading #inversiones #finanzas
│  Detecta contenido viral en el nicho (outliers con 3x+ views)
│  Output: lista de temas/formatos que están funcionando
│
🟢 thief-marketers + social-media-extractor (ya existen en SanchoCMO)
│  Monitorean a los competidores definidos en competitor-list.md
│  Identifican qué publicaron, qué les funcionó, qué formato usaron
│  Output: ideas de contenido adaptables
```

---

### Fase 2: Planificación — ¿Qué publicamos, en qué formato, a qué hora?

**Objetivo estratégico**: Mantener el ratio de contenido que maximiza crecimiento Y conversión. Los Reels traen gente nueva (30.8% reach rate, 55% de views de no-seguidores), pero los carruseles educativos construyen la confianza que hace que alguien haga clic en el link de afiliado. Publicar solo Reels = muchos seguidores, pocas conversiones. Solo carruseles = engagement pero poco reach. El mix correcto es deliberado.

**El ratio óptimo** (basado en el análisis de las 8 cuentas de referencia):

| Pilar | % | Para qué sirve | Formato principal |
|-------|---|-----------------|-------------------|
| Valor educativo | 40% | Posicionar como autoridad. Saves + shares. | Carruseles, Screen recordings, Reels educativos |
| Relatable | 25% | Conexión emocional. Comentarios + DM shares. | Quotes, Memes financieros, Reels cortos |
| Behind the scenes | 20% | Humanizar la cuenta. Construir comunidad. | Stories, Reels de proceso, Cuenta demo |
| Promocional | 15% | Conversión. Link clicks. | CTAs a bio, Testimonios, Resultados demo |

**Frecuencia**: 5 posts/semana (semanas 1-4), escalando a 7-10/semana (mes 2+). Datos confirman que 3-5 posts/semana genera 2x más crecimiento y +12% reach vs 1-2 posts.

**Horarios óptimos LATAM**: Lun-Jue 7-9 AM, 12-2 PM, 5-9 PM (UTC-5). Mejores días: Miércoles y Jueves.

**Workflow**:

```
🔴 ig-content-planner (CONSTRUIR — skill nueva)
│
│  Lee:
│  ├── Output de daily-pulse → temas del día
│  ├── Output de apify-trend-analysis → qué está viral
│  ├── learnings.md → qué nos funcionó antes
│  ├── content-calendar.md → qué ya publicamos esta semana
│  └── Ratio 40/25/20/15 → qué pilar toca hoy
│
│  Decide:
│  ├── Tema del post
│  ├── Formato (Reel / Carrusel / Quote / Screen recording)
│  ├── Hora de publicación
│  ├── Hook específico
│  └── Tipo de CTA (binario, save, share, DM)
│
│  Output: brief del día
│  {tema, formato, pilar, hook, cta, hashtags, hora}
```

**Por qué es una skill nueva**: Ninguna skill existente combina la lógica de ratio de contenido + horarios LATAM + input de inteligencia diaria + historial de performance. El `content-calendar-planner` de SanchoCMO es genérico y pensado para SEO/blog, no para Instagram faceless con estas reglas específicas.

---

### Fase 3: Creación — Generar el contenido

**Objetivo estratégico**: Producir contenido que sea indistinguible de lo que hace manualmente una cuenta profesional, pero en minutos en vez de horas. La clave no es solo generar texto — es generar el tipo correcto de texto para cada formato, con hooks probados, CTAs que disparen las señales del algoritmo, y disclaimers regulatorios integrados.

**Los formatos y por qué cada uno importa**:

**Carruseles (10 slides, 1080x1080)** — Son los que monetizan. Generan saves (señal #1 del algoritmo para autoridad). @thewealthdad tiene 1.05% engagement con carruseles vs <0.1% con Reels. Nadie hace clic en un affiliate después de un Reel de 15 segundos — lo hace después de guardar 5 carruseles educativos y pensar "esta cuenta sabe de lo que habla".

**Reels (15-60s, 9:16)** — Son los que traen gente nueva. 30.8% reach rate vs 14.4% de carruseles. 55% de views viene de no-seguidores. El hook en los primeros 2 segundos es todo — si no engancha ahí, perdemos al viewer.

**Screen recordings** — Nuestra arma secreta. 82% watch time, el formato faceless con mayor retención. Grabar pantalla de una plataforma de trading mostrando operaciones en demo, análisis de charts, navegación. Ningún competidor en LATAM lo usa consistentemente. Son triviales de producir y altamente credibles.

**Quotes** — Los más fáciles de producir y los que mejor funcionan para engagement rápido. @wealth.ceo llegó a 143K con solo 134 posts de quotes. Pero no quotes motivacionales genéricos — quotes con datos financieros concretos.

**Workflow**:

```
🔴 ig-faceless-content (CONSTRUIR — skill nueva)
│  Recibe el brief del planner
│
│  Genera según formato:
│  ├── CARRUSEL: 10 slides (hook + 8 educativos + CTA)
│  ├── REEL: Script (hook 3s + cuerpo + CTA binario)
│  ├── QUOTE: Dato financiero educativo con fuente
│  └── SCREEN RECORDING: Script de narración + marcadores
│
│  Reglas hardcodeadas en la skill:
│  ├── NUNCA mencionar Star Trader (ni ningún broker) en el copy
│  ├── NUNCA prometer rendimientos ("gana $X al mes")
│  ├── Disclaimer en contenido de trading
│  ├── CTA binario obligatorio en Reels ("¿Forex o oro?")
│  ├── "Guarda este post" en cada carrusel
│  ├── "Envíaselo a alguien" en contenido DM-worthy
│  └── Alt text descriptivo con keywords (IG SEO)
│
│  Output: copy completo + caption + hashtags + instrucciones de diseño
│
│  ↓
│
🔵 canva-automation (instalar de antigravity)
│  Toma el copy y las instrucciones de diseño
│  Aplica brand template (fondo oscuro + neón/dorado + bold sans-serif)
│  ├── Carrusel → 10 PNGs 1080x1080
│  ├── Quote → 1 PNG 1080x1080
│  └── Reel thumbnail → 1 PNG
│
│  Output: archivos visuales listos para publicar
│
│  Para Reels de video:
│  Fliki ($21/mes) o Zebracat ($19/mes)
│  Script de ig-faceless-content → MP4 con stock footage + texto + subtítulos
│
🟢 content-atomizer (ya existe en SanchoCMO)
│  Opcional: toma el carrusel top de la semana
│  Lo rompe en 2-3 quotes individuales + 1 Story
│  Multiplica el contenido sin esfuerzo extra
```

**Por qué ig-faceless-content es una skill nueva**: Las skills genéricas de contenido (`social-content`, `content-creator`) no conocen las reglas del nicho. No saben que hay que evitar prometer rendimientos, que los CTAs deben ser binarios, que los screen recordings necesitan marcadores específicos, ni que el disclaimer regulatorio es obligatorio en contenido de trading. Estas reglas están hardcodeadas en la skill para que sea imposible generar contenido que nos meta en problemas legales.

---

### Fase 4: Publicación — Poner el contenido en Instagram

**Objetivo estratégico**: Eliminar la publicación manual. El factor #1 de fracaso de cuentas faceless es la inconsistencia — el 75% no llega a 10K seguidores porque sus creadores se cansan y dejan de publicar. Al automatizar la publicación, eliminamos ese riesgo.

**Workflow**:

```
🔵 instagram (instalar de antigravity)
│  Skill completa de Instagram via Graph API
│  Ya incluye:
│  ├── publish.py → Publicar imagen, carrusel, reel, story
│  ├── schedule.py → Cola de publicación programada
│  ├── comments.py → Leer y responder comentarios
│  ├── messages.py → DMs (leer, enviar, automatizar)
│  ├── insights.py → Métricas de cada post
│  ├── hashtags.py → Research de hashtags
│  ├── analyze.py → Análisis de rendimiento
│  └── governance.py → Rate limits, audit log, confirmaciones
│
│  Flujo:
│  1. Recibe los assets (PNGs/MP4) de la fase anterior
│  2. Crea container via POST /{ig-user-id}/media
│  3. Publica via POST /{ig-user-id}/media_publish
│  4. Comparte en Stories automáticamente
│  5. Registra post ID + URL + timestamp en publish-log.md
│
│  Rate limits: 200 calls/hora, 100 posts/24h (más que suficiente)
```

**Por qué no construimos una skill nueva para esto**: La skill `instagram` de antigravity ya tiene todo resuelto — OAuth, rate limits, governance, y los 8 módulos que necesitamos. Construir esto desde cero sería reinventar la rueda.

---

### Fase 5: Comunidad — DMs y comentarios

**Objetivo estratégico**: Convertir seguidores en leads y leads en clientes del affiliate. El funnel es: contenido gratuito → DM automation → link a landing con affiliate. El DM automation es clave porque captura al usuario en el momento de máximo interés (justo cuando vio un post que le gustó y quiere saber más).

**Workflow**:

```
🔵 instagram (messages.py — ya incluido en la skill)
│  Keywords que activan respuesta automática:
│  "TRADING", "INICIO", "GUÍA", "EMPEZAR", "INVERTIR", "DEMO"
│
│  Respuesta:
│  "¡Hola! 👋 Te comparto una guía gratuita para empezar:
│   [link lead magnet]
│   Si querés practicar sin riesgo, abrí una cuenta demo:
│   [link affiliate en bio]"
│
│  También:
│  ├── Responder TODOS los comentarios en <60 min
│  └── 30+ engagements en la primera hora = 3x distribución
```

---

### Fase 6: Análisis — ¿Qué funcionó y qué no?

**Objetivo estratégico**: Crear un loop de mejora continua. Sin análisis, publicamos a ciegas. Con análisis, cada semana el contenido es mejor que la anterior porque el planner sabe qué hooks funcionaron, qué formatos generaron más saves, y qué horarios tuvieron más reach.

**Métricas priorizadas** (por importancia para el algoritmo 2026):

1. **DM Sends / Reach** — ¿La gente envía nuestro contenido? Si sí, Instagram nos muestra a más no-seguidores.
2. **Watch Time** — ¿La gente termina de ver nuestros Reels? Si >60%, el Reel explota.
3. **Saves / Reach** — ¿La gente guarda nuestros carruseles? Señal de autoridad.
4. **Profile visits → Link clicks** — ¿Estamos convirtiendo? Esto mide el funnel de affiliate.

**Workflow**:

```
🔵 apify-content-analytics (instalar de antigravity)
│  Pull de métricas de engagement por post
│  Comparación con benchmarks del nicho
│
🔵 instagram (insights.py + analyze.py — ya incluidos)
│  Métricas nativas: reach, impressions, saves, shares
│  Mejores horarios reales (vs los teóricos)
│  Top 3 posts y bottom 3 de la semana
│
│  Output:
│  ├── learnings.md actualizado (patrones detectados)
│  └── weekly-report.md (reporte semanal completo)
│
│  Loop: learnings.md → ig-content-planner → contenido mejorado
```

---

## PARTE 3: Estrategias de Crecimiento — Plan mes a mes

### Mes 1: Fundamentos (semanas 1-4)

**Meta**: 500-1K seguidores. Validar que el contenido funciona.

**Semana 1 — Setup**:
- Definir nombre y branding de la cuenta
- Crear cuenta IG Business + Facebook Page
- Configurar Meta App + tokens Graph API
- Crear brand context en SanchoCMO (`brand/[nombre-cuenta]/`)
- Instalar skills de antigravity en SanchoCMO
- Construir las 2 skills nuevas (`ig-content-planner`, `ig-faceless-content`)
- Crear landing con Linktree + link affiliate Star Trader en bio
- Optimizar perfil: keywords en nombre ("Trading LATAM" o "Inversiones"), bio con CTA "DM 'TRADING' para guía gratis"

**Semana 2 — Primer batch**:
- Generar 40 piezas con SanchoCMO: 10 quotes + 10 carruseles + 10 scripts de Reels + 5 screen recordings + 5 escenarios educativos
- Producir assets visuales con Canva automation
- Test end-to-end: generar → publicar → verificar que funciona
- Configurar DM automation con keywords

**Semana 3 — Lanzamiento**:
- Empezar a publicar 5 posts/semana
- Engagement activo: 20-30 interacciones diarias en cuentas del nicho
- Responder TODO en <60 minutos
- Compartir cada post en Stories inmediatamente
- **Empezar networking para shoutouts**: identificar 30 cuentas target

**Semana 4 — Iterar**:
- Primer análisis de métricas con ig-analytics
- Identificar qué hooks funcionaron, qué formatos tuvieron más saves
- Actualizar learnings.md
- Activar Trial Reels para A/B testing de hooks
- Contactar primeras 10-15 cuentas para proponer shoutouts

**KPIs mes 1**:

| Métrica | Target |
|---------|--------|
| Posts publicados | 20+ |
| Seguidores | 500-1K |
| Engagement rate | >3% |
| Cuentas contactadas para shoutouts | 15 |
| Conversiones affiliate | 0 (normal) |

---

### Mes 2: Comunidad + Red de Shoutouts

**Meta**: 1.5-3K seguidores. Construir la red que acelera todo.

**Estrategia de shoutouts — cómo se implementa**:

Los shoutouts recíprocos son intercambios gratuitos entre cuentas de tamaño similar. Nosotros los mencionamos en nuestros Stories/posts, ellos nos mencionan en los suyos. Las audiencias son del mismo nicho, así que los seguidores nuevos son relevantes para ambos.

Implementación paso a paso:

1. **Encontrar cuentas** (automatizado con SanchoCMO):
   ```
   🔵 apify-influencer-discovery
   │  Busca cuentas por hashtags: #tradinglatam #educacionfinanciera
   │  Filtra por: 1K-50K seguidores, engagement >2%, publica 3x/semana
   │  Output: lista de 30-50 cuentas potenciales con métricas
   ```

2. **Contactar** (semi-manual, asistido por SanchoCMO):
   ```
   🔴 ig-faceless-content genera el template de outreach:
   │  "Hola [nombre]! Me encanta tu contenido sobre [tema].
   │   Estoy creando una cuenta de educación financiera para LATAM.
   │   ¿Te interesa un intercambio de shoutouts gratuito?
   │   Yo te menciono en mis Stories y vos en los tuyos. $0, solo networking."
   │
   Envío: manual via DM de Instagram (no automatizable sin riesgo de ban)
   ```

3. **Organizar la red**:
   - Crear grupo de WhatsApp/Telegram con las cuentas que acepten
   - Establecer calendario: cada cuenta hace 1-2 shoutouts/semana a las demás
   - Opcional: engagement pod — el grupo comenta y comparte en los primeros 30 min post-publicación

4. **Trackear** en `shoutout-tracker.md`:
   ```
   | Cuenta | Seguidores | Contactada | Respuesta | Shoutouts dados | Recibidos |
   |--------|-----------|------------|-----------|-----------------|-----------|
   | @trading.latam_ | 11K | 2026-04-01 | Sí | 2 | 1 |
   ```

**Otras acciones del mes 2**:
- Subir frecuencia a 7 posts/semana
- Crear primer ebook gratuito (lead magnet) — "Cómo empezar a invertir desde $100"
- Crear grupo de Telegram gratuito (embudo intermedio hacia monetización)
- Agregar noticias curadas (2-3/semana) con daily-pulse

**KPIs mes 2**:

| Métrica | Target |
|---------|--------|
| Seguidores | 1.5-3K |
| Red de shoutouts activa | 5-10 cuentas |
| Shoutouts recíprocos/semana | 2-4 |
| Posts/semana | 7 |
| Email leads capturados | 50-100 |
| Conversiones affiliate | 1-3 |

---

### Mes 3: Primeros Ingresos + Escalar Contenido

**Meta**: 3-5K seguidores. Primeros ingresos recurrentes del affiliate.

**Estrategia de escalado de contenido**:

Con 2 meses de datos en learnings.md, el sistema ya sabe qué funciona. Ahora escalamos lo que funciona y eliminamos lo que no.

- Duplicar los formatos ganadores (ej: si los screen recordings tienen 82% watch time, hacemos más)
- Publicar los hooks ganadores en nuevos temas (el hook funciona independientemente del tema)
- Activar content-atomizer a fondo: cada carrusel top → 2-3 quotes + 1 Story + 1 Reel corto

**Nuevas fuentes de ingreso**:
- Primer ebook pago en Gumroad ($5-15) — "Guía completa de trading para principiantes LATAM"
- Telegram premium ($10-20/mes) — contenido exclusivo, análisis diarios

**Shoutouts**: La red ya debe tener 10-15 cuentas activas. Ahora se formaliza con calendario fijo y se empieza a medir el impacto (seguidores ganados por shoutout).

**KPIs mes 3**:

| Métrica | Target |
|---------|--------|
| Seguidores | 3-5K |
| Red de shoutouts | 10-15 cuentas |
| Posts/semana | 7-10 |
| Revenue mensual | $100-500 |
| Email leads | 200-500 |
| Miembros Telegram | 100-300 |

---

### Mes 4-6: Monetización + Paid Growth

**Meta**: 5-15K seguidores. Revenue estable $500-2K/mes.

**Estrategia de paid growth**:

Hasta ahora todo fue orgánico. En este punto ya sabemos qué Reels tienen mejor performance, y los usamos como ads. SanchoCMO tiene la cadena completa de paid growth — no necesitamos construir nada nuevo:

```
🟢 paid-ads (ya existe en SanchoCMO)
│  Define estrategia: audiencias, presupuesto, CPA target, ROAS
│  Decide qué Reels promover (los 3-5 con mejor watch time)
│  Output: campaign brief con targeting y budget allocation
│
🟢 ad-creative (ya existe en SanchoCMO)
│  Genera variaciones de copy para los ads
│  A/B testing de headlines y CTAs
│  Output: 5-10 variaciones por ad para testing
│
🟢 meta-ads (ya existe en SanchoCMO)
│  Ejecuta via Meta Ads API (token ya configurado en .env)
│  Crea campañas, ad sets, ads programáticamente
│  Monitorea performance y ajusta bids
│  Output: campañas corriendo + performance insights
│
🟢 marketing-psychology (ya existe en SanchoCMO)
│  Aplica modelos mentales al copy de ads
│  Optimiza CTAs con principios de persuasión
│  Output: recomendaciones de copy basadas en psicología
```

- **Meta Ads ($200-300/mes)**: Promover los 3-5 Reels con mejor watch time. CPF (costo por seguidor) en LATAM: $0.50-1.50. Con $300/mes = 200-600 seguidores nuevos pagos + el reach orgánico que generan.
- **Shoutouts pagados ($100-200/mes)**: Comprar menciones en cuentas de 50K-100K del nicho. $50-150 por shoutout.

**Funnel completo activado** (con skills de SanchoCMO en cada etapa):
```
Contenido IG (reach)
│  ig-faceless-content + marketing-psychology
│
  → DM automation (captura)
  │  instagram (messages.py)
  │
    → Lead magnet gratuito (confianza)
    │  direct-response-copy → copy de la landing page
    │  copywriting → página de captura optimizada
    │
      → Email nurture sequence - 5 emails educativos (autoridad)
      │  email-sequences → secuencia automatizada
      │
        → CTA a affiliate Star Trader (conversión)
        │  direct-response-copy → copy de conversión final
        → CTA a ebook pago en Gumroad (ingreso directo)
        → CTA a Telegram premium (ingreso recurrente)
```

**Segunda cuenta** (si primera >5K): Abrir cuenta en sub-nicho diferente (ej: crypto LATAM, ahorro para millennials). Shoutouts cruzados entre ambas cuentas propias.

**KPIs mes 4-6**:

| Métrica | Target |
|---------|--------|
| Seguidores | 5-15K |
| Revenue mensual | $500-2K |
| Email leads | 500-1K |
| Miembros Telegram | 300-500 |
| Cuentas propias | 2 |
| Inversión ads/mes | $300-500 |

---

### Mes 7-12: Escala + Diversificación

**Meta**: 15-60K seguidores. Revenue $2-5K+/mes.

**Estrategia de diversificación de ingresos**:

| Fuente | Revenue estimado/mes | Cómo |
|--------|---------------------|------|
| Affiliate Star Trader | $500-2K | $8/lote × clientes activos |
| Prop firms affiliate | $200-500 | $50-100/evaluación (FTMO, FundedNext) |
| Ebooks (Gumroad) | $200-500 | 2-3 ebooks a $5-15 |
| Telegram premium | $500-1K | 50-100 miembros × $10-20/mes |
| Shoutouts vendidos | $200-500 | Cuando >10K, vender menciones |
| Cursos | $500-2K | Curso $50-200 (mes 9+) |

**Estrategia de escala**:
- Red de shoutouts madura: 15+ cuentas, calendario fijo
- 3-5 cuentas propias con shoutouts cruzados (modelo @fullystaked)
- Content production: 10+ posts/semana con ~2h de supervisión humana
- SanchoCMO opera en modo casi autónomo: genera, publica, mide, ajusta

**KPIs mes 7-12**:

| Métrica | Target |
|---------|--------|
| Seguidores (total cuentas) | 15-60K |
| Revenue mensual | $2-5K+ |
| Email leads | 2-5K |
| Cuentas propias | 3-5 |

---

## PARTE 4: Inventario completo de skills

### Skills que ya existen en SanchoCMO

| Skill | Fase donde se usa | Qué aporta |
|-------|-------------------|------------|
| `daily-pulse` | Inteligencia | Noticias trending de mercados |
| `content-calendar-planner` | Planificación | Base del calendario editorial |
| `social-content` | Creación | Estrategia de contenido + copy genérico |
| `content-atomizer` | Creación | Rompe 1 pieza en múltiples formatos |
| `thief-marketers` | Inteligencia | Espía contenido de competidores via Apify |
| `social-media-extractor` | Inteligencia | Scraping de perfiles IG |
| `brand-voice` | Setup | Define tono y personalidad de la cuenta |
| `visual-identity` | Setup | Sistema visual coherente para el feed (paleta, tipografía, grid) |
| `ad-creative` | Paid Growth (Mes 4-6) | Genera creativos de ads a escala: headlines, copy, variaciones A/B |
| `paid-ads` | Paid Growth (Mes 4-6) | Estrategia de campañas pagadas: targeting, ROAS, CPA, presupuesto |
| `meta-ads` | Paid Growth (Mes 4-6) | Ejecución directa via Meta Ads API: crear campañas, ad sets, medir performance |
| `direct-response-copy` | Monetización | Copy de conversión para landing pages, bio link, CTAs del funnel |
| `marketing-psychology` | Creación + Monetización | 70+ modelos mentales de persuasión aplicados a contenido y copy |
| `copywriting` | Monetización | Copy para landing pages del funnel de affiliate |
| `email-sequences` | Monetización (Mes 3+) | Nurture sequences automatizadas: 5 emails educativos → CTA affiliate |

### Skills a instalar de antigravity-awesome-skills

| Skill | Fase donde se usa | Qué aporta | Repo |
|-------|-------------------|------------|------|
| `instagram` | Publicación + Comunidad + Análisis | Publicar, DMs, comentarios, analytics, scheduling — TODO via Graph API | `sickn33/antigravity-awesome-skills` |
| `canva-automation` | Creación | Crear diseños con brand templates, exportar PNGs | `sickn33/antigravity-awesome-skills` |
| `apify-influencer-discovery` | Growth (shoutouts) | Encontrar cuentas del nicho para proponer shoutouts | `sickn33/antigravity-awesome-skills` |
| `apify-trend-analysis` | Inteligencia | Detectar hashtags y contenido trending | `sickn33/antigravity-awesome-skills` |
| `apify-content-analytics` | Análisis | Métricas de engagement por post | `sickn33/antigravity-awesome-skills` |
| `content-creator` | Creación | Brand voice analyzer + SEO optimizer | `sickn33/antigravity-awesome-skills` |
| `growth-engine` | Growth | Estrategias de growth hacking, viral loops | `sickn33/antigravity-awesome-skills` |

### Skills nuevas a construir

| Skill | Fase donde se usa | Por qué no existe | Esfuerzo |
|-------|-------------------|-------------------|----------|
| `ig-content-planner` | Planificación | Ninguna skill combina ratio de contenido + horarios LATAM + input de inteligencia + historial de performance para decidir qué publicar cada día | 3-4 hrs |
| `ig-faceless-content` | Creación | Ninguna skill genera copy con reglas regulatorias de trading, CTAs binarios, hooks de 3s, y formato adaptado a carrusel/reel/quote/screen recording para el nicho financiero LATAM | 3-4 hrs |

---

## PARTE 5: Plan de implementación técnica

### Semana 1: Setup (días 1-3)

| Paso | Qué | Por qué | Quién |
|------|-----|---------|-------|
| 1 | Definir nombre de cuenta y branding | Sin esto no podemos crear nada — es la base de toda la identidad visual y de contenido | Martín decide, SanchoCMO genera opciones |
| 2 | Crear cuenta IG Business + Facebook Page | Requisito de Meta para usar la Graph API | Martín (manual en Instagram) |
| 3 | Crear Meta App + obtener tokens | Sin tokens no podemos publicar via API | Martín (manual en developers.facebook.com) |
| 4 | Configurar Apify account + token | Para las skills de trend analysis e influencer discovery | Martín (apify.com, free tier) |
| 5 | Crear `brand/[nombre-cuenta]/` en SanchoCMO | El contexto que todas las skills necesitan para generar contenido alineado | Claude + Martín |
| 6 | Agregar todos los tokens a `.env` | Centralizar credenciales | Claude |

### Semana 1: Instalar skills (días 3-5)

| Paso | Qué | Cómo |
|------|-----|------|
| 7 | Clonar skills de antigravity | `git clone` de las 7 skills relevantes → copiar a SanchoCMO `/workspace/skills/` |
| 8 | Adaptar skill `instagram` al setup | Configurar con tokens de Meta, verificar conexión |
| 9 | Adaptar skill `canva-automation` | Conectar via Rube MCP o Canva API |
| 10 | Configurar skills de Apify | Vincular con token de Apify |

### Semana 2: Construir skills nuevas (días 6-10)

| Paso | Qué | Detalle |
|------|-----|---------|
| 11 | Construir `ig-content-planner` | Lógica de ratio, horarios LATAM, integración con daily-pulse y learnings.md |
| 12 | Construir `ig-faceless-content` | Templates por formato, reglas regulatorias, hooks library, CTAs binarios |
| 13 | Test end-to-end | Generar quote → crear diseño en Canva → publicar en IG → verificar |
| 14 | Generar primer batch | 40 piezas: 10 quotes + 10 carruseles + 10 Reels + 5 screen recordings + 5 educativos |

### Semana 3-4: Lanzamiento

| Paso | Qué |
|------|-----|
| 15 | Empezar a publicar 5/semana |
| 16 | Activar DM automation |
| 17 | Engagement diario (20-30 cuentas) |
| 18 | Identificar 30 cuentas para shoutouts |
| 19 | Contactar primeras 10-15 |
| 20 | Primer análisis de métricas → actualizar learnings.md |

---

## Resumen en una frase

Usamos 15 skills existentes (SanchoCMO) + 7 skills instaladas (antigravity) + 2 skills nuevas que construimos nosotros, para crear un motor que genera, publica, monetiza y optimiza contenido de educación financiera en Instagram de forma casi autónoma — incluyendo la cadena completa de paid growth (estrategia → creativos → ejecución Meta Ads) y el funnel de conversión (landing copy → email nurture → affiliate) — mientras en paralelo construimos manualmente una red de shoutouts recíprocos que es el verdadero multiplicador de crecimiento.
