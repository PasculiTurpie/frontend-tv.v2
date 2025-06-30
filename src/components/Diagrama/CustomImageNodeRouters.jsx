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
   
        <Handle type="source" id='source-dcm1' position={Position.Bottom} style={{left:20, background: 'blue'}} />
        <Handle type="target" id='target-router1' position={Position.Bottom} style={{ left:80, background: 'orange' }} />    
       {/*  <Handle type="target" id='target-router1' position={Position.Bottom} style={{left:20, background: 'red' }} />
        <Handle type="source" id='source-router1' position={Position.Top} style={{ left:0, background: 'red' }} /> */}
        
      </div>
    </>
  )
}

export default CustomImageNodeRouters