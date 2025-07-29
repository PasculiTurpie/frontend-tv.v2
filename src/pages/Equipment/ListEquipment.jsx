import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ipGestionRegex } from "../../utils/regexValidate";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import ModalSwitch from '../Switch/ModalSwitch';
import Loader from '../../components/Loader/Loader';
import ModalEquipment from './ModalEquipment';


const ListEquipment = () => {

  const [equipos, setEquipos] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [modalOpen, setModalOpen] = useState(false);
  const [itemId, setItemId] = useState("");
  
  const getAllEquipos = () => {
    api.getEquipo()
      .then((res) => {
        console.log(res.data);
        setEquipos(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        console.log(`Error: ${error.message}`);
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
    getAllEquipos();
  };
  console.log(equipos) 
  const deleteEquipment = async (id) => {
    console.log(id);
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
        await api.deleteEquipo(id);
        console.log(id);
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
    console.log(id);
    setItemId(id);
    setModalOpen(true);
  };
  console.log(modalOpen)
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
                                <Link to="/equipment">Formulario</Link>
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
          {equipos.length}
        </p>
        {isLoading ? (
          <div className="loader__spinner">
            <Loader />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Marca</th>
                  <th>Modelo</th>
                  <th>Tipo</th>
                  <th>Ip Gestión</th>
                <th className="action">Acciones</th>
              </tr>
            </thead>
            <tbody>
                {equipos.map((equipo) => (
                  
                <tr key={equipo._id} id={equipo._id}>
                  <td>{equipo.nombre}</td>
                  <td>{equipo.marca}</td>
                  <td>{equipo.modelo}</td>
                    <td>{equipo.tipoNombre?.tipoNombre}</td>
                  <td>{equipo.ip_gestion}</td>
                  <td className="button-action">
                    <button
                      className="button btn-primary"
                      onClick={() => {
                        showModal(equipo._id);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="button btn-danger"
                      onClick={() =>
                        deleteEquipment(equipo._id)
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
        <ModalEquipment
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          handleCancel={handleCancel}
          handleOk={handleOk}
          showModal={showModal}
          refreshList={refreshList}
          itemId={itemId}
          title="Actualizar Equipo"
        />
      )}
      </>
  )
}

export default ListEquipment