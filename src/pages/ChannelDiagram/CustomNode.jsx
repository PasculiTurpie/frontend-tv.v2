import React from "react";
import { Handle, Position } from "reactflow";

const imagenes = {
  antena: "/img/antena.png",
  ird: "/img/ird.png",
  encoder: "/img/encoder.png",
  switch: "/img/switch.png",
};

export default function CustomNode({ data }) {
  const imgSrc = imagenes[data.tipoEquipo] || "/img/default.png";

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <img
        src={imgSrc}
        alt={data.tipoEquipo || "equipo"}
        style={{ width: 40, height: 40 }}
      />
      <div>{data.label}</div>

      {/* Handles para conexiones */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#555" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#555" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{ background: "#555" }}
      />
    </div>
  );
}
