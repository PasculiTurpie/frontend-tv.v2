import { useEffect, useState } from 'react';
import { ReactFlow, Controls, Background, Handle, Position, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';



const CustomNode = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #444', borderRadius: 10, background: '#fff', width:130 }}>
      <div style={{ fontWeight: 'bold' }}>{data.label}</div>

      {/* Un solo punto de entrada (target) */}
      <Handle
        type="target"
        position={Position.Top}
        id="in-1"
        style={{ left: 40, background: 'transparent' }}
      />

      {/* Punto de salida si lo necesitas */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="in-2"
        style={{ left: 100, background: 'transparent' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out-1"
        style={{ left: 40, background: 'transparent' }}
      />

      {/* Punto de salida si lo necesitas */}
      <Handle
        type="source"
        position={Position.Top}
        id="out-2"
        style={{ left: 100, background: 'transparent' }}
      />
      
    </div>
  );
};


const dataFlow = {
  nameChannel: "DREAMWORKS",
  numberChannelSur: "3",
  numberChannelCn: "3",
  logoChannel: "https://i.ibb.co/KX2gxHz/Dreamworks.jpg",
  severidadChannel: "4",
  tipoTecnologia: "Cobre",
  contacto: [
    {
      nombreContact: "Jorge Sepúlveda",
      email: "jsepulveda@gmail.com",
      telefono: "+56 9 88776655",
    },
  ],
  nodes: [
    {
      id: '1',
      data: { label: 'Satelite' },
      position: { x: 150, y: 0 },
      type: 'custom',
    },
    {
      id: '2',
      data: { label: 'Router ASR' },
      position: { x: 150, y: 150 },
      type: 'custom',
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: '1',
      sourceHandle:'out-1',
      target: '2',
      targetHandle: 'in-1',
      type: 'step',
      label: 'Entrada A',
      labelPosition: 'start',
      style: { stroke: 'red' },
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,        // Opcional: ancho de la flecha
        height: 20,       // Opcional: alto de la flecha
        color: 'red'
      },
    },
    {
      id: 'edge-2',
      source: '2',
      sourceHandle: 'out-2',
      target: '1',
      targetHandle: 'in-2',
      type: 'step',
      label: 'Entrada B',
      labelPosition: 'end',
      style: { stroke: 'green' },
      labelStyle: { fill: 'green', fontWeight: 700 },
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,        // Opcional: ancho de la flecha
        height: 20,       // Opcional: alto de la flecha
        color: 'green'
      },
    },
  ],
};
console.log(dataFlow)


const nodeTypes = {
  
  custom: CustomNode,
};


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
        <div style={{ width: '85vw', height: '50vh' }}>
        <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView
            
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