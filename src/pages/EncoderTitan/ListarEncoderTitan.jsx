import React from 'react'
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import api from "../../utils/api.js";
import Swal from "sweetalert2";
import ModalTitan from "./ModalTitan.jsx";

const ListarEncoderTitan = () => {

  const [titans, setTitans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemId, setItemId] = useState("");

  const getAllTitans = () => {
          api.getTitan()
              .then((res) => {
                   
                setTitans(res.data);
                  setIsLoading(false);
              })
              .catch((error) => {
                   
                   
                  Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: `${error.message}`,
                      footer: '<a href="#">Contactar a administrador</a>',
                  });
                  setIsLoading(false); // también en caso de error
              });
  };
  useEffect(() => {
          refreshList();
      }, []);
  
      const refreshList = () => {
        getAllTitans();
  };
  
  const deleteEquipmentTitan = async (id) => {
     
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar el registro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.deleteTitan(id);
         
        refreshList(); // Refresca la lista después de confirmar
        await Swal.fire({
          title: "¡Eliminado!",
          text: "El registro ha sido eliminado",
          icon: "success",
        });
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al eliminar el registro",
          icon: "error",
        });
      }
    }
  };
  const showModal = (id) => {
     
    setItemId(id);
    setModalOpen(true);
  };
   
  const handleOk = () => {
    setModalOpen(false);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Registro actualizado",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleCancel = () => {
    setModalOpen(false);
  };


  return (
    <>
      <div className="outlet-main">
        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link to="/titan">Formulario</Link>
                                </li>
                                <li
                                    className="breadcrumb-item active"
                                    aria-current="page"
                                >
                                    Listar
                                </li>
                            </ol>
        </nav>

      <p className="">
        <span className="total-list">Total items: </span>
        {titans.length}
      </p>
      {isLoading ? (
        <div className="loader__spinner">
          <Loader />
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Titan</th>
              <th>Multicast salida</th>
              <th>Ip de gestión</th>
              <th className="action">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {titans.map((titan) => (
              <tr key={titan._id} id={titan._id}>
                <td>{titan.nombreTitan}</td>
                <td>{titan.mcastOut}</td>
                <td>
                  <Link
                    to={`http://${titan.ipGestion}`}
                    target="_blank"
                  >
                    {titan.ipGestion}
                  </Link>
                </td>
                <td className="button-action">
                  <button
                    className="button btn-primary"
                    onClick={() => {
                      showModal(titan._id);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="button btn-danger"
                    onClick={() =>
                      deleteEquipmentTitan(titan._id)
                    }
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      {modalOpen && (
        <ModalTitan
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          handleCancel={handleCancel}
          handleOk={handleOk}
          showModal={showModal}
          refreshList={refreshList}
          itemId={itemId}
          title="Actualizar Titan"
        />
      )}
    </>
  )
}

export default ListarEncoderTitan