import { BaseEdge, getBezierPath } from 'reactflow';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <text x={sourceX - 10} y={sourceY - 10} textAnchor="middle" fontSize={12} fill="black">
        {data?.startLabel}
      </text>
      <text x={labelX} y={labelY - 10} textAnchor="middle" fontSize={12} fill="black">
        {data?.centerLabel}
      </text>
      <text x={targetX + 10} y={targetY + 10} textAnchor="middle" fontSize={12} fill="black">
        {data?.endLabel}
      </text>
    </>
  );
};

export default CustomEdge;