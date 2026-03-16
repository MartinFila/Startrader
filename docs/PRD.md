# PRD: Star Trader — Sistema de Contenido Instagram Faceless

> **Versión**: 1.0
> **Fecha**: 2026-03-15
> **Owner**: Martin Fila
> **Motor de ejecución**: SanchoCMO

---

## 1. Visión del Producto

Construir un **motor automatizado de contenido para Instagram** enfocado en educación financiera para LATAM.
El contenido es 100% educativo (trading, ahorro, inversiones, mercados). La monetización vive exclusivamente en el link de bio (affiliate de Star Trader, intercambiable).

**Principio fundamental**: El contenido NUNCA promociona un producto. 100% educación financiera.

---

## 2. Objetivos Medibles

| Métrica | Mes 1 | Mes 3 | Mes 6 | Mes 12 |
|---------|-------|-------|-------|--------|
| Seguidores | 500-1K | 3-5K | 10-15K | 30-60K |
| Posts/semana | 5 | 7 | 10 | 10+ |
| Engagement rate | >3% | >3% | >2.5% | >2% |
| Conversiones affiliate | 0 | 2-5 | 10-20 | 50+ |
| Revenue mensual | $0 | $100-500 | $500-2K | $5K+ |
| Red de shoutouts | 0 | 5-10 cuentas | 15 cuentas | 15+ cuentas |

**Break-even**: Mes 4-6. Con rebate Star Trader ($8/lote), solo 2-5 clientes activos.

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   SANCHO CMO                         │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │ daily-pulse  │───→│ ig-content-planner (NEW)  │   │
│  │ (noticias    │    │ - Decide qué publicar     │   │
│  │  trending)   │    │ - Respeta ratio 40/25/20/15│  │
│  └──────────────┘    │ - Asigna formato          │   │
│                      └──────────┬───────────────┘   │
│                                 │                    │
│                    ┌────────────┼────────────┐       │
│                    ▼            ▼            ▼       │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────┐    │
│  │ ig-reel-     │ │ig-carousel│ │ ig-quote-    │    │
│  │ creator(NEW) │ │-maker    │ │ card(NEW)    │    │
│  │              │ │(NEW)     │ │              │    │
│  │ Script +     │ │Slides →  │ │ Template →   │    │
│  │ Fliki/Zebra  │ │PNG 1080² │ │ PNG 1080²    │    │
│  └──────┬───────┘ └────┬─────┘ └──────┬───────┘    │
│         │              │              │              │
│         └──────────────┼──────────────┘              │
│                        ▼                             │
│              ┌─────────────────┐                     │
│              │ ig-publisher    │                     │
│              │ (NEW)           │                     │
│              │ Meta Graph API  │                     │
│              │ + Stories auto  │                     │
│              └────────┬────────┘                     │
│                       │                              │
│                       ▼                              │
│              ┌─────────────────┐                     │
│              │ ig-dm-responder │                     │
│              │ (NEW)           │                     │
│              │ Keywords →      │                     │
│              │ Link affiliate  │                     │
│              └────────┬────────┘                     │
│                       │                              │
│                       ▼                              │
│              ┌─────────────────┐                     │
│              │ ig-analytics    │                     │
│              │ (NEW)           │                     │
│              │ Métricas →      │                     │
│              │ learnings.md    │                     │
│              └─────────────────┘                     │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ig-growth-engine (NEW) — Estrategias activas  │   │
│  │ • Shoutout tracker + outreach                 │   │
│  │ • Engagement daily plan (20-30 cuentas)       │   │
│  │ • Hashtag optimizer                           │   │
│  │ • Trial Reels A/B testing                     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 4. Skills Nuevas a Construir

### 4.1 `ig-content-planner` — Cerebro editorial

**Qué hace**: Decide QUÉ publicar cada día, respetando el ratio de contenido y los horarios óptimos.

**Input**:
- `daily-pulse` → noticias trending LATAM (si existe)
- `brand/startrader/content-pillars.md` → pilares definidos
- `brand/startrader/learnings.md` → qué funcionó antes
- `brand/startrader/content-calendar.md` → calendario actual

**Lógica**:
- Ratio de contenido: 40% Valor educativo | 25% Relatable | 20% Behind the scenes | 15% Promocional
- Mix de formatos: 2-3 Reels/sem + 2 Carruseles/sem + 2-3 Quotes/sem + 1 Screen recording/sem
- Horarios LATAM: Lun-Jue 7-9 AM, 12-2 PM, 5-9 PM (UTC-5)
- Mejores días: Mié y Jue

**Output**: `brand/startrader/content-calendar.md` actualizado con:
```
| Fecha | Hora | Formato | Pilar | Tema | Hook | CTA | Status |
```

**Chains to**: `ig-carousel-maker`, `ig-reel-creator`, `ig-quote-card`

---

### 4.2 `ig-carousel-maker` — Generador de carruseles

**Qué hace**: Genera carruseles educativos de 10 slides en formato 1080x1080.

**Input**: Brief del planner (tema, pilar, hook, CTA)

**Proceso**:
1. Claude genera contenido de 10 slides (hook → contenido → CTA)
2. Aplica template visual (fondo oscuro + acento neón/dorado, tipografía bold sans-serif)
3. Genera PNGs via Google Slides API o Canva API

**Formatos de carrusel**:
- Tips educativos ("5 errores al invertir en oro")
- Comparativas ("Forex vs Crypto: pros y contras")
- Paso a paso ("Cómo abrir tu primera operación")
- Datos del día ("El oro subió 15% en 2026: esto es lo que significa")
- Mitos vs Realidad ("3 mitos sobre el trading que te están frenando")

**Output**:
- 10 archivos PNG 1080x1080
- Caption con keywords + 6-9 hashtags + CTA binario
- Alt text descriptivo (Instagram SEO)

**CTA obligatorio en slide 10**: "Guarda este post" + "Envíaselo a alguien que necesita saber esto"

---

### 4.3 `ig-reel-creator` — Generador de Reels

**Qué hace**: Genera scripts + produce Reels de 15-60 segundos.

**Input**: Brief del planner

**Proceso**:
1. Claude genera script (hook 3s + cuerpo + CTA binario)
2. Selecciona formato:
   - **Text-over-stock**: Script → Fliki/Zebracat API → MP4 con B-roll + texto animado
   - **Screen recording**: Script de narración + marcadores para grabación de plataforma de trading
   - **Quote animation**: Texto animado sobre fondo oscuro con música trending
3. Añade subtítulos obligatorios (+38% retención)

**Reglas de producción**:
- Hook en primeros 2 segundos (visual change obligatorio)
- Duración: Tips 15-30s, Educativo 30-60s
- Audio: Voiceover propio preferido (preferencia algorítmica 2026)
- Sin watermarks de otras plataformas
- Test silencioso: ¿se entiende sin audio?

**Output**:
- Archivo MP4 (9:16, min 1080x1920)
- Caption + hashtags + CTA binario
- Versión para Stories (opcional)

---

### 4.4 `ig-quote-card` — Generador de quotes

**Qué hace**: Genera quote cards educativas sobre finanzas.

**Input**: Brief del planner o lista batch

**Proceso**:
1. Claude genera quote financiero educativo (no motivacional genérico — siempre con dato concreto)
2. Aplica template (fondo oscuro + tipografía bold + acento dorado/neón)
3. Genera PNG 1080x1080

**Ejemplos de quotes**:
- "El 90% de los traders pierden dinero. La diferencia está en la gestión de riesgo, no en predecir el mercado."
- "Warren Buffett empezó a invertir a los 11 años. El mejor momento para empezar fue ayer. El segundo mejor es hoy."
- "El oro subió un 15% este año. ¿Sabes por qué? Inestabilidad geopolítica + bancos centrales comprando reservas."

**Output**: PNG 1080x1080 + Caption + Hashtags

---

### 4.5 `ig-publisher` — Motor de publicación

**Qué hace**: Publica contenido en Instagram via Meta Graph API.

**Prerrequisitos**:
- Cuenta IG Business conectada a Facebook Page
- Meta App con permisos: `instagram_basic`, `instagram_content_publish`, `pages_show_list`
- Token de larga duración almacenado en `.env`

**Capacidades**:
- Publicar imagen (single + carousel)
- Publicar Reel (video)
- Compartir en Stories automáticamente post-publicación
- Respetar rate limits (200 calls/h, 100 posts/24h)
- Scheduling con cola de publicación

**API Endpoints**:
```
POST /{ig-user-id}/media          → Crear container
POST /{ig-user-id}/media_publish  → Publicar container
POST /{ig-user-id}/media          → Carousel container (children[])
```

**Output**: Post ID + URL + timestamp → log en `brand/startrader/publish-log.md`

---

### 4.6 `ig-dm-responder` — Automatización de DMs

**Qué hace**: Detecta keywords en DMs y responde automáticamente con link a landing de affiliate.

**Keywords trigger**:
- "TRADING", "INICIO", "GUÍA", "EMPEZAR", "INVERTIR", "DEMO"

**Respuesta template**:
```
¡Hola! 👋 Gracias por tu interés.

Te comparto una guía gratuita para empezar a invertir:
[Link a landing con affiliate]

Si querés practicar sin riesgo, podés abrir una cuenta demo gratuita:
[Link affiliate Star Trader]

¿Tenés alguna pregunta? Respondeme por acá 📈
```

**Implementación**: Meta Messaging API o webhook + n8n workflow

---

### 4.7 `ig-analytics` — Métricas y aprendizaje

**Qué hace**: Recopila métricas de rendimiento y actualiza `learnings.md`.

**Métricas a trackear** (priorizadas por algoritmo 2026):
1. **DM Sends / Reach** — señal #1 para unconnected reach
2. **Watch Time** — completion rate y rewatches (Reels)
3. **Saves / Reach** — señal de autoridad
4. **Likes / Reach** — engagement conectado
5. **Comments** — engagement
6. **Follower growth rate**
7. **Profile visits → Link clicks** (conversión)

**Proceso semanal**:
1. Pull métricas via Instagram Graph API (`/insights`)
2. Comparar vs semana anterior
3. Identificar top 3 posts y bottom 3
4. Actualizar `brand/startrader/learnings.md` con patrones
5. Alimentar al `ig-content-planner` para ajustar estrategia

**Output**: `brand/startrader/weekly-report.md` + `learnings.md` actualizado

---

### 4.8 `ig-growth-engine` — Estrategias de crecimiento activo

**Qué hace**: Gestiona todas las tácticas de crecimiento que NO son contenido.

#### Módulo 1: Shoutout Tracker
- Base de datos de cuentas target para shoutouts (nicho finanzas LATAM)
- Template de outreach para proponer intercambio
- Tracking de shoutouts dados/recibidos
- Calendario de shoutouts programados

**Cuentas target** (criterios):
- Nicho: finanzas, inversiones, trading, crypto en español
- Tamaño: 1K-50K seguidores (similar o ligeramente mayor)
- Engagement rate: >2%
- Activas (publican min 3x/semana)

**Template de outreach**:
```
Hola [nombre]! 👋

Me encanta tu contenido sobre [tema específico]. Estoy creando una cuenta de educación financiera para LATAM y creo que nuestras audiencias se complementan.

¿Te interesa hacer un intercambio de shoutouts? Yo te menciono en mis Stories/posts y vos en los tuyos. Sin costo, solo networking entre cuentas del nicho.

¿Qué te parece? 📈
```

#### Módulo 2: Engagement Daily Plan
- Lista de 20-30 cuentas para interactuar diariamente
- Rotación semanal de cuentas
- Tipos de engagement: comentarios genuinos, likes, shares, saves
- Regla: responder TODO en <60 min post-publicación
- Meta: 30+ engagements en primera hora = 3x distribución

#### Módulo 3: Hashtag Optimizer
- 3 tiers de hashtags:
  - **Reach**: #finanzaspersonales #dinero #ahorro #inversiones #libertadfinanciera
  - **Engagement**: #educacionfinanciera #ingresospasivos #trading #criptomonedas
  - **Nicho**: #tradinglatam #inversionesenlatam #finanzaslatam #propfirm
- Rotación de hashtags por post (6-9 por post, no repetir sets)
- Tracking de rendimiento por hashtag

#### Módulo 4: Trial Reels A/B Testing
- Publicar Reels primero como Trial (audiencia no-seguidora)
- Comparar hooks: variante A vs B
- Promover a feed los que superen threshold de watch time

---

## 5. Brand Context (para SanchoCMO)

### `brand/startrader/brand-identity.md`

```yaml
name: [Pendiente definir — opciones: "Invierte LATAM", "Trading Faceless", "Finanzas Sin Cara"]
niche: Educación financiera para LATAM
tone: Directo, educativo, accesible. No agresivo ni promesas de riqueza rápida.
visual:
  fondo: Negro o azul marino profundo
  acento: Neón verde o dorado
  tipografía: Bold sans-serif (Montserrat, Inter, o similar)
  estilo: Limpio, profesional, datos > lujo
target:
  edad: 22-40 años
  geo: México, Colombia, Argentina, Chile, Perú
  perfil: Profesional joven que quiere aprender a invertir
  pain: No sabe por dónde empezar, desconfía de "gurús"
  platform: Instagram (primario), Telegram (secundario)
disclaimer: "Contenido educativo. No es asesoría de inversión. Los CFDs son instrumentos complejos con alto riesgo de pérdida."
```

### Content Pillars

| Pilar | % | Temas |
|-------|---|-------|
| **Valor educativo** | 40% | Tips de trading, tutoriales, screen recordings, análisis de mercados |
| **Relatable** | 25% | Memes financieros, errores comunes del inversor novato, "yo cuando..." |
| **Behind the scenes** | 20% | Proceso de análisis, cuenta demo, aprendizajes, errores propios |
| **Promocional** | 15% | CTA a link de bio, testimonios, resultados en demo |

---

## 6. Monetización

### Funnel principal
```
Contenido gratuito IG
  → CTA en cada post ("DM 'TRADING' para guía gratis")
    → DM automático con link a landing
      → Landing con affiliate Star Trader
        → Comisión: $8/lote (rebate inmediato)
```

### Funnel avanzado (mes 3+)
```
Contenido IG
  → Link en bio (Linktree)
    → Lead magnet (ebook gratuito "Cómo empezar a invertir desde $100")
      → Email capture
        → Nurture sequence (5 emails educativos)
          → Affiliate Star Trader + Prop firms + Ebooks pagos
```

### Revenue streams (por prioridad)
1. **Affiliate Star Trader**: $8/lote rebate (inmediato) — principal
2. **Prop firms affiliate**: $50-100/evaluación (FTMO, FundedNext)
3. **Ebooks**: $5-15 en Gumroad (mes 2+)
4. **Telegram premium**: $10-20/mes (mes 3+)
5. **Shoutouts pagos**: $50-500 cuando >10K seguidores
6. **Cursos**: $50-200 (mes 6+)

---

## 7. Workflow Diario Automatizado

```
06:00 UTC-5  │ daily-pulse → detecta noticias trending LATAM
             ▼
07:00        │ ig-content-planner → decide contenido del día
             │   - Revisa calendario
             │   - Consulta learnings.md
             │   - Asigna formato + pilar + tema
             ▼
08:00        │ Skill de creación (según formato asignado):
             │   ig-carousel-maker  → PNGs
             │   ig-reel-creator    → MP4
             │   ig-quote-card      → PNG
             ▼
09:00        │ ig-publisher → publica en horario óptimo
             │   + comparte en Stories
             ▼
09:00-21:00  │ ig-dm-responder → responde DMs con keywords
             ▼
Todo el día   │ Engagement manual: 20-30 interacciones (asistido por growth-engine)
             ▼
22:00        │ ig-analytics → métricas del día
             │   → actualiza learnings.md
```

### Workflow Semanal
```
Domingo      │ ig-analytics → reporte semanal completo
             │ ig-content-planner → planifica semana siguiente
             │ ig-growth-engine → actualiza lista de shoutouts
             │ content-atomizer → 1 carrusel top → 2-3 quotes + 1 Story
```

---

## 8. Reglas Regulatorias (No Negociables)

1. **NUNCA** prometer rendimientos específicos ("gana $X al mes")
2. **SIEMPRE** incluir disclaimer en bio y posts relevantes
3. **NUNCA** dar señales de compra/venta específicas ("compra oro a $2,100")
4. **SIEMPRE** posicionar como educación, no asesoría
5. **NUNCA** mencionar Star Trader en el contenido — solo en link de bio
6. En screen recordings: usar cuenta DEMO, nunca dinero real
7. CTAs de afiliado: "Si quieres practicar, abre una cuenta demo gratuita" (no "deposita ahora")

---

## 9. Stack Técnico

| Componente | Herramienta | Costo | Status |
|-----------|-------------|-------|--------|
| Contenido (copy) | Claude via SanchoCMO | Incluido | Listo |
| Carruseles | Google Slides API / Canva API | Gratis / $13/mes | Por construir |
| Reels | Fliki ($21/mes) o Zebracat ($19/mes) | ~$20/mes | Por integrar |
| Quotes | Canva API o Pillow (Python) | Gratis | Por construir |
| Publicación | Meta Graph API | Gratis | Por construir |
| DM Automation | Meta Messaging API + n8n | Gratis | Por construir |
| Analytics | Instagram Graph API + Metricool | Gratis | Por construir |
| Landing | Linktree | Gratis | Por crear |
| Email capture | Gumroad / Mailgun | Gratis / Incluido | Por construir |
| Scheduling | n8n (self-hosted) o cron | Gratis | Por construir |

**Costo mensual estimado**: $33-63/mes

---

## 10. Plan de Implementación

### FASE 0 — Setup (Semana 1)
- [ ] Definir nombre de cuenta y branding final
- [ ] Crear cuenta IG Business + conectar Facebook Page
- [ ] Crear Meta App + obtener tokens Graph API
- [ ] Crear `brand/startrader/` en SanchoCMO con brand context
- [ ] Crear landing en Linktree con affiliate link
- [ ] Configurar `.env` con tokens de Meta

### FASE 1 — Skills Core (Semana 1-2)
- [ ] Construir `ig-quote-card` (más simple, valida el pipeline)
- [ ] Construir `ig-carousel-maker` (engine de slides)
- [ ] Construir `ig-publisher` (Meta Graph API)
- [ ] Test end-to-end: generar quote → publicar → verificar

### FASE 2 — Skills Avanzadas (Semana 2-3)
- [ ] Construir `ig-content-planner`
- [ ] Construir `ig-reel-creator` (integración Fliki/Zebracat)
- [ ] Construir `ig-dm-responder`
- [ ] Construir `ig-analytics`

### FASE 3 — Lanzamiento (Semana 3-4)
- [ ] Generar batch inicial: 10 quotes + 10 carruseles + 5 Reels
- [ ] Publicar 5+ posts/semana
- [ ] Activar engagement diario (20-30 cuentas)
- [ ] Empezar networking para shoutouts

### FASE 4 — Growth (Mes 2+)
- [ ] Construir `ig-growth-engine`
- [ ] Armar red de 10-15 cuentas para shoutouts
- [ ] Crear primer ebook + lead magnet
- [ ] Crear grupo Telegram gratuito
- [ ] Activar email capture

### FASE 5 — Escalar (Mes 3-6)
- [ ] Meta Ads ($200-300/mes) para promover Reels top
- [ ] Shoutouts pagados ($100-200/mes)
- [ ] Segunda cuenta (si primera >5K)
- [ ] Funnel completo: landing → email → nurture → affiliate

---

## 11. Estrategias de Crecimiento (Detalle)

### Estrategia 1: Red de Shoutouts (El multiplicador #1)

**Por qué**: Jason Stone pasó de 0 a 2M en <2 años con 15 cuentas haciendo shoutouts cruzados. Sin red, el mismo contenido habría tardado 5-8 años.

**Cómo**:
1. **Semana 3**: Identificar 30 cuentas potenciales (finanzas LATAM, 1K-50K)
2. **Semana 3-4**: Contactar 10-15 con template de outreach
3. **Mes 2**: Formalizar red con calendario de shoutouts (1 por semana mínimo)
4. **Mes 3+**: Expandir red, agregar cuentas que van creciendo

**Tipos de shoutout**:
- Story mention ("Recomiendo seguir a @cuenta — excelente contenido sobre X")
- Post collaboration (co-author de carrusel)
- Reel repost/duet
- Comment pods (grupo que comenta en los primeros 30 min)

### Estrategia 2: DM-Worthy Content (Señal #1 del algoritmo 2026)

**Por qué**: Mosseri confirmó que los envíos por DM son LA señal para unconnected reach.

**Cómo**: Cada pieza debe pasar el test: "¿Alguien enviaría esto a un amigo?"
- Datos sorprendentes: "El 90% de los traders pierden dinero. Aquí están los 3 errores que los separan del 10%."
- Comparativas polémicas: "¿Forex o Crypto? La respuesta te va a sorprender."
- CTA explícito: "Envíale esto a alguien que necesita saber esto"

### Estrategia 3: Engagement Activo (Primeras 4 semanas críticas)

**Por qué**: Instagram evalúa cuentas nuevas en un "sandbox". 30+ engagements en la primera hora = 3x distribución.

**Plan diario**:
- [ ] Responder TODOS los comentarios en <60 min
- [ ] Comentar genuinamente en 20-30 cuentas del nicho
- [ ] Compartir cada post en Stories inmediatamente
- [ ] Interactuar con Stories de cuentas similares

### Estrategia 4: Screen Recordings (Arma secreta)

**Por qué**: 82% watch time — el formato faceless con mayor retención. Ningún competidor en LATAM lo usa consistentemente.

**Cómo**:
- Abrir cuenta demo en cualquier plataforma de trading
- Grabar pantalla mostrando: análisis de charts, abrir operaciones, navegar mercados
- Añadir subtítulos + voiceover educativo
- El espectador ve trading en acción sin depender de ningún broker

### Estrategia 5: Trial Reels (A/B Testing gratuito)

**Por qué**: Feature de Instagram 2026 que permite testear con no-seguidores sin arriesgar el feed.

**Cómo**:
- Publicar Reels como Trial primero
- Comparar 2-3 variantes de hook para el mismo tema
- Promover al feed solo los que superen >60% hold rate

---

## 12. Métricas de Éxito (KPIs Semanales)

| Métrica | Target Sem 1-4 | Target Mes 2-3 | Target Mes 4-6 |
|---------|----------------|-----------------|-----------------|
| Posts publicados | 5/sem | 7/sem | 10/sem |
| Reach (Reels) | 500-2K | 5K-20K | 20K-100K |
| Saves por post | 5-20 | 20-100 | 100+ |
| DM sends por post | 2-10 | 10-50 | 50+ |
| Nuevos seguidores/sem | 50-100 | 200-500 | 500-1K |
| Link clicks (bio) | 5-10 | 20-50 | 100+ |
| Shoutouts recíprocos/mes | 0 | 4-8 | 8-15 |
| Conversiones affiliate | 0 | 1-3 | 5-10 |

---

## 13. Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Regulatorio (CFDs en LATAM) | Alto | Nunca prometer rendimientos. Disclaimer en todo. Solo educación. |
| Cuenta baneada por automatización | Alto | Respetar rate limits. No usar bots de engagement. Solo Graph API oficial. |
| Star Trader cambia condiciones | Medio | Affiliate es intercambiable. Diversificar desde mes 3. |
| Bajo engagement inicial | Medio | Engagement activo + shoutouts + Trial Reels. Iterar rápido. |
| Burnout por volumen de contenido | Bajo | SanchoCMO automatiza 80% de la producción. Batches semanales. |
| Competencia entra al nicho LATAM | Bajo | First mover advantage + red de shoutouts como moat. |

---

## Apéndice A: Tácticas de Conversión para Affiliate

1. **Price Anchoring**: "Mientras otras plataformas cobran 2-3% comisión, este broker ofrece spreads desde 0.0 pips"
2. **Before You Buy**: "Este broker NO es para ti si buscas hacerte rico rápido"
3. **Real Life Scenario**: "Qué pasa cuando operas oro durante una semana volátil" (3x mejor conversión)
4. **Binary Choice Close**: "¿Prefieres operar forex o commodities como el oro?" (+78% comentarios)

## Apéndice B: Checklist de Publicación

**Pre-publicación**:
- [ ] Hook de 3 segundos escrito
- [ ] Formato vertical 9:16 (Reels) o 1:1 (carrusel/quote)
- [ ] Subtítulos si es video
- [ ] Sin watermarks de otras plataformas
- [ ] Test silencioso: ¿se entiende sin audio?

**Publicación**:
- [ ] Caption con keywords + CTA binario
- [ ] 6-9 hashtags (rotación por post)
- [ ] Alt text descriptivo
- [ ] Horario óptimo LATAM
- [ ] Compartir en Stories inmediatamente

**Post-publicación**:
- [ ] Responder comentarios en <60 min
- [ ] Registrar en publish-log.md
