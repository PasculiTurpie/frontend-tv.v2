import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from "reactflow";
import Select from "react-select";
import "reactflow/dist/style.css";
import Swal from "sweetalert2";
import axios from "axios";
import api from "../../utils/api";
// Si api es tu helper de peticiones, descomenta esto:
// import api from "../../utils/api";

function ChannelEditor() {
  const [channels, setChannels] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newEdgeLabel, setNewEdgeLabel] = useState("");
  const [selectedElements, setSelectedElements] = useState(null);
  const [loading, setLoading] = useState(false);

  const dataSignals = () => {
    api.getSignal()
      .then((res) => {
      console.log(res.data)
    })
  }

  // Cargar señales
  const loadSignals = async () => {
    try {
      // Si usas api.getSignal():
      // const res = await api.getSignal();

      // Con axios directamente:
      const res = await api.getSignal()

      const options = res.data.map((s) => ({
        value: s._id,
        label: s.nameChannel || "Sin nombre",
      }));

      setChannels(options);
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar las señales", "error");
    }
  };

  // Cargar canal por señal
  const loadChannelBySignal = async (signalId) => {
    if (!signalId) {
      setChannelData(null);
      setNodes([]);
      setEdges([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v2/channels?signal=${signalId}`
      );
      const channelsFound = res.data;
      if (channelsFound.length > 0) {
        const ch = channelsFound[0];
        setChannelData(ch);
        setNodes(ch.nodes || []);
        setEdges(ch.edges || []);
      } else {
        setChannelData(null);
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      Swal.fire("Error", "Error al cargar el canal", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
    dataSignals();
  }, []);

  useEffect(() => {
    loadChannelBySignal(selectedSignal?.value);
  }, [selectedSignal]);

  // Crear nuevo edge con etiqueta
  const onConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      const id = `edge-${Date.now()}`;
      const newEdge = {
        id,
        source: connection.source,
        target: connection.target,
        type: "smoothstep",
        label: newEdgeLabel,
        animated: true,
        style:{stroke:'red'}
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setNewEdgeLabel("");
    },
    [newEdgeLabel, setEdges]
  );

  // Agregar nodo
  const addNode = () => {
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      type: "image",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Nodo ${id}` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Eliminar selección
  const deleteSelected = () => {
    if (!selectedElements || selectedElements.length === 0) {
      Swal.fire("Info", "Selecciona nodos o enlaces para eliminar", "info");
      return;
    }

    const selectedNodeIds = selectedElements
      .filter((el) => el.source === undefined)
      .map((node) => node.id);

    const selectedEdgeIds = selectedElements
      .filter((el) => el.source !== undefined)
      .map((edge) => edge.id);

    setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
    setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.includes(edge.id)));
    setSelectedElements(null);
  };

  // Guardar cambios
  const saveChanges = async () => {
    if (!selectedSignal) {
      Swal.fire("Error", "Debes seleccionar una señal primero", "error");
      return;
    }

    if (nodes.length === 0) {
      Swal.fire("Error", "Debe haber al menos un nodo", "error");
      return;
    }

    const payload = {
      signal: selectedSignal.value,
      nodes,
      edges,
    };

    try {
      let response;
      if (channelData?._id) {
        response = await axios.put(
          `http://localhost:3000/api/v2/channels/${channelData._id}`,
          payload
        );
      } else {
        response = await axios.post(
          `http://localhost:3000/api/v2/channels`,
          payload
        );
      }

      Swal.fire("Éxito", "Cambios guardados correctamente", "success");
      setChannelData(response.data);
    } catch (error) {
      Swal.fire(
        "Error",
        "Error al guardar: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  return (
    <div className="outlet-main">
      <h2>Editor de Channel</h2>

      <label style={{ fontWeight: "bold" }}>Selecciona una señal</label>
      <Select
        options={channels}
        value={selectedSignal}
        onChange={setSelectedSignal}
        placeholder="Selecciona una señal..."
        isClearable
      />

      {loading && <p>Cargando canal...</p>}

      {!loading && selectedSignal && (
        <>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontWeight: "bold" }}>
              Etiqueta para nuevo enlace:
            </label>
            <input
              type="text"
              value={newEdgeLabel}
              onChange={(e) => setNewEdgeLabel(e.target.value)}
              placeholder="Etiqueta para enlace nuevo"
              style={{ width: "100%", padding: 8, fontSize: "1rem" }}
            />
          </div>

          <div
            style={{
              width: "80%",
              height: 600,
              marginTop: 10,
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              connectionLineType="smoothstep"
              snapToGrid
              snapGrid={[15, 15]}
              onSelectionChange={setSelectedElements}
              multiSelectionKeyCode={null}
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
            <button
              onClick={addNode}
              style={{
                padding: "10px 16px",
                fontSize: "1rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              + Agregar Nodo
            </button>

            <button
              onClick={deleteSelected}
              style={{
                padding: "10px 16px",
                fontSize: "1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              🗑 Eliminar Seleccionados
            </button>

            <button
              onClick={saveChanges}
              style={{
                padding: "10px 16px",
                fontSize: "1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              Guardar Cambios
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChannelEditor;
