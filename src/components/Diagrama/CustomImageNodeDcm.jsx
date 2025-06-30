import React from "react";
import { Handle, Position } from "@xyflow/react";
import '@xyflow/react/dist/style.css';


const CustomImageNodeDcm = ({data}) => {
    return (
        <>
            <div style={{ textAlign: "center" }}>
                <img
                    src={data.image}
                    alt={data.label}
                    style={{
                        width: 100,
                        height: "fit-object",
                        objectFit: "contain",
                    }}
                    data-id={data._id}
                />
                <div style={{ fontSize: 16 }}>{data.label}</div>
                {/* Entrada */}
                <Handle
                    type="target"
                    id="target-router2"
                    position={Position.Top}
                    style={{ left: 40, background: "red" }}
                />
                {/* Salida */}
                <Handle
                    type="source"
                    id="source-router2"
                    position={Position.Top}
                    style={{ right: 100, background: "green" }}
                />
            </div>
        </>
    );
};

export default CustomImageNodeDcm;
