# Prueba de Concepto: Cuenta Faceless de Educación Financiera LATAM

> **Fecha**: 2026-03-17
> **Responsable**: Martín | Supervisión: Alfonso
> **Motor de ejecución**: SanchoCMO
> **Duración del POC**: 6 semanas
> **Inversión**: ~$50/mes (Canva Pro + Apify free tier)
> **Decisión al final**: Escalar, pivotar, o matar

---

## 1. La Oportunidad

### Qué encontramos analizando cuentas reales

Analizamos 8+ cuentas faceless de finanzas para entender qué funciona y por qué.

| Cuenta | Seguidores | Modelo | Insight clave |
|--------|-----------|--------|---------------|
| @millionaire_mentor | 14M+ | Quotes + afiliados | $7M en 18 meses. El formato más simple (quotes sobre fondo) generó el mayor revenue de toda la muestra. La clave no es el formato — es el hook y la frecuencia. |
| @wealth.ceo | 143K | Quotes dark/luxury | Solo 134 posts para 143K seguidores. Ratio seguidores/post extraordinario. Prueba que la calidad del hook importa más que el volumen. |
| @thewealthdad | 55K | Carruseles educativos | 1.05% engagement en carruseles vs <0.1% en Reels. Los carruseles monetizan — construyen la confianza que lleva al clic en el affiliate. |
| @facelesstraderss | 67K | Charts + señales + mentoría | Funnel: Reels gratis → DM "trade" → Discord → Señales $40/sem → Clase $250 → Mentoría $2,000. Revenue estimado: $4K-12K/mes. |
| @fullystaked | 692K | Red de múltiples páginas | 900K+ seguidores totales con 3,866 posts entre múltiples cuentas. Modelo de shoutouts cruzados entre cuentas propias. Monetiza vendiendo cursos sobre cómo replicar el modelo. |

### La brecha: inglés vs español

La cuenta faceless de trading más grande en inglés tiene 67K seguidores. En español, la más grande que encontramos (@trading.latam_) tiene ~11K. Es una diferencia de **~6x** en un mercado de 500M+ hispanohablantes.

No es que hayan intentado y fallado — prácticamente no existen cuentas faceless de finanzas en español con producción de calidad.

### Cuánto vale esto (evidence-based)

No todas las cuentas generan los mismos ingresos. Dos referencias realistas:

**Chart Master Chad** (caso documentado por StreamStoria):
- $31,427/mes después de 8 meses
- Inversión: un micrófono de $20 y Canva Pro
- Revenue: Ad revenue (YouTube) + afiliados ($20-100/signup) + templates ($27-47)

**Vytori** (caso más conservador):
- 28,400 subs en 14 meses
- $2,800-$3,500/mes solo con AdSense, sin afiliados ni productos
- Workflow: 2-4 horas por video con IA

**Nuestro target para el POC**: $0 de revenue. El POC no es para ganar plata — es para validar que podemos producir contenido que tenga tracción. El revenue viene después.

---

## 2. La Estrategia

### La tesis (en una frase)

Contenido educativo financiero faceless en español, optimizado para las señales del algoritmo 2026 (DM shares + watch time), producido casi 100% por IA, distribuido con una red de shoutouts recíprocos.

### ¿Por qué esta estrategia y no otra?

**Decisión 1: Faceless y no marca personal**

| | Faceless | Marca personal |
|---|---------|----------------|
| Escalable | Sí — se puede replicar con más cuentas | No — depende de una persona |
| Costos | $50/mes (herramientas) | Cámara, iluminación, edición |
| Automatizable con IA | 90%+ | <50% (necesita la persona) |
| Time to market | 2 semanas | 2-3 meses |
| Vendible | Sí — la cuenta es un activo | No — muere con la persona |

**Decisión 2: Instagram primero (no YouTube)**

YouTube tiene mejor monetización directa (CPM $15-40 en finanzas), pero Instagram tiene menor barrera de entrada para un POC:
- Un post de IG se produce en minutos. Un video de YouTube tarda horas.
- IG te da feedback más rápido (engagement en 24h vs semanas para YouTube)
- Si el contenido funciona en IG, se adapta a YouTube después
- La monetización de IG es vía affiliate (no necesita Partner Program)

El plan a mediano plazo incluye YouTube, pero el POC es solo Instagram.

**Decisión 3: Educación financiera y no otro nicho**

- RPM de finanzas es 5x mayor que gaming o entretenimiento
- Star Trader paga $8/lote operado como affiliate — revenue recurrente por trader activo
- Nuestro equipo entiende el dominio (trading, mercados, LATAM)
- El gap competitivo en español es real y medible

**Decisión 4: SanchoCMO y no producción manual**

El 75% de las cuentas faceless muere antes de 10K seguidores porque el creador se cansa de producir contenido. SanchoCMO elimina ese riesgo automatizando:
- Generación de contenido (copy, diseño, hashtags)
- Publicación programada via Instagram Graph API
- DM automation para captura de leads
- Análisis semanal de qué funciona

Supervisión humana estimada: 1-2 horas/semana.

### Los 3 motores de crecimiento

Esto sale directamente del análisis de las cuentas de referencia:

**Motor 1: Reels + Screen Recordings (reach)**
- 30.8% reach rate (vs 14.4% carruseles)
- 55% de views viene de NO seguidores — es lo que trae gente nueva
- Screen recordings de plataformas de trading = 82% watch time (el formato faceless con mayor retención)

**Motor 2: Carruseles educativos (confianza + monetización)**
- Generan saves = señal #1 del algoritmo para autoridad
- Son los que construyen la confianza que lleva al clic en el affiliate
- @thewealthdad: 1.05% engagement en carruseles vs <0.1% en Reels

**Motor 3: Red de shoutouts recíprocos (multiplicador)**
- Jason Stone: 15 cuentas con shoutouts cruzados → 2M en <2 años
- Son intercambios gratuitos entre cuentas de tamaño similar del mismo nicho
- Es lo que separa crecimiento lineal de exponencial

### Señales del algoritmo 2026 (Mosseri)

Las dos señales más fuertes, confirmadas por el CEO de Instagram:

1. **DM Shares** — Cuando alguien envía tu post por DM, Instagram lo muestra a más gente que NO te sigue. Señal #1 para crecer.
2. **Watch Time** — Reels con >60% retención explotan. Los de <40% mueren.

Esto define cómo creamos contenido: optimizamos para que la gente envíe y termine de ver, no para likes.

### Mix de contenido

Basado en las cuentas que analizamos:

| Pilar | % | Para qué | Formato |
|-------|---|----------|---------|
| Valor educativo | 40% | Autoridad. Saves + shares. | Carruseles, screen recordings, Reels educativos |
| Relatable | 25% | Conexión emocional. Comentarios + DM shares. | Quotes con datos, memes financieros |
| Behind the scenes | 20% | Humanizar. Comunidad. | Stories, proceso, cuenta demo |
| Promocional | 15% | Conversión. Link clicks. | CTAs a bio, resultados demo |

---

## 3. Proof of Concept — Qué necesitamos probar

### La pregunta central del POC

> ¿Podemos producir contenido faceless de educación financiera con IA que tenga tracción real en Instagram (engagement > 3%, crecimiento orgánico sostenido)?

No estamos probando si podemos ganar plata — estamos probando si el contenido funciona.

### Criterios de éxito (6 semanas)

| Métrica | Éxito | Aceptable | Fracaso |
|---------|-------|-----------|---------|
| Seguidores | >800 | 400-800 | <400 |
| Engagement rate | >4% | 2-4% | <2% |
| Posts publicados | 30+ | 20-30 | <20 |
| Saves por carrusel (promedio) | >20 | 10-20 | <10 |
| Watch time en Reels (promedio) | >50% | 30-50% | <30% |
| Cuentas contactadas para shoutouts | 15+ | 10-15 | <10 |
| Shoutouts recíprocos conseguidos | 3+ | 1-3 | 0 |

### Qué hacemos según el resultado

- **Éxito** → Escalar: más frecuencia, activar YouTube, construir funnel de monetización, abrir segunda cuenta
- **Aceptable** → Iterar: analizar qué formatos funcionaron, ajustar hooks y temas, dar 4 semanas más
- **Fracaso** → Diagnosticar: ¿el contenido es malo, el nicho está mal, o la ejecución falló? Pivotar o matar

### Qué NO es parte del POC

- No monetizamos (el link de affiliate está en bio pero no optimizamos para conversión)
- No invertimos en ads
- No abrimos segunda cuenta
- No expandimos a YouTube
- No construimos funnel de email

Todo eso viene después si el POC funciona.

---

## 4. Plan de Ejecución

### Setup (Semana 0) — Antes de publicar nada

**Día 1-2: Identidad**

| Paso | Qué | Quién |
|------|-----|-------|
| Definir nombre de cuenta | Criterios: memorable, disponible en IG+TT+YT, funciona en ES e EN, no menciona Star Trader | Martín decide, SanchoCMO genera opciones con `brand-voice` |
| Definir identidad visual | Paleta, tipografía, estilo de templates. Referencia: estética dark/premium como @facelesstraderss | SanchoCMO `visual-identity` |
| Reservar @ en todas las plataformas | IG + TikTok + YouTube + X (aunque solo usemos IG por ahora) | Martín (manual) |

**Día 2-3: Cuentas y accesos**

| Paso | Qué | Quién |
|------|-----|-------|
| Crear cuenta IG Business + Facebook Page | Requisito para usar Graph API | Martín (manual) |
| Crear Meta App + obtener tokens | En developers.facebook.com | Martín (manual) |
| Configurar Apify (free tier) | Para trend analysis e influencer discovery | Martín |
| Crear `brand/[nombre-cuenta]/` en SanchoCMO | Voice profile, positioning, audience, creative kit | Claude + Martín |
| Agregar tokens a `.env` | IG_ACCESS_TOKEN, APIFY_TOKEN | Claude |
| Optimizar perfil IG | Keywords en nombre, bio con CTA "DM TRADING para guía gratis", link affiliate en bio | Martín + Claude |

**Día 3-5: Skills**

| Paso | Qué | Cómo |
|------|-----|------|
| Instalar skills de antigravity | `instagram`, `canva-automation`, `apify-trend-analysis`, `apify-influencer-discovery`, `apify-content-analytics` | Clonar → copiar a SanchoCMO |
| Construir `ig-content-planner` | Lógica de ratio 40/25/20/15, horarios LATAM, integración con daily-pulse y learnings.md | Claude (3-4 hrs) |
| Construir `ig-faceless-content` | Templates por formato, reglas regulatorias de trading, hooks library, CTAs binarios | Claude (3-4 hrs) |
| Crear 10 plantillas Canva | 3 carruseles, 3 quotes, 2 Reels thumbnails, 2 Stories | Canva automation + revisión Martín |
| Test end-to-end | Generar 1 quote → diseñar en Canva → publicar en IG → verificar | Claude + Martín |

### Producción del buffer (Semana 1)

Antes de publicar nada, creamos un buffer de 2 semanas de contenido.

| Tipo | Cantidad | Skill |
|------|----------|-------|
| Quotes con datos financieros | 10 | `ig-faceless-content` → `canva-automation` |
| Carruseles educativos (10 slides) | 8 | `ig-faceless-content` → `canva-automation` |
| Scripts de Reels (15-30s) | 8 | `ig-faceless-content` (video: Fliki o manual) |
| Screen recordings (scripts + marcadores) | 4 | `ig-faceless-content` (grabación: manual en cuenta demo) |
| **Total** | **30 piezas** | ~2 semanas de contenido a 5/día |

Martín revisa todo el batch antes de que se publique nada. Si algo no pasa el filtro de calidad, se descarta y se regenera.

### Lanzamiento (Semanas 2-3)

**Publicación: 5 posts/semana**

| Día | Formato sugerido | Hora |
|-----|-----------------|------|
| Lunes | Carrusel educativo | 12 PM |
| Martes | Reel (screen recording o stock+texto) | 7 PM |
| Miércoles | Quote con dato financiero | 8 AM |
| Jueves | Carrusel educativo | 12 PM |
| Viernes | Reel (tip rápido o comparativa) | 5 PM |
| Sábado-Domingo | Stories (behind the scenes, polls) | Variable |

**Engagement diario (15-20 min)**:
- Responder TODOS los comentarios en <60 min
- 20-30 interacciones genuinas en cuentas del nicho (comentarios, no likes vacíos)
- Compartir cada post en Stories inmediatamente

**DM Automation activa**:
- Keywords: "TRADING", "INICIO", "GUÍA", "INVERTIR"
- Respuesta: guía gratuita + link a cuenta demo (affiliate en bio)

### Growth: shoutouts (Semanas 3-4)

| Paso | Qué | Cómo |
|------|-----|------|
| Identificar cuentas | 30 cuentas de 1K-50K en el nicho, engagement >2% | `apify-influencer-discovery` |
| Contactar | DM personalizado proponiendo intercambio gratuito de shoutouts | Manual (no automatizable sin riesgo de ban) |
| Organizar | Grupo de WhatsApp/Telegram con las que acepten | Manual |
| Ejecutar | 1-2 shoutouts/semana recíprocos | Coordinado en el grupo |
| Trackear | `shoutout-tracker.md` con métricas de cada intercambio | Claude |

**Template de contacto:**
> "Hola [nombre]! Me encanta tu contenido sobre [tema específico]. Estoy creando una cuenta de educación financiera para LATAM y estamos creciendo rápido. ¿Te interesa un intercambio de shoutouts gratuito? Yo te menciono en mis Stories y vos en los tuyos. $0, solo networking."

### Análisis e iteración (Semanas 4-6)

**Semanal (cada lunes)**:
- Pull de métricas via `instagram` insights + `apify-content-analytics`
- Top 3 posts y bottom 3 de la semana → ¿por qué?
- Actualizar `learnings.md` con patrones detectados
- Ajustar mix de contenido si los datos lo piden
- Activar Trial Reels para A/B testing de hooks

**Al final de semana 6 — Revisión del POC**:
- Compilar todas las métricas vs criterios de éxito/fracaso
- Decisión: escalar, iterar, o matar
- Si escalar → activar plan completo (YouTube, monetización, paid growth, segunda cuenta)

---

## 5. Skills del POC

Solo las que necesitamos para las 6 semanas. Nada más.

### Ya existen en SanchoCMO (0 trabajo)

| Skill | Para qué en el POC |
|-------|-------------------|
| `daily-pulse` | Temas del día de mercados financieros |
| `thief-marketers` | Espiar qué publican los competidores |
| `social-media-extractor` | Scraping de perfiles IG |
| `content-atomizer` | Romper un carrusel top en 2-3 quotes + 1 Story |
| `brand-voice` | Definir tono de la cuenta |
| `visual-identity` | Sistema visual coherente |
| `content-calendar-planner` | Base del calendario semanal |

### Instalar de antigravity (1-2 horas)

| Skill | Para qué en el POC |
|-------|-------------------|
| `instagram` | Publicar, DMs, comentarios, analytics via Graph API |
| `canva-automation` | Crear diseños con brand templates |
| `apify-trend-analysis` | Detectar contenido viral en el nicho |
| `apify-influencer-discovery` | Encontrar cuentas para shoutouts |
| `apify-content-analytics` | Métricas de engagement por post |

### Construir (6-8 horas)

| Skill | Para qué en el POC |
|-------|-------------------|
| `ig-content-planner` | Decidir qué publicar cada día (ratio, horario, formato, hook) |
| `ig-faceless-content` | Generar el contenido con reglas del nicho hardcodeadas |

### NO se usan en el POC (vienen después)

`paid-ads`, `ad-creative`, `meta-ads`, `direct-response-copy`, `copywriting`, `marketing-psychology`, `email-sequences` — todo esto es para monetización y paid growth, que no es parte del POC.

---

## 6. Inversión del POC

| Concepto | Costo | Notas |
|----------|-------|-------|
| Canva Pro | $13/mes | Templates y diseño automatizado |
| Fliki o Zebracat | $19-21/mes | Video para Reels (opcional — se puede arrancar solo con quotes y carruseles) |
| Apify | $0 | Free tier alcanza para el POC |
| SanchoCMO | $0 | Ya lo tenemos |
| Ads | $0 | No en el POC |
| **Total** | **~$13-34/mes** | |

Tiempo humano: ~5 horas/semana (setup semana 0 más intensivo: ~15 horas).

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Contenido IA se siente genérico | Alta | Alto | Hooks basados en datos reales, no frases motivacionales. Screen recordings como diferenciador. Revisión humana de cada batch. |
| Instagram penaliza publicación via API | Baja | Alto | La Graph API es oficial de Meta. Rate limits respetados (200 calls/hora). Governance en la skill `instagram`. |
| Nadie acepta shoutouts | Media | Medio | Empezar con cuentas pequeñas (1-5K) que tienen más incentivo. Ofrecer valor primero (comentar en sus posts durante 2 semanas antes de pedir). |
| El nicho LATAM es demasiado pequeño | Baja | Alto | Los datos dicen lo contrario (500M+ hispanohablantes, gap de mercado). Pero si el engagement es bajo, pivotamos a inglés. |
| Star Trader cambia condiciones de affiliate | Media | Medio | El contenido nunca menciona a Star Trader — el affiliate en bio es intercambiable por cualquier otro broker/producto. |

---

## Siguiente paso

Aprobar este plan → Ejecutar Semana 0 (setup).
