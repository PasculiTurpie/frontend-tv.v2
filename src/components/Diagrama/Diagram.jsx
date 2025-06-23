import { useState } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import "reactflow/dist/style.css";


const nodes = [
  {
    id: '1', // required
    position: { x: 400, y: 200 }, // required
    data: { label: 'Nodo 1' }, // required
  },
  {
    id: '2', // required
    position: { x: 400, y: 400 }, // required
    data: { label: 'Nodo 2' }, // required
  },
];

const edges = [
  {
    id: 'e3-4',
    source: '1',
    target: '2',
    data: {
      startLabel: 'start edge label',
      endLabel: 'end edge label',
    },
    type: 'start-end',
  },
];

const Diagram = () => {
  const [variant, setVariant] = useState('dots')
  return (
    <>
      <div className='container__diagram' >
        <div style={{ width: '100vw', height: '50vh' }}>
        <ReactFlow
            nodes={nodes} edges={edges} fitView
            
        >
            <Background variant={variant} color='grey' />
          <Controls />
      </ReactFlow>

        </div>
      </div>
    </>
  )
}

export default Diagram