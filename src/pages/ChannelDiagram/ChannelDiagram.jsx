import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const ChannelDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [signal, setSignal] = useState({})

  useEffect(() => {
    fetch("http://localhost:3000/api/v2/channels/6895bf14594b35926e20d2ea")
      .then((res) => res.json())

      .then((data) => {
        console.log(data)
        setSignal(data)
        if (data) {
          // Tomamos el primer canal para mostrar
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      })
      .catch(console.error);
  }, []);

  const handleClickElements = (e) =>{
    console.log(e.target)
  }

  return (
    <div style={{ width:"80%", height: 600 }} >
    <h2>{signal.signal?.nameChannel}</h2>
      <ReactFlow nodes={nodes} edges={edges} onClick={handleClickElements} >
        <Controls />
          <Background />
      </ReactFlow>
      <h2>Detalle</h2>
    </div>
  );
}

export default ChannelDiagram