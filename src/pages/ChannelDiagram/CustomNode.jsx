import React from "react";
import { Handle, Position } from "reactflow";

const handleDot = { background: "transparent" }; // sin punto visible
const pct = (v) => ({ top: `${v}%` });

const CustomNode = ({ data }) => {
  return (
    <div
      title={data?.tooltip || data?.description || data?.label}
      style={{
        padding: 10,
        border: "1px solid #444",
        borderRadius: 10,
        background: "#fff",
        width: 160,
        position: "relative",
      }}
    >
      <div style={{ fontWeight: "bold", textAlign: "center" }}>
        {data?.label}
      </div>

      {/* ====== ENTRADAS (targets) ====== */}
      {/* in-left (30%): para ENLACE DE IDA */}
      <Handle
        type="target"
        position={Position.Left}
        id="in-left"
        style={{ left: 0, ...pct(30), ...handleDot }}
      />
      {/* in-right (70%): para ENLACE DE VUELTA */}
      <Handle
        type="target"
        position={Position.Right}
        id="in-right"
        style={{ right: 0, ...pct(70), ...handleDot }}
      />

      {/* ====== SALIDAS (sources) ====== */}
      {/* out-left (70%): para ENLACE DE VUELTA */}
      <Handle
        type="source"
        position={Position.Left}
        id="out-left"
        style={{ left: 0, ...pct(70), ...handleDot }}
      />
      {/* out-right (30%): para ENLACE DE IDA */}
      <Handle
        type="source"
        position={Position.Right}
        id="out-right"
        style={{ right: 0, ...pct(30), ...handleDot }}
      />
    </div>
  );
};

export default CustomNode;
