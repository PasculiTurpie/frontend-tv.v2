import React, { useCallback, useContext, useMemo } from "react";
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from "@xyflow/react";
import { UserContext } from "../../components/context/UserContext"; // ⬅️ ruta real

export default function CustomWaypointEdge(props) {
  const { id, sourceX, sourceY, targetX, targetY, style, markerEnd, data = {}, label } = props;
  const rf = useReactFlow();
  const { isAuth } = useContext(UserContext);

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

  const text = (data?.label ?? label) ?? "";

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

  const onDragMove = useCallback((next) => {
    if (!isAuth) return;
    rf.setEdges((eds) =>
      eds.map((e) =>
        e.id === id ? { ...e, data: { ...(e.data || {}), labelPos: next } } : e
      )
    );
  }, [rf, id, isAuth]);

  const startEdit = useCallback((e) => {
    if (!isAuth) return;
    e.stopPropagation(); e.preventDefault();
    const v = window.prompt("Editar etiqueta", String(text));
    if (v !== null) {
      rf.setEdges((eds) =>
        eds.map((e) =>
          e.id === id ? { ...e, label: v, data: { ...(e.data || {}), label: v } } : e
        )
      );
      window.dispatchEvent(new Event("flow:save"));
    }
  }, [rf, id, text, isAuth]);

  const onPointerDown = useCallback((e) => {
    if (!isAuth) return;
    e.stopPropagation(); e.preventDefault();

    const startClient = { x: "touches" in e ? e.touches[0].clientX : e.clientX, y: "touches" in e ? e.touches[0].clientY : e.clientY };
    const startPane = rf.project(startClient);
    const startOffset = { x: (labelPos.x ?? startPane.x) - startPane.x, y: (labelPos.y ?? startPane.y) - startPane.y };

    const onMove = (ev) => {
      const currClient = { x: "touches" in ev ? ev.touches[0].clientX : ev.clientX, y: "touches" in ev ? ev.touches[0].clientY : ev.clientY };
      const currPane = rf.project(currClient);
      const next = { x: currPane.x + startOffset.x, y: currPane.y + startOffset.y };
      onDragMove(next);
    };

    const onUp = () => {
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
  }, [rf, labelPos, onDragMove, isAuth]);

  return (
    <>
      <BaseEdge id={id} path={pathD} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          onMouseDown={onPointerDown}
          onDoubleClick={startEdit}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelPos.x}px, ${labelPos.y}px)`,
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
          {text}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
