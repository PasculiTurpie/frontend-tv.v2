import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

function ChannelEditor({ channelId }) {
  const [signal, setSignal] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newEdgeLabel, setNewEdgeLabel] = useState("");

  // Cargar channel del backend
  useEffect(() => {
    fetch(`http://localhost:3000/api/v2/channels/${channelId}`)
      .then((res) => res.json())
      .then((data) => {
        setSignal(data.signal._id || data.signal);
        // React Flow nodos y edges deben tener id únicos
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      })
      .catch(console.error);
  }, [channelId, setNodes, setEdges]);

  // Crear un nuevo edge con label
  const onConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      const id = `edge-${Date.now()}`;
      const newEdge = {
        id,
        source: connection.source,
        target: connection.target,
        type: "default",
        label: newEdgeLabel,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setNewEdgeLabel("");
    },
    [newEdgeLabel, setEdges]
  );

  // Guardar cambios al backend
  const saveChanges = async () => {
    try {
      const response = await fetch(`http://localhost:4000/channels/${channelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal, nodes, edges }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error al guardar: " + (errorData.error || "Error desconocido"));
        return;
      }

      alert("Cambios guardados con éxito");
    } catch (error) {
      alert("Error de conexión: " + error.message);
    }
  };

  return (
    <div style={{ height: 700 }}>
      <h3>Editar Channel: {channelId}</h3>
      <div>
        <label>Signal ObjectId:</label>
        <input
          type="text"
          value={signal}
          onChange={(e) => setSignal(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Etiqueta para nuevo enlace:</label>
        <input
          type="text"
          value={newEdgeLabel}
          onChange={(e) => setNewEdgeLabel(e.target.value)}
          placeholder="Etiqueta para enlace nuevo"
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ width: 600, height: 600, border: "1px solid #ccc", marginTop: 10 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          connectionLineType="smoothstep"
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <button onClick={saveChanges} style={{ marginTop: 10 }}>
        Guardar Cambios
      </button>
    </div>
  );
}

export default ChannelEditor;
