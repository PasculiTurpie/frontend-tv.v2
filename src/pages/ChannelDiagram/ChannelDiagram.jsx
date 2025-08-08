import React, { useEffect, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

const ChannelDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/v2/channels")
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          // Tomamos el primer canal para mostrar
          setNodes(data[0].nodes);
          setEdges(data[0].edges);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ width:600, height: 600 }}>
      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  );
}

export default ChannelDiagram