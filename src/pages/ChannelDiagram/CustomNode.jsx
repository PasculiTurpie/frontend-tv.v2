// src/pages/ChannelDiagram/CustomNode.jsx
import React from "react";
import { Handle, Position } from "reactflow";

const box = {
  padding: 10,
  border: "1px solid #444",
  borderRadius: 10,
  background: "#fff",
  width: 170,
  position: "relative",
  textAlign: "center",
};

const dot = { background: "transparent" };

// helpers para posiciones
const pctTop = (p) => ({ top: `${p}%` });
const pctLeft = (p) => ({ left: `${p}%` });

/**
 * 10 puntos (slots) totales:
 * - LEFT:   2 (top 30%, 70%)
 * - RIGHT:  2 (top 30%, 70%)
 * - TOP:    3 (left 20%, 50%, 80%)
 * - BOTTOM: 3 (left 20%, 50%, 80%)
 * Para cada punto se ponen dos handles: target (in-*) y source (out-*)
 */
export default function CustomNode({ data }) {
  const leftSlots = [30, 70];
  const rightSlots = [30, 70];
  const topSlots = [20, 50, 80];
  const bottomSlots = [20, 50, 80];

  return (
    <div title={data?.tooltip || data?.description || data?.label} style={box}>
      <div style={{ fontWeight: "bold" }}>{data?.label}</div>

      {/* TOP */}
      {topSlots.map((p, i) => (
        <React.Fragment key={`top-${i}`}>
          <Handle id={`in-top-${i + 1}`} type="target" position={Position.Top} style={{ ...dot, ...pctLeft(p) }} />
          <Handle id={`out-top-${i + 1}`} type="source" position={Position.Top} style={{ ...dot, ...pctLeft(p) }} />
        </React.Fragment>
      ))}

      {/* BOTTOM */}
      {bottomSlots.map((p, i) => (
        <React.Fragment key={`bottom-${i}`}>
          <Handle id={`in-bottom-${i + 1}`} type="target" position={Position.Bottom} style={{ ...dot, ...pctLeft(p) }} />
          <Handle id={`out-bottom-${i + 1}`} type="source" position={Position.Bottom} style={{ ...dot, ...pctLeft(p) }} />
        </React.Fragment>
      ))}

      {/* LEFT */}
      {leftSlots.map((p, i) => (
        <React.Fragment key={`left-${i}`}>
          <Handle id={`in-left-${i + 1}`} type="target" position={Position.Left} style={{ ...dot, ...pctTop(p) }} />
          <Handle id={`out-left-${i + 1}`} type="source" position={Position.Left} style={{ ...dot, ...pctTop(p) }} />
        </React.Fragment>
      ))}

      {/* RIGHT */}
      {rightSlots.map((p, i) => (
        <React.Fragment key={`right-${i}`}>
          <Handle id={`in-right-${i + 1}`} type="target" position={Position.Right} style={{ ...dot, ...pctTop(p) }} />
          <Handle id={`out-right-${i + 1}`} type="source" position={Position.Right} style={{ ...dot, ...pctTop(p) }} />
        </React.Fragment>
      ))}
    </div>
  );
}
