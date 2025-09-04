import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import api from "../../utils/api";
import { useParams } from "react-router-dom";
import CustomNode from "./CustomNode";
import CustomDirectionalEdge from "./CustomDirectionalEdge";

const ChannelDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [signal, setSignal] = useState({});
  const { id } = useParams();

  const nodeTypes = { custom: CustomNode };
  const edgeTypes = { directional: CustomDirectionalEdge };

  useEffect(() => {
    api
      .getChannelDiagramById(id)
      .then((res) => {
        const result = res.data;
        setSignal(result || {});
        if (result?.nodes) {
          setNodes(result.nodes);
        }
        if (result?.edges) {
          // Añadir propiedades visuales si no las trae del backend
          const styledEdges = result.edges.map((edge) => ({
            ...edge,
            type: edge.type || "smoothstep",
            animated: edge.animated ?? true,
            style: edge.style || { stroke: "#000", strokeWidth: 2 },
            markerEnd:
              edge.markerEnd || {
                type: "arrowclosed",
                color: edge.style?.stroke || "#000",
              },
          }));
          setEdges(styledEdges);
        }
      })
      .catch((err) => {
        console.error("Error al cargar diagrama:", err);
      });
  }, [id]);

  const handleClickElements = (e) => {
    console.log("Click en elemento:", e.target);
  };

  return (
    <div className="outlet-main" style={{ width: "80%", height: 600 }}>
      <h2>
        {signal.signal?.nameChannel || "Diagrama de Canal"}{" "}
        {signal.signal?.tipoTecnologia &&
          `(${signal.signal.tipoTecnologia.toUpperCase()})`}
      </h2>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onClick={handleClickElements}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>

      <h2>Detalle</h2>
    </div>
  );
};

export default ChannelDiagram;
