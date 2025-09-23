// src/pages/ChannelDiagram/CustomWaypointEdge.jsx
import React, { useCallback, useMemo, useRef } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
} from "reactflow";

/**
 * Edge con waypoints:
 * - Doble click sobre la línea: agrega un waypoint en la posición del click.
 * - Arrastrar los puntos (circulitos) para moldear la ruta.
 * - Alt/Option + Click sobre un punto: elimina ese waypoint.
 * - Si no quedan waypoints, cambia a type "directional".
 */
export default function CustomWaypointEdge(props) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style,
    markerEnd,
    data = {},
    label,
    source,
    target,
  } = props;

  const rf = useReactFlow();
  const draggingIdx = useRef(-1);

  const points = useMemo(() => {
    const wp = Array.isArray(data.waypoints) ? data.waypoints : [];
    // Path: start -> waypoints -> end
    return [{ x: sourceX, y: sourceY }, ...wp, { x: targetX, y: targetY }];
  }, [sourceX, sourceY, targetX, targetY, data.waypoints]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    const [start, ...rest] = points;
    const segs = rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
    return `M ${start.x} ${start.y} ${segs}`;
  }, [points]);

  // Midpoint simple para colocar etiqueta
  const { labelX, labelY } = useMemo(() => {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      total += Math.hypot(b.x - a.x, b.y - a.y);
    }
    let half = total / 2;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (half > seg) {
        half -= seg;
        continue;
      }
      const t = seg === 0 ? 0 : half / seg;
      return { labelX: a.x + (b.x - a.x) * t, labelY: a.y + (b.y - a.y) * t };
    }
    const last = points[points.length - 1];
    return { labelX: last.x, labelY: last.y };
  }, [points]);

  // Agregar waypoint con doble click en el trazo
  const onDoubleClickPath = useCallback(
    (e) => {
      e.stopPropagation();
      const pane = rf.project({ x: e.clientX, y: e.clientY });
      rf.setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id !== id) return edge;
          const current = Array.isArray(edge.data?.waypoints) ? edge.data.waypoints : [];
          const next = [...current, { x: pane.x, y: pane.y }];
          return {
            ...edge,
            type: "waypoint",
            data: { ...(edge.data || {}), waypoints: next },
          };
        })
      );
    },
    [id, rf]
  );

  // Drag de un waypoint
  const onPointerDownPoint = useCallback(
    (idx) => (e) => {
      e.stopPropagation();
      draggingIdx.current = idx;

      const move = (ev) => {
        const clientX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
        const clientY = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
        const pane = rf.project({ x: clientX, y: clientY });

        rf.setEdges((eds) =>
          eds.map((edge) => {
            if (edge.id !== id) return edge;
            const curr = Array.isArray(edge.data?.waypoints) ? edge.data.waypoints : [];
            if (idx < 0 || idx >= curr.length) return edge;
            const next = curr.map((p, i) => (i === idx ? { x: pane.x, y: pane.y } : p));
            return { ...edge, data: { ...(edge.data || {}), waypoints: next } };
          })
        );
      };

      const up = () => {
        draggingIdx.current = -1;
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", up);
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", up);
    },
    [id, rf]
  );

  // Eliminar waypoint con Alt/Option + Click
  const onClickPoint = useCallback(
    (idx) => (e) => {
      if (!e.altKey) return;
      e.stopPropagation();
      rf.setEdges((eds) =>
        eds
          .map((edge) => {
            if (edge.id !== id) return edge;
            const curr = Array.isArray(edge.data?.waypoints) ? edge.data.waypoints : [];
            const next = curr.filter((_, i) => i !== idx);
            // Si no quedan waypoints → volver a directional
            if (next.length === 0) {
              return {
                ...edge,
                type: "directional",
                data: { ...(edge.data || {}), waypoints: [] },
              };
            }
            return { ...edge, data: { ...(edge.data || {}), waypoints: next } };
          })
      );
    },
    [id, rf]
  );

  return (
    <>
      {/* Path visible */}
      <BaseEdge id={id} path={pathD} style={style} markerEnd={markerEnd} />

      {/* Path “ancho” para capturar doble click y facilitar interacción */}
      <path
        d={pathD}
        stroke="transparent"
        strokeWidth={24}
        fill="none"
        onDoubleClick={onDoubleClickPath}
        style={{ pointerEvents: "stroke" }}
      />

      {/* Waypoints (círculos) */}
      {Array.isArray(data.waypoints) &&
        data.waypoints.map((p, i) => (
          <circle
            key={`${id}-wp-${i}`}
            cx={p.x}
            cy={p.y}
            r={6}
            stroke={style?.stroke || "#000"}
            strokeWidth={2}
            fill="#fff"
            onMouseDown={onPointerDownPoint(i)}
            onTouchStart={onPointerDownPoint(i)}
            onClick={onClickPoint(i)}
            style={{ cursor: "grab" }}
          />
        ))}

      {/* Etiqueta en el punto medio del path */}
      {(label || data?.label) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
            className="nodrag nopan"
          >
            {label || data?.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
