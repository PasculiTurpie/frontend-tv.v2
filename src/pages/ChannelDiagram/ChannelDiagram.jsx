import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import api from '../../utils/api'
import { useParams } from "react-router-dom";

const ChannelDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [signal, setSignal] = useState({})
  const { id } = useParams();

  console.log(id)

  useEffect(() => {
    api.getChannelDiagramById(id)
      .then((data) => {
        const result = (data.data)
        setSignal(result)
        if (result) {
          // Tomamos el primer canal para mostrar
          setNodes(result.nodes);
          setEdges(result.edges);
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