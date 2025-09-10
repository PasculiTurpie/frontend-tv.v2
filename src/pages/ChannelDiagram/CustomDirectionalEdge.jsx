import React, { useCallback, useMemo, useRef } from "react";
import {
  BezierEdge,
  getBezierPath,
  getEdgeCenter,
  EdgeLabelRenderer,
  useReactFlow,
} from "reactflow";

/**
 * Label visual + draggable
 */
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
    >
      {children}
    </div>
  </EdgeLabelRenderer>
);

export default function CustomDirectionalEdge(props) {
  const {
    id,
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

  // Path + centro por defecto
  const [edgePath, cx, cy] = useMemo(() => {
    const path = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const [centerX, centerY] = getEdgeCenter({ sourceX, sourceY, targetX, targetY });
    return [path, centerX, centerY];
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  // Posición actual del label (si no hay data.labelPos => centro)
  const labelPos = useMemo(() => {
    const lp = data?.labelPos;
    if (lp && Number.isFinite(lp.x) && Number.isFinite(lp.y)) return lp;
    return { x: cx, y: cy };
  }, [data?.labelPos, cx, cy]);

  // Handler drag label
  const onPointerDown = useCallback((e) => {
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

      // Actualiza el edge en el store (esto dispara onEdgesChange indirectamente)
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
  }, [id, labelPos, rf]);

  return (
    <>
      <BezierEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {(label || data?.label) && (
        <DraggableLabel x={labelPos.x} y={labelPos.y} onPointerDown={onPointerDown}>
          {label || data?.label}
        </DraggableLabel>
      )}
    </>
  );
}