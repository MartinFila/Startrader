# Start Trader — Instrucciones del proyecto

## Estilo de comunicación con Martín
- **Ser pedagógico**: explicar siempre QUÉ estoy haciendo y POR QUÉ lo hago antes de ejecutar. No explicaciones extensísimas, pero sí que Martín vaya entendiendo cada paso y cada decisión.
- No dar por sentado que entiende los pasos técnicos — ir explicando la lógica detrás de cada acción.

## Reglas generales de desarrollo
- Antes de modificar código, leerlo primero y entender el contexto.
- Preferir editar archivos existentes a crear nuevos.
- No sobre-ingeniar: soluciones simples y directas.
- No añadir features, refactors o mejoras que no se pidieron.
- Siempre dar links directos cuando se pida generar tokens o API keys — nunca solo instrucciones genéricas.

## Stack
- **Frontend**: (por definir)
- **Backend**: (por definir)
- Proyecto full-stack — frontend y backend en el mismo repo.

## Estructura del proyecto
```
Startrader/
├── frontend/     # App cliente
├── backend/      # API / servidor
├── shared/       # Tipos, utils, constantes compartidas
└── docs/         # PRDs, specs, decisiones de diseño
```

## API Credit Safety
- NUNCA ejecutar tareas en background que consuman créditos de APIs de pago sin confirmación explícita.
- Poner safeguards (límites, dry-run) antes de cualquier operación batch con APIs externas.

## Plugins disponibles
- `/code-review` — Revisión de código
- `/simplify` — Simplificar código complejo
- `/frontend-design` — Diseño de interfaces con alta calidad visual
- `/feature-dev` — Desarrollo de features (arquitecto + explorador + reviewer)
- Playwright — Testing E2E
- Ralph Loop — Tareas recurrentes
- **Superpowers** — Brainstorming, desarrollo con subagentes, debugging sistemático, TDD red/green
  - `/brainstorm` — Sesión de brainstorming
  - `/write-plan` — Crear plan de implementación
  - `/execute-plan` — Ejecutar plan con subagentes
