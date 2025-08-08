import React, { useEffect, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

const ChannelDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/v2/channels/6895a986cf17676e18566d08")
      .then((res) => res.json())

      .then((data) => {
        console.log(data)
        if (data) {
          // Tomamos el primer canal para mostrar
          setNodes(data.nodes);
          setEdges(data.edges);
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