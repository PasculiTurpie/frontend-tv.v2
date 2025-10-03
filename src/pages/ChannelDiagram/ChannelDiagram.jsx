// src/pages/ChannelDiagram/ChannelDiagram.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import CustomNode from "./CustomNode";
import RouterNode from "./RouterNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";
import CustomWaypointEdge from "./CustomWaypointEdge";
import "./ChannelDiagram.css";

/* ───────── utils ───────── */

const ARROW_CLOSED = { type: "arrowclosed" };

const normalizeMarker = (m) => {
  if (!m || typeof m !== "object") return { type: "arrowclosed" };
  const t = m.type;
  if (t === "arrowclosed" || t === "arrow") return { ...m };
  if (t === 1 || t === "1") return { ...m, type: "arrowclosed" };
  if (t === 0 || t === "0") return { ...m, type: "arrow" };
  return { ...m, type: "arrowclosed" };
};

// color del edge (usa el stroke si viene, si no, rojo/verde por la dirección)
const getEdgeColor = (style, direction) =>
  style?.stroke || (direction === "vuelta" ? "green" : "red");

// aplica color al marker
const withMarkerColor = (marker, color) => ({
  ...normalizeMarker(marker || ARROW_CLOSED),
  color,
});

const toNumberOr = (val, def = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
};


const safeArray = (val) => (Array.isArray(val) ? val : []);

/* Map API → React Flow node */
const mapNodeFromApi = (node) => {
  if (!node) return null;
  const id = String(node.id ?? node._id ?? node.key ?? "");
  if (!id) return null;

  const rawData = node.data || {};

  const getPos = (val, index) => {
    if (val !== undefined && val !== null) return val;
    if (Array.isArray(node.position)) return node.position[index];
    return undefined;
  };

  return {
    id,
    type: node.type || "custom",
    data: { label: rawData.label || node.label || id, ...rawData },
    position: {
      x: toNumberOr(getPos(node.position?.x, 0), 0),
      y: toNumberOr(getPos(node.position?.y, 1), 0),
    },
  };
};

/* Map API → React Flow edge */
const mapEdgeFromApi = (edge) => {
  if (!edge) return null;
  const id = String(edge.id ?? edge._id ?? "");
  if (!id || !edge.source || !edge.target) return null;

  const rawData = edge.data || {};
  const direction = rawData.direction || (edge.style?.stroke === "green" ? "vuelta" : "ida");
  const label = edge.label || rawData.label || id;

  const color = getEdgeColor(edge.style, direction);
  const style = edge.style || { stroke: color, strokeWidth: 2 };

  return {
    id,
    source: String(edge.source),
    target: String(edge.target),
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type || "directional",
    label,
    data: { ...rawData, label, direction },
    style,
    markerEnd: withMarkerColor(edge.markerEnd, color),                  // ⬅️ flecha con el mismo color
    markerStart: edge.markerStart ? withMarkerColor(edge.markerStart, color) : undefined,
    animated: edge.animated ?? true,                                    // si quieres que sigan animados
  };
};
 

/* ───────── componente ───────── */

const ChannelDiagram = () => {
  const { id: signalId } = useParams();

  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
      router: RouterNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      directional: CustomDirectionalEdge,
      waypoint: CustomWaypointEdge,
    }),
    []
  );

  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Traer diagramas por señal
        const res = await api.getChannelDiagramBySignal(String(signalId).trim());
        const data = res?.data ?? res;                 // soporta api que devuelve {data} o el objeto directo
        const dataChannelDiagram = Array.isArray(data) ? data[0] : data; // toma el primero si viene array

        if (!dataChannelDiagram) throw new Error("No existen diagramas para la señal indicada.");

        // Mapear
        const mappedNodes = safeArray(dataChannelDiagram.nodes).map(mapNodeFromApi).filter(Boolean);
        const mappedEdges = safeArray(dataChannelDiagram.edges).map(mapEdgeFromApi).filter(Boolean);

        if (cancelled) return;

        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Error al cargar el diagrama");
          setNodes([]);
          setEdges([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signalId, setNodes, setEdges]);

  const handleNodesChange = useCallback((changes) => onNodesChange(changes), [onNodesChange]);
  const handleEdgesChange = useCallback((changes) => onEdgesChange(changes), [onEdgesChange]);

  if (loading) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <div className="diagram-overlay">Cargando diagrama…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <div className="diagram-overlay">{error}</div>
      </div>
    );
  }

  return (
    // ⬇️ CONTENEDOR CON ANCHO/ALTO EXPLÍCITOS (evita error #004)
    <div style={{ width: "90%" }}>
      <ReactFlow
// doble seguro
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        fitView
      >
        <Background variant="dots" gap={16} size={1} />
        <Controls position="bottom-right" />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default ChannelDiagram;
