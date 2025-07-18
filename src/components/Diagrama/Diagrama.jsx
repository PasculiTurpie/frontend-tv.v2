import {
    ReactFlow,
    Background,
    Controls,
    Handle,
    Position,
    MarkerType,
} from "@xyflow/react";
import "./Diagram.css";
import "@xyflow/react/dist/style.css";
import { Tooltip } from "react-tooltip";
import { useParams } from "react-router-dom";
import CustomImageNodeRouters from "./CustomImageNodeRouters";
import CustomImageNodeDcm from "./CustomImageNodeDcm";
import { getMarkerEnd } from "reactflow";
const nodes = [
    {
        id: "1",
        type: "image",
        position: { x: 0, y: 0 },
        data: {
            label: "IS-21",
            image: "https://i.ibb.co/m5dxbBRh/parabolic.png",
            _id: "987538453hj45o3i4u9834",
        },
    },
    {
        id: "2",
        type: "image",
        position: { x: 250, y: 500 },
        data: {
            label: "IRD Cisco D9859",
            image: "https://i.ibb.co/pvW06r6K/ird-motorola.png",
        },
    },
    {
        id: "3",
        type: "image",
        position: { x: 500, y: 500 },
        data: {
            label: "Switch TV7",
            image: "https://i.ibb.co/FqX45Lsn/switch.png",
        },
    },
    {
        id: "4",
        type: "image",
        position: { x: 750, y: 500 },
        data: {
            label: "Titan TL-HOST_109",
            image: "https://i.ibb.co/zHmRSv8C/ateme-titan.png",
        },
    },
    {
        id: "5",
        type: "image",
        position: { x: 250, y: 300 },
        data: {
            label: "DCM5_LAMS",
            image: "https://i.ibb.co/xKZdK3mK/dcm.png",
        },
    },
    {
        id: "6",
        position: { x: 500, y: 300 },
        type: "dcm",
        data: {
            label: "DCM6_LAMS",
            image: "https://i.ibb.co/sSnvD0G/vmx-encryptor.png",
        },
    },
    {
        id: "7",
        type: "image", // Nodo personalizado (debes definirlo con React)
        position: { x: 750, y: 300 },
        data: {
            label: "RTES2",
            image: "https://i.ibb.co/sSnvD0G/vmx-encryptor.png",
        },
    },
    {
        id: "8",
        type: "router",
        position: { x: 500, y: 0 },
        data: {
            label: "Router_Asr",
            image: "https://i.ibb.co/TxRKYM3X/router.png",
        },
    },
];

const edges = [
    {
        id: "e1-2",
        source: "1",
        target: "2",
        type: "step",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e2-3",
        source: "2",
        target: "5",
        type: "step",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e3-4",
        source: "3",
        target: "4",
        type: "step",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e4-5",
        source: "4",
        target: "7",
        type: "step",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e5-6",
        source: "5",
        target: "3",
        type: "step",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e6-7",
        source: "6",
        target: "8",
        type: "step",
        /* sourceHandle:'source-dcm1',
        targetHandle:'target-router1', */
        animated: true,
        label:'239.255.3.56',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10, // Opcional: ancho de la flecha
            height: 10, // Opcional: alto de la flecha
            color: "red",
        },
        style: { stroke: "red", strokeWidth: 2 },
    },
    {
        id: "e6-8",
        source: "8",        
        target: "6",
        /* sourceHandle:'source-router1',
        targetHandle:'target-dcm1',  */      
        type: "step",
        label:'239.255.3.154',
        animated: true,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10, // Opcional: ancho de la flecha
            height: 10, // Opcional: alto de la flecha
            color: "green",
        },
        style: { stroke: "green", strokeWidth: 2 },
    },
    
];

const handleTargetInfo = (e) => {
    console.log(e.target);
};
const ImageNode = ({ data }) => {
    return (
        <>
            <div style={{ textAlign: "center" }}>
            {
                setInterval(() =>{

                })
            }
                {data.image ? (
                    <img
                        src={data.image}
                        alt={data.label}
                        style={{
                            width: 100,
                            height: "fit-object",
                            objectFit: "contain",
                        }}
                        data-id={data._id}
                        onClick={handleTargetInfo}
                    />
                ) : (
                    <span className="loader"></span>
                )}

                <div style={{ fontSize: 16 }}>{data.label}</div>
                {/* Entrada */}
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{ background: "#555" }}
                    onConnect={(params) =>
                        console.log("Conectado desde:", params)
                    }
                />
                {/* Salida */}
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{ background: "#555" }}
                />
            </div>
        </>
    );
};

const nodeTypes = {
    image: ImageNode,
    router: CustomImageNodeRouters,
    dcm: CustomImageNodeDcm,
};

const Diagrama = () => {
    const { id } = useParams();
    console.log(id);
    return (
        <div
            className="container__diagram"
            style={{ width: '90%', height: '600px' }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
            <hr />
            <h1>Detalle</h1>
        </div>
    );
};
export default Diagrama;
