# Template Variation System — @finanzas.pop

## The Problem

Every post looks the same: cream background, red accent, dark text. The feed is monotone. Followers scroll past because nothing visually "pops" as different. We need variation that still feels like ONE brand.

---

## The Brand Thread (What Stays the Same Across ALL Templates)

Every template shares these three elements. This is what makes a post recognizable as @finanzas.pop even out of context:

1. **The Red Bar**: A solid `#dc2626` bar (8px tall, full width) at the bottom of every post. Always present, always the same red, always at the bottom. This is the single most recognizable element.

2. **The Logo Pill**: The "fp" logo (white text on `#dc2626` circle, 36px diameter) positioned in the bottom-right corner, 24px from the bottom bar, 24px from the right edge. Same position in every template.

3. **The Source Line**: Every post includes a source attribution (e.g., "Fuente: INEGI, 2026") in `Inter Medium`, 14px, at 60% opacity, positioned just above the red bottom bar. This is the trust signal that separates @finanzas.pop from finfluencer noise.

**Font**: Inter is always the typeface. No exceptions. Variation comes from weight and size, never from switching fonts.

---

## Color Palette (Expanded from Original)

The original palette was just three colors. We expand to a controlled set:

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Cream (original bg) | Warm white | `#faf6f1` | Templates 1, 3 |
| Ink | Near black | `#1c1917` | Dark backgrounds, primary text on light |
| Brand Red | True red | `#dc2626` | Bottom bar, logo, key data points |
| Slate | Cool dark | `#1e293b` | Dark editorial backgrounds |
| Mint | Soft green | `#d1fae5` | Positive data, "good news" |
| Amber | Warm accent | `#f59e0b` | Warnings, attention |
| Stone | Neutral warm | `#e7e5e4` | Dividers, secondary backgrounds |
| White | Pure white | `#ffffff` | Text on dark, cards |

---

## Template 1: "Daily Briefing"

**When to use**: Breaking news, market updates, daily finance headlines. The bread-and-butter post.

**Layout** (1080x1080):
- Background: `#faf6f1` (original cream)
- Top section (0-160px): Category tag in `#dc2626` background with white text, left-aligned. Pill shape, e.g., "NOTICIAS". Inter Bold, 16px, uppercase, tracking 1.5px.
- Main headline area (160-700px): Headline text, left-aligned, `#1c1917`. Inter Bold, 52px, line-height 1.15. Max 3 lines.
- Supporting data (700-860px): One key number in `#dc2626`, Inter Black, 72px. Below it, a one-line explanation in `#1c1917`, Inter Regular, 22px.
- Bottom zone (860-1080px): Source line + red bar + logo pill.

**Accent usage**: Red only on the category tag, the key number, and the bottom bar. Everything else is black on cream.

**Special elements**:
- Vertical thin red line (2px) running from below the category tag to above the key number, left side, 48px from edge. Adds editorial structure.

**Vibe**: Clean newspaper front page. Authoritative.

---

## Template 2: "Bold Data"

**When to use**: Posts centered on ONE shocking statistic. "Solo el 8.8% de mexicanos invierte." The data IS the content.

**Layout** (1080x1080):
- Background: `#1e293b` (dark slate) — this is the dramatic contrast template
- Center-dominant layout
- The number: Inter Black, 160px, `#ffffff`, centered horizontally, positioned at y=320. Just the number (e.g., "8.8%", "$193K", "77%").
- The unit/context: Inter Medium, 28px, `#dc2626`, centered, directly below the number (y=500). E.g., "de mexicanos vive al límite de su quincena"
- A thin horizontal line, `#dc2626`, 120px wide, centered, between number and context line.
- Bottom zone: Source in `#ffffff` at 50% opacity + red bar + logo pill (logo on dark uses white circle with red "fp" — INVERTED).

**Accent usage**: Red on the context line, the divider, and the bottom bar. The big number is white. Maximum contrast.

**Special elements**:
- The number has a subtle `#dc2626` text-shadow (2px offset, 0 blur) to give it weight on dark background.
- No category tag — the number speaks for itself.

**Vibe**: Bloomberg terminal meets street poster. Impossible to scroll past.

---

## Template 3: "Comparison Grid"

**When to use**: "CETES vs Nu vs Mercado Pago", "Afore vs cuenta de ahorro", any A-vs-B or A-vs-B-vs-C content.

**Layout** (1080x1080):
- Background: `#ffffff`
- Title bar (0-140px): Full-width `#1c1917` background. Title in `#ffffff`, Inter Bold, 36px, centered. E.g., "CETES vs Nu vs Hey Banco"
- Grid area (140-860px):
  - For 2-column: two equal columns (490px each) separated by a 2px `#e7e5e4` vertical line
  - For 3-column: three columns (340px each) separated by 2px `#e7e5e4` lines
  - Column header: product/option name, Inter Bold, 24px, `#1c1917`
  - Row items: Inter Regular, 20px, `#1c1917`. Each row separated by 1px `#e7e5e4` horizontal line
  - The WINNING value in each comparison row is highlighted in `#dc2626` Inter Bold
  - Rows: Rendimiento, Riesgo, Mínimo, Plazo, etc. (depends on content)
- Bottom zone (860-1080px): Source + red bar + logo pill.

**Accent usage**: Red ONLY on the winning/best values in the comparison. This creates a visual "winner" without stating it explicitly.

**Special elements**:
- Each column header has a small colored dot (8px) to the left: `#dc2626` for the recommended option, `#e7e5e4` for others.
- The grid has 24px padding on all sides.

**Vibe**: Consumer Reports for Mexican finance. Functional, trustworthy, saveable.

---

## Template 4: "Editorial Quote"

**When to use**: Provocative statements, opinion-driven hooks, myth-busting. "Tu tanda genera $0 de rendimiento." Posts designed to start debates in comments.

**Layout** (1080x1080):
- Background: `#1c1917` (full black — the moodiest template)
- Huge opening quote mark: Inter Black, 200px, `#dc2626`, positioned at x=48, y=120. Just the character `"`.
- Quote text: Inter Bold, 44px, `#ffffff`, left-aligned, x=48, y=300, max-width 984px (48px padding each side). Line-height 1.3. Max 4 lines.
- Below quote (24px gap): A one-line "so what" takeaway. Inter Regular, 22px, `#dc2626`. E.g., "Mover tu dinero toma 5 minutos."
- Bottom zone: Source in `#ffffff` at 40% opacity + red bar + logo pill (inverted: white circle, red "fp").

**Accent usage**: Red on the quote mark, the takeaway line, and the bottom bar. Everything else is white on black.

**Special elements**:
- No category tag, no grid, no number. Pure typography.
- The quote mark acts as the visual anchor — it's oversized and impossible to miss.

**Vibe**: The Economist meets Instagram. Shareable, opinionated.

---

## Template 5: "Step-by-Step"

**When to use**: "How to" content, tutorials, practical guides. "Cómo dolarizar en 5 minutos", "3 pasos para abrir tu cuenta de CETES".

**Layout** (1080x1080):
- Background: `#faf6f1` (cream)
- Title area (0-180px): Title in `#1c1917`, Inter Bold, 38px, left-aligned at x=48. Below title, a `#dc2626` underline bar, 80px wide, 4px tall.
- Steps area (180-860px): Numbered steps stacked vertically, each step is a row:
  - Step number: Inter Black, 48px, `#dc2626`, left-aligned at x=48
  - Step text: Inter Medium, 24px, `#1c1917`, left-aligned at x=120, vertically centered with the number
  - Between steps: 1px `#e7e5e4` horizontal line, full width minus 48px padding each side
  - Max 5 steps. Each step row is ~130px tall.
- Bottom zone (860-1080px): Source + red bar + logo pill.

**Accent usage**: Red on step numbers and the title underline. Text is all dark.

**Special elements**:
- The step numbers are oversized relative to the text — they act as visual anchors.
- If a step has a key value (e.g., "$500", "5 minutos"), that specific value is in `#dc2626` inline.

**Vibe**: IKEA instructions for your money. Clear, actionable, saveable.

---

## Template 6: "The Reveal"

**When to use**: "What nobody tells you about X", myth-busting, hidden truths, "5 señales de que es estafa". Content where the hook is the gap between what you THINK and what IS.

**Layout** (1080x1080):
- Background: Split — top 60% is `#1e293b` (dark slate), bottom 40% is `#faf6f1` (cream)
- Top section (dark zone, 0-648px):
  - Category: "LO QUE CREES" in `#f59e0b` (amber), Inter Bold, 16px, uppercase, x=48, y=60
  - The myth/assumption: Inter Bold, 40px, `#ffffff`, left-aligned at x=48, y=120. Max 3 lines.
  - A strikethrough line across the text — 3px, `#dc2626`, slight diagonal (-2deg).
- Bottom section (cream zone, 648-1080px):
  - Category: "LA REALIDAD" in `#dc2626`, Inter Bold, 16px, uppercase, x=48, y=680
  - The truth: Inter Bold, 36px, `#1c1917`, left-aligned at x=48, y=720. Max 2 lines.
  - Source + red bar + logo pill in the cream zone.

**Accent usage**: Red on the strikethrough, "LA REALIDAD" label, and bottom bar. Amber on "LO QUE CREES". This is the only template that uses amber.

**Special elements**:
- The strikethrough across the myth text is the signature move of this template. It creates instant visual tension.
- The dark-to-light split represents going from confusion to clarity.

**Vibe**: MythBusters meets infographic. Confrontational, engagement-bait (in a good way).

---

## Template 7: "Ranking / List"

**When to use**: "Las 5 empresas mexicanas más rentables", "Top 3 fintechs por rendimiento", any ranked list content.

**Layout** (1080x1080):
- Background: `#ffffff`
- Title area (0-140px): `#1c1917` background, full width. Title in `#ffffff`, Inter Bold, 34px, centered.
- List area (140-860px): Stacked rows, each 144px tall:
  - Rank number: Inter Black, 64px, `#dc2626`, x=48, vertically centered in row
  - Item name: Inter Bold, 28px, `#1c1917`, x=140, top third of row
  - Detail/value: Inter Regular, 20px, `#78716c` (muted), x=140, bottom third of row
  - Right side: Key metric in Inter Bold, 28px, `#1c1917`, right-aligned at x=1032
  - Between rows: 1px `#e7e5e4` divider
- First item has a subtle `#fef2f2` (very light red) background to highlight #1.
- Bottom zone (860-1080px): Source + red bar + logo pill.

**Accent usage**: Red only on rank numbers. The #1 item's light red background is the only other red element.

**Special elements**:
- Rank numbers decrease in size slightly (64px for #1, 56px for #2, 48px for #3+) to create visual hierarchy.
- Max 5 items.

**Vibe**: Scoreboard energy. Competitive, saveable, shareable as "did you know #1 was...?"

---

## Template 8: "Pop Context"

**When to use**: Connecting pop culture, trending topics, or "chismecorporativo" with finance. "El modelo de negocio de OnlyFans", "Lo que Noruega hizo con su petróleo", "Cuánto gana Bimbo por segundo".

**Layout** (1080x1080):
- Background: `#1c1917` (dark)
- Top tag (0-100px): A `#dc2626` pill-shaped tag at top-left (x=48, y=40), with the trending topic in white, Inter Bold, 16px, uppercase. E.g., "TRENDING", "CHISME CORPORATIVO", "POP CULTURE".
- Main hook (100-480px): The provocative headline, Inter Black, 48px, `#ffffff`, left-aligned at x=48. Line-height 1.1. Max 3 lines. This is the biggest, boldest text in the system.
- Mid divider (480-520px): Thin `#dc2626` line, 64px wide, left-aligned at x=48.
- Context block (520-860px): The finance explanation/analysis, Inter Regular, 22px, `#e7e5e4` (light gray, not full white — creates hierarchy). Left-aligned at x=48, max-width 984px. Max 6 lines.
- Bottom zone (860-1080px): Source in `#ffffff` at 40% opacity + red bar + logo pill (inverted).

**Accent usage**: Red on the top tag pill, the divider, and the bottom bar. Text is white and light gray on dark.

**Special elements**:
- The top tag pill has rounded corners (16px radius) — it's the only rounded element in the system, making it feel like a "label" or "badge".
- The headline is Inter BLACK (900 weight) — the heaviest weight used in any template. This template is designed to stop the scroll.

**Vibe**: Vice News headline meets financial analysis. The "I need to send this to someone" template.

---

## Rotation Logic

| Content Type | Primary Template | Alternate |
|---|---|---|
| Breaking news / market update | T1: Daily Briefing | T4: Editorial Quote (if opinion-heavy) |
| Shocking statistic | T2: Bold Data | T6: The Reveal (if myth-busting) |
| Product/service comparison | T3: Comparison Grid | — |
| Provocative take / opinion | T4: Editorial Quote | T8: Pop Context (if trending topic) |
| How-to / tutorial | T5: Step-by-Step | — |
| Myth-busting / hidden truth | T6: The Reveal | T2: Bold Data (if single stat) |
| Ranked list / top N | T7: Ranking / List | T3: Comparison Grid (if 2-3 items) |
| Pop culture + finance | T8: Pop Context | T4: Editorial Quote (if quote-driven) |

**Feed rhythm rule**: Never use the same template more than 2 times in a row. After 2 uses of the same template, force-rotate to a different one. The feed grid should show at least 3 different templates in any visible 3x3 grid (9 posts).

**Light/Dark balance**: Templates 1, 3, 5, 7 are light. Templates 2, 4, 6 (top half), 8 are dark. Alternate light-dark when possible for maximum feed contrast.

---

## Satori Implementation Notes

All templates render at **1080x1080px** (Instagram square).

### Shared Container (All Templates)

```
Container: 1080x1080
├── Content Area: 1080x1000 (varies per template)
├── Source Line: y=1008, x=48, Inter Medium 14px, opacity 0.6
├── Red Bottom Bar: y=1072, x=0, w=1080, h=8, fill=#dc2626
└── Logo Pill: x=1008, y=1020, diameter=36, fill=#dc2626 (or #fff on dark)
    └── "fp" text: Inter Bold 16px, #ffffff (or #dc2626 on dark)
```

### Font Weights Used

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text, descriptions, source lines |
| 500 | Medium | Secondary text, step descriptions |
| 700 | Bold | Headlines, titles, labels |
| 900 | Black | Big numbers (T2), rank numbers (T7), pop headlines (T8) |

### Template ID Mapping

```
T1 = "daily-briefing"
T2 = "bold-data"
T3 = "comparison-grid"
T4 = "editorial-quote"
T5 = "step-by-step"
T6 = "the-reveal"
T7 = "ranking-list"
T8 = "pop-context"
```

### Z-Index Layering (for overlapping elements)

1. Background color/split
2. Decorative elements (vertical lines, quote marks)
3. Text content
4. Source line
5. Red bottom bar
6. Logo pill (always on top)
