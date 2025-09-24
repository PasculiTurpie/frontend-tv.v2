import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { UserContext } from "../../components/context/UserContext"; // ⬅️ ruta real

const PARALLEL_OFFSET = 10;

function offsetPathStep({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, isReverse }) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const vertical = Math.abs(dy) >= Math.abs(dx);

  const sign = isReverse ? 1 : -1;
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

function EditableDraggableLabel({ id, x, y, text, onDragMove }) {
  const rf = useReactFlow();
  const { isAuth } = useContext(UserContext);
  const dragRef = useRef({ dragging: false, startOffset: { x: 0, y: 0 } });
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text ?? "");

  useEffect(() => { if (!editing) setValue(text ?? ""); }, [text, editing]);

  const startEdit = useCallback((e) => {
    if (!isAuth) return;
    e.stopPropagation(); e.preventDefault();
    setEditing(true);
  }, [isAuth]);

  const commit = useCallback(() => {
    if (!isAuth) { setEditing(false); return; }
    setEditing(false);
    rf.setEdges((eds) =>
      eds.map((e) =>
        e.id === id ? { ...e, label: value, data: { ...(e.data || {}), label: value } } : e
      )
    );
    window.dispatchEvent(new Event("flow:save"));
  }, [id, value, rf, isAuth]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  }, [commit]);

  const onPointerDown = useCallback((e) => {
    if (!isAuth || editing) return;
    e.stopPropagation(); e.preventDefault();

    const startClient = { x: "touches" in e ? e.touches[0].clientX : e.clientX, y: "touches" in e ? e.touches[0].clientY : e.clientY };
    const startPane = rf.project(startClient);

    dragRef.current.dragging = true;
    dragRef.current.startOffset = { x: (x ?? startPane.x) - startPane.x, y: (y ?? startPane.y) - startPane.y };

    const onMove = (ev) => {
      if (!dragRef.current.dragging) return;
      const currClient = { x: "touches" in ev ? ev.touches[0].clientX : ev.clientX, y: "touches" in ev ? ev.touches[0].clientY : ev.clientY };
      const currPane = rf.project(currClient);
      const next = { x: currPane.x + dragRef.current.startOffset.x, y: currPane.y + dragRef.current.startOffset.y };
      onDragMove?.(next);
    };

    const onUp = () => {
      dragRef.current.dragging = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.dispatchEvent(new Event("flow:save")); // guarda al soltar
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, [editing, x, y, rf, onDragMove, isAuth]);

  return (
    <EdgeLabelRenderer>
      {!editing ? (
        <div
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          onDoubleClick={startEdit}
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
            cursor: isAuth ? "grab" : "default",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
          className="nodrag nopan"
          title={isAuth ? "Doble click para editar. Arrastra para mover." : "Solo lectura"}
        >
          {value}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          onMouseDown={(e) => { e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); }}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            pointerEvents: "all",
            background: "#fff",
            border: "1px solid #bbb",
            borderRadius: 6,
            padding: "2px 6px",
            fontSize: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            outline: "none",
          }}
          className="nodrag nopan"
          autoFocus
        />
      )}
    </EdgeLabelRenderer>
  );
}

export default function CustomDirectionalEdge(props) {
  const {
    id,
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    style, markerEnd,
    data = {}, label,
  } = props;

  const rf = useReactFlow();
  const isReverse = !!data?.__reversed;

  const [edgePath, defaultLabelX, defaultLabelY] = useMemo(() => {
    return offsetPathStep({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, isReverse });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, isReverse]);

  const effectiveText = (data?.label ?? label) ?? "";

  const labelPos = useMemo(() => {
    const lp = data?.labelPos;
    return {
      x: Number.isFinite(lp?.x) ? lp.x : defaultLabelX,
      y: Number.isFinite(lp?.y) ? lp.y : defaultLabelY,
    };
  }, [data?.labelPos, defaultLabelX, defaultLabelY]);

  const onDragMove = useCallback((next) => {
    rf.setEdges((eds) =>
      eds.map((e) =>
        e.id === id ? { ...e, data: { ...(e.data || {}), labelPos: next } } : e
      )
    );
  }, [rf, id]);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      <EditableDraggableLabel id={id} x={labelPos.x} y={labelPos.y} text={effectiveText} onDragMove={onDragMove} />
    </>
  );
}
