import React from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "reactflow";

/**
 * Edge smoothstep direccional:
 * - Usa style.stroke para color de línea
 * - Usa markerEnd para flecha
 * - Etiqueta negra con fondo blanco y borde gris
 * - Si los nodos están casi al mismo X, mueve la etiqueta hacia la flecha (target)
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

  // Path smoothstep (devuelve punto medio como labelX/labelY)
  const [edgePath, midX, midY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const text = data?.label ?? label;

  // === Heurística: si están casi al mismo X (vertical), reubicar etiqueta cerca del target ===
  const EPS_X = 8;           // tolerancia para "misma X"
  const tNearTarget = 0.75;  // 0..1, más cerca del target
  const sameX = Math.abs(sourceX - targetX) <= EPS_X;

  // Interpolar desde el punto medio hacia el target
  const interp = (a, b, t) => a * (1 - t) + b * t;

  let labelX = midX;
  let labelY = midY;

  if (sameX) {
    // acercar al target
    labelX = interp(midX, targetX, tNearTarget);
    labelY = interp(midY, targetY, tNearTarget);

    // pequeño offset vertical para no pisar la flecha
    const dy = targetY - sourceY;
    const dirY = Math.sign(dy) || 1; // 1 si hacia abajo, -1 si hacia arriba
    labelY -= dirY * 10;             // separa un poco por encima de la punta
  }

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
              color: "black",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "2px 4px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
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
