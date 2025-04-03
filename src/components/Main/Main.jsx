import React, { useState } from "react";


const Main = () => {


    const [signal, setSignal] = useState({
        name: "",
        type: "",
        frequency: "",
        nodes: [],
        edges: [],
    });

    const [node, setNode] = useState({
        _id: "",
        type: "",
        label: "",
        position: { x: 0, y: 0 },
        data: {},
    });

    const [edge, setEdge] = useState({
        _id: "",
        source: "",
        target: "",
        label: "",
        sourceHandle: "out-1",
        targetHandle: "in-1",
    });

    // Agregar nodo
    const addNode = () => {
        setSignal({ ...signal, nodes: [...signal.nodes, node] });
        setNode({ _id: "", type: "", label: "", position: { x: 0, y: 0 }, data: {} });
    };

    // Agregar conexión (edge)
    const addEdge = () => {
        setSignal({ ...signal, edges: [...signal.edges, edge] });
        setEdge({ _id: "", source: "", target: "", label: "" });
    };

    // Enviar datos al backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:3000/signals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signal),
        });

        if (response.ok) {
            alert("Señal guardada correctamente");
        } else {
            alert("Error al guardar la señal");
        }
    };


    return (
        <>
            <form onSubmit={handleSubmit}>
                <h2>Registrar Nueva Señal</h2>

                {/* Datos de la señal */}
                <input
                    type="text"
                    placeholder="Nombre de la señal"
                    value={signal.name}
                    onChange={(e) => setSignal({ ...signal, name: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Tipo de señal"
                    value={signal.type}
                    onChange={(e) => setSignal({ ...signal, type: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Frecuencia"
                    value={signal.frequency}
                    onChange={(e) => setSignal({ ...signal, frequency: e.target.value })}
                />

                <h3>Agregar Nodos</h3>
                <input
                    type="text"
                    placeholder="ID Nodo"
                    value={node._id}
                    onChange={(e) => setNode({ ...node, _id: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Tipo"
                    value={node.type}
                    onChange={(e) => setNode({ ...node, type: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Etiqueta"
                    value={node.label}
                    onChange={(e) => setNode({ ...node, label: e.target.value })}
                />
                <button type="button" onClick={addNode}>Agregar Nodo</button>

                <h3>Relacionar Nodos (Edges)</h3>
                <input
                    type="text"
                    placeholder="ID Conexión"
                    value={edge._id}
                    onChange={(e) => setEdge({ ...edge, _id: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Fuente (ID Nodo)"
                    value={edge.source}
                    onChange={(e) => setEdge({ ...edge, source: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Destino (ID Nodo)"
                    value={edge.target}
                    onChange={(e) => setEdge({ ...edge, target: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Etiqueta"
                    value={edge.label}
                    onChange={(e) => setEdge({ ...edge, label: e.target.value })}
                />
                <button type="button" onClick={addEdge}>Agregar Conexión</button>

                <button type="submit">Guardar Señal</button>
            </form>
        </>
    );
};

export default Main;
