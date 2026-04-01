import { Composition } from "remotion";
import { FinanzasReel, FinanzasReelProps } from "./FinanzasReel";

/**
 * Root file de Remotion.
 * Registra la composición "FinanzasReel" que el CLI y el renderer usan
 * para saber qué renderizar (resolución, fps, duración, componente).
 */

export const RemotionRoot: React.FC = () => {
  // Props por defecto para el preview — en render real se inyectan desde el JSON
  const defaultProps: FinanzasReelProps = {
    hook: "Dato financiero del día",
    scenes: [
      {
        text_line1: "Escena 1",
        text_line2: "Línea secundaria",
        text_line3: "",
        duration: 96,
      },
      {
        text_line1: "Escena 2",
        text_line2: "Más información",
        text_line3: "",
        duration: 96,
      },
      {
        text_line1: "Escena 3",
        text_line2: "Dato importante",
        text_line3: "",
        duration: 96,
      },
      {
        text_line1: "Escena 4",
        text_line2: "Contexto",
        text_line3: "",
        duration: 96,
      },
      {
        text_line1: "Escena 5 — CTA",
        text_line2: "Síguenos",
        text_line3: "@finanzas.pop",
        duration: 96,
      },
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
      />
    </>
  );
};
