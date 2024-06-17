import { InteractionData } from "./InteractiveHeatmap";
import styles from "../Umap/tooltip.module.css"


type TooltipProps = {
  interactionData: InteractionData | null;
  width: number;
  height: number;
};

export const Tooltip = ({ interactionData, width, height }: TooltipProps) => {
  if (!interactionData) {
    return null;
  }

  return (
    // Wrapper div: a rect on top of the viz area
    <div
      style={{
        width,
        height,
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      {/* The actual box with dark background */}
      <div
        className={styles.tooltip}
        style={{
          position: "absolute",
          left: interactionData.xPos,
          top: interactionData.yPos,
          wordBreak: 'break-word'
        }}
      >
        <TooltipRow label={"x"} value={interactionData.xLabel} />
        <TooltipRow label={"y"} value={interactionData.yLabel} />
        <TooltipRow label={"Jaccard Sim."} value={String(interactionData.value)} />
      </div>
    </div>
  );
};

type TooltipRowProps = {
  label: string;
  value: string;
};

const TooltipRow = ({ label, value }: TooltipRowProps) => (
  <div className={styles.row}>
    <b>{label}</b>
    <span style={{marginLeft: 10}}>{value}</span>
  </div>
);
