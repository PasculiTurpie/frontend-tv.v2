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
                    id="source-router1"
                    position={Position.Top}
                    style={{ left: 20, background: "blue" }}
                />
                {/* Salida */}
                <Handle
                    type="source"
                    id="target-dcm1"
                    position={Position.Top}
                    style={{ left: 80, background: "orange" }}
                />
            </div>
        </>
    );
};

export default CustomImageNodeDcm;
