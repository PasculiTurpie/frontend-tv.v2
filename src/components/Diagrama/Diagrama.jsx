import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import './Diagram.css'
import "reactflow/dist/style.css";
import { Tooltip } from "react-tooltip";
import { useParams } from "react-router-dom";

const nodes = [
    {
        id: "1",
        type: "image",
        position: { x: 0, y: 0 },
        data: {
            label: "IS-21",
            image: "https://i.ibb.co/m5dxbBRh/parabolic.png",
            _id:"987538453hj45o3i4u9834"
        },
    },
    {
        id: "2",
        type: "image",
        position: { x: 250, y: 200 },
        data: {
            label: "IRD Cisco D9859",
            image: "https://i.ibb.co/pvW06r6K/ird-motorola.png",
        },
    },
    {
        id: "3",
        type: "image",
        position: { x: 500, y: 200 },
        data: {
            label: "Switch TV7",
            image: "https://i.ibb.co/FqX45Lsn/switch.png",
        },
    },
    {
        id: "4",
        type: "image",
        position: { x: 750, y: 200 },
        data: {
            label: "Titan TL-HOST_109",
            image: "https://i.ibb.co/zHmRSv8C/ateme-titan.png",
        },
    },
    {
        id: "5",
        type: "image",
        position: { x: 1000, y: 200 },
        data: {
            label: "DCM5_LAMS",
            image: "https://i.ibb.co/xKZdK3mK/dcm.png",
        },
    },
    {
        id: "6",
        type: "image",
        position: { x: 1250, y: 200 },
        data: {
            label: "DCM6_LAMS",
            image: "https://i.ibb.co/sSnvD0G/vmx-encryptor.png",
        },
    },
    {
        id: "57",
        type: "image", // Nodo personalizado (debes definirlo con React)
        position: { x: 1500, y: 200 },
        data: {
            label: "RTES2",
            image: "https://i.ibb.co/sSnvD0G/vmx-encryptor.png",
            description: "Codificador VMX para RTES2",
            status: "activo", // puedes usar esto para cambiar color o estilos
            ports: [
                { id: "in1", label: "Entrada ASI", direction: "input" },
                { id: "out1", label: "Salida IP", direction: "output" },
            ],
            metadata: {
                fabricante: "VMX Corp",
                modelo: "Encryptor 5000",
                ubicacion: "Rack 7 - Canal RTES2",
            }
        },
        className: "custom-node-class",
        draggable: true,
        selectable: true,
        connectable: true,
        sourcePosition: "right",
        targetPosition: "left"
      },
    {
        id: "8",
        type: "image",
        position: { x: 650, y: 0 },
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
        animated: true,
        label: 'Salida SDI',
        labelStyle: { fill: 'black', fontWeight: 8100 },
        position: { x: 600, y: 100 },
        style: { stroke: "#ff0072", strokeWidth: 2 },
        data: {
            bandwidth: '10Gbps',
            protocolo: 'UDP'
          }
    },
    {
        id: "e2-3",
        source: "2",
        target: "3",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e3-4",
        source: "3",
        target: "4",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e4-5",
        source: "4",
        target: "5",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e5-6",
        source: "5",
        target: "6",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e6-7",
        source: "6",
        target: "57",
        animated: true,
        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
    {
        id: "e7-8",
        source: "57",
        target: "8",
        animated: true,

        style: { stroke: "#ff0072", strokeWidth: 2 },
    },
];


const handleTargetInfo = (e) => {
    console.log(e.target)
}
const ImageNode = ({ data }) => {
    return (
        <>
        <div style={{ textAlign: "center" }}>
            <img
                src={data.image}
                alt={data.label}
                style={{ width: 100, height: 160, objectFit: 'contain' }}
                    data-id={data._id}
                onClick={handleTargetInfo}
            />
             <div style={{ fontSize: 16 }}>{data.label}</div>
            {/* Entrada */}
                <Handle type="target" position={Position.Left} style={{ background: '#555' }} onConnect={(params) => console.log('Conectado desde:', params)} />
            {/* Salida */}
            <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        </div>
            
        </>

    );
};

const nodeTypes = {
    image: ImageNode,
};

const Diagrama = () => {
    const {id}  = useParams()
    console.log(id)
    return (
        <div
            className="container__diagram"
            style={{ width: "100%", height: "100vh"  }}
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
        </div>
    );
};
export default Diagrama;
