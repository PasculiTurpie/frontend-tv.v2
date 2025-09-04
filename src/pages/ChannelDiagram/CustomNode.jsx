import React from "react";
import { Handle, Position } from "reactflow";

const dot = { background: "transparent" };
const pctTop = (p) => ({ top: `${p}%` });

const CustomNode = ({ data }) => {
  return (
    <div
      title={data?.tooltip || data?.description || data?.label}
      style={{
        padding: 10,
        border: "1px solid #444",
        borderRadius: 10,
        background: "#fff",
        width: 170,
        position: "relative",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: "bold" }}>{data?.label}</div>

      {/* ====== TOP (2) ====== */}
      <Handle id="in-top-1" type="target" position={Position.Top} style={{ ...dot, left: "35%" }} />
      <Handle id="in-top-2" type="target" position={Position.Top} style={{ ...dot, left: "65%" }} />
      <Handle id="out-top-1" type="source" position={Position.Top} style={{ ...dot, left: "35%" }} />
      <Handle id="out-top-2" type="source" position={Position.Top} style={{ ...dot, left: "65%" }} />

      {/* ====== BOTTOM (2) ====== */}
      <Handle id="in-bottom-1" type="target" position={Position.Bottom} style={{ ...dot, left: "35%" }} />
      <Handle id="in-bottom-2" type="target" position={Position.Bottom} style={{ ...dot, left: "65%" }} />
      <Handle id="out-bottom-1" type="source" position={Position.Bottom} style={{ ...dot, left: "35%" }} />
      <Handle id="out-bottom-2" type="source" position={Position.Bottom} style={{ ...dot, left: "65%" }} />

      {/* ====== LEFT/RIGHT (por compatibilidad con casos no verticales) ====== */}
      <Handle id="in-left" type="target" position={Position.Left} style={{ ...dot, ...pctTop(50) }} />
      <Handle id="in-right" type="target" position={Position.Right} style={{ ...dot, ...pctTop(50) }} />
      <Handle id="out-left" type="source" position={Position.Left} style={{ ...dot, ...pctTop(50) }} />
      <Handle id="out-right" type="source" position={Position.Right} style={{ ...dot, ...pctTop(50) }} />
    </div>
  );
};

export default CustomNode;
