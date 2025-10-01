import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api";
import CustomNode from "./CustomNode";
import RouterNode from "./RouterNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";
import CustomWaypointEdge from "./CustomWaypointEdge";
import "./ChannelDiagram.css";

const ARROW_CLOSED = { type: 1 };
const SAME_X_EPS = 8;

const toNumberOr = (val, def = 0) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : def;
};

const tipoToKey = (tipoNombre) => {
    const raw =
        (typeof tipoNombre === "object" && tipoNombre?.tipoNombre) ||
        (typeof tipoNombre === "string" && tipoNombre) ||
        "";
    const key = String(raw).trim().toLowerCase();
    if (["satélite", "satelite"].includes(key)) return "satelite";
    if (["switch", "switches", "sw"].includes(key)) return "switch";
    if (["router", "routers", "rt", "rtr"].includes(key)) return "router";
    return key;
};

const toId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return String(value._id);
    if (typeof value === "object" && value.id) return String(value.id);
    return null;
};

const mapNodeFromApi = (node) => {
    if (!node) return null;
    const id = node.id ?? node._id ?? node.key;
    if (!id) return null;

    const rawData = node.data || {};
    const rawEquipo = node.equipo || node.equipment || {};
    const equipoId =
        rawData.equipoId ??
        node.equipoId ??
        (typeof rawEquipo === "object"
            ? rawEquipo?._id || rawEquipo?.id || rawEquipo?.value
            : rawEquipo);
    const equipoNombre =
        rawData.equipoNombre ??
        node.equipoNombre ??
        (typeof rawEquipo === "object" ? rawEquipo?.nombre : null);
    const equipoTipo =
        rawData.equipoTipo ??
        node.equipoTipo ??
        (typeof rawEquipo === "object" ? tipoToKey(rawEquipo?.tipoNombre) : null);

    const getPos = (val, index) => {
        if (val !== undefined && val !== null) return val;
        if (Array.isArray(node.position)) return node.position[index];
        return undefined;
    };

    return {
        id: String(id),
        type: node.type || "custom",
        data: {
            label: rawData.label || node.label || String(id),
            equipoId: equipoId ? String(equipoId) : null,
            equipoNombre: equipoNombre || rawData.label || String(id),
            equipoTipo: equipoTipo || null,
            ...rawData,
        },
        position: {
            x: toNumberOr(getPos(node.position?.x, 0), 0),
            y: toNumberOr(getPos(node.position?.y, 1), 0),
        },
    };
};

const mapEdgeFromApi = (edge) => {
    if (!edge) return null;
    const id = edge.id ?? edge._id;
    if (!id || !edge.source || !edge.target) return null;

    const rawData = edge.data || {};
    const direction = rawData.direction || (edge.style?.stroke === "green" ? "vuelta" : "ida");
    const label = edge.label || rawData.label || String(id);

    return {
        id: String(id),
        source: String(edge.source),
        target: String(edge.target),
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label,
        type: edge.type || "directional",
        style:
            edge.style || {
                stroke: direction === "vuelta" ? "green" : "red",
                strokeWidth: 2,
            },
        markerEnd: edge.markerEnd || { ...ARROW_CLOSED },
        markerStart: edge.markerStart,
        data: { ...rawData, label, direction },
    };
};

const toApiNode = (node) => ({
    id: node.id,
    type: node.type || "custom",
    equipo: node.data?.equipoId ?? node.equipo ?? null,
    label: node.data?.label ?? node.label ?? node.id,
    data: {
        label: node.data?.label ?? node.label ?? node.id,
        equipoId: node.data?.equipoId ?? null,
        equipoNombre: node.data?.equipoNombre ?? node.data?.label ?? node.label ?? node.id,
        equipoTipo: node.data?.equipoTipo ?? null,
        ...node.data,
    },
    position: {
        x: Number.isFinite(+node.position?.x) ? +node.position.x : 0,
        y: Number.isFinite(+node.position?.y) ? +node.position.y : 0,
    },
});

const toApiEdge = (edge) => {
    const label = edge.data?.label || edge.label || edge.id;
    const direction = edge.data?.direction || "ida";
    return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label,
        type: edge.type || "directional",
        style:
            edge.style || {
                stroke: direction === "vuelta" ? "green" : "red",
                strokeWidth: 2,
            },
        markerEnd: edge.markerEnd || { ...ARROW_CLOSED },
        markerStart: edge.markerStart,
        data: { ...(edge.data || {}), label, direction },
    };
};

const pickHandlesByGeometry = (srcNode, tgtNode, direction = "ida") => {
    const srcTipo = srcNode?.data?.equipoTipo || tipoToKey(srcNode?.data?.equipo?.tipoNombre?.tipoNombre);
    if (srcTipo === "satelite") {
        return { sourceHandle: "out-right", targetHandle: "in-left" };
    }

    const sx = Number(srcNode?.position?.x ?? 0);
    const sy = Number(srcNode?.position?.y ?? 0);
    const tx = Number(tgtNode?.position?.x ?? 0);
    const ty = Number(tgtNode?.position?.y ?? 0);

    const sameX = Math.abs(sx - tx) <= SAME_X_EPS;

    if (sameX && sy !== ty) {
        const srcIsUpper = sy < ty;
        if (direction === "ida") {
            return srcIsUpper
                ? { sourceHandle: "out-bottom-1", targetHandle: "in-top-1" }
                : { sourceHandle: "out-top-1", targetHandle: "in-bottom-1" };
        }
        return srcIsUpper
            ? { sourceHandle: "out-bottom-2", targetHandle: "in-top-2" }
            : { sourceHandle: "out-top-2", targetHandle: "in-bottom-2" };
    }

    return direction === "ida"
        ? { sourceHandle: "out-right", targetHandle: "in-left" }
        : { sourceHandle: "out-left", targetHandle: "in-right" };
};

const ChannelDiagram = () => {
    const navigate = useNavigate();
    const { id: signalIdParam } = useParams();
    const [searchParams] = useSearchParams();

    const modeParam = (searchParams.get("mode") || "view").toLowerCase();
    const isEditMode = modeParam === "edit";
    const signalId = signalIdParam ? String(signalIdParam) : null;

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
    const [error, setError] = useState(null);
    const [diagramId, setDiagramId] = useState(null);
    const [signalName, setSignalName] = useState("");
    const [signalTech, setSignalTech] = useState("");

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [nodeLabelDraft, setNodeLabelDraft] = useState("");
    const [edgeLabelDraft, setEdgeLabelDraft] = useState("");
    const [edgeDirection, setEdgeDirection] = useState("ida");

    const [newNodeLabel, setNewNodeLabel] = useState("");
    const [edgeForm, setEdgeForm] = useState({ source: "", target: "", label: "", direction: "ida" });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!signalId) {
            setError(new Error("No se especificó una señal"));
            setLoading(false);
            return;
        }

        let cancelled = false;
        const loadDiagram = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.getChannelDiagramBySignal(signalId);
                const payload = res?.data;
                const asArray = Array.isArray(payload)
                    ? payload
                    : payload
                        ? [payload]
                        : [];

                const foundChannel = asArray.find((item) => {
                    const rawSignal = item?.signal;
                    const candidate = toId(rawSignal);
                    return candidate ? String(candidate) === String(signalId) : false;
                });

                if (cancelled) return;

                if (!foundChannel) {
                    setDiagramId(null);
                    setSignalName("");
                    setSignalTech("");
                    setNodes([]);
                    setEdges([]);
                    if (isEditMode) {
                        throw new Error("No existe un diagrama para la señal seleccionada.");
                    }
                    return;
                }

                setDiagramId(foundChannel._id ? String(foundChannel._id) : null);
                setSignalName(foundChannel.signal?.nameChannel || foundChannel.signal?.nombre || "");
                setSignalTech(foundChannel.signal?.tipoTecnologia || "");

                const mappedNodes = Array.isArray(foundChannel.nodes)
                    ? foundChannel.nodes.map(mapNodeFromApi).filter(Boolean)
                    : [];
                const mappedEdges = Array.isArray(foundChannel.edges)
                    ? foundChannel.edges.map(mapEdgeFromApi).filter(Boolean)
                    : [];

                setNodes(mappedNodes);
                setEdges(mappedEdges);
            } catch (err) {
                if (!cancelled) {
                    console.error("Error al cargar el diagrama", err);
                    setError(err);
                    setNodes([]);
                    setEdges([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDiagram();

        return () => {
            cancelled = true;
        };
    }, [signalId, isEditMode, setEdges, setNodes]);

    useEffect(() => {
        if (!isEditMode) return;
        if (!selectedNodeId) {
            setNodeLabelDraft("");
            return;
        }
        const node = nodes.find((item) => item.id === selectedNodeId);
        setNodeLabelDraft(node?.data?.label || node?.label || "");
    }, [isEditMode, nodes, selectedNodeId]);

    useEffect(() => {
        if (!isEditMode) return;
        if (!selectedEdgeId) {
            setEdgeLabelDraft("");
            setEdgeDirection("ida");
            return;
        }
        const edge = edges.find((item) => item.id === selectedEdgeId);
        setEdgeLabelDraft(edge?.data?.label || edge?.label || "");
        setEdgeDirection(edge?.data?.direction || "ida");
    }, [isEditMode, edges, selectedEdgeId]);

    const handleSelectionChange = useCallback((selection) => {
        if (!isEditMode) {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
            return;
        }

        const node = selection?.nodes?.[0];
        const edge = selection?.edges?.[0];

        setSelectedNodeId(node ? node.id : null);
        setSelectedEdgeId(edge ? edge.id : null);
    }, [isEditMode]);

    const handleNodesChange = useCallback((changes) => {
        if (!isEditMode) return;
        onNodesChange(changes);
    }, [isEditMode, onNodesChange]);

    const handleEdgesChange = useCallback((changes) => {
        if (!isEditMode) return;
        onEdgesChange(changes);
    }, [isEditMode, onEdgesChange]);

    const handleConnect = useCallback((connection) => {
        if (!isEditMode) return;
        const id = `edge-${Date.now()}`;
        setEdges((eds) =>
            addEdge(
                {
                    ...connection,
                    id,
                    type: "directional",
                    markerEnd: { ...ARROW_CLOSED },
                    data: { label: connection.label || id, direction: "ida" },
                    style: { stroke: "red", strokeWidth: 2 },
                },
                eds
            )
        );
    }, [isEditMode, setEdges]);

    const handleAddNode = useCallback(() => {
        if (!isEditMode) return;
        if (!newNodeLabel.trim()) {
            Swal.fire("Etiqueta requerida", "Ingrese una etiqueta para el nuevo nodo.", "info");
            return;
        }
        const id = `node-${Date.now()}`;
        setNodes((prev) => [
            ...prev,
            {
                id,
                type: "custom",
                position: { x: 100 + prev.length * 40, y: 100 + prev.length * 20 },
                data: {
                    label: newNodeLabel.trim(),
                    equipoNombre: newNodeLabel.trim(),
                },
            },
        ]);
        setNewNodeLabel("");
    }, [isEditMode, newNodeLabel, setNodes]);

    const handleUpdateNodeLabel = useCallback(() => {
        if (!isEditMode) return;
        if (!selectedNodeId) return;
        setNodes((prev) =>
            prev.map((node) =>
                node.id === selectedNodeId
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            label: nodeLabelDraft || node.id,
                            equipoNombre: nodeLabelDraft || node.data?.equipoNombre,
                        },
                    }
                    : node
            )
        );
    }, [isEditMode, nodeLabelDraft, selectedNodeId, setNodes]);

    const handleDeleteNode = useCallback(() => {
        if (!isEditMode) return;
        if (!selectedNodeId) return;
        setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId));
        setEdges((prev) => prev.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
        setSelectedNodeId(null);
    }, [isEditMode, selectedNodeId, setEdges, setNodes]);

    const handleAddEdge = useCallback(() => {
        if (!isEditMode) return;
        const { source, target, label, direction } = edgeForm;
        if (!source || !target) {
            Swal.fire("Conexión incompleta", "Selecciona origen y destino para la conexión.", "info");
            return;
        }
        if (source === target) {
            Swal.fire("Conexión inválida", "El origen y el destino no pueden ser el mismo nodo.", "warning");
            return;
        }

        const sourceNode = nodes.find((node) => node.id === source);
        const targetNode = nodes.find((node) => node.id === target);
        if (!sourceNode || !targetNode) {
            Swal.fire("Nodos inválidos", "Selecciona nodos válidos para la conexión.", "error");
            return;
        }

        const handles = pickHandlesByGeometry(sourceNode, targetNode, direction);
        const id = `edge-${Date.now()}`;
        const labelValue = label?.trim() || id;
        const style = direction === "vuelta"
            ? { stroke: "green", strokeWidth: 2 }
            : { stroke: "red", strokeWidth: 2 };

        setEdges((prev) => [
            ...prev,
            {
                id,
                source: sourceNode.id,
                target: targetNode.id,
                sourceHandle: handles.sourceHandle,
                targetHandle: handles.targetHandle,
                type: "directional",
                data: { label: labelValue, direction },
                label: labelValue,
                markerEnd: { ...ARROW_CLOSED },
                style,
            },
        ]);

        setEdgeForm({ source: "", target: "", label: "", direction: "ida" });
    }, [isEditMode, edgeForm, nodes, setEdges]);

    const handleUpdateEdge = useCallback(() => {
        if (!isEditMode) return;
        if (!selectedEdgeId) return;
        setEdges((prev) =>
            prev.map((edge) => {
                if (edge.id !== selectedEdgeId) return edge;
                const label = edgeLabelDraft?.trim() || edge.id;
                const direction = edgeDirection || "ida";
                const style = direction === "vuelta"
                    ? { stroke: "green", strokeWidth: 2 }
                    : { stroke: "red", strokeWidth: 2 };
                return {
                    ...edge,
                    label,
                    style,
                    data: {
                        ...(edge.data || {}),
                        label,
                        direction,
                    },
                };
            })
        );
    }, [edgeDirection, edgeLabelDraft, isEditMode, selectedEdgeId, setEdges]);

    const handleDeleteEdge = useCallback(() => {
        if (!isEditMode) return;
        if (!selectedEdgeId) return;
        setEdges((prev) => prev.filter((edge) => edge.id !== selectedEdgeId));
        setSelectedEdgeId(null);
    }, [isEditMode, selectedEdgeId, setEdges]);

    const handleSave = useCallback(async () => {
        if (!signalId) {
            Swal.fire("Sin señal", "No se pudo determinar la señal seleccionada.", "error");
            return;
        }
        if (!diagramId) {
            Swal.fire("Diagrama no disponible", "No hay un diagrama para actualizar.", "error");
            return;
        }
        if (nodes.length === 0) {
            Swal.fire("Sin nodos", "Agrega al menos un nodo antes de guardar.", "warning");
            return;
        }

        setSaving(true);
        try {
            const normalizedNodes = nodes.map(toApiNode);
            const normalizedEdges = edges.map(toApiEdge);

            const payload = {
                signal: signalId,
                channel: signalId,
                signalId,
                channelId: diagramId,
                nodes: normalizedNodes,
                edges: normalizedEdges,
            };

            await api.updateChannelFlow(diagramId, payload);

            Swal.fire({
                icon: "success",
                title: "Diagrama actualizado",
                html: `
                    <p><strong>Señal:</strong> ${signalName || signalId}</p>
                    <p><strong>Nodos:</strong> ${nodes.length}</p>
                    <p><strong>Enlaces:</strong> ${edges.length}</p>
                `,
            });
        } catch (err) {
            console.error("Error al guardar el diagrama", err);
            const data = err?.response?.data;
            Swal.fire({
                icon: "error",
                title: "Error al guardar",
                html: `
                    <div style="text-align:left">
                        <div><b>Status:</b> ${err?.response?.status || "?"}</div>
                        <div><b>Mensaje:</b> ${data?.message || err.message || "Error desconocido"}</div>
                    </div>
                `,
            });
        } finally {
            setSaving(false);
        }
    }, [diagramId, edges, nodes, signalId, signalName]);

    const goBack = () => navigate(-1);

    if (loading) {
        return (
            <div className="outlet-main">
                <div className="chf__loading">Cargando diagrama…</div>
            </div>
        );
    }

    if (error && !isEditMode) {
        return (
            <div className="outlet-main">
                <div className="chf__error">
                    <p>No se pudo cargar el diagrama para esta señal.</p>
                    <button className="button btn-primary" onClick={goBack}>
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (!diagramId && !isEditMode) {
        return (
            <div className="outlet-main">
                <div className="chf__empty">
                    <h2>No hay diagrama para esta señal.</h2>
                    <p>Utiliza la opción de edición para crear o asociar un diagrama.</p>
                    <div className="chf__actions">
                        <button className="button btn-primary" onClick={() => navigate(`/channels/${signalId}?mode=edit`)}>
                            Ir a edición
                        </button>
                        <button className="button btn-secondary" onClick={goBack}>
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error && isEditMode) {
        return (
            <div className="outlet-main">
                <div className="chf__error">
                    <p>{error.message || "No se pudo cargar el diagrama."}</p>
                    <button className="button btn-secondary" onClick={goBack}>
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="outlet-main">
            <div className="chd__header">
                <div>
                    <h1 className="chd__title">Diagrama de señal</h1>
                    <p className="chd__subtitle">
                        {signalName ? `${signalName}${signalTech ? ` · ${signalTech}` : ""}` : `Señal ${signalId}`}
                    </p>
                </div>
                <div className="chd__header-actions">
                    <button className="button btn-secondary" onClick={goBack}>
                        Volver
                    </button>
                    {isEditMode ? (
                        <button className="button btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? "Guardando…" : "Guardar cambios"}
                        </button>
                    ) : (
                        <button
                            className="button btn-primary"
                            onClick={() => navigate(`/channels/${signalId}?mode=edit`)}
                        >
                            Editar diagrama
                        </button>
                    )}
                </div>
            </div>

            <div className="chd__layout">
                <div className="chd__canvas">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onConnect={handleConnect}
                        onSelectionChange={handleSelectionChange}
                        nodesDraggable={isEditMode}
                        nodesConnectable={isEditMode}
                        elementsSelectable={isEditMode}
                        fitView
                    >
                        <Background variant="dots" gap={16} size={1} />
                        <Controls position="bottom-right" />
                        <MiniMap />
                    </ReactFlow>
                </div>

                {isEditMode ? (
                    <aside className="chd__sidebar">
                        <section className="chd__panel">
                            <h2 className="chd__panel-title">Nuevo nodo</h2>
                            <label className="chd__label" htmlFor="new-node-label">
                                Etiqueta
                            </label>
                            <input
                                id="new-node-label"
                                className="chd__input"
                                type="text"
                                value={newNodeLabel}
                                onChange={(event) => setNewNodeLabel(event.target.value)}
                            />
                            <button className="button btn-primary" type="button" onClick={handleAddNode}>
                                Agregar nodo
                            </button>
                        </section>

                        <section className="chd__panel">
                            <h2 className="chd__panel-title">Nodo seleccionado</h2>
                            {selectedNodeId ? (
                                <>
                                    <p className="chd__info">ID: {selectedNodeId}</p>
                                    <label className="chd__label" htmlFor="selected-node-label">
                                        Etiqueta
                                    </label>
                                    <input
                                        id="selected-node-label"
                                        className="chd__input"
                                        type="text"
                                        value={nodeLabelDraft}
                                        onChange={(event) => setNodeLabelDraft(event.target.value)}
                                    />
                                    <div className="chd__actions">
                                        <button className="button btn-primary" type="button" onClick={handleUpdateNodeLabel}>
                                            Actualizar etiqueta
                                        </button>
                                        <button className="button btn-danger" type="button" onClick={handleDeleteNode}>
                                            Eliminar nodo
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="chd__muted">Selecciona un nodo para editarlo.</p>
                            )}
                        </section>

                        <section className="chd__panel">
                            <h2 className="chd__panel-title">Agregar conexión</h2>
                            <label className="chd__label" htmlFor="edge-source">
                                Origen
                            </label>
                            <select
                                id="edge-source"
                                className="chd__input"
                                value={edgeForm.source}
                                onChange={(event) => setEdgeForm((prev) => ({ ...prev, source: event.target.value }))}
                            >
                                <option value="">Selecciona nodo</option>
                                {nodes.map((node) => (
                                    <option key={`edge-source-${node.id}`} value={node.id}>
                                        {node.data?.label || node.id}
                                    </option>
                                ))}
                            </select>

                            <label className="chd__label" htmlFor="edge-target">
                                Destino
                            </label>
                            <select
                                id="edge-target"
                                className="chd__input"
                                value={edgeForm.target}
                                onChange={(event) => setEdgeForm((prev) => ({ ...prev, target: event.target.value }))}
                            >
                                <option value="">Selecciona nodo</option>
                                {nodes.map((node) => (
                                    <option key={`edge-target-${node.id}`} value={node.id}>
                                        {node.data?.label || node.id}
                                    </option>
                                ))}
                            </select>

                            <label className="chd__label" htmlFor="edge-direction">
                                Dirección
                            </label>
                            <select
                                id="edge-direction"
                                className="chd__input"
                                value={edgeForm.direction}
                                onChange={(event) => setEdgeForm((prev) => ({ ...prev, direction: event.target.value }))}
                            >
                                <option value="ida">Ida (source → target)</option>
                                <option value="vuelta">Vuelta (target ← source)</option>
                            </select>

                            <label className="chd__label" htmlFor="edge-label">
                                Etiqueta
                            </label>
                            <input
                                id="edge-label"
                                className="chd__input"
                                type="text"
                                value={edgeForm.label}
                                onChange={(event) => setEdgeForm((prev) => ({ ...prev, label: event.target.value }))}
                            />

                            <button className="button btn-primary" type="button" onClick={handleAddEdge}>
                                Agregar conexión
                            </button>
                        </section>

                        <section className="chd__panel">
                            <h2 className="chd__panel-title">Conexión seleccionada</h2>
                            {selectedEdgeId ? (
                                <>
                                    <p className="chd__info">ID: {selectedEdgeId}</p>
                                    <label className="chd__label" htmlFor="selected-edge-label">
                                        Etiqueta
                                    </label>
                                    <input
                                        id="selected-edge-label"
                                        className="chd__input"
                                        type="text"
                                        value={edgeLabelDraft}
                                        onChange={(event) => setEdgeLabelDraft(event.target.value)}
                                    />
                                    <label className="chd__label" htmlFor="selected-edge-direction">
                                        Dirección
                                    </label>
                                    <select
                                        id="selected-edge-direction"
                                        className="chd__input"
                                        value={edgeDirection}
                                        onChange={(event) => setEdgeDirection(event.target.value)}
                                    >
                                        <option value="ida">Ida (source → target)</option>
                                        <option value="vuelta">Vuelta (target ← source)</option>
                                    </select>
                                    <div className="chd__actions">
                                        <button className="button btn-primary" type="button" onClick={handleUpdateEdge}>
                                            Actualizar conexión
                                        </button>
                                        <button className="button btn-danger" type="button" onClick={handleDeleteEdge}>
                                            Eliminar conexión
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="chd__muted">Selecciona una conexión para editarla.</p>
                            )}
                        </section>
                    </aside>
                ) : (
                    <aside className="chd__sidebar">
                        <section className="chd__panel">
                            <h2 className="chd__panel-title">Resumen</h2>
                            <p className="chd__info">Nodos: {nodes.length}</p>
                            <p className="chd__info">Conexiones: {edges.length}</p>
                            <p className="chd__muted">Utiliza el modo edición para realizar cambios.</p>
                        </section>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default ChannelDiagram;
