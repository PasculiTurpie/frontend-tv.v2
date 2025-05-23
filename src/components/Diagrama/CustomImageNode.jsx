import { Handle, Position } from "reactflow";

export default function CustomImageNode({ data }) {
  return (
    <div
      className="shadow-md border rounded-xl p-3 bg-white w-64"
      style={{
        borderColor: data.status === "activo" ? "#28a745" : "#dc3545",
        borderWidth: 2,
      }}
    >
      <div className="flex items-center mb-2">
        <img src={data.image} alt={data.label} className="w-12 h-12 mr-2" />
        <div>
          <h3 className="font-bold text-lg">{data.label}</h3>
          <p className={`text-sm ${data.status === "activo" ? "text-green-600" : "text-red-600"}`}>
            {data.status === "activo" ? "Activo" : "Inactivo"}
          </p>
        </div>
      </div>

      {data.description && (
        <p className="text-sm mb-2 text-gray-600">{data.description}</p>
      )}

      {data.ports?.length > 0 && (
        <div className="text-sm mb-2">
          <strong>Puertos:</strong>
          <ul className="ml-4 list-disc">
            {data.ports.map((port) => (
              <li key={port.id}>
                {port.direction === "input" ? "🔌" : "📤"} {port.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.metadata && (
        <div className="text-xs text-gray-500 mt-2">
          <p><strong>Fabricante:</strong> {data.metadata.fabricante}</p>
          <p><strong>Modelo:</strong> {data.metadata.modelo}</p>
          <p><strong>Ubicación:</strong> {data.metadata.ubicacion}</p>
        </div>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
