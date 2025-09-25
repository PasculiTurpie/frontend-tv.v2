import React, { useCallback, useEffect, useRef, useState, useContext } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
  MarkerType,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../../components/context/UserContext"; // Ajusta la ruta según tu estructura
import CustomNode from "./CustomNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";
import CustomWaypointEdge from "./CustomWaypointEdge";
import EquipoDetail from "../Equipment/EquipoDetail";
import EquipoIrd from "../Equipment/EquipoIrd";
import EquipoSatellite from "../Equipment/EquipoSatellite";

/* ─── tipos ─────────────────────────────────────────────────────────────── */
const nodeTypes = { custom: CustomNode };
const edgeTypes = { directional: CustomDirectionalEdge, waypoint: CustomWaypointEdge };

/* ─── utils ─────────────────────────────────────────────────────────────── */
const nn = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const toIdString = (raw) => (typeof raw === "string" ? raw : raw && raw._id ? raw._id : null);
const norm = (v) => (v || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const makeEdgeId = (e) => `${String(e.source)}:${e.sourceHandle || ""}->${String(e.target)}:${e.targetHandle || ""}`;

const normalizeHandle = (h) => {
  if (!h) return undefined;
  const rxIndexed = /^(in|out)-(top|bottom|left|right)-\d+$/;
  const rxSideOnly = /^(in|out)-(top|bottom|left|right)$/;
  if (rxIndexed.test(h)) return h;
  if (rxSideOnly.test(h)) return `${h}-1`;
  return undefined;
};

/* ─── enrutado por geometría + regla ida/vuelta determinística ──────────── */
const SIDE = { TOP: "top", RIGHT: "right", BOTTOM: "bottom", LEFT: "left" };

const pickSide = (sx, sy, tx, ty, bias = 12, minDelta = 8) => {
  const dx = tx - sx, dy = ty - sy;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (adx < minDelta && ady < minDelta) return SIDE.RIGHT;
  const a = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
  if (a > 90 - bias && a < 90 + bias) return dy < 0 ? SIDE.TOP : SIDE.BOTTOM;
  if (a < bias || a > 180 - bias) return dx < 0 ? SIDE.LEFT : SIDE.RIGHT;
  return ady > adx ? (dy < 0 ? SIDE.TOP : SIDE.BOTTOM) : (dx < 0 ? SIDE.LEFT : SIDE.RIGHT);
};

const buildHandle = (side, kind, idx = 1) => `${kind}-${side}-${idx}`;

const isBidirectionalPair = (arr, a, b) =>
  arr.some((x) => String(x.source) === String(a) && String(x.target) === String(b)) &&
  arr.some((x) => String(x.source) === String(b) && String(x.target) === String(a));

const isReturnEdge = (sourceId, targetId) => String(sourceId) > String(targetId);

/** Regla: si hay par bidireccional, ida = idx1 (source<target), vuelta = idx3 (source>target) */
const pickHandlesForNodes = (sNode, tNode, allEdges = []) => {
  const sx = sNode.position.x + (sNode.width ?? 0) / 2;
  const sy = sNode.position.y + (sNode.height ?? 0) / 2;
  const tx = tNode.position.x + (tNode.width ?? 0) / 2;
  const ty = tNode.position.y + (tNode.height ?? 0) / 2;

  const side = pickSide(sx, sy, tx, ty);
  const bidir = isBidirectionalPair(allEdges, sNode.id, tNode.id);
  const idx = bidir ? (isReturnEdge(sNode.id, tNode.id) ? 3 : 1) : 1;

  if (side === SIDE.TOP || side === SIDE.BOTTOM) {
    return {
      sourceHandle: buildHandle(side, "out", idx),
      targetHandle: buildHandle(side === SIDE.TOP ? SIDE.BOTTOM : SIDE.TOP, "in", idx),
    };
  }
  if (bidir && idx === 3) {
    return {
      sourceHandle: buildHandle(SIDE.RIGHT, "out", 3),
      targetHandle: buildHandle(SIDE.LEFT, "in", 3),
    };
  }
  return {
    sourceHandle: buildHandle(SIDE.LEFT, "out", 1),
    targetHandle: buildHandle(SIDE.RIGHT, "in", 1),
  };
};

const autoRouteEdge = (edge, nodesById, allEdges = []) => {
  const s = nodesById[edge.source], t = nodesById[edge.target];
  if (!s || !t) return edge;
  const { sourceHandle, targetHandle } = pickHandlesForNodes(s, t, allEdges);
  return { ...edge, sourceHandle, targetHandle, id: makeEdgeId({ ...edge, sourceHandle, targetHandle }) };
};

const indexNodes = (arr) => Object.fromEntries(arr.map((n) => [n.id, n]));
const sanitizeData = (d) =>
  Object.fromEntries(Object.entries(d || {}).filter(([k, v]) => typeof v !== "function" && !String(k).startsWith("__")));

/* ─── debounce ──────────────────────────────────────────────────────────── */
const useDebouncedSaver = (fn, delay = 600) => {
  const tRef = useRef(null);
  const save = useCallback((...args) => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
  useEffect(() => () => tRef.current && clearTimeout(tRef.current), []);
  return save;
};

/* ─── Colores deterministas para pares bidireccionales ──────────────────── */
const COLOR_OUT = "red";    // ida (source < target)
const COLOR_BACK = "green"; // vuelta (source > target)

/**
 * Marca ida/vuelta por par (dash + __reversed) y aplica color auto si corresponde.
 */
const recomputeReverseFlags = (eds) => {
  const groups = new Map();
  for (const e of eds) {
    const a = String(e.source);
    const b = String(e.target);
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }

  return eds.map((e) => {
    const a = String(e.source);
    const b = String(e.target);
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    const group = groups.get(key) || [];

    const bidir = group.length >= 2;
    const reversed = bidir && (a > b);

    const nextStyle = { ...(e.style || {}) };

    if (reversed) {
      nextStyle.strokeDasharray = nextStyle.strokeDasharray || "4 3";
    } else if (nextStyle.strokeDasharray) {
      delete nextStyle.strokeDasharray;
    }

    const wasAuto = !!e?.data?.__autoColor;
    const shouldAutoPaint = bidir && (wasAuto || !nextStyle.stroke);

    if (shouldAutoPaint) {
      nextStyle.stroke = reversed ? COLOR_BACK : COLOR_OUT;
    }

    return {
      ...e,
      style: nextStyle,
      data: {
        ...(e.data || {}),
        __reversed: reversed,
        __autoColor: shouldAutoPaint ? true : wasAuto,
      },
    };
  });
};

const ChannelDiagram = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuth } = useContext(UserContext); // Hook de autenticación

  const [signal, setSignal] = useState({});
  const [equipo, setEquipo] = useState(null);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [equipoError, setEquipoError] = useState(null);

  const [ird, setIrd] = useState(null);
  const [loadingIrd, setLoadingIrd] = useState(false);
  const [irdError, setIrdError] = useState(null);

  const [sat, setSat] = useState(null);
  const [loadingSat, setLoadingSat] = useState(false);
  const [satError, setSatError] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Estado para la edición de labels
  const [editingNode, setEditingNode] = useState(null);
  const [editingEdge, setEditingEdge] = useState(null);
  const [tempLabel, setTempLabel] = useState("");

  // Verificar si el usuario puede editar
  const canEdit = isAuth && user;

  /* ─── BRIDGE: aplica patches desde edges (label drag) ─────────────────── */
  useEffect(() => {
    const onEdgeDataChange = (ev) => {
      const { edgeId, dataPatch, edgePatch } = ev.detail || {};
      if (!edgeId) return;
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edgeId) return e;
          const next = { ...e };
          if (edgePatch) Object.assign(next, edgePatch);
          if (dataPatch) next.data = { ...(next.data || {}), ...dataPatch };
          return next;
        })
      );
    };
    window.addEventListener("edge-data-change", onEdgeDataChange);
    return () => window.removeEventListener("edge-data-change", onEdgeDataChange);
  }, [setEdges]);

  /* ─── carga inicial ───────────────────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    api.getChannelDiagramById(id).then((res) => {
      if (!mounted) return;
      const result = res.data || {};
      setSignal(result);

      const rawNodes = Array.isArray(result.nodes) ? result.nodes : [];
      let normalizedNodes = rawNodes.map((n, i) => {
        const baseData = n.data || {};
        const label = baseData.label ?? n.label ?? String(n.id ?? i + 1);
        const rawEquipoId = baseData.equipoId ?? n.equipoId ?? n.equipo ?? null;
        const embedEquipo = baseData.equipo ?? n.equipo ?? n.equipoObject ?? null;
        const equipoId = toIdString(rawEquipoId);

        return {
          id: String(n.id ?? i + 1),
          type: n.type || "custom",
          data: { ...baseData, label, ...(equipoId ? { equipoId } : {}), ...(embedEquipo ? { equipo: embedEquipo } : {}) },
          position: { x: nn(n?.position?.x), y: nn(n?.position?.y) },
        };
      });

      if (normalizedNodes.length && normalizedNodes.every((n) => n.position.x === 0 && n.position.y === 0)) {
        normalizedNodes = normalizedNodes.map((n, idx) => ({ ...n, position: { x: idx * 220, y: 100 } }));
      }

      const rawEdges = Array.isArray(result.edges) ? result.edges : [];
      const nodesIndex = indexNodes(normalizedNodes);

      const normalizedEdges = rawEdges
        .map((e) => {
          let sourceHandle = normalizeHandle(e.sourceHandle);
          let targetHandle = normalizeHandle(e.targetHandle);
          if (!sourceHandle || !targetHandle) {
            const r = pickHandlesForNodes(nodesIndex[String(e.source)], nodesIndex[String(e.target)], rawEdges);
            sourceHandle = sourceHandle || r.sourceHandle;
            targetHandle = targetHandle || r.targetHandle;
          }

          const waypoints = Array.isArray(e?.data?.waypoints) ? e.data.waypoints : [];
          const baseStyle = {
            stroke: e?.style?.stroke || "#000",
            strokeWidth: e?.style?.strokeWidth ?? 2,
            ...e?.style,
          };

          const finalType = waypoints.length ? "waypoint" : (e.type === "waypoint" ? "waypoint" : "directional");

          return {
            id: String(e.id ?? makeEdgeId({ ...e, sourceHandle, targetHandle })),
            source: String(e.source),
            target: String(e.target),
            sourceHandle,
            targetHandle,
            label: e.label || "",
            data: { ...(e.data || {}), waypoints, __autorouted: true },
            type: finalType,
            animated: e.animated ?? true,
            style: baseStyle,
            markerEnd: e.markerEnd || { type: MarkerType.ArrowClosed, color: baseStyle.stroke || "#000" },
            updatable: "both",
            interactionWidth: 24,
          };
        })
        .filter(
          (e) =>
            normalizedNodes.some((n) => n.id === e.source) &&
            normalizedNodes.some((n) => n.id === e.target)
        );

      setNodes(normalizedNodes);
      setEdges(recomputeReverseFlags(normalizedEdges));
    }).catch((err) => console.error("Error al cargar diagrama:", err));
    return () => { mounted = false; };
  }, [id, setNodes, setEdges]);

  /* ─── guardado ────────────────────────────────────────────────────────── */
  const doSave = useCallback(async (n, e) => {
    try {
      await api.updateChannelFlow(id, {
        nodes: n.map((node) => ({
          id: node.id,
          type: node.type || "custom",
          data: node.data || {},
          position: node.position || { x: 0, y: 0 },
          label: node.data?.label || node.label,
          equipo: node.data?.equipoId || node.equipo,
        })),
        edges: e.map((ed) => ({
          id: ed.id,
          source: ed.source,
          target: ed.target,
          sourceHandle: ed.sourceHandle,
          targetHandle: ed.targetHandle,
          label: ed.label,
          type: ed.type || "directional",
          style: ed.style,
          markerEnd: ed.markerEnd,
          data: sanitizeData(ed.data),
          animated: ed.animated ?? true,
        })),
      });
    } catch (err) {
      console.warn("No se pudo guardar el flujo:", err?.response?.data || err);
    }
  }, [id]);

  const requestSave = useDebouncedSaver(doSave, 600);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    requestSave(nodes, edges);
  }, [nodes, edges, requestSave]);

  /* ─── Funciones para editar labels (solo si está autenticado) ──────────── */
  const startEditingNodeLabel = useCallback((nodeId, currentLabel) => {
    if (!canEdit) return;
    setEditingNode(nodeId);
    setTempLabel(currentLabel || "");
  }, [canEdit]);

  const startEditingEdgeLabel = useCallback((edgeId, currentLabel) => {
    if (!canEdit) return;
    setEditingEdge(edgeId);
    setTempLabel(currentLabel || "");
  }, [canEdit]);

  const saveNodeLabel = useCallback(() => {
    if (!editingNode || !canEdit) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === editingNode) {
          return {
            ...node,
            data: { ...node.data, label: tempLabel }
          };
        }
        return node;
      })
    );
    setEditingNode(null);
    setTempLabel("");
  }, [editingNode, tempLabel, setNodes, canEdit]);

  const saveEdgeLabel = useCallback(() => {
    if (!editingEdge || !canEdit) return;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === editingEdge) {
          return { ...edge, label: tempLabel };
        }
        return edge;
      })
    );
    setEditingEdge(null);
    setTempLabel("");
  }, [editingEdge, tempLabel, setEdges, canEdit]);

  const cancelEditing = useCallback(() => {
    setEditingNode(null);
    setEditingEdge(null);
    setTempLabel("");
  }, []);

  /* ─── conectar (solo si está autenticado) ────────────────────────────── */
  const onConnect = useCallback((connection) => {
    if (!canEdit) return;
    setEdges((eds) => {
      const nodesIdx = indexNodes(nodes);
      const sNode = nodesIdx[String(connection.source)];
      const tNode = nodesIdx[String(connection.target)];
      const routed = sNode && tNode ? pickHandlesForNodes(sNode, tNode, eds) : {};

      const newEdge = {
        ...connection,
        ...routed,
        id: makeEdgeId({ ...connection, ...routed }),
        type: "directional",
        animated: true,
        style: { stroke: "#000", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
        data: { label: `${connection.source}→${connection.target}`, waypoints: [], __autorouted: true },
        label: "",
        updatable: "both",
        interactionWidth: 24,
      };

      return recomputeReverseFlags(addEdge(newEdge, eds));
    });
  }, [nodes, setEdges, canEdit]);

  /* ─── actualizar edge (solo si está autenticado) ──────────────────────── */
  const onEdgeUpdate = useCallback((oldEdge, connection) => {
    if (!canEdit) return;
    setEdges((eds) => {
      const idx = eds.findIndex((e) => e.id === oldEdge.id);
      if (idx === -1) return eds;

      const nodesIdx = indexNodes(nodes);
      const sNode = nodesIdx[String(connection.source)];
      const tNode = nodesIdx[String(connection.target)];
      if (!sNode || !tNode) return eds;

      const routed = pickHandlesForNodes(sNode, tNode, eds);
      const keepWaypoints =
        oldEdge.type === "waypoint" &&
        Array.isArray(oldEdge?.data?.waypoints) &&
        oldEdge.data.waypoints.length > 0;

      const nextType = keepWaypoints ? "waypoint" : (oldEdge.type || "directional");
      const nextId = makeEdgeId({
        ...oldEdge,
        source: connection.source,
        target: connection.target,
        ...routed,
      });

      const updatedEdge = {
        ...oldEdge,
        id: nextId,
        source: connection.source,
        target: connection.target,
        ...routed,
        type: nextType,
        animated: oldEdge.animated ?? true,
        style: oldEdge.style || { stroke: "#000", strokeWidth: 2 },
        markerEnd: oldEdge.markerEnd || { type: MarkerType.ArrowClosed, color: "#000" },
        data: { ...(oldEdge.data || {}), __autorouted: true },
        updatable: "both",
        interactionWidth: oldEdge.interactionWidth ?? 24,
      };

      const next = [...eds];
      next[idx] = updatedEdge;
      return recomputeReverseFlags(next);
    });
  }, [nodes, setEdges, canEdit]);

  /* ─── mover nodos: re‐enrutar edges (solo si está autenticado) ────────── */
  const handleNodesChange = useCallback((changes) => {
    // Permitir solo cambios de posición si no está autenticado
    if (!canEdit) {
      const onlyPositionChanges = changes.filter(c => c.type === 'position');
      if (onlyPositionChanges.length === 0) return;
      onNodesChange(onlyPositionChanges);
      return;
    }

    onNodesChange(changes);
    if (!changes.some((c) => c.type === "position")) return;

    setEdges((eds) => {
      const nodesIdx = indexNodes(nodes);

      let next = eds.map((e) => {
        if (e.type === "waypoint" && Array.isArray(e?.data?.waypoints) && e.data.waypoints.length) return e;
        return autoRouteEdge(e, nodesIdx, eds);
      });

      next = next.map((e) => {
        if (e?.data?.labelPinned) return e;
        if (e?.data?.labelPos === undefined) return e;
        const { labelPos, ...rest } = e.data || {};
        return { ...e, data: rest };
      });

      next = recomputeReverseFlags(next);
      return next;
    });
  }, [nodes, onNodesChange, setEdges, canEdit]);

  /* ─── persistir tras soltar un nodo (solo si está autenticado) ────────── */
  const onNodeDragStop = useCallback(() => {
    if (!canEdit) return;
    requestSave(nodes, edges);
  }, [nodes, edges, requestSave, canEdit]);

  /* ─── detalle equipo ─────────────────────────────────────────────────── */
  const fetchEquipo = useCallback(async (equipoId) => {
    const idStr = toIdString(equipoId);
    if (!idStr) { setEquipo(null); setEquipoError("Nodo sin equipo asociado"); return; }
    try {
      setLoadingEquipo(true);
      setEquipoError(null);
      setEquipo(null);
      setIrd(null); setIrdError(null); setLoadingIrd(false);
      setSat(null); setSatError(null); setLoadingSat(false);
      const res = await api.getIdEquipo(encodeURIComponent(idStr));
      setEquipo(res?.data || null);
    } catch (err) {
      setEquipo(null);
      setEquipoError(err?.response?.data?.message || err.message || "Error al cargar equipo");
    } finally { setLoadingEquipo(false); }
  }, []);

  const handleNodeClick = useCallback((evt, node) => {
    const equipoObj = node?.data?.equipo ?? node?.equipo ?? null;
    if (equipoObj && typeof equipoObj === "object") {
      setIrd(null); setIrdError(null); setLoadingIrd(false);
      setSat(null); setSatError(null); setLoadingSat(false);
      setEquipo({ ...equipoObj });
      return;
    }
    const raw = node?.data?.equipoId ?? node?.data?.equipo?._id ?? node?.equipo ?? null;
    fetchEquipo(toIdString(raw));
  }, [fetchEquipo]);

  // Manejar doble click en nodos para editar label (solo si está autenticado)
  const handleNodeDoubleClick = useCallback((evt, node) => {
    if (!canEdit) return;
    evt.stopPropagation();
    startEditingNodeLabel(node.id, node.data?.label || "");
  }, [startEditingNodeLabel, canEdit]);

  // Manejar doble click en edges para editar label (solo si está autenticado)
  const handleEdgeDoubleClick = useCallback((evt, edge) => {
    if (!canEdit) return;
    evt.stopPropagation();
    startEditingEdgeLabel(edge.id, edge.label || "");
  }, [startEditingEdgeLabel, canEdit]);

  /* ─── auto-carga IRD / SAT ───────────────────────────────────────────── */
  useEffect(() => {
    const tipo = norm(typeof equipo?.tipoNombre === "object" ? equipo?.tipoNombre?.tipoNombre : equipo?.tipoNombre);
    if (!equipo || tipo !== "ird") { setIrd(null); setIrdError(null); setLoadingIrd(false); return; }
    if (equipo?.irdRef && typeof equipo.irdRef === "object") { setIrd(equipo.irdRef); setIrdError(null); setLoadingIrd(false); return; }
    const irdId = typeof equipo?.irdRef === "string" ? equipo.irdRef : toIdString(equipo?.irdRef);
    if (!irdId) { setIrd(null); setIrdError("Equipo IRD sin irdRef"); setLoadingIrd(false); return; }
    (async () => {
      try {
        setLoadingIrd(true); setIrdError(null); setIrd(null);
        const res = await api.getIdIrd(encodeURIComponent(irdId)); setIrd(res?.data || null);
      } catch (err) { setIrd(null); setIrdError(err?.response?.data?.message || err.message || "Error al cargar IRD"); }
      finally { setLoadingIrd(false); }
    })();
  }, [equipo]);

  useEffect(() => {
    const tipo = norm(typeof equipo?.tipoNombre === "object" ? equipo?.tipoNombre?.tipoNombre : equipo?.tipoNombre);
    if (!equipo || (tipo !== "satelite" && tipo !== "satellite")) { setSat(null); setSatError(null); setLoadingSat(false); return; }
    if (equipo?.satelliteRef && typeof equipo.satelliteRef === "object") { setSat(equipo.satelliteRef); setSatError(null); setLoadingSat(false); return; }
    const satId = typeof equipo?.satelliteRef === "string" ? equipo.satelliteRef : toIdString(equipo?.satelliteRef);
    if (!satId) { setSat(null); setSatError("Equipo satélite sin satelliteRef"); setLoadingSat(false); return; }
    (async () => {
      try {
        setLoadingSat(true); setSatError(null); setSat(null);
        const res = await api.getSatelliteId(encodeURIComponent(satId)); setSat(res?.data || null);
      } catch (err) { setSat(null); setSatError(err?.response?.data?.message || err.message || "Error al cargar Satélite"); }
      finally { setLoadingSat(false); }
    })();
  }, [equipo]);

  /* ─── render ──────────────────────────────────────────────────────────── */
  return (
    <div className="outlet-main" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: 16, width: "100%", minHeight: "70vh" }}>
      <div style={{ minWidth: 0, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header con título + botón Volver + instrucciones */}
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {signal?.signal?.nameChannel || "Diagrama de Canal"}{" "}
              {signal?.signal?.tipoTecnologia && `(${String(signal.signal.tipoTecnologia).toUpperCase()})`}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontStyle: "italic" }}>
              {canEdit
                ? "Doble clic en nodos o conexiones para editar etiquetas"
                : "Inicia sesión para editar el diagrama"
              }
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Volver a la página anterior"
            style={{
              marginLeft: "auto",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #1e3a8a",
              background: "#1e3a8a",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              transition: "background 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#1d4ed8";
              e.currentTarget.style.borderColor = "#1d4ed8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#1e3a8a";
              e.currentTarget.style.borderColor = "#1e3a8a";
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.35)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)";
            }}
          >
            ← Volver
          </button>
        </div>

        <div style={{ width: "100%", height: "72vh", position: "relative" }}>
          {nodes.length === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", zIndex: 1 }}>
              No hay nodos para mostrar.
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={canEdit ? onConnect : undefined}
            onReconnect={canEdit ? onEdgeUpdate : undefined}
            onNodeDragStop={canEdit ? onNodeDragStop : undefined}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={canEdit ? handleNodeDoubleClick : undefined}
            onEdgeDoubleClick={canEdit ? handleEdgeDoubleClick : undefined}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ width: "100%", height: "100%", background: "#DCDCDC" }}
            proOptions={{ hideAttribution: true }}
            connectionMode={ConnectionMode.Loose}
            nodesDraggable={canEdit}
            nodesConnectable={canEdit}
            elementsSelectable={true}
            defaultEdgeOptions={{
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
              style: { stroke: "#000", strokeWidth: 2 },
              updatable: canEdit ? "both" : false,
              interactionWidth: 24,
            }}
          >
            <Controls />
            <Background variant="dots" gap={18} />
          </ReactFlow>

          {/* Indicador de solo lectura para usuarios no autenticados */}
          {!canEdit && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(255, 193, 7, 0.9)",
                color: "#856404",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🔒 Modo solo lectura
            </div>
          )}

          {/* Modal de edición de labels (solo si está autenticado) */}
          {canEdit && (editingNode || editingEdge) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              onClick={cancelEditing}
            >
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  minWidth: "300px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.125rem", fontWeight: 600 }}>
                  {editingNode ? "Editar etiqueta del nodo" : "Editar etiqueta de la conexión"}
                </h3>

                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      editingNode ? saveNodeLabel() : saveEdgeLabel();
                    } else if (e.key === "Escape") {
                      cancelEditing();
                    }
                  }}
                  placeholder="Ingresa la nueva etiqueta..."
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    marginBottom: "16px",
                  }}
                />

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    onClick={cancelEditing}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #d1d5db",
                      background: "#f9fafb",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingNode ? saveNodeLabel : saveEdgeLabel}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #1e3a8a",
                      background: "#1e3a8a",
                      color: "white",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* panel lateral */}
      <div style={{ minWidth: 0, border: "1px solid #ddd", borderRadius: 8, padding: 12, overflowY: "auto", height: "72vh" }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Detalle</h2>
        {(() => {
          const tipo = norm(typeof equipo?.tipoNombre === "object" ? equipo?.tipoNombre?.tipoNombre : equipo?.tipoNombre);
          const isIrd = tipo === "ird";
          const hasIrdRef = (typeof equipo?.irdRef === "object" && equipo?.irdRef?._id) || typeof equipo?.irdRef === "string";
          const isSat = tipo === "satelite" || tipo === "satellite";
          const hasSatRef = (typeof equipo?.satelliteRef === "object" && equipo?.satelliteRef?._id) || typeof equipo?.satelliteRef === "string";

          if (isSat && hasSatRef) return <EquipoSatellite title="Detalle Satélite" satellite={sat} loading={loadingSat || loadingEquipo} error={satError || equipoError} />;
          if (isIrd && hasIrdRef) return <EquipoIrd title="Detalle IRD" ird={ird} loading={loadingIrd || loadingEquipo} error={irdError || equipoError} />;
          return <EquipoDetail title="Detalle de Equipo" equipo={equipo} loading={loadingEquipo} error={equipoError} />;
        })()}
      </div>
    </div>
  );
};

export default ChannelDiagram;