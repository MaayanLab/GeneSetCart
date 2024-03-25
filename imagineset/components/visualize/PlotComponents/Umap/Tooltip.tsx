import styles from "./tooltip.module.css";

// Information needed to build the tooltip
export type InteractionData = {
  xPos: number;
  yPos: number;
  name: string;
  group: string;
  color: string;
};

type TooltipProps = {
  interactionData: InteractionData | null;
};

export const Tooltip = ({ interactionData }: TooltipProps) => {
  if (!interactionData) {
    return null;
  }

  return (
    <div
      className={styles.tooltip}
      style={{
        left: interactionData.xPos,
        top: interactionData.yPos,
      }}
    >
      <b className={styles.title}>{interactionData.name}</b>
      <div className={styles.topHalfContainer} style={{ borderColor: interactionData.color }}>
        <div className={styles.row}>
          <span>Group</span>
          <b>{interactionData.group}</b>
        </div>
      </div>
    </div>
  );
};
