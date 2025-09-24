// src/pages/ChannelDiagram/CustomWaypointEdge.jsx
import React, { useCallback, useMemo, useRef } from "react";
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from "@xyflow/react";

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

export default function CustomWaypointEdge(props) {
  const { id, sourceX, sourceY, targetX, targetY, style, markerEnd, data = {}, label } = props;

  const rf = useReactFlow();
  const dragLabelRef = useRef({ dragging: false, startPane: { x: 0, y: 0 }, startOffset: { x: 0, y: 0 } });

  const points = useMemo(() => {
    const wp = Array.isArray(data.waypoints) ? data.waypoints : [];
    return [{ x: sourceX, y: sourceY }, ...wp, { x: targetX, y: targetY }];
  }, [sourceX, sourceY, targetX, targetY, data.waypoints]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    const [start, ...rest] = points;
    const segs = rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
    return `M ${start.x} ${start.y} ${segs}`;
  }, [points]);

  // punto medio para default label
  const defaultLabelPos = useMemo(() => {
    let total = 0;
    for (let i = 1; i < points.length; i++) total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    let half = total / 2;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (half > seg) { half -= seg; continue; }
      const t = seg === 0 ? 0 : half / seg;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    const last = points[points.length - 1];
    return { x: last.x, y: last.y };
  }, [points]);

  const labelPos = useMemo(() => {
    const lp = data?.labelPos;
    return { x: Number.isFinite(lp?.x) ? lp.x : defaultLabelPos.x, y: Number.isFinite(lp?.y) ? lp.y : defaultLabelPos.y };
  }, [data?.labelPos, defaultLabelPos]);

  // mover waypoint (solo drag; creación/borrado por gestos está desactivado)
  const onPointerDownPoint = useCallback(
    (idx) => (e) => {
      e.stopPropagation();
      const move = (ev) => {
        const clientX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
        const clientY = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
        const pane = rf.project({ x: clientX, y: clientY });
        const curr = Array.isArray(data.waypoints) ? data.waypoints : [];
        if (idx < 0 || idx >= curr.length) return;
        const next = curr.map((p, i) => (i === idx ? { x: pane.x, y: pane.y } : p));
        window.dispatchEvent(new CustomEvent("edge-data-change", { detail: { edgeId: id, dataPatch: { waypoints: next } } }));
      };
      const up = () => {
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
    [id, data.waypoints, rf]
  );

  const onPointerDownLabel = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      const startClient = { x: "touches" in e ? e.touches[0].clientX : e.clientX, y: "touches" in e ? e.touches[0].clientY : e.clientY };
      const startPane = rf.project(startClient);

      dragLabelRef.current.dragging = true;
      dragLabelRef.current.startPane = startPane;
      dragLabelRef.current.startOffset = { x: (data?.labelPos?.x ?? labelPos.x) - startPane.x, y: (data?.labelPos?.y ?? labelPos.y) - startPane.y };

      const onMove = (ev) => {
        if (!dragLabelRef.current.dragging) return;
        const currClient = { x: "touches" in ev ? ev.touches[0].clientX : ev.clientX, y: "touches" in ev ? ev.touches[0].clientY : ev.clientY };
        const currPane = rf.project(currClient);
        const next = { x: currPane.x + dragLabelRef.current.startOffset.x, y: currPane.y + dragLabelRef.current.startOffset.y };
        window.dispatchEvent(new CustomEvent("edge-data-change", { detail: { edgeId: id, dataPatch: { labelPos: next, labelPinned: true } } }));
      };

      const onUp = () => {
        dragLabelRef.current.dragging = false;
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
    [id, data, labelPos, rf]
  );

  return (
    <>
      <BaseEdge id={id} path={pathD} style={style} markerEnd={markerEnd} />

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
            style={{ cursor: "grab" }}
            title="Arrastra para mover"
          />
        ))}

      {(label || data?.label) && (
        <DraggableLabel x={labelPos.x} y={labelPos.y} onPointerDown={onPointerDownLabel}>
          {label || data?.label}
        </DraggableLabel>
      )}
    </>
  );
}
