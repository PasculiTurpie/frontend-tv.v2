import React, { useState, useEffect } from "react";
import ReactFlow, { Background, Controls, Handle } from "reactflow";
import "reactflow/dist/style.css";
import CustomEdge from './CustomEdge';
import './SignalFlow.css'

const nodeImages = {
  satelite: "/public/images/satelite.png",
  ird: "/public/images/ird_motorola.png",
  switch: "/public/images/switch.png",
  dcm: "/public/images/dcm.png",
  ateme: "/public/images/ateme_titan.png",
  encryptor: "/public/images/vmx_encryptor.png",
  router: "/public/images/router.png"
};

const edgeOptions = {
  animated: true,
  style: { stroke: "#ff0072", strokeWidth: 2 },
  customEdge: CustomEdge
};

const getNodeType = (type) => {

  return ({ data }) => (
    <div className={'container-flow'} style={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
      <a href={data.url} target="_blank" style={{ textDecoration: 'none' }}>
        <div style={{ padding: 10}}>{data.url}</div>
      </a>
      <img style={{margin:"0 auto"}} src={nodeImages[type]} alt={type} width={100} />
      <div>{data.label}{data.id}</div>
      <Handle type="target" position="left" style={{ background: '#fff' }} />
      <Handle type="source" position="right" style={{ background: '#fff' }} />
    </div>
  );
};

const nodeTypes = {
  satelite: getNodeType("satelite"),
  ird: getNodeType("ird"),
  switch: getNodeType("switch"),
  dcm: getNodeType("dcm"),
  ateme: getNodeType("ateme"),
  encryptor: getNodeType("encryptor"),
  router: getNodeType("router")
};

const FlowDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const onEdgeClick = (e, node) => {
    const parentId = node.parentNode || node.id; 
    setSelectedNodeId(parentId);
    console.log("ID del nodo seleccionado:", parentId);
  
  };

  useEffect(() => {
    fetch("/public/nodes.json")
      .then((response) => response.json())
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
      });
  }, []);

  return (
    <div className="viewport-flow" style={{ width: '90%', height: "500px" }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} defaultEdgeOptions={edgeOptions} onNodeClick={onEdgeClick} >
        <Background />
        <Controls />
      </ReactFlow>
      {selectedNodeId && <p>ID seleccionado: {selectedNodeId}</p>}
    </div>
  );
};

export default FlowDiagram;
