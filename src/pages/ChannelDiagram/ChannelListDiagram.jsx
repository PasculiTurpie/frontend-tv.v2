import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const PAGE_SIZE = 5;

const ChannelListDiagram = () => {
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const fetchChannels = () => {
    axios
      .get("http://localhost:3000/api/v2/channels")
      .then((res) => {
        setChannels(res.data);
        setFilteredChannels(res.data);
        setCurrentPage(1);
      })
      .catch(() => Swal.fire("Error", "No se pudieron cargar los canales", "error"));
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Filtrar canales por nombre de señal
  useEffect(() => {
    if (!filterText.trim()) {
      setFilteredChannels(channels);
      setCurrentPage(1);
      return;
    }
    const lower = filterText.toLowerCase();
    const filtered = channels.filter((ch) =>
      ch.signal?.nameChannel?.toLowerCase().includes(lower)
    );
    setFilteredChannels(filtered);
    setCurrentPage(1);
  }, [filterText, channels]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3000/api/v2/channels/${id}`)
          .then(() => {
            Swal.fire("Eliminado!", "El canal fue eliminado.", "success");
            fetchChannels();
          })
          .catch(() => Swal.fire("Error", "No se pudo eliminar el canal", "error"));
      }
    });
  };

  // Paginación
  const totalPages = Math.ceil(filteredChannels.length / PAGE_SIZE);
  const pagedChannels = filteredChannels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="outlet-main" style={{ maxWidth: 900, margin: "auto" }}>
      <h2>Lista de Channels</h2>
      <button
        className="button btn-primary"
        onClick={() => navigate("/channels/new")}
        style={{ marginBottom: "1rem" }}
      >
        + Crear nuevo Channel
      </button>

      <input
        type="text"
        placeholder="Filtrar por nombre de canal..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "1rem",
          fontSize: "1rem",
          boxSizing: "border-box",
        }}
      />

      <table
        className="table"
        style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #444" }}>
            <th>Nombre Canal</th>
            <th>Nodos</th>
            <th>Enlaces</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pagedChannels.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                No hay canales disponibles
              </td>
            </tr>
          ) : (
            pagedChannels.map((channel) => (
              <tr key={channel._id} style={{ borderBottom: "1px solid #ccc" }}>
                
                <td>{channel.signal?.nameChannel || "Sin nombre"}</td>
                <td>{channel.nodes?.length || 0}</td>
                <td>{channel.edges?.length || 0}</td>
                <td>
                  <button
                    className="button btn-warning"
                    onClick={() => navigate(`/channels/${channel._id}`)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Editar
                  </button>
                  <button
                    className="button btn-danger"
                    onClick={() => handleDelete(channel._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="button btn-primary"
          >
            &lt; Anterior
          </button>
          <span style={{ alignSelf: "center" }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="button btn-primary"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
    </div>
  );
}



export default ChannelListDiagram