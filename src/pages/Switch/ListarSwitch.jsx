import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import ModalSwitch from "./ModalSwitch";

const ListarSwitch = () => {
  const [switches, setSwitches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
  const [itemId, setItemId] = useState("");
  
  const getAllSwitches = () => {
    api.getSwitch()
      .then((res) => {
         
        setSwitches(res.data);
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
    getAllSwitches();
  };

  const deleteEquipmentSwitch = async (id) => {
     
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
        await api.deleteSwitch(id);
         
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
                                        <Link to="/switch">Formulario</Link>
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
          {switches.length}
        </p>
        {isLoading ? (
          <div className="loader__spinner">
            <Loader />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Switch</th>
                <th>Interfaz</th>
                <th>Vlan</th>
                <th className="action">Acciones</th>
              </tr>
            </thead>
            <tbody>
                {switches.map((conmutador) => (
                <tr key={conmutador._id} id={conmutador._id}>
                    <td>{conmutador.nameSwitch}</td>
                    <td>{conmutador.interfacePort}</td>
                    <td>{conmutador.vlanInterface}</td>
                  <td className="button-action">
                    <button
                      className="button btn-primary"
                      onClick={() => {
                        showModal(conmutador._id);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="button btn-danger"
                      onClick={() =>
                        deleteEquipmentSwitch(conmutador._id)
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
        <ModalSwitch
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          handleCancel={handleCancel}
          handleOk={handleOk}
          showModal={showModal}
          refreshList={refreshList}
          itemId={itemId}
          title="Actualizar Switch"
        />
      )}
    </>
  )
}

export default ListarSwitch