import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
} from "remotion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Scene {
  text_line1: string;
  text_line2: string;
  text_line3: string;
  /** Duración en frames (a 24 fps, 96 frames = 4 segundos) */
  duration: number;
}

export interface FinanzasReelProps {
  scenes: Scene[];
  hook: string;
}

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND = {
  cream: "#faf6f1",
  dark: "#1c1917",
  red: "#dc2626",
  white: "#ffffff",
  fontFamily: "Inter, sans-serif",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Logo "fp" — círculo rojo con texto blanco, esquina superior izquierda */
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
        fontFamily: BRAND.fontFamily,
        lineHeight: 1,
      }}
    >
      fp
    </span>
  </div>
);

/** Handle @finanzas.pop — esquina inferior derecha */
const Handle: React.FC<{ color?: string }> = ({
  color = BRAND.dark,
}) => (
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
        fontFamily: BRAND.fontFamily,
        opacity: 0.7,
      }}
    >
      @finanzas.pop
    </span>
  </div>
);

/** Barra roja de 8px en la parte inferior — hilo visual de marca */
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
// Animated text line
// ---------------------------------------------------------------------------

/**
 * Una línea de texto que entra con spring animation.
 * delay = frames de retraso antes de que empiece la animación.
 */
const AnimatedLine: React.FC<{
  text: string;
  frame: number;
  fps: number;
  delay: number;
  style?: React.CSSProperties;
}> = ({ text, frame, fps, delay, style }) => {
  if (!text) return null;

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 18,
      stiffness: 80,
      mass: 0.6,
    },
  });

  const opacity = progress;
  const translateY = (1 - progress) * 40;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Single scene
// ---------------------------------------------------------------------------

const SceneView: React.FC<{
  scene: Scene;
  index: number;
  hook: string;
}> = ({ scene, index, hook }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isLastScene = index === 4;

  const bg = isLastScene ? BRAND.dark : BRAND.cream;
  const textColor = isLastScene ? BRAND.white : BRAND.dark;
  const handleColor = isLastScene ? BRAND.white : BRAND.dark;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: BRAND.fontFamily,
        padding: 80,
      }}
    >
      <Logo />
      <Handle color={handleColor} />
      <BottomBar />

      {/* Hook text — solo en la primera escena */}
      {index === 0 && (
        <AnimatedLine
          text={hook}
          frame={frame}
          fps={fps}
          delay={0}
          style={{
            color: BRAND.red,
            fontSize: 42,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 40,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        />
      )}

      {/* Línea principal */}
      <AnimatedLine
        text={scene.text_line1}
        frame={frame}
        fps={fps}
        delay={index === 0 ? 6 : 0}
        style={{
          color: textColor,
          fontSize: 64,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.2,
          marginBottom: 24,
        }}
      />

      {/* Línea secundaria */}
      <AnimatedLine
        text={scene.text_line2}
        frame={frame}
        fps={fps}
        delay={index === 0 ? 12 : 6}
        style={{
          color: textColor,
          fontSize: 48,
          fontWeight: 500,
          textAlign: "center",
          lineHeight: 1.3,
          opacity: 0.85,
          marginBottom: 16,
        }}
      />

      {/* Línea terciaria */}
      <AnimatedLine
        text={scene.text_line3}
        frame={frame}
        fps={fps}
        delay={index === 0 ? 18 : 12}
        style={{
          color: textColor,
          fontSize: 40,
          fontWeight: 400,
          textAlign: "center",
          lineHeight: 1.3,
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const FinanzasReel: React.FC<FinanzasReelProps> = ({
  scenes,
  hook,
}) => {
  // Calcula el frame de inicio de cada escena sumando duraciones
  let frameOffset = 0;

  return (
    <AbsoluteFill>
      {scenes.map((scene, i) => {
        const from = frameOffset;
        frameOffset += scene.duration;

        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={scene.duration}
          >
            <SceneView scene={scene} index={i} hook={hook} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
