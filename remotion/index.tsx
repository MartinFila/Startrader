import React from "react";
import { Composition, CalculateMetadataFunction, registerRoot } from "remotion";
import { FinanzasReel, FinanzasReelProps, TRANSITION_FRAMES } from "./FinanzasReel";

/**
 * Root file de Remotion.
 * Duración calculada dinámicamente desde los scenes del script JSON.
 */

const calculateMetadata: CalculateMetadataFunction<FinanzasReelProps> = ({
  props,
}) => {
  const totalFromScenes = props.scenes.reduce(
    (sum, s) => sum + (s.duration || 96),
    0
  );
  // TransitionSeries acorta la duración total por cada transición (fade overlap)
  const numTransitions = Math.max(0, props.scenes.length - 1);
  const durationInFrames = totalFromScenes - numTransitions * TRANSITION_FRAMES;
  return { durationInFrames };
};

export const RemotionRoot: React.FC = () => {
  const defaultProps: FinanzasReelProps = {
    hook: "Dato financiero del día",
    scenes: [
      { text_line1: "Escena 1", text_line2: "Línea secundaria", text_line3: "", duration: 96 },
      { text_line1: "Escena 2", text_line2: "Más información", text_line3: "", duration: 96 },
      { text_line1: "Escena 3", text_line2: "Dato importante", text_line3: "", duration: 96 },
      { text_line1: "Escena 4", text_line2: "Contexto", text_line3: "", duration: 96 },
      { text_line1: "Escena 5 — CTA", text_line2: "Síguenos", text_line3: "@finanzas.pop", duration: 96 },
    ],
  };

  return (
    <>
      <Composition
        id="FinanzasReel"
        component={FinanzasReel}
        durationInFrames={480}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};

registerRoot(RemotionRoot);
