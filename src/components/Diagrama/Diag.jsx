import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import CustomImageNode from "./CustomImageNode";

const nodeTypes = {
  image: CustomImageNode,
};

const nodes = [
  {
    id: "1",
    type: "image",
    position: { x: 0, y: 100 },
    data: {
      label: "IRD",
      image: "https://i.ibb.co/FWs6KXW/ird.png",
      description: "Receptor de señal satelital",
      status: "activo",
      ports: [
        { id: "out1", label: "Salida ASI", direction: "output" },
      ],
      metadata: {
        fabricante: "Ericsson",
        modelo: "RX8200",
        ubicacion: "Rack 1",
      },
    },
  },
  {
    id: "2",
    type: "image",
    position: { x: 300, y: 100 },
    data: {
      label: "Codificador",
      image: "https://i.ibb.co/sSnvD0G/vmx-encryptor.png",
      description: "Codificador VMX para RTES2",
      status: "activo",
      ports: [
        { id: "in1", label: "Entrada ASI", direction: "input" },
        { id: "out1", label: "Salida IP", direction: "output" },
      ],
      metadata: {
        fabricante: "VMX Corp",
        modelo: "Encryptor 5000",
        ubicacion: "Rack 7",
      },
    },
  },
  {
    id: "3",
    type: "image",
    position: { x: 600, y: 100 },
    data: {
      label: "Switch",
      image: "https://i.ibb.co/DGM0jFy/switch.png",
      description: "Switch IP para distribución de señal",
      status: "activo",
      ports: [
        { id: "in1", label: "Entrada IP", direction: "input" },
        { id: "out1", label: "Salida IP", direction: "output" },
      ],
      metadata: {
        fabricante: "Cisco",
        modelo: "Catalyst 9300",
        ubicacion: "Rack 9",
      },
    },
  }
];

const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}