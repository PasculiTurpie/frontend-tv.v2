// src/pages/ChannelDiagram/CustomDirectionalEdge.jsx
import React, { useCallback, useMemo, useRef } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "reactflow";

/** Etiqueta draggable */
const DraggableLabel = ({ x, y, children, onPointerDown }) => (
  <EdgeLabelRenderer>
    <div
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      style={{
        position: "absolute",
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        pointerEvents: "all",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: "4px 8px",
        fontSize: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        cursor: "grab",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
      className="nodrag nopan"
    >
      {children}
    </div>
  </EdgeLabelRenderer>
);

export default function CustomDirectionalEdge(props) {
  const {
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    data = {},
    label,
  } = props;

  const rf = useReactFlow();
  const dragRef = useRef({
    dragging: false,
    start: { x: 0, y: 0 },
    origin: { x: 0, y: 0 },
  });

  // Path tipo "step" (getSmoothStepPath devuelve [d, labelX, labelY])
  const [edgePath, defaultLabelX, defaultLabelY] = useMemo(() => {
    return getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 0, // recto
    });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  // Pequeño offset para separar ida/vuelta en etiquetas
  const PARALLEL_OFFSET = 8;
  const isAB = String(source) < String(target);

  const labelPos = useMemo(() => {
    const lp = data?.labelPos;
    const base = {
      x: Number.isFinite(lp?.x) ? lp.x : defaultLabelX,
      y: Number.isFinite(lp?.y) ? lp.y : defaultLabelY,
    };
    return { x: base.x, y: base.y + (isAB ? -PARALLEL_OFFSET : PARALLEL_OFFSET) };
  }, [data?.labelPos, defaultLabelX, defaultLabelY, isAB]);

  const onPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      const start = {
        x: "touches" in e ? e.touches[0].clientX : e.clientX,
        y: "touches" in e ? e.touches[0].clientY : e.clientY,
      };

      dragRef.current.dragging = true;
      dragRef.current.start = start;
      dragRef.current.origin = { ...labelPos };

      const onMove = (ev) => {
        if (!dragRef.current.dragging) return;
        const curr = {
          x: "touches" in ev ? ev.touches[0].clientX : ev.clientX,
          y: "touches" in ev ? ev.touches[0].clientY : ev.clientY,
        };
        const dx = curr.x - dragRef.current.start.x;
        const dy = curr.y - dragRef.current.start.y;

        const next = {
          x: dragRef.current.origin.x + dx,
          y: dragRef.current.origin.y + dy,
        };

        rf.setEdges((eds) =>
          eds.map((edge) =>
            edge.id === id ? { ...edge, data: { ...(edge.data || {}), labelPos: next } } : edge
          )
        );
      };

      const onUp = () => {
        dragRef.current.dragging = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    },
    [id, labelPos, rf]
  );

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {(label || data?.label) && (
        <DraggableLabel x={labelPos.x} y={labelPos.y} onPointerDown={onPointerDown}>
          {label || data?.label}
        </DraggableLabel>
      )}
    </>
  );
}
