import React from 'react'
import { Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css';

const CustomImageNodeRouters = ({ data }) => {
  return (
    <>
      <div style={{ textAlign: "center" }}>
        <img
          src={data.image}
          alt={data.label}
          style={{ width: 100, height: 'fit-object', objectFit: 'contain' }}
          data-id={data._id}

        />
        <div style={{ fontSize: 16 }}>{data.label}</div>
        {/* Entrada */}
        <Handle type="target" id='target-router1' position={Position.Bottom} style={{ left:40,background: 'red' }} />
        {/* Salida */}
        <Handle type="source" id='source-router1' position={Position.Bottom} style={{ right: 100, background: 'green' }} />
        
      </div>
    </>
  )
}

export default CustomImageNodeRouters