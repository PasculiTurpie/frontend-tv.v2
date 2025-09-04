import React from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "reactflow";

/**
 * Edge smoothstep direccional:
 * - Usa style.stroke para color
 * - Usa markerEnd para flecha (p.ej. { type: 1 })
 * - Muestra data.label o prop label
 */
const CustomDirectionalEdge = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerStart,
    markerEnd,
    label,
    data = {},
  } = props;

  // Path smoothstep
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const text = data?.label ?? label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      {text && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: 12,
              fontWeight: 600,
              color: style?.stroke || "#333",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomDirectionalEdge;
