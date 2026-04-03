import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
} from "remotion";
import { Video, Audio } from "@remotion/media";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/Inter";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Scene {
  text_line1: string;
  text_line2: string;
  text_line3: string;
  /** Duración en frames (a 24 fps) */
  duration: number;
  /** URL de video de fondo (Pexels). Si no hay, usa fondo sólido. */
  videoUrl?: string;
}

export type FinanzasReelProps = {
  scenes: Scene[];
  hook: string;
  /** URL de música de fondo (royalty-free). Opcional. */
  musicUrl?: string;
};

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND = {
  cream: "#faf6f1",
  dark: "#1c1917",
  red: "#dc2626",
  white: "#ffffff",
};

/** Frames de overlap entre escenas — 1 frame = corte duro, sin mezcla de textos */
export const TRANSITION_FRAMES = 1;

// ---------------------------------------------------------------------------
// AnimatedLine
// ---------------------------------------------------------------------------

/**
 * Línea de texto que entra con spring (fade + slide desde abajo).
 * - delay: frames antes de que arranque la animación
 * - finalOpacity: opacidad final una vez asentada (default 1.0)
 *   IMPORTANTE: no pasar opacity en `style` o sobreescribirá la animación.
 */
const AnimatedLine: React.FC<{
  text: string;
  frame: number;
  fps: number;
  delay: number;
  finalOpacity?: number;
  style?: Omit<React.CSSProperties, "opacity" | "transform">;
}> = ({ text, frame, fps, delay, finalOpacity = 1, style }) => {
  if (!text) return null;

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        opacity: progress * finalOpacity,
        transform: `translateY(${(1 - progress) * 28}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Brand chrome — siempre visible en todas las escenas
// ---------------------------------------------------------------------------

const Logo: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 60,
      left: 60,
      width: 80,
      height: 80,
      borderRadius: "50%",
      backgroundColor: BRAND.red,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    }}
  >
    <span
      style={{
        color: BRAND.white,
        fontSize: 36,
        fontWeight: 700,
        fontFamily,
        lineHeight: 1,
      }}
    >
      fp
    </span>
  </div>
);

const Handle: React.FC<{ color?: string }> = ({ color = BRAND.dark }) => (
  <div
    style={{
      position: "absolute",
      bottom: 60,
      right: 60,
      zIndex: 10,
    }}
  >
    <span
      style={{
        color,
        fontSize: 28,
        fontWeight: 500,
        fontFamily,
        opacity: 0.7,
      }}
    >
      @finanzas.pop
    </span>
  </div>
);

const BottomBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 8,
      backgroundColor: BRAND.red,
      zIndex: 20,
    }}
  />
);

// ---------------------------------------------------------------------------
// SceneView
// ---------------------------------------------------------------------------

const SceneView: React.FC<{
  scene: Scene;
  index: number;
  totalScenes: number;
}> = ({ scene, index, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isLastScene = index === totalScenes - 1;

  const hasVideo = !!scene.videoUrl;
  const bg = hasVideo ? "#000" : isLastScene ? BRAND.dark : BRAND.cream;
  // Con video de fondo, texto siempre blanco para contraste
  const textColor = hasVideo || isLastScene ? BRAND.white : BRAND.dark;
  const handleColor = textColor;

  /**
   * Para escenas 1+ los delays compensan TRANSITION_FRAMES para que
   * las animaciones arranquen solo cuando la escena anterior ya desapareció.
   * Escena 0 (hook): línea 1 visible de inmediato, sin transición previa.
   */
  const offset = index === 0 ? 0 : TRANSITION_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {/* Video de fondo + overlay oscuro */}
      {hasVideo && (
        <>
          <AbsoluteFill style={{ zIndex: 0 }}>
            <Video
              src={scene.videoUrl!}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
              loop
            />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              zIndex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
            }}
          />
        </>
      )}

      {/* Contenido (texto + chrome) */}
      <AbsoluteFill
        style={{
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          padding: 80,
        }}
      >
        <Logo />
        <Handle color={handleColor} />
        <BottomBar />

      {index === 0 ? (
        // HOOK (escena 0): texto grande estilo portada (similar a carousel).
        // Línea 1 estática desde frame 0, líneas 2 y 3 se animan después.
        <>
          {scene.text_line1 ? (
            <div
              style={{
                color: hasVideo ? BRAND.white : BRAND.red,
                fontSize: 72,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.15,
                marginBottom: 24,
                fontFamily,
              }}
            >
              {scene.text_line1}
            </div>
          ) : null}
          <AnimatedLine
            text={scene.text_line2}
            frame={frame}
            fps={fps}
            delay={12}
            style={{
              color: textColor,
              fontSize: 54,
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.3,
              marginBottom: 14,
              fontFamily,
            }}
          />
          <AnimatedLine
            text={scene.text_line3}
            frame={frame}
            fps={fps}
            delay={24}
            finalOpacity={0.8}
            style={{
              color: textColor,
              fontSize: 44,
              fontWeight: 400,
              textAlign: "center",
              lineHeight: 1.3,
              fontFamily,
            }}
          />
        </>
      ) : (
        // ESCENAS 1–N: las 3 líneas entran una por una,
        // pero solo después de que la transición previa terminó (offset).
        <>
          <AnimatedLine
            text={scene.text_line1}
            frame={frame}
            fps={fps}
            delay={offset + 0}
            style={{
              color: textColor,
              fontSize: 52,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: 20,
              fontFamily,
            }}
          />
          <AnimatedLine
            text={scene.text_line2}
            frame={frame}
            fps={fps}
            delay={offset + 10}
            style={{
              color: textColor,
              fontSize: 40,
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.3,
              marginBottom: 14,
              fontFamily,
            }}
          />
          <AnimatedLine
            text={scene.text_line3}
            frame={frame}
            fps={fps}
            delay={offset + 20}
            finalOpacity={0.75}
            style={{
              color: textColor,
              fontSize: 36,
              fontWeight: 400,
              textAlign: "center",
              lineHeight: 1.3,
              fontFamily,
            }}
          />
        </>
      )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Composition principal
// ---------------------------------------------------------------------------

export const FinanzasReel: React.FC<FinanzasReelProps> = ({ scenes, hook, musicUrl }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      {/* Música de fondo — loop, volumen bajo para no tapar texto */}
      {musicUrl && (
        <Audio
          src={musicUrl.startsWith('http') ? musicUrl : staticFile(musicUrl)}
          volume={0.15}
          loop
        />
      )}
      <TransitionSeries>
        {scenes.map((scene, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={scene.duration}>
              <SceneView scene={scene} index={i} totalScenes={scenes.length} hook={hook} />
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={springTiming({
                  config: { damping: 200 },
                  durationInFrames: TRANSITION_FRAMES,
                })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
