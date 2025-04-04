import React, { useState, useEffect } from "react";
import ReactFlow, { Background, BackgroundVariant, Controls, Handle } from "reactflow";
import "reactflow/dist/style.css";
import CustomEdge from './CustomEdge';
import './SignalFlow.css';

const nodeImages = {
  satelite: "/public/images/parabolic.png",
  ird: "/public/images/ird_motorola.png",
  switch: "/public/images/switch.png",
  dcm: "/public/images/dcm.png",
  ateme: "/public/images/ateme_titan.png",
  encryptor: "/public/images/vmx_encryptor.png",
  router: "/public/images/router.png"
};

const edgeOptions = {
  animated: true,
  style: { stroke: "#8e44ad ", strokeWidth: 2 },
  customEdge: CustomEdge
};

const getNodeType = (type) => {

  return ({ data }) => (
    <div className={'container-flow'} style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <a className="link" href={data.url} target="_blank" style={{ textDecoration: 'none' }}>
        {data.url}
      </a>
      <img style={{ margin: "0 auto" }} src={nodeImages[type]} alt={type} width={100} />
      <div className='label' style={{ color: "#424949" }}>{data.label}</div>
      <Handle type="target" position="left" style={{ background: '#145a32' }} />
      <Handle type="source" position="right" style={{ background: '#4a235a' }} />
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

  const onNodeClick = (e, node) => {
    const parentId = node.parentNode || node.id;
    setSelectedNodeId(parentId);
    console.log("ID del nodo seleccionado:", parentId);

  };

  const onEdgeClick = () => {
    alert("onEdgeClick");
  }

  useEffect(() => {
    fetch("/public/nodes.json")
      .then((response) => response.json())
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
      });
  }, []);

  return (
    <>
      <div className="container-view" >
        <div className="viewport-flow" >
          <ReactFlow style={{ backgroundColor: "#fff" }} nodes={nodes} edges={edges} nodeTypes={nodeTypes} defaultEdgeOptions={edgeOptions} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} fitView={true}>
            <Background color="#f1f" />
            <Controls />
          </ReactFlow>
          {selectedNodeId && <p>ID seleccionado: {selectedNodeId}</p>}
        </div>
      </div>


    </>
  );
};

export default FlowDiagram;
