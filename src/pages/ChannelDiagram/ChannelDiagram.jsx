// src/pages/ChannelDiagram/ChannelDiagram.jsx
import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import api from "../../utils/api";
import { useParams } from "react-router-dom";
import CustomNode from "./CustomNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";
import EquipoDetail from "../Equipment/EquipoDetail";
import EquipoIrd from "../Equipment/EquipoIrd";
import EquipoSatellite from "../Equipment/EquipoSatellite";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { directional: CustomDirectionalEdge };

// util: number safe
const nn = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
// util: id safe
const toIdString = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") return raw._id || null;
  return null;
};
// util: normaliza nombres para comparación (minúsculas, sin acentos, trim)
const norm = (v) =>
  (v || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const ChannelDiagram = () => {
  const { id } = useParams();

  const [signal, setSignal] = useState({});
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Panel detalle equipo
  const [equipo, setEquipo] = useState(null);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [equipoError, setEquipoError] = useState(null);

  // Panel detalle IRD
  const [ird, setIrd] = useState(null);
  const [loadingIrd, setLoadingIrd] = useState(false);
  const [irdError, setIrdError] = useState(null);

  // Panel detalle SAT
  const [sat, setSat] = useState(null);
  const [loadingSat, setLoadingSat] = useState(false);
  const [satError, setSatError] = useState(null);

  // Cargar diagrama
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

          const rawEquipoId =
            baseData.equipoId ?? n.equipoId ?? n.equipo ?? null;

          // dentro del map de normalizedNodes
          const embedEquipo =
            baseData.equipo ??
            n.equipo ??           // <--- añade esto
            n.equipoObject ??
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

        // fallback (todo 0,0): distribuye para ver algo
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

  // Fetch equipo por id
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

      // limpiar secundarios al iniciar nueva carga
      setIrd(null);
      setIrdError(null);
      setLoadingIrd(false);
      setSat(null);
      setSatError(null);
      setLoadingSat(false);

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

  // Si el equipo es tipo "ird" y tiene irdRef → usar populate si viene objeto, o pedir por id
  useEffect(() => {
    const tipo = norm(
      typeof equipo?.tipoNombre === "object"
        ? equipo?.tipoNombre?.tipoNombre
        : equipo?.tipoNombre
    );

    // Sin equipo seleccionado
    if (!equipo) {
      setIrd(null);
      setIrdError(null);
      setLoadingIrd(false);
      return;
    }

    // Si NO es IRD
    if (tipo !== "ird") {
      setIrd(null);
      setIrdError(null);
      setLoadingIrd(false);
      return;
    }

    // Es IRD, ver si irdRef ya viene poblado
    if (equipo?.irdRef && typeof equipo.irdRef === "object") {
      setIrd(equipo.irdRef);
      setIrdError(null);
      setLoadingIrd(false);
      return;
    }

    // irdRef es id → pedirlo
    const irdId =
      typeof equipo?.irdRef === "string" ? equipo.irdRef : toIdString(equipo?.irdRef);

    if (!irdId) {
      setIrd(null);
      setIrdError("Equipo IRD sin irdRef");
      setLoadingIrd(false);
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
        setIrdError(
          err?.response?.data?.message || err.message || "Error al cargar IRD"
        );
      } finally {
        setLoadingIrd(false);
      }
    })();
  }, [equipo]);

  // Si el equipo es tipo "satelite" y tiene satelliteRef → usar populate si viene objeto, o pedir por id
  useEffect(() => {
    const tipo = norm(
      typeof equipo?.tipoNombre === "object"
        ? equipo?.tipoNombre?.tipoNombre
        : equipo?.tipoNombre
    );

    if (!equipo) {
      setSat(null);
      setSatError(null);
      setLoadingSat(false);
      return;
    }

    if (tipo !== "satelite") {
      setSat(null);
      setSatError(null);
      setLoadingSat(false);
      return;
    }

    // ya viene poblado (con .satelliteType si aplicaste populate anidado)
    if (equipo?.satelliteRef && typeof equipo.satelliteRef === "object") {
      setSat(equipo.satelliteRef);
      setSatError(null);
      setLoadingSat(false);
      return;
    }

    // es id → pedir a API
    const satId =
      typeof equipo?.satelliteRef === "string"
        ? equipo.satelliteRef
        : toIdString(equipo?.satelliteRef);

    if (!satId) {
      setSat(null);
      setSatError("Equipo satélite sin satelliteRef");
      setLoadingSat(false);
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
        setSatError(
          err?.response?.data?.message ||
          err.message ||
          "Error al cargar Satélite"
        );
      } finally {
        setLoadingSat(false);
      }
    })();
  }, [equipo]);

  const handleNodeClick = useCallback((evt, node) => {
    const equipoObj =
      node?.data?.equipo ??   // equipo embebido en el nodo (populate)
      node?.equipo ??         // fallback si backend lo puso a nivel raíz
      null;

    if (equipoObj && typeof equipoObj === "object") {
      // Limpia paneles secundarios (se volverán a poblar por los useEffect)
      setIrd(null); setIrdError(null); setLoadingIrd(false);
      setSat(null); setSatError(null); setLoadingSat(false);

      // Fuerza NUEVA referencia aunque sea el mismo equipo (para re-disparar efectos)
      setEquipo(prev => {
        const prevId = toIdString(prev?._id);
        const nextId = toIdString(equipoObj?._id);
        // Si es el mismo id, clonar para cambiar la referencia
        if (prevId === nextId) return { ...equipoObj };
        // Si es otro equipo, set directo (ya es nueva ref)
        return equipoObj;
      });
      return;
    }

    // Si no vino embebido, buscamos por id
    const raw =
      node?.data?.equipoId ??
      node?.data?.equipo?._id ??
      node?.equipo ?? null;

    const idStr = toIdString(raw);
    fetchEquipo(idStr);
  }, [fetchEquipo]);



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
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ width: "100%", height: "100%", background: "#DCDCDC" }}
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

          const isSat = tipo === "satelite" || tipo === "satellite"; // por si tuvieras esa variante
          const hasSatRef =
            (typeof equipo?.satelliteRef === "object" &&
              equipo?.satelliteRef?._id) ||
            typeof equipo?.satelliteRef === "string";

          // Prioridad: satélite → IRD → equipo genérico
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