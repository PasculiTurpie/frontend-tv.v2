import { useEffect, useRef, useState } from "react";
import ReactFlow, {
    Controls,
    Background,
    Handle,
    Position,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

/* ---------- Nodo personalizado ---------- */
const CustomNode = ({ data }) => {
    return (
        <div
            title={data?.tooltip || data?.description || data?.label} // fallback tooltip nativo
            style={{
                padding: 10,
                border: "1px solid #444",
                borderRadius: 10,
                background: "#fff",
                width: 130,
            }}
        >
            <div style={{ fontWeight: "bold" }}>{data.label}</div>

            {/* Entradas (targets) */}
            <Handle
                type="target"
                position={Position.Left}
                id="in-1"
                style={{ left: 0, background: "transparent" }}
            />
            <Handle
                type="target"
                position={Position.Right}
                id="in-2"
                style={{ right: 0, background: "transparent" }}
            />
            {/* Salidas (sources) */}
            <Handle
                type="source"
                position={Position.Left}
                id="out-1"
                style={{ left: 0, background: "transparent" }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="out-2"
                style={{ right: 0, background: "transparent" }}
            />
        </div>
    );
};

/* ---------- Datos de ejemplo ---------- */
const dataFlow = {
    nameChannel: "DREAMWORKS",
    numberChannelSur: "3",
    numberChannelCn: "3",
    logoChannel: "https://i.ibb.co/KX2gxHz/Dreamworks.jpg",
    severidadChannel: "4",
    tipoTecnologia: "Cobre",
    contacto: [
        {
            nombreContact: "Jorge Sepúlveda",
            email: "jsepulveda@gmail.com",
            telefono: "+56 9 88776655",
        },
    ],
    nodes: [
        {
            id: "1",
            data: { label: "Satelite", tooltip: "Satelite Internacional" },
            position: { x: 50, y: 250 },
            type: "custom",
        },
        {
            id: "2",
            data: { label: "Router ASR", tooltip: "Router de Borde ASR" },
            position: { x: 150, y: 0 },
            type: "custom",
        },
        {
            id: "3",
            data: { label: "Switch 7", tooltip: "Switch de acceso" },
            position: { x: 350, y: 150 },
            type: "custom",
        },
    ],
    edges: [
        {
            id: "edge-1",
            source: "1",
            sourceHandle: "out-1",
            // puedes usar data.tooltip o tooltip a nivel raíz; soportamos ambos
            data: { tooltip: "Enlace Satélite → Router" },
            tooltip: "Satelite internacional",
            target: "2",
            targetHandle: "in-1",
            type: "step",
            label: "Entrada A",
            animated: true,
            style: { stroke: "purple" },
            labelStyle: { fill: "purple", fontWeight: 700 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: "purple",
            },
        },
        {
            id: "edge-2",
            source: "2",
            sourceHandle: "out-2",
            target: "1",
            targetHandle: "in-2",
            type: "step",
            label: "Entrada B",
            style: { stroke: "green" },
            labelStyle: { fill: "green", fontWeight: 700 },
            animated: true,
            data: { tooltip: "Retorno Router → Satélite" },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: "green",
            },
        },
        {
            id: "edge-3",
            source: "3",
            sourceHandle: "out-1",
            // puedes usar data.tooltip o tooltip a nivel raíz; soportamos ambos
            data: { tooltip: "Enlace Satélite → Router" },
            tooltip: "Satelite internacional",
            target: "2",
            targetHandle: "in-1",
            type: "step",
            label: "Entrada A",
            animated: true,
            style: { stroke: "red" },
            labelStyle: { fill: "red", fontWeight: 700 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: "red",
            },
        },
        {
            id: "edge-4",
            source: "2",
            sourceHandle: "out-2",
            target: "3",
            targetHandle: "in-2",
            type: "step",
            label: "Entrada B",
            style: { stroke: "blue" },
            labelStyle: { fill: "blue", fontWeight: 700 },
            animated: true,
            data: { tooltip: "Retorno Router → Satélite" },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: "blue",
            },
        },
    ],
};

const nodeTypes = { custom: CustomNode };

/* ---------- Tooltip flotante ---------- */
function Tooltip({ x, y, text }) {
    if (!text) return null;
    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(12px, 12px)", // pequeño offset del cursor
                background: "rgba(0,0,0,0.85)",
                color: "#fff",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 12,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 1000,
            }}
        >
            {text}
        </div>
    );
}

const Diagram = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [variant, setVariant] = useState("dots");

    // estado del tooltip
    const [tip, setTip] = useState({ show: false, x: 0, y: 0, text: "" });
    const wrapperRef = useRef(null);

    useEffect(() => {
        setNodes(dataFlow.nodes);
        setEdges(dataFlow.edges);
    }, []);

    // helpers para posicionar el tooltip relativo al contenedor
    const posFromEvent = (evt) => {
        const bounds = wrapperRef.current?.getBoundingClientRect();
        return {
            x: evt.clientX - (bounds?.left || 0),
            y: evt.clientY - (bounds?.top || 0),
        };
    };

    /* ---------- Eventos de NODOS ---------- */
    const onNodeMouseEnter = (evt, node) => {
        const { x, y } = posFromEvent(evt);
        const text =
            node?.data?.tooltip ||
            node?.description ||
            node?.data?.label ||
            "Nodo";
        setTip({ show: true, x, y, text });
    };

    const onNodeMouseMove = (evt) => {
        if (!tip.show) return;
        const { x, y } = posFromEvent(evt);
        setTip((t) => ({ ...t, x, y }));
    };

    const onNodeMouseLeave = () => {
        setTip((t) => ({ ...t, show: false }));
    };

    /* ---------- Eventos de EDGES ---------- */
    const onEdgeMouseEnter = (evt, edge) => {
        const { x, y } = posFromEvent(evt);
        const text = edge?.data?.tooltip || edge?.tooltip || edge?.label || "Enlace";
        setTip({ show: true, x, y, text });
    };

    const onEdgeMouseMove = (evt) => {
        if (!tip.show) return;
        const { x, y } = posFromEvent(evt);
        setTip((t) => ({ ...t, x, y }));
    };

    const onEdgeMouseLeave = () => {
        setTip((t) => ({ ...t, show: false }));
    };

    return (
        <div className="container__diagram">
            <div
                ref={wrapperRef}
                style={{ position: "relative", width: "85vw", height: "50vh" }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    onNodeMouseEnter={onNodeMouseEnter}
                    onNodeMouseMove={onNodeMouseMove}
                    onNodeMouseLeave={onNodeMouseLeave}
                    onEdgeMouseEnter={onEdgeMouseEnter}
                    onEdgeMouseMove={onEdgeMouseMove}
                    onEdgeMouseLeave={onEdgeMouseLeave}
                >
                    <Background variant={variant} color="grey" gap={20} />
                    <Controls />
                </ReactFlow>

                {/* Tooltip flotante */}
                {tip.show && <Tooltip x={tip.x} y={tip.y} text={tip.text} />}
            </div>
        </div>
    );
};

export default Diagram;
