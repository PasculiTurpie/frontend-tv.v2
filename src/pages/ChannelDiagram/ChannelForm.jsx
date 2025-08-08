import React, { useState } from "react";

function ChannelForm() {
  const [signal, setSignal] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Para inputs temporales de nodo y edge
  const [nodeInput, setNodeInput] = useState({ id: "", label: "", x: "", y: "" });
  const [edgeInput, setEdgeInput] = useState({ id: "", source: "", target: "", label: "" });

  // Agregar nodo al array nodes
  const addNode = () => {
    if (!nodeInput.id || !nodeInput.label || nodeInput.x === "" || nodeInput.y === "") {
      alert("Completa todos los campos del nodo");
      return;
    }
    setNodes((prev) => [
      ...prev,
      {
        id: nodeInput.id,
        type: "default",
        position: { x: Number(nodeInput.x), y: Number(nodeInput.y) },
        data: { label: nodeInput.label },
      },
    ]);
    setNodeInput({ id: "", label: "", x: "", y: "" });
  };

  // Agregar edge al array edges
  const addEdge = () => {
    if (!edgeInput.id || !edgeInput.source || !edgeInput.target) {
      alert("Completa todos los campos del enlace");
      return;
    }
    setEdges((prev) => [
      ...prev,
      {
        id: edgeInput.id,
        source: edgeInput.source,
        target: edgeInput.target,
        label: edgeInput.label,
        type: "default",
      },
    ]);
    setEdgeInput({ id: "", source: "", target: "", label: "" });
  };

  // Enviar el Channel al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signal) {
      alert("Ingresa el ID de la señal");
      return;
    }
    if (nodes.length === 0) {
      alert("Agrega al menos un nodo");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal, nodes, edges }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Error al crear Channel"));
        return;
      }

      const data = await response.json();
      alert("Channel creado con ID: " + data._id);

      // Limpiar formulario
      setSignal("");
      setNodes([]);
      setEdges([]);
    } catch (error) {
      alert("Error de conexión: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Crear nuevo Channel</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Signal ObjectId:</label>
          <input
            type="text"
            value={signal}
            onChange={(e) => setSignal(e.target.value)}
            placeholder="Ej: 64f2a0b56789abc123def456"
            style={{ width: "100%" }}
          />
        </div>

        <hr />
        <h3>Agregar Nodo</h3>
        <input
          type="text"
          placeholder="ID Nodo"
          value={nodeInput.id}
          onChange={(e) => setNodeInput({ ...nodeInput, id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Label"
          value={nodeInput.label}
          onChange={(e) => setNodeInput({ ...nodeInput, label: e.target.value })}
        />
        <input
          type="number"
          placeholder="Pos X"
          value={nodeInput.x}
          onChange={(e) => setNodeInput({ ...nodeInput, x: e.target.value })}
          style={{ width: 80 }}
        />
        <input
          type="number"
          placeholder="Pos Y"
          value={nodeInput.y}
          onChange={(e) => setNodeInput({ ...nodeInput, y: e.target.value })}
          style={{ width: 80 }}
        />
        <button type="button" onClick={addNode}>
          + Agregar Nodo
        </button>

        <ul>
          {nodes.map((n) => (
            <li key={n.id}>
              {n.id} - {n.data.label} ({n.position.x}, {n.position.y})
            </li>
          ))}
        </ul>

        <hr />
        <h3>Agregar Enlace (Edge)</h3>
        <input
          type="text"
          placeholder="ID Edge"
          value={edgeInput.id}
          onChange={(e) => setEdgeInput({ ...edgeInput, id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Source Node ID"
          value={edgeInput.source}
          onChange={(e) => setEdgeInput({ ...edgeInput, source: e.target.value })}
        />
        <input
          type="text"
          placeholder="Target Node ID"
          value={edgeInput.target}
          onChange={(e) => setEdgeInput({ ...edgeInput, target: e.target.value })}
        />
        <input
          type="text"
          placeholder="Label (opcional)"
          value={edgeInput.label}
          onChange={(e) => setEdgeInput({ ...edgeInput, label: e.target.value })}
        />
        <button type="button" onClick={addEdge}>
          + Agregar Enlace
        </button>

        <ul>
          {edges.map((e) => (
            <li key={e.id}>
              {e.id}: {e.source} → {e.target} {e.label ? `(${e.label})` : ""}
            </li>
          ))}
        </ul>

        <hr />
        <button type="submit">Crear Channel</button>
      </form>
    </div>
  );
}

export default ChannelForm;
