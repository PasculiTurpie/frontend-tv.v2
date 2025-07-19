import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import ModalChannel from "./ModalChannel";
import Loader from "../../components/Loader/Loader";
import Swal from "sweetalert2";

const ChannelList = () => {
    const [channels, setChannels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [itemId, setItemId] = useState("");

    const getAllChannel = () => {
        api.getSignal()
            .then((res) => {
                console.log(res.data);
                setChannels(res.data);
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
        getAllChannel();
    };

    const deleteChannel = async (id) => {
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
                await api.deleteSignal(id);
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
    console.log(modalOpen);
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
                            <Link to="/channel">Formulario</Link>
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
                    {channels.length}
                </p>
                {isLoading ? (
                    <div className="loader__spinner">
                        <Loader />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre canal</th>
                                <th>Número canal Norte</th>
                                <th>Número canal Sur</th>
                                <th>Tipo de tecnología</th>
                                <th className="action">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {channels.map((channel) => (
                                <tr key={channel._id} id={channel._id}>
                                    <td>{channel.nameChannel}</td>
                                    <td>{channel.numberChannelCn}</td>
                                    <td>{channel.numberChannelSur}</td>
                                    <td>{channel.tipoTecnologia}</td>
                                    <td className="button-action">
                                        <button
                                            className="button btn-primary"
                                            onClick={() => {
                                                showModal(channel._id);
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="button btn-danger"
                                            onClick={() =>
                                                deleteChannel(
                                                    channel._id
                                                )
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
                <ModalChannel
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    handleCancel={handleCancel}
                    handleOk={handleOk}
                    showModal={showModal}
                    refreshList={refreshList}
                    itemId={itemId}
                    title="Actualizar channel"
                />
            )}
        </>
    );
};

export default ChannelList;
