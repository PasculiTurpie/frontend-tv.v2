// src/pages/ChannelDiagram/ChannelDiagram.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
  MarkerType,
  ConnectionMode,
  updateEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import api from "../../utils/api";
import { useParams } from "react-router-dom";
import CustomNode from "./CustomNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";
import CustomWaypointEdge from "./CustomWaypointEdge";
import EquipoDetail from "../Equipment/EquipoDetail";
import EquipoIrd from "../Equipment/EquipoIrd";
import EquipoSatellite from "../Equipment/EquipoSatellite";

/* ─────────────────────────────
 * Tipos de nodos y edges
 * ───────────────────────────── */
const nodeTypes = { custom: CustomNode };
const edgeTypes = {
  directional: CustomDirectionalEdge,
  waypoint: CustomWaypointEdge,
};

/* ─────────────────────────────
 * Utils
 * ───────────────────────────── */
const nn = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const toIdString = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") return raw._id || null;
  return null;
};
const norm = (v) =>
  (v || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** ID determinista para edges, evita colisiones */
const makeEdgeId = (e) =>
  `${String(e.source)}:${e.sourceHandle || ""}->${String(e.target)}:${e.targetHandle || ""}`;

/** Mapea "in-left" -> "in-left-1", "out-right" -> "out-right-1" si no traen índice */
const normalizeHandle = (h) => {
  if (!h) return undefined;
  const rxIndexed = /^(in|out)-(top|bottom|left|right)-\d+$/;
  const rxSideOnly = /^(in|out)-(top|bottom|left|right)$/;
  if (rxIndexed.test(h)) return h;
  if (rxSideOnly.test(h)) return `${h}-1`;
  return undefined;
};

/** ¿Existe la arista inversa B->A para A->B en un array crudo? */
const hasReverseIn = (rawEdges, a, b) =>
  rawEdges.some((x) => String(x.source) === String(b) && String(x.target) === String(a));

/* ─────────────────────────────
 * Enrutado automático por geometría
 * ───────────────────────────── */
const SIDE = { TOP: "top", RIGHT: "right", BOTTOM: "bottom", LEFT: "left" };

// Devuelve "top" | "right" | "bottom" | "left" según la posición relativa
const pickSide = (sx, sy, tx, ty, angleBiasDeg = 12, minDelta = 8) => {
  const dx = tx - sx;
  const dy = ty - sy;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  if (adx < minDelta && ady < minDelta) return SIDE.RIGHT;

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
  const a = Math.abs(angle);

  if (a > 90 - angleBiasDeg && a < 90 + angleBiasDeg) return dy < 0 ? SIDE.TOP : SIDE.BOTTOM;
  if (a < angleBiasDeg || a > 180 - angleBiasDeg) return dx < 0 ? SIDE.LEFT : SIDE.RIGHT;

  if (ady > adx) return dy < 0 ? SIDE.TOP : SIDE.BOTTOM;
  return dx < 0 ? SIDE.LEFT : SIDE.RIGHT;
};

const buildHandlesForSide = (side, kind /* 'in' | 'out' */) => `${kind}-${side}-1`;

const pickHandlesForNodes = (sourceNode, targetNode) => {
  const sx = sourceNode.position.x + (sourceNode.width ?? 0) / 2;
  const sy = sourceNode.position.y + (sourceNode.height ?? 0) / 2;
  const tx = targetNode.position.x + (targetNode.width ?? 0) / 2;
  const ty = targetNode.position.y + (targetNode.height ?? 0) / 2;

  const side = pickSide(sx, sy, tx, ty);
  const opposite = {
    [SIDE.TOP]: SIDE.BOTTOM,
    [SIDE.BOTTOM]: SIDE.TOP,
    [SIDE.LEFT]: SIDE.RIGHT,
    [SIDE.RIGHT]: SIDE.LEFT,
  }[side];

  return {
    sourceHandle: buildHandlesForSide(side, "out"),
    targetHandle: buildHandlesForSide(opposite, "in"),
  };
};

const autoRouteEdge = (edge, nodesById) => {
  const s = nodesById[edge.source];
  const t = nodesById[edge.target];
  if (!s || !t) return edge;
  const { sourceHandle, targetHandle } = pickHandlesForNodes(s, t);
  return {
    ...edge,
    sourceHandle,
    targetHandle,
    id: makeEdgeId({ ...edge, sourceHandle, targetHandle }),
  };
};

/* Índice id->node */
const indexNodes = (nodesArr) => {
  const map = {};
  for (const n of nodesArr) map[n.id] = n;
  return map;
};

/* ─────────────────────────────
 * Debounce guardado
 * ───────────────────────────── */
const useDebouncedSaver = (fn, delay = 600) => {
  const tRef = useRef(null);
  const save = useCallback(
    (...args) => {
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
  useEffect(() => () => tRef.current && clearTimeout(tRef.current), []);
  return save;
};

const ChannelDiagram = () => {
  const { id } = useParams();

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

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  /* ─────────────────────────────
   * Carga
   * ───────────────────────────── */
  useEffect(() => {
    let mounted = true;

    api
      .getChannelDiagramById(id)
      .then((res) => {
        if (!mounted) return;
        const result = res.data || {};
        setSignal(result);

        // Nodos
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
            data: {
              ...baseData,
              label,
              ...(equipoId ? { equipoId } : {}),
              ...(embedEquipo ? { equipo: embedEquipo } : {}),
            },
            position: { x: nn(n?.position?.x), y: nn(n?.position?.y) },
          };
        });

        // Distribuye si todos están en (0,0)
        if (
          normalizedNodes.length &&
          normalizedNodes.every((n) => n.position.x === 0 && n.position.y === 0)
        ) {
          normalizedNodes = normalizedNodes.map((n, idx) => ({
            ...n,
            position: { x: idx * 220, y: 100 },
          }));
        }

        // Edges (autoroute + dash si hay inversa)
        const rawEdges = Array.isArray(result.edges) ? result.edges : [];
        const nodesIndex = indexNodes(normalizedNodes);

        const normalizedEdges = rawEdges
          .map((e) => {
            const reversed = hasReverseIn(rawEdges, e.source, e.target);

            // si no vienen handles, calcular por posiciones
            let sourceHandle = normalizeHandle(e.sourceHandle);
            let targetHandle = normalizeHandle(e.targetHandle);
            if (!sourceHandle || !targetHandle) {
              const routed = pickHandlesForNodes(
                nodesIndex[String(e.source)],
                nodesIndex[String(e.target)]
              );
              sourceHandle = sourceHandle || routed.sourceHandle;
              targetHandle = targetHandle || routed.targetHandle;
            }

            const baseStyle = {
              stroke: e?.style?.stroke || "#000",
              strokeWidth: e?.style?.strokeWidth ?? 2,
              ...(reversed ? { strokeDasharray: "4 3" } : {}),
              ...e?.style,
            };

            // Si viene type "waypoint" respetamos data.waypoints; si no, lo dejamos vacío
            const waypoints =
              Array.isArray(e?.data?.waypoints) && e.type === "waypoint" ? e.data.waypoints : [];

            return {
              id: String(e.id ?? makeEdgeId({ ...e, sourceHandle, targetHandle })),
              source: String(e.source),
              target: String(e.target),
              sourceHandle,
              targetHandle,
              label: e.label,
              data: { ...(e.data || {}), waypoints, __reversed: reversed, __autorouted: true },
              type: e.type === "waypoint" ? "waypoint" : "directional",
              animated: e.animated ?? true,
              style: baseStyle,
              markerEnd:
                e.markerEnd || {
                  type: MarkerType.ArrowClosed,
                  color: baseStyle.stroke || "#000",
                },
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
        setEdges(normalizedEdges);
      })
      .catch((err) => {
        console.error("Error al cargar diagrama:", err);
      });

    return () => {
      mounted = false;
    };
  }, [id, setNodes, setEdges]);

  /* ─────────────────────────────
   * Guardado (debounced)
   * ───────────────────────────── */
  const doSave = useCallback(
    async (n, e) => {
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
            data: ed.data || {}, // incluye labelPos y waypoints
            animated: ed.animated ?? true,
          })),
        });
      } catch (err) {
        console.warn("No se pudo guardar el flujo:", err?.response?.data || err);
      }
    },
    [id]
  );

  const requestSave = useDebouncedSaver(doSave, 600);

  // Dispara guardado en cambios (excepto primera carga)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    requestSave(nodes, edges);
  }, [nodes, edges, requestSave]);

  /* ─────────────────────────────
   * onConnect (nuevas aristas) con auto handles
   * ───────────────────────────── */
  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        const nodesIdx = indexNodes(nodes);
        const sNode = nodesIdx[String(connection.source)];
        const tNode = nodesIdx[String(connection.target)];
        const routed = sNode && tNode ? pickHandlesForNodes(sNode, tNode) : {};

        const reverseExists = eds.some(
          (x) =>
            String(x.source) === String(connection.target) &&
            String(x.target) === String(connection.source)
        );

        const newEdge = {
          ...connection,
          ...routed,
          id: makeEdgeId({ ...connection, ...routed }),
          type: "directional",
          animated: true,
          style: {
            stroke: "#000",
            strokeWidth: 2,
            ...(reverseExists ? { strokeDasharray: "4 3" } : {}),
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
          data: {
            label: `${connection.source}→${connection.target}`,
            waypoints: [],
            __reversed: reverseExists,
            __autorouted: true,
          },
          updatable: "both",
          interactionWidth: 24,
        };

        return addEdge(newEdge, eds);
      });
    },
    [nodes, setEdges]
  );

  /* ─────────────────────────────
   * onEdgeUpdate: mover enlaces + autorute
   * ───────────────────────────── */
  const onEdgeUpdate = useCallback(
    (oldEdge, connection) => {
      setEdges((eds) => {
        const nodesIdx = indexNodes(nodes);

        const baseConn = {
          ...connection,
          sourceHandle: normalizeHandle(connection.sourceHandle),
          targetHandle: normalizeHandle(connection.targetHandle),
        };

        let nextConn = { ...baseConn };
        const sNode = nodesIdx[String(baseConn.source)];
        const tNode = nodesIdx[String(baseConn.target)];
        if ((!baseConn.sourceHandle || !baseConn.targetHandle) && sNode && tNode) {
          nextConn = { ...baseConn, ...pickHandlesForNodes(sNode, tNode) };
        }

        const nextId = makeEdgeId({ ...oldEdge, ...nextConn });

        const updated = updateEdge(
          oldEdge,
          {
            ...nextConn,
            id: nextId,
            type: oldEdge.type || "directional",
            animated: oldEdge.animated ?? true,
            style: oldEdge.style || { stroke: "#000", strokeWidth: 2 },
            markerEnd: oldEdge.markerEnd || { type: MarkerType.ArrowClosed, color: "#000" },
            data: { ...(oldEdge.data || {}), __autorouted: true },
            updatable: "both",
            interactionWidth: oldEdge.interactionWidth ?? 24,
          },
          eds
        );

        return updated;
      });
    },
    [nodes, setEdges]
  );

  const onEdgeUpdateStart = useCallback(() => {}, []);
  const onEdgeUpdateEnd = useCallback(() => {}, []);

  /* ─────────────────────────────
   * onNodesChange con autoroute al soltar
   * ───────────────────────────── */
  const handleNodesChange = useCallback(
    (changes) => {
      // 1) Aplica cambios base
      onNodesChange(changes);

      // 2) Detecta fin de drag
      const movedIds = new Set(
        changes
          .filter((c) => c.type === "position" && c.dragging === false && c.id)
          .map((c) => c.id)
      );
      if (movedIds.size === 0) return;

      // 3) Reautorutear edges conectadas (respetando waypoints si las hay)
      setEdges((eds) => {
        const nodesIdx = indexNodes(nodes);
        let changed = false;

        const next = eds.map((e) => {
          if (!movedIds.has(e.source) && !movedIds.has(e.target)) return e;
          if (e.type === "waypoint" && Array.isArray(e?.data?.waypoints) && e.data.waypoints.length) {
            // Mantén waypoints si existen
            return e;
          }
          const updated = autoRouteEdge(e, nodesIdx);
          if (
            updated.sourceHandle !== e.sourceHandle ||
            updated.targetHandle !== e.targetHandle ||
            updated.id !== e.id
          ) {
            changed = true;
            return updated;
          }
          return e;
        });

        return changed ? next : eds;
      });
    },
    [nodes, onNodesChange, setEdges]
  );

  /* ─────────────────────────────
   * Click nodo → panel detalle
   * ───────────────────────────── */
  const fetchEquipo = useCallback(async (equipoId) => {
    const idStr = toIdString(equipoId);
    if (!idStr) {
      setEquipo(null);
      setEquipoError("Nodo sin equipo asociado");
      return;
    }
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
      setEquipoError(
        err?.response?.data?.message || err.message || "Error al cargar equipo"
      );
    } finally {
      setLoadingEquipo(false);
    }
  }, []);

  const handleNodeClick = useCallback(
    (evt, node) => {
      const equipoObj = node?.data?.equipo ?? node?.equipo ?? null;

      if (equipoObj && typeof equipoObj === "object") {
        setIrd(null); setIrdError(null); setLoadingIrd(false);
        setSat(null); setSatError(null); setLoadingSat(false);
        setEquipo({ ...equipoObj });
        return;
      }

      const raw =
        node?.data?.equipoId ??
        node?.data?.equipo?._id ??
        node?.equipo ?? null;

      const idStr = toIdString(raw);
      fetchEquipo(idStr);
    },
    [fetchEquipo]
  );

  /* ─────────────────────────────
   * Auto-carga IRD / SAT
   * ───────────────────────────── */
  useEffect(() => {
    const tipo = norm(
      typeof equipo?.tipoNombre === "object" ? equipo?.tipoNombre?.tipoNombre : equipo?.tipoNombre
    );
    if (!equipo || tipo !== "ird") {
      setIrd(null); setIrdError(null); setLoadingIrd(false);
      return;
    }
    if (equipo?.irdRef && typeof equipo.irdRef === "object") {
      setIrd(equipo.irdRef); setIrdError(null); setLoadingIrd(false);
      return;
    }
    const irdId =
      typeof equipo?.irdRef === "string" ? equipo.irdRef : toIdString(equipo?.irdRef);
    if (!irdId) {
      setIrd(null); setIrdError("Equipo IRD sin irdRef"); setLoadingIrd(false);
      return;
    }
    (async () => {
      try {
        setLoadingIrd(true);
        setIrdError(null);
        setIrd(null);
        const res = await api.getIdIrd(encodeURIComponent(irdId));
        setIrd(res?.data || null);
      } catch (err) {
        setIrd(null);
        setIrdError(err?.response?.data?.message || err.message || "Error al cargar IRD");
      } finally {
        setLoadingIrd(false);
      }
    })();
  }, [equipo]);

  useEffect(() => {
    const tipo = norm(
      typeof equipo?.tipoNombre === "object" ? equipo?.tipoNombre?.tipoNombre : equipo?.tipoNombre
    );
    if (!equipo || (tipo !== "satelite" && tipo !== "satellite")) {
      setSat(null); setSatError(null); setLoadingSat(false);
      return;
    }
    if (equipo?.satelliteRef && typeof equipo.satelliteRef === "object") {
      setSat(equipo.satelliteRef); setSatError(null); setLoadingSat(false);
      return;
    }
    const satId =
      typeof equipo?.satelliteRef === "string"
        ? equipo.satelliteRef
        : toIdString(equipo?.satelliteRef);
    if (!satId) {
      setSat(null); setSatError("Equipo satélite sin satelliteRef"); setLoadingSat(false);
      return;
    }
    (async () => {
      try {
        setLoadingSat(true);
        setSatError(null);
        setSat(null);
        const res = await api.getSatelliteId(encodeURIComponent(satId));
        setSat(res?.data || null);
      } catch (err) {
        setSat(null);
        setSatError(err?.response?.data?.message || err.message || "Error al cargar Satélite");
      } finally {
        setLoadingSat(false);
      }
    })();
  }, [equipo]);

  /* ─────────────────────────────
   * Render
   * ───────────────────────────── */
  return (
    <div
      className="outlet-main"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 380px",
        gap: 16,
        width: "100%",
        minHeight: "70vh",
      }}
    >
      {/* DIAGRAMA */}
      <div
        style={{
          minWidth: 0,
          border: "1px solid #ddd",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid #eee",
            fontWeight: 600,
          }}
        >
          {signal?.signal?.nameChannel || "Diagrama de Canal"}{" "}
          {signal?.signal?.tipoTecnologia &&
            `(${String(signal.signal.tipoTecnologia).toUpperCase()})`}
        </div>

        <div style={{ width: "100%", height: "72vh", position: "relative" }}>
          {nodes.length === 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                zIndex: 1,
              }}
            >
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
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={() => {}}
            onEdgeUpdateEnd={() => {}}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ width: "100%", height: "100%", background: "#DCDCDC" }}
            proOptions={{ hideAttribution: true }}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
              style: { stroke: "#000", strokeWidth: 2 },
              updatable: "both",
              interactionWidth: 24,
            }}
          >
            <Controls />
            <Background variant="dots" gap={18} />
          </ReactFlow>
        </div>
      </div>

      {/* DETALLE */}
      <div
        style={{
          minWidth: 0,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          overflowY: "auto",
          height: "72vh",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Detalle</h2>

        {(() => {
          const tipo = norm(
            typeof equipo?.tipoNombre === "object"
              ? equipo?.tipoNombre?.tipoNombre
              : equipo?.tipoNombre
          );

          const isIrd = tipo === "ird";
          const hasIrdRef =
            (typeof equipo?.irdRef === "object" && equipo?.irdRef?._id) ||
            typeof equipo?.irdRef === "string";

          const isSat = tipo === "satelite" || tipo === "satellite";
          const hasSatRef =
            (typeof equipo?.satelliteRef === "object" && equipo?.satelliteRef?._id) ||
            typeof equipo?.satelliteRef === "string";

          if (isSat && hasSatRef) {
            return (
              <EquipoSatellite
                title="Detalle Satélite"
                satellite={sat}
                loading={loadingSat || loadingEquipo}
                error={satError || equipoError}
              />
            );
          }

          if (isIrd && hasIrdRef) {
            return (
              <EquipoIrd
                title="Detalle IRD"
                ird={ird}
                loading={loadingIrd || loadingEquipo}
                error={irdError || equipoError}
              />
            );
          }

          return (
            <EquipoDetail
              title="Detalle de Equipo"
              equipo={equipo}
              loading={loadingEquipo}
              error={equipoError}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default ChannelDiagram;
