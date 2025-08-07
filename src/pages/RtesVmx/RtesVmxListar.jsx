import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import api from "../../utils/api";
import RtesVmxModal from "./RtesVmxModal";

const RtesVmxListar = () => {
    const [rtesVmxs, setRtesVmxs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [itemId, setItemId] = useState("");

    const getAllrtesVmxs = () => {
        api.getRtesVmx()
            .then((res) => {
                 
                setRtesVmxs(res.data);
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
        getAllrtesVmxs();
    };

    const deleteEquipmentRtesVmx= async (id) => {
         
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
                await api.deleteRtesVmx(id);
                 
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
                            <Link to="/rtesVmx">Formulario</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                            Listar
                        </li>
                    </ol>
                </nav>
                {isLoading ? (
                    <div className="loader__spinner">
                        <Loader />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Multicast In</th>
                                <th>Multicast Out</th>
                                <th className="action">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rtesVmxs.map((rtesVmx) => (
                                <tr key={rtesVmx._id} id={rtesVmx._id}>
                                    <td>{rtesVmx.nombreRtesVmx}</td>
                                    <td>{rtesVmx.mcastOut}</td>
                                    <td>{rtesVmx.mcastOut}</td>
                                    
                                    <td className="button-action">
                                        <button
                                            className="button btn-primary"
                                            onClick={() => {
                        showModal(rtesVmx._id);
                      }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="button btn-danger"
                                            onClick={()=>deleteEquipmentRtesVmx(rtesVmx._id)}
                                            
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
                <RtesVmxModal
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    handleCancel={handleCancel}
                    handleOk={handleOk}
                    showModal={showModal}
                    refreshList={refreshList}
                    itemId={itemId}
                    title="Actualizar RTES VMX"
                />
            )}
        </>
    );
};

export default RtesVmxListar;
