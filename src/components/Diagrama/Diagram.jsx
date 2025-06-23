import { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import "reactflow/dist/style.css";
import  dataFlow  from '../../utils/contants';

console.log(dataFlow)





const Diagram = () => {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [variant, setVariant] = useState('dots')


  useEffect(() => {
    setNodes(dataFlow.nodes)
    setEdges(dataFlow.edges)
    
  }, [])

  console.log(nodes)
  console.log(edges)
  


  return (
    <>
      <div className='container__diagram' >
        <div style={{ width: '100vw', height: '50vh' }}>
        <ReactFlow
            nodes={nodes} edges={edges} fitView
            
        >
            <Background variant={variant} color='grey' gap='20'/>
          <Controls />
      </ReactFlow>

        </div>
      </div>
    </>
  )
}

export default Diagram