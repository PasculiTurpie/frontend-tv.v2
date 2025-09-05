// src/pages/ChannelDiagram/ChannelDiagram.jsx
import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import api from "../../utils/api";
import { useParams } from "react-router-dom";
import CustomNode from "./CustomNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";
import EquipoDetail from "../Equipment/EquipoDetail";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { directional: CustomDirectionalEdge };

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

const ChannelDiagram = () => {
  const { id } = useParams();

  const [signal, setSignal] = useState({});
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [selectedEquipoId, setSelectedEquipoId] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [equipoError, setEquipoError] = useState(null);

  useEffect(() => {
    let mounted = true;

    api
      .getChannelDiagramById(id)
      .then((res) => {
        if (!mounted) return;
        const result = res.data || {};
        setSignal(result);

        // ---------- NODOS ----------
        const rawNodes = Array.isArray(result.nodes) ? result.nodes : [];
        let normalizedNodes = rawNodes.map((n, i) => {
          const baseData = n.data || {};
          const label = baseData.label ?? n.label ?? String(n.id ?? i + 1);

          // ← NEW: inyecta equipoId / equipo al data, vengan donde vengan
          const rawEquipoId =
            baseData.equipoId ??
            n.equipoId ??
            n.equipo ?? // a veces guardan el id en 'equipo'
            null;

          const embedEquipo =
            baseData.equipo ??
            n.equipoObject ?? // por si el backend embebe el objeto en otra prop
            null;

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

        // fallback si todo vino (0,0)
        if (
          normalizedNodes.length &&
          normalizedNodes.every((n) => n.position.x === 0 && n.position.y === 0)
        ) {
          normalizedNodes = normalizedNodes.map((n, idx) => ({
            ...n,
            position: { x: idx * 220, y: 100 },
          }));
        }

        // ---------- EDGES ----------
        const rawEdges = Array.isArray(result.edges) ? result.edges : [];
        const normalizedEdges = rawEdges
          .map((e, i) => ({
            id: String(e.id ?? `e-${i + 1}`),
            source: String(e.source),
            target: String(e.target),
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            label: e.label,
            data: e.data || {},
            type: e.type || "directional",
            animated: e.animated ?? true,
            style: e.style || { stroke: "#000", strokeWidth: 2 },
            markerEnd:
              e.markerEnd || {
                type: "arrowclosed",
                color: (e.style && e.style.stroke) || "#000",
              },
          }))
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
  }, [id]);

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
      // log para verificar qué viene en el nodo
      // console.log("CLICK NODE:", node);

      const raw =
        node?.data?.equipoId ??
        node?.data?.equipo?._id ??
        node?.data?.equipo ??
        node?.equipo ?? // último fallback si alguien lo guardó al nivel raíz
        null;

      const idStr = toIdString(raw);
      setSelectedEquipoId(idStr);
      fetchEquipo(idStr);
    },
    [fetchEquipo]
  );

  return (
    <div
      className="outlet-main"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 360px",
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
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ width: "100%", height: "100%" }}
            proOptions={{ hideAttribution: true }}
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
        <EquipoDetail
          title="Detalle de Equipo"
          equipo={equipo}
          loading={loadingEquipo}
          error={equipoError}
        />
      </div>
    </div>
  );
};

export default ChannelDiagram;
