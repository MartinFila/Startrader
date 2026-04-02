/**
 * render.mjs — Renderiza un FinanzasReel a MP4 a partir de un JSON de guión.
 *
 * Uso:
 *   node remotion/render.mjs path/to/script.json
 *   node remotion/render.mjs path/to/script.json --output custom-name.mp4
 *
 * El JSON debe tener la forma:
 * {
 *   "hook": "Texto del hook",
 *   "slug": "nombre-del-reel",
 *   "scenes": [
 *     { "text_line1": "...", "text_line2": "...", "text_line3": "...", "duration": 96 },
 *     ...
 *   ]
 * }
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Parse arguments
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const jsonPath = args.find((a) => !a.startsWith("--"));
const outputFlag = args.indexOf("--output");
const customOutput =
  outputFlag !== -1 ? args[outputFlag + 1] : null;

if (!jsonPath) {
  console.error(
    "Uso: node remotion/render.mjs <script.json> [--output name.mp4]"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load script
// ---------------------------------------------------------------------------

const scriptRaw = fs.readFileSync(path.resolve(jsonPath), "utf-8");
const script = JSON.parse(scriptRaw);

const { hook, scenes, slug } = script;

if (!scenes || !Array.isArray(scenes)) {
  console.error("El JSON debe tener un array 'scenes'.");
  process.exit(1);
}

// Output path
const outputDir = path.join(ROOT, "Contenido_IG", "reels");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const today = new Date().toISOString().slice(0, 10);
const outputName =
  customOutput || `reel-${today}-${slug || "finanzas"}.mp4`;
const outputPath = path.join(outputDir, outputName);

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

async function main() {
  console.log("Bundling Remotion project...");

  const bundleLocation = await bundle({
    entryPoint: path.join(ROOT, "remotion", "index.tsx"),
    // Remotion necesita webpack — el bundler lo maneja internamente
  });

  console.log("Selecting composition...");

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "FinanzasReel",
    inputProps: { hook, scenes },
  });

  // durationInFrames viene calculado por calculateMetadata en index.tsx
  const actualFrames = composition.durationInFrames;

  console.log(
    `Rendering ${actualFrames} frames (${(actualFrames / 24).toFixed(1)}s) to ${outputPath}...`
  );

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: { hook, scenes },
  });

  // Render portada at frame 24 (1s in) — animations have fully settled by then
  const coverPath = outputPath.replace(".mp4", "-portada.png");
  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: coverPath,
    inputProps: { hook, scenes },
    frame: 24,
    imageFormat: "png",
  });

  console.log(`Listo: ${outputPath}`);
  console.log(`Portada: ${coverPath}`);
}

main().catch((err) => {
  console.error("Error en render:", err);
  process.exit(1);
});
