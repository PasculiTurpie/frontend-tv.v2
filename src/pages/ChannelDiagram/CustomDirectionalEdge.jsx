import React, { useCallback, useMemo, useRef } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";

/** Offset para separar visualmente ida/vuelta */
const PARALLEL_OFFSET = 10;

/** Path "step" con offset perpendicular (si es vuelta: desplazamos al lado opuesto) */
function offsetPathStep({
  sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, isReverse
}) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const vertical = Math.abs(dy) >= Math.abs(dx);

  const sign = isReverse ? 1 : -1; // ida arriba/izq, vuelta abajo/der
  const ox = vertical ? sign * PARALLEL_OFFSET : 0;
  const oy = vertical ? 0 : sign * PARALLEL_OFFSET;

  const [d, lx, ly] = getSmoothStepPath({
    sourceX: sourceX + ox,
    sourceY: sourceY + oy,
    targetX: targetX + ox,
    targetY: targetY + oy,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  return [d, lx + ox, ly + oy];
}

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
    startPane: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
  });

  const isReverse = !!data?.__reversed;

  // Path con offset para paralelos + punto por defecto del label
  const [edgePath, defaultLabelX, defaultLabelY] = useMemo(() => {
    return offsetPathStep({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      isReverse,
    });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, isReverse]);

  const labelPos = useMemo(() => {
    const lp = data?.labelPos;
    return {
      x: Number.isFinite(lp?.x) ? lp.x : defaultLabelX,
      y: Number.isFinite(lp?.y) ? lp.y : defaultLabelY,
    };
  }, [data?.labelPos, defaultLabelX, defaultLabelY]);

  // Drag del label (usa coords de pane y notifica al contenedor para persistir)
  const onPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      const startClient = {
        x: "touches" in e ? e.touches[0].clientX : e.clientX,
        y: "touches" in e ? e.touches[0].clientY : e.clientY,
      };
      const startPane = rf.project(startClient);

      dragRef.current.dragging = true;
      dragRef.current.startPane = startPane;
      dragRef.current.startOffset = {
        x: (data?.labelPos?.x ?? defaultLabelX) - startPane.x,
        y: (data?.labelPos?.y ?? defaultLabelY) - startPane.y,
      };

      const onMove = (ev) => {
        if (!dragRef.current.dragging) return;
        const currClient = {
          x: "touches" in ev ? ev.touches[0].clientX : ev.clientX,
          y: "touches" in ev ? ev.touches[0].clientY : ev.clientY,
        };
        const currPane = rf.project(currClient);
        const next = {
          x: currPane.x + dragRef.current.startOffset.x,
          y: currPane.y + dragRef.current.startOffset.y,
        };

        window.dispatchEvent(
          new CustomEvent("edge-data-change", {
            detail: { edgeId: id, dataPatch: { labelPos: next } },
          })
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
    [id, data, defaultLabelX, defaultLabelY, rf]
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
